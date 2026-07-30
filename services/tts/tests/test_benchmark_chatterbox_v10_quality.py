"""Model-free checks for the Chatterbox CUDA v10 private quality workflow."""

from __future__ import annotations

import re

import pytest

from benchmarks.chatterbox_v10_quality import (
    ChatterboxV10QualityError,
    _render_html,
    _session,
)
from benchmarks.v10_authority import CANDIDATE_ID


def test_evaluator_keeps_the_candidate_decision_pending() -> None:
    rendered = _render_html(
        candidate_id=CANDIDATE_ID,
        session_id="a" * 32,
        samples=(
            {
                "sampleId": "b" * 32,
                "caseId": "es-case",
                "language": "es",
                "text": "Texto sintético.",
            },
            {
                "sampleId": "c" * 32,
                "caseId": "en-case",
                "language": "en",
                "text": "Synthetic text.",
            },
        ),
    )
    assert "measures\nevidence only; it does not accept or reject the model" in rendered
    assert "tts-bilingual-quality-scorecard-v10" in rendered
    assert rendered.count("<audio ") == 2
    assert re.search(r"v10-quality-result-\$\{card\.sessionId\}", rendered)


def test_quality_session_rejects_path_substitution() -> None:
    with pytest.raises(ChatterboxV10QualityError, match="session"):
        _session(CANDIDATE_ID, "../private")
