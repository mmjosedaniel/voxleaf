# Validation Report

Report ID: DRR-A-POST-01  
Target ID: A · application appearance writer  
Mode: POST-CHANGE  
Verdict: PASS  
Environment: local PowerShell outside sandbox at the repository root, pinned pnpm 11.15.1, matching Chromium and signed WebView2 driver.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths: the five paths listed below.  
Validated path identities: porcelain, SHA-256 and filter-aware expected index blob matched before and after.

| apps/desktop/src path | Porcelain | Worktree SHA-256 | Index blob |
| --- | --- | --- | --- |
| App.tsx | ` M` | f9a931a3838d5a46cd04df5b3660ba7cae772284fef5e8e8ca9d372daa9e217d | dcd69362796139f3911d718467327db581a1def2 |
| App.test.tsx | ` M` | e04db613429ff00b9ebb5b8b320c87bd706281d01e9610b5c4d31bc1acd40f2e | 511796acde055a08c499c4478eb1130e659042a5 |
| persistence/reader-appearance-writer.ts | `??` | c4f72b6ba84f99df7f438d64daa8b442350ea3d188315b5ccd6692c1a42ece6f | 12e573325ec3738080dcbed7fb1419963d95df08 |
| persistence/reader-position-save-coordinator.ts | ` M` | b489273bc6a1d2be7a4b0acb0a4f09eab98b495a25cb99c6a1834d15e25da1c7 | 778ac18d9bac23ac39bb08f109d4a4ed7d006228 |
| persistence/reader-position-save-coordinator.test.ts | ` M` | fa6ac18264972fd4474a39cd4c6f46c4d2067005c70114170e5602d35b1c8dfc | 93063bbaedb1fd1026684567c9e1b78121c800f3 |

Identity recheck: PASS. Sources, discovery, 257 package exports, toolchain, HEAD and empty index matched. The immutable private record is `tmp/evidence/desktop-responsibility-refactors/DRR-A-POST-01/manifest.json`, SHA-256 `a2e53258ffefadcb41e863988ea980b413217f1a52592d2a95485f0c8041bf21`.  
Commands and outcomes: scoped `git diff --check HEAD` exit 0. A-CHROMIUM ran the two reader Playwright files with the A-only filter and passed 5/5 in 12.85 s. A-NATIVE ran `pnpm.cmd test:native-startup` and passed in 58.06 s, including actual restart/reselection persistence, genuine scrollbar movement and fixture cleanup. Executable SHA-256 `c20233ac2ef97926991cb2ace089daa3f1fd11964c55aec2ab39c250b3581065`. The private per-gate records carry complete arguments/times.  
Reused gates: DRR-A-WORKER-02 (receipt SHA-256 `cef82376d38875bf8f94a153aa7c6d1647f4e7e0ab38e56b77cfc4deef7f716a`) / A-FMT, A-LINT, A-TYPES, A-APP and A-POS. All exited 0 on the exact candidate. Independently matched the worktree, the 837 captured source/configuration inputs, all package exports and their directory membership, tool identities, environment digests and emitted typecheck cache. The two Vitest gates ran 10 App cases and all 22 remaining position cases. Package preparation used [BUILD-PACKAGES in the shared baseline](A-shared-baseline-01.md) with unchanged package sources, locks, compiler and all output bytes. Historical gates were not credited.  
Acceptance boundary: UNIT.  
Pending batch gates: V, R, M and combined package/final.  
Preparation/cleanup: ordinary model-free packaged build and isolated WebView2 session. The native runner reported cleanup and zero external requests.  
Retries: DRR-A-WORKER-01 stopped at the React refs lint error. Correction 01 restored the callback at event time. DRR-A-WORKER-02 and the independent integrations passed.  
Diff scope: PASS. 465 changed lines including the 67-line addition, five paths, within the amended 510-line ceiling.  
Invariant review: PASS. One in-flight/global queued write, stale-write/hydration suppression, current errors after replacement, final queued write and suppressed report after real unmount. The per-book drain still waits for successor position writes across the microtask gap.  
Test-integrity review: PASS. The obsolete per-book appearance assertion was migrated to mounted true-unmount coverage, current App tests cover replacement/three edits, and the independent R7-06 position-gap, failure, heard and content-free guards remain. No change to storage format or publication identity.  
Privacy/artifact review: PASS. The diff has application/test source only. Raw host material stays in ignored scratch.  
Action required: none for A.
