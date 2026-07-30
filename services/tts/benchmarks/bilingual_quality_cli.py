"""Closed-stdin quality and result commands for the Piper English v8 baseline."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Final, cast

from benchmarks.adapters.piper_english import PIPER_ENGLISH_CANDIDATE_ID
from benchmarks.bilingual_baseline import REPOSITORY_ROOT
from benchmarks.bilingual_baseline_cli import REQUEST_FIELDS, _preflight
from benchmarks.bilingual_quality import (
    BilingualQualityError,
    finalize_quality_session,
    generate_quality_session,
)

MAXIMUM_STDIN_BYTES: Final = 32_768
GENERATE_FIELDS: Final = REQUEST_FIELDS | frozenset({"qualityOptIn", "sessionId"})
FINALIZE_FIELDS: Final = frozenset({"candidateId", "qualityOptIn", "sessionId", "resultPath"})
DERIVE_FIELDS: Final = frozenset(
    {
        "candidateId",
        "qualityOptIn",
        "sessionId",
        "expectedCommitSha",
    }
)


def _read() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        raise BilingualQualityError("input-limit")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise BilingualQualityError("invalid-input") from None
    if not isinstance(value, dict):
        raise BilingualQualityError("invalid-input")
    return cast(dict[str, object], value)


def _baseline_request(payload: dict[str, object]) -> dict[str, object]:
    return {field: payload[field] for field in REQUEST_FIELDS}


def _session_id(payload: dict[str, object]) -> str:
    value = payload.get("sessionId")
    if not isinstance(value, str):
        raise BilingualQualityError("invalid-input")
    return value


def _quality_enabled(payload: dict[str, object]) -> bool:
    return (
        payload.get("qualityOptIn") is True
        and payload.get("candidateId") == PIPER_ENGLISH_CANDIDATE_ID
    )


def _generate(payload: dict[str, object]) -> dict[str, object]:
    if set(payload) != GENERATE_FIELDS or not _quality_enabled(payload):
        raise BilingualQualityError("invalid-input")
    receipt = _preflight(_baseline_request(payload))
    if not receipt.eligible:
        return {
            "status": "fail",
            "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
            "stage": "preflight",
            "failures": list(receipt.failures),
        }
    return generate_quality_session(receipt, machine_session_id=_session_id(payload))


def _finalize(payload: dict[str, object]) -> dict[str, object]:
    if set(payload) != FINALIZE_FIELDS or not _quality_enabled(payload):
        raise BilingualQualityError("invalid-input")
    raw_path = payload.get("resultPath")
    if not isinstance(raw_path, str):
        raise BilingualQualityError("invalid-input")
    path = Path(raw_path)
    if not path.is_absolute():
        path = REPOSITORY_ROOT / path
    try:
        resolved = path.resolve(strict=True)
        relative = resolved.relative_to(REPOSITORY_ROOT.resolve())
    except (OSError, ValueError):
        raise BilingualQualityError("result-path") from None
    session_id = _session_id(payload)
    if (
        len(relative.parts) != 1
        or resolved.name != f"piper-english-quality-result-{session_id}.json"
    ):
        raise BilingualQualityError("result-path")
    return finalize_quality_session(
        machine_session_id=session_id,
        result_path=resolved,
    )


def _derive(payload: dict[str, object]) -> dict[str, object]:
    if set(payload) != DERIVE_FIELDS or not _quality_enabled(payload):
        raise BilingualQualityError("invalid-input")
    expected_commit_sha = payload.get("expectedCommitSha")
    if not isinstance(expected_commit_sha, str):
        raise BilingualQualityError("invalid-input")
    from benchmarks.bilingual_result import derive_and_cleanup_result

    return derive_and_cleanup_result(
        expected_commit_sha=expected_commit_sha,
        machine_session_id=_session_id(payload),
    )


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("generate", "finalize", "derive"):
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _read()
        action = sys.argv[1]
        if action == "generate":
            output = _generate(payload)
        elif action == "finalize":
            output = _finalize(payload)
        else:
            output = _derive(payload)
        exit_code = 0 if output["status"] == "pass" else 2
    except (OSError, RuntimeError):
        output = {"status": "fail", "failureCode": "invalid-request"}
        exit_code = 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
