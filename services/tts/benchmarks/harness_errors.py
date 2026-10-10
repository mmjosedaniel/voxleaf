"""One shared, content-free failure identity for benchmark coordination and input."""

from __future__ import annotations

from typing import NoReturn

from benchmarks.contracts import FailureCode


class _HarnessFailure(RuntimeError):
    def __init__(self, code: FailureCode, request_id: str = "benchmark") -> None:
        super().__init__(f"tts-benchmark:{code}:{request_id}")
        self.code = code
        self.request_id = request_id


_HarnessFailure.__module__ = "benchmarks.harness"


def _fail(code: FailureCode, request_id: str = "benchmark") -> NoReturn:
    raise _HarnessFailure(code, request_id)
