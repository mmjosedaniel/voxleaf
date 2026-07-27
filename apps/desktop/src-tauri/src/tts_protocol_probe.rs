use std::{
    ffi::OsStr,
    io::{Read, Write},
    process::{Command, Stdio},
    sync::Mutex,
    thread,
    time::{Duration, Instant},
};

use tauri::ipc::Response;

pub const CHILD_ARGUMENT: &str = "--voxleaf-tts-protocol-probe-child";
pub const HOST_ARGUMENT: &str = "--voxleaf-tts-protocol-probe-host";

const MAGIC: [u8; 4] = *b"VLTP";
const PROTOCOL_VERSION: u16 = 1;
const HEADER_BYTES: usize = 12;
const CONTROL_KIND: u8 = 1;
const AUDIO_KIND: u8 = 2;
const MAX_CONTROL_PAYLOAD_BYTES: usize = 16_384;
const MAX_AUDIO_PAYLOAD_BYTES: usize = 1_920_000;
const PROBE_SAMPLE_RATE_HZ: usize = 24_000;
const PROBE_SAMPLE_COUNT: usize = 4_800;
const PROBE_AUDIO_BYTES: usize = PROBE_SAMPLE_COUNT * size_of::<f32>();
const PROBE_TIMEOUT: Duration = Duration::from_secs(5);
const POLL_INTERVAL: Duration = Duration::from_millis(5);
const PROBE_REQUEST: &[u8] = br#"{"kind":"probe","protocolVersion":1}"#;
static PROBE_ACTIVE: Mutex<bool> = Mutex::new(false);

#[cfg(test)]
mod frozen_authority {
    pub const MAX_IDENTIFIER_CODE_POINTS: usize = 128;
    pub const MAX_IDENTIFIER_UTF8_BYTES: usize = 512;
    pub const MAX_NARRATION_CODE_POINTS: usize = 640;
    pub const MAX_NARRATION_UTF8_BYTES: usize = 2_048;
    pub const MAX_AUDIO_RECORDS: usize = 1;
    pub const MAX_AUDIO_SAMPLE_COUNT: usize = 480_000;
    pub const MAX_ACTIVE_REQUESTS: usize = 1;
    pub const MAX_QUEUED_REQUESTS: usize = 0;
    pub const MAX_PENDING_CONTROL_WRITES: usize = 1;
    pub const MAX_PENDING_AUDIO_WRITES: usize = 1;
    pub const MAX_NATIVE_RETAINED_AUDIO_UNITS: usize = 1;
    pub const MAX_RENDERER_RETAINED_AUDIO_UNITS: usize = 1;
    pub const MAX_AUTOMATIC_SYNTHESIS_RETRIES: usize = 0;
    pub const MAX_AUTOMATIC_RESTARTS: usize = 0;
    pub const MAX_RETAINED_STDERR_BYTES: usize = 0;
    pub const HANDSHAKE_TIMEOUT_MS: u64 = 5_000;
    pub const LOAD_TIMEOUT_MS: u64 = 120_000;
    pub const WARM_TIMEOUT_MS: u64 = 120_000;
    pub const SYNTHESIS_TIMEOUT_MS: u64 = 120_000;
    pub const HEALTH_TIMEOUT_MS: u64 = 2_000;
    pub const INVALIDATION_TIMEOUT_MS: u64 = 500;
    pub const TERMINATION_TIMEOUT_MS: u64 = 2_000;
    pub const SHUTDOWN_TIMEOUT_MS: u64 = 5_000;
    pub const CLEANUP_TIMEOUT_MS: u64 = 5_000;
}

#[cfg(test)]
use frozen_authority::*;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum FrameKind {
    Control,
    Audio,
}

impl FrameKind {
    fn code(self) -> u8 {
        match self {
            Self::Control => CONTROL_KIND,
            Self::Audio => AUDIO_KIND,
        }
    }

    fn maximum_payload_bytes(self) -> usize {
        match self {
            Self::Control => MAX_CONTROL_PAYLOAD_BYTES,
            Self::Audio => MAX_AUDIO_PAYLOAD_BYTES,
        }
    }

    fn minimum_payload_bytes(self) -> usize {
        match self {
            Self::Control => 1,
            Self::Audio => size_of::<f32>(),
        }
    }

    fn from_code(code: u8) -> Result<Self, ProbeFailure> {
        match code {
            CONTROL_KIND => Ok(Self::Control),
            AUDIO_KIND => Ok(Self::Audio),
            _ => Err(ProbeFailure::ProtocolRejected),
        }
    }
}

#[derive(Debug, Eq, PartialEq)]
struct Frame {
    kind: FrameKind,
    payload: Vec<u8>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum ProbeFailure {
    Busy,
    ChildUnavailable,
    InternalFailure,
    ProtocolRejected,
    ResourceLimit,
    TimedOut,
}

impl ProbeFailure {
    fn code(self) -> &'static str {
        match self {
            Self::Busy => "tts-probe-busy",
            Self::ChildUnavailable => "tts-probe-child-unavailable",
            Self::InternalFailure => "tts-probe-internal-failure",
            Self::ProtocolRejected => "tts-probe-protocol-rejected",
            Self::ResourceLimit => "tts-probe-resource-limit",
            Self::TimedOut => "tts-probe-timeout",
        }
    }
}

struct ActiveProbeGuard;

impl ActiveProbeGuard {
    fn acquire() -> Result<Self, ProbeFailure> {
        let mut active = PROBE_ACTIVE
            .lock()
            .map_err(|_| ProbeFailure::InternalFailure)?;
        if *active {
            return Err(ProbeFailure::Busy);
        }
        *active = true;
        Ok(Self)
    }
}

impl Drop for ActiveProbeGuard {
    fn drop(&mut self) {
        if let Ok(mut active) = PROBE_ACTIVE.lock() {
            *active = false;
        }
    }
}

fn encode_header(
    kind: FrameKind,
    payload_bytes: usize,
) -> Result<[u8; HEADER_BYTES], ProbeFailure> {
    if payload_bytes < kind.minimum_payload_bytes() {
        return Err(ProbeFailure::ProtocolRejected);
    }
    if payload_bytes > kind.maximum_payload_bytes() || payload_bytes > u32::MAX as usize {
        return Err(ProbeFailure::ResourceLimit);
    }

    let mut header = [0_u8; HEADER_BYTES];
    header[0..4].copy_from_slice(&MAGIC);
    header[4..6].copy_from_slice(&PROTOCOL_VERSION.to_be_bytes());
    header[6] = kind.code();
    header[7] = 0;
    header[8..12].copy_from_slice(&(payload_bytes as u32).to_be_bytes());
    Ok(header)
}

fn write_frame(
    writer: &mut impl Write,
    kind: FrameKind,
    payload: &[u8],
) -> Result<(), ProbeFailure> {
    let header = encode_header(kind, payload.len())?;
    writer
        .write_all(&header)
        .and_then(|_| writer.write_all(payload))
        .map_err(|_| ProbeFailure::ChildUnavailable)
}

fn read_frame(reader: &mut impl Read) -> Result<Frame, ProbeFailure> {
    let mut header = [0_u8; HEADER_BYTES];
    reader
        .read_exact(&mut header)
        .map_err(|_| ProbeFailure::ProtocolRejected)?;

    if header[0..4] != MAGIC
        || u16::from_be_bytes([header[4], header[5]]) != PROTOCOL_VERSION
        || header[7] != 0
    {
        return Err(ProbeFailure::ProtocolRejected);
    }

    let kind = FrameKind::from_code(header[6])?;
    let payload_bytes = u32::from_be_bytes([header[8], header[9], header[10], header[11]]) as usize;
    if payload_bytes < kind.minimum_payload_bytes() {
        return Err(ProbeFailure::ProtocolRejected);
    }
    if payload_bytes > kind.maximum_payload_bytes() {
        return Err(ProbeFailure::ResourceLimit);
    }

    let mut payload = vec![0_u8; payload_bytes];
    reader
        .read_exact(&mut payload)
        .map_err(|_| ProbeFailure::ProtocolRejected)?;
    Ok(Frame { kind, payload })
}

fn probe_metadata() -> Vec<u8> {
    format!(
        concat!(
            "{{\"protocolVersion\":1,\"kind\":\"audio-unit\",",
            "\"requestId\":\"probe-request\",\"sessionId\":\"probe-session\",",
            "\"generationId\":\"probe-generation\",\"segmentId\":\"probe-segment\",",
            "\"sampleRateHz\":{},\"sampleCountSamples\":{},\"channelCount\":1,",
            "\"sampleFormat\":\"float32-le\",\"payloadBytes\":{},\"complete\":true}}"
        ),
        PROBE_SAMPLE_RATE_HZ, PROBE_SAMPLE_COUNT, PROBE_AUDIO_BYTES
    )
    .into_bytes()
}

fn probe_audio() -> Vec<u8> {
    const VALUES: [f32; 4] = [0.0, 0.25, -0.25, 0.5];
    let mut audio = Vec::with_capacity(PROBE_AUDIO_BYTES);
    for index in 0..PROBE_SAMPLE_COUNT {
        audio.extend_from_slice(&VALUES[index % VALUES.len()].to_le_bytes());
    }
    audio
}

fn validate_audio_payload(payload: &[u8]) -> Result<(), ProbeFailure> {
    if payload.len() != PROBE_AUDIO_BYTES || !payload.len().is_multiple_of(size_of::<f32>()) {
        return Err(ProbeFailure::ProtocolRejected);
    }

    for bytes in payload.chunks_exact(size_of::<f32>()) {
        let value = f32::from_le_bytes(
            bytes
                .try_into()
                .map_err(|_| ProbeFailure::ProtocolRejected)?,
        );
        if !value.is_finite() {
            return Err(ProbeFailure::ProtocolRejected);
        }
    }
    Ok(())
}

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

fn validate_child_frames(metadata: Frame, audio: Frame) -> Result<Vec<u8>, ProbeFailure> {
    if metadata.kind != FrameKind::Control
        || metadata.payload != probe_metadata()
        || audio.kind != FrameKind::Audio
    {
        return Err(ProbeFailure::ProtocolRejected);
    }
    validate_audio_payload(&audio.payload)?;
    Ok(audio.payload)
}

pub fn run_child() -> Result<(), &'static str> {
    let mut input = std::io::stdin().lock();
    let request = read_frame(&mut input).map_err(ProbeFailure::code)?;
    if request.kind != FrameKind::Control || request.payload != PROBE_REQUEST {
        return Err(ProbeFailure::ProtocolRejected.code());
    }

    let mut output = std::io::stdout().lock();
    write_frame(&mut output, FrameKind::Control, &probe_metadata())
        .and_then(|_| write_frame(&mut output, FrameKind::Audio, &probe_audio()))
        .and_then(|_| output.flush().map_err(|_| ProbeFailure::ChildUnavailable))
        .map_err(ProbeFailure::code)
}

fn run_process() -> Result<Vec<u8>, ProbeFailure> {
    let executable = std::env::current_exe().map_err(|_| ProbeFailure::ChildUnavailable)?;
    let mut child = Command::new(executable)
        .arg(OsStr::new(CHILD_ARGUMENT))
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|_| ProbeFailure::ChildUnavailable)?;

    let write_result = child
        .stdin
        .take()
        .ok_or(ProbeFailure::ChildUnavailable)
        .and_then(|mut input| {
            write_frame(&mut input, FrameKind::Control, PROBE_REQUEST)?;
            input.flush().map_err(|_| ProbeFailure::ChildUnavailable)
        });
    if let Err(failure) = write_result {
        let _ = child.kill();
        let _ = child.wait();
        return Err(failure);
    }

    let mut output = child.stdout.take().ok_or(ProbeFailure::ChildUnavailable)?;
    let reader = thread::spawn(move || {
        let metadata = read_frame(&mut output)?;
        let audio = read_frame(&mut output)?;
        validate_child_frames(metadata, audio)
    });

    let started = Instant::now();
    let status = loop {
        match child.try_wait() {
            Ok(Some(status)) => break status,
            Ok(None) if started.elapsed() < PROBE_TIMEOUT => thread::sleep(POLL_INTERVAL),
            Ok(None) => {
                let _ = child.kill();
                let _ = child.wait();
                let _ = reader.join();
                return Err(ProbeFailure::TimedOut);
            }
            Err(_) => {
                let _ = child.kill();
                let _ = child.wait();
                let _ = reader.join();
                return Err(ProbeFailure::ChildUnavailable);
            }
        }
    };

    let frames = reader.join().map_err(|_| ProbeFailure::InternalFailure)??;
    if !status.success() {
        return Err(ProbeFailure::ProtocolRejected);
    }
    Ok(frames)
}

fn run_guarded_process() -> Result<Vec<u8>, ProbeFailure> {
    let _guard = ActiveProbeGuard::acquire()?;
    run_process()
}

pub fn run_host() -> Result<(), &'static str> {
    run_guarded_process()
        .map(|_| ())
        .map_err(ProbeFailure::code)
}

#[tauri::command]
pub async fn run_tts_protocol_probe() -> Result<Response, &'static str> {
    let result = tauri::async_runtime::spawn_blocking(run_guarded_process)
        .await
        .map_err(|_| ProbeFailure::InternalFailure.code())?
        .map_err(ProbeFailure::code)?;
    Ok(Response::new(result))
}

#[cfg(test)]
mod tests {
    use std::io::Cursor;

    use super::frozen_authority::*;
    use super::*;

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
}
