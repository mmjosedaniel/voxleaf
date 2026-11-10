use super::*;
use std::{
    io::{BufRead, BufReader, Cursor},
    process::{Command, Stdio},
    sync::mpsc,
};

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

#[test]
#[ignore = "disposable child fixture for the acknowledgement test"]
fn dcr_22_cleanup_child_fixture() {
    let observer = ObserverPipe::new(BufReader::new(io::stdin())).expect("fixture observer");
    admit_observer(&observer).expect("fixture version handshake");
    for (index, phase) in [
        "accepted-before-output-cancellation",
        "mid-generation-cancellation",
        "child-crash",
        "application-exit",
    ]
    .into_iter()
    .enumerate()
    {
        observe_cleanup(&observer, phase, index as u32 + 1).expect("fixture cleanup boundary");
    }
    emit_json(&json!({"kind":"fixtureSuccessor"})).expect("fixture successor");
}

#[test]
fn dcr_22_native_holds_cleanup_boundary_for_delayed_observer() {
    let mut child = Command::new(std::env::current_exe().expect("test executable"))
        .args([
            "--exact",
            "tts_service_handoff::tests::dcr_22_cleanup_child_fixture",
            "--ignored",
            "--nocapture",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .expect("disposable test child");
    let stdout = child.stdout.take().expect("child stdout");
    let (records, observed) = mpsc::channel();
    let reader = thread::spawn(move || {
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            let Some((_, json)) = line.split_once('{') else {
                continue;
            };
            let Ok(value) = serde_json::from_str::<Value>(&format!("{{{json}")) else {
                continue;
            };
            if records.send(value).is_err() {
                break;
            }
        }
    });
    let mut input = child.stdin.take().expect("fixture stdin");
    let exchange = (|| -> Result<(), String> {
        let mut send = |value: Value| {
            writeln!(input, "{value}")
                .and_then(|()| input.flush())
                .map_err(|error| error.to_string())
        };
        let receive = || {
            observed
                .recv_timeout(Duration::from_secs(5))
                .map_err(|error| error.to_string())
        };
        let hello = json!({"kind":"hello", "version":2});
        send(hello.clone())?;
        if receive()? != hello {
            return Err("wrong native version".into());
        }
        for (index, phase) in [
            "accepted-before-output-cancellation",
            "mid-generation-cancellation",
            "child-crash",
            "application-exit",
        ]
        .into_iter()
        .enumerate()
        {
            let sequence = index + 1;
            if receive()?
                != json!({
                    "kind":"cleanupReady", "version":2, "phase":phase, "sequence":sequence,
                })
            {
                return Err("wrong cleanup boundary".into());
            }
            let premature = observed.recv_timeout(Duration::from_millis(140));
            if !matches!(premature, Err(mpsc::RecvTimeoutError::Timeout)) {
                return Err(format!(
                    "the successor appeared without acknowledgement: {premature:?}"
                ));
            }
            send(json!({
                "kind":"cleanupAck", "version":2, "phase":phase, "sequence":sequence,
            }))?;
        }
        if receive()? != json!({"kind":"fixtureSuccessor"}) {
            return Err("fixture did not finish after the fourth acknowledgement".into());
        }
        Ok(())
    })();
    drop(input);
    let deadline = Instant::now() + Duration::from_secs(5);
    while child.try_wait().expect("fixture status").is_none() && Instant::now() < deadline {
        thread::sleep(Duration::from_millis(5));
    }
    if child.try_wait().expect("fixture status").is_none() {
        child.kill().expect("terminate retained fixture");
    }
    let status = child.wait().expect("reap fixture");
    reader.join().expect("join fixture stdout reader");
    assert_eq!(exchange, Ok(()));
    assert!(status.success());
}

#[test]
fn dcr_22_observer_rejects_wrong_version_replay_eof_and_oversized_records() {
    let hello = json!({"kind":"hello", "version":2});
    let wrong =
        ObserverPipe::new(Cursor::new(b"{\"kind\":\"hello\",\"version\":1}\n")).expect("observer");
    assert_eq!(admit_observer(&wrong), Err("observer-record"));

    let first = json!({"kind":"cleanupAck", "version":2, "phase":"child-crash", "sequence":3});
    let second =
        json!({"kind":"cleanupAck", "version":2, "phase":"application-exit", "sequence":4});
    let replay = ObserverPipe::new(Cursor::new(format!("{first}\n{first}\n"))).expect("observer");
    assert_eq!(replay.require(first, Duration::from_secs(1)), Ok(()));
    assert_eq!(
        replay.require(second, Duration::from_secs(1)),
        Err("observer-record")
    );

    let eof = ObserverPipe::new(Cursor::new(Vec::new())).expect("observer");
    assert_eq!(
        eof.require(hello.clone(), Duration::from_secs(1)),
        Err("observer-eof")
    );
    let oversized = ObserverPipe::new(Cursor::new(vec![b'x'; 257])).expect("observer");
    assert_eq!(
        oversized.require(hello, Duration::from_secs(1)),
        Err("observer-record-bound")
    );
}

#[test]
fn dcr_22_observer_read_timeout_is_bounded_with_open_input() {
    struct HeldRead(mpsc::Receiver<()>);
    impl Read for HeldRead {
        fn read(&mut self, _buffer: &mut [u8]) -> io::Result<usize> {
            let _ = self.0.recv_timeout(Duration::from_secs(2));
            Ok(0)
        }
    }
    let (release, held) = mpsc::channel();
    let observer = ObserverPipe::new(BufReader::new(HeldRead(held))).expect("observer");
    assert_eq!(
        observer.require(
            json!({"kind":"hello","version":2}),
            Duration::from_millis(10)
        ),
        Err("observer-timeout")
    );
    release.send(()).expect("release fixture reader");
}
