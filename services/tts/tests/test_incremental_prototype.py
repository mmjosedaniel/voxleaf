"""Model-free proof of bounded segment delivery and cancellation containment."""

from __future__ import annotations

import json
from pathlib import Path
from typing import cast

import pytest
from jsonschema import Draft202012Validator

from benchmarks.contracts import MemoryObservation
from benchmarks.harness import load_corpus
from benchmarks.incremental_prototype import (
    CANDIDATE_ID,
    CONFIGURATION_IDENTITY_SHA256,
    AudioUnit,
    PrototypeError,
    PrototypeSegment,
    WorkerReady,
    WorkerStop,
    WorkIdentity,
    _validate_segment,
    execute_prototype,
)
from benchmarks.memory import ProcessResourceSample
from benchmarks.preflight import HostSnapshot

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]


class FakePrototypeWorker:
    def __init__(self, *, complete_before_cancel: bool = False) -> None:
        self._active: PrototypeSegment | None = None
        self._complete_before_cancel = complete_before_cancel
        self.started = False
        self.stopped = False

    def start(self) -> WorkerReady:
        assert not self.started
        self.started = True
        return WorkerReady(
            load_ns=10_000_000,
            configuration_setup_ns=1_000_000,
            framework_vram_bytes=2_000_000_000,
        )

    def submit(self, segment: PrototypeSegment) -> None:
        assert self.started and not self.stopped and self._active is None
        self._active = segment

    def receive_audio(self) -> AudioUnit:
        segment = self._active
        assert segment is not None
        self._active = None
        return AudioUnit(
            identity=segment.identity,
            sample_count=4,
            sample_rate_hz=24_000,
            channels=1,
            sample_format="float32",
            payload=b"\x00" * 16,
        )

    def audio_ready(self) -> bool:
        return self._complete_before_cancel

    def terminate(self) -> WorkerStop:
        late = (self.receive_audio(),) if self._active is not None else ()
        self.stopped = True
        return WorkerStop(elapsed_ns=10_000_000, exited=True, late_units=late)

    def close(self) -> WorkerStop:
        assert self._active is None
        self.stopped = True
        return WorkerStop(elapsed_ns=5_000_000, exited=True)


class FakeMemoryProbe:
    def __init__(self) -> None:
        self.started = False

    def start(self) -> None:
        self.started = True

    def stop(self) -> MemoryObservation:
        assert self.started
        self.started = False
        return MemoryObservation(
            ram_sampling_interval_milliseconds=50,
            process_vram_sampling_interval_milliseconds=1_000,
            vram_measurement_method="wddm-dedicated-plus-pytorch-reserved",
            peak_process_tree_ram_bytes=4_000_000_000,
            peak_process_vram_bytes=3_000_000_000,
            peak_framework_vram_bytes=2_000_000_000,
            peak_vram_bytes=3_000_000_000,
            gpu_provider_allocations=1,
        )


class ReleasedResourceSampler:
    def sample(self, root_pid: int) -> ProcessResourceSample:
        assert root_pid > 0
        return ProcessResourceSample(
            process_tree_ram_bytes=0,
            process_tree_vram_bytes=0,
            gpu_provider_allocations=0,
        )


def _host() -> HostSnapshot:
    return HostSnapshot(
        operating_system="Windows",
        os_version="10.0.26200",
        architecture="x86_64",
        python_version="3.12.10",
        cpu_model="Synthetic CPU",
        logical_processors=20,
        total_ram_bytes=32_000_000_000,
        free_ram_bytes=16_000_000_000,
        free_disk_bytes=100_000_000_000,
        power_online=True,
        power_mode="Balanced",
        gpu_model="Synthetic GPU",
        driver_version="1.2.3",
        total_vram_bytes=8_000_000_000,
        free_vram_bytes=7_000_000_000,
        process_vram_available=True,
    )


def _execute(*, near_hard_complete: bool = False) -> dict[str, object]:
    workers = [
        FakePrototypeWorker(),
        FakePrototypeWorker(),
        FakePrototypeWorker(),
        FakePrototypeWorker(complete_before_cancel=near_hard_complete),
        FakePrototypeWorker(),
    ]
    iterator = iter(workers)
    result = execute_prototype(
        commit_sha="a" * 40,
        host=_host(),
        corpus=load_corpus(REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v1.json"),
        worker_factory=lambda: next(iterator),
        memory_probe=FakeMemoryProbe(),
        resource_sampler=ReleasedResourceSampler(),
        sleeper=lambda seconds: None,
        root_pid=123,
    )
    assert all(worker.stopped for worker in workers)
    return result


def test_exact_topology_delivers_releases_and_rejects_late_units() -> None:
    result = _execute()
    schema = json.loads(
        (
            REPOSITORY_ROOT
            / "benchmarks"
            / "tts"
            / "schemas"
            / "incremental-cancellation-prototype-result-v1.schema.json"
        ).read_text(encoding="utf-8")
    )
    Draft202012Validator(schema).validate(result)

    assert result["passed"] is True
    assert result["failureCodes"] == []
    topology = cast(dict[str, object], result["topology"])
    assert topology["normalDeliveryUnits"] == 2
    assert topology["normalDeliveryUnitsReleased"] == 2
    assert topology["peakPublishedQueueUnits"] == 1
    trials = cast(list[dict[str, object]], result["trials"])
    assert [trial["trialId"] for trial in trials] == [
        "before-dispatch",
        "accepted-before-audio",
        "after-first-audio",
        "near-hard-mid-generation",
        "during-cleanup",
    ]
    assert all(trial["passed"] is True for trial in trials)
    assert all(trial["stalePublishedUnits"] == 0 for trial in trials)
    assert trials[2]["publishedUnitsBeforeCancellation"] == 1


def test_completion_before_near_hard_boundary_fails_closed() -> None:
    result = _execute(near_hard_complete=True)

    assert result["passed"] is False
    assert result["failureCodes"] == ["cancellation"]
    trials = cast(list[dict[str, object]], result["trials"])
    assert trials[3]["trialId"] == "near-hard-mid-generation"
    assert trials[3]["passed"] is False
    assert trials[3]["stalePublishedUnits"] == 0


def test_segment_and_safe_result_privacy_bounds_are_enforced() -> None:
    private_text = "contenido-sintetico-privado"
    identity = WorkIdentity(
        session_id="session",
        generation_id="generation",
        segment_id="segment",
        candidate_id=CANDIDATE_ID,
        configuration_identity_sha256=CONFIGURATION_IDENTITY_SHA256,
    )
    oversized = PrototypeSegment(
        identity=identity,
        case_id="oversized",
        text="x" * 641,
    )
    with pytest.raises(
        PrototypeError,
        match=r"^tts-incremental-prototype:invalid-segment$",
    ):
        _validate_segment(oversized)

    serialized = json.dumps(_execute(), sort_keys=True)
    assert private_text not in serialized
    assert "artifactRoot" not in serialized
    assert "candidatePython" not in serialized
    assert "payload" not in serialized
