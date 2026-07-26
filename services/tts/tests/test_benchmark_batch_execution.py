"""Model-free v4 ordered-batch and playback proofs."""

from __future__ import annotations

import json
from fractions import Fraction

import pytest

from benchmarks.batch_contracts import (
    BatchBenchmarkError,
    BatchExecutionObservation,
    BatchFailureCode,
    BatchGenerationRequest,
    BatchUnitRequest,
    BatchWorkIdentity,
)
from benchmarks.batch_execution import BoundedOrderedBatchController
from benchmarks.batch_fake import (
    DeterministicBatchCandidate,
    FakeBatchClock,
    FakeBatchResourceProbe,
    FakeBatchScenario,
)
from benchmarks.batch_playback import PlaybackArrival, simulate_bounded_playback


def _request() -> BatchGenerationRequest:
    return BatchGenerationRequest(
        call_index=3,
        phase="measured",
        pass_index=1,
        pair_id="es-v4-pair-01",
        attempt=1,
        identity=BatchWorkIdentity("session", "generation"),
        units=(
            BatchUnitRequest("es-v4-arrival", 0, "Texto sintético uno."),
            BatchUnitRequest("es-v4-dialogue", 1, "Texto sintético dos."),
        ),
    )


def _execute(
    scenario: FakeBatchScenario = "ordered",
    *,
    invalidate_before_publication: bool = False,
) -> BatchExecutionObservation:
    clock = FakeBatchClock()
    controller = BoundedOrderedBatchController(
        clock=clock,
        resource_probe=FakeBatchResourceProbe(),
    )
    candidate = DeterministicBatchCandidate(clock, scenario=scenario)
    result = controller.execute(
        candidate,
        _request(),
        before_publication=(
            (lambda _request: controller.identity_gate.invalidate())
            if invalidate_before_publication
            else None
        ),
    )
    return result


def test_ordered_batch_records_unit_timing_identity_resources_and_bounds() -> None:
    result = _execute()
    assert result.call.status == "completed"
    assert result.call.batch_size == 2
    assert result.call.completed_nanoseconds == 5_000_000_000
    assert [unit.unit_id for unit in result.units] == [
        "es-v4-arrival",
        "es-v4-dialogue",
    ]
    assert [unit.published_sequence for unit in result.units] == [0, 1]
    assert all(unit.duration_seconds == 10 for unit in result.units)
    assert all(unit.request_rtf == 0.5 for unit in result.units)
    assert result.peak_retained_units == 2
    assert result.peak_active_batches == 1
    assert result.resource_peak.process_tree_ram_bytes == 1_000_000_002
    assert "Texto sintético" not in repr(result)


@pytest.mark.parametrize(
    ("scenario", "expected"),
    [
        ("swapped-output", "invalid-output"),
        ("one-item-failure", "generation-failed"),
        ("timeout", "timeout"),
        ("stale-identity", "stale-identity"),
        ("cancellation", "cancelled"),
        ("out-of-memory", "out-of-memory"),
    ],
)
def test_batch_failures_invalidate_the_whole_batch_without_publication(
    scenario: FakeBatchScenario,
    expected: BatchFailureCode,
) -> None:
    result = _execute(scenario)
    assert result.call.failure_code == expected
    assert result.published == ()
    assert all(unit.published_sequence is None for unit in result.units)
    assert all(unit.status != "completed" for unit in result.units)


def test_generation_replacement_rejects_every_completed_output_as_stale() -> None:
    result = _execute(invalidate_before_publication=True)
    assert result.call.failure_code == "stale-identity"
    assert result.published == ()
    assert [unit.status for unit in result.units] == [
        "stale-rejected",
        "stale-rejected",
    ]


def test_cleanup_failure_is_fixed_and_content_free() -> None:
    clock = FakeBatchClock()
    controller = BoundedOrderedBatchController(clock=clock)
    candidate = DeterministicBatchCandidate(clock, scenario="cleanup-failure")
    with pytest.raises(
        BatchBenchmarkError,
        match=r"^tts-benchmark-v4-batch:cleanup-failed$",
    ):
        controller.close(candidate)


def test_playback_arithmetic_is_exact_and_replay_is_deterministic() -> None:
    arrivals = (
        PlaybackArrival(5_000_000_000, 0, 240_000, 24_000),
        PlaybackArrival(5_000_000_000, 1, 240_000, 24_000),
        PlaybackArrival(13_000_000_000, 2, 240_000, 24_000),
    )
    first = simulate_bounded_playback(arrivals)
    second = simulate_bounded_playback(arrivals)
    assert first == second
    assert first.startup_wall_seconds == Fraction(5)
    assert first.startup_playable_seconds == Fraction(20)
    assert first.played_seconds == Fraction(30)
    assert first.underrun_count == 0
    assert first.buffering_seconds == 0
    assert first.peak_queued_units == 2
    assert json.dumps(first.as_raw(), sort_keys=True) == json.dumps(
        second.as_raw(),
        sort_keys=True,
    )


def test_playback_reports_underrun_and_rejects_stale_or_unbounded_input() -> None:
    underrun = simulate_bounded_playback(
        (
            PlaybackArrival(5_000_000_000, 0, 192_000, 24_000),
            PlaybackArrival(5_000_000_000, 1, 192_000, 24_000),
            PlaybackArrival(25_000_000_000, 2, 192_000, 24_000),
        )
    )
    assert underrun.startup_playable_seconds == 16
    assert underrun.buffering_seconds == 4
    assert underrun.underrun_count == 1
    assert underrun.buffering_seconds_per_minute == Fraction(10)

    with pytest.raises(BatchBenchmarkError, match="stale-identity"):
        simulate_bounded_playback((PlaybackArrival(1, 0, 240_000, 24_000, stale=True),))
    with pytest.raises(BatchBenchmarkError, match="resource-limit"):
        simulate_bounded_playback(
            (
                PlaybackArrival(1, 0, 240_000, 24_000),
                PlaybackArrival(1, 1, 240_000, 24_000),
                PlaybackArrival(1, 2, 240_000, 24_000),
                PlaybackArrival(1, 3, 240_000, 24_000),
            )
        )
