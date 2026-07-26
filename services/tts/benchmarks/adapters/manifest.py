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
QWEN_V3_CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cuda-bf16-v1"
SUPERTONIC_CANDIDATE_ID: Final = "supertonic-3-onnx-cpu-f1-es-v1"
ADMITTED_CANDIDATE_IDS: Final = frozenset((QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID))
PROFILE_V3_SHA256: Final = "7d062a4f662ed95b1cb5ff0a21fc40864f4ac3858cea4314ee612b84c2e08dbe"
PROFILE_V3_CONFIGURATION_SHA256: Final = (
    "b689b9b81cc7633687e80030ed172878d89196d57149370a82839e1ec83d61df"
)
PROFILE_V3_LOCK_SHA256: Final = "1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913"
PROFILE_V3_SCREEN_RESULT_SHA256: Final = (
    "d55764525a0152e130205b8bb37bc7f7371a5514057928689501897d6e3ac56d"
)
PROFILE_V3_INSTRUCTION_SHA256: Final = (
    "a34bbe86eb3594cbe6a763778a9c2e1e86710a8047de0a0fdc126703e65527db"
)
PROFILE_V3_GENERATION_SHA256: Final = (
    "1a03c4c5af681d0285200377b2321dd547d92f65c90649d8f36f0c31c25c263e"
)
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
class CustomVoiceGenerationSettings:
    do_sample: bool
    repetition_penalty: float
    temperature: float
    top_p: float
    top_k: int
    subtalker_do_sample: bool
    subtalker_temperature: float
    subtalker_top_p: float
    subtalker_top_k: int
    max_new_tokens: int

    def as_authority_value(self) -> dict[str, object]:
        return {
            "batchSize": 1,
            "doSample": self.do_sample,
            "repetitionPenalty": self.repetition_penalty,
            "temperature": self.temperature,
            "topP": self.top_p,
            "topK": self.top_k,
            "subtalkerDoSample": self.subtalker_do_sample,
            "subtalkerTemperature": self.subtalker_temperature,
            "subtalkerTopP": self.subtalker_top_p,
            "subtalkerTopK": self.subtalker_top_k,
            "maxNewTokens": self.max_new_tokens,
        }

    def as_qwen_kwargs(self) -> dict[str, object]:
        return {
            "do_sample": self.do_sample,
            "repetition_penalty": self.repetition_penalty,
            "temperature": self.temperature,
            "top_p": self.top_p,
            "top_k": self.top_k,
            "subtalker_dosample": self.subtalker_do_sample,
            "subtalker_temperature": self.subtalker_temperature,
            "subtalker_top_p": self.subtalker_top_p,
            "subtalker_top_k": self.subtalker_top_k,
            "max_new_tokens": self.max_new_tokens,
        }


@dataclass(frozen=True)
class EvaluationAuthority:
    profile_version: str
    profile_sha256: str
    configuration_identity_sha256: str
    candidate_manifest_version: str
    environment_project: str
    candidate_lock_sha256: str
    speaker_screen_result_sha256: str
    instruction_sha256: str
    generation_settings_sha256: str
    batch_size: int
    automatic_retries: int
    model_lifetime: str
    auxiliary_analysis: tuple[str, ...]


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
    language: str = "Spanish"
    instruction: str | None = field(default=None, repr=False)
    generation_settings: CustomVoiceGenerationSettings | None = field(
        default=None,
        repr=False,
    )
    authority: EvaluationAuthority | None = field(default=None, repr=False)


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


def _canonical_sha256(value: object) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def _file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    try:
        with path.open("rb") as source:
            while chunk := source.read(HASH_READ_BYTES):
                digest.update(chunk)
    except OSError:
        raise AdapterConfigurationError("authority") from None
    return digest.hexdigest()


def _authority_path(repository_root: Path, value: object) -> tuple[Path, str]:
    authority = _mapping(value, "authority")
    raw_path = _string(authority.get("path"), "authority")
    relative = PurePosixPath(raw_path)
    if relative.is_absolute() or ".." in relative.parts:
        raise AdapterConfigurationError("authority")
    target = repository_root.joinpath(*relative.parts).resolve()
    try:
        target.relative_to(repository_root.resolve())
    except ValueError:
        raise AdapterConfigurationError("authority") from None
    expected = _sha256(authority.get("sha256"))
    if not target.is_file() or _file_sha256(target) != expected:
        raise AdapterConfigurationError("authority")
    return target, expected


def _exact_generation_settings(value: object) -> CustomVoiceGenerationSettings:
    generation = _mapping(value, "authority")
    expected = {
        "batchSize": 1,
        "doSample": True,
        "repetitionPenalty": 1.05,
        "temperature": 0.9,
        "topP": 1.0,
        "topK": 50,
        "subtalkerDoSample": True,
        "subtalkerTemperature": 0.9,
        "subtalkerTopP": 1.0,
        "subtalkerTopK": 50,
        "maxNewTokens": 2048,
    }
    if dict(generation) != expected:
        raise AdapterConfigurationError("authority")
    return CustomVoiceGenerationSettings(
        do_sample=True,
        repetition_penalty=1.05,
        temperature=0.9,
        top_p=1.0,
        top_k=50,
        subtalker_do_sample=True,
        subtalker_temperature=0.9,
        subtalker_top_p=1.0,
        subtalker_top_k=50,
        max_new_tokens=2048,
    )


def load_v3_candidate_profile(repository_root: Path, candidate_id: str) -> CandidateProfile:
    """Load the exact v3 candidate only after all frozen authorities agree."""

    if candidate_id != QWEN_V3_CANDIDATE_ID:
        raise AdapterConfigurationError("candidate")
    profile_path = repository_root / "benchmarks" / "tts" / "profile-v3.json"
    if _file_sha256(profile_path) != PROFILE_V3_SHA256:
        raise AdapterConfigurationError("authority")
    profile = _read_manifest(profile_path)
    if (
        profile.get("profileVersion") != "tts-feasibility-profile-v3"
        or profile.get("status") != "frozen-before-prototype-and-official-results"
        or profile.get("candidateRole") != "balanced"
    ):
        raise AdapterConfigurationError("authority")

    authorities = _mapping(profile.get("authorities"), "authority")
    required_authorities = {
        "baseCandidateManifest",
        "candidateManifestCorrection",
        "speakerScreen",
        "speakerScreenResult",
        "corpus",
        "candidateLock",
        "inheritedMeasurementProfile",
    }
    if set(authorities) != required_authorities:
        raise AdapterConfigurationError("authority")
    resolved = {
        name: _authority_path(repository_root, authorities.get(name))
        for name in required_authorities
    }
    base_manifest = _read_manifest(resolved["baseCandidateManifest"][0])
    correction = _read_manifest(resolved["candidateManifestCorrection"][0])
    screen = _read_manifest(resolved["speakerScreen"][0])
    screen_result = _read_manifest(resolved["speakerScreenResult"][0])

    candidates = base_manifest.get("candidates")
    if not isinstance(candidates, list) or len(candidates) != 1:
        raise AdapterConfigurationError("authority")
    base_candidate = _mapping(candidates[0], "authority")
    candidate = _mapping(profile.get("candidate"), "authority")
    engine = _mapping(candidate.get("engine"), "authority")
    model = _mapping(candidate.get("model"), "authority")
    voice = _mapping(candidate.get("voice"), "authority")
    runtime = _mapping(candidate.get("runtime"), "authority")
    base_model = _mapping(base_candidate.get("model"), "authority")
    generation = _exact_generation_settings(candidate.get("generation"))

    supported = _mapping(base_candidate.get("voice"), "authority").get("supportedSpeakers")
    if not isinstance(supported, list):
        raise AdapterConfigurationError("authority")
    supported_order = tuple(
        _string(_mapping(value, "authority").get("id"), "authority") for value in supported
    )
    speaker = _string(voice.get("speaker"), "authority")
    selected_result = screen_result.get("selectedSpeaker")
    screen_order = screen.get("speakerOrder")
    result_speakers = screen_result.get("speakers")
    if (
        candidate.get("candidateId") != candidate_id
        or base_candidate.get("candidateId") != candidate_id
        or correction.get("candidateId") != candidate_id
        or screen.get("candidateId") != candidate_id
        or screen_result.get("candidateId") != candidate_id
        or selected_result != speaker
        or not isinstance(screen_order, list)
        or tuple(screen_order) != supported_order
        or not isinstance(result_speakers, list)
        or tuple(
            _string(_mapping(value, "authority").get("speakerId"), "authority")
            for value in result_speakers
        )
        != supported_order
        or speaker not in supported_order
    ):
        raise AdapterConfigurationError("authority")
    selected = next(
        _mapping(value, "authority")
        for value in result_speakers
        if _mapping(value, "authority").get("speakerId") == speaker
    )
    if selected.get("eligible") is not True or selected.get("meaningChangingDefects") != 0:
        raise AdapterConfigurationError("authority")

    instruction = _string(voice.get("instruction"), "authority")
    base_voice = _mapping(base_candidate.get("voice"), "authority")
    base_runtime = _mapping(base_candidate.get("runtime"), "authority")
    base_generation = _mapping(base_runtime.get("generation"), "authority")
    if (
        base_manifest.get("manifestVersion") != "tts-candidate-manifest-v2"
        or correction.get("manifestVersion") != "tts-candidate-manifest-v3"
        or correction.get("selectionAuthority") != "customvoice-spanish-screen-v2"
        or screen.get("screenVersion") != "customvoice-spanish-screen-v2"
        or screen_result.get("screenVersion") != "customvoice-spanish-screen-v2"
        or engine.get("distribution") != "qwen-tts"
        or engine.get("version") != "0.1.1"
        or model.get("revision") != base_model.get("revision")
        or voice.get("mode") != "built-in-customvoice"
        or voice.get("language") != "Spanish"
        or instruction != base_voice.get("instruction")
        or instruction != screen.get("instruction")
        or runtime.get("provider") != "PyTorch CUDA"
        or runtime.get("torch") != "2.9.1+cu128"
        or runtime.get("torchaudio") != "2.9.1+cu128"
        or runtime.get("precision") != "bfloat16"
        or runtime.get("attention") != "sdpa"
        or {"batchSize": base_runtime.get("batchSize"), **base_generation}
        != candidate.get("generation")
    ):
        raise AdapterConfigurationError("authority")

    major_artifacts = model.get("majorArtifacts")
    if not isinstance(major_artifacts, list) or len(major_artifacts) != 2:
        raise AdapterConfigurationError("authority")
    artifacts = tuple(
        ArtifactIdentity(
            relative_path=_string(_mapping(item, "authority").get("path"), "authority"),
            sha256=_sha256(_mapping(item, "authority").get("sha256")),
        )
        for item in major_artifacts
    )
    configuration_value = {
        "candidateId": candidate_id,
        "model": candidate.get("model"),
        "voice": candidate.get("voice"),
        "runtime": candidate.get("runtime"),
        "generation": candidate.get("generation"),
    }
    configuration_sha256 = _canonical_sha256(configuration_value)
    if configuration_sha256 != PROFILE_V3_CONFIGURATION_SHA256:
        raise AdapterConfigurationError("authority")
    policy = _mapping(profile.get("executionPolicy"), "authority")
    if (
        policy.get("automaticRetries") != 0
        or policy.get("failureAccounting") != "first-attempt-is-authoritative"
        or policy.get("configurationSwitching") != "forbidden"
        or policy.get("whisper") != "excluded"
        or policy.get("vadOrEnergy") != "excluded"
        or policy.get("referenceAudio") != "forbidden"
        or policy.get("referenceTranscript") != "forbidden"
        or policy.get("voiceClonePrompt") != "forbidden"
    ):
        raise AdapterConfigurationError("authority")

    generation_mapping = cast(Mapping[str, object], candidate["generation"])
    authority = EvaluationAuthority(
        profile_version="tts-feasibility-profile-v3",
        profile_sha256=PROFILE_V3_SHA256,
        configuration_identity_sha256=configuration_sha256,
        candidate_manifest_version="tts-candidate-manifest-v3",
        environment_project=_string(base_candidate.get("environmentProject"), "authority"),
        candidate_lock_sha256=resolved["candidateLock"][1],
        speaker_screen_result_sha256=resolved["speakerScreenResult"][1],
        instruction_sha256=hashlib.sha256(instruction.encode("utf-8")).hexdigest(),
        generation_settings_sha256=_canonical_sha256(generation_mapping),
        batch_size=1,
        automatic_retries=0,
        model_lifetime=_string(policy.get("modelLifetime"), "authority"),
        auxiliary_analysis=("whisper-excluded", "vad-or-energy-excluded"),
    )
    return CandidateProfile(
        candidate_id=candidate_id,
        role="balanced",
        distribution="qwen-tts",
        engine_version="0.1.1",
        model_revision=_string(model.get("revision"), "authority"),
        voice_id=speaker,
        provider="pytorch-cuda",
        precision="bfloat16",
        artifacts=artifacts,
        output_sample_rate_hz=24_000,
        language="Spanish",
        instruction=instruction,
        generation_settings=generation,
        authority=authority,
    )


def load_benchmark_candidate_profile(repository_root: Path, candidate_id: str) -> CandidateProfile:
    """Route legacy profiles and the exact v3 profile without candidate imports."""

    if candidate_id == QWEN_V3_CANDIDATE_ID:
        return load_v3_candidate_profile(repository_root, candidate_id)
    return load_candidate_profile(
        repository_root / "benchmarks" / "tts" / "candidates-v1.json",
        candidate_id,
    )


def v3_profile_identity_matches(profile: CandidateProfile) -> bool:
    """Recheck the sensitive in-memory fields against content-safe fingerprints."""

    authority = profile.authority
    generation = profile.generation_settings
    instruction = profile.instruction
    return bool(
        profile.candidate_id == QWEN_V3_CANDIDATE_ID
        and profile.model_revision == "0c0e3051f131929182e2c023b9537f8b1c68adfe"
        and profile.voice_id == "Serena"
        and profile.language == "Spanish"
        and profile.provider == "pytorch-cuda"
        and profile.precision == "bfloat16"
        and profile.output_sample_rate_hz == 24_000
        and instruction is not None
        and generation is not None
        and authority is not None
        and hashlib.sha256(instruction.encode("utf-8")).hexdigest() == authority.instruction_sha256
        and _canonical_sha256(generation.as_authority_value())
        == authority.generation_settings_sha256
    )


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
