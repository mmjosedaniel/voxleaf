"""Private-stdin command parsing and content-free output tests."""

from __future__ import annotations

import ctypes
import json
import os
import subprocess
import sys
import threading
import time
from ctypes import wintypes
from pathlib import Path
from typing import Any, cast
from unittest.mock import Mock

import pytest

from benchmarks import cli
from benchmarks.cli import (
    CommandError,
    _receipt_payload,
    _validated_worker_receipt,
    parse_preflight_request,
)
from benchmarks.execution import run_measurement_worker
from benchmarks.memory import _load_windows_dll
from benchmarks.preflight import HostSnapshot, PreflightReceipt


@pytest.mark.parametrize("outcome", ["success", "error", "interruption", "cleanup-failure"])
def test_vca08_measurement_always_closes_ownership(
    outcome: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    owner = Mock()
    process = Mock()
    process.wait.return_value = 0
    process.poll.return_value = 0
    transfer = Mock(return_value='{"status":"pass"}')
    original_error = OSError("synthetic")
    if outcome != "success":
        transfer.side_effect = KeyboardInterrupt() if outcome == "interruption" else original_error
        process.poll.return_value = None
    if outcome == "cleanup-failure":
        owner.close.side_effect = CommandError("cleanup-failed")
    monkeypatch.setattr(cli, "_MeasurementJob", lambda: owner)
    monkeypatch.setattr(cli, "_transfer_measurement_pipes", transfer)
    spawn = Mock(return_value=process)
    monkeypatch.setattr(subprocess, "Popen", spawn)
    if outcome == "success":
        result = cli._measure_process(("synthetic",), "{}")
        assert result.stdout == '{"status":"pass"}'
        assert result.returncode == 0
        process.kill.assert_not_called()
    else:
        expected = {
            "error": OSError,
            "interruption": KeyboardInterrupt,
            "cleanup-failure": CommandError,
        }
        with pytest.raises(expected[outcome]) as failure:
            cli._measure_process(("synthetic",), "{}")
        if outcome == "cleanup-failure":
            assert str(failure.value) == "tts-benchmark-command:cleanup-failed"
            assert failure.value.__context__ is original_error
        process.kill.assert_called_once()
    assert spawn.call_args.kwargs["stderr"] == subprocess.DEVNULL
    assert spawn.call_args.kwargs["creationflags"] == 0x08000000 | 0x00000004
    owner.assign.assert_called_once_with(process)
    owner.close.assert_called_once()
    assert process.wait.call_count == (2 if outcome == "success" else 1)
    for stream in (process.stdin, process.stdout):
        stream.close.assert_called_once()
    process.stderr.close.assert_not_called()


def test_five_pass_1_5_teardown_does_not_close_a_live_pipe_owner() -> None:
    process = Mock()
    process.poll.return_value = 0
    owner = Mock(ident=1)
    owner.is_alive.return_value = True
    with pytest.raises(CommandError, match=r"^tts-benchmark-command:cleanup-failed$"):
        cli._reap_measurement_process(process, {process.stdin: owner}, time.monotonic())
    owner.join.assert_called_once_with(timeout=0.0)
    process.stdin.close.assert_not_called()
    process.stdout.close.assert_called_once()


@pytest.mark.skipif(os.name != "nt", reason="Windows measurement ownership")
def test_vca08_outer_timeout_reaps_the_owned_worker_and_blocked_descendant(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    marker = tmp_path / "child.pid"
    child_script = "import time; time.sleep(60)"
    worker_script = (
        "import pathlib, subprocess, sys, time; sys.stdin.read(); "
        f"child = subprocess.Popen([sys.executable, '-c', {child_script!r}], "
        "stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); "
        "pathlib.Path(sys.argv[1]).write_text(str(child.pid)); time.sleep(60)"
    )
    processes: list[subprocess.Popen[str]] = []
    original_popen = subprocess.Popen

    def launch(args: object, **kwargs: Any) -> subprocess.Popen[str]:
        del args
        process = original_popen([sys.executable, "-c", worker_script, str(marker)], **kwargs)
        processes.append(process)
        return process

    monkeypatch.setattr(subprocess, "Popen", launch)
    monkeypatch.setattr(cli, "MEASUREMENT_TIMEOUT_SECONDS", 2.0)
    monkeypatch.setattr(cli, "run_local_preflight", lambda _request: None)
    monkeypatch.setattr(cli, "_preflight_passed", lambda _receipt: True)
    payload = valid_payload(tmp_path)
    payload["candidatePython"] = sys.executable
    results: list[tuple[dict[str, object], int]] = []
    failures: list[BaseException] = []

    def run() -> None:
        try:
            results.append(cli._run_measurement_parent(payload))
        except BaseException as error:
            failures.append(error)

    kernel = _load_windows_dll("kernel32")
    kernel.OpenProcess.argtypes = (wintypes.DWORD, wintypes.BOOL, wintypes.DWORD)
    kernel.OpenProcess.restype = wintypes.HANDLE
    kernel.WaitForSingleObject.argtypes = (wintypes.HANDLE, wintypes.DWORD)
    kernel.WaitForSingleObject.restype = wintypes.DWORD
    kernel.TerminateProcess.argtypes = (wintypes.HANDLE, wintypes.UINT)
    kernel.CloseHandle.argtypes = (wintypes.HANDLE,)
    kernel.QueryFullProcessImageNameW.argtypes = (
        wintypes.HANDLE,
        wintypes.DWORD,
        wintypes.LPWSTR,
        ctypes.POINTER(wintypes.DWORD),
    )
    kernel.GetProcessTimes.argtypes = (wintypes.HANDLE,) + (ctypes.POINTER(wintypes.FILETIME),) * 4
    thread = threading.Thread(target=run)
    child_handle = None
    cleanup_deadline = time.monotonic() + 7  # 2-second watchdog + 5-second cleanup
    thread.start()
    try:
        deadline = time.monotonic() + 2
        while not marker.exists() and time.monotonic() < deadline:
            time.sleep(0.01)
        assert marker.exists(), "synthetic descendant did not become ready"
        child_handle = kernel.OpenProcess(
            0x00100000 | 0x1000 | 0x0001, False, int(marker.read_text())
        )
        assert child_handle
        image = ctypes.create_unicode_buffer(32_768)
        length = wintypes.DWORD(len(image))
        assert kernel.QueryFullProcessImageNameW(child_handle, 0, image, ctypes.byref(length))
        assert Path(image.value).resolve() == Path(sys.executable).resolve()
        times = [wintypes.FILETIME() for _ in range(4)]
        assert kernel.GetProcessTimes(child_handle, *(ctypes.byref(value) for value in times))
        assert times[0].dwHighDateTime > 0  # Capture creation identity before waiting.
        assert kernel.WaitForSingleObject(child_handle, 0) == 258
        thread.join(timeout=10)
        assert not thread.is_alive()
        assert not failures
        assert results[0][1] == 2
        assert results[0][0]["status"] == "fail"
        assert processes[0].poll() is not None
        # TerminateJobObject and process-object signalling are asynchronous.
        # Observe actual exit within the existing cleanup bound, without sleeps.
        remaining_ms = max(0, int((cleanup_deadline - time.monotonic()) * 1000))
        assert kernel.WaitForSingleObject(child_handle, remaining_ms) == 0, (
            "owned descendant outlived watchdog"
        )
    finally:
        # Exact handles remain authoritative even if a PID is recycled.
        if child_handle:
            if kernel.WaitForSingleObject(child_handle, 0) == 258:
                kernel.TerminateProcess(child_handle, 1)
            assert kernel.WaitForSingleObject(child_handle, 5_000) == 0
            kernel.CloseHandle(child_handle)
        for process in processes:
            if process.poll() is None:
                process.kill()
            process.wait(timeout=5)
        thread.join(timeout=5)


def valid_payload(tmp_path: Path) -> dict[str, object]:
    return {
        "candidateId": "qwen3-tts-0-6b-customvoice-cuda-bf16-v1",
        "artifactRoot": str(tmp_path / "private-model"),
        "candidatePython": str(tmp_path / "private-python.exe"),
        "modelRevision": "8f9ebcf8826db6eeb9cdd4caa09d575a7f9ce4bd",
        "voiceId": "Aiden",
        "provider": "pytorch-cuda",
        "precision": "bfloat16",
        "offline": True,
        "expectedCommitSha": "a" * 40,
        "purpose": "official",
        "sleepDisabled": True,
        "backgroundLoadAcceptable": True,
        "thermalStateAcceptable": True,
    }


@pytest.mark.parametrize(
    ("status", "returncode", "accepted"),
    [("pass", 0, True), ("pass", 1, False), ("fail", 2, True), ("fail", 0, False)],
)
def test_five_pass_1_5_worker_receipt_requires_matching_exit(
    status: str, returncode: int, accepted: bool, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    payload = valid_payload(tmp_path)
    payload["candidatePython"] = sys.executable
    request = parse_preflight_request(payload)
    receipt = {
        "status": status,
        "purpose": "official",
        "candidateId": request.profile.candidate_id,
        "sessionId": "b" * 32,
        "failureCode": None if status == "pass" else "cancellation-failed",
        "counts": {
            "coldLoads": 5,
            "warmGenerations": 24,
            "sustainedGenerations": 12,
            "cancellationTrials": 5,
        },
        "eligibleForPromotion": False,
    }
    assert _validated_worker_receipt(receipt, request) == receipt
    monkeypatch.setattr(cli, "run_local_preflight", lambda _request: None)
    monkeypatch.setattr(cli, "_preflight_passed", lambda _receipt: True)
    monkeypatch.setattr(
        cli,
        "_measure_process",
        lambda command, _payload: subprocess.CompletedProcess(
            command, returncode, json.dumps(receipt), ""
        ),
    )
    if accepted:
        assert cli._run_measurement_parent(payload) == (receipt, returncode)
    else:
        assert cli._run_measurement_parent(payload) == (
            {"status": "fail", "stage": "measurement", "failureCode": "invalid-request"},
            2,
        )


@pytest.mark.skipif(os.name != "nt", reason="Windows measurement ownership")
@pytest.mark.parametrize(
    "case", ["overflow", "discard-stderr", "exact-limit", "blocked-stdin", "utf8", "json"]
)
def test_five_pass_1_5_bounded_pipes_reap_the_synthetic_worker(
    case: str, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    if case == "overflow":
        script = (
            "import sys, time; "
            f"sys.stdout.buffer.write(b'x' * {cli.MAXIMUM_WORKER_STDOUT_BYTES + 1}); "
            "sys.stdout.buffer.flush(); time.sleep(60)"
        )
    elif case == "discard-stderr":
        script = (
            "import sys; sys.stderr.buffer.write(b'x' * 262144); sys.stderr.buffer.flush(); "
            "assert sys.stdin.read() == '{}'; sys.stdout.write('{}')"
        )
    elif case == "exact-limit":
        script = f"print('x' * {cli.MAXIMUM_WORKER_STDOUT_BYTES}, end='')"
    elif case == "blocked-stdin":
        script = "import time; time.sleep(60)"
    elif case == "utf8":
        script = "import sys; sys.stdout.buffer.write(b'\\xff')"
    else:
        script = "print('{', end='')"
    processes: list[subprocess.Popen[Any]] = []
    original_popen = subprocess.Popen

    def launch(args: object, **kwargs: Any) -> subprocess.Popen[Any]:
        del args
        process = original_popen([sys.executable, "-c", script], **kwargs)
        processes.append(process)
        return process

    monkeypatch.setattr(subprocess, "Popen", launch)
    monkeypatch.setattr(cli, "MEASUREMENT_TIMEOUT_SECONDS", 2.0)
    try:
        if case == "overflow":
            with pytest.raises(
                CommandError, match=r"^tts-benchmark-command:invalid-worker-output$"
            ):
                cli._measure_process(("synthetic",), "{}")
        elif case == "discard-stderr":
            result = cli._measure_process(("synthetic",), "{}")
            assert (result.returncode, result.stdout, len(result.stderr)) == (0, "{}", 0)
        elif case == "exact-limit":
            result = cli._measure_process(("synthetic",), "{}")
            assert result.returncode == 0
            assert len(result.stdout) == cli.MAXIMUM_WORKER_STDOUT_BYTES
        elif case == "blocked-stdin":
            with pytest.raises(subprocess.TimeoutExpired):
                cli._measure_process(("synthetic",), "x" * cli.MAXIMUM_STDIN_BYTES)
        else:
            payload = valid_payload(tmp_path)
            payload["candidatePython"] = sys.executable
            monkeypatch.setattr(cli, "run_local_preflight", lambda _request: None)
            monkeypatch.setattr(cli, "_preflight_passed", lambda _receipt: True)
            assert cli._run_measurement_parent(payload) == (
                {"status": "fail", "stage": "measurement", "failureCode": "invalid-request"},
                2,
            )
    finally:
        assert len(processes) == 1
        assert processes[0].poll() is not None


@pytest.mark.parametrize("encoding", ["ascii", "utf8"])
def test_five_pass_1_5_rejects_oversized_encoded_stdin_before_spawn(
    encoding: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    payload = (
        "a" * (cli.MAXIMUM_STDIN_BYTES + 1)
        if encoding == "ascii"
        else "é" * cli.MAXIMUM_STDIN_BYTES
    )
    spawn = Mock()
    monkeypatch.setattr(subprocess, "Popen", spawn)
    with pytest.raises(CommandError, match=r"^tts-benchmark-command:invalid-input$"):
        cli._measure_process(("synthetic",), payload)
    spawn.assert_not_called()


def test_preflight_command_accepts_only_closed_stdin_configuration(tmp_path: Path) -> None:
    payload = valid_payload(tmp_path)
    request = parse_preflight_request(payload)
    assert request.profile.role == "balanced"
    assert request.configuration.provider == "pytorch-cuda"
    assert request.conditions.purpose == "official"
    assert str(tmp_path) not in repr(request)

    payload["privateText"] = "must-not-cross"
    with pytest.raises(
        CommandError,
        match=r"^tts-benchmark-command:invalid-input$",
    ):
        parse_preflight_request(payload)


def test_preflight_command_rejects_profile_misspellings_without_coercion(
    tmp_path: Path,
) -> None:
    for field, value in (
        ("provider", "cuda"),
        ("precision", "bf16"),
        ("purpose", "production"),
        ("offline", "true"),
    ):
        payload = valid_payload(tmp_path)
        payload[field] = value
        with pytest.raises(CommandError):
            parse_preflight_request(payload)


def test_receipt_output_is_allowlisted_and_contains_no_private_paths(tmp_path: Path) -> None:
    host = HostSnapshot(
        operating_system="Windows",
        os_version="10.0.26200",
        architecture="x86_64",
        python_version="3.12.10",
        cpu_model="Synthetic CPU",
        logical_processors=20,
        total_ram_bytes=32,
        free_ram_bytes=16,
        free_disk_bytes=100,
        power_online=True,
        power_mode="Balanced",
        gpu_model=None,
        driver_version="unavailable",
        total_vram_bytes=None,
        free_vram_bytes=None,
        process_vram_available=False,
    )
    receipt = PreflightReceipt(
        purpose="official",
        candidate_id="candidate-v1",
        role="compatibility",
        commit_sha="a" * 40,
        host=host,
        artifacts=(),
        failures=("artifact",),
        eligible_for_official_run=False,
        eligible_for_promotion=False,
    )
    output = _receipt_payload(receipt)
    assert output["failures"] == ["artifact"]
    assert str(tmp_path) not in repr(output)
    assert set(cast(dict[str, object], output["host"])) == {
        "operatingSystem",
        "osVersion",
        "architecture",
        "pythonVersion",
        "cpuModel",
        "logicalProcessors",
        "totalRamBytes",
        "freeRamBytes",
        "freeDiskBytes",
        "powerOnline",
        "powerMode",
        "gpuModel",
        "driverVersion",
        "totalVramBytes",
        "freeVramBytes",
        "processVramAvailable",
    }


def test_measurement_worker_receipt_is_closed_and_non_promotable(tmp_path: Path) -> None:
    request = parse_preflight_request(valid_payload(tmp_path))
    receipt = {
        "status": "fail",
        "purpose": "official",
        "candidateId": request.profile.candidate_id,
        "sessionId": "b" * 32,
        "failureCode": "cancellation-failed",
        "counts": {
            "coldLoads": 5,
            "warmGenerations": 24,
            "sustainedGenerations": 12,
            "cancellationTrials": 5,
        },
        "eligibleForPromotion": False,
    }
    assert _validated_worker_receipt(receipt, request) == receipt

    receipt["privatePath"] = str(tmp_path)
    with pytest.raises(
        CommandError,
        match=r"^tts-benchmark-command:invalid-worker-output$",
    ):
        _validated_worker_receipt(receipt, request)


def test_measurement_worker_rejects_a_different_interpreter_without_loading(
    tmp_path: Path,
) -> None:
    request = parse_preflight_request(valid_payload(tmp_path))
    receipt = run_measurement_worker(request)
    assert receipt == {
        "status": "fail",
        "purpose": "official",
        "candidateId": request.profile.candidate_id,
        "sessionId": None,
        "failureCode": "invalid-request",
        "counts": {
            "coldLoads": 0,
            "warmGenerations": 0,
            "sustainedGenerations": 0,
            "cancellationTrials": 0,
        },
        "eligibleForPromotion": False,
    }
    assert str(tmp_path) not in repr(receipt)
