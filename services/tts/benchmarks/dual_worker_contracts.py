"""Candidate-neutral contracts for the frozen v5 dual-worker experiment."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from dataclasses import dataclass, field
from typing import Final, Literal, Protocol

type DualWorkerRole = Literal["gpu-primary", "cpu-support"]
type DualWorkerArm = Literal["cpu-solo", "gpu-solo", "concurrent"]
type DualWorkerStatus = Literal[
    "completed",
    "failed",
    "timed-out",
    "cancelled",
    "stale-rejected",
]
type DualWorkerFailureCode = Literal[
    "cancelled",
    "cleanup-failed",
    "generation-failed",
    "invalid-output",
    "out-of-memory",
    "privacy",
    "resource-limit",
    "stale-identity",
    "timeout",
    "worker-crash",
]

GPU_WORKER_ROLE: Final[DualWorkerRole] = "gpu-primary"
CPU_WORKER_ROLE: Final[DualWorkerRole] = "cpu-support"


class DualWorkerBenchmarkError(RuntimeError):
    """Fixed content-free failure crossing the v5 benchmark boundary."""

    def __init__(self, code: DualWorkerFailureCode) -> None:
        super().__init__(f"tts-benchmark-v5-dual-worker:{code}")
        self.code = code


@dataclass(frozen=True)
class DualWorkIdentity:
    """Identity invalidated before worker termination or stale-output rejection."""

    session_id: str
    generation_id: str


@dataclass(frozen=True)
class DualWorkerIdentity:
    """Exact benchmark-local identity for one independently loaded worker."""

    worker_profile_id: str
    candidate_id: str
    role: DualWorkerRole


@dataclass(frozen=True)
class DualUnitRequest:
    """One sensitive frozen occurrence assigned to exactly one worker."""

    occurrence_id: str
    unit_id: str
    source_sequence: int
    pass_index: int
    attempt: Literal[1]
    identity: DualWorkIdentity
    text: str = field(repr=False)
    language: str = "Spanish"


@dataclass(frozen=True)
class DualAudioUnit:
    """Payload-free metadata for one complete worker waveform."""

    occurrence_id: str
    unit_id: str
    source_sequence: int
    identity: DualWorkIdentity
    worker: DualWorkerIdentity
    sample_count: int
    sample_rate_hz: int
    channels: int
    sample_format: Literal["float32"]


@dataclass(frozen=True)
class DualWorkerCompletion:
    """One terminal worker event returned to the controller."""

    request: DualUnitRequest = field(repr=False)
    worker: DualWorkerIdentity
    accepted_nanoseconds: int
    completed_nanoseconds: int | None
    status: Literal["completed", "failed", "timed-out", "cancelled"]
    audio: DualAudioUnit | None = field(default=None, repr=False)
    failure_code: DualWorkerFailureCode | None = None


@dataclass(frozen=True)
class DualDispatchObservation:
    """Content-free dispatch, completion, and ordered-release evidence."""

    dispatch_sequence: int
    occurrence_id: str
    unit_id: str
    source_sequence: int
    pass_index: int
    worker_role: DualWorkerRole
    attempt: Literal[1]
    accepted_nanoseconds: int
    completed_nanoseconds: int | None
    status: DualWorkerStatus
    failure_code: DualWorkerFailureCode | None
    sample_count: int | None
    sample_rate_hz: int | None
    published_sequence: int | None
    head_of_line_wait_nanoseconds: int | None


@dataclass(frozen=True)
class DualControllerObservation:
    """Bounded result of one model-free or hardware-backed arm."""

    arm: DualWorkerArm
    dispatches: tuple[DualDispatchObservation, ...]
    released: tuple[DualAudioUnit, ...] = field(repr=False)
    peak_active_units: int = 0
    peak_active_gpu_units: int = 0
    peak_active_cpu_units: int = 0
    peak_reorder_units: int = 0
    stale_rejected_units: int = 0
    invalidated: bool = False


class DualWorkerRuntime(Protocol):
    """Async worker surface used only by the development benchmark."""

    @property
    def workers(self) -> Sequence[DualWorkerIdentity]:
        """Return the exact workers owned by this runtime."""

    def submit(self, worker_role: DualWorkerRole, request: DualUnitRequest) -> int:
        """Start one unit and return its monotonic accepted timestamp."""

    def next_completion(
        self,
        active_roles: frozenset[DualWorkerRole],
    ) -> DualWorkerCompletion:
        """Return the next terminal event, GPU first on an exact tie."""

    def cancel(self, worker_role: DualWorkerRole, occurrence_id: str) -> None:
        """Terminate the affected worker after identity invalidation."""

    def close(self) -> None:
        """Release both worker processes and controller resources."""


type BeforeOrderedRelease = Callable[[DualWorkerCompletion], None]
type AfterInitialDispatch = Callable[[], None]
