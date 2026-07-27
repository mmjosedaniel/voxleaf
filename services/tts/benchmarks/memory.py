"""Process-attributed memory sampling for native Windows benchmark runs."""

from __future__ import annotations

import ctypes
import os
import re
import threading
import time
from ctypes import wintypes
from dataclasses import dataclass
from typing import Final, Protocol, cast

from benchmarks.contracts import MemoryObservation

RAM_SAMPLING_INTERVAL_MILLISECONDS: Final = 50
PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS: Final = 1_000
_TH32CS_SNAPPROCESS: Final = 0x00000002
_PROCESS_QUERY_INFORMATION: Final = 0x0400
_PROCESS_QUERY_LIMITED_INFORMATION: Final = 0x1000
_PROCESS_VM_READ: Final = 0x0010
_MAX_PATH: Final = 260
_PDH_FMT_LARGE: Final = 0x00000400
_PDH_MORE_DATA: Final = 0x800007D2
_PDH_VALID_DATA: Final = 0
_GPU_PROCESS_MEMORY_COUNTER: Final = r"\GPU Process Memory(*)\Dedicated Usage"
GPU_PROCESS_SHARED_MEMORY_COUNTER: Final = r"\GPU Process Memory(*)\Shared Usage"
_GPU_INSTANCE_PID = re.compile(r"^pid_([0-9]+)_")


def _load_windows_dll(name: str) -> ctypes.CDLL:
    loader = getattr(ctypes, "WinDLL", None)
    if loader is None:
        raise RuntimeError("tts-benchmark-memory:windows-required")
    return cast(ctypes.CDLL, loader(name, use_last_error=True))


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


class _PdhFormattedValueUnion(ctypes.Union):
    _fields_ = (
        ("longValue", wintypes.LONG),
        ("doubleValue", ctypes.c_double),
        ("largeValue", ctypes.c_longlong),
        ("ansiStringValue", wintypes.LPSTR),
        ("wideStringValue", wintypes.LPWSTR),
    )


class _PdhFormattedCounterValue(ctypes.Structure):
    _anonymous_ = ("value",)
    _fields_ = (
        ("CStatus", wintypes.DWORD),
        ("value", _PdhFormattedValueUnion),
    )


class _PdhFormattedCounterValueItemW(ctypes.Structure):
    _fields_ = (
        ("szName", wintypes.LPWSTR),
        ("FmtValue", _PdhFormattedCounterValue),
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


class FrameworkVramTracker:
    """Retain only the maximum allocator byte count returned by child workers."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._peak_bytes = 0
        self._available = True
        self._observed = False

    def reset(self) -> None:
        with self._lock:
            self._peak_bytes = 0
            self._available = True
            self._observed = False

    def observe(self, value: int | None) -> None:
        with self._lock:
            self._observed = True
            if value is None:
                self._available = False
                return
            if value < 0:
                self._available = False
                return
            self._peak_bytes = max(self._peak_bytes, value)

    def peak_bytes(self) -> int | None:
        with self._lock:
            if not self._observed or not self._available:
                return None
            return self._peak_bytes


class WindowsGpuProcessMemorySampler:
    """Rate-limited WDDM dedicated-memory sampling through native PDH."""

    def __init__(self, counter_path: str = _GPU_PROCESS_MEMORY_COUNTER) -> None:
        if os.name != "nt":
            raise RuntimeError("tts-benchmark-memory:windows-required")
        if counter_path not in (
            _GPU_PROCESS_MEMORY_COUNTER,
            GPU_PROCESS_SHARED_MEMORY_COUNTER,
        ):
            raise RuntimeError("tts-benchmark-memory:counter")
        self._pdh = _load_windows_dll("pdh")
        self._pdh.PdhOpenQueryW.argtypes = (
            wintypes.LPCWSTR,
            ctypes.c_size_t,
            ctypes.POINTER(wintypes.HANDLE),
        )
        self._pdh.PdhOpenQueryW.restype = wintypes.LONG
        self._pdh.PdhAddEnglishCounterW.argtypes = (
            wintypes.HANDLE,
            wintypes.LPCWSTR,
            ctypes.c_size_t,
            ctypes.POINTER(wintypes.HANDLE),
        )
        self._pdh.PdhAddEnglishCounterW.restype = wintypes.LONG
        self._pdh.PdhCollectQueryData.argtypes = (wintypes.HANDLE,)
        self._pdh.PdhCollectQueryData.restype = wintypes.LONG
        self._pdh.PdhGetFormattedCounterArrayW.argtypes = (
            wintypes.HANDLE,
            wintypes.DWORD,
            ctypes.POINTER(wintypes.DWORD),
            ctypes.POINTER(wintypes.DWORD),
            wintypes.LPVOID,
        )
        self._pdh.PdhGetFormattedCounterArrayW.restype = wintypes.LONG
        self._pdh.PdhCloseQuery.argtypes = (wintypes.HANDLE,)
        self._pdh.PdhCloseQuery.restype = wintypes.LONG
        query = wintypes.HANDLE()
        counter = wintypes.HANDLE()
        if self._status(self._pdh.PdhOpenQueryW(None, 0, ctypes.byref(query))) != 0:
            raise RuntimeError("tts-benchmark-memory:wddm-unavailable")
        self._query = query
        try:
            status = self._pdh.PdhAddEnglishCounterW(
                query,
                counter_path,
                0,
                ctypes.byref(counter),
            )
            if self._status(status) != 0:
                raise RuntimeError("tts-benchmark-memory:wddm-unavailable")
        except Exception:
            self._pdh.PdhCloseQuery(query)
            raise
        self._counter = counter
        self._last_collection_ns: int | None = None
        self._bytes_by_pid: dict[int, int] | None = None

    @staticmethod
    def _status(value: int) -> int:
        return ctypes.c_ulong(value).value

    @staticmethod
    def _aggregate(
        values: tuple[tuple[str, int, int], ...],
    ) -> dict[int, int]:
        totals: dict[int, int] = {}
        for instance_name, status, value in values:
            match = _GPU_INSTANCE_PID.match(instance_name)
            if match is None or status != _PDH_VALID_DATA or value < 0:
                continue
            pid = int(match.group(1))
            totals[pid] = totals.get(pid, 0) + value
        return totals

    def _collect(self) -> dict[int, int]:
        if self._status(self._pdh.PdhCollectQueryData(self._query)) != 0:
            raise RuntimeError("tts-benchmark-memory:wddm-unavailable")
        buffer_size = wintypes.DWORD()
        item_count = wintypes.DWORD()
        status = self._status(
            self._pdh.PdhGetFormattedCounterArrayW(
                self._counter,
                _PDH_FMT_LARGE,
                ctypes.byref(buffer_size),
                ctypes.byref(item_count),
                None,
            )
        )
        if status == 0 and item_count.value == 0:
            return {}
        if status != _PDH_MORE_DATA or buffer_size.value == 0:
            raise RuntimeError("tts-benchmark-memory:wddm-unavailable")
        buffer = ctypes.create_string_buffer(buffer_size.value)
        status = self._status(
            self._pdh.PdhGetFormattedCounterArrayW(
                self._counter,
                _PDH_FMT_LARGE,
                ctypes.byref(buffer_size),
                ctypes.byref(item_count),
                ctypes.cast(buffer, wintypes.LPVOID),
            )
        )
        if status != 0:
            raise RuntimeError("tts-benchmark-memory:wddm-unavailable")
        items = ctypes.cast(
            buffer,
            ctypes.POINTER(_PdhFormattedCounterValueItemW),
        )
        values = tuple(
            (
                items[index].szName or "",
                int(items[index].FmtValue.CStatus),
                int(items[index].FmtValue.largeValue),
            )
            for index in range(item_count.value)
        )
        return self._aggregate(values)

    def sample(self, process_ids: frozenset[int]) -> tuple[int | None, int]:
        now = time.perf_counter_ns()
        if (
            self._last_collection_ns is None
            or now - self._last_collection_ns
            >= PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS * 1_000_000
        ):
            try:
                self._bytes_by_pid = self._collect()
            except RuntimeError:
                self._bytes_by_pid = None
            self._last_collection_ns = now
        values = self._bytes_by_pid
        if values is None:
            return None, 0
        allocating = tuple(pid for pid in process_ids if values.get(pid, 0) > 0)
        return sum(values.get(pid, 0) for pid in process_ids), len(allocating)

    def close(self) -> None:
        query = getattr(self, "_query", None)
        if query:
            self._pdh.PdhCloseQuery(query)
            self._query = wintypes.HANDLE()

    def __del__(self) -> None:
        self.close()


class WindowsProcessResourceSampler:
    """Read only PID relationships, working sets, and injected VRAM counters."""

    def __init__(self, *, vram_sampler: ProcessVramSampler | None = None) -> None:
        if os.name != "nt":
            raise RuntimeError("tts-benchmark-memory:windows-required")
        self._kernel32 = _load_windows_dll("kernel32")
        self._psapi = _load_windows_dll("psapi")
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

    def process_working_set_bytes(self, process_id: int) -> int:
        """Return one process working set without including its descendants."""

        if process_id <= 0:
            return 0
        handle = self._kernel32.OpenProcess(
            _PROCESS_QUERY_LIMITED_INFORMATION | _PROCESS_VM_READ,
            False,
            process_id,
        )
        if not handle:
            return 0
        counters = _ProcessMemoryCountersEx()
        counters.cb = ctypes.sizeof(_ProcessMemoryCountersEx)
        try:
            if not self._psapi.GetProcessMemoryInfo(
                handle,
                ctypes.byref(counters),
                counters.cb,
            ):
                return 0
            return int(counters.WorkingSetSize)
        finally:
            self._kernel32.CloseHandle(handle)

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
        process_vram_sampling_interval_milliseconds: int | None = None,
        framework_vram_tracker: FrameworkVramTracker | None = None,
    ) -> None:
        if root_pid <= 0:
            raise ValueError("tts-benchmark-memory:invalid-root")
        self._root_pid = root_pid
        self._sampler = sampler
        self._require_vram = require_vram
        if require_vram and (
            process_vram_sampling_interval_milliseconds is None
            or process_vram_sampling_interval_milliseconds <= 0
            or framework_vram_tracker is None
        ):
            raise ValueError("tts-benchmark-memory:vram-configuration")
        self._process_vram_sampling_interval_milliseconds = (
            process_vram_sampling_interval_milliseconds
        )
        self._framework_vram_tracker = framework_vram_tracker
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
        while not self._stop_event.wait(RAM_SAMPLING_INTERVAL_MILLISECONDS / 1_000):
            self._sample_once()

    def start(self) -> None:
        if self._thread is not None:
            raise RuntimeError("tts-benchmark-memory:already-active")
        if self._framework_vram_tracker is not None:
            self._framework_vram_tracker.reset()
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
        peak_process_vram: int | None
        peak_framework_vram: int | None
        peak_vram: int | None
        if not self._require_vram:
            peak_process_vram = None
            peak_framework_vram = None
            peak_vram = None
        elif not self._vram_available or baseline_vram is None:
            raise RuntimeError("tts-benchmark-memory:vram-unavailable")
        else:
            peak_process_vram = max(0, self._peak_vram_bytes - baseline_vram)
            tracker = self._framework_vram_tracker
            peak_framework_vram = tracker.peak_bytes() if tracker is not None else None
            if peak_process_vram <= 0 or not peak_framework_vram:
                raise RuntimeError("tts-benchmark-memory:vram-unavailable")
            peak_vram = max(peak_process_vram, peak_framework_vram)
        return MemoryObservation(
            ram_sampling_interval_milliseconds=RAM_SAMPLING_INTERVAL_MILLISECONDS,
            process_vram_sampling_interval_milliseconds=(
                self._process_vram_sampling_interval_milliseconds if self._require_vram else None
            ),
            vram_measurement_method=(
                "wddm-dedicated-plus-pytorch-reserved"
                if self._require_vram
                else "unavailable-cpu-role"
            ),
            peak_process_tree_ram_bytes=max(
                0,
                self._peak_ram_bytes - baseline.process_tree_ram_bytes,
            ),
            peak_process_vram_bytes=peak_process_vram,
            peak_framework_vram_bytes=peak_framework_vram,
            peak_vram_bytes=peak_vram,
            gpu_provider_allocations=self._peak_gpu_allocations,
        )
