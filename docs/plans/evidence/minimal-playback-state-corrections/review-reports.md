# Independent change review reports

Reports are immutable. This file remains outside each report's own identity
manifest. The reviewer inspected source and supplied host receipts without
editing or executing tests. No report authorizes Git/publication actions.

Publication formatting: Markdown hard breaks were normalized to blank paragraphs
for the Git whitespace check; report wording and verdicts are unchanged. The
original transcript is retained locally as
`tmp/evidence/minimal-playback-state-corrections/review-reports-original-before-git.md`
with SHA-256 `ef8a90ce2732a5f9bc770ba9f9c9149e0b97c8efb43b294b8c462fc8e845b7d4`.

## PSC-R1-20261031

### Change Review Report

**Review ID:** PSC-R1-20261031

**Task ID:** PSC-20261031

**Verdict:** **BLOCKED** — incomplete evidence for retained G2/G4 cases; no confirmed production defect.

**Base commit and reviewed HEAD:** `3cdab0b32e087a135eedf6822f033794295b9af2`

**Branch:** `codex/minimal-playback-state-plan`

**Reviewed paths and identities:** Closed manifest `tmp/evidence/minimal-playback-state-corrections/PSC-R1-20261031-manifest.json`, SHA-256 `07e734da7f62def7a5b1b739a591d1682750c13cce60c5c43f4df370ff0d9fef`: 57 task/support paths and 113 receipt artifacts. The untracked execution ledger was read directly.

Supplemental inspected identities:

| Path | SHA-256 | Filter-aware blob |
|---|---|---|
| `docs/README.md` — unchanged | `c08ba3fd28d82efe891b300ccf14074e588dc77e1a06fddb693d83bfcd75353e` | `dc9e8369fbef83a88e1213a1510b7edf69fa3a13` |
| `tmp/evidence/minimal-playback-state-corrections/G4-original-browser-source.ts` — ignored evidence | `7a2ae068c221e737b9d62792f904018f286129f30a1eb20af0cb51ce2f2a6d75` | `78525f2937b68defd687f71f42531b1c7ba13050` |
| `tmp/evidence/minimal-playback-state-corrections/PSC-R1-20261031.diff` — ignored evidence | `a3b484ba597f16931238143b971a3254ced136905bdf380f0eff0c18a3c118bb` | `1eba9ce129ea16466092824db44f683836d0b14c` |

**Identity recheck: PASS.** Base/HEAD remained unchanged. All manifest content hashes, blobs, statuses and receipt hashes matched; the index remained empty. The saved diff matched the current diff. No review-time drift was found.

**Acceptance review:**

- **PSC-01:** Resume rejects pending navigation and retired owners before player access; the compact control disables early Resume. Deferred-cleanup assertions preserve explicit later Resume at the selected target.
- **PSC-02:** Ownerless Resume leaves intent changes to successful start admission. Checking/unavailable attempts preserve paused intent and the target; subsequent availability completion does not autoplay.
- **PSC-03:** Fresh Play uses the existing visible-locator action. Internal start, recovery and heard-position persistence retain their separate targeting rules. Mounted tests assert B-first preparation after Pause/inspection/Stop without another viewport action.
- **PSC-04:** Rate selection/reset avoids retired player application while retaining preference updates, writes and status handling. Tests cover saved/unavailable storage outcomes and the next run’s selected rate.

The patch preserves identity-first invalidation, bounded ownership, local inference, ephemeral audio and structural persistence. No public schema or architecture-boundary change was found. Existing assertions were not weakened to hide a production failure. The G4 viewport correction preserves both visibility and B-first assertions.

**Test evidence reviewed:** Supplied normal-local-PowerShell receipts; I ran no tests, builds or formatters.

- G0: five-file baseline, **204 passed**.
- G1: **six intended behavioral failures**, retained as failures.
- G2: original aggregate remains **209 passed / one failed**. Renewed coordinator/control suites report **161 passed**.
- G3 final: `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, and `pnpm.cmd --filter @voxleaf/desktop typecheck` each exit **0**.
- G4: initial shell failure and later four-case failure remain failures. Corrected PSC-03 run reports **one passed**.
- G5: `pnpm.cmd package:piper-core:check` and `pnpm.cmd build:desktop` exit **0**.
- G6: supplied versioned Piper EN runner exits **0**, exercising six rates, synchronization and cancellation on executable SHA-256 `09e69a0f47531c2df9952b1a92a2bf09ae814bafca376c84c3b1e6162ed48932`. Resource restoration manifests match across all 2,024 entries; cleanup records no new owned processes/scratch, artifact drift, firewall differences or preview listener.
- G7 review evidence/whitespace/link checks pass; **78 links** checked.

**Evidence reuse decision:** Source independence is demonstrated for the remaining 49 G2 tests. I also independently confirmed that removing PSC-03 from original/current browser source leaves identical cases/helpers. However, execution-time installed-library/browser identities required by the plan’s individual-gate reuse rule were not captured. The coordinator confirmed no additional artifact exists. Therefore those **49 unit tests and three browser cases cannot presently supply final acceptance evidence**.

G3 final, G5 and G6 were executed after the final relevant TypeScript changes. Their recorded source/export comparisons show only subsequent Markdown changes, which these gates do not consume. **No additional execution is requested for those gates.** Preserve their original receipts and native artifact/resource/cleanup identities.

**Findings:** None confirmed. The blocker is missing evidence, not a demonstrated implementation defect.

**Remaining uncertainty:** Whether the retained partial G2/G4 results meet the required execution-environment equivalence cannot be established from versions and installed metadata alone.

**Required next action:** Renew only the missing coverage in normal local PowerShell, capturing library/browser identities and before/after input identities:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/persistence/narration-position-save-bridge.test.ts
pnpm.cmd --% test:browser reader-narration-bugfixes.smoke.spec.ts --grep "VCA-06/09|RAC-07|MPA-01/03"
```

The planned full G2 and four-case G4 commands are also sufficient, but not necessary. Preserve every original failure, update the ledger, and submit the resulting frozen patch/evidence under a **new Review ID**. No production correction is requested.

This report is not a Validation Report and grants no staging, commit, push, PR, merge or publication permission.

## PSC-R2-20261031

### Change Review Report

**Review ID:** PSC-R2-20261031

**Task ID:** PSC-20261031

**Verdict:** **APPROVE**

**Base commit and reviewed HEAD:** `3cdab0b32e087a135eedf6822f033794295b9af2`

**Branch:** `codex/minimal-playback-state-plan`

**Reviewed paths and identities:** Closed manifest `tmp/evidence/minimal-playback-state-corrections/PSC-R2-20261031-manifest.json`, SHA-256 `c07d2cfd8913b5283928d79e155e749e1745c28b1f7719c2330d5dd21c7fa39f`, containing 60 task/support paths and 142 receipt artifacts. Supplemental `docs/README.md` and original G4 browser-source identities remain exactly those recorded in PSC-R1-20261031.

Current diff artifact: `PSC-R2-20261031.diff`, SHA-256 `d83f6f60c7b00d288101e29e25edcf5c5b2c8d32d955ce5a138004b80a1b5270`, filter-aware blob `1712c4e449581c1ae450097855ee6cefb6d15a92`. Review reports remain outside their own manifests.

**Identity recheck: PASS.** Base/HEAD, reviewed path contents, filter-aware blobs, statuses and receipt hashes matched before/after inspection. The saved diff matches the actual patch; the index remains empty. All 251 generated exports and recorded G6 binary/renderer/wrapper artifacts match. No production or test source changed after R1.

**Acceptance review:**

- **PSC-01:** Early Resume cannot access a retiring player; navigation settlement remains explicit, and ordinary loaded-session Resume remains covered.
- **PSC-02:** Rejected ownerless Resume preserves paused intent and the selected target. Availability completion does not autoplay; a later explicit Resume starts the target.
- **PSC-03:** Fresh primary Play uses the visible locator. Resume, recovery and heard-position persistence retain their distinct authority. Mounted unit/browser assertions establish B-first preparation after passive inspection and Stop.
- **PSC-04:** Speed changes during Stop bypass retired-player application while updating/writing the preference and preserving storage-failure reporting. The next run receives the selected rate.

The changes remain confined to the two approved production owners. No actionable regression was found in cancellation, stale-session rejection, bounded ownership, local inference, ephemeral audio, synchronization or persistence. Existing behavior assertions remain meaningful; the corrected browser fixture retains visibility and B-first requirements.

**Test evidence reviewed:** All execution results below are attributed to supplied normal-local-PowerShell receipts. I executed no tests, formatters or builds.

| Evidence | Result |
|---|---|
| `G0-baseline` | 204 tests passed before implementation |
| `G1-regressions-red` | Six intended failures retained |
| `G2-test-types-corrected` | 161 coordinator/control tests passed |
| `R2-G2-readers` | Fresh 49 reader/highlight/persistence tests passed |
| `G4-psc-viewport-corrected` | PSC-03 browser case passed |
| `R2-G4-controls` | Fresh three browser controls passed |
| `G3-*-browser-final` | Format, lint and desktop typecheck passed |
| `G5-core`, `G5-build` | Package verification and current desktop build passed |
| `G6-piper-en` | Six-rate packaged WebView2 arm and verified cleanup passed |
| `R2-G7-*` | Evidence, whitespace and 79 Markdown-link checks passed |

The renewed commands were exactly:

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/persistence/narration-position-save-bridge.test.ts
pnpm.cmd --% test:browser reader-narration-bugfixes.smoke.spec.ts --grep "VCA-06/09|RAC-07|MPA-01/03"
```

**Evidence acceptance:** R1’s blocker is resolved by fresh execution, not by promoting partial results from failed aggregates. The new before/after inventories contain 24,050 entries and 20,123 files. Independent comparison confirms identical environment and membership, with only Vitest’s generated results cache and Chromium’s diagnostic log changing. Inspection of installed `ResultsCache.update/write` supports the cache classification. Source identities remained equal across both runs; all 251 exports match. The strict mismatch and original failures remain preserved.

Final-revision G3/G5/G6 evidence remains applicable: subsequent changes are documentation only, and the consumed source/artifact identities remain unchanged. G6 retains executable SHA-256 `09e69a0f47531c2df9952b1a92a2bf09ae814bafca376c84c3b1e6162ed48932`, complete resource-restoration proof and cleanup evidence. No further runtime renewal is required for this patch.

**Findings:** None.

**Remaining uncertainty:** None blocking the approved scope. Native evidence remains limited to the selected single-host Piper EN arm; it establishes no additional platform or performance claim.

**Required next action:** None for this frozen patch. Plan archival or other reviewed-content changes require a new immutable assessment before final completion.

Approval satisfies the independent change-review gate only. It is not a Validation Report and grants no staging, commit, push, PR, merge or publication permission.

## PSC-R3-20261031

### Change Review Report

**Review ID:** PSC-R3-20261031

**Task ID:** PSC-20261031

**Verdict:** **APPROVE**

**Base commit and reviewed HEAD:** `3cdab0b32e087a135eedf6822f033794295b9af2`

**Branch:** `codex/minimal-playback-state-plan`

**Reviewed paths and identities:**

- Closed manifest: `tmp/evidence/minimal-playback-state-corrections/PSC-R3-20261031-manifest.json`; SHA-256 `55c631daaca5dc24328e8c2e2301df0e6a1689c11b76e9f0ac88d68c93808212`. Contains 63 paths, including the deleted active plan and new completed plan, plus 142 receipt artifacts.
- Supplemental final-check manifest: `R3-final-check-identities.json`; SHA-256 `1129ea505981fc7a67f5d64837af35a271db1f03e7fc166fa474aab9340d2ccc`. Binds all 11 R3 documentation-check artifacts.
- Complete tracked diff: `PSC-R3-20261031.diff`; SHA-256 `e965608407ef4516bf33fab9b090b2eb59fc93bd097a1026f14d64e16301fda1`.
- New Markdown files were inspected directly. Immutable review reports remain outside their own manifests.

**Identity recheck: PASS.** Before/after comparisons found no manifest hash, blob, status or receipt mismatch. Base/HEAD remained unchanged; the index remains empty. The saved diff matches the actual patch. No non-Markdown reviewed path changed since R2. Recorded native/renderer/wrapper artifacts and all 251 generated exports still match.

**Acceptance review:** PSC-01–04 retain the R2-approved behavior: safe early Resume rejection, preserved paused intent after rejected admission, fresh Play targeting the visible passage after Stop, and speed preference updates without retired-player access. Cancellation, stale-session rejection, bounded ownership, local inference, ephemeral audio and heard-position authority remain unchanged.

Archival is consistent. The completed plan retains acceptance criteria, original failures, evidence limitations and review history. Active/completed/documentation indexes and the incoming testing link point to the completed plan. No stale incoming link to the deleted active plan was found. R1 remains BLOCKED in the historical record; R2 approval is accurately attributed. No broader runtime or platform claim was added.

**Test evidence reviewed:** Supplied normal-local-PowerShell receipts; I executed no tests, formatters or builds.

R2-approved evidence remains applicable because archival changed only documentation that runtime checks do not consume:

- 210 selected unit tests: 161 coordinator/control tests plus 49 renewed reader/highlight/persistence tests.
- Four selected Chromium cases: corrected PSC-03 plus three renewed controls.
- Final format, lint and desktop typecheck passes.
- Current package verification, desktop build and single-host Piper EN six-rate WebView2 pass.
- Verified resource restoration and native cleanup.

The native executable remains SHA-256 `09e69a0f47531c2df9952b1a92a2bf09ae814bafca376c84c3b1e6162ed48932`. Original failed aggregates remain failures; their partial results are not used to manufacture acceptance.

Fresh final-documentation receipts all match the current inputs:

| Receipt | Command | Outcome |
|---|---|---|
| `R3-G7-evidence` | `pnpm.cmd check:evidence` | Exit 0 |
| `R3-G7-diff` | `git diff --check` | Exit 0 |
| `R3-G7-links` | `& ./tmp/evidence/minimal-playback-state-corrections/check-links.ps1` | Exit 0; 363 links checked |

**Findings:** None.

**Remaining uncertainty:** None blocking the approved scope. Native evidence retains its single-host Piper EN limitation.

**Required next action:** None for the reviewed implementation and archival scope.

This approval completes the independent change-review gate for the exact final patch. It is not a Validation Report and grants no staging, commit, push, PR, merge or publication permission.
