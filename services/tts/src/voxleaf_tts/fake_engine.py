"""Deterministic model-free engine used by portable protocol tests."""

from __future__ import annotations

import struct
from collections.abc import Mapping
from dataclasses import dataclass
from enum import StrEnum
from typing import Final, cast

from .engine import (
    EngineCapabilities,
    EngineFailure,
    EngineFailureCode,
    EngineResult,
    WorkIdentity,
)
from .protocol import (
    BYTES_PER_SAMPLE,
    MAX_AUDIO_PAYLOAD_BYTES,
    SAMPLE_RATE_HZ,
)

_PROBE_SAMPLES: Final = (0.0, 0.25, -0.25, 0.5)
_PROBE_SAMPLE_COUNT: Final = 4_800


class FakeEngineOutcome(StrEnum):
    """Scripted, content-free generation outcomes."""

    SUCCESS = "success"
    PENDING_SUCCESS = "pending-success"
    LATE_SUCCESS = "late-success"
    FAILURE = "failure"
    TIMEOUT = "timeout"
    CRASH = "crash"
    NON_FINITE = "non-finite"
    OVERSIZED = "oversized"


@dataclass(frozen=True, slots=True)
class FakeEngineObservation:
    """Content-free lifecycle counters for deterministic assertions."""

    load_count: int
    warm_count: int
    generation_count: int
    cancellation_count: int
    cleanup_count: int
    active_count: int
    retained_audio_units: int


@dataclass(frozen=True, slots=True)
class _Operation:
    identity: WorkIdentity
    outcome: FakeEngineOutcome


def _fixed_audio() -> bytes:
    cycle = b"".join(struct.pack("<f", sample) for sample in _PROBE_SAMPLES)
    return cycle * (_PROBE_SAMPLE_COUNT // len(_PROBE_SAMPLES))


class FakeTtsEngine:
    """One-active deterministic engine with no model, device, text log, or queue."""

    def __init__(self, outcome: FakeEngineOutcome = FakeEngineOutcome.SUCCESS) -> None:
        self._next_outcome = outcome
        self._loaded = False
        self._warmed = False
        self._active: _Operation | None = None
        self._late: _Operation | None = None
        self._pending_released = False
        self._retained_result: EngineResult | None = None
        self._load_count = 0
        self._warm_count = 0
        self._generation_count = 0
        self._cancellation_count = 0
        self._cleanup_count = 0

    @property
    def has_active_operation(self) -> bool:
        return self._active is not None

    @property
    def can_settle(self) -> bool:
        return self._active is not None and (
            self._active.outcome is not FakeEngineOutcome.PENDING_SUCCESS or self._pending_released
        )

    def set_next_outcome(self, outcome: FakeEngineOutcome) -> None:
        self._next_outcome = outcome

    def capabilities(self) -> EngineCapabilities:
        return EngineCapabilities(local_speech_generation="unknown")

    def load(self) -> None:
        if self._loaded or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        self._loaded = True
        self._load_count += 1

    def warm(self) -> None:
        if not self._loaded or self._warmed or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        self._warmed = True
        self._warm_count += 1

    def begin(self, request_id: str, segment: Mapping[str, object]) -> WorkIdentity:
        if not self._warmed or self._active is not None:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        identity = WorkIdentity(
            request_id=request_id,
            session_id=cast(str, segment["sessionId"]),
            generation_id=cast(str, segment["generationId"]),
            segment_id=cast(str, segment["segmentId"]),
        )
        self._active = _Operation(identity=identity, outcome=self._next_outcome)
        self._pending_released = False
        self._generation_count += 1
        return identity

    def release_pending(self) -> None:
        if self._active is None or self._active.outcome is not FakeEngineOutcome.PENDING_SUCCESS:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        self._pending_released = True

    def settle(self) -> tuple[WorkIdentity, EngineResult]:
        operation = self._active
        if operation is None or not self.can_settle:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        self._active = None
        self._pending_released = False

        if operation.outcome is FakeEngineOutcome.FAILURE:
            raise EngineFailure(EngineFailureCode.FAILURE)
        if operation.outcome is FakeEngineOutcome.TIMEOUT:
            raise EngineFailure(EngineFailureCode.TIMEOUT)
        if operation.outcome is FakeEngineOutcome.CRASH:
            raise EngineFailure(EngineFailureCode.CRASH)

        if operation.outcome is FakeEngineOutcome.NON_FINITE:
            payload = struct.pack("<f", float("nan"))
        elif operation.outcome is FakeEngineOutcome.OVERSIZED:
            payload = bytes(MAX_AUDIO_PAYLOAD_BYTES + BYTES_PER_SAMPLE)
        else:
            payload = _fixed_audio()

        result = EngineResult(
            sample_rate_hz=SAMPLE_RATE_HZ,
            channel_count=1,
            payload=payload,
        )
        self._retained_result = result
        return (operation.identity, result)

    def cancel(self, identity: WorkIdentity) -> None:
        if self._active is None or self._active.identity != identity:
            raise EngineFailure(EngineFailureCode.INVALID_STATE)
        if self._active.outcome is FakeEngineOutcome.LATE_SUCCESS:
            self._late = self._active
        self._active = None
        self._loaded = False
        self._warmed = False
        self._pending_released = False
        self._retained_result = None
        self._cancellation_count += 1

    def take_late_result(self) -> tuple[WorkIdentity, EngineResult] | None:
        operation = self._late
        self._late = None
        if operation is None:
            return None
        return (
            operation.identity,
            EngineResult(
                sample_rate_hz=SAMPLE_RATE_HZ,
                channel_count=1,
                payload=_fixed_audio(),
            ),
        )

    def release_result(self) -> None:
        self._retained_result = None

    def cleanup(self) -> None:
        self._active = None
        self._late = None
        self._retained_result = None
        self._loaded = False
        self._warmed = False
        self._pending_released = False
        self._cleanup_count += 1

    def observe(self) -> FakeEngineObservation:
        return FakeEngineObservation(
            load_count=self._load_count,
            warm_count=self._warm_count,
            generation_count=self._generation_count,
            cancellation_count=self._cancellation_count,
            cleanup_count=self._cleanup_count,
            active_count=int(self._active is not None),
            retained_audio_units=int(self._retained_result is not None),
        )


FakeEngineFailure = EngineFailure
FakeEngineFailureCode = EngineFailureCode
FakeEngineResult = EngineResult
