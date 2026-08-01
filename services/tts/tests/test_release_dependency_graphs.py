from __future__ import annotations

import hashlib
import json
import re
import tomllib
from pathlib import Path
from typing import cast

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
RELEASE_ROOT = REPOSITORY_ROOT / "services" / "tts" / "release"
CORE_PROJECT = RELEASE_ROOT / "core" / "pyproject.toml"
CORE_LOCK = RELEASE_ROOT / "core" / "uv.lock"
CHATTERBOX_REQUIREMENTS = RELEASE_ROOT / "profiles" / "chatterbox" / "requirements.in"
CHATTERBOX_LOCK = RELEASE_ROOT / "profiles" / "chatterbox" / "requirements.lock"
AUDIT_POLICY = RELEASE_ROOT / "audit-policy.json"
COMPONENT_INVENTORY = RELEASE_ROOT / "component-inventory-v1.json"

WEB_AND_DEVELOPMENT_PACKAGES = {
    "fastapi",
    "gradio",
    "matplotlib",
    "pandas",
    "pre-commit",
    "pyloudnorm",
    "starlette",
    "tensorboard",
    "uvicorn",
}


def _locked_python_packages(path: Path) -> set[str]:
    parsed = tomllib.loads(path.read_text(encoding="utf-8"))
    packages = cast(list[dict[str, object]], parsed["package"])
    return {cast(str, package["name"]) for package in packages}


def _requirement_blocks(path: Path) -> tuple[str, ...]:
    blocks: list[list[str]] = []
    current: list[str] | None = None
    for line in path.read_text(encoding="utf-8").splitlines():
        if line and not line[0].isspace() and not line.startswith("#"):
            if current is not None:
                blocks.append(current)
            current = [line]
        elif current is not None:
            current.append(line)
    if current is not None:
        blocks.append(current)
    return tuple("\n".join(block) for block in blocks)


def test_core_release_graph_is_minimal_and_exact() -> None:
    project = tomllib.loads(CORE_PROJECT.read_text(encoding="utf-8"))
    assert project["project"]["requires-python"] == ">=3.12,<3.13"
    assert project["project"]["dependencies"] == [
        "onnxruntime==1.27.0",
        "piper-tts==1.4.2",
        "voxleaf-tts",
    ]
    assert _locked_python_packages(CORE_LOCK) == {
        "attrs",
        "flatbuffers",
        "jsonschema",
        "jsonschema-specifications",
        "numpy",
        "onnxruntime",
        "packaging",
        "pathvalidate",
        "piper-tts",
        "protobuf",
        "referencing",
        "rpds-py",
        "typing-extensions",
        "voxleaf-release-core-runtime",
        "voxleaf-tts",
    }
    assert not WEB_AND_DEVELOPMENT_PACKAGES & _locked_python_packages(CORE_LOCK)


def test_chatterbox_release_graph_excludes_dormant_surfaces() -> None:
    requirements = CHATTERBOX_REQUIREMENTS.read_text(encoding="utf-8").lower()
    requirement_names = {
        match.group(1)
        for line in requirements.splitlines()
        if not line.startswith("#")
        and (match := re.match(r"^([a-z0-9][a-z0-9._-]*)", line)) is not None
    }
    assert not WEB_AND_DEVELOPMENT_PACKAGES & requirement_names
    assert "diffusers==0.38.0" in requirements
    assert "transformers==5.5.0" in requirements
    assert "chatterbox/archive/5de7a54aa4e5e2baadb0182dde554908b48b85c2.zip" in requirements
    assert "perth/archive/ce86c49d029f42272c1902eccb675556b9ed2330.zip" in requirements
    assert "torch-2.9.1%2bcu128-cp312-cp312-win_amd64.whl" in requirements
    assert "torchaudio-2.9.1%2bcu128-cp312-cp312-win_amd64.whl" in requirements


def test_every_chatterbox_requirement_has_locked_integrity_evidence() -> None:
    blocks = _requirement_blocks(CHATTERBOX_LOCK)
    assert len(blocks) == 79
    for block in blocks:
        assert "--hash=sha256:" in block, block.splitlines()[0]
    lock = CHATTERBOX_LOCK.read_text(encoding="utf-8")
    assert "bb7363a76c0c0432a0305681fe2e533bbfb0f10fcf7b98d75a439d9a909f1576" in lock
    assert "733735f3191589136587695111b1a09975a8f758a76aea6dac587ed6cc74ebc2" in lock
    assert "3a01f0" in lock
    assert "88896c" in lock


def test_release_audit_policy_never_treats_unknown_url_packages_as_clean() -> None:
    policy = json.loads(AUDIT_POLICY.read_text(encoding="utf-8"))
    graphs = {graph["id"]: graph for graph in policy["pythonGraphs"]}
    assert set(graphs) == {"base-service", "piper-core", "chatterbox-optional"}
    assert graphs["base-service"]["expectedBlindSpots"] == []
    assert graphs["piper-core"]["expectedBlindSpots"] == []
    blind_spots = graphs["chatterbox-optional"]["expectedBlindSpots"]
    assert {blind_spot["name"] for blind_spot in blind_spots} == {
        "chatterbox-tts",
        "resemble-perth",
        "torch",
        "torchaudio",
    }
    assert all("manual review" in blind_spot["reason"] for blind_spot in blind_spots)
    assert policy["rustInformationalWarnings"]
    assert all("windowsReachable" in warning for warning in policy["rustInformationalWarnings"])


def test_release_component_inventory_is_complete_and_content_safe() -> None:
    inventory = json.loads(COMPONENT_INVENTORY.read_text(encoding="utf-8"))
    components = inventory["components"]
    assert len(components) == 363
    assert len({component["id"] for component in components}) == len(components)
    assert {component["scope"] for component in components} == {
        "core",
        "optional",
        "not-shipped",
    }
    required_fields = {
        "id",
        "scope",
        "ecosystem",
        "name",
        "versionOrRevision",
        "platform",
        "source",
        "integrity",
        "license",
        "provenance",
        "inclusion",
        "auditRef",
        "artifactState",
        "ownership",
    }
    assert all(required_fields <= component.keys() for component in components)
    assert all(component["license"]["expression"] for component in components)
    assert all("book" not in json.dumps(component).lower() for component in components)
    optional_names = {
        component["name"]
        for component in components
        if component["scope"] == "optional" and component["ecosystem"] == "python"
    }
    assert not WEB_AND_DEVELOPMENT_PACKAGES & optional_names
    assert {
        component["name"] for component in components if component["scope"] == "not-shipped"
    } == {"Qwen development profiles"}
    assert inventory["lockIdentities"]["piperCore"]["sha256"] == _sha256(CORE_LOCK)
    assert inventory["lockIdentities"]["chatterboxOptional"]["sha256"] == _sha256(CHATTERBOX_LOCK)


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()
