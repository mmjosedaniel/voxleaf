"""Model-free tests for the two admitted benchmark adapters."""

from __future__ import annotations

import hashlib
import sys
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import Final, cast

import pytest

from benchmarks.adapters.factory import CandidateAdapterFactory
from benchmarks.adapters.manifest import (
    QWEN_CANDIDATE_ID,
    SUPERTONIC_CANDIDATE_ID,
    AdapterConfigurationError,
    ArtifactIdentity,
    CandidateConfiguration,
    CandidateProfile,
    load_candidate_profile,
)
from benchmarks.adapters.qwen3 import Qwen3TtsAdapter
from benchmarks.adapters.supertonic3 import Supertonic3Adapter
from benchmarks.contracts import GenerationRequest

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
MANIFEST_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "candidates-v1.json"


def _artifact(root: Path, relative_path: str, payload: bytes) -> ArtifactIdentity:
    target = root.joinpath(*relative_path.split("/"))
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(payload)
    return ArtifactIdentity(
        relative_path=relative_path,
        sha256=hashlib.sha256(payload).hexdigest(),
    )


def _configuration(profile: CandidateProfile, root: Path) -> CandidateConfiguration:
    return CandidateConfiguration(
        candidate_id=profile.candidate_id,
        artifact_root=root.resolve(),
        model_revision=profile.model_revision,
        voice_id=profile.voice_id,
        provider=profile.provider,
        precision=profile.precision,
        offline=True,
    )


def _request(text: str = "Texto privado de prueba.") -> GenerationRequest:
    return GenerationRequest(
        request_id="request-1",
        case_id="case-1",
        phase="warm",
        text=text,
    )


def test_manifest_loads_only_the_two_exact_admitted_profiles() -> None:
    qwen = load_candidate_profile(MANIFEST_PATH, QWEN_CANDIDATE_ID)
    assert qwen.role == "balanced"
    assert qwen.provider == "pytorch-cuda"
    assert qwen.precision == "bfloat16"
    assert qwen.voice_id == "Aiden"
    assert qwen.artifacts[0].relative_path == "model.safetensors"

    supertonic = load_candidate_profile(MANIFEST_PATH, SUPERTONIC_CANDIDATE_ID)
    assert supertonic.role == "compatibility"
    assert supertonic.provider == "onnxruntime-cpu"
    assert supertonic.precision == "float32"
    assert supertonic.voice_id == "F1"
    assert supertonic.output_sample_rate_hz == 44_100
    assert len(supertonic.artifacts) == 5

    with pytest.raises(
        AdapterConfigurationError,
        match=r"^tts-benchmark-adapter:candidate$",
    ):
        load_candidate_profile(MANIFEST_PATH, "not-admitted")


def test_exact_dispatch_observes_capabilities_without_candidate_import(
    tmp_path: Path,
) -> None:
    candidate_modules = ("qwen_tts", "supertonic", "torch", "onnxruntime")
    before = {name: sys.modules.get(name) for name in candidate_modules}
    for candidate_id in (QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID):
        profile = load_candidate_profile(MANIFEST_PATH, candidate_id)
        adapter = CandidateAdapterFactory(profile, _configuration(profile, tmp_path))()
        assert adapter.capabilities().candidate_id == candidate_id
    assert {name: sys.modules.get(name) for name in candidate_modules} == before


def test_missing_artifact_fails_before_candidate_import_or_download(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    imported: list[str] = []

    def importer(name: str) -> ModuleType:
        imported.append(name)
        raise AssertionError("candidate import must not occur")

    profile = CandidateProfile(
        candidate_id=QWEN_CANDIDATE_ID,
        role="balanced",
        distribution="qwen-tts",
        engine_version="0.1.1",
        model_revision="revision",
        voice_id="Aiden",
        provider="pytorch-cuda",
        precision="bfloat16",
        artifacts=(ArtifactIdentity("model.safetensors", "0" * 64),),
        output_sample_rate_hz=None,
    )
    adapter = Qwen3TtsAdapter(
        profile,
        _configuration(profile, tmp_path),
        importer=importer,
    )
    with pytest.raises(
        AdapterConfigurationError,
        match=r"^tts-benchmark-adapter:artifact-missing$",
    ):
        adapter.load()
    assert imported == []


def test_qwen_adapter_uses_exact_local_profile_and_discards_waveform(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    artifact = _artifact(tmp_path, "model.safetensors", b"qwen-test-artifact")
    calls: dict[str, object] = {}

    class Model:
        def generate_custom_voice(self, **kwargs: object) -> tuple[list[list[float]], int]:
            calls["generate"] = kwargs
            return [[0.0] * 24_000], 24_000

    class ModelClass:
        @staticmethod
        def from_pretrained(path: str, **kwargs: object) -> Model:
            calls["load_path"] = path
            calls["load"] = kwargs
            return Model()

    torch = ModuleType("torch")
    torch.__dict__["bfloat16"] = object()
    torch.__dict__["cuda"] = SimpleNamespace(
        is_available=lambda: True,
        is_bf16_supported=lambda: True,
        empty_cache=lambda: calls.update(empty_cache=True),
    )
    qwen = ModuleType("qwen_tts")
    qwen.__dict__["Qwen3TTSModel"] = ModelClass

    def importer(name: str) -> ModuleType:
        return {"torch": torch, "qwen_tts": qwen}[name]

    profile = CandidateProfile(
        candidate_id=QWEN_CANDIDATE_ID,
        role="balanced",
        distribution="qwen-tts",
        engine_version="0.1.1",
        model_revision="revision",
        voice_id="Aiden",
        provider="pytorch-cuda",
        precision="bfloat16",
        artifacts=(artifact,),
        output_sample_rate_hz=None,
    )
    versions = {"qwen-tts": "0.1.1", "torch": "2.9.1+cu128"}
    adapter = Qwen3TtsAdapter(
        profile,
        _configuration(profile, tmp_path),
        importer=importer,
        version_reader=versions.__getitem__,
    )
    adapter.load()
    chunks = tuple(adapter.generate(_request()))
    assert adapter.capabilities().streaming_granularity == "complete-waveform"
    assert adapter.capabilities().generation_cancellation == "worker-termination"
    assert chunks[0].sample_count == 24_000
    assert chunks[0].sample_rate_hz == 24_000
    assert calls["load_path"] == str(tmp_path.resolve())
    assert calls["load"] == {
        "device_map": "cuda:0",
        "dtype": torch.__dict__["bfloat16"],
        "attn_implementation": "sdpa",
        "local_files_only": True,
    }
    assert calls["generate"] == {
        "text": "Texto privado de prueba.",
        "language": "Spanish",
        "speaker": "Aiden",
    }
    assert adapter.cancel("request-1").acknowledged is False
    adapter.close()
    assert calls["empty_cache"] is True


def test_supertonic_adapter_forces_local_cpu_profile_and_discards_waveform(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    artifacts = (
        _artifact(tmp_path, "onnx/duration_predictor.onnx", b"duration"),
        _artifact(tmp_path, "onnx/text_encoder.onnx", b"text"),
        _artifact(tmp_path, "onnx/vector_estimator.onnx", b"vector"),
        _artifact(tmp_path, "onnx/vocoder.onnx", b"vocoder"),
        _artifact(tmp_path, "voice_styles/F1.json", b"voice"),
    )
    calls: dict[str, object] = {}

    class Waveform:
        shape = (1, 44_100)

    class Engine:
        sample_rate = 44_100

        def __init__(self, **kwargs: object) -> None:
            calls["load"] = kwargs

        def get_voice_style(self, voice_id: str) -> object:
            calls["voice"] = voice_id
            return object()

        def synthesize(self, text: str, **kwargs: object) -> Waveform:
            calls["text"] = text
            calls["generate"] = kwargs
            return Waveform()

    onnxruntime = ModuleType("onnxruntime")
    onnxruntime.__dict__["get_device"] = lambda: "CPU"
    onnxruntime.__dict__["get_available_providers"] = lambda: ["CPUExecutionProvider"]
    supertonic = ModuleType("supertonic")
    supertonic.__dict__["TTS"] = Engine

    def importer(name: str) -> ModuleType:
        return {"onnxruntime": onnxruntime, "supertonic": supertonic}[name]

    profile = CandidateProfile(
        candidate_id=SUPERTONIC_CANDIDATE_ID,
        role="compatibility",
        distribution="supertonic",
        engine_version="1.3.1",
        model_revision="revision",
        voice_id="F1",
        provider="onnxruntime-cpu",
        precision="float32",
        artifacts=artifacts,
        output_sample_rate_hz=44_100,
    )
    versions = {"supertonic": "1.3.1", "onnxruntime": "1.27.0"}
    adapter = Supertonic3Adapter(
        profile,
        _configuration(profile, tmp_path),
        importer=importer,
        version_reader=versions.__getitem__,
    )
    adapter.load()
    chunks = tuple(adapter.generate(_request()))
    assert chunks[0].sample_count == 44_100
    assert chunks[0].sample_rate_hz == 44_100
    assert calls["load"] == {
        "model": "supertonic-3",
        "model_dir": str(tmp_path.resolve()),
        "auto_download": False,
    }
    assert calls["voice"] == "F1"
    generate_call = cast(dict[str, object], calls["generate"])
    assert generate_call == {
        "voice_style": generate_call["voice_style"],
        "lang": "es",
        "total_steps": 8,
        "speed": 1.05,
        "max_chunk_length": 300,
        "silence_duration": 0.3,
        "verbose": False,
    }
    assert calls["text"] == "Texto privado de prueba."
    assert adapter.cancel("request-1").acknowledged is False
    adapter.close()


def test_profile_offline_provider_and_hash_mismatches_are_content_free(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    artifact = _artifact(tmp_path, "model.safetensors", b"actual")
    profile = CandidateProfile(
        candidate_id=QWEN_CANDIDATE_ID,
        role="balanced",
        distribution="qwen-tts",
        engine_version="0.1.1",
        model_revision="revision",
        voice_id="Aiden",
        provider="pytorch-cuda",
        precision="bfloat16",
        artifacts=(ArtifactIdentity(artifact.relative_path, "0" * 64),),
        output_sample_rate_hz=None,
    )
    adapter = Qwen3TtsAdapter(profile, _configuration(profile, tmp_path))
    with pytest.raises(AdapterConfigurationError) as captured:
        adapter.load()
    assert str(captured.value) == "tts-benchmark-adapter:artifact-mismatch"
    assert "actual" not in repr(captured.value)
    assert str(tmp_path) not in repr(captured.value)

    wrong = CandidateConfiguration(
        candidate_id=profile.candidate_id,
        artifact_root=tmp_path.resolve(),
        model_revision=profile.model_revision,
        voice_id=profile.voice_id,
        provider=profile.provider,
        precision=profile.precision,
        offline=False,
    )
    with pytest.raises(
        AdapterConfigurationError,
        match=r"^tts-benchmark-adapter:profile-mismatch$",
    ):
        Qwen3TtsAdapter(profile, wrong).load()
