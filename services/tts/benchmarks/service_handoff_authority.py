"""Frozen authority and content-safe result validation for M007 Milestone 5."""

from __future__ import annotations

import hashlib
import json
import math
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Final, cast

from jsonschema import Draft202012Validator

PROFILE_PATH: Final = Path("benchmarks/tts/service-handoff-profile-v1.json")
RESULT_SCHEMA_PATH: Final = Path("benchmarks/tts/schemas/service-handoff-result-v1.schema.json")
PROFILE_SHA256: Final = "1ec39e6bd45064bb8ddd65b43e5ffee76b5a546bb2766f11af2d9c0ee116a2d3"
CANDIDATE_PROFILE_PATH: Final = Path("benchmarks/tts/profile-v3.json")
CANDIDATE_PROFILE_SHA256: Final = "7d062a4f662ed95b1cb5ff0a21fc40864f4ac3858cea4314ee612b84c2e08dbe"
CANDIDATE_LOCK_PATH: Final = Path(
    "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/uv.lock"
)
CANDIDATE_LOCK_SHA256: Final = "1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913"
EXPECTED_CASE_IDS: Final = (
    "cold-neutral-success",
    "warm-spanish-success",
    "blocked-consumer-backpressure",
    "before-dispatch-invalidation",
    "after-complete-before-delivery-invalidation",
    "accepted-before-output-cancellation",
    "mid-generation-cancellation",
    "child-crash",
    "application-exit",
)
SUCCESS_CASE_IDS: Final = frozenset(("cold-neutral-success", "warm-spanish-success"))
_EXPECTED_PUBLISHED_UNITS: Final = {
    "cold-neutral-success": 1,
    "warm-spanish-success": 1,
    "blocked-consumer-backpressure": 0,
    "before-dispatch-invalidation": 0,
    "after-complete-before-delivery-invalidation": 0,
    "accepted-before-output-cancellation": 0,
    "mid-generation-cancellation": 0,
    "child-crash": 0,
    "application-exit": 0,
}


class ServiceHandoffAuthorityError(ValueError):
    """One frozen authority or result invariant failed."""


@dataclass(frozen=True)
class ServiceHandoffAuthority:
    profile: Mapping[str, object]
    result_schema: Mapping[str, object]
    inputs: Mapping[str, str]


def _fail(reason: str) -> ServiceHandoffAuthorityError:
    return ServiceHandoffAuthorityError(f"tts-service-handoff-authority:{reason}")


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _load_object(path: Path, reason: str) -> Mapping[str, object]:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise _fail(reason) from error
    if not isinstance(value, dict):
        raise _fail(reason)
    return cast(Mapping[str, object], value)


def _closed_profile_inputs(profile: Mapping[str, object]) -> Mapping[str, str]:
    raw_inputs = profile.get("syntheticInputs")
    if not isinstance(raw_inputs, list) or len(raw_inputs) != 3:
        raise _fail("profile-inputs")
    inputs: dict[str, str] = {}
    for value in raw_inputs:
        if not isinstance(value, dict):
            raise _fail("profile-input")
        input_id = value.get("inputId")
        text = value.get("text")
        normalization_class = value.get("normalizationClass")
        if (
            not isinstance(input_id, str)
            or input_id in inputs
            or normalization_class not in {"neutral", "spanish"}
            or not isinstance(text, str)
            or not text
            or len(text) > 640
            or len(text.encode("utf-8")) > 2_048
        ):
            raise _fail("profile-input")
        inputs[input_id] = text
    return inputs


def _validate_profile_matrix(profile: Mapping[str, object], inputs: Mapping[str, str]) -> None:
    matrix = profile.get("matrix")
    if not isinstance(matrix, list) or len(matrix) != len(EXPECTED_CASE_IDS):
        raise _fail("profile-matrix")
    case_ids: list[str] = []
    for value in matrix:
        if not isinstance(value, dict):
            raise _fail("profile-case")
        case_id = value.get("caseId")
        input_id = value.get("inputId")
        if (
            not isinstance(case_id, str)
            or value.get("expectedPublishedAudioUnits") != _EXPECTED_PUBLISHED_UNITS.get(case_id)
            or not isinstance(value.get("delayAfterAcceptanceMilliseconds"), int)
            or cast(int, value["delayAfterAcceptanceMilliseconds"]) < 0
            or not isinstance(value.get("requiresCleanRestartAfter"), bool)
            or (input_id is not None and input_id not in inputs)
        ):
            raise _fail("profile-case")
        case_ids.append(case_id)
    if tuple(case_ids) != EXPECTED_CASE_IDS:
        raise _fail("profile-case-order")


def load_service_handoff_authority(repository_root: Path) -> ServiceHandoffAuthority:
    """Load and byte-verify the complete frozen Milestone 5 authority."""

    profile_path = repository_root / PROFILE_PATH
    schema_path = repository_root / RESULT_SCHEMA_PATH
    if _sha256(profile_path) != PROFILE_SHA256:
        raise _fail("profile-hash")
    if _sha256(repository_root / CANDIDATE_PROFILE_PATH) != CANDIDATE_PROFILE_SHA256:
        raise _fail("candidate-profile-hash")
    if _sha256(repository_root / CANDIDATE_LOCK_PATH) != CANDIDATE_LOCK_SHA256:
        raise _fail("candidate-lock-hash")
    profile = _load_object(profile_path, "profile")
    schema = _load_object(schema_path, "result-schema")
    Draft202012Validator.check_schema(schema)
    if (
        profile.get("profileVersion") != "tts-service-handoff-profile-v1"
        or profile.get("status") != "frozen-before-exact-host-results"
    ):
        raise _fail("profile-version")
    candidate = profile.get("candidateAuthority")
    protocol = profile.get("protocolAuthority")
    measurement = profile.get("measurementAuthority")
    if (
        not isinstance(candidate, dict)
        or candidate.get("candidateId") != "qwen3-tts-1-7b-customvoice-cuda-bf16-v1"
        or candidate.get("profileSha256") != CANDIDATE_PROFILE_SHA256
        or candidate.get("candidateLockSha256") != CANDIDATE_LOCK_SHA256
        or candidate.get("batchSize") != 1
        or candidate.get("maxNewTokens") != 2_048
        or not isinstance(protocol, dict)
        or protocol.get("protocolVersion") != 1
        or protocol.get("maximumDurationSeconds") != 20
        or protocol.get("maximumSampleCount") != 480_000
        or protocol.get("maximumPayloadBytes") != 1_920_000
        or protocol.get("activeRequests") != 1
        or protocol.get("queuedRequests") != 0
        or protocol.get("automaticRetries") != 0
        or protocol.get("automaticRestarts") != 0
        or not isinstance(measurement, dict)
        or measurement.get("firstAttemptIsAuthoritative") is not True
        or measurement.get("diagnosticRetries") != 0
    ):
        raise _fail("profile-authority")
    inputs = _closed_profile_inputs(profile)
    _validate_profile_matrix(profile, inputs)
    return ServiceHandoffAuthority(profile=profile, result_schema=schema, inputs=inputs)


def _reject_nonfinite(value: object) -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise _fail("result-nonfinite")
    if isinstance(value, dict):
        for nested in value.values():
            _reject_nonfinite(nested)
    elif isinstance(value, list):
        for nested in value:
            _reject_nonfinite(nested)


def validate_service_handoff_result(repository_root: Path, value: object) -> Mapping[str, object]:
    """Validate one content-safe exact-host result against the frozen authority."""

    authority = load_service_handoff_authority(repository_root)
    if not isinstance(value, dict):
        raise _fail("result-object")
    result = cast(Mapping[str, object], value)
    _reject_nonfinite(result)
    errors = tuple(Draft202012Validator(authority.result_schema).iter_errors(result))
    if errors:
        raise _fail("result-schema")
    if result.get("profileSha256") != PROFILE_SHA256 or result.get(
        "authorityCommitSha"
    ) == result.get("executionCommitSha"):
        raise _fail("result-authority")
    serialized = json.dumps(result, ensure_ascii=False, separators=(",", ":"))
    if any(text in serialized for text in authority.inputs.values()):
        raise _fail("result-private-content")

    cases = cast(list[object], result["cases"])
    case_ids = tuple(item.get("caseId") if isinstance(item, dict) else None for item in cases)
    if case_ids != EXPECTED_CASE_IDS:
        raise _fail("result-case-order")
    all_pass = result.get("status") == "pass"
    for item in cases:
        if not isinstance(item, dict):
            raise _fail("result-case")
        case_id = cast(str, item["caseId"])
        expected_units = _EXPECTED_PUBLISHED_UNITS[case_id]
        if all_pass and (
            item.get("outcome") != "pass"
            or item.get("publishedAudioUnits") != expected_units
            or item.get("failureCode") is not None
        ):
            raise _fail("result-case-outcome")
        if case_id in SUCCESS_CASE_IDS:
            if all_pass and (
                not isinstance(item.get("deliveredAudioBytes"), int)
                or cast(int, item["deliveredAudioBytes"]) <= 0
                or not isinstance(item.get("mediaDurationSeconds"), (int, float))
                or cast(float, item["mediaDurationSeconds"]) <= 0
                or item.get("commandToFirstTransportFrameMilliseconds") is None
                or item.get("commandToCompleteUnitMilliseconds") is None
                or item.get("nativeFrameHandoffMicroseconds") is None
                or item.get("rtf") is None
            ):
                raise _fail("result-success-metrics")
        elif all_pass and (
            item.get("publishedAudioUnits") != 0 or item.get("deliveredAudioBytes") != 0
        ):
            raise _fail("result-invalidated-audio")
    return result


def nearest_rank_p95(values: tuple[float, ...]) -> float:
    """Return the frozen nearest-rank p95 for one nonempty numeric collection."""

    if not values or any(not math.isfinite(value) or value < 0 for value in values):
        raise _fail("percentile-input")
    ordered = sorted(values)
    rank = max(1, math.ceil(0.95 * len(ordered)))
    return ordered[rank - 1]
