# M009-001 reader experience stabilization

## Goal

Stabilize the completed M009 synchronized-reading experience before M010 adds
hardware compatibility and operational recovery UI.

This follow-up must reconcile the user-observed absence of a visible audible
segment highlight, keep the EPUB text continuously visible in one dedicated
scrolling viewport, make narration controls compact without hiding important
state, replace the ambiguous preparation progress bar with truthful loaded
audio text, and add an explicit paragraph-level leaf control that starts and
tracks narration through existing stable locators.

The work preserves completed M005 narration segmentation, M007 protocol and
service ownership, M008 buffer thresholds and bounds, and M009 segment-level
timing, explicit identity-first invalidation, following, and heard-position
authority. Exact-host validation may amend interaction authority when actual
reader behavior contradicts the intended reader-first experience.

## User-visible outcome

After this plan is complete, a reader using the constrained exact-development
path can:

- open an EPUB and see the book text as the primary application surface
  without scrolling past the application controls;
- scroll the EPUB text inside one dedicated reader viewport while compact
  application and narration controls remain available;
- inspect another passage by scrolling without cancelling, restarting, or
  retargeting active narration; only an explicit leaf or navigation action
  replaces the active narration point;
- see an unmistakable but non-disruptive highlight for the currently audible
  stable narration segment;
- see one leaf marker beside the relevant paragraph: translucent when the
  paragraph is an available start target, distinct while that target is
  preparing, solid and non-colour-coded when it is currently audible, and
  separately outlined when it represents a saved stopped checkpoint;
- activate the leaf to replace obsolete narration and start from that
  paragraph without making ordinary paragraph clicks interactive;
- collapse the detailed local-narration panel while retaining a compact player,
  buffering state, active errors, and required recovery actions; and
- read exact loaded playable-audio duration as text without mistaking a growing
  buffer bar for book or playback progress.

The user can operate every new action with keyboard and touch equivalents.
Automatic following never moves focus or selection. This plan does not make
the development TTS profile supported, continuous, real-time, or
distributable.

## Current state

Roadmap Milestones 1 through 9 are complete.

Completed M009 carries each eligible prepared segment's immutable
`LocatorRangeV1` through the scheduler/player, publishes exact audible
start/completion observations, maps one active range through
`SemanticDomRangeMapper`, installs the `voxleaf-narration-active` CSS Custom
Highlight, follows outside the frozen 24-pixel comfort region, routes
navigation through identity-first cancellation, and persists non-skipping
heard checkpoints. Deterministic, Chromium, packaged WebView2, exact-host, and
pull-request validation passed on the recorded implementation.

A later manual run with a real local EPUB produced audible narration but did
not show a visible active segment highlight. Milestone 2 reproduced a
same-chapter materialization gap with repository-authored synthetic content,
repaired the one-shot canonical materialization path, and passed clean-host
pull-request validation.

Milestone 3 gives the ready-publication state one dedicated reader scroll
viewport while keeping application, publication, and compact narration chrome
stable. Narration detail defaults closed without hiding playback, phase,
loaded duration, low-water, buffering, failure, or recovery state. Preparation
uses exact loaded/target/estimate text and no `<progress>` element. No-book,
loading, empty, and error states retain the normal responsive page.

Milestone 4 implements one application-owned contextual leaf beside the
canonical registered block. It is the only paragraph-start action; ordinary
text remains inert. The same bounded control projects preview, preparing,
current audible paragraph, and saved checkpoint state while the existing CSS
Custom Highlight remains exact segment-level audible authority.

M010 is approved but not started. It will add compatibility and recovery state
to the application. Stabilizing the shell and its canonical narration
navigation before M010 avoids building those new states around a reader layout
that is already scheduled to change.

## Scope and non-goals

### In scope

- Freeze one result-blind stabilization authority before implementation,
  including the exact failing highlight proof, reader scroll ownership,
  compact/collapsed narration states, loaded-audio language, leaf states,
  locator targeting, and accessibility behavior.
- Reproduce the missing visible-highlight observation without committing the
  user's EPUB, book text, generated audio, private paths, or raw logs.
- Correct the reader-owned active segment decoration/follow integration while
  retaining CSS Custom Highlight and honest whole-segment timing.
- Introduce one fixed opened-book shell with one dedicated reader scroll owner;
  avoid nested reader scroll regions.
- Keep the open-book empty/loading/error flows responsive and usable at narrow
  sizes and high text scale.
- Add a compact narration surface and collapsible detail panel without hiding
  failure, buffering, low-water, preparation, or recovery state.
- Remove the growing preparation `<progress>` presentation and show exact
  loaded playable time and the active target in text.
- Add an application-owned paragraph leaf interaction tied only to canonical
  locators and existing narration replacement behavior.
- Use the same bounded leaf marker to reinforce the current audible paragraph
  and the saved stopped checkpoint without replacing the exact text-range
  highlight.
- Extend deterministic, browser, packaged WebView2, and exact-host coverage for
  focus, selection, scrolling, cancellation, stale suppression, cleanup,
  forced colors, reduced motion, keyboard, pointer, and touch behavior.
- Keep passive viewport inspection independent from narration replacement while
  retaining explicit leaf, passage, and chapter identity-first cancellation.
- Reconcile product, architecture, development, roadmap, and plan
  documentation with actual results.

### Non-goals

- Changing M005 normalization, semantic segmentation, chunk sizes, source
  ranges, or prepared-text limits.
- Changing M007 protocol v1, process topology, framing, service queues,
  complete-unit delivery, or Qwen adapter behavior.
- Changing M008's 15-second quick target, one-minute refill, prepared choices,
  10-second low water, 30-minute simultaneous ceiling, `1.0x` playback, or
  zero boundary-wait default.
- Adding lower-temperature or stable narration, x-vector-only cloning, a new
  model, voice selection, hardware detection, fallback, or service recovery.
- Adding word timing, inferred intra-segment progress, a chapter-duration seek
  bar, or a rendered page-number authority.
- Adding a full native File/Edit/View/Narration/Help menu, a new table-of-
  contents sidebar, automatic retry, telemetry, cloud processing, or remote
  requests.
- Persisting panel geometry, leaf hover state, rendered coordinates, DOM
  paths, quotations, prepared text, generated audio, or a new reader-state
  envelope.
- Treating the private real EPUB used during manual observation as a fixture or
  repository artifact.

## Relevant files and documentation

Read these authorities before implementation:

- [`.agents/PLANS.md`](../../../.agents/PLANS.md)
- [`../../README.md`](../../README.md)
- [`../../product/mvp.md`](../../product/mvp.md)
- [`../../product/project-brief.md`](../../product/project-brief.md)
- [`../../architecture/system-diagram.md`](../../architecture/system-diagram.md)
- [`../../architecture/overview.md`](../../architecture/overview.md)
- [`../../architecture/adaptive-buffer-authority-v1.md`](../../architecture/adaptive-buffer-authority-v1.md)
- [`../../architecture/synchronization-authority-v1.md`](../../architecture/synchronization-authority-v1.md)
- [`../../architecture/decisions/ADR-0008-visual-reader-architecture.md`](../../architecture/decisions/ADR-0008-visual-reader-architecture.md)
- [`../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md`](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md)
- [`../../architecture/decisions/ADR-0012-bounded-narration-preparation.md`](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md)
- [`../../architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md`](../../architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md)
- [`../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md`](../../architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md)
- [`../completed/M005-narration-text-preparation.md`](../completed/M005-narration-text-preparation.md)
- [`../completed/M008-bounded-adaptive-prebuffering.md`](../completed/M008-bounded-adaptive-prebuffering.md)
- [`../completed/M009-synchronized-reading-and-narration.md`](../completed/M009-synchronized-reading-and-narration.md)

Expected implementation areas:

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/styles.css`
- `apps/desktop/src/reader/ReaderPublication.tsx`
- `apps/desktop/src/reader/SemanticDocument.tsx`
- `apps/desktop/src/reader/semantic-dom-range-mapper.ts`
- `apps/desktop/src/reader/segment-highlight-controller.ts`
- `apps/desktop/src/reader/synchronization-authority.ts`
- `apps/desktop/src/tts/AdaptivePreparationControls.tsx`
- `apps/desktop/src/tts/product-narration-coordinator.ts`
- `apps/desktop/src/persistence/reader-position-save-coordinator.ts`
- adjacent focused unit and component tests;
- `apps/desktop/tests/browser/`;
- `apps/desktop/scripts/native-startup-smoke.mjs`; and
- applicable product, architecture, development, and roadmap documentation.

Do not add a shared schema, Python/Rust protocol field, package dependency, or
native capability unless a failing proof demonstrates that the existing
desktop-local locator and narration boundaries cannot express the requirement.
Amend this plan and the applicable authority before such an expansion.

## Architecture and constraints

### Preserve one position and honest timing

The stable logical locator remains the sole reading-position authority. The
complete active `LocatorRangeV1` remains the only audible timing authority.
The text highlight shows the exact active segment. The leaf supplements that
highlight at paragraph granularity; it must not simulate word timing or imply
that an entire paragraph is already audible.

The leaf target is a canonical paragraph or addressable block-start locator.
Selecting it follows the existing M009 invalidation order:

1. replace the old work identity;
2. stop old playback;
3. abort preparation;
4. release old queued units;
5. contain active synthesis;
6. settle the selected canonical locator; and
7. start only under the explicit new leaf action.

Ordinary paragraph clicks remain inert. A leaf selection that is still
preparing must not use the audible state. The solid active marker moves only
on an accepted `segment-started` observation, and completion/checkpoint
transitions remain governed by M009.

### One dedicated reader scroll owner

When a publication is ready, the application shell keeps compact book and
narration controls outside one reader viewport. Only that viewport owns
continuous EPUB scrolling. The empty/open/loading/error screens may retain the
normal page layout.

Changing the scroll owner must preserve:

- the active visual locator and 24-pixel reading line;
- reflow and exact/nearest-valid restoration;
- Custom Highlight range mapping and following geometry;
- bounded user-input classification without passive narration replacement;
- programmatic-follow sampling suppression;
- chapter and incremental-render materialization;
- focus, selection, reduced motion, and forced-colors behavior; and
- bounded cleanup on publication replacement and application close.

Nested competing scrolling regions are prohibited. Browser history, URL,
rendered page numbers, geometry, and DOM paths remain non-authoritative.

### Bounded leaf presentation

Do not create a permanently visible keyboard tab stop for every paragraph in a
long chapter. Milestone 1 must prove and freeze one bounded presentation, such
as a single retargeted application-owned margin control or an equivalent
roving/contextual control. At most one hover/focus preview, one preparing
target, one active marker, and one saved-checkpoint marker may be retained.

States cannot be communicated by green alone:

- available/preview uses translucent treatment plus an accessible name;
- preparing has a distinct label/state;
- audible uses solid treatment plus `aria-current` or an equivalent
  non-colour cue;
- saved stopped checkpoint uses a distinct outline/non-solid treatment; and
- keyboard focus remains independently visible.

Touch and keyboard users must be able to discover and activate the same
action. Appearance/disappearance must not move focus or expand the semantic
publication text exposed to narration, selection, or persistence.

### Compact narration and truthful loaded duration

The detailed narration configuration may collapse, but the compact surface
must keep play/pause, stop, current phase, loaded playable duration,
buffering/low-water warning, active error, and expansion action available as
appropriate. Collapsing does not stop or restart narration and does not alter
work identity, buffer thresholds, or ownership.

The UI removes the growing preparation bar. It presents content-free exact
accepted duration in text, for example, “Playable audio loaded: 12 seconds.
Starts at 15 seconds.” Actual playback position and approximate book progress
remain separate future concerns. Removing the bar does not remove truthful
target, estimate, low-water, buffering, or complete-shorter-range information.

### Privacy, bounds, and accessibility

- Keep EPUB bytes, text, prepared narration, PCM, and model output local.
- Keep narration text and PCM out of React snapshots, UI state, logs,
  diagnostics, persistence, and test artifacts.
- Retain one active highlight range and the existing bounded structural
  history; leaf state must not create an unbounded locator registry.
- Preserve one active synthesis, zero service queue, one retained prepared
  batch, and all M008 text/audio ceilings.
- Use repository-authored synthetic EPUBs for automated and committed evidence.
- Private manual EPUBs may be used only for local confirmation; do not capture
  or commit their title, text, path, screenshots, audio, or raw output.
- Preserve semantic controls, visible focus, accessible names, screen-reader
  state, forced colors, high text scale, reduced motion, and narrow-window
  operation.

## Milestone 1: Freeze stabilization authority and reproduce the discrepancy

### Work

- Add a deterministic reader-experience state table covering closed/open
  narration detail, leaf preview/preparing/audible/checkpoint states, highlight
  presence, and inactive/preparing/playing/paused/buffering/failed phases.
- Build a repository-authored browser and packaged-WebView2 proof that
  distinguishes “range accepted” from “highlight visibly perceivable.”
- Reproduce the user-observed missing highlight or record the exact bounded
  condition under which the current synthetic proof differs.
- Freeze one reader scroll owner, compact/collapsed information hierarchy,
  text-only loaded-duration language, and bounded leaf presentation.
- Record the decision as an ADR-0017 amendment or the next ADR, and add
  result-blind authority tests before implementation.
- Prove that no M005 segmentation, M007 protocol, M008 threshold, shared
  contract, storage migration, native capability, or dependency change is
  required, or amend scope explicitly before making one.

### Validation

- Command: `pnpm.cmd --filter @voxleaf/desktop typecheck`
- Command: `pnpm.cmd --filter @voxleaf/desktop test`
- Command: `pnpm.cmd test:browser`
- Command: `pnpm.cmd test:native-startup`
- Expected result: the failing/perceivability proof is deterministic and
  content-safe; the selected layout and leaf authority preserve focus,
  selection, locator behavior, URL, CSP, and zero external requests.
- Actual result: The reader-experience state table and paint-aware
  browser/packaged proof are frozen before production changes. They distinguish
  registry acceptance from visible geometry, contrast, non-color decoration,
  and rendering opportunity while preserving focus, selection, publication
  DOM, URL, privacy, and existing contracts.

### Status

Completed. The result-blind authority, deterministic state table, and
paint-aware browser/packaged proof are implemented. Desktop, Chromium,
packaged WebView2, Ubuntu portable, and Windows native validation pass.

## Milestone 2: Restore visible segment highlighting and following

### Work

- Trace exact audible observations through the coordinator subscription,
  active range mapping, Custom Highlight registry, stylesheet, current
  document materialization, and follow geometry.
- Correct the smallest proven production defect without introducing a second
  timing source or publication DOM wrappers.
- Make the active range perceivable in normal, dark, high-contrast,
  forced-colors, and selected-text conditions.
- Retain highlight-only fallback when geometry is unavailable and never move
  focus or selection during following.
- Add regression coverage for the reproduced condition, first/next segment,
  pause/resume, buffering, chapter transition, failure, stop, and cleanup.

### Validation

- Command: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/segment-highlight-controller.test.tsx src/reader/semantic-dom-range-mapper.test.tsx src/reader/ReaderPublication.test.tsx`
- Command: `pnpm.cmd test:browser`
- Command: `pnpm.cmd test:native-startup`
- Expected result: every accepted audible start produces exactly one visible
  active range in the correct document, following remains focus-safe, and all
  invalidating paths clear it without stale UI.
- Actual result: A same-spine audible range whose DOM had not yet
  materialized remained accepted but invisible because the controller only
  requested canonical materialization when the target spine differed from the
  current spine. A failing repository-authored regression reproduced that
  condition. The controller now requests the active range start exactly once
  whenever mapping is missing or collapsed, then the existing mapper
  subscription refreshes the one Custom Highlight after materialization.
  Focus, selection, URL, publication DOM, timing authority, and bounded state
  remain unchanged. Focused tests pass for first/next segments, same-spine and
  chapter materialization, pause/buffering retention, failure, stop, cleanup,
  and geometry-free highlight fallback. All six Chromium smokes pass,
  including rendered-pixel evidence with selected text in dark and
  forced-colors modes. The local native build passes, but this host still
  fails before application mount at the previously documented
  `webdriver-session-not-created` boundary. PR #138's clean Windows native
  foundation passes the same packaged smoke.

### Status

Completed. Production repair, deterministic/browser validation, and
clean-host packaged validation pass.

## Milestone 3: Implement the fixed reader shell and compact narration UI

### Work

- Refactor the ready-publication layout so one dedicated reader viewport owns
  text scrolling and compact application/book/narration chrome remains stable.
- Preserve normal responsive page behavior for no-book, loading, error, and
  unsupported states.
- Add a collapsible detailed narration panel and compact persistent player with
  bounded content-free state.
- Replace the preparation `<progress>` element with exact loaded-duration,
  target, and estimate text while retaining truthful low-water, buffering,
  complete-range, and failure messages.
- Update highlight/follow viewport calculations, locator tracking, reflow, and
  restoration for the new scroll root.
- Add component and browser coverage for narrow windows, zoom/high text scale,
  keyboard scrolling, touch/wheel input, reduced motion, forced colors, and
  publication replacement/close.

### Validation

- Command: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/reader/ReaderPublication.test.tsx src/tts/AdaptivePreparationControls.test.tsx`
- Command: `pnpm.cmd --filter @voxleaf/desktop typecheck`
- Command: `pnpm.cmd test:browser`
- Command: `pnpm.cmd test:native-startup`
- Expected result: the book remains the primary visible surface, exactly one
  reader scroll owner controls locators, collapsing preserves narration and
  errors, and loaded audio is represented truthfully without a progress bar.
- Actual result: Ready publications now use a fixed-height application shell
  with stable compact application, publication, and narration chrome around
  exactly one reader-owned scrolling viewport. Narration detail defaults
  closed while playback, phase, loaded duration, low-water/buffering, errors,
  and recovery remain on the compact surface. The preparation bar is removed
  in favor of exact loaded/target/estimate text. Locator sampling, reflow,
  restoration, highlight following, and browser/native proofs use the reader
  root; no-book/loading/error behavior remains a normal responsive page. An
  initial no-op resize notification is ignored, and following allows one
  bounded post-layout correction before settlement.

### Status

Implementation complete; clean-host packaged validation pending.

## Milestone 4: Add paragraph leaf navigation and progress reinforcement

### Work

- Implement the frozen bounded leaf presentation without turning all
  publication paragraphs into permanent tab stops.
- Map eligible paragraph/block starts to canonical locators through existing
  application-owned structural registration.
- Route leaf activation through identity-first narration replacement and
  settled reader placement.
- Project preview, preparing, current audible paragraph, and saved stopped
  checkpoint states without exposing text or creating a second persisted
  position.
- Keep the leaf and exact segment highlight synchronized across pause/resume,
  completion, buffering, chapter changes, reflow, failure, explicit stop,
  restoration, and publication replacement.
- Add keyboard, pointer, touch, screen-reader, forced-colors, focus, race,
  stale-work, and cleanup tests.

### Validation

- Command: `pnpm.cmd --filter @voxleaf/desktop test`
- Command: `pnpm.cmd test:browser`
- Command: `pnpm.cmd test:native-startup`
- Expected result: activating only the leaf starts from its canonical
  paragraph, old work becomes ineligible first, the active marker follows
  accepted audible segments, ordinary text clicks remain inert, and
  accessibility/resource bounds pass.
- Actual result: One retargeted application-owned leaf maps the relevant
  registered block to its canonical block-start locator, retains bounded
  preview/preparing/audible/checkpoint state, and routes activation through
  identity-first replacement and settled placement. Ordinary text remains
  inert. Focused coordinator/reader tests, the full desktop suite, typecheck,
  all six Chromium tests, and the packaged native startup smoke passed.

### Status

Complete as of 2026-07-28.

## Milestone 5: Validate the stabilized exact-host reader

### Work

- Extend the existing packaged exact-host synthetic path with visible
  highlight assertions under the final reader scroll root.
- Exercise leaf start/replacement, first and next audible markers, compact and
  expanded narration views, pause/resume, passive viewport isolation, chapter
  transition, buffering or stable-buffer observation, stop, saved checkpoint,
  and cleanup. Retain the packaged model-free crash-recovery proof rather than
  bypassing native supervision to force an exact-model failure.
- Retain the outbound-blocking firewall rule and content-safe result boundary.
- Run a manual private-EPUB confirmation without recording private content,
  path, screenshots, audio, or raw model output.
- Measure content-free command-to-audible, follow/marker transition,
  cancellation, retained unit, cleanup, runtime-error, and external-request
  observations without treating them as a new TTS performance profile.

### Validation

- Command: `pnpm.cmd test:tts:adaptive-exact-host`
- Expected result: the final packaged shell shows an unmistakable synchronized
  highlight and leaf marker, preserves one coherent locator, produces zero
  stale audio, releases bounded state, persists no generated audio, and makes
  zero external requests.
- Actual result: The packaged exact-host matrix passed with the frozen local
  Qwen/Serena CUDA profile and outbound-blocking firewall rule. It proved the
  final scroll root, compact/expanded narration, leaf-originated start and
  identity-first replacement, first/next two-frame highlight perceivability,
  pause/resume, the then-frozen passive reader restart, chapter transition, a stable
  60-second playback observation without depletion, prepared playback, normal
  stop, saved checkpoint projection, and bounded cleanup. Quick playback
  became audible in `45,179 ms` with `16,880 ms` playable; prepared playback
  became audible in `135,468 ms` with `75,280 ms` playable. Follow latency p95
  was `299.9 ms`, identity cancellation was `170 ms`, and final stop completed
  in `1,187 ms`. The run observed 10 segment transitions, no underrun, no stale
  playback, zero generated-audio files, and zero external requests. It retained
  at most 5 playable and 5 discarded units. GPU memory rose from `14 MiB` to a
  `5,159 MiB` peak and returned to `14 MiB`; process-tree working set rose from
  `541,937,664` bytes to a `2,903,855,104`-byte peak and returned to
  `668,168,192` bytes. The existing packaged model-free smoke separately
  passed its supported child-crash recovery path. An unsafe direct exact-model
  service shutdown was rejected as a validation technique because it bypassed
  native supervision and created an unsupported split-brain state. Ephemeral
  private-EPUB confirmation remains pending. A preventive hardening rerun also
  passed after a `3.1-second` model-free UI-contract preflight. It used stable
  action identities instead of button order or presentation copy, emitted
  fixed invariant codes, and polled bounded cleanup instead of sleeping for a
  fixed second. This run became audible in `62,873 ms` with `29,600 ms`
  playable, naturally depleted once, refilled in `87,101 ms`, and observed
  `291.3` buffering seconds per playback minute. Prepared playback became
  audible in `123,689 ms` with `70,549 ms` playable. It retained no stale
  playback, generated audio, or external requests; GPU memory returned from a
  `5,069 MiB` peak to `14 MiB`, and bounded resource release completed in
  `588 ms`. These timing differences are observation-only and do not alter the
  frozen engine-profile decision. A later private-EPUB run showed that the
  accepted passive restart was a product defect: scrolling changed the
  narration point. The amended implementation now preserves narration during
  viewport inspection, and the deterministic and packaged proof expectations
  have been changed accordingly.

### Status

The original automated exact-host validation is complete. The first ephemeral
private-EPUB run exposed passive-scroll retargeting; the corrective
private-EPUB confirmation and amended exact-host rerun remain pending.

## Milestone 6: Record the stabilization decision and close validation

### Work

- Reconcile the final implementation with the frozen authority and record any
  amendments.
- Update product requirements, architecture overview, canonical system
  diagram, testing/troubleshooting guidance, roadmap, M010 dependency notes,
  and this ExecPlan with actual results.
- Review the complete diff for unrelated changes, sensitive EPUB content,
  generated audio, private paths, model artifacts, raw logs/results, new
  dependencies, unbounded locator state, and unsupported claims.
- Move this plan to `docs/plans/completed/` only after deterministic,
  browser, packaged, exact-host, privacy, repository, and required
  pull-request validation passes.

### Validation

- Command: `pnpm.cmd check`
- Command: `pnpm.cmd check:portable`
- Command: `git diff --check`
- Expected result: all applicable repository checks pass; required Ubuntu and
  Windows pull-request checks pass; documentation distinguishes implemented
  stabilization from deferred M010/M011 and later narration experiments.
- Actual result: Not yet available.

### Status

Not started.

## Testing and benchmark strategy

### Deterministic tests

- State-table tests for leaf, highlight, panel, and narration phase
  combinations.
- Component tests for one scroll root, fixed shell, collapsed/expanded
  controls, exact loaded-duration text, and removal of the preparation
  `<progress>` element.
- Locator/range tests for paragraph targets, active segment-to-paragraph
  mapping, chapter/reflow changes, saved checkpoint projection, and
  exact/nearest-valid restoration.
- Manual-clock identity tests for leaf replacement, late preparation,
  late synthesis, stale audible transitions, pause/resume, buffering,
  failure, stop, and cleanup.
- Exact and max-plus-one resource tests proving leaf/marker state remains
  bounded independently of chapter size.
- Privacy tests rejecting narration text, quotations, audio, filenames,
  paths, work identities, and raw model errors from UI snapshots,
  diagnostics, and persistence.

### Browser and packaged tests

- Production Chromium covers actual CSS Custom Highlight perception, the final
  scroll owner, geometry/following, leaf hover/focus/activation, keyboard and
  touch equivalents, focus/selection preservation, reflow, narrow/high-scale
  layouts, forced colors, and zero non-loopback requests.
- Packaged WebView2 repeats highlight/leaf visibility, fixed-shell scrolling,
  narration replacement, restoration, lifecycle cleanup, CSP, runtime-error,
  and zero-external-request paths.
- All committed fixtures use repository-authored synthetic EPUBs and
  generated synthetic PCM.

### Exact-host validation

- Run only after deterministic/browser/packaged model-free evidence passes.
- Use the existing exact Windows/CUDA Qwen/Serena development configuration
  and firewall isolation.
- Report interaction correctness separately from TTS speed. This plan does
  not re-evaluate the engine profile or change M008 buffer policy.
- Keep manual private-EPUB confirmation ephemeral and content-free.

## Risks and rollback

- The missing highlight may be an exact publication/range/style interaction
  not reproduced by current synthetic fixtures. Add only content-safe
  structural fixtures; never copy private prose or publisher markup into the
  repository.
- Changing the scroll root may break locator tracking, restoration, following,
  or keyboard scrolling. Freeze one owner, reuse existing mapper/restorer
  boundaries, and retain the old ready-layout path until each focused proof
  passes.
- A leaf per paragraph can create visual clutter, thousands of tab stops, or
  retained locator state proportional to the chapter. Use one bounded
  contextual/roving control and retain only active states.
- Leaf activation can race with active synthesis and replay stale audio. Route
  it through the existing identity-first replacement path and reject late
  callbacks before UI delivery.
- A solid paragraph marker may imply paragraph-level timing. Keep the exact
  segment text highlight as timing authority and label the leaf as the current
  paragraph only.
- Collapsing narration UI may hide failures or required recovery. Keep compact
  error/status/recovery presentation outside the collapsible detail.
- Removing the bar may make target progress less scannable. Preserve exact
  loaded/target text and accessible live status; do not remove buffering and
  low-water warnings.
- Reader-shell CSS may regress small windows, zoom, high text scale, or forced
  colors. Validate each explicitly before replacing the current layout.

Each milestone must remain independently reversible. Highlight fixes may
revert to the accepted M009 Custom Highlight path; the fixed shell may revert
to the current outer-scroll layout; leaf UI may be removed while retaining the
existing visible-passage action; and compact controls may return to the
expanded presentation. Rollback must never weaken identity invalidation,
release bounds, heard checkpoints, exact-byte restoration, or privacy.

## Progress log

- 2026-07-28: Reviewed the ignored reader/narration discussion, completed
  M008/M009 authorities, current product/architecture documentation, roadmap,
  relevant desktop implementation, and M010 dependency.
- 2026-07-28: Prioritized a bounded M009.1 stabilization before M010; retained
  lower-temperature narration, boundary timing, startup tuning, reopen-resume,
  and approximate book progress for a later post-M010/pre-M011 refinement
  decision.
- 2026-07-28: Created this ExecPlan and sequenced M010 after its closeout. No
  production stabilization implementation has started.
- 2026-07-28: Created a fresh branch from updated `main`, reproduced the
  existing proof boundary, and froze executable reader-experience authority
  before production changes.
- 2026-07-28: Strengthened the repository-authored Chromium and packaged
  WebView2 checks so accepted range registration is distinct from perceivability
  across two rendering frames, nonzero visible geometry, `4.5:1` contrast, and
  an underline.
- 2026-07-28: Confirmed all six Chromium assertions and all desktop tests pass.
  On this Windows host the Playwright preview child remains alive after its
  passing summary, so the bounded command terminates by timeout.
- 2026-07-28: Built the release executable and refreshed the test-only
  EdgeDriver from `150.0.4078.83` to the installed WebView2
  `150.0.4078.105`. The release executable stays healthy when launched
  directly, but three WebDriver attempts fail before application mount with
  `session not created: chrome not reachable`. Packaged proof validation
  therefore remains blocked by the local WebView2 automation handshake.
- 2026-07-28: Rebooted Windows and retried with the exact
  WebView2/EdgeDriver `150.0.4078.105` pair; session creation failed at the
  same boundary. During the automated attempt the packaged application process
  existed but created no WebView2 child. A direct launch stayed healthy and
  created six WebView2 processes. The installed `tauri-driver` `2.0.6` is also
  the current crates.io release.
- 2026-07-28: PR #137's clean Windows native foundation executed the packaged
  smoke successfully, and Ubuntu portable foundation also passed. This closes
  the packaged proof and confirms the earlier `chrome not reachable` result
  was specific to the local automation host rather than the implementation.
- 2026-07-28: Traced accepted audible progress through
  `ProductNarrationCoordinator`, `ReaderPublication`, the semantic range
  mapper, the Custom Highlight registry, stylesheet, materialization, and
  focus-safe follow geometry. A new failing synthetic regression proved that
  missing same-spine DOM materialization was a production gap capable of
  producing the reported symptom.
- 2026-07-28: Removed the spine-change restriction from the existing
  one-request materialization gate. The mapper now refreshes the same active
  range after same-chapter content materializes; no second clock, wrapper,
  persisted state, or retained text was added.
- 2026-07-28: Added first/next and lifecycle cleanup regressions plus
  dark/forced-colors selected-text pixel evidence. Focused reader tests,
  desktop tests, type checking, linting, formatting, and all six Chromium
  smokes pass. The local native build passes and the known pre-mount WebView2
  session handshake still fails; clean-host pull-request validation remains.
- 2026-07-28: Confirmed PR #138's Ubuntu portable and Windows native
  foundations pass, closing Milestone 2's clean-host packaged gate.
- 2026-07-28: Implemented the fixed ready-publication shell, one reader-owned
  scroll viewport, compact/collapsible narration surface, and exact
  loaded/target/estimate text without a progress bar. Updated locator,
  restoration, highlight, browser, and packaged proof geometry to use the new
  scroll root.
- 2026-07-28: Fixed two migration findings: initial `ResizeObserver`
  delivery no longer starts a false viewport restoration, and focus-safe
  following performs one bounded post-layout correction before settling.
  Focused and full desktop tests, typecheck, lint, formatting, and all six
  Chromium smokes pass. The release build passes; this host still stops before
  application mount at `webdriver-session-not-created`, so clean-host packaged
  validation remains for the pull request.
- 2026-07-28: Implemented the one-control paragraph leaf, canonical block-start
  resolution, identity-first narration replacement, and bounded
  preview/preparing/audible/checkpoint projection in commit `edffe5b`.
  Ordinary paragraph text remains inert and exact segment highlighting remains
  the audible timing authority.
- 2026-07-28: Expanded keyboard, pointer, touch, forced-colors, focus, target
  size, stale-work, and cleanup coverage in commit `1cedac1`. The full desktop
  suite and typecheck pass, all six Chromium tests report passing, and the
  packaged native startup smoke passes on this Windows host.
- 2026-07-28: The aggregate lint gate rejected a synchronous React state
  update in the leaf positioning effect and one type-only hook dependency.
  Positioning now mutates only the application-owned leaf host as the effect's
  external DOM synchronization target, and the callback uses the exported
  located-block type. Lint and the 39-test focused suite pass.
- 2026-07-28: Extended the existing packaged exact-host matrix over the final
  reader shell. The content-safe assertions now cover the sole reader scroll
  owner, compact and expanded narration, leaf start/replacement and checkpoint
  states, first/next visible highlights across two rendering frames,
  pause/resume, passive navigation, chapter and buffering transitions,
  controlled service failure, reset, cleanup, bounded resources, and zero
  external requests without recording publication text, paths, audio, or raw
  model output.
- 2026-07-28: The extended harness passes Node syntax, Prettier, TypeScript
  lint, 34 desktop test files / 328 tests plus 6 native-client tests,
  TypeScript typecheck, and the model-free packaged native startup smoke. All
  six Chromium smokes also report passing; the known Windows preview child
  remained attached after the passing list and the bounded wrapper ended by
  timeout.
- 2026-07-28: Corrected three obsolete exact-host harness assumptions instead
  of changing production behavior. Passive reader navigation now uses bounded
  wheel/scroll intent inside the sole reader viewport; prepared-mode proof
  inspects the stable radio/select state rather than a removed button label;
  and post-stop cleanup no longer requires an active range after the highlight
  has intentionally been cleared.
- 2026-07-28: Rejected direct `shutdown_tts_service` injection after it proved
  to bypass the native supervisor and leave the typed client and process
  authority out of sync. Failure recovery remains covered by the existing
  supported model-free packaged child-crash test and deterministic coordinator
  tests. The exact-model path validates the supported normal lifecycle.
- 2026-07-28: The final exact Qwen/Serena run passed in `513.9 seconds`.
  Quick and prepared playback, visible first/next highlights, leaf
  replacement, passive navigation, chapter change, pause/resume, stable
  playback, checkpoint projection, stop, bounded memory cleanup, zero
  generated audio, and zero external requests all passed. Because generation
  stayed ahead for the full 60-second observation, natural depletion,
  buffering, and refill were not entered.
- 2026-07-28: `pnpm.cmd check` passed after the exact-host result, covering
  formatting, TypeScript/Rust/Python lint and type checks, 19 shared files /
  196 tests, 34 EPUB files / 555 tests, 34 desktop files / 328 tests plus 6
  native-client tests, 25 Rust tests, 234 Python tests, and native/portable
  builds. The Python test run emitted one non-failing sandbox-cache write
  warning; the outside-sandbox gate itself exited successfully.
- 2026-07-28: Audited the exact-host harness for assumptions similar to the
  removed prepared-button, passive-scroll, shutdown-bypass, and post-stop
  cleanup assumptions. Positional narration/chapter selectors, grouped generic
  highlight/cleanup failures, a model-time-only selector check, and a fixed
  one-second resource sample were confirmed as preventive maintenance risks.
- 2026-07-28: Added stable narration/chapter action identities with component
  regressions, a model-free exact-host UI-contract preflight, allowlisted
  content-safe invariant failure codes, and bounded RAM/VRAM cleanup polling.
  The preflight passed 3 files / 32 tests plus 7 native harness tests in
  `3.1 seconds`; all 34 desktop files / 328 tests, lint, typecheck, formatting,
  and Node syntax checks pass.
- 2026-07-28: The hardened exact-host matrix passed in `530.4 seconds`. It
  exercised natural depletion and successful refill, first/next visible
  highlights, leaf and chapter/passage navigation, prepared playback, stop,
  checkpoint projection, zero stale audio/files/external requests, and
  resource release within `588 ms`. The observed buffering remains above the
  MVP allowance but is not a new performance-profile decision.
- 2026-07-28: Final `pnpm.cmd check` passed in `64.2 seconds`, covering
  formatting, TypeScript/Rust/Python lint and type checks, 19 shared files /
  196 tests, 34 EPUB files / 555 tests, 34 desktop files / 328 tests plus 7
  native-client/harness tests, 25 Rust tests, 234 Python tests, and
  native/portable builds.
- 2026-07-28: A private-EPUB manual run reached active narration but showed that
  scrolling the dedicated reader viewport automatically cancelled and
  retargeted narration. This was the implemented ADR-0017 passive-seek policy,
  not a random model or rendering failure.
- 2026-07-28: Separated visible-locator observation from narration authority in
  `ProductNarrationCoordinator`. Passive movement no longer settles a
  navigation or cancels synthesis; the explicit visible-passage control and
  paragraph leaf still replace work through the original invalidation order.
  Focused reader/coordinator regressions pass, and the packaged exact-host
  script now checks passive isolation instead of the obsolete restart.

## Discoveries and decisions

- The M009 code and synthetic validation prove an active Custom Highlight
  path, but the later private-EPUB manual observation did not show a visible
  highlight. The plan must reproduce and explain that discrepancy rather than
  silently claim either side is definitive.
- Removing the preparation `<progress>` element is a presentation change; it
  does not require a buffer-status contract or threshold change.
- A dedicated reader viewport changes geometry and layout responsibilities but
  not stable locator authority. Locator sampling, reflow, highlight following,
  and packaged proofs must all use the same scroll root.
- The existing visible-passage, previous/next, chapter, identity-first
  invalidation, and audible-progress boundaries should be extended for leaf
  targeting rather than replaced.
- A permanent focusable leaf for every paragraph would violate practical
  accessibility and bounded-state goals. Milestone 1 must select a bounded
  contextual or roving implementation.
- A leaf is a paragraph-level location/action marker, while CSS Custom
  Highlight remains the exact segment-level audible marker. Combining them
  must not become fake word or paragraph timing.
- M010 recovery UI should be built after the final reader shell exists and
  must test leaf-originated invalidation. Complete generation settings must be
  part of future profile identity so a later natural/stable narration
  comparison cannot become an untracked mutable temperature toggle.
- The old Chromium and packaged scripts registered, inspected, and deleted the
  Custom Highlight inside one synchronous evaluation. They could prove
  registry/range acceptance but could not prove a rendering opportunity. This
  is the exact bounded condition under which the prior synthetic evidence
  differed from the later manual observation; it does not yet establish the
  private-publication production root cause.
- M009.1 uses one retargeted contextual leaf rather than one persistent focus
  target per paragraph. It retains at most one preview, preparing, audible,
  and checkpoint state.
- Private-EPUB exact-host use exposed that the original passive-scroll seek
  authority was itself disruptive: ordinary viewport inspection cancelled
  active work and changed the narration start. The selected correction keeps a
  separate visible-passage target and active narration locator. Passive
  scrolling updates only the former; explicit leaf, visible-passage,
  previous/next, and chapter actions retain identity-first replacement.
- The authority and stronger proof remain desktop-local. No M005 segmentation,
  M007 protocol, M008 threshold, shared contract, storage migration, native
  capability, CSP, or dependency change is required.
- The native failure occurs before application mount and before the
  perceivability script. It is not evidence that the highlight assertion
  failed. A matching EdgeDriver and a direct healthy release launch rule out
  stale driver version and application startup as sufficient explanations.
- The reproduced same-spine failure does not require an audible-progress
  timing, M005 segmentation, Custom Highlight styling, or chapter-navigation
  defect. The controller deliberately withheld materialization when a target
  was absent from the current spine, so later same-chapter audible content
  could have no DOM range to register or follow. Reusing the existing one-shot
  navigation gate and mapper refresh is the smallest correction. An ephemeral
  private-publication confirmation remains necessary before claiming this was
  the only condition in the original manual observation.
- Selected text can obscure color-only highlighting even when the Custom
  Highlight remains registered. The retained underline supplies the required
  non-color cue; browser screenshots prove the decorated and selection-only
  renderings differ in dark and forced-colors modes without moving focus or
  selection.
- A clean reboot did not change the result. The remaining failing boundary is
  the external `tauri-driver`/WebView2 automation launch: it starts the native
  executable but does not create the WebView child that EdgeDriver must reach.
  Replacing the harness with Tauri's newer embedded WebDriver-provider approach
  would add native plugins and dependencies, so it is not authorized by this
  frozen milestone merely to bypass a local validation-host failure.
- The browser delivers an initial `ResizeObserver` notification even when the
  reader viewport dimensions have not changed. Treating that notification as
  a resize can overwrite the intended locator; comparing observed client
  dimensions before preserving avoids the false transaction.
- Instant reader scrolling may settle before one final layout adjustment.
  One bounded range recheck/correction keeps the audible segment inside the
  reader comfort region without introducing polling, focus movement, or a
  second locator authority.
- The canonical block registration already owned by `SemanticDomRangeMapper`
  supplies both the leaf anchor and block-start locator. Reusing it permits one
  absolutely positioned application control without adding buttons or
  wrappers to publication content.
- React StrictMode's development mount probe exposed that immediate effect
  cleanup could close publication-scoped reader resources before the second
  setup reused them. One shared microtask-deferred cleanup hook now lets the
  second setup supersede the probe while still closing exactly once on a real
  unmount; a regression test covers the leaf in StrictMode.
- The Windows `test:browser` wrapper can retain its Vite preview child after
  Playwright reports all six tests passing. This is the existing M004
  post-test teardown issue, not a failed leaf assertion.
- Exact-host failure injection must not call the native shutdown command behind
  the typed client. That bypasses the supervisor/client lifecycle and tests an
  unsupported split-brain state rather than product recovery. The supported
  packaged crash-recovery matrix remains the failure authority; the exact
  model matrix proves normal supervised lifecycle and cleanup.
- A fast exact-model run may never deplete its playable lead. In that case a
  continuous 60-second stable-playback observation with zero underruns is the
  exact-host result, while deterministic/model-free tests remain authoritative
  for buffering, low-water, depletion, and refill transitions.
- Exact-host automation must select controls through stable action identity,
  not DOM position or presentation copy. A model-free contract preflight must
  run before Qwen inference, and content-safe invariant codes must identify
  the failed boundary without exposing observed values.
- Resource release is asynchronous and hardware-dependent. Exact-host cleanup
  polls RAM and VRAM against the frozen bounds for at most 15 seconds and
  records the actual release duration; it neither assumes one second nor
  relaxes the memory ceilings.

## Milestone 1 validation results

- `pnpm.cmd --filter @voxleaf/desktop typecheck`: passed.
- `pnpm.cmd --filter @voxleaf/desktop test`: passed, 34 Vitest files / 316
  tests plus 6 native WebDriver-client tests.
- `pnpm.cmd test:browser`: all 6 Playwright tests passed, including the
  paint-aware synchronization proof. On this Windows host the preview child
  did not exit after the passing summary, and the bounded command ended after
  300 seconds.
- `pnpm.cmd test:native-startup`: the Tauri release build passed; WebDriver
  session creation failed before mount. Direct smoke retries before and after a
  Windows reboot, using the matching test-only EdgeDriver, failed at the same
  stage. A content-safe local diagnostic reported
  `session not created: chrome not reachable`. PR #137's clean Windows native
  foundation subsequently ran the same packaged smoke successfully.
- `pnpm.cmd lint:typescript`: passed.
- `pnpm.cmd format:check:typescript`: passed.
- PR #137 `Ubuntu portable foundation`: passed in 1 minute 54 seconds.
- PR #137 `Windows native foundation`: passed in 13 minutes 4 seconds,
  including `pnpm.cmd test:native-startup`.
- Privacy/bounds review: only repository-authored synthetic EPUBs are used;
  no EPUB text, private path, PCM, generated audio, runtime log, model file,
  native capability, dependency, or persistence field was added.

Milestone 1 is complete. Production highlight repair and reader-shell behavior
remain scoped to Milestones 2 through 6.

## Milestone 2 validation results

- Focused reader command: passed, 3 files / 31 tests.
- `pnpm.cmd --filter @voxleaf/desktop test`: passed, 34 Vitest files / 318
  tests plus 6 native WebDriver-client tests.
- `pnpm.cmd --filter @voxleaf/desktop typecheck`: passed.
- `pnpm.cmd lint:typescript`: passed.
- `pnpm.cmd format:check:typescript`: passed.
- `pnpm.cmd test:browser`: all 6 Playwright tests passed, including
  rendered-pixel visibility with selected text in dark and forced-colors
  modes. The already documented Windows preview child remained alive after
  the passing summary, so the bounded command ended by timeout.
- `pnpm.cmd test:native-startup`: the Vite and release Tauri builds passed;
  WebDriver session creation failed before application mount with the same
  local `webdriver-session-not-created` boundary documented in Milestone 1.
  Retrying with the matching test-only WebView2/EdgeDriver
  `150.0.4078.105` pair reached the same boundary.
- PR #138 `Ubuntu portable foundation`: passed.
- PR #138 `Windows native foundation`: passed, including the packaged smoke.
- Privacy/bounds review: fixtures remain repository-authored and synthetic;
  the controller retains one active source range and one one-shot
  materialization flag; no EPUB text, private path, PCM, generated audio,
  model artifact, persistence field, dependency, DOM wrapper, or external
  request was added.

Milestone 2 is complete.

## Milestone 3 validation results

- Focused component/reader command: passed, 6 files / 60 tests.
- `pnpm.cmd --filter @voxleaf/desktop test`: passed, 34 Vitest files / 320
  tests plus 6 native WebDriver-client tests.
- `pnpm.cmd --filter @voxleaf/desktop typecheck`: passed.
- `pnpm.cmd lint:typescript`: passed.
- `pnpm.cmd format:check:typescript`: passed.
- `pnpm.cmd check:portable`: passed, including generated-contract checks,
  TypeScript/Python typecheck and lint, 19 shared files / 196 tests, 34 EPUB
  files / 555 tests, 34 desktop files / 320 tests plus 6 native-client tests,
  234 Python tests, and portable package/desktop/Python builds.
- `pnpm.cmd test:browser`: all 6 Playwright tests passed, covering the sole
  scroll owner, fixed chrome under keyboard/wheel/touch input, narrow/high
  scale layouts, locator tracking, reflow, highlight following, reduced
  motion, forced colors, replacement, and close. The known Windows preview
  child remained attached after the passing list, so the bounded wrapper
  ended by timeout.
- `pnpm.cmd test:native-startup`: Vite and the Tauri release build passed;
  local WebDriver session creation failed before application mount at the
  previously documented `webdriver-session-not-created` host boundary.
  Clean-host packaged validation remains pending.
- Privacy/bounds review: no EPUB content, path, PCM, generated audio, new
  persistence, protocol, dependency, or buffer threshold was added. The
  compact view consumes only existing content-free coordinator state, and
  exactly one reader element owns EPUB scrolling.

Milestone 3 production behavior and repository/browser validation are
implemented. Its status becomes complete after the clean-host packaged check
passes.

## Milestone 4 validation results

- Focused coordinator/reader command: passed, 2 files / 39 tests.
- `pnpm.cmd --filter @voxleaf/desktop test`: passed, 34 Vitest files / 328
  tests plus 6 native WebDriver-client tests.
- `pnpm.cmd --filter @voxleaf/desktop typecheck`: passed.
- `pnpm.cmd check:portable`: passed, including formatting, TypeScript/Python
  lint and typecheck, 19 shared files / 196 tests, 34 EPUB files / 555 tests,
  34 desktop files / 328 tests plus 6 native-client tests, 234 Python tests,
  and portable package/desktop/Python builds.
- `pnpm.cmd test:browser`: all 6 Playwright tests passed and exited normally,
  including
  forced-colors, focus visibility, 44-pixel target size, touch parity, and the
  unavailable-narration case.
- `pnpm.cmd test:native-startup`: passed after a release build, including the
  packaged narrow/accessibility reader matrix, synchronization feasibility
  proof, binary delivery/cancellation/crash recovery, local file lifecycle,
  restoration, close, zero errors, and zero external requests.
- Privacy/bounds review: the controller retains at most one preview,
  preparing, audible, and checkpoint locator. It stores no text, timing,
  geometry, PCM, path, or new persisted value; adds no protocol, native
  capability, dependency, CSP, M005 segmentation, or M008 buffer-policy change;
  and removes every subscription/resource on real unmount.

Milestone 4 is complete. Milestones 5-6 retain exact-host stabilized-reader
confirmation and repository/privacy/pull-request closeout.

## Milestone 5 validation results

- `node --check apps/desktop/scripts/native-startup-smoke.mjs`: passed.
- `pnpm.cmd lint:typescript`: passed.
- `pnpm.cmd --filter @voxleaf/desktop typecheck`: passed.
- `pnpm.cmd --filter @voxleaf/desktop test`: passed, 34 Vitest files / 328
  tests plus 6 native WebDriver-client tests.
- `pnpm.cmd test:browser`: all 6 Playwright tests passed. The known Windows
  preview child remained attached after the passing summary, so the bounded
  wrapper ended by timeout.
- `pnpm.cmd test:native-startup`: passed after the release build, including
  supported child-crash recovery, lifecycle, reader geometry, cleanup, zero
  application errors, and zero external requests.
- `pnpm.cmd test:tts:adaptive-exact-host`: passed in `513.9 seconds` with the
  exact frozen Qwen/Serena CUDA profile and outbound firewall isolation. It
  produced no stale playback, generated-audio files, or external requests and
  returned GPU memory to its `14 MiB` baseline.
- Model-free exact-host preflight
  (`pnpm.cmd --filter @voxleaf/desktop test:tts:adaptive-exact-host:preflight`):
  passed in `3.1 seconds`, 3 Vitest files / 32 tests plus 7 native harness
  tests.
- Hardened `pnpm.cmd test:tts:adaptive-exact-host`: passed in `530.4 seconds`
  after the model-free preflight. One natural underrun/refill was observed;
  fixed invariant checks, semantic action selection, bounded state, privacy,
  and cleanup passed, with resource release in `588 ms`.
- `pnpm.cmd check`: passed in `76.8 seconds`, including formatting,
  TypeScript/Rust/Python lint and type checks, 1,079 Vitest tests plus 6
  native-client tests, 25 Rust tests, 234 Python tests, the desktop release
  build, and the Python package build.
- Final hardened `pnpm.cmd check`: passed in `64.2 seconds` with the same
  repository-wide coverage plus the seventh native harness regression.
- Privacy/bounds review: the committed harness and this result contain no EPUB
  prose, title, author, private path, PCM, generated audio, raw model output,
  model artifact, secret, or new dependency. Observations are content-free and
  retained-unit/resource measurements remain bounded.
- Passive-isolation amendment focused tests: passed, 3 files / 44 tests.
- `pnpm.cmd --filter @voxleaf/desktop test`: passed, 34 files / 328 tests plus
  7 native WebDriver-client/harness tests.
- Model-free exact-host preflight: passed, 3 files / 32 tests plus 7 native
  harness tests.
- Final `pnpm.cmd check:portable`: passed outside the sandbox, including
  formatting, TypeScript/Python lint and typecheck, 19 shared files / 196
  tests, 34 EPUB files / 555 tests, 34 desktop files / 328 tests plus 7 native
  tests, 234 Python tests, and portable builds. Pytest emitted one non-failing
  cache-write warning; no product assertion failed.
- Remaining gate: rerun the amended exact-host passive-isolation matrix and
  repeat the ephemeral private-EPUB scroll confirmation without recording
  private content.

## Final validation results

Not yet available. This plan is active with Milestones 1-2 and 4 complete and
Milestone 3 implemented pending its clean-host packaged validation. It is
complete only when the user-observed highlight discrepancy is confirmed
closed; the fixed reader viewport, compact narration UI, text-only loaded
duration, and bounded leaf interaction are implemented and validated;
exact-host privacy and cleanup evidence passes; documentation matches actual
behavior; and required pull-request checks pass.
