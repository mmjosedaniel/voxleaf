"""Versioned maintainer observer authority. Service protocol v1 is unchanged."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from collections.abc import Mapping
from pathlib import Path
from typing import Final, cast

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

from benchmarks import service_handoff_authority as v1

PROFILE_PATH: Final = Path("benchmarks/tts/service-handoff-profile-v2.json")
SCHEMA_PATH: Final = Path("benchmarks/tts/schemas/service-handoff-result-v2.schema.json")
PROFILE_VERSION: Final = "tts-service-handoff-profile-v2"
PROFILE_SHA256: Final = "13e9a7a30c35d3277d98d539075778a2e51ff14e89517f268a1a09da1336cc68"
PREDECESSOR_SCHEMA_SHA256: Final = (
    "f8e88a350875b7249a9224809cfe1a250c9f5a1d3155c48e3a7e623047c0e251"
)
LEGACY_AUTHORITY_COMMIT_SHA: Final = "28fe4349eb40d137e3389b2f8e3c8d76f8fa7bb3"
OBSERVER_VERSION: Final = 2
OBSERVER_RECORD_BYTES: Final = 256
NATIVE_RECORD_BYTES: Final = 16_384
NATIVE_QUEUE_RECORDS: Final = 8
NATIVE_RECORD_COUNT: Final = 48
ACK_TIMEOUT_SECONDS: Final = 30.0
RUN_TIMEOUT_SECONDS: Final = 1_650.0
PROCESS_REAP_SECONDS: Final = 5.0
READER_JOIN_SECONDS: Final = 1.0
CLEANUP_ORDER: Final = (
    "accepted-before-output-cancellation",
    "mid-generation-cancellation",
    "child-crash",
    "application-exit",
)


class HandoffV2AuthorityError(ValueError):
    def __init__(self, code: str) -> None:
        super().__init__(f"tts-service-handoff-v2-authority:{code}")


def _load_authority(root: Path) -> tuple[Mapping[str, object], str]:
    profile = (root / PROFILE_PATH).read_bytes()
    if hashlib.sha256(profile).hexdigest() != PROFILE_SHA256:
        raise HandoffV2AuthorityError("profile-drift")
    data = cast(dict[str, object], json.loads(profile))
    if data.get("profileVersion") != PROFILE_VERSION or data.get("predecessorMatrix") != {
        "path": v1.PROFILE_PATH.as_posix(),
        "sha256": v1.PROFILE_SHA256,
    }:
        raise HandoffV2AuthorityError("profile-identity")
    schema = (root / SCHEMA_PATH).read_bytes()
    digest = hashlib.sha256(schema).hexdigest()
    if data.get("resultSchema") != {"path": SCHEMA_PATH.as_posix(), "sha256": digest}:
        raise HandoffV2AuthorityError("schema-drift")
    if (
        data.get("predecessorResultSchema")
        != {
            "path": v1.RESULT_SCHEMA_PATH.as_posix(),
            "sha256": PREDECESSOR_SCHEMA_SHA256,
        }
        or hashlib.sha256((root / v1.RESULT_SCHEMA_PATH).read_bytes()).hexdigest()
        != PREDECESSOR_SCHEMA_SHA256
    ):
        raise HandoffV2AuthorityError("predecessor-schema-drift")
    return cast(dict[str, object], json.loads(schema)), digest


def verify_execution_authority(root: Path, commit: str) -> None:
    _, schema_digest = _load_authority(root)
    v1.load_service_handoff_authority(root)
    if re.fullmatch(r"[0-9a-f]{40}", commit) is None:
        raise HandoffV2AuthorityError("execution-authority")
    for path, digest in (
        (PROFILE_PATH, PROFILE_SHA256),
        (SCHEMA_PATH, schema_digest),
        (v1.PROFILE_PATH, v1.PROFILE_SHA256),
        (v1.RESULT_SCHEMA_PATH, PREDECESSOR_SCHEMA_SHA256),
    ):
        try:
            contents = subprocess.run(
                ("git", "show", f"{commit}:{path.as_posix()}"),
                cwd=root,
                check=True,
                capture_output=True,
                timeout=5,
            ).stdout
        except (OSError, subprocess.SubprocessError):
            raise HandoffV2AuthorityError("execution-authority") from None
        if hashlib.sha256(contents).hexdigest() != digest:
            raise HandoffV2AuthorityError("execution-authority")


def validate_handoff_v2_result(root: Path, value: object) -> Mapping[str, object]:
    schema, _ = _load_authority(root)
    predecessor = v1.load_service_handoff_authority(root)
    registry = Registry().with_resource(
        cast(str, predecessor.result_schema["$id"]),
        Resource.from_contents(predecessor.result_schema),
    )
    Draft202012Validator.check_schema(schema)
    if not isinstance(value, dict) or not Draft202012Validator(schema, registry=registry).is_valid(
        value
    ):
        raise HandoffV2AuthorityError("result-schema")
    result = cast(dict[str, object], value)
    if result.get("profileSha256") != PROFILE_SHA256:
        raise HandoffV2AuthorityError("result-authority")
    verify_execution_authority(root, cast(str, result["executionCommitSha"]))
    legacy = dict(result)
    legacy.pop("observerProtocolVersion")
    legacy.pop("cleanupAcknowledgements")
    legacy.update(
        schemaVersion=1,
        profileVersion="tts-service-handoff-profile-v1",
        profileSha256=v1.PROFILE_SHA256,
        authorityCommitSha=LEGACY_AUTHORITY_COMMIT_SHA,
    )
    v1.validate_service_handoff_result(root, legacy)
    return result
