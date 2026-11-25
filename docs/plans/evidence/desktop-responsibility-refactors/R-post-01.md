# Validation Report

Report ID: DRR-R-POST-01  
Target ID: R · native pending startup, DRR-R-ORDER-01  
Mode: POST-CHANGE  
Verdict: PASS  
Environment: normal local PowerShell at the repository root, pnpm 11.15.1, Rust 1.97.1. The packaged test used local WebView2 and its matching EdgeDriver 158.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths: `apps/desktop/src-tauri/src/tts_service_supervisor.rs`.  
Validated path identities: porcelain ` M`, SHA-256 `f5b6b23a79ceb0787bcf559b7e1ff0ca540448c6095a856a60d7f317888dcbdd`, filter-aware blob `200928eed3b2aebf51e0610df01bb0f1efa1deee`.  
Identity recheck: PASS. HEAD, unit bytes and status, toolchain, active sources, package exports and index matched in both captures. Immutable raw manifest `tmp/evidence/desktop-responsibility-refactors/DRR-R-POST-01/manifest.json`, SHA-256 `4594a4fd6eef752fa5c99ea66dbc159058af75edf7aa61eb1f4c2d6f88eaa983`.  
Commands and outcomes: scoped `git diff --check HEAD` exited 0. `pnpm.cmd test:native-startup` rebuilt the ordinary executable and passed the packaged model-free matrix in 42.79 s. This covered supervised startup, cancellation and crash recovery with a real child. The native runner reported no errors or external requests. The command below passed in 4.14 s with one test executed, zero failed, zero ignored. Its child executable came from the preceding build. SHA-256 before and after F08 was `4350aaaf1e07de242bc8276eca002084efb2e5bdc7ea5af9a40cbec3d08a8904`.

```powershell
$env:VOXLEAF_NATIVE_MODEL_FREE_BINARY = (Resolve-Path apps/desktop/src-tauri/target/release/voxleaf-desktop.exe).Path
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_service_supervisor::tests::chat_audit_f08_old_pending_start_shutdown_cannot_kill_a_replacement -- --exact --ignored --nocapture --test-threads=1
```

Reused gates: DRR-R-WORKER-01, `tmp/evidence/desktop-responsibility-refactors/R-worker-01/receipt.json`, SHA-256 `49da84594abf0980c67b440323871ab52b8b3d2b6b64c2392284d23754394492`. Verified 838 source/config inputs, discovered membership, package exports, host tools, environment, source identities and the two test executable hashes. R-FMT (`pnpm.cmd format:check:rust`, 0.73 s), R-LINT (`pnpm.cmd lint:rust`, both Clippy feature configurations, 5.26 s), R-DEFAULT (12.05 s), R-LOCKED (11.62 s) all exited 0. Both Cargo invocations used the exact six selectors and feature arguments recorded in [the Rust baseline](R-baseline-01.md). Each executed all six, including the application-exit fence.  
Acceptance boundary: UNIT.  
Pending batch gates: M and the combined package and final gates.  
Preparation/cleanup: ordinary model-free artifact built once. Both process environments and the F08 child path were scoped to the validation shell. F08 stopped the surviving replacement under its own owner and called final cleanup.  
Retries: first worker-input comparison detected the validator's WebView2 driver override. Comparing with the original environment qualified the Rust gates. The packaged observer used the matched driver. Each test ran once for this candidate.  
Diff scope: PASS. One file, 32 added and 20 removed, under the 90-line ceiling. No test, dependency, configuration or generated source changes in R.  
Invariant review: PASS. Registration stores request ID, service instance ID and cancellation token together under the lifecycle lock. Completion clears only the matching instance. Shutdown matches the request, retains both identifiers, and issues the same Release store. Startup and status retain Acquire loads; pre-spawn admission, operation and session/lifecycle lock order remain intact. Exit still fences the pending token and preserves retirement only when the entire request/instance pair matches. The F08 fixture explicitly compared the replacement's surviving service ID and asserted its owner's shutdown succeeded. These observations cover the selected interleavings; the remaining scheduling equivalence was reviewed in source.  
Test-integrity review: PASS. Existing six Rust witnesses and F08 assertions unchanged.  
Privacy/artifact review: PASS. Synthetic native fixtures and ignored build products only.  
Action required: none for R.
