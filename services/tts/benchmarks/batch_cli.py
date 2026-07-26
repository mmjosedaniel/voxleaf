"""Explicit reviewed command for the v4 batch hardware mechanics run."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
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
from benchmarks.batch_official import (
    OfficialBatchCandidate,
    ThreadedOfficialMemoryMonitor,
    ensure_raw_root_is_ignored,
    execute_official_v4,
    official_raw_root,
)
from benchmarks.memory import (
    GPU_PROCESS_SHARED_MEMORY_COUNTER,
    FrameworkVramTracker,
    WindowsGpuProcessMemorySampler,
    WindowsProcessResourceSampler,
)
from benchmarks.preflight import (
    HostSnapshot,
    PreflightRequest,
    RunConditions,
    RunPurpose,
    run_local_preflight,
)
from benchmarks.v4_authority import load_frozen_v4_mechanics_authority

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
OFFICIAL_INPUT_FIELDS: Final = INPUT_FIELDS | {"sessionId"}
SESSION_PATTERN: Final = re.compile(r"^[0-9a-f]{32}$")


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
    if not isinstance(value, dict):
        raise BatchCommandError("input")
    payload = cast(dict[str, object], value)
    purpose = payload.get("resultPurpose")
    expected_fields = OFFICIAL_INPUT_FIELDS if purpose == "official" else INPUT_FIELDS
    if set(payload) != expected_fields:
        raise BatchCommandError("input")
    if purpose == "official" and (
        not isinstance(payload.get("sessionId"), str)
        or SESSION_PATTERN.fullmatch(cast(str, payload["sessionId"])) is None
    ):
        raise BatchCommandError("input")
    return payload


def _free_vram_bytes() -> int | None:
    try:
        output = subprocess.run(
            (
                "nvidia-smi",
                "--query-gpu=memory.free",
                "--format=csv,noheader,nounits",
            ),
            check=True,
            capture_output=True,
            text=True,
            timeout=10,
        ).stdout.splitlines()
        if len(output) != 1:
            return None
        return int(output[0].strip()) * 1024**2
    except (OSError, subprocess.SubprocessError, ValueError):
        return None


def _host_raw(host: HostSnapshot) -> dict[str, object]:
    return {
        "operatingSystem": host.operating_system,
        "osVersion": host.os_version,
        "architecture": host.architecture,
        "pythonVersion": host.python_version,
        "cpuModel": host.cpu_model,
        "logicalProcessors": host.logical_processors,
        "totalRamBytes": host.total_ram_bytes,
        "gpuModel": host.gpu_model,
        "totalVramBytes": host.total_vram_bytes,
        "driverVersion": host.driver_version,
    }


def _preflight_raw(host: HostSnapshot) -> dict[str, object]:
    return {
        "candidateInterpreterVerified": True,
        "authorityHashesVerified": True,
        "artifactHashesVerified": True,
        "offlineEnvironmentVerified": True,
        "localFilesOnlyVerified": True,
        "outboundFirewallBlockVerified": True,
        "acPowerVerified": True,
        "sleepDisabled": True,
        "backgroundLoadAccepted": True,
        "thermalStateAccepted": True,
        "freeRamBytes": host.free_ram_bytes,
        "freeVramBytes": host.free_vram_bytes,
        "sharedGpuMemoryBytes": 0,
    }


def _normalized_cpu_model(value: str) -> str:
    return " ".join(value.replace("(R)", "").replace("(TM)", "").split())


def _run(payload: dict[str, object]) -> dict[str, object]:
    load_frozen_v4_mechanics_authority(REPOSITORY_ROOT)
    if (
        payload.get("batchOptIn") is not True
        or payload.get("resultPurpose") not in ("disposable-pilot", "official")
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
    preflight_purpose: RunPurpose = "official" if purpose == "official" else "pilot"
    receipt = run_local_preflight(
        PreflightRequest(
            expected_commit_sha=_string(payload.get("expectedCommitSha")),
            repository_root=REPOSITORY_ROOT,
            profile=profile,
            configuration=configuration,
            candidate_python=candidate_python,
            conditions=RunConditions(
                purpose=preflight_purpose,
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
        or _normalized_cpu_model(host.cpu_model) != "Intel Core Ultra 7 255HX"
        or host.gpu_model != "NVIDIA GeForce RTX 5060 Laptop GPU"
        or host.total_vram_bytes != 8_546_942_976
        or host.driver_version != "577.05"
        or host.free_ram_bytes < 12_884_901_888
        or host.free_vram_bytes is None
        or host.free_vram_bytes < 8_174_698_496
    ):
        raise BatchCommandError("preflight")
    authority = load_frozen_v4_mechanics_authority(REPOSITORY_ROOT)
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
    forbidden_values = (
        *forbidden,
        str(configuration.artifact_root),
        str(candidate_python),
    )

    def candidate_factory() -> OfficialBatchCandidate:
        return cast(
            OfficialBatchCandidate,
            create_isolated_candidate_adapter(
                profile=profile,
                configuration=configuration,
                forbidden_values=forbidden_values,
                framework_memory_observer=tracker.observe,
            ),
        )

    candidate = candidate_factory()
    try:
        if purpose == "official":
            ensure_raw_root_is_ignored(REPOSITORY_ROOT)
            session = official_raw_root(
                REPOSITORY_ROOT,
                cast(str, payload["sessionId"]),
            )
            if session.exists():
                raise BatchCommandError("session")
            monitor = ThreadedOfficialMemoryMonitor(
                root_pid=os.getpid(),
                dedicated_sampler=dedicated,
                shared_sampler=shared,
                framework_tracker=tracker,
                free_vram_probe=_free_vram_bytes,
            )
            try:
                execution = execute_official_v4(
                    REPOSITORY_ROOT,
                    execution_commit_sha=receipt.commit_sha,
                    host=_host_raw(host),
                    preflight=_preflight_raw(host),
                    candidate_factory=candidate_factory,
                    monitor=monitor,
                )
                session.mkdir(parents=True)
                (session / "raw.json").write_text(
                    json.dumps(
                        execution.raw,
                        ensure_ascii=False,
                        indent=2,
                        sort_keys=True,
                    )
                    + "\n",
                    encoding="utf-8",
                )
                (session / "loads.json").write_text(
                    json.dumps(
                        execution.load_observations,
                        ensure_ascii=True,
                        separators=(",", ":"),
                    )
                    + "\n",
                    encoding="utf-8",
                )
            except Exception:
                if session.exists():
                    shutil.rmtree(session)
                raise
            return {
                "schemaVersion": "tts-v4-batch-official-receipt-v1",
                "resultPurpose": "official",
                "sessionId": payload["sessionId"],
                "status": "complete",
                "eligibleForDerivation": True,
                "failureCodes": execution.raw["failureCodes"],
            }
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
        return 0 if result.get("eligibleForDerivation") is True or not result["failureCodes"] else 1
    except Exception as error:
        code = error.code if isinstance(error, BatchCommandError) else "internal"
        print(json.dumps({"status": "fail", "failureCode": code}, separators=(",", ":")))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
