from __future__ import annotations

import hashlib
import json
import socket
import sys
import threading
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import cast

import pytest

from voxleaf_tts import release_core
from voxleaf_tts.packaging import core_integrity
from voxleaf_tts.release_core import (
    PACKAGE_DIRECTORY_NAME,
    PackageMeasurement,
    ReleaseCoreError,
    _copy_site_packages,
    _excluded_site_file,
    _sync_core_environment,
    atomic_stage,
    build_runtime_manifest,
    load_source_manifest,
    package_evidence,
    render_manifest,
    safe_relative_path,
    verify_package_tree,
)


def test_caf_r4_3_recovery_preflights_the_entire_output_set(tmp_path: Path) -> None:
    early = tmp_path / "early"
    early_backup = tmp_path / ".early.previous"
    late = tmp_path / "late"
    late_backup = tmp_path / ".late.previous"
    early_backup.write_bytes(b"sole earlier output")
    late.write_bytes(b"new output")
    late_backup.write_bytes(b"old output")
    with pytest.raises(ReleaseCoreError, match="piper-core-recovery-required"):
        release_core._recover_outputs([early, late])
    assert not early.exists()
    assert early_backup.read_bytes() == b"sole earlier output"
    assert late.read_bytes() == b"new output"
    assert late_backup.read_bytes() == b"old output"


def test_core_sync_reinstalls_the_current_local_voxleaf_package(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    observed: list[str] = []

    def capture(arguments: list[str], **_kwargs: object) -> None:
        observed.extend(arguments)

    monkeypatch.setattr("voxleaf_tts.release_core.subprocess.run", capture)

    _sync_core_environment(tmp_path)

    assert observed[-2:] == ["--reinstall-package", "voxleaf-tts"]


@pytest.mark.parametrize("language", ["es", "en"])
@pytest.mark.parametrize("literal_route", [False, True])
def test_saf_core_smoke_requires_literal_delimiter_route_not_only_pcm(
    monkeypatch: pytest.MonkeyPatch, language: str, literal_route: bool
) -> None:
    instances: list[SmokeEngine] = []
    shared_lock = threading.Lock()

    class Voice:
        espeak_data_dir = Path("synthetic-espeak")
        config = SimpleNamespace(espeak_voice=language, vowel_clusters={("a", "i")})

        def phonemize(self, text: str) -> list[list[str]]:
            return [list(text.replace("[[", "").replace("]]", ""))]

    class LiteralPhonemizer:
        def __init__(self, _data: Path) -> None:
            assert shared_lock.locked()

        def phonemize(self, voice: str, text: str, **_kwargs: object) -> list[list[str]]:
            assert shared_lock.locked()
            assert voice == language
            return [list(text)]

    class SmokeEngine:
        def __init__(self, *_args: object, **_kwargs: object) -> None:
            self._voice = Voice()
            if literal_route:
                self._voice.phonemize = lambda text: [list(text)]  # type: ignore[method-assign]
            self.last_text = ""
            instances.append(self)

        def load(self) -> None:
            pass

        def warm(self) -> None:
            pass

        def begin(self, _request: str, segment: dict[str, object]) -> str:
            self.last_text = cast(str, segment["text"])
            return "identity"

        def settle(self) -> tuple[str, object]:
            return "identity", SimpleNamespace(payload=b"synthetic-pcm", sample_rate_hz=24_000)

        def release_result(self) -> None:
            pass

        def cleanup(self) -> None:
            pass

    adapter_module = ModuleType("voxleaf_tts.adapters.piper")
    adapter_module.__dict__.update(
        PiperCpuTtsEngine=SmokeEngine, SPANISH_PROFILE=object(), ENGLISH_PROFILE=object()
    )
    voice_module = ModuleType("piper.voice")
    voice_module.__dict__.update(
        EspeakPhonemizer=LiteralPhonemizer, _ESPEAK_PHONEMIZER_LOCK=shared_lock
    )
    monkeypatch.setitem(sys.modules, "voxleaf_tts.adapters.piper", adapter_module)
    monkeypatch.setitem(sys.modules, "piper.voice", voice_module)
    # The generated script installs an offline socket guard in its own process;
    # restore these process globals when exercising it with synthetic modules.
    monkeypatch.setattr(socket, "socket", socket.socket)
    monkeypatch.setattr(socket, "create_connection", socket.create_connection)
    script = release_core._smoke_script(language)
    if literal_route:
        exec(script, {})
        assert "[[" in instances[0].last_text and "]]" in instances[0].last_text
    else:
        with pytest.raises(AssertionError):
            exec(script, {})


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


def test_integrity_facade_preserves_bindings_and_qualified_error_identity() -> None:
    for name in (
        "HASH_BLOCK_BYTES",
        "PACKAGE_DIRECTORY_NAME",
        "RUNTIME_MANIFEST_NAME",
        "ReleaseCoreError",
        "sha256_file",
        "_json_object",
        "_json_array",
        "_exact_keys",
        "_text",
        "_positive_int",
        "_nonnegative_int",
        "_sha256_text",
        "safe_relative_path",
        "_load_json",
        "_file_record",
        "build_runtime_manifest",
        "render_manifest",
        "_manifest_records",
        "verify_package_tree",
    ):
        assert getattr(release_core, name) is getattr(core_integrity, name)
    assert ReleaseCoreError.__module__ == "voxleaf_tts.release_core"
    assert ReleaseCoreError.__qualname__ == "ReleaseCoreError"
    with pytest.raises(ReleaseCoreError, match="^piper-core-invalid-path$"):
        core_integrity.safe_relative_path("../runtime/python.exe")


def test_core_copy_excludes_the_whole_maintainer_tree_and_keeps_runtime_siblings(
    tmp_path: Path,
) -> None:
    source, target = tmp_path / "source", tmp_path / "target"
    retained = {
        "voxleaf_tts/adapters/__init__.py": b"",
        "voxleaf_tts/adapters/piper.py": b"piper",
        "voxleaf_tts/adapters/fake.py": b"fake",
        "voxleaf_tts/adapters/chatterbox_extra.py": b"similarly named adapter",
        "voxleaf_tts/adapters/qwen_extra/helper.py": b"similarly named directory",
        "voxleaf_tts/generated/protocol_schemas.py": b"schema",
        "voxleaf_tts/piper_service.py": b"service",
        "voxleaf_tts/protocol.py": b"protocol",
        "voxleaf_tts/packaging.py": b"similarly named module",
        "voxleaf_tts/packaging_extra/helper.py": b"similarly named directory",
    }
    excluded = {
        "voxleaf_tts/adapters/chatterbox.py": b"optional engine",
        "voxleaf_tts/adapters/qwen.py": b"development engine",
        "voxleaf_tts/chatterbox_service.py": b"optional entrypoint",
        "voxleaf_tts/qwen_service.py": b"development entrypoint",
        "voxleaf_tts/packaging/__init__.py": b"",
        "voxleaf_tts/packaging/core_integrity.py": b"maintainer helper",
        "voxleaf_tts/packaging/nested/future_helper.py": b"nested maintainer helper",
        "voxleaf_tts/release_core.py": b"builder",
        "voxleaf_tts/release_chatterbox.py": b"optional builder",
        "voxleaf_tts/__pycache__/protocol.cpython-312.pyc": b"cache",
    }
    _write_tree(source, retained | excluded)
    _copy_site_packages(source, target)
    assert not (target / "voxleaf_tts/packaging").exists()
    assert {
        path.relative_to(target).as_posix(): path.read_bytes()
        for path in target.rglob("*")
        if path.is_file()
    } == retained


def test_fixed_input_runtime_manifest_matches_the_baseline_bytes(tmp_path: Path) -> None:
    _write_tree(
        tmp_path,
        {
            "runtime/python.exe": b"python",
            "voices/es/MODEL_CARD": b"spanish",
            "voices/en/MODEL_CARD": b"english",
        },
    )
    source: dict[str, object] = {
        "coreLock": {"sha256": "a" * 64},
        "voices": [
            {
                "language": language,
                "targetDirectory": f"voices/{language}",
                "profileId": f"synthetic-{language}",
                "runtimeVoice": f"synthetic-{language}",
            }
            for language in ("es", "en")
        ],
    }
    rendered = render_manifest(build_runtime_manifest(tmp_path, source))
    assert len(rendered) == 1_207
    assert _sha256(rendered) == "9c2a643d081a6f7f32d7d137815960dd86281a45cd3ee54dfc9619fb2b83af63"


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
    assert piper["version"] == "1.8.0"
    assert piper["sourceRevision"] == "639388b6317fc4731e91d53da42aea68fd4166ff"
    assert piper["phonemizerSourceRevision"] == ("724808c5a83f9ef95fdd0db886ba7ba537ff224a")
    voices = manifest["voices"]
    assert isinstance(voices, list)
    assert {voice["language"] for voice in voices} == {"en", "es"}
    assert {voice["runtimeVoice"] for voice in voices} == {"davefx-es", "joe-en"}
    assert all(len(voice["artifacts"]) == 3 for voice in voices)


def test_core_excludes_release_builders_and_their_stale_install_metadata() -> None:
    for relative in (
        "voxleaf_tts/release_core.py",
        "voxleaf_tts/release_chatterbox.py",
        "voxleaf_tts-0.0.0.dist-info/RECORD",
        "voxleaf_tts-0.0.0.dist-info/uv_cache.json",
    ):
        assert _excluded_site_file(Path(relative))
    assert not _excluded_site_file(Path("voxleaf_tts/piper_service.py"))


def test_core_excludes_unreachable_language_helpers_and_hebrew_model() -> None:
    for relative in (
        "piper/g2pw_onnx.py",
        "piper/phonemize_hebrew.py",
        "piper/phonemize_japanese.py",
        "piper/phonemize_thai.py",
        "piper/hebrew/__init__.py",
        "piper/hebrew/nakdimon.onnx",
    ):
        assert _excluded_site_file(Path(relative))
    for relative in ("piper/voice.py", "piper/phonemize_espeak.py", "piper/espeakbridge.pyd"):
        assert not _excluded_site_file(Path(relative))


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


def test_atomic_stage_retains_sole_backup_across_blocked_retries(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    target = tmp_path / PACKAGE_DIRECTORY_NAME
    backup = tmp_path / f".{PACKAGE_DIRECTORY_NAME}.previous"
    target.mkdir()
    (target / "marker").write_bytes(b"original")
    sibling = tmp_path / "unrelated"
    sibling.write_bytes(b"keep")
    replace = Path.replace
    blocked = True

    def controlled_replace(source: Path, destination: Path) -> Path:
        if blocked and destination == target:
            raise PermissionError("injected move failure")
        return replace(source, destination)

    def populate(staging: Path) -> None:
        (staging / "marker").write_bytes(b"replacement")

    monkeypatch.setattr(Path, "replace", controlled_replace)
    for _attempt in range(2):
        with pytest.raises((ReleaseCoreError, OSError)):
            atomic_stage(target, populate)
        assert not target.exists()
        assert (backup / "marker").read_bytes() == b"original"
        assert sibling.read_bytes() == b"keep"
        assert not list(tmp_path.glob(f".{PACKAGE_DIRECTORY_NAME}.staging-*"))

    blocked = False

    def fail_after_recovery(_staging: Path) -> None:
        assert (target / "marker").read_bytes() == b"original"
        raise ReleaseCoreError("piper-core-test-failure")

    with pytest.raises(ReleaseCoreError, match="^piper-core-test-failure$"):
        atomic_stage(target, fail_after_recovery)
    assert (target / "marker").read_bytes() == b"original"
    atomic_stage(target, populate)
    assert (target / "marker").read_bytes() == b"replacement"
    assert not backup.exists()
    assert sibling.read_bytes() == b"keep"


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


@pytest.fixture
def spm_core_builder(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    root = tmp_path
    core = root / "services/tts/release/core"
    core.mkdir(parents=True)
    source = load_source_manifest()
    lock = cast(dict[str, object], source["coreLock"])
    lock_path = root / str(lock["path"])
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    lock_path.write_bytes(b"synthetic lock")
    lock["sha256"] = hashlib.sha256(b"synthetic lock").hexdigest()
    (core / "source-manifest-v1.json").write_bytes(render_manifest(source))
    monkeypatch.setattr(release_core, "repository_root", lambda: root)
    monkeypatch.setattr(release_core, "_download_artifact", lambda *a: root / "unused.zip")

    def extract(_archive: Path, target: Path) -> None:
        _write_tree(target, {"python.exe": b"new runtime", "python312._pth": b"."})

    monkeypatch.setattr(release_core, "_safe_extract_python", extract)
    monkeypatch.setattr(release_core, "_copy_site_packages", lambda *a: None)
    monkeypatch.setattr(release_core, "_copy_voices", lambda *a: None)
    monkeypatch.setattr(release_core, "_write_notices", lambda *a: None)
    monkeypatch.setattr(release_core, "_offline_smoke", lambda *a: 48)
    return root


def spm_core_outputs(root: Path) -> list[Path]:
    core = root / "services/tts/release/core"
    return [
        core / "dist" / PACKAGE_DIRECTORY_NAME,
        core / "dist" / f"{PACKAGE_DIRECTORY_NAME}.zip",
        core / "runtime-manifest-v1.json",
        core / release_core.PACKAGE_EVIDENCE_NAME,
    ]


@pytest.mark.parametrize(
    "stage",
    [
        "zip",
        "es",
        "en",
        "measurement",
        "manifest",
        "evidence",
        "promote-0",
        "promote-1",
        "promote-2",
        "promote-3",
    ],
)
def test_spm_core_preserves_complete_previous_set(
    spm_core_builder: Path, monkeypatch: pytest.MonkeyPatch, stage: str
) -> None:
    root = spm_core_builder
    outputs = spm_core_outputs(root)
    _write_tree(outputs[0], {"old.txt": b"old runtime"})
    for path in outputs[1:]:
        path.write_bytes(b"old " + path.name.encode())
    sentinel = outputs[0].parent / "unrelated.txt"
    sentinel.write_bytes(b"keep")
    before = {path: path.read_bytes() for path in outputs[1:]}
    replace = Path.replace
    write_bytes = Path.write_bytes
    smoke = release_core._offline_smoke
    sha = release_core.sha256_file

    def fail(*args: object, **kwargs: object) -> None:
        raise OSError("injected precommit failure")

    if stage == "zip":
        monkeypatch.setattr(release_core, "_zip_package", fail)
    elif stage in {"es", "en"}:

        def smoke_fail(path: Path, language: str) -> int:
            if language == stage:
                fail()
            return smoke(path, language)

        monkeypatch.setattr(release_core, "_offline_smoke", smoke_fail)
    elif stage == "measurement":

        def hash_fail(path: Path) -> str:
            if path.suffix == ".zip":
                fail()
            return sha(path)

        monkeypatch.setattr(release_core, "sha256_file", hash_fail)
    elif stage in {"manifest", "evidence"}:

        def write_fail(path: Path, data: bytes) -> int:
            if (stage == "manifest" and path.name == "runtime-manifest-v1.json") or (
                stage == "evidence" and path.name == release_core.PACKAGE_EVIDENCE_NAME
            ):
                fail()
            return write_bytes(path, data)

        monkeypatch.setattr(Path, "write_bytes", write_fail)
    else:
        destination = outputs[int(stage[-1])]

        def replace_fail(path: Path, target: Path) -> Path:
            if target == destination and not path.name.endswith(".previous"):
                fail()
            return replace(path, target)

        monkeypatch.setattr(Path, "replace", replace_fail)
    with pytest.raises((OSError, ReleaseCoreError)):
        release_core.build_package(write_manifest=True, sync=False)
    assert (outputs[0] / "old.txt").read_bytes() == b"old runtime"
    assert {path: path.read_bytes() for path in outputs[1:]} == before
    assert sentinel.read_bytes() == b"keep"


@pytest.mark.parametrize(
    "field", ["profileId", "runtimeVoice", "targetDirectory", "language", "duplicate", "missing"]
)
def test_spm_core_rejects_metadata_before_mutation(spm_core_builder: Path, field: str) -> None:
    source_path = spm_core_builder / "services/tts/release/core/source-manifest-v1.json"
    source = json.loads(source_path.read_bytes())
    if field == "duplicate":
        source["voices"][1] = source["voices"][0]
    elif field == "missing":
        source["voices"].pop()
    else:
        source["voices"][0][field] = "invalid"
    source_path.write_bytes(render_manifest(source))
    with pytest.raises(ReleaseCoreError, match="profile"):
        release_core.build_package(write_manifest=True, sync=False)
    assert not spm_core_outputs(spm_core_builder)[0].parent.exists()


def test_spm_core_successful_first_build_and_replacement(spm_core_builder: Path) -> None:
    for _ in range(2):
        measurement = release_core.build_package(write_manifest=True, sync=False)
        release_core.check_tracked_manifest()
        outputs = spm_core_outputs(spm_core_builder)
        evidence = json.loads(outputs[3].read_bytes())
        assert evidence["measurements"]["archiveSha256"] == measurement.archive_sha256
        assert evidence["authority"]["runtimeManifestSha256"] == release_core.sha256_file(
            outputs[2]
        )


@pytest.mark.parametrize("stage", ["rollback", "cleanup"])
def test_spm_core_retains_recovery_material_and_reports_commit_boundary(
    spm_core_builder: Path, monkeypatch: pytest.MonkeyPatch, stage: str
) -> None:
    outputs = spm_core_outputs(spm_core_builder)
    _write_tree(outputs[0], {"old.txt": b"old"})
    replace = Path.replace
    remove = release_core._remove_output
    backup = outputs[0].with_name(f".{outputs[0].name}.previous")

    def fail_replace(path: Path, target: Path) -> Path:
        if target == outputs[1] or path == backup:
            raise OSError("injected rollback failure")
        return replace(path, target)

    def fail_remove(path: Path) -> None:
        if path == backup:
            raise OSError("injected backup cleanup failure")
        remove(path)

    if stage == "rollback":
        monkeypatch.setattr(Path, "replace", fail_replace)
    else:
        monkeypatch.setattr(release_core, "_remove_output", fail_remove)
    with pytest.raises((OSError, ReleaseCoreError)) as error:
        release_core.build_package(write_manifest=True, sync=False)
    assert (backup / "old.txt").read_bytes() == b"old"
    if stage == "cleanup":
        assert "after-commit" in str(error.value)
        release_core.check_tracked_manifest()
    else:
        assert not outputs[0].exists()


def test_spm_core_check_rejects_bad_profile_tuple(spm_core_builder: Path) -> None:
    release_core.build_package(write_manifest=True, sync=False)
    outputs = spm_core_outputs(spm_core_builder)
    manifest = json.loads(outputs[2].read_bytes())
    manifest["runtime"]["profiles"][0]["runtimeVoice"] = "invalid"
    for path in [outputs[2], outputs[0] / "runtime-manifest-v1.json"]:
        path.write_bytes(render_manifest(manifest))
    with pytest.raises(ReleaseCoreError, match="profile"):
        release_core.check_tracked_manifest()
