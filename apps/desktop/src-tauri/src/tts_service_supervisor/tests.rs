use super::*;

#[cfg(windows)]
mod packaged_chatterbox;

thread_local! {
    static CHATTERBOX_OBSERVER: std::cell::RefCell<Option<(PathBuf, PathBuf, PathBuf)>> = const { std::cell::RefCell::new(None) };
    static START_PUBLISHED_HOOK: std::cell::RefCell<Option<Box<dyn FnOnce()>>> = const { std::cell::RefCell::new(None) };
    static SHUTDOWN_BUSY_HOOK: std::cell::RefCell<Option<Box<dyn FnOnce()>>> = const { std::cell::RefCell::new(None) };
    static SYNTHETIC_COMMAND_SESSION: std::cell::Cell<bool> = const { std::cell::Cell::new(false) };
    static COMMAND_CLOCK: std::cell::Cell<Option<Instant>> = const { std::cell::Cell::new(None) };
    static COMMAND_BUDGET: std::cell::Cell<Option<Duration>> = const { std::cell::Cell::new(None) };
    static CONTROL_WRITE_HOOK: std::cell::RefCell<Option<ControlWriteHook>> = const { std::cell::RefCell::new(None) };
    static RECEIVE_HOOK: std::cell::RefCell<Option<ReceiveHook>> = const { std::cell::RefCell::new(None) };
}

type ControlWriteHook = Box<dyn FnMut(&Value) -> Result<(), TtsNativeFailure>>;
type ReceiveHook = Box<dyn FnMut(Duration) -> Result<Frame, TtsNativeFailure>>;

pub(super) fn spawn_session_hook(
    id: &str,
    start_request_id: &Option<String>,
) -> Option<Arc<ServiceSession>> {
    SYNTHETIC_COMMAND_SESSION.get().then(|| {
        let (mut session, _sender) = channel_session();
        session.service_instance_id = id.to_owned();
        session.start_request_id = start_request_id.clone();
        Arc::new(session)
    })
}

pub(super) fn command_clock() -> Option<Instant> {
    COMMAND_CLOCK.get()
}

pub(super) fn command_timeout_override() -> Option<Duration> {
    COMMAND_BUDGET.get()
}

pub(super) fn write_control_hook(value: &Value) -> Option<Result<(), TtsNativeFailure>> {
    CONTROL_WRITE_HOOK.with(|slot| slot.borrow_mut().as_mut().map(|hook| hook(value)))
}

pub(super) fn receive_hook(timeout: Duration) -> Option<Result<Frame, TtsNativeFailure>> {
    RECEIVE_HOOK.with(|slot| slot.borrow_mut().as_mut().map(|hook| hook(timeout)))
}

struct CommandFixture;

impl CommandFixture {
    fn new(delay: Duration, slow_command: &'static str) -> Self {
        Self::with_extra(delay, slow_command, Duration::ZERO)
    }

    fn with_extra(delay: Duration, slow_command: &'static str, final_extra: Duration) -> Self {
        SYNTHETIC_COMMAND_SESSION.set(true);
        COMMAND_CLOCK.set(Some(Instant::now()));
        COMMAND_BUDGET.set(Some(Duration::from_millis(10)));
        CONTROL_WRITE_HOOK.with(|slot| {
            *slot.borrow_mut() = Some(Box::new(move |control| {
                let id = control["serviceInstanceId"].as_str().unwrap();
                let kind = control["kind"].as_str().unwrap();
                let record = |value: Value| Frame {
                    kind: FrameKind::Control,
                    payload: encode_control(&value).unwrap(),
                };
                let capabilities = || record(json!({
                    "schemaVersion": 1, "protocolVersion": 1, "kind": "capabilities",
                    "serviceInstanceId": id,
                    "report": {"schemaVersion": 1, "capabilities": {
                        "localSpeechGeneration": "unknown", "streamingGeneration": "unsupported",
                        "generationCancellation": "unsupported", "hardwareAcceleration": "unknown",
                        "cpuFallback": "unsupported"
                    }},
                    "cancellationContainment": "identity-invalidation-then-worker-termination"
                }));
                let state = |state: &str| state_frame(id, state);
                let frames = match kind {
                    "handshake" => vec![state("handshaking"), record(service_control("handshakeAccepted", id)), state("unloaded"), capabilities()],
                    "load" => vec![state("loading"), state("warming")],
                    "warm" => vec![state("ready"), capabilities()],
                    "health" => vec![state("ready"), capabilities()],
                    "shutdown" => vec![state("stopping"), state("stopped")],
                    "synthesize" => {
                        let segment = &control["segment"];
                        let identity = json!({"requestId": control["requestId"],
                            "sessionId": segment["sessionId"], "generationId": segment["generationId"],
                            "segmentId": segment["segmentId"]});
                        vec![state("generating"), record(json!({
                            "schemaVersion": 1, "protocolVersion": 1, "kind": "audioMetadata",
                            "serviceInstanceId": id, "requestId": control["requestId"],
                            "frame": {"schemaVersion": 1, "frameId": control["requestId"],
                                "sessionId": segment["sessionId"], "generationId": segment["generationId"],
                                "segmentId": segment["segmentId"], "sequence": 0, "sampleRateHz": 24000,
                                "sampleCountSamples": 1, "channelCount": 1, "endOfSegment": true},
                            "sampleFormat": "float32-le", "payloadBytes": 4
                        })), Frame {kind: FrameKind::Audio, payload: vec![0; 4]},
                        record(json!({"schemaVersion": 1, "protocolVersion": 1, "kind": "completed",
                            "serviceInstanceId": id, "workIdentity": identity})), state("ready")]
                    }
                    _ => panic!("unexpected command"),
                };
                let frame_delay = if kind == slow_command || (slow_command == "prepare" && matches!(kind, "load" | "warm")) { delay } else { Duration::ZERO };
                let mut frames = frames.into_iter();
                RECEIVE_HOOK.with(|slot| {
                    *slot.borrow_mut() = Some(Box::new(move |timeout| {
                        let now = COMMAND_CLOCK.get().unwrap();
                        let frame_delay = frame_delay + if frames.len() == 1 { final_extra } else { Duration::ZERO };
                        if frame_delay > timeout {
                            COMMAND_CLOCK.set(Some(now + timeout));
                            return Err(TtsNativeFailure::TimedOut);
                        }
                        COMMAND_CLOCK.set(Some(now + frame_delay));
                        frames.next().ok_or(TtsNativeFailure::ChildUnavailable)
                    }));
                });
                Ok(())
            }));
        });
        Self
    }
}

impl Drop for CommandFixture {
    fn drop(&mut self) {
        SYNTHETIC_COMMAND_SESSION.set(false);
        COMMAND_CLOCK.set(None);
        COMMAND_BUDGET.set(None);
        CONTROL_WRITE_HOOK.with(|slot| slot.borrow_mut().take());
        RECEIVE_HOOK.with(|slot| slot.borrow_mut().take());
    }
}

#[test]
fn sac12_commands_reject_cumulatively_late_responses_without_renewing_budget() {
    for command in [
        "handshake",
        "load",
        "warm",
        "health",
        "synthesize",
        "shutdown",
    ] {
        let _fixture = CommandFixture::new(Duration::from_millis(6), command);
        let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
        let (session, _sender) = channel_session();
        if command != "handshake" {
            *supervisor.session.lock().unwrap() = Some(Arc::new(session));
        }
        supervisor
            .set_state(if matches!(command, "load" | "warm") {
                "unloaded"
            } else {
                "ready"
            })
            .unwrap();
        let result = match command {
            "handshake" => supervisor.start().map(|_| ()),
            "load" | "warm" => supervisor.prepare().map(|_| ()),
            "health" => supervisor.health().map(|_| ()),
            "synthesize" => supervisor.synthesize(fixture_segment()).map(|_| ()),
            "shutdown" => supervisor.shutdown().map(|_| ()),
            _ => unreachable!(),
        };
        assert_eq!(result, Err(TtsNativeFailure::TimedOut), "{command}");
        assert!(supervisor.session.lock().unwrap().is_none(), "{command}");
    }
}

#[test]
fn sac12_command_deadlines_are_inclusive_and_load_and_warm_are_separate() {
    for command in [
        "handshake",
        "load",
        "warm",
        "health",
        "synthesize",
        "shutdown",
    ] {
        for final_extra in [Duration::ZERO, Duration::from_millis(1)] {
            let delay = match command {
                "synthesize" => Duration::from_millis(2),
                "handshake" => Duration::from_micros(2500),
                _ => Duration::from_millis(5),
            };
            let _fixture = CommandFixture::with_extra(delay, command, final_extra);
            let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
            let (session, _sender) = channel_session();
            if command != "handshake" {
                *supervisor.session.lock().unwrap() = Some(Arc::new(session));
            }
            supervisor
                .set_state(if matches!(command, "load" | "warm") {
                    "unloaded"
                } else {
                    "ready"
                })
                .unwrap();
            let result = match command {
                "handshake" => supervisor.start().map(|_| ()),
                "load" | "warm" => supervisor.prepare().map(|_| ()),
                "health" => supervisor.health().map(|_| ()),
                "synthesize" => supervisor.synthesize(fixture_segment()).map(|_| ()),
                "shutdown" => supervisor.shutdown().map(|_| ()),
                _ => unreachable!(),
            };
            assert_eq!(
                result,
                if final_extra.is_zero() {
                    Ok(())
                } else {
                    Err(TtsNativeFailure::TimedOut)
                },
                "{command}, {final_extra:?}"
            );
        }
    }
    // Both commands can spend their whole budget; warm never inherits load's deadline.
    let _fixture = CommandFixture::new(Duration::from_millis(5), "prepare");
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    let (session, _sender) = channel_session();
    let session = Arc::new(session);
    *supervisor.session.lock().unwrap() = Some(Arc::clone(&session));
    supervisor.set_state("unloaded").unwrap();
    let initial = COMMAND_CLOCK.get().unwrap();
    assert!(supervisor.prepare().is_ok());
    assert_eq!(
        COMMAND_CLOCK.get().unwrap() - initial,
        Duration::from_millis(20)
    );
}

#[test]
fn sac12_expired_or_late_queued_controls_never_update_lifecycle() {
    for late_after_receive in [false, true] {
        let _fixture = CommandFixture::new(Duration::ZERO, "health");
        let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
        let (session, sender) = channel_session();
        let session = Arc::new(session);
        *supervisor.session.lock().unwrap() = Some(Arc::clone(&session));
        supervisor.set_state("loading").unwrap();
        let deadline = CommandDeadline::new(Duration::from_millis(10));
        sender
            .send(Ok(state_frame(&session.service_instance_id, "ready")))
            .unwrap();
        if late_after_receive {
            RECEIVE_HOOK.with(|slot| {
                *slot.borrow_mut() = Some(Box::new(|_| {
                    COMMAND_CLOCK.set(Some(
                        COMMAND_CLOCK.get().unwrap()
                            + Duration::from_millis(10)
                            + Duration::from_millis(1),
                    ));
                    Ok(state_frame("service:synthetic-1", "ready"))
                }))
            });
        } else {
            COMMAND_CLOCK.set(Some(
                COMMAND_CLOCK.get().unwrap() + Duration::from_millis(10) + Duration::from_millis(1),
            ));
        }
        assert_eq!(
            supervisor.receive_expected_state(&session, &deadline, "ready"),
            Err(TtsNativeFailure::TimedOut)
        );
        assert_eq!(supervisor.lifecycle.lock().unwrap().state, "loading");
    }
}

#[test]
fn sac12_dispatch_time_counts_against_the_command_deadline() {
    let _fixture = CommandFixture::new(Duration::ZERO, "health");
    CONTROL_WRITE_HOOK.with(|slot| {
        *slot.borrow_mut() = Some(Box::new(|_| {
            COMMAND_CLOCK.set(Some(
                COMMAND_CLOCK.get().unwrap() + Duration::from_millis(10) + Duration::from_millis(1),
            ));
            Ok(())
        }))
    });
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    let (session, _sender) = channel_session();
    *supervisor.session.lock().unwrap() = Some(Arc::new(session));
    assert_eq!(supervisor.health(), Err(TtsNativeFailure::TimedOut));
    assert!(supervisor.session.lock().unwrap().is_none());
}

#[cfg(windows)]
fn stdin_pipe_capacity(input: &impl AsRawHandle) -> usize {
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetNamedPipeInfo(
            pipe: *mut std::ffi::c_void,
            flags: *mut u32,
            output_buffer_size: *mut u32,
            input_buffer_size: *mut u32,
            maximum_instances: *mut u32,
        ) -> i32;
    }
    let mut output_capacity = 0;
    let mut input_capacity = 0;
    assert_ne!(
        unsafe {
            GetNamedPipeInfo(
                input.as_raw_handle(),
                std::ptr::null_mut(),
                &mut output_capacity,
                &mut input_capacity,
                std::ptr::null_mut(),
            )
        },
        0
    );
    let capacity = output_capacity.max(input_capacity);
    assert!(capacity > 0 && capacity <= 1_048_576);
    capacity as usize
}

#[cfg(windows)]
fn backpressure_child_command() -> Command {
    let mut command = Command::new(std::env::current_exe().unwrap());
    let capacity_path = BACKPRESSURE_CAPACITY_PATH.with(|path| path.borrow().clone().unwrap());
    command
        .args([
            "--exact",
            "tts_service_supervisor::tests::stdin_backpressure_child_fixture",
            "--ignored",
            "--nocapture",
        ])
        .env(
            "VOXLEAF_STDIN_BACKPRESSURE_PARENT",
            std::process::id().to_string(),
        )
        .env("VOXLEAF_STDIN_BACKPRESSURE_CAPACITY", capacity_path);
    command
}

#[cfg(windows)]
thread_local! {
    static BACKPRESSURE_CAPACITY_PATH: std::cell::RefCell<Option<PathBuf>> = const { std::cell::RefCell::new(None) };
}

#[cfg(windows)]
fn backpressure_session() -> (Arc<ServiceSession>, usize) {
    let root = std::env::temp_dir().join(format!(
        "voxleaf-stdin-capacity-{}-{}",
        std::process::id(),
        REQUEST_COUNTER.fetch_add(1, Ordering::Relaxed)
    ));
    fs::create_dir(&root).unwrap();
    let capacity_path = root.join("capacity");
    BACKPRESSURE_CAPACITY_PATH.with(|path| *path.borrow_mut() = Some(capacity_path.clone()));
    let session = ServiceSession::spawn(
        &ServiceChild::TestCommand(backpressure_child_command),
        "service:backpressure".to_owned(),
        None,
    )
    .unwrap();
    BACKPRESSURE_CAPACITY_PATH.with(|path| path.borrow_mut().take());
    let deadline = Instant::now() + Duration::from_secs(2);
    while !capacity_path.exists() {
        assert!(
            Instant::now() < deadline,
            "stdin fixture did not publish capacity"
        );
        thread::sleep(POLL_INTERVAL);
    }
    let capacity = fs::read_to_string(&capacity_path).unwrap().parse().unwrap();
    fs::remove_file(capacity_path).unwrap();
    fs::remove_dir(root).unwrap();
    (session, capacity)
}

#[cfg(windows)]
#[test]
#[ignore = "subprocess fixture selected only by bounded-stdin tests"]
fn stdin_backpressure_child_fixture() {
    use windows_sys::Win32::{
        Foundation::WAIT_OBJECT_0,
        System::Threading::{INFINITE, OpenProcess, PROCESS_SYNCHRONIZE, WaitForSingleObject},
    };
    let Ok(parent) = std::env::var("VOXLEAF_STDIN_BACKPRESSURE_PARENT") else {
        return;
    };
    let parent = unsafe { OpenProcess(PROCESS_SYNCHRONIZE, 0, parent.parse().unwrap()) };
    assert!(!parent.is_null());
    let parent = unsafe { OwnedHandle::from_raw_handle(parent) };
    #[link(name = "kernel32")]
    unsafe extern "system" {
        fn GetStdHandle(kind: u32) -> *mut std::ffi::c_void;
    }
    let input =
        unsafe { std::os::windows::io::BorrowedHandle::borrow_raw(GetStdHandle((-10_i32) as u32)) };
    let capacity = stdin_pipe_capacity(&input);
    let capacity_path =
        PathBuf::from(std::env::var_os("VOXLEAF_STDIN_BACKPRESSURE_CAPACITY").unwrap());
    let partial = capacity_path.with_extension("partial");
    fs::write(&partial, capacity.to_string()).unwrap();
    fs::rename(partial, capacity_path).unwrap();
    // No stdin read: the real anonymous pipe necessarily applies backpressure.
    assert_eq!(
        unsafe { WaitForSingleObject(parent.as_raw_handle(), INFINITE) },
        WAIT_OBJECT_0
    );
}

#[cfg(windows)]
fn fill_stdin_to_capacity(session: &ServiceSession, stdin_capacity: usize) -> Value {
    let mut control: Value = serde_json::from_str(include_str!(
        "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
    )).unwrap();
    control["serviceInstanceId"] = json!(session.service_instance_id);
    control["segment"]["text"] = json!("x".repeat(MAX_NARRATION_CODE_POINTS));
    let frame_bytes =
        encode_control(&control).unwrap().len() + crate::tts_service_protocol::HEADER_BYTES;
    let mut filled = 0;
    while filled + frame_bytes <= stdin_capacity {
        CommandDeadline::new(Duration::from_secs(1))
            .write_control(session, &control)
            .unwrap();
        filled += frame_bytes;
    }
    assert!(filled <= 1_048_576);
    control
}

#[cfg(windows)]
#[test]
fn sac12_real_blocked_stdin_dispatch_times_out_and_releases_only_its_owner() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    let (session, stdin_capacity) = backpressure_session();
    *supervisor.session.lock().unwrap() = Some(Arc::clone(&session));
    let rescued = Arc::new(std::sync::atomic::AtomicBool::new(false));
    let watchdog_session = Arc::clone(&session);
    let watchdog_rescued = Arc::clone(&rescued);
    let (blocked, blocked_rx) = mpsc::sync_channel(1);
    let (finished, finished_rx) = mpsc::sync_channel(1);
    let watchdog = thread::spawn(move || {
        let entered = blocked_rx.recv_timeout(Duration::from_secs(2)).is_ok();
        let finished = entered && finished_rx.recv_timeout(Duration::from_secs(3)).is_ok();
        if !finished {
            watchdog_rescued.store(true, Ordering::Release);
            // Bypass ServiceSession/input ownership so the original defect cannot hang RED.
            if let Some(process) = watchdog_session.process.lock().unwrap().as_mut() {
                process.terminate().unwrap();
            }
        }
    });
    let control = fill_stdin_to_capacity(&session, stdin_capacity);
    blocked.send(()).unwrap();
    let began = Instant::now();
    let result = CommandDeadline::new(Duration::from_millis(100)).write_control(&session, &control);
    let dispatch_elapsed = began.elapsed();
    let contained = supervisor.fail_session(&session, result.unwrap_err());
    let elapsed = began.elapsed();
    finished.send(()).ok();
    watchdog.join().unwrap();
    assert!(
        !rescued.load(Ordering::Acquire),
        "the blocked writer required watchdog rescue"
    );
    assert_eq!(contained, TtsNativeFailure::TimedOut);
    assert!(dispatch_elapsed < Duration::from_millis(500));
    assert!(elapsed < Duration::from_millis(2500));
    eprintln!(
        "SAC12 blocked dispatch: quota_bytes={stdin_capacity}, dispatch_ms={}, cleanup_total_ms={}, watchdog=false",
        dispatch_elapsed.as_millis(),
        elapsed.as_millis()
    );
    assert!(session.process.lock().unwrap().is_none());
    assert!(session.input.worker.lock().unwrap().is_none());
    assert!(!session.input.busy.load(Ordering::Acquire));
    assert!(supervisor.session.lock().unwrap().is_none());
    let (mut replacement, _sender) = channel_session();
    replacement.service_instance_id = "service:replacement".to_owned();
    *supervisor.session.lock().unwrap() = Some(Arc::new(replacement));
    assert_eq!(
        supervisor.fail_session(&session, TtsNativeFailure::TimedOut),
        TtsNativeFailure::Cancelled
    );
    assert_eq!(
        supervisor.active_session().unwrap().service_instance_id,
        "service:replacement"
    );
}

#[cfg(windows)]
#[test]
fn sac12_cancel_interrupts_real_blocked_stdin_without_queuing_more_work() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    let (session, capacity) = backpressure_session();
    *supervisor.session.lock().unwrap() = Some(Arc::clone(&session));
    let control = fill_stdin_to_capacity(&session, capacity);
    let identity = build_work_identity(&fixture_segment()).unwrap();
    supervisor.lifecycle.lock().unwrap().active = Some(identity.clone());
    let rescued = Arc::new(AtomicBool::new(false));
    let watchdog_session = Arc::clone(&session);
    let watchdog_rescued = Arc::clone(&rescued);
    let (finished, finished_rx) = mpsc::sync_channel(1);
    let watchdog = thread::spawn(move || {
        if finished_rx.recv_timeout(Duration::from_secs(3)).is_err() {
            watchdog_rescued.store(true, Ordering::Release);
            if let Some(process) = watchdog_session.process.lock().unwrap().as_mut() {
                process.terminate().unwrap();
            }
        }
    });
    let writing_session = Arc::clone(&session);
    let (writer_done, writer_done_rx) = mpsc::sync_channel(1);
    let writing = thread::spawn(move || {
        let result =
            CommandDeadline::new(Duration::from_secs(1)).write_control(&writing_session, &control);
        writer_done.send(result).unwrap();
        result
    });
    let observed_blocked = matches!(
        writer_done_rx.recv_timeout(Duration::from_millis(30)),
        Err(RecvTimeoutError::Timeout)
    );
    let extra = session.input.enqueue(
        &service_control("health", &session.service_instance_id),
        Instant::now() + Duration::from_secs(1),
    );
    let began = Instant::now();
    let cancelled = supervisor.cancel(CancelScope {
        session_id: identity.session_id,
        generation_id: identity.generation_id,
        segment_id: identity.segment_id,
    });
    let elapsed = began.elapsed();
    let written = writing.join().unwrap();
    finished.send(()).ok();
    watchdog.join().unwrap();
    assert!(observed_blocked);
    assert!(matches!(extra, Err(TtsNativeFailure::Busy)));
    assert!(cancelled.is_ok(), "{cancelled:?}");
    assert!(written.is_err());
    assert!(!rescued.load(Ordering::Acquire));
    assert!(elapsed < Duration::from_millis(2500));
    eprintln!(
        "SAC12 blocked cancel: quota_bytes={capacity}, containment_ms={}, watchdog=false",
        elapsed.as_millis()
    );
    assert!(session.process.lock().unwrap().is_none());
    assert!(session.input.worker.lock().unwrap().is_none());
    assert!(!session.input.busy.load(Ordering::Acquire));
    assert!(supervisor.session.lock().unwrap().is_none());
}

pub(super) fn pause_start_after_publish() {
    START_PUBLISHED_HOOK.with(|slot| {
        if let Some(hook) = slot.borrow_mut().take() {
            hook();
        }
    });
}

pub(super) fn pause_shutdown_after_busy() {
    SHUTDOWN_BUSY_HOOK.with(|slot| {
        if let Some(hook) = slot.borrow_mut().take() {
            hook();
        }
    });
}

#[test]
#[cfg(windows)]
#[ignore = "explicit native executable supplies the real model-free child entrypoint"]
fn chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement() {
    fn child_command() -> Command {
        let mut command = Command::new(
            std::env::var_os("VOXLEAF_NATIVE_MODEL_FREE_BINARY")
                .expect("native model-free fixture executable required"),
        );
        command
            .arg(crate::tts_service_fake_child::CHILD_ARGUMENT)
            .arg(NORMAL_SCENARIO);
        command
    }
    let supervisor = Arc::new(TtsServiceSupervisor::with_child(ServiceChild::TestCommand(
        child_command,
    )));
    let (published, published_rx) = mpsc::sync_channel(1);
    let (continue_start, continue_start_rx) = mpsc::sync_channel(1);
    let first = Arc::clone(&supervisor);
    let starting = thread::spawn(move || {
        START_PUBLISHED_HOOK.with(|slot| {
            *slot.borrow_mut() = Some(Box::new(move || {
                published.send(()).unwrap();
                continue_start_rx.recv_timeout(HANDSHAKE_TIMEOUT).unwrap();
            }))
        });
        first.start_owned(Some("start:old".to_owned()))
    });
    published_rx.recv_timeout(HANDSHAKE_TIMEOUT).unwrap();
    let (busy, busy_rx) = mpsc::sync_channel(1);
    let (continue_shutdown, continue_shutdown_rx) = mpsc::sync_channel(1);
    let old = Arc::clone(&supervisor);
    let stopping = thread::spawn(move || {
        SHUTDOWN_BUSY_HOOK.with(|slot| {
            *slot.borrow_mut() = Some(Box::new(move || {
                busy.send(()).unwrap();
                continue_shutdown_rx
                    .recv_timeout(HANDSHAKE_TIMEOUT)
                    .unwrap();
            }))
        });
        old.shutdown_owned(None, Some("start:old"))
    });
    busy_rx.recv_timeout(HANDSHAKE_TIMEOUT).unwrap();
    // Model the old child dying while its start response is still pending.
    supervisor.terminate_child_for_diagnostic().unwrap();
    continue_start.send(()).unwrap();
    assert!(starting.join().unwrap().is_err());
    supervisor
        .start_owned(Some("start:new".to_owned()))
        .unwrap();
    let replacement = supervisor
        .active_session()
        .unwrap()
        .service_instance_id
        .clone();
    continue_shutdown.send(()).unwrap();
    let old_result = stopping.join().unwrap();
    let surviving = supervisor
        .active_session()
        .ok()
        .map(|session| session.service_instance_id.clone());
    let current_shutdown = supervisor.shutdown_owned(None, Some("start:new"));
    supervisor.force_stop().unwrap();
    assert_eq!(
        surviving,
        Some(replacement),
        "old request result: {old_result:?}"
    );
    assert!(
        current_shutdown.is_ok(),
        "current owner must retain shutdown"
    );
}

pub(super) fn chatterbox_observer_arguments(python: &Path) -> Option<(PathBuf, PathBuf)> {
    CHATTERBOX_OBSERVER.with(|slot| {
        slot.borrow()
            .as_ref()
            .filter(|(expected, _, _)| expected == python)
            .map(|(_, observer, receipt)| (observer.clone(), receipt.clone()))
    })
}

#[test]
fn chat_audit_f08_pending_shutdown_requires_the_original_start_request() {
    for busy in [false, true] {
        let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
        let (mut session, _sender) = channel_session();
        session.start_request_id = Some("start:current".to_owned());
        let session = Arc::new(session);
        *supervisor.session.lock().unwrap() = Some(Arc::clone(&session));
        supervisor.set_state("handshaking").unwrap();
        let _guard = busy.then(|| supervisor.acquire_operation().unwrap());
        assert_eq!(
            supervisor.shutdown_owned(None, Some("start:old")),
            Err(TtsNativeFailure::Cancelled)
        );
        assert!(Arc::ptr_eq(&session, &supervisor.active_session().unwrap()));
        assert_eq!(supervisor.lifecycle.lock().unwrap().state, "handshaking");
    }
    for invalid in [
        "",
        "start:",
        "other:request",
        "start:path/forbidden",
        "start:has space",
    ] {
        assert_eq!(
            validate_start_request_id(invalid),
            Err(TtsNativeFailure::InvalidInput)
        );
    }
}

#[test]
fn chat_audit_f13_bootstraps_private_dlls_before_importing_chatterbox() {
    let runtime = ExactRuntime {
        python: PathBuf::from("python.exe"),
        model_root: PathBuf::from("model"),
        service_source: PathBuf::from("site-packages"),
        service_site_packages: PathBuf::from("site-packages"),
        service_module: "voxleaf_tts.chatterbox_service",
        runtime_environment: Vec::new(),
        numba_cache_root: None,
    };
    let command = runtime.command().unwrap();
    assert_eq!(command.get_args().nth(1), Some(std::ffi::OsStr::new("-c")));
    assert!(
        command
            .get_args()
            .any(|argument| argument.to_string_lossy().contains("msvcp140.dll"))
    );
    for module in ["voxleaf_tts.piper_service", "voxleaf_tts.qwen_service"] {
        let command = ExactRuntime {
            service_module: module,
            ..runtime.clone()
        }
        .command()
        .unwrap();
        assert_eq!(command.get_args().collect::<Vec<_>>(), ["-s", "-m", module]);
    }
}

impl TtsServiceSupervisor {
    pub(crate) fn lcf_unverified_termination_fixture() -> Self {
        let supervisor = Self::new(NORMAL_SCENARIO);
        let (session, _sender) = channel_session();
        let session = Arc::new(session);
        *supervisor.session.lock().unwrap() = Some(Arc::clone(&session));
        supervisor.set_state("generating").unwrap();
        supervisor.lifecycle.lock().unwrap().active =
            Some(build_work_identity(&fixture_segment()).unwrap());
        let _ = std::panic::catch_unwind(|| {
            let _process = session.process.lock().unwrap();
            panic!("synthetic termination ownership failure");
        });
        supervisor
    }

    pub(crate) fn lcf_repair_termination_fixture(&self) {
        self.session
            .lock()
            .unwrap()
            .as_ref()
            .unwrap()
            .process
            .clear_poison();
    }
}

#[test]
fn lcf_force_stop_retains_unverified_ownership_until_success() {
    let supervisor = TtsServiceSupervisor::lcf_unverified_termination_fixture();
    let before = supervisor.lifecycle_observation().unwrap();
    assert_eq!(
        supervisor.force_stop(),
        Err(TtsNativeFailure::InternalFailure)
    );
    assert_eq!(supervisor.lifecycle_observation().unwrap(), before);
    assert!(supervisor.lifecycle.lock().unwrap().active.is_some());
    supervisor.lcf_repair_termination_fixture();
    assert_eq!(supervisor.force_stop(), Ok(()));
    assert!(supervisor.session.lock().unwrap().is_none());
    assert!(supervisor.lifecycle.lock().unwrap().active.is_none());
    assert_eq!(
        supervisor.lifecycle_observation().unwrap()["state"],
        "stopped"
    );
    assert_eq!(supervisor.force_stop(), Ok(()));
}

#[test]
fn lifecycle_observation_reports_captured_identity_during_busy_preparation() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    let (session, _sender) = channel_session();
    let identity = session.service_instance_id.clone();
    *supervisor.session.lock().unwrap() = Some(Arc::new(session));
    supervisor.set_state("warming").unwrap();
    let _busy = supervisor.operation.lock().unwrap();
    assert_eq!(
        supervisor.lifecycle_observation().unwrap(),
        json!({
            "schemaVersion": 1, "serviceInstanceId": identity, "state": "warming",
        })
    );
}

#[cfg(windows)]
use std::os::windows::io::{AsHandle, AsRawHandle, FromRawHandle, OwnedHandle};

#[cfg(windows)]
static ASSIGNMENT_FAILURE_CHILD_HANDLE: Mutex<Option<OwnedHandle>> = Mutex::new(None);

#[cfg(windows)]
static ASSIGNMENT_FAILURE_READY_EVENT: Mutex<Option<OwnedHandle>> = Mutex::new(None);
#[cfg(windows)]
const ASSIGNMENT_FAILURE_READY_EVENT_NAME: &str = "VOXLEAF_ASSIGNMENT_FAILURE_READY_EVENT_NAME";
#[cfg(windows)]
const ASSIGNMENT_FAILURE_PARENT_ID: &str = "VOXLEAF_ASSIGNMENT_FAILURE_PARENT_ID";

#[cfg(windows)]
fn assignment_failure_child_command() -> Command {
    use windows_sys::Win32::System::Threading::CreateEventW;

    let mut command = Command::new(std::env::current_exe().expect("test executable should exist"));
    let event_name = format!(
        "Local\\VoxLeafAssignmentFailureReady-{}",
        std::process::id()
    );
    let wide_name: Vec<u16> = event_name.encode_utf16().chain(Some(0)).collect();
    let event = unsafe { CreateEventW(std::ptr::null(), 1, 0, wide_name.as_ptr()) };
    assert!(
        !event.is_null(),
        "the fixture readiness event should be created"
    );
    let event = unsafe { OwnedHandle::from_raw_handle(event) };
    *ASSIGNMENT_FAILURE_READY_EVENT
        .lock()
        .expect("the fixture readiness event lock should be available") = Some(event);
    command
        .args([
            "--exact",
            "tts_service_supervisor::tests::assignment_failure_child_fixture",
            "--ignored",
            "--nocapture",
        ])
        .env(ASSIGNMENT_FAILURE_PARENT_ID, std::process::id().to_string())
        .env(ASSIGNMENT_FAILURE_READY_EVENT_NAME, event_name);
    command
}

#[cfg(windows)]
#[test]
#[ignore = "subprocess fixture selected only by the assignment-failure test"]
fn assignment_failure_child_fixture() {
    use windows_sys::Win32::{
        Foundation::WAIT_OBJECT_0,
        System::Threading::{
            EVENT_MODIFY_STATE, INFINITE, OpenEventW, OpenProcess, PROCESS_SYNCHRONIZE, SetEvent,
            WaitForSingleObject,
        },
    };

    let Ok(parent_id) = std::env::var(ASSIGNMENT_FAILURE_PARENT_ID) else {
        return;
    };
    let parent_id = parent_id
        .parse()
        .expect("the parent process ID should be valid");
    let parent = unsafe { OpenProcess(PROCESS_SYNCHRONIZE, 0, parent_id) };
    assert!(!parent.is_null(), "the parent process should be observable");
    let parent = unsafe { OwnedHandle::from_raw_handle(parent) };
    let event_name = std::env::var(ASSIGNMENT_FAILURE_READY_EVENT_NAME)
        .expect("the fixture readiness event name should be supplied");
    let wide_name: Vec<u16> = event_name.encode_utf16().chain(Some(0)).collect();
    let event = unsafe { OpenEventW(EVENT_MODIFY_STATE, 0, wide_name.as_ptr()) };
    assert!(!event.is_null(), "the fixture readiness event should open");
    let event = unsafe { OwnedHandle::from_raw_handle(event) };
    assert_ne!(unsafe { SetEvent(event.as_raw_handle()) }, 0);

    // Ignore stdin EOF: only supervisor termination or parent death ends the fixture.
    assert_eq!(
        unsafe { WaitForSingleObject(parent.as_raw_handle(), INFINITE) },
        WAIT_OBJECT_0
    );
}

#[cfg(windows)]
fn fail_job_assignment(
    child: &Child,
) -> Result<windows_sys::Win32::Foundation::HANDLE, TtsNativeFailure> {
    use windows_sys::Win32::{
        Foundation::{WAIT_OBJECT_0, WAIT_TIMEOUT},
        System::Threading::WaitForSingleObject,
    };

    let process = child
        .as_handle()
        .try_clone_to_owned()
        .expect("the spawned child handle should be cloned");
    let ready_event = ASSIGNMENT_FAILURE_READY_EVENT
        .lock()
        .expect("the fixture readiness event lock should be available")
        .take()
        .expect("the command factory should retain the fixture readiness event");
    assert_eq!(
        unsafe {
            WaitForSingleObject(
                ready_event.as_raw_handle(),
                HANDSHAKE_TIMEOUT.as_millis() as u32,
            )
        },
        WAIT_OBJECT_0,
        "the selected helper test should report readiness before assignment fails"
    );
    assert_eq!(
        unsafe { WaitForSingleObject(process.as_raw_handle(), 0) },
        WAIT_TIMEOUT,
        "the child should still be running before assignment fails"
    );
    *ASSIGNMENT_FAILURE_CHILD_HANDLE
        .lock()
        .expect("the observed child handle lock should be available") = Some(process);
    Err(TtsNativeFailure::ChildUnavailable)
}

fn fixture_segment() -> Value {
    serde_json::from_str::<Value>(include_str!(
        "../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json"
    ))
    .expect("fixture should parse")["segment"]
        .clone()
}

fn channel_session() -> (
    ServiceSession,
    mpsc::SyncSender<Result<Frame, TtsNativeFailure>>,
) {
    let (sender, frames) = mpsc::sync_channel(1);
    let session = ServiceSession {
        service_instance_id: "service:synthetic-1".to_owned(),
        start_request_id: None,
        input: ControlWriter::empty(),
        frames: Mutex::new(frames),
        process: Mutex::new(None),
    };
    (session, sender)
}

fn state_frame(service_instance_id: &str, state: &str) -> Frame {
    Frame {
        kind: FrameKind::Control,
        payload: encode_control(&state_control(service_instance_id, state))
            .expect("state should encode"),
    }
}

#[test]
fn clb03_engine_errors_preserve_operational_classification() {
    for (state, kind, active, with_work_identity) in [
        ("unloaded", "state", false, false),
        ("warming", "state", false, false),
        ("ready", "state", true, false),
        ("generating", "audioMetadata", true, true),
    ] {
        for (reason, expected) in [
            ("engine-failure", TtsNativeFailure::InternalFailure),
            ("engine-timeout", TtsNativeFailure::TimedOut),
        ] {
            let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
            let (session, sender) = channel_session();
            let session = Arc::new(session);
            *supervisor.session.lock().unwrap() = Some(session.clone());
            supervisor.set_state(state).unwrap();
            let identity = build_work_identity(&fixture_segment()).unwrap();
            let mut control = json!({
                "schemaVersion": 1, "protocolVersion": 1, "kind": "error",
                "serviceInstanceId": session.service_instance_id, "reason": reason,
                "error": {"schemaVersion": 1, "code": "internal-failure", "category": "internal", "severity": "fatal"}
            });
            if with_work_identity {
                control["workIdentity"] = json!({
                    "requestId": identity.request_id, "sessionId": identity.session_id,
                    "generationId": identity.generation_id, "segmentId": identity.segment_id
                });
            }
            if active {
                supervisor.lifecycle.lock().unwrap().active = Some(identity);
            }
            sender
                .send(Ok(Frame {
                    kind: FrameKind::Control,
                    payload: encode_control(&control).unwrap(),
                }))
                .unwrap();
            assert_eq!(
                supervisor.receive_control_with_engine_errors(
                    &session,
                    &CommandDeadline::new(Duration::from_secs(1)),
                    kind,
                    true
                ),
                Err(expected)
            );
            assert_eq!(supervisor.fail_session(&session, expected), expected);
            assert!(supervisor.session.lock().unwrap().is_none());
            assert!(supervisor.lifecycle.lock().unwrap().active.is_none());
            assert_eq!(
                supervisor.shutdown_instance(Some(&session.service_instance_id)),
                Ok(vec![
                    state_control(&session.service_instance_id, "stopping"),
                    state_control(&session.service_instance_id, "stopped"),
                ]),
                "the real client must acknowledge verified containment before retry"
            );
        }
    }
}

#[test]
fn clb03_missing_wrong_and_unverified_containment_never_acknowledge_cleanup() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    assert_eq!(
        supervisor.shutdown_instance(Some("service:unknown")),
        Err(TtsNativeFailure::InvalidState)
    );
    let (session, _sender) = channel_session();
    let session = Arc::new(session);
    *supervisor.session.lock().unwrap() = Some(session.clone());
    assert_eq!(
        supervisor.fail_session(&session, TtsNativeFailure::InternalFailure),
        TtsNativeFailure::InternalFailure
    );
    assert_eq!(
        supervisor.shutdown_instance(None),
        Err(TtsNativeFailure::InvalidState)
    );
    assert_eq!(
        supervisor.shutdown_instance(Some("service:foreign")),
        Err(TtsNativeFailure::Cancelled)
    );
    let _operation = supervisor.acquire_operation().unwrap();
    assert!(
        supervisor
            .shutdown_instance(Some(&session.service_instance_id))
            .is_ok()
    );
    drop(_operation);
    supervisor.force_stop().unwrap();
    assert_eq!(
        supervisor.shutdown_instance(Some(&session.service_instance_id)),
        Err(TtsNativeFailure::InvalidState)
    );

    let (unverified, _sender) = channel_session();
    let unverified = Arc::new(unverified);
    *supervisor.session.lock().unwrap() = Some(unverified.clone());
    let _ = std::panic::catch_unwind(|| {
        let _process = unverified.process.lock().unwrap();
        panic!("synthetic termination ownership failure");
    });
    assert_eq!(
        supervisor.fail_session(&unverified, TtsNativeFailure::TimedOut),
        TtsNativeFailure::InternalFailure
    );
    assert!(
        supervisor
            .shutdown_instance(Some(&unverified.service_instance_id))
            .is_err()
    );
    assert!(supervisor.session.lock().unwrap().is_some());
}

#[test]
fn clb03_errors_do_not_weaken_identity_schema_or_sequence_validation() {
    for fault in [
        "service",
        "requestId",
        "sessionId",
        "generationId",
        "segmentId",
        "missing-work",
        "reason",
        "format",
        "schema",
        "code",
        "completed",
        "capabilities",
        "disallowed",
    ] {
        let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
        let (session, sender) = channel_session();
        let session = Arc::new(session);
        *supervisor.session.lock().unwrap() = Some(session.clone());
        supervisor.set_state("generating").unwrap();
        let identity = build_work_identity(&fixture_segment()).unwrap();
        let mut control = json!({
            "schemaVersion": 1, "protocolVersion": 1, "kind": "error",
            "serviceInstanceId": session.service_instance_id, "reason": "engine-failure",
            "error": {"schemaVersion": 1, "code": "internal-failure", "category": "internal", "severity": "fatal"},
            "workIdentity": { "requestId": identity.request_id, "sessionId": identity.session_id, "generationId": identity.generation_id, "segmentId": identity.segment_id }
        });
        supervisor.lifecycle.lock().unwrap().active = Some(identity);
        let mut kind = "audioMetadata";
        match fault {
            "service" => control["serviceInstanceId"] = json!("service:other"),
            "requestId" | "sessionId" | "generationId" | "segmentId" => {
                control["workIdentity"][fault] = json!("identity:other")
            }
            "missing-work" => {
                control.as_object_mut().unwrap().remove("workIdentity");
            }
            "reason" => control["reason"] = json!("unknown"),
            "format" => control["reason"] = json!("format-mismatch"),
            "schema" => control["unexpected"] = json!(true),
            "code" => {
                control["error"] = json!({"schemaVersion": 1, "code": "resource-exhausted", "category": "resource", "severity": "recoverable"})
            }
            "completed" | "capabilities" => kind = fault,
            _ => (),
        }
        sender
            .send(Ok(Frame {
                kind: FrameKind::Control,
                payload: serde_json::to_vec(&control).unwrap(),
            }))
            .unwrap();
        assert_eq!(
            supervisor.receive_control_with_engine_errors(
                &session,
                &CommandDeadline::new(Duration::from_secs(1)),
                kind,
                fault != "disallowed"
            ),
            Err(TtsNativeFailure::ProtocolRejected),
            "{fault}"
        );
        assert_eq!(supervisor.lifecycle.lock().unwrap().state, "generating");
    }
}

#[test]
fn shutdown_interrupts_preparation_without_acquiring_its_operation_guard() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    let (session, _sender) = channel_session();
    *supervisor.session.lock().unwrap() = Some(Arc::new(session));
    supervisor.set_state("loading").unwrap();
    let _preparing = supervisor.acquire_operation().unwrap();
    let result = supervisor.shutdown();
    assert!(
        result.is_ok(),
        "shutdown must contain a loading session, got {result:?}"
    );
    assert!(supervisor.session.lock().unwrap().is_none());
    assert_eq!(supervisor.lifecycle.lock().unwrap().state, "stopped");
}

#[test]
fn late_old_control_cannot_change_a_replacement_session() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    let (old, sender) = channel_session();
    let (mut replacement, _replacement_sender) = channel_session();
    replacement.service_instance_id = "service:replacement".to_owned();
    *supervisor.session.lock().unwrap() = Some(Arc::new(replacement));
    supervisor.set_state("loading").unwrap();
    sender
        .send(Ok(state_frame(&old.service_instance_id, "ready")))
        .unwrap();
    assert_eq!(
        supervisor.receive_control(&old, &CommandDeadline::new(Duration::from_secs(1)), "state"),
        Err(TtsNativeFailure::Cancelled)
    );
    assert_eq!(supervisor.lifecycle.lock().unwrap().state, "loading");
    assert_eq!(
        supervisor.fail_session(&old, TtsNativeFailure::TimedOut),
        TtsNativeFailure::Cancelled
    );
    assert_eq!(
        supervisor.shutdown_instance(Some(&old.service_instance_id)),
        Err(TtsNativeFailure::Cancelled)
    );
    assert_eq!(supervisor.lifecycle.lock().unwrap().state, "loading");
    assert_eq!(
        supervisor.active_session().unwrap().service_instance_id,
        "service:replacement"
    );
}

#[test]
fn expected_state_returns_original_control_and_updates_lifecycle() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    let (session, sender) = channel_session();
    let session = Arc::new(session);
    *supervisor.session.lock().unwrap() = Some(session.clone());
    let control = state_control(&session.service_instance_id, "ready");
    sender
        .send(Ok(state_frame(&session.service_instance_id, "ready")))
        .expect("frame should be queued");
    assert_eq!(
        supervisor.receive_expected_state(
            &session,
            &CommandDeadline::new(Duration::from_secs(1)),
            "ready"
        ),
        Ok(control)
    );
    assert_eq!(supervisor.lifecycle.lock().unwrap().state, "ready");
}

#[test]
fn unexpected_valid_state_updates_lifecycle_before_rejection() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    let (session, sender) = channel_session();
    let session = Arc::new(session);
    *supervisor.session.lock().unwrap() = Some(session.clone());
    sender
        .send(Ok(state_frame(&session.service_instance_id, "warming")))
        .expect("frame should be queued");
    assert_eq!(
        supervisor.receive_expected_state(
            &session,
            &CommandDeadline::new(Duration::from_secs(1)),
            "ready"
        ),
        Err(TtsNativeFailure::ProtocolRejected)
    );
    assert_eq!(supervisor.lifecycle.lock().unwrap().state, "warming");
}

#[test]
fn wrong_service_identity_rejects_before_lifecycle_update() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    supervisor
        .set_state("loading")
        .expect("state should be seeded");
    let (session, sender) = channel_session();
    sender
        .send(Ok(state_frame("service:synthetic-2", "ready")))
        .expect("frame should be queued");
    assert_eq!(
        supervisor.receive_expected_state(
            &session,
            &CommandDeadline::new(Duration::from_secs(1)),
            "ready"
        ),
        Err(TtsNativeFailure::ProtocolRejected)
    );
    assert_eq!(supervisor.lifecycle.lock().unwrap().state, "loading");
}

#[test]
fn expected_state_preserves_timeout_and_disconnection_failures() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    let (session, sender) = channel_session();
    assert_eq!(
        supervisor.receive_expected_state(
            &session,
            &CommandDeadline::new(Duration::from_millis(1)),
            "ready"
        ),
        Err(TtsNativeFailure::TimedOut)
    );
    drop(sender);
    assert_eq!(
        supervisor.receive_expected_state(
            &session,
            &CommandDeadline::new(Duration::from_millis(1)),
            "ready"
        ),
        Err(TtsNativeFailure::ChildUnavailable)
    );
    assert_eq!(supervisor.lifecycle.lock().unwrap().state, "stopped");
}

#[cfg(not(feature = "release-locked-runtime"))]
struct DevelopmentRoot(PathBuf);

#[cfg(not(feature = "release-locked-runtime"))]
impl DevelopmentRoot {
    fn new() -> Self {
        let nonce = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .expect("time should be monotonic")
            .as_nanos();
        let root = std::env::temp_dir().join(format!(
            "voxleaf-development-paths-test-{}-{nonce}",
            std::process::id()
        ));
        for path in [
            "services/tts/src",
            "services/tts/.venv/Lib/site-packages/jsonschema",
            "services/tts/.venv/Lib/site-packages/referencing",
        ] {
            fs::create_dir_all(root.join(path)).expect("fixture directory should be created");
        }
        Self(root)
    }
}

#[cfg(not(feature = "release-locked-runtime"))]
impl Drop for DevelopmentRoot {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

#[cfg(not(feature = "release-locked-runtime"))]
#[test]
fn development_paths_return_canonical_source_then_site_packages() {
    let root = DevelopmentRoot::new();
    assert_eq!(
        development_service_paths(&root.0),
        Ok((
            root.0.join("services/tts/src").canonicalize().unwrap(),
            root.0
                .join("services/tts/.venv/Lib/site-packages")
                .canonicalize()
                .unwrap(),
        ))
    );
}

#[cfg(not(feature = "release-locked-runtime"))]
#[test]
fn development_paths_reject_missing_source_site_packages_and_dependencies() {
    for missing in [
        "services/tts/src",
        "services/tts/.venv/Lib/site-packages",
        "services/tts/.venv/Lib/site-packages/jsonschema",
        "services/tts/.venv/Lib/site-packages/referencing",
    ] {
        let root = DevelopmentRoot::new();
        fs::remove_dir_all(root.0.join(missing)).expect("fixture directory should be removed");
        assert_eq!(
            development_service_paths(&root.0),
            Err(TtsNativeFailure::ChildUnavailable),
            "missing {missing} should be unavailable"
        );
    }
}

#[test]
fn validates_segment_and_generates_native_owned_request_identity() {
    let identity = build_work_identity(&fixture_segment()).expect("segment should validate");
    assert!(identity.request_id.starts_with("request:native-"));
    assert_eq!(identity.session_id, "session:synthetic-1");
}

#[test]
fn rejects_text_and_identity_bounds_before_dispatch() {
    let mut segment = fixture_segment();
    segment["text"] = Value::String("a".repeat(MAX_NARRATION_CODE_POINTS + 1));
    assert_eq!(
        build_work_identity(&segment),
        Err(TtsNativeFailure::ResourceLimit)
    );
    segment = fixture_segment();
    segment["sessionId"] = Value::String(String::new());
    assert_eq!(
        build_work_identity(&segment),
        Err(TtsNativeFailure::InvalidInput)
    );
}

#[test]
fn fixed_failure_surface_contains_no_dynamic_input() {
    assert_eq!(
        [
            TtsNativeFailure::Busy,
            TtsNativeFailure::Cancelled,
            TtsNativeFailure::ChildUnavailable,
            TtsNativeFailure::InternalFailure,
            TtsNativeFailure::InvalidInput,
            TtsNativeFailure::InvalidState,
            TtsNativeFailure::ProtocolRejected,
            TtsNativeFailure::ResourceLimit,
            TtsNativeFailure::TimedOut,
        ]
        .map(TtsNativeFailure::code),
        [
            "tts-service-busy",
            "tts-service-cancelled",
            "tts-service-unavailable",
            "tts-service-internal-failure",
            "tts-service-invalid-input",
            "tts-service-invalid-state",
            "tts-service-protocol-rejected",
            "tts-service-resource-limit",
            "tts-service-timeout",
        ]
    );
}

#[test]
fn profile_configuration_rejects_unknown_profile_identity() {
    let supervisor = TtsServiceSupervisor::new(NORMAL_SCENARIO);
    assert_eq!(
        supervisor.configure_profile("unknown-profile", None),
        Err(TtsNativeFailure::InvalidInput)
    );
    assert!(!profile_configuration_available("unknown-profile"));
}

#[test]
fn profile_configuration_rejects_wrong_language_bindings_before_runtime_lookup() {
    for (profile_id, language) in [
        (PIPER_SPANISH_PROFILE_ID, "en"),
        (PIPER_ENGLISH_PROFILE_ID, "es"),
        (QWEN_SERENA_PROFILE_ID, "en"),
        (QWEN_AIDEN_PROFILE_ID, "es"),
    ] {
        assert!(matches!(
            ExactRuntime::for_profile(profile_id, Some(language)),
            Err(TtsNativeFailure::InvalidInput)
        ));
    }
    assert!(matches!(
        ExactRuntime::for_profile(CHATTERBOX_PROFILE_ID, Some("fr")),
        Err(TtsNativeFailure::InvalidInput)
    ));
}

#[test]
fn exact_runtime_never_writes_bytecode_into_verified_packages() {
    let runtime = ExactRuntime {
        python: PathBuf::from("python.exe"),
        model_root: PathBuf::from("model"),
        service_source: PathBuf::from("source"),
        service_site_packages: PathBuf::from("site-packages"),
        service_module: "voxleaf_tts.piper_service",
        runtime_environment: Vec::new(),
        numba_cache_root: None,
    };
    let command = runtime.command().expect("command should be created");
    assert!(command.get_envs().any(|(key, value)| {
        key == "PYTHONDONTWRITEBYTECODE" && value == Some(std::ffi::OsStr::new("1"))
    }));
}

#[test]
fn exact_runtime_uses_an_absolute_private_interpreter_and_scrubs_host_python_state() {
    let private_root = std::env::temp_dir().join("voxleaf-private-runtime-command-test");
    let runtime = ExactRuntime {
        python: private_root.join("runtime/python.exe"),
        model_root: private_root.join("models"),
        service_source: private_root.join("runtime/Lib/site-packages"),
        service_site_packages: private_root.join("runtime/Lib/site-packages"),
        service_module: "voxleaf_tts.chatterbox_service",
        runtime_environment: Vec::new(),
        numba_cache_root: None,
    };

    let command = runtime.command().expect("command should be created");
    assert!(Path::new(command.get_program()).is_absolute());
    assert_eq!(command.get_program(), runtime.python.as_os_str());
    assert_eq!(command.get_args().nth(1), Some(std::ffi::OsStr::new("-c")));
    assert_eq!(
        command.get_args().last(),
        Some(runtime.service_site_packages.as_os_str())
    );
    for removed in [
        "PYTHONHOME",
        "PYTHONUSERBASE",
        "VIRTUAL_ENV",
        "CONDA_PREFIX",
        "CONDA_DEFAULT_ENV",
        "VOXLEAF_TTS_DEV_ENABLED",
        "VOXLEAF_TTS_DEV_PYTHON",
        "VOXLEAF_TTS_DEV_MODEL_ROOT",
        "VOXLEAF_TTS_PIPER_ENABLED",
        "VOXLEAF_TTS_PIPER_PYTHON",
        "VOXLEAF_TTS_PIPER_MODEL_ROOT",
        "VOXLEAF_TTS_PIPER_EN_ENABLED",
        "VOXLEAF_TTS_PIPER_EN_PYTHON",
        "VOXLEAF_TTS_PIPER_EN_MODEL_ROOT",
        "VOXLEAF_TTS_CHATTERBOX_ENABLED",
        "VOXLEAF_TTS_CHATTERBOX_PYTHON",
        "VOXLEAF_TTS_CHATTERBOX_MODEL_ROOT",
        "VOXLEAF_CHATTERBOX_VALIDATION_PACKAGE_ROOT",
    ] {
        assert!(
            command
                .get_envs()
                .any(|(key, value)| { key == std::ffi::OsStr::new(removed) && value.is_none() })
        );
    }
    assert!(!command.get_envs().any(|(key, _)| key == "PATH"));
}

#[cfg(feature = "release-locked-runtime")]
#[test]
fn release_locked_runtime_rejects_development_only_profiles_and_defaults() {
    assert!(release_locked_runtime_enabled());
    assert!(matches!(
        ExactRuntime::for_profile(QWEN_SERENA_PROFILE_ID, Some("es")),
        Err(TtsNativeFailure::ChildUnavailable)
    ));
    assert!(matches!(
        ExactRuntime::for_profile(QWEN_AIDEN_PROFILE_ID, Some("en")),
        Err(TtsNativeFailure::ChildUnavailable)
    ));
    assert!(matches!(
        ServiceChild::configured(),
        ServiceChild::Unavailable
    ));
    assert!(!TtsServiceSupervisor::default().exact_demo_available());
    assert!(matches!(
        TtsServiceSupervisor::exact_from_environment(),
        Err(TtsNativeFailure::ChildUnavailable)
    ));
}

#[test]
fn exact_chatterbox_runtime_redirects_numba_cache_outside_the_verified_package() {
    let cache =
        std::env::temp_dir().join(format!("voxleaf-numba-cache-test-{}", std::process::id()));
    let _ = fs::remove_dir_all(&cache);
    let runtime = ExactRuntime {
        python: PathBuf::from("python.exe"),
        model_root: PathBuf::from("model"),
        service_source: PathBuf::from("source"),
        service_site_packages: PathBuf::from("site-packages"),
        service_module: "voxleaf_tts.chatterbox_service",
        runtime_environment: Vec::new(),
        numba_cache_root: Some(cache.clone()),
    };

    let command = runtime.command().expect("command should be created");

    assert!(cache.is_dir());
    assert!(
        command
            .get_envs()
            .any(|(key, value)| { key == "NUMBA_CACHE_DIR" && value == Some(cache.as_os_str()) })
    );
    fs::remove_dir_all(cache).expect("test cache should be removed");
}

#[cfg(windows)]
#[test]
fn exact_runtime_removes_verbatim_prefixes_at_the_child_process_boundary() {
    let runtime = ExactRuntime {
        python: PathBuf::from(r"\\?\C:\runtime\python.exe"),
        model_root: PathBuf::from(r"\\?\C:\models"),
        service_source: PathBuf::from(r"\\?\C:\source"),
        service_site_packages: PathBuf::from(r"\\?\C:\site-packages"),
        service_module: "voxleaf_tts.chatterbox_service",
        runtime_environment: Vec::new(),
        numba_cache_root: None,
    };

    let command = runtime.command().expect("command should be created");
    assert_eq!(
        command.get_program(),
        std::ffi::OsStr::new(r"C:\runtime\python.exe")
    );
    assert_eq!(command.get_current_dir(), Some(Path::new(r"C:\models")));
    let python_path = command
        .get_envs()
        .find_map(|(key, value)| (key == "PYTHONPATH").then_some(value).flatten())
        .expect("PYTHONPATH should be configured");
    assert_eq!(
        std::env::split_paths(python_path).collect::<Vec<_>>(),
        [
            PathBuf::from(r"C:\source"),
            PathBuf::from(r"C:\site-packages")
        ]
    );
    assert_eq!(
        child_process_path(Path::new(r"\\?\UNC\server\share\runtime")),
        PathBuf::from(r"\\server\share\runtime")
    );
    assert_eq!(
        child_process_path(Path::new(r"\\?\Volume{authority}\runtime")),
        PathBuf::from(r"\\?\Volume{authority}\runtime")
    );
}

#[cfg(windows)]
#[test]
fn supervised_children_use_the_windows_no_console_flag() {
    assert_eq!(SUPERVISED_CHILD_CREATION_FLAGS, CREATE_NO_WINDOW);
    assert_eq!(SUPERVISED_CHILD_CREATION_FLAGS, 0x0800_0000);
}

#[cfg(windows)]
#[test]
fn failed_job_assignment_kills_and_reaps_the_spawned_child() {
    use windows_sys::Win32::{Foundation::WAIT_OBJECT_0, System::Threading::WaitForSingleObject};

    ASSIGNMENT_FAILURE_CHILD_HANDLE
        .lock()
        .expect("the observed child handle lock should be available")
        .take();
    let result = ChildProcess::spawn_with_job_assigner(
        &ServiceChild::TestCommand(assignment_failure_child_command),
        fail_job_assignment,
    );
    // A spawn error bypasses the assigner, so release any unused readiness event here.
    let _unused_ready_event = ASSIGNMENT_FAILURE_READY_EVENT
        .lock()
        .expect("the fixture readiness event lock should be available")
        .take();
    let process = ASSIGNMENT_FAILURE_CHILD_HANDLE
        .lock()
        .expect("the observed child handle lock should be available")
        .take()
        .expect("the assigner should retain the original spawned child handle");
    assert!(matches!(result, Err(TtsNativeFailure::ChildUnavailable)));
    assert_eq!(
        unsafe { WaitForSingleObject(process.as_raw_handle(), 0) },
        WAIT_OBJECT_0,
        "the failed assignment path must return only after the original child exits"
    );
}
