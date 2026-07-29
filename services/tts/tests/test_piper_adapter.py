"""Model-free coverage for the exact Piper/davefx service adapter."""

from __future__ import annotations

import hashlib
import json
import struct
import sys
from collections.abc import Iterator
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import Final

import pytest

from voxleaf_tts.engine import EngineFailure, EngineFailureCode
from voxleaf_tts.piper_adapter import (
    ARTIFACTS,
    CANDIDATE_ID,
    ENGINE_VERSION,
    LENGTH_SCALE,
    MODEL_REVISION,
    NOISE_SCALE,
    NOISE_W_SCALE,
    NORMALIZE_AUDIO,
    ONNXRUNTIME_VERSION,
    SOURCE_SAMPLE_RATE_HZ,
    VOICE_ID,
    VOLUME,
    ArtifactIdentity,
    PiperCpuTtsEngine,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
PROFILE_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "profile-v6.json"
CANDIDATE_LOCK: Final = (
    REPOSITORY_ROOT
    / "services"
    / "tts"
    / "benchmarks"
    / "candidates"
    / "piper_1_4_2_cpu"
    / "uv.lock"
)


class FakeAudioArray:
    def __init__(self, values: list[float]) -> None:
        self.values = values
        self.size = len(values)

    def __len__(self) -> int:
        return self.size

    def __iter__(self) -> Iterator[float]:
        return iter(self.values)


class FakeVoice:
    def __init__(
        self,
        calls: dict[str, object],
        samples: FakeAudioArray | None = None,
        *,
        provider: str = "CPUExecutionProvider",
        sample_rate: int = SOURCE_SAMPLE_RATE_HZ,
        failure: Exception | None = None,
    ) -> None:
        self._calls = calls
        self._samples = samples if samples is not None else FakeAudioArray([0.0] * 2_205)
        self._failure = failure
        self.session = SimpleNamespace(get_providers=lambda: [provider])
        self.config = SimpleNamespace(
            sample_rate=sample_rate,
            num_speakers=1,
            espeak_voice="es",
        )

    def synthesize(
        self,
        text: str,
        syn_config: object | None = None,
        include_alignments: bool = False,
    ) -> tuple[object, ...]:
        if self._failure is not None:
            raise self._failure
        generations = self._calls.setdefault("generations", [])
        assert isinstance(generations, list)
        generations.append(
            {
                "text": text,
                "syn_config": syn_config,
                "include_alignments": include_alignments,
            }
        )
        return (
            SimpleNamespace(
                sample_rate=self.config.sample_rate,
                sample_width=2,
                sample_channels=1,
                audio_float_array=self._samples,
            ),
        )


def _write_exact_artifacts(root: Path) -> tuple[ArtifactIdentity, ...]:
    artifacts: list[ArtifactIdentity] = []
    for relative, content in (
        ("es_ES-davefx-medium.onnx", b"model-test"),
        ("es_ES-davefx-medium.onnx.json", b"config-test"),
        ("MODEL_CARD", b"card-test"),
    ):
        path = root / relative
        path.write_bytes(content)
        artifacts.append(
            ArtifactIdentity(
                relative,
                hashlib.sha256(content).hexdigest(),
                len(content),
            )
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
    voice: FakeVoice | None = None,
    versions: dict[str, str] | None = None,
    distribution_root: Path | None = None,
    onnx_device: str = "CPU",
    onnx_providers: tuple[str, ...] = ("CPUExecutionProvider",),
) -> tuple[PiperCpuTtsEngine, dict[str, object], FakeVoice]:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    artifact_root = tmp_path / "model"
    artifact_root.mkdir()
    artifacts = _write_exact_artifacts(artifact_root)
    runtime_root, executable, distributions = _runtime(tmp_path)
    calls: dict[str, object] = {}
    selected_voice = voice or FakeVoice(calls)

    class VoiceFactory:
        @staticmethod
        def load(*args: object, **kwargs: object) -> FakeVoice:
            calls["load_args"] = args
            calls["load_kwargs"] = kwargs
            return selected_voice

    class SynthesisConfig:
        def __init__(self, **kwargs: object) -> None:
            self.values = kwargs
            calls["synthesis_config"] = kwargs

    onnxruntime = ModuleType("onnxruntime")
    onnxruntime.__dict__.update(
        {
            "get_device": lambda: onnx_device,
            "get_available_providers": lambda: list(onnx_providers),
        }
    )
    voice_module = ModuleType("piper.voice")
    voice_module.__dict__["PiperVoice"] = VoiceFactory
    config_module = ModuleType("piper.config")
    config_module.__dict__["SynthesisConfig"] = SynthesisConfig
    modules = {
        "onnxruntime": onnxruntime,
        "piper.voice": voice_module,
        "piper.config": config_module,
    }
    selected_versions = versions or {
        "piper-tts": ENGINE_VERSION,
        "onnxruntime": ONNXRUNTIME_VERSION,
    }
    root = distribution_root or distributions
    adapter = PiperCpuTtsEngine(
        artifact_root,
        artifacts=artifacts,
        importer=modules.__getitem__,
        version_reader=selected_versions.__getitem__,
        distribution_root_reader=lambda _name: root,
        runtime_root=runtime_root,
        runtime_executable=executable,
        python_version=(3, 12),
    )
    return adapter, calls, selected_voice


def _segment(text: str = "Texto sintético local.") -> dict[str, object]:
    return {
        "text": text,
        "sessionId": "session:test",
        "generationId": "generation:test",
        "segmentId": "segment:test",
    }


def test_frozen_constants_match_v6_profile_and_candidate_lock() -> None:
    profile = json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
    candidate = profile["candidate"]

    assert candidate["candidateId"] == CANDIDATE_ID
    assert candidate["engine"]["version"] == ENGINE_VERSION
    assert candidate["model"]["revision"] == MODEL_REVISION
    assert candidate["model"]["voiceId"] == VOICE_ID
    assert tuple(candidate["model"]["artifacts"]) == tuple(
        {
            "path": artifact.relative_path,
            "sha256": artifact.sha256,
            "sizeBytes": artifact.size_bytes,
        }
        for artifact in ARTIFACTS
    )
    assert candidate["runtime"]["onnxruntime"] == ONNXRUNTIME_VERSION
    assert candidate["runtime"]["sampleRateHz"] == SOURCE_SAMPLE_RATE_HZ
    assert candidate["generation"] == {
        "speakerId": None,
        "noiseScale": NOISE_SCALE,
        "lengthScale": LENGTH_SCALE,
        "noiseW": NOISE_W_SCALE,
        "normalizeAudio": NORMALIZE_AUDIO,
        "volume": VOLUME,
    }
    assert (
        hashlib.sha256(CANDIDATE_LOCK.read_bytes()).hexdigest()
        == (profile["authorities"]["candidateLock"]["sha256"])
    )


def test_exact_load_warm_and_generation_use_frozen_identity_and_protocol_format(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, calls, _voice = _adapter(tmp_path, monkeypatch)

    assert adapter.capabilities().local_speech_generation == "unknown"
    adapter.load()
    assert calls["load_kwargs"] == {
        "config_path": tmp_path / "model" / "es_ES-davefx-medium.onnx.json",
        "use_cuda": False,
        "download_dir": tmp_path / "model",
    }
    assert calls["synthesis_config"] == {
        "speaker_id": None,
        "noise_scale": NOISE_SCALE,
        "length_scale": LENGTH_SCALE,
        "noise_w_scale": NOISE_W_SCALE,
        "normalize_audio": NORMALIZE_AUDIO,
        "volume": VOLUME,
    }
    adapter.warm()
    identity = adapter.begin("request:test", _segment())
    completed_identity, result = adapter.settle()

    assert completed_identity == identity
    assert result.sample_rate_hz == 24_000
    assert result.channel_count == 1
    assert len(result.payload) == 2_400 * 4
    assert all(math_value == 0.0 for (math_value,) in struct.iter_unpack("<f", result.payload))
    capabilities = adapter.capabilities()
    assert capabilities.local_speech_generation == "supported"
    assert capabilities.hardware_acceleration == "unsupported"
    assert capabilities.cpu_fallback == "supported"
    adapter.release_result()
    adapter.cleanup()


@pytest.mark.parametrize(
    ("distribution", "version"),
    [("piper-tts", "0.0.0"), ("onnxruntime", "1.26.0")],
)
def test_rejects_runtime_version_mismatch_before_import(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    distribution: str,
    version: str,
) -> None:
    versions = {
        "piper-tts": ENGINE_VERSION,
        "onnxruntime": ONNXRUNTIME_VERSION,
    }
    versions[distribution] = version
    adapter, calls, _voice = _adapter(tmp_path, monkeypatch, versions=versions)

    with pytest.raises(EngineFailure) as failure:
        adapter.load()
    assert failure.value.code is EngineFailureCode.UNAVAILABLE
    assert calls == {}


def test_rejects_distribution_outside_candidate_environment(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    outside = tmp_path / "outside"
    outside.mkdir()
    adapter, calls, _voice = _adapter(
        tmp_path,
        monkeypatch,
        distribution_root=outside,
    )

    with pytest.raises(EngineFailure) as failure:
        adapter.load()
    assert failure.value.code is EngineFailureCode.UNAVAILABLE
    assert calls == {}


def test_rejects_missing_offline_control_and_changed_artifact(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, calls, _voice = _adapter(tmp_path, monkeypatch)
    monkeypatch.delenv("HF_HUB_OFFLINE")

    with pytest.raises(EngineFailure) as failure:
        adapter.load()
    assert failure.value.code is EngineFailureCode.UNAVAILABLE
    assert calls == {}

    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    (tmp_path / "model" / "MODEL_CARD").write_bytes(b"changed")
    with pytest.raises(EngineFailure) as failure:
        adapter.load()
    assert failure.value.code is EngineFailureCode.UNAVAILABLE
    assert calls == {}


@pytest.mark.parametrize(
    ("device", "providers", "voice_provider"),
    [
        ("GPU", ("CPUExecutionProvider",), "CPUExecutionProvider"),
        ("CPU", ("CUDAExecutionProvider",), "CPUExecutionProvider"),
        ("CPU", ("CPUExecutionProvider",), "CUDAExecutionProvider"),
    ],
)
def test_rejects_non_cpu_provider_selection(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    device: str,
    providers: tuple[str, ...],
    voice_provider: str,
) -> None:
    calls: dict[str, object] = {}
    voice = FakeVoice(calls, provider=voice_provider)
    adapter, _load_calls, _voice = _adapter(
        tmp_path,
        monkeypatch,
        voice=voice,
        onnx_device=device,
        onnx_providers=providers,
    )

    with pytest.raises(EngineFailure) as failure:
        adapter.load()
    assert failure.value.code is EngineFailureCode.UNAVAILABLE


@pytest.mark.parametrize(
    "samples",
    [
        [],
        [float("nan")],
        [0.0] * 441_001,
    ],
)
def test_invalid_output_publishes_no_retained_result(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    samples: list[float],
) -> None:
    calls: dict[str, object] = {}
    voice = FakeVoice(calls, FakeAudioArray(samples))
    adapter, _load_calls, _voice = _adapter(tmp_path, monkeypatch, voice=voice)
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
    voice = FakeVoice(calls, failure=RuntimeError("private implementation detail"))
    adapter, _calls, _voice = _adapter(tmp_path, monkeypatch, voice=voice)
    adapter.load()

    with pytest.raises(EngineFailure) as failure:
        adapter.warm()
    assert failure.value.code is EngineFailureCode.FAILURE
    assert "private" not in str(failure.value)
    adapter.cleanup()
    adapter.cleanup()


def test_importing_adapter_does_not_import_piper_or_onnxruntime() -> None:
    assert "piper.voice" not in sys.modules
    assert "onnxruntime" not in sys.modules
