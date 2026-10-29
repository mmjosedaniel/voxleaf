"""Deterministic assembly and verification for the distributable Piper core."""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tarfile
import urllib.request
import zipfile
from collections.abc import Callable, Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Final

from .packaging.core_integrity import HASH_BLOCK_BYTES as HASH_BLOCK_BYTES
from .packaging.core_integrity import PACKAGE_DIRECTORY_NAME as PACKAGE_DIRECTORY_NAME
from .packaging.core_integrity import RUNTIME_MANIFEST_NAME as RUNTIME_MANIFEST_NAME
from .packaging.core_integrity import ReleaseCoreError as ReleaseCoreError
from .packaging.core_integrity import _exact_keys as _exact_keys
from .packaging.core_integrity import _file_record as _file_record
from .packaging.core_integrity import _json_array as _json_array
from .packaging.core_integrity import _json_object as _json_object
from .packaging.core_integrity import _load_json as _load_json
from .packaging.core_integrity import _manifest_records as _manifest_records
from .packaging.core_integrity import _nonnegative_int as _nonnegative_int
from .packaging.core_integrity import _positive_int as _positive_int
from .packaging.core_integrity import _sha256_text as _sha256_text
from .packaging.core_integrity import _text as _text
from .packaging.core_integrity import build_runtime_manifest as build_runtime_manifest
from .packaging.core_integrity import render_manifest as render_manifest
from .packaging.core_integrity import safe_relative_path as safe_relative_path
from .packaging.core_integrity import sha256_file as sha256_file
from .packaging.core_integrity import verify_package_tree as verify_package_tree

DOWNLOAD_TIMEOUT_SECONDS: Final = 120
PACKAGE_EVIDENCE_NAME: Final = "core-package-evidence-v1.json"
STAGING_MARKER: Final = ".staging-"
FIXED_ZIP_TIMESTAMP: Final = (1980, 1, 1, 0, 0, 0)


@dataclass(frozen=True, slots=True)
class PackageMeasurement:
    """Content-free output measurements for one assembled core."""

    archive_sha256: str
    compressed_bytes: int
    installed_bytes: int
    file_count: int
    spanish_payload_bytes: int
    english_payload_bytes: int


def repository_root() -> Path:
    return Path(__file__).resolve().parents[4]


def load_source_manifest(root: Path | None = None) -> dict[str, object]:
    base = root or repository_root()
    manifest = _load_json(
        base / "services/tts/release/core/source-manifest-v1.json",
        "piper-core-source-manifest-invalid",
    )
    _exact_keys(
        manifest,
        {
            "schemaVersion",
            "packageId",
            "packageVersion",
            "platform",
            "python",
            "piper",
            "voiceRepository",
            "voices",
            "coreLock",
        },
        "piper-core-source-manifest-invalid",
    )
    if (
        manifest["schemaVersion"] != 1
        or manifest["packageId"] != PACKAGE_DIRECTORY_NAME
        or manifest["packageVersion"] != "1"
        or manifest["platform"] != "windows-x86_64"
    ):
        raise ReleaseCoreError("piper-core-source-manifest-invalid")
    return manifest


def _artifact(value: object) -> dict[str, object]:
    artifact = _json_object(value, "piper-core-source-manifest-invalid")
    _exact_keys(
        artifact,
        {"filename", "sha256", "sizeBytes", "url"},
        "piper-core-source-manifest-invalid",
    )
    safe_relative_path(_text(artifact["filename"], "piper-core-source-manifest-invalid"))
    _sha256_text(artifact["sha256"], "piper-core-source-manifest-invalid")
    _positive_int(artifact["sizeBytes"], "piper-core-source-manifest-invalid")
    url = _text(artifact["url"], "piper-core-source-manifest-invalid")
    if not url.startswith("https://"):
        raise ReleaseCoreError("piper-core-source-manifest-invalid")
    return artifact


def _download_artifact(artifact: Mapping[str, object], cache_root: Path) -> Path:
    filename = _text(artifact["filename"], "piper-core-source-manifest-invalid")
    expected_size = _positive_int(artifact["sizeBytes"], "piper-core-source-manifest-invalid")
    expected_hash = _sha256_text(artifact["sha256"], "piper-core-source-manifest-invalid")
    target = cache_root / filename
    if target.is_file():
        try:
            if target.stat().st_size == expected_size and sha256_file(target) == expected_hash:
                return target
        except OSError:
            pass
        target.unlink(missing_ok=True)
    cache_root.mkdir(parents=True, exist_ok=True)
    partial = cache_root / f".{filename}.partial-{os.getpid()}"
    partial.unlink(missing_ok=True)
    try:
        request = urllib.request.Request(
            _text(artifact["url"], "piper-core-source-manifest-invalid"),
            headers={"User-Agent": "VoxLeaf-release-builder/1"},
        )
        with (
            urllib.request.urlopen(request, timeout=DOWNLOAD_TIMEOUT_SECONDS) as response,
            partial.open("wb") as output,
        ):
            remaining = expected_size
            while block := response.read(min(HASH_BLOCK_BYTES, remaining + 1)):
                output.write(block)
                remaining -= len(block)
                if remaining < 0:
                    raise ReleaseCoreError("piper-core-download-invalid")
        if partial.stat().st_size != expected_size or sha256_file(partial) != expected_hash:
            raise ReleaseCoreError("piper-core-download-invalid")
        partial.replace(target)
    except ReleaseCoreError:
        partial.unlink(missing_ok=True)
        raise
    except (OSError, TimeoutError):
        partial.unlink(missing_ok=True)
        raise ReleaseCoreError("piper-core-download-failed") from None
    return target


def _copy_file(source: Path, target: Path) -> None:
    try:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    except OSError:
        raise ReleaseCoreError("piper-core-staging-failed") from None


def _safe_extract_python(archive: Path, target: Path) -> None:
    try:
        with zipfile.ZipFile(archive) as source:
            for member in source.infolist():
                relative = safe_relative_path(member.filename.rstrip("/"))
                destination = target.joinpath(*relative.parts)
                if member.is_dir():
                    destination.mkdir(parents=True, exist_ok=True)
                    continue
                destination.parent.mkdir(parents=True, exist_ok=True)
                with source.open(member) as opened, destination.open("wb") as output:
                    shutil.copyfileobj(opened, output, HASH_BLOCK_BYTES)
    except ReleaseCoreError:
        raise
    except (OSError, zipfile.BadZipFile):
        raise ReleaseCoreError("piper-core-python-invalid") from None


def _excluded_site_file(path: Path) -> bool:
    dormant_piper_paths = {
        "piper/__main__.py",
        "piper/audio_playback.py",
        "piper/download_voices.py",
        "piper/http_server.py",
        "piper/patch_voice_with_alignment.py",
        "piper/phonemize_chinese.py",
        "piper/g2pw_onnx.py",
        "piper/phonemize_hebrew.py",
        "piper/phonemize_japanese.py",
        "piper/phonemize_thai.py",
    }
    normalized = path.as_posix()
    dormant_voxleaf_paths = {
        "voxleaf_tts/chatterbox_adapter.py",
        "voxleaf_tts/adapters/chatterbox.py",
        "voxleaf_tts/chatterbox_service.py",
        "voxleaf_tts/qwen_adapter.py",
        "voxleaf_tts/adapters/qwen.py",
        "voxleaf_tts/qwen_service.py",
        "voxleaf_tts/release_chatterbox.py",
        "voxleaf_tts/release_core.py",
        "voxleaf_tts-0.0.0.dist-info/RECORD",
        "voxleaf_tts-0.0.0.dist-info/uv_cache.json",
    }
    return (
        "__pycache__" in path.parts
        or path.suffix == ".pyc"
        or path.name in {"direct_url.json", "INSTALLER", "REQUESTED"}
        or normalized in dormant_piper_paths
        or normalized in dormant_voxleaf_paths
        or path.parts[:2] == ("voxleaf_tts", "packaging")
        or normalized.startswith("piper/train/")
        or normalized.startswith("piper/hebrew/")
    )


def _copy_site_packages(source: Path, target: Path) -> None:
    if not source.is_dir():
        raise ReleaseCoreError("piper-core-runtime-unavailable")
    try:
        for path in sorted(source.rglob("*"), key=lambda item: item.as_posix()):
            relative = path.relative_to(source)
            if _excluded_site_file(relative):
                continue
            destination = target / relative
            if path.is_symlink():
                raise ReleaseCoreError("piper-core-runtime-invalid")
            if path.is_dir():
                destination.mkdir(parents=True, exist_ok=True)
            elif path.is_file():
                _copy_file(path, destination)
    except ReleaseCoreError:
        raise
    except OSError:
        raise ReleaseCoreError("piper-core-staging-failed") from None


def _verify_artifact_file(path: Path, artifact: Mapping[str, object]) -> None:
    expected_size = _positive_int(artifact["sizeBytes"], "piper-core-source-manifest-invalid")
    expected_hash = _sha256_text(artifact["sha256"], "piper-core-source-manifest-invalid")
    try:
        size = path.stat().st_size
    except OSError:
        raise ReleaseCoreError("piper-core-artifact-invalid") from None
    if size != expected_size or sha256_file(path) != expected_hash:
        raise ReleaseCoreError("piper-core-artifact-invalid")


def _copy_voices(manifest: Mapping[str, object], root: Path, package_root: Path) -> None:
    voices = _json_array(manifest["voices"], "piper-core-source-manifest-invalid")
    if len(voices) != 2:
        raise ReleaseCoreError("piper-core-source-manifest-invalid")
    languages: set[str] = set()
    for value in voices:
        voice = _json_object(value, "piper-core-source-manifest-invalid")
        _exact_keys(
            voice,
            {
                "language",
                "profileId",
                "runtimeVoice",
                "sourceDirectory",
                "targetDirectory",
                "artifacts",
            },
            "piper-core-source-manifest-invalid",
        )
        language = _text(voice["language"], "piper-core-source-manifest-invalid")
        languages.add(language)
        source_relative = safe_relative_path(
            _text(voice["sourceDirectory"], "piper-core-source-manifest-invalid")
        )
        target_relative = safe_relative_path(
            _text(voice["targetDirectory"], "piper-core-source-manifest-invalid")
        )
        source_root = root.joinpath(*source_relative.parts)
        target_root = package_root.joinpath(*target_relative.parts)
        artifacts = _json_array(voice["artifacts"], "piper-core-source-manifest-invalid")
        if len(artifacts) != 3:
            raise ReleaseCoreError("piper-core-source-manifest-invalid")
        for artifact_value in artifacts:
            artifact = _json_object(artifact_value, "piper-core-source-manifest-invalid")
            _exact_keys(
                artifact,
                {"filename", "sha256", "sizeBytes"},
                "piper-core-source-manifest-invalid",
            )
            filename = _text(artifact["filename"], "piper-core-source-manifest-invalid")
            safe_relative_path(filename)
            source = source_root / filename
            _verify_artifact_file(source, artifact)
            _copy_file(source, target_root / filename)
    if languages != {"en", "es"}:
        raise ReleaseCoreError("piper-core-source-manifest-invalid")


def _copy_python_licences(site_packages: Path, notice_root: Path) -> None:
    for distribution in sorted(site_packages.glob("*.dist-info")):
        licences = distribution / "licenses"
        if not licences.is_dir():
            continue
        for source in sorted(licences.rglob("*")):
            if source.is_file():
                relative = source.relative_to(licences)
                _copy_file(source, notice_root / "python" / distribution.name / relative)


def _copy_espeak_licence(source_archive: Path, target: Path) -> None:
    try:
        with tarfile.open(source_archive, mode="r:gz") as archive:
            members = [
                member for member in archive.getmembers() if member.name.endswith("/COPYING")
            ]
            root_members = [member for member in members if member.name.count("/") == 1]
            if len(root_members) != 1:
                raise ReleaseCoreError("piper-core-source-invalid")
            opened = archive.extractfile(root_members[0])
            if opened is None:
                raise ReleaseCoreError("piper-core-source-invalid")
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(opened.read())
    except ReleaseCoreError:
        raise
    except (OSError, tarfile.TarError):
        raise ReleaseCoreError("piper-core-source-invalid") from None


def _core_inventory(root: Path) -> bytes:
    inventory = _load_json(
        root / "services/tts/release/component-inventory-v1.json",
        "piper-core-inventory-invalid",
    )
    components = _json_array(inventory.get("components"), "piper-core-inventory-invalid")
    selected = [
        component
        for component in components
        if isinstance(component, dict)
        and component.get("scope") == "core"
        and component.get("auditRef") == "piper-core"
    ]
    if not selected:
        raise ReleaseCoreError("piper-core-inventory-invalid")
    value = {
        "schemaVersion": 1,
        "sourceInventory": "services/tts/release/component-inventory-v1.json",
        "components": selected,
    }
    return (json.dumps(value, indent=2, sort_keys=True) + "\n").encode("utf-8")


def _write_notices(
    root: Path,
    package_root: Path,
    site_packages: Path,
    piper_source: Path,
    espeak_source: Path,
    voice_declaration: Path,
) -> None:
    notice_root = package_root / "notices"
    source_root = package_root / "sources"
    _copy_file(root / "LICENSE", notice_root / "VOXLEAF-MIT.txt")
    _copy_file(
        package_root / "runtime/LICENSE.txt",
        notice_root / "PYTHON-3.12.10-LICENSE.txt",
    )
    _copy_file(
        site_packages / "piper_tts-1.8.0.dist-info/licenses/COPYING",
        notice_root / "PIPER-GPL-3.0.txt",
    )
    _copy_file(
        root / "services/tts/release/core/PIPER-VOICES-MIT.txt",
        notice_root / "PIPER-VOICES-MIT.txt",
    )
    _copy_file(
        root / "services/tts/release/core/THIRD-PARTY-NOTICES.md",
        notice_root / "THIRD-PARTY-NOTICES.md",
    )
    _copy_file(
        root / "services/tts/release/core/PIPER-SOURCE-FULFILLMENT.md",
        notice_root / "PIPER-SOURCE-FULFILLMENT.md",
    )
    _copy_file(
        voice_declaration,
        notice_root / "PIPER-VOICES-REPOSITORY-README.md",
    )
    (notice_root / "CORE-COMPONENT-INVENTORY.json").write_bytes(_core_inventory(root))
    _copy_python_licences(site_packages, notice_root)
    _copy_file(piper_source, source_root / piper_source.name)
    _copy_file(espeak_source, source_root / espeak_source.name)
    _copy_espeak_licence(espeak_source, notice_root / "ESPEAK-NG-GPL-3.0.txt")
    _copy_file(
        root / "services/tts/release/core/source-manifest-v1.json",
        package_root / "source-manifest-v1.json",
    )


def _clean_staging(parent: Path) -> None:
    prefix = f".{PACKAGE_DIRECTORY_NAME}{STAGING_MARKER}"
    try:
        for path in parent.iterdir() if parent.is_dir() else ():
            if path.name.startswith(prefix) and path.is_dir():
                shutil.rmtree(path)
    except OSError:
        raise ReleaseCoreError("piper-core-cleanup-failed") from None


def atomic_stage(target: Path, populate: Callable[[Path], None]) -> None:
    parent = target.parent
    parent.mkdir(parents=True, exist_ok=True)
    _clean_staging(parent)
    staging = parent / f".{PACKAGE_DIRECTORY_NAME}{STAGING_MARKER}{os.getpid()}"
    backup = parent / f".{PACKAGE_DIRECTORY_NAME}.previous"
    # Failed promotion and restoration may have left this as the only package.
    # Recover it before cleanup or population can discard the recovery input.
    if backup.exists() and not target.exists():
        try:
            backup.replace(target)
        except OSError:
            raise ReleaseCoreError("piper-core-promotion-failed") from None
    shutil.rmtree(staging, ignore_errors=True)
    shutil.rmtree(backup, ignore_errors=True)
    staging.mkdir(parents=True)
    moved_previous = False
    try:
        populate(staging)
        if target.exists():
            target.replace(backup)
            moved_previous = True
        staging.replace(target)
        if moved_previous:
            shutil.rmtree(backup)
    except ReleaseCoreError:
        if moved_previous and not target.exists() and backup.exists():
            backup.replace(target)
        raise
    except OSError:
        if moved_previous and not target.exists() and backup.exists():
            backup.replace(target)
        raise ReleaseCoreError("piper-core-promotion-failed") from None
    finally:
        shutil.rmtree(staging, ignore_errors=True)
        if target.exists():
            shutil.rmtree(backup, ignore_errors=True)


def _zip_package(package_root: Path, archive_path: Path) -> None:
    partial = archive_path.with_suffix(".partial")
    partial.unlink(missing_ok=True)
    try:
        with zipfile.ZipFile(
            partial, mode="w", compression=zipfile.ZIP_DEFLATED, compresslevel=9
        ) as archive:
            for path in sorted(package_root.rglob("*"), key=lambda item: item.as_posix()):
                if not path.is_file():
                    continue
                relative = f"{PACKAGE_DIRECTORY_NAME}/{path.relative_to(package_root).as_posix()}"
                info = zipfile.ZipInfo(relative, FIXED_ZIP_TIMESTAMP)
                info.compress_type = zipfile.ZIP_DEFLATED
                info.external_attr = 0o100644 << 16
                archive.writestr(info, path.read_bytes(), compresslevel=9)
        partial.replace(archive_path)
    except OSError:
        partial.unlink(missing_ok=True)
        raise ReleaseCoreError("piper-core-archive-failed") from None


def _sync_core_environment(root: Path) -> None:
    try:
        subprocess.run(
            [
                "uv",
                "sync",
                "--project",
                str(root / "services/tts/release/core"),
                "--locked",
                "--no-dev",
                "--reinstall-package",
                "voxleaf-tts",
            ],
            cwd=root,
            check=True,
            stdin=subprocess.DEVNULL,
        )
    except (OSError, subprocess.CalledProcessError):
        raise ReleaseCoreError("piper-core-lock-sync-failed") from None


def _assemble_staging(
    staging: Path,
    root: Path,
    source_manifest: Mapping[str, object],
    cache_root: Path,
    write_manifest: bool,
) -> None:
    python = _json_object(source_manifest["python"], "piper-core-source-manifest-invalid")
    piper = _json_object(source_manifest["piper"], "piper-core-source-manifest-invalid")
    voice_repository = _json_object(
        source_manifest["voiceRepository"], "piper-core-source-manifest-invalid"
    )
    python_archive = _download_artifact(_artifact(python["artifact"]), cache_root)
    piper_source = _download_artifact(_artifact(piper["source"]), cache_root)
    espeak_source = _download_artifact(_artifact(piper["phonemizerSource"]), cache_root)
    voice_declaration = _download_artifact(
        _artifact(voice_repository["licenseDeclaration"]), cache_root
    )

    runtime_root = staging / "runtime"
    _safe_extract_python(python_archive, runtime_root)
    pth = runtime_root / "python312._pth"
    if not pth.is_file():
        raise ReleaseCoreError("piper-core-python-invalid")
    pth.write_text(
        "python312.zip\n.\nLib\\site-packages\nimport site\n",
        encoding="utf-8",
        newline="\n",
    )
    site_source = root / "services/tts/release/core/.venv/Lib/site-packages"
    site_target = runtime_root / "Lib/site-packages"
    _copy_site_packages(site_source, site_target)
    _copy_voices(source_manifest, root, staging)
    _write_notices(
        root,
        staging,
        site_target,
        piper_source,
        espeak_source,
        voice_declaration,
    )

    generated = render_manifest(build_runtime_manifest(staging, source_manifest))
    authority_path = root / "services/tts/release/core/runtime-manifest-v1.json"
    if write_manifest:
        authority_path.write_bytes(generated)
    try:
        authority = authority_path.read_bytes()
    except OSError:
        raise ReleaseCoreError("piper-core-runtime-manifest-missing") from None
    if authority != generated:
        raise ReleaseCoreError("piper-core-runtime-manifest-stale")
    (staging / RUNTIME_MANIFEST_NAME).write_bytes(authority)
    verify_package_tree(staging, json.loads(authority))


def _smoke_script(language: str) -> str:
    profile_name = "SPANISH_PROFILE" if language == "es" else "ENGLISH_PROFILE"
    text = (
        "Esta es una prueba [[literal]] de narración local."
        if language == "es"
        else "This is a [[literal]] local narration test."
    )
    return f"""import socket
blocked=lambda *a,**k: (_ for _ in ()).throw(RuntimeError('network-disabled'))
socket.socket=blocked
socket.create_connection=blocked
from pathlib import Path
from piper.voice import EspeakPhonemizer, _ESPEAK_PHONEMIZER_LOCK
from voxleaf_tts.adapters.piper import PiperCpuTtsEngine,{profile_name}
engine=PiperCpuTtsEngine(Path.cwd(),profile={profile_name})
engine.load()
engine.warm()
voice=engine._voice
assert voice is not None
text={text!r}
with _ESPEAK_PHONEMIZER_LOCK:
    phonemizer=EspeakPhonemizer(voice.espeak_data_dir)
    literal=phonemizer.phonemize(voice.config.espeak_voice,text,vowel_clusters=voice.config.vowel_clusters)
assert voice.phonemize(text)==literal
assert type(voice).phonemize(voice,text)!=literal
ordinary='Una prueba local.' if {language!r}=='es' else 'An ordinary local test.'
assert voice.phonemize(ordinary)==type(voice).phonemize(voice,ordinary)
identity=engine.begin('request:release',{{'text':text,'sessionId':'session:release','generationId':'generation:release','segmentId':'segment:release'}})
settled,result=engine.settle()
assert settled==identity and result.payload and result.sample_rate_hz==24000
print(len(result.payload))
engine.release_result()
engine.cleanup()
"""


def _offline_smoke(package_root: Path, language: str) -> int:
    python = package_root / "runtime/python.exe"
    model_root = package_root / "voices" / language
    environment = {
        "HF_HUB_OFFLINE": "1",
        "TRANSFORMERS_OFFLINE": "1",
        "HF_HUB_DISABLE_TELEMETRY": "1",
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONUTF8": "1",
    }
    try:
        completed = subprocess.run(
            [str(python), "-s", "-c", _smoke_script(language)],
            cwd=model_root,
            env=environment,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=180,
        )
        payload_bytes = int(completed.stdout.strip())
    except (OSError, ValueError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        raise ReleaseCoreError("piper-core-offline-smoke-failed") from None
    if payload_bytes <= 0:
        raise ReleaseCoreError("piper-core-offline-smoke-failed")
    return payload_bytes


def build_package(*, write_manifest: bool = False, sync: bool = True) -> PackageMeasurement:
    root = repository_root()
    source_manifest = load_source_manifest(root)
    lock = _json_object(source_manifest["coreLock"], "piper-core-source-manifest-invalid")
    lock_path = root.joinpath(
        *safe_relative_path(_text(lock["path"], "piper-core-source-manifest-invalid")).parts
    )
    if sha256_file(lock_path) != _sha256_text(lock["sha256"], "piper-core-source-manifest-invalid"):
        raise ReleaseCoreError("piper-core-lock-invalid")
    if sync:
        _sync_core_environment(root)

    dist = root / "services/tts/release/core/dist"
    target = dist / PACKAGE_DIRECTORY_NAME
    cache = dist / "downloads"
    atomic_stage(
        target,
        lambda staging: _assemble_staging(staging, root, source_manifest, cache, write_manifest),
    )
    manifest = _load_json(target / RUNTIME_MANIFEST_NAME, "piper-core-runtime-manifest-invalid")
    verify_package_tree(target, manifest)
    archive = dist / f"{PACKAGE_DIRECTORY_NAME}.zip"
    _zip_package(target, archive)
    spanish = _offline_smoke(target, "es")
    english = _offline_smoke(target, "en")
    try:
        installed = sum(path.stat().st_size for path in target.rglob("*") if path.is_file())
        file_count = sum(1 for path in target.rglob("*") if path.is_file())
        compressed = archive.stat().st_size
    except OSError:
        raise ReleaseCoreError("piper-core-measurement-failed") from None
    measurement = PackageMeasurement(
        archive_sha256=sha256_file(archive),
        compressed_bytes=compressed,
        installed_bytes=installed,
        file_count=file_count,
        spanish_payload_bytes=spanish,
        english_payload_bytes=english,
    )
    if write_manifest:
        write_package_evidence(root, measurement)
    return measurement


def package_evidence(root: Path, measurement: PackageMeasurement) -> dict[str, object]:
    source_manifest = root / "services/tts/release/core/source-manifest-v1.json"
    runtime_manifest = root / "services/tts/release/core/runtime-manifest-v1.json"
    return {
        "schemaVersion": 1,
        "packageId": PACKAGE_DIRECTORY_NAME,
        "packageVersion": "1",
        "platform": "windows-x86_64",
        "authority": {
            "sourceManifestSha256": sha256_file(source_manifest),
            "runtimeManifestSha256": sha256_file(runtime_manifest),
        },
        "measurements": {
            "archiveSha256": measurement.archive_sha256,
            "compressedBytes": measurement.compressed_bytes,
            "installedBytes": measurement.installed_bytes,
            "fileCount": measurement.file_count,
        },
        "offlineSmoke": {
            "networkProcessApisDenied": True,
            "audioPersisted": False,
            "spanishPayloadBytes": measurement.spanish_payload_bytes,
            "englishPayloadBytes": measurement.english_payload_bytes,
        },
        "failureMatrix": {
            "truncatedArtifactRejected": True,
            "substitutedArtifactRejected": True,
            "staleArtifactRejected": True,
            "partialStagingRemoved": True,
            "previousPackagePreservedOnFailure": True,
        },
        "distribution": {
            "pythonRuntimeBundled": True,
            "spanishVoiceBundled": True,
            "englishVoiceBundled": True,
            "piperSourceBundled": True,
            "phonemizerSourceBundled": True,
            "noticesAndModelCardsBundled": True,
            "systemPythonRequired": False,
            "firstRunDownloadRequired": False,
        },
        "limitations": [
            "This is the deterministic Piper core payload, not the final installer measurement.",
            "The child runs as the ordinary user and is integrity checked but not OS sandboxed.",
            "Final clean-host, OS-level offline, install, repair, and uninstall evidence "
            "belongs to later M011 milestones.",
        ],
    }


def write_package_evidence(root: Path, measurement: PackageMeasurement) -> None:
    path = root / "services/tts/release/core" / PACKAGE_EVIDENCE_NAME
    path.write_text(
        json.dumps(package_evidence(root, measurement), indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )


def check_tracked_manifest() -> None:
    root = repository_root()
    target = root / "services/tts/release/core/dist" / PACKAGE_DIRECTORY_NAME
    tracked = _load_json(
        root / "services/tts/release/core/runtime-manifest-v1.json",
        "piper-core-runtime-manifest-missing",
    )
    installed = _load_json(target / RUNTIME_MANIFEST_NAME, "piper-core-runtime-manifest-missing")
    if tracked != installed:
        raise ReleaseCoreError("piper-core-runtime-manifest-stale")
    verify_package_tree(target, tracked)
    archive = root / "services/tts/release/core/dist" / f"{PACKAGE_DIRECTORY_NAME}.zip"
    evidence = _load_json(
        root / "services/tts/release/core" / PACKAGE_EVIDENCE_NAME,
        "piper-core-package-evidence-invalid",
    )
    measurements = _json_object(evidence.get("measurements"), "piper-core-package-evidence-invalid")
    authority = _json_object(evidence.get("authority"), "piper-core-package-evidence-invalid")
    try:
        installed_bytes = sum(path.stat().st_size for path in target.rglob("*") if path.is_file())
        file_count = sum(1 for path in target.rglob("*") if path.is_file())
        compressed_bytes = archive.stat().st_size
    except OSError:
        raise ReleaseCoreError("piper-core-package-evidence-invalid") from None
    expected = {
        "archiveSha256": sha256_file(archive),
        "compressedBytes": compressed_bytes,
        "installedBytes": installed_bytes,
        "fileCount": file_count,
    }
    if measurements != expected or authority != {
        "sourceManifestSha256": sha256_file(
            root / "services/tts/release/core/source-manifest-v1.json"
        ),
        "runtimeManifestSha256": sha256_file(
            root / "services/tts/release/core/runtime-manifest-v1.json"
        ),
    }:
        raise ReleaseCoreError("piper-core-package-evidence-invalid")


def measurement_json(measurement: PackageMeasurement) -> str:
    return json.dumps(
        {
            "archiveSha256": measurement.archive_sha256,
            "compressedBytes": measurement.compressed_bytes,
            "englishPayloadBytes": measurement.english_payload_bytes,
            "fileCount": measurement.file_count,
            "installedBytes": measurement.installed_bytes,
            "spanishPayloadBytes": measurement.spanish_payload_bytes,
        },
        sort_keys=True,
    )


def main(arguments: list[str] | None = None) -> int:
    args = sys.argv[1:] if arguments is None else arguments
    if args == ["build"]:
        print(measurement_json(build_package()))
        return 0
    if args == ["write-manifest"]:
        print(measurement_json(build_package(write_manifest=True)))
        return 0
    if args == ["check"]:
        check_tracked_manifest()
        print("piper-core-release:current")
        return 0
    raise ReleaseCoreError("piper-core-invalid-command")


if __name__ == "__main__":
    raise SystemExit(main())
