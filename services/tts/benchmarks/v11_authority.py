"""Result-blind validation for the Chatterbox RTX 50 compatibility v11 authority."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Final, NoReturn, cast

import benchmarks.v7_authority as v7_authority
import benchmarks.v8_authority as v8_authority
import benchmarks.v10_authority as v10_authority

PROFILE_RELATIVE_PATH: Final = Path("benchmarks/tts/profile-v11.json")
CANDIDATES_RELATIVE_PATH: Final = Path("benchmarks/tts/candidates-v11.json")
RAW_SCHEMA_RELATIVE_PATH: Final = Path("benchmarks/tts/schemas/bilingual-raw-v11.schema.json")
SUMMARY_SCHEMA_RELATIVE_PATH: Final = Path(
    "benchmarks/tts/schemas/bilingual-summary-v11.schema.json"
)
LOCK_RELATIVE_PATH: Final = Path(
    "services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/uv.lock"
)

PROFILE_SHA256: Final = "a48d5fd8c9624b0c8e7a394a45d050377990ff233486f9f0a96082ab675599c4"
CANDIDATES_SHA256: Final = "3bceb2c227be02c5f69b524afc3e008e3acf40d42ae47d38ce0b10462324cc06"
RAW_SCHEMA_SHA256: Final = "ef12722046d266c8332e9f4f4a99ed32f39618e113899ce4c8740ee1b84a2d7d"
SUMMARY_SCHEMA_SHA256: Final = "5fe1aa4d6471a4b7b1f17f179b5df61aeb6efd833164ced3087497257ef77353"
LOCK_SHA256: Final = "30f3ca3c27842d88e04256d357e79c291b90636d4f7e20fca18d20713021b1ab"

CANDIDATE_ID: Final = "chatterbox-multilingual-v3-cuda-bf16-default-v4"
EXPECTED_LANGUAGES: Final = ("es", "en")


class V11AuthorityError(ValueError):
    """A fixed, content-free corrective-authority failure."""


@dataclass(frozen=True)
class FrozenV11Authority:
    """The immutable v10 history plus the RTX 50 compatibility identity."""

    base: v10_authority.FrozenV10Authority
    profile: Mapping[str, object]
    candidates: Mapping[str, object]
    raw_schema: Mapping[str, object]
    summary_schema: Mapping[str, object]


def _fail(code: str) -> NoReturn:
    raise V11AuthorityError(f"tts-benchmark-v11-authority:{code}")


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
        LOCK_RELATIVE_PATH: LOCK_SHA256,
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
        profile.get("profileVersion") != "tts-chatterbox-rtx50-compatibility-profile-v11"
        or profile.get("status") != "frozen-before-chatterbox-rtx50-v11-implementation-and-results"
    ):
        _fail("profile")
    supersedes = _mapping(profile.get("supersedesCandidateConfiguration"), "supersedes")
    if (
        supersedes.get("profile") != v10_authority.PROFILE_RELATIVE_PATH.as_posix()
        or supersedes.get("sha256") != v10_authority.PROFILE_SHA256
        or supersedes.get("candidateId") != v10_authority.CANDIDATE_ID
    ):
        _fail("supersedes")
    preserved = _mapping(profile.get("preserves"), "preserves")
    if (
        preserved.get("v9MossAuthorityAndEvidence") is not True
        or preserved.get("v10ChatterboxConfigurationStop") is not True
    ):
        _fail("preserves")
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
    execution = _mapping(profile.get("executionPolicy"), "execution")
    decision = _mapping(profile.get("decision"), "decision")
    if (
        standard.get("warmP95RtfMaximum") != 1.1
        or standard.get("meaning") != "preferred-standard-profile-target-not-automatic-rejection"
        or constrained.get("rtfAboveOnePermitted") is not True
        or constrained.get("maintainerDecisionRequired") is not True
        or execution.get("candidateId") != CANDIDATE_ID
        or execution.get("supportIntent") != "experimental-compatibility-only"
        or execution.get("automaticCandidateRejection") != "forbidden"
        or execution.get("hardStopIsCandidateRejection") is not False
        or execution.get("oneLoadedModelAtATime") is not True
        or decision.get("stateBeforeMaintainerReview") != "pending-maintainer-decision"
        or decision.get("rejectionRecordedBeforeMaintainerReview") is not False
    ):
        _fail("decision-policy")


def _verify_candidates(candidates: Mapping[str, object]) -> None:
    if (
        candidates.get("candidateManifestVersion") != "tts-candidate-manifest-v11"
        or candidates.get("status") != "frozen-before-chatterbox-rtx50-v11-results"
    ):
        _fail("candidates")
    preserved = _mapping(candidates.get("preservesPriorEvidence"), "preserves")
    if (
        preserved.get("v9Moss") is not True
        or preserved.get("v10ChatterboxConfigurationStop") is not True
    ):
        _fail("preserves")
    supersedes = _mapping(candidates.get("supersedesCandidateConfiguration"), "supersedes")
    decision = _mapping(candidates.get("decisionPolicy"), "decision-policy")
    candidate = _mapping(candidates.get("profile"), "candidate")
    engine = _mapping(candidate.get("engine"), "candidate")
    model = _mapping(candidate.get("model"), "candidate")
    lock = _mapping(candidate.get("dependencyLock"), "candidate")
    runtime = _mapping(candidate.get("runtime"), "candidate")
    host = _mapping(candidate.get("host"), "candidate")
    correction = _mapping(candidate.get("correction"), "candidate")
    if (
        supersedes.get("manifest") != v10_authority.CANDIDATES_RELATIVE_PATH.as_posix()
        or supersedes.get("sha256") != v10_authority.CANDIDATES_SHA256
        or supersedes.get("candidateId") != v10_authority.CANDIDATE_ID
        or decision.get("automaticCandidateRejection") != "forbidden"
        or decision.get("maintainerDecisionRequiredBeforeRejection") is not True
        or decision.get("measurementFailureIsCandidateRejection") is not False
        or decision.get("configurationFailureIsCandidateRejection") is not False
        or candidate.get("candidateId") != CANDIDATE_ID
        or candidate.get("languages") != ["es", "en"]
        or engine.get("sourceRevision") != "5de7a54aa4e5e2baadb0182dde554908b48b85c2"
        or model.get("revision") != "5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18"
        or model.get("t3Model") != "v3"
        or lock.get("path") != LOCK_RELATIVE_PATH.as_posix()
        or lock.get("sha256") != LOCK_SHA256
        or runtime.get("torch") != "2.9.1+cu128"
        or runtime.get("torchaudio") != "2.9.1+cu128"
        or runtime.get("provider") != "cuda"
        or runtime.get("precision") != "bf16"
        or runtime.get("dependencyOverride") != "explicit-bounded-compatibility-experiment"
        or host.get("minimumTotalDedicatedVramMiB") != 8_000
        or host.get("minimumAvailableDedicatedVramMiBAtPreflight") != 6_144
        or host.get("requiredCudaCapability") != "12.0"
        or correction.get("v10LoadStopWasModelResult") is not False
        or correction.get("v10LoadStopWasCandidateRejection") is not False
        or correction.get("dependencyOverrideMustRemainExperimental") is not True
    ):
        _fail("candidate")


def load_frozen_v11_authority(repository_root: Path) -> FrozenV11Authority:
    """Load v10 history and verify the RTX 50 compatibility experiment."""

    from jsonschema import Draft202012Validator

    base = v10_authority.load_frozen_v10_authority(repository_root)
    _verify_hashes(repository_root)
    profile = _load_object(repository_root / PROFILE_RELATIVE_PATH)
    candidates = _load_object(repository_root / CANDIDATES_RELATIVE_PATH)
    raw_schema = _load_object(repository_root / RAW_SCHEMA_RELATIVE_PATH)
    summary_schema = _load_object(repository_root / SUMMARY_SCHEMA_RELATIVE_PATH)
    _verify_profile(profile)
    _verify_candidates(candidates)
    if (
        raw_schema.get("$id") != "urn:voxleaf:benchmark:tts-bilingual-raw:v11"
        or summary_schema.get("$id") != "urn:voxleaf:benchmark:tts-bilingual-summary:v11"
    ):
        _fail("schema")
    Draft202012Validator.check_schema(raw_schema)
    Draft202012Validator.check_schema(summary_schema)
    return FrozenV11Authority(base, profile, candidates, raw_schema, summary_schema)


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


def validate_v11_summary_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
) -> None:
    """Validate one content-safe, decision-pending Chatterbox v11 summary."""

    from jsonschema import Draft202012Validator

    authority = load_frozen_v11_authority(repository_root)
    errors = tuple(Draft202012Validator(authority.summary_schema).iter_errors(value))
    if errors or not isinstance(value, dict):
        _fail("result-schema")
    result = cast(Mapping[str, object], value)
    if (
        result.get("candidateId") != CANDIDATE_ID
        or tuple(cast(Sequence[object], result.get("languagesEvaluated"))) != EXPECTED_LANGUAGES
        or result.get("profileSha256") != PROFILE_SHA256
        or result.get("candidateManifestSha256") != CANDIDATES_SHA256
        or result.get("corpusSha256") != v7_authority.CORPUS_SHA256
        or result.get("dependencyLockSha256") != LOCK_SHA256
    ):
        _fail("result-authority")
    authority_commit = result.get("authorityCommitSha")
    execution_commit = result.get("executionCommitSha")
    if not isinstance(authority_commit, str) or not isinstance(execution_commit, str):
        _fail("result-authority")
    check = ancestry_checker or (
        lambda ancestor, descendant: _git_is_strict_ancestor(
            repository_root,
            ancestor,
            descendant,
        )
    )
    if not check(authority_commit, execution_commit):
        _fail("result-before-authority")
    decision = _mapping(result.get("decision"), "result-decision")
    if (
        decision.get("state") != "pending-maintainer-decision"
        or decision.get("rejectionRecorded") is not False
    ):
        _fail("result-decision")
