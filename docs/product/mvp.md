# Minimum viable product

## Implementation status

The visual-reading portion of this MVP is implemented and roadmap Milestone 4 is complete: a user can open a supported local EPUB, read and navigate its bounded semantic text and static raster images in one continuous reflowable layout, adjust closed display preferences, and restore an exact or nearest-valid logical passage after reselecting the same exact bytes. Milestone 5 narration preparation is implemented, documented, and fully validated: `@voxleaf/epub` exhaustively projects semantic source positions, retains Unicode-code-point source spans, applies deterministic source-mapped neutral/Spanish normalization, scans sentence/dialogue/clause/protected-token boundaries, packs bounded block-local semantic units, and exposes immutable canonical locator-linked batches through `OpenedPublication.prepareNarration`. Repository-authored public integration and deterministic exact-bound/resource tests cover continuation, structural gaps, cancellation, close, privacy, and source immutability. Milestone 6 is complete: the validated benchmark harness and explicit no-viable-profile decision reject both original exact profiles for production. Milestone 6.1's exact Qwen3-TTS 1.7B CustomVoice/Serena `v3` evaluation also failed standard startup, throughput, zero-failure, and mid-generation cancellation gates. One fluent maintainer accepted its audible quality for a near-term demonstration; ADR-0014 therefore permits only a bounded development-demo exception with explicit preparation/buffering and no real-time or continuous-playback claim. Planned Milestone 6.2 will separately test whether shorter ordered units and one shared-model batch of two can keep a bounded playback simulation supplied; it does not change the failed result or current MVP behavior. The package prepares ephemeral sensitive text only; TTS inference, audio buffering/playback, synchronized highlighting, general hardware profiles, and packaging behavior remain pending. The capability and acceptance lists below describe the complete MVP target, not a claim that every item is currently implemented.

## Current implemented flow

1. The user opens VoxLeaf.
2. The user selects a local EPUB.
3. VoxLeaf validates and loads the book.
4. VoxLeaf opens at the user's last saved passage, or the beginning for a new book.
5. The user reads and navigates the EPUB in a continuous reflowable reader, adjusts closed display preferences, and can close or replace the publication.
6. VoxLeaf saves the canonical logical reading locator and display preferences on the approved bounded lifecycle.

Separately, `@voxleaf/epub` callers can prepare bounded, locator-linked narration-text batches from a publication. The desktop does not call this operation, so it is not yet a user-visible narration flow.

## Remaining target user flow

1. The user selects an available local voice and starts narration from the active visual locator.
2. VoxLeaf requests local TTS for prepared segments and builds a bounded audio lead in memory.
3. Playback starts immediately when approximately 15 seconds of playable audio is ready, or when a complete shorter remaining range is ready; there is no fixed timer.
4. Later valid audio is generated while playback consumes the buffer, and the visible passage follows the narration.
5. Pause, resume, seek, chapter, voice, model, book, and session changes cancel or supersede obsolete work.
6. VoxLeaf persists the shared logical position without persisting narration text or generated audio.

## MVP capability status

Implemented and validated:

- Open a bounded supported EPUB from local storage without retaining a path.
- Extract ordered safe semantic content, table of contents, and supported local raster images.
- Render title, author, chapter navigation, text, and images as a continuous reflowable reader.
- Reconstruct the visible passage from a stable logical locator across viewport or typography changes.
- Restore an exact or nearest-valid passage after the user reselects the same exact EPUB bytes.
- Persist bounded logical reading state and closed display preferences.
- Prepare deterministic bounded narration text and locator-linked segments through the package API.
- Run the candidate-neutral local TTS feasibility harness and retain the explicit no-viable-profile decision for both exact evaluated profiles.
- Display actionable reader loading, opening, restoration, and error states.
- Provide documented local setup plus deterministic reader/package validation.

Remaining:

- Close the active Milestone 6.1 blocker-resolution plan after both required
  pull-request jobs pass on its final evidence commit. Local deterministic,
  candidate-import, repository/privacy, portable, and authoritative Windows
  validation already passed. Accepted `selection-v3` retains failed standard
  `v3` and freezes the exact Serena identity only as a constrained
  development-demo input under ADR-0014.
- Execute the planned Milestone 6.2 pre-result evaluation before claiming that
  shared-model batch size two supports sustainable or continuous narration.
- Implement a bounded demonstration excerpt with model prewarming, complete narration units, explicit preparation/buffering, one queued unit, identity-first cancellation, and no generated-audio persistence; do not claim uninterrupted or real-time narration.
- Select a chapter or paragraph as a narration starting point in a desktop playback flow.
- Generate speech through a selected supported local TTS engine and voice.
- Buffer and play generated audio in bounded memory.
- Apply the approximately 15-second playable-audio startup gate without a fixed wall-clock delay.
- Continue generation under backpressure while valid buffered audio plays.
- Pause, resume, seek, and move through a shared visual/playback position.
- Highlight and keep the active narrated passage on screen.
- Cancel or reject stale TTS/audio work across process, queue, and playback boundaries.
- Detect relevant acceleration, publish measured hardware profiles, and provide a validated CPU-compatible fallback.
- Display model-loading, generation, buffering, playback, and TTS failure states.
- Collect the complete non-content TTS/audio performance metrics.
- Provide installer packaging and a validated end-user installation path.

## Target acceptance criteria

### Privacy

- Book contents are not sent over the network.
- TTS inference runs on the local device.
- Generated audio is not persisted by default.
- Logs contain no book text or generated audio.
- Derived narration text does not enter logs, analytics, benchmark summaries, snapshots, or persisted reading progress.

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
- User voice cloning or reference-voice enrollment without a separate accepted consent, privacy, persistence, deletion, and abuse-safeguard decision.
- Mobile applications.
- A plugin marketplace.
