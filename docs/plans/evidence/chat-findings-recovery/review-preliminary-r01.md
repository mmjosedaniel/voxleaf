# Change Review Report

Review ID: **CFR-CR-PRELIM-R01-20261113**  
Task ID: **chat-findings-recovery / CFR-R01**  
Verdict: **BLOCKED**

Concrete corrections are required below. Final acceptance is also blocked by missing and stale evidence. This is the requested preliminary review; it is not approval to commit, push, or create a PR.

**Base commit and reviewed HEAD:** both `95eb4887121f2696beabade407d04afa6441e881`.

**Reviewed paths and identities:** the closed 77-path manifest at `tmp/evidence/chat-findings-recovery/cfr-preliminary-r01/manifest.json`, SHA-256:

`af0fec5c627cf5ee0268ff259d0c65d202d4565424561196bd692e9099fef44b`

Tracked patch SHA-256:

`fda58521b112b5592f54d116316a1b9c137045899663f9abf93d613369933532`

Evidence-index SHA-256:

`6d9133911307fcd3ded5d2b08137363c76c0e196129d951e9810631bcd7ffc49`

**Identity recheck: PASS.** Before and after inspection, all 77 path identities matched the supplied status, worktree SHA-256, and filter-aware Git blob. HEAD/base remained unchanged, the index remained empty, and no changed path fell outside the manifest. The current tracked diff matched `patch.diff`; all five files under `new/` matched the worktree byte-for-byte. Supplied evidence-index hashes also matched. Final primary recheck: `2026-11-13T02:24:08.8070368Z`.

Additional unchanged supporting paths inspected are recorded at the end of this report.

**Acceptance review**

I inspected the patch against the 24 dispositions and 11 implementation units, including relevant requirements, ADRs, direct callers, and assertions.

- Case 1’s deliberate recovery preference remains unchanged.
- U1 has an observed manual-recovery failure, a keyboard-provenance omission, and missing required race coverage.
- U2’s healthy saved Piper no-op is placed before both configuration work and the UI recovery-reset callback.
- U3 separates startup reconciliation from polling, but its retry remains latched in one resolved-obstruction case.
- U4 preserves inert external/no-href descendants and introduces bounded visible navigation separators without adding network behavior.
- U5 contains an editorial-label regression in its new numeric-neighbor check.
- U6 retains the existing work controller and hard ceilings while advancing only admitted whitespace.
- U7/U8 preserve existing-session admission and purpose-based preflight semantics.
- U9 keeps v2 isolated and uses rational comparisons for opt-in v3; current authority evidence needs renewal.
- U10 introduces private pending cleanup state and delays success publication until deletion, but some explicitly required fault/ownership coverage is still absent.
- U11 retains strict receipt fields and ordered arrays, reconstructs installed-binary evidence, and checks exact artifact hashes before atomic replacement.

No new production dependency, EPUB transmission path, generated-audio persistence, or changed audio protocol was identified in the patch. Native runtime and installation claims remain unverified pending their selected gates.

**Test evidence reviewed**

These are supplied host results, not commands executed by this reviewer.

| Evidence | Supplied command/result | Current applicability |
|---|---|---|
| `g1-final` | ExecPlan G1 14-file desktop Vitest command; exit 1, 584/585 passed | The failed accessibility case was followed by the focused renewal below. Affected checks require renewal after corrections. |
| `g1-controls-final` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/OptionalChatterboxControls.test.tsx`; exit 0, 25/25 | Relevant control source matches the reviewed patch. |
| `m2-built-green` | ExecPlan G2 10-file EPUB Vitest command; exit 0, 561 tests | **Stale for final acceptance.** Several consumed EPUB production/test hashes differ from the reviewed patch. Coordinator confirmed subsequent formatting and no immutable equivalence artifact or later G2 receipt. |
| `m1-final-02`, `m1-v12-final` | Seven selected Python suites: 122 passed; subsequent v12 renewal: 23 passed; reported final Python static checks passed | Python production matches. The v12 test change has its renewal. **Current v3 authority JSON differs**, requiring the screen/authority selection to be renewed. |
| `g4-final` | `node --test apps/desktop/scripts/windows-release.node-test.mjs`; exit 0, 48/48 | Release owner and relevant input rows match; broad capture contains unrelated later browser/document changes. |
| `g5-default-final-04`, `g5-locked-final-04` | Selected optional-package Cargo tests in default and `release-locked-runtime` modes; exit 0, 80 passed and 3 ignored each | Reviewed Rust production/tests match. Ignored tests do not establish exact local admission. |
| `g6-stop-invalid-rect` | Recorded Playwright `--grep 'stopped-manual-recovery'` command; exit 1 | Current browser fixture and production source match. Confirms F1. |
| `g10-native-harness` | Three recorded Node harness leaves plus `AdaptivePreparationControls.test.tsx`; exit 0, reported 99 Node and 12 Vitest tests | Useful harness evidence; does not replace G7–G9. |

G6’s earlier integrated run lacked complete browser-byte capture. G7, G8, G9, final TypeScript G11 renewal, and final G12 acceptance/evidence checks remain pending.

**Findings**

**F1 — P2 — Real manual scrolling does not restore Play after unavailable stopped placement.**

- **Location:** `ReaderPublication.tsx:493,1250`; `active-visual-locator.ts:414,427,604`; `product-narration-coordinator.ts:updateVisibleLocator`.
- **Trigger:** Pause at A, admit B, Stop before placement settles, complete placement with unavailable geometry, restore geometry, resize, then perform a trusted wheel scroll.
- **Consequence:** The viewport moves, but Play remains disabled, violating case 3.
- **Evidence:** `g6-stop-invalid-rect.log` fails the enabled assertion at browser test line 4998. The trace records wheel input and subsequent scroll movement beyond the initial `scrollTop` of 13. Production unlocks availability only when the manual flag survives intent admission, sampling, and the Reader callback. The deterministic equal-locator test directly calls `updateVisibleLocator(locator, true)`, bypassing this chain.
- **Cause confidence:** The integration defect is confirmed. The supplied trace does **not** identify the precise handoff that loses manual provenance; attributing it conclusively to wheel dispatch timing, suspension, or measurement would be speculation.
- **Correction criterion:** Diagnose that handoff with bounded, content-free observations, then make the existing real-browser case pass. Verify explicit Play uses the newly measured passage, equal-coordinate recovery also works, and resize/follow/reflow alone cannot unlock Play or alter heard progress.

**F2 — P2 — Normal keyboard reading focus cannot establish manual-scroll provenance.**

- **Location:** `ReaderPublication.tsx:1258`, especially `event.target === event.currentTarget`; `focusReaderContent` and `focusDestination`; `SemanticDocument.tsx:684`.
- **Trigger:** Focus the reading article through the reader’s normal focus route, then use PageDown/ArrowDown to scroll during pending follow or after unavailable placement.
- **Consequence:** The key event targets the descendant article or heading, so the new handler never records manual intent. Consequently, actual keyboard scrolling cannot use the new recovery/arbitration path.
- **Evidence:** Both reader focus helpers focus descendants. The scroll viewport has `tabIndex={-1}` and the key handler admits only events targeting that viewport itself.
- **Correction criterion:** Admit supported reading-navigation keys from eligible noninteractive reading descendants while preserving selection, modifier, zoom, and interactive-control behavior. Test through the normal focus route with measured movement; a synthetic key event targeting the viewport alone is insufficient.

**F3 — P2 — Check cannot clear a resolved startup staging failure when staging is already absent.**

- **Location:** `tts_optional_chatterbox.rs:reconcile_staging_locked`, especially line 2035; `verify_owned_removal_chain:838`.
- **Trigger:** Startup encounters malformed or locked staging and records `Failed/CleanupFailed`. The obstruction is subsequently removed, leaving no staging path, and the user selects Check.
- **Consequence:** `verify_owned_removal_chain` returns `Ok(false)`, whose branch leaves the failed operation unchanged. `snapshot_operation` then republishes that failure indefinitely despite resolved staging.
- **Evidence:** Direct branch trace through `retry_cleanup → reconcile_staging_locked → Ok(false) → snapshot_with_manifest`. Existing tests recover while staging still exists; they do not cover its absence after obstruction removal.
- **Correction criterion:** Recognize successful resolution of this owned reconciliation failure when staging is proven absent, without clearing unrelated transfer/removal failures or postcommit provenance. Add the absent-after-failure retry case with active/backup sentinels.

**F4 — P2 — Multi-digit editorial labels are misclassified as numeric range endpoints.**

- **Location:** `narration-bilingual-normalizer.ts:hasEnDashNumericNeighbor`, lines 559–572.
- **Trigger:** An editorial label such as `R18 – 14:30`.
- **Consequence:** The standalone supported time loses its normal expansion because the label is incorrectly treated as the preceding numeric endpoint.
- **Evidence:** Backward inspection consumes `8`, then `afterDigits` reads only `1`. Because `1` is not a letter, the function returns true without reaching `R`. The existing `R8` control passes because its immediately preceding character is the letter. This contradicts U5’s preservation of editorial punctuation.
- **Correction criterion:** Inspect the bounded numeric run sufficiently to distinguish an alphanumeric label from a numeric endpoint. Add multi-digit editorial-label controls alongside the existing time/date/percentage range cases, preserving lookahead and language/code barriers.

**F5 — P2 — CFR-12 and CFR-17 labels do not supply the required new race coverage.**

- **Location:** `reader-reflow-restoration.smoke.spec.ts:566`; `reader-narration-bugfixes.smoke.spec.ts:720`; `ReaderPublication.test.tsx:2257`; `segment-highlight-controller.test.tsx` CFR-17 case.
- **Trigger:** Two appearance changes arrive while initial placement is pending, or real manual motion occurs before the pending follow correction executes.
- **Consequence:** These explicitly approved acceptance criteria remain unproven, allowing the original cross-owner races to survive passing renamed cases.
- **Evidence:** Both browser changes only prepend CFR labels. The appearance test waits for the reader to finish loading before editing. The inspection test scrolls after Pause and waits 150 ms. The new controller test supplies `admitManualScrollMovement: () => true`, bypassing actual gesture admission. The Reader preference test verifies a controlled rerender without pending initial restoration or App persistence.
- **Correction criterion:** Add discriminating cases for both appearance-edit orders during held initial placement through real App/Reader callbacks, including reopen/persistence; and genuine movement before the second follow frame with non-gesture controls. Retain the existing tests as neighboring controls.

**Remaining uncertainty and missing evidence**

- F1’s precise runtime provenance-loss point remains unidentified.
- U10’s selected test file covers setup, close, metadata/HTML failures and resumable deletion/publication faults, but lacks the plan’s explicit existing-quality/publication-conflict and substituted cleanup-identity controls. Supply existing evidence if available; otherwise add focused synthetic cases.
- U9’s new synthetic exact tie is covered, but the stated v3 threshold/later-tie-breaker controls are not established by the supplied tests. Renew the relevant selection on the current authority bytes and cover those required boundaries.
- G2 and the v3 screen/authority results cannot be renewed by replacing their historical hashes.
- No exact current native startup/Piper, optional admission, installer lifecycle, or restoration acceptance is established here.

**Required next action**

Correct F1–F4 and close F5 plus the specified coverage gaps. Then run the smallest affected host selections, renew G2 and the v3 screen/authority selection on final inputs, complete pending G6–G12 gates, and submit a new frozen request with a new review ID. Preserve this report and the failed/stale receipts unchanged.

**Supplemental reviewed identities**

All following paths were unchanged in the initial full-worktree status and matched their HEAD blobs on recheck. Each row is `path | status | SHA-256 | filtered Git blob`.

```text
docs/product/mvp.md | clean | fc5fba770ed937bcef277c0ad4f9dbf4713563283f36ce38dc3efea784400e04 | 64a6fdcc385f920c2a801bc3918e773557aa87c9
docs/product/reader-settings-and-playback-controls.md | clean | 63e29b3a4dc53f4d18a76eea13eeeb908951dfbc466b95bdc88b6c9ff614f88a | 61141dc1c3020892313999ab42aa9492cc2ae36f
docs/plans/roadmap.md | clean | 664a0323d2b20e055ac64b104479aa11e751ef45ce71ed8a607ab27584f34428 | 21f8bc4a2e4898f2ed6518b527e9e9c8cb50c6f5
docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md | clean | ea3b9467cbad1b97b89c19576a66821080313895338fdb6ec37eeab4cf970166 | 779c6d0a1cebb28de26bd36a54c97ec0f6e121d4
docs/architecture/decisions/ADR-0012-bounded-narration-preparation.md | clean | 4bde996094e134189abe98600b7b8af4fc002ad5645dafc71426403f79b7cf73 | b7af31a9544520cf5dba8fa3f524fca660ee3a44
docs/architecture/decisions/ADR-0066-bounded-orientation-and-silent-tail-corrections.md | clean | c1f6ffe553aa1edb5d08065e8f75454ebd590c8443232004790af4d2f4c87316 | 250dd6d4ea6590824294960d07bcbd69c9295e84
docs/architecture/decisions/ADR-0071-reader-checkpoint-and-image-lifetime.md | clean | 03bbf9f1353fd6eaef78c3acf7a669b9e3050e0ff4107de20738de9f09c36416 | 84b49ec18d88fe54bf529721a1fc7348064bb351
.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md | clean | a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae | 16ba1a7002366ad9312223d51dace7902d6ae751
apps/desktop/src/reader/active-visual-locator.test.ts | clean | 7985c0aa41a60844bb1322f9d8fa574cc11340f6e783081b67786d87accaa0a5 | d374d9b01e2abe03ac571175f1ca0aa427e59a13
apps/desktop/src/reader/reader-reflow-restoration.test.ts | clean | 6e39dc96441f54af8ff42ffef7a2ef2373d8b45cbd77308d2aa482eb038b8fee | c30c318d9ac02b62868c056a38fa2d8f63f5f816
apps/desktop/src/App.test.tsx | clean | 9eb2462a1f56a1215bd1013877f28fb627e74b7b1c29bc4ec6455edd6d0072cd | ad58e1ef79693a60d02b8c819d7a8e644a88df1d
apps/desktop/src/reader/SemanticDocument.tsx | clean | b1fda81333856a1ce98d4a49a766d24183459cb1c48ac3e2847f46045f22970d | 1f851d9dd5d2e3bc23d2861503e5ced044794d5c
apps/desktop/src-tauri/src/main.rs | clean | 8e1c2349d15296ad10170c42619559b43611297d3945e99f07505fd8a3a403c3 | dc0de1e6a4294d5c43fd35170ec206c6e2bf9329
```
