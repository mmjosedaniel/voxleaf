"""Exact admitted Qwen built-in-voice protocol-v1 service entry point."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from .engine import EngineFailure
from .qwen_adapter import (
    AIDEN_ENGLISH_PROFILE,
    SERENA_SPANISH_PROFILE,
    QwenSerenaTtsEngine,
)
from .service import run_service


def main() -> int:
    """Run the exact local adapter from the native-selected private working root."""

    try:
        profile_name = os.environ.get("VOXLEAF_TTS_RUNTIME_QWEN_VOICE")
        if profile_name is None:
            return 1
        profile = {
            "serena-es": SERENA_SPANISH_PROFILE,
            "aiden-en": AIDEN_ENGLISH_PROFILE,
        }.get(profile_name)
        if profile is None:
            return 1
        engine = QwenSerenaTtsEngine(Path.cwd(), profile=profile)
    except EngineFailure:
        return 1
    return run_service(sys.stdin.buffer, sys.stdout.buffer, engine)


if __name__ == "__main__":
    raise SystemExit(main())
