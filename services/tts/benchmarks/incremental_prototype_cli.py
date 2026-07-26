"""Closed command surface for the incremental/cancellation prototype."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Final, cast

from benchmarks.incremental_prototype import (
    PrototypeError,
    PrototypeRunRequest,
    candidate_interpreter_matches,
    run_prototype,
)

MAXIMUM_STDIN_BYTES: Final = 32_768


def _payload() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode()) > MAXIMUM_STDIN_BYTES:
        raise PrototypeError("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise PrototypeError("input") from None
    if not isinstance(value, dict):
        raise PrototypeError("input")
    return cast(dict[str, object], value)


def _string(value: object) -> str:
    if not isinstance(value, str) or not value:
        raise PrototypeError("input")
    return value


def main() -> int:
    if sys.argv != [sys.argv[0], "run"]:
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _payload()
        if set(payload) != {
            "prototypeOptIn",
            "artifactRoot",
            "candidatePython",
            "expectedCommitSha",
            "sleepDisabled",
            "backgroundLoadAcceptable",
            "thermalStateAcceptable",
        }:
            raise PrototypeError("input")
        if payload.get("prototypeOptIn") is not True:
            raise PrototypeError("opt-in")
        candidate_python = Path(_string(payload.get("candidatePython")))
        if not candidate_interpreter_matches(candidate_python):
            raise PrototypeError("interpreter")
        result = run_prototype(
            PrototypeRunRequest(
                artifact_root=Path(_string(payload.get("artifactRoot"))),
                candidate_python=candidate_python,
                expected_commit_sha=_string(payload.get("expectedCommitSha")),
                sleep_disabled=payload.get("sleepDisabled") is True,
                background_load_acceptable=payload.get("backgroundLoadAcceptable") is True,
                thermal_state_acceptable=payload.get("thermalStateAcceptable") is True,
            )
        )
        print(json.dumps(result, ensure_ascii=True, separators=(",", ":")))
        return 0 if result["passed"] is True else 1
    except Exception as error:
        code = error.code if isinstance(error, PrototypeError) else "internal"
        print(json.dumps({"status": "fail", "failureCode": code}, separators=(",", ":")))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
