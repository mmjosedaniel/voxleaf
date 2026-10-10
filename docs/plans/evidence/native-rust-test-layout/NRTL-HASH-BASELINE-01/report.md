# Validation Report
Report ID: NRTL-HASH-BASELINE-01
Target ID: NRTL-HASH
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/sha256_hex.rs; apps/desktop/src-tauri/src/sha256_hex/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/sha256_hex.rs: porcelain status [] (clean); worktree SHA-256 427bd48feee99c62afc9cd9ee06d4a21af7d53dabf3e688342dbcf1601795fa6; filter-aware expected index blob 4822b8e76a7f648c5e8be924f5fa9ab9c670aaab.
- apps/desktop/src-tauri/src/sha256_hex/tests.rs: porcelain status [] (absent); worktree SHA-256 ABSENT; expected index blob ABSENT (planned addition).
Identity recheck: PASS, HEAD and both closed-path identities unchanged before/after commands; supplementary complete 15-file native source identities unchanged; index empty before/after and worktree clean.
Commands and outcomes:
1. pnpm.cmd format:check:rust -> exit 0; cargo fmt check passed.
2. pnpm.cmd lint:rust -> exit 0; cargo clippy all targets passed for default and release-locked-runtime with -D warnings.
3. pnpm.cmd test:rust -> exit 0; default 87 passed/0 failed/0 ignored/0 filtered; release-locked-runtime 88 passed/0 failed/0 ignored/0 filtered. All 87 and 88 test names/results retained separately, with zero duplicate names or non-ok results. The locked configuration adds exactly tts_service_supervisor::tests::release_locked_runtime_rejects_development_only_profiles_and_defaults.
4. git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
Diff scope: PASS, no source changes at baseline and both allowlisted paths clean; planned child absent. Existing encode_sha256 callers remain outside the permitted change.
Invariant review: PASS, baseline production import/signature/body and lowercase ordering/leading-zero behavior captured. Relocation must preserve the current private tests namespace and avoid API/visibility changes. This report establishes baseline only and does not approve implementation.
Test-integrity review: PASS, sha256_hex::tests::preserves_known_sha256_values_and_leading_zeroes passed in both configurations. One test retains all four ordered known-answer vectors (empty, abc, long standard vector, s leading-zero digest), existing imports, cfg(test), and assert_eq. Initial source inventory captured 90 functions: two cfg(unix) cases are not executed on Windows; the feature-only case runs only under release-locked-runtime. Four explicit Windows tests passed, including production_windows_probe_emits_only_the_bounded_report. No non-Windows execution is claimed.
Privacy/artifact review: PASS, repository status remained clean; no books/audio/models/secrets/private artifacts added. Initial source fixtures, protected authority, and excluded-file identities are retained in task-local scratch; no repository evidence files were written by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-HASH-BASELINE-01/{before.json,after.json,results.json,test-identities.json,format-check-rust.log,lint-rust.log,test-rust.log}. Live toolchain verified pnpm 11.15.1 via existing Corepack shim prepended to process-local PATH; rustc 1.97.1. Initial global pnpm was 11.25.0 and was not used for acceptance. Git emitted a harmless missing-directory diagnostic while querying the planned ABSENT child; its status was empty and no path was hashed while absent. The report and evidence are immutable.
