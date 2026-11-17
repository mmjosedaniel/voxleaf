"""Model-free tests for disposable blinded TTS quality sessions."""

from __future__ import annotations

import hashlib
import json
import os
import stat
import subprocess
import sys
import time
from copy import deepcopy
from dataclasses import replace
from pathlib import Path
from typing import Any, cast
from unittest.mock import Mock

import pytest

from benchmarks import (
    cli,
    cpu_fallback_result,
    quality,
    quality_cli,
    quality_presentation,
    quality_scoring,
)
from benchmarks.adapters.manifest import (
    PIPER_CPU_CANDIDATE_ID,
    QWEN_CANDIDATE_ID,
    QWEN_V3_CANDIDATE_ID,
    SUPERTONIC_CANDIDATE_ID,
)
from benchmarks.cli import parse_preflight_request
from benchmarks.contracts import BenchmarkCorpus, GenerationRequest
from benchmarks.preflight import PreflightReceipt, PreflightRequest
from benchmarks.quality import (
    CORRECTION_REASON,
    DIMENSIONS,
    QualitySessionError,
    aggregate_scores,
    cleanup_session,
    correct_meaning_changing_defect,
    finalize_session,
    generate_candidate_audio,
    submit_scorecard,
)
from benchmarks.quality_cli import GENERATE_FIELDS, QualityCommandError, _require_fields
from benchmarks.quality_scoring import _aggregate_candidate_scores


@pytest.mark.skipif(os.name != "nt", reason="Windows worker containment")
@pytest.mark.parametrize(
    "case",
    ["overflow", "stderr", "exact-limit", "nonzero", "utf8", "json", "timeout", "inherited-pipe"],
)
def test_fsf_vf0083_quality_parent_bounds_binary_pipes_and_reaps(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, case: str
) -> None:
    request = replace(_request(tmp_path, QWEN_CANDIDATE_ID), candidate_python=Path(sys.executable))
    payload: dict[str, object] = dict.fromkeys(GENERATE_FIELDS, None)
    payload.update(qualityOptIn=True, sessionId="a" * 32)
    receipt = {
        "status": "pass",
        "sessionId": "a" * 32,
        "candidateId": request.profile.candidate_id,
        "generatedSamples": 12,
        "readyForFinalization": True,
    }
    output = json.dumps(receipt)
    if case == "overflow":
        script = "import sys; sys.stdout.buffer.write(b'x' * 1048576)"
    elif case == "utf8":
        script = "import sys; sys.stdout.buffer.write(b'\\xff')"
    elif case == "json":
        script = "print('{')"
    elif case == "timeout":
        script = "import time; time.sleep(3)"
    else:
        if case == "exact-limit":
            output += " " * (16384 - len(output))
        script = f"import sys; sys.stdin.read(); sys.stdout.write({output!r}); sys.stdout.flush(); "
        if case == "stderr":
            script += "sys.stderr.buffer.write(b'x' * 1048576)"
        elif case == "nonzero":
            script += "sys.exit(1)"
        elif case == "inherited-pipe":
            script += (
                "import subprocess; subprocess.Popen([sys.executable, '-c', "
                "'import time; time.sleep(3)'], stdout=sys.stdout, stderr=sys.stderr)"
            )
    script_path = tmp_path / "synthetic-worker.py"
    script_path.write_text(script, encoding="utf-8")
    original_popen = subprocess.Popen
    processes: list[subprocess.Popen[Any]] = []
    reads: list[int] = []
    captured: list[dict[str, Any]] = []

    def launch(_args: object, **kwargs: Any) -> subprocess.Popen[Any]:
        kwargs["cwd"] = tmp_path
        captured.append(kwargs.copy())
        process = original_popen([sys.executable, str(script_path)], **kwargs)
        assert process.stdout is not None
        read = process.stdout.read

        def observed_read(size: int = -1) -> Any:
            reads.append(size)
            return read(size)

        process.stdout.read = observed_read  # type: ignore[method-assign]
        processes.append(process)
        return process

    monkeypatch.setattr(subprocess, "Popen", launch)
    monkeypatch.setattr(quality_cli, "_preflight_request", lambda _value: request)
    monkeypatch.setattr(quality_cli, "_preflight_passed", lambda _request: True)
    monkeypatch.setattr(quality_cli, "GENERATION_TIMEOUT_SECONDS", 1.0)
    started = time.monotonic()
    try:
        result = quality_cli._generate_parent(payload)
        assert result == (
            (receipt, 0)
            if case in ("stderr", "exact-limit")
            else ({"status": "fail", "failureCode": "generation"}, 2)
        )
        assert reads and all(0 < size <= cli.MAXIMUM_WORKER_STDOUT_BYTES + 1 for size in reads)
        assert captured[0]["stderr"] == subprocess.DEVNULL
        assert not captured[0].get("text", False)
        assert time.monotonic() - started < 2.5
    finally:
        assert len(processes) == 1
        assert processes[0].poll() is not None


class FakeQualityAdapter:
    def __init__(self, *, fail: bool = False) -> None:
        self.fail = fail
        self.loaded = False
        self.closed = False

    def load(self) -> None:
        self.loaded = True

    def synthesize_for_quality(self, request: GenerationRequest) -> tuple[list[float], int]:
        assert self.loaded
        assert request.text
        if self.fail:
            raise RuntimeError("private fake failure")
        return [0.0, 0.25, -0.25], 24_000

    def close(self) -> None:
        self.closed = True


def _request(tmp_path: Path, candidate_id: str) -> PreflightRequest:
    if candidate_id == QWEN_V3_CANDIDATE_ID:
        values = {
            "modelRevision": "0c0e3051f131929182e2c023b9537f8b1c68adfe",
            "voiceId": "Serena",
            "provider": "pytorch-cuda",
            "precision": "bfloat16",
        }
    elif candidate_id == QWEN_CANDIDATE_ID:
        values = {
            "modelRevision": "8f9ebcf8826db6eeb9cdd4caa09d575a7f9ce4bd",
            "voiceId": "Aiden",
            "provider": "pytorch-cuda",
            "precision": "bfloat16",
        }
    elif candidate_id == SUPERTONIC_CANDIDATE_ID:
        values = {
            "modelRevision": "3cadd1ee6394adea1bd021217a0e650ede09a323",
            "voiceId": "F1",
            "provider": "onnxruntime-cpu",
            "precision": "float32",
        }
    else:
        assert candidate_id == PIPER_CPU_CANDIDATE_ID
        values = {
            "modelRevision": "0d907f158acc877ddeebcbf827659ee13bea8bcd",
            "voiceId": "es_ES-davefx-medium",
            "provider": "onnxruntime-cpu",
            "precision": "float32",
        }
    return parse_preflight_request(
        {
            "candidateId": candidate_id,
            "artifactRoot": str(tmp_path / "private-model"),
            "candidatePython": str(tmp_path / "private-python.exe"),
            **values,
            "offline": True,
            "expectedCommitSha": "a" * 40,
            "purpose": "official",
            "sleepDisabled": True,
            "backgroundLoadAcceptable": True,
            "thermalStateAcceptable": True,
        }
    )


def _fake_wave(path: Path, waveform: object, sample_rate_hz: int) -> None:
    assert waveform == [0.0, 0.25, -0.25]
    assert sample_rate_hz == 24_000
    path.write_bytes(b"RIFF-fake")


@pytest.mark.parametrize(
    "failure",
    ["second-mkdir", "audio-exists", "scorecards-exist", "concurrent-data", "rollback-failure"],
)
def test_vf0042_finalization_setup_preserves_staging_and_retry(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, failure: str
) -> None:
    monkeypatch.setattr(quality, "_write_wave", _fake_wave)
    session_id = "b" * 32
    for candidate in (QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID):
        generate_candidate_audio(
            _request(tmp_path, candidate),
            session_id,
            raw_root=tmp_path,
            adapter_builder=FakeQualityAdapter,
        )
    session = tmp_path / "quality-v2" / session_id
    original = {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    }
    audio = session / "audio"
    scorecards = session / "scorecards"
    sentinel: Path | None = None
    if failure in ("audio-exists", "scorecards-exist"):
        occupied = audio if failure == "audio-exists" else scorecards
        occupied.mkdir()
        sentinel = occupied / "sentinel"
        sentinel.write_bytes(b"existing data")
    original_mkdir = Path.mkdir
    original_rmdir = Path.rmdir

    def failing_mkdir(path: Path, *args: object, **kwargs: object) -> None:
        if path == scorecards and failure in (
            "second-mkdir",
            "concurrent-data",
            "rollback-failure",
        ):
            if failure == "concurrent-data":
                (audio / "sentinel").write_bytes(b"concurrent data")
            raise OSError("private filesystem detail")
        original_mkdir(path, *args, **kwargs)  # type: ignore[arg-type]

    def failing_rmdir(path: Path) -> None:
        if path == audio and failure == "rollback-failure":
            raise OSError("private rollback detail")
        original_rmdir(path)

    with monkeypatch.context() as fault:
        fault.setattr(Path, "mkdir", failing_mkdir)
        fault.setattr(Path, "rmdir", failing_rmdir)
        with pytest.raises(QualitySessionError, match="finalization-setup$"):
            finalize_session(session_id, 1, raw_root=tmp_path)

    assert all((session / path).read_bytes() == content for path, content in original.items())
    if sentinel is not None:
        assert sentinel.read_bytes() == b"existing data"
        sentinel.unlink()
        sentinel.parent.rmdir()
    elif failure == "concurrent-data":
        assert (audio / "sentinel").read_bytes() == b"concurrent data"
        (audio / "sentinel").unlink()
        audio.rmdir()
    elif failure == "rollback-failure":
        assert audio.is_dir()
        audio.rmdir()
    else:
        assert not audio.exists()
    result = finalize_session(session_id, 1, raw_root=tmp_path)
    assert result["status"] == "pass"
    assert not (session / "staging").exists()
    assert (scorecards / "evaluator-01.template.json").is_file()


def test_vf0042_cli_hides_finalization_setup_error(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, capsys: pytest.CaptureFixture[str]
) -> None:
    monkeypatch.setattr(quality, "_write_wave", _fake_wave)
    session_id = "c" * 32
    for candidate in (QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID):
        generate_candidate_audio(
            _request(tmp_path, candidate),
            session_id,
            raw_root=tmp_path,
            adapter_builder=FakeQualityAdapter,
        )
    scorecards = tmp_path / "quality-v2" / session_id / "scorecards"
    scorecards.mkdir()
    monkeypatch.setattr(sys, "argv", ["quality_cli", "finalize"])
    monkeypatch.setattr(
        quality_cli,
        "_read_stdin",
        lambda: {"qualityOptIn": True, "sessionId": session_id, "evaluatorCount": 1},
    )
    monkeypatch.setattr(
        quality_cli,
        "finalize_session",
        lambda sid, count: finalize_session(sid, count, raw_root=tmp_path),
    )
    assert quality_cli.main() == 2
    captured = capsys.readouterr()
    assert captured.err == ""
    assert json.loads(captured.out) == {"status": "fail", "failureCode": "invalid-request"}


@pytest.mark.parametrize("rejection", ["duplicate", "candidate", "fingerprint"])
def test_rejected_generation_preserves_staging_session(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, rejection: str
) -> None:
    monkeypatch.setattr(quality, "_write_wave", _fake_wave)
    session_id = "a" * 32
    request = _request(tmp_path, QWEN_CANDIDATE_ID)
    generate_candidate_audio(
        request, session_id, raw_root=tmp_path, adapter_builder=FakeQualityAdapter
    )
    session = tmp_path / "quality-v2" / session_id
    if rejection == "candidate":
        request = replace(request, profile=replace(request.profile, candidate_id="unknown"))
    elif rejection == "fingerprint":
        request = _request(tmp_path, SUPERTONIC_CANDIDATE_ID)
        metadata_path = session / "session.json"
        metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
        metadata["configurationIdentities"][SUPERTONIC_CANDIDATE_ID] = "different-identity"
        metadata_path.write_text(json.dumps(metadata), encoding="utf-8")
    before = {path: path.read_bytes() for path in session.rglob("*") if path.is_file()}
    assert before
    adapter_builder = Mock()

    with pytest.raises(QualitySessionError, match=r"candidate-state$"):
        generate_candidate_audio(
            request, session_id, raw_root=tmp_path, adapter_builder=adapter_builder
        )

    adapter_builder.assert_not_called()
    assert {path: path.read_bytes() for path in session.rglob("*") if path.is_file()} == before


def test_single_evaluator_session_is_blinded_bounded_and_not_promotable(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "1" * 32

    first = generate_candidate_audio(
        _request(tmp_path, QWEN_CANDIDATE_ID),
        session_id,
        raw_root=raw_root,
        adapter_builder=FakeQualityAdapter,
    )
    assert first["generatedSamples"] == 12
    assert first["readyForFinalization"] is False

    second = generate_candidate_audio(
        _request(tmp_path, SUPERTONIC_CANDIDATE_ID),
        session_id,
        raw_root=raw_root,
        adapter_builder=FakeQualityAdapter,
    )
    assert second["generatedSamples"] == 12
    assert second["readyForFinalization"] is True

    sample_ids = iter(f"{index:032x}" for index in range(1, 25))
    finalized = finalize_session(
        session_id,
        1,
        raw_root=raw_root,
        shuffle=lambda values: values.reverse(),
        id_factory=lambda: next(sample_ids),
    )
    assert finalized == {
        "status": "pass",
        "sessionId": session_id,
        "evaluatorCount": 1,
        "sampleCount": 24,
        "eligibleForPromotion": False,
    }

    session = raw_root / "quality-v2" / session_id
    assert not (session / "staging").exists()
    assert len(tuple((session / "audio").glob("*.wav"))) == 24
    page = (session / "evaluator-01.html").read_text(encoding="utf-8")
    assert QWEN_CANDIDATE_ID not in page
    assert SUPERTONIC_CANDIDATE_ID not in page
    assert "qualityOptIn" not in page
    corpus = json.loads(
        (Path(__file__).resolve().parents[3] / "benchmarks" / "tts" / "corpus-v1.json").read_text(
            encoding="utf-8"
        )
    )
    assert all(case["text"] not in page for case in corpus["cases"])
    assert all(case["privacyCanary"] not in page for case in corpus["cases"])

    template = json.loads(
        (session / "scorecards" / "evaluator-01.template.json").read_text(encoding="utf-8")
    )
    for index, sample in enumerate(template["samples"]):
        sample["scores"] = {dimension: 4 for dimension in DIMENSIONS}
        sample["meaningChangingDefect"] = index == 0
    submitted = submit_scorecard(
        session_id,
        cast(object, template),
        raw_root=raw_root,
    )
    assert submitted["completedEvaluators"] == 1

    aggregate = aggregate_scores(session_id, raw_root=raw_root)
    assert aggregate["evaluatorCount"] == 1
    assert aggregate["eligibleForPromotion"] is False
    candidates = cast(dict[str, object], aggregate["candidates"])
    for candidate in candidates.values():
        result = cast(dict[str, object], candidate)
        assert result["overallMean"] == 4
        assert result["evaluatorCount"] == 1
    assert (
        sum(
            cast(int, cast(dict[str, object], candidate)["meaningChangingDefects"])
            for candidate in candidates.values()
        )
        == 1
    )

    cleanup_session(session_id, raw_root=raw_root)
    assert not session.exists()


@pytest.mark.parametrize(
    "candidates",
    [
        (QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID),
        (QWEN_V3_CANDIDATE_ID,),
        (PIPER_CPU_CANDIDATE_ID,),
    ],
)
def test_rac_02_rejected_ready_session_preserves_all_completed_bytes(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    candidates: tuple[str, ...],
    benchmark_v6_repository: Path,
) -> None:
    if PIPER_CPU_CANDIDATE_ID in candidates:
        monkeypatch.setattr("benchmarks.cli.REPOSITORY_ROOT", benchmark_v6_repository)
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "a" * 32
    for candidate in candidates:
        generate_candidate_audio(
            _request(tmp_path, candidate),
            session_id,
            raw_root=raw_root,
            adapter_builder=FakeQualityAdapter,
        )
    finalize_session(session_id, 1, raw_root=raw_root)
    session = raw_root / "quality-v2" / session_id
    scorecard = json.loads(
        (session / "scorecards/evaluator-01.template.json").read_text(encoding="utf-8")
    )
    for sample in scorecard["samples"]:
        sample["scores"] = {dimension: 4 for dimension in DIMENSIONS}
        sample["meaningChangingDefect"] = False
    submit_scorecard(session_id, scorecard, raw_root=raw_root)
    before = {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    }

    def unexpected_adapter() -> FakeQualityAdapter:
        pytest.fail("ready session must be rejected before adapter construction")

    with pytest.raises(QualitySessionError, match="invalid-metadata"):
        generate_candidate_audio(
            _request(tmp_path, candidates[0]),
            session_id,
            raw_root=raw_root,
            adapter_builder=unexpected_adapter,
        )
    assert session.is_dir()
    assert {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    } == before


def test_generation_failure_removes_the_whole_disposable_session(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "2" * 32

    with pytest.raises(
        QualitySessionError,
        match=r"^tts-benchmark-quality:generation$",
    ):
        generate_candidate_audio(
            _request(tmp_path, QWEN_CANDIDATE_ID),
            session_id,
            raw_root=raw_root,
            adapter_builder=lambda: FakeQualityAdapter(fail=True),
        )
    assert not (raw_root / "quality-v2" / session_id).exists()


def test_scorecard_rejects_partial_or_reordered_samples(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "3" * 32
    for candidate_id in (QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID):
        generate_candidate_audio(
            _request(tmp_path, candidate_id),
            session_id,
            raw_root=raw_root,
            adapter_builder=FakeQualityAdapter,
        )
    sample_ids = iter(f"{index:032x}" for index in range(25, 49))
    finalize_session(
        session_id,
        1,
        raw_root=raw_root,
        id_factory=lambda: next(sample_ids),
    )
    session = raw_root / "quality-v2" / session_id
    template = json.loads(
        (session / "scorecards" / "evaluator-01.template.json").read_text(encoding="utf-8")
    )
    template["samples"].pop()
    with pytest.raises(
        QualitySessionError,
        match=r"^tts-benchmark-quality:invalid-scorecard$",
    ):
        submit_scorecard(session_id, cast(object, template), raw_root=raw_root)


def test_quality_generation_input_requires_explicit_opt_in_and_closed_fields(
    tmp_path: Path,
) -> None:
    request = _request(tmp_path, QWEN_CANDIDATE_ID)
    payload: dict[str, object] = {
        "candidateId": request.profile.candidate_id,
        "artifactRoot": str(request.configuration.artifact_root),
        "candidatePython": str(request.candidate_python),
        "modelRevision": request.configuration.model_revision,
        "voiceId": request.configuration.voice_id,
        "provider": request.configuration.provider,
        "precision": request.configuration.precision,
        "offline": True,
        "expectedCommitSha": request.expected_commit_sha,
        "purpose": "official",
        "sleepDisabled": True,
        "backgroundLoadAcceptable": True,
        "thermalStateAcceptable": True,
        "qualityOptIn": True,
        "sessionId": "4" * 32,
    }
    _require_fields(payload, GENERATE_FIELDS)
    payload["privateText"] = "must-not-cross"
    with pytest.raises(
        QualityCommandError,
        match=r"^tts-benchmark-quality-command:invalid-input$",
    ):
        _require_fields(payload, GENERATE_FIELDS)


def test_v3_quality_session_is_single_candidate_and_identity_bound(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "5" * 32
    request = _request(tmp_path, QWEN_V3_CANDIDATE_ID)
    generated = generate_candidate_audio(
        request,
        session_id,
        raw_root=raw_root,
        adapter_builder=FakeQualityAdapter,
    )
    assert generated["readyForFinalization"] is True
    sample_ids = iter(f"{index:032x}" for index in range(49, 61))
    finalized = finalize_session(
        session_id,
        3,
        raw_root=raw_root,
        id_factory=lambda: next(sample_ids),
    )
    assert finalized["sampleCount"] == 12
    assert finalized["eligibleForPromotion"] is True
    session = raw_root / "quality-v2" / session_id
    metadata = (session / "session.json").read_text(encoding="utf-8")
    assert request.profile.instruction is not None
    assert request.profile.instruction not in metadata
    assert str(request.configuration.artifact_root) not in metadata
    assert QWEN_V3_CANDIDATE_ID not in (session / "evaluator-01.html").read_text(encoding="utf-8")


def test_v6_quality_preserves_and_applies_one_classification_correction(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
    benchmark_v6_repository: Path,
) -> None:
    monkeypatch.setattr("benchmarks.cli.REPOSITORY_ROOT", benchmark_v6_repository)
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    raw_root = tmp_path / "raw"
    session_id = "6" * 32
    generated = generate_candidate_audio(
        _request(tmp_path, PIPER_CPU_CANDIDATE_ID),
        session_id,
        raw_root=raw_root,
        adapter_builder=FakeQualityAdapter,
    )
    assert generated["generatedSamples"] == 8
    assert generated["readyForFinalization"] is True
    sample_ids = iter(f"{index:032x}" for index in range(61, 69))
    finalize_session(
        session_id,
        1,
        raw_root=raw_root,
        id_factory=lambda: next(sample_ids),
    )
    session = raw_root / "quality-v2" / session_id
    completed_path = session / "scorecards" / "evaluator-01.completed.json"
    template = json.loads(
        (session / "scorecards" / "evaluator-01.template.json").read_text(encoding="utf-8")
    )
    corrected_case_id = cast(str, template["samples"][0]["caseId"])
    for index, sample in enumerate(template["samples"]):
        sample["scores"] = {dimension: 4 for dimension in DIMENSIONS}
        sample["meaningChangingDefect"] = index == 0
    submit_scorecard(session_id, cast(object, template), raw_root=raw_root)
    first = aggregate_scores(session_id, raw_root=raw_root)
    first_candidate = cast(
        dict[str, object],
        cast(dict[str, object], first["candidates"])[PIPER_CPU_CANDIDATE_ID],
    )
    assert first_candidate["meaningChangingDefects"] == 1

    aggregate_path = session / "quality.aggregate.json"
    correction_path = session / "scorecards" / "evaluator-01.correction.json"
    old_aggregate = aggregate_path.read_bytes()
    unlink = Path.unlink

    def fail_aggregate_unlink(path: Path, missing_ok: bool = False) -> None:
        if path == aggregate_path:
            raise PermissionError("synthetic lock")
        unlink(path, missing_ok=missing_ok)

    with monkeypatch.context() as patch:
        patch.setattr(Path, "unlink", fail_aggregate_unlink)
        with pytest.raises(OSError):
            correct_meaning_changing_defect(
                session_id,
                "evaluator-01",
                corrected_case_id,
                reason_code=CORRECTION_REASON,
                raw_root=raw_root,
            )
    assert not correction_path.exists()
    assert aggregate_path.read_bytes() == old_aggregate

    correction = correct_meaning_changing_defect(
        session_id,
        "evaluator-01",
        corrected_case_id,
        reason_code=CORRECTION_REASON,
        raw_root=raw_root,
    )
    assert correction["correctedMeaningChangingDefect"] is False
    assert not (session / "quality.aggregate.json").exists()
    original = json.loads(completed_path.read_text(encoding="utf-8"))
    assert original["samples"][0]["meaningChangingDefect"] is True

    # Model an already-stale aggregate left by the previous correction order.
    aggregate_path.write_bytes(old_aggregate)
    monkeypatch.setattr(cpu_fallback_result, "RAW_ROOT", raw_root)
    performance = tmp_path / "performance"
    performance.mkdir()
    sentinel = performance / "machine.raw.json"
    sentinel.write_bytes(b"owned input")
    monkeypatch.setattr(cpu_fallback_result, "_load_raw", lambda _id: ({}, performance))
    monkeypatch.setattr(cpu_fallback_result, "_result_execution_commit", lambda *_args: "a" * 40)
    monkeypatch.setattr(cpu_fallback_result, "_verify_authority", lambda *_args, **_kw: None)
    monkeypatch.setattr(cpu_fallback_result, "_benchmark_run", lambda _raw: None)
    monkeypatch.setattr(cpu_fallback_result, "_machine_gates", lambda *_args: ())
    receipt = Mock(spec=PreflightReceipt, failures=(), eligible_for_official_run=True)
    with pytest.raises(cpu_fallback_result.CpuFallbackResultError, match=r"quality-stale$"):
        cpu_fallback_result.derive_result(
            _request(tmp_path, PIPER_CPU_CANDIDATE_ID),
            receipt,
            performance_session_id="a" * 32,
            quality_session_id=session_id,
            authority_commit_sha="a" * 40,
        )
    assert sentinel.read_bytes() == b"owned input"
    assert aggregate_path.read_bytes() == old_aggregate
    assert correction_path.exists()

    corrected = aggregate_scores(session_id, raw_root=raw_root)
    corrected_candidate = cast(
        dict[str, object],
        cast(dict[str, object], corrected["candidates"])[PIPER_CPU_CANDIDATE_ID],
    )
    assert corrected_candidate["meaningChangingDefects"] == 0
    assert cpu_fallback_result._load_quality(session_id) == (corrected_candidate, session)
    with pytest.raises(
        QualitySessionError,
        match=r"^tts-benchmark-quality:correction-state$",
    ):
        correct_meaning_changing_defect(
            session_id,
            "evaluator-01",
            corrected_case_id,
            reason_code=CORRECTION_REASON,
            raw_root=raw_root,
        )


@pytest.fixture
def overlap_quality_session(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, benchmark_v6_repository: Path
) -> tuple[Path, list[str]]:
    monkeypatch.setattr("benchmarks.cli.REPOSITORY_ROOT", benchmark_v6_repository)
    monkeypatch.setattr("benchmarks.quality._write_wave", _fake_wave)
    session_id = "b" * 32
    generate_candidate_audio(
        _request(tmp_path, PIPER_CPU_CANDIDATE_ID),
        session_id,
        raw_root=tmp_path,
        adapter_builder=FakeQualityAdapter,
    )
    finalize_session(session_id, 1, raw_root=tmp_path)
    session = tmp_path / "quality-v2" / session_id
    template_path = session / "scorecards/evaluator-01.template.json"
    template = json.loads(template_path.read_text(encoding="utf-8"))
    for index, sample in enumerate(template["samples"]):
        sample["scores"] = dict.fromkeys(DIMENSIONS, 4)
        sample["meaningChangingDefect"] = index < 2
    # The existing scorecard schema/fixtures supply two legitimate corrections.
    template_path.write_text(json.dumps(template), encoding="utf-8")
    submit_scorecard(session_id, template, raw_root=tmp_path)
    aggregate_scores(session_id, raw_root=tmp_path)
    return session, [sample["caseId"] for sample in template["samples"][:2]]


_OVERLAP_WORKER = r"""
import json, sys, time
from pathlib import Path
from benchmarks import quality, cpu_fallback_result
from unittest.mock import Mock
from benchmarks.preflight import PreflightReceipt
root, action, case, ready, release, hold = sys.argv[1:]
root, ready, release = Path(root), Path(ready), Path(release)
session_id = "b" * 32
session = root / "quality-v2" / session_id
write = quality._write_json
def held_write(path, value):
    if hold == "yes":
        ready.write_text("ready", encoding="ascii")
        deadline = time.monotonic() + 10
        while not release.exists():
            if time.monotonic() > deadline:
                raise RuntimeError("synthetic-barrier-deadline")
            time.sleep(0.01)
    write(path, value)
quality._write_json = held_write
try:
    if action == "correct":
        quality.correct_meaning_changing_defect(session_id, "evaluator-01", case,
            reason_code=quality.CORRECTION_REASON, raw_root=root)
    elif action == "submit":
        template = session / "scorecards/evaluator-01.template.json"
        card = json.loads(template.read_text(encoding="utf-8"))
        quality.submit_scorecard(session_id, card, raw_root=root)
    elif action == "aggregate":
        quality.aggregate_scores(session_id, raw_root=root)
    elif action == "cleanup":
        quality.cleanup_session(session_id, raw_root=root)
    elif action == "derive":
        cpu_fallback_result.RAW_ROOT = root
        receipt = Mock(spec=PreflightReceipt, failures=(), eligible_for_official_run=True)
        cpu_fallback_result.derive_result(Mock(), receipt,
            performance_session_id="a" * 32, quality_session_id=session_id,
            authority_commit_sha="a" * 40)
    print(json.dumps({"status": "pass"}))
except (quality.QualitySessionError, cpu_fallback_result.CpuFallbackResultError) as error:
    print(json.dumps({"status": "fail", "code": error.code}))
    sys.exit(2)
"""


@pytest.mark.parametrize(
    "first, second",
    [
        ("correct", "correct"),
        ("submit", "submit"),
        ("correct", "aggregate"),
        ("aggregate", "correct"),
        ("correct", "cleanup"),
        ("correct", "derive"),
    ],
)
def test_vf0082_overlapping_processes_reject_before_mutating_the_winner(
    tmp_path: Path, overlap_quality_session: tuple[Path, list[str]], first: str, second: str
) -> None:
    session, cases = overlap_quality_session
    if first == "submit":
        (session / "scorecards/evaluator-01.completed.json").unlink()
    ready, release = tmp_path / "ready", tmp_path / "release"
    processes: list[subprocess.Popen[str]] = []

    def launch(action: str, case: str, hold: bool) -> subprocess.Popen[str]:
        process = subprocess.Popen(
            [
                sys.executable,
                "-c",
                _OVERLAP_WORKER,
                str(tmp_path),
                action,
                case,
                str(ready),
                str(release),
                "yes" if hold else "no",
            ],
            cwd=quality.REPOSITORY_ROOT / "services/tts",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        processes.append(process)
        return process

    def snapshot() -> dict[str, bytes]:
        return {
            str(path.relative_to(session)): path.read_bytes()
            for path in session.rglob("*")
            if path.is_file()
        }

    owner = launch(first, cases[0], True)
    try:
        deadline = time.monotonic() + 5
        while not ready.exists() and owner.poll() is None and time.monotonic() < deadline:
            time.sleep(0.01)
        assert ready.exists(), "owner must reach the real publication boundary"
        before = snapshot()
        rival = launch(second, cases[1], False)
        output, error = rival.communicate(timeout=5)
        after = snapshot()
        release.write_text("release", encoding="ascii")
        owner_output, owner_error = owner.communicate(timeout=5)
        assert not error and not owner_error
        assert rival.returncode == 2
        assert json.loads(output) == {
            "status": "fail",
            "code": "quality-busy" if second == "derive" else "session-busy",
        }
        assert after == before
        assert owner.returncode == 0 and json.loads(owner_output) == {"status": "pass"}
        if first == "correct":
            accepted = (session / "scorecards/evaluator-01.correction.json").read_bytes()
            assert json.loads(accepted)["caseId"] == cases[0]
            with pytest.raises(QualitySessionError, match="correction-state"):
                correct_meaning_changing_defect(
                    "b" * 32,
                    "evaluator-01",
                    cases[1],
                    reason_code=CORRECTION_REASON,
                    raw_root=tmp_path,
                )
            assert (session / "scorecards/evaluator-01.correction.json").read_bytes() == accepted
            result = aggregate_scores("b" * 32, raw_root=tmp_path)
            assert (
                cast(dict[str, Any], result["candidates"])[PIPER_CPU_CANDIDATE_ID][
                    "meaningChangingDefects"
                ]
                == 1
            )
    finally:
        release.touch(exist_ok=True)
        for process in processes:
            if process.poll() is None:
                process.kill()
            process.communicate(timeout=5)


def test_vf0082_terminated_owner_releases_os_lock_and_allows_retry(
    tmp_path: Path, overlap_quality_session: tuple[Path, list[str]]
) -> None:
    session, cases = overlap_quality_session
    ready, release = tmp_path / "ready", tmp_path / "release"
    process = subprocess.Popen(
        [
            sys.executable,
            "-c",
            _OVERLAP_WORKER,
            str(tmp_path),
            "correct",
            cases[0],
            str(ready),
            str(release),
            "yes",
        ],
        cwd=quality.REPOSITORY_ROOT / "services/tts",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )
    try:
        deadline = time.monotonic() + 5
        while not ready.exists() and process.poll() is None and time.monotonic() < deadline:
            time.sleep(0.01)
        assert ready.exists()
        process.kill()
        process.communicate(timeout=5)
        assert not (session / "scorecards/evaluator-01.correction.json").exists()
        assert (
            correct_meaning_changing_defect(
                "b" * 32, "evaluator-01", cases[1], reason_code=CORRECTION_REASON, raw_root=tmp_path
            )["status"]
            == "pass"
        )
        assert aggregate_scores("b" * 32, raw_root=tmp_path)["status"] == "pass"
        cleanup_session("b" * 32, raw_root=tmp_path)
        assert not session.exists()
        # The marker is not the lock: its unchanged inode prevents split ownership.
        marker = session.parent / f".{session.name}.operation.lock"
        assert marker.is_file() and marker.read_bytes() == b""
    finally:
        if process.poll() is None:
            process.kill()
        process.communicate(timeout=5)


def test_vf0082_rejects_nonempty_lock_file_without_touching_session(
    tmp_path: Path, overlap_quality_session: tuple[Path, list[str]]
) -> None:
    session, cases = overlap_quality_session
    marker = session.parent / f".{session.name}.operation.lock"
    marker.write_bytes(b"synthetic preserved content")
    aggregate = (session / "quality.aggregate.json").read_bytes()
    with pytest.raises(QualitySessionError, match="session-lock"):
        correct_meaning_changing_defect(
            "b" * 32, "evaluator-01", cases[0], reason_code=CORRECTION_REASON, raw_root=tmp_path
        )
    assert marker.read_bytes() == b"synthetic preserved content"
    assert (session / "quality.aggregate.json").read_bytes() == aggregate
    assert not (session / "scorecards/evaluator-01.correction.json").exists()


@pytest.mark.parametrize("target_exists", [False, True])
def test_vf0082_rejects_existing_lock_link_without_creating_or_changing_its_target(
    tmp_path: Path,
    overlap_quality_session: tuple[Path, list[str]],
    target_exists: bool,
) -> None:
    session, cases = overlap_quality_session
    marker = session.parent / f".{session.name}.operation.lock"
    marker.unlink()
    target = tmp_path / "unrelated-synthetic-target"
    sentinel = b"synthetic existing target"
    if target_exists:
        target.write_bytes(sentinel)
    try:
        marker.symlink_to(target)
    except OSError as error:
        if sys.platform == "win32" and getattr(error, "winerror", None) == 1314:
            pytest.skip("native file symlink setup requires a host privilege; modeled control runs")
        raise
    original_link_target = marker.readlink()
    before = {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    }

    with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:session-lock$"):
        correct_meaning_changing_defect(
            "b" * 32, "evaluator-01", cases[0], reason_code=CORRECTION_REASON, raw_root=tmp_path
        )
    assert marker.is_symlink() and marker.readlink() == original_link_target
    assert {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    } == before
    if target_exists:
        assert target.read_bytes() == sentinel
    else:
        assert not target.exists()

    # Only the test owner removes its unsafe entry; ordinary retry remains usable.
    marker.unlink()
    assert (
        correct_meaning_changing_defect(
            "b" * 32, "evaluator-01", cases[0], reason_code=CORRECTION_REASON, raw_root=tmp_path
        )["status"]
        == "pass"
    )
    assert marker.is_file() and marker.read_bytes() == b""


@pytest.mark.parametrize("target_exists", [False, True])
def test_vf0082_modeled_lock_link_preserves_real_target_and_session(
    tmp_path: Path,
    overlap_quality_session: tuple[Path, list[str]],
    monkeypatch: pytest.MonkeyPatch,
    target_exists: bool,
) -> None:
    session, cases = overlap_quality_session
    marker = session.parent / f".{session.name}.operation.lock"
    marker.write_bytes(b"synthetic link entry")
    target = tmp_path / "modeled-link-target"
    if target_exists:
        target.write_bytes(b"synthetic target content")
    before = {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    }
    original_open, original_lstat = os.open, Path.lstat
    link_info = os.stat_result((stat.S_IFLNK | 0o600, *tuple(original_lstat(marker))[1:]))
    flags_seen: list[int] = []

    def resolve_link(
        path: object, flags: int, mode: int = 0o777, *, dir_fd: int | None = None
    ) -> int:
        if path == marker:
            flags_seen.append(flags)
            # Model the Windows resolution observed in CI: even exclusive
            # creation can follow a dangling link. Target I/O remains real.
            return original_open(target, flags, mode)
        return original_open(cast(Any, path), flags, mode, dir_fd=dir_fd)

    def inspect_link(path: Path) -> os.stat_result:
        return link_info if path == marker else original_lstat(path)

    with monkeypatch.context() as patch:
        patch.setattr(os, "open", resolve_link)
        patch.setattr(Path, "lstat", inspect_link)
        with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:session-lock$"):
            correct_meaning_changing_defect(
                "b" * 32, "evaluator-01", cases[0], reason_code=CORRECTION_REASON, raw_root=tmp_path
            )
    assert marker.read_bytes() == b"synthetic link entry"
    assert {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    } == before
    if target_exists:
        assert target.read_bytes() == b"synthetic target content"
    else:
        assert not target.exists()
    assert flags_seen == []


@pytest.mark.parametrize("kind", ["hardlink", "different-open-file"])
def test_vf0082_unsafe_lock_identity_preserves_session(
    tmp_path: Path,
    overlap_quality_session: tuple[Path, list[str]],
    monkeypatch: pytest.MonkeyPatch,
    kind: str,
) -> None:
    session, cases = overlap_quality_session
    marker = session.parent / f".{session.name}.operation.lock"
    target = tmp_path / "synthetic-other-lock"
    target.write_bytes(b"")
    if kind == "hardlink":
        marker.unlink()
        marker.hardlink_to(target)
        assert target.stat().st_nlink == 2
    else:
        original_open = os.open

        def changed_open(
            path: object, flags: int, mode: int = 0o777, *, dir_fd: int | None = None
        ) -> int:
            if path == marker and not flags & os.O_EXCL:
                return original_open(target, flags, mode)
            return original_open(cast(Any, path), flags, mode, dir_fd=dir_fd)

        monkeypatch.setattr(os, "open", changed_open)
    before = {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    }
    with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:session-lock$"):
        correct_meaning_changing_defect(
            "b" * 32, "evaluator-01", cases[0], reason_code=CORRECTION_REASON, raw_root=tmp_path
        )
    assert marker.read_bytes() == target.read_bytes() == b""
    assert {
        path.relative_to(session): path.read_bytes()
        for path in session.rglob("*")
        if path.is_file()
    } == before


def _synthetic_scorecards() -> tuple[dict[str, tuple[str, str]], list[dict[str, object]]]:
    na = "not-applicable"
    cells = (
        ((1, 5, na), (2, 4, 5)),
        ((1, na, na), (5, na, na)),
        ((na, na, na), (2, 4, na)),
        ((2, 3, 4), (1, 2, na)),
        ((5, 5, 1), (1, 1, 5)),
        ((na, 2, 4), (na, na, 5)),
        ((1, 2, 3), (4, 5, na)),
    )
    by_sample = {
        f"{index:032x}": (candidate_id, case_id)
        for index, (candidate_id, case_id) in enumerate(
            (
                ("candidate-a", "case-a"),
                ("candidate-a", "case-b"),
                ("candidate-b", "case-a"),
                ("candidate-b", "case-b"),
            ),
            1,
        )
    }
    cards: list[dict[str, object]] = []
    for evaluator in range(3):
        samples: list[dict[str, object]] = []
        for sample_id, (candidate_id, case_id) in by_sample.items():
            case_index = int(case_id == "case-b")
            samples.append(
                {
                    "sampleId": sample_id,
                    "caseId": case_id,
                    "scores": {
                        dimension: (
                            values[case_index][evaluator] if candidate_id == "candidate-a" else 4
                        )
                        for dimension, values in zip(DIMENSIONS, cells, strict=True)
                    },
                    "meaningChangingDefect": candidate_id == "candidate-a"
                    and (evaluator, case_index) in {(0, 0), (1, 0), (2, 1)},
                }
            )
        cards.append(
            {
                "sessionId": "c" * 32,
                "evaluatorId": f"evaluator-{evaluator + 1:02d}",
                "samples": samples,
            }
        )
    return by_sample, cards


def _expected_quality(candidate_id: str) -> dict[str, object]:
    first = candidate_id == "candidate-a"
    means = (3.5, 3.0, 3.0, 2.25, 3.0, 4.0, 3.25) if first else (4.0,) * 7
    return {
        "evaluatorCount": 3,
        "blindOrder": True,
        "scale": "1-5",
        "overallMean": 3.142857142857143 if first else 4.0,
        "dimensions": dict(zip(DIMENSIONS, means, strict=True)),
        "meaningChangingDefects": 2 if first else 0,
        "limitations": [
            "small-panel",
            "spanish-only",
            "fixed-voices-only",
            "synthetic-corpus-only",
            "not-accessibility-certification",
        ],
    }


def test_quality_leaf_bindings_and_entire_evaluator_html() -> None:
    for name in ("DIMENSIONS", "QualitySessionError", "_score"):
        assert getattr(quality, name) is getattr(quality_scoring, name)
    name = "_render_evaluator_html"
    assert getattr(quality, name) is getattr(quality_presentation, name)
    name = "DIMENSIONS"
    assert getattr(quality, name) is getattr(quality_presentation, name)
    assert QualitySessionError.__module__ == "benchmarks.quality"
    error = QualitySessionError("missing-dimension")
    assert isinstance(error, RuntimeError)
    assert error.code == "missing-dimension"
    assert str(error) == "tts-benchmark-quality:missing-dimension"
    for value in (True, False, 0, 6, 1.0, None):
        with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:invalid-scorecard$"):
            quality_scoring._score(value)
    card: dict[str, object] = {
        "sessionId": "a" * 32,
        "evaluatorId": "evaluator-01",
        "samples": [
            {
                "sampleId": "b" * 32,
                "caseId": "synthetic-case",
                "scores": {dimension: None for dimension in DIMENSIONS},
                "meaningChangingDefect": None,
            }
        ],
    }
    payload = quality_presentation._render_evaluator_html("evaluator-01", card).encode("utf-8")
    assert len(payload) == 3675
    assert (
        hashlib.sha256(payload).hexdigest()
        == "24ff8309930111c671c17a53145e71f03b0f10488143cfcc53f66aa0c76b8e15"
    )


@pytest.mark.parametrize("candidate_id", ["candidate-a", "candidate-b"])
def test_pure_quality_scores_match_original_multievaluator_result(candidate_id: str) -> None:
    by_sample, cards = _synthetic_scorecards()
    assert _aggregate_candidate_scores(
        candidate_id, ("case-a", "case-b"), by_sample, cards, {("evaluator-01", "case-a")}
    ) == _expected_quality(candidate_id)


@pytest.mark.parametrize(
    "fault, error_type",
    [
        ("missing-dimension", QualitySessionError),
        ("missing-key", KeyError),
        ("nonmapping", TypeError),
    ],
)
def test_pure_quality_scores_preserve_missing_dimension_and_raw_errors(
    fault: str, error_type: type[Exception]
) -> None:
    by_sample, cards = _synthetic_scorecards()
    for card in cards:
        for sample in cast(list[dict[str, object]], card["samples"])[:2]:
            scores = cast(dict[str, object], sample["scores"])
            if fault == "missing-dimension":
                scores["artifactFreedom"] = "not-applicable"
            elif fault == "missing-key":
                del scores["artifactFreedom"]
            else:
                sample["scores"] = None
    with pytest.raises(error_type) as caught:
        _aggregate_candidate_scores("candidate-a", ("case-a", "case-b"), by_sample, cards, set())
    if fault == "missing-dimension":
        assert cast(QualitySessionError, caught.value).code == "missing-dimension"
        assert str(caught.value) == "tts-benchmark-quality:missing-dimension"


@pytest.fixture
def submission_session(tmp_path: Path) -> tuple[Path, dict[str, object]]:
    _, cards = _synthetic_scorecards()
    card = cards[0]
    session = tmp_path / "quality-v2" / ("c" * 32)
    (session / "scorecards").mkdir(parents=True)
    (session / "session.json").write_text(
        json.dumps({"state": "ready", "evaluatorIds": ["evaluator-01"]}), encoding="utf-8"
    )
    (session / "scorecards" / "evaluator-01.template.json").write_text(
        json.dumps(card), encoding="utf-8"
    )
    return session, card


def test_scorecard_submission_projects_without_mutating_input(
    tmp_path: Path, submission_session: tuple[Path, dict[str, object]]
) -> None:
    session, card = submission_session
    expected = deepcopy(card)
    card["ignored"] = {"nested": [1, 5, "not-applicable"]}
    for sample in cast(list[dict[str, object]], card["samples"]):
        sample["ignored"] = {"nested": [True, False]}
        sample["scores"] = dict(reversed(list(cast(dict[str, object], sample["scores"]).items())))
    original = deepcopy(card)
    template_path = session / "scorecards" / "evaluator-01.template.json"
    template_bytes = template_path.read_bytes()
    (session / "scorecards" / "evaluator-02.completed.json").write_bytes(b"{}\n")
    assert submit_scorecard("c" * 32, card, raw_root=tmp_path) == {
        "status": "pass",
        "sessionId": "c" * 32,
        "evaluatorId": "evaluator-01",
        "completedEvaluators": 2,
    }
    saved = session / "scorecards" / "evaluator-01.completed.json"
    assert saved.read_bytes() == (
        json.dumps(expected, ensure_ascii=True, indent=2, sort_keys=True) + "\n"
    ).encode("utf-8")
    assert json.loads(saved.read_bytes()) == expected
    assert card == original
    assert template_path.read_bytes() == template_bytes


@pytest.mark.parametrize(
    "field, value",
    [
        ("sample", None),
        ("sampleId", "different-sample"),
        ("caseId", "different-case"),
        ("scores", None),
        ("scores", {}),
        ("scores", {**dict.fromkeys(DIMENSIONS, 4), "extra": 4}),
        ("meaningChangingDefect", 1),
        *[("score", value) for value in (True, False, 0, 6, 1.0, None)],
    ],
)
def test_scorecard_submission_rejects_malformed_samples_without_output(
    tmp_path: Path,
    submission_session: tuple[Path, dict[str, object]],
    field: str,
    value: object,
) -> None:
    session, card = submission_session
    samples = cast(list[object], card["samples"])
    sample = cast(dict[str, object], samples[0])
    if field == "sample":
        samples[0] = value
    elif field == "score":
        cast(dict[str, object], sample["scores"])[DIMENSIONS[0]] = value
    else:
        sample[field] = value
    with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:invalid-scorecard$"):
        submit_scorecard("c" * 32, card, raw_root=tmp_path)
    assert not tuple((session / "scorecards").glob("*.completed.json"))
    assert not tuple((session / "scorecards").glob("*.tmp"))


def test_invalid_scorecard_precedes_existing_completed_file(
    tmp_path: Path, submission_session: tuple[Path, dict[str, object]]
) -> None:
    session, card = submission_session
    saved = session / "scorecards" / "evaluator-01.completed.json"
    previous_bytes = b'{"previous": "synthetic-completed-card"}\n'
    saved.write_bytes(previous_bytes)
    cast(list[dict[str, object]], card["samples"])[0]["caseId"] = "different-case"
    with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:invalid-scorecard$"):
        submit_scorecard("c" * 32, card, raw_root=tmp_path)
    assert saved.read_bytes() == previous_bytes


def test_scorecard_rejects_actual_reordering(tmp_path: Path) -> None:
    _, cards = _synthetic_scorecards()
    card = cards[0]
    session = tmp_path / "quality-v2" / ("c" * 32)
    (session / "scorecards").mkdir(parents=True)
    (session / "session.json").write_text(
        json.dumps({"state": "ready", "evaluatorIds": ["evaluator-01"]}), encoding="utf-8"
    )
    (session / "scorecards" / "evaluator-01.template.json").write_text(
        json.dumps(card), encoding="utf-8"
    )
    samples = cast(list[dict[str, object]], card["samples"])
    samples[0], samples[1] = samples[1], samples[0]
    with pytest.raises(QualitySessionError, match=r"^tts-benchmark-quality:invalid-scorecard$"):
        submit_scorecard("c" * 32, card, raw_root=tmp_path)
    assert not (session / "scorecards" / "evaluator-01.completed.json").exists()


@pytest.mark.parametrize("fault", [None, "later-candidate", "missing-dimension", "later-corpus"])
def test_quality_aggregation_preserves_read_and_failure_order(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, fault: str | None
) -> None:
    by_sample, cards = _synthetic_scorecards()
    session = tmp_path / "quality-v2" / ("c" * 32)
    (session / "scorecards").mkdir(parents=True)
    metadata: dict[str, object] = {
        "state": "ready",
        "evaluatorIds": [card["evaluatorId"] for card in cards],
        "expectedCandidates": [
            "candidate-a",
            None if fault == "later-candidate" else "candidate-b",
        ],
        "protocolVersion": "tts-feasibility-profile-v2",
    }
    if fault == "missing-dimension":
        for card in cards:
            for sample in cast(list[dict[str, object]], card["samples"])[:2]:
                cast(dict[str, object], sample["scores"])["artifactFreedom"] = "not-applicable"
    files: dict[str, object] = {
        "session.json": metadata,
        "randomization-key.json": {
            "samples": [
                {"sampleId": sample_id, "candidateId": candidate_id, "caseId": case_id}
                for sample_id, (candidate_id, case_id) in by_sample.items()
            ]
        },
        "scorecards/evaluator-01.correction.json": {
            "sessionId": "c" * 32,
            "evaluatorId": "evaluator-01",
            "caseId": "case-a",
            "previousMeaningChangingDefect": True,
            "correctedMeaningChangingDefect": False,
            "reasonCode": CORRECTION_REASON,
        },
    }
    files.update({f"scorecards/{card['evaluatorId']}.completed.json": card for card in cards})
    for relative_path, value in files.items():
        (session / relative_path).write_text(json.dumps(value), encoding="utf-8")
    reads: list[str] = []
    original_read = quality._read_mapping

    def read_mapping(path: Path) -> dict[str, object]:
        reads.append(path.name)
        return original_read(path)

    def load_corpus(path: Path) -> BenchmarkCorpus:
        reads.append(path.name)
        if fault == "later-corpus" and reads.count("corpus-v1.json") == 2:
            raise OSError("synthetic-corpus-failure")
        return BenchmarkCorpus("synthetic", ("case-a", "case-b"), (), {})

    monkeypatch.setattr(quality, "_read_mapping", read_mapping)
    monkeypatch.setattr(quality, "load_corpus", load_corpus)
    if fault is None:
        results = {
            candidate_id: _expected_quality(candidate_id)
            for candidate_id in ("candidate-a", "candidate-b")
        }
        assert aggregate_scores("c" * 32, raw_root=tmp_path) == {
            "status": "pass",
            "sessionId": "c" * 32,
            "evaluatorCount": 3,
            "eligibleForPromotion": True,
            "candidates": results,
        }
        assert json.loads((session / "quality.aggregate.json").read_text(encoding="utf-8")) == {
            "sessionVersion": "tts-quality-session-v1",
            "sessionId": "c" * 32,
            "eligibleForPromotion": True,
            "candidates": results,
        }
    else:
        code = "invalid-metadata" if fault == "later-candidate" else fault
        error_type = OSError if fault == "later-corpus" else QualitySessionError
        message = (
            "synthetic-corpus-failure"
            if fault == "later-corpus"
            else f"tts-benchmark-quality:{code}"
        )
        with pytest.raises(error_type, match=f"^{message}$"):
            aggregate_scores("c" * 32, raw_root=tmp_path)
        assert not (session / "quality.aggregate.json").exists()
    assert reads == [
        "session.json",
        "evaluator-01.completed.json",
        "evaluator-02.completed.json",
        "evaluator-03.completed.json",
        "evaluator-01.correction.json",
        "randomization-key.json",
    ] + ["corpus-v1.json"] * (1 if fault in {"later-candidate", "missing-dimension"} else 2)


@pytest.mark.parametrize("generation_fails", [False, True])
def test_r8_02_cleanup_failure_rejects_success_and_preserves_generation_error(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, generation_fails: bool
) -> None:
    monkeypatch.setattr(quality, "_write_wave", _fake_wave)
    closes: list[bool] = []

    class Adapter(FakeQualityAdapter):
        def synthesize_for_quality(self, request: GenerationRequest) -> tuple[list[float], int]:
            if generation_fails:
                raise QualitySessionError("invalid-audio")
            return super().synthesize_for_quality(request)

        def close(self) -> None:
            closes.append(True)
            raise RuntimeError("synthetic-cleanup-private-detail")

    raw_root = tmp_path / "raw"
    session_id = "8" * 32
    with pytest.raises(
        QualitySessionError, match=r"invalid-audio$" if generation_fails else r"cleanup$"
    ):
        generate_candidate_audio(
            _request(tmp_path, QWEN_CANDIDATE_ID),
            session_id,
            raw_root=raw_root,
            adapter_builder=Adapter,
        )
    assert closes == [True]
    assert not (raw_root / "quality-v2" / session_id).exists()
