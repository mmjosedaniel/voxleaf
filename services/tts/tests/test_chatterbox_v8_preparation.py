from pathlib import Path

import pytest

from voxleaf_tts import release_chatterbox
from voxleaf_tts.packaging.chatterbox_authority import load_source_manifest
from voxleaf_tts.packaging.chatterbox_integrity import (
    PackageLayout,
    ReleaseChatterboxError,
    build_runtime_manifest,
)


def test_vf0114_prepared_successor_uses_v7_dependencies_and_distinct_entry(tmp_path: Path) -> None:
    predecessor = load_source_manifest(package_version="7")
    candidate = load_source_manifest(package_version="8")
    assert candidate["chatterboxLock"] == predecessor["chatterboxLock"]
    assert candidate["modelFiles"] == predecessor["modelFiles"]
    assert candidate["runtimeRelease"] == {
        "maximumPartBytes": 1_900_000_000,
        "maximumParts": 4,
        "published": False,
        "admitted": False,
    }
    assert PackageLayout("8").dist(tmp_path, tmp_path) == tmp_path / "v8"
    assert build_runtime_manifest(tmp_path, package_version="8")["serviceModule"] == (
        "voxleaf_tts.chatterbox_service_v2"
    )
    assert build_runtime_manifest(tmp_path, package_version="7")["serviceModule"] == (
        "voxleaf_tts.chatterbox_service"
    )


def test_vf0114_successor_requires_hash_synchronization_before_package_access() -> None:
    with pytest.raises(ReleaseChatterboxError, match="chatterbox-package-security-sync-required"):
        release_chatterbox.build_package(package_version="8", synchronise=False)


@pytest.mark.parametrize(
    "command", ["write-acquisition", "check-acquisition", "reconcile-evidence"]
)
def test_vf0114_successor_cannot_enter_historical_acquisition_authority(
    command: str, capsys: pytest.CaptureFixture[str]
) -> None:
    with pytest.raises(SystemExit) as error:
        release_chatterbox.main([command, "--package-version", "8"])
    assert error.value.code == 2
    assert "version 8 is local-only and has no acquisition authority" in capsys.readouterr().err
