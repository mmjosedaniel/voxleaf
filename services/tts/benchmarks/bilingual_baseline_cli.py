"""Closed-stdin commands for the frozen v8 Piper English baseline."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Final, cast

from benchmarks.adapters.piper_english import (
    PIPER_ENGLISH_CANDIDATE_ID,
    PiperEnglishConfiguration,
)
from benchmarks.bilingual_baseline import (
    BaselineConditions,
    BaselinePreflightReceipt,
    BilingualBaselineError,
    run_local_baseline_preflight,
    run_machine_evaluation,
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


def _read_request() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        raise BilingualBaselineError("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise BilingualBaselineError("invalid-input") from None
    if not isinstance(value, dict) or set(value) != REQUEST_FIELDS:
        raise BilingualBaselineError("invalid-input")
    request = cast(dict[str, object], value)
    if (
        request.get("candidateId") != PIPER_ENGLISH_CANDIDATE_ID
        or not isinstance(request.get("expectedCommitSha"), str)
        or not isinstance(request.get("candidatePython"), str)
        or not isinstance(request.get("artifactRoot"), str)
        or any(
            not isinstance(request.get(field), bool)
            for field in (
                "sleepDisabled",
                "backgroundLoadAcceptable",
                "thermalStateAcceptable",
            )
        )
    ):
        raise BilingualBaselineError("invalid-input")
    return request


def _preflight(request: dict[str, object]) -> BaselinePreflightReceipt:
    return run_local_baseline_preflight(
        expected_commit_sha=cast(str, request["expectedCommitSha"]),
        candidate_python=Path(cast(str, request["candidatePython"])),
        configuration=PiperEnglishConfiguration(
            Path(cast(str, request["artifactRoot"])),
        ),
        conditions=BaselineConditions(
            sleep_disabled=cast(bool, request["sleepDisabled"]),
            background_load_acceptable=cast(bool, request["backgroundLoadAcceptable"]),
            thermal_state_acceptable=cast(bool, request["thermalStateAcceptable"]),
        ),
    )


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("preflight", "machine"):
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        request = _read_request()
        receipt = _preflight(request)
        if sys.argv[1] == "preflight":
            output: dict[str, object] = {
                "status": "pass" if receipt.eligible else "fail",
                "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
                "failures": list(receipt.failures),
                "eligibleForMachineEvaluation": receipt.eligible,
                "artifactsVerified": "artifact" not in receipt.failures,
                "networkIsolation": receipt.network_isolation,
            }
        elif not receipt.eligible:
            output = {
                "status": "fail",
                "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
                "stage": "preflight",
                "failures": list(receipt.failures),
            }
        else:
            output = run_machine_evaluation(receipt)
        exit_code = 0 if output["status"] == "pass" else 2
    except (BilingualBaselineError, OSError):
        output = {"status": "fail", "failureCode": "invalid-request"}
        exit_code = 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
