"""Version-bound authority and evidence-derived cancellation for official v14."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from collections.abc import Callable, Mapping, Sequence
from pathlib import Path
from typing import Final, cast

from benchmarks import v13_authority
from benchmarks.v4_authority import (
    CORPUS_SHA256,
    CPU_PROFILE_ID,
    FULL_GPU_PROFILE_ID,
    MEMORY_STOP_CODES,
    FrozenCpuAdmission,
    FrozenV4Authority,
    V4AuthorityError,
    _load_object,
    _mapping,
    _reject_private_content,
    _schema_registry,
    _sha256,
    _verify_cpu_admission,
    _verify_raw_order,
    _verify_summary_conclusions,
)

PROFILE_VERSION: Final = "tts-short-segment-batch-profile-v14"
RAW_VERSION: Final = "tts-short-segment-batch-raw-v14"
SUMMARY_VERSION: Final = "tts-short-segment-batch-summary-v14"
PROFILE_SHA256: Final = "fae48cf08e2cf34f90e47a63f23e7b8ce0cd00f145ca1901a7e452e0e8ee2c67"
PROFILE_PATH: Final = Path("benchmarks/tts/profile-v14.json")
RAW_SCHEMA_PATH: Final = Path("benchmarks/tts/schemas/short-segment-batch-raw-v14.schema.json")
SUMMARY_SCHEMA_PATH: Final = Path(
    "benchmarks/tts/schemas/short-segment-batch-summary-v14.schema.json"
)
GPU_RESULT_PATH: Final = Path("benchmarks/tts/short-segment-batch-result-v14.json")

TRIAL_ORDER: Final = (
    "before-dispatch",
    "accepted-before-audio",
    "during-batch-generation",
    "after-complete-before-publication",
    "after-first-unit-publication",
)
_TRIAL_PHASES: Final = (
    "before-dispatch",
    "worker-accepted",
    "adapter-entry",
    "before-publication",
    "after-first-publication",
)
_INVALIDATION_LIMIT_NS: Final = 500_000_000
_TERMINATION_LIMIT_NS: Final = 2_000_000_000
_CLEANUP_LIMIT_NS: Final = 5_000_000_000


class V14AuthorityError(ValueError):
    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-v14-authority:{code}")
        self.code = code


class V14CpuAdmission(FrozenCpuAdmission):
    """Admission based exclusively on a verified, committed v14 GPU summary."""


def _bounded_time(value: object, limit: int) -> bool:
    return type(value) is int and 0 <= value <= limit


def trial_passes(trial: Mapping[str, object]) -> bool:
    index = trial.get("trialIndex")
    if type(index) is not int or not 1 <= index <= len(TRIAL_ORDER):
        return False
    if (
        trial.get("trialId") != TRIAL_ORDER[index - 1]
        or trial.get("callIndex") != 100 + index
        or trial.get("witnessedPhase") != _TRIAL_PHASES[index - 1]
        or not _bounded_time(trial.get("identityInvalidationNanoseconds"), _INVALIDATION_LIMIT_NS)
        or trial.get("stalePublishedUnits") != 0
    ):
        return False
    outcome = trial.get("outcome")
    suppressed = trial.get("suppressedByGate")
    before = trial.get("publishedBeforeInvalidation")
    termination = trial.get("workerTerminationNanoseconds")
    cleanup = trial.get("cleanupNanoseconds")
    exited = trial.get("workerExited")
    calls = trial.get("candidateCalls")
    if index == 1:
        return (
            outcome == "dispatch-rejected"
            and calls == 0
            and before == 0
            and all(value is None for value in (suppressed, termination, cleanup, exited))
        )
    if (
        calls != (0 if index == 2 else 1)
        or exited is not True
        or not _bounded_time(cleanup, _CLEANUP_LIMIT_NS)
    ):
        return False
    if index in (2, 3):
        return (
            outcome == "worker-cancelled"
            and before == 0
            and suppressed is None
            and _bounded_time(termination, _TERMINATION_LIMIT_NS)
        )
    expected_before = index - 4
    return (
        outcome == "publication-rejected"
        and termination is None
        and before == expected_before
        and suppressed == 2 - expected_before
    )


def summarize_trials(
    trials: Sequence[Mapping[str, object]], stale_played: int
) -> dict[str, object]:
    def maximum_milliseconds(key: str) -> float | None:
        times = [cast(int, row[key]) for row in trials if row[key] is not None]
        return max(times) / 1_000_000 if times else None

    return {
        "trialCount": len(trials),
        "passedTrialCount": sum(trial_passes(trial) for trial in trials),
        "maximumIdentityInvalidationMilliseconds": maximum_milliseconds(
            "identityInvalidationNanoseconds"
        ),
        "maximumWorkerTerminationMilliseconds": maximum_milliseconds(
            "workerTerminationNanoseconds"
        ),
        "stalePublishedUnits": sum(cast(int, row["stalePublishedUnits"]) for row in trials),
        "stalePlayedUnits": stale_played,
    }


def _authority_paths(root: Path) -> dict[Path, str]:
    if _sha256(root / PROFILE_PATH) != PROFILE_SHA256:
        raise V14AuthorityError("authority-drift")
    profile = _load_object(root / PROFILE_PATH)
    if profile.get("profileVersion") != PROFILE_VERSION or profile.get("predecessor") != {
        "path": v13_authority.PROFILE_PATH.as_posix(),
        "sha256": v13_authority.PROFILE_SHA256,
    }:
        raise V14AuthorityError("profile-identity")
    paths = {PROFILE_PATH: PROFILE_SHA256}
    for name, path in (
        ("privateRawSchema", RAW_SCHEMA_PATH),
        ("contentSafeSummarySchema", SUMMARY_SCHEMA_PATH),
    ):
        digest = _sha256(root / path)
        if profile.get(name) != {"path": path.as_posix(), "sha256": digest}:
            raise V14AuthorityError("authority-drift")
        paths[path] = digest
    return paths


def load_v14_mechanics_authority(root: Path) -> FrozenV4Authority:
    _authority_paths(root)
    return v13_authority.load_v13_mechanics_authority(root)


def _execution_owns_authority(root: Path, commit: str) -> bool:
    return (
        re.fullmatch(r"[0-9a-f]{40}", commit) is not None
        and all(
            v13_authority._committed_hash(root, commit, path) == digest
            for path, digest in _authority_paths(root).items()
        )
        and v13_authority._execution_owns_authority(root, commit)
    )


def _verify_trial_rows(trials: Sequence[Mapping[str, object]]) -> None:
    for index, (trial, trial_id, phase) in enumerate(
        zip(trials, TRIAL_ORDER, _TRIAL_PHASES, strict=True), start=1
    ):
        if (
            trial["trialId"] != trial_id
            or trial["trialIndex"] != index
            or trial["callIndex"] != 100 + index
            or trial["witnessedPhase"] not in (None, phase)
            or (trial["witnessedPhase"] is None)
            != (trial["identityInvalidationNanoseconds"] is None)
            or (index <= 3 and trial["suppressedByGate"] is not None)
            or (index not in (2, 3) and trial["workerTerminationNanoseconds"] is not None)
            or (
                index == 1
                and (trial["workerExited"] is not None or trial["cleanupNanoseconds"] is not None)
            )
        ):
            raise V14AuthorityError("cancellation-proof")
        if trial["outcome"] == "publication-rejected" and index >= 4:
            publications = (
                (
                    cast(int, trial["publishedBeforeInvalidation"])
                    + cast(int, trial["stalePublishedUnits"])
                    + cast(int, trial["suppressedByGate"])
                )
                if trial["suppressedByGate"] is not None
                else 0
            )
            if publications != 2 or trial["candidateCalls"] != 1:
                raise V14AuthorityError("cancellation-proof")


def validate_v14_result(
    root: Path,
    value: object,
    *,
    summary: bool,
    execution_checker: Callable[[str], bool] | None = None,
) -> None:
    from jsonschema import Draft202012Validator
    from referencing import Resource

    predecessor = load_v14_mechanics_authority(root)
    result = _mapping(value, "result-object")
    _reject_private_content(result, predecessor.corpus)
    schema = _load_object(root / (SUMMARY_SCHEMA_PATH if summary else RAW_SCHEMA_PATH))
    registry = _schema_registry(predecessor)
    for path in (v13_authority.RAW_SCHEMA_PATH, v13_authority.SUMMARY_SCHEMA_PATH, RAW_SCHEMA_PATH):
        reference = _load_object(root / path)
        registry = registry.with_resource(
            cast(str, reference["$id"]), Resource.from_contents(reference)
        )
    Draft202012Validator.check_schema(schema)
    if not Draft202012Validator(schema, registry=registry).is_valid(result):
        raise V14AuthorityError("result-schema")
    commit = cast(str, result["executionCommitSha"])
    owns_authority = execution_checker or (lambda sha: _execution_owns_authority(root, sha))
    if (
        result["profileSha256"] != PROFILE_SHA256
        or result["corpusSha256"] != CORPUS_SHA256
        or not owns_authority(commit)
    ):
        raise V14AuthorityError("execution-authority")
    _verify_cpu_admission(result)
    if (
        result["placementProfileId"] == CPU_PROFILE_ID
        and result["cpuAdmission"] != load_v14_cpu_admission(root).as_raw()
    ):
        raise V14AuthorityError("cpu-admission-result")
    trials = cast(
        list[Mapping[str, object]], result["cancellationProof" if summary else "cancellationTrials"]
    )
    _verify_trial_rows(trials)
    failures = cast(list[str], result["failureCodes"])
    all_trials_pass = all(trial_passes(row) for row in trials)
    if ("cancellation-failed" in failures) == all_trials_pass:
        raise V14AuthorityError("cancellation-conclusion")
    if not summary:
        _verify_raw_order(result, predecessor)
        return
    playback = _mapping(result["playback"], "playback")
    if result["cancellation"] != summarize_trials(trials, cast(int, playback["stalePlayedUnits"])):
        raise V14AuthorityError("cancellation-conclusion")
    _verify_summary_conclusions(result)
    audits = _mapping(result["audits"], "audits")
    conclusions = _mapping(result["conclusions"], "conclusions")
    if (result["cleanupFailureCodes"] or "cleanup-failed" in failures) and (
        audits["cleanup"] is not False
        or any(
            _mapping(conclusions[name], "conclusion")["outcome"] != "fail"
            for name in ("standardViability", "schedulingSustainability")
        )
    ):
        raise V14AuthorityError("cleanup-conclusion")


def load_v14_cpu_admission(root: Path) -> V14CpuAdmission:
    committed = v13_authority._committed_hash(root, "HEAD", GPU_RESULT_PATH)
    try:
        contents = (root / GPU_RESULT_PATH).read_bytes()
        if committed is None or hashlib.sha256(contents).hexdigest() != committed:
            raise V14AuthorityError("cpu-admission-result")
        result = _mapping(cast(object, json.loads(contents)), "cpu-admission-result")
        if result.get("placementProfileId") != FULL_GPU_PROFILE_ID:
            raise V14AuthorityError("cpu-admission-result")
        validate_v14_result(root, result, summary=True)
    except (OSError, UnicodeError, ValueError):
        raise V14AuthorityError("cpu-admission-result") from None
    memory = _mapping(result["memory"], "memory")
    audits = _mapping(result["audits"], "audits")
    counts = _mapping(result["counts"], "counts")
    conclusions = _mapping(result["conclusions"], "conclusions")
    cancellation = _mapping(result["cancellation"], "cancellation")
    stop = memory["memoryStopCode"]
    failures = cast(list[str], result["failureCodes"])
    if (
        memory["memoryStopTriggered"] is not True
        or not isinstance(stop, str)
        or stop not in MEMORY_STOP_CODES
        or stop not in failures
        or "cleanup-failed" in failures
        or result["cleanupFailureCodes"] != []
        or audits["cleanup"] is not True
        or audits["privacy"] is not True
        or counts["batchTwoCalls"] != 12
        or counts["batchTwoUnits"] != 24
        or counts["automaticRetries"] != 0
        or cast(int, counts["failedOrTimedOutFirstAttempts"]) <= 0
        or cancellation["passedTrialCount"] != 5
        or any(
            _mapping(conclusions[name], "conclusion")["outcome"] != "fail"
            for name in ("standardViability", "schedulingSustainability")
        )
    ):
        raise V14AuthorityError("cpu-admission-result")
    return V14CpuAdmission(stop, committed)


def load_v14_cpu_admission_from_base(root: Path) -> V14CpuAdmission:
    """Check schema using the existing offline base interpreter before model acquisition."""
    try:
        output = subprocess.run(
            (
                "uv",
                "run",
                "--offline",
                "--no-sync",
                "--locked",
                "--directory",
                str(root / "services/tts"),
                "python",
                "-m",
                "benchmarks.batch_result_cli",
                "admit-v14-cpu",
            ),
            cwd=root,
            check=True,
            stdin=subprocess.DEVNULL,
            capture_output=True,
            timeout=15,
        ).stdout
        receipt = _mapping(cast(object, json.loads(output)), "cpu-admission-result")
        stop = receipt.get("fullGpuMemoryStopCode")
        digest = receipt.get("fullGpuResultSha256")
        if (
            set(receipt) != {"status", "fullGpuMemoryStopCode", "fullGpuResultSha256"}
            or receipt.get("status") != "admitted"
            or not isinstance(stop, str)
            or stop not in MEMORY_STOP_CODES
            or not isinstance(digest, str)
            or digest != v13_authority._committed_hash(root, "HEAD", GPU_RESULT_PATH)
            or digest != _sha256(root / GPU_RESULT_PATH)
        ):
            raise V14AuthorityError("cpu-admission-result")
        return V14CpuAdmission(stop, digest)
    except (
        OSError,
        UnicodeError,
        json.JSONDecodeError,
        subprocess.SubprocessError,
        V4AuthorityError,
    ):
        raise V14AuthorityError("cpu-admission-result") from None
