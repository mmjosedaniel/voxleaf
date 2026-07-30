"""Model-free checks for decision-neutral corrective v9 screens."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path
from typing import Final, cast

from jsonschema import Draft202012Validator

from benchmarks.adapters.corrective_v9 import (
    ChatterboxV9Configuration,
    load_chatterbox_v9_profile,
)
from benchmarks.contracts import (
    AdapterCapabilities,
    BenchmarkRun,
    CancellationObservation,
    CancellationTrialId,
    GenerationObservation,
    LoadObservation,
    MemoryObservation,
)
from benchmarks.corrective_v9_screen import (
    CorrectivePreflightReceipt,
    _content_safe_output,
    _raw_payload,
)
from benchmarks.preflight import HostSnapshot
from benchmarks.v9_authority import CHATTERBOX_CANDIDATE_ID, load_frozen_v9_authority

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
SERVICE_ROOT: Final = Path(__file__).resolve().parents[1]


def _receipt() -> CorrectivePreflightReceipt:
    return CorrectivePreflightReceipt(
        expected_commit_sha="b" * 40,
        candidate_id=CHATTERBOX_CANDIDATE_ID,
        candidate_python=Path("candidate-python"),
        artifact_root=Path("artifacts"),
        profile=load_chatterbox_v9_profile(REPOSITORY_ROOT),
        configuration=ChatterboxV9Configuration(Path("artifacts")),
        languages=("es", "en"),
        role="balanced",
        host=HostSnapshot(
            operating_system="Windows",
            os_version="test",
            architecture="x86_64",
            python_version="3.12.10",
            cpu_model="test",
            logical_processors=16,
            total_ram_bytes=32 * 1024**3,
            free_ram_bytes=16 * 1024**3,
            free_disk_bytes=100 * 1024**3,
            power_online=True,
            power_mode="ac",
            gpu_model="test",
            driver_version="test",
            total_vram_bytes=8 * 1024**3,
            free_vram_bytes=7 * 1024**3,
            process_vram_available=True,
        ),
        network_isolation=True,
        failures=(),
    )


def _run() -> BenchmarkRun:
    generations = tuple(
        GenerationObservation(
            case_id=f"{language}-case-{index}",
            phase="warm",
            sample_count=24_000,
            sample_rate_hz=24_000,
            channels=1,
            sample_format="float32",
            wall_ns=1_440_000_000,
            first_audio_ns=1_440_000_000,
            time_to_fifteen_seconds_ns=None,
        )
        for language in ("es", "en")
        for index in range(5)
    )
    trials: tuple[CancellationTrialId, ...] = (
        "before-dispatch",
        "accepted-before-audio",
        "after-first-audio",
        "near-hard-mid-generation",
    )
    cancellations = tuple(
        CancellationObservation(
            trial_id=trials[index],
            stop_mode="worker-termination",
            stop_ns=100_000_000,
            cleanup_ns=100_000_000,
            stale_frames=0,
            raw_session_removed=True,
        )
        for _language in ("es", "en")
        for index in range(4)
    )
    return BenchmarkRun(
        candidate_id=CHATTERBOX_CANDIDATE_ID,
        role="balanced",
        capabilities=AdapterCapabilities(
            candidate_id=CHATTERBOX_CANDIDATE_ID,
            streaming_granularity="complete-waveform",
            sample_format="float32",
            generation_cancellation="worker-termination",
        ),
        load_observations=(
            LoadObservation(
                observation_index=1,
                load_ns=10_000_000_000,
                cleanup_ns=1_000_000_000,
            ),
        ),
        generation_observations=generations,
        cancellation_observations=cancellations,
        memory=MemoryObservation(
            ram_sampling_interval_milliseconds=50,
            process_vram_sampling_interval_milliseconds=1_000,
            vram_measurement_method="wddm-dedicated-plus-pytorch-reserved",
            peak_process_tree_ram_bytes=3 * 1024**3,
            peak_process_vram_bytes=4 * 1024**3,
            peak_framework_vram_bytes=4 * 1024**3,
            peak_vram_bytes=4 * 1024**3,
            gpu_provider_allocations=1,
        ),
        failed_observations=0,
    )


def test_rtf_above_standard_target_is_an_observation_not_a_rejection() -> None:
    raw = _raw_payload(
        receipt=_receipt(),
        run=_run(),
        minimum_available_ram_bytes=8 * 1024**3,
        failure_code=None,
    )
    authority = load_frozen_v9_authority(REPOSITORY_ROOT)
    assert not tuple(Draft202012Validator(authority.raw_schema).iter_errors(raw))
    assert raw["status"] == "measured-awaiting-decision"
    assert raw["decision"] == {"state": "pending-maintainer-decision"}
    assert raw["observations"] == [
        "es-preferred-standard-rtf-target-exceeded",
        "en-preferred-standard-rtf-target-exceeded",
    ]


def test_content_safe_output_cannot_record_rejection() -> None:
    raw = _raw_payload(
        receipt=_receipt(),
        run=_run(),
        minimum_available_ram_bytes=8 * 1024**3,
        failure_code=None,
    )
    output = _content_safe_output(raw, "a" * 32)
    assert output["status"] == "measured-awaiting-decision"
    assert output["decisionState"] == "pending-maintainer-decision"
    assert output["rejectionRecorded"] is False
    performance = cast(list[dict[str, object]], output["performanceByLanguage"])
    assert [round(cast(float, value["warmP95Rtf"]), 2) for value in performance] == [
        1.44,
        1.44,
    ]


def test_isolated_worker_import_does_not_require_service_schema_validator() -> None:
    completed = subprocess.run(
        (
            sys.executable,
            "-c",
            ("import sys;sys.modules['jsonschema']=None;import benchmarks.corrective_v9_screen"),
        ),
        cwd=SERVICE_ROOT,
        check=False,
        capture_output=True,
        text=True,
        timeout=20,
    )
    assert completed.returncode == 0, completed.stderr
