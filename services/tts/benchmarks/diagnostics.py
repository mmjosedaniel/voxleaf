"""Bounded candidate diagnostic capture that never publishes captured text."""

from __future__ import annotations

import io
from collections.abc import Iterable
from contextlib import AbstractContextManager, ExitStack, redirect_stderr, redirect_stdout
from dataclasses import dataclass
from types import TracebackType
from typing import Final

MAX_DIAGNOSTIC_BYTES: Final = 65_536


@dataclass(frozen=True)
class DiagnosticObservation:
    bytes_observed: int
    truncated: bool
    sensitive_value_observed: bool


class _BoundedDiagnosticWriter(io.StringIO):
    def __init__(self, forbidden_values: Iterable[str], maximum_bytes: int) -> None:
        super().__init__()
        self._forbidden_values = tuple(value for value in forbidden_values if value)
        self._maximum_bytes = maximum_bytes
        self._retained = bytearray()
        self._bytes_observed = 0
        self._truncated = False
        self._sensitive = False

    def write(self, value: str) -> int:
        encoded = value.encode("utf-8", errors="replace")
        self._bytes_observed += len(encoded)
        remaining = self._maximum_bytes - len(self._retained)
        if remaining > 0:
            self._retained.extend(encoded[:remaining])
        if len(encoded) > remaining:
            self._truncated = True

        retained_text = self._retained.decode("utf-8", errors="ignore")
        self._sensitive = self._sensitive or any(
            forbidden in value or forbidden in retained_text for forbidden in self._forbidden_values
        )
        return len(value)

    def observation(self) -> DiagnosticObservation:
        return DiagnosticObservation(
            bytes_observed=self._bytes_observed,
            truncated=self._truncated,
            sensitive_value_observed=self._sensitive,
        )

    def discard(self) -> None:
        self._retained.clear()


class DiagnosticCapture(AbstractContextManager["DiagnosticCapture"]):
    """Redirect stdout/stderr to bounded transient buffers."""

    def __init__(
        self,
        *,
        forbidden_values: Iterable[str],
        maximum_bytes: int = MAX_DIAGNOSTIC_BYTES,
    ) -> None:
        if maximum_bytes <= 0:
            raise ValueError("tts-benchmark-diagnostic:invalid-bound")
        self._writer = _BoundedDiagnosticWriter(forbidden_values, maximum_bytes)
        self._stack: ExitStack | None = None

    def __enter__(self) -> DiagnosticCapture:
        self._stack = ExitStack()
        self._stack.enter_context(redirect_stdout(self._writer))
        self._stack.enter_context(redirect_stderr(self._writer))
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        traceback: TracebackType | None,
    ) -> None:
        if self._stack is not None:
            self._stack.__exit__(exc_type, exc, traceback)

    def observation(self) -> DiagnosticObservation:
        return self._writer.observation()

    def discard(self) -> None:
        self._writer.discard()
