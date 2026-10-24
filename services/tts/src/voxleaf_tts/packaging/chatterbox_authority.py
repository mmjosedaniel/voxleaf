"""Versioned Chatterbox source, acquisition and release-evidence authority."""

from __future__ import annotations

import copy
import hashlib
import json
from collections.abc import Mapping
from pathlib import Path
from typing import Final, Literal, cast

from .chatterbox_integrity import (
    MAXIMUM_PART_BYTES,
    PackageLayout,
    PackageVersion,
    ReleaseChatterboxError,
    _array,
    _artifact,
    _commit_sha,
    _load_json,
    _object,
    _positive,
    _sha256,
    _text,
    render_manifest,
    repository_root,
    safe_relative_path,
    sha256_file,
)
from .chatterbox_sources import LOCAL_RUNTIME_MODULES, historical_sources

HISTORICAL_INSTALLED_BYTES: Final = 8_228_465_805
INSTALLED_BYTES_CORRECTION: Final = 37_504
CURRENT_INSTALLED_BYTES: Final = HISTORICAL_INSTALLED_BYTES + INSTALLED_BYTES_CORRECTION
CURRENT_DOWNLOAD_BYTES: Final = 8_231_893_387
CURRENT_TEMPORARY_BYTES: Final = 13_254_834_850
CURRENT_MINIMUM_FREE_BYTES: Final = 20_000_000_000
REPRESENTATIVE_COLD_START_ROUNDED_SECONDS: Final = 83
CHATTERBOX_SOURCE: Final = (
    "https://github.com/resemble-ai/chatterbox/tree/5de7a54aa4e5e2baadb0182dde554908b48b85c2"
)
MODEL_CARD_SOURCE: Final = (
    "https://huggingface.co/ResembleAI/chatterbox/tree/5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
)
PERTH_SOURCE: Final = (
    "https://github.com/resemble-ai/perth/tree/ce86c2b567491eef3108ed3c137bd7bf1ddda52e"
)
SUCCESSOR_BUILD_COMMIT: Final = "998c7b24cda7e969e9ed0344f348506bf38af3b0"
SUCCESSOR_ARCHIVE_SHA256: Final = "87bfb2baae44cf13daae15328f8287cbee60e6782f04735d814d2ed849e8c45c"
SUCCESSOR_RUNTIME_SHA256: Final = "470ec7e8a6fa1e91f9831e42de7988249220b51d4ecd4352452f3c70b2b6084a"
SUCCESSOR_PARTS: Final = (
    (1_900_000_000, "b7d4939d4b862b8f4d5ebafcba3289716f27641b846598032b8426a3d7c44196"),
    (1_900_000_000, "a882c2e06b6de1dd690328fe7793aa99ef03ac53f510e06be1740dad4e839c3d"),
    (1_230_981_677, "11c2a048187cf501c6ccf6a8ae288d6a7c14fb7e1cc5aedf7a10b0da228f1606"),
)


def load_source_manifest(
    root: Path | None = None, *, package_version: PackageVersion = "2"
) -> dict[str, object]:
    base = root or repository_root()
    layout = PackageLayout(package_version)
    manifest = _load_json(
        base / f"services/tts/release/optional/chatterbox/{layout.source_manifest}",
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
        "runtimeRelease",
        "provenance",
    }
    if set(manifest) != expected:
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    if (
        manifest["schemaVersion"] != 2
        or manifest["packageId"] != layout.directory
        or manifest["packageVersion"] != layout.version
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
    if lock["path"] != layout.lock_path:
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
        if set(artifact) != {"filename", "sha256", "sizeBytes", "url"}:
            raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
        filename = _text(artifact["filename"], "chatterbox-package-source-manifest-invalid")
        safe_relative_path(filename)
        names.add(filename)
        _sha256(artifact["sha256"], "chatterbox-package-source-manifest-invalid")
        _positive(artifact["sizeBytes"], "chatterbox-package-source-manifest-invalid")
        expected_url = (
            "https://huggingface.co/ResembleAI/chatterbox/resolve/"
            "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18/"
            f"{filename}"
        )
        if artifact["url"] != expected_url:
            raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
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
    release = _object(manifest["runtimeRelease"], "chatterbox-package-source-manifest-invalid")
    expected_release: dict[str, object] = {
        "maximumPartBytes": MAXIMUM_PART_BYTES,
        "maximumParts": 4,
        "repository": "mmjosedaniel/voxleaf",
        "tag": f"chatterbox-runtime-v{layout.version}",
    }
    if package_version == "4":
        expected_release = {
            "maximumPartBytes": MAXIMUM_PART_BYTES,
            "maximumParts": 4,
            "published": False,
            "admitted": False,
        }
    if release != expected_release:
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    if package_version == "3" and manifest != successor_source_manifest(base):
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    if package_version == "4" and manifest != local_source_manifest(base):
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    if package_version in {"5", "6"} and manifest != security_source_manifest(
        base, package_version=package_version
    ):
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    return manifest


def successor_source_manifest(root: Path | None = None) -> dict[str, object]:
    """Derive v3 from immutable v2 provenance and the measured successor lock."""

    base = root or repository_root()
    layout = PackageLayout("3")
    manifest = copy.deepcopy(load_source_manifest(base))
    manifest["packageId"] = layout.directory
    manifest["packageVersion"] = layout.version
    manifest["chatterboxLock"] = {
        "path": layout.lock_path,
        "sha256": sha256_file(base / layout.lock_path),
    }
    modules = cast(list[str], manifest["runtimeModules"])
    manifest["runtimeModules"] = modules + [
        "generated/__init__.py",
        "generated/protocol_schemas.py",
    ]
    release = cast(dict[str, object], manifest["runtimeRelease"])
    release["tag"] = "chatterbox-runtime-v3"
    return manifest


def write_successor_source_manifest(root: Path | None = None) -> Path:
    base = root or repository_root()
    target = base / ("services/tts/release/optional/chatterbox/source-manifest-v3.json")
    target.write_bytes(render_manifest(successor_source_manifest(base)))
    return target


def security_source_manifest(
    root: Path | None = None, *, package_version: Literal["5", "6"] = "5"
) -> dict[str, object]:
    """Keep the frozen runtime/model closure with an independent security lock."""

    base = root or repository_root()
    if package_version not in {"5", "6"}:
        raise ReleaseChatterboxError("chatterbox-package-version-invalid")
    layout = PackageLayout(package_version)
    manifest = copy.deepcopy(
        load_source_manifest(base, package_version="3" if package_version == "5" else "5")
    )
    manifest["packageId"] = layout.directory
    manifest["packageVersion"] = layout.version
    manifest["chatterboxLock"] = {
        "path": layout.lock_path,
        "sha256": sha256_file(base / layout.lock_path),
    }
    cast(dict[str, object], manifest["runtimeRelease"])["tag"] = (
        f"chatterbox-runtime-v{package_version}"
    )
    return manifest


def write_security_source_manifest(
    root: Path | None = None, *, package_version: Literal["5", "6"] = "5"
) -> Path:
    base = root or repository_root()
    manifest = security_source_manifest(base, package_version=package_version)
    target = (
        base / f"services/tts/release/optional/chatterbox/source-manifest-v{package_version}.json"
    )
    target.write_bytes(render_manifest(manifest))
    return target


def local_source_manifest(root: Path | None = None) -> dict[str, object]:
    """Keep the v3 lock/models while describing only an unpublished local v4."""

    manifest = successor_source_manifest(root)
    manifest["packageId"] = PackageLayout("4").directory
    manifest["packageVersion"] = "4"
    manifest["runtimeModules"] = list(LOCAL_RUNTIME_MODULES)
    manifest["runtimeRelease"] = {
        "maximumPartBytes": MAXIMUM_PART_BYTES,
        "maximumParts": 4,
        "published": False,
        "admitted": False,
    }
    return manifest


def write_local_source_manifest(root: Path | None = None) -> Path:
    base = root or repository_root()
    target = base / "services/tts/release/optional/chatterbox/source-manifest-v4.json"
    target.write_bytes(render_manifest(local_source_manifest(base)))
    return target


def successor_acquisition_manifest(root: Path | None = None) -> dict[str, object]:
    """Generate current admission from reviewed build measurements, preserving v2."""

    base = root or repository_root()
    source = load_source_manifest(base, package_version="3")
    manifest = copy.deepcopy(load_acquisition_manifest(base))
    cast(dict[str, object], manifest["identity"])["packageVersion"] = "3"
    cast(dict[str, object], manifest["layout"])["installed"] = "cb/3"
    runtime = cast(dict[str, object], manifest["runtime"])
    runtime["releaseTag"] = "chatterbox-runtime-v3"
    runtime["dependencyLock"] = source["chatterboxLock"]
    sources = historical_sources(base, "3")
    runtime["adapterSha256"] = hashlib.sha256(sources["chatterbox_adapter.py"]).hexdigest()
    runtime["serviceSha256"] = hashlib.sha256(sources["chatterbox_service.py"]).hexdigest()
    manifest.pop("runtimeCorrection")
    parts = [
        {
            "downloadBytes": size,
            "filename": f"voxleaf-chatterbox-runtime-v3.zip.part-{index:03}",
            "sha256": digest,
            "url": (
                "https://github.com/mmjosedaniel/voxleaf/releases/download/chatterbox-runtime-v3/"
                f"voxleaf-chatterbox-runtime-v3.zip.part-{index:03}"
            ),
        }
        for index, (size, digest) in enumerate(SUCCESSOR_PARTS, start=1)
    ]
    manifest["runtimeArtifact"] = {
        "archiveSha256": SUCCESSOR_ARCHIVE_SHA256,
        "installedBytes": 5_027_425_801,
        "runtimeManifestSha256": SUCCESSOR_RUNTIME_SHA256,
        "parts": parts,
    }
    models = sum(
        cast(int, cast(dict[str, object], artifact)["sizeBytes"])
        for artifact in cast(list[object], source["modelFiles"])
    )
    archive_bytes = sum(size for size, _ in SUCCESSOR_PARTS)
    manifest["measurements"] = {
        # Retained conservative profile observation; provenance is explicit in v4 evidence.
        "coldStartSeconds": REPRESENTATIVE_COLD_START_ROUNDED_SECONDS,
        "downloadBytes": archive_bytes + models,
        "installedBytes": 5_027_425_801 + models,
        "temporaryBytes": 2 * archive_bytes + models,
        "minimumFreeBytes": CURRENT_MINIMUM_FREE_BYTES,
    }
    return manifest


def successor_runtime_evidence(root: Path | None = None) -> dict[str, object]:
    manifest = successor_acquisition_manifest(root)
    measurements = cast(dict[str, object], manifest["measurements"])
    return {
        "schemaVersion": 4,
        "authority": {
            "runtimeBuildCommitSha": SUCCESSOR_BUILD_COMMIT,
            "preparationReview": "CB-V3-PREP-REVIEW-01-20261006",
            "buildEvidence": "docs/plans/evidence/chatterbox-security-refresh/host-validation.md",
            "modelRevision": "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18",
        },
        "distribution": {
            "availability": "downloadable",
            "published": True,
            "prerelease": True,
            "runtimeReleaseTag": "chatterbox-runtime-v3",
            "publishedAt": "2026-10-07T03:24:00Z",
            "modelSource": "official-revision-pinned-hugging-face",
            "modelRepositoryCodeExecuted": False,
        },
        "inheritedProfileObservations": {
            "source": "ADR-0044 benchmark v12 and optional-package-manifest-v2.json",
            "coldStartSeconds": REPRESENTATIVE_COLD_START_ROUNDED_SECONDS,
            "measuredPeakDedicatedVramMiB": 3_644,
            "status": "historical-v2-profile-policy-not-new-v3-measurements",
        },
        "measurements": {
            "archiveSha256": SUCCESSOR_ARCHIVE_SHA256,
            "runtimeManifestSha256": SUCCESSOR_RUNTIME_SHA256,
            "runtimeArchiveBytes": sum(size for size, _ in SUCCESSOR_PARTS),
            "runtimeInstalledBytes": 5_027_425_801,
            "fileCount": 13_084,
            "reproducibleBuildCount": 2,
            "totalDownloadBytes": measurements["downloadBytes"],
            "totalInstalledBytes": measurements["installedBytes"],
            "peakStagingBytes": measurements["temporaryBytes"],
            "modelDownloadBytes": 3_208_951_924,
        },
        "parts": [
            {
                "filename": f"voxleaf-chatterbox-runtime-v3.zip.part-{index:03}",
                "sha256": digest,
                "sizeBytes": size,
            }
            for index, (size, digest) in enumerate(SUCCESSOR_PARTS, start=1)
        ],
        "runtimeCorrection": None,
        "measurementProvenance": {
            "runtimeIdentityAndSizes": "two-identical-assemblies-in-preparation-build-evidence",
            "totalDownloadBytes": "runtimeArchiveBytes + modelDownloadBytes",
            "totalInstalledBytes": "runtimeInstalledBytes + modelDownloadBytes",
            "peakStagingBytes": "conservative bound: totalDownloadBytes + runtimeArchiveBytes",
            "minimumFreeBytes": "unchanged-20000000000-byte-preflight-policy",
        },
        "ordinaryHostEvidence": (
            "apps/desktop/src-tauri/release/ordinary-chatterbox-journey-evidence-v2.json"
        ),
    }


def write_successor_authority(publication: Path, root: Path | None = None) -> None:
    """Require the actual published asset receipt before generating admission."""

    base = root or repository_root()
    receipt = _load_json(publication, "chatterbox-publication-invalid")
    if (
        receipt.get("tagName") != "chatterbox-runtime-v3"
        or receipt.get("targetCommitish") != SUCCESSOR_BUILD_COMMIT
        or receipt.get("isDraft") is not False
        or receipt.get("isPrerelease") is not True
        or receipt.get("publishedAt") != "2026-10-07T03:24:00Z"
    ):
        raise ReleaseChatterboxError("chatterbox-publication-invalid")
    assets = _array(receipt.get("assets"), "chatterbox-publication-invalid")
    if len(assets) != len(SUCCESSOR_PARTS):
        raise ReleaseChatterboxError("chatterbox-publication-invalid")
    expected_parts = cast(
        dict[str, object], successor_acquisition_manifest(base)["runtimeArtifact"]
    )["parts"]
    actual = {
        _text(
            _object(asset, "chatterbox-publication-invalid").get("name"),
            "chatterbox-publication-invalid",
        ): _object(asset, "chatterbox-publication-invalid")
        for asset in assets
    }
    for raw_part in cast(list[dict[str, object]], expected_parts):
        asset = actual.get(cast(str, raw_part["filename"]))
        if (
            asset is None
            or asset.get("size") != raw_part["downloadBytes"]
            or asset.get("digest") != f"sha256:{raw_part['sha256']}"
            or asset.get("url") != raw_part["url"]
            or asset.get("state") != "uploaded"
        ):
            raise ReleaseChatterboxError("chatterbox-publication-invalid")
    destination = base / "services/tts/release/optional/chatterbox"
    (destination / "optional-package-manifest-v3.json").write_bytes(
        render_successor_authority(successor_acquisition_manifest(base))
    )
    (destination / "runtime-package-evidence-v4.json").write_bytes(
        render_successor_authority(successor_runtime_evidence(base))
    )


def render_successor_authority(manifest: Mapping[str, object]) -> bytes:
    """Keep the closed two-language authority compatible with repository formatting."""

    return render_manifest(manifest).replace(
        b'"languages": [\n    "en",\n    "es"\n  ]', b'"languages": ["en", "es"]'
    )


def check_successor_authority(root: Path | None = None) -> None:
    base = root or repository_root()
    destination = base / "services/tts/release/optional/chatterbox"
    for name, expected in (
        ("optional-package-manifest-v3.json", successor_acquisition_manifest(base)),
        ("runtime-package-evidence-v4.json", successor_runtime_evidence(base)),
    ):
        if (destination / name).read_bytes() != render_successor_authority(expected):
            raise ReleaseChatterboxError("chatterbox-successor-authority-stale")


def load_acquisition_manifest(root: Path | None = None) -> dict[str, object]:
    """Validate the checked-in native v2 acquisition authority without networking."""

    base = root or repository_root()
    source = load_source_manifest(base)
    manifest = _load_json(
        base / "services/tts/release/optional/chatterbox/optional-package-manifest-v2.json",
        "chatterbox-acquisition-manifest-invalid",
    )
    availability = manifest.get("availability")
    if (
        manifest.get("schemaVersion") != 2
        or not isinstance(availability, str)
        or availability not in {"withheld", "downloadable"}
        or manifest.get("languages") != ["en", "es"]
    ):
        raise ReleaseChatterboxError("chatterbox-acquisition-manifest-invalid")
    identity = _object(manifest.get("identity"), "chatterbox-acquisition-manifest-invalid")
    runtime = _object(manifest.get("runtime"), "chatterbox-acquisition-manifest-invalid")
    requirements = _object(manifest.get("requirements"), "chatterbox-acquisition-manifest-invalid")
    if (
        identity.get("packageVersion") != "2"
        or identity.get("profileId") != source["profileId"]
        or identity.get("modelRevision") != "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
        or runtime.get("releaseTag") != "chatterbox-runtime-v2"
    ):
        raise ReleaseChatterboxError("chatterbox-acquisition-manifest-invalid")
    if requirements != {
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
    }:
        raise ReleaseChatterboxError("chatterbox-acquisition-manifest-invalid")
    source_models: dict[str, dict[str, object]] = {}
    for value in _array(source["modelFiles"], "chatterbox-acquisition-manifest-invalid"):
        source_artifact = _object(value, "chatterbox-acquisition-manifest-invalid")
        filename = _text(source_artifact.get("filename"), "chatterbox-acquisition-manifest-invalid")
        source_models[filename] = source_artifact
    acquired = _array(manifest.get("modelArtifacts"), "chatterbox-acquisition-manifest-invalid")
    if len(acquired) != len(source_models):
        raise ReleaseChatterboxError("chatterbox-acquisition-manifest-invalid")
    for value in acquired:
        artifact = _object(value, "chatterbox-acquisition-manifest-invalid")
        acquired_filename = _text(
            artifact.get("filename"), "chatterbox-acquisition-manifest-invalid"
        )
        matching_source = source_models.get(acquired_filename)
        if matching_source is None or artifact != {
            "downloadBytes": matching_source["sizeBytes"],
            "filename": acquired_filename,
            "sha256": matching_source["sha256"],
            "url": matching_source["url"],
        }:
            raise ReleaseChatterboxError("chatterbox-acquisition-manifest-invalid")
    runtime_artifact = manifest.get("runtimeArtifact")
    runtime_correction = manifest.get("runtimeCorrection")
    if runtime_correction != {
        "acceptedRuntimeManifestSha256": (
            "cb5055580a28a0c97e50535a8317ea506081230b70e0099d8fe0194591e1c635"
        ),
        "files": [
            {
                "path": "runtime/Lib/site-packages/voxleaf_tts/generated/__init__.py",
                "sha256": "17a64d50b529456f687df12500bd11c344b421ca33d87e3aedc21c1cdad14033",
                "sizeBytes": 62,
            },
            {
                "path": ("runtime/Lib/site-packages/voxleaf_tts/generated/protocol_schemas.py"),
                "sha256": "6a00feebccaf7584f8304bd796661790c90efaa30b641b96d20fcd858a5f8650",
                "sizeBytes": 37_039,
            },
        ],
    }:
        raise ReleaseChatterboxError("chatterbox-acquisition-manifest-invalid")
    expected_runtime_artifact = {
        "archiveSha256": "af6b4f46f6b21df02d30cdfe992f77f9bda68111edd9042cd32a619c6376aee6",
        "installedBytes": 5_019_551_385,
        "parts": [
            {
                "downloadBytes": 1_900_000_000,
                "filename": "voxleaf-chatterbox-runtime-v2.zip.part-001",
                "sha256": "168f46ae0d11c132ef414732064e81337390be9f578a8f14346b2bdab7bd386b",
                "url": "https://github.com/mmjosedaniel/voxleaf/releases/download/chatterbox-runtime-v2/voxleaf-chatterbox-runtime-v2.zip.part-001",
            },
            {
                "downloadBytes": 1_900_000_000,
                "filename": "voxleaf-chatterbox-runtime-v2.zip.part-002",
                "sha256": "35a23ce31119f1ccd386b7b9a2e3dca48b6b2d8d66d83cf0c4d649a085967bee",
                "url": "https://github.com/mmjosedaniel/voxleaf/releases/download/chatterbox-runtime-v2/voxleaf-chatterbox-runtime-v2.zip.part-002",
            },
            {
                "downloadBytes": 1_222_941_463,
                "filename": "voxleaf-chatterbox-runtime-v2.zip.part-003",
                "sha256": "9959167239073cd14f84388e5965576b4caa6c2e28e02927aa4efd71c8e14101",
                "url": "https://github.com/mmjosedaniel/voxleaf/releases/download/chatterbox-runtime-v2/voxleaf-chatterbox-runtime-v2.zip.part-003",
            },
        ],
        "runtimeManifestSha256": "1bca3c4e5706771877ad837398e7930206c8f74eb03e9804a093a4c78f0b6262",
    }
    expected_measurements = {
        "coldStartSeconds": REPRESENTATIVE_COLD_START_ROUNDED_SECONDS,
        "downloadBytes": CURRENT_DOWNLOAD_BYTES,
        "installedBytes": CURRENT_INSTALLED_BYTES,
        "minimumFreeBytes": CURRENT_MINIMUM_FREE_BYTES,
        "temporaryBytes": CURRENT_TEMPORARY_BYTES,
    }
    withholding_reason = manifest.get("withholdingReason")
    if availability == "withheld":
        initial_withholding = (
            runtime_artifact is None
            and manifest.get("measurements") is None
            and withholding_reason == "runtime-artifacts-not-published"
        )
        published_withholding = (
            runtime_artifact == expected_runtime_artifact
            and manifest.get("measurements") is None
            and withholding_reason == "clean-host-validation-pending"
        )
        if not initial_withholding and not published_withholding:
            raise ReleaseChatterboxError("chatterbox-acquisition-manifest-invalid")
    elif (
        runtime_artifact != expected_runtime_artifact
        or manifest.get("measurements") != expected_measurements
        or "withholdingReason" in manifest
    ):
        raise ReleaseChatterboxError("chatterbox-acquisition-manifest-invalid")
    return manifest


def load_runtime_evidence(root: Path | None = None) -> dict[str, object]:
    """Validate content-safe v2 runtime measurements and internal arithmetic."""

    base = root or repository_root()
    source = load_source_manifest(base)
    evidence = _load_json(
        base / "services/tts/release/optional/chatterbox/runtime-package-evidence-v2.json",
        "chatterbox-runtime-evidence-invalid",
    )
    if (
        set(evidence)
        != {
            "authority",
            "distribution",
            "measurements",
            "parts",
            "remainingGates",
            "schemaVersion",
        }
        or evidence.get("schemaVersion") != 2
    ):
        raise ReleaseChatterboxError("chatterbox-runtime-evidence-invalid")
    authority = _object(evidence["authority"], "chatterbox-runtime-evidence-invalid")
    if set(authority) != {
        "authorityCommitSha",
        "implementationCommitSha",
        "modelRevision",
        "runtimeBuildCommitSha",
    }:
        raise ReleaseChatterboxError("chatterbox-runtime-evidence-invalid")
    commits = tuple(
        _commit_sha(authority[name], "chatterbox-runtime-evidence-invalid")
        for name in ("authorityCommitSha", "implementationCommitSha", "runtimeBuildCommitSha")
    )
    if (
        len(set(commits)) != 3
        or authority["modelRevision"] != "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
    ):
        raise ReleaseChatterboxError("chatterbox-runtime-evidence-invalid")
    distribution = _object(evidence["distribution"], "chatterbox-runtime-evidence-invalid")
    if distribution != {
        "availability": "withheld",
        "modelRepositoryCodeExecuted": False,
        "modelSource": "official-revision-pinned-hugging-face",
        "published": True,
        "runtimeReleaseTag": "chatterbox-runtime-v2",
        "withholdingReason": "clean-host-validation-pending",
    }:
        raise ReleaseChatterboxError("chatterbox-runtime-evidence-invalid")
    parts = _array(evidence["parts"], "chatterbox-runtime-evidence-invalid")
    if not 1 <= len(parts) <= 4:
        raise ReleaseChatterboxError("chatterbox-runtime-evidence-invalid")
    runtime_archive_bytes = 0
    for index, value in enumerate(parts, start=1):
        part = _object(value, "chatterbox-runtime-evidence-invalid")
        if set(part) != {"filename", "sha256", "sizeBytes"} or part["filename"] != (
            f"voxleaf-chatterbox-runtime-v2.zip.part-{index:03}"
        ):
            raise ReleaseChatterboxError("chatterbox-runtime-evidence-invalid")
        _sha256(part["sha256"], "chatterbox-runtime-evidence-invalid")
        runtime_archive_bytes += _positive(part["sizeBytes"], "chatterbox-runtime-evidence-invalid")
    measurements = _object(evidence["measurements"], "chatterbox-runtime-evidence-invalid")
    expected_keys = {
        "archiveSha256",
        "fileCount",
        "modelDownloadBytes",
        "peakStagingBytes",
        "reproducibleBuildCount",
        "runtimeArchiveBytes",
        "runtimeInstalledBytes",
        "runtimeManifestSha256",
        "totalDownloadBytes",
        "totalInstalledBytes",
    }
    model_bytes = sum(
        _positive(
            _object(value, "chatterbox-runtime-evidence-invalid")["sizeBytes"],
            "chatterbox-runtime-evidence-invalid",
        )
        for value in _array(source["modelFiles"], "chatterbox-runtime-evidence-invalid")
    )
    runtime_installed_bytes = _positive(
        measurements.get("runtimeInstalledBytes"), "chatterbox-runtime-evidence-invalid"
    )
    total_download_bytes = _positive(
        measurements.get("totalDownloadBytes"), "chatterbox-runtime-evidence-invalid"
    )
    total_installed_bytes = _positive(
        measurements.get("totalInstalledBytes"), "chatterbox-runtime-evidence-invalid"
    )
    peak_staging_bytes = _positive(
        measurements.get("peakStagingBytes"), "chatterbox-runtime-evidence-invalid"
    )
    file_count = _positive(measurements.get("fileCount"), "chatterbox-runtime-evidence-invalid")
    reproducible_build_count = _positive(
        measurements.get("reproducibleBuildCount"), "chatterbox-runtime-evidence-invalid"
    )
    _sha256(measurements.get("archiveSha256"), "chatterbox-runtime-evidence-invalid")
    _sha256(measurements.get("runtimeManifestSha256"), "chatterbox-runtime-evidence-invalid")
    if (
        set(measurements) != expected_keys
        or measurements["modelDownloadBytes"] != model_bytes
        or measurements["runtimeArchiveBytes"] != runtime_archive_bytes
        or total_download_bytes != runtime_archive_bytes + model_bytes
        or total_installed_bytes != runtime_installed_bytes + model_bytes
        or peak_staging_bytes != total_download_bytes + runtime_archive_bytes
        or runtime_installed_bytes > 5_500_000_000
        or file_count <= 0
        or reproducible_build_count < 2
        or total_download_bytes > 9_000_000_000
        or total_installed_bytes > 9_000_000_000
        or peak_staging_bytes > 15_000_000_000
    ):
        raise ReleaseChatterboxError("chatterbox-runtime-evidence-invalid")
    gates = _array(evidence["remainingGates"], "chatterbox-runtime-evidence-invalid")
    if len(gates) != 3 or any(not isinstance(gate, str) or not gate for gate in gates):
        raise ReleaseChatterboxError("chatterbox-runtime-evidence-invalid")
    return evidence


def _current_runtime_evidence(root: Path) -> dict[str, object]:
    """Derive the current authority from immutable v2 evidence and manifest v2.

    This deliberately records a reconciliation, not a fresh runtime execution.
    The historical evidence remains the source for archive identity, part hashes,
    and build provenance; the checked-in acquisition authority supplies the
    accepted runtime correction and user-facing package measurements.
    """

    historical = load_runtime_evidence(root)
    acquisition = load_acquisition_manifest(root)
    historical_measurements = _object(
        historical["measurements"], "chatterbox-runtime-evidence-invalid"
    )
    runtime = _object(acquisition["runtimeArtifact"], "chatterbox-runtime-evidence-invalid")
    acquisition_measurements = _object(
        acquisition["measurements"], "chatterbox-runtime-evidence-invalid"
    )
    correction = _object(acquisition["runtimeCorrection"], "chatterbox-runtime-evidence-invalid")
    return {
        "authority": historical["authority"],
        "derivedFrom": {
            "historicalEvidence": "runtime-package-evidence-v2.json",
            "historicalInstalledBytes": HISTORICAL_INSTALLED_BYTES,
            "installedBytesCorrection": INSTALLED_BYTES_CORRECTION,
        },
        "distribution": {
            "availability": acquisition["availability"],
            "modelRepositoryCodeExecuted": False,
            "modelSource": "official-revision-pinned-hugging-face",
            "published": True,
            "runtimeReleaseTag": "chatterbox-runtime-v2",
        },
        "measurements": {
            "archiveSha256": historical_measurements["archiveSha256"],
            "fileCount": _positive(
                historical_measurements["fileCount"],
                "chatterbox-runtime-evidence-invalid",
            )
            + len(_array(correction["files"], "chatterbox-runtime-evidence-invalid")),
            "modelDownloadBytes": historical_measurements["modelDownloadBytes"],
            "peakStagingBytes": acquisition_measurements["temporaryBytes"],
            "reproducibleBuildCount": historical_measurements["reproducibleBuildCount"],
            "runtimeArchiveBytes": historical_measurements["runtimeArchiveBytes"],
            "runtimeInstalledBytes": runtime["installedBytes"],
            "runtimeManifestSha256": runtime["runtimeManifestSha256"],
            "totalDownloadBytes": acquisition_measurements["downloadBytes"],
            "totalInstalledBytes": acquisition_measurements["installedBytes"],
        },
        "parts": historical["parts"],
        "runtimeCorrection": correction,
        "schemaVersion": 3,
    }


def render_current_runtime_evidence(root: Path | None = None) -> str:
    """Render the repository-owned current evidence with canonical LF output."""

    return (
        json.dumps(
            _current_runtime_evidence(root or repository_root()),
            indent=2,
            sort_keys=True,
        )
        + "\n"
    )


def load_current_runtime_evidence(root: Path | None = None) -> dict[str, object]:
    """Validate that v3 is exactly the reconciliation produced from authority."""

    base = root or repository_root()
    evidence_path = (
        base / "services/tts/release/optional/chatterbox/runtime-package-evidence-v3.json"
    )
    evidence = _load_json(evidence_path, "chatterbox-current-runtime-evidence-invalid")
    expected = _current_runtime_evidence(base)
    canonical = render_current_runtime_evidence(base)
    if evidence != expected or evidence_path.read_text(encoding="utf-8") != canonical:
        raise ReleaseChatterboxError("chatterbox-current-runtime-evidence-invalid")
    return evidence


def reconcile_runtime_evidence(root: Path | None = None) -> Path:
    """Idempotently write the canonical current evidence from checked-in inputs."""

    base = root or repository_root()
    target = base / "services/tts/release/optional/chatterbox/runtime-package-evidence-v3.json"
    target.write_text(render_current_runtime_evidence(base), encoding="utf-8", newline="\n")
    return target
