from __future__ import annotations

import copy
import json
from collections.abc import Callable
from pathlib import Path
from typing import cast

import pytest

from benchmarks.service_handoff_authority import (
    EXPECTED_CASE_IDS,
    PROFILE_SHA256,
    SUCCESS_CASE_IDS,
    ServiceHandoffAuthorityError,
    load_service_handoff_authority,
    nearest_rank_p95,
    validate_service_handoff_result,
)

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]


def _case(case_id: str) -> dict[str, object]:
    success = case_id in SUCCESS_CASE_IDS
    return {
        "caseId": case_id,
        "outcome": "pass",
        "publishedAudioUnits": 1 if success else 0,
        "deliveredAudioBytes": 96_000 if success else 0,
        "elapsedMilliseconds": 1_000.0,
        "mediaDurationSeconds": 1.0 if success else None,
        "commandToFirstTransportFrameMilliseconds": 900.0 if success else None,
        "commandToCompleteUnitMilliseconds": 1_000.0 if success else None,
        "nativeFrameHandoffMicroseconds": 25.0 if success else None,
        "rtf": 1.0 if success else None,
        "terminationMilliseconds": (
            100.0
            if case_id
            in {
                "accepted-before-output-cancellation",
                "mid-generation-cancellation",
                "child-crash",
                "application-exit",
            }
            else None
        ),
        "failureCode": None,
    }


def _result() -> dict[str, object]:
    return {
        "schemaVersion": 1,
        "profileVersion": "tts-service-handoff-profile-v1",
        "profileSha256": PROFILE_SHA256,
        "authorityCommitSha": "a" * 40,
        "executionCommitSha": "b" * 40,
        "attemptOrdinal": 1,
        "automaticRetries": 0,
        "status": "pass",
        "candidateId": "qwen3-tts-1-7b-customvoice-cuda-bf16-v1",
        "protocolVersion": 1,
        "cases": [_case(case_id) for case_id in EXPECTED_CASE_IDS],
        "timings": {
            "serviceStartMilliseconds": 100.0,
            "initialLoadMilliseconds": 1_000.0,
            "initialWarmMilliseconds": 1_000.0,
            "commandToFirstTransportFrameP95Milliseconds": 900.0,
            "commandToCompleteUnitP95Milliseconds": 1_000.0,
            "nativeFrameHandoffP95Microseconds": 25.0,
            "terminationP95Milliseconds": 100.0,
            "restartPrepareP95Milliseconds": 2_000.0,
        },
        "resources": {
            "ramSamplingIntervalMilliseconds": 50,
            "vramSamplingIntervalMilliseconds": 1_000,
            "vramMethod": "wddm-process-tree-dedicated-and-shared",
            "peakProcessTreeRamBytes": 8_000_000_000,
            "peakDedicatedGpuBytes": 6_000_000_000,
            "peakSharedGpuBytes": 100_000_000,
            "peakGpuAllocatingProcesses": 1,
        },
        "cleanup": {
            "processTreeRamBytes": 0,
            "dedicatedGpuBytes": 0,
            "sharedGpuBytes": 0,
            "listenerCount": 0,
            "externalConnectionCount": 0,
            "generatedAudioPersisted": False,
        },
        "privacy": {
            "containsNarrationText": False,
            "containsWaveformOrAudioBytes": False,
            "containsPathOrEnvironmentValue": False,
            "containsProcessIdentifier": False,
            "containsExceptionOrProcessCommand": False,
            "containsPrivateIdentity": False,
        },
        "conclusions": {
            "completeUnitHandoff": "pass",
            "backpressure": "pass",
            "cancellationContainment": "pass",
            "cleanupAndRestart": "pass",
            "nativeModelStreaming": "unsupported",
            "cooperativeCancellation": "unsupported",
            "sustainablePlayback": "not-evaluated",
            "productionProfile": "not-selected",
            "generalHardwareSupport": "not-claimed",
        },
    }


def test_service_handoff_profile_and_candidate_authorities_are_byte_frozen() -> None:
    authority = load_service_handoff_authority(REPOSITORY_ROOT)
    matrix = cast(list[dict[str, object]], authority.profile["matrix"])
    assert tuple(value["caseId"] for value in matrix) == EXPECTED_CASE_IDS
    assert set(authority.inputs) == {"neutral-1", "spanish-1", "spanish-2"}


def test_content_safe_result_matches_the_frozen_schema_and_semantics() -> None:
    assert validate_service_handoff_result(REPOSITORY_ROOT, _result())["status"] == "pass"


@pytest.mark.parametrize(
    ("mutation", "reason"),
    (
        (lambda value: value.update(profileSha256="0" * 64), "result-authority"),
        (
            lambda value: value["cases"].reverse(),
            "result-case-order",
        ),
        (
            lambda value: value["cases"][0].update(publishedAudioUnits=0),
            "result-case-outcome",
        ),
        (
            lambda value: value["cases"][2].update(deliveredAudioBytes=4),
            "result-invalidated-audio",
        ),
        (
            lambda value: value["cases"][0].update(rtf=float("nan")),
            "result-nonfinite",
        ),
    ),
)
def test_result_rejects_authority_order_audio_and_numeric_drift(
    mutation: Callable[[dict[str, object]], object], reason: str
) -> None:
    value = _result()
    mutation(value)
    with pytest.raises(ServiceHandoffAuthorityError, match=reason):
        validate_service_handoff_result(REPOSITORY_ROOT, value)


def test_result_cannot_contain_a_frozen_synthetic_input() -> None:
    authority = load_service_handoff_authority(REPOSITORY_ROOT)
    value = _result()
    cases = cast(list[dict[str, object]], value["cases"])
    cases[0]["failureCode"] = next(iter(authority.inputs.values()))
    with pytest.raises(ServiceHandoffAuthorityError):
        validate_service_handoff_result(REPOSITORY_ROOT, value)


def test_nearest_rank_p95_is_closed_and_deterministic() -> None:
    assert nearest_rank_p95((4.0, 1.0, 3.0, 2.0)) == 4.0
    with pytest.raises(ServiceHandoffAuthorityError, match="percentile-input"):
        nearest_rank_p95(())


def test_every_committed_service_handoff_result_is_valid() -> None:
    for path in sorted(
        (REPOSITORY_ROOT / "benchmarks/tts").glob("service-handoff-result-v1-*.json")
    ):
        value = json.loads(path.read_text(encoding="utf-8"))
        validate_service_handoff_result(REPOSITORY_ROOT, copy.deepcopy(value))
