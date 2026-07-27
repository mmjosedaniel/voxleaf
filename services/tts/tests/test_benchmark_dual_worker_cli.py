"""Closed-input and no-model command evidence for the v5 worker surface."""

from __future__ import annotations

import io
import json
import sys
from typing import cast

import pytest

from benchmarks import dual_worker_cli
from benchmarks.dual_worker_command import (
    DualWorkerCommandError,
    parse_dual_worker_command,
)
from benchmarks.dual_worker_official import DualWorkerOfficialError

GIT_A = "a" * 40
GIT_B = "b" * 40
SHA_A = "1" * 64
SHA_B = "2" * 64


def _payload(
    *,
    purpose: str = "cpu-solo-pilot",
    arm: str = "cpu-solo",
) -> dict[str, object]:
    value: dict[str, object] = {
        "schemaVersion": "tts-dual-worker-command-v5",
        "dualWorkerOptIn": True,
        "resultPurpose": purpose,
        "arm": arm,
        "artifactRoot": "private-artifact-root",
        "candidatePython": "private-candidate-python",
        "expectedCommitSha": GIT_B,
        "authorityCommitSha": GIT_A,
        "priorCpuSoloSummarySha256": None,
        "priorGpuSoloSummarySha256": None,
        "sleepDisabled": True,
        "backgroundLoadAcceptable": True,
        "thermalStateAcceptable": True,
    }
    if purpose == "official":
        value["sessionId"] = "0123456789abcdef0123456789abcdef"
    elif purpose == "concurrent-diagnostic":
        value["diagnosticMaxNewTokens"] = 256
    return value


def test_command_contract_accepts_pilot_and_frozen_official_arm_progression() -> None:
    pilot = parse_dual_worker_command(_payload())
    assert pilot.purpose == "cpu-solo-pilot"
    assert pilot.arm == "cpu-solo"
    assert "private-artifact-root" not in repr(pilot)
    assert "private-candidate-python" not in repr(pilot)

    cpu = parse_dual_worker_command(_payload(purpose="official"))
    assert cpu.arm == "cpu-solo"

    gpu_payload = _payload(purpose="official", arm="gpu-solo")
    gpu_payload["priorCpuSoloSummarySha256"] = SHA_A
    gpu = parse_dual_worker_command(gpu_payload)
    assert gpu.prior_cpu_solo_summary_sha256 == SHA_A

    concurrent_payload = _payload(purpose="official", arm="concurrent")
    concurrent_payload["priorCpuSoloSummarySha256"] = SHA_A
    concurrent_payload["priorGpuSoloSummarySha256"] = SHA_B
    concurrent = parse_dual_worker_command(concurrent_payload)
    assert concurrent.prior_gpu_solo_summary_sha256 == SHA_B

    diagnostic_payload = _payload(
        purpose="concurrent-diagnostic",
        arm="concurrent",
    )
    diagnostic_payload["priorCpuSoloSummarySha256"] = SHA_A
    diagnostic_payload["priorGpuSoloSummarySha256"] = SHA_B
    diagnostic = parse_dual_worker_command(diagnostic_payload)
    assert diagnostic.diagnostic_max_new_tokens == 256
    assert diagnostic.session_id is None


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {**_payload(), "unexpected": True},
        {**_payload(), "dualWorkerOptIn": False},
        {**_payload(), "arm": "concurrent"},
        {**_payload(purpose="official", arm="gpu-solo")},
        {
            **_payload(purpose="official", arm="concurrent"),
            "priorCpuSoloSummarySha256": SHA_A,
        },
        {
            **_payload(purpose="official"),
            "priorCpuSoloSummarySha256": SHA_A,
        },
        {**_payload(), "expectedCommitSha": GIT_A},
        {
            **_payload(purpose="concurrent-diagnostic", arm="concurrent"),
            "priorCpuSoloSummarySha256": SHA_A,
            "priorGpuSoloSummarySha256": SHA_B,
            "diagnosticMaxNewTokens": 255,
        },
    ],
)
def test_command_contract_rejects_drift_and_out_of_order_arms(
    payload: dict[str, object],
) -> None:
    with pytest.raises(DualWorkerCommandError):
        parse_dual_worker_command(payload)


def test_cli_invalid_input_is_content_free_and_never_reaches_hardware(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    private_value = "private-v5-command-canary"
    monkeypatch.setattr(sys, "argv", ["dual_worker_cli.py", "run"])
    monkeypatch.setattr(sys, "stdin", io.StringIO(private_value))
    monkeypatch.setattr(
        dual_worker_cli,
        "_run",
        lambda _request: (_ for _ in ()).throw(AssertionError("hardware path must not run")),
    )

    assert dual_worker_cli.main() == 2
    result = cast(dict[str, object], json.loads(capsys.readouterr().out))

    assert result == {"status": "fail", "failureCode": "input"}
    assert private_value not in json.dumps(result)


def test_cli_rejects_wrong_argv_without_reading_standard_input(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    monkeypatch.setattr(sys, "argv", ["dual_worker_cli.py"])
    monkeypatch.setattr(
        sys,
        "stdin",
        cast(io.TextIOBase, object()),
    )

    assert dual_worker_cli.main() == 2
    assert json.loads(capsys.readouterr().out) == {
        "status": "fail",
        "failureCode": "invalid-request",
    }


def test_cpu_model_serialization_matches_frozen_host_identity() -> None:
    assert (
        dual_worker_cli._normalized_cpu_model(
            "Intel(R) Core(TM) Ultra 7 255HX",
        )
        == "Intel Core Ultra 7 255HX"
    )


def test_official_safety_subcode_remains_content_free(
    monkeypatch: pytest.MonkeyPatch,
    capsys: pytest.CaptureFixture[str],
) -> None:
    monkeypatch.setattr(sys, "argv", ["dual_worker_cli.py", "run"])
    monkeypatch.setattr(sys, "stdin", io.StringIO(json.dumps(_payload())))
    monkeypatch.setattr(
        dual_worker_cli,
        "_run",
        lambda _request: (_ for _ in ()).throw(DualWorkerOfficialError("ram-safety")),
    )

    assert dual_worker_cli.main() == 2
    assert json.loads(capsys.readouterr().out) == {
        "status": "fail",
        "failureCode": "ram-safety",
    }
