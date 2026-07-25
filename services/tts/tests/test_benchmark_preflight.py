"""Deterministic official-run preflight tests."""

from __future__ import annotations

import hashlib
from dataclasses import replace
from pathlib import Path
from typing import Final

from benchmarks.adapters.manifest import (
    QWEN_CANDIDATE_ID,
    ArtifactIdentity,
    CandidateConfiguration,
    CandidateProfile,
)
from benchmarks.preflight import (
    GIB,
    HostSnapshot,
    PreflightRequest,
    RepositoryState,
    RunConditions,
    run_preflight,
)

COMMIT_SHA: Final = "a" * 40


class FixedRepositoryProbe:
    def __init__(self, *, clean: bool = True, commit_sha: str = COMMIT_SHA) -> None:
        self.state = RepositoryState(commit_sha=commit_sha, clean=clean)

    def snapshot(self, repository_root: Path) -> RepositoryState:
        del repository_root
        return self.state


class FixedHostProbe:
    def __init__(self, snapshot: HostSnapshot) -> None:
        self.state = snapshot

    def snapshot(self, repository_root: Path) -> HostSnapshot:
        del repository_root
        return self.state


class FixedNetworkProbe:
    def __init__(self, active: bool = True) -> None:
        self.is_active = active

    def active(self, candidate_python: Path) -> bool:
        del candidate_python
        return self.is_active


def host_snapshot() -> HostSnapshot:
    return HostSnapshot(
        operating_system="Windows",
        os_version="10.0.26200",
        architecture="x86_64",
        python_version="3.12.10",
        cpu_model="Synthetic CPU",
        logical_processors=20,
        total_ram_bytes=32 * GIB,
        free_ram_bytes=16 * GIB,
        free_disk_bytes=100 * GIB,
        power_online=True,
        power_mode="Balanced",
        gpu_model="Synthetic GPU",
        driver_version="fixture-1.0",
        total_vram_bytes=8 * GIB,
        free_vram_bytes=7 * GIB,
    )


def profile_and_configuration(tmp_path: Path) -> tuple[CandidateProfile, CandidateConfiguration]:
    payload = b"verified-local-model"
    artifact_path = tmp_path / "model.safetensors"
    artifact_path.write_bytes(payload)
    profile = CandidateProfile(
        candidate_id=QWEN_CANDIDATE_ID,
        role="balanced",
        distribution="qwen-tts",
        engine_version="0.1.1",
        model_revision="revision",
        voice_id="Aiden",
        provider="pytorch-cuda",
        precision="bfloat16",
        artifacts=(
            ArtifactIdentity(
                relative_path="model.safetensors",
                sha256=hashlib.sha256(payload).hexdigest(),
            ),
        ),
        output_sample_rate_hz=None,
    )
    configuration = CandidateConfiguration(
        candidate_id=profile.candidate_id,
        artifact_root=tmp_path.resolve(),
        model_revision=profile.model_revision,
        voice_id=profile.voice_id,
        provider=profile.provider,
        precision=profile.precision,
        offline=True,
    )
    return profile, configuration


def request(tmp_path: Path, *, purpose: str = "official") -> PreflightRequest:
    profile, configuration = profile_and_configuration(tmp_path)
    candidate_python = tmp_path / "python.exe"
    candidate_python.write_bytes(b"fixture")
    return PreflightRequest(
        expected_commit_sha=COMMIT_SHA,
        repository_root=tmp_path,
        profile=profile,
        configuration=configuration,
        candidate_python=candidate_python,
        conditions=RunConditions(
            purpose="pilot" if purpose == "pilot" else "official",
            sleep_disabled=True,
            background_load_acceptable=True,
            thermal_state_acceptable=True,
        ),
    )


def test_exact_official_preflight_passes_with_content_free_receipt(tmp_path: Path) -> None:
    result = run_preflight(
        request(tmp_path),
        repository_probe=FixedRepositoryProbe(),
        host_probe=FixedHostProbe(host_snapshot()),
        network_probe=FixedNetworkProbe(),
        environment={"HF_HUB_OFFLINE": "1", "TRANSFORMERS_OFFLINE": "1"},
    )
    assert result.failures == ()
    assert result.eligible_for_official_run is True
    assert result.eligible_for_promotion is True
    assert result.artifacts[0].artifact_id == "model.safetensors"
    assert result.artifacts[0].size_bytes == len(b"verified-local-model")
    assert str(tmp_path) not in repr(result)


def test_pilot_can_pass_but_is_never_eligible_for_promotion(tmp_path: Path) -> None:
    result = run_preflight(
        request(tmp_path, purpose="pilot"),
        repository_probe=FixedRepositoryProbe(),
        host_probe=FixedHostProbe(host_snapshot()),
        network_probe=FixedNetworkProbe(),
        environment={"HF_HUB_OFFLINE": "1", "TRANSFORMERS_OFFLINE": "1"},
    )
    assert result.failures == ()
    assert result.eligible_for_official_run is False
    assert result.eligible_for_promotion is False


def test_dirty_revision_artifact_offline_and_network_fail_closed(tmp_path: Path) -> None:
    preflight_request = request(tmp_path)
    (tmp_path / "model.safetensors").write_bytes(b"wrong")
    preflight_request = replace(
        preflight_request,
        expected_commit_sha="b" * 40,
    )
    result = run_preflight(
        preflight_request,
        repository_probe=FixedRepositoryProbe(clean=False),
        host_probe=FixedHostProbe(host_snapshot()),
        network_probe=FixedNetworkProbe(active=False),
        environment={},
    )
    assert result.failures == (
        "dirty-tree",
        "source-revision",
        "artifact",
        "offline-control",
        "network-isolation",
    )
    assert result.artifacts == ()
    assert result.eligible_for_official_run is False
    assert str(tmp_path) not in repr(result)
    assert b"wrong".decode() not in repr(result)


def test_resource_power_sleep_provider_and_operator_gates_fail_closed(
    tmp_path: Path,
) -> None:
    preflight_request = request(tmp_path)
    preflight_request = replace(
        preflight_request,
        conditions=replace(
            preflight_request.conditions,
            sleep_disabled=False,
            background_load_acceptable=False,
            thermal_state_acceptable=False,
        ),
    )
    constrained_host = replace(
        host_snapshot(),
        free_ram_bytes=12 * GIB - 1,
        free_disk_bytes=GIB,
        power_online=False,
        gpu_model=None,
        driver_version="unavailable",
        total_vram_bytes=None,
        free_vram_bytes=None,
    )
    result = run_preflight(
        preflight_request,
        repository_probe=FixedRepositoryProbe(),
        host_probe=FixedHostProbe(constrained_host),
        network_probe=FixedNetworkProbe(),
        environment={"HF_HUB_OFFLINE": "1", "TRANSFORMERS_OFFLINE": "1"},
    )
    assert result.failures == (
        "power",
        "sleep",
        "background-load",
        "thermal-state",
        "ram-headroom",
        "disk-headroom",
        "provider",
        "vram-headroom",
    )
    assert result.eligible_for_promotion is False


def test_wrong_platform_python_and_profile_are_not_coerced(tmp_path: Path) -> None:
    preflight_request = request(tmp_path)
    wrong_configuration = replace(
        preflight_request.configuration,
        provider="onnxruntime-cpu",
        precision="float32",
    )
    preflight_request = replace(
        preflight_request,
        configuration=wrong_configuration,
    )
    wrong_host = replace(
        host_snapshot(),
        operating_system="Linux",
        architecture="aarch64",
        python_version="3.13.0",
    )
    result = run_preflight(
        preflight_request,
        repository_probe=FixedRepositoryProbe(),
        host_probe=FixedHostProbe(wrong_host),
        network_probe=FixedNetworkProbe(),
        environment={"HF_HUB_OFFLINE": "1", "TRANSFORMERS_OFFLINE": "1"},
    )
    assert result.failures == (
        "host-os",
        "host-architecture",
        "python-version",
        "artifact",
        "profile-mismatch",
    )
