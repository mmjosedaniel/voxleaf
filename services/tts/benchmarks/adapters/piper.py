"""Piper 1.4.2 ONNX CPU benchmark adapter."""

from __future__ import annotations

import importlib
import os
from collections.abc import Callable, Iterable, Iterator, Sized
from importlib import metadata
from pathlib import Path
from types import ModuleType
from typing import Any, Final, Protocol, cast

from benchmarks.adapters.manifest import (
    PIPER_CPU_CANDIDATE_ID,
    AdapterConfigurationError,
    CandidateConfiguration,
    CandidateProfile,
    v6_profile_identity_matches,
    validate_configuration,
    verify_artifacts,
)
from benchmarks.contracts import (
    AdapterCapabilities,
    AudioChunk,
    CancellationResponse,
    GenerationRequest,
)

type ModuleImporter = Callable[[str], ModuleType]
type VersionReader = Callable[[str], str]

MAXIMUM_PUBLISHED_CHUNK_MILLISECONDS: Final = 250


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


class PiperCpuAdapter:
    """Exact local-path-only adapter for the frozen Piper CPU profile."""

    candidate_id: Final = PIPER_CPU_CANDIDATE_ID

    def __init__(
        self,
        profile: CandidateProfile,
        configuration: CandidateConfiguration,
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
            raise AdapterConfigurationError("already-loaded")
        root = validate_configuration(self._profile, self._configuration)
        if (
            not v6_profile_identity_matches(self._profile)
            or os.environ.get("HF_HUB_OFFLINE") != "1"
        ):
            raise AdapterConfigurationError("offline-or-profile")
        verify_artifacts(root, self._profile.artifacts)
        settings = self._profile.piper_generation_settings
        if settings is None:
            raise AdapterConfigurationError("profile-mismatch")
        try:
            if self._version_reader("piper-tts") != self._profile.engine_version:
                raise AdapterConfigurationError("engine-version")
            if self._version_reader("onnxruntime") != "1.27.0":
                raise AdapterConfigurationError("runtime-version")
            onnxruntime = cast(_OnnxRuntimeModule, self._importer("onnxruntime"))
            if (
                onnxruntime.get_device() != "CPU"
                or "CPUExecutionProvider" not in onnxruntime.get_available_providers()
            ):
                raise AdapterConfigurationError("provider-unavailable")
            voice_module = cast(_PiperVoiceModule, self._importer("piper.voice"))
            config_module = cast(_PiperConfigModule, self._importer("piper.config"))
            voice = voice_module.PiperVoice.load(
                root / "es_ES-davefx-medium.onnx",
                config_path=root / "es_ES-davefx-medium.onnx.json",
                use_cuda=False,
                download_dir=root,
            )
            if (
                voice.session.get_providers() != ["CPUExecutionProvider"]
                or voice.config.sample_rate != self._profile.output_sample_rate_hz
                or voice.config.num_speakers != 1
                or voice.config.espeak_voice != "es"
            ):
                raise AdapterConfigurationError("provider-selected")
            synthesis_config = config_module.SynthesisConfig(
                speaker_id=None,
                noise_scale=settings.noise_scale,
                length_scale=settings.length_scale,
                noise_w_scale=settings.noise_w,
                normalize_audio=settings.normalize_audio,
                volume=settings.volume,
            )
        except AdapterConfigurationError:
            raise
        except Exception:
            raise AdapterConfigurationError("load-failed") from None
        self._voice = voice
        self._synthesis_config = synthesis_config

    def warm_up(self, request: GenerationRequest) -> None:
        for _ in self.generate(request):
            pass

    def _native_chunks(self, request: GenerationRequest) -> tuple[_PiperAudioChunk, ...]:
        voice = self._voice
        synthesis_config = self._synthesis_config
        if voice is None or synthesis_config is None:
            raise AdapterConfigurationError("not-loaded")
        try:
            chunks = tuple(
                voice.synthesize(
                    request.text,
                    syn_config=synthesis_config,
                    include_alignments=False,
                )
            )
            if not chunks:
                raise AdapterConfigurationError("invalid-output")
            for chunk in chunks:
                if (
                    chunk.sample_rate != self._profile.output_sample_rate_hz
                    or chunk.sample_width != 2
                    or chunk.sample_channels != 1
                    or not isinstance(chunk.audio_float_array.size, int)
                    or chunk.audio_float_array.size <= 0
                ):
                    raise AdapterConfigurationError("invalid-output")
        except AdapterConfigurationError:
            raise
        except Exception:
            raise AdapterConfigurationError("generation-failed") from None
        return chunks

    def synthesize_for_quality(self, request: GenerationRequest) -> tuple[Sized, int]:
        """Return one disposable waveform for the explicit quality workflow."""

        chunks = self._native_chunks(request)
        try:
            numpy = cast(Any, self._importer("numpy"))
            waveform = numpy.concatenate(
                tuple(chunk.audio_float_array for chunk in chunks),
            ).astype(numpy.float32, copy=False)
        except Exception:
            raise AdapterConfigurationError("invalid-output") from None
        return cast(Sized, waveform), chunks[0].sample_rate

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        chunks = self._native_chunks(request)
        sample_rate = chunks[0].sample_rate
        maximum_frames = sample_rate * MAXIMUM_PUBLISHED_CHUNK_MILLISECONDS // 1_000
        sequence = 0
        for native_index, chunk in enumerate(chunks):
            remaining = chunk.audio_float_array.size
            while remaining > 0:
                sample_count = min(remaining, maximum_frames)
                remaining -= sample_count
                yield AudioChunk(
                    request_id=request.request_id,
                    sequence=sequence,
                    sample_count=sample_count,
                    sample_rate_hz=sample_rate,
                    channels=1,
                    sample_format="float32",
                    end_of_output=native_index == len(chunks) - 1 and remaining == 0,
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
