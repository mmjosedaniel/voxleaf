"""Deterministic independent-worker runtime for model-free v5 tests."""

from __future__ import annotations

import heapq
from dataclasses import dataclass, replace
from typing import Literal

from benchmarks.dual_worker_contracts import (
    CPU_WORKER_ROLE,
    GPU_WORKER_ROLE,
    DualAudioUnit,
    DualUnitRequest,
    DualWorkerBenchmarkError,
    DualWorkerCompletion,
    DualWorkerFailureCode,
    DualWorkerIdentity,
    DualWorkerRole,
)
from benchmarks.v5_authority import CPU_PROFILE_ID, GPU_PROFILE_ID

type FakeDualScenario = Literal[
    "ordered",
    "stale-output",
    "invalid-output",
    "timeout",
    "worker-crash",
    "generation-failure",
]


@dataclass(order=True)
class _ScheduledCompletion:
    completed_nanoseconds: int
    role_priority: int
    order: int
    role: DualWorkerRole
    request: DualUnitRequest
    accepted_nanoseconds: int


class DeterministicDualWorkerRuntime:
    """Scripted GPU/CPU completion times with exact tie handling."""

    def __init__(
        self,
        *,
        scenario: FakeDualScenario = "ordered",
        scenario_role: DualWorkerRole = CPU_WORKER_ROLE,
        gpu_generation_nanoseconds: int = 4_000_000_000,
        cpu_generation_nanoseconds: int = 8_000_000_000,
        sample_count: int = 240_000,
        roles: tuple[DualWorkerRole, ...] = (
            GPU_WORKER_ROLE,
            CPU_WORKER_ROLE,
        ),
        cleanup_failure: bool = False,
    ) -> None:
        self.scenario = scenario
        self.scenario_role = scenario_role
        self._durations = {
            GPU_WORKER_ROLE: gpu_generation_nanoseconds,
            CPU_WORKER_ROLE: cpu_generation_nanoseconds,
        }
        self._sample_count = sample_count
        self._workers = tuple(
            DualWorkerIdentity(
                worker_profile_id=(GPU_PROFILE_ID if role == GPU_WORKER_ROLE else CPU_PROFILE_ID),
                candidate_id=(
                    "qwen3-tts-1-7b-customvoice-cuda-bf16-v1"
                    if role == GPU_WORKER_ROLE
                    else "qwen3-tts-1-7b-customvoice-cpu-fp32-v5"
                ),
                role=role,
            )
            for role in roles
        )
        self._now = 0
        self._order = 0
        self._scheduled: list[_ScheduledCompletion] = []
        self._active: dict[DualWorkerRole, DualUnitRequest] = {}
        self.cancelled: list[tuple[DualWorkerRole, str]] = []
        self.closed = False
        self.cleanup_failure = cleanup_failure

    @property
    def workers(self) -> tuple[DualWorkerIdentity, ...]:
        return self._workers

    def submit(self, worker_role: DualWorkerRole, request: DualUnitRequest) -> int:
        if self.closed or worker_role in self._active:
            raise DualWorkerBenchmarkError("resource-limit")
        if worker_role not in {worker.role for worker in self._workers}:
            raise DualWorkerBenchmarkError("resource-limit")
        duration = self._durations[worker_role]
        if duration <= 0:
            raise DualWorkerBenchmarkError("generation-failed")
        accepted = self._now
        self._active[worker_role] = request
        heapq.heappush(
            self._scheduled,
            _ScheduledCompletion(
                completed_nanoseconds=accepted + duration,
                role_priority=0 if worker_role == GPU_WORKER_ROLE else 1,
                order=self._order,
                role=worker_role,
                request=request,
                accepted_nanoseconds=accepted,
            ),
        )
        self._order += 1
        return accepted

    def next_completion(
        self,
        active_roles: frozenset[DualWorkerRole],
    ) -> DualWorkerCompletion:
        while self._scheduled:
            item = heapq.heappop(self._scheduled)
            active_request = self._active.get(item.role)
            if active_request != item.request:
                continue
            if item.role not in active_roles:
                raise DualWorkerBenchmarkError("stale-identity")
            del self._active[item.role]
            self._now = item.completed_nanoseconds
            worker = next(worker for worker in self._workers if worker.role == item.role)
            if self.scenario != "ordered" and item.role == self.scenario_role:
                failure_by_scenario: dict[
                    FakeDualScenario,
                    tuple[
                        Literal["failed", "timed-out"],
                        DualWorkerFailureCode,
                    ],
                ] = {
                    "timeout": ("timed-out", "timeout"),
                    "worker-crash": ("failed", "worker-crash"),
                    "generation-failure": ("failed", "generation-failed"),
                }
                if self.scenario in failure_by_scenario:
                    status, code = failure_by_scenario[self.scenario]
                    return DualWorkerCompletion(
                        request=item.request,
                        worker=worker,
                        accepted_nanoseconds=item.accepted_nanoseconds,
                        completed_nanoseconds=(None if status == "timed-out" else self._now),
                        status=status,
                        failure_code=code,
                    )
            audio = DualAudioUnit(
                occurrence_id=item.request.occurrence_id,
                unit_id=item.request.unit_id,
                source_sequence=item.request.source_sequence,
                identity=item.request.identity,
                worker=worker,
                sample_count=self._sample_count,
                sample_rate_hz=24_000,
                channels=1,
                sample_format="float32",
            )
            if self.scenario == "stale-output" and item.role == self.scenario_role:
                audio = replace(
                    audio,
                    identity=replace(audio.identity, generation_id="stale"),
                )
            elif self.scenario == "invalid-output" and item.role == self.scenario_role:
                audio = replace(audio, sample_rate_hz=16_000)
            return DualWorkerCompletion(
                request=item.request,
                worker=worker,
                accepted_nanoseconds=item.accepted_nanoseconds,
                completed_nanoseconds=self._now,
                status="completed",
                audio=audio,
            )
        raise DualWorkerBenchmarkError("worker-crash")

    def cancel(self, worker_role: DualWorkerRole, occurrence_id: str) -> None:
        self.cancelled.append((worker_role, occurrence_id))
        self._active.pop(worker_role, None)

    def close(self) -> None:
        self.closed = True
        self._active.clear()
        self._scheduled.clear()
        if self.cleanup_failure:
            raise DualWorkerBenchmarkError("cleanup-failed")
