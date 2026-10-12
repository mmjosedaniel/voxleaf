# Desktop state subscription hooks

Status: complete; implemented and independently accepted on 2026-10-12.
Prepared on 2026-10-12. Branch: `codex/desktop-state-subscription-hooks`,
created from clean, up-to-date `main` at
`667f9fbdb45ec5b08f304eb9c1713ec0f94a26d1`.

## 1. Goal

Organize the existing React-to-coordinator subscriptions behind two reusable,
domain-specific hooks. Keep the current coordinators as the sole owners of
their snapshots and operations. Do not add Redux, Zustand, another dependency,
a global store, or a second writable copy of coordinator state.

Required deliverables are `useProductNarrationSnapshot` and
`useHardwareCompatibilitySnapshot`, their focused lifecycle tests, and use of
each hook at both of its existing React observation sites. Extracting only one
consumer or only adding unused hooks does not complete this plan. There is no
target reduction in line count or claim of measured performance improvement.

This is cross-milestone desktop maintenance, following the completed
[App presentation](../completed/app-conditional-presentation.md),
[preference effects](../completed/app-preference-effects-readability.md), and
[hardware effects](../completed/app-hardware-effects-readability.md) plans.
It does not reopen their retained ownership and orchestration responsibilities.

## 2. User-visible outcome

Reading, narration controls, Settings, compatibility status, optional-package
eligibility, preference persistence, and book replacement behave as before.
Contributor-facing subscription code has one named entry point per reused
snapshot source, with explicit types and tested subscription cleanup.

Mounting or removing an observation hook only subscribes or unsubscribes that
consumer. It does not start detection, refresh availability, acquire a model,
write preferences, stop playback, or close a shared coordinator.

## 3. Current state

The planning checkout already includes the App presentation extraction from
PR #237. Neither Redux nor Zustand is installed in the desktop manifest.
Current state management combines local React state, UI-independent observable
coordinators, and separate versioned persistence repositories.

| Area | Verified responsibility and planning disposition |
| --- | --- |
| `tts/ProductNarrationControls.tsx` | An inline `useSyncExternalStore` bridge reads `ProductNarrationCoordinator`; availability checking is a separate effect. Migrate only the observation bridge. |
| `settings/ReaderSettingsDialog.tsx`, `CoordinatorNarrationStartSettings` | Repeats the same narration subscription and snapshot read. Use the narration hook while retaining its active/disabled conditions and action handler. |
| `tts/HardwareCompatibilityControls.tsx` | An inline bridge reads the compatibility coordinator. Pending state, selection/reset actions, and pending-notification cleanup are separate responsibilities. Migrate only the observation bridge. |
| `settings/ReaderSettingsDialog.tsx`, `OptionalChatterboxSettings` | Repeats compatibility observation, then derives acquisition eligibility. Use the hardware hook; preserve derivation and the explicit post-recheck `observe()` read. |
| `tts/OptionalChatterboxControls.tsx` | Its client snapshot bridge has one React consumer. SKIP extraction merely for symmetry; polling, pending state, and download progress remain here. |
| `App.tsx` | Its single-use reader-lifecycle subscription already has memoized callbacks. Local presentation state and stable repository/coordinator instances have distinct lifetimes. SKIP changes. |
| `reader/ReaderPublication.tsx`, `ParagraphLeaf.tsx`, `SemanticDocument.tsx` | Reader navigation, leaf state, DOM/resource observation, and audible-progress reconciliation have their own contracts. SKIP this separate boundary. |
| `settings/app-preference-effects.ts` and `tts/hardware-compatibility-check-binding.ts` | Existing hydration, fallback preference projection, and hardware visibility bindings. Retain their current effects and cancellation guards. |

Both selected coordinator classes return a cached snapshot from `observe()`
and return an unsubscribe callback from `subscribe()`. Their methods use class
instance state, so passing a detached method would lose its receiver. Each
current React bridge supplies the snapshot reader as the third
`getServerSnapshot` argument as well.

Repeated inline bindings are the concrete maintenance target. The review has
not established a rendering bottleneck, a need for selectors, or a reason to
centralize every `useState`. In particular, a state initializer that retains
a repository instance is not redundant global application state.

Read-only planning Audit Packet `STATE-HOOKS-PLAN` confirms these two reuse
pairs and the retained SKIPs. It also identifies missing live-notification
coverage in Product controls and source/visibility transition coverage in
Settings; hardware tests already exercise real coordinator notifications.
This is planning evidence, not an execution baseline or runtime verdict.

## 4. Scope and non-goals

Use one bounded source/test unit, `STATE-SUBSCRIPTIONS-01`, with this closed
candidate allowlist:

1. `apps/desktop/src/tts/use-product-narration-snapshot.ts` (new).
2. `apps/desktop/src/tts/use-hardware-compatibility-snapshot.ts` (new).
3. `apps/desktop/src/tts/snapshot-subscription-hooks.test.tsx` (new).
4. `apps/desktop/src/tts/ProductNarrationControls.tsx`.
5. `apps/desktop/src/tts/HardwareCompatibilityControls.tsx`.
6. `apps/desktop/src/settings/ReaderSettingsDialog.tsx`.
7. `apps/desktop/src/tts/ProductNarrationControls.test.tsx`.
8. `apps/desktop/src/tts/HardwareCompatibilityControls.test.tsx`.
9. `apps/desktop/src/settings/ReaderSettingsDialog.test.tsx`.

Existing test files are eligible only for missing consumer-level regression
coverage. Leave them unchanged when their assertions already protect the
required behavior. Keep existing integration coverage in its current suites;
do not move it into hook tests or rewrite fixtures across unrelated tests.

This explicitly exceeds the normal primary/test/two-support-file unit because
both hooks meet in the same Settings file. Its entire production edit is two
small observation adapters and four call-site replacements across three
consumers. Validate one combined patch through sequential checkpoints; do not
claim a clean second baseline for overlapping, unstaged Settings edits.
Planning ceiling: nine source/test files and 500 added-plus-removed lines.
The execution auditor must confirm or tighten this bounded exception before
the director freezes the work order.

Documentation scope is this plan and the maintained active/completed/docs
indexes. Reviewed Markdown acceptance summaries may be added under
`docs/plans/evidence/desktop-state-subscription-hooks/`; raw logs and temporary
checkers belong in ignored `tmp/evidence/desktop-state-subscription-hooks/`.

Excluded: coordinator implementations and interfaces; App implementation;
reader/persistence internals; optional-client polling; action/effect extraction;
new Context providers, generic store frameworks, selectors, equality policies,
snapshot cloning or aggregation, barrel exports, dependency/config changes,
CSS/DOM/wording changes, Rust/Python/native protocol changes, generated sources,
frozen authority, and edits to completed plans or historical evidence.

The 2026-10-12 implementation request authorizes implementation, validation and
documentation on the existing branch. It explicitly forbids staging, commits,
push and PR creation. Execution uses the current HEAD
`44a83f4113e9cbeadee7d8a2d0e62838df70629b`, without recreating the branch or
returning to its historical origin. The initial worktree and index were clean.
The current audit tightens the execution allowlist to eight paths: retain
`HardwareCompatibilityControls.test.tsx` unchanged as SKIP. The ceiling remains
600 added-plus-removed source/test lines in one combined unit, under the
independently audited [superseding order](../evidence/desktop-state-subscription-hooks/work-order-02.md).
The original 500-line estimate and order are retained as historical preparation.

## 5. Relevant files and documentation

Before execution, read [AGENTS.md](../../../AGENTS.md),
[the plan format](../../../.agents/PLANS.md), [docs index](../../README.md),
[MVP](../../product/mvp.md),
[reader settings requirements](../../product/reader-settings-and-playback-controls.md),
[roadmap](../roadmap.md), [system diagram](../../architecture/system-diagram.md),
[overview](../../architecture/overview.md),
[ADR-0008](../../architecture/decisions/ADR-0008-visual-reader-architecture.md),
[ADR-0011](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md),
and [ADR-0041](../../architecture/decisions/ADR-0041-simplify-empty-and-ready-reader-chrome.md).
ADR-0041 and current code govern ready-only Settings visibility where an older
product paragraph describes pre-book Settings access.

Read [orchestrate-safe-refactor](../../../.agents/skills/orchestrate-safe-refactor/SKILL.md),
its [contracts](../../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md),
[validate-safe-refactor](../../../.agents/skills/validate-safe-refactor/SKILL.md),
its [validation matrix](../../../.agents/skills/validate-safe-refactor/references/validation-matrix.md),
[testing guidance](../../development/testing.md), and
[evidence retention](../../development/evidence-retention.md).

Inspect all candidate paths and these unchanged collaborators:

- `apps/desktop/src/tts/product-narration-coordinator.ts` and its tests.
- `apps/desktop/src/tts/hardware-profile-compatibility.ts` and its tests.
- `apps/desktop/src/tts/optional-chatterbox-client.ts`,
  `OptionalChatterboxControls.tsx`, and its tests.
- `apps/desktop/src/settings/app-preference-effects.ts` and its hook tests.
- `apps/desktop/src/App.tsx`, `App.test.tsx`, and the reader files in section 3.
- Root and desktop `package.json`, `apps/desktop/vite.config.ts`, and the
  current Playwright configuration before choosing execution commands.

Use the official [React external-store contract](https://react.dev/reference/react/useSyncExternalStore)
for cached snapshots, subscription cleanup, source identity, and server snapshot
behavior. Repository ownership rules remain the authority for runtime effects.

## 6. Architecture and constraints

### Hook contracts and placement

Colocate the two hooks with their TTS domain under `apps/desktop/src/tts/`.
Use the existing kebab-case module naming convention. Do not create a generic
top-level `state/` or `hooks/` subsystem for these two domain adapters.

- `useProductNarrationSnapshot(source)` returns `ProductNarrationSnapshot`.
- `useHardwareCompatibilitySnapshot(source)` returns
  `HardwareCompatibilitySnapshotV1`.

Give each hook a narrow structural source type using
`Pick<ExistingCoordinator, "subscribe" | "observe">`, or an equivalent exact
domain-specific interface. Import coordinator and snapshot types with
`import type`. Consumers keep their existing coordinator props and action
methods; these hooks return only the observed snapshot.

Wrap calls as `source.subscribe(listener)` and `source.observe()` to preserve
`this`. Keep the subscription and snapshot callbacks stable for the same source
using `useCallback` with that source as the dependency. Pass the same stable
snapshot reader as both client and server reader to `useSyncExternalStore`.
Do not retain callbacks for a replaced source, use module-level caches, or
manufacture a fresh object from every snapshot read.

There is no hook-owned `useState`, hydration, loading state, async request, or
snapshot projection. Return the source snapshot itself without changing object
identity or freezing/mutating it. Do not implement a parallel effect-plus-state
subscription mechanism.

### Ownership and behavior invariants

1. The same coordinator instance is passed to the same mounted consumer.
   Its cached snapshot remains authoritative; each consumer has its own
   subscription, and removing one consumer leaves other consumers active.
2. Changing the source replaces the subscription and exposes the new source's
   current snapshot. Subsequent old-source emissions cannot replace that value.
3. Unmount releases the observation subscription only. Strict Mode may replay
   setup/cleanup; no listeners remain after final unmount.
4. `ProductNarrationControls` retains its `checkAvailability()` effect with
   the same dependency, conditions, and location. The hook never calls it.
5. Settings retains its optional-narrator/fallback component split. Never make
   hook calls conditional within one component or invent an empty coordinator
   for the fallback branch. Keep subscriptions in the existing child consumers,
   which unmount when the dialog closes; do not hoist hooks into the continuously
   mounted `ReaderSettingsDialog` parent and subscribe while it is closed.
6. `OptionalChatterboxSettings` retains `chatterboxAcquisitionPresentation`,
   explicit recheck, and the fresh `hardwareCompatibility.observe()` after
   awaited recheck. Do not replace that read with a render-time snapshot.
7. Local pending/detail state, all action callbacks, focus handling, disabled
   conditions, visibility, DOM order, labels, and ready-only Settings remain.
8. App still owns resource construction, replacement and teardown. Stable
   locators, restoration identity, preference hydration/version rejection,
   generation invalidation, cancellation, and scheduler/player ownership do
   not move into the hooks.
9. EPUB contents and generated audio remain local and outside these adapters.
   No persistence, diagnostics, network flow, queue, buffer, timer, or retained
   history is added. Malformed-EPUB handling remains at its existing boundary.

Review the canonical system diagram during acceptance. These adapters stay
inside the existing React presentation boundary; no diagram or ADR change is
expected. Record that review, and stop for a revised scope if the implementation
would actually change an architectural boundary.

## 7. Milestones

### Milestone 1: Confirm the bounded unit and establish baseline

Re-read current source and inventory every target as CHANGE, SKIP, or excluded.
Reuse one `clean_code_auditor` and one `refactor_validator`; use the configured
Sol auditor/worker and Astra validator roles. Obtain a fresh Audit Packet,
confirm the unit exception and draft the exact allowlist, ceiling, invariants,
and acceptance commands. An unavailable mandatory role is a blocker, not
permission to substitute models or self-validate.

Confirm the index is empty and every source/test allowlisted path is clean;
preserve the separately authorized planning-document changes. Baseline runs
outside the sandbox. Record relevant failures as `BASELINE-FAIL` and stop
before production edits. Only a passing baseline permits an immutable Approved
Work Order. Existing planning reviews are not execution baseline evidence.

Validation: the baseline command group in section 8 and immutable identities.
Status: complete. Current audit accepted; all seven host baseline gates passed
in [BASELINE-01](../evidence/desktop-state-subscription-hooks/baseline-01.md),
with unchanged HEAD, eight path identities and an empty index.

### Milestone 2: Add and exercise the observation hooks

One `clean_code_worker` owns all source/test writes for this unit. It is not
alone in the repository and must preserve other work. Add both typed hooks and
their shared colocated suite, `snapshot-subscription-hooks.test.tsx`. Within
that test file, reuse a small receiver-sensitive harness across both hooks,
with typed synthetic cached snapshots, real listener sets and observable
unsubscribe behavior. Do not create a production generic adapter or a separate
test-fixture framework. Follow the existing `renderHook`, `act`, cleanup and
Strict Mode test conventions.

Where a missing component behavior needs characterization, add that assertion
against the existing consumer before replacing its bridge. Hook tests can be
added with the new hooks; do not claim they passed against nonexistent modules.
Keep meaningful component coverage rather than testing hook names or imports.

Validation: focused package test/type commands from section 8; this checkpoint
does not establish final acceptance or permit unrelated edits.
Status: complete. Both typed hooks and eight shared cases, one Product case
and three Settings cases pass with all four original bridges unchanged;
[checkpoint A](../evidence/desktop-state-subscription-hooks/checkpoint-a-01.md)
records 661 Vitest and 51 Node tests with stable eight-path identities.

### Milestone 3: Migrate all four observation sites

Replace the narration bridges in `ProductNarrationControls` and
`CoordinatorNarrationStartSettings`, and the hardware bridges in
`HardwareCompatibilityControls` and `OptionalChatterboxSettings`. Remove only
now-unused imports. Keep effects, actions, conditions and fresh imperative
reads in place. Preserve local state; add no stores or providers.

Review each invariant and the complete diff as one unit. At most two precise
worker correction loops are allowed under the skill; redesign the order if
its scope is inadequate. Do not split overlapping Settings edits into fake
independent units or carry an unaccepted patch into another refactor.

Validation: all four sites use the intended hook; package tests and unchanged
component behavior pass; excluded files and manifests have no changes.
Status: complete. All four bridges migrated; final eight-path patch totals
592 added-plus-removed lines under the revised 600-line order.

### Milestone 4: Independent acceptance

Keep writers and Git mutations idle. The validator records an immutable
Report ID, starting/ending HEAD, exact closed paths, porcelain statuses,
worktree SHA-256 and filter-aware blob identities, before and after commands.
Use ABSENT for the new paths at baseline. PASS requires stable identities,
empty index, preserved assertions and complete checks.

Run the same baseline gates, then the package/final gates in section 8. Include
the existing App and optional-client tests through the desktop suite even
though their implementations are excluded. Verify scope, lifecycle invariants,
privacy and artifact hygiene, not just green test exits. Drift requires a new
report and validation, not revised hashes on an old PASS.

Validation: POST-CHANGE, PACKAGE and FINAL reports with exact commands/outcomes.
Status: complete. Independent POST-CHANGE-01, PACKAGE-01 and FINAL-01 all PASS
at unchanged HEAD with matching source identities and empty index; see section 12.

### Milestone 5: Close documentation and hand off

Record changes, SKIPs, failures, repairs, diagram review and actual validation
results. After every required deliverable and gate passes, move this plan to
`docs/plans/completed/`, update both plan indexes and `docs/README.md`, and
repair incoming links without leaving a redirect in `active/`. Preserve
completed historical plans and evidence.

Leave the patch unstaged unless the implementation request separately
authorizes commits. If commits are authorized, use the available `git_steward`
with an exact-path Git Action Order bound to the immutable validation report;
documentation edits made after a report require their own current validation.
Push and PR creation require separate user authorization.

Validation: documentation links, evidence guard, exact diff and Git status;
the final response distinguishes implemented, validated and committed work.
Status: complete. Plan archived, maintained indexes updated and no redirect
left in active. Source reports and original work orders remain immutable.
Final documentary receipt is retained separately in the evidence directory.

## 8. Testing and benchmark strategy

All acceptance runs from the repository root in normal local PowerShell
outside the managed sandbox. Use the repository-pinned Node/pnpm toolchain.
Do not upgrade dependencies or lockfiles to make an environment check pass.
Sandbox-only failures or passes are exploratory and must be repeated unchanged
on the host before drawing an acceptance conclusion.

Baseline and post-change group, verified against the current manifests:

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd test:browser
pnpm.cmd test:native-startup
```

The desktop test script includes Vitest and native-helper Node tests. Do not
append a Vitest path filter to this composite script and assume it filters all
parts correctly. New hook suites are discovered by the existing configuration.
The browser and packaged WebView2 startup gates protect integration of the
changed Settings/playback presentation consumers. Keep any host-driver or
environment failure separate from source regressions; neither gate is replaced
by jsdom tests.

For each hook, verify:

- Initial and subsequent snapshots are the exact objects returned by the
  current source; an emission updates the consumer without local copying.
- A parent rerender with the same source keeps the active subscription stable.
  Do not assert incidental React snapshot-reader call counts.
- Source replacement detaches A, reads B immediately, ignores later emissions
  from A, and continues observing B; methods retain their source receiver.
- Multiple mounted consumers work independently; removing one does not remove
  the other's listener or close the source.
- Strict Mode setup/cleanup leaves the correct live listeners while mounted
  and none after unmount. Do not assume one total subscribe call under Strict
  Mode or React's development checks.
- Observation does not call lifecycle, hardware-check, persistence or action
  methods. Use test doubles with such observable methods where useful.

Add live-notification Product wiring coverage without manually rerendering the
consumer to simulate an emission. Add Settings coverage for live narration and
hardware-status/eligibility updates, coordinator replacement, fallback-to-
coordinator transitions and closing/reopening. Assert that closed Settings
leaves no child subscriptions and reopening adds no hardware checks, narrator
activation or playback operations. Preserve the existing application-version
read and optional-client refresh/polling behavior on opening. Retain hardware's
existing real-coordinator notification tests,
adding only missing lifecycle assertions. Keep existing
availability, pending-selection cleanup, profile/language actions, download
progress, accessibility and App restoration/teardown checks.

After the combined unit passes, run the required package and final gates:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
```

Do not rerun those gates for documentation-only closure unless new evidence
requires it. Validate the resulting documentation/evidence scope with:

```powershell
pnpm.cmd check:evidence
git diff --check
```

No new benchmark, GPU/model run, packaged acquisition journey or performance
claim is justified by these read-only observation adapters.
Review the validation matrix against the actual patch: if Tauri invocation,
packaged lifecycle, profile selection, cancellation, scheduling or playback
logic must change, stop and revise the work order and its risk-triggered gates.
Existing broad gates do not substitute for a newly applicable native/exact-host
gate, and a passing test suite is not a measured memory or rendering result.

## 9. Risks and rollback

The main risks are detached class methods, stale closures after source
replacement, fresh snapshot objects causing repeated updates, subscription
leaks, and unintentionally moving an operation into a hook. Typed narrow
contracts, explicit dependency identity, focused lifecycle tests and existing
integration suites address these risks.

Keeping whole cached snapshots deliberately preserves the existing observation
granularity. Do not add selector caches or equality optimizations without a
separate measured problem and design. Do not mistake fewer component lines
for improved runtime performance.

If the patch fails, correct only the worker-authored allowed changes or remove
those verified hunks. Restore the prior inline bridges and remove newly added
hook modules only when their provenance is established. Never use broad reset,
clean, stash or restore operations, and preserve unrelated user work. A future
committed rollback is a separate reviewed change; this plan authorizes no
history rewriting.

## 10. Progress log

- 2026-10-12: inspected current source, tests, manifests, previous completed
  plans and ownership documentation. Selected the two repeated coordinator
  observation boundaries; implementation and baseline remain pending.
- 2026-10-12: updated clean `main` with `git pull --ff-only origin main`
  (already up to date), then created `codex/desktop-state-subscription-hooks`
  from `667f9fbdb45ec5b08f304eb9c1713ec0f94a26d1`. No staging or commit.
- 2026-10-12: fresh configured Sol audit accepted the combined unit, tightened
  the allowlist to eight files and preserved the hardware test suite as SKIP.
  Configured Astra independently passed all seven host baseline commands at
  current HEAD `44a83f4113e9cbeadee7d8a2d0e62838df70629b`. No Git mutation is
  authorized; Git stewardship is therefore not invoked. Source implementation
  remains pending the frozen work order and sequential checkpoints.
- [x] Milestone 1: fresh audit, approved scope and host baseline.
- 2026-10-12: checkpoint A draft stopped before migration at 450 unformatted
  changed lines. Independent audit found required formatting and migration
  would exceed 500 without compressing readable tests or reducing coverage.
  Director approved a new immutable 600-line order with the identical eight
  paths, invariants, checkpoints and commands. BASELINE-01 stays unchanged;
  no second baseline or runtime acceptance is claimed for the partial draft.
- 2026-10-12: checkpoint A passed host build, desktop typecheck and full desktop
  tests (57 files/661 Vitest plus 51 Node); source/test diff is 548 lines.
  Original bridges remain byte-identical to BASELINE-01. The independent
  identity-bound receipt is intermediate evidence, not another baseline or
  final acceptance. Director accepted continuation to the four migrations.
- [x] Milestone 2: typed hooks and focused tests.
- 2026-10-12: migrated exactly four bridges, preserving their effects/actions
  and the post-recheck imperative read. Independent post-change repeated all
  seven baseline gates successfully. PACKAGE check:portable and FINAL check
  passed separately on identical eight-path manifests. No source correction
  loop or test repair was needed. Scope totals 592 changed lines across eight
  source/test paths; excluded files, hardware tests and manifests are unchanged.
- [x] Milestone 3: all four consumer bridges migrated.
- [x] Milestone 4: independent complete acceptance.
- 2026-10-12: reviewed the canonical diagram against the accepted patch;
  architecture unchanged. Retained immutable curated reports, kept raw data in
  ignored scratch, passed host check:evidence and git diff --check, archived
  this plan and updated all maintained incoming links. Final documentary
  identity/link review is retained separately from source acceptance.
- [x] Milestone 5: documented results, links and archival.

## 11. Discoveries and decisions

- The current observable coordinators already provide the state source that
  React needs. The desired improvement is named, reusable observation, not
  replacement of runtime state management.
- There are two proven reuse pairs. Optional-client observation, App's reader
  lifecycle bridge and reader event streams are excluded rather than forced
  into a common abstraction.
- Both pairs meet in `ReaderSettingsDialog.tsx`; one bounded combined unit
  avoids overlapping dirty baselines and does not require implementation
  commits merely to proceed to a second extraction.
- Hook contracts accept only observation capabilities. Actions, async effects,
  resource ownership, persistence versioning and fallback projection remain
  explicit in their existing owners.
- The canonical system diagram already represents presentation consuming
  independently owned runtime state. Internal hook modules need no new node,
  process, dependency or persistence arrow. Director and independent validator
  reviewed it against the final diff; it remains unchanged, with no ADR needed.

## 12. Final validation results

Implemented useProductNarrationSnapshot and useHardwareCompatibilitySnapshot,
their shared lifecycle/server suite, and all four observation-site migrations.
Added twelve cases: eight shared hook cases, one Product live-notification
case and three Settings characterization cases. Existing assertions remain.
Typed observation-only contracts preserve receiver, cached snapshot identity,
stable source callbacks and getServerSnapshot; subscriptions stay independent
and inside Settings children. Availability, fresh post-await hardware reads,
actions, effects, persistence, cancellation and resource ownership stay put.

All reports bind HEAD `44a83f4113e9cbeadee7d8a2d0e62838df70629b` and the exact
eight-path manifest. BASELINE records the three new paths ABSENT. Checkpoint A
proves the new tests with original bridges; later source reports all bind the
same final patch. Commands ran in normal host PowerShell outside the sandbox,
using process-local Corepack shims for pnpm 11.15.1 and Node v24.20.0.

| Command | Baseline | Final source acceptance |
| --- | --- | --- |
| `pnpm.cmd build:packages` | exit 0 | exit 0 |
| `pnpm.cmd --filter @voxleaf/desktop typecheck` | exit 0 | exit 0 |
| `pnpm.cmd --filter @voxleaf/desktop test` | 649 Vitest + 51 Node | 661 Vitest + 51 Node; exit 0 |
| `pnpm.cmd format:check:typescript` | exit 0 | exit 0 |
| `pnpm.cmd lint:typescript` | exit 0 | exit 0 |
| `pnpm.cmd test:browser` | 7/7; exit 0 | 7/7; exit 0 |
| `pnpm.cmd test:native-startup` | exit 0 | exit 0; zero errors/external requests |
| `pnpm.cmd check:portable` | not required in baseline | exit 0 |
| `pnpm.cmd check` | not required in baseline | exit 0 |

The final aggregate gate includes 209 shared, 651 EPUB, 661 desktop Vitest,
51 desktop Node, 485 Python, 13 evidence-guard, and Rust 87 default/88
release-locked passing tests. One unchanged Rust subprocess fixture is ignored
per configuration and exercised by its parent test. Source/type/lint/format
and configured portable/native/Python builds pass.

Immutable evidence:

- [BASELINE-01](../evidence/desktop-state-subscription-hooks/baseline-01.md),
  Report ID `STATE-SUBSCRIPTIONS-01-BASELINE-01-20261012`: PASS.
- [Checkpoint A](../evidence/desktop-state-subscription-hooks/checkpoint-a-01.md),
  receipt `STATE-SUBSCRIPTIONS-01-CHECKPOINT-A-01-20261012`: three commands pass;
  intermediate evidence only, not a second baseline or final acceptance.
- [POST-CHANGE-01](../evidence/desktop-state-subscription-hooks/post-change-01.md),
  Report ID `STATE-SUBSCRIPTIONS-01-POST-CHANGE-01-20261012`: PASS.
- [PACKAGE-01](../evidence/desktop-state-subscription-hooks/package-01.md),
  Report ID `STATE-SUBSCRIPTIONS-01-PACKAGE-01-20261012`: PASS.
- [FINAL-01](../evidence/desktop-state-subscription-hooks/final-01.md),
  Report ID `STATE-SUBSCRIPTIONS-01-FINAL-01-20261012`: PASS.

Limits: non-failing existing Vite chunk-size and color-environment warnings;
host pytest reported a non-failing cache-write permission warning. No repair
outside scope, dropped check or new dependency was introduced. No new GPU/model,
private-book, installed acquisition, rendering/memory/latency benchmark or
performance claim. Raw logs/checkers/identity captures remain ignored under
`tmp/evidence/desktop-state-subscription-hooks/`; curated Markdown is retained
under the evidence directory. Local raw captures are not permanent public
artifacts. Original work-order evidence and historical plans are preserved.

Documentation: host `pnpm.cmd check:evidence` and `git diff --check` exit 0.
Closure updates the active/completed/docs indexes and retains no active-path
redirect. A separate documentary receipt covers the final archived state;
unaffected source gates are not rerun for Markdown-only closure.

Git: existing branch retained, HEAD unchanged, empty index, changes unstaged;
no staging, commits, push or PR performed.
