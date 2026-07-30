"""Exact offline Piper/davefx CPU fallback adapter."""

from __future__ import annotations

import array
import hashlib
import importlib
import importlib.metadata
import math
import os
import sys
from collections.abc import Callable, Iterable, Iterator, Mapping, Sized
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from types import ModuleType
from typing import Final, Protocol, cast

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

SPANISH_CANDIDATE_ID: Final = "piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1"
ENGLISH_CANDIDATE_ID: Final = "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1"
CANDIDATE_ID: Final = SPANISH_CANDIDATE_ID
ENGINE_VERSION: Final = "1.4.2"
ONNXRUNTIME_VERSION: Final = "1.27.0"
MODEL_REVISION: Final = "0d907f158acc877ddeebcbf827659ee13bea8bcd"
VOICE_ID: Final = "es_ES-davefx-medium"
SOURCE_SAMPLE_RATE_HZ: Final = 22_050
WARM_TEXT: Final = "Esta es una prueba breve de narración local."
HASH_READ_BYTES: Final = 8 * 1024 * 1024

NOISE_SCALE: Final = 0.667
LENGTH_SCALE: Final = 1.0
NOISE_W_SCALE: Final = 0.8
NORMALIZE_AUDIO: Final = True
VOLUME: Final = 1.0


@dataclass(frozen=True, slots=True)
class ArtifactIdentity:
    """One allowlisted exact voice artifact."""

    relative_path: str
    sha256: str
    size_bytes: int


@dataclass(frozen=True, slots=True)
class PiperVoiceProfile:
    """One exact admitted Piper voice and its bounded warm-up identity."""

    candidate_id: str
    voice_id: str
    expected_espeak_voice: str
    warm_text: str
    artifacts: tuple[ArtifactIdentity, ...]


ARTIFACTS: Final = (
    ArtifactIdentity(
        relative_path="es_ES-davefx-medium.onnx",
        sha256="6658b03b1a6c316ee4c265a9896abc1393353c2d9e1bca7d66c2c442e222a917",
        size_bytes=63_201_294,
    ),
    ArtifactIdentity(
        relative_path="es_ES-davefx-medium.onnx.json",
        sha256="0e0dda87c732f6f38771ff274a6380d9252f327dca77aa2963d5fbdf9ec54842",
        size_bytes=4_817,
    ),
    ArtifactIdentity(
        relative_path="MODEL_CARD",
        sha256="420703b5d8ea239b729f13d83f31eea9bae5fcb89447de23ebc94aa8a4768f95",
        size_bytes=276,
    ),
)

ENGLISH_ARTIFACTS: Final = (
    ArtifactIdentity(
        relative_path="en_US-joe-medium.onnx",
        sha256="58afce0321b8d9c46d7cdf9c16500cc55a793b4220212dba6b70fb788b3baf06",
        size_bytes=63_201_294,
    ),
    ArtifactIdentity(
        relative_path="en_US-joe-medium.onnx.json",
        sha256="3d6d5410b3795cb1950595247ef8f06190719e6fdbfa3a2356d8ec368e1aad33",
        size_bytes=4_794,
    ),
    ArtifactIdentity(
        relative_path="MODEL_CARD",
        sha256="d2caa63aca0fccb155105e959e393e5c0c0f03a1f388ef5ba217b83ef860c760",
        size_bytes=281,
    ),
)

SPANISH_PROFILE: Final = PiperVoiceProfile(
    candidate_id=SPANISH_CANDIDATE_ID,
    voice_id=VOICE_ID,
    expected_espeak_voice="es",
    warm_text=WARM_TEXT,
    artifacts=ARTIFACTS,
)
ENGLISH_PROFILE: Final = PiperVoiceProfile(
    candidate_id=ENGLISH_CANDIDATE_ID,
    voice_id="en_US-joe-medium",
    expected_espeak_voice="en-us",
    warm_text="This is a brief local narration test.",
    artifacts=ENGLISH_ARTIFACTS,
)


class _AudioArray(Sized, Protocol):
    size: int

    def __iter__(self) -> Iterator[float]: ...


class _PiperAudioChunk(Protocol):
    sample_rate: int
    sample_width: int
    sample_channels: int
    audio_float_array: _AudioArray


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


@dataclass(frozen=True, slots=True)
class _ActiveOperation:
    identity: WorkIdentity
    text: str


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


def _protocol_sample_count(source_sample_count: int) -> int:
    return (
        source_sample_count * SAMPLE_RATE_HZ + SOURCE_SAMPLE_RATE_HZ // 2
    ) // SOURCE_SAMPLE_RATE_HZ


def _resample_to_protocol_rate(source: array.array[float]) -> array.array[float]:
    output_count = _protocol_sample_count(len(source))
    if output_count <= 0 or output_count > MAX_AUDIO_SAMPLE_COUNT:
        raise EngineFailure(EngineFailureCode.FAILURE)
    if len(source) == 1:
        return array.array("f", [source[0]]) * output_count

    output = array.array("f")
    for output_index in range(output_count):
        source_numerator = output_index * SOURCE_SAMPLE_RATE_HZ
        left_index, remainder = divmod(source_numerator, SAMPLE_RATE_HZ)
        if left_index >= len(source) - 1:
            value = source[-1]
        else:
            fraction = remainder / SAMPLE_RATE_HZ
            value = source[left_index] + (source[left_index + 1] - source[left_index]) * fraction
        if not math.isfinite(value):
            raise EngineFailure(EngineFailureCode.FAILURE)
        output.append(value)
    return output


class PiperCpuTtsEngine:
    """One resident exact Piper CPU voice with one active complete-waveform call."""

    def __init__(
        self,
        artifact_root: Path,
        *,
        profile: PiperVoiceProfile = SPANISH_PROFILE,
        artifacts: tuple[ArtifactIdentity, ...] | None = None,
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
        self._profile = profile
        self._artifacts = profile.artifacts if artifacts is None else artifacts
        self._importer = importer
        self._version_reader = version_reader
        self._distribution_root_reader = distribution_root_reader
        self._runtime_root = (runtime_root or Path(sys.prefix)).resolve()
        self._runtime_executable = (runtime_executable or Path(sys.executable)).resolve()
        self._python_version = python_version or sys.version_info[:2]
        self._voice: _PiperVoice | None = None
        self._synthesis_config: object | None = None
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
        ready = self._voice is not None and self._warmed
        return EngineCapabilities(
            local_speech_generation="supported" if ready else "unknown",
            hardware_acceleration="unsupported",
            cpu_fallback="supported" if ready else "unknown",
        )

    def _verify_runtime(self) -> None:
        if (
            self._python_version != (3, 12)
            or not _is_within(self._runtime_executable, self._runtime_root)
            or os.environ.get("HF_HUB_OFFLINE") != "1"
        ):
            raise EngineFailure(EngineFailureCode.UNAVAILABLE)
        for distribution, version in {
            "piper-tts": ENGINE_VERSION,
            "onnxruntime": ONNXRUNTIME_VERSION,
        }.items():
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

    def load(self) -> None:
        if self._voice is not None or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        try:
            self._verify_runtime()
            self._verify_artifacts()
            onnxruntime = cast(_OnnxRuntimeModule, self._importer("onnxruntime"))
            if (
                onnxruntime.get_device() != "CPU"
                or "CPUExecutionProvider" not in onnxruntime.get_available_providers()
            ):
                raise EngineFailure(EngineFailureCode.UNAVAILABLE)
            voice_module = cast(_PiperVoiceModule, self._importer("piper.voice"))
            config_module = cast(_PiperConfigModule, self._importer("piper.config"))
            voice = voice_module.PiperVoice.load(
                self._artifact_root / f"{self._profile.voice_id}.onnx",
                config_path=self._artifact_root / f"{self._profile.voice_id}.onnx.json",
                use_cuda=False,
                download_dir=self._artifact_root,
            )
            if (
                voice.session.get_providers() != ["CPUExecutionProvider"]
                or voice.config.sample_rate != SOURCE_SAMPLE_RATE_HZ
                or voice.config.num_speakers != 1
                or voice.config.espeak_voice != self._profile.expected_espeak_voice
            ):
                raise EngineFailure(EngineFailureCode.UNAVAILABLE)
            synthesis_config = config_module.SynthesisConfig(
                speaker_id=None,
                noise_scale=NOISE_SCALE,
                length_scale=LENGTH_SCALE,
                noise_w_scale=NOISE_W_SCALE,
                normalize_audio=NORMALIZE_AUDIO,
                volume=VOLUME,
            )
        except EngineFailure:
            self.cleanup()
            raise
        except Exception:
            self.cleanup()
            raise EngineFailure(EngineFailureCode.FAILURE) from None
        self._voice = voice
        self._synthesis_config = synthesis_config

    def _generate(self, text: str) -> EngineResult:
        voice = self._voice
        synthesis_config = self._synthesis_config
        if voice is None or synthesis_config is None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        try:
            chunks = tuple(
                voice.synthesize(
                    text,
                    syn_config=synthesis_config,
                    include_alignments=False,
                )
            )
            if not chunks:
                raise EngineFailure(EngineFailureCode.FAILURE)
            source = array.array("f")
            maximum_source_samples = (
                MAX_AUDIO_SAMPLE_COUNT * SOURCE_SAMPLE_RATE_HZ // SAMPLE_RATE_HZ
            )
            for chunk in chunks:
                samples = chunk.audio_float_array
                if (
                    chunk.sample_rate != SOURCE_SAMPLE_RATE_HZ
                    or chunk.sample_width != 2
                    or chunk.sample_channels != CHANNEL_COUNT
                    or type(samples.size) is not int
                    or samples.size <= 0
                    or len(samples) != samples.size
                    or len(source) + samples.size > maximum_source_samples
                ):
                    raise EngineFailure(EngineFailureCode.FAILURE)
                for value in samples:
                    sample = float(value)
                    if not math.isfinite(sample):
                        raise EngineFailure(EngineFailureCode.FAILURE)
                    source.append(sample)
            output = _resample_to_protocol_rate(source)
            if sys.byteorder != "little":
                output.byteswap()
            payload = output.tobytes()
            if len(payload) != len(output) * 4 or len(payload) > MAX_AUDIO_PAYLOAD_BYTES:
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
        if self._voice is None or self._warmed or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        result = self._generate(self._profile.warm_text)
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
        self._synthesis_config = None
        self._voice = None
        self._warmed = False
