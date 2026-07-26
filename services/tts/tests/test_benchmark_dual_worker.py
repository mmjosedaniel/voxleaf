"""Model-free v5 independent-worker scheduling and playback evidence."""

from __future__ import annotations

from dataclasses import replace
from fractions import Fraction
from pathlib import Path

import pytest

from benchmarks.dual_worker_contracts import (
    CPU_WORKER_ROLE,
    GPU_WORKER_ROLE,
    DualDispatchObservation,
    DualUnitRequest,
    DualWorkerArm,
    DualWorkerBenchmarkError,
    DualWorkIdentity,
)
from benchmarks.dual_worker_controller import BoundedDualWorkerController
from benchmarks.dual_worker_fake import DeterministicDualWorkerRuntime
from benchmarks.dual_worker_matrix import build_v5_requests
from benchmarks.dual_worker_playback import (
    MAXIMUM_PCM_BYTES,
    MAXIMUM_PLAYABLE_SECONDS,
    simulate_v5_playback,
)

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
IDENTITY = DualWorkIdentity("fixture-session", "fixture-generation")


def _requests(arm: DualWorkerArm = "concurrent") -> tuple[DualUnitRequest, ...]:
    return build_v5_requests(REPOSITORY_ROOT, arm=arm, identity=IDENTITY)


def test_frozen_matrix_expands_exact_arm_counts_and_occurrence_order() -> None:
    cpu = _requests("cpu-solo")
    gpu = _requests("gpu-solo")
    concurrent = _requests()

    assert len(cpu) == 8
    assert len(gpu) == len(concurrent) == 40
    assert cpu[0].occurrence_id == "v5-cpu-p01-es-v4-arrival"
    assert gpu[-1].occurrence_id == "v5-gpu-p05-es-v4-closing"
    assert concurrent[-1].source_sequence == 39
    assert all(request.attempt == 1 for request in concurrent)
    assert "narrationText" not in repr(concurrent[0])


def test_concurrent_dispatch_is_deterministic_and_releases_in_order() -> None:
    runtime = DeterministicDualWorkerRuntime(
        gpu_generation_nanoseconds=4_000_000_000,
        cpu_generation_nanoseconds=9_000_000_000,
    )
    controller = BoundedDualWorkerController()

    result = controller.run(
        arm="concurrent",
        runtime=runtime,
        requests=_requests(),
    )
    controller.close(runtime)

    assert [item.worker_role for item in result.dispatches[:2]] == [
        GPU_WORKER_ROLE,
        CPU_WORKER_ROLE,
    ]
    assert [item.dispatch_sequence for item in result.dispatches] == list(range(40))
    assert [item.published_sequence for item in result.dispatches] == list(range(40))
    assert [item.source_sequence for item in result.released] == list(range(40))
    assert result.peak_active_units == 2
    assert result.peak_active_gpu_units == result.peak_active_cpu_units == 1
    assert result.peak_reorder_units > 1
    assert any((item.head_of_line_wait_nanoseconds or 0) > 0 for item in result.dispatches)
    assert not result.invalidated
    assert runtime.closed


@pytest.mark.parametrize(
    ("scenario", "expected"),
    [
        ("timeout", "timeout"),
        ("worker-crash", "worker-crash"),
        ("generation-failure", "generation-failed"),
        ("invalid-output", "invalid-output"),
        ("stale-output", "stale-identity"),
    ],
)
def test_failure_invalidates_identity_and_cancels_other_worker(
    scenario: str,
    expected: str,
) -> None:
    runtime = DeterministicDualWorkerRuntime(
        scenario=scenario,  # type: ignore[arg-type]
        scenario_role=CPU_WORKER_ROLE,
        gpu_generation_nanoseconds=10_000_000_000,
        cpu_generation_nanoseconds=1_000_000_000,
    )
    result = BoundedDualWorkerController().run(
        arm="concurrent",
        runtime=runtime,
        requests=_requests()[:8],
    )

    assert result.invalidated
    assert result.dispatches[1].failure_code == expected
    assert runtime.cancelled == [(GPU_WORKER_ROLE, "v5-concurrent-p01-es-v4-arrival")]
    assert not result.released


def test_identity_invalidation_before_release_rejects_stale_output() -> None:
    runtime = DeterministicDualWorkerRuntime(
        gpu_generation_nanoseconds=1_000_000_000,
        cpu_generation_nanoseconds=10_000_000_000,
    )
    controller = BoundedDualWorkerController()
    invalidations = 0

    def invalidate_once(_completion: object) -> None:
        nonlocal invalidations
        if invalidations == 0:
            invalidations += 1
            controller.invalidate_identity()

    result = controller.run(
        arm="concurrent",
        runtime=runtime,
        requests=_requests(),
        before_ordered_release=invalidate_once,
    )

    assert result.invalidated
    assert result.stale_rejected_units == 1
    assert result.dispatches[0].status == "stale-rejected"
    assert result.released == ()
    assert runtime.cancelled == [(CPU_WORKER_ROLE, "v5-concurrent-p01-es-v4-dialogue")]


def test_identity_invalidation_with_both_workers_active_cancels_both() -> None:
    runtime = DeterministicDualWorkerRuntime()
    controller = BoundedDualWorkerController()

    result = controller.run(
        arm="concurrent",
        runtime=runtime,
        requests=_requests(),
        after_initial_dispatch=controller.invalidate_identity,
    )

    assert result.invalidated
    assert result.stale_rejected_units == 2
    assert [item.status for item in result.dispatches] == [
        "stale-rejected",
        "stale-rejected",
    ]
    assert runtime.cancelled == [
        (GPU_WORKER_ROLE, "v5-concurrent-p01-es-v4-arrival"),
        (CPU_WORKER_ROLE, "v5-concurrent-p01-es-v4-dialogue"),
    ]
    assert result.released == ()


def test_controller_rejects_duplicate_identity_and_cleanup_failure() -> None:
    requests = list(_requests())
    requests[1] = replace(requests[1], occurrence_id=requests[0].occurrence_id)
    runtime = DeterministicDualWorkerRuntime()
    controller = BoundedDualWorkerController()

    with pytest.raises(
        DualWorkerBenchmarkError,
        match=r"^tts-benchmark-v5-dual-worker:resource-limit$",
    ):
        controller.run(
            arm="concurrent",
            runtime=runtime,
            requests=tuple(requests),
        )

    failing_cleanup = DeterministicDualWorkerRuntime(cleanup_failure=True)
    with pytest.raises(
        DualWorkerBenchmarkError,
        match=r"^tts-benchmark-v5-dual-worker:cleanup-failed$",
    ):
        controller.close(failing_cleanup)


def test_playback_replay_uses_exact_order_and_all_simultaneous_bounds() -> None:
    runtime = DeterministicDualWorkerRuntime(
        gpu_generation_nanoseconds=4_000_000_000,
        cpu_generation_nanoseconds=9_000_000_000,
    )
    result = BoundedDualWorkerController().run(
        arm="concurrent",
        runtime=runtime,
        requests=_requests()[:8],
    )

    replay = simulate_v5_playback(result.dispatches)

    assert replay.startup_playable_seconds >= 15
    assert replay.peak_active_units == 2
    assert replay.peak_reserved_playable_seconds <= MAXIMUM_PLAYABLE_SECONDS
    assert replay.peak_reserved_pcm_bytes <= MAXIMUM_PCM_BYTES
    assert replay.peak_complete_units <= 40
    assert replay.stale_played_units == 0
    assert replay.head_of_line_stall_seconds > 0
    assert replay.thresholds[0].reached_wall_seconds is not None
    assert replay.buffering_seconds_per_minute == Fraction(
        replay.buffering_seconds * 60,
        replay.played_seconds,
    )


def test_playback_rejects_active_overlap_duration_and_capacity_overrun() -> None:
    base = DualDispatchObservation(
        dispatch_sequence=0,
        occurrence_id="v5-gpu-p01-es-v4-arrival",
        unit_id="es-v4-arrival",
        source_sequence=0,
        pass_index=1,
        worker_role=GPU_WORKER_ROLE,
        attempt=1,
        accepted_nanoseconds=0,
        completed_nanoseconds=1,
        status="completed",
        failure_code=None,
        sample_count=480_000,
        sample_rate_hz=24_000,
        published_sequence=0,
        head_of_line_wait_nanoseconds=0,
    )
    oversized = replace(base, sample_count=480_001)
    with pytest.raises(
        DualWorkerBenchmarkError,
        match=r"^tts-benchmark-v5-dual-worker:resource-limit$",
    ):
        simulate_v5_playback((oversized,))

    overlapping = (
        replace(base, completed_nanoseconds=10),
        replace(
            base,
            dispatch_sequence=1,
            occurrence_id="v5-gpu-p01-es-v4-dialogue",
            unit_id="es-v4-dialogue",
            source_sequence=1,
            accepted_nanoseconds=1,
            completed_nanoseconds=11,
            published_sequence=1,
        ),
    )
    with pytest.raises(
        DualWorkerBenchmarkError,
        match=r"^tts-benchmark-v5-dual-worker:resource-limit$",
    ):
        simulate_v5_playback(overlapping)

    sequential = tuple(
        replace(
            base,
            dispatch_sequence=index,
            occurrence_id=f"v5-gpu-p01-unit-{index}",
            unit_id=f"unit-{index}",
            source_sequence=index,
            accepted_nanoseconds=index * 2,
            completed_nanoseconds=index * 2 + 1,
            published_sequence=index,
        )
        for index in range(16)
    )
    with pytest.raises(
        DualWorkerBenchmarkError,
        match=r"^tts-benchmark-v5-dual-worker:resource-limit$",
    ):
        simulate_v5_playback(sequential)

    too_many_complete = tuple(
        replace(
            base,
            dispatch_sequence=index,
            occurrence_id=f"v5-gpu-p01-tiny-{index}",
            unit_id=f"tiny-{index}",
            source_sequence=index,
            accepted_nanoseconds=index * 2,
            completed_nanoseconds=index * 2 + 1,
            sample_count=1,
            published_sequence=index,
        )
        for index in range(41)
    )
    with pytest.raises(
        DualWorkerBenchmarkError,
        match=r"^tts-benchmark-v5-dual-worker:resource-limit$",
    ):
        simulate_v5_playback(too_many_complete)


def test_invalidation_discards_buffer_without_playing_stale_units() -> None:
    runtime = DeterministicDualWorkerRuntime()
    result = BoundedDualWorkerController().run(
        arm="concurrent",
        runtime=runtime,
        requests=_requests(),
    )

    replay = simulate_v5_playback(
        result.dispatches,
        invalidation_nanoseconds=9_000_000_000,
    )

    assert replay.discarded_valid_seconds > 0
    assert replay.stale_played_units == 0
