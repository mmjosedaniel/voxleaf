# Change Review Report

**Review ID** `NOV23-EXEC-CR-R02-20261123`  
**Task ID** `NOV23-EXEC`  
**Verdict** `CHANGES_REQUESTED`  
**Base commit and reviewed HEAD** `d9a0a72db1f5dd8a5dc7553ea0e2358c9cfe497e`

**Reviewed paths and identities.** `tmp/evidence/nov23-execution-r02/inputs-r02.json`, ID `NOV23-EXEC-INPUTS-R02`, SHA-256 `3bbec27c5b32d49558f6fcbbb491200e8ff6ec3e3b504fff3d8af04f5701a30a`. The manifest contains 258 distinct paths and covers all 112 changed or untracked working paths.

**Identity recheck — PASS for all listed paths.** Before and after inspection, HEAD, working-path status, raw SHA-256 and filter-aware Git blobs matched. The index was empty and both reserved terminal paths were absent. One supporting input is missing from the manifest, as detailed below.

**Acceptance review.** The ExecPlan accounts for all 42 IDs. VF-0145 remains deferred and VF-0148 corrects the documented command boundary. All four R01 findings are resolved in the implementation and tests.

- **VF-0093.** A no-child Start now consumes its exact pre-registration retirement after losing either admission lock. The regression exercises 33 successive cancellations, then proves a fresh early Cancel still fences its Start and a replay leaves the successor active.
- **VF-0169.** The player measures the predecessor’s output end and successor’s output start on the same audio clock. A 400 ms callback delay now contributes to handoff time in both backend directions. Missing or incompatible endpoint evidence withholds the timing receipt. Partial final quanta and Pause/Resume before a scheduled direct start have distinguishing assertions.
- **Native benchmark.** The configured `--reader-performance` route again executes the supervisor matrix before the WebView2 benchmark. The separately selected November reader probe rejects conflicting modes.
- **VF-0136.** The native witness now requires trusted PageDown, retained focus on the original link and movement of the original viewport. Stationary input and replacement fail the witness. The revised ordinary executable produced a positive movement observation.

**Test evidence reviewed.** The coordinator reported passing local Windows PowerShell results for six selected Rust tests in each of the default and release-locked configurations, 164 playback tests, the focused PageDown controls and `pnpm.cmd benchmark:reader:native`. The revised installer passed `pnpm.cmd package:windows:verified-core`, the six-case Windows lifecycle and the bounded download probe. Installed Piper rendered 60,136.42 fresh milliseconds, with 11.58 ms first activation and 13.97 ms recurring handoff p95. The R02 installer SHA-256 is `a279ac0f32547fd70b597ec19eee4a827bc5384fdc3ef48ff94418c2d34801f1`; the installed executable SHA-256 is `2aac8b250f27dbb3a7bcb362fa67fb028d2dbe988bdf3170cdecda751e869176`.

**Findings**

1. **P3 — Incorrect language attribution in `docs/plans/evidence/november-23-findings/integrated-gates.md`, line 44.** The record attributes the 198 ms Cancel, 195 ms shutdown and 39,502 ms fresh Play to Spanish. The frozen R02 `chatterbox-fallback-native.mjs` passes `--tts-language=en`. The smoke checks that the final persisted language equals the requested language before running the matrix. The numeric receipt omits language and cannot support a Spanish attribution. Correct this record to English and retain the earlier bilingual run under R01. The existing English run satisfies the plan’s one-language Cancel/retry requirement.
2. **P3 — The audition comparison’s direct input is missing from the closed manifest.** `tmp/evidence/nov23-execution-r02/compare-audition.mjs` imports `./prior-worklet.ts`. The manifest builder excludes this root-level `.ts` file, so its bytes could change without failing the supplied recheck. Independent inspection found current SHA-256 `5646db739b78ac11a8a50a4b68194e454b50eb32b48b0a2bc14139db0da8b096` and Git blob `5c81800d8b7f23d49e07c1262aeb8b8a78050464`, both matching the historical R01 source. Include the actual imported path and those identities in the next closed manifest. The reported comparison of 191,734 identical frames retains its evidence basis.

**Remaining uncertainty.** The complete 21-stage acquisition journey belongs to R01. R02 separately exercised installed lifecycle, bounded transfer, Piper speeds and installed v7 Chatterbox Cancel/retry. The interrupted engine phase remains unverified. Listening evidence applies to the compared synthetic samples.

**Required next action.** Correct the language attribution, include the audition input in a fresh manifest and submit the revised evidence for independent review. Both corrections concern evidence bookkeeping. The existing host results can be reused on matching identities.
