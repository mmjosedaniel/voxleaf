# Product vision

## Problem

Many text-to-speech readers require cloud services, upload book contents, create large audio files, or provide limited control over privacy and local hardware.

## Vision

VoxLeaf should make an EPUB immediately listenable on a personal computer while keeping the book and generated speech on the device.

The application must also remain useful as a visual ereader. The current narrated passage should be readable on screen, and reopening a book should restore the passage where the user stopped reading.

## Intended users

- Readers who prefer listening to books.
- Users who value privacy and offline operation.
- Developers and enthusiasts with hardware capable of local neural TTS.
- Users who need a useful reading tool rather than an audiobook-production system.

## Product principles

### Local first

Core reading and speech generation must work without a remote TTS service.

### Useful before perfect

The MVP may buffer occasionally. Stable reading progress, cancellation, and recoverable playback matter more than eliminating every short pause.

### Bounded resources

The application must control memory, queue size, model lifetime, and generated audio retention.

### Observable performance

Startup time, real-time factor, underruns, cancellation latency, and memory use should be measurable.

### Honest capability

The UI must distinguish model loading, audio generation, buffering, playback, and failure states.

### One reading position

Visual reading, narration, highlighting, navigation, and saved progress should share one logical book position. Rendered page numbers are presentation details and must not be the durable source of reading progress.

### Accessible interaction

Core reading controls should be keyboard accessible and expose meaningful labels to assistive technologies.
