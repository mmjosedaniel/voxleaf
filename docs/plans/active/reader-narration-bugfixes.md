# Reader and narration bug fixes

Created: 2026-10-19. Status: planned; implementation and acceptance pending.
Execution branch: `codex/reader-narration-bugfixes`.

## Goal

Correct four reproduced defects in startup cancellation, player disposal, lazy
EPUB raster reads, and prepared-passage navigation. This plan spans the existing
M003/M004, M007/M008, and M009 responsibilities, so it has a descriptive filename
rather than a new roadmap milestone number.

The current request covers this ExecPlan, its indexes, branch creation, and one
local planning commit. It does not record an implementation or authorize remote
publication. Execute the implementation milestones when requested, on the named
branch, after checking its current HEAD and worktree again.

## User-visible outcome

1. **RNB-01 — Startup cancellation:** Cancel start, Stop, book replacement, and
   close can contain an in-progress model load or warm-up without waiting for
   that operation to complete normally. A late result cannot revive the old run
   or affect a newer service instance.
2. **RNB-02 — Player disposal:** stopping or replacing a narration run releases
   its AudioContext, worklet, callbacks, timers, and retained audio. Repeated
   start/stop and navigation cycles do not accumulate abandoned playback owners.
3. **RNB-03 — Lazy raster reads:** an image first encountered after 30 seconds
   of reading remains available. Each resource operation stays cancellable and
   bounded; ordinary reading time is not counted as active decompression time.
4. **RNB-04 — Passage navigation:** Next continues to address the immediate
   successor of the audible passage when preparation runs more than 64 segments
   ahead. Previous retains its bounded-history semantics, and navigation still
   synchronizes the reader, audio identity, and heard-position checkpoint.

## Current state

The investigation and confirmation inspected clean `main` at
`b62770193b3b32cbf18542266e26c116426525b4`. The execution branch was created from
that commit. These are pre-fix observations, not acceptance of future changes.

| ID | Confirmed trigger and observation | Failing ownership boundary |
| --- | --- | --- |
| RNB-01 | Hold model preparation pending, then Stop. No shutdown/cancel request is issued until preparation settles. Reproduced with both a fake service and the real `TtsProcessClient` using a controlled native invocation port. | `ProductNarrationCoordinator.#performStopActiveRun` awaits `#operation` before shutdown. Native `prepare_measured` holds the operation mutex; `shutdown` requires that mutex and returns busy if it is occupied. |
| RNB-02 | Start audio, then Stop or close the coordinator. The discarded player's backend is never closed. Three cycles through the actual Web Audio backend with an instrumented AudioContext API create three contexts with no close call; explicit backend close closes each one. | The coordinator calls `AdaptivePcmPlayer.stop()` and drops its reference. Only `AdaptivePcmPlayer.close()` invokes backend disposal. The recovery path already uses close. |
| RNB-03 | Open a synthetic raster EPUB and read an image successfully. After 30,150 ms of real elapsed time, the same read rejects with `cancelled`, while the publication remains open and locator resolution works. | `readBoundResource` reuses the archive's ingestion budget. Its deadline is measured from initial ingestion, including idle reading time. |
| RNB-04 | Open a synthetic EPUB with one heading and short paragraphs, prepare six-second audio units with a ten-minute target, and begin at the first passage. Next works with 32 and 64 accepted units and fails with 65. | `#rememberBoundary` removes the earliest ranges after 64, including the currently audible range and its successor. `#currentBoundaryIndex` then cannot find the current passage. |

The confirmation executed outside the managed sandbox in local PowerShell:

- `pnpm.cmd --filter @voxleaf/desktop exec vitest run tmp/bug-audit-20261019.test.ts`
  exited 1: six expected-behavior assertions reproduced the four defects.
- `pnpm.cmd --filter @voxleaf/desktop exec vitest run tmp/bug-audit-confirmation-20261019.test.ts`
  exited 0: six observation/control tests established the triggers above. Those
  tests assert the existing defects and are not repair-acceptance tests.

The local sources and captures are retained under `apps/desktop/tmp/` with these
basenames: `bug-audit-20261019` and `bug-audit-confirmation-20261019`. Sources use
`.test.ts.txt` to avoid ordinary discovery; results use `.results.txt`. They are
ignored diagnostic artifacts, not portable repository dependencies. Recreate
focused permanent tests from the descriptions above if those artifacts are
absent; do not commit their copied harnesses or raw output.

The earlier audit also ran `pnpm.cmd check`, `pnpm.cmd test:browser`, and
`pnpm.cmd test:native-startup` successfully on the inspected source. Those
results demonstrate a coverage gap, not acceptance of a repair. The latter
native smoke used a synthetic service. No real model cancellation timing,
browser RAM-growth measurement, or installer lifecycle was established by this
bug confirmation. RNB-01 establishes delayed cancellation, not an infinite wait.

## Scope and non-goals

Implementation consists of four sequential fixes with a combined acceptance
gate. RNB-01 and RNB-02 both modify coordinator lifecycle ownership, and RNB-04
also touches the coordinator; keep one implementation writer at a time.

In scope are focused production changes, regression tests, necessary native
fake-service scenarios, browser/native smoke coverage, content-free evidence,
and documentation of the resulting behavior. Treat these as bug fixes under
`investigate-bug`, with independent `change_reviewer` acceptance; this is not a
behavior-preserving refactor campaign.

Do not redesign the reader, add dependencies or models, tune narration text or
voice quality, increase resource ceilings, change prepared targets or playback
rates, add audio persistence, repair unrelated findings, or publish packages.
EPUB admission, shared locator/segment contracts, and Python wire protocol v1
remain the intended compatibility boundaries. Any necessary change to a typed
native command must be explicit, documented, and reviewed before acceptance.

## Relevant files and documentation

Paths below exist at the inspected base. Extend the execution allowlist only
when a concrete failing test shows that a directly coupled owner is needed.

| Area | Production and test entry points |
| --- | --- |
| Coordinator and UI | `apps/desktop/src/tts/product-narration-coordinator.ts`, `product-narration-coordinator.test.ts`, `ProductNarrationControls.tsx`, and `ProductNarrationControls.test.tsx` in the same directory |
| Native client | `apps/desktop/src/tts/process-client.ts` and `process-client.test.ts` |
| Native lifecycle | `apps/desktop/src-tauri/src/tts_service_supervisor.rs`, `tts_service_supervisor/tests.rs`, `tts_service_supervisor/host_diagnostics.rs`, `tts_service_fake_child.rs`, and `tts_service_fake_child/tests.rs` |
| Playback ownership | `apps/desktop/src/tts/pcm-playback.ts`, `pcm-playback-contracts.ts`, `pcm-playback.test.ts`, `playback-backends/web-audio-pcm-playback.ts`, and `playback-backends/incremental-wsola-v3.ts` |
| Bounded scheduling | `apps/desktop/src/tts/adaptive-buffer-scheduler.ts`, `adaptive-buffer-scheduler.test.ts`, and `adaptive-buffer-authority.ts` |
| Archive/resource budgets | Under `packages/epub/src/`: `archive/archive-inventory.ts`, `archive/archive-reader.test.ts`, `security/processing-budget.ts`, `security/processing-budget.test.ts`, `resource/opened-publication.ts`, and `resource/opened-publication.test.ts` |
| Reader image integration | `apps/desktop/src/reader/images/publication-raster-image-loader.ts`, its test, `SemanticRasterImage.tsx`, and `packages/epub/test-support/epub-fixture.ts` |
| Browser/native integration | `apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts`, `synchronization-feasibility.smoke.spec.ts` in that directory, `apps/desktop/scripts/native-smoke/tts-scenarios.mjs`, `native-smoke/reader-scenarios.mjs`, and `native-startup-smoke.mjs` under `apps/desktop/scripts/` |

Required authorities and continuation context:

- [Project index](../../README.md), [MVP requirements](../../product/mvp.md),
  [roadmap](../roadmap.md), [system diagram](../../architecture/system-diagram.md),
  and [architecture overview](../../architecture/overview.md).
- [ADR-0007](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md)
  for admission, decompression, byte, ratio, time, and abort limits.
- [ADR-0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md)
  and [TTS protocol v1](../../architecture/tts-service-protocol-v1.md) for native
  ownership, timeouts, process-tree termination, and stale-result containment.
- [ADR-0017](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md)
  and [synchronization authority](../../architecture/synchronization-authority-v1.md)
  for audible ranges, bounded history, navigation, and heard checkpoints.
- [ADR-0040](../../architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md)
  for direct/WSOLA playback and resource ownership.
- [Completed M005 plan](../completed/M005-narration-text-preparation.md): roadmap
  M005 is complete. These fixes consume its stable ranges; they do not change
  normalization, segmentation, or the safe-document-to-narration boundary.
- [Independent review](../../development/agentic-change-review.md),
  [evidence retention](../../development/evidence-retention.md), and
  [Git workflow](../../development/git-workflow.md).

## Architecture and constraints

Keep EPUB bytes, narration text, inference, and generated audio local. Use only
repository-authored synthetic input in committed tests. Retain no book text,
PCM, model weights, user paths, or secrets in logs or evidence.

Preserve one native-owned service, one active synthesis, bounded preparation,
the current PCM byte/sample/unit ceilings, and identity-first invalidation.
Playback-only pause may continue bounded generation for its current identity;
this plan repairs Stop and invalidating actions, not that documented pause policy.

The implementation direction is:

- **Startup:** invalidate the renderer run before containment, then request a
  native interruption that can terminate the owned loading/warming child
  without acquiring the operation mutex held by preparation. Preserve graceful
  shutdown for idle states. Scope interruption and late completion/error paths
  to the captured service instance; a global `force_stop()` call alone is not a
  sufficient ownership proof. Settle the abandoned operation and resource
  cleanup before allowing a replacement run. Use the existing native shutdown
  command if it can express this safely; document any required typed-command
  change and its callers before implementation. No new Python wire message is
  planned. Apply the existing 500 ms identity, 2,000 ms termination, and 5,000 ms
  final-cleanup limits at their documented boundaries; do not wait for the
  120,000 ms load/warm limits to act as cancellation.
- **Player:** route every permanent disposal through close, preserve the
  scheduler's cancel-versus-shutdown decision, and observe cleanup completion
  before forgetting ownership. Disposal must be idempotent and cover pending
  WSOLA preparation as well as an active source. Surface a containment failure
  instead of claiming success after an unsuccessful close. If asynchronous
  backend closure needs an observable result, keep that contract narrow and
  update all implementations/tests explicitly.
- **Raster:** separate a resource operation's monotonic deadline and abort
  context from the archive's ingestion start time. Keep immutable admission
  facts, the same maximum policy, existing aggregate accounting, CRC/signature,
  per-entry/ratio/byte limits, one-read ownership, and close-linked cancellation.
  Neither resetting all shared counters nor removing the deadline is acceptable.
  Document the exact lifetime of each budget before changing its owner.
- **Navigation:** keep the bounded navigation window anchored to the audible
  range, including its immediate successor and recent history. Replenish it as
  playback advances from the existing bounded source-range/queue metadata, or
  through bounded locator-based preparation when needed. Do not retain an
  unbounded second list or simply raise 64 to another arbitrary constant.
  Preserve the existing 64-entry navigation bound and the independent 256-unit
  audio ceiling; evict history or distant lookahead before current/next targets.

Review the canonical system diagram during integration. Update it only if
actual component ownership, important flows, or typed native boundaries change;
record a no-change conclusion otherwise. Record durable budget/lifecycle
decisions in an additive ADR if the existing authorities need clarification.
Do not rewrite completed plans or frozen evaluation evidence.

## Milestones

### Milestone 1: Establish permanent regression cases

Status: not started.

- Recheck HEAD, the clean index, branch, package pins, relevant source, and
  existing tests. Record pre-existing changes separately before editing.
- Convert the four reproductions into small tests beside their existing owners,
  reusing local fixture helpers. Tests must assert desired behavior, not assert
  that the defect remains. Keep successful controls for under-limit navigation,
  immediate raster access, normal shutdown, and explicit backend disposal.
- Add controlled native load/warm blocking to the existing fake-service harness
  so RNB-01 can be exercised without model hardware. Keep this a test/diagnostic
  facility, outside normal product and release configuration.
- Run each focused regression before its fix and record the actual failure.
  Verify a failing assertion reaches the intended boundary rather than failing
  on fixture setup, a timer-starved event loop, or an unavailable tool.

Validation: focused desktop/EPUB tests and native tests from the command table;
retain failing pre-fix results separately from later passes.

### Milestone 2: Contain startup promptly (RNB-01)

Status: not started; depends on Milestone 1.

- Freeze the native interruption contract and instance identity rules first.
  Account for `receive_control`, `fail_session`, shutdown, and explicit restart:
  a delayed old response/failure must never set state or terminate a new child.
- Replace the coordinator's wait-before-containment ordering with the bounded
  native/typed-client interruption path described above. Preserve stale-audio
  rejection and existing synthesis cancellation.
- Cover cancellation during load and warm-up, completion racing cancellation,
  repeated Stop/close, chapter/book replacement, service crash, timeout, and a
  successful explicit restart after verified cleanup. Include the window where
  native start is pending so a subsequently created child cannot be orphaned.

Acceptance: pending preparation can be terminated without releasing the test's
normal-completion latch; process-tree cleanup meets the existing limits; no
stale ready/audio publication or automatic restart occurs. Both native build
modes, the real typed client, and the UI's Cancel start path agree.

### Milestone 3: Dispose playback owners (RNB-02)

Status: not started; follows Milestone 2 because both change teardown.

- Close the discarded player exactly once for Stop, completed-run disposal,
  seek/chapter replacement, book close/replacement, configuration change, and
  application cleanup, including service failure during teardown.
- Verify that audio payload release, worklet preparation cancellation, backend
  close, listeners, and transition timers settle before ownership is dropped.
- Cover direct `1.00x`, WSOLA `0.75x`, pending rate preparation, repeat close,
  and existing operational recovery; retain all supported-rate regression tests.

Acceptance: repeated cycles close every created backend/context, release all
retained/discarded PCM once, and produce no late callback or stale playback.
Add real Chromium/WebView2 lifecycle observations; an instrumented API unit test
alone must not be described as a measured browser RAM improvement.

### Milestone 4: Give lazy raster reads their operation deadline (RNB-03)

Status: not started; may be investigated separately, but writes remain sequential.

- Implement the separate resource deadline while preserving archive accounting.
- Test a successful read long after opening, repeated delayed reads, the exact
  per-operation deadline and maximum-plus-one, byte/ratio/CRC rejection, caller
  abort, close during decompression, and simultaneous-read rejection.
- Exercise a raster that enters the reader viewport only after the original
  ingestion deadline, using the actual publication and image-loader path.

Acceptance: the late image renders locally; a genuinely over-budget resource
operation still fails with the established safe error; malformed-EPUB and
archive maxima remain enforced. Use an injected monotonic clock for unit cases
and one real elapsed-time browser/native scenario for the integration claim.

### Milestone 5: Preserve navigable audible boundaries (RNB-04)

Status: not started.

- Implement the current/next-aware bounded window and its refill rules. Reuse
  existing source ranges without copying narration text or PCM into history.
- Test 63/64/65 and more than 100 short segments, ten-minute prepared mode,
  quick mode with generation running ahead, and movement across refill batches.
- Verify repeated Next then Previous, paused navigation, chapter transitions,
  end-of-book, and restart from an existing locator. Check the emitted target
  and synchronized visual/heard location, not just the button's enabled flag.

Acceptance: current and immediate successor remain addressable whenever a
successor exists in prepared audio, history remains at most 64 entries, and
all existing PCM/preparation bounds and identity-first navigation semantics pass.
M005 normalization, segment output, and source mapping remain unchanged.

### Milestone 6: Integrate, review, and close the plan

Status: not started; all four fixes and combined gates are required.

- Run the combined repository, browser, native, and applicable real-model gates
  below. Record source identities, exact commands, outcomes, environment, failed
  attempts, and cleanup. Keep raw captures in ignored `tmp/evidence/<run>/` and
  concise immutable reports under `docs/plans/evidence/reader-narration-bugfixes/`.
- Reconcile product/architecture documentation, budget and lifecycle rationale,
  synchronization authority, and diagram review with the implemented patch.
- Delegate an independent review to `change_reviewer` (GPT-6 Astra high) using
  the exact patch, reviewed path identities, reproductions, and host evidence.
  Pause source/Git writes during review. Resolve findings, rerun affected gates,
  and obtain a current APPROVE. Missing reviewer or required evidence is BLOCKED.
- Only after all acceptance criteria pass, complete the validation record and
  move this plan to `docs/plans/completed/`, updating both indexes and incoming
  links. Record remaining support limitations without turning them into passes.

## Testing and benchmark strategy

Run every acceptance command in a normal local PowerShell session outside the
managed sandbox. All commands below exist in repository configuration or use
its configured Vitest runner. Cwd is the repository root. Use the package-manager
version pinned in `package.json`; this host's working Corepack shim directory is
`C:\nvm4w\nodejs\node_modules\corepack\shims`.

| Gate | Exact command | Timing and required evidence |
| --- | --- | --- |
| Build package inputs | `pnpm.cmd build:packages` | Before desktop tests consuming EPUB/shared package output after package edits. |
| Focused lifecycle/navigation | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts src/tts/process-client.test.ts src/tts/pcm-playback.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/ProductNarrationControls.test.tsx` | Before and after the relevant fixes; add newly introduced test paths explicitly. |
| EPUB regressions | `pnpm.cmd --filter @voxleaf/epub test` | Before/after RNB-03; includes package build and malformed-input coverage. |
| Native regressions | `pnpm.cmd test:rust` | Before/after RNB-01; runs default and `release-locked-runtime`. |
| Fast static checks | `pnpm.cmd format:check`; `pnpm.cmd lint`; `pnpm.cmd typecheck` | After the affected edits, before costly native/model preparation. The final aggregate repeats these as configured. |
| Repository integration | `pnpm.cmd check` | Final combined patch: evidence guard/tests, formatting, lint, types, tests, and builds. |
| Chromium | `pnpm.cmd test:browser` | Final combined patch, including new delayed-image, navigation, and context-lifecycle scenarios. |
| Packaged native | `pnpm.cmd test:native-startup` | Final combined patch; extend existing synthetic service scenarios to prove startup interruption and cleanup. |
| Real supported models | `pnpm.cmd test:tts:bilingual-portfolio-exact-host` | Final lifecycle changes on a configured compatible host; preserve runner preflight/cleanup and supported Piper/Chatterbox evidence. Record the development-only Qwen arm separately. |
| Planning/index safety | `pnpm.cmd check:evidence`; `git diff --check`; `git diff --cached --check` | Documentation preparation and authorized staging; inspect new file content and the exact staged allowlist too. |

Use the existing native fake-service/smoke scenarios for deterministic delayed
startup; no new ad hoc production command is required. Extend the owned scenario
or document a narrow configured runner extension before claiming that an existing
command covers a new regression. For real Chatterbox, record Cancel start during
an observed model-loading/warming phase as well as ordinary playback/restart;
a naturally fast startup is not evidence of cancellation during loading.

Measure identity invalidation, child termination, final cleanup, created/closed
contexts, retained PCM/unit counts, first audio, and underruns using content-free
observations. Do not weaken existing thresholds or hide failures with retries.
Classify an environment failure, fix its cause, then rerun the unchanged command
outside the sandbox. An unavailable hardware prerequisite leaves its required
gate pending; synthetic passes do not establish GPU/model acceptance.

No fresh installer installation, download, firewall mutation, model update, or
package publication is part of this planning task. Before implementation host
gates that need such changes, inspect the existing runner, record the precise
preparation and cleanup scope, and use the applicable authorization.

## Risks and rollback

- A cancellation fix can expose races previously hidden by serialization.
  Instance-bound completion/failure handling and a one-child restart gate are
  mandatory; moving one await or calling global force-stop is insufficient.
- Waiting for backend closure can introduce deadlocks or lose the native
  cancel transition. Retain the transition before disposal and bound cleanup.
- Resetting an EPUB budget can accidentally relax aggregate decompression or
  ratio defenses. Keep lifetime accounting separate from the fresh read clock
  and test maximum-plus-one cases on the actual archive path.
- A navigation fix can retain unbounded history or derive targets from the
  wrong identity. Test capacity and locator correctness across cancellation,
  refill, and chapter changes, with no text added to observations.
- Synthetic evidence does not establish hardware latency or long-term memory
  growth. Preserve the limits and distinguish API closure from measured RAM.

Keep the four fixes reviewable and avoid unrelated restructuring. If a unit
fails acceptance, retain its diagnostic evidence and repair or revert only its
owned patch under current Git authorization. Never reset/clean the worktree or
erase unrelated changes. Restoring a known pre-fix state must retain an explicit
record that the corresponding bug remains; rollback is not successful closure.

## Progress log

- 2026-10-19: four findings reproduced and confirmed on `b627701`; six desired-
  behavior probes failed and six observation/control cases passed outside the
  sandbox. Real-time raster expiry and the 64/65 navigation boundary confirmed.
- 2026-10-19: reviewed the plan format, product constraints, native timeout and
  ownership rules, EPUB budget authority, M005 status, synchronization rules,
  independent-review contract, and evidence/Git policy.
- 2026-10-19: created `codex/reader-narration-bugfixes` from clean `main` and
  prepared this plan and its indexes. The twelve required sections, six
  milestones, twenty local links, evidence guard, and documentation diff were
  checked on the host. All implementation milestones remain pending.

## Discoveries and decisions

- Native shutdown uses `try_lock`, so frontend await reordering alone cannot
  interrupt preparation. Native containment and stale instance handling form
  one correction with the coordinator/client changes.
- A separate recovery path already closes the player; normal disposal needs
  equivalent ownership guarantees without duplicating recovery or enabling retry.
- The 30-second ingestion budget is intentional. Applying its original start
  time to later lazy resource work is the defect; the maximum is not increased.
- The 64-entry history bound is documented. Evicting the audible/current target
  because of distant preparation is the defect; boundedness remains required.
- Existing broad green checks missed these cases. New targeted regression
  evidence is required before treating another broad green run as repair proof.
- The current documentation-only setup does not accept a behavioral patch.
  The later implementation follows the independent feature/bug review workflow,
  with exact current host evidence and the applicable Git authorization gates.
  It is not a behavior-preserving refactor.

## Final validation results

Implementation: **NOT STARTED**. All six implementation milestones, the combined
runtime/model gates, and independent change review remain pending.

Planning-only validation on 2026-10-19, in local PowerShell outside the sandbox:

- Structure/link inspection: PASS; all twelve required sections occur once,
  all six milestones are present, twenty local links resolve, and both indexes
  point to this plan.
- `pnpm.cmd check:evidence`: PASS, exit 0.
- `git diff --check`: PASS, exit 0.
- `git diff --cached --check`: PASS, exit 0; complete staged documentation diff
  reviewed with exactly this plan, `docs/plans/active/README.md`, and
  `docs/README.md` allowlisted. Recheck the final staged content before commit.
- Runtime tests, model runs, and independent behavioral review: not run for this
  documentation-only setup. No executable behavior or test criterion in the
  current product was changed; implementation review remains mandatory above.

The pre-fix observations in Current state are preserved as investigation
evidence. They are not reused as passing implementation acceptance.
