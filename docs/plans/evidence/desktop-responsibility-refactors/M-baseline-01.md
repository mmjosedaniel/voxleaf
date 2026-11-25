# Validation Report

Report ID: DRR-M-BASELINE-01  
Target ID: M · playback episode metrics  
Mode: BASELINE  
Verdict: PASS  
Environment: normal local PowerShell at the repository root, Node 22.23.5, pnpm 11.15.1, current workspace exports.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths and identities: the following paths are under `apps/desktop/src/tts/`. All three had empty porcelain status before and after.

| Path | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- |
| `product-narration-coordinator.ts` | `9f632ae2b4c11ebb477eaef4b5a1452ffdd042761f7969f2e4084925636e8841` | `22325a697e81de1c21614bf69df9d8e82b95ade1` |
| `product-narration-coordinator.test.ts` | `152fb01743f2c0644b0d6731c42b3a6a53ce87f20e7a2987cf1fe11db5298f76` | `04c206e534aaa97ad2b764cfe5d5e1a9a35ab7c3` |
| `playback-episode-metrics.ts` | ABSENT | ABSENT |

Identity recheck: PASS. HEAD, closed path set, active source membership and dirty hashes, package exports, toolchain and empty index matched across the gates. The immutable manifest is `tmp/evidence/desktop-responsibility-refactors/DRR-M-BASELINE-01/manifest.json`, SHA-256 `cbbef2ca77d2648832f05b7235837e37a1e51e460e9627afe4f21d6985ba586b`.  
Commands and outcomes: scoped `git diff --check HEAD` exited 0. `pnpm.cmd exec prettier --check` (1.08 s) and `pnpm.cmd exec eslint` (1.86 s) on the two existing paths both exited 0. `pnpm.cmd --filter @voxleaf/desktop typecheck` exited 0 in 4.67 s. `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts` passed all 246 cases in 12.11 s.  
Reused gates: BUILD-PACKAGES from [DRR-A-SHARED-BASELINE-01](A-shared-baseline-01.md) supplies the unchanged 257 package exports. Its B-CHROMIUM (including both RIA-03 direct/worklet cases) and B-PIPER (one packaged offline English Piper arm) are the declared shared integration baseline before the first relevant source edit. Candidate M needs fresh matching observations for both.  
Acceptance boundary: UNIT baseline.  
Pending batch gates: M candidate, package and final.  
Preparation/cleanup: only focused static checks and the coordinator suite ran. Package exports and source identities were rechecked.  
Retries: none.  
Diff scope: PASS. M's three paths started clean, with the new helper absent. The four accepted earlier units have separate source paths.  
Invariant review: PASS for the baseline. Tests assert terminal metrics, intentional wait, rendered playback duration, reset, repeated playback and observation failure during cleanup. The approved test extension will exercise consecutive publications before a sample is committed, then the tick and Stop, to distinguish preview from double counting.  
Test-integrity review: PASS. The existing coordinator suite ran unchanged.  
Privacy/artifact review: PASS. In-memory synthetic fixtures and ignored local receipts only.  
Action required: none for baseline.
