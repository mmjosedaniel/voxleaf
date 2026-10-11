"""Piper package integrity, independent of acquisition and build lifecycle."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from pathlib import Path, PurePosixPath
from typing import Final, cast

HASH_BLOCK_BYTES: Final = 8 * 1024 * 1024
PACKAGE_DIRECTORY_NAME: Final = "voxleaf-piper-core-v1"
RUNTIME_MANIFEST_NAME: Final = "runtime-manifest-v1.json"


class ReleaseCoreError(RuntimeError):
    """One closed, content-free release-core failure."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


ReleaseCoreError.__module__ = "voxleaf_tts.release_core"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    try:
        with path.open("rb") as source:
            for block in iter(lambda: source.read(HASH_BLOCK_BYTES), b""):
                digest.update(block)
    except OSError:
        raise ReleaseCoreError("piper-core-file-unavailable") from None
    return digest.hexdigest()


def _json_object(value: object, code: str) -> dict[str, object]:
    if not isinstance(value, dict) or not all(isinstance(key, str) for key in value):
        raise ReleaseCoreError(code)
    return cast(dict[str, object], value)


def _json_array(value: object, code: str) -> list[object]:
    if not isinstance(value, list):
        raise ReleaseCoreError(code)
    return cast(list[object], value)


def _exact_keys(value: Mapping[str, object], expected: set[str], code: str) -> None:
    if set(value) != expected:
        raise ReleaseCoreError(code)


def _text(value: object, code: str) -> str:
    if not isinstance(value, str) or not value:
        raise ReleaseCoreError(code)
    return value


def _positive_int(value: object, code: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
        raise ReleaseCoreError(code)
    return value


def _nonnegative_int(value: object, code: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or value < 0:
        raise ReleaseCoreError(code)
    return value


def _sha256_text(value: object, code: str) -> str:
    text = _text(value, code)
    if len(text) != 64 or any(character not in "0123456789abcdef" for character in text):
        raise ReleaseCoreError(code)
    return text


def safe_relative_path(value: str) -> PurePosixPath:
    path = PurePosixPath(value)
    if (
        path.is_absolute()
        or not path.parts
        or any(part in {"", ".", ".."} for part in path.parts)
        or "\\" in value
        or ":" in value
    ):
        raise ReleaseCoreError("piper-core-invalid-path")
    return path


def _load_json(path: Path, code: str) -> dict[str, object]:
    try:
        return _json_object(json.loads(path.read_text(encoding="utf-8")), code)
    except (OSError, UnicodeError, json.JSONDecodeError):
        raise ReleaseCoreError(code) from None


def _file_record(root: Path, path: Path) -> dict[str, object]:
    relative = path.relative_to(root).as_posix()
    safe_relative_path(relative)
    try:
        size = path.stat().st_size
    except OSError:
        raise ReleaseCoreError("piper-core-staging-failed") from None
    return {"path": relative, "sha256": sha256_file(path), "sizeBytes": size}


def build_runtime_manifest(
    package_root: Path, source_manifest: Mapping[str, object]
) -> dict[str, object]:
    files = [
        _file_record(package_root, path)
        for path in sorted(package_root.rglob("*"), key=lambda item: item.as_posix())
        if path.is_file() and path.name != RUNTIME_MANIFEST_NAME
    ]
    lock = _json_object(source_manifest["coreLock"], "piper-core-source-manifest-invalid")
    profiles = []
    for value in _json_array(source_manifest["voices"], "piper-core-source-manifest-invalid"):
        voice = _json_object(value, "piper-core-source-manifest-invalid")
        profiles.append(
            {
                "language": voice["language"],
                "modelRoot": voice["targetDirectory"],
                "profileId": voice["profileId"],
                "runtimeVoice": voice["runtimeVoice"],
            }
        )
    return {
        "schemaVersion": 1,
        "packageId": PACKAGE_DIRECTORY_NAME,
        "packageVersion": "1",
        "platform": "windows-x86_64",
        "coreLockSha256": lock["sha256"],
        "runtime": {
            "pythonPath": "runtime/python.exe",
            "sitePackagesPath": "runtime/Lib/site-packages",
            "serviceModule": "voxleaf_tts.piper_service",
            "profiles": profiles,
        },
        "payloadBytes": sum(cast(int, record["sizeBytes"]) for record in files),
        "files": files,
    }


def render_manifest(manifest: Mapping[str, object]) -> bytes:
    return (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode("utf-8")


def _manifest_records(manifest: Mapping[str, object]) -> dict[str, tuple[int, str]]:
    files = _json_array(manifest.get("files"), "piper-core-runtime-manifest-invalid")
    records: dict[str, tuple[int, str]] = {}
    for value in files:
        record = _json_object(value, "piper-core-runtime-manifest-invalid")
        _exact_keys(
            record,
            {"path", "sha256", "sizeBytes"},
            "piper-core-runtime-manifest-invalid",
        )
        path = _text(record["path"], "piper-core-runtime-manifest-invalid")
        safe_relative_path(path)
        if path in records or path == RUNTIME_MANIFEST_NAME:
            raise ReleaseCoreError("piper-core-runtime-manifest-invalid")
        records[path] = (
            _nonnegative_int(record["sizeBytes"], "piper-core-runtime-manifest-invalid"),
            _sha256_text(record["sha256"], "piper-core-runtime-manifest-invalid"),
        )
    return records


def verify_package_tree(package_root: Path, manifest: Mapping[str, object]) -> None:
    records = _manifest_records(manifest)
    actual: set[str] = set()
    try:
        canonical_root = package_root.resolve(strict=True)
        for path in package_root.rglob("*"):
            if path.is_symlink():
                raise ReleaseCoreError("piper-core-runtime-invalid")
            if not path.is_file():
                continue
            relative = path.relative_to(package_root).as_posix()
            if relative == RUNTIME_MANIFEST_NAME:
                continue
            resolved = path.resolve(strict=True)
            if not resolved.is_relative_to(canonical_root):
                raise ReleaseCoreError("piper-core-runtime-invalid")
            actual.add(relative)
        if actual != set(records):
            raise ReleaseCoreError("piper-core-runtime-invalid")
        for relative, (expected_size, expected_hash) in records.items():
            path = package_root.joinpath(*PurePosixPath(relative).parts)
            if path.stat().st_size != expected_size or sha256_file(path) != expected_hash:
                raise ReleaseCoreError("piper-core-runtime-invalid")
    except ReleaseCoreError:
        raise
    except OSError:
        raise ReleaseCoreError("piper-core-runtime-invalid") from None
