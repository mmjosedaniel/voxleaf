"""Admission authority for the reviewed certifi/Pillow runtime, preserving v2/v3."""

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

BUILD_COMMIT: Final = "702f80b5b688193e10ef58f9a5cbebb3a42a4090"
RELEASE_ID: Final = 418_976_062
PREPARATION_REVIEW: Final = "CB-V5-PREP-R2-20261020-ASTRA-230616Z"
ARCHIVE_SHA256: Final = "ed198de45e0cf105ff9822f560188f8f019a3f414c2c633e517be6ec2a5f8b15"
RUNTIME_SHA256: Final = "cffe626cc14fa259b2deaf9da7b7662bd51f5627d0ac7784d9ceea3fb9169418"
SOURCE_SHA256: Final = "b0891559238fbbbf65d22123ef9cdc9a1825ac3aacab3383d766b93c4ad77254"
LOCK_SHA256: Final = "b46f7291150378ee5f3b12812174ddabe34be03558e57b49b516629159df0217"
INSTALLED_BYTES: Final = 5_027_548_189
PARTS: Final = (
    (1_900_000_000, "78a336241fe2f659b178fd9f83962926b412009d9eb319cc3ab2b418c5db358a"),
    (1_900_000_000, "52cb68af37c112c0a6a6d5427611578d98c302fe1de3d01d8cd95c3f0b36cebf"),
    (1_231_103_825, "991dd0a932c1229ab7575af4730132bdfe1dd71ee57279c39475cb8700a9c598"),
)
AUTHORITY_DIRECTORY: Final = "services/tts/release/optional/chatterbox"


def security_acquisition_manifest(root: Path | None = None) -> dict[str, object]:
    base = root or repository_root()
    source = load_source_manifest(base, package_version="5")
    lock = cast(dict[str, object], source["chatterboxLock"])
    if (
        sha256_file(base / AUTHORITY_DIRECTORY / "source-manifest-v5.json") != SOURCE_SHA256
        or lock["sha256"] != LOCK_SHA256
        or sha256_file(base / cast(str, lock["path"])) != LOCK_SHA256
    ):
        raise ReleaseChatterboxError("chatterbox-security-preparation-drift")
    manifest = copy.deepcopy(successor_acquisition_manifest(base))
    cast(dict[str, object], manifest["identity"])["packageVersion"] = "5"
    cast(dict[str, object], manifest["layout"])["installed"] = "cb/5"
    runtime = cast(dict[str, object], manifest["runtime"])
    runtime["releaseTag"] = "chatterbox-runtime-v5"
    runtime["dependencyLock"] = source["chatterboxLock"]
    manifest["runtimeArtifact"] = {
        "archiveSha256": ARCHIVE_SHA256,
        "installedBytes": INSTALLED_BYTES,
        "runtimeManifestSha256": RUNTIME_SHA256,
        "parts": [
            {
                "downloadBytes": size,
                "filename": f"voxleaf-chatterbox-runtime-v5.zip.part-{index:03}",
                "sha256": digest,
                "url": (
                    "https://github.com/mmjosedaniel/voxleaf/releases/download/"
                    f"chatterbox-runtime-v5/voxleaf-chatterbox-runtime-v5.zip.part-{index:03}"
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
        receipt.get("tag_name") != "chatterbox-runtime-v5"
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
        "schemaVersion": 5,
        "authority": {
            "runtimeBuildCommitSha": BUILD_COMMIT,
            "preparationReview": PREPARATION_REVIEW,
            "sourceManifestSha256": SOURCE_SHA256,
            "dependencyLockSha256": LOCK_SHA256,
            "publication": "publication-v5.json",
        },
        "distribution": {
            "published": True,
            "prerelease": True,
            "runtimeReleaseTag": "chatterbox-runtime-v5",
            "publishedAt": publication["published_at"],
            "releaseId": publication["id"],
        },
        "measurements": {
            "archiveSha256": ARCHIVE_SHA256,
            "runtimeManifestSha256": RUNTIME_SHA256,
            "runtimeArchiveBytes": sum(size for size, _ in PARTS),
            "runtimeInstalledBytes": INSTALLED_BYTES,
            "fileCount": 13_083,
            "reproducibility": "one-exact-reviewed-assembly-no-cross-environment-claim",
            "acquisition": manifest["measurements"],
        },
        "measurementProvenance": {
            "runtimeIdentityAndSizes": "reviewed-local-build-evidence-v5-and-publication-readback",
            "coldStartSeconds": "historical-v2-profile-policy-not-new-v5-measurement",
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
        ("publication-v5.json", receipt),
        ("optional-package-manifest-v5.json", manifest),
        ("runtime-package-evidence-v5.json", _runtime_evidence(receipt, manifest)),
    ):
        (destination / name).write_bytes(render_successor_authority(content))


def check_security_authority(root: Path | None = None) -> None:
    base = root or repository_root()
    destination = base / AUTHORITY_DIRECTORY
    manifest = security_acquisition_manifest(base)
    receipt = _publication_record(
        _load_json(destination / "publication-v5.json", "chatterbox-publication-invalid"), manifest
    )
    for name, expected in (
        ("publication-v5.json", receipt),
        ("optional-package-manifest-v5.json", manifest),
        ("runtime-package-evidence-v5.json", _runtime_evidence(receipt, manifest)),
    ):
        if (destination / name).read_bytes() != render_successor_authority(expected):
            raise ReleaseChatterboxError("chatterbox-security-authority-stale")
