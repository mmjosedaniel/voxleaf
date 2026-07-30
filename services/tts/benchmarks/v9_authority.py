"""Result-blind validation for the corrective bilingual v9 authority."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Final, NoReturn, cast

from jsonschema import Draft202012Validator

import benchmarks.v7_authority as v7_authority
import benchmarks.v8_authority as v8_authority

PROFILE_RELATIVE_PATH: Final = Path("benchmarks/tts/profile-v9.json")
CANDIDATES_RELATIVE_PATH: Final = Path("benchmarks/tts/candidates-v9.json")
RAW_SCHEMA_RELATIVE_PATH: Final = Path("benchmarks/tts/schemas/bilingual-raw-v9.schema.json")
SUMMARY_SCHEMA_RELATIVE_PATH: Final = Path(
    "benchmarks/tts/schemas/bilingual-summary-v9.schema.json"
)
CHATTERBOX_LOCK_RELATIVE_PATH: Final = Path(
    "services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v2/uv.lock"
)
MOSS_LOCK_RELATIVE_PATH: Final = Path(
    "services/tts/benchmarks/candidates/moss_tts_nano_100m_onnx_cpu/uv.lock"
)

PROFILE_SHA256: Final = "39499a63ba6194803ae3e8e88c2e3a77390454310a059e2aaa9ca7f5874ba3d5"
CANDIDATES_SHA256: Final = "31249a583b8d43f90f7442797373e89b8993455e4cfe26e536cc1e1ca0ca8ad3"
RAW_SCHEMA_SHA256: Final = "f8f4f70b284dd162ac55cebadcbdd6d3ab3f1a8980e605cfbd9d52f45fe4d202"
SUMMARY_SCHEMA_SHA256: Final = "34299a8ab0ca2cccf302ef82d6e223237115939c6e23376465c16bb7970fbd05"
CHATTERBOX_LOCK_SHA256: Final = "9a5b2628499f522535dc79a70194dd604e40d9d7ab325a765ffc476f5c437c82"
MOSS_LOCK_SHA256: Final = "49d96b6b5121320290ba951be4a8a343f3380c2fc320182d6003b1dcf0d47bcb"

QWEN_SERENA_CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v9"
QWEN_AIDEN_CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v9"
CHATTERBOX_CANDIDATE_ID: Final = "chatterbox-multilingual-v3-cuda-bf16-default-v2"
MOSS_CANDIDATE_ID: Final = "moss-tts-nano-100m-onnx-cpu-ava-v2"
CANDIDATE_IDS: Final = (
    QWEN_SERENA_CANDIDATE_ID,
    QWEN_AIDEN_CANDIDATE_ID,
    CHATTERBOX_CANDIDATE_ID,
    MOSS_CANDIDATE_ID,
)
EXPECTED_LANGUAGES: Final = {
    QWEN_SERENA_CANDIDATE_ID: ("es",),
    QWEN_AIDEN_CANDIDATE_ID: ("en",),
    CHATTERBOX_CANDIDATE_ID: ("es", "en"),
    MOSS_CANDIDATE_ID: ("es", "en"),
}
DEPENDENCY_LOCKS: Final = {
    QWEN_SERENA_CANDIDATE_ID: v8_authority.QWEN_LOCK_SHA256,
    QWEN_AIDEN_CANDIDATE_ID: v8_authority.QWEN_LOCK_SHA256,
    CHATTERBOX_CANDIDATE_ID: CHATTERBOX_LOCK_SHA256,
    MOSS_CANDIDATE_ID: MOSS_LOCK_SHA256,
}


class V9AuthorityError(ValueError):
    """A fixed, content-free corrective-authority failure."""


@dataclass(frozen=True)
class FrozenV9Authority:
    """The immutable v8 history plus the prospective v9 correction."""

    base: v8_authority.FrozenV8Authority
    profile: Mapping[str, object]
    candidates: Mapping[str, object]
    raw_schema: Mapping[str, object]
    summary_schema: Mapping[str, object]


def _fail(code: str) -> NoReturn:
    raise V9AuthorityError(f"tts-benchmark-v9-authority:{code}")


def _load_object(path: Path) -> Mapping[str, object]:
    try:
        value = cast(object, json.loads(path.read_text(encoding="utf-8")))
    except (OSError, UnicodeError, json.JSONDecodeError):
        _fail("invalid-json")
    if not isinstance(value, dict):
        _fail("invalid-object")
    return cast(Mapping[str, object], value)


def _mapping(value: object, code: str) -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str) -> Sequence[object]:
    if not isinstance(value, list):
        _fail(code)
    return cast(Sequence[object], value)


def _sha256(path: Path) -> str:
    try:
        return hashlib.sha256(path.read_bytes()).hexdigest()
    except OSError:
        _fail("unreadable-authority")


def _verify_hashes(repository_root: Path) -> None:
    expected = {
        PROFILE_RELATIVE_PATH: PROFILE_SHA256,
        CANDIDATES_RELATIVE_PATH: CANDIDATES_SHA256,
        RAW_SCHEMA_RELATIVE_PATH: RAW_SCHEMA_SHA256,
        SUMMARY_SCHEMA_RELATIVE_PATH: SUMMARY_SCHEMA_SHA256,
        CHATTERBOX_LOCK_RELATIVE_PATH: CHATTERBOX_LOCK_SHA256,
        MOSS_LOCK_RELATIVE_PATH: MOSS_LOCK_SHA256,
    }
    if any(_sha256(repository_root / path) != digest for path, digest in expected.items()):
        _fail("authority-drift")


def _verify_link(
    authorities: Mapping[str, object],
    name: str,
    path: Path,
    digest: str,
) -> None:
    link = _mapping(authorities.get(name), "authority-links")
    if link.get("path") != path.as_posix() or link.get("sha256") != digest:
        _fail("authority-links")


def _verify_profile(profile: Mapping[str, object]) -> None:
    if (
        profile.get("profileVersion") != "tts-bilingual-corrective-profile-v9"
        or profile.get("status") != "frozen-before-corrective-v9-implementation-and-results"
    ):
        _fail("profile")
    supersedes = _mapping(profile.get("supersedesProspectiveUseOf"), "supersedes")
    if (
        supersedes.get("profile") != v8_authority.PROFILE_RELATIVE_PATH.as_posix()
        or supersedes.get("sha256") != v8_authority.PROFILE_SHA256
        or supersedes.get("historicalV8ResultsRemainImmutable") is not True
    ):
        _fail("supersedes")
    authorities = _mapping(profile.get("authorities"), "authority-links")
    _verify_link(
        authorities,
        "evaluationCorpus",
        v7_authority.CORPUS_RELATIVE_PATH,
        v7_authority.CORPUS_SHA256,
    )
    _verify_link(
        authorities,
        "normalizationProfile",
        v8_authority.NORMALIZATION_PROFILE_RELATIVE_PATH,
        v8_authority.NORMALIZATION_PROFILE_SHA256,
    )
    _verify_link(authorities, "candidateManifest", CANDIDATES_RELATIVE_PATH, CANDIDATES_SHA256)
    _verify_link(authorities, "privateRawSchema", RAW_SCHEMA_RELATIVE_PATH, RAW_SCHEMA_SHA256)
    _verify_link(
        authorities,
        "contentSafeSummarySchema",
        SUMMARY_SCHEMA_RELATIVE_PATH,
        SUMMARY_SCHEMA_SHA256,
    )
    product = _mapping(profile.get("productInterpretation"), "product")
    standard = _mapping(product.get("standardSupportTargets"), "product")
    constrained = _mapping(product.get("constrainedBufferedMvp"), "product")
    if (
        standard.get("warmP95RtfMaximum") != 1.1
        or standard.get("meaning") != "preferred-standard-profile-target-not-automatic-rejection"
        or constrained.get("rtfAboveOnePermitted") is not True
        or constrained.get("knownQwenReferenceRtf") != 1.44
        or constrained.get("maintainerDecisionRequired") is not True
    ):
        _fail("product")
    execution = _mapping(profile.get("executionPolicy"), "execution")
    if (
        tuple(_sequence(execution.get("candidateOrder"), "candidate-order")) != CANDIDATE_IDS
        or execution.get("automaticCandidateRejection") != "forbidden"
        or execution.get("hardStopIsCandidateRejection") is not False
        or execution.get("oneLoadedModelAtATime") is not True
    ):
        _fail("execution")
    bounded = _mapping(profile.get("boundedScreen"), "bounded")
    timeouts = _mapping(bounded.get("timeoutsMilliseconds"), "bounded")
    advisory = _mapping(bounded.get("advisoryTargets"), "bounded")
    if (
        dict(timeouts)
        != {
            "load": 300_000,
            "request": 180_000,
            "termination": 2_000,
            "cleanup": 5_000,
        }
        or advisory.get("warmP95RtfMaximum") != 1.1
        or advisory.get("cancellationTrialsPassed") != "all"
    ):
        _fail("bounded")
    decisions = _mapping(profile.get("decisionRules"), "decisions")
    if (
        decisions.get("rejectionRequiresExplicitMaintainerDecision") is not True
        or decisions.get("noModelMayBeRejectedByHarness") is not True
        or decisions.get("historicalV8RejectionsDoNotDecideV9") is not True
    ):
        _fail("decisions")


def _profile_by_id(candidates: Mapping[str, object]) -> Mapping[str, Mapping[str, object]]:
    profiles = _sequence(candidates.get("profiles"), "profiles")
    mapped: dict[str, Mapping[str, object]] = {}
    for value in profiles:
        profile = _mapping(value, "profiles")
        candidate_id = profile.get("candidateId")
        if not isinstance(candidate_id, str) or candidate_id in mapped:
            _fail("profiles")
        mapped[candidate_id] = profile
    if tuple(mapped) != CANDIDATE_IDS:
        _fail("profiles")
    return mapped


def _verify_candidates(candidates: Mapping[str, object]) -> None:
    if (
        candidates.get("candidateManifestVersion") != "tts-candidate-manifest-v9"
        or candidates.get("status") != "frozen-before-corrective-v9-results"
    ):
        _fail("candidates")
    policy = _mapping(candidates.get("decisionPolicy"), "policy")
    if (
        policy.get("automaticCandidateRejection") != "forbidden"
        or policy.get("maintainerDecisionRequiredBeforeRejection") is not True
        or policy.get("measurementFailureIsCandidateRejection") is not False
        or policy.get("configurationFailureIsCandidateRejection") is not False
        or tuple(_sequence(policy.get("candidateExecutionOrder"), "policy")) != CANDIDATE_IDS
    ):
        _fail("policy")
    profiles = _profile_by_id(candidates)
    for candidate_id in (QWEN_SERENA_CANDIDATE_ID, QWEN_AIDEN_CANDIDATE_ID):
        profile = profiles[candidate_id]
        performance = _mapping(profile.get("performanceInterpretation"), "qwen")
        lock = _mapping(profile.get("dependencyLock"), "qwen")
        if (
            profile.get("evaluationStage") != "constrained-buffered-control"
            or performance.get("measuredReferenceRtf") != 1.44
            or performance.get("rtfAboveOneAutomaticRejection") is not False
            or lock.get("sha256") != v8_authority.QWEN_LOCK_SHA256
        ):
            _fail("qwen")
    chatterbox = profiles[CHATTERBOX_CANDIDATE_ID]
    chatterbox_engine = _mapping(chatterbox.get("engine"), "chatterbox")
    chatterbox_model = _mapping(chatterbox.get("model"), "chatterbox")
    chatterbox_lock = _mapping(chatterbox.get("dependencyLock"), "chatterbox")
    chatterbox_host = _mapping(chatterbox.get("hostCorrection"), "chatterbox")
    if (
        chatterbox_engine.get("sourceRevision") != "5de7a54aa4e5e2baadb0182dde554908b48b85c2"
        or chatterbox_model.get("revision") != "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
        or chatterbox_model.get("t3Model") != "v3"
        or chatterbox_lock.get("path") != CHATTERBOX_LOCK_RELATIVE_PATH.as_posix()
        or chatterbox_lock.get("sha256") != CHATTERBOX_LOCK_SHA256
        or chatterbox_host.get("minimumTotalDedicatedVramMiB") != 8_000
        or chatterbox_host.get("minimumAvailableDedicatedVramMiBAtPreflight") != 6_144
    ):
        _fail("chatterbox")
    moss = profiles[MOSS_CANDIDATE_ID]
    moss_model = _mapping(moss.get("model"), "moss")
    moss_lock = _mapping(moss.get("dependencyLock"), "moss")
    artifacts = _sequence(moss_model.get("artifacts"), "moss")
    artifact_paths = tuple(
        (
            _mapping(value, "moss").get("root"),
            _mapping(value, "moss").get("path"),
        )
        for value in artifacts
    )
    if (
        moss_model.get("revision") != "f52645cb467506d8e18e746ddd59482685b74e58"
        or moss_model.get("codecRevision") != "ceff0d0749bfb3fa2d61149794ec6feef0d1e1ae"
        or len(artifacts) != 16
        or len(set(artifact_paths)) != 16
        or moss_lock.get("path") != MOSS_LOCK_RELATIVE_PATH.as_posix()
        or moss_lock.get("sha256") != MOSS_LOCK_SHA256
    ):
        _fail("moss")


def load_frozen_v9_authority(repository_root: Path) -> FrozenV9Authority:
    """Load and verify immutable v8 history plus the exact v9 correction."""

    base = v8_authority.load_frozen_v8_authority(repository_root)
    _verify_hashes(repository_root)
    profile = _load_object(repository_root / PROFILE_RELATIVE_PATH)
    candidates = _load_object(repository_root / CANDIDATES_RELATIVE_PATH)
    raw_schema = _load_object(repository_root / RAW_SCHEMA_RELATIVE_PATH)
    summary_schema = _load_object(repository_root / SUMMARY_SCHEMA_RELATIVE_PATH)
    _verify_profile(profile)
    _verify_candidates(candidates)
    if (
        raw_schema.get("$id") != "urn:voxleaf:benchmark:tts-bilingual-raw:v9"
        or summary_schema.get("$id") != "urn:voxleaf:benchmark:tts-bilingual-summary:v9"
    ):
        _fail("schema")
    Draft202012Validator.check_schema(raw_schema)
    Draft202012Validator.check_schema(summary_schema)
    return FrozenV9Authority(base, profile, candidates, raw_schema, summary_schema)


def _git_is_strict_ancestor(repository_root: Path, ancestor: str, descendant: str) -> bool:
    if ancestor == descendant:
        return False
    try:
        completed = subprocess.run(
            ("git", "merge-base", "--is-ancestor", ancestor, descendant),
            cwd=repository_root,
            check=False,
            capture_output=True,
            timeout=20,
        )
    except (OSError, subprocess.SubprocessError):
        return False
    return completed.returncode == 0


def validate_v9_summary_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
) -> None:
    """Validate one content-safe, decision-pending v9 summary."""

    authority = load_frozen_v9_authority(repository_root)
    errors = tuple(Draft202012Validator(authority.summary_schema).iter_errors(value))
    if errors or not isinstance(value, dict):
        _fail("result-schema")
    result = cast(Mapping[str, object], value)
    candidate_id = result.get("candidateId")
    if (
        not isinstance(candidate_id, str)
        or candidate_id not in CANDIDATE_IDS
        or tuple(cast(Sequence[object], result.get("languagesEvaluated")))
        != EXPECTED_LANGUAGES[candidate_id]
        or result.get("profileSha256") != PROFILE_SHA256
        or result.get("candidateManifestSha256") != CANDIDATES_SHA256
        or result.get("corpusSha256") != v7_authority.CORPUS_SHA256
        or result.get("dependencyLockSha256") != DEPENDENCY_LOCKS[candidate_id]
    ):
        _fail("result-authority")
    authority_commit = result.get("authorityCommitSha")
    execution_commit = result.get("executionCommitSha")
    if not isinstance(authority_commit, str) or not isinstance(execution_commit, str):
        _fail("result-authority")
    check = ancestry_checker or (
        lambda ancestor, descendant: _git_is_strict_ancestor(repository_root, ancestor, descendant)
    )
    if not check(authority_commit, execution_commit):
        _fail("result-before-authority")
