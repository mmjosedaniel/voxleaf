"""Exact Chatterbox bilingual protocol-v1 service entry point."""

from __future__ import annotations

import os
import sys
from collections.abc import Callable
from pathlib import Path

from .adapters.chatterbox import ChatterboxMultilingualTtsEngine
from .engine import EngineFailure, TtsEngine
from .protocol import PROTOCOL_VERSION, ProtocolVersion
from .service import run_service


def run_chatterbox(
    engine_factory: Callable[[Path, str], TtsEngine], protocol_version: ProtocolVersion
) -> int:
    """Run one exact language configuration from the native private root."""

    language = os.environ.get("VOXLEAF_TTS_RUNTIME_CHATTERBOX_LANGUAGE")
    if language not in {"es", "en"}:
        return 1
    try:
        engine = engine_factory(Path.cwd(), language)
    except EngineFailure:
        return 1
    return run_service(
        sys.stdin.buffer, sys.stdout.buffer, engine, protocol_version=protocol_version
    )


def main() -> int:
    return run_chatterbox(ChatterboxMultilingualTtsEngine, PROTOCOL_VERSION)


if __name__ == "__main__":
    raise SystemExit(main())
