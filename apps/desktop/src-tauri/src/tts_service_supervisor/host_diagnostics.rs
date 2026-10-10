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
    let segment: Value = serde_json::from_str::<Value>(include_str!(
        "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
    ))
    .map_err(|_| TtsNativeFailure::InternalFailure.code())?
    .get("segment")
    .cloned()
    .ok_or(TtsNativeFailure::InternalFailure.code())?;

    let normal = TtsServiceSupervisor::new(NORMAL_SCENARIO);
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
    let deadline = Instant::now() + HANDSHAKE_TIMEOUT;
    loop {
        let active = pending
            .lifecycle
            .lock()
            .map_err(|_| TtsNativeFailure::InternalFailure.code())?
            .active
            .clone();
        if let Some(identity) = active {
            pending
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
        let deadline = Instant::now() + HANDSHAKE_TIMEOUT;
        loop {
            let active = descendant
                .lifecycle
                .lock()
                .map_err(|_| TtsNativeFailure::InternalFailure.code())?
                .active
                .clone();
            if let Some(identity) = active {
                descendant
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
        let _ = worker.join();
    }
    Ok(())
}
