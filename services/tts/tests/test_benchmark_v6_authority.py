"""Model-free authority and adapter tests for the v6 CPU fallback evaluation."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import Final, cast

import pytest
from jsonschema import Draft202012Validator

from benchmarks.adapters.factory import CandidateAdapterFactory
from benchmarks.adapters.manifest import (
    PIPER_CPU_CANDIDATE_ID,
    PROFILE_V6_CONFIGURATION_SHA256,
    PROFILE_V6_SHA256,
    CandidateConfiguration,
    CpuFallbackEvaluationAuthority,
    load_v6_candidate_profile,
)
from benchmarks.adapters.piper import PiperCpuAdapter
from benchmarks.contracts import (
    AdapterCapabilities,
    ArtifactSummary,
    BenchmarkRun,
    CancellationObservation,
    CancellationTrialId,
    GenerationObservation,
    GenerationRequest,
    LoadObservation,
    MemoryObservation,
    SummaryMetadata,
)
from benchmarks.harness import _cancellation_cases, load_corpus
from benchmarks.raw import RawMeasurementJournal
from benchmarks.summary import build_summary, load_schema, promote_summary, schema_registry

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
PROFILE_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "profile-v6.json"
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v6.json"
RAW_SCHEMA_PATH: Final = (
    REPOSITORY_ROOT / "benchmarks" / "tts" / "schemas" / "cpu-fallback-raw-v6.schema.json"
)
SUMMARY_SCHEMA_PATH: Final = (
    REPOSITORY_ROOT / "benchmarks" / "tts" / "schemas" / "cpu-fallback-summary-v6.schema.json"
)
RESULT_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "cpu-fallback-result-v6.json"


def _configuration(root: Path) -> CandidateConfiguration:
    profile = load_v6_candidate_profile(REPOSITORY_ROOT, PIPER_CPU_CANDIDATE_ID)
    return CandidateConfiguration(
        candidate_id=profile.candidate_id,
        artifact_root=root.resolve(),
        model_revision=profile.model_revision,
        voice_id=profile.voice_id,
        provider=profile.provider,
        precision=profile.precision,
        offline=True,
    )


def test_v6_profile_binds_exact_candidate_lock_corpus_and_schemas() -> None:
    profile = load_v6_candidate_profile(REPOSITORY_ROOT, PIPER_CPU_CANDIDATE_ID)
    authority = profile.authority
    assert hashlib.sha256(PROFILE_PATH.read_bytes()).hexdigest() == PROFILE_V6_SHA256
    assert profile.role == "compatibility"
    assert profile.provider == "onnxruntime-cpu"
    assert profile.voice_id == "es_ES-davefx-medium"
    assert profile.output_sample_rate_hz == 22_050
    assert tuple(item.relative_path for item in profile.artifacts) == (
        "es_ES-davefx-medium.onnx",
        "es_ES-davefx-medium.onnx.json",
        "MODEL_CARD",
    )
    assert isinstance(authority, CpuFallbackEvaluationAuthority)
    assert authority.configuration_identity_sha256 == PROFILE_V6_CONFIGURATION_SHA256
    assert authority.corpus_path == "benchmarks/tts/corpus-v6.json"
    assert authority.automatic_retries == 0
    assert authority.maximum_published_chunk_milliseconds == 250

    for path in (RAW_SCHEMA_PATH, SUMMARY_SCHEMA_PATH):
        schema = cast(
            dict[str, object],
            json.loads(path.read_text(encoding="utf-8")),
        )
        Draft202012Validator.check_schema(schema)
        Draft202012Validator(schema, registry=schema_registry())


def test_v6_corpus_declares_exact_sizes_and_orders_each_case_once() -> None:
    corpus = cast(
        dict[str, object],
        json.loads(CORPUS_PATH.read_text(encoding="utf-8")),
    )
    cases = cast(list[dict[str, object]], corpus["cases"])
    by_id = {cast(str, case["caseId"]): case for case in cases}
    assert len(cases) == 8
    assert set(cast(list[str], corpus["performanceOrder"])) == set(by_id)
    assert set(cast(list[str], corpus["sustainedSequence"])) == set(by_id)
    for case in cases:
        text = cast(str, case["text"])
        assert len(text) == case["codePointCount"]
        assert len(text.encode("utf-8")) == case["utf8ByteCount"]


def test_v6_cancellation_cases_are_frozen_and_resolvable() -> None:
    corpus = load_corpus(CORPUS_PATH)
    default_case, near_hard_case = _cancellation_cases(corpus)
    assert default_case.case_id == "es-v6-arrival"
    assert near_hard_case.case_id == "es-v6-date-time"


def test_v6_adapter_forces_cpu_and_publishes_bounded_sample_chunks(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    profile = load_v6_candidate_profile(REPOSITORY_ROOT, PIPER_CPU_CANDIDATE_ID)
    calls: dict[str, object] = {}

    class Samples:
        def __init__(self, size: int) -> None:
            self.size = size

        def __len__(self) -> int:
            return self.size

    class Voice:
        session = SimpleNamespace(get_providers=lambda: ["CPUExecutionProvider"])
        config = SimpleNamespace(sample_rate=22_050, num_speakers=1, espeak_voice="es")

        def synthesize(
            self,
            text: str,
            syn_config: object | None = None,
            include_alignments: bool = False,
        ) -> tuple[object, object]:
            calls["text"] = text
            calls["synthesis"] = syn_config
            calls["alignments"] = include_alignments
            return (
                SimpleNamespace(
                    sample_rate=22_050,
                    sample_width=2,
                    sample_channels=1,
                    audio_float_array=Samples(6_000),
                ),
                SimpleNamespace(
                    sample_rate=22_050,
                    sample_width=2,
                    sample_channels=1,
                    audio_float_array=Samples(4_000),
                ),
            )

    class VoiceFactory:
        @staticmethod
        def load(
            model_path: str | Path,
            config_path: str | Path | None = None,
            use_cuda: bool = False,
            espeak_data_dir: str | Path | None = None,
            download_dir: str | Path | None = None,
        ) -> Voice:
            del espeak_data_dir
            calls["load"] = {
                "modelPath": model_path,
                "configPath": config_path,
                "useCuda": use_cuda,
                "downloadDir": download_dir,
            }
            return Voice()

    onnxruntime = ModuleType("onnxruntime")
    onnxruntime.__dict__["get_device"] = lambda: "CPU"
    onnxruntime.__dict__["get_available_providers"] = lambda: ["CPUExecutionProvider"]
    voice_module = ModuleType("piper.voice")
    voice_module.__dict__["PiperVoice"] = VoiceFactory
    config_module = ModuleType("piper.config")
    config_module.__dict__["SynthesisConfig"] = lambda **kwargs: calls.setdefault(
        "settings",
        kwargs,
    )
    monkeypatch.setattr(
        "benchmarks.adapters.piper.validate_configuration",
        lambda _profile, _configuration: tmp_path.resolve(),
    )
    monkeypatch.setattr(
        "benchmarks.adapters.piper.verify_artifacts",
        lambda _root, _artifacts: None,
    )
    adapter = PiperCpuAdapter(
        profile,
        _configuration(tmp_path),
        importer=lambda name: {
            "onnxruntime": onnxruntime,
            "piper.voice": voice_module,
            "piper.config": config_module,
        }[name],
        version_reader={"piper-tts": "1.4.2", "onnxruntime": "1.27.0"}.__getitem__,
    )
    adapter.load()
    chunks = tuple(
        adapter.generate(
            GenerationRequest(
                request_id="request-1",
                case_id="case-1",
                phase="warm",
                text="Texto sintético.",
            )
        )
    )
    assert adapter.capabilities().streaming_granularity == "sample-chunks"
    assert [item.sample_count for item in chunks] == [5_512, 488, 4_000]
    assert [item.sequence for item in chunks] == [0, 1, 2]
    assert [item.end_of_output for item in chunks] == [False, False, True]
    assert calls["text"] == "Texto sintético."
    assert calls["alignments"] is False
    assert cast(dict[str, object], calls["load"])["useCuda"] is False
    assert calls["settings"] == {
        "speaker_id": None,
        "noise_scale": 0.667,
        "length_scale": 1.0,
        "noise_w_scale": 0.8,
        "normalize_audio": True,
        "volume": 1.0,
    }
    assert adapter.cancel("request-1").acknowledged is False
    adapter.close()


def test_v6_factory_dispatch_and_raw_journal_are_closed(tmp_path: Path) -> None:
    profile = load_v6_candidate_profile(REPOSITORY_ROOT, PIPER_CPU_CANDIDATE_ID)
    adapter = CandidateAdapterFactory(profile, _configuration(tmp_path))()
    assert isinstance(adapter, PiperCpuAdapter)

    authority = profile.authority
    assert isinstance(authority, CpuFallbackEvaluationAuthority)
    journal = RawMeasurementJournal(
        candidate_id=profile.candidate_id,
        role=profile.role,
        commit_sha="a" * 40,
        session_id="b" * 32,
        protocol_version=authority.profile_version,
        configuration_identity_sha256=authority.configuration_identity_sha256,
    )
    target = journal.write(
        tmp_path / "raw",
        status="failed",
        forbidden_values=("private narration",),
    )
    payload = cast(
        dict[str, object],
        json.loads(target.read_text(encoding="utf-8")),
    )
    assert target.name == "performance-v6.raw.json"
    assert payload["rawVersion"] == "tts-cpu-fallback-raw-v6"
    assert payload["protocolVersion"] == "tts-cpu-fallback-profile-v6"
    assert b"private narration" not in target.read_bytes()


def test_v6_content_safe_summary_builds_and_validates() -> None:
    corpus = load_corpus(CORPUS_PATH)
    generation = tuple(
        GenerationObservation(
            case_id=case_id,
            phase="warm",
            sample_count=220_500,
            sample_rate_hz=22_050,
            channels=1,
            sample_format="float32",
            wall_ns=5_000_000_000,
            first_audio_ns=1_000_000_000,
            time_to_fifteen_seconds_ns=None,
        )
        for case_id in corpus.performance_order * 2
    ) + tuple(
        GenerationObservation(
            case_id=case_id,
            phase="sustained",
            sample_count=220_500,
            sample_rate_hz=22_050,
            channels=1,
            sample_format="float32",
            wall_ns=5_000_000_000,
            first_audio_ns=1_000_000_000,
            time_to_fifteen_seconds_ns=None,
        )
        for case_id in corpus.sustained_sequence * 3
    )
    trials = (
        "before-dispatch",
        "accepted-before-audio",
        "after-first-audio",
        "after-five-media-seconds",
        "near-hard-mid-generation",
    )
    run = BenchmarkRun(
        candidate_id=PIPER_CPU_CANDIDATE_ID,
        role="compatibility",
        capabilities=AdapterCapabilities(
            candidate_id=PIPER_CPU_CANDIDATE_ID,
            streaming_granularity="sample-chunks",
            sample_format="float32",
            generation_cancellation="worker-termination",
        ),
        load_observations=tuple(
            LoadObservation(index, 1_000_000_000, 10_000_000) for index in range(1, 6)
        ),
        generation_observations=generation,
        cancellation_observations=tuple(
            CancellationObservation(
                trial_id=cast(CancellationTrialId, trial),
                stop_mode="worker-termination",
                stop_ns=100_000_000,
                cleanup_ns=10_000_000,
                stale_frames=0,
                raw_session_removed=True,
            )
            for trial in trials
        ),
        memory=MemoryObservation(
            ram_sampling_interval_milliseconds=50,
            process_vram_sampling_interval_milliseconds=None,
            vram_measurement_method="unavailable-cpu-role",
            peak_process_tree_ram_bytes=500_000_000,
            peak_process_vram_bytes=None,
            peak_framework_vram_bytes=None,
            peak_vram_bytes=None,
            gpu_provider_allocations=0,
        ),
        failed_observations=0,
    )
    quality_dimensions = {
        "intelligibility": 4.0,
        "spanishPronunciation": 4.0,
        "punctuationDialogue": 4.0,
        "numericExpressions": 4.0,
        "foreignNames": 4.0,
        "naturalness": 4.0,
        "artifactFreedom": 4.0,
    }
    metadata = SummaryMetadata(
        report_purpose="schema-validation-fixture",
        protocol_version="tts-cpu-fallback-profile-v6",
        corpus_version="tts-cpu-fallback-corpus-v6",
        candidate_manifest_version="tts-candidate-manifest-v6",
        role="compatibility",
        commit_sha="b" * 40,
        operating_system="Windows",
        os_version="fixture",
        architecture="x86_64",
        python_version="3.12.10",
        cpu_model="Synthetic CPU",
        logical_processors=8,
        total_ram_bytes=16 * 1024**3,
        gpu_model=None,
        driver_version="unavailable",
        engine_version="1.4.2",
        model_revision="0d907f158acc877ddeebcbf827659ee13bea8bcd",
        voice_id="es_ES-davefx-medium",
        provider="onnxruntime-cpu",
        precision="float32",
        artifacts=tuple(
            ArtifactSummary(name, "fixture", str(index) * 64, 100 + index)
            for index, name in enumerate(
                ("piper-model", "piper-config", "piper-model-card"),
                start=1,
            )
        ),
        quality={
            "evaluatorCount": 1,
            "blindOrder": True,
            "scale": "1-5",
            "overallMean": 4.0,
            "dimensions": quality_dimensions,
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
            "license": {"status": "pass", "reviewId": "piper-gpl3-cc0-v6"},
        },
        gate_evaluation={"outcome": "pass", "failedGates": []},
        notes=("schema-validation-fixture",),
        evaluation_authority={
            "authorityCommitSha": "a" * 40,
            "executionCommitSha": "b" * 40,
            "profileSha256": PROFILE_V6_SHA256,
            "corpusSha256": "c" * 64,
            "candidateLockSha256": "d" * 64,
            "configurationIdentitySha256": PROFILE_V6_CONFIGURATION_SHA256,
        },
    )
    summary = build_summary(run, metadata)
    schema = load_schema(SUMMARY_SCHEMA_PATH)
    errors = tuple(Draft202012Validator(schema, registry=schema_registry()).iter_errors(summary))
    assert errors == (), tuple(error.message for error in errors)
    payload, _markdown = promote_summary(
        summary,
        schema=schema,
        corpus=corpus,
        forbidden_values=(),
    )
    assert b"tts-cpu-fallback-summary-v6" in payload
    assert b"private narration" not in payload


def test_committed_v6_result_is_schema_valid_and_passes_every_gate() -> None:
    result = cast(
        dict[str, object],
        json.loads(RESULT_PATH.read_text(encoding="utf-8")),
    )
    schema = load_schema(SUMMARY_SCHEMA_PATH)
    errors = tuple(Draft202012Validator(schema, registry=schema_registry()).iter_errors(result))
    assert errors == (), tuple(error.message for error in errors)
    assert result["authorityCommitSha"] == "9a2f74845853e84635b419a4e65170c9a2c207ee"
    assert result["executionCommitSha"] == "d9f2929be40e40b2fa85078816ea854fad9a6c69"
    assert result["profileSha256"] == PROFILE_V6_SHA256
    assert result["gateEvaluation"] == {"failedGates": [], "outcome": "pass"}
    quality = cast(dict[str, object], result["quality"])
    assert quality["meaningChangingDefects"] == 0
