# Minimum viable product

## Primary user flow

1. The user opens VoxLeaf.
2. The user selects a local EPUB.
3. VoxLeaf validates and loads the book.
4. VoxLeaf opens at the user's last saved passage, or the beginning for a new book.
5. The user reads the EPUB in a normal reflowable reader and chooses a chapter and available local voice.
6. VoxLeaf prepares approximately 15 seconds of playable audio from the visible reading position.
7. Playback starts immediately when that audio lead is ready; there is no fixed 15-second timer.
8. The user reads the visible, highlighted passage while later chunks are generated.
9. The user can pause, resume, seek, or change chapters.
10. VoxLeaf saves the shared visual and narration position.

## MVP capabilities

- Open an EPUB from local storage.
- Extract ordered readable content and table of contents.
- Render title, author, chapter navigation, text, and images as a normal reflowable EPUB reader.
- Reconstruct the visible scrolling passage from a stable content locator when layout or typography changes.
- Open a previously read book at its last saved visible passage.
- Select a chapter or paragraph as the narration starting point.
- Generate speech through one supported local TTS model.
- Select at least one supported local voice.
- Buffer generated audio in memory.
- Start playback as soon as approximately 15 seconds of playable audio is buffered, without adding a fixed wall-clock delay.
- Continue generation while valid buffered audio is playing.
- Pause, resume, and move forward or backward through the reading position.
- Highlight the current paragraph during narration.
- Keep the active narrated paragraph on screen so the user can read along.
- Cancel stale generation after seeking or changing chapter.
- Persist reading position and basic preferences.
- Detect available acceleration and report relevant hardware capabilities.
- Provide a documented CPU-compatible fallback for systems without supported GPU acceleration.
- Display actionable loading, buffering, and error states.
- Collect non-content performance metrics.
- Provide a documented local setup and, when packaging is introduced, a simple desktop installation path.

## Acceptance criteria

### Privacy

- Book contents are not sent over the network.
- TTS inference runs on the local device.
- Generated audio is not persisted by default.
- Logs contain no book text or generated audio.

### Playback

- Playback can start without synthesizing the complete chapter.
- Narration starts from the current visual reading location.
- Playback begins when the initial playable-audio threshold is met rather than after a fixed timer.
- The initial threshold is measured in playable audio seconds and targets approximately 15 seconds.
- The visible reading passage follows narration across layout or chapter boundaries without losing the logical reading position.
- Pausing does not create uncontrolled generation work.
- Seeking invalidates stale queued audio.
- Changing chapters cannot play audio from the previous chapter.
- Changing the active book, model, or voice cannot play audio from the previous generation.
- Buffer exhaustion is represented as buffering, not as an application freeze.

### Accessibility

- Core reading and playback controls are operable with a keyboard.
- Controls expose meaningful names and state to assistive technologies.
- Focus and playback or buffering state are visible.

### Performance

- No artificial startup delay is added after the initial playable-audio threshold is met.
- Wall-clock startup latency and playable audio depth at startup are measured separately.
- The MVP may buffer for up to 5 seconds per minute.
- Queues and buffers have explicit maximum sizes.
- Startup latency, real-time factor, buffer depth, underruns, and cancellation latency can be measured.

### Reliability

- Unsupported or malformed EPUBs produce a recoverable error.
- A saved reading locator that no longer resolves falls back to the nearest valid location and reports the recovery without exposing book text.
- Reflowing after viewport or typography changes preserves the logical reading location even when the visible layout changes.
- Closing a book releases its reading and generation resources.
- Model-loading failure does not corrupt saved reading progress.
- Unsupported acceleration falls back safely or produces an actionable compatibility message.

## Non-goals for the first version

- Producing or exporting complete audiobook files.
- Cloud synchronization.
- Online TTS providers.
- DRM circumvention.
- Supporting every ebook format.
- Automatic multi-character voice casting.
- Mobile applications.
- A plugin marketplace.
