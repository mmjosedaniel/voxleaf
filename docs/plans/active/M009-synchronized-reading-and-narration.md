# M009 synchronized reading and narration

## Goal

Integrate the implemented visual reader, locator-linked narration preparation,
exact-development local TTS service, bounded audio scheduler, and player so
VoxLeaf maintains one coherent logical reading position while narration is
active.

The first implementation is deliberately segment-level. The selected
Qwen/Serena adapter returns complete waveforms without word timestamps, so
M009 must highlight and follow each prepared narration segment's existing
`LocatorRangeV1`. It must not infer, simulate, or advertise word-level timing.

## User-visible outcome

On the exact configured development host, a reader can:

- start quick or prepared narration from the current visible logical position;
- see the source passage for the audible segment highlighted and kept in view;
- pause and resume without splitting visual and audible position;
- navigate to a chapter or addressable passage and restart narration there
  without hearing stale audio;
- move to the previous or next narration boundary using accessible controls;
- change layout while the active narrated passage remains logically stable;
- close, replace, or reopen a book without invalid generated work corrupting
  the last valid heard position; and
- understand loading, preparing, buffering, playing, paused, and error states
  without book text or audio entering status messages, logs, or persistence.

This milestone does not make the exact-development TTS profile a supported
production profile and does not promise uninterrupted playback.

## Current state

Roadmap Milestones 1 through 8 are complete.

The implemented reader owns one canonical `ReadingLocatorV1`, renders safe
semantic values in the application DOM, maps semantic code-point positions to
DOM ranges, tracks the active visual locator, preserves it across reflow, and
persists bounded exact-byte reading state. Programmatic navigation already
suspends passive locator sampling during placement.

The implemented `@voxleaf/epub` narration boundary creates bounded prepared
segments. Each segment contains sensitive normalized narration text and an
immutable source `LocatorRangeV1`.

Completed M007 provides protocol v1, a bounded model-free Python service,
native persistent-child supervision, a typed desktop client, and the
exact-development Qwen3-TTS/Serena adapter. It exposes complete audio units,
not word timing or model streaming.

Completed M008 provides:

- `ProductNarrationCoordinator`, which starts preparation at the active visual
  locator and owns ephemeral session/generation identity;
- one active synthesis and zero service-queued synthesis;
- a sole-owner bounded FIFO of complete 24-kHz mono float32 units;
- `AdaptivePcmPlayer` and a dedicated Web Audio backend;
- quick/prepared controls and content-free observations; and
- identity-first invalidation on stop, visual-locator change, publication
  replacement/close, failure, and application exit.

M009 Milestones 2 and 3 now close the playback-side projection and reader
decoration gaps:

- the scheduler retains each prepared segment's immutable source range and
  canonical sequence only while its complete audio unit remains eligible;
- the player publishes exact `segment-started` and `segment-completed`
  observations plus played-frame progress at no more than the frozen 250 ms
  cadence;
- the coordinator forwards those content-free observations through a
  subscription that is separate from its React-facing snapshot; and
- released or invalidated units immediately lose their source-range
  projection while PCM cleanup remains bounded.
- the reader consumes exact segment transitions, maps each block-local
  half-open range through the existing semantic DOM mapper, and owns exactly
  one `voxleaf-narration-active` Custom Highlight;
- automatic following uses the frozen 24-pixel comfort inset and instant
  placement without moving focus, selection, history, or publication nodes;
  and
- passive visual sampling remains suspended while a range waits for
  incremental or next-chapter rendering and resumes without synthesizing a
  user seek.

M009 Milestones 4 through 6 now close the interaction, persistence, and
exact-host validation gaps:

- passive visual movement follows the frozen identity-first synchronized-seek
  policy; and
- one desktop-local bridge gives exact audible segment boundaries temporary
  persistence authority over visual, reflow, and programmatic-follow updates.
- the packaged exact-development path distinguishes genuine wheel, touch,
  pointer, and reading-navigation-key intent from late programmatic visual
  samples, preventing automatic follow from creating a seek loop; and
- the exact Windows/CUDA host validates synchronized highlight/follow,
  pause/resume, passage seek, chapter restart, natural underrun/refill,
  cancellation, bounded cleanup, and the offline boundary.

The remaining M009 work is final documentation, repository, privacy, and
pull-request validation in Milestone 7.

## Scope and non-goals

### In scope

- Freeze one interaction and position authority for active narration.
- Carry each prepared segment's existing source range through bounded
  desktop-owned scheduling and playback metadata.
- Publish content-free audible-unit transitions and bounded progress
  observations outside the service protocol.
- Render a segment-level highlight from semantic locator ranges.
- Follow the audible range without stealing keyboard or assistive-technology
  focus.
- Distinguish programmatic following from user-originated navigation so the
  tracker cannot create seek loops.
- Implement synchronized pause, resume, previous/next boundary movement,
  chapter navigation, addressable-passage selection, and seek/restart.
- Persist only canonical heard logical progress at bounded checkpoints.
- Preserve stale-first cancellation, memory bounds, privacy, and exact
  development-only availability.
- Add deterministic, browser, packaged native, and exact-host validation.

### Non-goals

- Word, phoneme, sentence, or waveform-derived timing.
- A continuous chapter-duration seek bar without authoritative timing.
- Rewriting M005 normalization or segmentation.
- Changing the M007 protocol-v1 schema, framing, process topology, or
  complete-unit delivery.
- Changing M008 quick/prepared/refill thresholds, one-worker policy, audio
  format, simultaneous ceilings, or no-retry rule.
- Persisting generated audio, prepared text, extracted prose, quotations,
  rendered geometry, or DOM paths.
- Adding a second TTS worker, CPU fallback, audio cache, hidden boundary wait,
  cloud service, telemetry, or network request.
- Selecting a standard production TTS profile, supporting general hardware,
  distributing model artifacts, or building an installer.
- Certifying screen-reader compatibility beyond the explicit automated and
  manual evidence collected here.

## Relevant files and documentation

Read these authorities before implementation:

- [`.agents/PLANS.md`](../../../.agents/PLANS.md)
- [`../../README.md`](../../README.md)
- [`../../product/mvp.md`](../../product/mvp.md)
- [`../../product/project-brief.md`](../../product/project-brief.md)
- [`../../architecture/system-diagram.md`](../../architecture/system-diagram.md)
- [`../../architecture/overview.md`](../../architecture/overview.md)
- [`../../architecture/adaptive-buffer-authority-v1.md`](../../architecture/adaptive-buffer-authority-v1.md)
- [`../../architecture/tts-service-protocol-v1.md`](../../architecture/tts-service-protocol-v1.md)
- [`../../architecture/decisions/ADR-0003-stable-reading-locators.md`](../../architecture/decisions/ADR-0003-stable-reading-locators.md)
- [`../../architecture/decisions/ADR-0004-start-after-audio-lead.md`](../../architecture/decisions/ADR-0004-start-after-audio-lead.md)
- [`../../architecture/decisions/ADR-0008-visual-reader-architecture.md`](../../architecture/decisions/ADR-0008-visual-reader-architecture.md)
- [`../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md`](../../architecture/decisions/ADR-0011-bounded-web-storage-reader-state.md)
- [`../../architecture/decisions/ADR-0012-bounded-narration-preparation.md`](../../architecture/decisions/ADR-0012-bounded-narration-preparation.md)
- [`../../architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md`](../../architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md)
- [`../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md`](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md)
- [`../completed/M005-narration-text-preparation.md`](../completed/M005-narration-text-preparation.md)
- [`../completed/M007-local-tts-service-and-process-protocol.md`](../completed/M007-local-tts-service-and-process-protocol.md)
- [`../completed/M008-bounded-adaptive-prebuffering.md`](../completed/M008-bounded-adaptive-prebuffering.md)

Expected implementation areas:

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/reader/ReaderPublication.tsx`
- `apps/desktop/src/reader/SemanticDocument.tsx`
- `apps/desktop/src/reader/active-visual-locator.ts`
- `apps/desktop/src/reader/reader-navigation.ts`
- `apps/desktop/src/reader/semantic-dom-range-mapper.ts`
- `apps/desktop/src/persistence/reader-position-save-coordinator.ts`
- `apps/desktop/src/tts/adaptive-buffer-scheduler.ts`
- `apps/desktop/src/tts/pcm-playback.ts`
- `apps/desktop/src/tts/product-narration-coordinator.ts`
- adjacent focused unit and component tests;
- `apps/desktop/tests/browser/`;
- `apps/desktop/scripts/native-startup-smoke.mjs`; and
- current product, architecture, development, and roadmap documentation.

Do not add a new shared contract or Python/Rust protocol field unless a
failing desktop-local proof demonstrates that the existing source range and
segment identity cannot express the requirement. Record any such expansion in
an amendment before implementation.

## Architecture and constraints

### One position, two projections

There is one logical reading position, not separate visual and narration
positions.

When narration is inactive, the existing visual locator remains authoritative.
When a unit is audible or playback is paused/buffering within an active
narration session, its prepared source range is the audible projection of that
same position. Programmatic following updates the reader projection without
being reinterpreted as user seek input.

The first M009 milestone must freeze the exact transition table, including:

- inactive to preparing;
- preparing to first audible unit;
- audible unit start and completion;
- playback-only pause and resume;
- buffer exhaustion and refill;
- user-originated visual navigation;
- previous/next boundary movement;
- chapter transition;
- reflow while active;
- explicit stop;
- publication or settings replacement;
- service failure; and
- application lifecycle cleanup.

### Honest segment-level synchronization

The source range attached by M005 is the only timing authority. The UI may
highlight the complete active segment and move the reader when that segment
becomes audible. It must not progressively color words from elapsed samples or
claim that a code-point offset is currently spoken.

Inside-segment start or seek must replay the containing stable narration
segment from its beginning unless the frozen authority proves another
deterministic, text-safe behavior. M009 must not clip normalized text or PCM to
approximate a word-level seek.

### Bounded audible-progress projection

Extend a desktop-local immutable prepared/playback unit or adjacent bounded
lookup so source range survives until the corresponding unit is released.
Prefer carrying the range with the unit over a second unbounded registry.

The projection must:

- remain indexed by the existing session, generation, segment, and sequence
  identities;
- expose no narration text or PCM to React state;
- emit exact unit-start/unit-complete transitions;
- bound any periodic played-frame observation cadence;
- release locator metadata with its unit or generation;
- reject stale identity before UI delivery; and
- leave the M007 wire protocol unchanged.

### Highlighting and automatic following

Use the existing semantic DOM registration and locator-range mapping boundary.
Milestone 1 must prove the smallest application-owned rendering approach in
production Chromium and packaged WebView2 before freezing it. Evaluate the CSS
Custom Highlight API and application-owned DOM decoration; accept only an
approach that preserves semantic content, text selection, reflow, incremental
rendering, focus, and security boundaries without a new runtime dependency.

Automatic following must:

- scroll only when the active range leaves an accepted visible comfort region;
- use deterministic placement and honor reduced motion;
- never focus publication prose or move the user's existing focus;
- suspend passive visual sampling during programmatic placement;
- resume sampling without a synthetic seek;
- materialize a later incremental-render batch or chapter before placement;
- avoid browser history, URL, quotation, or DOM-path state; and
- clear the highlight on stop, invalidation, close, and failure.

Highlighting cannot be the only state signal. Existing controls and safe status
text must expose playing, paused, and buffering state with no prose.

### User navigation and cancellation

A user-originated chapter or passage change while narration is active is an
explicit seek, not a temporary second viewport position. Freeze whether passive
wheel/touch scrolling immediately seeks or requires an explicit accessible
“start narration here” action after visual movement; do not infer intent from
programmatic following.

Every invalidating seek follows this order:

1. Replace the work identity or mark old audio ineligible.
2. Stop audible playback.
3. Abort narration preparation.
4. Release queued units through bounded cleanup.
5. Cancel active synthesis, or terminate/restart through the existing M008
   fallback when cooperative cancellation is unavailable.
6. Resolve and settle the canonical target locator.
7. Restart only if the frozen interaction policy preserves the prior play
   intent.

No old unit may become audible after step 1. Cleanup completion may be
asynchronous but eligibility revocation is immediate.

### Heard progress and persistence

Persist structural locators only. The recommended authority to validate in
Milestone 1 is:

- save the active segment start when it becomes audible;
- advance to its canonical range end only after playback completion;
- on pause, stop, hidden-document, `pagehide`, publication close, and
  application exit, save the latest completed heard checkpoint through the
  existing bounded coordinator; and
- after a crash or mid-segment exit, resume from the segment start rather than
  skipping unheard narration.

Do not write on each audio callback or animation frame. Coalesce repeated
requests through the existing repository and lifecycle bounds. A model failure
must not advance persisted progress beyond completed audible content.

### Privacy, memory, and accessibility

- Keep EPUB bytes, safe content, prepared text, and audio local.
- Keep prepared text and PCM outside React, logs, errors, snapshots, and
  persistence.
- Treat book identity and locator data as private structural state; never place
  them in URLs, raw diagnostics, or remote requests.
- Preserve one prepared batch, 16 retained prepared segments, one synthesis,
  256 retained audio units, and the simultaneous frame/byte ceiling from M008.
- Keep highlight/follow state bounded to the active generation and visible
  semantic document.
- Preserve keyboard operation, visible focus, semantic controls, forced-colors
  behavior, reduced motion, and content-free assistive status.
- Never move focus during automatic following or restoration.

## Milestones

## Milestone 1: Freeze synchronization and interaction authority

### Work

- Add a deterministic state/transition table covering position ownership,
  segment start/completion, pause/resume, buffering, seek, navigation, reflow,
  lifecycle, failure, and persistence.
- Build a model-free browser and packaged-WebView2 feasibility proof for
  segment-range decoration and focus-safe following.
- Decide passive-scroll behavior, addressable-passage selection, inside-segment
  restart, previous/next granularity, follow comfort region, and bounded
  observation cadence.
- Record the durable decision in `ADR-0017` (or the next available ADR number)
  and update this plan with the actual accepted behavior.
- Prove that no service protocol, M005 segmentation, or shared schema change is
  required, or explicitly amend scope before making one.

Accepted result:

- `synchronization-authority.ts` freezes one closed 16-event transition table
  for start, exact segment boundaries, pause/resume, buffering, user and
  programmatic navigation, reflow, stop, replacement, failure, and cleanup.
- The only timing authority is the prepared segment's existing source
  `LocatorRangeV1`. Word timing is unsupported; an inside-segment target
  replays its containing segment; previous/next moves by stable prepared
  segments.
- CSS Custom Highlight with the fixed `voxleaf-narration-active` name is
  selected over publication DOM wrappers or rendered overlays. Chromium and
  packaged WebView2 accept a noncollapsed range and CSSOM rule without
  publication mutation, focus/selection loss, URL change, runtime error, or
  external request.
- Automatic following uses the reader's existing 24-pixel comfort inset,
  instant placement, preserved focus, suspended passive sampling, and
  highlight-only fallback when geometry is unavailable.
- User-originated passive movement invalidates on its first canonical locator
  change and settles for 500 ms. Active play intent then restarts at the
  active visual locator; paused intent remains paused there.
- Exact `segment-started` and `segment-completed` events are complemented by
  optional observations no more often than every 250 ms.
- Persistence saves segment start when audible, segment end after completion,
  and the latest heard checkpoint on interruption. A mid-segment restore
  replays from segment start; periodic writes are prohibited.
- ADR-0017 and `synchronization-authority-v1.md` record the durable decision.
  No shared schema, M005 segmentation, M007 protocol, or dependency change is
  required.

### Validation

- Command: `pnpm.cmd --filter @voxleaf/desktop typecheck`
- Command: `pnpm.cmd --filter @voxleaf/desktop test`
- Command: `pnpm.cmd test:browser`
- Command: `pnpm.cmd test:native-startup`
- Expected result: the model-free interaction matrix passes in unit/component,
  production Chromium, and packaged WebView2 environments; focus, URL, and
  network assertions remain unchanged.
- Actual result: Passed on 2026-07-27. The desktop typecheck passes. The full
  desktop suite passes 280 Vitest tests and six Node WebDriver-client tests;
  the focused authority/range subset passes 10 tests. The new production
  Chromium proof passes with all six browser tests and the repository command
  exits zero when run outside the filesystem/process sandbox. The packaged
  WebView2 command also exits zero and passes the synchronization proof
  together with its existing focus, URL, runtime-error, and
  zero-external-request assertions.

### Status

Complete.

## Milestone 2: Project bounded audible progress

### Work

- Carry immutable source ranges through the bounded scheduler/player ownership
  path.
- Publish active unit, completed unit, and bounded played-frame observations
  keyed by existing work identities.
- Drop range metadata with released or invalidated units.
- Keep narration text and PCM out of React-facing snapshots.
- Add manual-clock tests for start, completion, pause, resume, underrun,
  invalidation, failure, and cleanup.

### Validation

- Command: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/tts/product-narration-coordinator.test.ts`
- Command: `pnpm.cmd --filter @voxleaf/desktop typecheck`
- Expected result: source-range observations follow FIFO playback exactly,
  stale transitions are absent, and existing resource/release bounds pass.
- Actual result: Passed on 2026-07-27. The focused scheduler/player/coordinator
  suite passes 29 tests, and the desktop typecheck passes. Manual-clock
  coverage proves exact FIFO starts/completions, 250 ms played-frame
  observations, silence while paused, same-unit resume, underrun/refill
  ordering, identity-first invalidation, failure suppression, and bounded
  cleanup. The coordinator exposes the immutable range and existing work
  identities only through its dedicated audible-progress subscription;
  serialized React-facing snapshots contain neither ranges, identities,
  narration text, nor PCM. `pnpm.cmd check:portable` also passes with 1,034
  Vitest tests, six Node WebDriver-client tests, 233 Python tests, all portable
  formatting/lint/type checks, and portable builds.

### Status

Complete.

## Milestone 3: Render segment highlighting and focus-safe following

### Work

- Map active locator ranges into the currently rendered semantic document.
- Render and clear the accepted segment-level highlight without changing safe
  publication text.
- Follow the active range only when required by the frozen comfort-region
  policy.
- Coordinate passive-tracker suspension and incremental/chapter rendering so
  programmatic movement cannot seek itself.
- Preserve focus, reduced motion, forced colors, text selection, and reader
  performance bounds.

### Validation

- Command: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/segment-highlight-controller.test.tsx src/reader/semantic-dom-range-mapper.test.tsx src/reader/ReaderPublication.test.tsx`
- Command: `pnpm.cmd test:browser`
- Command: `pnpm.cmd test:native-startup`
- Expected result: highlighting and following work across reflow, narrow
  viewports, incremental rendering, and chapter boundaries without focus,
  history, URL, or network side effects.
- Actual result: Passed on 2026-07-27. The focused controller/mapper/reader
  suite passes 25 tests, desktop typecheck and ESLint pass, and the full
  desktop suite passes 288 Vitest tests plus six Node WebDriver-client tests.
  All six production Chromium tests pass, including the production
  `::highlight(voxleaf-narration-active)` rule, reflow and narrow-viewport
  checks, unchanged focus/selection/URL/DOM, and zero external requests. The
  packaged WebView2 startup matrix also passes the synchronization proof,
  keyboard reader matrix, restart/restoration lifecycle, zero runtime errors,
  and zero external requests. `pnpm.cmd check:portable` passes with all
  formatting/lint/type checks, 1,039 Vitest tests, six Node
  WebDriver-client tests, 233 Python tests, generated-contract verification,
  and portable builds.

### Status

Complete.

## Milestone 4: Integrate synchronized user navigation

### Work

- Implement the frozen manual-scroll and passage-selection behavior.
- Add accessible previous/next narration-boundary and seek/start actions.
- Route user navigation through identity-first invalidation and bounded
  cancellation before restart.
- Keep pause/resume, quick/prepared intent, and reader placement coherent.
- Prove that chapter, book, voice/model configuration, close, and session
  replacement cannot play stale audio.

### Validation

- Command: `pnpm.cmd --filter @voxleaf/desktop test`
- Command: `pnpm.cmd test:browser`
- Command: `pnpm.cmd test:native-startup`
- Expected result: all interaction transitions preserve one logical position
  and zero stale playback while controls remain keyboard-operable and
  content-free.
- Actual result: Passed on 2026-07-27. Focused coordinator/control/reader
  coverage passes 30 tests. The full desktop command passes 296 Vitest tests
  plus six native WebDriver-client tests. All six production Chromium tests
  pass with zero external requests, and the packaged WebView2 startup matrix
  passes its TTS cancellation/replacement, accessible keyboard reader,
  synchronization feasibility, cleanup, zero-error, and zero-external-request
  checks. `pnpm.cmd check:portable` also passes formatting, lint, TypeScript
  and Python type checks, generated-contract verification, 1,047 Vitest
  tests, six Node WebDriver-client tests, 233 Python tests, and portable
  builds.

### Status

Complete.

## Milestone 5: Persist heard progress and prove lifecycle behavior

### Work

- Implement the frozen segment-start/completion checkpoint policy.
- Coalesce narration checkpoints with existing visual-location persistence.
- Cover pause, stop, buffering, hidden document, `pagehide`, close, restart,
  failure, exact-file reselection, and recovered locator behavior.
- Prove reflow and programmatic following do not produce redundant or
  regressive saves.
- Keep unsupported future envelope versions untouched.

### Validation

- Command: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/persistence/reader-position-save-coordinator.test.ts src/persistence/reader-position-restore-coordinator.test.ts`
- Command: `pnpm.cmd test:browser`
- Command: `pnpm.cmd test:native-startup`
- Expected result: saved position never advances beyond completed audible
  content, model failure cannot corrupt it, and restart restores a canonical
  non-skipping position.
- Actual result: Passed on 2026-07-27. The focused persistence/repository
  matrix passes 62 tests across the save, restore, repository, and narration
  bridge suites. The application integration subset passes 49 tests and the
  full desktop command passes 304 Vitest tests plus six Node
  WebDriver-client tests. Desktop typecheck, TypeScript formatting, ESLint,
  and `git diff --check` pass. All six production Chromium tests pass,
  including reflow/restoration and synchronization proofs. The packaged
  WebView2 matrix passes exact-position restart/reselection, lifecycle
  cleanup, synchronization, zero runtime errors, and zero external requests.
  Exact audible start and matching completion are the only new checkpoints;
  periodic progress, active visual movement, programmatic following, and
  reflow cannot advance or regress them.

### Status

Complete.

## Milestone 6: Validate the exact-host synchronized demo

### Work

- Extend the existing synthetic exact-host path with audible segment
  transitions, highlight/follow observation, pause/resume, seek, chapter
  transition, underrun/refill, and stale suppression.
- Retain the outbound-blocking firewall rule and content-safe measurement
  boundary.
- Measure command-to-audible time, follow latency at unit boundaries,
  cancellation latency, underruns, buffering, RAM, VRAM, retained units,
  cleanup, and external requests.
- Run manual keyboard, focus, reduced-motion, and readable-highlight checks on
  the exact host without storing book text or audio.
- Keep the result explicitly exact-development-only if all synchronization
  behavior passes.

### Validation

- Command: `pnpm.cmd test:tts:adaptive-exact-host`
- Expected result: the synthetic constrained demo maintains the correct
  segment-level visual/audible relationship, zero stale playback, bounded
  resources, prompt cancellation, zero generated-audio persistence, and zero
  external requests. Performance remains an observation, not a production
  claim.
- Actual result: Passed on 2026-07-27 on the documented RTX 5060 Laptop GPU
  Windows/CUDA host with the outbound-blocking rule enabled. The packaged
  synthetic matrix observed six audible transitions, valid segment ranges,
  0.7 ms p95 follow latency, focus-safe keyboard pause/resume, a 40.815-second
  passage restart, a 40.913-second chapter restart, no stale playback, and
  one natural underrun followed by refill after 100.148 seconds. Quick
  command-to-audible was 42.621 seconds with 16.240 seconds of playable lead;
  the one-minute prepared mode reached 74.640 seconds of playable audio and
  became audible after 135.522 seconds. Cancellation completed in 190 ms.
  Peak process-tree working set was 3,398,922,240 bytes and peak dedicated GPU
  memory was 5,178 MiB. Cleanup returned retained/discarded units and
  generated-audio files to zero, dedicated GPU memory to zero, and observed
  zero external requests. Performance remains exact-host evidence only:
  378.46 buffering seconds per playback minute is above the MVP allowance and
  does not promote a standard production profile.

### Status

Complete.

## Milestone 7: Record the synchronization decision and close validation

### Work

- Reconcile implementation with the frozen ADR and record amendments.
- Update product requirements, glossary, architecture overview, system diagram,
  performance/testing/troubleshooting guidance, roadmap, and this ExecPlan with
  actual results.
- Review the complete diff for unrelated changes, sensitive content, generated
  audio, private paths, model artifacts, logs, and unbounded state.
- Move this plan to `docs/plans/completed/` only after all acceptance evidence
  and required pull-request checks pass.

### Validation

- Command: `pnpm.cmd check`
- Command: `pnpm.cmd check:portable`
- Command: `git diff --check`
- Expected result: all deterministic repository checks pass on the development
  host, portable checks pass, required Ubuntu and Windows pull-request checks
  pass, and the documentation claims no more than the retained evidence.
- Actual result: Current-status documentation was reconciled on 2026-07-27 and
  `git diff --check` passed. Full `pnpm.cmd check`,
  `pnpm.cmd check:portable`, complete-diff privacy review, and required
  pull-request CI have not yet run for Milestone 7.

### Status

In progress. Documentation reconciliation is complete; complete-diff
repository/privacy review, full checks, and required pull-request CI remain.

## Testing and benchmark strategy

### Deterministic tests

- Pure transition-table tests for visual/audible authority and invalidation.
- Manual-clock FIFO/player tests for exact unit start/completion and progress.
- Component tests for range mapping, decoration, following, focus, reflow, and
  passive-tracker suspension.
- Persistence tests for non-skipping checkpoints, save coalescing, lifecycle,
  failure, and unsupported-version preservation.
- Identity/race tests for late preparation, late synthesis, old player
  callbacks, superseded navigation, and cleanup.
- Resource tests at exact and max-plus-one range/unit/metadata bounds.
- Privacy tests that reject narration text, quotations, audio, paths, or
  unbounded identifiers in UI snapshots, errors, logs, and storage.

### Browser and packaged tests

- Production Chromium covers real ranges, geometry, scrolling, focus, reduced
  motion, forced colors, reflow, narrow viewports, incremental rendering, and
  zero non-loopback requests.
- Packaged WebView2 repeats the critical focus-safe follow, navigation,
  lifecycle, storage, and no-external-request paths.
- Use repository-authored synthetic EPUBs only. Delete disposable application
  profiles and synthetic fixtures after each run.

### Hardware-specific benchmark

- Run only after deterministic and packaged model-free evidence passes.
- Use the exact frozen Windows/CUDA Qwen/Serena configuration and firewall
  isolation already required by M007/M008.
- Never commit raw audio, raw book text, model artifacts, private paths, or
  sensitive logs.
- Report synchronization correctness separately from TTS throughput. A correct
  segment-level UI does not resolve ADR-0013's sustained-performance blocker.

## Risks and rollback

- Segment-level highlighting may feel coarse. Keep it honest; do not synthesize
  fake word timing. A later timestamp-capable profile may add a new authority.
- Automatic following can disorient users or steal focus. Freeze a conservative
  comfort region, disable smooth movement under reduced motion, and fall back
  to highlight without follow if placement cannot be proved safe.
- Passive scrolling can create feedback loops. Keep a programmatic-follow
  suppression token and test late observer callbacks.
- Extending unit metadata could leak locator state or outlive audio. Keep it
  desktop-local, immutable, identity-bound, and released with the unit.
- Frequent progress callbacks or saves could hurt responsiveness. Emit exact
  boundary transitions, bound periodic observations, and persist only
  coalesced checkpoints.
- Cancellation races could replay stale audio. Revoke eligibility before
  stopping playback or awaiting process cleanup.
- Chapter transitions may require incremental materialization. Reuse the reader
  navigation/restoration boundary rather than adding DOM paths or unbounded
  rendering.
- Model failure could skip content. Persist completed heard progress only and
  restart at the containing segment boundary.

Each milestone should be independently reversible. If highlighting/following
fails browser or accessibility validation, keep the existing M008 narration
path hidden behind its exact-development gate and remove the new projection
consumer; do not weaken stale suppression, memory bounds, or reader
persistence. Do not use destructive storage migration as rollback.

## Progress log

- 2026-07-27: Audited completed M005, M007, and M008 authorities plus the
  implemented reader, coordinator, scheduler, player, persistence, and DOM
  mapping boundaries.
- 2026-07-27: Reconciled current documentation with the final M008 exact-host
  results and actual constrained audible runtime.
- 2026-07-27: Created this focused roadmap-Milestone-9 ExecPlan. No M009
  production implementation has started.
- 2026-07-27: Implemented and unit-tested the frozen 16-event segment-level
  synchronization authority plus noncollapsed semantic DOM range mapping.
- 2026-07-27: Proved CSS Custom Highlight decoration and focus-safe
  24-pixel-comfort-region following in production Chromium and packaged
  WebView2. The packaged proof passes under the real CSP with unchanged
  publication content, selection, focus, URL, and external-request boundary.
- 2026-07-27: Accepted ADR-0017, documented synchronization authority v1, and
  completed M009 Milestone 1 without changing shared contracts, M005
  segmentation, M007 protocol v1, or runtime dependencies.
- 2026-07-27: `pnpm.cmd check` and `pnpm.cmd check:portable` passed after the
  Milestone 1 changes, including formatting, lint, TypeScript/Python
  typechecks, 1,031 TypeScript tests plus six Node driver-client tests, 25 Rust
  tests, 233 Python tests, and full/portable builds. Browser and packaged
  WebView2 commands also exited zero outside the Windows process sandbox.
- 2026-07-27: Implemented M009 Milestone 2. Immutable source ranges and
  canonical sequences now follow eligible FIFO audio ownership; the player
  emits exact start/completion and bounded played-frame observations; and the
  coordinator forwards them outside its React-facing snapshot.
- 2026-07-27: The focused Milestone 2 suite passes 29 tests and the desktop
  typecheck passes. No shared schema, M005 segmentation, M007 protocol, model,
  native, persistence, or dependency change was required.
- 2026-07-27: `pnpm.cmd check:portable` passes after the Milestone 2 changes:
  1,034 Vitest tests, six Node WebDriver-client tests, 233 Python tests, all
  portable formatting/lint/type checks, generated-contract verification, and
  portable builds pass.
- 2026-07-27: Implemented M009 Milestone 3. The application now connects the
  coordinator's exact audible transitions to one bounded semantic range
  projection, production Custom Highlight entry, and focus-safe automatic
  reader following across incremental registration and chapter replacement.
- 2026-07-27: Focused component tests, desktop typecheck, ESLint, all 288
  desktop Vitest tests, six Node driver-client tests, all six production
  Chromium tests, and the packaged WebView2 startup/synchronization matrix
  pass. No shared schema, M005 segmentation, M007 protocol, storage shape,
  native capability, runtime dependency, or network boundary changed.
- 2026-07-27: The final Milestone 3 `pnpm.cmd check:portable` gate passes:
  1,039 Vitest tests, six Node WebDriver-client tests, 233 Python tests,
  formatting, lint, TypeScript/Python type checks, generated-contract
  verification, and portable builds all pass.
- 2026-07-27: Implemented M009 Milestone 4. The product coordinator now
  invalidates its work identity before playback/preparation/queue/synthesis
  cleanup, settles passive visual movement at the frozen trailing 500 ms
  boundary, preserves active or paused intent, and restarts only after the
  canonical target settles.
- 2026-07-27: Chapter and stable prepared-segment actions now wait for
  containment before using the reader's existing focus-safe canonical
  placement. The exact profile is immutable while active, the recent
  structural boundary history is capped at 64 ranges outside React state, and
  fixed previous/next/visible-passage controls expose no narration text, PCM,
  work identity, path, or model artifact.
- 2026-07-27: The focused 30-test interaction suite, desktop typecheck,
  TypeScript lint, all 296 desktop Vitest tests, six Node WebDriver-client
  tests, all six production Chromium tests, and the packaged WebView2
  startup/synchronization matrix pass. The sandboxed browser run completed all
  assertions but could not terminate its preview child; the unrestricted
  rerun exited zero.
- 2026-07-27: The final Milestone 4 `pnpm.cmd check:portable` gate passes:
  formatting, lint, TypeScript/Python type checks, generated-contract
  verification, 1,047 Vitest tests, six Node WebDriver-client tests, 233
  Python tests, and portable builds all pass. The only Python warning is the
  sandbox-denied optional pytest cache write; all tests pass.
- 2026-07-27: Implemented M009 Milestone 5. A desktop-local bridge temporarily
  assigns persistence authority to exact audible segment boundaries, cancels
  pending visual saves when narration starts, flushes the latest heard
  checkpoint at pause, buffering, stop, failure, hidden-document, `pagehide`,
  replacement, close, and cleanup, and protects it from reflow until genuine
  user navigation resumes visual authority.
- 2026-07-27: Segment starts persist their canonical source-range start;
  matching completions advance to the canonical range end. Played-frame
  progress produces no write, unmatched completion is rejected, mid-segment
  interruption restores the segment start, and existing unsupported-version
  storage preservation remains unchanged.
- 2026-07-27: The focused 62-test persistence matrix, 49-test application
  integration subset, desktop typecheck, formatting, ESLint, all 304 desktop
  Vitest tests, six Node WebDriver-client tests, all six Chromium tests, and
  the packaged WebView2 restart/reselection/lifecycle matrix pass. The
  packaged run retains zero runtime errors and zero external requests.
- 2026-07-27: The final Milestone 5 `pnpm.cmd check:portable` and
  `pnpm.cmd check` gates pass outside the filesystem sandbox: formatting,
  TypeScript/Rust/Python lint and type checks, generated-contract
  verification, 1,055 Vitest tests, six Node WebDriver-client tests, 25 Rust
  tests, 233 Python tests, portable builds, the native release build, and
  Python source/wheel builds pass. Pytest alone warns that its optional cache
  cannot be written; the test run itself passes.
- 2026-07-27: Extended the packaged exact-host matrix with real audible
  transition, highlight/follow, keyboard pause/resume, passage seek, chapter
  restart, natural depletion/refill, active cancellation, RAM/VRAM, bounded
  ownership, accessibility-media, generated-audio cleanup, and external-request
  observations. All output remains synthetic and content-free.
- 2026-07-27: Exact-host diagnosis found that a late passive visual sample
  after automatic following could be misclassified as a user seek and restart
  narration. The reader now accepts passive locator movement during active
  narration only after bounded wheel, touch, pointer, or reading-navigation-key
  intent; follow settlement also retains its suppression token for two browser
  frames. A coordinator guard ignores samples inside the current audible
  half-open range.
- 2026-07-27: `pnpm.cmd test:tts:adaptive-exact-host` passed on the documented
  Windows/CUDA host. It measured six segment transitions, 0.7 ms p95 follow,
  zero stale playback, one natural underrun/refill, 190 ms cancellation,
  5,178 MiB peak dedicated GPU memory, zero retained units/audio files after
  cleanup, and zero external requests. The observed 378.46 buffering seconds
  per playback minute remains a performance limitation, not a production
  claim.
- 2026-07-27: Final validation on the implementation branch passes:
  `pnpm.cmd test:browser` (six Chromium scenarios),
  `pnpm.cmd test:native-startup` (packaged WebView2 lifecycle and
  synchronization), `pnpm.cmd check:portable`, and `pnpm.cmd check`.
  The aggregate gates pass 196 shared, 555 EPUB, 305 desktop, six Node
  WebDriver-client, 25 Rust, and 233 Python tests plus all formatting, lint,
  type, generated-contract, portable, native, and Python distribution builds.
  Pytest reports only the previously documented optional cache-write warning;
  all tests pass.
- 2026-07-27: Reconciled the product brief, MVP status, architecture overview,
  canonical system diagram, testing guidance, broad historical plan, and this
  final-validation section with the accepted Milestone 6 exact-host evidence.
  Every current-status surface now records Milestones 1-6 complete, keeps M009
  Milestone 7 open, and retains the standard TTS performance blocker.

## Discoveries and decisions

- The exact adapter returns one complete waveform per segment and no word
  timestamps. Segment source ranges are therefore the only honest initial
  synchronization authority.
- `AdaptivePcmPlayerObservation.activeSequence` identifies the audible unit,
  but current scheduler/player metadata does not retain its source range.
- `ProductNarrationCoordinator` passes a prepared segment's source range into
  M007, then removes the prepared entry after synthesis. M009 must preserve a
  bounded structural range alongside playback ownership.
- `SemanticDomRangeMapper` already owns semantic code-point/DOM mapping and the
  reader already suspends passive tracking during programmatic navigation.
  M009 should extend those boundaries rather than derive DOM paths or create a
  second position.
- M009 does not need a protocol-v1 field: the source range exists before
  synthesis and playback remains ordered by the desktop coordinator.
- Range metadata belongs beside the sole-owner eligible FIFO unit, not inside
  PCM metadata or the M007 response. Invalidation strips that projection
  before bounded payload cleanup, so stale range transitions cannot escape.
- Audible progress is a dedicated imperative subscription rather than part of
  `ProductNarrationSnapshot`. This gives the later reader integration the
  required structural timing without causing 250 ms React snapshot churn or
  exposing narration text/PCM.
- The accepted persistence policy favors replaying part of a segment over
  skipping unheard content after interruption: save segment start when
  audible, advance only on completion, and restore a mid-segment interruption
  from segment start.
- Existing `PersistedReadingStateV1` and its two-key Web Storage envelope are
  sufficient. Heard progress is still one canonical `ReadingLocatorV1`; no
  shared schema, storage migration, narration text, PCM, DOM range, geometry,
  timestamp, or protocol field is required.
- Narration temporarily suppresses both passive and explicit visual saves.
  After interruption, the last heard checkpoint remains protected from
  reflow; the first later genuine visual navigation returns authority to the
  existing bounded visual save policy.
- Matching completion to the currently audible segment prevents an
  out-of-order or stale completion from advancing persistence even though the
  product coordinator already filters work identity before publishing.
- The CSS Custom Highlight API accepts real DOM ranges in both supported proof
  engines. Adding a test-only inline style is rejected by the packaged CSP;
  inserting and removing the proof rule through the existing same-origin
  stylesheet's CSSOM validates the real security boundary without weakening
  it.
- Exact WebView2 playback exposed a late-observer feedback loop that
  deterministic one-frame follow tests did not reproduce. Programmatic visual
  samples and user-originated passive movement therefore require distinct
  authority: background samples are ignored while narration is active, while
  bounded wheel, touch, pointer, and reading-navigation-key intent authorizes
  the existing 500 ms synchronized seek. This preserves ADR-0017 rather than
  weakening passive-scroll behavior.
- Natural underrun/refill is hardware- and text-dependent. The exact matrix
  observes it when it occurs instead of injecting artificial service delay;
  this run depleted once and refilled after 100.148 seconds. Deterministic
  scheduler/player tests remain the exhaustive transition authority.
- The existing reader's 24-pixel visual-locator inset is sufficient as the
  synchronization comfort region, avoiding a second geometry policy.
- Mapper registration notifications are the required bridge for incremental
  rendering: the projection retains only one immutable active source range,
  not DOM paths or geometry, and remaps it when the relevant semantic block
  appears.
- Treating automatic next-chapter materialization as handled programmatic
  navigation prevents the existing destination-focus policy and passive
  tracker from reinterpreting narration following as user input.
- Waiting for the old synthesis operation to settle after cancellation is
  necessary before starting a replacement run. Without that join, the stale
  promise can still occupy the single pump slot and leave the replacement
  scheduler idle even though its identity is correct.
- Previous/next needs bounded structural history after synthesized entries
  leave the preparation map. Retaining at most 64 immutable source ranges is
  sufficient for recent navigation without retaining narration text, PCM, DOM
  paths, geometry, or unbounded book state.
- The current exact Qwen/Serena model and voice are fixed configuration rather
  than mutable product controls. Active quick/prepared selection is also
  frozen. A future voice/model setting must close and replace the coordinator
  so the implemented book/session replacement invariant remains authoritative.
- A completed segment advances the internal audible projection to its range
  end while retaining the last-heard highlight and performing no second
  follow, matching the frozen transition table.
- Chromium and packaged WebView2 both accept the selected proof. Browser and
  native GUI suites must run outside the Codex filesystem/process sandbox on
  this Windows host so their child process trees can terminate normally;
  required pull-request checks remain final closeout evidence.
- The existing exact-development profile remains slower than the MVP
  sustained-buffering target. Synchronization work can improve coherence and
  accessibility, but it cannot claim real-time or uninterrupted narration.

## Final validation results

M009 Milestones 1 through 6 are complete. Authority, source-range projection,
reader highlighting/following, synchronized user navigation, non-skipping
heard-position persistence, focused unit/component, full desktop, six-test
Chromium, packaged WebView2, native/portable repository, privacy, and exact-host
synchronization validation pass through the recorded checkpoints. The accepted
exact-host result is recorded under Milestone 6 and in the progress log. M009
Milestone 7 documentation/repository/privacy reconciliation and its required
pull-request CI remain.

Milestone 7 must record:

- the accepted ADR and any amendments;
- focused unit/component/browser/native command results;
- exact-host content-safe synchronization and resource observations;
- privacy, accessibility, cancellation, stale-audio, and persistence evidence;
- root and portable repository results;
- required pull-request CI results; and
- the final supported/deferred product claims.
