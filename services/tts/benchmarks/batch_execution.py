"""Bounded ordered execution for the frozen v4 batch experiment."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass
from typing import Final, Literal

from benchmarks.batch_contracts import (
    BatchBenchmarkError,
    BatchCallObservation,
    BatchCandidate,
    BatchClock,
    BatchExecutionObservation,
    BatchFailureCode,
    BatchGenerationRequest,
    BatchResourceProbe,
    BatchResourceSnapshot,
    BatchStatus,
    BatchUnitObservation,
    BatchWorkIdentity,
    BeforePublication,
)

MAXIMUM_BATCH_SIZE: Final = 2
MAXIMUM_RETAINED_UNITS: Final = 2
MAXIMUM_INPUT_CODE_POINTS: Final = 640
MAXIMUM_INPUT_UTF8_BYTES: Final = 2_048
MAXIMUM_SAMPLE_FRAMES_PER_UNIT: Final = 5_120_000
EXPECTED_SAMPLE_RATE_HZ: Final = 24_000


@dataclass
class BatchIdentityGate:
    """Accept only output for the current session and generation."""

    active: BatchWorkIdentity | None = None

    def activate(self, identity: BatchWorkIdentity) -> None:
        if self.active is not None:
            raise BatchBenchmarkError("resource-limit")
        self.active = identity

    def invalidate(self) -> None:
        self.active = None

    def accepts(self, identity: BatchWorkIdentity) -> bool:
        return self.active == identity


def _zero_resources() -> BatchResourceSnapshot:
    return BatchResourceSnapshot(0, 0, 0, 0, 0)


def _maximum_resources(
    values: Sequence[BatchResourceSnapshot],
) -> BatchResourceSnapshot:
    if not values:
        return _zero_resources()
    return BatchResourceSnapshot(
        process_tree_ram_bytes=max(value.process_tree_ram_bytes for value in values),
        process_dedicated_vram_bytes=max(value.process_dedicated_vram_bytes for value in values),
        framework_reserved_vram_bytes=max(value.framework_reserved_vram_bytes for value in values),
        free_dedicated_vram_bytes=min(value.free_dedicated_vram_bytes for value in values),
        shared_gpu_memory_bytes=max(value.shared_gpu_memory_bytes for value in values),
    )


def _validate_request(request: BatchGenerationRequest) -> None:
    if (
        len(request.units) not in (1, 2)
        or request.call_index < 0
        or request.attempt != 1
        or not request.identity.session_id
        or not request.identity.generation_id
        or len({unit.unit_id for unit in request.units}) != len(request.units)
    ):
        raise BatchBenchmarkError("resource-limit")
    for unit in request.units:
        if (
            not unit.unit_id
            or unit.source_sequence < 0
            or not unit.text
            or len(unit.text) > MAXIMUM_INPUT_CODE_POINTS
            or len(unit.text.encode()) > MAXIMUM_INPUT_UTF8_BYTES
        ):
            raise BatchBenchmarkError("resource-limit")


def _failure_observation(
    request: BatchGenerationRequest,
    *,
    accepted_ns: int,
    completed_ns: int | None,
    code: BatchFailureCode,
    resource_peak: BatchResourceSnapshot,
) -> BatchExecutionObservation:
    call_status: Literal["completed", "failed", "timed-out", "cancelled"]
    if code == "timeout":
        call_status = "timed-out"
    elif code == "cancelled":
        call_status = "cancelled"
    else:
        call_status = "failed"
    unit_status: BatchStatus = (
        "timed-out"
        if code == "timeout"
        else "cancelled"
        if code == "cancelled"
        else "stale-rejected"
        if code == "stale-identity"
        else "failed"
    )
    return BatchExecutionObservation(
        call=BatchCallObservation(
            call_index=request.call_index,
            phase=request.phase,
            pass_index=request.pass_index,
            pair_id=request.pair_id,
            batch_size=request.batch_size,
            unit_ids=tuple(unit.unit_id for unit in request.units),
            attempt=1,
            accepted_nanoseconds=accepted_ns,
            completed_nanoseconds=completed_ns,
            status=call_status,
            failure_code=code,
        ),
        units=tuple(
            BatchUnitObservation(
                call_index=request.call_index,
                unit_id=unit.unit_id,
                source_sequence=unit.source_sequence,
                batch_position=position,
                sample_count=None,
                sample_rate_hz=EXPECTED_SAMPLE_RATE_HZ,
                duration_seconds=None,
                first_audio_nanoseconds=None,
                completion_nanoseconds=None,
                request_rtf=None,
                published_sequence=None,
                status=unit_status,
                failure_code=code,
            )
            for position, unit in enumerate(request.units)
        ),
        published=(),
        peak_retained_units=0,
        peak_active_batches=1,
        resource_peak=resource_peak,
    )


class BoundedOrderedBatchController:
    """Validate, retain, and publish at most one two-unit batch."""

    def __init__(
        self,
        *,
        clock: BatchClock,
        resource_probe: BatchResourceProbe | None = None,
    ) -> None:
        self._clock = clock
        self._resource_probe = resource_probe
        self.identity_gate = BatchIdentityGate()
        self._published_sequence = 0
        self._active = False

    def _now_ns(self) -> int:
        value = self._clock.now_ns()
        if not isinstance(value, int) or isinstance(value, bool) or value < 0:
            raise BatchBenchmarkError("generation-failed")
        return value

    def _snapshot(self) -> BatchResourceSnapshot:
        if self._resource_probe is None:
            return _zero_resources()
        value = self._resource_probe.snapshot()
        if (
            min(
                value.process_tree_ram_bytes,
                value.process_dedicated_vram_bytes,
                value.framework_reserved_vram_bytes,
                value.free_dedicated_vram_bytes,
                value.shared_gpu_memory_bytes,
            )
            < 0
        ):
            raise BatchBenchmarkError("generation-failed")
        return value

    def execute(
        self,
        candidate: BatchCandidate,
        request: BatchGenerationRequest,
        *,
        before_publication: BeforePublication | None = None,
    ) -> BatchExecutionObservation:
        _validate_request(request)
        if self._active:
            raise BatchBenchmarkError("resource-limit")
        self._active = True
        self.identity_gate.activate(request.identity)
        accepted_ns = self._now_ns()
        snapshots = [self._snapshot()]
        try:
            try:
                outputs = tuple(candidate.generate_batch(request))
            except BatchBenchmarkError as error:
                completed_ns = self._now_ns()
                snapshots.append(self._snapshot())
                self.identity_gate.invalidate()
                return _failure_observation(
                    request,
                    accepted_ns=accepted_ns,
                    completed_ns=None if error.code == "timeout" else completed_ns,
                    code=error.code,
                    resource_peak=_maximum_resources(snapshots),
                )
            except Exception:
                completed_ns = self._now_ns()
                snapshots.append(self._snapshot())
                self.identity_gate.invalidate()
                return _failure_observation(
                    request,
                    accepted_ns=accepted_ns,
                    completed_ns=completed_ns,
                    code="generation-failed",
                    resource_peak=_maximum_resources(snapshots),
                )

            completed_ns = self._now_ns()
            snapshots.append(self._snapshot())
            if before_publication is not None:
                before_publication(request)
            expected = tuple(
                (
                    request.identity,
                    request.call_index,
                    unit.unit_id,
                    unit.source_sequence,
                    position,
                )
                for position, unit in enumerate(request.units)
            )
            actual = tuple(
                (
                    output.identity,
                    output.call_index,
                    output.unit_id,
                    output.source_sequence,
                    output.batch_position,
                )
                for output in outputs
            )
            invalid_identity = any(
                output.identity != request.identity for output in outputs
            ) or not self.identity_gate.accepts(request.identity)
            invalid_shape = (
                len(outputs) != len(request.units)
                or actual != expected
                or len(outputs) > MAXIMUM_RETAINED_UNITS
                or any(
                    output.sample_count <= 0
                    or output.sample_count > MAXIMUM_SAMPLE_FRAMES_PER_UNIT
                    or output.sample_rate_hz != EXPECTED_SAMPLE_RATE_HZ
                    or output.channels != 1
                    or output.sample_format != "float32"
                    for output in outputs
                )
            )
            if invalid_identity or invalid_shape:
                self.identity_gate.invalidate()
                return _failure_observation(
                    request,
                    accepted_ns=accepted_ns,
                    completed_ns=completed_ns,
                    code="stale-identity" if invalid_identity else "invalid-output",
                    resource_peak=_maximum_resources(snapshots),
                )

            wall_ns = completed_ns - accepted_ns
            observations: list[BatchUnitObservation] = []
            for output in outputs:
                duration = output.sample_count / output.sample_rate_hz
                observations.append(
                    BatchUnitObservation(
                        call_index=request.call_index,
                        unit_id=output.unit_id,
                        source_sequence=output.source_sequence,
                        batch_position=output.batch_position,
                        sample_count=output.sample_count,
                        sample_rate_hz=output.sample_rate_hz,
                        duration_seconds=duration,
                        first_audio_nanoseconds=wall_ns,
                        completion_nanoseconds=wall_ns,
                        request_rtf=(wall_ns / 1_000_000_000) / duration,
                        published_sequence=self._published_sequence,
                        status="completed",
                        failure_code=None,
                    )
                )
                self._published_sequence += 1
            self.identity_gate.invalidate()
            return BatchExecutionObservation(
                call=BatchCallObservation(
                    call_index=request.call_index,
                    phase=request.phase,
                    pass_index=request.pass_index,
                    pair_id=request.pair_id,
                    batch_size=request.batch_size,
                    unit_ids=tuple(unit.unit_id for unit in request.units),
                    attempt=1,
                    accepted_nanoseconds=accepted_ns,
                    completed_nanoseconds=completed_ns,
                    status="completed",
                    failure_code=None,
                ),
                units=tuple(observations),
                published=outputs,
                peak_retained_units=len(outputs),
                peak_active_batches=1,
                resource_peak=_maximum_resources(snapshots),
            )
        finally:
            self.identity_gate.invalidate()
            self._active = False

    def close(self, candidate: BatchCandidate) -> None:
        self.identity_gate.invalidate()
        try:
            candidate.close()
        except BatchBenchmarkError:
            raise
        except Exception:
            raise BatchBenchmarkError("cleanup-failed") from None
