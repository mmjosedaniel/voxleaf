"""Closed command-surface tests for the v4 batch mechanics pilot."""

from __future__ import annotations

import io
import json
import sys
from typing import cast

import pytest

from benchmarks import batch_cli


def _input() -> dict[str, object]:
    return {
        "batchOptIn": True,
        "resultPurpose": "disposable-pilot",
        "placementProfileId": "qwen3-serena-v4-full-gpu",
        "artifactRoot": "private-artifact-root",
        "candidatePython": "private-python",
        "expectedCommitSha": "a" * 40,
        "sleepDisabled": True,
        "backgroundLoadAcceptable": True,
        "thermalStateAcceptable": True,
    }


def test_command_emits_only_the_closed_content_safe_receipt(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    monkeypatch.setattr(sys, "argv", ["batch_cli.py", "run"])
    monkeypatch.setattr(sys, "stdin", io.StringIO(json.dumps(_input())))
    monkeypatch.setattr(
        batch_cli,
        "_run",
        lambda _payload: {
            "schemaVersion": "tts-v4-batch-mechanics-receipt-v1",
            "failureCodes": [],
            "eligibleForPromotion": False,
        },
    )
    assert batch_cli.main() == 0
    output = cast(dict[str, object], json.loads(capsys.readouterr().out))
    assert output["eligibleForPromotion"] is False
    serialized = json.dumps(output)
    assert "private-artifact-root" not in serialized
    assert "private-python" not in serialized


def test_command_rejects_unknown_fields_without_echoing_input(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    payload = _input()
    payload["narrationText"] = "private-text"
    monkeypatch.setattr(sys, "argv", ["batch_cli.py", "run"])
    monkeypatch.setattr(sys, "stdin", io.StringIO(json.dumps(payload)))
    assert batch_cli.main() == 2
    output = capsys.readouterr().out
    assert output == '{"status":"fail","failureCode":"input"}\n'
    assert "private-text" not in output


def test_official_input_requires_one_opaque_session_id(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    payload = _input()
    payload["resultPurpose"] = "official"
    payload["sessionId"] = "a" * 32
    monkeypatch.setattr(sys, "stdin", io.StringIO(json.dumps(payload)))
    assert batch_cli._payload()["sessionId"] == "a" * 32

    payload["sessionId"] = "../private"
    monkeypatch.setattr(sys, "stdin", io.StringIO(json.dumps(payload)))
    with pytest.raises(batch_cli.BatchCommandError, match=":input$"):
        batch_cli._payload()
