"""Model-free v13 authority, cleanup accounting, and legacy derivation controls."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from pathlib import Path
from typing import cast

import pytest
from test_benchmark_v4_authority import _raw_fixture

from benchmarks.batch_result import canonical_summary_json, derive_v4_summary, derive_v13_summary
from benchmarks.v4_authority import (
    CORPUS_RELATIVE_PATH,
    CPU_PROFILE_ID,
    FULL_GPU_RESULT_RELATIVE_PATH,
    PROFILE_RELATIVE_PATH,
    RAW_SCHEMA_RELATIVE_PATH,
    SUMMARY_SCHEMA_RELATIVE_PATH,
    V4AuthorityError,
    validate_v4_result,
)
from benchmarks.v13_authority import (
    GPU_RESULT_PATH,
    PROFILE_PATH,
    PROFILE_SHA256,
    PROFILE_VERSION,
    RAW_SCHEMA_PATH,
    RAW_VERSION,
    SUMMARY_SCHEMA_PATH,
    V13AuthorityError,
    load_v13_cpu_admission,
    load_v13_cpu_admission_from_base,
    load_v13_mechanics_authority,
    validate_v13_result,
)

ROOT = Path(__file__).resolve().parents[3]
LOADS = [
    {"observationIndex": index, "loadNanoseconds": 1_000_000, "cleanupNanoseconds": 10_000}
    for index in range(1, 6)
]


def _v13_raw() -> dict[str, object]:
    raw = _raw_fixture()
    raw.pop("authorityCommitSha")
    raw.update(
        schemaVersion=RAW_VERSION,
        profileVersion=PROFILE_VERSION,
        profileSha256=PROFILE_SHA256,
        cleanupFailureCodes=[],
    )
    cast(dict[str, object], raw["cleanup"])["rawSessionRemoved"] = False
    for call in cast(list[dict[str, object]], raw["calls"]):
        call["completedNanoseconds"] = 250_000_001
    for unit in cast(list[dict[str, object]], raw["units"]):
        unit.update(
            firstAudioNanoseconds=250_000_000,
            completionNanoseconds=250_000_000,
            requestRtf=0.025,
        )
    return raw


def _derive(raw: dict[str, object], *, removed: bool = True) -> dict[str, object]:
    return derive_v13_summary(
        ROOT, raw, LOADS, raw_session_removed=removed, execution_checker=lambda _commit: True
    )


@pytest.mark.parametrize("failure_marker", ["typed", "failure-code", "raw-session-present"])
def test_dcr_17_cleanup_failure_invalidates_both_conclusions(failure_marker: str) -> None:
    raw = _v13_raw()
    clean = _derive(raw)
    assert cast(dict[str, bool], clean["audits"])["cleanup"] is True
    clean_conclusions = cast(dict[str, dict[str, object]], clean["conclusions"])
    assert clean_conclusions["standardViability"]["outcome"] == "pass"
    assert clean_conclusions["schedulingSustainability"]["outcome"] == "pass"
    if failure_marker == "typed":
        raw["cleanupFailureCodes"] = ["candidate-close"]
    elif failure_marker == "failure-code":
        raw["failureCodes"] = ["cleanup-failed"]
    summary = _derive(raw, removed=failure_marker != "raw-session-present")
    audits = cast(dict[str, bool], summary["audits"])
    conclusions = cast(dict[str, dict[str, object]], summary["conclusions"])
    assert audits["cleanup"] is False
    assert conclusions["standardViability"]["outcome"] == "fail"
    assert conclusions["schedulingSustainability"]["outcome"] == "fail"
    assert "cleanup-failed" in cast(list[str], summary["failureCodes"])
    audits["cleanup"] = True
    with pytest.raises(V13AuthorityError, match=":cleanup-conclusion$"):
        validate_v13_result(ROOT, summary, summary=True, execution_checker=lambda _commit: True)


def test_dcr_17_result_schema_and_frozen_predecessor_are_distinct() -> None:
    raw = _v13_raw()
    validate_v13_result(ROOT, raw, summary=False, execution_checker=lambda _commit: True)
    with pytest.raises(V4AuthorityError, match=":result-schema$"):
        validate_v4_result(ROOT, raw, summary=False)
    with pytest.raises(V13AuthorityError, match=":result-schema$"):
        validate_v13_result(ROOT, _raw_fixture(), summary=False, execution_checker=lambda _: True)
    raw["cleanupFailureCodes"] = ["private-or-untyped-failure"]
    with pytest.raises(V13AuthorityError, match=":result-schema$"):
        validate_v13_result(ROOT, raw, summary=False, execution_checker=lambda _commit: True)


def _git(root: Path, *args: str) -> str:
    return subprocess.run(
        (
            "git",
            "-c",
            "user.name=Authority Test",
            "-c",
            "user.email=test@example.invalid",
            "-c",
            "commit.gpgsign=false",
            "-c",
            "core.autocrlf=false",
            *args,
        ),
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()


def test_dcr_17_cpu_admission_requires_own_committed_qualifying_gpu_result(tmp_path: Path) -> None:
    paths = (
        PROFILE_PATH,
        RAW_SCHEMA_PATH,
        SUMMARY_SCHEMA_PATH,
        PROFILE_RELATIVE_PATH,
        CORPUS_RELATIVE_PATH,
        RAW_SCHEMA_RELATIVE_PATH,
        SUMMARY_SCHEMA_RELATIVE_PATH,
        FULL_GPU_RESULT_RELATIVE_PATH,
    )
    for path in paths:
        destination = tmp_path / path
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / path, destination)
    _git(tmp_path, "init", "--quiet")
    _git(tmp_path, "add", "--", *(path.as_posix() for path in paths))
    _git(tmp_path, "commit", "--quiet", "-m", "synthetic authority fixture")
    execution_commit = _git(tmp_path, "rev-parse", "HEAD")
    load_v13_mechanics_authority(tmp_path)
    with pytest.raises(V13AuthorityError, match=":cpu-admission-result$"):
        load_v13_cpu_admission(tmp_path)

    raw = _v13_raw()
    raw["executionCommitSha"] = execution_commit
    summary = derive_v13_summary(tmp_path, raw, LOADS, raw_session_removed=True)
    memory = cast(dict[str, object], summary["memory"])
    memory.update(memoryStopCode="shared-gpu-memory", memoryStopTriggered=True)
    cast(dict[str, object], summary["counts"])["failedOrTimedOutFirstAttempts"] = 1
    conclusions = cast(dict[str, object], summary["conclusions"])
    for name in ("standardViability", "schedulingSustainability"):
        conclusions[name] = {
            "outcome": "fail",
            "allRequiredGatesPassed": False,
            "failedGateCodes": ["first-attempt-failure"],
        }
    summary["failureCodes"] = ["shared-gpu-memory", "first-attempt-failure"]
    validate_v13_result(tmp_path, summary, summary=True)
    result_path = tmp_path / GPU_RESULT_PATH
    result_path.write_bytes(canonical_summary_json(summary).encode())
    with pytest.raises(V13AuthorityError, match=":cpu-admission-result$"):
        load_v13_cpu_admission(tmp_path)
    _git(tmp_path, "add", "--", GPU_RESULT_PATH.as_posix())
    _git(tmp_path, "commit", "--quiet", "-m", "synthetic full GPU safety-stop result")
    admission = load_v13_cpu_admission(tmp_path).as_raw()
    assert admission == {
        "status": "admitted",
        "fullGpuMemoryStopCode": "shared-gpu-memory",
        "fullGpuResultSha256": hashlib.sha256(result_path.read_bytes()).hexdigest(),
    }
    raw.update(placementProfileId=CPU_PROFILE_ID, cpuAdmission=admission)
    validate_v13_result(tmp_path, raw, summary=False)
    cast(dict[str, object], raw["cpuAdmission"])["fullGpuResultSha256"] = "0" * 64
    with pytest.raises(V13AuthorityError, match=":cpu-admission-result$"):
        validate_v13_result(tmp_path, raw, summary=False)

    del cast(dict[str, object], summary["counts"])["coldLoads"]
    result_path.write_bytes(canonical_summary_json(summary).encode())
    _git(tmp_path, "add", "--", GPU_RESULT_PATH.as_posix())
    _git(tmp_path, "commit", "--quiet", "-m", "schema-invalid synthetic safety-stop result")
    with pytest.raises(V13AuthorityError, match=":cpu-admission-result$"):
        load_v13_cpu_admission(tmp_path)


def test_v4_raw_derivation_and_rejected_committed_result_remain_valid() -> None:
    raw = _raw_fixture()
    summary = derive_v4_summary(ROOT, raw, LOADS, ancestry_checker=lambda _authority, _commit: True)
    assert summary["schemaVersion"] == "tts-short-segment-batch-summary-v4"
    assert "cleanupFailureCodes" not in summary
    committed = (ROOT / FULL_GPU_RESULT_RELATIVE_PATH).read_bytes()
    assert canonical_summary_json(json.loads(committed)).encode() == committed


def test_dcr_17_cpu_admission_calls_the_real_base_environment_offline(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    run = subprocess.run
    observed: list[dict[str, object]] = []

    def record_child(args: tuple[str, ...], **kwargs: object) -> subprocess.CompletedProcess[bytes]:
        try:
            completed = run(args, **kwargs)  # type: ignore[call-overload]
        except subprocess.CalledProcessError as error:
            if args[0] == "uv":
                observed.append(json.loads(error.stdout))
            raise
        if args[0] == "uv":
            assert "--offline" in args and "--no-sync" in args and "--locked" in args
            assert args[-2:] == ("benchmarks.batch_result_cli", "admit-v13-cpu")
            observed.append(json.loads(completed.stdout))
        return completed  # type: ignore[no-any-return]

    monkeypatch.setattr("benchmarks.v13_authority.subprocess.run", record_child)
    try:
        admission = load_v13_cpu_admission_from_base(ROOT)
    except V13AuthorityError as error:
        assert error.code == "cpu-admission-result"
        assert observed == [{"status": "fail", "failureCode": "cpu-admission-result"}]
    else:
        assert observed == [admission.as_raw()]
