"""Model-free coverage for the frozen v8 Piper English baseline path."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Final, cast

import pytest

from benchmarks.adapters.piper_english import (
    PIPER_ENGLISH_CANDIDATE_ID,
    PiperEnglishArtifact,
    PiperEnglishConfiguration,
    PiperEnglishConfigurationError,
    PiperEnglishProfile,
    load_piper_english_profile,
    verify_piper_english_artifacts,
)
from benchmarks.bilingual_quality import (
    DIMENSIONS,
    _render_evaluator_html,
    finalize_quality_session,
)
from benchmarks.bilingual_result import build_content_safe_summary
from benchmarks.contracts import GenerationRequest
from benchmarks.fake_adapter import (
    DeterministicFakeAdapter,
    FakeMemoryProbe,
    FakeNanosecondClock,
)
from benchmarks.harness import BenchmarkHarness, load_bilingual_corpus
from benchmarks.v7_authority import PIPER_LOCK_SHA256

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v7.json"
LOCK_PATH: Final = (
    REPOSITORY_ROOT
    / "services"
    / "tts"
    / "benchmarks"
    / "candidates"
    / "piper_1_4_2_cpu"
    / "uv.lock"
)


def _small_profile(root: Path) -> PiperEnglishProfile:
    artifacts: list[PiperEnglishArtifact] = []
    for name, payload in (
        ("en_US-joe-medium.onnx", b"model"),
        ("en_US-joe-medium.onnx.json", b"config"),
        ("MODEL_CARD", b"card"),
    ):
        (root / name).write_bytes(payload)
        artifacts.append(
            PiperEnglishArtifact(
                file_name=name,
                size_bytes=len(payload),
                sha256=hashlib.sha256(payload).hexdigest(),
            )
        )
    return PiperEnglishProfile(
        candidate_id=PIPER_ENGLISH_CANDIDATE_ID,
        model_revision="0d907f158acc877ddeebcbf827659ee13bea8bcd",
        voice_id="en_US-joe-medium",
        engine_version="1.4.2",
        runtime_version="1.27.0",
        artifacts=tuple(artifacts),
        noise_scale=0.667,
        length_scale=1.0,
        noise_w=0.8,
        normalize_audio=True,
        volume=1.0,
    )


def test_frozen_piper_english_profile_and_lock_load_without_candidate_imports() -> None:
    profile = load_piper_english_profile(REPOSITORY_ROOT)

    assert profile.candidate_id == PIPER_ENGLISH_CANDIDATE_ID
    assert profile.voice_id == "en_US-joe-medium"
    assert profile.engine_version == "1.4.2"
    assert profile.runtime_version == "1.27.0"
    assert tuple(item.file_name for item in profile.artifacts) == (
        "en_US-joe-medium.onnx",
        "en_US-joe-medium.onnx.json",
        "MODEL_CARD",
    )
    assert hashlib.sha256(LOCK_PATH.read_bytes()).hexdigest() == PIPER_LOCK_SHA256


def test_artifact_verification_is_exact_and_fails_closed(
    tmp_path: Path,
) -> None:
    root = tmp_path / "voice"
    root.mkdir()
    profile = _small_profile(root)
    configuration = PiperEnglishConfiguration(root.resolve())

    assert verify_piper_english_artifacts(profile, configuration) == root.resolve()
    (root / "MODEL_CARD").write_bytes(b"changed")
    with pytest.raises(
        PiperEnglishConfigurationError,
        match=r"^tts-benchmark-piper-english:artifact-mismatch$",
    ):
        verify_piper_english_artifacts(profile, configuration)


def test_bilingual_corpus_projects_only_the_frozen_english_cases() -> None:
    corpus = load_bilingual_corpus(CORPUS_PATH, "en")

    assert corpus.corpus_version == "tts-bilingual-corpus-v7"
    assert len(corpus.cases) == 5
    assert corpus.performance_order == corpus.sustained_sequence
    assert {case.language for case in corpus.cases.values()} == {"en"}
    assert set(corpus.performance_order) == set(corpus.cases)


def test_v8_baseline_protocol_uses_exact_bounded_counts_and_24khz() -> None:
    corpus = load_bilingual_corpus(CORPUS_PATH, "en")
    clock = FakeNanosecondClock()
    adapters: list[DeterministicFakeAdapter] = []

    def factory() -> DeterministicFakeAdapter:
        adapter = DeterministicFakeAdapter(clock, sample_rate_hz=24_000)
        adapters.append(adapter)
        return adapter

    result = BenchmarkHarness(
        clock=clock,
        memory_probe=FakeMemoryProbe(),
    ).run_bilingual_baseline_protocol(
        adapter_factory=factory,
        corpus=corpus,
    )

    assert result.failure is None
    run = result.run
    assert run is not None
    assert len(run.load_observations) == 5
    assert sum(item.phase == "warm" for item in run.generation_observations) == 10
    assert sum(item.phase == "sustained" for item in run.generation_observations) == 15
    assert len(run.cancellation_observations) == 4
    assert {
        (item.sample_rate_hz, item.channels, item.sample_format)
        for item in run.generation_observations
    } == {(24_000, 1, "float32")}
    assert all(adapter.active_request_ids == set() for adapter in adapters)


def test_english_requests_are_accepted_but_unknown_languages_fail_closed() -> None:
    corpus = load_bilingual_corpus(CORPUS_PATH, "en")
    case = corpus.cases[corpus.performance_order[0]]
    clock = FakeNanosecondClock()
    adapter = DeterministicFakeAdapter(clock, sample_rate_hz=24_000)
    adapter.load()
    harness = BenchmarkHarness(clock=clock, memory_probe=FakeMemoryProbe())

    observation = harness.observe_generation(
        adapter,
        GenerationRequest(
            request_id="english",
            case_id=case.case_id,
            phase="warm",
            text=case.text,
            language="en",
        ),
        forbidden_values=(case.text, case.privacy_canary),
    )
    assert observation.sample_rate_hz == 24_000

    with pytest.raises(RuntimeError, match=r"^tts-benchmark:invalid-request:unknown$"):
        harness.observe_generation(
            adapter,
            GenerationRequest(
                request_id="unknown",
                case_id=case.case_id,
                phase="warm",
                text=case.text,
                language="fr",
            ),
            forbidden_values=(case.text, case.privacy_canary),
        )


def _raw_fixture() -> dict[str, object]:
    attempts = []
    for phase, count in (("warm", 10), ("sustained", 15)):
        for index in range(count):
            attempts.append(
                {
                    "caseId": f"en-v7-fixture-{index}",
                    "language": "en",
                    "phase": phase,
                    "attempt": 1,
                    "sampleCount": 240_000,
                    "sampleRateHz": 24_000,
                    "channels": 1,
                    "wallNanoseconds": 2_000_000_000,
                    "firstAudioNanoseconds": 100_000_000,
                    "status": "complete",
                }
            )
    return {
        "schemaVersion": "tts-bilingual-raw-v8",
        "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
        "evaluationStage": "baseline",
        "authorityCommitSha": "b66fafa743b84e8a995705ec3bbdf8fed6a9a04e",
        "executionCommitSha": "1" * 40,
        "profileSha256": "84448e70e8b8b2782f22c0e3d874b1b30531084732e0416ab9e83e1ad1e7525a",
        "corpusSha256": "cc140a35688dc0dff7e8c50a5355e920bd2847aa9deac2f7e6256160fb9afcfe",
        "candidateManifestSha256": (
            "5245f6949cf035eee8de98fef21e8eea89d30b468d76039949e2100558401b0e"
        ),
        "dependencyLockSha256": PIPER_LOCK_SHA256,
        "status": "complete",
        "languagesEvaluated": ["en"],
        "attempts": attempts,
        "cancellationTrials": [
            {
                "trialId": trial,
                "language": "en",
                "passed": True,
                "stopNanoseconds": 100_000_000,
                "cleanupNanoseconds": 0,
                "staleUnits": 0,
                "processesRemaining": 0,
            }
            for trial in (
                "before-dispatch",
                "accepted-before-audio",
                "after-first-audio",
                "near-hard-mid-generation",
            )
        ],
        "memory": {
            "peakProcessTreeRamBytes": 1_000_000_000,
            "peakDedicatedVramBytes": None,
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
        "failures": [],
    }


def _quality_fixture(score: float = 4.0) -> dict[str, object]:
    return {
        "schemaVersion": "tts-bilingual-quality-aggregate-v8",
        "sessionId": "a" * 32,
        "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
        "language": "en",
        "evaluatorCount": 1,
        "blindOrder": True,
        "sampleCount": 5,
        "dimensionMeans": {dimension: score for dimension in DIMENSIONS},
        "meaningChangingDefects": 0,
        "wrongLanguageOutputs": 0,
    }


def test_quality_html_is_blinded_randomized_and_exports_closed_scores() -> None:
    rendered = _render_evaluator_html(
        session_id="a" * 32,
        samples=(
            {
                "sampleId": "b" * 32,
                "caseId": "en-v7-arrival",
                "text": "Repository-authored synthetic text.",
            },
        ),
    )

    assert PIPER_ENGLISH_CANDIDATE_ID in rendered
    assert "piper-english-quality-result-" in rendered
    assert "Repository-authored synthetic text." in rendered
    assert all(dimension in rendered for dimension in DIMENSIONS)
    assert "model root" not in rendered.lower()


def test_quality_finalize_aggregates_one_evaluator_and_removes_export(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    import benchmarks.bilingual_quality as quality_module

    raw_root = tmp_path / "raw"
    monkeypatch.setattr(quality_module, "RAW_ROOT", raw_root)
    session_id = "a" * 32
    quality_root = raw_root / PIPER_ENGLISH_CANDIDATE_ID / session_id / "quality"
    quality_root.mkdir(parents=True)
    sample_ids = [f"{index:032x}" for index in range(5)]
    (quality_root / "private-map.json").write_text(
        json.dumps(
            {
                "samples": [
                    {"sampleId": sample_id, "caseId": f"en-v7-{index}"}
                    for index, sample_id in enumerate(sample_ids)
                ]
            }
        ),
        encoding="utf-8",
    )
    result_path = tmp_path / f"piper-english-quality-result-{session_id}.json"
    result_path.write_text(
        json.dumps(
            {
                "schemaVersion": "tts-bilingual-quality-scorecard-v8",
                "sessionId": session_id,
                "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
                "language": "en",
                "evaluatorCount": 1,
                "blindOrder": True,
                "samples": [
                    {
                        "sampleId": sample_id,
                        "scores": {dimension: 4 for dimension in DIMENSIONS},
                        "meaningChangingDefect": False,
                        "wrongLanguage": False,
                    }
                    for sample_id in sample_ids
                ],
            }
        ),
        encoding="utf-8",
    )

    receipt = finalize_quality_session(
        machine_session_id=session_id,
        result_path=result_path,
    )
    aggregate = json.loads((quality_root / "quality.aggregate.json").read_text())
    assert receipt["privateResultRemoved"] is True
    assert not result_path.exists()
    assert aggregate["dimensionMeans"] == {dimension: 4.0 for dimension in DIMENSIONS}


def test_content_safe_summary_applies_all_frozen_quality_gates() -> None:
    passing = build_content_safe_summary(_raw_fixture(), _quality_fixture())
    passing_gates = cast(dict[str, object], passing["gates"])
    assert passing["status"] == "complete"
    assert passing_gates["overall"] == "pass"
    assert passing["counts"] == {
        "firstAttempts": 25,
        "completedGenerations": 25,
        "failedGenerations": 0,
        "cancellationTrials": 4,
    }

    failing_quality = _quality_fixture()
    failing_dimensions = cast(dict[str, object], failing_quality["dimensionMeans"])
    failing_dimensions["prosody"] = 2.5
    rejected = build_content_safe_summary(_raw_fixture(), failing_quality)
    rejected_gates = cast(dict[str, object], rejected["gates"])
    assert rejected["status"] == "rejected"
    assert rejected_gates["quality"] == "fail"
    assert rejected_gates["overall"] == "fail"
