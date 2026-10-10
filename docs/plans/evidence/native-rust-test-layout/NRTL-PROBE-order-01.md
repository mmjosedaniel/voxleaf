# APPROVED WORK ORDER

Target ID: NRTL-PROBE
Goal: Apply the explicitly selected private Rust child-test layout while preserving all production and test behavior.
Risk: low
Allowed files: apps/desktop/src-tauri/src/tts_protocol_probe.rs; apps/desktop/src-tauri/src/tts_protocol_probe/tests.rs.
Required edits:
1. Replace inline wrapper with private #[cfg(test)] mod tests; move exact 289-line body dedented once and four test-only helpers into child, preserving logic/imports. Remove only now-unused parent #[cfg(test)] use frozen_authority::* and boundary spacing. Keep frozen authority in place. Helper cfg attributes may remain in child. No fixture includes.
Behavior invariants:
1. Entire parent #[cfg(test)] mod frozen_authority block lines30-56 byte-for-byte unchanged including line endings, cfg and values; auditor SHA256 including closing-line newline 32b1d4a63454afebc2ec39b15d6052935ea6560d45fe40e57d52f53cbec7d0c2 (initial inventory records its own exact captured boundary separately). All production declarations/statements/imports/independent VLTP/preallocation/metadata/identity/finite audio/4800samples/19200bytes/5second timeout/5ms polling/single probe/zero queue/guard/kill-wait-join/nullstderr/staticerrors/binaryresponse unchanged. run_child, run_host, run_tts_protocol_probe and runtime helpers remain outside cfg(test). Preserve Cursor, use super::frozen_authority::*, use super::*, frame_bytes, declared_frame and four moved helper bodies. Nine same unconditional tests under tts_protocol_probe::tests: accepts_exact_control_and_audio_payload_limits; rejects_maximum_plus_one_before_reading_a_payload; rejects_below_minimum_payload_lengths_before_allocation; rejects_partial_unknown_or_mutated_headers; rejects_truncated_payloads_without_partial_publication; accepts_only_the_active_complete_identity_and_finite_audio; exposes_only_fixed_content_free_failure_codes; freezes_exact_and_maximum_plus_one_authority_dimensions; rejects_a_second_active_probe_without_queueing. All assertions/mutations/dimension-timeout tables/cfg intact, no ignores/features/platform additions; runtime/privacy/locality/ownership/persistence unchanged.
Forbidden changes:
1. Frozen block/production framing-process-diagnostics-callers/runtime helpers/assertions/names/cfg/visibility changes; consolidation with production protocol, hooks/abstractions/lib.rs/integration crates/path overrides/dependencies/manifests/generated/historical/frozen/unrelated/Git mutations.
Diff ceiling: Two files, 700 aggregate changed lines; approximately 332 parent deletions plus one declaration and 327 child lines =660, 40-line spacing/rustfmt margin; parent approximately353.
Baseline evidence: NRTL-PROBE-BASELINE-01 PASS, HEAD f06c80e04da2025342b1002a548f03ca17e7cc0b, exact allowlist identities in immutable report; live HEAD/SHA/ABSENT and empty index rechecked before freezing.
Worker validation: Read-only diff/scope inspection only. No validation tests or whole-repository formatting.
Acceptance commands: Same three; exact identities/results in both features with no mapping; protected raw block hash, unchanged production tokens, helper equivalence/assertions and retained executable diagnostics; campaign final gates remain.
Completion output: Change Packet only; no staging, commit, push, branch, PR or publication.

Immutable order NRTL-PROBE-order-01, issued by director only after accepting audit and fresh independent baseline. Source writer and validator idle at issuance.
Baseline allowlist identity record:

[
  {
    "path": "apps/desktop/src-tauri/src/tts_protocol_probe.rs",
    "status": [],
    "sha256": "8c0d1446ded02795e3dd3b788adf18f61e721070ed81e1c7142c3634dc1ec3da",
    "blob": "68282b4388d07db800185068ac3a5ee7c06f50da"
  },
  {
    "path": "apps/desktop/src-tauri/src/tts_protocol_probe/tests.rs",
    "status": [],
    "sha256": "ABSENT",
    "blob": "ABSENT"
  }
]
