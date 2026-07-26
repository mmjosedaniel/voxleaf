"""Frozen request construction and content-safe v4 batch mechanics execution."""

from __future__ import annotations

import json
import time
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Final, Literal, cast

from benchmarks.batch_contracts import (
    BatchCandidate,
    BatchClock,
    BatchExecutionObservation,
    BatchGenerationRequest,
    BatchResourceProbe,
    BatchUnitRequest,
    BatchWorkIdentity,
)
from benchmarks.batch_execution import BoundedOrderedBatchController
from benchmarks.v4_authority import load_frozen_v4_mechanics_authority

type MatrixPurpose = Literal["disposable-pilot", "official"]
PILOT_CALL_LIMIT: Final = 3


class SystemBatchClock:
    def now_ns(self) -> int:
        return time.perf_counter_ns()


def _mapping(value: object) -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise ValueError("tts-benchmark-v4-matrix:authority")
    return cast(Mapping[str, object], value)


def _sequence(value: object) -> Sequence[object]:
    if not isinstance(value, list):
        raise ValueError("tts-benchmark-v4-matrix:authority")
    return cast(Sequence[object], value)


def frozen_v4_requests(
    repository_root: Path,
    *,
    identity: BatchWorkIdentity,
) -> tuple[BatchGenerationRequest, ...]:
    """Build the exact warmup and measured call order without rewriting text."""

    authority = load_frozen_v4_mechanics_authority(repository_root)
    units = {
        cast(str, unit["unitId"]): BatchUnitRequest(
            unit_id=cast(str, unit["unitId"]),
            source_sequence=cast(int, unit["sequence"]),
            text=cast(str, unit["narrationText"]),
        )
        for raw in _sequence(authority.corpus.get("units"))
        for unit in (_mapping(raw),)
    }
    pairs = tuple(
        (
            cast(str, pair["pairId"]),
            tuple(cast(str, unit_id) for unit_id in _sequence(pair["unitIds"])),
        )
        for raw in _sequence(authority.corpus.get("pairOrder"))
        for pair in (_mapping(raw),)
    )
    requests: list[BatchGenerationRequest] = []

    def add(
        *,
        phase: Literal["warmup", "measured"],
        pass_index: int | None,
        pair_id: str,
        unit_ids: tuple[str, ...],
    ) -> None:
        requests.append(
            BatchGenerationRequest(
                call_index=len(requests),
                phase=phase,
                pass_index=pass_index,
                pair_id=pair_id,
                attempt=1,
                identity=identity,
                units=tuple(units[unit_id] for unit_id in unit_ids),
            )
        )

    first_pair_id, first_pair = pairs[0]
    add(
        phase="warmup",
        pass_index=None,
        pair_id=first_pair_id,
        unit_ids=(first_pair[0],),
    )
    add(
        phase="warmup",
        pass_index=None,
        pair_id=first_pair_id,
        unit_ids=(first_pair[1],),
    )
    add(
        phase="warmup",
        pass_index=None,
        pair_id=first_pair_id,
        unit_ids=first_pair,
    )
    execution = _mapping(authority.profile.get("executionPolicy"))
    for pass_index, raw_batch_order in enumerate(
        _sequence(execution.get("passBatchOrder")),
        start=1,
    ):
        for raw_batch_size in _sequence(raw_batch_order):
            if raw_batch_size not in (1, 2):
                raise ValueError("tts-benchmark-v4-matrix:authority")
            for pair_id, pair in pairs:
                if raw_batch_size == 1:
                    for unit_id in pair:
                        add(
                            phase="measured",
                            pass_index=pass_index,
                            pair_id=pair_id,
                            unit_ids=(unit_id,),
                        )
                else:
                    add(
                        phase="measured",
                        pass_index=pass_index,
                        pair_id=pair_id,
                        unit_ids=pair,
                    )
    return tuple(requests)


def execute_v4_batch_mechanics(
    repository_root: Path,
    *,
    candidate: BatchCandidate,
    purpose: MatrixPurpose,
    identity: BatchWorkIdentity,
    clock: BatchClock | None = None,
    resource_probe: BatchResourceProbe | None = None,
) -> dict[str, object]:
    """Execute exact calls and emit only a non-promotable content-safe receipt."""

    controller = BoundedOrderedBatchController(
        clock=clock or SystemBatchClock(),
        resource_probe=resource_probe,
    )
    requests = frozen_v4_requests(repository_root, identity=identity)
    selected = requests[:PILOT_CALL_LIMIT] if purpose == "disposable-pilot" else requests
    observations: list[BatchExecutionObservation] = []
    cleanup_passed = False
    try:
        for request in selected:
            observations.append(controller.execute(candidate, request))
    finally:
        try:
            controller.close(candidate)
            cleanup_passed = True
        except Exception:
            cleanup_passed = False

    calls = tuple(observation.call for observation in observations)
    units = tuple(unit for observation in observations for unit in observation.units)
    measured_calls = tuple(call for call in calls if call.phase == "measured")
    measured_units = tuple(
        unit
        for observation in observations
        if observation.call.phase == "measured"
        for unit in observation.units
    )
    failure_codes = sorted(
        {
            code
            for code in (
                *(call.failure_code for call in calls),
                *(unit.failure_code for unit in units),
                None if cleanup_passed else "cleanup-failed",
            )
            if code is not None
        }
    )
    resource_peaks = tuple(value.resource_peak for value in observations)
    return {
        "schemaVersion": "tts-v4-batch-mechanics-receipt-v1",
        "resultPurpose": purpose,
        "candidateId": "qwen3-tts-1-7b-customvoice-cuda-bf16-v1",
        "placementProfileId": "qwen3-serena-v4-full-gpu",
        "counts": {
            "calls": len(calls),
            "units": len(units),
            "measuredCalls": len(measured_calls),
            "measuredUnits": len(measured_units),
            "batchOneMeasuredCalls": sum(call.batch_size == 1 for call in measured_calls),
            "batchTwoMeasuredCalls": sum(call.batch_size == 2 for call in measured_calls),
            "automaticRetries": 0,
        },
        "observations": {
            "maximumRetainedUnits": max(
                (value.peak_retained_units for value in observations),
                default=0,
            ),
            "maximumActiveBatches": max(
                (value.peak_active_batches for value in observations),
                default=0,
            ),
            "orderedPublishedUnits": sum(len(value.published) for value in observations),
            "resourceHighWater": {
                "processTreeRamBytes": max(
                    (value.process_tree_ram_bytes for value in resource_peaks),
                    default=0,
                ),
                "processDedicatedVramBytes": max(
                    (value.process_dedicated_vram_bytes for value in resource_peaks),
                    default=0,
                ),
                "frameworkReservedVramBytes": max(
                    (value.framework_reserved_vram_bytes for value in resource_peaks),
                    default=0,
                ),
                "minimumFreeDedicatedVramBytes": min(
                    (value.free_dedicated_vram_bytes for value in resource_peaks),
                    default=0,
                ),
                "sharedGpuMemoryBytes": max(
                    (value.shared_gpu_memory_bytes for value in resource_peaks),
                    default=0,
                ),
            },
        },
        "cleanupPassed": cleanup_passed,
        "failureCodes": failure_codes,
        "eligibleForPromotion": False,
        "limitations": [
            "mechanics-receipt-not-frozen-v4-result",
            "cancellation-memory-playback-and-quality-still-required",
            "development-benchmark-not-production-runtime",
        ],
    }


def receipt_json(value: Mapping[str, object]) -> str:
    return json.dumps(value, ensure_ascii=True, separators=(",", ":"), sort_keys=True)
