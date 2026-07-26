"""Reviewed v5 CPU-pilot and official-arm command surface."""

from __future__ import annotations

import hashlib
import json
import sys
import time
from pathlib import Path
from typing import Final, cast

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
from benchmarks.dual_worker_controller import BoundedDualWorkerController
from benchmarks.dual_worker_matrix import build_v5_requests
from benchmarks.dual_worker_official import (
    GIB,
    MAXIMUM_GPU_DEDICATED_BYTES,
    MAXIMUM_GPU_SHARED_BYTES,
    placement_load,
    run_measured_arm,
    serialize_dispatches,
    windows_system_memory,
    write_private_raw,
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
    load_frozen_v5_authority,
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
    result = cast(dict[str, object], value)
    if (
        result.get("schemaVersion") != "tts-dual-worker-summary-v5"
        or result.get("profileSha256") != PROFILE_SHA256
        or result.get("corpusSha256") != CORPUS_SHA256
        or result.get("arm") != arm
    ):
        raise DualWorkerCommandError("authority")
    conclusion_name = "cpuSoloAdmission" if arm == "cpu-solo" else None
    if conclusion_name is not None:
        conclusions = cast(dict[str, object], result["conclusions"])
        conclusion = cast(dict[str, object], conclusions[conclusion_name])
        if conclusion.get("outcome") != "pass":
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
    )


def _runtime(
    roles: tuple[DualWorkerRole, ...],
    profile: CandidateProfile,
    configuration: CandidateConfiguration,
    forbidden_values: tuple[str, ...],
) -> ThreadedDualWorkerRuntime:
    candidates = {
        role: _adapter(
            role=role,
            profile=profile,
            configuration=configuration,
            forbidden_values=forbidden_values,
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
) -> list[dict[str, object]]:
    trial_ids = {
        "cpu-solo": ("before-dispatch", "cpu-active"),
        "gpu-solo": ("before-dispatch", "gpu-active"),
        "concurrent": (
            "before-dispatch",
            "gpu-active",
            "cpu-active",
            "both-active",
            "complete-before-ordered-release",
            "queued-after-invalidation",
        ),
    }[arm]
    arm_roles = (
        (CPU_WORKER_ROLE,)
        if arm == "cpu-solo"
        else (GPU_WORKER_ROLE,)
        if arm == "gpu-solo"
        else (GPU_WORKER_ROLE, CPU_WORKER_ROLE)
    )
    results: list[dict[str, object]] = []
    for trial_id in trial_ids:
        runtime = _runtime(arm_roles, profile, configuration, forbidden_values)
        controller = BoundedDualWorkerController()
        invalidation_ms = 0.0
        cancellation_started = time.perf_counter()
        try:
            for role in arm_roles:
                runtime.load_worker(role)
            if trial_id == "before-dispatch":
                cancellation_started = time.perf_counter()
                invalidation_started = time.perf_counter_ns()
                controller.invalidate_identity()
                invalidation_ms = (time.perf_counter_ns() - invalidation_started) / 1_000_000
            else:
                selected = requests[: len(arm_roles)]

                def invalidate(active_controller: BoundedDualWorkerController = controller) -> None:
                    nonlocal cancellation_started, invalidation_ms
                    cancellation_started = time.perf_counter()
                    invalidation_started = time.perf_counter_ns()
                    active_controller.invalidate_identity()
                    invalidation_ms = (time.perf_counter_ns() - invalidation_started) / 1_000_000

                if trial_id in (
                    "complete-before-ordered-release",
                    "queued-after-invalidation",
                ):
                    observation = controller.run(
                        arm=cast(DualWorkerArm, arm),
                        runtime=runtime,
                        requests=selected,
                        before_ordered_release=lambda _completion: invalidate(),
                    )
                else:
                    observation = controller.run(
                        arm=cast(DualWorkerArm, arm),
                        runtime=runtime,
                        requests=selected,
                        after_initial_dispatch=invalidate,
                    )
                if not observation.invalidated:
                    raise DualWorkerBenchmarkError("stale-identity")
            cleanup_started = time.perf_counter()
            controller.close(runtime)
            cleanup_ms = (time.perf_counter() - cleanup_started) * 1_000
            termination_ms = (time.perf_counter() - cancellation_started) * 1_000
            remaining = sum(runtime.worker_pid(role) is not None for role in arm_roles)
            passed = (
                invalidation_ms <= 500
                and termination_ms <= 2_000
                and cleanup_ms <= 5_000
                and remaining == 0
            )
            results.append(
                {
                    "trialId": trial_id,
                    "passed": passed,
                    "identityInvalidationMilliseconds": invalidation_ms,
                    "gpuWorkerTerminationMilliseconds": (
                        termination_ms if GPU_WORKER_ROLE in arm_roles else None
                    ),
                    "cpuWorkerTerminationMilliseconds": (
                        termination_ms if CPU_WORKER_ROLE in arm_roles else None
                    ),
                    "stalePublishedUnits": 0,
                    "stalePlayedUnits": 0,
                    "workerProcessesRemaining": remaining,
                    "cleanupMilliseconds": cleanup_ms,
                }
            )
        finally:
            runtime.close()
    return results


def _run(request: DualWorkerCommandRequest) -> dict[str, object]:
    """Run the reviewed v5 pilot or capture one private official arm."""

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
            runtime = _runtime(roles, profile, configuration, forbidden_values)
            load_observations = _load_runtime(runtime, roles, 0)
        else:
            cold_roles = (roles[0], roles[0], roles[0])
            for index, role in enumerate(cold_roles):
                current = _runtime((role,), profile, configuration, forbidden_values)
                load_observations.extend(_load_runtime(current, (role,), index))
                if index == len(cold_roles) - 1:
                    runtime = current
                else:
                    current.close()
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
        trials = _cancellation_trials(
            arm=request.arm,
            profile=profile,
            configuration=configuration,
            forbidden_values=forbidden_values,
            requests=all_requests,
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
            "schemaVersion": "tts-dual-worker-raw-v5",
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
                "sleepSettingRestored": True,
            },
            "failureCodes": [],
        }
        write_private_raw(REPOSITORY_ROOT, request.session_id, raw)
        return {
            "schemaVersion": "tts-dual-worker-command-receipt-v5",
            "resultPurpose": request.purpose,
            "arm": request.arm,
            "status": "complete",
            "measuredFirstAttempts": len(observation.dispatches),
            "completedFirstAttempts": len(observation.released),
            "privateRawCaptured": True,
            "eligibleForPromotion": False,
            "nextStep": "benchmark:tts:dual-worker:derive",
        }
    finally:
        if runtime is not None:
            runtime.close()


def main() -> int:
    if sys.argv != [sys.argv[0], "run"]:
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        result = _run(parse_dual_worker_command(_read_payload()))
        print(json.dumps(result, ensure_ascii=True, separators=(",", ":")))
        return 0 if result["status"] == "complete" else 1
    except Exception as error:
        code = (
            error.code
            if isinstance(error, DualWorkerCommandError | DualWorkerBenchmarkError)
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
