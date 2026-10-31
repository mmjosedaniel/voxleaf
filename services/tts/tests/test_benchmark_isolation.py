"""Spawned-worker bounds, termination, stale-output, and cleanup tests."""

from __future__ import annotations

import time
from pathlib import Path
from typing import NoReturn

import pytest

from benchmarks.batch_contracts import (
    BatchGenerationRequest,
    BatchUnitRequest,
    BatchWorkIdentity,
)
from benchmarks.batch_fake import DeterministicBatchCandidateFactory
from benchmarks.contracts import AdapterOperationError, AudioChunk, FailureCode, GenerationRequest
from benchmarks.fake_adapter import FakeMemoryProbe, FakeNanosecondClock
from benchmarks.harness import (
    MAX_SAMPLE_FRAMES_PER_REQUEST,
    BenchmarkHarness,
)
from benchmarks.isolation import IsolatedBenchmarkAdapter, IsolationTimeouts
from benchmarks.process_fake import ProcessFakeAdapter, ProcessFakeFactory


@pytest.mark.parametrize("failure", ["join", "close", "survives"])
def test_r7_03_retains_failed_teardown_and_blocks_replacement(
    monkeypatch: pytest.MonkeyPatch, failure: str
) -> None:
    adapter = IsolatedBenchmarkAdapter(ProcessFakeFactory(), forbidden_values=())
    adapter.load()
    process = adapter._process
    assert process is not None
    original_join = process.join
    original_close = process.close
    original_alive = process.is_alive
    original_kill = process.kill
    original_pid = process.pid
    assert original_pid is not None
    # Stop the benign child first, so the survival simulation never targets a
    # fabricated or reused PID. All injected process methods are restored below.
    process.kill()
    process.join(5)
    assert not process.is_alive()

    def fail(*_args: object) -> None:
        raise OSError("synthetic teardown failure")

    try:
        if failure == "join":
            monkeypatch.setattr(process, "is_alive", lambda: True)
            monkeypatch.setattr(process, "join", fail)
        elif failure == "close":
            monkeypatch.setattr(process, "close", fail)
        else:
            monkeypatch.setattr(process, "is_alive", lambda: True)
            monkeypatch.setattr(process, "kill", lambda: None)
        # The retained process is already dead; do not issue OS tree termination.
        monkeypatch.setattr("benchmarks.isolation.subprocess.run", lambda *_a, **_k: None)
        monkeypatch.setattr("benchmarks.isolation.os.killpg", lambda *_a: None, raising=False)
        cleanup_error: Exception | None = None
        try:
            adapter.cancel("r7-owned")
        except Exception as error:
            cleanup_error = error
        assert adapter._process is process
        assert isinstance(cleanup_error, AdapterOperationError)
        assert cleanup_error.code == "cleanup-failed"
        assert adapter.was_cancelled("r7-owned")
        assert not adapter._loaded
        with pytest.raises(AdapterOperationError, match="cleanup-failed"):
            adapter.load()
        assert adapter._process is process
    finally:
        monkeypatch.setattr(process, "join", original_join)
        monkeypatch.setattr(process, "close", original_close)
        monkeypatch.setattr(process, "is_alive", original_alive)
        monkeypatch.setattr(process, "kill", original_kill)
        lost_owner = adapter._process is None
        adapter.close()
        # The pre-fix implementation loses its reference; release our test owner.
        if lost_owner:
            process.close()
    assert adapter._process is None
    adapter.close()


@pytest.mark.parametrize("elapsed", [70.0, 121.0])
def test_vca07_receives_only_the_remaining_request_deadline(
    monkeypatch: pytest.MonkeyPatch,
    elapsed: float,
) -> None:
    clock = [0.0]
    waits: list[float] = []
    aborted: list[FailureCode] = []
    adapter = IsolatedBenchmarkAdapter(ProcessFakeFactory(), forbidden_values=())
    monkeypatch.setattr(time, "monotonic", lambda: clock[0])
    monkeypatch.setattr(adapter, "_ensure_loaded", lambda: None)
    monkeypatch.setattr(adapter, "_send", lambda _message: None)

    def abort(code: FailureCode) -> NoReturn:
        aborted.append(code)
        raise AdapterOperationError(code)

    def receive(timeout: float) -> tuple[object, ...]:
        waits.append(timeout)
        if len(waits) == 2 and timeout <= 50:
            abort("timeout")  # Later chunk is blocked beyond the remaining budget.
        clock[0] += 70
        return (
            "chunk",
            AudioChunk(
                request_id="process-request",
                sequence=len(waits) - 1,
                sample_count=1,
                sample_rate_hz=24_000,
                channels=1,
                sample_format="float32",
                end_of_output=False,
            ),
        )

    monkeypatch.setattr(adapter, "receive", receive)
    monkeypatch.setattr(adapter, "abort", abort)
    generation = adapter.generate(_request())
    assert next(generation).sequence == 0
    clock[0] = elapsed
    with pytest.raises(AdapterOperationError, match="timeout"):
        next(generation)
    assert aborted == ["timeout"]
    assert waits == ([120.0, 50.0] if elapsed == 70 else [120.0])


class _VafDiagnosticAdapter(ProcessFakeAdapter):
    def load(self) -> None:
        super().load()
        print("x" * 65_537, end="")
        print("fragmented-", end="")
        print("canary", end="")


def test_vaf_fragmented_diagnostic_propagates_through_worker_and_cleans_up() -> None:
    adapter = IsolatedBenchmarkAdapter(
        _VafDiagnosticAdapter, forbidden_values=("fragmented-canary",)
    )
    try:
        with pytest.raises(AdapterOperationError, match="privacy"):
            adapter.load()
    finally:
        adapter.close()
    assert adapter.worker_pid is None


def _request(request_id: str = "process-request") -> GenerationRequest:
    return GenerationRequest(
        request_id=request_id,
        case_id="process-case",
        phase="warm",
        text="Texto sintético privado.",
    )


def _batch_request() -> BatchGenerationRequest:
    return BatchGenerationRequest(
        call_index=1,
        phase="measured",
        pass_index=1,
        pair_id="es-v4-pair-01",
        attempt=1,
        identity=BatchWorkIdentity("session", "generation"),
        units=(
            BatchUnitRequest("es-v4-arrival", 0, "Uno."),
            BatchUnitRequest("es-v4-dialogue", 1, "Dos."),
        ),
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


def test_worker_returns_one_bounded_ordered_batch_without_payload() -> None:
    adapter = IsolatedBenchmarkAdapter(
        DeterministicBatchCandidateFactory(),
        forbidden_values=("Uno.", "Dos."),
    )
    outputs = adapter.generate_batch(_batch_request())
    assert [output.unit_id for output in outputs] == [
        "es-v4-arrival",
        "es-v4-dialogue",
    ]
    assert all(output.sample_count == 240_000 for output in outputs)
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
