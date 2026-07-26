"""Result-blind validation for the frozen short-segment batch authority."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Final, cast

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

PROFILE_RELATIVE_PATH: Final = Path("benchmarks/tts/profile-v4.json")
CORPUS_RELATIVE_PATH: Final = Path("benchmarks/tts/corpus-v4.json")
RAW_SCHEMA_RELATIVE_PATH: Final = Path(
    "benchmarks/tts/schemas/short-segment-batch-raw-v4.schema.json"
)
SUMMARY_SCHEMA_RELATIVE_PATH: Final = Path(
    "benchmarks/tts/schemas/short-segment-batch-summary-v4.schema.json"
)
PROFILE_SHA256: Final = "836895786f4cc041ce1b3818a5f74635cbc1edcd1e2a57f3ebddf84bd1ed3b68"
CORPUS_SHA256: Final = "3dcb30ab07bc5796175137f956ab7c910f306cd2f39fa6fe30d05deca1eccd8e"
RAW_SCHEMA_SHA256: Final = "c793be6d97523f866ea263960f13c981a693fca8e819966ec1b867cac9507f82"
SUMMARY_SCHEMA_SHA256: Final = "2abb279fad5bc9f65f85ce21a6e56c7e8ee61550b5a7c14592ad0826fc4f101a"
AUTHORITY_COMMIT_SHA: Final = "f6bccf78e83cf0bd519ea00ab4e4997927152275"
FULL_GPU_PROFILE_ID: Final = "qwen3-serena-v4-full-gpu"
CPU_PROFILE_ID: Final = "qwen3-serena-v4-speech-tokenizer-cpu"
MEMORY_STOP_CODES: Final = frozenset(
    {
        "vram-safety-ceiling",
        "vram-reserve-exhausted",
        "shared-gpu-memory",
        "cuda-out-of-memory",
    }
)
FORBIDDEN_RESULT_KEYS: Final = frozenset(
    {
        "sourceText",
        "narrationText",
        "privacyCanary",
        "generatedAudio",
        "waveformBytes",
        "modelPath",
        "userPath",
        "commandLine",
        "environmentValue",
        "exceptionMessage",
        "scorecard",
        "randomizationKey",
        "privateIdentity",
    }
)
type JsonSchema = bool | Mapping[str, Any]


class V4AuthorityError(ValueError):
    """A fixed, content-free v4 authority failure."""


@dataclass(frozen=True)
class FrozenV4Authority:
    profile: Mapping[str, object]
    corpus: Mapping[str, object]
    raw_schema: Mapping[str, object]
    summary_schema: Mapping[str, object]


def _fail(code: str) -> V4AuthorityError:
    return V4AuthorityError(f"tts-benchmark-v4-authority:{code}")


def _load_object(path: Path) -> Mapping[str, object]:
    try:
        value = cast(object, json.loads(path.read_text(encoding="utf-8")))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise _fail("invalid-json") from error
    if not isinstance(value, dict):
        raise _fail("invalid-object")
    return cast(Mapping[str, object], value)


def _sha256(path: Path) -> str:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError as error:
        raise _fail("unreadable-authority") from error


def _canonical_sha256(value: object) -> str:
    payload = json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode()
    return hashlib.sha256(payload).hexdigest()


def _mapping(value: object, code: str) -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise _fail(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str) -> Sequence[object]:
    if not isinstance(value, list):
        raise _fail(code)
    return cast(Sequence[object], value)


def _verify_file_hashes(repository_root: Path) -> None:
    expected = {
        PROFILE_RELATIVE_PATH: PROFILE_SHA256,
        CORPUS_RELATIVE_PATH: CORPUS_SHA256,
        RAW_SCHEMA_RELATIVE_PATH: RAW_SCHEMA_SHA256,
        SUMMARY_SCHEMA_RELATIVE_PATH: SUMMARY_SCHEMA_SHA256,
    }
    if any(_sha256(repository_root / path) != digest for path, digest in expected.items()):
        raise _fail("authority-drift")


def _verify_profile_authority(
    profile: Mapping[str, object],
    corpus: Mapping[str, object],
) -> None:
    if (
        profile.get("profileVersion") != "tts-short-segment-batch-profile-v4"
        or profile.get("status") != "frozen-before-v4-implementation-pilot-and-official-results"
        or profile.get("purpose") != "development-only-short-segment-shared-model-batch-feasibility"
    ):
        raise _fail("profile-identity")

    authorities = _mapping(profile.get("authorities"), "authority-links")
    expected_links = {
        "corpus": (CORPUS_RELATIVE_PATH.as_posix(), CORPUS_SHA256),
        "privateRawSchema": (RAW_SCHEMA_RELATIVE_PATH.as_posix(), RAW_SCHEMA_SHA256),
        "contentSafeSummarySchema": (
            SUMMARY_SCHEMA_RELATIVE_PATH.as_posix(),
            SUMMARY_SCHEMA_SHA256,
        ),
    }
    for name, (path, digest) in expected_links.items():
        link = _mapping(authorities.get(name), "authority-links")
        if link.get("path") != path or link.get("sha256") != digest:
            raise _fail("authority-links")

    candidate = _mapping(profile.get("candidate"), "candidate")
    placements = _sequence(profile.get("placementProfiles"), "placement-profiles")
    if len(placements) != 2:
        raise _fail("placement-profiles")
    expected_ids = (FULL_GPU_PROFILE_ID, CPU_PROFILE_ID)
    for raw_placement, expected_id in zip(placements, expected_ids, strict=True):
        placement = _mapping(raw_placement, "placement-profiles")
        if placement.get("profileId") != expected_id:
            raise _fail("placement-order")
        identity = {
            "candidate": candidate,
            "placement": {
                "profileId": placement.get("profileId"),
                "load": placement.get("load"),
                "requiredDeviceEvidence": placement.get("requiredDeviceEvidence"),
            },
        }
        if placement.get("configurationIdentitySha256") != _canonical_sha256(identity):
            raise _fail("placement-identity")

    memory = _mapping(profile.get("memorySafety"), "memory-safety")
    if (
        memory.get("preflightMinimumFreeVramBytes") != 8_174_698_496
        or memory.get("dedicatedVramReserveBytes") != 536_870_912
        or memory.get("maximumEngineeringPeakVramBytes") != 7_637_827_584
        or memory.get("maximumSharedGpuMemoryBytes") != 0
        or 8_174_698_496 - 536_870_912 != 7_637_827_584
    ):
        raise _fail("memory-safety")
    admission = _mapping(memory.get("conditionalCpuAdmission"), "cpu-admission")
    if (
        memory.get("evaluateBeforeConditionalCpuAdmission") is not True
        or admission.get("requiresFullGpuBatchTwoFirstAttemptStopCode") is not True
        or admission.get("performanceOnlyFailureDoesNotAdmit") is not True
        or admission.get("qualityFailureDoesNotAdmit") is not True
    ):
        raise _fail("cpu-admission")

    execution = _mapping(profile.get("executionPolicy"), "execution")
    counts = _mapping(
        execution.get("expectedMeasuredCountsPerPlacementProfile"),
        "execution-counts",
    )
    if (
        execution.get("batchSizes") != [1, 2]
        or execution.get("automaticRetries") != 0
        or execution.get("diagnosticRetries") != 0
        or execution.get("failureAccounting") != "first-attempt-is-authoritative"
        or counts
        != {
            "batchOneCalls": 24,
            "batchOneUnits": 24,
            "batchTwoCalls": 12,
            "batchTwoUnits": 24,
        }
    ):
        raise _fail("execution-counts")

    input_authority = _mapping(profile.get("inputAuthority"), "input-authority")
    unit_order = _sequence(input_authority.get("unitOrder"), "unit-order")
    pair_order = _sequence(input_authority.get("pairOrder"), "pair-order")
    flattened_pairs = [
        unit_id for raw_pair in pair_order for unit_id in _sequence(raw_pair, "pair-order")
    ]
    if (
        flattened_pairs != list(unit_order)
        or input_authority.get("observedAudioMayChangeCorpusOrPairing") is not False
        or input_authority.get("candidateSpecificTextRewriting") != "forbidden"
    ):
        raise _fail("pair-order")

    standard = _mapping(profile.get("standardBalancedGates"), "standard-gates")
    scheduling = _mapping(
        profile.get("schedulingSustainabilityGates"),
        "scheduling-gates",
    )
    conclusions = _mapping(profile.get("conclusionPolicy"), "conclusion-policy")
    if (
        standard.get("maximumWarmFirstAudioP95Seconds") != 3
        or standard.get("maximumWarmFifteenSecondsMediaP95Seconds") != 12
        or standard.get("maximumSustainedRequestRtfP95") != 0.8
        or scheduling.get("maximumAggregateBatchRtfExclusive") != 1
        or scheduling.get("maximumBufferingSecondsPerMediaMinute") != 5
        or standard.get("allGatesAreConjunctive") is not True
        or scheduling.get("allGatesAreConjunctive") is not True
        or conclusions.get("retryCannotRescueFailedGate") is not True
        or conclusions.get("qualityCannotRescueMachineFailure") is not True
        or conclusions.get("conditionalCpuCannotRescueOrAlterFullGpuConclusion") is not True
        or conclusions.get("v3DecisionRemainsImmutable") is not True
    ):
        raise _fail("conclusion-policy")

    if corpus.get("corpusVersion") != "tts-short-segment-corpus-v4":
        raise _fail("corpus-identity")


def _verify_corpus(corpus: Mapping[str, object]) -> None:
    units = _sequence(corpus.get("units"), "corpus-units")
    unit_order = _sequence(corpus.get("unitOrder"), "corpus-unit-order")
    pairs = _sequence(corpus.get("pairOrder"), "corpus-pairs")
    if len(units) != 8 or len(pairs) != 4:
        raise _fail("corpus-count")

    observed_order: list[object] = []
    canaries: set[str] = set()
    for index, raw_unit in enumerate(units):
        unit = _mapping(raw_unit, "corpus-unit")
        observed_order.append(unit.get("unitId"))
        source = unit.get("sourceText")
        narration = unit.get("narrationText")
        canary = unit.get("privacyCanary")
        if (
            unit.get("sequence") != index
            or not isinstance(source, str)
            or not isinstance(narration, str)
            or not isinstance(canary, str)
            or not source
            or not narration
        ):
            raise _fail("corpus-unit")
        if (
            unit.get("sourceCodePointCount") != len(source)
            or unit.get("sourceUtf8ByteCount") != len(source.encode())
            or unit.get("narrationCodePointCount") != len(narration)
            or unit.get("narrationUtf8ByteCount") != len(narration.encode())
            or len(narration) > 640
            or len(narration.encode()) > 2048
        ):
            raise _fail("corpus-arithmetic")
        canaries.add(canary)
    if observed_order != list(unit_order) or len(canaries) != len(units):
        raise _fail("corpus-order")

    flattened: list[object] = []
    for raw_pair in pairs:
        pair = _mapping(raw_pair, "corpus-pair")
        pair_units = _sequence(pair.get("unitIds"), "corpus-pair")
        if len(pair_units) != 2:
            raise _fail("corpus-pair")
        flattened.extend(pair_units)
    if flattened != list(unit_order):
        raise _fail("corpus-pair")


def load_frozen_v4_authority(repository_root: Path) -> FrozenV4Authority:
    """Load the exact byte-frozen v4 authority or fail with a fixed code."""

    _verify_file_hashes(repository_root)
    profile = _load_object(repository_root / PROFILE_RELATIVE_PATH)
    corpus = _load_object(repository_root / CORPUS_RELATIVE_PATH)
    raw_schema = _load_object(repository_root / RAW_SCHEMA_RELATIVE_PATH)
    summary_schema = _load_object(repository_root / SUMMARY_SCHEMA_RELATIVE_PATH)
    try:
        Draft202012Validator.check_schema(raw_schema)
        Draft202012Validator.check_schema(summary_schema)
    except Exception as error:
        raise _fail("invalid-schema") from error
    _verify_profile_authority(profile, corpus)
    _verify_corpus(corpus)
    return FrozenV4Authority(profile, corpus, raw_schema, summary_schema)


def _reject_private_content(value: object, corpus: Mapping[str, object]) -> None:
    forbidden_values: list[str] = []
    for raw_unit in _sequence(corpus.get("units"), "corpus-units"):
        unit = _mapping(raw_unit, "corpus-unit")
        forbidden_values.extend(
            cast(str, unit[name]) for name in ("sourceText", "narrationText", "privacyCanary")
        )

    def visit(item: object) -> None:
        if isinstance(item, dict):
            for key, nested in cast(Mapping[object, object], item).items():
                if key in FORBIDDEN_RESULT_KEYS:
                    raise _fail("private-content")
                visit(nested)
        elif isinstance(item, list):
            for nested in cast(Sequence[object], item):
                visit(nested)
        elif isinstance(item, str) and any(
            forbidden and forbidden in item for forbidden in forbidden_values
        ):
            raise _fail("private-content")

    visit(value)


def _schema_registry(authority: FrozenV4Authority) -> Registry[JsonSchema]:
    registry: Registry[JsonSchema] = Registry()
    for schema in (authority.raw_schema, authority.summary_schema):
        identifier = cast(str, schema["$id"])
        resource = cast(
            Resource[JsonSchema],
            Resource.from_contents(cast(Mapping[str, Any], schema)),
        )
        registry = registry.with_resource(identifier, resource)
    return registry


def _verify_cpu_admission(result: Mapping[str, object]) -> None:
    placement_id = result.get("placementProfileId")
    admission = _mapping(result.get("cpuAdmission"), "cpu-admission-result")
    if placement_id == FULL_GPU_PROFILE_ID:
        if admission != {
            "status": "not-applicable",
            "fullGpuMemoryStopCode": None,
            "fullGpuResultSha256": None,
        }:
            raise _fail("unapproved-cpu-placement")
        return
    if placement_id != CPU_PROFILE_ID:
        raise _fail("placement-result")
    if (
        admission.get("status") != "admitted"
        or admission.get("fullGpuMemoryStopCode") not in MEMORY_STOP_CODES
        or not isinstance(admission.get("fullGpuResultSha256"), str)
    ):
        raise _fail("unapproved-cpu-placement")


def _expected_measured_calls(authority: FrozenV4Authority) -> list[tuple[int, list[str]]]:
    profile = authority.profile
    execution = _mapping(profile.get("executionPolicy"), "execution")
    input_authority = _mapping(profile.get("inputAuthority"), "input-authority")
    pairs = [
        cast(list[str], pair) for pair in _sequence(input_authority.get("pairOrder"), "pair-order")
    ]
    pass_orders = cast(
        list[list[int]],
        _sequence(execution.get("passBatchOrder"), "pass-batch-order"),
    )
    expected: list[tuple[int, list[str]]] = []
    for batch_order in pass_orders:
        for batch_size in batch_order:
            for pair in pairs:
                if batch_size == 1:
                    expected.extend((1, [unit_id]) for unit_id in pair)
                else:
                    expected.append((2, pair))
    return expected


def _verify_raw_order(
    result: Mapping[str, object],
    authority: FrozenV4Authority,
) -> None:
    calls = [_mapping(call, "raw-call") for call in _sequence(result.get("calls"), "raw-calls")]
    warmups = [call for call in calls if call.get("phase") == "warmup"]
    if [
        (call.get("batchSize"), list(_sequence(call.get("unitIds"), "raw-unit-ids")))
        for call in warmups
    ] != [
        (1, ["es-v4-arrival"]),
        (1, ["es-v4-dialogue"]),
        (2, ["es-v4-arrival", "es-v4-dialogue"]),
    ]:
        raise _fail("warmup-order")
    measured = [call for call in calls if call.get("phase") == "measured"]
    actual = [
        (
            call.get("batchSize"),
            list(_sequence(call.get("unitIds"), "raw-unit-ids")),
        )
        for call in measured
    ]
    if actual != _expected_measured_calls(authority):
        raise _fail("missing-or-reordered-pairs")
    if any(call.get("attempt") != 1 for call in measured):
        raise _fail("first-attempt")
    trials = [
        _mapping(trial, "cancellation-trial")
        for trial in _sequence(result.get("cancellationTrials"), "cancellation-trials")
    ]
    if [trial.get("trialId") for trial in trials] != [
        "before-dispatch",
        "accepted-before-audio",
        "during-batch-generation",
        "after-complete-before-publication",
        "after-first-unit-publication",
    ]:
        raise _fail("cancellation-order")

    units_by_call: dict[int, list[Mapping[str, object]]] = {}
    for raw_unit in _sequence(result.get("units"), "raw-units"):
        unit = _mapping(raw_unit, "raw-unit")
        call_index = unit.get("callIndex")
        if not isinstance(call_index, int):
            raise _fail("raw-unit")
        units_by_call.setdefault(call_index, []).append(unit)
    unit_order = cast(
        list[str],
        _sequence(
            _mapping(authority.profile.get("inputAuthority"), "input-authority").get("unitOrder"),
            "unit-order",
        ),
    )
    measured_call_indexes: set[int] = set()
    for call in measured:
        call_index = call.get("callIndex")
        if not isinstance(call_index, int):
            raise _fail("raw-call")
        measured_call_indexes.add(call_index)
        expected_unit_ids = list(_sequence(call.get("unitIds"), "raw-unit-ids"))
        observed_units = units_by_call.get(call_index, [])
        observed_unit_ids = [unit.get("unitId") for unit in observed_units]
        if observed_unit_ids != expected_unit_ids:
            raise _fail("missing-or-reordered-units")
        for position, unit in enumerate(observed_units):
            unit_id = cast(str, unit["unitId"])
            if unit.get("batchPosition") != position or unit.get(
                "sourceSequence"
            ) != unit_order.index(unit_id):
                raise _fail("missing-or-reordered-units")
    if any(
        call_index in measured_call_indexes and not units
        for call_index, units in units_by_call.items()
    ):
        raise _fail("missing-or-reordered-units")


def _conclusion_passed(value: object) -> bool:
    conclusion = _mapping(value, "conclusion")
    outcome = conclusion.get("outcome")
    all_passed = conclusion.get("allRequiredGatesPassed")
    failed = _sequence(conclusion.get("failedGateCodes"), "failed-gate-codes")
    if outcome == "pass":
        if all_passed is not True or failed:
            raise _fail("conclusion-consistency")
        return True
    if outcome == "fail":
        if all_passed is not False or not failed:
            raise _fail("conclusion-consistency")
        return False
    if outcome == "not-evaluated":
        if all_passed is not False or failed:
            raise _fail("conclusion-consistency")
        return False
    raise _fail("conclusion-consistency")


def _number(value: object, code: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise _fail(code)
    return float(value)


def _verify_summary_conclusions(result: Mapping[str, object]) -> None:
    counts = _mapping(result.get("counts"), "summary-counts")
    aggregates = _mapping(result.get("aggregates"), "summary-aggregates")
    memory = _mapping(result.get("memory"), "summary-memory")
    cancellation = _mapping(result.get("cancellation"), "summary-cancellation")
    playback = _mapping(result.get("playback"), "summary-playback")
    audits = _mapping(result.get("audits"), "summary-audits")
    conclusions = _mapping(result.get("conclusions"), "summary-conclusions")
    standard_passed = _conclusion_passed(conclusions.get("standardViability"))
    scheduling_passed = _conclusion_passed(conclusions.get("schedulingSustainability"))
    demo_passed = _conclusion_passed(conclusions.get("constrainedDemoUsefulness"))
    all_audits = all(value is True for value in audits.values())

    if standard_passed:
        fifteen_seconds = aggregates.get("batchTwoFifteenSecondsMediaP95Seconds")
        shorter_complete = aggregates.get("batchTwoShorterCompleteP95Seconds")
        latency_shape_passed = (
            fifteen_seconds is not None and _number(fifteen_seconds, "standard-gates") <= 12
        ) or (shorter_complete is not None and _number(shorter_complete, "standard-gates") <= 5)
        if not (
            _number(aggregates.get("coldLoadP95Seconds"), "standard-gates") <= 60
            and _number(aggregates.get("batchTwoFirstAudioP95Seconds"), "standard-gates") <= 3
            and latency_shape_passed
            and _number(aggregates.get("batchTwoUnitRtfP95"), "standard-gates") <= 0.8
            and _number(aggregates.get("batchTwoAggregateRtf"), "standard-gates") <= 0.75
            and _number(memory.get("peakProcessTreeRamBytes"), "standard-gates") <= 12_884_901_888
            and _number(memory.get("peakAuthoritativeVramBytes"), "standard-gates") <= 6_442_450_944
            and counts.get("failedOrTimedOutFirstAttempts") == 0
            and cancellation.get("passedTrialCount") == 5
            and all_audits
        ):
            raise _fail("standard-conclusion")

    if scheduling_passed and not (
        _number(aggregates.get("batchTwoAggregateRtf"), "scheduling-gates") < 1
        and _number(playback.get("bufferingSecondsPerMinute"), "scheduling-gates") <= 5
        and _number(aggregates.get("batchTwoMediaSeconds"), "scheduling-gates") >= 180
        and _number(aggregates.get("minimumUnitDurationSeconds"), "scheduling-gates") >= 8
        and _number(aggregates.get("maximumUnitDurationSeconds"), "scheduling-gates") <= 20
        and aggregates.get("reorderedUnitCount") == 0
        and aggregates.get("missingPairCount") == 0
        and counts.get("failedOrTimedOutFirstAttempts") == 0
        and cancellation.get("passedTrialCount") == 5
        and memory.get("memoryStopTriggered") is False
        and all_audits
    ):
        raise _fail("scheduling-conclusion")

    if demo_passed:
        quality = _mapping(result.get("quality"), "summary-quality")
        scores = (
            quality.get("overallMean"),
            quality.get("intelligibilityMean"),
            quality.get("numberAndSymbolMean"),
            quality.get("joinBoundaryMean"),
            quality.get("prosodyMean"),
            quality.get("accentMean"),
        )
        if not (
            scheduling_passed
            and quality.get("status") == "completed"
            and quality.get("evaluatorCount") == 1
            and all(score is not None for score in scores)
            and _number(scores[0], "quality-gates") >= 3.5
            and _number(scores[1], "quality-gates") >= 3.5
            and _number(scores[2], "quality-gates") >= 3.5
            and all(_number(score, "quality-gates") >= 3 for score in scores[3:])
            and quality.get("meaningChangingDefects") == 0
        ):
            raise _fail("demo-conclusion")


def _git_is_strict_ancestor(
    repository_root: Path,
    authority_commit: str,
    execution_commit: str,
) -> bool:
    try:
        completed = subprocess.run(
            [
                "git",
                "merge-base",
                "--is-ancestor",
                authority_commit,
                execution_commit,
            ],
            cwd=repository_root,
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            timeout=5,
            check=False,
        )
    except (OSError, subprocess.SubprocessError):
        return False
    return completed.returncode == 0 and authority_commit != execution_commit


def validate_v4_result(
    repository_root: Path,
    value: object,
    *,
    summary: bool,
    ancestry_checker: Callable[[str, str], bool] | None = None,
) -> None:
    """Validate one v4 raw journal or safe summary without loading a model."""

    authority = load_frozen_v4_authority(repository_root)
    if not isinstance(value, dict):
        raise _fail("result-object")
    result = cast(Mapping[str, object], value)
    _reject_private_content(result, authority.corpus)
    schema = authority.summary_schema if summary else authority.raw_schema
    errors = tuple(
        Draft202012Validator(schema, registry=_schema_registry(authority)).iter_errors(result)
    )
    if errors:
        raise _fail("result-schema")
    authority_commit = result.get("authorityCommitSha")
    execution_commit = result.get("executionCommitSha")
    if (
        result.get("profileSha256") != PROFILE_SHA256
        or result.get("corpusSha256") != CORPUS_SHA256
        or authority_commit != AUTHORITY_COMMIT_SHA
        or not isinstance(execution_commit, str)
        or authority_commit == execution_commit
    ):
        raise _fail("result-before-authority")
    check_ancestry = ancestry_checker or (
        lambda authority, execution: _git_is_strict_ancestor(
            repository_root,
            authority,
            execution,
        )
    )
    if not check_ancestry(AUTHORITY_COMMIT_SHA, execution_commit):
        raise _fail("result-before-authority")
    _verify_cpu_admission(result)
    if summary:
        _verify_summary_conclusions(result)
    else:
        _verify_raw_order(result, authority)
