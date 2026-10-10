# Validation Report
Report ID: NRTL-FRAMING-POST-01
Target ID: NRTL-FRAMING
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_service_protocol.rs; apps/desktop/src-tauri/src/tts_service_protocol/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_service_protocol.rs: exact porcelain [ M apps/desktop/src-tauri/src/tts_service_protocol.rs]; worktree SHA-256 a8895ec9f5c569569c5cc37de451d37304822731e565c94a1665d080ce426617; filter-aware expected index blob d3fac47c4985d6cc6ac0e5663fc971d506a2cc49.
- apps/desktop/src-tauri/src/tts_service_protocol/tests.rs: exact porcelain [?? apps/desktop/src-tauri/src/tts_service_protocol/tests.rs]; worktree SHA-256 245872478d849a4084e4005a75f60203df8b18b3cca23c06148d0f733ec046c1; filter-aware expected index blob 52c719dc1dae467c8dd68398ecb2154946079d42.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.33s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.29s
Diff scope: PASS, Exactly two approved source paths: parent +1/-56, new child +54; aggregate111 <=120. Prior HASH and every other source identity equal baseline, no unexpected new source.
Invariant review: PASS, Independent source-review.json proves production prefix and private cfg(test) declaration exact; child is exact former body dedented with only include depth changed. Resolved valid-audio-metadata fixture and SHA256 e87baae6dfcaa348223e184ce8f0dba13fa4509a17f736f57abe3321069bedcd match original. Framing/limits/control/audio behavior and visibility unchanged.
Test-integrity review: PASS, All four framing test names, imports, framed helper, assertions and literals unchanged; no cfg/ignore/namespace changes. Production finite-value/preallocation/strict decoding invariants preserved by exact text equivalence. Exact collected names/results compared separately to NRTL-FRAMING-BASELINE-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-FRAMING-POST-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
