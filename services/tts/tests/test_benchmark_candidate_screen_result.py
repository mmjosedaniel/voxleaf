"""Content-safe result checks for the corrective MOSS and Chatterbox screens."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Final, cast

from jsonschema import Draft202012Validator

from benchmarks.candidate_screen_result import (
    CHATTERBOX_SPEC,
    MOSS_SPEC,
    _validate_private_review,
    build_content_safe_summary,
)
from benchmarks.v9_authority import load_frozen_v9_authority
from benchmarks.v11_authority import load_frozen_v11_authority

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]


def _raw(spec: object) -> dict[str, object]:
    selected = MOSS_SPEC if spec is MOSS_SPEC else CHATTERBOX_SPEC
    version = "v9" if selected is MOSS_SPEC else "v11"
    attempts = [
        {
            "caseId": f"{language}-case-{index}",
            "language": language,
            "sampleCount": 24_000,
            "sampleRateHz": 24_000,
            "channels": 1,
            "wallNanoseconds": 650_000_000,
            "firstAudioNanoseconds": 650_000_000,
            "status": "complete",
        }
        for language in ("es", "en")
        for index in range(5)
    ]
    cancellations = [
        {
            "trialId": trial,
            "language": language,
            "passed": True,
            "stopNanoseconds": 1,
            "cleanupNanoseconds": 1,
        }
        for language in ("es", "en")
        for trial in (
            "before-dispatch",
            "accepted-before-audio",
            "after-first-audio",
            "near-hard-mid-generation",
        )
    ]
    return {
        "schemaVersion": f"tts-bilingual-raw-{version}",
        "candidateId": selected.candidate_id,
        "authorityCommitSha": "a" * 40,
        "executionCommitSha": "b" * 40,
        "profileSha256": "c" * 64,
        "corpusSha256": "d" * 64,
        "candidateManifestSha256": "e" * 64,
        "dependencyLockSha256": "f" * 64,
        "status": "measured-awaiting-decision",
        "languagesEvaluated": ["es", "en"],
        "attempts": attempts,
        "cancellationTrials": cancellations,
        "memory": {
            "peakProcessTreeRamBytes": 1,
            "peakDedicatedVramBytes": None if selected is MOSS_SPEC else 1,
        },
        "audits": {
            "artifacts": True,
            "offline": True,
            "networkIsolation": True,
            "privacy": True,
            "boundedRetention": True,
            "cleanup": True,
        },
        "observations": [],
        "decision": {"state": "pending-maintainer-decision"},
    }


def test_moss_summary_remains_pending_while_recording_review_completion() -> None:
    raw = _raw(MOSS_SPEC)
    summary = build_content_safe_summary(MOSS_SPEC, raw, validate_authority=False)
    authority = load_frozen_v9_authority(REPOSITORY_ROOT)
    errors = tuple(Draft202012Validator(authority.summary_schema).iter_errors(summary))
    assert not errors
    assert summary["decision"] == {
        "state": "pending-maintainer-decision",
        "rejectionRecorded": False,
    }
    quality = cast(list[dict[str, object]], summary["qualityByLanguage"])
    assert {value["status"] for value in quality} == {"reviewed-awaiting-decision"}
    assert "dialogue-tail-omission-reported-in-both-languages" in cast(
        list[str], summary["limitations"]
    )


def test_chatterbox_summary_preserves_advisory_performance() -> None:
    raw = _raw(CHATTERBOX_SPEC)
    raw["observations"] = ["preferred-process-ram-target-exceeded"]
    summary = build_content_safe_summary(
        CHATTERBOX_SPEC,
        raw,
        validate_authority=False,
    )
    authority = load_frozen_v11_authority(REPOSITORY_ROOT)
    errors = tuple(Draft202012Validator(authority.summary_schema).iter_errors(summary))
    assert not errors
    assert summary["status"] == "measured-awaiting-decision"
    assert summary["observations"] == ["preferred-process-ram-target-exceeded"]
    assert "experimental-torch-dependency-override" in cast(list[str], summary["limitations"])


def test_private_scorecard_must_match_the_blinded_sample_map(tmp_path: Path) -> None:
    raw_path = tmp_path / "machine.raw.json"
    raw_path.write_text("{}\n", encoding="utf-8")
    samples = [
        {"sampleId": f"{index:032x}", "caseId": f"case-{index}", "language": language}
        for index, language in enumerate(("es",) * 5 + ("en",) * 5)
    ]
    private_map = {
        "schemaVersion": MOSS_SPEC.private_map_schema_version,
        "sessionId": MOSS_SPEC.session_id,
        "candidateId": MOSS_SPEC.candidate_id,
        "blindOrder": True,
        "machineRawSha256": hashlib.sha256(raw_path.read_bytes()).hexdigest(),
        "samples": samples,
    }
    scorecard = {
        "schemaVersion": MOSS_SPEC.quality_schema_version,
        "sessionId": MOSS_SPEC.session_id,
        "candidateId": MOSS_SPEC.candidate_id,
        "evaluatorCount": 1,
        "blindOrder": True,
        "samples": [
            {
                "sampleId": sample["sampleId"],
                "language": sample["language"],
                "scores": {
                    dimension: 5
                    for dimension in (
                        "intelligibility",
                        "naturalness",
                        "prosody",
                        "pronunciation",
                        "language-stability",
                        "overall-usefulness",
                    )
                },
                "meaningChangingDefect": False,
                "wrongLanguage": False,
            }
            for sample in samples
        ],
    }
    aggregate = _validate_private_review(
        MOSS_SPEC,
        raw_path=raw_path,
        private_map=private_map,
        scorecard=scorecard,
    )
    assert aggregate["sampleCount"] == 10
    assert aggregate["meaningChangingDefects"] == 0
    assert aggregate["wrongLanguageOutputs"] == 0
