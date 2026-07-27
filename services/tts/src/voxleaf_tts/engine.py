"""Internal local-TTS engine contract shared by fake and exact adapters."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from enum import StrEnum
from typing import Protocol


class EngineFailureCode(StrEnum):
    """Closed content-free engine failure reasons."""

    INVALID_STATE = "invalid-state"
    UNAVAILABLE = "unavailable"
    FAILURE = "failure"
    TIMEOUT = "timeout"
    CRASH = "crash"


class EngineFailure(Exception):
    """An engine failure that retains no input, path, or implementation detail."""

    def __init__(self, code: EngineFailureCode) -> None:
        super().__init__("The local TTS engine operation failed.")
        self.code = code


@dataclass(frozen=True, slots=True)
class WorkIdentity:
    """Only opaque work identity retained while generation is active."""

    request_id: str
    session_id: str
    generation_id: str
    segment_id: str


@dataclass(frozen=True, slots=True)
class EngineResult:
    """One complete waveform and its fixed transport format."""

    sample_rate_hz: int
    channel_count: int
    payload: bytes


@dataclass(frozen=True, slots=True)
class EngineCapabilities:
    """Content-free capability values published through protocol v1."""

    local_speech_generation: str
    streaming_generation: str = "unsupported"
    generation_cancellation: str = "unsupported"
    hardware_acceleration: str = "unknown"
    cpu_fallback: str = "unsupported"


class TtsEngine(Protocol):
    """One-resident, one-active, no-queue engine boundary."""

    @property
    def has_active_operation(self) -> bool: ...

    @property
    def can_settle(self) -> bool: ...

    def capabilities(self) -> EngineCapabilities: ...

    def load(self) -> None: ...

    def warm(self) -> None: ...

    def begin(self, request_id: str, segment: Mapping[str, object]) -> WorkIdentity: ...

    def settle(self) -> tuple[WorkIdentity, EngineResult]: ...

    def cancel(self, identity: WorkIdentity) -> None: ...

    def release_result(self) -> None: ...

    def cleanup(self) -> None: ...
