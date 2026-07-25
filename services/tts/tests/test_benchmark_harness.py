"""Deterministic candidate-neutral benchmark and privacy tests."""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path
from typing import Final, cast

import pytest

from benchmarks.contracts import (
    ArtifactSummary,
    BenchmarkRunResult,
    GenerationRequest,
    SummaryMetadata,
)
from benchmarks.diagnostics import MAX_DIAGNOSTIC_BYTES, DiagnosticCapture
from benchmarks.fake_adapter import (
    DeterministicFakeAdapter,
    FakeMemoryProbe,
    FakeNanosecondClock,
)
from benchmarks.harness import (
    MAX_INPUT_CODE_POINTS,
    MAX_SAMPLE_FRAMES_PER_REQUEST,
    BenchmarkHarness,
    load_corpus,
)
from benchmarks.metrics import (
    distribution,
    media_duration_seconds,
    nearest_rank,
    real_time_factor,
)
from benchmarks.summary import (
    SummaryValidationError,
    build_summary,
    load_schema,
    promote_summary,
    summary_filename,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v1.json"
SCHEMA_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "schemas" / "summary-v1.schema.json"


def fixture_metadata() -> SummaryMetadata:
    return SummaryMetadata(
        report_purpose="schema-validation-fixture",
        protocol_version="tts-feasibility-profile-v1",
        corpus_version="tts-synthetic-corpus-v1",
        candidate_manifest_version="tts-candidate-manifest-v1",
        role="compatibility",
        commit_sha="0" * 40,
        operating_system="Windows",
        os_version="fixture-1.0",
        architecture="x86_64",
        python_version="3.12.10",
        cpu_model="Synthetic CPU",
        logical_processors=8,
        total_ram_bytes=17_179_869_184,
        gpu_model=None,
        driver_version="unavailable",
        engine_version="fixture-1.0",
        model_revision="fixture-revision",
        voice_id="fixture-voice",
        provider="onnxruntime-cpu",
        precision="float32",
        artifacts=(
            ArtifactSummary(
                artifact_id="fixture-model",
                revision="fixture-revision",
                sha256="0" * 64,
                size_bytes=1_024,
            ),
        ),
        quality={
            "evaluatorCount": 3,
            "blindOrder": True,
            "scale": "1-5",
            "overallMean": 4,
            "dimensions": {
                "intelligibility": 4,
                "spanishPronunciation": 4,
                "punctuationDialogue": 4,
                "numericExpressions": 4,
                "foreignNames": 4,
                "naturalness": 4,
                "artifactFreedom": 4,
            },
            "meaningChangingDefects": 0,
            "limitations": [
                "small-panel",
                "spanish-only",
                "fixed-voices-only",
                "synthetic-corpus-only",
                "not-accessibility-certification",
            ],
        },
        audits={
            "offline": {"status": "pass", "violations": 0},
            "privacy": {"status": "pass", "violations": 0},
            "artifacts": {"status": "pass", "violations": 0},
            "license": {
                "status": "pass",
                "reviewId": "fixture-license-review",
            },
        },
        gate_evaluation={"outcome": "pass", "failedGates": []},
        notes=(
            "vram-unavailable-cpu-role",
            "schema-validation-fixture-only",
        ),
    )


def run_fake_protocol(
    *,
    emit_sensitive_diagnostic: bool = False,
    fail_generation: bool = False,
) -> tuple[
    BenchmarkRunResult,
    FakeNanosecondClock,
    DeterministicFakeAdapter | None,
]:
    corpus = load_corpus(CORPUS_PATH)
    clock = FakeNanosecondClock()
    last_adapter: DeterministicFakeAdapter | None = None

    def factory() -> DeterministicFakeAdapter:
        nonlocal last_adapter
        last_adapter = DeterministicFakeAdapter(
            clock,
            emit_sensitive_diagnostic=emit_sensitive_diagnostic,
            fail_generation=fail_generation,
        )
        return last_adapter

    result = BenchmarkHarness(
        clock=clock,
        memory_probe=FakeMemoryProbe(),
    ).run_protocol(
        adapter_factory=factory,
        corpus=corpus,
        role="compatibility",
    )
    return result, clock, last_adapter


def test_exact_metric_arithmetic_and_nearest_rank_are_stable() -> None:
    assert media_duration_seconds(661_500, 44_100) == 15
    assert real_time_factor(1_500_000_000, 661_500, 44_100) == 0.1
    assert nearest_rank((5.0, 1.0, 3.0, 2.0, 4.0), 0.50) == 3
    assert nearest_rank((5.0, 1.0, 3.0, 2.0, 4.0), 0.95) == 5
    assert distribution((5.0, 1.0, 3.0, 2.0, 4.0)).maximum == 5


def test_fake_runs_complete_frozen_protocol_and_promotes_content_free_summary() -> None:
    result, _, adapter = run_fake_protocol()
    assert result.failure is None
    run = result.run
    assert run is not None
    assert len(run.load_observations) == 5
    assert len(run.generation_observations) == 36
    assert len(run.cancellation_observations) == 5
    assert adapter is not None
    assert adapter.active_request_ids == set()
    assert adapter.closed is True

    corpus = load_corpus(CORPUS_PATH)
    summary = build_summary(run, fixture_metadata())
    forbidden_values = tuple(
        value for case in corpus.cases.values() for value in (case.text, case.privacy_canary)
    )
    payload, markdown = promote_summary(
        summary,
        schema=load_schema(SCHEMA_PATH),
        corpus=corpus,
        forbidden_values=forbidden_values,
    )
    decoded = cast(dict[str, object], json.loads(payload))
    counts = cast(dict[str, object], decoded["counts"])
    aggregates = cast(dict[str, object], decoded["aggregates"])
    assert counts == {
        "cancellationTrials": 5,
        "coldLoads": 5,
        "failedObservations": 0,
        "sustainedGenerations": 12,
        "warmGenerations": 24,
    }
    assert aggregates["sustainedGeneratedDurationSeconds"] == 180
    assert "fixture-candidate-v1" in markdown
    assert all(value.encode() not in payload for value in forbidden_values)
    assert all(value not in markdown for value in forbidden_values)


def test_sensitive_diagnostics_and_raw_exceptions_collapse_to_fixed_failures() -> None:
    sensitive_result, _, sensitive_adapter = run_fake_protocol(emit_sensitive_diagnostic=True)
    assert sensitive_result.run is None
    sensitive_failure = sensitive_result.failure
    assert sensitive_failure is not None
    assert sensitive_failure.code == "privacy"
    assert "¿Vienes" not in repr(sensitive_failure)
    assert sensitive_adapter is not None
    assert sensitive_adapter.active_request_ids == set()

    exception_result, _, exception_adapter = run_fake_protocol(fail_generation=True)
    assert exception_result.run is None
    exception_failure = exception_result.failure
    assert exception_failure is not None
    assert exception_failure.code == "warmup-failed"
    assert "¿Vienes" not in str(exception_failure)
    assert exception_adapter is not None
    assert exception_adapter.active_request_ids == set()

    capture = DiagnosticCapture(forbidden_values=("privacy-canary",))
    with capture:
        print("x" * (MAX_DIAGNOSTIC_BYTES + 1))
        print("privacy-canary", file=sys.stderr)
    observation = capture.observation()
    capture.discard()
    assert observation.bytes_observed > MAX_DIAGNOSTIC_BYTES
    assert observation.truncated is True
    assert observation.sensitive_value_observed is True


def test_unexpected_factory_failure_collapses_to_content_free_crash() -> None:
    corpus = load_corpus(CORPUS_PATH)

    def factory() -> DeterministicFakeAdapter:
        raise RuntimeError(next(iter(corpus.cases.values())).text)

    result = BenchmarkHarness(
        clock=FakeNanosecondClock(),
        memory_probe=FakeMemoryProbe(),
    ).run_protocol(
        adapter_factory=factory,
        corpus=corpus,
        role="compatibility",
    )
    assert result.run is None
    assert result.failure is not None
    assert result.failure.code == "crash"
    assert next(iter(corpus.cases.values())).text not in repr(result.failure)


def test_exact_input_and_output_bounds_fail_closed_without_pending_work() -> None:
    corpus = load_corpus(CORPUS_PATH)
    case = next(iter(corpus.cases.values()))
    forbidden_values = (case.text, case.privacy_canary)

    clock = FakeNanosecondClock()
    exact_adapter = DeterministicFakeAdapter(clock)
    exact_adapter.load()
    harness = BenchmarkHarness(clock=clock, memory_probe=FakeMemoryProbe())
    exact = harness.observe_generation(
        exact_adapter,
        GenerationRequest(
            request_id="exact-input",
            case_id=case.case_id,
            phase="warm",
            text="x" * MAX_INPUT_CODE_POINTS,
        ),
        forbidden_values=forbidden_values,
    )
    assert exact.sample_count > 0

    with pytest.raises(RuntimeError, match=r"^tts-benchmark:invalid-request:max-input$"):
        harness.observe_generation(
            exact_adapter,
            GenerationRequest(
                request_id="max-input",
                case_id=case.case_id,
                phase="warm",
                text="x" * (MAX_INPUT_CODE_POINTS + 1),
            ),
            forbidden_values=forbidden_values,
        )

    oversized_adapter = DeterministicFakeAdapter(
        clock,
        sample_count_override=MAX_SAMPLE_FRAMES_PER_REQUEST + 1,
    )
    oversized_adapter.load()
    with pytest.raises(RuntimeError, match=r"^tts-benchmark:resource-limit:max-output$"):
        harness.observe_generation(
            oversized_adapter,
            GenerationRequest(
                request_id="max-output",
                case_id=case.case_id,
                phase="warm",
                text=case.text,
            ),
            forbidden_values=forbidden_values,
        )
    assert oversized_adapter.active_request_ids == set()
    oversized_adapter.close()
    assert oversized_adapter.active_request_ids == set()


def test_promotion_rejects_unknown_fields_arithmetic_drift_canaries_and_paths() -> None:
    result, _, _ = run_fake_protocol()
    run = result.run
    assert run is not None
    corpus = load_corpus(CORPUS_PATH)
    schema = load_schema(SCHEMA_PATH)
    summary = build_summary(run, fixture_metadata())
    forbidden_values = tuple(
        value for case in corpus.cases.values() for value in (case.text, case.privacy_canary)
    )

    unknown = copy.deepcopy(summary)
    unknown["adapterException"] = "arbitrary"
    with pytest.raises(
        SummaryValidationError,
        match=r"^tts-benchmark-summary:schema$",
    ):
        promote_summary(
            unknown,
            schema=schema,
            corpus=corpus,
            forbidden_values=forbidden_values,
        )

    inconsistent = copy.deepcopy(summary)
    generations = cast(list[dict[str, object]], inconsistent["generationObservations"])
    generations[0]["rtf"] = 99
    with pytest.raises(
        SummaryValidationError,
        match=r"^tts-benchmark-summary:generation-arithmetic$",
    ):
        promote_summary(
            inconsistent,
            schema=schema,
            corpus=corpus,
            forbidden_values=forbidden_values,
        )

    private_path = copy.deepcopy(summary)
    host = cast(dict[str, object], private_path["host"])
    host["cpuModel"] = "C:\\Users\\private"
    with pytest.raises(
        SummaryValidationError,
        match=r"^tts-benchmark-summary:schema$|^tts-benchmark-summary:private-path$",
    ):
        promote_summary(
            private_path,
            schema=schema,
            corpus=corpus,
            forbidden_values=forbidden_values,
        )

    canary = next(iter(corpus.cases.values())).privacy_canary
    with pytest.raises(
        SummaryValidationError,
        match=r"^tts-benchmark-summary:sensitive-value$",
    ):
        summary_filename(canary, forbidden_values=forbidden_values)
