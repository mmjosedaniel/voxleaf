use std::io::Cursor;

use super::frozen_authority::*;
use super::*;

#[cfg(test)]
fn dimensions_within_limit(
    code_points: usize,
    utf8_bytes: usize,
    maximum_code_points: usize,
    maximum_utf8_bytes: usize,
) -> bool {
    code_points > 0
        && code_points <= maximum_code_points
        && utf8_bytes > 0
        && utf8_bytes <= maximum_utf8_bytes
}

#[cfg(test)]
fn audio_dimensions_are_valid(
    sample_rate_hz: usize,
    channel_count: usize,
    sample_count: usize,
    payload_bytes: usize,
) -> bool {
    sample_rate_hz == PROBE_SAMPLE_RATE_HZ
        && channel_count == 1
        && sample_count > 0
        && sample_count <= MAX_AUDIO_SAMPLE_COUNT
        && payload_bytes == sample_count * size_of::<f32>()
        && payload_bytes <= MAX_AUDIO_PAYLOAD_BYTES
}

#[cfg(test)]
fn count_within_limit(value: usize, maximum: usize) -> bool {
    value <= maximum
}

#[cfg(test)]
fn within_timeout(elapsed_ms: u64, timeout_ms: u64) -> bool {
    elapsed_ms <= timeout_ms
}

fn frame_bytes(kind: FrameKind, payload: &[u8]) -> Vec<u8> {
    let mut bytes = Vec::new();
    write_frame(&mut bytes, kind, payload).expect("frame should encode");
    bytes
}

fn declared_frame(kind: FrameKind, declared_bytes: usize) -> Vec<u8> {
    let mut header = [0_u8; HEADER_BYTES];
    header[0..4].copy_from_slice(&MAGIC);
    header[4..6].copy_from_slice(&PROTOCOL_VERSION.to_be_bytes());
    header[6] = kind.code();
    header[8..12].copy_from_slice(&(declared_bytes as u32).to_be_bytes());
    header.to_vec()
}

#[test]
fn accepts_exact_control_and_audio_payload_limits() {
    for (kind, payload_bytes) in [
        (FrameKind::Control, MAX_CONTROL_PAYLOAD_BYTES),
        (FrameKind::Audio, MAX_AUDIO_PAYLOAD_BYTES),
    ] {
        let payload = vec![0_u8; payload_bytes];
        let bytes = frame_bytes(kind, &payload);
        let parsed = read_frame(&mut Cursor::new(bytes)).expect("exact frame should pass");
        assert_eq!(parsed.kind, kind);
        assert_eq!(parsed.payload.len(), payload_bytes);
    }
}

#[test]
fn rejects_maximum_plus_one_before_reading_a_payload() {
    for (kind, payload_bytes) in [
        (FrameKind::Control, MAX_CONTROL_PAYLOAD_BYTES + 1),
        (FrameKind::Audio, MAX_AUDIO_PAYLOAD_BYTES + 1),
    ] {
        let bytes = declared_frame(kind, payload_bytes);
        assert_eq!(
            read_frame(&mut Cursor::new(bytes)),
            Err(ProbeFailure::ResourceLimit)
        );
    }
}

#[test]
fn rejects_below_minimum_payload_lengths_before_allocation() {
    for (kind, payload_bytes) in [
        (FrameKind::Control, 0),
        (FrameKind::Audio, size_of::<f32>() - 1),
    ] {
        let bytes = declared_frame(kind, payload_bytes);
        assert_eq!(
            read_frame(&mut Cursor::new(bytes)),
            Err(ProbeFailure::ProtocolRejected)
        );
    }
}

#[test]
fn rejects_partial_unknown_or_mutated_headers() {
    let valid = frame_bytes(FrameKind::Control, PROBE_REQUEST);
    let mut wrong_magic = valid.clone();
    wrong_magic[0] = b"X"[0];
    let mut wrong_version = valid.clone();
    wrong_version[5] = 2;
    let mut wrong_kind = valid.clone();
    wrong_kind[6] = 9;
    let mut wrong_flags = valid.clone();
    wrong_flags[7] = 1;

    for bytes in [
        Vec::new(),
        valid[..HEADER_BYTES - 1].to_vec(),
        wrong_magic,
        wrong_version,
        wrong_kind,
        wrong_flags,
    ] {
        assert_eq!(
            read_frame(&mut Cursor::new(bytes)),
            Err(ProbeFailure::ProtocolRejected)
        );
    }
}

#[test]
fn rejects_truncated_payloads_without_partial_publication() {
    let bytes = frame_bytes(FrameKind::Audio, &probe_audio());
    assert_eq!(
        read_frame(&mut Cursor::new(&bytes[..bytes.len() - 1])),
        Err(ProbeFailure::ProtocolRejected)
    );
}

#[test]
fn accepts_only_the_active_complete_identity_and_finite_audio() {
    let valid_metadata = Frame {
        kind: FrameKind::Control,
        payload: probe_metadata(),
    };
    let valid_audio = Frame {
        kind: FrameKind::Audio,
        payload: probe_audio(),
    };
    assert_eq!(
        validate_child_frames(valid_metadata, valid_audio)
            .expect("valid response should pass")
            .len(),
        PROBE_AUDIO_BYTES
    );

    let mut stale_metadata = probe_metadata();
    let generation = b"probe-generation";
    let start = stale_metadata
        .windows(generation.len())
        .position(|window| window == generation)
        .expect("fixed generation should exist");
    stale_metadata[start] = b"X"[0];
    assert_eq!(
        validate_child_frames(
            Frame {
                kind: FrameKind::Control,
                payload: stale_metadata,
            },
            Frame {
                kind: FrameKind::Audio,
                payload: probe_audio(),
            },
        ),
        Err(ProbeFailure::ProtocolRejected)
    );

    let mut non_finite_audio = probe_audio();
    non_finite_audio[0..4].copy_from_slice(&f32::NAN.to_le_bytes());
    assert_eq!(
        validate_child_frames(
            Frame {
                kind: FrameKind::Control,
                payload: probe_metadata(),
            },
            Frame {
                kind: FrameKind::Audio,
                payload: non_finite_audio,
            },
        ),
        Err(ProbeFailure::ProtocolRejected)
    );
}

#[test]
fn exposes_only_fixed_content_free_failure_codes() {
    assert_eq!(
        [
            ProbeFailure::Busy,
            ProbeFailure::ChildUnavailable,
            ProbeFailure::InternalFailure,
            ProbeFailure::ProtocolRejected,
            ProbeFailure::ResourceLimit,
            ProbeFailure::TimedOut,
        ]
        .map(ProbeFailure::code),
        [
            "tts-probe-busy",
            "tts-probe-child-unavailable",
            "tts-probe-internal-failure",
            "tts-probe-protocol-rejected",
            "tts-probe-resource-limit",
            "tts-probe-timeout",
        ]
    );
}

#[test]
fn freezes_exact_and_maximum_plus_one_authority_dimensions() {
    assert!(dimensions_within_limit(
        MAX_IDENTIFIER_CODE_POINTS,
        MAX_IDENTIFIER_UTF8_BYTES,
        MAX_IDENTIFIER_CODE_POINTS,
        MAX_IDENTIFIER_UTF8_BYTES,
    ));
    assert!(!dimensions_within_limit(
        MAX_IDENTIFIER_CODE_POINTS + 1,
        MAX_IDENTIFIER_UTF8_BYTES,
        MAX_IDENTIFIER_CODE_POINTS,
        MAX_IDENTIFIER_UTF8_BYTES,
    ));
    assert!(!dimensions_within_limit(
        MAX_IDENTIFIER_CODE_POINTS,
        MAX_IDENTIFIER_UTF8_BYTES + 1,
        MAX_IDENTIFIER_CODE_POINTS,
        MAX_IDENTIFIER_UTF8_BYTES,
    ));

    assert!(dimensions_within_limit(
        MAX_NARRATION_CODE_POINTS,
        MAX_NARRATION_UTF8_BYTES,
        MAX_NARRATION_CODE_POINTS,
        MAX_NARRATION_UTF8_BYTES,
    ));
    assert!(!dimensions_within_limit(
        MAX_NARRATION_CODE_POINTS + 1,
        MAX_NARRATION_UTF8_BYTES,
        MAX_NARRATION_CODE_POINTS,
        MAX_NARRATION_UTF8_BYTES,
    ));
    assert!(!dimensions_within_limit(
        MAX_NARRATION_CODE_POINTS,
        MAX_NARRATION_UTF8_BYTES + 1,
        MAX_NARRATION_CODE_POINTS,
        MAX_NARRATION_UTF8_BYTES,
    ));

    assert!(audio_dimensions_are_valid(
        PROBE_SAMPLE_RATE_HZ,
        1,
        MAX_AUDIO_SAMPLE_COUNT,
        MAX_AUDIO_PAYLOAD_BYTES,
    ));
    assert!(!audio_dimensions_are_valid(
        PROBE_SAMPLE_RATE_HZ,
        1,
        MAX_AUDIO_SAMPLE_COUNT + 1,
        MAX_AUDIO_PAYLOAD_BYTES,
    ));
    assert!(!audio_dimensions_are_valid(
        PROBE_SAMPLE_RATE_HZ,
        1,
        MAX_AUDIO_SAMPLE_COUNT,
        MAX_AUDIO_PAYLOAD_BYTES + 1,
    ));
    assert!(!audio_dimensions_are_valid(
        PROBE_SAMPLE_RATE_HZ + 1,
        1,
        MAX_AUDIO_SAMPLE_COUNT,
        MAX_AUDIO_PAYLOAD_BYTES,
    ));
    assert!(!audio_dimensions_are_valid(
        PROBE_SAMPLE_RATE_HZ,
        2,
        MAX_AUDIO_SAMPLE_COUNT,
        MAX_AUDIO_PAYLOAD_BYTES,
    ));

    for maximum in [
        MAX_AUDIO_RECORDS,
        MAX_ACTIVE_REQUESTS,
        MAX_QUEUED_REQUESTS,
        MAX_PENDING_CONTROL_WRITES,
        MAX_PENDING_AUDIO_WRITES,
        MAX_NATIVE_RETAINED_AUDIO_UNITS,
        MAX_RENDERER_RETAINED_AUDIO_UNITS,
        MAX_AUTOMATIC_SYNTHESIS_RETRIES,
        MAX_AUTOMATIC_RESTARTS,
        MAX_RETAINED_STDERR_BYTES,
    ] {
        assert!(count_within_limit(maximum, maximum));
        assert!(!count_within_limit(maximum + 1, maximum));
    }

    for timeout in [
        HANDSHAKE_TIMEOUT_MS,
        LOAD_TIMEOUT_MS,
        WARM_TIMEOUT_MS,
        SYNTHESIS_TIMEOUT_MS,
        HEALTH_TIMEOUT_MS,
        INVALIDATION_TIMEOUT_MS,
        TERMINATION_TIMEOUT_MS,
        SHUTDOWN_TIMEOUT_MS,
        CLEANUP_TIMEOUT_MS,
    ] {
        assert!(within_timeout(timeout, timeout));
        assert!(!within_timeout(timeout + 1, timeout));
    }
}

#[test]
fn rejects_a_second_active_probe_without_queueing() {
    let first = ActiveProbeGuard::acquire().expect("first probe should acquire");
    assert!(matches!(
        ActiveProbeGuard::acquire(),
        Err(ProbeFailure::Busy)
    ));
    drop(first);
    assert!(ActiveProbeGuard::acquire().is_ok());
}
