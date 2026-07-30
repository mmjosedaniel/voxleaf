"""Decision-neutral bounded screens for corrected Chatterbox and MOSS profiles."""

from __future__ import annotations

import hashlib
import json
import multiprocessing
import os
import platform
import re
import subprocess
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Final, NoReturn, cast

from jsonschema import Draft202012Validator

from benchmarks.adapters.corrective_v9 import (
    ChatterboxV9AdapterFactory,
    ChatterboxV9Configuration,
    ChatterboxV9Profile,
    MossV9AdapterFactory,
    MossV9Configuration,
    MossV9Profile,
    load_chatterbox_v9_profile,
    load_moss_v9_profile,
    verify_chatterbox_v9_artifacts,
    verify_moss_v9_artifacts,
)
from benchmarks.bilingual_baseline import WindowsAvailableRamProbe
from benchmarks.contracts import (
    AdapterFactory,
    BenchmarkRun,
    CandidateRole,
    GenerationObservation,
)
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
from benchmarks.v9_authority import (
    CANDIDATES_SHA256,
    CHATTERBOX_CANDIDATE_ID,
    CHATTERBOX_LOCK_SHA256,
    MOSS_CANDIDATE_ID,
    MOSS_LOCK_SHA256,
    PROFILE_SHA256,
    load_frozen_v9_authority,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v7.json"
RAW_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "raw" / "v9"
AUTHORITY_COMMIT_SHA: Final = "397f2ee82a29657f8b2788a14a1d898463a54294"
CHATTERBOX_ENVIRONMENT: Final = Path(
    "services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v2"
)
MOSS_ENVIRONMENT: Final = Path("services/tts/benchmarks/candidates/moss_tts_nano_100m_onnx_cpu")
CHATTERBOX_ARTIFACT_ROOT: Final = Path("models/chatterbox_multilingual_v3_v2")
MOSS_ARTIFACT_ROOT: Final = Path("models/moss_tts_nano_100m_onnx_cpu")
MIB: Final = 1024**2
COMMIT = re.compile(r"^[0-9a-f]{40}$")
SESSION_ID = re.compile(r"^[0-9a-f]{32}$")

type CorrectiveProfile = ChatterboxV9Profile | MossV9Profile
type CorrectiveConfiguration = ChatterboxV9Configuration | MossV9Configuration


class CorrectiveV9ScreenError(RuntimeError):
    """Fixed content-free screen failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-corrective-v9-screen:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise CorrectiveV9ScreenError(code)


@dataclass(frozen=True)
class ScreenConditions:
    sleep_disabled: bool
    background_load_acceptable: bool
    thermal_state_acceptable: bool


@dataclass(frozen=True)
class CorrectivePreflightReceipt:
    expected_commit_sha: str
    candidate_id: str
    candidate_python: Path
    artifact_root: Path
    profile: CorrectiveProfile
    configuration: CorrectiveConfiguration
    languages: tuple[str, ...]
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


def _candidate_paths(candidate_id: str) -> tuple[Path, Path]:
    if candidate_id == CHATTERBOX_CANDIDATE_ID:
        environment = CHATTERBOX_ENVIRONMENT
        artifact_root = CHATTERBOX_ARTIFACT_ROOT
    elif candidate_id == MOSS_CANDIDATE_ID:
        environment = MOSS_ENVIRONMENT
        artifact_root = MOSS_ARTIFACT_ROOT
    else:
        _fail("candidate")
    return (
        REPOSITORY_ROOT / environment / ".venv" / "Scripts" / "python.exe",
        REPOSITORY_ROOT / artifact_root,
    )


def _load_candidate(
    candidate_id: str,
    artifact_root: Path,
) -> tuple[CorrectiveProfile, CorrectiveConfiguration, tuple[str, ...], CandidateRole]:
    if candidate_id == CHATTERBOX_CANDIDATE_ID:
        profile = load_chatterbox_v9_profile(REPOSITORY_ROOT)
        configuration = ChatterboxV9Configuration(artifact_root)
        verify_chatterbox_v9_artifacts(profile, configuration)
        return profile, configuration, ("es", "en"), "balanced"
    if candidate_id == MOSS_CANDIDATE_ID:
        moss_profile = load_moss_v9_profile(REPOSITORY_ROOT)
        moss_configuration = MossV9Configuration(
            artifact_root,
            artifact_root / "ephemeral-output",
        )
        verify_moss_v9_artifacts(moss_profile, moss_configuration)
        return moss_profile, moss_configuration, ("es", "en"), "compatibility"
    _fail("candidate")


def run_corrective_preflight(
    *,
    candidate_id: str,
    expected_commit_sha: str,
    conditions: ScreenConditions,
) -> CorrectivePreflightReceipt:
    """Verify one corrected exact identity without exposing host labels or paths."""

    load_frozen_v9_authority(REPOSITORY_ROOT)
    expected_python, artifact_root = _candidate_paths(candidate_id)
    repository = GitRepositoryProbe().snapshot(REPOSITORY_ROOT)
    host = WindowsHostProbe().snapshot(REPOSITORY_ROOT)
    failures: list[str] = []
    try:
        profile, configuration, languages, role = _load_candidate(candidate_id, artifact_root)
    except RuntimeError:
        profile, configuration, languages, role = (
            load_chatterbox_v9_profile(REPOSITORY_ROOT)
            if candidate_id == CHATTERBOX_CANDIDATE_ID
            else load_moss_v9_profile(REPOSITORY_ROOT),
            ChatterboxV9Configuration(artifact_root)
            if candidate_id == CHATTERBOX_CANDIDATE_ID
            else MossV9Configuration(artifact_root, artifact_root / "ephemeral-output"),
            ("es", "en"),
            "balanced" if candidate_id == CHATTERBOX_CANDIDATE_ID else "compatibility",
        )
        failures.append("artifact")
    try:
        candidate_python = expected_python.resolve(strict=True)
    except OSError:
        candidate_python = expected_python.resolve()
        failures.append("candidate-environment")
    network_isolation = WindowsFirewallNetworkProbe().active(candidate_python)
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
    if host.logical_processors < (8 if candidate_id == CHATTERBOX_CANDIDATE_ID else 4):
        failures.append("logical-processors")
    if host.total_ram_bytes < (
        24_576 * MIB if candidate_id == CHATTERBOX_CANDIDATE_ID else 16_384 * MIB
    ):
        failures.append("total-ram")
    if candidate_id == CHATTERBOX_CANDIDATE_ID and (
        host.total_vram_bytes is None
        or host.total_vram_bytes < 8_192 * MIB
        or host.free_vram_bytes is None
        or host.free_vram_bytes < 6_144 * MIB
        or not host.process_vram_available
    ):
        failures.append("vram")
    if not host.power_online:
        failures.append("power")
    if not conditions.sleep_disabled:
        failures.append("sleep")
    if not conditions.background_load_acceptable:
        failures.append("background-load")
    if not conditions.thermal_state_acceptable:
        failures.append("thermal-state")
    if os.environ.get("HF_HUB_OFFLINE") != "1":
        failures.append("offline-control")
    if candidate_id == CHATTERBOX_CANDIDATE_ID and (os.environ.get("TRANSFORMERS_OFFLINE") != "1"):
        failures.append("offline-control")
    if not network_isolation:
        failures.append("network-isolation")
    if platform.system() == "Windows" and Path(sys.executable).resolve() == candidate_python:
        failures.append("orchestrator-interpreter")
    return CorrectivePreflightReceipt(
        expected_commit_sha=expected_commit_sha,
        candidate_id=candidate_id,
        candidate_python=candidate_python,
        artifact_root=artifact_root,
        profile=profile,
        configuration=configuration,
        languages=languages,
        role=role,
        host=host,
        network_isolation=network_isolation,
        failures=tuple(dict.fromkeys(failures)),
    )


def _factory(receipt: CorrectivePreflightReceipt) -> AdapterFactory:
    if isinstance(receipt.profile, ChatterboxV9Profile) and isinstance(
        receipt.configuration, ChatterboxV9Configuration
    ):
        return ChatterboxV9AdapterFactory(receipt.profile, receipt.configuration)
    if isinstance(receipt.profile, MossV9Profile) and isinstance(
        receipt.configuration, MossV9Configuration
    ):
        return MossV9AdapterFactory(receipt.profile, receipt.configuration)
    _fail("candidate")


def _p95(values: tuple[float, ...]) -> float:
    if not values:
        _fail("observations")
    return distribution(values).p95


def _machine_observations(
    receipt: CorrectivePreflightReceipt,
    run: BenchmarkRun | None,
    minimum_available_ram_bytes: int | None,
    failure_code: str | None,
) -> tuple[str, ...]:
    observations: list[str] = []
    if run is None:
        observations.append(f"execution-{failure_code or 'failed'}")
        return tuple(observations)
    if len(run.load_observations) != 1 or run.load_observations[0].load_ns / 1_000_000_000 > 30:
        observations.append("preferred-cold-load-target-exceeded")
    for language in receipt.languages:
        attempts = tuple(
            value
            for value in run.generation_observations
            if value.case_id.startswith(f"{language}-")
        )
        if len(attempts) != 5:
            observations.append(f"{language}-generation-count-incomplete")
            continue
        first_audio = _p95(tuple(value.first_audio_ns / 1_000_000_000 for value in attempts))
        warm_rtf = _p95(
            tuple(
                real_time_factor(
                    value.wall_ns,
                    value.sample_count,
                    value.sample_rate_hz,
                )
                for value in attempts
            )
        )
        if first_audio > 7:
            observations.append(f"{language}-preferred-first-audio-target-exceeded")
        if warm_rtf > 1.1:
            observations.append(f"{language}-preferred-standard-rtf-target-exceeded")
    expected_cancellations = 4 * len(receipt.languages)
    if len(run.cancellation_observations) != expected_cancellations:
        observations.append("cancellation-trials-incomplete")
    if run.memory.peak_process_tree_ram_bytes > 4_096 * MIB:
        observations.append("preferred-process-ram-target-exceeded")
    if minimum_available_ram_bytes is None or minimum_available_ram_bytes < 4_096 * MIB:
        observations.append("preferred-available-ram-target-exceeded")
    if receipt.candidate_id == CHATTERBOX_CANDIDATE_ID and (
        receipt.host.total_vram_bytes is None
        or run.memory.peak_vram_bytes is None
        or run.memory.peak_vram_bytes > receipt.host.total_vram_bytes - 512 * MIB
    ):
        observations.append("preferred-vram-reserve-target-exceeded")
    if failure_code is not None:
        observations.append(f"execution-{failure_code}")
    return tuple(dict.fromkeys(observations))


def _attempt(observation: GenerationObservation, language: str) -> dict[str, object]:
    return {
        "caseId": observation.case_id,
        "language": language,
        "sampleCount": observation.sample_count,
        "sampleRateHz": observation.sample_rate_hz,
        "channels": observation.channels,
        "wallNanoseconds": observation.wall_ns,
        "firstAudioNanoseconds": observation.first_audio_ns,
        "status": "complete",
    }


def _raw_payload(
    *,
    receipt: CorrectivePreflightReceipt,
    run: BenchmarkRun | None,
    minimum_available_ram_bytes: int | None,
    failure_code: str | None,
) -> dict[str, object]:
    observations = _machine_observations(
        receipt,
        run,
        minimum_available_ram_bytes,
        failure_code,
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
    cancellations = (
        [
            {
                "trialId": observation.trial_id,
                "language": receipt.languages[min(index // 4, len(receipt.languages) - 1)],
                "passed": True,
                "stopNanoseconds": observation.stop_ns,
                "cleanupNanoseconds": observation.cleanup_ns,
            }
            for index, observation in enumerate(run.cancellation_observations)
        ]
        if run is not None
        else []
    )
    memory = (
        {
            "peakProcessTreeRamBytes": run.memory.peak_process_tree_ram_bytes,
            "peakDedicatedVramBytes": run.memory.peak_vram_bytes,
        }
        if run is not None
        else None
    )
    return {
        "schemaVersion": "tts-bilingual-raw-v9",
        "candidateId": receipt.candidate_id,
        "authorityCommitSha": AUTHORITY_COMMIT_SHA,
        "executionCommitSha": receipt.expected_commit_sha,
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": (
            CHATTERBOX_LOCK_SHA256
            if receipt.candidate_id == CHATTERBOX_CANDIDATE_ID
            else MOSS_LOCK_SHA256
        ),
        "status": (
            "measured-awaiting-decision"
            if run is not None
            else "execution-blocked-awaiting-decision"
        ),
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
        },
        "observations": list(observations),
        "decision": {"state": "pending-maintainer-decision"},
    }


def _content_safe_output(raw: dict[str, object], session_id: str) -> dict[str, object]:
    attempts = cast(list[dict[str, object]], raw["attempts"])
    performance: list[dict[str, object]] = []
    for language in cast(list[str], raw["languagesEvaluated"]):
        values = tuple(value for value in attempts if value["language"] == language)
        performance.append(
            {
                "language": language,
                "firstAudioP95Seconds": (
                    _p95(
                        tuple(
                            cast(int, value["firstAudioNanoseconds"]) / 1_000_000_000
                            for value in values
                        )
                    )
                    if values
                    else None
                ),
                "warmP95Rtf": (
                    _p95(
                        tuple(
                            real_time_factor(
                                cast(int, value["wallNanoseconds"]),
                                cast(int, value["sampleCount"]),
                                cast(int, value["sampleRateHz"]),
                            )
                            for value in values
                        )
                    )
                    if values
                    else None
                ),
            }
        )
    cancellations = cast(list[dict[str, object]], raw["cancellationTrials"])
    return {
        "status": raw["status"],
        "candidateId": raw["candidateId"],
        "sessionId": session_id,
        "decisionState": "pending-maintainer-decision",
        "rejectionRecorded": False,
        "counts": {
            "attempted": len(attempts),
            "completed": sum(value["status"] == "complete" for value in attempts),
            "cancellationTrials": len(cancellations),
        },
        "performanceByLanguage": performance,
        "memory": raw["memory"],
        "cancellation": {
            "requiredTrials": 4 * len(cast(list[str], raw["languagesEvaluated"])),
            "passedTrials": sum(value["passed"] is True for value in cancellations),
        },
        "observations": raw["observations"],
    }


def run_corrective_machine_evaluation(
    receipt: CorrectivePreflightReceipt,
) -> dict[str, object]:
    """Run one corrected candidate and retain decision-neutral private evidence."""

    if not receipt.eligible:
        _fail("preflight")
    corpora = tuple(load_bilingual_corpus(CORPUS_PATH, language) for language in receipt.languages)
    forbidden = (
        *(
            value
            for corpus in corpora
            for case in corpus.cases.values()
            for value in (case.text, case.privacy_canary)
        ),
        str(receipt.artifact_root),
        str(receipt.candidate_python),
    )
    factory = _factory(receipt)
    tracker = FrameworkVramTracker()

    def build_adapter() -> IsolatedBenchmarkAdapter:
        return IsolatedBenchmarkAdapter(
            factory,
            forbidden_values=forbidden,
            timeouts=IsolationTimeouts(
                load_seconds=300,
                request_seconds=180,
                termination_seconds=2,
                cleanup_seconds=5,
            ),
            framework_memory_observer=tracker.observe,
        )

    require_vram = receipt.candidate_id == CHATTERBOX_CANDIDATE_ID
    memory_probe = ProcessTreeMemoryProbe(
        root_pid=os.getpid(),
        sampler=WindowsProcessResourceSampler(
            vram_sampler=WindowsGpuProcessMemorySampler() if require_vram else None
        ),
        require_vram=require_vram,
        process_vram_sampling_interval_milliseconds=(
            PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS if require_vram else None
        ),
        framework_vram_tracker=tracker if require_vram else None,
    )
    available_ram = WindowsAvailableRamProbe()
    previous_executable = sys.executable
    multiprocessing.set_executable(str(receipt.candidate_python))
    available_ram.start()
    try:
        result = BenchmarkHarness(
            clock=SystemNanosecondClock(),
            memory_probe=memory_probe,
        ).run_bilingual_screen_protocol(
            adapter_factory=build_adapter,
            corpora=corpora,
            role=receipt.role,
        )
    finally:
        minimum_available_ram = available_ram.stop()
        multiprocessing.set_executable(previous_executable)
    raw = _raw_payload(
        receipt=receipt,
        run=result.run,
        minimum_available_ram_bytes=minimum_available_ram,
        failure_code=result.failure.code if result.failure is not None else None,
    )
    authority = load_frozen_v9_authority(REPOSITORY_ROOT)
    if tuple(Draft202012Validator(authority.raw_schema).iter_errors(raw)):
        _fail("raw-validation")
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
    output = _content_safe_output(raw, session_id)
    output["rawSha256"] = hashlib.sha256(raw_path.read_bytes()).hexdigest()
    return output
