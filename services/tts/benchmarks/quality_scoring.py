"""Pure per-candidate scoring for blinded TTS quality review."""

from __future__ import annotations

import math
import statistics
from collections.abc import Mapping, Sequence
from typing import Final, cast

DIMENSIONS: Final = (
    "intelligibility",
    "spanishPronunciation",
    "punctuationDialogue",
    "numericExpressions",
    "foreignNames",
    "naturalness",
    "artifactFreedom",
)


class QualitySessionError(RuntimeError):
    """Fixed content-free quality-session failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-quality:{code}")
        self.code = code


QualitySessionError.__module__ = "benchmarks.quality"


def _score(value: object) -> int | str:
    if value == "not-applicable":
        return "not-applicable"
    if isinstance(value, int) and not isinstance(value, bool) and 1 <= value <= 5:
        return value
    raise QualitySessionError("invalid-scorecard")


def _aggregate_candidate_scores(
    candidate_id: str,
    ordered_case_ids: Sequence[str],
    by_sample: Mapping[str, tuple[str, str]],
    cards: Sequence[Mapping[str, object]],
    corrected_defects: set[tuple[str, str]],
) -> dict[str, object]:
    dimension_values: dict[str, list[float]] = {dimension: [] for dimension in DIMENSIONS}
    defects = 0
    for case_id in ordered_case_ids:
        matching_sample = next(
            (
                sample_id
                for sample_id, identity in by_sample.items()
                if identity == (candidate_id, case_id)
            ),
            None,
        )
        if matching_sample is None:
            raise QualitySessionError("invalid-metadata")
        per_dimension: dict[str, list[int]] = {dimension: [] for dimension in DIMENSIONS}
        for card in cards:
            samples = cast(list[object], card.get("samples"))
            raw_sample = next(
                (
                    item
                    for item in samples
                    if isinstance(item, dict) and item.get("sampleId") == matching_sample
                ),
                None,
            )
            if not isinstance(raw_sample, dict):
                raise QualitySessionError("invalid-scorecard")
            sample = cast(dict[str, object], raw_sample)
            scores = cast(dict[str, object], sample["scores"])
            for dimension in DIMENSIONS:
                value = _score(scores[dimension])
                if isinstance(value, int):
                    per_dimension[dimension].append(value)
            evaluator_id = card.get("evaluatorId")
            defects += int(
                sample["meaningChangingDefect"] is True
                and (cast(str, evaluator_id), case_id) not in corrected_defects
            )
        for dimension in DIMENSIONS:
            if per_dimension[dimension]:
                dimension_values[dimension].append(
                    float(statistics.median(per_dimension[dimension]))
                )
    if any(not values for values in dimension_values.values()):
        raise QualitySessionError("missing-dimension")
    dimensions = {
        dimension: sum(values) / len(values) for dimension, values in dimension_values.items()
    }
    overall = sum(dimensions.values()) / len(dimensions)
    if not math.isfinite(overall):
        raise QualitySessionError("invalid-scorecard")
    return {
        "evaluatorCount": len(cards),
        "blindOrder": True,
        "scale": "1-5",
        "overallMean": overall,
        "dimensions": dimensions,
        "meaningChangingDefects": defects,
        "limitations": [
            "small-panel",
            "spanish-only",
            "fixed-voices-only",
            "synthetic-corpus-only",
            "not-accessibility-certification",
        ],
    }
