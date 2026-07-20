# Architecture overview

## Status

Proposed. Component choices must be confirmed through implementation and benchmarks.

## Context

VoxLeaf must read EPUB files and synthesize speech locally while beginning playback before an entire chapter is generated. The application therefore needs explicit boundaries between document processing, scheduling, inference, buffering, and playback.

## Planned components

```text
Desktop application
├── Book library and file selection
├── Reader UI and navigation
├── Reading-session coordinator
├── Audio player and bounded playback buffer
└── Local TTS process client

EPUB package
├── Archive validation
├── Metadata and table-of-contents extraction
├── Spine traversal
├── Content sanitization
├── Text normalization
└── Semantic chunking

Local TTS service
├── Model lifecycle
├── Inference queue
├── Cancellation
├── Audio framing
└── Performance metrics
```

## Candidate process model

The desktop reader boundary includes a sanitized reflowable EPUB renderer, navigation, logical reading-location persistence, restoration, and synchronization with the active narrated segment. Pagination is derived from the current viewport and typography; it is not the durable source of position.

The desktop application and TTS inference should run in separate local processes.

Reasons:

- Python has the strongest ecosystem for candidate models.
- A process boundary isolates model failures and GPU memory.
- The desktop UI should remain responsive during inference.
- The service can expose explicit cancellation and health state.

The protocol may use Tauri IPC, standard input/output, a local socket, or loopback WebSocket. The final choice requires an ADR after a small prototype.

## Core data flow

1. Validate the selected EPUB as an untrusted archive.
2. Parse metadata, navigation, and spine order.
3. Resolve the saved logical reading locator, or use the beginning of a new book.
4. Extract and sanitize the selected spine content for safe visual rendering.
5. Reconstruct the visible page from the locator and current layout.
6. Derive narration text from the same logical location while retaining paragraph and dialogue boundaries.
7. Create bounded chunks tagged with their source locators.
8. Attach chunks to a unique reading session.
9. Generate approximately 15 seconds of playable audio, then start playback immediately when that media-duration threshold is met.
10. Generate later audio while the player consumes buffered frames and the renderer keeps the narrated passage visible.
11. Discard played frames and stale session work.
12. Persist the logical reading locator, not a rendered page number or generated audio.

## Required invariants

- Audio from an inactive reading session is never played.
- The visible reading location, narration start, highlighting, and saved progress refer to the same logical EPUB position.
- Reflow does not change the logical reading position.
- The initial 15-second target represents buffered playable audio, never a fixed startup timer.
- Book text is never written to logs.
- The generation queue and audio buffer are bounded.
- Network access is not required for normal reading.
- Cancelled work cannot later re-enter the active playback queue.
- Generated audio is not persisted unless a future explicit feature and privacy review permit it.

## Dependency direction

- UI components depend on application-level reading APIs, not directly on EPUB or TTS implementations.
- EPUB parsing must not depend on the desktop framework.
- Pagination belongs to the renderer, while logical locator creation and resolution remain framework-independent.
- Shared protocol types must not depend on either process implementation.
- TTS model adapters implement an internal interface so benchmarking does not leak model-specific details through the application.
