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
