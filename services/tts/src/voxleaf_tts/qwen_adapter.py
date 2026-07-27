"""Exact offline Qwen3-TTS CustomVoice/Serena development adapter."""

from __future__ import annotations

import gc
import hashlib
import importlib
import importlib.metadata
import io
import json
import math
import os
import sys
from collections.abc import Callable, Mapping, Sequence
from contextlib import contextmanager, redirect_stdout, suppress
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from types import ModuleType
from typing import Any, Final, cast

from .engine import (
    EngineCapabilities,
    EngineFailure,
    EngineFailureCode,
    EngineResult,
    WorkIdentity,
)
from .protocol import (
    CHANNEL_COUNT,
    MAX_AUDIO_PAYLOAD_BYTES,
    MAX_AUDIO_SAMPLE_COUNT,
    SAMPLE_RATE_HZ,
)

CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cuda-bf16-v1"
MODEL_REPOSITORY: Final = "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"
MODEL_REVISION: Final = "0c0e3051f131929182e2c023b9537f8b1c68adfe"
SPEAKER: Final = "Serena"
LANGUAGE: Final = "Spanish"
INSTRUCTION: Final = (
    "Lee con un tono neutro, claro, natural y sereno, apropiado para narrar "
    "un audiolibro; mantén un ritmo moderado y una expresividad contenida."
)
ENGINE_VERSION: Final = "0.1.1"
TORCH_VERSION: Final = "2.9.1+cu128"
TORCHAUDIO_VERSION: Final = "2.9.1+cu128"
WARM_TEXT: Final = "Esta es una prueba breve de narración local."
HASH_READ_BYTES: Final = 8 * 1024 * 1024


@dataclass(frozen=True, slots=True)
class ArtifactIdentity:
    """One allowlisted exact model artifact."""

    relative_path: str
    sha256: str
    size_bytes: int


MAJOR_ARTIFACTS: Final = (
    ArtifactIdentity(
        relative_path="model.safetensors",
        sha256="38b1d5971bdbd982b561cccec982669a53b0537c3cf5e9bd4778ed07bb2f5137",
        size_bytes=3_833_402_552,
    ),
    ArtifactIdentity(
        relative_path="speech_tokenizer/model.safetensors",
        sha256="836b7b357f5ea43e889936a3709af68dfe3751881acefe4ecf0dbd30ba571258",
        size_bytes=682_293_092,
    ),
)

GENERATION_SETTINGS: Final = {
    "do_sample": True,
    "repetition_penalty": 1.05,
    "temperature": 0.9,
    "top_p": 1.0,
    "top_k": 50,
    "subtalker_dosample": True,
    "subtalker_temperature": 0.9,
    "subtalker_top_p": 1.0,
    "subtalker_top_k": 50,
    "max_new_tokens": 2048,
}


@dataclass(frozen=True, slots=True)
class _ActiveOperation:
    identity: WorkIdentity
    text: str


class _NullTextWriter(io.TextIOBase):
    def write(self, value: str) -> int:
        return len(value)


@contextmanager
def _discard_process_stdout() -> Any:
    """Discard Python and native-library stdout while preserving protocol stdout."""

    try:
        descriptor = sys.stdout.fileno()
    except (AttributeError, io.UnsupportedOperation):
        with redirect_stdout(_NullTextWriter()):
            yield
        return

    saved = os.dup(descriptor)
    try:
        sys.stdout.flush()
        with open(os.devnull, "wb", buffering=0) as sink:
            os.dup2(sink.fileno(), descriptor)
            yield
    finally:
        with suppress(OSError):
            sys.stdout.flush()
        os.dup2(saved, descriptor)
        os.close(saved)


def _default_distribution_root(name: str) -> Path:
    try:
        location = importlib.metadata.distribution(name).locate_file("")
        return Path(str(location)).resolve(strict=True)
    except (importlib.metadata.PackageNotFoundError, OSError):
        raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None


def _default_version_reader(name: str) -> str:
    try:
        return importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError:
        raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None


def _is_within(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
    except ValueError:
        return False
    return True


def _resolve_artifact(root: Path, relative_path: str) -> Path:
    relative = PurePosixPath(relative_path)
    if relative.is_absolute() or ".." in relative.parts:
        raise EngineFailure(EngineFailureCode.UNAVAILABLE)
    try:
        target = root.joinpath(*relative.parts).resolve(strict=True)
    except OSError:
        raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None
    if not _is_within(target, root) or not target.is_file():
        raise EngineFailure(EngineFailureCode.UNAVAILABLE)
    return target


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    try:
        with path.open("rb") as source:
            while chunk := source.read(HASH_READ_BYTES):
                digest.update(chunk)
    except OSError:
        raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None
    return digest.hexdigest()


def _verify_revision_metadata(root: Path, artifact: ArtifactIdentity) -> None:
    metadata_path = _resolve_artifact(
        root,
        f".cache/huggingface/download/{artifact.relative_path}.metadata",
    )
    try:
        lines = metadata_path.read_text(encoding="utf-8").splitlines()
    except (OSError, UnicodeError):
        raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None
    if len(lines) < 2 or lines[0] != MODEL_REVISION or lines[1] != artifact.sha256:
        raise EngineFailure(EngineFailureCode.UNAVAILABLE)


def _verify_model_config(root: Path) -> None:
    path = _resolve_artifact(root, "config.json")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError):
        raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None
    if not isinstance(value, dict) or (
        value.get("model_type"),
        value.get("tts_model_size"),
        value.get("tts_model_type"),
    ) != ("qwen3_tts", "1b7", "custom_voice"):
        raise EngineFailure(EngineFailureCode.UNAVAILABLE)


class QwenSerenaTtsEngine:
    """One resident exact Qwen/Serena model with one active complete-waveform call."""

    def __init__(
        self,
        artifact_root: Path,
        *,
        artifacts: tuple[ArtifactIdentity, ...] = MAJOR_ARTIFACTS,
        importer: Callable[[str], ModuleType] = importlib.import_module,
        version_reader: Callable[[str], str] = _default_version_reader,
        distribution_root_reader: Callable[[str], Path] = _default_distribution_root,
        runtime_root: Path | None = None,
        runtime_executable: Path | None = None,
        python_version: tuple[int, int] | None = None,
    ) -> None:
        try:
            self._artifact_root = artifact_root.resolve(strict=True)
        except OSError:
            raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None
        if not self._artifact_root.is_dir():
            raise EngineFailure(EngineFailureCode.UNAVAILABLE)
        self._artifacts = artifacts
        self._importer = importer
        self._version_reader = version_reader
        self._distribution_root_reader = distribution_root_reader
        self._runtime_root = (runtime_root or Path(sys.prefix)).resolve()
        self._runtime_executable = (runtime_executable or Path(sys.executable)).resolve()
        self._python_version = python_version or sys.version_info[:2]
        self._model: Any | None = None
        self._torch: Any | None = None
        self._numpy: Any | None = None
        self._active: _ActiveOperation | None = None
        self._retained_result: EngineResult | None = None
        self._warmed = False

    @property
    def has_active_operation(self) -> bool:
        return self._active is not None

    @property
    def can_settle(self) -> bool:
        return self._active is not None

    def capabilities(self) -> EngineCapabilities:
        ready = self._model is not None and self._warmed
        return EngineCapabilities(
            local_speech_generation="supported" if ready else "unknown",
            hardware_acceleration="supported" if ready else "unknown",
        )

    def _verify_runtime(self) -> None:
        if (
            self._python_version != (3, 12)
            or not _is_within(self._runtime_executable, self._runtime_root)
            or os.environ.get("HF_HUB_OFFLINE") != "1"
            or os.environ.get("TRANSFORMERS_OFFLINE") != "1"
        ):
            raise EngineFailure(EngineFailureCode.UNAVAILABLE)
        expected_versions = {
            "qwen-tts": ENGINE_VERSION,
            "torch": TORCH_VERSION,
            "torchaudio": TORCHAUDIO_VERSION,
        }
        for distribution, version in expected_versions.items():
            if self._version_reader(distribution) != version:
                raise EngineFailure(EngineFailureCode.UNAVAILABLE)
            try:
                distribution_root = self._distribution_root_reader(distribution).resolve(
                    strict=True
                )
            except OSError:
                raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None
            if not _is_within(distribution_root, self._runtime_root):
                raise EngineFailure(EngineFailureCode.UNAVAILABLE)

    def _verify_artifacts(self) -> None:
        for artifact in self._artifacts:
            target = _resolve_artifact(self._artifact_root, artifact.relative_path)
            try:
                size = target.stat().st_size
            except OSError:
                raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None
            if size != artifact.size_bytes or _sha256(target) != artifact.sha256:
                raise EngineFailure(EngineFailureCode.UNAVAILABLE)
            _verify_revision_metadata(self._artifact_root, artifact)
        _verify_model_config(self._artifact_root)

    def load(self) -> None:
        if self._model is not None or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        try:
            self._verify_runtime()
            self._verify_artifacts()
            with _discard_process_stdout():
                torch = cast(Any, self._importer("torch"))
                qwen_tts = cast(Any, self._importer("qwen_tts"))
                if (
                    str(torch.__version__) != TORCH_VERSION
                    or not bool(torch.cuda.is_available())
                    or not bool(torch.cuda.is_bf16_supported())
                ):
                    raise EngineFailure(EngineFailureCode.UNAVAILABLE)
                torch.cuda.reset_peak_memory_stats()
                model = qwen_tts.Qwen3TTSModel.from_pretrained(
                    str(self._artifact_root),
                    device_map="cuda:0",
                    dtype=torch.bfloat16,
                    attn_implementation="sdpa",
                    local_files_only=True,
                )
                speakers = tuple(cast(Sequence[str], model.get_supported_speakers()))
                if SPEAKER.casefold() not in {speaker.casefold() for speaker in speakers}:
                    raise EngineFailure(EngineFailureCode.UNAVAILABLE)
        except EngineFailure:
            self.cleanup()
            raise
        except Exception:
            self.cleanup()
            raise EngineFailure(EngineFailureCode.FAILURE) from None
        self._torch = torch
        self._model = model

    def _numpy_module(self) -> Any:
        if self._numpy is None:
            try:
                root = self._distribution_root_reader("numpy").resolve(strict=True)
            except OSError:
                raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None
            if not _is_within(root, self._runtime_root):
                raise EngineFailure(EngineFailureCode.UNAVAILABLE)
            self._numpy = cast(Any, self._importer("numpy"))
        return self._numpy

    def _generate(self, text: str) -> EngineResult:
        model = self._model
        if model is None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        try:
            with _discard_process_stdout():
                waveforms, sample_rate = model.generate_custom_voice(
                    text=text,
                    language=LANGUAGE,
                    speaker=SPEAKER,
                    instruct=INSTRUCTION,
                    **GENERATION_SETTINGS,
                )
            if (
                type(sample_rate) is not int
                or sample_rate != SAMPLE_RATE_HZ
                or not isinstance(waveforms, (list, tuple))
                or len(waveforms) != 1
            ):
                raise EngineFailure(EngineFailureCode.FAILURE)
            waveform = waveforms[0]
            shape = getattr(waveform, "shape", None)
            if (
                not isinstance(shape, tuple)
                or len(shape) != 1
                or type(shape[0]) is not int
                or shape[0] <= 0
                or shape[0] > MAX_AUDIO_SAMPLE_COUNT
                or len(waveform) != shape[0]
            ):
                raise EngineFailure(EngineFailureCode.FAILURE)
            numpy = self._numpy_module()
            samples = numpy.asarray(waveform, dtype="<f4", order="C")
            if (
                samples.ndim != 1
                or int(samples.size) != shape[0]
                or not bool(numpy.isfinite(samples).all())
            ):
                raise EngineFailure(EngineFailureCode.FAILURE)
            payload = cast(bytes, samples.tobytes(order="C"))
            if (
                len(payload) != shape[0] * 4
                or len(payload) > MAX_AUDIO_PAYLOAD_BYTES
                or not all(math.isfinite(value) for value in samples)
            ):
                raise EngineFailure(EngineFailureCode.FAILURE)
            return EngineResult(
                sample_rate_hz=SAMPLE_RATE_HZ,
                channel_count=CHANNEL_COUNT,
                payload=payload,
            )
        except EngineFailure:
            raise
        except Exception:
            raise EngineFailure(EngineFailureCode.FAILURE) from None

    def warm(self) -> None:
        if self._model is None or self._warmed or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        result = self._generate(WARM_TEXT)
        del result
        self._warmed = True

    def begin(self, request_id: str, segment: Mapping[str, object]) -> WorkIdentity:
        if not self._warmed or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        text = segment.get("text")
        session_id = segment.get("sessionId")
        generation_id = segment.get("generationId")
        segment_id = segment.get("segmentId")
        if (
            not isinstance(text, str)
            or not text
            or not isinstance(session_id, str)
            or not isinstance(generation_id, str)
            or not isinstance(segment_id, str)
        ):
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        identity = WorkIdentity(request_id, session_id, generation_id, segment_id)
        self._active = _ActiveOperation(identity=identity, text=text)
        return identity

    def settle(self) -> tuple[WorkIdentity, EngineResult]:
        operation = self._active
        if operation is None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        self._active = None
        result = self._generate(operation.text)
        self._retained_result = result
        return (operation.identity, result)

    def cancel(self, identity: WorkIdentity) -> None:
        if self._active is None or self._active.identity != identity:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        self._active = None
        self.cleanup()

    def release_result(self) -> None:
        self._retained_result = None

    def cleanup(self) -> None:
        self._active = None
        self._retained_result = None
        self._model = None
        self._numpy = None
        self._warmed = False
        torch = self._torch
        self._torch = None
        gc.collect()
        if torch is not None:
            with suppress(Exception), _discard_process_stdout():
                torch.cuda.empty_cache()
