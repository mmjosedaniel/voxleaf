"""The new observer receipt stays separate from frozen v1 evidence."""

from __future__ import annotations

import copy
import hashlib
import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import cast

import pytest

from benchmarks import service_handoff_authority as v1
from benchmarks import service_handoff_v2_authority as v2

ROOT = Path(__file__).resolve().parents[3]
V1_RESULT = ROOT / "benchmarks/tts/service-handoff-result-v1-exact-host.json"


def test_dcr_22_v2_frozen_bounds_match_the_finite_run_budget() -> None:
    contents = (ROOT / v2.PROFILE_PATH).read_bytes()
    assert hashlib.sha256(contents).hexdigest() == v2.PROFILE_SHA256
    observer = json.loads(contents)["observerProtocol"]
    assert observer["cleanupOrder"] == list(v2.CLEANUP_ORDER)
    assert observer["maximumObserverRecordBytes"] == v2.OBSERVER_RECORD_BYTES
    assert observer["maximumNativeRecordBytes"] == v2.NATIVE_RECORD_BYTES
    assert observer["maximumNativeRecords"] == v2.NATIVE_RECORD_COUNT
    assert observer["maximumQueuedNativeRecords"] == v2.NATIVE_QUEUE_RECORDS
    assert observer["acknowledgementTimeoutMilliseconds"] == v2.ACK_TIMEOUT_SECONDS * 1_000
    assert observer["ownedProcessReapTimeoutSeconds"] == v2.PROCESS_REAP_SECONDS
    assert observer["ownedOutputReaderJoinTimeoutSeconds"] == v2.READER_JOIN_SECONDS
    assert observer["runDeadlineSeconds"] == sum(observer["runBudgetSeconds"].values())
    assert observer["runDeadlineSeconds"] == v2.RUN_TIMEOUT_SECONDS


def _git(root: Path, *args: str) -> str:
    return subprocess.run(
        (
            "git",
            "-c",
            "user.name=Handoff Fixture",
            "-c",
            "user.email=fixture@example.invalid",
            "-c",
            "commit.gpgsign=false",
            "-c",
            "core.autocrlf=false",
            "-c",
            f"core.hooksPath={root / 'no-hooks'}",
            *args,
        ),
        cwd=root,
        env={key: value for key, value in os.environ.items() if not key.upper().startswith("GIT_")},
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()


def test_dcr_22_result_requires_exact_four_distinct_acknowledgements(tmp_path: Path) -> None:
    historical = cast(dict[str, object], json.loads(V1_RESULT.read_bytes()))
    v1.validate_service_handoff_result(ROOT, historical)
    result = copy.deepcopy(historical)
    result.pop("authorityCommitSha")
    acknowledgements = [
        {"phase": phase, "sequence": seq} for seq, phase in enumerate(v2.CLEANUP_ORDER, 1)
    ]
    result.update(
        schemaVersion=2,
        profileVersion=v2.PROFILE_VERSION,
        profileSha256=v2.PROFILE_SHA256,
        observerProtocolVersion=2,
        cleanupAcknowledgements=acknowledgements,
    )
    with pytest.raises(v2.HandoffV2AuthorityError, match=":execution-authority$"):
        v2.validate_handoff_v2_result(ROOT, result)

    fixture_paths = (
        v1.PROFILE_PATH,
        v1.RESULT_SCHEMA_PATH,
        v1.CANDIDATE_PROFILE_PATH,
        v1.CANDIDATE_LOCK_PATH,
        v2.PROFILE_PATH,
        v2.SCHEMA_PATH,
    )
    for path in fixture_paths:
        (tmp_path / path).parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / path, tmp_path / path)
    _git(tmp_path, "init", "--quiet")
    _git(tmp_path, "add", "--", *(path.as_posix() for path in fixture_paths))
    _git(tmp_path, "commit", "--quiet", "-m", "synthetic v2 authority fixture")
    result["executionCommitSha"] = _git(tmp_path, "rev-parse", "HEAD")
    assert v2.validate_handoff_v2_result(tmp_path, result) == result
    with pytest.raises(v1.ServiceHandoffAuthorityError, match=":result-schema$"):
        v1.validate_service_handoff_result(ROOT, result)
    with pytest.raises(v2.HandoffV2AuthorityError, match=":result-schema$"):
        v2.validate_handoff_v2_result(ROOT, historical)
    for bad in (acknowledgements[:-1], list(reversed(acknowledgements)), [acknowledgements[0]] * 4):
        result["cleanupAcknowledgements"] = bad
        with pytest.raises(v2.HandoffV2AuthorityError, match=":result-schema$"):
            v2.validate_handoff_v2_result(tmp_path, result)
    result["cleanupAcknowledgements"] = acknowledgements
    result["executionCommitSha"] = "0" * 40
    with pytest.raises(v2.HandoffV2AuthorityError, match=":execution-authority$"):
        v2.validate_handoff_v2_result(tmp_path, result)

    # A real commit with a different schema is also outside this authority.
    schema_path = tmp_path / v2.SCHEMA_PATH
    pinned = schema_path.read_bytes()
    schema_path.write_bytes(pinned + b"\n")
    _git(tmp_path, "add", "--", v2.SCHEMA_PATH.as_posix())
    _git(tmp_path, "commit", "--quiet", "-m", "synthetic mismatched schema")
    result["executionCommitSha"] = _git(tmp_path, "rev-parse", "HEAD")
    schema_path.write_bytes(pinned)
    with pytest.raises(v2.HandoffV2AuthorityError, match=":execution-authority$"):
        v2.validate_handoff_v2_result(tmp_path, result)
