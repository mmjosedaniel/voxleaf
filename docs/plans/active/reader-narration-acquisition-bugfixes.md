# Reader, narration, and optional acquisition bug fixes

Created: 2026-10-20.
Status: planning complete; implementation and runtime validation not started.
Execution branch: `codex/reader-narration-acquisition-bugfixes`.
Planning base: `f683a6eae77a7bac60a8f58f7e0af014bde27815`.

## Goal

Correct the eight defects identified by the source-only audit and subsequent
verification of the EPUB, reader, narration, playback, and optional Chatterbox
acquisition paths. This plan spans existing M003/M004, M005, M008/M009, M010.2,
and M011 responsibilities; it does not introduce a new roadmap milestone.

The current user authorization is limited to creating this plan, its active
index entry, a dedicated branch, and one local planning commit. Production
code, test files, fixtures, dependencies, and generated sources are outside
this planning change. Implementation requires a later execution request.
Push, publication, and a pull request are not authorized.

The user prohibited inspecting and running tests during the investigation.
That restriction remains in force for this planning task. The regression
matrix and commands below describe future work, not checks already performed
or coverage already established. An execution request must permit the
necessary test inspection, additions, and host execution before the
implementation can satisfy repository acceptance; if the restriction remains,
record acceptance as blocked rather than silently bypassing it.

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

## Current state

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

Status: not started.

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

Status: not started.

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

Status: not started.

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

Status: not started.

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

Status: not started.

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

Status: not started.

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

Status: not started.

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

Status: not started.

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

Status: not started.

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

Status: not started.

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

## Progress log

- 2026-10-20: Completed source-only audit and a second control-flow verification
  of B01-B08. No tests inspected/executed and no production files modified.
- 2026-10-20: Confirmed clean `main` at
  `f683a6eae77a7bac60a8f58f7e0af014bde27815`; compared its tree with the audit
  base. Read plan, command, architecture, product, and review authorities.
- 2026-10-20: Created this execution plan and its active index entry for the
  requested dedicated branch and local planning commit. Implementation,
  regression baseline, host validation, and independent change review remain
  unstarted.

| Milestone | State | Evidence required to advance |
| --- | --- | --- |
| 0: execution baseline and decisions | Not started | Authorization, current identities, failing regressions, frozen decisions |
| 1: B01 | Not started | Capacity escape and preserved admission/intent |
| 2: B02 | Not started | Cold/warm continuation, stable ranges, complete work/bounds proof |
| 3: B03 | Not started | Context invalidation and bounded valid navigation |
| 4: B04 | Not started | Typed failure settlement, playback and persistence outcomes |
| 5: B05 | Not started | Repeat reads plus unchanged security/lifecycle defenses |
| 6: B06 | Not started | Cancellation/commit linearization and installed-tree preservation |
| 7: B07 | Not started | Terminal failure, safe retry/removal, contained cleanup |
| 8: B08 | Not started | Pause/resume across async preparation and stale cleanup |
| 9: integrated acceptance | Not started | Current host gates, documentation, exact-patch reviewer approval |

## Discoveries and decisions

1. This is an eight-defect correctness batch, not the earlier four-defect
   lifecycle plan and not a safe-refactor campaign.
2. Static verification establishes the failure paths and their conditions.
   Runtime reproduction, frequency, performance, and regression acceptance
   remain future evidence.
3. B01 is P2: it blocks a preparation but Stop can recover control. The planned
   remedy exposes an explicit capacity escape without weakening admission.
4. B02 has a real tension between stable cold-start segmentation and the
   current per-request inspection limit. Milestone 0 must resolve it openly;
   concealing rescans from accounting is not a solution.
5. B05 is a lifetime work-accounting defect, not evidence of leaked image RAM.
6. B06 needs a defined cancellation/commit race outcome. B07 applies only when
   cleanup fails and requires terminal state even on that error path.
7. The unused-symbol candidates are excluded. No deletion is authorized by
   this plan.
8. Current production priority remains Piper/Chatterbox. Role configuration
   specifies `change_reviewer` as GPT-6 Astra high; configured availability is
   not proof that a live reviewer has approved anything.
9. Existing command definitions were read to avoid invented validation commands.
   Reading them does not establish test coverage or authorize execution now.

## Final validation results

Planning status only:

- Production/test/generated files changed: none.
- Tests inspected or executed for this audit/planning task: none.
- Runtime reproduction and benchmark results for B01-B08: not performed.
- Implementation milestones and acceptance: not started.
- Independent behavioral change review: not requested for this plan-only
  change; mandatory for the later implementation.
- Planning review: required sections, all eight defect IDs, source ownership,
  concrete acceptance scenarios, command provenance, authorization boundaries,
  and active-plan discoverability are included.
- Branch/commit: local planning setup only; record the resulting commit in the
  task handoff rather than introducing a self-referential commit hash here.
- Push, pull request, and publication: not authorized or performed.

At implementation closeout, replace the pending acceptance entries with exact
commands/outcomes, host and source identities, scenario evidence, remaining
limitations, cleanup results, and the immutable `change_reviewer` report ID.
Do not mark the plan completed while any required outcome or gate is pending.
