"""Closed-stdin commands for the frozen v8 Qwen control screens."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Final, cast

from benchmarks.adapters.qwen_v8 import QWEN_V8_CANDIDATE_IDS
from benchmarks.bilingual_screen import (
    BilingualScreenError,
    ScreenConditions,
    ScreenPreflightReceipt,
    run_qwen_machine_evaluation,
    run_qwen_preflight,
)

MAXIMUM_STDIN_BYTES: Final = 32_768
REQUEST_FIELDS: Final = frozenset(
    {
        "candidateId",
        "expectedCommitSha",
        "candidatePython",
        "artifactRoot",
        "sleepDisabled",
        "backgroundLoadAcceptable",
        "thermalStateAcceptable",
    }
)


def _read() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        raise BilingualScreenError("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise BilingualScreenError("input") from None
    if not isinstance(value, dict) or set(value) != REQUEST_FIELDS:
        raise BilingualScreenError("input")
    payload = cast(dict[str, object], value)
    if (
        payload.get("candidateId") not in QWEN_V8_CANDIDATE_IDS
        or not isinstance(payload.get("expectedCommitSha"), str)
        or not isinstance(payload.get("candidatePython"), str)
        or not isinstance(payload.get("artifactRoot"), str)
        or any(
            not isinstance(payload.get(field), bool)
            for field in (
                "sleepDisabled",
                "backgroundLoadAcceptable",
                "thermalStateAcceptable",
            )
        )
    ):
        raise BilingualScreenError("input")
    return payload


def _preflight(payload: dict[str, object]) -> ScreenPreflightReceipt:
    return run_qwen_preflight(
        candidate_id=cast(str, payload["candidateId"]),
        expected_commit_sha=cast(str, payload["expectedCommitSha"]),
        candidate_python=Path(cast(str, payload["candidatePython"])),
        artifact_root=Path(cast(str, payload["artifactRoot"])),
        conditions=ScreenConditions(
            sleep_disabled=cast(bool, payload["sleepDisabled"]),
            background_load_acceptable=cast(bool, payload["backgroundLoadAcceptable"]),
            thermal_state_acceptable=cast(bool, payload["thermalStateAcceptable"]),
        ),
    )


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("preflight", "machine"):
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _read()
        receipt = _preflight(payload)
        if sys.argv[1] == "preflight":
            output: dict[str, object] = {
                "status": "pass" if receipt.eligible else "fail",
                "candidateId": receipt.candidate_id,
                "failures": list(receipt.failures),
                "eligibleForMachineEvaluation": receipt.eligible,
                "artifactsVerified": "artifact" not in receipt.failures,
                "networkIsolation": receipt.network_isolation,
            }
        elif not receipt.eligible:
            output = {
                "status": "fail",
                "candidateId": receipt.candidate_id,
                "stage": "preflight",
                "failures": list(receipt.failures),
            }
        else:
            output = run_qwen_machine_evaluation(receipt)
        exit_code = 0 if output["status"] == "pass" else 2
    except (BilingualScreenError, OSError, RuntimeError):
        output = {"status": "fail", "failureCode": "invalid-request"}
        exit_code = 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
