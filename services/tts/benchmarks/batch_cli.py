"""Explicit reviewed command for the v4 batch hardware mechanics run."""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Final, cast

from benchmarks.adapters.factory import create_isolated_candidate_adapter
from benchmarks.adapters.manifest import (
    QWEN_V3_CANDIDATE_ID,
    CandidateConfiguration,
    load_v3_candidate_profile,
)
from benchmarks.batch_contracts import BatchResourceSnapshot, BatchWorkIdentity
from benchmarks.batch_matrix import (
    MatrixPurpose,
    execute_v4_batch_mechanics,
    receipt_json,
)
from benchmarks.memory import (
    GPU_PROCESS_SHARED_MEMORY_COUNTER,
    FrameworkVramTracker,
    WindowsGpuProcessMemorySampler,
    WindowsProcessResourceSampler,
)
from benchmarks.preflight import (
    PreflightRequest,
    RunConditions,
    run_local_preflight,
)
from benchmarks.v4_authority import load_frozen_v4_authority

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
MAXIMUM_STDIN_BYTES: Final = 32_768
INPUT_FIELDS: Final = frozenset(
    {
        "batchOptIn",
        "resultPurpose",
        "placementProfileId",
        "artifactRoot",
        "candidatePython",
        "expectedCommitSha",
        "sleepDisabled",
        "backgroundLoadAcceptable",
        "thermalStateAcceptable",
    }
)


class BatchCommandError(RuntimeError):
    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-v4-command:{code}")
        self.code = code


class _WindowsBatchResourceProbe:
    def __init__(
        self,
        *,
        dedicated: WindowsProcessResourceSampler,
        shared: WindowsProcessResourceSampler,
        tracker: FrameworkVramTracker,
        free_dedicated_vram_bytes: int,
    ) -> None:
        self._dedicated = dedicated
        self._shared = shared
        self._tracker = tracker
        self._free_dedicated_vram_bytes = free_dedicated_vram_bytes

    def snapshot(self) -> BatchResourceSnapshot:
        dedicated = self._dedicated.sample(os.getpid())
        shared = self._shared.sample(os.getpid())
        if dedicated.process_tree_vram_bytes is None or shared.process_tree_vram_bytes is None:
            raise BatchCommandError("measurement")
        return BatchResourceSnapshot(
            process_tree_ram_bytes=dedicated.process_tree_ram_bytes,
            process_dedicated_vram_bytes=dedicated.process_tree_vram_bytes,
            framework_reserved_vram_bytes=self._tracker.peak_bytes() or 0,
            free_dedicated_vram_bytes=self._free_dedicated_vram_bytes,
            shared_gpu_memory_bytes=shared.process_tree_vram_bytes,
        )


def _string(value: object) -> str:
    if not isinstance(value, str) or not value:
        raise BatchCommandError("input")
    return value


def _payload() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode()) > MAXIMUM_STDIN_BYTES:
        raise BatchCommandError("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise BatchCommandError("input") from None
    if not isinstance(value, dict) or set(value) != INPUT_FIELDS:
        raise BatchCommandError("input")
    return cast(dict[str, object], value)


def _run(payload: dict[str, object]) -> dict[str, object]:
    load_frozen_v4_authority(REPOSITORY_ROOT)
    if (
        payload.get("batchOptIn") is not True
        or payload.get("resultPurpose") != "disposable-pilot"
        or payload.get("placementProfileId") != "qwen3-serena-v4-full-gpu"
    ):
        raise BatchCommandError("authority")
    profile = load_v3_candidate_profile(REPOSITORY_ROOT, QWEN_V3_CANDIDATE_ID)
    candidate_python = Path(_string(payload.get("candidatePython"))).resolve()
    if Path(sys.executable).resolve() != candidate_python:
        raise BatchCommandError("interpreter")
    configuration = CandidateConfiguration(
        candidate_id=profile.candidate_id,
        artifact_root=Path(_string(payload.get("artifactRoot"))),
        model_revision=profile.model_revision,
        voice_id=profile.voice_id,
        provider=profile.provider,
        precision=profile.precision,
        offline=True,
    )
    purpose = cast(MatrixPurpose, payload["resultPurpose"])
    receipt = run_local_preflight(
        PreflightRequest(
            expected_commit_sha=_string(payload.get("expectedCommitSha")),
            repository_root=REPOSITORY_ROOT,
            profile=profile,
            configuration=configuration,
            candidate_python=candidate_python,
            conditions=RunConditions(
                purpose="pilot",
                sleep_disabled=payload.get("sleepDisabled") is True,
                background_load_acceptable=(payload.get("backgroundLoadAcceptable") is True),
                thermal_state_acceptable=payload.get("thermalStateAcceptable") is True,
            ),
        )
    )
    host = receipt.host
    if (
        receipt.failures
        or host.operating_system != "Windows"
        or host.os_version != "10.0.26200"
        or host.architecture != "x86_64"
        or host.python_version != "3.12.10"
        or host.cpu_model != "Intel Core Ultra 7 255HX"
        or host.gpu_model != "NVIDIA GeForce RTX 5060 Laptop GPU"
        or host.total_vram_bytes != 8_546_942_976
        or host.driver_version != "577.05"
        or host.free_ram_bytes < 12_884_901_888
        or host.free_vram_bytes is None
        or host.free_vram_bytes < 8_174_698_496
    ):
        raise BatchCommandError("preflight")
    authority = load_frozen_v4_authority(REPOSITORY_ROOT)
    forbidden = tuple(
        cast(str, unit[key])
        for raw_unit in cast(list[dict[str, object]], authority.corpus["units"])
        for unit in (raw_unit,)
        for key in ("sourceText", "narrationText", "privacyCanary")
    )
    tracker = FrameworkVramTracker()
    dedicated_gpu = WindowsGpuProcessMemorySampler()
    shared_gpu = WindowsGpuProcessMemorySampler(GPU_PROCESS_SHARED_MEMORY_COUNTER)
    dedicated = WindowsProcessResourceSampler(vram_sampler=dedicated_gpu)
    shared = WindowsProcessResourceSampler(vram_sampler=shared_gpu)
    candidate = create_isolated_candidate_adapter(
        profile=profile,
        configuration=configuration,
        forbidden_values=(
            *forbidden,
            str(configuration.artifact_root),
            str(candidate_python),
        ),
        framework_memory_observer=tracker.observe,
    )
    try:
        return execute_v4_batch_mechanics(
            REPOSITORY_ROOT,
            candidate=candidate,
            purpose=purpose,
            identity=BatchWorkIdentity("v4-private-session", "v4-generation"),
            resource_probe=_WindowsBatchResourceProbe(
                dedicated=dedicated,
                shared=shared,
                tracker=tracker,
                free_dedicated_vram_bytes=host.free_vram_bytes,
            ),
        )
    finally:
        dedicated_gpu.close()
        shared_gpu.close()


def main() -> int:
    if sys.argv != [sys.argv[0], "run"]:
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        result = _run(_payload())
        print(receipt_json(result))
        return 0 if not result["failureCodes"] else 1
    except Exception as error:
        code = error.code if isinstance(error, BatchCommandError) else "internal"
        print(json.dumps({"status": "fail", "failureCode": code}, separators=(",", ":")))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
