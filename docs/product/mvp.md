# Minimum viable product

## Implementation status

The visual-reading portion of this MVP is implemented and roadmap Milestone 4 is complete: a user can open a supported local EPUB, read and navigate its bounded semantic text and static raster images in one continuous reflowable layout, adjust closed display preferences, and restore an exact or nearest-valid logical passage after reselecting the same exact bytes. Milestone 5 narration preparation is implemented, documented, and fully validated: `@voxleaf/epub` exhaustively projects semantic source positions, retains Unicode-code-point source spans, applies deterministic source-mapped neutral/Spanish normalization, scans sentence/dialogue/clause/protected-token boundaries, packs bounded block-local semantic units, and exposes immutable canonical locator-linked batches through `OpenedPublication.prepareNarration`. Repository-authored public integration and deterministic exact-bound/resource tests cover continuation, structural gaps, cancellation, close, privacy, and source immutability. Milestone 6 is complete: the validated benchmark harness and explicit no-viable-profile decision reject both original exact profiles for production. Milestone 6.1's exact Qwen3-TTS 1.7B CustomVoice/Serena `v3` evaluation also failed standard startup, throughput, zero-failure, and mid-generation cancellation gates. Milestone 6.2 then rejected shared-model batching, targeted tokenizer placement, CPU-only generation, and an independent GPU-primary/CPU-support topology. Its accepted `selection-v5` retains exactly one GPU worker only for a constrained development demo; it does not select a passing standard profile. M007 Milestones 1 and 2 implement the frozen transport authority, canonical cross-language control contracts, and a bounded model-free Python service with deterministic fake generation. The production native supervisor and exact model adapter remain unimplemented prerequisites for real-model playback integration. M008 owns the later adaptive scheduler: quick start at approximately 15 playable seconds, explicit prepared playback targeting 1, 2, 5, or 10 playable minutes, bounded generation during playback-only pause, truthful frontier buffering, and a simultaneous approximately 30-minute in-memory ceiling. The package prepares ephemeral sensitive text only; real TTS inference, audio buffering/playback, synchronized highlighting, general hardware profiles, and packaging behavior remain pending. The capability and acceptance lists below describe the complete MVP target, not a claim that every item is currently implemented.

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
2. The user chooses quick start or an explicit prepared-playback target.
3. VoxLeaf requests local TTS for prepared segments and builds a bounded audio lead in memory.
4. Quick-start playback begins immediately when approximately 15 seconds of playable audio is ready, or when a complete shorter remaining range is ready; there is no fixed timer.
5. Prepared playback begins when its explicit 1-, 2-, 5-, or 10-minute target is ready, unless a complete shorter remaining range finishes first. The UI shows preparation progress and an estimate.
6. Later valid audio is generated while playback consumes the buffer, and the visible passage follows the narration. Playback-only pause may continue bounded useful generation for the same active identity.
7. If playback approaches the generation frontier, VoxLeaf shows a low-buffer warning and represents exhaustion as buffering. Optional one- to three-second waits may be inserted only at eligible paragraph or chapter boundaries and must remain observable.
8. Explicit stop, seek, chapter, voice, model, book, session, and application-exit changes cancel or supersede obsolete work.
9. VoxLeaf retains no more than approximately 30 minutes of playable generated audio at once and persists neither narration text nor generated audio.

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

- Complete M007's native service supervision and exact model adapter on the
  implemented typed local process boundary,
  exact one-GPU Qwen/Serena adapter, complete-unit audio delivery,
  identity-first cancellation containment, and content-free lifecycle state.
- Implement ADR-0015 through the M008 ExecPlan using one GPU worker; do not add
  CPU-only or dual-worker product scheduling.
- Implement quick start at approximately 15 playable seconds and explicit
  prepared-playback targets of 1, 2, 5, or 10 playable minutes.
- Enforce a simultaneous approximately 30-minute playable-audio ceiling with
  matching unit, payload-byte, prepared-text, and active-work bounds.
- Continue same-identity generation during playback-only pause while
  preserving explicit stop and invalidating-action cancellation.
- Add low-buffer warning, truthful rebuffering, and optional measurable
  one- to three-second waits only at eligible paragraph/chapter boundaries.
- Implement the constrained demonstration with model prewarming, complete
  narration units, identity-first invalidation, and no generated-audio
  persistence; do not claim uninterrupted, real-time, or general-hardware
  narration.
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
- Prepared playback is an explicit user choice with 1-, 2-, 5-, or 10-minute
  playable-audio targets, visible progress, and a content-free estimate.
- The visible reading passage follows narration across layout or chapter boundaries without losing the logical reading position.
- Playback-only pause may continue bounded generation for the same active
  identity; explicit stop and invalidating actions cancel obsolete work.
- Seeking invalidates stale queued audio.
- Changing chapters cannot play audio from the previous chapter.
- Changing the active book, model, or voice cannot play audio from the previous generation.
- Buffer exhaustion is represented as buffering, not as an application freeze.
- A low-buffer warning appears before predictable frontier exhaustion when the
  available lead crosses the frozen implementation threshold.

### Accessibility

- Core reading and playback controls are operable with a keyboard.
- Controls expose meaningful names and state to assistive technologies.
- Focus and playback or buffering state are visible.

### Performance

- No artificial startup delay is added after the initial playable-audio threshold is met.
- Wall-clock startup latency and playable audio depth at startup are measured separately.
- The MVP may buffer for up to 5 seconds per minute.
- Queues and buffers have explicit maximum sizes.
- The constrained demo retains at most approximately 30 minutes of playable
  generated audio simultaneously in memory; this is a ceiling, not a startup
  target or uninterrupted-playback promise.
- Intentional paragraph/chapter waits are reported separately from involuntary
  buffering and cannot be used to claim real-time generation.
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
- Guaranteeing uninterrupted or real-time narration on the constrained Qwen
  development profile.
- Cloud synchronization.
- Online TTS providers.
- DRM circumvention.
- Supporting every ebook format.
- Automatic multi-character voice casting.
- User voice cloning or reference-voice enrollment without a separate accepted consent, privacy, persistence, deletion, and abuse-safeguard decision.
- Mobile applications.
- A plugin marketplace.
