"""Result-blind validation for the frozen bilingual v7 authority."""

from __future__ import annotations

import hashlib
import json
import subprocess
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Final, cast

PROFILE_RELATIVE_PATH: Final = Path("benchmarks/tts/profile-v7.json")
CANDIDATES_RELATIVE_PATH: Final = Path("benchmarks/tts/candidates-v7.json")
NORMALIZATION_CORPUS_RELATIVE_PATH: Final = Path("benchmarks/tts/normalization-corpus-v2.json")
CORPUS_RELATIVE_PATH: Final = Path("benchmarks/tts/corpus-v7.json")
RAW_SCHEMA_RELATIVE_PATH: Final = Path("benchmarks/tts/schemas/bilingual-raw-v7.schema.json")
SUMMARY_SCHEMA_RELATIVE_PATH: Final = Path(
    "benchmarks/tts/schemas/bilingual-summary-v7.schema.json"
)
PROFILE_SHA256: Final = "aa524172b817c1748b2085066a7ada69c48a9f8b097da749b3b40ff14b9d99ef"
CANDIDATES_SHA256: Final = "1c8b4591782c298d0af19ae91037eb6154e372f32d1c005d6a8dfdfe47bc0f53"
NORMALIZATION_CORPUS_SHA256: Final = (
    "7eb569b5c885e91f6fe8b250aa1c2a73be1642db70265530c62634cff691018a"
)
CORPUS_SHA256: Final = "cc140a35688dc0dff7e8c50a5355e920bd2847aa9deac2f7e6256160fb9afcfe"
RAW_SCHEMA_SHA256: Final = "3fa093853fc520e9652e7ae9f439bd930e2de9b526630d9fb796b6ca60e44ce1"
SUMMARY_SCHEMA_SHA256: Final = "e2f14996912c35b4563df59f2ba9e03e08233af0c4f84796a27bbc9cdbfed7a3"
PIPER_LOCK_RELATIVE_PATH: Final = Path("services/tts/benchmarks/candidates/piper_1_4_2_cpu/uv.lock")
CHATTERBOX_LOCK_RELATIVE_PATH: Final = Path(
    "services/tts/benchmarks/candidates/chatterbox_multilingual_v3/uv.lock"
)
MOSS_LOCK_RELATIVE_PATH: Final = Path(
    "services/tts/benchmarks/candidates/moss_tts_nano_100m_onnx_cpu/uv.lock"
)
PIPER_LOCK_SHA256: Final = "542bf0064d80b20b9cfe599b0ac0a39488d25dbfb73a50e65aac1985c643cd82"
CHATTERBOX_LOCK_SHA256: Final = "1fd89055fa3f603b0ee2613b40a263af8682de91f71275b5cd5f917c6f72ff00"
MOSS_LOCK_SHA256: Final = "49d96b6b5121320290ba951be4a8a343f3380c2fc320182d6003b1dcf0d47bcb"
ADMITTED_CANDIDATE_IDS: Final = (
    "piper-1-4-2-onnx-cpu-en-us-joe-medium-v1",
    "chatterbox-multilingual-v3-cuda-bf16-default-v1",
    "moss-tts-nano-100m-onnx-cpu-ava-v1",
)
REJECTED_CANDIDATE_ID: Final = "fun-cosyvoice3-0-5b-2512-v1"
FORBIDDEN_RESULT_KEYS: Final = frozenset(
    {
        "source",
        "sourceText",
        "narrationText",
        "text",
        "privacyCanary",
        "generatedAudio",
        "waveform",
        "waveformBytes",
        "modelPath",
        "userPath",
        "commandLine",
        "environment",
        "environmentValue",
        "exception",
        "exceptionMessage",
        "scorecard",
        "randomizationKey",
        "evaluatorIdentity",
        "privateIdentity",
    }
)
type JsonSchema = bool | Mapping[str, Any]


class V7AuthorityError(ValueError):
    """A fixed, content-free v7 authority failure."""


@dataclass(frozen=True)
class FrozenV7Authority:
    profile: Mapping[str, object]
    candidates: Mapping[str, object]
    normalization_corpus: Mapping[str, object]
    corpus: Mapping[str, object]
    raw_schema: Mapping[str, object]
    summary_schema: Mapping[str, object]


def _fail(code: str) -> V7AuthorityError:
    return V7AuthorityError(f"tts-benchmark-v7-authority:{code}")


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


def _expected_file_hashes() -> Mapping[Path, str]:
    return {
        PROFILE_RELATIVE_PATH: PROFILE_SHA256,
        CANDIDATES_RELATIVE_PATH: CANDIDATES_SHA256,
        NORMALIZATION_CORPUS_RELATIVE_PATH: NORMALIZATION_CORPUS_SHA256,
        CORPUS_RELATIVE_PATH: CORPUS_SHA256,
        RAW_SCHEMA_RELATIVE_PATH: RAW_SCHEMA_SHA256,
        SUMMARY_SCHEMA_RELATIVE_PATH: SUMMARY_SCHEMA_SHA256,
        PIPER_LOCK_RELATIVE_PATH: PIPER_LOCK_SHA256,
        CHATTERBOX_LOCK_RELATIVE_PATH: CHATTERBOX_LOCK_SHA256,
        MOSS_LOCK_RELATIVE_PATH: MOSS_LOCK_SHA256,
    }


def _verify_file_hashes(repository_root: Path) -> None:
    if any(
        _sha256(repository_root / relative_path) != expected
        for relative_path, expected in _expected_file_hashes().items()
    ):
        raise _fail("authority-drift")


def _verify_authority_links(profile: Mapping[str, object]) -> None:
    authorities = _mapping(profile.get("authorities"), "authority-links")
    expected = {
        "normalizationCorpus": (
            NORMALIZATION_CORPUS_RELATIVE_PATH.as_posix(),
            NORMALIZATION_CORPUS_SHA256,
        ),
        "evaluationCorpus": (CORPUS_RELATIVE_PATH.as_posix(), CORPUS_SHA256),
        "candidateManifest": (
            CANDIDATES_RELATIVE_PATH.as_posix(),
            CANDIDATES_SHA256,
        ),
        "privateRawSchema": (
            RAW_SCHEMA_RELATIVE_PATH.as_posix(),
            RAW_SCHEMA_SHA256,
        ),
        "contentSafeSummarySchema": (
            SUMMARY_SCHEMA_RELATIVE_PATH.as_posix(),
            SUMMARY_SCHEMA_SHA256,
        ),
    }
    for name, (path, digest) in expected.items():
        link = _mapping(authorities.get(name), "authority-links")
        if link.get("path") != path or link.get("sha256") != digest:
            raise _fail("authority-links")


def _verify_candidate_manifest(candidates: Mapping[str, object]) -> None:
    entries = tuple(
        _mapping(value, "candidate")
        for value in _sequence(candidates.get("candidates"), "candidates")
    )
    if len(entries) != 4:
        raise _fail("candidates")
    by_id = {entry.get("candidateId"): entry for entry in entries}
    if set(by_id) != {*ADMITTED_CANDIDATE_IDS, REJECTED_CANDIDATE_ID}:
        raise _fail("candidate-identity")
    expected_locks = {
        ADMITTED_CANDIDATE_IDS[0]: (
            PIPER_LOCK_RELATIVE_PATH.as_posix(),
            PIPER_LOCK_SHA256,
        ),
        ADMITTED_CANDIDATE_IDS[1]: (
            CHATTERBOX_LOCK_RELATIVE_PATH.as_posix(),
            CHATTERBOX_LOCK_SHA256,
        ),
        ADMITTED_CANDIDATE_IDS[2]: (
            MOSS_LOCK_RELATIVE_PATH.as_posix(),
            MOSS_LOCK_SHA256,
        ),
    }
    for candidate_id, (path, digest) in expected_locks.items():
        candidate = by_id[candidate_id]
        lock = _mapping(candidate.get("dependencyLock"), "candidate-lock")
        if lock.get("path") != path or lock.get("sha256") != digest:
            raise _fail("candidate-lock")
        if candidate.get("intakeDecision") not in {
            "admitted-to-baseline-evaluation",
            "admitted-to-bounded-screen",
        }:
            raise _fail("candidate-decision")
    rejected = by_id[REJECTED_CANDIDATE_ID]
    if (
        rejected.get("intakeDecision") != "rejected-before-environment-lock"
        or rejected.get("dependencyLock") is not None
        or rejected.get("stopReason")
        != (
            "documented-general-path-requires-reference-audio-and-no-exact-"
            "non-personal-default-voice-was-frozen"
        )
    ):
        raise _fail("candidate-decision")


def _verify_counted_text(case: Mapping[str, object], field: str, prefix: str) -> None:
    value = case.get(field)
    if not isinstance(value, str) or not value:
        raise _fail("corpus-text")
    if case.get(f"{prefix}CodePointCount") != len(value) or case.get(
        f"{prefix}Utf8ByteCount"
    ) != len(value.encode("utf-8")):
        raise _fail("corpus-count")


def _verify_normalization_corpus(corpus: Mapping[str, object]) -> None:
    cases = tuple(
        _mapping(value, "normalization-case")
        for value in _sequence(corpus.get("cases"), "normalization-cases")
    )
    if len(cases) != 16:
        raise _fail("normalization-cases")
    identifiers: set[object] = set()
    languages: set[object] = set()
    for case in cases:
        identifier = case.get("caseId")
        if identifier in identifiers:
            raise _fail("normalization-case-identity")
        identifiers.add(identifier)
        languages.add(case.get("language"))
        _verify_counted_text(case, "source", "Source")
        _verify_counted_text(case, "expected", "Expected")
    if languages != {"es", "en"}:
        raise _fail("normalization-languages")


def _verify_evaluation_corpus(corpus: Mapping[str, object]) -> None:
    cases = tuple(
        _mapping(value, "evaluation-case")
        for value in _sequence(corpus.get("cases"), "evaluation-cases")
    )
    if len(cases) != 10:
        raise _fail("evaluation-cases")
    identifiers: set[object] = set()
    languages: list[object] = []
    for case in cases:
        identifier = case.get("caseId")
        if identifier in identifiers:
            raise _fail("evaluation-case-identity")
        identifiers.add(identifier)
        languages.append(case.get("language"))
        _verify_counted_text(case, "text", "")
        canary = case.get("privacyCanary")
        if not isinstance(canary, str) or not canary.startswith("tts-v7-canary-"):
            raise _fail("privacy-canary")
    if languages.count("es") != 5 or languages.count("en") != 5:
        raise _fail("evaluation-languages")
    order = _sequence(corpus.get("performanceOrder"), "evaluation-order")
    if len(order) != len(identifiers) or set(order) != identifiers:
        raise _fail("evaluation-order")


def load_frozen_v7_authority(
    repository_root: Path,
    *,
    validate_schemas: bool = True,
) -> FrozenV7Authority:
    """Load and fail-closed validate the complete frozen v7 authority."""

    _verify_file_hashes(repository_root)
    authority = FrozenV7Authority(
        profile=_load_object(repository_root / PROFILE_RELATIVE_PATH),
        candidates=_load_object(repository_root / CANDIDATES_RELATIVE_PATH),
        normalization_corpus=_load_object(repository_root / NORMALIZATION_CORPUS_RELATIVE_PATH),
        corpus=_load_object(repository_root / CORPUS_RELATIVE_PATH),
        raw_schema=_load_object(repository_root / RAW_SCHEMA_RELATIVE_PATH),
        summary_schema=_load_object(repository_root / SUMMARY_SCHEMA_RELATIVE_PATH),
    )
    if (
        authority.profile.get("profileVersion") != "tts-bilingual-profile-v7"
        or authority.profile.get("status")
        != "frozen-before-v7-implementation-pilot-and-official-results"
    ):
        raise _fail("profile")
    _verify_authority_links(authority.profile)
    _verify_candidate_manifest(authority.candidates)
    _verify_normalization_corpus(authority.normalization_corpus)
    _verify_evaluation_corpus(authority.corpus)
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
    for relative_path, expected in _expected_file_hashes().items():
        completed = subprocess.run(
            ["git", "show", f"{commit}:{relative_path.as_posix()}"],
            cwd=repository_root,
            check=False,
            capture_output=True,
        )
        if completed.returncode != 0 or _sha256_bytes(completed.stdout) != expected:
            return False
    return True


def _reject_private_content(
    value: object,
    authority: FrozenV7Authority,
) -> None:
    serialized = json.dumps(value, ensure_ascii=False, sort_keys=True)
    canaries = {
        cast(str, case.get("privacyCanary"))
        for case in (
            _mapping(item, "evaluation-case")
            for item in _sequence(authority.corpus.get("cases"), "evaluation-cases")
        )
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
    if (
        result.get("profileSha256") != PROFILE_SHA256
        or result.get("corpusSha256") != CORPUS_SHA256
        or result.get("candidateManifestSha256") != CANDIDATES_SHA256
        or candidate_id not in ADMITTED_CANDIDATE_IDS
        or not isinstance(authority_commit, str)
        or not isinstance(execution_commit, str)
        or authority_commit == execution_commit
    ):
        raise _fail("result-before-authority")
    candidates = load_frozen_v7_authority(repository_root).candidates
    by_id = {
        candidate.get("candidateId"): candidate
        for candidate in (
            _mapping(value, "candidate")
            for value in _sequence(candidates.get("candidates"), "candidates")
        )
    }
    lock = _mapping(by_id[candidate_id].get("dependencyLock"), "candidate-lock")
    if result.get("dependencyLockSha256") != lock.get("sha256"):
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

    authority = load_frozen_v7_authority(repository_root)
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


def validate_v7_raw_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
    authority_tree_checker: Callable[[str], bool] | None = None,
) -> None:
    """Validate one private raw result against frozen v7 authority."""

    _validate_result(
        repository_root,
        value,
        summary=False,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )


def validate_v7_summary_result(
    repository_root: Path,
    value: object,
    *,
    ancestry_checker: Callable[[str, str], bool] | None = None,
    authority_tree_checker: Callable[[str], bool] | None = None,
) -> None:
    """Validate one content-safe result against frozen v7 authority."""

    _validate_result(
        repository_root,
        value,
        summary=True,
        ancestry_checker=ancestry_checker,
        authority_tree_checker=authority_tree_checker,
    )
