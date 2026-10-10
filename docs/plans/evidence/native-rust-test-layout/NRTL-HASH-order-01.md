# APPROVED WORK ORDER

Target ID: NRTL-HASH
Goal: Separate the existing SHA unit-test body into a private child file while preserving production and test behavior.
Risk: low
Allowed files: apps/desktop/src-tauri/src/sha256_hex.rs; apps/desktop/src-tauri/src/sha256_hex/tests.rs.
Required edits:
1. Replace only the inline tests module wrapper with private #[cfg(test)] mod tests; retain its existing attribute.
2. Create sha256_hex/tests.rs with the exact former 26-line body dedented once, retaining imports, attributes, vectors, order and assertions.
Behavior invariants:
1. Production import, encode_sha256 signature/body/visibility and callers unchanged; 64 lowercase digits, byte order, leading zeroes and allocation retained.
2. Exactly one sha256_hex::tests::preserves_known_sha256_values_and_leading_zeroes test, four unchanged reference vectors and assert_eq, same cfg(test), no new conditions or fixtures.
3. All runtime/privacy/process/bounds/persistence contracts unchanged.
Forbidden changes:
1. Production/caller/assertion/vector/name/visibility/dependency/manifest/frozen-authority changes, public hooks, path overrides, lib.rs, integration targets, unrelated edits, historical evidence edits, Git mutations.
Diff ceiling: Two files, at most 60 aggregate added/deleted lines (expected 55).
Baseline evidence: NRTL-HASH-BASELINE-01 PASS, HEAD f06c80e04da2025342b1002a548f03ca17e7cc0b, unchanged identities, clean index/worktree, all three Rust scripts exit 0, 87 default and 88 release tests pass. Parent SHA256 427bd48feee99c62afc9cd9ee06d4a21af7d53dabf3e688342dbcf1601795fa6, filter-aware blob 4822b8e76a7f648c5e8be924f5fa9ab9c670aaab; child ABSENT.
Worker validation: Read-only diff check/scope inspection only; no test or formatting runs.
Acceptance commands: pnpm.cmd format:check:rust; pnpm.cmd lint:rust; pnpm.cmd test:rust, independent validator, repository root in local PowerShell outside sandbox; exact test identities/results and cfg/assertion comparison in both modes, no renames.
Completion output: Change Packet only; no commit or push.

Immutable order NRTL-HASH-order-01. Director issued after accepting fresh audit and baseline; no source writers or validator active at issuance.
