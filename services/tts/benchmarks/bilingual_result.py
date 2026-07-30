"""Content-safe v8 result derivation for the exact Piper English baseline."""

from __future__ import annotations

import json
import shutil
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Final, NoReturn, cast

from jsonschema import Draft202012Validator

from benchmarks.adapters.piper_english import PIPER_ENGLISH_CANDIDATE_ID
from benchmarks.bilingual_baseline import (
    AUTHORITY_COMMIT_SHA,
    RAW_ROOT,
    BaselinePreflightReceipt,
)
from benchmarks.bilingual_quality import DIMENSIONS
from benchmarks.metrics import distribution
from benchmarks.v7_authority import CORPUS_SHA256, PIPER_LOCK_SHA256
from benchmarks.v8_authority import (
    CANDIDATES_SHA256,
    PROFILE_SHA256,
    load_frozen_v8_authority,
    validate_v8_raw_result,
    validate_v8_summary_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
RESULT_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "piper-english-result-v8.json"


class BilingualResultError(RuntimeError):
    """Fixed content-free result derivation failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-bilingual-result:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise BilingualResultError(code)


def _mapping(value: object, code: str = "result") -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str = "result") -> Sequence[object]:
    if not isinstance(value, list):
        _fail(code)
    return cast(Sequence[object], value)


def _number(value: object, code: str = "result") -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        _fail(code)
    return float(value)


def _integer(value: object, code: str = "result") -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        _fail(code)
    return value


def _read_mapping(path: Path, *, maximum_bytes: int = 262_144) -> Mapping[str, object]:
    try:
        payload = path.read_bytes()
        if len(payload) > maximum_bytes:
            _fail("result-size")
        value = cast(object, json.loads(payload))
    except (OSError, UnicodeError, json.JSONDecodeError):
        _fail("result")
    return _mapping(value)


def _session_path(session_id: str) -> Path:
    root = RAW_ROOT.resolve()
    session = (root / PIPER_ENGLISH_CANDIDATE_ID / session_id).resolve()
    try:
        relative = session.relative_to(root)
    except ValueError:
        _fail("session")
    if (
        len(relative.parts) != 2
        or len(session_id) != 32
        or any(character not in "0123456789abcdef" for character in session_id)
        or not session.is_dir()
    ):
        _fail("session")
    return session


def _p95(values: Sequence[float]) -> float:
    if not values:
        _fail("observations")
    return distribution(tuple(values)).p95


def _rtf(attempt: Mapping[str, object]) -> float:
    sample_count = _integer(attempt.get("sampleCount"))
    sample_rate = _integer(attempt.get("sampleRateHz"))
    wall_ns = _integer(attempt.get("wallNanoseconds"))
    if sample_count <= 0 or sample_rate <= 0:
        _fail("observations")
    return (wall_ns / 1_000_000_000) / (sample_count / sample_rate)


def _quality_result(aggregate: Mapping[str, object]) -> tuple[dict[str, object], bool]:
    dimensions = _mapping(aggregate.get("dimensionMeans"), "quality")
    if (
        aggregate.get("schemaVersion") != "tts-bilingual-quality-aggregate-v8"
        or aggregate.get("candidateId") != PIPER_ENGLISH_CANDIDATE_ID
        or aggregate.get("language") != "en"
        or aggregate.get("evaluatorCount") != 1
        or aggregate.get("blindOrder") is not True
        or aggregate.get("sampleCount") != 5
        or set(dimensions) != set(DIMENSIONS)
    ):
        _fail("quality")
    means = {dimension: _number(dimensions.get(dimension), "quality") for dimension in DIMENSIONS}
    defects = _integer(aggregate.get("meaningChangingDefects"), "quality")
    wrong_language = _integer(aggregate.get("wrongLanguageOutputs"), "quality")
    passed = (
        means["overall-usefulness"] >= 3.25
        and means["intelligibility"] >= 3.25
        and means["naturalness"] >= 3.25
        and min(means.values()) >= 2.75
        and defects == 0
        and wrong_language == 0
    )
    return (
        {
            "language": "en",
            "evaluatorCount": 1,
            "blindOrder": True,
            "overallMean": means["overall-usefulness"],
            "intelligibilityMean": means["intelligibility"],
            "naturalnessMean": means["naturalness"],
            "meaningChangingDefects": defects,
            "wrongLanguageOutputs": wrong_language,
        },
        passed,
    )


def build_content_safe_summary(
    raw: Mapping[str, object],
    quality_aggregate: Mapping[str, object],
) -> dict[str, object]:
    """Derive only fields admitted by the frozen content-safe v8 schema."""

    attempts = tuple(_mapping(value) for value in _sequence(raw.get("attempts")))
    warm = tuple(
        attempt
        for attempt in attempts
        if attempt.get("language") == "en" and attempt.get("phase") == "warm"
    )
    sustained = tuple(
        attempt
        for attempt in attempts
        if attempt.get("language") == "en" and attempt.get("phase") == "sustained"
    )
    completed = tuple(attempt for attempt in attempts if attempt.get("status") == "complete")
    failed = tuple(attempt for attempt in attempts if attempt.get("status") != "complete")
    if len(warm) != 10 or len(sustained) != 15:
        _fail("observations")
    sustained_media_seconds = sum(
        _integer(attempt.get("sampleCount")) / _integer(attempt.get("sampleRateHz"))
        for attempt in sustained
    )
    sustained_wall_seconds = sum(
        _integer(attempt.get("wallNanoseconds")) / 1_000_000_000 for attempt in sustained
    )
    if sustained_media_seconds <= 0:
        _fail("observations")
    raw_failures = {
        cast(str, _mapping(value).get("code")) for value in _sequence(raw.get("failures"))
    }
    quality, quality_passed = _quality_result(quality_aggregate)
    audits = _mapping(raw.get("audits"))
    machine_passed = (
        raw.get("status") == "complete" and not raw_failures and len(completed) == 25 and not failed
    )
    performance_passed = machine_passed and not any(
        code
        in {
            "cold-load-p95",
            "first-audio-p95",
            "warm-rtf-p95",
            "sustained-rtf-p95",
            "total-sustained-rtf",
        }
        for code in raw_failures
    )
    memory_passed = machine_passed and "memory" not in raw_failures
    cancellation_passed = (
        machine_passed
        and "cancellation" not in raw_failures
        and len(_sequence(raw.get("cancellationTrials"))) == 4
    )
    privacy_passed = audits.get("privacy") is True
    cleanup_passed = audits.get("cleanup") is True
    overall_passed = all(
        (
            machine_passed,
            performance_passed,
            memory_passed,
            cancellation_passed,
            quality_passed,
            privacy_passed,
            cleanup_passed,
        )
    )
    memory = _mapping(raw.get("memory"), "memory")
    summary = {
        "schemaVersion": "tts-bilingual-summary-v8",
        "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
        "evaluationStage": "baseline",
        "authorityCommitSha": AUTHORITY_COMMIT_SHA,
        "executionCommitSha": raw.get("executionCommitSha"),
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": PIPER_LOCK_SHA256,
        "status": "complete" if overall_passed else "rejected",
        "languagesEvaluated": ["en"],
        "counts": {
            "firstAttempts": len(attempts),
            "completedGenerations": len(completed),
            "failedGenerations": len(failed),
            "cancellationTrials": len(_sequence(raw.get("cancellationTrials"))),
        },
        "performanceByLanguage": [
            {
                "language": "en",
                "firstAudioP95Seconds": _p95(
                    [
                        _integer(attempt.get("firstAudioNanoseconds")) / 1_000_000_000
                        for attempt in warm
                    ]
                ),
                "warmP95Rtf": _p95([_rtf(attempt) for attempt in warm]),
                "sustainedP95Rtf": _p95([_rtf(attempt) for attempt in sustained]),
                "totalSustainedRtf": sustained_wall_seconds / sustained_media_seconds,
                "failedFirstAttempts": len(failed),
            }
        ],
        "memory": {
            "peakProcessTreeRamBytes": _integer(memory.get("peakProcessTreeRamBytes")),
            "peakDedicatedVramBytes": memory.get("peakDedicatedVramBytes"),
            "minimumAvailableSystemRamBytes": _integer(
                memory.get("minimumAvailableSystemRamBytes")
            ),
        },
        "cancellation": {
            "requiredTrials": 4,
            "passedTrials": sum(
                _mapping(value).get("passed") is True
                for value in _sequence(raw.get("cancellationTrials"))
            ),
            "staleUnits": sum(
                _integer(_mapping(value).get("staleUnits"))
                for value in _sequence(raw.get("cancellationTrials"))
            ),
            "processesRemaining": sum(
                _integer(_mapping(value).get("processesRemaining"))
                for value in _sequence(raw.get("cancellationTrials"))
            ),
        },
        "qualityByLanguage": [quality],
        "audits": {
            "artifacts": audits.get("artifacts") is True,
            "offline": audits.get("offline") is True,
            "networkIsolation": audits.get("networkIsolation") is True,
            "privacy": privacy_passed,
            "boundedRetention": audits.get("boundedRetention") is True,
            "cleanup": cleanup_passed,
            "firstAttemptsOnly": audits.get("firstAttemptsOnly") is True,
        },
        "gates": {
            "machine": "pass" if machine_passed else "fail",
            "performance": "pass" if performance_passed else "fail",
            "memory": "pass" if memory_passed else "fail",
            "cancellation": "pass" if cancellation_passed else "fail",
            "quality": "pass" if quality_passed else "fail",
            "privacy": "pass" if privacy_passed else "fail",
            "cleanup": "pass" if cleanup_passed else "fail",
            "overall": "pass" if overall_passed else "fail",
        },
        "limitations": [
            "single-fluent-english-evaluator",
            "synthetic-five-case-corpus",
            "native-piper-sentence-complete-output",
            "mid-generation-cancellation-by-worker-termination",
            "cold-load-timing-detail-private",
            "per-dimension-quality-detail-private",
            "distribution-obligations-deferred-to-m011",
        ],
    }
    authority = load_frozen_v8_authority(REPOSITORY_ROOT)
    if tuple(Draft202012Validator(authority.summary_schema).iter_errors(summary)):
        _fail("summary-schema")
    return summary


def derive_and_cleanup_result(
    receipt: BaselinePreflightReceipt,
    *,
    machine_session_id: str,
) -> dict[str, object]:
    """Validate evidence, remove all private state, and write one public result."""

    if not receipt.eligible or RESULT_PATH.exists():
        _fail("state")
    session = _session_path(machine_session_id)
    raw = _read_mapping(session / "machine.raw.json")
    aggregate = _read_mapping(session / "quality" / "quality.aggregate.json")
    if (
        raw.get("executionCommitSha") != receipt.expected_commit_sha
        or aggregate.get("sessionId") != machine_session_id
    ):
        _fail("authority")
    validate_v8_raw_result(REPOSITORY_ROOT, raw)
    summary = build_content_safe_summary(raw, aggregate)
    validate_v8_summary_result(REPOSITORY_ROOT, summary)
    payload = (json.dumps(summary, ensure_ascii=True, indent=2, sort_keys=True) + "\n").encode(
        "utf-8"
    )
    shutil.rmtree(session)
    if session.exists():
        _fail("cleanup")
    try:
        RESULT_PATH.write_bytes(payload)
    except OSError:
        _fail("result-write")
    if RESULT_PATH.read_bytes() != payload:
        _fail("result-write")
    gates = cast(dict[str, object], summary["gates"])
    return {
        "status": "pass",
        "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
        "outcome": gates["overall"],
        "resultPath": "benchmarks/tts/piper-english-result-v8.json",
        "privateSessionRemoved": True,
    }
