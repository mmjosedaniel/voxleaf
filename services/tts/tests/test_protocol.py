"""Deterministic framing and control-decoder coverage for protocol v1."""

from __future__ import annotations

import io
import json
import struct
from collections.abc import Buffer, Callable
from pathlib import Path
from typing import Final, cast

import pytest

from voxleaf_tts.protocol import (
    BYTES_PER_SAMPLE,
    HEADER_BYTES,
    MAGIC,
    MAX_AUDIO_PAYLOAD_BYTES,
    MAX_CONTROL_PAYLOAD_BYTES,
    PROTOCOL_VERSION,
    Frame,
    FrameKind,
    ProtocolFailure,
    ProtocolReason,
    decode_control_payload,
    encode_control_message,
    encode_frame,
    read_frame,
    validate_audio_payload,
    write_frame,
)

REPOSITORY_ROOT: Final = Path(__file__).resolve().parents[3]
FIXTURE_ROOT: Final = (
    REPOSITORY_ROOT
    / "packages"
    / "shared"
    / "fixtures"
    / "contracts"
    / "tts-protocol-control"
    / "v1"
)
HEADER: Final = struct.Struct(">4sHBBI")


class FragmentedReader(io.BytesIO):
    """A binary reader that returns at most one small fragment per read."""

    def __init__(self, value: bytes, fragment_bytes: int) -> None:
        super().__init__(value)
        self._fragment_bytes = fragment_bytes

    def read(self, size: int | None = -1) -> bytes:
        limit = (
            self._fragment_bytes if size is None or size < 0 else min(size, self._fragment_bytes)
        )
        return super().read(limit)


class FragmentedWriter(io.BytesIO):
    """A binary writer that accepts only one small fragment per write."""

    def __init__(self, fragment_bytes: int) -> None:
        super().__init__()
        self._fragment_bytes = fragment_bytes

    def write(self, buffer: Buffer) -> int:
        return super().write(memoryview(buffer)[: self._fragment_bytes])


def load_fixture(name: str) -> dict[str, object]:
    return cast(
        dict[str, object],
        json.loads((FIXTURE_ROOT / name).read_text(encoding="utf-8")),
    )


def reason_from(call: Callable[[], object]) -> ProtocolReason:
    with pytest.raises(ProtocolFailure) as captured:
        call()
    return captured.value.reason


def test_framing_accepts_exact_limits_and_fragmented_or_coalesced_reads() -> None:
    control = bytes(MAX_CONTROL_PAYLOAD_BYTES)
    audio = bytes(MAX_AUDIO_PAYLOAD_BYTES)
    combined = encode_frame(FrameKind.CONTROL, control) + encode_frame(FrameKind.AUDIO, audio)
    reader = FragmentedReader(combined, 7)

    assert read_frame(reader) == Frame(FrameKind.CONTROL, control)
    assert read_frame(reader) == Frame(FrameKind.AUDIO, audio)
    assert read_frame(reader) is None

    output = io.BytesIO()
    write_frame(output, Frame(FrameKind.CONTROL, b"{}"))
    assert read_frame(io.BytesIO(output.getvalue())) == Frame(FrameKind.CONTROL, b"{}")

    fragmented_output = FragmentedWriter(3)
    write_frame(fragmented_output, Frame(FrameKind.CONTROL, b"{}"))
    assert read_frame(io.BytesIO(fragmented_output.getvalue())) == Frame(FrameKind.CONTROL, b"{}")


@pytest.mark.parametrize(
    ("kind", "payload_bytes"),
    [
        (FrameKind.CONTROL, MAX_CONTROL_PAYLOAD_BYTES + 1),
        (FrameKind.AUDIO, MAX_AUDIO_PAYLOAD_BYTES + 1),
    ],
)
def test_framing_rejects_max_plus_one_before_payload_read(
    kind: FrameKind, payload_bytes: int
) -> None:
    header = HEADER.pack(MAGIC, PROTOCOL_VERSION, int(kind), 0, payload_bytes)
    assert len(header) == HEADER_BYTES
    assert reason_from(lambda: read_frame(io.BytesIO(header))) is ProtocolReason.OVER_LIMIT


@pytest.mark.parametrize(
    ("record", "expected"),
    [
        (b"", None),
        (b"VLTP", ProtocolReason.MALFORMED_FRAME),
        (
            HEADER.pack(b"BAD!", PROTOCOL_VERSION, 1, 0, 1) + b"x",
            ProtocolReason.MALFORMED_FRAME,
        ),
        (
            HEADER.pack(MAGIC, PROTOCOL_VERSION + 1, 1, 0, 1) + b"x",
            ProtocolReason.UNSUPPORTED_PROTOCOL_VERSION,
        ),
        (
            HEADER.pack(MAGIC, PROTOCOL_VERSION, 9, 0, 1) + b"x",
            ProtocolReason.UNKNOWN_RECORD_KIND,
        ),
        (
            HEADER.pack(MAGIC, PROTOCOL_VERSION, 1, 1, 1) + b"x",
            ProtocolReason.INVALID_FLAGS,
        ),
        (
            HEADER.pack(MAGIC, PROTOCOL_VERSION, 1, 0, 0),
            ProtocolReason.EMPTY_PAYLOAD,
        ),
        (
            HEADER.pack(MAGIC, PROTOCOL_VERSION, 2, 0, BYTES_PER_SAMPLE - 1),
            ProtocolReason.EMPTY_PAYLOAD,
        ),
        (
            HEADER.pack(MAGIC, PROTOCOL_VERSION, 1, 0, 2) + b"x",
            ProtocolReason.MALFORMED_FRAME,
        ),
    ],
)
def test_framing_rejects_malformed_headers_and_truncation(
    record: bytes, expected: ProtocolReason | None
) -> None:
    if expected is None:
        assert read_frame(io.BytesIO(record)) is None
    else:
        assert reason_from(lambda: read_frame(io.BytesIO(record))) is expected


@pytest.mark.parametrize(
    ("payload", "expected"),
    [
        (b"\xff", ProtocolReason.INVALID_UTF8),
        (b"{", ProtocolReason.MALFORMED_JSON),
        (b'{"schemaVersion":1,"schemaVersion":1}', ProtocolReason.MALFORMED_JSON),
        (
            b'{"schemaVersion":1,"protocolVersion":1,"kind":"missing"}',
            ProtocolReason.UNKNOWN_MESSAGE_KIND,
        ),
        (
            b'{"schemaVersion":2,"protocolVersion":1,"kind":"health"}',
            ProtocolReason.UNSUPPORTED_SCHEMA_VERSION,
        ),
        (
            b'{"schemaVersion":1,"protocolVersion":2,"kind":"health"}',
            ProtocolReason.UNSUPPORTED_PROTOCOL_VERSION,
        ),
    ],
)
def test_control_decoder_fails_closed_with_content_free_reasons(
    payload: bytes, expected: ProtocolReason
) -> None:
    assert reason_from(lambda: decode_control_payload(payload)) is expected


def test_control_decoder_accepts_all_shared_valid_kinds_and_rejects_invalids() -> None:
    valid_names = sorted(FIXTURE_ROOT.glob("valid-*.json"))
    invalid_names = sorted(FIXTURE_ROOT.glob("invalid-*.json"))

    assert len(valid_names) == 15
    assert {
        cast(str, decode_control_payload(path.read_bytes())["kind"]) for path in valid_names
    } == {
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
    for path in invalid_names:
        with pytest.raises(ProtocolFailure):
            decode_control_payload(path.read_bytes())


def test_control_decoder_enforces_text_bytes_and_audio_arithmetic() -> None:
    synthesize = load_fixture("valid-synthesize.json")
    segment = cast(dict[str, object], synthesize["segment"])
    segment["text"] = "😀" * 512
    decode_control_payload(encode_control_message(synthesize))
    segment["text"] = "😀" * 513
    assert reason_from(lambda: encode_control_message(synthesize)) is ProtocolReason.OVER_LIMIT

    metadata = load_fixture("valid-audio-metadata.json")
    metadata["payloadBytes"] = 19_196
    assert reason_from(lambda: encode_control_message(metadata)) is ProtocolReason.FORMAT_MISMATCH


def test_audio_validation_rejects_length_and_nonfinite_samples() -> None:
    metadata = load_fixture("valid-audio-metadata.json")
    valid_audio = struct.pack("<f", 0.25) * 4_800
    validate_audio_payload(valid_audio, metadata)

    assert (
        reason_from(lambda: validate_audio_payload(valid_audio[:-4], metadata))
        is ProtocolReason.FORMAT_MISMATCH
    )
    metadata = load_fixture("valid-audio-metadata.json")
    cast(dict[str, object], metadata["frame"])["sequence"] = 1
    assert reason_from(lambda: encode_control_message(metadata)) is ProtocolReason.INVALID_MESSAGE
    non_finite = struct.pack("<f", float("nan")) + valid_audio[4:]
    assert (
        reason_from(lambda: validate_audio_payload(non_finite, metadata))
        is ProtocolReason.FORMAT_MISMATCH
    )


def test_protocol_failures_never_retain_or_render_rejected_content() -> None:
    canary = "PRIVATE-NARRATION-CANARY"
    payload = json.dumps(
        {
            "schemaVersion": 1,
            "protocolVersion": 1,
            "kind": "handshake",
            "serviceInstanceId": "service:synthetic-1",
            "unknown": canary,
        }
    ).encode()
    with pytest.raises(ProtocolFailure) as captured:
        decode_control_payload(payload)

    assert canary not in str(captured.value)
    assert captured.value.args == ("TTS protocol input was rejected.",)
