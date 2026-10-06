# Bounded settings and Chatterbox modularization

## Goal

Improve internal responsibility ownership and testability without changing
VoxLeaf behavior. Execute two sequential, independently accepted units:

1. Extract the narration configuration actions currently embedded in `App.tsx`.
2. Audit the native optional-Chatterbox module and implement at most one small
   extraction if concrete evidence justifies it; otherwise record `SKIP`.

This is a maintenance plan, not a new product-roadmap milestone. The request
on 2026-10-06 authorizes creating this plan and its index links. Implementation,
test execution, and Git mutations have not started under this plan. The plan
does not itself constitute an immutable Approved Work Order or authorize a
commit, push, pull request, model download, or installed-package mutation.

## User-visible outcome

There is no intended visible change. Profile/language selection, reset,
Chatterbox activation/removal, error propagation, cancellation, and availability
refresh retain their existing behavior. The development benefit is that settings
actions can be understood and tested without mounting the complete reader.

## Current state

Planning snapshot: HEAD `0265d25b8af22c9037631ef1c7006963da66ee85`, branch
`codex/add-compact-system-diagram`; the worktree and index were clean before
these documentation edits. This snapshot is provenance, not a future baseline.
Reinspect the actual checkout and source before implementation.

The read-only modularity review found established boundaries between EPUB,
shared contracts, the Python TTS engine/service, native supervision, and desktop
playback. It did not establish a general architecture defect or a runtime bug.
Two independent TypeScript audit decisions from that review are retained here:

| Review target | Decision | Evidence and disposition |
| --- | --- | --- |
| `App.tsx` configuration actions, review ID `MOD-01` | `CHANGE` recommendation | `handleHardwareProfileSelection`, `handleChatterboxRemoval`, `handleNarrationLanguageSelection`, and `handleNarrationSettingsReset` repeat configuration-stop selection and orchestrate several collaborators inside the React shell. `App.test.tsx`'s reset-order test requires publication/open-flow/reader/dialog setup. Unit `MOD-A` addresses this concrete ownership and testing issue. |
| `ProductNarrationCoordinator`, review ID `MOD-02` | `SKIP` | Scheduling, PCM playback, estimation, transport, and recovery authority are already delegated. Identity, navigation, cancellation, and containment need coordinated ordering and have an injectable deterministic harness. File length alone does not justify splitting that lifecycle. |
| `tts_optional_chatterbox.rs` | Candidate only | The director observed manifest validation, acquisition, verification/cache receipts, repair, promotion/removal, and Tauri commands in one module. No bounded native Audit Packet or approved extraction exists yet. Unit `MOD-B` starts with evidence gathering. |

No implementation baseline, regression suite, or host test was run during the
review. Existing tests were inspected; their current passing status is unknown.

## Scope and non-goals

### MOD-A: narration settings actions

Proposed closed implementation allowlist:

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/App.test.tsx`
- new `apps/desktop/src/settings/narration-settings-actions.ts`
- new `apps/desktop/src/settings/narration-settings-actions.test.ts`

Extract the existing configuration callbacks into one stateless, internal,
specifically named action factory with injected collaborators. Keep React state,
resource ownership, subscriptions, callback lifetime, and presentation in `App`.
An explicit injected development-mode value may carry the existing packaged/DEV
choice; it must not introduce a new admission policy. Keep activation delegating
to profile selection and consolidate only the repeated stop-method choice.

Use a narrow presentation callback for a successful startup-preference reset so
the existing fallback UI update retains its timing relative to refresh and
possible rejection. Do not defer that update until an entire reset has succeeded.
Do not add a general action framework, hook library, or mutable controller.

Draft ceiling: four files and approximately 350 added/deleted lines in total,
including tests. Re-audit and revise the order before exceeding that scope.
Documentation/evidence updates are separate from this source allowlist.

### MOD-B: conditional native extraction

The audit scope is `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`, its
embedded tests, and direct callers in native supervision/main. Inspect relevant
release/acquisition authority before making a proposal.

An audit must identify one concrete maintenance or testing cost and choose
`CHANGE`, `SKIP`, or `BLOCKED`. Possible seams include manifest decoding/validation
or a cohesive acquisition operation; these are hypotheses, not selected edits.
Do not split all responsibilities at once or introduce a generic model installer.

Before a `CHANGE`, record exact source/test paths, symbols, visibility,
dependencies, error/order invariants, diff ceiling, and applicable native/host
commands in a new Audit Packet. Normally limit the unit to the original module,
its tests, and at most two directly coupled support files. New Rust submodules
must remain private to the existing owner. The TypeScript validation matrix is
not sufficient native evidence: extend the work order with the Rust commands and
runtime gates below. If no useful extraction fits, record `SKIP` and close the
plan without forcing a native modification.

### Excluded

- Decomposing `ProductNarrationCoordinator` or changing its state machine.
- Changing reader restoration, passive scrolling, highlighting, or React cleanup.
- Unifying the normalizers: historical v1 source is frozen evaluation authority.
- Changes to EPUB preparation, stable locators, TTS models/protocol, public APIs,
  serialized preferences, dependency graphs, defaults, resource limits, or errors.
- Manual generated-source edits, frozen records, historical plans, release
  manifests/payload identities, broad formatting, or unrelated cleanup.
- Product-roadmap expansion, distribution, signing, or new performance claims.

## Relevant files and documentation

- `AGENTS.md`, `.agents/PLANS.md`, and `docs/README.md`.
- `docs/product/mvp.md` and `docs/product/reader-settings-and-playback-controls.md`.
- `docs/architecture/overview.md` and `docs/architecture/system-diagram.md`.
- `docs/architecture/bilingual-narration-authority-v2.md`.
- `docs/architecture/chatterbox-official-acquisition-authority-v2.md`.
- `docs/architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md`.
- `docs/architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md`.
- `docs/architecture/decisions/ADR-0050-promote-ordinary-chatterbox-acquisition-and-retire-validation-overlay.md`.
- `docs/development/agentic-refactoring.md`, `testing.md`, and `git-workflow.md`.
- `.agents/skills/orchestrate-safe-refactor/SKILL.md` and its
  `references/refactor-contracts.md`.
- `.agents/skills/validate-safe-refactor/SKILL.md` and its
  `references/validation-matrix.md`.
- `App.tsx`'s direct settings, preference, compatibility, optional-package, and
  narration collaborators; these are read-only context for `MOD-A`.
- Root/desktop `package.json` and `apps/desktop/src-tauri/Cargo.toml` for actual
  command and feature definitions.

## Architecture and constraints

### Settings behavior invariants

1. Preserve callback signatures, results, rejection propagation, and the existing
   collaborator selection at invocation. Introduce no retries, concurrency,
   serialization, stale-reference behavior, or new fallback policy.
2. Preserve the current stop expression's semantics: use
   `stopForConfigurationChange` when available, otherwise `stop`; an absent
   narration coordinator remains supported. Await completion before subsequent
   settings mutation or package removal. A rejection prevents later operations.
3. In the packaged path, selecting Chatterbox first calls the optional client's
   `select`; a state other than `installed` returns `false` before stop/profile
   mutation. Preserve the current explicit DEV exception and activation route.
4. Refresh narration after successful profile/language selection only; refresh
   after removal only when removal completes successfully.
5. Reset retains the sequential order: stop, language reset, startup reset,
   playback reset, successful-startup fallback UI update, then refresh when
   language reset succeeded. Boolean failure does not introduce short-circuiting
   of the remaining resets. Return the conjunction of the three reset results.
6. Without a narration coordinator, reset startup/playback through the existing
   repositories. Preserve how saved/failed results affect the fallback display.
7. Leave `ReaderSettingsDialog` props, accessibility behavior, recovery-reset
   ownership, persisted formats, and English/Quick/playback defaults unchanged.

### Native and product invariants

- Keep exact manifest and SHA-256 admission, fixed origins/redirect rules,
  download/staging limits, path containment, and symlink/reparse-point rejection.
- Preserve one-operation cancellation/state behavior, repair allowlists,
  atomic promotion, receipt invalidation, full verification on a new process,
  and the existing installed-runtime lock scope and ordering.
- Preserve native pre-network host checks and stop-before-package-removal.
- Keep EPUB text local, inference local, diagnostics content-free, audio
  memory-only, and queues/buffers bounded. No books/audio/weights/private data
  enter committed artifacts.
- Preserve identity-first cancellation, heard checkpoints, and synchronized
  stable locators. No automatic engine failover or recovery retry is introduced.

Review the canonical system diagram during closeout. These internal extractions
are expected to preserve its component/process/trust/persistence model; update
it only if the approved implementation changes a boundary it actually depicts.
An architectural or behavior change discovered during work requires a separately
scoped decision instead of being hidden in this refactor.

## Milestones

### Milestone 1: Establish execution scope and fresh baseline

#### Work

- On an implementation request, re-read live instructions, inspect HEAD/index/
  worktree, preserve unrelated edits, and establish the implementation branch
  using separately authorized Git Action Orders. Do not automatically switch
  away from the current checkout or mutate Git while creating this plan.
- Reconfirm `MOD-A` evidence and draft allowlist against current source. Reuse
  one `clean_code_auditor`, one `clean_code_worker`, and one `refactor_validator`
  throughout the batch. Use Sol high for audit/implementation, Astra high for
  validation, and the Sol medium Git steward only for authorized Git actions.
  The Rust work order must explicitly carry its native scope and gates.
- Keep one source writer; supporting agents do not delegate. Honor the existing
  concurrency limit. Report unavailable required roles rather than substituting
  models; only the documented Git-steward fallback is permitted.
- Have the independent validator establish the `MOD-A` baseline. Only after a
  passing baseline issue the immutable Approved Work Order.

#### Validation

Use the `MOD-A` baseline commands below. Capture exact HEAD, clean allowlisted
paths, empty index, file identities, command outcomes, and a unique Report ID.
Treat a pre-existing relevant failure as `BASELINE-FAIL`, not a regression.

#### Status

Not started. The prior read-only recommendation is not baseline evidence.

### Milestone 2: Extract and accept MOD-A

#### Work

- Apply only the frozen settings-action work order with one implementation agent.
- Preserve the existing App reset-order integration assertion and add direct
  tests using deferred promises for stop-before-mutation, rejected selection,
  packaged Chatterbox preconditions, absent coordinator, reset result aggregation,
  and fallback presentation timing. Include rejection paths without changing
  current behavior. Keep an integration check that App invokes the new actions.
- Obtain a Change Packet and independent post-change Validation Report. Resolve
  actionable findings with at most two correction loops before redesigning.
- Record accepted evidence before starting the native unit. Any unaccepted patch
  must be corrected or only its verified worker-authored hunks removed first.

#### Validation

Repeat baseline commands, then browser and applicable profile/lifecycle gates.
Acceptance requires preserved invariants, unchanged public contracts, no unrelated
diff, and a PASS bound to the exact current source identities.

#### Status

Not started.

### Milestone 3: Decide and, if justified, execute MOD-B

#### Work

- After `MOD-A` acceptance, audit the native unit without assuming a desired split.
- On `SKIP`, retain the evidence and continue to closeout. On `BLOCKED`, record
  the precise missing decision/evidence and do not report the unit complete.
- On `CHANGE`, define one private extraction, a closed allowlist and ceiling,
  and fresh native baseline/host requirements before issuing its work order.
- Preserve existing embedded-test assertions. Add direct tests only when they
  establish the extracted boundary's invariants, not merely its new file layout.
- Use the same one-writer/independent-validator and evidence-identity discipline.

#### Validation

Use the native baseline and risk-triggered gates below. Never infer a packaged
or download-lifecycle pass from Rust unit tests alone.

#### Status

Not started; extraction is conditional on a fresh Audit Packet.

### Milestone 4: Final review and documentation closeout

#### Work

- Review the entire diff, exclusions, tests, privacy constraints, and system diagram.
- Run the package/final gates below and retain exact outcomes and limitations.
- Record each unit as accepted, skipped, or blocked. A blocked mandatory gate
  prevents completion; an evidence-backed `MOD-B` skip permits completion.
- Keep the index empty between units. Stage/commit only when authorized and
  only through the exact validated-path Git Action Order. Uncommitted accepted
  changes must be recorded as pre-existing context for the next unit, never
  silently added to its allowlist. Any later cross-unit edits invalidate the
  affected evidence and require revalidation.
- Store immutable audit/work-order/change/validation reports with stable links
  from the progress log, outside validated source paths. Keep final narrative
  evidence updates separately scoped. Do not refresh hashes inside an old PASS.
- Move this plan to `docs/plans/completed/` and update its index links only when
  all required acceptance and closeout work is actually complete.

#### Validation

Final independent PASS, complete reviewed diff, and truthful unit dispositions.
No feature/bug `change_reviewer` is added for this behavior-preserving campaign;
the independent refactor validator remains its acceptance gate.

#### Status

Not started.

## Testing and benchmark strategy

Every acceptance command runs from the repository root in normal local
PowerShell outside the managed sandbox. Sandbox runs are exploratory and must
be repeated unchanged outside it. Record exact commands, outcomes, environment,
Report ID, and before/after HEAD/path identities. Never reuse historical passes.

### MOD-A baseline and post-change

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
```

Post-change also requires `pnpm.cmd test:browser` for Settings wiring. Because
these actions touch profile selection and configuration-stop/removal callers,
the draft host gate is `pnpm.cmd test:tts:bilingual-portfolio-exact-host`.
The validator must inspect the existing harness and explicitly map its coverage
to selection/reset/cleanup invariants before freezing the order; direct action
tests still own sequencing assertions. Add `pnpm.cmd test:native-startup` when
native invocation/client lifecycle or packaged WebView2 behavior is affected,
unless the selected host gate demonstrably covers that same acceptance route.
Record any justified coverage substitution; never silently omit a triggered gate.

### MOD-B baseline and post-change, only for CHANGE

```powershell
pnpm.cmd format:check:rust
pnpm.cmd lint:rust
pnpm.cmd test:rust
```

The repository Rust scripts cover normal and `release-locked-runtime` variants.
Before the native order, inspect its exact diff surface and the package harness
to select all applicable additional commands:

- `pnpm.cmd test:native-startup` for native startup/command integration.
- `pnpm.cmd package:windows:check` and `pnpm.cmd package:windows` to validate
  prerequisites and build a fresh artifact when packaged native behavior changes.
- `pnpm.cmd package:windows:lifecycle` for installation/repair/removal changes.
- `pnpm.cmd package:windows:ordinary-chatterbox:preflight` followed by
  `pnpm.cmd package:windows:ordinary-chatterbox` for acquisition, installed-runtime
  verification, repair, activation, or ordinary release-path changes.

Preflight is not a journey pass. Inspect prerequisites and installed-state effects
before running a harness; use authorized test resources and preserve unrelated
user installations/models. Missing hardware, payloads, consent, or host evidence
must be recorded as blocked, never replaced with an assumed pass. Any rebuilt
artifact has a new identity and does not inherit old release receipts. Do not
manually alter frozen manifests, historical evidence, or model payloads.

### Package and final acceptance

- `pnpm.cmd check:portable` after the desktop package unit.
- `pnpm.cmd check` before final campaign acceptance.
- `git diff --check` plus full scope/test-integrity review.

The final aggregate may reuse an already recorded gate only for the exact same
validated identities and scope; repeat when source changes or new concerns
invalidate it. No new benchmark or model evaluation is planned. If work changes
timing, resource ownership, or processing complexity, stop and reassess scope
and the corresponding existing exact-host/performance gates. Existing EPUB
malformed-input and locator tests remain intact; parser code is outside scope.

## Risks and rollback

- Extracted callbacks can capture an obsolete coordinator or change React effect
  dependencies. Preserve live callback binding and component cleanup semantics.
- A shared helper can accidentally short-circuit resets, mask rejections, or
  change the packaged Chatterbox precondition. Test these observable sequences.
- Native movement can widen visibility, change lock/drop timing, weaken path
  checks, or invalidate release assumptions. Freeze those invariants before edits.
- Large mechanical movement can exceed the proposed ceiling without a benefit.
  Stop and split/re-audit instead of expanding the unit during implementation.
- Preserve all pre-existing work. Roll back only verified worker-owned changes;
  never use a broad reset/clean/restore or remove user package data. A committed
  rollback needs a separate authorized Git action. Retain failure evidence and
  rerun affected gates before proceeding.

## Progress log

- 2026-10-06: Read-only modularity assessment recommended the App settings-action
  extraction, retained the narration coordinator, and identified native optional
  packaging as a conditional candidate. No tests or source edits were performed.
- 2026-10-06: Created this ExecPlan and linked it from the documentation and active
  plan indexes. Source implementation and all baseline/post-change gates remain
  not started. Documentation-only checks ran in local PowerShell outside the
  managed sandbox: `git diff --check` passed; read-only PowerShell checks found
  all 12 required sections, no trailing whitespace in the new plan, the referenced
  authority files, and both index links (exit 0).

## Discoveries and decisions

- Use one maintenance ExecPlan rather than adding a product roadmap or reopening
  completed milestones. Execute `MOD-A` before deciding the bounded `MOD-B` change.
- Size is a review signal, not a defect. Preserve the coordinator's coupled
  lifecycle and intentionally frozen normalization sources.
- The initial review IDs identify conversational audit decisions, not immutable
  validation Reports. Fresh evidence and orders are mandatory before source work.
- The factory's fallback UI notification must preserve reset timing even if a
  later availability refresh rejects. Preserve all three reset outcomes rather
  than collapsing them into an early-return success/failure abstraction.
- No architecture diagram change is expected; verify that expectation at closeout.

## Final validation results

Implementation: **not started**. No production behavior has changed.

| Evidence | Current result |
| --- | --- |
| Planning documentation review | PASS: local PowerShell outside sandbox; `git diff --check`, 12 required sections, new-plan whitespace, referenced authorities, and both index links; exit 0 |
| MOD-A baseline/post-change | Not run |
| MOD-B audit/baseline/post-change | Not started / not run |
| Browser/native/package/exact-host gates | Not run |
| Independent final refactor validation | Not run |

Documentation checks do not establish implementation, regression, or packaged
runtime acceptance. Replace pending execution entries only with actual reports.
