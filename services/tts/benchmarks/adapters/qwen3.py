"""Qwen3-TTS CustomVoice CUDA benchmark adapters."""

from __future__ import annotations

import importlib
import os
from collections.abc import Callable, Iterator, Mapping, Sequence, Sized
from importlib import metadata
from types import ModuleType
from typing import Final, Literal, Protocol, cast

from benchmarks.adapters.manifest import (
    QWEN_CANDIDATE_ID,
    QWEN_V3_CANDIDATE_ID,
    AdapterConfigurationError,
    CandidateConfiguration,
    CandidateProfile,
    v3_profile_identity_matches,
    validate_configuration,
    verify_artifacts,
)
from benchmarks.batch_contracts import (
    BatchAudioUnit,
    BatchBenchmarkError,
    BatchGenerationRequest,
)
from benchmarks.contracts import (
    AdapterCapabilities,
    AdapterPlacementEvidence,
    AudioChunk,
    CancellationResponse,
    GenerationRequest,
    PlacementProfileId,
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
    device: Callable[[str], object]


class _DeviceTensor(Protocol):
    device: object


class _TorchModel(Protocol):
    def to(self, device: str) -> object: ...

    def parameters(self) -> Iterator[_DeviceTensor]: ...

    def buffers(self) -> Iterator[_DeviceTensor]: ...


class _SpeechTokenizer(Protocol):
    model: _TorchModel
    device: object


class _QwenInnerModel(_TorchModel, Protocol):
    speech_tokenizer: _SpeechTokenizer
    hf_device_map: Mapping[str, object]


class _QwenModel(Protocol):
    model: _QwenInnerModel

    def generate_custom_voice(
        self,
        *,
        text: str | list[str],
        language: str | list[str],
        speaker: str | list[str],
        **kwargs: object,
    ) -> tuple[Sequence[Sized], int]: ...


class _QwenModelFactory(Protocol):
    def from_pretrained(self, path: str, **kwargs: object) -> _QwenModel: ...


class _QwenModule(Protocol):
    Qwen3TTSModel: _QwenModelFactory


class Qwen3TtsAdapter:
    """Local-path-only adapter for one fully frozen Qwen profile."""

    def __init__(
        self,
        profile: CandidateProfile,
        configuration: CandidateConfiguration,
        *,
        placement_profile_id: PlacementProfileId | None = None,
        importer: ModuleImporter = importlib.import_module,
        version_reader: VersionReader = metadata.version,
    ) -> None:
        if profile.candidate_id not in (QWEN_CANDIDATE_ID, QWEN_V3_CANDIDATE_ID):
            raise AdapterConfigurationError("candidate")
        self.candidate_id: Final = profile.candidate_id
        self._profile = profile
        self._configuration = configuration
        self._importer = importer
        self._version_reader = version_reader
        self._placement_profile_id = placement_profile_id
        self._placement_evidence: AdapterPlacementEvidence | None = None
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
            or (
                self._profile.candidate_id == QWEN_V3_CANDIDATE_ID
                and not v3_profile_identity_matches(self._profile)
            )
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
            if (
                self._profile.candidate_id == QWEN_V3_CANDIDATE_ID
                and self._version_reader("torchaudio") != "2.9.1+cu128"
            ):
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
            if self._placement_profile_id is not None:
                if self._profile.candidate_id != QWEN_V3_CANDIDATE_ID:
                    raise AdapterConfigurationError("placement")
                if self._placement_profile_id == "qwen3-serena-v4-speech-tokenizer-cpu":
                    model.model.speech_tokenizer.model.to("cpu")
                    model.model.speech_tokenizer.device = torch.device("cpu")
                    cuda.empty_cache()
                self._placement_evidence = _verify_placement(
                    model,
                    self._placement_profile_id,
                )
        except AdapterConfigurationError:
            raise
        except Exception:
            raise AdapterConfigurationError("load-failed") from None
        self._torch = torch
        self._model = model

    def placement_evidence(self) -> AdapterPlacementEvidence | None:
        """Return the verified content-free v4 placement after load."""

        return self._placement_evidence

    def warm_up(self, request: GenerationRequest) -> None:
        for _ in self.generate(request):
            pass

    def synthesize_for_quality(self, request: GenerationRequest) -> tuple[Sized, int]:
        """Return one waveform only for the explicit disposable listening workflow."""

        model = self._model
        if model is None:
            raise AdapterConfigurationError("not-loaded")
        generation = self._profile.generation_settings
        instruction = self._profile.instruction
        extra: dict[str, object] = {}
        if self._profile.candidate_id == QWEN_V3_CANDIDATE_ID:
            if generation is None or instruction is None or self._profile.authority is None:
                raise AdapterConfigurationError("profile-mismatch")
            extra = {
                "instruct": instruction,
                **generation.as_qwen_kwargs(),
            }
        try:
            waveforms, sample_rate = model.generate_custom_voice(
                text=request.text,
                language=self._profile.language,
                speaker=self._profile.voice_id,
                **extra,
            )
            if (
                not isinstance(sample_rate, int)
                or not isinstance(waveforms, (list, tuple))
                or len(waveforms) != 1
                or (
                    self._profile.output_sample_rate_hz is not None
                    and sample_rate != self._profile.output_sample_rate_hz
                )
            ):
                raise AdapterConfigurationError("invalid-output")
            waveform = waveforms[0]
            shape = getattr(waveform, "shape", None)
            if shape is not None and (not isinstance(shape, tuple) or len(shape) != 1):
                raise AdapterConfigurationError("invalid-output")
            sample_count = len(waveform)
            if sample_count <= 0:
                raise AdapterConfigurationError("invalid-output")
        except AdapterConfigurationError:
            raise
        except Exception:
            raise AdapterConfigurationError("generation-failed") from None
        return waveform, sample_rate

    def generate_batch(
        self,
        request: BatchGenerationRequest,
    ) -> tuple[BatchAudioUnit, ...]:
        """Run exactly one v4 batch while returning payload-free unit metadata."""

        model = self._model
        generation = self._profile.generation_settings
        instruction = self._profile.instruction
        if (
            model is None
            or self._profile.candidate_id != QWEN_V3_CANDIDATE_ID
            or generation is None
            or instruction is None
            or len(request.units) not in (1, 2)
        ):
            raise BatchBenchmarkError("generation-failed")
        try:
            waveforms, sample_rate = model.generate_custom_voice(
                text=[unit.text for unit in request.units],
                language=[unit.language for unit in request.units],
                speaker=[self._profile.voice_id for _unit in request.units],
                instruct=[instruction for _unit in request.units],
                **generation.as_qwen_kwargs(),
            )
            if (
                not isinstance(sample_rate, int)
                or sample_rate != 24_000
                or not isinstance(waveforms, (list, tuple))
                or len(waveforms) != len(request.units)
            ):
                raise BatchBenchmarkError("invalid-output")
            outputs: list[BatchAudioUnit] = []
            for position, (unit, waveform) in enumerate(zip(request.units, waveforms, strict=True)):
                shape = getattr(waveform, "shape", None)
                if shape is not None and (not isinstance(shape, tuple) or len(shape) != 1):
                    raise BatchBenchmarkError("invalid-output")
                sample_count = len(waveform)
                if sample_count <= 0:
                    raise BatchBenchmarkError("invalid-output")
                outputs.append(
                    BatchAudioUnit(
                        identity=request.identity,
                        call_index=request.call_index,
                        unit_id=unit.unit_id,
                        source_sequence=unit.source_sequence,
                        batch_position=position,
                        sample_count=sample_count,
                        sample_rate_hz=sample_rate,
                        channels=1,
                        sample_format="float32",
                    )
                )
        except BatchBenchmarkError:
            raise
        except Exception:
            raise BatchBenchmarkError("generation-failed") from None
        return tuple(outputs)

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        waveform, sample_rate = self.synthesize_for_quality(request)
        sample_count = len(waveform)
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
        self._placement_evidence = None
        torch = self._torch
        self._torch = None
        if torch is None:
            return
        try:
            torch.cuda.empty_cache()
        except Exception:
            raise AdapterConfigurationError("cleanup-failed") from None


def _device_label(value: object) -> str:
    device_type = getattr(value, "type", None)
    index = getattr(value, "index", None)
    if device_type == "cpu":
        return "cpu"
    if device_type == "cuda" and index == 0:
        return "cuda:0"
    raise AdapterConfigurationError("placement")


def _module_tensors(module: _TorchModel) -> tuple[_DeviceTensor, ...]:
    return (*tuple(module.parameters()), *tuple(module.buffers()))


def _device_map_is_exact_cuda(value: object) -> bool:
    return value in (0, "cuda", "cuda:0")


def _verify_placement(
    model: _QwenModel,
    profile_id: PlacementProfileId,
) -> AdapterPlacementEvidence:
    inner = model.model
    tokenizer = inner.speech_tokenizer
    tokenizer_parameters = tuple(tokenizer.model.parameters())
    tokenizer_tensors = _module_tensors(tokenizer.model)
    tokenizer_parameter_ids = {id(parameter) for parameter in tokenizer_parameters}
    other_parameters = tuple(
        parameter
        for parameter in inner.parameters()
        if id(parameter) not in tokenizer_parameter_ids
    )
    other_tensors = tuple(
        tensor
        for tensor in _module_tensors(inner)
        if id(tensor) not in {id(item) for item in tokenizer_tensors}
    )
    expected_tokenizer_device: Literal["cuda:0", "cpu"] = (
        "cpu" if profile_id == "qwen3-serena-v4-speech-tokenizer-cpu" else "cuda:0"
    )
    device_map = getattr(inner, "hf_device_map", None)
    if (
        not tokenizer_parameters
        or not other_parameters
        or not tokenizer_tensors
        or not other_tensors
        or not isinstance(device_map, Mapping)
        or not device_map
        or any(not _device_map_is_exact_cuda(value) for value in device_map.values())
        or any(
            _device_label(tensor.device) != expected_tokenizer_device
            for tensor in tokenizer_tensors
        )
        or any(_device_label(tensor.device) != "cuda:0" for tensor in other_tensors)
        or _device_label(tokenizer.device) != expected_tokenizer_device
    ):
        raise AdapterConfigurationError("placement")
    return AdapterPlacementEvidence(
        profile_id=profile_id,
        autoregressive_model_device="cuda:0",
        speech_tokenizer_model_device=expected_tokenizer_device,
        speech_tokenizer_wrapper_device=expected_tokenizer_device,
        disk_or_meta_parameters=0,
        implicit_fallback=False,
        offload_directory_created=False,
    )
