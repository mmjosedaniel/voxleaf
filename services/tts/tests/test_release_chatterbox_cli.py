"""CLI selection remains explicit without changing legacy output or dispatch."""

from __future__ import annotations

import json
import shlex
from pathlib import Path
from unittest.mock import Mock

import pytest

from voxleaf_tts import release_chatterbox as cli
from voxleaf_tts.packaging import chatterbox_v7_authority


@pytest.mark.parametrize("version", [None, "2", "7"])
@pytest.mark.parametrize("command", ["build", "check-source", "check-acquisition"])
def test_selection_preserves_dispatch_and_stdout(
    version: str | None,
    command: str,
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    selected = version or "2"
    measurement = cli.PackageMeasurement("a" * 64, 10, 20, 3, "b" * 64, ())
    build = Mock(return_value=measurement)
    source = Mock()
    acquisition = Mock()
    evidence = Mock()
    current = Mock()
    v7 = Mock()
    for name, replacement in (
        ("build_package", build),
        ("load_source_manifest", source),
        ("load_acquisition_manifest", acquisition),
        ("load_runtime_evidence", evidence),
        ("load_current_runtime_evidence", current),
    ):
        monkeypatch.setattr(cli, name, replacement)
    monkeypatch.setattr(chatterbox_v7_authority, "check_security_authority", v7)
    arguments = [command] + ([] if version is None else ["--package-version", version])
    assert cli.main(arguments) == 0
    output = capsys.readouterr()
    assert output.err == f"Chatterbox package selection: v{selected}\n"
    if command == "build":
        build.assert_called_once_with(synchronise=True, package_version=selected, output_root=None)
        expected = json.dumps(
            {
                "archiveSha256": "a" * 64,
                "compressedBytes": 10,
                "fileCount": 3,
                "installedBytes": 20,
                "runtimeManifestSha256": "b" * 64,
                "parts": [],
            },
            sort_keys=True,
        )
    elif command == "check-source":
        source.assert_called_once_with(package_version=selected)
        expected = "chatterbox-optional-source:current"
    elif selected == "7":
        v7.assert_called_once_with()
        expected = "chatterbox-v7-acquisition:current"
    else:
        for check in (acquisition, evidence, current):
            check.assert_called_once_with()
        expected = "chatterbox-official-acquisition:current"
    assert output.out == expected + "\n"
    assert build.call_count == int(command == "build")
    assert source.call_count == int(command == "check-source")
    assert v7.call_count == int(command == "check-acquisition" and selected == "7")
    for check in (acquisition, evidence, current):
        assert check.call_count == int(command == "check-acquisition" and selected == "2")


@pytest.mark.parametrize(
    "arguments",
    [
        ["check-source", "--package-version", "99"],
        ["check-source", "--output-root", "unused"],
        ["check-acquisition", "--package-version", "4"],
    ],
)
def test_invalid_arguments_do_not_dispatch(
    arguments: list[str], monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    checker = Mock(side_effect=AssertionError("unexpected dispatch"))
    monkeypatch.setattr(cli, "load_source_manifest", checker)
    monkeypatch.setattr(cli, "load_acquisition_manifest", checker)
    with pytest.raises(SystemExit) as error:
        cli.main(arguments)
    assert error.value.code == 2
    checker.assert_not_called()
    output = capsys.readouterr()
    assert output.out == ""
    assert "Chatterbox package selection:" not in output.err


def test_checker_failure_is_not_reported_as_success(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    failure = cli.ReleaseChatterboxError("synthetic-check-failure")
    monkeypatch.setattr(cli, "load_source_manifest", Mock(side_effect=failure))
    with pytest.raises(cli.ReleaseChatterboxError) as error:
        cli.main(["check-source"])
    assert error.value is failure
    output = capsys.readouterr()
    assert output.out == ""
    assert output.err == "Chatterbox package selection: v2\n"


@pytest.mark.parametrize(
    "suffix,command",
    [("", "build"), (":check-source", "check-source"), (":check-acquisition", "check-acquisition")],
)
def test_explicit_v2_alias_preserves_existing_command(
    suffix: str, command: str, monkeypatch: pytest.MonkeyPatch
) -> None:
    root = Path(__file__).resolve().parents[3]
    scripts = json.loads((root / "package.json").read_text(encoding="utf-8"))["scripts"]
    prefix = "uv run --directory services/tts --locked python -m voxleaf_tts.release_chatterbox "
    legacy = scripts[f"package:chatterbox-optional{suffix}"]
    explicit = scripts[f"package:chatterbox-optional:v2{suffix}"]
    assert legacy == prefix + command
    assert explicit == legacy + " --package-version 2"
    handler = Mock(return_value=cli.PackageMeasurement("a", 1, 2, 3, "b", ()))
    monkeypatch.setattr(cli, "build_package", handler)
    monkeypatch.setattr(cli, "load_source_manifest", handler)
    monkeypatch.setattr(cli, "load_acquisition_manifest", handler)
    monkeypatch.setattr(cli, "load_runtime_evidence", Mock())
    monkeypatch.setattr(cli, "load_current_runtime_evidence", Mock())
    assert cli.main(shlex.split(explicit.removeprefix(prefix))) == 0
    assert handler.call_count == 1
