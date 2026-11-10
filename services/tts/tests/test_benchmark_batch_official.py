"""Model-free official v13 execution, derivation, and cleanup evidence tests."""

from __future__ import annotations

import io
import json
import subprocess
import sys
import time
from collections.abc import Sequence
from pathlib import Path
from threading import Event, Thread
from typing import Final, Literal, cast

import pytest

from benchmarks import batch_cli
from benchmarks.batch_contracts import (
    BatchAudioUnit,
    BatchBenchmarkError,
    BatchGenerationRequest,
)
from benchmarks.batch_official import (
    OfficialBatchError,
    OfficialMemoryResult,
    ThreadedOfficialMemoryMonitor,
    execute_official_v13,
)
from benchmarks.batch_result import derive_v13_summary
from benchmarks.contracts import (
    AdapterOperationError,
    AdapterPlacementEvidence,
    CancellationResponse,
    PlacementProfileId,
)
from benchmarks.memory import FrameworkVramTracker, ProcessResourceSample
from benchmarks.v4_authority import (
    CPU_PROFILE_ID,
    FULL_GPU_PROFILE_ID,
)
from benchmarks.v13_authority import validate_v13_result

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]


class _Candidate:
    def __init__(
        self,
        placement_profile_id: PlacementProfileId = FULL_GPU_PROFILE_ID,
    ) -> None:
        self._worker_pid: int | None = None
        tokenizer_device: Literal["cuda:0", "cpu"] = (
            "cpu" if placement_profile_id == CPU_PROFILE_ID else "cuda:0"
        )
        self._placement_evidence = AdapterPlacementEvidence(
            profile_id=placement_profile_id,
            autoregressive_model_device="cuda:0",
            speech_tokenizer_model_device=tokenizer_device,
            speech_tokenizer_wrapper_device=tokenizer_device,
            disk_or_meta_parameters=0,
            implicit_fallback=False,
            offload_directory_created=False,
        )

    @property
    def worker_pid(self) -> int | None:
        return self._worker_pid

    @property
    def placement_evidence(self) -> AdapterPlacementEvidence:
        return self._placement_evidence

    def load(self) -> None:
        self._worker_pid = 1

    def generate_batch(
        self,
        request: BatchGenerationRequest,
    ) -> tuple[BatchAudioUnit, ...]:
        time.sleep(0.001)
        return tuple(
            BatchAudioUnit(
                identity=request.identity,
                call_index=request.call_index,
                unit_id=unit.unit_id,
                source_sequence=unit.source_sequence,
                batch_position=position,
                sample_count=240_000,
                sample_rate_hz=24_000,
                channels=1,
                sample_format="float32",
            )
            for position, unit in enumerate(request.units)
        )

    def cancel(self, request_id: str) -> CancellationResponse:
        del request_id
        self._worker_pid = None
        return CancellationResponse(
            acknowledged=True,
            stop_mode="worker-termination",
        )

    def close(self) -> None:
        self._worker_pid = None


class _Monitor:
    def __init__(self, stop_code: str | None = None) -> None:
        self.stop_code = stop_code

    def start(self) -> None:
        return None

    def shutdown(self) -> None:
        return None

    def measure(self) -> OfficialMemoryResult:
        return OfficialMemoryResult(
            peak_process_tree_ram_bytes=4_000_000_000,
            peak_process_dedicated_vram_bytes=6_000_000_000,
            peak_framework_reserved_vram_bytes=5_900_000_000,
            minimum_free_dedicated_vram_bytes=1_000_000_000,
            peak_shared_gpu_memory_bytes=(
                80_000_000 if self.stop_code == "shared-gpu-memory" else 0
            ),
            memory_stop_code=self.stop_code,
        )

    def post_cleanup_resources(self) -> tuple[int, int]:
        return (0, 0)


def _head() -> str:
    return subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()


def _host() -> dict[str, object]:
    return {
        "operatingSystem": "Windows",
        "osVersion": "10.0.26200",
        "architecture": "x86_64",
        "pythonVersion": "3.12.10",
        "cpuModel": "Intel Core Ultra 7 255HX",
        "logicalProcessors": 32,
        "totalRamBytes": 34_000_000_000,
        "gpuModel": "NVIDIA GeForce RTX 5060 Laptop GPU",
        "totalVramBytes": 8_546_942_976,
        "driverVersion": "577.05",
    }


def _preflight() -> dict[str, object]:
    return {
        "candidateInterpreterVerified": True,
        "authorityHashesVerified": True,
        "artifactHashesVerified": True,
        "offlineEnvironmentVerified": True,
        "localFilesOnlyVerified": True,
        "outboundFirewallBlockVerified": True,
        "acPowerVerified": True,
        "sleepDisabled": True,
        "backgroundLoadAccepted": True,
        "thermalStateAccepted": True,
        "freeRamBytes": 13_000_000_000,
        "freeVramBytes": 8_174_698_496,
        "sharedGpuMemoryBytes": 0,
    }


def test_official_execution_produces_schema_valid_bounded_raw_evidence() -> None:
    execution = execute_official_v13(
        REPOSITORY_ROOT,
        execution_commit_sha=_head(),
        host=_host(),
        preflight=_preflight(),
        candidate_factory=_Candidate,
        monitor=_Monitor(),
    )
    validate_v13_result(
        REPOSITORY_ROOT,
        execution.raw,
        summary=False,
        execution_checker=lambda _execution: True,
    )
    assert len(execution.load_observations) == 5
    assert len(cast(Sequence[object], execution.raw["calls"])) == 39
    assert len(cast(Sequence[object], execution.raw["units"])) == 52
    assert execution.raw["cleanup"] == {
        "workerProcessesRemaining": 0,
        "postCleanupProcessTreeRamBytes": 0,
        "postCleanupProcessTreeVramBytes": 0,
        "rawSessionRemoved": False,
        "generatedAudioRemoved": True,
        "sleepSettingRestored": True,
    }


def test_official_derivation_is_schema_valid_and_content_safe() -> None:
    execution = execute_official_v13(
        REPOSITORY_ROOT,
        execution_commit_sha=_head(),
        host=_host(),
        preflight=_preflight(),
        candidate_factory=_Candidate,
        monitor=_Monitor(),
    )
    summary = derive_v13_summary(
        REPOSITORY_ROOT,
        execution.raw,
        list(execution.load_observations),
        raw_session_removed=True,
        execution_checker=lambda _execution: True,
    )
    validate_v13_result(
        REPOSITORY_ROOT,
        summary,
        summary=True,
        execution_checker=lambda _execution: True,
    )
    assert summary["counts"] == {
        "coldLoads": 5,
        "warmupBatchOneCalls": 2,
        "warmupBatchTwoCalls": 1,
        "measuredPasses": 3,
        "batchOneCalls": 24,
        "batchOneUnits": 24,
        "batchTwoCalls": 12,
        "batchTwoUnits": 24,
        "cancellationTrials": 5,
        "failedOrTimedOutFirstAttempts": 0,
        "automaticRetries": 0,
    }
    serialized = str(summary)
    assert "narrationText" not in serialized
    assert "privacyCanary" not in serialized


def test_official_shared_memory_stop_remains_derivable() -> None:
    execution = execute_official_v13(
        REPOSITORY_ROOT,
        execution_commit_sha=_head(),
        host=_host(),
        preflight=_preflight(),
        candidate_factory=_Candidate,
        monitor=_Monitor("shared-gpu-memory"),
    )
    summary = derive_v13_summary(
        REPOSITORY_ROOT,
        execution.raw,
        list(execution.load_observations),
        raw_session_removed=True,
        execution_checker=lambda _execution: True,
    )
    assert summary["failureCodes"]
    assert summary["memory"] == execution.raw["memory"]


def test_dcr_17_close_failure_with_zero_residue_prevents_new_trials() -> None:
    created = 0

    class CannotClose(_Candidate):
        def close(self) -> None:
            super().close()
            raise OfficialBatchError("cleanup-failed")

    def candidate_factory() -> _Candidate:
        nonlocal created
        created += 1
        return CannotClose() if created == 6 else _Candidate()

    with pytest.raises(OfficialBatchError, match="cleanup-failed") as observed:
        execute_official_v13(
            REPOSITORY_ROOT,
            execution_commit_sha=_head(),
            host=_host(),
            preflight=_preflight(),
            candidate_factory=candidate_factory,
            monitor=_Monitor(),
        )
    assert created == 6
    assert observed.value.cleanup_failures == {"candidate-close"}


def test_dcr_17_generation_failure_survives_simultaneous_close_failure() -> None:
    created = 0

    class CannotGenerateOrClose(_Candidate):
        def generate_batch(self, request: BatchGenerationRequest) -> tuple[BatchAudioUnit, ...]:
            raise BatchBenchmarkError("timeout")

        def close(self) -> None:
            super().close()
            raise RuntimeError("private cleanup text")

    def candidate_factory() -> _Candidate:
        nonlocal created
        created += 1
        return CannotGenerateOrClose() if created == 6 else _Candidate()

    with pytest.raises(OfficialBatchError, match=":timeout$") as observed:
        execute_official_v13(
            REPOSITORY_ROOT,
            execution_commit_sha=_head(),
            host=_host(),
            preflight=_preflight(),
            candidate_factory=candidate_factory,
            monitor=_Monitor(),
        )
    assert created == 6
    assert observed.value.cleanup_failures == {"candidate-close"}
    assert "private cleanup text" not in str(observed.value)


class _FixedSampler:
    def __init__(self, vram: int) -> None:
        self.vram = vram

    def sample(self, root_pid: int) -> ProcessResourceSample:
        assert root_pid == 1
        return ProcessResourceSample(10, self.vram, 0)


def _real_monitor() -> ThreadedOfficialMemoryMonitor:
    return ThreadedOfficialMemoryMonitor(
        root_pid=1,
        dedicated_sampler=_FixedSampler(10),
        shared_sampler=_FixedSampler(0),
        framework_tracker=FrameworkVramTracker(),
        free_vram_probe=lambda: 1_000_000_000,
    )


@pytest.mark.parametrize("failure_phase", ["factory", "load"])
def test_dcr_18_monitor_stops_after_factory_or_load_failure(failure_phase: str) -> None:
    monitor = _real_monitor()
    created = 0
    primary = OfficialBatchError("synthetic-primary")

    class CannotLoad(_Candidate):
        def load(self) -> None:
            super().load()
            raise primary

    def candidate_factory() -> _Candidate:
        nonlocal created
        created += 1
        if created != 6:
            return _Candidate()
        if failure_phase == "factory":
            raise primary
        return CannotLoad()

    try:
        with pytest.raises(OfficialBatchError) as observed:
            execute_official_v13(
                REPOSITORY_ROOT,
                execution_commit_sha=_head(),
                host=_host(),
                preflight=_preflight(),
                candidate_factory=candidate_factory,
                monitor=monitor,
            )
        assert observed.value is primary
        assert monitor._stop_event.is_set()
        assert monitor._thread is None
    finally:
        monitor._stop_event.set()
        if monitor._thread is not None:
            monitor._thread.join(timeout=2)
            assert not monitor._thread.is_alive()


def test_dcr_18_partial_monitor_start_and_interrupt_still_join(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monitor = _real_monitor()
    start = Thread.start

    def interrupt_after_start(thread: Thread) -> None:
        start(thread)
        if thread.name == "voxleaf-v13-official-memory":
            raise KeyboardInterrupt

    monkeypatch.setattr(Thread, "start", interrupt_after_start)
    try:
        with pytest.raises(KeyboardInterrupt):
            execute_official_v13(
                REPOSITORY_ROOT,
                execution_commit_sha=_head(),
                host=_host(),
                preflight=_preflight(),
                candidate_factory=_Candidate,
                monitor=monitor,
            )
        assert monitor._stop_event.is_set()
        assert not monitor.shutdown_pending
        monitor.shutdown()
    finally:
        monitor.shutdown()


def test_dcr_18_live_monitor_is_retained_for_exact_retry_and_bad_metrics(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monitor = _real_monitor()
    running, release = Event(), Event()

    def blocked_sample_loop() -> None:
        running.set()
        assert release.wait(5)

    monkeypatch.setattr(monitor, "_run", blocked_sample_loop)
    monkeypatch.setattr("benchmarks.batch_official.MONITOR_JOIN_SECONDS", 0.01)
    monitor.start()
    try:
        assert running.wait(5)
        thread = monitor._thread
        with pytest.raises(OfficialBatchError) as observed:
            monitor.shutdown()
        assert observed.value.cleanup_failures == {"monitor-shutdown"}
        assert thread is not None and thread.is_alive()
        assert monitor._thread is thread
    finally:
        release.set()
        if monitor._thread is not None:
            monitor._thread.join(timeout=2)
        monitor.shutdown()
    assert not monitor.shutdown_pending
    with pytest.raises(OfficialBatchError, match=":measurement$"):
        monitor.measure()
    monitor.shutdown()


def test_dcr_18_normal_monitor_covers_cancellation_window() -> None:
    events: list[str] = []

    class Monitor(_Monitor):
        def start(self) -> None:
            events.append("start")

        def shutdown(self) -> None:
            events.append("shutdown")

        def measure(self) -> OfficialMemoryResult:
            assert events[-1] == "shutdown"
            return super().measure()

    class Candidate(_Candidate):
        def cancel(self, request_id: str) -> CancellationResponse:
            assert events == ["start"] + ["cancel"] * (len(events) - 1)
            events.append("cancel")
            return super().cancel(request_id)

    execute_official_v13(
        REPOSITORY_ROOT,
        execution_commit_sha=_head(),
        host=_host(),
        preflight=_preflight(),
        candidate_factory=Candidate,
        monitor=Monitor(),
    )
    assert events == ["start", "cancel", "cancel", "cancel", "cancel", "shutdown"]


def test_dcr_18_preserves_adapter_primary_when_monitor_shutdown_also_fails(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    events: list[str] = []
    created = 0

    class FailingCandidate(_Candidate):
        def load(self) -> None:
            raise AdapterOperationError("load-failed")

        def close(self) -> None:
            events.append("close")

    class FailingMonitor(_Monitor):
        def shutdown(self) -> None:
            events.append("shutdown")
            raise OfficialBatchError("cleanup-failed", ("monitor-shutdown",))

    def candidate_factory() -> _Candidate:
        nonlocal created
        created += 1
        return FailingCandidate() if created == 6 else _Candidate()

    def run(_payload: object) -> dict[str, object]:
        execution = execute_official_v13(
            REPOSITORY_ROOT,
            execution_commit_sha=_head(),
            host=_host(),
            preflight=_preflight(),
            candidate_factory=candidate_factory,
            monitor=FailingMonitor(),
        )
        return execution.raw

    monkeypatch.setattr(sys, "argv", ["batch_cli.py", "run"])
    monkeypatch.setattr(sys, "stdin", io.StringIO())
    monkeypatch.setattr(batch_cli, "_payload", dict)
    monkeypatch.setattr(batch_cli, "_run", run)
    assert batch_cli.main() == 2
    assert events == ["close", "shutdown"]
    assert json.loads(capsys.readouterr().out) == {
        "schemaVersion": "tts-v13-batch-official-receipt-v1",
        "resultPurpose": "official",
        "status": "fail",
        "eligibleForDerivation": False,
        "failureCode": "load-failed",
        "cleanupFailureCodes": ["monitor-shutdown"],
    }
