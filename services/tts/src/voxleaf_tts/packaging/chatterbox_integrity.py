"""Optional-package paths, identities and runtime-manifest integrity."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Final, Literal, cast

PACKAGE_DIRECTORY_NAME: Final = "voxleaf-chatterbox-v2"
RUNTIME_MANIFEST_NAME: Final = "runtime-manifest-v2.json"
SOURCE_MANIFEST_NAME: Final = "source-manifest-v2.json"
RUNTIME_ARCHIVE_NAME: Final = "voxleaf-chatterbox-runtime-v2.zip"
MAXIMUM_PART_BYTES: Final = 1_900_000_000
HASH_BLOCK_BYTES: Final = 8 * 1024 * 1024
PackageVersion = Literal["2", "3", "4", "5", "6"]


@dataclass(frozen=True, slots=True)
class PackageLayout:
    """Closed maintainer build identities; v2 remains the default."""

    version: PackageVersion = "2"

    def __post_init__(self) -> None:
        if self.version not in {"2", "3", "4", "5", "6"}:
            raise ReleaseChatterboxError("chatterbox-package-version-invalid")

    @property
    def directory(self) -> str:
        return f"voxleaf-chatterbox-v{self.version}"

    @property
    def source_manifest(self) -> str:
        return f"source-manifest-v{self.version}.json"

    @property
    def runtime_manifest(self) -> str:
        return f"runtime-manifest-v{self.version}.json"

    @property
    def archive(self) -> str:
        return f"voxleaf-chatterbox-runtime-v{self.version}.zip"

    @property
    def lock_path(self) -> str:
        profile = {
            "2": "chatterbox",
            "3": "chatterbox-v3",
            "4": "chatterbox-v3",
            "5": "chatterbox-v5",
            "6": "chatterbox-v6",
        }[self.version]
        return f"services/tts/release/profiles/{profile}/requirements.lock"

    def dist(self, root: Path, output_root: Path | None = None) -> Path:
        if output_root is not None:
            if not output_root.is_absolute():
                raise ReleaseChatterboxError("chatterbox-package-output-root-invalid")
            return output_root / f"v{self.version}"
        base = root / "services/tts/release/optional/chatterbox/dist"
        return base if self.version == "2" else base / f"v{self.version}"


class ReleaseChatterboxError(RuntimeError):
    """One content-free optional-package build or verification failure."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


PackageLayout.__module__ = "voxleaf_tts.release_chatterbox"
ReleaseChatterboxError.__module__ = "voxleaf_tts.release_chatterbox"


def repository_root() -> Path:
    return Path(__file__).resolve().parents[5]


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    try:
        with path.open("rb") as source:
            for block in iter(lambda: source.read(HASH_BLOCK_BYTES), b""):
                digest.update(block)
    except OSError:
        raise ReleaseChatterboxError("chatterbox-package-file-unavailable") from None
    return digest.hexdigest()


def safe_relative_path(value: str) -> PurePosixPath:
    path = PurePosixPath(value)
    if (
        path.is_absolute()
        or not path.parts
        or any(part in {"", ".", ".."} for part in path.parts)
        or "\\" in value
        or ":" in value
    ):
        raise ReleaseChatterboxError("chatterbox-package-invalid-path")
    return path


def _object(value: object, code: str) -> dict[str, object]:
    if not isinstance(value, dict) or not all(isinstance(key, str) for key in value):
        raise ReleaseChatterboxError(code)
    return cast(dict[str, object], value)


def _array(value: object, code: str) -> list[object]:
    if not isinstance(value, list):
        raise ReleaseChatterboxError(code)
    return cast(list[object], value)


def _text(value: object, code: str) -> str:
    if not isinstance(value, str) or not value:
        raise ReleaseChatterboxError(code)
    return value


def _positive(value: object, code: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
        raise ReleaseChatterboxError(code)
    return value


def _nonnegative(value: object, code: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or value < 0:
        raise ReleaseChatterboxError(code)
    return value


def _sha256(value: object, code: str) -> str:
    text = _text(value, code)
    if len(text) != 64 or any(character not in "0123456789abcdef" for character in text):
        raise ReleaseChatterboxError(code)
    return text


def _commit_sha(value: object, code: str) -> str:
    text = _text(value, code)
    if len(text) != 40 or any(character not in "0123456789abcdef" for character in text):
        raise ReleaseChatterboxError(code)
    return text


def _load_json(path: Path, code: str) -> dict[str, object]:
    try:
        return _object(json.loads(path.read_text(encoding="utf-8")), code)
    except (OSError, UnicodeError, json.JSONDecodeError):
        raise ReleaseChatterboxError(code) from None


def _artifact(value: object) -> dict[str, object]:
    artifact = _object(value, "chatterbox-package-source-manifest-invalid")
    if set(artifact) != {"filename", "sha256", "sizeBytes", "url"}:
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    safe_relative_path(_text(artifact["filename"], "chatterbox-package-source-manifest-invalid"))
    _sha256(artifact["sha256"], "chatterbox-package-source-manifest-invalid")
    _positive(artifact["sizeBytes"], "chatterbox-package-source-manifest-invalid")
    if not _text(artifact["url"], "chatterbox-package-source-manifest-invalid").startswith(
        "https://"
    ):
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    return artifact


def _file_record(root: Path, path: Path) -> dict[str, object]:
    relative = path.relative_to(root).as_posix()
    safe_relative_path(relative)
    return {"path": relative, "sha256": sha256_file(path), "sizeBytes": path.stat().st_size}


def build_runtime_manifest(
    package_root: Path, *, package_version: PackageVersion = "2"
) -> dict[str, object]:
    layout = PackageLayout(package_version)
    files = [
        _file_record(package_root, path)
        for path in sorted(package_root.rglob("*"), key=lambda item: item.as_posix())
        if path.is_file() and path.name != layout.runtime_manifest
    ]
    return {
        "schemaVersion": 2,
        "packageId": layout.directory,
        "packageVersion": layout.version,
        "profileId": "chatterbox-multilingual-v3-cuda-bf16-default-v4",
        "pythonPath": "runtime/python.exe",
        "sitePackagesPath": "runtime/Lib/site-packages",
        "modelRoot": "models",
        "serviceModule": "voxleaf_tts.chatterbox_service",
        "files": files,
    }


def render_manifest(manifest: Mapping[str, object]) -> bytes:
    return (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode("utf-8")


def verify_package_tree(
    root: Path, manifest: Mapping[str, object], *, package_version: PackageVersion = "2"
) -> None:
    layout = PackageLayout(package_version)
    files = _array(manifest.get("files"), "chatterbox-package-runtime-manifest-invalid")
    expected: dict[str, tuple[int, str]] = {}
    for raw_file in files:
        record = _object(raw_file, "chatterbox-package-runtime-manifest-invalid")
        if set(record) != {"path", "sha256", "sizeBytes"}:
            raise ReleaseChatterboxError("chatterbox-package-runtime-manifest-invalid")
        relative = _text(record["path"], "chatterbox-package-runtime-manifest-invalid")
        safe_relative_path(relative)
        if relative in expected or relative == layout.runtime_manifest:
            raise ReleaseChatterboxError("chatterbox-package-runtime-manifest-invalid")
        expected[relative] = (
            _nonnegative(record["sizeBytes"], "chatterbox-package-runtime-manifest-invalid"),
            _sha256(record["sha256"], "chatterbox-package-runtime-manifest-invalid"),
        )
    if not expected:
        raise ReleaseChatterboxError("chatterbox-package-runtime-manifest-invalid")
    actual: set[str] = set()
    try:
        canonical_root = root.resolve(strict=True)
        for path in root.rglob("*"):
            if path.is_symlink():
                raise ReleaseChatterboxError("chatterbox-package-runtime-invalid")
            if not path.is_file():
                continue
            if not path.resolve(strict=True).is_relative_to(canonical_root):
                raise ReleaseChatterboxError("chatterbox-package-runtime-invalid")
            relative = path.relative_to(root).as_posix()
            if relative != layout.runtime_manifest:
                actual.add(relative)
    except ReleaseChatterboxError:
        raise
    except OSError:
        raise ReleaseChatterboxError("chatterbox-package-runtime-invalid") from None
    if actual != set(expected):
        raise ReleaseChatterboxError("chatterbox-package-runtime-invalid")
    for relative, (size, digest) in expected.items():
        path = root.joinpath(*safe_relative_path(relative).parts)
        if not path.is_file() or path.stat().st_size != size or sha256_file(path) != digest:
            raise ReleaseChatterboxError("chatterbox-package-runtime-invalid")
