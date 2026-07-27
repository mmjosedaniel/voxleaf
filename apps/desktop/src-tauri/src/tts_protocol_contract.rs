use std::collections::BTreeSet;

use serde_json::{Map, Value};

pub const PROTOCOL_VERSION: u64 = 1;
pub const SCHEMA_VERSION: u64 = 1;
pub const MAX_IDENTIFIER_CODE_POINTS: usize = 128;
pub const MAX_IDENTIFIER_UTF8_BYTES: usize = 512;
pub const MAX_NARRATION_CODE_POINTS: usize = 640;
pub const MAX_NARRATION_UTF8_BYTES: usize = 2_048;
pub const MAX_AUDIO_SAMPLES: u64 = 480_000;
pub const MAX_AUDIO_BYTES: u64 = 1_920_000;

#[cfg(test)]
const VALID_FIXTURES: [(&str, &str); 15] = [
    (
        "handshake",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-handshake.json"
        ),
    ),
    (
        "load",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-load.json"
        ),
    ),
    (
        "warm",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-warm.json"
        ),
    ),
    (
        "synthesize",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
        ),
    ),
    (
        "cancel",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-cancel.json"
        ),
    ),
    (
        "health",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-health.json"
        ),
    ),
    (
        "shutdown",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-shutdown.json"
        ),
    ),
    (
        "handshakeAccepted",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-handshake-accepted.json"
        ),
    ),
    (
        "state",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-state.json"
        ),
    ),
    (
        "capabilities",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-capabilities.json"
        ),
    ),
    (
        "audioMetadata",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-audio-metadata.json"
        ),
    ),
    (
        "completed",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-completed.json"
        ),
    ),
    (
        "cancelled",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-cancelled.json"
        ),
    ),
    (
        "error",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-error.json"
        ),
    ),
    (
        "protocolRejected",
        include_str!(
            "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-protocol-rejected.json"
        ),
    ),
];

#[cfg(test)]
const INVALID_FIXTURES: [&str; 3] = [
    include_str!(
        "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/invalid-unknown-field.json"
    ),
    include_str!(
        "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/invalid-unsupported-protocol.json"
    ),
    include_str!(
        "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/invalid-unknown-kind.json"
    ),
];

fn keys(names: &[&str]) -> BTreeSet<String> {
    names.iter().map(|name| (*name).to_owned()).collect()
}

fn exact_keys(object: &Map<String, Value>, names: &[&str]) -> bool {
    object.keys().cloned().collect::<BTreeSet<_>>() == keys(names)
}

pub fn valid_identifier(value: Option<&Value>) -> bool {
    value.and_then(Value::as_str).is_some_and(|identifier| {
        let code_points = identifier.chars().count();
        code_points > 0
            && code_points <= MAX_IDENTIFIER_CODE_POINTS
            && identifier.len() <= MAX_IDENTIFIER_UTF8_BYTES
            && identifier.trim() == identifier
            && !identifier.chars().any(char::is_control)
    })
}

fn valid_work_identity(value: Option<&Value>) -> bool {
    let Some(identity) = value.and_then(Value::as_object) else {
        return false;
    };
    exact_keys(
        identity,
        &["requestId", "sessionId", "generationId", "segmentId"],
    ) && ["requestId", "sessionId", "generationId", "segmentId"]
        .iter()
        .all(|name| valid_identifier(identity.get(*name)))
}

fn valid_index(value: Option<&Value>) -> bool {
    value
        .and_then(Value::as_u64)
        .is_some_and(|index| index <= 9_007_199_254_740_991)
}

fn valid_book_identity(value: Option<&Value>) -> bool {
    let Some(identity) = value.and_then(Value::as_object) else {
        return false;
    };
    let Some(scheme) = identity.get("scheme").and_then(Value::as_str) else {
        return false;
    };
    let Some(book_id) = identity.get("value").and_then(Value::as_str) else {
        return false;
    };
    exact_keys(identity, &["scheme", "schemeVersion", "value"])
        && identity.get("schemeVersion").and_then(Value::as_u64) == Some(SCHEMA_VERSION)
        && (1..=64).contains(&scheme.len())
        && scheme.bytes().enumerate().all(|(index, byte)| {
            byte.is_ascii_lowercase() || (index > 0 && (byte.is_ascii_digit() || byte == b'-'))
        })
        && valid_identifier(identity.get("value"))
        && book_id
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || b"._~-".contains(&byte))
}

fn valid_anchor(value: Option<&Value>) -> bool {
    let Some(anchor) = value.and_then(Value::as_object) else {
        return false;
    };
    let Some(anchor_value) = anchor.get("value").and_then(Value::as_str) else {
        return false;
    };
    exact_keys(anchor, &["kind", "formatVersion", "value", "anchorIndex"])
        && anchor.get("kind").and_then(Value::as_str) == Some("element-id")
        && anchor.get("formatVersion").and_then(Value::as_u64) == Some(SCHEMA_VERSION)
        && (1..=MAX_IDENTIFIER_CODE_POINTS).contains(&anchor_value.chars().count())
        && anchor_value.len() <= MAX_IDENTIFIER_UTF8_BYTES
        && anchor_value.bytes().enumerate().all(|(index, byte)| {
            byte.is_ascii_alphanumeric() || byte == b'_' || (index > 0 && b".:-".contains(&byte))
        })
        && valid_index(anchor.get("anchorIndex"))
}

fn valid_locator(value: Option<&Value>) -> bool {
    let Some(locator) = value.and_then(Value::as_object) else {
        return false;
    };
    let required = [
        "schemaVersion",
        "bookIdentity",
        "spineItemId",
        "spineItemIndex",
        "anchor",
        "textOffsetCodePoints",
    ];
    let with_progression = [
        "schemaVersion",
        "bookIdentity",
        "spineItemId",
        "spineItemIndex",
        "anchor",
        "textOffsetCodePoints",
        "progression",
    ];
    (exact_keys(locator, &required) || exact_keys(locator, &with_progression))
        && locator.get("schemaVersion").and_then(Value::as_u64) == Some(SCHEMA_VERSION)
        && valid_book_identity(locator.get("bookIdentity"))
        && valid_identifier(locator.get("spineItemId"))
        && valid_index(locator.get("spineItemIndex"))
        && valid_anchor(locator.get("anchor"))
        && valid_index(locator.get("textOffsetCodePoints"))
        && locator.get("progression").is_none_or(|progression| {
            progression
                .as_f64()
                .is_some_and(|value| value.is_finite() && (0.0..=1.0).contains(&value))
        })
}

fn locator_position(value: &Value) -> Option<(u64, u64, u64)> {
    let locator = value.as_object()?;
    Some((
        locator.get("spineItemIndex")?.as_u64()?,
        locator
            .get("anchor")?
            .as_object()?
            .get("anchorIndex")?
            .as_u64()?,
        locator.get("textOffsetCodePoints")?.as_u64()?,
    ))
}

fn valid_locator_range(value: Option<&Value>, book_identity: Option<&Value>) -> bool {
    let Some(range) = value.and_then(Value::as_object) else {
        return false;
    };
    let Some(start) = range.get("start") else {
        return false;
    };
    let Some(end) = range.get("end") else {
        return false;
    };
    exact_keys(range, &["schemaVersion", "start", "end"])
        && range.get("schemaVersion").and_then(Value::as_u64) == Some(SCHEMA_VERSION)
        && valid_locator(Some(start))
        && valid_locator(Some(end))
        && start.get("bookIdentity") == book_identity
        && end.get("bookIdentity") == book_identity
        && locator_position(start)
            .zip(locator_position(end))
            .is_some_and(|(start_position, end_position)| start_position <= end_position)
}

fn validate_synthesize(object: &Map<String, Value>) -> bool {
    let Some(segment) = object.get("segment").and_then(Value::as_object) else {
        return false;
    };
    let Some(text) = segment.get("text").and_then(Value::as_str) else {
        return false;
    };

    valid_identifier(object.get("requestId"))
        && exact_keys(
            segment,
            &[
                "schemaVersion",
                "segmentId",
                "bookIdentity",
                "sessionId",
                "generationId",
                "sequence",
                "sourceRange",
                "text",
            ],
        )
        && segment.get("schemaVersion").and_then(Value::as_u64) == Some(SCHEMA_VERSION)
        && valid_identifier(segment.get("sessionId"))
        && valid_identifier(segment.get("generationId"))
        && valid_identifier(segment.get("segmentId"))
        && valid_book_identity(segment.get("bookIdentity"))
        && valid_index(segment.get("sequence"))
        && valid_locator_range(segment.get("sourceRange"), segment.get("bookIdentity"))
        && !text.is_empty()
        && text.chars().count() <= MAX_NARRATION_CODE_POINTS
        && text.len() <= MAX_NARRATION_UTF8_BYTES
}

fn validate_audio_metadata(object: &Map<String, Value>) -> bool {
    let Some(frame) = object.get("frame").and_then(Value::as_object) else {
        return false;
    };
    let samples = frame.get("sampleCountSamples").and_then(Value::as_u64);
    let payload_bytes = object.get("payloadBytes").and_then(Value::as_u64);

    exact_keys(
        frame,
        &[
            "schemaVersion",
            "frameId",
            "sessionId",
            "generationId",
            "segmentId",
            "sequence",
            "sampleRateHz",
            "sampleCountSamples",
            "channelCount",
            "endOfSegment",
        ],
    ) && frame.get("schemaVersion").and_then(Value::as_u64) == Some(SCHEMA_VERSION)
        && valid_identifier(object.get("requestId"))
        && valid_identifier(frame.get("frameId"))
        && valid_identifier(frame.get("sessionId"))
        && valid_identifier(frame.get("generationId"))
        && valid_identifier(frame.get("segmentId"))
        && frame.get("sequence").and_then(Value::as_u64) == Some(0)
        && frame.get("sampleRateHz").and_then(Value::as_u64) == Some(24_000)
        && frame.get("channelCount").and_then(Value::as_u64) == Some(1)
        && frame.get("endOfSegment").and_then(Value::as_bool) == Some(true)
        && samples.is_some_and(|value| value > 0 && value <= MAX_AUDIO_SAMPLES)
        && payload_bytes.is_some_and(|value| (4..=MAX_AUDIO_BYTES).contains(&value))
        && payload_bytes == samples.map(|value| value * 4)
}

fn valid_capabilities(value: Option<&Value>) -> bool {
    let Some(report) = value.and_then(Value::as_object) else {
        return false;
    };
    let Some(capabilities) = report.get("capabilities").and_then(Value::as_object) else {
        return false;
    };
    exact_keys(report, &["schemaVersion", "capabilities"])
        && report.get("schemaVersion").and_then(Value::as_u64) == Some(SCHEMA_VERSION)
        && exact_keys(
            capabilities,
            &[
                "localSpeechGeneration",
                "streamingGeneration",
                "generationCancellation",
                "hardwareAcceleration",
                "cpuFallback",
            ],
        )
        && capabilities.values().all(|status| {
            status
                .as_str()
                .is_some_and(|value| matches!(value, "supported" | "unsupported" | "unknown"))
        })
}

fn valid_reason(value: Option<&Value>) -> bool {
    value.and_then(Value::as_str).is_some_and(|reason| {
        matches!(
            reason,
            "malformed-frame"
                | "unsupported-protocol-version"
                | "unknown-record-kind"
                | "invalid-flags"
                | "empty-payload"
                | "over-limit"
                | "invalid-utf8"
                | "malformed-json"
                | "unknown-message-kind"
                | "unsupported-schema-version"
                | "invalid-message"
                | "invalid-state"
                | "identity-mismatch"
                | "duplicate-identity"
                | "sequence-gap"
                | "format-mismatch"
                | "busy"
                | "engine-failure"
                | "engine-timeout"
                | "operation-cancelled"
                | "resource-exhausted"
        )
    })
}

fn expected_error(reason: &str) -> (&'static str, &'static str, &'static str) {
    match reason {
        "unsupported-protocol-version" | "unsupported-schema-version" => {
            ("unsupported-input", "input", "recoverable")
        }
        "operation-cancelled" => ("operation-cancelled", "cancellation", "recoverable"),
        "busy" | "resource-exhausted" => ("resource-exhausted", "resource", "recoverable"),
        "engine-failure" | "engine-timeout" | "format-mismatch" | "sequence-gap" => {
            ("internal-failure", "internal", "fatal")
        }
        _ => ("invalid-input", "input", "recoverable"),
    }
}

fn valid_error(object: &Map<String, Value>) -> bool {
    let Some(reason) = object.get("reason").and_then(Value::as_str) else {
        return false;
    };
    let Some(error) = object.get("error").and_then(Value::as_object) else {
        return false;
    };
    let expected = expected_error(reason);
    valid_reason(object.get("reason"))
        && exact_keys(error, &["schemaVersion", "code", "category", "severity"])
        && error.get("schemaVersion").and_then(Value::as_u64) == Some(SCHEMA_VERSION)
        && error.get("code").and_then(Value::as_str) == Some(expected.0)
        && error.get("category").and_then(Value::as_str) == Some(expected.1)
        && error.get("severity").and_then(Value::as_str) == Some(expected.2)
}

pub fn validate_control_value(value: &Value) -> bool {
    let Some(object) = value.as_object() else {
        return false;
    };
    if object.get("schemaVersion").and_then(Value::as_u64) != Some(SCHEMA_VERSION)
        || object.get("protocolVersion").and_then(Value::as_u64) != Some(PROTOCOL_VERSION)
    {
        return false;
    }

    let Some(kind) = object.get("kind").and_then(Value::as_str) else {
        return false;
    };
    let service_keys = [
        "schemaVersion",
        "protocolVersion",
        "kind",
        "serviceInstanceId",
    ];
    let service_identity_valid = || valid_identifier(object.get("serviceInstanceId"));

    match kind {
        "handshake" | "load" | "warm" | "health" | "shutdown" | "handshakeAccepted" => {
            exact_keys(object, &service_keys) && service_identity_valid()
        }
        "synthesize" => {
            exact_keys(
                object,
                &[
                    "schemaVersion",
                    "protocolVersion",
                    "kind",
                    "serviceInstanceId",
                    "requestId",
                    "segment",
                ],
            ) && service_identity_valid()
                && validate_synthesize(object)
        }
        "cancel" | "completed" | "cancelled" => {
            exact_keys(
                object,
                &[
                    "schemaVersion",
                    "protocolVersion",
                    "kind",
                    "serviceInstanceId",
                    "workIdentity",
                ],
            ) && service_identity_valid()
                && valid_work_identity(object.get("workIdentity"))
        }
        "state" => {
            exact_keys(
                object,
                &[
                    "schemaVersion",
                    "protocolVersion",
                    "kind",
                    "serviceInstanceId",
                    "state",
                ],
            ) && service_identity_valid()
                && object
                    .get("state")
                    .and_then(Value::as_str)
                    .is_some_and(|state| {
                        matches!(
                            state,
                            "starting"
                                | "handshaking"
                                | "unloaded"
                                | "loading"
                                | "warming"
                                | "ready"
                                | "generating"
                                | "cancelling"
                                | "stopping"
                                | "stopped"
                                | "failed"
                        )
                    })
        }
        "capabilities" => {
            exact_keys(
                object,
                &[
                    "schemaVersion",
                    "protocolVersion",
                    "kind",
                    "serviceInstanceId",
                    "report",
                    "cancellationContainment",
                ],
            ) && service_identity_valid()
                && valid_capabilities(object.get("report"))
                && object
                    .get("cancellationContainment")
                    .and_then(Value::as_str)
                    == Some("identity-invalidation-then-worker-termination")
        }
        "audioMetadata" => {
            exact_keys(
                object,
                &[
                    "schemaVersion",
                    "protocolVersion",
                    "kind",
                    "serviceInstanceId",
                    "requestId",
                    "frame",
                    "sampleFormat",
                    "payloadBytes",
                ],
            ) && service_identity_valid()
                && object.get("sampleFormat").and_then(Value::as_str) == Some("float32-le")
                && validate_audio_metadata(object)
        }
        "error" => {
            let required = [
                "schemaVersion",
                "protocolVersion",
                "kind",
                "serviceInstanceId",
                "reason",
                "error",
            ];
            let with_identity = [
                "schemaVersion",
                "protocolVersion",
                "kind",
                "serviceInstanceId",
                "reason",
                "error",
                "workIdentity",
            ];
            (exact_keys(object, &required) || exact_keys(object, &with_identity))
                && service_identity_valid()
                && valid_error(object)
                && object
                    .get("workIdentity")
                    .is_none_or(|value| valid_work_identity(Some(value)))
        }
        "protocolRejected" => {
            exact_keys(
                object,
                &["schemaVersion", "protocolVersion", "kind", "reason"],
            ) && valid_reason(object.get("reason"))
        }
        _ => false,
    }
}

#[cfg(test)]
fn validate_control_fixture(source: &str) -> bool {
    serde_json::from_str::<Value>(source).is_ok_and(|value| validate_control_value(&value))
}

#[test]
fn rust_fixture_surface_matches_every_closed_control_kind() {
    for (expected_kind, fixture) in VALID_FIXTURES {
        assert!(
            validate_control_fixture(fixture),
            "fixture for {expected_kind} must match the Rust boundary constants"
        );
        let value: Value = serde_json::from_str(fixture).expect("valid fixture JSON");
        assert_eq!(
            value.get("kind").and_then(Value::as_str),
            Some(expected_kind)
        );
    }
}

#[test]
fn rust_fixture_surface_rejects_shared_invalid_controls() {
    for fixture in INVALID_FIXTURES {
        assert!(!validate_control_fixture(fixture));
    }
}

#[test]
fn rust_fixture_surface_keeps_frozen_maximum_arithmetic() {
    let exact_text = "😀".repeat(512);
    assert_eq!(exact_text.chars().count(), 512);
    assert_eq!(exact_text.len(), MAX_NARRATION_UTF8_BYTES);
    assert_eq!(MAX_AUDIO_SAMPLES * 4, MAX_AUDIO_BYTES);
}

#[test]
fn rust_boundary_rejects_nested_narration_and_audio_drift() {
    let synthesize_source = VALID_FIXTURES
        .iter()
        .find_map(|(kind, fixture)| (*kind == "synthesize").then_some(*fixture))
        .expect("synthesize fixture");
    let mut synthesize: Value =
        serde_json::from_str(synthesize_source).expect("valid synthesize fixture");
    synthesize["segment"]
        .as_object_mut()
        .expect("segment object")
        .insert(
            "privateDebugText".to_owned(),
            Value::String("must-not-cross".to_owned()),
        );
    assert!(!validate_control_value(&synthesize));

    synthesize = serde_json::from_str(synthesize_source).expect("valid synthesize fixture");
    synthesize["segment"]["sourceRange"]["end"]["bookIdentity"]["value"] =
        Value::String("different-book".to_owned());
    assert!(!validate_control_value(&synthesize));

    let audio_source = VALID_FIXTURES
        .iter()
        .find_map(|(kind, fixture)| (*kind == "audioMetadata").then_some(*fixture))
        .expect("audio metadata fixture");
    let mut audio: Value =
        serde_json::from_str(audio_source).expect("valid audio metadata fixture");
    audio["frame"]
        .as_object_mut()
        .expect("frame object")
        .insert("unknown".to_owned(), Value::Bool(true));
    assert!(!validate_control_value(&audio));
}
