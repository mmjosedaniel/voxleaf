"""Closed base-environment derivation and cleanup for versioned evidence."""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path
from typing import Final, Literal, cast

from jsonschema import Draft202012Validator

from benchmarks import v14_authority
from benchmarks.batch_official import official_raw_root
from benchmarks.batch_result import (
    BatchResultError,
    canonical_summary_json,
    derive_v4_summary,
    derive_v13_summary,
    derive_v14_summary,
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
        v14_authority.PROFILE_VERSION,
    ):
        raise BatchResultError("official-version")
    return cast(dict[str, object], value)


def _run(payload: dict[str, object]) -> dict[str, object]:
    profile = payload.get("profileVersion", "tts-short-segment-batch-profile-v4")
    if profile == PROFILE_VERSION:
        return _run_successor(cast(str, payload["sessionId"]), "v13")
    if profile == v14_authority.PROFILE_VERSION:
        return _run_successor(cast(str, payload["sessionId"]), "v14")
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


def _run_successor(session_id: str, version: Literal["v13", "v14"]) -> dict[str, object]:
    session = official_raw_root(REPOSITORY_ROOT, session_id, version=version)
    try:
        raw = cast(object, json.loads((session / "raw.json").read_text(encoding="utf-8")))
        loads = cast(object, json.loads((session / "loads.json").read_text(encoding="utf-8")))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise BatchResultError("raw") from error
    finally:
        if session.exists():
            shutil.rmtree(session)
    derive = derive_v14_summary if version == "v14" else derive_v13_summary
    return derive(REPOSITORY_ROOT, raw, loads, raw_session_removed=True)


def main() -> int:
    args = sys.argv[1:]
    if len(args) != 1 or args[0] not in ("derive", "admit-v13-cpu", "admit-v14-cpu"):
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        if args[0] == "admit-v14-cpu":
            result = v14_authority.load_v14_cpu_admission(REPOSITORY_ROOT).as_raw()
        elif args[0] == "admit-v13-cpu":
            result = load_v13_cpu_admission(REPOSITORY_ROOT).as_raw()
        else:
            result = _run(_payload())
        print(canonical_summary_json(result), end="")
        return 0
    except Exception as error:
        if isinstance(
            error, (BatchResultError, V13AuthorityError, v14_authority.V14AuthorityError)
        ):
            code = error.code
        elif isinstance(error, V4AuthorityError):
            code = str(error).rsplit(":", maxsplit=1)[-1]
        else:
            code = "internal"
        print(json.dumps({"status": "fail", "failureCode": code}, separators=(",", ":")))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
