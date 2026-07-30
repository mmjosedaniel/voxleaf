"""Disposable blinded English quality review for the frozen v8 Piper baseline."""

from __future__ import annotations

import hashlib
import html
import json
import secrets
import shutil
import statistics
import wave
from collections.abc import Mapping, Sequence, Sized
from contextlib import suppress
from pathlib import Path
from typing import Any, Final, NoReturn, cast

from benchmarks.adapters.piper_english import (
    PIPER_ENGLISH_CANDIDATE_ID,
    PiperEnglishAdapter,
)
from benchmarks.bilingual_baseline import (
    CORPUS_PATH,
    RAW_ROOT,
    REPOSITORY_ROOT,
    BaselinePreflightReceipt,
)
from benchmarks.contracts import GenerationRequest
from benchmarks.diagnostics import DiagnosticCapture
from benchmarks.harness import load_bilingual_corpus

DIMENSIONS: Final = (
    "intelligibility",
    "naturalness",
    "prosody",
    "pronunciation",
    "language-stability",
    "overall-usefulness",
)
SESSION_ID_LENGTH: Final = 32
SAMPLE_ID_LENGTH: Final = 32
MAXIMUM_RESULT_BYTES: Final = 64 * 1024
MAXIMUM_AUDIO_SECONDS: Final = 120
MAXIMUM_SESSION_AUDIO_BYTES: Final = 128 * 1024 * 1024


class BilingualQualityError(RuntimeError):
    """Fixed content-free quality workflow failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-bilingual-quality:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise BilingualQualityError(code)


def _session_path(session_id: str) -> Path:
    if len(session_id) != SESSION_ID_LENGTH or any(
        character not in "0123456789abcdef" for character in session_id
    ):
        _fail("session")
    root = RAW_ROOT.resolve()
    session = (root / PIPER_ENGLISH_CANDIDATE_ID / session_id).resolve()
    try:
        relative = session.relative_to(root)
    except ValueError:
        _fail("session")
    if len(relative.parts) != 2 or not session.is_dir():
        _fail("session")
    return session


def _mapping(value: object, code: str = "result") -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail(code)
    return cast(Mapping[str, object], value)


def _sequence(value: object, code: str = "result") -> Sequence[object]:
    if not isinstance(value, list):
        _fail(code)
    return cast(Sequence[object], value)


def _read_mapping(path: Path, *, maximum_bytes: int = MAXIMUM_RESULT_BYTES) -> dict[str, object]:
    try:
        payload = path.read_bytes()
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
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_bytes(payload)
    temporary.replace(path)


def _write_wave(path: Path, waveform: Sized, sample_rate_hz: int) -> None:
    try:
        numpy = cast(Any, __import__("numpy"))
        samples = numpy.asarray(waveform, dtype=numpy.float32).reshape(-1)
        sample_count = int(samples.size)
        if (
            sample_rate_hz != 24_000
            or sample_count <= 0
            or sample_count > sample_rate_hz * MAXIMUM_AUDIO_SECONDS
            or not bool(numpy.isfinite(samples).all())
        ):
            _fail("invalid-audio")
        pcm = numpy.rint(numpy.clip(samples, -1.0, 1.0) * 32767.0).astype(
            "<i2",
            copy=False,
        )
        payload = cast(bytes, pcm.tobytes(order="C"))
        with wave.open(str(path), "wb") as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(sample_rate_hz)
            output.setnframes(sample_count)
            output.writeframes(payload)
    except BilingualQualityError:
        raise
    except Exception:
        _fail("invalid-audio")


def _render_evaluator_html(
    *,
    session_id: str,
    samples: Sequence[Mapping[str, str]],
) -> str:
    scorecard = {
        "schemaVersion": "tts-bilingual-quality-scorecard-v8",
        "sessionId": session_id,
        "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
        "language": "en",
        "evaluatorCount": 1,
        "blindOrder": True,
        "samples": [
            {
                "sampleId": sample["sampleId"],
                "scores": {dimension: None for dimension in DIMENSIONS},
                "meaningChangingDefect": None,
                "wrongLanguage": None,
            }
            for sample in samples
        ],
    }
    cards = "\n".join(
        f"""<article data-sample="{html.escape(sample["sampleId"])}">
<h2>Sample {index + 1}</h2>
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
<title>VoxLeaf blinded English TTS quality review</title>
<style>
body{{font:16px system-ui;max-width:1050px;margin:2rem auto;padding:0 1rem}}
article{{border:1px solid #aaa;border-radius:8px;padding:1rem;margin:1rem 0}}
.scores{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.7rem}}
label{{display:flex;flex-direction:column;gap:.25rem}}button{{font-size:1rem;padding:.75rem}}
</style>
<h1>Blinded English TTS quality review</h1>
<p>Listen once or twice. Score every dimension from 1 (unusable) to 5 (excellent).
Judge the audio, not the engine. Export only after all fields are complete.</p>
{cards}
<button id="export">Validate and download result</button>
<script>
const card={payload};
const dimensions={dimensions};
const labels={{
 "intelligibility":"Intelligibility","naturalness":"Naturalness",
 "prosody":"Prosody","pronunciation":"Pronunciation",
 "language-stability":"English language stability",
 "overall-usefulness":"Overall audiobook usefulness"
}};
for(const article of document.querySelectorAll("article")){{
 const sample=card.samples.find(item=>item.sampleId===article.dataset.sample);
 const root=article.querySelector(".scores");
 for(const dimension of dimensions){{
  const label=document.createElement("label");label.textContent=labels[dimension];
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
 link.download=`piper-english-quality-result-${{card.sessionId}}.json`;link.click();
 URL.revokeObjectURL(link.href);
}});
</script>
</html>
"""


def _machine_passed(session: Path, expected_commit_sha: str) -> bool:
    raw_path = session / "machine.raw.json"
    raw = _read_mapping(raw_path, maximum_bytes=262_144)
    marker = _read_mapping(session / "machine.validated.json")
    return (
        raw.get("schemaVersion") == "tts-bilingual-raw-v8"
        and raw.get("candidateId") == PIPER_ENGLISH_CANDIDATE_ID
        and raw.get("executionCommitSha") == expected_commit_sha
        and raw.get("status") == "complete"
        and raw.get("failures") == []
        and marker.get("schemaVersion") == "tts-bilingual-machine-validation-v8"
        and marker.get("executionCommitSha") == expected_commit_sha
        and marker.get("rawSha256") == hashlib.sha256(raw_path.read_bytes()).hexdigest()
    )


def generate_quality_session(
    receipt: BaselinePreflightReceipt,
    *,
    machine_session_id: str,
) -> dict[str, object]:
    """Generate five disposable randomized English samples after machine admission."""

    if not receipt.eligible:
        _fail("preflight")
    session = _session_path(machine_session_id)
    if not _machine_passed(session, receipt.expected_commit_sha):
        _fail("machine-not-admitted")
    if (session / "quality").exists():
        _fail("quality-exists")
    corpus = load_bilingual_corpus(CORPUS_PATH, "en")
    quality = session / "quality"
    audio_root = quality / "audio"
    audio_root.mkdir(parents=True)
    sample_ids = [secrets.token_hex(16) for _ in corpus.performance_order]
    secrets.SystemRandom().shuffle(sample_ids)
    samples: list[dict[str, str]] = []
    adapter = PiperEnglishAdapter(receipt.profile, receipt.configuration)
    sensitive_values = (
        *(value for case in corpus.cases.values() for value in (case.text, case.privacy_canary)),
        str(receipt.configuration.artifact_root),
        str(receipt.candidate_python),
    )
    capture = DiagnosticCapture(forbidden_values=sensitive_values)
    try:
        with capture:
            adapter.load()
            for index, case_id in enumerate(corpus.performance_order):
                case = corpus.cases[case_id]
                sample_id = sample_ids[index]
                waveform, sample_rate_hz = adapter.synthesize_for_quality(
                    GenerationRequest(
                        request_id=f"quality-{index + 1}",
                        case_id=case.case_id,
                        phase="warm",
                        text=case.text,
                        language="en",
                    )
                )
                _write_wave(audio_root / f"{sample_id}.wav", waveform, sample_rate_hz)
                samples.append(
                    {
                        "sampleId": sample_id,
                        "caseId": case.case_id,
                        "text": case.text,
                    }
                )
                del waveform
    except Exception:
        shutil.rmtree(quality, ignore_errors=True)
        raise
    finally:
        with suppress(Exception):
            adapter.close()
    observation = capture.observation()
    capture.discard()
    if observation.sensitive_value_observed:
        shutil.rmtree(quality, ignore_errors=True)
        _fail("privacy")
    total_audio_bytes = sum(path.stat().st_size for path in audio_root.glob("*.wav"))
    if total_audio_bytes > MAXIMUM_SESSION_AUDIO_BYTES:
        shutil.rmtree(quality, ignore_errors=True)
        _fail("audio-limit")
    _write_json(
        quality / "private-map.json",
        {
            "schemaVersion": "tts-bilingual-quality-private-v8",
            "sessionId": machine_session_id,
            "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
            "language": "en",
            "blindOrder": True,
            "samples": [
                {"sampleId": item["sampleId"], "caseId": item["caseId"]} for item in samples
            ],
        },
    )
    evaluator = quality / "piper-english-evaluator.html"
    evaluator.write_text(
        _render_evaluator_html(session_id=machine_session_id, samples=samples),
        encoding="utf-8",
    )
    return {
        "status": "pass",
        "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
        "sessionId": machine_session_id,
        "sampleCount": len(samples),
        "evaluatorPath": evaluator.relative_to(REPOSITORY_ROOT).as_posix(),
    }


def finalize_quality_session(
    *,
    machine_session_id: str,
    result_path: Path,
) -> dict[str, object]:
    """Validate one evaluator export and retain only its private aggregate."""

    session = _session_path(machine_session_id)
    quality = session / "quality"
    private_map = _read_mapping(quality / "private-map.json")
    result = _read_mapping(result_path)
    expected_samples = {
        cast(str, item["sampleId"])
        for item in (
            _mapping(value) for value in _sequence(private_map.get("samples"), "private-map")
        )
    }
    raw_samples = _sequence(result.get("samples"))
    if (
        result.get("schemaVersion") != "tts-bilingual-quality-scorecard-v8"
        or result.get("sessionId") != machine_session_id
        or result.get("candidateId") != PIPER_ENGLISH_CANDIDATE_ID
        or result.get("language") != "en"
        or result.get("evaluatorCount") != 1
        or result.get("blindOrder") is not True
        or len(raw_samples) != 5
    ):
        _fail("result")
    dimension_values: dict[str, list[float]] = {dimension: [] for dimension in DIMENSIONS}
    defects = 0
    wrong_language = 0
    observed_samples: set[str] = set()
    for value in raw_samples:
        sample = _mapping(value)
        sample_id = sample.get("sampleId")
        scores = _mapping(sample.get("scores"))
        if (
            not isinstance(sample_id, str)
            or sample_id in observed_samples
            or set(scores) != set(DIMENSIONS)
            or not isinstance(sample.get("meaningChangingDefect"), bool)
            or not isinstance(sample.get("wrongLanguage"), bool)
        ):
            _fail("result")
        observed_samples.add(sample_id)
        for dimension in DIMENSIONS:
            score = scores[dimension]
            if (
                not isinstance(score, (int, float))
                or isinstance(score, bool)
                or not 1 <= float(score) <= 5
            ):
                _fail("result")
            dimension_values[dimension].append(float(score))
        defects += int(sample["meaningChangingDefect"] is True)
        wrong_language += int(sample["wrongLanguage"] is True)
    if observed_samples != expected_samples:
        _fail("result")
    aggregate = {
        "schemaVersion": "tts-bilingual-quality-aggregate-v8",
        "sessionId": machine_session_id,
        "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
        "language": "en",
        "evaluatorCount": 1,
        "blindOrder": True,
        "sampleCount": 5,
        "dimensionMeans": {
            dimension: statistics.fmean(values) for dimension, values in dimension_values.items()
        },
        "meaningChangingDefects": defects,
        "wrongLanguageOutputs": wrong_language,
    }
    _write_json(quality / "quality.aggregate.json", aggregate)
    try:
        result_path.unlink()
    except OSError:
        _fail("result-cleanup")
    return {
        "status": "pass",
        "candidateId": PIPER_ENGLISH_CANDIDATE_ID,
        "sessionId": machine_session_id,
        "sampleCount": 5,
        "privateResultRemoved": True,
    }
