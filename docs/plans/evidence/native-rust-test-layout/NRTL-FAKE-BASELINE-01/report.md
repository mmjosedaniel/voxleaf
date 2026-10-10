# Validation Report
Report ID: NRTL-FAKE-BASELINE-01
Target ID: NRTL-FAKE
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_service_fake_child.rs; apps/desktop/src-tauri/src/tts_service_fake_child/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_service_fake_child.rs: exact porcelain []; worktree SHA-256 f3ec7d102b499f8416ef1588cf337bca56d4b3cd83bbf3d1d226c4e19d7a8ae5; filter-aware expected index blob 72b4a5991f0e67392b0080125778dbf64e3d2d18.
- apps/desktop/src-tauri/src/tts_service_fake_child/tests.rs: exact porcelain []; worktree SHA-256 ABSENT; filter-aware expected index blob ABSENT.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.39s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.35s
Diff scope: PASS, Both allowlisted paths clean, child ABSENT; prior accepted HASH/FRAMING/CORE sources preserved. Baseline only.
Invariant review: PASS, Existing executable run_child/run_child_with/run_descendant and scenarios remain outside cfg(test), original production bytes captured. valid-synthesize.json resolved fixture SHA256 b57cf18ab2b6a922d9018f028a7b1002d2916b706f7b574299cb30f2f7600753 verified fresh.
Test-integrity review: PASS, The one normal_child_emits_canonical_ordered_complete_unit test and command helper independently inspected: handshake/load/warm/synthesize/shutdown order, frame decoding, consecutive metadata/audio/completed assertion and final state assertion remain original. Unit gates prove collected tests; final campaign native-startup remains required for executable dispatch. Exact collected names/results compared separately to NRTL-CORE-POST-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-FAKE-BASELINE-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
