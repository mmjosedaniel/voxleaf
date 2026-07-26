"""Bounded disposable audio and blinded scoring for manual TTS quality review."""

from __future__ import annotations

import html
import importlib
import json
import math
import re
import secrets
import shutil
import statistics
import wave
from collections.abc import Callable, Mapping, MutableSequence, Sequence, Sized
from contextlib import suppress
from pathlib import Path
from typing import Any, Final, Protocol, cast

from benchmarks.adapters.factory import CandidateAdapterFactory
from benchmarks.adapters.manifest import (
    QWEN_CANDIDATE_ID,
    QWEN_V3_CANDIDATE_ID,
    SUPERTONIC_CANDIDATE_ID,
    CandidateProfile,
)
from benchmarks.contracts import GenerationRequest
from benchmarks.diagnostics import DiagnosticCapture
from benchmarks.harness import load_corpus
from benchmarks.preflight import PreflightRequest

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v1.json"
RAW_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "results" / "raw"
QUALITY_ROOT_NAME: Final = "quality-v2"
PROTOCOL_VERSION: Final = "tts-feasibility-profile-v2"
SESSION_VERSION: Final = "tts-quality-session-v1"
LEGACY_EXPECTED_CANDIDATES: Final = (QWEN_CANDIDATE_ID, SUPERTONIC_CANDIDATE_ID)
DIMENSIONS: Final = (
    "intelligibility",
    "spanishPronunciation",
    "punctuationDialogue",
    "numericExpressions",
    "foreignNames",
    "naturalness",
    "artifactFreedom",
)
MAXIMUM_EVALUATORS: Final = 8
MAXIMUM_AUDIO_SECONDS: Final = 120
MAXIMUM_SAMPLE_RATE_HZ: Final = 96_000
MAXIMUM_SESSION_AUDIO_BYTES: Final = 512 * 1024 * 1024
_SESSION_ID: Final = re.compile(r"^[a-f0-9]{32}$")
_SAMPLE_ID: Final = re.compile(r"^[a-f0-9]{32}$")
_EVALUATOR_ID: Final = re.compile(r"^evaluator-[0-9]{2}$")


class QualitySessionError(RuntimeError):
    """Fixed content-free quality-session failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-quality:{code}")
        self.code = code


class QualityAudioAdapter(Protocol):
    def load(self) -> None: ...

    def synthesize_for_quality(self, request: GenerationRequest) -> tuple[Sized, int]: ...

    def close(self) -> None: ...


type Shuffle = Callable[[MutableSequence[dict[str, str]]], None]
type IdFactory = Callable[[], str]


def _session_path(
    session_id: str,
    *,
    raw_root: Path = RAW_ROOT,
    must_exist: bool = False,
) -> Path:
    if _SESSION_ID.fullmatch(session_id) is None:
        raise QualitySessionError("invalid-session")
    root = (raw_root.resolve() / QUALITY_ROOT_NAME).resolve()
    session = (root / session_id).resolve()
    try:
        relative = session.relative_to(root)
    except ValueError:
        raise QualitySessionError("invalid-session") from None
    if len(relative.parts) != 1 or (must_exist and not session.is_dir()):
        raise QualitySessionError("invalid-session")
    return session


def _write_json(path: Path, value: Mapping[str, object]) -> None:
    payload = (json.dumps(value, ensure_ascii=True, indent=2, sort_keys=True) + "\n").encode(
        "utf-8"
    )
    if len(payload) > 262_144:
        raise QualitySessionError("metadata-limit")
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_bytes(payload)
    temporary.replace(path)


def _read_mapping(path: Path) -> dict[str, object]:
    try:
        value = cast(object, json.loads(path.read_text(encoding="utf-8")))
    except (OSError, json.JSONDecodeError):
        raise QualitySessionError("invalid-metadata") from None
    if not isinstance(value, dict):
        raise QualitySessionError("invalid-metadata")
    return cast(dict[str, object], value)


def _expected_candidates(profile: CandidateProfile) -> tuple[str, ...]:
    if profile.candidate_id == QWEN_V3_CANDIDATE_ID and profile.authority is not None:
        return (QWEN_V3_CANDIDATE_ID,)
    if profile.candidate_id in LEGACY_EXPECTED_CANDIDATES:
        return LEGACY_EXPECTED_CANDIDATES
    raise QualitySessionError("candidate-state")


def _new_session(session: Path, profile: CandidateProfile) -> dict[str, object]:
    session.mkdir(parents=True)
    expected = _expected_candidates(profile)
    protocol = (
        profile.authority.profile_version if profile.authority is not None else PROTOCOL_VERSION
    )
    value: dict[str, object] = {
        "sessionVersion": SESSION_VERSION,
        "protocolVersion": protocol,
        "corpusVersion": "tts-synthetic-corpus-v1",
        "state": "staging",
        "expectedCandidates": list(expected),
        "configurationIdentities": {
            profile.candidate_id: (
                profile.authority.configuration_identity_sha256
                if profile.authority is not None
                else "legacy-profile-v2"
            )
        },
        "candidateCommits": {},
    }
    _write_json(session / "session.json", value)
    return value


def _load_staging_session(session: Path) -> dict[str, object]:
    metadata = _read_mapping(session / "session.json")
    raw_expected = metadata.get("expectedCandidates")
    expected = tuple(raw_expected) if isinstance(raw_expected, list) else ()
    protocol = metadata.get("protocolVersion")
    if (
        metadata.get("sessionVersion") != SESSION_VERSION
        or (
            (protocol, expected)
            not in (
                (PROTOCOL_VERSION, LEGACY_EXPECTED_CANDIDATES),
                ("tts-feasibility-profile-v3", (QWEN_V3_CANDIDATE_ID,)),
            )
        )
        or metadata.get("corpusVersion") != "tts-synthetic-corpus-v1"
        or metadata.get("state") != "staging"
        or not isinstance(metadata.get("configurationIdentities"), dict)
        or not isinstance(metadata.get("candidateCommits"), dict)
    ):
        raise QualitySessionError("invalid-metadata")
    return metadata


def _pcm16_bytes(waveform: object, sample_rate_hz: int) -> tuple[bytes, int]:
    if (
        not isinstance(sample_rate_hz, int)
        or isinstance(sample_rate_hz, bool)
        or not 8_000 <= sample_rate_hz <= MAXIMUM_SAMPLE_RATE_HZ
    ):
        raise QualitySessionError("invalid-audio")
    numpy = cast(Any, importlib.import_module("numpy"))
    try:
        samples = numpy.asarray(waveform, dtype=numpy.float32).reshape(-1)
        sample_count = int(samples.size)
        if (
            sample_count <= 0
            or sample_count > sample_rate_hz * MAXIMUM_AUDIO_SECONDS
            or not bool(numpy.isfinite(samples).all())
        ):
            raise QualitySessionError("invalid-audio")
        pcm = numpy.rint(numpy.clip(samples, -1.0, 1.0) * 32767.0).astype(
            "<i2",
            copy=False,
        )
        payload = cast(bytes, pcm.tobytes(order="C"))
    except QualitySessionError:
        raise
    except Exception:
        raise QualitySessionError("invalid-audio") from None
    if len(payload) != sample_count * 2:
        raise QualitySessionError("invalid-audio")
    return payload, sample_count


def _write_wave(path: Path, waveform: object, sample_rate_hz: int) -> None:
    payload, sample_count = _pcm16_bytes(waveform, sample_rate_hz)
    try:
        with wave.open(str(path), "wb") as output:
            output.setnchannels(1)
            output.setsampwidth(2)
            output.setframerate(sample_rate_hz)
            output.setnframes(sample_count)
            output.writeframes(payload)
    except OSError:
        raise QualitySessionError("audio-write") from None


def generate_candidate_audio(
    request: PreflightRequest,
    session_id: str,
    *,
    raw_root: Path = RAW_ROOT,
    adapter_builder: Callable[[], QualityAudioAdapter] | None = None,
) -> dict[str, object]:
    """Generate one exact candidate's corpus into a known disposable session."""

    session = _session_path(session_id, raw_root=raw_root)
    try:
        metadata = (
            _load_staging_session(session)
            if session.exists()
            else _new_session(session, request.profile)
        )
        commits = cast(dict[str, object], metadata["candidateCommits"])
        candidate_id = request.profile.candidate_id
        expected = tuple(cast(list[str], metadata["expectedCandidates"]))
        expected_identity = (
            request.profile.authority.configuration_identity_sha256
            if request.profile.authority is not None
            else "legacy-profile-v2"
        )
        identities = cast(dict[str, object], metadata["configurationIdentities"])
        if (
            expected != _expected_candidates(request.profile)
            or candidate_id not in expected
            or candidate_id in commits
            or identities.get(candidate_id, expected_identity) != expected_identity
        ):
            raise QualitySessionError("candidate-state")
        identities[candidate_id] = expected_identity
        corpus = load_corpus(CORPUS_PATH)
        if len(corpus.performance_order) != len(corpus.cases) or set(
            corpus.performance_order
        ) != set(corpus.cases):
            raise QualitySessionError("corpus")
        candidate_root = session / "staging" / candidate_id
        candidate_root.mkdir(parents=True)
        sensitive_values = (
            *(
                value
                for case in corpus.cases.values()
                for value in (case.text, case.privacy_canary)
            ),
            str(request.configuration.artifact_root),
            str(request.candidate_python),
        )
        capture = DiagnosticCapture(forbidden_values=sensitive_values)
        adapter = (
            adapter_builder()
            if adapter_builder is not None
            else cast(
                QualityAudioAdapter,
                CandidateAdapterFactory(request.profile, request.configuration)(),
            )
        )
        with capture:
            try:
                adapter.load()
                for index, case_id in enumerate(corpus.performance_order):
                    case = corpus.cases[case_id]
                    waveform, sample_rate = adapter.synthesize_for_quality(
                        GenerationRequest(
                            request_id=f"quality-{index:02d}",
                            case_id=case_id,
                            phase="warm",
                            text=case.text,
                            language=case.language,
                        )
                    )
                    _write_wave(candidate_root / f"{case_id}.wav", waveform, sample_rate)
                    del waveform
            finally:
                with suppress(Exception):
                    adapter.close()
        observation = capture.observation()
        capture.discard()
        if observation.sensitive_value_observed:
            raise QualitySessionError("privacy")
        total_bytes = sum(path.stat().st_size for path in (session / "staging").rglob("*.wav"))
        if total_bytes > MAXIMUM_SESSION_AUDIO_BYTES:
            raise QualitySessionError("audio-limit")
        commits[candidate_id] = request.expected_commit_sha
        _write_json(session / "session.json", metadata)
        return {
            "status": "pass",
            "sessionId": session_id,
            "candidateId": candidate_id,
            "generatedSamples": len(corpus.performance_order),
            "readyForFinalization": set(commits) == set(expected),
        }
    except Exception as error:
        shutil.rmtree(session, ignore_errors=True)
        if isinstance(error, QualitySessionError):
            raise
        raise QualitySessionError("generation") from None


def _default_shuffle(values: MutableSequence[dict[str, str]]) -> None:
    secrets.SystemRandom().shuffle(values)


def _default_id() -> str:
    return secrets.token_hex(16)


def _scorecard(
    session_id: str,
    evaluator_id: str,
    samples: Sequence[Mapping[str, str]],
) -> dict[str, object]:
    return {
        "sessionId": session_id,
        "evaluatorId": evaluator_id,
        "samples": [
            {
                "sampleId": sample["sampleId"],
                "caseId": sample["caseId"],
                "scores": {dimension: None for dimension in DIMENSIONS},
                "meaningChangingDefect": None,
            }
            for sample in samples
        ],
    }


def _render_evaluator_html(
    evaluator_id: str,
    scorecard: Mapping[str, object],
) -> str:
    safe_id = html.escape(evaluator_id)
    payload = json.dumps(scorecard, ensure_ascii=True, separators=(",", ":"))
    dimensions = json.dumps(DIMENSIONS)
    return f"""<!doctype html>
<html lang="es">
<meta charset="utf-8">
<title>VoxLeaf blinded TTS quality — {safe_id}</title>
<style>
body{{font:16px system-ui;max-width:1100px;margin:2rem auto;padding:0 1rem}}
article{{border:1px solid #bbb;border-radius:8px;padding:1rem;margin:1rem 0}}
fieldset{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.6rem}}
label{{display:flex;flex-direction:column;gap:.25rem}} button{{font-size:1rem;padding:.7rem}}
</style>
<h1>Evaluación TTS a ciegas</h1>
<p>Escuche cada muestra. Puntúe 1–5 o “No aplica”. No intente identificar el motor.</p>
<main id="samples"></main>
<button id="export">Validar y descargar resultados</button>
<script>
const card={payload};
const dimensions={dimensions};
const labels={{
 intelligibility:"Inteligibilidad",spanishPronunciation:"Pronunciación y acento",
 punctuationDialogue:"Puntuación y diálogo",numericExpressions:"Números y fechas",
 foreignNames:"Nombres extranjeros",naturalness:"Naturalidad y prosodia",
 artifactFreedom:"Sin artefactos, repeticiones ni cortes"
}};
const root=document.querySelector("#samples");
for(const [index,sample] of card.samples.entries()){{
 const article=document.createElement("article");
 article.innerHTML=`<h2>${{index+1}}. ${{sample.caseId}}</h2>
 <audio controls preload="none" src="audio/${{sample.sampleId}}.wav"></audio><fieldset></fieldset>`;
 const fields=article.querySelector("fieldset");
 for(const dimension of dimensions){{
  const label=document.createElement("label"); label.textContent=labels[dimension];
  const select=document.createElement("select"); select.dataset.dimension=dimension;
  select.innerHTML='<option value="">Seleccione</option><option>not-applicable</option>'+
   [1,2,3,4,5].map(value=>`<option>${{value}}</option>`).join("");
  label.append(select); fields.append(label);
 }}
 const defect=document.createElement("label");
 defect.textContent="¿Defecto que cambia significado?";
 const defectSelect=document.createElement("select"); defectSelect.dataset.defect="true";
 defectSelect.innerHTML='<option value="">Seleccione</option>'+
  '<option value="false">No</option><option value="true">Sí</option>';
 defect.append(defectSelect); fields.append(defect); root.append(article);
}}
document.querySelector("#export").addEventListener("click",()=>{{
 const articles=[...document.querySelectorAll("article")];
 for(const [index,article] of articles.entries()){{
  for(const select of article.querySelectorAll("[data-dimension]")){{
   if(!select.value){{alert(`Falta una puntuación en la muestra ${{index+1}}.`);return;}}
   card.samples[index].scores[select.dataset.dimension]=select.value==="not-applicable"?
    "not-applicable":Number(select.value);
  }}
  const defect=article.querySelector("[data-defect]");
  if(!defect.value){{alert(`Falta indicar defectos en la muestra ${{index+1}}.`);return;}}
  card.samples[index].meaningChangingDefect=defect.value==="true";
 }}
 const blob=new Blob([JSON.stringify(card,null,2)+"\\n"],{{type:"application/json"}});
 const link=document.createElement("a"); link.href=URL.createObjectURL(blob);
 link.download="{safe_id}.completed.json"; link.click(); URL.revokeObjectURL(link.href);
}});
</script>
</html>
"""


def finalize_session(
    session_id: str,
    evaluator_count: int,
    *,
    raw_root: Path = RAW_ROOT,
    shuffle: Shuffle = _default_shuffle,
    id_factory: IdFactory = _default_id,
) -> dict[str, object]:
    if (
        not isinstance(evaluator_count, int)
        or isinstance(evaluator_count, bool)
        or not 1 <= evaluator_count <= MAXIMUM_EVALUATORS
    ):
        raise QualitySessionError("evaluator-count")
    session = _session_path(session_id, raw_root=raw_root, must_exist=True)
    metadata = _load_staging_session(session)
    commits = cast(dict[str, object], metadata["candidateCommits"])
    expected_candidates = tuple(cast(list[str], metadata["expectedCandidates"]))
    if set(commits) != set(expected_candidates):
        raise QualitySessionError("candidate-state")
    corpus = load_corpus(CORPUS_PATH)
    staging = session / "staging"
    audio = session / "audio"
    scorecards = session / "scorecards"
    audio.mkdir()
    scorecards.mkdir()
    key_samples: list[dict[str, str]] = []
    try:
        for candidate_id in expected_candidates:
            for case_id in corpus.performance_order:
                source = staging / candidate_id / f"{case_id}.wav"
                if not source.is_file():
                    raise QualitySessionError("incomplete-audio")
                sample_id = id_factory()
                if _SAMPLE_ID.fullmatch(sample_id) is None:
                    raise QualitySessionError("sample-id")
                target = audio / f"{sample_id}.wav"
                if target.exists():
                    raise QualitySessionError("sample-id")
                source.replace(target)
                key_samples.append(
                    {
                        "sampleId": sample_id,
                        "candidateId": candidate_id,
                        "caseId": case_id,
                    }
                )
        if len(key_samples) != len(expected_candidates) * len(corpus.performance_order):
            raise QualitySessionError("incomplete-audio")
        evaluator_ids: list[str] = []
        for index in range(evaluator_count):
            evaluator_id = f"evaluator-{index + 1:02d}"
            evaluator_ids.append(evaluator_id)
            order = [
                {"sampleId": item["sampleId"], "caseId": item["caseId"]} for item in key_samples
            ]
            shuffle(order)
            card = _scorecard(session_id, evaluator_id, order)
            _write_json(scorecards / f"{evaluator_id}.template.json", card)
            (session / f"{evaluator_id}.html").write_text(
                _render_evaluator_html(evaluator_id, card),
                encoding="utf-8",
                newline="\n",
            )
        _write_json(
            session / "randomization-key.json",
            {
                "sessionVersion": SESSION_VERSION,
                "sessionId": session_id,
                "samples": cast(list[object], key_samples),
            },
        )
        metadata["state"] = "ready"
        metadata["evaluatorIds"] = evaluator_ids
        metadata["sampleCount"] = len(key_samples)
        _write_json(session / "session.json", metadata)
        shutil.rmtree(staging)
    except Exception:
        shutil.rmtree(session, ignore_errors=True)
        raise
    return {
        "status": "pass",
        "sessionId": session_id,
        "evaluatorCount": evaluator_count,
        "sampleCount": len(key_samples),
        "eligibleForPromotion": evaluator_count >= 3,
    }


def _score(value: object) -> int | str:
    if value == "not-applicable":
        return "not-applicable"
    if isinstance(value, int) and not isinstance(value, bool) and 1 <= value <= 5:
        return value
    raise QualitySessionError("invalid-scorecard")


def submit_scorecard(
    session_id: str,
    value: object,
    *,
    raw_root: Path = RAW_ROOT,
) -> dict[str, object]:
    session = _session_path(session_id, raw_root=raw_root, must_exist=True)
    metadata = _read_mapping(session / "session.json")
    if metadata.get("state") != "ready" or not isinstance(value, dict):
        raise QualitySessionError("invalid-scorecard")
    card = cast(dict[str, object], value)
    evaluator_id = card.get("evaluatorId")
    evaluator_ids = metadata.get("evaluatorIds")
    if (
        card.get("sessionId") != session_id
        or not isinstance(evaluator_id, str)
        or _EVALUATOR_ID.fullmatch(evaluator_id) is None
        or not isinstance(evaluator_ids, list)
        or evaluator_id not in evaluator_ids
        or not isinstance(card.get("samples"), list)
    ):
        raise QualitySessionError("invalid-scorecard")
    template = _read_mapping(
        session / "scorecards" / f"{evaluator_id}.template.json",
    )
    template_samples = cast(list[object], template.get("samples"))
    samples = cast(list[object], card["samples"])
    if len(samples) != len(template_samples):
        raise QualitySessionError("invalid-scorecard")
    sanitized: list[dict[str, object]] = []
    for raw, expected_raw in zip(samples, template_samples, strict=True):
        if not isinstance(raw, dict) or not isinstance(expected_raw, dict):
            raise QualitySessionError("invalid-scorecard")
        sample = cast(dict[str, object], raw)
        expected = cast(dict[str, object], expected_raw)
        scores = sample.get("scores")
        if (
            sample.get("sampleId") != expected.get("sampleId")
            or sample.get("caseId") != expected.get("caseId")
            or not isinstance(scores, dict)
            or set(scores) != set(DIMENSIONS)
            or not isinstance(sample.get("meaningChangingDefect"), bool)
        ):
            raise QualitySessionError("invalid-scorecard")
        sanitized.append(
            {
                "sampleId": sample["sampleId"],
                "caseId": sample["caseId"],
                "scores": {
                    dimension: _score(cast(dict[str, object], scores)[dimension])
                    for dimension in DIMENSIONS
                },
                "meaningChangingDefect": sample["meaningChangingDefect"],
            }
        )
    target = session / "scorecards" / f"{evaluator_id}.completed.json"
    if target.exists():
        raise QualitySessionError("scorecard-state")
    _write_json(
        target,
        {
            "sessionId": session_id,
            "evaluatorId": evaluator_id,
            "samples": cast(list[object], sanitized),
        },
    )
    completed = len(tuple((session / "scorecards").glob("*.completed.json")))
    return {
        "status": "pass",
        "sessionId": session_id,
        "evaluatorId": evaluator_id,
        "completedEvaluators": completed,
    }


def aggregate_scores(
    session_id: str,
    *,
    raw_root: Path = RAW_ROOT,
) -> dict[str, object]:
    session = _session_path(session_id, raw_root=raw_root, must_exist=True)
    metadata = _read_mapping(session / "session.json")
    evaluator_ids = metadata.get("evaluatorIds")
    if metadata.get("state") != "ready" or not isinstance(evaluator_ids, list):
        raise QualitySessionError("session-state")
    cards = [
        _read_mapping(session / "scorecards" / f"{evaluator_id}.completed.json")
        for evaluator_id in evaluator_ids
        if isinstance(evaluator_id, str)
    ]
    if len(cards) != len(evaluator_ids):
        raise QualitySessionError("incomplete-scorecards")
    key = _read_mapping(session / "randomization-key.json")
    mappings = key.get("samples")
    if not isinstance(mappings, list):
        raise QualitySessionError("invalid-metadata")
    by_sample: dict[str, tuple[str, str]] = {}
    for raw in mappings:
        if not isinstance(raw, dict):
            raise QualitySessionError("invalid-metadata")
        item = cast(dict[str, object], raw)
        sample_id = item.get("sampleId")
        candidate_id = item.get("candidateId")
        case_id = item.get("caseId")
        if not all(isinstance(value, str) for value in (sample_id, candidate_id, case_id)):
            raise QualitySessionError("invalid-metadata")
        by_sample[cast(str, sample_id)] = (
            cast(str, candidate_id),
            cast(str, case_id),
        )
    expected_candidates = metadata.get("expectedCandidates")
    if not isinstance(expected_candidates, list):
        raise QualitySessionError("invalid-metadata")
    results: dict[str, object] = {}
    for candidate_id in expected_candidates:
        if not isinstance(candidate_id, str):
            raise QualitySessionError("invalid-metadata")
        dimension_values: dict[str, list[float]] = {dimension: [] for dimension in DIMENSIONS}
        defects = 0
        for case_id in load_corpus(CORPUS_PATH).performance_order:
            matching_sample = next(
                (
                    sample_id
                    for sample_id, identity in by_sample.items()
                    if identity == (candidate_id, case_id)
                ),
                None,
            )
            if matching_sample is None:
                raise QualitySessionError("invalid-metadata")
            per_dimension: dict[str, list[int]] = {dimension: [] for dimension in DIMENSIONS}
            for card in cards:
                samples = cast(list[object], card.get("samples"))
                raw_sample = next(
                    (
                        item
                        for item in samples
                        if isinstance(item, dict) and item.get("sampleId") == matching_sample
                    ),
                    None,
                )
                if not isinstance(raw_sample, dict):
                    raise QualitySessionError("invalid-scorecard")
                sample = cast(dict[str, object], raw_sample)
                scores = cast(dict[str, object], sample["scores"])
                for dimension in DIMENSIONS:
                    value = _score(scores[dimension])
                    if isinstance(value, int):
                        per_dimension[dimension].append(value)
                defects += int(sample["meaningChangingDefect"] is True)
            for dimension in DIMENSIONS:
                if per_dimension[dimension]:
                    dimension_values[dimension].append(
                        float(statistics.median(per_dimension[dimension]))
                    )
        if any(not values for values in dimension_values.values()):
            raise QualitySessionError("missing-dimension")
        dimensions = {
            dimension: sum(values) / len(values) for dimension, values in dimension_values.items()
        }
        overall = sum(dimensions.values()) / len(dimensions)
        if not math.isfinite(overall):
            raise QualitySessionError("invalid-scorecard")
        results[candidate_id] = {
            "evaluatorCount": len(cards),
            "blindOrder": True,
            "scale": "1-5",
            "overallMean": overall,
            "dimensions": dimensions,
            "meaningChangingDefects": defects,
            "limitations": [
                "small-panel",
                "spanish-only",
                "fixed-voices-only",
                "synthetic-corpus-only",
                "not-accessibility-certification",
            ],
        }
    aggregate = {
        "sessionVersion": SESSION_VERSION,
        "sessionId": session_id,
        "eligibleForPromotion": len(cards) >= 3,
        "candidates": results,
    }
    _write_json(session / "quality.aggregate.json", aggregate)
    return {
        "status": "pass",
        "sessionId": session_id,
        "evaluatorCount": len(cards),
        "eligibleForPromotion": len(cards) >= 3,
        "candidates": results,
    }


def cleanup_session(session_id: str, *, raw_root: Path = RAW_ROOT) -> None:
    session = _session_path(session_id, raw_root=raw_root, must_exist=True)
    shutil.rmtree(session)
    if session.exists():
        raise QualitySessionError("cleanup")
