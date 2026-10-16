"""Deterministic candidate-neutral benchmark and privacy tests."""

from __future__ import annotations

import copy
import json
import sys
from dataclasses import replace
from pathlib import Path
from typing import Final, cast

import pytest

from benchmarks import harness, harness_corpus, harness_errors
from benchmarks.contracts import (
    AdapterCapabilities,
    ArtifactSummary,
    BenchmarkCorpus,
    BenchmarkFailure,
    BenchmarkRunResult,
    CorpusCase,
    GenerationObservation,
    GenerationRequest,
    MemoryObservation,
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
    MAX_INPUT_UTF8_BYTES,
    MAX_SAMPLE_FRAMES_PER_REQUEST,
    BenchmarkHarness,
    _fail,
    _HarnessFailure,
    _read_string,
    load_bilingual_corpus,
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
SCHEMA_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "schemas" / "summary-v2.schema.json"
V3_SCHEMA_PATH: Final = (
    REPOSITORY_ROOT / "benchmarks" / "tts" / "schemas" / "summary-v3.schema.json"
)


def _synthetic_corpus(bilingual: bool) -> dict[str, object]:
    case_ids = ("b", "a", "c", "d", "e") if bilingual else ("b", "a")
    return {
        "corpusVersion": "tts-bilingual-corpus-v7" if bilingual else "",
        "cases": [
            {"caseId": name, "language": "es", "text": " \tΩ\r\n", "privacyCanary": ""}
            for name in case_ids
        ],
        "performanceOrder": list(reversed(case_ids)),
        "sustainedSequence": ["a", "b", "a"],
        "qualityOrderByLanguage": {"es": list(reversed(case_ids)), "en": []},
        "unknownField": True,
    }


@pytest.mark.parametrize("bilingual", [False, True])
def test_synthetic_corpus_preserves_insertion_projection_and_sensitive_bytes(
    tmp_path: Path, bilingual: bool
) -> None:
    path = tmp_path / "corpus.json"
    path.write_text(json.dumps(_synthetic_corpus(bilingual)), encoding="utf-8")
    corpus = load_bilingual_corpus(path, "es") if bilingual else load_corpus(path)
    assert tuple(corpus.cases) == (("b", "a", "c", "d", "e") if bilingual else ("b", "a"))
    assert corpus.performance_order == tuple(reversed(tuple(corpus.cases)))
    assert corpus.sustained_sequence == (corpus.performance_order if bilingual else ("a", "b", "a"))
    assert corpus.cases["b"].text.encode() == b" \t\xce\xa9\r\n"
    assert corpus.cases["b"].privacy_canary == ""
    assert corpus.corpus_version == ("tts-bilingual-corpus-v7" if bilingual else "")


def test_legacy_performance_order_admits_repeats_when_length_matches(tmp_path: Path) -> None:
    value = _synthetic_corpus(False)
    value["performanceOrder"] = ["b", "b"]
    path = tmp_path / "corpus.json"
    path.write_text(json.dumps(value), encoding="utf-8")
    assert load_corpus(path).performance_order == ("b", "b")


def test_bilingual_five_entry_order_admits_repeats_and_skips_other_language_fields(
    tmp_path: Path,
) -> None:
    value = _synthetic_corpus(True)
    value["cases"] = cast(list[object], value["cases"])[:2] + [{"language": "en", "text": None}]
    value["qualityOrderByLanguage"] = {"es": ["a", "b", "a", "b", "b"]}
    path = tmp_path / "corpus.json"
    path.write_text(json.dumps(value), encoding="utf-8")
    corpus = load_bilingual_corpus(path, "es")
    assert tuple(corpus.cases) == ("b", "a")
    assert corpus.performance_order == corpus.sustained_sequence == ("a", "b", "a", "b", "b")
    with pytest.raises(_HarnessFailure, match="^tts-benchmark:invalid-request:benchmark$"):
        load_bilingual_corpus(path, "fr")


@pytest.mark.parametrize("bilingual", [False, True])
@pytest.mark.parametrize(
    "defect",
    [
        "shape",
        "cases-shape",
        "case-shape",
        "nonstring",
        "duplicate",
        "missing",
        "length",
        "order-shape",
        "order-nonstring",
        "version",
    ],
)
def test_synthetic_corpus_rejects_malformed_shapes_fields_duplicates_and_references(
    tmp_path: Path, bilingual: bool, defect: str
) -> None:
    value = _synthetic_corpus(bilingual)
    cases = cast(list[object], value["cases"])
    order_key = "qualityOrderByLanguage" if bilingual else "performanceOrder"
    if defect == "cases-shape":
        value["cases"] = None
    elif defect == "case-shape":
        cases.append(None)
    elif defect == "nonstring":
        cast(dict[str, object], cases[0])["text"] = 1
    elif defect == "duplicate":
        cases.append(cases[0])
    elif defect == "order-shape":
        value[order_key] = None
    elif defect == "order-nonstring":
        value[order_key] = {"es": [None] * 5} if bilingual else [None] * 2
    elif defect in {"missing", "length"}:
        order = ["missing"] * len(cases) if defect == "missing" else ["b"]
        value[order_key] = {"es": order} if bilingual else order
    elif defect == "version":
        value["corpusVersion"] = None
    path = tmp_path / "corpus.json"
    path.write_text(json.dumps([] if defect == "shape" else value), encoding="utf-8")
    with pytest.raises(_HarnessFailure, match="^tts-benchmark:invalid-request:benchmark$"):
        if bilingual:
            load_bilingual_corpus(path, "es")
        else:
            load_corpus(path)


@pytest.mark.parametrize("bilingual", [False, True])
@pytest.mark.parametrize(
    "payload,error_type",
    [(None, FileNotFoundError), (b"\xff", UnicodeDecodeError), (b"{", json.JSONDecodeError)],
)
def test_corpus_file_unicode_and_json_errors_propagate_unwrapped(
    tmp_path: Path, bilingual: bool, payload: bytes | None, error_type: type[Exception]
) -> None:
    path = tmp_path / "corpus.json"
    if payload is not None:
        path.write_bytes(payload)
    with pytest.raises(error_type):
        if bilingual:
            load_bilingual_corpus(path, "es")
        else:
            load_corpus(path)


@pytest.mark.parametrize("request_id", [None, "synthetic-request"])
def test_corpus_and_harness_share_failure_identity_fields_and_message(
    request_id: str | None,
) -> None:
    for owner, names in (
        (harness_corpus, ("_read_string", "load_corpus", "load_bilingual_corpus")),
        (harness_errors, ("_HarnessFailure", "_fail")),
    ):
        for name in names:
            assert getattr(harness, name) is getattr(owner, name)
    assert _HarnessFailure.__module__ == "benchmarks.harness"
    assert issubclass(_HarnessFailure, RuntimeError)
    assert _read_string(" \tΩ\r\n") == " \tΩ\r\n"
    assert _read_string("") == ""
    with pytest.raises(_HarnessFailure) as captured:
        if request_id is None:
            _read_string(0)
        else:
            _fail("invalid-request", request_id)
    assert captured.value.code == "invalid-request"
    assert captured.value.request_id == (request_id or "benchmark")
    assert str(captured.value) == f"tts-benchmark:invalid-request:{request_id or 'benchmark'}"


def fixture_metadata() -> SummaryMetadata:
    return SummaryMetadata(
        report_purpose="schema-validation-fixture",
        protocol_version="tts-feasibility-profile-v2",
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


def test_pilot_exercises_one_generation_without_producing_comparable_results() -> None:
    corpus = load_corpus(CORPUS_PATH)
    clock = FakeNanosecondClock()
    adapter: DeterministicFakeAdapter | None = None

    def factory() -> DeterministicFakeAdapter:
        nonlocal adapter
        adapter = DeterministicFakeAdapter(clock)
        return adapter

    failure = BenchmarkHarness(
        clock=clock,
        memory_probe=FakeMemoryProbe(),
    ).run_pilot(
        adapter_factory=factory,
        corpus=corpus,
    )
    assert failure is None
    assert adapter is not None
    assert adapter.closed is True
    assert adapter.active_request_ids == set()


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

    with pytest.raises(RuntimeError, match=r"^tts-benchmark:invalid-request:max-input-bytes$"):
        harness.observe_generation(
            exact_adapter,
            GenerationRequest(
                request_id="max-input-bytes",
                case_id=case.case_id,
                phase="warm",
                text="🦊" * (MAX_INPUT_UTF8_BYTES // 4 + 1),
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


def test_v3_summary_build_and_promotion_keep_only_authority_fingerprints() -> None:
    result, _, _ = run_fake_protocol()
    assert result.run is not None
    candidate_id = "qwen3-tts-1-7b-customvoice-cuda-bf16-v1"
    run = replace(
        result.run,
        candidate_id=candidate_id,
        role="balanced",
        capabilities=AdapterCapabilities(
            candidate_id=candidate_id,
            streaming_granularity="complete-waveform",
            sample_format="float32",
            generation_cancellation="worker-termination",
        ),
        memory=MemoryObservation(
            ram_sampling_interval_milliseconds=50,
            process_vram_sampling_interval_milliseconds=1000,
            vram_measurement_method="wddm-dedicated-plus-pytorch-reserved",
            peak_process_tree_ram_bytes=5_000_000_000,
            peak_process_vram_bytes=4_000_000_000,
            peak_framework_vram_bytes=5_000_000_000,
            peak_vram_bytes=5_000_000_000,
            gpu_provider_allocations=1,
        ),
    )
    authority = {
        "profileSha256": "7d062a4f662ed95b1cb5ff0a21fc40864f4ac3858cea4314ee612b84c2e08dbe",
        "configurationIdentitySha256": (
            "b689b9b81cc7633687e80030ed172878d89196d57149370a82839e1ec83d61df"
        ),
        "candidateLockSha256": ("1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913"),
        "speakerScreenResultSha256": (
            "d55764525a0152e130205b8bb37bc7f7371a5514057928689501897d6e3ac56d"
        ),
        "instructionSha256": ("a34bbe86eb3594cbe6a763778a9c2e1e86710a8047de0a0fdc126703e65527db"),
        "generationSettingsSha256": (
            "1a03c4c5af681d0285200377b2321dd547d92f65c90649d8f36f0c31c25c263e"
        ),
        "batchSize": 1,
        "automaticRetries": 0,
        "modelLifetime": "one-resident-instance-per-session-and-complete-identity",
        "auxiliaryAnalysis": ["whisper-excluded", "vad-or-energy-excluded"],
    }
    metadata = replace(
        fixture_metadata(),
        protocol_version="tts-feasibility-profile-v3",
        candidate_manifest_version="tts-candidate-manifest-v3",
        role="balanced",
        gpu_model="Synthetic GPU",
        driver_version="fixture-driver",
        engine_version="0.1.1",
        model_revision="0c0e3051f131929182e2c023b9537f8b1c68adfe",
        voice_id="Serena",
        provider="pytorch-cuda",
        precision="bfloat16",
        evaluation_authority=authority,
    )
    summary = build_summary(run, metadata)
    private_instruction = "private instruction canary"
    payload, markdown = promote_summary(
        summary,
        schema=load_schema(V3_SCHEMA_PATH),
        corpus=load_corpus(CORPUS_PATH),
        forbidden_values=(private_instruction,),
    )
    assert summary["schemaVersion"] == "tts-feasibility-summary-v3"
    assert b"private instruction canary" not in payload
    assert private_instruction not in markdown
    assert summary_filename(
        run.candidate_id,
        protocol_version=metadata.protocol_version,
    ).endswith(".summary-v3.json")


_CLEANUP_RUNNERS: Final = ("legacy", "baseline", "screen", "full")


def _run_cleanup_scenario(
    runner: str,
    *,
    typed: bool = True,
    fail_at: str = "generation",
    close_fails: bool = False,
    stop_fails: bool = False,
    sink_fails: bool = False,
) -> tuple[BenchmarkRunResult, list[str], list[BenchmarkFailure]]:
    events: list[str] = []
    failures: list[BenchmarkFailure] = []
    failure = (
        _HarnessFailure("generation-failed", "synthetic-request")
        if typed
        else RuntimeError("private-synthetic-detail")
    )
    clock = FakeNanosecondClock()
    cold_count = 1 if runner == "screen" else 5
    adapters: list[DeterministicFakeAdapter] = []

    class Adapter(DeterministicFakeAdapter):
        def close(self) -> None:
            if adapters.index(self) == cold_count:
                events.append("close")
                if close_fails and (fail_at != "final-cleanup" or events.count("close") == 1):
                    raise RuntimeError("synthetic-close-failure")
            super().close()

    class Probe(FakeMemoryProbe):
        def start(self) -> None:
            events.append("start")
            if fail_at == "start":
                raise failure
            super().start()

        def stop(self) -> MemoryObservation:
            events.append("stop")
            if stop_fails and (fail_at != "final-cleanup" or events.count("stop") == 1):
                raise RuntimeError("synthetic-stop-failure")
            return super().stop()

    class Sink(harness._NullObservationSink):
        def record_generation(self, observation: GenerationObservation) -> None:
            del observation
            if fail_at == "generation":
                events.append("generation")
                raise failure

        def record_failure(self, failure: BenchmarkFailure) -> None:
            events.append("failure")
            failures.append(failure)
            if sink_fails:
                raise RuntimeError("synthetic-sink-failure")

    def factory() -> DeterministicFakeAdapter:
        if fail_at == "factory":
            raise failure
        adapter = Adapter(clock, sample_rate_hz=24_000)
        adapters.append(adapter)
        return adapter

    corpora = tuple(
        BenchmarkCorpus(
            corpus_version="tts-bilingual-corpus-v7",
            performance_order=("a", "b", "c", "d", "es-narrative-near-hard"),
            sustained_sequence=("a", "b", "c", "d", "es-narrative-near-hard"),
            cases={
                name: CorpusCase(name, language, "Synthetic narration.", "cleanup-canary")
                for name in ("a", "b", "c", "d", "es-narrative-near-hard")
            },
        )
        for language in ("es", "en")
    )
    probe = Probe()
    benchmark = BenchmarkHarness(clock=clock, memory_probe=probe, observation_sink=Sink())
    if runner == "legacy":
        result = benchmark.run_protocol(
            adapter_factory=factory, corpus=corpora[0], role="compatibility"
        )
    elif runner == "baseline":
        result = benchmark.run_bilingual_baseline_protocol(
            adapter_factory=factory, corpus=corpora[1]
        )
    elif runner == "screen":
        result = benchmark.run_bilingual_screen_protocol(
            adapter_factory=factory, corpora=corpora, role="balanced"
        )
    elif runner == "full":
        result = benchmark.run_bilingual_full_protocol(
            adapter_factory=factory, corpora=corpora, role="balanced"
        )
    else:
        raise AssertionError("unknown synthetic runner")
    if fail_at == "final-cleanup":
        assert adapters[-1].closed is True
        assert probe._active is False
    return result, events, failures


@pytest.mark.parametrize("runner", _CLEANUP_RUNNERS)
@pytest.mark.parametrize("typed", [True, False])
@pytest.mark.parametrize("close_fails", [False, True])
@pytest.mark.parametrize("stop_fails", [False, True])
def test_protocol_failure_cleanup_orders_independent_operations_before_sink(
    runner: str, typed: bool, close_fails: bool, stop_fails: bool
) -> None:
    result, events, failures = _run_cleanup_scenario(
        runner, typed=typed, close_fails=close_fails, stop_fails=stop_fails
    )
    assert result.run is None
    assert result.failure == (
        BenchmarkFailure("generation-failed", "synthetic-request")
        if typed
        else BenchmarkFailure("crash")
    )
    assert events == ["start", "generation", "close", "stop", "failure"]
    assert len(failures) == 1 and failures[0] is result.failure
    assert "private-synthetic-detail" not in repr(result)


@pytest.mark.parametrize("runner", _CLEANUP_RUNNERS)
@pytest.mark.parametrize("typed", [True, False])
@pytest.mark.parametrize("fail_at", ["factory", "start"])
def test_protocol_failure_cleanup_guards_absent_adapter_and_unstarted_memory(
    runner: str, typed: bool, fail_at: str
) -> None:
    result, events, failures = _run_cleanup_scenario(runner, typed=typed, fail_at=fail_at)
    expected = (
        BenchmarkFailure("generation-failed", "synthetic-request")
        if typed
        else BenchmarkFailure("crash")
    )
    if runner == "legacy" and fail_at == "start":
        expected = BenchmarkFailure("measurement-unavailable", "memory")
    assert result.run is None
    assert result.failure == expected
    assert events == (["failure"] if fail_at == "factory" else ["start", "close", "failure"])
    assert len(failures) == 1 and failures[0] is result.failure


@pytest.mark.parametrize("runner", _CLEANUP_RUNNERS)
@pytest.mark.parametrize("operation", ["close", "stop"])
def test_protocol_failure_cleanup_retries_failed_final_cleanup_without_resetting_flags(
    runner: str, operation: str
) -> None:
    result, events, failures = _run_cleanup_scenario(
        runner,
        fail_at="final-cleanup",
        close_fails=operation == "close",
        stop_fails=operation == "stop",
    )
    expected = BenchmarkFailure("cleanup-failed", "measurement-close")
    if operation == "stop":
        expected = (
            BenchmarkFailure("measurement-unavailable", "memory")
            if runner == "legacy"
            else BenchmarkFailure("crash")
        )
    assert result.run is None
    assert result.failure == expected
    assert events == (
        ["start", "close", "close", "stop", "failure"]
        if operation == "close"
        else ["start", "close", "stop", "stop", "failure"]
    )
    assert len(failures) == 1 and failures[0] is result.failure


@pytest.mark.parametrize("runner", _CLEANUP_RUNNERS)
@pytest.mark.parametrize("typed", [True, False])
def test_protocol_failure_sink_errors_remain_unsuppressed(runner: str, typed: bool) -> None:
    with pytest.raises(RuntimeError, match="^synthetic-sink-failure$"):
        _run_cleanup_scenario(runner, typed=typed, sink_fails=True)
