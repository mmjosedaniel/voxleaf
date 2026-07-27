from __future__ import annotations

import copy
from pathlib import Path
from typing import cast

import pytest

from benchmarks.memory import ProcessResourceSample
from benchmarks.service_handoff_authority import EXPECTED_CASE_IDS, PROFILE_SHA256
from benchmarks.service_handoff_cli import (
    AUTHORITY_COMMIT_SHA,
    ServiceHandoffRunError,
    _final_result,
    _numeric_values,
    _parse_event,
)

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]


def _case(case_id: str) -> dict[str, object]:
    success = case_id in {"cold-neutral-success", "warm-spanish-success"}
    completed = success or case_id == "after-complete-before-delivery-invalidation"
    terminated = case_id in {
        "accepted-before-output-cancellation",
        "mid-generation-cancellation",
        "child-crash",
        "application-exit",
    }
    return {
        "caseId": case_id,
        "outcome": "pass",
        "publishedAudioUnits": 1 if success else 0,
        "deliveredAudioBytes": 96_000 if success else 0,
        "elapsedMilliseconds": 1_000.0,
        "mediaDurationSeconds": 1.0 if completed else None,
        "commandToFirstTransportFrameMilliseconds": 900.0 if completed else None,
        "commandToCompleteUnitMilliseconds": 1_000.0 if completed else None,
        "nativeFrameHandoffMicroseconds": 25.0 if completed else None,
        "rtf": 1.0 if completed else None,
        "terminationMilliseconds": 100.0 if terminated else None,
        "failureCode": None,
    }


def _native_result() -> dict[str, object]:
    return {
        "kind": "nativeResult",
        "cases": [_case(case_id) for case_id in EXPECTED_CASE_IDS],
        "timings": {
            "serviceStartMilliseconds": 100.0,
            "initialLoadMilliseconds": 1_000.0,
            "initialWarmMilliseconds": 500.0,
            "restartPrepareMilliseconds": [1_400.0, 1_500.0, 1_600.0],
        },
    }


def test_parse_event_accepts_only_closed_content_safe_shapes() -> None:
    phase = _parse_event(
        '{"kind":"phase","phase":"ready","requiresZeroChildren":false,"observeNetwork":true}'
    )
    assert phase["phase"] == "ready"
    with pytest.raises(ServiceHandoffRunError, match="native-phase"):
        _parse_event(
            '{"kind":"phase","phase":"ready","requiresZeroChildren":false,'
            '"observeNetwork":true,"text":"private"}'
        )


def test_final_result_derives_closed_percentiles_and_validates() -> None:
    result = _final_result(
        REPOSITORY_ROOT,
        _native_result(),
        execution_commit_sha="b" * 40,
        peak_ram_bytes=8_000_000_000,
        peak_dedicated_bytes=6_000_000_000,
        peak_shared_bytes=100_000_000,
        peak_allocations=1,
        cleanup=ProcessResourceSample(0, 0, 0),
        cleanup_shared=ProcessResourceSample(0, 0, 0),
        listener_count=0,
        external_connection_count=0,
    )
    assert result["profileSha256"] == PROFILE_SHA256
    assert result["authorityCommitSha"] == AUTHORITY_COMMIT_SHA
    timings = cast(dict[str, object], result["timings"])
    assert timings["restartPrepareP95Milliseconds"] == 1_600.0


def test_final_result_rejects_nonzero_cleanup_or_network_state() -> None:
    for change in ("ram", "dedicated", "shared", "listener", "external"):
        cleanup = ProcessResourceSample(
            1 if change == "ram" else 0, 1 if change == "dedicated" else 0, 0
        )
        shared = ProcessResourceSample(0, 1 if change == "shared" else 0, 0)
        with pytest.raises(ServiceHandoffRunError, match="cleanup"):
            _final_result(
                REPOSITORY_ROOT,
                copy.deepcopy(_native_result()),
                execution_commit_sha="b" * 40,
                peak_ram_bytes=1,
                peak_dedicated_bytes=1,
                peak_shared_bytes=0,
                peak_allocations=1,
                cleanup=cleanup,
                cleanup_shared=shared,
                listener_count=1 if change == "listener" else 0,
                external_connection_count=1 if change == "external" else 0,
            )


def test_numeric_values_ignores_null_and_boolean_values() -> None:
    assert _numeric_values(
        (
            {"metric": 1},
            {"metric": 2.5},
            {"metric": None},
            {"metric": True},
        ),
        "metric",
    ) == (1.0, 2.5)
