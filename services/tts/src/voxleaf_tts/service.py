"""Model-free local TTS protocol state machine and standard-stream service loop."""

from __future__ import annotations

import sys
from collections.abc import Mapping
from contextlib import suppress
from typing import BinaryIO, Final, cast

from .engine import (
    EngineFailure,
    EngineFailureCode,
    TtsEngine,
    WorkIdentity,
)
from .fake_engine import FakeTtsEngine
from .protocol import (
    CHANNEL_COUNT,
    PROTOCOL_VERSION,
    SAMPLE_FORMAT,
    SAMPLE_RATE_HZ,
    SCHEMA_VERSION,
    Frame,
    FrameKind,
    FrozenJson,
    ProtocolFailure,
    ProtocolReason,
    ServiceState,
    decode_control_payload,
    encode_control_message,
    read_frame,
    validate_audio_payload,
    write_frame,
)

_NATIVE_MESSAGE_KINDS: Final = frozenset(
    {"handshake", "load", "warm", "synthesize", "cancel", "health", "shutdown"}
)


def _work_identity_dict(identity: WorkIdentity) -> dict[str, str]:
    return {
        "requestId": identity.request_id,
        "sessionId": identity.session_id,
        "generationId": identity.generation_id,
        "segmentId": identity.segment_id,
    }


def _operational_error(reason: ProtocolReason) -> dict[str, object]:
    if reason in {
        ProtocolReason.UNSUPPORTED_PROTOCOL_VERSION,
        ProtocolReason.UNSUPPORTED_SCHEMA_VERSION,
    }:
        code, category, severity = "unsupported-input", "input", "recoverable"
    elif reason is ProtocolReason.OPERATION_CANCELLED:
        code, category, severity = (
            "operation-cancelled",
            "cancellation",
            "recoverable",
        )
    elif reason in {ProtocolReason.BUSY, ProtocolReason.RESOURCE_EXHAUSTED}:
        code, category, severity = (
            "resource-exhausted",
            "resource",
            "recoverable",
        )
    elif reason in {
        ProtocolReason.ENGINE_FAILURE,
        ProtocolReason.ENGINE_TIMEOUT,
        ProtocolReason.FORMAT_MISMATCH,
        ProtocolReason.SEQUENCE_GAP,
    }:
        code, category, severity = "internal-failure", "internal", "fatal"
    else:
        code, category, severity = "invalid-input", "input", "recoverable"
    return {
        "schemaVersion": SCHEMA_VERSION,
        "code": code,
        "category": category,
        "severity": severity,
    }


def _control(message: Mapping[str, object]) -> Frame:
    return Frame(FrameKind.CONTROL, encode_control_message(message))


class ModelFreeTtsService:
    """One-active/no-queue protocol owner around a deterministic fake engine."""

    def __init__(self, engine: TtsEngine | None = None) -> None:
        self._engine = engine or FakeTtsEngine()
        self._state = ServiceState.STARTING
        self._service_instance_id: str | None = None
        self._active_identity: WorkIdentity | None = None
        self._last_request_id: str | None = None

    @property
    def state(self) -> ServiceState:
        return self._state

    @property
    def has_active_request(self) -> bool:
        return self._active_identity is not None

    def _base(self, kind: str) -> dict[str, object]:
        if self._service_instance_id is None:
            raise ProtocolFailure(ProtocolReason.INVALID_STATE)
        return {
            "schemaVersion": SCHEMA_VERSION,
            "protocolVersion": PROTOCOL_VERSION,
            "kind": kind,
            "serviceInstanceId": self._service_instance_id,
        }

    def _state_record(self, state: ServiceState | None = None) -> Frame:
        message = self._base("state")
        message["state"] = (state or self._state).value
        return _control(message)

    def _capabilities_record(self) -> Frame:
        capabilities = self._engine.capabilities()
        message = self._base("capabilities")
        message.update(
            {
                "report": {
                    "schemaVersion": SCHEMA_VERSION,
                    "capabilities": {
                        "localSpeechGeneration": capabilities.local_speech_generation,
                        "streamingGeneration": capabilities.streaming_generation,
                        "generationCancellation": capabilities.generation_cancellation,
                        "hardwareAcceleration": capabilities.hardware_acceleration,
                        "cpuFallback": capabilities.cpu_fallback,
                    },
                },
                "cancellationContainment": ("identity-invalidation-then-worker-termination"),
            }
        )
        return _control(message)

    def _error_record(
        self,
        reason: ProtocolReason,
        identity: WorkIdentity | None = None,
    ) -> Frame:
        message = self._base("error")
        message["reason"] = reason.value
        message["error"] = _operational_error(reason)
        if identity is not None:
            message["workIdentity"] = _work_identity_dict(identity)
        return _control(message)

    def _verify_service_identity(self, message: Mapping[str, FrozenJson]) -> None:
        if message.get("serviceInstanceId") != self._service_instance_id:
            raise ProtocolFailure(ProtocolReason.IDENTITY_MISMATCH)

    def _handle_handshake(self, message: Mapping[str, FrozenJson]) -> tuple[Frame, ...]:
        if self._state is not ServiceState.STARTING:
            raise ProtocolFailure(ProtocolReason.INVALID_STATE)
        self._service_instance_id = cast(str, message["serviceInstanceId"])
        self._state = ServiceState.HANDSHAKING
        handshaking = self._state_record()
        accepted = _control(self._base("handshakeAccepted"))
        self._state = ServiceState.UNLOADED
        return (
            handshaking,
            accepted,
            self._state_record(),
            self._capabilities_record(),
        )

    def _handle_load(self) -> tuple[Frame, ...]:
        if self._state is not ServiceState.UNLOADED:
            return (self._error_record(ProtocolReason.INVALID_STATE),)
        self._state = ServiceState.LOADING
        loading = self._state_record()
        try:
            self._engine.load()
        except EngineFailure:
            return self._fail_engine()
        self._state = ServiceState.WARMING
        return (loading, self._state_record())

    def _handle_warm(self) -> tuple[Frame, ...]:
        if self._state is not ServiceState.WARMING:
            return (self._error_record(ProtocolReason.INVALID_STATE),)
        try:
            self._engine.warm()
        except EngineFailure:
            return self._fail_engine()
        self._state = ServiceState.READY
        return (self._state_record(), self._capabilities_record())

    def _handle_synthesize(self, message: Mapping[str, FrozenJson]) -> tuple[Frame, ...]:
        if self._active_identity is not None or self._state is ServiceState.GENERATING:
            return (self._error_record(ProtocolReason.BUSY, self._active_identity),)
        if self._state is not ServiceState.READY:
            return (self._error_record(ProtocolReason.INVALID_STATE),)

        request_id = cast(str, message["requestId"])
        if request_id == self._last_request_id:
            return (self._error_record(ProtocolReason.DUPLICATE_IDENTITY),)
        segment = cast(Mapping[str, object], message["segment"])
        try:
            identity = self._engine.begin(request_id, segment)
        except EngineFailure:
            return self._fail_engine()
        self._active_identity = identity
        self._state = ServiceState.GENERATING
        return (self._state_record(),)

    def _handle_cancel(self, message: Mapping[str, FrozenJson]) -> tuple[Frame, ...]:
        if self._state is not ServiceState.GENERATING or self._active_identity is None:
            return (self._error_record(ProtocolReason.INVALID_STATE),)
        requested = cast(Mapping[str, FrozenJson], message["workIdentity"])
        identity = self._active_identity
        if requested != _work_identity_dict(identity):
            return (self._error_record(ProtocolReason.IDENTITY_MISMATCH),)

        self._state = ServiceState.CANCELLING
        cancelling = self._state_record()
        self._active_identity = None
        self._last_request_id = identity.request_id
        try:
            self._engine.cancel(identity)
        except EngineFailure:
            return self._fail_engine(identity)
        cancelled = self._base("cancelled")
        cancelled["workIdentity"] = _work_identity_dict(identity)
        self._state = ServiceState.STOPPED
        return (cancelling, _control(cancelled), self._state_record())

    def _handle_health(self) -> tuple[Frame, ...]:
        return (self._state_record(), self._capabilities_record())

    def _handle_shutdown(self) -> tuple[Frame, ...]:
        if self._state in {ServiceState.STOPPED, ServiceState.FAILED}:
            return (self._error_record(ProtocolReason.INVALID_STATE),)
        self._state = ServiceState.STOPPING
        stopping = self._state_record()
        self._active_identity = None
        self._engine.cleanup()
        self._state = ServiceState.STOPPED
        return (stopping, self._state_record())

    def handle_control(self, message: Mapping[str, FrozenJson]) -> tuple[Frame, ...]:
        """Apply one validated native command without queueing another request."""

        kind = cast(str, message["kind"])
        if kind not in _NATIVE_MESSAGE_KINDS:
            raise ProtocolFailure(ProtocolReason.INVALID_MESSAGE)
        if kind == "handshake":
            return self._handle_handshake(message)

        self._verify_service_identity(message)
        if kind == "load":
            return self._handle_load()
        if kind == "warm":
            return self._handle_warm()
        if kind == "synthesize":
            return self._handle_synthesize(message)
        if kind == "cancel":
            return self._handle_cancel(message)
        if kind == "health":
            return self._handle_health()
        return self._handle_shutdown()

    def _fail_engine(
        self,
        identity: WorkIdentity | None = None,
        reason: ProtocolReason = ProtocolReason.ENGINE_FAILURE,
    ) -> tuple[Frame, ...]:
        self._active_identity = None
        self._engine.cleanup()
        self._state = ServiceState.FAILED
        return (
            self._error_record(reason, identity),
            self._state_record(),
        )

    def settle_active(self) -> tuple[Frame, ...]:
        """Settle the active fake operation, suppressing all stale completion."""

        identity = self._active_identity
        if identity is None or self._state is not ServiceState.GENERATING:
            return ()
        if not self._engine.can_settle:
            return ()

        try:
            completed_identity, result = self._engine.settle()
        except EngineFailure as error:
            self._last_request_id = identity.request_id
            reason = (
                ProtocolReason.ENGINE_TIMEOUT
                if error.code is EngineFailureCode.TIMEOUT
                else ProtocolReason.ENGINE_FAILURE
            )
            self._active_identity = None
            self._engine.cleanup()
            self._state = ServiceState.FAILED
            return (self._error_record(reason, identity), self._state_record())

        if completed_identity != identity or self._active_identity != identity:
            self._engine.release_result()
            return ()
        if result.sample_rate_hz != SAMPLE_RATE_HZ or result.channel_count != CHANNEL_COUNT:
            self._engine.release_result()
            return self._fail_engine(identity, ProtocolReason.FORMAT_MISMATCH)

        frame = {
            "schemaVersion": SCHEMA_VERSION,
            "frameId": identity.request_id,
            "sessionId": identity.session_id,
            "generationId": identity.generation_id,
            "segmentId": identity.segment_id,
            "sequence": 0,
            "sampleRateHz": SAMPLE_RATE_HZ,
            "sampleCountSamples": len(result.payload) // 4,
            "channelCount": CHANNEL_COUNT,
            "endOfSegment": True,
        }
        metadata = self._base("audioMetadata")
        metadata.update(
            {
                "requestId": identity.request_id,
                "frame": frame,
                "sampleFormat": SAMPLE_FORMAT,
                "payloadBytes": len(result.payload),
            }
        )
        try:
            metadata_payload = encode_control_message(metadata)
            validate_audio_payload(result.payload, metadata)
        except ProtocolFailure:
            self._engine.release_result()
            return self._fail_engine(identity, ProtocolReason.FORMAT_MISMATCH)

        completed = self._base("completed")
        completed["workIdentity"] = _work_identity_dict(identity)
        self._active_identity = None
        self._last_request_id = identity.request_id
        self._state = ServiceState.READY
        audio = result.payload
        self._engine.release_result()
        return (
            Frame(FrameKind.CONTROL, metadata_payload),
            Frame(FrameKind.AUDIO, audio),
            _control(completed),
            self._state_record(),
        )

    def cleanup(self) -> None:
        """Release all active and retained state without publishing output."""

        self._active_identity = None
        self._engine.cleanup()
        if self._state is not ServiceState.FAILED:
            self._state = ServiceState.STOPPED


def _write_records(writer: BinaryIO, records: tuple[Frame, ...]) -> None:
    for record in records:
        write_frame(writer, record)
    writer.flush()


def _protocol_rejected(reason: ProtocolReason) -> Frame:
    return _control(
        {
            "schemaVersion": SCHEMA_VERSION,
            "protocolVersion": PROTOCOL_VERSION,
            "kind": "protocolRejected",
            "reason": reason.value,
        }
    )


def run_service(
    reader: BinaryIO,
    writer: BinaryIO,
    engine: TtsEngine | None = None,
) -> int:
    """Run the bounded fake service until shutdown, clean EOF, or rejection."""

    service = ModelFreeTtsService(engine)
    try:
        while True:
            frame = read_frame(reader)
            if frame is None:
                clean_exit = service.state is ServiceState.STOPPED
                service.cleanup()
                return 0 if clean_exit else 1
            if frame.kind is not FrameKind.CONTROL:
                raise ProtocolFailure(ProtocolReason.UNKNOWN_RECORD_KIND)
            message = decode_control_payload(frame.payload)
            _write_records(writer, service.handle_control(message))
            _write_records(writer, service.settle_active())
            if service.state is ServiceState.STOPPED:
                return 0
    except ProtocolFailure as error:
        with suppress(OSError, ProtocolFailure):
            _write_records(writer, (_protocol_rejected(error.reason),))
        service.cleanup()
        return 1
    except (OSError, EngineFailure):
        service.cleanup()
        return 1


def main() -> int:
    """Run the model-free protocol service over binary standard streams."""

    return run_service(sys.stdin.buffer, sys.stdout.buffer)


if __name__ == "__main__":
    raise SystemExit(main())
