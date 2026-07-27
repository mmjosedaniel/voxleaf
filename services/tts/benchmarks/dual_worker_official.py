"""Hardware-backed private evidence capture for the frozen v5 worker arms."""

from __future__ import annotations

import ctypes
import json
import os
import shutil
import threading
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Final

from benchmarks.contracts import AdapterPlacementEvidence
from benchmarks.dual_worker_contracts import (
    CPU_WORKER_ROLE,
    GPU_WORKER_ROLE,
    DualControllerObservation,
    DualUnitRequest,
    DualWorkerArm,
    DualWorkerBenchmarkError,
    DualWorkerRole,
)
from benchmarks.dual_worker_controller import BoundedDualWorkerController
from benchmarks.dual_worker_runtime import ThreadedDualWorkerRuntime
from benchmarks.memory import (
    GPU_PROCESS_SHARED_MEMORY_COUNTER,
    WindowsGpuProcessMemorySampler,
    WindowsProcessResourceSampler,
)

GIB: Final = 1024**3
RAM_SAMPLE_SECONDS: Final = 0.05
MAXIMUM_COMBINED_RAM_BYTES: Final = 20 * GIB
MINIMUM_AVAILABLE_RAM_BYTES: Final = 4 * GIB
MINIMUM_COMMIT_HEADROOM_BYTES: Final = 4 * GIB
MAXIMUM_GPU_DEDICATED_BYTES: Final = 7_637_827_584
MAXIMUM_GPU_SHARED_BYTES: Final = 128 * 1024**2
MAXIMUM_ARM_SECONDS: Final = 3_600.0


class _MemoryStatusEx(ctypes.Structure):
    _fields_ = (
        ("dwLength", ctypes.c_ulong),
        ("dwMemoryLoad", ctypes.c_ulong),
        ("ullTotalPhys", ctypes.c_ulonglong),
        ("ullAvailPhys", ctypes.c_ulonglong),
        ("ullTotalPageFile", ctypes.c_ulonglong),
        ("ullAvailPageFile", ctypes.c_ulonglong),
        ("ullTotalVirtual", ctypes.c_ulonglong),
        ("ullAvailVirtual", ctypes.c_ulonglong),
        ("ullAvailExtendedVirtual", ctypes.c_ulonglong),
    )


def windows_system_memory() -> tuple[int, int, int]:
    """Return available RAM, commit used, and commit limit."""

    if os.name != "nt":
        raise DualWorkerBenchmarkError("resource-limit")
    status = _MemoryStatusEx()
    status.dwLength = ctypes.sizeof(_MemoryStatusEx)
    kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    if not kernel32.GlobalMemoryStatusEx(ctypes.byref(status)):
        raise DualWorkerBenchmarkError("resource-limit")
    commit_limit = int(status.ullTotalPageFile)
    commit_used = commit_limit - int(status.ullAvailPageFile)
    return int(status.ullAvailPhys), commit_used, commit_limit


@dataclass(frozen=True)
class MonitorResult:
    samples: tuple[dict[str, int], ...]
    stop_code: str | None


class DualWorkerOfficialError(RuntimeError):
    """Content-free official telemetry or safety-stop failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-v5-official:{code}")
        self.code = code


class DualWorkerMemoryMonitor:
    """Sample exact worker PIDs and fail closed on the frozen live ceilings."""

    def __init__(
        self,
        runtime: ThreadedDualWorkerRuntime,
        roles: tuple[DualWorkerRole, ...],
    ) -> None:
        self._runtime = runtime
        self._roles = roles
        self._process = WindowsProcessResourceSampler()
        self._dedicated = WindowsGpuProcessMemorySampler()
        self._shared = WindowsGpuProcessMemorySampler(
            GPU_PROCESS_SHARED_MEMORY_COUNTER,
        )
        self._samples: list[dict[str, int]] = []
        self._stop_code: str | None = None
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None
        self._failed = False

    @property
    def stop_code(self) -> str | None:
        return self._stop_code

    def _pid(self, role: DualWorkerRole) -> int | None:
        return self._runtime.worker_pid(role) if role in self._roles else None

    def _gpu_bytes(self, sampler: WindowsGpuProcessMemorySampler, pid: int | None) -> int:
        value, _allocating = sampler.sample(frozenset() if pid is None else frozenset((pid,)))
        if value is None:
            raise DualWorkerBenchmarkError("resource-limit")
        return value

    def sample_once(self) -> None:
        available, commit_used, commit_limit = windows_system_memory()
        gpu_pid = self._pid(GPU_WORKER_ROLE)
        cpu_pid = self._pid(CPU_WORKER_ROLE)
        gpu_dedicated = self._gpu_bytes(self._dedicated, gpu_pid)
        gpu_shared = self._gpu_bytes(self._shared, gpu_pid)
        cpu_dedicated = self._gpu_bytes(self._dedicated, cpu_pid)
        cpu_shared = self._gpu_bytes(self._shared, cpu_pid)
        controller_ram = self._process.process_working_set_bytes(os.getpid())
        gpu_ram = 0 if gpu_pid is None else self._process.process_working_set_bytes(gpu_pid)
        cpu_ram = 0 if cpu_pid is None else self._process.process_working_set_bytes(cpu_pid)
        if (
            controller_ram <= 0
            or (gpu_pid is not None and gpu_ram <= 0)
            or (cpu_pid is not None and cpu_ram <= 0)
        ):
            raise DualWorkerBenchmarkError("resource-limit")
        framework = (
            self._runtime.framework_memory_high_water_bytes(GPU_WORKER_ROLE) or 0
            if GPU_WORKER_ROLE in self._roles
            else 0
        )
        sample = {
            "timestampNanoseconds": time.perf_counter_ns(),
            "systemAvailableRamBytes": available,
            "systemCommitUsedBytes": commit_used,
            "systemCommitLimitBytes": commit_limit,
            "controllerRamBytes": controller_ram,
            "gpuWorkerRamBytes": gpu_ram,
            "cpuWorkerRamBytes": cpu_ram,
            "gpuWorkerDedicatedVramBytes": gpu_dedicated,
            "gpuWorkerSharedGpuBytes": gpu_shared,
            "cpuWorkerDedicatedVramBytes": cpu_dedicated,
            "cpuWorkerSharedGpuBytes": cpu_shared,
            "frameworkReservedVramBytes": framework,
        }
        self._samples.append(sample)
        combined = controller_ram + gpu_ram + cpu_ram
        commit_headroom = commit_limit - commit_used
        if cpu_dedicated or cpu_shared:
            self._stop_code = "cpu-gpu-allocation"
        elif gpu_shared > MAXIMUM_GPU_SHARED_BYTES:
            self._stop_code = "gpu-shared-memory"
        elif max(gpu_dedicated, framework) > MAXIMUM_GPU_DEDICATED_BYTES:
            self._stop_code = "gpu-vram-safety"
        elif combined > MAXIMUM_COMBINED_RAM_BYTES or available < MINIMUM_AVAILABLE_RAM_BYTES:
            self._stop_code = "ram-safety"
        elif commit_headroom < MINIMUM_COMMIT_HEADROOM_BYTES:
            self._stop_code = "commit-headroom"

    def _run(self) -> None:
        while not self._stop.wait(RAM_SAMPLE_SECONDS):
            try:
                self.sample_once()
            except Exception:
                self._failed = True
                self._stop_code = "resource-limit"
                return

    def start(self) -> None:
        self.sample_once()
        self._thread = threading.Thread(
            target=self._run,
            name="voxleaf-v5-memory",
            daemon=True,
        )
        self._thread.start()

    def finish(self) -> MonitorResult:
        try:
            self.sample_once()
        except Exception:
            self._failed = True
            self._stop_code = "resource-limit"
        self._stop.set()
        thread = self._thread
        if thread is not None:
            thread.join(timeout=1)
        self._dedicated.close()
        self._shared.close()
        if self._failed or not self._samples:
            raise DualWorkerBenchmarkError("resource-limit")
        return MonitorResult(tuple(self._samples), self._stop_code)


def placement_load(
    role: DualWorkerRole,
    index: int,
    duration_seconds: float,
    evidence: AdapterPlacementEvidence | None,
    dedicated_bytes: int,
    shared_bytes: int,
) -> dict[str, object]:
    """Serialize one content-safe cold-load observation."""

    if evidence is None:
        raise DualWorkerBenchmarkError("resource-limit")
    return {
        "workerRole": role,
        "observationIndex": index,
        "durationSeconds": duration_seconds,
        "status": "completed",
        "failureCode": None,
        "device": evidence.autoregressive_model_device,
        "dtype": "float32" if role == CPU_WORKER_ROLE else "bfloat16",
        "intraOpThreads": evidence.intra_op_threads or 0,
        "interopThreads": evidence.interop_threads or 0,
        "cudaAvailable": evidence.cuda_available,
        "cudaDeviceCount": evidence.cuda_device_count,
        "diskOrMetaParameters": evidence.disk_or_meta_parameters,
        "implicitFallback": evidence.implicit_fallback,
        "dedicatedGpuBytes": dedicated_bytes,
        "sharedGpuBytes": shared_bytes,
    }


def serialize_dispatches(
    observation: DualControllerObservation,
) -> list[dict[str, object]]:
    result: list[dict[str, object]] = []
    for dispatch in observation.dispatches:
        duration = (
            dispatch.sample_count / dispatch.sample_rate_hz
            if dispatch.sample_count is not None and dispatch.sample_rate_hz
            else None
        )
        generation = (
            (dispatch.completed_nanoseconds - dispatch.accepted_nanoseconds) / 1_000_000_000
            if dispatch.completed_nanoseconds is not None
            else None
        )
        result.append(
            {
                "dispatchSequence": dispatch.dispatch_sequence,
                "occurrenceId": dispatch.occurrence_id,
                "unitId": dispatch.unit_id,
                "sourceSequence": dispatch.source_sequence,
                "passIndex": dispatch.pass_index,
                "workerRole": dispatch.worker_role,
                "attempt": dispatch.attempt,
                "acceptedNanoseconds": dispatch.accepted_nanoseconds,
                "completedNanoseconds": dispatch.completed_nanoseconds,
                "status": dispatch.status,
                "failureCode": dispatch.failure_code,
                "sampleCount": dispatch.sample_count,
                "sampleRateHz": dispatch.sample_rate_hz,
                "durationSeconds": duration,
                "generationSeconds": generation,
                "rtf": (
                    generation / duration
                    if generation is not None and duration is not None and duration > 0
                    else None
                ),
                "publishedSequence": dispatch.published_sequence,
                "headOfLineWaitSeconds": (
                    dispatch.head_of_line_wait_nanoseconds / 1_000_000_000
                    if dispatch.head_of_line_wait_nanoseconds is not None
                    else None
                ),
            }
        )
    return result


def run_measured_arm(
    *,
    arm: DualWorkerArm,
    runtime: ThreadedDualWorkerRuntime,
    requests: tuple[DualUnitRequest, ...],
) -> tuple[DualControllerObservation, MonitorResult]:
    controller = BoundedDualWorkerController()
    monitor = DualWorkerMemoryMonitor(runtime, tuple(worker.role for worker in runtime.workers))
    started = time.perf_counter()
    monitor.start()

    def reject_live_stop(_completion: object) -> None:
        if monitor.stop_code is not None:
            raise DualWorkerOfficialError(monitor.stop_code)

    try:
        observation = controller.run(
            arm=arm,
            runtime=runtime,
            requests=requests,
            before_ordered_release=reject_live_stop,
        )
        if time.perf_counter() - started > MAXIMUM_ARM_SECONDS:
            raise DualWorkerBenchmarkError("timeout")
    finally:
        result = monitor.finish()
    if result.stop_code is not None:
        raise DualWorkerOfficialError(result.stop_code)
    return observation, result


def official_raw_root(repository_root: Path, session_id: str) -> Path:
    root = (repository_root / "benchmarks/results/raw/dual-worker-v5").resolve()
    session = (root / session_id).resolve()
    if session.parent != root:
        raise DualWorkerBenchmarkError("resource-limit")
    return session


def write_private_raw(repository_root: Path, session_id: str, raw: dict[str, object]) -> None:
    session = official_raw_root(repository_root, session_id)
    if session.exists():
        raise DualWorkerBenchmarkError("resource-limit")
    session.mkdir(parents=True)
    try:
        (session / "raw.json").write_text(
            json.dumps(raw, ensure_ascii=True, separators=(",", ":")),
            encoding="utf-8",
        )
    except Exception:
        shutil.rmtree(session, ignore_errors=True)
        raise


def delete_private_raw(repository_root: Path, session_id: str) -> None:
    session = official_raw_root(repository_root, session_id)
    if session.exists():
        shutil.rmtree(session)
