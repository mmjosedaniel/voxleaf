"""Result-blind validation for the frozen independent dual-worker v5 authority."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Final, cast

PROFILE_RELATIVE_PATH: Final = Path("benchmarks/tts/profile-v5.json")
CORPUS_RELATIVE_PATH: Final = Path("benchmarks/tts/corpus-v5.json")
BASE_CORPUS_RELATIVE_PATH: Final = Path("benchmarks/tts/corpus-v4.json")
RAW_SCHEMA_RELATIVE_PATH: Final = Path("benchmarks/tts/schemas/dual-worker-raw-v5.schema.json")
SUMMARY_SCHEMA_RELATIVE_PATH: Final = Path(
    "benchmarks/tts/schemas/dual-worker-summary-v5.schema.json"
)
PROFILE_SHA256: Final = "e6fca19592c4e0d074bbb13e35d624be588c94408da512bba9b819b560750fd5"
CORPUS_SHA256: Final = "e92a7700c9e264e75562fe4d4856fdefdea23e8b9494ab89f33c22fb8b6de9a6"
BASE_CORPUS_SHA256: Final = "3dcb30ab07bc5796175137f956ab7c910f306cd2f39fa6fe30d05deca1eccd8e"
RAW_SCHEMA_SHA256: Final = "01b234f27f1d34d31e05c1d36f1c08b52412863030a22a8104773020b4e45775"
SUMMARY_SCHEMA_SHA256: Final = "917860b2a577067fce4d9089c34fb6aceb938c4c882e1f94563a7d6d831359a9"
GPU_PROFILE_ID: Final = "qwen3-serena-v5-gpu-primary"
CPU_PROFILE_ID: Final = "qwen3-serena-v5-cpu-support"
ARMS: Final = ("cpu-solo", "gpu-solo", "concurrent")
RESULT_RELATIVE_PATHS: Final = {
    "cpu-solo": Path("benchmarks/tts/dual-worker-result-v5-cpu-solo.json"),
    "gpu-solo": Path("benchmarks/tts/dual-worker-result-v5-gpu-solo.json"),
    "concurrent": Path("benchmarks/tts/dual-worker-result-v5-concurrent.json"),
}
BASE_UNIT_ORDER: Final = (
    "es-v4-arrival",
    "es-v4-dialogue",
    "es-v4-numbers",
    "es-v4-date-time",
    "es-v4-temperature",
    "es-v4-foreign-name",
    "es-v4-route",
    "es-v4-closing",
)
EXPECTED_UNITS: Final = {"cpu-solo": 8, "gpu-solo": 40, "concurrent": 40}
EXPECTED_PASSES: Final = {"cpu-solo": 1, "gpu-solo": 5, "concurrent": 5}
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


class V5AuthorityError(ValueError):
    """A fixed, content-free v5 authority failure."""


@dataclass(frozen=True)
class FrozenV5Authority:
    profile: Mapping[str, object]
    corpus: Mapping[str, object]
    base_corpus: Mapping[str, object]
    raw_schema: Mapping[str, object]
    summary_schema: Mapping[str, object]


def _fail(code: str) -> V5AuthorityError:
    return V5AuthorityError(f"tts-benchmark-v5-authority:{code}")


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


def _number(value: object, code: str) -> float:
    if not isinstance(value, int | float) or isinstance(value, bool):
        raise _fail(code)
    return float(value)


def _verify_file_hashes(repository_root: Path) -> None:
    expected = {
        PROFILE_RELATIVE_PATH: PROFILE_SHA256,
        CORPUS_RELATIVE_PATH: CORPUS_SHA256,
        BASE_CORPUS_RELATIVE_PATH: BASE_CORPUS_SHA256,
        RAW_SCHEMA_RELATIVE_PATH: RAW_SCHEMA_SHA256,
        SUMMARY_SCHEMA_RELATIVE_PATH: SUMMARY_SCHEMA_SHA256,
    }
    if any(_sha256(repository_root / path) != digest for path, digest in expected.items()):
        raise _fail("authority-drift")


def _verify_authority_links(profile: Mapping[str, object]) -> None:
    authorities = _mapping(profile.get("authorities"), "authority-links")
    expected = {
        "v4Selection": (
            "benchmarks/tts/selection-v4.md",
            "ea113c286732f6151c8ed9c0664a941ba39dc26f8a8b632cd4f68549228648b6",
        ),
        "v4FullGpuResult": (
            "benchmarks/tts/short-segment-batch-result-v4.json",
            "9ce8141fa5987878ab29bf472f6f16dc3a6370dd4ffcc1141b30964914c62e32",
        ),
        "v4TargetedCpuResult": (
            "benchmarks/tts/short-segment-batch-result-v4-cpu.json",
            "d3766ae87bdebc806210d04d974081b6f79f976bf9793a184c4d021273f85234",
        ),
        "corpus": (CORPUS_RELATIVE_PATH.as_posix(), CORPUS_SHA256),
        "privateRawSchema": (RAW_SCHEMA_RELATIVE_PATH.as_posix(), RAW_SCHEMA_SHA256),
        "contentSafeSummarySchema": (
            SUMMARY_SCHEMA_RELATIVE_PATH.as_posix(),
            SUMMARY_SCHEMA_SHA256,
        ),
    }
    for name, (path, digest) in expected.items():
        link = _mapping(authorities.get(name), "authority-links")
        if link.get("path") != path or link.get("sha256") != digest:
            raise _fail("authority-links")


def _worker_identity(
    candidate: Mapping[str, object],
    worker: Mapping[str, object],
) -> Mapping[str, object]:
    identity: dict[str, object] = {
        "candidate": candidate,
        "worker": {
            "workerProfileId": worker.get("workerProfileId"),
            "candidateId": worker.get("candidateId"),
            "role": worker.get("role"),
            "load": worker.get("load"),
            "threadPolicy": worker.get("threadPolicy"),
            "requiredDeviceEvidence": worker.get("requiredDeviceEvidence"),
        },
    }
    environment = worker.get("processEnvironmentBeforeTorchImport")
    if environment is not None:
        cast(dict[str, object], identity["worker"])["processEnvironmentBeforeTorchImport"] = (
            environment
        )
    return identity


def _verify_workers(profile: Mapping[str, object]) -> None:
    candidate = _mapping(profile.get("candidate"), "candidate")
    workers = _sequence(profile.get("workerProfiles"), "worker-profiles")
    if len(workers) != 2:
        raise _fail("worker-profiles")
    expected = (
        (
            GPU_PROFILE_ID,
            "gpu-primary",
            "cuda:0",
            "bfloat16",
            4,
            "3de7bfdf05e3d99fefa8f29cc4e92e755e5e85aa8adcc862278a757443c7b7d0",
        ),
        (
            CPU_PROFILE_ID,
            "cpu-support",
            "cpu",
            "float32",
            12,
            "14331a9943b63c1cb1e1aeff3f654e7c07ac73da829a60e9d38aa83762897a72",
        ),
    )
    for raw_worker, values in zip(workers, expected, strict=True):
        worker = _mapping(raw_worker, "worker-profiles")
        profile_id, role, device, dtype, threads, identity_sha = values
        load = _mapping(worker.get("load"), "worker-load")
        policy = _mapping(worker.get("threadPolicy"), "worker-threads")
        if (
            worker.get("workerProfileId") != profile_id
            or worker.get("role") != role
            or load.get("deviceMap") != device
            or load.get("dtype") != dtype
            or load.get("offloadDirectory") is not None
            or policy.get("intraOpThreads") != threads
            or policy.get("interopThreads") != 1
            or policy.get("processAffinity") != "os-default"
            or worker.get("configurationIdentitySha256") != identity_sha
            or _canonical_sha256(_worker_identity(candidate, worker)) != identity_sha
        ):
            raise _fail("worker-identity")

    cpu = _mapping(workers[1], "cpu-worker")
    environment = _mapping(
        cpu.get("processEnvironmentBeforeTorchImport"),
        "cpu-environment",
    )
    evidence = _mapping(cpu.get("requiredDeviceEvidence"), "cpu-device-evidence")
    if (
        environment != {"CUDA_VISIBLE_DEVICES": "-1"}
        or evidence.get("allModelParameters") != "cpu"
        or evidence.get("cudaAvailable") is not False
        or evidence.get("cudaDeviceCount") != 0
        or evidence.get("processDedicatedGpuBytes") != 0
        or evidence.get("processSharedGpuBytes") != 0
        or evidence.get("diskOrMetaParameters") != 0
        or evidence.get("implicitFallback") is not False
    ):
        raise _fail("cpu-zero-gpu-policy")


def _verify_execution_and_gates(profile: Mapping[str, object]) -> None:
    execution = _mapping(profile.get("executionPolicy"), "execution")
    counts = _mapping(execution.get("expectedMeasuredCounts"), "execution-counts")
    dispatch = _mapping(execution.get("dispatchPolicy"), "dispatch-policy")
    if (
        execution.get("officialArmOrder") != list(ARMS)
        or execution.get("automaticRetries") != 0
        or execution.get("diagnosticRetries") != 0
        or execution.get("duplicateGeneration") != "forbidden"
        or execution.get("failureAccounting") != "first-attempt-is-authoritative"
        or dispatch.get("maximumActiveUnitsPerWorker") != 1
        or dispatch.get("simultaneousWorkerAvailabilityTieBreak") != "gpu-primary"
        or dispatch.get("duplicateGpuRescueOfCpuWork") != "forbidden"
    ):
        raise _fail("execution-policy")
    expected_counts = {
        "cpu-solo": (1, 8),
        "gpu-solo": (5, 40),
        "concurrent": (5, 40),
    }
    for arm, (passes, units) in expected_counts.items():
        arm_counts = _mapping(counts.get(arm.replace("-", "").replace("solo", "Solo")), "counts")
        if arm == "concurrent":
            arm_counts = _mapping(counts.get("concurrent"), "counts")
        if arm_counts.get("passes") != passes or arm_counts.get("units") != units:
            raise _fail("execution-counts")

    cpu_gates = _mapping(profile.get("cpuSoloAdmissionGates"), "cpu-gates")
    gpu_gates = _mapping(profile.get("gpuSoloBaselineGates"), "gpu-gates")
    concurrent = _mapping(profile.get("concurrentSustainabilityGates"), "concurrent-gates")
    preferred = _mapping(profile.get("preferredStandardMargin"), "preferred-margin")
    if (
        cpu_gates.get("maximumTotalSustainedRtf") != 3.2
        or cpu_gates.get("requiredZeroDedicatedAndSharedGpuMemory") is not True
        or cpu_gates.get("passingCpuSoloIsOnlyConcurrentAdmission") is not True
        or gpu_gates.get("validBaselineRequiredBeforeConcurrentArm") is not True
        or concurrent.get("maximumAggregateRtfExclusive") != 1
        or concurrent.get("maximumGpuSlowdownFractionInclusive") != 0.25
        or concurrent.get("concurrentAggregateRtfMustBeLessThanGpuSolo") is not True
        or preferred.get("maximumAggregateRtfInclusive") != 0.8
    ):
        raise _fail("gates")

    playback = _mapping(profile.get("playbackSimulation"), "playback-policy")
    reservation = _mapping(
        playback.get("activeUnitReservation"),
        "playback-reservation",
    )
    if (
        playback.get("startWhenContiguousPlayableSecondsAtLeast") != 15
        or playback.get("maximumPlayableBufferSeconds") != 300
        or playback.get("maximumQueuedCompleteUnits") != 40
        or playback.get("maximumBufferedPcmBytes") != 28_800_000
        or playback.get("maximumActiveUnits") != 2
        or reservation.get("durationSecondsPerActiveUnit") != 20
        or reservation.get("pcmBytesPerActiveUnit") != 1_920_000
        or reservation.get("reserveBeforeDispatchAgainstDurationAndByteCeilings") is not True
        or playback.get("slowerThanPlaybackCannotPassByUsingLargerBuffer") is not True
    ):
        raise _fail("playback-policy")

    memory = _mapping(profile.get("memorySafety"), "memory-safety")
    cpu_memory = _mapping(memory.get("cpuWorker"), "cpu-memory")
    if (
        memory.get("minimumObservedSystemAvailableRamBytes") != 4_294_967_296
        or memory.get("minimumObservedSystemCommitHeadroomBytes") != 4_294_967_296
        or memory.get("maximumCombinedProcessTreeRamBytes") != 21_474_836_480
        or cpu_memory.get("maximumDedicatedGpuMemoryBytes") != 0
        or cpu_memory.get("maximumSharedGpuMemoryBytes") != 0
    ):
        raise _fail("memory-safety")

    conclusions = _mapping(profile.get("conclusionPolicy"), "conclusion-policy")
    if (
        conclusions.get("largerBufferCannotRescueAggregateRtfAtOrAboveOne") is not True
        or conclusions.get("unchangedStandardProductionViability")
        != "always-fail-with-inherited-v3-standard-failure"
        or conclusions.get("productionProfileSelectionAuthorized") is not False
        or conclusions.get("v3AndV4DecisionsRemainImmutable") is not True
    ):
        raise _fail("conclusion-policy")


def _verify_corpus(
    corpus: Mapping[str, object],
    base_corpus: Mapping[str, object],
) -> None:
    if (
        corpus.get("corpusVersion") != "tts-dual-worker-corpus-v5"
        or corpus.get("status") != "frozen-before-v5-implementation-pilot-and-official-results"
    ):
        raise _fail("corpus-identity")
    base = _mapping(corpus.get("baseCorpus"), "base-corpus")
    if (
        base.get("path") != BASE_CORPUS_RELATIVE_PATH.as_posix()
        or base.get("sha256") != BASE_CORPUS_SHA256
        or base.get("engineInputField") != "narrationText"
        or base.get("candidateSpecificTextRewriting") != "forbidden"
    ):
        raise _fail("base-corpus")
    unit_order = tuple(_sequence(corpus.get("baseUnitOrder"), "unit-order"))
    if unit_order != BASE_UNIT_ORDER:
        raise _fail("unit-order")
    base_units = _sequence(base_corpus.get("units"), "base-units")
    if tuple(_mapping(unit, "base-unit").get("unitId") for unit in base_units) != BASE_UNIT_ORDER:
        raise _fail("base-unit-order")
    schedules = _mapping(corpus.get("officialSchedules"), "schedules")
    for key, passes in (("cpuSolo", 1), ("gpuSolo", 5), ("concurrent", 5)):
        schedule = _mapping(schedules.get(key), "schedule")
        if schedule.get("measuredPasses") != passes or schedule.get("unitCount") != passes * len(
            BASE_UNIT_ORDER
        ):
            raise _fail("schedule")
    duration = _mapping(corpus.get("durationPolicy"), "duration-policy")
    if (
        duration.get("targetMinimumSeconds") != 8
        or duration.get("targetMaximumSeconds") != 16
        or duration.get("hardMinimumSecondsExclusive") != 0
        or duration.get("hardMaximumSecondsInclusive") != 20
        or duration.get("observedDurationMayChangeOfficialInput") is not False
    ):
        raise _fail("duration-policy")


def load_frozen_v5_authority(repository_root: Path) -> FrozenV5Authority:
    """Load the exact byte-frozen v5 authority without importing a candidate."""

    from jsonschema import Draft202012Validator

    _verify_file_hashes(repository_root)
    profile = _load_object(repository_root / PROFILE_RELATIVE_PATH)
    corpus = _load_object(repository_root / CORPUS_RELATIVE_PATH)
    base_corpus = _load_object(repository_root / BASE_CORPUS_RELATIVE_PATH)
    raw_schema = _load_object(repository_root / RAW_SCHEMA_RELATIVE_PATH)
    summary_schema = _load_object(repository_root / SUMMARY_SCHEMA_RELATIVE_PATH)
    if (
        profile.get("profileVersion") != "tts-dual-worker-profile-v5"
        or profile.get("status") != "frozen-before-v5-implementation-pilot-and-official-results"
        or profile.get("purpose")
        != "development-only-independent-gpu-primary-cpu-support-feasibility"
    ):
        raise _fail("profile-identity")
    _verify_authority_links(profile)
    _verify_workers(profile)
    _verify_execution_and_gates(profile)
    _verify_corpus(corpus, base_corpus)
    for schema in (raw_schema, summary_schema):
        try:
            Draft202012Validator.check_schema(cast(JsonSchema, schema))
        except Exception as error:
            raise _fail("invalid-schema") from error
    return FrozenV5Authority(profile, corpus, base_corpus, raw_schema, summary_schema)


def assert_no_v5_official_results(repository_root: Path) -> None:
    """Reject result-before-authority at the pre-result freeze checkpoint."""

    existing = [
        path for path in RESULT_RELATIVE_PATHS.values() if (repository_root / path).exists()
    ]
    if existing:
        raise _fail("result-before-authority")


def _expected_occurrences(arm: str) -> list[tuple[str, str, int, int]]:
    prefix = {"cpu-solo": "cpu", "gpu-solo": "gpu", "concurrent": "concurrent"}[arm]
    return [
        (
            f"v5-{prefix}-p{pass_index:02d}-{unit_id}",
            unit_id,
            source_sequence,
            pass_index,
        )
        for pass_index in range(1, EXPECTED_PASSES[arm] + 1)
        for source_sequence, unit_id in enumerate(
            BASE_UNIT_ORDER,
            start=(pass_index - 1) * len(BASE_UNIT_ORDER),
        )
    ]


def _verify_no_private_content(value: object, authority: FrozenV5Authority) -> None:
    serialized = json.dumps(value, ensure_ascii=False, sort_keys=True)
    canaries = {
        cast(str, _mapping(unit, "base-unit").get("privacyCanary"))
        for unit in _sequence(authority.base_corpus.get("units"), "base-units")
    }

    def walk(item: object) -> None:
        if isinstance(item, dict):
            for key, child in item.items():
                if key in FORBIDDEN_RESULT_KEYS:
                    raise _fail("private-content")
                walk(child)
        elif isinstance(item, list):
            for child in item:
                walk(child)

    walk(value)
    if any(canary in serialized for canary in canaries):
        raise _fail("private-content")


def _git_is_strict_ancestor(repository_root: Path, ancestor: str, descendant: str) -> bool:
    completed = subprocess.run(
        ["git", "merge-base", "--is-ancestor", ancestor, descendant],
        cwd=repository_root,
        check=False,
        capture_output=True,
    )
    return ancestor != descendant and completed.returncode == 0


def _git_commit_contains_authority(repository_root: Path, commit: str) -> bool:
    expected = {
        PROFILE_RELATIVE_PATH: PROFILE_SHA256,
        CORPUS_RELATIVE_PATH: CORPUS_SHA256,
        RAW_SCHEMA_RELATIVE_PATH: RAW_SCHEMA_SHA256,
        SUMMARY_SCHEMA_RELATIVE_PATH: SUMMARY_SCHEMA_SHA256,
    }
    for path, digest in expected.items():
        completed = subprocess.run(
            ["git", "show", f"{commit}:{path.as_posix()}"],
            cwd=repository_root,
            check=False,
            capture_output=True,
        )
        if completed.returncode != 0 or hashlib.sha256(completed.stdout).hexdigest() != digest:
            return False
    return True


def _verify_result_authority(
    repository_root: Path,
    result: Mapping[str, object],
    *,
    ancestry_checker: Callable[[str, str], bool] | None,
    authority_tree_checker: Callable[[str], bool] | None,
) -> None:
    authority_commit = result.get("authorityCommitSha")
    execution_commit = result.get("executionCommitSha")
    if (
        result.get("profileSha256") != PROFILE_SHA256
        or result.get("corpusSha256") != CORPUS_SHA256
        or not isinstance(authority_commit, str)
        or not isinstance(execution_commit, str)
        or authority_commit == execution_commit
    ):
        raise _fail("result-before-authority")
    tree_check = authority_tree_checker or (
        lambda commit: _git_commit_contains_authority(repository_root, commit)
    )
    ancestry_check = ancestry_checker or (
        lambda authority, execution: _git_is_strict_ancestor(
            repository_root,
            authority,
            execution,
        )
    )
    if not tree_check(authority_commit) or not ancestry_check(
        authority_commit,
        execution_commit,
    ):
        raise _fail("result-before-authority")


def _verify_raw_dispatches(result: Mapping[str, object]) -> None:
    arm = result.get("arm")
    if not isinstance(arm, str) or arm not in ARMS:
        raise _fail("arm")
    dispatches = _sequence(result.get("dispatches"), "dispatches")
    expected = _expected_occurrences(arm)
    if len(dispatches) != len(expected):
        raise _fail("missing-or-duplicate-identities")
    observed: list[tuple[object, object, object, object]] = []
    roles: list[object] = []
    for index, raw_dispatch in enumerate(dispatches):
        dispatch = _mapping(raw_dispatch, "dispatch")
        observed.append(
            (
                dispatch.get("occurrenceId"),
                dispatch.get("unitId"),
                dispatch.get("sourceSequence"),
                dispatch.get("passIndex"),
            )
        )
        roles.append(dispatch.get("workerRole"))
        if (
            dispatch.get("dispatchSequence") != index
            or dispatch.get("attempt") != 1
            or dispatch.get("publishedSequence") not in (index, None)
        ):
            raise _fail("dispatch-order-or-retry")
    if observed != expected or len({item[0] for item in observed}) != len(expected):
        raise _fail("missing-or-duplicate-identities")
    if arm == "cpu-solo" and set(roles) != {"cpu-support"}:
        raise _fail("worker-assignment")
    if arm == "gpu-solo" and set(roles) != {"gpu-primary"}:
        raise _fail("worker-assignment")
    if arm == "concurrent" and roles[:2] != ["gpu-primary", "cpu-support"]:
        raise _fail("worker-assignment")

    loads = _sequence(result.get("loads"), "loads")
    cancellation_trials = _sequence(
        result.get("cancellationTrials"),
        "cancellation-trials",
    )
    expected_load_roles = {
        "cpu-solo": ["cpu-support"] * 3,
        "gpu-solo": ["gpu-primary"] * 3,
        "concurrent": ["gpu-primary", "cpu-support"],
    }[arm]
    expected_trials = {
        "cpu-solo": ["before-dispatch", "cpu-active"],
        "gpu-solo": ["before-dispatch", "gpu-active"],
        "concurrent": [
            "before-dispatch",
            "gpu-active",
            "cpu-active",
            "both-active",
            "complete-before-ordered-release",
            "queued-after-invalidation",
        ],
    }[arm]
    if [_mapping(load, "load").get("workerRole") for load in loads] != expected_load_roles or [
        _mapping(trial, "cancellation-trial").get("trialId") for trial in cancellation_trials
    ] != expected_trials:
        raise _fail("execution-counts")


def _verify_cpu_zero_gpu_raw(result: Mapping[str, object]) -> None:
    if result.get("arm") == "gpu-solo":
        return
    cpu_loads = [
        _mapping(load, "load")
        for load in _sequence(result.get("loads"), "loads")
        if _mapping(load, "load").get("workerRole") == "cpu-support"
    ]
    if not cpu_loads:
        raise _fail("cpu-zero-gpu")
    for load in cpu_loads:
        if (
            load.get("device") != "cpu"
            or load.get("dtype") != "float32"
            or load.get("intraOpThreads") != 12
            or load.get("interopThreads") != 1
            or load.get("cudaAvailable") is not False
            or load.get("cudaDeviceCount") != 0
            or load.get("diskOrMetaParameters") != 0
            or load.get("implicitFallback") is not False
            or load.get("dedicatedGpuBytes") != 0
            or load.get("sharedGpuBytes") != 0
        ):
            raise _fail("cpu-zero-gpu")
    for raw_sample in _sequence(result.get("memorySamples"), "memory-samples"):
        sample = _mapping(raw_sample, "memory-sample")
        if (
            sample.get("cpuWorkerDedicatedVramBytes") != 0
            or sample.get("cpuWorkerSharedGpuBytes") != 0
        ):
            raise _fail("cpu-zero-gpu")


def validate_v5_raw_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
    authority_tree_checker: Callable[[str], bool] | None = None,
) -> None:
    """Validate a private raw arm against frozen v5 authority."""

    from jsonschema import Draft202012Validator

    authority = load_frozen_v5_authority(repository_root)
    result = _mapping(value, "result")
    errors = sorted(
        Draft202012Validator(cast(JsonSchema, authority.raw_schema)).iter_errors(value),
        key=lambda error: tuple(str(part) for part in error.absolute_path),
    )
    if errors:
        raise _fail("result-schema")
    _verify_no_private_content(value, authority)
    _verify_result_authority(
        repository_root,
        result,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )
    _verify_raw_dispatches(result)
    _verify_cpu_zero_gpu_raw(result)


def _conclusion(result: Mapping[str, object], name: str) -> Mapping[str, object]:
    conclusions = _mapping(result.get("conclusions"), "conclusions")
    return _mapping(conclusions.get(name), "conclusion")


def _is_pass(conclusion: Mapping[str, object]) -> bool:
    return (
        conclusion.get("outcome") == "pass"
        and conclusion.get("allRequiredGatesPassed") is True
        and conclusion.get("failedGateCodes") == []
    )


def _verify_summary_counts(result: Mapping[str, object]) -> None:
    arm = cast(str, result.get("arm"))
    counts = _mapping(result.get("counts"), "counts")
    expected_units = EXPECTED_UNITS[arm]
    expected_roles = {
        "cpu-solo": (0, 8),
        "gpu-solo": (40, 0),
        "concurrent": None,
    }[arm]
    if counts.get("measuredUnits") != expected_units or counts.get("automaticRetries") != 0:
        raise _fail("summary-counts")
    gpu_units = counts.get("gpuMeasuredUnits")
    cpu_units = counts.get("cpuMeasuredUnits")
    if expected_roles is None:
        if not isinstance(gpu_units, int) or not isinstance(cpu_units, int):
            raise _fail("summary-counts")
        if gpu_units + cpu_units != expected_units or gpu_units == 0 or cpu_units == 0:
            raise _fail("summary-counts")
    elif (gpu_units, cpu_units) != expected_roles:
        raise _fail("summary-counts")


def _verify_summary_memory_and_bounds(result: Mapping[str, object]) -> None:
    memory = _mapping(result.get("memory"), "memory")
    if result.get("arm") != "gpu-solo" and (
        memory.get("peakCpuWorkerDedicatedVramBytes") != 0
        or memory.get("peakCpuWorkerSharedGpuBytes") != 0
    ):
        raise _fail("cpu-zero-gpu")
    playback = _mapping(result.get("playback"), "playback")
    if (
        _number(playback.get("peakBufferSeconds"), "retention") > 300
        or _number(playback.get("peakBufferedPcmBytes"), "retention") > 28_800_000
        or _number(playback.get("peakQueuedCompleteUnits"), "retention") > 40
        or _number(playback.get("peakActiveUnits"), "retention") > 2
    ):
        raise _fail("retention")
    thresholds = _sequence(playback.get("thresholds"), "thresholds")
    if [_mapping(item, "threshold").get("playableSeconds") for item in thresholds] != [
        15,
        30,
        60,
        120,
        300,
    ]:
        raise _fail("retention")


def _verify_summary_conclusions(result: Mapping[str, object]) -> None:
    arm = cast(str, result.get("arm"))
    aggregates = _mapping(result.get("aggregates"), "aggregates")
    counts = _mapping(result.get("counts"), "counts")
    memory = _mapping(result.get("memory"), "memory")
    playback = _mapping(result.get("playback"), "playback")
    audits = _mapping(result.get("audits"), "audits")
    failures = counts.get("failedOrTimedOutFirstAttempts")
    required_audits = all(value is True for value in audits.values())

    standard = _conclusion(result, "unchangedStandardProductionViability")
    if (
        standard.get("outcome") != "fail"
        or standard.get("allRequiredGatesPassed") is not False
        or "inherited-v3-standard-failure"
        not in _sequence(standard.get("failedGateCodes"), "standard-failures")
    ):
        raise _fail("standard-conclusion")

    cpu = _conclusion(result, "cpuSoloAdmission")
    if arm == "cpu-solo":
        cpu_pass = (
            _number(aggregates.get("aggregateRtf"), "cpu-conclusion") <= 3.2
            and _number(aggregates.get("mediaSeconds"), "cpu-conclusion") >= 60
            and failures == 0
            and memory.get("peakCpuWorkerDedicatedVramBytes") == 0
            and memory.get("peakCpuWorkerSharedGpuBytes") == 0
            and required_audits
        )
        if _is_pass(cpu) != cpu_pass:
            raise _fail("cpu-conclusion")
    elif cpu.get("outcome") != "not-applicable":
        raise _fail("cpu-conclusion")

    scheduling = _conclusion(result, "concurrentSchedulingSustainability")
    preferred = _conclusion(result, "preferredStandardMargin")
    if arm != "concurrent":
        if (
            scheduling.get("outcome") != "not-applicable"
            or preferred.get("outcome") != "not-applicable"
        ):
            raise _fail("concurrent-conclusion")
        return

    aggregate_rtf = _number(aggregates.get("aggregateRtf"), "concurrent-conclusion")
    baseline = _number(
        aggregates.get("gpuSoloBaselineAggregateRtf"),
        "concurrent-conclusion",
    )
    slowdown = _number(aggregates.get("gpuSlowdownFraction"), "concurrent-conclusion")
    improvement = _number(
        aggregates.get("aggregateThroughputImprovementFraction"),
        "concurrent-conclusion",
    )
    scheduling_pass = (
        aggregate_rtf < 1
        and aggregate_rtf < baseline
        and slowdown <= 0.25
        and improvement > 0
        and _number(playback.get("bufferingSecondsPerMinute"), "concurrent-conclusion") <= 5
        and failures == 0
        and aggregates.get("reorderedPublishedUnits") == 0
        and aggregates.get("duplicateOrMissingIdentities") == 0
        and required_audits
    )
    if _is_pass(scheduling) != scheduling_pass:
        raise _fail("concurrent-conclusion")
    if _is_pass(preferred) != (scheduling_pass and aggregate_rtf <= 0.8):
        raise _fail("preferred-conclusion")


def validate_v5_summary_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
    authority_tree_checker: Callable[[str], bool] | None = None,
) -> None:
    """Validate a content-safe arm summary against frozen v5 authority."""

    from jsonschema import Draft202012Validator

    authority = load_frozen_v5_authority(repository_root)
    result = _mapping(value, "result")
    errors = sorted(
        Draft202012Validator(cast(JsonSchema, authority.summary_schema)).iter_errors(value),
        key=lambda error: tuple(str(part) for part in error.absolute_path),
    )
    if errors:
        raise _fail("result-schema")
    _verify_no_private_content(value, authority)
    _verify_result_authority(
        repository_root,
        result,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )
    arm = result.get("arm")
    if not isinstance(arm, str) or arm not in ARMS:
        raise _fail("arm")
    _verify_summary_counts(result)
    _verify_summary_memory_and_bounds(result)
    _verify_summary_conclusions(result)
