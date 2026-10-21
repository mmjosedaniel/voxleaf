# Reader, narration, and optional acquisition bug fixes

Created: 2026-10-20.
Status: complete; all eight corrections, required host gates, restoration and independent R5 acceptance pass on 2026-10-20.
Execution branch: `codex/reader-narration-acquisition-bugfixes`.
Planning base: `f683a6eae77a7bac60a8f58f7e0af014bde27815`.

Editorial consolidation: 2026-10-21, under PR266-CLEANUP-WO-20261021-01.
The private evidence archive
preserves the complete operational history. Requirements below are unchanged;
all validation results describe their original checkpoint, not a new run.

## Goal

Correct the eight defects identified by the source-only audit and subsequent
verification of the EPUB, reader, narration, playback, and optional Chatterbox
acquisition paths. This plan spans existing M003/M004, M005, M008/M009, M010.2,
and M011 responsibilities; it does not introduce a new roadmap milestone.

The 2026-10-20 execution request authorizes implementing all eight fixes,
permanent regression tests, host validation, and current documentation.
The earlier audit-only restriction on inspecting/running tests is lifted.
Use the existing execution branch, preserve subsequent user work, and leave
all implementation changes uncommitted. No commit, push, PR, new branch,
reset, clean, stash, or amend is authorized.

## User-visible outcome

| ID | Intended outcome |
| --- | --- |
| B01 | If a preparation target cannot be reached within the audio-unit capacity, the reader can explicitly play the audio already available without losing it or increasing the memory limits. |
| B02 | Narration can continue through long supported paragraphs and start from a deep valid locator without failing because earlier text is repeatedly scanned. Text, segment boundaries, and locator ranges remain stable. |
| B03 | Changing the narration engine or language makes Previous/Next use only boundaries valid for the new segmentation context. Next does not repeat the current passage through a stale overlapping range. |
| B04 | Navigating to an unrenderable chapter stops the old narration and displays the chapter fallback without reporting the old passage as a successful new destination or overwriting the last valid reading position. |
| B05 | Revisiting chapters can reload valid images for as long as the book is open. Repeated reads do not consume a permanent lifetime decompression allowance. |
| B06 | Cancelling optional Chatterbox acquisition during final hashing/verification prevents installation when cancellation is accepted before the atomic commit point. |
| B07 | If cancellation cleanup fails, Settings reports a terminal cleanup failure and permits a safe retry or removal once the underlying problem is resolved. It does not retain a nonexistent active download. |
| B08 | Pause remains valid while the non-default playback-rate processor is preparing. Finishing that preparation cannot start sound while the user's intent is paused. |

## Initial planning state (historical)

The planning checkout is clean `main` at the base above. The earlier audit
inspected `cf1f2c8e08bd32b0fe6907004285b549851dc40d`; both commits have the same
tree, `ec31aa70c0a99caa7efa1bfab6d714c9440e28dc`. The verification therefore
applies to this planning base. Recheck the actual execution HEAD and working
tree before relying on that identity.

All eight findings are confirmed by control/data-flow inspection under the
listed conditions. None was reproduced in execution in this investigation.
There are no fresh failing or passing test results, measured occurrence rates,
or hardware timings for this batch. Treat all eight as P2 correctness work;
B01 is a blocked preparation that can be stopped, not an application-wide
unrecoverable lockup.

| ID | Trigger and source evidence at the planning base |
| --- | --- |
| B01 | More narration remains, 256 short complete audio units occupy the queue, and their effective duration is below the selected target. `AdaptiveBufferScheduler.#nextAction` rejects another reservation, while `#refreshPlaybackState` requires the unmet target before consumption starts. For example, 256 valid two-second units provide 512 seconds against a 600-second target. |
| B02 | `prepareNarrationBatch` resets an interior paragraph/heading start to offset zero. `projectLeafWindow` also starts traversal at zero and charges skipped characters. `observeSourceWindow` accumulates those inspections against 16,384, so continuation or a deep cold start can exhaust work before reaching the requested passage. |
| B03 | `ProductNarrationCoordinator.#knownBoundaries` survives profile refresh and run replacement. `#rememberBoundary` deduplicates exact ranges only. Piper's speech-expansion limits and Chatterbox's segmentation can produce overlapping ranges; navigation selects the adjacent stored entry rather than the next boundary of the active context. |
| B04 | `ReaderNavigationCoordinator.commitResolution` sets `chapter-too-large` and the presented chapter index while retaining the previous active locator/document. `ReaderPublication` then calls its normal settlement callback, and `App` passes that old locator to `settleExternalNavigation`, which can restart the previous playing intent. |
| B05 | `OpenedPublication.readBoundResource` requests a fresh resource operation, but archive reads still charge `beginArchiveEntryRead` on the original budget. `#observedUncompressedBytes` grows with every reread toward 512 MiB. Image unmount releases its source, not that counter, and the loader deliberately has no byte cache. |
| B06 | `download_at` checks cancellation before moving model files, then calls `promote`. `promote` invokes `verify_runtime`, whose file hashes do not receive the cancellation flag, and then installs the staged directory. The UI and `cancel_at` still accept cancellation during `Verifying`. |
| B07 | In `download_at`'s `Cancelled` arm, `clean_staging(root)?` can return before `clear_operation`. The worker finishes but snapshots continue to expose `Downloading`/`Verifying`; selection preserves that state and removal returns Busy. This requires a cleanup failure, such as a filesystem access error. |
| B08 | At a non-default rate, `AdaptivePcmPlayer.synchronize` can leave the scheduler playing while asynchronous worklet preparation has no playback handle yet. UI `canPause` derives from the scheduler state. `pause` rejects the missing handle/transition timer, and the coordinator turns that rejection into `audio-playback-failed`. |

The completed [reader/narration lifecycle plan](../completed/reader-narration-bugfixes.md)
and ADR-0056 concern earlier fixes. Preserve startup cancellation, awaited
backend disposal, fresh raster deadlines, and audible-anchored bounded
navigation already present in this base. Historical validation from that plan
does not validate these eight corrections.

## Scope and non-goals

Execute eight focused corrections sequentially, followed by combined
acceptance. Keep one source writer at a time: B01/B03/B04/B08 share desktop
owners, B02/B05 share publication lifecycle, and B06/B07 share the native
optional-package state machine. Individual completed edits remain provisional
until the combined checks and independent review pass.

Expected implementation areas are the files in the next section, directly
coupled production types, focused regression fixtures/tests, and current
behavior documentation. Freeze an exact path allowlist for each milestone
before editing; directory names below are navigation aids, not permission to
rewrite entire areas.

Out of scope:

- General refactoring, moving modules, and deleting the four unused-symbol
  candidates from the audit. Their production reachability does not establish
  that deleting their files is safe; the optional boundary-wait prototype is
  deliberately inactive.
- New TTS engines, voices, language detection, model weights, dependency
  upgrades, automatic engine fallback, or reopening deferred Qwen production
  work.
- Raising the 256 audio-unit limit, increasing retained PCM/text collections,
  persisting generated audio, caching whole books or image payloads, or changing
  narration wording to conceal a traversal defect.
- Relaxing ZIP/CRC/path/ratio/image validation, accepting corrupt package
  artifacts, or making cancellation delete a verified installed package.
- Changing shared wire schemas or protocol v1. If implementation exposes a
  genuine need, record the incompatibility and obtain a separately scoped,
  versioned contract decision before proceeding.
- Rewriting completed plans, frozen evaluation authorities, historical
  receipts, or generated sources by hand.

The planning commit allowlist is exactly this file and `README.md` in this
active-plan directory. Future execution does not inherit authorization to
commit implementation changes, push, or create a PR.

## Relevant files and documentation

Paths in this section are relative to the repository root.

| Responsibility | Production paths and symbols |
| --- | --- |
| B01: capacity and presentation | `apps/desktop/src/tts/adaptive-buffer-authority.ts`; `adaptive-buffer-scheduler.ts`; `adaptive-preparation.ts`; `AdaptivePreparationControls.tsx`; `ProductNarrationControls.tsx`; `product-narration-coordinator.ts` in the same directory |
| B02: stable source traversal | `packages/epub/src/narration/narration-source-window.ts`; `narration-preparation.ts`; `narration-work-controller.ts`; `narration-policy.ts`; `narration-prepared-segment.ts`; `narration-segment-packer.ts`; `packages/epub/src/locator/`; `packages/epub/src/resource/opened-publication.ts` |
| B03: segmentation context | `apps/desktop/src/tts/product-narration-coordinator.ts`; `apps/desktop/src/settings/narration-settings-actions.ts`; `packages/epub/src/narration/narration-piper-policy.ts`; `narration-chatterbox-policy.ts` |
| B04: navigation settlement | `apps/desktop/src/reader/reader-navigation.ts`; `ReaderPublication.tsx` in that directory; `apps/desktop/src/App.tsx`; `apps/desktop/src/tts/product-narration-coordinator.ts`; directly coupled synchronization and persistence callers |
| B05: resource accounting | `packages/epub/src/security/processing-budget.ts`; `ingestion-policy.ts` in that directory; `packages/epub/src/archive/archive-inventory.ts`; `packages/epub/src/resource/opened-publication.ts`; `apps/desktop/src/reader/images/publication-raster-image-loader.ts`; `SemanticRasterImage.tsx` |
| B06/B07: acquisition lifecycle | `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`, especially `verify_runtime`, `promote`, `download_at`, `cancel_at`, `clean_staging`, and operation snapshots; `apps/desktop/src/tts/optional-chatterbox-client.ts`; `OptionalChatterboxControls.tsx` |
| B08: asynchronous player preparation | `apps/desktop/src/tts/pcm-playback.ts`; `pcm-playback-contracts.ts`; `playback-backends/web-audio-pcm-playback.ts`; `playback-backends/incremental-wsola-v3.ts`; scheduler, coordinator, and UI projection above |
| Command and review authorities | `package.json`; `apps/desktop/package.json`; `packages/epub/package.json`; `.codex/agents/change-reviewer.toml`; `.codex/config.toml`; `AGENTS.md`; `.agents/PLANS.md` |

Read the relevant sections before execution:

- [Documentation index](../../README.md), [roadmap](../roadmap.md),
  [MVP](../../product/mvp.md), and [glossary](../../product/glossary.md).
- [Canonical system diagram](../../architecture/system-diagram.md) and
  [architecture overview](../../architecture/overview.md).
- [ADR-0007: secure EPUB ingestion](../../architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md)
  and [ADR-0010: raster decoding](../../architecture/decisions/ADR-0010-bounded-raster-image-decode.md).
- [Completed M005 plan](../completed/M005-narration-text-preparation.md),
  [ADR-0012](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md),
  [narration limits v1](../../architecture/narration-preparation-limits-v1.md),
  and current Piper/Chatterbox preparation policies.
- [Adaptive buffer authority v1](../../architecture/adaptive-buffer-authority-v1.md),
  [synchronization authority v1](../../architecture/synchronization-authority-v1.md),
  [playback authority v3](../../architecture/reader-settings-playback-authority-v3.md),
  and [ADR-0056](../../architecture/decisions/ADR-0056-bound-reader-narration-lifecycle-operations.md).
- [Chatterbox acquisition authority](../../architecture/chatterbox-official-acquisition-authority-v2.md)
  and [ADR-0046: native mutation ownership](../../architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md).
- [Independent change review](../../development/agentic-change-review.md) and
  [Git workflow](../../development/git-workflow.md).

The roadmap marks M005 complete. Use its source/range/lifecycle semantics as
constraints, not its historical test results as fresh evidence. This follow-up
must document any new traversal authority without rewriting that completed plan.

## Architecture and constraints

Keep EPUB preparation framework-independent, navigation settlement in the
reader/application boundary, audio ownership in the scheduler/player, and
optional-package mutations in the native manager. No new process, storage,
network origin, production dependency, or model contract is expected.

Preserve the following throughout the batch:

1. Book text, normalized narration, and generated audio remain local and
   ephemeral. Persist only already-approved bounded preferences and locators.
   Evidence contains synthetic inputs or content-free outcomes/counts.
2. Keep one active synthesis, zero service-queued synthesis, one prepared
   batch, 16 prepared segments, 256 audio units/metadata entries, and the
   existing sample-frame/byte ceilings. Capacity is never a startup promise.
3. Preserve identity-first invalidation, stale-result rejection, bounded
   shutdown, awaited backend disposal, and cancellation/close ownership.
   Playback-only Pause may continue bounded same-generation preparation under
   the existing product policy.
4. Keep source-frame progress, effective listening duration, actual audible
   starts, semantic transition pauses, and involuntary underruns distinct.
   Do not add a wall-clock startup delay or count worklet initialization as
   heard audio.
5. Preserve immutable semantic text, Unicode code-point locators, half-open
   block-local ranges, stable segmentation across batch sizes, and the complete
   containing-segment result for an interior start.
6. Retain per-entry observed/declaration checks, CRC, path containment, size and
   compression-ratio defenses, bounded raster decoding, one resource read,
   linked cancellation, and the per-resource deadline.
7. Keep Chatterbox's installed-package lock, exact artifact verification,
   containment, and atomic replacement. Acquisition cancellation must remain
   possible without waiting for that mutation lock.

Three behavior decisions must be recorded before their implementation:

- **B01 capacity escape:** use an explicit "Play available audio" action when
  a positive contiguous buffer is capacity-blocked below its target and no
  producer can make progress. Start the same generation and retain its queued
  audio. Keep the user's requested target and actual loaded duration visible;
  do not claim that the target was reached, silently lower it, or start a
  voluntarily paused session. Cover the equivalent refill state if it can
  reach the same deadlock. Document this additive transition separately from
  the frozen v1 threshold evidence.
- **B02 deep traversal:** prefer forward-only bounded windows and a bounded
  publication-owned resume checkpoint keyed by book/block, preparation profile,
  and language. A sequential continuation must not rescan the prefix. A cold
  deep seek must also work: a warm-cache-only fix is insufficient. The current
  16,384 inspected-code-point maximum is per public request; restarting a
  hidden budget or simply not counting skipped work violates that authority.
  Milestone 0 must determine whether a bounded seek/index strategy can preserve
  that limit and stable segmentation. If cold reconstruction needs more total
  work, first specify an additive versioned traversal policy with an explicit
  whole-operation ceiling derived from admitted semantic input, unchanged
  retained-state and yield/cancellation bounds, truthful measurements, and
  public compatibility consequences. Freeze its exact limits before coding.
  Do not resolve this tension by dropping deep-seek acceptance or making
  arbitrary-start segmentation unstable.
- **B04 failed placement:** represent successful and unavailable navigation
  settlement explicitly. A too-large chapter can remain the presented
  destination for its fallback and Previous/Next controls, but it must not
  become a successful placement of the old locator. Preserve the last valid
  persisted passage, terminate the obsolete play intent, and prevent narration
  initiation while the presented chapter is unavailable. A subsequent valid
  destination restores ordinary controls without unexpectedly restarting audio.

Use a new ADR or clearly scoped additive policy document for changed durable
behavior/accounting. Choose the next available ADR number during execution;
do not reserve or modify a historical authority merely to make new evidence
pass. Recheck the canonical diagram at closeout and edit it only if actual
ownership, persistence, or data-flow boundaries change.

## Milestones

### Milestone 0: Establish execution scope, reproductions, and policy decisions

Status: complete; baseline failures captured and execution decisions recorded in ADR-0057.

- Recheck branch, HEAD, clean/index state, source identities, and authorization.
  Preserve any intervening user work; do not reset, clean, stash, or amend it.
- Once test work is authorized, inspect relevant existing tests and harnesses,
  then add focused permanent regressions for B01-B08. First capture failure
  against unchanged production code in normal host PowerShell. A test that
  asserts today's bug is not an acceptance test.
- Resolve and document the three decisions above. For B02, include cold and
  warm traversal complexity, exact retained-state bounds, complete source-work
  accounting, and compatibility. If a versioned policy is necessary, make it
  part of the implementation allowlist and independent review.
- Record exact source IDs, commands, environment, exit statuses, and
  content-free results. Classify any non-reproducing case and investigate its
  actual preconditions before changing code.
- Confirm the required `change_reviewer` role/model can be used for final
  acceptance. Its configuration exists; this planning task did not start it.

Acceptance: all eight regressions have a concrete trigger and expected result,
baseline failures are attributed, and policy decisions are explicit. No
implementation acceptance is claimed.

### Milestone 1: Resolve capacity-blocked preparation (B01)

Status: complete; regressions, integration gates and independent R5 acceptance pass.

- Derive capacity-blocked state from authoritative reservation/resource and
  playback state, distinguishing it from target reached, work in progress,
  end of range, failure, and user Pause.
- Add the explicit same-generation capacity escape in the scheduler and route
  it through coordinator/presentation/controls. Keep admission checks in the
  owner rather than only disabling a UI button.
- Ensure consumption releases capacity and bounded production resumes. Keep
  requested-target reporting truthful and discard no queued audio.

Acceptance: a 600-second target with 256 two-second units cannot leave the
user waiting indefinitely without an actionable escape. The action starts
available audio; full-target and complete-short-range startup remain automatic.
Zero audio, stale identities, stopped/failed sessions, and voluntary Pause do
not bypass their guards. All resource maxima still reject maximum plus one.

### Milestone 2: Make long-block continuation and deep starts bounded (B02)

Status: complete; focused and integrated host gates pass with independent R5 acceptance.

- Implement Milestone 0's traversal decision, preserving the normalizer and
  stable packer outputs. Advance source traversal without restarting each
  window at zero; retain only explicitly bounded cursor/checkpoint state.
- For sequential calls, resume from a verified compatible boundary. For cold
  starts or invalidated context, reconstruct under the explicit work authority
  without silently skipping earlier segmentation context.
- Account for checkpoint/index construction, scanned/skipped input, retained
  references, partial normalization/packing state, and cancellation. A sparse
  index must itself have a justified entry/memory bound.
- Clear or invalidate traversal state on incompatible profile/language changes,
  cancellation as required by its ownership contract, and publication close.
  Failed work publishes no partial sensitive result.

Acceptance: synthetic paragraphs beyond 16,384 code points work from the
beginning, through repeated batches, and from deep cold/restored starts.
Different legal batch sizes produce the same concatenated text/ranges, with no
missing/duplicated source. Include nested inline context, astral/combining
characters, protected tokens, omitted source, and cancellation during seek.
Illegal oversized atomic tokens retain their documented failure behavior.

### Milestone 3: Scope navigation history to segmentation context (B03)

Status: complete; focused and integrated host gates pass with independent R5 acceptance.

- Define the context from the actual preparation profile/policy and language,
  plus publication identity. Clear incompatible stored boundaries and current
  range references before admitting new work.
- Cover both settings-driven refresh and the context selected at run startup;
  do not rely on one UI path being the sole way a profile changes.
- Preserve the 64-entry audible-anchored limit and useful history for compatible
  same-context pause/seek/restart. Volume/rate changes alone do not invalidate
  segmentation.

Acceptance: use prose whose Piper and Chatterbox boundaries actually differ.
After an engine/language change, Next moves beyond the new current segment and
Previous addresses a valid current-context predecessor. Old callbacks cannot
repopulate the history. The existing more-than-64 navigation behavior remains
correct.

### Milestone 4: Propagate unsuccessful chapter placement (B04)

Status: complete; focused and integrated host gates pass with independent R5 acceptance.

- Carry a typed settlement outcome from reader navigation through
  `ReaderPublication` and `App` to narration/persistence consumers.
- Implement the unavailable-chapter policy above; keep the presented chapter,
  last valid locator, reader fallback, control availability, and saved position
  internally consistent.
- Preserve successful chapter/link/explicit-leaf navigation, reflow semantics,
  and initial restoration handling. Do not interpret a failed placement as an
  implicit request to resume the old chapter.

Acceptance: playing-to-too-large, paused-to-too-large, repeated unavailable
targets, initial restoration into an oversized chapter, and navigation back
to a renderable chapter have explicit outcomes. No stale audio starts, no old
locator is saved as a successful new destination, and keyboard/fallback
navigation remains usable.

### Milestone 5: Separate archive admission from repeat resource work (B05)

Status: complete; focused and integrated host gates pass with independent R5 acceptance.

- Keep publication-wide declared archive admission and initial ingestion
  checks. Give each lazy resource read complete bounded work/output accounting
  instead of adding every reread to a permanent lifetime quota.
- Prove why global archive safety remains intact: declared total/ratio
  preflight, every read's observed size against the exact entry declaration,
  CRC, per-entry/output/ratio ceilings, and one active bounded read still apply.
  Any retained unique-entry ledger must be metadata-only and entry-count bounded.
- Preserve fresh per-read deadlines and abort linkage. An aborted/failed read
  cannot poison subsequent valid reads or publish partial bytes.
- Do not introduce an image byte cache or change DOM/decode source ownership.

Acceptance: repeated valid reads and chapter revisits succeed after cumulative
historical traffic exceeds a stricter synthetic aggregate limit, while exact
and over-limit archive admission and individual read cases remain enforced.
Malformed sizes/ratios/CRC, cancellation, delayed first reads, concurrent-read
rejection, and publication close remain contained. Live images/pixels and URLs
return to their established bounds after chapter changes.

### Milestone 6: Cancel through final native verification (B06)

Status: complete; focused and integrated host gates pass with independent R5 acceptance.

- Thread the acquisition cancellation token through final model/runtime
  verification and bounded hashing loops. Check it after waiting for the
  installed-runtime lock and before the installation commit point.
- Define a linearization point between accepting cancellation and committing
  the verified staged directory. Exactly one outcome wins; a late cancel must
  report the actual completed state rather than claim cancellation succeeded
  while installing anyway.
- Keep installed-runtime verification callers that have no acquisition token
  correct. Preserve size/hash/file-set validation, containment, backup/restore,
  and the shared mutation lock.
- Reflect cancellation availability/outcome truthfully in native snapshots
  and Settings if the chosen commit-point representation requires it.

Acceptance: cancellation during final hashing and immediately before commit
leaves the previous installation intact and the new candidate uninstalled.
A cancel after commit does not remove the installed package or lie about the
outcome. Snapshot polling stays responsive; corruption still rejects promotion.

### Milestone 7: Settle cleanup failures into recoverable terminal state (B07)

Status: complete; focused and integrated host gates pass with independent R5 acceptance.

- Ensure every completed acquisition worker settles operation ownership even
  when cleanup itself fails. Handle cleanup errors before returning rather
  than bypassing terminal state through an early `?`.
- Expose a fixed cleanup-failure state, retain enough bounded ownership
  information for safe cleanup/retry, and clear the active cancellation handle.
- Permit retry/removal after the filesystem problem is corrected; do not report
  successful cleanup or absent staging while files remain. Reuse containment
  checks and reject operations against another live worker.

Acceptance: inject cleanup failure after acknowledged cancellation. The worker
returns, snapshots become terminal rather than permanently busy, and a later
safe retry/removal succeeds. Cover successful cleanup, repeat cancellation,
concurrent commands, and preservation of an already verified installation.
No cleanup path can escape the managed package/staging root.

### Milestone 8: Preserve Pause through asynchronous rate preparation (B08)

Status: complete; focused and integrated host gates pass with independent R5 acceptance.

- Treat pending backend preparation as a valid owned player state for pause
  and resume; do not require an already-created playback handle for that case.
- Record user intent before asynchronous completion can start a unit. Resume
  may await preparation; Stop/close/replacement invalidates it and releases
  any late-created worklet/backend resources.
- Preserve selected/pending/active rate semantics, source-frame accounting,
  pitch policy, semantic waits, and the direct `1.00x` path.

Acceptance: hold first non-default preparation pending, press Pause, resolve
preparation, and observe no sound or playback failure until explicit Resume.
Repeat at a later rate boundary, with stop/close/seek, a genuine preparation
error, and rapid rate changes. No stale callback starts audio and no frames
are counted as heard during preparation.

### Milestone 9: Integrate, document, independently review, and close

Status: complete; focused and integrated host gates pass with independent R5 acceptance.

- Run combined regressions across preparation, navigation, rate changes,
  resource rereads, and acquisition cancellation/cleanup. Use the gate matrix
  below; establish fast correctness before expensive builds or model setup.
- Update maintained product/architecture documentation for the actual behavior
  and new decisions. Review the M005 boundary/terminology and canonical
  diagram; preserve historical plans and evaluation evidence.
- Obtain `change_reviewer` (GPT-6 Astra high) approval for the exact combined
  patch under `docs/development/agentic-change-review.md`. Provide the request,
  acceptance criteria, complete diff/new files, base/HEAD, closed reviewed-path
  identities, and attributable host results. The reviewer does not edit,
  execute tests, or delegate. Keep source writes and Git mutations idle while
  it reviews; resolve actionable findings and obtain a new report after drift.
- A missing reviewer, required gate, runtime prerequisite, or unresolved policy
  decision remains explicitly pending/blocked. A report or green historical
  CI does not substitute for current evidence or authorize Git actions.
- Once all required outcomes pass, move this plan to `completed/`, update plan
  indexes/incoming links, and record exact validation/review identities. Leave
  implementation changes uncommitted unless separately authorized.

## Testing and benchmark strategy

No commands in this section were executed during planning. Existing test files
were not inspected; the matrix describes required behavior and does not assert
that the current suite covers it. Inspect and extend the smallest relevant
suite only after test work is authorized.

All test, type, lint, format, build, browser, native, hardware, and package
validation must run from normal local PowerShell **outside the managed
automation sandbox**, as required by `AGENTS.md`. Record working directory,
exact command, source identities, environment/dependency identities, exit code,
result, cleanup, and limitations. A sandbox-only failure or pass is not final
acceptance evidence.

The following commands exist in the checked-in package configuration at the
planning base. Run from the repository root; recheck scripts/pins at execution.
Do not invent narrower flags or assume uninspected harness capabilities.

| Gate | Existing command(s) | When and purpose |
| --- | --- | --- |
| TS readiness | `pnpm run build:packages`; `pnpm run format:check:typescript`; `pnpm run lint:typescript`; `pnpm run typecheck:typescript` | Establish the applicable baseline and validate affected TS changes before browser/native preparation. |
| EPUB regressions | `pnpm --filter @voxleaf/epub test` | Before/after B02/B05; stable ranges, cold/deep continuation, accounting, security, and lifecycle. |
| Desktop regressions | `pnpm --filter @voxleaf/desktop test` | Before/after B01/B03/B04/B08 and acquisition presentation changes. Add controlled asynchronous and cross-owner cases to the applicable suite. |
| Native static checks | `pnpm run format:check:rust`; `pnpm run lint:rust` | Before expensive native/package work after B06/B07. Clippy covers ordinary and release-locked configurations. |
| Native regressions | `pnpm run test:rust` | Before/after B06/B07; both configured feature modes, bounded synthetic files, cancellation/commit races, and cleanup failure injection. |
| Browser integration | `pnpm run test:browser` | After affected desktop/EPUB units are integrated; actual control/state settlement, image release/reload, and asynchronous player behavior. |
| Combined repository gate | `pnpm run check` | Once the combined production/docs/regression patch is ready. Includes configured evidence, format, lint, types, tests, and builds. |
| Packaged WebView2 | `pnpm run test:native-startup` | After relevant native/frontend inputs are finalized. Existing smoke alone is insufficient: extend the appropriate synthetic coverage for these scenarios during execution. |
| Optional-package host readiness | `pnpm run package:windows:ordinary-chatterbox:preflight` | Before an ordinary acquisition journey; report host/package prerequisites before attempting costly downloads or installs. |
| Release candidate, when validating installed behavior | `pnpm run package:windows`; `pnpm run package:windows:check` | Rebuild/check the exact candidate used for the installed B06/B07 journey; record its identities. Building does not authorize publishing it. |
| Ordinary acquisition integration | `pnpm run package:windows:ordinary-chatterbox` | On a suitable host with authorized acquisition/installation work. Add or supplement the specific final-verification and cleanup-failure scenarios; a generic journey pass is not proof of them. |

Do not run every listed command after every file edit. Use the affected gate
for each milestone and the final combined gate. Repeat a passed check only
when relevant code, dependencies, configuration, environment, or an unresolved
failure invalidates it. Keep focused evidence and final integrated evidence
distinct; never transfer results to different source identities silently.

Mandatory scenario evidence, independent of the command runner:

- **B01:** all four prepared targets; capacity below target; ordinary target
  arrival; complete short range; zero buffer; paused intent; invalidation;
  capacity escape followed by production/consumption under the same ceilings.
- **B02:** long legal paragraph, continuous batches and cold deep locator;
  batch-count independence; supported ES/EN preparation profiles; Unicode,
  inline context, omissions/protected tokens; work/retention accounting;
  cancellation and close. Test adversarial source rather than allocating or
  retaining a whole book as a workaround.
- **B03/B04:** unequal segmentation before/after engine/language changes;
  more than 64 boundaries; playing/paused failed chapter navigation; persistence,
  highlighting, restored and explicit targets; later valid navigation.
- **B05:** delayed first read, repeated resource/chapter reads beyond a lowered
  synthetic historical-traffic threshold, malformed/oversized archives and
  resources, ratios/CRC, cancellation/retry, concurrent read, close, and URL
  release. Production maxima are not lowered or raised for the fixture.
- **B06/B07:** deterministic barriers during verification, before commit, and
  after commit; lock contention; corruption; cleanup failure; retry/removal;
  polling and command races; preservation of the old installed tree.
- **B08:** deferred worklet preparation with Pause/Resume/Stop/close/seek,
  successful and rejected preparation, rapid rate selection, subsequent unit
  transitions, truthful audible progress, and resource release.

Use repository-authored synthetic content and controlled ports/clocks for
deterministic regressions. B01/B03/B08 correctness and B06/B07 fault handling
must not depend on model timing, a network failure, an 8-GB download, or random
filesystem contention to reproduce.

For actual WebView2/audio acceptance, exercise saved `0.75x` startup, Pause
during initialization, resume, rate changes, profile/language changes, and
navigation with the corrected build. Exercise Piper and Chatterbox in Spanish
and English on admitted hosts. Keep tests sequential where GPU/process/package
ownership is shared. Existing broad exact-host scripts can include deferred
Qwen arms; inspect their selectors only during authorized execution and do not
run them blindly or reopen Qwen qualification. If no registered focused command
exists, record the exact manual supported-profile procedure and evidence, or
add a narrowly scoped harness entry during execution before claiming an
automated gate exists.

Measure actual cancellation response and cleanup, command-to-audible time,
underruns, work/retention, and rate-preparation behavior without text/audio
payloads. Existing documented thresholds remain authoritative; hypothetical
fixtures and controlled promises are not hardware latency measurements.
Restore any temporary host setup, preserve user-owned installed data, and
record cleanup before calling a host journey complete.

## Risks and rollback

- **Policy drift:** B01's escape, B02's possible traversal policy, and B05's
  accounting scope require explicit documentation. Do not change frozen
  evidence, raise unrelated limits, or use a new label to hide an old unbounded
  operation. Unresolved policy prevents acceptance of the affected milestone.
- **Incorrect partial B02 repair:** a warm checkpoint alone can hide the cold
  seek failure; an offset jump alone can change stable segmentation. Both paths
  must meet the same text/range contract and explicit work bounds.
- **Cross-owner races:** clearing history, failed settlement, pause preparation,
  and final package cancellation can affect newer sessions. Include old/new
  identity and delayed-result cases and retain one writer.
- **Security regression:** repeated-resource reads must preserve every actual
  decompression/CRC/ratio defense. Cancellation must not bypass verification or
  delete a verified installation. Review these changes as behavior/security
  boundaries, not cosmetic refactoring.
- **Unrecoverable cleanup:** surface exact fixed failure categories and settle
  ownership; do not retry forever, delete unrelated files, or report cleanup
  success without evidence.
- **Expensive host work:** run cheap checks first, state prerequisites, and
  diagnose a failure before retrying. Avoid repeated downloads/builds without
  an input change or a concrete hypothesis. Missing hardware is missing
  evidence, not proof of a defect or success.

Before each unit, record exact base and touched paths. Keep changes focused so
an authorized rollback can revert only that unit and its documentation/tests.
Do not automatically reset or restore user edits. For native installation,
retain the existing atomic backup/restore behavior until successful commit;
cancel before that boundary by cleaning only operation-owned staging. A later
regression must retain the failed result and trigger new validation/review;
do not erase it or renew approval by replacing hashes.

## Progress log (historical)

Execution on 2026-10-20 began on `codex/reader-narration-acquisition-bugfixes`
at `4e3f3616a3c9601bc2364913819cf0609a1c0230`, with an empty worktree/index
and the planning commit verified as an ancestor. The source-only audit had
not run tests; execution subsequently reproduced all eight defects.

- Milestone 0 red baselines: `pnpm --filter @voxleaf/desktop test`, exit 1,
  B01/B03/B04/B08 fail and 767 pass; `pnpm --filter @voxleaf/epub test`,
  exit 1, B02 Piper/Chatterbox and B05 fail with 661 passing tests;
  `pnpm run test:rust`, exit 101, B06/B07 fail with 101 passing and one
  ignored subprocess fixture. Rust short-circuited before release-feature
  tests. B04's incorrect locator-field assertion was corrected before its
  genuine failing reproduction. Logs: `m0-{desktop-r2,epub,rust}.log` under
  local/ignored `tmp/reader-acquisition-evidence/`.
- Test-only native hash/transport hooks exercised actual promotion under its
  mutation lock and a cancelled worker with a Windows sharing violation.
  These baseline cases required neither network nor model files.
  ADR-0057 records the B01/B02/B04 policy decisions.
- Staged desktop results were provisional: B01 passed startup/refill across
  four targets, FIFO release, paused/invalidation guards and same-generation
  coordinator cases (`m1-desktop.log`, exit 1 only for B03/B04/B08; 774 pass).
  B03 then passed the real settings stop-before-switch path; its red baseline
  observed stale offset 12 instead of 24 (`m3-baseline-desktop.log`).
  `m3-desktop.log` had 775 passes with B04/B08 pending; `m4-desktop.log`
  had 778 passes with only B08 pending. B08's `m8-desktop.log` passed deferred
  success/rejection, Pause/Resume, rapid rates and late Stop/close/seek cleanup.
- B02's cold/warm Piper/Chatterbox ES/EN matrix passed containing-segment
  equality, batch-size 8/16 independence, Unicode and abort/close cases;
  `m2-epub-matrix.log` exited 1 only for pending B05 (667 passes).
  B05's `pnpm --filter @voxleaf/epub test` then passed 33 files/668 tests
  (`m5-epub.log`), preserving security, delayed-read and lifecycle defenses
  without image caching or higher limits.
- `m6-rust.log` exited 101 only for B07 (104 passes/one ignored), while final
  hashing cancellation, commit outcomes and cancellation during the runtime
  lock passed. `m7-rust.log` then passed both configurations: 105 ordinary/
  104 release-locked, one ignored each, including cleanup retry after lock release.
- Independent R1 `reader-narration-acquisition-bugfixes-r1-astra-20261020-01`
  was BLOCKED; 1,320 paths and HEAD matched before/after review, manifest SHA-256
  `69a5db2a2120573943e3cfc93364bc45a5bff04cde32dc195d8254916ebbf0f9`.
  It found B02 structural prefix rescans and B04 automatic-follow settlement
  bypass, plus missing final audio/installed and browser identity evidence.
  `review-r2-red.log` reproduced 6,000 additional work units for 1,000 blocks
  against a 4,000 assertion; `review-r2-desktop-red.log` reproduced B04.
  Both exited 1 before correction. Indexed ancestor/inline checkpoints and
  automatic unavailable settlement corrected these findings, with quote/list,
  window equivalence, highlight removal and valid-chapter recovery regressions.
- Host tools: PowerShell, Node 24.20.0, Cargo 1.97.1, uv 0.11.29. The inherited
  pnpm 11.25.0 was replaced per job by the pinned 11.15.1 Corepack shim.
  `pnpm run build:packages` passed before production edits. Later execution
  distinguished ordinary host identity 15700 from inherited MSIX virtualization.

| Milestone | Final state | Accepted evidence |
| --- | --- | --- |
| 0: baseline/decisions | Complete | Attributed red regressions and frozen decisions |
| 1: B01 | Complete | Capacity escape and preserved admission/intent |
| 2: B02 | Complete | Cold/warm continuation, stable ranges, work/bounds proof |
| 3: B03 | Complete | Context invalidation and bounded valid navigation |
| 4: B04 | Complete | Typed failure settlement, playback and persistence |
| 5: B05 | Complete | Repeat reads plus unchanged security/lifecycle defenses |
| 6: B06 | Complete | Cancellation/commit linearization and installed-tree preservation |
| 7: B07 | Complete | Terminal failure and safe retry/removal |
| 8: B08 | Complete | Pause/resume through async preparation and stale cleanup |
| 9: integrated acceptance | Complete | Four real-model arms, installed acquisition, restoration and R5 approval |

## Discoveries and decisions

1. This is an eight-defect correctness batch, not the earlier four-defect
   lifecycle plan and not a safe-refactor campaign.
2. The initial static verification established the failure paths and their
   conditions. The execution progress and validation sections below record
   subsequent reproductions, measurements, and acceptance evidence.
3. B01 is P2: it blocks a preparation but Stop can recover control. The planned
   remedy exposes an explicit capacity escape without weakening admission.
4. B02's stable cold-start segmentation required an explicit additive traversal
   authority. Milestone 0 resolved it in ADR-0057; rescans remain accounted.
5. B05 is a lifetime work-accounting defect, not evidence of leaked image RAM.
6. B06 needs a defined cancellation/commit race outcome. B07 applies only when
   cleanup fails and requires terminal state even on that error path.
7. The unused-symbol candidates are excluded. No deletion is authorized by
   this plan.
8. Current production priority remains Piper/Chatterbox. Role configuration
   specifies `change_reviewer` as GPT-6 Astra high; configured availability is
   not proof that a live reviewer has approved anything.
9. Existing command definitions were read to avoid invented validation commands.
   Reading them alone did not establish test coverage or authorize execution.

## R3 ordinary-host validation (cleanup and review subsequently closed below)

The continuation verifies `GetCurrentPackageFullName` returns `15700` in
each host launcher before executing commands. This distinguishes ordinary
Windows execution from a sandbox escalation that still inherits the Codex
MSIX package identity. The working directory is the repository root;
PowerShell 7.6.5, Node 24.20.0, and pinned pnpm 11.15.1 are recorded in the
ignored `tmp/reader-acquisition-evidence/` receipts. Commands using the
repository's Windows PowerShell 5.1 builder also remove the parent process's
`PSModulePath` from that isolated job so 5.1 loads its own system modules.
No global environment setting is changed.

- `pnpm run check`: exit 0, `r3-combined-final.log` (fresh combined run after
  installed-journey diagnostics, superseding `r3-verified-check.log`).
  All configured evidence,
  format, lint, type, test, and build checks pass: 209 shared, 672 EPUB, 786
  desktop, 81 desktop script tests, 107 ordinary/106 release-locked Rust tests,
  and 586 Python tests. Each Rust mode has two intentionally ignored fixtures,
  including the separately invoked installed-host diagnostic. The pytest
  cache-write warning and Vite's large-bundle warning remain nonfatal.
- `pnpm run test:browser`: exit 0, `r3-final-browser.log`, nine tests pass.
  `pnpm run test:native-startup`: exit 0, `r3-final-native.log`; WebView2,
  process cancellation/recovery, reader ingress, persistence, local images
  and synchronization pass with no external requests or application errors.
- `pnpm run test:tts:reader-corrections-host`: exit 0,
  `r3-final-audio.log`. Piper ES/EN and Chatterbox ES/EN all pass, using
  synthetic text, offline inference settings and outbound interpreter blocks.
  The first Chatterbox failure was caused by MSIX path virtualization; the
  containment verifier correctly rejected a mixed physical/virtual tree.
  Running the unchanged verifier in the ordinary host resolves that rejection.
  A subsequent measurement-fixture failure was corrected by keeping the six
  speed samples inside a synthetic paragraph. Actual EPUB preparation proves
  sentence boundaries before measurement; the overhead threshold is unchanged.
  `r3-speed-fixture-red-c.log` captures the failing regression and
  `r3-speed-fixture-green.log` records all 22 harness tests passing.

| Real-model arm | Command to audible | Initial playable lead | Cancellation | AudioContexts closed/created |
| --- | --- | --- | --- | --- |
| Piper ES | 5,229 ms | 21,505 ms | 239 ms | 6/6 |
| Piper EN | 4,669 ms | 23,626 ms | 224 ms | 5/5 |
| Chatterbox ES | 32,650 ms | 18,840 ms | 299 ms | 5/5 |
| Chatterbox EN | 32,411 ms | 16,640 ms | 298 ms | 5/5 |

All four arms report zero underruns, zero buffering seconds per playback
minute, zero external requests, zero generated audio files, and zero retained
or discarded units after cleanup. They exercise all six rates, prepared
targets, navigation/restart, deferred initialization, Pause/Resume and stale
playback cleanup. These results do not claim instantaneous generation:
Chatterbox EN's measured seek restart is 79,329 ms and chapter restart is
31,823 ms. No model or performance limit was changed to admit the results.

- `pnpm run package:windows` initially fails before installation with
  `piper-core-runtime-manifest-stale` (`r3-package.log`). The development
  environment's four wheel RECORD files and service docstrings differ from
  the frozen core authority; they are unrelated to this desktop correction.
  The existing core tree/archive pass `pnpm run package:piper-core:check`
  (`r3-core-check.log`). The explicit `package:windows:verified-core` command
  verifies that frozen payload before invoking the existing Windows builder.
  It neither updates the authority nor bypasses payload integrity checks.
- `pnpm run package:windows:verified-core`: exit 0,
  `r3-verified-package-c.log`, after correcting the isolated PS5 module
  environment. The unsigned local installer SHA-256 is
  `ee582e01b94a8e66457cf22e9c75026ebf7d04b527e6d640923230391e50e262`;
  raw build executable SHA-256 is
  `100f36ef49e4c259026fd34ea0bede7835db88f8eb3a2d330f9033a0c066f17b`.
  Tauri's NSIS bundle replaces the unique three-byte bundle marker `UNK`
  with `NSS`. The in-memory transformation at token offset 9,127,258
  reproduces the installed executable SHA-256 exactly:
  `7ab4ac5e2e524bfc61f7c72c883c812afcd5b9995e74b58e628e4aff5906da0a`.
  `r3-nsis-identity.json` verifies both identities against the journey receipt
  without modifying either binary.
  Copies and generated candidate evidence are retained locally; the tracked
  historical package receipt is restored unchanged. No signing or antivirus
  acceptance is claimed.
- The first installed `package:windows:reader-corrections` attempt
  (`r3-installed-journey.log`) passes the B06/B07 OS-handle fault stages but
  fails the subsequent full-acquisition retry with
  `tts-optional-profile-cleanup-failed`. This is not a journey pass.
  Its finally cleanup and outer restoration pass: the aggregate SHA-256 of
  all original data files, registry exports and
  shortcuts match the backup. A separate audit verifies startup registration,
  absence of the test installation and absence of application processes.
  `r3-preservation.json` and `r3-restoration-audit.json` retain this evidence.
  A new attempt adds content-free fixed-path failure diagnostics before
  restoration; the failure does not recur with the same installed candidate.
  Its cause remains unconfirmed, and the failed attempt is retained.
- `pnpm run package:windows:reader-corrections --receipt
  tmp/reader-acquisition-evidence/r3d-installed-journey.json`: exit 0,
  `r3d-installed-journey.log`. All 17 ordinary installed steps pass, including
  clean/hostile-environment preflight, download cancellation, full retry,
  Chatterbox ES/EN, restart/discovery, removal, Piper ES/EN after removal,
  optional-package reinstallation and uninstall. The supplemental
  `r3d-installed-journey.json.corrections.json` records B07's terminal
  cleanup failure, admitted retry and subsequent cleanup; B06 final-verification
  cancellation returns in 4 ms, prevents promotion and removes staging.
  Cancellation after committed installation preserves Installed. These real
  OS-handle scenarios complement the native deterministic commit/lock tests.
- Installed Chatterbox ES/EN starts in 39,748/31,446 ms and cancels in
  300/296 ms; installed Piper ES/EN starts in 4,697/4,694 ms and cancels in
  259/256 ms. All four report zero underruns, external requests, generated
  audio files and retained/discarded units after cleanup; every created
  AudioContext closes.
- `r3d-preservation.json` and `r3d-restoration-audit.json` confirm byte-identical
  original application data and restored registry, shortcuts and startup
  registration. The test installation and application processes are absent.
- `pnpm run test:chatterbox:installed-integrity`: exit 0,
  `r3d-integrity-restored.log`; the restored original runtime passes its
  canonical-root, full-tree and complete SHA-256 checks in 137.78 seconds.
  `pnpm run package:windows:check`: exit 0, `r3d-package-check.log`.
  The final combined check also passes and
  `r3d-restoration-final-audit.json` verifies unchanged data afterward.
  Temporary firewall-rule removal is blocked: the elevated launch returns
  Windows "operation cancelled", and an ordinary-host read confirms the two
  task-owned rules remain. No existing firewall rule was changed. OS elevation
  had not completed despite the operation being authorized. Data restoration
  is complete. Independent R3 review
  `reader-narration-acquisition-bugfixes-r3-astra-20261020-01` is **BLOCKED**
  solely by this incomplete host cleanup; it identifies no new actionable code
  defects. Its local-only immutable report, ID
  `reader-narration-acquisition-bugfixes-r3-astra-20261020-01`
  (`review-r3-report.md`),
  confirms all 1,324 source identities and 380 evidence artifacts at
  2026-10-20 20:56:28 UTC. Remove only
  `VoxLeaf.ReaderCorrections.20261020.Chatterbox` and
  `VoxLeaf.ReaderCorrections.20261020.Piper`, verify their absence and absence
  of test processes in an ordinary host session, then obtain a new independent
  report. The expired UAC attempt is not an active administrator prompt.
  R3 was blocked at that checkpoint; the final closeout below records resolution.

## R2 validation results (historical)

R2 was a provisional candidate. Its escalated commands inherited MSIX
virtualization and did not establish ordinary-host acceptance; the R3
continuation supersedes them. Node 24.20.0/pnpm 11.15.1 were used at the
execution HEAD above, with unstaged changes and no Git mutations.

- `pnpm run check` passed (`review-r2-check.log`): evidence/13 evidence tests,
  format/lint/types/builds, 209 shared, 672 EPUB (34 files), 786 desktop (59
  files), 77 desktop script, 586 Python, 107 ordinary/106 release-locked Rust
  tests, one ignored fixture per Rust mode. Coverage included nested-inline/
  structural cold/warm traversal, maximum-plus-one work, unequal segmentation
  and App's obsolete-position-save rejection. Earlier missing Node URL and
  cross-project static imports were corrected; failed logs remain retained.
- `pnpm run test:browser` passed all nine cases (`review-r2-browser.log`),
  including 256-unit capacity and deferred AudioWorklet Pause/Resume/seek/
  repeat Stop/disposal. Synthetic service behavior is not model proof.
  `pnpm run test:native-startup` passed (`review-r2-native.log`): WebView2,
  cancellation/recovery, ingress, geometry, persistence, images and sync, with
  no errors/external requests. Pytest cache and Vite bundle warnings were nonfatal.
- `pnpm run package:windows:check` passed (`review-r2-package-check.log`);
  readiness alone did not validate an installed journey.
  `package:windows:ordinary-chatterbox:preflight` failed, exit 1,
  `preflight-artifact/resource-missing` (`m9-acquisition-preflight.log`):
  occupied ordinary root/missing current resources. Existing data was preserved.
- `pnpm run test:tts:reader-corrections-host` exited 1 (`review-r2-audio.log`).
  Piper ES/EN passed: audible 5,199/5,311 ms, playable lead 21,598/18,539 ms,
  cancellation 199/387 ms, AudioContexts 6/6 and 5/5 closed. Both exercised six
  rates, prepared targets, navigation/restart and Pause/Resume, with zero
  underruns, buffering, external requests, audio files and retained/discarded
  cleanup units. Chatterbox failed selection with `installed-package-invalid`
  before inference; this was neither a model failure nor a four-arm pass.
- Read-only diagnostics matched the runtime manifest, all 13,089 file
  sizes/hashes, case-sensitive inventory and no reparse entries. They did not
  explain the native rejection or replace installed acquisition/fault evidence.
- Independent R2 was requested as
  `reader-narration-acquisition-bugfixes-r2-astra-20261020-01`; its receipt is
  **local-only**, `review-r2-report.md`, and no approval was claimed at that
  checkpoint. R1's findings had been corrected and affected gates renewed.
  Logs and `*-inputs.json`/`*-meta.json` retained command, HEAD, SHA-256 source
  inputs, tools, times and exits under `tmp/reader-acquisition-evidence/`.

## Final closeout — 2026-10-20

All eight corrections and required host acceptance gates are complete.
A subsequent elevated cleanup succeeded. The ordinary-host launcher `r3-firewall-cleanup-02` records Windows
package identity `15700` and exit 0. `r3-firewall-Remove.json` records removal
of only the two task-owned rules at 21:42:24 UTC; `r3-host-cleanup-audit.json`
confirms their absence and no installed test processes at 21:42:25 UTC.
No other firewall rule was changed. Original data, registry, shortcuts and
startup registration retain the verified restoration recorded above.

Independent report `reader-narration-acquisition-bugfixes-r5-astra-20261020-01`
is **APPROVE**, with no actionable findings and no required evidence pending.
Its local-only immutable receipt (`review-r5-report.md`), bound to that report ID,
verifies the complete 1,324-path R4 candidate and all 380 R3 evidence artifacts
at 21:43:05 UTC. R3/R4 BLOCKED reports remain historical and unchanged.
The first installed cleanup failure remains an observed, non-reproduced event
with an unconfirmed cause; the same candidate subsequently passes all 17 steps.

Runtime results are reused by exact source identity for the documentary
closeout, not represented as newly executed tests. `pnpm run check:evidence`
and `git diff --check` are renewed after this move and maintained-link updates.
The final exact documentary review is retained outside its own source manifest
as a local-only immutable receipt (`review-r6-report.md`),
ID `reader-narration-acquisition-bugfixes-r6-astra-20261020-01`; acceptance of
that final patch depends on its recorded verdict and identity recheck.
The canonical system diagram remains accurate because no major component,
process, persistence responsibility or dependency topology changed.

Branch and HEAD remain `codex/reader-narration-acquisition-bugfixes` /
`4e3f3616a3c9601bc2364913819cf0609a1c0230`; the index is empty. No commit,
push, PR, publication or branch mutation was performed. No Qwen inference,
dependency upgrade, raised capacity limit or frozen-authority rewrite occurred.
