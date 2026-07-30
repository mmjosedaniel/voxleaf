"""Content-safe derivation and private cleanup for corrective candidate screens."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Final, NoReturn, cast

from jsonschema import Draft202012Validator

from benchmarks.metrics import distribution
from benchmarks.preflight import GitRepositoryProbe
from benchmarks.v9_authority import (
    MOSS_CANDIDATE_ID,
    load_frozen_v9_authority,
    validate_v9_summary_result,
)
from benchmarks.v11_authority import (
    CANDIDATE_ID as CHATTERBOX_CANDIDATE_ID,
)
from benchmarks.v11_authority import (
    load_frozen_v11_authority,
    validate_v11_summary_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
DIMENSIONS: Final = (
    "intelligibility",
    "naturalness",
    "prosody",
    "pronunciation",
    "language-stability",
    "overall-usefulness",
)
MAXIMUM_JSON_BYTES: Final = 512 * 1024


class CandidateScreenResultError(RuntimeError):
    """Fixed content-free result derivation failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-candidate-screen-result:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise CandidateScreenResultError(code)


@dataclass(frozen=True)
class ScreenResultSpec:
    candidate_id: str
    schema_version: str
    quality_schema_version: str
    private_map_schema_version: str
    raw_root: Path
    session_id: str
    scorecard_name: str
    result_path: Path
    limitations: tuple[str, ...]


MOSS_SPEC: Final = ScreenResultSpec(
    candidate_id=MOSS_CANDIDATE_ID,
    schema_version="tts-bilingual-summary-v9",
    quality_schema_version="tts-bilingual-quality-scorecard-v9",
    private_map_schema_version="tts-bilingual-quality-private-v9",
    raw_root=REPOSITORY_ROOT / "benchmarks/tts/raw/v9",
    session_id="855ae90b0bff4b0bbbc0b17404e04059",
    scorecard_name="v9-quality-result-855ae90b0bff4b0bbbc0b17404e04059.json",
    result_path=REPOSITORY_ROOT / "benchmarks/tts/moss-bilingual-screen-result-v9.json",
    limitations=(
        "single-fluent-bilingual-maintainer",
        "synthetic-ten-case-corpus",
        "official-bundled-ava-voice-only",
        "dialogue-tail-omission-reported-in-both-languages",
        "accent-not-preferred-by-maintainer",
        "distribution-obligations-deferred-to-m011",
    ),
)
CHATTERBOX_SPEC: Final = ScreenResultSpec(
    candidate_id=CHATTERBOX_CANDIDATE_ID,
    schema_version="tts-bilingual-summary-v11",
    quality_schema_version="tts-bilingual-quality-scorecard-v11",
    private_map_schema_version="tts-bilingual-quality-private-v11",
    raw_root=REPOSITORY_ROOT / "benchmarks/tts/raw/v11",
    session_id="bb26f18325be404a883df8f164a25aea",
    scorecard_name="v11-quality-result-bb26f18325be404a883df8f164a25aea.json",
    result_path=REPOSITORY_ROOT / "benchmarks/tts/chatterbox-bilingual-screen-result-v11.json",
    limitations=(
        "single-fluent-bilingual-maintainer",
        "synthetic-ten-case-corpus",
        "official-bundled-default-voice-only",
        "cross-language-accent-observed",
        "native-speaking-rate-control-unavailable",
        "experimental-torch-dependency-override",
        "distribution-obligations-deferred-to-m011",
    ),
)
SPECS: Final = (MOSS_SPEC, CHATTERBOX_SPEC)


def _mapping(value: object, code: str = "result") -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str = "result") -> Sequence[object]:
    if not isinstance(value, list):
        _fail(code)
    return cast(Sequence[object], value)


def _integer(value: object, code: str = "result") -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        _fail(code)
    return value


def _read(path: Path) -> Mapping[str, object]:
    try:
        payload = path.read_bytes()
        if len(payload) > MAXIMUM_JSON_BYTES:
            _fail("result-size")
        value = cast(object, json.loads(payload))
    except (OSError, UnicodeError, json.JSONDecodeError):
        _fail("result")
    return _mapping(value)


def _session(spec: ScreenResultSpec) -> Path:
    root = spec.raw_root.resolve()
    session = (root / spec.candidate_id / spec.session_id).resolve()
    try:
        relative = session.relative_to(root)
    except ValueError:
        _fail("session")
    if (
        len(relative.parts) != 2
        or len(spec.session_id) != 32
        or any(character not in "0123456789abcdef" for character in spec.session_id)
        or not session.is_dir()
    ):
        _fail("session")
    return session


def _scorecard_path(spec: ScreenResultSpec) -> Path:
    path = (REPOSITORY_ROOT / spec.scorecard_name).resolve()
    try:
        relative = path.relative_to(REPOSITORY_ROOT.resolve())
    except ValueError:
        _fail("scorecard")
    if len(relative.parts) != 1 or path.name != spec.scorecard_name or not path.is_file():
        _fail("scorecard")
    return path


def _only_expected_scorecards_are_untracked() -> bool:
    expected = {f"?? {spec.scorecard_name}" for spec in SPECS}
    try:
        status = subprocess.run(
            ("git", "status", "--porcelain=v1", "--untracked-files=all"),
            cwd=REPOSITORY_ROOT,
            check=True,
            capture_output=True,
            text=True,
            timeout=10,
        ).stdout
    except (OSError, subprocess.SubprocessError):
        return False
    return set(status.splitlines()) == expected


def _validate_private_review(
    spec: ScreenResultSpec,
    *,
    raw_path: Path,
    private_map: Mapping[str, object],
    scorecard: Mapping[str, object],
) -> dict[str, object]:
    if (
        private_map.get("schemaVersion") != spec.private_map_schema_version
        or private_map.get("sessionId") != spec.session_id
        or private_map.get("candidateId") != spec.candidate_id
        or private_map.get("blindOrder") is not True
        or private_map.get("machineRawSha256") != hashlib.sha256(raw_path.read_bytes()).hexdigest()
        or scorecard.get("schemaVersion") != spec.quality_schema_version
        or scorecard.get("sessionId") != spec.session_id
        or scorecard.get("candidateId") != spec.candidate_id
        or scorecard.get("evaluatorCount") != 1
        or scorecard.get("blindOrder") is not True
    ):
        _fail("quality")
    expected_samples = {
        (
            _mapping(value, "quality").get("sampleId"),
            _mapping(value, "quality").get("language"),
        )
        for value in _sequence(private_map.get("samples"), "quality")
    }
    raw_samples = tuple(
        _mapping(value, "quality") for value in _sequence(scorecard.get("samples"), "quality")
    )
    actual_samples = {(sample.get("sampleId"), sample.get("language")) for sample in raw_samples}
    if len(raw_samples) != 10 or len(expected_samples) != 10 or actual_samples != expected_samples:
        _fail("quality")
    dimension_values: dict[str, list[int]] = {dimension: [] for dimension in DIMENSIONS}
    defects = 0
    wrong_language = 0
    for sample in raw_samples:
        scores = _mapping(sample.get("scores"), "quality")
        if set(scores) != set(DIMENSIONS):
            _fail("quality")
        for dimension in DIMENSIONS:
            score = _integer(scores.get(dimension), "quality")
            if not 1 <= score <= 5:
                _fail("quality")
            dimension_values[dimension].append(score)
        if not isinstance(sample.get("meaningChangingDefect"), bool) or not isinstance(
            sample.get("wrongLanguage"), bool
        ):
            _fail("quality")
        defects += sample.get("meaningChangingDefect") is True
        wrong_language += sample.get("wrongLanguage") is True
    return {
        "evaluatorCount": 1,
        "sampleCount": len(raw_samples),
        "dimensionMeans": {
            dimension: sum(values) / len(values) for dimension, values in dimension_values.items()
        },
        "meaningChangingDefects": defects,
        "wrongLanguageOutputs": wrong_language,
    }


def _p95(values: Sequence[float]) -> float:
    if not values:
        _fail("observations")
    return distribution(tuple(values)).p95


def _rtf(attempt: Mapping[str, object]) -> float:
    samples = _integer(attempt.get("sampleCount"))
    sample_rate = _integer(attempt.get("sampleRateHz"))
    wall_ns = _integer(attempt.get("wallNanoseconds"))
    if samples <= 0 or sample_rate <= 0 or wall_ns < 0:
        _fail("observations")
    return (wall_ns / 1_000_000_000) / (samples / sample_rate)


def build_content_safe_summary(
    spec: ScreenResultSpec,
    raw: Mapping[str, object],
    *,
    validate_authority: bool = True,
) -> dict[str, object]:
    """Derive only fields admitted by the frozen v9/v11 summary schemas."""

    attempts = tuple(_mapping(value) for value in _sequence(raw.get("attempts")))
    cancellations = tuple(_mapping(value) for value in _sequence(raw.get("cancellationTrials")))
    languages = tuple(cast(str, value) for value in _sequence(raw.get("languagesEvaluated")))
    performance: list[dict[str, object]] = []
    for language in languages:
        values = tuple(value for value in attempts if value.get("language") == language)
        performance.append(
            {
                "language": language,
                "firstAudioP95Seconds": _p95(
                    [
                        _integer(value.get("firstAudioNanoseconds")) / 1_000_000_000
                        for value in values
                    ]
                ),
                "warmP95Rtf": _p95([_rtf(value) for value in values]),
            }
        )
    audits = _mapping(raw.get("audits"))
    summary = {
        "schemaVersion": spec.schema_version,
        "candidateId": spec.candidate_id,
        "authorityCommitSha": raw.get("authorityCommitSha"),
        "executionCommitSha": raw.get("executionCommitSha"),
        "profileSha256": raw.get("profileSha256"),
        "corpusSha256": raw.get("corpusSha256"),
        "candidateManifestSha256": raw.get("candidateManifestSha256"),
        "dependencyLockSha256": raw.get("dependencyLockSha256"),
        "status": raw.get("status"),
        "languagesEvaluated": list(languages),
        "counts": {
            "attempted": len(attempts),
            "completed": sum(value.get("status") == "complete" for value in attempts),
            "failed": sum(value.get("status") != "complete" for value in attempts),
            "cancellationTrials": len(cancellations),
        },
        "performanceByLanguage": performance,
        "memory": raw.get("memory"),
        "cancellation": {
            "requiredTrials": 4 * len(languages),
            "passedTrials": sum(value.get("passed") is True for value in cancellations),
        },
        "qualityByLanguage": [
            {"language": language, "status": "reviewed-awaiting-decision"} for language in languages
        ],
        "audits": {
            "artifacts": audits.get("artifacts") is True,
            "offline": audits.get("offline") is True,
            "networkIsolation": audits.get("networkIsolation") is True,
            "privacy": audits.get("privacy") is True,
            "boundedRetention": audits.get("boundedRetention") is True,
            "cleanup": True,
        },
        "observations": list(_sequence(raw.get("observations"))),
        "decision": {
            "state": "pending-maintainer-decision",
            "rejectionRecorded": False,
        },
        "limitations": list(spec.limitations),
    }
    if validate_authority:
        if spec is MOSS_SPEC:
            validate_v9_summary_result(REPOSITORY_ROOT, summary)
        else:
            validate_v11_summary_result(REPOSITORY_ROOT, summary)
    return summary


def _validated_summary_and_quality(
    spec: ScreenResultSpec,
) -> tuple[dict[str, object], dict[str, object], Path, Path]:
    session = _session(spec)
    raw_path = session / "machine.raw.json"
    raw = _read(raw_path)
    private_map = _read(session / "quality/private-map.json")
    scorecard_path = _scorecard_path(spec)
    scorecard = _read(scorecard_path)
    if raw.get("candidateId") != spec.candidate_id:
        _fail("authority")
    authority = (
        load_frozen_v9_authority(REPOSITORY_ROOT)
        if spec is MOSS_SPEC
        else load_frozen_v11_authority(REPOSITORY_ROOT)
    )
    if tuple(Draft202012Validator(authority.raw_schema).iter_errors(raw)):
        _fail("raw-schema")
    quality = _validate_private_review(
        spec,
        raw_path=raw_path,
        private_map=private_map,
        scorecard=scorecard,
    )
    return build_content_safe_summary(spec, raw), quality, session, scorecard_path


def derive_and_cleanup_screen_results(
    *,
    expected_commit_sha: str,
) -> dict[str, object]:
    """Validate both reviews, remove private state, and write public summaries."""

    repository = GitRepositoryProbe().snapshot(REPOSITORY_ROOT)
    if (
        repository.commit_sha != expected_commit_sha
        or not _only_expected_scorecards_are_untracked()
        or any(spec.result_path.exists() for spec in SPECS)
    ):
        _fail("state")
    prepared = tuple((spec, *_validated_summary_and_quality(spec)) for spec in SPECS)
    payloads = {
        spec.result_path: (
            json.dumps(summary, ensure_ascii=True, indent=2, sort_keys=True) + "\n"
        ).encode("utf-8")
        for spec, summary, _quality, _session_path, _scorecard_path in prepared
    }
    for _spec, _summary, _quality, session, scorecard_path in prepared:
        shutil.rmtree(session)
        scorecard_path.unlink()
        if session.exists() or scorecard_path.exists():
            _fail("cleanup")
    for path, payload in payloads.items():
        try:
            path.write_bytes(payload)
        except OSError:
            _fail("result-write")
        if path.read_bytes() != payload:
            _fail("result-write")
    return {
        "status": "pass",
        "privateSessionsRemoved": True,
        "privateScorecardsRemoved": True,
        "results": [
            {
                "candidateId": spec.candidate_id,
                "resultPath": spec.result_path.relative_to(REPOSITORY_ROOT).as_posix(),
                "quality": quality,
            }
            for spec, _summary, quality, _session, _scorecard in prepared
        ],
    }
