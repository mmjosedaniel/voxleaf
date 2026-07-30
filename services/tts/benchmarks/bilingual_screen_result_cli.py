"""Repository-environment validation and rejected derivation for v8 screens."""

from __future__ import annotations

import json
import sys
from typing import Final, cast

from benchmarks.bilingual_screen_result import (
    RESULT_NAMES,
    BilingualScreenResultError,
    derive_rejected_and_cleanup,
    validate_machine_session,
)

MAXIMUM_STDIN_BYTES: Final = 16_384
FIELDS: Final = frozenset({"candidateId", "expectedCommitSha", "sessionId"})


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in (
        "validate-machine",
        "derive-rejected",
    ):
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
        if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
            raise BilingualScreenResultError("input-limit")
        value = cast(object, json.loads(raw))
        if not isinstance(value, dict) or set(value) != FIELDS:
            raise BilingualScreenResultError("input")
        payload = cast(dict[str, object], value)
        candidate_id = payload.get("candidateId")
        expected_commit_sha = payload.get("expectedCommitSha")
        session_id = payload.get("sessionId")
        if (
            candidate_id not in RESULT_NAMES
            or not isinstance(expected_commit_sha, str)
            or not isinstance(session_id, str)
        ):
            raise BilingualScreenResultError("input")
        if sys.argv[1] == "validate-machine":
            output = validate_machine_session(
                candidate_id=candidate_id,
                expected_commit_sha=expected_commit_sha,
                session_id=session_id,
            )
        else:
            output = derive_rejected_and_cleanup(
                candidate_id=candidate_id,
                expected_commit_sha=expected_commit_sha,
                session_id=session_id,
            )
        exit_code = 0
    except (BilingualScreenResultError, OSError, json.JSONDecodeError):
        output = {"status": "fail", "failureCode": "invalid-request"}
        exit_code = 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
