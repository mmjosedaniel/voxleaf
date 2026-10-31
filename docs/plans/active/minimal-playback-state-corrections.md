# Minimal playback state corrections

Date: 2026-10-31. Task ID: PSC-20261031.

Status: **Planning only; implementation and execution are not authorized yet.**
The current authorization covers this document, its active-index entry, a local
branch and a documentation commit. It does not cover fixes, test execution,
push, pull request, merge or release.

Planning base: `602157f3138a53a340ae4854f803e90209327f8a` on `main`.
Planning branch: `codex/minimal-playback-state-plan`.
The worktree and index were clean at the start of planning. Recheck the base,
scope and evidence when execution is authorized; this plan is not runtime proof.

## Goal

Correct the four retained findings from the static review with localized
coordinator/control changes. Preserve existing playback, navigation, recovery
and persistence authorities. Share one implementation batch and one final set
of affected gates instead of repeating validation for each finding.

## User-visible outcome

- **PSC-01:** Resume during paused navigation cannot touch the closed player
  being released or manufacture an audio failure. After cleanup and placement,
  the user can explicitly resume from the selected navigation target.
- **PSC-02:** Resume attempted while a new run is unavailable preserves paused
  intent. Once the availability check succeeds, another explicit Resume works;
  completion of the check alone never starts audio.
- **PSC-03:** After Pause, passive inspection of passage B, and Stop, primary
  Play starts at the current visible passage B rather than the older heard
  passage A. Ordinary Resume still continues its existing heard/selected target.
- **PSC-04:** Selecting an admitted speed while ordinary Stop is releasing its
  retired player updates and saves the preference. The next run uses it; the
  obsolete player is not asked to apply it. Storage errors remain observable.

## Current state

All four findings are supported by static control-flow evidence at the planning
base. None has been reproduced by executing tests in this task.

| ID / severity | Trigger and evidence | Existing coverage gap |
| --- | --- | --- |
| PSC-01 / P2 | `product-narration-coordinator.ts` retains `#player`/`#scheduler` during asynchronous `#performStopActiveRun`, after `player.close()`. `#beginNavigation` retains a paused snapshot with `canResume: true`. `resume()` can call that retired player; `pcm-playback.ts` correctly rejects it and the coordinator enters failure containment. | Existing `VCA-06` waits for `navigation.settling` to become false before Resume. It does not cover an early call while cleanup is pending. |
| PSC-02 / P2 | After paused navigation settles, no player/scheduler remains. `refreshSelectedProfile()` publishes `checking`. `resume()` changes paused intent to playing before `start()` checks admission. A rejected start leaves no owner and no paused branch for later Resume. The visibility binding in `hardware-compatibility-check-binding.ts` and `App.tsx` makes this reachable during a compatibility refresh. | No existing regression holds the availability promise pending between settled paused navigation and Resume, then retries after it resolves. |
| PSC-03 / P2 | `updateVisibleLocator()` records B while paused without replacing active A. `stop()` ends intent but does not align those locators. Primary Play in `ProductNarrationControls.tsx` calls `start()`, whose `#startRun()` prepares from the active locator. A duplicate B sample need not be emitted after Stop. | Passive-scroll tests use the separate `startAtVisibleLocator()` action. They do not drive Stop followed by primary Play with no new viewport sample. |
| PSC-04 / P3 | Ordinary `stop()` clears `#pausedNavigationState`, closes the player and awaits native/backend cleanup. `setPlaybackRatePercent()` then calls the retained closed player, catches its exception and returns before updating or writing the preference. The enabled selector ignores that return value. | MPA-03 covers speed selection during paused navigation, not ordinary Stop with deferred cleanup. |

Two earlier candidates remain excluded: saving the latest heard checkpoint
during paused navigation follows the frozen synchronization authority; Piper
packaging recovery already requires the documented manual preservation/restore
workflow. Neither is a confirmed defect in this batch.

## Scope and non-goals

One cohesive implementation unit, **PSC-U1**, contains all four findings because
they share coordinator admission, retired-owner handling and the same controls.
There are no separately accepted intermediate units. Risk is high for the
affected cancellation, synchronization and preference-persistence responsibilities.

Expected production edits are limited to:

- `apps/desktop/src/tts/product-narration-coordinator.ts`;
- `apps/desktop/src/tts/ProductNarrationControls.tsx`.

Extend existing tests rather than introduce a new harness:

- `apps/desktop/src/tts/product-narration-coordinator.test.ts`;
- `apps/desktop/src/tts/ProductNarrationControls.test.tsx`;
- `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`.

Unchanged reader/highlight/persistence consumers are validation inputs, not
refactor targets. During implementation, update the narrow behavior/coverage
notes in `docs/product/reader-settings-and-playback-controls.md` and
`docs/development/testing.md`, this plan and its indexes. Keep concise new
evidence under `docs/plans/evidence/minimal-playback-state-corrections/` and raw
receipts under ignored `tmp/evidence/minimal-playback-state-corrections/`.
Creating those execution records is future work.

Do not change PCM terminal guards, DSP, rate arithmetic, scheduler limits,
EPUB preparation, public schemas, Python, Rust, package builders, models,
dependencies or lockfiles. Do not add automatic retries, autoplay, a new queue,
an alternate persistence policy or a general coordinator refactor. Discovery
of a required extra production owner requires a recorded scope/gate revision
before editing it; it must not silently enlarge this batch.

## Relevant files and documentation

Read [the documentation index](../../README.md), [MVP requirements](../../product/mvp.md),
[reader/settings/playback requirements](../../product/reader-settings-and-playback-controls.md),
[architecture overview](../../architecture/overview.md),
[canonical diagram](../../architecture/system-diagram.md),
[synchronization authority](../../architecture/synchronization-authority-v1.md),
[ADR-0040](../../architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md)
and [ADR-0057](../../architecture/decisions/ADR-0057-reader-acquisition-correctness.md).
Existing explicit recovery policy remains authoritative; this task does not
revise model support or historical ADR status.

Inspect `tts/pcm-playback.ts`, `tts/hardware-compatibility-check-binding.ts`, `App.tsx`,
`reader/ReaderPublication.tsx`, `reader/segment-highlight-controller.ts` and
`persistence/narration-position-save-bridge.ts` as callers/consumers under
`apps/desktop/src/`. Retain the prior MPA and VCA assertions in the affected
tests. Consult [testing](../../development/testing.md),
[evidence retention](../../development/evidence-retention.md),
[independent change review](../../development/agentic-change-review.md) and the
[validation reuse policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md).
This is a bug-fix batch with `change_reviewer`, not a refactor campaign requiring
additional refactor roles.

## Architecture and constraints

Keep fixes at existing ownership boundaries:

1. In `resume()`, reject commands against pending navigation, retiring owners,
   closed/configuration-changing state or non-operational recovery. Guard the
   coordinator even if the UI also disables Resume. Keep eligibility truthful
   through existing snapshot/control fields; do not invent a public contract.
2. For Resume without a live owner, let successful start admission establish
   playing intent. `#startRun()` already owns that transition. Remove the
   premature intent change rather than adding a separate retry mechanism.
   Preserve existing loaded-session Pause/Resume and compatibility semantics.
3. Route user-facing fresh Play, including the preparation control's `onStart`
   callback where it represents fresh Play, through the existing
   `startAtVisibleLocator()` behavior. Keep internal navigation restart and
   recovery targeting separate; globally redirecting `start()` would risk
   replacing an explicit target or the latest heard recovery locator.
4. During ordinary Stop, bypass only the retired player's rate application while
   retaining the existing preference update/write/status path. Preserve the
   active player's boundary-deferred selected/pending/active behavior and the
   existing handling of unsupported storage versions and failed writes.

No changes to source-frame authority, containing-segment replay, latest-heard
checkpoints or navigation invalidation order are permitted. No generated audio
is persisted, no book text enters logs, and inference remains local. Preserve
bounded memory and cancellation on all existing invalidating actions. Use only
repository-authored synthetic passages in regressions; malformed-EPUB and
normalization rules are outside scope.

The diagram has been inspected for planning: these corrections stay within
existing components and data flows. Review it again against the final diff;
update it only if an actual boundary change is separately approved.

## Milestones

### 1. Establish the baseline and four regressions — not started

After execution authorization, inspect HEAD, dirty paths, installed inputs and
the original receipts below. Resolve baseline reuse before changing its test
inputs; if proof is incomplete, run the affected existing baseline once.
Use deferred promises and existing harness ownership to expose the races,
without arbitrary delays or real model dependencies. Add `PSC-` regressions and
run G1 once against unchanged production. Require the expected behavioral
failures; a setup error is not reproduction. Retain all receipts.

### 2. Apply the localized corrections — not started

Implement PSC-01 through PSC-04 together in the two expected production owners.
Extend existing assertions only where needed. Add the mounted-reader Stop/Play
browser regression described below. Run the final focused unit group and static
checks before native preparation. Do not run the same group after every finding.

### 3. Validate the combined patch — not started

Run selected Chromium cases, one current desktop build and one packaged Piper
EN speed/lifecycle arm. Reuse verified package/driver artifacts, with current
integrity and discovery checks. Restore host resources and verify cleanup.
Record each gate as **EJECUTAR**, **REUTILIZAR CON PRUEBA**, **NO APLICA** or
**BLOQUEADO**, with actual receipts and any limitations.

### 4. Review and close out — not started

Freeze documentation and provide the exact current patch, base, changed/supporting
path identities, commands and host receipts to independent `change_reviewer`
(GPT-6 Astra high), as required by AGENTS.md. The reviewer does not edit or run
tests. Resolve findings and obtain APPROVE for the exact current patch; missing
evidence or an unavailable reviewer blocks acceptance. Later changes require a
new immutable assessment, retaining individual gates only with dependency proof.

Once all required gates and cleanup pass, move the plan to `completed/`, update
active/completed/documentation indexes and incoming links, and retain the final
review outside its own identity manifest. Do not interpret the current planning
commit authorization as authorization to commit implementation, push or merge.

## Testing and benchmark strategy

### Existing evidence inspected

The following are historical outcomes, not tests executed for this plan. Raw
MPA receipts and logs remain locally retrievable under
`tmp/evidence/minimal-playback-audit-corrections/`; their `*-result.json`,
`*-inputs.json` and `*-exports.json` files identify commands, execution-time
inputs and generated exports. Recorded environment: normal local PowerShell
outside the managed sandbox, Node 24.18.0, pnpm 11.15.1, Vitest 5.0.5 and
Playwright 1.64.1. Reconfirm the actual future execution environment.

| Historical evidence | Recorded outcome | Reuse decision for PSC |
| --- | --- | --- |
| [MPA G3-combined](../evidence/minimal-playback-audit-corrections/execution-ledger.md), reviewed in MPA-R1/R2-20261030 | 214 tests passed in coordinator, controls, PCM and worklet files. Receipt SHA-256 `31eb8d2458f5a1ed8929f1cfb5552dccbc57159e41a5c093c3911c6e0cb300fe`. | Reuse existing assertions/harnesses. Candidate baseline evidence only after complete dependency/environment comparison. Changed coordinator/controls invalidate their final results. Unchanged DSP suites need not be repeated solely because they appeared in this earlier command. |
| [MPA CI3-reader-unit](../evidence/minimal-playback-audit-corrections/ci-follow-up.md), review MPA-CI-R1-20261031 | 187 tests passed in coordinator, ReaderPublication and highlight controller. Receipt SHA-256 `184b30697ed6631c50f21a3a1dab7c674ef6575f87332c0c5d88f60e7c913ea3`. | Strong baseline candidate; source comparison is described below. It is not final acceptance after PSC edits. |
| MPA CI4-browser, same follow-up/review | Five selected navigation, Resume, rate, completion and reflow cases passed. Receipt SHA-256 `b1f0e4d186e52f682667d9b86f0cdb6eb19f34d5211081f7569704554734e303`. | Reuse fixtures and selection rationale. Rerun affected browser journeys because they consume the changed renderer. Do not relabel the old five-case result as current. |
| MPA CI5-static / CI6-build / CI7-piper-en | Static checks, rebuilt desktop and one six-rate Piper EN WebView2 arm passed. CI7 receipt SHA-256 `f97072ec598b5601b3671178f6da8f88137caaf4d11b4e258841530f9a8597fe`. | Renew affected static checks, build and one native arm. Reuse verified preparation assets separately from runtime results. The old executable cannot validate the changed renderer. |
| [R7 R1-G4 and host receipts](../evidence/seven-finding-minimal-corrections/host-receipts.md), [execution ledger](../evidence/seven-finding-minimal-corrections/execution-ledger.md) | 217 tests passed in seven desktop files, including cleanup/recovery and both persistence consumers; native/Piper results were tied to that older artifact. | Reuse regression assertions and cleanup lessons. The aggregate predates MPA and is not a current baseline or final PASS; individual unchanged checks need the same full proof before reuse. |

Read-only planning comparison verified CI3's original input-manifest digest and
all 1,484 recorded entries against the planning workspace: eight Markdown files
differ; no recorded source, test, configuration, lock or installed pnpm metadata
entry differs. Git membership adds only the two MPA CI Markdown reports; the
manifest's ignored environment metadata is accounted for separately. All 251
entries in CI7's generated-export manifest match. The original result/input
digests and log presence were also checked for G3, CI3, CI4 and CI7.

This is source/artifact inspection, not a rerun or complete environmental
acceptance. Tool/browser/driver versions, execution isolation, package contents
and any runner-consumed HEAD must still be proved at execution time. In
particular, a squash/branch change alone cannot renew an old review report.

Preserve the prior MPA browser fixture failures and R7 Piper-resource failures
as failures. They are neither new PSC failures nor substitute baseline passes.
The latest native evidence verified 2,023 Piper runtime entries and restored
the original adjacent resources; that restored directory remained old.
Do not assume the executable's discovered resources now match the verified
package just because the package archive exists.

### Minimal new coverage

- **PSC-01:** Hold Stop cleanup pending after paused chapter/passage navigation;
  call Resume directly and through the control eligibility boundary. Assert no
  retired-player call, false recovery, new generation or premature audio. Release
  cleanup, settle the target and explicitly Resume there. Retain ordinary
  loaded-player Pause/Resume as a control.
- **PSC-02:** Finish paused navigation first, then defer availability. Attempt
  Resume while checking and after a rejected admission; paused intent and the
  target survive. Resolve availability, assert no autoplay, then Resume once
  and observe a new run at the selected target. Preserve closed/configuration/
  recovery guards using existing cases rather than duplicating their matrices.
- **PSC-03:** Use A and B in distinct synthetic prepared segments/paragraphs.
  Play A, Pause, report visible B, Stop, and drive primary Play without sending
  another viewport sample. Assert the first new preparation request is B and
  persistence still follows the heard-checkpoint rules. A mounted Chromium case
  verifies real passive scrolling and the primary button; a mock-method call
  assertion alone is insufficient. Ordinary Resume and explicit boundary
  navigation must retain their separate targeting rules.
- **PSC-04:** Defer ordinary Stop cleanup and select an admitted non-default
  rate. Assert the preference write and selected UI value succeed without a call
  into the closed player; the next run receives the selection. Retain existing
  storage-failure/future-version and active boundary-deferred assertions. Reuse
  MPA-03 paused-navigation cases rather than duplicate all six rates in new tests.

### Gates and commands

All future commands run from `<repo-root>` in **normal local PowerShell outside
the managed automation sandbox**. These are existing configured commands or
documented runner leaves; new `PSC-` filters refer to tests to be implemented,
not existing coverage. Record exact commands, start/end, exit status and consumed
input identities. This table describes future implementation acceptance, not
completed gates. Current documentation/Git inspection is recorded separately.

| Gate / decision | Command and timing | Invariant, inputs and invalidation |
| --- | --- | --- |
| G0 / inspect; REUTILIZAR CON PRUEBA where possible | Before test edits, inspect original receipts, source/import and discovered-file membership, locks, installed tools and generated exports. Run `pnpm.cmd build:packages` only if current generated-input proof is incomplete. | Establish a real pre-change baseline and ready exports. If baseline reuse cannot be proved, run only the affected existing files from G2 before editing them. A post-change result cannot manufacture a baseline. |
| G1 / EJECUTAR | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx -t "PSC-"` once after regression additions and before production edits. | Expected behavioral failures for the four findings, with passing controls. Bind unchanged production, new tests, fixtures, Vitest config, setup, transitive imports and exports. Setup failures block reproduction. |
| G2 / EJECUTAR | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/ProductNarrationControls.test.tsx src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/persistence/narration-position-save-bridge.test.ts` once after the combined production/test edits. | New regressions plus admission, Resume, navigation/highlight and heard-save consumers. Any consumed source/test/helper/config/lock/export change invalidates the affected result. Run this combined group instead of G1 again plus separate per-finding suites. |
| G3 / EJECUTAR | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/desktop typecheck` after all TS/TSX edits and before costly native preparation. Run sequentially and record each outcome. | Formatting, lint and desktop type compatibility. Include glob membership, TS projects, tools, configuration and generated declarations. Documentation alone does not normally invalidate these gates. |
| G4 / EJECUTAR | Run the exact filtered browser command below once on the combined patch. | New Stop/Play journey plus existing paused navigation, ordinary Resume/follow and rate-label controls. Consumes the production renderer, browser fixtures, locks, Playwright/Vite configuration and Chromium. Keep configured package/renderer build hooks. |
| G5 / EJECUTAR; reuse prepared assets | After fast gates: `pnpm.cmd package:piper-core:check`, then `pnpm.cmd build:desktop` once. | Current verified package and current renderer/native executable. Capture build inputs, manifest and binary identity. No package regeneration or installer build is selected. A changed renderer invalidates the old executable despite unchanged Rust. |
| G6 / EJECUTAR | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` on G5's exact executable. | One packaged WebView2 arm covers six rates, Pause/Resume, navigation, synchronization, cancellation and cleanup. Record executable, actual discovered runtime/voice resources, runner, WebView2/driver and relevant host conditions. Changed artifacts/environment invalidate reuse. This complements deterministic race regressions; it is not their precise reproduction. |
| G7 / EJECUTAR | `pnpm.cmd check:evidence`, `git diff --check` and local Markdown link/consistency review after final documentation. | Current evidence/privacy scope, whitespace, links and commands. Recheck staged names/diff under any separately authorized future Git action. No application build solely for Markdown edits. |
| G8 / required independent assessment | `change_reviewer` after the exact patch and receipts are frozen. | Current immutable Review ID binds code, tests, supporting inputs, evidence reuse and cleanup. An old APPROVE or a summary without retrievable originals cannot satisfy this gate. |

The exact G4 shell command is:

```powershell
pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "PSC-|VCA-06/09|RAC-07|MPA-01/03"
```

**NO APLICA within this scope:** full repository/desktop test sweeps, Python and
Rust test/lint matrices, EPUB normalization corpus, fresh DSP/listening benchmarks,
installer journeys and additional language/model arms. These boundaries are
unchanged; exclusion is not a claim that their old results validate new code.
Do not run `check` or `check:portable` locally in addition to the selected leaves
without a new coverage reason. Required CI for any later publication remains
separate and cannot be waived by this plan.

Reuse complete, identical generated workspace exports and verified Piper/model/
driver assets; do not reinstall or regenerate them merely to obtain fresh
timestamps. Configured build hooks remain enabled. Do not reuse the old renderer
binary or historical performance measurements for PSC acceptance. No new
performance, listening-quality or platform-support claim is planned.

For any individual gate reuse, the reviewer must inspect the original immutable
host receipt, exact consumed inputs and directory membership, runner/tool/library
versions, generated/tested artifact bytes, environment and invariant equivalence.
Record the old gate/report ID and current comparison in a new assessment.
Unknown inputs or drift require the affected gate, not a blanket rerun. A failed
aggregate remains failed even if independent passing cases qualify for retention.

## Risks and rollback

- An overbroad Resume guard could block a valid loaded paused session; retain
  its existing controls. A queued or automatic Resume would change product
  behavior and is excluded. Inadmissible Resume must leave a later explicit
  action possible.
- Globally replacing the active locator could break boundary navigation,
  recovery or heard persistence. Change fresh UI Play routing and prove it with
  distinct A/B passages rather than altering all internal starts.
- Skipping player application indiscriminately could hide a real live-player
  failure. Identify retired ownership using existing lifecycle state and retain
  storage error reporting; do not weaken PCM validation.
- Before native preparation, inspect tool/driver compatibility, short writable
  scratch, disk and exact resource discovery. Keep an ownership/recovery journal
  before staging any temporary package. Preserve original resources byte for
  byte, use only scoped temporary copies, and restore/verify complete membership,
  sizes and hashes after success, failure or interruption. Old MPA wrappers have
  old binary expectations and receipt paths: read them for evidence, do not run
  them unchanged or overwrite their receipts.
- Use the versioned native runner. Missing recurring runner capability requires
  a bounded, separately reviewed harness change; do not grow untested temporary
  orchestration during an expensive run. Missing prerequisites or unverifiable
  cleanup are **BLOQUEADO**, not permission to drop G6.
- Keep one active run per gate, unique receipt IDs and all failed attempts.
  Diagnose a stalled stage using the existing timeout and observable progress;
  do not relaunch a live run. Allow at most one infrastructure retry per stage
  with a concrete changed condition; a second failure requires replanning.
- No migration is needed. Roll back only task-owned code changes if the approach
  fails, preserving user work and evidence. Never reset/clean the repository or
  restore unrelated host state. Any new failure after a correction invalidates
  the relevant gates; it does not reset the retry history.

## Progress log

- 2026-10-31: Rechecked the four retained static findings and their callers at
  `602157f3138a53a340ae4854f803e90209327f8a`; retained both exclusions.
- 2026-10-31: Inspected MPA/R7 reports, original local MPA receipts/logs,
  configuration and generated-input identities. Recorded conditional reuse,
  required fresh gates and the stale-adjacent-resource caveat.
- 2026-10-31: Prepared this plan and active-index entry. No production code,
  tests, runtime resources or historical evidence changed; no test/build/lint/
  benchmark command executed. Created `codex/minimal-playback-state-plan` from
  the planning base. Only the plan and active-index entry belong in the
  authorized local documentation commit.
- Implementation milestones 1–4 and all runtime acceptance remain pending.

## Discoveries and decisions

- Keep all four confirmed static findings in scope. PSC-01 and PSC-02 have
  different failure windows: a retained closed owner versus no owner and a
  premature intent transition. Both need explicit regressions.
- The previous `VCA-06` case intentionally waits for navigation settlement;
  its historical PASS cannot disprove PSC-01. PSC-04's ordinary Stop window is
  distinct from MPA-03's already-covered paused-navigation speed path.
- Start-at-visible behavior already exists. Reusing it at fresh Play controls
  avoids modifying internal navigation/recovery authority or waiting for a
  coincidental viewport sample.
- Historical source/export identity supports baseline reuse investigation, not
  acceptance of future edits. The minimum planned final runtime evidence is one
  combined focused unit run, one selected Chromium invocation and one current
  Piper EN WebView2 arm; repeat only invalidated gates.
- Documentation-only planning is exempt from independent behavioral change
  review. Future implementation requires G8 and all applicable host evidence.

## Final validation results

**Planning deliverable only.** Repository instructions, relevant code/contracts,
test commands and historical evidence were inspected. The source/export
comparison above is read-only evidence inspection, not a test PASS.

Implementation: **not started**. New regressions: **not written or executed**.
G1–G8: **pending future execution/review**. No historical runtime result has
been promoted to acceptance for PSC. No benchmark, cleanup, implementation
review or behavior-completion claim is made.
