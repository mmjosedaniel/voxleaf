"""Closed base-environment derivation and cleanup for v4 and v13 evidence."""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path
from typing import Final, cast

from jsonschema import Draft202012Validator

from benchmarks.batch_official import official_raw_root
from benchmarks.batch_result import (
    BatchResultError,
    canonical_summary_json,
    derive_v4_summary,
    derive_v13_summary,
)
from benchmarks.v4_authority import (
    V4AuthorityError,
    load_frozen_v4_authority,
)
from benchmarks.v13_authority import PROFILE_VERSION, V13AuthorityError, load_v13_cpu_admission

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
        or set(value)
        not in ({"batchOptIn", "sessionId"}, {"batchOptIn", "sessionId", "profileVersion"})
        or value.get("batchOptIn") is not True
        or not isinstance(value.get("sessionId"), str)
        or SESSION_PATTERN.fullmatch(cast(str, value["sessionId"])) is None
    ):
        raise BatchResultError("input")
    if "profileVersion" in value and value["profileVersion"] not in (
        "tts-short-segment-batch-profile-v4",
        PROFILE_VERSION,
    ):
        raise BatchResultError("official-version")
    return cast(dict[str, object], value)


def _run(payload: dict[str, object]) -> dict[str, object]:
    profile = payload.get("profileVersion", "tts-short-segment-batch-profile-v4")
    if profile == PROFILE_VERSION:
        return _run_v13(cast(str, payload["sessionId"]))
    if profile != "tts-short-segment-batch-profile-v4":
        raise BatchResultError("official-version")
    session = official_raw_root(
        REPOSITORY_ROOT,
        cast(str, payload["sessionId"]),
    )
    raw_path = session / "raw.json"
    loads_path = session / "loads.json"
    try:
        raw = cast(object, json.loads(raw_path.read_text(encoding="utf-8")))
        loads = cast(object, json.loads(loads_path.read_text(encoding="utf-8")))
        try:
            summary = derive_v4_summary(REPOSITORY_ROOT, raw, loads)
        except V4AuthorityError as error:
            if str(error).endswith(":result-schema"):
                authority = load_frozen_v4_authority(REPOSITORY_ROOT)
                schema_errors = sorted(
                    Draft202012Validator(authority.raw_schema).iter_errors(raw),
                    key=lambda item: tuple(str(part) for part in item.absolute_path),
                )
                if schema_errors:
                    first = schema_errors[0]
                    path = "-".join(str(part) for part in first.absolute_path) or "root"
                    validator = str(first.validator or "unknown")
                    raise BatchResultError(f"result-schema-{path}-{validator}"[:160]) from error
            raise
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise BatchResultError("raw") from error
    finally:
        if session.exists():
            shutil.rmtree(session)
    return summary


def _run_v13(session_id: str) -> dict[str, object]:
    session = official_raw_root(REPOSITORY_ROOT, session_id, version="v13")
    try:
        raw = cast(object, json.loads((session / "raw.json").read_text(encoding="utf-8")))
        loads = cast(object, json.loads((session / "loads.json").read_text(encoding="utf-8")))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise BatchResultError("raw") from error
    finally:
        if session.exists():
            shutil.rmtree(session)
    return derive_v13_summary(REPOSITORY_ROOT, raw, loads, raw_session_removed=True)


def main() -> int:
    admission = sys.argv == [sys.argv[0], "admit-v13-cpu"]
    if not admission and sys.argv != [sys.argv[0], "derive"]:
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        result = load_v13_cpu_admission(REPOSITORY_ROOT).as_raw() if admission else _run(_payload())
        print(canonical_summary_json(result), end="")
        return 0
    except Exception as error:
        if isinstance(error, (BatchResultError, V13AuthorityError)):
            code = error.code
        elif isinstance(error, V4AuthorityError):
            code = str(error).rsplit(":", maxsplit=1)[-1]
        else:
            code = "internal"
        print(json.dumps({"status": "fail", "failureCode": code}, separators=(",", ":")))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
