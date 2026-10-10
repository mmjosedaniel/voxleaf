# Validation Report
Report ID: NRTL-HW-POST-01
Target ID: NRTL-HW
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/host_profile_detection.rs; apps/desktop/src-tauri/src/host_profile_detection/tests.rs; apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs
Validated path identities:
- apps/desktop/src-tauri/src/host_profile_detection.rs: exact porcelain [ M apps/desktop/src-tauri/src/host_profile_detection.rs]; worktree SHA-256 dea38d7bcd326cecd10061fff371c95513bebca4e518c3cd438c476997589551; filter-aware expected index blob a4c264a24f60ac1384d32366e445b02958cc358f.
- apps/desktop/src-tauri/src/host_profile_detection/tests.rs: exact porcelain [?? apps/desktop/src-tauri/src/host_profile_detection/tests.rs]; worktree SHA-256 9b7c555b379fd00699ae93ed218395b16797022b73a1a850f85139422fa3318f; filter-aware expected index blob aaebd07b3dd9c7700bfe3c90cfd86396eaaa3884.
- apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs: exact porcelain [?? apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs]; worktree SHA-256 6c8edee5637c864caa31a54ef813845d26e080e6387907ff4df72b136eb8d60e; filter-aware expected index blob 466c6c5658c1af8cb9c84eeefa1b204256250830.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.31s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.32s
Diff scope: PASS, Exactly three approved files,parent+2/-995,590line tests and405line Windows child,total1992 <=2150. All other native identities retained.
Invariant review: PASS, Independent reconstruction proves parent exact after only module extraction. Windows child retains all2779tokens including FFI/imports/pub(super)/system32 load/RAII cleanup/adapter bounds/fail-closed mappings; manual diff contains only3whitespace wrapping hunks. Parent retains report/port/normalization/admission/non-Windows/guard/Tauri ownership and cfg gates.
Test-integrity review: PASS, Tests child exactly original dedented suite except authorized source-scan extension. All17fragmented forbidden definitions byte-identical; unconditional includes resolve parent,Windows child and tests child; nested loops apply unchanged assertion to all3sources,zero forbidden matches. Same15hardware identities and conditions,all pass in both feature modes including liveWindows probe. No host-support promotion or non-Windows execution claim. Exact collected names/results compared separately to NRTL-HW-BASELINE-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-HW-POST-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
