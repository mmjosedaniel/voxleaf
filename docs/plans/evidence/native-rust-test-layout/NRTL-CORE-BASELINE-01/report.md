# Validation Report
Report ID: NRTL-CORE-BASELINE-01
Target ID: NRTL-CORE
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_release_core.rs; apps/desktop/src-tauri/src/tts_release_core/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_release_core.rs: exact porcelain []; worktree SHA-256 b663a7f1b4a79ff9a119e1f336511739a006028740db39c57cfa5a2c782949b8; filter-aware expected index blob 77be00e9095ee24008bcf0066badf257ee479a30.
- apps/desktop/src-tauri/src/tts_release_core/tests.rs: exact porcelain []; worktree SHA-256 ABSENT; filter-aware expected index blob ABSENT.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.32s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.30s
Diff scope: PASS, Both allowlisted paths clean, child ABSENT, prior accepted HASH and FRAMING source preserved. Baseline only, no implementation acceptance.
Invariant review: PASS, Original production verifier/imports/authority/error/heap-buffer declarations retained. Both included files verified fresh: core uv.lock SHA25627ea7e0701439689bbdbac8fc81867489b5ad0f0d1e0052e6cdeb938e505ff97; runtime-manifest-v1.json SHA2563f1a2d311a5f7a857cb95402f3dbc187d42c5878c4208c9ebd12cb3b4dc7a27c. Production TRUSTED_MANIFEST inclusion stays in parent.
Test-integrity review: PASS, Seven core tests retained, including lock/authority, exact payload, mutations, unsafe paths, content-free errors and 256KiB-stack/2MiB payload hashing. Reviewed original AtomicU64/TestRoot/Drop cleanup and synthetic fixture helpers; no test edits at baseline. Exact collected names/results compared separately to NRTL-FRAMING-POST-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-CORE-BASELINE-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
