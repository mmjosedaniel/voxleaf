"""Exact frozen occurrence construction for the v5 worker arms."""

from __future__ import annotations

from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import cast

from benchmarks.dual_worker_contracts import (
    DualUnitRequest,
    DualWorkerArm,
    DualWorkerBenchmarkError,
    DualWorkIdentity,
)
from benchmarks.v5_authority import BASE_UNIT_ORDER, EXPECTED_PASSES, load_frozen_v5_authority


def _mapping(value: object) -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise DualWorkerBenchmarkError("invalid-output")
    return cast(Mapping[str, object], value)


def _sequence(value: object) -> Sequence[object]:
    if not isinstance(value, list):
        raise DualWorkerBenchmarkError("invalid-output")
    return cast(Sequence[object], value)


def build_v5_requests(
    repository_root: Path,
    *,
    arm: DualWorkerArm,
    identity: DualWorkIdentity,
) -> tuple[DualUnitRequest, ...]:
    """Expand only the byte-frozen corpus and official arm schedule."""

    authority = load_frozen_v5_authority(repository_root, validate_schemas=False)
    units = {
        cast(str, unit.get("unitId")): unit
        for raw in _sequence(authority.base_corpus.get("units"))
        for unit in (_mapping(raw),)
    }
    if tuple(units) != BASE_UNIT_ORDER:
        raise DualWorkerBenchmarkError("invalid-output")
    prefix = {"cpu-solo": "cpu", "gpu-solo": "gpu", "concurrent": "concurrent"}[arm]
    requests: list[DualUnitRequest] = []
    for pass_index in range(1, EXPECTED_PASSES[arm] + 1):
        for unit_id in BASE_UNIT_ORDER:
            unit = units[unit_id]
            text = unit.get("narrationText")
            if not isinstance(text, str) or not text:
                raise DualWorkerBenchmarkError("invalid-output")
            source_sequence = len(requests)
            requests.append(
                DualUnitRequest(
                    occurrence_id=f"v5-{prefix}-p{pass_index:02d}-{unit_id}",
                    unit_id=unit_id,
                    source_sequence=source_sequence,
                    pass_index=pass_index,
                    attempt=1,
                    identity=identity,
                    text=text,
                )
            )
    return tuple(requests)
