# Synchronization authority v1

## Status and scope

This is the frozen interaction and position authority for M009. Milestone 1
implements the deterministic authority and proves the selected decoration and
following mechanism in production Chromium and packaged WebView2. Milestones
2 and 3 connect bounded audible-position projection, segment highlighting,
and focus-safe automatic following to the reader. Milestone 4 connects
identity-first synchronized user navigation. Milestone 5 implements
non-skipping heard-progress persistence through the existing bounded reader
state envelope. Milestone 6 validates the complete packaged loop on the exact
Windows/CUDA host. M009.1 exact-host validation later showed that treating
ordinary scrolling as a seek made viewport inspection cancel and restart
narration. The authority is therefore amended: only an explicit navigation
action authorizes a narration seek.

The authority is desktop-local. It does not change the shared schemas, the
M005 `narration-v1` segmentation policy, or the M007 protocol-v1 service.

## Position and timing

VoxLeaf owns one narration position plus a visual projection. When narration is
inactive, the active visual locator is authoritative. When a complete prepared
unit becomes audible, its existing source `LocatorRangeV1` is the narration
authority. The user may temporarily inspect another visual passage without
changing that authority.

Synchronization is segment-level:

- the complete prepared segment is highlighted while it is active;
- `segment-started` and `segment-completed` are exact transitions;
- optional played-frame observations occur no more often than every 250 ms;
- word timing is unsupported and must not be inferred from elapsed samples;
- a start or seek inside a segment replays the containing stable segment from
  its beginning; and
- previous and next move by stable prepared-segment boundaries.

## Frozen transition table

The executable table is
`apps/desktop/src/reader/synchronization-authority.ts`. Every event has one
closed row:

| Event | Resulting phase | Position/persistence authority | Highlight/follow | Work |
| --- | --- | --- | --- | --- |
| `start` | `preparing` | visual / none | clear / none | start new |
| `segment-started` | `playing` | segment start / save start | active segment / follow if outside comfort region | preserve |
| `segment-completed` | `playing` | segment end / save end | retain last heard / none | preserve |
| `pause` | `paused` | latest heard / save latest heard | retain / none | preserve |
| `resume` | by play intent | latest heard / none | retain / follow if required | preserve |
| `buffer-exhausted` | `buffering` | latest heard / save latest heard | retain / none | preserve |
| `buffer-refilled` | `playing` | latest heard / none | retain / preserve | preserve |
| explicit visible-passage or paragraph-leaf navigation | by play intent | explicit target / save latest heard | clear / none | invalidate first |
| passive viewport movement | preserve | latest heard / preserve | retain / none | preserve |
| previous or next segment | by play intent | target visual / save latest heard | clear / none | invalidate first |
| chapter navigation | by play intent | target visual / save latest heard | clear / reader navigation policy | invalidate first |
| reflow | preserve | preserve / preserve | preserve / follow if required | preserve |
| `stop` | `inactive` | latest heard / save latest heard | clear / none | invalidate first |
| publication or settings replacement | `inactive` | latest heard / save latest heard | clear / none | invalidate first |
| service failure | `failed` | latest heard / save latest heard | clear / none | invalidate first |
| application cleanup | `inactive` | latest heard / save latest heard | clear / none | invalidate first |

For every invalidating event, eligibility changes before cleanup:

1. replace the work identity;
2. stop playback;
3. abort preparation;
4. release queued units;
5. contain active synthesis;
6. settle the canonical target; and
7. restart only when prior play intent authorizes it.

## Highlighting and following

The selected decoration is the CSS Custom Highlight API using the fixed name
`voxleaf-narration-active`. It accepts a real noncollapsed DOM `Range` without
wrapping, replacing, or annotating publication nodes. The application owns the
style and registry entry; it clears the entry on invalidation and cleanup.

The reader follows only when the audible range is outside the viewport's
24-pixel top/bottom comfort inset. Placement uses `behavior: "auto"`, preserves
the current focus and user selection, and suspends passive visual sampling
until placement settles. If usable geometry is unavailable, VoxLeaf keeps the
highlight but does not scroll.

The model-free proof confirms in production Chromium and packaged WebView2
that:

- the registry and `::highlight()` style rule are accepted under the packaged
  content-security policy;
- the range is noncollapsed and connected;
- following reaches the comfort region;
- keyboard focus and an independent user selection remain unchanged;
- publication descendant and text counts remain unchanged;
- the URL remains unchanged; and
- the packaged smoke retains zero runtime errors and zero external requests.

No new runtime dependency is required.

The production reader now implements this boundary. It retains at most one
active structural range projection, remaps through semantic DOM registration
changes instead of retaining DOM paths or geometry, and holds passive visual
sampling while a later incremental block or chapter is materialized. Exact
completion advances the internal projection to the segment end without a
second follow. Stop, failure, source replacement, and cleanup remove the
registry entry and release any pending follow.

## User navigation

Passive wheel, touch, keyboard, or scrollbar movement updates the visual
projection but is not a narration seek. It does not clear the audible
highlight, invalidate work, change play intent, or replace the active narration
locator. Programmatic following remains excluded from user-viewport sampling by
the sampling-suspension token.

An explicit paragraph leaf, previous/next passage control, chapter action, or
the fixed visible-passage action supplies an addressable target. Those actions
retain identity-first invalidation and prior play-intent behavior. Publication
prose is not turned into a button and DOM paths, quotations, page numbers, and
rendered geometry are not persisted.

The production path now implements this boundary. It retains at most 64 recent
stable prepared source ranges for previous/next movement, waits for active
synthesis containment before explicit reader placement, and exposes fixed
previous, next, and visible-passage actions. Active quick/prepared selection
cannot change, and the exact voice/model profile is not mutable, while a
session is active.

## Heard progress

Persistence remains structural and bounded:

- save the segment start when that segment becomes audible;
- save the canonical segment end only after completion;
- pause, stop, failure, replacement, and cleanup save the latest heard
  checkpoint;
- a mid-segment restart resumes from the segment start, preferring replay over
  skipping unheard content; and
- periodic callback or animation-frame writes are prohibited.

Prepared text, PCM, highlight geometry, DOM ranges, user selections, and
publication prose never enter persistence or diagnostics.

The production path now implements this boundary. One desktop-local bridge
temporarily makes exact `segment-started` and matching `segment-completed`
observations authoritative over visual persistence while narration is active.
It cancels pending visual saves at narration start, ignores periodic
played-frame observations, flushes at pause, buffering, stop, failure,
hidden-document, `pagehide`, replacement, close, and cleanup, and protects
the last heard checkpoint from reflow and passive viewport inspection.
Narration end or an explicit narration target returns authority to the
appropriate structural locator. A mid-segment restart therefore restores the
segment start. Existing exact/nearest-valid locator recovery and unsupported
future-envelope preservation remain unchanged.
