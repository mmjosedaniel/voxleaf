"""Run the v2 observer handoff matrix without retaining private payloads."""

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
from typing import IO, Final, cast

from benchmarks.memory import (
    GPU_PROCESS_SHARED_MEMORY_COUNTER,
    PROCESS_VRAM_SAMPLING_INTERVAL_MILLISECONDS,
    RAM_SAMPLING_INTERVAL_MILLISECONDS,
    ProcessResourceSample,
    WindowsGpuProcessMemorySampler,
    WindowsProcessResourceSampler,
)
from benchmarks.preflight import WindowsFirewallNetworkProbe
from benchmarks.service_handoff_authority import (
    PROFILE_SHA256,
    nearest_rank_p95,
    validate_service_handoff_result,
)
from benchmarks.service_handoff_v2_authority import (
    ACK_TIMEOUT_SECONDS,
    CLEANUP_ORDER,
    NATIVE_QUEUE_RECORDS,
    NATIVE_RECORD_BYTES,
    NATIVE_RECORD_COUNT,
    OBSERVER_RECORD_BYTES,
    OBSERVER_VERSION,
    PROCESS_REAP_SECONDS,
    READER_JOIN_SECONDS,
    RUN_TIMEOUT_SECONDS,
    validate_handoff_v2_result,
    verify_execution_authority,
)
from benchmarks.service_handoff_v2_authority import (
    PROFILE_SHA256 as V2_PROFILE_SHA256,
)
from benchmarks.service_handoff_v2_authority import (
    PROFILE_VERSION as V2_PROFILE_VERSION,
)

AUTHORITY_COMMIT_SHA: Final = "28fe4349eb40d137e3389b2f8e3c8d76f8fa7bb3"
HOST_ARGUMENT: Final = "--voxleaf-tts-exact-handoff-host-v2"
REQUIRED_ENVIRONMENT: Final = (
    "VOXLEAF_TTS_DEV_ENABLED",
    "VOXLEAF_TTS_DEV_PYTHON",
    "VOXLEAF_TTS_DEV_MODEL_ROOT",
)
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


type _OutputRecord = bytes | ServiceHandoffRunError | None


def _read_lines(
    stream: IO[bytes], output: queue.Queue[_OutputRecord], stop: threading.Event
) -> None:
    while not stop.is_set():
        record: _OutputRecord
        try:
            record = stream.readline(NATIVE_RECORD_BYTES + 1)
            if not record:
                record = None
            elif len(record) > NATIVE_RECORD_BYTES or not record.endswith(b"\n"):
                record = _fail("native-record-bound")
        except (OSError, ValueError):
            record = _fail("native-output")
        while not stop.is_set():
            try:
                output.put(record, timeout=0.05)
                break
            except queue.Full:
                continue
        if not isinstance(record, bytes):
            return


def _remaining(deadline: float) -> float:
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise _fail("deadline")
    return remaining


def _send_observer_record(stream: IO[bytes], record: Mapping[str, object]) -> None:
    payload = json.dumps(record, separators=(",", ":")).encode("ascii") + b"\n"
    if len(payload) > OBSERVER_RECORD_BYTES:
        raise _fail("observer-record-bound")
    try:
        # Native sends a boundary only after consuming the previous record.
        # At most one small record can be outstanding in the owned pipe.
        if stream.write(payload) != len(payload):
            raise _fail("observer-write")
        stream.flush()
    except (OSError, ValueError):
        raise _fail("observer-write") from None


def _verify_zero_cleanup(
    dedicated: WindowsProcessResourceSampler,
    shared: WindowsProcessResourceSampler,
    pid: int,
) -> tuple[ProcessResourceSample, ProcessResourceSample]:
    expected = frozenset((pid,))
    if dedicated.process_tree_ids(pid) != expected:
        raise _fail("intermediate-cleanup")
    cleanup = dedicated.sample(pid)
    cleanup_shared = shared.sample(pid)
    if (
        cleanup.process_tree_ram_bytes != 0
        or cleanup_shared.process_tree_ram_bytes != 0
        or cleanup.process_tree_vram_bytes != 0
        or cleanup_shared.process_tree_vram_bytes != 0
        or dedicated.process_tree_ids(pid) != expected
    ):
        raise _fail("intermediate-cleanup")
    return cleanup, cleanup_shared


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
    if os.environ.get(
        "VOXLEAF_TTS_DEV_PYTHON"
    ) != candidate_python or not WindowsFirewallNetworkProbe().active(Path(candidate_python)):
        raise _fail("firewall")


def _network_counts(process_ids: frozenset[int], *, deadline: float) -> tuple[int, int]:
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
            timeout=min(10, _remaining(deadline)),
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
    cleanup_acknowledgements: list[dict[str, object]] | None = None,
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
    result: dict[str, object] = {
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
    if cleanup_acknowledgements is not None:
        result.pop("authorityCommitSha")
        result.update(
            schemaVersion=2,
            profileVersion=V2_PROFILE_VERSION,
            profileSha256=V2_PROFILE_SHA256,
            observerProtocolVersion=OBSERVER_VERSION,
            cleanupAcknowledgements=cleanup_acknowledgements,
        )
        return validate_handoff_v2_result(repository_root, result)
    return validate_service_handoff_result(repository_root, result)


def _execution_commit(repository_root: Path) -> str:
    status = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=repository_root,
        check=False,
        capture_output=True,
        timeout=10,
    )
    if status.returncode != 0 or status.stdout:
        raise _fail("execution-tree")
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
    verify_execution_authority(repository_root, execution_commit_sha)

    read_stop = threading.Event()
    process: subprocess.Popen[bytes] = subprocess.Popen(
        [str(executable), HOST_ARGUMENT],
        cwd=repository_root,
        env=os.environ.copy(),
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    dedicated_gpu: WindowsGpuProcessMemorySampler | None = None
    shared_gpu: WindowsGpuProcessMemorySampler | None = None
    reader: threading.Thread | None = None
    primary_error: BaseException | None = None
    try:
        deadline = time.monotonic() + RUN_TIMEOUT_SECONDS
        if process.stdout is None or process.stdin is None:
            raise _fail("native-output")
        dedicated_gpu = WindowsGpuProcessMemorySampler()
        shared_gpu = WindowsGpuProcessMemorySampler(GPU_PROCESS_SHARED_MEMORY_COUNTER)
        dedicated_sampler = WindowsProcessResourceSampler(vram_sampler=dedicated_gpu)
        shared_sampler = WindowsProcessResourceSampler(vram_sampler=shared_gpu)
        lines: queue.Queue[_OutputRecord] = queue.Queue(maxsize=NATIVE_QUEUE_RECORDS)
        reader = threading.Thread(
            target=_read_lines,
            args=(process.stdout, lines, read_stop),
            name="voxleaf-service-handoff-output",
            daemon=True,
        )
        reader.start()
        hello = {"kind": "hello", "version": OBSERVER_VERSION}
        handshake_deadline = min(deadline, time.monotonic() + ACK_TIMEOUT_SECONDS)
        _send_observer_record(process.stdin, hello)
        greeted = False
        stdout_eof = False
        record_count = 0
        native_result: Mapping[str, object] | None = None
        peak_ram = 0
        peak_dedicated = 0
        peak_shared = 0
        peak_allocations = 0
        listener_count = 0
        external_connection_count = 0
        cleanup_acknowledgements: list[dict[str, object]] = []
        network_observations: set[str] = set()
        interval = RAM_SAMPLING_INTERVAL_MILLISECONDS / 1_000
        while process.poll() is None or not stdout_eof:
            remaining = _remaining(deadline if greeted else handshake_deadline)
            sample = dedicated_sampler.sample(process.pid)
            shared = shared_sampler.sample(process.pid)
            if sample.process_tree_vram_bytes is None or shared.process_tree_vram_bytes is None:
                raise _fail("vram-observation")
            peak_ram = max(peak_ram, sample.process_tree_ram_bytes)
            peak_dedicated = max(peak_dedicated, sample.process_tree_vram_bytes)
            peak_shared = max(peak_shared, shared.process_tree_vram_bytes)
            peak_allocations = max(peak_allocations, sample.gpu_provider_allocations)
            if stdout_eof:
                time.sleep(min(interval, remaining))
                continue
            try:
                line = lines.get(timeout=min(interval, remaining))
            except queue.Empty:
                continue
            _remaining(deadline if greeted else handshake_deadline)
            if line is None:
                stdout_eof = True
                continue
            if isinstance(line, ServiceHandoffRunError):
                raise line
            record_count += 1
            if record_count > NATIVE_RECORD_COUNT:
                raise _fail("native-output-bound")
            try:
                decoded = line.decode("utf-8")
                value = cast(object, json.loads(decoded))
            except (UnicodeError, json.JSONDecodeError):
                raise _fail("native-output") from None
            if not greeted:
                if (
                    not isinstance(value, dict)
                    or type(value.get("version")) is not int
                    or value != hello
                ):
                    raise _fail("observer-version")
                greeted = True
                continue
            if native_result is not None:
                raise _fail("trailing-native-output")
            if isinstance(value, dict) and value.get("kind") == "cleanupReady":
                index = len(cleanup_acknowledgements)
                if index >= len(CLEANUP_ORDER):
                    raise _fail("cleanup-order")
                receipt: dict[str, object] = {"phase": CLEANUP_ORDER[index], "sequence": index + 1}
                if (
                    type(value.get("version")) is not int
                    or type(value.get("sequence")) is not int
                    or value != {"kind": "cleanupReady", "version": OBSERVER_VERSION, **receipt}
                ):
                    raise _fail("cleanup-order")
                _verify_zero_cleanup(dedicated_sampler, shared_sampler, process.pid)
                _remaining(deadline)
                _send_observer_record(
                    process.stdin,
                    {
                        "kind": "cleanupAck",
                        "version": OBSERVER_VERSION,
                        **receipt,
                    },
                )
                cleanup_acknowledgements.append(receipt)
                continue
            event = _parse_event(decoded)
            if event["kind"] == "nativeResult":
                if len(cleanup_acknowledgements) != len(CLEANUP_ORDER):
                    raise _fail("cleanup-observations")
                native_result = event
                continue
            phase = cast(str, event["phase"])
            if phase == "cleanup" or event["requiresZeroChildren"] is True:
                raise _fail("observer-version")
            if event["observeNetwork"] is True and phase not in network_observations:
                ids = dedicated_sampler.process_tree_ids(process.pid)
                listeners, external = _network_counts(ids, deadline=deadline)
                listener_count = max(listener_count, listeners)
                external_connection_count = max(external_connection_count, external)
                network_observations.add(phase)
        reader.join(timeout=min(READER_JOIN_SECONDS, _remaining(deadline)))
        return_code = process.wait(timeout=min(PROCESS_REAP_SECONDS, _remaining(deadline)))
        if return_code != 0 or reader.is_alive() or not greeted or native_result is None:
            raise _fail("native-process")
        cleanup, cleanup_shared = _verify_zero_cleanup(
            dedicated_sampler, shared_sampler, process.pid
        )
        _remaining(deadline)
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
            cleanup_acknowledgements=cleanup_acknowledgements,
        )
    except BaseException as error:
        primary_error = error
        raise
    finally:
        cleanup_failed = False
        read_stop.set()
        try:
            if process.poll() is None:
                process.kill()
            process.wait(timeout=PROCESS_REAP_SECONDS)
        except (OSError, subprocess.SubprocessError):
            cleanup_failed = True
        if reader is not None and reader.ident is not None:
            try:
                reader.join(timeout=READER_JOIN_SECONDS)
            except (RuntimeError, KeyboardInterrupt):
                cleanup_failed = True
        reader_alive = reader is not None and reader.is_alive()
        cleanup_failed = cleanup_failed or reader_alive
        # Closing a buffered stream while its reader still blocks can hang.
        for stream in (process.stdin, None if reader_alive else process.stdout):
            if stream is None:
                continue
            try:
                stream.close()
            except OSError:
                cleanup_failed = True
        for sampler in (dedicated_gpu, shared_gpu):
            if sampler is not None:
                try:
                    sampler.close()
                except (OSError, RuntimeError):
                    cleanup_failed = True
        if cleanup_failed:
            if primary_error is not None:
                primary_error.add_note("tts-service-handoff-run:cleanup-failed")
            else:
                raise _fail("cleanup-failed")


def main(arguments: Sequence[str] | None = None) -> int:
    """Run the closed command surface with fixed failure output."""

    values = tuple(sys.argv[1:] if arguments is None else arguments)
    if values != ("run",):
        print("Exact-host service handoff configuration is unavailable.", file=sys.stderr)
        return 2
    try:
        result = run()
    except (
        OSError,
        ValueError,
        RuntimeError,
        subprocess.SubprocessError,
        KeyboardInterrupt,
    ) as error:
        print("Exact-host service handoff matrix failed.", file=sys.stderr)
        if "tts-service-handoff-run:cleanup-failed" in getattr(error, "__notes__", ()):
            print("Exact-host service handoff cleanup failed.", file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=True, sort_keys=True, separators=(",", ":")))
    print("Exact-host service handoff matrix passed.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
