# Validation Report

Report ID: DRR-A-SHARED-BASELINE-01  
Target ID: A · application appearance and the pre-edit shared A/V/R/M integration gates  
Mode: BASELINE  
Verdict: PASS  
Environment: normal local PowerShell, repository root, pinned pnpm 11.15.1 and Node 22.23.5. Signed EdgeDriver 158.0.4370.33 matched registered WebView2.  
Starting HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Ending HEAD SHA: `c292f5c5b117b3ec599da96b6617a2b3663c3daf`  
Validated paths: A's five paths below. The shared broker records the five V/R/M existing or proposed modules/tests plus the proposed viewport hook in the same eleven-path manifest.  
Validated path identities: sorted before and after manifests in `tmp/evidence/desktop-responsibility-refactors/DRR-A-SHARED-BASELINE-01/{inputs-before,inputs-after}.json`, both SHA-256 `70616453bbb24e69441c92d93eb83de932466c6ef509974e6ddfc22433c79f59`. Every unit path had empty porcelain status.

| A path under apps/desktop/src | Worktree SHA-256 | Filter-aware index blob |
| --- | --- | --- |
| App.tsx | 42da3e318ec0a5e6316a9b1a5b35220b0e57402bc1df2a32e4f28f9f22a60433 | 8fc96e395defcb5b6199ff1dd71ad49c991b3223 |
| App.test.tsx | 505b4968856d8c6135da66bfa5f597bd844d41ccdd7aadc3402e888392460c05 | f9f72a6ca53242871d2c25ea2ef03e9064c7e7e6 |
| persistence/reader-position-save-coordinator.ts | c1144b9a4dd5f84e8b38547bbd99714d95375e103f03c69e3246177c2cabd8ea | 7035d3865f4e7aa01a3d324bc0cae368560b7642 |
| persistence/reader-position-save-coordinator.test.ts | 1fdfbe28d5f5e4b3279e182a53943508a10c0002bf28f7343694eca4cd26df3a | 7c43cd9aec2517b8d6b800b7491d3579e041ffc5 |
| persistence/reader-appearance-writer.ts | ABSENT | ABSENT |

Identity recheck: PASS. Worktree, HEAD, index, discovered source membership, dirty source hashes, package exports and tool identities matched. The H patch was outside the closed paths and present in both captures.  
Commands and outcomes: `git diff --check HEAD -- <five A paths>` exited 0. The private manifest SHA-256 `b9d0125cf276518d7e1135ffcf51bc090d1b9932bac80d1d26cf46c3f390b7d1` binds each named gate's full command arguments, exact start/end times, output and input manifests. Commands use the matching [plan ledger](../../active/desktop-responsibility-refactors.md#minimum-local-run-ledger).

| Gate | Host execution | Result |
| --- | --- | --- |
| A-FMT, A-LINT | Scoped Prettier check and ESLint on the four existing A files | Both exit 0, 1.04 s and 3.88 s |
| BUILD-PACKAGES, A-TYPES | `pnpm.cmd build:packages`, `pnpm.cmd --filter @voxleaf/desktop typecheck` | Both exit 0, 1.03 s and 5.85 s |
| A-APP, A-POS | Filtered App regression group and entire position-save Vitest file | 9 selected/98 filtered and 24/24 passed, 22.11 s and 1.87 s |
| B-CHROMIUM | Both specified Playwright files with a single union of the A, V and RIA-03 filters | 13/13 passed, 30.14 s. Five A cases, six V cases, two M direct/worklet cases |
| B-NATIVE | `pnpm.cmd test:native-startup` | Exit 0, 73.02 s. Genuine thumb movement, restart persistence, typed child lifecycle and cleanup |
| B-NOV23 | Focused November reader mode with a 120,000 ms operation timeout on the same executable | Exit 0, 4.42 s. All five booleans true, including actual PageDown movement and preserved wheel checkpoint |
| B-F08 | Exact opt-in Cargo F08 test using that model-free executable | One passed, zero ignored, 19.70 s. Old shutdown leaves the live successor |
| B-PIPER | English Piper exact-host arm on that executable and existing offline configuration | Exit 0, 128.08 s. Terminal metrics observed, zero retained/discarded units, generated audio files or external requests |

Reused gates: none. These are newly executed shared **pre-edit** witnesses. A later unit must reference them explicitly, execute its focused current-state baseline, and renew affected candidate gates.  
Acceptance boundary: UNIT A baseline.  
Pending batch gates: A post-change, focused V/R/M baselines and candidate integrations, combined package/final.  
Preparation/cleanup: the ordinary executable SHA-256 was `785822b6eec9252bcc3e5bdde48fe02c0224088d6a9213e1d9bb36c60b0e3a54`. The candidate driver was fetched and signature-verified in isolated ignored scratch. EN preflight passed with process-local model paths and offline variables; the earlier readiness check lacked the two offline variables and launched no model. Model-free and Piper phases had separate configuration. Native runner cleanup succeeded. Existing firewall rules, installations, and permanent environment were untouched.  
Retries: one preflight-only retry after supplying the two documented offline flags. No gate retry.  
Diff scope: PASS. All A/V/R/M paths were clean before the first relevant source edit.  
Invariant review: PASS for baseline. A exercises existing App write coalescing and hydration, per-book position flush, actual Settings writes, and restart persistence. The teardown and three-choice cases remain assigned to A's patch.  
Test-integrity review: PASS. Current fixtures and assertions ran unchanged. The three integration families covered by B-CHROMIUM appear in its per-case log.  
Privacy/artifact review: PASS. Synthetic publication/voice flow only. Raw receipts and host details remain in ignored scratch.  
Action required: none for A baseline.
