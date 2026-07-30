"""Model-free coverage for the frozen v8 control/screen path."""

from __future__ import annotations

from pathlib import Path
from typing import Final

from benchmarks.adapters.qwen_v8 import (
    QwenV8Configuration,
    load_qwen_v8_profile,
)
from benchmarks.bilingual_screen import ScreenPreflightReceipt, _machine_failures
from benchmarks.bilingual_screen_result import (
    build_preflight_rejection_summary,
    build_rejected_summary,
)
from benchmarks.contracts import (
    AdapterCapabilities,
    BenchmarkRun,
    CancellationObservation,
    GenerationObservation,
    LoadObservation,
    MemoryObservation,
)
from benchmarks.fake_adapter import (
    DeterministicFakeAdapter,
    FakeMemoryProbe,
    FakeNanosecondClock,
)
from benchmarks.harness import BenchmarkHarness, load_bilingual_corpus
from benchmarks.preflight import HostSnapshot
from benchmarks.v7_authority import ADMITTED_CANDIDATE_IDS as V7_CANDIDATE_IDS
from benchmarks.v8_authority import (
    QWEN_AIDEN_CANDIDATE_ID,
    QWEN_SERENA_CANDIDATE_ID,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v7.json"


def test_exact_qwen_v8_identities_are_loaded_independently() -> None:
    serena = load_qwen_v8_profile(REPOSITORY_ROOT, QWEN_SERENA_CANDIDATE_ID)
    aiden = load_qwen_v8_profile(REPOSITORY_ROOT, QWEN_AIDEN_CANDIDATE_ID)

    assert (serena.speaker, serena.language, serena.language_argument) == (
        "Serena",
        "es",
        "Spanish",
    )
    assert (aiden.speaker, aiden.language, aiden.language_argument) == (
        "Aiden",
        "en",
        "English",
    )
    assert serena.artifacts == aiden.artifacts
    assert serena.instruction != aiden.instruction


def test_screen_protocol_is_one_cold_one_warm_per_case_and_four_cancels_per_language() -> None:
    corpora = (
        load_bilingual_corpus(CORPUS_PATH, "es"),
        load_bilingual_corpus(CORPUS_PATH, "en"),
    )
    clock = FakeNanosecondClock()

    def factory() -> DeterministicFakeAdapter:
        return DeterministicFakeAdapter(clock, sample_rate_hz=24_000)

    result = BenchmarkHarness(
        clock=clock,
        memory_probe=FakeMemoryProbe(),
    ).run_bilingual_screen_protocol(
        adapter_factory=factory,
        corpora=corpora,
        role="balanced",
    )

    assert result.failure is None
    assert result.run is not None
    assert len(result.run.load_observations) == 1
    assert len(result.run.generation_observations) == 10
    assert len(result.run.cancellation_observations) == 8
    assert {
        (value.sample_rate_hz, value.channels, value.sample_format)
        for value in result.run.generation_observations
    } == {(24_000, 1, "float32")}


def _rejected_raw() -> dict[str, object]:
    attempts = [
        {
            "caseId": f"es-v7-{index}",
            "language": "es",
            "phase": "warm",
            "attempt": 1,
            "sampleCount": 240_000,
            "sampleRateHz": 24_000,
            "channels": 1,
            "wallNanoseconds": 2_000_000_000,
            "firstAudioNanoseconds": 2_000_000_000,
            "status": "complete",
        }
        for index in range(5)
    ]
    return {
        "schemaVersion": "tts-bilingual-raw-v8",
        "candidateId": QWEN_SERENA_CANDIDATE_ID,
        "evaluationStage": "existing-engine-control",
        "authorityCommitSha": "b66fafa743b84e8a995705ec3bbdf8fed6a9a04e",
        "executionCommitSha": "1" * 40,
        "profileSha256": "84448e70e8b8b2782f22c0e3d874b1b30531084732e0416ab9e83e1ad1e7525a",
        "corpusSha256": "cc140a35688dc0dff7e8c50a5355e920bd2847aa9deac2f7e6256160fb9afcfe",
        "candidateManifestSha256": (
            "5245f6949cf035eee8de98fef21e8eea89d30b468d76039949e2100558401b0e"
        ),
        "dependencyLockSha256": (
            "1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913"
        ),
        "status": "rejected",
        "languagesEvaluated": ["es"],
        "attempts": attempts,
        "cancellationTrials": [
            {
                "trialId": name,
                "language": "es",
                "passed": True,
                "stopNanoseconds": 1,
                "cleanupNanoseconds": 0,
                "staleUnits": 0,
                "processesRemaining": 0,
            }
            for name in ("before-dispatch", "accepted-before-audio")
        ],
        "memory": {
            "peakProcessTreeRamBytes": 2_000_000_000,
            "peakDedicatedVramBytes": 6_000_000_000,
            "minimumAvailableSystemRamBytes": 8_000_000_000,
        },
        "audits": {
            "artifacts": True,
            "offline": True,
            "networkIsolation": True,
            "privacy": True,
            "boundedRetention": True,
            "cleanup": True,
            "firstAttemptsOnly": True,
        },
        "failures": [{"code": "cancellation", "caseId": None}],
    }


def test_machine_rejection_keeps_quality_not_admitted_and_content_safe() -> None:
    summary = build_rejected_summary(_rejected_raw())

    assert summary["status"] == "rejected"
    assert summary["qualityByLanguage"] == [{"language": "es", "status": "not-admitted"}]
    assert summary["gates"] == {
        "machine": "pass",
        "performance": "pass",
        "memory": "pass",
        "cancellation": "fail",
        "quality": "not-admitted",
        "privacy": "pass",
        "cleanup": "pass",
        "overall": "fail",
    }


def test_cancellation_failure_does_not_relabel_completed_generations() -> None:
    profile = load_qwen_v8_profile(REPOSITORY_ROOT, QWEN_SERENA_CANDIDATE_ID)
    receipt = ScreenPreflightReceipt(
        expected_commit_sha="1" * 40,
        candidate_id=profile.candidate_id,
        candidate_python=Path("candidate-python"),
        profile=profile,
        configuration=QwenV8Configuration(Path("model")),
        languages=("es",),
        stage="existing-engine-control",
        role="balanced",
        host=HostSnapshot(
            operating_system="Windows",
            os_version="test",
            architecture="x86_64",
            python_version="3.12.10",
            cpu_model="test",
            logical_processors=8,
            total_ram_bytes=32 * 1024**3,
            free_ram_bytes=16 * 1024**3,
            free_disk_bytes=64 * 1024**3,
            power_online=True,
            power_mode="test",
            gpu_model="test",
            driver_version="test",
            total_vram_bytes=8 * 1024**3,
            free_vram_bytes=7 * 1024**3,
            process_vram_available=True,
        ),
        network_isolation=True,
        failures=(),
    )
    run = BenchmarkRun(
        candidate_id=profile.candidate_id,
        role="balanced",
        capabilities=AdapterCapabilities(
            candidate_id=profile.candidate_id,
            streaming_granularity="complete-waveform",
            sample_format="float32",
            generation_cancellation="worker-termination",
        ),
        load_observations=(LoadObservation(observation_index=1, load_ns=1, cleanup_ns=1),),
        generation_observations=tuple(
            GenerationObservation(
                case_id=f"es-v7-{index}",
                phase="warm",
                sample_count=240_000,
                sample_rate_hz=24_000,
                channels=1,
                sample_format="float32",
                wall_ns=1_000_000_000,
                first_audio_ns=1_000_000_000,
                time_to_fifteen_seconds_ns=None,
            )
            for index in range(5)
        ),
        cancellation_observations=tuple(
            CancellationObservation(
                trial_id=trial,
                stop_mode="worker-termination",
                stop_ns=1,
                cleanup_ns=0,
                stale_frames=0,
                raw_session_removed=True,
            )
            for trial in ("before-dispatch", "accepted-before-audio")
        ),
        memory=MemoryObservation(
            ram_sampling_interval_milliseconds=50,
            process_vram_sampling_interval_milliseconds=1_000,
            vram_measurement_method="wddm-dedicated-plus-pytorch-reserved",
            peak_process_tree_ram_bytes=1,
            peak_process_vram_bytes=1,
            peak_framework_vram_bytes=1,
            peak_vram_bytes=1,
            gpu_provider_allocations=1,
        ),
        failed_observations=1,
    )

    failures = _machine_failures(
        receipt,
        run,
        minimum_available_ram_bytes=8 * 1024**3,
        failure_code="cancellation-failed",
    )

    assert "cancellation" in failures
    assert "first-attempt-failure" not in failures


def test_preflight_model_api_rejection_records_no_fabricated_measurements() -> None:
    summary = build_preflight_rejection_summary(
        candidate_id=V7_CANDIDATE_IDS[1],
        execution_commit_sha="1" * 40,
        failure_id="model-load-failed",
        artifacts_verified=False,
        network_isolation=False,
        limitations=(
            "frozen-lock-loads-v2-filename",
            "frozen-candidate-requires-v3-filename",
            "runtime-download-substitution-forbidden",
        ),
    )

    assert summary["status"] == "rejected"
    assert summary["performanceByLanguage"] == []
    assert summary["memory"] is None
    assert summary["counts"] == {
        "firstAttempts": 0,
        "completedGenerations": 0,
        "failedGenerations": 0,
        "cancellationTrials": 0,
    }
    assert summary["qualityByLanguage"] == [
        {"language": "es", "status": "not-admitted"},
        {"language": "en", "status": "not-admitted"},
    ]
