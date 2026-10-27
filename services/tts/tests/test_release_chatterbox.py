from __future__ import annotations

import base64
import hashlib
import json
import shutil
import zipfile
import zlib
from pathlib import Path

import pytest

from voxleaf_tts import release_chatterbox
from voxleaf_tts.packaging import chatterbox_authority, chatterbox_integrity, chatterbox_sources
from voxleaf_tts.release_chatterbox import (
    PACKAGE_DIRECTORY_NAME,
    SUCCESSOR_BUILD_COMMIT,
    PackageLayout,
    PackageVersion,
    ReleaseChatterboxError,
    _configure_embedded_python,
    _copy_notices,
    _copy_runtime_modules,
    _copy_successor_license,
    _zip_package,
    build_runtime_manifest,
    check_successor_authority,
    load_acquisition_manifest,
    load_current_runtime_evidence,
    load_runtime_evidence,
    load_source_manifest,
    reconcile_runtime_evidence,
    render_manifest,
    repository_root,
    safe_relative_path,
    split_archive,
    successor_acquisition_manifest,
    successor_runtime_evidence,
    verify_package_tree,
    verify_safe_model_load_sites,
    write_successor_authority,
    write_successor_source_manifest,
)

# Exact historical v3 raw blobs; self-contained unit authority, never live Git.
_HISTORICAL_BLOBS = (
    "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"
)


@pytest.fixture(autouse=True)
def historical_blob_fixture(monkeypatch: pytest.MonkeyPatch) -> None:
    decoded = json.loads(zlib.decompress(base64.b64decode(_HISTORICAL_BLOBS)))
    assert isinstance(decoded, dict)
    payloads: dict[str, bytes] = {}
    for module, payload in decoded.items():
        assert isinstance(module, str) and isinstance(payload, str)
        payloads[module] = payload.encode("utf-8")

    def read(_root: Path, commit: str, module: str) -> bytes:
        assert commit in chatterbox_sources.HISTORICAL_COMMITS.values()
        return payloads[module]

    monkeypatch.setattr(chatterbox_sources, "_read_git_blob", read)


def test_successor_authority_binds_current_artifacts_and_inherited_profile_evidence() -> None:
    check_successor_authority()
    authority = successor_acquisition_manifest()
    assert "runtimeCorrection" not in authority
    assert authority["measurements"] == {
        "coldStartSeconds": 83,
        "downloadBytes": 8_239_933_601,
        "installedBytes": 8_236_377_725,
        "temporaryBytes": 13_270_915_278,
        "minimumFreeBytes": 20_000_000_000,
    }
    evidence = successor_runtime_evidence()
    assert evidence["runtimeCorrection"] is None
    build_authority = evidence["authority"]
    inherited = evidence["inheritedProfileObservations"]
    assert isinstance(build_authority, dict)
    assert isinstance(inherited, dict)
    assert build_authority["runtimeBuildCommitSha"] == SUCCESSOR_BUILD_COMMIT
    assert inherited["status"] == "historical-v2-profile-policy-not-new-v3-measurements"


@pytest.fixture
def successor_publication(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> tuple[Path, Path, dict[str, object]]:
    authority = successor_acquisition_manifest()
    monkeypatch.setattr(
        chatterbox_authority, "successor_acquisition_manifest", lambda _root: authority
    )
    destination = tmp_path / "services/tts/release/optional/chatterbox"
    destination.mkdir(parents=True)
    for name in ("optional-package-manifest-v3.json", "runtime-package-evidence-v4.json"):
        (destination / name).write_bytes(f"synthetic sentinel: {name}".encode())
    (destination / "historical-sentinel.json").write_bytes(b"historical sentinel")
    runtime = authority["runtimeArtifact"]
    assert isinstance(runtime, dict)
    receipt = {
        "tagName": "chatterbox-runtime-v3",
        "targetCommitish": SUCCESSOR_BUILD_COMMIT,
        "isDraft": False,
        "isPrerelease": True,
        "publishedAt": "2026-10-07T03:24:00Z",
        "assets": [
            {
                "name": part["filename"],
                "size": part["downloadBytes"],
                "digest": f"sha256:{part['sha256']}",
                "url": part["url"],
                "state": "uploaded",
            }
            for part in runtime["parts"]
        ],
    }
    path = tmp_path / "publication.json"
    path.write_text(json.dumps(receipt))
    return path, destination, authority


@pytest.mark.parametrize("mutation", ["invalid-digest", "missing-assets"])
def test_successor_publication_rejects_incomplete_or_substituted_assets(
    tmp_path: Path,
    successor_publication: tuple[Path, Path, dict[str, object]],
    mutation: str,
) -> None:
    path, destination, _authority = successor_publication
    before = {file.relative_to(destination): file.read_bytes() for file in destination.rglob("*")}
    receipt = json.loads(path.read_text())
    if mutation == "invalid-digest":
        receipt["assets"][0]["digest"] = "sha256:" + "0" * 64
    else:
        receipt["assets"] = []
    path.write_text(json.dumps(receipt))
    with pytest.raises(ReleaseChatterboxError, match="publication-invalid"):
        write_successor_authority(path, tmp_path)
    assert {
        file.relative_to(destination): file.read_bytes() for file in destination.rglob("*")
    } == before


def test_verified_successor_publication_writes_exact_isolated_authority(
    tmp_path: Path, successor_publication: tuple[Path, Path, dict[str, object]]
) -> None:
    path, destination, authority = successor_publication
    write_successor_authority(path, tmp_path)
    assert (destination / "optional-package-manifest-v3.json").read_bytes() == (
        chatterbox_authority.render_successor_authority(authority)
    )
    assert (destination / "runtime-package-evidence-v4.json").read_bytes() == (
        chatterbox_authority.render_successor_authority(successor_runtime_evidence(tmp_path))
    )
    assert (destination / "historical-sentinel.json").read_bytes() == b"historical sentinel"


@pytest.mark.parametrize("failure", ["missing", "tampered", "different-wheel"])
def test_successor_license_rejects_incomplete_or_mismatched_closure(
    tmp_path: Path, failure: str
) -> None:
    root = tmp_path / "repo"
    relative = "services/tts/release/optional/chatterbox/licenses/tokenizers-0.23.1-LICENSE.txt"
    source = root / relative
    source.parent.mkdir(parents=True)
    if failure != "missing":
        shutil.copyfile(repository_root() / relative, source)
    if failure == "tampered":
        source.write_bytes(source.read_bytes() + b"tampered")
    environment = tmp_path / "environment"
    (
        environment
        / (
            "tokenizers-0.22.2.dist-info"
            if failure == "different-wheel"
            else "tokenizers-0.23.1.dist-info"
        )
    ).mkdir(parents=True)
    notices = tmp_path / "notices"
    with pytest.raises(ReleaseChatterboxError, match="tokenizers-license-invalid"):
        _copy_successor_license(root, notices, environment)
    assert not notices.exists()


def test_successor_license_copies_exact_upstream_bytes(tmp_path: Path) -> None:
    environment = tmp_path / "environment"
    (environment / "tokenizers-0.23.1.dist-info").mkdir(parents=True)
    notices = tmp_path / "notices"
    _copy_successor_license(repository_root(), notices, environment)
    expected = (
        repository_root()
        / "services/tts/release/optional/chatterbox/licenses/tokenizers-0.23.1-LICENSE.txt"
    )
    assert (notices / "python/tokenizers-0.23.1/LICENSE").read_bytes() == expected.read_bytes()


def test_v2_notices_do_not_require_successor_license(tmp_path: Path) -> None:
    root = tmp_path / "repo"
    _write_tree(
        root,
        {
            "LICENSE": b"project licence",
            "services/tts/release/optional/chatterbox/THIRD-PARTY-NOTICES.md": b"notices",
            "services/tts/release/optional/chatterbox/source-manifest-v2.json": b"original source",
            "services/tts/release/profiles/chatterbox/requirements.lock": b"original lock",
        },
    )
    staging = tmp_path / "staging"
    _copy_notices(
        root,
        staging,
        tmp_path / "environment",
        {"chatterboxLock": {"path": "services/tts/release/profiles/chatterbox/requirements.lock"}},
    )
    assert (staging / "source-manifest-v2.json").read_bytes() == b"original source"
    assert not (staging / "notices/python/tokenizers-0.23.1/LICENSE").exists()


def _successor_root(root: Path) -> Path:
    for relative in (
        "services/tts/release/optional/chatterbox/source-manifest-v2.json",
        "services/tts/release/profiles/chatterbox-v3/requirements.lock",
    ):
        target = root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(repository_root() / relative, target)
    return root


def test_successor_layout_keeps_v2_outputs_and_environment_isolated(tmp_path: Path) -> None:
    original, successor = PackageLayout(), PackageLayout("3")
    assert original.directory == PACKAGE_DIRECTORY_NAME
    assert original.dist(tmp_path) / "v3" == successor.dist(tmp_path)
    assert original.lock_path != successor.lock_path
    assert original.archive != successor.archive
    assert original.runtime_manifest != successor.runtime_manifest
    with pytest.raises(ReleaseChatterboxError, match="chatterbox-package-version-invalid"):
        PackageLayout("7")  # type: ignore[arg-type]
    local = PackageLayout("4")
    assert local.dist(tmp_path) == original.dist(tmp_path) / "v4"
    assert local.lock_path == successor.lock_path
    assert local.directory != successor.directory
    assert local.archive != successor.archive


def test_successor_input_changes_only_the_three_security_pins() -> None:
    profiles = repository_root() / "services/tts/release/profiles"
    original = (profiles / "chatterbox/requirements.in").read_text().splitlines()
    successor = (profiles / "chatterbox-v3/requirements.in").read_text().splitlines()
    expected = {
        "transformers==5.5.0": "transformers==5.17.0",
        "tokenizers==0.22.2": "tokenizers==0.23.1",
        "urllib3==2.7.0": "urllib3==2.8.0",
    }
    assert successor == [expected.get(line, line) for line in original]


def test_successor_source_preserves_provenance_and_adds_generated_closure(tmp_path: Path) -> None:
    root = _successor_root(tmp_path)
    original = load_source_manifest(root)
    original_bytes = (
        root / "services/tts/release/optional/chatterbox/source-manifest-v2.json"
    ).read_bytes()
    path = write_successor_source_manifest(root)
    first = path.read_bytes()
    assert write_successor_source_manifest(root).read_bytes() == first
    successor = load_source_manifest(root, package_version="3")
    assert successor["schemaVersion"] == 2
    assert successor["packageVersion"] == "3"
    assert successor["packageId"] == "voxleaf-chatterbox-v3"
    for field in ("modelFiles", "python", "profileId", "platform", "provenance"):
        assert successor[field] == original[field]
    assert successor["runtimeModules"] == original["runtimeModules"] + [  # type: ignore[operator]
        "generated/__init__.py",
        "generated/protocol_schemas.py",
    ]
    assert (
        root / "services/tts/release/optional/chatterbox/source-manifest-v2.json"
    ).read_bytes() == original_bytes


@pytest.mark.parametrize(
    "field,value", [("packageVersion", "2"), ("modelFiles", []), ("runtimeModules", ["service.py"])]
)
def test_successor_source_rejects_version_provenance_and_closure_tampering(
    tmp_path: Path, field: str, value: object
) -> None:
    root = _successor_root(tmp_path)
    path = write_successor_source_manifest(root)
    manifest = json.loads(path.read_bytes())
    manifest[field] = value
    path.write_bytes(render_manifest(manifest))
    with pytest.raises(ReleaseChatterboxError, match="source-manifest-invalid"):
        load_source_manifest(root, package_version="3")


def test_successor_source_rejects_lock_drift_until_explicit_regeneration(tmp_path: Path) -> None:
    root = _successor_root(tmp_path)
    write_successor_source_manifest(root)
    lock = root / PackageLayout("3").lock_path
    lock.write_bytes(lock.read_bytes() + b"\n# changed\n")
    with pytest.raises(ReleaseChatterboxError, match="source-manifest-invalid"):
        load_source_manifest(root, package_version="3")
    write_successor_source_manifest(root)
    load_source_manifest(root, package_version="3")


def test_successor_copies_generated_modules_and_verifies_archive_identity(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    root = _successor_root(tmp_path / "repo")
    write_successor_source_manifest(root)
    source = load_source_manifest(root, package_version="3")
    modules = source["runtimeModules"]
    assert isinstance(modules, list)
    for module in modules:
        assert isinstance(module, str)
        _write_tree(root / "services/tts/src/voxleaf_tts", {module: module.encode()})
    monkeypatch.setattr(
        release_chatterbox,
        "resolve_runtime_sources",
        lambda _root, _manifest: {module: module.encode() for module in modules},
    )
    staging = tmp_path / "staging"
    _copy_runtime_modules(root, staging, source)
    manifest = build_runtime_manifest(staging, package_version="3")
    (staging / "runtime-manifest-v3.json").write_bytes(render_manifest(manifest))
    verify_package_tree(staging, manifest, package_version="3")
    archive = tmp_path / "runtime.zip"
    _zip_package(staging, archive, package_version="3")
    with zipfile.ZipFile(archive) as opened:
        assert all(name.startswith("voxleaf-chatterbox-v3/") for name in opened.namelist())
        assert any(name.endswith("generated/protocol_schemas.py") for name in opened.namelist())
    (staging / "runtime/Lib/site-packages/voxleaf_tts/generated/protocol_schemas.py").write_bytes(
        b"tampered"
    )
    with pytest.raises(ReleaseChatterboxError, match="runtime-invalid"):
        verify_package_tree(staging, manifest, package_version="3")


def _sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


@pytest.fixture
def ncc_package_builder(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    """Run real verification/promotion with tiny files, without sync or downloads."""

    def synchronise(root: Path, environment: Path, *, package_version: str) -> None:
        (environment / "Lib/site-packages").mkdir(parents=True, exist_ok=True)

    def extract(archive: Path, target: Path) -> None:
        _write_tree(target, {"python.exe": b"new synthetic runtime"})

    monkeypatch.setattr(release_chatterbox, "_synchronise_environment", synchronise)
    monkeypatch.setattr(release_chatterbox, "verify_safe_model_load_sites", lambda *a: None)
    monkeypatch.setattr(
        release_chatterbox, "_download_artifact", lambda *a: tmp_path / "unused.zip"
    )
    monkeypatch.setattr(release_chatterbox, "_extract_embedded_python", extract)
    monkeypatch.setattr(release_chatterbox, "_local_package_receipt", lambda *a, **kw: {})
    for name in (
        "_configure_embedded_python",
        "_copy_tree",
        "_copy_runtime_modules",
        "_copy_notices",
    ):
        monkeypatch.setattr(release_chatterbox, name, lambda *a, **kw: None)
    return tmp_path / "output"


def test_ncc_promotion_failure_restores_previous_package(
    ncc_package_builder: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    dist = PackageLayout("6").dist(repository_root(), ncc_package_builder)
    target = dist / PackageLayout("6").directory
    previous = dist / f".{target.name}.previous"
    _write_tree(target, {"old.txt": b"previous valid tree"})
    replace = Path.replace

    def fail_promotion(path: Path, destination: Path) -> Path:
        if path.parent.name == ".s":
            raise OSError("injected promotion failure")
        return replace(path, destination)

    monkeypatch.setattr(Path, "replace", fail_promotion)
    with pytest.raises(OSError, match="injected promotion failure"):
        release_chatterbox.build_package(package_version="6", output_root=ncc_package_builder)
    assert (target / "old.txt").read_bytes() == b"previous valid tree"
    assert not previous.exists()
    assert not (dist / ".s").exists()


def test_ncc_failed_restore_preserves_backup_across_retry(
    ncc_package_builder: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    dist = PackageLayout("6").dist(repository_root(), ncc_package_builder)
    target = dist / PackageLayout("6").directory
    previous = dist / f".{target.name}.previous"
    _write_tree(target, {"old.txt": b"sole surviving tree"})
    replace = Path.replace
    restore_blocked = True

    def fail_moves(path: Path, destination: Path) -> Path:
        if path.parent.name == ".s":
            raise OSError("injected promotion failure")
        if path == previous and restore_blocked:
            raise OSError("injected restoration failure")
        return replace(path, destination)

    monkeypatch.setattr(Path, "replace", fail_moves)
    for _ in range(2):
        with pytest.raises(OSError):
            release_chatterbox.build_package(package_version="6", output_root=ncc_package_builder)
        assert not target.exists()
        assert (previous / "old.txt").read_bytes() == b"sole surviving tree"
    restore_blocked = False
    with pytest.raises(OSError, match="injected promotion failure"):
        release_chatterbox.build_package(package_version="6", output_root=ncc_package_builder)
    assert (target / "old.txt").read_bytes() == b"sole surviving tree"
    assert not previous.exists()


def test_ncc_successful_promotion_preserves_unrelated_tree(ncc_package_builder: Path) -> None:
    dist = PackageLayout("6").dist(repository_root(), ncc_package_builder)
    target = dist / PackageLayout("6").directory
    _write_tree(target, {"old.txt": b"previous tree"})
    _write_tree(dist, {"sentinel/keep.txt": b"unrelated"})
    result = release_chatterbox.build_package(package_version="6", output_root=ncc_package_builder)
    assert result.file_count > 0
    assert (target / "runtime/python.exe").read_bytes() == b"new synthetic runtime"
    assert not (target / "old.txt").exists()
    assert not (dist / f".{target.name}.previous").exists()
    assert (dist / "sentinel/keep.txt").read_bytes() == b"unrelated"


def _write_tree(root: Path, files: dict[str, bytes]) -> None:
    for relative, value in files.items():
        target = root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(value)


def _manifest(files: dict[str, bytes]) -> dict[str, object]:
    return {
        "files": [
            {"path": path, "sha256": _sha256(value), "sizeBytes": len(value)}
            for path, value in sorted(files.items())
        ]
    }


def test_extracted_helpers_share_facade_bindings_class_identity_and_repository_root() -> None:
    assert repository_root() == Path(__file__).resolve().parents[3]
    for name in (
        "PackageVersion",
        "PackageLayout",
        "ReleaseChatterboxError",
        "repository_root",
        "build_runtime_manifest",
        "verify_package_tree",
    ):
        assert getattr(release_chatterbox, name) is getattr(chatterbox_integrity, name)
    for name in ("load_source_manifest", "load_acquisition_manifest", "successor_runtime_evidence"):
        assert getattr(release_chatterbox, name) is getattr(chatterbox_authority, name)
    for cls in (PackageLayout, ReleaseChatterboxError):
        assert cls.__module__ == "voxleaf_tts.release_chatterbox"
        assert cls.__qualname__ == cls.__name__
        assert getattr(chatterbox_authority, cls.__name__) is cls


@pytest.mark.parametrize("package_version", ["2", "3"])
def test_runtime_module_copy_keeps_the_current_allowlist_and_excludes_nested_helpers(
    tmp_path: Path, package_version: PackageVersion, monkeypatch: pytest.MonkeyPatch
) -> None:
    manifest = load_source_manifest(package_version=package_version)
    modules = manifest["runtimeModules"]
    assert isinstance(modules, list)
    files = {module: module.encode() for module in modules}
    monkeypatch.setattr(
        release_chatterbox, "resolve_runtime_sources", lambda _root, _manifest: files
    )
    root, staging = tmp_path / "repo", tmp_path / "staging"
    _write_tree(root / "services/tts/src/voxleaf_tts", files)
    _write_tree(
        root / "services/tts/src/voxleaf_tts",
        {
            "packaging/chatterbox_integrity.py": b"maintainer integrity",
            "packaging/chatterbox_authority.py": b"maintainer authority",
            "packaging/nested/unlisted.py": b"nested maintainer helper",
        },
    )
    _copy_runtime_modules(root, staging, manifest)
    target = staging / "runtime/Lib/site-packages/voxleaf_tts"
    assert not (target / "packaging").exists()
    assert {
        path.relative_to(target).as_posix(): path.read_bytes()
        for path in target.rglob("*")
        if path.is_file()
    } == files


@pytest.mark.parametrize(
    "package_version,expected_sha256",
    [
        ("2", "14d0d52e08ef937a9a8ef87d0346cc3ffb8a43fd2ccac25d824ac32d96ec520e"),
        ("3", "f62cc4bec21707a3444d66aa42f6e638dc8d8a4104335f8bcd4c79b9291c4bd0"),
    ],
)
def test_fixed_input_runtime_manifest_matches_versioned_baseline_bytes(
    tmp_path: Path, package_version: PackageVersion, expected_sha256: str
) -> None:
    _write_tree(
        tmp_path,
        {
            "runtime/python.exe": b"python",
            "runtime/Lib/site-packages/voxleaf_tts/service.py": b"service",
        },
    )
    rendered = render_manifest(build_runtime_manifest(tmp_path, package_version=package_version))
    assert len(rendered) == 678
    assert _sha256(rendered) == expected_sha256


def test_source_manifest_closes_the_one_optional_profile_and_six_model_files() -> None:
    manifest = load_source_manifest()
    assert manifest["packageId"] == PACKAGE_DIRECTORY_NAME
    assert manifest["packageVersion"] == "2"
    assert manifest["profileId"] == "chatterbox-multilingual-v3-cuda-bf16-default-v4"
    assert manifest["platform"] == "windows-x86_64"
    model_files = manifest["modelFiles"]
    assert isinstance(model_files, list)
    assert len(model_files) == 6
    assert all(
        isinstance(artifact, dict)
        and str(artifact["url"]).startswith(
            "https://huggingface.co/ResembleAI/chatterbox/resolve/"
            "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18/"
        )
        for artifact in model_files
    )


def test_acquisition_manifest_matches_the_runtime_and_official_model_authority() -> None:
    manifest = load_acquisition_manifest()
    assert manifest["schemaVersion"] == 2
    assert manifest["availability"] == "downloadable"
    runtime = manifest["runtimeArtifact"]
    assert isinstance(runtime, dict)
    assert len(runtime["parts"]) == 3
    assert sum(part["downloadBytes"] for part in runtime["parts"]) == 5_022_941_463
    assert manifest["measurements"] == {
        "coldStartSeconds": 83,
        "downloadBytes": 8_231_893_387,
        "installedBytes": 8_228_503_309,
        "minimumFreeBytes": 20_000_000_000,
        "temporaryBytes": 13_254_834_850,
    }
    assert "withholdingReason" not in manifest
    layout = manifest["layout"]
    assert isinstance(layout, dict)
    assert layout["installed"] == "cb/2"
    correction = manifest["runtimeCorrection"]
    assert isinstance(correction, dict)
    assert correction["acceptedRuntimeManifestSha256"] == (
        "cb5055580a28a0c97e50535a8317ea506081230b70e0099d8fe0194591e1c635"
    )
    correction_files = correction["files"]
    assert isinstance(correction_files, list)
    assert all(isinstance(record, dict) for record in correction_files)
    assert [record["path"] for record in correction_files if isinstance(record, dict)] == [
        "runtime/Lib/site-packages/voxleaf_tts/generated/__init__.py",
        "runtime/Lib/site-packages/voxleaf_tts/generated/protocol_schemas.py",
    ]
    assert manifest["requirements"] == {
        "measuredPeakDedicatedVramMiB": 3_644,
        "minimumAvailableDedicatedVramMiB": 4_668,
        "minimumAvailableRamMiB": 4_096,
        "minimumLogicalProcessors": 8,
        "minimumTotalDedicatedVramMiB": 5_632,
        "minimumTotalRamMiB": 24_576,
        "platform": "windows-x86_64",
        "precision": "bfloat16",
        "provider": "cuda",
        "recommendedTotalDedicatedVramMiB": 7_680,
    }


def test_v2_runtime_evidence_is_content_safe_and_arithmetically_closed() -> None:
    evidence = load_runtime_evidence()
    distribution = evidence["distribution"]
    measurements = evidence["measurements"]
    assert isinstance(distribution, dict)
    assert isinstance(measurements, dict)

    assert distribution["availability"] == "withheld"
    assert distribution["published"] is True
    assert distribution["withholdingReason"] == "clean-host-validation-pending"
    assert measurements["reproducibleBuildCount"] == 2
    assert measurements["totalInstalledBytes"] == 8_228_465_805


def test_current_runtime_evidence_reconciles_historical_bytes_with_manifest_authority() -> None:
    historical = load_runtime_evidence()
    current = load_current_runtime_evidence()
    historical_measurements = historical["measurements"]
    distribution = current["distribution"]
    measurements = current["measurements"]
    assert isinstance(historical_measurements, dict)
    assert isinstance(distribution, dict)
    assert isinstance(measurements, dict)
    assert measurements["totalInstalledBytes"] == 8_228_503_309
    assert measurements["fileCount"] == 12_671
    assert measurements["runtimeManifestSha256"] == (
        "1bca3c4e5706771877ad837398e7930206c8f74eb03e9804a093a4c78f0b6262"
    )
    assert (
        measurements["totalInstalledBytes"] - historical_measurements["totalInstalledBytes"]
        == 37_504
    )
    assert current["parts"] == historical["parts"]
    assert distribution["availability"] == "downloadable"
    assert "withholdingReason" not in distribution


def test_current_runtime_evidence_generator_is_idempotent_and_rejects_drift(tmp_path: Path) -> None:
    root = Path(__file__).resolve().parents[3]
    relative_files = (
        "services/tts/release/optional/chatterbox/source-manifest-v2.json",
        "services/tts/release/optional/chatterbox/optional-package-manifest-v2.json",
        "services/tts/release/optional/chatterbox/runtime-package-evidence-v2.json",
        "services/tts/release/profiles/chatterbox/requirements.lock",
    )
    for relative in relative_files:
        target = tmp_path / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((root / relative).read_bytes())

    generated = reconcile_runtime_evidence(tmp_path)
    first = generated.read_bytes()
    reconcile_runtime_evidence(tmp_path)
    assert generated.read_bytes() == first
    assert b"\r\n" not in first
    load_current_runtime_evidence(tmp_path)

    current = json.loads(generated.read_text(encoding="utf-8"))
    current["measurements"]["totalInstalledBytes"] += 1
    generated.write_text(json.dumps(current), encoding="utf-8")
    with pytest.raises(
        ReleaseChatterboxError,
        match="^chatterbox-current-runtime-evidence-invalid$",
    ):
        load_current_runtime_evidence(tmp_path)


def test_v2_runtime_evidence_rejects_measurement_drift(tmp_path: Path) -> None:
    root = Path(__file__).resolve().parents[3]
    relative_files = (
        "services/tts/release/optional/chatterbox/source-manifest-v2.json",
        "services/tts/release/optional/chatterbox/optional-package-manifest-v2.json",
        "services/tts/release/optional/chatterbox/runtime-package-evidence-v2.json",
        "services/tts/release/profiles/chatterbox/requirements.lock",
    )
    for relative in relative_files:
        target = tmp_path / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((root / relative).read_bytes())
    evidence_path = (
        tmp_path / "services/tts/release/optional/chatterbox/runtime-package-evidence-v2.json"
    )
    evidence = json.loads(evidence_path.read_text(encoding="utf-8"))
    evidence["measurements"]["peakStagingBytes"] += 1
    evidence_path.write_text(json.dumps(evidence), encoding="utf-8")

    with pytest.raises(
        ReleaseChatterboxError,
        match="^chatterbox-runtime-evidence-invalid$",
    ):
        load_runtime_evidence(tmp_path)


def test_published_withheld_manifest_rejects_runtime_identity_drift(tmp_path: Path) -> None:
    root = Path(__file__).resolve().parents[3]
    relative_files = (
        "services/tts/release/optional/chatterbox/source-manifest-v2.json",
        "services/tts/release/optional/chatterbox/optional-package-manifest-v2.json",
        "services/tts/release/profiles/chatterbox/requirements.lock",
    )
    for relative in relative_files:
        target = tmp_path / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((root / relative).read_bytes())
    manifest_path = (
        tmp_path / "services/tts/release/optional/chatterbox/optional-package-manifest-v2.json"
    )
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    manifest["runtimeArtifact"]["parts"][0]["sha256"] = "0" * 64
    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")

    with pytest.raises(
        ReleaseChatterboxError,
        match="^chatterbox-acquisition-manifest-invalid$",
    ):
        load_acquisition_manifest(tmp_path)


@pytest.mark.parametrize(
    "value",
    ["", ".", "../runtime/python.exe", "/runtime/python.exe", "C:/python.exe", "a\\b"],
)
def test_optional_runtime_paths_reject_unsafe_input(value: str) -> None:
    with pytest.raises(ReleaseChatterboxError, match="^chatterbox-package-invalid-path$"):
        safe_relative_path(value)


def test_optional_runtime_tree_accepts_only_the_exact_verified_files(tmp_path: Path) -> None:
    files = {
        "runtime/python.exe": b"python",
        "runtime/Lib/site-packages/voxleaf_tts/chatterbox_service.py": b"service",
        "models/s3gen.pt": b"model",
    }
    _write_tree(tmp_path, files)
    verify_package_tree(tmp_path, _manifest(files))

    (tmp_path / "stale.txt").write_text("stale", encoding="utf-8")
    with pytest.raises(ReleaseChatterboxError, match="^chatterbox-package-runtime-invalid$"):
        verify_package_tree(tmp_path, _manifest(files))


def test_generated_runtime_manifest_is_canonical_and_content_free(tmp_path: Path) -> None:
    _write_tree(
        tmp_path,
        {
            "runtime/python.exe": b"python",
            "models/t3_mtl23ls_v3.safetensors": b"model",
        },
    )
    rendered = render_manifest(build_runtime_manifest(tmp_path))
    manifest = json.loads(rendered)
    assert rendered.endswith(b"\n")
    assert manifest["serviceModule"] == "voxleaf_tts.chatterbox_service"
    assert b"private-user-name" not in rendered
    assert b"Desktop" not in rendered


def test_runtime_archive_is_split_into_bounded_ordered_verified_parts(tmp_path: Path) -> None:
    archive = tmp_path / "voxleaf-chatterbox-runtime-v2.zip"
    archive.write_bytes(b"abcdefghij")

    parts = split_archive(archive, maximum_part_bytes=4)

    assert [part.filename for part in parts] == [
        "voxleaf-chatterbox-runtime-v2.zip.part-001",
        "voxleaf-chatterbox-runtime-v2.zip.part-002",
        "voxleaf-chatterbox-runtime-v2.zip.part-003",
    ]
    assert [part.size_bytes for part in parts] == [4, 4, 2]
    assert b"".join((tmp_path / part.filename).read_bytes() for part in parts) == b"abcdefghij"
    assert all(
        part.sha256 == hashlib.sha256((tmp_path / part.filename).read_bytes()).hexdigest()
        for part in parts
    )


def test_safe_model_loader_requires_safetensors_and_weights_only(tmp_path: Path) -> None:
    loader = tmp_path / "chatterbox/mtl_tts.py"
    loader.parent.mkdir(parents=True)
    loader.write_text(
        "\n".join(
            (
                "import torch",
                "from safetensors.torch import load_file as load_safetensors",
                "a = torch.load('conds.pt', weights_only=True)",
                "b = torch.load('ve.pt', weights_only=True)",
                "c = torch.load('s3gen.pt', weights_only=True)",
                "d = load_safetensors('t3.safetensors')",
            )
        ),
        encoding="utf-8",
    )
    verify_safe_model_load_sites(tmp_path)

    loader.write_text("import torch\na = torch.load('conds.pt')\n", encoding="utf-8")
    with pytest.raises(ReleaseChatterboxError, match="^chatterbox-package-safe-loader-invalid$"):
        verify_safe_model_load_sites(tmp_path)


def test_embedded_runtime_enables_only_its_private_site_packages(tmp_path: Path) -> None:
    pth = tmp_path / "python312._pth"
    pth.write_text("python312.zip\n.\n#import site\n", encoding="utf-8")

    _configure_embedded_python(tmp_path)

    assert pth.read_text(encoding="utf-8") == (
        "python312.zip\n.\nLib\\site-packages\nimport site\n"
    )
