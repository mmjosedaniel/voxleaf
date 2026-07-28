# Minimum viable product

## Implementation status

The visual-reading portion of this MVP is implemented and roadmap Milestone 4 is complete: a user can open a supported local EPUB, read and navigate its bounded semantic text and static raster images in one continuous reflowable layout, adjust closed display preferences, and restore an exact or nearest-valid logical passage after reselecting the same exact bytes. Milestones 5 through 7 implement bounded narration preparation and the constrained local service while retaining the no-standard-profile decision. M008's six implementation milestones connect that work into an exact-development audible demo. Quick mode is the default; prepared mode is explicit and initially selects one minute; refill remains one minute; the low-water warning is 10 seconds; boundary waits default to zero; playback is `1.0x`; and the simultaneous 30-minute ceiling is never a startup target. Deterministic and packaged tests cover ownership, cancellation, stale suppression, lifecycle cleanup, pause continuation, truthful buffering, privacy, and all four prepared options. M008's final policy run measured 41.312 seconds to first audible output and 19.49 buffering seconds per playback minute, which exceeds the MVP target.

Completed M009 connects exact audible segment transitions to one non-mutating semantic source-range highlight, focus-safe automatic following, identity-first synchronized user navigation, and bounded non-skipping heard-position persistence, then validates the complete synchronized loop on the exact host. Segment start is saved when audible, completion advances to the canonical range end, and interruption retains the latest heard checkpoint without periodic playback writes. The accepted synchronized run observed six transitions, no stale playback, one natural underrun/refill, 190 ms cancellation, bounded cleanup, zero external requests, and 378.46 buffering seconds per playback minute. A later manual real-publication run produced narration without a visible active-segment highlight and confirmed that the outer application scroll could place the reader below the controls. M009.1 Milestone 2 repairs the proven same-chapter materialization gap and passed clean-host validation. Milestone 3 gives ready publications one dedicated reader scroll viewport, stable compact application/publication/narration chrome, collapsible narration detail, and exact loaded/target/estimate text without a progress bar. Milestone 4 adds one bounded paragraph leaf that starts narration only from a canonical block locator and reinforces preview, preparing, current audible paragraph, and saved checkpoint state without making text interactive. Desktop and Chromium evidence pass for the leaf, and the packaged native regression smoke remains green; Milestone 3's clean-host packaged gate and M009.1 exact-host closeout remain. The path therefore remains a constrained development demo rather than a passing standard profile or uninterrupted-playback promise. General hardware profiles, a validated fallback, operational resilience, and production packaging remain pending.

## Current implemented flow

1. The user opens VoxLeaf.
2. The user selects a local EPUB.
3. VoxLeaf validates and loads the book.
4. VoxLeaf opens at the user's last saved passage, or the beginning for a new book.
5. The user reads and navigates the EPUB in a continuous reflowable reader, adjusts closed display preferences, and can close or replace the publication.
6. On the exact configured development host, the user can start quick or
   prepared local narration from the active narration leaf or visible target and hear complete
   units through the bounded in-memory player.
7. The reader highlights and follows the audible stable segment. Ordinary
   viewport movement may inspect the book without changing narration. An
   explicit paragraph leaf, visible-passage, chapter, or previous/next passage
   action invalidates obsolete audio before a bounded restart from its
   canonical target.
8. When exact-development narration is available, one contextual leaf can
   replace obsolete narration and start at its canonical paragraph. The leaf
   reinforces preparing, audible, and saved states while ordinary text clicks
   remain inert.
9. VoxLeaf saves the canonical heard segment start/end checkpoint while
   narration owns position, otherwise saves the canonical visual locator, and
   retains display preferences on the approved bounded lifecycle.

The narration path is deliberately hidden when the exact native development
configuration is unavailable. It is not a standard or generally supported
runtime profile.

The highlight/follow path above passed repository-authored synthetic,
Chromium, packaged WebView2, exact-host, and M009.1 clean-host validation.
M009.1 reproduced and repaired the same-chapter materialization condition that
could leave an accepted audible range without a DOM target. Ephemeral
private-publication confirmation remains before declaring that defect the only
cause of the original observation; it may not commit the user's EPUB or weaken
the completed M009 synchronization authority.

## Remaining target user flow

1. M009.1 closes exact-host, private-publication, repository, and pull-request
   validation for the implemented visible-highlight repair, fixed compact
   reader shell, and bounded locator-backed paragraph leaf.
2. M010 adds privacy-safe compatibility reporting, evidence-backed profile
   selection, conditional fallback admission, and identity-safe recovery.
3. M011 packages and validates an end-user distribution after those boundaries
   close.

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
- Connect the active narration locator or explicit visible target to bounded narration preparation, the M007
  client, and audible quick/prepared playback under the exact-development
  availability gate.
- Keep ready-publication application, book, and compact narration chrome
  stable around exactly one EPUB scroll viewport; allow narration detail to
  collapse without hiding required state or recovery, and report loaded audio
  with exact text rather than a progress bar.
- Highlight and follow the active prepared segment without mutating publication
  DOM or moving keyboard focus.
- Let passive visual movement inspect the publication without replacing active
  narration; route only explicit leaf, visible-passage, chapter, and stable
  prepared-segment navigation through identity-first cancellation, preserve
  paused intent until an explicit target is selected, and expose fixed
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

- Close private-publication confirmation of the repaired highlight path,
  clean-host packaged validation of the fixed shell, and the approved bounded
  paragraph action.
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
  playable-audio targets, exact loaded/target duration text, and a content-free
  estimate; the presentation does not use a growing bar that can be mistaken
  for book or playback progress.
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
