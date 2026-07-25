"""Schema and semantic checks for content-safe TTS feasibility summaries."""

from __future__ import annotations

import copy
import json
import math
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Final, NoReturn, cast

import pytest
from jsonschema import Draft202012Validator
from referencing import Registry, Resource

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
SCHEMA_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "schemas" / "summary-v2.schema.json"
V1_SCHEMA_PATH: Final = (
    REPOSITORY_ROOT / "benchmarks" / "tts" / "schemas" / "summary-v1.schema.json"
)
FIXTURE_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "fixtures" / "summary-v1.valid.json"
ARITHMETIC_TOLERANCE: Final = 0.000001
CANCELLATION_TRIAL_ORDER: Final = (
    "before-dispatch",
    "accepted-before-audio",
    "after-first-audio",
    "after-five-media-seconds",
    "near-hard-mid-generation",
)
PERFORMANCE_ORDER: Final = (
    "es-punctuation-dialogue-short",
    "es-abbreviations-initials-short",
    "es-cardinals-ordinals-short",
    "es-decimals-thousands-short",
    "es-date-time-short",
    "es-currency-percent-short",
    "es-code-span-short",
    "es-combining-sequence-short",
    "es-astral-character-short",
    "es-foreign-name-short",
    "es-narrative-target",
    "es-narrative-near-hard",
)
SUSTAINED_SEQUENCE: Final = (
    "es-narrative-target",
    "es-punctuation-dialogue-short",
    "es-narrative-near-hard",
    "es-date-time-short",
    "es-narrative-target",
    "es-currency-percent-short",
    "es-narrative-near-hard",
    "es-combining-sequence-short",
    "es-narrative-target",
    "es-foreign-name-short",
    "es-narrative-near-hard",
    "es-astral-character-short",
)


def fail(code: str) -> NoReturn:
    raise AssertionError(f"tts-summary-authority:{code}")


def load_json(path: Path) -> object:
    return cast(object, json.loads(path.read_text(encoding="utf-8")))


def read_mapping(value: object, *, code: str = "invalid-object") -> Mapping[str, object]:
    if not isinstance(value, dict):
        fail(code)
    return cast(Mapping[str, object], value)


def read_sequence(value: object, *, code: str = "invalid-array") -> Sequence[object]:
    if not isinstance(value, list):
        fail(code)
    return cast(Sequence[object], value)


def read_number(value: object, *, code: str = "invalid-number") -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        fail(code)
    return float(value)


def read_integer(value: object, *, code: str = "invalid-integer") -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        fail(code)
    return value


def read_string(value: object, *, code: str = "invalid-string") -> str:
    if not isinstance(value, str):
        fail(code)
    return value


def nearest_rank(values: Sequence[float], percentile: float) -> float:
    if not values:
        fail("empty-distribution")
    ordered = sorted(values)
    return ordered[math.ceil(percentile * len(ordered)) - 1]


def validate_distribution(value: object, expected_values: Sequence[float]) -> None:
    distribution = read_mapping(value, code="invalid-distribution")
    count = read_integer(distribution.get("count"), code="invalid-distribution-count")
    p50 = read_number(distribution.get("p50"), code="invalid-distribution-p50")
    p95 = read_number(distribution.get("p95"), code="invalid-distribution-p95")
    maximum = read_number(distribution.get("maximum"), code="invalid-distribution-maximum")
    if not p50 <= p95 <= maximum:
        fail("invalid-percentiles")
    if count != len(expected_values):
        fail("distribution-count")
    expected = (
        nearest_rank(expected_values, 0.50),
        nearest_rank(expected_values, 0.95),
        max(expected_values),
    )
    if any(
        not math.isclose(actual, wanted, abs_tol=ARITHMETIC_TOLERANCE)
        for actual, wanted in zip((p50, p95, maximum), expected, strict=True)
    ):
        fail("distribution-arithmetic")


def validate_optional_distribution(value: object, expected_values: Sequence[float]) -> None:
    if not expected_values:
        if value != "unavailable":
            fail("unexpected-distribution")
        return
    validate_distribution(value, expected_values)


def validate_semantics(summary: Mapping[str, object]) -> None:
    counts = read_mapping(summary.get("counts"), code="invalid-counts")
    loads = tuple(
        read_mapping(value, code="invalid-load")
        for value in read_sequence(summary.get("loadObservations"), code="invalid-loads")
    )
    generations = tuple(
        read_mapping(value, code="invalid-generation")
        for value in read_sequence(
            summary.get("generationObservations"), code="invalid-generations"
        )
    )
    warm = tuple(value for value in generations if value.get("phase") == "warm")
    sustained = tuple(value for value in generations if value.get("phase") == "sustained")

    if read_integer(counts.get("coldLoads")) != len(loads):
        fail("cold-count")
    if read_integer(counts.get("warmGenerations")) != len(warm):
        fail("warm-count")
    if read_integer(counts.get("sustainedGenerations")) != len(sustained):
        fail("sustained-count")
    if tuple(read_string(value.get("caseId")) for value in warm) != PERFORMANCE_ORDER * 2:
        fail("warm-order")
    if len(sustained) < len(SUSTAINED_SEQUENCE) or len(sustained) % len(SUSTAINED_SEQUENCE):
        fail("sustained-order")
    for offset in range(0, len(sustained), len(SUSTAINED_SEQUENCE)):
        round_case_ids = tuple(
            read_string(value.get("caseId"))
            for value in sustained[offset : offset + len(SUSTAINED_SEQUENCE)]
        )
        if round_case_ids != SUSTAINED_SEQUENCE:
            fail("sustained-order")
    if tuple(read_integer(value.get("observationIndex")) for value in loads) != (1, 2, 3, 4, 5):
        fail("load-order")

    for observation in generations:
        sample_count = read_integer(observation.get("sampleCount"))
        sample_rate = read_integer(observation.get("sampleRateHz"))
        duration = read_number(observation.get("generatedDurationSeconds"))
        wall = read_number(observation.get("wallSeconds"))
        rtf = read_number(observation.get("rtf"))
        if not math.isclose(
            duration,
            sample_count / sample_rate,
            abs_tol=ARITHMETIC_TOLERANCE,
        ):
            fail("duration-arithmetic")
        if not math.isclose(rtf, wall / duration, abs_tol=ARITHMETIC_TOLERANCE):
            fail("rtf-arithmetic")

    aggregates = read_mapping(summary.get("aggregates"), code="invalid-aggregates")
    validate_distribution(
        aggregates.get("coldLoadSeconds"),
        [read_number(value.get("loadSeconds")) for value in loads],
    )
    validate_distribution(
        aggregates.get("warmFirstAudioSeconds"),
        [read_number(value.get("firstAudioSeconds")) for value in warm],
    )
    validate_distribution(
        aggregates.get("warmRtf"),
        [read_number(value.get("rtf")) for value in warm],
    )
    validate_distribution(
        aggregates.get("sustainedRtf"),
        [read_number(value.get("rtf")) for value in sustained],
    )
    validate_optional_distribution(
        aggregates.get("warmTimeTo15SecondsMediaSeconds"),
        [
            read_number(value.get("timeTo15SecondsMedia"))
            for value in warm
            if isinstance(value.get("timeTo15SecondsMedia"), (int, float))
        ],
    )
    validate_optional_distribution(
        aggregates.get("warmShorterCompleteSeconds"),
        [
            read_number(value.get("wallSeconds"))
            for value in warm
            if value.get("timeTo15SecondsMedia") == "shorter-complete"
        ],
    )

    sustained_duration = sum(
        read_number(value.get("generatedDurationSeconds")) for value in sustained
    )
    sustained_wall = sum(read_number(value.get("wallSeconds")) for value in sustained)
    if not math.isclose(
        read_number(aggregates.get("sustainedGeneratedDurationSeconds")),
        sustained_duration,
        abs_tol=ARITHMETIC_TOLERANCE,
    ):
        fail("sustained-duration")
    if not math.isclose(
        read_number(aggregates.get("totalSustainedRtf")),
        sustained_wall / sustained_duration,
        abs_tol=ARITHMETIC_TOLERANCE,
    ):
        fail("sustained-rtf")

    cancellation = tuple(
        read_mapping(value, code="invalid-cancellation")
        for value in read_sequence(summary.get("cancellation"), code="invalid-cancellations")
    )
    if tuple(read_string(value.get("trialId")) for value in cancellation) != (
        CANCELLATION_TRIAL_ORDER
    ):
        fail("cancellation-order")
    if read_integer(counts.get("cancellationTrials")) != len(cancellation):
        fail("cancellation-count")
    for trial in cancellation:
        stop_mode = read_string(trial.get("stopMode"))
        stop_seconds = read_number(trial.get("stopSeconds"))
        limit = 0.5 if stop_mode == "cooperative" else 2.0
        if (
            stop_seconds > limit
            or read_number(trial.get("cleanupSeconds")) > 5.0
            or read_integer(trial.get("staleFrames")) != 0
            or trial.get("rawSessionRemoved") is not True
        ):
            fail("cancellation-gate")

    role = read_string(summary.get("role"))
    memory = read_mapping(summary.get("memory"), code="invalid-memory")
    gpu_allocations = read_integer(memory.get("gpuProviderAllocations"))
    if role == "balanced":
        process_peak = read_integer(memory.get("peakProcessVramBytes"))
        framework_peak = read_integer(memory.get("peakFrameworkVramBytes"))
        peak = read_integer(memory.get("peakVramBytes"))
        if (
            memory.get("vramMeasurementMethod") != "wddm-dedicated-plus-pytorch-reserved"
            or read_integer(memory.get("processVramSamplingIntervalMilliseconds")) != 1_000
            or min(process_peak, framework_peak, peak, gpu_allocations) <= 0
            or peak != max(process_peak, framework_peak)
        ):
            fail("balanced-vram")
    elif (
        memory.get("vramMeasurementMethod") != "unavailable-cpu-role"
        or memory.get("processVramSamplingIntervalMilliseconds") != "unavailable"
        or memory.get("peakProcessVramBytes") != "unavailable"
        or memory.get("peakFrameworkVramBytes") != "unavailable"
        or memory.get("peakVramBytes") != "unavailable"
        or gpu_allocations != 0
    ):
        fail("compatibility-gpu-allocation")


def schema_errors(value: object) -> tuple[object, ...]:
    schema = read_mapping(load_json(SCHEMA_PATH), code="invalid-schema")
    v1_schema = read_mapping(load_json(V1_SCHEMA_PATH), code="invalid-schema")
    registry = Registry().with_resource(
        "urn:voxleaf:benchmark:tts-feasibility-summary:v1",
        Resource.from_contents(v1_schema),
    )
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, registry=registry)
    return tuple(validator.iter_errors(value))


def valid_fixture() -> dict[str, object]:
    value = load_json(FIXTURE_PATH)
    if not isinstance(value, dict):
        fail("invalid-fixture")
    fixture = copy.deepcopy(cast(dict[str, object], value))
    fixture["schemaVersion"] = "tts-feasibility-summary-v2"
    fixture["protocolVersion"] = "tts-feasibility-profile-v2"
    fixture["memory"] = {
        "ramSamplingIntervalMilliseconds": 50,
        "processVramSamplingIntervalMilliseconds": "unavailable",
        "vramMeasurementMethod": "unavailable-cpu-role",
        "peakProcessTreeRamBytes": 1_073_741_824,
        "peakProcessVramBytes": "unavailable",
        "peakFrameworkVramBytes": "unavailable",
        "peakVramBytes": "unavailable",
        "gpuProviderAllocations": 0,
    }
    return fixture


def test_fixture_passes_schema_and_semantic_arithmetic() -> None:
    fixture = valid_fixture()
    assert schema_errors(fixture) == ()
    validate_semantics(fixture)


def test_schema_rejects_sensitive_text_unknown_fields_negative_values_and_versions() -> None:
    sensitive = valid_fixture()
    sensitive["narrationText"] = "sensitive"
    assert schema_errors(sensitive)

    unknown = valid_fixture()
    output = cast(dict[str, object], unknown["output"])
    output["futureField"] = 1
    assert schema_errors(unknown)

    negative = valid_fixture()
    generations = cast(list[dict[str, object]], negative["generationObservations"])
    generations[0]["wallSeconds"] = -1
    assert schema_errors(negative)

    unsupported = valid_fixture()
    unsupported["schemaVersion"] = "tts-feasibility-summary-v3"
    assert schema_errors(unsupported)


def test_semantics_reject_inconsistent_duration_rtf_and_percentiles() -> None:
    bad_duration = valid_fixture()
    generations = cast(list[dict[str, object]], bad_duration["generationObservations"])
    generations[0]["generatedDurationSeconds"] = 11
    with pytest.raises(
        AssertionError,
        match=r"^tts-summary-authority:duration-arithmetic$",
    ):
        validate_semantics(bad_duration)

    bad_rtf = valid_fixture()
    generations = cast(list[dict[str, object]], bad_rtf["generationObservations"])
    generations[0]["rtf"] = 0.2
    with pytest.raises(AssertionError, match=r"^tts-summary-authority:rtf-arithmetic$"):
        validate_semantics(bad_rtf)

    bad_percentiles = valid_fixture()
    aggregates = cast(dict[str, object], bad_percentiles["aggregates"])
    distribution = cast(dict[str, object], aggregates["warmRtf"])
    distribution["p50"] = 0.2
    distribution["p95"] = 0.1
    with pytest.raises(
        AssertionError,
        match=r"^tts-summary-authority:invalid-percentiles$",
    ):
        validate_semantics(bad_percentiles)
