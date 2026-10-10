# Validation Report
Report ID: NRTL-CB-POST-01
Target ID: NRTL-CB
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_optional_chatterbox.rs; apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_optional_chatterbox.rs: exact porcelain [ M apps/desktop/src-tauri/src/tts_optional_chatterbox.rs]; worktree SHA-256 e525734297ce7cf8b437e5fc50b75a9f6d680ca6fc56707ee36acae5caf45ecf; filter-aware expected index blob 8cc8be9ddcdd7b676b0743b3cbb6b8ecc2d74513.
- apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs: exact porcelain [?? apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs]; worktree SHA-256 e0c1dad918fe95b11ed38d8739a16650ee27fefe3c7beaa6d0212b9e2059d8df; filter-aware expected index blob 2cf45dc8c74b27a4a68b12dd2c0cc904045df7b2.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.32s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.29s
Diff scope: PASS, Exactly parent+child, parent+1/-989 and986line child; aggregate1976 <=2150. All other native identities preserved relative to baseline.
Invariant review: PASS, Production prefix exact after newline normalization, including three production includes and installed-runtime locks. Initial strict body comparison flags approved reflow; independent reconstruction plus manual five-hunk diff and literal-preserving token comparison in reflow-review.json prove only include-depth and whitespace wrapping changes. All five fixture occurrences retain original resolved targets and hashes.
Test-integrity review: PASS, All30 source tests retained,28 Windows-executed and2 cfg(unix) cases unchanged. Same assertions/literals/imports/TestRoot atomic uniqueness/Drop cleanup/concurrency Barrier and joins/receipt invalidation. Both moved v2 manifests preserve SHA2568242bfd841a8aed01dc914c743df69b90a4ed8e13883ea03a6568b0d3e92d25d. No real download/model journey/performance claim. Exact collected names/results compared separately to NRTL-CB-BASELINE-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-CB-POST-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
