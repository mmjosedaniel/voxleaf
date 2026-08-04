from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pytest

from voxleaf_tts.release_chatterbox import (
    PACKAGE_DIRECTORY_NAME,
    ReleaseChatterboxError,
    _configure_embedded_python,
    build_runtime_manifest,
    load_acquisition_manifest,
    load_current_runtime_evidence,
    load_runtime_evidence,
    load_source_manifest,
    reconcile_runtime_evidence,
    render_manifest,
    safe_relative_path,
    split_archive,
    verify_package_tree,
    verify_safe_model_load_sites,
)


def _sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


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
