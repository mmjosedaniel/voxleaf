use std::io::Cursor;

use super::*;
use crate::tts_service_protocol::{decode_control, read_frame};

fn command(value: Value) -> Vec<u8> {
    let mut bytes = Vec::new();
    let payload = encode_control(&value).expect("command should encode");
    write_frame(&mut bytes, FrameKind::Control, &payload).expect("frame should encode");
    bytes
}

#[test]
fn normal_child_emits_canonical_ordered_complete_unit() {
    let fixture: Value = serde_json::from_str(include_str!(
        "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
    ))
    .expect("fixture should parse");
    let service_id = "service:synthetic-1";
    let input = [
        command(json!({
            "schemaVersion": 1,
            "protocolVersion": 1,
            "kind": "handshake",
            "serviceInstanceId": service_id
        })),
        command(json!({
            "schemaVersion": 1,
            "protocolVersion": 1,
            "kind": "load",
            "serviceInstanceId": service_id
        })),
        command(json!({
            "schemaVersion": 1,
            "protocolVersion": 1,
            "kind": "warm",
            "serviceInstanceId": service_id
        })),
        command(fixture),
        command(json!({
            "schemaVersion": 1,
            "protocolVersion": 1,
            "kind": "shutdown",
            "serviceInstanceId": service_id
        })),
    ]
    .concat();
    let mut output = Vec::new();
    run_child_with(&mut Cursor::new(input), &mut output, Scenario::Normal)
        .expect("normal child should complete");

    let mut reader = Cursor::new(output);
    let mut kinds = Vec::new();
    while reader.position() < reader.get_ref().len() as u64 {
        let frame = read_frame(&mut reader).expect("frame should decode");
        kinds.push(if frame.kind == FrameKind::Audio {
            "audio".to_owned()
        } else {
            control_kind(&decode_control(&frame.payload).expect("control should decode"))
                .expect("kind should exist")
                .to_owned()
        });
    }
    assert!(
        kinds
            .windows(3)
            .any(|window| { window == ["audioMetadata", "audio", "completed"] })
    );
    assert_eq!(kinds.last().map(String::as_str), Some("state"));
}
