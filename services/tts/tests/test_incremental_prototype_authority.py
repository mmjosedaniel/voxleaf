"""Frozen pre-result authority for the incremental/cancellation prototype."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from pathlib import Path
from typing import Final, cast

from jsonschema import Draft202012Validator

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
PROTOTYPE_PATH: Final = (
    REPOSITORY_ROOT / "benchmarks" / "tts" / "incremental-cancellation-prototype-v1.json"
)
SCHEMA_PATH: Final = (
    REPOSITORY_ROOT
    / "benchmarks"
    / "tts"
    / "schemas"
    / "incremental-cancellation-prototype-result-v1.schema.json"
)
PROFILE_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "profile-v3.json"
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v1.json"
RESULT_PATH: Final = (
    REPOSITORY_ROOT / "benchmarks" / "tts" / "incremental-cancellation-prototype-result-v1.json"
)
EXPECTED_HASHES: Final = {
    PROTOTYPE_PATH: "09f3ca90ad6f1a4e8f9cbdce8fb66127694ddee7ad69536d4d694b56801179be",
    SCHEMA_PATH: "8b99efcaa1f817ad29693c254b506b248879794ed2990faa5d57fb93b4cb7058",
    RESULT_PATH: "32d72315cb6a3a64a2d68b770c3bf8ef6ec4d244def8a04b8db4bb7aef3dfea5",
}
TRIAL_ORDER: Final = [
    "before-dispatch",
    "accepted-before-audio",
    "after-first-audio",
    "near-hard-mid-generation",
    "during-cleanup",
]


def _load(path: Path) -> Mapping[str, object]:
    return cast(Mapping[str, object], json.loads(path.read_text(encoding="utf-8")))


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def test_prototype_authority_schema_and_safe_result_are_byte_frozen() -> None:
    for path, expected in EXPECTED_HASHES.items():
        assert _sha256(path) == expected

    schema = _load(SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    assert schema["additionalProperties"] is False
    result = _load(RESULT_PATH)
    Draft202012Validator(schema).validate(result)
    assert result["passed"] is True
    assert result["failureCodes"] == []


def test_prototype_is_bound_to_the_exact_v3_configuration_before_results() -> None:
    authority = _load(PROTOTYPE_PATH)
    profile = _load(PROFILE_PATH)
    candidate = cast(Mapping[str, object], profile["candidate"])
    profile_reference = cast(Mapping[str, object], authority["candidateProfile"])
    configuration = {
        "candidateId": candidate["candidateId"],
        "model": candidate["model"],
        "voice": candidate["voice"],
        "runtime": candidate["runtime"],
        "generation": candidate["generation"],
    }
    configuration_hash = hashlib.sha256(
        json.dumps(
            configuration,
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
        ).encode()
    ).hexdigest()

    assert authority["prototypeVersion"] == "incremental-cancellation-prototype-v1"
    assert authority["status"] == "frozen-before-prototype-results"
    assert authority["candidateId"] == candidate["candidateId"]
    assert profile_reference == {
        "path": "benchmarks/tts/profile-v3.json",
        "sha256": _sha256(PROFILE_PATH),
    }
    assert authority["configurationIdentitySha256"] == configuration_hash


def test_prototype_input_output_identity_and_trial_bounds_are_closed() -> None:
    authority = _load(PROTOTYPE_PATH)
    corpus = _load(CORPUS_PATH)
    input_authority = cast(Mapping[str, object], authority["inputAuthority"])
    output_authority = cast(Mapping[str, object], authority["outputAuthority"])
    identity = cast(Mapping[str, object], authority["identityAuthority"])
    timing = cast(Mapping[str, object], authority["timingAuthority"])
    topology = cast(Mapping[str, object], authority["topology"])
    raw_cases = cast(list[Mapping[str, object]], corpus["cases"])
    cases = {cast(str, case["caseId"]): cast(str, case["text"]) for case in raw_cases}
    case_ids = (
        *cast(list[str], input_authority["normalDeliveryCaseIds"]),
        cast(str, input_authority["cancellationCaseId"]),
    )

    assert authority["trialOrder"] == TRIAL_ORDER
    assert topology["nativeGenerationGranularity"] == "complete-waveform"
    assert topology["publishedUnitGranularity"] == ("one-complete-waveform-per-narration-segment")
    assert topology["midSegmentStopMode"] == "worker-process-termination"
    assert topology["automaticRetries"] == 0
    assert input_authority["batchSize"] == 1
    assert input_authority["maximumActiveSegments"] == 1
    assert input_authority["maximumQueuedSegments"] == 1
    assert all(len(cases[case_id]) <= 640 for case_id in case_ids)
    assert all(len(cases[case_id].encode()) <= 2048 for case_id in case_ids)
    assert output_authority["maximumPublishedQueueUnits"] == 1
    assert output_authority["maximumRetainedWorkerWaveforms"] == 1
    assert output_authority["maximumRetainedControllerUnits"] == 1
    assert output_authority["persistGeneratedAudio"] is False
    assert identity["invalidateBeforeStop"] is True
    assert identity["rejectEveryMismatchedOrInactiveUnit"] is True
    assert timing["maximumIdentityInvalidationNanoseconds"] == 500_000_000
    assert timing["maximumWorkerTerminationNanoseconds"] == 2_000_000_000
    assert timing["maximumCleanupNanoseconds"] == 5_000_000_000
