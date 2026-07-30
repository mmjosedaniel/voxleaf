# ADR-0033: Freeze reader settings and pitch-preserving playback authority

Status: Accepted
Date: 2026-07-30

## Context

The completed reader, synchronization, compatibility, bilingual TTS, and
bounded playback layers expose the behavior needed for a portfolio demo, but
the ready UI still distributes setup controls around the reading surface.
Playback remains fixed at `1.00x`.

M010.2 needs a reader-first Settings shell, an English fallback that does not
overwrite valid Spanish state, and engine-neutral slower playback. These
changes affect persistence, layout, timing, source-frame progress, buffering,
accessibility, and lifecycle behavior. Selecting a time-stretch backend before
freezing its inputs and gates would allow implementation results to redefine
acceptance.

## Decision

Accept
[`reader-settings-playback-authority-v1.md`](../reader-settings-playback-authority-v1.md)
and its executable desktop constants as the pre-implementation authority.

The authority freezes:

- fixed shell regions, one publication scroll owner, responsive drawer/sheet
  dimensions, Settings ordering, and lifecycle-neutral dialog semantics;
- compact narration-bar contents and text-only loaded-duration meaning;
- English fallback/migration behavior and exact language/profile visibility;
- bounded versioned language, startup, and playback preference families;
- eleven integer-percent playback rates from 100% through 50%;
- source-frame/effective-duration arithmetic and mid-unit rate-change order;
- unchanged wall-clock transition pauses and existing PCM resource ceilings;
  and
- backend candidates, synthetic/listening inputs, hosts, resource limits,
  privacy rules, and pass/fail gates before experimentation.

Playback speed belongs after synthesis at the in-memory player. All engines
receive unchanged prepared text and produce unchanged source PCM. Pitch
preservation is required. Direct `AudioBufferSourceNode.playbackRate` is only a
negative control.

Only repository AudioWorklet WSOLA and HTMLMediaElement `preservesPitch` with
an in-memory WAV copy may enter the initial comparison. Neither adds a
production dependency. If neither passes every frozen gate, VoxLeaf remains
at `1.00x`.

## Consequences

One playback-rate implementation can serve Piper, Chatterbox, Qwen, and later
engines without regeneration or work-identity replacement. Source frames
remain the single progress and resource authority while effective listening
duration can truthfully govern startup and underrun promises.

Milestone 2 has a closed experiment and cannot tune gates after results.
Milestones 3-5 may implement preferences, UI, and playback only within this
authority. The current runtime remains Spanish-fallback and `1.00x` until
those milestones pass.

The historical bilingual authority remains byte-identical. Its runtime
fallback may be superseded only through new versioned preference authority.

## Alternatives considered

- Asking each TTS model to speak more slowly was rejected because behavior is
  engine-specific, changes generation, requires regeneration after a rate
  change, and may alter model quality or RTF.
- Direct Web Audio playback-rate changes were rejected as the product
  implementation because they change pitch.
- Reusing a historical generic reading-state playback-rate field was rejected
  because global narration speed requires explicit bounded ownership and
  migration, not implicit per-book persistence.
- Scaling semantic transition pauses with speed was rejected because those
  pauses are independent interruptible wall-clock policy.
- Leaving controls distributed across the reader was rejected because it
  weakens the book-first hierarchy and can create duplicate state ownership.
- Adding a production time-stretch dependency before measurement was rejected
  because licensing, distribution, memory, cancellation, and platform
  obligations are not yet established.
