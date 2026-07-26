"""Model-free authority and safe-summary tests for the v3 benchmark extension."""

from __future__ import annotations

import copy
import hashlib
import json
from collections.abc import Mapping
from dataclasses import replace
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import Final, cast

import pytest
from jsonschema import Draft202012Validator

from benchmarks.adapters.factory import CandidateAdapterFactory
from benchmarks.adapters.manifest import (
    PROFILE_V3_CONFIGURATION_SHA256,
    PROFILE_V3_SHA256,
    QWEN_V3_CANDIDATE_ID,
    AdapterConfigurationError,
    ArtifactIdentity,
    CandidateConfiguration,
    load_v3_candidate_profile,
)
from benchmarks.adapters.qwen3 import Qwen3TtsAdapter
from benchmarks.contracts import GenerationRequest
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


def _test_adapter(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    *,
    generation_error: bool = False,
) -> tuple[Qwen3TtsAdapter, list[dict[str, object]], dict[str, object]]:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    identities: list[ArtifactIdentity] = []
    for relative_path, payload in (
        ("model.safetensors", b"model"),
        ("speech_tokenizer/model.safetensors", b"tokenizer"),
    ):
        target = tmp_path.joinpath(*relative_path.split("/"))
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(payload)
        identities.append(ArtifactIdentity(relative_path, hashlib.sha256(payload).hexdigest()))
    profile = replace(
        load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID),
        artifacts=tuple(identities),
    )
    calls: list[dict[str, object]] = []
    lifecycle: dict[str, object] = {}

    class Model:
        def generate_custom_voice(
            self,
            **kwargs: object,
        ) -> tuple[list[list[float]], int]:
            calls.append(kwargs)
            if generation_error:
                raise RuntimeError("sensitive candidate detail")
            return [[0.0] * 24_000], 24_000

    model = Model()

    class ModelClass:
        @staticmethod
        def from_pretrained(path: str, **kwargs: object) -> Model:
            lifecycle["loadPath"] = path
            lifecycle["loadKwargs"] = kwargs
            prior_count = lifecycle.get("loadCount")
            lifecycle["loadCount"] = prior_count + 1 if isinstance(prior_count, int) else 1
            return model

    torch = ModuleType("torch")
    torch.__dict__["bfloat16"] = object()
    torch.__dict__["cuda"] = SimpleNamespace(
        is_available=lambda: True,
        is_bf16_supported=lambda: True,
        reset_peak_memory_stats=lambda: None,
        max_memory_reserved=lambda: 5_000_000_000,
        empty_cache=lambda: lifecycle.update(cleaned=True),
    )
    qwen = ModuleType("qwen_tts")
    qwen.__dict__["Qwen3TTSModel"] = ModelClass

    adapter = Qwen3TtsAdapter(
        profile,
        CandidateConfiguration(
            candidate_id=profile.candidate_id,
            artifact_root=tmp_path.resolve(),
            model_revision=profile.model_revision,
            voice_id=profile.voice_id,
            provider=profile.provider,
            precision=profile.precision,
            offline=True,
        ),
        importer={"torch": torch, "qwen_tts": qwen}.__getitem__,
        version_reader={
            "qwen-tts": "0.1.1",
            "torch": "2.9.1+cu128",
            "torchaudio": "2.9.1+cu128",
        }.__getitem__,
    )
    return adapter, calls, lifecycle


def _request(request_id: str) -> GenerationRequest:
    return GenerationRequest(
        request_id=request_id,
        case_id="es-narrative-target",
        phase="warm",
        text="Texto sintético acotado.",
    )


def test_v3_adapter_uses_one_resident_model_and_exact_generation_identity(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, calls, lifecycle = _test_adapter(tmp_path, monkeypatch)
    dispatched = CandidateAdapterFactory(adapter._profile, adapter._configuration)()
    assert dispatched.capabilities().candidate_id == QWEN_V3_CANDIDATE_ID
    adapter.load()
    first = tuple(adapter.generate(_request("request-1")))
    second = tuple(adapter.generate(_request("request-2")))
    assert lifecycle["loadCount"] == 1
    assert [chunk.sequence for chunk in (*first, *second)] == [0, 0]
    assert all(chunk.sample_count == 24_000 for chunk in (*first, *second))
    assert calls[0] == calls[1]
    assert calls[0] == {
        "text": "Texto sintético acotado.",
        "language": "Spanish",
        "speaker": "Serena",
        "instruct": cast(str, adapter._profile.instruction),
        "do_sample": True,
        "repetition_penalty": 1.05,
        "temperature": 0.9,
        "top_p": 1.0,
        "top_k": 50,
        "subtalker_dosample": True,
        "subtalker_temperature": 0.9,
        "subtalker_top_p": 1.0,
        "subtalker_top_k": 50,
        "max_new_tokens": 2048,
    }
    adapter.close()
    assert lifecycle["cleaned"] is True


def test_v3_adapter_counts_first_failure_without_hidden_retry_or_detail(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, calls, lifecycle = _test_adapter(
        tmp_path,
        monkeypatch,
        generation_error=True,
    )
    adapter.load()
    with pytest.raises(
        AdapterConfigurationError,
        match=r"^tts-benchmark-adapter:generation-failed$",
    ):
        tuple(adapter.generate(_request("request-1")))
    assert len(calls) == 1
    assert "sensitive candidate detail" not in repr(calls)
    adapter.close()
    assert lifecycle["cleaned"] is True


def test_v3_adapter_rejects_stale_instruction_identity_before_import(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, calls, _ = _test_adapter(tmp_path, monkeypatch)
    adapter._profile = replace(adapter._profile, instruction="changed")
    with pytest.raises(
        AdapterConfigurationError,
        match=r"^tts-benchmark-adapter:offline-or-profile$",
    ):
        adapter.load()
    assert calls == []
