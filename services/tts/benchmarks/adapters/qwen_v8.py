"""Exact local Qwen CustomVoice adapters for the frozen bilingual v8 controls."""

from __future__ import annotations

import hashlib
import importlib
import json
import os
from collections.abc import Iterator, Mapping, Sequence, Sized
from dataclasses import dataclass
from importlib import metadata
from pathlib import Path
from typing import Any, Final, cast

from benchmarks.contracts import (
    AdapterCapabilities,
    AudioChunk,
    CancellationResponse,
    GenerationRequest,
)
from benchmarks.v8_authority import (
    QWEN_AIDEN_CANDIDATE_ID,
    QWEN_SERENA_CANDIDATE_ID,
)

QWEN_V8_CANDIDATE_IDS: Final = (
    QWEN_SERENA_CANDIDATE_ID,
    QWEN_AIDEN_CANDIDATE_ID,
)


class QwenV8ConfigurationError(RuntimeError):
    """Fixed content-free adapter failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-qwen-v8:{code}")
        self.code = code


@dataclass(frozen=True)
class QwenV8Artifact:
    relative_path: str
    size_bytes: int
    sha256: str


@dataclass(frozen=True)
class QwenV8Profile:
    candidate_id: str
    speaker: str
    language: str
    language_argument: str
    instruction: str
    model_revision: str
    artifacts: tuple[QwenV8Artifact, ...]
    generation: Mapping[str, object]


@dataclass(frozen=True)
class QwenV8Configuration:
    artifact_root: Path


def _mapping(value: object) -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise QwenV8ConfigurationError("manifest")
    return cast(Mapping[str, object], value)


def load_qwen_v8_profile(repository_root: Path, candidate_id: str) -> QwenV8Profile:
    """Load one exact Qwen identity from the byte-frozen v8 manifest."""

    if candidate_id not in QWEN_V8_CANDIDATE_IDS:
        raise QwenV8ConfigurationError("candidate")
    try:
        manifest = cast(
            object,
            json.loads(
                (repository_root / "benchmarks/tts/candidates-v8.json").read_text(encoding="utf-8")
            ),
        )
    except (OSError, UnicodeError, json.JSONDecodeError):
        raise QwenV8ConfigurationError("manifest") from None
    root = _mapping(manifest)
    candidates = root.get("addedCandidates")
    if not isinstance(candidates, list):
        raise QwenV8ConfigurationError("manifest")
    selected = tuple(
        _mapping(value)
        for value in candidates
        if isinstance(value, dict) and value.get("candidateId") == candidate_id
    )
    if len(selected) != 1:
        raise QwenV8ConfigurationError("manifest")
    candidate = selected[0]
    engine = _mapping(candidate.get("engine"))
    model = _mapping(candidate.get("model"))
    voice = _mapping(candidate.get("voice"))
    generation = _mapping(candidate.get("generation"))
    artifacts_value = model.get("artifacts")
    if (
        engine.get("name") != "qwen-tts"
        or engine.get("version") != "0.1.1"
        or engine.get("provider") != "pytorch-cuda"
        or engine.get("precision") != "bfloat16"
        or model.get("revision") != "0c0e3051f131929182e2c023b9537f8b1c68adfe"
        or not isinstance(artifacts_value, list)
        or voice.get("personalReferenceAudioRequired") is not False
    ):
        raise QwenV8ConfigurationError("manifest")
    language = voice.get("evaluationLanguage")
    speaker = voice.get("speaker")
    language_argument = voice.get("languageArgument")
    instruction = voice.get("instruction")
    if not all(
        isinstance(value, str) for value in (language, speaker, language_argument, instruction)
    ):
        raise QwenV8ConfigurationError("manifest")
    artifacts: list[QwenV8Artifact] = []
    for value in artifacts_value:
        artifact = _mapping(value)
        relative_path = artifact.get("path")
        size_bytes = artifact.get("sizeBytes")
        sha256 = artifact.get("sha256")
        if (
            not isinstance(relative_path, str)
            or not isinstance(size_bytes, int)
            or isinstance(size_bytes, bool)
            or not isinstance(sha256, str)
        ):
            raise QwenV8ConfigurationError("manifest")
        artifacts.append(QwenV8Artifact(relative_path, size_bytes, sha256))
    return QwenV8Profile(
        candidate_id=candidate_id,
        speaker=cast(str, speaker),
        language=cast(str, language),
        language_argument=cast(str, language_argument),
        instruction=cast(str, instruction),
        model_revision=cast(str, model["revision"]),
        artifacts=tuple(artifacts),
        generation=generation,
    )


def verify_qwen_v8_artifacts(
    profile: QwenV8Profile,
    configuration: QwenV8Configuration,
) -> Path:
    """Verify exact size and digest without accepting extra runtime downloads."""

    try:
        root = configuration.artifact_root.resolve(strict=True)
    except OSError:
        raise QwenV8ConfigurationError("artifact") from None
    if not root.is_dir():
        raise QwenV8ConfigurationError("artifact")
    for artifact in profile.artifacts:
        path = (root / artifact.relative_path).resolve()
        try:
            path.relative_to(root)
            payload_size = path.stat().st_size
            digest = hashlib.sha256(path.read_bytes()).hexdigest()
        except (OSError, ValueError):
            raise QwenV8ConfigurationError("artifact") from None
        if payload_size != artifact.size_bytes or digest != artifact.sha256:
            raise QwenV8ConfigurationError("artifact")
    return root


class QwenV8Adapter:
    """One local-path-only built-in Qwen speaker identity."""

    def __init__(
        self,
        profile: QwenV8Profile,
        configuration: QwenV8Configuration,
    ) -> None:
        self._profile = profile
        self._configuration = configuration
        self._model: Any = None
        self._torch: Any = None
        self._peak_vram_bytes: int | None = None

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            candidate_id=self._profile.candidate_id,
            streaming_granularity="complete-waveform",
            sample_format="float32",
            generation_cancellation="worker-termination",
        )

    def load(self) -> None:
        if self._model is not None:
            raise QwenV8ConfigurationError("already-loaded")
        root = verify_qwen_v8_artifacts(self._profile, self._configuration)
        if (
            metadata.version("qwen-tts") != "0.1.1"
            or metadata.version("torch") != "2.9.1+cu128"
            or metadata.version("torchaudio") != "2.9.1+cu128"
            or os.environ.get("HF_HUB_OFFLINE") != "1"
            or os.environ.get("TRANSFORMERS_OFFLINE") != "1"
        ):
            raise QwenV8ConfigurationError("runtime")
        try:
            torch = importlib.import_module("torch")
            qwen_tts = importlib.import_module("qwen_tts")
            if not torch.cuda.is_available() or not torch.cuda.is_bf16_supported():
                raise QwenV8ConfigurationError("provider")
            torch.cuda.reset_peak_memory_stats()
            model = qwen_tts.Qwen3TTSModel.from_pretrained(
                str(root),
                device_map="cuda:0",
                dtype=torch.bfloat16,
                attn_implementation="sdpa",
                local_files_only=True,
            )
            speakers = {
                str(value).casefold()
                for value in cast(Sequence[object], model.get_supported_speakers())
            }
            if self._profile.speaker.casefold() not in speakers:
                raise QwenV8ConfigurationError("speaker")
        except QwenV8ConfigurationError:
            raise
        except Exception:
            raise QwenV8ConfigurationError("load") from None
        self._torch = torch
        self._model = model

    def _generation_kwargs(self) -> dict[str, object]:
        values = self._profile.generation
        expected = {
            "doSample": "do_sample",
            "repetitionPenalty": "repetition_penalty",
            "temperature": "temperature",
            "topP": "top_p",
            "topK": "top_k",
            "subtalkerDoSample": "subtalker_dosample",
            "subtalkerTemperature": "subtalker_temperature",
            "subtalkerTopP": "subtalker_top_p",
            "subtalkerTopK": "subtalker_top_k",
            "maxNewTokens": "max_new_tokens",
        }
        try:
            return {target: values[source] for source, target in expected.items()}
        except KeyError:
            raise QwenV8ConfigurationError("manifest") from None

    def synthesize_for_quality(self, request: GenerationRequest) -> tuple[Sized, int]:
        model = self._model
        if model is None or request.language != self._profile.language:
            raise QwenV8ConfigurationError("request")
        try:
            waveforms, sample_rate = model.generate_custom_voice(
                text=request.text,
                language=self._profile.language_argument,
                speaker=self._profile.speaker,
                instruct=self._profile.instruction,
                **self._generation_kwargs(),
            )
            if (
                sample_rate != 24_000
                or not isinstance(waveforms, (list, tuple))
                or len(waveforms) != 1
                or len(waveforms[0]) <= 0
            ):
                raise QwenV8ConfigurationError("audio")
        except QwenV8ConfigurationError:
            raise
        except Exception:
            raise QwenV8ConfigurationError("generation") from None
        return cast(Sized, waveforms[0]), cast(int, sample_rate)

    def warm_up(self, request: GenerationRequest) -> None:
        self.synthesize_for_quality(request)

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
            return self._peak_vram_bytes
        value = torch.cuda.max_memory_reserved()
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            raise QwenV8ConfigurationError("memory")
        self._peak_vram_bytes = max(self._peak_vram_bytes or 0, value)
        return self._peak_vram_bytes

    def close(self) -> None:
        self.framework_memory_high_water_bytes()
        self._model = None
        torch = self._torch
        self._torch = None
        if torch is not None:
            torch.cuda.empty_cache()


@dataclass(frozen=True)
class QwenV8AdapterFactory:
    profile: QwenV8Profile
    configuration: QwenV8Configuration

    def __call__(self) -> QwenV8Adapter:
        return QwenV8Adapter(self.profile, self.configuration)
