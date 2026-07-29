"""Result-blind validation for the superseding bilingual v8 authority."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Final, cast

import benchmarks.v7_authority as v7_authority

PROFILE_RELATIVE_PATH: Final = Path("benchmarks/tts/profile-v8.json")
CANDIDATES_RELATIVE_PATH: Final = Path("benchmarks/tts/candidates-v8.json")
PRODUCT_AUTHORITY_RELATIVE_PATH: Final = Path(
    "docs/architecture/bilingual-narration-authority-v1.md"
)
NORMALIZATION_PROFILE_RELATIVE_PATH: Final = Path("docs/architecture/narration-normalization-v2.md")
RAW_SCHEMA_RELATIVE_PATH: Final = Path("benchmarks/tts/schemas/bilingual-raw-v8.schema.json")
SUMMARY_SCHEMA_RELATIVE_PATH: Final = Path(
    "benchmarks/tts/schemas/bilingual-summary-v8.schema.json"
)
QWEN_LOCK_RELATIVE_PATH: Final = Path(
    "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/uv.lock"
)
PROFILE_SHA256: Final = "84448e70e8b8b2782f22c0e3d874b1b30531084732e0416ab9e83e1ad1e7525a"
CANDIDATES_SHA256: Final = "5245f6949cf035eee8de98fef21e8eea89d30b468d76039949e2100558401b0e"
PRODUCT_AUTHORITY_SHA256: Final = "7a0cb1e7096d9e84bae58c66393cb6ab4037f322c9013a7e4e7f8172215b006c"
NORMALIZATION_PROFILE_SHA256: Final = (
    "8e4f0bc45d260a03bc4bfdf523d272951eb26915005a9acbc60e8f17a4dd446e"
)
RAW_SCHEMA_SHA256: Final = "b18c14fa7a65d45f9bc8ddc05aa71607e7835584a5c0b7e87f244b5cb1681492"
SUMMARY_SCHEMA_SHA256: Final = "c1d57fcea4c6abbbeb6af7ba3fe4a8a59b514c55803e09601e3d0448a863f67c"
QWEN_LOCK_SHA256: Final = "1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913"
QWEN_SERENA_CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8"
QWEN_AIDEN_CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8"
ADDED_CANDIDATE_IDS: Final = (
    QWEN_SERENA_CANDIDATE_ID,
    QWEN_AIDEN_CANDIDATE_ID,
)
ADMITTED_CANDIDATE_IDS: Final = (
    v7_authority.ADMITTED_CANDIDATE_IDS[0],
    QWEN_SERENA_CANDIDATE_ID,
    QWEN_AIDEN_CANDIDATE_ID,
    v7_authority.ADMITTED_CANDIDATE_IDS[1],
    v7_authority.ADMITTED_CANDIDATE_IDS[2],
)
EXPECTED_LANGUAGES: Final = {
    v7_authority.ADMITTED_CANDIDATE_IDS[0]: ("en",),
    QWEN_SERENA_CANDIDATE_ID: ("es",),
    QWEN_AIDEN_CANDIDATE_ID: ("en",),
    v7_authority.ADMITTED_CANDIDATE_IDS[1]: ("es", "en"),
    v7_authority.ADMITTED_CANDIDATE_IDS[2]: ("es", "en"),
}
EXPECTED_STAGES: Final = {
    v7_authority.ADMITTED_CANDIDATE_IDS[0]: frozenset({"baseline"}),
    QWEN_SERENA_CANDIDATE_ID: frozenset({"existing-engine-control", "full-matrix"}),
    QWEN_AIDEN_CANDIDATE_ID: frozenset({"existing-engine-control", "full-matrix"}),
    v7_authority.ADMITTED_CANDIDATE_IDS[1]: frozenset({"screen", "full-matrix"}),
    v7_authority.ADMITTED_CANDIDATE_IDS[2]: frozenset({"screen", "full-matrix"}),
}
type JsonSchema = bool | Mapping[str, Any]


class V8AuthorityError(ValueError):
    """A fixed, content-free v8 authority failure."""


@dataclass(frozen=True)
class FrozenV8Authority:
    """The immutable v7 base plus the exact v8 superseding amendment."""

    base: v7_authority.FrozenV7Authority
    profile: Mapping[str, object]
    candidates: Mapping[str, object]
    raw_schema: Mapping[str, object]
    summary_schema: Mapping[str, object]


def _fail(code: str) -> V8AuthorityError:
    return V8AuthorityError(f"tts-benchmark-v8-authority:{code}")


def _load_object(path: Path) -> Mapping[str, object]:
    try:
        value = cast(object, json.loads(path.read_text(encoding="utf-8")))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise _fail("invalid-json") from error
    if not isinstance(value, dict):
        raise _fail("invalid-object")
    return cast(Mapping[str, object], value)


def _mapping(value: object, code: str) -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise _fail(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str) -> Sequence[object]:
    if not isinstance(value, list):
        raise _fail(code)
    return cast(Sequence[object], value)


def _sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _sha256(path: Path) -> str:
    try:
        return _sha256_bytes(path.read_bytes())
    except OSError as error:
        raise _fail("unreadable-authority") from error


def _v8_file_hashes() -> Mapping[Path, str]:
    return {
        PROFILE_RELATIVE_PATH: PROFILE_SHA256,
        CANDIDATES_RELATIVE_PATH: CANDIDATES_SHA256,
        PRODUCT_AUTHORITY_RELATIVE_PATH: PRODUCT_AUTHORITY_SHA256,
        NORMALIZATION_PROFILE_RELATIVE_PATH: NORMALIZATION_PROFILE_SHA256,
        RAW_SCHEMA_RELATIVE_PATH: RAW_SCHEMA_SHA256,
        SUMMARY_SCHEMA_RELATIVE_PATH: SUMMARY_SCHEMA_SHA256,
        QWEN_LOCK_RELATIVE_PATH: QWEN_LOCK_SHA256,
    }


def _all_authority_file_hashes() -> Mapping[Path, str]:
    return {
        v7_authority.PROFILE_RELATIVE_PATH: v7_authority.PROFILE_SHA256,
        v7_authority.CANDIDATES_RELATIVE_PATH: v7_authority.CANDIDATES_SHA256,
        v7_authority.NORMALIZATION_CORPUS_RELATIVE_PATH: (v7_authority.NORMALIZATION_CORPUS_SHA256),
        v7_authority.CORPUS_RELATIVE_PATH: v7_authority.CORPUS_SHA256,
        v7_authority.RAW_SCHEMA_RELATIVE_PATH: v7_authority.RAW_SCHEMA_SHA256,
        v7_authority.SUMMARY_SCHEMA_RELATIVE_PATH: v7_authority.SUMMARY_SCHEMA_SHA256,
        v7_authority.PIPER_LOCK_RELATIVE_PATH: v7_authority.PIPER_LOCK_SHA256,
        v7_authority.CHATTERBOX_LOCK_RELATIVE_PATH: (v7_authority.CHATTERBOX_LOCK_SHA256),
        v7_authority.MOSS_LOCK_RELATIVE_PATH: v7_authority.MOSS_LOCK_SHA256,
        **_v8_file_hashes(),
    }


def _verify_file_hashes(repository_root: Path) -> None:
    if any(
        _sha256(repository_root / relative_path) != expected
        for relative_path, expected in _all_authority_file_hashes().items()
    ):
        raise _fail("authority-drift")


def _verify_link(
    authorities: Mapping[str, object],
    name: str,
    path: Path,
    digest: str,
) -> None:
    link = _mapping(authorities.get(name), "authority-links")
    if link.get("path") != path.as_posix() or link.get("sha256") != digest:
        raise _fail("authority-links")


def _verify_profile(profile: Mapping[str, object]) -> None:
    if (
        profile.get("profileVersion") != "tts-bilingual-profile-v8"
        or profile.get("status") != "frozen-before-v8-implementation-pilot-and-official-results"
    ):
        raise _fail("profile")
    supersedes = _mapping(profile.get("supersedes"), "supersedes")
    if (
        supersedes.get("profile") != v7_authority.PROFILE_RELATIVE_PATH.as_posix()
        or supersedes.get("sha256") != v7_authority.PROFILE_SHA256
        or supersedes.get("v7ResultFilesPresent") != 0
    ):
        raise _fail("supersedes")
    authorities = _mapping(profile.get("authorities"), "authority-links")
    _verify_link(
        authorities,
        "product",
        PRODUCT_AUTHORITY_RELATIVE_PATH,
        PRODUCT_AUTHORITY_SHA256,
    )
    _verify_link(
        authorities,
        "normalizationProfile",
        NORMALIZATION_PROFILE_RELATIVE_PATH,
        NORMALIZATION_PROFILE_SHA256,
    )
    _verify_link(
        authorities,
        "normalizationCorpus",
        v7_authority.NORMALIZATION_CORPUS_RELATIVE_PATH,
        v7_authority.NORMALIZATION_CORPUS_SHA256,
    )
    _verify_link(
        authorities,
        "evaluationCorpus",
        v7_authority.CORPUS_RELATIVE_PATH,
        v7_authority.CORPUS_SHA256,
    )
    _verify_link(
        authorities,
        "baseEvaluationProfile",
        v7_authority.PROFILE_RELATIVE_PATH,
        v7_authority.PROFILE_SHA256,
    )
    _verify_link(
        authorities,
        "baseCandidateManifest",
        v7_authority.CANDIDATES_RELATIVE_PATH,
        v7_authority.CANDIDATES_SHA256,
    )
    _verify_link(authorities, "candidateManifest", CANDIDATES_RELATIVE_PATH, CANDIDATES_SHA256)
    _verify_link(authorities, "privateRawSchema", RAW_SCHEMA_RELATIVE_PATH, RAW_SCHEMA_SHA256)
    _verify_link(
        authorities,
        "contentSafeSummarySchema",
        SUMMARY_SCHEMA_RELATIVE_PATH,
        SUMMARY_SCHEMA_SHA256,
    )
    execution = _mapping(profile.get("executionPolicy"), "execution-policy")
    if tuple(_sequence(execution.get("candidateOrder"), "candidate-order")) != (
        ADMITTED_CANDIDATE_IDS
    ):
        raise _fail("candidate-order")
    if (
        execution.get("maximumNewEngineFullMatrixSurvivors") != 1
        or execution.get("automaticRetries") != 0
        or execution.get("remoteInferenceApis") != "forbidden"
        or execution.get("referenceAudio") != "forbidden"
    ):
        raise _fail("execution-policy")


def _verify_qwen_candidate(
    candidate: Mapping[str, object],
    *,
    candidate_id: str,
    speaker: str,
    native_language: str,
    evaluation_language: str,
    language_argument: str,
) -> None:
    if (
        candidate.get("candidateId") != candidate_id
        or candidate.get("intakeDecision") != "admitted-to-existing-engine-control-evaluation"
        or candidate.get("normalizationProfile") != "narration-bilingual-v2"
    ):
        raise _fail("candidate-identity")
    engine = _mapping(candidate.get("engine"), "candidate-engine")
    model = _mapping(candidate.get("model"), "candidate-model")
    lock = _mapping(candidate.get("dependencyLock"), "candidate-lock")
    voice = _mapping(candidate.get("voice"), "candidate-voice")
    generation = _mapping(candidate.get("generation"), "candidate-generation")
    offline = _mapping(candidate.get("offline"), "candidate-offline")
    if (
        engine.get("name") != "qwen-tts"
        or engine.get("version") != "0.1.1"
        or engine.get("wheelSha256")
        != "11a290d8dabc7ef91a90c54478c8ab19b3edb1d85c0882313721892bdc4af15d"
        or engine.get("provider") != "pytorch-cuda"
        or engine.get("precision") != "bfloat16"
        or model.get("repository") != "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"
        or model.get("revision") != "0c0e3051f131929182e2c023b9537f8b1c68adfe"
        or lock.get("path") != QWEN_LOCK_RELATIVE_PATH.as_posix()
        or lock.get("sha256") != QWEN_LOCK_SHA256
        or voice.get("speaker") != speaker
        or voice.get("nativeLanguage") != native_language
        or voice.get("evaluationLanguage") != evaluation_language
        or voice.get("languageArgument") != language_argument
        or voice.get("personalReferenceAudioRequired") is not False
        or generation.get("batchSize") != 1
        or generation.get("maxNewTokens") != 2048
        or generation.get("temperature") != 0.9
        or generation.get("subtalkerTemperature") != 0.9
        or offline.get("localFilesOnly") is not True
        or offline.get("outboundFirewallBlock") != "exact-candidate-interpreter"
    ):
        raise _fail("candidate-configuration")


def _verify_candidate_manifest(candidates: Mapping[str, object]) -> None:
    if (
        candidates.get("candidateManifestVersion") != "tts-candidate-manifest-v8"
        or candidates.get("status") != "frozen-before-v8-results"
    ):
        raise _fail("candidate-manifest")
    supersedes = _mapping(candidates.get("supersedes"), "supersedes")
    base = _mapping(candidates.get("baseCandidates"), "base-candidates")
    if (
        supersedes.get("manifest") != v7_authority.CANDIDATES_RELATIVE_PATH.as_posix()
        or supersedes.get("sha256") != v7_authority.CANDIDATES_SHA256
        or supersedes.get("resultFilesPresentAtSupersession") != 0
        or base.get("path") != v7_authority.CANDIDATES_RELATIVE_PATH.as_posix()
        or base.get("sha256") != v7_authority.CANDIDATES_SHA256
        or tuple(_sequence(base.get("admittedCandidateIds"), "base-candidates"))
        != v7_authority.ADMITTED_CANDIDATE_IDS
        or base.get("rejectedCandidateId") != v7_authority.REJECTED_CANDIDATE_ID
    ):
        raise _fail("supersedes")
    added = tuple(
        _mapping(value, "candidate")
        for value in _sequence(candidates.get("addedCandidates"), "added-candidates")
    )
    if len(added) != 2 or tuple(entry.get("candidateId") for entry in added) != (
        ADDED_CANDIDATE_IDS
    ):
        raise _fail("candidate-identity")
    _verify_qwen_candidate(
        added[0],
        candidate_id=QWEN_SERENA_CANDIDATE_ID,
        speaker="Serena",
        native_language="Chinese",
        evaluation_language="es",
        language_argument="Spanish",
    )
    _verify_qwen_candidate(
        added[1],
        candidate_id=QWEN_AIDEN_CANDIDATE_ID,
        speaker="Aiden",
        native_language="English",
        evaluation_language="en",
        language_argument="English",
    )
    selection = _mapping(candidates.get("selectionPolicy"), "selection-policy")
    if (
        tuple(_sequence(selection.get("existingEngineControlOrder"), "candidate-order"))
        != ADDED_CANDIDATE_IDS
        or selection.get("qwenProfilesCountAsNewEngineSurvivors") is not False
        or selection.get("maximumNewEngineFullMatrixSurvivors") != 1
        or selection.get("automaticRetries") != 0
        or selection.get("referenceAudio") != "forbidden"
    ):
        raise _fail("selection-policy")
    excluded = {
        entry.get("candidateId"): entry.get("reasonCode")
        for entry in (
            _mapping(value, "excluded")
            for value in _sequence(candidates.get("excluded"), "excluded")
        )
    }
    if excluded != {
        "qwen3-tts-cloud-realtime": "remote-inference-violates-local-only-product-boundary",
        "qwen3-tts-1-7b-customvoice-cuda-bf16-ryan-en": (
            "bounded-v8-selects-one-native-english-qwen-voice"
        ),
        "qwen3-tts-1-7b-base-voice-cloning": "voice-cloning-outside-mvp",
        "qwen3-tts-1-7b-voicedesign": ("voice-design-outside-default-narrator-scope"),
    }:
        raise _fail("excluded")


def load_frozen_v8_authority(
    repository_root: Path,
    *,
    validate_schemas: bool = True,
) -> FrozenV8Authority:
    """Load and fail-closed validate the v7 base plus v8 amendment."""

    try:
        base = v7_authority.load_frozen_v7_authority(
            repository_root,
            validate_schemas=validate_schemas,
        )
    except v7_authority.V7AuthorityError as error:
        raise _fail("v7-base") from error
    _verify_file_hashes(repository_root)
    authority = FrozenV8Authority(
        base=base,
        profile=_load_object(repository_root / PROFILE_RELATIVE_PATH),
        candidates=_load_object(repository_root / CANDIDATES_RELATIVE_PATH),
        raw_schema=_load_object(repository_root / RAW_SCHEMA_RELATIVE_PATH),
        summary_schema=_load_object(repository_root / SUMMARY_SCHEMA_RELATIVE_PATH),
    )
    _verify_profile(authority.profile)
    _verify_candidate_manifest(authority.candidates)
    if validate_schemas:
        try:
            from jsonschema import Draft202012Validator

            Draft202012Validator.check_schema(cast(JsonSchema, authority.raw_schema))
            Draft202012Validator.check_schema(cast(JsonSchema, authority.summary_schema))
        except Exception as error:
            raise _fail("schema") from error
    return authority


def _git_is_strict_ancestor(repository_root: Path, ancestor: str, descendant: str) -> bool:
    completed = subprocess.run(
        ["git", "merge-base", "--is-ancestor", ancestor, descendant],
        cwd=repository_root,
        check=False,
        capture_output=True,
    )
    return ancestor != descendant and completed.returncode == 0


def _git_authority_tree_matches(repository_root: Path, commit: str) -> bool:
    if len(commit) != 40 or any(character not in "0123456789abcdef" for character in commit):
        return False
    for relative_path, expected in _all_authority_file_hashes().items():
        completed = subprocess.run(
            ["git", "show", f"{commit}:{relative_path.as_posix()}"],
            cwd=repository_root,
            check=False,
            capture_output=True,
        )
        if completed.returncode != 0 or _sha256_bytes(completed.stdout) != expected:
            return False
    return True


def _reject_private_content(value: object, authority: FrozenV8Authority) -> None:
    serialized = json.dumps(value, ensure_ascii=False, sort_keys=True)
    canaries = {
        cast(str, case.get("privacyCanary"))
        for case in (
            _mapping(item, "evaluation-case")
            for item in _sequence(
                authority.base.corpus.get("cases"),
                "evaluation-cases",
            )
        )
    }

    def walk(item: object) -> None:
        if isinstance(item, dict):
            for key, child in item.items():
                if key in v7_authority.FORBIDDEN_RESULT_KEYS:
                    raise _fail("private-content")
                walk(child)
        elif isinstance(item, list):
            for child in item:
                walk(child)

    walk(value)
    if any(canary in serialized for canary in canaries):
        raise _fail("private-content")


def _dependency_lock_for(candidate_id: object) -> str:
    if candidate_id in ADDED_CANDIDATE_IDS:
        return QWEN_LOCK_SHA256
    lock_by_base_candidate = {
        v7_authority.ADMITTED_CANDIDATE_IDS[0]: v7_authority.PIPER_LOCK_SHA256,
        v7_authority.ADMITTED_CANDIDATE_IDS[1]: v7_authority.CHATTERBOX_LOCK_SHA256,
        v7_authority.ADMITTED_CANDIDATE_IDS[2]: v7_authority.MOSS_LOCK_SHA256,
    }
    try:
        return lock_by_base_candidate[cast(str, candidate_id)]
    except KeyError as error:
        raise _fail("result-before-authority") from error


def _verify_result_authority(
    repository_root: Path,
    result: Mapping[str, object],
    *,
    ancestry_checker: Callable[[str, str], bool] | None,
    authority_tree_checker: Callable[[str], bool] | None,
) -> None:
    authority_commit = result.get("authorityCommitSha")
    execution_commit = result.get("executionCommitSha")
    candidate_id = result.get("candidateId")
    evaluation_stage = result.get("evaluationStage")
    languages = result.get("languagesEvaluated")
    if (
        result.get("profileSha256") != PROFILE_SHA256
        or result.get("corpusSha256") != v7_authority.CORPUS_SHA256
        or result.get("candidateManifestSha256") != CANDIDATES_SHA256
        or candidate_id not in ADMITTED_CANDIDATE_IDS
        or result.get("dependencyLockSha256") != _dependency_lock_for(candidate_id)
        or not isinstance(authority_commit, str)
        or not isinstance(execution_commit, str)
        or authority_commit == execution_commit
        or evaluation_stage not in EXPECTED_STAGES[candidate_id]
        or not isinstance(languages, list)
        or tuple(languages) != EXPECTED_LANGUAGES[candidate_id]
    ):
        raise _fail("result-before-authority")
    tree_check = authority_tree_checker or (
        lambda commit: _git_authority_tree_matches(repository_root, commit)
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


def _validate_result(
    repository_root: Path,
    value: object,
    *,
    summary: bool,
    ancestry_checker: Callable[[str, str], bool] | None,
    authority_tree_checker: Callable[[str], bool] | None,
) -> None:
    from jsonschema import Draft202012Validator

    authority = load_frozen_v8_authority(repository_root)
    result = _mapping(value, "result")
    schema = authority.summary_schema if summary else authority.raw_schema
    errors = sorted(
        Draft202012Validator(cast(JsonSchema, schema)).iter_errors(value),
        key=lambda error: tuple(str(part) for part in error.absolute_path),
    )
    if errors:
        raise _fail("result-schema")
    _reject_private_content(value, authority)
    _verify_result_authority(
        repository_root,
        result,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )


def validate_v8_raw_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
    authority_tree_checker: Callable[[str], bool] | None = None,
) -> None:
    """Validate one private raw result against frozen v8 authority."""

    _validate_result(
        repository_root,
        value,
        summary=False,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )


def validate_v8_summary_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
    authority_tree_checker: Callable[[str], bool] | None = None,
) -> None:
    """Validate one content-safe result against frozen v8 authority."""

    _validate_result(
        repository_root,
        value,
        summary=True,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )
