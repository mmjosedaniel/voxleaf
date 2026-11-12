# ADR-0071: Preserve admitted checkpoints and recycle viewport image capacity

## Status

Accepted and implemented under the
[reader position and image lifecycle plan](../../plans/completed/reader-position-and-image-lifecycle.md).
Current host results and independent acceptance are recorded in its
[execution ledger](../../plans/evidence/reader-position-and-image-lifecycle/execution-ledger.md).

## Context

An exact saved EPUB offset can be temporarily placed at its block start when
range geometry is unavailable. That visual position is useful for Play, but
does not supersede the saved checkpoint. Passing it into a later appearance
save incorrectly conflates presentation with reading progress.

ADR-0010's eight live sources and aggregate-pixel ceiling safely bound images.
Retaining every visited source until chapter replacement also prevents image
nine from loading in a long chapter. Previously, CAF R7.2 deliberately retained
this unavailable-on-saturation policy. This decision changes the lifecycle and
retry policy without changing image admission or safety limits.

## Decision

- The existing position-save coordinator owns admitted progress. Reflow can
  expedite an already pending admitted save and accepts no replacement locator.
  Initial package recovery, real manual movement, explicit navigation and
  confirmed heard checkpoints retain their existing admission rules. The
  reader/narrator still receive the actually settled visual location.
- Active visual tracking retains one transient settled block/viewport snapshot.
  A delayed layout/anchoring notification at the same measured placement cannot
  replace an interior checkpoint with the first caret on that line. The existing
  one-pixel placement tolerance applies. Displacement retires this guard and
  normal sampling resumes; missing geometry never installs it. No input-event
  classification, timer or geometry persistence is introduced.
- The publication raster loader owns one occurrence subscription per mounted
  semantic image. Components report outside/near/visible status relative to the
  reader viewport using a 256 px retention margin. Outside occurrences abort
  work and release sources. Visible demand has priority over near prefetch;
  capacity pressure can evict a near source, never a visible one for prefetch.
- The existing serialized loader remains capped at eight active-plus-queued
  requests. The unchanged source manager enforces one decode, eight live sources
  and 16,777,216 aggregate live pixels, plus all existing per-image guards.
- Queue pressure waits for a queue slot. Live-budget pressure retries after a
  release or changed visibility. It does not repeatedly read/decode on an
  unchanged capacity snapshot. Preempted prefetch waits for changed visibility.
  Over-capacity visible sets retain deterministic placeholders without cycling
  sources. Invalid/unsupported/decode-failed images do not retry automatically.
- Waiting registrations contain only bounded chapter-local metadata and
  callbacks, not bytes, promises or decoded surfaces. They are bounded by the
  existing 80,000 admitted DOM-node ceiling and disappear on unmount. Completed
  sources remain explicit handles; wrapped release notifies the loader once.
- A previously decoded image keeps its numeric width/aspect ratio while evicted,
  constrained by the reader width. This transient geometry is never persisted.
  Re-entry reacquires local bytes. Stale read/decode completions cannot publish
  into a replacement occurrence, and stale image errors cannot retire a newer
  source. Missing observer support retains a bounded fallback.

No shared schema, EPUB package boundary, persistence backend, native capability,
CSP, dependency, TTS contract or system-diagram edge changes. No image-byte cache
or second scheduler is introduced. Generated audio remains ephemeral.

## Consequences and verification

A later supported image can load after earlier images leave the retained area;
revisiting an evicted image costs another bounded local read/decode. Simultaneous
display of a set above the existing budgets is not promised. Accessible alt and
permanent-failure fallback remain unchanged.

Regression coverage includes fallback plus each appearance control, lifecycle
flush/reselection, genuine subsequent movement, twelve sequential images and
return, separate queue/source/pixel pressure, malformed input, cancellation,
StrictMode and local-only Blob decoding. Chromium and packaged WebView2 exercise
the same synthetic fixture; the reader benchmarks retain existing thresholds.
Modeled missing-range observations are labeled separately from natural layout.
Historical DCR-02 remains withdrawn and C15 is not promoted to a new reproduced
production defect. The plan's current host gates pass and exact implementation
review RPI-CR-R1-20261110 is APPROVE. The linked evidence, rather than this ADR
alone, establishes that bounded acceptance.

## 2026-11-11: Protect automatic follow before settlement

An instant narration follow can move the viewport before its scheduled locator
settlement. If Stop cancels that settlement, a delayed scroll notification still
belongs to that automatic movement and cannot admit a new passive checkpoint.

The follow owner records actual displacement at initiation, including corrective
follow scrolls. The existing tracker retains one measured block/viewport placement
and scroll offset without changing its locator or admitting a save. An unchanged
placement suppresses the delayed sample; real displacement, explicit placement,
root/document replacement or disposal retires that protection. Missing geometry
and a clamped scroll that did not move introduce no new suppression.

This extends the existing transient geometry guard; it adds no input-event
classification, timer, persisted geometry, process, schema or persistence owner.
Controlled Chromium evidence distinguishes stable-height late-scroll reproduction
from responsive reflow, which can independently protect the checkpoint. Current
case and combined acceptance are tracked in the
[five-pass execution ledger](../../plans/evidence/five-pass-audit/execution-ledger.md);
the new campaign's integration gates remain pending.
