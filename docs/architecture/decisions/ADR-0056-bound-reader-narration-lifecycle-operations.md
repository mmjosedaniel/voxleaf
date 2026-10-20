# ADR-0056: Bound reader and narration lifecycle operations

## Status

Accepted, 2026-10-20, after host validation and independent approval in the completed
[reader/narration bug-fix plan](../../plans/completed/reader-narration-bugfixes.md).

## Context

Startup preparation holds the native operation mutex while loading/warming.
Waiting for it before shutdown delays Stop. Discarding a stopped player without
closing its backend leaks audio-device ownership. Lazy raster reads incorrectly
inherit ingestion's elapsed time. Preparing beyond 64 segments evicts the
audible navigation target even though its audio remains buffered.

## Decision

- Keep Python protocol v1 and one native child. The existing native shutdown
  command accepts an optional `serviceInstanceId` and interrupts the captured
  busy child without acquiring the operation mutex. Session-slot locking
  serializes spawn/publication and containment. The operation mutex still
  prevents restart until the abandoned native operation settles. Incoming
  controls and failure cleanup validate the captured session before changing
  lifecycle; old work cannot stop or mark a replacement ready/failed.
- The typed client retains pending start ownership, rejects stale start/prepare/
  health results, and refuses replacement during cleanup. When shutdown races
  start dispatch, it first attempts interruption, then contains an eventual
  successful start by its returned identity. Idle shutdown remains graceful.
- A read-only native `tts_service_lifecycle_observation` command returns only
  schema version, captured service-instance identity (or null) and lifecycle
  state. It takes the session/lifecycle locks in ownership order without the
  operation lock, so the host harness can prove loading/warming for the same
  instance before Cancel start. It neither sends a child message nor changes
  Python protocol v1, starts work, exposes paths, or returns narration text.
- Permanent player disposal calls idempotent close, and cleanup observes both
  bounded PCM release and backend closure. Backend `close` may return a promise.
  Web Audio closes its context and settles pending worklet creation; a late
  worklet closes without connection. Failed close leaves narration unavailable
  instead of reporting successful cleanup. No new audio retention is added.
  Concurrent coordinator close callers join one completion. Stop uses one
  monotonic five-second cleanup deadline, including abandoned-operation and
  backend settlement, with the separate two-second worker-termination limit.
  A completed-synthesis cancellation race permits explicit restart only after
  validated native containment and complete playback cleanup; other failed
  cancellation/cleanup paths remain unavailable.
- Ingestion retains its original 30,000-ms deadline. Each lazy raster read gets
  a fresh monotonic 30,000-ms (or stricter) deadline with its abort context.
  Admission facts, cumulative observed decompression bytes, compressed-read
  accounting, aggregate/per-entry ratios, CRC, signatures and all byte/count
  limits remain archive-lifetime authorities. Reading time is not decompression
  time. Each read has one owner and publication close cancels it.
- Retain at most 64 navigation ranges, anchored at the audible range. Evict
  distant future ranges while preserving current/next and up to 32 recent
  predecessors. On audible advancement, replenish from the existing bounded
  audio FIFO and current prepared batch. No second unbounded range list, text
  cache, PCM copy, segmentation change, or locator-schema change is introduced.

## Consequences

Stop can contain model startup and disposal has an observable completion.
Late local images remain readable and prepared-mode Next remains available.
These changes preserve the component topology, privacy, source-frame/byte
ceilings, 256-unit audio ceiling, and stable locator/heard-checkpoint policy.
Context-close counts prove ownership release, not long-term RAM improvement.

## Alternatives considered

- Awaiting startup before shutdown cannot interrupt loading.
- A global force-stop alone cannot prove stale-instance isolation.
- Resetting aggregate EPUB counters or removing its deadline weakens limits.
- Raising the 64-range limit only moves the navigation failure farther away.
