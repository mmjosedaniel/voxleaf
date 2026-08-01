from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pytest

from voxleaf_tts.release_chatterbox import (
    PACKAGE_DIRECTORY_NAME,
    ReleaseChatterboxError,
    build_runtime_manifest,
    load_source_manifest,
    render_manifest,
    safe_relative_path,
    verify_package_tree,
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
    assert manifest["profileId"] == "chatterbox-multilingual-v3-cuda-bf16-default-v4"
    assert manifest["platform"] == "windows-x86_64"
    model_files = manifest["modelFiles"]
    assert isinstance(model_files, list)
    assert len(model_files) == 6


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
