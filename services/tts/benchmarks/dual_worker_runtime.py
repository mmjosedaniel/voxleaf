"""Threaded controller bridge for two independently isolated Qwen workers."""

from __future__ import annotations

import time
from concurrent.futures import Future, ThreadPoolExecutor, wait
from dataclasses import dataclass
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
from benchmarks.isolation import IsolatedBenchmarkAdapter

NEXT_COMPLETION_TIMEOUT_SECONDS: Final = 125.0


@dataclass(frozen=True)
class _ActiveWork:
    request: DualUnitRequest
    accepted_nanoseconds: int
    future: Future[tuple[BatchAudioUnit, ...]]


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
        self._closed = False

    @property
    def workers(self) -> tuple[DualWorkerIdentity, ...]:
        return self._workers

    def load_worker(self, role: DualWorkerRole) -> None:
        if self._closed or role in self._active:
            raise DualWorkerBenchmarkError("resource-limit")
        try:
            self._candidates[role].load()
        except AdapterOperationError as error:
            raise DualWorkerBenchmarkError(_failure_code(error)) from None

    def _generate(
        self,
        role: DualWorkerRole,
        request: DualUnitRequest,
    ) -> tuple[BatchAudioUnit, ...]:
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
        return self._candidates[role].generate_batch(batch_request)

    def submit(self, worker_role: DualWorkerRole, request: DualUnitRequest) -> int:
        if self._closed or worker_role in self._active or worker_role not in self._candidates:
            raise DualWorkerBenchmarkError("resource-limit")
        accepted = time.perf_counter_ns()
        future = self._executor.submit(self._generate, worker_role, request)
        self._active[worker_role] = _ActiveWork(request, accepted, future)
        return accepted

    def next_completion(
        self,
        active_roles: frozenset[DualWorkerRole],
    ) -> DualWorkerCompletion:
        if active_roles != frozenset(self._active):
            raise DualWorkerBenchmarkError("stale-identity")
        done, _pending = wait(
            [work.future for work in self._active.values()],
            timeout=NEXT_COMPLETION_TIMEOUT_SECONDS,
            return_when="FIRST_COMPLETED",
        )
        if not done:
            role = GPU_WORKER_ROLE if GPU_WORKER_ROLE in active_roles else next(iter(active_roles))
            work = self._active.pop(role)
            self.cancel(role, work.request.occurrence_id)
            return DualWorkerCompletion(
                request=work.request,
                worker=self._worker(role),
                accepted_nanoseconds=work.accepted_nanoseconds,
                completed_nanoseconds=None,
                status="timed-out",
                failure_code="timeout",
            )
        completed_roles = [role for role, work in self._active.items() if work.future in done]
        role = GPU_WORKER_ROLE if GPU_WORKER_ROLE in completed_roles else completed_roles[0]
        work = self._active.pop(role)
        completed = time.perf_counter_ns()
        try:
            outputs = work.future.result()
        except AdapterOperationError as error:
            code = _failure_code(error)
            return DualWorkerCompletion(
                request=work.request,
                worker=self._worker(role),
                accepted_nanoseconds=work.accepted_nanoseconds,
                completed_nanoseconds=None if code == "timeout" else completed,
                status="timed-out" if code == "timeout" else "failed",
                failure_code=code,
            )
        except Exception:
            return DualWorkerCompletion(
                request=work.request,
                worker=self._worker(role),
                accepted_nanoseconds=work.accepted_nanoseconds,
                completed_nanoseconds=completed,
                status="failed",
                failure_code="worker-crash",
            )
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

    def cancel(self, worker_role: DualWorkerRole, occurrence_id: str) -> None:
        work = self._active.pop(worker_role, None)
        request_id = (
            f"batch-{work.request.source_sequence}"
            if work is not None
            else f"batch-{occurrence_id}"
        )
        try:
            self._candidates[worker_role].cancel(request_id)
        except AdapterOperationError:
            return

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
        if self._closed:
            return
        self._closed = True
        for role, work in tuple(self._active.items()):
            self.cancel(role, work.request.occurrence_id)
        failures = 0
        for candidate in self._candidates.values():
            try:
                candidate.close()
            except AdapterOperationError:
                failures += 1
        self._executor.shutdown(wait=True, cancel_futures=True)
        if failures:
            raise DualWorkerBenchmarkError("cleanup-failed")
