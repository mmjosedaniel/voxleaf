"""Explicit benchmark command surface; private paths enter only through stdin."""

from __future__ import annotations

import json
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Final, NoReturn, cast

from benchmarks.adapters.manifest import (
    CandidateConfiguration,
    CandidatePrecision,
    CandidateProvider,
    load_candidate_profile,
)
from benchmarks.preflight import (
    PreflightReceipt,
    PreflightRequest,
    RunConditions,
    RunPurpose,
    run_local_preflight,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
MANIFEST_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "candidates-v1.json"
MAXIMUM_STDIN_BYTES: Final = 16_384
PREFLIGHT_FIELDS: Final = frozenset(
    (
        "candidateId",
        "artifactRoot",
        "candidatePython",
        "modelRevision",
        "voiceId",
        "provider",
        "precision",
        "offline",
        "expectedCommitSha",
        "purpose",
        "sleepDisabled",
        "backgroundLoadAcceptable",
        "thermalStateAcceptable",
    )
)


class CommandError(RuntimeError):
    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-command:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise CommandError(code)


def _mapping(value: object) -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail("invalid-input")
    return cast(Mapping[str, object], value)


def _string(value: object) -> str:
    if not isinstance(value, str) or not value:
        _fail("invalid-input")
    return value


def _boolean(value: object) -> bool:
    if not isinstance(value, bool):
        _fail("invalid-input")
    return value


def parse_preflight_request(value: object) -> PreflightRequest:
    payload = _mapping(value)
    if set(payload) != PREFLIGHT_FIELDS:
        _fail("invalid-input")
    candidate_id = _string(payload.get("candidateId"))
    profile = load_candidate_profile(MANIFEST_PATH, candidate_id)
    provider = _string(payload.get("provider"))
    precision = _string(payload.get("precision"))
    if provider not in ("pytorch-cuda", "onnxruntime-cpu") or precision not in (
        "bfloat16",
        "float32",
    ):
        _fail("invalid-input")
    purpose = _string(payload.get("purpose"))
    if purpose not in ("pilot", "official"):
        _fail("invalid-input")
    configuration = CandidateConfiguration(
        candidate_id=candidate_id,
        artifact_root=Path(_string(payload.get("artifactRoot"))),
        model_revision=_string(payload.get("modelRevision")),
        voice_id=_string(payload.get("voiceId")),
        provider=cast(CandidateProvider, provider),
        precision=cast(CandidatePrecision, precision),
        offline=_boolean(payload.get("offline")),
    )
    return PreflightRequest(
        expected_commit_sha=_string(payload.get("expectedCommitSha")),
        repository_root=REPOSITORY_ROOT,
        profile=profile,
        configuration=configuration,
        candidate_python=Path(_string(payload.get("candidatePython"))),
        conditions=RunConditions(
            purpose=cast(RunPurpose, purpose),
            sleep_disabled=_boolean(payload.get("sleepDisabled")),
            background_load_acceptable=_boolean(payload.get("backgroundLoadAcceptable")),
            thermal_state_acceptable=_boolean(payload.get("thermalStateAcceptable")),
        ),
    )


def _receipt_payload(receipt: PreflightReceipt) -> dict[str, object]:
    host = receipt.host
    return {
        "status": "pass" if not receipt.failures else "fail",
        "purpose": receipt.purpose,
        "candidateId": receipt.candidate_id,
        "role": receipt.role,
        "commitSha": receipt.commit_sha,
        "eligibleForOfficialRun": receipt.eligible_for_official_run,
        "eligibleForPromotion": receipt.eligible_for_promotion,
        "failures": list(receipt.failures),
        "host": {
            "operatingSystem": host.operating_system,
            "osVersion": host.os_version,
            "architecture": host.architecture,
            "pythonVersion": host.python_version,
            "cpuModel": host.cpu_model,
            "logicalProcessors": host.logical_processors,
            "totalRamBytes": host.total_ram_bytes,
            "freeRamBytes": host.free_ram_bytes,
            "freeDiskBytes": host.free_disk_bytes,
            "powerOnline": host.power_online,
            "powerMode": host.power_mode,
            "gpuModel": host.gpu_model,
            "driverVersion": host.driver_version,
            "totalVramBytes": host.total_vram_bytes,
            "freeVramBytes": host.free_vram_bytes,
        },
        "artifacts": [
            {
                "artifactId": artifact.artifact_id,
                "sha256": artifact.sha256,
                "sizeBytes": artifact.size_bytes,
            }
            for artifact in receipt.artifacts
        ],
    }


def _read_stdin_json() -> object:
    value = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(value.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        _fail("input-limit")
    try:
        return cast(object, json.loads(value))
    except json.JSONDecodeError:
        _fail("invalid-input")


def main() -> int:
    if sys.argv != [sys.argv[0], "preflight"]:
        print('{"status":"fail","failures":["invalid-request"]}')
        return 2
    try:
        receipt = run_local_preflight(parse_preflight_request(_read_stdin_json()))
        print(json.dumps(_receipt_payload(receipt), ensure_ascii=True, separators=(",", ":")))
        return 0 if receipt.eligible_for_official_run else 2
    except Exception:
        print('{"status":"fail","failures":["invalid-request"]}')
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
