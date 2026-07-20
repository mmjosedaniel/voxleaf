# ADR-0002: Keep generated speech in bounded memory

## Status

Accepted

## Context

VoxLeaf is a reader, not an audiobook exporter. Persisting generated audio would consume disk space, complicate invalidation, and create additional privacy and copyright concerns.

The application still needs enough generated audio ahead of playback to tolerate variable inference speed.

## Decision

Keep generated audio in a bounded in-memory buffer and discard frames after playback or cancellation.

Persistent generated-audio storage is excluded from the MVP.

## Consequences

- Disk use and retained user content are minimized.
- Audio must be regenerated after restarting or revisiting uncached content.
- Buffer size, underrun handling, and cancellation become critical.
- Long sessions must not cause memory growth.
- Future export or cache features require a new privacy and product decision.

## Alternatives considered

- Generate complete chapter files before playback: excessive latency and storage.
- Persistent chunk cache: faster revisits but outside the MVP privacy and complexity budget.
- Streaming directly with no buffer: too vulnerable to inference variability.
