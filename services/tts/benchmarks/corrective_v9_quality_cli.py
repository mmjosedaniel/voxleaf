"""Closed-stdin generation command for corrective v9 quality evidence."""

from __future__ import annotations

import json
import sys
from typing import Final, cast

from benchmarks.adapters.corrective_v9 import (
    CHATTERBOX_CANDIDATE_ID,
    MOSS_CANDIDATE_ID,
)
from benchmarks.corrective_v9_quality import (
    CorrectiveV9QualityError,
    generate_quality_session,
)

MAXIMUM_STDIN_BYTES: Final = 16_384
REQUEST_FIELDS: Final = frozenset({"candidateId", "expectedCommitSha", "sessionId", "qualityOptIn"})


def _read() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        raise CorrectiveV9QualityError("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise CorrectiveV9QualityError("input") from None
    if (
        not isinstance(value, dict)
        or set(value) != REQUEST_FIELDS
        or value.get("candidateId") not in (CHATTERBOX_CANDIDATE_ID, MOSS_CANDIDATE_ID)
        or not isinstance(value.get("expectedCommitSha"), str)
        or not isinstance(value.get("sessionId"), str)
        or value.get("qualityOptIn") is not True
    ):
        raise CorrectiveV9QualityError("input")
    return cast(dict[str, object], value)


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] != "generate":
        print('{"status":"invalid","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _read()
        output = generate_quality_session(
            candidate_id=cast(str, payload["candidateId"]),
            expected_commit_sha=cast(str, payload["expectedCommitSha"]),
            machine_session_id=cast(str, payload["sessionId"]),
        )
        exit_code = 0
    except (OSError, RuntimeError):
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
