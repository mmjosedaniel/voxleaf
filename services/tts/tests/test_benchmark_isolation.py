"""Spawned-worker bounds, termination, stale-output, and cleanup tests."""

from __future__ import annotations

import time
from collections.abc import Callable
from concurrent.futures import ThreadPoolExecutor
from dataclasses import replace
from pathlib import Path
from threading import Event
from typing import Any, NoReturn

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
from benchmarks.isolation import (
    BatchWitnessPhase,
    IsolatedBenchmarkAdapter,
    IsolationTimeouts,
    OfficialSafetyInterruption,
)
from benchmarks.process_fake import ProcessFakeAdapter, ProcessFakeFactory


class _BlockingLoadAdapter(ProcessFakeAdapter):
    def __init__(self, marker: Path) -> None:
        super().__init__()
        self._marker = marker

    def load(self) -> None:
        if not self._marker.exists():
            self._marker.touch()
            Event().wait(15)
        super().load()


class _BlockingLoadFactory:
    def __init__(self, marker: Path) -> None:
        self._marker = marker

    def __call__(self) -> _BlockingLoadAdapter:
        return _BlockingLoadAdapter(self._marker)


@pytest.mark.parametrize("retry", [False, True])
def test_five_pass_add_02_reaps_only_the_owned_loading_worker(
    retry: bool, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    marker = tmp_path / "load-entered"
    adapter = IsolatedBenchmarkAdapter(_BlockingLoadFactory(marker), forbidden_values=())
    owner = object()
    try:
        with ThreadPoolExecutor(max_workers=1) as pool:
            load = pool.submit(adapter.load_for_official, owner, lambda: False)
            deadline = time.monotonic() + 5
            try:
                while not marker.exists() and time.monotonic() < deadline:
                    time.sleep(0.01)
                assert marker.exists()
                process = adapter._process
                pid = adapter.worker_pid
                assert process is not None and pid is not None
                adapter.abort_official_load(object())
                adapter.cancel("idle-generation", cancel_idle=True)
                assert adapter.worker_pid == pid
                if retry:

                    def fail_close() -> None:
                        raise OSError("synthetic process handle close failure")

                    with monkeypatch.context() as patch:
                        patch.setattr(process, "close", fail_close)
                        with pytest.raises(AdapterOperationError, match="cleanup-failed"):
                            adapter.abort_official_load(owner)
                        adapter.abort_official_load(object())
                        assert adapter._process is process
                        with pytest.raises(AdapterOperationError, match="cleanup-failed"):
                            adapter.load_for_official(object(), lambda: False)
            finally:
                adapter.abort_official_load(owner)
            with pytest.raises(OfficialSafetyInterruption):
                load.result(timeout=5)
            assert adapter.worker_pid is None
            adapter.load_for_official(object(), lambda: False)
            replacement = adapter.worker_pid
            assert replacement is not None
            adapter.abort_official_load(owner)
            assert adapter.worker_pid == replacement
    finally:
        adapter.close()
    assert adapter.worker_pid is None


def test_five_pass_add_02_stale_load_response_cannot_replace_the_current_worker(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter = IsolatedBenchmarkAdapter(ProcessFakeFactory(), forbidden_values=())
    received, release = Event(), Event()
    receive = adapter.receive
    retired_owner = object()
    held = False

    def hold_response(timeout: float, **ownership: Any) -> tuple[object, ...]:
        nonlocal held
        response = receive(timeout, **ownership)
        if not held:
            held = True
            received.set()
            assert release.wait(5)
        return response

    monkeypatch.setattr(adapter, "receive", hold_response)
    try:
        with ThreadPoolExecutor(max_workers=1) as pool:
            retired = pool.submit(adapter.load_for_official, retired_owner, lambda: False)
            try:
                assert received.wait(5)
                adapter.abort_official_load(retired_owner)
                adapter.load_for_official(object(), lambda: False)
                replacement = adapter.worker_pid
                assert replacement is not None
            finally:
                release.set()
            with pytest.raises(OfficialSafetyInterruption):
                retired.result(timeout=5)
            assert adapter.worker_pid == replacement
    finally:
        adapter.close()


def test_five_pass_add_02_stop_after_launch_prevents_load_send(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    marker = tmp_path / "load-entered"
    adapter = IsolatedBenchmarkAdapter(_BlockingLoadFactory(marker), forbidden_values=())
    stopped = Event()
    start = adapter._start

    def start_then_stop() -> None:
        start()
        stopped.set()

    monkeypatch.setattr(adapter, "_start", start_then_stop)
    try:
        with pytest.raises(OfficialSafetyInterruption):
            adapter.load_for_official(object(), stopped.is_set)
        assert adapter.worker_pid is None
        assert not marker.exists()
    finally:
        adapter.close()


def test_rcf_12_rejects_cancelled_id_before_starting_worker() -> None:
    adapter = IsolatedBenchmarkAdapter(ProcessFakeFactory(), forbidden_values=())
    try:
        adapter.generate(_request("retired"))
        adapter.cancel("retired")
        with pytest.raises(AdapterOperationError, match="invalid-request"):
            adapter.generate(_request("retired"))
        assert adapter.worker_pid is None
        assert tuple(adapter.generate(_request("fresh")))
    finally:
        adapter.close()
    assert adapter.worker_pid is None


@pytest.mark.parametrize("termination", ["abort", "cancel", "close"])
def test_rcf_22_obsolete_iterator_and_cancel_preserve_replacement(
    termination: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    adapter = IsolatedBenchmarkAdapter(ProcessFakeFactory(), forbidden_values=())
    try:
        retired = adapter.generate(_request("old"))
        if termination == "abort":
            with pytest.raises(AdapterOperationError, match="timeout"):
                adapter.abort("timeout")
        elif termination == "cancel":
            adapter.cancel("old")
        else:
            # A retained, unconsumed iterator can make graceful close reject
            # stale output, but close must still contain and reap its child.
            try:
                adapter.close()
            except AdapterOperationError:
                assert adapter.worker_pid is None
        monkeypatch.setattr(retired, "_deadline", 0)
        replacement = adapter.generate(_request("new"))
        replacement_pid = adapter.worker_pid
        assert tuple(retired) == ()
        adapter.cancel("old")
        assert adapter.worker_pid == replacement_pid
        assert all(chunk.request_id == "new" for chunk in replacement)
    finally:
        adapter.close()
    assert adapter.worker_pid is None


@pytest.mark.parametrize("failure", ["join", "close", "survives"])
def test_r7_03_retains_failed_teardown_and_blocks_replacement(
    monkeypatch: pytest.MonkeyPatch, failure: str
) -> None:
    adapter = IsolatedBenchmarkAdapter(ProcessFakeFactory(), forbidden_values=())
    adapter.load()
    adapter.generate(_request("r7-owned"))
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

    def receive(timeout: float, **_ownership: object) -> tuple[object, ...]:
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


def _witness_request() -> BatchGenerationRequest:
    return replace(_batch_request(), phase="cancellation", pass_index=None)


class _WitnessAdapter(ProcessFakeAdapter):
    def __init__(self, marker: Path, behavior: str) -> None:
        super().__init__()
        self._marker = marker
        self._behavior = behavior

    def generate_batch_with_entry_witness(
        self, request: BatchGenerationRequest, entered: Callable[[], None]
    ) -> tuple[object, ...]:
        self._marker.write_text(str(request.call_index), encoding="utf-8")
        if self._behavior == "timeout":
            Event().wait(5)
        elif self._behavior == "timeout-unwind":
            try:
                entered()
            except AdapterOperationError as error:
                assert error.code == "timeout"
                self._marker.with_suffix(".expired").touch()
                Event().wait(5)
                raise
        elif self._behavior == "witness":
            entered()
            self._marker.with_suffix(".resumed").touch()
        return ()


class _WitnessFactory:
    def __init__(self, marker: Path, behavior: str = "witness") -> None:
        self._marker = marker
        self._behavior = behavior

    def __call__(self) -> _WitnessAdapter:
        return _WitnessAdapter(self._marker, self._behavior)


@pytest.mark.parametrize("phase", ["worker-accepted", "adapter-entry"])
def test_five_pass_2_3_exact_spawned_phase_is_cancelled_and_reaped(
    tmp_path: Path, phase: BatchWitnessPhase
) -> None:
    marker = tmp_path / "adapter-entry"
    adapter = IsolatedBenchmarkAdapter(_WitnessFactory(marker), forbidden_values=())
    request = _witness_request()
    invalidated: list[BatchWorkIdentity] = []
    try:
        adapter.load()
        pid = adapter.worker_pid
        assert pid is not None

        def invalidate() -> None:
            assert adapter.worker_pid == pid
            assert marker.exists() == (phase == "adapter-entry")
            invalidated.append(request.identity)

        result = adapter.cancel_witnessed_batch(request, phase, lambda: False, invalidate)
        assert (result.phase, result.identity, result.call_index) == (
            phase,
            request.identity,
            request.call_index,
        )
        assert result.termination_nanoseconds > 0
        assert invalidated == [request.identity]
        assert adapter.worker_pid is None
        assert not marker.with_suffix(".resumed").exists()
    finally:
        adapter.close()


def test_five_pass_2_3_worker_exit_without_our_signal_cannot_prove_cancellation(
    tmp_path: Path,
) -> None:
    adapter = IsolatedBenchmarkAdapter(
        _WitnessFactory(tmp_path / "adapter-entry"), forbidden_values=()
    )
    try:
        adapter.load()

        def invalidate() -> None:
            process = adapter._process
            assert process is not None
            process.kill()
            process.join(2)
            assert not process.is_alive()

        with pytest.raises(AdapterOperationError, match=":invalid-output$"):
            adapter.cancel_witnessed_batch(
                _witness_request(), "worker-accepted", lambda: False, invalidate
            )
    finally:
        adapter.close()
    assert adapter.worker_pid is None


def test_five_pass_2_3_safety_stop_reaps_the_pending_entry_without_proof(tmp_path: Path) -> None:
    marker = tmp_path / "adapter-entry"
    adapter = IsolatedBenchmarkAdapter(_WitnessFactory(marker), forbidden_values=())
    try:
        adapter.load()
        with pytest.raises(OfficialSafetyInterruption):
            adapter.cancel_witnessed_batch(
                _witness_request(),
                "adapter-entry",
                marker.exists,
                lambda: pytest.fail("safety stop became cancellation proof"),
            )
        assert marker.exists()
    finally:
        adapter.close()
    assert adapter.worker_pid is None


def test_five_pass_2_3_deadline_wins_during_invalidation_of_a_live_worker(tmp_path: Path) -> None:
    marker = tmp_path / "adapter-entry"
    expired = marker.with_suffix(".expired")
    adapter = IsolatedBenchmarkAdapter(
        _WitnessFactory(marker, "timeout-unwind"),
        forbidden_values=(),
        timeouts=IsolationTimeouts(request_seconds=0.5),
    )
    try:
        adapter.load()

        def invalidate() -> None:
            deadline = time.monotonic() + 2
            while not expired.exists() and time.monotonic() < deadline:
                time.sleep(0.005)
            assert expired.exists()
            assert adapter.worker_pid is not None

        with pytest.raises(AdapterOperationError, match=":timeout$"):
            adapter.cancel_witnessed_batch(
                _witness_request(), "adapter-entry", lambda: False, invalidate
            )
    finally:
        adapter.close()
    assert adapter.worker_pid is None


def test_five_pass_2_3_deadline_wins_during_termination_reaping(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    adapter = IsolatedBenchmarkAdapter(
        _WitnessFactory(tmp_path / "adapter-entry"),
        forbidden_values=(),
        timeouts=IsolationTimeouts(request_seconds=1),
    )
    try:
        adapter.load()
        process = adapter._process
        assert process is not None
        send, close = adapter._send, process.close
        deadline: float | None = None

        def record_send(message: tuple[object, ...]) -> None:
            nonlocal deadline
            if message[0] == "witness-batch":
                assert isinstance(message[2], float)
                deadline = message[2]
            send(message)

        def finish_reaping_after_deadline() -> None:
            assert not process.is_alive()
            assert deadline is not None
            remaining = deadline - time.monotonic()
            assert 0 < remaining <= 1
            time.sleep(remaining)
            close()

        monkeypatch.setattr(adapter, "_send", record_send)
        monkeypatch.setattr(process, "close", finish_reaping_after_deadline)
        with pytest.raises(AdapterOperationError, match=":timeout$"):
            adapter.cancel_witnessed_batch(
                _witness_request(), "worker-accepted", lambda: False, lambda: None
            )
    finally:
        adapter.close()
    assert adapter.worker_pid is None


@pytest.mark.parametrize(
    ("behavior", "failure"),
    [("completion", "invalid-output"), ("timeout", "timeout"), ("invalid", "invalid-request")],
)
def test_five_pass_2_3_unobserved_entry_cannot_be_cancelled_as_a_witness(
    tmp_path: Path, behavior: str, failure: str
) -> None:
    marker = tmp_path / "adapter-entry"
    adapter = IsolatedBenchmarkAdapter(
        _WitnessFactory(marker, behavior),
        forbidden_values=(),
        timeouts=IsolationTimeouts(request_seconds=0.5),
    )
    try:
        adapter.load()
        with pytest.raises(AdapterOperationError, match=f":{failure}$"):
            adapter.cancel_witnessed_batch(
                _batch_request() if behavior == "invalid" else _witness_request(),
                "adapter-entry",
                lambda: False,
                lambda: pytest.fail("invalidated an unobserved adapter phase"),
            )
        assert marker.exists() is (behavior != "invalid")
    finally:
        adapter.close()
    assert adapter.worker_pid is None


@pytest.mark.parametrize("malformed", ["identity", "index", "premature-entry", "duplicate"])
def test_five_pass_2_3_phase_exchange_rejects_malformed_witnesses(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, malformed: str
) -> None:
    adapter = IsolatedBenchmarkAdapter(
        _WitnessFactory(tmp_path / "adapter-entry"), forbidden_values=()
    )
    try:
        adapter.load()
        connection = adapter._connection
        assert connection is not None
        receive = connection.recv
        request = _witness_request()
        call = 0

        def malformed_receive() -> object:
            nonlocal call
            value = receive()
            call += 1
            if call == 2 and malformed == "duplicate":
                return ("worker-accepted", request.identity, request.call_index)
            if call != 1:
                return value
            if malformed == "identity":
                return (
                    "worker-accepted",
                    BatchWorkIdentity("other", "generation"),
                    request.call_index,
                )
            if malformed == "index":
                return ("worker-accepted", request.identity, request.call_index + 1)
            if malformed == "premature-entry":
                return ("adapter-entry", request.identity, request.call_index, bytes(16))
            return value

        monkeypatch.setattr(connection, "recv", malformed_receive)
        with pytest.raises(AdapterOperationError, match=":invalid-output$"):
            adapter.cancel_witnessed_batch(
                request,
                "adapter-entry",
                lambda: False,
                lambda: pytest.fail("invalidated a malformed witness"),
            )
    finally:
        adapter.close()
    assert adapter.worker_pid is None


@pytest.mark.parametrize("retired_receive", ["timeout", "response"])
def test_dcr_08_retired_batch_receive_cannot_abort_replacement(
    monkeypatch: pytest.MonkeyPatch, retired_receive: str
) -> None:
    adapter = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    adapter.load()
    connection = adapter._connection
    assert connection is not None
    waiting, release = Event(), Event()
    original_receive = connection.recv

    def await_replacement() -> None:
        waiting.set()
        assert release.wait(5)

    def delayed_timeout(_timeout: float) -> bool:
        await_replacement()
        return False

    def delayed_response() -> object:
        response = original_receive()
        await_replacement()
        return response

    if retired_receive == "timeout":
        monkeypatch.setattr(connection, "poll", delayed_timeout)
    else:
        monkeypatch.setattr(connection, "recv", delayed_response)
    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            retired = executor.submit(adapter.generate_batch, _batch_request())
            try:
                assert waiting.wait(5)
                adapter.cancel("batch-1")
                assert adapter.worker_pid is None
                replacement = adapter.generate_batch(replace(_batch_request(), call_index=2))
                assert len(replacement) == 2
                replacement_pid = adapter.worker_pid
                assert replacement_pid is not None
            finally:
                release.set()
            with pytest.raises(AdapterOperationError):
                retired.result(timeout=5)
            adapter.cancel("batch-1", cancel_idle=True)
            assert adapter.worker_pid == replacement_pid
    finally:
        adapter.close()
    assert adapter.worker_pid is None


def test_dcr_08_cancel_and_blocked_receive_reap_one_owned_worker(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    adapter.load()
    connection, process = adapter._connection, adapter._process
    assert connection is not None and process is not None
    poll_entered, poll_release, closing = Event(), Event(), Event()
    original_close = process.close
    closed: list[None] = []

    def interrupted_poll(_timeout: float) -> bool:
        poll_entered.set()
        assert poll_release.wait(5)
        raise EOFError

    def counted_close() -> None:
        closing.set()
        poll_release.set()
        original_close()
        closed.append(None)

    monkeypatch.setattr(connection, "poll", interrupted_poll)
    monkeypatch.setattr(process, "close", counted_close)
    try:
        with ThreadPoolExecutor(max_workers=2) as executor:
            generating = executor.submit(adapter.generate_batch, _batch_request())
            try:
                assert poll_entered.wait(5)
                cancelled = executor.submit(adapter.cancel, "batch-1")
                assert closing.wait(5)
                assert cancelled.result(timeout=5).acknowledged
                with pytest.raises(AdapterOperationError, match="invalid-request"):
                    generating.result(timeout=5)
                adapter.cancel("batch-1")
            finally:
                poll_release.set()
        assert len(closed) == 1
        assert adapter.worker_pid is None
    finally:
        adapter.close()


def test_dcr_08_cancelled_batch_cannot_dispatch_before_a_fresh_request() -> None:
    adapter = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    try:
        adapter.cancel("batch-1")
        with pytest.raises(AdapterOperationError, match="invalid-request"):
            adapter.generate_batch(_batch_request())
        assert adapter.worker_pid is None
        assert len(adapter.generate_batch(replace(_batch_request(), call_index=2))) == 2
    finally:
        adapter.close()
    assert adapter.worker_pid is None


def test_dcr_08_failed_batch_cancellation_can_retry_exact_teardown(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    adapter = IsolatedBenchmarkAdapter(DeterministicBatchCandidateFactory(), forbidden_values=())
    adapter.load()
    connection, process = adapter._connection, adapter._process
    assert connection is not None and process is not None
    waiting, release = Event(), Event()
    original_close = process.close

    def delayed_timeout(_timeout: float) -> bool:
        waiting.set()
        assert release.wait(5)
        return False

    def fail_close() -> None:
        raise OSError("synthetic close failure")

    monkeypatch.setattr(connection, "poll", delayed_timeout)
    try:
        with ThreadPoolExecutor(max_workers=1) as executor:
            retired = executor.submit(adapter.generate_batch, _batch_request())
            try:
                assert waiting.wait(5)
                with monkeypatch.context() as patch:
                    patch.setattr(process, "close", fail_close)
                    with pytest.raises(AdapterOperationError, match="cleanup-failed"):
                        adapter.cancel("batch-1")
                    assert adapter._process is process
                    with pytest.raises(AdapterOperationError, match="cleanup-failed"):
                        adapter.generate_batch(replace(_batch_request(), call_index=2))
                assert process.close == original_close
                assert adapter.cancel("batch-1").acknowledged
                assert adapter._process is None
            finally:
                release.set()
            with pytest.raises(AdapterOperationError, match="invalid-request"):
                retired.result(timeout=5)
    finally:
        adapter.close()


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
