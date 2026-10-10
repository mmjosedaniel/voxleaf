# Validation Report
Report ID: NRTL-FRAMING-BASELINE-01
Target ID: NRTL-FRAMING
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_service_protocol.rs; apps/desktop/src-tauri/src/tts_service_protocol/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_service_protocol.rs: exact porcelain []; worktree SHA-256 a9d02464362fca0f4c3c87fc6335c22934cede1ee102b97795e89814e870cf88; filter-aware expected index blob c4aae1ecab74b88b1f6f6637a7c9cb935fe5fbeb.
- apps/desktop/src-tauri/src/tts_service_protocol/tests.rs: exact porcelain []; worktree SHA-256 ABSENT; filter-aware expected index blob ABSENT.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.35s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.33s
Diff scope: PASS, Both proposed paths clean, child ABSENT; earlier accepted HASH changes preserved, index empty. Baseline authorizes no implementation by itself.
Invariant review: PASS, Current production framing, limits, strict control decoder and finite audio validation retained as baseline. Original 54-line test body and all imports/helpers/assertions captured. Fixture resolves to packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-audio-metadata.json; fresh SHA256 e87baae6dfcaa348223e184ce8f0dba13fa4509a17f736f57abe3321069bedcd agrees with initial inventory.
Test-integrity review: PASS, Four current tts_service_protocol::tests identities passed in both configurations, including over-limit preallocation rejection, duplicate-key rejection, exact audio/NaN rejection and framed roundtrip; assertions and condition remain original. Exact collected names/results compared separately to NRTL-HASH-POST-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-FRAMING-BASELINE-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
