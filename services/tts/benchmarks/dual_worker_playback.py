"""Exact bounded playback replay for frozen v5 dual-worker timelines."""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from fractions import Fraction
from typing import Final, Literal

from benchmarks.dual_worker_contracts import (
    DualDispatchObservation,
    DualWorkerBenchmarkError,
    DualWorkerRole,
)

STARTUP_LEAD_SECONDS: Final = Fraction(15)
MAXIMUM_PLAYABLE_SECONDS: Final = Fraction(300)
MAXIMUM_COMPLETE_UNITS: Final = 40
MAXIMUM_PCM_BYTES: Final = 28_800_000
MAXIMUM_ACTIVE_UNITS: Final = 2
ACTIVE_DURATION_RESERVATION: Final = Fraction(20)
ACTIVE_PCM_BYTE_RESERVATION: Final = 1_920_000
PCM_BYTES_PER_SAMPLE: Final = 4
THRESHOLDS: Final = (15, 30, 60, 120, 300)

type _EventKind = Literal["complete", "dispatch"]


@dataclass(frozen=True)
class PlaybackThreshold:
    playable_seconds: int
    reached_wall_seconds: Fraction | None


@dataclass(frozen=True)
class DualPlaybackSimulation:
    startup_wall_seconds: Fraction
    startup_playable_seconds: Fraction
    played_seconds: Fraction
    minimum_buffer_seconds: Fraction
    peak_buffer_seconds: Fraction
    underrun_count: int
    buffering_seconds: Fraction
    buffering_seconds_per_minute: Fraction
    peak_complete_units: int
    peak_active_units: int
    peak_retained_pcm_bytes: int
    peak_reserved_playable_seconds: Fraction
    peak_reserved_pcm_bytes: int
    head_of_line_stall_seconds: Fraction
    discarded_valid_seconds: Fraction
    stale_played_units: int
    thresholds: tuple[PlaybackThreshold, ...]

    def as_raw(self) -> dict[str, object]:
        return {
            "startupWallSeconds": float(self.startup_wall_seconds),
            "startupPlayableSeconds": float(self.startup_playable_seconds),
            "playedSeconds": float(self.played_seconds),
            "minimumBufferSeconds": float(self.minimum_buffer_seconds),
            "peakBufferSeconds": float(self.peak_buffer_seconds),
            "underrunCount": self.underrun_count,
            "bufferingSeconds": float(self.buffering_seconds),
            "bufferingSecondsPerMinute": float(self.buffering_seconds_per_minute),
            "peakCompleteUnits": self.peak_complete_units,
            "peakActiveUnits": self.peak_active_units,
            "peakRetainedPcmBytes": self.peak_retained_pcm_bytes,
            "peakReservedPlayableSeconds": float(self.peak_reserved_playable_seconds),
            "peakReservedPcmBytes": self.peak_reserved_pcm_bytes,
            "headOfLineStallSeconds": float(self.head_of_line_stall_seconds),
            "discardedValidSeconds": float(self.discarded_valid_seconds),
            "stalePlayedUnits": self.stale_played_units,
            "thresholds": [
                {
                    "playableSeconds": threshold.playable_seconds,
                    "reachedWallSeconds": (
                        None
                        if threshold.reached_wall_seconds is None
                        else float(threshold.reached_wall_seconds)
                    ),
                }
                for threshold in self.thresholds
            ],
        }


@dataclass(frozen=True)
class _TimelineEvent:
    sequence: int
    nanoseconds: int
    kind: _EventKind
    dispatch: DualDispatchObservation


@dataclass
class _QueuedUnit:
    duration: Fraction
    remaining: Fraction
    pcm_bytes: int


def _timeline(
    dispatches: tuple[DualDispatchObservation, ...],
) -> tuple[_TimelineEvent, ...]:
    events: list[_TimelineEvent] = []
    for dispatch in dispatches:
        if (
            dispatch.accepted_nanoseconds < 0
            or dispatch.dispatch_sequence < 0
            or dispatch.status != "completed"
            or dispatch.completed_nanoseconds is None
            or dispatch.completed_nanoseconds < dispatch.accepted_nanoseconds
            or dispatch.sample_count is None
            or dispatch.sample_count <= 0
            or dispatch.sample_rate_hz != 24_000
            or dispatch.published_sequence is None
            or dispatch.head_of_line_wait_nanoseconds is None
            or dispatch.head_of_line_wait_nanoseconds < 0
        ):
            raise DualWorkerBenchmarkError("invalid-output")
        events.append(
            _TimelineEvent(
                sequence=dispatch.dispatch_sequence * 2,
                nanoseconds=dispatch.accepted_nanoseconds,
                kind="dispatch",
                dispatch=dispatch,
            )
        )
        events.append(
            _TimelineEvent(
                sequence=dispatch.dispatch_sequence * 2 + 1,
                nanoseconds=dispatch.completed_nanoseconds,
                kind="complete",
                dispatch=dispatch,
            )
        )
    return tuple(
        sorted(
            events,
            key=lambda event: (
                event.nanoseconds,
                0 if event.kind == "complete" else 1,
                event.sequence,
            ),
        )
    )


def simulate_v5_playback(
    dispatches: tuple[DualDispatchObservation, ...],
    *,
    invalidation_nanoseconds: int | None = None,
) -> DualPlaybackSimulation:
    """Replay ordered complete units under all simultaneous v5 bounds."""

    if not dispatches:
        raise DualWorkerBenchmarkError("invalid-output")
    if tuple(dispatch.dispatch_sequence for dispatch in dispatches) != tuple(
        range(len(dispatches))
    ):
        raise DualWorkerBenchmarkError("invalid-output")

    events = _timeline(dispatches)
    active: dict[DualWorkerRole, DualDispatchObservation] = {}
    completed_pending: dict[int, _QueuedUnit] = {}
    queue: deque[_QueuedUnit] = deque()
    next_release = 0
    retained_complete_units = 0
    retained_pcm_bytes = 0
    buffered = Fraction(0)
    total_media = Fraction(0)
    played = Fraction(0)
    minimum_buffer: Fraction | None = None
    peak_buffer = Fraction(0)
    peak_complete = 0
    peak_active = 0
    peak_pcm = 0
    peak_reserved_seconds = Fraction(0)
    peak_reserved_bytes = 0
    buffering = Fraction(0)
    underruns = 0
    started = False
    startup_wall = Fraction(0)
    startup_playable = Fraction(0)
    previous_ns = 0
    head_of_line_stall = Fraction(0)
    discarded = Fraction(0)
    invalidated = False
    threshold_times: dict[int, Fraction | None] = {threshold: None for threshold in THRESHOLDS}

    def reserved_seconds() -> Fraction:
        return (
            buffered
            + sum(
                (unit.duration for unit in completed_pending.values()),
                start=Fraction(0),
            )
            + ACTIVE_DURATION_RESERVATION * len(active)
        )

    def reserved_bytes() -> int:
        pending_bytes = sum(unit.pcm_bytes for unit in completed_pending.values())
        return retained_pcm_bytes + pending_bytes + ACTIVE_PCM_BYTE_RESERVATION * len(active)

    def consume(seconds: Fraction) -> None:
        nonlocal buffered, played, retained_complete_units, retained_pcm_bytes
        remaining = seconds
        while remaining > 0 and queue:
            head = queue[0]
            consumed = min(head.remaining, remaining)
            head.remaining -= consumed
            remaining -= consumed
            buffered -= consumed
            played += consumed
            if head.remaining == 0:
                queue.popleft()
                retained_complete_units -= 1
                retained_pcm_bytes -= head.pcm_bytes

    def advance(to_nanoseconds: int) -> None:
        nonlocal buffering, underruns, minimum_buffer, previous_ns
        if to_nanoseconds < previous_ns:
            raise DualWorkerBenchmarkError("invalid-output")
        if started:
            elapsed = Fraction(to_nanoseconds - previous_ns, 1_000_000_000)
            available = buffered
            consume(min(elapsed, available))
            if elapsed > available:
                buffering += elapsed - available
                underruns += 1
            minimum_buffer = (
                buffered
                if minimum_buffer is None
                else min(
                    minimum_buffer,
                    buffered,
                )
            )
        previous_ns = to_nanoseconds

    for event in events:
        if invalidation_nanoseconds is not None and not invalidated:
            if invalidation_nanoseconds < previous_ns:
                raise DualWorkerBenchmarkError("invalid-output")
            if invalidation_nanoseconds <= event.nanoseconds:
                advance(invalidation_nanoseconds)
                discarded = buffered + sum(
                    (unit.duration for unit in completed_pending.values()),
                    start=Fraction(0),
                )
                active.clear()
                completed_pending.clear()
                queue.clear()
                buffered = Fraction(0)
                retained_complete_units = 0
                retained_pcm_bytes = 0
                invalidated = True
        if invalidated:
            continue

        advance(event.nanoseconds)
        dispatch = event.dispatch
        if event.kind == "dispatch":
            if dispatch.worker_role in active or len(active) >= MAXIMUM_ACTIVE_UNITS:
                raise DualWorkerBenchmarkError("resource-limit")
            active[dispatch.worker_role] = dispatch
            if (
                reserved_seconds() > MAXIMUM_PLAYABLE_SECONDS
                or reserved_bytes() > MAXIMUM_PCM_BYTES
            ):
                raise DualWorkerBenchmarkError("resource-limit")
        else:
            active_dispatch = active.pop(dispatch.worker_role, None)
            if active_dispatch is None or active_dispatch.occurrence_id != dispatch.occurrence_id:
                raise DualWorkerBenchmarkError("stale-identity")
            sample_count = dispatch.sample_count
            sample_rate = dispatch.sample_rate_hz
            published_sequence = dispatch.published_sequence
            head_of_line_wait_nanoseconds = dispatch.head_of_line_wait_nanoseconds
            if (
                sample_count is None
                or sample_rate is None
                or published_sequence is None
                or head_of_line_wait_nanoseconds is None
            ):
                raise DualWorkerBenchmarkError("invalid-output")
            duration = Fraction(sample_count, sample_rate)
            pcm_bytes = sample_count * PCM_BYTES_PER_SAMPLE
            if duration <= 0 or duration > ACTIVE_DURATION_RESERVATION:
                raise DualWorkerBenchmarkError("resource-limit")
            completed_pending[published_sequence] = _QueuedUnit(
                duration=duration,
                remaining=duration,
                pcm_bytes=pcm_bytes,
            )
            retained_complete_units += 1
            head_of_line_stall += Fraction(
                head_of_line_wait_nanoseconds,
                1_000_000_000,
            )
            while next_release in completed_pending:
                unit = completed_pending.pop(next_release)
                queue.append(unit)
                buffered += unit.duration
                total_media += unit.duration
                next_release += 1
            if retained_complete_units > MAXIMUM_COMPLETE_UNITS:
                raise DualWorkerBenchmarkError("resource-limit")
            retained_pcm_bytes = sum(unit.pcm_bytes for unit in queue)
            if buffered > MAXIMUM_PLAYABLE_SECONDS or retained_pcm_bytes > MAXIMUM_PCM_BYTES:
                raise DualWorkerBenchmarkError("resource-limit")
            wall = Fraction(event.nanoseconds, 1_000_000_000)
            for threshold in THRESHOLDS:
                if threshold_times[threshold] is None and buffered >= threshold:
                    threshold_times[threshold] = wall
            if not started and (
                buffered >= STARTUP_LEAD_SECONDS
                or (next_release == len(dispatches) and not active and not completed_pending)
            ):
                started = True
                startup_wall = wall
                startup_playable = buffered
                minimum_buffer = buffered

        peak_complete = max(peak_complete, retained_complete_units)
        peak_active = max(peak_active, len(active))
        peak_pcm = max(peak_pcm, retained_pcm_bytes)
        peak_buffer = max(peak_buffer, buffered)
        peak_reserved_seconds = max(peak_reserved_seconds, reserved_seconds())
        peak_reserved_bytes = max(peak_reserved_bytes, reserved_bytes())

    if not invalidated:
        if active or completed_pending or next_release != len(dispatches):
            raise DualWorkerBenchmarkError("invalid-output")
        consume(buffered)
    minimum_buffer = (
        Fraction(0)
        if minimum_buffer is None
        else min(
            minimum_buffer,
            buffered,
        )
    )
    buffering_per_minute = buffering * 60 / total_media if total_media > 0 else Fraction(0)
    return DualPlaybackSimulation(
        startup_wall_seconds=startup_wall,
        startup_playable_seconds=startup_playable,
        played_seconds=played,
        minimum_buffer_seconds=minimum_buffer,
        peak_buffer_seconds=peak_buffer,
        underrun_count=underruns,
        buffering_seconds=buffering,
        buffering_seconds_per_minute=buffering_per_minute,
        peak_complete_units=peak_complete,
        peak_active_units=peak_active,
        peak_retained_pcm_bytes=peak_pcm,
        peak_reserved_playable_seconds=peak_reserved_seconds,
        peak_reserved_pcm_bytes=peak_reserved_bytes,
        head_of_line_stall_seconds=head_of_line_stall,
        discarded_valid_seconds=discarded,
        stale_played_units=0,
        thresholds=tuple(
            PlaybackThreshold(
                playable_seconds=threshold,
                reached_wall_seconds=threshold_times[threshold],
            )
            for threshold in THRESHOLDS
        ),
    )
