"""Bounded candidate-neutral local TTS benchmark harness."""

from __future__ import annotations

import json
import time
from collections.abc import Iterator, Mapping, Sequence
from contextlib import suppress
from pathlib import Path
from typing import Final, NoReturn, cast

from benchmarks.contracts import (
    AdapterFactory,
    AudioChunk,
    BenchmarkAdapter,
    BenchmarkCorpus,
    BenchmarkFailure,
    BenchmarkRun,
    BenchmarkRunResult,
    CancellationObservation,
    CancellationResponse,
    CancellationTrialId,
    CandidateRole,
    CorpusCase,
    FailureCode,
    GenerationObservation,
    GenerationRequest,
    LoadObservation,
    MemoryProbe,
    NanosecondClock,
    SampleFormat,
)
from benchmarks.diagnostics import DiagnosticCapture

MAX_INPUT_CODE_POINTS: Final = 640
MAX_CHUNKS_PER_REQUEST: Final = 4_096
MAX_SAMPLE_FRAMES_PER_REQUEST: Final = 115_200_000
MIN_SAMPLE_RATE_HZ: Final = 8_000
MAX_SAMPLE_RATE_HZ: Final = 192_000
MAX_CHANNELS: Final = 8
LOAD_TIMEOUT_NS: Final = 120_000_000_000
REQUEST_TIMEOUT_NS: Final = 120_000_000_000
CANCELLATION_TIMEOUT_NS: Final = 500_000_000
WORKER_TERMINATION_TIMEOUT_NS: Final = 2_000_000_000
CLEANUP_TIMEOUT_NS: Final = 5_000_000_000
SUSTAINED_TARGET_SAMPLE_SECONDS: Final = 180
MAX_SUSTAINED_ROUNDS: Final = 10
CANCELLATION_TRIAL_ORDER: Final[tuple[CancellationTrialId, ...]] = (
    "before-dispatch",
    "accepted-before-audio",
    "after-first-audio",
    "after-five-media-seconds",
    "near-hard-mid-generation",
)


class SystemNanosecondClock:
    def now_ns(self) -> int:
        return time.perf_counter_ns()


class _HarnessFailure(RuntimeError):
    def __init__(self, code: FailureCode, request_id: str = "benchmark") -> None:
        super().__init__(f"tts-benchmark:{code}:{request_id}")
        self.code = code
        self.request_id = request_id


def _fail(code: FailureCode, request_id: str = "benchmark") -> NoReturn:
    raise _HarnessFailure(code, request_id)


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


def _forbidden_values(corpus: BenchmarkCorpus) -> tuple[str, ...]:
    return tuple(
        value for case in corpus.cases.values() for value in (case.text, case.privacy_canary)
    )


def _validate_request(request: GenerationRequest) -> None:
    if (
        not request.request_id
        or len(request.request_id) > 128
        or not request.case_id
        or len(request.case_id) > 128
        or request.language != "es"
        or not request.text
        or len(request.text) > MAX_INPUT_CODE_POINTS
    ):
        _fail("invalid-request", request.request_id or "request")


def _validate_chunk(
    chunk: AudioChunk,
    *,
    request_id: str,
    expected_sequence: int,
    expected_format: tuple[int, int, str] | None,
) -> tuple[int, int, str]:
    output_format = (chunk.sample_rate_hz, chunk.channels, chunk.sample_format)
    if (
        chunk.request_id != request_id
        or chunk.sequence != expected_sequence
        or chunk.sample_count <= 0
        or not MIN_SAMPLE_RATE_HZ <= chunk.sample_rate_hz <= MAX_SAMPLE_RATE_HZ
        or not 1 <= chunk.channels <= MAX_CHANNELS
        or (expected_format is not None and output_format != expected_format)
    ):
        _fail("invalid-output", request_id)
    return output_format


class BenchmarkHarness:
    """Run the frozen protocol through one candidate-neutral adapter surface."""

    def __init__(
        self,
        *,
        clock: NanosecondClock,
        memory_probe: MemoryProbe,
    ) -> None:
        self._clock = clock
        self._memory_probe = memory_probe

    def _load(
        self,
        adapter: BenchmarkAdapter,
        *,
        forbidden_values: Sequence[str],
        request_id: str,
    ) -> int:
        started = self._clock.now_ns()
        capture = DiagnosticCapture(forbidden_values=forbidden_values)
        try:
            with capture:
                adapter.load()
        except Exception:
            _fail("load-failed", request_id)
        finally:
            observation = capture.observation()
            capture.discard()
        elapsed = self._clock.now_ns() - started
        if observation.sensitive_value_observed:
            _fail("privacy", request_id)
        if elapsed <= 0 or elapsed > LOAD_TIMEOUT_NS:
            _fail("timeout", request_id)
        return elapsed

    def _close(
        self,
        adapter: BenchmarkAdapter,
        *,
        forbidden_values: Sequence[str],
        request_id: str,
    ) -> int:
        started = self._clock.now_ns()
        capture = DiagnosticCapture(forbidden_values=forbidden_values)
        try:
            with capture:
                adapter.close()
        except Exception:
            _fail("cleanup-failed", request_id)
        finally:
            observation = capture.observation()
            capture.discard()
        elapsed = self._clock.now_ns() - started
        if observation.sensitive_value_observed:
            _fail("privacy", request_id)
        if elapsed < 0 or elapsed > CLEANUP_TIMEOUT_NS:
            _fail("cleanup-failed", request_id)
        return elapsed

    def _warm_up(
        self,
        adapter: BenchmarkAdapter,
        request: GenerationRequest,
        *,
        forbidden_values: Sequence[str],
    ) -> None:
        _validate_request(request)
        started = self._clock.now_ns()
        capture = DiagnosticCapture(forbidden_values=forbidden_values)
        try:
            with capture:
                adapter.warm_up(request)
        except Exception:
            _fail("warmup-failed", request.request_id)
        finally:
            observation = capture.observation()
            capture.discard()
        elapsed = self._clock.now_ns() - started
        if observation.sensitive_value_observed:
            _fail("privacy", request.request_id)
        if elapsed <= 0 or elapsed > REQUEST_TIMEOUT_NS:
            _fail("timeout", request.request_id)

    def observe_generation(
        self,
        adapter: BenchmarkAdapter,
        request: GenerationRequest,
        *,
        forbidden_values: Sequence[str],
    ) -> GenerationObservation:
        """Consume one request without retaining waveform payload or chunk arrays."""

        _validate_request(request)
        if request.phase not in ("warm", "sustained"):
            _fail("invalid-request", request.request_id)
        started = self._clock.now_ns()
        first_audio_ns: int | None = None
        time_to_fifteen_seconds_ns: int | None = None
        total_samples = 0
        chunk_count = 0
        expected_format: tuple[int, int, str] | None = None
        saw_end = False
        capture = DiagnosticCapture(forbidden_values=forbidden_values)
        try:
            with capture:
                chunks = adapter.generate(request)
                for chunk in chunks:
                    if saw_end:
                        _fail("invalid-output", request.request_id)
                    expected_format = _validate_chunk(
                        chunk,
                        request_id=request.request_id,
                        expected_sequence=chunk_count,
                        expected_format=expected_format,
                    )
                    chunk_count += 1
                    total_samples += chunk.sample_count
                    now = self._clock.now_ns()
                    elapsed = now - started
                    if first_audio_ns is None:
                        first_audio_ns = elapsed
                    if (
                        time_to_fifteen_seconds_ns is None
                        and total_samples >= 15 * chunk.sample_rate_hz
                    ):
                        time_to_fifteen_seconds_ns = elapsed
                    if (
                        chunk_count > MAX_CHUNKS_PER_REQUEST
                        or total_samples > MAX_SAMPLE_FRAMES_PER_REQUEST
                    ):
                        _fail("resource-limit", request.request_id)
                    if elapsed > REQUEST_TIMEOUT_NS:
                        _fail("timeout", request.request_id)
                    saw_end = chunk.end_of_output
        except _HarnessFailure:
            with suppress(Exception):
                adapter.cancel(request.request_id)
            raise
        except Exception:
            _fail("generation-failed", request.request_id)
        finally:
            diagnostic = capture.observation()
            capture.discard()

        wall_ns = self._clock.now_ns() - started
        if diagnostic.sensitive_value_observed:
            _fail("privacy", request.request_id)
        if (
            chunk_count == 0
            or total_samples <= 0
            or expected_format is None
            or first_audio_ns is None
            or not saw_end
        ):
            _fail("invalid-output", request.request_id)
        if wall_ns <= 0 or wall_ns > REQUEST_TIMEOUT_NS:
            _fail("timeout", request.request_id)
        sample_rate_hz, channels, sample_format = expected_format
        return GenerationObservation(
            case_id=request.case_id,
            phase=request.phase,
            sample_count=total_samples,
            sample_rate_hz=sample_rate_hz,
            channels=channels,
            sample_format=cast(SampleFormat, sample_format),
            wall_ns=wall_ns,
            first_audio_ns=first_audio_ns,
            time_to_fifteen_seconds_ns=time_to_fifteen_seconds_ns,
        )

    def _cancel(
        self,
        adapter: BenchmarkAdapter,
        request_id: str,
        *,
        forbidden_values: Sequence[str],
    ) -> tuple[CancellationResponse, int]:
        started = self._clock.now_ns()
        capture = DiagnosticCapture(forbidden_values=forbidden_values)
        try:
            with capture:
                response = adapter.cancel(request_id)
        except Exception:
            _fail("cancellation-failed", request_id)
        finally:
            diagnostic = capture.observation()
            capture.discard()
        elapsed = self._clock.now_ns() - started
        if diagnostic.sensitive_value_observed:
            _fail("privacy", request_id)
        if not response.acknowledged or response.stop_mode is None:
            _fail("cancellation-failed", request_id)
        limit = (
            CANCELLATION_TIMEOUT_NS
            if response.stop_mode == "cooperative"
            else WORKER_TERMINATION_TIMEOUT_NS
        )
        if elapsed < 0 or elapsed > limit:
            _fail("cancellation-failed", request_id)
        return response, elapsed

    def observe_cancellation(
        self,
        adapter: BenchmarkAdapter,
        request: GenerationRequest,
        trial_id: CancellationTrialId,
        *,
        forbidden_values: Sequence[str],
    ) -> CancellationObservation:
        """Exercise one fixed cancellation boundary and reject every late frame."""

        _validate_request(request)
        if request.phase != "cancellation":
            _fail("invalid-request", request.request_id)

        chunks: Iterator[AudioChunk] | None = None
        samples_before_cancel = 0
        stale_frames = 0
        expected_sequence = 0
        expected_format: tuple[int, int, str] | None = None
        capture = DiagnosticCapture(forbidden_values=forbidden_values)
        try:
            with capture:
                if trial_id != "before-dispatch":
                    chunks = adapter.generate(request)
                    if trial_id not in ("accepted-before-audio",):
                        while True:
                            chunk = next(chunks)
                            expected_format = _validate_chunk(
                                chunk,
                                request_id=request.request_id,
                                expected_sequence=expected_sequence,
                                expected_format=expected_format,
                            )
                            expected_sequence += 1
                            samples_before_cancel += chunk.sample_count
                            if trial_id in ("after-first-audio", "near-hard-mid-generation"):
                                break
                            if (
                                trial_id == "after-five-media-seconds"
                                and samples_before_cancel >= 5 * chunk.sample_rate_hz
                            ):
                                break
                response, stop_ns = self._cancel(
                    adapter,
                    request.request_id,
                    forbidden_values=forbidden_values,
                )
                if chunks is not None:
                    for chunk in chunks:
                        stale_frames += chunk.sample_count
        except StopIteration:
            _fail("cancellation-failed", request.request_id)
        finally:
            diagnostic = capture.observation()
            capture.discard()

        if diagnostic.sensitive_value_observed:
            _fail("privacy", request.request_id)
        if stale_frames != 0:
            _fail("cancellation-failed", request.request_id)
        if response.stop_mode is None:
            _fail("cancellation-failed", request.request_id)
        return CancellationObservation(
            trial_id=trial_id,
            stop_mode=response.stop_mode,
            stop_ns=stop_ns,
            cleanup_ns=0,
            stale_frames=0,
            raw_session_removed=True,
        )

    def run_protocol(
        self,
        *,
        adapter_factory: AdapterFactory,
        corpus: BenchmarkCorpus,
        role: str,
    ) -> BenchmarkRunResult:
        """Run the complete frozen order or return one fixed failure."""

        if role not in ("balanced", "compatibility"):
            return BenchmarkRunResult(
                run=None,
                failure=BenchmarkFailure(code="invalid-request"),
            )
        forbidden_values = _forbidden_values(corpus)
        main_adapter: BenchmarkAdapter | None = None
        memory_started = False
        try:
            load_observations: list[LoadObservation] = []
            for index in range(1, 6):
                adapter = adapter_factory()
                load_ns = self._load(
                    adapter,
                    forbidden_values=forbidden_values,
                    request_id=f"cold-{index}",
                )
                cleanup_ns = self._close(
                    adapter,
                    forbidden_values=forbidden_values,
                    request_id=f"cold-{index}",
                )
                load_observations.append(
                    LoadObservation(
                        observation_index=index,
                        load_ns=load_ns,
                        cleanup_ns=cleanup_ns,
                    )
                )

            main_adapter = adapter_factory()
            capabilities = main_adapter.capabilities()
            self._memory_probe.start()
            memory_started = True
            self._load(
                main_adapter,
                forbidden_values=forbidden_values,
                request_id="measurement-load",
            )
            first_case = corpus.cases[corpus.performance_order[0]]
            self._warm_up(
                main_adapter,
                GenerationRequest(
                    request_id="warmup-1",
                    case_id=first_case.case_id,
                    phase="warmup",
                    text=first_case.text,
                    language=first_case.language,
                ),
                forbidden_values=forbidden_values,
            )

            generation_observations: list[GenerationObservation] = []
            for pass_index in range(2):
                for case_id in corpus.performance_order:
                    case = corpus.cases[case_id]
                    generation_observations.append(
                        self.observe_generation(
                            main_adapter,
                            GenerationRequest(
                                request_id=f"warm-{pass_index + 1}-{case.case_id}",
                                case_id=case.case_id,
                                phase="warm",
                                text=case.text,
                                language=case.language,
                            ),
                            forbidden_values=forbidden_values,
                        )
                    )

            sustained_sample_seconds = 0.0
            sustained_count = 0
            for round_index in range(MAX_SUSTAINED_ROUNDS):
                for case_id in corpus.sustained_sequence:
                    case = corpus.cases[case_id]
                    observation = self.observe_generation(
                        main_adapter,
                        GenerationRequest(
                            request_id=f"sustained-{round_index + 1}-{sustained_count + 1}",
                            case_id=case.case_id,
                            phase="sustained",
                            text=case.text,
                            language=case.language,
                        ),
                        forbidden_values=forbidden_values,
                    )
                    generation_observations.append(observation)
                    sustained_count += 1
                    sustained_sample_seconds += (
                        observation.sample_count / observation.sample_rate_hz
                    )
                if sustained_sample_seconds >= SUSTAINED_TARGET_SAMPLE_SECONDS:
                    break
            if sustained_sample_seconds < SUSTAINED_TARGET_SAMPLE_SECONDS:
                _fail("resource-limit", "sustained")

            cancellation_observations: list[CancellationObservation] = []
            near_hard_case = corpus.cases["es-narrative-near-hard"]
            for trial_index, trial_id in enumerate(CANCELLATION_TRIAL_ORDER, start=1):
                case = near_hard_case if trial_id == "near-hard-mid-generation" else first_case
                cancellation_observations.append(
                    self.observe_cancellation(
                        main_adapter,
                        GenerationRequest(
                            request_id=f"cancel-{trial_index}",
                            case_id=case.case_id,
                            phase="cancellation",
                            text=case.text,
                            language=case.language,
                        ),
                        trial_id,
                        forbidden_values=forbidden_values,
                    )
                )

            self._close(
                main_adapter,
                forbidden_values=forbidden_values,
                request_id="measurement-close",
            )
            main_adapter = None
            memory = self._memory_probe.stop()
            memory_started = False

            output_shapes = {
                (
                    observation.sample_rate_hz,
                    observation.channels,
                    observation.sample_format,
                )
                for observation in generation_observations
            }
            if len(output_shapes) != 1:
                _fail("invalid-output")
            return BenchmarkRunResult(
                run=BenchmarkRun(
                    candidate_id=capabilities.candidate_id,
                    role=cast(CandidateRole, role),
                    capabilities=capabilities,
                    load_observations=tuple(load_observations),
                    generation_observations=tuple(generation_observations),
                    cancellation_observations=tuple(cancellation_observations),
                    memory=memory,
                    failed_observations=0,
                ),
                failure=None,
            )
        except _HarnessFailure as failure:
            if main_adapter is not None:
                with suppress(Exception):
                    main_adapter.close()
            if memory_started:
                with suppress(Exception):
                    self._memory_probe.stop()
            return BenchmarkRunResult(
                run=None,
                failure=BenchmarkFailure(
                    code=failure.code,
                    request_id=failure.request_id,
                ),
            )
