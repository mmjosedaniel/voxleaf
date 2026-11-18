"""Cross-language structural conformance for checked-in VoxLeaf contracts."""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Final, Literal, cast

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

FixtureExpectation = Literal["valid", "invalid"]

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CONTRACT_FIXTURE_ROOT: Final = REPOSITORY_ROOT / "packages" / "shared" / "fixtures" / "contracts"
SCHEMA_ROOT: Final = REPOSITORY_ROOT / "packages" / "shared" / "schemas"
SCHEMA_FILES: Final = (
    "primitives/v1.schema.json",
    "book/v1.schema.json",
    "locator/v1.schema.json",
    "locator-range/v1.schema.json",
    "persisted-reading-state/v1.schema.json",
    "reading-session/v1.schema.json",
    "narration-segment/v1.schema.json",
    "operational-error/v1.schema.json",
    "capability-report/v1.schema.json",
    "host-profile-compatibility-report/v1.schema.json",
    "audio-frame/v1.schema.json",
    "buffer-status/v1.schema.json",
    "tts-protocol-control/v1.schema.json",
)
REQUIRED_SCHEMA_IDS: Final = frozenset(
    {
        "urn:voxleaf:schema:book:v1",
        "urn:voxleaf:schema:locator:v1",
        "urn:voxleaf:schema:locator-range:v1",
        "urn:voxleaf:schema:persisted-reading-state:v1",
        "urn:voxleaf:schema:reading-session:v1",
        "urn:voxleaf:schema:narration-segment:v1",
        "urn:voxleaf:schema:operational-error:v1",
        "urn:voxleaf:schema:capability-report:v1",
        "urn:voxleaf:schema:host-profile-compatibility-report:v1",
        "urn:voxleaf:schema:audio-frame:v1",
        "urn:voxleaf:schema:buffer-status:v1",
        "urn:voxleaf:schema:tts-protocol-control:v1",
    }
)


@dataclass(frozen=True)
class FixtureCase:
    """One data-only fixture and its shared schema-validation expectation."""

    case_id: str
    fixture_path: str
    schema_id: str
    expected: FixtureExpectation
    contains_sensitive_narration_text: bool


def load_json(path: Path) -> object:
    """Load one checked-in JSON value without normalizing or coercing it."""
    return cast(object, json.loads(path.read_text(encoding="utf-8")))


def read_mapping(value: object) -> dict[str, object]:
    if not isinstance(value, dict):
        raise AssertionError("Serialized fixture manifest is malformed.")

    return cast(dict[str, object], value)


def read_string(value: object) -> str:
    if not isinstance(value, str):
        raise AssertionError("Serialized fixture manifest is malformed.")

    return value


def load_fixture_cases() -> tuple[FixtureCase, ...]:
    manifest = read_mapping(load_json(CONTRACT_FIXTURE_ROOT / "manifest.json"))
    raw_cases = manifest.get("cases")
    if not isinstance(raw_cases, list):
        raise AssertionError("Serialized fixture manifest is malformed.")

    cases: list[FixtureCase] = []
    for raw_case in raw_cases:
        case = read_mapping(raw_case)
        expected = read_string(case.get("expected"))
        if expected not in ("valid", "invalid"):
            raise AssertionError("Serialized fixture manifest is malformed.")

        sensitive = case.get("containsSensitiveNarrationText", False)
        if not isinstance(sensitive, bool):
            raise AssertionError("Serialized fixture manifest is malformed.")

        cases.append(
            FixtureCase(
                case_id=read_string(case.get("id")),
                fixture_path=read_string(case.get("fixture")),
                schema_id=read_string(case.get("schemaId")),
                expected=cast(FixtureExpectation, expected),
                contains_sensitive_narration_text=sensitive,
            )
        )

    return tuple(cases)


def load_schema_registry() -> Registry:
    registry = Registry()
    for schema_file in SCHEMA_FILES:
        schema = read_mapping(load_json(SCHEMA_ROOT / schema_file))
        schema_id = read_string(schema.get("$id"))
        registry = registry.with_resource(schema_id, Resource.from_contents(schema))

    return registry


def test_python_matches_shared_fixture_manifest_against_offline_schemas() -> None:
    registry = load_schema_registry()

    for fixture_case in load_fixture_cases():
        schema_relative_path = (
            fixture_case.schema_id.removeprefix("urn:voxleaf:schema:").replace(":", "/")
            + ".schema.json"
        )
        schema = read_mapping(load_json(SCHEMA_ROOT / schema_relative_path))
        fixture = load_json(CONTRACT_FIXTURE_ROOT / fixture_case.fixture_path)
        validator = Draft202012Validator(schema, registry=registry)

        assert validator.is_valid(fixture) is (fixture_case.expected == "valid"), (
            fixture_case.case_id
        )


def test_fixture_manifest_marks_sensitive_narration_and_required_contract_families() -> None:
    fixture_cases = load_fixture_cases()

    assert [
        fixture_case.case_id
        for fixture_case in fixture_cases
        if fixture_case.contains_sensitive_narration_text
    ] == [
        "narration-segment-v1-sensitive-valid",
        "tts-protocol-control-v1-synthesize",
    ]
    assert {fixture_case.schema_id for fixture_case in fixture_cases} == REQUIRED_SCHEMA_IDS


def test_v2_wire_preserves_control_families_and_scopes_the_provider_error() -> None:
    registry = load_schema_registry()
    folder = SCHEMA_ROOT / "tts-protocol-control"
    v1 = Draft202012Validator(read_mapping(load_json(folder / "v1.schema.json")), registry=registry)
    v2 = Draft202012Validator(read_mapping(load_json(folder / "v2.schema.json")), registry=registry)
    for fixture in (CONTRACT_FIXTURE_ROOT / "tts-protocol-control" / "v1").glob("valid-*.json"):
        control = read_mapping(load_json(fixture))
        assert v1.is_valid(control) and not v2.is_valid(control), fixture.name
        assert v2.is_valid({**control, "protocolVersion": 2}), fixture.name

    failure = {
        "schemaVersion": 1,
        "protocolVersion": 2,
        "kind": "error",
        "serviceInstanceId": "service:synthetic-1",
        "reason": "torch-cuda-unavailable",
        "error": {
            "schemaVersion": 1,
            "code": "internal-failure",
            "category": "internal",
            "severity": "fatal",
        },
    }
    assert v2.is_valid(failure)
    assert not v1.is_valid({**failure, "protocolVersion": 1})
    ordinary = read_mapping(
        load_json(CONTRACT_FIXTURE_ROOT / "tts-protocol-control/v1/valid-error.json")
    )
    assert not v2.is_valid({**failure, "workIdentity": ordinary["workIdentity"]})
    assert not v2.is_valid(
        {**failure, "error": {**read_mapping(failure["error"]), "severity": "recoverable"}}
    )
    assert not v2.is_valid(
        {
            "schemaVersion": 1,
            "protocolVersion": 2,
            "kind": "protocolRejected",
            "reason": "torch-cuda-unavailable",
        }
    )
