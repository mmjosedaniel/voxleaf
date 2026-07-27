"""Model-free enforcement for the frozen independent dual-worker v5 authority."""

from __future__ import annotations

import copy
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Final, cast

import pytest

from benchmarks.dual_worker_result import derive_v5_summary
from benchmarks.v5_authority import (
    AUTHORITY_COMMIT_SHA,
    CORPUS_SHA256,
    PROFILE_SHA256,
    RAW_SCHEMA_SHA256,
    SUMMARY_SCHEMA_SHA256,
    V5AuthorityError,
    load_frozen_v5_authority,
    validate_v5_raw_result,
    validate_v5_summary_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
AUTHORITY_COMMIT: Final = "a" * 40
EXECUTION_COMMIT: Final = "b" * 40
UNIT_ORDER: Final = (
    "es-v4-arrival",
    "es-v4-dialogue",
    "es-v4-numbers",
    "es-v4-date-time",
    "es-v4-temperature",
    "es-v4-foreign-name",
    "es-v4-route",
    "es-v4-closing",
)


def _sha256(path: str) -> str:
    return hashlib.sha256((REPOSITORY_ROOT / path).read_bytes()).hexdigest()


def _host() -> dict[str, object]:
    return {
        "operatingSystem": "Windows",
        "osVersion": "10.0.26200",
        "architecture": "x86_64",
        "pythonVersion": "3.12.10",
        "cpuModel": "Intel Core Ultra 7 255HX",
        "logicalProcessors": 20,
        "totalRamBytes": 33_752_997_888,
        "gpuModel": "NVIDIA GeForce RTX 5060 Laptop GPU",
        "totalVramBytes": 8_546_942_976,
        "driverVersion": "577.05",
    }


def _load(role: str, index: int) -> dict[str, object]:
    cpu = role == "cpu-support"
    return {
        "workerRole": role,
        "observationIndex": index,
        "durationSeconds": 10,
        "status": "completed",
        "failureCode": None,
        "device": "cpu" if cpu else "cuda:0",
        "dtype": "float32" if cpu else "bfloat16",
        "intraOpThreads": 12 if cpu else 4,
        "interopThreads": 1,
        "cudaAvailable": not cpu,
        "cudaDeviceCount": 0 if cpu else 1,
        "diskOrMetaParameters": 0,
        "implicitFallback": False,
        "dedicatedGpuBytes": 0 if cpu else 5_000_000_000,
        "sharedGpuBytes": 0 if cpu else 80_000_000,
    }


def _arm_prefix(arm: str) -> str:
    return {"cpu-solo": "cpu", "gpu-solo": "gpu", "concurrent": "concurrent"}[arm]


def _dispatches(arm: str) -> list[dict[str, object]]:
    passes = 1 if arm == "cpu-solo" else 5
    dispatches: list[dict[str, object]] = []
    for pass_index in range(1, passes + 1):
        for unit_id in UNIT_ORDER:
            index = len(dispatches)
            if arm == "cpu-solo":
                role = "cpu-support"
            elif arm == "gpu-solo":
                role = "gpu-primary"
            else:
                role = "gpu-primary" if index % 2 == 0 else "cpu-support"
            accepted = index * 1_000_000_000
            dispatches.append(
                {
                    "dispatchSequence": index,
                    "occurrenceId": (f"v5-{_arm_prefix(arm)}-p{pass_index:02d}-{unit_id}"),
                    "unitId": unit_id,
                    "sourceSequence": index,
                    "passIndex": pass_index,
                    "workerRole": role,
                    "attempt": 1,
                    "acceptedNanoseconds": accepted,
                    "completedNanoseconds": accepted + 9_000_000_000,
                    "status": "completed",
                    "failureCode": None,
                    "sampleCount": 240_000,
                    "sampleRateHz": 24_000,
                    "durationSeconds": 10,
                    "generationSeconds": 9,
                    "rtf": 0.9,
                    "publishedSequence": index,
                    "headOfLineWaitSeconds": 0,
                }
            )
    return dispatches


def _trial(trial_id: str, arm: str) -> dict[str, object]:
    return {
        "trialId": trial_id,
        "passed": True,
        "identityInvalidationMilliseconds": 1,
        "gpuWorkerTerminationMilliseconds": (
            100 if arm != "cpu-solo" and trial_id != "before-dispatch" else None
        ),
        "cpuWorkerTerminationMilliseconds": (
            100 if arm != "gpu-solo" and trial_id != "before-dispatch" else None
        ),
        "stalePublishedUnits": 0,
        "stalePlayedUnits": 0,
        "workerProcessesRemaining": 0,
        "cleanupMilliseconds": 200,
    }


def _trials(arm: str) -> list[dict[str, object]]:
    trial_ids = {
        "cpu-solo": ["before-dispatch", "cpu-active"],
        "gpu-solo": ["before-dispatch", "gpu-active"],
        "concurrent": [
            "before-dispatch",
            "gpu-active",
            "cpu-active",
            "both-active",
            "complete-before-ordered-release",
            "queued-after-invalidation",
        ],
    }[arm]
    return [_trial(trial_id, arm) for trial_id in trial_ids]


def _memory_sample(arm: str) -> dict[str, object]:
    gpu = arm != "cpu-solo"
    cpu = arm != "gpu-solo"
    return {
        "timestampNanoseconds": 1,
        "systemAvailableRamBytes": 8_000_000_000,
        "systemCommitUsedBytes": 20_000_000_000,
        "systemCommitLimitBytes": 40_000_000_000,
        "controllerRamBytes": 100_000_000,
        "gpuWorkerRamBytes": 5_000_000_000 if gpu else 0,
        "cpuWorkerRamBytes": 10_000_000_000 if cpu else 0,
        "gpuWorkerDedicatedVramBytes": 6_000_000_000 if gpu else 0,
        "gpuWorkerSharedGpuBytes": 80_000_000 if gpu else 0,
        "cpuWorkerDedicatedVramBytes": 0,
        "cpuWorkerSharedGpuBytes": 0,
        "frameworkReservedVramBytes": 6_000_000_000 if gpu else 0,
    }


def _raw_fixture(arm: str = "concurrent") -> dict[str, object]:
    loads = {
        "cpu-solo": [_load("cpu-support", index) for index in range(3)],
        "gpu-solo": [_load("gpu-primary", index) for index in range(3)],
        "concurrent": [_load("gpu-primary", 0), _load("cpu-support", 0)],
    }[arm]
    return {
        "schemaVersion": "tts-dual-worker-raw-v5",
        "profileVersion": "tts-dual-worker-profile-v5",
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "authorityCommitSha": AUTHORITY_COMMIT,
        "executionCommitSha": EXECUTION_COMMIT,
        "treeClean": True,
        "resultPurpose": "official",
        "arm": arm,
        "host": _host(),
        "preflight": {
            "candidateInterpreterVerified": True,
            "authorityHashesVerified": True,
            "artifactHashesVerified": True,
            "offlineEnvironmentVerified": True,
            "localFilesOnlyVerified": True,
            "outboundFirewallBlocksVerified": True,
            "acPowerVerified": True,
            "sleepDisabled": True,
            "backgroundLoadAccepted": True,
            "thermalStateAccepted": True,
            "freeRamBytes": 14_000_000_000,
            "systemCommitHeadroomBytes": 10_000_000_000,
            "freeVramBytes": 8_174_698_496,
            "gpuSharedMemoryBytes": 0,
            "cpuCudaHidden": True,
        },
        "loads": loads,
        "dispatches": _dispatches(arm),
        "cancellationTrials": _trials(arm),
        "memorySamples": [_memory_sample(arm)],
        "quality": {
            "status": "not-admitted",
            "evaluatorCount": 0,
            "observations": [],
        },
        "cleanup": {
            "workerProcessesRemaining": 0,
            "postCleanupTrackedRamBytes": 0,
            "postCleanupGpuWorkerDedicatedVramBytes": 0,
            "postCleanupGpuWorkerSharedGpuBytes": 0,
            "postCleanupCpuWorkerDedicatedVramBytes": 0,
            "postCleanupCpuWorkerSharedGpuBytes": 0,
            "rawSessionRemoved": True,
            "generatedAudioRemoved": True,
            "scorecardRemoved": True,
            "sleepSettingRestored": True,
        },
        "failureCodes": [],
    }


def _worker_aggregate(units: int, media: float, generation: float) -> dict[str, object]:
    return {
        "measuredUnits": units,
        "mediaSeconds": media,
        "generationSeconds": generation,
        "totalRtf": generation / media,
        "requestRtfP95": generation / media,
        "firstCompleteP95Seconds": 9,
    }


def _conclusion(outcome: str, *failures: str) -> dict[str, object]:
    return {
        "outcome": outcome,
        "allRequiredGatesPassed": outcome == "pass",
        "failedGateCodes": list(failures),
    }


def _summary_fixture(arm: str = "concurrent") -> dict[str, object]:
    values_by_arm: dict[str, dict[str, object]] = {
        "cpu-solo": {
            "units": 8,
            "gpuUnits": 0,
            "cpuUnits": 8,
            "media": 80.0,
            "elapsed": 240.0,
            "aggregateRtf": 3.0,
            "gpu": None,
            "cpu": _worker_aggregate(8, 80, 240),
            "baseline": None,
            "improvement": None,
            "slowdown": None,
            "cancellations": 2,
        },
        "gpu-solo": {
            "units": 40,
            "gpuUnits": 40,
            "cpuUnits": 0,
            "media": 400.0,
            "elapsed": 560.0,
            "aggregateRtf": 1.4,
            "gpu": _worker_aggregate(40, 400, 560),
            "cpu": None,
            "baseline": None,
            "improvement": None,
            "slowdown": None,
            "cancellations": 2,
        },
        "concurrent": {
            "units": 40,
            "gpuUnits": 28,
            "cpuUnits": 12,
            "media": 400.0,
            "elapsed": 360.0,
            "aggregateRtf": 0.9,
            "gpu": _worker_aggregate(28, 280, 431.2),
            "cpu": _worker_aggregate(12, 120, 300),
            "baseline": 1.4,
            "improvement": 0.35714285714285715,
            "slowdown": 0.1,
            "cancellations": 6,
        },
    }
    values = values_by_arm[arm]
    playback_status = "not-applicable" if arm == "cpu-solo" else "complete"
    conclusions = {
        "cpuSoloAdmission": (
            _conclusion("pass") if arm == "cpu-solo" else _conclusion("not-applicable")
        ),
        "concurrentSchedulingSustainability": (
            _conclusion("pass") if arm == "concurrent" else _conclusion("not-applicable")
        ),
        "preferredStandardMargin": _conclusion("not-applicable"),
        "constrainedDemoUsefulness": _conclusion("not-evaluated"),
        "unchangedStandardProductionViability": _conclusion(
            "fail",
            "inherited-v3-standard-failure",
        ),
    }
    return {
        "schemaVersion": "tts-dual-worker-summary-v5",
        "profileVersion": "tts-dual-worker-profile-v5",
        "profileSha256": PROFILE_SHA256,
        "corpusVersion": "tts-dual-worker-corpus-v5",
        "corpusSha256": CORPUS_SHA256,
        "authorityCommitSha": AUTHORITY_COMMIT,
        "executionCommitSha": EXECUTION_COMMIT,
        "arm": arm,
        "host": _host(),
        "counts": {
            "coldLoads": 3 if arm != "concurrent" else 2,
            "warmupUnits": 2 if arm == "concurrent" else 1,
            "measuredUnits": values["units"],
            "gpuMeasuredUnits": values["gpuUnits"],
            "cpuMeasuredUnits": values["cpuUnits"],
            "completedFirstAttempts": values["units"],
            "failedOrTimedOutFirstAttempts": 0,
            "automaticRetries": 0,
            "cancellationTrials": values["cancellations"],
        },
        "aggregates": {
            "coldLoadP95Seconds": 20,
            "mediaSeconds": values["media"],
            "elapsedGenerationSeconds": values["elapsed"],
            "aggregateRtf": values["aggregateRtf"],
            "gpuSoloBaselineAggregateRtf": values["baseline"],
            "aggregateThroughputImprovementFraction": values["improvement"],
            "gpu": values["gpu"],
            "cpu": values["cpu"],
            "gpuSlowdownFraction": values["slowdown"],
            "minimumUnitDurationSeconds": 10,
            "maximumUnitDurationSeconds": 10,
            "unitsWithinTargetDuration": values["units"],
            "unitsOutsideTargetWithinHardBound": 0,
            "maximumHeadOfLineWaitSeconds": 2 if arm == "concurrent" else 0,
            "orderedPublishedUnits": values["units"],
            "reorderedPublishedUnits": 0,
            "duplicateOrMissingIdentities": 0,
        },
        "memory": {
            "peakCombinedProcessTreeRamBytes": 15_000_000_000,
            "minimumSystemAvailableRamBytes": 8_000_000_000,
            "minimumSystemCommitHeadroomBytes": 10_000_000_000,
            "peakGpuWorkerDedicatedVramBytes": 0 if arm == "cpu-solo" else 6_000_000_000,
            "peakGpuWorkerSharedGpuBytes": 0 if arm == "cpu-solo" else 80_000_000,
            "peakCpuWorkerDedicatedVramBytes": 0,
            "peakCpuWorkerSharedGpuBytes": 0,
            "peakFrameworkReservedVramBytes": 0 if arm == "cpu-solo" else 6_000_000_000,
            "ramSamplingIntervalMilliseconds": 50,
            "vramSamplingIntervalMilliseconds": 1000,
        },
        "cancellation": {
            "trialCount": values["cancellations"],
            "passedTrialCount": values["cancellations"],
            "maximumIdentityInvalidationMilliseconds": 1,
            "maximumWorkerTerminationMilliseconds": 100,
            "stalePublishedUnits": 0,
            "stalePlayedUnits": 0,
        },
        "playback": {
            "status": playback_status,
            "startupWallSeconds": None if arm == "cpu-solo" else 20,
            "startupPlayableSeconds": 0 if arm == "cpu-solo" else 20,
            "playedSeconds": 0 if arm == "cpu-solo" else 400,
            "minimumBufferSeconds": 0,
            "peakBufferSeconds": 240 if arm == "concurrent" else 40,
            "peakBufferedPcmBytes": 23_040_000 if arm == "concurrent" else 3_840_000,
            "peakQueuedCompleteUnits": 24 if arm == "concurrent" else 4,
            "peakActiveUnits": 2 if arm == "concurrent" else 1,
            "underrunCount": 0,
            "bufferingSeconds": 0,
            "bufferingSecondsPerMinute": 0,
            "producerLeadTrendSecondsPerMinute": 6 if arm == "concurrent" else 0,
            "thresholds": [
                {
                    "playableSeconds": threshold,
                    "reached": arm != "cpu-solo" and threshold <= 120,
                    "wallSeconds": (
                        threshold * 2 if arm != "cpu-solo" and threshold <= 120 else None
                    ),
                }
                for threshold in (15, 30, 60, 120, 300)
            ],
            "stalePlayedUnits": 0,
        },
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
            "cpuZeroGpu": True,
            "noDiskOffload": True,
            "approvedWorkerIdentities": True,
            "firstAttemptsOnly": True,
        },
        "conclusions": conclusions,
        "failureCodes": [],
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


def _validate_raw(value: object) -> None:
    validate_v5_raw_result(
        REPOSITORY_ROOT,
        value,
        ancestry_checker=lambda authority, execution: (
            authority == AUTHORITY_COMMIT and execution == EXECUTION_COMMIT
        ),
        authority_tree_checker=lambda commit: commit == AUTHORITY_COMMIT,
    )


def _validate_summary(value: object) -> None:
    validate_v5_summary_result(
        REPOSITORY_ROOT,
        value,
        ancestry_checker=lambda authority, execution: (
            authority == AUTHORITY_COMMIT and execution == EXECUTION_COMMIT
        ),
        authority_tree_checker=lambda commit: commit == AUTHORITY_COMMIT,
    )


def test_v5_authority_is_byte_frozen() -> None:
    authority = load_frozen_v5_authority(REPOSITORY_ROOT)
    assert _sha256("benchmarks/tts/profile-v5.json") == PROFILE_SHA256
    assert _sha256("benchmarks/tts/corpus-v5.json") == CORPUS_SHA256
    assert _sha256("benchmarks/tts/schemas/dual-worker-raw-v5.schema.json") == RAW_SCHEMA_SHA256
    assert (
        _sha256("benchmarks/tts/schemas/dual-worker-summary-v5.schema.json")
        == SUMMARY_SCHEMA_SHA256
    )
    assert authority.profile["status"] == (
        "frozen-before-v5-implementation-pilot-and-official-results"
    )


def test_v5_result_rejects_a_substitute_authority_commit() -> None:
    with pytest.raises(V5AuthorityError, match="result-before-authority"):
        validate_v5_summary_result(
            REPOSITORY_ROOT,
            _summary_fixture(),
            ancestry_checker=lambda _authority, _execution: True,
        )


def test_committed_v5_summaries_are_schema_valid() -> None:
    paths = sorted((REPOSITORY_ROOT / "benchmarks/tts").glob("dual-worker-result-v5-*.json"))
    assert paths
    for path in paths:
        validate_v5_summary_result(
            REPOSITORY_ROOT,
            json.loads(path.read_text(encoding="utf-8")),
        )


def test_v5_execution_authority_can_skip_optional_schema_library(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setitem(sys.modules, "jsonschema", None)

    authority = load_frozen_v5_authority(REPOSITORY_ROOT, validate_schemas=False)

    assert authority.profile["profileVersion"] == "tts-dual-worker-profile-v5"


def test_v5_raw_accepts_exact_arms_and_rejects_identity_order_or_retry() -> None:
    for arm in ("cpu-solo", "gpu-solo", "concurrent"):
        _validate_raw(_raw_fixture(arm))

    missing = _raw_fixture()
    cast(list[object], missing["dispatches"]).pop()
    with pytest.raises(V5AuthorityError, match="result-schema|missing-or-duplicate"):
        _validate_raw(missing)

    duplicate = _raw_fixture()
    dispatches = cast(list[dict[str, object]], duplicate["dispatches"])
    dispatches[2]["occurrenceId"] = dispatches[1]["occurrenceId"]
    with pytest.raises(V5AuthorityError, match="missing-or-duplicate"):
        _validate_raw(duplicate)

    reordered = _raw_fixture()
    dispatches = cast(list[dict[str, object]], reordered["dispatches"])
    dispatches[2], dispatches[3] = dispatches[3], dispatches[2]
    with pytest.raises(V5AuthorityError, match="dispatch-order|missing-or-duplicate"):
        _validate_raw(reordered)

    retried = _raw_fixture()
    cast(list[dict[str, object]], retried["dispatches"])[2]["attempt"] = 2
    with pytest.raises(V5AuthorityError, match="result-schema|retry"):
        _validate_raw(retried)


def test_v5_cpu_worker_rejects_cuda_dedicated_or_shared_gpu_use() -> None:
    _validate_raw(_raw_fixture("cpu-solo"))

    cuda = _raw_fixture("cpu-solo")
    cast(list[dict[str, object]], cuda["loads"])[0]["cudaAvailable"] = True
    with pytest.raises(V5AuthorityError, match="cpu-zero-gpu"):
        _validate_raw(cuda)

    dedicated = _raw_fixture("concurrent")
    cast(list[dict[str, object]], dedicated["memorySamples"])[0]["cpuWorkerDedicatedVramBytes"] = 1
    with pytest.raises(V5AuthorityError, match="cpu-zero-gpu"):
        _validate_raw(dedicated)

    shared = _summary_fixture("concurrent")
    cast(dict[str, object], shared["memory"])["peakCpuWorkerSharedGpuBytes"] = 1
    with pytest.raises(V5AuthorityError, match="cpu-zero-gpu"):
        _validate_summary(shared)


def test_v5_summary_enforces_cpu_screen_and_concurrent_sustainability() -> None:
    _validate_summary(_summary_fixture("cpu-solo"))
    _validate_summary(_summary_fixture("gpu-solo"))
    _validate_summary(_summary_fixture("concurrent"))

    cpu_too_slow = _summary_fixture("cpu-solo")
    cast(dict[str, object], cpu_too_slow["aggregates"])["aggregateRtf"] = 3.2000001
    with pytest.raises(V5AuthorityError, match="cpu-conclusion"):
        _validate_summary(cpu_too_slow)

    not_realtime = _summary_fixture("concurrent")
    cast(dict[str, object], not_realtime["aggregates"])["aggregateRtf"] = 1
    with pytest.raises(V5AuthorityError, match="concurrent-conclusion"):
        _validate_summary(not_realtime)

    standard_rewrite = _summary_fixture("concurrent")
    cast(dict[str, object], standard_rewrite["conclusions"])[
        "unchangedStandardProductionViability"
    ] = _conclusion("pass")
    with pytest.raises(V5AuthorityError, match="standard-conclusion"):
        _validate_summary(standard_rewrite)


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("peakBufferSeconds", 300.000001),
        ("peakBufferedPcmBytes", 28_800_001),
        ("peakQueuedCompleteUnits", 41),
        ("peakActiveUnits", 3),
    ],
)
def test_v5_summary_rejects_each_retention_overrun(field: str, value: object) -> None:
    result = _summary_fixture("concurrent")
    cast(dict[str, object], result["playback"])[field] = value
    with pytest.raises(V5AuthorityError, match="retention"):
        _validate_summary(result)


def test_v5_result_rejects_private_content_and_false_authority_ancestry() -> None:
    private = _raw_fixture()
    private["narrationText"] = "private"
    with pytest.raises(V5AuthorityError, match="result-schema|private-content"):
        _validate_raw(private)

    with pytest.raises(V5AuthorityError, match="result-before-authority"):
        validate_v5_summary_result(
            REPOSITORY_ROOT,
            _summary_fixture(),
            ancestry_checker=lambda _authority, _execution: False,
            authority_tree_checker=lambda _commit: True,
        )

    with pytest.raises(V5AuthorityError, match="result-before-authority"):
        validate_v5_summary_result(
            REPOSITORY_ROOT,
            _summary_fixture(),
            ancestry_checker=lambda _authority, _execution: True,
            authority_tree_checker=lambda _commit: False,
        )


def test_v5_authority_drift_fails_closed(tmp_path: Path) -> None:
    repository = tmp_path / "repository"
    for relative in (
        "benchmarks/tts/profile-v5.json",
        "benchmarks/tts/corpus-v5.json",
        "benchmarks/tts/corpus-v4.json",
        "benchmarks/tts/schemas/dual-worker-raw-v5.schema.json",
        "benchmarks/tts/schemas/dual-worker-summary-v5.schema.json",
    ):
        source = REPOSITORY_ROOT / relative
        target = repository / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(source.read_bytes())
    profile_path = repository / "benchmarks/tts/profile-v5.json"
    profile = cast(dict[str, object], json.loads(profile_path.read_text(encoding="utf-8")))
    profile["status"] = "changed"
    profile_path.write_text(json.dumps(profile), encoding="utf-8")
    with pytest.raises(V5AuthorityError, match="authority-drift"):
        load_frozen_v5_authority(repository)


def test_v5_fixture_mutations_do_not_change_frozen_authority() -> None:
    original = _summary_fixture()
    mutated = copy.deepcopy(original)
    cast(dict[str, object], mutated["aggregates"])["aggregateRtf"] = 2
    assert original != mutated
    assert _sha256("benchmarks/tts/profile-v5.json") == PROFILE_SHA256


def test_v5_cpu_raw_derives_a_schema_valid_content_safe_summary() -> None:
    raw = _raw_fixture("cpu-solo")
    raw["authorityCommitSha"] = AUTHORITY_COMMIT_SHA
    raw["executionCommitSha"] = subprocess.run(
        ("git", "rev-parse", "HEAD"),
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()

    summary = derive_v5_summary(REPOSITORY_ROOT, raw)

    assert summary["arm"] == "cpu-solo"
    assert cast(dict[str, object], summary["counts"])["measuredUnits"] == 8
    assert cast(dict[str, object], summary["conclusions"])["cpuSoloAdmission"] == {
        "outcome": "pass",
        "allRequiredGatesPassed": True,
        "failedGateCodes": [],
    }
    assert "sourceText" not in json.dumps(summary)
