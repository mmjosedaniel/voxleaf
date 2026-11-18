use std::{
    collections::BTreeMap,
    fmt,
    io::{Read, Write},
};

use serde::{
    Deserialize, Deserializer,
    de::{MapAccess, SeqAccess, Visitor},
};
use serde_json::{Map, Number, Value};

use crate::tts_protocol_contract::{MAX_AUDIO_BYTES, MAX_AUDIO_SAMPLES, validate_control_value};

pub const MAGIC: [u8; 4] = *b"VLTP";
pub const PROTOCOL_VERSION: u16 = 1;
pub const HEADER_BYTES: usize = 12;
pub const MAX_CONTROL_PAYLOAD_BYTES: usize = 16_384;
pub const MAX_AUDIO_PAYLOAD_BYTES: usize = MAX_AUDIO_BYTES as usize;
pub const BYTES_PER_SAMPLE: usize = size_of::<f32>();

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u16)]
pub(crate) enum TtsChildProtocol {
    V1 = PROTOCOL_VERSION,
    V2 = 2,
}

#[derive(Debug, Eq, PartialEq)]
pub(crate) enum ChildControl {
    Standard(Value),
    TorchCudaUnavailable { service_instance_id: String },
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum FrameKind {
    Control,
    Audio,
}

impl FrameKind {
    fn code(self) -> u8 {
        match self {
            Self::Control => 1,
            Self::Audio => 2,
        }
    }

    fn from_code(value: u8) -> Result<Self, TtsNativeFailure> {
        match value {
            1 => Ok(Self::Control),
            2 => Ok(Self::Audio),
            _ => Err(TtsNativeFailure::ProtocolRejected),
        }
    }

    fn bounds(self) -> (usize, usize) {
        match self {
            Self::Control => (1, MAX_CONTROL_PAYLOAD_BYTES),
            Self::Audio => (BYTES_PER_SAMPLE, MAX_AUDIO_PAYLOAD_BYTES),
        }
    }
}

#[derive(Debug, Eq, PartialEq)]
pub struct Frame {
    pub kind: FrameKind,
    pub payload: Vec<u8>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum TtsNativeFailure {
    Busy,
    Cancelled,
    ChildUnavailable,
    InternalFailure,
    InvalidInput,
    InvalidState,
    ProtocolRejected,
    ResourceLimit,
    TimedOut,
    TorchCudaUnavailable,
}

impl TtsNativeFailure {
    pub const fn code(self) -> &'static str {
        match self {
            Self::Busy => "tts-service-busy",
            Self::Cancelled => "tts-service-cancelled",
            Self::ChildUnavailable => "tts-service-unavailable",
            Self::InternalFailure => "tts-service-internal-failure",
            Self::InvalidInput => "tts-service-invalid-input",
            Self::InvalidState => "tts-service-invalid-state",
            Self::ProtocolRejected => "tts-service-protocol-rejected",
            Self::ResourceLimit => "tts-service-resource-limit",
            Self::TimedOut => "tts-service-timeout",
            Self::TorchCudaUnavailable => "tts-service-torch-cuda-unavailable",
        }
    }
}

pub fn write_frame(
    writer: &mut impl Write,
    kind: FrameKind,
    payload: &[u8],
) -> Result<(), TtsNativeFailure> {
    write_child_frame(writer, kind, payload, TtsChildProtocol::V1)
}

pub(crate) fn write_child_frame(
    writer: &mut impl Write,
    kind: FrameKind,
    payload: &[u8],
    protocol: TtsChildProtocol,
) -> Result<(), TtsNativeFailure> {
    let (minimum, maximum) = kind.bounds();
    if payload.len() < minimum {
        return Err(TtsNativeFailure::ProtocolRejected);
    }
    if payload.len() > maximum || payload.len() > u32::MAX as usize {
        return Err(TtsNativeFailure::ResourceLimit);
    }

    let mut header = [0_u8; HEADER_BYTES];
    header[0..4].copy_from_slice(&MAGIC);
    header[4..6].copy_from_slice(&(protocol as u16).to_be_bytes());
    header[6] = kind.code();
    header[7] = 0;
    header[8..12].copy_from_slice(&(payload.len() as u32).to_be_bytes());
    writer
        .write_all(&header)
        .and_then(|_| writer.write_all(payload))
        .map_err(|_| TtsNativeFailure::ChildUnavailable)
}

pub fn read_frame(reader: &mut impl Read) -> Result<Frame, TtsNativeFailure> {
    read_child_frame(reader, TtsChildProtocol::V1)
}

pub(crate) fn read_child_frame(
    reader: &mut impl Read,
    protocol: TtsChildProtocol,
) -> Result<Frame, TtsNativeFailure> {
    let mut header = [0_u8; HEADER_BYTES];
    reader
        .read_exact(&mut header)
        .map_err(|_| TtsNativeFailure::ChildUnavailable)?;
    if header[0..4] != MAGIC
        || u16::from_be_bytes([header[4], header[5]]) != protocol as u16
        || header[7] != 0
    {
        return Err(TtsNativeFailure::ProtocolRejected);
    }

    let kind = FrameKind::from_code(header[6])?;
    let payload_bytes = u32::from_be_bytes([header[8], header[9], header[10], header[11]]) as usize;
    let (minimum, maximum) = kind.bounds();
    if payload_bytes < minimum {
        return Err(TtsNativeFailure::ProtocolRejected);
    }
    if payload_bytes > maximum {
        return Err(TtsNativeFailure::ResourceLimit);
    }

    let mut payload = vec![0_u8; payload_bytes];
    reader
        .read_exact(&mut payload)
        .map_err(|_| TtsNativeFailure::ProtocolRejected)?;
    Ok(Frame { kind, payload })
}

struct StrictJson(Value);

impl<'de> Deserialize<'de> for StrictJson {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_any(StrictJsonVisitor)
    }
}

struct StrictJsonVisitor;

impl<'de> Visitor<'de> for StrictJsonVisitor {
    type Value = StrictJson;

    fn expecting(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter.write_str("a strict JSON value")
    }

    fn visit_bool<E>(self, value: bool) -> Result<Self::Value, E> {
        Ok(StrictJson(Value::Bool(value)))
    }

    fn visit_i64<E>(self, value: i64) -> Result<Self::Value, E> {
        Ok(StrictJson(Value::Number(Number::from(value))))
    }

    fn visit_u64<E>(self, value: u64) -> Result<Self::Value, E> {
        Ok(StrictJson(Value::Number(Number::from(value))))
    }

    fn visit_f64<E>(self, value: f64) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Number::from_f64(value)
            .map(Value::Number)
            .map(StrictJson)
            .ok_or_else(|| E::custom("non-finite JSON number"))
    }

    fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
    where
        E: serde::de::Error,
    {
        Ok(StrictJson(Value::String(value.to_owned())))
    }

    fn visit_string<E>(self, value: String) -> Result<Self::Value, E> {
        Ok(StrictJson(Value::String(value)))
    }

    fn visit_none<E>(self) -> Result<Self::Value, E> {
        Ok(StrictJson(Value::Null))
    }

    fn visit_unit<E>(self) -> Result<Self::Value, E> {
        Ok(StrictJson(Value::Null))
    }

    fn visit_seq<A>(self, mut sequence: A) -> Result<Self::Value, A::Error>
    where
        A: SeqAccess<'de>,
    {
        let mut values = Vec::new();
        while let Some(value) = sequence.next_element::<StrictJson>()? {
            values.push(value.0);
        }
        Ok(StrictJson(Value::Array(values)))
    }

    fn visit_map<A>(self, mut entries: A) -> Result<Self::Value, A::Error>
    where
        A: MapAccess<'de>,
    {
        let mut values = BTreeMap::new();
        while let Some((key, value)) = entries.next_entry::<String, StrictJson>()? {
            if values.insert(key, value.0).is_some() {
                return Err(serde::de::Error::custom("duplicate JSON key"));
            }
        }
        Ok(StrictJson(Value::Object(
            values.into_iter().collect::<Map<String, Value>>(),
        )))
    }
}

fn decode_strict_json(payload: &[u8]) -> Result<Value, TtsNativeFailure> {
    if payload.is_empty() || payload.len() > MAX_CONTROL_PAYLOAD_BYTES {
        return Err(TtsNativeFailure::ProtocolRejected);
    }
    let mut deserializer = serde_json::Deserializer::from_slice(payload);
    let value = StrictJson::deserialize(&mut deserializer)
        .map_err(|_| TtsNativeFailure::ProtocolRejected)?
        .0;
    deserializer
        .end()
        .map_err(|_| TtsNativeFailure::ProtocolRejected)?;
    Ok(value)
}

pub fn decode_control(payload: &[u8]) -> Result<Value, TtsNativeFailure> {
    let value = decode_strict_json(payload)?;
    validate_control_value(&value)
        .then_some(value)
        .ok_or(TtsNativeFailure::ProtocolRejected)
}

pub(crate) fn decode_child_control(
    payload: &[u8],
    protocol: TtsChildProtocol,
) -> Result<ChildControl, TtsNativeFailure> {
    if protocol == TtsChildProtocol::V1 {
        return decode_control(payload).map(ChildControl::Standard);
    }
    let mut value = decode_strict_json(payload)?;
    if value.get("protocolVersion").and_then(Value::as_u64) != Some(protocol as u64) {
        return Err(TtsNativeFailure::ProtocolRejected);
    }
    // The renderer IPC still carries v1 records. Normalize only the negotiated
    // wire version, then reuse its closed shape validation.
    value["protocolVersion"] = Value::from(PROTOCOL_VERSION);
    if value.get("reason").and_then(Value::as_str) == Some("torch-cuda-unavailable") {
        if value.get("kind").and_then(Value::as_str) != Some("error")
            || value.get("workIdentity").is_some()
        {
            return Err(TtsNativeFailure::ProtocolRejected);
        }
        value["reason"] = Value::from("engine-failure");
        let valid = validate_control_value(&value);
        let service_instance_id = value
            .get("serviceInstanceId")
            .and_then(Value::as_str)
            .filter(|_| valid)
            .ok_or(TtsNativeFailure::ProtocolRejected)?
            .to_owned();
        return Ok(ChildControl::TorchCudaUnavailable {
            service_instance_id,
        });
    }
    validate_control_value(&value)
        .then_some(ChildControl::Standard(value))
        .ok_or(TtsNativeFailure::ProtocolRejected)
}

pub(crate) fn encode_child_control(
    value: &Value,
    protocol: TtsChildProtocol,
) -> Result<Vec<u8>, TtsNativeFailure> {
    if !validate_control_value(value) {
        return Err(TtsNativeFailure::InvalidInput);
    }
    let payload = match protocol {
        TtsChildProtocol::V1 => serde_json::to_vec(value),
        TtsChildProtocol::V2 => {
            let mut wire = value.clone();
            wire["protocolVersion"] = Value::from(protocol as u16);
            serde_json::to_vec(&wire)
        }
    }
    .map_err(|_| TtsNativeFailure::InvalidInput)?;
    if payload.is_empty() || payload.len() > MAX_CONTROL_PAYLOAD_BYTES {
        return Err(TtsNativeFailure::ResourceLimit);
    }
    Ok(payload)
}

pub fn encode_control(value: &Value) -> Result<Vec<u8>, TtsNativeFailure> {
    encode_child_control(value, TtsChildProtocol::V1)
}

pub fn control_kind(value: &Value) -> Result<&str, TtsNativeFailure> {
    value
        .get("kind")
        .and_then(Value::as_str)
        .ok_or(TtsNativeFailure::ProtocolRejected)
}

pub fn validate_audio(payload: &[u8], metadata: &Value) -> Result<(), TtsNativeFailure> {
    let frame = metadata
        .get("frame")
        .and_then(Value::as_object)
        .ok_or(TtsNativeFailure::ProtocolRejected)?;
    let sample_count = frame
        .get("sampleCountSamples")
        .and_then(Value::as_u64)
        .ok_or(TtsNativeFailure::ProtocolRejected)?;
    let payload_bytes = metadata
        .get("payloadBytes")
        .and_then(Value::as_u64)
        .ok_or(TtsNativeFailure::ProtocolRejected)?;
    if sample_count == 0
        || sample_count > MAX_AUDIO_SAMPLES
        || payload_bytes != sample_count * BYTES_PER_SAMPLE as u64
        || payload.len() as u64 != payload_bytes
        || payload.len() > MAX_AUDIO_PAYLOAD_BYTES
        || !payload.len().is_multiple_of(BYTES_PER_SAMPLE)
    {
        return Err(TtsNativeFailure::ProtocolRejected);
    }
    for sample in payload.chunks_exact(BYTES_PER_SAMPLE) {
        let value = f32::from_le_bytes(
            sample
                .try_into()
                .map_err(|_| TtsNativeFailure::ProtocolRejected)?,
        );
        if !value.is_finite() {
            return Err(TtsNativeFailure::ProtocolRejected);
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests;
