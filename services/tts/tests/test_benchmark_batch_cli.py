"""Closed command-surface tests for the v4 batch mechanics pilot."""

from __future__ import annotations

import io
import json
import sys
from pathlib import Path
from typing import cast

import pytest

from benchmarks import batch_cli, batch_result_cli
from benchmarks.batch_official import OfficialBatchError, OfficialExecution, official_raw_root
from benchmarks.preflight import HostSnapshot, PreflightReceipt
from benchmarks.v13_authority import PROFILE_VERSION as V13_PROFILE_VERSION
from benchmarks.v14_authority import PROFILE_VERSION


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


def _exact_host() -> HostSnapshot:
    return HostSnapshot(
        operating_system="Windows",
        os_version="10.0.26200",
        architecture="x86_64",
        python_version="3.12.10",
        cpu_model="Intel(R) Core(TM) Ultra 7 255HX",
        logical_processors=20,
        total_ram_bytes=33_752_997_888,
        free_ram_bytes=15_000_000_000,
        free_disk_bytes=600_000_000_000,
        power_online=True,
        power_mode="Equilibrado",
        gpu_model="NVIDIA GeForce RTX 5060 Laptop GPU",
        driver_version="577.05",
        total_vram_bytes=8_546_942_976,
        free_vram_bytes=8_189_378_560,
        process_vram_available=True,
    )


def test_exact_host_cpu_identity_ignores_windows_trademark_markers() -> None:
    assert batch_cli._host_raw(_exact_host())["cpuModel"] == "Intel Core Ultra 7 255HX"


def test_targeted_cpu_arm_is_official_only() -> None:
    payload = _input()
    payload["placementProfileId"] = "qwen3-serena-v4-speech-tokenizer-cpu"
    with pytest.raises(batch_cli.BatchCommandError, match=":authority$"):
        batch_cli._run(payload)


@pytest.mark.parametrize(
    "version", [None, "tts-short-segment-batch-profile-v4", V13_PROFILE_VERSION, "unknown"]
)
def test_official_execution_requires_explicit_v14_before_acquisition(
    monkeypatch: pytest.MonkeyPatch, version: str | None
) -> None:
    def unexpected(*_args: object, **_kwargs: object) -> None:
        pytest.fail("retired or unknown version acquired authority or host resources")

    monkeypatch.setattr(batch_cli, "run_local_preflight", unexpected)
    monkeypatch.setattr(batch_cli, "load_v14_mechanics_authority", unexpected)
    monkeypatch.setattr(batch_cli, "load_frozen_v4_mechanics_authority", unexpected)
    payload = _input()
    payload.update(resultPurpose="official", sessionId="a" * 32)
    if version is not None:
        payload["profileVersion"] = version
    with pytest.raises(batch_cli.BatchCommandError, match=":official-version$"):
        batch_cli._run(payload)


def test_dcr_17_failed_execution_receipt_is_not_derivable(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    def failed_run(_payload: dict[str, object]) -> dict[str, object]:
        raise OfficialBatchError("generation-failed", ("candidate-close",))

    payload = _input()
    payload.update(resultPurpose="official", sessionId="a" * 32, profileVersion=PROFILE_VERSION)
    monkeypatch.setattr(sys, "argv", ["batch_cli.py", "run"])
    monkeypatch.setattr(sys, "stdin", io.StringIO(json.dumps(payload)))
    monkeypatch.setattr(batch_cli, "_run", failed_run)
    assert batch_cli.main() == 2
    assert json.loads(capsys.readouterr().out) == {
        "schemaVersion": "tts-v14-batch-official-receipt-v1",
        "resultPurpose": "official",
        "status": "fail",
        "eligibleForDerivation": False,
        "failureCode": "generation-failed",
        "cleanupFailureCodes": ["candidate-close"],
    }


@pytest.mark.parametrize("stopped", [False, True])
def test_official_cli_writes_only_v14_session_after_runner_success(
    stopped: bool, monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    session_id = "c" * 32
    session = official_raw_root(tmp_path, session_id, version="v14")
    root_calls: list[str] = []

    class Sampler:
        def close(self) -> None:
            root_calls.append("close-sampler")

    def execute(root: Path, **kwargs: object) -> OfficialExecution:
        assert root == batch_cli.REPOSITORY_ROOT
        assert kwargs["execution_commit_sha"] == "a" * 40
        assert not session.exists()
        root_calls.append("run")
        if stopped:
            raise OfficialBatchError("shared-gpu-memory")
        return OfficialExecution({"cleanupFailureCodes": [], "failureCodes": []}, ())

    def raw_root(_repo: Path, identifier: str, *, version: str) -> Path:
        assert identifier == session_id and version == "v14"
        return session

    monkeypatch.setattr(
        batch_cli,
        "run_local_preflight",
        lambda request: PreflightReceipt(
            "official",
            request.profile.candidate_id,
            "balanced",
            "a" * 40,
            _exact_host(),
            (),
            (),
            True,
            False,
        ),
    )
    monkeypatch.setattr(batch_cli, "WindowsGpuProcessMemorySampler", lambda *_args: Sampler())
    monkeypatch.setattr(batch_cli, "WindowsProcessResourceSampler", lambda **_kwargs: object())
    monkeypatch.setattr(batch_cli, "execute_official_v14", execute)
    monkeypatch.setattr(batch_cli, "official_raw_root", raw_root)
    payload = _input()
    payload.update(
        resultPurpose="official",
        sessionId=session_id,
        profileVersion=PROFILE_VERSION,
        candidatePython=sys.executable,
    )
    if stopped:
        with pytest.raises(OfficialBatchError, match=":shared-gpu-memory$"):
            batch_cli._run(payload)
        assert not session.exists()
        assert root_calls == ["run", "close-sampler", "close-sampler"]
        return
    receipt = batch_cli._run(payload)
    assert receipt["eligibleForDerivation"] is True
    assert json.loads((session / "raw.json").read_text(encoding="utf-8")) == {
        "cleanupFailureCodes": [],
        "failureCodes": [],
    }
    assert not official_raw_root(tmp_path, session_id).exists()
    assert not official_raw_root(tmp_path, session_id, version="v13").exists()
    assert root_calls == ["run", "close-sampler", "close-sampler"]


def test_dcr_17_versioned_derivation_deletes_only_its_owned_session(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    session_id = "a" * 32
    legacy = official_raw_root(tmp_path, session_id)
    successor = official_raw_root(tmp_path, session_id, version="v13")
    current = official_raw_root(tmp_path, session_id, version="v14")
    for session in (legacy, successor, current):
        session.mkdir(parents=True)
        (session / "raw.json").write_text('{"schemaVersion":"synthetic"}', encoding="utf-8")
        (session / "loads.json").write_text("[]", encoding="utf-8")

    def derive_v13(
        root: Path, raw: object, loads: object, *, raw_session_removed: bool
    ) -> dict[str, object]:
        assert root == tmp_path
        assert raw == {"schemaVersion": "synthetic"} and loads == []
        assert raw_session_removed and not successor.exists() and legacy.exists()
        return {"version": 13}

    monkeypatch.setattr(batch_result_cli, "REPOSITORY_ROOT", tmp_path)
    monkeypatch.setattr(batch_result_cli, "derive_v13_summary", derive_v13)

    def derive_v14(
        root: Path, raw: object, loads: object, *, raw_session_removed: bool
    ) -> dict[str, object]:
        assert root == tmp_path
        assert raw == {"schemaVersion": "synthetic"} and loads == []
        assert (
            raw_session_removed and not current.exists() and legacy.exists() and successor.exists()
        )
        return {"version": 14}

    monkeypatch.setattr(batch_result_cli, "derive_v14_summary", derive_v14)
    assert batch_result_cli._run({"sessionId": session_id, "profileVersion": PROFILE_VERSION}) == {
        "version": 14
    }
    assert batch_result_cli._run(
        {"sessionId": session_id, "profileVersion": V13_PROFILE_VERSION}
    ) == {"version": 13}
    monkeypatch.setattr(batch_result_cli, "derive_v4_summary", lambda *_args: {"version": 4})
    assert batch_result_cli._run({"sessionId": session_id}) == {"version": 4}
    assert not legacy.exists() and not successor.exists() and not current.exists()
