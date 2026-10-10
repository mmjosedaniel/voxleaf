# Validation Report
Report ID: NRTL-HASH-POST-01
Target ID: NRTL-HASH
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/sha256_hex.rs; apps/desktop/src-tauri/src/sha256_hex/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/sha256_hex.rs: exact porcelain ' M apps/desktop/src-tauri/src/sha256_hex.rs'; worktree SHA-256 6d78277864124209819a3038c675238652e1ebe8a4497ee09b02c18849d1b060; filter-aware expected index blob 6d5493ebf6414cfd9c11fb8cd908915f1a08feee.
- apps/desktop/src-tauri/src/sha256_hex/tests.rs: exact porcelain '?? apps/desktop/src-tauri/src/sha256_hex/tests.rs'; worktree SHA-256 ebb0c5f415220af07b2144e092b2482f2c770149ce101242a690b80265e148f0; filter-aware expected index blob 38da5d9f870d3999a1109c1899a70f112d40000b.
Identity recheck: PASS, HEAD and closed-path identities unchanged before/after commands; complete native source manifest unchanged during execution; index empty before/after.
Commands and outcomes:
1. pnpm.cmd format:check:rust -> exit 0; Rust formatting check passed.
2. pnpm.cmd lint:rust -> exit 0; default and release-locked-runtime all-target clippy passed with -D warnings.
3. pnpm.cmd test:rust -> exit 0; default 87 passed; release-locked-runtime 88 passed; each has zero failures, ignores or filtered tests. Exact names/results equal NRTL-HASH-BASELINE-01 separately in both configurations, with zero duplicate identities.
4. git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
Diff scope: PASS, only the two approved source paths changed: parent +1/-28 and 26-line new child, 55 aggregate added/deleted lines within ceiling 60. All fourteen other initial Rust files match their captured original SHA256. Director-authored plan/evidence documentation remains unstaged outside this source order and is excluded from this unit's acceptance.
Invariant review: PASS, independent normalized-line-ending comparison proves the production prefix byte-for-byte text unchanged and the only parent replacement is private mod tests; under the same cfg(test). Child equals the exact original test body dedented once. No visibility, caller, API, bounds, allocation, namespace, fixture, dependency, runtime or authority change.
Test-integrity review: PASS, same single sha256_hex::tests::preserves_known_sha256_values_and_leading_zeroes test and four ordered known-answer vectors, imports and assert_eq. All collected identities/results match baseline, including live Windows hardware and process tests. Two existing cfg(unix) cases remain unexecuted on this Windows host; no non-Windows claim is made.
Privacy/artifact review: PASS, scoped source patch contains only the existing test relocation; no prohibited artifacts, generated source, books, audio, models, secrets or dynamic private data introduced. Original fixture/authority/excluded-file bytes remain unchanged.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-HASH-POST-01 contains immutable before.json, after.json, results.json, source-review.json, test-identities.json, test-comparison.json and raw logs. Source review compares against the initial immutable source copy; test comparison consumes NRTL-HASH-BASELINE-01. Acceptance used verified pnpm 11.15.1 via process-local Corepack PATH and rustc 1.97.1. No Git mutation is authorized by this report.
