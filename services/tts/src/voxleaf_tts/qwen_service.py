"""Exact Qwen/Serena protocol-v1 service entry point."""

from __future__ import annotations

import sys
from pathlib import Path

from .engine import EngineFailure
from .qwen_adapter import QwenSerenaTtsEngine
from .service import run_service


def main() -> int:
    """Run the exact local adapter from the native-selected private working root."""

    try:
        engine = QwenSerenaTtsEngine(Path.cwd())
    except EngineFailure:
        return 1
    return run_service(sys.stdin.buffer, sys.stdout.buffer, engine)


if __name__ == "__main__":
    raise SystemExit(main())
