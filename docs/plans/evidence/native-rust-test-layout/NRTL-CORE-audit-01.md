# Audit Packet
Target ID: NRTL-CORE
Decision: CHANGE
Risk: low
Primary target: apps/desktop/src-tauri/src/tts_release_core.rs::tests, COUNTER, TestRoot, write_test_package and seven tests.
Related context: supervisor ServiceChild::piper, SHA helper, main module declaration, trusted core manifest/lock. Audited read-only by clean_code_auditor (GPT-6.1 Sol high).
Concrete evidence: Owner 484 lines, wrapper309-484, body174lines, child absent. Explicit user-selected private-child layout preserves verifier ownership/private access.
Behavior invariants: All production declarations/statements/pub(crate) interfaces unchanged: strict authority/installed-manifest equality/closed file set/canonical containment/symlink and path rejection/size and digest validation/checked totals/bilingual mapping/Invalid and Unavailable errors/heap1MiB hashing buffer. Same cfg(test), imports, AtomicU64 counter, temporary-root naming and Drop cleanup, synthetic bytes. Seven same tests under tts_release_core::tests: tracked_manifest_matches_core_lock_and_native_authority; accepts_only_the_exact_manifest_and_payload; rejects_truncated_substituted_and_stale_payloads; rejects_changed_installed_manifest_and_unknown_profile; rejects_unsafe_manifest_paths; io_errors_remain_content_free; hashes_the_packaged_payload_without_a_large_stack_allocation. Preserve every assertion/mutation, davefx/path assertions, lock equality/rejection, four payload mutations, three unsafe paths, exact Invalid text, 2MiB0x07/256KiBthread-stack/digest case. No cfg/ignore/name/cleanup/runtime/privacy/ownership/persistence changes.
Allowed files: apps/desktop/src-tauri/src/tts_release_core.rs; apps/desktop/src-tauri/src/tts_release_core/tests.rs.
Proposed edits: Private #[cfg(test)] mod tests; exact174-line former body dedented once. Moved include_bytes ../../../../services/tts/release/core/uv.lock becomes ../../../../../services/tts/release/core/uv.lock; resolved target services/tts/release/core/uv.lock SHA25627ea7e0701439689bbdbac8fc81867489b5ad0f0d1e0052e6cdeb938e505ff97. Production TRUSTED_MANIFEST include remains unchanged; target services/tts/release/core/runtime-manifest-v1.json SHA2563f1a2d311a5f7a857cb95402f3dbc187d42c5878c4208c9ebd12cb3b4dc7a27c.
Forbidden edits: Production/caller/fixture/manifest/lock/assertion/test-identity/cfg/cleanup/visibility changes; hooks/abstractions/lib.rs/integration crates/path overrides/dependencies/generated/frozen/historical artifacts/unrelated cleanup/Git mutations.
Diff ceiling: Two files,365aggregate changed lines (expected351: parent-176/+1, child+174), parent309/child174 subject only to necessary rustfmt wrapping of moved include.
Baseline commands: pnpm.cmd format:check:rust; pnpm.cmd lint:rust; pnpm.cmd test:rust, root local PowerShell outside sandbox.
Post-change commands: Same three, exact collected names/results per feature with no remapping, production/assertion/cleanup/include/hash comparison.
Documentation impact: Campaign testing/navigation closeout, outside source allowlist; no architecture change.
Decision required: none. FRAMING acceptance and fresh passing independent baseline required before implementation.
