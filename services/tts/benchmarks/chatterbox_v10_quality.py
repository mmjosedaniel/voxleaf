"""Disposable bilingual quality review for corrected Chatterbox CUDA v10."""

from __future__ import annotations

import hashlib
import html
import json
import os
import secrets
import shutil
import subprocess
import sys
import wave
from collections.abc import Mapping, Sequence, Sized
from contextlib import suppress
from pathlib import Path
from typing import Any, Final, NoReturn, cast

from benchmarks.adapters.corrective_v9 import (
    ChatterboxV9Adapter,
    ChatterboxV9Configuration,
    load_chatterbox_v10_profile,
)
from benchmarks.contracts import GenerationRequest
from benchmarks.diagnostics import DiagnosticCapture
from benchmarks.harness import load_bilingual_corpus
from benchmarks.preflight import WindowsFirewallNetworkProbe
from benchmarks.v10_authority import CANDIDATE_ID

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
RAW_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "raw" / "v10"
CHATTERBOX_ENVIRONMENT: Final = Path(
    "services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v3"
)
CHATTERBOX_ARTIFACT_ROOT: Final = Path("models/chatterbox_multilingual_v3_v2")
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v7.json"
DIMENSIONS: Final = (
    "intelligibility",
    "naturalness",
    "prosody",
    "pronunciation",
    "language-stability",
    "overall-usefulness",
)
MAXIMUM_RESULT_BYTES: Final = 128 * 1024
MAXIMUM_AUDIO_SECONDS: Final = 120
MAXIMUM_SESSION_AUDIO_BYTES: Final = 256 * 1024 * 1024


class ChatterboxV10QualityError(RuntimeError):
    """Fixed content-free quality-workflow failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-chatterbox-v10-quality:{code}")
        self.code = code


def _fail(code: str) -> NoReturn:
    raise ChatterboxV10QualityError(code)


def _mapping(value: object) -> Mapping[str, object]:
    if not isinstance(value, dict):
        _fail("result")
    return cast(Mapping[str, object], value)


def _session(candidate_id: str, session_id: str) -> Path:
    if len(session_id) != 32 or any(value not in "0123456789abcdef" for value in session_id):
        _fail("session")
    root = RAW_ROOT.resolve()
    session = (root / candidate_id / session_id).resolve()
    try:
        relative = session.relative_to(root)
    except ValueError:
        _fail("session")
    if len(relative.parts) != 2 or not session.is_dir():
        _fail("session")
    return session


def _read(path: Path, maximum_bytes: int = MAXIMUM_RESULT_BYTES) -> dict[str, object]:
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
    path.write_bytes(payload)


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
        pcm = numpy.rint(numpy.clip(samples, -1.0, 1.0) * 32767.0).astype("<i2", copy=False)
        with wave.open(str(path), "wb") as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(sample_rate_hz)
            output.writeframes(cast(bytes, pcm.tobytes(order="C")))
    except ChatterboxV10QualityError:
        raise
    except Exception:
        _fail("invalid-audio")


def _render_html(
    *,
    candidate_id: str,
    session_id: str,
    samples: Sequence[Mapping[str, str]],
) -> str:
    scorecard = {
        "schemaVersion": "tts-bilingual-quality-scorecard-v10",
        "sessionId": session_id,
        "candidateId": candidate_id,
        "evaluatorCount": 1,
        "blindOrder": True,
        "samples": [
            {
                "sampleId": sample["sampleId"],
                "language": sample["language"],
                "scores": {dimension: None for dimension in DIMENSIONS},
                "meaningChangingDefect": None,
                "wrongLanguage": None,
            }
            for sample in samples
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
<title>VoxLeaf corrective bilingual TTS quality review</title>
<style>
body{{font:16px system-ui;max-width:1050px;margin:2rem auto;padding:0 1rem}}
article{{border:1px solid #aaa;border-radius:8px;padding:1rem;margin:1rem 0}}
.scores{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.7rem}}
label{{display:flex;flex-direction:column;gap:.25rem}}button{{font-size:1rem;padding:.75rem}}
</style>
<h1>Corrective bilingual TTS quality review</h1>
<p>Score the audio from 1 (unusable) to 5 (excellent). This form measures
evidence only; it does not accept or reject the model.</p>
{cards}
<button id="export">Validate and download result</button>
<script>
const card={payload};
const dimensions={dimensions};
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
 link.download=`v10-quality-result-${{card.sessionId}}.json`;link.click();
 URL.revokeObjectURL(link.href);
}});
</script>
</html>
"""


def _candidate_configuration(
    candidate_id: str,
) -> tuple[
    ChatterboxV9Adapter,
    ChatterboxV9Configuration,
    Path,
]:
    if candidate_id == CANDIDATE_ID:
        chatterbox_profile = load_chatterbox_v10_profile(REPOSITORY_ROOT)
        chatterbox_configuration = ChatterboxV9Configuration(
            REPOSITORY_ROOT / CHATTERBOX_ARTIFACT_ROOT
        )
        return (
            ChatterboxV9Adapter(chatterbox_profile, chatterbox_configuration),
            chatterbox_configuration,
            REPOSITORY_ROOT / CHATTERBOX_ENVIRONMENT / ".venv" / "Scripts/python.exe",
        )
    _fail("candidate")


def generate_quality_session(
    *,
    candidate_id: str,
    expected_commit_sha: str,
    machine_session_id: str,
) -> dict[str, object]:
    """Generate ten private bilingual samples without making a candidate decision."""

    session = _session(candidate_id, machine_session_id)
    raw_path = session / "machine.raw.json"
    raw = _read(raw_path, 256 * 1024)
    if (
        raw.get("schemaVersion") != "tts-bilingual-raw-v10"
        or raw.get("candidateId") != candidate_id
        or raw.get("executionCommitSha") != expected_commit_sha
        or raw.get("status") != "measured-awaiting-decision"
        or _mapping(raw.get("decision")).get("state") != "pending-maintainer-decision"
    ):
        _fail("machine")
    try:
        commit = subprocess.run(
            ("git", "rev-parse", "HEAD"),
            cwd=REPOSITORY_ROOT,
            check=True,
            capture_output=True,
            text=True,
            timeout=20,
        ).stdout.strip()
    except (OSError, subprocess.SubprocessError):
        _fail("repository")
    adapter, configuration, candidate_python = _candidate_configuration(candidate_id)
    if (
        commit != expected_commit_sha
        or Path(sys.executable).resolve() != candidate_python.resolve(strict=True)
        or os.environ.get("HF_HUB_OFFLINE") != "1"
        or os.environ.get("TRANSFORMERS_OFFLINE") != "1"
        or not WindowsFirewallNetworkProbe().active(candidate_python)
    ):
        _fail("preflight")
    quality = session / "quality"
    if quality.exists():
        _fail("quality-exists")
    audio_root = quality / "audio"
    audio_root.mkdir(parents=True)
    corpora = tuple(load_bilingual_corpus(CORPUS_PATH, language) for language in ("es", "en"))
    cases = tuple(
        (language, corpus.cases[case_id])
        for language, corpus in zip(("es", "en"), corpora, strict=True)
        for case_id in corpus.performance_order
    )
    sample_ids = [secrets.token_hex(16) for _ in cases]
    secrets.SystemRandom().shuffle(sample_ids)
    samples: list[dict[str, str]] = []
    sensitive = (
        *(value for _language, case in cases for value in (case.text, case.privacy_canary)),
        str(configuration.artifact_root),
        str(candidate_python),
    )
    capture = DiagnosticCapture(forbidden_values=sensitive)
    try:
        with capture:
            adapter.load()
            for index, ((language, case), sample_id) in enumerate(
                zip(cases, sample_ids, strict=True),
                start=1,
            ):
                waveform, sample_rate = adapter.synthesize_for_quality(
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
    if sum(path.stat().st_size for path in audio_root.glob("*.wav")) > (
        MAXIMUM_SESSION_AUDIO_BYTES
    ):
        shutil.rmtree(quality, ignore_errors=True)
        _fail("audio-limit")
    _write_json(
        quality / "private-map.json",
        {
            "schemaVersion": "tts-bilingual-quality-private-v10",
            "sessionId": machine_session_id,
            "candidateId": candidate_id,
            "blindOrder": True,
            "machineRawSha256": hashlib.sha256(raw_path.read_bytes()).hexdigest(),
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
            session_id=machine_session_id,
            samples=samples,
        ),
        encoding="utf-8",
    )
    return {
        "status": "quality-ready-awaiting-maintainer-review",
        "candidateId": candidate_id,
        "sessionId": machine_session_id,
        "sampleCount": len(samples),
        "evaluatorPath": evaluator.relative_to(REPOSITORY_ROOT).as_posix(),
        "decisionState": "pending-maintainer-decision",
        "rejectionRecorded": False,
    }
