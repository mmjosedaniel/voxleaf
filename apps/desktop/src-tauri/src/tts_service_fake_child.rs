use std::{
    io::{Read, Write},
    process::{Command, Stdio},
    thread,
    time::Duration,
};

use serde_json::{Value, json};

use crate::tts_service_protocol::{
    FrameKind, TtsNativeFailure, control_kind, decode_control, encode_control, read_frame,
    write_frame,
};

pub const CHILD_ARGUMENT: &str = "--voxleaf-tts-model-free-service-child";
pub const DESCENDANT_ARGUMENT: &str = "--voxleaf-tts-model-free-descendant";
pub const NORMAL_SCENARIO: &str = "normal";
pub const PENDING_SCENARIO: &str = "pending";
pub const CRASH_SCENARIO: &str = "crash";
pub const DESCENDANT_SCENARIO: &str = "descendant";

const SYNTHETIC_SAMPLE_COUNT: usize = 4_800;
const SYNTHETIC_AUDIO_BYTES: usize = SYNTHETIC_SAMPLE_COUNT * size_of::<f32>();
const SYNTHETIC_GENERATION_DELAY: Duration = Duration::from_millis(75);

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum Scenario {
    Normal,
    Pending,
    Crash,
    Descendant,
}

impl Scenario {
    fn from_argument(argument: Option<&str>) -> Result<Self, TtsNativeFailure> {
        match argument.unwrap_or(NORMAL_SCENARIO) {
            NORMAL_SCENARIO => Ok(Self::Normal),
            PENDING_SCENARIO => Ok(Self::Pending),
            CRASH_SCENARIO => Ok(Self::Crash),
            DESCENDANT_SCENARIO => Ok(Self::Descendant),
            _ => Err(TtsNativeFailure::InvalidInput),
        }
    }
}

fn write_control(writer: &mut impl Write, value: &Value) -> Result<(), TtsNativeFailure> {
    let payload = encode_control(value)?;
    write_frame(writer, FrameKind::Control, &payload)
}

fn service_message(kind: &str, service_instance_id: &str) -> Value {
    json!({
        "schemaVersion": 1,
        "protocolVersion": 1,
        "kind": kind,
        "serviceInstanceId": service_instance_id,
    })
}

fn state_message(service_instance_id: &str, state: &str) -> Value {
    let mut value = service_message("state", service_instance_id);
    value
        .as_object_mut()
        .expect("fixed state message is an object")
        .insert("state".to_owned(), Value::String(state.to_owned()));
    value
}

fn capabilities_message(service_instance_id: &str) -> Value {
    json!({
        "schemaVersion": 1,
        "protocolVersion": 1,
        "kind": "capabilities",
        "serviceInstanceId": service_instance_id,
        "report": {
            "schemaVersion": 1,
            "capabilities": {
                "localSpeechGeneration": "unknown",
                "streamingGeneration": "unsupported",
                "generationCancellation": "unsupported",
                "hardwareAcceleration": "unknown",
                "cpuFallback": "unsupported"
            }
        },
        "cancellationContainment": "identity-invalidation-then-worker-termination"
    })
}

fn work_identity(message: &Value) -> Result<Value, TtsNativeFailure> {
    let segment = message
        .get("segment")
        .and_then(Value::as_object)
        .ok_or(TtsNativeFailure::ProtocolRejected)?;
    Ok(json!({
        "requestId": message
            .get("requestId")
            .and_then(Value::as_str)
            .ok_or(TtsNativeFailure::ProtocolRejected)?,
        "sessionId": segment
            .get("sessionId")
            .and_then(Value::as_str)
            .ok_or(TtsNativeFailure::ProtocolRejected)?,
        "generationId": segment
            .get("generationId")
            .and_then(Value::as_str)
            .ok_or(TtsNativeFailure::ProtocolRejected)?,
        "segmentId": segment
            .get("segmentId")
            .and_then(Value::as_str)
            .ok_or(TtsNativeFailure::ProtocolRejected)?,
    }))
}

fn synthetic_audio() -> Vec<u8> {
    const VALUES: [f32; 4] = [0.0, 0.25, -0.25, 0.5];
    let mut audio = Vec::with_capacity(SYNTHETIC_AUDIO_BYTES);
    for index in 0..SYNTHETIC_SAMPLE_COUNT {
        audio.extend_from_slice(&VALUES[index % VALUES.len()].to_le_bytes());
    }
    audio
}

fn write_generation(
    writer: &mut impl Write,
    service_instance_id: &str,
    identity: &Value,
) -> Result<(), TtsNativeFailure> {
    let request_id = identity
        .get("requestId")
        .and_then(Value::as_str)
        .ok_or(TtsNativeFailure::ProtocolRejected)?;
    let session_id = identity
        .get("sessionId")
        .and_then(Value::as_str)
        .ok_or(TtsNativeFailure::ProtocolRejected)?;
    let generation_id = identity
        .get("generationId")
        .and_then(Value::as_str)
        .ok_or(TtsNativeFailure::ProtocolRejected)?;
    let segment_id = identity
        .get("segmentId")
        .and_then(Value::as_str)
        .ok_or(TtsNativeFailure::ProtocolRejected)?;
    let audio = synthetic_audio();
    let metadata = json!({
        "schemaVersion": 1,
        "protocolVersion": 1,
        "kind": "audioMetadata",
        "serviceInstanceId": service_instance_id,
        "requestId": request_id,
        "frame": {
            "schemaVersion": 1,
            "frameId": request_id,
            "sessionId": session_id,
            "generationId": generation_id,
            "segmentId": segment_id,
            "sequence": 0,
            "sampleRateHz": 24_000,
            "sampleCountSamples": SYNTHETIC_SAMPLE_COUNT,
            "channelCount": 1,
            "endOfSegment": true
        },
        "sampleFormat": "float32-le",
        "payloadBytes": audio.len()
    });
    let completed = json!({
        "schemaVersion": 1,
        "protocolVersion": 1,
        "kind": "completed",
        "serviceInstanceId": service_instance_id,
        "workIdentity": identity,
    });

    write_control(writer, &metadata)?;
    write_frame(writer, FrameKind::Audio, &audio)?;
    write_control(writer, &completed)?;
    write_control(writer, &state_message(service_instance_id, "ready"))?;
    writer
        .flush()
        .map_err(|_| TtsNativeFailure::ChildUnavailable)
}

fn read_control(reader: &mut impl Read) -> Result<Value, TtsNativeFailure> {
    let frame = read_frame(reader)?;
    if frame.kind != FrameKind::Control {
        return Err(TtsNativeFailure::ProtocolRejected);
    }
    decode_control(&frame.payload)
}

fn settle_pending(
    reader: &mut impl Read,
    writer: &mut impl Write,
    service_instance_id: &str,
    identity: &Value,
) -> Result<(), TtsNativeFailure> {
    let message = read_control(reader)?;
    match control_kind(&message)? {
        "cancel" => {
            if message.get("workIdentity") != Some(identity) {
                return Err(TtsNativeFailure::ProtocolRejected);
            }
            write_control(writer, &state_message(service_instance_id, "cancelling"))?;
            write_control(
                writer,
                &json!({
                    "schemaVersion": 1,
                    "protocolVersion": 1,
                    "kind": "cancelled",
                    "serviceInstanceId": service_instance_id,
                    "workIdentity": identity,
                }),
            )?;
            write_control(writer, &state_message(service_instance_id, "stopped"))?;
            writer
                .flush()
                .map_err(|_| TtsNativeFailure::ChildUnavailable)
        }
        "shutdown" => {
            write_control(writer, &state_message(service_instance_id, "stopping"))?;
            write_control(writer, &state_message(service_instance_id, "stopped"))?;
            writer
                .flush()
                .map_err(|_| TtsNativeFailure::ChildUnavailable)
        }
        _ => Err(TtsNativeFailure::ProtocolRejected),
    }
}

fn run_child_with(
    reader: &mut impl Read,
    writer: &mut impl Write,
    scenario: Scenario,
) -> Result<(), TtsNativeFailure> {
    let handshake = read_control(reader)?;
    if control_kind(&handshake)? != "handshake" {
        return Err(TtsNativeFailure::ProtocolRejected);
    }
    let service_instance_id = handshake
        .get("serviceInstanceId")
        .and_then(Value::as_str)
        .ok_or(TtsNativeFailure::ProtocolRejected)?
        .to_owned();
    write_control(writer, &state_message(&service_instance_id, "handshaking"))?;
    write_control(
        writer,
        &service_message("handshakeAccepted", &service_instance_id),
    )?;
    write_control(writer, &state_message(&service_instance_id, "unloaded"))?;
    write_control(writer, &capabilities_message(&service_instance_id))?;
    writer
        .flush()
        .map_err(|_| TtsNativeFailure::ChildUnavailable)?;

    loop {
        let message = read_control(reader)?;
        match control_kind(&message)? {
            "load" => {
                write_control(writer, &state_message(&service_instance_id, "loading"))?;
                write_control(writer, &state_message(&service_instance_id, "warming"))?;
                writer
                    .flush()
                    .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
            }
            "warm" => {
                write_control(writer, &state_message(&service_instance_id, "ready"))?;
                write_control(writer, &capabilities_message(&service_instance_id))?;
                writer
                    .flush()
                    .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
            }
            "health" => {
                write_control(writer, &state_message(&service_instance_id, "ready"))?;
                write_control(writer, &capabilities_message(&service_instance_id))?;
                writer
                    .flush()
                    .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
            }
            "synthesize" => {
                let identity = work_identity(&message)?;
                write_control(writer, &state_message(&service_instance_id, "generating"))?;
                writer
                    .flush()
                    .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
                match scenario {
                    Scenario::Normal => {
                        thread::sleep(SYNTHETIC_GENERATION_DELAY);
                        write_generation(writer, &service_instance_id, &identity)?;
                    }
                    Scenario::Pending => {
                        return settle_pending(reader, writer, &service_instance_id, &identity);
                    }
                    Scenario::Crash => return Err(TtsNativeFailure::InternalFailure),
                    Scenario::Descendant => {
                        let executable = std::env::current_exe()
                            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
                        let _descendant = Command::new(executable)
                            .arg(DESCENDANT_ARGUMENT)
                            .stdin(Stdio::null())
                            .stdout(Stdio::null())
                            .stderr(Stdio::null())
                            .spawn()
                            .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
                        return settle_pending(reader, writer, &service_instance_id, &identity);
                    }
                }
            }
            "shutdown" => {
                write_control(writer, &state_message(&service_instance_id, "stopping"))?;
                write_control(writer, &state_message(&service_instance_id, "stopped"))?;
                writer
                    .flush()
                    .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
                return Ok(());
            }
            _ => return Err(TtsNativeFailure::ProtocolRejected),
        }
    }
}

pub fn run_child(scenario_argument: Option<&str>) -> Result<(), &'static str> {
    let scenario = Scenario::from_argument(scenario_argument).map_err(TtsNativeFailure::code)?;
    run_child_with(
        &mut std::io::stdin().lock(),
        &mut std::io::stdout().lock(),
        scenario,
    )
    .map_err(TtsNativeFailure::code)
}

pub fn run_descendant() -> Result<(), &'static str> {
    thread::sleep(Duration::from_secs(300));
    Ok(())
}

#[cfg(test)]
mod tests {
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
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
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
}
