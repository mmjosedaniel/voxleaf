"""Closed-stdin commands for v12 private quality evidence."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Final, cast

from benchmarks.corrective_v12_quality import (
    CorrectiveV12QualityError,
    derive_and_cleanup,
    generate_quality_session,
)
from benchmarks.v12_authority import (
    CHATTERBOX_CANDIDATE_ID,
    QWEN_CANDIDATE_IDS,
)

MAXIMUM_STDIN_BYTES: Final = 32_768
GENERATE_FIELDS: Final = frozenset(
    {
        "candidateId",
        "authorityCommitSha",
        "executionCommitSha",
        "sessionId",
        "qualityOptIn",
    }
)
DERIVE_FIELDS: Final = frozenset({"candidateId", "sessionId", "resultPath", "outputPath"})


def _read() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        raise CorrectiveV12QualityError("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise CorrectiveV12QualityError("input") from None
    if not isinstance(value, dict):
        raise CorrectiveV12QualityError("input")
    return cast(dict[str, object], value)


def _candidate(value: object) -> str:
    if value != CHATTERBOX_CANDIDATE_ID and value not in QWEN_CANDIDATE_IDS:
        raise CorrectiveV12QualityError("candidate")
    return value


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("generate", "derive"):
        print('{"status":"invalid","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _read()
        candidate_id = _candidate(payload.get("candidateId"))
        if sys.argv[1] == "generate":
            if (
                set(payload) != GENERATE_FIELDS
                or not isinstance(payload.get("authorityCommitSha"), str)
                or not isinstance(payload.get("executionCommitSha"), str)
                or payload.get("qualityOptIn") is not True
                or (
                    payload.get("sessionId") is not None
                    and not isinstance(payload.get("sessionId"), str)
                )
            ):
                raise CorrectiveV12QualityError("input")
            output = generate_quality_session(
                candidate_id=candidate_id,
                authority_commit_sha=cast(str, payload["authorityCommitSha"]),
                execution_commit_sha=cast(str, payload["executionCommitSha"]),
                machine_session_id=cast(str | None, payload["sessionId"]),
            )
        else:
            if (
                set(payload) != DERIVE_FIELDS
                or not isinstance(payload.get("sessionId"), str)
                or not isinstance(payload.get("resultPath"), str)
                or not isinstance(payload.get("outputPath"), str)
            ):
                raise CorrectiveV12QualityError("input")
            output = derive_and_cleanup(
                candidate_id=candidate_id,
                session_id=cast(str, payload["sessionId"]),
                result_path=Path(cast(str, payload["resultPath"])),
                output_path=Path(cast(str, payload["outputPath"])),
            )
        exit_code = 0
    except (CorrectiveV12QualityError, OSError, RuntimeError):
        output = {
            "status": "invalid",
            "failureCode": "invalid-request",
            "decisionState": "pending-maintainer-decision",
        }
        exit_code = 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
