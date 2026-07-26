"""Model-free tests for the two admitted benchmark adapters."""

from __future__ import annotations

import hashlib
import sys
from collections.abc import Iterator
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import Final, cast

import pytest

from benchmarks.adapters.factory import CandidateAdapterFactory
from benchmarks.adapters.manifest import (
    QWEN_CANDIDATE_ID,
    QWEN_V3_CANDIDATE_ID,
    SUPERTONIC_CANDIDATE_ID,
    AdapterConfigurationError,
    ArtifactIdentity,
    CandidateConfiguration,
    CandidateProfile,
    load_candidate_profile,
    load_v3_candidate_profile,
)
from benchmarks.adapters.qwen3 import Qwen3TtsAdapter
from benchmarks.adapters.supertonic3 import Supertonic3Adapter
from benchmarks.batch_contracts import (
    BatchGenerationRequest,
    BatchUnitRequest,
    BatchWorkIdentity,
)
from benchmarks.contracts import GenerationRequest
from benchmarks.v4_authority import CPU_PROFILE_ID

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
        reset_peak_memory_stats=lambda: calls.update(reset_peak_memory_stats=True),
        max_memory_reserved=lambda: 2_000_000_000,
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
    assert adapter.framework_memory_high_water_bytes() == 2_000_000_000
    adapter.close()
    assert calls["reset_peak_memory_stats"] is True
    assert calls["empty_cache"] is True


def test_qwen_v4_batch_adapter_uses_one_list_call_and_preserves_unit_identity(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    calls: dict[str, object] = {}

    class Model:
        def generate_custom_voice(self, **kwargs: object) -> tuple[list[list[float]], int]:
            calls["generate"] = kwargs
            return [[0.0] * 192_000, [0.0] * 240_000], 24_000

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
        reset_peak_memory_stats=lambda: None,
        max_memory_reserved=lambda: 2_000_000_000,
        empty_cache=lambda: None,
    )
    qwen = ModuleType("qwen_tts")
    qwen.__dict__["Qwen3TTSModel"] = ModelClass
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.validate_configuration",
        lambda _profile, _configuration: tmp_path.resolve(),
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.verify_artifacts",
        lambda _root, _artifacts: None,
    )
    adapter = Qwen3TtsAdapter(
        profile,
        _configuration(profile, tmp_path),
        importer=lambda name: {"torch": torch, "qwen_tts": qwen}[name],
        version_reader={
            "qwen-tts": "0.1.1",
            "torch": "2.9.1+cu128",
            "torchaudio": "2.9.1+cu128",
        }.__getitem__,
    )
    adapter.load()
    request = BatchGenerationRequest(
        call_index=7,
        phase="measured",
        pass_index=1,
        pair_id="es-v4-pair-01",
        attempt=1,
        identity=BatchWorkIdentity("session", "generation"),
        units=(
            BatchUnitRequest("es-v4-arrival", 0, "Primer texto."),
            BatchUnitRequest("es-v4-dialogue", 1, "Segundo texto."),
        ),
    )
    outputs = adapter.generate_batch(request)
    assert [output.unit_id for output in outputs] == [
        "es-v4-arrival",
        "es-v4-dialogue",
    ]
    assert [output.sample_count for output in outputs] == [192_000, 240_000]
    generated = cast(dict[str, object], calls["generate"])
    assert generated["text"] == ["Primer texto.", "Segundo texto."]
    assert generated["language"] == ["Spanish", "Spanish"]
    assert generated["speaker"] == ["Serena", "Serena"]
    assert generated["instruct"] == [profile.instruction, profile.instruction]
    assert "batchSize" not in generated


def test_qwen_v4_cpu_profile_moves_only_the_speech_tokenizer(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    calls: dict[str, object] = {}

    class Device:
        def __init__(self, label: str) -> None:
            device_type, _, raw_index = label.partition(":")
            self.type = device_type
            self.index = int(raw_index) if raw_index else None

    class Tensor:
        def __init__(self, label: str) -> None:
            self.device = Device(label)

    class Module:
        def __init__(self, parameters: list[Tensor], buffers: list[Tensor]) -> None:
            self._parameters = parameters
            self._buffers = buffers

        def parameters(self) -> Iterator[Tensor]:
            return iter(self._parameters)

        def buffers(self) -> Iterator[Tensor]:
            return iter(self._buffers)

        def to(self, device: str) -> Module:
            calls["tokenizer_to"] = device
            for tensor in (*self._parameters, *self._buffers):
                tensor.device = Device(device)
            return self

    tokenizer_parameter = Tensor("cuda:0")
    tokenizer_buffer = Tensor("cuda:0")
    autoregressive_parameter = Tensor("cuda:0")
    tokenizer_model = Module([tokenizer_parameter], [tokenizer_buffer])

    class Inner(Module):
        def __init__(self) -> None:
            super().__init__(
                [autoregressive_parameter, tokenizer_parameter],
                [tokenizer_buffer],
            )
            self.speech_tokenizer = SimpleNamespace(
                model=tokenizer_model,
                device=Device("cuda:0"),
            )
            self.hf_device_map = {"": Device("cuda:0")}

    class Model:
        def __init__(self) -> None:
            self.model = Inner()

    class ModelClass:
        @staticmethod
        def from_pretrained(path: str, **kwargs: object) -> Model:
            del path, kwargs
            return Model()

    torch = ModuleType("torch")
    torch.__dict__["bfloat16"] = object()
    torch.__dict__["device"] = Device
    torch.__dict__["cuda"] = SimpleNamespace(
        is_available=lambda: True,
        is_bf16_supported=lambda: True,
        reset_peak_memory_stats=lambda: None,
        max_memory_reserved=lambda: 2_000_000_000,
        empty_cache=lambda: calls.update(empty_cache=True),
    )
    qwen = ModuleType("qwen_tts")
    qwen.__dict__["Qwen3TTSModel"] = ModelClass
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.validate_configuration",
        lambda _profile, _configuration: tmp_path.resolve(),
    )
    monkeypatch.setattr(
        "benchmarks.adapters.qwen3.verify_artifacts",
        lambda _root, _artifacts: None,
    )

    adapter = Qwen3TtsAdapter(
        profile,
        _configuration(profile, tmp_path),
        placement_profile_id=CPU_PROFILE_ID,
        importer=lambda name: {"torch": torch, "qwen_tts": qwen}[name],
        version_reader={
            "qwen-tts": "0.1.1",
            "torch": "2.9.1+cu128",
            "torchaudio": "2.9.1+cu128",
        }.__getitem__,
    )
    adapter.load()

    evidence = adapter.placement_evidence()
    assert evidence is not None
    assert evidence.profile_id == CPU_PROFILE_ID
    assert evidence.autoregressive_model_device == "cuda:0"
    assert evidence.speech_tokenizer_model_device == "cpu"
    assert evidence.speech_tokenizer_wrapper_device == "cpu"
    assert calls["tokenizer_to"] == "cpu"
    assert calls["empty_cache"] is True
    assert autoregressive_parameter.device.type == "cuda"
    assert tokenizer_parameter.device.type == "cpu"
    assert tokenizer_buffer.device.type == "cpu"


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
            session = SimpleNamespace(get_providers=lambda: ["CPUExecutionProvider"])
            self.model = SimpleNamespace(
                dp_ort=session,
                text_enc_ort=session,
                vector_est_ort=session,
                vocoder_ort=session,
            )

        def get_voice_style(self, voice_id: str) -> object:
            calls["voice"] = voice_id
            return object()

        def synthesize(self, text: str, **kwargs: object) -> tuple[Waveform, object]:
            calls["text"] = text
            calls["generate"] = kwargs
            return Waveform(), object()

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


def test_supertonic_adapter_rejects_a_non_cpu_loaded_session(
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

    class Engine:
        sample_rate = 44_100

        def __init__(self, **kwargs: object) -> None:
            del kwargs
            cpu = SimpleNamespace(get_providers=lambda: ["CPUExecutionProvider"])
            cuda = SimpleNamespace(
                get_providers=lambda: ["CUDAExecutionProvider", "CPUExecutionProvider"]
            )
            self.model = SimpleNamespace(
                dp_ort=cpu,
                text_enc_ort=cpu,
                vector_est_ort=cuda,
                vocoder_ort=cpu,
            )

        def get_voice_style(self, voice_id: str) -> object:
            del voice_id
            return object()

    onnxruntime = ModuleType("onnxruntime")
    onnxruntime.__dict__["get_device"] = lambda: "CPU"
    onnxruntime.__dict__["get_available_providers"] = lambda: [
        "CUDAExecutionProvider",
        "CPUExecutionProvider",
    ]
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
    adapter = Supertonic3Adapter(
        profile,
        _configuration(profile, tmp_path),
        importer=importer,
        version_reader={"supertonic": "1.3.1", "onnxruntime": "1.27.0"}.__getitem__,
    )
    with pytest.raises(
        AdapterConfigurationError,
        match=r"^tts-benchmark-adapter:provider-selected$",
    ):
        adapter.load()


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
