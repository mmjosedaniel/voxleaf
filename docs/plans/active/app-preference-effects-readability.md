# App preference effects readability

Status: ready for implementation; production changes and runtime validation have
not started. Prepared on 2026-10-11.
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

The planning ceiling is four files and approximately 750 added/deleted lines,
primarily tests. Freeze the exact limit in the work order after baseline; if
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

Planning documentation paths are this plan, `docs/README.md` and
`docs/plans/active/README.md`. Future concise evidence belongs under
`docs/plans/evidence/app-preference-effects-readability/`; raw logs and temporary
scripts belong in ignored `tmp/evidence/app-preference-effects-readability/`.
Keep evidence outside the source validation manifest.

The current user request authorizes this document and local branch setup only.
Implementation starts with a subsequent execution request. This plan does not
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

Status: not started.

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

Status: not started.

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

Status: not started.

The same worker creates the module and its colocated test file, moves the
presentation types without altering them, replaces startup hydration with
`usePreferenceHydration`, and replaces the narration effect body with the
guarded binding call. Keep all other effects and handlers unchanged.

Add focused hook/binding tests for the new module, complementing the retained
integration cases. Return a Change Packet mapping both required extractions,
type moves and tests to the work order. A tests-only patch, renamed inline
function or partial extraction cannot satisfy this milestone.

### Milestone 4: Independent acceptance and documentation closure

Status: not started.

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
- The system diagram was reviewed during planning; these internal functions
  preserve its application-owned flow. Verify that judgment against the actual
  implementation during closure.

## 12. Final validation results

Planning-only status:

- Branch setup: PASS, `APP-PREFERENCE-EFFECTS-SETUP-01`, outside-sandbox Git
  action; base and current HEAD `0414fdc5b00f407333457ff855e2ae30dc6c8ebf`.
- Plan structure, links, configured commands and scoped diff: PASS. The command
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File tmp/evidence/app-preference-effects-readability/plan-authoring/check-plan.ps1`
  ran outside the sandbox and checked 12 sections, 15 relative/navigation links,
  nine configured scripts, the exact three-document scope, unchanged branch
  base/main/HEAD and an empty index. It also ran `git diff --check` for the
  documentation paths. The temporary checker first rejected a valid hyphenated
  script name; its matching rule was corrected and the host command passed.
- Independent documentary review: PASS, the reused auditor approved this plan
  against `APP-PREFERENCE-EFFECTS-01`; this is not runtime acceptance.
- Initial runtime baseline and characterization checkpoint: NOT RUN.
- Production extraction, module tests, post-change and aggregate gates: NOT RUN.
- Application behavior acceptance: not claimed; no production code changed.

At implementation closure, replace pending execution statuses with exact report
IDs, commands, outcomes and source identities. Do not infer PASS from predecessor
plans, this read-only audit, or successful branch/document preparation.
