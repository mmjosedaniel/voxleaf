# Validation Report
Report ID: NRTL-SUP-POST-01
Target ID: NRTL-SUP
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_service_supervisor.rs; apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_service_supervisor.rs: exact porcelain [ M apps/desktop/src-tauri/src/tts_service_supervisor.rs]; worktree SHA-256 c153948b3681d2f5538053c62e247c221ecbe8d3950b0132924f6ce51d53c5dd; filter-aware expected index blob aed2d4cc6544428b5e76d80e7465d5549fc6a2d6.
- apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs: exact porcelain [?? apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs]; worktree SHA-256 853e06deec2013d72696f893d15aba86f2baeedb08236130b85e2c5e0d62754b; filter-aware expected index blob 1099ae86295ff062b4574c5845701dcd1d6e1ad4.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.31s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.32s
Diff scope: PASS, Exactly two approved source paths,parent+1/-301 and299line child,aggregate601 <=650. Every other native path including host_diagnostics.rs preserved relative to baseline.
Invariant review: PASS, Production prefix unchanged, retaining lifecycle, executable diagnostics module/reexport and production includes. Strict body equality identifies approved wrapping; independently reconstructed child plus manual two-hunk diff and1802-token equality prove only fixture include-depth and whitespace changes. Five fixture occurrences retain original target hashes; host diagnostic SHA2563ecfd77675db84bd9a1f98738a43bb095a9a54ad1dbd22ef928fbc12d2edea5d unchanged.
Test-integrity review: PASS, All12 source tests and all conditions preserved:11 run under default Windows,12 under release-locked Windows. Exact imports/AtomicU32/static/failure-injection helper cfg, SeqCst, Job Object failure/reap/CloseHandle, private interpreter/environment assertions and cache cleanup retained. No runtime helper moved under cfg(test). Exact collected names/results compared separately to NRTL-SUP-BASELINE-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-SUP-POST-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
