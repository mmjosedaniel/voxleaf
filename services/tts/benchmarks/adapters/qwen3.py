"""Qwen3-TTS 0.6B CustomVoice CUDA benchmark adapter."""

from __future__ import annotations

import importlib
import os
from collections.abc import Callable, Iterator, Sequence, Sized
from importlib import metadata
from types import ModuleType
from typing import Final, Protocol, cast

from benchmarks.adapters.manifest import (
    QWEN_CANDIDATE_ID,
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


class _CudaRuntime(Protocol):
    def is_available(self) -> bool: ...

    def is_bf16_supported(self) -> bool: ...

    def reset_peak_memory_stats(self) -> None: ...

    def max_memory_reserved(self) -> int: ...

    def empty_cache(self) -> None: ...


class _TorchModule(Protocol):
    cuda: _CudaRuntime
    bfloat16: object


class _QwenModel(Protocol):
    def generate_custom_voice(
        self,
        *,
        text: str,
        language: str,
        speaker: str,
    ) -> tuple[Sequence[Sized], int]: ...


class _QwenModelFactory(Protocol):
    def from_pretrained(self, path: str, **kwargs: object) -> _QwenModel: ...


class _QwenModule(Protocol):
    Qwen3TTSModel: _QwenModelFactory


class Qwen3TtsAdapter:
    """Minimum local-path-only adapter for the frozen Qwen profile."""

    candidate_id: Final = QWEN_CANDIDATE_ID

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
        self._model: _QwenModel | None = None
        self._torch: _TorchModule | None = None
        self._peak_framework_vram_bytes: int | None = None

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            candidate_id=self.candidate_id,
            streaming_granularity="complete-waveform",
            sample_format="float32",
            generation_cancellation="worker-termination",
        )

    def load(self) -> None:
        if self._model is not None:
            raise AdapterConfigurationError("already-loaded")
        root = validate_configuration(self._profile, self._configuration)
        if (
            self._profile.candidate_id != self.candidate_id
            or self._profile.distribution != "qwen-tts"
            or os.environ.get("HF_HUB_OFFLINE") != "1"
            or os.environ.get("TRANSFORMERS_OFFLINE") != "1"
        ):
            raise AdapterConfigurationError("offline-or-profile")
        verify_artifacts(root, self._profile.artifacts)
        try:
            if self._version_reader("qwen-tts") != self._profile.engine_version:
                raise AdapterConfigurationError("engine-version")
            if self._version_reader("torch") != "2.9.1+cu128":
                raise AdapterConfigurationError("runtime-version")
            torch = cast(_TorchModule, self._importer("torch"))
            qwen_tts = cast(_QwenModule, self._importer("qwen_tts"))
            cuda = torch.cuda
            if not bool(cuda.is_available()) or not bool(cuda.is_bf16_supported()):
                raise AdapterConfigurationError("provider-unavailable")
            cuda.reset_peak_memory_stats()
            model_class = qwen_tts.Qwen3TTSModel
            model = model_class.from_pretrained(
                str(root),
                device_map="cuda:0",
                dtype=torch.bfloat16,
                attn_implementation="sdpa",
                local_files_only=True,
            )
        except AdapterConfigurationError:
            raise
        except Exception:
            raise AdapterConfigurationError("load-failed") from None
        self._torch = torch
        self._model = model

    def warm_up(self, request: GenerationRequest) -> None:
        for _ in self.generate(request):
            pass

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        model = self._model
        if model is None:
            raise AdapterConfigurationError("not-loaded")
        try:
            waveforms, sample_rate = model.generate_custom_voice(
                text=request.text,
                language="Spanish",
                speaker=self._profile.voice_id,
            )
            if (
                not isinstance(sample_rate, int)
                or not isinstance(waveforms, (list, tuple))
                or len(waveforms) != 1
            ):
                raise AdapterConfigurationError("invalid-output")
            sample_count = len(waveforms[0])
            if sample_count <= 0:
                raise AdapterConfigurationError("invalid-output")
        except AdapterConfigurationError:
            raise
        except Exception:
            raise AdapterConfigurationError("generation-failed") from None
        del waveforms
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

    def framework_memory_high_water_bytes(self) -> int | None:
        torch = self._torch
        if torch is None:
            return self._peak_framework_vram_bytes
        value = torch.cuda.max_memory_reserved()
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            raise RuntimeError("tts-benchmark-adapter:measurement-unavailable")
        self._peak_framework_vram_bytes = max(
            self._peak_framework_vram_bytes or 0,
            value,
        )
        return self._peak_framework_vram_bytes

    def close(self) -> None:
        self.framework_memory_high_water_bytes()
        self._model = None
        torch = self._torch
        self._torch = None
        if torch is None:
            return
        try:
            torch.cuda.empty_cache()
        except Exception:
            raise AdapterConfigurationError("cleanup-failed") from None
