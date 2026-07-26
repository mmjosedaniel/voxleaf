"""Model-free enforcement for the frozen short-segment batch v4 authority."""

from __future__ import annotations

import copy
import hashlib
import json
from collections.abc import Mapping
from pathlib import Path
from typing import Final, cast

import pytest

from benchmarks.v4_authority import (
    AUTHORITY_COMMIT_SHA,
    CORPUS_SHA256,
    CPU_PROFILE_ID,
    FULL_GPU_PROFILE_ID,
    PROFILE_SHA256,
    RAW_SCHEMA_SHA256,
    SUMMARY_SCHEMA_SHA256,
    V4AuthorityError,
    load_frozen_v4_authority,
    validate_v4_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]


def _sha256(path: str) -> str:
    return hashlib.sha256((REPOSITORY_ROOT / path).read_bytes()).hexdigest()


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


def _cpu_admission(profile_id: str) -> dict[str, object]:
    if profile_id == FULL_GPU_PROFILE_ID:
        return {
            "status": "not-applicable",
            "fullGpuMemoryStopCode": None,
            "fullGpuResultSha256": None,
        }
    return {
        "status": "admitted",
        "fullGpuMemoryStopCode": "vram-safety-ceiling",
        "fullGpuResultSha256": "1" * 64,
    }


def _call(
    call_index: int,
    phase: str,
    pass_index: int | None,
    pair_id: str,
    batch_size: int,
    unit_ids: list[str],
) -> dict[str, object]:
    return {
        "callIndex": call_index,
        "phase": phase,
        "passIndex": pass_index,
        "pairId": pair_id,
        "batchSize": batch_size,
        "unitIds": unit_ids,
        "attempt": 1,
        "acceptedNanoseconds": 1,
        "completedNanoseconds": 10_000_000_001,
        "status": "completed",
        "failureCode": None,
    }


def _raw_fixture(profile_id: str = FULL_GPU_PROFILE_ID) -> dict[str, object]:
    authority = load_frozen_v4_authority(REPOSITORY_ROOT)
    profile = authority.profile
    input_authority = cast(Mapping[str, object], profile["inputAuthority"])
    execution = cast(Mapping[str, object], profile["executionPolicy"])
    pairs = cast(list[list[str]], input_authority["pairOrder"])
    pair_ids = [f"es-v4-pair-{index:02d}" for index in range(1, 5)]
    pass_orders = cast(list[list[int]], execution["passBatchOrder"])

    calls: list[dict[str, object]] = [
        _call(0, "warmup", None, pair_ids[0], 1, [pairs[0][0]]),
        _call(1, "warmup", None, pair_ids[0], 1, [pairs[0][1]]),
        _call(2, "warmup", None, pair_ids[0], 2, list(pairs[0])),
    ]
    for pass_index, batch_order in enumerate(pass_orders, start=1):
        for batch_size in batch_order:
            for pair_id, pair in zip(pair_ids, pairs, strict=True):
                if batch_size == 1:
                    for unit_id in pair:
                        calls.append(
                            _call(
                                len(calls),
                                "measured",
                                pass_index,
                                pair_id,
                                1,
                                [unit_id],
                            )
                        )
                else:
                    calls.append(
                        _call(
                            len(calls),
                            "measured",
                            pass_index,
                            pair_id,
                            2,
                            list(pair),
                        )
                    )

    unit_order = cast(list[str], input_authority["unitOrder"])
    units: list[dict[str, object]] = []
    published_sequence = 0
    for call in calls:
        for batch_position, unit_id in enumerate(cast(list[str], call["unitIds"])):
            units.append(
                {
                    "callIndex": call["callIndex"],
                    "unitId": unit_id,
                    "sourceSequence": unit_order.index(unit_id),
                    "batchPosition": batch_position,
                    "sampleCount": 240_000,
                    "sampleRateHz": 24_000,
                    "durationSeconds": 10,
                    "firstAudioNanoseconds": 10_000_000_000,
                    "completionNanoseconds": 10_000_000_000,
                    "requestRtf": 1,
                    "publishedSequence": published_sequence,
                    "status": "completed",
                    "failureCode": None,
                }
            )
            published_sequence += 1

    trials = []
    for trial_id in cast(list[str], execution["cancellationTrialOrder"]):
        trials.append(
            {
                "trialId": trial_id,
                "passed": True,
                "stopMode": (
                    "identity-invalidation"
                    if trial_id == "before-dispatch"
                    else "worker-process-termination"
                ),
                "identityInvalidationNanoseconds": 1,
                "workerTerminationNanoseconds": (None if trial_id == "before-dispatch" else 1),
                "stalePublishedUnits": 0,
                "workerExited": True,
                "cleanupNanoseconds": 1,
            }
        )

    return {
        "schemaVersion": "tts-short-segment-batch-raw-v4",
        "profileVersion": "tts-short-segment-batch-profile-v4",
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "authorityCommitSha": AUTHORITY_COMMIT_SHA,
        "executionCommitSha": "2" * 40,
        "treeClean": True,
        "resultPurpose": "official",
        "placementProfileId": profile_id,
        "cpuAdmission": _cpu_admission(profile_id),
        "candidateId": "qwen3-tts-1-7b-customvoice-cuda-bf16-v1",
        "host": _host(),
        "preflight": {
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
        },
        "calls": calls,
        "units": units,
        "cancellationTrials": trials,
        "playback": {
            "startupWallSeconds": 10,
            "startupPlayableSeconds": 20,
            "playedSeconds": 240,
            "minimumBufferSeconds": 0,
            "peakBufferSeconds": 20,
            "underrunCount": 0,
            "bufferingSeconds": 0,
            "bufferingSecondsPerMinute": 0,
            "peakQueuedUnits": 2,
            "peakActiveBatches": 1,
            "stalePlayedUnits": 0,
        },
        "memory": {
            "ramSamplingIntervalMilliseconds": 50,
            "vramSamplingIntervalMilliseconds": 1000,
            "peakProcessTreeRamBytes": 5_000_000_000,
            "peakProcessDedicatedVramBytes": 6_000_000_000,
            "peakFrameworkReservedVramBytes": 6_000_000_000,
            "peakAuthoritativeVramBytes": 6_000_000_000,
            "minimumFreeDedicatedVramBytes": 1_000_000_000,
            "peakSharedGpuMemoryBytes": 0,
            "memoryStopTriggered": False,
            "memoryStopCode": None,
        },
        "cleanup": {
            "workerProcessesRemaining": 0,
            "postCleanupProcessTreeRamBytes": 0,
            "postCleanupProcessTreeVramBytes": 0,
            "rawSessionRemoved": True,
            "generatedAudioRemoved": True,
            "sleepSettingRestored": True,
        },
        "failureCodes": [],
    }


def _conclusion(outcome: str, *failed: str) -> dict[str, object]:
    return {
        "outcome": outcome,
        "allRequiredGatesPassed": outcome == "pass",
        "failedGateCodes": list(failed),
    }


def _validate(value: object, *, summary: bool) -> None:
    validate_v4_result(
        REPOSITORY_ROOT,
        value,
        summary=summary,
        ancestry_checker=lambda authority, execution: (
            authority == AUTHORITY_COMMIT_SHA and execution == "2" * 40
        ),
    )


def _summary_fixture(profile_id: str = FULL_GPU_PROFILE_ID) -> dict[str, object]:
    raw = _raw_fixture(profile_id)
    return {
        "schemaVersion": "tts-short-segment-batch-summary-v4",
        "profileVersion": "tts-short-segment-batch-profile-v4",
        "profileSha256": PROFILE_SHA256,
        "corpusVersion": "tts-short-segment-corpus-v4",
        "corpusSha256": CORPUS_SHA256,
        "authorityCommitSha": AUTHORITY_COMMIT_SHA,
        "executionCommitSha": "2" * 40,
        "placementProfileId": profile_id,
        "cpuAdmission": _cpu_admission(profile_id),
        "candidateId": "qwen3-tts-1-7b-customvoice-cuda-bf16-v1",
        "host": _host(),
        "counts": {
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
        },
        "aggregates": {
            "coldLoadP95Seconds": 10,
            "batchOneFirstAudioP95Seconds": 2,
            "batchTwoFirstAudioP95Seconds": 2,
            "batchOneFifteenSecondsMediaP95Seconds": None,
            "batchTwoFifteenSecondsMediaP95Seconds": None,
            "batchOneShorterCompleteP95Seconds": 4,
            "batchTwoShorterCompleteP95Seconds": 4,
            "batchOneRequestRtfP95": 0.7,
            "batchTwoUnitRtfP95": 0.7,
            "batchOneAggregateRtf": 0.7,
            "batchTwoAggregateRtf": 0.7,
            "batchOneMediaSeconds": 240,
            "batchTwoMediaSeconds": 240,
            "minimumUnitDurationSeconds": 10,
            "maximumUnitDurationSeconds": 10,
            "orderedUnitCount": 48,
            "reorderedUnitCount": 0,
            "missingPairCount": 0,
        },
        "memory": raw["memory"],
        "cancellation": {
            "trialCount": 5,
            "passedTrialCount": 5,
            "maximumIdentityInvalidationMilliseconds": 1,
            "maximumWorkerTerminationMilliseconds": 1,
            "stalePublishedUnits": 0,
            "stalePlayedUnits": 0,
        },
        "playback": raw["playback"],
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
        "audits": {
            "offline": True,
            "artifacts": True,
            "license": True,
            "privacy": True,
            "ordering": True,
            "boundedRetention": True,
            "cleanup": True,
            "noSharedGpuPaging": True,
            "noDiskOffload": True,
            "approvedPlacement": True,
        },
        "conclusions": {
            "standardViability": _conclusion("pass"),
            "schedulingSustainability": _conclusion("pass"),
            "constrainedDemoUsefulness": _conclusion("not-evaluated"),
        },
        "failureCodes": [],
        "limitations": [
            "exact-host-only",
            "complete-waveform-batch",
            "worker-termination-not-cooperative-model-cancellation",
            "scheduling-pass-does-not-promote-failed-v3",
            "explicit-preparation-delay-remains-visible",
            "development-benchmark-not-production-runtime",
        ],
    }


def test_v4_authority_is_byte_frozen_and_result_blind() -> None:
    authority = load_frozen_v4_authority(REPOSITORY_ROOT)
    assert _sha256("benchmarks/tts/profile-v4.json") == PROFILE_SHA256
    assert _sha256("benchmarks/tts/corpus-v4.json") == CORPUS_SHA256
    assert (
        _sha256("benchmarks/tts/schemas/short-segment-batch-raw-v4.schema.json")
        == RAW_SCHEMA_SHA256
    )
    assert (
        _sha256("benchmarks/tts/schemas/short-segment-batch-summary-v4.schema.json")
        == SUMMARY_SCHEMA_SHA256
    )
    assert authority.profile["status"] == (
        "frozen-before-v4-implementation-pilot-and-official-results"
    )
    assert not (REPOSITORY_ROOT / "benchmarks/tts/short-segment-batch-result-v4.json").exists()
    assert not (REPOSITORY_ROOT / "benchmarks/tts/selection-v4.md").exists()


def test_v4_raw_result_rejects_missing_pairs_reordering_and_retry() -> None:
    _validate(_raw_fixture(), summary=False)

    missing = _raw_fixture()
    cast(list[object], missing["calls"]).pop()
    with pytest.raises(V4AuthorityError, match="missing-or-reordered-pairs"):
        _validate(missing, summary=False)

    reordered = _raw_fixture()
    calls = cast(list[dict[str, object]], reordered["calls"])
    calls[3], calls[4] = calls[4], calls[3]
    with pytest.raises(V4AuthorityError, match="missing-or-reordered-pairs"):
        _validate(reordered, summary=False)

    retried = _raw_fixture()
    cast(list[dict[str, object]], retried["calls"])[3]["attempt"] = 2
    with pytest.raises(V4AuthorityError, match="result-schema|first-attempt"):
        _validate(retried, summary=False)


def test_v4_result_rejects_unapproved_cpu_result_and_private_content() -> None:
    _validate(_raw_fixture(CPU_PROFILE_ID), summary=False)

    unapproved = _raw_fixture(CPU_PROFILE_ID)
    unapproved["cpuAdmission"] = _cpu_admission(FULL_GPU_PROFILE_ID)
    with pytest.raises(V4AuthorityError, match="unapproved-cpu-placement"):
        _validate(unapproved, summary=False)

    private = _raw_fixture()
    private["sourceText"] = "private"
    with pytest.raises(V4AuthorityError, match="private-content"):
        _validate(private, summary=False)

    corpus = load_frozen_v4_authority(REPOSITORY_ROOT).corpus
    first_unit = cast(list[Mapping[str, object]], corpus["units"])[0]
    leaked = _raw_fixture()
    leaked["failureCodes"] = [cast(str, first_unit["privacyCanary"])]
    with pytest.raises(V4AuthorityError, match="private-content"):
        _validate(leaked, summary=False)


def test_v4_summary_conclusions_are_closed_and_conjunctive() -> None:
    _validate(_summary_fixture(), summary=True)

    rescued_average = _summary_fixture()
    cast(dict[str, object], rescued_average["aggregates"])["batchTwoAggregateRtf"] = 1
    cast(dict[str, object], rescued_average["conclusions"])["standardViability"] = _conclusion(
        "fail", "total-sustained-rtf"
    )
    with pytest.raises(V4AuthorityError, match="scheduling-conclusion"):
        _validate(rescued_average, summary=True)

    quality_waiver = _summary_fixture()
    conclusions = cast(dict[str, object], quality_waiver["conclusions"])
    conclusions["constrainedDemoUsefulness"] = _conclusion("pass")
    with pytest.raises(V4AuthorityError, match="demo-conclusion"):
        _validate(quality_waiver, summary=True)

    result_before_authority = _summary_fixture()
    result_before_authority["executionCommitSha"] = result_before_authority["authorityCommitSha"]
    with pytest.raises(V4AuthorityError, match="result-before-authority"):
        _validate(result_before_authority, summary=True)

    unrelated_commit = _summary_fixture()
    with pytest.raises(V4AuthorityError, match="result-before-authority"):
        validate_v4_result(
            REPOSITORY_ROOT,
            unrelated_commit,
            summary=True,
            ancestry_checker=lambda _authority, _execution: False,
        )


def test_v4_authority_drift_fails_closed(tmp_path: Path) -> None:
    repository = tmp_path / "repository"
    for relative in (
        "benchmarks/tts/profile-v4.json",
        "benchmarks/tts/corpus-v4.json",
        "benchmarks/tts/schemas/short-segment-batch-raw-v4.schema.json",
        "benchmarks/tts/schemas/short-segment-batch-summary-v4.schema.json",
    ):
        source = REPOSITORY_ROOT / relative
        target = repository / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(source.read_bytes())
    profile_path = repository / "benchmarks/tts/profile-v4.json"
    profile = cast(dict[str, object], json.loads(profile_path.read_text(encoding="utf-8")))
    profile["status"] = "changed"
    profile_path.write_text(json.dumps(profile), encoding="utf-8")
    with pytest.raises(V4AuthorityError, match="authority-drift"):
        load_frozen_v4_authority(repository)


def test_v4_fixture_mutations_do_not_change_the_authority() -> None:
    original = _summary_fixture()
    mutated = copy.deepcopy(original)
    cast(dict[str, object], mutated["conclusions"])["standardViability"] = _conclusion(
        "fail", "warm-first-audio"
    )
    assert original != mutated
    assert _sha256("benchmarks/tts/profile-v4.json") == PROFILE_SHA256
