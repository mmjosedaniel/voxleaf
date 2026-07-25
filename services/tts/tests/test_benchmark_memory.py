"""Deterministic tests for process-attributed benchmark memory accounting."""

from __future__ import annotations

from dataclasses import dataclass

import pytest

from benchmarks.memory import (
    ProcessResourceSample,
    ProcessTreeMemoryProbe,
    WindowsProcessResourceSampler,
)


@dataclass
class SequenceSampler:
    samples: list[ProcessResourceSample]

    def sample(self, root_pid: int) -> ProcessResourceSample:
        assert root_pid == 123
        if len(self.samples) == 1:
            return self.samples[0]
        return self.samples.pop(0)


def test_process_probe_subtracts_baselines_and_preserves_cpu_vram_unavailable() -> None:
    sampler = SequenceSampler(
        [
            ProcessResourceSample(0, None, 0),
            ProcessResourceSample(1_500_000_000, None, 0),
        ]
    )
    probe = ProcessTreeMemoryProbe(root_pid=123, sampler=sampler, require_vram=False)
    probe.start()
    result = probe.stop()
    assert result.sampling_interval_milliseconds == 50
    assert result.peak_process_tree_ram_bytes == 1_500_000_000
    assert result.peak_vram_bytes is None
    assert result.gpu_provider_allocations == 0


def test_process_probe_requires_reliable_vram_for_balanced_role() -> None:
    probe = ProcessTreeMemoryProbe(
        root_pid=123,
        sampler=SequenceSampler([ProcessResourceSample(0, None, 0)]),
        require_vram=True,
    )
    with pytest.raises(
        RuntimeError,
        match=r"^tts-benchmark-memory:vram-unavailable$",
    ):
        probe.start()


def test_process_probe_reports_peak_deltas_and_allocating_gpu_processes() -> None:
    sampler = SequenceSampler(
        [
            ProcessResourceSample(100, 200, 0),
            ProcessResourceSample(600, 900, 2),
        ]
    )
    probe = ProcessTreeMemoryProbe(root_pid=123, sampler=sampler, require_vram=True)
    probe.start()
    result = probe.stop()
    assert result.peak_process_tree_ram_bytes == 500
    assert result.peak_vram_bytes == 700
    assert result.gpu_provider_allocations == 2


def test_descendant_resolution_is_transitive_and_excludes_owner() -> None:
    assert WindowsProcessResourceSampler._descendants(
        10,
        {
            10: 1,
            11: 10,
            12: 11,
            13: 1,
            14: 12,
        },
    ) == frozenset((11, 12, 14))
