"""Frozen pre-audio authority for the Qwen3 CustomVoice Spanish speaker screen."""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from pathlib import Path
from typing import Final, cast

from jsonschema import Draft202012Validator

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
MANIFEST_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "candidates-v2.json"
SCREEN_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "customvoice-spanish-screen-v1.json"
SCHEMA_PATH: Final = (
    REPOSITORY_ROOT
    / "benchmarks"
    / "tts"
    / "schemas"
    / "customvoice-spanish-screen-result-v1.schema.json"
)
ACTIVE_MANIFEST_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "candidates-v3.json"
ACTIVE_SCREEN_PATH: Final = (
    REPOSITORY_ROOT / "benchmarks" / "tts" / "customvoice-spanish-screen-v2.json"
)
ACTIVE_SCHEMA_PATH: Final = (
    REPOSITORY_ROOT
    / "benchmarks"
    / "tts"
    / "schemas"
    / "customvoice-spanish-screen-result-v2.schema.json"
)
EXPECTED_HASHES: Final = {
    MANIFEST_PATH: "89c069fa4fa6c1f88887613c11f93e1c68b6bfa94f137f38e5fa7b37961db793",
    SCREEN_PATH: "462105e09610a8604682f4f904a7f87e7eb03bfbc1f8823923f286ea7d63d793",
    SCHEMA_PATH: "0a449633c1b5ce1638c8a2fd3709d21f237f8ad7d958d3010f67fc366c2aaa55",
    ACTIVE_MANIFEST_PATH: "dce294309f4edd27d4b32fa95eb677f58b399fc71867ce5bc1a7b27049352a72",
    ACTIVE_SCREEN_PATH: "c4a277db8d319c9bb21165a3524233dabdbd38edbb3c8c760948a4a35c04d96d",
    ACTIVE_SCHEMA_PATH: "16091eea8f7d27a5e9f6211494e426e2a81dcc84e736a73f57acb11e3436bfe9",
}
SPEAKERS: Final = (
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
GENERATION: Final = {
    "language": "Spanish",
    "batchSize": 1,
    "doSample": True,
    "repetitionPenalty": 1.05,
    "temperature": 0.9,
    "topP": 1.0,
    "topK": 50,
    "subtalkerDoSample": True,
    "subtalkerTemperature": 0.9,
    "subtalkerTopP": 1.0,
    "subtalkerTopK": 50,
    "maxNewTokens": 2048,
}


def _load(path: Path) -> Mapping[str, object]:
    return cast(Mapping[str, object], json.loads(path.read_text(encoding="utf-8")))


def test_pre_audio_authorities_are_byte_frozen() -> None:
    for path, expected in EXPECTED_HASHES.items():
        assert hashlib.sha256(path.read_bytes()).hexdigest() == expected


def test_candidate_and_screen_authorities_are_consistent_and_bounded() -> None:
    manifest = _load(MANIFEST_PATH)
    amendment = _load(ACTIVE_MANIFEST_PATH)
    candidates = cast(list[Mapping[str, object]], manifest["candidates"])
    assert len(candidates) == 1
    candidate = candidates[0]
    model = cast(Mapping[str, object], candidate["model"])
    voice = cast(Mapping[str, object], candidate["voice"])
    runtime = cast(Mapping[str, object], candidate["runtime"])
    evaluation_policy = cast(Mapping[str, object], candidate["evaluationPolicy"])
    artifacts = cast(list[Mapping[str, object]], model["majorArtifacts"])

    assert manifest["manifestVersion"] == "tts-candidate-manifest-v2"
    assert amendment["manifestVersion"] == "tts-candidate-manifest-v3"
    assert amendment["status"] == "frozen-before-screen-v2-audio"
    assert amendment["candidateId"] == candidate["candidateId"]
    assert amendment["selectionAuthority"] == "customvoice-spanish-screen-v2"
    assert amendment["supersedesSelectionAuthority"] == ("customvoice-spanish-screen-v1")
    assert amendment["invalidationEvidence"] == {
        "supersededResultProduced": False,
        "supersededScorecardSubmitted": False,
        "supersededRawSessionDeleted": True,
    }
    assert candidate["candidateId"] == "qwen3-tts-1-7b-customvoice-cuda-bf16-v1"
    assert candidate["admission"] == "speaker-screen-only"
    assert model["repository"] == "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"
    assert model["revision"] == "0c0e3051f131929182e2c023b9537f8b1c68adfe"
    assert artifacts == [
        {
            "path": "model.safetensors",
            "sha256": "38b1d5971bdbd982b561cccec982669a53b0537c3cf5e9bd4778ed07bb2f5137",
            "sizeBytes": 3_833_402_552,
        },
        {
            "path": "speech_tokenizer/model.safetensors",
            "sha256": "836b7b357f5ea43e889936a3709af68dfe3751881acefe4ecf0dbd30ba571258",
            "sizeBytes": 682_293_092,
        },
    ]
    assert voice["mode"] == "built-in-customvoice"
    assert voice["selectedSpeaker"] is None
    assert (
        tuple(
            cast(str, speaker["id"])
            for speaker in cast(list[Mapping[str, object]], voice["supportedSpeakers"])
        )
        == SPEAKERS
    )
    assert runtime["provider"] == "PyTorch CUDA"
    assert runtime["torch"] == "2.9.1+cu128"
    assert runtime["torchaudio"] == "2.9.1+cu128"
    assert runtime["precision"] == "bfloat16"
    assert runtime["attention"] == "sdpa"
    assert runtime["generation"] == {
        key: value for key, value in GENERATION.items() if key != "language" and key != "batchSize"
    }
    assert evaluation_policy["batchSize"] == 1
    assert evaluation_policy["automaticRetries"] == 0
    assert evaluation_policy["failureAccounting"] == "first-attempt-is-authoritative"
    assert evaluation_policy["configurationSwitching"] == "forbidden"
    assert evaluation_policy["auxiliaryAnalysis"] == {
        "whisper": "excluded",
        "vadOrEnergy": "excluded-from-v3",
    }
    prototype_gate = cast(Mapping[str, object], evaluation_policy["preAdmissionPrototypeGate"])
    assert prototype_gate["requiredBeforeFullBenchmark"] is True
    assert prototype_gate["failureOutcome"] == "stop-candidate-cycle-before-full-matrix"

    screen = _load(ACTIVE_SCREEN_PATH)
    assert screen["screenVersion"] == "customvoice-spanish-screen-v2"
    assert screen["status"] == "frozen-before-audio"
    assert screen["candidateId"] == candidate["candidateId"]
    assert screen["corpusSha256"] == (
        "7727e0ea0b2763690e3cffbd72074fd907d8bf3ca2a10addd028ba9072df96bb"
    )
    assert tuple(cast(list[str], screen["speakerOrder"])) == SPEAKERS
    assert screen["instruction"] == voice["instruction"]
    assert screen["generation"] == GENERATION
    assert screen["attemptPolicy"] == {
        "automaticRetries": 0,
        "countEveryFirstAttemptFailure": True,
        "allowDiagnosticRetryToChangeSelection": False,
    }
    assert screen["caseIds"] == [
        "es-punctuation-dialogue-short",
        "es-currency-percent-short",
        "es-narrative-target",
    ]
    evaluation = cast(Mapping[str, object], screen["evaluation"])
    assert evaluation["dimensions"] == [
        "intelligibility",
        "spanishPronunciation",
        "punctuationDialogue",
        "numericExpressions",
        "naturalness",
        "audiobookSuitability",
        "artifactFreedom",
    ]
    applicability = cast(Mapping[str, object], evaluation["dimensionApplicability"])
    assert applicability["numericExpressions"] == ["es-currency-percent-short"]
    assert applicability["punctuationDialogue"] == [
        "es-punctuation-dialogue-short",
        "es-narrative-target",
    ]
    bounds = cast(Mapping[str, object], screen["privacyAndBounds"])
    assert bounds["maximumSamples"] == 27
    assert bounds["maximumSessionAudioBytes"] == 256 * 1024 * 1024
    assert bounds["deleteRawSessionAfterValidatedResult"] is True


def test_result_schema_is_strict_and_self_consistent() -> None:
    schema = _load(ACTIVE_SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    properties = cast(Mapping[str, object], schema["properties"])
    speakers = cast(Mapping[str, object], properties["speakers"])
    assert schema["additionalProperties"] is False
    assert speakers["minItems"] == len(SPEAKERS)
    assert speakers["maxItems"] == len(SPEAKERS)
