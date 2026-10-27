"""Closed raw-Git provenance for the two historical runtime layouts.

Only maintainer tooling imports this module. Packaged services need neither Git
nor the checkout, and a missing historical blob never selects current source.
"""

from __future__ import annotations

import hashlib
import subprocess
from collections.abc import Mapping
from pathlib import Path
from typing import Final

from .chatterbox_integrity import PackageVersion, ReleaseChatterboxError

HISTORICAL_COMMITS: Final = {
    "2": "814fd2f70bd3588d31022207eb976c0ff93712a3",
    "3": "998c7b24cda7e969e9ed0344f348506bf38af3b0",
}
_BASE_IDENTITIES: Final = {
    "__init__.py": (240, "e73f48db20d063411d2b6e7a0b599a24b01159f3b233f5506c835cc09a8e49b5"),
    "chatterbox_adapter.py": (
        14193,
        "f7fd0e9f745954dbe5881a5428972793f619335a643a7d3b768368a6fdca707e",
    ),
    "chatterbox_service.py": (
        756,
        "feedf00f006699fea7fae2bed1d5192709be2e8b124ac48339bc99b44b284727",
    ),
    "engine.py": (2100, "29784f682d3d1201069b99abe757d286edf71ed3bcb55be4908aef7f4b63350b"),
    "fake_engine.py": (6915, "7a79f01a35a74ccdc0a08217e612f7e12c98cfabad58dde5e94ea84486791760"),
    "protocol.py": (12582, "792175578ceaf334f7cf9da25666ec8c6ec64a00e15d8756fc87cbf5b0b2b4f9"),
    "service.py": (15229, "5f64cfe8ff6960ec11a704ab44d5ad5a46d51ae32d57a6dff8c08e54d2389d12"),
}
HISTORICAL_IDENTITIES: Final = {
    "2": _BASE_IDENTITIES,
    "3": _BASE_IDENTITIES
    | {
        "generated/__init__.py": (
            62,
            "17a64d50b529456f687df12500bd11c344b421ca33d87e3aedc21c1cdad14033",
        ),
        "generated/protocol_schemas.py": (
            37039,
            "6a00feebccaf7584f8304bd796661790c90efaa30b641b96d20fcd858a5f8650",
        ),
    },
}
LOCAL_RUNTIME_MODULES: Final = (
    "__init__.py",
    "engine.py",
    "protocol.py",
    "service.py",
    "chatterbox_service.py",
    "adapters/__init__.py",
    "adapters/chatterbox.py",
    "adapters/fake.py",
    "generated/__init__.py",
    "generated/protocol_schemas.py",
)


def _read_git_blob(root: Path, commit: str, module: str) -> bytes:
    try:
        result = subprocess.run(
            [
                "git",
                "--no-replace-objects",
                "show",
                f"{commit}:services/tts/src/voxleaf_tts/{module}",
            ],
            cwd=root,
            check=True,
            capture_output=True,
            timeout=30,
        )
    except (OSError, subprocess.CalledProcessError, subprocess.TimeoutExpired):
        raise ReleaseChatterboxError("chatterbox-package-source-invalid") from None
    return result.stdout


def historical_sources(root: Path, version: PackageVersion) -> dict[str, bytes]:
    """Resolve and verify every frozen blob before any caller mutates output."""

    if version not in HISTORICAL_COMMITS:
        raise ReleaseChatterboxError("chatterbox-package-version-invalid")
    sources: dict[str, bytes] = {}
    for module, (size, digest) in HISTORICAL_IDENTITIES[version].items():
        payload = _read_git_blob(root, HISTORICAL_COMMITS[version], module)
        if len(payload) != size or hashlib.sha256(payload).hexdigest() != digest:
            raise ReleaseChatterboxError("chatterbox-package-source-invalid")
        sources[module] = payload
    return sources


def resolve_runtime_sources(root: Path, manifest: Mapping[str, object]) -> dict[str, bytes]:
    version = manifest.get("packageVersion")
    modules = manifest.get("runtimeModules")
    if not isinstance(version, str):
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    if version in {"2", "3", "5", "6", "7"}:
        source_version: PackageVersion = "2" if version == "2" else "3"
        if modules != list(HISTORICAL_IDENTITIES[source_version]):
            raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
        return historical_sources(root, source_version)
    if version != "4" or modules != list(LOCAL_RUNTIME_MODULES):
        raise ReleaseChatterboxError("chatterbox-package-source-manifest-invalid")
    source = root / "services/tts/src/voxleaf_tts"
    try:
        canonical = source.resolve(strict=True)
        resolved: dict[str, bytes] = {}
        for module in LOCAL_RUNTIME_MODULES:
            path = source / module
            if path.is_symlink() or not path.resolve(strict=True).is_relative_to(canonical):
                raise ReleaseChatterboxError("chatterbox-package-source-invalid")
            resolved[module] = path.read_bytes()
        return resolved
    except OSError:
        raise ReleaseChatterboxError("chatterbox-package-source-invalid") from None
