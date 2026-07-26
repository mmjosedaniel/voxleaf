"""Closed command surface for the disposable CustomVoice Spanish screen."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Final, cast

from benchmarks.customvoice_screen import (
    ScreenError,
    ScreenRequest,
    candidate_interpreter_matches,
    cleanup_screen,
    generate_screen,
    submit_and_select,
)

MAXIMUM_STDIN_BYTES: Final = 262_144


def _payload() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        raise ScreenError("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise ScreenError("input") from None
    if not isinstance(value, dict):
        raise ScreenError("input")
    return cast(dict[str, object], value)


def _string(value: object) -> str:
    if not isinstance(value, str) or not value:
        raise ScreenError("input")
    return value


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("generate", "submit", "cleanup"):
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _payload()
        if payload.get("screenOptIn") is not True:
            raise ScreenError("opt-in")
        session_id = _string(payload.get("sessionId"))
        if sys.argv[1] == "generate":
            if set(payload) != {
                "screenOptIn",
                "sessionId",
                "artifactRoot",
                "candidatePython",
                "expectedCommitSha",
                "sleepDisabled",
                "backgroundLoadAcceptable",
                "thermalStateAcceptable",
            }:
                raise ScreenError("input")
            candidate_python = Path(_string(payload.get("candidatePython")))
            if not candidate_interpreter_matches(candidate_python):
                raise ScreenError("interpreter")
            result = generate_screen(
                ScreenRequest(
                    artifact_root=Path(_string(payload.get("artifactRoot"))),
                    candidate_python=candidate_python,
                    expected_commit_sha=_string(payload.get("expectedCommitSha")),
                    sleep_disabled=payload.get("sleepDisabled") is True,
                    background_load_acceptable=payload.get("backgroundLoadAcceptable") is True,
                    thermal_state_acceptable=payload.get("thermalStateAcceptable") is True,
                ),
                session_id,
            )
        elif sys.argv[1] == "submit":
            if set(payload) != {"screenOptIn", "sessionId", "scorecard"}:
                raise ScreenError("input")
            result = submit_and_select(session_id, payload.get("scorecard"))
        else:
            if set(payload) != {"screenOptIn", "sessionId"}:
                raise ScreenError("input")
            cleanup_screen(session_id)
            result = {"status": "pass", "sessionId": session_id}
        print(json.dumps(result, ensure_ascii=True, separators=(",", ":")))
        return 0
    except Exception as error:
        code = error.code if isinstance(error, ScreenError) else "internal"
        print(json.dumps({"status": "fail", "failureCode": code}, separators=(",", ":")))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
