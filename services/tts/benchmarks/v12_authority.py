"""Result-blind authority for the corrective bilingual full evaluation v12."""

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
import benchmarks.v11_authority as v11_authority

PROFILE_RELATIVE_PATH: Final = Path("benchmarks/tts/profile-v12.json")
CANDIDATES_RELATIVE_PATH: Final = Path("benchmarks/tts/candidates-v12.json")
RAW_SCHEMA_RELATIVE_PATH: Final = Path("benchmarks/tts/schemas/bilingual-full-raw-v12.schema.json")
SUMMARY_SCHEMA_RELATIVE_PATH: Final = Path(
    "benchmarks/tts/schemas/bilingual-full-summary-v12.schema.json"
)
QUALITY_SCHEMA_RELATIVE_PATH: Final = Path(
    "benchmarks/tts/schemas/quality-control-summary-v12.schema.json"
)
CHATTERBOX_LOCK_RELATIVE_PATH: Final = v11_authority.LOCK_RELATIVE_PATH
QWEN_LOCK_RELATIVE_PATH: Final = v8_authority.QWEN_LOCK_RELATIVE_PATH

PROFILE_SHA256: Final = "b4144299538225bdac86983493b3a64b8cf2a8c291403aca21dfafe7d33cc267"
CANDIDATES_SHA256: Final = "0107aee0e4cbea5ae0d26cddb6511340d57854061f2b1c4108166bcf1df45539"
RAW_SCHEMA_SHA256: Final = "06e72b865d2dea9568e1e08a32b7153a98ea95f4c2799eaae42210a2ea7a07bb"
SUMMARY_SCHEMA_SHA256: Final = "a4a25d7448e8e8c0615ed10168a9fbff460ef314a1801518a7ffb207014ff9ac"
QUALITY_SCHEMA_SHA256: Final = "d13db1077572d47894ba4bf897da11781325574ad7e4c4241e303406684f4f50"

CHATTERBOX_CANDIDATE_ID: Final = v11_authority.CANDIDATE_ID
QWEN_SERENA_CANDIDATE_ID: Final = v8_authority.QWEN_SERENA_CANDIDATE_ID
QWEN_AIDEN_CANDIDATE_ID: Final = v8_authority.QWEN_AIDEN_CANDIDATE_ID
QWEN_CANDIDATE_IDS: Final = (
    QWEN_SERENA_CANDIDATE_ID,
    QWEN_AIDEN_CANDIDATE_ID,
)
QWEN_LANGUAGES: Final = {
    QWEN_SERENA_CANDIDATE_ID: "es",
    QWEN_AIDEN_CANDIDATE_ID: "en",
}
QWEN_MACHINE_RESULTS: Final = {
    QWEN_SERENA_CANDIDATE_ID: (
        Path("benchmarks/tts/qwen-serena-spanish-control-result-v8.json"),
        "fef771409d1edb24bd6f02302f5b11317044903ea9e103e3a679511ac1d9b8f4",
    ),
    QWEN_AIDEN_CANDIDATE_ID: (
        Path("benchmarks/tts/qwen-aiden-english-control-result-v8.json"),
        "ac0321bbbc0626ee0026254ff05a5a58c9629088736f7f8509b88e3a08e62f73",
    ),
}
PRESERVED_RESULTS: Final = {
    **{path: digest for path, digest in QWEN_MACHINE_RESULTS.values()},
    Path("benchmarks/tts/moss-bilingual-screen-result-v9.json"): (
        "be8aaddf5bd18da93638b7203e924ce65800dcb32cbb865ef13802cd4a7d9063"
    ),
    Path("benchmarks/tts/chatterbox-bilingual-screen-result-v11.json"): (
        "74db9d10e23a7dbb6343935ea9b71c7efa51f176fe335b9deaffda471ffcd17a"
    ),
}


class V12AuthorityError(ValueError):
    """Fixed content-free v12 authority or result failure."""


@dataclass(frozen=True)
class FrozenV12Authority:
    """The immutable prior authorities plus the corrective full matrix."""

    v8: v8_authority.FrozenV8Authority
    v11: v11_authority.FrozenV11Authority
    profile: Mapping[str, object]
    candidates: Mapping[str, object]
    raw_schema: Mapping[str, object]
    summary_schema: Mapping[str, object]
    quality_schema: Mapping[str, object]


def _fail(code: str) -> NoReturn:
    raise V12AuthorityError(f"tts-benchmark-v12-authority:{code}")


def _mapping(value: object, code: str) -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str) -> Sequence[object]:
    if not isinstance(value, list):
        _fail(code)
    return cast(Sequence[object], value)


def _load_object(path: Path) -> Mapping[str, object]:
    try:
        value = cast(object, json.loads(path.read_text(encoding="utf-8")))
    except (OSError, UnicodeError, json.JSONDecodeError):
        _fail("invalid-json")
    return _mapping(value, "invalid-object")


def _sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def _sha256(path: Path) -> str:
    try:
        return _sha256_bytes(path.read_bytes())
    except OSError:
        _fail("unreadable-authority")


def authority_file_hashes() -> Mapping[Path, str]:
    """Return every byte-frozen input required by a v12 result."""

    return {
        PROFILE_RELATIVE_PATH: PROFILE_SHA256,
        CANDIDATES_RELATIVE_PATH: CANDIDATES_SHA256,
        RAW_SCHEMA_RELATIVE_PATH: RAW_SCHEMA_SHA256,
        SUMMARY_SCHEMA_RELATIVE_PATH: SUMMARY_SCHEMA_SHA256,
        QUALITY_SCHEMA_RELATIVE_PATH: QUALITY_SCHEMA_SHA256,
        v7_authority.CORPUS_RELATIVE_PATH: v7_authority.CORPUS_SHA256,
        v8_authority.PROFILE_RELATIVE_PATH: v8_authority.PROFILE_SHA256,
        v8_authority.CANDIDATES_RELATIVE_PATH: v8_authority.CANDIDATES_SHA256,
        v11_authority.PROFILE_RELATIVE_PATH: v11_authority.PROFILE_SHA256,
        v11_authority.CANDIDATES_RELATIVE_PATH: v11_authority.CANDIDATES_SHA256,
        CHATTERBOX_LOCK_RELATIVE_PATH: v11_authority.LOCK_SHA256,
        QWEN_LOCK_RELATIVE_PATH: v8_authority.QWEN_LOCK_SHA256,
        **PRESERVED_RESULTS,
    }


def _verify_hashes(repository_root: Path) -> None:
    if any(
        _sha256(repository_root / relative_path) != digest
        for relative_path, digest in authority_file_hashes().items()
    ):
        _fail("authority-drift")


def _verify_link(
    authorities: Mapping[str, object],
    name: str,
    path: Path,
    digest: str,
) -> None:
    value = _mapping(authorities.get(name), "authority-links")
    if value.get("path") != path.as_posix() or value.get("sha256") != digest:
        _fail("authority-links")


def _verify_profile(profile: Mapping[str, object]) -> None:
    if (
        profile.get("profileVersion") != "tts-corrective-full-evaluation-profile-v12"
        or profile.get("status") != "frozen-before-v12-implementation-and-results"
    ):
        _fail("profile")
    preserved = _mapping(profile.get("preserves"), "preserves")
    if (
        preserved.get("v8QwenAuthorityAndResults") is not True
        or preserved.get("v9MossAuthorityAndResult") is not True
        or preserved.get("v11ChatterboxAuthorityAndResult") is not True
        or preserved.get("historicalBytesMayBeEdited") is not False
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
        "candidateManifest",
        CANDIDATES_RELATIVE_PATH,
        CANDIDATES_SHA256,
    )
    _verify_link(
        authorities,
        "chatterboxPrivateRawSchema",
        RAW_SCHEMA_RELATIVE_PATH,
        RAW_SCHEMA_SHA256,
    )
    _verify_link(
        authorities,
        "chatterboxContentSafeSummarySchema",
        SUMMARY_SCHEMA_RELATIVE_PATH,
        SUMMARY_SCHEMA_SHA256,
    )
    _verify_link(
        authorities,
        "qwenContentSafeQualitySchema",
        QUALITY_SCHEMA_RELATIVE_PATH,
        QUALITY_SCHEMA_SHA256,
    )
    execution = _mapping(profile.get("executionPolicy"), "execution")
    matrix = _mapping(profile.get("chatterboxFullMatrix"), "matrix")
    controls = _mapping(profile.get("qwenQualityControls"), "controls")
    interpretation = _mapping(profile.get("interpretation"), "interpretation")
    if (
        execution.get("oneLoadedModelAtATime") is not True
        or execution.get("automaticRetries") != 0
        or execution.get("runtimeDownloads") != "forbidden"
        or matrix.get("candidateId") != CHATTERBOX_CANDIDATE_ID
        or matrix.get("languages") != ["es", "en"]
        or matrix.get("coldLoads") != 5
        or matrix.get("warmPassesPerLanguage") != 2
        or matrix.get("sustainedCompleteCorpusPassesPerLanguage") != 3
        or matrix.get("expectedWarmAttempts") != 20
        or matrix.get("expectedSustainedAttempts") != 30
        or controls.get("reuseMachineEvidenceWithoutReinterpretation") is not True
        or controls.get("newMachineExecutionRequired") is not False
        or interpretation.get("automaticCandidateRejection") != "forbidden"
        or interpretation.get("maintainerDecisionRequiredBeforeAdmissionDeferralOrRejection")
        is not True
        or interpretation.get("hardStopIsAutomaticCandidateDecision") is not False
    ):
        _fail("policy")


def _verify_candidates(candidates: Mapping[str, object]) -> None:
    if (
        candidates.get("candidateManifestVersion") != "tts-candidate-manifest-v12"
        or candidates.get("status") != "frozen-before-corrective-full-evaluation-results"
    ):
        _fail("candidates")
    policy = _mapping(candidates.get("decisionPolicy"), "decision-policy")
    profiles = tuple(
        _mapping(value, "candidate")
        for value in _sequence(candidates.get("profiles"), "candidates")
    )
    by_id = {value.get("candidateId"): value for value in profiles}
    if (
        len(profiles) != 3
        or set(by_id) != {CHATTERBOX_CANDIDATE_ID, *QWEN_CANDIDATE_IDS}
        or policy.get("automaticCandidateRejection") != "forbidden"
        or policy.get("maintainerDecisionRequired") is not True
        or policy.get("oneLoadedModelAtATime") is not True
    ):
        _fail("candidates")
    chatterbox = by_id[CHATTERBOX_CANDIDATE_ID]
    chatterbox_lock = _mapping(chatterbox.get("dependencyLock"), "candidate")
    if (
        chatterbox.get("evaluationStage") != "corrective-full-bilingual"
        or chatterbox.get("languages") != ["es", "en"]
        or chatterbox_lock.get("path") != CHATTERBOX_LOCK_RELATIVE_PATH.as_posix()
        or chatterbox_lock.get("sha256") != v11_authority.LOCK_SHA256
    ):
        _fail("candidate")
    for candidate_id in QWEN_CANDIDATE_IDS:
        candidate = by_id[candidate_id]
        evidence = _mapping(candidate.get("machineEvidence"), "candidate")
        lock = _mapping(candidate.get("dependencyLock"), "candidate")
        evidence_path, evidence_sha = QWEN_MACHINE_RESULTS[candidate_id]
        if (
            candidate.get("evaluationStage") != "independent-quality-only"
            or candidate.get("languages") != [QWEN_LANGUAGES[candidate_id]]
            or evidence.get("path") != evidence_path.as_posix()
            or evidence.get("sha256") != evidence_sha
            or lock.get("path") != QWEN_LOCK_RELATIVE_PATH.as_posix()
            or lock.get("sha256") != v8_authority.QWEN_LOCK_SHA256
        ):
            _fail("candidate")


def load_frozen_v12_authority(repository_root: Path) -> FrozenV12Authority:
    """Load and validate every immutable input used by v12."""

    from jsonschema import Draft202012Validator

    v8 = v8_authority.load_frozen_v8_authority(repository_root)
    v11 = v11_authority.load_frozen_v11_authority(repository_root)
    _verify_hashes(repository_root)
    authority = FrozenV12Authority(
        v8=v8,
        v11=v11,
        profile=_load_object(repository_root / PROFILE_RELATIVE_PATH),
        candidates=_load_object(repository_root / CANDIDATES_RELATIVE_PATH),
        raw_schema=_load_object(repository_root / RAW_SCHEMA_RELATIVE_PATH),
        summary_schema=_load_object(repository_root / SUMMARY_SCHEMA_RELATIVE_PATH),
        quality_schema=_load_object(repository_root / QUALITY_SCHEMA_RELATIVE_PATH),
    )
    _verify_profile(authority.profile)
    _verify_candidates(authority.candidates)
    for schema in (
        authority.raw_schema,
        authority.summary_schema,
        authority.quality_schema,
    ):
        Draft202012Validator.check_schema(schema)
    return authority


def git_is_strict_ancestor(repository_root: Path, ancestor: str, descendant: str) -> bool:
    """Return whether ``ancestor`` strictly precedes ``descendant``."""

    if ancestor == descendant:
        return False
    completed = subprocess.run(
        ("git", "merge-base", "--is-ancestor", ancestor, descendant),
        cwd=repository_root,
        check=False,
        capture_output=True,
    )
    return completed.returncode == 0


def git_authority_tree_matches(repository_root: Path, commit: str) -> bool:
    """Verify the complete v12 authority tree at an arbitrary reachable commit."""

    if len(commit) != 40 or any(value not in "0123456789abcdef" for value in commit):
        return False
    for relative_path, expected in authority_file_hashes().items():
        completed = subprocess.run(
            ("git", "show", f"{commit}:{relative_path.as_posix()}"),
            cwd=repository_root,
            check=False,
            capture_output=True,
        )
        if completed.returncode != 0 or _sha256_bytes(completed.stdout) != expected:
            return False
    return True


def _reject_private_content(value: object, authority: FrozenV12Authority) -> None:
    serialized = json.dumps(value, ensure_ascii=False, sort_keys=True)
    canaries = {
        cast(str, case.get("privacyCanary"))
        for case in (
            _mapping(item, "case")
            for item in _sequence(authority.v8.base.corpus.get("cases"), "cases")
        )
    }

    def walk(item: object) -> None:
        if isinstance(item, dict):
            for key, child in item.items():
                if key in v7_authority.FORBIDDEN_RESULT_KEYS:
                    _fail("private-content")
                walk(child)
        elif isinstance(item, list):
            for child in item:
                walk(child)

    walk(value)
    if any(canary in serialized for canary in canaries):
        _fail("private-content")


def _verify_commits(
    repository_root: Path,
    result: Mapping[str, object],
    *,
    ancestry_checker: Callable[[str, str], bool] | None,
    authority_tree_checker: Callable[[str], bool] | None,
) -> None:
    authority_commit = result.get("authorityCommitSha")
    execution_commit = result.get("executionCommitSha")
    if (
        not isinstance(authority_commit, str)
        or not isinstance(execution_commit, str)
        or authority_commit == execution_commit
    ):
        _fail("result-before-authority")
    tree_check = authority_tree_checker or (
        lambda commit: git_authority_tree_matches(repository_root, commit)
    )
    ancestor_check = ancestry_checker or (
        lambda ancestor, descendant: git_is_strict_ancestor(
            repository_root,
            ancestor,
            descendant,
        )
    )
    if not tree_check(authority_commit) or not ancestor_check(
        authority_commit,
        execution_commit,
    ):
        _fail("result-before-authority")


def _validate_chatterbox_result(
    repository_root: Path,
    value: object,
    *,
    summary: bool,
    ancestry_checker: Callable[[str, str], bool] | None,
    authority_tree_checker: Callable[[str], bool] | None,
) -> None:
    from jsonschema import Draft202012Validator

    authority = load_frozen_v12_authority(repository_root)
    result = _mapping(value, "result")
    schema = authority.summary_schema if summary else authority.raw_schema
    if tuple(Draft202012Validator(schema).iter_errors(value)):
        _fail("result-schema")
    _reject_private_content(value, authority)
    if (
        result.get("candidateId") != CHATTERBOX_CANDIDATE_ID
        or result.get("profileSha256") != PROFILE_SHA256
        or result.get("corpusSha256") != v7_authority.CORPUS_SHA256
        or result.get("candidateManifestSha256") != CANDIDATES_SHA256
        or result.get("dependencyLockSha256") != v11_authority.LOCK_SHA256
    ):
        _fail("result-authority")
    _verify_commits(
        repository_root,
        result,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )


def validate_v12_raw_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
    authority_tree_checker: Callable[[str], bool] | None = None,
) -> None:
    _validate_chatterbox_result(
        repository_root,
        value,
        summary=False,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )


def validate_v12_summary_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
    authority_tree_checker: Callable[[str], bool] | None = None,
) -> None:
    _validate_chatterbox_result(
        repository_root,
        value,
        summary=True,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )


def validate_v12_qwen_quality_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
    authority_tree_checker: Callable[[str], bool] | None = None,
) -> None:
    """Validate one content-safe, language-specific Qwen quality result."""

    from jsonschema import Draft202012Validator

    authority = load_frozen_v12_authority(repository_root)
    result = _mapping(value, "result")
    if tuple(Draft202012Validator(authority.quality_schema).iter_errors(value)):
        _fail("result-schema")
    _reject_private_content(value, authority)
    candidate_id = result.get("candidateId")
    if candidate_id not in QWEN_CANDIDATE_IDS:
        _fail("result-authority")
    _path, evidence_sha = QWEN_MACHINE_RESULTS[candidate_id]
    if (
        result.get("profileSha256") != PROFILE_SHA256
        or result.get("corpusSha256") != v7_authority.CORPUS_SHA256
        or result.get("candidateManifestSha256") != CANDIDATES_SHA256
        or result.get("dependencyLockSha256") != v8_authority.QWEN_LOCK_SHA256
        or result.get("machineEvidenceSha256") != evidence_sha
        or result.get("language") != QWEN_LANGUAGES[candidate_id]
    ):
        _fail("result-authority")
    _verify_commits(
        repository_root,
        result,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )
