"""Model-free coverage for the frozen v12 corrective full matrix."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Final, cast

import pytest

import benchmarks.corrective_v12_quality as v12_quality
from benchmarks.adapters.corrective_v9 import ChatterboxV9Configuration
from benchmarks.chatterbox_v11_screen import (
    CorrectivePreflightReceipt,
    ScreenConditions,
)
from benchmarks.contracts import BenchmarkRun
from benchmarks.corrective_v12 import (
    V12PreflightReceipt,
    build_raw_result,
)
from benchmarks.fake_adapter import (
    DeterministicFakeAdapter,
    FakeMemoryProbe,
    FakeNanosecondClock,
)
from benchmarks.harness import BenchmarkHarness, load_bilingual_corpus
from benchmarks.preflight import HostSnapshot
from benchmarks.v11_authority import CANDIDATE_ID
from benchmarks.v12_authority import (
    QWEN_SERENA_CANDIDATE_ID,
    validate_v12_raw_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v7.json"


def _receipt() -> V12PreflightReceipt:
    from benchmarks.adapters.corrective_v9 import load_chatterbox_v11_profile

    execution = CorrectivePreflightReceipt(
        expected_commit_sha="b" * 40,
        candidate_id=CANDIDATE_ID,
        candidate_python=Path("python"),
        artifact_root=Path("artifacts"),
        profile=load_chatterbox_v11_profile(REPOSITORY_ROOT),
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
    return V12PreflightReceipt(
        authority_commit_sha="a" * 40,
        execution=execution,
        failures=(),
    )


def _run() -> BenchmarkRun:
    clock = FakeNanosecondClock()

    def factory() -> DeterministicFakeAdapter:
        return DeterministicFakeAdapter(
            clock,
            sample_rate_hz=24_000,
        )

    result = BenchmarkHarness(
        clock=clock,
        memory_probe=FakeMemoryProbe(),
    ).run_bilingual_full_protocol(
        adapter_factory=factory,
        corpora=tuple(load_bilingual_corpus(CORPUS_PATH, language) for language in ("es", "en")),
        role="balanced",
    )
    assert result.failure is None
    assert result.run is not None
    return result.run


def test_v12_full_protocol_uses_frozen_bilingual_counts() -> None:
    run = _run()
    assert len(run.load_observations) == 5
    assert sum(value.phase == "warm" for value in run.generation_observations) == 20
    assert sum(value.phase == "sustained" for value in run.generation_observations) == 30
    assert len(run.cancellation_observations) == 8
    assert {
        (value.sample_rate_hz, value.channels, value.sample_format)
        for value in run.generation_observations
    } == {(24_000, 1, "float32")}


def test_v12_private_raw_is_schema_valid_and_decision_neutral() -> None:
    raw = build_raw_result(
        receipt=_receipt(),
        run=_run(),
        minimum_available_ram_bytes=8 * 1024**3,
        failure_code=None,
    )
    validate_v12_raw_result(
        REPOSITORY_ROOT,
        raw,
        ancestry_checker=lambda _authority, _execution: True,
        authority_tree_checker=lambda _authority: True,
    )
    assert raw["status"] == "measured-awaiting-decision"
    assert raw["decision"] == {"state": "pending-maintainer-decision"}
    attempts = cast(list[dict[str, object]], raw["attempts"])
    assert len(attempts) == 50


def test_v12_conditions_remain_explicit() -> None:
    conditions = ScreenConditions(
        sleep_disabled=True,
        background_load_acceptable=True,
        thermal_state_acceptable=True,
    )
    assert conditions.sleep_disabled


def test_v12_private_quality_aggregate_is_language_specific_and_bounded(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    candidate_id = QWEN_SERENA_CANDIDATE_ID
    session_id = "a" * 32
    session = tmp_path / candidate_id / session_id
    quality = session / "quality"
    quality.mkdir(parents=True)
    samples = [
        {"sampleId": f"{index:032x}", "caseId": f"es-case-{index}", "language": "es"}
        for index in range(5)
    ]
    (quality / "private-map.json").write_text(
        json.dumps(
            {
                "schemaVersion": "tts-corrective-quality-private-v12",
                "sessionId": session_id,
                "candidateId": candidate_id,
                "authorityCommitSha": "a" * 40,
                "executionCommitSha": "b" * 40,
                "blindOrder": True,
                "samples": samples,
            }
        ),
        encoding="utf-8",
    )
    result_path = tmp_path / "result.json"
    result_path.write_text(
        json.dumps(
            {
                "schemaVersion": "tts-corrective-quality-scorecard-v12",
                "sessionId": session_id,
                "candidateId": candidate_id,
                "evaluatorCount": 1,
                "blindOrder": True,
                "samples": [
                    {
                        "sampleId": sample["sampleId"],
                        "language": "es",
                        "scores": {dimension: 4 for dimension in v12_quality.DIMENSIONS},
                        "meaningChangingDefect": False,
                        "wrongLanguage": False,
                    }
                    for sample in samples
                ],
            }
        ),
        encoding="utf-8",
    )
    monkeypatch.setattr(v12_quality, "RAW_ROOT", tmp_path)

    aggregate = v12_quality._aggregate(
        candidate_id=candidate_id,
        session_id=session_id,
        result_path=result_path,
    )

    languages = cast(list[dict[str, object]], aggregate["languages"])
    assert languages == [
        {
            "language": "es",
            "status": "reviewed-awaiting-decision",
            "sampleCount": 5,
            "dimensionMeans": {dimension: 4.0 for dimension in v12_quality.DIMENSIONS},
            "meaningChangingDefects": 0,
            "wrongLanguageOutputs": 0,
        }
    ]
    assert not result_path.exists()
