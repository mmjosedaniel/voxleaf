"""Admission authority for the reviewed filelock/setuptools runtime, preserving v2/v3/v5."""

from __future__ import annotations

import copy
from datetime import datetime
from pathlib import Path
from typing import Final, cast

from .chatterbox_authority import (
    load_source_manifest,
    render_successor_authority,
    successor_acquisition_manifest,
)
from .chatterbox_integrity import (
    ReleaseChatterboxError,
    _load_json,
    repository_root,
    sha256_file,
)

BUILD_COMMIT: Final = "e46eb99c542b27a891aae6ee20d68c525d79f5f1"
RELEASE_ID: Final = 422_467_861
PREPARATION_REVIEW: Final = "CB-V6-PREPARATION-R2-ASTRA-20261024T022500Z"
ARCHIVE_SHA256: Final = "2567feb51cfe7816281b0eb936c4358dd980458def8ddd5508ee603930aecafb"
RUNTIME_SHA256: Final = "bb902682e366e119e3a7cdc992440b017bd6bd96cf328c3b0863a4eb1eb024e0"
SOURCE_SHA256: Final = "ebc26b77617350b504e2b9691cf54f0a7c32d0148d0c3e19dcbf8a7677ea9864"
LOCK_SHA256: Final = "2b0b51a5f8374aec007e3f3b9a758dff4e46611ba1f19169c96da179c8f086b8"
INSTALLED_BYTES: Final = 5_027_792_395
PARTS: Final = (
    (1_900_000_000, "3963d4091e1c5baeb7485589251330e69af0dd06ff9a4c0f0561fcde993ab73a"),
    (1_900_000_000, "f99c82953ea5bce559b1e00efcee09d264ff2ce369eb0ee622b6595706cd3676"),
    (1_231_350_467, "5312398ef84a43d4c0dd8eec30d878e52bbf4390108b13eb7a52e4de38aca56e"),
)
AUTHORITY_DIRECTORY: Final = "services/tts/release/optional/chatterbox"


def security_acquisition_manifest(root: Path | None = None) -> dict[str, object]:
    base = root or repository_root()
    source = load_source_manifest(base, package_version="6")
    lock = cast(dict[str, object], source["chatterboxLock"])
    if (
        sha256_file(base / AUTHORITY_DIRECTORY / "source-manifest-v6.json") != SOURCE_SHA256
        or lock["sha256"] != LOCK_SHA256
        or sha256_file(base / cast(str, lock["path"])) != LOCK_SHA256
    ):
        raise ReleaseChatterboxError("chatterbox-security-preparation-drift")
    manifest = copy.deepcopy(successor_acquisition_manifest(base))
    cast(dict[str, object], manifest["identity"])["packageVersion"] = "6"
    cast(dict[str, object], manifest["layout"])["installed"] = "cb/6"
    runtime = cast(dict[str, object], manifest["runtime"])
    runtime["releaseTag"] = "chatterbox-runtime-v6"
    runtime["dependencyLock"] = source["chatterboxLock"]
    manifest["runtimeArtifact"] = {
        "archiveSha256": ARCHIVE_SHA256,
        "installedBytes": INSTALLED_BYTES,
        "runtimeManifestSha256": RUNTIME_SHA256,
        "parts": [
            {
                "downloadBytes": size,
                "filename": f"voxleaf-chatterbox-runtime-v6.zip.part-{index:03}",
                "sha256": digest,
                "url": (
                    "https://github.com/mmjosedaniel/voxleaf/releases/download/"
                    f"chatterbox-runtime-v6/voxleaf-chatterbox-runtime-v6.zip.part-{index:03}"
                ),
            }
            for index, (size, digest) in enumerate(PARTS, start=1)
        ],
    }
    model_bytes = sum(
        cast(int, model["sizeBytes"])
        for model in cast(list[dict[str, object]], source["modelFiles"])
    )
    archive_bytes = sum(size for size, _ in PARTS)
    measurements = cast(dict[str, object], manifest["measurements"])
    measurements.update(
        downloadBytes=archive_bytes + model_bytes,
        installedBytes=INSTALLED_BYTES + model_bytes,
        temporaryBytes=2 * archive_bytes + model_bytes,
    )
    return manifest


def _publication_record(
    receipt: dict[str, object], manifest: dict[str, object]
) -> dict[str, object]:
    """Keep only verified public metadata; reject drafts and mismatched assets."""

    invalid = "chatterbox-publication-invalid"
    published_at = receipt.get("published_at")
    if (
        receipt.get("tag_name") != "chatterbox-runtime-v6"
        or receipt.get("target_commitish") != BUILD_COMMIT
        or receipt.get("draft") is not False
        or receipt.get("prerelease") is not True
        or type(receipt.get("id")) is not int
        or receipt["id"] != RELEASE_ID
        or not isinstance(published_at, str)
    ):
        raise ReleaseChatterboxError(invalid)
    try:
        datetime.strptime(published_at, "%Y-%m-%dT%H:%M:%SZ")
    except ValueError:
        raise ReleaseChatterboxError(invalid) from None
    assets = receipt.get("assets")
    parts = cast(dict[str, object], manifest["runtimeArtifact"])["parts"]
    if not isinstance(assets, list) or len(assets) != len(PARTS):
        raise ReleaseChatterboxError(invalid)
    expected = [
        {
            "name": part["filename"],
            "size": part["downloadBytes"],
            "digest": f"sha256:{part['sha256']}",
            "browser_download_url": part["url"],
            "state": "uploaded",
        }
        for part in cast(list[dict[str, object]], parts)
    ]
    actual: list[dict[str, object]] = []
    for asset in assets:
        if not isinstance(asset, dict):
            raise ReleaseChatterboxError(invalid)
        actual.append({key: asset.get(key) for key in expected[0]})
    if sorted(actual, key=lambda asset: str(asset["name"])) != expected:
        raise ReleaseChatterboxError(invalid)
    return {
        "id": receipt["id"],
        "tag_name": receipt["tag_name"],
        "target_commitish": receipt["target_commitish"],
        "draft": False,
        "prerelease": True,
        "published_at": published_at,
        "assets": expected,
    }


def _runtime_evidence(
    publication: dict[str, object], manifest: dict[str, object]
) -> dict[str, object]:
    return {
        "schemaVersion": 6,
        "authority": {
            "runtimeBuildCommitSha": BUILD_COMMIT,
            "preparationReview": PREPARATION_REVIEW,
            "sourceManifestSha256": SOURCE_SHA256,
            "dependencyLockSha256": LOCK_SHA256,
            "publication": "publication-v6.json",
        },
        "distribution": {
            "published": True,
            "prerelease": True,
            "runtimeReleaseTag": "chatterbox-runtime-v6",
            "publishedAt": publication["published_at"],
            "releaseId": publication["id"],
        },
        "measurements": {
            "archiveSha256": ARCHIVE_SHA256,
            "runtimeManifestSha256": RUNTIME_SHA256,
            "runtimeArchiveBytes": sum(size for size, _ in PARTS),
            "runtimeInstalledBytes": INSTALLED_BYTES,
            "fileCount": 13_092,
            "reproducibility": "one-exact-reviewed-assembly-no-cross-environment-claim",
            "acquisition": manifest["measurements"],
        },
        "measurementProvenance": {
            "runtimeIdentityAndSizes": "reviewed-local-build-evidence-v6-and-publication-readback",
            "coldStartSeconds": "historical-v2-profile-policy-not-new-v6-measurement",
            "hardwareGate": "unchanged-ADR-0052-profile-policy-requires-installed-validation",
            "installedAcceptance": "tracked-separately-in-security-refresh-ExecPlan",
        },
    }


def write_security_authority(publication: Path, root: Path | None = None) -> None:
    base = root or repository_root()
    manifest = security_acquisition_manifest(base)
    receipt = _publication_record(
        _load_json(publication, "chatterbox-publication-invalid"), manifest
    )
    destination = base / AUTHORITY_DIRECTORY
    for name, content in (
        ("publication-v6.json", receipt),
        ("optional-package-manifest-v6.json", manifest),
        ("runtime-package-evidence-v6.json", _runtime_evidence(receipt, manifest)),
    ):
        (destination / name).write_bytes(render_successor_authority(content))


def check_security_authority(root: Path | None = None) -> None:
    base = root or repository_root()
    destination = base / AUTHORITY_DIRECTORY
    manifest = security_acquisition_manifest(base)
    receipt = _publication_record(
        _load_json(destination / "publication-v6.json", "chatterbox-publication-invalid"), manifest
    )
    for name, expected in (
        ("publication-v6.json", receipt),
        ("optional-package-manifest-v6.json", manifest),
        ("runtime-package-evidence-v6.json", _runtime_evidence(receipt, manifest)),
    ):
        if (destination / name).read_bytes() != render_successor_authority(expected):
            raise ReleaseChatterboxError("chatterbox-security-authority-stale")
