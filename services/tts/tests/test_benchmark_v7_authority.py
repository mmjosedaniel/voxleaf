"""Model-free enforcement for the frozen bilingual v7 authority."""

from __future__ import annotations

import copy
import hashlib
from pathlib import Path
from typing import Final, cast

import pytest

import benchmarks.v7_authority as v7_authority
from benchmarks.v7_authority import (
    ADMITTED_CANDIDATE_IDS,
    CANDIDATES_SHA256,
    CHATTERBOX_LOCK_SHA256,
    CORPUS_SHA256,
    MOSS_LOCK_SHA256,
    NORMALIZATION_CORPUS_SHA256,
    PIPER_LOCK_SHA256,
    PROFILE_SHA256,
    RAW_SCHEMA_SHA256,
    REJECTED_CANDIDATE_ID,
    SUMMARY_SCHEMA_SHA256,
    V7AuthorityError,
    load_frozen_v7_authority,
    validate_v7_summary_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
AUTHORITY_COMMIT: Final = "a" * 40
EXECUTION_COMMIT: Final = "b" * 40


def _sha256(path: str) -> str:
    return hashlib.sha256((REPOSITORY_ROOT / path).read_bytes()).hexdigest()


def _summary_fixture(
    candidate_id: str = ADMITTED_CANDIDATE_IDS[0],
) -> dict[str, object]:
    lock = {
        ADMITTED_CANDIDATE_IDS[0]: PIPER_LOCK_SHA256,
        ADMITTED_CANDIDATE_IDS[1]: CHATTERBOX_LOCK_SHA256,
        ADMITTED_CANDIDATE_IDS[2]: MOSS_LOCK_SHA256,
    }[candidate_id]
    return {
        "schemaVersion": "tts-bilingual-summary-v7",
        "candidateId": candidate_id,
        "evaluationStage": "baseline",
        "authorityCommitSha": AUTHORITY_COMMIT,
        "executionCommitSha": EXECUTION_COMMIT,
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": lock,
        "status": "complete",
        "languagesEvaluated": ["en"],
        "counts": {
            "firstAttempts": 10,
            "completedGenerations": 10,
            "failedGenerations": 0,
            "cancellationTrials": 4,
        },
        "performanceByLanguage": [
            {
                "language": "en",
                "firstAudioP95Seconds": 1.0,
                "warmP95Rtf": 0.5,
                "sustainedP95Rtf": 0.6,
                "totalSustainedRtf": 0.55,
                "failedFirstAttempts": 0,
            }
        ],
        "memory": {
            "peakProcessTreeRamBytes": 1_000_000_000,
            "peakDedicatedVramBytes": None,
            "minimumAvailableSystemRamBytes": 8_000_000_000,
        },
        "cancellation": {
            "requiredTrials": 4,
            "passedTrials": 4,
            "staleUnits": 0,
            "processesRemaining": 0,
        },
        "qualityByLanguage": [
            {
                "language": "en",
                "evaluatorCount": 1,
                "blindOrder": True,
                "overallMean": 4.0,
                "intelligibilityMean": 4.0,
                "naturalnessMean": 4.0,
                "meaningChangingDefects": 0,
                "wrongLanguageOutputs": 0,
            }
        ],
        "audits": {
            "artifacts": True,
            "offline": True,
            "networkIsolation": True,
            "privacy": True,
            "boundedRetention": True,
            "cleanup": True,
            "firstAttemptsOnly": True,
        },
        "gates": {
            "machine": "pass",
            "performance": "pass",
            "memory": "pass",
            "cancellation": "pass",
            "quality": "pass",
            "privacy": "pass",
            "cleanup": "pass",
            "overall": "pass",
        },
        "limitations": ["schema-validation-fixture"],
    }


def _validate_summary(value: object) -> None:
    validate_v7_summary_result(
        REPOSITORY_ROOT,
        value,
        ancestry_checker=lambda authority, execution: (
            authority == AUTHORITY_COMMIT and execution == EXECUTION_COMMIT
        ),
        authority_tree_checker=lambda commit: commit == AUTHORITY_COMMIT,
    )


def test_v7_authority_is_byte_frozen_and_schema_valid() -> None:
    authority = load_frozen_v7_authority(REPOSITORY_ROOT)
    assert _sha256("benchmarks/tts/profile-v7.json") == PROFILE_SHA256
    assert _sha256("benchmarks/tts/candidates-v7.json") == CANDIDATES_SHA256
    assert _sha256("benchmarks/tts/normalization-corpus-v2.json") == NORMALIZATION_CORPUS_SHA256
    assert _sha256("benchmarks/tts/corpus-v7.json") == CORPUS_SHA256
    assert _sha256("benchmarks/tts/schemas/bilingual-raw-v7.schema.json") == RAW_SCHEMA_SHA256
    assert (
        _sha256("benchmarks/tts/schemas/bilingual-summary-v7.schema.json") == SUMMARY_SCHEMA_SHA256
    )
    assert authority.profile["status"] == (
        "frozen-before-v7-implementation-pilot-and-official-results"
    )


def test_v7_candidate_intake_is_exact_bounded_and_locked() -> None:
    authority = load_frozen_v7_authority(REPOSITORY_ROOT)
    candidates = cast(list[dict[str, object]], authority.candidates["candidates"])
    by_id = {cast(str, item["candidateId"]): item for item in candidates}
    assert set(by_id) == {*ADMITTED_CANDIDATE_IDS, REJECTED_CANDIDATE_ID}
    assert (
        cast(dict[str, object], by_id[ADMITTED_CANDIDATE_IDS[0]]["dependencyLock"])["sha256"]
        == PIPER_LOCK_SHA256
    )
    assert (
        cast(dict[str, object], by_id[ADMITTED_CANDIDATE_IDS[1]]["dependencyLock"])["sha256"]
        == CHATTERBOX_LOCK_SHA256
    )
    assert (
        cast(dict[str, object], by_id[ADMITTED_CANDIDATE_IDS[2]]["dependencyLock"])["sha256"]
        == MOSS_LOCK_SHA256
    )
    assert by_id[REJECTED_CANDIDATE_ID]["dependencyLock"] is None
    assert by_id[REJECTED_CANDIDATE_ID]["intakeDecision"] == ("rejected-before-environment-lock")


def test_v7_corpora_are_bilingual_counted_unique_and_synthetic() -> None:
    authority = load_frozen_v7_authority(REPOSITORY_ROOT)
    normalization_cases = cast(
        list[dict[str, object]],
        authority.normalization_corpus["cases"],
    )
    evaluation_cases = cast(list[dict[str, object]], authority.corpus["cases"])
    assert len(normalization_cases) == 16
    assert {case["language"] for case in normalization_cases} == {"es", "en"}
    assert len({case["caseId"] for case in normalization_cases}) == 16
    assert len(evaluation_cases) == 10
    assert [case["language"] for case in evaluation_cases].count("es") == 5
    assert [case["language"] for case in evaluation_cases].count("en") == 5
    assert len({case["caseId"] for case in evaluation_cases}) == 10
    assert authority.corpus["provenance"] == {
        "author": "VoxLeaf contributors",
        "createdAt": "2026-07-29",
        "kind": "repository-authored-synthetic",
        "license": "CC0-1.0",
        "sourceMaterial": "none",
    }


def test_v7_has_no_result_bearing_file_before_authority_commit() -> None:
    result_paths = sorted(
        path.name for path in (REPOSITORY_ROOT / "benchmarks/tts").glob("*result-v7*.json")
    )
    assert result_paths == []


def test_v7_summary_accepts_only_admitted_exact_candidate_locks() -> None:
    for candidate_id in ADMITTED_CANDIDATE_IDS:
        _validate_summary(_summary_fixture(candidate_id))

    rejected = _summary_fixture()
    rejected["candidateId"] = REJECTED_CANDIDATE_ID
    with pytest.raises(V7AuthorityError, match="result-schema"):
        _validate_summary(rejected)

    wrong_lock = _summary_fixture()
    wrong_lock["dependencyLockSha256"] = "0" * 64
    with pytest.raises(V7AuthorityError, match="result-before-authority"):
        _validate_summary(wrong_lock)


def test_v7_summary_rejects_substitute_hash_commit_and_private_content() -> None:
    wrong_hash = _summary_fixture()
    wrong_hash["profileSha256"] = "0" * 64
    with pytest.raises(V7AuthorityError, match="result-before-authority"):
        _validate_summary(wrong_hash)

    same_commit = _summary_fixture()
    same_commit["executionCommitSha"] = AUTHORITY_COMMIT
    with pytest.raises(V7AuthorityError, match="result-before-authority"):
        _validate_summary(same_commit)

    private = copy.deepcopy(_summary_fixture())
    private["narrationText"] = "private synthetic narration"
    with pytest.raises(V7AuthorityError, match="result-schema|private-content"):
        _validate_summary(private)


def test_v7_result_rejects_a_commit_without_the_frozen_authority_tree(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        v7_authority,
        "_git_authority_tree_matches",
        lambda _root, _commit: False,
    )
    with pytest.raises(V7AuthorityError, match="result-before-authority"):
        validate_v7_summary_result(
            REPOSITORY_ROOT,
            _summary_fixture(),
            ancestry_checker=lambda _authority, _execution: True,
        )
