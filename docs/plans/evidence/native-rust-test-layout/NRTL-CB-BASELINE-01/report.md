# Validation Report
Report ID: NRTL-CB-BASELINE-01
Target ID: NRTL-CB
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_optional_chatterbox.rs; apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_optional_chatterbox.rs: exact porcelain []; worktree SHA-256 8966b977a42213e3b0f374aa49fac57124bb4583568982cf138c12354bf329b7; filter-aware expected index blob 357b764ff987c0b368502fd3c56f7549dbc118ed.
- apps/desktop/src-tauri/src/tts_optional_chatterbox/tests.rs: exact porcelain []; worktree SHA-256 ABSENT; filter-aware expected index blob ABSENT.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.32s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.28s
Diff scope: PASS, Both allowlisted paths clean, child ABSENT, all prior accepted source preserved. Baseline only.
Invariant review: PASS, Original production ownership and 987-line suite captured. All five include occurrences resolve to unchanged SHA256 targets in fixture-review.json: two v2 manifest test includes and three production includes. Production mutation/verification/cleanup/cache/installed-state locks remain unchanged.
Test-integrity review: PASS, 30 Chatterbox test functions:28 executed on Windows in both modes and2 cfg(unix) cases retained but unexecuted. Reviewed atomic temporary-root uniqueness/Drop cleanup, two workers/three-party Barrier and joins, receipt invalidation, Unix symlink boundaries and content-safe synthetic fixtures. No installed-model journey, real download or performance claim. Exact collected names/results compared separately to NRTL-HANDOFF-POST-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-CB-BASELINE-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
