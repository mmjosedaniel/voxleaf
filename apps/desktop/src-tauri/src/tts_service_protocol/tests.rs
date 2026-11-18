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

#[test]
fn vf0114_negotiated_version_is_strict_at_both_wire_boundaries() {
    let healthy_v1 = serde_json::json!({
        "schemaVersion": 1, "protocolVersion": 1, "kind": "state",
        "serviceInstanceId": "service:test", "state": "loading",
    });
    let healthy_v2 = encode_child_control(&healthy_v1, TtsChildProtocol::V2).unwrap();
    assert!(decode_control(&healthy_v2).is_err());
    assert_eq!(
        decode_child_control(&healthy_v2, TtsChildProtocol::V2),
        Ok(ChildControl::Standard(healthy_v1.clone())),
    );
    let healthy_v1 = encode_control(&healthy_v1).unwrap();
    assert!(decode_child_control(&healthy_v1, TtsChildProtocol::V2).is_err());
    let mut framed_v2 = Vec::new();
    write_child_frame(
        &mut framed_v2,
        FrameKind::Control,
        &healthy_v2,
        TtsChildProtocol::V2,
    )
    .unwrap();
    assert!(read_frame(&mut Cursor::new(&framed_v2)).is_err());
    assert_eq!(
        read_child_frame(&mut Cursor::new(&framed_v2), TtsChildProtocol::V2)
            .unwrap()
            .payload,
        healthy_v2,
    );

    let extension = serde_json::json!({
        "schemaVersion": 1, "protocolVersion": 2, "kind": "error",
        "serviceInstanceId": "service:test", "reason": "torch-cuda-unavailable",
        "error": {"schemaVersion": 1, "code": "internal-failure", "category": "internal", "severity": "fatal"},
    });
    assert_eq!(
        decode_child_control(
            &serde_json::to_vec(&extension).unwrap(),
            TtsChildProtocol::V2
        ),
        Ok(ChildControl::TorchCudaUnavailable {
            service_instance_id: "service:test".to_owned()
        }),
    );
    let mut v1_extension = extension.clone();
    v1_extension["protocolVersion"] = serde_json::json!(1);
    assert!(decode_control(&serde_json::to_vec(&v1_extension).unwrap()).is_err());
    for (key, invalid) in [
        ("schemaVersion", serde_json::json!(2)),
        ("kind", serde_json::json!("protocolRejected")),
        ("workIdentity", Value::Null),
        (
            "error",
            serde_json::json!({"schemaVersion": 1, "code": "internal-failure", "category": "internal", "severity": "recoverable"}),
        ),
    ] {
        let mut invalid_extension = extension.clone();
        invalid_extension[key] = invalid;
        assert!(
            decode_child_control(
                &serde_json::to_vec(&invalid_extension).unwrap(),
                TtsChildProtocol::V2
            )
            .is_err(),
            "{key}",
        );
    }
}
