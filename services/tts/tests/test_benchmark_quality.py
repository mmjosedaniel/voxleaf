"""Model-free tests for disposable blinded TTS quality sessions."""

from __future__ import annotations

import hashlib
import json
from copy import deepcopy
from pathlib import Path
from typing import cast

import pytest

from benchmarks import quality, quality_presentation, quality_scoring
from benchmarks.adapters.manifest import (
    PIPER_CPU_CANDIDATE_ID,
    QWEN_CANDIDATE_ID,
    QWEN_V3_CANDIDATE_ID,
    SUPERTONIC_CANDIDATE_ID,
)
from benchmarks.cli import parse_preflight_request
from benchmarks.contracts import BenchmarkCorpus, GenerationRequest
from benchmarks.preflight import PreflightRequest
from benchmarks.quality import (
    CORRECTION_REASON,
    DIMENSIONS,
    QualitySessionError,
    aggregate_scores,
    cleanup_session,
    correct_meaning_changing_defect,
    finalize_session,
    generate_candidate_audio,
    submit_scorecard,
)
from benchmarks.quality_cli import GENERATE_FIELDS, QualityCommandError, _require_fields
from benchmarks.quality_scoring import _aggregate_candidate_scores


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
    if candidate_id == QWEN_V3_CANDIDATE_ID:
        values = {
            "modelRevision": "0c0e3051f131929182e2c023b9537f8b1c68adfe",
            "voiceId": "Serena",
            "provider": "pytorch-cuda",
            "precision": "bfloat16",
        }
    elif candidate_id == QWEN_CANDIDATE_ID:
        values = {
            "modelRevision": "8f9ebcf8826db6eeb9cdd4caa09d575a7f9ce4bd",
            "voiceId": "Aiden",
            "provider": "pytorch-cuda",
            "precision": "bfloat16",
        }
    elif candidate_id == SUPERTONIC_CANDIDATE_ID:
        values = {
            "modelRevision": "3cadd1ee6394adea1bd021217a0e650ede09a323",
            "voiceId": "F1",
            "provider": "onnxruntime-cpu",
            "precision": "float32",
        }
    else:
        assert candidate_id == PIPER_CPU_CANDIDATE_ID
        values = {
            "modelRevision": "0d907f158acc877ddeebcbf827659ee13bea8bcd",
            "voiceId": "es_ES-davefx-medium",
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


@pytest.mark.parametrize(
    "candidates",
    [
        (QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID),
        (QWEN_V3_CANDIDATE_ID,),
        (PIPER_CPU_CANDIDATE_ID,),
    ],
)
def test_rac_02_rejected_ready_session_preserves_all_completed_bytes(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    candidates: tuple[str, ...],
) -> None:
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "a" * 32
    for candidate in candidates:
        generate_candidate_audio(
            _request(tmp_path, candidate),
            session_id,
            raw_root=raw_root,
            adapter_builder=FakeQualityAdapter,
        )
    finalize_session(session_id, 1, raw_root=raw_root)
    session = raw_root / "quality-v2" / session_id
    scorecard = json.loads(
        (session / "scorecards/evaluator-01.template.json").read_text(encoding="utf-8")
    )
    for sample in scorecard["samples"]:
        sample["scores"] = {dimension: 4 for dimension in DIMENSIONS}
        sample["meaningChangingDefect"] = False
    submit_scorecard(session_id, scorecard, raw_root=raw_root)
    before = {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    }

    def unexpected_adapter() -> FakeQualityAdapter:
        pytest.fail("ready session must be rejected before adapter construction")

    with pytest.raises(QualitySessionError, match="invalid-metadata"):
        generate_candidate_audio(
            _request(tmp_path, candidates[0]),
            session_id,
            raw_root=raw_root,
            adapter_builder=unexpected_adapter,
        )
    assert session.is_dir()
    assert {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    } == before


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


def test_v3_quality_session_is_single_candidate_and_identity_bound(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "5" * 32
    request = _request(tmp_path, QWEN_V3_CANDIDATE_ID)
    generated = generate_candidate_audio(
        request,
        session_id,
        raw_root=raw_root,
        adapter_builder=FakeQualityAdapter,
    )
    assert generated["readyForFinalization"] is True
    sample_ids = iter(f"{index:032x}" for index in range(49, 61))
    finalized = finalize_session(
        session_id,
        3,
        raw_root=raw_root,
        id_factory=lambda: next(sample_ids),
    )
    assert finalized["sampleCount"] == 12
    assert finalized["eligibleForPromotion"] is True
    session = raw_root / "quality-v2" / session_id
    metadata = (session / "session.json").read_text(encoding="utf-8")
    assert request.profile.instruction is not None
    assert request.profile.instruction not in metadata
    assert str(request.configuration.artifact_root) not in metadata
    assert QWEN_V3_CANDIDATE_ID not in (session / "evaluator-01.html").read_text(encoding="utf-8")


def test_v6_quality_preserves_and_applies_one_classification_correction(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "6" * 32
    generated = generate_candidate_audio(
        _request(tmp_path, PIPER_CPU_CANDIDATE_ID),
        session_id,
        raw_root=raw_root,
        adapter_builder=FakeQualityAdapter,
    )
    assert generated["generatedSamples"] == 8
    assert generated["readyForFinalization"] is True
    sample_ids = iter(f"{index:032x}" for index in range(61, 69))
    finalize_session(
        session_id,
        1,
        raw_root=raw_root,
        id_factory=lambda: next(sample_ids),
    )
    session = raw_root / "quality-v2" / session_id
    completed_path = session / "scorecards" / "evaluator-01.completed.json"
    template = json.loads(
        (session / "scorecards" / "evaluator-01.template.json").read_text(encoding="utf-8")
    )
    corrected_case_id = cast(str, template["samples"][0]["caseId"])
    for index, sample in enumerate(template["samples"]):
        sample["scores"] = {dimension: 4 for dimension in DIMENSIONS}
        sample["meaningChangingDefect"] = index == 0
    submit_scorecard(session_id, cast(object, template), raw_root=raw_root)
    first = aggregate_scores(session_id, raw_root=raw_root)
    first_candidate = cast(
        dict[str, object],
        cast(dict[str, object], first["candidates"])[PIPER_CPU_CANDIDATE_ID],
    )
    assert first_candidate["meaningChangingDefects"] == 1

    correction = correct_meaning_changing_defect(
        session_id,
        "evaluator-01",
        corrected_case_id,
        reason_code=CORRECTION_REASON,
        raw_root=raw_root,
    )
    assert correction["correctedMeaningChangingDefect"] is False
    assert not (session / "quality.aggregate.json").exists()
    original = json.loads(completed_path.read_text(encoding="utf-8"))
    assert original["samples"][0]["meaningChangingDefect"] is True

    corrected = aggregate_scores(session_id, raw_root=raw_root)
    corrected_candidate = cast(
        dict[str, object],
        cast(dict[str, object], corrected["candidates"])[PIPER_CPU_CANDIDATE_ID],
    )
    assert corrected_candidate["meaningChangingDefects"] == 0
    with pytest.raises(
        QualitySessionError,
        match=r"^tts-benchmark-quality:correction-state$",
    ):
        correct_meaning_changing_defect(
            session_id,
            "evaluator-01",
            corrected_case_id,
            reason_code=CORRECTION_REASON,
            raw_root=raw_root,
        )


def _synthetic_scorecards() -> tuple[dict[str, tuple[str, str]], list[dict[str, object]]]:
    na = "not-applicable"
    cells = (
        ((1, 5, na), (2, 4, 5)),
        ((1, na, na), (5, na, na)),
        ((na, na, na), (2, 4, na)),
        ((2, 3, 4), (1, 2, na)),
        ((5, 5, 1), (1, 1, 5)),
        ((na, 2, 4), (na, na, 5)),
        ((1, 2, 3), (4, 5, na)),
    )
    by_sample = {
        f"{index:032x}": (candidate_id, case_id)
        for index, (candidate_id, case_id) in enumerate(
            (
                ("candidate-a", "case-a"),
                ("candidate-a", "case-b"),
                ("candidate-b", "case-a"),
                ("candidate-b", "case-b"),
            ),
            1,
        )
    }
    cards: list[dict[str, object]] = []
    for evaluator in range(3):
        samples: list[dict[str, object]] = []
        for sample_id, (candidate_id, case_id) in by_sample.items():
            case_index = int(case_id == "case-b")
            samples.append(
                {
                    "sampleId": sample_id,
                    "caseId": case_id,
                    "scores": {
                        dimension: (
                            values[case_index][evaluator] if candidate_id == "candidate-a" else 4
                        )
                        for dimension, values in zip(DIMENSIONS, cells, strict=True)
                    },
                    "meaningChangingDefect": candidate_id == "candidate-a"
                    and (evaluator, case_index) in {(0, 0), (1, 0), (2, 1)},
                }
            )
        cards.append(
            {
                "sessionId": "c" * 32,
                "evaluatorId": f"evaluator-{evaluator + 1:02d}",
                "samples": samples,
            }
        )
    return by_sample, cards


def _expected_quality(candidate_id: str) -> dict[str, object]:
    first = candidate_id == "candidate-a"
    means = (3.5, 3.0, 3.0, 2.25, 3.0, 4.0, 3.25) if first else (4.0,) * 7
    return {
        "evaluatorCount": 3,
        "blindOrder": True,
        "scale": "1-5",
        "overallMean": 3.142857142857143 if first else 4.0,
        "dimensions": dict(zip(DIMENSIONS, means, strict=True)),
        "meaningChangingDefects": 2 if first else 0,
        "limitations": [
            "small-panel",
            "spanish-only",
            "fixed-voices-only",
            "synthetic-corpus-only",
            "not-accessibility-certification",
        ],
    }


def test_quality_leaf_bindings_and_entire_evaluator_html() -> None:
    for name in ("DIMENSIONS", "QualitySessionError", "_score"):
        assert getattr(quality, name) is getattr(quality_scoring, name)
    name = "_render_evaluator_html"
    assert getattr(quality, name) is getattr(quality_presentation, name)
    name = "DIMENSIONS"
    assert getattr(quality, name) is getattr(quality_presentation, name)
    assert QualitySessionError.__module__ == "benchmarks.quality"
    error = QualitySessionError("missing-dimension")
    assert isinstance(error, RuntimeError)
    assert error.code == "missing-dimension"
    assert str(error) == "tts-benchmark-quality:missing-dimension"
    for value in (True, False, 0, 6, 1.0, None):
        with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:invalid-scorecard$"):
            quality_scoring._score(value)
    card: dict[str, object] = {
        "sessionId": "a" * 32,
        "evaluatorId": "evaluator-01",
        "samples": [
            {
                "sampleId": "b" * 32,
                "caseId": "synthetic-case",
                "scores": {dimension: None for dimension in DIMENSIONS},
                "meaningChangingDefect": None,
            }
        ],
    }
    payload = quality_presentation._render_evaluator_html("evaluator-01", card).encode("utf-8")
    assert len(payload) == 3675
    assert (
        hashlib.sha256(payload).hexdigest()
        == "24ff8309930111c671c17a53145e71f03b0f10488143cfcc53f66aa0c76b8e15"
    )


@pytest.mark.parametrize("candidate_id", ["candidate-a", "candidate-b"])
def test_pure_quality_scores_match_original_multievaluator_result(candidate_id: str) -> None:
    by_sample, cards = _synthetic_scorecards()
    assert _aggregate_candidate_scores(
        candidate_id, ("case-a", "case-b"), by_sample, cards, {("evaluator-01", "case-a")}
    ) == _expected_quality(candidate_id)


@pytest.mark.parametrize(
    "fault, error_type",
    [
        ("missing-dimension", QualitySessionError),
        ("missing-key", KeyError),
        ("nonmapping", TypeError),
    ],
)
def test_pure_quality_scores_preserve_missing_dimension_and_raw_errors(
    fault: str, error_type: type[Exception]
) -> None:
    by_sample, cards = _synthetic_scorecards()
    for card in cards:
        for sample in cast(list[dict[str, object]], card["samples"])[:2]:
            scores = cast(dict[str, object], sample["scores"])
            if fault == "missing-dimension":
                scores["artifactFreedom"] = "not-applicable"
            elif fault == "missing-key":
                del scores["artifactFreedom"]
            else:
                sample["scores"] = None
    with pytest.raises(error_type) as caught:
        _aggregate_candidate_scores("candidate-a", ("case-a", "case-b"), by_sample, cards, set())
    if fault == "missing-dimension":
        assert cast(QualitySessionError, caught.value).code == "missing-dimension"
        assert str(caught.value) == "tts-benchmark-quality:missing-dimension"


@pytest.fixture
def submission_session(tmp_path: Path) -> tuple[Path, dict[str, object]]:
    _, cards = _synthetic_scorecards()
    card = cards[0]
    session = tmp_path / "quality-v2" / ("c" * 32)
    (session / "scorecards").mkdir(parents=True)
    (session / "session.json").write_text(
        json.dumps({"state": "ready", "evaluatorIds": ["evaluator-01"]}), encoding="utf-8"
    )
    (session / "scorecards" / "evaluator-01.template.json").write_text(
        json.dumps(card), encoding="utf-8"
    )
    return session, card


def test_scorecard_submission_projects_without_mutating_input(
    tmp_path: Path, submission_session: tuple[Path, dict[str, object]]
) -> None:
    session, card = submission_session
    expected = deepcopy(card)
    card["ignored"] = {"nested": [1, 5, "not-applicable"]}
    for sample in cast(list[dict[str, object]], card["samples"]):
        sample["ignored"] = {"nested": [True, False]}
        sample["scores"] = dict(reversed(list(cast(dict[str, object], sample["scores"]).items())))
    original = deepcopy(card)
    template_path = session / "scorecards" / "evaluator-01.template.json"
    template_bytes = template_path.read_bytes()
    (session / "scorecards" / "evaluator-02.completed.json").write_bytes(b"{}\n")
    assert submit_scorecard("c" * 32, card, raw_root=tmp_path) == {
        "status": "pass",
        "sessionId": "c" * 32,
        "evaluatorId": "evaluator-01",
        "completedEvaluators": 2,
    }
    saved = session / "scorecards" / "evaluator-01.completed.json"
    assert saved.read_bytes() == (
        json.dumps(expected, ensure_ascii=True, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")
    assert json.loads(saved.read_bytes()) == expected
    assert card == original
    assert template_path.read_bytes() == template_bytes


@pytest.mark.parametrize(
    "field, value",
    [
        ("sample", None),
        ("sampleId", "different-sample"),
        ("caseId", "different-case"),
        ("scores", None),
        ("scores", {}),
        ("scores", {**dict.fromkeys(DIMENSIONS, 4), "extra": 4}),
        ("meaningChangingDefect", 1),
        *[("score", value) for value in (True, False, 0, 6, 1.0, None)],
    ],
)
def test_scorecard_submission_rejects_malformed_samples_without_output(
    tmp_path: Path,
    submission_session: tuple[Path, dict[str, object]],
    field: str,
    value: object,
) -> None:
    session, card = submission_session
    samples = cast(list[object], card["samples"])
    sample = cast(dict[str, object], samples[0])
    if field == "sample":
        samples[0] = value
    elif field == "score":
        cast(dict[str, object], sample["scores"])[DIMENSIONS[0]] = value
    else:
        sample[field] = value
    with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:invalid-scorecard$"):
        submit_scorecard("c" * 32, card, raw_root=tmp_path)
    assert not tuple((session / "scorecards").glob("*.completed.json"))
    assert not tuple((session / "scorecards").glob("*.tmp"))


def test_invalid_scorecard_precedes_existing_completed_file(
    tmp_path: Path, submission_session: tuple[Path, dict[str, object]]
) -> None:
    session, card = submission_session
    saved = session / "scorecards" / "evaluator-01.completed.json"
    previous_bytes = b'{"previous": "synthetic-completed-card"}\n'
    saved.write_bytes(previous_bytes)
    cast(list[dict[str, object]], card["samples"])[0]["caseId"] = "different-case"
    with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:invalid-scorecard$"):
        submit_scorecard("c" * 32, card, raw_root=tmp_path)
    assert saved.read_bytes() == previous_bytes


def test_scorecard_rejects_actual_reordering(tmp_path: Path) -> None:
    _, cards = _synthetic_scorecards()
    card = cards[0]
    session = tmp_path / "quality-v2" / ("c" * 32)
    (session / "scorecards").mkdir(parents=True)
    (session / "session.json").write_text(
        json.dumps({"state": "ready", "evaluatorIds": ["evaluator-01"]}), encoding="utf-8"
    )
    (session / "scorecards" / "evaluator-01.template.json").write_text(
        json.dumps(card), encoding="utf-8"
    )
    samples = cast(list[dict[str, object]], card["samples"])
    samples[0], samples[1] = samples[1], samples[0]
    with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:invalid-scorecard$"):
        submit_scorecard("c" * 32, card, raw_root=tmp_path)
    assert not (session / "scorecards" / "evaluator-01.completed.json").exists()


@pytest.mark.parametrize("fault", [None, "later-candidate", "missing-dimension", "later-corpus"])
def test_quality_aggregation_preserves_read_and_failure_order(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, fault: str | None
) -> None:
    by_sample, cards = _synthetic_scorecards()
    session = tmp_path / "quality-v2" / ("c" * 32)
    (session / "scorecards").mkdir(parents=True)
    metadata: dict[str, object] = {
        "state": "ready",
        "evaluatorIds": [card["evaluatorId"] for card in cards],
        "expectedCandidates": [
            "candidate-a",
            None if fault == "later-candidate" else "candidate-b",
        ],
        "protocolVersion": "tts-feasibility-profile-v2",
    }
    if fault == "missing-dimension":
        for card in cards:
            for sample in cast(list[dict[str, object]], card["samples"])[:2]:
                cast(dict[str, object], sample["scores"])["artifactFreedom"] = "not-applicable"
    files: dict[str, object] = {
        "session.json": metadata,
        "randomization-key.json": {
            "samples": [
                {"sampleId": sample_id, "candidateId": candidate_id, "caseId": case_id}
                for sample_id, (candidate_id, case_id) in by_sample.items()
            ]
        },
        "scorecards/evaluator-01.correction.json": {
            "sessionId": "c" * 32,
            "evaluatorId": "evaluator-01",
            "caseId": "case-a",
            "previousMeaningChangingDefect": True,
            "correctedMeaningChangingDefect": False,
            "reasonCode": CORRECTION_REASON,
        },
    }
    files.update({f"scorecards/{card['evaluatorId']}.completed.json": card for card in cards})
    for relative_path, value in files.items():
        (session / relative_path).write_text(json.dumps(value), encoding="utf-8")
    reads: list[str] = []
    original_read = quality._read_mapping

    def read_mapping(path: Path) -> dict[str, object]:
        reads.append(path.name)
        return original_read(path)

    def load_corpus(path: Path) -> BenchmarkCorpus:
        reads.append(path.name)
        if fault == "later-corpus" and reads.count("corpus-v1.json") == 2:
            raise OSError("synthetic-corpus-failure")
        return BenchmarkCorpus("synthetic", ("case-a", "case-b"), (), {})

    monkeypatch.setattr(quality, "_read_mapping", read_mapping)
    monkeypatch.setattr(quality, "load_corpus", load_corpus)
    if fault is None:
        results = {
            candidate_id: _expected_quality(candidate_id)
            for candidate_id in ("candidate-a", "candidate-b")
        }
        assert aggregate_scores("c" * 32, raw_root=tmp_path) == {
            "status": "pass",
            "sessionId": "c" * 32,
            "evaluatorCount": 3,
            "eligibleForPromotion": True,
            "candidates": results,
        }
        assert json.loads((session / "quality.aggregate.json").read_text(encoding="utf-8")) == {
            "sessionVersion": "tts-quality-session-v1",
            "sessionId": "c" * 32,
            "eligibleForPromotion": True,
            "candidates": results,
        }
    else:
        code = "invalid-metadata" if fault == "later-candidate" else fault
        error_type = OSError if fault == "later-corpus" else QualitySessionError
        message = (
            "synthetic-corpus-failure"
            if fault == "later-corpus"
            else f"tts-benchmark-quality:{code}"
        )
        with pytest.raises(error_type, match=f"^{message}$"):
            aggregate_scores("c" * 32, raw_root=tmp_path)
        assert not (session / "quality.aggregate.json").exists()
    assert reads == [
        "session.json",
        "evaluator-01.completed.json",
        "evaluator-02.completed.json",
        "evaluator-03.completed.json",
        "evaluator-01.correction.json",
        "randomization-key.json",
    ] + ["corpus-v1.json"] * (1 if fault in {"later-candidate", "missing-dimension"} else 2)
