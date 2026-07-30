"""Exact admitted Piper CPU protocol-v1 service entry point."""

from __future__ import annotations

import os
import sys
from pathlib import Path

from .engine import EngineFailure
from .piper_adapter import ENGLISH_PROFILE, SPANISH_PROFILE, PiperCpuTtsEngine
from .service import run_service


def main() -> int:
    """Run the exact local adapter from the native-selected private working root."""

    try:
        profile_name = os.environ.get("VOXLEAF_TTS_RUNTIME_PIPER_VOICE")
        if profile_name is None:
            return 1
        profile = {
            "davefx-es": SPANISH_PROFILE,
            "joe-en": ENGLISH_PROFILE,
        }.get(profile_name)
        if profile is None:
            return 1
        engine = PiperCpuTtsEngine(Path.cwd(), profile=profile)
    except EngineFailure:
        return 1
    return run_service(sys.stdin.buffer, sys.stdout.buffer, engine)


if __name__ == "__main__":
    raise SystemExit(main())
