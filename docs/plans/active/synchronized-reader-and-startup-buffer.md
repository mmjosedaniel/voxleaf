# Synchronized visual reader, position restoration, and startup audio lead

## Relationship to the roadmap and completed milestone plans

This broad plan predates the milestone-specific implementation plans and intentionally spans visual reading, narration synchronization, and audio startup work. The completed [`M004-reflowable-visual-reader-and-position-restoration.md`](../completed/M004-reflowable-visual-reader-and-position-restoration.md), [`M005-narration-text-preparation.md`](../completed/M005-narration-text-preparation.md), [`M006-local-tts-feasibility-and-engine-profiles.md`](../completed/M006-local-tts-feasibility-and-engine-profiles.md), [`M006-001-local-tts-profile-blocker-resolution.md`](../completed/M006-001-local-tts-profile-blocker-resolution.md), [`M006-002-qwen-short-segment-batch-feasibility.md`](../completed/M006-002-qwen-short-segment-batch-feasibility.md), [`M007-local-tts-service-and-process-protocol.md`](../completed/M007-local-tts-service-and-process-protocol.md), and [`M008-bounded-adaptive-prebuffering.md`](../completed/M008-bounded-adaptive-prebuffering.md) plans record the implementation authority and evidence for roadmap Milestones 4 through 8. The focused [`M009-synchronized-reading-and-narration.md`](M009-synchronized-reading-and-narration.md) plan now supersedes this document for the remaining synchronization implementation. Retain this document only as broad historical context.

ADR-0015,
the completed
[`M007-local-tts-service-and-process-protocol.md`](../completed/M007-local-tts-service-and-process-protocol.md),
and
[`M008-bounded-adaptive-prebuffering.md`](../completed/M008-bounded-adaptive-prebuffering.md)
own the detailed service/protocol and completed scheduling authority. They
preserve this plan's approximately 15-playable-second quick-start rule and add
explicit prepared playback, bounded generation during playback-only pause,
truthful frontier buffering, optional adaptive boundary waits, and an
approximately 30-minute simultaneous ceiling. This older cross-milestone plan
does not override those decisions or the focused M009 authority.

## Goal

Implement a normal reflowable EPUB reading surface that shares one stable reading position with narration, restores the user's last visible passage, and starts playback immediately after approximately 15 seconds of playable audio—not 15 seconds of wall-clock waiting—has accumulated in bounded memory.

## User-visible outcome

- Opening a new EPUB shows its readable content in a normal ereader layout.
- Reopening a known book returns to the same logical passage the user last viewed, even if pagination changes.
- Pressing play narrates from the visible reading position.
- The page containing the narrated passage stays visible and its current paragraph is highlighted.
- Playback begins as soon as approximately 15 seconds of valid playable audio is buffered. A fast model is not held by a timer.
- Navigation, seeking, or session-changing settings invalidate obsolete audio and keep visual and narration position aligned.

## Current state

Roadmap Milestones 1 through 8 are complete. The repository now has a reproducible cross-language workspace and CI, canonical shared schemas and runtime decoders, deterministic test fakes, a React/Tauri desktop application, an implemented framework-independent `@voxleaf/epub` boundary for bounded in-memory ingestion, immutable semantic documents, lazy raster reads, deterministic locator creation/resolution, and bounded locator-linked narration preparation. The completed TTS feasibility work selects no viable standard production profile while permitting the exact-development constrained demo.

The desktop implements capability-free local EPUB selection, publication lifecycle, safe semantic text/static-image rendering, TOC/internal/chapter navigation, continuous reflowable layout and closed preferences, keyboard/focus behavior, bounded large-chapter rendering, semantic code-point/DOM mapping, passive visual-locator tracking, reflow preservation, bounded Web Storage persistence, and exact/nearest-valid restoration after exact-file reselection. Completed M007 implements and validates the constrained development-only Qwen/Serena engine, versioned process protocol, native supervisor, and typed one-unit handoff. Completed M008 calls `OpenedPublication.prepareNarration` from the active visual locator and connects one-at-a-time synthesis to a bounded multi-unit FIFO, Web Audio player, and quick/prepared controls. Speech highlighting/following, synchronized seek and persistence, general hardware detection, and an installer remain unimplemented.

## Scope and non-goals

### Scope

- Safe visual rendering of reflowable EPUB text and local images.
- Stable logical reading locators and nearest-valid recovery.
- Local persistence and restoration of the current visible locator.
- Mapping among rendered content, prepared narration segments, and locator ranges.
- Shared visual, narration, highlighting, and saved position.
- A bounded startup gate based on playable audio duration.
- Cancellation and stale-generation rejection after navigation or configuration changes.
- Unit, integration, end-to-end, accessibility, and performance validation.

### Non-goals

- Pixel-perfect reproduction of every publisher stylesheet.
- Fixed page numbers that remain identical across layouts or devices.
- DRM-protected EPUB support.
- Persisting full extracted text or generated audio.
- Cloud synchronization.
- Selecting the final TTS engine, process transport, or renderer dependency without a prototype and documented decision.

## Relevant files and documentation

- `AGENTS.md`
- `docs/product/project-brief.md`
- `docs/product/mvp.md`
- `docs/product/glossary.md`
- `docs/architecture/overview.md`
- `docs/architecture/system-diagram.md`
- `docs/architecture/performance-budget.md`
- `docs/architecture/decisions/ADR-0002-in-memory-audio.md`
- `docs/architecture/decisions/ADR-0003-stable-reading-locators.md`
- `docs/architecture/decisions/ADR-0004-start-after-audio-lead.md`
- `docs/architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md`
- `docs/plans/completed/M006-local-tts-feasibility-and-engine-profiles.md`
- `docs/development/setup.md`
- `docs/development/testing.md`
- Implementation areas: `apps/desktop`, `packages/epub`, `packages/shared`, and `services/tts`

## Architecture and constraints

Define shared contracts before process-specific code. At minimum, the contracts should represent a book identity, spine item, reading locator, locator range, layout-independent progression, reading session and generation, narration segment, framed audio metadata, buffer state in playable seconds, and persisted reading state.

The EPUB layer owns safe archive/content handling and stable locator resolution. The desktop renderer owns viewport-dependent pagination. The reading-session coordinator owns the active locator and session generation. The TTS client and playback buffer accept only active-session work. UI state may reference audio status but must not hold raw PCM data.

Persist structural locators and preferences locally without storing book prose. Disable scripts and remote resources in rendered EPUB content, isolate publisher styles, and validate restored locators. Keep all queues and audio buffers explicitly bounded. Generated audio remains memory-only and is discarded after playback or invalidation.

The initial gate starts playback when contiguous valid audio reaches approximately 15 seconds, or when a complete shorter remaining range is ready. It must use audio frame duration, not chunk count, text length, or elapsed time.

## Milestone 1: Establish the toolchain and shared contracts

### Work

- Bootstrap only the repository toolchains selected through the documented setup process.
- Define typed locator, reading-state, narration-range, session-generation, audio-frame, and buffer-status contracts.
- Define versioned serialization for persisted reading state without book text.
- Add deterministic contract and serialization tests.

### Validation

- Commands: the implemented root and focused command surfaces are documented in `docs/development/setup.md`, `docs/development/testing.md`, and the completed M001/M002 ExecPlans.
- Expected result: contracts compile, serialization round-trips, invalid locators fail safely, and no serialized fixture contains book prose.
- Actual result: complete through roadmap Milestones 1 and 2. The validated toolchain, shared contracts, deterministic fakes, and exact commands are recorded in the completed M001 and M002 ExecPlans.

### Status

Complete

## Milestone 2: Render EPUB content and resolve reading locations

### Work

- Validate and parse a synthetic EPUB fixture as untrusted input.
- Sanitize XHTML, SVG, styles, and local resource references for isolated rendering.
- Render text and images in a readable reflowable surface.
- Create and resolve stable locators across spine items.
- Preserve the logical locator during viewport and typography reflow.

### Validation

- Unit tests for locator creation, resolution, fallback, and reflow invariants.
- Integration tests using a small synthetic EPUB with multiple chapters, images, headings, and paragraphs.
- Accessibility checks for keyboard navigation, focus, reading order, and semantic controls.
- Actual result: satisfied by roadmap Milestones 3 and 4. `@voxleaf/epub` validates bounded in-memory EPUBs, projects safe semantic content and raster descriptors, and creates/resolves stable locators. The desktop implements capability-free file access, bounded raster decoding, direct semantic rendering, navigation, reflow preservation, and the approved keyboard/focus/accessibility matrix.

### Status

Satisfied by completed roadmap Milestones 3 and 4

## Milestone 3: Persist and restore one reading position

### Work

- Update the active locator as the user scrolls, pages, selects a passage, or navigates chapters.
- Persist the locator locally at safe lifecycle points.
- Restore the exact or nearest valid passage before presenting a reopened book.
- Start narration from the active visual locator.
- Consume the implemented locator-linked prepared narration segments from the desktop.
- Map playback progress back to those locator ranges for highlighting and reader following.

### Validation

- Unit tests for persistence migration and invalid-locator recovery.
- Integration test proving rendered content and prepared narration segments share locator ranges.
- End-to-end test: navigate to a later passage, close the book, reopen it, and verify that the same passage is visible.
- End-to-end test: start narration and verify that the visible highlighted paragraph follows segment boundaries.
- Actual result: the desktop visual-position owner, semantic range mapper, bounded storage adapter, lifecycle save coordinator, and exact/nearest-valid restoration flow are implemented and validated. Narration start, narration-segment mapping, speech highlighting, and playback following remain unimplemented later-milestone work.

### Status

Partially satisfied: visual position/persistence/restoration complete; narration synchronization not started

## Milestone 4: Gate startup on playable audio duration

### Work

- Implement a bounded in-memory audio buffer that reports contiguous playable seconds.
- Accumulate only frames for the active session and generation.
- Start playback immediately at approximately 15 seconds of valid audio, or when a complete shorter remaining range is ready.
- Expose separate loading, generating, buffer-depth, playing, and underrun states.
- Reset the gate and discard stale work after seeks, navigation, configuration changes, book close, or session replacement.

### Validation

- Unit tests with deterministic frame formats and durations at below, exactly at, and above the threshold.
- Unit test proving elapsed wall-clock time alone never opens the gate.
- Integration test proving stale-session frames do not increase active buffer depth.
- End-to-end test proving playback begins immediately when the threshold is reached.
- Performance measurement of cold/warm startup latency, playable depth at start, gate-to-audible delay, RTF, underruns, memory, and cancellation latency.
- Actual result: shared session, audio-frame, and buffer-status contracts plus deterministic fakes exist. No runtime queue, in-memory audio buffer, startup gate, player, or underrun instrumentation exists.

### Status

Not started

## Milestone 5: Complete system validation and documentation

### Work

- Run all repository-defined format, lint, type, unit, integration, end-to-end, build, and packaging checks.
- Complete a sustained reading test across page and chapter boundaries.
- Document supported hardware, observed startup behavior, locator limitations, recovery behavior, and accessibility results.
- Review logs and persisted state for book text or audio leakage.
- Review the final diff for unrelated changes and move this plan to `docs/plans/completed/` only when all requested behavior exists and passes validation.

### Validation

- Commands: run the existing root quality surface and add exact integration, end-to-end, accessibility, and benchmark commands only when repository configuration defines them.
- Expected result: all deterministic checks pass; hardware-specific results are reported separately; stale audio played is zero; generated audio persistence is zero.
- Actual result: reader, persistence, accessibility, browser/native interaction,
  reader performance/resource coverage, constrained TTS, and bounded audio
  playback exist within completed Milestones 4 through 8. Synchronization,
  general hardware support, packaging, and the complete product journey remain
  unimplemented, so this broad final milestone cannot close.

### Status

Not started

## Testing and benchmark strategy

Use synthetic or documented public-domain EPUB fixtures. Keep deterministic correctness tests independent of model weights and GPU hardware by using a fake TTS stream with controllable frame timing, duration, session identity, and cancellation behavior.

Hardware benchmarks should report model and device configuration alongside cold and warm startup latency, initial playable depth, gate-to-audible delay, RTF percentiles, underrun count and duration, peak memory, and cancellation latency. Never include book prose, generated audio, private paths, or raw user data in reports.

## Risks and rollback

- EPUB CFI support may vary among parsing or rendering candidates. Prototype locator round-tripping before committing to a dependency.
- Publisher CSS or malformed markup may break layout or escape styling. Keep sanitization and renderer isolation at the EPUB boundary.
- Automatic page following could disorient a user who manually navigates during playback. Define how manual navigation seeks or suspends following before implementation.
- A 15-second lead may be too expensive on slow hardware or unnecessary on fast hardware. Measure it, retain explicit bounds, and use a later documented decision for adaptive tuning.
- Frequent persistence writes may affect responsiveness or storage. Debounce safely without losing lifecycle saves.

Documentation-only changes can be rolled back independently. Persisted locator contracts now exist as versioned shared contracts; future serialized shape changes require a new contract-family version and an explicit migration rather than destructive reset.

## Progress log

- 2026-07-20: Documented the requested visual-reader, position-restoration, synchronization, and initial-audio-lead behavior.
- 2026-07-20: Added accepted decisions for stable logical locators and duration-based startup gating.
- 2026-07-20: Confirmed that no implementation or executable validation commands currently exist.
- 2026-07-20: Verified local Markdown links, whitespace, character encoding, required plan sections, and removal of the obsolete 15-second wall-clock allowance.
- 2026-07-22: Reconciled this plan's current-state and milestone evidence with completed roadmap Milestones 1 through 3. Reader, persistence, narration, TTS, audio, and integrated feature work remain incomplete.
- 2026-07-24: Reconciled current state with Milestone 4 implementation. Visual reading, navigation, bounded persistence, exact/nearest restoration, accessibility interaction, and reader performance/resource evidence are implemented; narration, TTS, audio, synchronization, hardware, and packaging remain deferred.
- 2026-07-25: Reconciled current state with completed Milestone 5. Bounded locator-linked narration preparation is implemented and validated in `@voxleaf/epub`; the desktop caller, TTS, audio, synchronization, hardware, and packaging remain unimplemented.
- 2026-07-25: Reconciled current state with completed Milestone 6. The candidate-neutral feasibility harness, both exact candidate runs, and the no-viable-profile decision are complete; Milestone 7 is blocked pending a newly frozen evaluation that selects a viable profile.
- 2026-07-26: Reconciled current state with completed Milestones 6.1 and 6.2.
  ADR-0015 permits only the exact one-GPU constrained demo, M007 now owns its
  unimplemented service/process boundary, and M008 owns later adaptive
  playback. Standard production TTS remains blocked.
- 2026-07-27: Reconciled current state with completed M007 and M008. The
  constrained service, exact-development coordinator, bounded FIFO, Web Audio
  playback, and quick/prepared controls are implemented and validated.
  Synchronized highlighting/following and the standard production profile
  remain deferred.

## Discoveries and decisions

- "Current page" cannot be stored reliably as a rendered page number because EPUB content reflows. The durable position is a logical locator; the page is reconstructed.
- The visual position and narration position form one application-level reading position rather than two independent cursors.
- "15 seconds ahead" means playable media duration in memory, not elapsed generation time or a fixed timer.
- The short-remaining-range rule prevents the startup gate from waiting forever near the end of available content.

## Final validation results

Initial documentation validation completed on 2026-07-20:

- All local Markdown links resolve.
- No Markdown files contain trailing whitespace or mojibake markers.
- All required ExecPlan sections are present.
- No documentation retains the obsolete allowance of a fixed or maximum 15-second startup wait.
- `git diff --check` passed for tracked changes, with only informational line-ending warnings.

The implementation toolchain, shared contracts, secure EPUB package, visual reader, bounded position persistence/restoration, and Milestone 5 narration-preparation boundary now exist. Completed M007 provides the bounded protocol, native supervision, typed client, exact development-only Qwen/Serena adapter, and frozen exact-host service-handoff evidence. Completed M008 provides the constrained product narration caller, bounded in-memory FIFO, Web Audio playback, quick/prepared controls, and measured exact-host demo evidence. ADR-0013 still selects no standard production profile, and spoken highlighting, playback-following synchronization, general hardware support, and production distribution remain unimplemented. Retain this broad plan as historical context; use the focused M009 ExecPlan for synchronization implementation and do not use either plan to claim that planned systems work.
