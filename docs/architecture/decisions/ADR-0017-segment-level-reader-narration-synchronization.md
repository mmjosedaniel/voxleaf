# ADR-0017: Use segment-level reader and narration synchronization

## Status

Accepted for M009. Milestones 1 through 6 freeze the authority, project exact
audible source ranges, implement reader highlighting/following, and connect
identity-first synchronized user navigation plus non-skipping heard-progress
persistence. The exact-host synchronized demo passes; final closeout remains.

## Context

The completed reader owns canonical EPUB locators and a semantic DOM range
mapper. M005 prepared narration already gives every stable segment a source
`LocatorRangeV1`. M007 and M008 produce and play complete bounded waveforms,
but the selected Qwen adapter supplies no word timestamps and does not stream
model audio.

M009 needs one deterministic position policy that can highlight and follow
audible content without inventing timing, mutating safe publication content,
stealing focus, creating navigation loops, or widening the TTS protocol. It
also needs a non-skipping persistence rule and immediate stale-audio
invalidation for manual navigation.

## Decision

The frozen authority is documented in
[`../synchronization-authority-v1.md`](../synchronization-authority-v1.md) and
encoded in `synchronization-authority.ts`.

VoxLeaf synchronizes at the prepared-segment source-range level. Exact
segment-start and segment-complete transitions determine audible progress.
Word-level progress is unsupported. Starting or seeking within a segment
replays the full containing segment, and previous/next moves between stable
prepared segments.

The reader uses the CSS Custom Highlight API with the fixed
`voxleaf-narration-active` registry name. It creates no publication wrapper
nodes. Model-free Chromium and packaged WebView2 proofs accept the range and
style rule, preserve focus and an independent selection, leave publication
content and URL unchanged, and retain the packaged zero-error/zero-external-
request boundary.

Automatic following uses the reader's existing 24-pixel comfort inset and
instant placement. It runs only when the audible range is outside that region,
preserves focus, and suspends passive visual sampling while it settles. Missing
geometry produces highlight-only behavior.

User-originated passive visual movement immediately invalidates active work on
the first canonical locator change. After 500 ms settlement, active play
intent restarts from the settled active visual locator; paused intent remains
paused there. All invalidation revokes eligibility before playback stop,
preparation cleanup, queue release, and synthesis containment.

The implementation retains at most 64 recent stable prepared source ranges for
previous/next movement and keeps that structural history outside React state.
Chapter and narration-boundary placement wait for containment before using the
reader's existing canonical navigation and focus policy. The exact
Qwen/Serena voice/model profile is fixed; quick/prepared selection cannot
change during an active session, and any future voice/model replacement must
close the old coordinator first.

Persistence saves segment start at audible start, segment end after audible
completion, and the latest heard checkpoint on interruption. Mid-segment
restore replays from segment start. Periodic progress writes are prohibited.

The implemented persistence bridge uses the existing
`PersistedReadingStateV1` and bounded Web Storage repository without adding a
schema or migration. Narration start cancels a pending visual save; exact
audible boundaries become temporary persistence authority; pause, buffering,
stop, failure, hidden-document, `pagehide`, replacement, close, and cleanup
flush the latest heard checkpoint. Reflow and programmatic following cannot
regress that checkpoint, while later genuine user navigation returns
authority to the existing visual save policy.

No shared-schema, M005 segmentation, M007 protocol, or production dependency
change is authorized.

## Consequences

- Synchronization is honest about the timing available from the exact
  development adapter.
- Highlighting survives semantic markup and reflow without changing
  publication text or user selection.
- Coarse segments can produce coarse visual movement and partial replay.
- Passive scrolling during active narration is an explicit seek, not a
  temporarily independent viewport.
- Progress observations and metadata can remain desktop-local and bounded to
  existing work identities.
- A later timestamp-capable engine requires a new authority before word-level
  highlighting or inside-segment clipping can be implemented.
- The implemented reader projection, navigation, and persistence do not
  improve Qwen throughput or resolve ADR-0013's standard profile blocker.

## Alternatives considered

### Application-owned DOM wrappers

Rejected because wrapping text changes the semantic publication DOM, can
disturb selection and incremental rendering, and adds cleanup complexity
across reflow.

### Overlay geometry

Rejected because rendered rectangles are ephemeral, require more retained
state and relayout work, and are harder to keep correct across zoom, reflow,
and incremental rendering.

### Elapsed-time word approximation

Rejected because samples and text length do not establish spoken-word timing.
It would present false precision.

### Clip text or PCM for an inside-segment seek

Rejected because normalized text and waveform offsets have no authoritative
alignment. Replaying the stable containing segment is deterministic and
non-skipping.

### Let passive scrolling temporarily separate reading and narration

Rejected because it creates two competing reading positions. Immediate
identity-first seek plus bounded settlement retains one authority and makes
stale playback ineligible.

### Require an explicit action after every passive scroll

Not selected for the MVP because the existing active visual locator already
provides a deterministic addressable target. The 500 ms settlement window
limits restart churn while preserving prior play intent.
