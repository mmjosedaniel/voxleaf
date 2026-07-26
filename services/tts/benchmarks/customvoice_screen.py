"""Frozen, bounded, disposable CustomVoice Spanish speaker screen."""

from __future__ import annotations

import hashlib
import importlib
import json
import math
import os
import re
import secrets
import shutil
import sys
from collections.abc import Callable, Mapping, MutableSequence, Sequence, Sized
from contextlib import suppress
from dataclasses import dataclass
from importlib import metadata
from pathlib import Path
from typing import Any, Final, Protocol, cast

from benchmarks.adapters.manifest import (
    ArtifactIdentity,
    CandidateConfiguration,
    CandidateProfile,
)
from benchmarks.diagnostics import DiagnosticCapture
from benchmarks.harness import load_corpus
from benchmarks.preflight import PreflightRequest, RunConditions, run_local_preflight
from benchmarks.quality import _write_json, _write_wave

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
AUTHORITY_PATH: Final = (
    REPOSITORY_ROOT / "benchmarks" / "tts" / "customvoice-spanish-screen-v2.json"
)
BASE_MANIFEST_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "candidates-v2.json"
MANIFEST_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "candidates-v3.json"
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v1.json"
RESULT_SCHEMA_PATH: Final = (
    REPOSITORY_ROOT
    / "benchmarks"
    / "tts"
    / "schemas"
    / "customvoice-spanish-screen-result-v2.schema.json"
)
RAW_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "results" / "raw"
SCREEN_ROOT_NAME: Final = "customvoice-spanish-screen-v2"
CANDIDATE_ID: Final = "qwen3-tts-1-7b-customvoice-cuda-bf16-v1"
SESSION_VERSION: Final = "customvoice-spanish-screen-session-v2"
DIMENSIONS: Final = (
    "intelligibility",
    "spanishPronunciation",
    "punctuationDialogue",
    "numericExpressions",
    "naturalness",
    "audiobookSuitability",
    "artifactFreedom",
)
_SESSION_ID: Final = re.compile(r"^[a-f0-9]{32}$")
_SAMPLE_ID: Final = re.compile(r"^[a-f0-9]{32}$")


class ScreenError(RuntimeError):
    """Fixed content-free screen failure."""

    def __init__(self, code: str) -> None:
        super().__init__(f"tts-customvoice-screen:{code}")
        self.code = code


class ScreenAdapter(Protocol):
    def load(self) -> None: ...

    def supported_speakers(self) -> Sequence[str]: ...

    def synthesize(self, text: str, speaker: str) -> tuple[Sized, int]: ...

    def close(self) -> None: ...


@dataclass(frozen=True)
class ScreenRequest:
    artifact_root: Path
    candidate_python: Path
    expected_commit_sha: str
    sleep_disabled: bool
    background_load_acceptable: bool
    thermal_state_acceptable: bool


def _mapping(value: object, code: str = "authority") -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise ScreenError(code)
    return cast(Mapping[str, object], value)


def _strings(value: object, code: str = "authority") -> tuple[str, ...]:
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise ScreenError(code)
    return tuple(cast(list[str], value))


def _load_json(path: Path, code: str = "authority") -> Mapping[str, object]:
    try:
        return _mapping(json.loads(path.read_text(encoding="utf-8")), code)
    except ScreenError:
        raise
    except Exception:
        raise ScreenError(code) from None


def _session_path(session_id: str, *, raw_root: Path = RAW_ROOT, must_exist: bool = False) -> Path:
    if _SESSION_ID.fullmatch(session_id) is None:
        raise ScreenError("session")
    root = (raw_root.resolve() / SCREEN_ROOT_NAME).resolve()
    session = (root / session_id).resolve()
    try:
        relative = session.relative_to(root)
    except ValueError:
        raise ScreenError("session") from None
    if len(relative.parts) != 1 or (must_exist and not session.is_dir()):
        raise ScreenError("session")
    return session


def _authority() -> Mapping[str, object]:
    authority = _load_json(AUTHORITY_PATH)
    if (
        authority.get("screenVersion") != "customvoice-spanish-screen-v2"
        or authority.get("status") != "frozen-before-audio"
        or authority.get("candidateId") != CANDIDATE_ID
        or _strings(authority.get("speakerOrder"))
        != (
            "Vivian",
            "Serena",
            "Uncle_Fu",
            "Dylan",
            "Eric",
            "Ryan",
            "Aiden",
            "Ono_Anna",
            "Sohee",
        )
        or _strings(_mapping(authority.get("evaluation")).get("dimensions")) != DIMENSIONS
    ):
        raise ScreenError("authority")
    return authority


def _dimension_applicability(
    authority: Mapping[str, object],
) -> Mapping[str, tuple[str, ...]]:
    evaluation = _mapping(authority.get("evaluation"))
    raw = _mapping(evaluation.get("dimensionApplicability"))
    if set(raw) != set(DIMENSIONS):
        raise ScreenError("authority")
    applicability = {dimension: _strings(raw.get(dimension)) for dimension in DIMENSIONS}
    case_ids = set(_strings(authority.get("caseIds")))
    if any(not cases or not set(cases).issubset(case_ids) for cases in applicability.values()):
        raise ScreenError("authority")
    return applicability


def _candidate_profile() -> CandidateProfile:
    amendment = _load_json(MANIFEST_PATH)
    if (
        amendment.get("manifestVersion") != "tts-candidate-manifest-v3"
        or amendment.get("status") != "frozen-before-screen-v2-audio"
        or amendment.get("candidateId") != CANDIDATE_ID
        or amendment.get("selectionAuthority") != "customvoice-spanish-screen-v2"
        or amendment.get("supersedesSelectionAuthority") != "customvoice-spanish-screen-v1"
    ):
        raise ScreenError("manifest")
    base = _mapping(amendment.get("baseManifest"), "manifest")
    if (
        base.get("path") != "benchmarks/tts/candidates-v2.json"
        or base.get("sha256") != hashlib.sha256(BASE_MANIFEST_PATH.read_bytes()).hexdigest()
    ):
        raise ScreenError("manifest")
    manifest = _load_json(BASE_MANIFEST_PATH)
    candidates = manifest.get("candidates")
    if manifest.get("manifestVersion") != "tts-candidate-manifest-v2" or not isinstance(
        candidates, list
    ):
        raise ScreenError("manifest")
    selected = tuple(
        _mapping(item, "manifest")
        for item in candidates
        if isinstance(item, dict) and item.get("candidateId") == CANDIDATE_ID
    )
    if len(selected) != 1:
        raise ScreenError("manifest")
    candidate = selected[0]
    engine = _mapping(candidate.get("engine"), "manifest")
    model = _mapping(candidate.get("model"), "manifest")
    runtime = _mapping(candidate.get("runtime"), "manifest")
    artifacts = model.get("majorArtifacts")
    if (
        candidate.get("admission") != "speaker-screen-only"
        or engine.get("distribution") != "qwen-tts"
        or engine.get("version") != "0.1.1"
        or runtime.get("provider") != "PyTorch CUDA"
        or runtime.get("precision") != "bfloat16"
        or runtime.get("attention") != "sdpa"
        or not isinstance(artifacts, list)
        or len(artifacts) != 2
    ):
        raise ScreenError("manifest")
    identities: list[ArtifactIdentity] = []
    for raw in artifacts:
        artifact = _mapping(raw, "manifest")
        path = artifact.get("path")
        digest = artifact.get("sha256")
        if not isinstance(path, str) or not isinstance(digest, str):
            raise ScreenError("manifest")
        identities.append(ArtifactIdentity(relative_path=path, sha256=digest))
    return CandidateProfile(
        candidate_id=CANDIDATE_ID,
        role="balanced",
        distribution="qwen-tts",
        engine_version="0.1.1",
        model_revision=cast(str, model.get("revision")),
        voice_id="screen-pending",
        provider="pytorch-cuda",
        precision="bfloat16",
        artifacts=tuple(identities),
        output_sample_rate_hz=None,
    )


class QwenCustomVoiceScreenAdapter:
    """Local-path-only adapter used solely by the frozen speaker screen."""

    def __init__(self, profile: CandidateProfile, root: Path) -> None:
        self._profile = profile
        self._root = root
        self._model: Any = None
        self._torch: Any = None

    def load(self) -> None:
        if (
            metadata.version("qwen-tts") != self._profile.engine_version
            or metadata.version("torch") != "2.9.1+cu128"
            or os.environ.get("HF_HUB_OFFLINE") != "1"
            or os.environ.get("TRANSFORMERS_OFFLINE") != "1"
        ):
            raise ScreenError("runtime")
        torch = importlib.import_module("torch")
        qwen_tts = importlib.import_module("qwen_tts")
        if not torch.cuda.is_available() or not torch.cuda.is_bf16_supported():
            raise ScreenError("provider")
        self._torch = torch
        self._model = qwen_tts.Qwen3TTSModel.from_pretrained(
            str(self._root),
            device_map="cuda:0",
            dtype=torch.bfloat16,
            attn_implementation="sdpa",
            local_files_only=True,
        )

    def supported_speakers(self) -> Sequence[str]:
        if self._model is None:
            raise ScreenError("not-loaded")
        return cast(Sequence[str], self._model.get_supported_speakers())

    def synthesize(self, text: str, speaker: str) -> tuple[Sized, int]:
        if self._model is None:
            raise ScreenError("not-loaded")
        authority = _authority()
        generation = _mapping(authority.get("generation"))
        waveforms, sample_rate = self._model.generate_custom_voice(
            text=text,
            language=generation["language"],
            speaker=speaker,
            instruct=authority["instruction"],
            do_sample=generation["doSample"],
            repetition_penalty=generation["repetitionPenalty"],
            temperature=generation["temperature"],
            top_p=generation["topP"],
            top_k=generation["topK"],
            subtalker_dosample=generation["subtalkerDoSample"],
            subtalker_temperature=generation["subtalkerTemperature"],
            subtalker_top_p=generation["subtalkerTopP"],
            subtalker_top_k=generation["subtalkerTopK"],
            max_new_tokens=generation["maxNewTokens"],
        )
        if not isinstance(sample_rate, int) or not isinstance(waveforms, (list, tuple)):
            raise ScreenError("audio")
        if len(waveforms) != 1 or len(waveforms[0]) <= 0:
            raise ScreenError("audio")
        return cast(Sized, waveforms[0]), sample_rate

    def close(self) -> None:
        self._model = None
        torch = self._torch
        self._torch = None
        if torch is not None:
            torch.cuda.empty_cache()


def _screen_preflight(request: ScreenRequest) -> CandidateProfile:
    profile = _candidate_profile()
    configuration = CandidateConfiguration(
        candidate_id=CANDIDATE_ID,
        artifact_root=request.artifact_root,
        model_revision=profile.model_revision,
        voice_id=profile.voice_id,
        provider=profile.provider,
        precision=profile.precision,
        offline=True,
    )
    receipt = run_local_preflight(
        PreflightRequest(
            expected_commit_sha=request.expected_commit_sha,
            repository_root=REPOSITORY_ROOT,
            profile=profile,
            configuration=configuration,
            candidate_python=request.candidate_python,
            conditions=RunConditions(
                purpose="official",
                sleep_disabled=request.sleep_disabled,
                background_load_acceptable=request.background_load_acceptable,
                thermal_state_acceptable=request.thermal_state_acceptable,
            ),
        )
    )
    if receipt.failures or not receipt.eligible_for_official_run:
        raise ScreenError("preflight")
    return profile


def _new_id() -> str:
    return secrets.token_hex(16)


def _shuffle(values: MutableSequence[dict[str, str]]) -> None:
    secrets.SystemRandom().shuffle(values)


def _render_page(
    session_id: str,
    samples: Sequence[Mapping[str, str]],
    applicability: Mapping[str, tuple[str, ...]],
) -> str:
    card = {
        "sessionId": session_id,
        "samples": [
            {
                "sampleId": sample["sampleId"],
                "caseId": sample["caseId"],
                "scores": {
                    dimension: None
                    for dimension in DIMENSIONS
                    if sample["caseId"] in applicability[dimension]
                },
                "meaningChangingDefect": None,
            }
            for sample in samples
        ],
    }
    payload = json.dumps(card, ensure_ascii=True, separators=(",", ":"))
    template = """<!doctype html>
<html lang="es"><meta charset="utf-8"><title>VoxLeaf CustomVoice Spanish screen</title>
<style>
body { font: 16px system-ui; max-width: 1050px; margin: 2rem auto; padding: 0 1rem; }
article { border: 1px solid #bbb; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
fieldset { display: grid; grid-template-columns: repeat(auto-fit,minmax(210px,1fr)); gap: .6rem; }
label { display: flex; flex-direction: column; gap: .25rem; }
button { font-size: 1rem; padding: .7rem; }
</style>
<h1>Selección ciega de narrador</h1>
<p>Escuche cada muestra y puntúe de 1 a 5. No intente identificar la voz.</p>
<main id="samples"></main><button id="export">Validar y descargar resultados</button>
<script>
const card = __CARD__;
const labels = {
  intelligibility: "Inteligibilidad",
  spanishPronunciation: "Pronunciación en español",
  punctuationDialogue: "Puntuación y diálogo",
  numericExpressions: "Expresiones numéricas",
  naturalness: "Naturalidad",
  audiobookSuitability: "Aptitud para audiolibros",
  artifactFreedom: "Sin artefactos, repeticiones ni cortes",
};
const root=document.querySelector("#samples");
for (const [index, sample] of card.samples.entries()) {
  const article = document.createElement("article");
  article.innerHTML = `<h2>${index + 1}. ${sample.caseId}</h2>`
    + `<audio controls preload="none" src="audio/${sample.sampleId}.wav"></audio>`
    + "<fieldset></fieldset>";
  const fields = article.querySelector("fieldset");
  for (const dimension of Object.keys(sample.scores)) {
    const label = document.createElement("label");
    label.textContent = labels[dimension];
    const select = document.createElement("select");
    select.dataset.dimension = dimension;
    select.innerHTML = '<option value="">Seleccione</option>'
      + [1, 2, 3, 4, 5].map(value => `<option>${value}</option>`).join("");
    label.append(select);
    fields.append(label);
  }
  const defect = document.createElement("label");
  defect.textContent = "¿Defecto que cambia el significado?";
  const defectSelect = document.createElement("select");
  defectSelect.dataset.defect = "true";
  defectSelect.innerHTML = '<option value="">Seleccione</option>'
    + '<option value="false">No</option><option value="true">Sí</option>';
  defect.append(defectSelect);
  fields.append(defect);
  root.append(article);
}
document.querySelector("#export").addEventListener("click", () => {
  for (const [index, article] of [...document.querySelectorAll("article")].entries()) {
    for (const select of article.querySelectorAll("[data-dimension]")) {
      if (!select.value) {
        alert(`Falta una puntuación en la muestra ${index + 1}.`);
        return;
      }
      card.samples[index].scores[select.dataset.dimension] = Number(select.value);
    }
    const defect = article.querySelector("[data-defect]");
    if (!defect.value) {
      alert(`Falta indicar defectos en la muestra ${index + 1}.`);
      return;
    }
    card.samples[index].meaningChangingDefect = defect.value === "true";
  }
  const blob = new Blob([JSON.stringify(card, null, 2) + "\\n"], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "customvoice-spanish-screen.completed.json";
  link.click();
  URL.revokeObjectURL(link.href);
});
</script></html>
"""
    return template.replace("__CARD__", payload)


def generate_screen(
    request: ScreenRequest,
    session_id: str,
    *,
    raw_root: Path = RAW_ROOT,
    adapter_builder: Callable[
        [CandidateProfile, Path], ScreenAdapter
    ] = QwenCustomVoiceScreenAdapter,
    id_factory: Callable[[], str] = _new_id,
    shuffle: Callable[[MutableSequence[dict[str, str]]], None] = _shuffle,
) -> dict[str, object]:
    """Generate, blind, and bound all frozen speaker/case combinations."""

    session = _session_path(session_id, raw_root=raw_root)
    if session.exists():
        raise ScreenError("session-state")
    profile = _screen_preflight(request)
    authority = _authority()
    corpus = load_corpus(CORPUS_PATH)
    speakers = _strings(authority.get("speakerOrder"))
    case_ids = _strings(authority.get("caseIds"))
    applicability = _dimension_applicability(authority)
    session.mkdir(parents=True)
    staging = session / "staging"
    staging.mkdir()
    adapter = adapter_builder(profile, request.artifact_root.resolve())
    sensitive = tuple(
        value for case in corpus.cases.values() for value in (case.text, case.privacy_canary)
    ) + (str(request.artifact_root), str(request.candidate_python))
    capture = DiagnosticCapture(forbidden_values=sensitive)
    mappings: list[dict[str, str]] = []
    try:
        with capture:
            adapter.load()
            supported = {speaker.casefold() for speaker in adapter.supported_speakers()}
            if supported != {speaker.casefold() for speaker in speakers}:
                raise ScreenError("speaker-set")
            for speaker in speakers:
                speaker_root = staging / speaker
                speaker_root.mkdir()
                for case_id in case_ids:
                    case = corpus.cases.get(case_id)
                    if case is None:
                        raise ScreenError("corpus")
                    waveform, sample_rate = adapter.synthesize(case.text, speaker)
                    _write_wave(speaker_root / f"{case_id}.wav", waveform, sample_rate)
                    del waveform
        observation = capture.observation()
        capture.discard()
        if observation.sensitive_value_observed:
            raise ScreenError("privacy")
        audio_root = session / "audio"
        audio_root.mkdir()
        for speaker in speakers:
            for case_id in case_ids:
                sample_id = id_factory()
                if _SAMPLE_ID.fullmatch(sample_id) is None:
                    raise ScreenError("sample-id")
                source = staging / speaker / f"{case_id}.wav"
                target = audio_root / f"{sample_id}.wav"
                if not source.is_file() or target.exists():
                    raise ScreenError("audio")
                source.replace(target)
                mappings.append({"sampleId": sample_id, "speakerId": speaker, "caseId": case_id})
        if len(mappings) != 27:
            raise ScreenError("audio")
        maximum_bytes = cast(
            int, _mapping(authority.get("privacyAndBounds")).get("maximumSessionAudioBytes")
        )
        if sum(path.stat().st_size for path in audio_root.glob("*.wav")) > maximum_bytes:
            raise ScreenError("audio-limit")
        shutil.rmtree(staging)
        order = [{"sampleId": item["sampleId"], "caseId": item["caseId"]} for item in mappings]
        shuffle(order)
        _write_json(
            session / "randomization-key.json",
            {
                "sessionVersion": SESSION_VERSION,
                "sessionId": session_id,
                "samples": cast(list[object], mappings),
            },
        )
        _write_json(
            session / "scorecard.template.json",
            cast(
                Mapping[str, object],
                json.loads(
                    json.dumps(
                        {
                            "sessionId": session_id,
                            "samples": [
                                {
                                    "sampleId": item["sampleId"],
                                    "caseId": item["caseId"],
                                    "scores": {
                                        dimension: None
                                        for dimension in DIMENSIONS
                                        if item["caseId"] in applicability[dimension]
                                    },
                                    "meaningChangingDefect": None,
                                }
                                for item in order
                            ],
                        }
                    )
                ),
            ),
        )
        (session / "evaluate.html").write_text(
            _render_page(session_id, order, applicability),
            encoding="utf-8",
            newline="\n",
        )
    except Exception as error:
        shutil.rmtree(session, ignore_errors=True)
        if isinstance(error, ScreenError):
            raise
        raise ScreenError("generation") from None
    finally:
        with suppress(Exception):
            adapter.close()
    return {"status": "pass", "sessionId": session_id, "sampleCount": 27}


def _score(value: object) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or not 1 <= value <= 5:
        raise ScreenError("scorecard")
    return value


def submit_and_select(
    session_id: str, scorecard: object, *, raw_root: Path = RAW_ROOT
) -> dict[str, object]:
    """Validate one complete blinded scorecard and apply the frozen ranking."""

    from jsonschema import Draft202012Validator

    session = _session_path(session_id, raw_root=raw_root, must_exist=True)
    if not isinstance(scorecard, dict):
        raise ScreenError("scorecard")
    card = cast(Mapping[str, object], scorecard)
    template = _load_json(session / "scorecard.template.json", "scorecard")
    samples = card.get("samples")
    template_samples = template.get("samples")
    if (
        card.get("sessionId") != session_id
        or not isinstance(samples, list)
        or not isinstance(template_samples, list)
        or len(samples) != 27
        or len(samples) != len(template_samples)
    ):
        raise ScreenError("scorecard")
    sanitized: dict[str, tuple[dict[str, int], bool]] = {}
    for raw, expected_raw in zip(samples, template_samples, strict=True):
        sample = _mapping(raw, "scorecard")
        expected = _mapping(expected_raw, "scorecard")
        scores = _mapping(sample.get("scores"), "scorecard")
        expected_scores = _mapping(expected.get("scores"), "scorecard")
        sample_id = sample.get("sampleId")
        if (
            sample_id != expected.get("sampleId")
            or sample.get("caseId") != expected.get("caseId")
            or not isinstance(sample_id, str)
            or set(scores) != set(expected_scores)
            or not isinstance(sample.get("meaningChangingDefect"), bool)
        ):
            raise ScreenError("scorecard")
        sanitized[sample_id] = (
            {dimension: _score(value) for dimension, value in scores.items()},
            cast(bool, sample["meaningChangingDefect"]),
        )
    key = _load_json(session / "randomization-key.json", "metadata")
    mappings = key.get("samples")
    if not isinstance(mappings, list):
        raise ScreenError("metadata")
    authority = _authority()
    applicability = _dimension_applicability(authority)
    speaker_order = _strings(authority.get("speakerOrder"))
    eligibility = _mapping(_mapping(authority.get("evaluation")).get("speakerEligibility"))
    results: list[dict[str, object]] = []
    for speaker in speaker_order:
        speaker_samples = [
            _mapping(item, "metadata")
            for item in mappings
            if isinstance(item, dict) and item.get("speakerId") == speaker
        ]
        if len(speaker_samples) != 3:
            raise ScreenError("metadata")
        dimensions: dict[str, float] = {}
        for dimension in DIMENSIONS:
            applicable_samples = [
                item
                for item in speaker_samples
                if cast(str, item["caseId"]) in applicability[dimension]
            ]
            if not applicable_samples:
                raise ScreenError("metadata")
            dimensions[dimension] = sum(
                sanitized[cast(str, item["sampleId"])][0][dimension] for item in applicable_samples
            ) / len(applicable_samples)
        overall = sum(dimensions.values()) / len(dimensions)
        defects = sum(int(sanitized[cast(str, item["sampleId"])][1]) for item in speaker_samples)
        eligible = (
            overall >= cast(float, eligibility["minimumOverallMean"])
            and dimensions["intelligibility"]
            >= cast(float, eligibility["minimumIntelligibilityMean"])
            and dimensions["spanishPronunciation"]
            >= cast(float, eligibility["minimumSpanishPronunciationMean"])
            and min(dimensions.values()) >= cast(float, eligibility["minimumEveryDimensionMean"])
            and defects <= cast(int, eligibility["maximumMeaningChangingDefects"])
        )
        results.append(
            {
                "speakerId": speaker,
                "eligible": eligible,
                "overallMean": overall,
                "dimensions": dimensions,
                "meaningChangingDefects": defects,
            }
        )
    order_index = {speaker: index for index, speaker in enumerate(speaker_order)}
    ranked = sorted(
        (item for item in results if item["eligible"] is True),
        key=lambda item: (
            -cast(float, item["overallMean"]),
            -cast(float, cast(Mapping[str, object], item["dimensions"])["spanishPronunciation"]),
            -cast(float, cast(Mapping[str, object], item["dimensions"])["audiobookSuitability"]),
            -cast(float, cast(Mapping[str, object], item["dimensions"])["naturalness"]),
            -cast(float, cast(Mapping[str, object], item["dimensions"])["artifactFreedom"]),
            -cast(float, cast(Mapping[str, object], item["dimensions"])["intelligibility"]),
            -cast(
                float,
                cast(Mapping[str, object], item["dimensions"])["punctuationDialogue"],
            ),
            -cast(
                float,
                cast(Mapping[str, object], item["dimensions"])["numericExpressions"],
            ),
            order_index[cast(str, item["speakerId"])],
        ),
    )
    result = {
        "schemaVersion": "customvoice-spanish-screen-result-v2",
        "screenVersion": "customvoice-spanish-screen-v2",
        "candidateId": CANDIDATE_ID,
        "evaluatorCount": 1,
        "selectedSpeaker": ranked[0]["speakerId"] if ranked else None,
        "speakers": results,
        "limitations": [
            "one-evaluator-intake-screen",
            "spanish-only",
            "synthetic-corpus-only",
            "built-in-speakers-only",
            "not-production-quality-approval",
        ],
    }
    schema = _load_json(RESULT_SCHEMA_PATH, "schema")
    errors = tuple(Draft202012Validator(schema).iter_errors(result))
    if errors or not math.isfinite(sum(cast(float, item["overallMean"]) for item in results)):
        raise ScreenError("result")
    _write_json(session / "result.json", result)
    return result


def cleanup_screen(session_id: str, *, raw_root: Path = RAW_ROOT) -> None:
    session = _session_path(session_id, raw_root=raw_root, must_exist=True)
    shutil.rmtree(session)
    if session.exists():
        raise ScreenError("cleanup")


def candidate_interpreter_matches(path: Path) -> bool:
    try:
        return Path(sys.executable).resolve() == path.resolve(strict=True)
    except OSError:
        return False
