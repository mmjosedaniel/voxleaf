"""Closed base-environment derivation and raw cleanup for v5."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Final, cast

from jsonschema import Draft202012Validator

from benchmarks.dual_worker_official import delete_private_raw, official_raw_root
from benchmarks.dual_worker_result import (
    DualWorkerResultError,
    canonical_summary_json,
    derive_v5_summary,
)
from benchmarks.v5_authority import V5AuthorityError, load_frozen_v5_authority

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
MAXIMUM_STDIN_BYTES: Final = 4_096
SESSION_PATTERN: Final = re.compile(r"^[0-9a-f]{32}$")
ARMS: Final = ("cpu-solo", "gpu-solo", "concurrent")


def _payload() -> dict[str, str]:
    raw = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(raw.encode()) > MAXIMUM_STDIN_BYTES:
        raise DualWorkerResultError("input")
    try:
        value = cast(object, json.loads(raw))
    except json.JSONDecodeError:
        raise DualWorkerResultError("input") from None
    if (
        not isinstance(value, dict)
        or set(value) != {"dualWorkerOptIn", "sessionId", "arm"}
        or value.get("dualWorkerOptIn") is not True
        or value.get("arm") not in ARMS
        or not isinstance(value.get("sessionId"), str)
        or SESSION_PATTERN.fullmatch(cast(str, value["sessionId"])) is None
    ):
        raise DualWorkerResultError("input")
    return {"sessionId": cast(str, value["sessionId"]), "arm": cast(str, value["arm"])}


def _summary_path(arm: str) -> Path:
    return REPOSITORY_ROOT / f"benchmarks/tts/dual-worker-result-v5-{arm}.json"


def _run(payload: dict[str, str]) -> dict[str, object]:
    session_id = payload["sessionId"]
    path = official_raw_root(REPOSITORY_ROOT, session_id) / "raw.json"
    try:
        raw = cast(dict[str, object], json.loads(path.read_text(encoding="utf-8")))
        if raw.get("arm") != payload["arm"]:
            raise DualWorkerResultError("input")
        cleanup_value = raw.get("cleanup")
        if not isinstance(cleanup_value, dict):
            raise DualWorkerResultError("raw")
        cleanup = cast(dict[str, object], cleanup_value)
        cleanup["rawSessionRemoved"] = True
        baseline: object | None = None
        if payload["arm"] == "concurrent":
            baseline = json.loads(_summary_path("gpu-solo").read_text(encoding="utf-8"))
        try:
            summary = derive_v5_summary(
                REPOSITORY_ROOT,
                raw,
                gpu_baseline_value=baseline,
            )
        except V5AuthorityError as error:
            if str(error).endswith(":result-schema"):
                authority = load_frozen_v5_authority(REPOSITORY_ROOT)
                schema_errors = sorted(
                    Draft202012Validator(authority.raw_schema).iter_errors(raw),
                    key=lambda item: tuple(str(part) for part in item.absolute_path),
                )
                if schema_errors:
                    first = schema_errors[0]
                    schema_path = "-".join(str(part) for part in first.absolute_path) or "root"
                    validator = str(first.validator or "unknown")
                    raise DualWorkerResultError(
                        f"result-schema-{schema_path}-{validator}"[:160]
                    ) from error
            raise
        delete_private_raw(REPOSITORY_ROOT, session_id)
        if official_raw_root(REPOSITORY_ROOT, session_id).exists():
            raise DualWorkerResultError("cleanup")
        return summary
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise DualWorkerResultError("raw") from error


def main() -> int:
    if sys.argv != [sys.argv[0], "derive"]:
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        print(canonical_summary_json(_run(_payload())), end="")
        return 0
    except Exception as error:
        if isinstance(error, DualWorkerResultError):
            code = error.code
        elif isinstance(error, V5AuthorityError):
            code = str(error).rsplit(":", maxsplit=1)[-1]
        else:
            code = "internal"
        print(json.dumps({"status": "fail", "failureCode": code}, separators=(",", ":")))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
