"""Isolated historical inputs for model-free benchmark tests."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

import pytest


@pytest.fixture
def benchmark_v6_repository(tmp_path: Path) -> Path:
    """Materialize the frozen v6 authorities without consulting live Git."""
    repository = Path(__file__).resolve().parents[3]
    root = tmp_path / "benchmark-v6-repository"
    profile_path = Path("benchmarks/tts/profile-v6.json")
    profile_bytes = (repository / profile_path).read_bytes()
    profile = json.loads(profile_bytes)
    target = root / profile_path
    target.parent.mkdir(parents=True)
    target.write_bytes(profile_bytes)
    for name, authority in profile["authorities"].items():
        relative = Path(authority["path"])
        source = repository / relative
        if name == "normalizerImplementation":
            source = Path(__file__).parent / "fixtures/v6/narration-normalizer.ts.txt"
        payload = source.read_bytes()
        assert hashlib.sha256(payload).hexdigest() == authority["sha256"], name
        target = root / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(payload)
    return root
