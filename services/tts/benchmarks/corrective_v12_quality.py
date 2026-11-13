"""Disposable private quality evidence and content-safe v12 derivation."""

from __future__ import annotations

import hashlib
import html
import json
import os
import secrets
import shutil
import statistics
import subprocess
import sys
import wave
from collections.abc import Mapping, Sequence, Sized
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Any, Final, NoReturn, cast

from benchmarks.adapters.corrective_v9 import (
    ChatterboxV9Adapter,
    ChatterboxV9Configuration,
    load_chatterbox_v11_profile,
)
from benchmarks.adapters.qwen_v8 import (
    QwenV8Adapter,
    QwenV8Configuration,
    load_qwen_v8_profile,
    verify_qwen_v8_artifacts,
)
from benchmarks.contracts import GenerationRequest
from benchmarks.diagnostics import DiagnosticCapture
from benchmarks.harness import load_bilingual_corpus
from benchmarks.metrics import distribution, real_time_factor
from benchmarks.preflight import WindowsFirewallNetworkProbe
from benchmarks.v7_authority import CORPUS_SHA256
from benchmarks.v8_authority import QWEN_LOCK_SHA256
from benchmarks.v11_authority import LOCK_SHA256
from benchmarks.v12_authority import (
    CANDIDATES_SHA256,
    CHATTERBOX_CANDIDATE_ID,
    PROFILE_SHA256,
    QWEN_CANDIDATE_IDS,
    QWEN_LANGUAGES,
    QWEN_MACHINE_RESULTS,
    git_authority_tree_matches,
    git_is_strict_ancestor,
    validate_v12_qwen_quality_result,
    validate_v12_raw_result,
    validate_v12_summary_result,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
RAW_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "raw" / "v12"
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v7.json"
CHATTERBOX_PYTHON: Final = REPOSITORY_ROOT / (
    "services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/.venv/Scripts/python.exe"
)
CHATTERBOX_ARTIFACT_ROOT: Final = REPOSITORY_ROOT / "models/chatterbox_multilingual_v3_v2"
QWEN_PYTHON: Final = REPOSITORY_ROOT / (
    "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe"
)
SERVICE_PYTHON: Final = REPOSITORY_ROOT / "services/tts/.venv/Scripts/python.exe"
QWEN_ARTIFACT_ROOT: Final = REPOSITORY_ROOT / "models/qwen3_1_7b_customvoice_cuda"
DIMENSIONS: Final = (
    "intelligibility",
    "naturalness",
    "prosody",
    "pronunciation",
    "language-stability",
    "overall-usefulness",
)
MAXIMUM_RESULT_BYTES: Final = 256 * 1024
MAXIMUM_AUDIO_SECONDS: Final = 120
MAXIMUM_SESSION_AUDIO_BYTES: Final = 384 * 1024 * 1024


class CorrectiveV12QualityError(RuntimeError):
    """Fixed content-free v12 private-quality workflow failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-corrective-v12-quality:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise CorrectiveV12QualityError(code)


def _mapping(value: object, code: str = "result") -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str = "result") -> Sequence[object]:
    if not isinstance(value, list):
        _fail(code)
    return cast(Sequence[object], value)


def _read(path: Path, maximum_bytes: int = MAXIMUM_RESULT_BYTES) -> dict[str, object]:
    try:
        with path.open("rb") as source:
            payload = source.read(maximum_bytes + 1)
        if len(payload) > maximum_bytes:
            _fail("result-size")
        value = cast(object, json.loads(payload))
    except (OSError, UnicodeError, json.JSONDecodeError):
        _fail("result")
    if not isinstance(value, dict):
        _fail("result")
    return cast(dict[str, object], value)


def _write_json(path: Path, value: Mapping[str, object]) -> None:
    payload = (json.dumps(value, ensure_ascii=True, indent=2, sort_keys=True) + "\n").encode(
        "utf-8"
    )
    if len(payload) > MAXIMUM_RESULT_BYTES:
        _fail("result-size")
    path.write_bytes(payload)


def _write_wave(path: Path, waveform: Sized, sample_rate_hz: int) -> None:
    try:
        numpy = cast(Any, __import__("numpy"))
        samples = numpy.asarray(waveform, dtype=numpy.float32).reshape(-1)
        if (
            sample_rate_hz != 24_000
            or int(samples.size) <= 0
            or int(samples.size) > sample_rate_hz * MAXIMUM_AUDIO_SECONDS
            or not bool(numpy.isfinite(samples).all())
        ):
            _fail("invalid-audio")
        pcm = numpy.rint(numpy.clip(samples, -1.0, 1.0) * 32767.0).astype(
            "<i2",
            copy=False,
        )
        with wave.open(str(path), "wb") as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(sample_rate_hz)
            output.writeframes(cast(bytes, pcm.tobytes(order="C")))
    except CorrectiveV12QualityError:
        raise
    except Exception:
        _fail("invalid-audio")


def _candidate_python(candidate_id: str) -> Path:
    if candidate_id == CHATTERBOX_CANDIDATE_ID:
        return CHATTERBOX_PYTHON
    if candidate_id in QWEN_CANDIDATE_IDS:
        return QWEN_PYTHON
    _fail("candidate")


def _languages(candidate_id: str) -> tuple[str, ...]:
    if candidate_id == CHATTERBOX_CANDIDATE_ID:
        return ("es", "en")
    if candidate_id in QWEN_CANDIDATE_IDS:
        return (QWEN_LANGUAGES[candidate_id],)
    _fail("candidate")


def _session(candidate_id: str, session_id: str, *, must_exist: bool = True) -> Path:
    if len(session_id) != 32 or any(value not in "0123456789abcdef" for value in session_id):
        _fail("session")
    root = RAW_ROOT.resolve()
    session = (root / candidate_id / session_id).resolve()
    try:
        relative = session.relative_to(root)
    except ValueError:
        _fail("session")
    if relative.parts != (candidate_id, session_id) or (must_exist and not session.is_dir()):
        _fail("session")
    return session


def _repository_ready(authority_commit_sha: str, execution_commit_sha: str) -> bool:
    try:
        status = subprocess.run(
            ("git", "status", "--porcelain"),
            cwd=REPOSITORY_ROOT,
            check=True,
            capture_output=True,
            text=True,
            timeout=20,
        ).stdout
        head = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=REPOSITORY_ROOT,
            check=True,
            capture_output=True,
            text=True,
            timeout=20,
        ).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        return False
    return (
        not status
        and head == execution_commit_sha
        and git_authority_tree_matches(REPOSITORY_ROOT, authority_commit_sha)
        and git_is_strict_ancestor(
            REPOSITORY_ROOT,
            authority_commit_sha,
            execution_commit_sha,
        )
    )


def validate_machine_session(candidate_id: str, session_id: str) -> dict[str, object]:
    """Validate the private machine result under the service dependency set."""

    if candidate_id != CHATTERBOX_CANDIDATE_ID:
        _fail("candidate")
    session = _session(candidate_id, session_id)
    raw = _read(session / "machine.raw.json")
    validate_v12_raw_result(REPOSITORY_ROOT, raw)
    if raw.get("status") != "measured-awaiting-decision":
        _fail("machine")
    return {
        "status": "valid",
        "candidateId": candidate_id,
        "sessionId": session_id,
    }


def _validate_machine_under_service(candidate_id: str, session_id: str) -> None:
    """Keep schema tooling out of the locked model-only candidate environment."""

    try:
        service_python = SERVICE_PYTHON.resolve(strict=True)
        completed = subprocess.run(
            (
                str(service_python),
                "-m",
                "benchmarks.corrective_v12_quality_cli",
                "validate-machine",
            ),
            cwd=REPOSITORY_ROOT / "services" / "tts",
            input=json.dumps(
                {
                    "candidateId": candidate_id,
                    "sessionId": session_id,
                },
                ensure_ascii=True,
                separators=(",", ":"),
            ),
            check=True,
            capture_output=True,
            text=True,
            timeout=30,
            env=os.environ.copy(),
        )
        value = cast(object, json.loads(completed.stdout))
    except (OSError, subprocess.SubprocessError, json.JSONDecodeError):
        _fail("machine-validation")
    if value != {
        "status": "valid",
        "candidateId": candidate_id,
        "sessionId": session_id,
    }:
        _fail("machine-validation")


def _adapter(
    candidate_id: str,
) -> tuple[object, Path, tuple[str, ...]]:
    if candidate_id == CHATTERBOX_CANDIDATE_ID:
        chatterbox_configuration = ChatterboxV9Configuration(CHATTERBOX_ARTIFACT_ROOT)
        return (
            ChatterboxV9Adapter(
                load_chatterbox_v11_profile(REPOSITORY_ROOT),
                chatterbox_configuration,
            ),
            chatterbox_configuration.artifact_root,
            ("es", "en"),
        )
    if candidate_id in QWEN_CANDIDATE_IDS:
        profile = load_qwen_v8_profile(REPOSITORY_ROOT, candidate_id)
        qwen_configuration = QwenV8Configuration(QWEN_ARTIFACT_ROOT)
        verify_qwen_v8_artifacts(profile, qwen_configuration)
        return (
            QwenV8Adapter(profile, qwen_configuration),
            qwen_configuration.artifact_root,
            (profile.language,),
        )
    _fail("candidate")


def _render_html(
    *,
    candidate_id: str,
    session_id: str,
    samples: Sequence[Mapping[str, str]],
) -> str:
    scorecard = {
        "schemaVersion": "tts-corrective-quality-scorecard-v12",
        "sessionId": session_id,
        "candidateId": candidate_id,
        "evaluatorCount": 1,
        "blindOrder": True,
        "samples": [
            {
                "sampleId": value["sampleId"],
                "language": value["language"],
                "scores": {dimension: None for dimension in DIMENSIONS},
                "meaningChangingDefect": None,
                "wrongLanguage": None,
            }
            for value in samples
        ],
    }
    cards = "\n".join(
        f"""<article data-sample="{html.escape(sample["sampleId"])}">
<h2>Sample {index + 1} ({html.escape(sample["language"])})</h2>
<p><strong>Expected synthetic text:</strong> {html.escape(sample["text"])}</p>
<audio controls preload="none" src="audio/{html.escape(sample["sampleId"])}.wav"></audio>
<div class="scores"></div>
</article>"""
        for index, sample in enumerate(samples)
    )
    payload = json.dumps(scorecard, ensure_ascii=True, separators=(",", ":"))
    dimensions = json.dumps(DIMENSIONS)
    return f"""<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>VoxLeaf v12 TTS quality review</title>
<style>
body{{font:16px system-ui;max-width:1050px;margin:2rem auto;padding:0 1rem}}
article{{border:1px solid #aaa;border-radius:8px;padding:1rem;margin:1rem 0}}
.scores{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.7rem}}
label{{display:flex;flex-direction:column;gap:.25rem}}button{{font-size:1rem;padding:.75rem}}
</style>
<h1>Corrective v12 TTS quality review</h1>
<p>Score every sample from 1 (unusable) to 5 (excellent). This form records
evidence only and does not accept or reject a profile.</p>
{cards}
<button id="export">Validate and download result</button>
<script>
const card={payload};const dimensions={dimensions};
for(const article of document.querySelectorAll("article")){{
 const sample=card.samples.find(item=>item.sampleId===article.dataset.sample);
 const root=article.querySelector(".scores");
 for(const dimension of dimensions){{
  const label=document.createElement("label");label.textContent=dimension;
  const select=document.createElement("select");select.dataset.dimension=dimension;
  select.innerHTML='<option value="">Select</option>'+
   [1,2,3,4,5].map(value=>`<option value="${{value}}">${{value}}</option>`).join("");
  label.append(select);root.append(label);
 }}
 for(const [field,labelText] of [
  ["meaningChangingDefect","Meaning-changing defect?"],
  ["wrongLanguage","Wrong-language output?"]
 ]){{
  const label=document.createElement("label");label.textContent=labelText;
  const select=document.createElement("select");select.dataset.boolean=field;
  select.innerHTML='<option value="">Select</option>'+
   '<option value="false">No</option><option value="true">Yes</option>';
  label.append(select);root.append(label);
 }}
}}
document.querySelector("#export").addEventListener("click",()=>{{
 let valid=true;
 for(const article of document.querySelectorAll("article")){{
  const sample=card.samples.find(item=>item.sampleId===article.dataset.sample);
  for(const select of article.querySelectorAll("[data-dimension]")){{
   if(!select.value)valid=false;
   sample.scores[select.dataset.dimension]=select.value?Number(select.value):null;
  }}
  for(const select of article.querySelectorAll("[data-boolean]")){{
   if(!select.value)valid=false;
   sample[select.dataset.boolean]=select.value?select.value==="true":null;
  }}
 }}
 if(!valid){{alert("Complete every field first.");return;}}
 const blob=new Blob([JSON.stringify(card,null,2)+"\\n"],{{type:"application/json"}});
 const link=document.createElement("a");link.href=URL.createObjectURL(blob);
 link.download=`v12-quality-result-${{card.sessionId}}.json`;link.click();
 URL.revokeObjectURL(link.href);
}});
</script>
</html>
"""


def generate_quality_session(
    *,
    candidate_id: str,
    authority_commit_sha: str,
    execution_commit_sha: str,
    machine_session_id: str | None,
) -> dict[str, object]:
    """Generate a bounded ignored review session under the candidate interpreter."""

    candidate_python = _candidate_python(candidate_id).resolve(strict=True)
    if (
        not _repository_ready(authority_commit_sha, execution_commit_sha)
        or Path(sys.executable).resolve() != candidate_python
        or os.environ.get("HF_HUB_OFFLINE") != "1"
        or os.environ.get("TRANSFORMERS_OFFLINE") != "1"
        or not WindowsFirewallNetworkProbe().active(candidate_python)
    ):
        _fail("preflight")
    if candidate_id == CHATTERBOX_CANDIDATE_ID:
        if machine_session_id is None:
            _fail("machine")
        session = _session(candidate_id, machine_session_id)
        _validate_machine_under_service(candidate_id, machine_session_id)
        session_id = machine_session_id
    else:
        if machine_session_id is not None:
            _fail("machine")
        session_id = secrets.token_hex(16)
        session = (RAW_ROOT / candidate_id / session_id).resolve()
        session.mkdir(parents=True)
    published_quality = session / "quality"
    try:
        if published_quality.exists():
            _fail("quality-exists")
        with TemporaryDirectory(
            prefix=".quality-", dir=session, ignore_cleanup_errors=True
        ) as staging:
            quality = Path(staging)
            sample_count = _generate_quality_files(
                candidate_id,
                candidate_python,
                authority_commit_sha,
                execution_commit_sha,
                session_id,
                quality,
            )
            if published_quality.exists():
                _fail("quality-exists")
            quality.rename(published_quality)
    except BaseException:
        if candidate_id != CHATTERBOX_CANDIDATE_ID:
            shutil.rmtree(session, ignore_errors=True)
        raise
    return {
        "status": "quality-ready-awaiting-maintainer-review",
        "candidateId": candidate_id,
        "sessionId": session_id,
        "sampleCount": sample_count,
        "evaluatorPath": (published_quality / "evaluator.html")
        .relative_to(REPOSITORY_ROOT)
        .as_posix(),
        "decisionState": "pending-maintainer-decision",
    }


def _generate_quality_files(
    candidate_id: str,
    candidate_python: Path,
    authority_commit_sha: str,
    execution_commit_sha: str,
    session_id: str,
    quality: Path,
) -> int:
    audio_root = quality / "audio"
    audio_root.mkdir(parents=True)
    adapter, artifact_root, languages = _adapter(candidate_id)
    corpora = tuple(load_bilingual_corpus(CORPUS_PATH, language) for language in languages)
    cases = tuple(
        (language, corpus.cases[case_id])
        for language, corpus in zip(languages, corpora, strict=True)
        for case_id in corpus.performance_order
    )
    sample_ids = [secrets.token_hex(16) for _ in cases]
    samples: list[dict[str, str]] = []
    sensitive = (
        *(value for _language, case in cases for value in (case.text, case.privacy_canary)),
        str(artifact_root),
        str(candidate_python),
    )
    capture = DiagnosticCapture(forbidden_values=sensitive)
    generation_completed = False
    try:
        with capture:
            cast(Any, adapter).load()
            for index, ((language, case), sample_id) in enumerate(
                zip(cases, sample_ids, strict=True),
                start=1,
            ):
                waveform, sample_rate = cast(Any, adapter).synthesize_for_quality(
                    GenerationRequest(
                        request_id=f"quality-{index}",
                        case_id=case.case_id,
                        phase="warm",
                        text=case.text,
                        language=language,
                    )
                )
                _write_wave(audio_root / f"{sample_id}.wav", waveform, sample_rate)
                samples.append(
                    {
                        "sampleId": sample_id,
                        "caseId": case.case_id,
                        "language": language,
                        "text": case.text,
                    }
                )
                del waveform
        generation_completed = True
    finally:
        try:
            cast(Any, adapter).close()
        except Exception:
            if generation_completed:
                _fail("cleanup")
    observation = capture.observation()
    capture.discard()
    if observation.sensitive_value_observed:
        _fail("privacy")
    if sum(path.stat().st_size for path in audio_root.glob("*.wav")) > (
        MAXIMUM_SESSION_AUDIO_BYTES
    ):
        _fail("audio-limit")
    secrets.SystemRandom().shuffle(samples)
    _write_json(
        quality / "private-map.json",
        {
            "schemaVersion": "tts-corrective-quality-private-v12",
            "sessionId": session_id,
            "candidateId": candidate_id,
            "authorityCommitSha": authority_commit_sha,
            "executionCommitSha": execution_commit_sha,
            "blindOrder": True,
            "samples": [
                {
                    "sampleId": sample["sampleId"],
                    "caseId": sample["caseId"],
                    "language": sample["language"],
                }
                for sample in samples
            ],
        },
    )
    evaluator = quality / "evaluator.html"
    evaluator.write_text(
        _render_html(
            candidate_id=candidate_id,
            session_id=session_id,
            samples=samples,
        ),
        encoding="utf-8",
    )
    return len(samples)


def _aggregate(
    *,
    candidate_id: str,
    session_id: str,
    result_path: Path,
) -> dict[str, object]:
    session = _session(candidate_id, session_id)
    quality = session / "quality"
    private_map = _read(quality / "private-map.json")
    result = _read(result_path)
    expected = {
        cast(str, sample["sampleId"]): cast(str, sample["language"])
        for sample in (
            _mapping(value) for value in _sequence(private_map.get("samples"), "private-map")
        )
    }
    raw_samples = _sequence(result.get("samples"))
    if (
        result.get("schemaVersion") != "tts-corrective-quality-scorecard-v12"
        or result.get("sessionId") != session_id
        or result.get("candidateId") != candidate_id
        or result.get("evaluatorCount") != 1
        or result.get("blindOrder") is not True
        or len(raw_samples) != len(expected)
    ):
        _fail("result")
    by_language: dict[str, dict[str, object]] = {}
    observed: set[str] = set()
    for language in _languages(candidate_id):
        by_language[language] = {
            "scores": {dimension: [] for dimension in DIMENSIONS},
            "meaningChangingDefects": 0,
            "wrongLanguageOutputs": 0,
            "sampleCount": 0,
        }
    for value in raw_samples:
        sample = _mapping(value)
        sample_id = sample.get("sampleId")
        language_value = sample.get("language")
        scores = _mapping(sample.get("scores"))
        if (
            not isinstance(sample_id, str)
            or sample_id in observed
            or not isinstance(language_value, str)
            or expected.get(sample_id) != language_value
            or set(scores) != set(DIMENSIONS)
            or not isinstance(sample.get("meaningChangingDefect"), bool)
            or not isinstance(sample.get("wrongLanguage"), bool)
        ):
            _fail("result")
        language = language_value
        observed.add(sample_id)
        target = by_language[language]
        target_scores = cast(dict[str, list[float]], target["scores"])
        for dimension in DIMENSIONS:
            score = scores[dimension]
            if (
                not isinstance(score, (int, float))
                or isinstance(score, bool)
                or not 1 <= float(score) <= 5
            ):
                _fail("result")
            target_scores[dimension].append(float(score))
        target["meaningChangingDefects"] = cast(int, target["meaningChangingDefects"]) + int(
            sample["meaningChangingDefect"] is True
        )
        target["wrongLanguageOutputs"] = cast(int, target["wrongLanguageOutputs"]) + int(
            sample["wrongLanguage"] is True
        )
        target["sampleCount"] = cast(int, target["sampleCount"]) + 1
    if observed != set(expected):
        _fail("result")
    aggregates = []
    for language, value in by_language.items():
        scores = cast(dict[str, list[float]], value["scores"])
        aggregates.append(
            {
                "language": language,
                "status": "reviewed-awaiting-decision",
                "sampleCount": value["sampleCount"],
                "dimensionMeans": {
                    dimension: statistics.fmean(scores[dimension]) for dimension in DIMENSIONS
                },
                "meaningChangingDefects": value["meaningChangingDefects"],
                "wrongLanguageOutputs": value["wrongLanguageOutputs"],
            }
        )
    aggregate = {
        "schemaVersion": "tts-corrective-quality-aggregate-v12",
        "sessionId": session_id,
        "candidateId": candidate_id,
        "authorityCommitSha": private_map["authorityCommitSha"],
        "executionCommitSha": private_map["executionCommitSha"],
        "evaluatorCount": 1,
        "blindOrder": True,
        "languages": aggregates,
    }
    _write_json(quality / "quality.aggregate.json", aggregate)
    return aggregate


def _performance(attempts: Sequence[Mapping[str, object]]) -> list[dict[str, object]]:
    output: list[dict[str, object]] = []
    for language in ("es", "en"):
        warm = tuple(
            value
            for value in attempts
            if value.get("language") == language and value.get("phase") == "warm"
        )
        sustained = tuple(
            value
            for value in attempts
            if value.get("language") == language and value.get("phase") == "sustained"
        )

        def rtf(value: Mapping[str, object]) -> float:
            return real_time_factor(
                cast(int, value["wallNanoseconds"]),
                cast(int, value["sampleCount"]),
                cast(int, value["sampleRateHz"]),
            )

        media = sum(
            cast(int, value["sampleCount"]) / cast(int, value["sampleRateHz"])
            for value in sustained
        )
        wall = sum(cast(int, value["wallNanoseconds"]) / 1_000_000_000 for value in sustained)
        output.append(
            {
                "language": language,
                "firstAudioP95Seconds": (
                    distribution(
                        tuple(
                            cast(int, value["firstAudioNanoseconds"]) / 1_000_000_000
                            for value in warm
                        )
                    ).p95
                    if warm
                    else None
                ),
                "warmP95Rtf": (
                    distribution(tuple(rtf(value) for value in warm)).p95 if warm else None
                ),
                "sustainedP95Rtf": (
                    distribution(tuple(rtf(value) for value in sustained)).p95
                    if sustained
                    else None
                ),
                "totalSustainedRtf": wall / media if media > 0 else None,
            }
        )
    return output


def _derive_summary(
    *,
    candidate_id: str,
    session_id: str,
    result_path: Path,
    session: Path,
) -> dict[str, object]:
    aggregate = _aggregate(
        candidate_id=candidate_id,
        session_id=session_id,
        result_path=result_path,
    )
    private_map = _read(session / "quality" / "private-map.json")
    qualities = cast(list[dict[str, object]], aggregate["languages"])
    audits = {
        "artifacts": True,
        "offline": True,
        "networkIsolation": True,
        "privacy": True,
        "boundedRetention": True,
        "cleanup": True,
    }
    if candidate_id == CHATTERBOX_CANDIDATE_ID:
        raw = _read(session / "machine.raw.json")
        validate_v12_raw_result(REPOSITORY_ROOT, raw)
        attempts = tuple(_mapping(value) for value in _sequence(raw.get("attempts")))
        cancellations = tuple(_mapping(value) for value in _sequence(raw.get("cancellationTrials")))
        summary: dict[str, object] = {
            "schemaVersion": "tts-bilingual-full-summary-v12",
            "candidateId": candidate_id,
            "authorityCommitSha": private_map["authorityCommitSha"],
            "executionCommitSha": private_map["executionCommitSha"],
            "profileSha256": PROFILE_SHA256,
            "corpusSha256": CORPUS_SHA256,
            "candidateManifestSha256": CANDIDATES_SHA256,
            "dependencyLockSha256": LOCK_SHA256,
            "status": raw["status"],
            "languagesEvaluated": ["es", "en"],
            "counts": {
                "coldLoads": len(cast(list[object], raw["loadObservations"])),
                "warmAttempts": sum(value.get("phase") == "warm" for value in attempts),
                "sustainedAttempts": sum(value.get("phase") == "sustained" for value in attempts),
                "failedAttempts": 0,
                "cancellationTrials": len(cancellations),
            },
            "performanceByLanguage": _performance(attempts),
            "memory": raw["memory"],
            "cancellation": {
                "requiredTrials": 8,
                "passedTrials": sum(value.get("passed") is True for value in cancellations),
                "staleUnits": sum(cast(int, value["staleUnits"]) for value in cancellations),
                "processesRemaining": sum(
                    cast(int, value["processesRemaining"]) for value in cancellations
                ),
            },
            "qualityByLanguage": qualities,
            "audits": audits,
            "observations": raw["observations"],
            "decision": {
                "state": "pending-maintainer-decision",
                "rejectionRecorded": False,
            },
            "limitations": [
                "single-fluent-bilingual-maintainer",
                "synthetic-ten-case-corpus",
                "official-bundled-default-voice-only",
                "cross-language-accent-observed-in-v11",
                "native-speaking-rate-control-unavailable",
                "experimental-torch-dependency-override",
                "distribution-obligations-deferred-to-m011",
            ],
        }
        validate_v12_summary_result(REPOSITORY_ROOT, summary)
    else:
        _machine_path, machine_sha = QWEN_MACHINE_RESULTS[candidate_id]
        quality = dict(qualities[0])
        quality.pop("language")
        summary = {
            "schemaVersion": "tts-quality-control-summary-v12",
            "candidateId": candidate_id,
            "evaluationStage": "independent-quality-only",
            "authorityCommitSha": private_map["authorityCommitSha"],
            "executionCommitSha": private_map["executionCommitSha"],
            "profileSha256": PROFILE_SHA256,
            "corpusSha256": CORPUS_SHA256,
            "candidateManifestSha256": CANDIDATES_SHA256,
            "dependencyLockSha256": QWEN_LOCK_SHA256,
            "machineEvidenceSha256": machine_sha,
            "language": QWEN_LANGUAGES[candidate_id],
            "quality": quality,
            "audits": audits,
            "decision": {
                "state": "pending-maintainer-decision",
                "rejectionRecorded": False,
            },
            "limitations": [
                "single-fluent-maintainer",
                "synthetic-five-case-corpus",
                "v8-machine-evidence-reused-without-reinterpretation",
                "complete-waveform-cancellation-limitation",
                "hardware-dependent-constrained-buffer-profile",
                "distribution-obligations-deferred-to-m011",
            ],
        }
        validate_v12_qwen_quality_result(REPOSITORY_ROOT, summary)
    return summary


def _file_identity(path: Path) -> list[int]:
    stat = path.stat(follow_symlinks=False)
    return [stat.st_dev, stat.st_ino]


def _scorecard_digest(path: Path) -> str:
    with path.open("rb") as source:
        data = source.read(MAXIMUM_RESULT_BYTES + 1)
    if len(data) > MAXIMUM_RESULT_BYTES:
        _fail("result-size")
    return hashlib.sha256(data).hexdigest()


def derive_and_cleanup(
    *,
    candidate_id: str,
    session_id: str,
    result_path: Path,
    output_path: Path,
) -> dict[str, object]:
    """Validate review, finish private cleanup, and publish the result."""

    _languages(candidate_id)
    session = _session(candidate_id, session_id, must_exist=False)
    output = output_path.resolve()
    if result_path.is_symlink():
        _fail("result")
    result_path = result_path.resolve()
    pending = session.with_name(f".{session_id}.pending.json")
    if pending.is_symlink():
        _fail("pending-cleanup")
    try:
        output.relative_to((REPOSITORY_ROOT / "benchmarks" / "tts").resolve())
        if (
            output.is_relative_to(session)
            or output in (result_path, pending)
            or result_path == pending
            or not output.parent.is_dir()
            or output.is_dir()
            or (output.exists() and result_path.exists() and output.samefile(result_path))
        ):
            _fail("output")
    except (OSError, ValueError):
        _fail("output")

    binding = {
        "candidateId": candidate_id,
        "sessionId": session_id,
        "resultPath": str(result_path),
        "outputPath": str(output),
    }
    if pending.exists():
        receipt = _read(pending)
        if receipt.get("binding") != binding:
            _fail("pending-cleanup")
        summary = _mapping(receipt.get("summary"))
        if candidate_id == CHATTERBOX_CANDIDATE_ID:
            validate_v12_summary_result(REPOSITORY_ROOT, summary)
        else:
            validate_v12_qwen_quality_result(REPOSITORY_ROOT, summary)
        if summary.get("candidateId") != candidate_id:
            _fail("pending-cleanup")
    else:
        if output.exists() or not session.is_dir():
            _fail("output")
        summary = _derive_summary(
            candidate_id=candidate_id,
            session_id=session_id,
            result_path=result_path,
            session=session,
        )
        receipt = {
            "binding": binding,
            "sessionIdentity": _file_identity(session),
            "resultIdentity": _file_identity(result_path),
            "resultSha256": _scorecard_digest(result_path),
            "summary": summary,
        }
        with TemporaryDirectory(prefix=".cleanup-", dir=session.parent) as staging:
            draft = Path(staging) / "pending.json"
            _write_json(draft, receipt)
            pending.hardlink_to(draft)

    if session.exists() and _file_identity(session) != receipt.get("sessionIdentity"):
        _fail("pending-cleanup")
    if result_path.exists() and (
        _file_identity(result_path) != receipt.get("resultIdentity")
        or _scorecard_digest(result_path) != receipt.get("resultSha256")
    ):
        _fail("pending-cleanup")
    with TemporaryDirectory(prefix=".quality-result-", dir=output.parent) as staging:
        draft = Path(staging) / "result.json"
        _write_json(draft, summary)
        if output.exists() and (
            session.exists() or result_path.exists() or _read(output) != summary
        ):
            _fail("output")
        if session.exists():
            shutil.rmtree(session)
        result_path.unlink(missing_ok=True)
        if session.exists() or result_path.exists():
            _fail("result-cleanup")
        if not output.exists():
            output.hardlink_to(draft)
    pending.unlink(missing_ok=True)
    return {
        "status": "derived-and-private-evidence-removed",
        "candidateId": candidate_id,
        "sessionId": session_id,
        "privateSessionRemoved": not session.exists(),
        "decisionState": "pending-maintainer-decision",
    }
