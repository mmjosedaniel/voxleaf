"""Spawned-worker bounds, termination, stale-output, and cleanup tests."""

from __future__ import annotations

from pathlib import Path

import pytest

from benchmarks.contracts import AdapterOperationError, GenerationRequest
from benchmarks.fake_adapter import FakeMemoryProbe, FakeNanosecondClock
from benchmarks.harness import (
    MAX_SAMPLE_FRAMES_PER_REQUEST,
    BenchmarkHarness,
)
from benchmarks.isolation import IsolatedBenchmarkAdapter, IsolationTimeouts
from benchmarks.process_fake import ProcessFakeFactory


def _request(request_id: str = "process-request") -> GenerationRequest:
    return GenerationRequest(
        request_id=request_id,
        case_id="process-case",
        phase="warm",
        text="Texto sintético privado.",
    )


def test_worker_termination_discards_late_output_and_restarts_one_clean_worker() -> None:
    memory_observations: list[int | None] = []
    adapter = IsolatedBenchmarkAdapter(
        ProcessFakeFactory(
            emit_late_chunk=True,
            framework_memory_bytes=123_456,
        ),
        forbidden_values=("Texto sintético privado.",),
        framework_memory_observer=memory_observations.append,
    )
    adapter.load()
    assert adapter.framework_memory_high_water_bytes() == 123_456
    assert memory_observations == [123_456]
    first_pid = adapter.worker_pid
    assert first_pid is not None

    generation = adapter.generate(_request("cancelled"))
    first = next(generation)
    assert first.sequence == 0
    response = adapter.cancel("cancelled")
    assert response.acknowledged is True
    assert response.stop_mode == "worker-termination"
    assert adapter.worker_pid is None
    assert tuple(generation) == ()

    replacement = tuple(adapter.generate(_request("replacement")))
    replacement_pid = adapter.worker_pid
    assert replacement_pid is not None
    assert replacement_pid != first_pid
    assert [chunk.sequence for chunk in replacement] == [0, 1]
    assert all(chunk.request_id == "replacement" for chunk in replacement)
    adapter.close()
    assert adapter.worker_pid is None


def test_worker_timeout_and_resource_limit_leave_no_child_process() -> None:
    timeouts = IsolationTimeouts(
        load_seconds=5,
        request_seconds=0.05,
        termination_seconds=2,
        cleanup_seconds=5,
    )
    timeout_adapter = IsolatedBenchmarkAdapter(
        ProcessFakeFactory(block_generation=True),
        forbidden_values=(),
        timeouts=timeouts,
    )
    timeout_adapter.load()
    generation = timeout_adapter.generate(_request("timeout"))
    with pytest.raises(
        AdapterOperationError,
        match=r"^tts-benchmark-adapter-operation:timeout$",
    ):
        next(generation)
    assert timeout_adapter.worker_pid is None

    oversized_adapter = IsolatedBenchmarkAdapter(
        ProcessFakeFactory(sample_count=MAX_SAMPLE_FRAMES_PER_REQUEST + 1),
        forbidden_values=(),
    )
    oversized_adapter.load()
    oversized = oversized_adapter.generate(_request("oversized"))
    with pytest.raises(
        AdapterOperationError,
        match=r"^tts-benchmark-adapter-operation:resource-limit$",
    ):
        next(oversized)
    assert oversized_adapter.worker_pid is None


def test_complete_waveform_end_cannot_count_as_mid_generation_cancellation() -> None:
    clock = FakeNanosecondClock()
    adapter = IsolatedBenchmarkAdapter(
        ProcessFakeFactory(),
        forbidden_values=("Texto sintético privado.",),
    )
    adapter.load()
    harness = BenchmarkHarness(clock=clock, memory_probe=FakeMemoryProbe())
    with pytest.raises(
        RuntimeError,
        match=r"^tts-benchmark:cancellation-failed:complete-output$",
    ):
        harness.observe_cancellation(
            adapter,
            GenerationRequest(
                request_id="complete-output",
                case_id="process-case",
                phase="cancellation",
                text="Texto sintético privado.",
            ),
            "after-first-audio",
            forbidden_values=("Texto sintético privado.",),
        )
    assert adapter.worker_pid is None


def test_isolation_module_contains_no_private_path_or_payload_transport(tmp_path: Path) -> None:
    adapter = IsolatedBenchmarkAdapter(
        ProcessFakeFactory(),
        forbidden_values=(str(tmp_path), "Texto sintético privado."),
    )
    representation = repr(adapter)
    assert str(tmp_path) not in representation
    assert "Texto sintético privado." not in representation
    adapter.close()
