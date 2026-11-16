"""One-use prospective benchmark reservations and bound restoration evidence.

The content-free journal is retained as a tombstone. Only its private data
directory is removed during derivation. Operations are sequential per session.
"""

from __future__ import annotations

import hashlib
import json
import re
import stat
import time
from dataclasses import dataclass
from pathlib import Path
from typing import cast

from benchmarks.power_observation import PowerSnapshot, observe_power

VERSION = "tts-benchmark-safety-v1"
BATCH_RAW_VERSION = "tts-short-segment-batch-raw-v14-safety-v1"
DUAL_RAW_VERSION = "tts-dual-worker-raw-v5-safety-v1"
MAX_FILE_BYTES = 8 * 1024 * 1024


class SafetyError(RuntimeError):
    def __init__(self, code: str) -> None:
        super().__init__(f"tts-benchmark-safety:{code}")
        self.code = code


def require(condition: bool, code: str = "evidence") -> None:
    if not condition:
        raise SafetyError(code)


def encode(value: object) -> bytes:
    return (
        json.dumps(value, sort_keys=True, ensure_ascii=True, allow_nan=False, separators=(",", ":"))
        + "\n"
    ).encode()


def digest(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def _pairs(pairs: list[tuple[str, object]]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in pairs:
        require(key not in result, "duplicate-field")
        result[key] = value
    return result


def decode(value: bytes) -> object:
    require(len(value) <= MAX_FILE_BYTES, "input-limit")
    try:
        return cast(
            object,
            json.loads(
                value, object_pairs_hook=_pairs, parse_constant=lambda _value: require(False)
            ),
        )
    except (ValueError, UnicodeError, RecursionError):
        raise SafetyError("json") from None


def record(value: object, keys: set[str]) -> dict[str, object]:
    require(isinstance(value, dict) and set(value) == keys)
    return cast(dict[str, object], value)


def _safe_path(path: Path) -> None:
    for item in (path, *path.parents):
        try:
            info = item.lstat()
        except FileNotFoundError:
            continue
        require(
            not stat.S_ISLNK(info.st_mode)
            and not (getattr(info, "st_file_attributes", 0) & stat.FILE_ATTRIBUTE_REPARSE_POINT),
            "unsafe-path",
        )


def read(path: Path) -> bytes:
    _safe_path(path)
    with path.open("rb") as stream:
        value = stream.read(MAX_FILE_BYTES + 1)
    require(len(value) <= MAX_FILE_BYTES, "input-limit")
    return value


def write_once(path: Path, value: object) -> None:
    _safe_path(path)
    data = encode(value)
    require(len(data) <= MAX_FILE_BYTES, "input-limit")
    with path.open("xb") as stream:
        stream.write(data)


def binding(family: str, payload: dict[str, object]) -> dict[str, object]:
    """Validate the official command's static contract before any observation or I/O."""
    require(family in ("batch", "dual"), "input")
    if family == "dual":
        from benchmarks.dual_worker_command import parse_dual_worker_command

        request = parse_dual_worker_command(payload)
        require(request.purpose == "official" and request.safety_binding is not None, "input")
        assert request.safety_binding is not None
        return request.safety_binding
    from benchmarks.batch_cli import validate_official_request

    validate_official_request(payload)
    return _binding_from_validated(family, payload)


def _binding_from_validated(family: str, payload: dict[str, object]) -> dict[str, object]:
    """Serialize only after the owning command has checked its scalar/relational fields."""
    require(family in ("batch", "dual") and payload.get("evidenceVersion") == VERSION, "version")
    session = payload.get("sessionId")
    execution = payload.get("expectedCommitSha")
    require(isinstance(session, str) and re.fullmatch("[0-9a-f]{32}", session) is not None, "input")
    require(
        isinstance(execution, str) and re.fullmatch("[0-9a-f]{40}", execution) is not None, "input"
    )
    if family == "batch":
        from benchmarks.batch_cli import OFFICIAL_INPUT_FIELDS
        from benchmarks.v14_authority import PROFILE_SHA256, PROFILE_VERSION

        require(
            set(payload) == OFFICIAL_INPUT_FIELDS | {"profileVersion", "evidenceVersion"}, "input"
        )
        require(
            payload.get("profileVersion") == PROFILE_VERSION
            and payload.get("resultPurpose") == "official",
            "version",
        )
        arm = payload.get("placementProfileId")
        require(arm in ("qwen3-serena-v4-full-gpu", "qwen3-serena-v4-speech-tokenizer-cpu"), "arm")
        authority: object = PROFILE_SHA256
    else:
        from benchmarks.dual_worker_command import OFFICIAL_FIELDS

        require(set(payload) == OFFICIAL_FIELDS, "input")
        require(
            payload.get("schemaVersion") == "tts-dual-worker-command-v5"
            and payload.get("resultPurpose") == "official",
            "version",
        )
        arm = payload.get("arm")
        require(arm in ("cpu-solo", "gpu-solo", "concurrent"), "arm")
        authority = payload.get("authorityCommitSha")
        require(
            isinstance(authority, str) and re.fullmatch("[0-9a-f]{40}", authority) is not None,
            "input",
        )
    return {
        "version": VERSION,
        "family": family,
        "session": session,
        "arm": arm,
        "execution": execution,
        "authority": authority,
        "requestSha256": digest(encode(payload)),
        "cpuBaseline": payload.get("priorCpuSoloSummarySha256"),
        "gpuBaseline": payload.get("priorGpuSoloSummarySha256"),
    }


def root(repository: Path, session: str) -> Path:
    require(re.fullmatch("[0-9a-f]{32}", session) is not None, "input")
    path = repository / "benchmarks/results/raw/safety-v1" / session
    _safe_path(path)
    return path


def _observation() -> dict[str, object]:
    return {"at": time.time_ns(), "settings": observe_power().as_json()}


def _snapshot(value: object) -> tuple[int, PowerSnapshot]:
    observation = record(value, {"at", "settings"})
    require(type(observation["at"]) is int and observation["at"] > 0)
    return cast(int, observation["at"]), PowerSnapshot.parse(observation["settings"])


def prepare(repository: Path, expected: dict[str, object]) -> dict[str, object]:
    from benchmarks.batch_official import ensure_raw_root_is_ignored

    ensure_raw_root_is_ignored(repository)
    path = root(repository, cast(str, expected["session"]))
    original = _observation()
    path.mkdir(parents=True, exist_ok=False)
    write_once(path / "reservation.json", {"binding": expected, "original": original})
    return {"schemaVersion": VERSION, "sessionId": expected["session"], "status": "prepared"}


@dataclass(frozen=True)
class ClaimedSession:
    path: Path
    binding: dict[str, object]

    def complete(self, raw: dict[str, object], auxiliaries: dict[str, object]) -> None:
        require(not (self.path / "restored.json").exists(), "already-finalized")
        _check_raw(self.binding, raw)
        data = self.path / "data"
        _safe_path(data)
        data.mkdir(exist_ok=False)
        files: dict[str, str] = {}
        for name, value in {"raw.json": raw, **auxiliaries}.items():
            require(
                name
                in {
                    "raw.json",
                    "loads.json",
                    "trials.json",
                    "cpu-baseline.json",
                    "gpu-baseline.json",
                }
            )
            if isinstance(value, bytes):
                require(len(value) <= MAX_FILE_BYTES)
                with (data / name).open("xb") as stream:
                    stream.write(value)
            else:
                write_once(data / name, value)
            files[name] = digest(read(data / name))
        write_once(
            self.path / "settled.json",
            {
                "binding": self.binding,
                "files": files,
                "claimSha256": digest(read(self.path / "consumed.json")),
            },
        )


def claim(repository: Path, expected: dict[str, object]) -> ClaimedSession:
    path = root(repository, cast(str, expected["session"]))
    reserve = record(decode(read(path / "reservation.json")), {"binding", "original"})
    require(reserve["binding"] == expected, "binding")
    original_at, original = _snapshot(reserve["original"])
    admitted = _observation()
    admitted_at, current = _snapshot(admitted)
    require(admitted_at >= original_at and current.disabled_for(original), "power-not-disabled")
    require(not (path / "restored.json").exists(), "already-finalized")
    write_once(
        path / "consumed.json",
        {
            "binding": expected,
            "admitted": admitted,
            "reservationSha256": digest(read(path / "reservation.json")),
        },
    )
    return ClaimedSession(path, expected)


def _check_raw(expected: dict[str, object], raw: dict[str, object]) -> None:
    require(raw.get("executionCommitSha") == expected["execution"], "execution")
    batch = expected["family"] == "batch"
    require(
        raw.get("schemaVersion") == (BATCH_RAW_VERSION if batch else DUAL_RAW_VERSION), "version"
    )
    require(raw.get("placementProfileId" if batch else "arm") == expected["arm"], "arm")
    require(
        raw.get("profileSha256" if batch else "authorityCommitSha") == expected["authority"],
        "authority",
    )
    cleanup = raw.get("cleanup")
    require(
        isinstance(cleanup, dict)
        and cleanup.get("sleepSettingRestored") is False
        and cleanup.get("rawSessionRemoved") is False,
        "pending-cleanup",
    )


def _journal(path: Path, expected: dict[str, object]) -> tuple[PowerSnapshot, int]:
    original_bytes, admitted_bytes = read(path / "reservation.json"), read(path / "consumed.json")
    reserve = record(decode(original_bytes), {"binding", "original"})
    consumed = record(decode(admitted_bytes), {"binding", "admitted", "reservationSha256"})
    require(
        reserve["binding"] == consumed["binding"] == expected
        and consumed["reservationSha256"] == digest(original_bytes),
        "binding",
    )
    before, original = _snapshot(reserve["original"])
    after, admitted = _snapshot(consumed["admitted"])
    require(after >= before and admitted.disabled_for(original), "power-not-disabled")
    return original, after


def _settled(path: Path, expected: dict[str, object]) -> dict[str, object]:
    settled = record(decode(read(path / "settled.json")), {"binding", "files", "claimSha256"})
    require(
        settled["binding"] == expected
        and settled["claimSha256"] == digest(read(path / "consumed.json")),
        "binding",
    )
    keys = (
        {"raw.json", "loads.json"} if expected["family"] == "batch" else {"raw.json", "trials.json"}
    )
    if expected["family"] == "dual":
        for role in ("cpu", "gpu"):
            if expected[f"{role}Baseline"] is not None:
                keys.add(f"{role}-baseline.json")
    files = record(settled["files"], keys)
    require({item.name for item in (path / "data").iterdir()} == keys, "files")
    values: dict[str, object] = {}
    for name in keys:
        contents = read(path / "data" / name)
        require(files[name] == digest(contents), "digest")
        if name.endswith("-baseline.json"):
            require(digest(contents) == expected[name.split("-")[0] + "Baseline"], "baseline")
        values[name] = decode(contents)
    raw = values["raw.json"]
    require(isinstance(raw, dict))
    _check_raw(expected, cast(dict[str, object], raw))
    return values


def baseline_inputs(repository: Path, expected: dict[str, object]) -> dict[str, object]:
    values: dict[str, object] = {}
    for role in ("cpu", "gpu"):
        required = expected[f"{role}Baseline"]
        if required is not None:
            data = read(repository / f"benchmarks/tts/dual-worker-result-v5-{role}-solo.json")
            require(digest(data) == required, "baseline")
            values[f"{role}-baseline.json"] = data
    return values


def finalize(repository: Path, expected: dict[str, object]) -> dict[str, object]:
    path = root(repository, cast(str, expected["session"]))
    claim_sha: str | None = None
    if (path / "consumed.json").exists():
        original, admitted_at = _journal(path, expected)
        claim_sha = digest(read(path / "consumed.json"))
    else:
        reserve = record(decode(read(path / "reservation.json")), {"binding", "original"})
        require(reserve["binding"] == expected, "binding")
        admitted_at, original = _snapshot(reserve["original"])
    # Failed/interrupted runs can restore without manufacturing a derivable result.
    settled_sha: str | None = None
    if (path / "settled.json").exists():
        _settled(path, expected)
        settled_sha = digest(read(path / "settled.json"))
    observed = _observation()
    observed_at, restored = _snapshot(observed)
    require(observed_at >= admitted_at and restored == original, "power-not-restored")
    value = {
        "binding": expected,
        "observed": observed,
        "settledSha256": settled_sha,
        "claimSha256": claim_sha,
    }
    destination = path / "restored.json"
    if destination.exists():
        prior = record(decode(read(destination)), set(value))
        prior_at, prior_settings = _snapshot(prior["observed"])
        require(
            prior["binding"] == expected
            and prior["settledSha256"] == settled_sha
            and prior["claimSha256"] == value["claimSha256"],
            "binding",
        )
        require(prior_settings == original and prior_at >= admitted_at, "restoration")
    else:
        write_once(destination, value)
    return {
        "schemaVersion": VERSION,
        "sessionId": expected["session"],
        "status": "restored",
        "eligibleForDerivation": settled_sha is not None,
    }


@dataclass(frozen=True)
class VerifiedSafety:
    binding: dict[str, object]
    files: dict[str, object]
    digests: dict[str, object]


def verify(repository: Path, expected: dict[str, object]) -> VerifiedSafety:
    path = root(repository, cast(str, expected["session"]))
    original, admitted_at = _journal(path, expected)
    restored_bytes = read(path / "restored.json")
    restored = record(
        decode(restored_bytes), {"binding", "observed", "settledSha256", "claimSha256"}
    )
    observed_at, observation = _snapshot(restored["observed"])
    require(
        restored["binding"] == expected
        and observation == original
        and observed_at >= admitted_at
        and restored["claimSha256"] == digest(read(path / "consumed.json"))
        and restored["settledSha256"] == digest(read(path / "settled.json")),
        "restoration",
    )
    values = _settled(path, expected)
    settled = cast(dict[str, object], decode(read(path / "settled.json")))
    return VerifiedSafety(
        expected,
        values,
        {
            "inputs": settled["files"],
            "restoration": digest(restored_bytes),
            "settled": restored["settledSha256"],
            "claim": restored["claimSha256"],
            "reservation": digest(read(path / "reservation.json")),
        },
    )
