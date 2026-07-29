"""Model-free enforcement for the superseding bilingual v8 authority."""

from __future__ import annotations

import copy
import hashlib
from pathlib import Path
from typing import Final, cast

import pytest

import benchmarks.v8_authority as v8_authority
from benchmarks.v7_authority import (
    CANDIDATES_SHA256 as V7_CANDIDATES_SHA256,
)
from benchmarks.v7_authority import (
    CHATTERBOX_LOCK_SHA256,
    CORPUS_SHA256,
    MOSS_LOCK_SHA256,
    PIPER_LOCK_SHA256,
)
from benchmarks.v7_authority import (
    PROFILE_SHA256 as V7_PROFILE_SHA256,
)
from benchmarks.v8_authority import (
    ADDED_CANDIDATE_IDS,
    ADMITTED_CANDIDATE_IDS,
    CANDIDATES_SHA256,
    EXPECTED_LANGUAGES,
    PROFILE_SHA256,
    QWEN_AIDEN_CANDIDATE_ID,
    QWEN_LOCK_SHA256,
    QWEN_SERENA_CANDIDATE_ID,
    RAW_SCHEMA_SHA256,
    SUMMARY_SCHEMA_SHA256,
    V8AuthorityError,
    load_frozen_v8_authority,
    validate_v8_summary_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
AUTHORITY_COMMIT: Final = "a" * 40
EXECUTION_COMMIT: Final = "b" * 40


def _sha256(path: str) -> str:
    return hashlib.sha256((REPOSITORY_ROOT / path).read_bytes()).hexdigest()


def _lock_for(candidate_id: str) -> str:
    return {
        ADMITTED_CANDIDATE_IDS[0]: PIPER_LOCK_SHA256,
        QWEN_SERENA_CANDIDATE_ID: QWEN_LOCK_SHA256,
        QWEN_AIDEN_CANDIDATE_ID: QWEN_LOCK_SHA256,
        ADMITTED_CANDIDATE_IDS[3]: CHATTERBOX_LOCK_SHA256,
        ADMITTED_CANDIDATE_IDS[4]: MOSS_LOCK_SHA256,
    }[candidate_id]


def _stage_for(candidate_id: str) -> str:
    return {
        ADMITTED_CANDIDATE_IDS[0]: "baseline",
        QWEN_SERENA_CANDIDATE_ID: "existing-engine-control",
        QWEN_AIDEN_CANDIDATE_ID: "existing-engine-control",
        ADMITTED_CANDIDATE_IDS[3]: "screen",
        ADMITTED_CANDIDATE_IDS[4]: "screen",
    }[candidate_id]


def _summary_fixture(
    candidate_id: str = QWEN_AIDEN_CANDIDATE_ID,
) -> dict[str, object]:
    languages = list(EXPECTED_LANGUAGES[candidate_id])
    cancellation_trials = len(languages) * 4
    return {
        "schemaVersion": "tts-bilingual-summary-v8",
        "candidateId": candidate_id,
        "evaluationStage": _stage_for(candidate_id),
        "authorityCommitSha": AUTHORITY_COMMIT,
        "executionCommitSha": EXECUTION_COMMIT,
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": _lock_for(candidate_id),
        "status": "complete",
        "languagesEvaluated": languages,
        "counts": {
            "firstAttempts": len(languages) * 10,
            "completedGenerations": len(languages) * 10,
            "failedGenerations": 0,
            "cancellationTrials": cancellation_trials,
        },
        "performanceByLanguage": [
            {
                "language": language,
                "firstAudioP95Seconds": 1.0,
                "warmP95Rtf": 0.5,
                "sustainedP95Rtf": 0.6,
                "totalSustainedRtf": 0.55,
                "failedFirstAttempts": 0,
            }
            for language in languages
        ],
        "memory": {
            "peakProcessTreeRamBytes": 1_000_000_000,
            "peakDedicatedVramBytes": 6_000_000_000,
            "minimumAvailableSystemRamBytes": 8_000_000_000,
        },
        "cancellation": {
            "requiredTrials": cancellation_trials,
            "passedTrials": cancellation_trials,
            "staleUnits": 0,
            "processesRemaining": 0,
        },
        "qualityByLanguage": [
            {
                "language": language,
                "evaluatorCount": 1,
                "blindOrder": True,
                "overallMean": 4.0,
                "intelligibilityMean": 4.0,
                "naturalnessMean": 4.0,
                "meaningChangingDefects": 0,
                "wrongLanguageOutputs": 0,
            }
            for language in languages
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
    validate_v8_summary_result(
        REPOSITORY_ROOT,
        value,
        ancestry_checker=lambda authority, execution: (
            authority == AUTHORITY_COMMIT and execution == EXECUTION_COMMIT
        ),
        authority_tree_checker=lambda commit: commit == AUTHORITY_COMMIT,
    )


def test_v8_authority_is_byte_frozen_and_keeps_v7_unchanged() -> None:
    authority = load_frozen_v8_authority(REPOSITORY_ROOT)
    assert _sha256("benchmarks/tts/profile-v8.json") == PROFILE_SHA256
    assert _sha256("benchmarks/tts/candidates-v8.json") == CANDIDATES_SHA256
    assert _sha256("benchmarks/tts/schemas/bilingual-raw-v8.schema.json") == (RAW_SCHEMA_SHA256)
    assert _sha256("benchmarks/tts/schemas/bilingual-summary-v8.schema.json") == (
        SUMMARY_SCHEMA_SHA256
    )
    assert _sha256("benchmarks/tts/profile-v7.json") == V7_PROFILE_SHA256
    assert _sha256("benchmarks/tts/candidates-v7.json") == V7_CANDIDATES_SHA256
    assert authority.profile["status"] == (
        "frozen-before-v8-implementation-pilot-and-official-results"
    )


def test_v8_adds_exact_local_qwen_serena_and_aiden_profiles() -> None:
    authority = load_frozen_v8_authority(REPOSITORY_ROOT)
    candidates = cast(list[dict[str, object]], authority.candidates["addedCandidates"])
    assert tuple(candidate["candidateId"] for candidate in candidates) == (ADDED_CANDIDATE_IDS)
    serena_voice = cast(dict[str, object], candidates[0]["voice"])
    aiden_voice = cast(dict[str, object], candidates[1]["voice"])
    assert (serena_voice["speaker"], serena_voice["evaluationLanguage"]) == (
        "Serena",
        "es",
    )
    assert (aiden_voice["speaker"], aiden_voice["evaluationLanguage"]) == (
        "Aiden",
        "en",
    )
    for candidate in candidates:
        lock = cast(dict[str, object], candidate["dependencyLock"])
        model = cast(dict[str, object], candidate["model"])
        assert lock["sha256"] == QWEN_LOCK_SHA256
        assert model["repository"] == "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"
        assert model["revision"] == "0c0e3051f131929182e2c023b9537f8b1c68adfe"


def test_v8_excludes_cloud_voice_cloning_voice_design_and_extra_english_voice() -> None:
    authority = load_frozen_v8_authority(REPOSITORY_ROOT)
    excluded = cast(list[dict[str, object]], authority.candidates["excluded"])
    assert {entry["candidateId"] for entry in excluded} == {
        "qwen3-tts-cloud-realtime",
        "qwen3-tts-1-7b-customvoice-cuda-bf16-ryan-en",
        "qwen3-tts-1-7b-base-voice-cloning",
        "qwen3-tts-1-7b-voicedesign",
    }


def test_v8_supersedes_resultless_v7_before_any_result() -> None:
    result_paths = sorted(
        path.name for path in (REPOSITORY_ROOT / "benchmarks/tts").glob("*result-v[78]*.json")
    )
    assert result_paths == []
    authority = load_frozen_v8_authority(REPOSITORY_ROOT)
    supersedes = cast(dict[str, object], authority.profile["supersedes"])
    assert supersedes["v7ResultFilesPresent"] == 0


def test_v8_summary_accepts_only_exact_candidate_language_stage_and_lock() -> None:
    for candidate_id in ADMITTED_CANDIDATE_IDS:
        _validate_summary(_summary_fixture(candidate_id))

    wrong_language = _summary_fixture(QWEN_AIDEN_CANDIDATE_ID)
    wrong_language["languagesEvaluated"] = ["es"]
    with pytest.raises(V8AuthorityError, match="result-before-authority"):
        _validate_summary(wrong_language)

    wrong_stage = _summary_fixture(QWEN_SERENA_CANDIDATE_ID)
    wrong_stage["evaluationStage"] = "baseline"
    with pytest.raises(V8AuthorityError, match="result-before-authority"):
        _validate_summary(wrong_stage)

    wrong_lock = _summary_fixture(QWEN_AIDEN_CANDIDATE_ID)
    wrong_lock["dependencyLockSha256"] = "0" * 64
    with pytest.raises(V8AuthorityError, match="result-before-authority"):
        _validate_summary(wrong_lock)


def test_v8_summary_rejects_substitute_hash_commit_and_private_content() -> None:
    wrong_hash = _summary_fixture()
    wrong_hash["profileSha256"] = "0" * 64
    with pytest.raises(V8AuthorityError, match="result-before-authority"):
        _validate_summary(wrong_hash)

    same_commit = _summary_fixture()
    same_commit["executionCommitSha"] = AUTHORITY_COMMIT
    with pytest.raises(V8AuthorityError, match="result-before-authority"):
        _validate_summary(same_commit)

    private = copy.deepcopy(_summary_fixture())
    private["narrationText"] = "private synthetic narration"
    with pytest.raises(V8AuthorityError, match="result-schema|private-content"):
        _validate_summary(private)


def test_v8_result_rejects_commit_without_complete_v7_and_v8_authority_tree(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        v8_authority,
        "_git_authority_tree_matches",
        lambda _root, _commit: False,
    )
    with pytest.raises(V8AuthorityError, match="result-before-authority"):
        validate_v8_summary_result(
            REPOSITORY_ROOT,
            _summary_fixture(),
            ancestry_checker=lambda _authority, _execution: True,
        )
