"""Model-free coverage for the exact Qwen/Serena service adapter."""

from __future__ import annotations

import hashlib
import json
import struct
import sys
from collections.abc import Callable
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import Any, Final

import pytest

from voxleaf_tts.engine import EngineFailure, EngineFailureCode
from voxleaf_tts.qwen_adapter import (
    AIDEN_CANDIDATE_ID,
    AIDEN_ENGLISH_PROFILE,
    CODEC_SAMPLES_PER_TOKEN,
    ENGINE_VERSION,
    ENGLISH_INSTRUCTION,
    GENERATION_SETTINGS,
    INSTRUCTION,
    LANGUAGE,
    MAJOR_ARTIFACTS,
    MAX_SERVICE_CODEC_TOKENS,
    MODEL_REPOSITORY,
    MODEL_REVISION,
    SERENA_CANDIDATE_ID,
    SERENA_SPANISH_PROFILE,
    SERVICE_GENERATION_SETTINGS,
    SPEAKER,
    TORCH_VERSION,
    TORCHAUDIO_VERSION,
    ArtifactIdentity,
    QwenSerenaTtsEngine,
    QwenVoiceProfile,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CANDIDATE_MANIFEST_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "candidates-v8.json"
CANDIDATE_LOCK: Final = (
    REPOSITORY_ROOT
    / "services"
    / "tts"
    / "benchmarks"
    / "candidates"
    / "qwen3_1_7b_customvoice_cuda"
    / "uv.lock"
)


class FakeSamples:
    def __init__(self, values: list[float], *, shape: tuple[int, ...] | None = None) -> None:
        self.values = values
        self.shape = shape or (len(values),)
        self.ndim = len(self.shape)
        self.size = len(values)

    def __len__(self) -> int:
        return len(self.values)

    def __iter__(self) -> Any:
        return iter(self.values)

    def tobytes(self, *, order: str) -> bytes:
        assert order == "C"
        return b"".join(struct.pack("<f", value) for value in self.values)


class FakeFinite:
    def __init__(self, value: bool) -> None:
        self._value = value

    def all(self) -> bool:
        return self._value


class FakeNumpy(ModuleType):
    def __init__(self) -> None:
        super().__init__("numpy")

    @staticmethod
    def asarray(value: object, *, dtype: str, order: str) -> object:
        assert dtype == "<f4"
        assert order == "C"
        return value

    @staticmethod
    def isfinite(value: object) -> FakeFinite:
        samples = value
        assert isinstance(samples, FakeSamples)
        return FakeFinite(all(sample == sample for sample in samples.values))


class FakeModel:
    def __init__(
        self,
        calls: dict[str, object],
        waveform: FakeSamples | None = None,
        sample_rate: object = 24_000,
        failure: Exception | None = None,
    ) -> None:
        self._calls = calls
        self._waveform = waveform if waveform is not None else FakeSamples([0.0, 0.25, -0.25, 0.5])
        self._sample_rate = sample_rate
        self._failure = failure

    @staticmethod
    def get_supported_speakers() -> tuple[str, ...]:
        return ("Serena", "Aiden")

    def generate_custom_voice(self, **kwargs: object) -> tuple[list[FakeSamples], object]:
        generations = self._calls.get("generations")
        if not isinstance(generations, list):
            generations = []
            self._calls["generations"] = generations
        generations.append(kwargs)
        if self._failure is not None:
            raise self._failure
        return ([self._waveform], self._sample_rate)


def _write_exact_artifacts(root: Path) -> tuple[ArtifactIdentity, ...]:
    artifacts: list[ArtifactIdentity] = []
    for relative, content in (
        ("model.safetensors", b"model-test"),
        ("speech_tokenizer/model.safetensors", b"tokenizer-test"),
    ):
        path = root.joinpath(*relative.split("/"))
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        digest = hashlib.sha256(content).hexdigest()
        metadata = root / ".cache" / "huggingface" / "download" / f"{relative}.metadata"
        metadata.parent.mkdir(parents=True, exist_ok=True)
        metadata.write_text(f"{MODEL_REVISION}\n{digest}\n0\n", encoding="utf-8")
        artifacts.append(ArtifactIdentity(relative, digest, len(content)))
    (root / "config.json").write_text(
        json.dumps(
            {
                "model_type": "qwen3_tts",
                "tts_model_size": "1b7",
                "tts_model_type": "custom_voice",
            }
        ),
        encoding="utf-8",
    )
    return tuple(artifacts)


def _runtime(tmp_path: Path) -> tuple[Path, Path, Path]:
    root = tmp_path / "runtime"
    executable = root / "Scripts" / "python.exe"
    distributions = root / "Lib" / "site-packages"
    executable.parent.mkdir(parents=True)
    executable.write_bytes(b"python")
    distributions.mkdir(parents=True)
    return root, executable, distributions


def _adapter(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    *,
    model: FakeModel | None = None,
    versions: dict[str, str] | None = None,
    distribution_root: Path | None = None,
    cuda_available: bool = True,
    bf16_available: bool = True,
    profile: QwenVoiceProfile = SERENA_SPANISH_PROFILE,
) -> tuple[QwenSerenaTtsEngine, dict[str, object], FakeModel]:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    artifact_root = tmp_path / "model"
    artifact_root.mkdir()
    artifacts = _write_exact_artifacts(artifact_root)
    runtime_root, executable, distributions = _runtime(tmp_path)
    calls: dict[str, object] = {}
    selected_model = model or FakeModel(calls)

    class ModelClass:
        @staticmethod
        def from_pretrained(path: str, **kwargs: object) -> FakeModel:
            calls["load_path"] = path
            calls["load"] = kwargs
            return selected_model

    torch = ModuleType("torch")
    torch.__dict__.update(
        {
            "__version__": TORCH_VERSION,
            "bfloat16": object(),
            "cuda": SimpleNamespace(
                is_available=lambda: cuda_available,
                is_bf16_supported=lambda: bf16_available,
                reset_peak_memory_stats=lambda: calls.update(reset=True),
                empty_cache=lambda: calls.update(cleaned=True),
            ),
        }
    )
    qwen = ModuleType("qwen_tts")
    qwen.__dict__["Qwen3TTSModel"] = ModelClass
    numpy = FakeNumpy()
    modules = {"torch": torch, "qwen_tts": qwen, "numpy": numpy}
    selected_versions = versions or {
        "qwen-tts": ENGINE_VERSION,
        "torch": TORCH_VERSION,
        "torchaudio": TORCHAUDIO_VERSION,
    }
    root = distribution_root or distributions
    adapter = QwenSerenaTtsEngine(
        artifact_root,
        profile=profile,
        artifacts=artifacts,
        importer=modules.__getitem__,
        version_reader=selected_versions.__getitem__,
        distribution_root_reader=lambda _name: root,
        runtime_root=runtime_root,
        runtime_executable=executable,
        python_version=(3, 12),
    )
    return adapter, calls, selected_model


def _segment(text: str = "Texto sintético local.") -> dict[str, object]:
    return {
        "text": text,
        "sessionId": "session:test",
        "generationId": "generation:test",
        "segmentId": "segment:test",
    }


def test_frozen_constants_match_v8_bilingual_manifest_and_candidate_lock() -> None:
    manifest = json.loads(CANDIDATE_MANIFEST_PATH.read_text(encoding="utf-8"))
    candidates = {value["candidateId"]: value for value in manifest["addedCandidates"]}
    candidate = candidates[SERENA_CANDIDATE_ID]
    aiden = candidates[AIDEN_CANDIDATE_ID]

    assert candidate["engine"]["name"] == "qwen-tts"
    assert candidate["engine"]["version"] == ENGINE_VERSION
    assert (
        candidate["engine"]["wheelSha256"]
        == "11a290d8dabc7ef91a90c54478c8ab19b3edb1d85c0882313721892bdc4af15d"
    )
    assert candidate["model"]["repository"] == MODEL_REPOSITORY
    assert candidate["model"]["revision"] == MODEL_REVISION
    assert tuple(candidate["model"]["artifacts"]) == tuple(
        {
            "path": artifact.relative_path,
            "sha256": artifact.sha256,
            "sizeBytes": artifact.size_bytes,
        }
        for artifact in MAJOR_ARTIFACTS
    )
    assert candidate["voice"]["speaker"] == SPEAKER
    assert candidate["voice"]["languageArgument"] == LANGUAGE
    assert candidate["voice"]["instruction"] == INSTRUCTION
    assert aiden["voice"]["speaker"] == AIDEN_ENGLISH_PROFILE.speaker
    assert aiden["voice"]["languageArgument"] == AIDEN_ENGLISH_PROFILE.language
    assert aiden["voice"]["instruction"] == ENGLISH_INSTRUCTION
    assert candidate["engine"]["precision"] == "bfloat16"
    assert candidate["engine"]["attention"] == "sdpa"
    assert candidate["generation"] == {
        "batchSize": 1,
        "doSample": GENERATION_SETTINGS["do_sample"],
        "repetitionPenalty": GENERATION_SETTINGS["repetition_penalty"],
        "temperature": GENERATION_SETTINGS["temperature"],
        "topP": GENERATION_SETTINGS["top_p"],
        "topK": GENERATION_SETTINGS["top_k"],
        "subtalkerDoSample": GENERATION_SETTINGS["subtalker_dosample"],
        "subtalkerTemperature": GENERATION_SETTINGS["subtalker_temperature"],
        "subtalkerTopP": GENERATION_SETTINGS["subtalker_top_p"],
        "subtalkerTopK": GENERATION_SETTINGS["subtalker_top_k"],
        "maxNewTokens": GENERATION_SETTINGS["max_new_tokens"],
    }
    assert (
        hashlib.sha256(CANDIDATE_LOCK.read_bytes()).hexdigest()
        == candidate["dependencyLock"]["sha256"]
        == aiden["dependencyLock"]["sha256"]
    )


def test_exact_load_warm_and_complete_generation_use_frozen_identity(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, calls, _model = _adapter(tmp_path, monkeypatch)

    assert adapter.capabilities().local_speech_generation == "unknown"
    adapter.load()
    assert calls["load"] == {
        "device_map": "cuda:0",
        "dtype": calls["load"]["dtype"],  # type: ignore[index]
        "attn_implementation": "sdpa",
        "local_files_only": True,
    }
    adapter.warm()
    identity = adapter.begin("request:test", _segment())
    completed_identity, result = adapter.settle()

    assert completed_identity == identity
    assert result.sample_rate_hz == 24_000
    assert result.channel_count == 1
    assert len(result.payload) == 16
    assert adapter.capabilities().local_speech_generation == "supported"
    generations = calls["generations"]
    assert isinstance(generations, list)
    assert len(generations) == 2
    assert generations[-1] == {
        "text": "Texto sintético local.",
        "language": LANGUAGE,
        "speaker": SPEAKER,
        "instruct": INSTRUCTION,
        **SERVICE_GENERATION_SETTINGS,
    }
    adapter.release_result()
    adapter.cleanup()
    assert calls["cleaned"] is True


def test_aiden_profile_uses_the_exact_english_voice_language_and_instruction(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, calls, _model = _adapter(
        tmp_path,
        monkeypatch,
        profile=AIDEN_ENGLISH_PROFILE,
    )

    adapter.load()
    adapter.warm()
    adapter.begin("request:english", _segment("A bounded English segment."))
    adapter.settle()

    generations = calls["generations"]
    assert isinstance(generations, list)
    assert generations[-1] == {
        "text": "A bounded English segment.",
        "language": "English",
        "speaker": "Aiden",
        "instruct": ENGLISH_INSTRUCTION,
        **SERVICE_GENERATION_SETTINGS,
    }


def test_product_generation_is_clamped_to_the_protocol_audio_ceiling() -> None:
    assert GENERATION_SETTINGS["max_new_tokens"] == 2_048
    assert SERVICE_GENERATION_SETTINGS == {
        **GENERATION_SETTINGS,
        "max_new_tokens": MAX_SERVICE_CODEC_TOKENS,
    }
    assert MAX_SERVICE_CODEC_TOKENS * CODEC_SAMPLES_PER_TOKEN == 480_000
    assert (MAX_SERVICE_CODEC_TOKENS + 1) * CODEC_SAMPLES_PER_TOKEN > 480_000


@pytest.mark.parametrize(
    ("distribution", "version"),
    [
        ("qwen-tts", "0.0.0"),
        ("torch", "2.9.1"),
        ("torchaudio", "2.9.1"),
    ],
)
def test_rejects_every_runtime_version_mismatch_before_import(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    distribution: str,
    version: str,
) -> None:
    versions = {
        "qwen-tts": ENGINE_VERSION,
        "torch": TORCH_VERSION,
        "torchaudio": TORCHAUDIO_VERSION,
    }
    versions[distribution] = version
    adapter, calls, _model = _adapter(tmp_path, monkeypatch, versions=versions)

    with pytest.raises(EngineFailure) as failure:
        adapter.load()
    assert failure.value.code is EngineFailureCode.UNAVAILABLE
    assert calls == {}


def test_rejects_runtime_distribution_outside_candidate_environment(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    outside = tmp_path / "outside"
    outside.mkdir()
    adapter, calls, _model = _adapter(
        tmp_path,
        monkeypatch,
        distribution_root=outside,
    )

    with pytest.raises(EngineFailure) as failure:
        adapter.load()
    assert failure.value.code is EngineFailureCode.UNAVAILABLE
    assert calls == {}


@pytest.mark.parametrize("offline_key", ["HF_HUB_OFFLINE", "TRANSFORMERS_OFFLINE"])
def test_rejects_missing_offline_control_before_import(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    offline_key: str,
) -> None:
    adapter, calls, _model = _adapter(tmp_path, monkeypatch)
    monkeypatch.delenv(offline_key)

    with pytest.raises(EngineFailure) as failure:
        adapter.load()
    assert failure.value.code is EngineFailureCode.UNAVAILABLE
    assert calls == {}


@pytest.mark.parametrize("mutation", ["artifact", "revision", "config"])
def test_rejects_artifact_revision_and_model_identity_mismatch(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    mutation: str,
) -> None:
    adapter, calls, _model = _adapter(tmp_path, monkeypatch)
    root = tmp_path / "model"
    if mutation == "artifact":
        (root / "model.safetensors").write_bytes(b"changed")
    elif mutation == "revision":
        metadata = root / ".cache" / "huggingface" / "download" / "model.safetensors.metadata"
        lines = metadata.read_text(encoding="utf-8").splitlines()
        metadata.write_text(f"wrong\n{lines[1]}\n0\n", encoding="utf-8")
    else:
        (root / "config.json").write_text("{}", encoding="utf-8")

    with pytest.raises(EngineFailure) as failure:
        adapter.load()
    assert failure.value.code is EngineFailureCode.UNAVAILABLE
    assert calls == {}


@pytest.mark.parametrize(("cuda", "bf16"), [(False, True), (True, False)])
def test_rejects_unavailable_cuda_or_bfloat16(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    cuda: bool,
    bf16: bool,
) -> None:
    adapter, _calls, _model = _adapter(
        tmp_path,
        monkeypatch,
        cuda_available=cuda,
        bf16_available=bf16,
    )

    with pytest.raises(EngineFailure) as failure:
        adapter.load()
    assert failure.value.code is EngineFailureCode.UNAVAILABLE


@pytest.mark.parametrize(
    "waveform_factory",
    [
        lambda: FakeSamples([]),
        lambda: FakeSamples([0.0], shape=(1, 1)),
        lambda: FakeSamples([float("nan")]),
        lambda: FakeSamples([0.0], shape=(480_001,)),
    ],
)
def test_invalid_output_publishes_no_retained_result(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    waveform_factory: Callable[[], FakeSamples],
) -> None:
    calls: dict[str, object] = {}
    model = FakeModel(calls, waveform_factory())
    adapter, _load_calls, _selected = _adapter(tmp_path, monkeypatch, model=model)
    adapter.load()

    with pytest.raises(EngineFailure) as failure:
        adapter.warm()
    assert failure.value.code is EngineFailureCode.FAILURE
    assert not adapter.has_active_operation


def test_engine_failure_is_content_free_and_cleanup_is_idempotent(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls: dict[str, object] = {}
    model = FakeModel(calls, failure=RuntimeError("private implementation detail"))
    adapter, load_calls, _selected = _adapter(tmp_path, monkeypatch, model=model)
    adapter.load()

    with pytest.raises(EngineFailure) as failure:
        adapter.warm()
    assert failure.value.code is EngineFailureCode.FAILURE
    assert "private" not in str(failure.value)
    adapter.cleanup()
    adapter.cleanup()
    assert load_calls["cleaned"] is True


def test_importing_adapter_does_not_import_qwen_or_torch() -> None:
    assert "qwen_tts" not in sys.modules
    assert "torch" not in sys.modules
