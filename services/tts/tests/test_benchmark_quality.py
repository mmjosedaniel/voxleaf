"""Model-free tests for disposable blinded TTS quality sessions."""

from __future__ import annotations

import json
from pathlib import Path
from typing import cast

import pytest

from benchmarks.adapters.manifest import QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID
from benchmarks.cli import parse_preflight_request
from benchmarks.contracts import GenerationRequest
from benchmarks.preflight import PreflightRequest
from benchmarks.quality import (
    DIMENSIONS,
    QualitySessionError,
    aggregate_scores,
    cleanup_session,
    finalize_session,
    generate_candidate_audio,
    submit_scorecard,
)
from benchmarks.quality_cli import GENERATE_FIELDS, QualityCommandError, _require_fields


class FakeQualityAdapter:
    def __init__(self, *, fail: bool = False) -> None:
        self.fail = fail
        self.loaded = False
        self.closed = False

    def load(self) -> None:
        self.loaded = True

    def synthesize_for_quality(self, request: GenerationRequest) -> tuple[list[float], int]:
        assert self.loaded
        assert request.text
        if self.fail:
            raise RuntimeError("private fake failure")
        return [0.0, 0.25, -0.25], 24_000

    def close(self) -> None:
        self.closed = True


def _request(tmp_path: Path, candidate_id: str) -> PreflightRequest:
    if candidate_id == QWEN_CANDIDATE_ID:
        values = {
            "modelRevision": "8f9ebcf8826db6eeb9cdd4caa09d575a7f9ce4bd",
            "voiceId": "Aiden",
            "provider": "pytorch-cuda",
            "precision": "bfloat16",
        }
    else:
        values = {
            "modelRevision": "3cadd1ee6394adea1bd021217a0e650ede09a323",
            "voiceId": "F1",
            "provider": "onnxruntime-cpu",
            "precision": "float32",
        }
    return parse_preflight_request(
        {
            "candidateId": candidate_id,
            "artifactRoot": str(tmp_path / "private-model"),
            "candidatePython": str(tmp_path / "private-python.exe"),
            **values,
            "offline": True,
            "expectedCommitSha": "a" * 40,
            "purpose": "official",
            "sleepDisabled": True,
            "backgroundLoadAcceptable": True,
            "thermalStateAcceptable": True,
        }
    )


def _fake_wave(path: Path, waveform: object, sample_rate_hz: int) -> None:
    assert waveform == [0.0, 0.25, -0.25]
    assert sample_rate_hz == 24_000
    path.write_bytes(b"RIFF-fake")


def test_single_evaluator_session_is_blinded_bounded_and_not_promotable(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "1" * 32

    first = generate_candidate_audio(
        _request(tmp_path, QWEN_CANDIDATE_ID),
        session_id,
        raw_root=raw_root,
        adapter_builder=FakeQualityAdapter,
    )
    assert first["generatedSamples"] == 12
    assert first["readyForFinalization"] is False

    second = generate_candidate_audio(
        _request(tmp_path, SUPERTONIC_CANDIDATE_ID),
        session_id,
        raw_root=raw_root,
        adapter_builder=FakeQualityAdapter,
    )
    assert second["generatedSamples"] == 12
    assert second["readyForFinalization"] is True

    sample_ids = iter(f"{index:032x}" for index in range(1, 25))
    finalized = finalize_session(
        session_id,
        1,
        raw_root=raw_root,
        shuffle=lambda values: values.reverse(),
        id_factory=lambda: next(sample_ids),
    )
    assert finalized == {
        "status": "pass",
        "sessionId": session_id,
        "evaluatorCount": 1,
        "sampleCount": 24,
        "eligibleForPromotion": False,
    }

    session = raw_root / "quality-v2" / session_id
    assert not (session / "staging").exists()
    assert len(tuple((session / "audio").glob("*.wav"))) == 24
    page = (session / "evaluator-01.html").read_text(encoding="utf-8")
    assert QWEN_CANDIDATE_ID not in page
    assert SUPERTONIC_CANDIDATE_ID not in page
    assert "qualityOptIn" not in page
    corpus = json.loads(
        (Path(__file__).resolve().parents[3] / "benchmarks" / "tts" / "corpus-v1.json").read_text(
            encoding="utf-8"
        )
    )
    assert all(case["text"] not in page for case in corpus["cases"])
    assert all(case["privacyCanary"] not in page for case in corpus["cases"])

    template = json.loads(
        (session / "scorecards" / "evaluator-01.template.json").read_text(encoding="utf-8")
    )
    for index, sample in enumerate(template["samples"]):
        sample["scores"] = {dimension: 4 for dimension in DIMENSIONS}
        sample["meaningChangingDefect"] = index == 0
    submitted = submit_scorecard(
        session_id,
        cast(object, template),
        raw_root=raw_root,
    )
    assert submitted["completedEvaluators"] == 1

    aggregate = aggregate_scores(session_id, raw_root=raw_root)
    assert aggregate["evaluatorCount"] == 1
    assert aggregate["eligibleForPromotion"] is False
    candidates = cast(dict[str, object], aggregate["candidates"])
    for candidate in candidates.values():
        result = cast(dict[str, object], candidate)
        assert result["overallMean"] == 4
        assert result["evaluatorCount"] == 1
    assert (
        sum(
            cast(int, cast(dict[str, object], candidate)["meaningChangingDefects"])
            for candidate in candidates.values()
        )
        == 1
    )

    cleanup_session(session_id, raw_root=raw_root)
    assert not session.exists()


def test_generation_failure_removes_the_whole_disposable_session(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "2" * 32

    with pytest.raises(
        QualitySessionError,
        match=r"^tts-benchmark-quality:generation$",
    ):
        generate_candidate_audio(
            _request(tmp_path, QWEN_CANDIDATE_ID),
            session_id,
            raw_root=raw_root,
            adapter_builder=lambda: FakeQualityAdapter(fail=True),
        )
    assert not (raw_root / "quality-v2" / session_id).exists()


def test_scorecard_rejects_partial_or_reordered_samples(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "3" * 32
    for candidate_id in (QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID):
        generate_candidate_audio(
            _request(tmp_path, candidate_id),
            session_id,
            raw_root=raw_root,
            adapter_builder=FakeQualityAdapter,
        )
    sample_ids = iter(f"{index:032x}" for index in range(25, 49))
    finalize_session(
        session_id,
        1,
        raw_root=raw_root,
        id_factory=lambda: next(sample_ids),
    )
    session = raw_root / "quality-v2" / session_id
    template = json.loads(
        (session / "scorecards" / "evaluator-01.template.json").read_text(encoding="utf-8")
    )
    template["samples"].pop()
    with pytest.raises(
        QualitySessionError,
        match=r"^tts-benchmark-quality:invalid-scorecard$",
    ):
        submit_scorecard(session_id, cast(object, template), raw_root=raw_root)


def test_quality_generation_input_requires_explicit_opt_in_and_closed_fields(
    tmp_path: Path,
) -> None:
    request = _request(tmp_path, QWEN_CANDIDATE_ID)
    payload: dict[str, object] = {
        "candidateId": request.profile.candidate_id,
        "artifactRoot": str(request.configuration.artifact_root),
        "candidatePython": str(request.candidate_python),
        "modelRevision": request.configuration.model_revision,
        "voiceId": request.configuration.voice_id,
        "provider": request.configuration.provider,
        "precision": request.configuration.precision,
        "offline": True,
        "expectedCommitSha": request.expected_commit_sha,
        "purpose": "official",
        "sleepDisabled": True,
        "backgroundLoadAcceptable": True,
        "thermalStateAcceptable": True,
        "qualityOptIn": True,
        "sessionId": "4" * 32,
    }
    _require_fields(payload, GENERATE_FIELDS)
    payload["privateText"] = "must-not-cross"
    with pytest.raises(
        QualityCommandError,
        match=r"^tts-benchmark-quality-command:invalid-input$",
    ):
        _require_fields(payload, GENERATE_FIELDS)
