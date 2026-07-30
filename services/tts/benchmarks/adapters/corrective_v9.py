"""Exact Chatterbox and MOSS adapters for the corrective bilingual v9 screen."""

from __future__ import annotations

import hashlib
import importlib
import json
import os
import shutil
import sys
from collections.abc import Iterator, Mapping, Sequence, Sized
from dataclasses import dataclass
from importlib import metadata
from pathlib import Path
from typing import Any, Final, NoReturn, cast

from benchmarks.contracts import (
    AdapterCapabilities,
    AudioChunk,
    CancellationResponse,
    GenerationRequest,
)

OUTPUT_SAMPLE_RATE_HZ: Final = 24_000
HASH_READ_BYTES: Final = 1024 * 1024
MAXIMUM_PUBLISHED_CHUNK_MILLISECONDS: Final = 250
CHATTERBOX_MODEL_DIRECTORY: Final = "chatterbox_multilingual_v3_v2"
MOSS_MODEL_DIRECTORY: Final = "MOSS-TTS-Nano-100M-ONNX"
MOSS_CODEC_DIRECTORY: Final = "MOSS-Audio-Tokenizer-Nano-ONNX"
CHATTERBOX_CANDIDATE_ID: Final = "chatterbox-multilingual-v3-cuda-bf16-default-v2"
CHATTERBOX_V10_CANDIDATE_ID: Final = "chatterbox-multilingual-v3-cuda-bf16-default-v3"
CHATTERBOX_V11_CANDIDATE_ID: Final = "chatterbox-multilingual-v3-cuda-bf16-default-v4"
MOSS_CANDIDATE_ID: Final = "moss-tts-nano-100m-onnx-cpu-ava-v2"
CHATTERBOX_LOCK_SHA256: Final = "9a5b2628499f522535dc79a70194dd604e40d9d7ab325a765ffc476f5c437c82"
CHATTERBOX_V10_LOCK_SHA256: Final = (
    "70d4d5c4a959bb0e8392c1877d6c5d329b345d3fb17faa140a34787e4632c3d1"
)
CHATTERBOX_V11_LOCK_SHA256: Final = (
    "30f3ca3c27842d88e04256d357e79c291b90636d4f7e20fca18d20713021b1ab"
)
MOSS_LOCK_SHA256: Final = "49d96b6b5121320290ba951be4a8a343f3380c2fc320182d6003b1dcf0d47bcb"
V7_CANDIDATES_SHA256: Final = "1c8b4591782c298d0af19ae91037eb6154e372f32d1c005d6a8dfdfe47bc0f53"
V9_PROFILE_SHA256: Final = "39499a63ba6194803ae3e8e88c2e3a77390454310a059e2aaa9ca7f5874ba3d5"
V9_CANDIDATES_SHA256: Final = "31249a583b8d43f90f7442797373e89b8993455e4cfe26e536cc1e1ca0ca8ad3"
V10_PROFILE_SHA256: Final = "d6abd95698f81d5e868b1e59296f4be22830d7070bc7a5596c881e1b57adfc8b"
V10_CANDIDATES_SHA256: Final = "07332b38d5e480733538d75b9b8ae85ae44df5d921dd2fee4da12ba2f29f942c"
V11_PROFILE_SHA256: Final = "a48d5fd8c9624b0c8e7a394a45d050377990ff233486f9f0a96082ab675599c4"
V11_CANDIDATES_SHA256: Final = "3bceb2c227be02c5f69b524afc3e008e3acf40d42ae47d38ce0b10462324cc06"


class CorrectiveV9ConfigurationError(RuntimeError):
    """Fixed content-free adapter failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-corrective-v9:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise CorrectiveV9ConfigurationError(code)


def _mapping(value: object, code: str = "authority") -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str = "authority") -> Sequence[object]:
    if not isinstance(value, list):
        _fail(code)
    return cast(Sequence[object], value)


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    try:
        with path.open("rb") as source:
            while payload := source.read(HASH_READ_BYTES):
                digest.update(payload)
    except OSError:
        _fail("artifact")
    return digest.hexdigest()


def _restore_candidate_site_packages() -> None:
    """Undo the parent sys.path copied into a Windows spawned venv process."""

    site_packages = (
        Path(sys.executable).resolve().parent.parent / "Lib" / "site-packages"
    ).resolve()
    if not site_packages.is_dir():
        _fail("runtime")
    normalized = os.path.normcase(str(site_packages))
    sys.path[:] = [
        entry for entry in sys.path if os.path.normcase(str(Path(entry).resolve())) != normalized
    ]
    sys.path.insert(0, str(site_packages))
    importlib.invalidate_caches()


@dataclass(frozen=True)
class Artifact:
    root: str
    relative_path: str
    size_bytes: int
    sha256: str


@dataclass(frozen=True)
class ChatterboxV9Profile:
    candidate_id: str
    source_revision: str
    model_revision: str
    artifacts: tuple[Artifact, ...]
    generation: Mapping[str, object]
    torch_version: str = "2.6.0"
    torchaudio_version: str = "2.6.0"


@dataclass(frozen=True)
class MossV9Profile:
    candidate_id: str
    source_revision: str
    model_revision: str
    codec_revision: str
    voice_id: str
    artifacts: tuple[Artifact, ...]
    generation: Mapping[str, object]


@dataclass(frozen=True)
class ChatterboxV9Configuration:
    artifact_root: Path


@dataclass(frozen=True)
class MossV9Configuration:
    artifact_root: Path
    ephemeral_output_root: Path


def _base_candidate(repository_root: Path, candidate_id: str) -> Mapping[str, object]:
    path = repository_root / "benchmarks/tts/candidates-v7.json"
    try:
        payload = path.read_bytes()
        if hashlib.sha256(payload).hexdigest() != V7_CANDIDATES_SHA256:
            _fail("authority")
        value = cast(object, json.loads(payload.decode("utf-8")))
    except (OSError, UnicodeError, json.JSONDecodeError):
        _fail("authority")
    candidates = _sequence(_mapping(value).get("candidates"))
    selected = tuple(
        _mapping(candidate)
        for candidate in candidates
        if isinstance(candidate, dict) and candidate.get("candidateId") == candidate_id
    )
    if len(selected) != 1:
        _fail("authority")
    return selected[0]


def _v9_profile(repository_root: Path, candidate_id: str) -> Mapping[str, object]:
    profile_path = repository_root / "benchmarks/tts/profile-v9.json"
    candidates_path = repository_root / "benchmarks/tts/candidates-v9.json"
    try:
        profile_payload = profile_path.read_bytes()
        candidates_payload = candidates_path.read_bytes()
        if (
            hashlib.sha256(profile_payload).hexdigest() != V9_PROFILE_SHA256
            or hashlib.sha256(candidates_payload).hexdigest() != V9_CANDIDATES_SHA256
        ):
            _fail("authority")
        profile_authority = _mapping(json.loads(profile_payload.decode("utf-8")))
        candidates_authority = _mapping(json.loads(candidates_payload.decode("utf-8")))
    except (OSError, UnicodeError, json.JSONDecodeError):
        _fail("authority")
    decisions = _mapping(profile_authority.get("decisionRules"))
    if (
        decisions.get("noModelMayBeRejectedByHarness") is not True
        or decisions.get("rejectionRequiresExplicitMaintainerDecision") is not True
    ):
        _fail("authority")
    profiles = _sequence(candidates_authority.get("profiles"))
    selected = tuple(
        _mapping(profile)
        for profile in profiles
        if isinstance(profile, dict) and profile.get("candidateId") == candidate_id
    )
    if len(selected) != 1:
        _fail("authority")
    return selected[0]


def _v10_chatterbox_profile(repository_root: Path) -> Mapping[str, object]:
    profile_path = repository_root / "benchmarks/tts/profile-v10.json"
    candidates_path = repository_root / "benchmarks/tts/candidates-v10.json"
    try:
        profile_payload = profile_path.read_bytes()
        candidates_payload = candidates_path.read_bytes()
        if (
            hashlib.sha256(profile_payload).hexdigest() != V10_PROFILE_SHA256
            or hashlib.sha256(candidates_payload).hexdigest() != V10_CANDIDATES_SHA256
        ):
            _fail("authority")
        profile_authority = _mapping(json.loads(profile_payload.decode("utf-8")))
        candidates_authority = _mapping(json.loads(candidates_payload.decode("utf-8")))
    except (OSError, UnicodeError, json.JSONDecodeError):
        _fail("authority")
    decision = _mapping(profile_authority.get("decision"))
    selected = _mapping(candidates_authority.get("profile"))
    if (
        decision.get("stateBeforeMaintainerReview") != "pending-maintainer-decision"
        or decision.get("rejectionRecordedBeforeMaintainerReview") is not False
        or selected.get("candidateId") != CHATTERBOX_V10_CANDIDATE_ID
    ):
        _fail("authority")
    return selected


def _v11_chatterbox_profile(repository_root: Path) -> Mapping[str, object]:
    profile_path = repository_root / "benchmarks/tts/profile-v11.json"
    candidates_path = repository_root / "benchmarks/tts/candidates-v11.json"
    try:
        profile_payload = profile_path.read_bytes()
        candidates_payload = candidates_path.read_bytes()
        if (
            hashlib.sha256(profile_payload).hexdigest() != V11_PROFILE_SHA256
            or hashlib.sha256(candidates_payload).hexdigest() != V11_CANDIDATES_SHA256
        ):
            _fail("authority")
        profile_authority = _mapping(json.loads(profile_payload.decode("utf-8")))
        candidates_authority = _mapping(json.loads(candidates_payload.decode("utf-8")))
    except (OSError, UnicodeError, json.JSONDecodeError):
        _fail("authority")
    decision = _mapping(profile_authority.get("decision"))
    execution = _mapping(profile_authority.get("executionPolicy"))
    selected = _mapping(candidates_authority.get("profile"))
    if (
        decision.get("stateBeforeMaintainerReview") != "pending-maintainer-decision"
        or decision.get("rejectionRecordedBeforeMaintainerReview") is not False
        or execution.get("supportIntent") != "experimental-compatibility-only"
        or selected.get("candidateId") != CHATTERBOX_V11_CANDIDATE_ID
    ):
        _fail("authority")
    return selected


def load_chatterbox_v9_profile(repository_root: Path) -> ChatterboxV9Profile:
    """Load the corrected exact Chatterbox V3 identity."""

    correction = _v9_profile(repository_root, CHATTERBOX_CANDIDATE_ID)
    base = _base_candidate(
        repository_root,
        "chatterbox-multilingual-v3-cuda-bf16-default-v1",
    )
    engine = _mapping(correction.get("engine"))
    model = _mapping(correction.get("model"))
    lock = _mapping(correction.get("dependencyLock"))
    base_model = _mapping(base.get("model"))
    generation = _mapping(base.get("generation"))
    raw_artifacts = _sequence(base_model.get("artifacts"))
    if (
        correction.get("evaluationStage") != "bounded-bilingual-screen"
        or correction.get("languages") != ["es", "en"]
        or engine.get("sourceRevision") != "5de7a54aa4e5e2baadb0182dde554908b48b85c2"
        or model.get("revision") != "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
        or model.get("t3Model") != "v3"
        or lock.get("sha256") != CHATTERBOX_LOCK_SHA256
        or base_model.get("nativeSampleRateHz") != OUTPUT_SAMPLE_RATE_HZ
        or base_model.get("nativeChannels") != 1
        or len(raw_artifacts) != 6
    ):
        _fail("authority")
    artifacts = tuple(
        Artifact(
            root="model",
            relative_path=cast(str, artifact.get("path")),
            size_bytes=cast(int, artifact.get("sizeBytes")),
            sha256=cast(str, artifact.get("sha256")),
        )
        for artifact in (_mapping(value) for value in raw_artifacts)
    )
    return ChatterboxV9Profile(
        candidate_id=CHATTERBOX_CANDIDATE_ID,
        source_revision=cast(str, engine["sourceRevision"]),
        model_revision=cast(str, model["revision"]),
        artifacts=artifacts,
        generation=generation,
    )


def load_chatterbox_v10_profile(repository_root: Path) -> ChatterboxV9Profile:
    """Load the corrected CUDA-wheel Chatterbox V3 identity."""

    correction = _v10_chatterbox_profile(repository_root)
    base = _base_candidate(
        repository_root,
        "chatterbox-multilingual-v3-cuda-bf16-default-v1",
    )
    engine = _mapping(correction.get("engine"))
    model = _mapping(correction.get("model"))
    lock = _mapping(correction.get("dependencyLock"))
    runtime = _mapping(correction.get("runtime"))
    base_model = _mapping(base.get("model"))
    generation = _mapping(base.get("generation"))
    raw_artifacts = _sequence(base_model.get("artifacts"))
    if (
        correction.get("evaluationStage") != "bounded-bilingual-screen"
        or correction.get("languages") != ["es", "en"]
        or engine.get("sourceRevision") != "5de7a54aa4e5e2baadb0182dde554908b48b85c2"
        or model.get("revision") != "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
        or model.get("t3Model") != "v3"
        or lock.get("sha256") != CHATTERBOX_V10_LOCK_SHA256
        or runtime.get("torch") != "2.6.0+cu124"
        or runtime.get("torchaudio") != "2.6.0+cu124"
        or base_model.get("nativeSampleRateHz") != OUTPUT_SAMPLE_RATE_HZ
        or base_model.get("nativeChannels") != 1
        or len(raw_artifacts) != 6
    ):
        _fail("authority")
    artifacts = tuple(
        Artifact(
            root="model",
            relative_path=cast(str, artifact.get("path")),
            size_bytes=cast(int, artifact.get("sizeBytes")),
            sha256=cast(str, artifact.get("sha256")),
        )
        for artifact in (_mapping(value) for value in raw_artifacts)
    )
    return ChatterboxV9Profile(
        candidate_id=CHATTERBOX_V10_CANDIDATE_ID,
        source_revision=cast(str, engine["sourceRevision"]),
        model_revision=cast(str, model["revision"]),
        artifacts=artifacts,
        generation=generation,
        torch_version="2.6.0+cu124",
        torchaudio_version="2.6.0+cu124",
    )


def load_chatterbox_v11_profile(repository_root: Path) -> ChatterboxV9Profile:
    """Load the experimental RTX 50 Chatterbox V3 compatibility identity."""

    correction = _v11_chatterbox_profile(repository_root)
    base = _base_candidate(
        repository_root,
        "chatterbox-multilingual-v3-cuda-bf16-default-v1",
    )
    engine = _mapping(correction.get("engine"))
    model = _mapping(correction.get("model"))
    lock = _mapping(correction.get("dependencyLock"))
    runtime = _mapping(correction.get("runtime"))
    host = _mapping(correction.get("host"))
    base_model = _mapping(base.get("model"))
    generation = _mapping(base.get("generation"))
    raw_artifacts = _sequence(base_model.get("artifacts"))
    if (
        correction.get("evaluationStage") != "bounded-bilingual-compatibility-screen"
        or correction.get("languages") != ["es", "en"]
        or engine.get("sourceRevision") != "5de7a54aa4e5e2baadb0182dde554908b48b85c2"
        or model.get("revision") != "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
        or model.get("t3Model") != "v3"
        or lock.get("sha256") != CHATTERBOX_V11_LOCK_SHA256
        or runtime.get("torch") != "2.9.1+cu128"
        or runtime.get("torchaudio") != "2.9.1+cu128"
        or runtime.get("dependencyOverride") != "explicit-bounded-compatibility-experiment"
        or host.get("requiredCudaCapability") != "12.0"
        or base_model.get("nativeSampleRateHz") != OUTPUT_SAMPLE_RATE_HZ
        or base_model.get("nativeChannels") != 1
        or len(raw_artifacts) != 6
    ):
        _fail("authority")
    artifacts = tuple(
        Artifact(
            root="model",
            relative_path=cast(str, artifact.get("path")),
            size_bytes=cast(int, artifact.get("sizeBytes")),
            sha256=cast(str, artifact.get("sha256")),
        )
        for artifact in (_mapping(value) for value in raw_artifacts)
    )
    return ChatterboxV9Profile(
        candidate_id=CHATTERBOX_V11_CANDIDATE_ID,
        source_revision=cast(str, engine["sourceRevision"]),
        model_revision=cast(str, model["revision"]),
        artifacts=artifacts,
        generation=generation,
        torch_version="2.9.1+cu128",
        torchaudio_version="2.9.1+cu128",
    )


def load_moss_v9_profile(repository_root: Path) -> MossV9Profile:
    """Load the corrected exact MOSS model and codec identity."""

    correction = _v9_profile(repository_root, MOSS_CANDIDATE_ID)
    base = _base_candidate(repository_root, "moss-tts-nano-100m-onnx-cpu-ava-v1")
    engine = _mapping(correction.get("engine"))
    model = _mapping(correction.get("model"))
    lock = _mapping(correction.get("dependencyLock"))
    generation = _mapping(base.get("generation"))
    raw_artifacts = _sequence(model.get("artifacts"))
    if (
        correction.get("evaluationStage") != "bounded-bilingual-screen"
        or correction.get("languages") != ["es", "en"]
        or engine.get("sourceRevision") != "cc7bdf19c7639c0870dab22045a33b442760f6be"
        or model.get("revision") != "f52645cb467506d8e18e746ddd59482685b74e58"
        or model.get("codecRevision") != "ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae"
        or model.get("voiceId") != "Ava"
        or lock.get("sha256") != MOSS_LOCK_SHA256
        or len(raw_artifacts) != 16
    ):
        _fail("authority")
    artifacts = tuple(
        Artifact(
            root=cast(str, artifact.get("root")),
            relative_path=cast(str, artifact.get("path")),
            size_bytes=cast(int, artifact.get("sizeBytes")),
            sha256=cast(str, artifact.get("sha256")),
        )
        for artifact in (_mapping(value) for value in raw_artifacts)
    )
    return MossV9Profile(
        candidate_id=MOSS_CANDIDATE_ID,
        source_revision=cast(str, engine["sourceRevision"]),
        model_revision=cast(str, model["revision"]),
        codec_revision=cast(str, model["codecRevision"]),
        voice_id=cast(str, model["voiceId"]),
        artifacts=artifacts,
        generation=generation,
    )


def verify_chatterbox_v9_artifacts(
    profile: ChatterboxV9Profile,
    configuration: ChatterboxV9Configuration,
) -> Path:
    """Verify the exact six Chatterbox files without accepting downloads."""

    try:
        root = configuration.artifact_root.resolve(strict=True)
    except OSError:
        _fail("artifact")
    if not root.is_dir():
        _fail("artifact")
    for artifact in profile.artifacts:
        target = (root / artifact.relative_path).resolve()
        try:
            target.relative_to(root)
        except ValueError:
            _fail("artifact")
        if (
            not target.is_file()
            or target.stat().st_size != artifact.size_bytes
            or _sha256(target) != artifact.sha256
        ):
            _fail("artifact")
    return root


def verify_moss_v9_artifacts(
    profile: MossV9Profile,
    configuration: MossV9Configuration,
) -> Path:
    """Verify both exact MOSS roots and every frozen graph/data file."""

    try:
        root = configuration.artifact_root.resolve(strict=True)
    except OSError:
        _fail("artifact")
    if not root.is_dir():
        _fail("artifact")
    roots = {
        "model": (root / MOSS_MODEL_DIRECTORY).resolve(),
        "codec": (root / MOSS_CODEC_DIRECTORY).resolve(),
    }
    for artifact in profile.artifacts:
        artifact_root = roots.get(artifact.root)
        if artifact_root is None:
            _fail("artifact")
        target = (artifact_root / artifact.relative_path).resolve()
        try:
            target.relative_to(artifact_root)
        except ValueError:
            _fail("artifact")
        if (
            not target.is_file()
            or target.stat().st_size != artifact.size_bytes
            or _sha256(target) != artifact.sha256
        ):
            _fail("artifact")
    return root


def _sample_count(waveform: object) -> int:
    value = getattr(waveform, "numel", None)
    count = value() if callable(value) else getattr(waveform, "size", None)
    if not isinstance(count, int) or isinstance(count, bool) or count <= 0:
        _fail("invalid-output")
    return count


def _chunks(request_id: str, sample_count: int) -> Iterator[AudioChunk]:
    maximum = OUTPUT_SAMPLE_RATE_HZ * MAXIMUM_PUBLISHED_CHUNK_MILLISECONDS // 1_000
    remaining = sample_count
    sequence = 0
    while remaining > 0:
        count = min(maximum, remaining)
        remaining -= count
        yield AudioChunk(
            request_id=request_id,
            sequence=sequence,
            sample_count=count,
            sample_rate_hz=OUTPUT_SAMPLE_RATE_HZ,
            channels=1,
            sample_format="float32",
            end_of_output=remaining == 0,
        )
        sequence += 1


class ChatterboxV9Adapter:
    """Exact local-path-only Chatterbox Multilingual V3 adapter."""

    def __init__(
        self,
        profile: ChatterboxV9Profile,
        configuration: ChatterboxV9Configuration,
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
            _fail("already-loaded")
        _restore_candidate_site_packages()
        root = verify_chatterbox_v9_artifacts(self._profile, self._configuration)
        if (
            metadata.version("chatterbox-tts") != "0.1.7"
            or metadata.version("torch") != self._profile.torch_version
            or metadata.version("torchaudio") != self._profile.torchaudio_version
            or os.environ.get("HF_HUB_OFFLINE") != "1"
            or os.environ.get("TRANSFORMERS_OFFLINE") != "1"
        ):
            _fail("runtime")
        try:
            torch = importlib.import_module("torch")
            module = importlib.import_module("chatterbox.mtl_tts")
            if not torch.cuda.is_available() or not torch.cuda.is_bf16_supported():
                _fail("provider")
            if self._profile.candidate_id == CHATTERBOX_V11_CANDIDATE_ID and (
                tuple(torch.cuda.get_device_capability()) != (12, 0)
                or "sm_120" not in torch.cuda.get_arch_list()
            ):
                _fail("provider")
            torch.cuda.reset_peak_memory_stats()
            model = module.ChatterboxMultilingualTTS.from_local(
                str(root),
                device=torch.device("cuda"),
                t3_model="v3",
            )
        except CorrectiveV9ConfigurationError:
            raise
        except Exception:
            _fail("load")
        self._torch = torch
        self._model = model

    def _waveform(self, request: GenerationRequest) -> Any:
        if self._model is None or request.language not in ("es", "en"):
            _fail("request")
        values = self._profile.generation
        try:
            waveform = self._model.generate(
                request.text,
                language_id=request.language,
                audio_prompt_path=None,
                exaggeration=values["exaggeration"],
                cfg_weight=values["cfgWeight"],
                temperature=values["temperature"],
                repetition_penalty=values["repetitionPenalty"],
                min_p=values["minP"],
                top_p=values["topP"],
            )
        except Exception:
            _fail("generation")
        _sample_count(waveform)
        return waveform

    def synthesize_for_quality(self, request: GenerationRequest) -> tuple[Sized, int]:
        waveform = self._waveform(request)
        try:
            value = waveform.detach().to("cpu").reshape(-1).numpy()
        except Exception:
            _fail("invalid-output")
        return cast(Sized, value), OUTPUT_SAMPLE_RATE_HZ

    def warm_up(self, request: GenerationRequest) -> None:
        self._waveform(request)

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        waveform = self._waveform(request)
        yield from _chunks(request.request_id, _sample_count(waveform))

    def cancel(self, request_id: str) -> CancellationResponse:
        del request_id
        return CancellationResponse(acknowledged=False, stop_mode=None)

    def framework_memory_high_water_bytes(self) -> int | None:
        if self._torch is None:
            return self._peak_vram_bytes
        value = self._torch.cuda.max_memory_reserved()
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            _fail("memory")
        self._peak_vram_bytes = max(self._peak_vram_bytes or 0, value)
        return self._peak_vram_bytes

    def close(self) -> None:
        self.framework_memory_high_water_bytes()
        self._model = None
        torch = self._torch
        self._torch = None
        if torch is not None:
            torch.cuda.empty_cache()


class MossV9Adapter:
    """Exact offline MOSS ONNX CPU adapter with in-memory audio conversion."""

    def __init__(self, profile: MossV9Profile, configuration: MossV9Configuration) -> None:
        self._profile = profile
        self._configuration = configuration
        self._runtime: Any = None
        self._numpy: Any = None
        self._prompt_audio_codes: list[list[int]] | None = None

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            candidate_id=self._profile.candidate_id,
            streaming_granularity="complete-waveform",
            sample_format="float32",
            generation_cancellation="worker-termination",
        )

    def load(self) -> None:
        if self._runtime is not None:
            _fail("already-loaded")
        _restore_candidate_site_packages()
        root = verify_moss_v9_artifacts(self._profile, self._configuration)
        if (
            metadata.version("moss-tts-nano") != "0.1.0"
            or metadata.version("onnxruntime") != "1.28.0"
            or os.environ.get("HF_HUB_OFFLINE") != "1"
        ):
            _fail("runtime")
        output_root = self._configuration.ephemeral_output_root.resolve()
        try:
            output_root.relative_to(root.parent)
        except ValueError:
            _fail("configuration")
        try:
            module = importlib.import_module("onnx_tts_runtime")
            numpy = importlib.import_module("numpy")
            runtime = module.OnnxTtsRuntime(
                root,
                thread_count=4,
                max_new_frames=375,
                do_sample=True,
                sample_mode="fixed",
                execution_provider="cpu",
                output_dir=output_root,
            )
            prompt_audio_codes = runtime.resolve_prompt_audio_codes(
                voice=self._profile.voice_id,
                prompt_audio_path=None,
            )
            providers = {
                provider
                for session in runtime.sessions.values()
                for provider in session.get_providers()
            }
            if providers != {"CPUExecutionProvider"}:
                _fail("provider")
        except CorrectiveV9ConfigurationError:
            raise
        except Exception:
            _fail("load")
        self._runtime = runtime
        self._numpy = numpy
        self._prompt_audio_codes = cast(list[list[int]], prompt_audio_codes)

    def _native_waveform(self, request: GenerationRequest) -> object:
        runtime = self._runtime
        numpy = self._numpy
        prompt_audio_codes = self._prompt_audio_codes
        if (
            runtime is None
            or numpy is None
            or prompt_audio_codes is None
            or request.language not in ("es", "en")
        ):
            _fail("request")
        try:
            prepared = runtime.prepare_synthesis_text(
                text=request.text,
                voice=self._profile.voice_id,
                enable_wetext=False,
                enable_normalize_tts_text=False,
            )
            prepared_text = str(prepared["text"])
            text_chunks = runtime.split_voice_clone_text(prepared_text, max_tokens=75)
            waveforms: list[object] = []
            for index, text_chunk in enumerate(text_chunks):
                result = runtime.synthesize_single_chunk(
                    text=text_chunk,
                    prompt_audio_codes=prompt_audio_codes,
                    streaming=True,
                )
                waveform = numpy.asarray(result["waveform"], dtype=numpy.float32)
                waveforms.append(waveform)
                if index < len(text_chunks) - 1:
                    pause_seconds = runtime.estimate_voice_clone_inter_chunk_pause_seconds(
                        text_chunk
                    )
                    pause_samples = max(0, int(round(48_000 * pause_seconds)))
                    if pause_samples:
                        waveforms.append(numpy.zeros((pause_samples, 2), dtype=numpy.float32))
            native = numpy.concatenate(waveforms, axis=0)
            if native.ndim != 2 or native.shape[1] != 2 or native.shape[0] <= 0:
                _fail("invalid-output")
            mono = native.mean(axis=1, dtype=numpy.float32)
            output_count = max(1, int(round(int(mono.size) / 2)))
            positions = numpy.arange(output_count, dtype=numpy.float64) * 2.0
            converted = numpy.interp(
                positions,
                numpy.arange(int(mono.size), dtype=numpy.float64),
                mono,
            ).astype(numpy.float32, copy=False)
            if converted.size != output_count or not bool(numpy.isfinite(converted).all()):
                _fail("invalid-output")
            return converted
        except CorrectiveV9ConfigurationError:
            raise
        except Exception:
            _fail("generation")

    def synthesize_for_quality(self, request: GenerationRequest) -> tuple[Sized, int]:
        return cast(Sized, self._native_waveform(request)), OUTPUT_SAMPLE_RATE_HZ

    def warm_up(self, request: GenerationRequest) -> None:
        self._native_waveform(request)

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        waveform = self._native_waveform(request)
        yield from _chunks(request.request_id, _sample_count(waveform))

    def cancel(self, request_id: str) -> CancellationResponse:
        del request_id
        return CancellationResponse(acknowledged=False, stop_mode=None)

    def framework_memory_high_water_bytes(self) -> None:
        return None

    def close(self) -> None:
        self._prompt_audio_codes = None
        self._runtime = None
        self._numpy = None
        output_root = self._configuration.ephemeral_output_root.resolve()
        if output_root.exists():
            shutil.rmtree(output_root)


@dataclass(frozen=True)
class ChatterboxV9AdapterFactory:
    profile: ChatterboxV9Profile
    configuration: ChatterboxV9Configuration

    def __call__(self) -> ChatterboxV9Adapter:
        return ChatterboxV9Adapter(self.profile, self.configuration)


@dataclass(frozen=True)
class MossV9AdapterFactory:
    profile: MossV9Profile
    configuration: MossV9Configuration

    def __call__(self) -> MossV9Adapter:
        return MossV9Adapter(self.profile, self.configuration)
