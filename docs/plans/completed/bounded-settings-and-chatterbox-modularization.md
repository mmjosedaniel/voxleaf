# Bounded settings and Chatterbox modularization

## Goal

Improve internal responsibility ownership and testability without changing
VoxLeaf behavior. Execute two sequential, independently accepted units:

1. Extract the narration configuration actions currently embedded in `App.tsx`.
2. Audit the native optional-Chatterbox module and implement at most one small
   extraction if concrete evidence justifies it; otherwise record `SKIP`.

This is a maintenance plan, not a new product-roadmap milestone. The follow-up
request on 2026-10-06 authorizes sequential implementation and validation under
the bounded refactor workflow. It explicitly prohibits commits, pushes, and
pull requests. The plan does not itself constitute an immutable Approved Work
Order or authorize a model download or installed-package mutation.

## User-visible outcome

There is no intended visible change. Profile/language selection, reset,
Chatterbox activation/removal, error propagation, cancellation, and availability
refresh retain their existing behavior. The development benefit is that settings
actions can be understood and tested without mounting the complete reader.

Updated user acceptance scope (2026-10-06): validate the two lighter models,
Piper and Chatterbox, in Spanish and English. The user explicitly excludes
Qwen3 from this task for future implementation work. This is a task-local test
scope decision; no product/profile/contract or frozen authority is changed.
At the user's subsequent request, the durable delivery priority is recorded in
[ADR-0051](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md)
and the roadmap. Existing Qwen development-only code and evidence are preserved.

## Current state

Planning snapshot: HEAD `0265d25b8af22c9037631ef1c7006963da66ee85`, branch
`codex/add-compact-system-diagram`; the worktree and index were clean before
these documentation edits. This snapshot is provenance, not a future baseline.
Reinspect the actual checkout and source before implementation.

Execution starts at HEAD `c140d0f2971cd6498fff2728dfa009acd01126f1` on the
existing `codex/modularize-settings-and-chatterbox` branch, with a clean worktree
and empty index. Keep this checkout and Git history unchanged. Accepted source
patches will remain unstaged; no Git steward or Git mutation is needed for this
user-authorized execution scope.

The read-only modularity review found established boundaries between EPUB,
shared contracts, the Python TTS engine/service, native supervision, and desktop
playback. It did not establish a general architecture defect or a runtime bug.
Two independent TypeScript audit decisions from that review are retained here:

| Review target | Decision | Evidence and disposition |
| --- | --- | --- |
| `App.tsx` configuration actions, review ID `MOD-01` | `CHANGE` recommendation | `handleHardwareProfileSelection`, `handleChatterboxRemoval`, `handleNarrationLanguageSelection`, and `handleNarrationSettingsReset` repeat configuration-stop selection and orchestrate several collaborators inside the React shell. `App.test.tsx`'s reset-order test requires publication/open-flow/reader/dialog setup. Unit `MOD-A` addresses this concrete ownership and testing issue. |
| `ProductNarrationCoordinator`, review ID `MOD-02` | `SKIP` | Scheduling, PCM playback, estimation, transport, and recovery authority are already delegated. Identity, navigation, cancellation, and containment need coordinated ordering and have an injectable deterministic harness. File length alone does not justify splitting that lifecycle. |
| `tts_optional_chatterbox.rs` | SKIP after MOD-A acceptance | MOD-B-AUDIT-01 found existing testable stage boundaries and intentional installed-state locking. Extraction would widen private sharing without an established maintenance/testing benefit. No native edit. |

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

Current re-audited ceiling: four files and at most 575 added/deleted lines,
covering the current 568-line patch only. Before implementation, the original
approximately 350-line estimate became 550 to accommodate removal, extraction
and meaningful deferred/rejection coverage. Exact repository formatting later
expanded the 540-line candidate to 568. The writer stopped; a second audit and
replacement work order accepted only that mechanical size revision before new
validation. The allowlist/behavior boundary is unchanged, no further source edit
is authorized, and both correction loops remain consumed.
Documentation/evidence updates are separate from this source allowlist.

Necessary acceptance repair, added after a measured host-test defect: a separate
closed allowlist covers `apps/desktop/scripts/native-startup-smoke.mjs`, new
`apps/desktop/scripts/adaptive-tts-profile-selection.mjs`, and existing
`apps/desktop/scripts/native-webdriver-client.node-test.mjs`. The repair freezes
the product patch, waits for effective alternate enablement, guards one click,
and shares the existing 90-second total deadline with activation. Its independent
focused baseline precedes writing; the repair ceiling is 325 changed lines
(actual 262). Full acceptance validates the union of seven paths. This necessary
harness synchronization fix does not broaden product behavior or start MOD-B.

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
   after any fulfilled removal, including a returned failed-state snapshot.
   The existing caller ignores that snapshot; only a rejected removal prevents
   refresh. Do not reinterpret fulfillment as an `absent` state requirement.
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

Complete. Fresh audit [MOD-A-AUDIT-01](../evidence/bounded-settings-and-chatterbox/MOD-A-audit-01.md)
and [MOD-A-BASELINE-01-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-baseline-01.md)
PASS are accepted. [MOD-A-WORK-01](../evidence/bounded-settings-and-chatterbox/MOD-A-work-order-01.md)
freezes the allowlist, invariants, ceiling and acceptance commands before editing.

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

Implemented and **accepted for Piper/Chatterbox scope** in
[MOD-A-SCOPED-FINAL-01-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-scoped-final-01.md).
Earlier passes and failures remain in the immutable reports. A matching temporary
driver resolved WebView session creation. Subsequent
[instrumented diagnosis](../evidence/bounded-settings-and-chatterbox/MOD-A-diagnostic-host-01.md)
identified a harness click on an effectively disabled alternate-profile radio.
The independently baselined and validated
[bounded harness repair](../evidence/bounded-settings-and-chatterbox/MOD-A-harness-repair-post-01.md)
waits for effective enablement and guards one click within the original total
deadline. The repaired run passed all four Piper/Chatterbox arms but failed Qwen/es.
The user then explicitly excluded Qwen3; [amended acceptance scope](../evidence/bounded-settings-and-chatterbox/MOD-A-acceptance-scope-02.md)
retains the four actual passes and the separate failed six-arm result. All
non-model gates and the final independent seven-path identity recheck now pass.

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

Complete, SKIP accepted in [MOD-B-AUDIT-01](../evidence/bounded-settings-and-chatterbox/MOD-B-audit-01.md).
The reused auditor found separately tested admission and artifact stages, plus
intentional installed-state locking and receipt ownership. Extraction would
mainly relocate private code and widen sharing. The closed implementation
allowlist is empty; no native source/test edit or new unit test run was needed.

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

Complete. [MOD-FINAL-01-20261006](../evidence/bounded-settings-and-chatterbox/MOD-final-01.md)
independently accepts the campaign: unchanged accepted identities, MOD-B SKIP,
scope/test integrity, truthful Qwen deferral, documentation links and verified
temporary-resource cleanup. Required aggregate checks and four model journeys
pass. This plan is archived in completed; all changes remain unstaged.

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
The later explicit user decision narrows model acceptance to Piper/es, Piper/en,
Chatterbox/es and Chatterbox/en. The latest uninstrumented full-run report already
contains PASS for all four on the current source identities. Its later Qwen
failure remains recorded as a failed six-arm command, outside this task's revised
model scope. Reuse those actual arm results without claiming six-arm success.
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

- 2026-10-06: Final independent [MOD-FINAL-01-20261006](../evidence/bounded-settings-and-chatterbox/MOD-final-01.md)
  PASS accepts MOD-A and MOD-B SKIP, verifies all seven source identities and
  empty index, checks 300 local links and confirms temporary observer, driver and
  exact firewall rule absent. [Cleanup](../evidence/bounded-settings-and-chatterbox/MOD-host-cleanup-02.md)
  preserved global tooling and unrelated rules. Director archives this completed
  plan and updates indexes. Qwen remains deferred under ADR-0051; no remaining
  blocker in the explicitly amended scope. No staging, commit, push or PR.

- 2026-10-06: Accepted [MOD-B-AUDIT-01](../evidence/bounded-settings-and-chatterbox/MOD-B-audit-01.md)
  SKIP after MOD-A acceptance. Named/tested native stages and intentional locking
  already provide cohesive boundaries; no concrete extraction benefit was found.
  Closed allowlist is empty, native source/tests unchanged. Final campaign
  review follows with the same independent validator.

- 2026-10-06: Accepted [MOD-A-SCOPED-FINAL-01-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-scoped-final-01.md)
  PASS for the explicitly amended Piper/Chatterbox scope. All required non-model
  checks pass on unchanged seven-path identities, including desktop 581 Vitest
  and 37 Node, browser 7, portable and complete checks with both Rust variants.
  Four actual model journeys and native lifecycle passed; excluded Qwen remains
  separate failed/unrun evidence. Director starts MOD-B audit with the same
  auditor only after accepting this report. No Git mutation occurred.

- 2026-10-06: The user explicitly requested durable documentation of the Qwen3
  deferral. Added ADR-0051 and linked it from the roadmap and documentation/ADR
  indexes: prioritize Piper/Chatterbox in both languages, defer Qwen production
  completion and open runtime diagnosis without assigning a date, retain existing
  development-only code/tests/history. No product, authority or diagram edit.

- 2026-10-06 explicit scope update: the user excludes Qwen3 and specifies that
  the two lighter models must work. [MOD-A-ACCEPTANCE-SCOPE-02](../evidence/bounded-settings-and-chatterbox/MOD-A-acceptance-scope-02.md)
  freezes Piper and Chatterbox in both languages as the four required arms.
  They already passed uninstrumented on the unchanged seven-path patch. The
  six-arm command's Qwen failure remains immutable; no pass is fabricated.
  Qwen seek diagnosis stops before any observer authoring or rerun. Remaining
  non-model checks continue, followed by scoped independent acceptance and MOD-B.

- 2026-10-06: [MOD-A-HARNESS-REPAIR-01-POST-01-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-harness-repair-post-01.md)
  passes independent repair review, 17 driver tests, format and lint. The full
  uninstrumented portfolio now passes Piper/es, Piper/en, Chatterbox/es and
  Chatterbox/en, including the formerly lost alternate selection. It then fails
  Qwen/es next-segment seek; Qwen/en is not reached. Source identities and cleanup
  remain verified. The director continues narrow diagnosis of the new failure;
  no timeout/criteria relaxation or coordinator edit is authorized. Remaining
  aggregate checks will run while model execution is idle. MOD-B stays gated.

- 2026-10-06: [Repair baseline/order](../evidence/bounded-settings-and-chatterbox/MOD-A-harness-repair-work-order-01.md)
  records focused baseline PASS (12 driver tests, format, lint), clean repair
  paths and unchanged product identities before writing. The same sole worker
  returned [repair change 01](../evidence/bounded-settings-and-chatterbox/MOD-A-harness-repair-change-01.md):
  262 changed lines across three paths, five actual-DOM regressions, 17 focused
  tests and exact-path formatting passed outside sandbox. No red run was claimed.
  The independent validator now reviews the seven-path union and runs all required
  checks, including the full portfolio without the temporary observer.

- 2026-10-06: [MOD-A-DIAG-02-HOST-01-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-diagnostic-host-01.md)
  reproduced the failure and identified its actual mechanism: the alternate click
  runs while all profile radios inherit disabled=true from pending settings.
  After pending clears, the harness still waits for the never-dispatched change;
  727 alternate-active polls fail over the original 90 seconds. No later selection
  condition runs. Same auditor approved a necessary three-path harness repair
  draft, with effective-enabled synchronization, one click, unchanged assertions
  and shared original deadline. Product MOD-A identities remain frozen; baseline
  precedes repair writing. This explicit redesign is not a third WORK02 correction.

- 2026-10-06: Source-free diagnostic tooling passed independent review and seven
  Node tests in [MOD-A-DIAG-02-POST-02-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-diagnostic-validation-02.md).
  Its first review caught incorrect script recognition and conflated wait labels;
  only ignored temporary tooling was corrected. Actual harness templates now
  drive its tests. Director accepted a precise 375-line ceiling for the current
  366-line observer/test pair; no product/harness changes. Windows UAC restored
  the exact offline rule, accepted by the user and verified in ActiveStore.
  The full unchanged portfolio is now running with the observer for diagnosis;
  this cannot substitute for uninstrumented acceptance.

- 2026-10-06 resumed by explicit user direction to complete the task: the
  director resumes active diagnosis instead of treating the documented timeout
  as the final outcome. The same auditor identified a temporary Node preload
  that can observe the native driver's fixed profile/disabled/pending states
  without editing repository source, assertions or timeouts. The independent
  validator will review its baseline and bounded design before the sole worker
  creates the temporary observer; diagnostic output is not acceptance evidence.
  The repository-pinned downloader restored a temporary Microsoft-signed driver
  154.0.4258.62 with the same recorded hash. Product/harness source remains frozen;
  MOD-B still requires MOD-A acceptance. Prior failure reports stay immutable.

- 2026-10-06 cleanup confirmation: after the user reported removing the temporary
  firewall rule, a read-only ActiveStore query in local PowerShell outside the
  sandbox confirmed that exact name `VoxLeaf-MOD-A-Offline` is absent (exit 0).
  Temporary host setup is now cleaned up. This does not resolve or rerun the
  profile-selection failure; MOD-A remains BLOCKED and MOD-B NOT STARTED.

- 2026-10-06: Independent [MOD-A-CLOSEOUT-01-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-closeout-01.md)
  confirms unchanged POST05 source identities/HEAD, empty index, expected paths,
  accurate reports and removed temporary driver. Verdict remains BLOCKED;
  MOD-B remains NOT STARTED. Director's final host `git diff --check` passed.
  No commit, push, PR, native edit or fabricated SKIP occurred.

- 2026-10-06 cleanup: the director verified the resolved task-owned temporary
  driver directory stays directly under OS temp, matched its recorded driver
  SHA-256 and confirmed no using process, then removed only that directory in
  local PowerShell outside sandbox (exit 0). Global tooling was preserved. The
  user-created administrator firewall rule `VoxLeaf-MOD-A-Offline` remains;
  remove only that exact name from administrator PowerShell after this blocked
  run. Other rules with the shared display name must be preserved. A future
  model-backed attempt requires re-verifying offline protection and a compatible
  temporary driver; this cleanup does not invalidate the recorded test results.

- 2026-10-06: [MOD-A-HOST-DIAGNOSIS-01-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-host-diagnosis-01.md)
  records three possible condition timeouts after the same snapshot: alternate
  Chatterbox activation (90 seconds), Piper enabled (180 seconds), and Piper
  activation (90 seconds). Existing pending-selection/disabled-fieldset timing
  and an unobserved optional-package failure are hypotheses only. No durable
  failure snapshot identifies the cause. No retry or code change occurred.
  Director stops at this real acceptance blocker: retain the unaccepted patch,
  keep MOD-B not started, and require a separately scoped diagnostic before
  another host run. Do not claim either regression or pre-existing failure.

- 2026-10-06: [MOD-A-POST-CHANGE-05-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-post-change-05.md)
  returned FAIL after successful deterministic/offline preflight, native build
  and native startup/lifecycle. Piper Spanish, the first model arm, reported
  compatible/selectable profiles and then timed out at adaptive exact-host
  profile selection. No model arm completed. Source identities, HEAD, empty
  index, installed manifest and post-run process cleanup were verified. No
  retry, assertion change or third source correction was made. The independent
  validator is diagnosing the exact condition read-only; MOD-B remains gated.

- 2026-10-06: Scoped driver setup succeeded with EdgeDriver 154.0.4258.62,
  matching WebView2 exactly, Valid Microsoft Corporation Authenticode, SHA-256
  `0f4600639201ccd2e84c72c3977ac33c67e19152e197c89eb16a6591d1fbe9f7`.
  Global tooling remains unchanged. Fresh report MOD-A-POST-CHANGE-05-20261006
  reruns the unchanged portfolio command with only a process-local driver
  override. Native startup now passes; the first model arm is Piper Spanish.
  Full model-backed acceptance is still pending, not implied by native startup.

- 2026-10-06 resumed validation: [MOD-A-POST-CHANGE-04-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-post-change-04.md)
  executed the required portfolio in host PowerShell. Deterministic/offline
  preflight and native build passed, but WebView session creation failed before
  any model arm. Read-only diagnosis found WebView2 154 versus EdgeDriver 150.
  Director issued [MOD-A-HOST-SETUP-01](../evidence/bounded-settings-and-chatterbox/MOD-A-host-setup-01.md)
  for the repository-documented pinned downloader, temporary compatible driver,
  Microsoft signature verification and process-local selection. No source edit,
  global driver replacement or changed gate is authorized.

- 2026-10-06 resumed execution: user confirmed creating the temporary
  `VoxLeaf-MOD-A-Offline` rule from administrator PowerShell. The same independent
  validator verified enabled Outbound Block/Profile Any, exact installed
  interpreter, required display name, healthy ActiveStore status and enabled
  firewall profiles. Source identities and HEAD exactly match POST-CHANGE-03;
  index is empty, installed manifest unchanged, no active installed interpreter
  or conflicting VoxLeaf/driver processes. Full portfolio starts under a new
  immutable report; previously passing commands are reused only for these exact
  unchanged identities as permitted by the plan. No source/Git/rule edits by agents.

- 2026-10-06 execution: verified clean source/index and current execution HEAD;
  read the plan, repository instructions, both refactor skills and contracts,
  relevant product/architecture/ADR/test authority. Spawned the configured
  Sol `clean_code_auditor` and Astra `refactor_validator` with fresh contexts;
  the director retains sole documentation ownership and no source writing.
  MOD-A audit supports CHANGE; baseline and immutable reports are pending.
  Re-audited the source/test ceiling to 550 lines before implementation.
- 2026-10-06: Accepted [MOD-A-AUDIT-01](../evidence/bounded-settings-and-chatterbox/MOD-A-audit-01.md)
  and sent [MOD-A draft terms](../evidence/bounded-settings-and-chatterbox/MOD-A-draft-01.md)
  to the independent validator. Portfolio includes the same model-free native
  startup route, explicitly subsuming a separate native-startup command. Direct
  action tests still own reset/removal sequencing. Targeted read-only host
  inspection found the corrected installed Chatterbox manifest, no legacy root,
  no staging, and no targeted repair cache/bytecode. Ordinary test inference/cache
  use is permitted; no installer, model download or payload repair is authorized.
- 2026-10-06: [MOD-A baseline](../evidence/bounded-settings-and-chatterbox/MOD-A-baseline-01.md)
  passed all five planned commands in local PowerShell outside sandbox: shared/
  EPUB builds, desktop types, 53 Vitest files/542 tests plus 32 Node tests,
  TypeScript format and lint. Identity recheck and empty-index check passed.
  Accepted the immutable report and froze [MOD-A-WORK-01](../evidence/bounded-settings-and-chatterbox/MOD-A-work-order-01.md)
  before starting the sole implementation agent.
- 2026-10-06: Worker returned [MOD-A-CHANGE-01](../evidence/bounded-settings-and-chatterbox/MOD-A-change-01.md):
  three source/test paths, 540 added/deleted lines; existing App integration test
  unchanged. Director reviewed App binding and action sequencing before testing.
  [Host inspection](../evidence/bounded-settings-and-chatterbox/MOD-A-host-prerequisites-01.md)
  found no outbound block for the actual installed Chatterbox interpreter, while
  the portfolio harness checks the developer interpreter. Portfolio acceptance is
  blocked; no firewall mutation or model-backed execution occurred. MOD-B cannot
  start before MOD-A acceptance.
- 2026-10-06: [MOD-A-POST-CHANGE-01-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-post-change-01.md)
  passed package build but failed desktop types on a new test mock's
  Promise<void>/Promise<undefined> mismatch. Static invariant/scope review passed.
  Issued [correction loop 1](../evidence/bounded-settings-and-chatterbox/MOD-A-correction-01.md);
  the same worker returned [MOD-A-CHANGE-02](../evidence/bounded-settings-and-chatterbox/MOD-A-change-02.md)
  with only the deferred type and resolve argument corrected, no assertion or
  production changes. Independent validation restarts with fresh identities.
- 2026-10-06: [MOD-A-POST-CHANGE-02-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-post-change-02.md)
  passed build/types, 54 files/581 Vitest tests, 32 Node tests, lint and diff check;
  Prettier flagged only the two new files. [Correction loop 2](../evidence/bounded-settings-and-chatterbox/MOD-A-correction-02.md)
  applied exact-path Prettier outside sandbox, exit 0. [MOD-A-CHANGE-03](../evidence/bounded-settings-and-chatterbox/MOD-A-change-03.md)
  reports 568 cumulative changed lines after formatting, exceeding the 550 ceiling;
  writer stopped and the same auditor is re-auditing this bounded size deviation.
  No further correction loop or new unit is authorized.
- 2026-10-06: [Host addendum](../evidence/bounded-settings-and-chatterbox/MOD-A-host-prerequisites-02.md)
  confirms the actual remaining offline setup requires Windows administrator
  privileges absent from the current PowerShell token. A unique temporary block
  would be appropriate test setup; no UAC/rule mutation was attempted and no
  automatic approval rejection is claimed.
- 2026-10-06: Same auditor returned [MOD-A-AUDIT-02](../evidence/bounded-settings-and-chatterbox/MOD-A-audit-02.md),
  confirming 568 lines of the same bounded functionality and meaningful tests.
  Director accepted a precise 575-line ceiling and froze [MOD-A-WORK-02](../evidence/bounded-settings-and-chatterbox/MOD-A-work-order-02.md)
  for the existing formatted patch only. No more source edits or correction
  loops; original pre-change baseline retained, fresh post-change report required.
- 2026-10-06: [MOD-A-POST-CHANGE-03-20261006](../evidence/bounded-settings-and-chatterbox/MOD-A-post-change-03.md)
  passes every runnable command, including 7 browser cases, check:portable and
  full check (shared 209, EPUB 653, desktop 581, Node 32, Python 386, Rust 79 normal
  plus 80 release-locked-runtime tests). HEAD/path recheck and empty index pass.
  Independent verdict remains BLOCKED solely for missing portfolio host evidence.
  No source correction is identified. MOD-B remains gated; no SKIP is fabricated.
  Director verified unchanged component/process/persistence boundaries against
  the canonical diagram; no diagram edit is needed. Documentation indexes now
  reflect the implementation and unresolved gate. No commit, push or PR occurred.

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
- Reviewed the current extraction against the canonical system diagram: existing
  Settings, compatibility, preference and narration owners remain the same, with
  no new package/process/trust/persistence edge. No diagram edit is needed.
- The initial host failure required separate diagnosis: disabled-fieldset click
  synchronization was repaired with a fresh baseline and independent validation.
  Assertions and the total deadline remain unchanged; historical failures remain
  immutable. All four Piper/Chatterbox arms then passed on the accepted patch.
- Explicit maintainer direction defers Qwen3 under ADR-0051. Its failed Spanish
  post-seek arm and unrun English arm remain outside this task's accepted scope;
  no root-cause or repair claim is made. Existing development code/tests remain.
- MOD-B is SKIP: source length does not justify splitting the existing private
  admission/acquisition functions or coupled installed-state critical section.

## Final validation results

Implementation: **Complete: MOD-A accepted; MOD-B audited and SKIP accepted.**
Final independent campaign verdict is PASS. No product behavior change is
intended; deterministic/browser checks and independent source review pass.
Native lifecycle and all four required Piper/Chatterbox model journeys pass.

| Evidence | Current result |
| --- | --- |
| Planning documentation review | PASS: local PowerShell outside sandbox; `git diff --check`, 12 required sections, new-plan whitespace, referenced authorities, and both index links; exit 0 |
| MOD-A baseline | PASS: MOD-A-BASELINE-01-20261006, five planned commands before edits |
| MOD-A source and focused post-change checks | PASS for current seven-path identities in MOD-A-SCOPED-FINAL-01-20261006; 39 direct action tests, five DOM harness regressions, existing App integration test unchanged |
| Browser | PASS: pnpm.cmd test:browser, 7/7 |
| Portable and full repository aggregates | PASS: pnpm.cmd check:portable and pnpm.cmd check, exit 0; TypeScript/Python and both Rust variants plus native build |
| Required scoped exact-host evidence | PASS: Piper/es, Piper/en, Chatterbox/es and Chatterbox/en, stable minute, zero underruns/external requests/audio files; scope explicitly amended by user |
| Original six-arm command | Exit 1 overall: four required arms PASS, excluded Qwen/es seek FAIL, Qwen/en not reached; never relabeled a command pass |
| Standalone native-startup | NOT RUN separately; the same lifecycle route PASSED in the uninstrumented portfolio |
| MOD-A acceptance | PASS: MOD-A-SCOPED-FINAL-01-20261006 |
| MOD-B audit/baseline/post-change | SKIP: MOD-B-AUDIT-01; empty implementation allowlist, baseline/post-change not applicable |
| Final campaign acceptance | PASS: MOD-FINAL-01-20261006; scope/documentation/cleanup checked independently |
| Git | HEAD unchanged; index empty; no commit, push or PR |

Exact commands, before/after source identities, initial corrected typing/format
failures and nonfatal build/cache warnings are recorded in immutable reports.
Chatterbox audible startup measured about 48-51 seconds on this host; successful
journeys do not imply a general performance guarantee. Qwen runtime investigation
is deferred, not resolved. Neither frozen authority nor historical evidence was
changed. No commit, push or PR is authorized or performed.
