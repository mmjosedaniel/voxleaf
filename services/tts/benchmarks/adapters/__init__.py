"""Thin benchmark-only adapters for the admitted local TTS candidates."""

from benchmarks.adapters.factory import (
    CandidateAdapterFactory,
    create_isolated_candidate_adapter,
)
from benchmarks.adapters.manifest import (
    CandidateConfiguration,
    CandidateProfile,
    load_candidate_profile,
)
from benchmarks.adapters.qwen3 import Qwen3TtsAdapter
from benchmarks.adapters.supertonic3 import Supertonic3Adapter

__all__ = [
    "CandidateConfiguration",
    "CandidateAdapterFactory",
    "CandidateProfile",
    "Qwen3TtsAdapter",
    "Supertonic3Adapter",
    "create_isolated_candidate_adapter",
    "load_candidate_profile",
]
