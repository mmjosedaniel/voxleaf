"""Bounded independent-worker dispatch and ordered release for v5."""

from __future__ import annotations

from dataclasses import replace
from typing import Final

from benchmarks.dual_worker_contracts import (
    CPU_WORKER_ROLE,
    GPU_WORKER_ROLE,
    AfterInitialDispatch,
    BeforeOrderedRelease,
    DualAudioUnit,
    DualControllerObservation,
    DualDispatchObservation,
    DualUnitRequest,
    DualWorkerArm,
    DualWorkerBenchmarkError,
    DualWorkerCompletion,
    DualWorkerFailureCode,
    DualWorkerRole,
    DualWorkerRuntime,
    DualWorkerStatus,
    DualWorkIdentity,
)

MAXIMUM_INPUT_CODE_POINTS: Final = 640
MAXIMUM_INPUT_UTF8_BYTES: Final = 2_048
MAXIMUM_REORDER_UNITS: Final = 40
MAXIMUM_SAMPLE_FRAMES_PER_UNIT: Final = 480_000
EXPECTED_SAMPLE_RATE_HZ: Final = 24_000


def _roles_for_arm(arm: DualWorkerArm) -> tuple[DualWorkerRole, ...]:
    if arm == "cpu-solo":
        return (CPU_WORKER_ROLE,)
    if arm == "gpu-solo":
        return (GPU_WORKER_ROLE,)
    return (GPU_WORKER_ROLE, CPU_WORKER_ROLE)


def _validate_requests(
    arm: DualWorkerArm,
    requests: tuple[DualUnitRequest, ...],
) -> None:
    if not requests or len(requests) > MAXIMUM_REORDER_UNITS:
        raise DualWorkerBenchmarkError("resource-limit")
    expected_prefix = {
        "cpu-solo": "v5-cpu-",
        "gpu-solo": "v5-gpu-",
        "concurrent": "v5-concurrent-",
    }[arm]
    identities = {request.identity for request in requests}
    if len(identities) != 1:
        raise DualWorkerBenchmarkError("stale-identity")
    for index, request in enumerate(requests):
        if (
            request.source_sequence != index
            or request.attempt != 1
            or not request.occurrence_id.startswith(expected_prefix)
            or not request.unit_id
            or not request.text
            or len(request.text) > MAXIMUM_INPUT_CODE_POINTS
            or len(request.text.encode()) > MAXIMUM_INPUT_UTF8_BYTES
        ):
            raise DualWorkerBenchmarkError("resource-limit")
    if len({request.occurrence_id for request in requests}) != len(requests):
        raise DualWorkerBenchmarkError("resource-limit")


def _validate_workers(
    runtime: DualWorkerRuntime,
    required_roles: tuple[DualWorkerRole, ...],
) -> None:
    roles = tuple(worker.role for worker in runtime.workers)
    if (
        len(roles) != len(set(roles))
        or set(roles) != set(required_roles)
        or any(
            not worker.worker_profile_id or not worker.candidate_id for worker in runtime.workers
        )
    ):
        raise DualWorkerBenchmarkError("resource-limit")


def _status_for(completion: DualWorkerCompletion) -> DualWorkerStatus:
    if completion.status == "timed-out":
        return "timed-out"
    if completion.status == "cancelled":
        return "cancelled"
    if completion.status == "completed":
        return "completed"
    return "failed"


def _failure_observation(
    dispatch_sequence: int,
    completion: DualWorkerCompletion,
) -> DualDispatchObservation:
    return DualDispatchObservation(
        dispatch_sequence=dispatch_sequence,
        occurrence_id=completion.request.occurrence_id,
        unit_id=completion.request.unit_id,
        source_sequence=completion.request.source_sequence,
        pass_index=completion.request.pass_index,
        worker_role=completion.worker.role,
        attempt=1,
        accepted_nanoseconds=completion.accepted_nanoseconds,
        completed_nanoseconds=completion.completed_nanoseconds,
        status=_status_for(completion),
        failure_code=completion.failure_code or "generation-failed",
        sample_count=None,
        sample_rate_hz=None,
        published_sequence=None,
        head_of_line_wait_nanoseconds=None,
    )


class BoundedDualWorkerController:
    """Dispatch one unit per worker and release complete results in source order."""

    def __init__(self) -> None:
        self._active_identity: DualWorkIdentity | None = None

    def invalidate_identity(self) -> None:
        """Make every later completion stale before any worker is terminated."""

        self._active_identity = None

    def invalidate(
        self,
        runtime: DualWorkerRuntime,
        active: dict[DualWorkerRole, DualUnitRequest],
    ) -> None:
        """Invalidate first, then terminate every affected worker."""

        self._active_identity = None
        for role, request in tuple(active.items()):
            runtime.cancel(role, request.occurrence_id)
        active.clear()

    def run(
        self,
        *,
        arm: DualWorkerArm,
        runtime: DualWorkerRuntime,
        requests: tuple[DualUnitRequest, ...],
        after_initial_dispatch: AfterInitialDispatch | None = None,
        before_ordered_release: BeforeOrderedRelease | None = None,
    ) -> DualControllerObservation:
        """Run one bounded arm through injected independent workers."""

        _validate_requests(arm, requests)
        roles = _roles_for_arm(arm)
        _validate_workers(runtime, roles)
        if self._active_identity is not None:
            raise DualWorkerBenchmarkError("resource-limit")
        identity = requests[0].identity
        self._active_identity = identity
        active: dict[DualWorkerRole, DualUnitRequest] = {}
        dispatch_index_by_occurrence: dict[str, int] = {}
        observations: list[DualDispatchObservation | None] = []
        pending: dict[int, DualWorkerCompletion] = {}
        released: list[DualAudioUnit] = []
        next_claim = 0
        next_release = 0
        peak_active = 0
        peak_gpu = 0
        peak_cpu = 0
        peak_reorder = 0
        stale_rejected = 0
        invalidated = False

        def dispatch(role: DualWorkerRole) -> None:
            nonlocal next_claim, peak_active, peak_gpu, peak_cpu
            if next_claim >= len(requests) or role in active:
                return
            request = requests[next_claim]
            accepted = runtime.submit(role, request)
            if not isinstance(accepted, int) or isinstance(accepted, bool) or accepted < 0:
                raise DualWorkerBenchmarkError("generation-failed")
            index = len(observations)
            dispatch_index_by_occurrence[request.occurrence_id] = index
            observations.append(
                DualDispatchObservation(
                    dispatch_sequence=index,
                    occurrence_id=request.occurrence_id,
                    unit_id=request.unit_id,
                    source_sequence=request.source_sequence,
                    pass_index=request.pass_index,
                    worker_role=role,
                    attempt=1,
                    accepted_nanoseconds=accepted,
                    completed_nanoseconds=None,
                    status="failed",
                    failure_code="generation-failed",
                    sample_count=None,
                    sample_rate_hz=None,
                    published_sequence=None,
                    head_of_line_wait_nanoseconds=None,
                )
            )
            active[role] = request
            next_claim += 1
            peak_active = max(peak_active, len(active))
            peak_gpu = max(peak_gpu, int(GPU_WORKER_ROLE in active))
            peak_cpu = max(peak_cpu, int(CPU_WORKER_ROLE in active))

        try:
            for role in roles:
                dispatch(role)
            if after_initial_dispatch is not None:
                after_initial_dispatch()
            if self._active_identity != identity:
                for _role, request in active.items():
                    observation_index = dispatch_index_by_occurrence[request.occurrence_id]
                    observation = observations[observation_index]
                    if observation is None:
                        raise DualWorkerBenchmarkError("invalid-output")
                    observations[observation_index] = replace(
                        observation,
                        status="stale-rejected",
                        failure_code="stale-identity",
                    )
                    stale_rejected += 1
                invalidated = True
                self.invalidate(runtime, active)
            while active:
                completion = runtime.next_completion(frozenset(active))
                active_request = active.get(completion.worker.role)
                dispatch_index = dispatch_index_by_occurrence.get(completion.request.occurrence_id)
                dispatch_observation = (
                    None if dispatch_index is None else observations[dispatch_index]
                )
                if (
                    active_request is None
                    or dispatch_index is None
                    or dispatch_observation is None
                    or completion.request != active_request
                    or completion.accepted_nanoseconds != dispatch_observation.accepted_nanoseconds
                ):
                    invalidated = True
                    stale_rejected += 1
                    self.invalidate(runtime, active)
                    break
                del active[completion.worker.role]

                if (
                    completion.status != "completed"
                    or completion.audio is None
                    or completion.completed_nanoseconds is None
                ):
                    observations[dispatch_index] = _failure_observation(
                        dispatch_index,
                        completion,
                    )
                    invalidated = True
                    self.invalidate(runtime, active)
                    break

                audio = completion.audio
                invalid_identity = (
                    self._active_identity != identity
                    or audio.identity != identity
                    or audio.worker != completion.worker
                    or audio.occurrence_id != active_request.occurrence_id
                    or audio.unit_id != active_request.unit_id
                    or audio.source_sequence != active_request.source_sequence
                )
                invalid_shape = (
                    audio.sample_count <= 0
                    or audio.sample_count > MAXIMUM_SAMPLE_FRAMES_PER_UNIT
                    or audio.sample_rate_hz != EXPECTED_SAMPLE_RATE_HZ
                    or audio.channels != 1
                    or audio.sample_format != "float32"
                    or completion.completed_nanoseconds < completion.accepted_nanoseconds
                )
                if invalid_identity or invalid_shape:
                    code: DualWorkerFailureCode = (
                        "stale-identity" if invalid_identity else "invalid-output"
                    )
                    observations[dispatch_index] = replace(
                        _failure_observation(dispatch_index, completion),
                        status="stale-rejected" if invalid_identity else "failed",
                        failure_code=code,
                    )
                    stale_rejected += int(invalid_identity)
                    invalidated = True
                    self.invalidate(runtime, active)
                    break

                pending[active_request.source_sequence] = completion
                peak_reorder = max(peak_reorder, len(pending))
                if len(pending) > MAXIMUM_REORDER_UNITS:
                    invalidated = True
                    self.invalidate(runtime, active)
                    raise DualWorkerBenchmarkError("resource-limit")
                if before_ordered_release is not None:
                    before_ordered_release(completion)
                if self._active_identity != identity:
                    observations[dispatch_index] = replace(
                        _failure_observation(dispatch_index, completion),
                        status="stale-rejected",
                        failure_code="stale-identity",
                    )
                    stale_rejected += 1
                    invalidated = True
                    self.invalidate(runtime, active)
                    break

                release_time = completion.completed_nanoseconds
                while next_release in pending:
                    ordered = pending.pop(next_release)
                    ordered_audio = ordered.audio
                    if ordered_audio is None or ordered.completed_nanoseconds is None:
                        raise DualWorkerBenchmarkError("invalid-output")
                    ordered_index = dispatch_index_by_occurrence[ordered.request.occurrence_id]
                    release_time = max(release_time, ordered.completed_nanoseconds)
                    observations[ordered_index] = DualDispatchObservation(
                        dispatch_sequence=ordered_index,
                        occurrence_id=ordered.request.occurrence_id,
                        unit_id=ordered.request.unit_id,
                        source_sequence=ordered.request.source_sequence,
                        pass_index=ordered.request.pass_index,
                        worker_role=ordered.worker.role,
                        attempt=1,
                        accepted_nanoseconds=ordered.accepted_nanoseconds,
                        completed_nanoseconds=ordered.completed_nanoseconds,
                        status="completed",
                        failure_code=None,
                        sample_count=ordered_audio.sample_count,
                        sample_rate_hz=ordered_audio.sample_rate_hz,
                        published_sequence=next_release,
                        head_of_line_wait_nanoseconds=(
                            release_time - ordered.completed_nanoseconds
                        ),
                    )
                    released.append(ordered_audio)
                    next_release += 1
                dispatch(completion.worker.role)

            final_observations = tuple(
                observation for observation in observations if observation is not None
            )
            return DualControllerObservation(
                arm=arm,
                dispatches=final_observations,
                released=tuple(released),
                peak_active_units=peak_active,
                peak_active_gpu_units=peak_gpu,
                peak_active_cpu_units=peak_cpu,
                peak_reorder_units=peak_reorder,
                stale_rejected_units=stale_rejected,
                invalidated=invalidated,
            )
        finally:
            self._active_identity = None

    def close(self, runtime: DualWorkerRuntime) -> None:
        self._active_identity = None
        try:
            runtime.close()
        except DualWorkerBenchmarkError:
            raise
        except Exception:
            raise DualWorkerBenchmarkError("cleanup-failed") from None
