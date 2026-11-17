"""Explicit prospective prepare/finalize/derive; never falls back to legacy raw."""

from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path
from typing import cast

from benchmarks import benchmark_safety as safety
from benchmarks.batch_result import derive_v14_safety_summary
from benchmarks.dual_worker_result import derive_v5_safety_summary
from benchmarks.power_observation import observe_power

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]


def derive(repository: Path, expected: dict[str, object]) -> dict[str, object]:
    evidence = safety.verify(repository, expected)
    summary = (
        derive_v14_safety_summary(repository, evidence, raw_session_removed=True)
        if expected["family"] == "batch"
        else derive_v5_safety_summary(repository, evidence)
    )
    envelope: dict[str, object] = {
        "schemaVersion": safety.VERSION,
        "binding": expected,
        "verifiedDigests": evidence.digests,
        "measurementSummary": summary,
        "powerRestorationVerified": True,
        "privateDataRemoved": True,
    }
    # Serialize before removing private inputs, and never publish before actual removal.
    safety.encode(envelope)
    path = safety.root(repository, cast(str, expected["session"])) / "data"
    shutil.rmtree(path)
    safety.require(not path.exists(), "cleanup-failed")
    return envelope


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("prepare", "finalize", "derive", "observe"):
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        if sys.argv[1] == "observe":
            print(json.dumps(observe_power().as_json(), separators=(",", ":")))
            return 0
        contents = sys.stdin.buffer.read(32_769)
        safety.require(len(contents) <= 32_768, "input-limit")
        payload = safety.record(safety.decode(contents), {"family", "request"})
        safety.require(
            isinstance(payload["family"], str) and isinstance(payload["request"], dict), "input"
        )
        expected = safety.binding(
            cast(str, payload["family"]), cast(dict[str, object], payload["request"])
        )
        command = {"prepare": safety.prepare, "finalize": safety.finalize, "derive": derive}[
            sys.argv[1]
        ]
        result = command(REPOSITORY_ROOT, expected)
        print(safety.encode(result).decode(), end="")
        return 0
    except Exception as error:
        # Paths, input and native exception text never cross the receipt boundary.
        code = error.code if isinstance(error, safety.SafetyError) else "evidence-unavailable"
        print(json.dumps({"status": "fail", "failureCode": code}, separators=(",", ":")))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
