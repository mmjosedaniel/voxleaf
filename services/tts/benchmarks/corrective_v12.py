"""Exact-host Chatterbox full bilingual evaluation under frozen v12 authority."""

from __future__ import annotations

import json
import multiprocessing
import os
import re
import sys
import uuid
from dataclasses import dataclass
from pathlib import Path
from typing import Final, NoReturn, cast

from benchmarks.bilingual_baseline import WindowsAvailableRamProbe
from benchmarks.chatterbox_v11_screen import (
    CorrectivePreflightReceipt,
    ScreenConditions,
    _factory,
    run_corrective_preflight,
)
from benchmarks.contracts import BenchmarkRun, GenerationObservation
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
from benchmarks.v7_authority import CORPUS_SHA256
from benchmarks.v11_authority import LOCK_SHA256
from benchmarks.v12_authority import (
    CANDIDATES_SHA256,
    CHATTERBOX_CANDIDATE_ID,
    PROFILE_SHA256,
    git_authority_tree_matches,
    git_is_strict_ancestor,
    load_frozen_v12_authority,
    validate_v12_raw_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v7.json"
RAW_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "raw" / "v12"
SESSION_ID = re.compile(r"^[0-9a-f]{32}$")


class CorrectiveV12Error(RuntimeError):
    """Fixed content-free v12 execution failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-corrective-v12:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise CorrectiveV12Error(code)


@dataclass(frozen=True)
class V12PreflightReceipt:
    """Verified frozen authority and exact Chatterbox host receipt."""

    authority_commit_sha: str
    execution: CorrectivePreflightReceipt
    failures: tuple[str, ...]

    @property
    def eligible(self) -> bool:
        return not self.failures


def run_v12_preflight(
    *,
    authority_commit_sha: str,
    execution_commit_sha: str,
    conditions: ScreenConditions,
) -> V12PreflightReceipt:
    """Verify v12 ancestry/tree plus the unchanged exact v11 runtime."""

    load_frozen_v12_authority(REPOSITORY_ROOT)
    receipt = run_corrective_preflight(
        candidate_id=CHATTERBOX_CANDIDATE_ID,
        expected_commit_sha=execution_commit_sha,
        conditions=conditions,
    )
    failures = list(receipt.failures)
    if not git_authority_tree_matches(REPOSITORY_ROOT, authority_commit_sha):
        failures.append("authority-tree")
    if not git_is_strict_ancestor(
        REPOSITORY_ROOT,
        authority_commit_sha,
        execution_commit_sha,
    ):
        failures.append("result-before-authority")
    return V12PreflightReceipt(
        authority_commit_sha=authority_commit_sha,
        execution=receipt,
        failures=tuple(dict.fromkeys(failures)),
    )


def _p95(values: tuple[float, ...]) -> float:
    if not values:
        _fail("observations")
    return distribution(values).p95


def _language(observation: GenerationObservation) -> str:
    language = observation.case_id.split("-", maxsplit=1)[0]
    if language not in ("es", "en"):
        _fail("observations")
    return language


def _attempt(observation: GenerationObservation) -> dict[str, object]:
    return {
        "caseId": observation.case_id,
        "language": _language(observation),
        "phase": observation.phase,
        "sampleCount": observation.sample_count,
        "sampleRateHz": observation.sample_rate_hz,
        "channels": observation.channels,
        "wallNanoseconds": observation.wall_ns,
        "firstAudioNanoseconds": observation.first_audio_ns,
        "status": "complete",
    }


def _observations(
    run: BenchmarkRun | None,
    minimum_available_ram_bytes: int | None,
    failure_code: str | None,
) -> tuple[str, ...]:
    values: list[str] = []
    if run is None:
        return (f"execution-{failure_code or 'failed'}",)
    if len(run.load_observations) != 5:
        values.append("cold-load-count-incomplete")
    elif _p95(tuple(value.load_ns / 1_000_000_000 for value in run.load_observations)) > 30:
        values.append("preferred-cold-load-target-exceeded")
    for language in ("es", "en"):
        warm = tuple(
            value
            for value in run.generation_observations
            if value.phase == "warm" and _language(value) == language
        )
        sustained = tuple(
            value
            for value in run.generation_observations
            if value.phase == "sustained" and _language(value) == language
        )
        if len(warm) != 10:
            values.append(f"{language}-warm-count-incomplete")
        else:
            if _p95(tuple(value.first_audio_ns / 1_000_000_000 for value in warm)) > 7:
                values.append(f"{language}-preferred-first-audio-target-exceeded")
            if (
                _p95(
                    tuple(
                        real_time_factor(
                            value.wall_ns,
                            value.sample_count,
                            value.sample_rate_hz,
                        )
                        for value in warm
                    )
                )
                > 1.1
            ):
                values.append(f"{language}-preferred-warm-rtf-target-exceeded")
        if len(sustained) != 15:
            values.append(f"{language}-sustained-count-incomplete")
        else:
            rtfs = tuple(
                real_time_factor(
                    value.wall_ns,
                    value.sample_count,
                    value.sample_rate_hz,
                )
                for value in sustained
            )
            media_seconds = sum(value.sample_count / value.sample_rate_hz for value in sustained)
            wall_seconds = sum(value.wall_ns / 1_000_000_000 for value in sustained)
            if _p95(rtfs) > 1.1:
                values.append(f"{language}-preferred-sustained-rtf-target-exceeded")
            if media_seconds <= 0 or wall_seconds / media_seconds > 1.08:
                values.append(f"{language}-preferred-total-rtf-target-exceeded")
    if run.memory.peak_process_tree_ram_bytes > 4_096 * 1024**2:
        values.append("preferred-process-ram-target-exceeded")
    if run.memory.peak_vram_bytes is None or run.memory.peak_vram_bytes > 7_488 * 1024**2:
        values.append("preferred-vram-reserve-target-not-proven")
    if minimum_available_ram_bytes is None or minimum_available_ram_bytes < 4_096 * 1024**2:
        values.append("minimum-available-ram-target-not-met")
    if len(run.cancellation_observations) != 8 or failure_code == "cancellation-failed":
        values.append("cancellation-trials-incomplete")
    if failure_code is not None and failure_code != "cancellation-failed":
        values.append(f"execution-{failure_code}")
    return tuple(dict.fromkeys(values))


def build_raw_result(
    *,
    receipt: V12PreflightReceipt,
    run: BenchmarkRun | None,
    minimum_available_ram_bytes: int | None,
    failure_code: str | None,
) -> dict[str, object]:
    """Build the private schema-closed result without waveform payloads."""

    attempts = (
        [_attempt(observation) for observation in run.generation_observations]
        if run is not None
        else []
    )
    cancellations = (
        [
            {
                "trialId": observation.trial_id,
                "language": ("es" if index < 4 else "en"),
                "passed": True,
                "stopNanoseconds": observation.stop_ns,
                "cleanupNanoseconds": observation.cleanup_ns,
                "staleUnits": observation.stale_frames,
                "processesRemaining": 0,
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
            "minimumAvailableSystemRamBytes": minimum_available_ram_bytes,
        }
        if run is not None and minimum_available_ram_bytes is not None
        else None
    )
    cleanup = (
        run is not None
        and len(cancellations) == 8
        and all(
            value.raw_session_removed
            and value.stale_frames == 0
            and value.cleanup_ns <= 5_000_000_000
            for value in run.cancellation_observations
        )
    )
    return {
        "schemaVersion": "tts-bilingual-full-raw-v12",
        "candidateId": CHATTERBOX_CANDIDATE_ID,
        "authorityCommitSha": receipt.authority_commit_sha,
        "executionCommitSha": receipt.execution.expected_commit_sha,
        "profileSha256": PROFILE_SHA256,
        "corpusSha256": CORPUS_SHA256,
        "candidateManifestSha256": CANDIDATES_SHA256,
        "dependencyLockSha256": LOCK_SHA256,
        "status": (
            "measured-awaiting-decision"
            if run is not None
            else "execution-blocked-awaiting-decision"
        ),
        "languagesEvaluated": ["es", "en"],
        "loadObservations": (
            [
                {
                    "loadNanoseconds": value.load_ns,
                    "cleanupNanoseconds": value.cleanup_ns,
                }
                for value in run.load_observations
            ]
            if run is not None
            else []
        ),
        "attempts": attempts,
        "cancellationTrials": cancellations,
        "memory": memory,
        "audits": {
            "artifacts": "artifact" not in receipt.failures,
            "offline": "offline-control" not in receipt.failures,
            "networkIsolation": receipt.execution.network_isolation,
            "privacy": failure_code != "privacy",
            "boundedRetention": True,
            "cleanup": cleanup,
        },
        "observations": list(_observations(run, minimum_available_ram_bytes, failure_code)),
        "decision": {"state": "pending-maintainer-decision"},
    }


def run_v12_machine_evaluation(receipt: V12PreflightReceipt) -> dict[str, object]:
    """Run and retain one ignored private Chatterbox full matrix."""

    if not receipt.eligible:
        _fail("preflight")
    execution = receipt.execution
    corpora = tuple(load_bilingual_corpus(CORPUS_PATH, language) for language in ("es", "en"))
    forbidden = (
        *(
            value
            for corpus in corpora
            for case in corpus.cases.values()
            for value in (case.text, case.privacy_canary)
        ),
        str(execution.artifact_root),
        str(execution.candidate_python),
    )
    factory = _factory(execution)
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

    memory_probe = ProcessTreeMemoryProbe(
        root_pid=os.getpid(),
        sampler=WindowsProcessResourceSampler(vram_sampler=WindowsGpuProcessMemorySampler()),
        require_vram=True,
        process_vram_sampling_interval_milliseconds=(PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS),
        framework_vram_tracker=tracker,
    )
    available_ram = WindowsAvailableRamProbe()
    previous_executable = sys.executable
    multiprocessing.set_executable(str(execution.candidate_python))
    available_ram.start()
    try:
        result = BenchmarkHarness(
            clock=SystemNanosecondClock(),
            memory_probe=memory_probe,
        ).run_bilingual_full_protocol(
            adapter_factory=build_adapter,
            corpora=corpora,
            role=execution.role,
        )
    finally:
        minimum_available_ram = available_ram.stop()
        multiprocessing.set_executable(previous_executable)
    raw = build_raw_result(
        receipt=receipt,
        run=result.run,
        minimum_available_ram_bytes=minimum_available_ram,
        failure_code=result.failure.code if result.failure is not None else None,
    )
    validate_v12_raw_result(REPOSITORY_ROOT, raw)
    session_id = uuid.uuid4().hex
    if SESSION_ID.fullmatch(session_id) is None:
        _fail("session")
    session = (RAW_ROOT / CHATTERBOX_CANDIDATE_ID / session_id).resolve()
    try:
        session.relative_to(RAW_ROOT.resolve())
    except ValueError:
        _fail("session")
    session.mkdir(parents=True)
    (session / "machine.raw.json").write_text(
        json.dumps(raw, ensure_ascii=True, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return {
        "status": raw["status"],
        "candidateId": CHATTERBOX_CANDIDATE_ID,
        "sessionId": session_id,
        "counts": {
            "coldLoads": len(cast(list[object], raw["loadObservations"])),
            "attempts": len(cast(list[object], raw["attempts"])),
            "cancellationTrials": len(cast(list[object], raw["cancellationTrials"])),
        },
        "observations": raw["observations"],
        "qualityReady": raw["status"] == "measured-awaiting-decision",
        "decisionState": "pending-maintainer-decision",
    }
