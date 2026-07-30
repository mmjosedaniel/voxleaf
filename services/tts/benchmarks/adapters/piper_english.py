"""Exact Piper/joe English adapter for the frozen bilingual v8 baseline."""

from __future__ import annotations

import hashlib
import importlib
import os
from collections.abc import Callable, Iterable, Iterator, Mapping, Sequence, Sized
from dataclasses import dataclass
from importlib import metadata
from pathlib import Path
from types import ModuleType
from typing import Any, Final, Protocol, cast

from benchmarks.contracts import (
    AdapterCapabilities,
    AudioChunk,
    CancellationResponse,
    GenerationRequest,
)
from benchmarks.v8_authority import load_frozen_v8_authority

PIPER_ENGLISH_CANDIDATE_ID: Final = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1"
MODEL_REVISION: Final = "0d907f158acc877ddeebcbf827659ee13bea8bcd"
NATIVE_SAMPLE_RATE_HZ: Final = 22_050
OUTPUT_SAMPLE_RATE_HZ: Final = 24_000
MAXIMUM_PUBLISHED_CHUNK_MILLISECONDS: Final = 250
HASH_READ_BYTES: Final = 1024 * 1024

type ModuleImporter = Callable[[str], ModuleType]
type VersionReader = Callable[[str], str]


class PiperEnglishConfigurationError(RuntimeError):
    """Fixed content-free failure for the exact v8 English profile."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-piper-english:{code}")
        self.code = code


@dataclass(frozen=True)
class PiperEnglishArtifact:
    file_name: str
    size_bytes: int
    sha256: str


@dataclass(frozen=True)
class PiperEnglishProfile:
    candidate_id: str
    model_revision: str
    voice_id: str
    engine_version: str
    runtime_version: str
    artifacts: tuple[PiperEnglishArtifact, ...]
    noise_scale: float
    length_scale: float
    noise_w: float
    normalize_audio: bool
    volume: float


@dataclass(frozen=True)
class PiperEnglishConfiguration:
    artifact_root: Path
    offline: bool = True


class _Array(Sized, Protocol):
    size: int


class _PiperAudioChunk(Protocol):
    sample_rate: int
    sample_width: int
    sample_channels: int
    audio_float_array: _Array


class _OnnxSession(Protocol):
    def get_providers(self) -> list[str]: ...


class _VoiceConfig(Protocol):
    sample_rate: int
    num_speakers: int
    espeak_voice: str


class _PiperVoice(Protocol):
    session: _OnnxSession
    config: _VoiceConfig

    def synthesize(
        self,
        text: str,
        syn_config: object | None = None,
        include_alignments: bool = False,
    ) -> Iterable[_PiperAudioChunk]: ...


class _PiperVoiceFactory(Protocol):
    def load(
        self,
        model_path: str | Path,
        config_path: str | Path | None = None,
        use_cuda: bool = False,
        espeak_data_dir: str | Path | None = None,
        download_dir: str | Path | None = None,
    ) -> _PiperVoice: ...


class _PiperVoiceModule(Protocol):
    PiperVoice: _PiperVoiceFactory


class _SynthesisConfigFactory(Protocol):
    def __call__(self, **kwargs: object) -> object: ...


class _PiperConfigModule(Protocol):
    SynthesisConfig: _SynthesisConfigFactory


class _OnnxRuntimeModule(Protocol):
    def get_device(self) -> str: ...

    def get_available_providers(self) -> list[str]: ...


def _mapping(value: object, code: str = "authority") -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise PiperEnglishConfigurationError(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str = "authority") -> Sequence[object]:
    if not isinstance(value, list):
        raise PiperEnglishConfigurationError(code)
    return cast(Sequence[object], value)


def _string(value: object, code: str = "authority") -> str:
    if not isinstance(value, str) or not value:
        raise PiperEnglishConfigurationError(code)
    return value


def _number(value: object, code: str = "authority") -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        raise PiperEnglishConfigurationError(code)
    return float(value)


def load_piper_english_profile(repository_root: Path) -> PiperEnglishProfile:
    """Load the exact Piper baseline through the already-frozen v8 authority."""

    authority = load_frozen_v8_authority(repository_root)
    candidates = {
        candidate.get("candidateId"): candidate
        for candidate in (
            _mapping(item) for item in _sequence(authority.base.candidates.get("candidates"))
        )
    }
    candidate = _mapping(candidates.get(PIPER_ENGLISH_CANDIDATE_ID))
    engine = _mapping(candidate.get("engine"))
    model = _mapping(candidate.get("model"))
    dependency_lock = _mapping(candidate.get("dependencyLock"))
    voice_provenance = _mapping(candidate.get("voiceProvenance"))
    license_value = _mapping(candidate.get("license"))
    host = _mapping(candidate.get("host"))
    offline = _mapping(candidate.get("offline"))
    conversion = _mapping(candidate.get("audioConversion"))
    generation = _mapping(candidate.get("generation"))
    raw_artifacts = _sequence(model.get("artifacts"))
    if (
        candidate.get("role") != "english-baseline"
        or candidate.get("intakeDecision") != "admitted-to-baseline-evaluation"
        or engine.get("name") != "piper-tts"
        or engine.get("version") != "1.4.2"
        or engine.get("provider") != "onnxruntime-cpu"
        or engine.get("precision") != "float32"
        or model.get("revision") != MODEL_REVISION
        or model.get("voiceId") != "en_US-joe-medium"
        or model.get("languages") != ["en"]
        or model.get("nativeSampleRateHz") != NATIVE_SAMPLE_RATE_HZ
        or model.get("nativeChannels") != 1
        or len(raw_artifacts) != 3
        or dependency_lock.get("sha256")
        != "542bf0064d80b20b9cfe599b0ac0a39488d25dbfb73a50e65aac1985c643cd82"
        or voice_provenance.get("datasetLicense") != "CC0-1.0"
        or voice_provenance.get("personalReferenceAudioRequired") is not False
        or voice_provenance.get("status") != "sufficient-for-evaluation"
        or license_value.get("evaluation") != "permitted"
        or host.get("operatingSystem") != "Windows"
        or host.get("architecture") != "x86_64"
        or host.get("minimumLogicalProcessors") != 4
        or host.get("minimumTotalRamMiB") != 8192
        or host.get("gpuRequired") is not False
        or offline.get("artifactResolution") != "explicit-local-paths-only"
        or offline.get("outboundFirewallBlock") != "exact-candidate-interpreter"
        or conversion.get("input") != "22050-hz-mono-float32"
        or conversion.get("operation") != "bounded-linear-resample"
        or conversion.get("output") != "24000-hz-mono-float32"
        or candidate.get("normalizationProfile") != "narration-bilingual-v2"
    ):
        raise PiperEnglishConfigurationError("authority")
    expected_generation = {
        "speakerId": None,
        "noiseScale": 0.667,
        "lengthScale": 1.0,
        "noiseW": 0.8,
        "normalizeAudio": True,
        "volume": 1.0,
    }
    if dict(generation) != expected_generation:
        raise PiperEnglishConfigurationError("authority")

    artifacts = tuple(
        PiperEnglishArtifact(
            file_name=Path(_string(artifact.get("path"))).name,
            size_bytes=cast(int, artifact.get("sizeBytes")),
            sha256=_string(artifact.get("sha256")),
        )
        for artifact in (_mapping(item) for item in raw_artifacts)
    )
    if tuple(item.file_name for item in artifacts) != (
        "en_US-joe-medium.onnx",
        "en_US-joe-medium.onnx.json",
        "MODEL_CARD",
    ) or any(
        not isinstance(item.size_bytes, int)
        or isinstance(item.size_bytes, bool)
        or item.size_bytes <= 0
        or len(item.sha256) != 64
        for item in artifacts
    ):
        raise PiperEnglishConfigurationError("authority")
    return PiperEnglishProfile(
        candidate_id=PIPER_ENGLISH_CANDIDATE_ID,
        model_revision=MODEL_REVISION,
        voice_id="en_US-joe-medium",
        engine_version=_string(engine.get("version")),
        runtime_version="1.27.0",
        artifacts=artifacts,
        noise_scale=_number(generation.get("noiseScale")),
        length_scale=_number(generation.get("lengthScale")),
        noise_w=_number(generation.get("noiseW")),
        normalize_audio=generation.get("normalizeAudio") is True,
        volume=_number(generation.get("volume")),
    )


def verify_piper_english_artifacts(
    profile: PiperEnglishProfile,
    configuration: PiperEnglishConfiguration,
) -> Path:
    """Verify all allowlisted artifacts without following paths outside the root."""

    if not configuration.offline or not configuration.artifact_root.is_absolute():
        raise PiperEnglishConfigurationError("configuration")
    try:
        root = configuration.artifact_root.resolve(strict=True)
    except OSError:
        raise PiperEnglishConfigurationError("artifact-missing") from None
    if not root.is_dir():
        raise PiperEnglishConfigurationError("artifact-root")
    for artifact in profile.artifacts:
        try:
            target = (root / artifact.file_name).resolve(strict=True)
            target.relative_to(root)
        except (OSError, ValueError):
            raise PiperEnglishConfigurationError("artifact-missing") from None
        if not target.is_file() or target.stat().st_size != artifact.size_bytes:
            raise PiperEnglishConfigurationError("artifact-mismatch")
        digest = hashlib.sha256()
        try:
            with target.open("rb") as source:
                while chunk := source.read(HASH_READ_BYTES):
                    digest.update(chunk)
        except OSError:
            raise PiperEnglishConfigurationError("artifact-unreadable") from None
        if digest.hexdigest() != artifact.sha256:
            raise PiperEnglishConfigurationError("artifact-mismatch")
    return root


class PiperEnglishAdapter:
    """Local-path-only Piper English adapter with bounded 24 kHz conversion."""

    candidate_id: Final = PIPER_ENGLISH_CANDIDATE_ID

    def __init__(
        self,
        profile: PiperEnglishProfile,
        configuration: PiperEnglishConfiguration,
        *,
        importer: ModuleImporter = importlib.import_module,
        version_reader: VersionReader = metadata.version,
    ) -> None:
        self._profile = profile
        self._configuration = configuration
        self._importer = importer
        self._version_reader = version_reader
        self._voice: _PiperVoice | None = None
        self._synthesis_config: object | None = None

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            candidate_id=self.candidate_id,
            streaming_granularity="sample-chunks",
            sample_format="float32",
            generation_cancellation="worker-termination",
        )

    def load(self) -> None:
        if self._voice is not None:
            raise PiperEnglishConfigurationError("already-loaded")
        root = verify_piper_english_artifacts(self._profile, self._configuration)
        if os.environ.get("HF_HUB_OFFLINE") != "1":
            raise PiperEnglishConfigurationError("offline")
        try:
            if self._version_reader("piper-tts") != self._profile.engine_version:
                raise PiperEnglishConfigurationError("engine-version")
            if self._version_reader("onnxruntime") != self._profile.runtime_version:
                raise PiperEnglishConfigurationError("runtime-version")
            onnxruntime = cast(_OnnxRuntimeModule, self._importer("onnxruntime"))
            if (
                onnxruntime.get_device() != "CPU"
                or "CPUExecutionProvider" not in onnxruntime.get_available_providers()
            ):
                raise PiperEnglishConfigurationError("provider-unavailable")
            voice_module = cast(_PiperVoiceModule, self._importer("piper.voice"))
            config_module = cast(_PiperConfigModule, self._importer("piper.config"))
            voice = voice_module.PiperVoice.load(
                root / "en_US-joe-medium.onnx",
                config_path=root / "en_US-joe-medium.onnx.json",
                use_cuda=False,
                download_dir=root,
            )
            if (
                voice.session.get_providers() != ["CPUExecutionProvider"]
                or voice.config.sample_rate != NATIVE_SAMPLE_RATE_HZ
                or voice.config.num_speakers != 1
                or voice.config.espeak_voice != "en-us"
            ):
                raise PiperEnglishConfigurationError("provider-selected")
            synthesis_config = config_module.SynthesisConfig(
                speaker_id=None,
                noise_scale=self._profile.noise_scale,
                length_scale=self._profile.length_scale,
                noise_w_scale=self._profile.noise_w,
                normalize_audio=self._profile.normalize_audio,
                volume=self._profile.volume,
            )
        except PiperEnglishConfigurationError:
            raise
        except Exception:
            raise PiperEnglishConfigurationError("load-failed") from None
        self._voice = voice
        self._synthesis_config = synthesis_config

    def warm_up(self, request: GenerationRequest) -> None:
        for _ in self.generate(request):
            pass

    def _native_waveform(self, request: GenerationRequest) -> object:
        voice = self._voice
        synthesis_config = self._synthesis_config
        if voice is None or synthesis_config is None:
            raise PiperEnglishConfigurationError("not-loaded")
        try:
            chunks = tuple(
                voice.synthesize(
                    request.text,
                    syn_config=synthesis_config,
                    include_alignments=False,
                )
            )
            if not chunks:
                raise PiperEnglishConfigurationError("invalid-output")
            if any(
                chunk.sample_rate != NATIVE_SAMPLE_RATE_HZ
                or chunk.sample_width != 2
                or chunk.sample_channels != 1
                or not isinstance(chunk.audio_float_array.size, int)
                or chunk.audio_float_array.size <= 0
                for chunk in chunks
            ):
                raise PiperEnglishConfigurationError("invalid-output")
            numpy = cast(Any, self._importer("numpy"))
            native = numpy.concatenate(
                tuple(chunk.audio_float_array for chunk in chunks),
            ).astype(numpy.float32, copy=False)
            if native.size <= 0 or not bool(numpy.isfinite(native).all()):
                raise PiperEnglishConfigurationError("invalid-output")
            output_count = max(
                1,
                int(round(int(native.size) * OUTPUT_SAMPLE_RATE_HZ / NATIVE_SAMPLE_RATE_HZ)),
            )
            source_positions = numpy.arange(output_count, dtype=numpy.float64) * (
                NATIVE_SAMPLE_RATE_HZ / OUTPUT_SAMPLE_RATE_HZ
            )
            resampled = numpy.interp(
                source_positions,
                numpy.arange(int(native.size), dtype=numpy.float64),
                native,
            ).astype(numpy.float32, copy=False)
            if resampled.size != output_count or not bool(numpy.isfinite(resampled).all()):
                raise PiperEnglishConfigurationError("invalid-output")
            return resampled
        except PiperEnglishConfigurationError:
            raise
        except Exception:
            raise PiperEnglishConfigurationError("generation-failed") from None

    def synthesize_for_quality(self, request: GenerationRequest) -> tuple[Sized, int]:
        return cast(Sized, self._native_waveform(request)), OUTPUT_SAMPLE_RATE_HZ

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        waveform = cast(_Array, self._native_waveform(request))
        maximum_frames = OUTPUT_SAMPLE_RATE_HZ * MAXIMUM_PUBLISHED_CHUNK_MILLISECONDS // 1_000
        remaining = waveform.size
        sequence = 0
        while remaining > 0:
            sample_count = min(remaining, maximum_frames)
            remaining -= sample_count
            yield AudioChunk(
                request_id=request.request_id,
                sequence=sequence,
                sample_count=sample_count,
                sample_rate_hz=OUTPUT_SAMPLE_RATE_HZ,
                channels=1,
                sample_format="float32",
                end_of_output=remaining == 0,
            )
            sequence += 1

    def cancel(self, request_id: str) -> CancellationResponse:
        del request_id
        return CancellationResponse(acknowledged=False, stop_mode=None)

    def framework_memory_high_water_bytes(self) -> None:
        return None

    def close(self) -> None:
        self._synthesis_config = None
        self._voice = None


@dataclass(frozen=True)
class PiperEnglishAdapterFactory:
    profile: PiperEnglishProfile
    configuration: PiperEnglishConfiguration

    def __call__(self) -> PiperEnglishAdapter:
        return PiperEnglishAdapter(self.profile, self.configuration)
