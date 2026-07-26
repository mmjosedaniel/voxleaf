"""Reviewed v5 CPU-pilot and official-arm command surface."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Final, cast

from benchmarks.adapters.factory import create_isolated_candidate_adapter
from benchmarks.adapters.manifest import (
    QWEN_V3_CANDIDATE_ID,
    CandidateConfiguration,
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
    DualWorkerBenchmarkError,
    DualWorkerIdentity,
    DualWorkerRole,
    DualWorkIdentity,
)
from benchmarks.dual_worker_controller import BoundedDualWorkerController
from benchmarks.dual_worker_matrix import build_v5_requests
from benchmarks.dual_worker_playback import simulate_v5_playback
from benchmarks.dual_worker_runtime import ThreadedDualWorkerRuntime
from benchmarks.isolation import IsolationTimeouts
from benchmarks.preflight import (
    PreflightRequest,
    RunConditions,
    RunPurpose,
    run_local_preflight,
)
from benchmarks.v5_authority import (
    CPU_PROFILE_ID,
    GPU_PROFILE_ID,
    load_frozen_v5_authority,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
MAXIMUM_STDIN_BYTES: Final = 32_768
CPU_CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cpu-fp32-v5"


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


def _run(request: DualWorkerCommandRequest) -> dict[str, object]:
    """Run only the reviewed mechanics; Milestone 8 owns official promotion."""

    authority = load_frozen_v5_authority(REPOSITORY_ROOT)
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
    candidates = {}
    identities: list[DualWorkerIdentity] = []
    for role in _roles(request):
        cpu = role == CPU_WORKER_ROLE
        identities.append(
            DualWorkerIdentity(
                worker_profile_id=CPU_PROFILE_ID if cpu else GPU_PROFILE_ID,
                candidate_id=CPU_CANDIDATE_ID if cpu else profile.candidate_id,
                role=role,
            )
        )
        candidates[role] = create_isolated_candidate_adapter(
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
    runtime = ThreadedDualWorkerRuntime(candidates, tuple(identities))
    controller = BoundedDualWorkerController()
    try:
        for role in _roles(request):
            runtime.load_worker(role)
        all_requests = build_v5_requests(
            REPOSITORY_ROOT,
            arm=request.arm,
            identity=DualWorkIdentity(
                request.session_id or "v5-disposable-pilot",
                f"v5-{request.arm}-generation",
            ),
        )
        selected = all_requests[:2] if request.purpose == "cpu-solo-pilot" else all_requests
        observation = controller.run(
            arm=request.arm,
            runtime=runtime,
            requests=selected,
        )
        playback = (
            simulate_v5_playback(observation.dispatches).as_raw()
            if request.arm == "concurrent"
            and len(observation.dispatches) == len(all_requests)
            and not observation.invalidated
            else None
        )
        return {
            "schemaVersion": "tts-dual-worker-command-receipt-v5",
            "resultPurpose": request.purpose,
            "arm": request.arm,
            "status": "complete" if not observation.invalidated else "failed",
            "measuredFirstAttempts": len(observation.dispatches),
            "completedFirstAttempts": len(observation.released),
            "peakActiveUnits": observation.peak_active_units,
            "peakReorderUnits": observation.peak_reorder_units,
            "staleRejectedUnits": observation.stale_rejected_units,
            "playback": playback,
            "eligibleForPromotion": False,
            "nextStep": (
                "milestone-8-private-raw-derivation"
                if request.purpose == "official"
                else "milestone-8-cpu-solo-official"
            ),
        }
    finally:
        controller.close(runtime)


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
