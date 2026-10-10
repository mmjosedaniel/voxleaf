# Validation Report
Report ID: NRTL-HANDOFF-BASELINE-01
Target ID: NRTL-HANDOFF
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_service_handoff.rs; apps/desktop/src-tauri/src/tts_service_handoff/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_service_handoff.rs: exact porcelain []; worktree SHA-256 705834ea94881c61954747bbf59957c3a8560b0baf1ade4359787858d5798351; filter-aware expected index blob 18b070187f3e4d1894485e3bad4796a0f07cd60f.
- apps/desktop/src-tauri/src/tts_service_handoff/tests.rs: exact porcelain []; worktree SHA-256 ABSENT; filter-aware expected index blob ABSENT.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.29s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.28s
Diff scope: PASS, Both proposed paths clean, child absent, accepted earlier native changes preserved. Baseline only.
Invariant review: PASS, Production diagnostic remains in parent, with original run_host, nine-case ownership, BoundedConsumer and release-locked gate. Both parent includes verified: service-handoff-profile-v1.json SHA2561ec39e6bd45064bb8ddd65b43e5ffee76b5a546bb2766f11af2d9c0ee116a2d3 and valid-synthesize.json SHA256b57cf18ab2b6a922d9018f028a7b1002d2916b706f7b574299cb30f2f7600753. Neither include moves.
Test-integrity review: PASS, Three original tests independently reviewed: exact segment7 identity and codepoint mapping, Busy/dispatch/release consumer assertions, and content-free serialization/zero audio units. No model-backed diagnostic run or Qwen promotion claimed. Exact collected names/results compared separately to NRTL-FAKE-POST-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-HANDOFF-BASELINE-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
