"""Manual candidate execution behind the closed preflight boundary."""

from __future__ import annotations

import os
import sys
import uuid
from collections.abc import Callable
from pathlib import Path
from typing import Final

from benchmarks.adapters.factory import create_isolated_candidate_adapter
from benchmarks.contracts import BenchmarkAdapter, BenchmarkFailure
from benchmarks.harness import BenchmarkHarness, SystemNanosecondClock, load_corpus
from benchmarks.memory import (
    PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS,
    FrameworkVramTracker,
    ProcessTreeMemoryProbe,
    WindowsGpuProcessMemorySampler,
    WindowsProcessResourceSampler,
)
from benchmarks.preflight import PreflightRequest
from benchmarks.raw import RawJournalError, RawMeasurementJournal

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v1.json"
RAW_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "results" / "raw"


def _forbidden_values(request: PreflightRequest) -> tuple[str, ...]:
    corpus = load_corpus(CORPUS_PATH)
    return (
        *(value for case in corpus.cases.values() for value in (case.text, case.privacy_canary)),
        str(request.configuration.artifact_root),
        str(request.candidate_python),
    )


def _worker_receipt(
    request: PreflightRequest,
    *,
    status: str,
    session_id: str | None,
    failure: BenchmarkFailure | None,
    counts: dict[str, int],
) -> dict[str, object]:
    return {
        "status": status,
        "purpose": request.conditions.purpose,
        "candidateId": request.profile.candidate_id,
        "sessionId": session_id,
        "failureCode": failure.code if failure is not None else None,
        "counts": counts,
        "eligibleForPromotion": False,
    }


def run_measurement_worker(
    request: PreflightRequest,
    *,
    adapter_builder: Callable[[], BenchmarkAdapter] | None = None,
) -> dict[str, object]:
    """Run one pilot or official protocol from the exact candidate interpreter."""

    try:
        if Path(sys.executable).resolve(strict=True) != request.candidate_python.resolve(
            strict=True
        ):
            raise RuntimeError("interpreter")
        corpus = load_corpus(CORPUS_PATH)
        sensitive_values = _forbidden_values(request)
        framework_tracker = FrameworkVramTracker() if request.profile.role == "balanced" else None

        def build_adapter() -> BenchmarkAdapter:
            if adapter_builder is not None:
                return adapter_builder()
            return create_isolated_candidate_adapter(
                profile=request.profile,
                configuration=request.configuration,
                forbidden_values=sensitive_values,
                framework_memory_observer=(
                    framework_tracker.observe if framework_tracker is not None else None
                ),
            )

        if request.conditions.purpose == "pilot":
            failure = BenchmarkHarness(
                clock=SystemNanosecondClock(),
                memory_probe=ProcessTreeMemoryProbe(
                    root_pid=os.getpid(),
                    sampler=WindowsProcessResourceSampler(),
                    require_vram=False,
                ),
            ).run_pilot(
                adapter_factory=build_adapter,
                corpus=corpus,
            )
            return _worker_receipt(
                request,
                status="pass" if failure is None else "fail",
                session_id=None,
                failure=failure,
                counts={
                    "coldLoads": 0,
                    "warmGenerations": 0,
                    "sustainedGenerations": 0,
                    "cancellationTrials": 0,
                },
            )

        session_id = uuid.uuid4().hex
        journal = RawMeasurementJournal(
            candidate_id=request.profile.candidate_id,
            role=request.profile.role,
            commit_sha=request.expected_commit_sha,
            session_id=session_id,
            protocol_version=(
                request.profile.authority.profile_version
                if request.profile.authority is not None
                else "tts-feasibility-profile-v2"
            ),
            configuration_identity_sha256=(
                request.profile.authority.configuration_identity_sha256
                if request.profile.authority is not None
                else None
            ),
        )
        vram_sampler = (
            WindowsGpuProcessMemorySampler() if request.profile.role == "balanced" else None
        )
        harness = BenchmarkHarness(
            clock=SystemNanosecondClock(),
            memory_probe=ProcessTreeMemoryProbe(
                root_pid=os.getpid(),
                sampler=WindowsProcessResourceSampler(vram_sampler=vram_sampler),
                require_vram=request.profile.role == "balanced",
                process_vram_sampling_interval_milliseconds=(
                    PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS
                    if request.profile.role == "balanced"
                    else None
                ),
                framework_vram_tracker=framework_tracker,
            ),
            observation_sink=journal,
        )
        result = harness.run_protocol(
            adapter_factory=build_adapter,
            corpus=corpus,
            role=request.profile.role,
        )
        if result.failure is not None and result.run is not None:
            journal.record_failure(result.failure)
        status = "complete" if result.failure is None else "failed"
        journal.write(
            RAW_ROOT,
            status=status,
            forbidden_values=sensitive_values,
        )
        return _worker_receipt(
            request,
            status="pass" if result.failure is None else "fail",
            session_id=session_id,
            failure=result.failure,
            counts=journal.counts(),
        )
    except (OSError, RawJournalError, RuntimeError):
        return _worker_receipt(
            request,
            status="fail",
            session_id=None,
            failure=BenchmarkFailure(code="invalid-request"),
            counts={
                "coldLoads": 0,
                "warmGenerations": 0,
                "sustainedGenerations": 0,
                "cancellationTrials": 0,
            },
        )
