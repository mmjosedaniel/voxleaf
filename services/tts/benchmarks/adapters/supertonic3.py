"""Supertonic 3 ONNX CPU benchmark adapter."""

from __future__ import annotations

import importlib
import os
from collections.abc import Callable, Iterator
from importlib import metadata
from types import ModuleType
from typing import Final, Protocol, cast

from benchmarks.adapters.manifest import (
    SUPERTONIC_CANDIDATE_ID,
    AdapterConfigurationError,
    CandidateConfiguration,
    CandidateProfile,
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


class _OnnxRuntimeModule(Protocol):
    def get_device(self) -> str: ...

    def get_available_providers(self) -> list[str]: ...


class _Waveform(Protocol):
    shape: tuple[int, int]


class _SupertonicEngine(Protocol):
    sample_rate: int

    def get_voice_style(self, voice_id: str) -> object: ...

    def synthesize(
        self,
        text: str,
        **kwargs: object,
    ) -> _Waveform: ...


class _EngineFactory(Protocol):
    def __call__(self, **kwargs: object) -> _SupertonicEngine: ...


class _SupertonicModule(Protocol):
    TTS: _EngineFactory


class Supertonic3Adapter:
    """Minimum no-download adapter for the frozen Supertonic profile."""

    candidate_id: Final = SUPERTONIC_CANDIDATE_ID

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
        self._engine: _SupertonicEngine | None = None
        self._voice_style: object | None = None

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            candidate_id=self.candidate_id,
            streaming_granularity="complete-waveform",
            sample_format="float32",
            generation_cancellation="worker-termination",
        )

    def load(self) -> None:
        if self._engine is not None:
            raise AdapterConfigurationError("already-loaded")
        root = validate_configuration(self._profile, self._configuration)
        if (
            self._profile.candidate_id != self.candidate_id
            or self._profile.distribution != "supertonic"
            or os.environ.get("HF_HUB_OFFLINE") != "1"
        ):
            raise AdapterConfigurationError("offline-or-profile")
        verify_artifacts(root, self._profile.artifacts)
        try:
            if self._version_reader("supertonic") != self._profile.engine_version:
                raise AdapterConfigurationError("engine-version")
            if self._version_reader("onnxruntime") != "1.27.0":
                raise AdapterConfigurationError("runtime-version")
            onnxruntime = cast(_OnnxRuntimeModule, self._importer("onnxruntime"))
            if (
                onnxruntime.get_device() != "CPU"
                or "CPUExecutionProvider" not in onnxruntime.get_available_providers()
            ):
                raise AdapterConfigurationError("provider-unavailable")
            supertonic = cast(_SupertonicModule, self._importer("supertonic"))
            engine_class = supertonic.TTS
            engine = engine_class(
                model="supertonic-3",
                model_dir=str(root),
                auto_download=False,
            )
            if engine.sample_rate != self._profile.output_sample_rate_hz:
                raise AdapterConfigurationError("invalid-output")
            voice_style = engine.get_voice_style(self._profile.voice_id)
        except AdapterConfigurationError:
            raise
        except Exception:
            raise AdapterConfigurationError("load-failed") from None
        self._engine = engine
        self._voice_style = voice_style

    def warm_up(self, request: GenerationRequest) -> None:
        for _ in self.generate(request):
            pass

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        engine = self._engine
        voice_style = self._voice_style
        if engine is None or voice_style is None:
            raise AdapterConfigurationError("not-loaded")
        try:
            waveform = engine.synthesize(
                request.text,
                voice_style=voice_style,
                lang="es",
                total_steps=8,
                speed=1.05,
                max_chunk_length=300,
                silence_duration=0.3,
                verbose=False,
            )
            shape = waveform.shape
            if not isinstance(shape, tuple) or len(shape) != 2 or shape[0] != 1:
                raise AdapterConfigurationError("invalid-output")
            sample_count = shape[1]
            sample_rate = engine.sample_rate
            if not isinstance(sample_count, int) or sample_count <= 0:
                raise AdapterConfigurationError("invalid-output")
            if not isinstance(sample_rate, int):
                raise AdapterConfigurationError("invalid-output")
        except AdapterConfigurationError:
            raise
        except Exception:
            raise AdapterConfigurationError("generation-failed") from None
        del waveform
        yield AudioChunk(
            request_id=request.request_id,
            sequence=0,
            sample_count=sample_count,
            sample_rate_hz=sample_rate,
            channels=1,
            sample_format="float32",
            end_of_output=True,
        )

    def cancel(self, request_id: str) -> CancellationResponse:
        del request_id
        return CancellationResponse(acknowledged=False, stop_mode=None)

    def close(self) -> None:
        self._voice_style = None
        self._engine = None
