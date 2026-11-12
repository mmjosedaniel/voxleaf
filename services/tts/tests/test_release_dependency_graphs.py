from __future__ import annotations

import hashlib
import importlib.util
import json
import re
import tomllib
from pathlib import Path
from types import ModuleType
from typing import cast

import pytest

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
RELEASE_ROOT = REPOSITORY_ROOT / "services" / "tts" / "release"
CORE_PROJECT = RELEASE_ROOT / "core" / "pyproject.toml"
CORE_LOCK = RELEASE_ROOT / "core" / "uv.lock"
CHATTERBOX_REQUIREMENTS = RELEASE_ROOT / "profiles" / "chatterbox" / "requirements.in"
CHATTERBOX_LOCK = RELEASE_ROOT / "profiles" / "chatterbox" / "requirements.lock"
AUDIT_POLICY = RELEASE_ROOT / "audit-policy.json"
COMPONENT_INVENTORY = RELEASE_ROOT / "component-inventory-v1.json"
PYTHON_LICENSE_EVIDENCE = RELEASE_ROOT / "python-license-evidence.json"
ONNX_WINDOWS_WHEEL = (
    "https://files.pythonhosted.org/packages/be/ed/"
    "b12cea136ccd7b03d924f46b8393faf7ceac21115c0c50e729faa248cf23/"
    "onnxruntime-1.31.0-cp312-cp312-win_amd64.whl"
)
ONNX_WINDOWS_INTEGRITY = {
    "algorithm": "SHA-256",
    "value": "09d56445c1753e66e0912de69d3f0184016ad9a191dcd6925bf5dd570d2bfbe5",
    "lockedArtifact": ONNX_WINDOWS_WHEEL,
    "sizeBytes": 14_888_841,
    "lock": "services/tts/release/core/uv.lock",
}


@pytest.fixture
def inventory_tool() -> ModuleType:
    spec = importlib.util.spec_from_file_location(
        "release_inventory", REPOSITORY_ROOT / "scripts/release_inventory.py"
    )
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_five_pass_3_4_onnx_identifies_exact_windows_artifact(inventory_tool: ModuleType) -> None:
    components = inventory_tool._uv_components(inventory_tool._python_licenses())
    onnx = next(component for component in components if component["name"] == "onnxruntime")
    assert onnx["integrity"] == ONNX_WINDOWS_INTEGRITY


def _wheel_url(filename: str) -> str:
    return f"https://example.invalid/{filename}"


def _synthetic_core_component(
    inventory_tool: ModuleType,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    wheels: tuple[str, ...],
    *,
    sdist: str | None = None,
    registry: bool = True,
) -> dict[str, object]:
    lock = tmp_path / "uv.lock"

    def artifact(url: str) -> str:
        digest = hashlib.sha256(url.encode()).hexdigest()
        return f'{{ url = {json.dumps(url)}, hash = "sha256:{digest}", size = 42 }}'

    source = '{ registry = "https://pypi.org/simple" }' if registry else '{ editable = "../../" }'
    rows = ", ".join(artifact(url) for url in wheels)
    lock.write_text(
        f'[[package]]\nname = "example"\nversion = "1"\nsource = {source}\n'
        + (f"sdist = {artifact(sdist)}\n" if sdist is not None else "")
        + f"wheels = [{rows}]\n",
        encoding="utf-8",
    )
    monkeypatch.setattr(inventory_tool, "CORE_LOCK", lock)
    licenses = {"example==1": {"license": "MIT", "evidence": "synthetic"}}
    return cast(dict[str, object], inventory_tool._uv_components(licenses)[0])


def test_five_pass_3_4_preference_is_independent_of_lock_order(
    inventory_tool: ModuleType, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    windows = _wheel_url("example-1-cp312-cp312-win_amd64.whl")
    wheels = (
        _wheel_url("example-1-cp312-cp312-macosx_11_0_arm64.whl"),
        _wheel_url("example-1-py3-none-any.whl"),
        windows,
        _wheel_url("example-1-cp311-abi3-win_amd64.whl"),
    )
    for order in (wheels, tuple(reversed(wheels))):
        component = _synthetic_core_component(inventory_tool, tmp_path, monkeypatch, order)
        assert cast(dict[str, object], component["integrity"])["lockedArtifact"] == windows


@pytest.mark.parametrize(
    ("preferred", "alternate"),
    [
        ("cp311.cp312-abi3.cp312-win32.win_amd64.whl", "cp312-abi3-win_amd64.whl"),
        ("cp312-none-win_amd64.whl", "cp311-abi3-win_amd64.whl"),
        ("cp310-abi3-win_amd64.whl", "py312-none-win_amd64.whl"),
        ("py312-none-win_amd64.whl", "cp312-none-any.whl"),
        ("cp312-none-any.whl", "py312-none-any.whl"),
        ("py2%2Epy3-none-any.whl?download=1", "py311-none-any.whl"),
    ],
)
def test_five_pass_3_4_fixed_target_ranks_compatible_compound_and_fallback_tags(
    inventory_tool: ModuleType,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    preferred: str,
    alternate: str,
) -> None:
    best = _wheel_url(f"example-1-{preferred}")
    component = _synthetic_core_component(
        inventory_tool, tmp_path, monkeypatch, (_wheel_url(f"example-1-{alternate}"), best)
    )
    assert cast(dict[str, object], component["integrity"])["lockedArtifact"] == best


def test_five_pass_3_4_rejects_distinct_best_ties_but_ignores_lower_ties_and_duplicates(
    inventory_tool: ModuleType, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    first = _wheel_url("example-1-1-cp312-abi3-win_amd64.whl")
    second = _wheel_url("example-1-2-cp312-abi3-win_amd64.whl")
    best = _wheel_url("example-1-cp312-cp312-win_amd64.whl")
    for order in ((first, second), (second, first)):
        with pytest.raises(ValueError, match=":ambiguous-wheel:example$"):
            _synthetic_core_component(inventory_tool, tmp_path, monkeypatch, order)
        component = _synthetic_core_component(
            inventory_tool, tmp_path, monkeypatch, (*order, best, best)
        )
        assert cast(dict[str, object], component["integrity"])["lockedArtifact"] == best


@pytest.mark.parametrize(
    "wheel",
    [
        None,
        "cp312-cp312-manylinux_2_17_x86_64.whl",
        "cp312-cp312-win_arm64.whl",
        "cp311-cp311-win_amd64.whl",
        "cp313-abi3-win_amd64.whl",
        "cp312-cp312t-win_amd64.whl",
        "py313-none-any.whl",
        "py3-abi3-any.whl",
        "py3-none-any.zip",
    ],
)
def test_five_pass_3_4_rejects_unsupported_or_missing_registry_wheel(
    inventory_tool: ModuleType,
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    wheel: str | None,
) -> None:
    wheels = () if wheel is None else (_wheel_url(f"example-1-{wheel}"),)
    with pytest.raises(ValueError, match=":no-compatible-wheel:example$"):
        _synthetic_core_component(inventory_tool, tmp_path, monkeypatch, wheels)


def test_five_pass_3_4_preserves_source_and_local_provenance(
    inventory_tool: ModuleType, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    wheels = (_wheel_url("example-1-cp312-cp312-win_amd64.whl"),)
    sdist = _wheel_url("example-1.tar.gz")
    registry = _synthetic_core_component(inventory_tool, tmp_path, monkeypatch, wheels, sdist=sdist)
    assert cast(dict[str, object], registry["integrity"])["lockedArtifact"] == sdist
    local = _synthetic_core_component(inventory_tool, tmp_path, monkeypatch, (), registry=False)
    assert local["source"] == "repository:services/tts"
    assert local["integrity"] is None
    local_with_sdist = _synthetic_core_component(
        inventory_tool, tmp_path, monkeypatch, wheels, sdist=sdist, registry=False
    )
    assert local_with_sdist["source"] == "repository:services/tts"
    assert cast(dict[str, object], local_with_sdist["integrity"])["lockedArtifact"] == sdist


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
        "onnxruntime==1.31.0",
        "piper-tts==1.8.0",
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
    assert len(components) == 418
    assert len({component["id"] for component in components}) == len(components)
    onnx = next(
        component for component in components if component["id"] == "pypi:onnxruntime@1.31.0"
    )
    assert onnx["integrity"] == ONNX_WINDOWS_INTEGRITY
    assert {
        component["id"]
        for component in components
        if component["ecosystem"] == "node"
        and component["name"] in {"@tauri-apps/api", "@zip.js/zip.js", "react", "react-dom"}
    } == {
        "npm:@tauri-apps/api@2.12.4",
        "npm:@zip.js/zip.js@2.23.0",
        "npm:react@19.3.1",
        "npm:react-dom@19.3.1",
    }
    assert {
        component["id"]
        for component in components
        if component["ecosystem"] == "rust" and component["name"] in {"reqwest", "base64"}
    } == {"cargo:reqwest@0.13.5", "cargo:base64@0.22.1", "cargo:base64@0.23.1"}
    assert {
        component["id"]
        for component in components
        if component["ecosystem"] == "rust" and component["name"] == "windows"
    } == {"cargo:windows@0.61.3", "cargo:windows@0.62.2"}
    assert {
        component["id"]
        for component in components
        if component["ecosystem"] == "rust"
        and component["name"] in {"zip", "typed-path", "zlib-rs"}
    } == {"cargo:zip@9.0.4", "cargo:typed-path@0.12.3", "cargo:zlib-rs@0.6.7"}
    assert {
        component["id"]
        for component in components
        if component["ecosystem"] == "rust" and component["name"] in {"sha2", "digest"}
    } == {
        "cargo:sha2@0.10.9",
        "cargo:sha2@0.11.1",
        "cargo:digest@0.10.7",
        "cargo:digest@0.11.3",
    }
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
    assert inventory["lockIdentities"]["chatterboxOptional"]["sha256"] == _sha256(
        RELEASE_ROOT / "profiles" / "chatterbox-v7" / "requirements.lock"
    )
    assert {
        component["integrity"]["lock"]
        for component in components
        if component["scope"] == "optional" and component["ecosystem"] == "python"
    } == {inventory["lockIdentities"]["chatterboxOptional"]["path"]}


def test_python_licence_evidence_contains_only_exact_release_components() -> None:
    inventory = json.loads(COMPONENT_INVENTORY.read_text(encoding="utf-8"))
    evidence = json.loads(PYTHON_LICENSE_EVIDENCE.read_text(encoding="utf-8"))
    records = evidence["records"]
    identities = [f"{record['name']}=={record['version']}" for record in records]
    expected = {
        f"{component['name']}=={component['versionOrRevision']}"
        for component in inventory["components"]
        if component["ecosystem"] == "python"
    }
    assert evidence["schemaVersion"] == 1
    assert len(records) == 85
    assert identities == sorted(identities)
    assert set(identities) == expected


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def test_active_successor_graph_is_security_refreshed_and_exact() -> None:
    successor = RELEASE_ROOT / "profiles" / "chatterbox-v7"
    requirements = (successor / "requirements.in").read_text()
    assert "transformers==5.17.0" in requirements
    assert "tokenizers==0.23.1" in requirements
    assert "urllib3==2.8.0" in requirements
    assert "certifi==2026.10.19" in requirements
    assert "pillow==13.0.0" in requirements
    assert "filelock==4.2.1" in requirements
    assert "setuptools==84.1.0" in requirements
    assert "msgpack==1.2.3" in requirements
    assert len(_requirement_blocks(successor / "requirements.lock")) == 79
    policy = json.loads(AUDIT_POLICY.read_text())
    graph = next(graph for graph in policy["pythonGraphs"] if graph["id"] == "chatterbox-optional")
    expected = "services/tts/release/profiles/chatterbox-v7/requirements.lock"
    assert graph["lock"] == expected
    assert graph["requirements"] == expected
    inventory = json.loads(COMPONENT_INVENTORY.read_text())
    components = {
        component["name"]: component
        for component in inventory["components"]
        if component["scope"] == "optional" and component["ecosystem"] == "python"
    }
    for name, version in {
        "transformers": "5.17.0",
        "tokenizers": "0.23.1",
        "urllib3": "2.8.0",
        "certifi": "2026.10.19",
        "pillow": "13.0.0",
        "filelock": "4.2.1",
        "setuptools": "84.1.0",
        "msgpack": "1.2.3",
    }.items():
        assert components[name]["versionOrRevision"] == version
