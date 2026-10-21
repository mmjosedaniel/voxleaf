from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

import pytest

from voxleaf_tts import release_chatterbox
from voxleaf_tts.packaging.chatterbox_authority import (
    load_source_manifest,
    security_source_manifest,
    write_security_source_manifest,
)
from voxleaf_tts.packaging.chatterbox_integrity import (
    PackageLayout,
    ReleaseChatterboxError,
    repository_root,
)
from voxleaf_tts.packaging.chatterbox_sources import resolve_runtime_sources


def test_security_successor_has_an_independent_lock_and_output(tmp_path: Path) -> None:
    successor = PackageLayout("5")
    assert successor.lock_path == "services/tts/release/profiles/chatterbox-v5/requirements.lock"
    assert successor.dist(tmp_path) == PackageLayout("3").dist(tmp_path).parent / "v5"
    assert successor.source_manifest == "source-manifest-v5.json"
    assert PackageLayout("4").lock_path == PackageLayout("3").lock_path


def test_security_graph_changes_exactly_the_two_vulnerable_pins() -> None:
    root = repository_root()

    def pins(version: str) -> dict[str, str]:
        lock = root / f"services/tts/release/profiles/chatterbox-v{version}/requirements.lock"
        return dict(re.findall(r"^([a-z0-9-]+)(==[^\s]+| @ [^\s]+)", lock.read_text(), re.M))

    old, new = pins("3"), pins("5")
    assert len(old) == len(new) == 79
    assert old.keys() == new.keys()
    assert {name: version for name, version in new.items() if old[name] != version} == {
        "certifi": "==2026.10.19",
        "pillow": "==13.0.0",
    }
    lines = (root / PackageLayout("5").lock_path).read_text().splitlines()
    for index, line in enumerate(lines):
        if re.match(r"^[a-z0-9-]+(?:==| @ )", line):
            assert lines[index + 1].lstrip().startswith("--hash=sha256:")


def test_short_output_root_is_explicit_absolute_and_versioned(tmp_path: Path) -> None:
    output = tmp_path / "short"
    assert PackageLayout("5").dist(tmp_path, output) == output / "v5"
    assert PackageLayout("4").dist(tmp_path, output) == output / "v4"
    with pytest.raises(ReleaseChatterboxError, match="output-root-invalid"):
        PackageLayout("5").dist(tmp_path, Path("relative"))


def test_output_override_cannot_affect_source_authority() -> None:
    with pytest.raises(SystemExit):
        release_chatterbox.main(["write-source", "--package-version", "5", "--output-root", "."])


@pytest.mark.parametrize("cli", [False, True])
def test_security_successor_requires_fresh_sync(monkeypatch: pytest.MonkeyPatch, cli: bool) -> None:
    def unexpected_root() -> Path:
        raise AssertionError("unsafe-build-reached-source-or-output")

    monkeypatch.setattr(release_chatterbox, "repository_root", unexpected_root)
    with pytest.raises(ReleaseChatterboxError, match="security-sync-required"):
        if cli:
            release_chatterbox.main(["build", "--package-version", "5", "--no-sync"])
        else:
            release_chatterbox.build_package(package_version="5", synchronise=False)


def test_security_recipe_preserves_published_runtime_modules_and_models() -> None:
    root = repository_root()
    historical = load_source_manifest(root, package_version="3")
    successor = security_source_manifest(root)
    assert successor["modelFiles"] == historical["modelFiles"]
    assert successor["python"] == historical["python"]
    assert successor["runtimeModules"] == historical["runtimeModules"]
    assert successor["provenance"] == historical["provenance"]
    release = successor["runtimeRelease"]
    assert isinstance(release, dict)
    assert release["tag"] == "chatterbox-runtime-v5"
    assert resolve_runtime_sources(root, successor) == resolve_runtime_sources(root, historical)


def test_security_recipe_rejects_changed_models_or_lock(tmp_path: Path) -> None:
    root = repository_root()
    paths = [PackageLayout(version).lock_path for version in ("2", "3", "5")]
    paths += [
        f"services/tts/release/optional/chatterbox/{PackageLayout(version).source_manifest}"
        for version in ("2", "3")
    ]
    for relative in paths:
        target = tmp_path / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(root / relative, target)
    recipe = write_security_source_manifest(tmp_path)
    original = recipe.read_bytes()
    load_source_manifest(tmp_path, package_version="5")
    manifest = json.loads(original)
    manifest["modelFiles"][0]["sha256"] = "a" * 64
    recipe.write_text(json.dumps(manifest))
    with pytest.raises(ReleaseChatterboxError, match="source-manifest-invalid"):
        load_source_manifest(tmp_path, package_version="5")
    recipe.write_bytes(original)
    lock = tmp_path / PackageLayout("5").lock_path
    lock.write_bytes(lock.read_bytes() + b"\n# drift\n")
    with pytest.raises(ReleaseChatterboxError, match="source-manifest-invalid"):
        load_source_manifest(tmp_path, package_version="5")


def test_security_sync_requires_hashes(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[list[str]] = []

    def run(command: list[str], **kwargs: object) -> None:
        calls.append(command)

    monkeypatch.setattr("voxleaf_tts.release_chatterbox.subprocess.run", run)
    release_chatterbox._synchronise_environment(
        tmp_path, tmp_path / "environment", package_version="5"
    )
    assert "--require-hashes" in calls[1]
    assert str(tmp_path / PackageLayout("5").lock_path) in calls[1]
