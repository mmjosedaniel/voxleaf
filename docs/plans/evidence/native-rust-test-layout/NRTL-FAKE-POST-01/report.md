# Validation Report
Report ID: NRTL-FAKE-POST-01
Target ID: NRTL-FAKE
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_service_fake_child.rs; apps/desktop/src-tauri/src/tts_service_fake_child/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_service_fake_child.rs: exact porcelain [ M apps/desktop/src-tauri/src/tts_service_fake_child.rs]; worktree SHA-256 59656ca25b6a061f0722eb01ed956028d80b8ff4f2aa3ea3ea05f51394a65448; filter-aware expected index blob 223971a920f818f3b84390ce2a3cf39cd520863f.
- apps/desktop/src-tauri/src/tts_service_fake_child/tests.rs: exact porcelain [?? apps/desktop/src-tauri/src/tts_service_fake_child/tests.rs]; worktree SHA-256 0819bbfb4eb4aa6092ad75556eec77270af84650f8dfffc15a40f7a9f67d0c03; filter-aware expected index blob 7b757f57abfccffec3d0631ad4da90accd81343c.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.30s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.33s
Diff scope: PASS, Exactly parent+child, +1/-72 and70newlines, aggregate143 <=155. Prior accepted and other source identities unchanged.
Invariant review: PASS, Exact normalized text comparison proves production prefix including all executable synthetic-child/descendant/scenario/timing helpers unchanged outside cfg(test). Private child is exact70-line former body dedented with only include depth corrected; valid-synthesize fixture resolves identically, SHA256 b57cf18ab2b6a922d9018f028a7b1002d2916b706f7b574299cb30f2f7600753.
Test-integrity review: PASS, Same private tests namespace, one normal_child_emits_canonical_ordered_complete_unit, command helper, imports, input order, frame loop and both assertions preserved. No new cfg/ignore/visibility or runtime-helper movement. Campaign native-startup remains required for complete executable wiring acceptance. Exact collected names/results compared separately to NRTL-FAKE-BASELINE-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-FAKE-POST-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
