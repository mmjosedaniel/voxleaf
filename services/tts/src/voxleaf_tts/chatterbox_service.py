"""Exact Chatterbox bilingual protocol-v1 service entry point."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from .chatterbox_adapter import ChatterboxMultilingualTtsEngine
from .engine import EngineFailure
from .service import run_service


def main() -> int:
    """Run one exact language configuration from the native private root."""

    language = os.environ.get("VOXLEAF_TTS_RUNTIME_CHATTERBOX_LANGUAGE")
    if language not in {"es", "en"}:
        return 1
    try:
        engine = ChatterboxMultilingualTtsEngine(Path.cwd(), language)
    except EngineFailure:
        return 1
    return run_service(sys.stdin.buffer, sys.stdout.buffer, engine)


if __name__ == "__main__":
    raise SystemExit(main())
