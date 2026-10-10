# Validation Report
Report ID: NRTL-PROBE-POST-01
Target ID: NRTL-PROBE
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_protocol_probe.rs; apps/desktop/src-tauri/src/tts_protocol_probe/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_protocol_probe.rs: exact porcelain [ M apps/desktop/src-tauri/src/tts_protocol_probe.rs]; worktree SHA-256 34d4ef0d6aa747da044610511b7b3520d6f213b28107efd4c8f45976e1414e5c; filter-aware expected index blob 4338baa436e10a40388b440e52140c634dd126eb.
- apps/desktop/src-tauri/src/tts_protocol_probe/tests.rs: exact porcelain [?? apps/desktop/src-tauri/src/tts_protocol_probe/tests.rs]; worktree SHA-256 91fff29d071c9e271e991c7abfa0e62ccb7b30a0393e22e68508d5e85e9368bc; filter-aware expected index blob 6c3b777880b4e79f17537ebb8581cc4d28bec2f9.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.28s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.30s
Diff scope: PASS, Exactly approved parent and327line child, aggregate660 <=700, other source identities preserved relative to baseline.
Invariant review: PASS, Independent reconstruction proves unchanged production after removing only four test helpers and now-unused test-only wildcard import and externalizing private tests declaration. Frozen cfg(test) authority block byte-identical including line endings; SHA25632b1d4a63454afebc2ec39b15d6052935ea6560d45fe40e57d52f53cbec7d0c2 including closing newline. Child exactly equals original dedented289-line suite with four original38-line helpers inserted after imports; no fixtures.
Test-integrity review: PASS, All9 test identities, assertions, mutation/dimension/count/timeout tables preserved exactly; Cursor, use super::frozen_authority::* and use super::* retained. Production run_child/run_host/run_tts_protocol_probe and independent framing/process helpers remain outside cfg(test), no shared-authority consolidation. Exact collected names/results compared separately to NRTL-PROBE-BASELINE-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-PROBE-POST-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
