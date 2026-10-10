# Validation Report
Report ID: NRTL-CONTRACT-POST-01
Target ID: NRTL-CONTRACT
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_protocol_contract.rs; apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_protocol_contract.rs: exact porcelain [ M apps/desktop/src-tauri/src/tts_protocol_contract.rs]; worktree SHA-256 83045e9cbec1143045c05e73694befde77d4cc46c4f94eeaca458d0e0e9b5a8b; filter-aware expected index blob 44cf4923acd0dc7d6adeb921506d2198c292fd8f.
- apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs: exact porcelain [?? apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs]; worktree SHA-256 bb2685f787aedad277f7221c7fe10effdf7221240ef6e34ef3f29ef8ab18ac74; filter-aware expected index blob 576cb3627466ba3848aab1850e8a9823325ae0f7.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.32s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.29s
Diff scope: PASS, Exactly two approved files,parent+1/-175 and178line child,aggregate354 <=385. Other native identities unchanged relative to baseline.
Invariant review: PASS, Independent reconstruction proves exact unchanged production constants/imports/validators after removing only test-only table and helper/test regions. Child exactly matches use super::* plus original fixture tables/helper/four tests with only eighteen include depths corrected. All18 resolved targets/hashes and entry order match initial inventory;15 valid kinds and3 invalid entries retained.
Test-integrity review: PASS, Only four approved root-to-tests namespace mappings applied: rust_fixture_surface_matches_every_closed_control_kind; rust_fixture_surface_rejects_shared_invalid_controls; rust_fixture_surface_keeps_frozen_maximum_arithmetic; rust_boundary_rejects_nested_narration_and_audio_drift. Same unconditional tests, cfg boundary, helper, private debug field/cross-book/unknown audio rejection and exact emoji/audio arithmetic assertions. No other name or condition changed. Exact collected names/results compared separately to NRTL-CONTRACT-BASELINE-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: True. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-CONTRACT-POST-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
