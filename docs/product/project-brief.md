# Project brief

## Status and purpose

This brief explains the intended VoxLeaf experience and the motivation behind the project. It provides context for product and engineering decisions, but it does not make candidate technologies or tuning values authoritative.

The normative MVP scope is in [`mvp.md`](mvp.md). Accepted technical decisions are recorded under [`../architecture/decisions/`](../architecture/decisions/), and current performance targets are in [`../architecture/performance-budget.md`](../architecture/performance-budget.md).

The implemented product boundary currently includes private local EPUB ingestion, semantic visual reading/navigation, bounded restoration, deterministic locator-linked narration preparation, the M007 local service, M008's exact-development narration coordinator, buffer, player, and controls, completed M009's segment-level highlight/follow/navigation plus non-skipping heard-position persistence, and completed M009.1 reader stabilization. M009.1 repairs the reproduced same-chapter highlight-materialization defect, implements one dedicated reader scroll viewport with compact/collapsible narration and exact loaded-duration text, adds one bounded locator-backed paragraph leaf, and separates passive viewport inspection from explicit narration replacement. Its corrected private-EPUB interaction, amended exact-host matrix, repository/privacy audit, portable and packaged checks, and required Ubuntu/Windows CI pass; pull request #142 merged the final closeout. M010 is in progress: Milestone 1 freezes the privacy-safe host/profile report, evidence identity and resource margins, matching/preference rules, failure taxonomy, and explicit identity-first recovery policy. Milestone 2 implements a native Windows-only detector and typed desktop decoder that expose only the frozen bounded facts; unsupported platforms return an explicit unavailable report. No product recommendation, fallback, recovery path, model operation, telemetry, or support claim is implemented. The standard-profile blocker remains because measured buffering exceeds the MVP target and no standard profile has passed. A supported production TTS profile, validated fallback, and installers remain deferred. The rest of this brief describes the intended complete product unless it explicitly identifies implemented behavior.

## Summary

VoxLeaf is a privacy-first desktop EPUB reader being built to turn book text into natural-sounding speech entirely on the user's computer. A reader can open a supported local EPUB, navigate its chapters, read its formatted semantic content, and restore a saved logical passage. On the exact configured development host, the user can also start bounded quick or prepared local narration. ADR-0015 authorizes only that constrained one-GPU demo path; standard production narration remains blocked pending a viable profile.

The intended narration pipeline will generate progressively instead of converting a complete book or chapter into an audiobook. It will retain only a bounded amount of audio in memory, play it while preparing later segments, and discard it after playback.

```text
Open a local EPUB
    -> validate and project safe structured content
    -> derive and normalize narration-only text
    -> map bounded semantic segments to source locator ranges
    -> generate speech locally in a later TTS stage
    -> hold bounded audio in memory
    -> play while preparing later segments
    -> discard audio after playback
```

The project is intended to become both a useful personal reader and a strong demonstration of desktop development, document processing, local AI inference, streaming audio, concurrency, performance measurement, accessibility, testing, and privacy-aware design.

## Problem

Operating-system text-to-speech voices are accessible and responsive, but they may provide limited naturalness for long-form narration. Higher-quality AI narration services often require users to upload book contents, pay by usage, wait for complete conversion, or manage large generated audio files.

VoxLeaf combines an interactive ebook reader with on-device neural speech generation. It should make a local EPUB feel nearly as immediate to listen to as an audiobook without surrendering the book or generated narration to a remote service.

## Intended users

VoxLeaf is for readers who:

- Prefer listening while performing other activities.
- Want more natural narration than a basic system voice can provide.
- Do not want to upload private or copyrighted books.
- Alternate between visual reading and listening.
- Need an accessible reading option.
- Prefer not to create and manage complete audiobook files.
- Have a computer capable of running a local speech model.

The initial target is a Windows desktop user. A compatible NVIDIA GPU may provide the best experience, but the product goal includes a CPU-compatible path for machines without suitable acceleration.

## Desired experience

### Opening a book

After the user selects an EPUB, VoxLeaf should:

1. Treat the file as untrusted input and validate it.
2. Read its title, author, table of contents, and spine order.
3. Restore a saved reading position when available.
4. Open directly at the saved passage and reconstruct the corresponding page for the current viewport and typography.
5. Display the EPUB as a normal reflowable reader while preserving meaningful formatting and images.
6. Determine or request the narration language.
7. Prepare the first semantic text segments without uploading book contents.

### Starting and continuing narration

After the user presses play, VoxLeaf should load and warm the selected local model when necessary, normalize a narration-only representation of the text, and generate a bounded initial audio buffer. Quick start should begin as soon as approximately 15 seconds of playable narration is available. This is a media-duration threshold, not a fixed 15-second timer. A separate explicit prepared-playback mode may target 1, 2, 5, or 10 playable minutes before starting; its exact loaded/target duration and estimate must be visible without a growing bar that resembles book or playback progress.

While the reader consumes one segment, later segments should be prepared and generated in the background. Generation should react to buffer health: prioritize responsiveness when audio is low, maintain a useful reserve when healthy, and stop speculative work at the simultaneous approximately 30-minute playable-audio ceiling. If the reader nears the generation frontier, the UI should warn before representing exhaustion as buffering. Optional one- to three-second waits at eligible paragraph or chapter boundaries may reduce frontier pressure but must not be presented as real-time generation.

Loading, generating, buffering, playing, paused, and error states should be distinguishable and understandable to a nontechnical user.

### Pausing and navigating

Pause should stop audible playback promptly. A playback-only pause may continue bounded generation for the same active identity so resume can use a larger valid lead. Explicit stop, seek, chapter, voice, model, book, session replacement, and application exit must cancel or supersede invalid work and release obsolete audio.

The user should be able to select a chapter or paragraph, move forward or backward, and return to a saved position. Starting narration should use the active visual reading position. During narration, the page containing the spoken passage should remain visible and the active paragraph should be highlighted. Any position, chapter, voice, model, book, or session change that invalidates queued work must prevent obsolete audio from reaching playback, even if the underlying inference cannot stop immediately.

## Product requirements that shape the design

### EPUB reading

The implemented EPUB pipeline extracts metadata, navigation, ordered readable XHTML content, stable structural locators, and meaningful block boundaries. It excludes scripts, hidden content, navigation noise, and unsafe external references before values reach the reader. Supported static images may appear in the visual reader but are not narrated in the MVP.

EPUB content is presented as a normal reflowable ereader, with readable typography, bounded static images, continuous scrolling, and chapter navigation. [ADR-0008](../architecture/decisions/ADR-0008-visual-reader-architecture.md) selects continuous vertical scrolling as the sole initial mode and defers pagination. A displayed page number is not a stable position because visible layout changes with the viewport, font size, and line spacing. The implemented reader persists its shared structural logical locator and Unicode-code-point offset, rather than a page or quotation, and uses package-owned exact/nearest-valid resolution to reconstruct the visible passage after exact-file reselection.

### Narration text

Displayed book text remains faithful to the safe semantic source and is not rewritten by narration preparation. The implemented package-local `narration-v1` representation applies the accepted conservative whitespace, semantic-line-break, punctuation, quotation, ellipsis, Spanish abbreviation/numeric/date/time/currency/percentage/symbol, and line-end rules while preserving ambiguous, malformed, unsupported, code, and foreign-name forms. Every prepared narration segment retains a stable locator range back to its source passage. The exact accepted behavior is summarized in [`../architecture/narration-normalization-v1.md`](../architecture/narration-normalization-v1.md).

Spanish deserves explicit early coverage through a reproducible synthetic corpus, including opening question and exclamation marks, dialogue punctuation, abbreviations, decimal and thousands separators, dates, years, currency, and foreign names embedded in Spanish prose. This is a test-coverage requirement, not a claim of complete language support or pronunciation quality.

Segmentation should respect paragraphs, sentences, dialogue, headings, scene breaks, punctuation, abbreviations, decimals, initials, and unusually long sentences. Segment sizing must balance natural prosody, startup latency, seeking responsiveness, and the amount of work discarded after cancellation.

### Reader interface and accessibility

The initial reader exposes book and chapter context, readable continuously scrolling chapter content, bounded typography/theme controls, and actionable reader errors. On the exact configured development host, the implemented narration path adds accessible quick/prepared playback controls, truthful buffer state, one segment-level highlight, focus-safe narrated-passage following, synchronized navigation, and non-skipping heard-position persistence. The exact Qwen/Serena model and voice remain fixed, and `1.0x` is the only admitted playback rate; production voice selection and adjustable playback speed remain later requirements. The user reads the same source passage being narrated rather than a separate transcript or unrelated location.

Core interaction should support keyboard navigation, visible focus, semantic controls, assistive-technology labels, high contrast, reduced motion, adjustable text size, and operation without a mouse. The UI must remain responsive while inference runs.

### Privacy and local data

Normal reading must not send book text, derived narration text, or generated speech to a remote service. Derived narration text and generated audio are ephemeral and must not be persisted by default. Logs, analytics, snapshots, diagnostics, and performance summaries must exclude book prose, derived narration text, and audio.

The implemented persisted reader state retains only bounded exact-byte identity, a structural content locator and Unicode-code-point offset, and closed display preferences; it does not retain a file reference, EPUB bytes, publisher metadata, prose, rendered geometry, or images. Future milestones may justify selected model/voice, playback speed, and non-content hardware or benchmark data within explicit bounded contracts. Full extracted text and generated narration must not become persistent application state without a separate product and privacy decision.

## Current and candidate technical direction

Accepted implementation choices, rejected evaluated profiles, and still-deferred
directions are separated below:

| Area                              | Status                                                                  | Direction or evaluated candidate                                                                                                                                                            | Remaining validation                                                                                                                                                  |
| --------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop                           | Implemented                                                             | Tauri 2, React, TypeScript, and Vite                                                                                                                                                        | Installer, signing, and release-platform validation remain Milestone 11                                                                                               |
| TTS process                       | Constrained development boundary implemented and exact-host validated   | One persistent native-owned child over framed standard streams, narrow typed commands, process-tree termination, complete-unit binary handoff, and native-only exact Qwen/Serena activation | Production graduation and general-hardware support remain blocked                                                                                                     |
| Balanced model                    | Rejected exact profile                                                  | Qwen3-TTS 0.6B CustomVoice, Aiden, CUDA bfloat16/SDPA                                                                                                                                       | Failed startup, throughput, cancellation, zero-failure, and complete-quality gates                                                                                    |
| Compatibility model               | Rejected exact profile                                                  | Supertonic 3, F1, Spanish mode, ONNX Runtime CPU                                                                                                                                            | Failed first-audio, cancellation, zero-failure, and complete-quality gates                                                                                            |
| Blocker-resolution candidate      | Standard `v3` failed; constrained demo implemented                      | Qwen3-TTS 12Hz 1.7B CustomVoice, Serena, neutral Spanish audiobook instruction, one CUDA bfloat16/SDPA worker                                                                               | Retain development-only availability, truthful buffering, no persistence, and no passing standard-profile claim                                                       |
| Dual-worker scheduling experiment | Rejected by `selection-v5`                                              | One GPU-primary Qwen worker plus one separately loaded CPU-only float32 support worker                                                                                                      | CPU solo was too slow; low-load concurrency improved aggregate RTF by only about 2.6%, substantially slowed the GPU worker, and increased memory and operational risk |
| Adaptive demo buffering           | Exact-development path, policy, and synchronized host proof implemented | Quick default; explicit 1-/2-/5-/10-minute preparation with 1 minute initially selected; 1-minute refill; 10-second warning; zero default boundary wait; approximately 30-minute ceiling    | Exact-host evidence remains development-only; production/general-hardware graduation remains blocked                                                                  |
| Built-in speaker and demo quality | Maintainer accepted for demo only                                       | Serena selected by the frozen intake screen; one fluent maintainer later scored the 12-case panel 4.2667/5 with three meaning-changing defects                                              | One maintainer is sufficient for future MVP demo feedback; historical `v3` remains non-promotable and no standard quality pass is claimed                             |
| Base voice cloning                | Outside current MVP                                                     | Qwen3-TTS 1.7B Base ICL/x-vector modes require user reference audio                                                                                                                         | Retained only as related-runtime prototype evidence; no enrollment, clone prompt, or reference-data path is planned                                                   |
| OpenAI Whisper                    | Rejected as TTS candidate                                               | Automatic speech recognition: audio input and text output                                                                                                                                   | Optional fully local benchmark-only transcription may be assessed separately; it cannot generate narration or replace human quality review                            |
| Process transport                 | Accepted, implemented, and validated                                    | Rust-owned child-process standard streams plus narrow optimized binary Tauri responses; no listener or renderer shell capability                                                            | Protocol v1 remains unchanged; production distribution remains blocked                                                                                                |
| Internal audio                    | Exact-development product path implemented and host-validated           | Bounded 24-kHz mono float32-le units; sole-owner FIFO; one transient active-device copy; Web Audio; content-free controls and metrics                                                       | No audio persistence or standard-profile claim; general hardware and fallback remain unimplemented                                                                    |
| Playback mechanism                | Web Audio selected and validated for the constrained demo               | One dedicated `AudioContext`, one gain node, and one active `AudioBufferSourceNode`; `1.0x` only                                                                                            | Production packaging and wider speed support remain deferred                                                                                                          |

ADR-0013 records the standard rejection evidence. ADR-0015 supersedes
ADR-0014's scheduling and buffering details, rejects CPU and dual-worker
product paths, and permits only the exact one-GPU constrained Qwen
development-demo exception while retaining the production viability blocker.
The
[Milestone 6.1 plan](../plans/completed/M006-001-local-tts-profile-blocker-resolution.md)
records the official Qwen/Whisper research and completed evaluation. Serena is a
development-demo direction, not a passing production profile. The MVP uses a
built-in default narrator; user
voice cloning, enrollment, consent, ownership, impersonation safeguards, and
reference-data persistence remain outside scope and would require a separate
accepted product/privacy decision. M007 and M008 now own the constrained
complete-unit transport, process supervision, internal audio representation,
bounded buffering, playback, and demo thresholds. Reader/narration
segment projection, navigation, heard persistence, and exact-host
synchronization are implemented through completed M009. A supported production
profile, general-hardware validation, fallback and recovery, and distribution
still require later evidence.
Current
buffer and latency targets come from
[`../architecture/performance-budget.md`](../architecture/performance-budget.md),
not from this brief.

## Concurrency and cancellation principles

The accepted constrained-demo design assumes one active reading session and one
GPU TTS inference worker. Pipeline stages may overlap—UI rendering, CPU text
preparation, model inference, and audio playback—but multiple model instances
must not enter product runtime. Milestone 6.2 found that a CPU support worker
added only a small aggregate gain while substantially slowing the GPU worker
and increasing memory sensitivity. ADR-0015 therefore selects one GPU worker
for the demo plan.

Every request and audio frame must carry enough session and generation identity
to reject stale work. Queues and buffers require explicit limits. A
playback-only pause may continue bounded same-identity generation, but explicit
stop, navigation or settings changes, closing a book, replacing a session, and
application exit must release invalid work and audio.

## Success measures

VoxLeaf should measure cold and warm startup, time to first audible frame, generated-audio duration, real-time factor, buffer depth, underruns, cancellation latency, and CPU, RAM, GPU, and VRAM use without recording book content.

Model choices and supported hardware claims require reproducible benchmarks, including representative Spanish narration, dialogue, punctuation, dates, currency, numbers, abbreviations, and foreign names. Stable long-session playback matters more than a favorable average from a short sample.

## Product boundaries

The first version is an interactive local EPUB reader, not a general ebook library, cloud service, mobile application, DRM tool, model-training system, automatic multi-character production studio, or complete-audiobook exporter.

Possible post-MVP work includes more document formats, pronunciation dictionaries, multilingual books, word-level highlighting, bookmarks and notes, sleep timers, background playback, locally generated summaries or translations, explicit audiobook export, and support for additional desktop platforms. These possibilities must not displace the core promise:

> Open a book, press play, and hear narration generated privately on the local device.

## Public positioning

Until narration, audio, hardware, and complete MVP validation exist, describe the complete product prospectively:

> VoxLeaf is a privacy-first desktop EPUB reader in development, designed to generate narration on-device, stream it through bounded memory, and discard it after playback.

Claims about implemented technologies, performance, offline behavior, or supported hardware must be updated only after the corresponding code and validation exist.
