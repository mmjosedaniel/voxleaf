from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pytest

from voxleaf_tts.release_core import (
    PACKAGE_DIRECTORY_NAME,
    PackageMeasurement,
    ReleaseCoreError,
    atomic_stage,
    build_runtime_manifest,
    load_source_manifest,
    package_evidence,
    render_manifest,
    safe_relative_path,
    verify_package_tree,
)


def _sha256(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _manifest(files: dict[str, bytes]) -> dict[str, object]:
    return {
        "files": [
            {"path": path, "sha256": _sha256(value), "sizeBytes": len(value)}
            for path, value in sorted(files.items())
        ]
    }


def _write_tree(root: Path, files: dict[str, bytes]) -> None:
    for relative, value in files.items():
        target = root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(value)


def test_source_manifest_closes_runtime_sources_and_both_voices() -> None:
    manifest = load_source_manifest()
    assert manifest["packageId"] == PACKAGE_DIRECTORY_NAME
    assert manifest["platform"] == "windows-x86_64"
    assert manifest["python"] == {
        "version": "3.12.10",
        "artifact": {
            "filename": "python-3.12.10-embed-amd64.zip",
            "sha256": "4acbed6dd1c744b0376e3b1cf57ce906f9dc9e95e68824584c8099a63025a3c3",
            "sizeBytes": 11_133_606,
            "url": "https://www.python.org/ftp/python/3.12.10/python-3.12.10-embed-amd64.zip",
        },
    }
    piper = manifest["piper"]
    assert isinstance(piper, dict)
    assert piper["version"] == "1.4.2"
    assert piper["sourceRevision"] == "d6975e21a440c0d8b6e5fb7c41027409af13d44d"
    assert piper["phonemizerSourceRevision"] == ("212928b394a96e8fd2096616bfd54e17845c48f6")
    voices = manifest["voices"]
    assert isinstance(voices, list)
    assert {voice["language"] for voice in voices} == {"en", "es"}
    assert {voice["runtimeVoice"] for voice in voices} == {"davefx-es", "joe-en"}
    assert all(len(voice["artifacts"]) == 3 for voice in voices)


@pytest.mark.parametrize(
    "value",
    ["", ".", "../runtime/python.exe", "/runtime/python.exe", "C:/python.exe", "a\\b"],
)
def test_runtime_paths_reject_absolute_parent_and_windows_input(value: str) -> None:
    with pytest.raises(ReleaseCoreError, match="^piper-core-invalid-path$"):
        safe_relative_path(value)


def test_runtime_tree_accepts_only_the_exact_frozen_files(tmp_path: Path) -> None:
    files = {
        "runtime/python.exe": b"python",
        "runtime/Lib/site-packages/piper/py.typed": b"",
        "voices/en/MODEL_CARD": b"voice",
    }
    _write_tree(tmp_path, files)
    verify_package_tree(tmp_path, _manifest(files))

    (tmp_path / "runtime/python.exe").write_bytes(b"truncated")
    with pytest.raises(ReleaseCoreError, match="^piper-core-runtime-invalid$"):
        verify_package_tree(tmp_path, _manifest(files))


def test_runtime_tree_rejects_stale_or_substituted_artifacts(tmp_path: Path) -> None:
    files = {"runtime/python.exe": b"python", "voices/es/model.onnx": b"model"}
    _write_tree(tmp_path, files)
    manifest = _manifest(files)
    (tmp_path / "stale.txt").write_text("stale", encoding="utf-8")
    with pytest.raises(ReleaseCoreError, match="^piper-core-runtime-invalid$"):
        verify_package_tree(tmp_path, manifest)
    (tmp_path / "stale.txt").unlink()
    (tmp_path / "voices/es/model.onnx").write_bytes(b"other")
    with pytest.raises(ReleaseCoreError, match="^piper-core-runtime-invalid$"):
        verify_package_tree(tmp_path, manifest)


def test_atomic_staging_promotes_success_and_preserves_previous_on_failure(
    tmp_path: Path,
) -> None:
    target = tmp_path / PACKAGE_DIRECTORY_NAME

    def populate(staging: Path) -> None:
        (staging / "marker").write_text("v1", encoding="utf-8")

    atomic_stage(target, populate)
    assert (target / "marker").read_text(encoding="utf-8") == "v1"

    def fail(staging: Path) -> None:
        (staging / "marker").write_text("partial", encoding="utf-8")
        raise ReleaseCoreError("piper-core-test-failure")

    with pytest.raises(ReleaseCoreError, match="^piper-core-test-failure$"):
        atomic_stage(target, fail)
    assert (target / "marker").read_text(encoding="utf-8") == "v1"
    assert not list(tmp_path.glob(f".{PACKAGE_DIRECTORY_NAME}.staging-*"))


def test_generated_manifest_is_canonical_and_content_free(tmp_path: Path) -> None:
    files = {
        "runtime/python.exe": b"python",
        "voices/es/MODEL_CARD": b"spanish",
        "voices/en/MODEL_CARD": b"english",
    }
    _write_tree(tmp_path, files)
    source = load_source_manifest()
    generated = build_runtime_manifest(tmp_path, source)
    rendered = render_manifest(generated)
    assert rendered.endswith(b"\n")
    assert json.loads(rendered)["payloadBytes"] == sum(map(len, files.values()))
    assert b"private-user-name" not in rendered
    assert b"Desktop" not in rendered
    assert b"models/tts" not in rendered


def test_package_evidence_is_content_free_and_separates_later_installer_proof(
    tmp_path: Path,
) -> None:
    source = tmp_path / "services/tts/release/core/source-manifest-v1.json"
    runtime = tmp_path / "services/tts/release/core/runtime-manifest-v1.json"
    source.parent.mkdir(parents=True)
    source.write_text("{}", encoding="utf-8")
    runtime.write_text("{}", encoding="utf-8")
    evidence = package_evidence(
        tmp_path,
        PackageMeasurement("a" * 64, 10, 20, 2, 30, 40),
    )
    rendered = json.dumps(evidence)
    offline = evidence["offlineSmoke"]
    distribution = evidence["distribution"]
    assert isinstance(offline, dict)
    assert isinstance(distribution, dict)
    assert offline["audioPersisted"] is False
    assert distribution["systemPythonRequired"] is False
    assert "final installer" in rendered
    assert "private-user-name" not in rendered
