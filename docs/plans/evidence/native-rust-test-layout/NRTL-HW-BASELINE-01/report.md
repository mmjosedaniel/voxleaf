# Validation Report
Report ID: NRTL-HW-BASELINE-01
Target ID: NRTL-HW
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/host_profile_detection.rs; apps/desktop/src-tauri/src/host_profile_detection/tests.rs; apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs
Validated path identities:
- apps/desktop/src-tauri/src/host_profile_detection.rs: exact porcelain []; worktree SHA-256 ae456cd4b1cbc4f2a606b533e4da23e580863119af376ea3d8ed263586f3e3c3; filter-aware expected index blob 64d383f801e5ffeba6fb426786efc7f22a8f86d4.
- apps/desktop/src-tauri/src/host_profile_detection/tests.rs: exact porcelain []; worktree SHA-256 ABSENT; filter-aware expected index blob ABSENT.
- apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs: exact porcelain []; worktree SHA-256 ABSENT; filter-aware expected index blob ABSENT.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.30s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.31s
Diff scope: PASS, Exactly three proposed paths clean; tests and windows_probe children ABSENT. All earlier accepted sources preserved. Baseline only.
Invariant review: PASS, Captured existing407-line Windows body, pub(super) WindowsHostProbe, parent report/port/normalization/admission ownership and all existing cfg gates. Reviewed trusted system32 nvcuda loading, RAII FreeLibrary, FFI,64-adapter bound and fail-closed mappings; original source retained for exact post comparison.
Test-integrity review: PASS, All15hardware tests run and pass in both feature modes, including live production_windows_probe_emits_only_the_bounded_report. Existing privacy scan uses17fragmented forbidden definitions and scans whole current owner; post must preserve those definitions and assert against all three resulting files unconditionally. Current normalization/threshold/guard/report assertions retained; no hardware-support promotion follows from this host result. Exact collected names/results compared separately to NRTL-PROBE-POST-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-HW-BASELINE-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
