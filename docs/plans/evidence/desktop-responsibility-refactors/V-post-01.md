# Validation Report

Report ID: DRR-V-POST-01  
Target ID: V · reader viewport input  
Mode: POST-CHANGE  
Verdict: PASS  
Environment: normal local PowerShell, repository root, pinned pnpm and matching signed WebView2 driver.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths: `apps/desktop/src/reader/ReaderPublication.tsx` and `apps/desktop/src/reader/use-reader-viewport-input.ts`.  
Validated path identities: unchanged between validator captures.

| Path in reader | Porcelain | SHA-256 | Filter-aware index blob |
| --- | --- | --- | --- |
| ReaderPublication.tsx | ` M` | 0a5fc2914989987447bca281ce93ce8274b4806554d401857924ee222444d298 | 5a486c379ca5d72ebf6fd69798e8339e46cd7c49 |
| use-reader-viewport-input.ts | `??` | fed7e2c4515a1eb694f3bd7888d57c688725beb463857be106aed9f95e74a667 | 7fcd363af20c7cbbc1df7722f216e2dc3d2ea7d3 |

Identity recheck: PASS. Empty index, HEAD, working source, discovery, toolchain and exports matched. Raw manifest `tmp/evidence/desktop-responsibility-refactors/DRR-V-POST-01/manifest.json`, SHA-256 `a90528906a2872d3b79c68da86739a7ab60b2261f46f19e5c8c29037c8b1013d`.  
Commands and outcomes: scoped `git diff --check HEAD`, exit 0. V-CHROMIUM ran the two V Playwright files filtered to VF-0136/0143/0034/0063, passed 6/6 in 16.69 s. V-BUILD ran `pnpm.cmd build:desktop`, exit 0 in 26.47 s. V-THUMB and V-NOV23 ran `node apps/desktop/scripts/native-startup-smoke.mjs` separately with `--scrollbar-probe-only` or `--exercise-nov23-reader --operation-timeout-ms=120000` and the same absolute `--executable`. Both exited 0, in 4.66 s and 4.25 s. Before/after SHA-256 of that ordinary executable was `5eef7b465de64cdc7ff0283594e3ff5f95e39e40df33e06d7c40c253189179bf`.  
Reused gates: DRR-V-WORKER-01 / V-FMT, V-LINT, V-TYPES and V-READER. Worker receipt SHA-256 `4eccc62eda95f3d20565dfd1ef8caaad83d32e06e33f6557d6337177aeba7b1c`. Independently checked all 838 captured source/config inputs, tools, discovered sources, exports and installed execution inputs, environment and incremental-cache output. All matched. Worker executed Prettier and ESLint on both V paths, desktop typecheck, and reader/tracker Vitest (87/87). Package build evidence from the [shared baseline](A-shared-baseline-01.md) retained its matching inputs and exports.  
Acceptance boundary: UNIT.  
Pending batch gates: R, M, combined package and final acceptance.  
Preparation/cleanup: one ordinary native build. The two native modes finished their isolated sessions and reported genuine motion, focus and retained checkpoint.  
Retries: none.  
Diff scope: PASS. Two files, 298 changed lines, within 320.  
Invariant review: PASS. The old root still owns release while pointerup/cancel and blur listeners are removed. Movement is admitted, follow suppressed and location sampled before clearing the held intent. Root listeners are replaced before reassignment; wheel remains nonpassive, nonroot scroll excluded, and pointer ID, scrollbar geometry, touch trust/count, selection and modifier checks match the original. The cleanup effect remains at the same point relative to the controllers. Actual drag, PageDown on a publication link, modified keys, next Play and subsequent restoration passed.  
Test-integrity review: PASS. Fixtures and assertions are unchanged. Trusted touch and pointer-cancel/blur during detach were structurally reviewed; direct device stimulation of those cases was outside the executed gates.  
Privacy/artifact review: PASS. Reviewed patch contains source only.  
Action required: none for V.
