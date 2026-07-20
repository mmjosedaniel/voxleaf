# Project brief

## Status and purpose

This brief explains the intended VoxLeaf experience and the motivation behind the project. It provides context for product and engineering decisions, but it does not make candidate technologies or tuning values authoritative.

The normative MVP scope is in [`mvp.md`](mvp.md). Accepted technical decisions are recorded under [`../architecture/decisions/`](../architecture/decisions/), and current performance targets are in [`../architecture/performance-budget.md`](../architecture/performance-budget.md).

## Summary

VoxLeaf is a privacy-first desktop EPUB reader that turns book text into natural-sounding speech entirely on the user's computer. A reader can open a local EPUB, navigate its chapters, read the formatted text, and listen through a locally executed neural text-to-speech engine.

VoxLeaf generates narration progressively instead of converting a complete book or chapter into an audiobook. It retains only a bounded amount of audio in memory, plays it while preparing later segments, and discards it after playback.

```text
Open a local EPUB
    -> extract and normalize the current text
    -> generate the next speech segment locally
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

After the user presses play, VoxLeaf should load and warm the selected local model when necessary, normalize a narration-only representation of the text, and generate a bounded initial audio buffer. Playback should start as soon as approximately 15 seconds of playable narration is available. This is a media-duration threshold, not a fixed 15-second timer: if the model produces the initial audio in three seconds, playback should begin in about three seconds.

While the reader consumes one segment, later segments should be prepared and generated in the background. Generation should react to buffer health: prioritize responsiveness when audio is low, maintain a useful reserve when healthy, and stop speculative work when the buffer is full.

Loading, generating, buffering, playing, paused, and error states should be distinguishable and understandable to a nontechnical user.

### Pausing and navigating

Pause should stop audible playback promptly and prevent uncontrolled future generation. Resume should continue from retained valid state when possible rather than rebuilding the complete chapter.

The user should be able to select a chapter or paragraph, move forward or backward, and return to a saved position. Starting narration should use the active visual reading position. During narration, the page containing the spoken passage should remain visible and the active paragraph should be highlighted. Any position, chapter, voice, model, book, or session change that invalidates queued work must prevent obsolete audio from reaching playback, even if the underlying inference cannot stop immediately.

## Product requirements that shape the design

### EPUB reading

The initial reader should extract metadata, navigation, ordered readable XHTML content, stable chapter and paragraph identifiers, and meaningful paragraph boundaries. It should ignore scripts, hidden content, navigation noise, and unsafe external references. Images may appear in the visual reader but are not narrated in the MVP.

EPUB content should be presented as a normal reflowable ereader, with readable typography, images, scrolling or pagination, and chapter navigation. A displayed page number is not a stable position because it changes with the viewport, font size, and line spacing. VoxLeaf should persist a logical locator—such as a spine item plus an EPUB CFI or equivalent content anchor and offset—and use it to reconstruct the correct visible page.

### Narration text

Displayed book text should remain faithful to the source whenever possible. A separate narration representation may normalize whitespace, visual line breaks, Unicode punctuation, quotations, ellipses, abbreviations, dates, times, currency, numbers, common symbols, and words hyphenated across line breaks.

Spanish deserves explicit early coverage, including opening question and exclamation marks, dialogue punctuation, abbreviations, decimal and thousands separators, dates, years, currency, and foreign names embedded in Spanish prose.

Segmentation should respect paragraphs, sentences, dialogue, headings, scene breaks, punctuation, abbreviations, decimals, initials, and unusually long sentences. Segment sizing must balance natural prosody, startup latency, seeking responsiveness, and the amount of work discarded after cancellation.

### Reader interface and accessibility

The reader should expose book and chapter context, readable paginated or scrollable chapter content, progress, current-paragraph highlighting, playback controls, voice selection, playback speed, visible buffer state, and actionable errors. Typography and themes should support comfortable long-form reading. The user must be able to read the same passage being narrated rather than seeing a separate transcript or unrelated location.

Core interaction should support keyboard navigation, visible focus, semantic controls, assistive-technology labels, high contrast, reduced motion, adjustable text size, and operation without a mouse. The UI must remain responsive while inference runs.

### Privacy and local data

Normal reading must not send book text or generated speech to a remote service. Generated audio is ephemeral and must not be persisted by default. Logs and performance measurements must exclude book text and audio.

VoxLeaf may retain local metadata, file references, a content locator and offset for reading position, progress, selected model and voice, playback speed, display preferences, and non-content hardware or benchmark data. The saved locator must not contain book prose. Full extracted text and generated narration should not become persistent application state without a separate product and privacy decision.

## Candidate technical direction

The following ideas guide prototypes but are not accepted merely because they appear in this brief:

| Area | Candidate direction | Required validation |
| --- | --- | --- |
| Desktop | Tauri 2, React, TypeScript, and Vite | Bootstrap, platform integration, accessibility, and packaging |
| TTS process | Persistent local Python sidecar | Lifecycle, isolation, cancellation, installation, and recovery |
| Balanced model | A smaller Qwen3-TTS profile | Spanish quality, startup latency, real-time factor, and memory use |
| Compatibility model | Kokoro through ONNX Runtime or another lightweight engine | CPU performance, quality, packaging, and provider support |
| Process transport | Typed local IPC, standard streams, local socket, or loopback WebSocket | Security, binary streaming, cancellation, and operational simplicity |
| Internal audio | Streamed PCM with a bounded ring buffer | Browser and platform support, memory, playback quality, and speed control |
| Playback mechanism | AudioWorklet or an equivalent low-level mechanism | Stable streaming, underrun observability, packaging, and testability |

Model names, audio encoding, transport, process ownership, and buffer thresholds require prototypes, benchmarks, and—where durable—an architecture decision record. Current buffer and latency targets come from [`../architecture/performance-budget.md`](../architecture/performance-budget.md), not from this brief.

## Concurrency and cancellation principles

The initial design should assume one active reading session and one TTS inference worker. Pipeline stages may overlap—UI rendering, CPU text preparation, model inference, and audio playback—but multiple simultaneous model generations should not be introduced without evidence that they improve the experience.

Every request and audio frame must carry enough session and generation identity to reject stale work. Queues and buffers require explicit limits. Closing a book or replacing a session must release its resources.

## Success measures

VoxLeaf should measure cold and warm startup, time to first audible frame, generated-audio duration, real-time factor, buffer depth, underruns, cancellation latency, and CPU, RAM, GPU, and VRAM use without recording book content.

Model choices and supported hardware claims require reproducible benchmarks, including representative Spanish narration, dialogue, punctuation, dates, currency, numbers, abbreviations, and foreign names. Stable long-session playback matters more than a favorable average from a short sample.

## Product boundaries

The first version is an interactive local EPUB reader, not a general ebook library, cloud service, mobile application, DRM tool, model-training system, automatic multi-character production studio, or complete-audiobook exporter.

Possible post-MVP work includes more document formats, pronunciation dictionaries, multilingual books, word-level highlighting, bookmarks and notes, sleep timers, background playback, locally generated summaries or translations, explicit audiobook export, and support for additional desktop platforms. These possibilities must not displace the core promise:

> Open a book, press play, and hear narration generated privately on the local device.

## Public positioning

Until the application exists and has been validated, describe VoxLeaf prospectively:

> VoxLeaf is a privacy-first desktop EPUB reader in development, designed to generate narration on-device, stream it through bounded memory, and discard it after playback.

Claims about implemented technologies, performance, offline behavior, or supported hardware must be updated only after the corresponding code and validation exist.
