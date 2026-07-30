"""Result-blind checks for the corrective full evaluation v12 authority."""

from __future__ import annotations

from pathlib import Path
from typing import Final, cast

from benchmarks.v12_authority import (
    CANDIDATES_SHA256,
    CHATTERBOX_CANDIDATE_ID,
    PROFILE_SHA256,
    QWEN_AIDEN_CANDIDATE_ID,
    QWEN_LANGUAGES,
    QWEN_MACHINE_RESULTS,
    QWEN_SERENA_CANDIDATE_ID,
    V12AuthorityError,
    load_frozen_v12_authority,
    validate_v12_qwen_quality_result,
    validate_v12_summary_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]


def _audits() -> dict[str, object]:
    return {
        "artifacts": True,
        "offline": True,
        "networkIsolation": True,
        "privacy": True,
        "boundedRetention": True,
        "cleanup": True,
    }


def _quality(language: str) -> dict[str, object]:
    return {
        "language": language,
        "status": "reviewed-awaiting-decision",
        "sampleCount": 5,
        "dimensionMeans": {
            "intelligibility": 4.0,
            "naturalness": 4.0,
            "prosody": 4.0,
            "pronunciation": 4.0,
            "language-stability": 4.0,
            "overall-usefulness": 4.0,
        },
        "meaningChangingDefects": 0,
        "wrongLanguageOutputs": 0,
    }


def _chatterbox_summary() -> dict[str, object]:
    return {
        "schemaVersion": "tts-bilingual-full-summary-v12",
        "candidateId": CHATTERBOX_CANDIDATE_ID,
        "authorityCommitSha": "a" * 40,
        "executionCommitSha": "b" * 40,
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": "cc140a35688dc0dff7e8c50a5355e920bd2847aa9deac2f7e6256160fb9afcfe",
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": (
            "30f3ca3c27842d88e04256d357e79c291b90636d4f7e20fca18d20713021b1ab"
        ),
        "status": "measured-awaiting-decision",
        "languagesEvaluated": ["es", "en"],
        "counts": {
            "coldLoads": 5,
            "warmAttempts": 20,
            "sustainedAttempts": 30,
            "failedAttempts": 0,
            "cancellationTrials": 8,
        },
        "performanceByLanguage": [
            {
                "language": language,
                "firstAudioP95Seconds": 4.0,
                "warmP95Rtf": 0.7,
                "sustainedP95Rtf": 0.7,
                "totalSustainedRtf": 0.65,
            }
            for language in ("es", "en")
        ],
        "memory": {
            "peakProcessTreeRamBytes": 1,
            "peakDedicatedVramBytes": 1,
            "minimumAvailableSystemRamBytes": 1,
        },
        "cancellation": {
            "requiredTrials": 8,
            "passedTrials": 8,
            "staleUnits": 0,
            "processesRemaining": 0,
        },
        "qualityByLanguage": [_quality(language) for language in ("es", "en")],
        "audits": _audits(),
        "observations": [],
        "decision": {
            "state": "pending-maintainer-decision",
            "rejectionRecorded": False,
        },
        "limitations": ["single-host"],
    }


def _qwen_summary(candidate_id: str) -> dict[str, object]:
    language = QWEN_LANGUAGES[candidate_id]
    _path, evidence_sha = QWEN_MACHINE_RESULTS[candidate_id]
    quality = _quality(language)
    quality.pop("language")
    return {
        "schemaVersion": "tts-quality-control-summary-v12",
        "candidateId": candidate_id,
        "evaluationStage": "independent-quality-only",
        "authorityCommitSha": "a" * 40,
        "executionCommitSha": "b" * 40,
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": "cc140a35688dc0dff7e8c50a5355e920bd2847aa9deac2f7e6256160fb9afcfe",
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": (
            "1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913"
        ),
        "machineEvidenceSha256": evidence_sha,
        "language": language,
        "quality": quality,
        "audits": _audits(),
        "decision": {
            "state": "pending-maintainer-decision",
            "rejectionRecorded": False,
        },
        "limitations": ["single-host"],
    }


def test_v12_authority_freezes_full_chatterbox_and_two_qwen_controls() -> None:
    authority = load_frozen_v12_authority(REPOSITORY_ROOT)
    profiles = cast(list[dict[str, object]], authority.candidates["profiles"])
    assert [value["candidateId"] for value in profiles] == [
        CHATTERBOX_CANDIDATE_ID,
        QWEN_SERENA_CANDIDATE_ID,
        QWEN_AIDEN_CANDIDATE_ID,
    ]
    matrix = cast(dict[str, object], authority.profile["chatterboxFullMatrix"])
    assert matrix["expectedWarmAttempts"] == 20
    assert matrix["expectedSustainedAttempts"] == 30


def test_v12_chatterbox_summary_accepts_advisory_performance() -> None:
    value = _chatterbox_summary()
    cast(list[dict[str, object]], value["performanceByLanguage"])[0]["warmP95Rtf"] = 1.5
    validate_v12_summary_result(
        REPOSITORY_ROOT,
        value,
        ancestry_checker=lambda authority, execution: (
            authority == "a" * 40 and execution == "b" * 40
        ),
        authority_tree_checker=lambda authority: authority == "a" * 40,
    )


def test_v12_qwen_quality_is_language_specific() -> None:
    for candidate_id in (QWEN_SERENA_CANDIDATE_ID, QWEN_AIDEN_CANDIDATE_ID):
        validate_v12_qwen_quality_result(
            REPOSITORY_ROOT,
            _qwen_summary(candidate_id),
            ancestry_checker=lambda _authority, _execution: True,
            authority_tree_checker=lambda _authority: True,
        )


def test_v12_qwen_quality_rejects_language_substitution() -> None:
    value = _qwen_summary(QWEN_SERENA_CANDIDATE_ID)
    value["language"] = "en"
    try:
        validate_v12_qwen_quality_result(
            REPOSITORY_ROOT,
            value,
            ancestry_checker=lambda _authority, _execution: True,
            authority_tree_checker=lambda _authority: True,
        )
    except V12AuthorityError as error:
        assert str(error) == "tts-benchmark-v12-authority:result-authority"
    else:
        raise AssertionError("language substitution was accepted")


def test_v12_results_cannot_record_a_premature_decision() -> None:
    value = _chatterbox_summary()
    cast(dict[str, object], value["decision"])["rejectionRecorded"] = True
    try:
        validate_v12_summary_result(
            REPOSITORY_ROOT,
            value,
            ancestry_checker=lambda _authority, _execution: True,
            authority_tree_checker=lambda _authority: True,
        )
    except V12AuthorityError as error:
        assert str(error) == "tts-benchmark-v12-authority:result-schema"
    else:
        raise AssertionError("decision-bearing result was accepted")
