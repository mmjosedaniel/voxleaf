from __future__ import annotations

import copy
import json
import os
import subprocess
import sys
import threading
from pathlib import Path
from typing import IO, BinaryIO, cast
from unittest.mock import Mock

import pytest

import benchmarks.service_handoff_cli as handoff
import benchmarks.service_handoff_v2_authority as v2
from benchmarks.memory import ProcessResourceSample, WindowsProcessResourceSampler
from benchmarks.service_handoff_authority import EXPECTED_CASE_IDS, PROFILE_SHA256
from benchmarks.service_handoff_cli import (
    AUTHORITY_COMMIT_SHA,
    ServiceHandoffRunError,
    _final_result,
    _numeric_values,
    _parse_event,
    _verify_firewall,
)
from benchmarks.service_handoff_v2_authority import CLEANUP_ORDER

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]


@pytest.mark.skipif(os.name != "nt", reason="Windows host ownership boundary")
@pytest.mark.parametrize(
    "stage", ["first-gpu", "second-gpu", "resource", "thread", "thread-start", "cleanup"]
)
def test_maf05_setup_failure_reaps_the_identified_real_child(
    stage: str,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    real_popen = subprocess.Popen
    children: list[subprocess.Popen[bytes]] = []
    acquired: list[Mock] = []
    failure = handoff._fail("synthetic-setup")
    for name in handoff.REQUIRED_ENVIRONMENT:
        monkeypatch.setenv(name, "1")
    monkeypatch.setattr(handoff, "_release_executable", lambda _root: Path(sys.executable))
    monkeypatch.setattr(handoff, "_verify_firewall", lambda _python: None)
    monkeypatch.setattr(handoff, "_execution_commit", lambda _root: "b" * 40)
    monkeypatch.setattr(handoff, "verify_execution_authority", lambda _root, _sha: None)
    monkeypatch.setattr(v2, "verify_execution_authority", lambda _root, _sha: None)

    def spawn(*args: object, **kwargs: object) -> subprocess.Popen[bytes]:
        child = real_popen(
            [sys.executable, "-c", "import time; time.sleep(60)"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        children.append(child)
        return child

    def gpu(*args: object) -> Mock:
        if stage == "first-gpu" or (stage == "second-gpu" and acquired):
            raise failure
        sampler = Mock()
        if stage == "cleanup":
            sampler.close.side_effect = OSError("synthetic private cleanup detail")
        acquired.append(sampler)
        return sampler

    def resource(**kwargs: object) -> Mock:
        if stage in {"resource", "cleanup"}:
            raise failure
        return Mock()

    def thread(**kwargs: object) -> Mock:
        if stage == "thread":
            raise failure
        value = Mock()
        value.start.side_effect = failure
        value.is_alive.return_value = False
        return value

    monkeypatch.setattr(subprocess, "Popen", spawn)
    monkeypatch.setattr(handoff, "WindowsGpuProcessMemorySampler", gpu)
    monkeypatch.setattr(handoff, "WindowsProcessResourceSampler", resource)
    monkeypatch.setattr(threading, "Thread", thread)
    try:
        with pytest.raises(ServiceHandoffRunError) as captured:
            handoff.run()
        assert captured.value is failure
        assert getattr(failure, "__notes__", []) == (
            ["tts-service-handoff-run:cleanup-failed"] if stage == "cleanup" else []
        )
        assert len(children) == 1
        # Popen retains the original Windows process handle; numeric PID reuse
        # cannot redirect cleanup to an unrelated process.
        assert children[0].poll() is not None
        assert children[0].stdout is not None and children[0].stdout.closed
        for sampler in acquired:
            sampler.close.assert_called_once()
    finally:
        for child in children:
            if child.poll() is None:
                child.kill()
            child.wait(timeout=5)
            if child.stdout is not None:
                child.stdout.close()
            if child.stdin is not None:
                child.stdin.close()


def test_maf05_cli_reports_cleanup_failure_without_replacing_or_exposing_primary(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    failure = handoff._fail("synthetic-private-detail")
    failure.add_note("tts-service-handoff-run:cleanup-failed")
    monkeypatch.setattr(handoff, "run", Mock(side_effect=failure))
    assert handoff.main(["run"]) == 1
    output = capsys.readouterr()
    assert output.out == ""
    assert (
        output.err
        == "Exact-host service handoff matrix failed.\nExact-host service handoff cleanup failed.\n"
    )


def _case(case_id: str) -> dict[str, object]:
    success = case_id in {"cold-neutral-success", "warm-spanish-success"}
    completed = success or case_id == "after-complete-before-delivery-invalidation"
    terminated = case_id in {
        "accepted-before-output-cancellation",
        "mid-generation-cancellation",
        "child-crash",
        "application-exit",
    }
    return {
        "caseId": case_id,
        "outcome": "pass",
        "publishedAudioUnits": 1 if success else 0,
        "deliveredAudioBytes": 96_000 if success else 0,
        "elapsedMilliseconds": 1_000.0,
        "mediaDurationSeconds": 1.0 if completed else None,
        "commandToFirstTransportFrameMilliseconds": 900.0 if completed else None,
        "commandToCompleteUnitMilliseconds": 1_000.0 if completed else None,
        "nativeFrameHandoffMicroseconds": 25.0 if completed else None,
        "rtf": 1.0 if completed else None,
        "terminationMilliseconds": 100.0 if terminated else None,
        "failureCode": None,
    }


def _native_result() -> dict[str, object]:
    return {
        "kind": "nativeResult",
        "cases": [_case(case_id) for case_id in EXPECTED_CASE_IDS],
        "timings": {
            "serviceStartMilliseconds": 100.0,
            "initialLoadMilliseconds": 1_000.0,
            "initialWarmMilliseconds": 500.0,
            "restartPrepareMilliseconds": [1_400.0, 1_500.0, 1_600.0],
        },
    }


def test_parse_event_accepts_only_closed_content_safe_shapes() -> None:
    phase = _parse_event(
        '{"kind":"phase","phase":"ready","requiresZeroChildren":false,"observeNetwork":true}'
    )
    assert phase["phase"] == "ready"
    with pytest.raises(ServiceHandoffRunError, match="native-phase"):
        _parse_event(
            '{"kind":"phase","phase":"ready","requiresZeroChildren":false,'
            '"observeNetwork":true,"text":"private"}'
        )


def test_final_result_derives_closed_percentiles_and_validates() -> None:
    result = _final_result(
        REPOSITORY_ROOT,
        _native_result(),
        execution_commit_sha="b" * 40,
        peak_ram_bytes=8_000_000_000,
        peak_dedicated_bytes=6_000_000_000,
        peak_shared_bytes=100_000_000,
        peak_allocations=1,
        cleanup=ProcessResourceSample(0, 0, 0),
        cleanup_shared=ProcessResourceSample(0, 0, 0),
        listener_count=0,
        external_connection_count=0,
    )
    assert result["profileSha256"] == PROFILE_SHA256
    assert result["authorityCommitSha"] == AUTHORITY_COMMIT_SHA
    timings = cast(dict[str, object], result["timings"])
    assert timings["restartPrepareP95Milliseconds"] == 1_600.0


def test_final_result_rejects_nonzero_cleanup_or_network_state() -> None:
    for change in ("ram", "dedicated", "shared", "listener", "external"):
        cleanup = ProcessResourceSample(
            1 if change == "ram" else 0, 1 if change == "dedicated" else 0, 0
        )
        shared = ProcessResourceSample(0, 1 if change == "shared" else 0, 0)
        with pytest.raises(ServiceHandoffRunError, match="cleanup"):
            _final_result(
                REPOSITORY_ROOT,
                copy.deepcopy(_native_result()),
                execution_commit_sha="b" * 40,
                peak_ram_bytes=1,
                peak_dedicated_bytes=1,
                peak_shared_bytes=0,
                peak_allocations=1,
                cleanup=cleanup,
                cleanup_shared=shared,
                listener_count=1 if change == "listener" else 0,
                external_connection_count=1 if change == "external" else 0,
            )


def test_numeric_values_ignores_null_and_boolean_values() -> None:
    assert _numeric_values(
        (
            {"metric": 1},
            {"metric": 2.5},
            {"metric": None},
            {"metric": True},
        ),
        "metric",
    ) == (1.0, 2.5)


def test_firewall_preflight_rejects_a_value_other_than_the_frozen_environment(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("VOXLEAF_TTS_DEV_PYTHON", "candidate-python")
    with pytest.raises(ServiceHandoffRunError, match="firewall"):
        _verify_firewall("different-python")


@pytest.mark.skipif(os.name != "nt", reason="Windows handoff host")
def test_dcr_21_silent_native_child_hits_fixed_watchdog(monkeypatch: pytest.MonkeyPatch) -> None:
    real_popen = subprocess.Popen
    children: list[subprocess.Popen[bytes]] = []
    for name in handoff.REQUIRED_ENVIRONMENT:
        monkeypatch.setenv(name, "1")
    monkeypatch.setattr(handoff, "RUN_TIMEOUT_SECONDS", 0.15, raising=False)
    monkeypatch.setattr(handoff, "_release_executable", lambda _root: Path(sys.executable))
    monkeypatch.setattr(handoff, "_verify_firewall", lambda _python: None)
    monkeypatch.setattr(handoff, "_execution_commit", lambda _root: "b" * 40)
    monkeypatch.setattr(handoff, "verify_execution_authority", lambda _root, _sha: None)
    monkeypatch.setattr(handoff, "WindowsGpuProcessMemorySampler", Mock())
    sampler = Mock()
    sampler.sample.return_value = ProcessResourceSample(0, 0, 0)
    monkeypatch.setattr(handoff, "WindowsProcessResourceSampler", lambda **_kw: sampler)

    def spawn(*_args: object, **_kwargs: object) -> subprocess.Popen[bytes]:
        child = real_popen(
            [sys.executable, "-c", "import time; time.sleep(0.6)"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        children.append(child)
        return child

    monkeypatch.setattr(subprocess, "Popen", spawn)
    try:
        with pytest.raises(ServiceHandoffRunError, match=":deadline$"):
            handoff.run()
        assert children[0].poll() is not None
    finally:
        for child in children:
            if child.poll() is None:
                child.kill()
            child.wait(timeout=5)
            for stream in (child.stdin, child.stdout):
                if stream is not None:
                    stream.close()


@pytest.mark.skipif(os.name != "nt", reason="Windows firewall observation")
@pytest.mark.parametrize("restricted", [False, True])
def test_dcr_11_handoff_rejects_partial_effective_firewall_policy(
    monkeypatch: pytest.MonkeyPatch,
    restricted: bool,
) -> None:
    prelude = """
function Get-NetFirewallRule { [CmdletBinding()]param($PolicyStore,$DisplayName)
  [pscustomobject]@{Enabled='True';Direction='Outbound';Action='Block';PrimaryStatus='OK';Profile='Any'}
}
function Get-NetFirewallProfile { param($PolicyStore)
  foreach($name in @('Domain','Private','Public')){[pscustomobject]@{Name=$name;Enabled=$true}}
}
function Get-Service { [pscustomobject]@{Status='Running'} }
function Get-NetFirewallApplicationFilter { process {
  [pscustomobject]@{Program=$env:VOXLEAF_TTS_DEV_PYTHON}
} }
function Get-NetFirewallAddressFilter { process {
  [pscustomobject]@{LocalAddress='Any';RemoteAddress='Any'}
} }
function Get-NetFirewallPortFilter { process {
  if ($env:DCR_RESTRICTED -eq '1') {
    [pscustomobject]@{Protocol='TCP';LocalPort='Any';RemotePort='443'}
  } else { [pscustomobject]@{Protocol='Any';LocalPort='Any';RemotePort='Any'} }
} }
function Get-NetFirewallServiceFilter { process { [pscustomobject]@{Service='Any'} } }
function Get-NetFirewallInterfaceFilter { process { [pscustomobject]@{InterfaceAlias='Any'} } }
function Get-NetFirewallInterfaceTypeFilter { process { [pscustomobject]@{InterfaceType='Any'} } }
"""
    run = subprocess.run

    def controlled_run(
        arguments: tuple[str, ...] | list[str], **kwargs: object
    ) -> subprocess.CompletedProcess[str]:
        assert arguments[0] == "powershell.exe"
        return run((*arguments[:-1], prelude + arguments[-1]), **kwargs)  # type: ignore[call-overload,no-any-return]

    executable = str(Path(sys.executable).resolve(strict=True))
    monkeypatch.setenv("VOXLEAF_TTS_DEV_PYTHON", executable)
    monkeypatch.setenv("DCR_RESTRICTED", "1" if restricted else "0")
    monkeypatch.setattr(subprocess, "run", controlled_run)
    if restricted:
        with pytest.raises(ServiceHandoffRunError, match=":firewall$"):
            _verify_firewall(executable)
    else:
        _verify_firewall(executable)


def _synthetic_v2_native(
    monkeypatch: pytest.MonkeyPatch,
    script: str,
    *,
    deadline: float = 3.0,
    residue: str | None = None,
    held_stdout: BinaryIO | None = None,
) -> list[subprocess.Popen[bytes]]:
    children: list[subprocess.Popen[bytes]] = []
    real_popen = subprocess.Popen
    for name in handoff.REQUIRED_ENVIRONMENT:
        monkeypatch.setenv(name, "1")
    monkeypatch.setattr(handoff, "RUN_TIMEOUT_SECONDS", deadline)
    monkeypatch.setattr(handoff, "_release_executable", lambda _root: Path(sys.executable))
    monkeypatch.setattr(handoff, "_verify_firewall", lambda _python: None)
    monkeypatch.setattr(handoff, "_execution_commit", lambda _root: "b" * 40)
    monkeypatch.setattr(handoff, "verify_execution_authority", lambda _root, _sha: None)
    monkeypatch.setattr(v2, "verify_execution_authority", lambda _root, _sha: None)
    monkeypatch.setattr(handoff, "WindowsGpuProcessMemorySampler", Mock())
    sampler = Mock()
    in_cleanup = False
    verify_zero_cleanup = handoff._verify_zero_cleanup

    def observe_cleanup(
        dedicated: WindowsProcessResourceSampler,
        shared: WindowsProcessResourceSampler,
        pid: int,
    ) -> tuple[ProcessResourceSample, ProcessResourceSample]:
        nonlocal in_cleanup
        in_cleanup = True
        try:
            return verify_zero_cleanup(dedicated, shared, pid)
        finally:
            in_cleanup = False

    monkeypatch.setattr(handoff, "_verify_zero_cleanup", observe_cleanup)

    def sample(_pid: int) -> ProcessResourceSample:
        if in_cleanup and residue == "unknown-vram":
            return ProcessResourceSample(0, None, 0)
        if in_cleanup and residue == "nonzero-ram":
            return ProcessResourceSample(1, 0, 0)
        if sampler.sample.call_count == 1:
            return ProcessResourceSample(1, 1, 1)
        return ProcessResourceSample(0, 0, 0)

    sampler.sample.side_effect = sample
    sampler.process_tree_ids.side_effect = lambda pid: frozenset(
        (pid, pid + 1) if residue == "child" else (pid,)
    )
    monkeypatch.setattr(handoff, "WindowsProcessResourceSampler", lambda **_kw: sampler)

    def spawn(*args: object, **kwargs: object) -> subprocess.Popen[bytes]:
        assert args[0] == [sys.executable, handoff.HOST_ARGUMENT]
        child = real_popen(
            [sys.executable, "-c", script],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
        )
        if held_stdout is not None:
            assert child.stdout is not None
            child.stdout.close()
            child.stdout = held_stdout
        children.append(child)
        return child

    monkeypatch.setattr(subprocess, "Popen", spawn)
    return children


_HELLO_SCRIPT = """
import json, sys, time
def receive(): return json.loads(sys.stdin.buffer.readline())
def send(record): print(json.dumps(record), flush=True)
hello = {'kind': 'hello', 'version': 2}
assert receive() == hello
"""


@pytest.mark.skipif(os.name != "nt", reason="Windows handoff host")
@pytest.mark.parametrize(
    ("mode", "expected"),
    [
        ("flood", "native-output-bound"),
        ("trickle", "deadline"),
        ("oversize", "native-record-bound"),
        ("version", "observer-version"),
    ],
)
def test_dcr_21_native_output_cannot_extend_deadline_or_bounds(
    monkeypatch: pytest.MonkeyPatch, mode: str, expected: str
) -> None:
    phase = "{'kind':'phase','phase':'ready','requiresZeroChildren':False,'observeNetwork':False}"
    scripts = {
        "flood": f"send(hello)\nfor _ in range(1000): send({phase})\n",
        "trickle": f"send(hello)\nfor _ in range(100):\n send({phase})\n time.sleep(0.03)\n",
        "oversize": "print('x' * 16385, flush=True)\n",
        "version": "send({'kind':'hello','version':1})\n",
    }
    children = _synthetic_v2_native(
        monkeypatch, _HELLO_SCRIPT + scripts[mode], deadline=0.25 if mode == "trickle" else 3
    )
    with pytest.raises(ServiceHandoffRunError, match=f":{expected}$"):
        handoff.run()
    assert children[0].poll() is not None
    assert children[0].stdout is not None and children[0].stdout.closed


@pytest.mark.skipif(os.name != "nt", reason="Windows handoff host")
def test_dcr_21_retained_reader_does_not_hold_watchdog_cleanup(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    read_fd, write_fd = os.pipe()
    with os.fdopen(read_fd, "rb") as held:
        try:
            children = _synthetic_v2_native(
                monkeypatch, _HELLO_SCRIPT + "time.sleep(3)\n", deadline=0.15, held_stdout=held
            )
            monkeypatch.setattr(handoff, "READER_JOIN_SECONDS", 0.05)
            with pytest.raises(ServiceHandoffRunError) as observed:
                handoff.run()
            assert str(observed.value).endswith(":deadline")
            assert observed.value.__notes__ == ["tts-service-handoff-run:cleanup-failed"]
            assert children[0].poll() is not None and not held.closed
        finally:
            os.close(write_fd)


@pytest.mark.skipif(os.name != "nt", reason="Windows handoff host")
@pytest.mark.parametrize(
    ("mode", "expected"),
    [
        ("clean", None),
        ("wrong", "cleanup-order"),
        ("replay", "cleanup-order"),
        ("unknown-vram", "intermediate-cleanup"),
        ("nonzero-ram", "intermediate-cleanup"),
        ("child", "intermediate-cleanup"),
    ],
)
def test_dcr_22_real_observer_pipe_acknowledges_only_four_fresh_zero_boundaries(
    monkeypatch: pytest.MonkeyPatch, mode: str, expected: str | None
) -> None:
    acknowledgements: list[object] = []
    send_record = handoff._send_observer_record

    def record_send(stream: IO[bytes], record: dict[str, object]) -> None:
        send_record(stream, record)
        if record.get("kind") == "cleanupAck":
            acknowledgements.append(record["sequence"])

    monkeypatch.setattr(handoff, "_send_observer_record", record_send)
    script = (
        _HELLO_SCRIPT
        + f"""
send(hello)
mode={mode!r}
for index, phase in enumerate({CLEANUP_ORDER!r}, 1):
 record={{'kind':'cleanupReady','version':2,'phase':phase,'sequence':index}}
 if mode == 'wrong': record['sequence']=True
 if mode == 'replay' and index == 2:
  record.update(sequence=1,phase={CLEANUP_ORDER[0]!r})
 send(record)
 assert receive() == {{**record,'kind':'cleanupAck'}}
send(json.loads({json.dumps(_native_result())!r}))
"""
    )
    children = _synthetic_v2_native(monkeypatch, script, residue=mode)
    if expected is None:
        result = handoff.run()
        assert result["schemaVersion"] == 2
        assert result["protocolVersion"] == 1
        assert result["cleanupAcknowledgements"] == [
            {"phase": phase, "sequence": index} for index, phase in enumerate(CLEANUP_ORDER, 1)
        ]
        assert acknowledgements == [1, 2, 3, 4]
    else:
        with pytest.raises(ServiceHandoffRunError, match=f":{expected}$"):
            handoff.run()
        assert acknowledgements == ([1] if mode == "replay" else [])
    assert children[0].poll() is not None
