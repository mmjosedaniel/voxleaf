"""Prospective v5 cancellation trials at observed controller/child barriers."""

from __future__ import annotations

import time
from collections.abc import Callable
from dataclasses import replace
from typing import cast

from benchmarks.dual_worker_contracts import (
    CPU_WORKER_ROLE,
    GPU_WORKER_ROLE,
    DualUnitRequest,
    DualWorkerArm,
    DualWorkerBenchmarkError,
    DualWorkerRole,
)
from benchmarks.dual_worker_controller import BoundedDualWorkerController, ControllerPhase
from benchmarks.dual_worker_runtime import ThreadedDualWorkerRuntime

TRIALS = {
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
}


def _require(condition: bool) -> None:
    if not condition:
        raise DualWorkerBenchmarkError("invalid-output")


def run_trials(
    arm: DualWorkerArm,
    requests: tuple[DualUnitRequest, ...],
    factory: Callable[[], ThreadedDualWorkerRuntime],
) -> tuple[list[dict[str, object]], list[dict[str, object]]]:
    roles: tuple[DualWorkerRole, ...] = (
        (CPU_WORKER_ROLE,)
        if arm == "cpu-solo"
        else (GPU_WORKER_ROLE,)
        if arm == "gpu-solo"
        else (GPU_WORKER_ROLE, CPU_WORKER_ROLE)
    )
    results: list[dict[str, object]] = []
    proofs: list[dict[str, object]] = []
    for trial in TRIALS[arm]:
        runtime = factory()
        controller = BoundedDualWorkerController()
        selected = _trial_requests(requests, trial, len(roles))
        proof: dict[str, object] = {
            "trialId": trial,
            "session": selected[0].identity.session_id,
            "generation": selected[0].identity.generation_id,
            "admitted": [item.occurrence_id for item in selected],
            "queued": [],
            "entries": [],
            "completion": None,
            "controlReleased": [],
        }
        started = 0
        invalidation_ns = 0

        def observe(
            phase: ControllerPhase,
            *,
            trial: str = trial,
            runtime: ThreadedDualWorkerRuntime = runtime,
            proof: dict[str, object] = proof,
            controller: BoundedDualWorkerController = controller,
        ) -> None:
            nonlocal started, invalidation_ns
            target = (
                "admitted"
                if trial == "before-dispatch"
                else "completed"
                if trial == "complete-before-ordered-release"
                else "dispatched"
            )
            if phase.name != target or started:
                return
            if trial.endswith("active"):
                runtime.await_entry_witnesses()
            proof["queued"] = [item.occurrence_id for item in phase.queued]
            if trial == "complete-before-ordered-release":
                _require(len(phase.completed) == 1)
                completed = phase.completed[0]
                _require(completed.audio is not None and completed.status == "completed")
                assert completed.audio is not None
                proof["completion"] = {
                    "occurrence": completed.request.occurrence_id,
                    "samples": completed.audio.sample_count,
                    "rate": completed.audio.sample_rate_hz,
                    "accepted": completed.accepted_nanoseconds,
                    "completed": completed.completed_nanoseconds,
                }
            started = time.perf_counter_ns()
            controller.invalidate_identity()
            invalidation_ns = time.perf_counter_ns() - started
            if trial.endswith("active"):
                runtime.release_entry_witnesses()

        try:
            for role in roles:
                runtime.load_worker(role)
            if trial.endswith("active"):
                _require(callable(getattr(runtime, "arm_entry_witnesses", None)))
                witness_roles = (
                    roles
                    if trial == "both-active"
                    else (GPU_WORKER_ROLE,)
                    if trial == "gpu-active"
                    else (CPU_WORKER_ROLE,)
                )
                runtime.arm_entry_witnesses(witness_roles)
            observation = controller.run(
                arm=arm,
                runtime=runtime,
                requests=selected,
                observe_phase=observe,
            )
            _require(started > 0 and observation.invalidated)
            cleanup_started = time.perf_counter_ns()
            controller.close(runtime)
            cleanup_ms = (time.perf_counter_ns() - cleanup_started) / 1_000_000
            termination_ms = (time.perf_counter_ns() - started) / 1_000_000
            if trial.endswith("active"):
                proof["entries"] = runtime.entry_evidence()
            proof["dispatches"] = [
                {
                    "occurrence": item.occurrence_id,
                    "role": item.worker_role,
                    "status": item.status,
                    "published": item.published_sequence,
                }
                for item in observation.dispatches
            ]
            proof["released"] = [item.occurrence_id for item in observation.released]
            proof["staleRejected"] = observation.stale_rejected_units
            remaining = sum(runtime.worker_pid(role) is not None for role in roles)
            result: dict[str, object] = {
                "trialId": trial,
                "passed": False,
                "identityInvalidationMilliseconds": invalidation_ns / 1_000_000,
                "gpuWorkerTerminationMilliseconds": termination_ms
                if GPU_WORKER_ROLE in roles
                else None,
                "cpuWorkerTerminationMilliseconds": termination_ms
                if CPU_WORKER_ROLE in roles
                else None,
                "stalePublishedUnits": len(observation.released),
                "stalePlayedUnits": 0,
                "workerProcessesRemaining": remaining,
                "cleanupMilliseconds": cleanup_ms,
            }
        finally:
            runtime.close()
        if trial == "queued-after-invalidation":
            control = factory()
            try:
                for role in roles:
                    control.load_worker(role)
                control_result = BoundedDualWorkerController().run(
                    arm=arm,
                    runtime=control,
                    requests=selected,
                )
                _require(not control_result.invalidated)
                proof["controlReleased"] = [item.occurrence_id for item in control_result.released]
            finally:
                control.close()
        # Validation derives the truth of the witness before marking its frozen projection.
        _validate_proof(proof, selected, roles)
        result["passed"] = (
            invalidation_ns <= 500_000_000
            and termination_ms <= 2_000
            and cleanup_ms <= 5_000
            and remaining == 0
        )
        results.append(result)
        proofs.append(proof)
    return results, proofs


def _trial_requests(
    requests: tuple[DualUnitRequest, ...], trial: str, roles: int
) -> tuple[DualUnitRequest, ...]:
    identity = replace(
        requests[0].identity, generation_id=f"{requests[0].identity.generation_id}:{trial}"
    )
    return tuple(
        replace(item, identity=identity)
        for item in requests[: 3 if trial == "queued-after-invalidation" else roles]
    )


def _validate_proof(
    proof: dict[str, object],
    requests: tuple[DualUnitRequest, ...],
    roles: tuple[DualWorkerRole, ...],
) -> None:
    _require(
        set(proof)
        == {
            "trialId",
            "session",
            "generation",
            "admitted",
            "queued",
            "entries",
            "completion",
            "controlReleased",
            "dispatches",
            "released",
            "staleRejected",
        }
    )
    trial = proof["trialId"]
    _require(type(proof["staleRejected"]) is int and 0 <= proof["staleRejected"] <= 2)
    admitted = [item.occurrence_id for item in requests]
    _require(
        proof["admitted"] == admitted
        and proof["session"] == requests[0].identity.session_id
        and proof["generation"] == requests[0].identity.generation_id
        and proof["released"] == []
    )
    dispatches = proof["dispatches"]
    _require(isinstance(dispatches, list))
    dispatches = cast(list[dict[str, object]], dispatches)
    expected_count = 0 if trial == "before-dispatch" else len(roles)
    _require(len(dispatches) == expected_count)
    for index, dispatch in enumerate(dispatches):
        _require(
            isinstance(dispatch, dict)
            and set(dispatch) == {"occurrence", "role", "status", "published"}
        )
        _require(
            dispatch["occurrence"] == admitted[index]
            and dispatch["role"] == roles[index]
            and dispatch["published"] is None
            and dispatch["status"] in ("failed", "stale-rejected")
        )
    if trial == "before-dispatch":
        _require(proof["queued"] == admitted and proof["staleRejected"] == 0)
    elif trial == "queued-after-invalidation":
        _require(
            len(admitted) == 3
            and proof["queued"] == admitted[2:]
            and proof["controlReleased"] == admitted
            and proof["staleRejected"] == 2
        )
    elif trial == "complete-before-ordered-release":
        completion = proof["completion"]
        _require(isinstance(completion, dict))
        completion = cast(dict[str, object], completion)
        _require(set(completion) == {"occurrence", "samples", "rate", "accepted", "completed"})
        _require(
            completion["occurrence"] in admitted
            and completion["rate"] == 24_000
            and type(completion["samples"]) is int
            and 0 < completion["samples"] <= 480_000
            and type(completion["accepted"]) is int
            and type(completion["completed"]) is int
            and 0 <= completion["accepted"] <= completion["completed"]
            and completion["completed"] <= 2**63 - 1
            and proof["staleRejected"] == 1
            and proof["queued"] == []
        )
        _require(
            any(
                item["occurrence"] == completion["occurrence"]
                and item["status"] == "stale-rejected"
                for item in dispatches
            )
        )
    else:
        _require(proof["queued"] == [] and proof["staleRejected"] == len(roles))
    if trial != "complete-before-ordered-release":
        _require(proof["completion"] is None)
        _require(all(item["status"] == "stale-rejected" for item in dispatches))
    if trial != "queued-after-invalidation":
        _require(proof["controlReleased"] == [])
    entries = proof["entries"]
    _require(isinstance(entries, list))
    entries = cast(list[dict[str, object]], entries)
    expected_roles = (
        list(roles)
        if trial == "both-active"
        else [GPU_WORKER_ROLE]
        if trial == "gpu-active"
        else [CPU_WORKER_ROLE]
        if trial == "cpu-active"
        else []
    )
    _require(len(entries) == len(expected_roles))
    invalidations: set[int] = set()
    for entry, role in zip(entries, expected_roles, strict=True):
        _require(
            isinstance(entry, dict)
            and set(entry)
            == {
                "role",
                "occurrence",
                "sequence",
                "attempt",
                "entered",
                "invalidated",
                "termination",
            }
        )
        index = roles.index(role)
        _require(
            entry["role"] == role
            and entry["occurrence"] == admitted[index]
            and type(entry["sequence"]) is int
            and entry["sequence"] == index
            and type(entry["attempt"]) is int
            and entry["attempt"] == 1
        )
        for field in ("entered", "invalidated", "termination"):
            _require(type(entry[field]) is int and 0 <= cast(int, entry[field]) <= 2**63 - 1)
        _require(0 < cast(int, entry["entered"]) <= cast(int, entry["invalidated"]))
        invalidations.add(cast(int, entry["invalidated"]))
    _require(len(invalidations) <= 1)


def validate_trials(
    arm: DualWorkerArm,
    requests: tuple[DualUnitRequest, ...],
    value: object,
    raw_trials: object,
) -> None:
    _require(isinstance(value, list) and isinstance(raw_trials, list))
    proofs = cast(list[dict[str, object]], value)
    results = cast(list[dict[str, object]], raw_trials)
    _require(len(proofs) == len(results) == len(TRIALS[arm]))
    roles: tuple[DualWorkerRole, ...] = (
        (CPU_WORKER_ROLE,)
        if arm == "cpu-solo"
        else (GPU_WORKER_ROLE,)
        if arm == "gpu-solo"
        else (GPU_WORKER_ROLE, CPU_WORKER_ROLE)
    )
    for trial, proof, result in zip(TRIALS[arm], proofs, results, strict=True):
        _require(
            isinstance(proof, dict)
            and isinstance(result, dict)
            and proof.get("trialId") == result.get("trialId") == trial
        )
        _validate_proof(proof, _trial_requests(requests, trial, len(roles)), roles)
        for role, key in (
            (GPU_WORKER_ROLE, "gpuWorkerTerminationMilliseconds"),
            (CPU_WORKER_ROLE, "cpuWorkerTerminationMilliseconds"),
        ):
            _require((result[key] is not None) == (role in roles))
        # Raw schema bounds the numeric fields. Recompute the projection's acceptance.
        timings = [result["identityInvalidationMilliseconds"], result["cleanupMilliseconds"]]
        timings += [
            result[key]
            for key in ("gpuWorkerTerminationMilliseconds", "cpuWorkerTerminationMilliseconds")
            if result[key] is not None
        ]
        _require(all(type(item) in (int, float) and cast(float, item) >= 0 for item in timings))
        passed = (
            cast(float, timings[0]) <= 500
            and cast(float, timings[1]) <= 5_000
            and all(cast(float, item) <= 2_000 for item in timings[2:])
            and result["workerProcessesRemaining"] == 0
        )
        _require(
            result["passed"] is passed
            and result["stalePublishedUnits"] == 0
            and result["stalePlayedUnits"] == 0
        )
        for entry in cast(list[dict[str, object]], proof["entries"]):
            key = (
                "gpuWorkerTerminationMilliseconds"
                if entry["role"] == GPU_WORKER_ROLE
                else "cpuWorkerTerminationMilliseconds"
            )
            _require(cast(int, entry["termination"]) <= cast(float, result[key]) * 1_000_000)
