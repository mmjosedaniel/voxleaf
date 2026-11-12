"""Model-free controls for version-owned v14 cancellation derivation and admission."""

from __future__ import annotations

import shutil
from pathlib import Path
from typing import cast

import pytest
from test_benchmark_v13_authority import LOADS, ROOT, _git, _v13_raw

from benchmarks import v13_authority, v14_authority
from benchmarks.batch_result import canonical_summary_json, derive_v14_summary
from benchmarks.v4_authority import (
    CORPUS_RELATIVE_PATH,
    PROFILE_RELATIVE_PATH,
    RAW_SCHEMA_RELATIVE_PATH,
    SUMMARY_SCHEMA_RELATIVE_PATH,
)


def _v14_raw() -> tuple[dict[str, object], list[dict[str, object]]]:
    raw = _v13_raw()
    rows: list[dict[str, object]] = [
        {
            "trialId": trial_id,
            "trialIndex": index,
            "callIndex": 100 + index,
            "witnessedPhase": phase,
            "outcome": outcome,
            "candidateCalls": int(index >= 3),
            "publishedBeforeInvalidation": int(index == 5),
            "stalePublishedUnits": 0,
            "suppressedByGate": 6 - index if index >= 4 else None,
            "identityInvalidationNanoseconds": 1,
            "workerTerminationNanoseconds": 2 if index in (2, 3) else None,
            "workerExited": None if index == 1 else True,
            "cleanupNanoseconds": None if index == 1 else 3,
        }
        for index, (trial_id, phase, outcome) in enumerate(
            zip(
                v14_authority.TRIAL_ORDER,
                (
                    "before-dispatch",
                    "worker-accepted",
                    "adapter-entry",
                    "before-publication",
                    "after-first-publication",
                ),
                (
                    "dispatch-rejected",
                    "worker-cancelled",
                    "worker-cancelled",
                    "publication-rejected",
                    "publication-rejected",
                ),
                strict=True,
            ),
            start=1,
        )
    ]
    raw.update(
        schemaVersion=v14_authority.RAW_VERSION,
        profileVersion=v14_authority.PROFILE_VERSION,
        profileSha256=v14_authority.PROFILE_SHA256,
        cancellationTrials=rows,
    )
    return raw, rows


def _derive(raw: dict[str, object]) -> dict[str, object]:
    return derive_v14_summary(
        ROOT, raw, LOADS, raw_session_removed=True, execution_checker=lambda _: True
    )


@pytest.mark.parametrize(
    ("field", "bad", "error"),
    [
        ("passed", True, "result-schema"),
        ("trialIndex", 4, "cancellation-proof"),
        ("callIndex", 104, "cancellation-proof"),
        ("witnessedPhase", "worker-accepted", "cancellation-proof"),
        ("suppressedByGate", 2, "cancellation-proof"),
        ("outcome", "completed", "cancellation-conclusion"),
    ],
)
def test_five_pass_2_3_rejects_fabricated_proof(field: str, bad: object, error: str) -> None:
    raw, rows = _v14_raw()
    rows[-1][field] = bad
    with pytest.raises(v14_authority.V14AuthorityError, match=f":{error}$"):
        _derive(raw)


def test_five_pass_2_3_retains_truthful_stale_publication_failure() -> None:
    raw, rows = _v14_raw()
    rows[-1].update(stalePublishedUnits=1, suppressedByGate=0)
    raw["failureCodes"] = ["cancellation-failed"]
    summary = _derive(raw)
    cancellation = cast(dict[str, object], summary["cancellation"])
    assert cancellation["passedTrialCount"] == 4
    assert cancellation["stalePublishedUnits"] == 1
    assert summary["cancellationProof"] == rows
    conclusions = cast(dict[str, dict[str, object]], summary["conclusions"])
    assert conclusions["standardViability"]["outcome"] == "fail"
    assert conclusions["schedulingSustainability"]["outcome"] == "fail"
    cancellation["passedTrialCount"] = 5
    with pytest.raises(v14_authority.V14AuthorityError, match=":cancellation-conclusion$"):
        v14_authority.validate_v14_result(
            ROOT, summary, summary=True, execution_checker=lambda _: True
        )


def test_five_pass_2_3_v14_cpu_admission_is_version_owned_and_committed(
    tmp_path: Path,
) -> None:
    paths = (
        PROFILE_RELATIVE_PATH,
        CORPUS_RELATIVE_PATH,
        RAW_SCHEMA_RELATIVE_PATH,
        SUMMARY_SCHEMA_RELATIVE_PATH,
        v13_authority.PROFILE_PATH,
        v13_authority.RAW_SCHEMA_PATH,
        v13_authority.SUMMARY_SCHEMA_PATH,
        v14_authority.PROFILE_PATH,
        v14_authority.RAW_SCHEMA_PATH,
        v14_authority.SUMMARY_SCHEMA_PATH,
    )
    for path in paths:
        destination = tmp_path / path
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT / path, destination)
    _git(tmp_path, "init", "--quiet")
    _git(tmp_path, "add", "--", *(path.as_posix() for path in paths))
    _git(tmp_path, "commit", "--quiet", "-m", "synthetic v14 authority")
    raw, _ = _v14_raw()
    raw["executionCommitSha"] = _git(tmp_path, "rev-parse", "HEAD")
    summary = derive_v14_summary(tmp_path, raw, LOADS, raw_session_removed=True)
    cast(dict[str, object], summary["memory"]).update(
        memoryStopCode="shared-gpu-memory", memoryStopTriggered=True
    )
    cast(dict[str, object], summary["counts"])["failedOrTimedOutFirstAttempts"] = 1
    for name in ("standardViability", "schedulingSustainability"):
        cast(dict[str, object], summary["conclusions"])[name] = {
            "outcome": "fail",
            "allRequiredGatesPassed": False,
            "failedGateCodes": ["first-attempt-failure"],
        }
    summary["failureCodes"] = ["shared-gpu-memory", "first-attempt-failure"]
    legacy = tmp_path / v13_authority.GPU_RESULT_PATH
    legacy.write_text(canonical_summary_json(summary), encoding="utf-8")
    with pytest.raises(v14_authority.V14AuthorityError, match=":cpu-admission-result$"):
        v14_authority.load_v14_cpu_admission(tmp_path)
    result = tmp_path / v14_authority.GPU_RESULT_PATH
    result.write_text(canonical_summary_json(summary), encoding="utf-8")
    with pytest.raises(v14_authority.V14AuthorityError, match=":cpu-admission-result$"):
        v14_authority.load_v14_cpu_admission(tmp_path)
    _git(tmp_path, "add", "--", v14_authority.GPU_RESULT_PATH.as_posix())
    _git(tmp_path, "commit", "--quiet", "-m", "synthetic qualifying GPU evidence")
    admission = v14_authority.load_v14_cpu_admission(tmp_path).as_raw()
    assert admission["fullGpuMemoryStopCode"] == "shared-gpu-memory"
    result.write_text("{}", encoding="utf-8")
    with pytest.raises(v14_authority.V14AuthorityError, match=":cpu-admission-result$"):
        v14_authority.load_v14_cpu_admission(tmp_path)
