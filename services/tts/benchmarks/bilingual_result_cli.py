"""Repository-environment validation for candidate-produced v8 evidence."""

from __future__ import annotations

import json
import sys
from typing import Final, cast

from benchmarks.adapters.piper_english import PIPER_ENGLISH_CANDIDATE_ID
from benchmarks.bilingual_result import (
    BilingualResultError,
    validate_machine_session,
)

MAXIMUM_STDIN_BYTES: Final = 16_384
VALIDATE_FIELDS: Final = frozenset({"candidateId", "expectedCommitSha", "sessionId"})


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] != "validate-machine":
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
        if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
            raise BilingualResultError("input-limit")
        value = cast(object, json.loads(raw))
        if not isinstance(value, dict) or set(value) != VALIDATE_FIELDS:
            raise BilingualResultError("invalid-input")
        payload = cast(dict[str, object], value)
        expected_commit_sha = payload.get("expectedCommitSha")
        session_id = payload.get("sessionId")
        if (
            payload.get("candidateId") != PIPER_ENGLISH_CANDIDATE_ID
            or not isinstance(expected_commit_sha, str)
            or not isinstance(session_id, str)
        ):
            raise BilingualResultError("invalid-input")
        output = validate_machine_session(
            expected_commit_sha=expected_commit_sha,
            machine_session_id=session_id,
        )
        exit_code = 0
    except (BilingualResultError, OSError, json.JSONDecodeError):
        output = {"status": "fail", "failureCode": "invalid-request"}
        exit_code = 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
