# Validation Report

Report ID: DRR-R-BASELINE-01  
Target ID: R · native pending startup  
Mode: BASELINE  
Verdict: PASS  
Environment: normal local PowerShell, repository root, Rust 1.97.1, pinned pnpm.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths: `apps/desktop/src-tauri/src/tts_service_supervisor.rs`.  
Validated path identities: empty porcelain status, worktree SHA-256 `babd67e4d859e8fff351b7d4c7b833508547c5b57962bef26205527be975c830`, filter-aware index blob `c00b86d1b615edfe5ee8b76ce3d6b0bed0ea5a76`.  
Identity recheck: PASS for both captures and the empty index. Private immutable manifest `tmp/evidence/desktop-responsibility-refactors/DRR-R-BASELINE-01/manifest.json`, SHA-256 `1f2134202e0a028e6d74a38420171d38cd6fd116afceb4cff2b0d7cbb0a16482`.  
Commands and outcomes: scoped `git diff --check HEAD` exit 0. `pnpm.cmd format:check:rust` exit 0 in 0.72 s. `pnpm.cmd lint:rust` ran both Cargo Clippy variants, exit 0 in 16.68 s. The following base command ran with the six test selectors below in default mode (14.07 s, six passed) and with `--features release-locked-runtime` immediately before `--` (10.47 s, six passed). Each run selected and executed the explicit exit-fence test.

```powershell
cargo test --locked --manifest-path apps/desktop/src-tauri/Cargo.toml -- nov23_busy_start_drains nov23_bounded_dispatch nov23_shutdown_before_start nov23_shutdown_fences nov23_application_exit_prevents_spawn nov17_cancel_retires_matching_start
```

Reused gates: [DRR-A-SHARED-BASELINE-01](A-shared-baseline-01.md) / B-NATIVE and B-F08 supplied the pre-first-edit integration baseline on its recorded executable. B-F08 actually ran one ignored-by-default real-child test. The later A and V edits affect renderer bytes; their executables have separate identities. This reuse is limited to the declared shared pre-edit comparison. R post-change must run model-free packaged startup and the explicit F08 case on its own new binary.  
Acceptance boundary: UNIT baseline.  
Pending batch gates: R post-change, M, package/final.  
Preparation/cleanup: Cargo used ordinary feature-specific build outputs. No model or installer preparation.  
Retries: none.  
Diff scope: PASS. Target clean; accepted H/A/V changes outside the allowlist.  
Invariant review: PASS for baseline. Suites exercise exact, foreign and pre-registration shutdown, retirement bounds, cancellation while Piper verification holds, retry with a successor, and exit preventing future spawns.  
Test-integrity review: PASS. No changes to test assertions.  
Privacy/artifact review: PASS. Controlled local test inputs, raw receipts in ignored scratch.  
Action required: none for baseline.
