"""Model-free tests for the bounded CustomVoice Spanish speaker screen."""

from __future__ import annotations

import json
from pathlib import Path
from typing import cast

import pytest

from benchmarks.customvoice_screen import (
    CANDIDATE_ID,
    ScreenError,
    ScreenRequest,
    cleanup_screen,
    generate_screen,
    submit_and_select,
)

SPEAKERS = (
    "Vivian",
    "Serena",
    "Uncle_Fu",
    "Dylan",
    "Eric",
    "Ryan",
    "Aiden",
    "Ono_Anna",
    "Sohee",
)


class FakeScreenAdapter:
    def __init__(self) -> None:
        self.loaded = False
        self.closed = False

    def load(self) -> None:
        self.loaded = True

    def supported_speakers(self) -> tuple[str, ...]:
        assert self.loaded
        return SPEAKERS

    def synthesize(self, text: str, speaker: str) -> tuple[list[float], int]:
        assert self.loaded
        assert text
        assert speaker in SPEAKERS
        return [0.0, 0.25, -0.25], 24_000

    def close(self) -> None:
        self.closed = True


def _request(tmp_path: Path) -> ScreenRequest:
    return ScreenRequest(
        artifact_root=tmp_path / "private-model",
        candidate_python=tmp_path / "private-python.exe",
        expected_commit_sha="a" * 40,
        sleep_disabled=True,
        background_load_acceptable=True,
        thermal_state_acceptable=True,
    )


def _fake_wave(path: Path, waveform: object, sample_rate_hz: int) -> None:
    assert waveform == [0.0, 0.25, -0.25]
    assert sample_rate_hz == 24_000
    path.write_bytes(b"RIFF-fake")


def _generate(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    session_id: str,
) -> Path:
    from benchmarks import customvoice_screen

    monkeypatch.setattr(
        customvoice_screen,
        "_screen_preflight",
        lambda request: customvoice_screen._candidate_profile(),
    )
    monkeypatch.setattr(customvoice_screen, "_write_wave", _fake_wave)
    sample_ids = iter(f"{index:032x}" for index in range(1, 28))
    adapter = FakeScreenAdapter()
    raw_root = tmp_path / "raw"
    result = generate_screen(
        _request(tmp_path),
        session_id,
        raw_root=raw_root,
        adapter_builder=lambda profile, root: adapter,
        id_factory=lambda: next(sample_ids),
        shuffle=lambda values: values.reverse(),
    )
    assert result == {"status": "pass", "sessionId": session_id, "sampleCount": 27}
    assert adapter.closed is True
    return raw_root / "customvoice-spanish-screen-v2" / session_id


def test_generation_is_complete_blinded_bounded_and_disposable(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session_id = "1" * 32
    session = _generate(tmp_path, monkeypatch, session_id)

    assert not (session / "staging").exists()
    assert len(tuple((session / "audio").glob("*.wav"))) == 27
    page = (session / "evaluate.html").read_text(encoding="utf-8")
    assert all(speaker not in page for speaker in SPEAKERS)
    corpus = json.loads(
        (Path(__file__).resolve().parents[3] / "benchmarks" / "tts" / "corpus-v1.json").read_text(
            encoding="utf-8"
        )
    )
    assert all(case["text"] not in page for case in corpus["cases"])
    assert all(case["privacyCanary"] not in page for case in corpus["cases"])
    assert str(_request(tmp_path).artifact_root) not in page
    assert "Expresiones numéricas" in page
    assert "Puntuación y diálogo" in page
    template = json.loads((session / "scorecard.template.json").read_text(encoding="utf-8"))
    scores_by_case = {sample["caseId"]: set(sample["scores"]) for sample in template["samples"]}
    assert "numericExpressions" in scores_by_case["es-currency-percent-short"]
    assert "numericExpressions" not in scores_by_case["es-narrative-target"]
    assert "punctuationDialogue" in scores_by_case["es-narrative-target"]
    assert "punctuationDialogue" not in scores_by_case["es-currency-percent-short"]

    cleanup_screen(session_id, raw_root=tmp_path / "raw")
    assert not session.exists()


def test_complete_scores_apply_frozen_eligibility_and_ranking(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session_id = "2" * 32
    session = _generate(tmp_path, monkeypatch, session_id)
    key = json.loads((session / "randomization-key.json").read_text(encoding="utf-8"))
    speaker_by_sample = {sample["sampleId"]: sample["speakerId"] for sample in key["samples"]}
    scorecard = json.loads((session / "scorecard.template.json").read_text(encoding="utf-8"))
    for sample in scorecard["samples"]:
        value = 5 if speaker_by_sample[sample["sampleId"]] == "Serena" else 4
        sample["scores"] = {dimension: value for dimension in sample["scores"]}
        sample["meaningChangingDefect"] = False

    result = submit_and_select(session_id, cast(object, scorecard), raw_root=tmp_path / "raw")

    assert result["candidateId"] == CANDIDATE_ID
    assert result["selectedSpeaker"] == "Serena"
    speakers = cast(list[dict[str, object]], result["speakers"])
    assert len(speakers) == 9
    assert all(item["eligible"] is True for item in speakers)
    assert all("sampleId" not in json.dumps(item) for item in speakers)


def test_partial_scores_and_invalid_session_paths_are_rejected(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session_id = "3" * 32
    session = _generate(tmp_path, monkeypatch, session_id)
    scorecard = json.loads((session / "scorecard.template.json").read_text(encoding="utf-8"))
    scorecard["samples"].pop()
    with pytest.raises(ScreenError, match=r"^tts-customvoice-screen:scorecard$"):
        submit_and_select(session_id, cast(object, scorecard), raw_root=tmp_path / "raw")
    with pytest.raises(ScreenError, match=r"^tts-customvoice-screen:session$"):
        cleanup_screen("../private", raw_root=tmp_path / "raw")
