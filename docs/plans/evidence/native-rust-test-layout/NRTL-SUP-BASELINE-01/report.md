# Validation Report
Report ID: NRTL-SUP-BASELINE-01
Target ID: NRTL-SUP
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_service_supervisor.rs; apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_service_supervisor.rs: exact porcelain []; worktree SHA-256 e339de585a0439d15dd879afd41fe364a0a68e57569cc027cc144b98e925b87d; filter-aware expected index blob 71c9a4c069a816989b264dfe9148e33ac03ec497.
- apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs: exact porcelain []; worktree SHA-256 ABSENT; filter-aware expected index blob ABSENT.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.29s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.30s
Diff scope: PASS, Both allowlisted paths clean, planned tests child ABSENT; existing host_diagnostics.rs excluded and unchanged, all prior accepted source preserved. Baseline only.
Invariant review: PASS, Original supervisor lifecycle and executable host_diagnostics module/reexport retained outside cfg(test). Existing diagnostic SHA2563ecfd77675db84bd9a1f98738a43bb095a9a54ad1dbd22ef928fbc12d2edea5d captured in native manifest. All five include occurrences retain original SHA256 targets per fixture-review.json.
Test-integrity review: PASS, Twelve source tests:11 default Windows and12 release-locked Windows. Reviewed Windows AtomicU32/static/failure helper cfg, SeqCst, injected Job Object failure/reap/OpenProcess/CloseHandle assertions, cache cleanup and release-only rejection test. Existing non-Windows execution and final native wiring gates remain outside this per-unit baseline. Exact collected names/results compared separately to NRTL-CB-POST-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-SUP-BASELINE-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
