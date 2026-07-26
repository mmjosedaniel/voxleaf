"""Bounded spawned-process isolation for benchmark adapters."""

from __future__ import annotations

import multiprocessing
import os
import signal
import subprocess
from collections.abc import Callable, Iterator, Sequence
from contextlib import suppress
from dataclasses import dataclass
from multiprocessing.context import SpawnContext
from multiprocessing.process import BaseProcess
from typing import Final, Protocol, cast

from benchmarks.batch_contracts import (
    BatchAudioUnit,
    BatchCandidate,
    BatchGenerationRequest,
)
from benchmarks.contracts import (
    AdapterCapabilities,
    AdapterFactory,
    AdapterOperationError,
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
    elif command == "generate-batch":
        if len(message) != 2 or not isinstance(message[1], BatchGenerationRequest):
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
                response: _Message = ("ok", _framework_peak(adapter))
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
    def __init__(self, owner: IsolatedBenchmarkAdapter, request_id: str) -> None:
        self._owner = owner
        self._request_id = request_id
        self._complete = False

    def __iter__(self) -> _ProcessGeneration:
        return self

    def __next__(self) -> AudioChunk:
        if self._complete or self._owner.was_cancelled(self._request_id):
            raise StopIteration
        response = self._owner.receive(self._owner.timeouts.request_seconds)
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
        self._capabilities = adapter_factory().capabilities()
        self._process: BaseProcess | None = None
        self._connection: _WorkerConnection | None = None
        self._loaded = False
        self._active_request_id: str | None = None
        self._cancelled_request_ids: set[str] = set()

    @property
    def worker_pid(self) -> int | None:
        process = self._process
        return process.pid if process is not None and process.is_alive() else None

    def capabilities(self) -> AdapterCapabilities:
        return self._capabilities

    def _start(self) -> None:
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

    def _send(self, message: _Message) -> None:
        connection = self._connection
        if connection is None or self.worker_pid is None:
            raise AdapterOperationError("crash")
        try:
            connection.send(message)
        except (BrokenPipeError, EOFError, OSError):
            self.abort("crash")

    def receive(self, timeout_seconds: float) -> _Message:
        connection = self._connection
        if connection is None:
            raise AdapterOperationError("crash")
        try:
            if not connection.poll(timeout_seconds):
                self.abort("timeout")
            return cast(_Message, connection.recv())
        except AdapterOperationError:
            raise
        except (EOFError, OSError):
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
        response = self.receive(timeout_seconds)
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

    def _ensure_loaded(self) -> None:
        if not self._loaded:
            self.load()

    def warm_up(self, request: GenerationRequest) -> None:
        self._ensure_loaded()
        self._send(("warmup", request))
        self._expect_ok(self.timeouts.request_seconds)

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        if self._active_request_id is not None:
            raise AdapterOperationError("invalid-request")
        self._ensure_loaded()
        self._active_request_id = request.request_id
        self._send(("generate", request))
        return _ProcessGeneration(self, request.request_id)

    def generate_batch(
        self,
        request: BatchGenerationRequest,
    ) -> tuple[BatchAudioUnit, ...]:
        """Run one bounded complete-waveform batch in the isolated worker."""

        if self._active_request_id is not None:
            raise AdapterOperationError("invalid-request")
        self._ensure_loaded()
        request_id = f"batch-{request.call_index}"
        self._active_request_id = request_id
        self._send(("generate-batch", request))
        response = self.receive(self.timeouts.request_seconds)
        try:
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
            self.finish_request(request_id)

    def was_cancelled(self, request_id: str) -> bool:
        return request_id in self._cancelled_request_ids

    def finish_request(self, request_id: str) -> None:
        if self._active_request_id == request_id:
            self._active_request_id = None

    def cancel(self, request_id: str) -> CancellationResponse:
        self._cancelled_request_ids.add(request_id)
        self.finish_request(request_id)
        self._terminate_worker()
        return CancellationResponse(acknowledged=True, stop_mode="worker-termination")

    def framework_memory_high_water_bytes(self) -> int | None:
        return self._peak_framework_vram_bytes

    def abort(self, code: FailureCode) -> None:
        self._terminate_worker()
        raise AdapterOperationError(code)

    def _terminate_worker(self) -> None:
        process = self._process
        connection = self._connection
        self._process = None
        self._connection = None
        self._loaded = False
        self._active_request_id = None
        if connection is not None:
            with suppress(Exception):
                connection.close()
        if process is None:
            return
        pid = process.pid
        if process.is_alive() and pid is not None:
            if os.name == "nt":
                with suppress(Exception):
                    subprocess.run(
                        ("taskkill", "/PID", str(pid), "/T", "/F"),
                        check=False,
                        capture_output=True,
                        timeout=self.timeouts.termination_seconds,
                        creationflags=0x08000000,
                    )
            else:
                killpg = cast(
                    Callable[[int, int], None] | None,
                    os.__dict__.get("killpg"),
                )
                if killpg is not None:
                    with suppress(OSError):
                        killpg(pid, signal.SIGTERM)
            process.join(self.timeouts.termination_seconds)
        if process.is_alive():
            process.kill()
            process.join(self.timeouts.termination_seconds)
        process.close()

    def close(self) -> None:
        if self.worker_pid is None:
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
