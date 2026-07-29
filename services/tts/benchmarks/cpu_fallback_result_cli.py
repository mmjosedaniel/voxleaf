"""Closed-stdin commands for v6 CPU fallback assessment and derivation."""

from __future__ import annotations

import json
import sys
from collections.abc import Mapping
from typing import Final, NoReturn, cast

from benchmarks.cli import PREFLIGHT_FIELDS, parse_preflight_request
from benchmarks.cpu_fallback_result import (
    CpuFallbackResultError,
    assess_machine_result,
    derive_result,
)
from benchmarks.preflight import PreflightRequest, run_local_preflight

MAXIMUM_STDIN_BYTES: Final = 262_144
ASSESS_FIELDS: Final = PREFLIGHT_FIELDS | frozenset(
    ("cpuFallbackOptIn", "performanceSessionId", "authorityCommitSha")
)
DERIVE_FIELDS: Final = ASSESS_FIELDS | frozenset(("qualitySessionId",))


class CpuFallbackResultCommandError(RuntimeError):
    def __init__(self, code: str) -> None:
        super().__init__(f"tts-cpu-fallback-result-command:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise CpuFallbackResultCommandError(code)


def _read_stdin() -> dict[str, object]:
    value = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(value.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        _fail("input-limit")
    try:
        payload = cast(object, json.loads(value))
    except json.JSONDecodeError:
        _fail("invalid-input")
    if not isinstance(payload, dict):
        _fail("invalid-input")
    return cast(dict[str, object], payload)


def _request(
    payload: Mapping[str, object],
    expected_fields: frozenset[str],
) -> PreflightRequest:
    if set(payload) != expected_fields or payload.get("cpuFallbackOptIn") is not True:
        _fail("invalid-input")
    request = parse_preflight_request({field: payload[field] for field in PREFLIGHT_FIELDS})
    if (
        request.conditions.purpose != "official"
        or request.profile.authority is None
        or request.profile.authority.profile_version != "tts-cpu-fallback-profile-v6"
    ):
        _fail("invalid-input")
    return request


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("assess", "derive"):
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _read_stdin()
        action = sys.argv[1]
        fields = ASSESS_FIELDS if action == "assess" else DERIVE_FIELDS
        request = _request(payload, fields)
        receipt = run_local_preflight(request)
        performance_session = payload.get("performanceSessionId")
        authority_commit = payload.get("authorityCommitSha")
        if not isinstance(performance_session, str) or not isinstance(
            authority_commit,
            str,
        ):
            _fail("invalid-input")
        if action == "assess":
            output = assess_machine_result(
                request,
                receipt,
                performance_session_id=performance_session,
                authority_commit_sha=authority_commit,
            )
        else:
            quality_session = payload.get("qualitySessionId")
            if not isinstance(quality_session, str):
                _fail("invalid-input")
            output = derive_result(
                request,
                receipt,
                performance_session_id=performance_session,
                quality_session_id=quality_session,
                authority_commit_sha=authority_commit,
            )
        code = 0 if output.get("status") == "pass" else 2
    except (
        CpuFallbackResultCommandError,
        CpuFallbackResultError,
    ):
        output, code = {"status": "fail", "failureCode": "invalid-request"}, 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
