"""Bounded framing and canonical control decoding for TTS protocol version 1."""

from __future__ import annotations

import json
import math
import struct
from collections.abc import Mapping
from dataclasses import dataclass
from enum import IntEnum, StrEnum
from types import MappingProxyType
from typing import BinaryIO, Final, cast

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

from .generated.protocol_schemas import SCHEMAS_BY_ID

MAGIC: Final = b"VLTP"
PROTOCOL_VERSION: Final = 1
SCHEMA_VERSION: Final = 1
HEADER_BYTES: Final = 12
MAX_CONTROL_PAYLOAD_BYTES: Final = 16_384
MAX_AUDIO_PAYLOAD_BYTES: Final = 1_920_000
MAX_NARRATION_CODE_POINTS: Final = 640
MAX_NARRATION_UTF8_BYTES: Final = 2_048
MAX_AUDIO_SAMPLE_COUNT: Final = 480_000
SAMPLE_RATE_HZ: Final = 24_000
CHANNEL_COUNT: Final = 1
BYTES_PER_SAMPLE: Final = 4
SAMPLE_FORMAT: Final = "float32-le"

_HEADER: Final = struct.Struct(">4sHBBI")
_FLOAT32_LE: Final = struct.Struct("<f")
_CONTROL_SCHEMA_ID: Final = "urn:voxleaf:schema:tts-protocol-control:v1"
_CONTROL_KINDS: Final = frozenset(
    {
        "handshake",
        "load",
        "warm",
        "synthesize",
        "cancel",
        "health",
        "shutdown",
        "handshakeAccepted",
        "state",
        "capabilities",
        "audioMetadata",
        "completed",
        "cancelled",
        "error",
        "protocolRejected",
    }
)

type JsonScalar = None | bool | int | float | str
type FrozenJson = JsonScalar | tuple[FrozenJson, ...] | Mapping[str, FrozenJson]


class FrameKind(IntEnum):
    """Closed standard-stream frame kinds."""

    CONTROL = 1
    AUDIO = 2


class ProtocolReason(StrEnum):
    """Closed content-free protocol failure reasons."""

    MALFORMED_FRAME = "malformed-frame"
    UNSUPPORTED_PROTOCOL_VERSION = "unsupported-protocol-version"
    UNKNOWN_RECORD_KIND = "unknown-record-kind"
    INVALID_FLAGS = "invalid-flags"
    EMPTY_PAYLOAD = "empty-payload"
    OVER_LIMIT = "over-limit"
    INVALID_UTF8 = "invalid-utf8"
    MALFORMED_JSON = "malformed-json"
    UNKNOWN_MESSAGE_KIND = "unknown-message-kind"
    UNSUPPORTED_SCHEMA_VERSION = "unsupported-schema-version"
    INVALID_MESSAGE = "invalid-message"
    INVALID_STATE = "invalid-state"
    IDENTITY_MISMATCH = "identity-mismatch"
    DUPLICATE_IDENTITY = "duplicate-identity"
    SEQUENCE_GAP = "sequence-gap"
    FORMAT_MISMATCH = "format-mismatch"
    BUSY = "busy"
    ENGINE_FAILURE = "engine-failure"
    ENGINE_TIMEOUT = "engine-timeout"
    OPERATION_CANCELLED = "operation-cancelled"
    RESOURCE_EXHAUSTED = "resource-exhausted"


class ServiceState(StrEnum):
    """Closed service lifecycle states."""

    STARTING = "starting"
    HANDSHAKING = "handshaking"
    UNLOADED = "unloaded"
    LOADING = "loading"
    WARMING = "warming"
    READY = "ready"
    GENERATING = "generating"
    CANCELLING = "cancelling"
    STOPPING = "stopping"
    STOPPED = "stopped"
    FAILED = "failed"


class ProtocolFailure(Exception):
    """A fixed protocol rejection that never retains rejected input."""

    def __init__(self, reason: ProtocolReason) -> None:
        super().__init__("TTS protocol input was rejected.")
        self.reason = reason


@dataclass(frozen=True, slots=True)
class Frame:
    """One validated bounded transport frame."""

    kind: FrameKind
    payload: bytes


def _schema_registry() -> Registry:
    registry = Registry()
    for schema_id, schema in SCHEMAS_BY_ID.items():
        registry = registry.with_resource(schema_id, Resource.from_contents(schema))
    return registry


_CONTROL_VALIDATOR: Final = Draft202012Validator(
    SCHEMAS_BY_ID[_CONTROL_SCHEMA_ID],
    registry=_schema_registry(),
)


def _payload_bounds(kind: FrameKind) -> tuple[int, int]:
    if kind is FrameKind.CONTROL:
        return (1, MAX_CONTROL_PAYLOAD_BYTES)
    return (BYTES_PER_SAMPLE, MAX_AUDIO_PAYLOAD_BYTES)


def _read_exact(reader: BinaryIO, count: int, *, clean_eof: bool = False) -> bytes | None:
    buffer = bytearray(count)
    offset = 0
    while offset < count:
        chunk = reader.read(count - offset)
        if chunk is None:
            raise ProtocolFailure(ProtocolReason.MALFORMED_FRAME)
        if not chunk:
            if clean_eof and offset == 0:
                return None
            raise ProtocolFailure(ProtocolReason.MALFORMED_FRAME)
        if len(chunk) > count - offset:
            raise ProtocolFailure(ProtocolReason.MALFORMED_FRAME)
        buffer[offset : offset + len(chunk)] = chunk
        offset += len(chunk)
    return bytes(buffer)


def read_frame(reader: BinaryIO) -> Frame | None:
    """Read one record, rejecting its declared bound before payload allocation."""

    raw_header = _read_exact(reader, HEADER_BYTES, clean_eof=True)
    if raw_header is None:
        return None

    magic, version, raw_kind, flags, payload_bytes = _HEADER.unpack(raw_header)
    if magic != MAGIC:
        raise ProtocolFailure(ProtocolReason.MALFORMED_FRAME)
    if version != PROTOCOL_VERSION:
        raise ProtocolFailure(ProtocolReason.UNSUPPORTED_PROTOCOL_VERSION)
    try:
        kind = FrameKind(raw_kind)
    except ValueError as error:
        raise ProtocolFailure(ProtocolReason.UNKNOWN_RECORD_KIND) from error
    if flags != 0:
        raise ProtocolFailure(ProtocolReason.INVALID_FLAGS)

    minimum, maximum = _payload_bounds(kind)
    if payload_bytes < minimum:
        raise ProtocolFailure(ProtocolReason.EMPTY_PAYLOAD)
    if payload_bytes > maximum:
        raise ProtocolFailure(ProtocolReason.OVER_LIMIT)

    payload = _read_exact(reader, payload_bytes)
    if payload is None:
        raise ProtocolFailure(ProtocolReason.MALFORMED_FRAME)
    return Frame(kind=kind, payload=payload)


def encode_frame(kind: FrameKind, payload: bytes) -> bytes:
    """Encode one already-owned bounded record."""

    minimum, maximum = _payload_bounds(kind)
    if len(payload) < minimum:
        raise ProtocolFailure(ProtocolReason.EMPTY_PAYLOAD)
    if len(payload) > maximum:
        raise ProtocolFailure(ProtocolReason.OVER_LIMIT)
    return _HEADER.pack(MAGIC, PROTOCOL_VERSION, int(kind), 0, len(payload)) + payload


def write_frame(writer: BinaryIO, frame: Frame) -> None:
    """Write one complete record without retaining another pending record."""

    encoded = encode_frame(frame.kind, frame.payload)
    view = memoryview(encoded)
    offset = 0
    while offset < len(encoded):
        written = writer.write(view[offset:])
        if written is None or written <= 0:
            raise ProtocolFailure(ProtocolReason.MALFORMED_FRAME)
        offset += written


def _reject_non_json_number(_: str) -> object:
    raise ProtocolFailure(ProtocolReason.MALFORMED_JSON)


def _strict_object(pairs: list[tuple[str, object]]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, value in pairs:
        if key in result:
            raise ProtocolFailure(ProtocolReason.MALFORMED_JSON)
        result[key] = value
    return result


def _freeze_json(value: object) -> FrozenJson:
    if isinstance(value, dict):
        return MappingProxyType({str(key): _freeze_json(item) for key, item in value.items()})
    if isinstance(value, list):
        return tuple(_freeze_json(item) for item in value)
    return cast(JsonScalar, value)


def _read_supported_versions(value: object) -> Mapping[str, object]:
    if not isinstance(value, dict):
        raise ProtocolFailure(ProtocolReason.INVALID_MESSAGE)

    schema_version = value.get("schemaVersion")
    protocol_version = value.get("protocolVersion")
    if (
        not isinstance(schema_version, int)
        or isinstance(schema_version, bool)
        or not isinstance(protocol_version, int)
        or isinstance(protocol_version, bool)
    ):
        raise ProtocolFailure(ProtocolReason.INVALID_MESSAGE)
    if schema_version != SCHEMA_VERSION:
        raise ProtocolFailure(ProtocolReason.UNSUPPORTED_SCHEMA_VERSION)
    if protocol_version != PROTOCOL_VERSION:
        raise ProtocolFailure(ProtocolReason.UNSUPPORTED_PROTOCOL_VERSION)
    return value


def _expected_error_code(reason: str) -> str:
    if reason in {"unsupported-protocol-version", "unsupported-schema-version"}:
        return "unsupported-input"
    if reason == "operation-cancelled":
        return "operation-cancelled"
    if reason in {"busy", "resource-exhausted"}:
        return "resource-exhausted"
    if reason in {
        "engine-failure",
        "engine-timeout",
        "format-mismatch",
        "sequence-gap",
    }:
        return "internal-failure"
    return "invalid-input"


def _semantic_validate(message: Mapping[str, object]) -> None:
    kind = message["kind"]
    if kind == "synthesize":
        segment = cast(dict[str, object], message["segment"])
        text = cast(str, segment["text"])
        if len(text.encode("utf-8")) > MAX_NARRATION_UTF8_BYTES:
            raise ProtocolFailure(ProtocolReason.OVER_LIMIT)
        book_identity = cast(dict[str, object], segment["bookIdentity"])
        source_range = cast(dict[str, object], segment["sourceRange"])
        start = cast(dict[str, object], source_range["start"])
        end = cast(dict[str, object], source_range["end"])
        if book_identity != start["bookIdentity"] or book_identity != end["bookIdentity"]:
            raise ProtocolFailure(ProtocolReason.IDENTITY_MISMATCH)
    elif kind == "audioMetadata":
        frame = cast(dict[str, object], message["frame"])
        sample_count = cast(int, frame["sampleCountSamples"])
        if cast(int, message["payloadBytes"]) != sample_count * BYTES_PER_SAMPLE:
            raise ProtocolFailure(ProtocolReason.FORMAT_MISMATCH)
    elif kind == "error":
        operational_error = cast(dict[str, object], message["error"])
        if operational_error["code"] != _expected_error_code(cast(str, message["reason"])):
            raise ProtocolFailure(ProtocolReason.INVALID_MESSAGE)


def decode_control_payload(payload: bytes) -> Mapping[str, FrozenJson]:
    """Decode, structurally validate, semantically validate, and freeze one control."""

    if not payload:
        raise ProtocolFailure(ProtocolReason.EMPTY_PAYLOAD)
    if len(payload) > MAX_CONTROL_PAYLOAD_BYTES:
        raise ProtocolFailure(ProtocolReason.OVER_LIMIT)
    try:
        text = payload.decode("utf-8", errors="strict")
    except UnicodeDecodeError:
        raise ProtocolFailure(ProtocolReason.INVALID_UTF8) from None
    try:
        value = json.loads(
            text,
            object_pairs_hook=_strict_object,
            parse_constant=_reject_non_json_number,
        )
    except ProtocolFailure:
        raise
    except (json.JSONDecodeError, RecursionError):
        raise ProtocolFailure(ProtocolReason.MALFORMED_JSON) from None

    message = _read_supported_versions(value)
    kind = message.get("kind")
    if not isinstance(kind, str) or kind not in _CONTROL_KINDS:
        raise ProtocolFailure(ProtocolReason.UNKNOWN_MESSAGE_KIND)
    if not _CONTROL_VALIDATOR.is_valid(message):
        raise ProtocolFailure(ProtocolReason.INVALID_MESSAGE)
    _semantic_validate(message)
    return cast(Mapping[str, FrozenJson], _freeze_json(message))


def encode_control_message(message: Mapping[str, object]) -> bytes:
    """Encode a schema-valid control object as compact deterministic UTF-8 JSON."""

    try:
        payload = json.dumps(
            message,
            allow_nan=False,
            ensure_ascii=False,
            separators=(",", ":"),
            sort_keys=True,
        ).encode("utf-8")
    except (TypeError, ValueError, RecursionError) as error:
        raise ProtocolFailure(ProtocolReason.INVALID_MESSAGE) from error
    decode_control_payload(payload)
    return payload


def validate_audio_payload(payload: bytes, metadata: Mapping[str, object]) -> None:
    """Validate one complete PCM unit against its already-validated metadata."""

    if len(payload) < BYTES_PER_SAMPLE:
        raise ProtocolFailure(ProtocolReason.EMPTY_PAYLOAD)
    if len(payload) > MAX_AUDIO_PAYLOAD_BYTES:
        raise ProtocolFailure(ProtocolReason.OVER_LIMIT)
    frame = cast(Mapping[str, object], metadata["frame"])
    expected_bytes = cast(int, frame["sampleCountSamples"]) * BYTES_PER_SAMPLE
    if len(payload) != expected_bytes or len(payload) % BYTES_PER_SAMPLE != 0:
        raise ProtocolFailure(ProtocolReason.FORMAT_MISMATCH)
    for (sample,) in struct.iter_unpack(_FLOAT32_LE.format, payload):
        if not math.isfinite(sample):
            raise ProtocolFailure(ProtocolReason.FORMAT_MISMATCH)
