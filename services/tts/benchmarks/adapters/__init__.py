"""Thin benchmark-only adapters for the admitted local TTS candidates."""

from benchmarks.adapters.manifest import (
    CandidateConfiguration,
    CandidateProfile,
    load_candidate_profile,
)
from benchmarks.adapters.qwen3 import Qwen3TtsAdapter
from benchmarks.adapters.supertonic3 import Supertonic3Adapter

__all__ = [
    "CandidateConfiguration",
    "CandidateProfile",
    "Qwen3TtsAdapter",
    "Supertonic3Adapter",
    "load_candidate_profile",
]
