"""Fail-closed candidate manifest and local-artifact validation."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path, PurePosixPath
from typing import Final, Literal, cast

type CandidateProvider = Literal["pytorch-cuda", "onnxruntime-cpu"]
type CandidatePrecision = Literal["bfloat16", "float32"]

QWEN_CANDIDATE_ID: Final = "qwen3-tts-0-6b-customvoice-cuda-bf16-v1"
SUPERTONIC_CANDIDATE_ID: Final = "supertonic-3-onnx-cpu-f1-es-v1"
ADMITTED_CANDIDATE_IDS: Final = frozenset((QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID))
HASH_READ_BYTES: Final = 1024 * 1024


class AdapterConfigurationError(RuntimeError):
    """Content-free adapter configuration failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-adapter:{code}")
        self.code = code


@dataclass(frozen=True)
class ArtifactIdentity:
    relative_path: str
    sha256: str


@dataclass(frozen=True)
class VerifiedArtifact:
    artifact_id: str
    sha256: str
    size_bytes: int


@dataclass(frozen=True)
class CandidateProfile:
    candidate_id: str
    role: Literal["balanced", "compatibility"]
    distribution: str
    engine_version: str
    model_revision: str
    voice_id: str
    provider: CandidateProvider
    precision: CandidatePrecision
    artifacts: tuple[ArtifactIdentity, ...]
    output_sample_rate_hz: int | None


@dataclass(frozen=True)
class CandidateConfiguration:
    """Runtime declarations that must exactly match the frozen profile."""

    candidate_id: str
    artifact_root: Path = field(repr=False)
    model_revision: str
    voice_id: str
    provider: CandidateProvider
    precision: CandidatePrecision
    offline: bool


def _mapping(value: object, code: str) -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise AdapterConfigurationError(code)
    return cast(Mapping[str, object], value)


def _string(value: object, code: str) -> str:
    if not isinstance(value, str) or not value:
        raise AdapterConfigurationError(code)
    return value


def _strings(value: object, code: str) -> tuple[str, ...]:
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise AdapterConfigurationError(code)
    return tuple(cast(list[str], value))


def _sha256(value: object) -> str:
    digest = _string(value, "manifest")
    if len(digest) != 64 or any(character not in "0123456789abcdef" for character in digest):
        raise AdapterConfigurationError("manifest")
    return digest


def _read_manifest(path: Path) -> Mapping[str, object]:
    try:
        return _mapping(json.loads(path.read_text(encoding="utf-8")), "manifest")
    except AdapterConfigurationError:
        raise
    except Exception:
        raise AdapterConfigurationError("manifest") from None


def load_candidate_profile(path: Path, candidate_id: str) -> CandidateProfile:
    """Load only one of the two profiles admitted by the frozen manifest."""

    if candidate_id not in ADMITTED_CANDIDATE_IDS:
        raise AdapterConfigurationError("candidate")
    manifest = _read_manifest(path)
    if manifest.get("manifestVersion") != "tts-candidate-manifest-v1":
        raise AdapterConfigurationError("manifest")
    candidates = manifest.get("candidates")
    if not isinstance(candidates, list):
        raise AdapterConfigurationError("manifest")
    selected: Mapping[str, object] | None = None
    for raw_candidate in candidates:
        candidate = _mapping(raw_candidate, "manifest")
        if candidate.get("candidateId") == candidate_id:
            if selected is not None:
                raise AdapterConfigurationError("manifest")
            selected = candidate
    if selected is None or selected.get("admission") != "admitted":
        raise AdapterConfigurationError("candidate")

    roles = _strings(selected.get("intendedRoles"), "manifest")
    if roles not in (("balanced",), ("compatibility",)):
        raise AdapterConfigurationError("manifest")
    role = roles[0]
    engine = _mapping(selected.get("engine"), "manifest")
    model = _mapping(selected.get("model"), "manifest")
    voice = _mapping(selected.get("voice"), "manifest")
    runtime = _mapping(selected.get("runtime"), "manifest")

    artifacts: tuple[ArtifactIdentity, ...]
    if candidate_id == QWEN_CANDIDATE_ID:
        if (
            engine.get("distribution") != "qwen-tts"
            or runtime.get("provider") != "PyTorch CUDA"
            or runtime.get("precision") != "bfloat16"
            or runtime.get("attention") != "sdpa"
            or voice.get("language") != "Spanish"
            or model.get("artifact") != "model.safetensors"
        ):
            raise AdapterConfigurationError("manifest")
        provider: CandidateProvider = "pytorch-cuda"
        precision: CandidatePrecision = "bfloat16"
        artifacts = (
            ArtifactIdentity(
                relative_path="model.safetensors",
                sha256=_sha256(model.get("artifactSha256")),
            ),
        )
        output_sample_rate_hz = None
    else:
        if (
            engine.get("distribution") != "supertonic"
            or runtime.get("provider") != "ONNX Runtime CPUExecutionProvider"
            or runtime.get("precision") != "float32"
            or model.get("artifactSet") != "onnx/"
            or voice.get("artifact") != "voice_styles/F1.json"
            or voice.get("languageCode") != "es"
        ):
            raise AdapterConfigurationError("manifest")
        major_artifacts = _mapping(model.get("majorArtifactSha256"), "manifest")
        expected_names = (
            "duration_predictor.onnx",
            "text_encoder.onnx",
            "vector_estimator.onnx",
            "vocoder.onnx",
        )
        if set(major_artifacts) != set(expected_names):
            raise AdapterConfigurationError("manifest")
        provider = "onnxruntime-cpu"
        precision = "float32"
        artifacts = tuple(
            ArtifactIdentity(
                relative_path=f"onnx/{name}",
                sha256=_sha256(major_artifacts.get(name)),
            )
            for name in expected_names
        ) + (
            ArtifactIdentity(
                relative_path="voice_styles/F1.json",
                sha256=_sha256(voice.get("artifactSha256")),
            ),
        )
        sample_rate = runtime.get("outputSampleRateHz")
        if not isinstance(sample_rate, int) or sample_rate != 44_100:
            raise AdapterConfigurationError("manifest")
        output_sample_rate_hz = sample_rate

    return CandidateProfile(
        candidate_id=candidate_id,
        role=cast(Literal["balanced", "compatibility"], role),
        distribution=_string(engine.get("distribution"), "manifest"),
        engine_version=_string(engine.get("version"), "manifest"),
        model_revision=_string(model.get("revision"), "manifest"),
        voice_id=_string(voice.get("id"), "manifest"),
        provider=provider,
        precision=precision,
        artifacts=artifacts,
        output_sample_rate_hz=output_sample_rate_hz,
    )


def validate_configuration(
    profile: CandidateProfile,
    configuration: CandidateConfiguration,
) -> Path:
    if (
        configuration.candidate_id != profile.candidate_id
        or configuration.model_revision != profile.model_revision
        or configuration.voice_id != profile.voice_id
        or configuration.provider != profile.provider
        or configuration.precision != profile.precision
        or not configuration.offline
    ):
        raise AdapterConfigurationError("profile-mismatch")
    if not configuration.artifact_root.is_absolute():
        raise AdapterConfigurationError("artifact-root")
    try:
        root = configuration.artifact_root.resolve(strict=True)
    except OSError:
        raise AdapterConfigurationError("artifact-missing") from None
    if not root.is_dir():
        raise AdapterConfigurationError("artifact-root")
    return root


def verify_and_measure_artifacts(
    root: Path,
    artifacts: tuple[ArtifactIdentity, ...],
) -> tuple[VerifiedArtifact, ...]:
    """Verify allowlisted local files without following paths outside the root."""

    verified: list[VerifiedArtifact] = []
    for artifact in artifacts:
        relative = PurePosixPath(artifact.relative_path)
        if relative.is_absolute() or ".." in relative.parts:
            raise AdapterConfigurationError("artifact-path")
        try:
            target = root.joinpath(*relative.parts).resolve(strict=True)
            target.relative_to(root)
        except (OSError, ValueError):
            raise AdapterConfigurationError("artifact-missing") from None
        if not target.is_file():
            raise AdapterConfigurationError("artifact-missing")
        digest = hashlib.sha256()
        try:
            with target.open("rb") as source:
                while chunk := source.read(HASH_READ_BYTES):
                    digest.update(chunk)
        except OSError:
            raise AdapterConfigurationError("artifact-unreadable") from None
        if digest.hexdigest() != artifact.sha256:
            raise AdapterConfigurationError("artifact-mismatch")
        verified.append(
            VerifiedArtifact(
                artifact_id=relative.as_posix().replace("/", ":"),
                sha256=artifact.sha256,
                size_bytes=target.stat().st_size,
            )
        )
    return tuple(verified)


def verify_artifacts(root: Path, artifacts: tuple[ArtifactIdentity, ...]) -> None:
    verify_and_measure_artifacts(root, artifacts)
