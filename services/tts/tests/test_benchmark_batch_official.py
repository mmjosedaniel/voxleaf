"""Model-free official v4 execution, derivation, and cleanup evidence tests."""

from __future__ import annotations

import subprocess
import time
from collections.abc import Sequence
from pathlib import Path
from typing import Final, cast

from benchmarks.batch_contracts import (
    BatchAudioUnit,
    BatchGenerationRequest,
)
from benchmarks.batch_official import (
    OfficialMemoryResult,
    execute_official_v4,
)
from benchmarks.batch_result import derive_v4_summary
from benchmarks.contracts import CancellationResponse
from benchmarks.v4_authority import validate_v4_result

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]


class _Candidate:
    def __init__(self) -> None:
        self._worker_pid: int | None = None

    @property
    def worker_pid(self) -> int | None:
        return self._worker_pid

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
    stop_code: str | None = None

    def start(self) -> None:
        return None

    def stop(self) -> OfficialMemoryResult:
        return OfficialMemoryResult(
            peak_process_tree_ram_bytes=4_000_000_000,
            peak_process_dedicated_vram_bytes=6_000_000_000,
            peak_framework_reserved_vram_bytes=5_900_000_000,
            minimum_free_dedicated_vram_bytes=1_000_000_000,
            peak_shared_gpu_memory_bytes=0,
            memory_stop_code=None,
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
    execution = execute_official_v4(
        REPOSITORY_ROOT,
        execution_commit_sha=_head(),
        host=_host(),
        preflight=_preflight(),
        candidate_factory=_Candidate,
        monitor=_Monitor(),
    )
    validate_v4_result(
        REPOSITORY_ROOT,
        execution.raw,
        summary=False,
        ancestry_checker=lambda _authority, _execution: True,
    )
    assert len(execution.load_observations) == 5
    assert len(cast(Sequence[object], execution.raw["calls"])) == 39
    assert len(cast(Sequence[object], execution.raw["units"])) == 52
    assert execution.raw["cleanup"] == {
        "workerProcessesRemaining": 0,
        "postCleanupProcessTreeRamBytes": 0,
        "postCleanupProcessTreeVramBytes": 0,
        "rawSessionRemoved": True,
        "generatedAudioRemoved": True,
        "sleepSettingRestored": True,
    }


def test_official_derivation_is_schema_valid_and_content_safe() -> None:
    execution = execute_official_v4(
        REPOSITORY_ROOT,
        execution_commit_sha=_head(),
        host=_host(),
        preflight=_preflight(),
        candidate_factory=_Candidate,
        monitor=_Monitor(),
    )
    summary = derive_v4_summary(
        REPOSITORY_ROOT,
        execution.raw,
        list(execution.load_observations),
        ancestry_checker=lambda _authority, _execution: True,
    )
    validate_v4_result(
        REPOSITORY_ROOT,
        summary,
        summary=True,
        ancestry_checker=lambda _authority, _execution: True,
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
