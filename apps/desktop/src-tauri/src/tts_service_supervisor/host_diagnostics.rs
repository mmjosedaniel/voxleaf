use std::{sync::Arc, thread, time::Instant};

use serde_json::Value;

use super::{
    CancelScope, HANDSHAKE_TIMEOUT, NORMAL_SCENARIO, POLL_INTERVAL, TtsNativeFailure,
    TtsServiceSupervisor,
};
#[cfg(windows)]
use crate::tts_service_fake_child::DESCENDANT_SCENARIO;
use crate::tts_service_fake_child::{CRASH_SCENARIO, PENDING_SCENARIO};

pub fn run_host() -> Result<(), &'static str> {
    for (scenario, phase) in [
        (crate::tts_service_fake_child::LOADING_SCENARIO, "loading"),
        (crate::tts_service_fake_child::WARMING_SCENARIO, "warming"),
    ] {
        let supervisor = Arc::new(TtsServiceSupervisor::new(scenario));
        supervisor.start().map_err(TtsNativeFailure::code)?;
        let preparing = Arc::clone(&supervisor);
        let worker = thread::spawn(move || preparing.prepare());
        let deadline = Instant::now() + HANDSHAKE_TIMEOUT;
        while supervisor
            .lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure.code())?
            .state
            != phase
        {
            if Instant::now() >= deadline {
                let _ = supervisor.force_stop();
                let _ = worker.join();
                return Err(TtsNativeFailure::TimedOut.code());
            }
            thread::sleep(POLL_INTERVAL);
        }
        let started = Instant::now();
        supervisor.shutdown().map_err(TtsNativeFailure::code)?;
        if started.elapsed() > super::TERMINATION_TIMEOUT {
            return Err(TtsNativeFailure::TimedOut.code());
        }
        if worker
            .join()
            .map_err(|_| TtsNativeFailure::InternalFailure.code())?
            != Err(TtsNativeFailure::Cancelled)
        {
            return Err(TtsNativeFailure::ProtocolRejected.code());
        }
        if supervisor
            .session
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure.code())?
            .is_some()
        {
            return Err(TtsNativeFailure::InvalidState.code());
        }
        *supervisor
            .child_configuration
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure.code())? =
            super::ServiceChild::Fake(NORMAL_SCENARIO);
        supervisor.start().map_err(TtsNativeFailure::code)?;
        supervisor.prepare().map_err(TtsNativeFailure::code)?;
        supervisor.shutdown().map_err(TtsNativeFailure::code)?;
    }
    let segment: Value = serde_json::from_str::<Value>(include_str!(
        "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
    ))
    .map_err(|_| TtsNativeFailure::InternalFailure.code())?
    .get("segment")
    .cloned()
    .ok_or(TtsNativeFailure::InternalFailure.code())?;

    let normal = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    // CLB-03: real framed child errors must be contained before a replacement.
    for (scenario, prepare_failure, expected) in [
        (
            crate::tts_service_fake_child::LOAD_FAILURE_SCENARIO,
            true,
            TtsNativeFailure::InternalFailure,
        ),
        (
            crate::tts_service_fake_child::WARM_FAILURE_SCENARIO,
            true,
            TtsNativeFailure::InternalFailure,
        ),
        (
            crate::tts_service_fake_child::SYNTHESIS_FAILURE_SCENARIO,
            false,
            TtsNativeFailure::InternalFailure,
        ),
        (
            crate::tts_service_fake_child::ENGINE_TIMEOUT_SCENARIO,
            false,
            TtsNativeFailure::TimedOut,
        ),
    ] {
        let supervisor = TtsServiceSupervisor::new(scenario);
        supervisor.start().map_err(TtsNativeFailure::code)?;
        let failed_id = supervisor
            .active_session()
            .map_err(TtsNativeFailure::code)?
            .service_instance_id
            .clone();
        let failed = if prepare_failure {
            supervisor.prepare().map(|_| ())
        } else {
            supervisor.prepare().map_err(TtsNativeFailure::code)?;
            supervisor.synthesize(segment.clone()).map(|_| ())
        };
        if failed != Err(expected)
            || supervisor
                .session
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure.code())?
                .is_some()
            || supervisor
                .lifecycle
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure.code())?
                .active
                .is_some()
        {
            return Err(TtsNativeFailure::ProtocolRejected.code());
        }
        let contained = supervisor
            .shutdown_instance(Some(&failed_id))
            .map_err(TtsNativeFailure::code)?;
        if contained
            != vec![
                super::state_control(&failed_id, "stopping"),
                super::state_control(&failed_id, "stopped"),
            ]
        {
            return Err(TtsNativeFailure::ProtocolRejected.code());
        }
        if supervisor.shutdown_instance(Some("service:foreign")) != Err(TtsNativeFailure::Cancelled)
        {
            return Err(TtsNativeFailure::ProtocolRejected.code());
        }
        *supervisor
            .child_configuration
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure.code())? =
            super::ServiceChild::Fake(NORMAL_SCENARIO);
        supervisor.start().map_err(TtsNativeFailure::code)?;
        if supervisor.shutdown_instance(Some(&failed_id)) != Err(TtsNativeFailure::Cancelled) {
            return Err(TtsNativeFailure::ProtocolRejected.code());
        }
        supervisor.prepare().map_err(TtsNativeFailure::code)?;
        supervisor
            .synthesize(segment.clone())
            .map_err(TtsNativeFailure::code)?;
        supervisor.shutdown().map_err(TtsNativeFailure::code)?;
    }
    normal.start().map_err(TtsNativeFailure::code)?;
    normal.prepare().map_err(TtsNativeFailure::code)?;
    let audio = normal
        .synthesize(segment.clone())
        .map_err(TtsNativeFailure::code)?;
    if audio.len() != 19_200 {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }
    normal.health().map_err(TtsNativeFailure::code)?;
    normal.shutdown().map_err(TtsNativeFailure::code)?;

    let pending = Arc::new(TtsServiceSupervisor::new(PENDING_SCENARIO));
    pending.start().map_err(TtsNativeFailure::code)?;
    pending.prepare().map_err(TtsNativeFailure::code)?;
    let generation = Arc::clone(&pending);
    let pending_segment = segment.clone();
    let worker = thread::spawn(move || generation.synthesize(pending_segment));
    cancel_when_generation_becomes_active(&pending)?;
    if worker
        .join()
        .map_err(|_| TtsNativeFailure::InternalFailure.code())?
        != Err(TtsNativeFailure::Cancelled)
    {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }

    let crash = TtsServiceSupervisor::new(CRASH_SCENARIO);
    crash.start().map_err(TtsNativeFailure::code)?;
    crash.prepare().map_err(TtsNativeFailure::code)?;
    if crash.synthesize(segment.clone()).is_ok() {
        return Err(TtsNativeFailure::ProtocolRejected.code());
    }
    crash.start().map_err(TtsNativeFailure::code)?;
    crash.shutdown().map_err(TtsNativeFailure::code)?;

    #[cfg(windows)]
    {
        let descendant = Arc::new(TtsServiceSupervisor::new(DESCENDANT_SCENARIO));
        descendant.start().map_err(TtsNativeFailure::code)?;
        descendant.prepare().map_err(TtsNativeFailure::code)?;
        let generation = Arc::clone(&descendant);
        let worker = thread::spawn(move || generation.synthesize(segment));
        cancel_when_generation_becomes_active(&descendant)?;
        let _ = worker.join();
    }
    Ok(())
}

fn cancel_when_generation_becomes_active(
    supervisor: &TtsServiceSupervisor,
) -> Result<(), &'static str> {
    let deadline = Instant::now() + HANDSHAKE_TIMEOUT;
    loop {
        let active = supervisor
            .lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure.code())?
            .active
            .clone();
        if let Some(identity) = active {
            supervisor
                .cancel(CancelScope {
                    session_id: identity.session_id,
                    generation_id: identity.generation_id,
                    segment_id: identity.segment_id,
                })
                .map_err(TtsNativeFailure::code)?;
            break;
        }
        if Instant::now() >= deadline {
            return Err(TtsNativeFailure::TimedOut.code());
        }
        thread::sleep(POLL_INTERVAL);
    }
    Ok(())
}
