"""Lifecycle tests for private v5 derivation evidence."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from benchmarks import dual_worker_result_cli
from benchmarks.dual_worker_official import official_raw_root
from benchmarks.dual_worker_result import DualWorkerResultError

SESSION_ID = "0123456789abcdef0123456789abcdef"


def _raw_session(repository_root: Path) -> Path:
    session = official_raw_root(repository_root, SESSION_ID)
    session.mkdir(parents=True)
    (session / "raw.json").write_text(
        json.dumps({"arm": "cpu-solo", "cleanup": {"rawSessionRemoved": False}}),
        encoding="utf-8",
    )
    return session


def test_failed_derivation_retains_ignored_raw_for_diagnosis(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = _raw_session(tmp_path)
    monkeypatch.setattr(dual_worker_result_cli, "REPOSITORY_ROOT", tmp_path)
    monkeypatch.setattr(
        dual_worker_result_cli,
        "derive_v5_summary",
        lambda *_args, **_kwargs: (_ for _ in ()).throw(DualWorkerResultError("invalid")),
    )

    with pytest.raises(DualWorkerResultError, match="invalid"):
        dual_worker_result_cli._run({"sessionId": SESSION_ID, "arm": "cpu-solo"})

    assert session.is_dir()


def test_successful_derivation_deletes_private_raw_after_summary(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    session = _raw_session(tmp_path)
    monkeypatch.setattr(dual_worker_result_cli, "REPOSITORY_ROOT", tmp_path)
    monkeypatch.setattr(
        dual_worker_result_cli,
        "derive_v5_summary",
        lambda *_args, **_kwargs: {"status": "safe"},
    )

    result = dual_worker_result_cli._run({"sessionId": SESSION_ID, "arm": "cpu-solo"})

    assert result == {"status": "safe"}
    assert not session.exists()
