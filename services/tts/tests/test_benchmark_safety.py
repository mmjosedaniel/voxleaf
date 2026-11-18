"""Prospective evidence controls; synthetic data, no model or policy changes."""

from __future__ import annotations

import copy
import io
import json
import os
import shutil
import sys
from collections.abc import Callable, Iterator
from contextlib import contextmanager
from dataclasses import replace
from pathlib import Path
from typing import BinaryIO, cast
from unittest.mock import Mock

import pytest
from test_benchmark_batch_cli import _input
from test_benchmark_dual_worker import _requests
from test_benchmark_dual_worker_cli import _payload
from test_benchmark_dual_worker_runtime import runtime_for
from test_benchmark_v5_authority import _raw_fixture
from test_benchmark_v13_authority import LOADS, ROOT, _git
from test_benchmark_v14_authority import _v14_raw

from benchmarks import benchmark_safety as safety
from benchmarks import benchmark_safety_cli, dual_worker_runtime
from benchmarks.batch_contracts import BatchAudioUnit, BatchGenerationRequest
from benchmarks.batch_fake import DeterministicBatchCandidate, FakeBatchClock
from benchmarks.dual_worker_contracts import (
    CPU_WORKER_ROLE,
    GPU_WORKER_ROLE,
    DualWorkerBenchmarkError,
    DualWorkIdentity,
)
from benchmarks.dual_worker_controller import BoundedDualWorkerController
from benchmarks.dual_worker_fake import DeterministicDualWorkerRuntime
from benchmarks.dual_worker_matrix import build_v5_requests
from benchmarks.dual_worker_official import serialize_dispatches
from benchmarks.dual_worker_trials import run_trials, validate_trials
from benchmarks.isolation import IsolatedBenchmarkAdapter
from benchmarks.power_observation import PowerSnapshot
from benchmarks.v5_authority import AUTHORITY_COMMIT_SHA, V5AuthorityError, validate_v5_raw_result
from benchmarks.v14_authority import PROFILE_VERSION

ORIGINAL = PowerSnapshot("381b4222-f694-41f0-9685-ff5bb260df2e", 900, 600, 3600, 1800)
DISABLED = replace(ORIGINAL, standby_ac=0, standby_dc=0, hibernate_ac=0, hibernate_dc=0)


@pytest.mark.parametrize("record_name", ["consumed.json", "settled.json", "restored.json"])
def test_nov17_journal_publication_leaves_no_partial_final_entry(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path, record_name: str
) -> None:
    target = tmp_path / record_name
    original_open = Path.open

    @contextmanager
    def interrupt(path: Path, mode: str) -> Iterator[BinaryIO]:
        with original_open(path, mode) as stream:

            def interrupted_write(data: bytes) -> int:
                stream.write(data[:1])
                stream.flush()
                raise OSError("synthetic interruption")

            yield cast(BinaryIO, Mock(wraps=stream, write=interrupted_write))

    with monkeypatch.context() as patch:
        patch.setattr(Path, "open", interrupt)
        with pytest.raises(OSError, match="synthetic interruption"):
            safety.write_once(target, {"sample": "original"})
    assert not target.exists()
    safety.write_once(target, {"sample": "original"})
    with pytest.raises(FileExistsError):
        safety.write_once(target, {"sample": "conflict"})
    assert safety.decode(target.read_bytes()) == {"sample": "original"}


@pytest.mark.parametrize(
    ("family", "field", "value"),
    [
        ("dual", "priorCpuSoloSummarySha256", "synthetic-not-a-digest"),
        ("dual", "priorCpuSoloSummarySha256", {"private": "synthetic-private-path"}),
        ("dual", "priorCpuSoloSummarySha256", None),
        ("dual", "dualWorkerOptIn", False),
        ("dual", "candidatePython", []),
        ("batch", "batchOptIn", False),
        ("batch", "candidatePython", []),
        ("batch", "sleepDisabled", "synthetic-private-value"),
    ],
)
def test_fsf_cr3_preparation_rejects_invalid_request_before_observation_or_reservation(
    family: str,
    field: str,
    value: object,
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    capsys: pytest.CaptureFixture[str],
) -> None:
    payload = _payload(purpose="official", arm="gpu-solo") if family == "dual" else _input()
    payload.update(evidenceVersion=safety.VERSION, resultPurpose="official", sessionId="f" * 32)
    if family == "dual":
        payload["priorCpuSoloSummarySha256"] = "a" * 64
    else:
        payload["profileVersion"] = PROFILE_VERSION
    payload[field] = value
    observer = Mock(return_value=ORIGINAL)
    monkeypatch.setattr(safety, "observe_power", observer)
    monkeypatch.setattr("benchmarks.batch_official.ensure_raw_root_is_ignored", lambda _root: None)
    monkeypatch.setattr(benchmark_safety_cli, "REPOSITORY_ROOT", tmp_path)
    monkeypatch.setattr(sys, "argv", ["benchmark-safety", "prepare"])
    monkeypatch.setattr(
        sys,
        "stdin",
        io.TextIOWrapper(io.BytesIO(json.dumps({"family": family, "request": payload}).encode())),
    )
    assert benchmark_safety_cli.main() == 2
    observer.assert_not_called()
    assert not (tmp_path / "benchmarks").exists()
    output = capsys.readouterr().out
    assert json.loads(output)["status"] == "fail" and "synthetic-private" not in output


def _binding() -> dict[str, object]:
    payload = _input()
    payload.update(
        resultPurpose="official",
        sessionId="e" * 32,
        profileVersion=PROFILE_VERSION,
        evidenceVersion=safety.VERSION,
        expectedCommitSha=_git(ROOT, "rev-parse", "HEAD"),
    )
    return safety.binding("batch", payload)


@pytest.mark.parametrize("family", ["batch", "dual"])
def test_fsf_cr3_valid_preparation_matches_execution_binding(
    family: str,
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    capsys: pytest.CaptureFixture[str],
) -> None:
    from benchmarks.dual_worker_command import parse_dual_worker_command

    payload = _payload(purpose="official") if family == "dual" else _input()
    payload.update(evidenceVersion=safety.VERSION, resultPurpose="official", sessionId="f" * 32)
    if family == "batch":
        payload["profileVersion"] = PROFILE_VERSION
    else:
        monkeypatch.setattr("benchmarks.v5_authority._git_is_strict_ancestor", lambda *_args: True)
    current = [ORIGINAL]
    monkeypatch.setattr(safety, "observe_power", lambda: current[0])
    monkeypatch.setattr("benchmarks.batch_official.ensure_raw_root_is_ignored", lambda _root: None)
    monkeypatch.setattr(benchmark_safety_cli, "REPOSITORY_ROOT", tmp_path)
    monkeypatch.setattr(sys, "argv", ["benchmark-safety", "prepare"])
    monkeypatch.setattr(
        sys,
        "stdin",
        io.TextIOWrapper(io.BytesIO(json.dumps({"family": family, "request": payload}).encode())),
    )
    assert benchmark_safety_cli.main() == 0
    assert json.loads(capsys.readouterr().out)["status"] == "prepared"
    expected = safety.binding(family, payload)
    if family == "dual":
        assert parse_dual_worker_command(payload).safety_binding == expected
    current[0] = DISABLED
    assert safety.claim(tmp_path, expected).binding == expected


@pytest.mark.parametrize("invalid", ["authority", "ancestry"])
def test_nov17_dual_preparation_rejects_wrong_lineage_before_observation(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, invalid: str
) -> None:
    payload = _payload(purpose="official")
    if invalid == "authority":
        payload["authorityCommitSha"] = "a" * 40
    ancestry = Mock(return_value=False)
    monkeypatch.setattr("benchmarks.v5_authority._git_is_strict_ancestor", ancestry)
    observe = Mock(return_value=ORIGINAL)
    monkeypatch.setattr(safety, "observe_power", observe)
    expected = safety.binding("dual", payload)
    with pytest.raises(safety.SafetyError, match="result-before-authority"):
        safety.prepare(tmp_path, expected)
    observe.assert_not_called()
    assert not (tmp_path / "benchmarks").exists()
    assert ancestry.called == (invalid == "ancestry")


def _prepare(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> tuple[dict[str, object], list[PowerSnapshot]]:
    current = [ORIGINAL]
    monkeypatch.setattr(safety, "observe_power", lambda: current[0])
    monkeypatch.setattr("benchmarks.batch_official.ensure_raw_root_is_ignored", lambda _root: None)
    expected = _binding()
    safety.prepare(tmp_path, expected)
    return expected, current


def _complete(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> tuple[dict[str, object], list[PowerSnapshot]]:
    expected, current = _prepare(monkeypatch, tmp_path)
    current[0] = DISABLED
    claim = safety.claim(tmp_path, expected)
    raw, _ = _v14_raw()
    raw["executionCommitSha"] = expected["execution"]
    raw["schemaVersion"] = safety.BATCH_RAW_VERSION
    cast(dict[str, object], raw["cleanup"])["sleepSettingRestored"] = False
    cast(dict[str, object], raw["cleanup"])["rawSessionRemoved"] = False
    claim.complete(raw, {"loads.json": LOADS})
    return expected, current


def test_fsf_vf0077_original_settings_bound_once_and_failed_run_remains_restorable(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    expected, current = _prepare(monkeypatch, tmp_path)
    with pytest.raises(safety.SafetyError, match="power-not-disabled"):
        safety.claim(tmp_path, expected)
    current[0] = DISABLED
    safety.claim(tmp_path, expected)
    with pytest.raises(FileExistsError):
        safety.claim(tmp_path, expected)
    with pytest.raises(safety.SafetyError, match="power-not-restored"):
        safety.finalize(tmp_path, expected)
    current[0] = ORIGINAL
    result = safety.finalize(tmp_path, expected)
    assert result["eligibleForDerivation"] is False
    assert safety.finalize(tmp_path, expected) == result
    with pytest.raises((safety.SafetyError, FileNotFoundError)):
        safety.verify(tmp_path, expected)
    with pytest.raises(FileExistsError):
        safety.prepare(tmp_path, expected)


@pytest.mark.parametrize("phase", ["consumed", "settled", "restored"])
def test_nov17_interrupted_journal_operation_retries_with_same_facts(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
    phase: str,
) -> None:
    expected, settings = _prepare(monkeypatch, tmp_path)
    path = safety.root(tmp_path, cast(str, expected["session"]))
    target = path / f"{phase}.json"
    original_link = os.link
    disarmed = False

    def interrupt(source: Path, destination: Path) -> None:
        nonlocal disarmed
        if destination == target and not disarmed:
            disarmed = True
            raise OSError("synthetic publication failure")
        original_link(source, destination)

    monkeypatch.setattr(os, "link", interrupt)
    settings[0] = DISABLED
    if phase == "consumed":
        with pytest.raises(OSError, match="synthetic publication failure"):
            safety.claim(tmp_path, expected)
        assert not target.exists()
    claim = safety.claim(tmp_path, expected)
    raw, _ = _v14_raw()
    raw["executionCommitSha"] = expected["execution"]
    raw["schemaVersion"] = safety.BATCH_RAW_VERSION
    cast(dict[str, object], raw["cleanup"])["sleepSettingRestored"] = False
    cast(dict[str, object], raw["cleanup"])["rawSessionRemoved"] = False
    if phase == "settled":
        with pytest.raises(OSError, match="synthetic publication failure"):
            claim.complete(raw, {"loads.json": LOADS})
        assert not target.exists()
    claim.complete(raw, {"loads.json": LOADS})
    settings[0] = ORIGINAL
    if phase == "restored":
        with pytest.raises(OSError, match="synthetic publication failure"):
            safety.finalize(tmp_path, expected)
        assert not target.exists()
    result = safety.finalize(tmp_path, expected)
    assert result["eligibleForDerivation"] is True
    assert safety.verify(tmp_path, expected).binding == expected


@pytest.mark.parametrize("target_name", ["cpu-baseline.json", "trials.json"])
def test_nov17_interrupted_private_publication_can_retry(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path, target_name: str
) -> None:
    payload = _payload(purpose="official", arm="gpu-solo")
    baseline = (ROOT / "benchmarks/tts/dual-worker-result-v5-cpu-solo.json").read_bytes()
    payload["priorCpuSoloSummarySha256"] = safety.digest(baseline)
    expected = safety.binding("dual", payload)
    monkeypatch.setattr("benchmarks.v5_authority._git_is_strict_ancestor", lambda *_args: True)
    monkeypatch.setattr("benchmarks.batch_official.ensure_raw_root_is_ignored", lambda _repo: None)
    settings = [ORIGINAL]
    monkeypatch.setattr(safety, "observe_power", lambda: settings[0])
    safety.prepare(tmp_path, expected)
    settings[0] = DISABLED
    claim = safety.claim(tmp_path, expected)
    raw = _raw_fixture()
    raw.update(
        schemaVersion=safety.DUAL_RAW_VERSION,
        executionCommitSha=expected["execution"],
        authorityCommitSha=AUTHORITY_COMMIT_SHA,
        arm=expected["arm"],
    )
    cast(dict[str, object], raw["cleanup"]).update(
        sleepSettingRestored=False, rawSessionRemoved=False
    )
    trials: list[dict[str, str]] = [{"phase": "controlled-interruption"}]
    auxiliary: dict[str, object] = {"trials.json": trials, "cpu-baseline.json": baseline}
    selected = baseline if target_name == "cpu-baseline.json" else safety.encode(trials)
    data = claim.path / "data"
    interrupted: list[Path] = []
    original_open = Path.open
    original_unlink = Path.unlink

    @contextmanager
    def interrupted_open(path: Path, mode: str) -> Iterator[BinaryIO]:
        with original_open(path, mode) as stream:

            def write(value: bytes) -> int:
                if value == selected:
                    stream.write(value[:5])
                    stream.flush()
                    interrupted.append(path)
                    raise OSError("private output interrupted")
                return stream.write(value)

            yield cast(BinaryIO, Mock(wraps=stream, write=write))

    def interrupted_unlink(path: Path, missing_ok: bool = False) -> None:
        if path in interrupted:
            raise OSError("simulated forced termination before unlink")
        original_unlink(path, missing_ok=missing_ok)

    with monkeypatch.context() as patch:
        patch.setattr(Path, "open", interrupted_open)
        patch.setattr(Path, "unlink", interrupted_unlink)
        with pytest.raises(OSError, match="private output interrupted"):
            claim.complete(raw, auxiliary)
    assert len(interrupted) == 1 and interrupted[0].read_bytes() == selected[:5]
    assert not (claim.path / "settled.json").exists()
    foreign = data / "unrelated.tmp"
    foreign.write_bytes(selected[:5])
    with pytest.raises(safety.SafetyError, match=":files$"):
        claim.complete(raw, auxiliary)
    assert foreign.read_bytes() == selected[:5]
    foreign.unlink()
    interrupted[0].write_bytes(b"unmatched prefix")
    with pytest.raises(safety.SafetyError, match=":digest$"):
        claim.complete(raw, auxiliary)
    assert interrupted[0].read_bytes() == b"unmatched prefix"
    interrupted[0].write_bytes(selected[:5])
    conflicting = data / target_name
    conflicting.write_bytes(selected[:5])
    with pytest.raises(safety.SafetyError, match=":digest$"):
        claim.complete(raw, auxiliary)
    assert conflicting.read_bytes() == selected[:5]
    conflicting.unlink()
    claim.complete(raw, auxiliary)
    assert (data / target_name).read_bytes() == selected
    assert interrupted[0].read_bytes() == selected[:5]
    settings[0] = ORIGINAL
    assert safety.finalize(tmp_path, expected)["eligibleForDerivation"] is True
    assert safety.verify(tmp_path, expected).binding == expected


@pytest.mark.parametrize(
    "fault",
    ["original", "admitted", "scheme", "loads", "raw", "session", "duplicate", "missing", "extra"],
)
def test_fsf_vf0077_substitution_or_missing_evidence_never_passes(
    fault: str,
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    expected, current = _complete(monkeypatch, tmp_path)
    path = safety.root(tmp_path, cast(str, expected["session"]))
    current[0] = ORIGINAL
    safety.finalize(tmp_path, expected)
    if fault == "session":
        expected = {**expected, "session": "f" * 32}
    elif fault in ("loads", "raw"):
        (path / "data" / f"{fault}.json").write_bytes(b"{}")
    elif fault == "extra":
        (path / "data" / "unexpected.json").write_bytes(b"{}")
    elif fault == "duplicate":
        (path / "restored.json").write_bytes(b'{"binding":{},"binding":{}}')
    elif fault == "missing":
        (path / "restored.json").unlink()
    else:
        filename = {"original": "reservation", "admitted": "consumed", "scheme": "restored"}[fault]
        target = path / f"{filename}.json"
        value = cast(dict[str, object], safety.decode(target.read_bytes()))
        if fault == "scheme":
            cast(dict[str, object], value["observed"])["settings"] = replace(
                ORIGINAL, scheme="00000000-0000-0000-0000-000000000000"
            ).as_json()
        else:
            value["binding"] = {}
        target.write_bytes(safety.encode(value))
    with pytest.raises((safety.SafetyError, FileNotFoundError)):
        safety.verify(tmp_path, expected)
    if fault == "scheme":
        with pytest.raises(safety.SafetyError, match="restoration"):
            safety.finalize(tmp_path, expected)


def test_fsf_vf0077_real_authority_restoration_retry_and_private_cleanup(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    expected, current = _complete(monkeypatch, tmp_path)
    path = safety.root(tmp_path, cast(str, expected["session"]))
    raw_before = (path / "data/raw.json").read_bytes()
    with pytest.raises(FileNotFoundError):
        safety.verify(tmp_path, expected)
    with pytest.raises(safety.SafetyError, match="power-not-restored"):
        safety.finalize(tmp_path, expected)
    current[0] = ORIGINAL
    assert safety.finalize(tmp_path, expected)["eligibleForDerivation"] is True
    assert (path / "data/raw.json").read_bytes() == raw_before
    # Keep the real frozen authority/root; redirect only the private session.
    original_root = safety.root
    monkeypatch.setattr(safety, "root", lambda _repo, session: original_root(tmp_path, session))
    original_remove = shutil.rmtree
    monkeypatch.setattr(
        shutil,
        "rmtree",
        lambda _path: (_ for _ in ()).throw(PermissionError()),
    )
    with pytest.raises(PermissionError):
        benchmark_safety_cli.derive(ROOT, expected)
    assert (path / "data/raw.json").read_bytes() == raw_before
    monkeypatch.setattr(shutil, "rmtree", original_remove)
    summary = benchmark_safety_cli.derive(ROOT, expected)
    assert summary["schemaVersion"] == safety.VERSION
    assert (
        cast(dict[str, dict[str, object]], summary["measurementSummary"])["audits"]["cleanup"]
        is True
    )
    assert not (path / "data").exists() and (path / "consumed.json").exists()


class EntryCandidate(DeterministicBatchCandidate):
    def generate_batch_with_entry_witness(
        self,
        request: BatchGenerationRequest,
        entered: Callable[[], None],
    ) -> tuple[BatchAudioUnit, ...]:
        assert len(request.units) == 1
        entered()
        raise AssertionError("cancelled child resumed")


class EntryFactory:
    def __call__(self) -> EntryCandidate:
        return EntryCandidate(FakeBatchClock())


def test_fsf_vf0091_real_children_distinct_phases_and_substitution_rejection(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    created: list[dual_worker_runtime.ThreadedDualWorkerRuntime] = []

    def factory() -> dual_worker_runtime.ThreadedDualWorkerRuntime:
        runtime = runtime_for(
            {
                role: IsolatedBenchmarkAdapter(EntryFactory(), forbidden_values=())
                for role in (GPU_WORKER_ROLE, CPU_WORKER_ROLE)
            }
        )
        created.append(runtime)
        return runtime

    requests = build_v5_requests(
        ROOT, arm="concurrent", identity=DualWorkIdentity("e" * 32, "v5-concurrent-generation")
    )
    results, proofs = run_trials("concurrent", requests, factory)
    assert all(item["passed"] is True for item in results)
    validate_trials("concurrent", requests, proofs, results)
    assert proofs[-1]["queued"] == [cast(list[str], proofs[-1]["admitted"])[2]]
    assert proofs[-2]["completion"] is not None
    entries = cast(list[dict[str, int]], proofs[3]["entries"])
    assert len(entries) == 2 and max(item["entered"] for item in entries) <= min(
        item["invalidated"] for item in entries
    )
    assert all(
        runtime.worker_pid(role) is None
        for runtime in created
        for role in (GPU_WORKER_ROLE, CPU_WORKER_ROLE)
    )
    for index, key, value in (
        (5, "queued", []),
        (4, "completion", None),
        (3, "entries", []),
        (1, "generation", proofs[3]["generation"]),
        (5, "controlReleased", []),
        (0, "released", ["unexpected"]),
        (5, "admitted", []),
        (4, "staleRejected", True),
    ):
        changed = copy.deepcopy(proofs)
        changed[index][key] = value
        with pytest.raises(DualWorkerBenchmarkError):
            validate_trials("concurrent", requests, changed, results)
    changed_results = copy.deepcopy(results)
    changed_results[1]["gpuWorkerTerminationMilliseconds"] = None
    with pytest.raises(DualWorkerBenchmarkError):
        validate_trials("concurrent", requests, proofs, changed_results)

    payload = _payload(purpose="official", arm="concurrent")
    payload.update(
        sessionId="e" * 32,
        authorityCommitSha=AUTHORITY_COMMIT_SHA,
        expectedCommitSha=_git(ROOT, "rev-parse", "HEAD"),
    )
    for role in ("Cpu", "Gpu"):
        contents = (
            ROOT / f"benchmarks/tts/dual-worker-result-v5-{role.lower()}-solo.json"
        ).read_bytes()
        payload[f"prior{role}SoloSummarySha256"] = safety.digest(contents)
    expected = safety.binding("dual", payload)
    current = [ORIGINAL]
    monkeypatch.setattr(safety, "observe_power", lambda: current[0])
    monkeypatch.setattr("benchmarks.v5_authority._git_is_strict_ancestor", lambda *_args: True)
    monkeypatch.setattr("benchmarks.batch_official.ensure_raw_root_is_ignored", lambda _repo: None)
    safety.prepare(tmp_path, expected)
    current[0] = DISABLED
    claim = safety.claim(tmp_path, expected)
    raw = _raw_fixture()
    raw["dispatches"] = serialize_dispatches(
        BoundedDualWorkerController().run(
            arm="concurrent",
            runtime=DeterministicDualWorkerRuntime(
                gpu_generation_nanoseconds=9_000_000_000,
                cpu_generation_nanoseconds=10_000_000_000,
            ),
            requests=requests,
        )
    )
    raw.update(
        schemaVersion=safety.DUAL_RAW_VERSION,
        executionCommitSha=expected["execution"],
        authorityCommitSha=AUTHORITY_COMMIT_SHA,
        cancellationTrials=results,
    )
    cast(dict[str, object], raw["cleanup"]).update(
        sleepSettingRestored=False, rawSessionRemoved=False
    )
    with pytest.raises(V5AuthorityError, match="result-schema"):
        validate_v5_raw_result(ROOT, raw)
    claim.complete(raw, {"trials.json": proofs, **safety.baseline_inputs(ROOT, expected)})
    current[0] = ORIGINAL
    safety.finalize(tmp_path, expected)
    original_root = safety.root
    monkeypatch.setattr(safety, "root", lambda _repo, session: original_root(tmp_path, session))
    result = benchmark_safety_cli.derive(ROOT, expected)
    assert (
        cast(dict[str, dict[str, object]], result["measurementSummary"])["audits"]["cleanup"]
        is True
    )
    assert result["powerRestorationVerified"] is True


def test_fsf_vf0077_preflight_failure_before_claim_can_restore(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    expected, current = _prepare(monkeypatch, tmp_path)
    current[0] = DISABLED
    with pytest.raises(safety.SafetyError, match="power-not-restored"):
        safety.finalize(tmp_path, expected)
    current[0] = ORIGINAL
    assert safety.finalize(tmp_path, expected)["eligibleForDerivation"] is False
    current[0] = DISABLED
    with pytest.raises(safety.SafetyError, match="already-finalized"):
        safety.claim(tmp_path, expected)


@pytest.mark.parametrize(
    "field", ["scheme", "standby_ac", "standby_dc", "hibernate_ac", "hibernate_dc"]
)
def test_fsf_vf0077_every_observed_power_field_must_match(
    field: str,
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    expected, current = _complete(monkeypatch, tmp_path)
    changed = ORIGINAL.as_json()
    changed[field] = "00000000-0000-0000-0000-000000000000" if field == "scheme" else 1
    current[0] = PowerSnapshot.parse(changed)
    with pytest.raises(safety.SafetyError, match="power-not-restored"):
        safety.finalize(tmp_path, expected)
    current[0] = ORIGINAL
    assert safety.finalize(tmp_path, expected)["eligibleForDerivation"] is True


def test_fsf_vf0091_missing_entry_times_out_and_reaps(monkeypatch: pytest.MonkeyPatch) -> None:
    from benchmarks.batch_fake import DeterministicBatchCandidateFactory

    monkeypatch.setattr(dual_worker_runtime, "ENTRY_BARRIER_SECONDS", 0.1)
    runtime = runtime_for(
        {
            GPU_WORKER_ROLE: IsolatedBenchmarkAdapter(
                DeterministicBatchCandidateFactory(), forbidden_values=()
            )
        }
    )
    try:
        runtime.load_worker(GPU_WORKER_ROLE)
        runtime.arm_entry_witnesses((GPU_WORKER_ROLE,))
        runtime.submit(GPU_WORKER_ROLE, _requests()[0])
        with pytest.raises(DualWorkerBenchmarkError):
            runtime.await_entry_witnesses()
    finally:
        runtime.close()
    assert runtime.worker_pid(GPU_WORKER_ROLE) is None
