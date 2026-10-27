"""Exact publication, current admission and immutable historical-authority cases."""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import cast

import pytest

from voxleaf_tts import release_chatterbox
from voxleaf_tts.packaging import chatterbox_v6_authority
from voxleaf_tts.packaging import chatterbox_v7_authority as security
from voxleaf_tts.packaging.chatterbox_authority import successor_acquisition_manifest
from voxleaf_tts.packaging.chatterbox_integrity import ReleaseChatterboxError


def test_security_admission_preserves_models_and_bounds_but_replaces_unsafe_runtime() -> None:
    old = successor_acquisition_manifest()
    new = security.security_acquisition_manifest()
    for key in ("modelArtifacts", "limits", "requirements", "licences", "languages", "provenance"):
        assert new[key] == old[key]
    assert cast(dict[str, object], new["identity"])["packageVersion"] == "7"
    assert cast(dict[str, object], new["layout"])["installed"] == "cb/7"
    assert new["measurements"] == {
        "coldStartSeconds": 83,
        "downloadBytes": 8_240_315_465,
        "installedBytes": 8_236_757_393,
        "temporaryBytes": 13_271_679_006,
        "minimumFreeBytes": 20_000_000_000,
    }
    runtime = cast(dict[str, object], new["runtime"])
    old_runtime = cast(dict[str, object], old["runtime"])
    assert runtime["adapterSha256"] == old_runtime["adapterSha256"]
    assert runtime["serviceSha256"] == old_runtime["serviceSha256"]
    assert "runtimeCorrection" not in new


@pytest.fixture
def publication(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> tuple[Path, Path]:
    manifest = security.security_acquisition_manifest()
    monkeypatch.setattr(security, "security_acquisition_manifest", lambda _root: manifest)
    destination = tmp_path / security.AUTHORITY_DIRECTORY
    destination.mkdir(parents=True)
    (destination / "optional-package-manifest-v3.json").write_bytes(b"historical sentinel")
    (destination / "optional-package-manifest-v6.json").write_bytes(b"v6 sentinel")
    parts = cast(dict[str, object], manifest["runtimeArtifact"])["parts"]
    receipt = {
        "id": security.RELEASE_ID,
        "tag_name": "chatterbox-runtime-v7",
        "target_commitish": security.BUILD_COMMIT,
        "draft": False,
        "prerelease": True,
        # Synthetic test metadata, never used as a publication receipt.
        "published_at": "2026-10-20T00:00:00Z",
        "assets": [
            {
                "name": part["filename"],
                "size": part["downloadBytes"],
                "digest": f"sha256:{part['sha256']}",
                "browser_download_url": part["url"],
                "state": "uploaded",
            }
            for part in cast(list[dict[str, object]], parts)
        ],
    }
    path = tmp_path / "synthetic-publication.json"
    path.write_text(json.dumps(receipt))
    return path, destination


@pytest.mark.parametrize(
    "mutation",
    [
        "draft",
        "release",
        "release-id",
        "commit",
        "tag",
        "timestamp",
        "missing",
        "extra",
        "duplicate",
        "hash",
        "size",
        "origin",
        "incomplete",
    ],
)
def test_unverified_publication_cannot_write_any_authority(
    tmp_path: Path, publication: tuple[Path, Path], mutation: str
) -> None:
    path, destination = publication
    receipt = json.loads(path.read_text())
    if mutation == "draft":
        receipt["draft"] = True
    elif mutation == "release":
        receipt["prerelease"] = False
    elif mutation == "release-id":
        receipt["id"] += 1
    elif mutation == "commit":
        receipt["target_commitish"] = "main"
    elif mutation == "tag":
        receipt["tag_name"] = "chatterbox-runtime-v3"
    elif mutation == "timestamp":
        receipt["published_at"] = None
    elif mutation == "missing":
        receipt["assets"].pop()
    elif mutation == "extra":
        receipt["assets"].append(copy.deepcopy(receipt["assets"][0]))
    elif mutation == "duplicate":
        receipt["assets"][1] = copy.deepcopy(receipt["assets"][0])
    elif mutation == "hash":
        receipt["assets"][0]["digest"] = "sha256:" + "0" * 64
    elif mutation == "size":
        receipt["assets"][0]["size"] -= 1
    elif mutation == "origin":
        receipt["assets"][0]["browser_download_url"] = "https://example.invalid/part"
    else:
        receipt["assets"][0]["state"] = "starter"
    path.write_text(json.dumps(receipt))
    with pytest.raises(ReleaseChatterboxError, match="publication-invalid"):
        security.write_security_authority(path, tmp_path)
    assert sorted(file.name for file in destination.iterdir()) == [
        "optional-package-manifest-v3.json",
        "optional-package-manifest-v6.json",
    ]
    assert (destination / "optional-package-manifest-v6.json").read_bytes() == b"v6 sentinel"
    assert (
        destination / "optional-package-manifest-v3.json"
    ).read_bytes() == b"historical sentinel"


def test_verified_publication_generates_exact_authority_and_detects_drift(
    tmp_path: Path, publication: tuple[Path, Path]
) -> None:
    path, destination = publication
    security.write_security_authority(path, tmp_path)
    security.check_security_authority(tmp_path)
    assert (destination / "optional-package-manifest-v6.json").read_bytes() == b"v6 sentinel"
    assert (
        destination / "optional-package-manifest-v3.json"
    ).read_bytes() == b"historical sentinel"
    evidence = json.loads((destination / "runtime-package-evidence-v7.json").read_text())
    assert evidence["authority"]["runtimeBuildCommitSha"] == security.BUILD_COMMIT
    assert evidence["measurements"]["fileCount"] == 13_092
    active = destination / "optional-package-manifest-v7.json"
    value = json.loads(active.read_text())
    value["identity"]["packageVersion"] = "3"
    active.write_text(json.dumps(value))
    with pytest.raises(ReleaseChatterboxError, match="security-authority-stale"):
        security.check_security_authority(tmp_path)


def test_changed_preparation_cannot_generate_acquisition(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(security, "sha256_file", lambda _path: "0" * 64)
    with pytest.raises(ReleaseChatterboxError, match="preparation-drift"):
        security.security_acquisition_manifest()


@pytest.mark.parametrize("command", ["check-acquisition", "write-acquisition"])
def test_v7_cli_dispatch_never_uses_historical_authority(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, command: str
) -> None:
    calls: list[str] = []

    def unexpected(*_args: object) -> None:
        raise AssertionError("historical-authority-reached")

    monkeypatch.setattr(chatterbox_v6_authority, "check_security_authority", unexpected)
    monkeypatch.setattr(chatterbox_v6_authority, "write_security_authority", unexpected)
    monkeypatch.setattr(release_chatterbox, "check_security_authority", unexpected)
    monkeypatch.setattr(release_chatterbox, "write_security_authority", unexpected)
    monkeypatch.setattr(security, "check_security_authority", lambda: calls.append("check"))
    monkeypatch.setattr(security, "write_security_authority", lambda _path: calls.append("write"))
    arguments = [command, "--package-version", "7"]
    if command == "write-acquisition":
        arguments += ["--publication", str(tmp_path / "receipt.json")]
    assert release_chatterbox.main(arguments) == 0
    assert calls == ["check" if command == "check-acquisition" else "write"]
