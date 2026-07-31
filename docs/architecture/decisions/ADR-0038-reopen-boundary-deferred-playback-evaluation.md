# ADR-0038: Reopen playback-speed evaluation at generated-unit boundaries

## Status

Accepted on 2026-07-30.

## Context

ADR-0037 correctly retained fixed `1.00x` playback because neither v2
candidate passed every result-blind gate. Its 128 MiB additional-process-RAM
limit and 250 ms backend-start p95 limit remain immutable historical
acceptance rules.

The v2 comparison also required a rate change to settle and take effect during
an active generated audio unit. VoxLeaf's implemented playback owner instead
already retains complete source-PCM units in one bounded FIFO and starts only
one unit at a time. TTS generation, queued PCM ownership, and playback are
separate boundaries. This permits a smaller product behavior: leave the
currently audible unit unchanged and apply the newest selected speed when the
next unit becomes active.

The exact-host v2 evidence showed:

- the media candidate used 180.973 MiB additional process RAM under one active
  Piper inference process; and
- repository WSOLA reached 821.6 ms backend-start p95 under the same
  contention.

The maintainer accepts a bounded first non-default activation of at most one
second and at most 200 MiB additional process RAM for this hardware-oriented
desktop product. Those new limits cannot be applied retroactively to v2.

## Decision

Authorize a separate result-blind v3 comparison before M010.2 Settings
implementation.

The v3 authority must freeze these product rules before candidate code or new
measurements:

- the closed playback-rate set remains `1.00x`, `0.95x`, `0.90x`, `0.85x`,
  `0.80x`, and `0.75x`;
- changing speed while a unit is audible records a pending selection; the
  active unit keeps its immutable active rate;
- the newest pending selection takes effect only after that unit completes and
  before the next complete queued unit starts;
- a speed-only change does not cancel or restart TTS, replace session or
  generation identity, discard or regenerate source PCM, clear the bounded
  queue, or alter prepared narration text;
- already-generated queued units remain reusable because time stretching is a
  post-synthesis playback operation;
- entering a non-default speed may initialize or wake one bounded stretcher
  while the current unit continues. The first activation p95 must be at most
  1,000 ms, and any residual boundary wait must be observable;
- the stretcher is reused across successor units. The full one-second
  activation allowance cannot recur at every generated-unit boundary;
- additional process RAM under the frozen local-inference contention arm must
  not exceed 200 MiB;
- `1.00x` bypasses time stretching. It must not retain an active stretcher,
  transformed-audio copy, object URL, work queue, or material steady-state
  time-stretch CPU/RAM cost after the preceding slowed unit settles;
- at most one active playback backend exists, and no pre-stretched duplicate
  of the bounded source-PCM FIFO is retained;
- source sample frames remain heard-progress, highlighting, persistence, and
  memory authority. Effective listening duration changes only when the next
  unit adopts the new rate; and
- stop, seek, chapter navigation, profile/language replacement, book
  replacement, recovery, and exit retain their existing identity-first
  invalidation rules.

If the user changes the selection several times before the current unit ends,
the latest valid value wins. The UI may expose the selected value immediately,
but it must distinguish it from the active audible value until the boundary is
crossed.

Milestone 2C must freeze executable v3 authority, exact candidates, the
recurring-unit handoff gate, listening criteria, licence/distribution rules,
and strict authority/result lineage before Milestone 2D implements or measures
anything. Historical v1/v2 documents and evidence remain unchanged.

## Consequences

The proposed behavior fits the current complete-unit FIFO. It removes
mid-unit source-frame settlement from the candidate comparison and avoids
restarting the model or throwing away useful generated audio.

A first activation may consume part of the remaining current unit. If it is
not ready when that unit ends, the user may observe a bounded wait, but not
more than the frozen one-second p95 allowance. Once active, the implementation
must prepare or reuse the same bounded backend so ordinary successor-unit
handoffs do not add that full delay repeatedly.

Slower playback gives local inference more wall-clock time without changing
model RTF. For example, eight seconds of source audio lasts approximately
10.67 seconds at `0.75x`, giving generation approximately 2.67 additional
seconds while that unit is heard.

No backend is admitted by this ADR. Production remains `1.00x` until the v3
authority is committed first and one candidate passes its complete browser,
packaged WebView2, exact-host contention, privacy, lifecycle, licence, and
listening sequence.

## Alternatives considered

- **Change the active unit immediately.** Rejected for v3 because it adds
  mid-unit progress settlement, audible discontinuity risk, and lifecycle
  complexity without helping TTS generation.
- **Regenerate queued speech at the new speed.** Rejected because playback
  speed is engine-neutral post-processing and generated PCM remains valid.
- **Permit one second at every unit boundary.** Rejected because repeated gaps
  would make continuous narration visibly worse; the allowance is for first
  non-default activation.
- **Rewrite the v2 gates and select from existing results.** Rejected because
  it would invalidate the result-blind evaluation history.
