"""Content-safe v6 CPU fallback assessment and result derivation."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Final, Literal, NoReturn, cast

from jsonschema import Draft202012Validator

from benchmarks.adapters.manifest import (
    PIPER_CPU_CANDIDATE_ID,
    PROFILE_V6_CONFIGURATION_SHA256,
    PROFILE_V6_LOCK_SHA256,
    PROFILE_V6_SHA256,
    CpuFallbackEvaluationAuthority,
)
from benchmarks.contracts import (
    AdapterCapabilities,
    ArtifactSummary,
    BenchmarkRun,
    CancellationObservation,
    CancellationStopMode,
    CancellationTrialId,
    GenerationObservation,
    LoadObservation,
    MemoryObservation,
    SampleFormat,
    SummaryMetadata,
)
from benchmarks.harness import load_corpus
from benchmarks.metrics import distribution, media_duration_seconds, real_time_factor
from benchmarks.preflight import PreflightReceipt, PreflightRequest
from benchmarks.summary import (
    build_summary,
    canonical_summary_bytes,
    load_schema,
    promote_summary,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
RAW_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "results" / "raw"
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v6.json"
RAW_SCHEMA_PATH: Final = (
    REPOSITORY_ROOT / "benchmarks" / "tts" / "schemas" / "cpu-fallback-raw-v6.schema.json"
)
SUMMARY_SCHEMA_PATH: Final = RAW_SCHEMA_PATH.with_name("cpu-fallback-summary-v6.schema.json")
RESULT_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "cpu-fallback-result-v6.json"
MAXIMUM_INPUT_BYTES: Final = 262_144


class CpuFallbackResultError(RuntimeError):
    """Fixed content-free v6 result failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-cpu-fallback-result:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise CpuFallbackResultError(code)


def _mapping(value: object, code: str = "invalid-result") -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str = "invalid-result") -> Sequence[object]:
    if not isinstance(value, list):
        _fail(code)
    return cast(Sequence[object], value)


def _integer(value: object, code: str = "invalid-result") -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        _fail(code)
    return value


def _string(value: object, code: str = "invalid-result") -> str:
    if not isinstance(value, str):
        _fail(code)
    return value


def _number(value: object, code: str = "invalid-result") -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool):
        _fail(code)
    return float(value)


def _session_path(candidate_id: str, session_id: str) -> Path:
    if candidate_id != PIPER_CPU_CANDIDATE_ID:
        _fail("candidate")
    root = RAW_ROOT.resolve()
    target = (root / candidate_id / session_id).resolve()
    try:
        relative = target.relative_to(root)
    except ValueError:
        _fail("session")
    if len(relative.parts) != 2 or not target.is_dir():
        _fail("session")
    return target


def _quality_session_path(session_id: str) -> Path:
    root = (RAW_ROOT / "quality-v2").resolve()
    target = (root / session_id).resolve()
    try:
        relative = target.relative_to(root)
    except ValueError:
        _fail("quality-session")
    if len(relative.parts) != 1 or not target.is_dir():
        _fail("quality-session")
    return target


def _load_raw(session_id: str) -> tuple[Mapping[str, object], Path]:
    session = _session_path(PIPER_CPU_CANDIDATE_ID, session_id)
    path = session / "performance-v6.raw.json"
    try:
        payload = path.read_bytes()
        if len(payload) > MAXIMUM_INPUT_BYTES:
            _fail("raw-size")
        raw = _mapping(json.loads(payload), "raw")
    except (OSError, json.JSONDecodeError):
        _fail("raw")
    schema = load_schema(RAW_SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    if tuple(Draft202012Validator(schema).iter_errors(raw)):
        _fail("raw-schema")
    return raw, session


def _git_output(repository_root: Path, arguments: tuple[str, ...]) -> bytes:
    try:
        return subprocess.run(
            ("git", *arguments),
            cwd=repository_root,
            check=True,
            capture_output=True,
            timeout=20,
        ).stdout
    except (OSError, subprocess.SubprocessError):
        _fail("authority")


def _verify_authority(
    raw: Mapping[str, object],
    *,
    authority_commit_sha: str,
    execution_commit_sha: str,
) -> None:
    if (
        len(authority_commit_sha) != 40
        or len(execution_commit_sha) != 40
        or authority_commit_sha == execution_commit_sha
        or raw.get("commitSha") != execution_commit_sha
        or raw.get("configurationIdentitySha256") != PROFILE_V6_CONFIGURATION_SHA256
    ):
        _fail("authority")
    _git_output(
        REPOSITORY_ROOT,
        ("merge-base", "--is-ancestor", authority_commit_sha, execution_commit_sha),
    )
    profile_bytes = _git_output(
        REPOSITORY_ROOT,
        ("show", f"{authority_commit_sha}:benchmarks/tts/profile-v6.json"),
    )
    if hashlib.sha256(profile_bytes).hexdigest() != PROFILE_V6_SHA256:
        _fail("authority")


def _result_execution_commit(
    raw: Mapping[str, object],
    current_commit_sha: str,
) -> str:
    execution_commit = _string(raw.get("commitSha"), "authority")
    if len(current_commit_sha) != 40:
        _fail("authority")
    _git_output(
        REPOSITORY_ROOT,
        ("merge-base", "--is-ancestor", execution_commit, current_commit_sha),
    )
    return execution_commit


def _benchmark_run(raw: Mapping[str, object]) -> BenchmarkRun:
    loads = tuple(
        LoadObservation(
            observation_index=_integer(item.get("observationIndex")),
            load_ns=_integer(item.get("loadNanoseconds")),
            cleanup_ns=_integer(item.get("cleanupNanoseconds")),
        )
        for item in (_mapping(value) for value in _sequence(raw.get("loadObservations")))
    )
    generations = tuple(
        GenerationObservation(
            case_id=_string(item.get("caseId")),
            phase=cast(Literal["warm", "sustained"], _string(item.get("phase"))),
            sample_count=_integer(item.get("sampleCount")),
            sample_rate_hz=_integer(item.get("sampleRateHz")),
            channels=_integer(item.get("channels")),
            sample_format=cast(SampleFormat, _string(item.get("sampleFormat"))),
            wall_ns=_integer(item.get("wallNanoseconds")),
            first_audio_ns=_integer(item.get("firstAudioNanoseconds")),
            time_to_fifteen_seconds_ns=(
                _integer(item.get("timeToFifteenSecondsNanoseconds"))
                if item.get("timeToFifteenSecondsNanoseconds") is not None
                else None
            ),
        )
        for item in (_mapping(value) for value in _sequence(raw.get("generationObservations")))
    )
    cancellations: list[CancellationObservation] = []
    for value in _sequence(raw.get("cancellationTrials")):
        item = _mapping(value)
        if item.get("status") != "pass":
            continue
        cancellations.append(
            CancellationObservation(
                trial_id=cast(CancellationTrialId, _string(item.get("trialId"))),
                stop_mode=cast(CancellationStopMode, _string(item.get("stopMode"))),
                stop_ns=_integer(item.get("stopNanoseconds")),
                cleanup_ns=_integer(item.get("cleanupNanoseconds")),
                stale_frames=_integer(item.get("staleFrames")),
                raw_session_removed=item.get("rawSessionRemoved") is True,
            )
        )
    memory_value = raw.get("memory")
    if not isinstance(memory_value, dict):
        _fail("memory")
    memory = _mapping(memory_value)
    return BenchmarkRun(
        candidate_id=PIPER_CPU_CANDIDATE_ID,
        role="compatibility",
        capabilities=AdapterCapabilities(
            candidate_id=PIPER_CPU_CANDIDATE_ID,
            streaming_granularity="sample-chunks",
            sample_format="float32",
            generation_cancellation="worker-termination",
        ),
        load_observations=loads,
        generation_observations=generations,
        cancellation_observations=tuple(cancellations),
        memory=MemoryObservation(
            ram_sampling_interval_milliseconds=_integer(
                memory.get("ramSamplingIntervalMilliseconds")
            ),
            process_vram_sampling_interval_milliseconds=None,
            vram_measurement_method="unavailable-cpu-role",
            peak_process_tree_ram_bytes=_integer(memory.get("peakProcessTreeRamBytes")),
            peak_process_vram_bytes=None,
            peak_framework_vram_bytes=None,
            peak_vram_bytes=None,
            gpu_provider_allocations=_integer(memory.get("gpuProviderAllocations")),
        ),
        failed_observations=len(_sequence(raw.get("failures"))),
    )


def _machine_gates(raw: Mapping[str, object], run: BenchmarkRun) -> tuple[str, ...]:
    failed: list[str] = []
    warm = tuple(item for item in run.generation_observations if item.phase == "warm")
    sustained = tuple(item for item in run.generation_observations if item.phase == "sustained")
    if (
        raw.get("status") != "complete"
        or len(run.load_observations) != 5
        or len(warm) != 16
        or not 8 <= len(sustained) <= 80
        or len(sustained) % 8
        or run.failed_observations != 0
    ):
        failed.append("observation-failure")
    if len(run.load_observations) == 5 and (
        distribution(tuple(item.load_ns / 1_000_000_000 for item in run.load_observations)).p95 > 30
    ):
        failed.append("cold-load")
    if len(warm) == 16:
        if distribution(tuple(item.first_audio_ns / 1_000_000_000 for item in warm)).p95 > 5:
            failed.append("first-audio")
        warm_rtfs = tuple(
            real_time_factor(item.wall_ns, item.sample_count, item.sample_rate_hz) for item in warm
        )
        if distribution(warm_rtfs).p95 > 1.1:
            failed.append("warm-rtf")
        fifteen = tuple(
            item.time_to_fifteen_seconds_ns / 1_000_000_000
            for item in warm
            if item.time_to_fifteen_seconds_ns is not None
        )
        shorter = tuple(
            item.wall_ns / 1_000_000_000 for item in warm if item.time_to_fifteen_seconds_ns is None
        )
        if fifteen and distribution(fifteen).p95 > 18:
            failed.append("fifteen-seconds-media")
        if shorter and distribution(shorter).p95 > 7:
            failed.append("shorter-complete")
    if sustained:
        sustained_rtfs = tuple(
            real_time_factor(item.wall_ns, item.sample_count, item.sample_rate_hz)
            for item in sustained
        )
        media_seconds = sum(
            media_duration_seconds(item.sample_count, item.sample_rate_hz) for item in sustained
        )
        wall_seconds = sum(item.wall_ns / 1_000_000_000 for item in sustained)
        if (
            media_seconds < 180
            or distribution(sustained_rtfs).p95 > 1.1
            or wall_seconds / media_seconds > 1.08
        ):
            failed.append("sustained-rtf")
    if run.memory.peak_process_tree_ram_bytes > 4 * 1024**3:
        failed.append("ram")
    if run.memory.gpu_provider_allocations != 0:
        failed.append("gpu-provider")
    if len(run.cancellation_observations) != 5 or any(
        item.stop_mode != "worker-termination"
        or item.stop_ns > 2_000_000_000
        or item.cleanup_ns > 5_000_000_000
        or item.stale_frames != 0
        or not item.raw_session_removed
        for item in run.cancellation_observations
    ):
        failed.append("cancellation")
    return tuple(dict.fromkeys(failed))


def assess_machine_result(
    request: PreflightRequest,
    receipt: PreflightReceipt,
    *,
    performance_session_id: str,
    authority_commit_sha: str,
) -> dict[str, object]:
    raw, _session = _load_raw(performance_session_id)
    execution_commit = _result_execution_commit(raw, request.expected_commit_sha)
    _verify_authority(
        raw,
        authority_commit_sha=authority_commit_sha,
        execution_commit_sha=execution_commit,
    )
    run = _benchmark_run(raw)
    failed = list(_machine_gates(raw, run))
    if receipt.failures:
        failed.extend(("offline", "artifact"))
    sustained = tuple(item for item in run.generation_observations if item.phase == "sustained")
    media_seconds = sum(
        media_duration_seconds(item.sample_count, item.sample_rate_hz) for item in sustained
    )
    wall_seconds = sum(item.wall_ns / 1_000_000_000 for item in sustained)
    failed = list(dict.fromkeys(failed))
    return {
        "status": "pass" if not failed else "fail",
        "candidateId": PIPER_CPU_CANDIDATE_ID,
        "qualityAdmitted": not failed,
        "failedGates": failed,
        "counts": {
            "coldLoads": len(run.load_observations),
            "warmGenerations": sum(item.phase == "warm" for item in run.generation_observations),
            "sustainedGenerations": len(sustained),
            "cancellationTrials": len(run.cancellation_observations),
        },
        "sustainedMediaSeconds": media_seconds,
        "totalSustainedRtf": wall_seconds / media_seconds if media_seconds > 0 else None,
        "peakProcessTreeRamBytes": run.memory.peak_process_tree_ram_bytes,
    }


def _load_quality(session_id: str) -> tuple[Mapping[str, object], Path]:
    session = _quality_session_path(session_id)
    try:
        metadata = _mapping(
            json.loads((session / "session.json").read_text(encoding="utf-8")),
            "quality",
        )
        aggregate = _mapping(
            json.loads((session / "quality.aggregate.json").read_text(encoding="utf-8")),
            "quality",
        )
    except (OSError, json.JSONDecodeError):
        _fail("quality")
    candidates = _mapping(aggregate.get("candidates"), "quality")
    quality = _mapping(candidates.get(PIPER_CPU_CANDIDATE_ID), "quality")
    if (
        metadata.get("protocolVersion") != "tts-cpu-fallback-profile-v6"
        or metadata.get("corpusVersion") != "tts-cpu-fallback-corpus-v6"
        or aggregate.get("eligibleForPromotion") is not True
        or quality.get("evaluatorCount") != 1
    ):
        _fail("quality")
    return quality, session


def _quality_gates(quality: Mapping[str, object]) -> tuple[str, ...]:
    dimensions = _mapping(quality.get("dimensions"), "quality")
    values = tuple(_number(value, "quality") for value in dimensions.values())
    failed: list[str] = []
    if (
        not values
        or _number(quality.get("overallMean"), "quality") < 3.25
        or _number(dimensions.get("intelligibility"), "quality") < 3.25
        or _number(dimensions.get("spanishPronunciation"), "quality") < 3.25
        or min(values) < 2.75
    ):
        failed.append("quality")
    if _integer(quality.get("meaningChangingDefects"), "quality") != 0:
        failed.append("meaning-changing-defect")
    return tuple(failed)


def _artifact_summaries(receipt: PreflightReceipt) -> tuple[ArtifactSummary, ...]:
    if len(receipt.artifacts) != 3:
        _fail("artifact")
    stable_ids = ("piper-model", "piper-config", "piper-model-card")
    return tuple(
        ArtifactSummary(
            artifact_id=artifact_id,
            revision="piper-voices-0d907f1",
            sha256=artifact.sha256,
            size_bytes=artifact.size_bytes,
        )
        for artifact_id, artifact in zip(stable_ids, receipt.artifacts, strict=True)
    )


def derive_result(
    request: PreflightRequest,
    receipt: PreflightReceipt,
    *,
    performance_session_id: str,
    quality_session_id: str,
    authority_commit_sha: str,
) -> dict[str, object]:
    """Validate, safely derive, clean private state, and write the v6 result."""

    if receipt.failures or not receipt.eligible_for_official_run:
        _fail("preflight")
    raw, performance_session = _load_raw(performance_session_id)
    execution_commit = _result_execution_commit(raw, request.expected_commit_sha)
    _verify_authority(
        raw,
        authority_commit_sha=authority_commit_sha,
        execution_commit_sha=execution_commit,
    )
    run = _benchmark_run(raw)
    failed = list(_machine_gates(raw, run))
    if failed:
        _fail("machine-gates")
    quality, quality_session = _load_quality(quality_session_id)
    failed.extend(_quality_gates(quality))
    authority = request.profile.authority
    if not isinstance(authority, CpuFallbackEvaluationAuthority):
        _fail("authority")
    metadata = SummaryMetadata(
        report_purpose="official-summary",
        protocol_version=authority.profile_version,
        corpus_version="tts-cpu-fallback-corpus-v6",
        candidate_manifest_version=authority.candidate_manifest_version,
        role="compatibility",
        commit_sha=execution_commit,
        operating_system="Windows",
        os_version=receipt.host.os_version,
        architecture="x86_64",
        python_version=receipt.host.python_version,
        cpu_model=receipt.host.cpu_model,
        logical_processors=receipt.host.logical_processors,
        total_ram_bytes=receipt.host.total_ram_bytes,
        gpu_model=receipt.host.gpu_model,
        driver_version=receipt.host.driver_version,
        engine_version=request.profile.engine_version,
        model_revision=request.profile.model_revision,
        voice_id=request.profile.voice_id,
        provider="onnxruntime-cpu",
        precision="float32",
        artifacts=_artifact_summaries(receipt),
        quality=quality,
        audits={
            "offline": {"status": "pass", "violations": 0},
            "privacy": {"status": "pass", "violations": 0},
            "artifacts": {"status": "pass", "violations": 0},
            "license": {"status": "pass", "reviewId": "piper-gpl3-cc0-v6"},
        },
        gate_evaluation={
            "outcome": "pass" if not failed else "fail",
            "failedGates": list(dict.fromkeys(failed)),
        },
        notes=(
            "mvp-single-maintainer-quality-screen",
            "native-sentence-complete-output",
            "mid-generation-cancellation-by-worker-termination",
            "gpl-separate-process-packaging-obligations-retained",
        ),
        evaluation_authority={
            "authorityCommitSha": authority_commit_sha,
            "executionCommitSha": execution_commit,
            "profileSha256": PROFILE_V6_SHA256,
            "corpusSha256": authority.corpus_sha256,
            "candidateLockSha256": PROFILE_V6_LOCK_SHA256,
            "configurationIdentitySha256": PROFILE_V6_CONFIGURATION_SHA256,
        },
    )
    summary = build_summary(run, metadata)
    schema = load_schema(SUMMARY_SCHEMA_PATH)
    corpus = load_corpus(CORPUS_PATH)
    payload, _markdown = promote_summary(
        summary,
        schema=schema,
        corpus=corpus,
        forbidden_values=tuple(
            value for case in corpus.cases.values() for value in (case.text, case.privacy_canary)
        ),
    )
    if RESULT_PATH.exists():
        _fail("result-exists")
    shutil.rmtree(performance_session)
    shutil.rmtree(quality_session)
    if performance_session.exists() or quality_session.exists():
        _fail("cleanup")
    try:
        RESULT_PATH.write_bytes(payload)
    except OSError:
        _fail("result-write")
    if RESULT_PATH.read_bytes() != canonical_summary_bytes(summary):
        _fail("result-write")
    return {
        "status": "pass",
        "candidateId": PIPER_CPU_CANDIDATE_ID,
        "outcome": "pass" if not failed else "fail",
        "failedGates": list(dict.fromkeys(failed)),
        "resultPath": "benchmarks/tts/cpu-fallback-result-v6.json",
        "privateSessionsRemoved": True,
    }
