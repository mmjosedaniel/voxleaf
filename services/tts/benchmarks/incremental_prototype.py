"""Bounded complete-segment delivery and hard-cancellation prototype."""

from __future__ import annotations

import gc
import hashlib
import importlib
import json
import multiprocessing
import os
import subprocess
import sys
import time
from collections.abc import Callable, Mapping, Sequence
from contextlib import suppress
from dataclasses import dataclass, field
from importlib import metadata
from multiprocessing.context import SpawnContext
from multiprocessing.process import BaseProcess
from pathlib import Path
from typing import Any, Final, Protocol, cast

from benchmarks.adapters.manifest import (
    ArtifactIdentity,
    CandidateConfiguration,
    CandidateProfile,
)
from benchmarks.contracts import BenchmarkCorpus, MemoryObservation
from benchmarks.diagnostics import DiagnosticCapture
from benchmarks.harness import load_corpus
from benchmarks.memory import (
    PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS,
    FrameworkVramTracker,
    ProcessResourceSampler,
    ProcessTreeMemoryProbe,
    WindowsGpuProcessMemorySampler,
    WindowsProcessResourceSampler,
)
from benchmarks.preflight import (
    HostSnapshot,
    PreflightRequest,
    RunConditions,
    run_local_preflight,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
AUTHORITY_PATH: Final = (
    REPOSITORY_ROOT / "benchmarks" / "tts" / "incremental-cancellation-prototype-v1.json"
)
PROFILE_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "profile-v3.json"
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v1.json"
PROFILE_SHA256: Final = "7d062a4f662ed95b1cb5ff0a21fc40864f4ac3858cea4314ee612b84c2e08dbe"
CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cuda-bf16-v1"
CONFIGURATION_IDENTITY_SHA256: Final = (
    "b689b9b81cc7633687e80030ed172878d89196d57149370a82839e1ec83d61df"
)
MAXIMUM_INPUT_CODE_POINTS: Final = 640
MAXIMUM_INPUT_UTF8_BYTES: Final = 2_048
MAXIMUM_SAMPLE_FRAMES: Final = 5_120_000
MAXIMUM_AUDIO_BYTES: Final = 20_480_000
MAXIMUM_LOAD_NS: Final = 120_000_000_000
MAXIMUM_SETUP_NS: Final = 5_000_000_000
MAXIMUM_GENERATION_NS: Final = 300_000_000_000
MAXIMUM_INVALIDATION_NS: Final = 500_000_000
MAXIMUM_TERMINATION_NS: Final = 2_000_000_000
MAXIMUM_CLEANUP_NS: Final = 5_000_000_000
NEAR_HARD_DELAY_NS: Final = 5_000_000_000
MAXIMUM_PEAK_RAM_BYTES: Final = 12_884_901_888
MAXIMUM_PEAK_VRAM_BYTES: Final = 6_442_450_944
TRIAL_ORDER: Final = (
    "before-dispatch",
    "accepted-before-audio",
    "after-first-audio",
    "near-hard-mid-generation",
    "during-cleanup",
)
type WorkerMessage = tuple[object, ...]


class PrototypeError(RuntimeError):
    """Fixed content-free prototype failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-incremental-prototype:{code}")
        self.code = code


class _WorkerConnection(Protocol):
    def send(self, obj: object) -> None: ...

    def recv(self) -> object: ...

    def poll(self, timeout: float = 0.0) -> bool: ...

    def close(self) -> None: ...


class PrototypeMemoryProbe(Protocol):
    def start(self) -> None: ...

    def stop(self) -> MemoryObservation: ...


@dataclass(frozen=True)
class PrototypeRunRequest:
    artifact_root: Path = field(repr=False)
    candidate_python: Path = field(repr=False)
    expected_commit_sha: str
    sleep_disabled: bool
    background_load_acceptable: bool
    thermal_state_acceptable: bool


@dataclass(frozen=True)
class WorkIdentity:
    session_id: str
    generation_id: str
    segment_id: str
    candidate_id: str
    configuration_identity_sha256: str


@dataclass(frozen=True)
class PrototypeSegment:
    identity: WorkIdentity
    case_id: str
    text: str = field(repr=False)


@dataclass(frozen=True)
class AudioUnit:
    identity: WorkIdentity
    sample_count: int
    sample_rate_hz: int
    channels: int
    sample_format: str
    payload: bytes = field(repr=False)


@dataclass(frozen=True)
class WorkerReady:
    load_ns: int
    configuration_setup_ns: int
    framework_vram_bytes: int


@dataclass(frozen=True)
class WorkerStop:
    elapsed_ns: int
    exited: bool
    late_units: tuple[AudioUnit, ...] = ()


@dataclass(frozen=True)
class QwenWorkerConfiguration:
    artifact_root: Path = field(repr=False)
    candidate_id: str
    configuration_identity_sha256: str
    speaker: str
    instruction: str = field(repr=False)
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


class PrototypeWorker(Protocol):
    def start(self) -> WorkerReady: ...

    def submit(self, segment: PrototypeSegment) -> None: ...

    def receive_audio(self) -> AudioUnit: ...

    def audio_ready(self) -> bool: ...

    def terminate(self) -> WorkerStop: ...

    def close(self) -> WorkerStop: ...


class _IdentityGate:
    def __init__(self) -> None:
        self._active: WorkIdentity | None = None

    def activate(self, identity: WorkIdentity) -> None:
        if self._active is not None:
            raise PrototypeError("identity-active")
        self._active = identity

    def invalidate(self) -> None:
        self._active = None

    def accepts(self, unit: AudioUnit) -> bool:
        return self._active is not None and unit.identity == self._active


class _OneUnitQueue:
    def __init__(self) -> None:
        self._unit: AudioUnit | None = None
        self.peak_units = 0
        self.peak_bytes = 0

    def publish(self, unit: AudioUnit) -> None:
        if self._unit is not None:
            raise PrototypeError("queue-limit")
        if not unit.payload or len(unit.payload) > MAXIMUM_AUDIO_BYTES:
            raise PrototypeError("output-limit")
        self._unit = unit
        self.peak_units = 1
        self.peak_bytes = max(self.peak_bytes, len(unit.payload))

    def release(self) -> None:
        if self._unit is None:
            raise PrototypeError("queue-empty")
        self._unit = None

    @property
    def empty(self) -> bool:
        return self._unit is None


def _mapping(value: object, code: str = "authority") -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise PrototypeError(code)
    return cast(Mapping[str, object], value)


def _load_json(path: Path, code: str = "authority") -> Mapping[str, object]:
    try:
        return _mapping(json.loads(path.read_text(encoding="utf-8")), code)
    except PrototypeError:
        raise
    except Exception:
        raise PrototypeError(code) from None


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _authority() -> Mapping[str, object]:
    authority = _load_json(AUTHORITY_PATH)
    if (
        authority.get("prototypeVersion") != "incremental-cancellation-prototype-v1"
        or authority.get("status") != "frozen-before-prototype-results"
        or authority.get("candidateId") != CANDIDATE_ID
        or authority.get("configurationIdentitySha256") != CONFIGURATION_IDENTITY_SHA256
        or tuple(cast(Sequence[object], authority.get("trialOrder"))) != TRIAL_ORDER
    ):
        raise PrototypeError("authority")
    profile = _mapping(authority.get("candidateProfile"))
    if profile.get("sha256") != _sha256(PROFILE_PATH):
        raise PrototypeError("authority")
    return authority


def _candidate_profile_and_worker_configuration(
    artifact_root: Path,
) -> tuple[CandidateProfile, QwenWorkerConfiguration]:
    profile = _load_json(PROFILE_PATH, "profile")
    if _sha256(PROFILE_PATH) != PROFILE_SHA256:
        raise PrototypeError("profile")
    candidate = _mapping(profile.get("candidate"), "profile")
    engine = _mapping(candidate.get("engine"), "profile")
    model = _mapping(candidate.get("model"), "profile")
    voice = _mapping(candidate.get("voice"), "profile")
    runtime = _mapping(candidate.get("runtime"), "profile")
    generation = _mapping(candidate.get("generation"), "profile")
    artifacts = cast(Sequence[object], model.get("majorArtifacts"))
    identities = tuple(
        ArtifactIdentity(
            relative_path=cast(str, _mapping(raw, "profile").get("path")),
            sha256=cast(str, _mapping(raw, "profile").get("sha256")),
        )
        for raw in artifacts
    )
    if (
        candidate.get("candidateId") != CANDIDATE_ID
        or engine.get("distribution") != "qwen-tts"
        or engine.get("version") != "0.1.1"
        or model.get("revision") != "0c0e3051f131929182e2c023b9537f8b1c68adfe"
        or voice.get("speaker") != "Serena"
        or voice.get("language") != "Spanish"
        or runtime.get("torch") != "2.9.1+cu128"
        or runtime.get("precision") != "bfloat16"
        or runtime.get("attention") != "sdpa"
    ):
        raise PrototypeError("profile")
    candidate_profile = CandidateProfile(
        candidate_id=CANDIDATE_ID,
        role="balanced",
        distribution="qwen-tts",
        engine_version="0.1.1",
        model_revision=cast(str, model["revision"]),
        voice_id="Serena",
        provider="pytorch-cuda",
        precision="bfloat16",
        artifacts=identities,
        output_sample_rate_hz=24_000,
    )
    worker_configuration = QwenWorkerConfiguration(
        artifact_root=artifact_root,
        candidate_id=CANDIDATE_ID,
        configuration_identity_sha256=CONFIGURATION_IDENTITY_SHA256,
        speaker="Serena",
        instruction=cast(str, voice["instruction"]),
        do_sample=cast(bool, generation["doSample"]),
        repetition_penalty=cast(float, generation["repetitionPenalty"]),
        temperature=cast(float, generation["temperature"]),
        top_p=cast(float, generation["topP"]),
        top_k=cast(int, generation["topK"]),
        subtalker_do_sample=cast(bool, generation["subtalkerDoSample"]),
        subtalker_temperature=cast(float, generation["subtalkerTemperature"]),
        subtalker_top_p=cast(float, generation["subtalkerTopP"]),
        subtalker_top_k=cast(int, generation["subtalkerTopK"]),
        max_new_tokens=cast(int, generation["maxNewTokens"]),
    )
    return candidate_profile, worker_configuration


def _validate_segment(segment: PrototypeSegment) -> None:
    identity = segment.identity
    if (
        not segment.case_id
        or not segment.text
        or len(segment.text) > MAXIMUM_INPUT_CODE_POINTS
        or len(segment.text.encode()) > MAXIMUM_INPUT_UTF8_BYTES
        or identity.candidate_id != CANDIDATE_ID
        or identity.configuration_identity_sha256 != CONFIGURATION_IDENTITY_SHA256
        or not identity.session_id
        or not identity.generation_id
        or not identity.segment_id
    ):
        raise PrototypeError("invalid-segment")


def _send(connection: _WorkerConnection, message: WorkerMessage) -> None:
    try:
        connection.send(message)
    except (BrokenPipeError, EOFError, OSError):
        raise SystemExit(1) from None


def _framework_peak(torch: Any) -> int:
    value = torch.cuda.max_memory_reserved()
    if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
        raise PrototypeError("measurement")
    return value


def _worker_audio(
    model: Any,
    torch: Any,
    configuration: QwenWorkerConfiguration,
    segment: PrototypeSegment,
) -> AudioUnit:
    capture = DiagnosticCapture(
        forbidden_values=(segment.text, str(configuration.artifact_root)),
    )
    try:
        with capture:
            waveforms, sample_rate = model.generate_custom_voice(
                text=segment.text,
                language="Spanish",
                speaker=configuration.speaker,
                instruct=configuration.instruction,
                do_sample=configuration.do_sample,
                repetition_penalty=configuration.repetition_penalty,
                temperature=configuration.temperature,
                top_p=configuration.top_p,
                top_k=configuration.top_k,
                subtalker_dosample=configuration.subtalker_do_sample,
                subtalker_temperature=configuration.subtalker_temperature,
                subtalker_top_p=configuration.subtalker_top_p,
                subtalker_top_k=configuration.subtalker_top_k,
                max_new_tokens=configuration.max_new_tokens,
            )
            numpy = importlib.import_module("numpy")
            if (
                sample_rate != 24_000
                or not isinstance(waveforms, (list, tuple))
                or len(waveforms) != 1
            ):
                raise PrototypeError("invalid-output")
            waveform = numpy.asarray(waveforms[0], dtype=numpy.float32)
            if waveform.ndim != 1 or not bool(numpy.isfinite(waveform).all()):
                raise PrototypeError("invalid-output")
            sample_count = int(waveform.size)
            if sample_count <= 0 or sample_count > MAXIMUM_SAMPLE_FRAMES:
                raise PrototypeError("output-limit")
            payload = cast(bytes, waveform.tobytes(order="C"))
            if len(payload) != sample_count * 4 or len(payload) > MAXIMUM_AUDIO_BYTES:
                raise PrototypeError("output-limit")
    finally:
        observation = capture.observation()
        capture.discard()
    if observation.sensitive_value_observed:
        raise PrototypeError("privacy")
    return AudioUnit(
        identity=segment.identity,
        sample_count=sample_count,
        sample_rate_hz=24_000,
        channels=1,
        sample_format="float32",
        payload=payload,
    )


def _qwen_worker_main(
    configuration: QwenWorkerConfiguration,
    connection: _WorkerConnection,
) -> None:
    model: Any = None
    torch: Any = None
    try:
        if (
            metadata.version("qwen-tts") != "0.1.1"
            or metadata.version("torch") != "2.9.1+cu128"
            or os.environ.get("HF_HUB_OFFLINE") != "1"
            or os.environ.get("TRANSFORMERS_OFFLINE") != "1"
        ):
            raise PrototypeError("runtime")
        capture = DiagnosticCapture(forbidden_values=(str(configuration.artifact_root),))
        load_started = time.perf_counter_ns()
        try:
            with capture:
                torch = importlib.import_module("torch")
                qwen_tts = importlib.import_module("qwen_tts")
                if not torch.cuda.is_available() or not torch.cuda.is_bf16_supported():
                    raise PrototypeError("provider")
                torch.cuda.reset_peak_memory_stats()
                model = qwen_tts.Qwen3TTSModel.from_pretrained(
                    str(configuration.artifact_root),
                    device_map="cuda:0",
                    dtype=torch.bfloat16,
                    attn_implementation="sdpa",
                    local_files_only=True,
                )
        finally:
            observation = capture.observation()
            capture.discard()
        load_ns = time.perf_counter_ns() - load_started
        if observation.sensitive_value_observed:
            raise PrototypeError("privacy")
        setup_started = time.perf_counter_ns()
        speakers = tuple(cast(Sequence[str], model.get_supported_speakers()))
        if configuration.speaker.casefold() not in {speaker.casefold() for speaker in speakers}:
            raise PrototypeError("configuration")
        setup_ns = time.perf_counter_ns() - setup_started
        _send(connection, ("ready", load_ns, setup_ns, _framework_peak(torch)))

        while True:
            message = cast(WorkerMessage, connection.recv())
            if message == ("close",):
                cleanup_started = time.perf_counter_ns()
                peak = _framework_peak(torch)
                model = None
                gc.collect()
                torch.cuda.empty_cache()
                _send(
                    connection,
                    ("closed", time.perf_counter_ns() - cleanup_started, peak),
                )
                break
            if len(message) != 2 or message[0] != "generate":
                raise PrototypeError("command")
            segment = message[1]
            if not isinstance(segment, PrototypeSegment):
                raise PrototypeError("command")
            _validate_segment(segment)
            _send(connection, ("accepted", segment.identity))
            unit = _worker_audio(model, torch, configuration, segment)
            peak = _framework_peak(torch)
            _send(connection, ("audio", unit, peak))
    except (EOFError, OSError):
        pass
    except PrototypeError as error:
        with suppress(Exception):
            _send(connection, ("error", error.code))
    except Exception:
        with suppress(Exception):
            _send(connection, ("error", "worker-failed"))
    finally:
        model = None
        if torch is not None:
            with suppress(Exception):
                gc.collect()
                torch.cuda.empty_cache()
        with suppress(Exception):
            connection.close()


class SpawnedQwenPrototypeWorker:
    """One resident Qwen model behind a hard-terminable spawned process."""

    def __init__(
        self,
        configuration: QwenWorkerConfiguration,
        *,
        context: SpawnContext | None = None,
        framework_memory_observer: Callable[[int | None], None] | None = None,
    ) -> None:
        self._configuration = configuration
        self._context = context or multiprocessing.get_context("spawn")
        self._framework_memory_observer = framework_memory_observer
        self._process: BaseProcess | None = None
        self._connection: _WorkerConnection | None = None
        self._active: WorkIdentity | None = None

    def _receive(self, timeout_ns: int) -> WorkerMessage:
        connection = self._connection
        if connection is None:
            raise PrototypeError("worker-state")
        try:
            if not connection.poll(timeout_ns / 1_000_000_000):
                raise PrototypeError("timeout")
            message = cast(WorkerMessage, connection.recv())
        except PrototypeError:
            raise
        except (EOFError, OSError):
            raise PrototypeError("worker-failed") from None
        if not message:
            raise PrototypeError("worker-failed")
        if message[0] == "error":
            code = (
                message[1] if len(message) == 2 and isinstance(message[1], str) else "worker-failed"
            )
            raise PrototypeError(code)
        return message

    def _observe_peak(self, value: object) -> int:
        if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
            raise PrototypeError("measurement")
        observer = self._framework_memory_observer
        if observer is not None:
            observer(value)
        return value

    def start(self) -> WorkerReady:
        if self._process is not None:
            raise PrototypeError("worker-state")
        parent, child = self._context.Pipe(duplex=True)
        process = self._context.Process(
            target=_qwen_worker_main,
            args=(self._configuration, child),
            name="voxleaf-tts-incremental-prototype-worker",
        )
        process.start()
        child.close()
        self._connection = cast(_WorkerConnection, parent)
        self._process = process
        message = self._receive(MAXIMUM_LOAD_NS + MAXIMUM_SETUP_NS)
        if len(message) != 4 or message[0] != "ready":
            raise PrototypeError("worker-ready")
        load_ns, setup_ns = message[1], message[2]
        if (
            not isinstance(load_ns, int)
            or isinstance(load_ns, bool)
            or not 0 < load_ns <= MAXIMUM_LOAD_NS
            or not isinstance(setup_ns, int)
            or isinstance(setup_ns, bool)
            or not 0 <= setup_ns <= MAXIMUM_SETUP_NS
        ):
            raise PrototypeError("worker-ready")
        return WorkerReady(
            load_ns=load_ns,
            configuration_setup_ns=setup_ns,
            framework_vram_bytes=self._observe_peak(message[3]),
        )

    def submit(self, segment: PrototypeSegment) -> None:
        _validate_segment(segment)
        if self._connection is None or self._active is not None:
            raise PrototypeError("worker-state")
        self._connection.send(("generate", segment))
        message = self._receive(MAXIMUM_SETUP_NS)
        if message != ("accepted", segment.identity):
            raise PrototypeError("worker-accepted")
        self._active = segment.identity

    def receive_audio(self) -> AudioUnit:
        message = self._receive(MAXIMUM_GENERATION_NS)
        if len(message) != 3 or message[0] != "audio" or not isinstance(message[1], AudioUnit):
            raise PrototypeError("invalid-output")
        unit = message[1]
        if self._active is None or unit.identity != self._active:
            raise PrototypeError("stale-output")
        self._active = None
        self._observe_peak(message[2])
        return unit

    def audio_ready(self) -> bool:
        connection = self._connection
        return connection is not None and connection.poll(0)

    def _dispose(self, *, terminate: bool) -> WorkerStop:
        started = time.perf_counter_ns()
        process = self._process
        connection = self._connection
        self._process = None
        self._connection = None
        self._active = None
        if connection is not None:
            with suppress(Exception):
                connection.close()
        if process is None:
            return WorkerStop(elapsed_ns=0, exited=True)
        pid = process.pid
        if terminate and process.is_alive() and pid is not None:
            if os.name == "nt":
                with suppress(Exception):
                    subprocess.run(
                        ("taskkill", "/PID", str(pid), "/T", "/F"),
                        check=False,
                        capture_output=True,
                        timeout=MAXIMUM_TERMINATION_NS / 1_000_000_000,
                        creationflags=0x08000000,
                    )
            process.join(MAXIMUM_TERMINATION_NS / 1_000_000_000)
        if process.is_alive():
            process.kill()
            process.join(MAXIMUM_TERMINATION_NS / 1_000_000_000)
        exited = not process.is_alive()
        if exited:
            process.close()
        return WorkerStop(
            elapsed_ns=time.perf_counter_ns() - started,
            exited=exited,
        )

    def terminate(self) -> WorkerStop:
        return self._dispose(terminate=True)

    def close(self) -> WorkerStop:
        connection = self._connection
        process = self._process
        if connection is None or process is None:
            return self._dispose(terminate=True)
        started = time.perf_counter_ns()
        try:
            connection.send(("close",))
            message = self._receive(MAXIMUM_CLEANUP_NS)
            if len(message) != 3 or message[0] != "closed":
                raise PrototypeError("cleanup")
            self._observe_peak(message[2])
            process.join(MAXIMUM_CLEANUP_NS / 1_000_000_000)
            if process.is_alive():
                raise PrototypeError("cleanup")
        finally:
            stop = self._dispose(terminate=True)
        return WorkerStop(
            elapsed_ns=max(time.perf_counter_ns() - started, stop.elapsed_ns),
            exited=stop.exited,
        )


type WorkerFactory = Callable[[], PrototypeWorker]
type Sleeper = Callable[[float], None]


def _identity(label: str, sequence: int) -> WorkIdentity:
    return WorkIdentity(
        session_id=f"session-{label}",
        generation_id=f"generation-{label}-{sequence}",
        segment_id=f"segment-{label}-{sequence}",
        candidate_id=CANDIDATE_ID,
        configuration_identity_sha256=CONFIGURATION_IDENTITY_SHA256,
    )


def _segment(corpus: BenchmarkCorpus, case_id: str, label: str, sequence: int) -> PrototypeSegment:
    case = corpus.cases.get(case_id)
    if case is None:
        raise PrototypeError("corpus")
    segment = PrototypeSegment(
        identity=_identity(label, sequence),
        case_id=case.case_id,
        text=case.text,
    )
    _validate_segment(segment)
    return segment


def _resources_released(
    sampler: ProcessResourceSampler,
    root_pid: int,
) -> bool:
    sample = sampler.sample(root_pid)
    return (
        sample.process_tree_ram_bytes == 0
        and sample.process_tree_vram_bytes == 0
        and sample.gpu_provider_allocations == 0
    )


def _trial_result(
    *,
    trial_id: str,
    stop_mode: str,
    invalidation_ns: int,
    stop: WorkerStop | None,
    published_before: int,
    resources_released: bool,
    extra_pass: bool = True,
) -> dict[str, object]:
    termination_ns = stop.elapsed_ns if stop is not None else None
    worker_exited = stop.exited if stop is not None else True
    passed = (
        invalidation_ns <= MAXIMUM_INVALIDATION_NS
        and (termination_ns is None or termination_ns <= MAXIMUM_TERMINATION_NS)
        and worker_exited
        and resources_released
        and extra_pass
    )
    return {
        "trialId": trial_id,
        "passed": passed,
        "stopMode": stop_mode,
        "identityInvalidationNanoseconds": invalidation_ns,
        "workerTerminationNanoseconds": termination_ns,
        "cleanupNanoseconds": termination_ns or 0,
        "publishedUnitsBeforeCancellation": published_before,
        "stalePublishedUnits": 0,
        "workerExited": worker_exited,
        "processResourcesReleased": resources_released,
    }


def execute_prototype(
    *,
    commit_sha: str,
    host: HostSnapshot,
    corpus: BenchmarkCorpus,
    worker_factory: WorkerFactory,
    memory_probe: PrototypeMemoryProbe,
    resource_sampler: ProcessResourceSampler,
    sleeper: Sleeper = time.sleep,
    root_pid: int | None = None,
) -> dict[str, object]:
    """Execute the frozen topology and return only schema-safe evidence."""

    _authority()
    owner_pid = root_pid or os.getpid()
    gate = _IdentityGate()
    queue = _OneUnitQueue()
    ready_observations: list[WorkerReady] = []
    cleanup_observations: list[int] = []
    trials: list[dict[str, object]] = []
    normal_units = 0
    released_units = 0
    first_audio_ns = 0
    memory_probe.start()
    try:
        normal = worker_factory()
        ready_observations.append(normal.start())
        normal_started = time.perf_counter_ns()
        for sequence, case_id in enumerate(
            ("es-punctuation-dialogue-short", "es-narrative-target"),
            start=1,
        ):
            segment = _segment(corpus, case_id, "normal", sequence)
            gate.activate(segment.identity)
            normal.submit(segment)
            unit = normal.receive_audio()
            if not gate.accepts(unit):
                raise PrototypeError("stale-output")
            queue.publish(unit)
            normal_units += 1
            if first_audio_ns == 0:
                first_audio_ns = time.perf_counter_ns() - normal_started
            queue.release()
            released_units += 1
            gate.invalidate()
        normal_stop = normal.close()
        cleanup_observations.append(normal_stop.elapsed_ns)
        if not normal_stop.exited or not queue.empty:
            raise PrototypeError("cleanup")

        before_identity = _identity("before-dispatch", 1)
        gate.activate(before_identity)
        invalidation_started = time.perf_counter_ns()
        gate.invalidate()
        invalidation_ns = time.perf_counter_ns() - invalidation_started
        trials.append(
            _trial_result(
                trial_id="before-dispatch",
                stop_mode="identity-invalidation",
                invalidation_ns=invalidation_ns,
                stop=None,
                published_before=0,
                resources_released=_resources_released(resource_sampler, owner_pid),
            )
        )

        accepted = worker_factory()
        ready_observations.append(accepted.start())
        accepted_segment = _segment(corpus, "es-narrative-target", "accepted", 1)
        gate.activate(accepted_segment.identity)
        accepted.submit(accepted_segment)
        invalidation_started = time.perf_counter_ns()
        gate.invalidate()
        invalidation_ns = time.perf_counter_ns() - invalidation_started
        accepted_stop = accepted.terminate()
        cleanup_observations.append(accepted_stop.elapsed_ns)
        for late in accepted_stop.late_units:
            if gate.accepts(late):
                raise PrototypeError("stale-output")
        trials.append(
            _trial_result(
                trial_id="accepted-before-audio",
                stop_mode="worker-process-termination",
                invalidation_ns=invalidation_ns,
                stop=accepted_stop,
                published_before=0,
                resources_released=_resources_released(resource_sampler, owner_pid),
            )
        )

        after_first = worker_factory()
        ready_observations.append(after_first.start())
        first = _segment(corpus, "es-punctuation-dialogue-short", "after-first", 1)
        gate.activate(first.identity)
        after_first.submit(first)
        first_unit = after_first.receive_audio()
        if not gate.accepts(first_unit):
            raise PrototypeError("stale-output")
        queue.publish(first_unit)
        queue.release()
        gate.invalidate()
        second = _segment(corpus, "es-narrative-target", "after-first", 2)
        gate.activate(second.identity)
        after_first.submit(second)
        invalidation_started = time.perf_counter_ns()
        gate.invalidate()
        invalidation_ns = time.perf_counter_ns() - invalidation_started
        after_first_stop = after_first.terminate()
        cleanup_observations.append(after_first_stop.elapsed_ns)
        for late in after_first_stop.late_units:
            if gate.accepts(late):
                raise PrototypeError("stale-output")
        trials.append(
            _trial_result(
                trial_id="after-first-audio",
                stop_mode="worker-process-termination",
                invalidation_ns=invalidation_ns,
                stop=after_first_stop,
                published_before=1,
                resources_released=_resources_released(resource_sampler, owner_pid),
            )
        )

        near_hard = worker_factory()
        ready_observations.append(near_hard.start())
        near_hard_segment = _segment(corpus, "es-narrative-target", "near-hard", 1)
        gate.activate(near_hard_segment.identity)
        near_hard.submit(near_hard_segment)
        sleeper(NEAR_HARD_DELAY_NS / 1_000_000_000)
        completed_before_boundary = near_hard.audio_ready()
        invalidation_started = time.perf_counter_ns()
        gate.invalidate()
        invalidation_ns = time.perf_counter_ns() - invalidation_started
        near_hard_stop = near_hard.terminate()
        cleanup_observations.append(near_hard_stop.elapsed_ns)
        for late in near_hard_stop.late_units:
            if gate.accepts(late):
                raise PrototypeError("stale-output")
        trials.append(
            _trial_result(
                trial_id="near-hard-mid-generation",
                stop_mode="worker-process-termination",
                invalidation_ns=invalidation_ns,
                stop=near_hard_stop,
                published_before=0,
                resources_released=_resources_released(resource_sampler, owner_pid),
                extra_pass=not completed_before_boundary,
            )
        )

        cleanup_worker = worker_factory()
        ready_observations.append(cleanup_worker.start())
        cleanup_segment = _segment(corpus, "es-narrative-target", "cleanup", 1)
        gate.activate(cleanup_segment.identity)
        cleanup_worker.submit(cleanup_segment)
        invalidation_started = time.perf_counter_ns()
        gate.invalidate()
        invalidation_ns = time.perf_counter_ns() - invalidation_started
        cleanup_stop = cleanup_worker.terminate()
        cleanup_observations.append(cleanup_stop.elapsed_ns)
        for late in cleanup_stop.late_units:
            if gate.accepts(late):
                raise PrototypeError("stale-output")
        trials.append(
            _trial_result(
                trial_id="during-cleanup",
                stop_mode="worker-process-termination",
                invalidation_ns=invalidation_ns,
                stop=cleanup_stop,
                published_before=0,
                resources_released=_resources_released(resource_sampler, owner_pid),
            )
        )
    finally:
        memory = memory_probe.stop()

    if len(ready_observations) != 5 or first_audio_ns <= 0:
        raise PrototypeError("observation")
    peak_vram = max(
        memory.peak_process_vram_bytes or 0,
        memory.peak_framework_vram_bytes or 0,
    )
    cleanup_sample = resource_sampler.sample(owner_pid)
    trial_ids = tuple(cast(str, trial["trialId"]) for trial in trials)
    failure_codes: list[str] = []
    if normal_units != 2 or released_units != 2:
        failure_codes.append("incremental-delivery")
    if any(trial["passed"] is not True for trial in trials) or trial_ids != TRIAL_ORDER:
        failure_codes.append("cancellation")
    if max(cleanup_observations, default=0) > MAXIMUM_CLEANUP_NS:
        failure_codes.append("cleanup")
    if memory.peak_process_tree_ram_bytes > MAXIMUM_PEAK_RAM_BYTES:
        failure_codes.append("ram")
    if peak_vram > MAXIMUM_PEAK_VRAM_BYTES:
        failure_codes.append("vram")
    if (
        cleanup_sample.process_tree_ram_bytes != 0
        or cleanup_sample.process_tree_vram_bytes != 0
        or cleanup_sample.gpu_provider_allocations != 0
    ):
        failure_codes.append("cleanup-resources")
    result = {
        "schemaVersion": "incremental-cancellation-prototype-result-v1",
        "prototypeVersion": "incremental-cancellation-prototype-v1",
        "candidateId": CANDIDATE_ID,
        "profileSha256": PROFILE_SHA256,
        "configurationIdentitySha256": CONFIGURATION_IDENTITY_SHA256,
        "commitSha": commit_sha,
        "host": {
            "operatingSystem": host.operating_system,
            "osVersion": host.os_version,
            "architecture": host.architecture,
            "pythonVersion": host.python_version,
            "cpuModel": host.cpu_model,
            "logicalProcessors": host.logical_processors,
            "totalRamBytes": host.total_ram_bytes,
            "gpuModel": host.gpu_model,
            "driverVersion": host.driver_version,
        },
        "topology": {
            "nativeGenerationGranularity": "complete-waveform",
            "publishedUnitGranularity": "complete-narration-segment",
            "stopMode": "worker-process-termination",
            "normalDeliveryUnits": normal_units,
            "normalDeliveryUnitsReleased": released_units,
            "peakQueuedSegments": 1,
            "peakPublishedQueueUnits": queue.peak_units,
            "peakRetainedControllerAudioBytes": queue.peak_bytes,
        },
        "timingNanoseconds": {
            "coldLoad": max(ready.load_ns for ready in ready_observations),
            "configurationSetup": max(ready.configuration_setup_ns for ready in ready_observations),
            "firstProducedAudio": first_audio_ns,
        },
        "trials": trials,
        "memory": {
            "ramSamplingIntervalMilliseconds": memory.ram_sampling_interval_milliseconds,
            "vramSamplingIntervalMilliseconds": (
                memory.process_vram_sampling_interval_milliseconds
            ),
            "peakProcessTreeRamBytes": memory.peak_process_tree_ram_bytes,
            "peakProcessTreeVramBytes": memory.peak_process_vram_bytes,
            "peakFrameworkVramBytes": memory.peak_framework_vram_bytes,
        },
        "cleanup": {
            "maximumCleanupNanoseconds": max(cleanup_observations, default=0),
            "postCleanupProcessTreeRamBytes": cleanup_sample.process_tree_ram_bytes,
            "postCleanupProcessTreeVramBytes": cleanup_sample.process_tree_vram_bytes,
            "workerProcessesRemaining": (
                0
                if cleanup_sample.process_tree_ram_bytes == 0
                and cleanup_sample.gpu_provider_allocations == 0
                else 1
            ),
            "rawSessionCreated": False,
            "rawSessionRemoved": True,
        },
        "passed": not failure_codes,
        "failureCodes": failure_codes,
        "limitations": [
            "complete-waveform-per-segment",
            "worker-termination-not-cooperative-model-cancellation",
            "development-prototype-not-production-runtime",
            "exact-host-only",
        ],
    }
    return result


def run_prototype(
    request: PrototypeRunRequest,
    *,
    worker_builder: Callable[
        [QwenWorkerConfiguration, FrameworkVramTracker],
        PrototypeWorker,
    ]
    | None = None,
) -> dict[str, object]:
    """Preflight and execute the exact hardware-backed prototype."""

    _authority()
    candidate_profile, worker_configuration = _candidate_profile_and_worker_configuration(
        request.artifact_root.resolve()
    )
    configuration = CandidateConfiguration(
        candidate_id=CANDIDATE_ID,
        artifact_root=request.artifact_root,
        model_revision=candidate_profile.model_revision,
        voice_id=candidate_profile.voice_id,
        provider=candidate_profile.provider,
        precision=candidate_profile.precision,
        offline=True,
    )
    receipt = run_local_preflight(
        PreflightRequest(
            expected_commit_sha=request.expected_commit_sha,
            repository_root=REPOSITORY_ROOT,
            profile=candidate_profile,
            configuration=configuration,
            candidate_python=request.candidate_python,
            conditions=RunConditions(
                purpose="official",
                sleep_disabled=request.sleep_disabled,
                background_load_acceptable=request.background_load_acceptable,
                thermal_state_acceptable=request.thermal_state_acceptable,
            ),
        )
    )
    if receipt.failures or not receipt.eligible_for_official_run:
        raise PrototypeError("preflight")
    corpus = load_corpus(CORPUS_PATH)
    tracker = FrameworkVramTracker()
    gpu_sampler = WindowsGpuProcessMemorySampler()
    sampler = WindowsProcessResourceSampler(vram_sampler=gpu_sampler)
    memory_probe = ProcessTreeMemoryProbe(
        root_pid=os.getpid(),
        sampler=sampler,
        require_vram=True,
        process_vram_sampling_interval_milliseconds=(PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS),
        framework_vram_tracker=tracker,
    )

    def build_worker() -> PrototypeWorker:
        if worker_builder is not None:
            return worker_builder(worker_configuration, tracker)
        return SpawnedQwenPrototypeWorker(
            worker_configuration,
            framework_memory_observer=tracker.observe,
        )

    try:
        return execute_prototype(
            commit_sha=request.expected_commit_sha,
            host=receipt.host,
            corpus=corpus,
            worker_factory=build_worker,
            memory_probe=memory_probe,
            resource_sampler=sampler,
        )
    finally:
        gpu_sampler.close()


def candidate_interpreter_matches(path: Path) -> bool:
    try:
        return Path(sys.executable).resolve() == path.resolve(strict=True)
    except OSError:
        return False
