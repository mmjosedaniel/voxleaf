# Synchronized visual reader, position restoration, and startup audio lead

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

Roadmap Milestones 1 through 3 are complete. The repository now has a reproducible cross-language workspace and CI, canonical shared schemas and runtime decoders, deterministic test fakes, a minimal React/Tauri desktop shell, a dependency-free Python service scaffold, and an implemented framework-independent `@voxleaf/epub` boundary for bounded in-memory ingestion, immutable semantic documents, lazy raster reads, and deterministic locator creation/resolution.

The desktop still has no file-selection capability or dependency on the EPUB/shared packages and cannot render or restore a book. There is no persistence adapter, narration normalization/chunking pipeline, TTS engine or process protocol, runtime generation queue, audio buffer/player, hardware detection, or installer. The shared persisted-state/session/narration/audio contracts and test fakes are supporting contracts, not implementations of those systems. The package-level EPUB behavior can be validated, but none of this plan's complete reader-to-playback user flow works in the application.

## Scope and non-goals

### Scope

- Safe visual rendering of reflowable EPUB text and local images.
- Stable logical reading locators and nearest-valid recovery.
- Local persistence and restoration of the current visible locator.
- Mapping among rendered content, narration chunks, and locator ranges.
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
- Actual result: partially complete at the framework-independent package boundary. `@voxleaf/epub` validates synthetic in-memory EPUBs, projects safe semantic content and raster descriptors, and creates/resolves stable locators. Desktop file access, raster decoding, renderer isolation, reflow, and accessibility behavior are not implemented.

### Status

Partially satisfied by completed roadmap Milestone 3; application work not started

## Milestone 3: Persist and restore one reading position

### Work

- Update the active locator as the user scrolls, pages, selects a passage, or navigates chapters.
- Persist the locator locally at safe lifecycle points.
- Restore the exact or nearest valid passage before presenting a reopened book.
- Start narration from the active visual locator.
- Map narration segments back to locator ranges for highlighting and page following.

### Validation

- Unit tests for persistence migration and invalid-locator recovery.
- Integration test proving rendered content and narration chunks share locator ranges.
- End-to-end test: navigate to a later passage, close the book, reopen it, and verify that the same passage is visible.
- End-to-end test: start narration and verify that the visible highlighted paragraph follows segment boundaries.
- Actual result: the shared persisted-state contract and EPUB locator resolver exist. No desktop reading-position owner, storage adapter, lifecycle save, restoration flow, narration start, highlighting, or page-following behavior exists.

### Status

Not started

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
- Actual result: repository-wide deterministic checks and CI exist, but the reader, persistence, TTS, audio, accessibility, performance, and product integration coverage required by this milestone cannot run because those behaviors are not implemented.

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

The implementation toolchain, shared contracts, and secure EPUB package now exist, but feature validation remains incomplete because the desktop reader, persistence, narration, TTS, audio, and integrated behavior have not been implemented. Do not move this plan to `docs/plans/completed/` or claim the feature works before those remaining milestones pass their validation.
