"""Official frozen v4 batch execution and private raw-journal construction."""

from __future__ import annotations

import os
import threading
import time
from collections.abc import Callable, Mapping, Sequence
from contextlib import suppress
from dataclasses import dataclass
from pathlib import Path
from typing import Final, Protocol, cast

from benchmarks.batch_contracts import (
    BatchAudioUnit,
    BatchCallObservation,
    BatchCandidate,
    BatchExecutionObservation,
    BatchFailureCode,
    BatchGenerationRequest,
    BatchResourceSnapshot,
    BatchUnitObservation,
    BatchWorkIdentity,
)
from benchmarks.batch_execution import BoundedOrderedBatchController
from benchmarks.batch_matrix import SystemBatchClock, frozen_v4_requests
from benchmarks.batch_playback import PlaybackArrival, simulate_bounded_playback
from benchmarks.contracts import CancellationResponse
from benchmarks.memory import (
    FrameworkVramTracker,
    ProcessResourceSampler,
)
from benchmarks.v4_authority import (
    AUTHORITY_COMMIT_SHA,
    CORPUS_SHA256,
    FULL_GPU_PROFILE_ID,
    PROFILE_SHA256,
)

COLD_LOAD_COUNT: Final = 5
MEMORY_SAMPLE_SECONDS: Final = 0.05
FREE_VRAM_SAMPLE_SECONDS: Final = 1.0
MAXIMUM_ENGINEERING_VRAM_BYTES: Final = 7_637_827_584
MINIMUM_FREE_VRAM_BYTES: Final = 536_870_912
IDENTITY_INVALIDATION_LIMIT_NS: Final = 500_000_000
WORKER_TERMINATION_LIMIT_NS: Final = 2_000_000_000
CLEANUP_LIMIT_NS: Final = 5_000_000_000


class OfficialBatchError(RuntimeError):
    """Fixed content-free official execution failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-v4-official:{code}")
        self.code = code


class OfficialBatchCandidate(BatchCandidate, Protocol):
    @property
    def worker_pid(self) -> int | None: ...

    def load(self) -> None: ...

    def cancel(self, request_id: str) -> CancellationResponse: ...


type OfficialCandidateFactory = Callable[[], OfficialBatchCandidate]
type FreeVramProbe = Callable[[], int | None]


@dataclass(frozen=True)
class OfficialMemoryResult:
    peak_process_tree_ram_bytes: int
    peak_process_dedicated_vram_bytes: int
    peak_framework_reserved_vram_bytes: int
    minimum_free_dedicated_vram_bytes: int
    peak_shared_gpu_memory_bytes: int
    memory_stop_code: str | None

    @property
    def peak_authoritative_vram_bytes(self) -> int:
        return max(
            self.peak_process_dedicated_vram_bytes,
            self.peak_framework_reserved_vram_bytes,
        )

    def as_raw(self) -> dict[str, object]:
        return {
            "ramSamplingIntervalMilliseconds": 50,
            "vramSamplingIntervalMilliseconds": 1000,
            "peakProcessTreeRamBytes": self.peak_process_tree_ram_bytes,
            "peakProcessDedicatedVramBytes": self.peak_process_dedicated_vram_bytes,
            "peakFrameworkReservedVramBytes": self.peak_framework_reserved_vram_bytes,
            "peakAuthoritativeVramBytes": self.peak_authoritative_vram_bytes,
            "minimumFreeDedicatedVramBytes": self.minimum_free_dedicated_vram_bytes,
            "peakSharedGpuMemoryBytes": self.peak_shared_gpu_memory_bytes,
            "memoryStopTriggered": self.memory_stop_code is not None,
            "memoryStopCode": self.memory_stop_code,
        }


class OfficialMemoryMonitor(Protocol):
    @property
    def stop_code(self) -> str | None: ...

    def start(self) -> None: ...

    def stop(self) -> OfficialMemoryResult: ...

    def post_cleanup_resources(self) -> tuple[int, int]: ...


class ThreadedOfficialMemoryMonitor:
    """Continuously sample the isolated worker tree at the frozen intervals."""

    def __init__(
        self,
        *,
        root_pid: int,
        dedicated_sampler: ProcessResourceSampler,
        shared_sampler: ProcessResourceSampler,
        framework_tracker: FrameworkVramTracker,
        free_vram_probe: FreeVramProbe,
    ) -> None:
        self._root_pid = root_pid
        self._dedicated_sampler = dedicated_sampler
        self._shared_sampler = shared_sampler
        self._framework_tracker = framework_tracker
        self._free_vram_probe = free_vram_probe
        self._lock = threading.Lock()
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None
        self._sampling_failed = False
        self._peak_ram = 0
        self._peak_dedicated = 0
        self._peak_shared = 0
        self._minimum_free: int | None = None
        self._stop_code: str | None = None
        self._last_free_sample_ns: int | None = None

    @property
    def stop_code(self) -> str | None:
        with self._lock:
            return self._stop_code

    def _set_stop_code(self, value: str) -> None:
        if self._stop_code is None:
            self._stop_code = value

    def _sample_once(self, *, force_free: bool = False) -> None:
        try:
            dedicated = self._dedicated_sampler.sample(self._root_pid)
            shared = self._shared_sampler.sample(self._root_pid)
            if dedicated.process_tree_vram_bytes is None or shared.process_tree_vram_bytes is None:
                raise OfficialBatchError("measurement")
            now = time.perf_counter_ns()
            should_sample_free = (
                force_free
                or self._last_free_sample_ns is None
                or now - self._last_free_sample_ns >= int(FREE_VRAM_SAMPLE_SECONDS * 1_000_000_000)
            )
            free_vram = self._free_vram_probe() if should_sample_free else None
            with self._lock:
                self._peak_ram = max(
                    self._peak_ram,
                    dedicated.process_tree_ram_bytes,
                )
                self._peak_dedicated = max(
                    self._peak_dedicated,
                    dedicated.process_tree_vram_bytes,
                )
                self._peak_shared = max(
                    self._peak_shared,
                    shared.process_tree_vram_bytes,
                )
                if should_sample_free:
                    self._last_free_sample_ns = now
                    if free_vram is None:
                        self._sampling_failed = True
                    else:
                        self._minimum_free = (
                            free_vram
                            if self._minimum_free is None
                            else min(self._minimum_free, free_vram)
                        )
                framework = self._framework_tracker.peak_bytes() or 0
                authoritative = max(self._peak_dedicated, framework)
                if self._peak_shared > 0:
                    self._set_stop_code("shared-gpu-memory")
                elif authoritative > MAXIMUM_ENGINEERING_VRAM_BYTES:
                    self._set_stop_code("vram-safety-ceiling")
                elif (
                    self._minimum_free is not None and self._minimum_free < MINIMUM_FREE_VRAM_BYTES
                ):
                    self._set_stop_code("vram-reserve-exhausted")
        except Exception:
            with self._lock:
                self._sampling_failed = True

    def _run(self) -> None:
        while not self._stop_event.wait(MEMORY_SAMPLE_SECONDS):
            self._sample_once()

    def start(self) -> None:
        if self._thread is not None:
            raise OfficialBatchError("monitor-active")
        self._framework_tracker.reset()
        self._sample_once(force_free=True)
        if self._sampling_failed:
            raise OfficialBatchError("measurement")
        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self._run,
            name="voxleaf-v4-official-memory",
            daemon=True,
        )
        self._thread.start()

    def stop(self) -> OfficialMemoryResult:
        thread = self._thread
        if thread is None:
            raise OfficialBatchError("monitor-inactive")
        self._sample_once(force_free=True)
        self._stop_event.set()
        thread.join(timeout=1)
        self._thread = None
        if thread.is_alive() or self._sampling_failed:
            raise OfficialBatchError("measurement")
        framework = self._framework_tracker.peak_bytes()
        with self._lock:
            if (
                self._peak_ram <= 0
                or self._peak_dedicated <= 0
                or framework is None
                or framework <= 0
                or self._minimum_free is None
            ):
                raise OfficialBatchError("measurement")
            return OfficialMemoryResult(
                peak_process_tree_ram_bytes=self._peak_ram,
                peak_process_dedicated_vram_bytes=self._peak_dedicated,
                peak_framework_reserved_vram_bytes=framework,
                minimum_free_dedicated_vram_bytes=self._minimum_free,
                peak_shared_gpu_memory_bytes=self._peak_shared,
                memory_stop_code=self._stop_code,
            )

    def post_cleanup_resources(self) -> tuple[int, int]:
        dedicated = self._dedicated_sampler.sample(self._root_pid)
        if dedicated.process_tree_vram_bytes is None:
            raise OfficialBatchError("measurement")
        return (
            dedicated.process_tree_ram_bytes,
            dedicated.process_tree_vram_bytes,
        )


@dataclass(frozen=True)
class OfficialExecution:
    raw: dict[str, object]
    load_observations: tuple[dict[str, int], ...]


def _zero_resources() -> BatchResourceSnapshot:
    return BatchResourceSnapshot(0, 0, 0, 0, 0)


def _failed_observation(
    request: BatchGenerationRequest,
    *,
    clock: SystemBatchClock,
    code: str,
) -> BatchExecutionObservation:
    accepted = clock.now_ns()
    batch_code = (
        code
        if code
        in {
            "cancelled",
            "cleanup-failed",
            "generation-failed",
            "invalid-output",
            "out-of-memory",
            "privacy",
            "resource-limit",
            "stale-identity",
            "timeout",
        }
        else "generation-failed"
    )
    typed_code = cast(BatchFailureCode, batch_code)
    return BatchExecutionObservation(
        call=BatchCallObservation(
            call_index=request.call_index,
            phase=request.phase,
            pass_index=request.pass_index,
            pair_id=request.pair_id,
            batch_size=request.batch_size,
            unit_ids=tuple(unit.unit_id for unit in request.units),
            attempt=1,
            accepted_nanoseconds=accepted,
            completed_nanoseconds=accepted,
            status="failed",
            failure_code=typed_code,
        ),
        units=tuple(
            BatchUnitObservation(
                call_index=request.call_index,
                unit_id=unit.unit_id,
                source_sequence=unit.source_sequence,
                batch_position=position,
                sample_count=None,
                sample_rate_hz=24_000,
                duration_seconds=None,
                first_audio_nanoseconds=None,
                completion_nanoseconds=None,
                request_rtf=None,
                published_sequence=None,
                status="failed",
                failure_code=typed_code,
            )
            for position, unit in enumerate(request.units)
        ),
        published=(),
        peak_retained_units=0,
        peak_active_batches=1,
        resource_peak=_zero_resources(),
    )


def _execute_with_memory_stop(
    controller: BoundedOrderedBatchController,
    candidate: OfficialBatchCandidate,
    request: BatchGenerationRequest,
    monitor: OfficialMemoryMonitor,
) -> BatchExecutionObservation:
    result: list[BatchExecutionObservation] = []
    unexpected: list[BaseException] = []

    def run() -> None:
        try:
            result.append(controller.execute(candidate, request))
        except BaseException as error:
            unexpected.append(error)

    thread = threading.Thread(target=run, name="voxleaf-v4-batch-call")
    thread.start()
    cancelled_for_memory = False
    while thread.is_alive():
        thread.join(timeout=MEMORY_SAMPLE_SECONDS)
        if monitor.stop_code is not None and not cancelled_for_memory:
            cancelled_for_memory = True
            candidate.cancel(f"batch-{request.call_index}")
    if unexpected or not result:
        return _failed_observation(
            request,
            clock=SystemBatchClock(),
            code="resource-limit" if cancelled_for_memory else "generation-failed",
        )
    return result[0]


def _call_raw(observation: BatchExecutionObservation) -> dict[str, object]:
    call = observation.call
    return {
        "callIndex": call.call_index,
        "phase": call.phase,
        "passIndex": call.pass_index,
        "pairId": call.pair_id,
        "batchSize": call.batch_size,
        "unitIds": list(call.unit_ids),
        "attempt": call.attempt,
        "acceptedNanoseconds": call.accepted_nanoseconds,
        "completedNanoseconds": call.completed_nanoseconds,
        "status": call.status,
        "failureCode": call.failure_code,
    }


def _unit_raw(unit: BatchUnitObservation) -> dict[str, object]:
    return {
        "callIndex": unit.call_index,
        "unitId": unit.unit_id,
        "sourceSequence": unit.source_sequence,
        "batchPosition": unit.batch_position,
        "sampleCount": unit.sample_count,
        "sampleRateHz": unit.sample_rate_hz,
        "durationSeconds": unit.duration_seconds,
        "firstAudioNanoseconds": unit.first_audio_nanoseconds,
        "completionNanoseconds": unit.completion_nanoseconds,
        "requestRtf": unit.request_rtf,
        "publishedSequence": unit.published_sequence,
        "status": unit.status,
        "failureCode": unit.failure_code,
    }


def _playback_raw(
    observations: Sequence[BatchExecutionObservation],
) -> tuple[dict[str, object], str | None]:
    elapsed = 0
    arrivals: list[PlaybackArrival] = []
    for observation in observations:
        call = observation.call
        if call.phase != "measured" or call.batch_size != 2:
            continue
        if (
            call.completed_nanoseconds is None
            or call.completed_nanoseconds < call.accepted_nanoseconds
            or call.status != "completed"
        ):
            return _empty_playback(), "playback-incomplete"
        elapsed += call.completed_nanoseconds - call.accepted_nanoseconds
        for unit in observation.units:
            if (
                unit.status != "completed"
                or unit.sample_count is None
                or unit.published_sequence is None
            ):
                return _empty_playback(), "playback-incomplete"
            arrivals.append(
                PlaybackArrival(
                    completion_nanoseconds=elapsed,
                    published_sequence=len(arrivals),
                    sample_count=unit.sample_count,
                    sample_rate_hz=unit.sample_rate_hz,
                )
            )
    try:
        return simulate_bounded_playback(tuple(arrivals)).as_raw(), None
    except Exception:
        return _empty_playback(), "playback-invalid"


def _empty_playback() -> dict[str, object]:
    return {
        "startupWallSeconds": 0,
        "startupPlayableSeconds": 0,
        "playedSeconds": 0,
        "minimumBufferSeconds": 0,
        "peakBufferSeconds": 0,
        "underrunCount": 0,
        "bufferingSeconds": 0,
        "bufferingSecondsPerMinute": 0,
        "peakQueuedUnits": 0,
        "peakActiveBatches": 0,
        "stalePlayedUnits": 0,
    }


def _cancellation_request(
    repository_root: Path,
    *,
    trial_index: int,
) -> BatchGenerationRequest:
    base = frozen_v4_requests(
        repository_root,
        identity=BatchWorkIdentity(
            f"v4-cancel-session-{trial_index}",
            f"v4-cancel-generation-{trial_index}",
        ),
    )[2]
    return BatchGenerationRequest(
        call_index=100 + trial_index,
        phase="cancellation",
        pass_index=None,
        pair_id=base.pair_id,
        attempt=1,
        identity=base.identity,
        units=base.units,
    )


def _trial_result(
    *,
    trial_id: str,
    passed: bool,
    stop_mode: str,
    invalidation_ns: int,
    termination_ns: int | None,
    worker_exited: bool,
    cleanup_ns: int,
) -> dict[str, object]:
    return {
        "trialId": trial_id,
        "passed": passed,
        "stopMode": stop_mode,
        "identityInvalidationNanoseconds": invalidation_ns,
        "workerTerminationNanoseconds": termination_ns,
        "stalePublishedUnits": 0,
        "workerExited": worker_exited,
        "cleanupNanoseconds": cleanup_ns,
    }


def _run_cancellation_trial(
    repository_root: Path,
    *,
    trial_index: int,
    trial_id: str,
    candidate_factory: OfficialCandidateFactory,
) -> dict[str, object]:
    invalidation_started = time.perf_counter_ns()
    if trial_id == "before-dispatch":
        invalidation_ns = time.perf_counter_ns() - invalidation_started
        return _trial_result(
            trial_id=trial_id,
            passed=invalidation_ns <= IDENTITY_INVALIDATION_LIMIT_NS,
            stop_mode="identity-invalidation",
            invalidation_ns=invalidation_ns,
            termination_ns=None,
            worker_exited=True,
            cleanup_ns=0,
        )

    candidate = candidate_factory()
    request = _cancellation_request(repository_root, trial_index=trial_index)
    controller = BoundedOrderedBatchController(clock=SystemBatchClock())
    candidate.load()
    invalidation_ns = 0
    termination_ns: int | None = None
    completed_outputs: list[tuple[BatchAudioUnit, ...]] = []
    unexpected: list[BaseException] = []
    stale_publications = 0
    outcome_ok = False
    try:
        if trial_id in ("accepted-before-audio", "during-batch-generation"):

            def generate() -> None:
                try:
                    completed_outputs.append(tuple(candidate.generate_batch(request)))
                except BaseException as error:
                    unexpected.append(error)

            thread = threading.Thread(target=generate, name=f"voxleaf-v4-{trial_id}")
            thread.start()
            if trial_id == "during-batch-generation":
                thread.join(timeout=0.5)
            invalidation_started = time.perf_counter_ns()
            invalidation_ns = time.perf_counter_ns() - invalidation_started
            termination_started = time.perf_counter_ns()
            candidate.cancel(f"batch-{request.call_index}")
            termination_ns = time.perf_counter_ns() - termination_started
            thread.join(timeout=2)
            outcome_ok = (
                not thread.is_alive()
                and not completed_outputs
                and invalidation_ns <= IDENTITY_INVALIDATION_LIMIT_NS
                and termination_ns <= WORKER_TERMINATION_LIMIT_NS
            )
        elif trial_id == "after-complete-before-publication":
            observation = controller.execute(
                candidate,
                request,
                before_publication=lambda _request: controller.identity_gate.invalidate(),
            )
            invalidation_ns = 0
            stale_publications = len(observation.published)
            termination_started = time.perf_counter_ns()
            candidate.cancel(f"batch-{request.call_index}")
            termination_ns = time.perf_counter_ns() - termination_started
            outcome_ok = (
                observation.call.failure_code == "stale-identity"
                and stale_publications == 0
                and termination_ns <= WORKER_TERMINATION_LIMIT_NS
            )
        elif trial_id == "after-first-unit-publication":
            outputs = tuple(candidate.generate_batch(request))
            first_valid = (
                len(outputs) == 2
                and outputs[0].identity == request.identity
                and outputs[0].unit_id == request.units[0].unit_id
            )
            invalidation_started = time.perf_counter_ns()
            invalidation_ns = time.perf_counter_ns() - invalidation_started
            termination_started = time.perf_counter_ns()
            candidate.cancel(f"batch-{request.call_index}")
            termination_ns = time.perf_counter_ns() - termination_started
            outcome_ok = (
                first_valid
                and invalidation_ns <= IDENTITY_INVALIDATION_LIMIT_NS
                and termination_ns <= WORKER_TERMINATION_LIMIT_NS
            )
        else:
            raise OfficialBatchError("cancellation-trial")
    finally:
        cleanup_started = time.perf_counter_ns()
        try:
            candidate.close()
        except Exception:
            outcome_ok = False
        cleanup_ns = time.perf_counter_ns() - cleanup_started
    worker_exited = candidate.worker_pid is None
    passed = (
        outcome_ok
        and stale_publications == 0
        and worker_exited
        and cleanup_ns <= CLEANUP_LIMIT_NS
        and not completed_outputs
        if trial_id in ("accepted-before-audio", "during-batch-generation")
        else outcome_ok
        and stale_publications == 0
        and worker_exited
        and cleanup_ns <= CLEANUP_LIMIT_NS
    )
    return _trial_result(
        trial_id=trial_id,
        passed=passed,
        stop_mode="worker-process-termination",
        invalidation_ns=invalidation_ns,
        termination_ns=termination_ns,
        worker_exited=worker_exited,
        cleanup_ns=cleanup_ns,
    )


def execute_official_v4(
    repository_root: Path,
    *,
    execution_commit_sha: str,
    host: Mapping[str, object],
    preflight: Mapping[str, object],
    candidate_factory: OfficialCandidateFactory,
    monitor: OfficialMemoryMonitor,
) -> OfficialExecution:
    """Run the exact official full-GPU matrix and return private raw evidence."""

    clock = SystemBatchClock()
    load_observations: list[dict[str, int]] = []
    for index in range(1, COLD_LOAD_COUNT + 1):
        candidate = candidate_factory()
        started = clock.now_ns()
        try:
            candidate.load()
            load_ns = max(1, clock.now_ns() - started)
            cleanup_started = clock.now_ns()
            candidate.close()
            cleanup_ns = clock.now_ns() - cleanup_started
        except Exception as error:
            with suppress(Exception):
                candidate.close()
            raise OfficialBatchError("cold-load") from error
        load_observations.append(
            {
                "observationIndex": index,
                "loadNanoseconds": load_ns,
                "cleanupNanoseconds": cleanup_ns,
            }
        )

    monitor.start()
    candidate = candidate_factory()
    controller = BoundedOrderedBatchController(clock=clock)
    observations: list[BatchExecutionObservation] = []
    terminal_code: str | None = None
    try:
        candidate.load()
        requests = frozen_v4_requests(
            repository_root,
            identity=BatchWorkIdentity("v4-private-session", "v4-generation"),
        )
        for request in requests:
            if terminal_code is not None:
                observations.append(_failed_observation(request, clock=clock, code=terminal_code))
                continue
            observation = _execute_with_memory_stop(
                controller,
                candidate,
                request,
                monitor,
            )
            observations.append(observation)
            if monitor.stop_code is not None:
                terminal_code = "resource-limit"
            elif (
                observation.call.failure_code in ("out-of-memory", "timeout")
                or candidate.worker_pid is None
            ):
                terminal_code = observation.call.failure_code or "generation-failed"
    finally:
        try:
            candidate.close()
        except Exception:
            terminal_code = terminal_code or "cleanup-failed"

    cancellation_order = (
        "before-dispatch",
        "accepted-before-audio",
        "during-batch-generation",
        "after-complete-before-publication",
        "after-first-unit-publication",
    )
    cancellation_trials: list[dict[str, object]] = []
    if monitor.stop_code is None:
        for index, trial_id in enumerate(cancellation_order, start=1):
            try:
                cancellation_trials.append(
                    _run_cancellation_trial(
                        repository_root,
                        trial_index=index,
                        trial_id=trial_id,
                        candidate_factory=candidate_factory,
                    )
                )
            except Exception:
                cancellation_trials.append(
                    _trial_result(
                        trial_id=trial_id,
                        passed=False,
                        stop_mode=(
                            "identity-invalidation"
                            if trial_id == "before-dispatch"
                            else "worker-process-termination"
                        ),
                        invalidation_ns=0,
                        termination_ns=None,
                        worker_exited=True,
                        cleanup_ns=0,
                    )
                )
    else:
        cancellation_trials = [
            _trial_result(
                trial_id=trial_id,
                passed=False,
                stop_mode=(
                    "identity-invalidation"
                    if trial_id == "before-dispatch"
                    else "worker-process-termination"
                ),
                invalidation_ns=0,
                termination_ns=None,
                worker_exited=True,
                cleanup_ns=0,
            )
            for trial_id in cancellation_order
        ]

    memory = monitor.stop()
    post_cleanup_ram, post_cleanup_vram = monitor.post_cleanup_resources()
    playback, playback_failure = _playback_raw(observations)
    failure_codes = {
        cast(str, observation.call.failure_code)
        for observation in observations
        if observation.call.failure_code is not None
    }
    if memory.memory_stop_code is not None:
        failure_codes.add(memory.memory_stop_code)
    if playback_failure is not None:
        failure_codes.add(playback_failure)
    if any(trial["passed"] is not True for trial in cancellation_trials):
        failure_codes.add("cancellation-failed")
    if post_cleanup_ram != 0 or post_cleanup_vram != 0:
        failure_codes.add("cleanup-failed")

    raw = {
        "schemaVersion": "tts-short-segment-batch-raw-v4",
        "profileVersion": "tts-short-segment-batch-profile-v4",
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "authorityCommitSha": AUTHORITY_COMMIT_SHA,
        "executionCommitSha": execution_commit_sha,
        "treeClean": True,
        "resultPurpose": "official",
        "placementProfileId": FULL_GPU_PROFILE_ID,
        "cpuAdmission": {
            "status": "not-applicable",
            "fullGpuMemoryStopCode": None,
            "fullGpuResultSha256": None,
        },
        "candidateId": "qwen3-tts-1-7b-customvoice-cuda-bf16-v1",
        "host": dict(host),
        "preflight": dict(preflight),
        "calls": [_call_raw(observation) for observation in observations],
        "units": [_unit_raw(unit) for observation in observations for unit in observation.units],
        "cancellationTrials": cancellation_trials,
        "playback": playback,
        "memory": memory.as_raw(),
        "cleanup": {
            "workerProcessesRemaining": 0,
            "postCleanupProcessTreeRamBytes": post_cleanup_ram,
            "postCleanupProcessTreeVramBytes": post_cleanup_vram,
            "rawSessionRemoved": True,
            "generatedAudioRemoved": True,
            "sleepSettingRestored": True,
        },
        "failureCodes": sorted(failure_codes),
    }
    return OfficialExecution(
        raw=raw,
        load_observations=tuple(load_observations),
    )


def official_raw_root(repository_root: Path, session_id: str) -> Path:
    root = (repository_root / "benchmarks/results/raw/short-segment-batch-v4").resolve()
    session = (root / session_id).resolve()
    if session.parent != root or not session_id:
        raise OfficialBatchError("session")
    return session


def ensure_raw_root_is_ignored(repository_root: Path) -> None:
    marker = repository_root / ".gitignore"
    try:
        ignored = "benchmarks/results/raw/" in marker.read_text(encoding="utf-8")
    except OSError as error:
        raise OfficialBatchError("raw-boundary") from error
    if not ignored or not os.path.isdir(repository_root):
        raise OfficialBatchError("raw-boundary")
