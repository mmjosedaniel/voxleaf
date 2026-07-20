# Testing strategy

## Principles

- Test observable behavior.
- Keep tests deterministic.
- Use synthetic or public-domain text.
- Never require proprietary EPUBs or committed model weights.
- Separate correctness tests from hardware-dependent performance benchmarks.

## Test levels

### Unit

Examples:

- EPUB path validation.
- Text normalization.
- Sentence and paragraph chunking.
- Queue bounds and ordering.
- Reading-session invalidation.
- Buffer calculations.
- Position persistence.
- Reading-locator serialization, resolution, and nearest-valid fallback.
- Reflow calculations preserve the logical reading location.
- Startup gating uses playable audio duration rather than elapsed wall-clock time.

### Integration

Examples:

- EPUB navigation and spine extraction from a small safe fixture.
- Mapping between sanitized rendered content, semantic chunks, and stable reading locators.
- Desktop-to-TTS protocol.
- TTS service lifecycle.
- Cancellation across the process boundary.
- Audio frame ordering.

### End to end

Critical journeys:

- Open a valid EPUB.
- Display it as a readable reflowable ebook rather than a plain narration transcript.
- Navigate to a passage, close the book, reopen it, and verify that the same passage is visible.
- Start playback.
- Verify that narration starts from the visible passage and keeps the active paragraph on screen.
- Verify that playback starts as soon as approximately 15 seconds of playable audio is buffered, without a fixed 15-second delay.
- Pause and resume.
- Seek to another paragraph.
- Change chapters.
- Recover from model-loading failure.
- Close the book and release resources.

### Performance

Report separately:

- Cold model load.
- Warm time to first audio.
- Playable audio depth when playback starts.
- Delay between satisfying the initial audio threshold and audible playback.
- Real-time factor.
- Buffer underrun frequency and duration.
- Cancellation latency.
- CPU, GPU, VRAM, and RAM use.

Performance tests may be hardware-specific, but their input text and procedure must be reproducible.

## Fixtures

Fixtures must be:

- Synthetic and committed directly.
- Public-domain with provenance documented.
- Small enough for fast deterministic tests.

Do not use copyrighted commercial books.
