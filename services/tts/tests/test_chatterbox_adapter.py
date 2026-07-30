"""Model-free coverage for the exact bilingual Chatterbox service adapter."""

from __future__ import annotations

import hashlib
import struct
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import Any

import pytest

from voxleaf_tts.chatterbox_adapter import (
    CANDIDATE_ID,
    ENGINE_VERSION,
    GENERATION_SETTINGS,
    TORCH_VERSION,
    TORCHAUDIO_VERSION,
    ArtifactIdentity,
    ChatterboxMultilingualTtsEngine,
)
from voxleaf_tts.engine import EngineFailure, EngineFailureCode


class FakeSamples:
    def __init__(self, values: list[float]) -> None:
        self.values = values
        self.ndim = 1
        self.size = len(values)

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


class FakeTensor:
    def __init__(self, samples: FakeSamples) -> None:
        self._samples = samples

    def detach(self) -> FakeTensor:
        return self

    def to(self, device: str) -> FakeTensor:
        assert device == "cpu"
        return self

    def reshape(self, size: int) -> FakeTensor:
        assert size == -1
        return self

    def numpy(self) -> FakeSamples:
        return self._samples


class FakeModel:
    def __init__(
        self,
        calls: dict[str, object],
        samples: FakeSamples | None = None,
        failure: Exception | None = None,
    ) -> None:
        self._calls = calls
        self._samples = samples or FakeSamples([0.0, 0.25, -0.25, 0.5])
        self._failure = failure

    def generate(self, text: str, **kwargs: object) -> FakeTensor:
        generations = self._calls.setdefault("generations", [])
        assert isinstance(generations, list)
        generations.append({"text": text, **kwargs})
        if self._failure is not None:
            raise self._failure
        return FakeTensor(self._samples)


def _write_artifacts(root: Path) -> tuple[ArtifactIdentity, ...]:
    artifacts: list[ArtifactIdentity] = []
    for relative, content in (
        ("t3_mtl23ls_v3.safetensors", b"t3-test"),
        ("s3gen.pt", b"s3-test"),
        ("ve.pt", b"ve-test"),
        ("conds.pt", b"conditions-test"),
        ("grapheme_mtl_merged_expanded_v1.json", b"grapheme-test"),
        ("Cangjie5_TC.json", b"cangjie-test"),
    ):
        path = root / relative
        path.write_bytes(content)
        artifacts.append(
            ArtifactIdentity(relative, hashlib.sha256(content).hexdigest(), len(content))
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
    language: str = "es",
    *,
    model: FakeModel | None = None,
    versions: dict[str, str] | None = None,
    cuda_available: bool = True,
    bf16_available: bool = True,
    capability: tuple[int, int] = (12, 0),
) -> tuple[ChatterboxMultilingualTtsEngine, dict[str, object]]:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("TRANSFORMERS_OFFLINE", "1")
    artifact_root = tmp_path / "model"
    artifact_root.mkdir()
    artifacts = _write_artifacts(artifact_root)
    runtime_root, executable, distributions = _runtime(tmp_path)
    calls: dict[str, object] = {}
    selected_model = model or FakeModel(calls)

    class ModelClass:
        @staticmethod
        def from_local(path: str, **kwargs: object) -> FakeModel:
            calls["load_path"] = path
            calls["load"] = kwargs
            return selected_model

    torch = ModuleType("torch")
    torch.__dict__.update(
        {
            "__version__": TORCH_VERSION,
            "device": lambda value: value,
            "cuda": SimpleNamespace(
                is_available=lambda: cuda_available,
                is_bf16_supported=lambda: bf16_available,
                get_device_capability=lambda: capability,
                get_arch_list=lambda: ["sm_120"],
                reset_peak_memory_stats=lambda: calls.update(reset=True),
                empty_cache=lambda: calls.update(cleaned=True),
            ),
        }
    )
    chatterbox = ModuleType("chatterbox.mtl_tts")
    chatterbox.__dict__["ChatterboxMultilingualTTS"] = ModelClass
    modules = {
        "torch": torch,
        "chatterbox.mtl_tts": chatterbox,
        "numpy": FakeNumpy(),
    }
    selected_versions = versions or {
        "chatterbox-tts": ENGINE_VERSION,
        "torch": TORCH_VERSION,
        "torchaudio": TORCHAUDIO_VERSION,
    }
    adapter = ChatterboxMultilingualTtsEngine(
        artifact_root,
        language,
        artifacts=artifacts,
        importer=modules.__getitem__,
        version_reader=selected_versions.__getitem__,
        distribution_root_reader=lambda _name: distributions,
        runtime_root=runtime_root,
        runtime_executable=executable,
        python_version=(3, 12),
    )
    return adapter, calls


def _segment(text: str) -> dict[str, object]:
    return {
        "text": text,
        "sessionId": "session:test",
        "generationId": "generation:test",
        "segmentId": "segment:test",
    }


@pytest.mark.parametrize(
    ("language", "text"),
    [("es", "Una frase local acotada."), ("en", "A bounded local sentence.")],
)
def test_exact_bilingual_load_warm_and_generation(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    language: str,
    text: str,
) -> None:
    adapter, calls = _adapter(tmp_path, monkeypatch, language)

    assert adapter.capabilities().local_speech_generation == "unknown"
    adapter.load()
    assert calls["load_path"] == str(tmp_path / "model")
    assert calls["load"] == {"device": "cuda", "t3_model": "v3"}
    adapter.warm()
    identity = adapter.begin("request:test", _segment(text))
    completed, result = adapter.settle()

    assert completed == identity
    assert result.sample_rate_hz == 24_000
    assert result.channel_count == 1
    assert len(result.payload) == 16
    generations = calls["generations"]
    assert isinstance(generations, list)
    assert generations[-1] == {
        "text": text,
        "language_id": language,
        "audio_prompt_path": None,
        **GENERATION_SETTINGS,
    }
    assert CANDIDATE_ID == "chatterbox-multilingual-v3-cuda-bf16-default-v4"


def test_cancel_is_identity_bound_and_cleans_the_loaded_model(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, calls = _adapter(tmp_path, monkeypatch)
    adapter.load()
    adapter.warm()
    identity = adapter.begin("request:test", _segment("Texto local."))

    adapter.cancel(identity)

    assert not adapter.has_active_operation
    assert calls["cleaned"] is True
    assert adapter.capabilities().local_speech_generation == "unknown"


@pytest.mark.parametrize(
    ("versions", "cuda_available", "bf16_available", "capability"),
    [
        (
            {"chatterbox-tts": "0.0.0", "torch": TORCH_VERSION, "torchaudio": TORCHAUDIO_VERSION},
            True,
            True,
            (12, 0),
        ),
        (None, False, True, (12, 0)),
        (None, True, False, (12, 0)),
        (None, True, True, (8, 9)),
    ],
)
def test_load_fails_closed_for_unreviewed_runtime_or_provider(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    versions: dict[str, str] | None,
    cuda_available: bool,
    bf16_available: bool,
    capability: tuple[int, int],
) -> None:
    adapter, _calls = _adapter(
        tmp_path,
        monkeypatch,
        versions=versions,
        cuda_available=cuda_available,
        bf16_available=bf16_available,
        capability=capability,
    )

    with pytest.raises(EngineFailure) as failure:
        adapter.load()

    assert failure.value.code is EngineFailureCode.UNAVAILABLE


def test_language_outside_the_admitted_pair_is_rejected(tmp_path: Path) -> None:
    root = tmp_path / "model"
    root.mkdir()

    with pytest.raises(EngineFailure) as failure:
        ChatterboxMultilingualTtsEngine(root, "fr")

    assert failure.value.code is EngineFailureCode.UNAVAILABLE
