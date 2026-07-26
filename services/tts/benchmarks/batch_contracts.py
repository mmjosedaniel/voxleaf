"""Candidate-neutral contracts for the frozen v4 batch experiment."""

from __future__ import annotations

from collections.abc import Callable, Sequence
from dataclasses import dataclass, field
from typing import Literal, Protocol

type BatchSize = Literal[1, 2]
type BatchPhase = Literal["warmup", "measured", "cancellation"]
type BatchStatus = Literal["completed", "failed", "timed-out", "cancelled", "stale-rejected"]
type BatchFailureCode = Literal[
    "cancelled",
    "cleanup-failed",
    "generation-failed",
    "invalid-output",
    "out-of-memory",
    "privacy",
    "resource-limit",
    "stale-identity",
    "timeout",
]


class BatchBenchmarkError(RuntimeError):
    """Fixed content-free failure crossing the batch benchmark boundary."""

    def __init__(self, code: BatchFailureCode) -> None:
        super().__init__(f"tts-benchmark-v4-batch:{code}")
        self.code = code


@dataclass(frozen=True)
class BatchWorkIdentity:
    """Identity shared by every unit in one invalidatable generation."""

    session_id: str
    generation_id: str


@dataclass(frozen=True)
class BatchUnitRequest:
    """One sensitive independent narration unit inside a batch."""

    unit_id: str
    source_sequence: int
    text: str = field(repr=False)
    language: str = "Spanish"


@dataclass(frozen=True)
class BatchGenerationRequest:
    """One bounded batch call accepted by a candidate adapter."""

    call_index: int
    phase: BatchPhase
    pass_index: int | None
    pair_id: str
    attempt: Literal[1]
    identity: BatchWorkIdentity
    units: tuple[BatchUnitRequest, ...] = field(repr=False)

    @property
    def batch_size(self) -> BatchSize:
        return len(self.units)  # type: ignore[return-value]


@dataclass(frozen=True)
class BatchAudioUnit:
    """Payload-free metadata for one complete waveform."""

    identity: BatchWorkIdentity
    call_index: int
    unit_id: str
    source_sequence: int
    batch_position: int
    sample_count: int
    sample_rate_hz: int
    channels: int
    sample_format: Literal["float32"]


@dataclass(frozen=True)
class BatchResourceSnapshot:
    """Content-free process and accelerator counters at one boundary."""

    process_tree_ram_bytes: int
    process_dedicated_vram_bytes: int
    framework_reserved_vram_bytes: int
    free_dedicated_vram_bytes: int
    shared_gpu_memory_bytes: int


@dataclass(frozen=True)
class BatchCallObservation:
    call_index: int
    phase: BatchPhase
    pass_index: int | None
    pair_id: str
    batch_size: BatchSize
    unit_ids: tuple[str, ...]
    attempt: Literal[1]
    accepted_nanoseconds: int
    completed_nanoseconds: int | None
    status: Literal["completed", "failed", "timed-out", "cancelled"]
    failure_code: BatchFailureCode | None


@dataclass(frozen=True)
class BatchUnitObservation:
    call_index: int
    unit_id: str
    source_sequence: int
    batch_position: int
    sample_count: int | None
    sample_rate_hz: int
    duration_seconds: float | None
    first_audio_nanoseconds: int | None
    completion_nanoseconds: int | None
    request_rtf: float | None
    published_sequence: int | None
    status: BatchStatus
    failure_code: BatchFailureCode | None


@dataclass(frozen=True)
class BatchExecutionObservation:
    call: BatchCallObservation
    units: tuple[BatchUnitObservation, ...]
    published: tuple[BatchAudioUnit, ...] = field(repr=False)
    peak_retained_units: int
    peak_active_batches: int
    resource_peak: BatchResourceSnapshot


class BatchCandidate(Protocol):
    """Development-only adapter boundary; it is not a production contract."""

    def generate_batch(
        self,
        request: BatchGenerationRequest,
    ) -> Sequence[BatchAudioUnit]:
        """Return one complete output per input or fail the whole batch."""

    def close(self) -> None:
        """Release all candidate-owned resources."""


class BatchClock(Protocol):
    def now_ns(self) -> int: ...


class BatchResourceProbe(Protocol):
    def snapshot(self) -> BatchResourceSnapshot: ...


type BeforePublication = Callable[[BatchGenerationRequest], None]
