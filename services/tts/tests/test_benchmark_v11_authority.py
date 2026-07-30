"""Result-blind checks for the Chatterbox RTX 50 compatibility v11 authority."""

from __future__ import annotations

from pathlib import Path
from typing import Final, cast

from jsonschema import Draft202012Validator

from benchmarks.v11_authority import (
    CANDIDATE_ID,
    CANDIDATES_SHA256,
    LOCK_RELATIVE_PATH,
    LOCK_SHA256,
    PROFILE_SHA256,
    V11AuthorityError,
    load_frozen_v11_authority,
    validate_v11_summary_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]


def _summary() -> dict[str, object]:
    return {
        "schemaVersion": "tts-bilingual-summary-v11",
        "candidateId": CANDIDATE_ID,
        "authorityCommitSha": "a" * 40,
        "executionCommitSha": "b" * 40,
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": ("cc140a35688dc0dff7e8c50a5355e920bd2847aa9deac2f7e6256160fb9afcfe"),
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": LOCK_SHA256,
        "status": "measured-awaiting-decision",
        "languagesEvaluated": ["es", "en"],
        "counts": {
            "attempted": 10,
            "completed": 10,
            "failed": 0,
            "cancellationTrials": 8,
        },
        "performanceByLanguage": [
            {
                "language": language,
                "firstAudioP95Seconds": 5.0,
                "warmP95Rtf": 1.4,
            }
            for language in ("es", "en")
        ],
        "memory": {
            "peakProcessTreeRamBytes": 1,
            "peakDedicatedVramBytes": 1,
        },
        "cancellation": {"requiredTrials": 8, "passedTrials": 8},
        "qualityByLanguage": [
            {"language": language, "status": "pending-private-review"} for language in ("es", "en")
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
        "limitations": ["single-host"],
    }


def test_v11_authority_freezes_the_rtx50_compatibility_experiment() -> None:
    authority = load_frozen_v11_authority(REPOSITORY_ROOT)
    candidate = cast(dict[str, object], authority.candidates["profile"])
    runtime = cast(dict[str, object], candidate["runtime"])
    assert runtime["torch"] == "2.9.1+cu128"
    assert runtime["provider"] == "cuda"
    assert runtime["dependencyOverride"] == "explicit-bounded-compatibility-experiment"
    preserved = cast(dict[str, object], authority.candidates["preservesPriorEvidence"])
    assert preserved == {
        "v9Moss": True,
        "v10ChatterboxConfigurationStop": True,
    }


def test_v11_lock_contains_only_the_frozen_cuda_torch_source() -> None:
    lock = (REPOSITORY_ROOT / LOCK_RELATIVE_PATH).read_text(encoding="utf-8")
    assert 'version = "2.9.1+cu128"' in lock
    assert "https://download.pytorch.org/whl/cu128" in lock


def test_v11_schema_keeps_decision_pending() -> None:
    authority = load_frozen_v11_authority(REPOSITORY_ROOT)
    summary = _summary()
    assert not tuple(Draft202012Validator(authority.summary_schema).iter_errors(summary))
    decision = cast(dict[str, object], summary["decision"])
    decision["rejectionRecorded"] = True
    assert tuple(Draft202012Validator(authority.summary_schema).iter_errors(summary))


def test_v11_summary_accepts_advisory_rtf_above_one() -> None:
    validate_v11_summary_result(
        REPOSITORY_ROOT,
        _summary(),
        ancestry_checker=lambda authority, execution: (
            authority == "a" * 40 and execution == "b" * 40
        ),
    )


def test_v11_summary_cannot_record_rejection() -> None:
    summary = _summary()
    cast(dict[str, object], summary["decision"])["rejectionRecorded"] = True
    try:
        validate_v11_summary_result(
            REPOSITORY_ROOT,
            summary,
            ancestry_checker=lambda _authority, _execution: True,
        )
    except V11AuthorityError as error:
        assert str(error) == "tts-benchmark-v11-authority:result-schema"
    else:
        raise AssertionError("rejection-bearing v11 summary was accepted")
