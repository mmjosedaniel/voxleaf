use std::{
    collections::HashMap,
    io::{self, Write},
    sync::Arc,
    thread,
    time::{Duration, Instant},
};

use serde::Serialize;
use serde_json::{Value, json};

use crate::{
    tts_service_protocol::TtsNativeFailure,
    tts_service_supervisor::{
        SynthesisMeasurement, TtsServiceSupervisor, verify_exact_capabilities,
    },
};

pub const HOST_ARGUMENT: &str = "--voxleaf-tts-exact-handoff-host";

const PROFILE: &str = include_str!("../../../../benchmarks/tts/service-handoff-profile-v1.json");
const SEGMENT_FIXTURE: &str = include_str!(
    "../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
);
const ACTIVE_WAIT_TIMEOUT: Duration = Duration::from_secs(5);
const POLL_INTERVAL: Duration = Duration::from_millis(5);
const CLEANUP_OBSERVATION_DELAY: Duration = Duration::from_millis(50);
const SAMPLE_RATE_HZ: f64 = 24_000.0;
const BYTES_PER_SAMPLE: f64 = 4.0;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeCaseResult {
    case_id: &'static str,
    outcome: &'static str,
    published_audio_units: u8,
    delivered_audio_bytes: usize,
    elapsed_milliseconds: f64,
    media_duration_seconds: Option<f64>,
    command_to_first_transport_frame_milliseconds: Option<f64>,
    command_to_complete_unit_milliseconds: Option<f64>,
    native_frame_handoff_microseconds: Option<f64>,
    rtf: Option<f64>,
    termination_milliseconds: Option<f64>,
    failure_code: Option<&'static str>,
}

impl NativeCaseResult {
    fn without_audio(
        case_id: &'static str,
        elapsed: Duration,
        termination: Option<Duration>,
    ) -> Self {
        Self {
            case_id,
            outcome: "pass",
            published_audio_units: 0,
            delivered_audio_bytes: 0,
            elapsed_milliseconds: milliseconds(elapsed),
            media_duration_seconds: None,
            command_to_first_transport_frame_milliseconds: None,
            command_to_complete_unit_milliseconds: None,
            native_frame_handoff_microseconds: None,
            rtf: None,
            termination_milliseconds: termination.map(milliseconds),
            failure_code: None,
        }
    }

    fn from_complete(
        case_id: &'static str,
        measurement: &SynthesisMeasurement,
        publish: bool,
    ) -> Result<Self, &'static str> {
        let audio_bytes = measurement.audio.len();
        if audio_bytes == 0 || !audio_bytes.is_multiple_of(4) || audio_bytes > 1_920_000 {
            return Err(TtsNativeFailure::ProtocolRejected.code());
        }
        let media_duration_seconds = audio_bytes as f64 / BYTES_PER_SAMPLE / SAMPLE_RATE_HZ;
        if !(0.0..=20.0).contains(&media_duration_seconds) || media_duration_seconds == 0.0 {
            return Err(TtsNativeFailure::ProtocolRejected.code());
        }
        let complete_seconds = measurement.command_to_complete_unit.as_secs_f64();
        Ok(Self {
            case_id,
            outcome: "pass",
            published_audio_units: u8::from(publish),
            delivered_audio_bytes: if publish { audio_bytes } else { 0 },
            elapsed_milliseconds: milliseconds(measurement.command_to_complete_unit),
            media_duration_seconds: Some(media_duration_seconds),
            command_to_first_transport_frame_milliseconds: Some(milliseconds(
                measurement.command_to_first_transport_frame,
            )),
            command_to_complete_unit_milliseconds: Some(milliseconds(
                measurement.command_to_complete_unit,
            )),
            native_frame_handoff_microseconds: Some(
                measurement.native_frame_handoff.as_secs_f64() * 1_000_000.0,
            ),
            rtf: Some(complete_seconds / media_duration_seconds),
            termination_milliseconds: None,
            failure_code: None,
        })
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeTimings {
    service_start_milliseconds: f64,
    initial_load_milliseconds: f64,
    initial_warm_milliseconds: f64,
    restart_prepare_milliseconds: Vec<f64>,
}

#[derive(Default)]
struct BoundedConsumer {
    retained: Option<Vec<u8>>,
}

impl BoundedConsumer {
    fn can_dispatch(&self) -> bool {
        self.retained.is_none()
    }

    fn retain(&mut self, audio: Vec<u8>) -> Result<(), TtsNativeFailure> {
        if self.retained.is_some() {
            return Err(TtsNativeFailure::Busy);
        }
        self.retained = Some(audio);
        Ok(())
    }

    fn discard_stale(&mut self, mut audio: Vec<u8>) {
        audio.fill(0);
    }

    fn release(&mut self) {
        if let Some(mut audio) = self.retained.take() {
            audio.fill(0);
        }
    }
}

impl Drop for BoundedConsumer {
    fn drop(&mut self) {
        self.release();
    }
}

pub fn run_host() -> Result<(), &'static str> {
    let profile: Value =
        serde_json::from_str(PROFILE).map_err(|_| TtsNativeFailure::InternalFailure.code())?;
    let inputs = profile_inputs(&profile)?;
    let delay_by_case = case_delays(&profile)?;
    let supervisor =
        Arc::new(TtsServiceSupervisor::exact_from_environment().map_err(TtsNativeFailure::code)?);
    let mut cases = Vec::with_capacity(9);
    let mut consumer = BoundedConsumer::default();
    let mut sequence = 0_u32;

    emit_phase("service-start", false, true)?;
    let service_started = Instant::now();
    supervisor.start().map_err(TtsNativeFailure::code)?;
    let service_start_elapsed = service_started.elapsed();

    emit_phase("model-load-warm", false, true)?;
    let initial_prepare = supervisor
        .prepare_measured()
        .map_err(TtsNativeFailure::code)?;
    verify_exact_capabilities(&initial_prepare.records)?;
    emit_phase("ready", false, true)?;

    let neutral = build_segment(
        inputs
            .get("neutral-1")
            .ok_or(TtsNativeFailure::InternalFailure.code())?,
        sequence,
    )?;
    sequence += 1;
    emit_phase("generation", false, true)?;
    let neutral_measurement = supervisor
        .synthesize_measured(neutral)
        .map_err(TtsNativeFailure::code)?;
    let neutral_case =
        NativeCaseResult::from_complete("cold-neutral-success", &neutral_measurement, true)?;
    let mut neutral_audio = neutral_measurement.audio;
    neutral_audio.fill(0);
    cases.push(neutral_case);

    let spanish = build_segment(
        inputs
            .get("spanish-1")
            .ok_or(TtsNativeFailure::InternalFailure.code())?,
        sequence,
    )?;
    sequence += 1;
    emit_phase("generation", false, true)?;
    let spanish_measurement = supervisor
        .synthesize_measured(spanish)
        .map_err(TtsNativeFailure::code)?;
    let spanish_case =
        NativeCaseResult::from_complete("warm-spanish-success", &spanish_measurement, true)?;
    consumer
        .retain(spanish_measurement.audio)
        .map_err(TtsNativeFailure::code)?;
    cases.push(spanish_case);

    let blocked_started = Instant::now();
    if consumer.can_dispatch() {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }
    supervisor.health().map_err(TtsNativeFailure::code)?;
    cases.push(NativeCaseResult::without_audio(
        "blocked-consumer-backpressure",
        blocked_started.elapsed(),
        None,
    ));
    consumer.release();

    let before_dispatch_started = Instant::now();
    supervisor.health().map_err(TtsNativeFailure::code)?;
    cases.push(NativeCaseResult::without_audio(
        "before-dispatch-invalidation",
        before_dispatch_started.elapsed(),
        None,
    ));

    let stale_segment = build_segment(
        inputs
            .get("spanish-2")
            .ok_or(TtsNativeFailure::InternalFailure.code())?,
        sequence,
    )?;
    sequence += 1;
    emit_phase("generation", false, true)?;
    let stale_measurement = supervisor
        .synthesize_measured(stale_segment)
        .map_err(TtsNativeFailure::code)?;
    let stale_case = NativeCaseResult::from_complete(
        "after-complete-before-delivery-invalidation",
        &stale_measurement,
        false,
    )?;
    consumer.discard_stale(stale_measurement.audio);
    cases.push(stale_case);

    let mut restart_prepare_milliseconds = Vec::with_capacity(3);
    cases.push(run_termination_case(
        Arc::clone(&supervisor),
        build_segment(
            inputs
                .get("spanish-2")
                .ok_or(TtsNativeFailure::InternalFailure.code())?,
            sequence,
        )?,
        "accepted-before-output-cancellation",
        Duration::from_millis(
            *delay_by_case
                .get("accepted-before-output-cancellation")
                .ok_or(TtsNativeFailure::InternalFailure.code())?,
        ),
        TerminationAction::Cancel,
    )?);
    sequence += 1;
    observe_cleanup()?;
    restart_prepare_milliseconds.push(restart_exact(&supervisor)?);

    cases.push(run_termination_case(
        Arc::clone(&supervisor),
        build_segment(
            inputs
                .get("spanish-2")
                .ok_or(TtsNativeFailure::InternalFailure.code())?,
            sequence,
        )?,
        "mid-generation-cancellation",
        Duration::from_millis(
            *delay_by_case
                .get("mid-generation-cancellation")
                .ok_or(TtsNativeFailure::InternalFailure.code())?,
        ),
        TerminationAction::Cancel,
    )?);
    sequence += 1;
    observe_cleanup()?;
    restart_prepare_milliseconds.push(restart_exact(&supervisor)?);

    cases.push(run_termination_case(
        Arc::clone(&supervisor),
        build_segment(
            inputs
                .get("spanish-2")
                .ok_or(TtsNativeFailure::InternalFailure.code())?,
            sequence,
        )?,
        "child-crash",
        Duration::from_millis(
            *delay_by_case
                .get("child-crash")
                .ok_or(TtsNativeFailure::InternalFailure.code())?,
        ),
        TerminationAction::Crash,
    )?);
    sequence += 1;
    observe_cleanup()?;
    restart_prepare_milliseconds.push(restart_exact(&supervisor)?);

    cases.push(run_termination_case(
        Arc::clone(&supervisor),
        build_segment(
            inputs
                .get("spanish-2")
                .ok_or(TtsNativeFailure::InternalFailure.code())?,
            sequence,
        )?,
        "application-exit",
        Duration::from_millis(
            *delay_by_case
                .get("application-exit")
                .ok_or(TtsNativeFailure::InternalFailure.code())?,
        ),
        TerminationAction::ApplicationExit,
    )?);
    observe_cleanup()?;

    emit_json(&json!({
        "kind": "nativeResult",
        "cases": cases,
        "timings": NativeTimings {
            service_start_milliseconds: milliseconds(service_start_elapsed),
            initial_load_milliseconds: milliseconds(initial_prepare.load_elapsed),
            initial_warm_milliseconds: milliseconds(initial_prepare.warm_elapsed),
            restart_prepare_milliseconds,
        },
    }))
}

#[derive(Clone, Copy)]
enum TerminationAction {
    Cancel,
    Crash,
    ApplicationExit,
}

fn run_termination_case(
    supervisor: Arc<TtsServiceSupervisor>,
    segment: Value,
    case_id: &'static str,
    delay: Duration,
    action: TerminationAction,
) -> Result<NativeCaseResult, &'static str> {
    emit_phase("generation", false, true)?;
    let case_started = Instant::now();
    let generation = Arc::clone(&supervisor);
    let worker = thread::spawn(move || generation.synthesize_measured(segment));
    let scope = wait_for_active(&supervisor)?;
    if !delay.is_zero() {
        thread::sleep(delay);
    }
    emit_phase("termination", false, true)?;
    let termination_started = Instant::now();
    match action {
        TerminationAction::Cancel => {
            supervisor.cancel(scope).map_err(TtsNativeFailure::code)?;
        }
        TerminationAction::Crash => {
            supervisor
                .terminate_child_for_diagnostic()
                .map_err(TtsNativeFailure::code)?;
        }
        TerminationAction::ApplicationExit => supervisor.force_stop(),
    }
    let termination_elapsed = termination_started.elapsed();
    let worker_result = worker
        .join()
        .map_err(|_| TtsNativeFailure::InternalFailure.code())?;
    let expected = match action {
        TerminationAction::Crash => {
            matches!(worker_result, Err(TtsNativeFailure::ChildUnavailable))
        }
        TerminationAction::Cancel | TerminationAction::ApplicationExit => {
            matches!(worker_result, Err(TtsNativeFailure::Cancelled))
        }
    };
    if !expected {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }
    Ok(NativeCaseResult::without_audio(
        case_id,
        case_started.elapsed(),
        Some(termination_elapsed),
    ))
}

fn wait_for_active(
    supervisor: &TtsServiceSupervisor,
) -> Result<crate::tts_service_supervisor::CancelScope, &'static str> {
    let deadline = Instant::now() + ACTIVE_WAIT_TIMEOUT;
    loop {
        match supervisor.active_cancel_scope() {
            Ok(scope) => return Ok(scope),
            Err(TtsNativeFailure::InvalidState) if Instant::now() < deadline => {
                thread::sleep(POLL_INTERVAL);
            }
            Err(failure) => return Err(failure.code()),
        }
    }
}

fn restart_exact(supervisor: &TtsServiceSupervisor) -> Result<f64, &'static str> {
    emit_phase("restart", false, true)?;
    let started = Instant::now();
    supervisor.start().map_err(TtsNativeFailure::code)?;
    let prepared = supervisor
        .prepare_measured()
        .map_err(TtsNativeFailure::code)?;
    verify_exact_capabilities(&prepared.records)?;
    emit_phase("ready", false, true)?;
    Ok(milliseconds(started.elapsed()))
}

fn observe_cleanup() -> Result<(), &'static str> {
    emit_phase("cleanup", true, false)?;
    thread::sleep(CLEANUP_OBSERVATION_DELAY);
    Ok(())
}

fn profile_inputs(profile: &Value) -> Result<HashMap<&str, &str>, &'static str> {
    profile
        .get("syntheticInputs")
        .and_then(Value::as_array)
        .ok_or(TtsNativeFailure::InternalFailure.code())?
        .iter()
        .map(|value| {
            let input_id = value
                .get("inputId")
                .and_then(Value::as_str)
                .ok_or(TtsNativeFailure::InternalFailure.code())?;
            let text = value
                .get("text")
                .and_then(Value::as_str)
                .ok_or(TtsNativeFailure::InternalFailure.code())?;
            Ok((input_id, text))
        })
        .collect()
}

fn case_delays(profile: &Value) -> Result<HashMap<&str, u64>, &'static str> {
    profile
        .get("matrix")
        .and_then(Value::as_array)
        .ok_or(TtsNativeFailure::InternalFailure.code())?
        .iter()
        .map(|value| {
            let case_id = value
                .get("caseId")
                .and_then(Value::as_str)
                .ok_or(TtsNativeFailure::InternalFailure.code())?;
            let delay = value
                .get("delayAfterAcceptanceMilliseconds")
                .and_then(Value::as_u64)
                .ok_or(TtsNativeFailure::InternalFailure.code())?;
            Ok((case_id, delay))
        })
        .collect()
}

fn build_segment(text: &str, sequence: u32) -> Result<Value, &'static str> {
    let mut segment = serde_json::from_str::<Value>(SEGMENT_FIXTURE)
        .map_err(|_| TtsNativeFailure::InternalFailure.code())?
        .get("segment")
        .cloned()
        .ok_or(TtsNativeFailure::InternalFailure.code())?;
    segment["segmentId"] = Value::String(format!("segment:handoff-{sequence}"));
    segment["sessionId"] = Value::String("session:handoff".to_owned());
    segment["generationId"] = Value::String("generation:handoff".to_owned());
    segment["sequence"] = Value::from(sequence);
    segment["text"] = Value::String(text.to_owned());
    segment["sourceRange"]["end"]["textOffsetCodePoints"] =
        Value::from(text.chars().count() as u64);
    Ok(segment)
}

fn emit_phase(
    phase: &'static str,
    requires_zero_children: bool,
    observe_network: bool,
) -> Result<(), &'static str> {
    emit_json(&json!({
        "kind": "phase",
        "phase": phase,
        "requiresZeroChildren": requires_zero_children,
        "observeNetwork": observe_network,
    }))
}

fn emit_json(value: &Value) -> Result<(), &'static str> {
    let stdout = io::stdout();
    let mut writer = stdout.lock();
    serde_json::to_writer(&mut writer, value)
        .map_err(|_| TtsNativeFailure::InternalFailure.code())?;
    writer
        .write_all(b"\n")
        .and_then(|()| writer.flush())
        .map_err(|_| TtsNativeFailure::InternalFailure.code())
}

fn milliseconds(duration: Duration) -> f64 {
    duration.as_secs_f64() * 1_000.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn frozen_profile_builds_bounded_content_only_inside_the_native_request() {
        let profile: Value = serde_json::from_str(PROFILE).expect("profile should parse");
        let inputs = profile_inputs(&profile).expect("inputs should validate");
        let segment = build_segment(inputs["spanish-1"], 7).expect("segment should build");
        assert_eq!(segment["sequence"], 7);
        assert_eq!(segment["segmentId"], "segment:handoff-7");
        assert_eq!(segment["text"], inputs["spanish-1"]);
        assert_eq!(
            segment["sourceRange"]["end"]["textOffsetCodePoints"],
            inputs["spanish-1"].chars().count()
        );
    }

    #[test]
    fn bounded_consumer_rejects_a_second_unit_and_zeroes_release() {
        let mut consumer = BoundedConsumer::default();
        consumer.retain(vec![1, 2, 3, 4]).expect("first should fit");
        assert!(!consumer.can_dispatch());
        assert_eq!(
            consumer.retain(vec![5, 6, 7, 8]),
            Err(TtsNativeFailure::Busy)
        );
        consumer.release();
        assert!(consumer.can_dispatch());
    }

    #[test]
    fn content_safe_case_serialization_contains_no_segment_or_text_field() {
        let case = NativeCaseResult::without_audio(
            "before-dispatch-invalidation",
            Duration::from_millis(1),
            None,
        );
        let value = serde_json::to_value(case).expect("case should serialize");
        assert!(value.get("text").is_none());
        assert!(value.get("segment").is_none());
        assert!(value.get("processId").is_none());
        assert_eq!(value["publishedAudioUnits"], 0);
    }
}
