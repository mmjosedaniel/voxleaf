# App preference effects readability

Status: complete and archived on 2026-10-11. Both extractions, characterization,
focused tests and all independent acceptance gates passed. Changes are unstaged
and uncommitted on the existing branch.
Prepared and execution started on 2026-10-11.
Branch: `codex/app-preference-effects-readability`, created from clean local
`main` at `0414fdc5b00f407333457ff855e2ae30dc6c8ebf`.

## 1. Goal

Extract the startup preference hydration and narration-start presentation
subscription from `apps/desktop/src/App.tsx`, preserving their observable
behavior, effect order and resource ownership. Add characterization tests before
the extraction and colocated tests for the resulting module.

Both extractions are required deliverables. Completing characterization tests
while leaving startup hydration inline does not complete this plan.

This is a bounded continuation of the completed
[App hardware effects plan](../completed/app-hardware-effects-readability.md)
and [App readability plan](../completed/app-readability.md). Those plans remain
historical records. The descriptive filename reflects maintenance across
existing reader and Settings responsibilities, not a new roadmap milestone.

## 2. User-visible outcome

Reader appearance, Quick/Prepared selection, preference statuses, persistence
availability, restoration, reset and publication replacement behave as before.
There is no new loading policy, race correction, feature or performance claim.

App states which preference connections it establishes. A focused Settings
module explains how initial reads and narrator observations update presentation.
App continues to own the states, repositories, coordinators and event handlers.

## 3. Current state

At the planning HEAD, App has nine direct `useEffect` calls. Source locations
below are navigation aids for that snapshot, not execution-time identities.

| Slice | Disposition |
| --- | --- |
| Preference ref synchronization, line 212 | RETAIN: one assignment; handlers also update this ref synchronously. |
| Startup preference hydration, lines 240-295 | CHANGE: move the complete effect into `usePreferenceHydration` after characterization. |
| Narration-start snapshot subscription, lines 332-346 | CHANGE: extract `bindNarrationStartPreferencePresentation`, retaining the App effect and absent-coordinator guard. |
| Hardware visibility binding, line 348 | RETAIN: already delegates to `bindHardwareCompatibilityChecks`. |
| Publication restoration, line 357 | RETAIN: publication identity, sequence, settlement and cancellation stay together. |
| Save-coordinator lifecycle, line 464 | RETAIN: shared active-resource references and cleanup tokens remain in App. |
| Narration/persistence bridge, line 490 | RETAIN: already delegates to `bindNarrationPositionPersistence`. |
| Recovered-position saving, line 503 | RETAIN: preserve the visual-settlement guard. |
| Application cleanup, line 522 | RETAIN: preserve restoration, active-save and reader cleanup call order. |

The two presentation interfaces are currently private to App, at lines 137 and
143. `fallbackNarrationStart` receives updates from hydration, the active
narrator, successful explicit writes and reset. Reader preference presentation
also receives restoration and user edits. Extracting an effect must not create
a second state owner or introduce precedence between these sources.

`App.test.tsx:537-541` intentionally leaves an initial preference read pending.
Existing integration tests cover StrictMode restoration, saved preferences,
recovered-position settlement, replacement, audible progress and reset, but
that pending fixture does not establish late hydration behavior.

Read-only audit `APP-PREFERENCE-EFFECTS-01` recommends CHANGE with medium risk
for the two preference connections as one unit. It did not execute tests and
does not constitute a passing implementation baseline.

## 4. Scope and non-goals

Use one source/test unit, `APP-PREFERENCE-EFFECTS-01`, with this closed allowlist:

1. `apps/desktop/src/App.tsx`.
2. `apps/desktop/src/App.test.tsx`.
3. `apps/desktop/src/settings/app-preference-effects.ts` (new).
4. `apps/desktop/src/settings/app-preference-effects.test.tsx` (new).

The execution ceiling is four files and at most 1,500 added/deleted lines,
primarily tests, following the final measured ceiling addendum at `02259dea`. Freeze this limit
in the work order after baseline; if
the necessary matrix exceeds it, re-audit and revise the order before expanding.
Do not compress tests or weaken assertions to meet a numerical target.

Keep focused module tests colocated and App integration cases in App's suite.
Do not split the entire test suite, add a generic hooks/utilities directory,
change the test runner or add production dependencies.

Other effects, handlers, lifecycle tokens, refs, coordinator implementations,
storage schemas, defaults, UI/DOM/CSS/copy, public App props, EPUB/shared code,
native code, Python, inference, playback and generated sources are excluded.
No new singleton, aggregate App controller, cancellation API, preference cache,
write-on-read behavior or preference precedence policy is authorized.

Execution documentation paths are this plan, `docs/README.md` and
`docs/plans/active/README.md`. Future concise evidence belongs under
`docs/plans/evidence/app-preference-effects-readability/`; raw logs and temporary
scripts belong in ignored `tmp/evidence/app-preference-effects-readability/`.
Keep evidence outside the source validation manifest.

The 2026-10-11 execution request authorizes implementation, tests and
documentation on the existing branch. This plan does not
authorize staging, commits, pushes, pull requests or changes to `main`. The
source phases below form one unit and need no intermediate commit. Preserve
unrelated work, including these unstaged planning documents, and keep the index
empty unless the user later explicitly authorizes a separate Git action.

## 5. Relevant files and documentation

Read `AGENTS.md`, `.agents/PLANS.md`, `orchestrate-safe-refactor` and
`validate-safe-refactor`, including their complete contract and validation
references. Consult:

- [Documentation index](../../README.md), [MVP](../../product/mvp.md) and
  [roadmap](../roadmap.md).
- [Reader settings requirements](../../product/reader-settings-and-playback-controls.md).
- [System diagram](../../architecture/system-diagram.md) and
  [architecture overview](../../architecture/overview.md).
- [ADR-0008](../../architecture/decisions/ADR-0008-visual-reader-architecture.md),
  [ADR-0011](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md)
  and [ADR-0041](../../architecture/decisions/ADR-0041-simplify-empty-and-ready-reader-chrome.md).
- [Testing guidance](../../development/testing.md) and
  [evidence retention](../../development/evidence-retention.md).

Inspect App, its tests, both package manifests and `apps/desktop/vite.config.ts`.
The existing Vitest setup uses jsdom and colocated tests. Inspect these unchanged
collaborators under `apps/desktop/src/`, with their existing tests:

- `persistence/reader-position-repository.ts`,
  `persistence/narration-start-preference.ts`, and
  `persistence/reader-position-restore-coordinator.ts`.
- `reader/reader-preferences.ts`, `tts/product-narration-coordinator.ts`,
  `settings/ReaderSettingsDialog.tsx`, and `settings/narration-settings-actions.ts`.
- `persistence/reader-position-save-coordinator.ts`,
  `persistence/narration-position-save-bridge.ts`, and
  `strict-mode-resource-cleanup.ts` for preserved ownership and ordering.

Reinspect current files and scripts at execution time. Previous plans and this
planning snapshot cannot substitute for a fresh baseline.

## 6. Architecture and constraints

### Module and interfaces

Create `settings/app-preference-effects.ts` with two named exports:

- `usePreferenceHydration(options): void`, containing the initial-read effect.
- `bindNarrationStartPreferencePresentation(source, publish): () => void`,
  containing the existing observation, projection and subscription logic.

The module also owns the existing readonly `ReaderPreferencePresentation` and
`NarrationStartPreferencePresentation` interfaces and their unchanged status
unions. App imports their types; the support module never imports App. These
are internal desktop types, not shared or process contracts.

The hydration input names the reader read source, narration read source,
restore preference sink, existing default values and two presentation setters.
Use narrow structural contracts, such as `Pick<ReaderPositionRepository,
"readPreferences">`, `Pick<NarrationStartPreferenceRepository, "read">` and
`Pick<ReaderPositionRestoreCoordinator, "setPreferences">`. The binding needs
only `observe`, `subscribe` and the three snapshot fields it projects.
Use type-only imports for collaborators; do not construct or close them here.

App retains both `useState` initializers, default constant selection, lazy
repository/coordinator creation, `currentReaderPreferences`, callbacks and
restoration state. Pass existing stable setters directly. Destructure hook
options and list their reactive members as dependencies; a fresh options object
must not itself become an effect dependency. Keep default references stable.
An unrelated render must not restart reads or subscriptions.

Call the hydration hook at the former effect's position. Keep the narration
binding effect after narration resource cleanup, with its original coordinator
dependency and undefined guard. Do not merge these two effects or reorder them
relative to restoration, saving, hardware or cleanup effects.

### Hydration invariants

1. Start both reads independently in the same effect execution, preserving
   invocation order and method receivers. Do not serialize them, combine their
   completion with `Promise.all`, or cache/deduplicate across executions.
2. Each execution has its own `active` guard. Cleanup suppresses its later
   success and rejection handlers; it does not cancel the repository reads.
3. A ready reader result uses its preferences. Every other resolved status uses
   the existing defaults while preserving that status. Set the restore
   coordinator's preferences before publishing reader presentation.
4. A reader rejection publishes defaults with `unavailable` and `canPersist:
   true`, without calling the restore coordinator's `setPreferences`. Preserve
   this difference from a resolved `unavailable` result.
5. A resolved narration result uses `result.selection` for every status; a
   rejection uses the existing narration default and `unavailable` status.
   Only `unsupported-version` disables persistence in either presentation.
6. Preserve the two separate promise/error chains. Do not normalize their
   behavior through a generic asynchronous loader or introduce writes.
7. Preserve observed interactions with restoration, explicit edits, reset and
   narrator snapshots. Do not assume late reads are currently discarded while
   the effect remains active; characterize their actual order first.

### Narrator binding invariants

Observe and publish the initial snapshot before subscribing, as the current
effect does. Project exactly `selection`, `startPreferenceStatus` and
`canPersistStartPreference` into the existing presentation shape. Notifications
repeat that projection. Preserve method receivers and return the unsubscribe
function for React cleanup. Coordinator replacement disconnects the previous
source. Disconnection never resets fallback state, writes storage or closes
the coordinator; an absent coordinator establishes no connection.

EPUB contents remain local, inference remains local, generated audio remains
memory-only, buffers remain bounded, and stable-locator/cancellation ownership
is untouched. Malformed EPUB handling remains in its current owner. Only
repository-authored synthetic fixtures and content-free evidence are admitted.

The canonical diagram retains application-owned preference/persistence flow.
Review it at closure; no diagram or ADR change is expected for these internal
functions. A new owner, data flow or public policy would exceed this plan.

## 7. Milestones

### Milestone 1: Refresh the unit and establish its baseline

Status: complete. Fresh audit and BASELINE-002 accepted at execution HEAD.

The director reuses one Sol high auditor, one Sol high worker and one Astra high
validator for this batch; only the worker writes source. They must not delegate.
Keep the four-role concurrency limit and use the Git steward only for separately
authorized actions. Do not substitute unavailable required roles or models.

Verify the actual branch, HEAD, empty index and clean four-path source allowlist.
Preserve unrelated unstaged documents. Refresh the Audit Packet and draft terms,
then have the independent validator run the baseline group in section 8 outside
the sandbox. Planned new files are recorded as ABSENT. A relevant failure is
BASELINE-FAIL; do not issue a production work order or opportunistically fix it.

After PASS, freeze an Approved Work Order binding this unit, invariants,
ceiling, commands and baseline Report ID. Its initial characterization phase
has the narrower two-path allowlist `App.tsx` and `App.test.tsx`; only the latter
may change. The extraction remains gated on the checkpoint below.

### Milestone 2: Characterize the unchanged production effects

Status: complete. CHARACTERIZATION-002 accepted after one mechanical correction.

The worker adds controlled-promise and integration cases in `App.test.tsx`
against the unchanged production code. Cover the section 8 matrix without
copying the effect implementation into tests or changing production seams.
Use existing injected repositories/coordinator factory and observable reader
or Settings boundaries; use narrowly scoped collaborator spies when necessary.

The worker then stops. The validator verifies that production source still
matches baseline and runs the characterization checkpoint commands. Record a
separate immutable report, with phase explicitly labeled characterization.
This interim POST-CHANGE manifest contains only `App.tsx` and `App.test.tsx`,
both existing files; it is not final acceptance of the unit. Separately verify
that the two planned module paths remain ABSENT, as in the initial baseline.

Record actual order rather than prescribing a new winner for late results. If
a confirmed contradiction with product requirements appears, document it as a
separate defect and reassess before continuing; do not fix it inside this
refactor or label a blocked extraction complete.

After checkpoint PASS, freeze the extraction continuation order with both the
initial baseline and checkpoint identities. Retain the added App tests. This
continues the same unit, so their known worktree changes are expected; do not
restart baseline mode, commit, stash or discard them to manufacture clean paths.

### Milestone 3: Extract both preference connections

Status: complete; both connections and 16 module cases accepted by POST-CHANGE-002.

The same worker creates the module and its colocated test file, moves the
presentation types without altering them, replaces startup hydration with
`usePreferenceHydration`, and replaces the narration effect body with the
guarded binding call. Keep all other effects and handlers unchanged.

Add focused hook/binding tests for the new module, complementing the retained
integration cases. Return a Change Packet mapping both required extractions,
type moves and tests to the work order. A tests-only patch, renamed inline
function or partial extraction cannot satisfy this milestone.

### Milestone 4: Independent acceptance and documentation closure

Status: complete. POST-CHANGE-002, PACKAGE-001 and FINAL-002 accepted;
source identities unchanged through documentation closure.

With source writing and Git mutations idle, the independent validator reviews
the whole unit against baseline, verifies invariants/test integrity and runs
the post-change group. Require a unique POST-CHANGE PASS for the completed four
paths, then PACKAGE and FINAL reports for the aggregate commands.

Each report records starting/ending HEAD, exact porcelain status, SHA-256 and
filter-aware blob identity for every validated path, plus a post-command
identity recheck. Keep reports immutable and outside validated paths. Drift or
missing evidence blocks acceptance; a changed patch requires fresh validation,
not replacement hashes in an old receipt. Permit at most two correction loops
with the same worker before redesigning the order.

Review the complete diff for scope, privacy and preserved App ownership. Verify
the diagram still matches the code. Update this plan and its navigation entries,
then move only this plan to `docs/plans/completed/` after both extractions and
all required checks are accepted. Preserve predecessor plans and evidence.
Report exact commands, counts, limitations and the unchanged Git authorization.

## 8. Testing and benchmark strategy

All test and validation commands run from the repository root in normal local
PowerShell outside the managed sandbox. Sandbox output is exploratory only.
Scripts below exist in the inspected package manifests; no new test command or
dependency is required. The desktop `test` script runs Vitest and Node suites.

| Required evidence | Level and timing |
| --- | --- |
| Ready and all non-ready statuses from both repository contracts; defaults, unsupported-version persistence guard and no writes | Parameterized App characterization, then focused module assertions where they expose the new boundary. |
| Resolved reader `unavailable` versus rejected reader read | Establish the differing restore-coordinator calls before extraction and preserve them afterward. |
| Either read settles while the other remains pending | Controlled promises; assert independent application, including independent rejection. |
| Late reader results before/after restoration and explicit preference edits | App integration on unchanged source; retain exact observable outcomes after extraction. |
| Late narration reads before/after reset and narrator observations | App integration with independently controlled repository/coordinator events; no invented precedence rule. |
| Unmount and StrictMode setup/cleanup/setup with outstanding reads | Characterize App behavior; hook harness verifies obsolete executions publish nothing and the current execution remains effective. |
| Initial snapshot, later notifications, absent/replaced coordinator and unsubscribe | Characterize App connection; binding tests assert observe/publish-before-subscribe, exact disconnect and no fallback reset or coordinator close. |
| Unrelated rerender with stable members and a fresh options object | Hook harness verifies reads are not restarted; retain App rerender coverage. |
| Existing restoration, recovered settlement, replacement flush, reset, heard progress, picker/focus and error cleanup | Retain App tests and run the configured desktop/browser suites. |

Tests use deferred promises and explicit event delivery, not arbitrary sleeps.
Do not delete the current pending-read notice tests; add the missing completion
cases. Avoid broad snapshots, implementation copies and assertions that only
mirror type aliases. Characterization records existing behavior without making
an observed defect a new product guarantee.

Baseline group, before any source or test edits:

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd test:browser
```

Characterization checkpoint, after test-only edits and before extraction:

```powershell
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
```

Post-change: repeat the complete baseline group, then run:

```powershell
pnpm.cmd test:native-startup
```

The browser gate protects reader/Settings integration. Native startup checks
the packaged App startup and restoration path affected by moving hydration.
Use the existing documented browser/WebView2 prerequisites. A missing runtime
or driver is a blocked host gate, not an accepted omission or proof of a source
regression. Preserve any failure and its later resolution as separate evidence.

Package and final acceptance, respectively:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
```

No model-backed benchmark, new exact-host TTS matrix or performance claim is
planned: scheduling, inference, audio and coordinator implementations do not
change. If the actual patch reaches those boundaries, stop for a new audit and
the applicable gates rather than silently expanding this unit.

## 9. Risks and rollback

The main risks are restarting hydration through unstable dependencies, changing
late-result precedence, treating resolved failures like rejections, changing
observe/subscribe order, or accidentally moving state/resource ownership.
The characterization checkpoint and independent identity-bound validation
address these risks before accepting the final extraction.

If the patch cannot preserve behavior within this boundary, retain the report
and stop at the failed milestone. Roll back only verified worker-authored hunks
and new files, preserving pre-existing documents and user changes. Do not use
broad reset, clean, restore, checkout or stash operations. Do not start another
source unit with a rejected patch present. No deployed migration or stored-data
rollback is needed because persistence formats and writes are unchanged.

## 10. Progress log

- 2026-10-11 closure: FINAL-002 passed the entire unchanged check: 87 default/
  88 release-locked Rust tests, 485 Python tests, all TypeScript suites and all
  builds. The earlier reaping failure remains unexplained and recorded in
  FINAL-001; no Rust change or assertion relaxation occurred. Accepted exact
  identity-bound POST-CHANGE-002/PACKAGE-001/FINAL-002 reports; reviewed canonical
  diagram correspondence and found no architecture change. Archived this plan
  and updated navigation after acceptance. No staging, commit, push, PR, merge
  or main modification.
- 2026-10-11 execution: PACKAGE-001 passed check:portable, including 485 Python
  tests and all portable builds. FINAL-001 failed the unchanged native
  `failed_job_assignment_kills_and_reaps_the_spawned_child` assertion in the
  release-locked Rust suite (87 passed/1 failed), after default Rust 87/87
  passed. Python/final builds were not reached. Preserved FAIL and authorized
  one complete unchanged check repeat after read-only host/source inspection;
  no assertion weakening or out-of-scope fix.
- 2026-10-11 execution: POST-CHANGE-002 passed all seven commands, including
  56 desktop files/646 Vitest tests, 51 Node tests, seven Chromium cases and
  packaged native startup/restart/restoration with zero errors/external requests.
  Every source identity matched before/after. Both required extractions accepted;
  PACKAGE and FINAL aggregate reports now running on the same frozen source.
- 2026-10-11 execution: POST-CHANGE-001 passed build/type/test/format/lint and
  seven Chromium scenarios, but native release startup could not create its
  WebView session. Preserved BLOCKED report with matching source identities.
  Live diagnosis found PATH EdgeDriver 150.0.4078.83 against WebView2
  155.0.4283.45; an existing Microsoft-signed matching driver was verified.
  Authorized a process-only driver override and fresh complete POST-CHANGE-002;
  no source, global environment or dependency changes were needed.
- 2026-10-11 execution: both extractions and 16 colocated cases implemented;
  accepted App characterization bytes unchanged. Worker stopped at measured
  1,419 lines (App tests 757, App 97, module 148, module tests 417), 19 above
  the 1,400 cap. The auditor found no scope expansion or unnecessary coverage;
  director accepted a separate numerical addendum to 1,500, preserving frozen
  orders and reports. No further source edit requested before validation.
- 2026-10-11 execution: CHARACTERIZATION-001 passed typecheck and 630 Vitest/
  51 Node tests but failed formatting and two unused mock parameters. Correction
  loop 1 changed only typed mock signatures and formatting; CHARACTERIZATION-002
  passed all four commands with unchanged production App, absent modules and
  matching before/after identities. Accepted 28 new cases (+755/-2 after format).
  Issued EXTRACTION-ORDER-01 to the same worker, retaining this exact checkpoint
  and all characterization tests. No commit, stash or baseline reset occurred.
- 2026-10-11 execution: worker froze 28 characterization cases in App.test.tsx
  (+729/-1); production App unchanged and module paths absent. Independent
  checkpoint requested. Read-only auditor found no unnecessary coverage and
  revised the whole-unit estimate to 1,225-1,365 lines. Director accepted a
  1,400-line cap for the continuation; the immutable original order and receipts
  remain unchanged. Focused binding tests must prove exact
  observe/publish/subscribe ordering beyond the App integration observation.
- 2026-10-11 execution: independent `APP-PREFERENCE-EFFECTS-01-BASELINE-001`
  was BLOCKED before compilation because session pnpm 11.25.0 did not match
  required 11.15.1. Selecting the existing Corepack shim through session-only
  PATH resolved the prerequisite without dependency edits. New immutable
  `APP-PREFERENCE-EFFECTS-01-BASELINE-002` passed all six section 8 commands:
  55 desktop Vitest files/602 tests, 51 Node tests and seven Chromium scenarios;
  before/after source identities and empty index matched.
- 2026-10-11 execution: issued the frozen test-only characterization order to
  the sole Sol high worker. App production remains byte-identical and planned
  module files absent until the independent checkpoint passes. Reports and
  orders are under `docs/plans/evidence/app-preference-effects-readability/`.
- 2026-10-11 execution: verified existing branch at
  `02259dea3be33202a01ea09ca6609c728536bf0b`, clean worktree and empty index.
  Historical `0414fdc` remains planning provenance only. Confirmed the exposed
  Sol high auditor/worker and Astra high validator roles; reused role tasks
  throughout this one unit. No Git steward is needed because Git mutations
  are explicitly forbidden.
- 2026-10-11 execution: accepted the refreshed `APP-PREFERENCE-EFFECTS-01`
  CHANGE audit, medium risk, and revised the ceiling from the planning estimate
  of 750 to a maximum of 1,100 added/deleted lines. The complete characterization
  and module matrix is estimated at 830-1,020 lines including production moves;
  coverage will not be weakened to meet the ceiling. Source scope is unchanged.
- 2026-10-11: Rechecked clean local `main` at
  `0414fdc5b00f407333457ff855e2ae30dc6c8ebf`; it includes the completed hardware
  extraction. Read the current effects, tests, contracts and relevant guidance.
- 2026-10-11: Accepted read-only Audit Packet `APP-PREFERENCE-EFFECTS-01` for the
  two preference connections and their prerequisite characterization.
- 2026-10-11: Accepted Git Report `APP-PREFERENCE-EFFECTS-SETUP-01`; created
  `codex/app-preference-effects-readability` from local `main`, with unchanged
  HEAD/main and an empty index. No fetch, commit, push or PR.
- 2026-10-11: Authored this plan and linked it from both documentation indexes.
  Independent documentary review approved the scope, APIs, characterization
  checkpoint and validation gates. Local authoring checks passed: 12 sections,
  15 links, nine configured commands, exact document scope and empty index.
  Implementation is not started.

## 11. Discoveries and decisions

- The previous hardware plan explicitly deferred hydration. This continuation
  includes it as required work, with characterization as a prerequisite rather
  than a reason to omit the extraction from a completed result.
- The narrator subscription was previously optional because it is short. The
  requested continuation includes it with hydration under the same presentation
  responsibility; it remains a normal binding, not another state owner.
- A single four-path unit avoids independent overlapping units editing App and
  requiring unrequested intermediate commits. Its phases have distinct receipts.
- Both new implementations and their tests live in the existing `settings/`
  area. Lower-level repositories and coordinators remain unchanged.
- The remaining seven effects keep their current ownership and order. This plan
  does not promise a later general lifecycle extraction.
- The system diagram was reviewed against the completed implementation: App
  still owns preference state, repositories/coordinators and lifetime; the
  support module only connects reads/observations to presentation. No major
  component, persistence, process, dependency or data-flow change; no diagram
  or ADR edit is needed.
- Characterization confirms that active late hydration can replace earlier
  presentation updates; both event orders remain tested. Closed-dialog fallback
  callback tests establish callback behavior, not a reachable product defect.
  No new precedence policy or confirmed product contradiction was introduced.
- One mechanical source correction loop was used. Toolchain/driver prerequisite
  recovery and the one unchanged aggregate rerun did not alter source. Preserve
  all unsuccessful attempts separately; no old PASS hashes were refreshed.

## 12. Final validation results

All execution reports use HEAD
`02259dea3be33202a01ea09ca6609c728536bf0b` on the existing
`codex/app-preference-effects-readability` branch. Historical planning setup at
`0414fdc` and its documentary checks remain progress-log provenance only.

The [evidence index](../evidence/app-preference-effects-readability/README.md)
links every immutable report, order, exact command/outcome and full source
identity manifest. All acceptance ran in local PowerShell outside the sandbox.

| Report suffix (prefix APP-PREFERENCE-EFFECTS-01-) | Result |
| --- | --- |
| BASELINE-001 | BLOCKED: incorrect session pnpm; no source changes. |
| BASELINE-002 | PASS: all six baseline commands; 602 desktop tests + 51 Node, seven Chromium. |
| CHARACTERIZATION-001 | FAIL: format and two unused mock parameters; 630 tests + 51 Node passed. |
| CHARACTERIZATION-002 | PASS: all four commands, unchanged production and absent new modules. |
| POST-CHANGE-001 | BLOCKED: native session creation, stale PATH driver; first six commands passed. |
| POST-CHANGE-002 | PASS: all seven commands, 646 desktop tests + 51 Node, Chromium and packaged WebView2. |
| PACKAGE-001 | PASS: check:portable, shared 209 / EPUB 651 / desktop 646 / Node 51 / Python 485 and builds. |
| FINAL-001 | FAIL: unchanged Rust release-locked reaping assertion; final stages not reached. |
| FINAL-002 | PASS: full check, Rust 87 default / 88 release-locked, Python 485, all types/lint/tests/builds. |

Both `usePreferenceHydration(options)` and
`bindNarrationStartPreferencePresentation(source, publish)` are implemented
and accepted. All 28 App characterization and 16 focused module cases remain.
Final four-path patch is 1,419 added/deleted lines within the audited 1,500 cap.
No source changed after final acceptance; index remains empty.

Material limitations: the native Rust reaping assertion failed once and passed
the complete unchanged rerun; its intermittent cause is not established or fixed.
Nonfatal pytest nodeids-cache permission and existing Vite chunk-size warnings
remain. Matching pnpm/EdgeDriver were selected process-locally, without global
configuration changes. No model-backed benchmark, inference-performance or new
support claim is made; those runtime boundaries were unchanged.
