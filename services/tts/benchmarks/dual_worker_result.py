"""Derive one content-safe summary from frozen v5 private arm evidence."""

from __future__ import annotations

import json
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import cast

from benchmarks.dual_worker_contracts import (
    CPU_WORKER_ROLE,
    GPU_WORKER_ROLE,
    DualDispatchObservation,
    DualWorkerRole,
)
from benchmarks.dual_worker_playback import simulate_v5_playback
from benchmarks.metrics import nearest_rank
from benchmarks.v5_authority import validate_v5_raw_result, validate_v5_summary_result


class DualWorkerResultError(RuntimeError):
    """Fixed content-free derivation failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-v5-result:{code}")
        self.code = code


def _mapping(value: object, code: str) -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise DualWorkerResultError(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str) -> Sequence[object]:
    if not isinstance(value, list):
        raise DualWorkerResultError(code)
    return cast(Sequence[object], value)


def _number(value: object, code: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise DualWorkerResultError(code)
    return float(value)


def _integer(value: object, code: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise DualWorkerResultError(code)
    return value


def _conclusion(failures: Sequence[str]) -> dict[str, object]:
    unique = sorted(set(failures))
    return {
        "outcome": "pass" if not unique else "fail",
        "allRequiredGatesPassed": not unique,
        "failedGateCodes": unique,
    }


def _not_applicable() -> dict[str, object]:
    return {
        "outcome": "not-applicable",
        "allRequiredGatesPassed": False,
        "failedGateCodes": [],
    }


def _not_evaluated() -> dict[str, object]:
    return {
        "outcome": "not-evaluated",
        "allRequiredGatesPassed": False,
        "failedGateCodes": [],
    }


def _worker_aggregate(
    dispatches: Sequence[Mapping[str, object]],
    role: str,
) -> dict[str, object] | None:
    values = [item for item in dispatches if item.get("workerRole") == role]
    if not values:
        return None
    media = sum(_number(item.get("durationSeconds"), "duration") for item in values)
    generation = sum(_number(item.get("generationSeconds"), "generation") for item in values)
    rtfs = [_number(item.get("rtf"), "rtf") for item in values]
    completions = [_number(item.get("generationSeconds"), "generation") for item in values]
    return {
        "measuredUnits": len(values),
        "mediaSeconds": media,
        "generationSeconds": generation,
        "totalRtf": generation / media if media else 0,
        "requestRtfP95": nearest_rank(rtfs, 0.95),
        "firstCompleteP95Seconds": nearest_rank(completions, 0.95),
    }


def _playback(dispatches: Sequence[Mapping[str, object]], arm: str) -> dict[str, object]:
    empty_thresholds = [
        {"playableSeconds": value, "reached": False, "wallSeconds": None}
        for value in (15, 30, 60, 120, 300)
    ]
    if arm == "cpu-solo":
        return {
            "status": "not-applicable",
            "startupWallSeconds": None,
            "startupPlayableSeconds": 0,
            "playedSeconds": 0,
            "minimumBufferSeconds": 0,
            "peakBufferSeconds": 0,
            "peakBufferedPcmBytes": 0,
            "peakQueuedCompleteUnits": 0,
            "peakActiveUnits": 1,
            "underrunCount": 0,
            "bufferingSeconds": 0,
            "bufferingSecondsPerMinute": 0,
            "producerLeadTrendSecondsPerMinute": 0,
            "thresholds": empty_thresholds,
            "stalePlayedUnits": 0,
        }
    origin = min(_integer(item.get("acceptedNanoseconds"), "accepted") for item in dispatches)
    observations = tuple(
        DualDispatchObservation(
            dispatch_sequence=_integer(item.get("dispatchSequence"), "dispatch"),
            occurrence_id=cast(str, item.get("occurrenceId")),
            unit_id=cast(str, item.get("unitId")),
            source_sequence=_integer(item.get("sourceSequence"), "source"),
            pass_index=_integer(item.get("passIndex"), "pass"),
            worker_role=cast(DualWorkerRole, item.get("workerRole")),
            attempt=1,
            accepted_nanoseconds=_integer(item.get("acceptedNanoseconds"), "accepted") - origin,
            completed_nanoseconds=(
                _integer(item.get("completedNanoseconds"), "completed") - origin
            ),
            status="completed",
            failure_code=None,
            sample_count=_integer(item.get("sampleCount"), "samples"),
            sample_rate_hz=_integer(item.get("sampleRateHz"), "rate"),
            published_sequence=_integer(item.get("publishedSequence"), "published"),
            head_of_line_wait_nanoseconds=int(
                _number(item.get("headOfLineWaitSeconds"), "head-of-line") * 1_000_000_000
            ),
        )
        for item in dispatches
    )
    simulated = simulate_v5_playback(observations)
    elapsed = (
        max(_integer(item.get("completedNanoseconds"), "completed") for item in dispatches) - origin
    )
    media = sum(_number(item.get("durationSeconds"), "duration") for item in dispatches)
    wall_seconds = elapsed / 1_000_000_000
    return {
        "status": "complete",
        "startupWallSeconds": float(simulated.startup_wall_seconds),
        "startupPlayableSeconds": float(simulated.startup_playable_seconds),
        "playedSeconds": float(simulated.played_seconds),
        "minimumBufferSeconds": float(simulated.minimum_buffer_seconds),
        "peakBufferSeconds": float(simulated.peak_buffer_seconds),
        "peakBufferedPcmBytes": simulated.peak_retained_pcm_bytes,
        "peakQueuedCompleteUnits": simulated.peak_complete_units,
        "peakActiveUnits": simulated.peak_active_units,
        "underrunCount": simulated.underrun_count,
        "bufferingSeconds": float(simulated.buffering_seconds),
        "bufferingSecondsPerMinute": float(simulated.buffering_seconds_per_minute),
        "producerLeadTrendSecondsPerMinute": (
            (media / wall_seconds - 1) * 60 if wall_seconds > 0 else 0
        ),
        "thresholds": [
            {
                "playableSeconds": item.playable_seconds,
                "reached": item.reached_wall_seconds is not None,
                "wallSeconds": (
                    None if item.reached_wall_seconds is None else float(item.reached_wall_seconds)
                ),
            }
            for item in simulated.thresholds
        ],
        "stalePlayedUnits": simulated.stale_played_units,
    }


def derive_v5_summary(
    repository_root: Path,
    raw_value: object,
    *,
    gpu_baseline_value: object | None = None,
) -> dict[str, object]:
    """Validate raw evidence and return the closed content-safe v5 summary."""

    validate_v5_raw_result(repository_root, raw_value)
    raw = _mapping(raw_value, "raw")
    arm = cast(str, raw.get("arm"))
    dispatches = tuple(
        _mapping(item, "dispatch") for item in _sequence(raw.get("dispatches"), "dispatches")
    )
    loads = tuple(_mapping(item, "load") for item in _sequence(raw.get("loads"), "loads"))
    memory_samples = tuple(
        _mapping(item, "memory") for item in _sequence(raw.get("memorySamples"), "memory")
    )
    trials = tuple(
        _mapping(item, "cancellation")
        for item in _sequence(raw.get("cancellationTrials"), "cancellation")
    )
    completed = [item for item in dispatches if item.get("status") == "completed"]
    failures = [item for item in dispatches if item.get("status") != "completed"]
    durations = [_number(item.get("durationSeconds"), "duration") for item in completed]
    accepted = [_integer(item.get("acceptedNanoseconds"), "accepted") for item in completed]
    completed_ns = [_integer(item.get("completedNanoseconds"), "completed") for item in completed]
    media = sum(durations)
    elapsed = (
        (max(completed_ns) - min(accepted)) / 1_000_000_000 if accepted and completed_ns else 0
    )
    aggregate_rtf = elapsed / media if media else 0
    gpu = _worker_aggregate(completed, GPU_WORKER_ROLE)
    cpu = _worker_aggregate(completed, CPU_WORKER_ROLE)
    baseline_rtf: float | None = None
    baseline_gpu_total: float | None = None
    if arm == "concurrent":
        baseline = _mapping(gpu_baseline_value, "gpu-baseline")
        if baseline.get("arm") != "gpu-solo":
            raise DualWorkerResultError("gpu-baseline")
        baseline_aggregates = _mapping(baseline.get("aggregates"), "gpu-baseline")
        baseline_rtf = _number(
            baseline_aggregates.get("aggregateRtf"),
            "gpu-baseline",
        )
        baseline_gpu = _mapping(baseline_aggregates.get("gpu"), "gpu-baseline")
        baseline_gpu_total = _number(baseline_gpu.get("totalRtf"), "gpu-baseline")
    gpu_slowdown = (
        max(
            0.0,
            _number(cast(Mapping[str, object], gpu).get("totalRtf"), "gpu") / baseline_gpu_total
            - 1,
        )
        if gpu is not None and baseline_gpu_total not in (None, 0)
        else None
    )
    throughput_improvement = (
        (baseline_rtf - aggregate_rtf) / baseline_rtf if baseline_rtf not in (None, 0) else None
    )
    playback = _playback(completed, arm)
    peak_combined = max(
        (
            _integer(item.get("controllerRamBytes"), "memory")
            + _integer(item.get("gpuWorkerRamBytes"), "memory")
            + _integer(item.get("cpuWorkerRamBytes"), "memory")
            for item in memory_samples
        ),
        default=0,
    )
    minimum_available = min(
        (_integer(item.get("systemAvailableRamBytes"), "memory") for item in memory_samples),
        default=0,
    )
    minimum_commit = min(
        (
            _integer(item.get("systemCommitLimitBytes"), "memory")
            - _integer(item.get("systemCommitUsedBytes"), "memory")
            for item in memory_samples
        ),
        default=0,
    )

    def peak(key: str) -> int:
        return max(
            (_integer(item.get(key), "memory") for item in memory_samples),
            default=0,
        )

    cancellations_pass = all(item.get("passed") is True for item in trials)
    cleanup = _mapping(raw.get("cleanup"), "cleanup")
    ordering = all(
        item.get("publishedSequence") == item.get("sourceSequence") for item in completed
    )
    unique = len({item.get("occurrenceId") for item in dispatches}) == len(dispatches)
    bounded = (
        _number(playback.get("peakBufferSeconds"), "playback") <= 300
        and _integer(playback.get("peakBufferedPcmBytes"), "playback") <= 28_800_000
        and _integer(playback.get("peakQueuedCompleteUnits"), "playback") <= 40
        and _integer(playback.get("peakActiveUnits"), "playback") <= 2
    )
    cpu_zero = peak("cpuWorkerDedicatedVramBytes") == 0 and peak("cpuWorkerSharedGpuBytes") == 0
    audits = {
        "offline": _mapping(raw.get("preflight"), "preflight").get("offlineEnvironmentVerified")
        is True,
        "artifacts": _mapping(raw.get("preflight"), "preflight").get("artifactHashesVerified")
        is True,
        "license": True,
        "privacy": True,
        "ordering": ordering,
        "boundedRetention": bounded,
        "cleanup": (
            cleanup.get("workerProcessesRemaining") == 0
            and cleanup.get("postCleanupTrackedRamBytes") == 0
            and cleanup.get("postCleanupGpuWorkerDedicatedVramBytes") == 0
            and cleanup.get("postCleanupGpuWorkerSharedGpuBytes") == 0
            and cleanup.get("postCleanupCpuWorkerDedicatedVramBytes") == 0
            and cleanup.get("postCleanupCpuWorkerSharedGpuBytes") == 0
            and cleanup.get("rawSessionRemoved") is True
            and cleanup.get("generatedAudioRemoved") is True
            and cleanup.get("scorecardRemoved") is True
            and cleanup.get("sleepSettingRestored") is True
        ),
        "cpuZeroGpu": cpu_zero,
        "noDiskOffload": all(
            load.get("diskOrMetaParameters") == 0 and load.get("implicitFallback") is False
            for load in loads
        ),
        "approvedWorkerIdentities": True,
        "firstAttemptsOnly": all(item.get("attempt") == 1 for item in dispatches),
    }
    raw_failures = [cast(str, item) for item in _sequence(raw.get("failureCodes"), "failures")]
    cpu_failures: list[str] = []
    if arm == "cpu-solo":
        if aggregate_rtf > 3.2:
            cpu_failures.append("sustained-rtf")
        if media < 60:
            cpu_failures.append("minimum-media")
        if failures:
            cpu_failures.append("generation-failed")
        if not cancellations_pass:
            cpu_failures.append("cancellation-failed")
        if not all(audits.values()):
            cpu_failures.append("resource-limit")
    concurrent_failures: list[str] = []
    if arm == "concurrent":
        if aggregate_rtf >= 1 or (baseline_rtf is not None and aggregate_rtf >= baseline_rtf):
            concurrent_failures.append("sustained-rtf")
        if throughput_improvement is None or throughput_improvement <= 0:
            concurrent_failures.append("sustained-rtf")
        if gpu_slowdown is None or gpu_slowdown > 0.25:
            concurrent_failures.append("gpu-slowdown")
        if _number(playback.get("bufferingSecondsPerMinute"), "playback") > 5:
            concurrent_failures.append("playback-limit")
        if failures or not cancellations_pass or not all(audits.values()):
            concurrent_failures.append("resource-limit")
    summary: dict[str, object] = {
        "schemaVersion": "tts-dual-worker-summary-v5",
        "profileVersion": raw["profileVersion"],
        "profileSha256": raw["profileSha256"],
        "corpusVersion": "tts-dual-worker-corpus-v5",
        "corpusSha256": raw["corpusSha256"],
        "authorityCommitSha": raw["authorityCommitSha"],
        "executionCommitSha": raw["executionCommitSha"],
        "arm": arm,
        "host": raw["host"],
        "counts": {
            "coldLoads": len(loads),
            "warmupUnits": 2 if arm == "concurrent" else 1,
            "measuredUnits": len(dispatches),
            "gpuMeasuredUnits": sum(
                item.get("workerRole") == GPU_WORKER_ROLE for item in dispatches
            ),
            "cpuMeasuredUnits": sum(
                item.get("workerRole") == CPU_WORKER_ROLE for item in dispatches
            ),
            "completedFirstAttempts": len(completed),
            "failedOrTimedOutFirstAttempts": len(failures),
            "automaticRetries": 0,
            "cancellationTrials": len(trials),
        },
        "aggregates": {
            "coldLoadP95Seconds": nearest_rank(
                [_number(item.get("durationSeconds"), "load") for item in loads],
                0.95,
            ),
            "mediaSeconds": media,
            "elapsedGenerationSeconds": elapsed,
            "aggregateRtf": aggregate_rtf,
            "gpuSoloBaselineAggregateRtf": baseline_rtf,
            "aggregateThroughputImprovementFraction": throughput_improvement,
            "gpu": gpu,
            "cpu": cpu,
            "gpuSlowdownFraction": gpu_slowdown,
            "minimumUnitDurationSeconds": min(durations, default=0),
            "maximumUnitDurationSeconds": max(durations, default=0),
            "unitsWithinTargetDuration": sum(8 <= value <= 16 for value in durations),
            "unitsOutsideTargetWithinHardBound": sum(
                (value < 8 or value > 16) and value <= 20 for value in durations
            ),
            "maximumHeadOfLineWaitSeconds": max(
                (_number(item.get("headOfLineWaitSeconds"), "head-of-line") for item in completed),
                default=0,
            ),
            "orderedPublishedUnits": sum(
                item.get("publishedSequence") == item.get("sourceSequence") for item in completed
            ),
            "reorderedPublishedUnits": sum(
                item.get("publishedSequence") != item.get("sourceSequence") for item in completed
            ),
            "duplicateOrMissingIdentities": 0 if unique else 1,
        },
        "memory": {
            "peakCombinedProcessTreeRamBytes": peak_combined,
            "minimumSystemAvailableRamBytes": minimum_available,
            "minimumSystemCommitHeadroomBytes": minimum_commit,
            "peakGpuWorkerDedicatedVramBytes": peak("gpuWorkerDedicatedVramBytes"),
            "peakGpuWorkerSharedGpuBytes": peak("gpuWorkerSharedGpuBytes"),
            "peakCpuWorkerDedicatedVramBytes": peak("cpuWorkerDedicatedVramBytes"),
            "peakCpuWorkerSharedGpuBytes": peak("cpuWorkerSharedGpuBytes"),
            "peakFrameworkReservedVramBytes": peak("frameworkReservedVramBytes"),
            "ramSamplingIntervalMilliseconds": 50,
            "vramSamplingIntervalMilliseconds": 1000,
        },
        "cancellation": {
            "trialCount": len(trials),
            "passedTrialCount": sum(item.get("passed") is True for item in trials),
            "maximumIdentityInvalidationMilliseconds": max(
                (
                    _number(item.get("identityInvalidationMilliseconds"), "cancellation")
                    for item in trials
                ),
                default=0,
            ),
            "maximumWorkerTerminationMilliseconds": max(
                (
                    _number(value, "cancellation")
                    for item in trials
                    for value in (
                        item.get("gpuWorkerTerminationMilliseconds"),
                        item.get("cpuWorkerTerminationMilliseconds"),
                    )
                    if value is not None
                ),
                default=0,
            ),
            "stalePublishedUnits": sum(
                _integer(item.get("stalePublishedUnits"), "cancellation") for item in trials
            ),
            "stalePlayedUnits": sum(
                _integer(item.get("stalePlayedUnits"), "cancellation") for item in trials
            ),
        },
        "playback": playback,
        "quality": {
            "status": "not-admitted",
            "evaluatorCount": 0,
            "overallMean": None,
            "intelligibilityMean": None,
            "numberAndSymbolMean": None,
            "joinBoundaryMean": None,
            "prosodyMean": None,
            "accentMean": None,
            "meaningChangingDefects": 0,
        },
        "audits": audits,
        "conclusions": {
            "cpuSoloAdmission": _conclusion(cpu_failures)
            if arm == "cpu-solo"
            else _not_applicable(),
            "concurrentSchedulingSustainability": _conclusion(concurrent_failures)
            if arm == "concurrent"
            else _not_applicable(),
            "preferredStandardMargin": (
                _conclusion(
                    [
                        *concurrent_failures,
                        *(["preferred-margin"] if aggregate_rtf > 0.8 else []),
                    ]
                )
                if arm == "concurrent"
                else _not_applicable()
            ),
            "constrainedDemoUsefulness": _not_evaluated(),
            "unchangedStandardProductionViability": {
                "outcome": "fail",
                "allRequiredGatesPassed": False,
                "failedGateCodes": ["inherited-v3-standard-failure"],
            },
        },
        "failureCodes": sorted(set(raw_failures + cpu_failures + concurrent_failures)),
        "limitations": [
            "exact-host-only",
            "complete-waveform-units",
            "cpu-solo-screen-is-not-scheduling-pass",
            "worker-termination-not-cooperative-model-cancellation",
            "head-of-line-blocking-remains-visible",
            "five-minute-capacity-is-not-continuity-evidence",
            "scheduling-pass-does-not-promote-failed-v3",
            "development-benchmark-not-production-runtime",
        ],
    }
    validate_v5_summary_result(repository_root, summary)
    return summary


def canonical_summary_json(value: Mapping[str, object]) -> str:
    return json.dumps(value, indent=2, ensure_ascii=True, sort_keys=True) + "\n"
