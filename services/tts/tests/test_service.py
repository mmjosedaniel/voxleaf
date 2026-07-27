"""Model-free service lifecycle, cancellation, and cleanup coverage."""

from __future__ import annotations

import io
import json
import subprocess
import sys
from collections.abc import Mapping
from pathlib import Path
from typing import Final, cast

import pytest

from voxleaf_tts.fake_engine import FakeEngineOutcome, FakeTtsEngine
from voxleaf_tts.protocol import (
    Frame,
    FrameKind,
    FrozenJson,
    ServiceState,
    decode_control_payload,
    encode_control_message,
    encode_frame,
    read_frame,
)
from voxleaf_tts.service import ModelFreeTtsService, run_service

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


def load_raw(name: str) -> dict[str, object]:
    return cast(
        dict[str, object],
        json.loads((FIXTURE_ROOT / name).read_text(encoding="utf-8")),
    )


def load_control(name: str) -> Mapping[str, FrozenJson]:
    return decode_control_payload((FIXTURE_ROOT / name).read_bytes())


def control_from(frame: Frame) -> Mapping[str, FrozenJson]:
    assert frame.kind is FrameKind.CONTROL
    return decode_control_payload(frame.payload)


def record_kinds(records: tuple[Frame, ...]) -> list[str]:
    return [
        "audio" if frame.kind is FrameKind.AUDIO else cast(str, control_from(frame)["kind"])
        for frame in records
    ]


def make_ready(
    engine: FakeTtsEngine | None = None,
) -> tuple[ModelFreeTtsService, FakeTtsEngine]:
    selected_engine = engine or FakeTtsEngine()
    service = ModelFreeTtsService(selected_engine)
    assert record_kinds(service.handle_control(load_control("valid-handshake.json"))) == [
        "state",
        "handshakeAccepted",
        "state",
        "capabilities",
    ]
    assert record_kinds(service.handle_control(load_control("valid-load.json"))) == [
        "state",
        "state",
    ]
    assert record_kinds(service.handle_control(load_control("valid-warm.json"))) == [
        "state",
        "capabilities",
    ]
    assert service.state is ServiceState.READY
    return service, selected_engine


def test_handshake_load_warm_health_and_shutdown_are_closed_and_bounded() -> None:
    service, engine = make_ready()
    health = service.handle_control(load_control("valid-health.json"))

    assert record_kinds(health) == ["state", "capabilities"]
    assert control_from(health[0])["state"] == "ready"
    capabilities = cast(Mapping[str, object], control_from(health[1])["report"])
    feature_set = cast(Mapping[str, object], capabilities["capabilities"])
    assert feature_set == {
        "localSpeechGeneration": "unknown",
        "streamingGeneration": "unsupported",
        "generationCancellation": "unsupported",
        "hardwareAcceleration": "unknown",
        "cpuFallback": "unsupported",
    }

    shutdown = service.handle_control(load_control("valid-shutdown.json"))
    assert record_kinds(shutdown) == ["state", "state"]
    assert control_from(shutdown[0])["state"] == "stopping"
    assert control_from(shutdown[1])["state"] == "stopped"
    assert engine.observe().cleanup_count == 1
    assert engine.observe().retained_audio_units == 0


def test_success_publishes_one_complete_ordered_unit_then_releases_it() -> None:
    service, engine = make_ready()
    accepted = service.handle_control(load_control("valid-synthesize.json"))

    assert record_kinds(accepted) == ["state"]
    assert control_from(accepted[0])["state"] == "generating"
    settled = service.settle_active()
    assert record_kinds(settled) == [
        "audioMetadata",
        "audio",
        "completed",
        "state",
    ]
    metadata = control_from(settled[0])
    audio = settled[1]
    completed = control_from(settled[2])
    assert metadata["payloadBytes"] == len(audio.payload) == 19_200
    assert cast(Mapping[str, object], metadata["frame"])["sampleCountSamples"] == 4_800
    assert completed["workIdentity"] == {
        "requestId": "request:synthetic-1",
        "sessionId": "session:synthetic-1",
        "generationId": "generation:synthetic-1",
        "segmentId": "segment:synthetic-1",
    }
    assert service.state is ServiceState.READY
    assert engine.observe().active_count == 0
    assert engine.observe().retained_audio_units == 0


def test_pending_generation_applies_backpressure_and_rejects_a_second_request() -> None:
    engine = FakeTtsEngine(FakeEngineOutcome.PENDING_SUCCESS)
    service, _ = make_ready(engine)
    first = load_control("valid-synthesize.json")
    assert record_kinds(service.handle_control(first)) == ["state"]
    assert service.settle_active() == ()

    second_raw = load_raw("valid-synthesize.json")
    second_raw["requestId"] = "request:synthetic-2"
    segment = cast(dict[str, object], second_raw["segment"])
    segment["segmentId"] = "segment:synthetic-2"
    second = decode_control_payload(encode_control_message(second_raw))
    busy = service.handle_control(second)
    assert record_kinds(busy) == ["error"]
    assert control_from(busy[0])["reason"] == "busy"
    assert engine.observe().active_count == 1

    engine.release_pending()
    assert record_kinds(service.settle_active()) == [
        "audioMetadata",
        "audio",
        "completed",
        "state",
    ]
    assert engine.observe().active_count == 0


def test_identity_first_cancel_suppresses_late_completion_and_stops_worker() -> None:
    engine = FakeTtsEngine(FakeEngineOutcome.LATE_SUCCESS)
    service, _ = make_ready(engine)
    service.handle_control(load_control("valid-synthesize.json"))

    cancelled = service.handle_control(load_control("valid-cancel.json"))
    assert record_kinds(cancelled) == ["state", "cancelled", "state"]
    assert control_from(cancelled[0])["state"] == "cancelling"
    assert control_from(cancelled[2])["state"] == "stopped"
    assert service.settle_active() == ()
    assert engine.take_late_result() is not None
    assert service.settle_active() == ()
    assert engine.observe().retained_audio_units == 0


def test_mismatched_cancel_and_immediate_duplicate_request_fail_content_free() -> None:
    engine = FakeTtsEngine(FakeEngineOutcome.PENDING_SUCCESS)
    service, _ = make_ready(engine)
    service.handle_control(load_control("valid-synthesize.json"))

    wrong = load_raw("valid-cancel.json")
    identity = cast(dict[str, object], wrong["workIdentity"])
    identity["generationId"] = "generation:stale"
    rejected = service.handle_control(decode_control_payload(encode_control_message(wrong)))
    assert control_from(rejected[0])["reason"] == "identity-mismatch"
    assert service.has_active_request

    service.handle_control(load_control("valid-cancel.json"))
    restarted, _ = make_ready()
    restarted.handle_control(load_control("valid-synthesize.json"))
    restarted.settle_active()
    duplicate = restarted.handle_control(load_control("valid-synthesize.json"))
    assert control_from(duplicate[0])["reason"] == "duplicate-identity"


@pytest.mark.parametrize(
    "outcome",
    [
        FakeEngineOutcome.FAILURE,
        FakeEngineOutcome.TIMEOUT,
        FakeEngineOutcome.CRASH,
        FakeEngineOutcome.NON_FINITE,
        FakeEngineOutcome.OVERSIZED,
    ],
)
def test_failure_timeout_crash_and_invalid_waveform_publish_zero_audio(
    outcome: FakeEngineOutcome,
) -> None:
    service, engine = make_ready(FakeTtsEngine(outcome))
    service.handle_control(load_control("valid-synthesize.json"))
    settled = service.settle_active()

    assert record_kinds(settled) == ["error", "state"]
    assert all(record.kind is not FrameKind.AUDIO for record in settled)
    assert control_from(settled[-1])["state"] == "failed"
    assert engine.observe().active_count == 0
    assert engine.observe().retained_audio_units == 0

    replacement, _ = make_ready()
    assert replacement.state is ServiceState.READY


def test_service_loop_handles_coalesced_records_and_keeps_narration_out_of_output() -> None:
    canary = "PRIVATE-NARRATION-CANARY"
    synthesize = load_raw("valid-synthesize.json")
    cast(dict[str, object], synthesize["segment"])["text"] = canary
    commands = [
        load_raw("valid-handshake.json"),
        load_raw("valid-load.json"),
        load_raw("valid-warm.json"),
        synthesize,
        load_raw("valid-shutdown.json"),
    ]
    input_bytes = b"".join(
        encode_frame(FrameKind.CONTROL, encode_control_message(message)) for message in commands
    )
    output = io.BytesIO()

    assert run_service(io.BytesIO(input_bytes), output) == 0
    raw_output = output.getvalue()
    assert canary.encode() not in raw_output

    reader = io.BytesIO(raw_output)
    records: list[Frame] = []
    while (record := read_frame(reader)) is not None:
        records.append(record)
    kinds = [
        "audio" if record.kind is FrameKind.AUDIO else cast(str, control_from(record)["kind"])
        for record in records
    ]
    assert kinds.count("audio") == 1
    assert kinds.index("audioMetadata") < kinds.index("audio") < kinds.index("completed")
    assert kinds[-1] == "state"
    assert control_from(records[-1])["state"] == "stopped"


def test_module_entry_point_runs_the_same_binary_standard_stream_loop() -> None:
    commands = [
        load_raw("valid-handshake.json"),
        load_raw("valid-load.json"),
        load_raw("valid-warm.json"),
        load_raw("valid-synthesize.json"),
        load_raw("valid-shutdown.json"),
    ]
    input_bytes = b"".join(
        encode_frame(FrameKind.CONTROL, encode_control_message(message)) for message in commands
    )

    completed = subprocess.run(
        [sys.executable, "-m", "voxleaf_tts.service"],
        cwd=REPOSITORY_ROOT / "services" / "tts",
        input=input_bytes,
        capture_output=True,
        check=False,
        timeout=5,
    )

    assert completed.returncode == 0
    assert completed.stderr == b""
    reader = io.BytesIO(completed.stdout)
    records: list[Frame] = []
    while (record := read_frame(reader)) is not None:
        records.append(record)
    assert sum(record.kind is FrameKind.AUDIO for record in records) == 1


def test_protocol_rejection_closes_without_echoing_private_input() -> None:
    canary = "PRIVATE-PATH-CANARY"
    invalid = load_raw("valid-handshake.json")
    invalid["unknown"] = canary
    payload = json.dumps(invalid).encode()
    output = io.BytesIO()

    assert (
        run_service(
            io.BytesIO(encode_frame(FrameKind.CONTROL, payload)),
            output,
        )
        == 1
    )
    assert canary.encode() not in output.getvalue()
    rejection = read_frame(io.BytesIO(output.getvalue()))
    assert rejection is not None
    assert control_from(rejection)["kind"] == "protocolRejected"
    assert control_from(rejection)["reason"] == "invalid-message"


def test_clean_eof_requires_completed_shutdown() -> None:
    assert run_service(io.BytesIO(), io.BytesIO()) == 1
