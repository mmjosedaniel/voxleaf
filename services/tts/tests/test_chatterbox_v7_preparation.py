"""The msgpack successor remains isolated from published package authority."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

from voxleaf_tts import release_chatterbox
from voxleaf_tts.packaging import chatterbox_authority as authority
from voxleaf_tts.packaging import chatterbox_v6_authority
from voxleaf_tts.packaging.chatterbox_integrity import (
    PackageLayout,
    ReleaseChatterboxError,
    repository_root,
)
from voxleaf_tts.packaging.chatterbox_sources import resolve_runtime_sources


def test_native_observer_is_content_free_and_preserves_forwarding(tmp_path: Path) -> None:
    program = r"""
import json, pathlib, runpy, socket, sys, types
root=pathlib.Path(sys.argv[2]); receipt=root/'observation.json'
class Tensor:
    dtype='torch.float32'
    def is_floating_point(self): return True
class Module:
    def parameters(self): return [Tensor()]
class Transformer(Module):
    def forward(self, *args, **kwargs):
        assert not args and set(kwargs)=={'inputs_embeds'}
        return 42
class Engine:
    def load(self):
        t3=Module(); t3.tfmr=Transformer()
        self._model=types.SimpleNamespace(t3=t3,s3gen=Module(),ve=Module())
adapter=types.ModuleType('voxleaf_tts.chatterbox_adapter')
adapter.ChatterboxMultilingualTtsEngine=Engine
sys.modules['voxleaf_tts.chatterbox_adapter']=adapter
torch=types.ModuleType('torch');torch.Tensor=Tensor
torch.is_autocast_enabled=lambda device:False
torch.cuda=types.SimpleNamespace(get_device_capability=lambda:(12,0))
sys.modules['torch']=torch
runpy.run_path(sys.argv[1])['install_native_observation'](receipt,['owned/private.dll'])
engine=Engine();engine.load()
assert engine._model.t3.tfmr.forward(inputs_embeds=Tensor())==42
observed=json.loads(receipt.read_text())
assert observed['parameterDtypes']=={name:['torch.float32'] for name in ('t3','s3gen','ve')}
assert observed['activationDtypes']==['torch.float32']
assert observed['autocastEnabledAtLoad'] is False
assert observed['autocastEnabledAtForward'] is False
assert observed['networkAttempts']==observed['audioFilesWritten']==0
try: socket.create_connection(('unused.invalid',443))
except AssertionError: pass
else: raise AssertionError('network guard absent')
try: (root/'never.wav').write_bytes(b'forbidden')
except AssertionError: pass
else: raise AssertionError('audio guard absent')
assert not (root/'never.wav').exists()
observed=json.loads(receipt.read_text())
assert observed['networkAttempts']==observed['audioFilesWritten']==1
assert 'inputs_embeds' not in receipt.read_text()
"""
    result = subprocess.run(
        [
            sys.executable,
            "-I",
            "-B",
            "-c",
            program,
            str(repository_root() / "scripts/test-chatterbox-runtime-smoke.py"),
            str(tmp_path),
        ],
        capture_output=True,
        check=False,
        timeout=10,
    )
    assert result.returncode == 0, result.stderr.decode("utf-8", errors="replace")


def test_v7_is_an_independent_one_pin_hashed_successor() -> None:
    root = repository_root()
    pins = []
    for version in ("6", "7"):
        text = (root / PackageLayout(version).lock_path).read_text()
        pins.append(dict(re.findall(r"^([a-z0-9-]+)(==[^\s]+| @ [^\s]+)", text, re.M)))
        lines = text.splitlines()
        for index, line in enumerate(lines):
            if re.match(r"^[a-z0-9-]+(?:==| @ )", line):
                assert lines[index + 1].lstrip().startswith("--hash=sha256:")
    old, new = pins
    assert len(old) == len(new) == 79
    assert old.keys() == new.keys()
    assert {name: value for name, value in new.items() if value != old[name]} == {
        "msgpack": "==1.2.3",
    }


@pytest.mark.parametrize("cli", [False, True])
def test_v7_requires_sync_before_source_or_output(
    monkeypatch: pytest.MonkeyPatch, cli: bool
) -> None:
    def unexpected_root() -> Path:
        raise AssertionError("source-or-output-access-before-sync-guard")

    monkeypatch.setattr(release_chatterbox, "repository_root", unexpected_root)
    with pytest.raises(ReleaseChatterboxError, match="security-sync-required"):
        if cli:
            release_chatterbox.main(["build", "--package-version", "7", "--no-sync"])
        else:
            release_chatterbox.build_package(package_version="7", synchronise=False)


@pytest.mark.parametrize("command", ["reconcile-evidence"])
def test_v7_reconciliation_cannot_reach_other_authorities(
    monkeypatch: pytest.MonkeyPatch, command: str
) -> None:
    def unexpected() -> None:
        raise AssertionError("historical-authority-reached")

    for name in (
        "check_security_authority",
        "load_acquisition_manifest",
        "reconcile_runtime_evidence",
    ):
        monkeypatch.setattr(release_chatterbox, name, unexpected)
    monkeypatch.setattr(chatterbox_v6_authority, "check_security_authority", unexpected)
    with pytest.raises(SystemExit) as caught:
        release_chatterbox.main([command, "--package-version", "7"])
    assert caught.value.code == 2


def test_v7_preserves_frozen_modules_models_and_python() -> None:
    root = repository_root()
    old = authority.load_source_manifest(root, package_version="6")
    new = authority.load_source_manifest(root, package_version="7")
    for key in ("modelFiles", "python", "runtimeModules", "provenance"):
        assert new[key] == old[key]
    assert new["packageId"] == "voxleaf-chatterbox-v7"
    release = new["runtimeRelease"]
    assert isinstance(release, dict)
    assert release["tag"] == "chatterbox-runtime-v7"
    assert resolve_runtime_sources(root, new) == resolve_runtime_sources(root, old)


@pytest.mark.parametrize("drift", ["model", "lock", "module"])
def test_v7_rejects_source_drift_preserving_v6(tmp_path: Path, drift: str) -> None:
    root = repository_root()
    for version in ("2", "3", "5", "6", "7"):
        for relative in (
            PackageLayout(version).lock_path,
            f"services/tts/release/optional/chatterbox/source-manifest-v{version}.json",
        ):
            target = tmp_path / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(root / relative, target)
    historical = tmp_path / "services/tts/release/optional/chatterbox/source-manifest-v6.json"
    original = historical.read_bytes()
    recipe = authority.write_security_source_manifest(tmp_path, package_version="7")
    authority.load_source_manifest(tmp_path, package_version="7")
    assert historical.read_bytes() == original
    if drift == "lock":
        lock = tmp_path / PackageLayout("7").lock_path
        lock.write_bytes(lock.read_bytes() + b"\n# drift\n")
    else:
        manifest = json.loads(recipe.read_bytes())
        if drift == "model":
            manifest["modelFiles"][0]["sha256"] = "a" * 64
        else:
            manifest["runtimeModules"].append("unapproved.py")
        recipe.write_text(json.dumps(manifest))
    with pytest.raises(ReleaseChatterboxError, match="source-manifest-invalid"):
        authority.load_source_manifest(tmp_path, package_version="7")


def test_v7_sync_uses_its_exact_hashed_lock(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    calls: list[list[str]] = []
    monkeypatch.setattr(
        "voxleaf_tts.release_chatterbox.subprocess.run",
        lambda command, **kwargs: calls.append(command),
    )
    release_chatterbox._synchronise_environment(
        tmp_path, tmp_path / "isolated", package_version="7"
    )
    assert "--require-hashes" in calls[1]
    assert str(tmp_path / PackageLayout("7").lock_path) in calls[1]


def test_v7_check_local_reports_current_artifact(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    calls = []
    monkeypatch.setattr(
        release_chatterbox, "check_local_package", lambda **kwargs: calls.append(kwargs)
    )
    assert (
        release_chatterbox.main(
            ["check-local", "--package-version", "7", "--output-root", str(tmp_path)]
        )
        == 0
    )
    assert calls == [{"package_version": "7", "output_root": tmp_path}]
    assert capsys.readouterr().out.strip() == "chatterbox-optional-v7-local:current"
