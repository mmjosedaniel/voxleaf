"""Allowlisted TTS benchmark summary construction and promotion."""

from __future__ import annotations

import json
import math
import re
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Final, NoReturn, cast

from jsonschema import Draft202012Validator

from benchmarks.contracts import BenchmarkCorpus, BenchmarkRun, SummaryMetadata
from benchmarks.metrics import (
    distribution,
    media_duration_seconds,
    nanoseconds_to_seconds,
    real_time_factor,
)

SUMMARY_VERSION: Final = "tts-feasibility-summary-v1"
MAX_SUMMARY_BYTES: Final = 1_048_576
ARITHMETIC_TOLERANCE: Final = 0.000001
_ABSOLUTE_WINDOWS_PATH = re.compile(rb"[A-Za-z]:[\\/]")
_PRIVATE_PATH_MARKERS: Final = (
    b"\\\\Users\\\\",
    b"/Users/",
    b"/home/",
)


class SummaryValidationError(ValueError):
    """Content-free summary rejection."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-summary:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise SummaryValidationError(code)


def _distribution_dict(values: Sequence[float]) -> dict[str, object]:
    result = distribution(values)
    return {
        "count": result.count,
        "p50": result.p50,
        "p95": result.p95,
        "maximum": result.maximum,
    }


def _optional_distribution(values: Sequence[float]) -> dict[str, object] | str:
    return _distribution_dict(values) if values else "unavailable"


def _read_mapping(value: object, code: str) -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail(code)
    return cast(Mapping[str, object], value)


def _read_sequence(value: object, code: str) -> Sequence[object]:
    if not isinstance(value, list):
        _fail(code)
    return cast(Sequence[object], value)


def _read_number(value: object, code: str) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        _fail(code)
    return float(value)


def _read_integer(value: object, code: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        _fail(code)
    return value


def _read_string(value: object, code: str) -> str:
    if not isinstance(value, str):
        _fail(code)
    return value


def _quality_allowlist(value: Mapping[str, object]) -> dict[str, object]:
    dimensions = _read_mapping(value.get("dimensions"), "invalid-quality")
    return {
        "evaluatorCount": _read_integer(value.get("evaluatorCount"), "invalid-quality"),
        "blindOrder": value.get("blindOrder"),
        "scale": _read_string(value.get("scale"), "invalid-quality"),
        "overallMean": _read_number(value.get("overallMean"), "invalid-quality"),
        "dimensions": {
            "intelligibility": _read_number(dimensions.get("intelligibility"), "invalid-quality"),
            "spanishPronunciation": _read_number(
                dimensions.get("spanishPronunciation"), "invalid-quality"
            ),
            "punctuationDialogue": _read_number(
                dimensions.get("punctuationDialogue"), "invalid-quality"
            ),
            "numericExpressions": _read_number(
                dimensions.get("numericExpressions"), "invalid-quality"
            ),
            "foreignNames": _read_number(dimensions.get("foreignNames"), "invalid-quality"),
            "naturalness": _read_number(dimensions.get("naturalness"), "invalid-quality"),
            "artifactFreedom": _read_number(dimensions.get("artifactFreedom"), "invalid-quality"),
        },
        "meaningChangingDefects": _read_integer(
            value.get("meaningChangingDefects"), "invalid-quality"
        ),
        "limitations": [
            _read_string(item, "invalid-quality")
            for item in _read_sequence(value.get("limitations"), "invalid-quality")
        ],
    }


def _audit_allowlist(value: Mapping[str, object]) -> dict[str, object]:
    offline = _read_mapping(value.get("offline"), "invalid-audit")
    privacy = _read_mapping(value.get("privacy"), "invalid-audit")
    artifacts = _read_mapping(value.get("artifacts"), "invalid-audit")
    license_audit = _read_mapping(value.get("license"), "invalid-audit")
    return {
        "offline": {
            "status": _read_string(offline.get("status"), "invalid-audit"),
            "violations": _read_integer(offline.get("violations"), "invalid-audit"),
        },
        "privacy": {
            "status": _read_string(privacy.get("status"), "invalid-audit"),
            "violations": _read_integer(privacy.get("violations"), "invalid-audit"),
        },
        "artifacts": {
            "status": _read_string(artifacts.get("status"), "invalid-audit"),
            "violations": _read_integer(artifacts.get("violations"), "invalid-audit"),
        },
        "license": {
            "status": _read_string(license_audit.get("status"), "invalid-audit"),
            "reviewId": _read_string(license_audit.get("reviewId"), "invalid-audit"),
        },
    }


def _gate_allowlist(value: Mapping[str, object]) -> dict[str, object]:
    return {
        "outcome": _read_string(value.get("outcome"), "invalid-gate"),
        "failedGates": [
            _read_string(item, "invalid-gate")
            for item in _read_sequence(value.get("failedGates"), "invalid-gate")
        ],
    }


def build_summary(run: BenchmarkRun, metadata: SummaryMetadata) -> dict[str, object]:
    """Construct the schema shape explicitly; adapter dictionaries are never merged."""

    if run.role != metadata.role or run.candidate_id != run.capabilities.candidate_id:
        _fail("metadata-mismatch")
    output_shapes = {
        (
            item.sample_rate_hz,
            item.channels,
            item.sample_format,
        )
        for item in run.generation_observations
    }
    if len(output_shapes) != 1:
        _fail("output-shape")
    sample_rate_hz, channels, sample_format = next(iter(output_shapes))

    generation_values: list[dict[str, object]] = []
    for item in run.generation_observations:
        duration_seconds = media_duration_seconds(item.sample_count, item.sample_rate_hz)
        wall_seconds = nanoseconds_to_seconds(item.wall_ns)
        if item.time_to_fifteen_seconds_ns is None:
            if duration_seconds >= 15:
                _fail("missing-fifteen-second-time")
            fifteen_seconds_value: float | str = "shorter-complete"
        else:
            if duration_seconds < 15:
                _fail("unexpected-fifteen-second-time")
            fifteen_seconds_value = nanoseconds_to_seconds(item.time_to_fifteen_seconds_ns)
        generation_values.append(
            {
                "caseId": item.case_id,
                "phase": item.phase,
                "sampleCount": item.sample_count,
                "sampleRateHz": item.sample_rate_hz,
                "generatedDurationSeconds": duration_seconds,
                "wallSeconds": wall_seconds,
                "firstAudioSeconds": nanoseconds_to_seconds(item.first_audio_ns),
                "timeTo15SecondsMedia": fifteen_seconds_value,
                "rtf": real_time_factor(
                    item.wall_ns,
                    item.sample_count,
                    item.sample_rate_hz,
                ),
            }
        )

    warm = [value for value in generation_values if value["phase"] == "warm"]
    sustained = [value for value in generation_values if value["phase"] == "sustained"]
    warm_fifteen = [
        cast(float, value["timeTo15SecondsMedia"])
        for value in warm
        if isinstance(value["timeTo15SecondsMedia"], (int, float))
    ]
    warm_shorter = [
        cast(float, value["wallSeconds"])
        for value in warm
        if value["timeTo15SecondsMedia"] == "shorter-complete"
    ]
    sustained_duration = sum(cast(float, value["generatedDurationSeconds"]) for value in sustained)
    sustained_wall = sum(cast(float, value["wallSeconds"]) for value in sustained)
    if sustained_duration <= 0:
        _fail("empty-sustained")

    notes = [_read_string(note, "invalid-note") for note in metadata.notes]
    return {
        "schemaVersion": SUMMARY_VERSION,
        "protocolVersion": metadata.protocol_version,
        "corpusVersion": metadata.corpus_version,
        "candidateManifestVersion": metadata.candidate_manifest_version,
        "reportPurpose": metadata.report_purpose,
        "candidateId": run.candidate_id,
        "role": run.role,
        "source": {
            "commitSha": metadata.commit_sha,
            "treeState": "clean",
        },
        "host": {
            "operatingSystem": metadata.operating_system,
            "osVersion": metadata.os_version,
            "architecture": metadata.architecture,
            "pythonVersion": metadata.python_version,
            "cpuModel": metadata.cpu_model,
            "logicalProcessors": metadata.logical_processors,
            "totalRamBytes": metadata.total_ram_bytes,
            "gpuModel": metadata.gpu_model,
            "driverVersion": metadata.driver_version,
        },
        "runtime": {
            "engineVersion": metadata.engine_version,
            "modelRevision": metadata.model_revision,
            "voiceId": metadata.voice_id,
            "provider": metadata.provider,
            "precision": metadata.precision,
            "offlineMode": True,
            "streamingGranularity": run.capabilities.streaming_granularity,
        },
        "artifacts": [
            {
                "artifactId": artifact.artifact_id,
                "revision": artifact.revision,
                "sha256": artifact.sha256,
                "sizeBytes": artifact.size_bytes,
            }
            for artifact in metadata.artifacts
        ],
        "output": {
            "sampleRateHz": sample_rate_hz,
            "channels": channels,
            "sampleFormat": sample_format,
        },
        "counts": {
            "coldLoads": len(run.load_observations),
            "warmGenerations": len(warm),
            "sustainedGenerations": len(sustained),
            "cancellationTrials": len(run.cancellation_observations),
            "failedObservations": run.failed_observations,
        },
        "loadObservations": [
            {
                "observationIndex": item.observation_index,
                "loadSeconds": nanoseconds_to_seconds(item.load_ns),
                "cleanupSeconds": nanoseconds_to_seconds(item.cleanup_ns),
            }
            for item in run.load_observations
        ],
        "generationObservations": generation_values,
        "aggregates": {
            "coldLoadSeconds": _distribution_dict(
                [nanoseconds_to_seconds(item.load_ns) for item in run.load_observations]
            ),
            "warmFirstAudioSeconds": _distribution_dict(
                [cast(float, value["firstAudioSeconds"]) for value in warm]
            ),
            "warmTimeTo15SecondsMediaSeconds": _optional_distribution(warm_fifteen),
            "warmShorterCompleteSeconds": _optional_distribution(warm_shorter),
            "warmRtf": _distribution_dict([cast(float, value["rtf"]) for value in warm]),
            "sustainedRtf": _distribution_dict([cast(float, value["rtf"]) for value in sustained]),
            "totalSustainedRtf": sustained_wall / sustained_duration,
            "sustainedGeneratedDurationSeconds": sustained_duration,
        },
        "memory": {
            "samplingIntervalMilliseconds": run.memory.sampling_interval_milliseconds,
            "peakProcessTreeRamBytes": run.memory.peak_process_tree_ram_bytes,
            "peakVramBytes": (
                run.memory.peak_vram_bytes
                if run.memory.peak_vram_bytes is not None
                else "unavailable"
            ),
            "gpuProviderAllocations": run.memory.gpu_provider_allocations,
        },
        "cancellation": [
            {
                "trialId": item.trial_id,
                "stopMode": item.stop_mode,
                "stopSeconds": nanoseconds_to_seconds(item.stop_ns),
                "cleanupSeconds": nanoseconds_to_seconds(item.cleanup_ns),
                "staleFrames": item.stale_frames,
                "rawSessionRemoved": item.raw_session_removed,
            }
            for item in run.cancellation_observations
        ],
        "quality": _quality_allowlist(metadata.quality),
        "audits": _audit_allowlist(metadata.audits),
        "gateEvaluation": _gate_allowlist(metadata.gate_evaluation),
        "notes": notes,
    }


def _validate_distribution(value: object, expected_values: Sequence[float]) -> None:
    current = _read_mapping(value, "invalid-distribution")
    if _read_integer(current.get("count"), "invalid-distribution") != len(expected_values):
        _fail("distribution-count")
    expected = distribution(expected_values)
    actual = (
        _read_number(current.get("p50"), "invalid-distribution"),
        _read_number(current.get("p95"), "invalid-distribution"),
        _read_number(current.get("maximum"), "invalid-distribution"),
    )
    if any(
        not math.isclose(left, right, abs_tol=ARITHMETIC_TOLERANCE)
        for left, right in zip(
            actual,
            (expected.p50, expected.p95, expected.maximum),
            strict=True,
        )
    ):
        _fail("distribution-arithmetic")


def _validate_optional_distribution(value: object, expected_values: Sequence[float]) -> None:
    if not expected_values:
        if value != "unavailable":
            _fail("unexpected-distribution")
        return
    _validate_distribution(value, expected_values)


def validate_summary_semantics(
    summary: Mapping[str, object],
    corpus: BenchmarkCorpus,
) -> None:
    """Recompute all timing/order/count arithmetic before promotion."""

    counts = _read_mapping(summary.get("counts"), "invalid-counts")
    loads = [
        _read_mapping(item, "invalid-load")
        for item in _read_sequence(summary.get("loadObservations"), "invalid-loads")
    ]
    generations = [
        _read_mapping(item, "invalid-generation")
        for item in _read_sequence(summary.get("generationObservations"), "invalid-generations")
    ]
    warm = [item for item in generations if item.get("phase") == "warm"]
    sustained = [item for item in generations if item.get("phase") == "sustained"]
    if (
        _read_integer(counts.get("coldLoads"), "invalid-counts") != len(loads)
        or _read_integer(counts.get("warmGenerations"), "invalid-counts") != len(warm)
        or _read_integer(counts.get("sustainedGenerations"), "invalid-counts") != len(sustained)
    ):
        _fail("observation-count")
    if tuple(_read_string(item.get("caseId"), "invalid-generation") for item in warm) != (
        corpus.performance_order * 2
    ):
        _fail("warm-order")
    if (
        len(sustained) < len(corpus.sustained_sequence)
        or len(sustained) % len(corpus.sustained_sequence) != 0
    ):
        _fail("sustained-order")
    for offset in range(0, len(sustained), len(corpus.sustained_sequence)):
        if (
            tuple(
                _read_string(item.get("caseId"), "invalid-generation")
                for item in sustained[offset : offset + len(corpus.sustained_sequence)]
            )
            != corpus.sustained_sequence
        ):
            _fail("sustained-order")

    for item in generations:
        samples = _read_integer(item.get("sampleCount"), "invalid-generation")
        rate = _read_integer(item.get("sampleRateHz"), "invalid-generation")
        duration = _read_number(item.get("generatedDurationSeconds"), "invalid-generation")
        wall = _read_number(item.get("wallSeconds"), "invalid-generation")
        rtf = _read_number(item.get("rtf"), "invalid-generation")
        if not math.isclose(
            duration,
            samples / rate,
            abs_tol=ARITHMETIC_TOLERANCE,
        ) or not math.isclose(rtf, wall / duration, abs_tol=ARITHMETIC_TOLERANCE):
            _fail("generation-arithmetic")

    aggregates = _read_mapping(summary.get("aggregates"), "invalid-aggregates")
    _validate_distribution(
        aggregates.get("coldLoadSeconds"),
        [_read_number(item.get("loadSeconds"), "invalid-load") for item in loads],
    )
    _validate_distribution(
        aggregates.get("warmFirstAudioSeconds"),
        [_read_number(item.get("firstAudioSeconds"), "invalid-generation") for item in warm],
    )
    _validate_distribution(
        aggregates.get("warmRtf"),
        [_read_number(item.get("rtf"), "invalid-generation") for item in warm],
    )
    _validate_distribution(
        aggregates.get("sustainedRtf"),
        [_read_number(item.get("rtf"), "invalid-generation") for item in sustained],
    )
    _validate_optional_distribution(
        aggregates.get("warmTimeTo15SecondsMediaSeconds"),
        [
            _read_number(item.get("timeTo15SecondsMedia"), "invalid-generation")
            for item in warm
            if isinstance(item.get("timeTo15SecondsMedia"), (int, float))
        ],
    )
    _validate_optional_distribution(
        aggregates.get("warmShorterCompleteSeconds"),
        [
            _read_number(item.get("wallSeconds"), "invalid-generation")
            for item in warm
            if item.get("timeTo15SecondsMedia") == "shorter-complete"
        ],
    )
    sustained_duration = sum(
        _read_number(item.get("generatedDurationSeconds"), "invalid-generation")
        for item in sustained
    )
    sustained_wall = sum(
        _read_number(item.get("wallSeconds"), "invalid-generation") for item in sustained
    )
    if not math.isclose(
        _read_number(
            aggregates.get("sustainedGeneratedDurationSeconds"),
            "invalid-aggregates",
        ),
        sustained_duration,
        abs_tol=ARITHMETIC_TOLERANCE,
    ) or not math.isclose(
        _read_number(aggregates.get("totalSustainedRtf"), "invalid-aggregates"),
        sustained_wall / sustained_duration,
        abs_tol=ARITHMETIC_TOLERANCE,
    ):
        _fail("sustained-arithmetic")

    cancellations = [
        _read_mapping(item, "invalid-cancellation")
        for item in _read_sequence(summary.get("cancellation"), "invalid-cancellations")
    ]
    expected_trials = (
        "before-dispatch",
        "accepted-before-audio",
        "after-first-audio",
        "after-five-media-seconds",
        "near-hard-mid-generation",
    )
    if (
        tuple(_read_string(item.get("trialId"), "invalid-cancellation") for item in cancellations)
        != expected_trials
    ):
        _fail("cancellation-order")
    if _read_integer(counts.get("cancellationTrials"), "invalid-counts") != len(cancellations):
        _fail("cancellation-count")
    for item in cancellations:
        mode = _read_string(item.get("stopMode"), "invalid-cancellation")
        limit = 0.5 if mode == "cooperative" else 2.0
        if (
            _read_number(item.get("stopSeconds"), "invalid-cancellation") > limit
            or _read_number(item.get("cleanupSeconds"), "invalid-cancellation") > 5
            or _read_integer(item.get("staleFrames"), "invalid-cancellation") != 0
            or item.get("rawSessionRemoved") is not True
        ):
            _fail("cancellation-gate")

    role = _read_string(summary.get("role"), "invalid-role")
    memory = _read_mapping(summary.get("memory"), "invalid-memory")
    if role == "balanced" and memory.get("peakVramBytes") == "unavailable":
        _fail("balanced-vram")
    if (
        role == "compatibility"
        and _read_integer(memory.get("gpuProviderAllocations"), "invalid-memory") != 0
    ):
        _fail("compatibility-gpu")


def canonical_summary_bytes(summary: Mapping[str, object]) -> bytes:
    return (json.dumps(summary, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode(
        "utf-8"
    )


def render_summary_markdown(summary: Mapping[str, object]) -> str:
    """Render only stable IDs and content-free aggregate values."""

    aggregates = _read_mapping(summary.get("aggregates"), "invalid-aggregates")
    counts = _read_mapping(summary.get("counts"), "invalid-counts")
    gate = _read_mapping(summary.get("gateEvaluation"), "invalid-gate")
    candidate_id = _read_string(summary.get("candidateId"), "invalid-candidate")
    role = _read_string(summary.get("role"), "invalid-role")
    outcome = _read_string(gate.get("outcome"), "invalid-gate")
    cold_count = _read_integer(counts.get("coldLoads"), "invalid-counts")
    warm_count = _read_integer(counts.get("warmGenerations"), "invalid-counts")
    sustained_count = _read_integer(counts.get("sustainedGenerations"), "invalid-counts")
    sustained_seconds = _read_number(
        aggregates.get("sustainedGeneratedDurationSeconds"),
        "invalid-aggregates",
    )
    sustained_rtf = _read_number(aggregates.get("totalSustainedRtf"), "invalid-aggregates")
    return "\n".join(
        (
            "# Local TTS feasibility summary",
            "",
            f"- Candidate: `{candidate_id}`",
            f"- Role: `{role}`",
            f"- Outcome: `{outcome}`",
            f"- Cold observations: {cold_count}",
            f"- Warm observations: {warm_count}",
            f"- Sustained observations: {sustained_count}",
            f"- Sustained media seconds: {sustained_seconds:.6f}",
            f"- Total sustained RTF: {sustained_rtf:.6f}",
            "",
        )
    )


def summary_filename(candidate_id: str, *, forbidden_values: Sequence[str] = ()) -> str:
    if re.fullmatch(r"[a-z0-9][a-z0-9._:-]{0,127}", candidate_id) is None:
        _fail("invalid-candidate-id")
    if any(value and value in candidate_id for value in forbidden_values):
        _fail("sensitive-value")
    return f"{candidate_id}.summary-v1.json"


def promote_summary(
    summary: Mapping[str, object],
    *,
    schema: Mapping[str, object],
    corpus: BenchmarkCorpus,
    forbidden_values: Sequence[str],
) -> tuple[bytes, str]:
    """Validate and return canonical JSON/Markdown; no file write occurs here."""

    Draft202012Validator.check_schema(schema)
    errors = tuple(Draft202012Validator(schema).iter_errors(summary))
    if errors:
        _fail("schema")
    validate_summary_semantics(summary, corpus)
    payload = canonical_summary_bytes(summary)
    markdown = render_summary_markdown(summary)
    markdown_bytes = markdown.encode("utf-8")
    if len(payload) > MAX_SUMMARY_BYTES:
        _fail("summary-size")
    if _ABSOLUTE_WINDOWS_PATH.search(payload) is not None or any(
        marker in payload for marker in _PRIVATE_PATH_MARKERS
    ):
        _fail("private-path")
    for forbidden in forbidden_values:
        if not forbidden:
            continue
        encoded = forbidden.encode("utf-8")
        if encoded in payload or encoded in markdown_bytes:
            _fail("sensitive-value")
    return payload, markdown


def load_schema(path: Path) -> Mapping[str, object]:
    value = cast(object, json.loads(path.read_text(encoding="utf-8")))
    return _read_mapping(value, "invalid-schema")
