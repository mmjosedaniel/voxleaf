"""Closed-input and no-model command evidence for the v5 worker surface."""

from __future__ import annotations

import hashlib
import io
import json
import sys
from pathlib import Path
from types import SimpleNamespace
from typing import cast
from unittest.mock import Mock

import pytest

from benchmarks import benchmark_safety, dual_worker_cli
from benchmarks.dual_worker_command import (
    DualWorkerCommandError,
    parse_dual_worker_command,
)
from benchmarks.dual_worker_contracts import DualWorkerBenchmarkError
from benchmarks.dual_worker_official import GIB, DualWorkerOfficialError
from benchmarks.v5_authority import AUTHORITY_COMMIT_SHA

GIT_A = "a" * 40
GIT_B = "b" * 40
SHA_A = "1" * 64
SHA_B = "2" * 64


def test_fsf_vf0091_unwitnessed_runtime_cannot_pass_active_trials(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from test_benchmark_dual_worker import _requests

    from benchmarks.dual_worker_fake import DeterministicDualWorkerRuntime

    class Runtime(DeterministicDualWorkerRuntime):
        def load_worker(self, _role: object) -> None:
            pass

        def worker_pid(self, _role: object) -> None:
            return None

    monkeypatch.setattr(dual_worker_cli, "_runtime", lambda *_args: Runtime())
    with pytest.raises(DualWorkerBenchmarkError):
        dual_worker_cli._cancellation_trials(
            arm="concurrent",
            profile=Mock(),
            configuration=Mock(),
            forbidden_values=(),
            requests=_requests(),
        )


def _fsf_host(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr("benchmarks.v5_authority._git_is_strict_ancestor", lambda *_args: True)
    monkeypatch.setattr(benchmark_safety, "claim", Mock())
    monkeypatch.setattr(benchmark_safety, "baseline_inputs", lambda *_args: {})
    monkeypatch.setattr(
        dual_worker_cli,
        "run_local_preflight",
        lambda _request: SimpleNamespace(
            failures=(),
            eligible_for_official_run=True,
            host=SimpleNamespace(free_vram_bytes=16 * GIB),
        ),
    )
    monkeypatch.setattr(
        dual_worker_cli,
        "windows_system_memory",
        lambda: (16 * GIB, 0, 32 * GIB),
    )


def test_nov17_wrong_lineage_does_not_consume_official_reservation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _fsf_host(monkeypatch)
    payload = _payload(purpose="official")
    payload["candidatePython"] = sys.executable
    payload["authorityCommitSha"] = GIT_A
    construct = Mock(side_effect=RuntimeError("synthetic-worker-boundary"))
    monkeypatch.setattr(dual_worker_cli, "_runtime", construct)
    with pytest.raises(DualWorkerCommandError, match="result-before-authority"):
        dual_worker_cli._run(parse_dual_worker_command(payload))
    cast(Mock, benchmark_safety.claim).assert_not_called()
    construct.assert_not_called()


@pytest.mark.parametrize("purpose", ["official", "concurrent-diagnostic"])
@pytest.mark.parametrize(
    "gate",
    [
        "eligible",
        "media",
        "gpu-media",
        "count",
        "gpu-count",
        "completed",
        "failures",
        "retries",
        "duration",
        "trial-count",
        "passed-trials",
        "stale",
        "audit",
        "missing-audit",
        "ram",
        "commit",
        "vram",
        "shared",
        "raw-failure",
        "identity",
        "root-type",
    ],
)
def test_fsf_vf0089_only_qualified_gpu_baseline_reaches_worker_construction(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, purpose: str, gate: str
) -> None:
    root = dual_worker_cli.REPOSITORY_ROOT
    summary = json.loads(
        (root / dual_worker_cli.RESULT_PATHS["gpu-solo"]).read_text(encoding="utf-8")
    )
    summary["aggregates"]["mediaSeconds"] = 300
    summary["aggregates"]["gpu"]["mediaSeconds"] = 300
    mutations = {
        "media": (summary["aggregates"], "mediaSeconds", 299.99),
        "gpu-media": (summary["aggregates"]["gpu"], "mediaSeconds", 299.99),
        "count": (summary["counts"], "measuredUnits", 39),
        "gpu-count": (summary["counts"], "gpuMeasuredUnits", 39),
        "completed": (summary["counts"], "completedFirstAttempts", 39),
        "failures": (summary["counts"], "failedOrTimedOutFirstAttempts", 1),
        "retries": (summary["counts"], "automaticRetries", 1),
        "duration": (summary["aggregates"], "maximumUnitDurationSeconds", 20.01),
        "trial-count": (summary["cancellation"], "trialCount", 1),
        "passed-trials": (summary["cancellation"], "passedTrialCount", 1),
        "stale": (summary["cancellation"], "stalePlayedUnits", 1),
        "audit": (summary["audits"], "cleanup", False),
        "ram": (summary["memory"], "minimumSystemAvailableRamBytes", 0),
        "commit": (summary["memory"], "minimumSystemCommitHeadroomBytes", 0),
        "vram": (summary["memory"], "peakFrameworkReservedVramBytes", 16 * GIB),
        "shared": (summary["memory"], "peakGpuWorkerSharedGpuBytes", 134217729),
        "raw-failure": (summary, "failureCodes", ["resource-limit"]),
        "identity": (summary, "profileSha256", SHA_A),
    }
    if gate in mutations:
        target, key, value = mutations[gate]
        target[key] = value
    if gate == "missing-audit":
        del summary["audits"]["privacy"]
    encoded = json.dumps([] if gate == "root-type" else summary).encode()
    baseline = tmp_path / "baseline.json"
    baseline.write_bytes(encoded)
    monkeypatch.setitem(dual_worker_cli.RESULT_PATHS, "gpu-solo", str(baseline))
    payload = _payload(purpose=purpose, arm="concurrent")
    payload["candidatePython"] = sys.executable
    payload["priorCpuSoloSummarySha256"] = hashlib.sha256(
        (root / dual_worker_cli.RESULT_PATHS["cpu-solo"]).read_bytes()
    ).hexdigest()
    payload["priorGpuSoloSummarySha256"] = hashlib.sha256(encoded).hexdigest()
    _fsf_host(monkeypatch)
    construct = Mock(side_effect=RuntimeError("synthetic-worker-boundary"))
    monkeypatch.setattr(dual_worker_cli, "_runtime", construct)
    if gate == "eligible":
        with pytest.raises(RuntimeError, match="synthetic-worker-boundary"):
            dual_worker_cli._run(parse_dual_worker_command(payload))
        construct.assert_called_once()
    else:
        with pytest.raises(DualWorkerCommandError, match="authority"):
            dual_worker_cli._run(parse_dual_worker_command(payload))
        construct.assert_not_called()


@pytest.mark.parametrize("fault", ["first-load", "second-load", "third-load", "close", "warmup"])
def test_fsf_vf0090_each_cold_runtime_is_owned_before_load(
    monkeypatch: pytest.MonkeyPatch, fault: str
) -> None:
    _fsf_host(monkeypatch)
    payload = _payload(purpose="official")
    payload["candidatePython"] = sys.executable
    created: list[Mock] = []
    primary = RuntimeError("synthetic-load-failure")

    def build(*_args: object) -> Mock:
        runtime = Mock()
        if fault == "close" and not created:
            runtime.close.side_effect = [primary, None]
        created.append(runtime)
        return runtime

    def load(_runtime: object, _roles: object, index: int) -> list[dict[str, object]]:
        if fault == ("first-load", "second-load", "third-load")[index]:
            raise primary
        return []

    monkeypatch.setattr(dual_worker_cli, "_runtime", build)
    monkeypatch.setattr(dual_worker_cli, "_load_runtime", load)
    monkeypatch.setattr(dual_worker_cli, "_warmup", Mock(side_effect=primary))
    with pytest.raises(RuntimeError) as raised:
        dual_worker_cli._run(parse_dual_worker_command(payload))
    assert raised.value is primary
    assert created
    assert all(runtime.close.call_count == (2 if fault == "close" else 1) for runtime in created)


@pytest.mark.parametrize("fault", ["first-both", "third-both", "primary-only", "cleanup-only"])
def test_fsf_cr1_vf0090_reports_primary_and_cleanup_at_cli_boundary(
    monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str], fault: str
) -> None:
    _fsf_host(monkeypatch)
    payload = _payload(purpose="official")
    payload["candidatePython"] = sys.executable
    created: list[Mock] = []
    primary = DualWorkerOfficialError("resource-limit")
    cleanup_error = DualWorkerBenchmarkError("cleanup-failed")
    failed_index = 2 if fault == "third-both" else 0

    def build(*_args: object) -> Mock:
        runtime = Mock()
        if len(created) == failed_index and fault.endswith("both"):
            runtime.close.side_effect = cleanup_error
        if fault == "cleanup-only":
            runtime.close.side_effect = [cleanup_error, None]
        created.append(runtime)
        return runtime

    def load(_runtime: object, _roles: object, index: int) -> list[dict[str, object]]:
        if index == failed_index and fault != "cleanup-only":
            raise primary
        return []

    write_raw = Mock()
    warmup = Mock()
    monkeypatch.setattr(dual_worker_cli, "_runtime", build)
    monkeypatch.setattr(dual_worker_cli, "_load_runtime", load)
    monkeypatch.setattr(dual_worker_cli, "_warmup", warmup)
    monkeypatch.setattr(
        benchmark_safety,
        "claim",
        lambda *_args: SimpleNamespace(complete=write_raw),
    )
    monkeypatch.setattr(dual_worker_cli, "_read_payload", lambda: payload)
    monkeypatch.setattr(sys, "argv", ["dual_worker_cli", "run"])
    assert dual_worker_cli.main() == 2
    output = capsys.readouterr()
    assert json.loads(output.out) == {
        "status": "fail",
        "failureCode": "cleanup-failed" if fault == "cleanup-only" else "resource-limit",
    }
    assert output.err == (
        '{"status":"fail","failureCode":"cleanup-failed"}\n' if fault.endswith("both") else ""
    )
    assert len(created) == failed_index + 1
    assert all(runtime.close.called for runtime in created)
    warmup.assert_not_called()
    write_raw.assert_not_called()


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
        value["evidenceVersion"] = "tts-benchmark-safety-v1"
        value["authorityCommitSha"] = AUTHORITY_COMMIT_SHA
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
