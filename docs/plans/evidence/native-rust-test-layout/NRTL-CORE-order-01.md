# APPROVED WORK ORDER

Target ID: NRTL-CORE
Goal: Apply the explicitly selected private Rust child-test layout while preserving all production and test behavior.
Risk: low
Allowed files: apps/desktop/src-tauri/src/tts_release_core.rs; apps/desktop/src-tauri/src/tts_release_core/tests.rs.
Required edits:
1. Private #[cfg(test)] mod tests; exact174-line former body dedented once. Moved include_bytes ../../../../services/tts/release/core/uv.lock becomes ../../../../../services/tts/release/core/uv.lock; resolved target services/tts/release/core/uv.lock SHA25627ea7e0701439689bbdbac8fc81867489b5ad0f0d1e0052e6cdeb938e505ff97. Production TRUSTED_MANIFEST include remains unchanged; target services/tts/release/core/runtime-manifest-v1.json SHA2563f1a2d311a5f7a857cb95402f3dbc187d42c5878c4208c9ebd12cb3b4dc7a27c.
Behavior invariants:
1. All production declarations/statements/pub(crate) interfaces unchanged: strict authority/installed-manifest equality/closed file set/canonical containment/symlink and path rejection/size and digest validation/checked totals/bilingual mapping/Invalid and Unavailable errors/heap1MiB hashing buffer. Same cfg(test), imports, AtomicU64 counter, temporary-root naming and Drop cleanup, synthetic bytes. Seven same tests under tts_release_core::tests: tracked_manifest_matches_core_lock_and_native_authority; accepts_only_the_exact_manifest_and_payload; rejects_truncated_substituted_and_stale_payloads; rejects_changed_installed_manifest_and_unknown_profile; rejects_unsafe_manifest_paths; io_errors_remain_content_free; hashes_the_packaged_payload_without_a_large_stack_allocation. Preserve every assertion/mutation, davefx/path assertions, lock equality/rejection, four payload mutations, three unsafe paths, exact Invalid text, 2MiB0x07/256KiBthread-stack/digest case. No cfg/ignore/name/cleanup/runtime/privacy/ownership/persistence changes.
Forbidden changes:
1. Production/caller/fixture/manifest/lock/assertion/test-identity/cfg/cleanup/visibility changes; hooks/abstractions/lib.rs/integration crates/path overrides/dependencies/generated/frozen/historical artifacts/unrelated cleanup/Git mutations.
Diff ceiling: Two files,365aggregate changed lines (expected351: parent-176/+1, child+174), parent309/child174 subject only to necessary rustfmt wrapping of moved include.
Baseline evidence: NRTL-CORE-BASELINE-01 PASS, HEAD f06c80e04da2025342b1002a548f03ca17e7cc0b, exact allowlist identities in immutable report; live HEAD/SHA/ABSENT and empty index rechecked before freezing.
Worker validation: Read-only diff/scope inspection only. No validation tests or whole-repository formatting.
Acceptance commands: Same three, exact collected names/results per feature with no remapping, production/assertion/cleanup/include/hash comparison.
Completion output: Change Packet only; no staging, commit, push, branch, PR or publication.

Immutable order NRTL-CORE-order-01, issued by director only after accepting audit and fresh independent baseline. Source writer and validator idle at issuance.
Baseline allowlist identity record:

[
  {
    "path": "apps/desktop/src-tauri/src/tts_release_core.rs",
    "status": [],
    "sha256": "b663a7f1b4a79ff9a119e1f336511739a006028740db39c57cfa5a2c782949b8",
    "blob": "77be00e9095ee24008bcf0066badf257ee479a30"
  },
  {
    "path": "apps/desktop/src-tauri/src/tts_release_core/tests.rs",
    "status": [],
    "sha256": "ABSENT",
    "blob": "ABSENT"
  }
]
