# APPROVED WORK ORDER

Target ID: NRTL-CONTRACT
Goal: Apply the explicitly selected private Rust child-test layout while preserving all production and test behavior.
Risk: low
Allowed files: apps/desktop/src-tauri/src/tts_protocol_contract.rs; apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs.
Required edits:
1. Move both fixture tables, helper and four tests into child, add use super::*; replace parent test-only regions with private #[cfg(test)] mod tests;. Existing cfg(test) attributes may remain inside child. Adjust all eighteen include prefixes ../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/ to ../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/; preserve targets, bytes, kinds and order. Fixture identity list is the closed original eighteen entries for this source in initial-inventory.json.txt: valid-handshake, valid-load, valid-warm, valid-synthesize, valid-cancel, valid-health, valid-shutdown, valid-handshake-accepted, valid-state, valid-capabilities, valid-audio-metadata, valid-completed, valid-cancelled, valid-error, valid-protocol-rejected, invalid-unknown-field, invalid-unsupported-protocol, invalid-unknown-kind (all .json).
Behavior invariants:
1. Every production constant/import/signature/validator statement/closed field-kind-state-reason family/numeric-identity-text-audio bound/locator-range-book check/error/capability requirement unchanged. Fifteen valid fixture entries with same kinds/order and three invalid entries/order; all eighteen resolved fixture identities exactly as initial-inventory.json.txt, independently rehashed by auditor. Preserve helper/assertions: 512 emoji/2048 UTF8 bytes/audio arithmetic/private nested fields/cross-book/unknown audio field rejection. Only mappings allowed: tts_protocol_contract::<name> to tts_protocol_contract::tests::<name> for rust_fixture_surface_matches_every_closed_control_kind, rust_fixture_surface_rejects_shared_invalid_controls, rust_fixture_surface_keeps_frozen_maximum_arithmetic, rust_boundary_rejects_nested_narration_and_audio_drift. Same unconditional test attributes, no ignored/platform/feature additions; private cfg(test) child. All runtime/privacy/locality/ownership/bounds/persistence invariants unchanged.
Forbidden changes:
1. Production validators/constants/callers/fixture bytes-order-kinds/assertion/helper changes; namespace changes beyond four mappings; hooks/visibility/abstractions/lib.rs/integration crates/path overrides/dependencies/features/manifests/generated/frozen/historical/unrelated/Git mutations.
Diff ceiling: Two files, 385 aggregate changed lines; measured moved regions 176 lines, raw operation about 356 including import/declaration; 29-line spacing/rustfmt margin.
Baseline evidence: NRTL-CONTRACT-BASELINE-01 PASS, HEAD f06c80e04da2025342b1002a548f03ca17e7cc0b, exact allowlist identities in immutable report; live HEAD/SHA/ABSENT and empty index rechecked before freezing.
Worker validation: Read-only diff/scope inspection only. No validation tests or whole-repository formatting.
Acceptance commands: Same three; exact default/release identities/results allowing only four declared mappings; unchanged production tokens, all eighteen fixture targets/hashes/table entries and assertions; no omission/duplicate/ignore/cfg changes.
Completion output: Change Packet only; no staging, commit, push, branch, PR or publication.

Immutable order NRTL-CONTRACT-order-01, issued by director only after accepting audit and fresh independent baseline. Source writer and validator idle at issuance.
Baseline allowlist identity record:

[
  {
    "path": "apps/desktop/src-tauri/src/tts_protocol_contract.rs",
    "status": [],
    "sha256": "116e2b08b796c548eaaa237c57a1fec42d284bdc5839c7a84c764321c3a73290",
    "blob": "3b446af96742db8ad02bebdf664a244c4c52d4ee"
  },
  {
    "path": "apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs",
    "status": [],
    "sha256": "ABSENT",
    "blob": "ABSENT"
  }
]
