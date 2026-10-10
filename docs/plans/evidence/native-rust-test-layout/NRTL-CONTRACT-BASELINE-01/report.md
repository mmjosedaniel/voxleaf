# Validation Report
Report ID: NRTL-CONTRACT-BASELINE-01
Target ID: NRTL-CONTRACT
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_protocol_contract.rs; apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_protocol_contract.rs: exact porcelain []; worktree SHA-256 116e2b08b796c548eaaa237c57a1fec42d284bdc5839c7a84c764321c3a73290; filter-aware expected index blob 3b446af96742db8ad02bebdf664a244c4c52d4ee.
- apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs: exact porcelain []; worktree SHA-256 ABSENT; filter-aware expected index blob ABSENT.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.30s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.29s
Diff scope: PASS, Both allowlisted paths clean, child ABSENT, earlier accepted source unchanged. Baseline retains original root test identities; no mapping applied yet.
Invariant review: PASS, Original production constants/validator body captured. All18 include targets independently rehashed and match initial immutable inventory, per fixture-review.json:15 valid and3 invalid entries, same kinds/order.
Test-integrity review: PASS, Four original root tests and helper reviewed:closed kind coverage, invalid controls,512emoji/2048UTF8 byte arithmetic,480000samples/1920000bytes, nested private text/cross-book/unknown audio field rejection. Only future post-change permits the four explicit root-to-tests namespace mappings; no other renames allowed. Exact collected names/results compared separately to NRTL-SUP-POST-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-CONTRACT-BASELINE-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
