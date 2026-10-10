# Validation Report
Report ID: NRTL-PROBE-BASELINE-01
Target ID: NRTL-PROBE
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox
Starting HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Ending HEAD SHA: f06c80e04da2025342b1002a548f03ca17e7cc0b
Validated paths: apps/desktop/src-tauri/src/tts_protocol_probe.rs; apps/desktop/src-tauri/src/tts_protocol_probe/tests.rs
Validated path identities:
- apps/desktop/src-tauri/src/tts_protocol_probe.rs: exact porcelain []; worktree SHA-256 8c0d1446ded02795e3dd3b788adf18f61e721070ed81e1c7142c3634dc1ec3da; filter-aware expected index blob 68282b4388d07db800185068ac3a5ee7c06f50da.
- apps/desktop/src-tauri/src/tts_protocol_probe/tests.rs: exact porcelain []; worktree SHA-256 ABSENT; filter-aware expected index blob ABSENT.
Identity recheck: PASS, HEAD and all validated identities unchanged before/after acceptance commands; supplementary complete native source identities unchanged during execution; index empty before/after.
Commands and outcomes:
- pnpm.cmd format:check:rust -> exit 0.
- pnpm.cmd lint:rust -> exit 0.
- pnpm.cmd test:rust -> exit 0.
- git diff --check -> exit 0; git diff --cached --quiet -> exit 0 before/after.
- Rust format check and both default/release-locked-runtime all-target clippy configurations passed. default: test result: ok. 87 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.34s release-locked-runtime: test result: ok. 88 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.28s
Diff scope: PASS, Both allowlisted paths clean, child absent; previously accepted contract namespaces retained. Baseline only.
Invariant review: PASS, Entire frozen_authority raw block including cfg and line endings matches initial capture exactly,1261characters,SHA2564a85acf9398301db3ea9275bc8bd0770dbd34fdc1d293efe5e47bfd194559626 using documented boundary without trailing newline. Four test-only helpers currently in parent, only test callers; executable probe/process/Tauri functions remain outside test boundary. No fixture includes.
Test-integrity review: PASS, Nine original identities retained; reviewed frozen dimension/count/timeout tables, preallocation/truncation/unknown header cases, finite active-identity audio, fixed errors and single-active guard assertions. Preserve Cursor and both super imports when moving helpers. No consolidation with production protocol authorized. Exact collected names/results compared separately to NRTL-CONTRACT-POST-01; no disappearance, duplicate, unexpected rename, non-ok result or ignore. Contract-name mapping applied: False. Two existing cfg(unix) cases remain unexecuted on this Windows host; the feature-only test remains exclusive to release-locked-runtime. No non-Windows execution is claimed.
Privacy/artifact review: PASS, no prohibited artifact or unrelated runtime/source edit introduced by the scoped unit. Director-authored plan/evidence documentation and previously accepted source changes are outside this unit's scope and preserved; source writers and Git mutations were idle throughout validation. No source/document/configuration/Git edits by validator.
Action required: none

Evidence: task-local work/native-rust-test-layout/NRTL-PROBE-BASELINE-01 contains before.json, after.json, results.json, test-identities.json, raw command logs and supplementary review/comparison files when present. Acceptance used verified pnpm 11.15.1 via process-local Corepack shim PATH and rustc 1.97.1. Report and evidence immutable; this report does not authorize Git mutations.
