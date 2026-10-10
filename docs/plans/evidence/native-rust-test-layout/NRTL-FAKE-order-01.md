# APPROVED WORK ORDER

Target ID: NRTL-FAKE
Goal: Apply the explicitly selected private Rust child-test layout while preserving all production and test behavior.
Risk: low
Allowed files: apps/desktop/src-tauri/src/tts_service_fake_child.rs; apps/desktop/src-tauri/src/tts_service_fake_child/tests.rs.
Required edits:
1. Replace wrapper with private #[cfg(test)] mod tests; move exact70-linebody dedented once. Only include_str ../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json becomes ../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json. Same resolved packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json, SHA256 b57cf18ab2b6a922d9018f028a7b1002d2916b706f7b574299cb30f2f7600753.
Behavior invariants:
1. All production declarations/statements/scenario and argument constants/Scenario::from_argument/protocol order/identities/4800samples/19200bytes/float values/75msdelay/pending cancellation and shutdown/crash/descendant stdio and300slifetime unchanged. run_child, run_descendant, run_child_with and all production helpers remain executable outside cfg(test), same signatures/visibility/errors. Same private cfg(test), imports, command helper and one tts_service_fake_child::tests::normal_child_emits_canonical_ordered_complete_unit test: handshake/load/warm/synthesize/shutdown input order, Normal execution/frame decoding, consecutive audioMetadata/audio/completed window and final state assertion. Same fixture/assertion/name/cfg/ignore state and privacy/locality/audio/cancellation/ownership/bounds/locator/persistence behavior.
Forbidden changes:
1. Production/helper/diagnostic/caller/cfg/scenario/protocol/identity/timing/cleanup/assertion/name/fixture/visibility changes; abstraction/hooks/lib.rs/integration crates/path overrides/dependencies/manifests/generated/frozen/historical artifacts/unrelated cleanup/Git mutations.
Diff ceiling: Two files155aggregate changed lines(expected143: parent-72/+1 child+70), parent337 child70 allowing necessary rustfmt wrapping.
Baseline evidence: NRTL-FAKE-BASELINE-01 PASS, HEAD f06c80e04da2025342b1002a548f03ca17e7cc0b, exact allowlist identities in immutable report; live HEAD/SHA/ABSENT and empty index rechecked before freezing.
Worker validation: Read-only diff/scope inspection only. No validation tests or whole-repository formatting.
Acceptance commands: Same three, exact identities/results per config with no changes, production/test/assertion/fixture equivalence. Campaign check/native-startup cover executable diagnostics; no additional per-unit gate justified.
Completion output: Change Packet only; no staging, commit, push, branch, PR or publication.

Immutable order NRTL-FAKE-order-01, issued by director only after accepting audit and fresh independent baseline. Source writer and validator idle at issuance.
Baseline allowlist identity record:

[
  {
    "path": "apps/desktop/src-tauri/src/tts_service_fake_child.rs",
    "status": [],
    "sha256": "f3ec7d102b499f8416ef1588cf337bca56d4b3cd83bbf3d1d226c4e19d7a8ae5",
    "blob": "72b4a5991f0e67392b0080125778dbf64e3d2d18"
  },
  {
    "path": "apps/desktop/src-tauri/src/tts_service_fake_child/tests.rs",
    "status": [],
    "sha256": "ABSENT",
    "blob": "ABSENT"
  }
]
