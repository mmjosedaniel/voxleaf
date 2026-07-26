"""Model-free authority and safe-summary tests for the v3 benchmark extension."""

from __future__ import annotations

import copy
import hashlib
import json
from collections.abc import Mapping
from pathlib import Path
from typing import Final, cast

from jsonschema import Draft202012Validator

from benchmarks.adapters.manifest import (
    PROFILE_V3_CONFIGURATION_SHA256,
    PROFILE_V3_SHA256,
    QWEN_V3_CANDIDATE_ID,
    load_v3_candidate_profile,
)
from benchmarks.summary import schema_registry

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
PROFILE_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "profile-v3.json"
SCHEMA_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "schemas" / "summary-v3.schema.json"
FIXTURE_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "fixtures" / "summary-v1.valid.json"


def _load(path: Path) -> dict[str, object]:
    value = cast(object, json.loads(path.read_text(encoding="utf-8")))
    assert isinstance(value, dict)
    return cast(dict[str, object], value)


def _authority_summary_fixture() -> dict[str, object]:
    fixture = copy.deepcopy(_load(FIXTURE_PATH))
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    authority = profile.authority
    assert authority is not None
    fixture.update(
        {
            "schemaVersion": "tts-feasibility-summary-v3",
            "protocolVersion": "tts-feasibility-profile-v3",
            "candidateManifestVersion": "tts-candidate-manifest-v3",
            "candidateId": QWEN_V3_CANDIDATE_ID,
            "role": "balanced",
            "evaluationAuthority": {
                "profileSha256": authority.profile_sha256,
                "configurationIdentitySha256": authority.configuration_identity_sha256,
                "candidateLockSha256": authority.candidate_lock_sha256,
                "speakerScreenResultSha256": authority.speaker_screen_result_sha256,
                "instructionSha256": authority.instruction_sha256,
                "generationSettingsSha256": authority.generation_settings_sha256,
                "batchSize": authority.batch_size,
                "automaticRetries": authority.automatic_retries,
                "modelLifetime": authority.model_lifetime,
                "auxiliaryAnalysis": list(authority.auxiliary_analysis),
            },
            "runtime": {
                "engineVersion": "0.1.1",
                "modelRevision": profile.model_revision,
                "voiceId": profile.voice_id,
                "provider": profile.provider,
                "precision": profile.precision,
                "offlineMode": True,
                "streamingGranularity": "complete-waveform",
            },
            "memory": {
                "ramSamplingIntervalMilliseconds": 50,
                "processVramSamplingIntervalMilliseconds": 1000,
                "vramMeasurementMethod": "wddm-dedicated-plus-pytorch-reserved",
                "peakProcessTreeRamBytes": 5_000_000_000,
                "peakProcessVramBytes": 4_000_000_000,
                "peakFrameworkVramBytes": 5_000_000_000,
                "peakVramBytes": 5_000_000_000,
                "gpuProviderAllocations": 1,
            },
        }
    )
    host = cast(dict[str, object], fixture["host"])
    host["gpuModel"] = "Synthetic GPU"
    host["driverVersion"] = "fixture-driver"
    return fixture


def _schema_errors(value: object) -> tuple[object, ...]:
    schema = cast(Mapping[str, object], _load(SCHEMA_PATH))
    Draft202012Validator.check_schema(schema)
    return tuple(Draft202012Validator(schema, registry=schema_registry()).iter_errors(value))


def test_v3_profile_binds_screen_order_outcome_and_complete_identity() -> None:
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    authority = profile.authority
    assert hashlib.sha256(PROFILE_PATH.read_bytes()).hexdigest() == PROFILE_V3_SHA256
    assert profile.voice_id == "Serena"
    assert profile.language == "Spanish"
    assert profile.output_sample_rate_hz == 24_000
    assert len(profile.artifacts) == 2
    assert profile.generation_settings is not None
    assert authority is not None
    assert authority.configuration_identity_sha256 == PROFILE_V3_CONFIGURATION_SHA256
    assert authority.batch_size == 1
    assert authority.automatic_retries == 0
    assert authority.auxiliary_analysis == (
        "whisper-excluded",
        "vad-or-energy-excluded",
    )
    assert (
        authority.instruction_sha256
        == hashlib.sha256(cast(str, profile.instruction).encode("utf-8")).hexdigest()
    )


def test_v3_safe_summary_schema_accepts_only_fingerprinted_authority() -> None:
    fixture = _authority_summary_fixture()
    assert _schema_errors(fixture) == ()

    exposed_instruction = copy.deepcopy(fixture)
    cast(dict[str, object], exposed_instruction["evaluationAuthority"])["instruction"] = (
        "private instruction"
    )
    assert _schema_errors(exposed_instruction)

    hidden_retry = copy.deepcopy(fixture)
    cast(dict[str, object], hidden_retry["evaluationAuthority"])["automaticRetries"] = 1
    assert _schema_errors(hidden_retry)

    wrong_identity = copy.deepcopy(fixture)
    cast(dict[str, object], wrong_identity["evaluationAuthority"])[
        "configurationIdentitySha256"
    ] = "0" * 64
    assert _schema_errors(wrong_identity)
