# APPROVED WORK ORDER

Target ID: NRTL-HANDOFF
Goal: Apply the explicitly selected private Rust child-test layout while preserving all production and test behavior.
Risk: low
Allowed files: apps/desktop/src-tauri/src/tts_service_handoff.rs; apps/desktop/src-tauri/src/tts_service_handoff/tests.rs.
Required edits:
1. Replace wrapper with private #[cfg(test)] mod tests; move unchanged 42-line body dedented once. No includes move. Parent PROFILE retains ../../../../benchmarks/tts/service-handoff-profile-v1.json, target benchmarks/tts/service-handoff-profile-v1.json SHA256 1ec39e6bd45064bb8ddd65b43e5ffee76b5a546bb2766f11af2d9c0ee116a2d3. Parent SEGMENT_FIXTURE retains ../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json, target packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json SHA256 b57cf18ab2b6a922d9018f028a7b1002d2916b706f7b574299cb30f2f7600753.
Behavior invariants:
1. All production statements/declarations/signatures/visibility/frozen includes/content-free JSON unchanged. Same nine cases/order, exact runtime admission, release-locked unavailability, explicit restart/prepare, identities/termination, 5-second wait, 5-ms polling, 50-ms cleanup. Same one-unit consumer, Busy, zeroing on discard/release/Drop and dimensional/RTF bounds. run_host, diagnostic helpers, BoundedConsumer and result types remain outside cfg(test). Preserve three unconditional tts_service_handoff::tests identities: frozen_profile_builds_bounded_content_only_inside_the_native_request (sequence 7, exact segment/text/codepoint offsets); bounded_consumer_rejects_a_second_unit_and_zeroes_release (dispatch/Busy/release); content_safe_case_serialization_contains_no_segment_or_text_field (no text/segment/processId, zero publishedAudioUnits). Same private cfg(test), use super::*, assertions/literals/conditions. Qwen remains deferred, no model/support claim, all privacy/cancellation/locality/ownership/persistence invariants intact.
Forbidden changes:
1. Production/helper/caller/runtime-gate/profile/fixture/case-order/flags/timing/fields/identity/consumer/cleanup/test-name/assertion/cfg changes; abstractions/hooks/visibility/lib.rs/integration crates/path overrides/dependencies/manifests/generated/frozen/historical/unrelated/Git mutations.
Diff ceiling: Two files, 95 aggregate added/deleted lines (expected 87: parent -44/+1, child +42); parent 514 and child 42 lines.
Baseline evidence: NRTL-HANDOFF-BASELINE-01 PASS, HEAD f06c80e04da2025342b1002a548f03ca17e7cc0b, exact allowlist identities in immutable report; live HEAD/SHA/ABSENT and empty index rechecked before freezing.
Worker validation: Read-only diff/scope inspection only. No validation tests or whole-repository formatting.
Acceptance commands: Same three, exact names/results per feature with no mappings, unchanged production/assertions/parent include identities. Campaign aggregate gates retained; no model-backed handoff run required by relocation.
Completion output: Change Packet only; no staging, commit, push, branch, PR or publication.

Immutable order NRTL-HANDOFF-order-01, issued by director only after accepting audit and fresh independent baseline. Source writer and validator idle at issuance.
Baseline allowlist identity record:

[
  {
    "path": "apps/desktop/src-tauri/src/tts_service_handoff.rs",
    "status": [],
    "sha256": "705834ea94881c61954747bbf59957c3a8560b0baf1ade4359787858d5798351",
    "blob": "18b070187f3e4d1894485e3bad4796a0f07cd60f"
  },
  {
    "path": "apps/desktop/src-tauri/src/tts_service_handoff/tests.rs",
    "status": [],
    "sha256": "ABSENT",
    "blob": "ABSENT"
  }
]
