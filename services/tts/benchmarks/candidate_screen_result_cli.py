"""Closed-stdin derivation and cleanup command for v9/v11 candidate screens."""

from __future__ import annotations

import json
import sys
from typing import Final, cast

from benchmarks.candidate_screen_result import (
    CandidateScreenResultError,
    derive_and_cleanup_screen_results,
)

MAXIMUM_STDIN_BYTES: Final = 4_096
REQUEST_FIELDS: Final = frozenset({"expectedCommitSha", "cleanupConfirmed"})


def _read() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        raise CandidateScreenResultError("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise CandidateScreenResultError("input") from None
    if (
        not isinstance(value, dict)
        or set(value) != REQUEST_FIELDS
        or not isinstance(value.get("expectedCommitSha"), str)
        or value.get("cleanupConfirmed") is not True
    ):
        raise CandidateScreenResultError("input")
    return cast(dict[str, object], value)


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] != "derive":
        print('{"status":"invalid","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _read()
        output = derive_and_cleanup_screen_results(
            expected_commit_sha=cast(str, payload["expectedCommitSha"]),
        )
        exit_code = 0
    except (OSError, RuntimeError):
        output = {"status": "invalid", "failureCode": "invalid-request"}
        exit_code = 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
