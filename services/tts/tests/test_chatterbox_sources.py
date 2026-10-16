"""Closed historical provenance and local recipe regression cases."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import zipfile
from pathlib import Path
from typing import NoReturn

import pytest

from voxleaf_tts import release_chatterbox
from voxleaf_tts.packaging import chatterbox_sources as sources
from voxleaf_tts.packaging.chatterbox_authority import (
    load_source_manifest,
    write_local_source_manifest,
)
from voxleaf_tts.packaging.chatterbox_integrity import (
    PackageLayout,
    ReleaseChatterboxError,
    repository_root,
)


@pytest.fixture
def frozen_sources(monkeypatch: pytest.MonkeyPatch) -> dict[str, bytes]:
    payloads = {
        module: f"synthetic {module}".encode() for module in sources.HISTORICAL_IDENTITIES["3"]
    }
    monkeypatch.setattr(
        sources,
        "HISTORICAL_IDENTITIES",
        {
            version: {
                module: (len(payloads[module]), hashlib.sha256(payloads[module]).hexdigest())
                for module in identities
            }
            for version, identities in sources.HISTORICAL_IDENTITIES.items()
        },
    )
    monkeypatch.setattr(sources, "_read_git_blob", lambda _root, _commit, module: payloads[module])
    return payloads


@pytest.mark.parametrize("version", ["2", "3"])
def test_historical_sources_read_exact_commit_paths_before_copy(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, frozen_sources: dict[str, bytes], version: str
) -> None:
    observed: list[tuple[str, str]] = []

    def read(_root: Path, commit: str, module: str) -> bytes:
        observed.append((commit, module))
        return frozen_sources[module]

    monkeypatch.setattr(sources, "_read_git_blob", read)
    manifest = load_source_manifest(package_version="2" if version == "2" else "3")
    staging = tmp_path / "staging"
    release_chatterbox._copy_runtime_modules(tmp_path, staging, manifest)
    expected = sources.HISTORICAL_IDENTITIES[version]
    assert observed == [(sources.HISTORICAL_COMMITS[version], module) for module in expected]
    target = staging / "runtime/Lib/site-packages/voxleaf_tts"
    assert {
        path.relative_to(target).as_posix(): path.read_bytes()
        for path in target.rglob("*")
        if path.is_file()
    } == {module: frozen_sources[module] for module in expected}


@pytest.mark.parametrize("failure", ["missing-history", "wrong-commit", "missing-path", "bytes"])
def test_historical_failures_never_mutate_staging_or_fall_back_to_live_source(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, frozen_sources: dict[str, bytes], failure: str
) -> None:
    def read(_root: Path, _commit: str, _module: str) -> bytes:
        if failure in {"missing-history", "missing-path"}:
            raise ReleaseChatterboxError("chatterbox-package-source-invalid")
        return b"wrong historical bytes"

    monkeypatch.setattr(sources, "_read_git_blob", read)
    live = tmp_path / "services/tts/src/voxleaf_tts"
    live.mkdir(parents=True)
    for module, payload in frozen_sources.items():
        path = live / module
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(payload)
    staging = tmp_path / "staging"
    with pytest.raises(ReleaseChatterboxError, match="^chatterbox-package-source-invalid$"):
        release_chatterbox._copy_runtime_modules(tmp_path, staging, load_source_manifest())
    assert not staging.exists()


@pytest.mark.parametrize("failure", ["directory", "write"])
def test_runtime_copy_preserves_content_free_io_failure(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, frozen_sources: dict[str, bytes], failure: str
) -> None:
    staging = tmp_path / "staging"
    if failure == "directory":
        staging.mkdir()
        (staging / "runtime").write_bytes(b"blocked directory")
    else:

        def fail(_path: Path, _payload: bytes) -> int:
            raise OSError("private-path-and-content")

        monkeypatch.setattr(Path, "write_bytes", fail)
    with pytest.raises(ReleaseChatterboxError) as caught:
        release_chatterbox._copy_runtime_modules(tmp_path, staging, load_source_manifest())
    assert str(caught.value) == "chatterbox-package-staging-failed"
    assert caught.value.__cause__ is None and caught.value.__suppress_context__


def test_git_reader_uses_raw_bytes_no_fetch_and_fixed_path(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    observed: list[list[str]] = []

    def run(command: list[str], **kwargs: object) -> subprocess.CompletedProcess[bytes]:
        observed.append(command)
        assert kwargs == {"cwd": tmp_path, "check": True, "capture_output": True, "timeout": 30}
        return subprocess.CompletedProcess(command, 0, b"raw\r\nbytes\xff")

    monkeypatch.setattr(subprocess, "run", run)
    commit = sources.HISTORICAL_COMMITS["2"]
    assert sources._read_git_blob(tmp_path, commit, "service.py") == b"raw\r\nbytes\xff"
    assert observed == [
        ["git", "--no-replace-objects", "show", f"{commit}:services/tts/src/voxleaf_tts/service.py"]
    ]


def test_missing_git_history_has_content_free_failure(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    def fail(*_args: object, **_kwargs: object) -> None:
        raise subprocess.CalledProcessError(128, ["git"], stderr=b"private-path")

    monkeypatch.setattr(subprocess, "run", fail)
    with pytest.raises(ReleaseChatterboxError, match="^chatterbox-package-source-invalid$"):
        sources._read_git_blob(tmp_path, sources.HISTORICAL_COMMITS["3"], "service.py")


@pytest.mark.parametrize("mutation", ["missing", "extra", "wrong-version", "unsafe"])
def test_runtime_source_closure_rejects_collisions_before_mutation(
    tmp_path: Path, mutation: str
) -> None:
    manifest = load_source_manifest()
    if mutation == "wrong-version":
        manifest["packageVersion"] = "4"
    else:
        modules = list(sources.HISTORICAL_IDENTITIES["2"])
        if mutation == "missing":
            modules.pop()
        else:
            modules.append("service_extra.py" if mutation == "extra" else "../service.py")
        manifest["runtimeModules"] = modules
    with pytest.raises(
        ReleaseChatterboxError, match="^chatterbox-package-source-manifest-invalid$"
    ):
        sources.resolve_runtime_sources(tmp_path, manifest)


def _local_root(root: Path) -> Path:
    for relative in (
        "services/tts/release/optional/chatterbox/source-manifest-v2.json",
        PackageLayout("3").lock_path,
    ):
        target = root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(repository_root() / relative, target)
    return root


def test_v4_recipe_is_local_closed_and_preserves_historical_inputs(tmp_path: Path) -> None:
    root = _local_root(tmp_path)
    historical = root / "services/tts/release/optional/chatterbox/source-manifest-v2.json"
    before = historical.read_bytes()
    target = write_local_source_manifest(root)
    first = target.read_bytes()
    assert write_local_source_manifest(root).read_bytes() == first
    manifest = load_source_manifest(root, package_version="4")
    assert manifest["runtimeModules"] == list(sources.LOCAL_RUNTIME_MODULES)
    assert len(sources.LOCAL_RUNTIME_MODULES) == 10
    assert manifest["runtimeRelease"] == {
        "maximumPartBytes": 1_900_000_000,
        "maximumParts": 4,
        "published": False,
        "admitted": False,
    }
    assert manifest["chatterboxLock"] == {
        "path": PackageLayout("3").lock_path,
        "sha256": hashlib.sha256((root / PackageLayout("3").lock_path).read_bytes()).hexdigest(),
    }
    assert historical.read_bytes() == before
    assert b"chatterbox-runtime-v4" not in first
    assert not (
        root / "services/tts/release/optional/chatterbox/runtime-package-evidence-v4.json"
    ).exists()
    manifest["runtimeModules"] = ["service.py"]
    target.write_text(json.dumps(manifest))
    with pytest.raises(ReleaseChatterboxError, match="source-manifest-invalid"):
        load_source_manifest(root, package_version="4")


def test_history_is_resolved_before_environment_or_dist_mutation(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    root = _local_root(tmp_path)
    original_lock = "services/tts/release/profiles/chatterbox/requirements.lock"
    target = root / original_lock
    target.parent.mkdir(parents=True)
    shutil.copyfile(repository_root() / original_lock, target)
    monkeypatch.setattr(release_chatterbox, "repository_root", lambda: root)

    def fail(_root: Path, _manifest: object) -> dict[str, bytes]:
        raise ReleaseChatterboxError("chatterbox-package-source-invalid")

    monkeypatch.setattr(release_chatterbox, "resolve_runtime_sources", fail)
    with pytest.raises(ReleaseChatterboxError, match="source-invalid"):
        release_chatterbox.build_package()
    assert not PackageLayout().dist(root).exists()


def test_v4_sync_retains_require_hashes(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    commands: list[list[str]] = []
    monkeypatch.setattr(subprocess, "run", lambda command, **_kwargs: commands.append(command))
    release_chatterbox._synchronise_environment(
        tmp_path, tmp_path / "environment", package_version="4"
    )
    assert commands[1][-1] == "--require-hashes"
    assert str(tmp_path / PackageLayout("3").lock_path) in commands[1]


def _local_payload(root: Path, *, part_count: int = 1) -> Path:
    _local_root(root)
    write_local_source_manifest(root)
    source_root = root / "services/tts/src/voxleaf_tts"
    for module in sources.LOCAL_RUNTIME_MODULES:
        path = source_root / module
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(b"" if module == "adapters/__init__.py" else module.encode())
    layout = PackageLayout("4")
    target = layout.dist(root) / layout.directory
    release_chatterbox._copy_runtime_modules(
        root, target, load_source_manifest(root, package_version="4")
    )
    copies = {
        "source-manifest-v4.json": root
        / "services/tts/release/optional/chatterbox/source-manifest-v4.json",
        "notices/requirements.lock": root / layout.lock_path,
        "notices/python/tokenizers-0.23.1/LICENSE": repository_root()
        / release_chatterbox.TOKENIZERS_LICENSE_PATH,
    }
    for relative, original in copies.items():
        destination = target / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(original.read_bytes())
    loader = target / "runtime/Lib/site-packages/chatterbox/mtl_tts.py"
    loader.parent.mkdir(parents=True)
    loader.write_text(
        "import torch\n"
        "a=torch.load('a',weights_only=True)\n"
        "b=torch.load('b',weights_only=True)\n"
        "c=torch.load('c',weights_only=True)\n"
        "d=load_safetensors('d')\n"
    )
    manifest = release_chatterbox.build_runtime_manifest(target, package_version="4")
    (target / layout.runtime_manifest).write_bytes(release_chatterbox.render_manifest(manifest))
    archive = layout.dist(root) / layout.archive
    release_chatterbox._zip_package(target, archive, package_version="4")
    release_chatterbox.split_archive(
        archive, maximum_part_bytes=(archive.stat().st_size + part_count - 1) // part_count
    )
    receipt = release_chatterbox._local_package_receipt(root)
    (layout.dist(root) / "local-build-evidence-v4.json").write_bytes(
        release_chatterbox.render_manifest(receipt)
    )
    return target


@pytest.mark.parametrize("mutation", ["missing", "extra", "tampered", "source", "part", "receipt"])
def test_local_verifier_rejects_payload_source_part_and_receipt_drift(
    tmp_path: Path, mutation: str
) -> None:
    target = _local_payload(tmp_path)
    release_chatterbox.check_local_package(tmp_path)
    if mutation in {"missing", "tampered"}:
        path = target / "runtime/Lib/site-packages/voxleaf_tts/adapters/chatterbox.py"
        if mutation == "missing":
            path.unlink()
        else:
            path.write_bytes(b"tampered")
    elif mutation == "extra":
        (target / "runtime/Lib/site-packages/voxleaf_tts/adapters/qwen.py").write_bytes(b"extra")
    elif mutation == "source":
        (tmp_path / "services/tts/src/voxleaf_tts/adapters/chatterbox.py").write_bytes(
            b"source drift"
        )
    elif mutation == "part":
        part = PackageLayout("4").dist(tmp_path) / f"{PackageLayout('4').archive}.part-001"
        part.write_bytes(b"tampered part")
    else:
        receipt = PackageLayout("4").dist(tmp_path) / "local-build-evidence-v4.json"
        value = json.loads(receipt.read_bytes())
        value["distribution"]["published"] = True
        receipt.write_text(json.dumps(value))
    with pytest.raises(
        ReleaseChatterboxError,
        match="^chatterbox-package-(runtime-invalid|source-invalid|archive-failed)$",
    ):
        release_chatterbox.check_local_package(tmp_path)


@pytest.mark.parametrize("part_count", [1, 3, 4])
def test_local_receipt_preserves_ordered_parts_and_exact_serialized_contract(
    tmp_path: Path, part_count: int
) -> None:
    target = _local_payload(tmp_path, part_count=part_count)
    layout = PackageLayout("4")
    dist = layout.dist(tmp_path)
    archive = dist / layout.archive
    parts = sorted(dist.glob(f"{layout.archive}.part-*"))
    assert len(parts) == part_count
    assert [part.name for part in parts] == [
        f"{layout.archive}.part-{index:03}" for index in range(1, part_count + 1)
    ]
    assert b"".join(part.read_bytes() for part in parts) == archive.read_bytes()

    def digest(path: Path) -> str:
        return hashlib.sha256(path.read_bytes()).hexdigest()

    files = [path for path in target.rglob("*") if path.is_file()]
    expected = {
        "schemaVersion": 1,
        "packageId": "voxleaf-chatterbox-v4",
        "packageVersion": "4",
        "distribution": {"published": False, "admitted": False},
        "authority": {
            "sourceManifestSha256": digest(target / layout.source_manifest),
            "dependencyLockSha256": digest(tmp_path / layout.lock_path),
        },
        "sources": [
            {
                "path": module,
                "sizeBytes": len(payload),
                "sha256": hashlib.sha256(payload).hexdigest(),
            }
            for module in sources.LOCAL_RUNTIME_MODULES
            for payload in [(tmp_path / "services/tts/src/voxleaf_tts" / module).read_bytes()]
        ],
        "measurements": {
            "archiveSha256": digest(archive),
            "compressedBytes": archive.stat().st_size,
            "installedBytes": sum(path.stat().st_size for path in files),
            "fileCount": len(files),
            "runtimeManifestSha256": digest(target / layout.runtime_manifest),
        },
        "parts": [
            {"filename": part.name, "sha256": digest(part), "sizeBytes": part.stat().st_size}
            for part in parts
        ],
    }
    expected_bytes = (json.dumps(expected, indent=2, sort_keys=True) + "\n").encode("utf-8")
    assert (dist / "local-build-evidence-v4.json").read_bytes() == expected_bytes
    assert (
        release_chatterbox.render_manifest(release_chatterbox._local_package_receipt(tmp_path))
        == expected_bytes
    )
    release_chatterbox.check_local_package(tmp_path)


@pytest.mark.parametrize("mutation", ["missing", "gap", "reordered"])
def test_local_verifier_rejects_exact_split_part_errors(tmp_path: Path, mutation: str) -> None:
    _local_payload(tmp_path, part_count=3)
    layout = PackageLayout("4")
    parts = sorted(layout.dist(tmp_path).glob(f"{layout.archive}.part-*"))
    if mutation == "missing":
        for part in parts:
            part.unlink()
    elif mutation == "gap":
        parts[1].unlink()
    else:
        first, last = parts[0].read_bytes(), parts[-1].read_bytes()
        parts[0].write_bytes(last)
        parts[-1].write_bytes(first)
    with pytest.raises(ReleaseChatterboxError, match="^chatterbox-package-archive-failed$"):
        release_chatterbox.check_local_package(tmp_path)


@pytest.mark.parametrize("mutation", ["duplicate", "missing", "extra", "same-length"])
def test_local_verifier_reaches_zip_member_errors_with_matching_parts(
    tmp_path: Path, mutation: str
) -> None:
    _local_payload(tmp_path)
    layout = PackageLayout("4")
    archive = layout.dist(tmp_path) / layout.archive
    with zipfile.ZipFile(archive) as opened:
        members = [(item, opened.read(item)) for item in opened.infolist()]
    if mutation == "missing":
        members.pop()
    elif mutation == "same-length":
        item, payload = members[0]
        assert payload
        members[0] = (item, bytes([payload[0] ^ 1]) + payload[1:])
    with zipfile.ZipFile(archive, "w") as opened:
        for item, payload in members:
            opened.writestr(item, payload)
        if mutation == "duplicate":
            with pytest.warns(UserWarning, match="Duplicate name"):
                opened.writestr(*members[0])
        elif mutation == "extra":
            opened.writestr(f"{layout.directory}/extra-member", b"extra")
    release_chatterbox.split_archive(archive)
    part = archive.with_name(f"{layout.archive}.part-001")
    assert part.read_bytes() == archive.read_bytes()
    with pytest.raises(ReleaseChatterboxError, match="^chatterbox-package-archive-failed$"):
        release_chatterbox.check_local_package(tmp_path)


@pytest.mark.parametrize("error_type", [OSError, zipfile.BadZipFile])
def test_local_verifier_retains_caller_io_and_zip_error_conversion(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, error_type: type[Exception]
) -> None:
    _local_payload(tmp_path)

    def fail(_archive: Path) -> NoReturn:
        raise error_type("private-synthetic-detail")

    monkeypatch.setattr(zipfile, "ZipFile", fail)
    with pytest.raises(error_type, match="^private-synthetic-detail$"):
        release_chatterbox._local_package_receipt(tmp_path)
    with pytest.raises(
        ReleaseChatterboxError, match="^chatterbox-package-runtime-invalid$"
    ) as caught:
        release_chatterbox.check_local_package(tmp_path)
    assert caught.value.__cause__ is None and caught.value.__suppress_context__
