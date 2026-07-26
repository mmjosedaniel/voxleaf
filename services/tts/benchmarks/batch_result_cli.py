"""Closed base-environment derivation and cleanup command for v4 raw evidence."""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path
from typing import Final, cast

from benchmarks.batch_official import official_raw_root
from benchmarks.batch_result import (
    BatchResultError,
    canonical_summary_json,
    derive_v4_summary,
)
from benchmarks.v4_authority import V4AuthorityError

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
MAXIMUM_STDIN_BYTES: Final = 4_096
SESSION_PATTERN: Final = re.compile(r"^[0-9a-f]{32}$")


def _payload() -> dict[str, object]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode()) > MAXIMUM_STDIN_BYTES:
        raise BatchResultError("input")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise BatchResultError("input") from None
    if (
        not isinstance(value, dict)
        or set(value) != {"batchOptIn", "sessionId"}
        or value.get("batchOptIn") is not True
        or not isinstance(value.get("sessionId"), str)
        or SESSION_PATTERN.fullmatch(cast(str, value["sessionId"])) is None
    ):
        raise BatchResultError("input")
    return cast(dict[str, object], value)


def _run(payload: dict[str, object]) -> dict[str, object]:
    session = official_raw_root(
        REPOSITORY_ROOT,
        cast(str, payload["sessionId"]),
    )
    raw_path = session / "raw.json"
    loads_path = session / "loads.json"
    try:
        raw = cast(object, json.loads(raw_path.read_text(encoding="utf-8")))
        loads = cast(object, json.loads(loads_path.read_text(encoding="utf-8")))
        summary = derive_v4_summary(REPOSITORY_ROOT, raw, loads)
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise BatchResultError("raw") from error
    finally:
        if session.exists():
            shutil.rmtree(session)
    return summary


def main() -> int:
    if sys.argv != [sys.argv[0], "derive"]:
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        print(canonical_summary_json(_run(_payload())), end="")
        return 0
    except Exception as error:
        if isinstance(error, BatchResultError):
            code = error.code
        elif isinstance(error, V4AuthorityError):
            code = str(error).rsplit(":", maxsplit=1)[-1]
        else:
            code = "internal"
        print(json.dumps({"status": "fail", "failureCode": code}, separators=(",", ":")))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
