"""Build and verify the separately acquired optional Chatterbox runtime.

The builder is deliberately unavailable to normal reader execution. It creates
one reproducible runtime-only archive from the frozen lock, divides that archive
into bounded release assets, and never copies model weights. The result is
ignored by Git; a maintainer must separately publish it and replace the
checked-in `withheld` authority with the measured HTTPS artifact identities.
"""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
import shutil
import subprocess
import sys
import zipfile
from collections.abc import Mapping
from contextlib import suppress
from dataclasses import dataclass
from pathlib import Path
from typing import Final, cast
from urllib import request as urllib_request

from .packaging import chatterbox_v6_authority, chatterbox_v7_authority
from .packaging.chatterbox_authority import CHATTERBOX_SOURCE as CHATTERBOX_SOURCE
from .packaging.chatterbox_authority import CURRENT_DOWNLOAD_BYTES as CURRENT_DOWNLOAD_BYTES
from .packaging.chatterbox_authority import CURRENT_INSTALLED_BYTES as CURRENT_INSTALLED_BYTES
from .packaging.chatterbox_authority import CURRENT_MINIMUM_FREE_BYTES as CURRENT_MINIMUM_FREE_BYTES
from .packaging.chatterbox_authority import CURRENT_TEMPORARY_BYTES as CURRENT_TEMPORARY_BYTES
from .packaging.chatterbox_authority import HISTORICAL_INSTALLED_BYTES as HISTORICAL_INSTALLED_BYTES
from .packaging.chatterbox_authority import INSTALLED_BYTES_CORRECTION as INSTALLED_BYTES_CORRECTION
from .packaging.chatterbox_authority import MODEL_CARD_SOURCE as MODEL_CARD_SOURCE
from .packaging.chatterbox_authority import PERTH_SOURCE as PERTH_SOURCE
from .packaging.chatterbox_authority import (
    REPRESENTATIVE_COLD_START_ROUNDED_SECONDS as REPRESENTATIVE_COLD_START_ROUNDED_SECONDS,
)
from .packaging.chatterbox_authority import SUCCESSOR_ARCHIVE_SHA256 as SUCCESSOR_ARCHIVE_SHA256
from .packaging.chatterbox_authority import SUCCESSOR_BUILD_COMMIT as SUCCESSOR_BUILD_COMMIT
from .packaging.chatterbox_authority import SUCCESSOR_PARTS as SUCCESSOR_PARTS
from .packaging.chatterbox_authority import SUCCESSOR_RUNTIME_SHA256 as SUCCESSOR_RUNTIME_SHA256
from .packaging.chatterbox_authority import _current_runtime_evidence as _current_runtime_evidence
from .packaging.chatterbox_authority import check_successor_authority as check_successor_authority
from .packaging.chatterbox_authority import load_acquisition_manifest as load_acquisition_manifest
from .packaging.chatterbox_authority import (
    load_current_runtime_evidence as load_current_runtime_evidence,
)
from .packaging.chatterbox_authority import load_runtime_evidence as load_runtime_evidence
from .packaging.chatterbox_authority import load_source_manifest as load_source_manifest
from .packaging.chatterbox_authority import reconcile_runtime_evidence as reconcile_runtime_evidence
from .packaging.chatterbox_authority import (
    render_current_runtime_evidence as render_current_runtime_evidence,
)
from .packaging.chatterbox_authority import render_successor_authority as render_successor_authority
from .packaging.chatterbox_authority import (
    successor_acquisition_manifest as successor_acquisition_manifest,
)
from .packaging.chatterbox_authority import successor_runtime_evidence as successor_runtime_evidence
from .packaging.chatterbox_authority import successor_source_manifest as successor_source_manifest
from .packaging.chatterbox_authority import (
    write_local_source_manifest,
    write_security_source_manifest,
)
from .packaging.chatterbox_authority import write_successor_authority as write_successor_authority
from .packaging.chatterbox_authority import (
    write_successor_source_manifest as write_successor_source_manifest,
)
from .packaging.chatterbox_integrity import HASH_BLOCK_BYTES as HASH_BLOCK_BYTES
from .packaging.chatterbox_integrity import MAXIMUM_PART_BYTES as MAXIMUM_PART_BYTES
from .packaging.chatterbox_integrity import PACKAGE_DIRECTORY_NAME as PACKAGE_DIRECTORY_NAME
from .packaging.chatterbox_integrity import RUNTIME_ARCHIVE_NAME as RUNTIME_ARCHIVE_NAME
from .packaging.chatterbox_integrity import RUNTIME_MANIFEST_NAME as RUNTIME_MANIFEST_NAME
from .packaging.chatterbox_integrity import SOURCE_MANIFEST_NAME as SOURCE_MANIFEST_NAME
from .packaging.chatterbox_integrity import PackageLayout as PackageLayout
from .packaging.chatterbox_integrity import PackageVersion as PackageVersion
from .packaging.chatterbox_integrity import ReleaseChatterboxError as ReleaseChatterboxError
from .packaging.chatterbox_integrity import _array as _array
from .packaging.chatterbox_integrity import _artifact as _artifact
from .packaging.chatterbox_integrity import _commit_sha as _commit_sha
from .packaging.chatterbox_integrity import _file_record as _file_record
from .packaging.chatterbox_integrity import _load_json as _load_json
from .packaging.chatterbox_integrity import _nonnegative as _nonnegative
from .packaging.chatterbox_integrity import _object as _object
from .packaging.chatterbox_integrity import _positive as _positive
from .packaging.chatterbox_integrity import _sha256 as _sha256
from .packaging.chatterbox_integrity import _text as _text
from .packaging.chatterbox_integrity import build_runtime_manifest as build_runtime_manifest
from .packaging.chatterbox_integrity import render_manifest as render_manifest
from .packaging.chatterbox_integrity import repository_root as repository_root
from .packaging.chatterbox_integrity import safe_relative_path as safe_relative_path
from .packaging.chatterbox_integrity import sha256_file as sha256_file
from .packaging.chatterbox_integrity import verify_package_tree as verify_package_tree
from .packaging.chatterbox_security_authority import (
    check_security_authority,
    write_security_authority,
)
from .packaging.chatterbox_sources import resolve_runtime_sources

DOWNLOAD_TIMEOUT_SECONDS: Final = 120
FIXED_ZIP_TIMESTAMP: Final = (1980, 1, 1, 0, 0, 0)

# The 0.23.1 wheel omits its Apache-2.0 text. This immutable upstream blob
# (261eeb9e9f8b2b4b0d119366dda99c6fd7d35c64) supplies that text for v3 only.
TOKENIZERS_LICENSE_SOURCE: Final = (
    "https://raw.githubusercontent.com/huggingface/tokenizers/"
    "7f1623b90b5adfb9bc327d4c3468d2f70bbce262/LICENSE"
)
TOKENIZERS_LICENSE_PATH: Final = (
    "services/tts/release/optional/chatterbox/licenses/tokenizers-0.23.1-LICENSE.txt"
)
TOKENIZERS_LICENSE_SHA256: Final = (
    "c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4"
)


@dataclass(frozen=True, slots=True)
class PackageMeasurement:
    """Content-free measurements of one assembled optional package."""

    archive_sha256: str
    compressed_bytes: int
    installed_bytes: int
    file_count: int
    runtime_manifest_sha256: str
    parts: tuple[ArchivePartMeasurement, ...]


@dataclass(frozen=True, slots=True)
class ArchivePartMeasurement:
    """One bounded consecutive runtime release asset."""

    filename: str
    sha256: str
    size_bytes: int


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
    partial = cache / f".{filename}.partial-{os.getpid()}"
    if (
        target.is_file()
        and target.stat().st_size == expected_size
        and sha256_file(target) == expected_hash
    ):
        return target
    try:
        cache.mkdir(parents=True, exist_ok=True)
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
        with suppress(OSError):
            partial.unlink(missing_ok=True)
        raise
    except (OSError, TimeoutError):
        with suppress(OSError):
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


def _configure_embedded_python(runtime: Path) -> None:
    pth = runtime / "python312._pth"
    if not pth.is_file():
        raise ReleaseChatterboxError("chatterbox-package-python-invalid")
    try:
        pth.write_text(
            "python312.zip\n.\nLib\\site-packages\nimport site\n",
            encoding="utf-8",
            newline="\n",
        )
    except OSError:
        raise ReleaseChatterboxError("chatterbox-package-python-invalid") from None


def _copy_tree(source: Path, target: Path, *, runtime_only: bool = False) -> None:
    if not source.is_dir():
        raise ReleaseChatterboxError("chatterbox-package-runtime-unavailable")
    try:
        for path in sorted(source.rglob("*"), key=lambda item: item.as_posix()):
            relative = path.relative_to(source)
            excluded_runtime_path = runtime_only and (
                any(part.lower() in {"test", "tests"} for part in relative.parts)
                or relative.parts[:2] == ("torch", "include")
            )
            if (
                "__pycache__" in relative.parts
                or path.suffix == ".pyc"
                or excluded_runtime_path
                or path.is_symlink()
            ):
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


def _copy_runtime_modules(
    root: Path,
    staging: Path,
    manifest: Mapping[str, object],
    *,
    sources: Mapping[str, bytes] | None = None,
) -> None:
    resolved = resolve_runtime_sources(root, manifest) if sources is None else sources
    target = staging / "runtime/Lib/site-packages/voxleaf_tts"
    try:
        for module in cast(
            list[str],
            _array(manifest["runtimeModules"], "chatterbox-package-source-manifest-invalid"),
        ):
            destination = target / module
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(resolved[module])
    except OSError:
        raise ReleaseChatterboxError("chatterbox-package-staging-failed") from None


def verify_safe_model_load_sites(site_packages: Path) -> None:
    """Reject a runtime whose approved multilingual loader can unpickle freely."""

    source = site_packages / "chatterbox/mtl_tts.py"
    try:
        tree = ast.parse(source.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, SyntaxError):
        raise ReleaseChatterboxError("chatterbox-package-safe-loader-invalid") from None
    torch_loads = 0
    safe_tensor_loads = 0
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        if (
            isinstance(node.func, ast.Attribute)
            and isinstance(node.func.value, ast.Name)
            and node.func.value.id == "torch"
            and node.func.attr == "load"
        ):
            torch_loads += 1
            weights_only = next(
                (keyword.value for keyword in node.keywords if keyword.arg == "weights_only"),
                None,
            )
            if not isinstance(weights_only, ast.Constant) or weights_only.value is not True:
                raise ReleaseChatterboxError("chatterbox-package-safe-loader-invalid")
        if isinstance(node.func, ast.Name) and node.func.id == "load_safetensors":
            safe_tensor_loads += 1
    if torch_loads < 3 or safe_tensor_loads < 1:
        raise ReleaseChatterboxError("chatterbox-package-safe-loader-invalid")


def _copy_notices(
    root: Path,
    staging: Path,
    environment: Path,
    manifest: Mapping[str, object],
    *,
    package_version: PackageVersion = "2",
) -> None:
    layout = PackageLayout(package_version)
    notices = staging / "notices"
    if package_version in {"3", "4", "5", "6", "7"}:
        _copy_successor_license(root, notices, environment)
    _copy_file(root / "LICENSE", notices / "VOXLEAF-MIT.txt")
    _copy_file(
        root / "services/tts/release/optional/chatterbox/THIRD-PARTY-NOTICES.md",
        notices / "THIRD-PARTY-NOTICES.md",
    )
    _copy_file(
        root / f"services/tts/release/optional/chatterbox/{layout.source_manifest}",
        staging / layout.source_manifest,
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


def _copy_successor_license(root: Path, notices: Path, environment: Path) -> None:
    """Require the exact missing upstream licence for the exact successor wheel."""

    source = root / TOKENIZERS_LICENSE_PATH
    if (
        not (environment / "tokenizers-0.23.1.dist-info").is_dir()
        or not source.is_file()
        or source.stat().st_size != 11_357
        or sha256_file(source) != TOKENIZERS_LICENSE_SHA256
    ):
        raise ReleaseChatterboxError("chatterbox-package-tokenizers-license-invalid")
    _copy_file(source, notices / "python/tokenizers-0.23.1/LICENSE")


def _zip_package(source: Path, archive: Path, *, package_version: PackageVersion = "2") -> None:
    layout = PackageLayout(package_version)
    temporary = archive.with_suffix(".partial")
    temporary.unlink(missing_ok=True)
    try:
        with zipfile.ZipFile(
            temporary, "w", compression=zipfile.ZIP_STORED, allowZip64=True
        ) as output:
            for path in sorted(source.rglob("*"), key=lambda item: item.as_posix()):
                if not path.is_file() or path.is_symlink():
                    continue
                relative = path.relative_to(source).as_posix()
                safe_relative_path(relative)
                info = zipfile.ZipInfo(f"{layout.directory}/{relative}", FIXED_ZIP_TIMESTAMP)
                info.compress_type = zipfile.ZIP_STORED
                info.external_attr = 0o100644 << 16
                with path.open("rb") as opened, output.open(info, "w", force_zip64=True) as target:
                    shutil.copyfileobj(opened, target, HASH_BLOCK_BYTES)
        temporary.replace(archive)
    except (OSError, zipfile.BadZipFile):
        temporary.unlink(missing_ok=True)
        raise ReleaseChatterboxError("chatterbox-package-archive-failed") from None


def split_archive(
    archive: Path, *, maximum_part_bytes: int = MAXIMUM_PART_BYTES
) -> tuple[ArchivePartMeasurement, ...]:
    """Split one deterministic archive into bounded, ordered release assets."""

    if maximum_part_bytes <= 0:
        raise ReleaseChatterboxError("chatterbox-package-part-limit-invalid")
    for stale in archive.parent.glob(f"{archive.name}.part-*"):
        stale.unlink(missing_ok=True)
    parts: list[ArchivePartMeasurement] = []
    try:
        with archive.open("rb") as source:
            index = 1
            while True:
                first = source.read(1)
                if not first:
                    break
                filename = f"{archive.name}.part-{index:03d}"
                path = archive.parent / filename
                digest = hashlib.sha256()
                written = 0
                with path.open("wb") as output:
                    block = first
                    while block and written < maximum_part_bytes:
                        remaining = maximum_part_bytes - written
                        if len(block) > remaining:
                            raise ReleaseChatterboxError("chatterbox-package-archive-failed")
                        output.write(block)
                        digest.update(block)
                        written += len(block)
                        block = source.read(min(HASH_BLOCK_BYTES, maximum_part_bytes - written))
                parts.append(ArchivePartMeasurement(filename, digest.hexdigest(), written))
                index += 1
    except ReleaseChatterboxError:
        raise
    except OSError:
        raise ReleaseChatterboxError("chatterbox-package-archive-failed") from None
    if not parts or len(parts) > 4:
        raise ReleaseChatterboxError("chatterbox-package-runtime-too-large")
    return tuple(parts)


def _synchronise_environment(
    root: Path, environment: Path, *, package_version: PackageVersion = "2"
) -> None:
    lock = root / PackageLayout(package_version).lock_path
    sync_command = [
        "uv",
        "pip",
        "sync",
        "--python",
        str(environment / "Scripts/python.exe"),
        str(lock),
    ]
    if package_version in {"3", "4", "5", "6", "7"}:
        sync_command.append("--require-hashes")
    try:
        subprocess.run(["uv", "venv", "--python", "3.12", str(environment)], check=True, cwd=root)
        subprocess.run(
            sync_command,
            check=True,
            cwd=root,
        )
    except (OSError, subprocess.CalledProcessError):
        raise ReleaseChatterboxError("chatterbox-package-environment-sync-failed") from None


def build_package(
    *,
    synchronise: bool = True,
    package_version: PackageVersion = "2",
    output_root: Path | None = None,
) -> PackageMeasurement:
    if package_version in {"5", "6", "7"} and not synchronise:
        raise ReleaseChatterboxError("chatterbox-package-security-sync-required")
    root = repository_root()
    layout = PackageLayout(package_version)
    source = load_source_manifest(root, package_version=package_version)
    lock = _object(source["chatterboxLock"], "chatterbox-package-source-manifest-invalid")
    lock_path = root.joinpath(
        *safe_relative_path(_text(lock["path"], "chatterbox-package-source-manifest-invalid")).parts
    )
    if sha256_file(lock_path) != _sha256(
        lock["sha256"], "chatterbox-package-source-manifest-invalid"
    ):
        raise ReleaseChatterboxError("chatterbox-package-lock-invalid")
    # Resolve the complete source closure before sync, download or output mutation.
    sources = resolve_runtime_sources(root, source)
    dist = layout.dist(root, output_root)
    dist.mkdir(parents=True, exist_ok=True)
    environment = dist / "environment"
    if synchronise:
        _synchronise_environment(root, environment, package_version=package_version)
    site_packages = environment / "Lib/site-packages"
    verify_safe_model_load_sites(site_packages)
    cache = dist / "downloads"
    artifact = _artifact(
        _object(source["python"], "chatterbox-package-source-manifest-invalid")["artifact"]
    )
    python_archive = _download_artifact(artifact, cache)
    # Keep the maintainer-only Windows staging prefix short enough for locked
    # dependencies that still contain long import paths.
    staging_parent = dist / ".s"
    if staging_parent.exists():
        shutil.rmtree(staging_parent)
    try:
        staging = staging_parent / layout.directory
        staging.mkdir(parents=True)
        _extract_embedded_python(python_archive, staging / "runtime")
        _configure_embedded_python(staging / "runtime")
        _copy_tree(site_packages, staging / "runtime/Lib/site-packages", runtime_only=True)
        _copy_runtime_modules(root, staging, source, sources=sources)
        _copy_notices(root, staging, site_packages, source, package_version=package_version)
        rendered = render_manifest(build_runtime_manifest(staging, package_version=package_version))
        (staging / layout.runtime_manifest).write_bytes(rendered)
        verify_package_tree(staging, json.loads(rendered), package_version=package_version)
        target = dist / layout.directory
        previous = dist / f".{layout.directory}.previous"
        # A failed rollback leaves the only previous package here. Recover it
        # before treating a backup as disposable, including on a later build.
        if previous.exists() and not target.exists():
            previous.replace(target)
        if previous.exists():
            shutil.rmtree(previous)
        if target.exists():
            target.replace(previous)
        try:
            staging.replace(target)
        except OSError as error:
            if previous.exists():
                try:
                    previous.replace(target)
                except OSError:
                    error.add_note(
                        "Previous package retained in the promotion backup; recovery failed."
                    )
            raise
        shutil.rmtree(previous, ignore_errors=True)
    finally:
        shutil.rmtree(staging_parent, ignore_errors=True)
    archive = dist / layout.archive
    _zip_package(target, archive, package_version=package_version)
    parts = split_archive(archive)
    installed_files = [path for path in target.rglob("*") if path.is_file()]
    runtime_manifest = target / layout.runtime_manifest
    measurement = PackageMeasurement(
        archive_sha256=sha256_file(archive),
        compressed_bytes=archive.stat().st_size,
        installed_bytes=sum(path.stat().st_size for path in installed_files),
        file_count=len(installed_files),
        runtime_manifest_sha256=sha256_file(runtime_manifest),
        parts=parts,
    )
    if package_version in {"4", "5", "6", "7"}:
        (dist / f"local-build-evidence-v{package_version}.json").write_bytes(
            render_manifest(
                _local_package_receipt(
                    root, package_version=package_version, output_root=output_root
                )
            )
        )
    return measurement


def _verify_local_archive_parts(
    dist: Path,
    archive: Path,
    layout: PackageLayout,
    archive_hash: str,
) -> tuple[list[dict[str, object]], int]:
    parts = sorted(dist.glob(f"{layout.archive}.part-*"))
    combined = hashlib.sha256()
    part_records: list[dict[str, object]] = []
    total_bytes = 0
    if not 1 <= len(parts) <= 4:
        raise ReleaseChatterboxError("chatterbox-package-archive-failed")
    for index, part in enumerate(parts, start=1):
        size = part.stat().st_size
        if part.name != f"{layout.archive}.part-{index:03}" or not 0 < size <= MAXIMUM_PART_BYTES:
            raise ReleaseChatterboxError("chatterbox-package-archive-failed")
        with part.open("rb") as opened:
            for block in iter(lambda: opened.read(HASH_BLOCK_BYTES), b""):
                combined.update(block)
        total_bytes += size
        part_records.append({"filename": part.name, "sha256": sha256_file(part), "sizeBytes": size})
    if combined.hexdigest() != archive_hash or total_bytes != archive.stat().st_size:
        raise ReleaseChatterboxError("chatterbox-package-archive-failed")
    return part_records, total_bytes


def _verify_local_archive_members(
    target: Path,
    archive: Path,
    layout: PackageLayout,
) -> dict[str, Path]:
    files = {
        path.relative_to(target).as_posix(): path for path in target.rglob("*") if path.is_file()
    }
    with zipfile.ZipFile(archive) as opened:
        expected_names = {f"{layout.directory}/{relative}" for relative in files}
        if set(opened.namelist()) != expected_names or len(opened.namelist()) != len(files):
            raise ReleaseChatterboxError("chatterbox-package-archive-failed")
        for relative, path in files.items():
            digest = hashlib.sha256()
            size = 0
            with opened.open(f"{layout.directory}/{relative}") as member:
                for block in iter(lambda: member.read(HASH_BLOCK_BYTES), b""):
                    digest.update(block)
                    size += len(block)
            if size != path.stat().st_size or digest.hexdigest() != sha256_file(path):
                raise ReleaseChatterboxError("chatterbox-package-archive-failed")
    return files


def _local_package_receipt(
    root: Path, *, package_version: PackageVersion = "4", output_root: Path | None = None
) -> dict[str, object]:
    """Measure local versioned outputs without publication/execution claims."""

    if package_version not in {"4", "5", "6", "7"}:
        raise ReleaseChatterboxError("chatterbox-package-version-invalid")
    layout = PackageLayout(package_version)
    dist = layout.dist(root, output_root)
    target = dist / layout.directory
    source = load_source_manifest(root, package_version=package_version)
    sources = resolve_runtime_sources(root, source)
    runtime = _load_json(target / layout.runtime_manifest, "chatterbox-package-runtime-invalid")
    expected_runtime = build_runtime_manifest(target, package_version=package_version)
    if runtime != expected_runtime or (target / layout.runtime_manifest).read_bytes() != (
        render_manifest(expected_runtime)
    ):
        raise ReleaseChatterboxError("chatterbox-package-runtime-invalid")
    verify_package_tree(target, runtime, package_version=package_version)
    module_root = target / "runtime/Lib/site-packages/voxleaf_tts"
    if {
        path.relative_to(module_root).as_posix()
        for path in module_root.rglob("*")
        if path.is_file()
    } != set(sources):
        raise ReleaseChatterboxError("chatterbox-package-runtime-invalid")
    for module, payload in sources.items():
        if (module_root / module).read_bytes() != payload:
            raise ReleaseChatterboxError("chatterbox-package-source-invalid")
    recipe = root / f"services/tts/release/optional/chatterbox/{layout.source_manifest}"
    if (target / layout.source_manifest).read_bytes() != recipe.read_bytes():
        raise ReleaseChatterboxError("chatterbox-package-source-invalid")
    lock = root / layout.lock_path
    if (target / "notices/requirements.lock").read_bytes() != lock.read_bytes():
        raise ReleaseChatterboxError("chatterbox-package-lock-invalid")
    licence = target / "notices/python/tokenizers-0.23.1/LICENSE"
    if licence.stat().st_size != 11_357 or sha256_file(licence) != TOKENIZERS_LICENSE_SHA256:
        raise ReleaseChatterboxError("chatterbox-package-tokenizers-license-invalid")
    verify_safe_model_load_sites(target / "runtime/Lib/site-packages")
    archive = dist / layout.archive
    archive_hash = sha256_file(archive)
    part_records, total_bytes = _verify_local_archive_parts(dist, archive, layout, archive_hash)
    files = _verify_local_archive_members(target, archive, layout)
    return {
        "schemaVersion": 1,
        "packageId": layout.directory,
        "packageVersion": package_version,
        "distribution": {"published": False, "admitted": False},
        "authority": {
            "sourceManifestSha256": sha256_file(recipe),
            "dependencyLockSha256": sha256_file(lock),
        },
        "sources": [
            {
                "path": module,
                "sizeBytes": len(payload),
                "sha256": hashlib.sha256(payload).hexdigest(),
            }
            for module, payload in sources.items()
        ],
        "measurements": {
            "archiveSha256": archive_hash,
            "compressedBytes": total_bytes,
            "installedBytes": sum(path.stat().st_size for path in files.values()),
            "fileCount": len(files),
            "runtimeManifestSha256": sha256_file(target / layout.runtime_manifest),
        },
        "parts": part_records,
    }


def check_local_package(
    root: Path | None = None,
    *,
    package_version: PackageVersion = "4",
    output_root: Path | None = None,
) -> None:
    base = root or repository_root()
    receipt = (
        PackageLayout(package_version).dist(base, output_root)
        / f"local-build-evidence-v{package_version}.json"
    )
    try:
        if receipt.read_bytes() != render_manifest(
            _local_package_receipt(base, package_version=package_version, output_root=output_root)
        ):
            raise ReleaseChatterboxError("chatterbox-package-runtime-invalid")
    except (OSError, zipfile.BadZipFile):
        raise ReleaseChatterboxError("chatterbox-package-runtime-invalid") from None


def measurement_json(measurement: PackageMeasurement) -> str:
    return json.dumps(
        {
            "archiveSha256": measurement.archive_sha256,
            "compressedBytes": measurement.compressed_bytes,
            "fileCount": measurement.file_count,
            "installedBytes": measurement.installed_bytes,
            "runtimeManifestSha256": measurement.runtime_manifest_sha256,
            "parts": [
                {
                    "filename": part.filename,
                    "sha256": part.sha256,
                    "sizeBytes": part.size_bytes,
                }
                for part in measurement.parts
            ],
        },
        sort_keys=True,
    )


def main(arguments: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "command",
        choices=(
            "build",
            "check-acquisition",
            "check-source",
            "check-local",
            "reconcile-evidence",
            "write-source",
            "write-acquisition",
        ),
    )
    parser.add_argument("--no-sync", action="store_true")
    parser.add_argument("--publication", type=Path)
    parser.add_argument("--output-root", type=Path)
    parser.add_argument("--package-version", choices=("2", "3", "4", "5", "6", "7"), default="2")
    args = parser.parse_args(sys.argv[1:] if arguments is None else arguments)
    version = cast(PackageVersion, args.package_version)
    if args.output_root is not None and args.command not in {"build", "check-local"}:
        parser.error("--output-root requires build or check-local")
    if args.command == "check-local":
        if version not in {"4", "5", "6", "7"}:
            parser.error("check-local requires --package-version 4, 5, 6 or 7")
        check_local_package(package_version=version, output_root=args.output_root)
        status = "current" if version in {"6", "7"} else "current-unpublished-unadmitted"
        print(f"chatterbox-optional-v{version}-local:{status}")
        return 0
    if version == "4" and args.command in {
        "check-acquisition",
        "write-acquisition",
        "reconcile-evidence",
    }:
        parser.error(f"version {version} is local-only and has no acquisition authority")
    if version == "5" and args.command == "check-acquisition":
        check_security_authority()
        print("chatterbox-v5-acquisition:current")
        return 0
    if version == "6" and args.command == "check-acquisition":
        chatterbox_v6_authority.check_security_authority()
        print("chatterbox-v6-acquisition:current")
        return 0
    if version == "7" and args.command == "check-acquisition":
        chatterbox_v7_authority.check_security_authority()
        print("chatterbox-v7-acquisition:current")
        return 0
    if version == "3" and args.command == "check-acquisition":
        check_successor_authority()
        print("chatterbox-v3-acquisition:current")
        return 0
    if args.command == "write-acquisition":
        if version not in {"3", "5", "6", "7"} or args.publication is None:
            parser.error("write-acquisition requires version 3, 5, 6 or 7 and --publication")
        if version == "7":
            chatterbox_v7_authority.write_security_authority(args.publication)
        elif version == "6":
            chatterbox_v6_authority.write_security_authority(args.publication)
        elif version == "5":
            write_security_authority(args.publication)
        else:
            write_successor_authority(args.publication)
        print(f"chatterbox-v{version}-acquisition:written")
        return 0
    if version in {"3", "5", "6", "7"} and args.command == "reconcile-evidence":
        parser.error("historical evidence reconciliation requires version 2")
    if args.command == "write-source":
        if version not in {"3", "4", "5", "6", "7"}:
            parser.error("write-source requires --package-version 3, 4, 5, 6 or 7")
        if version in {"5", "6", "7"}:
            write_security_source_manifest(package_version=version)
        elif version == "4":
            write_local_source_manifest()
        else:
            write_successor_source_manifest()
        print(f"chatterbox-optional-v{version}-source:written")
        return 0
    if args.command == "check-source":
        load_source_manifest(package_version=version)
        print("chatterbox-optional-source:current")
        return 0
    if args.command == "check-acquisition":
        load_acquisition_manifest()
        load_runtime_evidence()
        load_current_runtime_evidence()
        print("chatterbox-official-acquisition:current")
        return 0
    if args.command == "reconcile-evidence":
        reconcile_runtime_evidence()
        print("chatterbox-runtime-evidence:reconciled")
        return 0
    print(
        measurement_json(
            build_package(
                synchronise=not args.no_sync,
                package_version=version,
                output_root=args.output_root,
            )
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
