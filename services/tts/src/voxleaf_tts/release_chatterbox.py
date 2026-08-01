"""Build and verify the separately acquired optional Chatterbox runtime.

The builder is deliberately unavailable to normal reader execution. It creates
one reproducible archive only from a frozen lock and an explicitly supplied,
verified model source directory. The result is ignored by Git; a maintainer
must separately publish it and replace the checked-in `withheld` authority with
the measured HTTPS artifact identity.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import zipfile
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Final, cast
from urllib import request as urllib_request

PACKAGE_DIRECTORY_NAME: Final = "voxleaf-chatterbox-v1"
RUNTIME_MANIFEST_NAME: Final = "runtime-manifest-v1.json"
HASH_BLOCK_BYTES: Final = 8 * 1024 * 1024
DOWNLOAD_TIMEOUT_SECONDS: Final = 120
FIXED_ZIP_TIMESTAMP: Final = (1980, 1, 1, 0, 0, 0)
CHATTERBOX_SOURCE: Final = (
    "https://github.com/resemble-ai/chatterbox/tree/5de7a54aa4e5e2baadb0182dde554908b48b85c2"
)
MODEL_CARD_SOURCE: Final = (
    "https://huggingface.co/ResembleAI/chatterbox/tree/5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
)
PERTH_SOURCE: Final = (
    "https://github.com/resemble-ai/perth/tree/ce86c2b567491eef3108ed3c137bd7bf1ddda52e"
)


class ReleaseChatterboxError(RuntimeError):
    """One content-free optional-package build or verification failure."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


@dataclass(frozen=True, slots=True)
class PackageMeasurement:
    """Content-free measurements of one assembled optional package."""

    archive_sha256: str
    compressed_bytes: int
    installed_bytes: int
    file_count: int
    runtime_manifest_sha256: str


def repository_root() -> Path:
    return Path(__file__).resolve().parents[4]


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


def _sha256(value: object, code: str) -> str:
    text = _text(value, code)
    if len(text) != 64 or any(character not in "0123456789abcdef" for character in text):
        raise ReleaseChatterboxError(code)
    return text


def _load_json(path: Path, code: str) -> dict[str, object]:
    try:
        return _object(json.loads(path.read_text(encoding="utf-8")), code)
    except (OSError, UnicodeError, json.JSONDecodeError):
        raise ReleaseChatterboxError(code) from None


def load_source_manifest(root: Path | None = None) -> dict[str, object]:
    base = root or repository_root()
    manifest = _load_json(
        base / "services/tts/release/optional/chatterbox/source-manifest-v1.json",
        "chatterbox-package-source-manifest-invalid",
    )
    expected = {
        "schemaVersion",
        "packageId",
        "packageVersion",
        "platform",
        "profileId",
        "python",
        "chatterboxLock",
        "modelFiles",
        "runtimeModules",
        "provenance",
    }
    if set(manifest) != expected:
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    if (
        manifest["schemaVersion"] != 1
        or manifest["packageId"] != PACKAGE_DIRECTORY_NAME
        or manifest["packageVersion"] != "1"
        or manifest["platform"] != "windows-x86_64"
        or manifest["profileId"] != "chatterbox-multilingual-v3-cuda-bf16-default-v4"
    ):
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    python = _object(manifest["python"], "chatterbox-package-source-manifest-invalid")
    if set(python) != {"version", "artifact"} or python["version"] != "3.12.10":
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    _artifact(python["artifact"])
    lock = _object(manifest["chatterboxLock"], "chatterbox-package-source-manifest-invalid")
    if set(lock) != {"path", "sha256"}:
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    if lock["path"] != "services/tts/release/profiles/chatterbox/requirements.lock":
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    _sha256(lock["sha256"], "chatterbox-package-source-manifest-invalid")
    model_files = _array(manifest["modelFiles"], "chatterbox-package-source-manifest-invalid")
    expected_model_files = {
        "t3_mtl23ls_v3.safetensors",
        "s3gen.pt",
        "ve.pt",
        "conds.pt",
        "grapheme_mtl_merged_expanded_v1.json",
        "Cangjie5_TC.json",
    }
    if len(model_files) != len(expected_model_files):
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    names: set[str] = set()
    for raw_file in model_files:
        artifact = _object(raw_file, "chatterbox-package-source-manifest-invalid")
        if set(artifact) != {"filename", "sha256", "sizeBytes"}:
            raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
        filename = _text(artifact["filename"], "chatterbox-package-source-manifest-invalid")
        safe_relative_path(filename)
        names.add(filename)
        _sha256(artifact["sha256"], "chatterbox-package-source-manifest-invalid")
        _positive(artifact["sizeBytes"], "chatterbox-package-source-manifest-invalid")
    if names != expected_model_files:
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    provenance = _object(manifest["provenance"], "chatterbox-package-source-manifest-invalid")
    if provenance != {
        "chatterboxSource": CHATTERBOX_SOURCE,
        "modelCard": MODEL_CARD_SOURCE,
        "perthSource": PERTH_SOURCE,
    }:
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    modules = _array(manifest["runtimeModules"], "chatterbox-package-source-manifest-invalid")
    if not modules or any(not isinstance(module, str) for module in modules):
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    if len(set(cast(list[str], modules))) != len(modules):
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    return manifest


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


def _copy_file(source: Path, target: Path) -> None:
    try:
        if source.is_symlink() or not source.is_file():
            raise ReleaseChatterboxError("chatterbox-package-source-invalid")
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    except ReleaseChatterboxError:
        raise
    except OSError:
        raise ReleaseChatterboxError("chatterbox-package-staging-failed") from None


def _download_artifact(artifact: Mapping[str, object], cache: Path) -> Path:
    filename = _text(artifact["filename"], "chatterbox-package-source-manifest-invalid")
    expected_hash = _sha256(artifact["sha256"], "chatterbox-package-source-manifest-invalid")
    expected_size = _positive(artifact["sizeBytes"], "chatterbox-package-source-manifest-invalid")
    target = cache / filename
    if (
        target.is_file()
        and target.stat().st_size == expected_size
        and sha256_file(target) == expected_hash
    ):
        return target
    try:
        cache.mkdir(parents=True, exist_ok=True)
        partial = cache / f".{filename}.partial-{os.getpid()}"
        partial.unlink(missing_ok=True)
        request = urllib_request.Request(
            _text(artifact["url"], "chatterbox-package-source-manifest-invalid"),
            headers={"User-Agent": "VoxLeaf-optional-package-builder/1"},
        )
        with (
            urllib_request.urlopen(request, timeout=DOWNLOAD_TIMEOUT_SECONDS) as response,
            partial.open("wb") as output,
        ):
            remaining = expected_size
            while block := response.read(min(HASH_BLOCK_BYTES, remaining + 1)):
                output.write(block)
                remaining -= len(block)
                if remaining < 0:
                    raise ReleaseChatterboxError("chatterbox-package-download-invalid")
        if partial.stat().st_size != expected_size or sha256_file(partial) != expected_hash:
            raise ReleaseChatterboxError("chatterbox-package-download-invalid")
        partial.replace(target)
        return target
    except ReleaseChatterboxError:
        partial.unlink(missing_ok=True)
        raise
    except (OSError, TimeoutError):
        partial.unlink(missing_ok=True)
        raise ReleaseChatterboxError("chatterbox-package-download-failed") from None


def _extract_embedded_python(archive: Path, target: Path) -> None:
    try:
        with zipfile.ZipFile(archive) as source:
            for member in source.infolist():
                name = member.filename.rstrip("/")
                if not name:
                    continue
                relative = safe_relative_path(name)
                destination = target.joinpath(*relative.parts)
                if member.is_dir():
                    destination.mkdir(parents=True, exist_ok=True)
                    continue
                destination.parent.mkdir(parents=True, exist_ok=True)
                with source.open(member) as opened, destination.open("wb") as output:
                    shutil.copyfileobj(opened, output, HASH_BLOCK_BYTES)
    except ReleaseChatterboxError:
        raise
    except (OSError, zipfile.BadZipFile):
        raise ReleaseChatterboxError("chatterbox-package-python-invalid") from None


def _copy_tree(source: Path, target: Path) -> None:
    if not source.is_dir():
        raise ReleaseChatterboxError("chatterbox-package-runtime-unavailable")
    try:
        for path in sorted(source.rglob("*"), key=lambda item: item.as_posix()):
            relative = path.relative_to(source)
            if "__pycache__" in relative.parts or path.suffix == ".pyc" or path.is_symlink():
                if path.is_symlink():
                    raise ReleaseChatterboxError("chatterbox-package-runtime-invalid")
                continue
            destination = target / relative
            if path.is_dir():
                destination.mkdir(parents=True, exist_ok=True)
            elif path.is_file():
                _copy_file(path, destination)
    except ReleaseChatterboxError:
        raise
    except OSError:
        raise ReleaseChatterboxError("chatterbox-package-staging-failed") from None


def _copy_runtime_modules(root: Path, staging: Path, manifest: Mapping[str, object]) -> None:
    source = root / "services/tts/src/voxleaf_tts"
    target = staging / "runtime/Lib/site-packages/voxleaf_tts"
    for module in cast(
        list[str], _array(manifest["runtimeModules"], "chatterbox-package-source-manifest-invalid")
    ):
        _copy_file(source / module, target / module)


def _copy_model(model_root: Path, staging: Path, manifest: Mapping[str, object]) -> None:
    target = staging / "models"
    for raw_file in _array(manifest["modelFiles"], "chatterbox-package-source-manifest-invalid"):
        artifact = _object(raw_file, "chatterbox-package-source-manifest-invalid")
        filename = _text(artifact["filename"], "chatterbox-package-source-manifest-invalid")
        source = model_root / filename
        if (
            source.is_symlink()
            or not source.is_file()
            or source.stat().st_size
            != _positive(artifact["sizeBytes"], "chatterbox-package-source-manifest-invalid")
            or sha256_file(source)
            != _sha256(artifact["sha256"], "chatterbox-package-source-manifest-invalid")
        ):
            raise ReleaseChatterboxError("chatterbox-package-model-invalid")
        _copy_file(source, target / filename)


def _copy_notices(
    root: Path, staging: Path, environment: Path, manifest: Mapping[str, object]
) -> None:
    notices = staging / "notices"
    _copy_file(root / "LICENSE", notices / "VOXLEAF-MIT.txt")
    _copy_file(
        root / "services/tts/release/optional/chatterbox/THIRD-PARTY-NOTICES.md",
        notices / "THIRD-PARTY-NOTICES.md",
    )
    _copy_file(
        root / "services/tts/release/optional/chatterbox/source-manifest-v1.json",
        staging / "source-manifest-v1.json",
    )
    lock = _object(manifest["chatterboxLock"], "chatterbox-package-source-manifest-invalid")
    lock_source = root.joinpath(
        *safe_relative_path(_text(lock["path"], "chatterbox-package-source-manifest-invalid")).parts
    )
    _copy_file(lock_source, notices / "requirements.lock")
    for distribution in sorted(environment.glob("*.dist-info"), key=lambda item: item.name):
        licences = distribution / "licenses"
        if licences.is_dir():
            _copy_tree(licences, notices / "python" / distribution.name / "licenses")
        for candidate in (distribution / "LICENSE", distribution / "COPYING"):
            if candidate.is_file():
                _copy_file(candidate, notices / "python" / distribution.name / candidate.name)


def _file_record(root: Path, path: Path) -> dict[str, object]:
    relative = path.relative_to(root).as_posix()
    safe_relative_path(relative)
    return {"path": relative, "sha256": sha256_file(path), "sizeBytes": path.stat().st_size}


def build_runtime_manifest(package_root: Path) -> dict[str, object]:
    files = [
        _file_record(package_root, path)
        for path in sorted(package_root.rglob("*"), key=lambda item: item.as_posix())
        if path.is_file() and path.name != RUNTIME_MANIFEST_NAME
    ]
    return {
        "schemaVersion": 1,
        "packageId": PACKAGE_DIRECTORY_NAME,
        "packageVersion": "1",
        "profileId": "chatterbox-multilingual-v3-cuda-bf16-default-v4",
        "pythonPath": "runtime/python.exe",
        "sitePackagesPath": "runtime/Lib/site-packages",
        "modelRoot": "models",
        "serviceModule": "voxleaf_tts.chatterbox_service",
        "files": files,
    }


def render_manifest(manifest: Mapping[str, object]) -> bytes:
    return (json.dumps(manifest, indent=2, sort_keys=True) + "\n").encode("utf-8")


def verify_package_tree(root: Path, manifest: Mapping[str, object]) -> None:
    files = _array(manifest.get("files"), "chatterbox-package-runtime-manifest-invalid")
    expected: dict[str, tuple[int, str]] = {}
    for raw_file in files:
        record = _object(raw_file, "chatterbox-package-runtime-manifest-invalid")
        if set(record) != {"path", "sha256", "sizeBytes"}:
            raise ReleaseChatterboxError("chatterbox-package-runtime-manifest-invalid")
        relative = _text(record["path"], "chatterbox-package-runtime-manifest-invalid")
        safe_relative_path(relative)
        if relative in expected or relative == RUNTIME_MANIFEST_NAME:
            raise ReleaseChatterboxError("chatterbox-package-runtime-manifest-invalid")
        expected[relative] = (
            _positive(record["sizeBytes"], "chatterbox-package-runtime-manifest-invalid"),
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
            if relative != RUNTIME_MANIFEST_NAME:
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


def _zip_package(source: Path, archive: Path) -> None:
    temporary = archive.with_suffix(".partial")
    temporary.unlink(missing_ok=True)
    try:
        with zipfile.ZipFile(
            temporary, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9
        ) as output:
            for path in sorted(source.rglob("*"), key=lambda item: item.as_posix()):
                if not path.is_file() or path.is_symlink():
                    continue
                relative = path.relative_to(source).as_posix()
                safe_relative_path(relative)
                info = zipfile.ZipInfo(f"{PACKAGE_DIRECTORY_NAME}/{relative}", FIXED_ZIP_TIMESTAMP)
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                output.writestr(
                    info, path.read_bytes(), compress_type=zipfile.ZIP_DEFLATED, compresslevel=9
                )
        temporary.replace(archive)
    except (OSError, zipfile.BadZipFile):
        temporary.unlink(missing_ok=True)
        raise ReleaseChatterboxError("chatterbox-package-archive-failed") from None


def _synchronise_environment(root: Path, environment: Path) -> None:
    lock = root / "services/tts/release/profiles/chatterbox/requirements.lock"
    try:
        subprocess.run(["uv", "venv", "--python", "3.12", str(environment)], check=True, cwd=root)
        subprocess.run(
            ["uv", "pip", "sync", "--python", str(environment / "Scripts/python.exe"), str(lock)],
            check=True,
            cwd=root,
        )
    except (OSError, subprocess.CalledProcessError):
        raise ReleaseChatterboxError("chatterbox-package-environment-sync-failed") from None


def build_package(model_root: Path, *, synchronise: bool = True) -> PackageMeasurement:
    root = repository_root()
    source = load_source_manifest(root)
    lock = _object(source["chatterboxLock"], "chatterbox-package-source-manifest-invalid")
    lock_path = root.joinpath(
        *safe_relative_path(_text(lock["path"], "chatterbox-package-source-manifest-invalid")).parts
    )
    if sha256_file(lock_path) != _sha256(
        lock["sha256"], "chatterbox-package-source-manifest-invalid"
    ):
        raise ReleaseChatterboxError("chatterbox-package-lock-invalid")
    if not model_root.is_absolute() or not model_root.is_dir() or model_root.is_symlink():
        raise ReleaseChatterboxError("chatterbox-package-model-root-invalid")
    dist = root / "services/tts/release/optional/chatterbox/dist"
    dist.mkdir(parents=True, exist_ok=True)
    environment = dist / "environment"
    if synchronise:
        _synchronise_environment(root, environment)
    site_packages = environment / "Lib/site-packages"
    cache = dist / "downloads"
    artifact = _artifact(
        _object(source["python"], "chatterbox-package-source-manifest-invalid")["artifact"]
    )
    python_archive = _download_artifact(artifact, cache)
    with tempfile.TemporaryDirectory(
        prefix="voxleaf-chatterbox-package-", dir=dist
    ) as temporary_name:
        staging = Path(temporary_name) / PACKAGE_DIRECTORY_NAME
        staging.mkdir(parents=True)
        _extract_embedded_python(python_archive, staging / "runtime")
        _copy_tree(site_packages, staging / "runtime/Lib/site-packages")
        _copy_runtime_modules(root, staging, source)
        _copy_model(model_root, staging, source)
        _copy_notices(root, staging, site_packages, source)
        rendered = render_manifest(build_runtime_manifest(staging))
        (staging / RUNTIME_MANIFEST_NAME).write_bytes(rendered)
        verify_package_tree(staging, json.loads(rendered))
        target = dist / PACKAGE_DIRECTORY_NAME
        previous = dist / f".{PACKAGE_DIRECTORY_NAME}.previous"
        if previous.exists():
            shutil.rmtree(previous)
        if target.exists():
            target.replace(previous)
        staging.replace(target)
        shutil.rmtree(previous, ignore_errors=True)
    archive = dist / f"{PACKAGE_DIRECTORY_NAME}.zip"
    _zip_package(target, archive)
    installed_files = [path for path in target.rglob("*") if path.is_file()]
    runtime_manifest = target / RUNTIME_MANIFEST_NAME
    return PackageMeasurement(
        archive_sha256=sha256_file(archive),
        compressed_bytes=archive.stat().st_size,
        installed_bytes=sum(path.stat().st_size for path in installed_files),
        file_count=len(installed_files),
        runtime_manifest_sha256=sha256_file(runtime_manifest),
    )


def measurement_json(measurement: PackageMeasurement) -> str:
    return json.dumps(
        {
            "archiveSha256": measurement.archive_sha256,
            "compressedBytes": measurement.compressed_bytes,
            "fileCount": measurement.file_count,
            "installedBytes": measurement.installed_bytes,
            "runtimeManifestSha256": measurement.runtime_manifest_sha256,
        },
        sort_keys=True,
    )


def main(arguments: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("build", "check-source"))
    parser.add_argument("--model-root", type=Path)
    parser.add_argument("--no-sync", action="store_true")
    args = parser.parse_args(sys.argv[1:] if arguments is None else arguments)
    if args.command == "check-source":
        load_source_manifest()
        print("chatterbox-optional-source:current")
        return 0
    if args.model_root is None:
        raise ReleaseChatterboxError("chatterbox-package-model-root-required")
    print(measurement_json(build_package(args.model_root, synchronise=not args.no_sync)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
