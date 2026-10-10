# APPROVED WORK ORDER

Target ID: NRTL-FRAMING
Goal: Apply the explicitly selected private Rust child-test layout while preserving all production and test behavior.
Risk: low
Allowed files: apps/desktop/src-tauri/src/tts_service_protocol.rs; apps/desktop/src-tauri/src/tts_service_protocol/tests.rs.
Required edits:
1. Replace wrapper with private #[cfg(test)] mod tests; move exact former body dedented once. Only include change: ../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-audio-metadata.json becomes ../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-audio-metadata.json. Same resolved fixture path, SHA256 e87baae6dfcaa348223e184ce8f0dba13fa4509a17f736f57abe3321069bedcd.
Behavior invariants:
1. Every production import/statement/signature/visibility/constant/type/error mapping unchanged: VLTP v1 12-byte framing, kinds 1/2, reserved byte, big-endian lengths, pre-allocation limits 16384/1920000 bytes and 480000 samples, duplicate-key/trailing-input rejection/canonical validation, metadata/alignment/finite float32-le validation. Same private cfg(test), imports and framed helper. Preserve four tests under tts_service_protocol::tests: rejects_declared_over_limit_before_reading_payload; strict_control_decoder_rejects_duplicate_keys; validates_exact_audio_and_rejects_non_finite_values; frame_round_trip_keeps_kind_and_payload. Same ResourceLimit/ProtocolRejected, duplicate-schemaVersion bytes, 19200 zero bytes then NaN mutation, kind/payload assertions. No new cfg/ignore/name, same runtime/privacy/cancellation/ownership/bounds/locator/persistence behavior.
Forbidden changes:
1. Production/caller/contract/fixture/assertion/literal/name/cfg/visibility changes; new abstraction/hooks, lib.rs, integration crates, path overrides, dependencies/manifests, generated/frozen/historical artifacts, unrelated cleanup, Git mutations.
Diff ceiling: Two files, 120 aggregate added/deleted lines (expected 111: parent -56/+1, child +54). Parent 300 lines, child 54.
Baseline evidence: NRTL-FRAMING-BASELINE-01 PASS, HEAD f06c80e04da2025342b1002a548f03ca17e7cc0b, exact allowlist identities in immutable report; live HEAD/SHA/ABSENT and empty index rechecked before freezing.
Worker validation: Read-only diff/scope inspection only. No validation tests or whole-repository formatting.
Acceptance commands: Same three, exact names/results in both modes, unchanged production/assertions/fixture target and bytes; no rename/omission/duplication/ignore/cfg changes allowed.
Completion output: Change Packet only; no staging, commit, push, branch, PR or publication.

Immutable order NRTL-FRAMING-order-01, issued by director only after accepting audit and fresh independent baseline. Source writer and validator idle at issuance.
Baseline allowlist identity record:

[
  {
    "path": "apps/desktop/src-tauri/src/tts_service_protocol.rs",
    "status": [],
    "sha256": "a9d02464362fca0f4c3c87fc6335c22934cede1ee102b97795e89814e870cf88",
    "blob": "c4aae1ecab74b88b1f6f6637a7c9cb935fe5fbeb"
  },
  {
    "path": "apps/desktop/src-tauri/src/tts_service_protocol/tests.rs",
    "status": [],
    "sha256": "ABSENT",
    "blob": "ABSENT"
  }
]
