# Validation Report

Report ID: DRR-M-POST-01  
Target ID: M · playback episode metrics, DRR-M-ORDER-01  
Mode: POST-CHANGE  
Verdict: PASS  
Environment: normal local PowerShell at repository root, pnpm 11.15.1, Node 22.23.5, local Chromium and WebView2 158. The packaged probe used the existing verified English Piper interpreter and model.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths and identities: paths below are under `apps/desktop/src/tts/`. Both captures matched.

| Path | Porcelain | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `product-narration-coordinator.ts` | ` M` | `4f4072ef057e5039d6852531fed1cc651e0170cc1e71c9cae7d9d15305894c7f` | `3a1d44e349211a735aa0f5b20d86d28ad76c68c2` |
| `product-narration-coordinator.test.ts` | ` M` | `4e5129e8792ac71f967df74cfafb3a7e027490c9c1a643c15404465bf5f93d6e` | `f3fbf94258644ed308943f90e262fef3333fd586` |
| `playback-episode-metrics.ts` | `??` | `d7b44eac899f065f4bf4c32a930ee5282ddeadc13f01e56cbc84ae0fc7047ab4` | `95573579b7049ccb6707cd2a8730ae4e01b34b13` |

Identity recheck: PASS for closed source, HEAD, active inputs, tools and index. The shared raw manifest `tmp/evidence/desktop-responsibility-refactors/DRR-M-PACKAGE-01/manifest.json`, SHA-256 `1166dce843f26ad61338477af58fb1d39297b8b9195a2da7656c90c05d68c3f3`, binds full command arguments, start/end times and log digests.  
Commands and outcomes: scoped `git diff --check HEAD` exited 0. `pnpm.cmd test:browser` passed 115/115 in 360.03 s, including both individually named RIA-03 cases for confirmed rendering at 100% and 75%. The following English Piper command ran once in offline mode against the ordinary executable built by PACKAGE-BUILD. It passed in 129.07 s. Terminal playback measured 3,007 ms, and the harness reported zero remaining audio units, generated audio files and external requests. The executable SHA-256 was `3453006ec12965e6edcf2dd8676607de9c344db6ccd008590c36da7f82f382ed`.
  
```powershell
$releaseFile = (Resolve-Path apps/desktop/src-tauri/target/release/voxleaf-desktop.exe).Path
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en "--executable=$releaseFile"
```

Reused gates: DRR-M-WORKER-01, `tmp/evidence/desktop-responsibility-refactors/M-worker-01/receipt.json`, SHA-256 `cd3a8eaa01b2a3038d25cab34a674cd773f6131a18bed16d0dc8fc9e025d159e`. Independently verified all 839 captured inputs plus discovered sources/config, installed tools, package exports, environment, incremental output, source/HEAD and result. M-FMT (`pnpm.cmd exec prettier --check`, three paths, 1.11 s), M-LINT (`pnpm.cmd exec eslint`, three paths, 1.84 s), M-TYPES (`pnpm.cmd --filter @voxleaf/desktop typecheck`, 4.61 s) and M-COORDINATOR (`pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts`, 12.08 s) all passed. The coordinator executed 246/246 tests. [Metrics baseline](M-baseline-01.md)  
Acceptance boundary: UNIT.  
Pending batch gates: final documentation and archive verification. [Combined runtime and package results](package-01.md)  
Preparation/cleanup: verified the admitted interpreter, exact three model-directory artifacts and signed matching driver. Per-process offline and profile settings applied only to the Piper shell. The terminal and cleanup observations are retained in the raw receipt.  
Retries: none for M. Package-level lint recovery is recorded separately.  
Diff scope: PASS. Three approved paths, 177 changed lines under the 240-line ceiling.  
Invariant review: PASS. The helper copies four numeric counters from each observation. Its preview computes nonnegative deltas without changing totals or baselines. Recording applies those deltas once, then updates the baseline. The coordinator still clears totals before synchronization in an explicit recovery reset; each new player rebases without clearing episode totals. Stop and failure still close the player before capturing its final observation. A diagnostic failure still permits owner cleanup. No player, sample-rate, scheduling, recovery or disposal responsibilities moved into the helper.  
Test-integrity review: PASS. The public test confirms two volume publications expose their new volumes and the same additional 100 ms for 2,400 frames at 24 kHz. It checks the same playback duration after the tick and after Stop; the existing checkpoint and next-run assertions remain. No additional speeds or other model profiles were measured.  
Privacy/artifact review: PASS. Synthetic on-device audio only, technical logs in ignored scratch, no private runtime material in source.  
Action required: none for M.
