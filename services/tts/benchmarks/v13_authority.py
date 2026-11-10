"""Frozen Qwen batch successor authority and version-bound result admission."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from collections.abc import Callable
from pathlib import Path
from typing import Final, cast

from benchmarks.v4_authority import (
    CORPUS_SHA256,
    CPU_PROFILE_ID,
    FULL_GPU_PROFILE_ID,
    MEMORY_STOP_CODES,
    FrozenCpuAdmission,
    FrozenV4Authority,
    V4AuthorityError,
    _load_object,
    _mapping,
    _reject_private_content,
    _schema_registry,
    _sha256,
    _verify_cpu_admission,
    _verify_raw_order,
    _verify_summary_conclusions,
    load_frozen_v4_mechanics_authority,
)
from benchmarks.v4_authority import (
    PROFILE_SHA256 as V4_PROFILE_SHA256,
)

PROFILE_VERSION: Final = "tts-short-segment-batch-profile-v13"
RAW_VERSION: Final = "tts-short-segment-batch-raw-v13"
SUMMARY_VERSION: Final = "tts-short-segment-batch-summary-v13"
PROFILE_SHA256: Final = "6eea5f2a688f0298f41a0cc0c48bad3852eca21a83c99ffd9e6bc37479cb3648"
PROFILE_PATH: Final = Path("benchmarks/tts/profile-v13.json")
RAW_SCHEMA_PATH: Final = Path("benchmarks/tts/schemas/short-segment-batch-raw-v13.schema.json")
SUMMARY_SCHEMA_PATH: Final = Path(
    "benchmarks/tts/schemas/short-segment-batch-summary-v13.schema.json"
)
GPU_RESULT_PATH: Final = Path("benchmarks/tts/short-segment-batch-result-v13.json")


class V13AuthorityError(ValueError):
    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-v13-authority:{code}")
        self.code = code


class V13CpuAdmission(FrozenCpuAdmission):
    """A v13 GPU admission validated by the base environment."""


def _authority_paths(root: Path) -> dict[Path, str]:
    if _sha256(root / PROFILE_PATH) != PROFILE_SHA256:
        raise V13AuthorityError("authority-drift")
    profile = _load_object(root / PROFILE_PATH)
    if profile.get("profileVersion") != PROFILE_VERSION or profile.get("predecessorMechanics") != {
        "path": "benchmarks/tts/profile-v4.json",
        "sha256": V4_PROFILE_SHA256,
    }:
        raise V13AuthorityError("profile-identity")
    paths = {PROFILE_PATH: PROFILE_SHA256}
    for name, path in (
        ("privateRawSchema", RAW_SCHEMA_PATH),
        ("contentSafeSummarySchema", SUMMARY_SCHEMA_PATH),
    ):
        digest = _sha256(root / path)
        if profile.get(name) != {"path": path.as_posix(), "sha256": digest}:
            raise V13AuthorityError("authority-drift")
        paths[path] = digest
    return paths


def load_v13_mechanics_authority(root: Path) -> FrozenV4Authority:
    """Verify both authorities without importing schema tooling in the model lock."""

    _authority_paths(root)
    return load_frozen_v4_mechanics_authority(root)


def _committed_hash(root: Path, revision: str, path: Path) -> str | None:
    try:
        contents = subprocess.run(
            ("git", "show", f"{revision}:{path.as_posix()}"),
            cwd=root,
            check=True,
            capture_output=True,
            timeout=5,
        ).stdout
    except (OSError, subprocess.SubprocessError):
        return None
    return hashlib.sha256(contents).hexdigest()


def _execution_owns_authority(root: Path, commit: str) -> bool:
    return re.fullmatch(r"[0-9a-f]{40}", commit) is not None and all(
        _committed_hash(root, commit, path) == digest
        for path, digest in _authority_paths(root).items()
    )


def load_v13_cpu_admission(root: Path) -> V13CpuAdmission:
    """Use only a committed v13 GPU result with verified cleanup and a safety stop."""

    committed_digest = _committed_hash(root, "HEAD", GPU_RESULT_PATH)
    try:
        contents = (root / GPU_RESULT_PATH).read_bytes()
        if committed_digest is None or hashlib.sha256(contents).hexdigest() != committed_digest:
            raise V13AuthorityError("cpu-admission-result")
        result = _mapping(cast(object, json.loads(contents)), "cpu-admission-result")
        if result.get("placementProfileId") != FULL_GPU_PROFILE_ID:
            raise V13AuthorityError("cpu-admission-result")
        validate_v13_result(root, result, summary=True)
    except (OSError, UnicodeError, json.JSONDecodeError, V4AuthorityError, V13AuthorityError):
        raise V13AuthorityError("cpu-admission-result") from None
    memory = _mapping(result.get("memory"), "memory")
    audits = _mapping(result.get("audits"), "audits")
    counts = _mapping(result.get("counts"), "counts")
    conclusions = _mapping(result.get("conclusions"), "conclusions")
    failures = result.get("failureCodes")
    stop_code = memory.get("memoryStopCode")
    attempts = counts.get("failedOrTimedOutFirstAttempts")
    if (
        memory.get("memoryStopTriggered") is not True
        or not isinstance(stop_code, str)
        or stop_code not in MEMORY_STOP_CODES
        or not isinstance(failures, list)
        or stop_code not in failures
        or "cleanup-failed" in failures
        or result.get("cleanupFailureCodes") != []
        or audits.get("cleanup") is not True
        or audits.get("privacy") is not True
        or counts.get("batchTwoCalls") != 12
        or counts.get("batchTwoUnits") != 24
        or counts.get("automaticRetries") != 0
        or not isinstance(attempts, int)
        or isinstance(attempts, bool)
        or attempts <= 0
        or any(
            _mapping(conclusions.get(name), "conclusion").get("outcome") != "fail"
            for name in ("standardViability", "schedulingSustainability")
        )
    ):
        raise V13AuthorityError("cpu-admission-result")
    return V13CpuAdmission(stop_code, committed_digest)


def load_v13_cpu_admission_from_base(root: Path) -> V13CpuAdmission:
    """Verify the pinned schema in the offline base environment before model acquisition."""

    try:
        output = subprocess.run(
            (
                "uv",
                "run",
                "--offline",
                "--no-sync",
                "--locked",
                "--directory",
                str(root / "services/tts"),
                "python",
                "-m",
                "benchmarks.batch_result_cli",
                "admit-v13-cpu",
            ),
            cwd=root,
            check=True,
            stdin=subprocess.DEVNULL,
            capture_output=True,
            timeout=15,
        ).stdout
        receipt = _mapping(cast(object, json.loads(output)), "cpu-admission-result")
        stop = receipt.get("fullGpuMemoryStopCode")
        digest = receipt.get("fullGpuResultSha256")
        if (
            set(receipt) != {"status", "fullGpuMemoryStopCode", "fullGpuResultSha256"}
            or receipt.get("status") != "admitted"
            or not isinstance(stop, str)
            or stop not in MEMORY_STOP_CODES
            or not isinstance(digest, str)
            or digest != _committed_hash(root, "HEAD", GPU_RESULT_PATH)
            or digest != _sha256(root / GPU_RESULT_PATH)
        ):
            raise V13AuthorityError("cpu-admission-result")
        return V13CpuAdmission(stop, digest)
    except (
        OSError,
        UnicodeError,
        json.JSONDecodeError,
        subprocess.SubprocessError,
        V4AuthorityError,
    ):
        raise V13AuthorityError("cpu-admission-result") from None


def validate_v13_result(
    root: Path,
    value: object,
    *,
    summary: bool,
    execution_checker: Callable[[str], bool] | None = None,
) -> None:
    """Validate a complete result with schema and cleanup consistency checks."""

    from jsonschema import Draft202012Validator

    predecessor = load_v13_mechanics_authority(root)
    result = _mapping(value, "result-object")
    _reject_private_content(result, predecessor.corpus)
    schema = _load_object(root / (SUMMARY_SCHEMA_PATH if summary else RAW_SCHEMA_PATH))
    Draft202012Validator.check_schema(schema)
    if not Draft202012Validator(schema, registry=_schema_registry(predecessor)).is_valid(result):
        raise V13AuthorityError("result-schema")
    commit = cast(str, result["executionCommitSha"])
    owns_authority = execution_checker or (lambda sha: _execution_owns_authority(root, sha))
    if (
        result.get("profileSha256") != PROFILE_SHA256
        or result.get("corpusSha256") != CORPUS_SHA256
        or not owns_authority(commit)
    ):
        raise V13AuthorityError("execution-authority")
    _verify_cpu_admission(result)
    if (
        result.get("placementProfileId") == CPU_PROFILE_ID
        and result.get("cpuAdmission") != load_v13_cpu_admission(root).as_raw()
    ):
        raise V13AuthorityError("cpu-admission-result")
    failures = cast(list[str], result["failureCodes"])
    cleanup_failed = bool(result["cleanupFailureCodes"]) or "cleanup-failed" in failures
    if summary:
        _verify_summary_conclusions(result)
        if cleanup_failed:
            audits = _mapping(result["audits"], "audits")
            conclusions = _mapping(result["conclusions"], "conclusions")
            if audits.get("cleanup") is not False or any(
                _mapping(conclusions.get(name), "conclusion").get("outcome") != "fail"
                for name in ("standardViability", "schedulingSustainability")
            ):
                raise V13AuthorityError("cleanup-conclusion")
    else:
        _verify_raw_order(result, predecessor)
