"""Model-free coverage for the exact Piper/davefx service adapter."""

from __future__ import annotations

import hashlib
import json
import os
import struct
import sys
import threading
import tomllib
from collections.abc import Iterator
from pathlib import Path, PureWindowsPath
from types import ModuleType, SimpleNamespace
from typing import Final

import pytest

from voxleaf_tts.adapters.piper import (
    ARTIFACTS,
    CANDIDATE_ID,
    ENGINE_VERSION,
    ENGLISH_CANDIDATE_ID,
    ENGLISH_PROFILE,
    LENGTH_SCALE,
    MODEL_REVISION,
    NOISE_SCALE,
    NOISE_W_SCALE,
    NORMALIZE_AUDIO,
    ONNXRUNTIME_VERSION,
    SOURCE_SAMPLE_RATE_HZ,
    SPANISH_PROFILE,
    VOICE_ID,
    VOLUME,
    ArtifactIdentity,
    PiperCpuTtsEngine,
    PiperVoiceProfile,
    _is_within,
)
from voxleaf_tts.engine import EngineFailure, EngineFailureCode


def test_windows_verbatim_runtime_executable_remains_within_runtime_root() -> None:
    runtime_root = PureWindowsPath(r"C:\Program Files\VoxLeaf\runtime")

    assert _is_within(
        PureWindowsPath(r"\\?\C:\Program Files\VoxLeaf\runtime\python.exe"),
        runtime_root,
    )
    assert not _is_within(
        PureWindowsPath(r"\\?\C:\Program Files\Outside\python.exe"),
        runtime_root,
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
FAKE_ESPEAK_LOCK: Final = threading.Lock()


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
        espeak_voice: str = "es",
        failure: Exception | None = None,
    ) -> None:
        self._calls = calls
        self._samples = samples if samples is not None else FakeAudioArray([0.0] * 2_205)
        self._failure = failure
        self.session = SimpleNamespace(get_providers=lambda: [provider])
        self.config = SimpleNamespace(
            sample_rate=sample_rate,
            num_speakers=1,
            espeak_voice=espeak_voice,
            vowel_clusters={("a", "i")},
        )
        self.espeak_data_dir = Path("synthetic-espeak-data")

    def phonemize(self, text: str) -> list[list[str]]:
        # Model the upstream delimiter interpretation independently of the
        # literal fake phonemizer installed through the adapter's importer.
        return [list(text.replace("[[", "").replace("]]", ""))]

    def synthesize(
        self,
        text: str,
        syn_config: object | None = None,
        include_alignments: bool = False,
    ) -> tuple[object, ...]:
        if self._failure is not None:
            raise self._failure
        self._calls["last_phonemes"] = self.phonemize(text)
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


def _write_exact_artifacts(
    root: Path,
    profile: PiperVoiceProfile,
) -> tuple[ArtifactIdentity, ...]:
    artifacts: list[ArtifactIdentity] = []
    for artifact, content in zip(
        profile.artifacts,
        (b"model-test", b"config-test", b"card-test"),
        strict=True,
    ):
        relative = artifact.relative_path
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
    profile: PiperVoiceProfile | None = None,
) -> tuple[PiperCpuTtsEngine, dict[str, object], FakeVoice]:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.delenv("ORT_DISABLE_TELEMETRY", raising=False)
    artifact_root = tmp_path / "model"
    artifact_root.mkdir()
    selected_profile = profile or SPANISH_PROFILE
    artifacts = _write_exact_artifacts(artifact_root, selected_profile)
    runtime_root, executable, distributions = _runtime(tmp_path)
    calls: dict[str, object] = {}
    selected_voice = voice or FakeVoice(
        calls,
        espeak_voice=selected_profile.expected_espeak_voice,
    )

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
            "disable_telemetry_events": lambda: calls.__setitem__("telemetry_api_disabled", True),
            "get_device": lambda: onnx_device,
            "get_available_providers": lambda: list(onnx_providers),
        }
    )
    voice_module = ModuleType("piper.voice")
    voice_module.__dict__["PiperVoice"] = VoiceFactory

    class EspeakPhonemizer:
        def __init__(self, espeak_data_dir: str | Path) -> None:
            assert FAKE_ESPEAK_LOCK.locked()
            calls["phonemizer_data_dir"] = espeak_data_dir
            calls["phonemizer_instance"] = self

        def phonemize(
            self,
            voice: str,
            text: str,
            vowel_clusters: set[tuple[str, ...]] | None = None,
        ) -> list[list[str]]:
            assert FAKE_ESPEAK_LOCK.locked()
            observations = calls.setdefault("phonemizer_calls", [])
            assert isinstance(observations, list)
            observations.append((voice, text, vowel_clusters))
            return [list(text)]

    voice_module.__dict__["EspeakPhonemizer"] = EspeakPhonemizer
    voice_module.__dict__["_ESPEAK_PHONEMIZER_LOCK"] = FAKE_ESPEAK_LOCK
    config_module = ModuleType("piper.config")
    config_module.__dict__["SynthesisConfig"] = SynthesisConfig
    modules = {
        "onnxruntime": onnxruntime,
        "piper.voice": voice_module,
        "piper.config": config_module,
    }

    def import_module(name: str) -> ModuleType:
        if name == "onnxruntime":
            calls["telemetry_disabled_at_import"] = os.environ.get("ORT_DISABLE_TELEMETRY")
        elif name == "piper.voice":
            calls["telemetry_disabled_before_piper"] = calls.get("telemetry_api_disabled", False)
        return modules[name]

    selected_versions = versions or {
        "piper-tts": ENGINE_VERSION,
        "onnxruntime": ONNXRUNTIME_VERSION,
    }
    root = distribution_root or distributions
    adapter = PiperCpuTtsEngine(
        artifact_root,
        profile=selected_profile,
        artifacts=artifacts,
        importer=import_module,
        version_reader=selected_versions.__getitem__,
        distribution_root_reader=lambda _name: root,
        runtime_root=runtime_root,
        runtime_executable=executable,
        python_version=(3, 12),
    )
    return adapter, calls, selected_voice


@pytest.mark.parametrize("initial_value", [None, "0"])
def test_load_disables_telemetry_before_import(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, initial_value: str | None
) -> None:
    adapter, calls, _ = _adapter(tmp_path, monkeypatch)
    if initial_value is None:
        monkeypatch.delenv("ORT_DISABLE_TELEMETRY", raising=False)
    else:
        monkeypatch.setenv("ORT_DISABLE_TELEMETRY", initial_value)
    adapter.load()

    assert calls["telemetry_disabled_at_import"] == "1"
    assert calls["telemetry_disabled_before_piper"] is True


def _segment(text: str = "Texto sintético local.") -> dict[str, object]:
    return {
        "text": text,
        "sessionId": "session:test",
        "generationId": "generation:test",
        "segmentId": "segment:test",
    }


@pytest.mark.parametrize("profile", [SPANISH_PROFILE, ENGLISH_PROFILE])
@pytest.mark.parametrize(
    "text",
    ["[[literal]]", "Before [[literal]] after.", "An unmatched [[ delimiter.", "Ordinary prose."],
)
def test_saf_literal_phonemization_preserves_text_voice_options_and_shared_lock(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    profile: PiperVoiceProfile,
    text: str,
) -> None:
    original_method = FakeVoice.phonemize
    adapter, calls, voice = _adapter(tmp_path, monkeypatch, profile=profile)
    adapter.load()
    adapter.warm()
    adapter.begin("request:saf", _segment(text))
    adapter.settle()
    assert calls["last_phonemes"] == [list(text)]
    assert calls["phonemizer_data_dir"] == voice.espeak_data_dir
    assert calls["phonemizer_calls"] == [
        (profile.expected_espeak_voice, profile.warm_text, voice.config.vowel_clusters),
        (profile.expected_espeak_voice, text, voice.config.vowel_clusters),
    ]
    assert FakeVoice.phonemize is original_method
    assert not FAKE_ESPEAK_LOCK.locked()
    adapter.release_result()
    adapter.cleanup()


def test_saf_literal_phonemizers_are_owned_by_each_voice_instance(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    spanish_root, english_root = tmp_path / "spanish", tmp_path / "english"
    spanish_root.mkdir()
    english_root.mkdir()
    spanish, es_calls, es_voice = _adapter(spanish_root, monkeypatch)
    english, en_calls, en_voice = _adapter(english_root, monkeypatch, profile=ENGLISH_PROFILE)
    spanish.load()
    english.load()
    spanish.warm()
    english.warm()
    assert es_calls["phonemizer_instance"] is not en_calls["phonemizer_instance"]
    assert es_voice.phonemize("[[texto]]") == [list("[[texto]]")]
    assert en_voice.phonemize("[[text]]") == [list("[[text]]")]
    spanish.cleanup()
    assert en_voice.phonemize("Still [[literal]].") == [list("Still [[literal]].")]
    english.cleanup()


def test_current_adapter_runtime_matches_the_locked_release_graph() -> None:
    core = REPOSITORY_ROOT / "services" / "tts" / "release" / "core"
    project = tomllib.loads((core / "pyproject.toml").read_text(encoding="utf-8"))
    lock = tomllib.loads((core / "uv.lock").read_text(encoding="utf-8"))
    assert ENGINE_VERSION == "1.8.0"
    assert f"piper-tts=={ENGINE_VERSION}" in project["project"]["dependencies"]
    assert [
        package["version"] for package in lock["package"] if package["name"] == "piper-tts"
    ] == [ENGINE_VERSION]
    assert ONNXRUNTIME_VERSION == "1.31.0"
    assert f"onnxruntime=={ONNXRUNTIME_VERSION}" in project["project"]["dependencies"]
    assert [
        package["version"] for package in lock["package"] if package["name"] == "onnxruntime"
    ] == [ONNXRUNTIME_VERSION]


def test_voice_and_generation_constants_preserve_the_v6_authority() -> None:
    profile = json.loads(PROFILE_PATH.read_text(encoding="utf-8"))
    candidate = profile["candidate"]

    assert candidate["candidateId"] == CANDIDATE_ID
    assert candidate["engine"]["version"] == "1.4.2"
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
    # The v6 evaluation remains immutable; ADR-0054 governs the current runtime.
    assert candidate["runtime"]["onnxruntime"] == "1.27.0"
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


def test_english_profile_uses_the_exact_joe_voice_and_model_paths(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, calls, _voice = _adapter(
        tmp_path,
        monkeypatch,
        profile=ENGLISH_PROFILE,
    )

    adapter.load()
    adapter.warm()
    adapter.begin("request:english", _segment("A bounded English segment."))
    adapter.settle()

    assert ENGLISH_PROFILE.candidate_id == ENGLISH_CANDIDATE_ID
    assert calls["load_args"] == (tmp_path / "model" / "en_US-joe-medium.onnx",)
    assert calls["load_kwargs"] == {
        "config_path": tmp_path / "model" / "en_US-joe-medium.onnx.json",
        "use_cuda": False,
        "download_dir": tmp_path / "model",
    }
    generations = calls["generations"]
    assert isinstance(generations, list)
    assert generations[-1]["text"] == "A bounded English segment."


@pytest.mark.parametrize(
    ("distribution", "version"),
    [
        ("piper-tts", "0.0.0"),
        ("piper-tts", "1.4.2"),
        ("onnxruntime", "1.26.0"),
        ("onnxruntime", "1.27.0"),
    ],
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


class ObservedAudioArray(FakeAudioArray):
    def __init__(self, values: list[float], events: list[str], name: str) -> None:
        super().__init__(values)
        self.events = events
        self.name = name

    def __len__(self) -> int:
        return len(self.values)

    def __iter__(self) -> Iterator[float]:
        self.events.append(self.name)
        return super().__iter__()


def _observe_chunks(
    voice: FakeVoice,
    monkeypatch: pytest.MonkeyPatch,
    chunks: tuple[SimpleNamespace, ...],
    events: list[str],
) -> None:
    def synthesize(*_args: object, **_kwargs: object) -> Iterator[SimpleNamespace]:
        for index, chunk in enumerate(chunks):
            events.append(f"yield:{index}")
            yield chunk

    monkeypatch.setattr(voice, "synthesize", synthesize)


def test_multiple_nonzero_chunks_materialize_then_preserve_order_and_rounding(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter, _calls, voice = _adapter(tmp_path, monkeypatch)
    adapter.load()
    adapter.warm()
    events: list[str] = []
    chunks = tuple(
        SimpleNamespace(
            sample_rate=22_050,
            sample_width=2,
            sample_channels=1,
            audio_float_array=ObservedAudioArray(values, events, f"iterate:{index}"),
        )
        for index, values in enumerate(([0.25] * 220, [-0.5] * 221))
    )
    _observe_chunks(voice, monkeypatch, chunks, events)
    identity = adapter.begin("request:chunks", _segment())
    completed, result = adapter.settle()
    assert completed == identity
    assert (result.sample_rate_hz, result.channel_count) == (24_000, 1)
    assert result.payload == (
        struct.pack("<f", 0.25) * 239
        + struct.pack("<f", -0.1859375)
        + struct.pack("<f", -0.5) * 240
    )
    assert events == [
        "yield:0",
        "yield:1",
        "iterate:0",
        "iterate:1",
    ]


@pytest.mark.parametrize(
    "case",
    ("empty", "rate", "width", "channels", "bool", "length", "cumulative"),
)
def test_chunk_validation_rejects_before_iteration_after_eager_materialization(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    case: str,
) -> None:
    adapter, _calls, voice = _adapter(tmp_path, monkeypatch)
    adapter.load()
    events: list[str] = []
    sizes = (220_500, 220_501) if case == "cumulative" else (1, 1)
    chunks = tuple(
        SimpleNamespace(
            sample_rate=22_050,
            sample_width=2,
            sample_channels=1,
            audio_float_array=ObservedAudioArray([0.0] * size, events, f"iterate:{index}"),
        )
        for index, size in enumerate(sizes)
    )
    if case in {"rate", "width", "channels"}:
        setattr(chunks[0], f"sample_{case}", 0)
    elif case in {"bool", "length"}:
        invalid_sizes = dict(bool=True, length=2)
        chunks[0].audio_float_array.size = invalid_sizes[case]
    if case == "empty":
        chunks = ()
    _observe_chunks(voice, monkeypatch, chunks, events)
    with pytest.raises(EngineFailure) as failure:
        adapter.warm()
    assert failure.value.code is EngineFailureCode.FAILURE
    assert not adapter.has_active_operation
    assert adapter.capabilities().local_speech_generation == "unknown"
    expected = [] if case == "empty" else ["yield:0", "yield:1"]
    if case == "cumulative":
        expected.append("iterate:0")
    assert events == expected


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
