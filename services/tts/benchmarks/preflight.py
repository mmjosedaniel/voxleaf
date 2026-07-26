"""Privacy-safe official-run preflight for local TTS feasibility."""

from __future__ import annotations

import json
import os
import platform
import re
import shutil
import subprocess
from collections.abc import Mapping
from dataclasses import dataclass, field
from pathlib import Path
from typing import Final, Literal, Protocol, cast

from benchmarks.adapters.manifest import (
    PROFILE_V3_CONFIGURATION_SHA256,
    PROFILE_V3_GENERATION_SHA256,
    PROFILE_V3_INSTRUCTION_SHA256,
    PROFILE_V3_LOCK_SHA256,
    PROFILE_V3_SCREEN_RESULT_SHA256,
    PROFILE_V3_SHA256,
    AdapterConfigurationError,
    CandidateConfiguration,
    CandidateProfile,
    VerifiedArtifact,
    v3_profile_identity_matches,
    validate_configuration,
    verify_and_measure_artifacts,
)

type RunPurpose = Literal["pilot", "official"]
type PreflightFailureCode = Literal[
    "dirty-tree",
    "source-revision",
    "host-os",
    "host-architecture",
    "python-version",
    "profile-mismatch",
    "profile-authority",
    "artifact",
    "offline-control",
    "candidate-environment",
    "network-isolation",
    "power",
    "sleep",
    "background-load",
    "thermal-state",
    "ram-headroom",
    "vram-headroom",
    "vram-measurement",
    "disk-headroom",
    "provider",
    "host-probe",
]

GIB: Final = 1024**3
MINIMUM_RAM_BY_ROLE: Final = {
    "balanced": 12 * GIB,
    "compatibility": 4 * GIB,
}
MINIMUM_VRAM_BY_ROLE: Final = {
    "balanced": 6 * GIB,
    "compatibility": 0,
}
MINIMUM_EXTRA_DISK_BYTES: Final = GIB
COMMIT_PATTERN: Final = re.compile(r"^[0-9a-f]{40}$")
SAFE_LABEL_PATTERN: Final = re.compile(r"^[A-Za-z0-9][A-Za-z0-9 ._+():-]{0,159}$")
POWER_MODE_PATTERN: Final = re.compile(r"\(([^()]*)\)\s*$")


@dataclass(frozen=True)
class RepositoryState:
    commit_sha: str
    clean: bool


@dataclass(frozen=True)
class HostSnapshot:
    operating_system: str
    os_version: str
    architecture: str
    python_version: str
    cpu_model: str
    logical_processors: int
    total_ram_bytes: int
    free_ram_bytes: int
    free_disk_bytes: int
    power_online: bool
    power_mode: str
    gpu_model: str | None
    driver_version: str
    total_vram_bytes: int | None
    free_vram_bytes: int | None
    process_vram_available: bool


@dataclass(frozen=True)
class RunConditions:
    purpose: RunPurpose
    sleep_disabled: bool
    background_load_acceptable: bool
    thermal_state_acceptable: bool


@dataclass(frozen=True)
class PreflightRequest:
    expected_commit_sha: str
    repository_root: Path = field(repr=False)
    profile: CandidateProfile
    configuration: CandidateConfiguration
    candidate_python: Path = field(repr=False)
    conditions: RunConditions


@dataclass(frozen=True)
class PreflightReceipt:
    purpose: RunPurpose
    candidate_id: str
    role: Literal["balanced", "compatibility"]
    commit_sha: str
    host: HostSnapshot
    artifacts: tuple[VerifiedArtifact, ...]
    failures: tuple[PreflightFailureCode, ...]
    eligible_for_official_run: bool
    eligible_for_promotion: bool


class RepositoryProbe(Protocol):
    def snapshot(self, repository_root: Path) -> RepositoryState: ...


class HostProbe(Protocol):
    def snapshot(self, repository_root: Path) -> HostSnapshot: ...


class NetworkIsolationProbe(Protocol):
    def active(self, candidate_python: Path) -> bool: ...


class GitRepositoryProbe:
    """Read only the clean bit and commit identity; paths never leave the probe."""

    def snapshot(self, repository_root: Path) -> RepositoryState:
        try:
            commit = subprocess.run(
                ("git", "rev-parse", "HEAD"),
                cwd=repository_root,
                check=True,
                capture_output=True,
                text=True,
                timeout=10,
            ).stdout.strip()
            dirty = subprocess.run(
                ("git", "status", "--porcelain=v1", "--untracked-files=all"),
                cwd=repository_root,
                check=True,
                capture_output=True,
                text=True,
                timeout=10,
            ).stdout
        except (OSError, subprocess.SubprocessError):
            return RepositoryState(commit_sha="0" * 40, clean=False)
        return RepositoryState(
            commit_sha=commit if COMMIT_PATTERN.fullmatch(commit) else "0" * 40,
            clean=not dirty,
        )


def _safe_label(value: object, fallback: str = "unavailable") -> str:
    if not isinstance(value, str):
        return fallback
    normalized = " ".join(value.split())
    return normalized if SAFE_LABEL_PATTERN.fullmatch(normalized) else fallback


def _positive_integer(value: object) -> int:
    return value if isinstance(value, int) and not isinstance(value, bool) and value > 0 else 0


def _powershell_host_facts(repository_root: Path) -> Mapping[str, object]:
    script = (
        "$cpu=Get-CimInstance Win32_Processor|Select-Object -First 1;"
        "$computer=Get-CimInstance Win32_ComputerSystem;"
        "$os=Get-CimInstance Win32_OperatingSystem;"
        "$drive=Get-PSDrive -Name ((Get-Location).Drive.Name);"
        "$battery=Get-CimInstance -Namespace root\\wmi -Class BatteryStatus "
        "-ErrorAction SilentlyContinue|Select-Object -First 1;"
        "$power=(powercfg /GETACTIVESCHEME | Out-String).Trim();"
        "$gpuProcessMemory=Get-Counter "
        "'\\GPU Process Memory(*)\\Dedicated Usage' "
        "-ErrorAction SilentlyContinue;"
        "[ordered]@{cpuModel=$cpu.Name;logicalProcessors=$cpu.NumberOfLogicalProcessors;"
        "totalRamBytes=[uint64]$computer.TotalPhysicalMemory;"
        "freeRamBytes=[uint64]$os.FreePhysicalMemory*1KB;"
        "freeDiskBytes=[uint64]$drive.Free;"
        "powerOnline=if($battery){[bool]$battery.PowerOnline}else{$true};"
        "powerMode=$power;"
        "processVramAvailable=[bool]($null -ne $gpuProcessMemory)}"
        "|ConvertTo-Json -Compress"
    )
    try:
        completed = subprocess.run(
            (
                "powershell.exe",
                "-NoLogo",
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                script,
            ),
            cwd=repository_root,
            check=True,
            capture_output=True,
            text=True,
            timeout=20,
        )
        value = cast(object, json.loads(completed.stdout))
    except (OSError, subprocess.SubprocessError, json.JSONDecodeError):
        return {}
    return cast(Mapping[str, object], value) if isinstance(value, dict) else {}


def _nvidia_facts() -> tuple[str | None, str, int | None, int | None]:
    if shutil.which("nvidia-smi") is None:
        return None, "unavailable", None, None
    try:
        output = subprocess.run(
            (
                "nvidia-smi",
                "--query-gpu=name,driver_version,memory.total,memory.free",
                "--format=csv,noheader,nounits",
            ),
            check=True,
            capture_output=True,
            text=True,
            timeout=10,
        ).stdout.splitlines()
        if len(output) != 1:
            return None, "unavailable", None, None
        values = tuple(part.strip() for part in output[0].split(","))
        if len(values) != 4:
            return None, "unavailable", None, None
        name, driver, total_mib, free_mib = values
        return (
            _safe_label(name, "") or None,
            _safe_label(driver),
            int(total_mib) * 1024**2,
            int(free_mib) * 1024**2,
        )
    except (OSError, subprocess.SubprocessError, ValueError):
        return None, "unavailable", None, None


class WindowsHostProbe:
    def snapshot(self, repository_root: Path) -> HostSnapshot:
        facts = _powershell_host_facts(repository_root)
        gpu_model, driver, total_vram, free_vram = _nvidia_facts()
        raw_power_mode = facts.get("powerMode")
        power_match = (
            POWER_MODE_PATTERN.search(raw_power_mode) if isinstance(raw_power_mode, str) else None
        )
        power_mode = _safe_label(power_match.group(1) if power_match else raw_power_mode)
        return HostSnapshot(
            operating_system=platform.system(),
            os_version=_safe_label(platform.version()),
            architecture="x86_64" if platform.machine().lower() in ("amd64", "x86_64") else "",
            python_version=platform.python_version(),
            cpu_model=_safe_label(facts.get("cpuModel")),
            logical_processors=_positive_integer(facts.get("logicalProcessors")),
            total_ram_bytes=_positive_integer(facts.get("totalRamBytes")),
            free_ram_bytes=_positive_integer(facts.get("freeRamBytes")),
            free_disk_bytes=_positive_integer(facts.get("freeDiskBytes")),
            power_online=facts.get("powerOnline") is True,
            power_mode=power_mode,
            gpu_model=gpu_model,
            driver_version=driver,
            total_vram_bytes=total_vram,
            free_vram_bytes=free_vram,
            process_vram_available=facts.get("processVramAvailable") is True,
        )


class WindowsFirewallNetworkProbe:
    """Require one exact enabled outbound block for the candidate interpreter."""

    rule_name: Final = "VoxLeaf TTS Benchmark Offline"

    def active(self, candidate_python: Path) -> bool:
        try:
            expected = candidate_python.resolve(strict=True)
        except OSError:
            return False
        script = (
            "$expected=[Environment]::GetEnvironmentVariable("
            "'VOXLEAF_BENCHMARK_CANDIDATE_PYTHON');"
            "$rules=Get-NetFirewallRule -DisplayName 'VoxLeaf TTS Benchmark Offline' "
            "-ErrorAction SilentlyContinue|Where-Object {"
            "$_.Enabled -eq 'True' -and $_.Direction -eq 'Outbound' "
            "-and $_.Action -eq 'Block'};"
            "$matches=@($rules|Get-NetFirewallApplicationFilter|Where-Object {"
            "[String]::Equals($_.Program,$expected,"
            "[StringComparison]::OrdinalIgnoreCase)});"
            "if($matches.Count -eq 1){'true'}else{'false'}"
        )
        environment = os.environ.copy()
        environment["VOXLEAF_BENCHMARK_CANDIDATE_PYTHON"] = str(expected)
        try:
            result = subprocess.run(
                (
                    "powershell.exe",
                    "-NoLogo",
                    "-NoProfile",
                    "-NonInteractive",
                    "-Command",
                    script,
                ),
                check=True,
                capture_output=True,
                text=True,
                timeout=20,
                env=environment,
            )
        except (OSError, subprocess.SubprocessError):
            return False
        return result.stdout.strip() == "true"


def _offline_controls_match(profile: CandidateProfile, environment: Mapping[str, str]) -> bool:
    if environment.get("HF_HUB_OFFLINE") != "1":
        return False
    return profile.role != "balanced" or environment.get("TRANSFORMERS_OFFLINE") == "1"


def run_preflight(
    request: PreflightRequest,
    *,
    repository_probe: RepositoryProbe,
    host_probe: HostProbe,
    network_probe: NetworkIsolationProbe,
    environment: Mapping[str, str],
) -> PreflightReceipt:
    """Evaluate every frozen precondition without emitting private values."""

    failures: list[PreflightFailureCode] = []
    repository = repository_probe.snapshot(request.repository_root)
    host = host_probe.snapshot(request.repository_root)
    profile = request.profile
    conditions = request.conditions

    if not repository.clean:
        failures.append("dirty-tree")
    if (
        not COMMIT_PATTERN.fullmatch(request.expected_commit_sha)
        or repository.commit_sha != request.expected_commit_sha
    ):
        failures.append("source-revision")
    if host.operating_system != "Windows":
        failures.append("host-os")
    if host.architecture != "x86_64":
        failures.append("host-architecture")
    if not re.fullmatch(r"3\.12\.[0-9]+", host.python_version):
        failures.append("python-version")

    artifacts: tuple[VerifiedArtifact, ...] = ()
    try:
        root = validate_configuration(profile, request.configuration)
        artifacts = verify_and_measure_artifacts(root, profile.artifacts)
    except AdapterConfigurationError:
        failures.append("artifact")
    if (
        request.configuration.provider != profile.provider
        or request.configuration.precision != profile.precision
    ):
        failures.append("profile-mismatch")
    authority = profile.authority
    if authority is not None:
        expected_python = (
            request.repository_root
            / Path(authority.environment_project)
            / ".venv"
            / "Scripts"
            / "python.exe"
        )
        try:
            candidate_python_matches = request.candidate_python.resolve(
                strict=True
            ) == expected_python.resolve(strict=True)
        except OSError:
            candidate_python_matches = False
        if (
            authority.profile_version != "tts-feasibility-profile-v3"
            or authority.profile_sha256 != PROFILE_V3_SHA256
            or authority.configuration_identity_sha256 != PROFILE_V3_CONFIGURATION_SHA256
            or authority.candidate_lock_sha256 != PROFILE_V3_LOCK_SHA256
            or authority.speaker_screen_result_sha256 != PROFILE_V3_SCREEN_RESULT_SHA256
            or authority.instruction_sha256 != PROFILE_V3_INSTRUCTION_SHA256
            or authority.generation_settings_sha256 != PROFILE_V3_GENERATION_SHA256
            or authority.candidate_manifest_version != "tts-candidate-manifest-v3"
            or authority.environment_project
            != "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda"
            or authority.batch_size != 1
            or authority.automatic_retries != 0
            or not v3_profile_identity_matches(profile)
            or not candidate_python_matches
        ):
            failures.append("profile-authority")
    if not _offline_controls_match(profile, environment):
        failures.append("offline-control")
    if not request.candidate_python.is_file():
        failures.append("candidate-environment")
    if not network_probe.active(request.candidate_python):
        failures.append("network-isolation")
    if not host.power_online:
        failures.append("power")
    if not conditions.sleep_disabled:
        failures.append("sleep")
    if not conditions.background_load_acceptable:
        failures.append("background-load")
    if not conditions.thermal_state_acceptable:
        failures.append("thermal-state")

    minimum_ram = MINIMUM_RAM_BY_ROLE[profile.role]
    if host.free_ram_bytes < minimum_ram:
        failures.append("ram-headroom")
    artifact_bytes = sum(artifact.size_bytes for artifact in artifacts)
    if host.free_disk_bytes < artifact_bytes + MINIMUM_EXTRA_DISK_BYTES:
        failures.append("disk-headroom")

    if profile.role == "balanced":
        if (
            host.gpu_model is None
            or host.driver_version == "unavailable"
            or host.total_vram_bytes is None
        ):
            failures.append("provider")
        if host.free_vram_bytes is None or host.free_vram_bytes < MINIMUM_VRAM_BY_ROLE["balanced"]:
            failures.append("vram-headroom")
        if not host.process_vram_available:
            failures.append("vram-measurement")
    elif profile.provider != "onnxruntime-cpu":
        failures.append("provider")

    if (
        host.logical_processors <= 0
        or host.total_ram_bytes <= 0
        or host.free_disk_bytes <= 0
        or host.cpu_model == "unavailable"
        or host.power_mode == "unavailable"
    ):
        failures.append("host-probe")

    unique_failures = tuple(dict.fromkeys(failures))
    official = conditions.purpose == "official"
    passed = not unique_failures
    return PreflightReceipt(
        purpose=conditions.purpose,
        candidate_id=profile.candidate_id,
        role=profile.role,
        commit_sha=repository.commit_sha,
        host=host,
        artifacts=artifacts,
        failures=unique_failures,
        eligible_for_official_run=official and passed,
        eligible_for_promotion=official and passed,
    )


def run_local_preflight(request: PreflightRequest) -> PreflightReceipt:
    return run_preflight(
        request,
        repository_probe=GitRepositoryProbe(),
        host_probe=WindowsHostProbe(),
        network_probe=WindowsFirewallNetworkProbe(),
        environment=os.environ,
    )
