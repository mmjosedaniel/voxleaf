"""Concrete threaded bridge regressions; synthetic audio and benign children only."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, wait
from pathlib import Path
from threading import Event, local
from typing import Any

import pytest

from benchmarks.batch_contracts import BatchAudioUnit, BatchGenerationRequest
from benchmarks.batch_fake import DeterministicBatchCandidateFactory
from benchmarks.contracts import AdapterOperationError
from benchmarks.dual_worker_contracts import (
    CPU_WORKER_ROLE,
    GPU_WORKER_ROLE,
    DualWorkerRole,
    DualWorkIdentity,
)
from benchmarks.dual_worker_controller import BoundedDualWorkerController
from benchmarks.dual_worker_fake import DeterministicDualWorkerRuntime
from benchmarks.dual_worker_matrix import build_v5_requests
from benchmarks.dual_worker_official import serialize_dispatches
from benchmarks.dual_worker_runtime import ThreadedDualWorkerRuntime
from benchmarks.isolation import IsolatedBenchmarkAdapter


def test_efc_03_ordered_frontier_survives_collection_order_without_overcount(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    clock = local()
    clock.now = 0
    monkeypatch.setattr(
        "benchmarks.dual_worker_runtime.time.perf_counter_ns", lambda: getattr(clock, "now", 0)
    )
    candidates = {
        role: IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
        for role in (GPU_WORKER_ROLE, CPU_WORKER_ROLE)
    }
    runtime = runtime_for(candidates)
    finishes = (300, 200, 1500)

    def generate(request: BatchGenerationRequest, **_kwargs: Any) -> tuple[BatchAudioUnit, ...]:
        unit = request.units[0]
        clock.now = finishes[unit.source_sequence]
        return (
            BatchAudioUnit(
                request.identity,
                request.call_index,
                unit.unit_id,
                unit.source_sequence,
                0,
                24000,
                24000,
                1,
                "float32",
            ),
        )

    for candidate in candidates.values():
        monkeypatch.setattr(candidate, "generate_batch", generate)
    collect = runtime.next_completion
    collection_order: list[int] = []

    def collect_all(roles: frozenset[DualWorkerRole]) -> Any:
        assert not wait([work.future for work in runtime._active.values()], timeout=5).not_done
        clock.now = 1000 if not collection_order else 2000
        result = collect(roles)
        collection_order.append(result.request.source_sequence)
        return result

    monkeypatch.setattr(runtime, "next_completion", collect_all)
    try:
        observation = BoundedDualWorkerController().run(
            arm="concurrent", runtime=runtime, requests=requests()[:3]
        )
        assert collection_order == [0, 2, 1]  # GPU priority; later source collected first.
        assert [audio.source_sequence for audio in observation.released] == [0, 1, 2]
        assert [item.completed_nanoseconds for item in observation.dispatches] == list(finishes)
        assert [item.head_of_line_wait_nanoseconds for item in observation.dispatches] == [
            0,
            100,
            0,
        ]
        serialized = serialize_dispatches(observation)
        assert [item["generationSeconds"] for item in serialized] == [3e-7, 2e-7, 5e-7]
        assert [item["rtf"] for item in serialized] == [3e-7, 2e-7, 5e-7]
        assert [item["headOfLineWaitSeconds"] for item in serialized] == [0, 1e-7, 0]
    finally:
        runtime.close()


def requests() -> Any:
    return build_v5_requests(
        Path(__file__).resolve().parents[3],
        arm="concurrent",
        identity=DualWorkIdentity("efc-session", "efc-generation"),
    )


def runtime_for(
    candidates: dict[DualWorkerRole, IsolatedBenchmarkAdapter],
) -> ThreadedDualWorkerRuntime:
    identities = tuple(
        worker for worker in DeterministicDualWorkerRuntime().workers if worker.role in candidates
    )
    return ThreadedDualWorkerRuntime(candidates, identities)


def test_efc_02_cancel_entered_work_prevents_lazy_reload_and_close_drains(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    candidate = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    runtime = runtime_for({GPU_WORKER_ROLE: candidate})
    entered, release, closing = Event(), Event(), Event()
    original = candidate.generate_batch
    loads: list[int] = []
    load = candidate.load

    def counted_load() -> None:
        loads.append(1)
        load()

    def delayed(*args: Any, **kwargs: Any) -> Any:
        entered.set()
        assert release.wait(5)
        return original(*args, **kwargs)

    monkeypatch.setattr(candidate, "load", counted_load)
    monkeypatch.setattr(candidate, "generate_batch", delayed)
    runtime.load_worker(GPU_WORKER_ROLE)
    assert candidate.worker_pid is not None
    request = requests()[0]
    try:
        runtime.submit(GPU_WORKER_ROLE, request)
        assert entered.wait(5)
        runtime.cancel(GPU_WORKER_ROLE, request.occurrence_id)
        assert candidate.worker_pid is None
        original_close = candidate.close

        def observed_close() -> None:
            original_close()
            closing.set()

        monkeypatch.setattr(candidate, "close", observed_close)
        with ThreadPoolExecutor(max_workers=1) as closer:
            future = closer.submit(runtime.close)
            assert closing.wait(5)
            release.set()
            future.result(timeout=10)
        assert loads == [1]
        assert candidate.worker_pid is None
        runtime.close()
    finally:
        release.set()
        runtime.close()
        candidate.close()


def test_efc_02_cancel_pending_future_never_enters_adapter(monkeypatch: pytest.MonkeyPatch) -> None:
    candidate = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    runtime = runtime_for({GPU_WORKER_ROLE: candidate})
    release, occupied = Event(), Event()
    calls: list[int] = []

    def occupy() -> None:
        occupied.set()
        assert release.wait(5)

    blocker = runtime._executor.submit(occupy)
    assert occupied.wait(5)
    monkeypatch.setattr(candidate, "generate_batch", lambda *_args, **_kwargs: calls.append(1))
    request = requests()[0]
    try:
        runtime.submit(GPU_WORKER_ROLE, request)
        runtime.cancel(GPU_WORKER_ROLE, request.occurrence_id)
    finally:
        release.set()
        blocker.result(timeout=5)
        runtime.close()
    assert calls == []


def test_efc_02_close_contains_load_startup_handoff(monkeypatch: pytest.MonkeyPatch) -> None:
    candidate = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    runtime = runtime_for({GPU_WORKER_ROLE: candidate})
    entered, release, first_sweep = Event(), Event(), Event()
    start, close = candidate._start, candidate.close

    def delayed_start() -> None:
        entered.set()
        assert release.wait(5)
        start()

    def observed_close() -> None:
        close()
        first_sweep.set()

    monkeypatch.setattr(candidate, "_start", delayed_start)
    monkeypatch.setattr(candidate, "close", observed_close)
    with ThreadPoolExecutor(max_workers=2) as executor:
        loading = executor.submit(runtime.load_worker, GPU_WORKER_ROLE)
        try:
            assert entered.wait(5)
            closing = executor.submit(runtime.close)
            assert first_sweep.wait(5)
            release.set()
            loading.result(timeout=10)
            closing.result(timeout=10)
            assert candidate.worker_pid is None
            runtime.close()
        finally:
            release.set()
            runtime.close()
            candidate.close()


@pytest.mark.parametrize("failure", [False, True])
def test_efc_03_finish_timestamp_survives_delayed_gpu_first_collection(
    monkeypatch: pytest.MonkeyPatch,
    failure: bool,
) -> None:
    clock = [100]
    monkeypatch.setattr("benchmarks.dual_worker_runtime.time.perf_counter_ns", lambda: clock[0])
    candidates = {
        role: IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
        for role in (GPU_WORKER_ROLE, CPU_WORKER_ROLE)
    }
    runtime = runtime_for(candidates)

    def result(request: BatchGenerationRequest, **_kwargs: Any) -> tuple[BatchAudioUnit, ...]:
        if failure:
            raise AdapterOperationError("generation-failed")
        unit = request.units[0]
        return (
            BatchAudioUnit(
                request.identity,
                request.call_index,
                unit.unit_id,
                unit.source_sequence,
                0,
                24000,
                24000,
                1,
                "float32",
            ),
        )

    for candidate in candidates.values():
        monkeypatch.setattr(candidate, "generate_batch", result)
    try:
        for role, request, at in [
            (CPU_WORKER_ROLE, requests()[1], 200),
            (GPU_WORKER_ROLE, requests()[0], 300),
        ]:
            clock[0] = at
            runtime.submit(role, request)
            assert not wait([runtime._active[role].future], timeout=5).not_done
        clock[0] = 9000
        gpu = runtime.next_completion(frozenset(candidates))
        cpu = runtime.next_completion(frozenset({CPU_WORKER_ROLE}))
        assert gpu.worker.role == GPU_WORKER_ROLE
        assert (gpu.completed_nanoseconds, cpu.completed_nanoseconds) == (300, 200)
        assert gpu.status == ("failed" if failure else "completed")
    finally:
        runtime.close()
