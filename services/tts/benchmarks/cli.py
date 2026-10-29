"""Explicit benchmark command surface; private paths enter only through stdin."""

from __future__ import annotations

import ctypes
import json
import re
import subprocess
import sys
import time
from collections.abc import Mapping
from ctypes import wintypes
from pathlib import Path
from typing import Final, NoReturn, Protocol, cast

from benchmarks.adapters.manifest import (
    CandidateConfiguration,
    CandidatePrecision,
    CandidateProvider,
    load_benchmark_candidate_profile,
)
from benchmarks.memory import _load_windows_dll
from benchmarks.preflight import (
    PreflightReceipt,
    PreflightRequest,
    RunConditions,
    RunPurpose,
    run_local_preflight,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
SERVICE_ROOT: Final = REPOSITORY_ROOT / "services" / "tts"
MAXIMUM_STDIN_BYTES: Final = 16_384
MEASUREMENT_TIMEOUT_SECONDS: Final = 7_200
PREFLIGHT_FIELDS: Final = frozenset(
    (
        "candidateId",
        "artifactRoot",
        "candidatePython",
        "modelRevision",
        "voiceId",
        "provider",
        "precision",
        "offline",
        "expectedCommitSha",
        "purpose",
        "sleepDisabled",
        "backgroundLoadAcceptable",
        "thermalStateAcceptable",
    )
)
WORKER_RECEIPT_FIELDS: Final = frozenset(
    (
        "status",
        "purpose",
        "candidateId",
        "sessionId",
        "failureCode",
        "counts",
        "eligibleForPromotion",
    )
)
WORKER_COUNT_FIELDS: Final = frozenset(
    (
        "coldLoads",
        "warmGenerations",
        "sustainedGenerations",
        "cancellationTrials",
    )
)
WORKER_FAILURE_CODES: Final = frozenset(
    (
        "invalid-request",
        "adapter-unavailable",
        "load-failed",
        "warmup-failed",
        "generation-failed",
        "timeout",
        "crash",
        "resource-limit",
        "invalid-output",
        "privacy",
        "cancellation-failed",
        "cleanup-failed",
        "measurement-unavailable",
    )
)


class CommandError(RuntimeError):
    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-command:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise CommandError(code)


def _mapping(value: object) -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail("invalid-input")
    return cast(Mapping[str, object], value)


def _string(value: object) -> str:
    if not isinstance(value, str) or not value:
        _fail("invalid-input")
    return value


def _boolean(value: object) -> bool:
    if not isinstance(value, bool):
        _fail("invalid-input")
    return value


def parse_preflight_request(value: object) -> PreflightRequest:
    payload = _mapping(value)
    if set(payload) != PREFLIGHT_FIELDS:
        _fail("invalid-input")
    candidate_id = _string(payload.get("candidateId"))
    profile = load_benchmark_candidate_profile(REPOSITORY_ROOT, candidate_id)
    provider = _string(payload.get("provider"))
    precision = _string(payload.get("precision"))
    if provider not in ("pytorch-cuda", "onnxruntime-cpu") or precision not in (
        "bfloat16",
        "float32",
    ):
        _fail("invalid-input")
    purpose = _string(payload.get("purpose"))
    if purpose not in ("pilot", "official"):
        _fail("invalid-input")
    configuration = CandidateConfiguration(
        candidate_id=candidate_id,
        artifact_root=Path(_string(payload.get("artifactRoot"))),
        model_revision=_string(payload.get("modelRevision")),
        voice_id=_string(payload.get("voiceId")),
        provider=cast(CandidateProvider, provider),
        precision=cast(CandidatePrecision, precision),
        offline=_boolean(payload.get("offline")),
    )
    return PreflightRequest(
        expected_commit_sha=_string(payload.get("expectedCommitSha")),
        repository_root=REPOSITORY_ROOT,
        profile=profile,
        configuration=configuration,
        candidate_python=Path(_string(payload.get("candidatePython"))),
        conditions=RunConditions(
            purpose=cast(RunPurpose, purpose),
            sleep_disabled=_boolean(payload.get("sleepDisabled")),
            background_load_acceptable=_boolean(payload.get("backgroundLoadAcceptable")),
            thermal_state_acceptable=_boolean(payload.get("thermalStateAcceptable")),
        ),
    )


def _receipt_payload(receipt: PreflightReceipt) -> dict[str, object]:
    host = receipt.host
    return {
        "status": "pass" if not receipt.failures else "fail",
        "purpose": receipt.purpose,
        "candidateId": receipt.candidate_id,
        "role": receipt.role,
        "commitSha": receipt.commit_sha,
        "eligibleForOfficialRun": receipt.eligible_for_official_run,
        "eligibleForPromotion": receipt.eligible_for_promotion,
        "failures": list(receipt.failures),
        "host": {
            "operatingSystem": host.operating_system,
            "osVersion": host.os_version,
            "architecture": host.architecture,
            "pythonVersion": host.python_version,
            "cpuModel": host.cpu_model,
            "logicalProcessors": host.logical_processors,
            "totalRamBytes": host.total_ram_bytes,
            "freeRamBytes": host.free_ram_bytes,
            "freeDiskBytes": host.free_disk_bytes,
            "powerOnline": host.power_online,
            "powerMode": host.power_mode,
            "gpuModel": host.gpu_model,
            "driverVersion": host.driver_version,
            "totalVramBytes": host.total_vram_bytes,
            "freeVramBytes": host.free_vram_bytes,
            "processVramAvailable": host.process_vram_available,
        },
        "artifacts": [
            {
                "artifactId": artifact.artifact_id,
                "sha256": artifact.sha256,
                "sizeBytes": artifact.size_bytes,
            }
            for artifact in receipt.artifacts
        ],
    }


def _read_stdin_json() -> object:
    value = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(value.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        _fail("input-limit")
    try:
        return cast(object, json.loads(value))
    except json.JSONDecodeError:
        _fail("invalid-input")


def _validated_worker_receipt(
    value: object,
    request: PreflightRequest,
) -> dict[str, object]:
    payload = _mapping(value)
    if set(payload) != WORKER_RECEIPT_FIELDS:
        _fail("invalid-worker-output")
    status = payload.get("status")
    purpose = payload.get("purpose")
    candidate_id = payload.get("candidateId")
    session_id = payload.get("sessionId")
    failure_code = payload.get("failureCode")
    counts = _mapping(payload.get("counts"))
    if (
        status not in ("pass", "fail")
        or purpose != request.conditions.purpose
        or candidate_id != request.profile.candidate_id
        or set(counts) != WORKER_COUNT_FIELDS
        or any(
            not isinstance(counts.get(field), int)
            or isinstance(counts.get(field), bool)
            or cast(int, counts.get(field)) < 0
            for field in WORKER_COUNT_FIELDS
        )
        or payload.get("eligibleForPromotion") is not False
    ):
        _fail("invalid-worker-output")
    if request.conditions.purpose == "pilot":
        if session_id is not None:
            _fail("invalid-worker-output")
    elif not isinstance(session_id, str) or re.fullmatch(r"[a-f0-9]{32}", session_id) is None:
        _fail("invalid-worker-output")
    if (status == "pass" and failure_code is not None) or (
        status == "fail" and failure_code not in WORKER_FAILURE_CODES
    ):
        _fail("invalid-worker-output")
    maximum_counts = {
        "coldLoads": 5,
        "warmGenerations": 24,
        "sustainedGenerations": 120,
        "cancellationTrials": 5,
    }
    if any(cast(int, counts[field]) > maximum for field, maximum in maximum_counts.items()):
        _fail("invalid-worker-output")
    if status == "pass" and request.conditions.purpose == "official":
        sustained_count = cast(int, counts["sustainedGenerations"])
        v6 = (
            request.profile.authority is not None
            and request.profile.authority.profile_version == "tts-cpu-fallback-profile-v6"
        )
        warm_generations = 16 if v6 else 24
        sequence_length = 8 if v6 else 12
        if (
            counts["coldLoads"] != 5
            or counts["warmGenerations"] != warm_generations
            or counts["cancellationTrials"] != 5
            or not sequence_length <= sustained_count <= sequence_length * 10
            or sustained_count % sequence_length
        ):
            _fail("invalid-worker-output")
    return dict(payload)


def _preflight_passed(receipt: PreflightReceipt) -> bool:
    if receipt.failures:
        return False
    return receipt.purpose == "pilot" or receipt.eligible_for_official_run


class _JobLimits(ctypes.Structure):
    _fields_ = (
        ("process_time", ctypes.c_longlong),
        ("job_time", ctypes.c_longlong),
        ("flags", wintypes.DWORD),
        ("minimum_working_set", ctypes.c_size_t),
        ("maximum_working_set", ctypes.c_size_t),
        ("active_process_limit", wintypes.DWORD),
        ("affinity", ctypes.c_size_t),
        ("priority_class", wintypes.DWORD),
        ("scheduling_class", wintypes.DWORD),
    )


class _ExtendedJobLimits(ctypes.Structure):
    _fields_ = (
        ("basic", _JobLimits),
        ("io_counters", ctypes.c_ulonglong * 6),
        ("process_memory", ctypes.c_size_t),
        ("job_memory", ctypes.c_size_t),
        ("peak_process_memory", ctypes.c_size_t),
        ("peak_job_memory", ctypes.c_size_t),
    )


class _JobAccounting(ctypes.Structure):
    _fields_ = (
        ("times", ctypes.c_longlong * 4),
        ("page_faults", wintypes.DWORD),
        ("total_processes", wintypes.DWORD),
        ("active_processes", wintypes.DWORD),
        ("terminated_processes", wintypes.DWORD),
    )


class _WindowsProcessHandle(Protocol):
    _handle: int


class _ThreadEntry(ctypes.Structure):
    _fields_ = (
        ("size", wintypes.DWORD),
        ("usage", wintypes.DWORD),
        ("thread_id", wintypes.DWORD),
        ("process_id", wintypes.DWORD),
        ("base_priority", wintypes.LONG),
        ("delta_priority", wintypes.LONG),
        ("flags", wintypes.DWORD),
    )


class _MeasurementJob:
    """The Windows-only measurement owner keeps a non-inherited tree handle."""

    def __init__(self) -> None:
        self._kernel = _load_windows_dll("kernel32")
        for name, arguments, result in (
            ("CreateJobObjectW", (ctypes.c_void_p, wintypes.LPCWSTR), wintypes.HANDLE),
            (
                "SetInformationJobObject",
                (wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD),
                wintypes.BOOL,
            ),
            ("AssignProcessToJobObject", (wintypes.HANDLE, wintypes.HANDLE), wintypes.BOOL),
            ("TerminateJobObject", (wintypes.HANDLE, wintypes.UINT), wintypes.BOOL),
            (
                "QueryInformationJobObject",
                (wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD, ctypes.c_void_p),
                wintypes.BOOL,
            ),
            ("CloseHandle", (wintypes.HANDLE,), wintypes.BOOL),
            ("CreateToolhelp32Snapshot", (wintypes.DWORD, wintypes.DWORD), wintypes.HANDLE),
            ("Thread32First", (wintypes.HANDLE, ctypes.POINTER(_ThreadEntry)), wintypes.BOOL),
            ("Thread32Next", (wintypes.HANDLE, ctypes.POINTER(_ThreadEntry)), wintypes.BOOL),
            ("OpenThread", (wintypes.DWORD, wintypes.BOOL, wintypes.DWORD), wintypes.HANDLE),
            ("GetProcessIdOfThread", (wintypes.HANDLE,), wintypes.DWORD),
            ("ResumeThread", (wintypes.HANDLE,), wintypes.DWORD),
            ("WaitForSingleObject", (wintypes.HANDLE, wintypes.DWORD), wintypes.DWORD),
        ):
            function = getattr(self._kernel, name)
            function.argtypes = arguments
            function.restype = result
        self._handle = self._kernel.CreateJobObjectW(None, None)
        if not self._handle:
            _fail("cleanup-failed")
        limits = _ExtendedJobLimits()
        limits.basic.flags = 0x00002000  # JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE
        if not self._kernel.SetInformationJobObject(
            self._handle, 9, ctypes.byref(limits), ctypes.sizeof(limits)
        ):
            self._kernel.CloseHandle(self._handle)
            _fail("cleanup-failed")

    def assign(self, process: subprocess.Popen[str]) -> None:
        # Popen owns this exact CreateProcess handle; no PID lookup or name kill.
        handle = int(cast(_WindowsProcessHandle, process)._handle)
        if not self._kernel.AssignProcessToJobObject(self._handle, handle):
            _fail("cleanup-failed")
        # Popen closes its primary thread handle. Find that still-suspended
        # thread, verify its owner against the retained live process handle,
        # and resume only after containment (including Python venv launchers).
        snapshot = self._kernel.CreateToolhelp32Snapshot(0x00000004, 0)
        if snapshot == ctypes.c_void_p(-1).value:
            _fail("cleanup-failed")
        try:
            entry = _ThreadEntry()
            entry.size = ctypes.sizeof(entry)
            found = self._kernel.Thread32First(snapshot, ctypes.byref(entry))
            deadline = time.monotonic() + 5
            while found and time.monotonic() < deadline:
                if entry.process_id == process.pid:
                    thread = self._kernel.OpenThread(0x0002 | 0x0800, False, entry.thread_id)
                    if not thread:
                        _fail("cleanup-failed")
                    try:
                        if (
                            self._kernel.WaitForSingleObject(handle, 0) != 258
                            or self._kernel.GetProcessIdOfThread(thread) != process.pid
                            or self._kernel.ResumeThread(thread) != 1
                        ):
                            _fail("cleanup-failed")
                        return
                    finally:
                        self._kernel.CloseHandle(thread)
                found = self._kernel.Thread32Next(snapshot, ctypes.byref(entry))
            _fail("cleanup-failed")
        finally:
            self._kernel.CloseHandle(snapshot)

    def close(self, deadline: float) -> None:
        try:
            if not self._kernel.TerminateJobObject(self._handle, 1):
                _fail("cleanup-failed")
            while True:
                accounting = _JobAccounting()
                if not self._kernel.QueryInformationJobObject(
                    self._handle, 1, ctypes.byref(accounting), ctypes.sizeof(accounting), None
                ):
                    _fail("cleanup-failed")
                if accounting.active_processes == 0:
                    return
                if time.monotonic() >= deadline:
                    _fail("cleanup-failed")
                time.sleep(0.01)
        finally:
            self._kernel.CloseHandle(self._handle)


def _measure_process(command: tuple[str, ...], payload: str) -> subprocess.CompletedProcess[str]:
    job = _MeasurementJob()
    process: subprocess.Popen[str] | None = None
    try:
        process = subprocess.Popen(
            command,
            cwd=SERVICE_ROOT,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            creationflags=0x08000000 | 0x00000004,  # NO_WINDOW | SUSPENDED
        )
        # Assignment precedes even the interpreter launcher's first instruction.
        job.assign(process)
        stdout, stderr = process.communicate(payload, timeout=MEASUREMENT_TIMEOUT_SECONDS)
        return subprocess.CompletedProcess(command, process.returncode, stdout, stderr)
    finally:
        deadline = time.monotonic() + 5
        try:
            job.close(deadline)
        finally:
            if process is not None:
                if process.poll() is None:
                    process.kill()
                process.wait(timeout=max(0.001, deadline - time.monotonic()))
                for stream in (process.stdin, process.stdout, process.stderr):
                    if stream is not None:
                        stream.close()


def _run_measurement_parent(value: object) -> tuple[dict[str, object], int]:
    request = parse_preflight_request(value)
    receipt = run_local_preflight(request)
    if not _preflight_passed(receipt):
        return (
            {
                "status": "fail",
                "stage": "preflight",
                "failures": list(receipt.failures),
            },
            2,
        )
    try:
        completed = _measure_process(
            (
                str(request.candidate_python.resolve(strict=True)),
                "-m",
                "benchmarks.cli",
                "_measure-worker",
            ),
            json.dumps(value, ensure_ascii=True, separators=(",", ":")),
        )
        if len(completed.stdout.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
            _fail("invalid-worker-output")
        worker_value = cast(object, json.loads(completed.stdout))
        worker_receipt = _validated_worker_receipt(worker_value, request)
    except (
        OSError,
        subprocess.SubprocessError,
        json.JSONDecodeError,
        CommandError,
    ):
        return (
            {
                "status": "fail",
                "stage": "measurement",
                "failureCode": "invalid-request",
            },
            2,
        )
    return worker_receipt, 0 if worker_receipt["status"] == "pass" else 2


def _run_measurement_worker(value: object) -> tuple[dict[str, object], int]:
    request = parse_preflight_request(value)
    receipt = run_local_preflight(request)
    if not _preflight_passed(receipt):
        return (
            {
                "status": "fail",
                "purpose": request.conditions.purpose,
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
            },
            2,
        )
    from benchmarks.execution import run_measurement_worker

    worker_receipt = run_measurement_worker(request)
    return worker_receipt, 0 if worker_receipt["status"] == "pass" else 2


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in (
        "preflight",
        "measure",
        "_measure-worker",
    ):
        print('{"status":"fail","failures":["invalid-request"]}')
        return 2
    try:
        value = _read_stdin_json()
        if sys.argv[1] == "preflight":
            receipt = run_local_preflight(parse_preflight_request(value))
            print(json.dumps(_receipt_payload(receipt), ensure_ascii=True, separators=(",", ":")))
            return 0 if receipt.eligible_for_official_run else 2
        if sys.argv[1] == "measure":
            payload, exit_code = _run_measurement_parent(value)
        else:
            payload, exit_code = _run_measurement_worker(value)
        print(json.dumps(payload, ensure_ascii=True, separators=(",", ":")))
        return exit_code
    except Exception:
        print('{"status":"fail","failures":["invalid-request"]}')
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
