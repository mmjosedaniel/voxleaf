"""Bounded spawned-process isolation for benchmark adapters."""

from __future__ import annotations

import multiprocessing
import os
import secrets
import signal
import subprocess
import time
from collections.abc import Callable, Iterator, Sequence
from contextlib import suppress
from dataclasses import dataclass
from multiprocessing.context import SpawnContext
from multiprocessing.process import BaseProcess
from threading import RLock
from typing import Final, Literal, Protocol, cast

from benchmarks.batch_contracts import (
    BatchAudioUnit,
    BatchBenchmarkError,
    BatchCandidate,
    BatchGenerationRequest,
    BatchWorkIdentity,
)
from benchmarks.batch_execution import _validate_request
from benchmarks.contracts import (
    AdapterCapabilities,
    AdapterFactory,
    AdapterOperationError,
    AdapterPlacementEvidence,
    AudioChunk,
    BenchmarkAdapter,
    CancellationResponse,
    FailureCode,
    GenerationRequest,
)
from benchmarks.diagnostics import DiagnosticCapture

MAX_WORKER_CHUNKS: Final = 4_096
MAX_WORKER_SAMPLE_FRAMES: Final = 115_200_000
DEFAULT_LOAD_TIMEOUT_SECONDS: Final = 120.0
DEFAULT_REQUEST_TIMEOUT_SECONDS: Final = 120.0
DEFAULT_TERMINATION_TIMEOUT_SECONDS: Final = 2.0
DEFAULT_CLEANUP_TIMEOUT_SECONDS: Final = 5.0

type _Message = tuple[object, ...]
type BatchWitnessPhase = Literal["worker-accepted", "adapter-entry"]


@dataclass(frozen=True)
class WitnessedBatchCancellation:
    phase: BatchWitnessPhase
    identity: BatchWorkIdentity
    call_index: int
    termination_nanoseconds: int


class _WorkerConnection(Protocol):
    def send(self, obj: object) -> None: ...

    def recv(self) -> object: ...

    def poll(self, timeout: float = 0.0) -> bool: ...

    def close(self) -> None: ...


def _send(connection: _WorkerConnection, message: _Message) -> None:
    try:
        connection.send(message)
    except (BrokenPipeError, EOFError, OSError):
        raise SystemExit(1) from None


def _failure_for(command: str) -> FailureCode:
    failures: dict[str, FailureCode] = {
        "load": "load-failed",
        "warmup": "warmup-failed",
        "generate": "generation-failed",
        "close": "cleanup-failed",
    }
    return failures.get(command, "invalid-request")


def _framework_peak(adapter: BenchmarkAdapter) -> int | None:
    try:
        value = adapter.framework_memory_high_water_bytes()
    except Exception:
        raise AdapterOperationError("measurement-unavailable") from None
    if value is not None and (not isinstance(value, int) or isinstance(value, bool) or value < 0):
        raise AdapterOperationError("measurement-unavailable")
    return value


def _placement_evidence(adapter: BenchmarkAdapter) -> AdapterPlacementEvidence | None:
    reader = getattr(adapter, "placement_evidence", None)
    if reader is None:
        return None
    if not callable(reader):
        raise AdapterOperationError("load-failed")
    value = cast(object, reader())
    if value is not None and not isinstance(value, AdapterPlacementEvidence):
        raise AdapterOperationError("load-failed")
    return value


def _witness_batch(
    adapter: BenchmarkAdapter,
    connection: _WorkerConnection,
    request: BatchGenerationRequest,
    deadline: float,
) -> _Message:
    if request.phase != "cancellation" or len(request.units) != 2:
        raise AdapterOperationError("invalid-request")
    try:
        _validate_request(request)
    except BatchBenchmarkError:
        raise AdapterOperationError("invalid-request") from None
    generate = getattr(adapter, "generate_batch_with_entry_witness", None)
    if not callable(generate):
        return ("error", "adapter-unavailable")
    identity = (request.identity, request.call_index)

    def announce(message: _Message) -> object:
        _send(connection, message)
        remaining = deadline - time.monotonic()
        if remaining <= 0 or not connection.poll(remaining):
            raise AdapterOperationError("timeout")
        return connection.recv()

    release = announce(("worker-accepted", *identity))
    if (
        not isinstance(release, tuple)
        or len(release) != 4
        or release[:3] != ("enter-adapter", *identity)
        or not isinstance(release[3], bytes)
        or len(release[3]) != 16
    ):
        return ("error", "invalid-request")

    def entered() -> None:
        announce(("adapter-entry", *identity, release[3]))
        raise AdapterOperationError("invalid-request")

    generate(request, entered)
    return ("error", "invalid-output")


def _worker_command(
    adapter: BenchmarkAdapter,
    connection: _WorkerConnection,
    message: _Message,
    forbidden_values: Sequence[str],
) -> bool:
    if not message or not isinstance(message[0], str):
        _send(connection, ("error", "invalid-request"))
        return False
    command = message[0]
    request: GenerationRequest | None = None
    batch_request: BatchGenerationRequest | None = None
    if command in ("warmup", "generate"):
        if len(message) != 2 or not isinstance(message[1], GenerationRequest):
            _send(connection, ("error", "invalid-request"))
            return False
        request = message[1]
    elif command in ("generate-batch", "witness-batch"):
        expected_length = 3 if command == "witness-batch" else 2
        if len(message) != expected_length or not isinstance(message[1], BatchGenerationRequest):
            _send(connection, ("error", "invalid-request"))
            return False
        batch_request = message[1]
    capture = DiagnosticCapture(
        forbidden_values=(
            *forbidden_values,
            *((request.text,) if request is not None else ()),
            *(
                tuple(unit.text for unit in batch_request.units)
                if batch_request is not None
                else ()
            ),
        )
    )
    try:
        with capture:
            if command == "load":
                adapter.load()
                response: _Message = (
                    "ok",
                    _framework_peak(adapter),
                    _placement_evidence(adapter),
                )
            elif command == "warmup" and request is not None:
                adapter.warm_up(request)
                response = ("ok", _framework_peak(adapter))
            elif command == "generate" and request is not None:
                sample_frames = 0
                for chunk_count, chunk in enumerate(adapter.generate(request), start=1):
                    sample_frames += chunk.sample_count
                    if chunk_count > MAX_WORKER_CHUNKS or sample_frames > MAX_WORKER_SAMPLE_FRAMES:
                        with suppress(Exception):
                            adapter.cancel(request.request_id)
                        _send(connection, ("error", "resource-limit"))
                        return False
                    _send(connection, ("chunk", chunk))
                response = ("done", _framework_peak(adapter))
            elif command == "witness-batch" and batch_request is not None:
                deadline = message[2]
                if not isinstance(deadline, float):
                    raise AdapterOperationError("invalid-request")
                response = _witness_batch(adapter, connection, batch_request, deadline)
            elif command == "generate-batch" and batch_request is not None:
                outputs = tuple(cast(BatchCandidate, adapter).generate_batch(batch_request))
                if len(outputs) not in (1, 2) or len(outputs) != len(batch_request.units):
                    response = ("error", "invalid-output")
                else:
                    response = ("batch", outputs, _framework_peak(adapter))
            elif command == "close":
                peak = _framework_peak(adapter)
                adapter.close()
                response = ("ok", peak)
            else:
                response = ("error", "invalid-request")
    except AdapterOperationError as error:
        response = ("error", error.code)
    except Exception:
        response = ("error", _failure_for(command))
    observation = capture.observation()
    capture.discard()
    if observation.sensitive_value_observed:
        _send(connection, ("error", "privacy"))
        return False
    _send(connection, response)
    return command != "close" and response[0] != "error"


def _worker_main(
    adapter_factory: AdapterFactory,
    connection: _WorkerConnection,
    forbidden_values: tuple[str, ...],
) -> None:
    if os.name != "nt":
        setsid = cast(Callable[[], int] | None, os.__dict__.get("setsid"))
        if setsid is not None:
            with suppress(OSError):
                setsid()
    try:
        adapter = adapter_factory()
        while True:
            try:
                message = cast(_Message, connection.recv())
            except (EOFError, OSError):
                break
            if not _worker_command(adapter, connection, message, forbidden_values):
                break
    except Exception:
        with suppress(Exception):
            _send(connection, ("error", "crash"))
    finally:
        with suppress(Exception):
            connection.close()


def _fixed_failure(value: object) -> FailureCode:
    allowed: tuple[FailureCode, ...] = (
        "invalid-request",
        "adapter-unavailable",
        "load-failed",
        "warmup-failed",
        "generation-failed",
        "timeout",
        "crash",
        "resource-limit",
        "invalid-output",
        "privacy",
        "cancellation-failed",
        "cleanup-failed",
        "measurement-unavailable",
    )
    if value not in allowed:
        return "crash"
    return value


@dataclass(frozen=True)
class IsolationTimeouts:
    load_seconds: float = DEFAULT_LOAD_TIMEOUT_SECONDS
    request_seconds: float = DEFAULT_REQUEST_TIMEOUT_SECONDS
    termination_seconds: float = DEFAULT_TERMINATION_TIMEOUT_SECONDS
    cleanup_seconds: float = DEFAULT_CLEANUP_TIMEOUT_SECONDS

    def __post_init__(self) -> None:
        if (
            min(
                self.load_seconds,
                self.request_seconds,
                self.termination_seconds,
                self.cleanup_seconds,
            )
            <= 0
        ):
            raise ValueError("tts-benchmark-isolation:invalid-timeout")


class _ProcessGeneration(Iterator[AudioChunk]):
    def __init__(self, owner: IsolatedBenchmarkAdapter, request_id: str, deadline: float) -> None:
        self._owner = owner
        self._request_id = request_id
        self._complete = False
        self._deadline = deadline
        self.connection = owner._connection

    def require_current(self) -> None:
        if self._complete or self._owner._active_generation is not self:
            raise StopIteration

    def __iter__(self) -> _ProcessGeneration:
        return self

    def __next__(self) -> AudioChunk:
        self.require_current()
        if self._complete or self._owner.was_cancelled(self._request_id):
            raise StopIteration
        remaining = self._deadline - time.monotonic()
        if remaining <= 0:
            self._owner.abort("timeout")
        response = self._owner.receive(remaining, generation=self)
        self.require_current()
        if time.monotonic() > self._deadline:
            self._owner.abort("timeout")
        if response[0] == "chunk" and len(response) == 2:
            chunk = response[1]
            if isinstance(chunk, AudioChunk) and chunk.request_id == self._request_id:
                return chunk
            self._owner.abort("invalid-output")
        if response[0] == "done" and len(response) == 2:
            self._owner.observe_framework_peak(response[1])
            self._complete = True
            self._owner.finish_request(self._request_id)
            raise StopIteration
        self._owner.raise_response(response)
        raise AssertionError("unreachable")


@dataclass(frozen=True)
class _BatchAttempt:
    connection: _WorkerConnection


@dataclass(frozen=True)
class _LoadAttempt:
    owner: object
    connection: _WorkerConnection


class OfficialSafetyInterruption(Exception):
    """An official batch safety stop interrupted owned adapter work."""


class IsolatedBenchmarkAdapter:
    """Run one real adapter in a spawn-isolated, hard-terminable worker."""

    def __init__(
        self,
        adapter_factory: AdapterFactory,
        *,
        forbidden_values: Sequence[str],
        timeouts: IsolationTimeouts | None = None,
        context: SpawnContext | None = None,
        framework_memory_observer: Callable[[int | None], None] | None = None,
    ) -> None:
        self._adapter_factory = adapter_factory
        self._forbidden_values = tuple(forbidden_values)
        self.timeouts = timeouts or IsolationTimeouts()
        self._context = context or multiprocessing.get_context("spawn")
        self._framework_memory_observer = framework_memory_observer
        self._peak_framework_vram_bytes: int | None = None
        self._placement_evidence: AdapterPlacementEvidence | None = None
        self._capabilities = adapter_factory().capabilities()
        self._process: BaseProcess | None = None
        self._connection: _WorkerConnection | None = None
        self._loaded = False
        self._cleanup_pending = False
        self._cleanup_request_id: str | None = None
        self._cleanup_load_owner: object | None = None
        self._active_request_id: str | None = None
        self._active_generation: _ProcessGeneration | None = None
        self._active_batch: _BatchAttempt | None = None
        self._active_load: _LoadAttempt | None = None
        self._worker_lock = RLock()
        self._cancelled_request_ids: set[str] = set()

    @property
    def worker_pid(self) -> int | None:
        with self._worker_lock:
            process = self._process
            return process.pid if process is not None and process.is_alive() else None

    def capabilities(self) -> AdapterCapabilities:
        return self._capabilities

    @property
    def placement_evidence(self) -> AdapterPlacementEvidence | None:
        return self._placement_evidence

    def _start(self) -> None:
        if self._cleanup_pending:
            raise AdapterOperationError("cleanup-failed")
        if self._process is not None and self.worker_pid is None:
            self._terminate_worker()
        if self.worker_pid is not None:
            return
        parent, child = self._context.Pipe(duplex=True)
        process = self._context.Process(
            target=_worker_main,
            args=(self._adapter_factory, child, self._forbidden_values),
            name="voxleaf-tts-benchmark-worker",
        )
        process.start()
        child.close()
        self._connection = cast(_WorkerConnection, parent)
        self._process = process
        self._loaded = False
        self._placement_evidence = None

    def _send(self, message: _Message) -> None:
        connection = self._connection
        if connection is None or self.worker_pid is None:
            raise AdapterOperationError("crash")
        try:
            connection.send(message)
        except (BrokenPipeError, EOFError, OSError):
            self.abort("crash")

    def receive(
        self,
        timeout_seconds: float,
        *,
        generation: _ProcessGeneration | None = None,
        batch: _BatchAttempt | None = None,
        load: _LoadAttempt | None = None,
    ) -> _Message:
        if generation is not None:
            generation.require_current()
        connection = self._connection
        if generation is not None:
            connection = generation.connection
        if batch is not None:
            connection = batch.connection
        if load is not None:
            connection = load.connection
        if connection is None:
            raise AdapterOperationError("crash")
        try:
            ready = connection.poll(timeout_seconds)
            with self._worker_lock:
                if generation is not None:
                    generation.require_current()
                if batch is not None:
                    self._require_batch(batch)
                if load is not None:
                    self._require_load(load)
                if not ready:
                    self.abort("timeout")
            return cast(_Message, connection.recv())
        except (EOFError, OSError):
            with self._worker_lock:
                if generation is not None:
                    generation.require_current()
                if batch is not None:
                    self._require_batch(batch)
                if load is not None:
                    self._require_load(load)
                self.abort("crash")
        raise AssertionError("unreachable")

    def raise_response(self, response: _Message) -> None:
        if response and response[0] == "error":
            code = _fixed_failure(response[1] if len(response) == 2 else None)
            self.abort(code)
        self.abort("crash")

    def observe_framework_peak(self, value: object) -> None:
        if value is not None and (
            not isinstance(value, int) or isinstance(value, bool) or value < 0
        ):
            self.abort("measurement-unavailable")
        peak = cast(int | None, value)
        if peak is not None:
            self._peak_framework_vram_bytes = max(
                self._peak_framework_vram_bytes or 0,
                peak,
            )
        observer = self._framework_memory_observer
        if observer is not None:
            observer(peak)

    def _expect_ok(self, timeout_seconds: float) -> None:
        self._accept_ok(self.receive(timeout_seconds))

    def _accept_ok(self, response: _Message) -> None:
        if len(response) == 3 and response[0] == "ok":
            self.observe_framework_peak(response[1])
            evidence = response[2]
            if evidence is not None and not isinstance(evidence, AdapterPlacementEvidence):
                self.abort("load-failed")
            self._placement_evidence = cast(AdapterPlacementEvidence | None, evidence)
            return
        if len(response) == 2 and response[0] == "ok":
            self.observe_framework_peak(response[1])
            return
        if response != ("ok",):
            self.raise_response(response)

    def load(self) -> None:
        if self._loaded:
            raise AdapterOperationError("load-failed")
        self._start()
        self._send(("load",))
        self._expect_ok(self.timeouts.load_seconds)
        self._loaded = True

    def load_for_official(self, owner: object, should_stop: Callable[[], bool]) -> None:
        with self._worker_lock:
            if should_stop():
                raise OfficialSafetyInterruption()
            if self._loaded or self._active_load is not None or self._active_request_id is not None:
                raise AdapterOperationError("load-failed")
            self._start()
            connection = self._connection
            if connection is None:
                raise AdapterOperationError("crash")
            attempt = _LoadAttempt(owner, connection)
            self._active_load = attempt
        try:
            with self._worker_lock:
                self._require_load(attempt)
                if should_stop():
                    self._terminate_owned_worker()
                    raise OfficialSafetyInterruption()
                self._send(("load",))
            response = self.receive(self.timeouts.load_seconds, load=attempt)
            with self._worker_lock:
                self._require_load(attempt)
                if should_stop():
                    self._terminate_owned_worker()
                    raise OfficialSafetyInterruption()
                self._accept_ok(response)
                self._loaded = True
        finally:
            with self._worker_lock:
                if self._active_load is attempt:
                    self._active_load = None

    def _require_load(self, attempt: _LoadAttempt) -> None:
        if self._active_load is not attempt:
            raise OfficialSafetyInterruption()

    def abort_official_load(self, owner: object) -> None:
        if not self._worker_lock.acquire(timeout=self.timeouts.termination_seconds):
            raise AdapterOperationError("cleanup-failed")
        try:
            active = self._active_load
            if (active is not None and active.owner is owner) or self._cleanup_load_owner is owner:
                self._terminate_owned_worker()
        finally:
            self._worker_lock.release()

    def _ensure_loaded(self) -> None:
        if not self._loaded:
            self.load()

    def warm_up(self, request: GenerationRequest) -> None:
        self._ensure_loaded()
        self._send(("warmup", request))
        self._expect_ok(self.timeouts.request_seconds)

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        if self._active_request_id is not None or self.was_cancelled(request.request_id):
            raise AdapterOperationError("invalid-request")
        self._ensure_loaded()
        self._active_request_id = request.request_id
        deadline = time.monotonic() + self.timeouts.request_seconds
        generation = _ProcessGeneration(self, request.request_id, deadline)
        self._active_generation = generation
        self._send(("generate", request))
        return generation

    def generate_batch(
        self,
        request: BatchGenerationRequest,
        *,
        require_loaded: bool = False,
        should_stop: Callable[[], bool] | None = None,
    ) -> tuple[BatchAudioUnit, ...]:
        """Run one bounded complete-waveform batch in the isolated worker."""

        request_id = f"batch-{request.call_index}"
        with self._worker_lock:
            if should_stop is not None and should_stop():
                raise OfficialSafetyInterruption()
            if (
                self._active_load is not None
                or self._active_request_id is not None
                or self.was_cancelled(request_id)
            ):
                raise AdapterOperationError("invalid-request")
            needs_load = not self._loaded
            if needs_load:
                if require_loaded:
                    raise AdapterOperationError("invalid-request")
                self._start()
            connection = self._connection
            if connection is None:
                raise AdapterOperationError("crash")
            batch = _BatchAttempt(connection)
            self._active_batch = batch
            self._active_request_id = request_id
        try:
            if needs_load:
                with self._worker_lock:
                    self._require_batch(batch)
                    self._send(("load",))
                response = self.receive(self.timeouts.load_seconds, batch=batch)
                with self._worker_lock:
                    self._require_batch(batch)
                    self._accept_ok(response)
                    self._loaded = True
            with self._worker_lock:
                self._require_batch(batch)
                if should_stop is not None and should_stop():
                    raise OfficialSafetyInterruption()
                self._send(("generate-batch", request))
            response = self.receive(self.timeouts.request_seconds, batch=batch)
            with self._worker_lock:
                self._require_batch(batch)
                if len(response) == 3 and response[0] == "batch":
                    raw_outputs = response[1]
                    if not isinstance(raw_outputs, tuple) or not all(
                        isinstance(output, BatchAudioUnit) for output in raw_outputs
                    ):
                        self.abort("invalid-output")
                    self.observe_framework_peak(response[2])
                    return cast(tuple[BatchAudioUnit, ...], raw_outputs)
                self.raise_response(response)
                raise AssertionError("unreachable")
        finally:
            with self._worker_lock:
                if self._active_batch is batch:
                    self.finish_request(request_id)

    def generate_batch_for_official(
        self, request: BatchGenerationRequest, should_stop: Callable[[], bool]
    ) -> tuple[BatchAudioUnit, ...]:
        return self.generate_batch(request, require_loaded=True, should_stop=should_stop)

    def cancel_witnessed_batch(
        self,
        request: BatchGenerationRequest,
        phase: BatchWitnessPhase,
        should_stop: Callable[[], bool],
        invalidate: Callable[[], None],
    ) -> WitnessedBatchCancellation:
        """Own the private phase exchange and reap its exact parked worker."""

        request_id = f"batch-{request.call_index}"
        identity = (request.identity, request.call_index)
        deadline = time.monotonic() + self.timeouts.request_seconds
        with self._worker_lock:
            if should_stop():
                raise OfficialSafetyInterruption()
            if (
                not self._loaded
                or self._active_load is not None
                or self._active_request_id is not None
                or self.was_cancelled(request_id)
            ):
                raise AdapterOperationError("invalid-request")
            connection = self._connection
            if connection is None:
                raise AdapterOperationError("crash")
            batch = _BatchAttempt(connection)
            self._active_batch = batch
            self._active_request_id = request_id
        try:
            with self._worker_lock:
                self._require_batch(batch)
                if should_stop():
                    raise OfficialSafetyInterruption()
                self._send(("witness-batch", request, deadline))
            self._wait_batch_witness(batch, ("worker-accepted", *identity), deadline, should_stop)
            if phase == "adapter-entry":
                entry_token = secrets.token_bytes(16)
                with self._worker_lock:
                    self._require_parked_witness(batch, deadline, should_stop)
                    self._send(("enter-adapter", *identity, entry_token))
                self._wait_batch_witness(
                    batch, (phase, *identity, entry_token), deadline, should_stop
                )
            with self._worker_lock:
                self._require_parked_witness(batch, deadline, should_stop)
                invalidate()
                self._require_parked_witness(batch, deadline, should_stop)
                started = time.perf_counter_ns()
                self._cancelled_request_ids.add(request_id)
                signalled = self._terminate_owned_worker(parked=True)
                termination = time.perf_counter_ns() - started
                if should_stop():
                    raise OfficialSafetyInterruption()
                if time.monotonic() >= deadline:
                    raise AdapterOperationError("timeout")
                if not signalled:
                    raise AdapterOperationError("invalid-output")
                return WitnessedBatchCancellation(phase, *identity, termination)
        except BaseException:
            with self._worker_lock:
                if self._active_batch is batch:
                    self._cleanup_pending = True
                    self._cleanup_request_id = request_id
                    self._loaded = False
            raise
        finally:
            with self._worker_lock:
                if self._active_batch is batch:
                    self.finish_request(request_id)

    def _require_parked_witness(
        self, batch: _BatchAttempt, deadline: float, should_stop: Callable[[], bool]
    ) -> None:
        self._require_batch(batch)
        if should_stop():
            raise OfficialSafetyInterruption()
        if time.monotonic() >= deadline:
            raise AdapterOperationError("timeout")
        if self.worker_pid is None or batch.connection.poll(0):
            raise AdapterOperationError("invalid-output")

    def _wait_batch_witness(
        self,
        batch: _BatchAttempt,
        expected: _Message,
        deadline: float,
        should_stop: Callable[[], bool],
    ) -> None:
        while True:
            if should_stop():
                raise OfficialSafetyInterruption()
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                raise AdapterOperationError("timeout")
            try:
                if not batch.connection.poll(min(0.05, remaining)):
                    continue
                with self._worker_lock:
                    self._require_batch(batch)
                    response = cast(_Message, batch.connection.recv())
            except (EOFError, OSError):
                raise AdapterOperationError("crash") from None
            if response != expected:
                code = (
                    _fixed_failure(response[1])
                    if isinstance(response, tuple) and len(response) == 2 and response[0] == "error"
                    else "invalid-output"
                )
                raise AdapterOperationError(code)
            return

    def _require_batch(self, batch: _BatchAttempt) -> None:
        if self._active_batch is not batch:
            raise AdapterOperationError("invalid-request")

    def was_cancelled(self, request_id: str) -> bool:
        return request_id in self._cancelled_request_ids

    def finish_request(self, request_id: str) -> None:
        if self._active_request_id == request_id:
            self._active_request_id = None
            self._active_generation = None
            self._active_batch = None

    def cancel(self, request_id: str, *, cancel_idle: bool = False) -> CancellationResponse:
        with self._worker_lock:
            already_cancelled = self.was_cancelled(request_id)
            self._cancelled_request_ids.add(request_id)
            if (
                self._active_request_id == request_id
                or self._cleanup_request_id == request_id
                or (
                    cancel_idle
                    and not already_cancelled
                    and self._active_request_id is None
                    and self._active_load is None
                    and not self._cleanup_pending
                )
            ):
                self._cleanup_request_id = request_id
                self._terminate_worker()
        return CancellationResponse(acknowledged=True, stop_mode="worker-termination")

    def framework_memory_high_water_bytes(self) -> int | None:
        return self._peak_framework_vram_bytes

    def abort(self, code: FailureCode) -> None:
        self._terminate_worker()
        raise AdapterOperationError(code)

    def _terminate_worker(self) -> None:
        with self._worker_lock:
            self._terminate_owned_worker()

    def _terminate_owned_worker(self, *, parked: bool = False) -> bool:
        process = self._process
        connection = self._connection
        signalled = False
        self._cleanup_pending = True
        if self._active_request_id is not None:
            self._cleanup_request_id = self._active_request_id
        if self._active_load is not None:
            self._cleanup_load_owner = self._active_load.owner
        self._loaded = False
        self._placement_evidence = None
        self._active_request_id = None
        self._active_generation = None
        self._active_batch = None
        self._active_load = None
        try:
            # Preserve the witness barrier until reaping; EOF can otherwise let the
            # child leave the barrier before an actual cancellation signal.
            if connection is not None and (not parked or process is None):
                connection.close()
                self._connection = None
            if process is None:
                self._cleanup_pending = False
                self._cleanup_request_id = None
                self._cleanup_load_owner = None
                return False
            pid = process.pid
            if process.is_alive() and pid is not None:
                if os.name == "nt":
                    with suppress(Exception):
                        result = subprocess.run(
                            ("taskkill", "/PID", str(pid), "/T", "/F"),
                            check=False,
                            capture_output=True,
                            timeout=self.timeouts.termination_seconds,
                            creationflags=0x08000000,
                        )
                        signalled = result.returncode == 0
                else:
                    killpg = cast(
                        Callable[[int, int], None] | None,
                        os.__dict__.get("killpg"),
                    )
                    if killpg is not None:
                        with suppress(OSError):
                            killpg(pid, signal.SIGTERM)
                            signalled = True
                process.join(self.timeouts.termination_seconds)
            if process.is_alive():
                process.kill()
                signalled = True
                process.join(self.timeouts.termination_seconds)
            if process.is_alive():
                raise AdapterOperationError("cleanup-failed")
            if connection is not None and parked:
                connection.close()
                self._connection = None
            process.close()
            self._process = None
            self._cleanup_pending = False
            self._cleanup_request_id = None
            self._cleanup_load_owner = None
            return signalled
        except Exception:
            raise AdapterOperationError("cleanup-failed") from None

    def close(self) -> None:
        if self._cleanup_pending or self.worker_pid is None:
            self._terminate_worker()
            return
        try:
            self._send(("close",))
            self._expect_ok(self.timeouts.cleanup_seconds)
            process = self._process
            if process is not None:
                process.join(self.timeouts.cleanup_seconds)
                if process.is_alive():
                    raise AdapterOperationError("cleanup-failed")
        finally:
            self._terminate_worker()

    def __del__(self) -> None:
        with suppress(Exception):
            self._terminate_worker()
