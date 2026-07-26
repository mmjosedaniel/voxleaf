"""Closed standard-input contract for the reviewed v5 hardware command."""

from __future__ import annotations

import re
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal, cast

from benchmarks.dual_worker_contracts import DualWorkerArm

type DualCommandPurpose = Literal["cpu-solo-pilot", "official"]

SESSION_PATTERN = re.compile(r"^[0-9a-f]{32}$")
GIT_SHA_PATTERN = re.compile(r"^[0-9a-f]{40}$")
SHA256_PATTERN = re.compile(r"^[0-9a-f]{64}$")
BASE_FIELDS = frozenset(
    {
        "schemaVersion",
        "dualWorkerOptIn",
        "resultPurpose",
        "arm",
        "artifactRoot",
        "candidatePython",
        "expectedCommitSha",
        "authorityCommitSha",
        "priorCpuSoloSummarySha256",
        "priorGpuSoloSummarySha256",
        "sleepDisabled",
        "backgroundLoadAcceptable",
        "thermalStateAcceptable",
    }
)
OFFICIAL_FIELDS = BASE_FIELDS | {"sessionId"}


class DualWorkerCommandError(RuntimeError):
    """Fixed content-free command rejection."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-v5-command:{code}")
        self.code = code


@dataclass(frozen=True)
class DualWorkerCommandRequest:
    purpose: DualCommandPurpose
    arm: DualWorkerArm
    artifact_root: Path = field(repr=False)
    candidate_python: Path = field(repr=False)
    expected_commit_sha: str
    authority_commit_sha: str
    prior_cpu_solo_summary_sha256: str | None
    prior_gpu_solo_summary_sha256: str | None
    session_id: str | None
    sleep_disabled: bool
    background_load_acceptable: bool
    thermal_state_acceptable: bool


def _string(value: object) -> str:
    if not isinstance(value, str) or not value:
        raise DualWorkerCommandError("input")
    return value


def _optional_sha256(value: object) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str) or SHA256_PATTERN.fullmatch(value) is None:
        raise DualWorkerCommandError("input")
    return value


def parse_dual_worker_command(value: object) -> DualWorkerCommandRequest:
    """Validate the complete closed request without touching model code."""

    if not isinstance(value, dict):
        raise DualWorkerCommandError("input")
    payload = cast(Mapping[str, object], value)
    purpose = payload.get("resultPurpose")
    expected_fields = OFFICIAL_FIELDS if purpose == "official" else BASE_FIELDS
    if set(payload) != expected_fields:
        raise DualWorkerCommandError("input")
    arm = payload.get("arm")
    if (
        payload.get("schemaVersion") != "tts-dual-worker-command-v5"
        or payload.get("dualWorkerOptIn") is not True
        or purpose not in ("cpu-solo-pilot", "official")
        or arm not in ("cpu-solo", "gpu-solo", "concurrent")
    ):
        raise DualWorkerCommandError("authority")
    expected_commit = _string(payload.get("expectedCommitSha"))
    authority_commit = _string(payload.get("authorityCommitSha"))
    if (
        GIT_SHA_PATTERN.fullmatch(expected_commit) is None
        or GIT_SHA_PATTERN.fullmatch(authority_commit) is None
        or expected_commit == authority_commit
    ):
        raise DualWorkerCommandError("input")
    cpu_summary = _optional_sha256(payload.get("priorCpuSoloSummarySha256"))
    gpu_summary = _optional_sha256(payload.get("priorGpuSoloSummarySha256"))
    session_id = payload.get("sessionId")
    if purpose == "cpu-solo-pilot":
        if arm != "cpu-solo" or cpu_summary is not None or gpu_summary is not None:
            raise DualWorkerCommandError("authority")
        session = None
    else:
        if not isinstance(session_id, str) or SESSION_PATTERN.fullmatch(session_id) is None:
            raise DualWorkerCommandError("input")
        session = session_id
        if (
            (arm == "cpu-solo" and (cpu_summary is not None or gpu_summary is not None))
            or (arm == "gpu-solo" and (cpu_summary is None or gpu_summary is not None))
            or (arm == "concurrent" and (cpu_summary is None or gpu_summary is None))
        ):
            raise DualWorkerCommandError("authority")
    booleans = (
        payload.get("sleepDisabled"),
        payload.get("backgroundLoadAcceptable"),
        payload.get("thermalStateAcceptable"),
    )
    if any(not isinstance(item, bool) for item in booleans):
        raise DualWorkerCommandError("input")
    return DualWorkerCommandRequest(
        purpose=purpose,
        arm=arm,
        artifact_root=Path(_string(payload.get("artifactRoot"))),
        candidate_python=Path(_string(payload.get("candidatePython"))),
        expected_commit_sha=expected_commit,
        authority_commit_sha=authority_commit,
        prior_cpu_solo_summary_sha256=cpu_summary,
        prior_gpu_solo_summary_sha256=gpu_summary,
        session_id=session,
        sleep_disabled=cast(bool, booleans[0]),
        background_load_acceptable=cast(bool, booleans[1]),
        thermal_state_acceptable=cast(bool, booleans[2]),
    )
