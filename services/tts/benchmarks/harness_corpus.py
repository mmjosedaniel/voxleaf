"""Frozen legacy and bilingual corpus admission and ordered projections."""

from __future__ import annotations

import json
from collections.abc import Mapping
from pathlib import Path
from typing import cast

from benchmarks.contracts import BenchmarkCorpus, CorpusCase
from benchmarks.harness_errors import _fail


def _read_string(value: object) -> str:
    if not isinstance(value, str):
        _fail("invalid-request")
    return value


def load_corpus(path: Path) -> BenchmarkCorpus:
    """Load the frozen corpus without rewriting its sensitive text."""

    raw = cast(object, json.loads(path.read_text(encoding="utf-8")))
    if not isinstance(raw, dict):
        _fail("invalid-request")
    value = cast(Mapping[str, object], raw)
    raw_cases = value.get("cases")
    performance_order = value.get("performanceOrder")
    sustained_sequence = value.get("sustainedSequence")
    if (
        not isinstance(raw_cases, list)
        or not isinstance(performance_order, list)
        or not isinstance(sustained_sequence, list)
    ):
        _fail("invalid-request")

    cases: dict[str, CorpusCase] = {}
    for raw_case in raw_cases:
        if not isinstance(raw_case, dict):
            _fail("invalid-request")
        case = cast(Mapping[str, object], raw_case)
        corpus_case = CorpusCase(
            case_id=_read_string(case.get("caseId")),
            language=_read_string(case.get("language")),
            text=_read_string(case.get("text")),
            privacy_canary=_read_string(case.get("privacyCanary")),
        )
        if corpus_case.case_id in cases:
            _fail("invalid-request")
        cases[corpus_case.case_id] = corpus_case

    loaded_performance_order = tuple(_read_string(value) for value in performance_order)
    loaded_sustained_sequence = tuple(_read_string(value) for value in sustained_sequence)
    if (
        any(case_id not in cases for case_id in loaded_performance_order)
        or any(case_id not in cases for case_id in loaded_sustained_sequence)
        or len(loaded_performance_order) != len(cases)
    ):
        _fail("invalid-request")
    return BenchmarkCorpus(
        corpus_version=_read_string(value.get("corpusVersion")),
        performance_order=loaded_performance_order,
        sustained_sequence=loaded_sustained_sequence,
        cases=cases,
    )


def load_bilingual_corpus(path: Path, language: str) -> BenchmarkCorpus:
    """Load one language projection of the frozen bilingual v7/v8 corpus."""

    if language not in ("es", "en"):
        _fail("invalid-request")
    raw = cast(object, json.loads(path.read_text(encoding="utf-8")))
    if not isinstance(raw, dict):
        _fail("invalid-request")
    value = cast(Mapping[str, object], raw)
    if value.get("corpusVersion") != "tts-bilingual-corpus-v7":
        _fail("invalid-request")
    raw_cases = value.get("cases")
    quality_order = value.get("qualityOrderByLanguage")
    if not isinstance(raw_cases, list) or not isinstance(quality_order, dict):
        _fail("invalid-request")
    raw_order = cast(Mapping[str, object], quality_order).get(language)
    if not isinstance(raw_order, list):
        _fail("invalid-request")

    cases: dict[str, CorpusCase] = {}
    for raw_case in raw_cases:
        if not isinstance(raw_case, dict):
            _fail("invalid-request")
        case = cast(Mapping[str, object], raw_case)
        if case.get("language") != language:
            continue
        corpus_case = CorpusCase(
            case_id=_read_string(case.get("caseId")),
            language=_read_string(case.get("language")),
            text=_read_string(case.get("text")),
            privacy_canary=_read_string(case.get("privacyCanary")),
        )
        if corpus_case.case_id in cases:
            _fail("invalid-request")
        cases[corpus_case.case_id] = corpus_case
    order = tuple(_read_string(item) for item in raw_order)
    if len(order) != 5 or set(order) != set(cases):
        _fail("invalid-request")
    return BenchmarkCorpus(
        corpus_version="tts-bilingual-corpus-v7",
        performance_order=order,
        sustained_sequence=order,
        cases=cases,
    )
