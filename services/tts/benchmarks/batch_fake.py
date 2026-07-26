"""Deterministic candidate scenarios for model-free v4 batch tests."""

from __future__ import annotations

from dataclasses import replace
from typing import Literal

from benchmarks.batch_contracts import (
    BatchAudioUnit,
    BatchBenchmarkError,
    BatchGenerationRequest,
    BatchResourceSnapshot,
)

type FakeBatchScenario = Literal[
    "ordered",
    "swapped-output",
    "one-item-failure",
    "timeout",
    "stale-identity",
    "cancellation",
    "out-of-memory",
    "cleanup-failure",
]


class FakeBatchClock:
    def __init__(self) -> None:
        self._now = 0

    def now_ns(self) -> int:
        return self._now

    def advance(self, nanoseconds: int) -> None:
        if nanoseconds < 0:
            raise ValueError("tts-benchmark-v4-fake:negative-time")
        self._now += nanoseconds


class FakeBatchResourceProbe:
    def __init__(self) -> None:
        self._sample = 0

    def snapshot(self) -> BatchResourceSnapshot:
        self._sample += 1
        return BatchResourceSnapshot(
            process_tree_ram_bytes=1_000_000_000 + self._sample,
            process_dedicated_vram_bytes=2_000_000_000 + self._sample,
            framework_reserved_vram_bytes=1_900_000_000 + self._sample,
            free_dedicated_vram_bytes=6_000_000_000 - self._sample,
            shared_gpu_memory_bytes=0,
        )


class DeterministicBatchCandidate:
    def __init__(
        self,
        clock: FakeBatchClock,
        *,
        scenario: FakeBatchScenario = "ordered",
    ) -> None:
        self.clock = clock
        self.scenario = scenario
        self.closed = False
        self.calls = 0

    def generate_batch(
        self,
        request: BatchGenerationRequest,
    ) -> tuple[BatchAudioUnit, ...]:
        if self.closed:
            raise BatchBenchmarkError("generation-failed")
        self.calls += 1
        self.clock.advance(5_000_000_000)
        if self.scenario == "timeout":
            raise BatchBenchmarkError("timeout")
        if self.scenario == "one-item-failure":
            raise BatchBenchmarkError("generation-failed")
        if self.scenario == "cancellation":
            raise BatchBenchmarkError("cancelled")
        if self.scenario == "out-of-memory":
            raise BatchBenchmarkError("out-of-memory")
        outputs = tuple(
            BatchAudioUnit(
                identity=request.identity,
                call_index=request.call_index,
                unit_id=unit.unit_id,
                source_sequence=unit.source_sequence,
                batch_position=position,
                sample_count=240_000,
                sample_rate_hz=24_000,
                channels=1,
                sample_format="float32",
            )
            for position, unit in enumerate(request.units)
        )
        if self.scenario == "swapped-output":
            return tuple(reversed(outputs))
        if self.scenario == "stale-identity":
            stale = replace(
                outputs[0],
                identity=replace(request.identity, generation_id="stale"),
            )
            return (stale, *outputs[1:])
        return outputs

    def close(self) -> None:
        self.closed = True
        if self.scenario == "cleanup-failure":
            raise BatchBenchmarkError("cleanup-failed")
