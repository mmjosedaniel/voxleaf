"""Threaded controller bridge for two independently isolated Qwen workers."""

from __future__ import annotations

import time
from concurrent.futures import Future, ThreadPoolExecutor, wait
from dataclasses import dataclass, replace
from threading import Event, Lock
from typing import Final

from benchmarks.batch_contracts import (
    BatchAudioUnit,
    BatchGenerationRequest,
    BatchUnitRequest,
    BatchWorkIdentity,
)
from benchmarks.contracts import AdapterOperationError, AdapterPlacementEvidence
from benchmarks.dual_worker_contracts import (
    GPU_WORKER_ROLE,
    DualAudioUnit,
    DualUnitRequest,
    DualWorkerBenchmarkError,
    DualWorkerCompletion,
    DualWorkerFailureCode,
    DualWorkerIdentity,
    DualWorkerRole,
)
from benchmarks.isolation import IsolatedBenchmarkAdapter, WitnessedBatchCancellation

NEXT_COMPLETION_TIMEOUT_SECONDS: Final = 125.0
ENTRY_BARRIER_SECONDS: Final = 20.0


@dataclass
class _EntryBarrier:
    entered: Event
    release: Event
    request: DualUnitRequest | None = None
    entered_nanoseconds: int = 0
    invalidated_nanoseconds: int = 0
    receipt: WitnessedBatchCancellation | None = None


@dataclass(frozen=True)
class _WorkResult:
    completed_nanoseconds: int
    outputs: tuple[BatchAudioUnit, ...] = ()
    failure: DualWorkerFailureCode | None = None


@dataclass(frozen=True)
class _ActiveWork:
    request: DualUnitRequest
    accepted_nanoseconds: int
    future: Future[_WorkResult]
    cancelled: Event


@dataclass
class _RetiredWork:
    work: _ActiveWork
    dispatch_finished: Event
    dispatch_succeeded: bool = False


def _failure_code(error: AdapterOperationError) -> DualWorkerFailureCode:
    failures: dict[str, DualWorkerFailureCode] = {
        "timeout": "timeout",
        "crash": "worker-crash",
        "resource-limit": "resource-limit",
        "invalid-output": "invalid-output",
        "privacy": "privacy",
        "cleanup-failed": "cleanup-failed",
        "generation-failed": "generation-failed",
    }
    return failures.get(error.code, "generation-failed")


class ThreadedDualWorkerRuntime:
    """Run one blocking complete-waveform call in each isolated process."""

    def __init__(
        self,
        candidates: dict[DualWorkerRole, IsolatedBenchmarkAdapter],
        identities: tuple[DualWorkerIdentity, ...],
    ) -> None:
        if (
            not candidates
            or set(candidates) != {worker.role for worker in identities}
            or len(identities) != len(candidates)
        ):
            raise DualWorkerBenchmarkError("resource-limit")
        self._candidates = dict(candidates)
        self._workers = identities
        self._executor = ThreadPoolExecutor(
            max_workers=len(candidates),
            thread_name_prefix="voxleaf-v5-worker",
        )
        self._active: dict[DualWorkerRole, _ActiveWork] = {}
        self._retired: dict[DualWorkerRole, _RetiredWork] = {}
        self._loading: dict[DualWorkerRole, Event] = {}
        self._lifecycle_lock = Lock()
        self._close_lock = Lock()
        self._closed = False
        self._cleanup_complete = False
        self._entry_barriers: dict[DualWorkerRole, _EntryBarrier] = {}

    def arm_entry_witnesses(self, roles: tuple[DualWorkerRole, ...]) -> None:
        """One-shot trial instrumentation; never used by measured generation."""
        with self._lifecycle_lock:
            if (
                self._closed
                or self._active
                or self._retired
                or self._entry_barriers
                or not roles
                or len(set(roles)) != len(roles)
                or not set(roles) <= set(self._candidates)
            ):
                raise DualWorkerBenchmarkError("resource-limit")
            self._entry_barriers = {role: _EntryBarrier(Event(), Event()) for role in roles}

    def await_entry_witnesses(self) -> None:
        deadline = time.monotonic() + ENTRY_BARRIER_SECONDS
        for barrier in self._entry_barriers.values():
            if not barrier.entered.wait(max(0, deadline - time.monotonic())):
                raise DualWorkerBenchmarkError("timeout")
        if not self._entry_barriers or any(
            work.future.done()
            for role, work in self._active.items()
            if role in self._entry_barriers
        ):
            raise DualWorkerBenchmarkError("invalid-output")

    def release_entry_witnesses(self) -> None:
        """Called only after the controller invalidates the same active identity."""
        now = time.perf_counter_ns()
        for barrier in self._entry_barriers.values():
            if not barrier.entered.is_set() or barrier.release.is_set():
                raise DualWorkerBenchmarkError("invalid-output")
            barrier.invalidated_nanoseconds = now
        for barrier in self._entry_barriers.values():
            barrier.release.set()

    def entry_evidence(self) -> list[dict[str, object]]:
        result: list[dict[str, object]] = []
        for role, barrier in self._entry_barriers.items():
            request, receipt = barrier.request, barrier.receipt
            if (
                request is None
                or receipt is None
                or not barrier.invalidated_nanoseconds
                or receipt.phase != "adapter-entry"
                or receipt.call_index != request.source_sequence
                or receipt.identity
                != BatchWorkIdentity(request.identity.session_id, request.identity.generation_id)
            ):
                raise DualWorkerBenchmarkError("invalid-output")
            result.append(
                {
                    "role": role,
                    "occurrence": request.occurrence_id,
                    "sequence": request.source_sequence,
                    "attempt": request.attempt,
                    "entered": barrier.entered_nanoseconds,
                    "invalidated": barrier.invalidated_nanoseconds,
                    "termination": receipt.termination_nanoseconds,
                }
            )
        return result

    @property
    def workers(self) -> tuple[DualWorkerIdentity, ...]:
        return self._workers

    def load_worker(self, role: DualWorkerRole) -> None:
        with self._lifecycle_lock:
            self._reap_retired(role)
            if (
                self._closed
                or role in self._active
                or role in self._loading
                or role in self._retired
            ):
                raise DualWorkerBenchmarkError("resource-limit")
            settled = Event()
            self._loading[role] = settled
        try:
            self._candidates[role].load()
        except AdapterOperationError as error:
            raise DualWorkerBenchmarkError(_failure_code(error)) from None
        finally:
            settled.set()
            with self._lifecycle_lock:
                self._loading.pop(role, None)

    def _generate(
        self,
        role: DualWorkerRole,
        request: DualUnitRequest,
        cancelled: Event,
    ) -> _WorkResult:
        batch_request = BatchGenerationRequest(
            call_index=request.source_sequence,
            phase="measured",
            pass_index=request.pass_index,
            pair_id=request.occurrence_id,
            attempt=1,
            identity=BatchWorkIdentity(
                request.identity.session_id,
                request.identity.generation_id,
            ),
            units=(
                BatchUnitRequest(
                    unit_id=request.unit_id,
                    source_sequence=request.source_sequence,
                    text=request.text,
                    language=request.language,
                ),
            ),
        )
        try:
            if cancelled.is_set():
                return _WorkResult(time.perf_counter_ns(), failure="cancelled")
            barrier = self._entry_barriers.get(role)
            if barrier is not None:

                def parked() -> None:
                    barrier.request = request
                    barrier.entered_nanoseconds = time.perf_counter_ns()
                    barrier.entered.set()
                    if (
                        not barrier.release.wait(ENTRY_BARRIER_SECONDS)
                        or not barrier.invalidated_nanoseconds
                    ):
                        raise AdapterOperationError("timeout")

                barrier.receipt = self._candidates[role].cancel_witnessed_batch(
                    replace(batch_request, phase="cancellation"),
                    "adapter-entry",
                    lambda: False,
                    parked,
                )
                return _WorkResult(time.perf_counter_ns(), failure="cancelled")
            outputs = self._candidates[role].generate_batch(batch_request, require_loaded=True)
            return _WorkResult(time.perf_counter_ns(), outputs=outputs)
        except AdapterOperationError as error:
            return _WorkResult(time.perf_counter_ns(), failure=_failure_code(error))
        except Exception:
            return _WorkResult(time.perf_counter_ns(), failure="worker-crash")

    def submit(self, worker_role: DualWorkerRole, request: DualUnitRequest) -> int:
        with self._lifecycle_lock:
            self._reap_retired(worker_role)
            if (
                self._closed
                or worker_role in self._active
                or worker_role in self._retired
                or worker_role in self._loading
                or worker_role not in self._candidates
            ):
                raise DualWorkerBenchmarkError("resource-limit")
            accepted = time.perf_counter_ns()
            cancelled = Event()
            future = self._executor.submit(self._generate, worker_role, request, cancelled)
            self._active[worker_role] = _ActiveWork(request, accepted, future, cancelled)
            return accepted

    def next_completion(
        self,
        active_roles: frozenset[DualWorkerRole],
    ) -> DualWorkerCompletion:
        with self._lifecycle_lock:
            active = self._active.copy()
            if active_roles != frozenset(active):
                raise DualWorkerBenchmarkError("stale-identity")
        done, _pending = wait(
            [work.future for work in active.values()],
            timeout=NEXT_COMPLETION_TIMEOUT_SECONDS,
            return_when="FIRST_COMPLETED",
        )
        with self._lifecycle_lock:
            if active != self._active:
                raise DualWorkerBenchmarkError("stale-identity")
            ready_roles = [role for role, work in active.items() if work.future in done]
            available_roles = ready_roles or list(active)
            role = GPU_WORKER_ROLE if GPU_WORKER_ROLE in available_roles else available_roles[0]
            work = active[role]
            retired = None
            if done:
                del self._active[role]
            else:
                retired = self._retire(role, work)
        if retired is not None:
            self._dispatch_cancellation(role, retired)
            return DualWorkerCompletion(
                request=work.request,
                worker=self._worker(role),
                accepted_nanoseconds=work.accepted_nanoseconds,
                completed_nanoseconds=None,
                status="timed-out",
                failure_code="timeout",
            )
        result = work.future.result()
        completed = result.completed_nanoseconds
        if result.failure is not None:
            code = result.failure
            return DualWorkerCompletion(
                request=work.request,
                worker=self._worker(role),
                accepted_nanoseconds=work.accepted_nanoseconds,
                completed_nanoseconds=None if code == "timeout" else completed,
                status="timed-out" if code == "timeout" else "failed",
                failure_code=code,
            )
        outputs = result.outputs
        if len(outputs) != 1:
            return DualWorkerCompletion(
                request=work.request,
                worker=self._worker(role),
                accepted_nanoseconds=work.accepted_nanoseconds,
                completed_nanoseconds=completed,
                status="failed",
                failure_code="invalid-output",
            )
        output = outputs[0]
        audio = DualAudioUnit(
            occurrence_id=work.request.occurrence_id,
            unit_id=output.unit_id,
            source_sequence=output.source_sequence,
            identity=work.request.identity,
            worker=self._worker(role),
            sample_count=output.sample_count,
            sample_rate_hz=output.sample_rate_hz,
            channels=output.channels,
            sample_format=output.sample_format,
        )
        return DualWorkerCompletion(
            request=work.request,
            worker=self._worker(role),
            accepted_nanoseconds=work.accepted_nanoseconds,
            completed_nanoseconds=completed,
            status="completed",
            audio=audio,
        )

    def _worker(self, role: DualWorkerRole) -> DualWorkerIdentity:
        return next(worker for worker in self._workers if worker.role == role)

    def _reap_retired(self, role: DualWorkerRole) -> None:
        retired = self._retired.get(role)
        if retired is not None and retired.dispatch_succeeded and retired.work.future.done():
            del self._retired[role]

    def _retire(self, role: DualWorkerRole, work: _ActiveWork) -> _RetiredWork:
        del self._active[role]
        work.cancelled.set()
        work.future.cancel()
        retired = _RetiredWork(work, Event())
        self._retired[role] = retired
        return retired

    def _dispatch_cancellation(self, role: DualWorkerRole, retired: _RetiredWork) -> None:
        succeeded = False
        try:
            if role in self._entry_barriers:
                # The witness owns the pipe and termination. Never race its receiver.
                barrier = self._entry_barriers[role]
                barrier.release.set()
                if not wait([retired.work.future], timeout=ENTRY_BARRIER_SECONDS).done:
                    raise DualWorkerBenchmarkError("cleanup-failed")
            # This runtime owns a submitted batch even before adapter dispatch.
            self._candidates[role].cancel(
                f"batch-{retired.work.request.source_sequence}", cancel_idle=True
            )
            succeeded = True
        except AdapterOperationError:
            raise DualWorkerBenchmarkError("cleanup-failed") from None
        finally:
            with self._lifecycle_lock:
                retired.dispatch_succeeded = succeeded
                retired.dispatch_finished.set()

    def cancel(self, worker_role: DualWorkerRole, occurrence_id: str) -> None:
        retired: _RetiredWork | None
        with self._lifecycle_lock:
            if self._closed:
                return
            work = self._active.get(worker_role)
            if work is not None:
                if work.request.occurrence_id != occurrence_id:
                    return
                retired = self._retire(worker_role, work)
            else:
                retired = self._retired.get(worker_role)
                if (
                    retired is None
                    or retired.work.request.occurrence_id != occurrence_id
                    or retired.dispatch_succeeded
                    or not retired.dispatch_finished.is_set()
                ):
                    return
                retired.dispatch_finished.clear()
        self._dispatch_cancellation(worker_role, retired)

    def worker_pid(self, role: DualWorkerRole) -> int | None:
        return self._candidates[role].worker_pid

    def placement_evidence(
        self,
        role: DualWorkerRole,
    ) -> AdapterPlacementEvidence | None:
        return self._candidates[role].placement_evidence

    def framework_memory_high_water_bytes(self, role: DualWorkerRole) -> int | None:
        return self._candidates[role].framework_memory_high_water_bytes()

    def close(self) -> None:
        with self._close_lock:
            self._close()

    def _close(self) -> None:
        if self._cleanup_complete:
            return
        for barrier in self._entry_barriers.values():
            barrier.release.set()
        with self._lifecycle_lock:
            self._closed = True
            loading = tuple(self._loading.values())
            cancellations = [
                (role, self._retire(role, work)) for role, work in tuple(self._active.items())
            ]
            retired_work = tuple(self._retired.values())
        failures = 0
        for role, retired in cancellations:
            try:
                self._dispatch_cancellation(role, retired)
            except DualWorkerBenchmarkError:
                failures += 1
        for retired in retired_work:
            if not retired.dispatch_finished.wait(NEXT_COMPLETION_TIMEOUT_SECONDS):
                raise DualWorkerBenchmarkError("cleanup-failed")
        for candidate in self._candidates.values():
            try:
                candidate.close()
            except AdapterOperationError:
                failures += 1
        for settled in loading:
            if not settled.wait(NEXT_COMPLETION_TIMEOUT_SECONDS):
                failures += 1
        pending = wait(
            [retired.work.future for retired in retired_work if not retired.work.future.done()],
            timeout=NEXT_COMPLETION_TIMEOUT_SECONDS,
        ).not_done
        self._executor.shutdown(wait=not pending, cancel_futures=True)
        if pending:
            failures += 1
        # A load/start handoff may finish after the first containment sweep.
        for candidate in self._candidates.values():
            try:
                candidate.close()
            except AdapterOperationError:
                failures += 1
        if failures:
            raise DualWorkerBenchmarkError("cleanup-failed")
        with self._lifecycle_lock:
            self._retired.clear()
            self._cleanup_complete = True
