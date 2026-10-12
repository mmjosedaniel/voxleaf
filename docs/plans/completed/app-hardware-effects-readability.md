# App hardware effect and readability

Status: complete; independent source and aggregate validation PASS. Archived
on 2026-10-11 with implementation and documentation unstaged; no commits.
Prepared on 2026-10-11. Branch: `codex/app-hardware-effects-readability`, created
from clean local `main` at `c392396eb2b444f8d1f09ee24f018d6b85f98615`.

## 1. Goal

Make `apps/desktop/src/App.tsx` easier to follow by extracting its hardware
visibility-event binding, testing that boundary, and naming the existing
preference presentation types and two compound UI conditions.

This is bounded maintenance across existing reader and hardware responsibilities,
so it uses a descriptive filename. It follows the completed
[App readability plan](../completed/app-readability.md) without reopening that
plan or its retained publication-lifecycle and preference-policy boundaries.

## 2. User-visible outcome

Hardware checks, file-picker availability, busy announcements, preference
presentation, keyboard focus and reader behavior remain unchanged. The effect
in App states which hardware behavior is connected to the document, while its
small event policy has a dedicated module and focused tests.

The local type and variable names explain existing data and conditions. No new
feature, line-count target, performance improvement or hardware-support claim
is part of success.

## 3. Current state

At the planning snapshot, `App.tsx` has 919 lines. Its presentation components
and messages already live in `AppPresentation.tsx`, and narration configuration
actions already delegate to `settings/narration-settings-actions.ts`.

| Current slice | Evidence and planning disposition |
| --- | --- |
| Hardware effect, App lines 342-359 | CHANGE: it performs the initial check, remembers hidden visibility, checks on the next non-hidden event, and removes its listener. It depends on one hardware coordinator and the document, not the active publication. |
| Inline preference state types, lines 190-214 | CHANGE: name the two existing readonly shapes locally; preserve every field, union, initializer and setter. |
| `isBusy` and `openDisabled`, lines 741-749 | CHANGE: name the restoration-wait and close-failure conditions without changing their truth values. |
| Startup preference hydration, lines 234-289 | DEFERRED: it also seeds the restore coordinator. Late-read ordering against restoration, user changes and unmount needs separate characterization before an extraction. |
| Restoration, saving, cleanup, locator routing and distinct preference handlers | RETAIN: publication identity, sequence, settlement and ordered cleanup remain cohesive in App. |
| Presentation projection, Settings wrappers and remaining simple JSX | EXCLUDED: no additional helper, hook or component extraction is needed for this request. |

The read-only audit `APP-EFFECTS-AUDIT-01` found no existing test that drives the
App `visibilitychange` binding. Hardware coordinator tests cover probe
coalescing and pre-start checks, but those do not establish the document-event
bridge's behavior or teardown. The current App integration suite protects
restoration, replacement, persistence, rendering failures and StrictMode.

Existing preference-failure cases deliberately leave startup hydration pending.
The completed App plan records that late completion remains untested; this
plan does not reinterpret that as a demonstrated bug or silently repair it.

## 4. Scope and non-goals

Treat the following four paths as one source/test unit,
`APP-HARDWARE-READABILITY-01`:

1. `apps/desktop/src/App.tsx`.
2. `apps/desktop/src/App.test.tsx`.
3. `apps/desktop/src/tts/hardware-compatibility-check-binding.ts` (new).
4. `apps/desktop/src/tts/hardware-compatibility-check-binding.test.ts` (new).

The normal unit is App, its integration tests, and two directly coupled support
files. The planning ceiling is four files and approximately 350 added/deleted
lines. Re-audit and freeze the exact ceiling before implementation; exceeding
it requires a revised order, not implicit scope expansion.

Keep unit tests beside the new module and integration scenarios in App's suite.
Do not reorganize the entire test tree, split `App.test.tsx`, introduce shared
fixtures without demonstrated duplication, or relocate the coordinator's
existing tests. The current Vitest configuration already uses the repository's
colocated `.test.ts`/`.test.tsx` convention; no runner/configuration change is
planned.

Exclude hydration extraction or race fixes; new state, hooks or singleton
services; coordinator ownership changes; cleanup-token unification; preference
handler deduplication; presentation-projection changes; DOM/CSS/copy changes;
new dependencies; public contracts; native/Python/package work; generated
sources; frozen evidence; and edits to completed ExecPlans.

The 2026-10-11 execution request authorizes this plan's source implementation,
tests, evidence and documentation. It requires the existing branch to be
preserved. Staging, commits, pushes, pull requests, merge and rebase are not
authorized. Preserve unrelated work and leave the index empty.

## 5. Relevant files and documentation

Read `AGENTS.md`, `.agents/PLANS.md`, both safe-refactor skills and their complete
contract and validation references. Consult:

- [Documentation index](../../README.md), [MVP](../../product/mvp.md) and
  [roadmap](../roadmap.md).
- [Reader settings requirements](../../product/reader-settings-and-playback-controls.md).
- [Canonical system diagram](../../architecture/system-diagram.md) and
  [architecture overview](../../architecture/overview.md).
- [ADR-0011](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md)
  for application-owned persistence, and
  [ADR-0041](../../architecture/decisions/ADR-0041-simplify-empty-and-ready-reader-chrome.md)
  for stable picker identity and reader chrome.
- [Testing guidance](../../development/testing.md) and
  [evidence retention](../../development/evidence-retention.md).

Inspect App and its tests plus these unchanged collaborators:

- `tts/hardware-profile-compatibility.ts` and its `.test.ts` file, relative to
  `apps/desktop/src/`.
- `persistence/narration-position-save-bridge.ts` and its tests as the existing
  example of an explicit binding that returns a disconnection function.
- `strict-mode-resource-cleanup.ts`, the preference repositories, the reader
  restore/save coordinators and `settings/narration-settings-actions.ts`.
- `apps/desktop/vite.config.ts`, `src/test/setup.ts`, both package manifests,
  and configured browser/native runner prerequisites.

Line numbers and the branch base recorded here describe the planning snapshot.
Reinspect live files and scripts before execution; they are not a fresh baseline.

## 6. Architecture and constraints

### Hardware event binding

Introduce a normal TypeScript function with the proposed signature
`bindHardwareCompatibilityChecks(target, visibilitySource): () => void`.
Use a narrow target contract such as
`Pick<HardwareProfileCompatibilityCoordinator, "ensureChecked" | "check">`
through a type-only import, and only the necessary document visibility and
event-listener members. Avoid importing React or App into the binding module.

App passes its existing hardware coordinator and `document`. Keep the effect
at its current place among App's hooks and retain its dependency on
`hardwareCompatibilityCoordinator`; its return value is the binding cleanup.
App still creates the coordinator and calls `useStrictModeSafeResourceCleanup`.
The new module must not close or replace that resource.

Preserve the exact sequence and event policy:

1. Call `target.ensureChecked()` with its receiver intact and without awaiting it.
2. Read initial visibility into a binding-local hidden-observed flag, then
   register one `visibilitychange` listener.
3. A `hidden` event arms the flag without checking hardware.
4. The next non-hidden event consumes the flag and calls
   `target.check("operating-system-resume")`, retaining its receiver and the
   existing `void` behavior. Another event without a new hidden period does not
   request another check. Initially hidden documents obey the same rule.
5. Cleanup synchronously removes that exact listener. Later events have no
   effect through that binding.

Do not add a debounce, new coalescing policy, error handler, awaited setup,
global visibility flag, retry, logging or interpretation of an OS resume event.
The binding observes document visibility; the existing reason string does not
mean this change adds a native operating-system subscription.

### Local types and derived conditions

Define private readonly interfaces next to App's existing status aliases:

| Type | Existing fields retained verbatim |
| --- | --- |
| `ReaderPreferencePresentation` | `preferences: ReaderPreferencesV1`, `status: ReaderPreferenceStatus`, `canPersist: boolean` |
| `NarrationStartPreferencePresentation` | `selection: AdaptiveBufferStartMode`, `status: NarrationStartPreferenceStatus`, `canPersist: boolean` |

Use them as the corresponding `useState` type parameters. Do not export them,
move them to a generic types file, share them across a new hook, or change the
loading/default values or setter behavior. Preserve the existing public
`AppProps` and `ReadyPublicationContentProps` exports. These readonly type
annotations must not introduce runtime freezing or other object transformations.

Near the current UI conditions, introduce these derived constants:

```tsx
const isRestoringReader =
  viewState.status === "ready" &&
  (readyRestoration === undefined ||
    readyRestoration.settlement === "pending");

const hasBlockingCloseFailure =
  viewState.status === "failure" && viewState.reason === "close-failed";

const isBusy =
  viewState.status === "closing" ||
  viewState.status === "opening" ||
  isRestoringReader;

const openDisabled =
  viewState.status === "closing" || hasBlockingCloseFailure;
```

These expressions retain the original UI policy. Keep them derived during
render; do not add effects, state, memoization, or tests of boolean aliases.
Do not simplify the existing publication/sequence guards or reorder resource
construction while making these local edits.

### Ownership and execution discipline

Use `$orchestrate-safe-refactor` with one reusable `clean_code_auditor`, one
`clean_code_worker` and an independent `refactor_validator`, with the configured
Sol/Astra models. The director writes coordination documentation; only the
worker edits the closed source/test unit. Supporting agents do not delegate.
Keep source writing, validation and any separately authorized Git mutation idle
while either of the other activities is running.

Require an empty index and clean source allowlist at baseline; record both new
files as ABSENT. Plan/index work is separate coordination documentation and
does not authorize committing to manufacture a clean source baseline. Treat
all implementation milestones as stages of this one unit, not multiple units
that reuse a dirty App baseline.

Reports bind a unique Report ID, HEAD and each validated path's identity before
and after checks. Drift requires a new report; never refresh an old approval's
hashes. Allow at most two correction loops before redesigning the order.
Missing required roles or host evidence blocks implementation acceptance.

Privacy, local inference, bounded memory, cancellation, stable locators and
memory-only audio remain unchanged. Existing malformed-EPUB handling and
synthetic fixtures remain sufficient; no private book or model artifact is
needed to exercise this binding.

## 7. Milestones

### Milestone 1: Refresh the audit and establish the baseline

Status: complete. Accepted audit `APP-HARDWARE-READABILITY-AUDIT-01` and
independent `APP-HARDWARE-READABILITY-01-BASELINE-02` PASS. See the
[audit and frozen order](../evidence/app-hardware-effects-readability/audit-and-work-order-01.md)
and [baseline reports](../evidence/app-hardware-effects-readability/baseline-reports.md).

Verify branch, HEAD, index, the four source paths and the exact current behavior.
Refresh the planning audit with the explicitly requested local type/condition
changes. Reconfirm test discovery and coverage gaps. Draft the closed work-order
terms and have the independent validator execute section 8's baseline commands
outside the sandbox with no source writer active.

Acceptance: accepted audit, clean source identities and an independent baseline
PASS. Record pre-existing failures as BASELINE-FAIL and do not fix unrelated
code or weaken assertions. Freeze the Approved Work Order only after PASS.

### Milestone 2: Implement the binding, tests and local readability changes

Status: complete under `APP-HARDWARE-READABILITY-WORK-01`; four files and
320 added plus deleted lines against the 350-line ceiling. See the
[Change Packet](../evidence/app-hardware-effects-readability/change-packet-01.md).

Implement only the operations in section 6. Add the focused unit cases and App
integration coverage described in section 8. Preserve all existing assertions,
fixtures, effect ordering and initialization policy. Do not move App tests merely
because some production code moved.

Acceptance: the worker returns a Change Packet mapping every edit to the frozen
order, within the closed four-path allowlist and ceiling. The two named types
and two explanatory conditions add no runtime state or public API.

### Milestone 3: Independently validate and close the plan

Status: complete. Independent `APP-HARDWARE-READABILITY-01-POST-CHANGE-01`
passed every focused and aggregate command with unchanged source identities
and empty index. No correction loops were required. See the
[immutable acceptance report](../evidence/app-hardware-effects-readability/post-change-01.md).

With the worker idle, the validator reviews the full source diff, binding
semantics, test integrity and type/condition equivalence, then repeats the
baseline gates and runs the final aggregate gates. Any correction requires a
fresh post-change report for the resulting identities.

After acceptance, update this plan with actual outcomes and concise receipts
under `docs/plans/evidence/app-hardware-effects-readability/`. Keep raw logs,
identity dumps and temporary scripts in ignored
`tmp/evidence/app-hardware-effects-readability/<run>/` or CI artifacts.

Review the canonical diagram for consistency. This internal event-binding
extraction is expected to preserve the existing component/process/data-flow
model, so no diagram redraw or ADR is planned. Retain completed plans unchanged.
Review source and coordination documentation for unrelated edits and private data.

Acceptance: current independent acceptance, all required host results and an
honest final Git-state report. Only then move this plan to completed and update
the indexes. If blocked, keep it active with the precise remaining work. No
commit, push or PR is implied by closing the plan.

## 8. Testing and benchmark strategy

Use the repository-pinned toolchain and commands configured at execution time.
Run acceptance from the repository root in normal local PowerShell outside the
managed sandbox. An exploratory sandbox result is never final evidence.

Baseline and post-change commands:

```powershell
pnpm.cmd run build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd run format:check:typescript
pnpm.cmd run lint:typescript
pnpm.cmd test:browser
pnpm.cmd test:native-startup
```

The desktop test command includes configured Vitest and Node suites. Do not
replace it with an invented single-file script. Browser evidence protects busy
and picker presentation; native startup protects the packaged shell and its
hardware-client integration. Neither replaces deterministic event-policy tests.

Final package/campaign gates:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
```

Both aggregate outcomes must be observed. Reuse applicable evidence for
unchanged paths rather than repeating constituent checks without a new reason.
Record exact commands, outcomes, prerequisites and source identities. Missing
native prerequisites remain explicit blockers; do not substitute a portable
pass or change runner configuration merely to obtain a green result.

| Layer | Coverage to preserve or add |
| --- | --- |
| New binding unit tests | Initial check and setup order; initial visible/hidden state; hidden events without a recheck; the next non-hidden event; repeated visible events; a second hidden/non-hidden cycle; synchronous disconnection and no later calls. Keep visibility flags local to each binding. |
| App integration | Mount App with a controlled hardware dependency, drive document visibility, and verify the intended check reason. Under StrictMode, verify one effective subscription survives the setup/cleanup probe and no visibility-triggered check occurs after unmount. Restore modified document descriptors and listeners after each test. |
| Coordinator tests | Preserve existing coalescing, compatibility, profile and pre-start tests in their current file. Do not move them into the binding suite. |
| Local types and conditions | Typecheck plus existing observable App busy, availability, failure, picker, restoration and Settings assertions. Add an App assertion only for a demonstrated missing behavior case; do not test aliases or duplicate their expressions in isolated tests. |
| Lifecycle and reader | Retain all existing StrictMode, replacement, flush ordering, heard-progress, rendering-failure, notice, focus and unmount coverage. |

Do not equate StrictMode's setup probe with a promise to call `ensureChecked`
only once: the coordinator already owns coalescing. Assert effective listener
behavior and cleanup rather than a fragile total count of initialization calls.

No model-backed benchmark is justified by the unchanged event policy and local
type/condition naming. The order excludes hardware matching, profile selection,
native detection internals, inference, scheduling, cancellation, buffering and
playback changes. If execution needs any of those changes, stop and redesign
the scope and applicable exact-host gates before editing them.

## 9. Risks and rollback

Main risks are a changed setup order, losing method receivers, using a shared
visibility flag, leaving duplicate listeners after StrictMode setup, closing
the hardware owner in the binding, or changing the UI conditions while renaming
them. Explicit input contracts, event-sequence tests and App integration address
these risks without reorganizing the reader lifecycle.

Rollback only verified worker-authored changes in the four-path unit and any
new files belonging to it. Preserve concurrent or pre-existing user work; do
not use broad reset/clean operations. There is no stored-data migration or
installed-runtime change. A rejected patch must not become another unit's base.

## 10. Progress log

- [x] 2026-10-11 execution: verified existing branch
  `codex/app-hardware-effects-readability` at current HEAD
  `609ae1b290e1070586a9142cd0063fffd2476910`, with an empty index and clean
  worktree. No Git mutation was necessary. The two planned binding files are
  absent. Planning identity is historical, not the execution baseline.
- [x] 2026-10-11 execution: started the configured Sol auditor and independent
  Astra validator with recursive delegation prohibited; worker execution waits
  for baseline PASS. No Git steward is needed because all Git mutations are
  prohibited and the initial index is already empty.
- [x] 2026-10-11: inspected current App, related tests, existing binding pattern,
  safe-refactor contracts and configured validation commands.
- [x] 2026-10-11: retained the bounded hardware extraction recommendation from
  `APP-EFFECTS-AUDIT-01`; included the user's requested local types and conditions.
- [x] 2026-10-11: accepted the planning refinement
  `APP-HARDWARE-READABILITY-01`: one four-path unit, medium risk, approximately
  350 changed lines, and no added runtime ownership or state.
- [x] 2026-10-11: accepted Git Report `APP-HARDWARE-READABILITY-SETUP-01`;
  created `codex/app-hardware-effects-readability` from clean local main at
  `c392396eb2b444f8d1f09ee24f018d6b85f98615`, with main/HEAD preserved and no staging.
- [x] 2026-10-11: drafted this plan and indexed it; no source implementation.
- [x] 2026-10-11: independent documentary review approved the refined plan;
  implementation acceptance remains pending.
- [x] 2026-10-11: host authoring checks passed for 12 required sections,
  11 relative links, nine configured commands, the three documentation paths,
  whitespace, unchanged main/HEAD and an empty index.
- [x] Milestone 1: fresh execution audit, independent baseline and frozen order.
- [x] 2026-10-11: baseline 01 passed six gates but native session creation
  failed with stale PATH EdgeDriver 150 against WebView2 155. Baseline 02 used
  the existing signed matching driver through the supported process-local
  override and passed all seven commands with unchanged identities. No source
  fix, global installation or gate weakening was needed.
- [x] Milestone 2: binding, tests and local naming changes.
- [x] 2026-10-11: worker delivered five additional cases and the exact requested
  four-file change, with scoped host formatting PASS. Director found no scope
  expansion; independent acceptance remains pending.
- [x] Milestone 3: independent acceptance, evidence and archival.
- [x] 2026-10-11: Astra independent post-change review and all nine required
  host commands passed; HEAD and the four source identities remained unchanged.
  Desktop increased from 597 to 602 Vitest cases, retaining all 51 Node cases;
  browser 7/7 and packaged WebView2 passed. Both aggregates passed, including
  Python 485 and Rust 87 default / 88 release-locked tests.
- [x] 2026-10-11: director reviewed canonical diagram and architecture: the
  helper remains inside the desktop compatibility responsibility, adds no
  component/process/persistence/external edge, and preserves ownership. No
  diagram change or ADR is required. Archived plan and updated navigation;
  retained raw logs in ignored temporary evidence. No staging or commits.

## 11. Discoveries and decisions

- A normal binding function matches an existing repository pattern and makes
  document-event ownership explicit; a new React hook/resource owner is unnecessary.
- Unit tests belong next to the binding, while App integration remains in
  `App.test.tsx`. This is not a general test-folder migration.
- The two local type names and derived booleans are explicitly requested scope;
  do not use that permission to rename or reorganize unrelated App code.
- Startup preference hydration is deferred because the existing tests do not
  characterize late completion. Preserve the current effect and its semantics.
- Keep one atomic source/test unit: hardware binding and the local naming edits
  share App and its integration tests. Do not add commits merely to separate stages.
- The planning branch starts from local main; no fetch, pull or remote mutation
  was required or performed. Implementation must verify current state again.
- Execution used current HEAD `609ae1b290e1070586a9142cd0063fffd2476910`;
  the earlier planning base was not reused as validation identity.
- The first native baseline failure came from a stale PATH driver. Selecting
  the existing matching signed driver through the runner's environment override
  resolved session creation; all commands were repeated in baseline 02.
- Accepted scope is 320 changed lines across four source/test files, with five
  new cases and no correction cycles. Preference hydration, real OS suspend
  integration, model-backed inference/performance and installer lifecycle stay
  outside this evidence. No new CI or hardware-support claim is made.

## 12. Final validation results

### Historical plan preparation

This subsection preserves preparation results separately from implementation.
Preparation alone made no product-test, source-equivalence or runtime claim.
The ignored authoring checker ran successfully from the repository root in
normal local PowerShell outside the sandbox:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File tmp/evidence/app-hardware-effects-readability/plan-authoring/check-plan.ps1
```

| Gate | Current result |
| --- | --- |
| Read-only planning audit | `APP-HARDWARE-READABILITY-01`: CHANGE for the binding and requested local types/conditions; other ownership boundaries retained |
| Branch setup | PASS: `APP-HARDWARE-READABILITY-SETUP-01`, clean main base recorded above, main/HEAD unchanged, empty index |
| Independent documentary review | PASS: refined four-path scope, local types/conditions, tests and validation gates reviewed; document only |
| Plan sections, links, commands, authoring scope and whitespace | PASS: 12 sections, 11 links, nine commands, only the plan/two indexes changed, main/HEAD unchanged and empty index |
| Implementation gates at preparation time | Not run at preparation; superseded only by the fresh execution reports below |

### Execution acceptance

All commands below ran from repository root in normal local PowerShell outside
the sandbox. Node v24.20.0 and pinned pnpm 11.15.1 were verified. The process-local
matching EdgeDriver override is recorded in the
[baseline reports](../evidence/app-hardware-effects-readability/baseline-reports.md).

| Exact command | Baseline 02 | Post-change 01 |
| --- | --- | --- |
| `pnpm.cmd run build:packages` | PASS, exit 0 | PASS, exit 0 |
| `pnpm.cmd --filter @voxleaf/desktop typecheck` | PASS, exit 0 | PASS, exit 0 |
| `pnpm.cmd --filter @voxleaf/desktop test` | PASS, 54/597 Vitest + 51 Node | PASS, 55/602 Vitest + 51 Node |
| `pnpm.cmd run format:check:typescript` | PASS, exit 0 | PASS, exit 0 |
| `pnpm.cmd run lint:typescript` | PASS, exit 0 | PASS, exit 0 |
| `pnpm.cmd test:browser` | PASS, 7/7 | PASS, 7/7 |
| `pnpm.cmd test:native-startup` | PASS, exit 0 | PASS, exit 0; zero errors/external requests |
| `pnpm.cmd check:portable` | Not a baseline gate | PASS, exit 0 |
| `pnpm.cmd check` | Not a baseline gate | PASS, exit 0 |

Immutable report `APP-HARDWARE-READABILITY-01-POST-CHANGE-01` binds HEAD
`609ae1b290e1070586a9142cd0063fffd2476910` and exact four-file SHA-256,
filter-aware blob and porcelain identities in the
[acceptance receipt](../evidence/app-hardware-effects-readability/post-change-01.md).
Source scope, invariants, test integrity, privacy and identity recheck all PASS.
The initial `BASELINE-01` failure is retained separately rather than overwritten.

Aggregates include shared 209, EPUB 651, desktop 602 + 51 Node, Python 485,
and Rust 87 default / 88 release-locked tests. Existing non-failing warnings
remain: large Vite bundle, color environment, and pytest cache write permission.
No cache repair, gate weakening or configuration change was made.

Final Git boundary: existing branch and HEAD preserved; index empty; source,
receipts and archival/navigation changes remain unstaged. No commit, push, PR,
merge, rebase, reset, clean or stash was performed. No source changed after
independent acceptance. This completed plan records local acceptance only.
