"""Content-free bounded playback simulation for v4 completion timelines."""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from fractions import Fraction
from typing import Final

from benchmarks.batch_contracts import BatchBenchmarkError

STARTUP_LEAD_SECONDS: Final = Fraction(15)
MAXIMUM_BUFFER_SECONDS: Final = Fraction(40)
MAXIMUM_QUEUED_UNITS: Final = 2


@dataclass(frozen=True)
class PlaybackArrival:
    completion_nanoseconds: int
    published_sequence: int
    sample_count: int
    sample_rate_hz: int
    stale: bool = False


@dataclass(frozen=True)
class PlaybackSimulation:
    startup_wall_seconds: Fraction
    startup_playable_seconds: Fraction
    played_seconds: Fraction
    minimum_buffer_seconds: Fraction
    peak_buffer_seconds: Fraction
    underrun_count: int
    buffering_seconds: Fraction
    buffering_seconds_per_minute: Fraction
    peak_queued_units: int
    peak_active_batches: int
    stale_played_units: int

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
            "peakQueuedUnits": self.peak_queued_units,
            "peakActiveBatches": self.peak_active_batches,
            "stalePlayedUnits": self.stale_played_units,
        }


def simulate_bounded_playback(
    arrivals: tuple[PlaybackArrival, ...],
) -> PlaybackSimulation:
    """Consume a prevalidated first-attempt timeline without audio payloads."""

    if not arrivals:
        raise BatchBenchmarkError("invalid-output")
    queued: deque[Fraction] = deque()
    buffered = Fraction(0)
    total_media = Fraction(0)
    played = Fraction(0)
    minimum_buffer: Fraction | None = None
    peak_buffer = Fraction(0)
    peak_queued = 0
    buffering = Fraction(0)
    underruns = 0
    started = False
    startup_wall = Fraction(0)
    startup_playable = Fraction(0)
    previous_completion = 0

    def consume(seconds: Fraction) -> None:
        nonlocal buffered, played
        remaining = seconds
        while remaining > 0 and queued:
            head = queued[0]
            consumed = min(head, remaining)
            head -= consumed
            remaining -= consumed
            buffered -= consumed
            played += consumed
            if head == 0:
                queued.popleft()
            else:
                queued[0] = head

    for index, arrival in enumerate(arrivals):
        if (
            arrival.completion_nanoseconds < previous_completion
            or arrival.published_sequence != index
            or arrival.sample_count <= 0
            or arrival.sample_rate_hz <= 0
            or arrival.stale
        ):
            raise BatchBenchmarkError("stale-identity" if arrival.stale else "invalid-output")
        if started:
            elapsed = Fraction(
                arrival.completion_nanoseconds - previous_completion,
                1_000_000_000,
            )
            available = buffered
            consume(min(elapsed, available))
            if elapsed > available:
                buffering += elapsed - available
                underruns += 1
            minimum_buffer = buffered if minimum_buffer is None else min(minimum_buffer, buffered)
        duration = Fraction(arrival.sample_count, arrival.sample_rate_hz)
        queued.append(duration)
        buffered += duration
        total_media += duration
        if not started and (buffered >= STARTUP_LEAD_SECONDS or index == len(arrivals) - 1):
            started = True
            startup_wall = Fraction(arrival.completion_nanoseconds, 1_000_000_000)
            startup_playable = buffered
            minimum_buffer = buffered
        queued_complete = max(0, len(queued) - 1) if started else len(queued)
        if queued_complete > MAXIMUM_QUEUED_UNITS or buffered > MAXIMUM_BUFFER_SECONDS:
            raise BatchBenchmarkError("resource-limit")
        peak_queued = max(peak_queued, queued_complete)
        peak_buffer = max(peak_buffer, buffered)
        previous_completion = arrival.completion_nanoseconds

    consume(buffered)
    minimum_buffer = Fraction(0) if minimum_buffer is None else min(minimum_buffer, buffered)
    buffering_per_minute = buffering * 60 / total_media if total_media > 0 else Fraction(0)
    return PlaybackSimulation(
        startup_wall_seconds=startup_wall,
        startup_playable_seconds=startup_playable,
        played_seconds=played,
        minimum_buffer_seconds=minimum_buffer,
        peak_buffer_seconds=peak_buffer,
        underrun_count=underruns,
        buffering_seconds=buffering,
        buffering_seconds_per_minute=buffering_per_minute,
        peak_queued_units=peak_queued,
        peak_active_batches=1,
        stale_played_units=0,
    )
