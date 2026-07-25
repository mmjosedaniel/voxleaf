"""Exact benchmark arithmetic over integer nanoseconds and sample frames."""

from __future__ import annotations

import math
from collections.abc import Sequence
from dataclasses import dataclass
from decimal import Decimal
from typing import Final

NANOSECONDS_PER_SECOND: Final = 1_000_000_000


class MetricError(ValueError):
    """Content-free metric failure with one fixed code."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-metric:{code}")
        self.code = code


@dataclass(frozen=True)
class Distribution:
    count: int
    p50: float
    p95: float
    maximum: float


def nanoseconds_to_seconds(value: int) -> float:
    if value < 0:
        raise MetricError("negative-nanoseconds")
    return float(Decimal(value) / Decimal(NANOSECONDS_PER_SECOND))


def media_duration_seconds(sample_count: int, sample_rate_hz: int) -> float:
    if sample_count <= 0 or sample_rate_hz <= 0:
        raise MetricError("invalid-media-shape")
    return float(Decimal(sample_count) / Decimal(sample_rate_hz))


def real_time_factor(wall_ns: int, sample_count: int, sample_rate_hz: int) -> float:
    if wall_ns <= 0:
        raise MetricError("invalid-wall-time")
    duration = Decimal(sample_count) / Decimal(sample_rate_hz)
    return float((Decimal(wall_ns) / Decimal(NANOSECONDS_PER_SECOND)) / duration)


def nearest_rank(values: Sequence[float], percentile: float) -> float:
    if not values:
        raise MetricError("empty-distribution")
    if not 0 < percentile <= 1:
        raise MetricError("invalid-percentile")
    ordered = sorted(values)
    return ordered[math.ceil(percentile * len(ordered)) - 1]


def distribution(values: Sequence[float]) -> Distribution:
    if not values:
        raise MetricError("empty-distribution")
    return Distribution(
        count=len(values),
        p50=nearest_rank(values, 0.50),
        p95=nearest_rank(values, 0.95),
        maximum=max(values),
    )
