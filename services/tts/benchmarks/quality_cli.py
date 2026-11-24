"""Closed-stdin commands for the disposable blinded TTS quality session."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Final, NoReturn, cast

from benchmarks.cli import (
    PREFLIGHT_FIELDS,
    CommandError,
    parse_preflight_request,
    run_bounded_worker_process,
)
from benchmarks.preflight import PreflightRequest, run_local_preflight
from benchmarks.quality import (
    CORRECTION_REASON,
    RAW_ROOT,
    QualitySessionError,
    _load_staging_session,
    _session_path,
    aggregate_scores,
    cleanup_session,
    correct_meaning_changing_defect,
    finalize_session,
    generate_candidate_audio,
    submit_scorecard,
)
from benchmarks.quality_operation import quality_operation

MAXIMUM_STDIN_BYTES: Final = 262_144
GENERATION_TIMEOUT_SECONDS: Final = 7_200
GENERATE_FIELDS: Final = PREFLIGHT_FIELDS | frozenset(("qualityOptIn", "sessionId"))
FINALIZE_FIELDS: Final = frozenset(("qualityOptIn", "sessionId", "evaluatorCount"))
SUBMIT_FIELDS: Final = frozenset(("qualityOptIn", "sessionId", "scorecard"))
CORRECT_FIELDS: Final = frozenset(
    (
        "qualityOptIn",
        "sessionId",
        "evaluatorId",
        "caseId",
        "reasonCode",
    )
)
SESSION_FIELDS: Final = frozenset(("qualityOptIn", "sessionId"))
GENERATION_RECEIPT_FIELDS: Final = frozenset(
    (
        "status",
        "sessionId",
        "candidateId",
        "generatedSamples",
        "readyForFinalization",
    )
)


class QualityCommandError(RuntimeError):
    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-quality-command:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise QualityCommandError(code)


def _mapping(value: object) -> dict[str, object]:
    if not isinstance(value, dict):
        _fail("invalid-input")
    return cast(dict[str, object], value)


def _read_stdin() -> object:
    value = sys.stdin.read(MAXIMUM_STDIN_BYTES + 1)
    if len(value.encode("utf-8")) > MAXIMUM_STDIN_BYTES:
        _fail("input-limit")
    try:
        return cast(object, json.loads(value))
    except json.JSONDecodeError:
        _fail("invalid-input")


def _require_fields(payload: Mapping[str, object], fields: frozenset[str]) -> None:
    if set(payload) != fields or payload.get("qualityOptIn") is not True:
        _fail("invalid-input")


def _preflight_request(payload: Mapping[str, object]) -> PreflightRequest:
    return parse_preflight_request({field: payload[field] for field in PREFLIGHT_FIELDS})


def _preflight_passed(request: PreflightRequest) -> bool:
    receipt = run_local_preflight(request)
    return (
        request.conditions.purpose == "official"
        and not receipt.failures
        and receipt.eligible_for_official_run
    )


def _validate_generation_receipt(
    value: object,
    request: PreflightRequest,
    session_id: object,
) -> dict[str, object]:
    receipt = _mapping(value)
    if (
        set(receipt) != GENERATION_RECEIPT_FIELDS
        or receipt.get("status") != "pass"
        or receipt.get("sessionId") != session_id
        or receipt.get("candidateId") != request.profile.candidate_id
        or receipt.get("generatedSamples")
        != (
            8
            if request.profile.authority is not None
            and request.profile.authority.profile_version == "tts-cpu-fallback-profile-v6"
            else 12
        )
        or not isinstance(receipt.get("readyForFinalization"), bool)
    ):
        _fail("invalid-worker-output")
    return receipt


def _generate_parent(payload: Mapping[str, object]) -> tuple[dict[str, object], int]:
    _require_fields(payload, GENERATE_FIELDS)
    request = _preflight_request(payload)
    if not _preflight_passed(request):
        return {"status": "fail", "failureCode": "preflight"}, 2
    session_id = payload.get("sessionId")
    if not isinstance(session_id, str):
        _fail("invalid-input")
    try:
        session = _session_path(session_id, raw_root=RAW_ROOT)
        if session.name != session_id:
            _fail("generation")
        session.parent.mkdir(parents=True, exist_ok=True)
        with quality_operation(session, require_session=False):
            return _run_generation_worker(payload, request, session, session_id)
    except (OSError, QualityCommandError, QualitySessionError):
        return {"status": "fail", "failureCode": "generation"}, 2


def _run_generation_worker(
    payload: Mapping[str, object], request: PreflightRequest, session: Path, session_id: str
) -> tuple[dict[str, object], int]:
    existed = session.exists()
    metadata = _load_staging_session(session) if existed else None
    candidate = session / "staging" / request.profile.candidate_id
    temporary = session / "session.json.tmp"
    owned_paths = (session, candidate, temporary)
    if (
        candidate.exists()
        or temporary.exists()
        or any(path.resolve() != path for path in owned_paths)
    ):
        _fail("candidate-state")
    try:
        completed = run_bounded_worker_process(
            (
                str(request.candidate_python.resolve(strict=True)),
                "-m",
                "benchmarks.quality_cli",
                "_generate-worker",
            ),
            json.dumps(payload, ensure_ascii=True, separators=(",", ":")),
            timeout_seconds=GENERATION_TIMEOUT_SECONDS,
            maximum_input_bytes=MAXIMUM_STDIN_BYTES,
            cwd=request.candidate_python.resolve(strict=True).parents[5],
        )
        if completed.returncode != 0 or len(completed.stdout.encode("utf-8")) > 16_384:
            _fail("worker")
        receipt = _validate_generation_receipt(
            cast(object, json.loads(completed.stdout)),
            request,
            session_id,
        )
    except subprocess.TimeoutExpired:
        # The bounded worker reports a watchdog timeout only after tree cleanup.
        try:
            if any(path.resolve() != path for path in owned_paths):
                return {"status": "fail", "failureCode": "cleanup-failed"}, 2
            if not existed:
                if session.exists():
                    shutil.rmtree(session)
            elif _load_staging_session(session) == metadata:
                if candidate.exists():
                    shutil.rmtree(candidate)
                temporary.unlink(missing_ok=True)
        except (OSError, QualitySessionError):
            return {"status": "fail", "failureCode": "cleanup-failed"}, 2
        return {"status": "fail", "failureCode": "generation"}, 2
    except (
        OSError,
        subprocess.SubprocessError,
        json.JSONDecodeError,
        QualityCommandError,
        CommandError,
    ):
        return {"status": "fail", "failureCode": "generation"}, 2
    return receipt, 0


def _generate_worker(payload: Mapping[str, object]) -> tuple[dict[str, object], int]:
    _require_fields(payload, GENERATE_FIELDS)
    request = _preflight_request(payload)
    try:
        if (
            sys.executable.casefold()
            != str(request.candidate_python.resolve(strict=True)).casefold()
            or not _preflight_passed(request)
            or not isinstance(payload.get("sessionId"), str)
        ):
            _fail("worker")
        return generate_candidate_audio(request, cast(str, payload["sessionId"])), 0
    except (OSError, QualitySessionError, QualityCommandError):
        return {"status": "fail", "failureCode": "generation"}, 2


def _finalize(payload: Mapping[str, object]) -> tuple[dict[str, object], int]:
    _require_fields(payload, FINALIZE_FIELDS)
    session_id = payload.get("sessionId")
    evaluator_count = payload.get("evaluatorCount")
    if not isinstance(session_id, str) or not isinstance(evaluator_count, int):
        _fail("invalid-input")
    return finalize_session(session_id, evaluator_count), 0


def _submit(payload: Mapping[str, object]) -> tuple[dict[str, object], int]:
    _require_fields(payload, SUBMIT_FIELDS)
    session_id = payload.get("sessionId")
    if not isinstance(session_id, str):
        _fail("invalid-input")
    return submit_scorecard(session_id, payload.get("scorecard")), 0


def _correct(payload: Mapping[str, object]) -> tuple[dict[str, object], int]:
    _require_fields(payload, CORRECT_FIELDS)
    session_id = payload.get("sessionId")
    evaluator_id = payload.get("evaluatorId")
    case_id = payload.get("caseId")
    reason_code = payload.get("reasonCode")
    if not all(
        isinstance(value, str) for value in (session_id, evaluator_id, case_id, reason_code)
    ):
        _fail("invalid-input")
    if reason_code != CORRECTION_REASON:
        _fail("invalid-input")
    try:
        result = correct_meaning_changing_defect(
            cast(str, session_id),
            cast(str, evaluator_id),
            cast(str, case_id),
            reason_code=reason_code,
        )
    except OSError:
        _fail("correction")
    return result, 0


def _aggregate(payload: Mapping[str, object]) -> tuple[dict[str, object], int]:
    _require_fields(payload, SESSION_FIELDS)
    session_id = payload.get("sessionId")
    if not isinstance(session_id, str):
        _fail("invalid-input")
    return aggregate_scores(session_id), 0


def _cleanup(payload: Mapping[str, object]) -> tuple[dict[str, object], int]:
    _require_fields(payload, SESSION_FIELDS)
    session_id = payload.get("sessionId")
    if not isinstance(session_id, str):
        _fail("invalid-input")
    cleanup_session(session_id)
    return {"status": "pass", "sessionId": session_id, "removed": True}, 0


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in (
        "generate",
        "_generate-worker",
        "finalize",
        "submit",
        "correct",
        "aggregate",
        "cleanup",
    ):
        print('{"status":"fail","failureCode":"invalid-request"}')
        return 2
    try:
        payload = _mapping(_read_stdin())
        action = sys.argv[1]
        if action == "generate":
            output, code = _generate_parent(payload)
        elif action == "_generate-worker":
            output, code = _generate_worker(payload)
        elif action == "finalize":
            output, code = _finalize(payload)
        elif action == "submit":
            output, code = _submit(payload)
        elif action == "correct":
            output, code = _correct(payload)
        elif action == "aggregate":
            output, code = _aggregate(payload)
        else:
            output, code = _cleanup(payload)
    except (QualityCommandError, QualitySessionError, CommandError):
        output, code = {"status": "fail", "failureCode": "invalid-request"}, 2
    except OSError:
        if sys.argv[1] not in ("submit", "aggregate", "cleanup"):
            raise
        output, code = {"status": "fail", "failureCode": "invalid-request"}, 2
    print(json.dumps(output, ensure_ascii=True, separators=(",", ":")))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
