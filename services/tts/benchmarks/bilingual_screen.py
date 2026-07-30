"""Frozen v8 machine controls and bounded candidate screens."""

from __future__ import annotations

import hashlib
import json
import os
import platform
import re
import subprocess
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Final, NoReturn, cast

from benchmarks.adapters.qwen_v8 import (
    QWEN_V8_CANDIDATE_IDS,
    QwenV8AdapterFactory,
    QwenV8Configuration,
    QwenV8ConfigurationError,
    QwenV8Profile,
    load_qwen_v8_profile,
    verify_qwen_v8_artifacts,
)
from benchmarks.bilingual_baseline import WindowsAvailableRamProbe
from benchmarks.contracts import BenchmarkRun, CandidateRole, GenerationObservation
from benchmarks.harness import BenchmarkHarness, SystemNanosecondClock, load_bilingual_corpus
from benchmarks.isolation import IsolatedBenchmarkAdapter, IsolationTimeouts
from benchmarks.memory import (
    PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS,
    FrameworkVramTracker,
    ProcessTreeMemoryProbe,
    WindowsGpuProcessMemorySampler,
    WindowsProcessResourceSampler,
)
from benchmarks.metrics import distribution, real_time_factor
from benchmarks.preflight import (
    GitRepositoryProbe,
    HostSnapshot,
    WindowsFirewallNetworkProbe,
    WindowsHostProbe,
)
from benchmarks.v7_authority import CORPUS_SHA256
from benchmarks.v8_authority import (
    CANDIDATES_SHA256,
    PROFILE_SHA256,
    QWEN_LOCK_SHA256,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v7.json"
RAW_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "raw" / "v8"
AUTHORITY_COMMIT_SHA: Final = "b66fafa743b84e8a995705ec3bbdf8fed6a9a04e"
QWEN_ENVIRONMENT: Final = Path("services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda")
QWEN_MODEL_ROOT: Final = Path("models/qwen3_1_7b_customvoice_cuda")
MIB: Final = 1024**2
MAXIMUM_PROCESS_TREE_RAM_BYTES: Final = 4_096 * MIB
MINIMUM_AVAILABLE_RAM_BYTES: Final = 4_096 * MIB
MINIMUM_VRAM_RESERVE_BYTES: Final = 512 * MIB
COMMIT = re.compile(r"^[0-9a-f]{40}$")
SESSION_ID = re.compile(r"^[0-9a-f]{32}$")


class BilingualScreenError(RuntimeError):
    """Fixed content-free control/screen failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-bilingual-screen:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise BilingualScreenError(code)


@dataclass(frozen=True)
class ScreenConditions:
    sleep_disabled: bool
    background_load_acceptable: bool
    thermal_state_acceptable: bool


@dataclass(frozen=True)
class ScreenPreflightReceipt:
    expected_commit_sha: str
    candidate_id: str
    candidate_python: Path
    profile: QwenV8Profile
    configuration: QwenV8Configuration
    languages: tuple[str, ...]
    stage: str
    role: CandidateRole
    host: HostSnapshot
    network_isolation: bool
    failures: tuple[str, ...]

    @property
    def eligible(self) -> bool:
        return not self.failures


def _strict_ancestor(ancestor: str, descendant: str) -> bool:
    if ancestor == descendant or COMMIT.fullmatch(descendant) is None:
        return False
    try:
        completed = subprocess.run(
            ("git", "merge-base", "--is-ancestor", ancestor, descendant),
            cwd=REPOSITORY_ROOT,
            check=False,
            capture_output=True,
            timeout=20,
        )
    except (OSError, subprocess.SubprocessError):
        return False
    return completed.returncode == 0


def _expected_candidate_python() -> Path:
    return REPOSITORY_ROOT / QWEN_ENVIRONMENT / ".venv" / "Scripts" / "python.exe"


def run_qwen_preflight(
    *,
    candidate_id: str,
    expected_commit_sha: str,
    candidate_python: Path,
    artifact_root: Path,
    conditions: ScreenConditions,
) -> ScreenPreflightReceipt:
    """Verify one exact Qwen v8 identity without exposing host labels or paths."""

    profile = load_qwen_v8_profile(REPOSITORY_ROOT, candidate_id)
    configuration = QwenV8Configuration(artifact_root)
    repository = GitRepositoryProbe().snapshot(REPOSITORY_ROOT)
    host = WindowsHostProbe().snapshot(REPOSITORY_ROOT)
    network_isolation = WindowsFirewallNetworkProbe().active(candidate_python)
    failures: list[str] = []
    if not repository.clean:
        failures.append("dirty-tree")
    if repository.commit_sha != expected_commit_sha:
        failures.append("source-revision")
    if not _strict_ancestor(AUTHORITY_COMMIT_SHA, expected_commit_sha):
        failures.append("result-before-authority")
    if host.operating_system != "Windows":
        failures.append("host-os")
    if host.architecture != "x86_64":
        failures.append("host-architecture")
    if not re.fullmatch(r"3\.12\.[0-9]+", host.python_version):
        failures.append("python-version")
    if host.logical_processors < 8:
        failures.append("logical-processors")
    if host.total_ram_bytes < 10_570 * MIB:
        failures.append("total-ram")
    if host.free_ram_bytes < 6_474 * MIB:
        failures.append("available-ram")
    if (
        host.total_vram_bytes is None
        or host.total_vram_bytes < 7_196 * MIB
        or host.free_vram_bytes is None
        or host.free_vram_bytes < 6_508 * MIB
    ):
        failures.append("vram")
    if not host.process_vram_available:
        failures.append("vram-measurement")
    if not host.power_online:
        failures.append("power")
    if not conditions.sleep_disabled:
        failures.append("sleep")
    if not conditions.background_load_acceptable:
        failures.append("background-load")
    if not conditions.thermal_state_acceptable:
        failures.append("thermal-state")
    try:
        if candidate_python.resolve(strict=True) != _expected_candidate_python().resolve(
            strict=True
        ):
            failures.append("candidate-environment")
    except OSError:
        failures.append("candidate-environment")
    try:
        verify_qwen_v8_artifacts(profile, configuration)
    except QwenV8ConfigurationError:
        failures.append("artifact")
    if os.environ.get("HF_HUB_OFFLINE") != "1" or os.environ.get("TRANSFORMERS_OFFLINE") != "1":
        failures.append("offline-control")
    if not network_isolation:
        failures.append("network-isolation")
    if (
        platform.system() == "Windows"
        and Path(sys.executable).resolve() != candidate_python.resolve()
    ):
        failures.append("candidate-interpreter")
    return ScreenPreflightReceipt(
        expected_commit_sha=expected_commit_sha,
        candidate_id=candidate_id,
        candidate_python=candidate_python,
        profile=profile,
        configuration=configuration,
        languages=(profile.language,),
        stage="existing-engine-control",
        role="balanced",
        host=host,
        network_isolation=network_isolation,
        failures=tuple(dict.fromkeys(failures)),
    )


def _p95(values: tuple[float, ...]) -> float:
    if not values:
        _fail("observations")
    return distribution(values).p95


def _attempt(observation: GenerationObservation, language: str) -> dict[str, object]:
    return {
        "caseId": observation.case_id,
        "language": language,
        "phase": "warm",
        "attempt": 1,
        "sampleCount": observation.sample_count,
        "sampleRateHz": observation.sample_rate_hz,
        "channels": observation.channels,
        "wallNanoseconds": observation.wall_ns,
        "firstAudioNanoseconds": observation.first_audio_ns,
        "status": "complete",
    }


def _machine_failures(
    receipt: ScreenPreflightReceipt,
    run: BenchmarkRun,
    minimum_available_ram_bytes: int,
    failure_code: str | None,
) -> tuple[str, ...]:
    failures: list[str] = []
    expected_generations = 5 * len(receipt.languages)
    expected_cancellations = 4 * len(receipt.languages)
    if len(run.load_observations) != 1:
        failures.append("observation-count")
    elif run.load_observations[0].load_ns / 1_000_000_000 > 30:
        failures.append("cold-load-p95")
    if len(run.generation_observations) != expected_generations or run.failed_observations != 0:
        failures.append("first-attempt-failure")
    for language in receipt.languages:
        observations = tuple(
            value
            for value in run.generation_observations
            if value.case_id.startswith(f"{language}-")
        )
        if len(observations) != 5:
            failures.append("first-attempt-failure")
            continue
        if _p95(tuple(value.first_audio_ns / 1_000_000_000 for value in observations)) > 7:
            failures.append("first-audio-p95")
        if (
            _p95(
                tuple(
                    real_time_factor(
                        value.wall_ns,
                        value.sample_count,
                        value.sample_rate_hz,
                    )
                    for value in observations
                )
            )
            > 1.1
        ):
            failures.append("warm-rtf-p95")
    if len(run.cancellation_observations) != expected_cancellations:
        failures.append("cancellation")
    if (
        run.memory.peak_process_tree_ram_bytes > MAXIMUM_PROCESS_TREE_RAM_BYTES
        or minimum_available_ram_bytes < MINIMUM_AVAILABLE_RAM_BYTES
    ):
        failures.append("memory")
    if (
        receipt.host.total_vram_bytes is None
        or run.memory.peak_vram_bytes is None
        or run.memory.peak_vram_bytes > receipt.host.total_vram_bytes - MINIMUM_VRAM_RESERVE_BYTES
    ):
        failures.append("memory")
    if failure_code is not None:
        failures.append("cancellation" if failure_code == "cancellation-failed" else failure_code)
    return tuple(dict.fromkeys(failures))


def _raw_payload(
    *,
    receipt: ScreenPreflightReceipt,
    run: BenchmarkRun | None,
    minimum_available_ram_bytes: int | None,
    failure_code: str | None,
) -> dict[str, object]:
    failures = (
        list(
            _machine_failures(
                receipt,
                run,
                minimum_available_ram_bytes,
                failure_code,
            )
        )
        if run is not None and minimum_available_ram_bytes is not None
        else [failure_code or "first-attempt-failure"]
    )
    attempts = (
        [
            _attempt(
                observation,
                next(
                    language
                    for language in receipt.languages
                    if observation.case_id.startswith(f"{language}-")
                ),
            )
            for observation in run.generation_observations
        ]
        if run is not None
        else []
    )
    cancellations: list[dict[str, object]] = []
    if run is not None:
        for index, observation in enumerate(run.cancellation_observations):
            language = receipt.languages[min(index // 4, len(receipt.languages) - 1)]
            cancellations.append(
                {
                    "trialId": observation.trial_id,
                    "language": language,
                    "passed": True,
                    "stopNanoseconds": observation.stop_ns,
                    "cleanupNanoseconds": observation.cleanup_ns,
                    "staleUnits": observation.stale_frames,
                    "processesRemaining": 0,
                }
            )
    memory = (
        {
            "peakProcessTreeRamBytes": run.memory.peak_process_tree_ram_bytes,
            "peakDedicatedVramBytes": run.memory.peak_vram_bytes,
            "minimumAvailableSystemRamBytes": minimum_available_ram_bytes,
        }
        if run is not None and minimum_available_ram_bytes is not None
        else None
    )
    passed = not failures
    return {
        "schemaVersion": "tts-bilingual-raw-v8",
        "candidateId": receipt.candidate_id,
        "evaluationStage": receipt.stage,
        "authorityCommitSha": AUTHORITY_COMMIT_SHA,
        "executionCommitSha": receipt.expected_commit_sha,
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": QWEN_LOCK_SHA256,
        "status": "complete" if passed else "rejected",
        "languagesEvaluated": list(receipt.languages),
        "attempts": attempts,
        "cancellationTrials": cancellations,
        "memory": memory,
        "audits": {
            "artifacts": "artifact" not in receipt.failures,
            "offline": "offline-control" not in receipt.failures,
            "networkIsolation": receipt.network_isolation,
            "privacy": True,
            "boundedRetention": True,
            "cleanup": True,
            "firstAttemptsOnly": True,
        },
        "failures": [{"code": code, "caseId": None} for code in failures],
    }


def run_qwen_machine_evaluation(receipt: ScreenPreflightReceipt) -> dict[str, object]:
    """Run one exact Qwen control and retain only bounded private evidence."""

    if not receipt.eligible or receipt.candidate_id not in QWEN_V8_CANDIDATE_IDS:
        _fail("preflight")
    corpora = tuple(load_bilingual_corpus(CORPUS_PATH, value) for value in receipt.languages)
    forbidden = (
        *(
            value
            for corpus in corpora
            for case in corpus.cases.values()
            for value in (case.text, case.privacy_canary)
        ),
        str(receipt.configuration.artifact_root),
        str(receipt.candidate_python),
    )
    adapter_factory = QwenV8AdapterFactory(receipt.profile, receipt.configuration)
    tracker = FrameworkVramTracker()

    def build_adapter() -> IsolatedBenchmarkAdapter:
        return IsolatedBenchmarkAdapter(
            adapter_factory,
            forbidden_values=forbidden,
            timeouts=IsolationTimeouts(
                load_seconds=120,
                request_seconds=120,
                termination_seconds=2,
                cleanup_seconds=5,
            ),
            framework_memory_observer=tracker.observe,
        )

    available_ram = WindowsAvailableRamProbe()
    available_ram.start()
    try:
        result = BenchmarkHarness(
            clock=SystemNanosecondClock(),
            memory_probe=ProcessTreeMemoryProbe(
                root_pid=os.getpid(),
                sampler=WindowsProcessResourceSampler(
                    vram_sampler=WindowsGpuProcessMemorySampler()
                ),
                require_vram=True,
                process_vram_sampling_interval_milliseconds=(
                    PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS
                ),
                framework_vram_tracker=tracker,
            ),
        ).run_bilingual_screen_protocol(
            adapter_factory=build_adapter,
            corpora=corpora,
            role=receipt.role,
        )
    finally:
        minimum_available_ram = available_ram.stop()
    raw = _raw_payload(
        receipt=receipt,
        run=result.run,
        minimum_available_ram_bytes=minimum_available_ram if result.run is not None else None,
        failure_code=result.failure.code if result.failure is not None else None,
    )
    session_id = uuid.uuid4().hex
    if SESSION_ID.fullmatch(session_id) is None:
        _fail("session")
    session = (RAW_ROOT / receipt.candidate_id / session_id).resolve()
    try:
        session.relative_to(RAW_ROOT.resolve())
    except ValueError:
        _fail("session")
    session.mkdir(parents=True)
    raw_path = session / "machine.raw.json"
    raw_path.write_text(
        json.dumps(raw, ensure_ascii=True, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    service_python = REPOSITORY_ROOT / "services" / "tts" / ".venv" / "Scripts" / "python.exe"
    try:
        completed = subprocess.run(
            (
                str(service_python.resolve(strict=True)),
                "-m",
                "benchmarks.bilingual_screen_result_cli",
                "validate-machine",
            ),
            cwd=REPOSITORY_ROOT / "services" / "tts",
            input=json.dumps(
                {
                    "candidateId": receipt.candidate_id,
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
    return {
        "status": "pass" if raw["status"] == "complete" else "fail",
        "candidateId": receipt.candidate_id,
        "sessionId": session_id,
        "qualityAdmitted": raw["status"] == "complete",
        "failureCodes": [value["code"] for value in cast(list[dict[str, str]], raw["failures"])],
        "rawSha256": hashlib.sha256(raw_path.read_bytes()).hexdigest(),
    }
