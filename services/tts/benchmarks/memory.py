"""Process-attributed memory sampling for native Windows benchmark runs."""

from __future__ import annotations

import ctypes
import os
import threading
from ctypes import wintypes
from dataclasses import dataclass
from typing import Final, Protocol

from benchmarks.contracts import MemoryObservation

SAMPLING_INTERVAL_MILLISECONDS: Final = 50
_TH32CS_SNAPPROCESS: Final = 0x00000002
_PROCESS_QUERY_INFORMATION: Final = 0x0400
_PROCESS_QUERY_LIMITED_INFORMATION: Final = 0x1000
_PROCESS_VM_READ: Final = 0x0010
_MAX_PATH: Final = 260


class _ProcessEntry32W(ctypes.Structure):
    _fields_ = (
        ("dwSize", wintypes.DWORD),
        ("cntUsage", wintypes.DWORD),
        ("th32ProcessID", wintypes.DWORD),
        ("th32DefaultHeapID", ctypes.c_size_t),
        ("th32ModuleID", wintypes.DWORD),
        ("cntThreads", wintypes.DWORD),
        ("th32ParentProcessID", wintypes.DWORD),
        ("pcPriClassBase", wintypes.LONG),
        ("dwFlags", wintypes.DWORD),
        ("szExeFile", wintypes.WCHAR * _MAX_PATH),
    )


class _ProcessMemoryCountersEx(ctypes.Structure):
    _fields_ = (
        ("cb", wintypes.DWORD),
        ("PageFaultCount", wintypes.DWORD),
        ("PeakWorkingSetSize", ctypes.c_size_t),
        ("WorkingSetSize", ctypes.c_size_t),
        ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
        ("QuotaPagedPoolUsage", ctypes.c_size_t),
        ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
        ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
        ("PagefileUsage", ctypes.c_size_t),
        ("PeakPagefileUsage", ctypes.c_size_t),
        ("PrivateUsage", ctypes.c_size_t),
    )


@dataclass(frozen=True)
class ProcessResourceSample:
    process_tree_ram_bytes: int
    process_tree_vram_bytes: int | None
    gpu_provider_allocations: int


class ProcessResourceSampler(Protocol):
    def sample(self, root_pid: int) -> ProcessResourceSample:
        """Return numeric resources for descendants of one known owner PID."""


class ProcessVramSampler(Protocol):
    def sample(self, process_ids: frozenset[int]) -> tuple[int | None, int]:
        """Return process-attributed VRAM and the number of allocating PIDs."""


class CpuOnlyVramSampler:
    def sample(self, process_ids: frozenset[int]) -> tuple[None, int]:
        del process_ids
        return None, 0


class WindowsProcessResourceSampler:
    """Read only PID relationships, working sets, and injected VRAM counters."""

    def __init__(self, *, vram_sampler: ProcessVramSampler | None = None) -> None:
        if os.name != "nt":
            raise RuntimeError("tts-benchmark-memory:windows-required")
        self._kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        self._psapi = ctypes.WinDLL("psapi", use_last_error=True)
        self._kernel32.CreateToolhelp32Snapshot.argtypes = (wintypes.DWORD, wintypes.DWORD)
        self._kernel32.CreateToolhelp32Snapshot.restype = wintypes.HANDLE
        self._kernel32.Process32FirstW.argtypes = (
            wintypes.HANDLE,
            ctypes.POINTER(_ProcessEntry32W),
        )
        self._kernel32.Process32FirstW.restype = wintypes.BOOL
        self._kernel32.Process32NextW.argtypes = (
            wintypes.HANDLE,
            ctypes.POINTER(_ProcessEntry32W),
        )
        self._kernel32.Process32NextW.restype = wintypes.BOOL
        self._kernel32.OpenProcess.argtypes = (
            wintypes.DWORD,
            wintypes.BOOL,
            wintypes.DWORD,
        )
        self._kernel32.OpenProcess.restype = wintypes.HANDLE
        self._kernel32.CloseHandle.argtypes = (wintypes.HANDLE,)
        self._kernel32.CloseHandle.restype = wintypes.BOOL
        self._psapi.GetProcessMemoryInfo.argtypes = (
            wintypes.HANDLE,
            ctypes.POINTER(_ProcessMemoryCountersEx),
            wintypes.DWORD,
        )
        self._psapi.GetProcessMemoryInfo.restype = wintypes.BOOL
        self._vram_sampler = vram_sampler or CpuOnlyVramSampler()

    def _parent_by_pid(self) -> dict[int, int]:
        snapshot = self._kernel32.CreateToolhelp32Snapshot(_TH32CS_SNAPPROCESS, 0)
        invalid_handle = ctypes.c_void_p(-1).value
        if snapshot in (None, invalid_handle):
            raise RuntimeError("tts-benchmark-memory:process-snapshot")
        parents: dict[int, int] = {}
        entry = _ProcessEntry32W()
        entry.dwSize = ctypes.sizeof(_ProcessEntry32W)
        try:
            available = bool(self._kernel32.Process32FirstW(snapshot, ctypes.byref(entry)))
            while available:
                parents[int(entry.th32ProcessID)] = int(entry.th32ParentProcessID)
                available = bool(self._kernel32.Process32NextW(snapshot, ctypes.byref(entry)))
        finally:
            self._kernel32.CloseHandle(snapshot)
        return parents

    @staticmethod
    def _descendants(root_pid: int, parent_by_pid: dict[int, int]) -> frozenset[int]:
        descendants: set[int] = set()
        changed = True
        while changed:
            changed = False
            for pid, parent_pid in parent_by_pid.items():
                if pid in descendants or (parent_pid != root_pid and parent_pid not in descendants):
                    continue
                descendants.add(pid)
                changed = True
        return frozenset(descendants)

    def _working_set_bytes(self, pid: int) -> int:
        access = _PROCESS_QUERY_INFORMATION | _PROCESS_QUERY_LIMITED_INFORMATION | _PROCESS_VM_READ
        process = self._kernel32.OpenProcess(access, False, pid)
        if not process:
            return 0
        counters = _ProcessMemoryCountersEx()
        counters.cb = ctypes.sizeof(_ProcessMemoryCountersEx)
        try:
            succeeded = bool(
                self._psapi.GetProcessMemoryInfo(
                    process,
                    ctypes.byref(counters),
                    counters.cb,
                )
            )
            return int(counters.WorkingSetSize) if succeeded else 0
        finally:
            self._kernel32.CloseHandle(process)

    def sample(self, root_pid: int) -> ProcessResourceSample:
        if root_pid <= 0:
            raise RuntimeError("tts-benchmark-memory:invalid-root")
        process_ids = self._descendants(root_pid, self._parent_by_pid())
        ram_bytes = sum(self._working_set_bytes(pid) for pid in process_ids)
        vram_bytes, allocations = self._vram_sampler.sample(process_ids)
        return ProcessResourceSample(
            process_tree_ram_bytes=ram_bytes,
            process_tree_vram_bytes=vram_bytes,
            gpu_provider_allocations=allocations,
        )


class ProcessTreeMemoryProbe:
    """Sample one runner's child process tree every frozen 50 milliseconds."""

    def __init__(
        self,
        *,
        root_pid: int,
        sampler: ProcessResourceSampler,
        require_vram: bool,
    ) -> None:
        if root_pid <= 0:
            raise ValueError("tts-benchmark-memory:invalid-root")
        self._root_pid = root_pid
        self._sampler = sampler
        self._require_vram = require_vram
        self._stop_event = threading.Event()
        self._lock = threading.Lock()
        self._thread: threading.Thread | None = None
        self._baseline: ProcessResourceSample | None = None
        self._peak_ram_bytes = 0
        self._peak_vram_bytes = 0
        self._peak_gpu_allocations = 0
        self._vram_available = True
        self._sampling_failed = False

    def _observe(self, sample: ProcessResourceSample) -> None:
        self._peak_ram_bytes = max(self._peak_ram_bytes, sample.process_tree_ram_bytes)
        self._peak_gpu_allocations = max(
            self._peak_gpu_allocations,
            sample.gpu_provider_allocations,
        )
        if sample.process_tree_vram_bytes is None:
            self._vram_available = False
        else:
            self._peak_vram_bytes = max(
                self._peak_vram_bytes,
                sample.process_tree_vram_bytes,
            )

    def _sample_once(self) -> None:
        with self._lock:
            try:
                self._observe(self._sampler.sample(self._root_pid))
            except Exception:
                self._sampling_failed = True

    def _sample_until_stopped(self) -> None:
        while not self._stop_event.wait(SAMPLING_INTERVAL_MILLISECONDS / 1_000):
            self._sample_once()

    def start(self) -> None:
        if self._thread is not None:
            raise RuntimeError("tts-benchmark-memory:already-active")
        baseline = self._sampler.sample(self._root_pid)
        if self._require_vram and baseline.process_tree_vram_bytes is None:
            raise RuntimeError("tts-benchmark-memory:vram-unavailable")
        self._baseline = baseline
        self._observe(baseline)
        self._stop_event.clear()
        thread = threading.Thread(
            target=self._sample_until_stopped,
            name="voxleaf-tts-memory-sampler",
            daemon=True,
        )
        self._thread = thread
        thread.start()

    def stop(self) -> MemoryObservation:
        thread = self._thread
        baseline = self._baseline
        if thread is None or baseline is None:
            raise RuntimeError("tts-benchmark-memory:not-active")
        self._sample_once()
        self._stop_event.set()
        thread.join(timeout=1)
        self._thread = None
        self._baseline = None
        if thread.is_alive() or self._sampling_failed:
            raise RuntimeError("tts-benchmark-memory:sampling-failed")
        baseline_vram = baseline.process_tree_vram_bytes
        peak_vram: int | None
        if not self._require_vram:
            peak_vram = None
        elif not self._vram_available or baseline_vram is None:
            raise RuntimeError("tts-benchmark-memory:vram-unavailable")
        else:
            peak_vram = max(0, self._peak_vram_bytes - baseline_vram)
        return MemoryObservation(
            sampling_interval_milliseconds=SAMPLING_INTERVAL_MILLISECONDS,
            peak_process_tree_ram_bytes=max(
                0,
                self._peak_ram_bytes - baseline.process_tree_ram_bytes,
            ),
            peak_vram_bytes=peak_vram,
            gpu_provider_allocations=self._peak_gpu_allocations,
        )
