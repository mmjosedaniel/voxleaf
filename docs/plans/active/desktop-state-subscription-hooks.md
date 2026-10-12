# Desktop state subscription hooks

Status: planned; implementation and runtime validation have not started.
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

The current request authorizes this plan, its navigation entries, and the local
branch only. It does not authorize source implementation, staging, commits,
push, or a PR. A subsequent implementation request determines those permissions;
this plan does not grant Git mutation authority. It can be implemented as one
unstaged source/test unit without intermediate commits.

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
Status: not started.

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
Status: not started.

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
Status: not started.

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
Status: not started.

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
Status: not started.

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
- [ ] Milestone 1: fresh audit, approved scope and host baseline.
- [ ] Milestone 2: typed hooks and focused tests.
- [ ] Milestone 3: all four consumer bridges migrated.
- [ ] Milestone 4: independent complete acceptance.
- [ ] Milestone 5: documented results, links and archival.

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
  process, dependency or persistence arrow; verify this again at acceptance.

## 12. Final validation results

Planning status only: the implementation branch exists at the recorded main
commit. No production code, test, dependency, configuration or historical plan
has been changed by preparation of this document.

Implementation baseline: NOT RUN.
Hook and consumer tests: NOT RUN for this plan.
Browser, portable and full implementation gates: NOT RUN for this plan.
Performance and hardware benchmarks: NOT RUN; no improvement claim.

Populate this section with the actual immutable reports, commands, exit
statuses, scope decisions and material limitations during execution. Prior
completed-plan results and documentation checks are not acceptance evidence
for the future hook implementation.
