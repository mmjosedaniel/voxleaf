# Validation Report
Report ID: NRTL-CORE-POST-01
Target ID: NRTL-CORE
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_release_core.rs; apps/desktop/src-tauri/src/tts_release_core/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_release_core.rs: exact porcelain [ M apps/desktop/src-tauri/src/tts_release_core.rs]; worktree SHA-256 d7d7a341729c67343c316a7d36f78ba0dc7fba522af9031e3a89b118b685e1ad; filter-aware expected index blob f9ef9cfea3ec7afe3c4a999da5d5a0e42a990756.
- apps/desktop/src-tauri/src/tts_release_core/tests.rs: exact porcelain [?? apps/desktop/src-tauri/src/tts_release_core/tests.rs]; worktree SHA-256 b4d7f0f79cb08c81b0127bba034946048cf3a1164135e47e36a7b3ecaa62318a; filter-aware expected index blob 9d6485ee26632f7e91b04640748089b04b9509f0.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.33s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.31s
Diff scope: PASS, Exactly two approved source files, parent+1/-176 and child174, aggregate351 <=365. Every other native file preserved relative to baseline, no unexpected new source.
Invariant review: PASS, Independent exact-text comparison after newline normalization proves unchanged production prefix/TRUSTED_MANIFEST and private test declaration; exact174-line body dedented with only uv.lock include depth adjusted. Resolved lock SHA25627ea7e0701439689bbdbac8fc81867489b5ad0f0d1e0052e6cdeb938e505ff97 and production manifest SHA2563f1a2d311a5f7a857cb95402f3dbc187d42c5878c4208c9ebd12cb3b4dc7a27c verified unchanged.
Test-integrity review: PASS, All seven core test names/imports/assertions/mutations/helpers preserved. AtomicU64 temporary-root uniqueness, Drop cleanup, 2MiB0x07 payload and 256KiB-stack reference-digest test remain exact. No fixture, condition, visibility or runtime-helper change. Exact collected names/results compared separately to NRTL-CORE-BASELINE-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-CORE-POST-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
