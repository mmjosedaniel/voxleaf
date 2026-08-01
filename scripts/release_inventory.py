from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import tomllib
from pathlib import Path
from typing import Any, cast


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
RELEASE_ROOT = REPOSITORY_ROOT / "services" / "tts" / "release"
INVENTORY_PATH = RELEASE_ROOT / "component-inventory-v1.json"
PYTHON_LICENSE_PATH = RELEASE_ROOT / "python-license-evidence.json"
CORE_LOCK = RELEASE_ROOT / "core" / "uv.lock"
CHATTERBOX_LOCK = RELEASE_ROOT / "profiles" / "chatterbox" / "requirements.lock"
CARGO_LOCK = REPOSITORY_ROOT / "apps" / "desktop" / "src-tauri" / "Cargo.lock"
PNPM_LOCK = REPOSITORY_ROOT / "pnpm-lock.yaml"
AUDIT_POLICY = RELEASE_ROOT / "audit-policy.json"

CHATTERBOX_URL_VERSIONS = {
    "chatterbox-tts": "0.1.7",
    "resemble-perth": "1.0.1",
    "torch": "2.9.1+cu128",
    "torchaudio": "2.9.1+cu128",
}

LICENSE_OVERRIDES = {
    "chatterbox-tts": "MIT",
    "colorama": "BSD-3-Clause",
    "jinja2": "BSD-3-Clause",
    "markdown-it-py": "MIT",
    "mdurl": "MIT",
    "numpy": "BSD-3-Clause AND bundled-third-party-notices",
    "resemble-perth": "MIT",
    "scipy": "BSD-3-Clause AND bundled-third-party-notices",
    "tokenizers": "Apache-2.0",
    "torch": "BSD-3-Clause",
    "torchaudio": "BSD-3-Clause",
    "voxleaf-tts": "MIT",
}

CLASSIFIER_LICENSES = {
    "License :: OSI Approved :: Apache Software License": "Apache-2.0",
    "License :: OSI Approved :: BSD License": "BSD-3-Clause",
    "License :: OSI Approved :: ISC License (ISCL)": "ISC",
    "License :: OSI Approved :: MIT License": "MIT",
    "License :: OSI Approved :: Mozilla Public License 2.0 (MPL 2.0)": "MPL-2.0",
}


def _normalize_name(name: str) -> str:
    return re.sub(r"[-_.]+", "-", name).lower()


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _run_json(command: list[str]) -> Any:
    executable = command[0]
    if sys.platform == "win32" and executable == "pnpm":
        executable = "pnpm.cmd"
    completed = subprocess.run(
        [executable, *command[1:]],
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return json.loads(completed.stdout)


def _metadata_script() -> str:
    return (
        "import importlib.metadata as m,json;"
        "print(json.dumps([{'name':d.metadata.get('Name'),'version':d.version,"
        "'expression':d.metadata.get('License-Expression') or '',"
        "'license':d.metadata.get('License') or '',"
        "'classifiers':[v for v in d.metadata.get_all('Classifier',[]) "
        "if v.startswith('License ::')],"
        "'homePage':d.metadata.get('Home-page') or d.metadata.get('Project-URL') or ''} "
        "for d in m.distributions()]))"
    )


def _normalize_license(record: dict[str, Any]) -> tuple[str, str]:
    name = _normalize_name(cast(str, record["name"]))
    if name in LICENSE_OVERRIDES:
        return LICENSE_OVERRIDES[name], "reviewed package metadata/source licence"
    expression = cast(str, record.get("expression", "")).strip()
    if expression:
        return expression, "installed package License-Expression"
    for classifier in cast(list[str], record.get("classifiers", [])):
        if classifier in CLASSIFIER_LICENSES:
            return CLASSIFIER_LICENSES[
                classifier
            ], "installed package licence classifier"
    raw = cast(str, record.get("license", "")).strip()
    known = {
        "3-Clause BSD License": "BSD-3-Clause",
        "Apache 2.0": "Apache-2.0",
        "Apache 2.0 License": "Apache-2.0",
        "Apache-2.0": "Apache-2.0",
        "Apache2.0": "Apache-2.0",
        "BSD": "BSD-3-Clause",
        "BSD 3-Clause License": "BSD-3-Clause",
        "BSD-2-Clause": "BSD-2-Clause",
        "BSD-3-Clause": "BSD-3-Clause",
        "GPL-3.0-or-later": "GPL-3.0-or-later",
        "ISC": "ISC",
        "ISC License": "ISC",
        "LGPL-2.1-or-later": "LGPL-2.1-or-later",
        "MIT": "MIT",
        "MIT License": "MIT",
        "MIT-0": "MIT-0",
        "MPL-2.0": "MPL-2.0",
        "MPL-2.0 AND MIT": "MPL-2.0 AND MIT",
        "PSF-2.0": "PSF-2.0",
    }
    if raw in known:
        return known[raw], "installed package License field"
    raise ValueError(f"Unresolved Python licence metadata for {name}")


def capture_python_licenses(interpreters: list[Path]) -> None:
    records: dict[str, dict[str, str]] = {}
    for interpreter in interpreters:
        completed = subprocess.run(
            [str(interpreter), "-c", _metadata_script()],
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        for raw_record in cast(list[dict[str, Any]], json.loads(completed.stdout)):
            name = _normalize_name(cast(str, raw_record["name"]))
            version = cast(str, raw_record["version"])
            license_expression, evidence = _normalize_license(raw_record)
            records[f"{name}=={version}"] = {
                "name": name,
                "version": version,
                "license": license_expression,
                "evidence": evidence,
            }
    records["voxleaf-tts==0.0.0"] = {
        "name": "voxleaf-tts",
        "version": "0.0.0",
        "license": "MIT",
        "evidence": "repository LICENSE",
    }
    PYTHON_LICENSE_PATH.write_text(
        json.dumps(
            {"schemaVersion": 1, "records": list(records.values())},
            indent=2,
            sort_keys=True,
        )
        + "\n",
        encoding="utf-8",
    )


def _python_licenses() -> dict[str, dict[str, str]]:
    parsed = json.loads(PYTHON_LICENSE_PATH.read_text(encoding="utf-8"))
    return {
        f"{record['name']}=={record['version']}": record for record in parsed["records"]
    }


def _component(
    *,
    component_id: str,
    scope: str,
    ecosystem: str,
    name: str,
    version: str,
    source: str,
    license_expression: str,
    license_evidence: str,
    integrity: dict[str, Any] | None,
    purpose: str,
    process_boundary: str,
    audit_ref: str,
    artifact_state: str,
) -> dict[str, Any]:
    return {
        "id": component_id,
        "scope": scope,
        "ecosystem": ecosystem,
        "name": name,
        "versionOrRevision": version,
        "platform": "Windows x64",
        "source": source,
        "integrity": integrity,
        "license": {
            "expression": license_expression,
            "evidence": license_evidence,
            "noticeOwner": "M011 release notices",
            "redistributionStatus": "pending M011 licence/provenance fulfillment",
        },
        "provenance": {
            "humanIdentityDeclared": False,
            "voiceOrModel": ecosystem == "model-artifact",
        },
        "inclusion": {
            "purpose": purpose,
            "runtimeReachability": "required by the frozen release graph",
            "processBoundary": process_boundary,
        },
        "auditRef": audit_ref,
        "artifactState": artifact_state,
        "ownership": {
            "installOrStagingOwner": "VoxLeaf native release boundary",
            "removalOwner": "VoxLeaf installer or native profile manager",
        },
    }


def _uv_components(licenses: dict[str, dict[str, str]]) -> list[dict[str, Any]]:
    parsed = tomllib.loads(CORE_LOCK.read_text(encoding="utf-8"))
    components: list[dict[str, Any]] = []
    for package in cast(list[dict[str, Any]], parsed["package"]):
        name = _normalize_name(cast(str, package["name"]))
        if name == "voxleaf-release-core-runtime":
            continue
        version = cast(str, package["version"])
        license_record = licenses[f"{name}=={version}"]
        source_data = cast(dict[str, Any], package.get("source", {}))
        if "registry" in source_data:
            source = f"https://pypi.org/project/{name}/{version}/"
        else:
            source = "repository:services/tts"
        artifact = cast(dict[str, Any] | None, package.get("sdist"))
        if artifact is None:
            wheels = cast(list[dict[str, Any]], package.get("wheels", []))
            artifact = wheels[0] if wheels else None
        integrity = None
        if artifact is not None:
            integrity = {
                "algorithm": "SHA-256",
                "value": cast(str, artifact["hash"]).removeprefix("sha256:"),
                "lockedArtifact": artifact.get("url"),
                "sizeBytes": artifact.get("size"),
                "lock": "services/tts/release/core/uv.lock",
            }
        components.append(
            _component(
                component_id=f"pypi:{name}@{version}",
                scope="core",
                ecosystem="python",
                name=name,
                version=version,
                source=source,
                license_expression=license_record["license"],
                license_evidence=license_record["evidence"],
                integrity=integrity,
                purpose="Minimal private local-service and Piper runtime graph.",
                process_boundary="private local TTS child",
                audit_ref="piper-core",
                artifact_state="dependency lock closed; packaged artifact selection belongs to M011 Milestone 3",
            )
        )
    return components


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


def _chatterbox_components(licenses: dict[str, dict[str, str]]) -> list[dict[str, Any]]:
    components: list[dict[str, Any]] = []
    for block in _requirement_blocks(CHATTERBOX_LOCK):
        first_line = block.splitlines()[0]
        pinned = re.match(r"^([a-zA-Z0-9._-]+)==([^ \\]+)", first_line)
        direct = re.match(r"^([a-zA-Z0-9._-]+) @ ([^ \\]+)", first_line)
        if pinned is not None:
            name = _normalize_name(pinned.group(1))
            version = pinned.group(2)
            source = f"https://pypi.org/project/{name}/{version}/"
        elif direct is not None:
            name = _normalize_name(direct.group(1))
            version = CHATTERBOX_URL_VERSIONS[name]
            source = direct.group(2)
        else:
            raise ValueError(f"Unsupported requirement: {first_line}")
        license_record = licenses[f"{name}=={version}"]
        hashes = re.findall(r"--hash=sha256:([0-9a-f]{64})", block)
        components.append(
            _component(
                component_id=f"python:{name}@{version}:chatterbox",
                scope="optional",
                ecosystem="python",
                name=name,
                version=version,
                source=source,
                license_expression=license_record["license"],
                license_evidence=license_record["evidence"],
                integrity={
                    "algorithm": "SHA-256",
                    "value": hashes[0],
                    "lockedAlternativeHashCount": len(hashes),
                    "lock": "services/tts/release/profiles/chatterbox/requirements.lock",
                },
                purpose="Minimal bilingual Chatterbox inference dependency.",
                process_boundary="optional private local TTS child",
                audit_ref="chatterbox-optional",
                artifact_state="dependency lock closed; downloadable artifact selection belongs to M011 Milestone 4",
            )
        )
    return components


def _node_components() -> list[dict[str, Any]]:
    grouped = cast(
        dict[str, list[dict[str, Any]]],
        _run_json(["pnpm", "licenses", "list", "--prod", "--json"]),
    )
    lock_text = PNPM_LOCK.read_text(encoding="utf-8")
    components: list[dict[str, Any]] = []
    for entries in grouped.values():
        for entry in entries:
            name = cast(str, entry["name"])
            for version in cast(list[str], entry["versions"]):
                marker = f"  {name}@{version}:"
                quoted_marker = f"  '{name}@{version}':"
                position = lock_text.find(marker)
                if position < 0:
                    position = lock_text.find(quoted_marker)
                block = lock_text[position : position + 500]
                match = re.search(r"integrity: ([^},]+)", block)
                integrity = (
                    {
                        "algorithm": "SHA-512",
                        "value": match.group(1).removeprefix("sha512-"),
                        "lock": "pnpm-lock.yaml",
                    }
                    if match is not None
                    else None
                )
                components.append(
                    _component(
                        component_id=f"npm:{name}@{version}",
                        scope="core",
                        ecosystem="node",
                        name=name,
                        version=version,
                        source=cast(
                            str,
                            entry.get("homepage")
                            or f"https://www.npmjs.com/package/{name}/v/{version}",
                        ),
                        license_expression=cast(str, entry["license"]),
                        license_evidence="pnpm production licence metadata",
                        integrity=integrity,
                        purpose="Production reader/desktop renderer dependency.",
                        process_boundary="Tauri WebView renderer",
                        audit_ref="production-node",
                        artifact_state="production lock closed; final bundled asset hash belongs to packaging",
                    )
                )
    return components


def _rust_components() -> list[dict[str, Any]]:
    metadata = cast(
        dict[str, Any],
        _run_json(
            [
                "cargo",
                "metadata",
                "--format-version",
                "1",
                "--locked",
                "--manifest-path",
                "apps/desktop/src-tauri/Cargo.toml",
                "--filter-platform",
                "x86_64-pc-windows-msvc",
            ]
        ),
    )
    cargo_lock = tomllib.loads(CARGO_LOCK.read_text(encoding="utf-8"))
    checksums = {
        (package["name"], package["version"]): package.get("checksum")
        for package in cast(list[dict[str, Any]], cargo_lock["package"])
    }
    components: list[dict[str, Any]] = []
    for package in cast(list[dict[str, Any]], metadata["packages"]):
        name = cast(str, package["name"])
        version = cast(str, package["version"])
        checksum = checksums.get((name, version))
        source = cast(str | None, package.get("source"))
        components.append(
            _component(
                component_id=f"cargo:{name}@{version}",
                scope="core",
                ecosystem="rust",
                name=name,
                version=version,
                source=(
                    f"https://crates.io/crates/{name}/{version}"
                    if source and source.startswith("registry+")
                    else (source or "repository:apps/desktop/src-tauri")
                ),
                license_expression=cast(str | None, package.get("license")) or "MIT",
                license_evidence="Cargo package metadata",
                integrity=(
                    {
                        "algorithm": "SHA-256",
                        "value": checksum,
                        "lock": "apps/desktop/src-tauri/Cargo.lock",
                    }
                    if checksum
                    else None
                ),
                purpose="Windows x64 desktop runtime or build dependency.",
                process_boundary="native Tauri desktop/build boundary",
                audit_ref="production-rust",
                artifact_state="Windows target lock closed; final executable hash belongs to packaging",
            )
        )
    return components


def _model_artifacts() -> list[dict[str, Any]]:
    artifacts = [
        (
            "core",
            "piper-davefx-onnx",
            "es_ES-davefx-medium.onnx",
            "0d907f158acc877ddeebcbf827659ee13bea8bcd",
            63201294,
            "6658b03b1a6c316ee4c265a9896abc1393353c2d9e1bca7d66c2c442e222a917",
            "CC0-1.0 provenance; redistribution review pending M011 Milestone 3",
        ),
        (
            "core",
            "piper-davefx-config",
            "es_ES-davefx-medium.onnx.json",
            "0d907f158acc877ddeebcbf827659ee13bea8bcd",
            4817,
            "0e0dda87c732f6f38771ff274a6380d9252f327dca77aa2963d5fbdf9ec54842",
            "CC0-1.0 provenance; redistribution review pending M011 Milestone 3",
        ),
        (
            "core",
            "piper-davefx-card",
            "MODEL_CARD",
            "0d907f158acc877ddeebcbf827659ee13bea8bcd",
            276,
            "420703b5d8ea239b729f13d83f31eea9bae5fcb89447de23ebc94aa8a4768f95",
            "CC0-1.0 provenance evidence",
        ),
        (
            "core",
            "piper-joe-onnx",
            "en_US-joe-medium.onnx",
            "0d907f158acc877ddeebcbf827659ee13bea8bcd",
            63201294,
            "58afce0321b8d9c46d7cdf9c16500cc55a793b4220212dba6b70fb788b3baf06",
            "CC0-1.0 provenance; redistribution review pending M011 Milestone 3",
        ),
        (
            "core",
            "piper-joe-config",
            "en_US-joe-medium.onnx.json",
            "0d907f158acc877ddeebcbf827659ee13bea8bcd",
            4794,
            "3d6d5410b3795cb1950595247ef8f06190719e6fdbfa3a2356d8ec368e1aad33",
            "CC0-1.0 provenance; redistribution review pending M011 Milestone 3",
        ),
        (
            "core",
            "piper-joe-card",
            "MODEL_CARD",
            "0d907f158acc877ddeebcbf827659ee13bea8bcd",
            281,
            "d2caa63aca0fccb155105e959e393e5c0c0f03a1f388ef5ba217b83ef860c760",
            "CC0-1.0 provenance evidence",
        ),
        (
            "optional",
            "chatterbox-t3",
            "t3_mtl23ls_v3.safetensors",
            "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18",
            2143989928,
            "5abca8321ede76f8e61f1cc0d19aea6c946b28871017ce8726f8a69203f05953",
            "MIT model-card evidence; fulfillment pending M011 Milestone 4",
        ),
        (
            "optional",
            "chatterbox-s3gen",
            "s3gen.pt",
            "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18",
            1057165844,
            "9b9ff07e60b20c136e2b1b3d7563a24604e8d2c4c267888d1ee929dd0151d2a3",
            "MIT model-card evidence; fulfillment pending M011 Milestone 4",
        ),
        (
            "optional",
            "chatterbox-ve",
            "ve.pt",
            "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18",
            5698626,
            "4b16d836bc598509860f6fa068165a8bb5e9ac84f05582dfcf278a5a372879f1",
            "MIT model-card evidence; fulfillment pending M011 Milestone 4",
        ),
        (
            "optional",
            "chatterbox-conds",
            "conds.pt",
            "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18",
            107374,
            "6552d70568833628ba019c6b03459e77fe71ca197d5c560cef9411bee9d87f4e",
            "MIT model-card evidence; fulfillment pending M011 Milestone 4",
        ),
        (
            "optional",
            "chatterbox-graphemes",
            "grapheme_mtl_merged_expanded_v1.json",
            "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18",
            69989,
            "69632f47220a788a52ce2661d096453c5655e9bf25289d89a8d832c46ee07dbf",
            "MIT model-card evidence; fulfillment pending M011 Milestone 4",
        ),
        (
            "optional",
            "chatterbox-cangjie",
            "Cangjie5_TC.json",
            "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18",
            1920163,
            "7073fd9de919443ae88e0bd2449917a65fe54898a4413ed1edcc4b67f28bce8c",
            "MIT model-card evidence; fulfillment pending M011 Milestone 4",
        ),
    ]
    result: list[dict[str, Any]] = []
    for (
        scope,
        component_id,
        filename,
        revision,
        size,
        digest,
        license_expression,
    ) in artifacts:
        result.append(
            _component(
                component_id=f"artifact:{component_id}@{revision}",
                scope=scope,
                ecosystem="model-artifact",
                name=filename,
                version=revision,
                source=(
                    "https://huggingface.co/rhasspy/piper-voices/tree/0d907f158acc877ddeebcbf827659ee13bea8bcd"
                    if component_id.startswith("piper-")
                    else "https://huggingface.co/ResembleAI/chatterbox/tree/5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
                ),
                license_expression=license_expression,
                license_evidence="exact adapter allowlist and upstream model card",
                integrity={"algorithm": "SHA-256", "value": digest, "sizeBytes": size},
                purpose="Frozen local narration voice/model artifact.",
                process_boundary="private local TTS child",
                audit_ref="piper-core" if scope == "core" else "chatterbox-optional",
                artifact_state="identity frozen; redistribution mechanics close in M011 Milestone 3 or 4",
            )
        )
    result.append(
        _component(
            component_id="profile:qwen-development-only",
            scope="not-shipped",
            ecosystem="model-artifact",
            name="Qwen development profiles",
            version="excluded from M011 MVP",
            source="https://huggingface.co/Qwen",
            license_expression="not redistributed",
            license_evidence="M011 frozen release authority",
            integrity=None,
            purpose="Retained only as repository development support; excluded from release payload.",
            process_boundary="development-only local TTS child",
            audit_ref="not-shipped",
            artifact_state="not shipped and not downloadable by the MVP",
        )
    )
    return result


def build_inventory() -> dict[str, Any]:
    licenses = _python_licenses()
    audit_policy = json.loads(AUDIT_POLICY.read_text(encoding="utf-8"))
    components = [
        *_node_components(),
        *_rust_components(),
        *_uv_components(licenses),
        *_chatterbox_components(licenses),
        *_model_artifacts(),
    ]
    components.sort(key=lambda component: cast(str, component["id"]))
    return {
        "schemaVersion": 1,
        "inventoryDate": "2026-08-01",
        "formatDecision": "Repository-owned JSON is used because release scope, reachability, ownership, profile state, and pending package-artifact fields are not represented proportionately by one ecosystem SBOM tool. Exact ecosystem locks remain the machine authority.",
        "target": "Windows x64 / Python 3.12",
        "lockIdentities": {
            "pnpm": {"path": "pnpm-lock.yaml", "sha256": _sha256(PNPM_LOCK)},
            "cargo": {
                "path": "apps/desktop/src-tauri/Cargo.lock",
                "sha256": _sha256(CARGO_LOCK),
            },
            "piperCore": {
                "path": "services/tts/release/core/uv.lock",
                "sha256": _sha256(CORE_LOCK),
            },
            "chatterboxOptional": {
                "path": "services/tts/release/profiles/chatterbox/requirements.lock",
                "sha256": _sha256(CHATTERBOX_LOCK),
            },
        },
        "audits": {
            "date": audit_policy["auditDate"],
            "tools": audit_policy["tools"],
            "result": "no known vulnerabilities; recorded informational RustSec notices and four optional Python advisory blind spots",
            "policy": "services/tts/release/audit-policy.json",
        },
        "limitations": [
            "Package-source hashes close dependency identity; final installer/runtime/archive hashes and byte sizes are added by M011 Milestones 3-5.",
            "Python URL requirements are explicit advisory blind spots even though their source/wheel identity and SHA-256 are frozen.",
            "Licence/provenance evidence is inventory input, not final redistribution clearance; M011 Milestones 3 and 4 own notice/source/model fulfillment.",
        ],
        "components": components,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--write", action="store_true")
    group.add_argument("--check", action="store_true")
    group.add_argument("--capture-python-licenses", action="store_true")
    parser.add_argument("--python", action="append", type=Path, default=[])
    args = parser.parse_args()
    if args.capture_python_licenses:
        if not args.python:
            parser.error("--capture-python-licenses requires at least one --python")
        capture_python_licenses(args.python)
        return 0
    rendered = json.dumps(build_inventory(), indent=2, sort_keys=True) + "\n"
    if args.write:
        INVENTORY_PATH.write_text(rendered, encoding="utf-8")
        return 0
    if (
        not INVENTORY_PATH.is_file()
        or INVENTORY_PATH.read_text(encoding="utf-8") != rendered
    ):
        print("release-component-inventory:stale", file=sys.stderr)
        return 1
    print("release-component-inventory:current")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
