"""Concrete threaded bridge regressions; synthetic audio and benign children only."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, wait
from pathlib import Path
from threading import Event, Thread, get_ident, local
from typing import Any
from unittest.mock import Mock

import pytest

from benchmarks import dual_worker_official as official
from benchmarks.batch_contracts import BatchAudioUnit, BatchGenerationRequest
from benchmarks.batch_fake import DeterministicBatchCandidateFactory
from benchmarks.contracts import AdapterOperationError
from benchmarks.dual_worker_contracts import (
    CPU_WORKER_ROLE,
    GPU_WORKER_ROLE,
    DualWorkerBenchmarkError,
    DualWorkerRole,
    DualWorkIdentity,
)
from benchmarks.dual_worker_controller import BoundedDualWorkerController
from benchmarks.dual_worker_fake import DeterministicDualWorkerRuntime
from benchmarks.dual_worker_matrix import build_v5_requests
from benchmarks.dual_worker_official import serialize_dispatches
from benchmarks.dual_worker_runtime import ThreadedDualWorkerRuntime
from benchmarks.isolation import IsolatedBenchmarkAdapter
from benchmarks.memory import WindowsGpuProcessMemorySampler


def _monitor_fixture(
    monkeypatch: pytest.MonkeyPatch,
) -> tuple[official.DualWorkerMemoryMonitor, list[tuple[str, int]]]:
    closes: list[tuple[str, int]] = []
    process = Mock()
    process.process_working_set_bytes.return_value = 1

    def probe(label: str) -> Mock:
        sampler = Mock()
        sampler.sample.return_value = (0, 0)
        sampler.close.side_effect = lambda: closes.append((label, get_ident()))
        return sampler

    dedicated = probe("dedicated")
    shared = probe("shared")
    monkeypatch.setattr(official, "WindowsProcessResourceSampler", lambda: process)
    monkeypatch.setattr(
        official, "WindowsGpuProcessMemorySampler", lambda *args: shared if args else dedicated
    )
    monkeypatch.setattr(
        official, "windows_system_memory", lambda: (8 * official.GIB, 0, 16 * official.GIB)
    )
    runtime = Mock(spec=ThreadedDualWorkerRuntime)
    runtime.worker_pid.return_value = 123
    runtime.framework_memory_high_water_bytes.return_value = 0
    return official.DualWorkerMemoryMonitor(runtime, (GPU_WORKER_ROLE,)), closes


@pytest.mark.parametrize("blocked", ["periodic", "final"])
def test_five_pass_1_7_finish_does_not_sample_or_close_under_the_live_owner(
    blocked: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    monitor, closes = _monitor_fixture(monkeypatch)
    monkeypatch.setattr(official, "RAM_SAMPLE_SECONDS", 0.001 if blocked == "periodic" else 60)
    monkeypatch.setattr(official, "MONITOR_JOIN_SECONDS", 0.05, raising=False)
    caller = get_ident()
    samples: list[int] = []
    finish_callers: list[int] = []
    entered, release = Event(), Event()
    sample = monitor.sample_once

    def sample_once() -> None:
        samples.append(get_ident())
        if len(samples) == 2:
            entered.set()
            assert release.wait(timeout=5)
        sample()

    def finish_from_other_thread() -> official.MonitorResult:
        finish_callers.append(get_ident())
        return monitor.finish()

    monkeypatch.setattr(monitor, "sample_once", sample_once)
    monitor.start()
    with ThreadPoolExecutor(max_workers=1) as pool:
        try:
            if blocked == "periodic":
                assert entered.wait(timeout=2)
            finish = pool.submit(finish_from_other_thread)
            assert entered.wait(timeout=2)
            with pytest.raises(DualWorkerBenchmarkError, match="cleanup-failed"):
                finish.result(timeout=2)
            assert closes == []
            assert len(samples) == 2
            assert samples[0] == caller
            assert monitor._thread is not None and monitor._thread.is_alive()
        finally:
            release.set()
    monkeypatch.setattr(official, "MONITOR_JOIN_SECONDS", 1.0)
    result = monitor.finish()
    assert monitor.finish() == result
    assert len(result.samples) == (3 if blocked == "periodic" else 2)
    assert samples[1] not in [caller, *finish_callers]
    assert samples == [caller, *([samples[1]] * (len(result.samples) - 1))]
    assert closes == [("dedicated", samples[1]), ("shared", samples[1])]


@pytest.mark.parametrize(
    "failure_at", ["initial-sample", "initial-and-close", "thread-start", "late-thread-start"]
)
def test_five_pass_1_7_start_failure_closes_both_caller_owned_probes(
    failure_at: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    monitor, closes = _monitor_fixture(monkeypatch)
    failure = RuntimeError("synthetic monitor startup failure")
    close_failure = RuntimeError("synthetic startup cleanup failure")
    launched: list[Thread] = []
    if failure_at.startswith("initial"):
        monkeypatch.setattr(monitor, "sample_once", Mock(side_effect=failure))
        if failure_at == "initial-and-close":
            original_close = monitor._dedicated.close

            def close() -> None:
                original_close()
                raise close_failure

            monkeypatch.setattr(monitor._dedicated, "close", close)
    else:
        original_start = Thread.start

        def start(thread: Thread) -> None:
            if failure_at == "late-thread-start":
                original_start(thread)
                launched.append(thread)
            raise failure

        monkeypatch.setattr(Thread, "start", start)
    with pytest.raises(RuntimeError) as caught:
        monitor.start()
    assert caught.value is failure
    for thread in launched:
        thread.join(timeout=2)
        assert not thread.is_alive()
    if failure_at == "initial-and-close":
        cause = caught.value.__cause__
        assert isinstance(cause, BaseExceptionGroup)
        assert cause.exceptions == (close_failure,)
    assert closes == [("dedicated", get_ident()), ("shared", get_ident())]


@pytest.mark.parametrize("failures", ["final-sample", "periodic-final-and-close", "close-only"])
def test_five_pass_1_7_owner_reports_all_sampling_and_close_failures(
    failures: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    monitor, closes = _monitor_fixture(monkeypatch)
    periodic = failures == "periodic-final-and-close"
    closing = failures != "final-sample"
    monkeypatch.setattr(official, "RAM_SAMPLE_SECONDS", 0.001 if periodic else 60)
    caller = get_ident()
    samples: list[int] = []
    sampling = monitor.sample_once
    periodic_failed = Event()
    periodic_error = RuntimeError("synthetic periodic sample failure")
    final_error = RuntimeError("synthetic final sample failure")
    dedicated_error = RuntimeError("synthetic dedicated close failure")
    shared_error = RuntimeError("synthetic shared close failure")

    def sample_once() -> None:
        samples.append(get_ident())
        if periodic and len(samples) == 2:
            periodic_failed.set()
            raise periodic_error
        if failures != "close-only" and len(samples) > 1:
            raise final_error
        sampling()

    def failing_close(probe: WindowsGpuProcessMemorySampler, error: RuntimeError) -> None:
        original = probe.close

        def close() -> None:
            original()
            raise error

        monkeypatch.setattr(probe, "close", close)

    monkeypatch.setattr(monitor, "sample_once", sample_once)
    if closing:
        failing_close(monitor._dedicated, dedicated_error)
        failing_close(monitor._shared, shared_error)
    monitor.start()
    try:
        if periodic:
            assert periodic_failed.wait(timeout=2)
    finally:
        code = "cleanup-failed" if closing else "resource-limit"
        with pytest.raises(DualWorkerBenchmarkError, match=code) as caught:
            monitor.finish()
    expected: list[BaseException] = []
    if periodic:
        expected.append(periodic_error)
    if failures != "close-only":
        expected.append(final_error)
    if closing:
        expected.extend((dedicated_error, shared_error))
    cause = caught.value.__cause__
    assert isinstance(cause, BaseExceptionGroup)
    assert cause.exceptions == tuple(expected)
    assert samples == ([caller, samples[1], samples[1]] if periodic else [caller, samples[1]])
    assert samples[1] != caller
    assert closes == [("dedicated", samples[1]), ("shared", samples[1])]


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


def _synthetic_output(
    request: BatchGenerationRequest, **_kwargs: Any
) -> tuple[BatchAudioUnit, ...]:
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


def test_ccf_c10_obsolete_cancellation_preserves_replacement(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    role = GPU_WORKER_ROLE
    candidate = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    runtime = runtime_for({role: candidate})
    first, replacement = requests()[:2]
    cancellations: list[str] = []
    monkeypatch.setattr(candidate, "generate_batch", _synthetic_output)
    monkeypatch.setattr(
        candidate, "cancel", lambda request_id, **_kwargs: cancellations.append(request_id)
    )
    try:
        runtime.submit(role, first)
        assert runtime.next_completion(frozenset({role})).request == first
        runtime.submit(role, replacement)
        runtime.cancel(role, first.occurrence_id)
        runtime.cancel(role, first.occurrence_id)
        assert cancellations == []
        completion = runtime.next_completion(frozenset({role}))
        assert completion.request == replacement
        assert completion.status == "completed"
    finally:
        runtime.close()


def test_ccf_c10_cancelled_queue_reserves_role_until_adapter_dispatch_finishes(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    role = GPU_WORKER_ROLE
    candidate = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    runtime = runtime_for({role: candidate})
    first, replacement = requests()[:2]
    occupied, release_executor, dispatching, finish_dispatch = (Event() for _ in range(4))

    def occupy() -> None:
        occupied.set()
        assert release_executor.wait(5)

    def cancel(_request_id: str, *, cancel_idle: bool) -> None:
        assert cancel_idle
        dispatching.set()
        assert finish_dispatch.wait(5)

    blocker = runtime._executor.submit(occupy)
    monkeypatch.setattr(candidate, "cancel", cancel)
    monkeypatch.setattr(candidate, "generate_batch", _synthetic_output)
    try:
        assert occupied.wait(5)
        runtime.submit(role, first)
        queued = runtime._active[role].future
        with ThreadPoolExecutor(max_workers=1) as canceller:
            cancelling = canceller.submit(runtime.cancel, role, first.occurrence_id)
            try:
                assert dispatching.wait(5)
                assert queued.cancelled()
                with pytest.raises(DualWorkerBenchmarkError, match="resource-limit"):
                    runtime.submit(role, replacement)
            finally:
                finish_dispatch.set()
                cancelling.result(timeout=5)
        release_executor.set()
        blocker.result(timeout=5)
        runtime.submit(role, replacement)
        assert runtime.next_completion(frozenset({role})).request == replacement
    finally:
        release_executor.set()
        blocker.result(timeout=5)
        runtime.close()


def test_ccf_c10_late_output_drains_before_reuse_and_cancel_is_idempotent(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    role = GPU_WORKER_ROLE
    candidate = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    runtime = runtime_for({role: candidate})
    first, replacement = requests()[:2]
    entered, release = Event(), Event()
    cancellations: list[tuple[str, bool]] = []

    def generate(request: BatchGenerationRequest, **_kwargs: Any) -> tuple[BatchAudioUnit, ...]:
        entered.set()
        assert release.wait(5)
        return _synthetic_output(request)

    def cancel(request_id: str, *, cancel_idle: bool) -> None:
        cancellations.append((request_id, cancel_idle))

    monkeypatch.setattr(candidate, "generate_batch", generate)
    monkeypatch.setattr(candidate, "cancel", cancel)
    try:
        runtime.submit(role, first)
        assert entered.wait(5)
        active = runtime._active[role].future
        runtime.cancel(role, first.occurrence_id)
        runtime.cancel(role, first.occurrence_id)
        assert cancellations == [(f"batch-{first.source_sequence}", True)]
        with pytest.raises(DualWorkerBenchmarkError, match="resource-limit"):
            runtime.submit(role, replacement)
        release.set()
        assert active.result(timeout=5).outputs
        runtime.submit(role, replacement)
        assert runtime.next_completion(frozenset({role})).request == replacement
    finally:
        release.set()
        runtime.close()


def test_ccf_c10_failed_cancellation_keeps_owner_for_exact_retry(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    role = GPU_WORKER_ROLE
    candidate = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    runtime = runtime_for({role: candidate})
    first, replacement = requests()[:2]
    cancellations: list[tuple[str, bool]] = []

    def cancel(request_id: str, *, cancel_idle: bool) -> None:
        cancellations.append((request_id, cancel_idle))
        if len(cancellations) == 1:
            raise AdapterOperationError("cleanup-failed")

    monkeypatch.setattr(candidate, "generate_batch", _synthetic_output)
    monkeypatch.setattr(candidate, "cancel", cancel)
    try:
        runtime.submit(role, first)
        assert runtime._active[role].future.result(timeout=5).outputs
        with pytest.raises(DualWorkerBenchmarkError, match="cleanup-failed"):
            runtime.cancel(role, first.occurrence_id)
        with pytest.raises(DualWorkerBenchmarkError, match="resource-limit"):
            runtime.submit(role, replacement)
        runtime.cancel(role, replacement.occurrence_id)
        runtime.cancel(role, first.occurrence_id)
        runtime.cancel(role, first.occurrence_id)
        assert cancellations == [(f"batch-{first.source_sequence}", True)] * 2
        runtime.submit(role, replacement)
        assert runtime.next_completion(frozenset({role})).request == replacement
    finally:
        runtime.close()


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
