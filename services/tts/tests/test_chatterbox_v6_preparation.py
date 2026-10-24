"""Additive v6 preparation must not rewrite or admit historical runtime bytes."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

import pytest

from voxleaf_tts import release_chatterbox
from voxleaf_tts.packaging import chatterbox_authority as authority
from voxleaf_tts.packaging.chatterbox_integrity import (
    PackageLayout,
    ReleaseChatterboxError,
    repository_root,
)
from voxleaf_tts.packaging.chatterbox_sources import resolve_runtime_sources


def test_v6_is_an_independent_two_pin_hashed_successor(tmp_path: Path) -> None:
    layout = PackageLayout("6")
    assert layout.lock_path == "services/tts/release/profiles/chatterbox-v6/requirements.lock"
    assert layout.dist(tmp_path, tmp_path / "outputs") == tmp_path / "outputs/v6"
    assert layout.source_manifest == "source-manifest-v6.json"
    with pytest.raises(ReleaseChatterboxError, match="output-root-invalid"):
        layout.dist(tmp_path, Path("relative"))
    root = repository_root()
    pins = []
    for version in ("5", "6"):
        text = (root / PackageLayout(version).lock_path).read_text()
        pins.append(dict(re.findall(r"^([a-z0-9-]+)(==[^\s]+| @ [^\s]+)", text, re.M)))
        lines = text.splitlines()
        for index, line in enumerate(lines):
            if re.match(r"^[a-z0-9-]+(?:==| @ )", line):
                assert lines[index + 1].lstrip().startswith("--hash=sha256:")
    old, new = pins
    assert len(old) == len(new) == 79
    assert old.keys() == new.keys()
    assert {name: value for name, value in new.items() if value != old[name]} == {
        "filelock": "==4.2.1",
        "setuptools": "==84.1.0",
    }


@pytest.mark.parametrize("cli", [False, True])
def test_v6_no_sync_fails_before_source_or_output(
    monkeypatch: pytest.MonkeyPatch, cli: bool
) -> None:
    def unexpected_root() -> Path:
        raise AssertionError("source-or-output-access-before-sync-guard")

    monkeypatch.setattr(release_chatterbox, "repository_root", unexpected_root)
    with pytest.raises(ReleaseChatterboxError, match="security-sync-required"):
        if cli:
            release_chatterbox.main(["build", "--package-version", "6", "--no-sync"])
        else:
            release_chatterbox.build_package(package_version="6", synchronise=False)


@pytest.mark.parametrize(
    "command", ["check-acquisition", "write-acquisition", "reconcile-evidence"]
)
def test_v6_unpublished_commands_cannot_fall_back_to_historical_authority(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str], command: str
) -> None:
    def unexpected_authority() -> None:
        raise AssertionError("historical-authority-reached")

    monkeypatch.setattr(release_chatterbox, "check_security_authority", unexpected_authority)
    monkeypatch.setattr(release_chatterbox, "load_acquisition_manifest", unexpected_authority)
    with pytest.raises(SystemExit) as caught:
        release_chatterbox.main([command, "--package-version", "6"])
    assert caught.value.code == 2
    assert "version 6 is unpublished and has no acquisition authority" in capsys.readouterr().err


def test_v6_preserves_frozen_modules_models_and_python() -> None:
    root = repository_root()
    old = authority.load_source_manifest(root, package_version="5")
    new = authority.load_source_manifest(root, package_version="6")
    for key in ("modelFiles", "python", "runtimeModules", "provenance"):
        assert new[key] == old[key]
    assert new["packageId"] == "voxleaf-chatterbox-v6"
    release = new["runtimeRelease"]
    assert isinstance(release, dict)
    assert release["tag"] == "chatterbox-runtime-v6"
    assert resolve_runtime_sources(root, new) == resolve_runtime_sources(root, old)


@pytest.mark.parametrize("drift", ["model", "lock"])
def test_v6_source_rejects_drift_without_rewriting_v5(tmp_path: Path, drift: str) -> None:
    root = repository_root()
    relatives = [PackageLayout(version).lock_path for version in ("2", "3", "5", "6")]
    relatives += [
        f"services/tts/release/optional/chatterbox/source-manifest-v{version}.json"
        for version in ("2", "3", "5", "6")
    ]
    for relative in relatives:
        target = tmp_path / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(root / relative, target)
    historical = tmp_path / "services/tts/release/optional/chatterbox/source-manifest-v5.json"
    original = historical.read_bytes()
    recipe = authority.write_security_source_manifest(tmp_path, package_version="6")
    authority.load_source_manifest(tmp_path, package_version="6")
    assert historical.read_bytes() == original
    if drift == "model":
        manifest = json.loads(recipe.read_bytes())
        manifest["modelFiles"][0]["sha256"] = "a" * 64
        recipe.write_text(json.dumps(manifest))
    else:
        lock = tmp_path / PackageLayout("6").lock_path
        lock.write_bytes(lock.read_bytes() + b"\n# drift\n")
    with pytest.raises(ReleaseChatterboxError, match="source-manifest-invalid"):
        authority.load_source_manifest(tmp_path, package_version="6")


def test_v6_sync_requires_its_exact_hashed_lock(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    calls: list[list[str]] = []

    def run(command: list[str], **kwargs: object) -> None:
        calls.append(command)

    monkeypatch.setattr("voxleaf_tts.release_chatterbox.subprocess.run", run)
    release_chatterbox._synchronise_environment(
        tmp_path, tmp_path / "isolated-environment", package_version="6"
    )
    assert "--require-hashes" in calls[1]
    assert str(tmp_path / PackageLayout("6").lock_path) in calls[1]
