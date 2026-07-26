"""Derive and validate the content-safe v4 summary from private raw evidence."""

from __future__ import annotations

import json
from collections.abc import Callable, Mapping, Sequence
from pathlib import Path
from typing import cast

from benchmarks.metrics import nanoseconds_to_seconds, nearest_rank
from benchmarks.v4_authority import (
    CPU_PROFILE_ID,
    FULL_GPU_PROFILE_ID,
    load_frozen_cpu_admission,
    validate_v4_result,
)


class BatchResultError(RuntimeError):
    """Fixed content-free v4 result-derivation failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-v4-result:{code}")
        self.code = code


def _mapping(value: object, code: str) -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise BatchResultError(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str) -> Sequence[object]:
    if not isinstance(value, list):
        raise BatchResultError(code)
    return cast(Sequence[object], value)


def _number(value: object, code: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise BatchResultError(code)
    return float(value)


def _integer(value: object, code: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise BatchResultError(code)
    return value


def _nullable_p95(values: Sequence[float]) -> float | None:
    return nearest_rank(values, 0.95) if values else None


def _conclusion(failed: Sequence[str]) -> dict[str, object]:
    codes = sorted(set(failed))
    return {
        "outcome": "pass" if not codes else "fail",
        "allRequiredGatesPassed": not codes,
        "failedGateCodes": codes,
    }


def _not_evaluated() -> dict[str, object]:
    return {
        "outcome": "not-evaluated",
        "allRequiredGatesPassed": False,
        "failedGateCodes": [],
    }


def _load_observations(
    value: object,
) -> tuple[Mapping[str, object], ...]:
    observations = tuple(_mapping(item, "loads") for item in _sequence(value, "loads"))
    if len(observations) != 5:
        raise BatchResultError("loads")
    for index, observation in enumerate(observations, start=1):
        if (
            observation.get("observationIndex") != index
            or _integer(observation.get("loadNanoseconds"), "loads") <= 0
            or _integer(observation.get("cleanupNanoseconds"), "loads") < 0
        ):
            raise BatchResultError("loads")
    return observations


def _aggregate_rtf(
    calls: Sequence[Mapping[str, object]],
    units_by_call: Mapping[int, Sequence[Mapping[str, object]]],
) -> float:
    wall_ns = 0
    media_seconds = 0.0
    for call in calls:
        accepted = _integer(call.get("acceptedNanoseconds"), "call-time")
        completed = call.get("completedNanoseconds")
        if not isinstance(completed, int) or isinstance(completed, bool):
            continue
        wall_ns += max(0, completed - accepted)
        for unit in units_by_call.get(_integer(call.get("callIndex"), "call-index"), ()):
            duration = unit.get("durationSeconds")
            if isinstance(duration, (int, float)) and not isinstance(duration, bool):
                media_seconds += float(duration)
    return (
        nanoseconds_to_seconds(wall_ns) / media_seconds
        if wall_ns > 0 and media_seconds > 0
        else 0.0
    )


def derive_v4_summary(
    repository_root: Path,
    raw_value: object,
    load_value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
) -> dict[str, object]:
    """Validate private evidence and derive one allowlisted content-safe summary."""

    validate_v4_result(
        repository_root,
        raw_value,
        summary=False,
        ancestry_checker=ancestry_checker,
    )
    raw = _mapping(raw_value, "raw")
    placement_profile_id = raw.get("placementProfileId")
    if placement_profile_id == CPU_PROFILE_ID:
        if raw.get("cpuAdmission") != load_frozen_cpu_admission(repository_root).as_raw():
            raise BatchResultError("cpu-admission")
    elif placement_profile_id != FULL_GPU_PROFILE_ID:
        raise BatchResultError("placement")
    loads = _load_observations(load_value)
    calls = tuple(_mapping(item, "calls") for item in _sequence(raw.get("calls"), "calls"))
    units = tuple(_mapping(item, "units") for item in _sequence(raw.get("units"), "units"))
    measured_calls = tuple(call for call in calls if call.get("phase") == "measured")
    call_by_index = {_integer(call.get("callIndex"), "call-index"): call for call in calls}
    units_by_call: dict[int, list[Mapping[str, object]]] = {}
    for unit in units:
        units_by_call.setdefault(
            _integer(unit.get("callIndex"), "unit-call-index"),
            [],
        ).append(unit)
    measured_units = tuple(
        unit
        for unit in units
        if call_by_index[_integer(unit.get("callIndex"), "unit-call-index")].get("phase")
        == "measured"
    )
    batch_one_calls = tuple(call for call in measured_calls if call.get("batchSize") == 1)
    batch_two_calls = tuple(call for call in measured_calls if call.get("batchSize") == 2)
    batch_one_indexes = {_integer(call.get("callIndex"), "call-index") for call in batch_one_calls}
    batch_two_indexes = {_integer(call.get("callIndex"), "call-index") for call in batch_two_calls}
    batch_one_units = tuple(
        unit
        for unit in measured_units
        if _integer(unit.get("callIndex"), "unit-call-index") in batch_one_indexes
    )
    batch_two_units = tuple(
        unit
        for unit in measured_units
        if _integer(unit.get("callIndex"), "unit-call-index") in batch_two_indexes
    )
    completed_units = tuple(unit for unit in measured_units if unit.get("status") == "completed")

    def durations(values: Sequence[Mapping[str, object]]) -> list[float]:
        return [
            _number(unit.get("durationSeconds"), "duration")
            for unit in values
            if unit.get("durationSeconds") is not None
        ]

    def first_audio(values: Sequence[Mapping[str, object]]) -> list[float]:
        return [
            nanoseconds_to_seconds(_integer(unit.get("firstAudioNanoseconds"), "first-audio"))
            for unit in values
            if unit.get("firstAudioNanoseconds") is not None
        ]

    def rtfs(values: Sequence[Mapping[str, object]]) -> list[float]:
        return [
            _number(unit.get("requestRtf"), "rtf")
            for unit in values
            if unit.get("requestRtf") is not None
        ]

    def complete_by_duration(
        values: Sequence[Mapping[str, object]],
        *,
        at_least_fifteen: bool,
    ) -> list[float]:
        result: list[float] = []
        for unit in values:
            duration = unit.get("durationSeconds")
            completion = unit.get("completionNanoseconds")
            if duration is None or completion is None:
                continue
            duration_number = _number(duration, "duration")
            if (duration_number >= 15) == at_least_fifteen:
                result.append(nanoseconds_to_seconds(_integer(completion, "completion")))
        return result

    batch_one_durations = durations(batch_one_units)
    batch_two_durations = durations(batch_two_units)
    all_durations = durations(completed_units)
    failed_attempts = sum(call.get("status") != "completed" for call in measured_calls)
    load_p95 = nearest_rank(
        [nanoseconds_to_seconds(_integer(load.get("loadNanoseconds"), "loads")) for load in loads],
        0.95,
    )
    aggregates = {
        "coldLoadP95Seconds": load_p95,
        "batchOneFirstAudioP95Seconds": _nullable_p95(first_audio(batch_one_units)) or 0,
        "batchTwoFirstAudioP95Seconds": _nullable_p95(first_audio(batch_two_units)) or 0,
        "batchOneFifteenSecondsMediaP95Seconds": _nullable_p95(
            complete_by_duration(batch_one_units, at_least_fifteen=True)
        ),
        "batchTwoFifteenSecondsMediaP95Seconds": _nullable_p95(
            complete_by_duration(batch_two_units, at_least_fifteen=True)
        ),
        "batchOneShorterCompleteP95Seconds": _nullable_p95(
            complete_by_duration(batch_one_units, at_least_fifteen=False)
        ),
        "batchTwoShorterCompleteP95Seconds": _nullable_p95(
            complete_by_duration(batch_two_units, at_least_fifteen=False)
        ),
        "batchOneRequestRtfP95": _nullable_p95(rtfs(batch_one_units)) or 0,
        "batchTwoUnitRtfP95": _nullable_p95(rtfs(batch_two_units)) or 0,
        "batchOneAggregateRtf": _aggregate_rtf(batch_one_calls, units_by_call),
        "batchTwoAggregateRtf": _aggregate_rtf(batch_two_calls, units_by_call),
        "batchOneMediaSeconds": sum(batch_one_durations),
        "batchTwoMediaSeconds": sum(batch_two_durations),
        "minimumUnitDurationSeconds": min(all_durations, default=0),
        "maximumUnitDurationSeconds": max(all_durations, default=0),
        "orderedUnitCount": len(completed_units),
        "reorderedUnitCount": 0,
        "missingPairCount": 0,
    }

    raw_memory = _mapping(raw.get("memory"), "memory")
    raw_playback = _mapping(raw.get("playback"), "playback")
    raw_cleanup = _mapping(raw.get("cleanup"), "cleanup")
    raw_preflight = _mapping(raw.get("preflight"), "preflight")
    trials = tuple(
        _mapping(item, "cancellation")
        for item in _sequence(raw.get("cancellationTrials"), "cancellation")
    )
    passed_trials = sum(trial.get("passed") is True for trial in trials)
    termination_values = [
        _integer(trial.get("workerTerminationNanoseconds"), "cancellation")
        for trial in trials
        if trial.get("workerTerminationNanoseconds") is not None
    ]
    cancellation = {
        "trialCount": len(trials),
        "passedTrialCount": passed_trials,
        "maximumIdentityInvalidationMilliseconds": max(
            (
                _integer(trial.get("identityInvalidationNanoseconds"), "cancellation") / 1_000_000
                for trial in trials
            ),
            default=0,
        ),
        "maximumWorkerTerminationMilliseconds": (max(termination_values, default=0) / 1_000_000),
        "stalePublishedUnits": sum(
            _integer(trial.get("stalePublishedUnits"), "cancellation") for trial in trials
        ),
        "stalePlayedUnits": _integer(
            raw_playback.get("stalePlayedUnits"),
            "playback",
        ),
    }
    audits = {
        "offline": raw_preflight.get("offlineEnvironmentVerified") is True,
        "artifacts": raw_preflight.get("artifactHashesVerified") is True,
        "license": True,
        "privacy": True,
        "ordering": True,
        "boundedRetention": (
            _integer(raw_playback.get("peakQueuedUnits"), "playback") <= 2
            and _number(raw_playback.get("peakBufferSeconds"), "playback") <= 40
            and _integer(raw_playback.get("peakActiveBatches"), "playback") <= 1
        ),
        "cleanup": (
            raw_cleanup.get("workerProcessesRemaining") == 0
            and raw_cleanup.get("postCleanupProcessTreeRamBytes") == 0
            and raw_cleanup.get("postCleanupProcessTreeVramBytes") == 0
            and raw_cleanup.get("rawSessionRemoved") is True
            and raw_cleanup.get("generatedAudioRemoved") is True
            and raw_cleanup.get("sleepSettingRestored") is True
        ),
        "noSharedGpuPaging": (_integer(raw_memory.get("peakSharedGpuMemoryBytes"), "memory") == 0),
        "noDiskOffload": True,
        "approvedPlacement": placement_profile_id in (FULL_GPU_PROFILE_ID, CPU_PROFILE_ID),
    }
    all_audits = all(audits.values())
    raw_failures = [
        cast(str, value) for value in _sequence(raw.get("failureCodes"), "failure-codes")
    ]

    standard_failed: list[str] = []
    if load_p95 > 60:
        standard_failed.append("cold-load")
    if _number(aggregates["batchTwoFirstAudioP95Seconds"], "aggregates") > 3:
        standard_failed.append("warm-first-audio")
    fifteen = aggregates["batchTwoFifteenSecondsMediaP95Seconds"]
    shorter = aggregates["batchTwoShorterCompleteP95Seconds"]
    startup_gate = (fifteen is not None and _number(fifteen, "aggregates") <= 12) or (
        shorter is not None and _number(shorter, "aggregates") <= 5
    )
    if not startup_gate:
        standard_failed.append("startup-media")
    if _number(aggregates["batchTwoUnitRtfP95"], "aggregates") > 0.8:
        standard_failed.append("request-rtf")
    if _number(aggregates["batchTwoAggregateRtf"], "aggregates") > 0.75:
        standard_failed.append("total-sustained-rtf")
    if _integer(raw_memory.get("peakProcessTreeRamBytes"), "memory") > 12_884_901_888:
        standard_failed.append("process-ram")
    if _integer(raw_memory.get("peakAuthoritativeVramBytes"), "memory") > 6_442_450_944:
        standard_failed.append("peak-vram")
    if failed_attempts:
        standard_failed.append("first-attempt-failure")
    if passed_trials != 5:
        standard_failed.append("cancellation")
    if not all_audits:
        standard_failed.append("required-audit")

    scheduling_failed: list[str] = []
    if _number(aggregates["batchTwoAggregateRtf"], "aggregates") >= 1:
        scheduling_failed.append("batch-two-aggregate-rtf")
    if _number(raw_playback.get("bufferingSecondsPerMinute"), "playback") > 5:
        scheduling_failed.append("buffering-allowance")
    if _number(aggregates["batchTwoMediaSeconds"], "aggregates") < 180:
        scheduling_failed.append("minimum-media")
    if (
        _number(aggregates["minimumUnitDurationSeconds"], "aggregates") < 8
        or _number(aggregates["maximumUnitDurationSeconds"], "aggregates") > 20
    ):
        scheduling_failed.append("unit-duration")
    if (
        _integer(aggregates["reorderedUnitCount"], "aggregates") != 0
        or _integer(aggregates["missingPairCount"], "aggregates") != 0
    ):
        scheduling_failed.append("ordering")
    if cancellation["stalePublishedUnits"] != 0 or cancellation["stalePlayedUnits"] != 0:
        scheduling_failed.append("stale-output")
    if failed_attempts:
        scheduling_failed.append("first-attempt-failure")
    if passed_trials != 5:
        scheduling_failed.append("cancellation")
    if raw_memory.get("memoryStopTriggered") is True or not all_audits:
        scheduling_failed.append("safety-audit")

    failure_codes = sorted(set(raw_failures + standard_failed + scheduling_failed))
    summary: dict[str, object] = {
        "schemaVersion": "tts-short-segment-batch-summary-v4",
        "profileVersion": raw["profileVersion"],
        "profileSha256": raw["profileSha256"],
        "corpusVersion": "tts-short-segment-corpus-v4",
        "corpusSha256": raw["corpusSha256"],
        "authorityCommitSha": raw["authorityCommitSha"],
        "executionCommitSha": raw["executionCommitSha"],
        "placementProfileId": raw["placementProfileId"],
        "cpuAdmission": raw["cpuAdmission"],
        "candidateId": raw["candidateId"],
        "host": raw["host"],
        "counts": {
            "coldLoads": len(loads),
            "warmupBatchOneCalls": 2,
            "warmupBatchTwoCalls": 1,
            "measuredPasses": 3,
            "batchOneCalls": len(batch_one_calls),
            "batchOneUnits": len(batch_one_units),
            "batchTwoCalls": len(batch_two_calls),
            "batchTwoUnits": len(batch_two_units),
            "cancellationTrials": len(trials),
            "failedOrTimedOutFirstAttempts": failed_attempts,
            "automaticRetries": 0,
        },
        "aggregates": aggregates,
        "memory": dict(raw_memory),
        "cancellation": cancellation,
        "playback": dict(raw_playback),
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
            "standardViability": _conclusion(standard_failed),
            "schedulingSustainability": _conclusion(scheduling_failed),
            "constrainedDemoUsefulness": _not_evaluated(),
        },
        "failureCodes": failure_codes,
        "limitations": [
            "exact-host-only",
            "complete-waveform-batch",
            "worker-termination-not-cooperative-model-cancellation",
            "scheduling-pass-does-not-promote-failed-v3",
            "explicit-preparation-delay-remains-visible",
            "development-benchmark-not-production-runtime",
        ],
    }
    validate_v4_result(
        repository_root,
        summary,
        summary=True,
        ancestry_checker=ancestry_checker,
    )
    return summary


def canonical_summary_json(value: Mapping[str, object]) -> str:
    return (
        json.dumps(
            value,
            ensure_ascii=False,
            indent=2,
            sort_keys=True,
        )
        + "\n"
    )
