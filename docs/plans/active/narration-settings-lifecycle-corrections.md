# Narration settings lifecycle corrections

Status: **PLANNED — IMPLEMENTATION AND BEHAVIORAL VALIDATION NOT STARTED**.
Date: 2026-11-02.
Planning base: `d1c3d18160de6c8483e52885b6cca0ea63b565c5` (`main`).
Plan branch: `codex/narration-settings-lifecycle-corrections-plan`.

Current authorization covers this ExecPlan, its active-index entry, the local
branch and their documentation commit. It does not authorize executing the plan,
changing production/tests, running its behavioral gates, pushing or opening a PR.
Execution requires a subsequent instruction. Its implementation commits and
publication remain separate actions; this plan's commit authorization is not
authorization to commit the later fixes.

## Goal

Resolve NSL-01–04 with the smallest changes to the existing desktop settings and
narration owners. Retain all four findings, reproduce each before production
edits, and validate the combined correction once at each necessary level.
These are follow-up defects spanning M008/M010.2/M011 responsibilities, not a new
roadmap milestone or a behavior-preserving refactor campaign.

## User-visible outcome

- Rejected Chatterbox activation has fixed, actionable feedback. Known selection
  restrictions prevent an impossible activation before unnecessary teardown.
- An activation initiated without a narrator cannot later change the profile of
  a newly created narrator for the same publication. It fails safely and permits
  an explicit retry against the current owner.
- Quick/Prepared changes during Stop either wait for verified cleanup or remain
  unavailable until it completes. No preference is saved and then rejected by
  an incompatible retained scheduler.
- Closing and reopening Settings does not release an outstanding settings
  operation. An older reset cannot overwrite a later accepted startup/rate choice.
- Ordinary Stop still permits playback-speed selection under PSC-04. Settings
  remains closable, reading remains usable, and no correction starts playback
  automatically or adds a profile-selection Cancel contract.

## Current state

The planning worktree/index were clean. All findings below are **static source
evidence**, not executed reproductions or measured failure frequencies. Earlier
SPM corrections are present; do not reopen their already resolved cases as new
findings. The stable NSL identifiers map to the four retained defects as follows.

| ID / priority | Trigger, source evidence and consequence | Correction criterion |
| --- | --- | --- |
| NSL-01 / P2 | `OptionalChatterboxControls.tsx:242` discards `onActivate(): Promise<boolean>`. `narration-settings-actions.ts:58` stops before `hardware.selectProfile`; the latter can return false for unavailable storage, future preference state or changed admission. The separate Activate button does not consume persistence eligibility. Playback can stop without activation-specific rejection feedback. Future-version state already has a general warning; do not describe that case as wholly unexplained. | Handle false/rejection locally, retain native lifecycle failure presentation, clear obsolete feedback on retry, and prevent already-known impossible activation before stopping. A false result does not by itself identify a storage failure. |
| NSL-02 / P2 | `App.tsx:245` can expose a ready publication/Settings before a narrator exists. Profile selection captures that absent owner and awaits packaged `optional.select()`. Its guard at `App.tsx:655` checks operation/publication but not narrator identity. A narrator can appear and start Piper before the native result returns; the old callback can then save Chatterbox without stopping/refreshing the new owner. | Bind the selection's validity to the captured narrator lifetime as well as publication/operation, including `undefined` becoming a concrete owner. Check before teardown/commit and retain guarded reversible persistence. No late callback may stop, refresh or reset another owner. |
| NSL-03 / P2 | `stop()` invalidates playback to `stopped` while retaining scheduler/player until asynchronous cleanup. `ReaderSettingsDialog.tsx:137` enables startup controls for that phase. `#changeStartPreference` at `product-narration-coordinator.ts:649` joins cleanup for `complete` only. During a Prepared-120000 Stop, selecting Quick saves first, then combines the new mode with the old 120000-ms target; `adaptive-preparation.ts:327` throws `invalid-ui-state`. | Join outstanding containment before persistence and recheck identity, recovery and eligibility afterward. Preserve failed cleanup owners and prior saved/visible selection. Do not relax the projection invariant to conceal the inconsistency. |
| NSL-04 / P2 | `HardwareCompatibilityControls.tsx:117` emits pending=false on unmount although the action continues. Closing Settings unmounts these controls; reopening enables new edits. `reset` at `narration-settings-actions.ts:118` writes defaults after waiting for Stop without checking a later preference action. Quick playback → Reset → close/reopen while cleanup waits → Prepared-60000 can save successfully, then the earlier reset overwrites it with Quick. Closing Settings and choosing 75% speed exposes the analogous later overwrite to 100%. | Keep pending ownership until the actual action settles; a retired callback must not release a newer action's pending state. Reject/disable conflicting edits or preserve any later accepted edit. Cover both startup mode and playback rate; retain ordinary Stop speed behavior. |

The NSL-04 startup reproduction deliberately uses Quick after playback has begun
and Prepared-60000, whose targets match, to expose stale overwriting independently
of NSL-03's projection error. NSL-03 uses Prepared-120000 → Quick to prove that
distinct mismatch. Neither scenario requires an artificially asynchronous
localStorage implementation: defer the real native cleanup boundary in the test.

## Scope and non-goals

One cohesive implementation unit and one integration batch: desktop settings
feedback, operation lifetime and narrator preference mutation. Severity is P2;
validation risk is high because persistence, cancellation and profile ownership
are affected. Do not accept individual fixes before the combined required gates.

Expected production allowlist; modify only files actually needed:

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/settings/ReaderSettingsDialog.tsx`
- `apps/desktop/src/settings/narration-settings-actions.ts`
- `apps/desktop/src/tts/OptionalChatterboxControls.tsx`
- `apps/desktop/src/tts/HardwareCompatibilityControls.tsx`
- `apps/desktop/src/tts/product-narration-coordinator.ts`
- `apps/desktop/src/tts/ProductNarrationControls.tsx`, only if the chosen reset
  coordination needs to disable or explain a conflicting speed selection.

Reuse their existing tests, `hardware-profile-compatibility.test.ts`, and
`apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`. Prefer existing
synthetic IPC/storage and cleanup barriers. New test-only seams may be placed in
these fixtures; do not introduce production delay flags or a new test framework.
If another production owner is necessary, document the concrete reason and revise
this allowlist/gates before editing it.

Keep existing boolean results and private component callback conventions. No new
shared result hierarchy, global transaction framework, persistence migration,
production dependency or broad cleanup/refactor. Do not change EPUB preparation,
normalization, locators, scheduler targets, DSP/rates, runtime profiles, native
admission, optional-package lifecycle, Python builders, installer behavior,
protocol/schema files, locks, generated sources or frozen authorities. Do not
weaken assertions or reinterpret a failed gate as a passing subset.

## Relevant files and documentation

Read [the documentation index](../../README.md), [MVP requirements](../../product/mvp.md),
[overview](../../architecture/overview.md), [system diagram](../../architecture/system-diagram.md),
[ADR-0065](../../architecture/decisions/ADR-0065-validated-runtime-and-narration-boundaries.md)
and [settings authority](../../architecture/reader-settings-playback-authority-v1.md).
Read the applicable bug skill when implementation is authorized.

Inspect these supporting owners without planning to change them:
`hardware-profile-compatibility.ts`, `optional-chatterbox-client.ts`,
`hardware-compatibility-check-binding.ts`, `process-client.ts`, `pcm-playback.ts`,
`adaptive-buffer-scheduler.ts`, `adaptive-preparation.ts`, the profile, language,
startup and playback preference repositories, and native
`select_optional_chatterbox`/removal commands.
They establish guarded writes, admission, teardown, target consistency and native
error conversion; they are not permission to broaden the patch.

Prior implementation/evidence:

- [SPM completed plan](../completed/settings-packaging-minimal-corrections.md),
  [execution ledger](../evidence/settings-packaging-minimal-corrections/execution-ledger.md),
  [SPM-R2](../evidence/settings-packaging-minimal-corrections/review-R2.md) and
  [SPM-R3 archival review](../evidence/settings-packaging-minimal-corrections/review-R3.md).
- [PSC ledger](../evidence/minimal-playback-state-corrections/execution-ledger.md):
  preserve PSC-04's speed change during ordinary Stop and its evidence limitations.
- [Testing](../../development/testing.md), [evidence retention](../../development/evidence-retention.md),
  [independent change review](../../development/agentic-change-review.md),
  [Git workflow](../../development/git-workflow.md) and the
  [input/environment reuse rules](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md#revalidate-changed-evidence-not-everything-by-default).
  Use the latter's proof discipline, not the refactor worker/validator workflow.

At implementation closeout, document corrected behavior and coverage briefly in
`docs/product/mvp.md` and `docs/development/testing.md` as applicable, and retain a
concise evidence/review summary. Reinspect the system diagram; leave it unchanged
if the existing component/process/persistence topology still applies. M005 remains
preparation-only and is outside this correction. Preserve completed plans and
historical evidence bytes. Move this plan and update maintained indexes only after
all acceptance criteria pass.

## Architecture and constraints

Prefer the following bounded design, adjusting only when reproduction proves it
insufficient:

1. Extend App's existing selection validity check with narrator identity. Reject
   an obsolete absent-owner request; do not redirect it to the latest narrator.
   Keep replacement/unmount invalidation, reversible profile writes, pending
   removal ownership and the healthy-loaded Chatterbox no-op intact.
2. Keep settings-operation lifetime in an existing surviving owner rather than
   the mounted controls. Use an operation identity/count only as needed; release
   exactly once after settlement. Closing a dialog must not cancel or complete
   an operation. Prefer preventing conflicting reset edits while pending over
   adding rollback across preference keys. If an edit is accepted, an older reset
   must not overwrite it. Coordinate the compact speed control too.
3. Make startup mutation await outstanding Stop/cleanup before any write, then
   re-evaluate the current owner and recovery state. Keep valid contained recovery
   reset working. Do not reject the reset's own nested mutation by blindly testing
   `configurationChanges > 0`; that count already supports nested ownership.
4. Add bounded activation failure feedback in the existing optional controls and
   feed known eligibility through existing props. Preserve future-version warnings
   and native failed snapshots. Do not impose fresh-start memory checks on healthy
   loaded-profile reselection or weaken native admission.

No automatic Play, implicit failover, book-content logging or audio persistence.
Queues, retained PCM, cancellation deadlines and stable reader/heard locations
remain unchanged. Do not introduce a fixed startup wait. Real native selection
errors are converted to failed snapshots by `OptionalChatterboxClient`; lack of
a UI catch is not evidence that every native error escapes. Partial reset remains
best effort with truthful feedback; an all-or-nothing transaction is not required.

## Milestones

### Milestone 1: Reproduce the four defects

Status: **NOT STARTED**.

Refresh HEAD/status and preserve unrelated edits. Inspect current tests/config,
recover the evidence below, and establish preparation identity before changing
production. Add only missing public-behavior assertions with `NSL-` names. Run
the directed red selection once against unchanged production and keep each failure
and positive control. A setup error, zero matching tests or private-helper mock
does not reproduce a defect. If a finding cannot be reproduced, retain it as
unresolved with concrete counterevidence; do not silently drop it or implement
a speculative correction. No separate full-repository baseline is required.

### Milestone 2: Apply the minimum coordinated correction

Status: **NOT STARTED**.

Address cleanup-before-write and reset-operation lifetime, then narrator validity
and activation feedback. Reuse existing owners/helpers. Run the focused combined
desktop gate and relevant static checks before costly preparation. Keep actual
results in the progress log. Do not rewrite the native client or scheduler to
compensate for a renderer ownership defect.

### Milestone 3: Validate the final combined patch

Status: **NOT STARTED**.

Freeze the runtime/test patch, run the selected Chromium journeys, prepare or
verify unchanged assets, build once and run one current Piper EN WebView2 arm.
The normal build hooks remain intact; do not run a redundant standalone Vite
build or a wrapper that rebuilds before the native arm. Record cleanup before
requesting final review. A later renderer change invalidates build/native evidence;
renew only affected gates and preserve the superseded attempts.

### Milestone 4: Independent acceptance and documentation

Status: **NOT STARTED**.

Finish documentation and freeze the full patch. Delegate one independent review
to `change_reviewer` (GPT-6 Astra high), reusing that reviewer for corrections.
Supply exact base/HEAD, closed path identities, complete diff/new files and host
receipts. The reviewer does not edit or run tests. Require **APPROVE** for the exact
final patch; absent reviewer, missing evidence or unexplained identity drift is
**BLOCKED**. Keep each report immutable. New documentation after review requires a
new assessment, though unchanged code evidence can be retained with proof.
This review does not authorize implementation Git actions or publication.

## Testing and benchmark strategy

All commands below are **future execution**, from `<repo-root>` in normal local
PowerShell outside the managed sandbox. No behavioral gate has run for NSL.
Use **EJECUTAR**, **REUTILIZAR CON PRUEBA**, **NO APLICA** and **BLOQUEADO** explicitly.
During readiness, verify that the resolved package manager matches the repository's
`pnpm@11.15.1` pin. Planning encountered an automation PATH resolving 11.25.0;
offline Corepack dispatch selected the repository version successfully. Correct
command resolution without changing global installations or bypassing engines.

### Previous results inspected and reuse decisions

Planning retrieved the original SPM result JSONs, final desktop/browser/native
output, source/export manifests and reuse records under ignored
`tmp/evidence/settings-packaging-minimal-corrections/`. These are historical
PowerShell receipts based on `599b4cf4a446c006ae3262cfceac0f75e596a50d` plus its
recorded working patch, not results executed on the new plan branch. The receipt
HEAD alone does not identify that tested patch.

| Evidence | Observed historical result | Decision for NSL |
| --- | --- | --- |
| `G2-desktop-F1-formatted` | 6 suites, 355 passed; 4.125 s receipt interval, 3.34 s Vitest duration. Input manifest SHA-256 `c9ac861474ef07d63b0b93132b53bedf252bc660eb6fd1de4787c08755b18a9d`. | Reuse fixtures/controls, **EJECUTAR** affected tests. Changed owners/tests invalidate its behavioral PASS; it lacks all four new combinations. |
| `G5-browser-F1` | 6 passed: EFC-07, SPM-01/02, three MAF-11 targets and SAF-09. Receipt interval 16.882 s. Input SHA-256 `fb26338d442ed49569be4523151129b624d15d2d9666c09588bde7887e19b6ee`. | Reuse synthetic service, storage faults and deferred selection setup. **EJECUTAR** only the new journeys plus selected controls below; do not repeat all three completed-mode targets in Chromium. |
| `G6-build-F1` / `G7-Piper-F1` | Build exit 0, 29.535 s; native exit 0, 114.870 s. Binary SHA-256 `86aee8fcd5aa92db9a496efd8bbee8dd6bd6178821748bccf69fbe890a3db679`. Native recorded 240 ms cancellation, zero underruns/external requests/generated audio, five created/closed contexts and verified resource restoration. | Reuse runner, fixtures and eligible payload/driver assets. **EJECUTAR** one new build/arm after renderer changes. Old binary, timing and PASS do not accept NSL. No new performance/support claim or six-rate sweep. |
| SPM `G0-exports`, 251 export identities | Original input and export manifests remain available. | **REUTILIZAR CON PRUEBA** for pre-test shared/EPUB preparation only if source membership, build/config/lock/tool inputs and every output match. Otherwise run `pnpm.cmd build:packages` once. Browser's configured package-build hook still runs. |
| SPM `G6-core`, `core-artifact-reuse.json`, `core-source-membership.json`, `core-payload-current.json` | Core verification exit 0, 7.324 s. SPM proved reuse of 2,024 Piper payload files and 26 source inputs; source/member and payload drift were empty at that time. | **REUTILIZAR CON PRUEBA** for the unchanged package and, only with full consumed-input/environment identity, its verification receipt. If the receipt proof is incomplete, run the cheap `pnpm.cmd package:piper-core:check` once. Do not regenerate or download a healthy unchanged payload. |
| SPM `G3-packaging-final` and Python static checks | 136 tests passed; Python format/lint/types passed; retained by SPM-R2 with original hashes in `R2-retained-evidence.json`. | **NO APLICA** to the desktop-only NSL patch. Preserve this historical context; omission is not a claim of new Python acceptance. |
| SPM installed F1 inventories | 24,009 entries matched before/after the prior validation; Node 24.20.0, pnpm 11.15.1, PowerShell 7.6.5, uv 0.11.29 and Python 3.12.10 were recorded. | Candidates for environment/asset comparison, not an assertion that today's environment still matches. Renew readiness and consumed-input proof at execution. |
| PSC-04 and SPM-01/02, SAF-09, MAF-04/R8-05, MAF-10/11 existing tests | Prior coverage protects ordinary Stop speed, contained reset, cross-book invalidation, removal ownership and loaded reselection. | Reuse assertions/fixtures in the selected suites. Do not repeat historical campaigns; their PASS does not cover NSL's changed paths. |

No full present-day artifact/environment comparison was performed during planning.
Consequently **no previous gate is yet accepted as reused NSL evidence**. At
execution, retrieve the immutable original command/result/input hashes; compare
all consumed source/transitive imports, fixtures, config/locks, discovered file
membership, tool/dependency/browser inputs and artifact bytes. Explain every
excluded changed path. Treat Git revision as an input where stamping/discovery
uses it. Unknown identity requires the affected gate, not a rewritten receipt.
Prefer a short verification over a costly attempt to reconstruct incomplete proof.

### Minimum regression coverage

| Finding | Smallest meaningful new coverage; preserve positive controls |
| --- | --- |
| NSL-01 | Installed optional controls: false and thrown callback produce fixed feedback; success/retry clears it. Mounted Settings verifies known future/persistence restriction cannot cause teardown. Preserve native incompatible/download errors and healthy loaded reselection. |
| NSL-02 | Mounted App with a ready publication, initially absent narrator and deferred optional selection; attach/start Piper for the same publication before completion. Assert no stale preference write, stop, refresh, recovery reset or profile replacement. The production module captures `import.meta.env.DEV` at import: exercise packaged `DEV=false` deliberately, or the test misses the native await. Keep a valid current-owner success and SAF-09 replacement control. |
| NSL-03 | Real coordinator and preference repository with deferred native shutdown: Prepared-120000 → Stop → Quick, and one changed Prepared target. Assert no write before containment, no projection error, coherent saved/visible values after success, and prior values/owners after failed cleanup or close. Existing all-target natural-completion tests supply the settled controls. |
| NSL-04 | Mounted pending reset across close/reopen; verify lifetime remains pending and conflicting startup/speed edits cannot be accepted then overwritten. Include stale completion while a newer operation is pending. Preserve ordinary Stop speed selection and truthful partial reset. Use the actual synchronous storage repository with a deferred cleanup boundary. |

Prefer no more than three added Chromium journeys: pending Stop/mode coherence;
pending Reset across close/reopen including compact speed; and absent-to-created
narrator activation followed by rejection/retry feedback. Exercise combinatorial
write failures and targets in unit/integration tests. Do not force duplication
in native tests. Missing fixture support warrants a small test-only extension,
not a new production seam or test framework.

### Gates, order and invalidation

| Gate | Decision, timing and purpose | Inputs/invalidation |
| --- | --- | --- |
| G0 preparation | Inspect host readiness and reuse manifests before red tests. Reuse exports if proven; otherwise `pnpm.cmd build:packages`. | Shared/EPUB source membership, compiler/config/locks and export bytes. Preparation is not behavioral acceptance. |
| G1 directed red | **EJECUTAR**, command G2 plus `-t NSL-`, after adding regressions and before production edits. Keep the four intended failures; do not run a full old campaign. | Current unchanged production plus new tests, fixture/IPC semantics and installed test dependencies. |
| G2 desktop | **EJECUTAR** once on the combined final correction using the eight-suite command below. | Desktop callers/transitive dependencies, shared/EPUB exports, tests/fixtures/config/locks. Consumed source/test changes invalidate it. |
| G3 static | **EJECUTAR** `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, `pnpm.cmd --filter @voxleaf/desktop typecheck` before costly preparation. | Their actual repository globs/type graph, configs, dependencies and exports. Retain each leaf separately; no claimed aggregate PASS. |
| G4 Chromium | **EJECUTAR** one filtered command below on final source/tests. | Production renderer, synthetic IPC, browser fixtures/config, package exports and browser/dependency versions. Any consumed change invalidates it. |
| G5 package preparation | **REUTILIZAR CON PRUEBA** existing Piper payload/core receipt; fallback `pnpm.cmd package:piper-core:check` once. | Complete runtime/package source and membership, archive/evidence/manifest/tree, checker dependencies and environment. Changed or missing payload requires diagnosis; use configured `pnpm.cmd package:piper-core` only if regeneration is actually necessary. |
| G6 native build | **EJECUTAR** `pnpm.cmd build:desktop` once after final renderer changes. | Tauri/config/locks, frontend, exports, native source and verified resources. Keep the configured frontend build hook. Capture executable hash; an older executable cannot cover changed renderer bytes. |
| G7 WebView2 | **EJECUTAR** the direct Piper EN runner below once, without rebuilding. | G6 executable/resources, native runner, synthetic EPUB, verified Piper payload, WebView2/driver and host isolation. Requires startup/settings/Stop/cleanup invariants, no stale playback and verified restoration. |
| G8 documents/evidence | **EJECUTAR** `pnpm.cmd check:evidence` and `git diff --check`; review local links, scope and diagram consistency. | Final documentation/worktree/index. Required again only when their inputs change. |
| G9 review | **EJECUTAR** exact-final-patch independent `change_reviewer` assessment. | Final diff, unchanged supporting owners, full identities and original/fresh receipts. Missing evidence/reviewer or drift is **BLOQUEADO**. |

G2 command (repository root):

```powershell
pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/settings/narration-settings-actions.test.ts src/settings/ReaderSettingsDialog.test.tsx src/tts/product-narration-coordinator.test.ts src/tts/HardwareCompatibilityControls.test.tsx src/tts/OptionalChatterboxControls.test.tsx src/tts/ProductNarrationControls.test.tsx src/tts/hardware-profile-compatibility.test.ts
```

G4 command; retain the demonstrated Windows quoting through the pnpm `.cmd` shim.
`NSL-` is the planned new test prefix, not an existing passing test claim:

```powershell
pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep '"NSL-|SPM-01/02|MAF-11 completed Prepared 120000|SAF-09"'
```

G7 command against the G6 binary:

```powershell
node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en
```

The packaged Chatterbox selection race is tested through real renderer/action
ownership with controlled native completion, without loading a GPU model. The
native selector, admission and inference are unchanged, so a new Chatterbox GPU
matrix is **NO APLICA** for this bounded renderer correction. If implementation
changes those responsibilities or healthy-loaded continuation, revise the scope
and select the applicable exact Chatterbox gate before acceptance. Rust/Python
unit campaigns, full EPUB/shared tests, model acquisition, Qwen, installer/firewall
journeys, six-rate DSP and performance benchmarks are likewise **NO APLICA** while
their inputs/responsibilities remain unchanged. CI/protected-branch requirements
are not waived; do not run both aggregate checks merely to duplicate these leaves.

Retain a per-gate ledger under ignored
`tmp/evidence/narration-settings-lifecycle-corrections/<run-id>/`: unique receipt
IDs, exact command/cwd, UTC start/end/elapsed, exit, source/input/environment and
artifact identities, original reuse references, failures and cleanup. Keep only
concise content-safe summaries/review identities in Git. Never copy private host
inventories, book text, audio or personal paths into the plan/report.

## Risks and rollback

- Sharing pending state can accidentally block the reset's own nested calls or
  ordinary Stop speed changes. Test these existing capabilities explicitly; use
  bounded operation ownership rather than a permanent/global disabled flag.
- Guarding only the publication misses same-publication narrator creation;
  redirecting old work to the latest narrator can instead stop an unrelated run.
  Preserve captured identity at every existing asynchronous boundary.
- A stored preference followed by failed publication is not success. Verify both
  persisted and observable values, without allowing failed containment to discard
  owners or clear recovery prematurely.
- Plan one combined source/test batch before the expensive build/native arm.
  Source fixes invalidate consumed gates only. Preserve failures and classify
  product, pre-existing, environment and harness/cleanup failures separately.
  Permit one infrastructure retry with a concrete changed condition; repeated
  failure stops that stage for diagnosis/replanning, not repeated blind execution.
- Before native resource mutation, inspect the SPM restoration pattern and record
  the exact owned source/destination/recovery paths. Verify resolved containment,
  original tree identity and a usable recovery copy before moving/replacing
  anything. Use an isolated WebView profile. Restore complete original resources,
  compare identities, verify recovery siblings are resolved and check owned
  PID/creation-time/executable and scratch cleanup. Do not delete unrelated roots
  or terminate foreign processes. Unverified cleanup blocks acceptance.
- No personal installation, firewall or global environment mutation is needed.
  A blocked local prerequisite is reported; it does not authorize weakening a
  gate, changing native policy or borrowing another writable runtime.
- Rollback is limited to task-owned edits/artifacts with preserved originals.
  Do not reset/stash/revert unrelated work. Git reversal, later implementation
  commits, push, PR, merge and release need their applicable user authorization.

## Progress log

- 2026-11-02: Planned NSL-01–04 from static analysis on `d1c3d18`; no runtime
  reproduction claimed. Inspected repository commands, existing regression
  coverage and original SPM receipts/output/reuse manifests.
- 2026-11-02: Selected one desktop correction batch, directed red tests, one
  combined desktop pass, filtered Chromium and one final build/Piper EN arm.
  Runtime payload/export reuse is conditional on complete execution-time proof;
  unchanged Python/native-model campaigns are excluded by responsibility.
- 2026-11-02: Created the requested local plan branch and reviewed both documents.
  Verified all 21 local Markdown link targets. The first documentation checker
  attempt stopped at the pnpm engine guard; offline Corepack dispatch passed.
- Implementation, behavioral validation and independent behavioral review:
  **NOT STARTED**. No NSL gate is running or reusable as current acceptance.

## Discoveries and decisions

- `stopped` describes playback state before native cleanup necessarily finishes.
  It cannot alone authorize a startup-mode write against retained owners.
- The reset-overwrite and target-mismatch findings have different causes; retain
  both and use independent reproductions rather than counting one failure twice.
- App's existing reversible selection guard is the narrowest place to reject
  stale absent-owner activation. Pending optional removal already has separate
  application ownership; preserve it rather than replacing it with a new framework.
- The ordinary playback-rate change during Stop is intentionally supported;
  a reset-specific conflict must not regress that behavior.
- Historical receipts include failures and superseded builds. Use the final F1
  receipts for context; keep earlier failed attempts intact. The prior final
  timings are observations, not estimates or promised NSL execution times.
- The plan/index-only patch has no runtime or public-contract effect and is exempt
  from behavioral change review. Later implementation is not exempt.

## Final validation results

Planning-only state:

- Production/test changes: **NONE**.
- NSL reproductions and implementation gates G0–G9: **NOT RUN**. The
  documentation-only checks below do not execute the implementation plan.
- Historical results: inspected and attributed above; **not current NSL PASS**.
- Full current artifact/environment reuse proof: **NOT PERFORMED**.
- Independent behavioral approval: **NOT REQUESTED; implementation pending**.
- Documentation checker, outside the sandbox: initial `pnpm.cmd check:evidence`
  stopped before checking because 11.25.0 resolved instead of required 11.15.1.
  With process-local `COREPACK_ENABLE_NETWORK=0`, `corepack.cmd pnpm check:evidence`
  **PASS**, exit 0; no download or global installation change.
- Local Markdown link targets, outside the sandbox: **PASS**, all 21 exist
  across this plan and the active index.
- Exact staged scope/diff reviewed: only this plan and the active index.
  `git diff --cached --check`, outside the sandbox: **PASS**, exit 0.

Do not mark the four defects resolved or this ExecPlan complete until subsequent
authorized execution supplies all required matching evidence and exact-patch
independent approval.
