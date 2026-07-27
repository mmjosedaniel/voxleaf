"""Run the frozen M007 exact-host handoff matrix without retaining private payloads."""

from __future__ import annotations

import json
import os
import queue
import subprocess
import sys
import threading
import time
from collections.abc import Mapping, Sequence
from pathlib import Path
from typing import Final, TextIO, cast

from benchmarks.memory import (
    GPU_PROCESS_SHARED_MEMORY_COUNTER,
    PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS,
    RAM_SAMPLING_INTERVAL_MILLISECONDS,
    ProcessResourceSample,
    WindowsGpuProcessMemorySampler,
    WindowsProcessResourceSampler,
)
from benchmarks.service_handoff_authority import (
    PROFILE_SHA256,
    nearest_rank_p95,
    validate_service_handoff_result,
)

AUTHORITY_COMMIT_SHA: Final = "28fe4349eb40d137e3389b2f8e3c8d76f8fa7bb3"
HOST_ARGUMENT: Final = "--voxleaf-tts-exact-handoff-host"
REQUIRED_ENVIRONMENT: Final = (
    "VOXLEAF_TTS_DEV_ENABLED",
    "VOXLEAF_TTS_DEV_PYTHON",
    "VOXLEAF_TTS_DEV_MODEL_ROOT",
)
FIREWALL_RULE_NAME: Final = "VoxLeaf TTS Benchmark Offline"
ALLOWED_PHASES: Final = frozenset(
    (
        "service-start",
        "model-load-warm",
        "ready",
        "generation",
        "termination",
        "cleanup",
        "restart",
    )
)


class ServiceHandoffRunError(RuntimeError):
    """The frozen exact-host run could not produce one promotable result."""


def _fail(reason: str) -> ServiceHandoffRunError:
    return ServiceHandoffRunError(f"tts-service-handoff-run:{reason}")


def _repository_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _release_executable(repository_root: Path) -> Path:
    return repository_root / "apps/desktop/src-tauri/target/release/voxleaf-desktop.exe"


def _read_lines(stream: TextIO, output: queue.SimpleQueue[str]) -> None:
    for line in stream:
        output.put(line)


def _parse_event(line: str) -> Mapping[str, object]:
    try:
        value = json.loads(line)
    except json.JSONDecodeError as error:
        raise _fail("native-output") from error
    if not isinstance(value, dict):
        raise _fail("native-output")
    event = cast(Mapping[str, object], value)
    kind = event.get("kind")
    if kind == "phase":
        if (
            set(event) != {"kind", "phase", "requiresZeroChildren", "observeNetwork"}
            or event.get("phase") not in ALLOWED_PHASES
            or not isinstance(event.get("requiresZeroChildren"), bool)
            or not isinstance(event.get("observeNetwork"), bool)
        ):
            raise _fail("native-phase")
    elif kind == "nativeResult":
        if set(event) != {"kind", "cases", "timings"}:
            raise _fail("native-result")
    else:
        raise _fail("native-kind")
    return event


def _verify_firewall(candidate_python: str) -> None:
    if os.environ.get("VOXLEAF_TTS_DEV_PYTHON") != candidate_python:
        raise _fail("firewall")
    script = (
        "$candidate=$env:VOXLEAF_TTS_DEV_PYTHON;"
        f"$rule=Get-NetFirewallRule -DisplayName '{FIREWALL_RULE_NAME}' "
        "-ErrorAction SilentlyContinue | "
        "Where-Object {$_.Enabled -eq 'True' -and $_.Direction -eq 'Outbound' "
        "-and $_.Action -eq 'Block'};"
        "$match=$rule | Get-NetFirewallApplicationFilter | "
        "Where-Object {$_.Program -eq $candidate};"
        "if ($null -eq $match) { exit 1 }"
    )
    completed = subprocess.run(
        [
            "powershell.exe",
            "-NoLogo",
            "-NoProfile",
            "-NonInteractive",
            "-Command",
            script,
        ],
        check=False,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        timeout=15,
    )
    if completed.returncode != 0:
        raise _fail("firewall")


def _network_counts(process_ids: frozenset[int]) -> tuple[int, int]:
    if not process_ids:
        return (0, 0)
    listeners = 0
    external = 0
    for protocol in ("tcp", "udp"):
        completed = subprocess.run(
            ["netstat.exe", "-ano", "-p", protocol],
            check=False,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=10,
        )
        if completed.returncode != 0:
            raise _fail("network-observation")
        for raw_line in completed.stdout.splitlines():
            columns = raw_line.split()
            if not columns or columns[0].upper() not in {"TCP", "UDP"}:
                continue
            try:
                owning_pid = int(columns[-1])
            except (ValueError, IndexError):
                continue
            if owning_pid not in process_ids:
                continue
            if columns[0].upper() == "UDP":
                listeners += 1
                continue
            if len(columns) < 5:
                raise _fail("network-observation")
            remote = columns[2]
            remote_host, _, remote_port = remote.rpartition(":")
            normalized_host = remote_host.strip("[]").lower()
            if remote_port == "0" and normalized_host in {"0.0.0.0", "::", "*"}:
                listeners += 1
            elif normalized_host not in {
                "0.0.0.0",
                "::",
                "*",
                "127.0.0.1",
                "::1",
            }:
                external += 1
    return listeners, external


def _numeric_values(cases: Sequence[Mapping[str, object]], name: str) -> tuple[float, ...]:
    values: list[float] = []
    for case in cases:
        value = case.get(name)
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            values.append(float(value))
    return tuple(values)


def _final_result(
    repository_root: Path,
    native_result: Mapping[str, object],
    *,
    execution_commit_sha: str,
    peak_ram_bytes: int,
    peak_dedicated_bytes: int,
    peak_shared_bytes: int,
    peak_allocations: int,
    cleanup: ProcessResourceSample,
    cleanup_shared: ProcessResourceSample,
    listener_count: int,
    external_connection_count: int,
) -> Mapping[str, object]:
    raw_cases = native_result.get("cases")
    raw_timings = native_result.get("timings")
    if not isinstance(raw_cases, list) or not isinstance(raw_timings, dict):
        raise _fail("native-result")
    cases = cast(list[Mapping[str, object]], raw_cases)
    restart_values = raw_timings.get("restartPrepareMilliseconds")
    if not isinstance(restart_values, list) or len(restart_values) != 3:
        raise _fail("restart-timings")
    restarts = tuple(float(value) for value in restart_values)
    first_frames = _numeric_values(cases, "commandToFirstTransportFrameMilliseconds")
    complete_units = _numeric_values(cases, "commandToCompleteUnitMilliseconds")
    handoffs = _numeric_values(cases, "nativeFrameHandoffMicroseconds")
    terminations = _numeric_values(cases, "terminationMilliseconds")
    if not first_frames or not complete_units or not handoffs or len(terminations) != 4:
        raise _fail("case-timings")
    if (
        cleanup.process_tree_ram_bytes != 0
        or cleanup.process_tree_vram_bytes != 0
        or cleanup_shared.process_tree_vram_bytes != 0
        or listener_count != 0
        or external_connection_count != 0
    ):
        raise _fail("cleanup")
    result: Mapping[str, object] = {
        "schemaVersion": 1,
        "profileVersion": "tts-service-handoff-profile-v1",
        "profileSha256": PROFILE_SHA256,
        "authorityCommitSha": AUTHORITY_COMMIT_SHA,
        "executionCommitSha": execution_commit_sha,
        "attemptOrdinal": 1,
        "automaticRetries": 0,
        "status": "pass",
        "candidateId": "qwen3-tts-1-7b-customvoice-cuda-bf16-v1",
        "protocolVersion": 1,
        "cases": cases,
        "timings": {
            "serviceStartMilliseconds": raw_timings.get("serviceStartMilliseconds"),
            "initialLoadMilliseconds": raw_timings.get("initialLoadMilliseconds"),
            "initialWarmMilliseconds": raw_timings.get("initialWarmMilliseconds"),
            "commandToFirstTransportFrameP95Milliseconds": nearest_rank_p95(first_frames),
            "commandToCompleteUnitP95Milliseconds": nearest_rank_p95(complete_units),
            "nativeFrameHandoffP95Microseconds": nearest_rank_p95(handoffs),
            "terminationP95Milliseconds": nearest_rank_p95(terminations),
            "restartPrepareP95Milliseconds": nearest_rank_p95(restarts),
        },
        "resources": {
            "ramSamplingIntervalMilliseconds": RAM_SAMPLING_INTERVAL_MILLISECONDS,
            "vramSamplingIntervalMilliseconds": (PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS),
            "vramMethod": "wddm-process-tree-dedicated-and-shared",
            "peakProcessTreeRamBytes": peak_ram_bytes,
            "peakDedicatedGpuBytes": peak_dedicated_bytes,
            "peakSharedGpuBytes": peak_shared_bytes,
            "peakGpuAllocatingProcesses": peak_allocations,
        },
        "cleanup": {
            "processTreeRamBytes": cleanup.process_tree_ram_bytes,
            "dedicatedGpuBytes": cleanup.process_tree_vram_bytes,
            "sharedGpuBytes": cleanup_shared.process_tree_vram_bytes,
            "listenerCount": listener_count,
            "externalConnectionCount": external_connection_count,
            "generatedAudioPersisted": False,
        },
        "privacy": {
            "containsNarrationText": False,
            "containsWaveformOrAudioBytes": False,
            "containsPathOrEnvironmentValue": False,
            "containsProcessIdentifier": False,
            "containsExceptionOrProcessCommand": False,
            "containsPrivateIdentity": False,
        },
        "conclusions": {
            "completeUnitHandoff": "pass",
            "backpressure": "pass",
            "cancellationContainment": "pass",
            "cleanupAndRestart": "pass",
            "nativeModelStreaming": "unsupported",
            "cooperativeCancellation": "unsupported",
            "sustainablePlayback": "not-evaluated",
            "productionProfile": "not-selected",
            "generalHardwareSupport": "not-claimed",
        },
    }
    return validate_service_handoff_result(repository_root, result)


def _execution_commit(repository_root: Path) -> str:
    completed = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=repository_root,
        check=False,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="strict",
        timeout=10,
    )
    value = completed.stdout.strip()
    if completed.returncode != 0 or len(value) != 40:
        raise _fail("execution-commit")
    return value


def run() -> Mapping[str, object]:
    """Execute one authoritative hardware attempt and return only its safe summary."""

    if os.name != "nt" or any(not os.environ.get(name) for name in REQUIRED_ENVIRONMENT):
        raise _fail("configuration")
    if os.environ["VOXLEAF_TTS_DEV_ENABLED"] != "1":
        raise _fail("configuration")
    repository_root = _repository_root()
    executable = _release_executable(repository_root)
    if not executable.is_file():
        raise _fail("executable")
    _verify_firewall(os.environ["VOXLEAF_TTS_DEV_PYTHON"])
    execution_commit_sha = _execution_commit(repository_root)
    if execution_commit_sha == AUTHORITY_COMMIT_SHA:
        raise _fail("implementation-before-authority")

    process = subprocess.Popen(
        [str(executable), HOST_ARGUMENT],
        cwd=repository_root,
        env=os.environ.copy(),
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
        encoding="utf-8",
        errors="strict",
    )
    if process.stdout is None:
        process.kill()
        raise _fail("native-output")

    dedicated_gpu = WindowsGpuProcessMemorySampler()
    shared_gpu = WindowsGpuProcessMemorySampler(GPU_PROCESS_SHARED_MEMORY_COUNTER)
    dedicated_sampler = WindowsProcessResourceSampler(vram_sampler=dedicated_gpu)
    shared_sampler = WindowsProcessResourceSampler(vram_sampler=shared_gpu)
    lines: queue.SimpleQueue[str] = queue.SimpleQueue()
    reader = threading.Thread(
        target=_read_lines,
        args=(process.stdout, lines),
        name="voxleaf-service-handoff-output",
        daemon=True,
    )
    reader.start()
    native_result: Mapping[str, object] | None = None
    peak_ram = 0
    peak_dedicated = 0
    peak_shared = 0
    peak_allocations = 0
    listener_count = 0
    external_connection_count = 0
    cleanup_observations = 0
    network_observations: set[str] = set()
    try:
        while process.poll() is None or reader.is_alive() or not lines.empty():
            sample = dedicated_sampler.sample(process.pid)
            shared = shared_sampler.sample(process.pid)
            if sample.process_tree_vram_bytes is None or shared.process_tree_vram_bytes is None:
                raise _fail("vram-observation")
            peak_ram = max(peak_ram, sample.process_tree_ram_bytes)
            peak_dedicated = max(peak_dedicated, sample.process_tree_vram_bytes)
            peak_shared = max(peak_shared, shared.process_tree_vram_bytes)
            peak_allocations = max(peak_allocations, sample.gpu_provider_allocations)
            while not lines.empty():
                event = _parse_event(lines.get())
                if event["kind"] == "nativeResult":
                    if native_result is not None:
                        raise _fail("duplicate-native-result")
                    native_result = event
                    continue
                if event["requiresZeroChildren"] is True:
                    cleanup_sample = dedicated_sampler.sample(process.pid)
                    cleanup_shared_sample = shared_sampler.sample(process.pid)
                    if (
                        cleanup_sample.process_tree_ram_bytes != 0
                        or cleanup_sample.process_tree_vram_bytes != 0
                        or cleanup_shared_sample.process_tree_vram_bytes != 0
                    ):
                        raise _fail("intermediate-cleanup")
                    cleanup_observations += 1
                if event["observeNetwork"] is True:
                    phase = cast(str, event["phase"])
                    if phase not in network_observations:
                        ids = dedicated_sampler.process_tree_ids(process.pid)
                        listeners, external = _network_counts(ids)
                        listener_count = max(listener_count, listeners)
                        external_connection_count = max(external_connection_count, external)
                        network_observations.add(phase)
            time.sleep(RAM_SAMPLING_INTERVAL_MILLISECONDS / 1_000)
        reader.join(timeout=1)
        return_code = process.wait(timeout=5)
        if return_code != 0 or reader.is_alive() or native_result is None:
            raise _fail("native-process")
        if cleanup_observations != 4:
            raise _fail("cleanup-observations")
        cleanup = dedicated_sampler.sample(process.pid)
        cleanup_shared = shared_sampler.sample(process.pid)
        return _final_result(
            repository_root,
            native_result,
            execution_commit_sha=execution_commit_sha,
            peak_ram_bytes=peak_ram,
            peak_dedicated_bytes=peak_dedicated,
            peak_shared_bytes=peak_shared,
            peak_allocations=peak_allocations,
            cleanup=cleanup,
            cleanup_shared=cleanup_shared,
            listener_count=listener_count,
            external_connection_count=external_connection_count,
        )
    finally:
        if process.poll() is None:
            process.kill()
            process.wait(timeout=5)
        process.stdout.close()
        dedicated_gpu.close()
        shared_gpu.close()


def main(arguments: Sequence[str] | None = None) -> int:
    """Run the closed command surface with fixed failure output."""

    values = tuple(sys.argv[1:] if arguments is None else arguments)
    if values != ("run",):
        print("Exact-host service handoff configuration is unavailable.", file=sys.stderr)
        return 2
    try:
        result = run()
    except (OSError, RuntimeError, subprocess.SubprocessError):
        print("Exact-host service handoff matrix failed.", file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=True, sort_keys=True, separators=(",", ":")))
    print("Exact-host service handoff matrix passed.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
