"""Content and lifecycle tests for ignored raw benchmark journals."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from benchmarks.contracts import (
    BenchmarkFailure,
    CancellationObservation,
    GenerationObservation,
    LoadObservation,
    MemoryObservation,
)
from benchmarks.raw import RawJournalError, RawMeasurementJournal


def journal() -> RawMeasurementJournal:
    return RawMeasurementJournal(
        candidate_id="fixture-candidate-v1",
        role="compatibility",
        commit_sha="a" * 40,
        session_id="b" * 32,
    )


def test_raw_journal_writes_only_bounded_content_free_observations(tmp_path: Path) -> None:
    value = journal()
    value.record_load(LoadObservation(1, 2_000_000_000, 100_000_000))
    value.record_generation(
        GenerationObservation(
            case_id="case-1",
            phase="warm",
            sample_count=44_100,
            sample_rate_hz=44_100,
            channels=1,
            sample_format="float32",
            wall_ns=200_000_000,
            first_audio_ns=200_000_000,
            time_to_fifteen_seconds_ns=None,
        )
    )
    value.record_cancellation(
        CancellationObservation(
            trial_id="before-dispatch",
            stop_mode="worker-termination",
            stop_ns=10_000_000,
            cleanup_ns=0,
            stale_frames=0,
            raw_session_removed=True,
        )
    )
    value.record_cancellation_failure(
        "after-first-audio",
        BenchmarkFailure(code="cancellation-failed", request_id="cancel-3"),
    )
    value.record_memory(
        MemoryObservation(
            ram_sampling_interval_milliseconds=50,
            process_vram_sampling_interval_milliseconds=None,
            vram_measurement_method="unavailable-cpu-role",
            peak_process_tree_ram_bytes=1_000_000,
            peak_process_vram_bytes=None,
            peak_framework_vram_bytes=None,
            peak_vram_bytes=None,
            gpu_provider_allocations=0,
        )
    )

    target = value.write(
        tmp_path / "raw",
        status="failed",
        forbidden_values=("private synthetic text", "privacy-canary"),
    )
    payload = json.loads(target.read_text(encoding="utf-8"))
    assert payload["status"] == "failed"
    assert payload["rawVersion"] == "tts-feasibility-raw-v2"
    assert payload["protocolVersion"] == "tts-feasibility-profile-v2"
    assert payload["memory"]["vramMeasurementMethod"] == "unavailable-cpu-role"
    assert payload["memory"]["peakVramBytes"] is None
    assert payload["cancellationTrials"][1] == {
        "trialId": "after-first-audio",
        "status": "fail",
        "failureCode": "cancellation-failed",
    }
    serialized = target.read_bytes()
    assert b"private synthetic text" not in serialized
    assert b"privacy-canary" not in serialized


def test_raw_journal_rejects_duplicate_sessions_and_sensitive_values(tmp_path: Path) -> None:
    value = journal()
    value.write(tmp_path / "raw", status="complete", forbidden_values=())
    with pytest.raises(RawJournalError, match=r"^tts-benchmark-raw:session-path$"):
        value.write(tmp_path / "raw", status="complete", forbidden_values=())

    sensitive = journal()
    sensitive.record_failure(
        BenchmarkFailure(
            code="generation-failed",
            request_id="private-value",
        )
    )
    with pytest.raises(RawJournalError, match=r"^tts-benchmark-raw:sensitive-value$"):
        sensitive.write(
            tmp_path / "other",
            status="failed",
            forbidden_values=("private-value",),
        )

    bounded = journal()
    with pytest.raises(RawJournalError, match=r"^tts-benchmark-raw:observation-limit$"):
        bounded.record_failure(
            BenchmarkFailure(
                code="generation-failed",
                request_id="not allowed prose",
            )
        )


def test_v3_raw_journal_binds_configuration_without_text_or_paths(
    tmp_path: Path,
) -> None:
    identity = "b689b9b81cc7633687e80030ed172878d89196d57149370a82839e1ec83d61df"
    value = RawMeasurementJournal(
        candidate_id="qwen3-tts-1-7b-customvoice-cuda-bf16-v1",
        role="balanced",
        commit_sha="a" * 40,
        session_id="c" * 32,
        protocol_version="tts-feasibility-profile-v3",
        configuration_identity_sha256=identity,
    )
    target = value.write(
        tmp_path / "raw",
        status="failed",
        forbidden_values=("private narration", str(tmp_path)),
    )
    payload = json.loads(target.read_text(encoding="utf-8"))
    assert target.name == "performance-v3.raw.json"
    assert payload["rawVersion"] == "tts-feasibility-raw-v3"
    assert payload["protocolVersion"] == "tts-feasibility-profile-v3"
    assert payload["configurationIdentitySha256"] == identity
    assert b"private narration" not in target.read_bytes()
