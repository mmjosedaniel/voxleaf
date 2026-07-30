"""Model-free coverage for the frozen v8 Piper English baseline path."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Final

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
