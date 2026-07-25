"""Frozen synthetic TTS corpus and repository privacy gates."""

from __future__ import annotations

import hashlib
import json
import subprocess
import unicodedata
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Final, NoReturn, cast

import pytest

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
CORPUS_PATH: Final = REPOSITORY_ROOT / "benchmarks" / "tts" / "corpus-v1.json"
BENCHMARK_ROOT: Final = REPOSITORY_ROOT / "benchmarks" / "tts"
EXPECTED_CORPUS_SHA256: Final = "7727e0ea0b2763690e3cffbd72074fd907d8bf3ca2a10addd028ba9072df96bb"
REQUIRED_TAGS: Final = frozenset(
    {
        "punctuation",
        "dialogue",
        "abbreviations",
        "initials",
        "cardinals",
        "ordinals",
        "decimals",
        "thousands",
        "dates",
        "times",
        "currency",
        "percent",
        "code",
        "combining-sequence",
        "astral-character",
        "embedded-foreign-name",
    }
)
FORBIDDEN_TRACKED_SUFFIXES: Final = frozenset(
    {
        ".azw",
        ".azw3",
        ".ckpt",
        ".epub",
        ".flac",
        ".gguf",
        ".m4a",
        ".mobi",
        ".mp3",
        ".onnx",
        ".pcm",
        ".pdf",
        ".pt",
        ".pth",
        ".safetensors",
        ".wav",
    }
)
PRIVATE_PATH_MARKERS: Final = (
    "c:\\users\\",
    "/users/",
    "/home/",
    "file://",
)


def fail(code: str, case_id: str = "corpus") -> NoReturn:
    """Raise only a fixed code and stable case identifier."""
    raise AssertionError(f"tts-corpus-authority:{code}:{case_id}")


def read_mapping(value: object, *, code: str, case_id: str = "corpus") -> Mapping[str, object]:
    if not isinstance(value, dict):
        fail(code, case_id)
    return cast(Mapping[str, object], value)


def read_sequence(value: object, *, code: str, case_id: str = "corpus") -> Sequence[object]:
    if not isinstance(value, list):
        fail(code, case_id)
    return cast(Sequence[object], value)


def read_string(value: object, *, code: str, case_id: str = "corpus") -> str:
    if not isinstance(value, str):
        fail(code, case_id)
    return value


def read_integer(value: object, *, code: str, case_id: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool):
        fail(code, case_id)
    return value


def load_corpus() -> tuple[bytes, Mapping[str, object]]:
    payload = CORPUS_PATH.read_bytes()
    if payload.startswith(b"\xef\xbb\xbf") or b"\r\n" in payload:
        fail("noncanonical-bytes")
    try:
        decoded = payload.decode("utf-8", errors="strict")
        parsed = json.loads(decoded)
    except (UnicodeDecodeError, json.JSONDecodeError):
        fail("invalid-json")
    return payload, read_mapping(parsed, code="invalid-root")


def load_cases(corpus: Mapping[str, object]) -> tuple[Mapping[str, object], ...]:
    raw_cases = read_sequence(corpus.get("cases"), code="invalid-cases")
    return tuple(
        read_mapping(raw_case, code="invalid-case", case_id=f"index-{index}")
        for index, raw_case in enumerate(raw_cases)
    )


def validate_case(raw_case: Mapping[str, object]) -> tuple[str, str, frozenset[str]]:
    case_id = read_string(raw_case.get("caseId"), code="invalid-case-id")
    text = read_string(raw_case.get("text"), code="invalid-text", case_id=case_id)
    language = read_string(raw_case.get("language"), code="invalid-language", case_id=case_id)
    size_class = read_string(raw_case.get("sizeClass"), code="invalid-size-class", case_id=case_id)
    canary = read_string(raw_case.get("privacyCanary"), code="invalid-canary", case_id=case_id)
    raw_tags = read_sequence(raw_case.get("tags"), code="invalid-tags", case_id=case_id)
    tags = frozenset(
        read_string(raw_tag, code="invalid-tag", case_id=case_id) for raw_tag in raw_tags
    )
    expected_code_points = read_integer(
        raw_case.get("codePointCount"), code="invalid-code-point-count", case_id=case_id
    )
    expected_utf8_bytes = read_integer(
        raw_case.get("utf8ByteCount"), code="invalid-byte-count", case_id=case_id
    )

    if language != "es":
        fail("language-policy", case_id)
    if canary in text or not canary.startswith("tts-corpus-canary-"):
        fail("canary-policy", case_id)
    if len(text) != expected_code_points or len(text.encode("utf-8")) != expected_utf8_bytes:
        fail("count-mismatch", case_id)
    if expected_code_points > 640 or expected_utf8_bytes > 2048:
        fail("segment-hard-limit", case_id)
    if size_class == "short" and expected_code_points > 128:
        fail("size-class", case_id)
    if size_class == "target" and not 256 <= expected_code_points <= 384:
        fail("size-class", case_id)
    if size_class == "near-hard" and not 576 <= expected_code_points <= 640:
        fail("size-class", case_id)
    if size_class not in {"short", "target", "near-hard"}:
        fail("size-class", case_id)

    return case_id, canary, tags


def test_corpus_bytes_order_counts_boundaries_and_coverage_are_frozen() -> None:
    payload, corpus = load_corpus()
    if hashlib.sha256(payload).hexdigest() != EXPECTED_CORPUS_SHA256:
        fail("byte-drift")

    cases = load_cases(corpus)
    validated = tuple(validate_case(raw_case) for raw_case in cases)
    case_ids = tuple(case_id for case_id, _, _ in validated)
    canaries = tuple(canary for _, canary, _ in validated)
    tags = frozenset(tag for _, _, case_tags in validated for tag in case_tags)
    performance_order = tuple(
        read_string(value, code="invalid-performance-order")
        for value in read_sequence(corpus.get("performanceOrder"), code="invalid-performance-order")
    )

    if len(case_ids) != len(set(case_ids)) or len(canaries) != len(set(canaries)):
        fail("duplicate-identity")
    if performance_order != case_ids:
        fail("performance-order")
    if not REQUIRED_TAGS.issubset(tags):
        fail("coverage")

    texts = tuple(
        read_string(raw_case.get("text"), code="invalid-text", case_id=case_id)
        for raw_case, case_id in zip(cases, case_ids, strict=True)
    )
    if not any(unicodedata.normalize("NFC", text) != text for text in texts):
        fail("combining-coverage")
    if not any(any(ord(character) > 0xFFFF for character in text) for text in texts):
        fail("astral-coverage")

    case_code_points = {
        case_id: read_integer(
            raw_case.get("codePointCount"), code="invalid-code-point-count", case_id=case_id
        )
        for raw_case, case_id in zip(cases, case_ids, strict=True)
    }
    sustained_sequence = tuple(
        read_string(value, code="invalid-sustained-order")
        for value in read_sequence(corpus.get("sustainedSequence"), code="invalid-sustained-order")
    )
    if not 8 <= len(sustained_sequence) <= 16:
        fail("sustained-length")
    if any(case_id not in case_code_points for case_id in sustained_sequence):
        fail("sustained-reference")
    if sum(case_code_points[case_id] for case_id in sustained_sequence) > 8192:
        fail("sustained-batch-limit")


def test_failure_message_uses_only_fixed_code_and_case_id() -> None:
    _, corpus = load_corpus()
    first_case = dict(load_cases(corpus)[0])
    first_case["codePointCount"] = 999

    with pytest.raises(
        AssertionError,
        match=r"^tts-corpus-authority:count-mismatch:es-punctuation-dialogue-short$",
    ):
        validate_case(first_case)


def test_raw_results_are_ignored_and_tracked_benchmark_artifacts_are_content_safe() -> None:
    ignored_probe = "benchmarks/results/raw/authority-test/session.json"
    ignored = subprocess.run(
        ["git", "check-ignore", "--quiet", ignored_probe],
        cwd=REPOSITORY_ROOT,
        check=False,
    )
    if ignored.returncode != 0:
        fail("raw-results-not-ignored")

    tracked = subprocess.run(
        ["git", "ls-files", "-z", "benchmarks", "services/tts/benchmarks"],
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
    ).stdout.decode("utf-8", errors="strict")
    tracked_paths = tuple(path for path in tracked.split("\0") if path)
    if any(Path(path).suffix.lower() in FORBIDDEN_TRACKED_SUFFIXES for path in tracked_paths):
        fail("forbidden-tracked-artifact")
    if any(path.startswith("benchmarks/results/raw/") for path in tracked_paths):
        fail("tracked-raw-result")

    _, corpus = load_corpus()
    cases = load_cases(corpus)
    sensitive_values = tuple(
        value
        for raw_case in cases
        for value in (
            read_string(raw_case.get("text"), code="invalid-text"),
            read_string(raw_case.get("privacyCanary"), code="invalid-canary"),
        )
    )
    for path in BENCHMARK_ROOT.rglob("*"):
        if not path.is_file() or path == CORPUS_PATH or "raw" in path.parts:
            continue
        content = path.read_text(encoding="utf-8").lower()
        if any(value.lower() in content for value in sensitive_values):
            fail("sensitive-summary-content", path.name)
        if any(marker in content for marker in PRIVATE_PATH_MARKERS):
            fail("private-path", path.name)
