"""Fresh-process copied-runtime boundaries, without provider dependencies."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

import jsonschema
import pytest

from voxleaf_tts.packaging.chatterbox_integrity import repository_root
from voxleaf_tts.release_core import _copy_site_packages


@pytest.mark.parametrize(
    "entrypoint,expected,forbidden",
    [
        ("service", "fake", ["piper", "chatterbox", "qwen"]),
        ("piper_service", "piper", ["chatterbox", "qwen"]),
        ("chatterbox_service", "chatterbox", ["piper", "qwen"]),
        ("qwen_service", "qwen", ["piper", "chatterbox"]),
    ],
)
def test_copied_entrypoints_are_lazy_and_resolve_only_the_copied_package(
    tmp_path: Path, entrypoint: str, expected: str, forbidden: list[str]
) -> None:
    source = repository_root() / "services/tts/src/voxleaf_tts"
    payload = tmp_path / "site-packages"
    shutil.copytree(source, payload / "voxleaf_tts", ignore=shutil.ignore_patterns("__pycache__"))
    # Only protocol dependencies come from the interpreter environment; no checkout source.
    dependency_file = jsonschema.__file__
    assert isinstance(dependency_file, str)
    dependency_site = Path(dependency_file).resolve().parent.parent
    script = (
        "import importlib,json,sys;from pathlib import Path;"
        f"sys.path[:0]=[{str(payload)!r},{str(dependency_site)!r}];"
        f"importlib.import_module('voxleaf_tts.{entrypoint}');"
        "modules={name:str(module.__file__) for name,module in sys.modules.items() "
        "if name.startswith('voxleaf_tts') and getattr(module,'__file__',None)};"
        "print(json.dumps({'modules':modules,'optional':[name for name in sys.modules "
        "if name.split('.')[0] in {'piper','chatterbox','qwen_tts','torch','numpy'}]}))"
    )
    completed = subprocess.run(
        [sys.executable, "-I", "-B", "-c", script],
        cwd=tmp_path,
        check=True,
        capture_output=True,
        text=True,
    )
    report = json.loads(completed.stdout)
    assert f"voxleaf_tts.adapters.{expected}" in report["modules"]
    assert all(f"voxleaf_tts.adapters.{name}" not in report["modules"] for name in forbidden)
    assert report["optional"] == []
    assert all(Path(location).is_relative_to(payload) for location in report["modules"].values())
    assert (payload / "voxleaf_tts/adapters/__init__.py").read_bytes() == b""
    assert all(
        not (payload / "voxleaf_tts" / f"{name}.py").exists()
        for name in ("piper_adapter", "chatterbox_adapter", "qwen_adapter", "fake_engine")
    )


def test_actual_piper_module_copy_has_closed_engine_dependencies(tmp_path: Path) -> None:
    source = tmp_path / "installed"
    shutil.copytree(
        repository_root() / "services/tts/src/voxleaf_tts",
        source / "voxleaf_tts",
        ignore=shutil.ignore_patterns("__pycache__"),
    )
    target = tmp_path / "payload"
    _copy_site_packages(source, target)
    modules = {
        path.relative_to(target / "voxleaf_tts").as_posix()
        for path in (target / "voxleaf_tts").rglob("*.py")
    }
    assert modules == {
        "__init__.py",
        "engine.py",
        "protocol.py",
        "service.py",
        "piper_service.py",
        "adapters/__init__.py",
        "adapters/piper.py",
        "adapters/fake.py",
        "generated/__init__.py",
        "generated/protocol_schemas.py",
    }
