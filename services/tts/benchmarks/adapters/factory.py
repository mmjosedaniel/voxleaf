"""Exact candidate dispatch without importing either candidate stack."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Final

from benchmarks.adapters.manifest import (
    QWEN_CANDIDATE_ID,
    QWEN_V3_CANDIDATE_ID,
    SUPERTONIC_CANDIDATE_ID,
    AdapterConfigurationError,
    CandidateConfiguration,
    CandidateProfile,
)
from benchmarks.adapters.qwen3 import Qwen3TtsAdapter
from benchmarks.adapters.supertonic3 import Supertonic3Adapter
from benchmarks.contracts import BenchmarkAdapter
from benchmarks.isolation import IsolatedBenchmarkAdapter, IsolationTimeouts


@dataclass(frozen=True)
class CandidateAdapterFactory:
    """Spawn-safe dispatch for exactly one frozen admitted profile."""

    profile: CandidateProfile
    configuration: CandidateConfiguration

    def __call__(self) -> BenchmarkAdapter:
        if self.profile.candidate_id in (QWEN_CANDIDATE_ID, QWEN_V3_CANDIDATE_ID):
            return Qwen3TtsAdapter(self.profile, self.configuration)
        if self.profile.candidate_id == SUPERTONIC_CANDIDATE_ID:
            return Supertonic3Adapter(self.profile, self.configuration)
        raise AdapterConfigurationError("candidate")


def create_isolated_candidate_adapter(
    *,
    profile: CandidateProfile,
    configuration: CandidateConfiguration,
    forbidden_values: tuple[str, ...],
    timeouts: IsolationTimeouts | None = None,
    framework_memory_observer: Callable[[int | None], None] | None = None,
) -> IsolatedBenchmarkAdapter:
    """Build the candidate-neutral worker boundary for one admitted profile."""

    return IsolatedBenchmarkAdapter(
        CandidateAdapterFactory(profile, configuration),
        forbidden_values=forbidden_values,
        timeouts=timeouts,
        framework_memory_observer=framework_memory_observer,
    )


ADAPTER_FACTORY_MODULE: Final = __name__
