"""Private contracts for the candidate-neutral TTS benchmark."""

from __future__ import annotations

from collections.abc import Callable, Iterator, Mapping, Sequence
from dataclasses import dataclass, field
from typing import Literal, Protocol

type CandidateRole = Literal["balanced", "compatibility"]
type GenerationPhase = Literal["warmup", "warm", "sustained", "cancellation"]
type StreamingGranularity = Literal["sample-chunks", "complete-waveform"]
type SampleFormat = Literal["float32", "signed-int16"]
type CancellationCapability = Literal["cooperative", "worker-termination", "unsupported", "unknown"]
type CancellationStopMode = Literal["cooperative", "worker-termination"]
type CancellationTrialId = Literal[
    "before-dispatch",
    "accepted-before-audio",
    "after-first-audio",
    "after-five-media-seconds",
    "near-hard-mid-generation",
]
type FailureCode = Literal[
    "invalid-request",
    "adapter-unavailable",
    "load-failed",
    "warmup-failed",
    "generation-failed",
    "timeout",
    "crash",
    "resource-limit",
    "invalid-output",
    "privacy",
    "cancellation-failed",
    "cleanup-failed",
    "measurement-unavailable",
]


@dataclass(frozen=True)
class GenerationRequest:
    """One sensitive request admitted to the benchmark adapter."""

    request_id: str
    case_id: str
    phase: GenerationPhase
    text: str = field(repr=False)
    language: str = "es"


@dataclass(frozen=True)
class AudioChunk:
    """Payload-free metadata for one produced contiguous sample range."""

    request_id: str
    sequence: int
    sample_count: int
    sample_rate_hz: int
    channels: int
    sample_format: SampleFormat
    end_of_output: bool


@dataclass(frozen=True)
class AdapterCapabilities:
    """Content-free facts exposed by one exact candidate adapter."""

    candidate_id: str
    streaming_granularity: StreamingGranularity
    sample_format: SampleFormat
    generation_cancellation: CancellationCapability


@dataclass(frozen=True)
class CancellationResponse:
    """Fixed adapter response to one cancellation request."""

    acknowledged: bool
    stop_mode: CancellationStopMode | None


class BenchmarkAdapter(Protocol):
    """Narrow interface implemented by every benchmark candidate."""

    def capabilities(self) -> AdapterCapabilities:
        """Return content-free native output and cancellation capabilities."""

    def load(self) -> None:
        """Load the exact verified local profile and make it ready."""

    def warm_up(self, request: GenerationRequest) -> None:
        """Run one unreported warm-up request."""

    def generate(self, request: GenerationRequest) -> Iterator[AudioChunk]:
        """Yield payload-free sample metadata while discarding waveform payload."""

    def cancel(self, request_id: str) -> CancellationResponse:
        """Request cancellation for exactly one benchmark request identity."""

    def close(self) -> None:
        """Release the candidate and any candidate-owned resources."""


type AdapterFactory = Callable[[], BenchmarkAdapter]


class NanosecondClock(Protocol):
    """Injectable monotonic clock retaining integer nanoseconds."""

    def now_ns(self) -> int:
        """Return the current monotonic time in nanoseconds."""


@dataclass(frozen=True)
class CorpusCase:
    """One checked-in synthetic case used without text rewriting."""

    case_id: str
    language: str
    text: str = field(repr=False)
    privacy_canary: str = field(repr=False)


@dataclass(frozen=True)
class BenchmarkCorpus:
    """Frozen corpus order and cases needed by the harness."""

    corpus_version: str
    performance_order: tuple[str, ...]
    sustained_sequence: tuple[str, ...]
    cases: Mapping[str, CorpusCase] = field(repr=False)


@dataclass(frozen=True)
class LoadObservation:
    observation_index: int
    load_ns: int
    cleanup_ns: int


@dataclass(frozen=True)
class GenerationObservation:
    case_id: str
    phase: Literal["warm", "sustained"]
    sample_count: int
    sample_rate_hz: int
    channels: int
    sample_format: SampleFormat
    wall_ns: int
    first_audio_ns: int
    time_to_fifteen_seconds_ns: int | None


@dataclass(frozen=True)
class CancellationObservation:
    trial_id: CancellationTrialId
    stop_mode: CancellationStopMode
    stop_ns: int
    cleanup_ns: int
    stale_frames: int
    raw_session_removed: bool


@dataclass(frozen=True)
class MemoryObservation:
    sampling_interval_milliseconds: int
    peak_process_tree_ram_bytes: int
    peak_vram_bytes: int | None
    gpu_provider_allocations: int


@dataclass(frozen=True)
class BenchmarkFailure:
    """One fixed content-free failure safe for diagnostics and tests."""

    code: FailureCode
    request_id: str = "benchmark"


@dataclass(frozen=True)
class BenchmarkRun:
    """Candidate-neutral successful protocol observations."""

    candidate_id: str
    role: CandidateRole
    capabilities: AdapterCapabilities
    load_observations: tuple[LoadObservation, ...]
    generation_observations: tuple[GenerationObservation, ...]
    cancellation_observations: tuple[CancellationObservation, ...]
    memory: MemoryObservation
    failed_observations: int


@dataclass(frozen=True)
class BenchmarkRunResult:
    """Closed result for one complete deterministic protocol run."""

    run: BenchmarkRun | None
    failure: BenchmarkFailure | None


class MemoryProbe(Protocol):
    """Pluggable memory observation boundary."""

    def start(self) -> None:
        """Begin sampling before candidate load."""

    def stop(self) -> MemoryObservation:
        """Stop sampling and return only content-free peaks."""


@dataclass(frozen=True)
class ArtifactSummary:
    artifact_id: str
    revision: str
    sha256: str
    size_bytes: int


@dataclass(frozen=True)
class SummaryMetadata:
    """Explicit allowlisted context needed to serialize a summary."""

    report_purpose: Literal["official-summary", "schema-validation-fixture"]
    protocol_version: str
    corpus_version: str
    candidate_manifest_version: str
    role: CandidateRole
    commit_sha: str
    operating_system: Literal["Windows"]
    os_version: str
    architecture: Literal["x86_64"]
    python_version: str
    cpu_model: str
    logical_processors: int
    total_ram_bytes: int
    gpu_model: str | None
    driver_version: str
    engine_version: str
    model_revision: str
    voice_id: str
    provider: Literal["pytorch-cuda", "onnxruntime-cpu"]
    precision: Literal["bfloat16", "float32"]
    artifacts: tuple[ArtifactSummary, ...]
    quality: Mapping[str, object]
    audits: Mapping[str, object]
    gate_evaluation: Mapping[str, object]
    notes: Sequence[str]
