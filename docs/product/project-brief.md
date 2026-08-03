# Project brief

## Status and purpose

This brief explains the intended VoxLeaf experience and the motivation behind the project. It provides context for product and engineering decisions, but it does not make candidate technologies or tuning values authoritative.

The normative MVP scope is in [`mvp.md`](mvp.md). Accepted technical decisions are recorded under [`../architecture/decisions/`](../architecture/decisions/), and current performance targets are in [`../architecture/performance-budget.md`](../architecture/performance-budget.md).

The implemented product boundary currently includes private local EPUB
ingestion, semantic visual reading/navigation, bounded restoration,
deterministic locator-linked narration preparation, the M007 local service,
M008's exact-development narration coordinator/buffer/player/controls,
completed M009 synchronization and heard persistence, and completed M009.1
reader stabilization. M009.1 repairs same-chapter highlight materialization,
implements one dedicated reader scroll viewport with compact/collapsible
narration and exact loaded-duration text, adds one bounded locator-backed
paragraph leaf, and separates passive viewport inspection from explicit
narration replacement. Its private-EPUB, exact-host, repository/privacy,
portable, packaged, and required CI validation pass.

M008.1 adds one engine-neutral playback transition policy after exact listening
showed that independently generated units could sound joined even though
punctuation inside each unit was acceptable. The desktop converts the
prepared semantic boundary to one numeric delay, schedules it only before an
already-buffered successor, creates no silent PCM, and keeps real buffering,
audible playback, and intentional transition time distinct.

M010 is complete. Privacy-safe host detection, closed-registry measured
matching/preference, compatibility UI, identity-safe
explicit recovery, the supported Piper/davefx CPU adapter, native profile
selection, Piper-only locator-safe spoken-expansion-aware sizing, omission of
Piper punctuation units that produce no waveform, and scheduler acceptance of
valid non-empty fragments with zero recognized sentence boundaries are
present. Nonspoken omission inserts no silence and preserves locator
continuation. The corrective ordinary-prose, compact-form, exact-host, and
content-safe packaged private-book Piper arms pass. Qwen passes the
outbound-blocked service lifecycle. ADR-0022 now separates total device
capacity from momentary development headroom: exact Qwen retains `7,196` MiB
total VRAM and requires `6,508` MiB currently available. The packaged host
offers and executes it when those facts and its native gate pass. The latest
broader Qwen matrix later stopped at the depletion synchronization assertion,
so the profile remains development-only and not automatically recommended.
The accepted
[`tts-support-matrix-v1`](../architecture/tts-support-matrix-v1.md) makes
Piper/davefx the sole supported CPU fallback and the only automatically
recommendable profile when compatible and configured. Engine fallback remains
an explicit choice rather than automatic failover. M008.1 and M010 passed
their replacement Ubuntu/Windows closeout checks and are archived. Completed
M010.1 implements explicit Spanish/English selection, bounded preference,
versioned bilingual preparation, and identity-safe profile/language
replacement. Milestone 6 integrates exact Piper davefx/Spanish and joe/English
CPU profiles, supported Chatterbox Spanish/English, and development-only Qwen
Serena/Spanish plus Aiden/English through one native-owned service tree and
unchanged protocol v1. The model-free suites, sequential six-arm exact-host
service matrix, and six packaged synthetic EPUB portfolio arms pass. MOSS
remains deferred without rejection. Pull request #159 passed the required
Ubuntu/Windows checks and merged the closeout.

M010.2 is complete. Milestones 1-5 froze and implemented its
architecture/executable authorities and result-blind comparisons; v1 and v2
selected no backend, while v3 selected repository WSOLA.
Milestone 3 now implements the bounded preference subset: valid saved Spanish
or English survives upgrade, missing/invalid/reset state defaults to English,
and Quick/Prepared startup is persisted separately after pre-action hydration
and identity-safe reset. Milestone 4 now implements one fixed app bar,
accessible Settings, compact narration, a collapsible contents overlay, and
the sole reader scroll viewport while reusing existing domain owners. ADR-0035
separately authorized
and ADR-0036 froze a fee-free v2 comparison for six rates ending at `0.75x`.
ADR-0037 selects no v2 backend after local-inference contention, removes every
experiment, and retains `1.00x`. ADR-0038 now supplies the separate decision
for a boundary-deferred v3 comparison with no TTS/queue invalidation, a
1,000 ms p95 first-activation ceiling, and 200 MiB additional-process-RAM
ceiling. ADR-0039 and the v3 architecture/executable authority freeze exactly
media and repository WSOLA, the selected/pending/active transition, 250 ms p95
recurring handoff, cleanup, and strict lineage. ADR-0040 selects repository
WSOLA after the complete frozen comparison. Milestone 5 integrates all six
boundary-deferred rates. Milestone 6's six-arm packaged and complete local
repository matrices pass; maintainer all-rate confirmation and pull request
#170's required Ubuntu/Windows checks also pass. Installer distribution and
license fulfillment remain deferred to M011.

M011 is now approved with a detailed active ExecPlan. Its first distributable
candidate keeps Windows x64 with Piper davefx/Spanish and Piper joe/English in
the small core. Supported Chatterbox Spanish/English becomes a separately
gated optional GPU quality download rather than an approximately 8.02-GiB
addition to the core installer. Qwen remains development-only and outside the
first distributable product. The plan closes actual dependency, licence,
integrity, clean-host, uninstall, privacy, and support risks; adds explicit
consent, bounded acquisition, verification, installation, activation, and
removal for Chatterbox; and defers enterprise sandboxing, automatic updates,
external certification, cross-platform packages, and bundling every engine.
Milestone 4A implements that lifecycle in a deliberately withheld state.
Milestone 4B now implements acquisition of only six allowlisted model-data files from the
official `ResembleAI/chatterbox` Hugging Face repository at one full frozen
revision, verifies each size and SHA-256, and executes no model-repository code.
The reviewed Chatterbox runtime remains a distinct release input with a
reproducible three-part identity. The exact three parts are published under
`chatterbox-runtime-v2`; they must pass clean-host validation before optional
installation is enabled.
Piper-core readiness, Chatterbox-package readiness, and signed public
publication are separate decisions.
ADR-0044 distinguishes Chatterbox's `3,644`-MiB measured peak from its host
class: `5,632` MiB total and `4,668` MiB available are now the product admission
floors, while nominal 8-GB hardware remains recommended and is the only class
represented by the existing exact-host evaluation.
The rest of this brief describes the intended complete product unless it
explicitly identifies implemented behavior.

## Summary

VoxLeaf is a privacy-first desktop EPUB reader being built to turn book text into natural-sounding speech entirely on the user's computer. A reader can open a supported local EPUB, navigate its chapters, read its formatted semantic content, and restore a saved logical passage. On exact configured hosts, the user can start bounded quick or prepared local narration through supported Piper or Chatterbox profiles, while Qwen remains an explicitly gated development-only constrained-buffer option. M011 now owns the approved Windows/Piper core plus optional-download Chatterbox distribution plan. Its exact multi-artifact native acquisition controller is implemented but remains fail-closed and withheld. Version `0.1.0` has a measured local unsigned current-user NSIS installer containing the verified Piper core; it is not yet clean-host accepted or approved for public distribution.

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

While the reader consumes one segment, later segments should be prepared and generated in the background. Generation should react to buffer health: prioritize responsiveness when audio is low, maintain a useful reserve when healthy, and stop speculative work at the simultaneous approximately 30-minute playable-audio ceiling. If the reader nears the generation frontier, the UI should warn before representing exhaustion as buffering. The optional M008 one- to three-second low-buffer wait remains disabled. Separately, M008.1 applies short semantic transition pauses between already-buffered generated units so sentences and paragraphs do not sound joined; those pauses do not improve model throughput and are measured independently.

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

The admitted Piper runtime selects the corrective
[`narration-piper-v2`](../architecture/piper-narration-preparation-profile-v2.md)
limits over that unchanged normalization. In addition to the historical
code-point, byte, and sentence bounds, v2 applies a deterministic
spoken-expansion budget to compact numbers, currencies, acronyms, Roman
numerals, ordinals, and uppercase sequences. It creates more, shorter,
text-complete segments with exact contiguous locator ranges; it does not
rewrite or truncate speech, widen protocol v1, or change Qwen preparation.

Hardware compatibility does not by itself make product narration available.
VoxLeaf also asks native supervision for a content-free boolean confirming that
the selected exact runtime can be constructed. That check occurs while Play
availability is resolved and again immediately before child start. Missing
configuration disables Play without exposing paths or entering recovery.

Spanish deserves explicit early coverage through a reproducible synthetic corpus, including opening question and exclamation marks, dialogue punctuation, abbreviations, decimal and thousands separators, dates, years, currency, and foreign names embedded in Spanish prose. This is a test-coverage requirement, not a claim of complete language support or pronunciation quality.

Segmentation should respect paragraphs, sentences, dialogue, headings, scene breaks, punctuation, abbreviations, decimals, initials, and unusually long sentences. Segment sizing must balance natural prosody, startup latency, seeking responsiveness, and the amount of work discarded after cancellation.

### Reader interface and accessibility

The implemented reader exposes book and chapter context, readable continuously
scrolling chapter content, bounded typography/theme controls, and actionable
reader errors. On exact configured hosts, narration adds accessible
quick/prepared playback controls, truthful buffer state, segment highlighting,
focus-safe following, synchronized navigation, and non-skipping heard-position
persistence. Playback is currently fixed at `1.0x`.

Approved M010.2 requirements move configuration into an accessible Settings
drawer/sheet, keep the book as the sole large scroll surface, and add
engine-neutral pitch-preserving speeds from `1.00x` through `0.75x` in `0.05x`
steps in the compact narration bar. The user continues to read the same source passage
being narrated rather than a separate transcript or unrelated location.

Core interaction should support keyboard navigation, visible focus, semantic controls, assistive-technology labels, high contrast, reduced motion, adjustable text size, and operation without a mouse. The UI must remain responsive while inference runs.

### Privacy and local data

Normal reading must not send book text, derived narration text, or generated speech to a remote service. Derived narration text and generated audio are ephemeral and must not be persisted by default. Logs, analytics, snapshots, diagnostics, and performance summaries must exclude book prose, derived narration text, and audio.

The implemented persisted reader state retains only bounded exact-byte identity, a structural content locator and Unicode-code-point offset, and closed display preferences; it does not retain a file reference, EPUB bytes, publisher metadata, prose, rendered geometry, or images. Narration language/profile, startup, and playback-speed preferences are separately bounded, versioned, and content-free. Full extracted text and generated narration must not become persistent application state without a separate product and privacy decision.

## Current and candidate technical direction

Accepted implementation choices, rejected evaluated profiles, and still-deferred
directions are separated below:

| Area                              | Status                                                                          | Direction or evaluated candidate                                                                                                                                                                                                         | Remaining validation                                                                                                                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Desktop                           | Implemented                                                                     | Tauri 2, React, TypeScript, and Vite; M011 adds the local Windows x64 package and Milestone 6A lifecycle feedback plus bounded uninstall choices                                                                                         | Normal-user clean-host/manual lifecycle, independent optional-support evidence, and authorized public signing remain                                                                                               |
| TTS process                       | Profile-aware local boundary implemented and exact-host validated               | One persistent native-owned child over framed standard streams, narrow typed commands, process-tree termination, complete-unit binary handoff, exact supported Piper/Chatterbox activation, and native-only development Qwen activation  | M011's minimal Piper-core and optional Chatterbox graphs are closed; the child has application containment but is not an OS sandbox, and cross-process optional-package coordination remains a public-release gate |
| Balanced model                    | Rejected exact profile                                                          | Qwen3-TTS 0.6B CustomVoice, Aiden, CUDA bfloat16/SDPA                                                                                                                                                                                    | Failed startup, throughput, cancellation, zero-failure, and complete-quality gates                                                                                                                                 |
| Compatibility model               | Rejected exact profile                                                          | Supertonic 3, F1, Spanish mode, ONNX Runtime CPU                                                                                                                                                                                         | Failed first-audio, cancellation, zero-failure, and complete-quality gates                                                                                                                                         |
| CPU fallback                      | Supported; integrated Spanish/English packaged portfolio and closeout CI passed | Piper 1.4.2, davefx/Spanish and joe/English, ONNX Runtime CPU float32; davefx total sustained RTF 0.0252 and about 392 MiB measured peak model-tree RAM                                                                                  | M011's packaged core includes the applicable GPL/phonemizer source mechanics, model cards, provenance, and CC0 notices; clean-host release evidence remains                                                        |
| Blocker-resolution candidate      | Standard `v3` failed; constrained demo implemented                              | Qwen3-TTS 12Hz 1.7B CustomVoice, Serena, neutral Spanish audiobook instruction, one CUDA bfloat16/SDPA worker                                                                                                                            | Retain development-only availability, truthful buffering, no persistence, and no passing standard-profile claim                                                                                                    |
| Dual-worker scheduling experiment | Rejected by `selection-v5`                                                      | One GPU-primary Qwen worker plus one separately loaded CPU-only float32 support worker                                                                                                                                                   | CPU solo was too slow; low-load concurrency improved aggregate RTF by only about 2.6%, substantially slowed the GPU worker, and increased memory and operational risk                                              |
| Adaptive demo buffering           | Exact-development path, policy, and synchronized host proof implemented         | Quick default; explicit 1-/2-/5-/10-minute preparation with 1 minute initially selected; 1-minute refill; 10-second warning; zero adaptive low-buffer wait; approximately 30-minute ceiling                                              | Exact-host evidence remains development-only; production/general-hardware graduation remains blocked                                                                                                               |
| Audio-unit transitions            | M008.1 implemented, validated, and archived                                     | Boundary-specific scheduled delays between already-buffered units; no silent PCM, fade, model-input rewrite, or delay after real buffering/final completion                                                                              | Listening may tune only a future version                                                                                                                                                                           |
| Bilingual narration               | Runtime integration, local portfolio matrix, and required CI complete           | Piper davefx/Spanish and joe/English are supported CPU paths; Chatterbox Spanish/English is supported; Qwen Serena/Spanish and Aiden/English are development-only                                                                        | M011 keeps Piper in the core, gates Chatterbox as an explicit optional download, and owns distribution/licence fulfillment                                                                                         |
| Built-in speaker and demo quality | Maintainer accepted for demo only                                               | Serena selected by the frozen intake screen; one fluent maintainer later scored the 12-case panel 4.2667/5 with three meaning-changing defects                                                                                           | One maintainer is sufficient for future MVP demo feedback; historical `v3` remains non-promotable and no standard quality pass is claimed                                                                          |
| Base voice cloning                | Outside current MVP                                                             | Qwen3-TTS 1.7B Base ICL/x-vector modes require user reference audio                                                                                                                                                                      | Retained only as related-runtime prototype evidence; no enrollment, clone prompt, or reference-data path is planned                                                                                                |
| OpenAI Whisper                    | Rejected as TTS candidate                                                       | Automatic speech recognition: audio input and text output                                                                                                                                                                                | Optional fully local benchmark-only transcription may be assessed separately; it cannot generate narration or replace human quality review                                                                         |
| Process transport                 | Accepted, implemented, and validated                                            | Rust-owned child-process standard streams plus narrow optimized binary Tauri responses; no listener or renderer shell capability                                                                                                         | Protocol v1 remains unchanged; production distribution remains blocked                                                                                                                                             |
| Internal audio                    | All admitted profile adapters and local packaged portfolio proof complete       | Bounded mono 24-kHz float32-le units; Piper converts native 22.05 kHz inside its adapter; Chatterbox and Qwen return bounded complete units; sole-owner FIFO and one transient active-device copy                                        | No audio persistence; one model child at a time; Qwen remains optional development-only and constrained-buffered                                                                                                   |
| Playback mechanism                | Six boundary-deferred rates implemented and validated                           | One dedicated 24-kHz `AudioContext`, one gain node, one active source unit, bounded source-PCM FIFO, and repository-owned incremental WSOLA at `1.00x` through `0.75x`; newest pending rate activates at the next complete-unit boundary | Preserve source-frame progress/memory authority, pitch, queue/identity continuity, and `1.00x` bypass in M011 packaging                                                                                            |

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
synchronization are implemented through completed M009. Supported exact
Piper/Chatterbox profiles, hardware matching, explicit fallback selection, and
recovery are implemented. M011 still requires installer delivery for the
implemented compliant Piper core; exact-revision official Hugging Face model
acquisition plus separately verified runtime delivery for a minimal, explicit,
removable Chatterbox option; and clean-host release evidence.
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
for the historical constrained demo. The current product still permits exactly
one selected Piper, Chatterbox, or Qwen child tree at a time; it never runs
multiple models concurrently.

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

Possible post-MVP work includes the bounded [local TTS candidate backlog](post-mvp-tts-candidate-backlog.md), more document formats, pronunciation dictionaries, multilingual books, word-level highlighting, bookmarks and notes, sleep timers, background playback, locally generated summaries or translations, explicit audiobook export, and support for additional desktop platforms. The TTS backlog prioritizes Pocket TTS as a balanced CPU challenger, Chatterbox Latin American Spanish as a quality candidate, MOSS-TTS-Nano as experimental, Kokoro when English becomes active scope, and separately licensed Piper voice comparisons. These possibilities must not displace the core promise:

> Open a book, press play, and hear narration generated privately on the local device.

## Public positioning

Until M011 closes the exact shipped payload, licences, dependency/integrity
audits, clean-host lifecycle, and applicable signing gate, describe release
availability prospectively even though the local reader and narration paths
are implemented:

> VoxLeaf is a privacy-first desktop EPUB reader in development, designed to generate narration on-device, stream it through bounded memory, and discard it after playback.

Claims about implemented technologies, performance, offline behavior, or supported hardware must be updated only after the corresponding code and validation exist.
