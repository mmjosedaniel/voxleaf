"""Ignored, bounded, content-free hardware observation journal."""

from __future__ import annotations

import json
import re
import shutil
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Final

from benchmarks.contracts import (
    BenchmarkFailure,
    CancellationObservation,
    CancellationTrialId,
    GenerationObservation,
    LoadObservation,
    MemoryObservation,
)

RAW_VERSION: Final = "tts-feasibility-raw-v2"
PROTOCOL_VERSION: Final = "tts-feasibility-profile-v2"
MAXIMUM_RAW_BYTES: Final = 262_144
MAXIMUM_LOAD_OBSERVATIONS: Final = 5
MAXIMUM_GENERATION_OBSERVATIONS: Final = 144
MAXIMUM_CANCELLATION_TRIALS: Final = 5
MAXIMUM_FAILURES: Final = 16
_STABLE_ID = re.compile(r"^[a-z0-9][a-z0-9._:-]{0,127}$")
_SESSION_ID = re.compile(r"^[a-f0-9]{32}$")
_ABSOLUTE_WINDOWS_PATH = re.compile(rb"[A-Za-z]:[\\/]")
_PRIVATE_PATH_MARKERS: Final = (b"\\\\Users\\\\", b"/Users/", b"/home/")


class RawJournalError(RuntimeError):
    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-raw:{code}")
        self.code = code


class RawMeasurementJournal:
    """Collect the fixed maximum protocol shape without text or audio."""

    def __init__(
        self,
        *,
        candidate_id: str,
        role: str,
        commit_sha: str,
        session_id: str,
        protocol_version: str = PROTOCOL_VERSION,
        configuration_identity_sha256: str | None = None,
    ) -> None:
        if (
            _STABLE_ID.fullmatch(candidate_id) is None
            or role not in ("balanced", "compatibility")
            or re.fullmatch(r"[0-9a-f]{40}", commit_sha) is None
            or _SESSION_ID.fullmatch(session_id) is None
            or protocol_version not in ("tts-feasibility-profile-v2", "tts-feasibility-profile-v3")
            or (
                configuration_identity_sha256 is not None
                and re.fullmatch(r"[0-9a-f]{64}", configuration_identity_sha256) is None
            )
            or (
                protocol_version == "tts-feasibility-profile-v3"
                and configuration_identity_sha256 is None
            )
            or (
                protocol_version == "tts-feasibility-profile-v2"
                and configuration_identity_sha256 is not None
            )
        ):
            raise RawJournalError("invalid-metadata")
        metadata: dict[str, object] = {
            "protocolVersion": protocol_version,
            "candidateId": candidate_id,
            "role": role,
            "commitSha": commit_sha,
            "sessionId": session_id,
        }
        if configuration_identity_sha256 is not None:
            metadata["configurationIdentitySha256"] = configuration_identity_sha256
        self._metadata: Mapping[str, object] = metadata
        self._loads: list[dict[str, object]] = []
        self._generations: list[dict[str, object]] = []
        self._cancellations: list[dict[str, object]] = []
        self._memory: dict[str, object] | None = None
        self._failures: list[dict[str, object]] = []

    @property
    def session_id(self) -> str:
        return str(self._metadata["sessionId"])

    @property
    def candidate_id(self) -> str:
        return str(self._metadata["candidateId"])

    def record_load(self, observation: LoadObservation) -> None:
        if len(self._loads) >= MAXIMUM_LOAD_OBSERVATIONS:
            raise RawJournalError("observation-limit")
        self._loads.append(
            {
                "observationIndex": observation.observation_index,
                "loadNanoseconds": observation.load_ns,
                "cleanupNanoseconds": observation.cleanup_ns,
            }
        )

    def record_generation(self, observation: GenerationObservation) -> None:
        if (
            len(self._generations) >= MAXIMUM_GENERATION_OBSERVATIONS
            or _STABLE_ID.fullmatch(observation.case_id) is None
        ):
            raise RawJournalError("observation-limit")
        self._generations.append(
            {
                "caseId": observation.case_id,
                "phase": observation.phase,
                "sampleCount": observation.sample_count,
                "sampleRateHz": observation.sample_rate_hz,
                "channels": observation.channels,
                "sampleFormat": observation.sample_format,
                "wallNanoseconds": observation.wall_ns,
                "firstAudioNanoseconds": observation.first_audio_ns,
                "timeToFifteenSecondsNanoseconds": observation.time_to_fifteen_seconds_ns,
            }
        )

    def record_cancellation(self, observation: CancellationObservation) -> None:
        if len(self._cancellations) >= MAXIMUM_CANCELLATION_TRIALS:
            raise RawJournalError("observation-limit")
        self._cancellations.append(
            {
                "trialId": observation.trial_id,
                "status": "pass",
                "stopMode": observation.stop_mode,
                "stopNanoseconds": observation.stop_ns,
                "cleanupNanoseconds": observation.cleanup_ns,
                "staleFrames": observation.stale_frames,
                "rawSessionRemoved": observation.raw_session_removed,
            }
        )

    def record_cancellation_failure(
        self,
        trial_id: CancellationTrialId,
        failure: BenchmarkFailure,
    ) -> None:
        if len(self._cancellations) >= MAXIMUM_CANCELLATION_TRIALS:
            raise RawJournalError("observation-limit")
        self._cancellations.append(
            {
                "trialId": trial_id,
                "status": "fail",
                "failureCode": failure.code,
            }
        )

    def record_memory(self, observation: MemoryObservation) -> None:
        if self._memory is not None:
            raise RawJournalError("observation-limit")
        self._memory = {
            "ramSamplingIntervalMilliseconds": (observation.ram_sampling_interval_milliseconds),
            "processVramSamplingIntervalMilliseconds": (
                observation.process_vram_sampling_interval_milliseconds
            ),
            "vramMeasurementMethod": observation.vram_measurement_method,
            "peakProcessTreeRamBytes": observation.peak_process_tree_ram_bytes,
            "peakProcessVramBytes": observation.peak_process_vram_bytes,
            "peakFrameworkVramBytes": observation.peak_framework_vram_bytes,
            "peakVramBytes": observation.peak_vram_bytes,
            "gpuProviderAllocations": observation.gpu_provider_allocations,
        }

    def record_failure(self, failure: BenchmarkFailure) -> None:
        if (
            len(self._failures) >= MAXIMUM_FAILURES
            or _STABLE_ID.fullmatch(failure.request_id) is None
        ):
            raise RawJournalError("observation-limit")
        self._failures.append(
            {
                "failureCode": failure.code,
                "requestId": failure.request_id,
            }
        )

    def payload(self, *, status: str) -> dict[str, object]:
        if status not in ("complete", "failed", "invalid"):
            raise RawJournalError("invalid-status")
        raw_version = (
            "tts-feasibility-raw-v3"
            if self._metadata["protocolVersion"] == "tts-feasibility-profile-v3"
            else RAW_VERSION
        )
        return {
            "rawVersion": raw_version,
            **self._metadata,
            "status": status,
            "loadObservations": self._loads,
            "generationObservations": self._generations,
            "cancellationTrials": self._cancellations,
            "memory": self._memory,
            "failures": self._failures,
        }

    def counts(self) -> dict[str, int]:
        return {
            "coldLoads": len(self._loads),
            "warmGenerations": sum(value.get("phase") == "warm" for value in self._generations),
            "sustainedGenerations": sum(
                value.get("phase") == "sustained" for value in self._generations
            ),
            "cancellationTrials": len(self._cancellations),
        }

    def write(
        self,
        raw_root: Path,
        *,
        status: str,
        forbidden_values: Sequence[str],
    ) -> Path:
        payload = (
            json.dumps(
                self.payload(status=status),
                ensure_ascii=True,
                separators=(",", ":"),
            )
            + "\n"
        ).encode("utf-8")
        if len(payload) > MAXIMUM_RAW_BYTES:
            raise RawJournalError("size")
        if _ABSOLUTE_WINDOWS_PATH.search(payload) is not None or any(
            marker in payload for marker in _PRIVATE_PATH_MARKERS
        ):
            raise RawJournalError("private-path")
        if any(value and value.encode("utf-8") in payload for value in forbidden_values):
            raise RawJournalError("sensitive-value")

        root = raw_root.resolve()
        session = (root / self.candidate_id / self.session_id).resolve()
        try:
            relative = session.relative_to(root)
        except ValueError:
            raise RawJournalError("session-path") from None
        if len(relative.parts) != 2 or session.exists():
            raise RawJournalError("session-path")
        session.mkdir(parents=True)
        version = (
            "v3" if self._metadata["protocolVersion"] == "tts-feasibility-profile-v3" else "v2"
        )
        target = session / f"performance-{version}.raw.json"
        try:
            target.write_bytes(payload)
        except Exception:
            shutil.rmtree(session, ignore_errors=True)
            raise RawJournalError("write") from None
        return target
