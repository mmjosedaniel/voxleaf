# App shell readability

Status: complete. APP-READABILITY-01 implemented and independently accepted;
all seven baseline commands and all nine final commands passed outside sandbox.
One test-fixture correction cycle used; no staging, commits or publication.
Prepared on 2026-10-11. Branch: `codex/app-readability`, created from clean local
`main` at `f9c35db8f51adb5080ffa94a31cb9278020a0b1b`.

## 1. Goal

Make `apps/desktop/src/App.tsx` easier to follow by separating the shell's
presentational components and message policy from publication coordination.
Preserve behavior and keep the publication lifecycle together.

This is cross-milestone maintenance with a descriptive filename. It continues
the evidence-led approach of the completed
[desktop source organization plan](../completed/desktop-source-organization.md)
without reopening its accepted lifecycle SKIPs.

## 2. User-visible outcome

The screen, wording, accessibility, keyboard focus, file selection and reader
behavior remain the same. Contributors can read App's coordination and a
separate, focused presentation module without tracing through interleaved
message branches and markup.

Success means clearer responsibility and independently verified equivalence.
There is no target line count, performance-improvement claim or new feature.

## 3. Current state

The accepted implementation separates three module-scope presentation components
and private message helpers into `AppPresentation.tsx`, using narrow readonly
resource-free projections. App retains all lifecycle ownership and both distinct
preference handlers. Nine added integration cases protect the extraction;
existing assertions remain intact. The final unit changes 646 lines over three
source/test files. See [execution evidence](../evidence/app-readability/README.md).

Planning snapshot (historical): the inspected `App.tsx` contained 1,039 lines;
`App` began at line 239. It already
delegates narration configuration to `settings/narration-settings-actions.ts`.
The completed desktop organization campaign retained restoration, persistence,
replacement and locator routing in App because they share publication lifetime.

The fresh read-only planning Audit Packet `APP-READABILITY-01` recommends one
CHANGE unit with medium risk and the following dispositions:

| Target at the planning snapshot | Evidence | Disposition |
| --- | --- | --- |
| `FAILURE_MESSAGE` and `statusMessage`, `readyStatusMessage`, `restorationNotice` (lines 110 and 148-223) | Fixed message policy is separated from its display sites by hundreds of lines of coordination code | CHANGE: move as private helpers beside their presentation consumers |
| `openBookControl` (853-877) | File-picker/status markup has an explicit event boundary and no resource ownership | CHANGE: stable `OpenBookControl` component |
| Publication heading (928-940) | Title/authors formatting and markup depend only on publication metadata | CHANGE: `PublicationHeading` component |
| Restoration notice (947-964) | Notice presentation can receive current restoration data and a dismissal callback | CHANGE: `RestorationNotice` component; dismissal state remains in App |
| Preference handlers (654-692) | Reader changes optionally use the save coordinator; Settings changes validate/no-op and choose coordinator versus direct repository persistence | SKIP deduplication: a shared persistence-mode helper would obscure the distinction for little benefit |
| Restoration, saving, cleanup, replacement and locator callbacks | Identity checks and effect/call ordering coordinate the same live publication | SKIP extraction; retain ownership, hooks and ordering |
| Existing narration settings actions, CSS, schemas and public contracts | Already separated or outside this presentation problem | EXCLUDED |

This refines the earlier suggestion to review preference duplication. It does
not promise a change for every visually similar block. The auditor inspected
source and tests but ran no tests; the packet is not implementation acceptance.

## 4. Scope and non-goals

The source unit has exactly these candidate paths:

1. `apps/desktop/src/App.tsx`.
2. `apps/desktop/src/App.test.tsx`.
3. `apps/desktop/src/AppPresentation.tsx` (new).

Move the identified presentation surface, update imports/call sites and add only
the focused integration assertions needed to protect the extraction boundary.
Keep the three visual components and their private message helpers in one
cohesive module. A separate generic messages utility or a folder for each small
component is unnecessary for this scope.

Exclude preference-handler deduplication; new hooks/controllers/context;
coordinator or repository extraction; changes to effect dependencies, resource
construction, cancellation, navigation or persistence; settings-action changes;
new dependencies; CSS/DOM redesign; copy or localization changes; protocol,
schema, native and TTS-package work; generated sources; frozen evidence and
completed plans. Do not move the existing test suite merely to match the new
component file.

The 2026-10-11 execution request authorizes implementing this plan and updating
its documentation. Staging, commits, pushes, pull requests, merge, rebase and
publication remain prohibited, including after validation PASS. Preserve
unrelated work and keep the index empty.

## 5. Relevant files and documentation

Read [the documentation index](../../README.md), [MVP](../../product/mvp.md),
[roadmap](../roadmap.md), [system diagram](../../architecture/system-diagram.md),
[architecture overview](../../architecture/overview.md),
[ADR-0011](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md)
and [ADR-0041](../../architecture/decisions/ADR-0041-simplify-empty-and-ready-reader-chrome.md).
ADR-0041 explicitly requires the same mounted file input across empty/ready
transitions so keyboard focus survives.

Read `AGENTS.md`, `.agents/PLANS.md`, both safe-refactor skills and their complete
contract/validation references. Also consult
[testing guidance](../../development/testing.md),
[evidence retention](../../development/evidence-retention.md) and the completed
[settings extraction](../completed/bounded-settings-and-chatterbox-modularization.md).

Inspect the three source-unit paths and these unchanged collaborators:

- `apps/desktop/src/reader/ReaderErrorBoundary.tsx`, `ReaderPublication.tsx`,
  `reader-lifecycle.ts` and `reader-preferences.ts`.
- `apps/desktop/src/persistence/reader-position-restore-coordinator.ts`,
  `reader-position-save-coordinator.ts` and `narration-position-save-bridge.ts`.
- `apps/desktop/src/settings/narration-settings-actions.ts`, its tests,
  `ReaderSettingsDialog.tsx` and its tests.
- `apps/desktop/src/strict-mode-resource-cleanup.ts`.
- `apps/desktop/tests/browser/foundation.smoke.spec.ts` and
  `reader-reflow-restoration.smoke.spec.ts`.
- Root `package.json`, `apps/desktop/package.json`, lint configuration and
  the configured browser/native test runners.

Reinspect current imports and tests at execution time; line numbers and Git
identities in this planning snapshot are navigation aids, not a fresh baseline.

## 6. Architecture and constraints

### Presentation boundary

Proposed organization:

```text
apps/desktop/src/
  App.tsx                 # resources, effects, state, callbacks and composition
  App.test.tsx            # existing integration behavior and focused additions
  AppPresentation.tsx     # three stateless components; private message helpers
```

Declare `OpenBookControl`, `PublicationHeading` and `RestorationNotice` at module
scope. They receive narrow readonly data and callbacks; they do not create or
close resources, call repositories/native services, subscribe to coordinators
or initiate persistence. Export components and necessary types only. Keep the
message helpers private to preserve the existing React Refresh export rule.

Use presentation inputs for status, settlement, the required restoration result
fields, metadata and callbacks. Do not import App into the new module, pass the
whole application state/controller, or export App's private resource-bearing
restoration state just to share types. Type-only imports must stay type-only.
Preserve the existing public `AppProps` and `ReadyPublicationContentProps`
exports and the injectable test seams.

Project only the fields needed for display: lifecycle status and failure reason;
restoration status/settlement, position mode (and book-start reason) and preference
status; and publication summary metadata. Do not carry a locator, publication
handle or coordinator into these props. A type-only `ReaderPublicationSummary`
reference is sufficient for the heading. App retains the selection event handler
and the dismissal callback that captures its current publication sequence.

### Observable invariants

- Preserve exact strings, classes, element nesting/order, IDs, accessible names,
  live-region attributes, visually hidden status behavior and picker enablement.
  Do not add wrapper elements as part of extraction.
- Render `OpenBookControl` at the same stable position across idle, opening,
  ready, replacement and failure states. Do not key it by publication or define
  its component function inside App. Retain the same input DOM node and App's
  synchronous input-value reset and cancellation handling in `handleSelection`.
- Keep `ReaderErrorBoundary` placement and `publicationSequence` key unchanged.
  Keep reader/narration mounting conditions and `ReadyPublicationContent` props,
  including omitted optional props, unchanged.
- App still filters restoration by publication identity and sequence before
  presentation. Preserve message precedence for loading, pending, unavailable,
  superseded, exact, recovered and book-start cases, including unsupported or
  unavailable preferences and an absent notice.
- App owns the dismissed publication sequence and dismissal callback. A notice
  dismissed for one publication must not hide a later publication's notice.
- Keep Settings visibility, button ref, dialog props, close/focus restoration and
  configuration actions where they are. Preserve title/author fallback formatting
  and keep private filenames/paths out of the rendered UI and logs.
- Do not change either preference handler, coordinator construction, hook
  dependencies, microtask deferral, StrictMode supersession tokens, restoration
  identity guards, cleanup ordering, locator routing or replacement order.

EPUB admission, stable locators, local inference, one active narration owner,
bounded buffers, cancellation and memory-only audio remain unchanged. Malformed
EPUB failures retain their current content-free presentation; no parser change
or real copyrighted book is needed for this work.

### Execution ownership and unit size

Use `$orchestrate-safe-refactor` with the director, one reusable Sol auditor,
one Sol worker and one Astra validator in the repository's named roles. Supporting
agents do not delegate. The director maintains coordination documentation; only
the worker edits source. Keep writing, independent validation and Git mutation
sequential. Missing required roles/evidence is BLOCKED, never self-acceptance.

Treat all three source/test paths as one atomic unit, `APP-READABILITY-01`.
The planning ceiling is three files and approximately 650 added/deleted lines,
principally relocation. Freeze exact transformations, invariants, ceiling and
commands after a fresh accepted audit and a passing independent baseline.
This fits the normal primary-file/test/support-file boundary. Do not turn its
milestones into sequential units that silently reuse a dirty App baseline.

The index and source allowlist must start clean; record the new file as ABSENT.
Existing plan/index changes are separate coordination work, not a reason to
commit without authorization. Reports bind a unique Report ID, HEAD and every
validated path identity before and after checks. Drift requires a new report.
Allow at most two correction loops before redesigning the order; do not carry
an unaccepted patch into another unit or discard overlapping user changes.

## 7. Milestones

### Milestone 1: Refresh the bounded audit and baseline

Status: complete. Current audit accepted; APP-READABILITY-01-BASELINE-01 PASS.

Verify the current branch, HEAD, index and all three paths. Recheck the message/
markup seams, public type consumers, React Refresh rule and tests. Record the
preference and lifecycle SKIPs. Freeze the presentation inputs and exact JSX
replacement sites in draft work-order terms. Run the baseline in section 8
outside the sandbox with no writer active.

Acceptance: an accepted Audit Packet and an independent baseline PASS tied to
the exact paths and HEAD. Preserve relevant pre-existing failures as
BASELINE-FAIL; resolve execution prerequisites without weakening test assertions
or changing unrelated code. Only then issue the immutable Approved Work Order.

### Milestone 2: Extract the presentation surface

Status: complete; final worker patch has 646 changed lines over three files,
including the independently requested fixture correction.

Create the module-scope components and private message helpers; replace only
their corresponding App markup/helper usage. Keep coordination and preferences
in App. Add a focused integration assertion for persistent picker-node identity
across lifecycle transitions, reusing the existing synthetic publication/open
flow fixtures. Add further assertions only for a demonstrated extraction risk
not already covered by the existing suite.

Acceptance: a worker Change Packet mapping every edit to the closed order;
unchanged DOM/behavior contracts and lifecycle ownership; no unrelated cleanup,
dependency/configuration edits or new abstraction. Source length reduction alone
does not establish acceptance.

### Milestone 3: Independently validate equivalence

Status: complete; APP-READABILITY-01-POST-CHANGE-02 PASS, all nine commands and
exact source identity recheck. First failed attempt is retained separately.

The validator reviews the complete diff, test integrity and every invariant,
repeats the baseline commands and verifies the new file through real App usage.
The worker remains idle. Protect the existing restoration, persistence,
StrictMode, replacement, failure, Settings and unmount assertions.

Acceptance: POST-CHANGE PASS with unchanged before/after identities, followed
by the required aggregate gates in section 8. A successful typecheck or source
inspection cannot replace browser/native evidence for the mounted input and
focus behavior. A correction invalidates affected prior acceptance and needs
fresh validation; do not update old report hashes to fit the new patch.

### Milestone 4: Document and close

Status: complete; results, decisions and receipts recorded, diagram reviewed
unchanged, plan archived and documentation indexes updated. No Git publication.

Update this plan's progress, decisions and actual outcomes. Review the canonical
diagram for continued consistency: no process/data-flow or high-level component
change is expected, so do not redraw it merely for an internal TSX extraction.
Record the implemented ownership and retained SKIPs in the closeout; keep prior
completed plans and their evidence unchanged.

Store concise Markdown receipts under `docs/plans/evidence/app-readability/`.
Raw logs, identity dumps and temporary scripts belong in ignored
`tmp/evidence/app-readability/<run>/` or CI artifacts. Review the complete diff,
including coordination documentation, for unrelated changes and private data.

Acceptance: all required results are observed, independent acceptance is current
and the final scope/Git state is reported. Move this plan to completed and update
indexes only then. If blocked, retain the active plan and precise remaining work.
Do not create commits or a PR merely to close a milestone.

## 8. Testing and benchmark strategy

All commands below exist in current configuration. Recheck the scripts and use
the repository-pinned toolchain at execution time. Run every acceptance command
from repository root in normal local PowerShell outside the managed sandbox.
Record exact commands, outcomes and source identities. Sandbox runs are only
exploratory. The original planning request ran documentation checks only;
the subsequent execution request ran the full acceptance matrix below.

Baseline and post-change commands:

```powershell
pnpm.cmd run build:packages
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd run format:check:typescript
pnpm.cmd run lint:typescript
pnpm.cmd run typecheck:typescript
pnpm.cmd test:browser
pnpm.cmd test:native-startup
```

The desktop `test` script includes its configured Vitest and Node test suites;
do not replace it with an invented single-file script. Browser and native
startup gates protect rendered shell, focus and packaged WebView behavior.
Inspect runner prerequisites and inherited environment before execution. Missing
host prerequisites remain explicit blockers, not permission to loosen a test
or claim that a portable pass establishes native equivalence.

After the source unit, complete package/final gates:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
```

Reuse applicable evidence for unchanged files instead of repeatedly running
constituent checks without a new reason; both required aggregate outcomes must
still be recorded. Do not transfer old campaign test counts or results to this
patch.

| Behavior | Coverage to preserve or add |
| --- | --- |
| Empty/ready shell and accessibility | Existing App tests for the single opening action, input description, metadata privacy and Settings visibility; browser foundation checks |
| Picker continuity | Add a meaningful App integration assertion that the input is the same DOM node across opening/ready/replacement; preserve cancellation and synchronous reset; verify browser/native focus behavior |
| Restoration and messages | Existing exact/recovered settlement, notice dismissal, busy/failure and empty-publication tests. Add focused App assertions for uncovered unavailable/unsupported-preference cases and message precedence; existing missing/default fixtures do not establish that coverage. |
| Lifetime and persistence | Existing StrictMode, flush-before-replacement, heard-position ownership, reset ordering, rendering failure, obsolete completion and unmount tests |
| Layout and Settings continuity | Existing foundation and reader-reflow-restoration browser scenarios; same CSS/DOM structure and Settings focus ownership |

Use observable App behavior rather than snapshots of component internals,
function-call counts created by the refactor, or tests of trivial prop forwarding.
Keep assertions and fixtures intact unless a specific gap justifies an addition.

No model-backed benchmark is justified solely by this presentation extraction.
The order excludes inference, scheduling, cancellation, buffering, playback and
profile-selection changes. If a fresh audit finds those paths must change,
stop and redesign the scope and its applicable exact-host gates before editing.
Do not claim new performance, audio-quality or hardware-support results.

## 9. Risks and rollback

The main risks are remounting the picker, moving the error boundary or its key,
altering message precedence/visibility, losing notice sequence identity, changing
focus, or hiding resource ownership behind component props. The narrow extraction
and existing integration tests address those risks directly.

If props require passing resource owners or lifecycle effects into the new
module, reject that design and revise the work order. If an existing test fails
on the untouched baseline, preserve the failure and keep the refactor blocked
until the required prerequisite is resolved.

Rollback only the exact worker-owned changes in the three-file unit, preserving
pre-existing and concurrent user work. Do not use a broad reset/clean, discard
unrelated edits or change historical evidence. No runtime package, model,
installed application or persisted user data needs migration for this plan.

## 10. Progress log

- [x] 2026-10-11: reviewed the current App, direct collaborators, tests,
  previous lifecycle SKIP and applicable shell/accessibility requirements.
- [x] 2026-10-11: accepted `APP-READABILITY-01` as a planning recommendation:
  presentation CHANGE, preference deduplication SKIP and lifecycle SKIP.
- [x] 2026-10-11: accepted Git Report `APP-READABILITY-SETUP-01`; created
  `codex/app-readability` from clean `main` at
  `f9c35db8f51adb5080ffa94a31cb9278020a0b1b`, preserving main/HEAD and an empty index.
- [x] 2026-10-11: drafted this ExecPlan; implementation remains unstarted.
- [x] 2026-10-11: host authoring checks passed for 12 required sections,
  11 relative links, nine configured commands, the three documentation paths,
  whitespace, unchanged HEAD/main and an empty index.
- [x] 2026-10-11: corrected the documentary review's coverage claim: unavailable
  and unsupported-preference cases are identified gaps, not existing App tests.
- [x] 2026-10-11: independent documentary review approved the corrected plan;
  final host authoring checks passed with the same three-file scope.
- [x] 2026-10-11: execution started on existing `codex/app-readability` at
  `a1c2b467037e91c82aa0354d697704c967bfb5e6`; initial worktree/index clean, new
  module absent. No Git mutation was needed. See
  [execution setup](../evidence/app-readability/execution-setup.md).
- [x] Milestone 1: current [audit/draft](../evidence/app-readability/audit-and-draft.md)
  accepted; [baseline PASS](../evidence/app-readability/baseline-01.md) for all
  seven commands outside sandbox; immutable
  [work order](../evidence/app-readability/approved-work-order-01.md) issued.
- [x] Milestone 2: worker delivered the three-file extraction and nine added
  integration cases, 645 changed lines. Director reviewed
  [Change Packet](../evidence/app-readability/change-packet-01.md) and full diff;
  no correction cycle used. Writer inactive before validation.
- [x] Milestone 3: first post-change attempt found a new picker-test fixture
  error, preserved in [POST-CHANGE-01](../evidence/app-readability/post-change-01.md).
  The first correction changed only value seeding in that test, retaining every
  assertion and both production hashes. Fresh
  [POST-CHANGE-02](../evidence/app-readability/post-change-02.md) passes all nine
  commands and exact before/after identities. Final unit: 646 changed lines.
- [x] Milestone 4: retained immutable receipts, reviewed complete source/docs
  scope and canonical diagram, recorded limitations, archived plan and updated
  indexes after source/aggregate acceptance. Index remains empty; no commits.

## 11. Discoveries and decisions

- Preserve the prior lifecycle SKIP: presentation extraction does not justify
  dividing restoration, persistence, replacement or locator routing.
- Keep message functions private beside their consumers; a single presentation
  module fits this scope and the existing React Refresh export rule.
- Keep preference handlers distinct. Their validation and fallback-persistence
  policies are observably different; reducing their small repeated sequence
  would add a policy abstraction rather than clarify App.
- Preserve the file input's identity as required by ADR-0041, not merely the
  appearance or accessible label of a replacement element.
- Use one source unit because all edits share App and its integration tests.
  Milestones are ordered stages, not independently accepted dirty baselines.
- The subsequent execution request authorizes source implementation after a
  fresh independent baseline. Planning review and historical acceptance reports
  cannot substitute for that baseline.
- Existing pnpm/EdgeDriver selections needed process-only adaptations: pinned
  Corepack pnpm 11.15.1 and the existing driver matching WebView2 155.0.4283.45.
  No repository environment or dependency configuration changed.
- New preference-failure tests deliberately hold startup hydration pending so
  the coordinator observes the injected failure. Late startup-read completion
  remains untested; the existing effect and persistence policies are unchanged.
- Testing Library invokes the native file-input setter for fireEvent target.value.
  The initial test fixture therefore failed. Seeding its existing synthetic own
  property before dispatch fixes the fixture without weakening assertions.
- Canonical diagram still matches implementation: picker/session/reader,
  Settings, persistence, local inference and all process/trust/data-flow edges
  are unchanged. No diagram edit, new architecture or performance claim.

## 12. Final validation results

Historical plan preparation checks passed outside the sandbox; independent
documentary review approved that plan only. The ignored checker was run with
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File tmp/evidence/app-readability/plan-authoring/check-plan.ps1`.
It checks required sections, links, script registration, index navigation,
whitespace (including this new file), branch/HEAD/main and the exact authoring
scope.

| Historical preparation gate | Result at preparation time |
| --- | --- |
| Planning audit | CHANGE for presentation; SKIP for preference deduplication and lifecycle extraction; tests not run |
| Branch setup | PASS: `codex/app-readability` from the recorded clean local main; main/HEAD unchanged; no staging or commit |
| Plan structure, relative links and configured commands | PASS: 12 sections, 11 links and nine commands |
| Authoring diff scope and whitespace | PASS: this plan and the two documentation indexes; source untouched; empty index |
| Independent documentary review | PASS after correcting the existing-coverage claim and confirming the narrow presentation inputs; document only |

Current implementation acceptance: independent GPT-6 Astra high report
`APP-READABILITY-01-POST-CHANGE-02`, PASS at unchanged HEAD
`a1c2b467037e91c82aa0354d697704c967bfb5e6`. Exact three-path SHA-256,
filter-aware Git blobs and porcelain identities before/after commands are in
the [immutable accepted report](../evidence/app-readability/post-change-02.md).
All commands ran sequentially from repository root in local PowerShell outside
the sandbox with writer/Git idle.

| Exact command | Baseline | Final corrected patch |
| --- | --- | --- |
| `pnpm.cmd run build:packages` | Exit 0 | Exit 0 |
| `pnpm.cmd --filter @voxleaf/desktop test` | Exit 0; 588 Vitest + 51 Node | Exit 0; 597 Vitest + 51 Node |
| `pnpm.cmd run format:check:typescript` | Exit 0 | Exit 0 |
| `pnpm.cmd run lint:typescript` | Exit 0 | Exit 0 |
| `pnpm.cmd run typecheck:typescript` | Exit 0 | Exit 0 |
| `pnpm.cmd test:browser` | Exit 0; 7 tests | Exit 0; 7 tests |
| `pnpm.cmd test:native-startup` | Exit 0 | Exit 0 |
| `pnpm.cmd check:portable` | Not a baseline gate | Exit 0 |
| `pnpm.cmd check` | Not a baseline gate | Exit 0 |

Aggregates include 209 shared, 651 EPUB, 597 desktop Vitest, 51 desktop Node,
485 Python and 13 evidence tests, plus 17 generated-contract checks. Full native
check also passes 87 default and 88 release-locked Rust tests and release builds.
The initial implementation attempt failed only the new input fixture; it is
retained with actual aggregate short-circuit limits, never relabelled PASS.

No unresolved blocker. Non-failing Vite chunk/color warnings and a Python cache
write warning remain documented; Python tests passed without permission changes.
No model-backed benchmark/audio-quality/hardware-support claim. Raw captures
remain ignored under `tmp/evidence/app-readability/`; curated Markdown receipts
are in [execution evidence](../evidence/app-readability/README.md).

Final Git scope: three implementation files, this plan's archival, three
documentation indexes and the unit's Markdown receipts. Existing branch/HEAD
remain unchanged and the index empty. No staging, commit, push, PR, merge or rebase.
