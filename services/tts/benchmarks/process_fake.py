"""Spawn-safe fake adapters for process-isolation tests."""

from __future__ import annotations

import threading
from collections.abc import Iterator

from benchmarks.contracts import (
    AdapterCapabilities,
    AudioChunk,
    CancellationResponse,
    GenerationRequest,
)


class ProcessFakeAdapter:
    """Small streaming adapter whose state exists only inside the child."""

    def __init__(
        self,
        *,
        block_generation: bool = False,
        emit_late_chunk: bool = False,
        sample_count: int = 44_100,
    ) -> None:
        self._loaded = False
        self._block_generation = block_generation
        self._emit_late_chunk = emit_late_chunk
        self._sample_count = sample_count

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            candidate_id="process-fake-v1",
            streaming_granularity="sample-chunks",
            sample_format="float32",
            generation_cancellation="worker-termination",
        )

    def load(self) -> None:
        self._loaded = True

    def warm_up(self, request: GenerationRequest) -> None:
        del request
        if not self._loaded:
            raise RuntimeError("unavailable")

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        if not self._loaded:
            raise RuntimeError("unavailable")
        if self._block_generation:
            threading.Event().wait()
        yield AudioChunk(
            request_id=request.request_id,
            sequence=0,
            sample_count=self._sample_count,
            sample_rate_hz=44_100,
            channels=1,
            sample_format="float32",
            end_of_output=not self._emit_late_chunk,
        )
        if self._emit_late_chunk:
            yield AudioChunk(
                request_id=request.request_id,
                sequence=1,
                sample_count=44_100,
                sample_rate_hz=44_100,
                channels=1,
                sample_format="float32",
                end_of_output=True,
            )

    def cancel(self, request_id: str) -> CancellationResponse:
        del request_id
        return CancellationResponse(acknowledged=False, stop_mode=None)

    def close(self) -> None:
        self._loaded = False


class ProcessFakeFactory:
    def __init__(
        self,
        *,
        block_generation: bool = False,
        emit_late_chunk: bool = False,
        sample_count: int = 44_100,
    ) -> None:
        self._block_generation = block_generation
        self._emit_late_chunk = emit_late_chunk
        self._sample_count = sample_count

    def __call__(self) -> ProcessFakeAdapter:
        return ProcessFakeAdapter(
            block_generation=self._block_generation,
            emit_late_chunk=self._emit_late_chunk,
            sample_count=self._sample_count,
        )
