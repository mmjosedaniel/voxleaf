"""Model-free enforcement for the corrective bilingual v9 authority."""

from __future__ import annotations

import copy
import hashlib
from pathlib import Path
from typing import Final, cast

import pytest

import benchmarks.v9_authority as v9_authority
from benchmarks.v8_authority import PROFILE_SHA256 as V8_PROFILE_SHA256
from benchmarks.v9_authority import (
    CANDIDATES_SHA256,
    CHATTERBOX_CANDIDATE_ID,
    CHATTERBOX_LOCK_SHA256,
    EXPECTED_LANGUAGES,
    MOSS_CANDIDATE_ID,
    MOSS_LOCK_SHA256,
    PROFILE_SHA256,
    QWEN_AIDEN_CANDIDATE_ID,
    QWEN_SERENA_CANDIDATE_ID,
    RAW_SCHEMA_SHA256,
    SUMMARY_SCHEMA_SHA256,
    V9AuthorityError,
    load_frozen_v9_authority,
    validate_v9_summary_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
AUTHORITY_COMMIT: Final = "a" * 40
EXECUTION_COMMIT: Final = "b" * 40


def _sha256(path: str) -> str:
    return hashlib.sha256((REPOSITORY_ROOT / path).read_bytes()).hexdigest()


def _summary(candidate_id: str = QWEN_SERENA_CANDIDATE_ID) -> dict[str, object]:
    languages = list(EXPECTED_LANGUAGES[candidate_id])
    lock = {
        QWEN_SERENA_CANDIDATE_ID: v9_authority.v8_authority.QWEN_LOCK_SHA256,
        QWEN_AIDEN_CANDIDATE_ID: v9_authority.v8_authority.QWEN_LOCK_SHA256,
        CHATTERBOX_CANDIDATE_ID: CHATTERBOX_LOCK_SHA256,
        MOSS_CANDIDATE_ID: MOSS_LOCK_SHA256,
    }[candidate_id]
    return {
        "schemaVersion": "tts-bilingual-summary-v9",
        "candidateId": candidate_id,
        "authorityCommitSha": AUTHORITY_COMMIT,
        "executionCommitSha": EXECUTION_COMMIT,
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": v9_authority.v8_authority.v7_authority.CORPUS_SHA256,
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": lock,
        "status": "measured-awaiting-decision",
        "languagesEvaluated": languages,
        "counts": {
            "attempted": 5 * len(languages),
            "completed": 5 * len(languages),
            "failed": 0,
            "cancellationTrials": 4 * len(languages),
        },
        "performanceByLanguage": [
            {
                "language": language,
                "firstAudioP95Seconds": 15.0,
                "warmP95Rtf": 1.44,
            }
            for language in languages
        ],
        "memory": {
            "peakProcessTreeRamBytes": 4_700_000_000,
            "peakDedicatedVramBytes": 4_900_000_000,
        },
        "cancellation": {
            "requiredTrials": 4 * len(languages),
            "passedTrials": 2 * len(languages),
        },
        "qualityByLanguage": [
            {"language": language, "status": "pending-private-review"} for language in languages
        ],
        "audits": {
            "artifacts": True,
            "offline": True,
            "networkIsolation": True,
            "privacy": True,
            "boundedRetention": True,
            "cleanup": True,
        },
        "observations": ["preferred-standard-rtf-target-exceeded"],
        "decision": {
            "state": "pending-maintainer-decision",
            "rejectionRecorded": False,
        },
        "limitations": ["bounded-screen"],
    }


def _validate(value: object) -> None:
    validate_v9_summary_result(
        REPOSITORY_ROOT,
        value,
        ancestry_checker=lambda authority, execution: (
            authority == AUTHORITY_COMMIT and execution == EXECUTION_COMMIT
        ),
    )


def test_v9_authority_is_frozen_without_editing_v8() -> None:
    authority = load_frozen_v9_authority(REPOSITORY_ROOT)
    assert _sha256("benchmarks/tts/profile-v9.json") == PROFILE_SHA256
    assert _sha256("benchmarks/tts/candidates-v9.json") == CANDIDATES_SHA256
    assert _sha256("benchmarks/tts/schemas/bilingual-raw-v9.schema.json") == RAW_SCHEMA_SHA256
    assert (
        _sha256("benchmarks/tts/schemas/bilingual-summary-v9.schema.json") == SUMMARY_SCHEMA_SHA256
    )
    assert _sha256("benchmarks/tts/profile-v8.json") == V8_PROFILE_SHA256
    assert authority.base.profile["profileVersion"] == "tts-bilingual-profile-v8"


def test_v9_forbids_automatic_rejection_and_treats_qwen_rtf_as_advisory() -> None:
    authority = load_frozen_v9_authority(REPOSITORY_ROOT)
    decisions = cast(dict[str, object], authority.profile["decisionRules"])
    product = cast(dict[str, dict[str, object]], authority.profile["productInterpretation"])
    assert decisions["noModelMayBeRejectedByHarness"] is True
    assert decisions["rejectionRequiresExplicitMaintainerDecision"] is True
    assert product["constrainedBufferedMvp"]["knownQwenReferenceRtf"] == 1.44
    assert product["constrainedBufferedMvp"]["rtfAboveOnePermitted"] is True


def test_v9_corrects_chatterbox_lock_and_moss_artifact_identity() -> None:
    authority = load_frozen_v9_authority(REPOSITORY_ROOT)
    profiles = cast(list[dict[str, object]], authority.candidates["profiles"])
    by_id = {cast(str, value["candidateId"]): value for value in profiles}
    chatterbox = by_id[CHATTERBOX_CANDIDATE_ID]
    chatterbox_model = cast(dict[str, object], chatterbox["model"])
    chatterbox_lock = cast(dict[str, object], chatterbox["dependencyLock"])
    assert chatterbox_model["t3Model"] == "v3"
    assert chatterbox_lock["sha256"] == CHATTERBOX_LOCK_SHA256
    moss = by_id[MOSS_CANDIDATE_ID]
    moss_model = cast(dict[str, object], moss["model"])
    artifacts = cast(list[dict[str, object]], moss_model["artifacts"])
    assert len(artifacts) == 16
    assert {artifact["root"] for artifact in artifacts} == {"model", "codec"}


@pytest.mark.parametrize(
    "candidate_id",
    [
        QWEN_SERENA_CANDIDATE_ID,
        QWEN_AIDEN_CANDIDATE_ID,
        CHATTERBOX_CANDIDATE_ID,
        MOSS_CANDIDATE_ID,
    ],
)
def test_v9_summary_accepts_measurements_above_standard_rtf_pending_decision(
    candidate_id: str,
) -> None:
    _validate(_summary(candidate_id))


def test_v9_summary_cannot_record_a_rejection() -> None:
    value = _summary()
    value["status"] = "rejected"
    with pytest.raises(V9AuthorityError, match="result-schema"):
        _validate(value)

    decision = copy.deepcopy(_summary())
    cast(dict[str, object], decision["decision"])["rejectionRecorded"] = True
    with pytest.raises(V9AuthorityError, match="result-schema"):
        _validate(decision)
