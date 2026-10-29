"""Deterministic tests for process-attributed benchmark memory accounting."""

from __future__ import annotations

import ctypes
from dataclasses import dataclass
from unittest.mock import Mock

import pytest

from benchmarks.memory import (
    CpuOnlyVramSampler,
    FrameworkVramTracker,
    ProcessResourceSample,
    ProcessTreeMemoryProbe,
    WindowsGpuProcessMemorySampler,
    WindowsProcessResourceSampler,
    _load_windows_dll,
)


@pytest.mark.parametrize("failure", ["open", "read"])
@pytest.mark.parametrize("single", [False, True])
def test_vca03_failed_windows_inspection_cannot_be_zero(
    failure: str,
    single: bool,
) -> None:
    sampler = object.__new__(WindowsProcessResourceSampler)
    kernel = Mock()
    kernel.OpenProcess.return_value = 0 if failure == "open" else 123
    kernel.WaitForSingleObject.return_value = 258  # live, not signalled
    api = Mock()
    api.GetProcessMemoryInfo.return_value = 0
    sampler._kernel32 = kernel
    sampler._psapi = api
    inspect = sampler.process_working_set_bytes if single else sampler._working_set_bytes
    with pytest.raises(RuntimeError, match="ram-unavailable"):
        inspect(42)
    assert kernel.CloseHandle.call_count == (0 if failure == "open" else 1)


def test_vca03_live_inspection_failure_reaches_sampling_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    sampler = object.__new__(WindowsProcessResourceSampler)
    kernel = Mock()
    kernel.OpenProcess.return_value = 0
    sampler._kernel32 = kernel
    sampler._vram_sampler = CpuOnlyVramSampler()
    children: dict[int, int] = {}
    monkeypatch.setattr(sampler, "_parent_by_pid", lambda: children)
    probe = ProcessTreeMemoryProbe(root_pid=123, sampler=sampler, require_vram=False)
    probe.start()  # An actually empty baseline remains valid.
    children[456] = 123
    with pytest.raises(RuntimeError, match="sampling-failed"):
        probe.stop()


def test_vca03_proven_exited_process_is_zero_and_closes_handle() -> None:
    sampler = object.__new__(WindowsProcessResourceSampler)
    kernel = Mock()
    kernel.OpenProcess.return_value = 123
    kernel.WaitForSingleObject.return_value = 0
    api = Mock()
    api.GetProcessMemoryInfo.return_value = 0
    sampler._kernel32 = kernel
    sampler._psapi = api
    assert sampler.process_working_set_bytes(42) == 0
    kernel.CloseHandle.assert_called_once_with(123)


def test_windows_dll_loader_fails_closed_when_unavailable(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delattr(ctypes, "WinDLL", raising=False)
    with pytest.raises(
        RuntimeError,
        match=r"^tts-benchmark-memory:windows-required$",
    ):
        _load_windows_dll("pdh")


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
    assert result.ram_sampling_interval_milliseconds == 50
    assert result.process_vram_sampling_interval_milliseconds is None
    assert result.vram_measurement_method == "unavailable-cpu-role"
    assert result.peak_process_tree_ram_bytes == 1_500_000_000
    assert result.peak_process_vram_bytes is None
    assert result.peak_framework_vram_bytes is None
    assert result.peak_vram_bytes is None
    assert result.gpu_provider_allocations == 0


def test_process_probe_requires_reliable_vram_for_balanced_role() -> None:
    probe = ProcessTreeMemoryProbe(
        root_pid=123,
        sampler=SequenceSampler([ProcessResourceSample(0, None, 0)]),
        require_vram=True,
        process_vram_sampling_interval_milliseconds=1_000,
        framework_vram_tracker=FrameworkVramTracker(),
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
    tracker = FrameworkVramTracker()
    probe = ProcessTreeMemoryProbe(
        root_pid=123,
        sampler=sampler,
        require_vram=True,
        process_vram_sampling_interval_milliseconds=1_000,
        framework_vram_tracker=tracker,
    )
    probe.start()
    tracker.observe(800)
    result = probe.stop()
    assert result.peak_process_tree_ram_bytes == 500
    assert result.peak_process_vram_bytes == 700
    assert result.peak_framework_vram_bytes == 800
    assert result.peak_vram_bytes == 800
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


def test_process_tree_ids_includes_owner_and_transitive_descendants(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    sampler = object.__new__(WindowsProcessResourceSampler)
    monkeypatch.setattr(
        sampler,
        "_parent_by_pid",
        lambda: {10: 1, 11: 10, 12: 11, 13: 1},
    )
    assert sampler.process_tree_ids(10) == frozenset((10, 11, 12))


def test_wddm_counter_aggregation_sums_adapter_instances_by_numeric_pid() -> None:
    assert WindowsGpuProcessMemorySampler._aggregate(
        (
            ("pid_123_luid_0x1_0x2_phys_0", 0, 100),
            ("pid_123_luid_0x1_0x3_phys_1", 0, 200),
            ("pid_456_luid_0x1_0x2_phys_0", 0, 400),
            ("pid_private_luid_0x1_0x2_phys_0", 0, 999),
            ("pid_123_luid_0x1_0x2_phys_0", 1, 999),
        )
    ) == {123: 300, 456: 400}


def test_balanced_probe_requires_both_positive_vram_signals() -> None:
    tracker = FrameworkVramTracker()
    probe = ProcessTreeMemoryProbe(
        root_pid=123,
        sampler=SequenceSampler(
            [
                ProcessResourceSample(0, 0, 0),
                ProcessResourceSample(10, 500, 1),
            ]
        ),
        require_vram=True,
        process_vram_sampling_interval_milliseconds=1_000,
        framework_vram_tracker=tracker,
    )
    probe.start()
    tracker.observe(0)
    with pytest.raises(
        RuntimeError,
        match=r"^tts-benchmark-memory:vram-unavailable$",
    ):
        probe.stop()
