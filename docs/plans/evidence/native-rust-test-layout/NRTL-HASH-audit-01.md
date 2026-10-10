# Audit Packet

Target ID: NRTL-HASH
Decision: CHANGE
Risk: low
Primary target: apps/desktop/src-tauri/src/sha256_hex.rs private tests module.
Related context: main.rs module declaration; release-core and Chatterbox digest-verification callers, inspected read-only by clean_code_auditor (GPT-6.1 Sol high).
Concrete evidence: Current owner is 41 lines; inline wrapper lines 14-41 contains 26 body lines. Destination absent. Explicit user-selected private-child layout improves navigation without redesigning the shared helper; historical production-organization SKIP does not cancel this decision.
Behavior invariants: Production import, pub(crate) encode_sha256 signature/body, 64 lowercase digits, byte order, leading zeroes and bounded allocation unchanged. One test identity sha256_hex::tests::preserves_known_sha256_values_and_leading_zeroes, same four vectors, order and assert_eq; same imports and cfg(test), no new conditions. No fixture includes. Existing callers and all runtime/privacy/ownership contracts unchanged.
Allowed files: apps/desktop/src-tauri/src/sha256_hex.rs; apps/desktop/src-tauri/src/sha256_hex/tests.rs.
Proposed edits: Replace inline wrapper with private #[cfg(test)] mod tests; move exact former 26-line body to child, dedented once.
Forbidden edits: Production/caller/assertion/vector/test-identity/visibility/dependency/manifest/authority changes; public hooks, path overrides, lib.rs, integration targets, unrelated cleanup, historical evidence edits, any Git mutation.
Diff ceiling: Two files, 60 aggregate added/deleted lines; expected 55, parent 14 lines, child 26.
Baseline commands: pnpm.cmd format:check:rust; pnpm.cmd lint:rust; pnpm.cmd test:rust, repository root, local PowerShell outside sandbox.
Post-change commands: Same three; exact identities/results separately for default and release-locked-runtime, no rename/omission/duplication/new ignore or condition change.
Documentation impact: Campaign closeout testing.md and agentic-refactoring.md, outside source allowlist; system diagram review, no runtime architecture change expected.
Decision required: none. Independent passing fresh baseline required before Work Order.

Director accepted this audit before requesting baseline. Execution HEAD: f06c80e04da2025342b1002a548f03ca17e7cc0b; initially clean index/worktree. This packet grants no implementation permission by itself.
