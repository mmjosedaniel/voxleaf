use std::io::Cursor;

use super::*;

fn framed(kind: FrameKind, payload: &[u8]) -> Vec<u8> {
    let mut bytes = Vec::new();
    write_frame(&mut bytes, kind, payload).expect("frame should encode");
    bytes
}

#[test]
fn rejects_declared_over_limit_before_reading_payload() {
    let mut bytes = Vec::from(MAGIC);
    bytes.extend_from_slice(&PROTOCOL_VERSION.to_be_bytes());
    bytes.push(2);
    bytes.push(0);
    bytes.extend_from_slice(&((MAX_AUDIO_PAYLOAD_BYTES + 1) as u32).to_be_bytes());
    assert_eq!(
        read_frame(&mut Cursor::new(bytes)),
        Err(TtsNativeFailure::ResourceLimit)
    );
}

#[test]
fn strict_control_decoder_rejects_duplicate_keys() {
    let payload = br#"{"schemaVersion":1,"schemaVersion":1,"protocolVersion":1,"kind":"health","serviceInstanceId":"service:test"}"#;
    assert_eq!(
        decode_control(payload),
        Err(TtsNativeFailure::ProtocolRejected)
    );
}

#[test]
fn validates_exact_audio_and_rejects_non_finite_values() {
    let metadata: Value = serde_json::from_str(include_str!(
        "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-audio-metadata.json"
    ))
    .expect("metadata fixture should parse");
    let mut audio = vec![0_u8; 19_200];
    assert!(validate_audio(&audio, &metadata).is_ok());
    audio[0..4].copy_from_slice(&f32::NAN.to_le_bytes());
    assert_eq!(
        validate_audio(&audio, &metadata),
        Err(TtsNativeFailure::ProtocolRejected)
    );
}

#[test]
fn frame_round_trip_keeps_kind_and_payload() {
    let payload = br#"{"kind":"synthetic"}"#;
    let parsed = read_frame(&mut Cursor::new(framed(FrameKind::Control, payload))).unwrap();
    assert_eq!(parsed.kind, FrameKind::Control);
    assert_eq!(parsed.payload, payload);
}
