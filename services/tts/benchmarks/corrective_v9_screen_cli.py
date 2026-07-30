"""Closed-stdin commands for corrective v9 candidate screens."""

from __future__ import annotations

import json
import sys
from typing import Final, cast

from benchmarks.corrective_v9_screen import (
    CorrectiveV9ScreenError,
    ScreenConditions,
    run_corrective_machine_evaluation,
    run_corrective_preflight,
)
from benchmarks.v9_authority import CHATTERBOX_CANDIDATE_ID, MOSS_CANDIDATE_ID

MAXIMUM_STDIN_BYTES: Final = 16_384
REQUEST_FIELDS: Final = frozenset(
    {
        "candidateId",
        "expectedCommitSha",
        "sleepDisabled",
        "backgroundLoadAcceptable",
        "thermalStateAcceptable",
    }
)


def _read() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        raise CorrectiveV9ScreenError("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise CorrectiveV9ScreenError("input") from None
    if not isinstance(value, dict) or set(value) != REQUEST_FIELDS:
        raise CorrectiveV9ScreenError("input")
    payload = cast(dict[str, object], value)
    if (
        payload.get("candidateId") not in (CHATTERBOX_CANDIDATE_ID, MOSS_CANDIDATE_ID)
        or not isinstance(payload.get("expectedCommitSha"), str)
        or any(
            not isinstance(payload.get(field), bool)
            for field in (
                "sleepDisabled",
                "backgroundLoadAcceptable",
                "thermalStateAcceptable",
            )
        )
    ):
        raise CorrectiveV9ScreenError("input")
    return payload


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("preflight", "machine"):
        print('{"status":"invalid","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _read()
        receipt = run_corrective_preflight(
            candidate_id=cast(str, payload["candidateId"]),
            expected_commit_sha=cast(str, payload["expectedCommitSha"]),
            conditions=ScreenConditions(
                sleep_disabled=cast(bool, payload["sleepDisabled"]),
                background_load_acceptable=cast(bool, payload["backgroundLoadAcceptable"]),
                thermal_state_acceptable=cast(bool, payload["thermalStateAcceptable"]),
            ),
        )
        if sys.argv[1] == "preflight":
            output: dict[str, object] = {
                "status": "ready" if receipt.eligible else "blocked",
                "candidateId": receipt.candidate_id,
                "observations": list(receipt.failures),
                "eligibleForMachineEvaluation": receipt.eligible,
                "artifactsVerified": "artifact" not in receipt.failures,
                "networkIsolation": receipt.network_isolation,
                "decisionState": "pending-maintainer-decision",
                "rejectionRecorded": False,
            }
        elif not receipt.eligible:
            output = {
                "status": "execution-blocked-awaiting-decision",
                "candidateId": receipt.candidate_id,
                "observations": list(receipt.failures),
                "decisionState": "pending-maintainer-decision",
                "rejectionRecorded": False,
            }
        else:
            output = run_corrective_machine_evaluation(receipt)
        exit_code = 0 if output["status"] in ("ready", "measured-awaiting-decision") else 2
    except (CorrectiveV9ScreenError, OSError, RuntimeError):
        output = {
            "status": "invalid",
            "failureCode": "invalid-request",
            "decisionState": "pending-maintainer-decision",
            "rejectionRecorded": False,
        }
        exit_code = 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
