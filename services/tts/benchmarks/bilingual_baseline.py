"""Frozen v8 preflight and machine evaluation for the Piper English baseline."""

from __future__ import annotations

import ctypes
import json
import os
import platform
import re
import subprocess
import sys
import threading
import uuid
from collections.abc import Mapping
from ctypes import wintypes
from dataclasses import dataclass
from pathlib import Path
from typing import Final, NoReturn, cast

from benchmarks.adapters.piper_english import (
    PIPER_ENGLISH_CANDIDATE_ID,
    PiperEnglishAdapterFactory,
    PiperEnglishConfiguration,
    PiperEnglishConfigurationError,
    PiperEnglishProfile,
    load_piper_english_profile,
    verify_piper_english_artifacts,
)
from benchmarks.contracts import BenchmarkRun, GenerationObservation
from benchmarks.harness import BenchmarkHarness, SystemNanosecondClock, load_bilingual_corpus
from benchmarks.isolation import IsolatedBenchmarkAdapter, IsolationTimeouts
from benchmarks.memory import (
    ProcessTreeMemoryProbe,
    WindowsProcessResourceSampler,
)
from benchmarks.metrics import distribution, real_time_factor
from benchmarks.preflight import (
    GitRepositoryProbe,
    HostSnapshot,
    WindowsFirewallNetworkProbe,
    WindowsHostProbe,
)
from benchmarks.v7_authority import CORPUS_SHA256, PIPER_LOCK_SHA256
from benchmarks.v8_authority import (
    CANDIDATES_SHA256,
    PROFILE_SHA256,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v7.json"
RAW_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "raw" / "v8"
AUTHORITY_COMMIT_SHA: Final = "b66fafa743b84e8a995705ec3bbdf8fed6a9a04e"
MINIMUM_TOTAL_RAM_BYTES: Final = 8_192 * 1024**2
MINIMUM_AVAILABLE_RAM_BYTES: Final = 4_096 * 1024**2
MAXIMUM_PROCESS_TREE_RAM_BYTES: Final = 4_096 * 1024**2
COMMIT = re.compile(r"^[0-9a-f]{40}$")
SESSION_ID = re.compile(r"^[a-f0-9]{32}$")


class BilingualBaselineError(RuntimeError):
    """Fixed content-free failure for the frozen v8 baseline commands."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-bilingual-baseline:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise BilingualBaselineError(code)


@dataclass(frozen=True)
class BaselineConditions:
    sleep_disabled: bool
    background_load_acceptable: bool
    thermal_state_acceptable: bool


@dataclass(frozen=True)
class BaselinePreflightReceipt:
    expected_commit_sha: str
    candidate_python: Path
    profile: PiperEnglishProfile
    configuration: PiperEnglishConfiguration
    host: HostSnapshot
    network_isolation: bool
    failures: tuple[str, ...]

    @property
    def eligible(self) -> bool:
        return not self.failures


class _MemoryStatusEx(ctypes.Structure):
    _fields_ = (
        ("dwLength", wintypes.DWORD),
        ("dwMemoryLoad", wintypes.DWORD),
        ("ullTotalPhys", ctypes.c_ulonglong),
        ("ullAvailPhys", ctypes.c_ulonglong),
        ("ullTotalPageFile", ctypes.c_ulonglong),
        ("ullAvailPageFile", ctypes.c_ulonglong),
        ("ullTotalVirtual", ctypes.c_ulonglong),
        ("ullAvailVirtual", ctypes.c_ulonglong),
        ("ullAvailExtendedVirtual", ctypes.c_ulonglong),
    )


class WindowsAvailableRamProbe:
    """Track minimum available system RAM during one bounded evaluation."""

    def __init__(self, interval_seconds: float = 0.05) -> None:
        if os.name != "nt" or interval_seconds <= 0:
            raise BilingualBaselineError("windows-required")
        loader = getattr(ctypes, "WinDLL", None)
        if loader is None:
            raise BilingualBaselineError("windows-required")
        self._kernel32 = loader("kernel32", use_last_error=True)
        self._kernel32.GlobalMemoryStatusEx.argtypes = (ctypes.POINTER(_MemoryStatusEx),)
        self._kernel32.GlobalMemoryStatusEx.restype = wintypes.BOOL
        self._interval_seconds = interval_seconds
        self._minimum = 0
        self._failed = False
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def _sample(self) -> None:
        status = _MemoryStatusEx()
        status.dwLength = ctypes.sizeof(_MemoryStatusEx)
        if not self._kernel32.GlobalMemoryStatusEx(ctypes.byref(status)):
            self._failed = True
            return
        available = int(status.ullAvailPhys)
        self._minimum = available if self._minimum == 0 else min(self._minimum, available)

    def _run(self) -> None:
        while not self._stop.wait(self._interval_seconds):
            self._sample()

    def start(self) -> None:
        if self._thread is not None:
            raise BilingualBaselineError("memory-active")
        self._minimum = 0
        self._failed = False
        self._stop.clear()
        self._sample()
        thread = threading.Thread(
            target=self._run,
            name="voxleaf-v8-available-ram",
            daemon=True,
        )
        self._thread = thread
        thread.start()

    def stop(self) -> int:
        thread = self._thread
        if thread is None:
            raise BilingualBaselineError("memory-inactive")
        self._sample()
        self._stop.set()
        thread.join(timeout=1)
        self._thread = None
        if thread.is_alive() or self._failed or self._minimum <= 0:
            raise BilingualBaselineError("memory-unavailable")
        return self._minimum


def _strict_ancestor(repository_root: Path, ancestor: str, descendant: str) -> bool:
    if ancestor == descendant or COMMIT.fullmatch(descendant) is None:
        return False
    try:
        completed = subprocess.run(
            ("git", "merge-base", "--is-ancestor", ancestor, descendant),
            cwd=repository_root,
            check=False,
            capture_output=True,
            timeout=20,
        )
    except (OSError, subprocess.SubprocessError):
        return False
    return completed.returncode == 0


def _expected_candidate_python(repository_root: Path) -> Path:
    return (
        repository_root
        / "services"
        / "tts"
        / "benchmarks"
        / "candidates"
        / "piper_1_4_2_cpu"
        / ".venv"
        / "Scripts"
        / "python.exe"
    )


def run_baseline_preflight(
    *,
    repository_root: Path,
    expected_commit_sha: str,
    candidate_python: Path,
    configuration: PiperEnglishConfiguration,
    conditions: BaselineConditions,
    repository_probe: GitRepositoryProbe | None = None,
    host_probe: WindowsHostProbe | None = None,
    network_probe: WindowsFirewallNetworkProbe | None = None,
    environment: Mapping[str, str] | None = None,
) -> BaselinePreflightReceipt:
    """Verify the exact result-bearing environment without exposing private values."""

    profile = load_piper_english_profile(repository_root)
    repository = (repository_probe or GitRepositoryProbe()).snapshot(repository_root)
    host = (host_probe or WindowsHostProbe()).snapshot(repository_root)
    network_isolation = (network_probe or WindowsFirewallNetworkProbe()).active(candidate_python)
    selected_environment = environment or os.environ
    failures: list[str] = []
    if not repository.clean:
        failures.append("dirty-tree")
    if repository.commit_sha != expected_commit_sha:
        failures.append("source-revision")
    if not _strict_ancestor(repository_root, AUTHORITY_COMMIT_SHA, expected_commit_sha):
        failures.append("result-before-authority")
    if host.operating_system != "Windows":
        failures.append("host-os")
    if host.architecture != "x86_64":
        failures.append("host-architecture")
    if not re.fullmatch(r"3\.12\.[0-9]+", host.python_version):
        failures.append("python-version")
    if host.logical_processors < 4:
        failures.append("logical-processors")
    if host.total_ram_bytes < MINIMUM_TOTAL_RAM_BYTES:
        failures.append("total-ram")
    if host.free_ram_bytes < MINIMUM_AVAILABLE_RAM_BYTES:
        failures.append("available-ram")
    if not host.power_online:
        failures.append("power")
    if not conditions.sleep_disabled:
        failures.append("sleep")
    if not conditions.background_load_acceptable:
        failures.append("background-load")
    if not conditions.thermal_state_acceptable:
        failures.append("thermal-state")
    try:
        if candidate_python.resolve(strict=True) != _expected_candidate_python(
            repository_root
        ).resolve(strict=True):
            failures.append("candidate-environment")
    except OSError:
        failures.append("candidate-environment")
    if selected_environment.get("HF_HUB_OFFLINE") != "1":
        failures.append("offline-control")
    try:
        verify_piper_english_artifacts(profile, configuration)
    except PiperEnglishConfigurationError:
        failures.append("artifact")
    if not network_isolation:
        failures.append("network-isolation")
    if (
        platform.system() == "Windows"
        and Path(sys.executable).resolve() != candidate_python.resolve()
    ):
        failures.append("candidate-interpreter")
    return BaselinePreflightReceipt(
        expected_commit_sha=expected_commit_sha,
        candidate_python=candidate_python,
        profile=profile,
        configuration=configuration,
        host=host,
        network_isolation=network_isolation,
        failures=tuple(dict.fromkeys(failures)),
    )


def run_local_baseline_preflight(
    *,
    expected_commit_sha: str,
    candidate_python: Path,
    configuration: PiperEnglishConfiguration,
    conditions: BaselineConditions,
) -> BaselinePreflightReceipt:
    return run_baseline_preflight(
        repository_root=REPOSITORY_ROOT,
        expected_commit_sha=expected_commit_sha,
        candidate_python=candidate_python,
        configuration=configuration,
        conditions=conditions,
    )


def _percentile95(values: tuple[float, ...]) -> float:
    if not values:
        _fail("missing-observations")
    return distribution(values).p95


def _attempt(
    observation: GenerationObservation,
    *,
    language: str,
) -> dict[str, object]:
    return {
        "caseId": observation.case_id,
        "language": language,
        "phase": observation.phase,
        "attempt": 1,
        "sampleCount": observation.sample_count,
        "sampleRateHz": observation.sample_rate_hz,
        "channels": observation.channels,
        "wallNanoseconds": observation.wall_ns,
        "firstAudioNanoseconds": observation.first_audio_ns,
        "status": "complete",
    }


def _machine_failures(
    run: BenchmarkRun,
    minimum_available_ram_bytes: int,
) -> tuple[str, ...]:
    warm = tuple(item for item in run.generation_observations if item.phase == "warm")
    sustained = tuple(item for item in run.generation_observations if item.phase == "sustained")
    failures: list[str] = []
    if (
        len(run.load_observations) != 5
        or len(warm) != 10
        or len(sustained) != 15
        or len(run.cancellation_observations) != 4
        or run.failed_observations != 0
    ):
        failures.append("observation-count")
    if (
        len(run.load_observations) == 5
        and _percentile95(tuple(item.load_ns / 1_000_000_000 for item in run.load_observations))
        > 30
    ):
        failures.append("cold-load-p95")
    if len(warm) == 10:
        if _percentile95(tuple(item.first_audio_ns / 1_000_000_000 for item in warm)) > 7:
            failures.append("first-audio-p95")
        if (
            _percentile95(
                tuple(
                    real_time_factor(item.wall_ns, item.sample_count, item.sample_rate_hz)
                    for item in warm
                )
            )
            > 1.1
        ):
            failures.append("warm-rtf-p95")
    if len(sustained) == 15:
        rtfs = tuple(
            real_time_factor(item.wall_ns, item.sample_count, item.sample_rate_hz)
            for item in sustained
        )
        media_seconds = sum(item.sample_count / item.sample_rate_hz for item in sustained)
        wall_seconds = sum(item.wall_ns / 1_000_000_000 for item in sustained)
        if _percentile95(rtfs) > 1.1:
            failures.append("sustained-rtf-p95")
        if media_seconds <= 0 or wall_seconds / media_seconds > 1.08:
            failures.append("total-sustained-rtf")
    if (
        run.memory.peak_process_tree_ram_bytes > MAXIMUM_PROCESS_TREE_RAM_BYTES
        or minimum_available_ram_bytes < MINIMUM_AVAILABLE_RAM_BYTES
    ):
        failures.append("memory")
    if run.memory.gpu_provider_allocations != 0:
        failures.append("gpu-provider")
    if any(
        item.stop_mode != "worker-termination"
        or item.stop_ns > 2_000_000_000
        or item.cleanup_ns > 5_000_000_000
        or item.stale_frames != 0
        or not item.raw_session_removed
        for item in run.cancellation_observations
    ):
        failures.append("cancellation")
    return tuple(dict.fromkeys(failures))


def _raw_payload(
    *,
    receipt: BaselinePreflightReceipt,
    run: BenchmarkRun | None,
    minimum_available_ram_bytes: int | None,
    failure_code: str | None,
) -> dict[str, object]:
    failures: list[str] = []
    if run is not None and minimum_available_ram_bytes is not None:
        failures.extend(_machine_failures(run, minimum_available_ram_bytes))
    if failure_code is not None:
        failures.append(failure_code)
    attempts = (
        [_attempt(observation, language="en") for observation in run.generation_observations]
        if run is not None
        else []
    )
    cancellations = (
        [
            {
                "trialId": item.trial_id,
                "language": "en",
                "passed": True,
                "stopNanoseconds": item.stop_ns,
                "cleanupNanoseconds": item.cleanup_ns,
                "staleUnits": item.stale_frames,
                "processesRemaining": 0,
            }
            for item in run.cancellation_observations
        ]
        if run is not None
        else []
    )
    memory: dict[str, object] | None = None
    if run is not None and minimum_available_ram_bytes is not None:
        memory = {
            "peakProcessTreeRamBytes": run.memory.peak_process_tree_ram_bytes,
            "peakDedicatedVramBytes": None,
            "minimumAvailableSystemRamBytes": minimum_available_ram_bytes,
        }
    passed = not failures
    return {
        "schemaVersion": "tts-bilingual-raw-v8",
        "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
        "evaluationStage": "baseline",
        "authorityCommitSha": AUTHORITY_COMMIT_SHA,
        "executionCommitSha": receipt.expected_commit_sha,
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": PIPER_LOCK_SHA256,
        "status": "complete" if passed else "rejected",
        "languagesEvaluated": ["en"],
        "attempts": attempts,
        "cancellationTrials": cancellations,
        "memory": memory,
        "audits": {
            "artifacts": "artifact" not in receipt.failures,
            "offline": "offline-control" not in receipt.failures,
            "networkIsolation": receipt.network_isolation,
            "privacy": passed,
            "boundedRetention": True,
            "cleanup": passed,
            "firstAttemptsOnly": True,
        },
        "failures": [{"code": code, "caseId": None} for code in dict.fromkeys(failures)],
    }


def run_machine_evaluation(receipt: BaselinePreflightReceipt) -> dict[str, object]:
    """Run and retain only the bounded private v8 machine observation."""

    if not receipt.eligible:
        _fail("preflight")
    corpus = load_bilingual_corpus(CORPUS_PATH, "en")
    forbidden_values = (
        *(value for case in corpus.cases.values() for value in (case.text, case.privacy_canary)),
        str(receipt.configuration.artifact_root),
        str(receipt.candidate_python),
    )
    adapter_factory = PiperEnglishAdapterFactory(
        receipt.profile,
        receipt.configuration,
    )

    def build_adapter() -> IsolatedBenchmarkAdapter:
        return IsolatedBenchmarkAdapter(
            adapter_factory,
            forbidden_values=forbidden_values,
            timeouts=IsolationTimeouts(
                load_seconds=120,
                request_seconds=120,
                termination_seconds=2,
                cleanup_seconds=5,
            ),
        )

    available_ram = WindowsAvailableRamProbe()
    available_ram.start()
    result = BenchmarkHarness(
        clock=SystemNanosecondClock(),
        memory_probe=ProcessTreeMemoryProbe(
            root_pid=os.getpid(),
            sampler=WindowsProcessResourceSampler(),
            require_vram=False,
        ),
    ).run_bilingual_baseline_protocol(
        adapter_factory=build_adapter,
        corpus=corpus,
    )
    minimum_available_ram = available_ram.stop()
    raw = _raw_payload(
        receipt=receipt,
        run=result.run,
        minimum_available_ram_bytes=minimum_available_ram,
        failure_code=result.failure.code if result.failure is not None else None,
    )
    session_id = uuid.uuid4().hex
    if SESSION_ID.fullmatch(session_id) is None:
        _fail("session")
    session = (RAW_ROOT / PIPER_ENGLISH_CANDIDATE_ID / session_id).resolve()
    try:
        session.relative_to(RAW_ROOT.resolve())
    except ValueError:
        _fail("session")
    session.mkdir(parents=True)
    target = session / "machine.raw.json"
    target.write_text(
        json.dumps(raw, ensure_ascii=True, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    service_python = REPOSITORY_ROOT / "services" / "tts" / ".venv" / "Scripts" / "python.exe"
    try:
        completed = subprocess.run(
            (
                str(service_python.resolve(strict=True)),
                "-m",
                "benchmarks.bilingual_result_cli",
                "validate-machine",
            ),
            cwd=REPOSITORY_ROOT / "services" / "tts",
            input=json.dumps(
                {
                    "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
                    "expectedCommitSha": receipt.expected_commit_sha,
                    "sessionId": session_id,
                },
                ensure_ascii=True,
                separators=(",", ":"),
            ),
            capture_output=True,
            text=True,
            check=False,
            timeout=120,
        )
        validation = cast(object, json.loads(completed.stdout))
    except (OSError, subprocess.SubprocessError, json.JSONDecodeError):
        _fail("raw-validation")
    if (
        completed.returncode != 0
        or not isinstance(validation, dict)
        or validation.get("status") != "pass"
    ):
        _fail("raw-validation")
    attempts = cast(list[dict[str, object]], raw["attempts"])
    cancellation_trials = cast(list[dict[str, object]], raw["cancellationTrials"])
    return {
        "status": "pass" if raw["status"] == "complete" else "fail",
        "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
        "sessionId": session_id,
        "qualityAdmitted": raw["status"] == "complete",
        "failureCodes": [item["code"] for item in cast(list[dict[str, str]], raw["failures"])],
        "counts": {
            "warmGenerations": sum(item["phase"] == "warm" for item in attempts),
            "sustainedGenerations": sum(item["phase"] == "sustained" for item in attempts),
            "cancellationTrials": len(cancellation_trials),
        },
    }
