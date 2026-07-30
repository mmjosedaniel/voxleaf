"""Exact offline Chatterbox Multilingual V3 bilingual service adapter."""

from __future__ import annotations

import gc
import hashlib
import importlib
import importlib.metadata
import io
import math
import os
import sys
from collections.abc import Callable, Mapping
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

CANDIDATE_ID: Final = "chatterbox-multilingual-v3-cuda-bf16-default-v4"
ENGINE_VERSION: Final = "0.1.7"
TORCH_VERSION: Final = "2.9.1+cu128"
TORCHAUDIO_VERSION: Final = "2.9.1+cu128"
MODEL_REVISION: Final = "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
HASH_READ_BYTES: Final = 8 * 1024 * 1024

GENERATION_SETTINGS: Final = {
    "exaggeration": 0.5,
    "cfg_weight": 0.5,
    "temperature": 0.8,
    "repetition_penalty": 1.2,
    "min_p": 0.05,
    "top_p": 1.0,
}


@dataclass(frozen=True, slots=True)
class ArtifactIdentity:
    """One allowlisted exact Chatterbox model artifact."""

    relative_path: str
    sha256: str
    size_bytes: int


ARTIFACTS: Final = (
    ArtifactIdentity(
        "t3_mtl23ls_v3.safetensors",
        "5abca8321ede76f8e61f1cc0d19aea6c946b28871017ce8726f8a69203f05953",
        2_143_989_928,
    ),
    ArtifactIdentity(
        "s3gen.pt",
        "9b9ff07e60b20c136e2b1b3d7563a24604e8d2c4c267888d1ee929dd0151d2a3",
        1_057_165_844,
    ),
    ArtifactIdentity(
        "ve.pt",
        "4b16d836bc598509860f6fa068165a8bb5e9ac84f05582dfcf278a5a372879f1",
        5_698_626,
    ),
    ArtifactIdentity(
        "conds.pt",
        "6552d70568833628ba019c6b03459e77fe71ca197d5c560cef9411bee9d87f4e",
        107_374,
    ),
    ArtifactIdentity(
        "grapheme_mtl_merged_expanded_v1.json",
        "69632f47220a788a52ce2661d096453c5655e9bf25289d89a8d832c46ee07dbf",
        69_989,
    ),
    ArtifactIdentity(
        "Cangjie5_TC.json",
        "7073fd9de919443ae88e0bd2449917a65fe54898a4413ed1edcc4b67f28bce8c",
        1_920_163,
    ),
)


@dataclass(frozen=True, slots=True)
class _ActiveOperation:
    identity: WorkIdentity
    text: str


class _NullTextWriter(io.TextIOBase):
    def write(self, value: str) -> int:
        return len(value)


@contextmanager
def _discard_process_stdout() -> Any:
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
        return Path(str(importlib.metadata.distribution(name).locate_file(""))).resolve(strict=True)
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


class ChatterboxMultilingualTtsEngine:
    """One resident exact bilingual model with one active complete-waveform call."""

    def __init__(
        self,
        artifact_root: Path,
        language: str,
        *,
        artifacts: tuple[ArtifactIdentity, ...] = ARTIFACTS,
        importer: Callable[[str], ModuleType] = importlib.import_module,
        version_reader: Callable[[str], str] = _default_version_reader,
        distribution_root_reader: Callable[[str], Path] = _default_distribution_root,
        runtime_root: Path | None = None,
        runtime_executable: Path | None = None,
        python_version: tuple[int, int] | None = None,
    ) -> None:
        if language not in {"es", "en"}:
            raise EngineFailure(EngineFailureCode.UNAVAILABLE)
        try:
            self._artifact_root = artifact_root.resolve(strict=True)
        except OSError:
            raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None
        if not self._artifact_root.is_dir():
            raise EngineFailure(EngineFailureCode.UNAVAILABLE)
        self._language = language
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
        for distribution, version in {
            "chatterbox-tts": ENGINE_VERSION,
            "torch": TORCH_VERSION,
            "torchaudio": TORCHAUDIO_VERSION,
        }.items():
            if self._version_reader(distribution) != version:
                raise EngineFailure(EngineFailureCode.UNAVAILABLE)
            try:
                root = self._distribution_root_reader(distribution).resolve(strict=True)
            except OSError:
                raise EngineFailure(EngineFailureCode.UNAVAILABLE) from None
            if not _is_within(root, self._runtime_root):
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

    def load(self) -> None:
        if self._model is not None or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        try:
            self._verify_runtime()
            self._verify_artifacts()
            with _discard_process_stdout():
                torch = cast(Any, self._importer("torch"))
                chatterbox = cast(Any, self._importer("chatterbox.mtl_tts"))
                if (
                    str(torch.__version__) != TORCH_VERSION
                    or not bool(torch.cuda.is_available())
                    or not bool(torch.cuda.is_bf16_supported())
                    or tuple(torch.cuda.get_device_capability()) != (12, 0)
                    or "sm_120" not in tuple(torch.cuda.get_arch_list())
                ):
                    raise EngineFailure(EngineFailureCode.UNAVAILABLE)
                torch.cuda.reset_peak_memory_stats()
                model = chatterbox.ChatterboxMultilingualTTS.from_local(
                    str(self._artifact_root),
                    device=torch.device("cuda"),
                    t3_model="v3",
                )
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
                waveform = model.generate(
                    text,
                    language_id=self._language,
                    audio_prompt_path=None,
                    **GENERATION_SETTINGS,
                )
            numpy = self._numpy_module()
            samples = numpy.asarray(
                waveform.detach().to("cpu").reshape(-1).numpy(),
                dtype="<f4",
                order="C",
            )
            sample_count = int(samples.size)
            if (
                samples.ndim != 1
                or sample_count <= 0
                or sample_count > MAX_AUDIO_SAMPLE_COUNT
                or not bool(numpy.isfinite(samples).all())
                or not all(math.isfinite(value) for value in samples)
            ):
                raise EngineFailure(EngineFailureCode.FAILURE)
            payload = cast(bytes, samples.tobytes(order="C"))
            if len(payload) != sample_count * 4 or len(payload) > MAX_AUDIO_PAYLOAD_BYTES:
                raise EngineFailure(EngineFailureCode.FAILURE)
            return EngineResult(SAMPLE_RATE_HZ, CHANNEL_COUNT, payload)
        except EngineFailure:
            raise
        except Exception:
            raise EngineFailure(EngineFailureCode.FAILURE) from None

    def warm(self) -> None:
        if self._model is None or self._warmed or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        warm_text = (
            "Esta es una prueba breve de narración local."
            if self._language == "es"
            else "This is a brief local narration test."
        )
        warm_audio = self._generate(warm_text)
        del warm_audio
        self._warmed = True

    def begin(self, request_id: str, segment: Mapping[str, object]) -> WorkIdentity:
        if not self._warmed or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        text = segment.get("text")
        session_id = segment.get("sessionId")
        generation_id = segment.get("generationId")
        segment_id = segment.get("segmentId")
        if not all(
            isinstance(value, str) and value
            for value in (
                text,
                session_id,
                generation_id,
                segment_id,
            )
        ):
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        identity = WorkIdentity(
            request_id,
            cast(str, session_id),
            cast(str, generation_id),
            cast(str, segment_id),
        )
        self._active = _ActiveOperation(identity, cast(str, text))
        return identity

    def settle(self) -> tuple[WorkIdentity, EngineResult]:
        operation = self._active
        if operation is None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        self._active = None
        result = self._generate(operation.text)
        self._retained_result = result
        return operation.identity, result

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
