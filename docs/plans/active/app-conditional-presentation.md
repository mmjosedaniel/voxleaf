# App conditional presentation components

Status: ready for implementation; no source changes or runtime validation yet.
Prepared on 2026-10-12. Branch: `codex/app-conditional-presentation`, created
from clean, up-to-date `main` at
`3146cb8769ef8f277b75cf77731dbfd3b55baa9d`.

## 1. Goal

Make the final composition in `apps/desktop/src/App.tsx` easier to read by
extracting its remaining recognizable shell sections and ready-publication
presentation. Preserve the current rendering conditions, resource ownership,
reader contract, accessibility and behavior.

Required deliverables are `ApplicationBar`, `ShellWelcome`,
`EmptyPublicationNotice`, `ReadyPublicationSection`, and a clearly named,
typed assembly of the existing reader props in App. Moving only the two static
messages does not complete this plan. There is no target line count.

This cross-milestone maintenance plan continues the completed
[App readability](../completed/app-readability.md),
[hardware effects](../completed/app-hardware-effects-readability.md) and
[preference effects](../completed/app-preference-effects-readability.md) plans.
Their records remain unchanged; the new work does not reopen their retained
lifecycle and preference-handler responsibilities.

## 2. User-visible outcome

The app looks and behaves the same. Opening or replacing a book, cancelling the
picker, restoring a position, changing preferences, showing notices, opening
Settings and starting narration retain their current semantics.

Contributors can see the application bar, welcome state, ready publication,
empty-content notice and Settings dialog as named composition elements. The
reader prop contract remains explicit and is not mixed into nested JSX spreads.
No performance, hardware-support or product-feature improvement is claimed.

## 3. Current state

At the planning HEAD, App has 853 lines and its final JSX starts at line 707.
`AppPresentation.tsx` has 208 lines and already exports `OpenBookControl`,
`PublicationHeading`, `RestorationNotice` and the two presentation types.
These counts and line numbers are navigation aids, not execution-time evidence.

| Slice | Current responsibility and planned disposition |
| --- | --- |
| App header, lines 714-741 | Brand, persistent opening control and conditional Settings action. Extract as one `ApplicationBar`; keep its state, ref and handlers in App. |
| Welcome, lines 742-751 | Static introductory copy shown for every non-ready state. Extract `ShellWelcome` as part of shell composition, not an independent refactor unit. |
| Ready publication, lines 752-812 | Keyed failure boundary encloses heading, pending restoration, notice, narration controls and injected reader. Extract the inner presentation; retain the boundary and its key in App. |
| Reader props, lines 784-806 | Initial/current preferences, optional locator, navigation/restoration callbacks and optional narration source. Assemble one typed value in App under the same guards. |
| Empty publication, lines 813-824 | Accessible explanation for an EPUB without readable content. Extract `EmptyPublicationNotice`, retaining the exact `empty` condition. |
| Settings dialog, lines 825-849 | Already a component with its own focus and display behavior. Retain its unconditional call site and `open={ready && settingsOpen}` semantics. |
| Resources, effects, restoration identity, persistence and narration actions | Retain. They coordinate one live publication and are outside this presentation change. |

Read-only planning Audit Packet `APP-COMPOSITION-01` supports one cohesive
composition unit for the application bar and ready section. A separate
`ApplicationBar.tsx` would add another support file without a demonstrated new
owner: place the bar with the existing shell presentation instead. Static copy
alone would not justify a separate campaign, test suite or file per fragment.
The auditor recommended SKIP for the two static fragments in isolation. The
director retains their named components as small parts of the explicitly
requested shell composition, colocated with its existing presentation; this is
a scoped planning decision, not an independent acceptance claim for those leaves.

The old readability plan deliberately kept Settings and ready composition in
App. This plan authorizes their presentation extraction while preserving the
same underlying state, refs, effects and cleanup boundaries.

## 4. Scope and non-goals

Use one source/test unit, `APP-CONDITIONAL-PRESENTATION-01`, with this closed
candidate allowlist:

1. `apps/desktop/src/App.tsx`.
2. `apps/desktop/src/App.test.tsx`.
3. `apps/desktop/src/AppPresentation.tsx`.
4. `apps/desktop/src/ReadyPublicationSection.tsx` (new).

The two existing source files, one existing integration suite and one new
composition component fit the normal primary/test/two-support unit. Execute
the shell and ready extractions as sequential checkpoints of that same unit;
do not pretend that their overlapping App files are separate clean baselines.
Planning estimate: at most four source/test files and approximately 650 added
plus removed lines. The fresh auditor must confirm or tighten the ceiling
before the director freezes a work order.

Documentation scope is this plan and the active/completed/documentation indexes
when its status changes. Concise new Markdown acceptance receipts may live at
`docs/plans/evidence/app-conditional-presentation/`; raw captures and temporary
scripts belong in ignored `tmp/evidence/app-conditional-presentation/`.

Exclude new hooks, context, controllers, repositories, subscriptions, resource
construction or ownership; effect/cleanup changes; reader or narration internals;
CSS, DOM redesign, wording/localization, dependencies, public contract changes,
native/Python/protocol/schema work, generated files, frozen authority and edits
to completed plans. Do not reorganize the existing test suite merely to mirror
the component files. Do not add wrappers around existing components just to
hide their props or create standalone components for individual paragraphs.

The current request authorizes only creating this plan, its navigation entries,
the branch and a local planning commit. It does not authorize executing the
source refactor, publishing the branch or opening a PR. A later implementation
request is required; source staging/commits and remote publication follow the
authorization in that later request, not today's documentation commit.

## 5. Relevant files and documentation

Before implementation, read [AGENTS.md](../../../AGENTS.md),
[the plan format](../../../.agents/PLANS.md),
[documentation index](../../README.md), [MVP](../../product/mvp.md),
[roadmap](../roadmap.md), [system diagram](../../architecture/system-diagram.md),
[overview](../../architecture/overview.md),
[ADR-0008](../../architecture/decisions/ADR-0008-visual-reader-architecture.md),
[ADR-0011](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md)
and [ADR-0041](../../architecture/decisions/ADR-0041-simplify-empty-and-ready-reader-chrome.md).

Read [orchestrate-safe-refactor](../../../.agents/skills/orchestrate-safe-refactor/SKILL.md),
its [complete contracts](../../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md),
[validate-safe-refactor](../../../.agents/skills/validate-safe-refactor/SKILL.md),
its [validation matrix](../../../.agents/skills/validate-safe-refactor/references/validation-matrix.md),
[testing guidance](../../development/testing.md) and
[evidence retention](../../development/evidence-retention.md).

Inspect the four target paths and these unchanged collaborators:

- `apps/desktop/src/reader/ReaderErrorBoundary.tsx`, `ReaderPublication.tsx`,
  `reader-lifecycle.ts`, `reader-preferences.ts` and
  `segment-highlight-controller.ts`.
- `apps/desktop/src/persistence/reader-position-restore-coordinator.ts`,
  `reader-position-save-coordinator.ts` and `narration-position-save-bridge.ts`.
- `apps/desktop/src/settings/ReaderSettingsDialog.tsx`, its tests,
  `app-preference-effects.ts` and `narration-settings-actions.ts`.
- `apps/desktop/src/tts/ProductNarrationControls.tsx`, its tests and
  `product-narration-coordinator.ts`.
- `apps/desktop/tests/browser/foundation.smoke.spec.ts`,
  `reader-reflow-restoration.smoke.spec.ts` and `settings-helpers.ts`.
- Root and desktop `package.json`, `tsconfig.base.json`, desktop TypeScript,
  lint, browser and native-startup configuration.

## 6. Architecture and constraints

### Component organization

```text
apps/desktop/src/
  App.tsx                         # states, resources, effects, handlers, composition
  App.test.tsx                    # existing behavior coverage and focused additions
  AppPresentation.tsx             # existing components plus bar/welcome/empty notice
  ReadyPublicationSection.tsx     # ready display branches and injected reader rendering
```

Declare every component at module scope. Do not define new component functions
inside App, add `memo` without evidence, change keys or add DOM wrapper elements.
Use narrow readonly prop interfaces. No new component may construct, subscribe
to, cancel, close or save a publication, repository or coordinator.

`ApplicationBar` owns the current header markup and renders the existing
`OpenBookControl` at one stable position in every state. Its inputs cover ready
presentation, lifecycle/restoration presentation, opening availability and
selection callback, Settings visibility/state, the original button ref and an
open-Settings callback. App keeps `settingsOpen`, `settingsButtonRef`,
`handleSelection` and `closeSettings`. Do not replace the original ref or pass
an application-wide controller or setter collection.

`ShellWelcome` and `EmptyPublicationNotice` need no state or props. Keep the
conditions in App: welcome whenever `viewState.status !== "ready"`; empty
notice only when `viewState.status === "empty"`. Empty content is not the idle
screen. Settings is visible whenever the existing ready condition holds, even
while restoration is pending.

### Ready publication and typed prop assembly

App continues to narrow `viewState`, filter restoration by publication identity
and sequence, and construct all callbacks. Prepare a local
`readyReaderProps: ReadyPublicationContentProps | undefined` under the same
ready/restoration guards as today's JSX. A descriptive local position variable
and restore flag may clarify the conditional locator assembly. Do not mirror
these derived values in state, widen types, assert away nullability or add a
generic props-builder framework.

Preserve exactly:

- `initialPreferences` from the restoration result and current `preferences`
  from reader preference presentation; they are not interchangeable.
- Omission of `initialLocator` for `book-start`, and its exact/recovered locator
  otherwise; preserve the corresponding `restoreInitialLocator` boolean.
- Omission of `narrationSource` when the coordinator is absent. With
  `exactOptionalPropertyTypes`, an omitted property is not replaced with an
  explicit `undefined` or `null`.
- All current callbacks, callback semantics and the injectable
  `ReadyPublicationContent` component. Keep its existing exported prop shape
  and `AppProps` import paths intact.

The proposed `ReadyPublicationSection` receives the summary, restoration
presentation, dismissed flag and dismissal callback, the injected reader
component, `readerProps` as an explicit value-or-undefined input, and a
`narrationControls: ReactNode` slot. App creates that slot with the current
coordinator guard. The publication section and `PublicationHeading` render in
both branches. Below that heading, the section renders the existing preparing
paragraph when `readerProps` is undefined; otherwise it renders the restoration notice,
narration slot and injected reader in their current order.

Keep `ReadyPublicationContentProps` exported from App. The new section may use
`import type` for that contract; this intentionally erased edge must not become
a runtime App import or a module cycle. Do not relocate or duplicate the public
interface just to avoid a type-only reference. Keep runtime imports directed
from App to presentation and from the section to its existing presentation
children. Pass the typed reader props only to the injected reader; the section
must not use its publication handle or narration source to perform work.

Keep `ReaderErrorBoundary` in App around the section with the same
`key={viewState.publicationSequence}` and `onFailure` callback. The new component
must not replace the boundary, change its reset scope, call the injected reader
as a regular function, or catch/interpret publication errors itself.

### Observable invariants

1. Preserve strings, classes, DOM element nesting/order, IDs, accessible names,
   status/live-region behavior, `aria-busy`, input enablement and CSS selectors.
2. Preserve the same input DOM node across idle/opening/ready/replacement/failure;
   synchronous input reset and selection cancellation remain in `handleSelection`.
3. Settings closes and returns focus through the original button ref. Keep the
   dialog mounted at its existing composition position; its `open` prop controls
   visibility. Do not make the dialog itself conditionally mounted.
4. Preparing means the ready restoration result is absent, not that visual
   settlement is still pending. A ready result with pending settlement must
   mount the reader so it can settle. Preserve the independent busy indicator.
5. Preserve per-publication notice dismissal, notice precedence and reader/
   narration mounting timing. An unrelated Settings or preference update must
   not remount the injected reader or restart restoration.
6. Preserve error cleanup, StrictMode behavior, obsolete-result rejection,
   flush-before-replacement, visible/heard locator responsibilities and unmount
   cleanup. Do not reopen earlier lifecycle/ref synchronization SKIPs.
7. Keep EPUB content local, inference local, audio transient, cancellation
   identity-safe and queues/buffers bounded. No new serialization, diagnostics,
   native permissions or malformed-EPUB handling path is introduced.

### Execution and evidence ownership

The primary task directs the work. Reuse one `clean_code_auditor` and one
`clean_code_worker` (GPT-6.1 Sol high), one `refactor_validator` (GPT-6 Astra high)
and, for separately authorized Git actions, a `git_steward` (GPT-6.1 Sol medium).
Keep the repository's four-role child limit and exactly one source writer.
Support agents must not delegate. Source writers and Git remain idle throughout
validation. A missing required role/model or host capability is a blocker, not
permission to substitute a model or self-approve runtime equivalence.

The execution auditor refreshes this proposal against the live checkout.
Establish a clean-path, empty-index baseline before source or test edits. Freeze
the work order only after its independent BASELINE PASS. Sequential tests-only,
shell and ready checkpoints belong to this same four-file unit: their known
changes are expected, not unrelated dirt and not new clean baselines. Carry no
rejected patch into another unit. Permit at most two correction loops before
redesigning the order.

Each independent report uses a unique immutable Report ID, starting/ending HEAD,
the exact allowlist, porcelain status, SHA-256 and filter-aware blob identities,
and a post-command identity recheck. Keep reports outside their validated paths.
Later drift requires a new report, not refreshed hashes on old approval.
Refactor validation supplies the independent acceptance gate; do not add a
feature reviewer to this behavior-preserving campaign.

## 7. Milestones

### Milestone 1: Refresh the audit and establish the baseline

Status: not started. The planning review is not a runtime baseline.

Verify the current branch, HEAD, clean target paths, empty index, pinned
toolchain and required roles. Reinspect source, tests, ADR-0041 and existing
scripts. Obtain the execution Audit Packet with the final four-file allowlist,
ceiling and gate list, then independent baseline results from section 8.
If the baseline fails, record `BASELINE-FAIL` and stop before extraction; do not
repair an unrelated defect in this plan. Freeze the Approved Work Order only
after PASS. Optional extra wrappers/types may be SKIP; required deliverables
may not silently disappear behind a completed status.

### Milestone 2: Characterize missing composition behavior

Status: not started.

Retain existing assertions and identify actual coverage gaps using the matrix
below. Add only necessary App-level characterization, especially Settings focus
return and injected reader prop/mount continuity. Run the deterministic baseline
group on unchanged production before extraction if tests were added, and retain
the checkpoint identities. Do not duplicate tests of static text or invent
invalid coordinator states to force unreachable branches.

### Milestone 3: Extract shell presentation

Status: not started.

The single worker adds `ApplicationBar`, `ShellWelcome` and
`EmptyPublicationNotice` to `AppPresentation.tsx` and replaces their inline
markup in App. Reuse `OpenBookControl`; preserve all DOM, ref and conditional
semantics. Rename the local `ready` flag to `isReaderReady` only if that improves
the resulting call sites, without changing its meaning. Preserve `main`, outer
section and Settings-dialog ownership in App.

This is an intermediate checkpoint of the same unit, not a completed plan or
permission to commit. Do not run a second clean-path baseline against the known
worker changes. Stop on a required allowlist or behavior expansion.

### Milestone 4: Extract ready publication presentation

Status: not started.

Create `ReadyPublicationSection.tsx`, assemble the typed reader props and
narration slot in App, and replace the nested ready JSX while keeping the keyed
error boundary in App. Use the interface and invariants in section 6. Preserve
the existing injected-component contract and omitted optional properties.
No extra state, effects, subscriptions or public contract is introduced.

The worker returns one Change Packet mapping all five required deliverables to
their symbols, call sites and preserved behavior. A shell-only change, renamed
inline function or passing characterization alone cannot complete this unit.

### Milestone 5: Validate independently and close the plan

Status: not started.

With writing and Git idle, the validator reviews the full diff, test integrity,
runtime import direction, DOM/mount/ref invariants and exact identities, then
runs the post-change, package and final gates below. Report failures and host
limits explicitly. Do not infer runtime acceptance from planning checks.

Record concise acceptance evidence, review the canonical system diagram against
the preserved architecture, and change it only if the documented model actually
changes. After all required deliverables and checks pass, move this plan to
`docs/plans/completed/`, update both plan indexes and `docs/README.md`, and point
links directly to the completed path. Leave no redirect in `active/`. Preserve
predecessor plans, historical results and deferred product work.

## 8. Testing and benchmark strategy

All implementation acceptance commands below exist in the inspected manifests.
Run them from repository root in normal local PowerShell outside the managed
sandbox. Use the repository-pinned pnpm `11.15.1` and supported Node range;
recheck configuration at execution time instead of assuming the PATH launcher
matches the pin. Sandbox runs are exploratory only.

Baseline group, before source or test edits; repeat for post-change acceptance:

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd test:browser
pnpm.cmd test:native-startup
```

The desktop test script includes Vitest and configured Node suites. Do not
invent a single-file package script. A tests-only checkpoint repeats the first
five deterministic commands when new characterization was needed; browser and
native outcomes are required for the unchanged-production baseline and final
post-change, not every checkpoint.

Establish browser and packaged native-startup baseline before changing the
rendered composition, then repeat after the whole source unit. These protect
the persistent file picker, Settings focus, ready layout and packaged WebView2
behavior. Do not repeat them after every small edit without a new failure or
unresolved risk. Missing native prerequisites are a blocker for those gates.

After the accepted composition unit, require the existing aggregate commands:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
```

Keep exact outcomes for both aggregate gates and reuse constituent evidence
where valid; do not inflate results by copying prior plans' test counts.

| Behavior | Existing evidence or focused gap to check |
| --- | --- |
| Welcome/empty visibility | App idle, ready, opening, failure and empty-content cases; keep welcome for every non-ready status and empty notice only for empty. |
| Picker identity and cancellation | Existing App test at planning line 1161 compares the same input through transitions, synchronous reset and cancelled selection. Retain it. |
| Settings visibility and focus | Existing shell tests plus browser foundation/reflow checks. Add a focused App assertion for close/Escape returning to the actual Settings button if not already covered. |
| Reader waiting and settlement | A deferred restoration read shows the preparing paragraph without mounting the reader; a ready result mounts it even while settlement remains pending. Use the existing injectable reader seam and controlled promises. |
| Reader prop contract | Book-start omits `initialLocator`; exact/recovered passes the saved locator; initial and current preferences stay distinct. Preserve narration-source omission through the existing guard; do not manufacture a coordinator-absent/reader-ready combination if unreachable through valid fixtures. |
| Mount continuity | Settings toggles and ordinary presentation updates retain the mounted reader; a new publication sequence and a rendering failure retain the existing reset/cleanup behavior. |
| Restoration notices | Existing exact/recovered/fallback precedence and dismissal-per-publication cases; a later publication can display its own notice. |
| Lifecycle and privacy | Existing StrictMode, heard-position ownership, reset ordering, stale completions, replacement flush, rendering failure and unmount tests; private filenames remain absent. |

Keep integration tests in `App.test.tsx`. No new test file is required for these
stateless fragments. If an uncovered behavior genuinely requires isolated
component testing, obtain a revised bounded work order before adding a path.
Avoid broad snapshots, prop-forwarding-only tests and assertions of internal
component names or render counts. User-observable identity/mount consequences
and the existing injected contract are legitimate boundaries to characterize.

No model-backed performance benchmark is justified by this presentation scope.
If work would change scheduling, playback, cancellation or profile selection,
stop and rescope before choosing the applicable exact-host gate. Existing
hardware-dependent results are historical, not evidence for this patch.

## 9. Risks and rollback

The main risks are remounting the picker or reader, losing the Settings button
ref, changing error-boundary reset identity, confusing pending restoration with
pending visual settlement, and changing optional property presence. The narrow
interfaces, preserved App ownership and behavioral matrix address those risks.
Do not accept an extraction that requires passing all of App state or moves
lifecycle effects into presentation to hide complexity.

Keep each worker patch bounded and identifiable. On rejection, correct it with
the same worker or remove only verified worker-authored changes; never reset,
stash, clean or restore over unrelated work. A code rollback would return the
composition to App and remove the added section module while preserving valid
regression coverage. It requires no persisted-data, protocol or native migration.
The documentation-only planning commit can be reverted independently.

## 10. Progress log

- 2026-10-12: Reviewed the current App, presentation helpers, reader boundary,
  Settings, existing integration/browser coverage and completed predecessor
  plans. Source implementation and runtime validation remain not started.
- 2026-10-12: Read-only Audit Packet `APP-COMPOSITION-01` supported one four-file
  composition unit for the bar and ready section, with
  ApplicationBar colocated in AppPresentation and a separate ready section.
  The director included the requested static leaves as small constituents and
  retained the audit's rejection of standalone file/test refactors for them.
- 2026-10-12: Updated clean `main` by fast-forward check (already current) and
  created `codex/app-conditional-presentation` at the recorded planning HEAD.
- 2026-10-12: Prepared this plan and current navigation entries for a local
  documentation-only commit. Execution milestones and acceptance are pending.
- 2026-10-12: Read-only plan review clarified that the publication heading
  remains visible during preparation. Documentation checks passed outside the
  sandbox: 12 required sections, five milestones, nine configured commands,
  401 Markdown documents and 1,481 local links/anchors; only the three planning
  documents changed. Evidence-retention and diff checks passed.

## 11. Discoveries and decisions

- Use two presentation support files rather than creating a separate file for
  each small component. This refines the earlier suggested ApplicationBar path
  while implementing the requested component boundary.
- The planning auditor recommended leaving static welcome/empty markup inline
  if assessed alone. The director's explicit scope includes those named leaves
  to make all requested shell sections visible in App's composition, without
  creating additional files, independent test suites or resource ownership.
- Keep one unit with sequential checkpoints because the extractions share App
  and its tests; today's documentation commit does not authorize source commits
  between overlapping units.
- Preserve the exported reader prop interface in App. A deliberately type-only
  consumer edge avoids changing that API; no runtime reverse import is allowed.
- Extract ready display branching while keeping the reader props, error
  boundary, publication identity checks and all live-resource owners in App.
- The preparing paragraph remains part of the ready section. Existing dialog,
  narration controls and lifecycle effects remain separate and unchanged.
- Review the system diagram at closure; an unchanged component/process model
  does not need a cosmetic diagram or new ADR.

## 12. Final validation results

| Item | Current result |
| --- | --- |
| Planning source review | Complete; read-only findings, no runtime acceptance claim. |
| Branch setup | Complete; clean main at `3146cb8769ef8f277b75cf77731dbfd3b55baa9d`, local branch created. |
| Planning documentation checks | PASS outside sandbox: required sections, milestones, existing commands, 1,481 local links/anchors across 401 documents, three-document scope, evidence retention and diff checks. |
| Implementation audit and clean baseline | Not started. |
| Characterization and required extractions | Not started. |
| Independent post-change/browser/native acceptance | Not started. |
| Portable and full aggregate gates | Not started. |
| Product/architecture changes | None planned; no source code changed by plan preparation. |

Replace pending implementation results with exact commands, outcomes, report
IDs and limitations only as execution actually supplies them. Do not mark this
plan complete merely because its document and branch exist.

Planning checks used the one-off ignored local script
`python tmp/evidence/app-conditional-presentation/validate-plan.py DOC-APP-CONDITIONAL-PLAN-01`,
which also ran `node scripts/check-evidence.mjs` and `git diff --check`.
The final document is rechecked under `DOC-APP-CONDITIONAL-PLAN-02` before
staging; neither report establishes a source implementation baseline.
