"""Explicit benchmark command surface; private paths enter only through stdin."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Final, NoReturn, cast

from benchmarks.adapters.manifest import (
    CandidateConfiguration,
    CandidatePrecision,
    CandidateProvider,
    load_benchmark_candidate_profile,
)
from benchmarks.preflight import (
    PreflightReceipt,
    PreflightRequest,
    RunConditions,
    RunPurpose,
    run_local_preflight,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
SERVICE_ROOT: Final = REPOSITORY_ROOT / "services" / "tts"
MAXIMUM_STDIN_BYTES: Final = 16_384
MEASUREMENT_TIMEOUT_SECONDS: Final = 7_200
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
WORKER_RECEIPT_FIELDS: Final = frozenset(
    (
        "status",
        "purpose",
        "candidateId",
        "sessionId",
        "failureCode",
        "counts",
        "eligibleForPromotion",
    )
)
WORKER_COUNT_FIELDS: Final = frozenset(
    (
        "coldLoads",
        "warmGenerations",
        "sustainedGenerations",
        "cancellationTrials",
    )
)
WORKER_FAILURE_CODES: Final = frozenset(
    (
        "invalid-request",
        "adapter-unavailable",
        "load-failed",
        "warmup-failed",
        "generation-failed",
        "timeout",
        "crash",
        "resource-limit",
        "invalid-output",
        "privacy",
        "cancellation-failed",
        "cleanup-failed",
        "measurement-unavailable",
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
    profile = load_benchmark_candidate_profile(REPOSITORY_ROOT, candidate_id)
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
            "processVramAvailable": host.process_vram_available,
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


def _validated_worker_receipt(
    value: object,
    request: PreflightRequest,
) -> dict[str, object]:
    payload = _mapping(value)
    if set(payload) != WORKER_RECEIPT_FIELDS:
        _fail("invalid-worker-output")
    status = payload.get("status")
    purpose = payload.get("purpose")
    candidate_id = payload.get("candidateId")
    session_id = payload.get("sessionId")
    failure_code = payload.get("failureCode")
    counts = _mapping(payload.get("counts"))
    if (
        status not in ("pass", "fail")
        or purpose != request.conditions.purpose
        or candidate_id != request.profile.candidate_id
        or set(counts) != WORKER_COUNT_FIELDS
        or any(
            not isinstance(counts.get(field), int)
            or isinstance(counts.get(field), bool)
            or cast(int, counts.get(field)) < 0
            for field in WORKER_COUNT_FIELDS
        )
        or payload.get("eligibleForPromotion") is not False
    ):
        _fail("invalid-worker-output")
    if request.conditions.purpose == "pilot":
        if session_id is not None:
            _fail("invalid-worker-output")
    elif not isinstance(session_id, str) or re.fullmatch(r"[a-f0-9]{32}", session_id) is None:
        _fail("invalid-worker-output")
    if (status == "pass" and failure_code is not None) or (
        status == "fail" and failure_code not in WORKER_FAILURE_CODES
    ):
        _fail("invalid-worker-output")
    maximum_counts = {
        "coldLoads": 5,
        "warmGenerations": 24,
        "sustainedGenerations": 120,
        "cancellationTrials": 5,
    }
    if any(cast(int, counts[field]) > maximum for field, maximum in maximum_counts.items()):
        _fail("invalid-worker-output")
    if status == "pass" and request.conditions.purpose == "official":
        sustained_count = cast(int, counts["sustainedGenerations"])
        v6 = (
            request.profile.authority is not None
            and request.profile.authority.profile_version == "tts-cpu-fallback-profile-v6"
        )
        warm_generations = 16 if v6 else 24
        sequence_length = 8 if v6 else 12
        if (
            counts["coldLoads"] != 5
            or counts["warmGenerations"] != warm_generations
            or counts["cancellationTrials"] != 5
            or not sequence_length <= sustained_count <= sequence_length * 10
            or sustained_count % sequence_length
        ):
            _fail("invalid-worker-output")
    return dict(payload)


def _preflight_passed(receipt: PreflightReceipt) -> bool:
    if receipt.failures:
        return False
    return receipt.purpose == "pilot" or receipt.eligible_for_official_run


def _run_measurement_parent(value: object) -> tuple[dict[str, object], int]:
    request = parse_preflight_request(value)
    receipt = run_local_preflight(request)
    if not _preflight_passed(receipt):
        return (
            {
                "status": "fail",
                "stage": "preflight",
                "failures": list(receipt.failures),
            },
            2,
        )
    try:
        completed = subprocess.run(
            (
                str(request.candidate_python.resolve(strict=True)),
                "-m",
                "benchmarks.cli",
                "_measure-worker",
            ),
            cwd=SERVICE_ROOT,
            input=json.dumps(value, ensure_ascii=True, separators=(",", ":")),
            capture_output=True,
            text=True,
            check=False,
            timeout=MEASUREMENT_TIMEOUT_SECONDS,
        )
        if len(completed.stdout.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
            _fail("invalid-worker-output")
        worker_value = cast(object, json.loads(completed.stdout))
        worker_receipt = _validated_worker_receipt(worker_value, request)
    except (
        OSError,
        subprocess.SubprocessError,
        json.JSONDecodeError,
        CommandError,
    ):
        return (
            {
                "status": "fail",
                "stage": "measurement",
                "failureCode": "invalid-request",
            },
            2,
        )
    return worker_receipt, 0 if worker_receipt["status"] == "pass" else 2


def _run_measurement_worker(value: object) -> tuple[dict[str, object], int]:
    request = parse_preflight_request(value)
    receipt = run_local_preflight(request)
    if not _preflight_passed(receipt):
        return (
            {
                "status": "fail",
                "purpose": request.conditions.purpose,
                "candidateId": request.profile.candidate_id,
                "sessionId": None,
                "failureCode": "invalid-request",
                "counts": {
                    "coldLoads": 0,
                    "warmGenerations": 0,
                    "sustainedGenerations": 0,
                    "cancellationTrials": 0,
                },
                "eligibleForPromotion": False,
            },
            2,
        )
    from benchmarks.execution import run_measurement_worker

    worker_receipt = run_measurement_worker(request)
    return worker_receipt, 0 if worker_receipt["status"] == "pass" else 2


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in (
        "preflight",
        "measure",
        "_measure-worker",
    ):
        print('{"status":"fail","failures":["invalid-request"]}')
        return 2
    try:
        value = _read_stdin_json()
        if sys.argv[1] == "preflight":
            receipt = run_local_preflight(parse_preflight_request(value))
            print(json.dumps(_receipt_payload(receipt), ensure_ascii=True, separators=(",", ":")))
            return 0 if receipt.eligible_for_official_run else 2
        if sys.argv[1] == "measure":
            payload, exit_code = _run_measurement_parent(value)
        else:
            payload, exit_code = _run_measurement_worker(value)
        print(json.dumps(payload, ensure_ascii=True, separators=(",", ":")))
        return exit_code
    except Exception:
        print('{"status":"fail","failures":["invalid-request"]}')
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
