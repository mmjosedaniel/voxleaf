"""One-use prospective benchmark reservations and bound restoration evidence.

The content-free journal is retained as a tombstone. Only its private data
directory is removed during derivation. Operations are sequential per session.
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import re
import stat
import time
from contextlib import suppress
from dataclasses import dataclass
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import cast
from uuid import uuid4

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
    _write_bytes_once(path, encode(value), ".journal-")


def _write_bytes_once(path: Path, data: bytes, pending_prefix: str) -> None:
    _safe_path(path)
    require(len(data) <= MAX_FILE_BYTES, "input-limit")
    temporary = path.with_name(f"{pending_prefix}{uuid4().hex[:12]}.tmp")
    created = False
    try:
        with temporary.open("xb") as stream:
            created = True
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        # Publishing a hard link is atomic and never replaces an existing record.
        os.link(temporary, path)
    finally:
        if created:
            with suppress(OSError):
                temporary.unlink()


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
    from benchmarks.v5_authority import V5AuthorityError, require_v5_lineage

    if expected["family"] == "dual":
        try:
            require_v5_lineage(repository, expected["authority"], expected["execution"])
        except V5AuthorityError:
            raise SafetyError("result-before-authority") from None
    ensure_raw_root_is_ignored(repository)
    path = root(repository, cast(str, expected["session"]))
    if os.path.lexists(path):
        raise FileExistsError
    path.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(prefix=".prepare-", dir=path.parent) as temporary:
        staged = Path(temporary) / "session"
        staged.mkdir()
        write_once(staged / "reservation.json", {"binding": expected, "original": _observation()})
        # Every legitimate contender publishes a nonempty directory. An interrupted
        # preparation therefore never leaves an empty final name that prevents retry.
        if os.path.lexists(path):
            raise FileExistsError
        staged.rename(path)
    return {"schemaVersion": VERSION, "sessionId": expected["session"], "status": "prepared"}


def _private_output_names(binding: dict[str, object]) -> set[str]:
    if binding["family"] == "batch":
        return {"raw.json", "loads.json"}
    names = {"raw.json", "trials.json"}
    for role in ("cpu", "gpu"):
        if binding[f"{role}Baseline"] is not None:
            names.add(f"{role}-baseline.json")
    return names


def _pending_prefix(claim_sha: str, name: str, contents: bytes) -> str:
    owner = hashlib.sha256(encode([claim_sha, name, digest(contents)])).digest()
    identity = base64.urlsafe_b64encode(owner).decode("ascii").rstrip("=")
    return f".p-{identity}-"


def _check_private_entries(
    data: Path, claim_sha: str, payloads: dict[str, bytes], *, complete: bool
) -> None:
    _safe_path(data)
    prefixes = {
        _pending_prefix(claim_sha, name, contents): contents for name, contents in payloads.items()
    }
    published: set[str] = set()
    for entry in data.iterdir():
        if entry.name in payloads:
            published.add(entry.name)
            continue
        prefix, _, attempt = entry.name.rpartition("-")
        expected = prefixes.get(f"{prefix}-")
        require(
            expected is not None and re.fullmatch(r"[0-9a-f]{12}\.tmp", attempt) is not None,
            "files",
        )
        # Retain interrupted writes as private data until verified derivation removes
        # the session data. Their names and bytes must belong to this exact claim.
        assert expected is not None
        _safe_path(entry)
        require(stat.S_ISREG(entry.lstat().st_mode), "files")
        require(expected.startswith(read(entry)), "digest")
    if complete:
        require(published == set(payloads), "files")


@dataclass(frozen=True)
class ClaimedSession:
    path: Path
    binding: dict[str, object]

    def complete(self, raw: dict[str, object], auxiliaries: dict[str, object]) -> None:
        require(not (self.path / "restored.json").exists(), "already-finalized")
        if (self.path / "settled.json").exists():
            raise FileExistsError
        _journal(self.path, self.binding)
        claim_sha = digest(read(self.path / "consumed.json"))
        _check_raw(self.binding, raw)
        require(set(auxiliaries) == _private_output_names(self.binding) - {"raw.json"}, "files")
        payloads = {
            name: value if isinstance(value, bytes) else encode(value)
            for name, value in {"raw.json": raw, **auxiliaries}.items()
        }
        require(all(len(value) <= MAX_FILE_BYTES for value in payloads.values()), "input-limit")
        data = self.path / "data"
        _safe_path(data)
        data.mkdir(exist_ok=True)
        _check_private_entries(data, claim_sha, payloads, complete=False)
        files: dict[str, str] = {}
        for name, contents in payloads.items():
            destination = data / name
            try:
                _write_bytes_once(destination, contents, _pending_prefix(claim_sha, name, contents))
            except FileExistsError:
                # A retry after interrupted settlement can reuse identical private evidence.
                require(read(destination) == contents, "digest")
            files[name] = digest(contents)
        _check_private_entries(data, claim_sha, payloads, complete=True)
        write_once(
            self.path / "settled.json",
            {
                "binding": self.binding,
                "files": files,
                "claimSha256": claim_sha,
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
    claim_sha = digest(read(path / "consumed.json"))
    require(settled["binding"] == expected and settled["claimSha256"] == claim_sha, "binding")
    keys = _private_output_names(expected)
    files = record(settled["files"], keys)
    data = path / "data"
    payloads = {name: read(data / name) for name in keys}
    _check_private_entries(data, claim_sha, payloads, complete=True)
    values: dict[str, object] = {}
    for name, contents in payloads.items():
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
