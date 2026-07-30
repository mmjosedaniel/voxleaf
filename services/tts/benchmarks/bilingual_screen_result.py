"""Content-safe v8 derivation for bounded controls and candidate screens."""

from __future__ import annotations

import hashlib
import json
import shutil
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Final, NoReturn, cast

from benchmarks.bilingual_screen import AUTHORITY_COMMIT_SHA, RAW_ROOT, REPOSITORY_ROOT
from benchmarks.metrics import distribution
from benchmarks.preflight import GitRepositoryProbe
from benchmarks.v7_authority import CORPUS_SHA256
from benchmarks.v8_authority import (
    ADDED_CANDIDATE_IDS,
    CANDIDATES_SHA256,
    EXPECTED_LANGUAGES,
    EXPECTED_STAGES,
    PROFILE_SHA256,
    QWEN_LOCK_SHA256,
    validate_v8_raw_result,
    validate_v8_summary_result,
)

RESULT_NAMES: Final = {
    ADDED_CANDIDATE_IDS[0]: "qwen-serena-spanish-control-result-v8.json",
    ADDED_CANDIDATE_IDS[1]: "qwen-aiden-english-control-result-v8.json",
}


class BilingualScreenResultError(RuntimeError):
    """Fixed content-free screen result failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-bilingual-screen-result:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise BilingualScreenResultError(code)


def _mapping(value: object) -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail("result")
    return cast(Mapping[str, object], value)


def _sequence(value: object) -> Sequence[object]:
    if not isinstance(value, list):
        _fail("result")
    return cast(Sequence[object], value)


def _integer(value: object) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        _fail("result")
    return value


def _read(path: Path, maximum_bytes: int = 262_144) -> Mapping[str, object]:
    try:
        payload = path.read_bytes()
        if len(payload) > maximum_bytes:
            _fail("result-size")
        value = cast(object, json.loads(payload))
    except (OSError, UnicodeError, json.JSONDecodeError):
        _fail("result")
    return _mapping(value)


def _session(candidate_id: str, session_id: str) -> Path:
    if candidate_id not in RESULT_NAMES:
        _fail("candidate")
    root = RAW_ROOT.resolve()
    path = (root / candidate_id / session_id).resolve()
    try:
        relative = path.relative_to(root)
    except ValueError:
        _fail("session")
    if (
        len(relative.parts) != 2
        or len(session_id) != 32
        or any(value not in "0123456789abcdef" for value in session_id)
        or not path.is_dir()
    ):
        _fail("session")
    return path


def validate_machine_session(
    *,
    candidate_id: str,
    expected_commit_sha: str,
    session_id: str,
) -> dict[str, object]:
    """Validate candidate-produced raw evidence in the repository environment."""

    session = _session(candidate_id, session_id)
    raw_path = session / "machine.raw.json"
    raw = _read(raw_path)
    if (
        raw.get("candidateId") != candidate_id
        or raw.get("executionCommitSha") != expected_commit_sha
    ):
        _fail("authority")
    validate_v8_raw_result(REPOSITORY_ROOT, raw)
    marker = {
        "schemaVersion": "tts-bilingual-machine-validation-v8",
        "candidateId": candidate_id,
        "executionCommitSha": expected_commit_sha,
        "rawSha256": hashlib.sha256(raw_path.read_bytes()).hexdigest(),
    }
    (session / "machine.validated.json").write_text(
        json.dumps(marker, ensure_ascii=True, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return {
        "status": "pass",
        "candidateId": candidate_id,
        "sessionId": session_id,
        "rawStatus": raw["status"],
    }


def _p95(values: Sequence[float]) -> float:
    if not values:
        _fail("observations")
    return distribution(tuple(values)).p95


def _rtf(attempt: Mapping[str, object]) -> float:
    samples = _integer(attempt.get("sampleCount"))
    rate = _integer(attempt.get("sampleRateHz"))
    wall = _integer(attempt.get("wallNanoseconds"))
    if samples <= 0 or rate <= 0:
        _fail("observations")
    return (wall / 1_000_000_000) / (samples / rate)


def build_rejected_summary(raw: Mapping[str, object]) -> dict[str, object]:
    """Build a closed summary after a machine stop condition rejects a screen."""

    candidate_id = raw.get("candidateId")
    if (
        candidate_id not in RESULT_NAMES
        or raw.get("status") != "rejected"
        or raw.get("evaluationStage") not in EXPECTED_STAGES[candidate_id]
    ):
        _fail("state")
    languages = EXPECTED_LANGUAGES[candidate_id]
    attempts = tuple(_mapping(value) for value in _sequence(raw.get("attempts")))
    completed = tuple(value for value in attempts if value.get("status") == "complete")
    failed = tuple(value for value in attempts if value.get("status") != "complete")
    failure_codes = {
        cast(str, _mapping(value).get("code")) for value in _sequence(raw.get("failures"))
    }
    performance: list[dict[str, object]] = []
    for language in languages:
        selected = tuple(value for value in attempts if value.get("language") == language)
        if not selected:
            continue
        rtfs = [_rtf(value) for value in selected]
        total_media = sum(
            _integer(value.get("sampleCount")) / _integer(value.get("sampleRateHz"))
            for value in selected
        )
        total_wall = sum(
            _integer(value.get("wallNanoseconds")) / 1_000_000_000 for value in selected
        )
        performance.append(
            {
                "language": language,
                "firstAudioP95Seconds": _p95(
                    [
                        _integer(value.get("firstAudioNanoseconds")) / 1_000_000_000
                        for value in selected
                    ]
                ),
                "warmP95Rtf": _p95(rtfs),
                "sustainedP95Rtf": _p95(rtfs),
                "totalSustainedRtf": total_wall / total_media,
                "failedFirstAttempts": sum(value.get("status") != "complete" for value in selected),
            }
        )
    cancellations = tuple(_mapping(value) for value in _sequence(raw.get("cancellationTrials")))
    expected_cancellations = 4 * len(languages)
    machine_passed = (
        len(completed) == 5 * len(languages)
        and not failed
        and not failure_codes.intersection(
            {
                "first-attempt-failure",
                "generation-failed",
                "invalid-output",
                "load-failed",
                "timeout",
                "crash",
            }
        )
    )
    performance_passed = machine_passed and not failure_codes.intersection(
        {"cold-load-p95", "first-audio-p95", "warm-rtf-p95"}
    )
    memory = raw.get("memory")
    memory_passed = memory is not None and "memory" not in failure_codes
    cancellation_passed = (
        len(cancellations) == expected_cancellations and "cancellation" not in failure_codes
    )
    audits = _mapping(raw.get("audits"))
    privacy_passed = audits.get("privacy") is True
    cleanup_passed = audits.get("cleanup") is True
    summary = {
        "schemaVersion": "tts-bilingual-summary-v8",
        "candidateId": candidate_id,
        "evaluationStage": raw.get("evaluationStage"),
        "authorityCommitSha": AUTHORITY_COMMIT_SHA,
        "executionCommitSha": raw.get("executionCommitSha"),
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": QWEN_LOCK_SHA256,
        "status": "rejected",
        "languagesEvaluated": list(languages),
        "counts": {
            "firstAttempts": len(attempts),
            "completedGenerations": len(completed),
            "failedGenerations": len(failed),
            "cancellationTrials": len(cancellations),
        },
        "performanceByLanguage": performance,
        "memory": memory,
        "cancellation": {
            "requiredTrials": expected_cancellations,
            "passedTrials": sum(value.get("passed") is True for value in cancellations),
            "staleUnits": sum(_integer(value.get("staleUnits")) for value in cancellations),
            "processesRemaining": sum(
                _integer(value.get("processesRemaining")) for value in cancellations
            ),
        },
        "qualityByLanguage": [
            {"language": language, "status": "not-admitted"} for language in languages
        ],
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
            "quality": "not-admitted",
            "privacy": "pass" if privacy_passed else "fail",
            "cleanup": "pass" if cleanup_passed else "fail",
            "overall": "fail",
        },
        "limitations": [
            "bounded-screen-one-warm-attempt-per-case",
            "screen-warm-metrics-repeated-in-sustained-schema-fields",
            "quality-not-admitted-after-machine-rejection",
            "complete-waveform-high-level-api",
            "distribution-obligations-deferred-to-m011",
        ],
    }
    validate_v8_summary_result(
        REPOSITORY_ROOT,
        summary,
        ancestry_checker=lambda authority, execution: authority != execution,
        authority_tree_checker=lambda authority: authority == AUTHORITY_COMMIT_SHA,
    )
    return summary


def derive_rejected_and_cleanup(
    *,
    candidate_id: str,
    expected_commit_sha: str,
    session_id: str,
) -> dict[str, object]:
    """Remove the complete private rejected session before writing its summary."""

    repository = GitRepositoryProbe().snapshot(REPOSITORY_ROOT)
    result_name = RESULT_NAMES.get(candidate_id)
    if result_name is None:
        _fail("candidate")
    result_path = REPOSITORY_ROOT / "benchmarks" / "tts" / result_name
    if result_path.exists() or not repository.clean or repository.commit_sha != expected_commit_sha:
        _fail("state")
    session = _session(candidate_id, session_id)
    raw = _read(session / "machine.raw.json")
    marker = _read(session / "machine.validated.json")
    if (
        raw.get("executionCommitSha") != expected_commit_sha
        or raw.get("status") != "rejected"
        or marker.get("rawSha256")
        != hashlib.sha256((session / "machine.raw.json").read_bytes()).hexdigest()
    ):
        _fail("state")
    validate_v8_raw_result(REPOSITORY_ROOT, raw)
    summary = build_rejected_summary(raw)
    validate_v8_summary_result(REPOSITORY_ROOT, summary)
    payload = (json.dumps(summary, ensure_ascii=True, indent=2, sort_keys=True) + "\n").encode(
        "utf-8"
    )
    shutil.rmtree(session)
    if session.exists():
        _fail("cleanup")
    result_path.write_bytes(payload)
    if result_path.read_bytes() != payload:
        _fail("result-write")
    return {
        "status": "pass",
        "candidateId": candidate_id,
        "outcome": "fail",
        "resultPath": result_path.relative_to(REPOSITORY_ROOT).as_posix(),
        "privateSessionRemoved": True,
    }
