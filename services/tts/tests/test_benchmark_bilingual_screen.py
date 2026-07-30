"""Model-free coverage for the frozen v8 control/screen path."""

from __future__ import annotations

from pathlib import Path
from typing import Final

from benchmarks.adapters.qwen_v8 import load_qwen_v8_profile
from benchmarks.bilingual_screen_result import build_rejected_summary
from benchmarks.fake_adapter import (
    DeterministicFakeAdapter,
    FakeMemoryProbe,
    FakeNanosecondClock,
)
from benchmarks.harness import BenchmarkHarness, load_bilingual_corpus
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
