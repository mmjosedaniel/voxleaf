"""Frozen model-free matrix and content-safe receipt tests."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Final, cast

from benchmarks.batch_contracts import BatchWorkIdentity
from benchmarks.batch_fake import DeterministicBatchCandidate, FakeBatchClock
from benchmarks.batch_matrix import execute_v4_batch_mechanics, frozen_v4_requests

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]


def test_frozen_matrix_has_exact_warmup_pass_batch_pair_and_unit_order() -> None:
    requests = frozen_v4_requests(
        REPOSITORY_ROOT,
        identity=BatchWorkIdentity("session", "generation"),
    )
    assert len(requests) == 39
    assert [request.batch_size for request in requests[:3]] == [1, 1, 2]
    measured = requests[3:]
    assert sum(request.batch_size == 1 for request in measured) == 24
    assert sum(request.batch_size == 2 for request in measured) == 12
    assert sum(len(request.units) for request in measured) == 48
    assert [request.pass_index for request in measured[:12]] == [1] * 12
    assert [request.batch_size for request in measured[:12]] == [1] * 8 + [2] * 4
    assert [request.batch_size for request in measured[12:24]] == [2] * 4 + [1] * 8
    assert all(request.attempt == 1 for request in requests)


def test_official_mechanics_receipt_is_deterministic_bounded_and_content_safe() -> None:
    clock = FakeBatchClock()
    result = execute_v4_batch_mechanics(
        REPOSITORY_ROOT,
        candidate=DeterministicBatchCandidate(clock),
        purpose="official",
        identity=BatchWorkIdentity("private-session", "private-generation"),
        clock=clock,
    )
    counts = cast(dict[str, object], result["counts"])
    observations = cast(dict[str, object], result["observations"])
    assert counts == {
        "calls": 39,
        "units": 52,
        "measuredCalls": 36,
        "measuredUnits": 48,
        "batchOneMeasuredCalls": 24,
        "batchTwoMeasuredCalls": 12,
        "automaticRetries": 0,
    }
    assert observations == {
        "maximumRetainedUnits": 2,
        "maximumActiveBatches": 1,
        "orderedPublishedUnits": 52,
        "resourceHighWater": {
            "processTreeRamBytes": 0,
            "processDedicatedVramBytes": 0,
            "frameworkReservedVramBytes": 0,
            "minimumFreeDedicatedVramBytes": 0,
            "sharedGpuMemoryBytes": 0,
        },
    }
    assert result["cleanupPassed"] is True
    assert result["failureCodes"] == []
    assert result["eligibleForPromotion"] is False
    serialized = json.dumps(result, sort_keys=True)
    assert "private-session" not in serialized
    assert "private-generation" not in serialized
    assert "narrationText" not in serialized


def test_disposable_pilot_is_exactly_the_three_frozen_warmups() -> None:
    clock = FakeBatchClock()
    result = execute_v4_batch_mechanics(
        REPOSITORY_ROOT,
        candidate=DeterministicBatchCandidate(clock),
        purpose="disposable-pilot",
        identity=BatchWorkIdentity("session", "generation"),
        clock=clock,
    )
    counts = cast(dict[str, object], result["counts"])
    assert counts["calls"] == 3
    assert counts["units"] == 4
    assert counts["measuredCalls"] == 0
    assert result["eligibleForPromotion"] is False
