# Change Review Report

Review ID: **DFM-CR-R01-20261114**  
Task ID: deep-findings-minimal-corrections, VF-0034 through VF-0055  
Reviewer: independent `change_reviewer`, GPT-6 Astra high  
Verdict: **BLOCKED**. Required acceptance evidence remains incomplete; two
actionable correctness gaps also require resolution.

This content-safe record preserves the returned verdict, findings and evidence.
Repository-relative owner links replace the review response's local absolute
links. The reviewer did not edit or execute tests.

## Identity

Base and reviewed HEAD: `fab1c9e186552515e828c33ce75e11628dda8300`.
Branch: `codex/deep-findings-minimal-corrections`. No pre-existing changes;
the index remained empty. The reviewer checked identities before and after.

The closed manifest at
`tmp/evidence/deep-findings-minimal-corrections/review-r01/manifest.json`
covers 47 task paths and 233 changed/supporting paths.

| Artifact | SHA-256 |
| --- | --- |
| Manifest | `faf2699e4f6e16c1c0eaaafd73d88000726cb54d4c72e186bd127d629d521413` |
| Complete tracked patch | `c736c896353ca6cccfb677eaf34a463765e127f16f13062e75621ed468e52003` |
| New file contents | `d8674222a8ca567473de3da5ac5160c0f88ebbe90c863cebedaaafb7f30ae7a7` |

Closed supporting addendum: unchanged
`apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts`, SHA-256
`b90aa60c1e440f34a95ae5a4c47f75e17dd73a42cde77478236f3daf71c6ee97`,
filter-aware Git blob `914c2ee56615c28582e265f1a5890fe2970253b3`.

Identity recheck: **PASS** for HEAD, all closed paths, addendum, artifacts,
statuses and empty index. No additional nonignored dirty paths existed.

## Acceptance and evidence reviewed

The reviewer inspected original triggers/qualifications, U1-U11 criteria,
production owners/callers, regression assertions and supplied host evidence.
The patch preserves local inference, ephemeral audio, existing limits and wire
contracts. VF-0036 historical locator ambiguity and VF-0050 interrupted-receipt
precision remain qualified. No other actionable defect was confirmed; this is
not final acceptance.

Receipt/log/environment/before/after hashes were checked for 25 selected receipts.
`g-js-closure-final-01` has TS static PASS, 655 EPUB tests and 812 desktop tests;
`g-py-final-03` has 58 tests plus one cache warning; `g-rust-green-01` has 80
passed/3 ignored in each feature mode. Node evidence includes
`g-static-node-final-03`, `g-native-harness-01` and the latest 76 passing cases in
`g-native-node-closure-01`. Chromium's `g-browser-final-05` has 16 passing cases,
with provenance renewal still required. Exact commands are bound in the receipts.
Original RED evidence was distinguished from setup errors and later GREEN.
The earlier desktop receipt remains 810 passed/2 failed, not retroactive PASS.

## Findings

1. **P3 / VF-0048 — pending speed preparation survives completion without
   another ended callback.** In `AdaptivePcmPlayer.synchronize` / `#handleEnded`,
   request a slower speed while the last audible unit plays. It ends while a
   later silent/omitted preparation batch is pending, so ended sees buffering.
   `acceptEmptyPreparedRange(true)` then changes the scheduler to complete. The
   retirement added only in ended is bypassed; late rejection can still call
   `#fallbackFutureRate`, select 100% and disagree with the saved preference.
   Resume after the final unit ended while paused has the same missing route.
   This residual is statically supported; runtime reproduction was not supplied.
   Retire preparation ownership whenever genuine completion is observed, before
   stale outcomes. Cover deferred empty-tail and paused-final-end completion,
   late success/rejection, no fallback/selection mutation, selection/reset and
   Stop/next Play at the saved speed. Preserve a real buffered successor.
2. **P3 / VF-0055 adjacent preparation — local work starts after synchronous
   Stop.** `ProductNarrationCoordinator.#prepareNarration` reserves and publishes
   after prepared segments are exhausted while audio remains below the target.
   Snapshot synchronization can confirm an unavailable next chapter and make the
   mounted Reader invoke Stop. The outer method then creates a new unaborted
   controller and calls `publication.prepareNarration`; the eventual token check
   suppresses its result but does not cancel obsolete work or its cleanup delay.
   The new regression covers pause/dispatch only. Reproduce this ordering with
   the mounted Reader and real scheduler/preparation boundary. If confirmed, add
   the post-publication ownership check before controller installation. Assert
   zero obsolete preparation starts, settled cleanup, no stale failure or
   publication and successful subsequent Play. Correct the evidence description;
   natural incidence remains unmeasured.

## Remaining uncertainty and next action

Current native Piper terminal-scene/rate acceptance, local V7 fault/repair/removal,
current-artifact ordinary install/uninstall/restoration, remaining provenance/reuse
closure and final evidence/documentation checks were pending. Preserve R01,
reproduce/correct both findings, renew affected checks and submit a new frozen
revision with the worklet supporting path. This report grants no validation or
Git authorization.
