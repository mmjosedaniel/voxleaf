"""Deterministic fake adapter for model-free benchmark validation."""

from __future__ import annotations

from collections.abc import Iterator
from dataclasses import dataclass
from typing import Final

from benchmarks.contracts import (
    AdapterCapabilities,
    AudioChunk,
    CancellationResponse,
    GenerationRequest,
    MemoryObservation,
)

SAMPLE_RATE_HZ: Final = 44_100


class FakeNanosecondClock:
    """Manual monotonic clock; deterministic tests never sleep."""

    def __init__(self) -> None:
        self._now_ns = 0

    def now_ns(self) -> int:
        return self._now_ns

    def advance(self, nanoseconds: int) -> None:
        if nanoseconds < 0:
            raise ValueError("tts-benchmark-fake:negative-advance")
        self._now_ns += nanoseconds


@dataclass
class FakeMemoryProbe:
    """Fixed numeric-only memory observation."""

    peak_process_tree_ram_bytes: int = 1_073_741_824
    peak_vram_bytes: int | None = None
    gpu_provider_allocations: int = 0
    _active: bool = False

    def start(self) -> None:
        if self._active:
            raise RuntimeError("tts-benchmark-fake:memory-active")
        self._active = True

    def stop(self) -> MemoryObservation:
        if not self._active:
            raise RuntimeError("tts-benchmark-fake:memory-inactive")
        self._active = False
        return MemoryObservation(
            ram_sampling_interval_milliseconds=50,
            process_vram_sampling_interval_milliseconds=(
                1_000 if self.peak_vram_bytes is not None else None
            ),
            vram_measurement_method=(
                "wddm-dedicated-plus-pytorch-reserved"
                if self.peak_vram_bytes is not None
                else "unavailable-cpu-role"
            ),
            peak_process_tree_ram_bytes=self.peak_process_tree_ram_bytes,
            peak_process_vram_bytes=self.peak_vram_bytes,
            peak_framework_vram_bytes=self.peak_vram_bytes,
            peak_vram_bytes=self.peak_vram_bytes,
            gpu_provider_allocations=self.gpu_provider_allocations,
        )


class _FakeGeneration(Iterator[AudioChunk]):
    def __init__(
        self,
        *,
        owner: DeterministicFakeAdapter,
        request: GenerationRequest,
        chunk_count: int,
        sample_count: int,
        advance_ns: int,
    ) -> None:
        self._owner = owner
        self._request = request
        self._chunk_count = chunk_count
        self._sample_count = sample_count
        self._advance_ns = advance_ns
        self._next_sequence = 0

    def __iter__(self) -> _FakeGeneration:
        return self

    def __next__(self) -> AudioChunk:
        if self._request.request_id in self._owner.cancelled_request_ids:
            self._owner.finish_request(self._request.request_id)
            raise StopIteration
        if self._next_sequence >= self._chunk_count:
            self._owner.finish_request(self._request.request_id)
            raise StopIteration

        self._owner.clock.advance(self._advance_ns)
        sequence = self._next_sequence
        self._next_sequence += 1
        end_of_output = self._next_sequence == self._chunk_count
        if end_of_output:
            self._owner.finish_request(self._request.request_id)
        return AudioChunk(
            request_id=self._request.request_id,
            sequence=sequence,
            sample_count=self._sample_count,
            sample_rate_hz=self._owner.sample_rate_hz,
            channels=1,
            sample_format="float32",
            end_of_output=end_of_output,
        )


class DeterministicFakeAdapter:
    """Exact fake covering streaming, cancellation, diagnostics, and cleanup."""

    candidate_id: Final = "fixture-candidate-v1"

    def __init__(
        self,
        clock: FakeNanosecondClock,
        *,
        emit_sensitive_diagnostic: bool = False,
        fail_generation: bool = False,
        sample_count_override: int | None = None,
        sample_rate_hz: int = SAMPLE_RATE_HZ,
    ) -> None:
        self.clock = clock
        self.emit_sensitive_diagnostic = emit_sensitive_diagnostic
        self.fail_generation = fail_generation
        self.sample_count_override = sample_count_override
        self.sample_rate_hz = sample_rate_hz
        self.cancelled_request_ids: set[str] = set()
        self.active_request_ids: set[str] = set()
        self.loaded = False
        self.closed = False

    def capabilities(self) -> AdapterCapabilities:
        return AdapterCapabilities(
            candidate_id=self.candidate_id,
            streaming_granularity="sample-chunks",
            sample_format="float32",
            generation_cancellation="cooperative",
        )

    def load(self) -> None:
        if self.closed:
            raise RuntimeError("closed")
        self.clock.advance(1_000_000_000)
        self.loaded = True

    def warm_up(self, request: GenerationRequest) -> None:
        for _ in self.generate(request):
            pass

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        if not self.loaded or self.closed or request.request_id in self.active_request_ids:
            raise RuntimeError("unavailable")
        if self.emit_sensitive_diagnostic:
            print(request.text)
        if self.fail_generation:
            raise RuntimeError(request.text)

        self.active_request_ids.add(request.request_id)
        if request.phase in ("warmup", "warm"):
            chunk_count = 2
            sample_count = self.sample_rate_hz * 5
            advance_ns = 500_000_000
        elif request.phase == "sustained":
            chunk_count = 3
            sample_count = self.sample_rate_hz * 5
            advance_ns = 500_000_000
        else:
            chunk_count = 10
            sample_count = self.sample_rate_hz
            advance_ns = 50_000_000
        if self.sample_count_override is not None:
            sample_count = self.sample_count_override
        return _FakeGeneration(
            owner=self,
            request=request,
            chunk_count=chunk_count,
            sample_count=sample_count,
            advance_ns=advance_ns,
        )

    def cancel(self, request_id: str) -> CancellationResponse:
        self.clock.advance(100_000_000)
        self.cancelled_request_ids.add(request_id)
        self.finish_request(request_id)
        return CancellationResponse(acknowledged=True, stop_mode="cooperative")

    def framework_memory_high_water_bytes(self) -> None:
        return None

    def finish_request(self, request_id: str) -> None:
        self.active_request_ids.discard(request_id)

    def close(self) -> None:
        self.cancelled_request_ids.update(self.active_request_ids)
        self.active_request_ids.clear()
        self.clock.advance(200_000_000)
        self.loaded = False
        self.closed = True
