# Validation Report

Report ID: DRR-V-BASELINE-01  
Target ID: V · reader viewport input  
Mode: BASELINE  
Verdict: PASS  
Environment: local PowerShell outside sandbox at repository root, pinned dependencies.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths: `apps/desktop/src/reader/ReaderPublication.tsx`, proposed `apps/desktop/src/reader/use-reader-viewport-input.ts`.  
Validated path identities: reader empty status, SHA-256 `c52bf06bfca455a7b3c0838b966ebf5918497b076c063ca0084e386b3615a088`, filter-aware blob `0962ee5021f3723f552371fabc2ea209d1b1a148`; proposed module ABSENT with empty status.  
Identity recheck: PASS. Full inputs, both unit identities, empty index and HEAD matched. Raw manifest `tmp/evidence/desktop-responsibility-refactors/DRR-V-BASELINE-01/manifest.json`, SHA-256 `eec72b31eac7d49d9c17f94fc063176f3c04d3ff318570e807d4618f529ab6a6`.  
Commands and outcomes: scoped `git diff --check HEAD` exited 0. `pnpm.cmd exec prettier --check apps/desktop/src/reader/ReaderPublication.tsx` exited 0 in 0.69 s. `pnpm.cmd exec eslint apps/desktop/src/reader/ReaderPublication.tsx` exited 0 in 1.90 s. `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/active-visual-locator.test.ts` passed 87/87 in 3.63 s.  
Reused gates: DRR-A-WORKER-02 / A-TYPES, already independently qualified in [A post-change](A-post-01.md). Current loaded sources, discovered dependency/config memberships, tools, exports and initial incremental-cache state match the original passing command. No source change since A acceptance. BUILD-PACKAGES from [DRR-A-SHARED-BASELINE-01](A-shared-baseline-01.md) supplies unchanged exports. The same shared pre-edit record supplies the declared B-CHROMIUM and B-NOV23 witnesses; these are baseline evidence from before A's runtime edit. Current A-NATIVE supplies a trusted thumb observation on the actual V starting executable, source and host. Candidate V requires new affected Chromium and WebView2 results.  
Acceptance boundary: UNIT baseline.  
Pending batch gates: V candidate, R, M, combined package and final.  
Preparation/cleanup: local unit gates only, no new driver, model or native rebuild.  
Retries: none.  
Diff scope: PASS. V paths clean, H/A accepted work outside closed allowlist.  
Invariant review: PASS for baseline. Existing DOM/tracker tests protect intent expiry, confirmed movement, locator publication and focus behavior. Separate native and Chromium evidence covers held gestures and boundary recovery. Direct touch/cancel-on-detach coverage remains bounded as noted in the order.  
Test-integrity review: PASS. Existing fixtures unchanged and all selected cases ran.  
Privacy/artifact review: PASS. Synthetic unit fixtures, ignored technical evidence only.  
Action required: none for baseline.
