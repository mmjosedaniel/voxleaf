"""Closed-stdin preflight and machine commands for frozen v12."""

from __future__ import annotations

import json
import sys
from typing import Final, cast

from benchmarks.chatterbox_v11_screen import ScreenConditions
from benchmarks.corrective_v12 import (
    CorrectiveV12Error,
    run_v12_machine_evaluation,
    run_v12_preflight,
)

MAXIMUM_STDIN_BYTES: Final = 16_384
FIELDS: Final = frozenset(
    {
        "authorityCommitSha",
        "executionCommitSha",
        "sleepDisabled",
        "backgroundLoadAcceptable",
        "thermalStateAcceptable",
    }
)


def _read() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        raise CorrectiveV12Error("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise CorrectiveV12Error("input") from None
    if not isinstance(value, dict) or set(value) != FIELDS:
        raise CorrectiveV12Error("input")
    payload = cast(dict[str, object], value)
    if (
        not isinstance(payload.get("authorityCommitSha"), str)
        or not isinstance(payload.get("executionCommitSha"), str)
        or any(
            not isinstance(payload.get(field), bool)
            for field in (
                "sleepDisabled",
                "backgroundLoadAcceptable",
                "thermalStateAcceptable",
            )
        )
    ):
        raise CorrectiveV12Error("input")
    return payload


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("preflight", "machine"):
        print('{"status":"invalid","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _read()
        receipt = run_v12_preflight(
            authority_commit_sha=cast(str, payload["authorityCommitSha"]),
            execution_commit_sha=cast(str, payload["executionCommitSha"]),
            conditions=ScreenConditions(
                sleep_disabled=cast(bool, payload["sleepDisabled"]),
                background_load_acceptable=cast(bool, payload["backgroundLoadAcceptable"]),
                thermal_state_acceptable=cast(bool, payload["thermalStateAcceptable"]),
            ),
        )
        if sys.argv[1] == "preflight":
            output: dict[str, object] = {
                "status": "ready" if receipt.eligible else "blocked",
                "observations": list(receipt.failures),
                "eligibleForMachineEvaluation": receipt.eligible,
                "decisionState": "pending-maintainer-decision",
            }
        elif receipt.eligible:
            output = run_v12_machine_evaluation(receipt)
        else:
            output = {
                "status": "execution-blocked-awaiting-decision",
                "observations": list(receipt.failures),
                "decisionState": "pending-maintainer-decision",
            }
        exit_code = (
            0
            if output["status"]
            in (
                "ready",
                "measured-awaiting-decision",
            )
            else 2
        )
    except (CorrectiveV12Error, OSError, RuntimeError):
        output = {"status": "invalid", "failureCode": "invalid-request"}
        exit_code = 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
