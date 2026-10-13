# App restoration derivations and settlement

Status: complete; implementation, independent host acceptance and documentation closeout complete. Changes remain unstaged and uncommitted.
Prepared on 2026-10-12. Branch: `codex/app-restoration-derivations`, created
from clean, up-to-date `main` at
`db65f45989d2b9e3449b157aa43f698623fe27a6`.

## 1. Goal

Improve the readability of `apps/desktop/src/App.tsx` by extracting the three
restoration responsibilities identified in the preceding review:

1. Select restoration state belonging to the current publication object and
   publication sequence, using one explicit identity rule.
2. Express settlement of a matching ready, pending restoration as a pure
   transition function.
3. Project restoration state into the existing presentation contract through
   a named pure function instead of nested ternaries in App.

The loading-to-ready updater also uses the shared identity rule, while its
ready-state construction remains in App. Keep the asynchronous effect and
functional React setters in App. All three responsibilities and their tests
are required; extracting only the presentation mapper does not complete this
plan.

This is cross-milestone maintenance following the completed
[preference effects](../completed/app-preference-effects-readability.md),
[conditional presentation](../completed/app-conditional-presentation.md), and
[apps organization](../completed/apps-organization-follow-up.md) plans.
Their retained resource ownership remains applicable. There is no line-count
target, performance claim or new architectural layer.

## 2. User-visible outcome

The reader presents the same loading, ready and restoration messages, busy
state, notices and Settings availability. Exact, recovered and book-start
positions retain their current settlement and persistence behavior. Obsolete
restoration results and callbacks cannot update a later publication session.

Contributors see named restoration decisions in App and can test their cases
without mounting React. App continues to own React state, current instances,
effects, callbacks, subscriptions and cleanup. No new feature, hook, store,
singleton, dependency, public contract or error policy is introduced.

The 2026-10-12 execution request authorizes implementation, tests and plan
documentation. All changes must remain unstaged and uncommitted; push and PR
creation are expressly prohibited.

## 3. Current state

The planning HEAD contains the merged apps-organization work from PR #239.
App has 800 physical lines; size alone is not the reason for this extraction.
The following locations describe this checkout, not permanent line identities.

| Slice | Current responsibility | Disposition |
| --- | --- | --- |
| Private restoration types, App lines 119-136 | Loading/ready union, publication object, sequence, result and settlement. | Move with the pure restoration rules. |
| `activeRestoration`, lines 242-247 | Accept only the matching publication object and sequence. | Use the shared identity predicate; preserve the exact matching object reference. |
| Restoration result update, lines 328-343 | A functional setter changes only matching loading state; book-start is immediately settled. | Use the shared identity predicate; retain state construction, effect execution and surrounding operations. |
| `handleInitialRestorationSettled`, lines 585-600 | A functional setter changes only matching ready/pending state. | Extract the pure transition; retain the callback and dependency array. |
| `restorationPresentation`, lines 689-705 | Nested projection of loading/ready, settlement, position mode/reason and preference status. | Extract a typed pure mapper. |
| `readyReaderProps`, lines 707-727 | One guarded assembly of initial data and five current callbacks. | Retain; a separate builder is optional and not justified for this unit. |
| Preference handlers, lines 497-535 | Shared updates but distinct validation and persistence paths. | Retain; do not merge the routes or add a dependency-heavy action factory. |
| Other handlers and flags | Small adapters, already-extracted narration actions, `isBusy`, `openDisabled` and lifecycle projection. | Retain existing names and ownership. |

The same publication reference plus sequence comparison occurs in selection
and both transitions. It is an application session check, distinct from the
EPUB's stable book identity. A new object for the same book is not an
interchangeable active publication.

Existing App tests cover preparation before settlement, book-start locator
omission, message/notice precedence, StrictMode, exact/recovered positions,
replacement, persistence and cleanup. These are existing tests, not fresh
execution evidence. The prior handler audit found no justification for moving
the remaining callbacks wholesale.

## 4. Scope and non-goals

Use one cohesive source/test unit, `APP-RESTORATION-01`, with four candidate
paths:

1. `apps/desktop/src/App.tsx`.
2. `apps/desktop/src/App.test.tsx`.
3. `apps/desktop/src/app-reader-restoration.ts` (new).
4. `apps/desktop/src/app-reader-restoration.test.ts` (new).

The module belongs beside App because it models App's restoration state and
projection, rather than repository storage or reader DOM behavior. Colocate
its unit tests. Keep App integration tests in their current file, preserving
existing assertions and fixtures. Planning ceiling: four paths and 500
added-plus-removed lines; the execution audit must confirm or revise the
ceiling explicitly before freezing the Work Order.

The proposed exported operations are `isReaderRestorationForPublication`,
`applyInitialRestorationSettlement`, and `toRestorationPresentation`. The
identity predicate has real callers in App's active selection and loading
updater, as well as in the settlement transition. Final signatures must use
explicit readonly domain types and only the inputs used by each operation.

Documentation scope: this plan, the active/completed plan indexes and
`docs/README.md`. During implementation, update the existing App/test coverage
map in `docs/development/testing.md`. Reviewed concise receipts may live under
`docs/plans/evidence/app-restoration-derivations/`; temporary checkers and raw
output belong in ignored `tmp/evidence/app-restoration-derivations/`.

Excluded: extracting `readyReaderProps`, deduplicating preference handlers,
changing JSX/components/keys, moving entire effects or resource lifecycles,
generic App-handler factories, changing coordinators or persistence adapters,
new state/hooks/memoization, dependencies, manifest/configuration edits,
generated sources, frozen authorities, historical evidence and completed plans.
Only the restoration handler's pure state calculation changes location.

## 5. Relevant files and documentation

Read [AGENTS.md](../../../AGENTS.md), [the plan format](../../../.agents/PLANS.md),
[documentation index](../../README.md), [MVP requirements](../../product/mvp.md),
[reader settings](../../product/reader-settings-and-playback-controls.md),
[system diagram](../../architecture/system-diagram.md),
[architecture overview](../../architecture/overview.md),
[testing guidance](../../development/testing.md), and
[evidence retention](../../development/evidence-retention.md).

Apply [ADR-0008](../../architecture/decisions/ADR-0008-visual-reader-architecture.md)
for desktop ownership,
[ADR-0011](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md)
for restoration/persistence, and
[ADR-0041](../../architecture/decisions/ADR-0041-simplify-empty-and-ready-reader-chrome.md)
for ready-shell behavior.

Inspect App and its tests, `AppPresentation.tsx`, `ReadyPublicationSection.tsx`,
`reader/ReaderPublication.tsx`, the restore/save coordinators, the narration
position-save bridge, and the existing preference/narration actions. Read the
orchestration skill, its full agent contracts, the validation skill and its
matrix. Confirm commands in the root and desktop package manifests.

## 6. Architecture and constraints

### Types, dependencies and pure operations

Move the restoration state union and its supporting types from App to
`app-reader-restoration.ts`. Preserve their fields, discriminants and readonly
semantics; export only what App and the tests need. Keep the existing
`RestorationPresentation` contract in `AppPresentation.tsx`, consumed with
`import type`. Existing result and settlement contracts also use type-only
imports. The helper module must not import App or introduce a runtime cycle.

| Operation | Required behavior |
| --- | --- |
| `isReaderRestorationForPublication` | Match only when both publication reference and sequence match. Absent state does not match. Preserve useful type narrowing, using a type guard if needed; do not clone or mutate state. |
| `applyInitialRestorationSettlement` | Only matching ready state whose settlement is pending becomes a new frozen object with the incoming settlement status. Preserve the result and other fields. Wrong identities, wrong phase and repeated settlement return the original object, including `undefined`. The existing handler ignores the callback's locator; preserve that behavior. |
| `toRestorationPresentation` | Preserve `undefined`, loading and ready projections. Only book-start includes a reason; exact/recovered expose their mode without a locator or reason. Preserve preference status and settlement. Do not add publication identity, data, fields or runtime freezing to this projection. |

Use the shared exact-reference/sequence predicate at all three existing
identity guards, retaining their separate loading/ready/pending conditions.
Do not replace reference identity with book ID, locator equality, structural
comparison or sequence alone. Helpers must not mutate arguments, refs or
external state, perform I/O, schedule work, call coordinators, or capture a
render's values in module-level mutable state. They do not call hooks and need
no `use` prefix.

### App remains the owner

Keep active selection and presentation projection as calculations during
rendering. Keep both existing `setReaderRestoration(current => ...)` callbacks:
the loading updater uses the predicate, and the settlement updater calls the
pure transition. Pass the current state and the identities captured by the
existing effect or handler. Do not read an outer snapshot instead of `current`.

Retain the effect's queueMicrotask, active flag, restore call, cancellation,
error handling, state-update order and dependency array. In particular,
preference ref/presentation updates currently precede the guarded restoration
state transition; extraction must not gate or reorder those updates. Keep
initial loading-state creation and its `Object.freeze` at the existing point.
Keep loading-to-ready construction in App, including its frozen output,
result reference and initial settlement: book-start is `"settled"`, while
exact/recovered are `"pending"`. The catch path has a different lifecycle
guard; do not replace it with the shared predicate or add a sequence check.

Retain current coordinator creation/memoization, StrictMode cleanup tokens,
resource closure and recovered-position scheduling. Preserve initial-reader
mounting while settlement is pending, initial-locator omission for book-start,
notice precedence and dismissal identity, focus, Settings availability and
the reader's React identity. Helpers must return the same object on no-op
paths so existing dependencies retain their current reference behavior.

Do not change EPUB privacy, local-only inference, audio non-persistence,
cancellation, bounded queues/memory, stable locators or audible/visible/saved
position synchronization. No process, storage or architectural boundary is
changing; review the canonical diagram and record that it remains applicable.

## 7. Milestones

### Milestone 1: Refresh the audit and establish the baseline

Status: complete.

Use the existing implementation branch and inspect its planning commit,
current HEAD, index and worktree. Preserve unrelated changes and stop on
overlap with the four candidate paths. Re-audit the current source, test
coverage, helper signatures and ceiling; the planning review is not baseline
acceptance. Record CHANGE for the three required responsibilities and retain
the documented SKIPs.

Follow `$orchestrate-safe-refactor` and `$validate-safe-refactor`: keep the
primary chat as director, reuse the configured auditor/worker/validator roles,
respect the four-role concurrency limit and allow one source writer. Supporting
roles do not delegate. Do not silently substitute an unavailable role/model.

The independent validator runs the baseline in section 8 with exact HEAD and
path identities. Only a passing baseline permits the director to freeze the
Work Order. Relevant existing failures are `BASELINE-FAIL`, not regressions
or permission for unrelated repair. Actual result: fresh audit CHANGE and independent `APP-RESTORATION-01-BASELINE-01` PASS on execution HEAD `6102b72758497b07356d864915502d3dc443a0b5`; clean worktree and index. The four-path, 500-line ceiling was confirmed before the order was frozen.

### Milestone 2: Extract the pure rules and integrate their tests

Status: complete. Target: `APP-RESTORATION-01`.

Use sequential checkpoints within one unit and baseline:

1. Characterize any missing App-level stale-callback/repeated-settlement cases
   before production edits, using the existing injected reader seam. Preserve
   all existing assertions; do not fabricate a failing baseline.
2. Add the focused pure module, move its private state types and add the unit
   cases in section 8. Avoid exporting types/functions only to expose internals.
3. Use the identity predicate in active selection and the loading updater,
   and the pure operations for pending settlement and presentation projection.
   Keep surrounding React ownership, state construction and ordering intact.
4. Review the diff against every invariant and the approved ceiling. Return
   the worker Change Packet and run independent post-change acceptance.

These checkpoints touch the same App and test files and are not independent
clean units. At most two bounded correction loops are allowed before
redesigning the order. A rejected patch cannot be carried into another unit.
Actual result: all three extractions and readonly types implemented; two App
characterization tests passed against original production before extraction.
Four source/test paths total 490 added-plus-removed lines. Independent
`APP-RESTORATION-01-POST-CHANGE-02` passes all seven gates; one fixture typing
correction was needed, without scope expansion.

### Milestone 3: Complete combined acceptance and documentation

Status: complete.

Run the package and final gates, inspect the complete diff and document actual
outcomes and limits. Update the maintained testing map; review the system
diagram without adding a component for ordinary helper functions. Record the
final identity-bound acceptance with source writing and Git idle.

Complete the plan only after all required extractions, tests and gates pass.
Move it to `docs/plans/completed/`, update both plan indexes and the documentation
index, and repair maintained incoming links without leaving an active redirect.
Revalidate documentation after the move; preserve other historical plan bodies.

Future source commits, if authorized, require separate exact-path Git Action
Orders copied from immutable POST-CHANGE PASS evidence. A source/HEAD change
requires revalidation, never a hash refresh on an old approval. Push and PR
creation remain separate permissions. Actual result: independent PACKAGE-01 and FINAL-01 PASS, with unchanged source identities and an empty index. The testing map is updated, the diagram reviewed, and this plan archived with maintained indexes/links.

## 8. Testing and benchmark strategy

Run every validation from the repository root in normal local PowerShell
outside the managed sandbox. Preserve exploratory sandbox results separately;
they are not final acceptance. Record exact commands, exits and relevant
observations. Do not reuse historical test counts as evidence for this change.

Baseline and post-change commands:

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd test:browser
pnpm.cmd test:native-startup
```

The existing Vitest configuration discovers the new colocated `.test.ts`
suite; no manifest or custom test runner change is needed. Required focused
coverage:

- Identity predicate: absent state, matching loading/ready state, another
  publication object with the same book identity, and a sequence mismatch
  with the same publication object. Selection in App must continue to retain
  the matching object itself.
- Settlement: all existing incoming statuses (`settled`, `superseded`,
  `unavailable`), wrong publication, wrong sequence, loading/absent state and
  already settled state. Cover all non-pending prior statuses, no-op reference
  equality, unchanged result and frozen successful output.
- Projection: absent/loading state, each position mode, every settlement
  status and representative preference fallback statuses. Verify exact field
  shapes and omission of locator, publication and non-book-start reason.
- Integration: a saved callback from the preceding publication/session cannot
  settle its replacement; duplicate settlement cannot change the accepted
  result. Preserve book-start versus exact/recovered initial settlement and
  the existing late-result guards. Keep existing preparation, notice
  precedence, DOM identity, StrictMode, exact/recovered restoration and
  save-after-settlement cases.

Use synthetic fixtures and existing test seams. Unit tests verify actual rules
and object identity; integration tests verify the wiring rather than function
names or source text. Add only missing cases, retaining coverage in its current
suite instead of moving all App tests to the helper tests.
Exercise stale callbacks through the existing App reader seam; cover the
same-publication-reference/different-sequence case in the pure tests without
forcing an impossible resource lifecycle into an integration fixture.

Package/final gates:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
```

No new benchmark or model-backed TTS run is prescribed for this pure extraction:
there are no scheduler, playback, model, profile, transport or timing-policy
changes. Browser/native gates cover the affected restoration path. If the fresh
audit or implementation changes those retained responsibilities, stop and
revise the scope and risk-triggered validation before accepting it; do not
silently omit a required hardware gate or broaden this refactor into a repair.

Each Validation Report records a unique ID, before/after HEAD, exact allowlist,
porcelain status, SHA-256 and filter-aware blob identity for every path. New
files are ABSENT at baseline and real identities after implementation. PASS
requires unchanged identities and an empty index during validation. Keep
writers and Git idle; any drift invalidates the report for staging.

Planning-document acceptance checks twelve required sections, three milestones,
existing commands/references, local links/anchors, whitespace, evidence retention
and exact plan/index scope. It does not run application tests or establish a
source baseline. Keep this preparation receipt separate from runtime evidence.

## 9. Risks and rollback

- A shared predicate could drop one identity dimension. Test object-reference
  and sequence mismatch separately and keep state-phase checks explicit.
- A refactor could clone rejected state or change nested references, affecting
  existing memoization and effects. Assert reference preservation and purity.
- Moving a callback calculation could capture stale state or reorder preference
  updates. Retain the functional updater and surrounding operation order.
- Presentation simplification could expose extra data or change notice priority.
  Assert exact projection fields and retain the existing App notice matrix.
- Passing setters/coordinators into a generic helper could obscure ownership.
  Limit inputs to the data required by these pure operations.

Correct or remove only verified worker-authored changes when rejecting a patch.
Preserve unrelated work and avoid broad reset/clean/restore operations. Remove
new helpers and their call-site changes together if rolling back the unit.
Any subsequent edit requires applicable revalidation and a new report.

## 10. Progress log

- 2026-10-12: inspected the current App restoration calculations, existing
  handlers, presentation contract, tests and retained ownership decisions.
- 2026-10-12: fast-forward-only refresh confirmed `main` was current; created
  `codex/app-restoration-derivations` at the HEAD recorded above.
- 2026-10-12: prepared the focused plan and maintained index entries. The
  branch/documentation preparation does not implement the proposed helpers.
- [x] Milestone 1: execution audit and independent baseline accepted.
- [x] Milestone 2: pure extraction, integration and tests accepted.
- [x] Milestone 3: combined validation, documentation and archival complete.

- 2026-10-12: verified the existing branch at execution HEAD
  `6102b72758497b07356d864915502d3dc443a0b5` (planning commit), with clean
  worktree/index. Loaded the configured Sol high auditor/worker and Astra high
  validator through explicit model/effort roles; supporting agents did not
  delegate. Kept exactly one implementation writer; no Git mutations.
- 2026-10-12: accepted fresh CHANGE audit and BASELINE-01 PASS before freezing
  the order. CHARACTERIZATION-01 passed two added integration cases against
  original production. POST-CHANGE-02 accepted all three helpers and the full
  test matrix within 490 changed lines. Reports below bind exact file identities.
- 2026-10-12: POST-CHANGE-01 failed only the new test fixture's TypeScript
  discriminant inference (TS2322); the other six gates passed. Correction 01
  added the nested literal annotation without changing assertions or production.
  POST-CHANGE-02 reran all seven commands against the corrected identities.
  The failed report remains immutable and separate from the accepted result.
- 2026-10-12: updated the testing map and reviewed the canonical system diagram;
  existing desktop reader/restoration/persistence ownership remains accurate.
  Pure helpers add no process, storage, runtime or architectural boundary, so
  the diagram needs no modification. Independent PACKAGE-01 and FINAL-01 pass; archival and maintained-link updates complete the documented scope.

## 11. Discoveries and decisions

- The first three recommendations form one coherent restoration responsibility.
  A dedicated module supports direct tests and removes repeated decisions from
  App; it does not create another owner or copy of restoration state.
- The loading-to-ready updater uses the shared identity predicate. Its state
  construction and asynchronous effect remain in App; extracting another
  transition does not add enough value to this bounded unit.
- Retain the optional ready-reader props assembly: its callback wiring is clear
  and outside the duplicated restoration rule. Retain preference handlers:
  their fallback persistence policies differ and the remaining duplication is
  too small to justify a new action interface in this unit.
- Keep short flags and already-delegating narration handlers as they are. A
  successful readability review does not require moving every expression.
- The existing completed plans retain effect/resource ownership. This plan
  changes only pure calculations within those owners, preserving that decision.

## 12. Final validation results

The preparation review and requested planning commit validate documentation
only. Record their receipt separately; do not report them as source acceptance.

| Execution requirement | Current result |
| --- | --- |
| Fresh execution audit and independent baseline | CHANGE audit; BASELINE-01 PASS. |
| Identity predicate, settlement transition and presentation mapper | All three implemented; private readonly types moved; 490 changed lines. |
| Focused helper and App integration cases | 14 pure cases and 2 App cases added; 677 desktop Vitest and 70 Node tests pass. |
| Type, test, format/lint, browser and native gates | Independent POST-CHANGE-02 PASS; Chromium 7/7 and packaged WebView2 pass. |
| Portable/full checks and immutable final report | PACKAGE-01 `check:portable` and FINAL-01 `check` PASS, unchanged exact source identities and empty index. |
| Testing map, diagram review and archival | Testing map updated; diagram remains applicable; moved to completed and maintained indexes/links updated. |

Every required implementation and host gate is complete. The original active path is removed without a redirect; other historical plans are unchanged.

Execution receipts (historical planning evidence is not runtime acceptance):

- [Audit and frozen order](../evidence/app-restoration-derivations/audit-and-order.md).
- [Independent baseline](../evidence/app-restoration-derivations/baseline-01.md).
- [Tests-only characterization](../evidence/app-restoration-derivations/characterization-01.md).
- [Failed first post-change check](../evidence/app-restoration-derivations/post-change-01.md).
- [Independent post-change acceptance](../evidence/app-restoration-derivations/post-change-02.md).

The baseline and post-change used local PowerShell outside the sandbox with
repository-pinned pnpm 11.15.1 via a process-local Corepack PATH. Live EdgeDriver
and WebView2 matched at 155.0.4283.45; no driver override or repository toolchain
change was required. Raw captures remain ignored under
`tmp/evidence/app-restoration-derivations/`. No new model-backed TTS or benchmark
was prescribed for this pure extraction. The existing build chunk-size warning
is nonfatal and does not expand this work into a bundling change.
- [Independent package acceptance](../evidence/app-restoration-derivations/package-01.md).
- [Independent final source acceptance](../evidence/app-restoration-derivations/final-01.md).

At closeout, all changes remain unstaged and uncommitted on
`codex/app-restoration-derivations`; HEAD remains
`6102b72758497b07356d864915502d3dc443a0b5`. No push or pull request was made.
The initial checkout was clean, and the final scope contains only the four
source/test paths, this moved plan, maintained documentation/indexes and concise
receipts. No pre-existing failure, unresolved blocker or scope expansion remains.
The separately retained POST-CHANGE-01 fixture typing failure was corrected and
all seven commands rerun successfully. Final source acceptance covers the same
four identities as POST-CHANGE-02; documentation receives a separate post-move
identity/link/structure review without changing those validated source bytes.

Aggregate evidence includes 209 shared, 651 EPUB, 677 desktop Vitest, 70 desktop
Node and 485 Python tests, plus 13 evidence-retention guard tests. Nonfatal
warnings include the existing bundle-size warning and a denied write to the
existing pytest cache; the Python tests still pass. No cache-permission repair,
dependency change, model-backed TTS run or performance claim is part of this
refactor. Exact command results and native Rust counts are in the final receipt.