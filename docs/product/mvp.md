# Minimum viable product

## Implementation status

The visual-reading portion of this MVP is implemented and roadmap Milestone 4 is complete: a user can open a supported local EPUB, read and navigate its bounded semantic text and static raster images in one continuous reflowable layout, adjust closed display preferences, and restore an exact or nearest-valid logical passage after reselecting the same exact bytes. Milestones 5 through 7 implement bounded narration preparation and the constrained local service while retaining the no-standard-profile decision. M008's six implementation milestones connect that work into an exact-development audible demo. Quick mode is the default; prepared mode is explicit and initially selects one minute; refill remains one minute; the low-water warning is 10 seconds; boundary waits default to zero; playback is `1.0x`; and the simultaneous 30-minute ceiling is never a startup target. Deterministic and packaged tests cover ownership, cancellation, stale suppression, lifecycle cleanup, pause continuation, truthful buffering, privacy, and all four prepared options. The final exact-host run measured 41.312 seconds to first audible output and 19.49 buffering seconds per playback minute, which exceeds the MVP target. The path therefore remains a constrained development demo rather than a passing standard profile or uninterrupted-playback promise. M009 Milestones 1 through 5 connect exact audible segment transitions to one non-mutating semantic source-range highlight, focus-safe automatic following, identity-first synchronized user navigation, and bounded non-skipping heard-position persistence. Segment start is saved when audible, completion advances to the canonical range end, and interruption retains the latest heard checkpoint without periodic playback writes. General hardware profiles and production packaging remain pending.

## Current implemented flow

1. The user opens VoxLeaf.
2. The user selects a local EPUB.
3. VoxLeaf validates and loads the book.
4. VoxLeaf opens at the user's last saved passage, or the beginning for a new book.
5. The user reads and navigates the EPUB in a continuous reflowable reader, adjusts closed display preferences, and can close or replace the publication.
6. On the exact configured development host, the user can start quick or
   prepared local narration from the active visual locator and hear complete
   units through the bounded in-memory player.
7. The reader highlights and follows the audible stable segment. Passive
   movement, chapter navigation, and previous/next narration-passage controls
   invalidate obsolete audio before a bounded restart from the canonical
   target; a paused session remains paused there.
8. VoxLeaf saves the canonical heard segment start/end checkpoint while
   narration owns position, otherwise saves the canonical visual locator, and
   retains display preferences on the approved bounded lifecycle.

The narration path is deliberately hidden when the exact native development
configuration is unavailable. It is not a standard or generally supported
runtime profile.

## Remaining target user flow

1. Later work selects a supported production TTS profile, validates broader
   hardware, and packages an end-user distribution.

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
- Run the exact development-only Qwen/Serena adapter through the native
  supervisor with frozen identity/artifact checks, bounded complete-unit
  delivery, identity-first termination, stale suppression, and clean reload.
- Own complete 24-kHz mono float32 units in one bounded desktop FIFO outside
  React, consume them through a dedicated low-level Web Audio player, account
  underruns, and release played or invalidated originals exactly once.
- Connect the active visual locator to bounded narration preparation, the M007
  client, and audible quick/prepared playback under the exact-development
  availability gate.
- Highlight and follow the active prepared segment without mutating publication
  DOM or moving keyboard focus.
- Treat passive visual movement as a seek after 500 ms settlement, route
  chapter and stable prepared-segment navigation through identity-first
  cancellation, preserve paused intent at the target, and expose fixed
  content-free keyboard controls.
- Persist the audible segment start when playback begins, advance only after
  matching completion, flush the latest heard checkpoint on interruption and
  lifecycle boundaries, and replay from the segment start after a mid-segment
  restart.
- Reject stale work before cancellation, abort preparation, keep sensitive
  prompts and PCM outside React state, and expose only content-free status.
- Display actionable reader loading, opening, restoration, and error states.
- Provide documented local setup plus deterministic reader/package validation.

Remaining:

- Detect relevant acceleration, publish measured hardware profiles, and provide a validated CPU-compatible fallback.
- Graduate a measured engine/voice to a supported production profile, or record
  a separate explicit product decision.
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
- A low-buffer warning appears before predictable frontier exhaustion when
  available lead crosses from above to at or below 10 playable seconds.

### Accessibility

- Core reading and playback controls are operable with a keyboard.
- Controls expose meaningful names and state to assistive technologies.
- Focus and playback or buffering state are visible.

### Performance

- No artificial startup delay is added after the initial playable-audio threshold is met.
- Wall-clock startup latency and playable audio depth at startup are measured separately.
- The MVP may buffer for up to 5 seconds per minute.
- Queues and buffers have explicit maximum sizes.
- The constrained demo retains or reserves at most 43,200,000 24-kHz mono
  sample frames, 172,800,000 logical PCM bytes, and 256 complete
  units/metadata entries simultaneously; 30 playable minutes is a ceiling, not
  a startup target or uninterrupted-playback promise.
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
