"""Private-stdin command parsing and content-free output tests."""

from __future__ import annotations

from pathlib import Path
from typing import cast

import pytest

from benchmarks.cli import (
    CommandError,
    _receipt_payload,
    _validated_worker_receipt,
    parse_preflight_request,
)
from benchmarks.execution import run_measurement_worker
from benchmarks.preflight import HostSnapshot, PreflightReceipt


def valid_payload(tmp_path: Path) -> dict[str, object]:
    return {
        "candidateId": "qwen3-tts-0-6b-customvoice-cuda-bf16-v1",
        "artifactRoot": str(tmp_path / "private-model"),
        "candidatePython": str(tmp_path / "private-python.exe"),
        "modelRevision": "8f9ebcf8826db6eeb9cdd4caa09d575a7f9ce4bd",
        "voiceId": "Aiden",
        "provider": "pytorch-cuda",
        "precision": "bfloat16",
        "offline": True,
        "expectedCommitSha": "a" * 40,
        "purpose": "official",
        "sleepDisabled": True,
        "backgroundLoadAcceptable": True,
        "thermalStateAcceptable": True,
    }


def test_preflight_command_accepts_only_closed_stdin_configuration(tmp_path: Path) -> None:
    payload = valid_payload(tmp_path)
    request = parse_preflight_request(payload)
    assert request.profile.role == "balanced"
    assert request.configuration.provider == "pytorch-cuda"
    assert request.conditions.purpose == "official"
    assert str(tmp_path) not in repr(request)

    payload["privateText"] = "must-not-cross"
    with pytest.raises(
        CommandError,
        match=r"^tts-benchmark-command:invalid-input$",
    ):
        parse_preflight_request(payload)


def test_preflight_command_rejects_profile_misspellings_without_coercion(
    tmp_path: Path,
) -> None:
    for field, value in (
        ("provider", "cuda"),
        ("precision", "bf16"),
        ("purpose", "production"),
        ("offline", "true"),
    ):
        payload = valid_payload(tmp_path)
        payload[field] = value
        with pytest.raises(CommandError):
            parse_preflight_request(payload)


def test_receipt_output_is_allowlisted_and_contains_no_private_paths(tmp_path: Path) -> None:
    host = HostSnapshot(
        operating_system="Windows",
        os_version="10.0.26200",
        architecture="x86_64",
        python_version="3.12.10",
        cpu_model="Synthetic CPU",
        logical_processors=20,
        total_ram_bytes=32,
        free_ram_bytes=16,
        free_disk_bytes=100,
        power_online=True,
        power_mode="Balanced",
        gpu_model=None,
        driver_version="unavailable",
        total_vram_bytes=None,
        free_vram_bytes=None,
    )
    receipt = PreflightReceipt(
        purpose="official",
        candidate_id="candidate-v1",
        role="compatibility",
        commit_sha="a" * 40,
        host=host,
        artifacts=(),
        failures=("artifact",),
        eligible_for_official_run=False,
        eligible_for_promotion=False,
    )
    output = _receipt_payload(receipt)
    assert output["failures"] == ["artifact"]
    assert str(tmp_path) not in repr(output)
    assert set(cast(dict[str, object], output["host"])) == {
        "operatingSystem",
        "osVersion",
        "architecture",
        "pythonVersion",
        "cpuModel",
        "logicalProcessors",
        "totalRamBytes",
        "freeRamBytes",
        "freeDiskBytes",
        "powerOnline",
        "powerMode",
        "gpuModel",
        "driverVersion",
        "totalVramBytes",
        "freeVramBytes",
    }


def test_measurement_worker_receipt_is_closed_and_non_promotable(tmp_path: Path) -> None:
    request = parse_preflight_request(valid_payload(tmp_path))
    receipt = {
        "status": "fail",
        "purpose": "official",
        "candidateId": request.profile.candidate_id,
        "sessionId": "b" * 32,
        "failureCode": "cancellation-failed",
        "counts": {
            "coldLoads": 5,
            "warmGenerations": 24,
            "sustainedGenerations": 12,
            "cancellationTrials": 5,
        },
        "eligibleForPromotion": False,
    }
    assert _validated_worker_receipt(receipt, request) == receipt

    receipt["privatePath"] = str(tmp_path)
    with pytest.raises(
        CommandError,
        match=r"^tts-benchmark-command:invalid-worker-output$",
    ):
        _validated_worker_receipt(receipt, request)


def test_measurement_worker_rejects_a_different_interpreter_without_loading(
    tmp_path: Path,
) -> None:
    request = parse_preflight_request(valid_payload(tmp_path))
    receipt = run_measurement_worker(request)
    assert receipt == {
        "status": "fail",
        "purpose": "official",
        "candidateId": request.profile.candidate_id,
        "sessionId": None,
        "failureCode": "invalid-request",
        "counts": {
            "coldLoads": 0,
            "warmGenerations": 0,
            "sustainedGenerations": 0,
            "cancellationTrials": 0,
        },
        "eligibleForPromotion": False,
    }
    assert str(tmp_path) not in repr(receipt)
