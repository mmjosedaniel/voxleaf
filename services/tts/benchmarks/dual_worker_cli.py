"""Reviewed v5 CPU-pilot and official-arm command surface."""

from __future__ import annotations

import hashlib
import json
import math
import sys
import time
from pathlib import Path
from typing import Final, cast

from benchmarks import benchmark_safety
from benchmarks.adapters.factory import create_isolated_candidate_adapter
from benchmarks.adapters.manifest import (
    QWEN_V3_CANDIDATE_ID,
    CandidateConfiguration,
    CandidateProfile,
    load_v3_candidate_profile,
)
from benchmarks.dual_worker_command import (
    DualWorkerCommandError,
    DualWorkerCommandRequest,
    parse_dual_worker_command,
)
from benchmarks.dual_worker_contracts import (
    CPU_WORKER_ROLE,
    GPU_WORKER_ROLE,
    DualUnitRequest,
    DualWorkerArm,
    DualWorkerBenchmarkError,
    DualWorkerIdentity,
    DualWorkerRole,
    DualWorkIdentity,
)
from benchmarks.dual_worker_matrix import build_v5_requests
from benchmarks.dual_worker_official import (
    GIB,
    MAXIMUM_COMBINED_RAM_BYTES,
    MAXIMUM_GPU_DEDICATED_BYTES,
    MAXIMUM_GPU_SHARED_BYTES,
    MINIMUM_AVAILABLE_RAM_BYTES,
    MINIMUM_COMMIT_HEADROOM_BYTES,
    DualWorkerOfficialError,
    placement_load,
    run_measured_arm,
    serialize_dispatches,
    windows_system_memory,
)
from benchmarks.dual_worker_runtime import ThreadedDualWorkerRuntime
from benchmarks.isolation import IsolatedBenchmarkAdapter, IsolationTimeouts
from benchmarks.memory import (
    GPU_PROCESS_SHARED_MEMORY_COUNTER,
    WindowsGpuProcessMemorySampler,
)
from benchmarks.preflight import (
    PreflightReceipt,
    PreflightRequest,
    RunConditions,
    RunPurpose,
    run_local_preflight,
)
from benchmarks.v5_authority import (
    CORPUS_SHA256,
    CPU_PROFILE_ID,
    GPU_PROFILE_ID,
    PROFILE_SHA256,
    V5AuthorityError,
    load_frozen_v5_authority,
    require_v5_lineage,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
MAXIMUM_STDIN_BYTES: Final = 32_768
CPU_CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cpu-fp32-v5"
MINIMUM_PREFLIGHT_RAM_BYTES: Final = 12 * GIB
MINIMUM_PREFLIGHT_COMMIT_BYTES: Final = 8 * GIB
MINIMUM_PREFLIGHT_VRAM_BYTES: Final = 8_174_698_496
RESULT_PATHS: Final = {
    "cpu-solo": "benchmarks/tts/dual-worker-result-v5-cpu-solo.json",
    "gpu-solo": "benchmarks/tts/dual-worker-result-v5-gpu-solo.json",
}


def _read_payload() -> object:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode()) > MAXIMUM_STDIN_BYTES:
        raise DualWorkerCommandError("input-limit")
    try:
        return cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise DualWorkerCommandError("input") from None


def _roles(request: DualWorkerCommandRequest) -> tuple[DualWorkerRole, ...]:
    if request.arm == "cpu-solo":
        return (CPU_WORKER_ROLE,)
    if request.arm == "gpu-solo":
        return (GPU_WORKER_ROLE,)
    return (GPU_WORKER_ROLE, CPU_WORKER_ROLE)


def _host(receipt: PreflightReceipt) -> dict[str, object]:
    host = receipt.host
    return {
        "operatingSystem": host.operating_system,
        "osVersion": host.os_version,
        "architecture": host.architecture,
        "pythonVersion": host.python_version,
        "cpuModel": _normalized_cpu_model(host.cpu_model),
        "logicalProcessors": host.logical_processors,
        "totalRamBytes": host.total_ram_bytes,
        "gpuModel": host.gpu_model,
        "totalVramBytes": host.total_vram_bytes,
        "driverVersion": host.driver_version,
    }


def _normalized_cpu_model(value: str) -> str:
    return " ".join(value.replace("(R)", "").replace("(TM)", "").split())


def _summary_hash(arm: str, expected: str | None) -> None:
    if expected is None:
        return
    path = REPOSITORY_ROOT / RESULT_PATHS[arm]
    try:
        content = path.read_bytes()
        value = cast(object, json.loads(content))
    except (OSError, json.JSONDecodeError):
        raise DualWorkerCommandError("authority") from None
    if hashlib.sha256(content).hexdigest() != expected:
        raise DualWorkerCommandError("authority")
    result = _baseline_record(value)
    if (
        result.get("schemaVersion") != "tts-dual-worker-summary-v5"
        or result.get("profileSha256") != PROFILE_SHA256
        or result.get("corpusSha256") != CORPUS_SHA256
        or result.get("arm") != arm
    ):
        raise DualWorkerCommandError("authority")
    if arm == "gpu-solo":
        _qualify_gpu_baseline(result)
    conclusion_name = "cpuSoloAdmission" if arm == "cpu-solo" else None
    if conclusion_name is not None:
        conclusions = _baseline_record(result.get("conclusions"))
        conclusion = _baseline_record(conclusions.get(conclusion_name))
        if conclusion.get("outcome") != "pass":
            raise DualWorkerCommandError("authority")


def _baseline_record(value: object) -> dict[str, object]:
    if not isinstance(value, dict):
        raise DualWorkerCommandError("authority")
    return cast(dict[str, object], value)


def _baseline_number(value: object) -> float:
    if (
        isinstance(value, bool)
        or not isinstance(value, (int, float))
        or not math.isfinite(value)
        or value < 0
    ):
        raise DualWorkerCommandError("authority")
    return float(value)


def _qualify_gpu_baseline(result: dict[str, object]) -> None:
    """Enforce frozen v5 admission, without claiming production viability."""
    counts = _baseline_record(result.get("counts"))
    aggregates = _baseline_record(result.get("aggregates"))
    gpu = _baseline_record(aggregates.get("gpu"))
    cancellation = _baseline_record(result.get("cancellation"))
    audits = _baseline_record(result.get("audits"))
    memory = _baseline_record(result.get("memory"))
    expected_counts = {
        "measuredUnits": 40,
        "gpuMeasuredUnits": 40,
        "cpuMeasuredUnits": 0,
        "completedFirstAttempts": 40,
        "failedOrTimedOutFirstAttempts": 0,
        "automaticRetries": 0,
        "coldLoads": 3,
        "warmupUnits": 1,
        "cancellationTrials": 2,
    }
    required_audits = (
        "offline",
        "artifacts",
        "license",
        "privacy",
        "ordering",
        "boundedRetention",
        "cleanup",
        "cpuZeroGpu",
        "noDiskOffload",
        "approvedWorkerIdentities",
        "firstAttemptsOnly",
    )
    exact = (
        (
            aggregates,
            {
                "orderedPublishedUnits": 40,
                "duplicateOrMissingIdentities": 0,
                "reorderedPublishedUnits": 0,
            },
        ),
        (gpu, {"measuredUnits": 40}),
        (
            cancellation,
            {
                "trialCount": 2,
                "passedTrialCount": 2,
                "stalePublishedUnits": 0,
                "stalePlayedUnits": 0,
            },
        ),
        (counts, expected_counts),
    )
    if (
        result.get("profileVersion") != "tts-dual-worker-profile-v5"
        or result.get("corpusVersion") != "tts-dual-worker-corpus-v5"
        or result.get("failureCodes") != []
        or any(
            type(record.get(key)) is not int or record[key] != expected
            for record, expected_values in exact
            for key, expected in expected_values.items()
        )
        or any(audits.get(key) is not True for key in required_audits)
        or _baseline_number(aggregates.get("mediaSeconds")) < 300
        or _baseline_number(gpu.get("mediaSeconds")) < 300
        or _baseline_number(aggregates.get("maximumUnitDurationSeconds")) > 20
        or _baseline_number(aggregates.get("minimumUnitDurationSeconds")) <= 0
        or _baseline_number(cancellation.get("maximumIdentityInvalidationMilliseconds")) > 500
        or _baseline_number(cancellation.get("maximumWorkerTerminationMilliseconds")) > 2000
        or _baseline_number(memory.get("minimumSystemAvailableRamBytes"))
        < MINIMUM_AVAILABLE_RAM_BYTES
        or _baseline_number(memory.get("minimumSystemCommitHeadroomBytes"))
        < MINIMUM_COMMIT_HEADROOM_BYTES
        or _baseline_number(memory.get("peakCombinedProcessTreeRamBytes"))
        > MAXIMUM_COMBINED_RAM_BYTES
        or max(
            _baseline_number(memory.get("peakGpuWorkerDedicatedVramBytes")),
            _baseline_number(memory.get("peakFrameworkReservedVramBytes")),
        )
        > MAXIMUM_GPU_DEDICATED_BYTES
        or _baseline_number(memory.get("peakGpuWorkerSharedGpuBytes")) > MAXIMUM_GPU_SHARED_BYTES
        or _baseline_number(memory.get("peakCpuWorkerDedicatedVramBytes")) != 0
        or _baseline_number(memory.get("peakCpuWorkerSharedGpuBytes")) != 0
    ):
        raise DualWorkerCommandError("authority")


def _identity(role: DualWorkerRole, profile: CandidateProfile) -> DualWorkerIdentity:
    cpu = role == CPU_WORKER_ROLE
    return DualWorkerIdentity(
        worker_profile_id=CPU_PROFILE_ID if cpu else GPU_PROFILE_ID,
        candidate_id=CPU_CANDIDATE_ID if cpu else profile.candidate_id,
        role=role,
    )


def _adapter(
    *,
    role: DualWorkerRole,
    profile: CandidateProfile,
    configuration: CandidateConfiguration,
    forbidden_values: tuple[str, ...],
    diagnostic_max_new_tokens: int | None = None,
) -> IsolatedBenchmarkAdapter:
    cpu = role == CPU_WORKER_ROLE
    return create_isolated_candidate_adapter(
        profile=profile,
        configuration=configuration,
        forbidden_values=forbidden_values,
        timeouts=IsolationTimeouts(
            load_seconds=240.0 if cpu else 120.0,
            request_seconds=120.0,
            termination_seconds=2.0,
            cleanup_seconds=5.0,
        ),
        placement_profile_id=CPU_PROFILE_ID if cpu else GPU_PROFILE_ID,
        worker_candidate_id=CPU_CANDIDATE_ID if cpu else None,
        diagnostic_max_new_tokens=diagnostic_max_new_tokens,
    )


def _runtime(
    roles: tuple[DualWorkerRole, ...],
    profile: CandidateProfile,
    configuration: CandidateConfiguration,
    forbidden_values: tuple[str, ...],
    diagnostic_max_new_tokens: int | None = None,
) -> ThreadedDualWorkerRuntime:
    candidates = {
        role: _adapter(
            role=role,
            profile=profile,
            configuration=configuration,
            forbidden_values=forbidden_values,
            diagnostic_max_new_tokens=diagnostic_max_new_tokens,
        )
        for role in roles
    }
    return ThreadedDualWorkerRuntime(
        candidates,
        tuple(_identity(role, profile) for role in roles),
    )


def _sample_gpu(pid: int | None) -> tuple[int, int]:
    if pid is None:
        raise DualWorkerBenchmarkError("worker-crash")
    dedicated = WindowsGpuProcessMemorySampler()
    shared = WindowsGpuProcessMemorySampler(GPU_PROCESS_SHARED_MEMORY_COUNTER)
    try:
        dedicated_value, _ = dedicated.sample(frozenset((pid,)))
        shared_value, _ = shared.sample(frozenset((pid,)))
    finally:
        dedicated.close()
        shared.close()
    if dedicated_value is None or shared_value is None:
        raise DualWorkerBenchmarkError("resource-limit")
    return dedicated_value, shared_value


def _load_runtime(
    runtime: ThreadedDualWorkerRuntime,
    roles: tuple[DualWorkerRole, ...],
    start_index: int,
) -> list[dict[str, object]]:
    observations: list[dict[str, object]] = []
    for offset, role in enumerate(roles):
        started = time.perf_counter()
        runtime.load_worker(role)
        duration = time.perf_counter() - started
        dedicated, shared = _sample_gpu(runtime.worker_pid(role))
        observation = placement_load(
            role,
            start_index + offset,
            duration,
            runtime.placement_evidence(role),
            dedicated,
            shared,
        )
        if role == CPU_WORKER_ROLE and (
            observation["device"] != "cpu"
            or observation["dtype"] != "float32"
            or observation["intraOpThreads"] != 12
            or observation["interopThreads"] != 1
            or observation["cudaAvailable"] is not False
            or observation["cudaDeviceCount"] != 0
            or observation["diskOrMetaParameters"] != 0
            or observation["implicitFallback"] is not False
            or dedicated != 0
            or shared != 0
        ):
            raise DualWorkerBenchmarkError("resource-limit")
        if role == GPU_WORKER_ROLE and (
            observation["device"] != "cuda:0"
            or observation["dtype"] != "bfloat16"
            or observation["intraOpThreads"] != 4
            or observation["interopThreads"] != 1
            or observation["cudaAvailable"] is not True
            or observation["cudaDeviceCount"] != 1
            or observation["diskOrMetaParameters"] != 0
            or observation["implicitFallback"] is not False
            or dedicated > MAXIMUM_GPU_DEDICATED_BYTES
            or shared > MAXIMUM_GPU_SHARED_BYTES
        ):
            raise DualWorkerBenchmarkError("resource-limit")
        observations.append(observation)
    return observations


def _warmup(
    runtime: ThreadedDualWorkerRuntime,
    roles: tuple[DualWorkerRole, ...],
    requests: tuple[DualUnitRequest, ...],
) -> None:
    for index, role in enumerate(roles):
        runtime.submit(role, requests[index])
    remaining = frozenset(roles)
    while remaining:
        completion = runtime.next_completion(remaining)
        if completion.status != "completed":
            raise DualWorkerBenchmarkError(completion.failure_code or "generation-failed")
        remaining = remaining - {completion.worker.role}


def _cancellation_trials(
    *,
    arm: str,
    profile: CandidateProfile,
    configuration: CandidateConfiguration,
    forbidden_values: tuple[str, ...],
    requests: tuple[DualUnitRequest, ...],
    evidence: list[dict[str, object]] | None = None,
) -> list[dict[str, object]]:
    from benchmarks.dual_worker_trials import run_trials

    arm_roles = (
        (CPU_WORKER_ROLE,)
        if arm == "cpu-solo"
        else (GPU_WORKER_ROLE,)
        if arm == "gpu-solo"
        else (GPU_WORKER_ROLE, CPU_WORKER_ROLE)
    )
    results, proofs = run_trials(
        cast(DualWorkerArm, arm),
        requests,
        lambda: _runtime(arm_roles, profile, configuration, forbidden_values),
    )
    if evidence is not None:
        evidence.extend(proofs)
    return results


def _run(request: DualWorkerCommandRequest) -> dict[str, object]:
    """Run the reviewed v5 pilot or capture one private official arm."""

    if request.purpose == "official":
        try:
            require_v5_lineage(
                REPOSITORY_ROOT, request.authority_commit_sha, request.expected_commit_sha
            )
        except V5AuthorityError:
            raise DualWorkerCommandError("result-before-authority") from None
    authority = load_frozen_v5_authority(REPOSITORY_ROOT, validate_schemas=False)
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    candidate_python = request.candidate_python.resolve()
    if Path(sys.executable).resolve() != candidate_python:
        raise DualWorkerCommandError("interpreter")
    configuration = CandidateConfiguration(
        candidate_id=profile.candidate_id,
        artifact_root=request.artifact_root,
        model_revision=profile.model_revision,
        voice_id=profile.voice_id,
        provider=profile.provider,
        precision=profile.precision,
        offline=True,
    )
    purpose: RunPurpose = "pilot" if request.purpose == "cpu-solo-pilot" else "official"
    receipt = run_local_preflight(
        PreflightRequest(
            expected_commit_sha=request.expected_commit_sha,
            repository_root=REPOSITORY_ROOT,
            profile=profile,
            configuration=configuration,
            candidate_python=candidate_python,
            conditions=RunConditions(
                purpose=purpose,
                sleep_disabled=request.sleep_disabled,
                background_load_acceptable=request.background_load_acceptable,
                thermal_state_acceptable=request.thermal_state_acceptable,
            ),
        )
    )
    if receipt.failures or not receipt.eligible_for_official_run:
        if request.purpose == "cpu-solo-pilot" and not receipt.failures:
            pass
        else:
            raise DualWorkerCommandError("preflight")
    host = receipt.host
    available_ram, commit_used, commit_limit = windows_system_memory()
    commit_headroom = commit_limit - commit_used
    if (
        available_ram < MINIMUM_PREFLIGHT_RAM_BYTES
        or commit_headroom < MINIMUM_PREFLIGHT_COMMIT_BYTES
        or host.free_vram_bytes is None
        or host.free_vram_bytes < MINIMUM_PREFLIGHT_VRAM_BYTES
    ):
        raise DualWorkerCommandError("preflight")
    _summary_hash("cpu-solo", request.prior_cpu_solo_summary_sha256)
    _summary_hash("gpu-solo", request.prior_gpu_solo_summary_sha256)
    safety_session = None
    safety_baselines: dict[str, object] = {}
    if request.purpose == "official":
        if request.safety_binding is None:
            raise DualWorkerCommandError("evidence-version")
        safety_baselines = benchmark_safety.baseline_inputs(REPOSITORY_ROOT, request.safety_binding)
        safety_session = benchmark_safety.claim(REPOSITORY_ROOT, request.safety_binding)
    base_units = cast(list[dict[str, object]], authority.base_corpus["units"])
    forbidden = tuple(
        cast(str, unit[key])
        for unit in base_units
        for key in ("sourceText", "narrationText", "privacyCanary")
    )
    forbidden_values = (
        *forbidden,
        str(request.artifact_root),
        str(candidate_python),
    )
    roles = _roles(request)
    all_requests = build_v5_requests(
        REPOSITORY_ROOT,
        arm=request.arm,
        identity=DualWorkIdentity(
            request.session_id or "v5-disposable-pilot",
            f"v5-{request.arm}-generation",
        ),
    )
    runtime: ThreadedDualWorkerRuntime | None = None
    load_observations: list[dict[str, object]] = []
    try:
        if request.purpose == "cpu-solo-pilot" or request.arm == "concurrent":
            runtime = _runtime(
                roles,
                profile,
                configuration,
                forbidden_values,
                request.diagnostic_max_new_tokens,
            )
            load_observations = _load_runtime(runtime, roles, 0)
        else:
            cold_roles = (roles[0], roles[0], roles[0])
            for index, role in enumerate(cold_roles):
                runtime = _runtime((role,), profile, configuration, forbidden_values)
                load_observations.extend(_load_runtime(runtime, (role,), index))
                if index != len(cold_roles) - 1:
                    runtime.close()
                    runtime = None
        if runtime is None:
            raise DualWorkerBenchmarkError("worker-crash")
        _warmup(runtime, roles, all_requests)
        selected = all_requests[:2] if request.purpose == "cpu-solo-pilot" else all_requests
        observation, memory = run_measured_arm(
            arm=request.arm,
            runtime=runtime,
            requests=selected,
        )
        dispatches = serialize_dispatches(observation)
        if (
            observation.invalidated
            or len(observation.dispatches) != len(selected)
            or len(observation.released) != len(selected)
        ):
            raise DualWorkerBenchmarkError("generation-failed")
        media = sum(
            cast(float, item["durationSeconds"])
            for item in dispatches
            if item["durationSeconds"] is not None
        )
        elapsed = (
            (
                max(cast(int, item["completedNanoseconds"]) for item in dispatches)
                - min(cast(int, item["acceptedNanoseconds"]) for item in dispatches)
            )
            / 1_000_000_000
            if dispatches
            else 0
        )
        if request.purpose == "concurrent-diagnostic":
            role_metrics: dict[str, dict[str, float | int]] = {}
            for role in roles:
                role_dispatches = [item for item in dispatches if item["workerRole"] == role]
                role_media = sum(
                    cast(float, item["durationSeconds"])
                    for item in role_dispatches
                    if item["durationSeconds"] is not None
                )
                role_generation = sum(
                    cast(float, item["generationSeconds"])
                    for item in role_dispatches
                    if item["generationSeconds"] is not None
                )
                role_metrics[role] = {
                    "completedFirstAttempts": len(role_dispatches),
                    "mediaSeconds": role_media,
                    "generationSeconds": role_generation,
                    "totalRtf": role_generation / role_media if role_media else 0,
                }
            samples = memory.samples
            return {
                "schemaVersion": "tts-dual-worker-diagnostic-receipt-v1",
                "resultPurpose": request.purpose,
                "arm": request.arm,
                "status": "complete",
                "diagnosticMaxNewTokens": request.diagnostic_max_new_tokens,
                "measuredFirstAttempts": len(observation.dispatches),
                "completedFirstAttempts": len(observation.released),
                "aggregateRtf": elapsed / media if media else None,
                "maximumUnitDurationSeconds": max(
                    (
                        cast(float, item["durationSeconds"])
                        for item in dispatches
                        if item["durationSeconds"] is not None
                    ),
                    default=0,
                ),
                "workerMetrics": role_metrics,
                "peakCombinedProcessRamBytes": max(
                    item["controllerRamBytes"]
                    + item["gpuWorkerRamBytes"]
                    + item["cpuWorkerRamBytes"]
                    for item in samples
                ),
                "minimumSystemAvailableRamBytes": min(
                    item["systemAvailableRamBytes"] for item in samples
                ),
                "minimumSystemCommitHeadroomBytes": min(
                    item["systemCommitLimitBytes"] - item["systemCommitUsedBytes"]
                    for item in samples
                ),
                "peakGpuWorkerDedicatedVramBytes": max(
                    item["gpuWorkerDedicatedVramBytes"] for item in samples
                ),
                "peakGpuWorkerSharedGpuBytes": max(
                    item["gpuWorkerSharedGpuBytes"] for item in samples
                ),
                "peakCpuWorkerDedicatedVramBytes": max(
                    item["cpuWorkerDedicatedVramBytes"] for item in samples
                ),
                "peakCpuWorkerSharedGpuBytes": max(
                    item["cpuWorkerSharedGpuBytes"] for item in samples
                ),
                "privateRawCaptured": False,
                "eligibleForPromotion": False,
                "nextStep": "diagnostic-only",
            }
        if request.purpose == "cpu-solo-pilot":
            peak_cpu_dedicated = max(item["cpuWorkerDedicatedVramBytes"] for item in memory.samples)
            peak_cpu_shared = max(item["cpuWorkerSharedGpuBytes"] for item in memory.samples)
            admitted = (
                not observation.invalidated
                and len(observation.released) == len(selected)
                and media > 0
                and elapsed / media <= 3.2
                and peak_cpu_dedicated == 0
                and peak_cpu_shared == 0
            )
            return {
                "schemaVersion": "tts-dual-worker-command-receipt-v5",
                "resultPurpose": request.purpose,
                "arm": request.arm,
                "status": "complete" if admitted else "failed",
                "measuredFirstAttempts": len(observation.dispatches),
                "completedFirstAttempts": len(observation.released),
                "aggregateRtf": elapsed / media if media else None,
                "peakCpuWorkerDedicatedVramBytes": peak_cpu_dedicated,
                "peakCpuWorkerSharedGpuBytes": peak_cpu_shared,
                "peakActiveUnits": observation.peak_active_units,
                "peakReorderUnits": observation.peak_reorder_units,
                "staleRejectedUnits": observation.stale_rejected_units,
                "eligibleForPromotion": False,
                "cpuSoloOfficialAdmitted": admitted,
                "nextStep": ("milestone-8-cpu-solo-official" if admitted else "stop-cpu-solo"),
            }
        runtime.close()
        runtime = None
        trial_evidence: list[dict[str, object]] = []
        trials = _cancellation_trials(
            arm=request.arm,
            profile=profile,
            configuration=configuration,
            forbidden_values=forbidden_values,
            requests=all_requests,
            evidence=trial_evidence,
        )
        if request.session_id is None:
            raise DualWorkerCommandError("input")
        preflight = {
            "candidateInterpreterVerified": True,
            "authorityHashesVerified": True,
            "artifactHashesVerified": bool(receipt.artifacts),
            "offlineEnvironmentVerified": True,
            "localFilesOnlyVerified": True,
            "outboundFirewallBlocksVerified": True,
            "acPowerVerified": host.power_online,
            "sleepDisabled": request.sleep_disabled,
            "backgroundLoadAccepted": request.background_load_acceptable,
            "thermalStateAccepted": request.thermal_state_acceptable,
            "freeRamBytes": available_ram,
            "systemCommitHeadroomBytes": commit_headroom,
            "freeVramBytes": host.free_vram_bytes,
            "gpuSharedMemoryBytes": 0,
            "cpuCudaHidden": CPU_WORKER_ROLE not in roles
            or all(
                item["cudaAvailable"] is False
                for item in load_observations
                if item["workerRole"] == CPU_WORKER_ROLE
            ),
        }
        raw: dict[str, object] = {
            "schemaVersion": benchmark_safety.DUAL_RAW_VERSION,
            "profileVersion": "tts-dual-worker-profile-v5",
            "profileSha256": PROFILE_SHA256,
            "corpusSha256": CORPUS_SHA256,
            "authorityCommitSha": request.authority_commit_sha,
            "executionCommitSha": request.expected_commit_sha,
            "treeClean": True,
            "resultPurpose": "official",
            "arm": request.arm,
            "host": _host(receipt),
            "preflight": preflight,
            "loads": load_observations,
            "dispatches": dispatches,
            "cancellationTrials": trials,
            "memorySamples": list(memory.samples),
            "quality": {
                "status": "not-admitted",
                "evaluatorCount": 0,
                "observations": [],
            },
            "cleanup": {
                "workerProcessesRemaining": 0,
                "postCleanupTrackedRamBytes": 0,
                "postCleanupGpuWorkerDedicatedVramBytes": 0,
                "postCleanupGpuWorkerSharedGpuBytes": 0,
                "postCleanupCpuWorkerDedicatedVramBytes": 0,
                "postCleanupCpuWorkerSharedGpuBytes": 0,
                "rawSessionRemoved": False,
                "generatedAudioRemoved": True,
                "scorecardRemoved": True,
                "sleepSettingRestored": False,
            },
            "failureCodes": [],
        }
        assert safety_session is not None
        safety_session.complete(raw, {"trials.json": trial_evidence, **safety_baselines})
        return {
            "schemaVersion": "tts-dual-worker-command-receipt-v5",
            "resultPurpose": request.purpose,
            "arm": request.arm,
            "status": "pending-restoration",
            "evidenceVersion": benchmark_safety.VERSION,
            "measuredFirstAttempts": len(observation.dispatches),
            "completedFirstAttempts": len(observation.released),
            "privateRawCaptured": True,
            "eligibleForPromotion": False,
            "nextStep": "benchmark:tts:safety:finalize",
        }
    finally:
        if runtime is not None:
            primary_failure = sys.exception()
            try:
                runtime.close()
            except Exception:
                if primary_failure is None:
                    raise
                # Keep the primary stdout receipt; expose uncertain cleanup
                # separately without serializing either exception's contents.
                print('{"status":"fail","failureCode":"cleanup-failed"}', file=sys.stderr)


def main() -> int:
    if sys.argv != [sys.argv[0], "run"]:
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        result = _run(parse_dual_worker_command(_read_payload()))
        print(json.dumps(result, ensure_ascii=True, separators=(",", ":")))
        return 0 if result["status"] in ("complete", "pending-restoration") else 1
    except Exception as error:
        code = (
            error.code
            if isinstance(
                error,
                DualWorkerCommandError | DualWorkerBenchmarkError | DualWorkerOfficialError,
            )
            else "internal"
        )
        print(
            json.dumps(
                {"status": "fail", "failureCode": code},
                separators=(",", ":"),
            )
        )
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
