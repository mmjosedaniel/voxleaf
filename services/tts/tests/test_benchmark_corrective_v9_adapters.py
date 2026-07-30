"""Model-free tests for the corrected Chatterbox and MOSS v9 adapters."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Final

from pytest import MonkeyPatch

from benchmarks.adapters.corrective_v9 import (
    Artifact,
    ChatterboxV9Adapter,
    ChatterboxV9Configuration,
    ChatterboxV9Profile,
    MossV9Adapter,
    MossV9Configuration,
    MossV9Profile,
    _restore_candidate_site_packages,
    load_chatterbox_v9_profile,
    load_chatterbox_v10_profile,
    load_moss_v9_profile,
)
from benchmarks.contracts import GenerationRequest
from benchmarks.v9_authority import CHATTERBOX_CANDIDATE_ID, MOSS_CANDIDATE_ID

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]


class _FakeTensor:
    def __init__(self, samples: int) -> None:
        self._samples = samples

    def numel(self) -> int:
        return self._samples

    def detach(self) -> _FakeTensor:
        return self

    def to(self, _device: str) -> _FakeTensor:
        return self

    def reshape(self, _shape: int) -> _FakeTensor:
        return self

    def numpy(self) -> list[float]:
        return [0.0] * self._samples


class _FakeChatterbox:
    def __init__(self) -> None:
        self.calls: list[dict[str, object]] = []

    def generate(self, text: str, **kwargs: object) -> _FakeTensor:
        self.calls.append({"text": text, **kwargs})
        return _FakeTensor(24_001)


class _FakeMoss:
    def prepare_synthesis_text(self, **kwargs: object) -> dict[str, object]:
        return {"text": kwargs["text"]}

    def split_voice_clone_text(self, text: str, max_tokens: int) -> list[str]:
        assert max_tokens == 75
        return [text]

    def synthesize_single_chunk(self, **kwargs: object) -> dict[str, object]:
        assert kwargs["streaming"] is True
        return {"waveform": _FakeArray(96_000, 2)}

    def estimate_voice_clone_inter_chunk_pause_seconds(self, _text: str) -> float:
        return 0.24


class _FakeArray:
    def __init__(self, samples: int, channels: int = 1) -> None:
        self.samples = samples
        self.channels = channels
        self.ndim = 2 if channels > 1 else 1
        self.shape = (samples, channels) if channels > 1 else (samples,)
        self.size = samples * channels

    def mean(self, *, axis: int, dtype: object) -> _FakeArray:
        assert axis == 1
        assert dtype == "float32"
        return _FakeArray(self.samples)

    def astype(self, _dtype: object, *, copy: bool) -> _FakeArray:
        assert copy is False
        return self


class _FakePositions:
    def __init__(self, count: int) -> None:
        self.count = count

    def __mul__(self, _value: float) -> _FakePositions:
        return self


class _Finite:
    def all(self) -> bool:
        return True


class _FakeNumpy:
    float32 = "float32"
    float64 = "float64"

    @staticmethod
    def asarray(value: object, *, dtype: object) -> object:
        assert dtype == "float32"
        return value

    @staticmethod
    def concatenate(values: list[object], *, axis: int) -> object:
        assert axis == 0
        assert len(values) == 1
        return values[0]

    @staticmethod
    def arange(count: int, *, dtype: object) -> _FakePositions:
        assert dtype == "float64"
        return _FakePositions(count)

    @staticmethod
    def interp(
        positions: _FakePositions,
        _source: _FakePositions,
        _waveform: _FakeArray,
    ) -> _FakeArray:
        return _FakeArray(positions.count)

    @staticmethod
    def isfinite(_value: object) -> _Finite:
        return _Finite()

    @staticmethod
    def zeros(shape: tuple[int, int], *, dtype: object) -> _FakeArray:
        assert dtype == "float32"
        return _FakeArray(*shape)


def _request(language: str = "es") -> GenerationRequest:
    return GenerationRequest(
        request_id="request",
        case_id=f"{language}-case",
        phase="warm",
        text="Texto sintético." if language == "es" else "Synthetic text.",
        language=language,
    )


def test_v9_profiles_load_corrected_exact_identities() -> None:
    chatterbox = load_chatterbox_v9_profile(REPOSITORY_ROOT)
    moss = load_moss_v9_profile(REPOSITORY_ROOT)
    assert chatterbox.candidate_id == CHATTERBOX_CANDIDATE_ID
    assert chatterbox.model_revision == "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
    assert len(chatterbox.artifacts) == 6
    assert moss.candidate_id == MOSS_CANDIDATE_ID
    assert moss.voice_id == "Ava"
    assert len(moss.artifacts) == 16
    assert {artifact.root for artifact in moss.artifacts} == {"model", "codec"}


def test_v10_chatterbox_profile_requires_the_exact_cuda_wheel_identity() -> None:
    chatterbox = load_chatterbox_v10_profile(REPOSITORY_ROOT)
    assert chatterbox.candidate_id == ("chatterbox-multilingual-v3-cuda-bf16-default-v3")
    assert chatterbox.torch_version == "2.6.0+cu124"
    assert chatterbox.torchaudio_version == "2.6.0+cu124"
    assert len(chatterbox.artifacts) == 6


def test_chatterbox_adapter_uses_explicit_language_and_bounded_metadata_chunks() -> None:
    profile = ChatterboxV9Profile(
        candidate_id=CHATTERBOX_CANDIDATE_ID,
        source_revision="source",
        model_revision="model",
        artifacts=(),
        generation={
            "exaggeration": 0.5,
            "cfgWeight": 0.5,
            "temperature": 0.8,
            "repetitionPenalty": 1.2,
            "minP": 0.05,
            "topP": 1.0,
        },
    )
    adapter = ChatterboxV9Adapter(
        profile,
        ChatterboxV9Configuration(Path("unused")),
    )
    model = _FakeChatterbox()
    adapter._model = model
    chunks = tuple(adapter.generate(_request()))
    assert sum(chunk.sample_count for chunk in chunks) == 24_001
    assert all(chunk.sample_count <= 6_000 for chunk in chunks)
    assert chunks[-1].end_of_output is True
    assert model.calls[0]["language_id"] == "es"
    assert model.calls[0]["audio_prompt_path"] is None


def test_moss_adapter_keeps_text_in_memory_and_downmixes_to_24khz(tmp_path: Path) -> None:
    profile = MossV9Profile(
        candidate_id=MOSS_CANDIDATE_ID,
        source_revision="source",
        model_revision="model",
        codec_revision="codec",
        voice_id="Ava",
        artifacts=(),
        generation={},
    )
    output_root = tmp_path / "ephemeral"
    adapter = MossV9Adapter(
        profile,
        MossV9Configuration(
            artifact_root=tmp_path,
            ephemeral_output_root=output_root,
        ),
    )
    adapter._runtime = _FakeMoss()
    adapter._numpy = _FakeNumpy()
    adapter._prompt_audio_codes = [[1, 2]]
    waveform, sample_rate = adapter.synthesize_for_quality(_request())
    assert sample_rate == 24_000
    assert isinstance(waveform, _FakeArray)
    assert waveform.size == 48_000
    assert not output_root.exists()


def test_adapter_profile_artifacts_are_content_free() -> None:
    artifact = Artifact("model", "model.bin", 10, "0" * 64)
    assert artifact.relative_path == "model.bin"
    assert "Texto" not in repr(artifact)


def test_spawned_worker_restores_its_candidate_site_packages(
    tmp_path: Path,
    monkeypatch: MonkeyPatch,
) -> None:
    candidate_python = tmp_path / ".venv" / "Scripts" / "python.exe"
    candidate_python.parent.mkdir(parents=True)
    candidate_python.touch()
    site_packages = tmp_path / ".venv" / "Lib" / "site-packages"
    site_packages.mkdir(parents=True)
    copied_service_path = str(tmp_path / "service-site-packages")
    monkeypatch.setattr(sys, "executable", str(candidate_python))
    monkeypatch.setattr(sys, "path", [copied_service_path, str(site_packages)])

    _restore_candidate_site_packages()

    assert sys.path == [str(site_packages.resolve()), copied_service_path]
