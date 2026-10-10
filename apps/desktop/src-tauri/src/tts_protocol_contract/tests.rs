use super::*;

#[cfg(test)]
const VALID_FIXTURES: [(&str, &str); 15] = [
    (
        "handshake",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-handshake.json"
        ),
    ),
    (
        "load",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-load.json"
        ),
    ),
    (
        "warm",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-warm.json"
        ),
    ),
    (
        "synthesize",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
        ),
    ),
    (
        "cancel",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-cancel.json"
        ),
    ),
    (
        "health",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-health.json"
        ),
    ),
    (
        "shutdown",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-shutdown.json"
        ),
    ),
    (
        "handshakeAccepted",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-handshake-accepted.json"
        ),
    ),
    (
        "state",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-state.json"
        ),
    ),
    (
        "capabilities",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-capabilities.json"
        ),
    ),
    (
        "audioMetadata",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-audio-metadata.json"
        ),
    ),
    (
        "completed",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-completed.json"
        ),
    ),
    (
        "cancelled",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-cancelled.json"
        ),
    ),
    (
        "error",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-error.json"
        ),
    ),
    (
        "protocolRejected",
        include_str!(
            "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-protocol-rejected.json"
        ),
    ),
];

#[cfg(test)]
const INVALID_FIXTURES: [&str; 3] = [
    include_str!(
        "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/invalid-unknown-field.json"
    ),
    include_str!(
        "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/invalid-unsupported-protocol.json"
    ),
    include_str!(
        "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/invalid-unknown-kind.json"
    ),
];

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
