# VoxLeaf development roadmap

## Status and purpose

VoxLeaf is pre-alpha. Milestones 1 through 3 are complete, and Milestone 4 is the next implementation priority. This roadmap defines the sequence from the original documentation-only repository to a validated MVP without replacing the detailed ExecPlans required for complex work.

Create or refine a detailed ExecPlan only when a milestone is ready to begin. Keep implementation focused on one active milestone or independently safe task at a time, update the roadmap when evidence changes the sequence, and do not mark planned behavior as implemented until its acceptance checks pass.

## Guiding constraints

Every milestone must preserve the product's defining constraints:

- EPUB contents and reading data remain local by default.
- TTS inference runs on the user's device.
- Generated narration is bounded in memory and is not persisted by default.
- Long-running generation is cancellable, and stale-session audio can never reach playback.
- Untrusted EPUB content is validated, sanitized, and isolated before rendering.
- Visual reading, narration, highlighting, and saved progress share one logical reading position.
- Performance is measured without recording book text or generated audio.
- Claims about hardware support, latency, quality, or packaging require validation.

## Milestone sequence

```text
1. Engineering foundation
    -> 2. Shared contracts and deterministic test harness
    -> 3. Secure EPUB ingestion and document model
    -> 4. Reflowable visual reader and position restoration
    -> 5. Narration text preparation
    -> 6. Local TTS feasibility and engine selection
    -> 7. Local TTS service and process protocol
    -> 8. Bounded audio playback and scheduling
    -> 9. Synchronized reading and narration
    -> 10. Hardware profiles, fallback, and resilience
    -> 11. Packaging and MVP validation
```

Some prototypes may inform later milestones before their full implementation begins, but the dependency order should remain explicit. In particular, model benchmarking can start once the engineering foundation and benchmark contracts exist, while EPUB and reader work continue independently.

## Milestone 1: Establish the engineering foundation

**Status:** Complete as of 2026-07-21. Milestones 2 and 3 are also complete; Milestone 4 is the next implementation priority.

### Goal

Turn the documentation-only repository into a reproducible development workspace and resolve the minimum stack decisions needed for implementation.

### Expected outcome

- The desktop, shared package, EPUB package, and local TTS service areas exist as minimal buildable projects.
- Supported Node.js, package-manager, Rust, and Python versions are pinned and documented.
- The candidate Tauri, React, TypeScript, and Python direction is either validated and adopted or replaced through a documented decision.
- Formatting, linting, type checking, unit testing, and production-build commands exist and have been run successfully.
- Deterministic checks run in continuous integration without requiring model weights or GPU hardware.
- Windows development is documented, including how PowerShell and WSL may share the repository without mixing incompatible environments or generated artifacts.

### Dependencies

None beyond the existing product and architecture foundation.

### Early decisions and risks

- Confirm the desktop stack rather than treating candidate tools as already selected.
- Choose one JavaScript package manager and workspace strategy.
- Decide supported runtime versions and the ownership of generated files.
- Verify Windows native prerequisites, WebView availability, and the boundary between Windows desktop builds and WSL-based development.
- Keep the initial scaffold minimal so toolchain work does not prematurely lock in EPUB, transport, audio, or model dependencies.

## Milestone 2: Define shared contracts and a deterministic test harness

**Status:** Complete as of 2026-07-21.

### Goal

Establish the framework-independent language used by the reader, EPUB pipeline, TTS service, scheduler, persistence layer, and audio player.

### Expected outcome

- Typed contracts represent book identity, spine items, stable reading locators and ranges, reading sessions and generations, narration segments, framed audio metadata, buffer state in playable seconds, errors, capabilities, and persisted reading state.
- Contract serialization and versioning are explicit across process boundaries.
- Fake EPUB, TTS, clock, and audio sources enable deterministic testing without copyrighted content, model weights, special hardware, or audible playback.
- Synthetic fixtures cover representative chapters, paragraphs, dialogue, images, malformed structures, and navigation.

### Dependencies

Milestone 1 provides the workspace, test runners, and language boundaries.

### Early decisions and risks

- Avoid duplicating protocol types between TypeScript, Rust, and Python.
- Choose stable book identity without storing book prose or relying only on private absolute paths.
- Define session invalidation before any asynchronous producer can enqueue work.
- Decide how contracts evolve without silently breaking persisted state or the local protocol.

## Milestone 3: Build secure EPUB ingestion and the document model

**Status:** Complete as of 2026-07-22. Focused, root, Windows native CI, Ubuntu portable CI, privacy, and scope validation passed.

### Goal

Convert an untrusted local EPUB into a safe, ordered, framework-independent representation suitable for visual rendering and narration.

### Expected outcome

- VoxLeaf validates the archive and rejects malformed, unsupported, path-traversing, or resource-exhausting input with recoverable errors.
- Metadata, table of contents, spine order, readable XHTML, local images, and structural boundaries are extracted.
- Scripts, remote resources, hidden noise, unsafe SVG or styling, and irrelevant navigation content are removed or isolated.
- Stable reading locators resolve across sanitized content and fall back safely when an exact target is unavailable.
- Deterministic unit and integration tests use synthetic or documented public-domain fixtures.

### Dependencies

Milestone 2 supplies the book, document, locator, error, and fixture contracts.

### Major risks and unknowns

- EPUB parser and renderer libraries may differ in EPUB 2, EPUB 3, navigation, CSS, SVG, and CFI support.
- Archive bombs, malformed paths, encoded traversal, and oversized resources require explicit bounds.
- Sanitization must preserve meaningful reading structure without allowing active or remote content.
- Locator round-tripping must be prototyped before a dependency becomes difficult to replace.

## Milestone 4: Deliver the reflowable visual reader and position restoration

### Goal

Provide a useful visual ereader before adding real speech generation.

### Expected outcome

- A user can open a valid EPUB, see title and author, navigate its table of contents, and read formatted reflowable text and local images.
- Typography, theme, viewport changes, continuous scrolling, keyboard navigation, and visible focus support comfortable reading. Pagination remains deferred by ADR-0008.
- The logical reading position survives reflow and is saved locally without storing book prose.
- Reopening a known book restores the same passage or the nearest valid location.
- Invalid files and restoration failures produce understandable recoverable states.

### Dependencies

Milestone 3 provides sanitized content and stable locators. Milestone 2 provides persistence contracts and deterministic test support. [ADR-0008](../architecture/decisions/ADR-0008-visual-reader-architecture.md) defines the approved visual-rendering, navigation, and active-position boundary.

### Major risks and unknowns

- Implement and prove ADR-0008's direct semantic DOM boundary without reintroducing publisher markup, styles, URLs, or DOM identifiers.
- Implement the approved package-owned semantic-target resolver and prove locator/code-point sampling across real browser reflow.
- Preserve ADR-0009's capability-free file ingress and ADR-0010's bounded static-raster decode/object-URL policy while resolving real-browser tooling and measured large-chapter limits before claiming the complete reader boundary works.
- Implement and validate ADR-0011's bounded Web Storage envelopes, 500 ms passive-save debounce, lifecycle saves, exact/recovered restoration, and explicit migration boundary.
- Keep manual navigation during active narration deferred to the Milestone 9 interaction gate.

## Milestone 5: Prepare text for natural narration

### Goal

Create a deterministic narration representation and semantic segmentation pipeline without changing the displayed EPUB text.

### Expected outcome

- Normalization handles whitespace, line-break artifacts, punctuation, quotations, ellipses, abbreviations, numbers, dates, times, currency, symbols, and line-end hyphenation.
- Spanish-specific rules receive representative early coverage.
- Semantic chunks respect paragraphs, dialogue, headings, scene breaks, abbreviations, decimals, initials, and long sentences.
- Every narration segment maps back to a stable locator range for seeking, highlighting, cancellation, and progress.
- Chunk sizing is bounded and measurable rather than based on one arbitrary character limit.

### Dependencies

Milestones 2 and 3 provide contracts and structured readable content. It may proceed alongside late Milestone 4 work once locator mapping is stable.

### Major risks and unknowns

- Over-normalization can change meaning or pronunciation.
- Segmentation that improves prosody may increase startup or seek latency.
- Model-specific preprocessing must not leak into general application contracts without evidence.
- Spanish abbreviations, dialogue, numbers, and embedded foreign names require a reproducible test corpus.

## Milestone 6: Prove local TTS feasibility and select engine profiles

### Goal

Use reproducible benchmarks to determine whether candidate local TTS engines can satisfy the MVP on documented hardware.

### Expected outcome

- Candidate balanced and CPU-compatible engines are benchmarked with the same safe Spanish-focused corpus.
- Results report model load, warm-up, time to first audio, generated duration, real-time factor percentiles, RAM, VRAM, cancellation behavior, errors, and output capabilities.
- Model licenses, redistribution terms, download strategy, storage requirements, supported platforms, and offline behavior are understood.
- A balanced default direction and CPU fallback are selected through documented decisions, or the project records why a candidate is not viable.
- Supported hardware claims remain limited to measured configurations.

### Dependencies

Milestone 1 supplies isolated Python and benchmark environments. Milestone 2 supplies capability, audio, error, and measurement contracts. Milestone 5 provides representative normalized text and segments, although an earlier standalone spike may use fixed synthetic text.

### Major risks and unknowns

- Qwen3-TTS, Kokoro, or alternatives may not meet Spanish quality, startup, memory, licensing, or packaging needs.
- CPU fallback performance may require a different engine and voice set.
- GPU and driver compatibility may vary sharply across user machines.
- Model installation and updates must not create an accidental runtime network dependency or silently exhaust disk, RAM, or VRAM.
- The project still needs a measurable wall-clock startup target in addition to the accepted 15-second playable-audio lead.

## Milestone 7: Implement the local TTS service and process protocol

### Goal

Run the selected TTS engines behind a secure, typed, cancellable local process boundary.

### Expected outcome

- The desktop can start, monitor, use, recover, and stop a persistent local TTS service.
- Model loading, warm-up, capabilities, synthesis, streamed audio, cancellation, health, recoverable errors, and fatal errors use a versioned protocol.
- Audio frames and control messages preserve session, generation, segment, format, and locator identity.
- The service accepts bounded work, exposes measurable lifecycle state, and never logs narration text.
- The chosen transport is restricted to the local application boundary and does not expose book contents to other processes or the network.

### Dependencies

Milestone 2 defines shared contracts. Milestone 6 selects viable engines and capabilities. Milestone 1 supplies process and packaging foundations.

### Major risks and unknowns

- Select among standard streams, native IPC, a local socket, or loopback WebSocket after a focused prototype.
- Binary framing, backpressure, service crashes, protocol upgrades, and cancellation acknowledgments must remain observable.
- Some inference calls may not be immediately interruptible; stale results still must be rejected.
- Python sidecar and model packaging may be one of the largest installer and support risks.

## Milestone 8: Build bounded audio playback and scheduling

### Goal

Create a model-independent in-memory producer-consumer pipeline that starts promptly, avoids unbounded work, and reports underruns honestly.

### Expected outcome

- A low-level audio player consumes framed PCM or another validated internal format from a bounded buffer outside React state.
- Initial playback starts immediately when approximately 15 seconds of valid playable audio is ready, or when a complete shorter remaining range is ready.
- Low, target, and maximum buffer thresholds control generation and backpressure.
- Played, cancelled, and stale frames are discarded and never persisted.
- Pause, resume, flush, volume, supported speed control, buffering state, and underrun measurements work with deterministic fake audio before real-model integration.

### Dependencies

Milestone 2 provides audio and session contracts. Milestone 7 provides the production audio stream, but most playback behavior should first be proven with deterministic fakes.

### Major risks and unknowns

- Select and validate AudioWorklet or an equivalent playback mechanism.
- Choose the internal audio format and conversion ownership.
- Define the "shorter remaining range" used by the startup gate.
- Playback speed may require time stretching rather than changing sample rate.
- Browser, WebView, native shell, and OS audio behavior may differ under load or background operation.

## Milestone 9: Integrate synchronized reading and narration

### Goal

Join the visual reader, narration pipeline, TTS service, and player into the core VoxLeaf experience.

### Expected outcome

- Play starts from the visible logical reading position.
- The narrated paragraph remains visible and highlighted as audio crosses paragraphs, pages, and chapters.
- Pause, resume, previous or next movement, paragraph selection, seeking, chapter changes, model changes, voice changes, book close, and session replacement preserve one coherent reading position.
- Every invalidating action cancels or supersedes obsolete work, clears invalid audio, and prevents stale playback.
- Progress is saved without model failures corrupting the last valid reading location.
- Loading, generation, buffering, playing, paused, recoverable error, and fatal error states are understandable and accessible.

### Dependencies

Milestones 4, 5, 7, and 8 provide the visual reader, locator-linked segments, production TTS stream, and playback pipeline.

### Major risks and unknowns

- Define whether manual scrolling while narration is active seeks playback, pauses automatic following, or temporarily separates the viewport.
- Cancellation must be correct across UI, coordinator, transport, inference queue, and audio buffer—not only within one component.
- Segment-level timing may be sufficient for paragraph highlighting but not future word-level synchronization.
- Automatic following must not disorient keyboard or assistive-technology users.

## Milestone 10: Add hardware profiles, fallback, and operational resilience

### Goal

Make the integrated reader usable across documented supported hardware and recover gracefully when acceleration or models are unavailable.

### Expected outcome

- VoxLeaf detects relevant OS, CPU, RAM, GPU, VRAM, CUDA, ONNX providers, and supported precision without sending telemetry.
- The UI recommends a measured engine profile while retaining user control and avoiding unsafe memory use.
- CPU-compatible fallback, model-load failure recovery, service restart, cancellation timeout, and degraded buffering behavior are tested.
- Long sessions keep memory, queues, GPU work, logs, and persisted state bounded.
- Diagnostics and benchmark summaries contain no book text, narration, secrets, or unnecessary private paths.

### Dependencies

Milestone 6 defines supported engine profiles. Milestones 7 through 9 provide the integrated lifecycle and observable metrics.

### Major risks and unknowns

- Hardware detection APIs may be incomplete or platform-specific.
- Automatic recommendations can be harmful without conservative memory margins and measured evidence.
- Recovery must not duplicate service processes, leak model memory, replay stale audio, or lose reading progress.
- The accepted buffer policy may require tuning by hardware profile without becoming unbounded or hiding poor sustained RTF.

## Milestone 11: Package, validate, and release the MVP

### Goal

Produce a documented Windows installation and demonstrate that the complete MVP meets its functional, privacy, accessibility, reliability, and performance criteria.

### Expected outcome

- A user can install or follow verified local setup instructions, open a safe EPUB, read visually, restore progress, and listen through a supported local voice.
- Production packaging includes the desktop shell, local service, required runtimes, and a deliberate model acquisition strategy.
- Unit, integration, end-to-end, accessibility, security, build, packaging, and hardware-specific performance checks are documented and pass at the applicable levels.
- A sustained reading test covers playback, buffering, page and chapter transitions, pause, seek, resume, cancellation, service failure, and restoration.
- Privacy review confirms that normal reading requires no remote service and persists no generated narration.
- Supported and unsupported hardware, known limitations, benchmark results, setup, troubleshooting, and recovery are documented honestly.

### Dependencies

All earlier milestones. Packaging exploration should begin during Milestones 6 and 7 because model and Python distribution risks can invalidate late assumptions.

### Major risks and unknowns

- Installer size, code signing, antivirus behavior, WebView and native dependencies, Python embedding, model downloads, and GPU runtime compatibility.
- Hardware-specific benchmarks may expose an unsupported default model or buffer policy.
- Accessibility and long-session failures are expensive to fix if postponed until final packaging.
- Portfolio or release claims must reflect validated behavior rather than the intended architecture.

## Cross-milestone decision gates

The following decisions should be made when evidence is available, not assumed silently:

1. **Desktop stack gate:** validate and adopt the desktop framework, workspace, package manager, and supported development environments during Milestone 1.
2. **EPUB gate:** validate archive limits, sanitization, rendering isolation, locator round-tripping, and dependency licensing before completing Milestone 3.
3. **Persistence gate:** ADR-0011 selects bounded WebView `localStorage`, separate versioned position/preference envelopes, save lifecycle, and desktop-owned migration; implement and validate that boundary before completing Milestone 4.
4. **TTS gate:** select balanced and compatibility profiles only after reproducible quality, latency, memory, cancellation, license, and packaging evaluation in Milestone 6.
5. **Protocol gate:** record transport, framing, backpressure, and local exposure decisions before completing Milestone 7.
6. **Audio gate:** record internal audio format, playback mechanism, speed-control behavior, and the short-range startup rule before completing Milestone 8.
7. **Interaction gate:** define manual navigation during active narration before completing Milestone 9.
8. **Release gate:** define supported hardware and wall-clock startup expectations from measured results before release.

Durable decisions belong in architecture decision records. Temporary implementation detail belongs in the active ExecPlan. Benchmark results and discovered constraints should update later milestones rather than forcing the project to follow an obsolete roadmap.

## Relationship to existing plans

[`active/M004-reflowable-visual-reader-and-position-restoration.md`](active/M004-reflowable-visual-reader-and-position-restoration.md) is the implementation authority for Milestone 4. It records the reader's decision gates, small implementation tasks, persistence/restoration strategy, and validation requirements without authorizing narration or audio work.

[`active/synchronized-reader-and-startup-buffer.md`](active/synchronized-reader-and-startup-buffer.md) contains broader planning relevant to the visual reader, position restoration, bounded playback, and synchronized narration. It does not supersede this roadmap or the milestone-specific M004 plan and does not authorize implementing all of those areas at once.

Milestones 1 through 3 are complete, with their evidence retained in [`completed/M001-engineering-foundation.md`](completed/M001-engineering-foundation.md), [`completed/M002-shared-contracts-and-test-harness.md`](completed/M002-shared-contracts-and-test-harness.md), and [`completed/M003-secure-epub-ingestion-and-document-model.md`](completed/M003-secure-epub-ingestion-and-document-model.md). Milestone 4 is the next implementation priority. Use the M004 plan for that work and the synchronized-reader plan only as later-milestone context.

## MVP completion boundary

The roadmap is complete only when Milestone 11 validates the complete user journey and the definition of done in `AGENTS.md`. Finishing scaffolding, one EPUB parser, one TTS prototype, or one successful playback demonstration is progress, not completion of VoxLeaf.
