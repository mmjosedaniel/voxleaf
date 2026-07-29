# ADR-0021: Add boundary-aware pauses between generated audio units

## Status

Accepted. M008.1 implements the exact desktop-local policy frozen in
[`playback-transition-pause-policy-v1.md`](../playback-transition-pause-policy-v1.md).

## Context

M008 intentionally selected gapless FIFO playback and retained a separate
zero-default adaptive boundary wait because the constrained Qwen evidence did
not justify delaying playback to help generation catch up. Exact reader use
later exposed a different problem: punctuation sounds correct inside each
generated unit, but independently generated units can sound joined when the
player starts the next buffer immediately.

This is a playback-transition problem, not a normalization, inference, or
throughput problem. M005 already supplies a closed semantic boundary reason for
each prepared segment.

## Decision

VoxLeaf schedules a bounded semantic pause after a completed audio unit and
before the next already-buffered unit. The pause is selected from the frozen
M008.1 table, with a terminal ellipsis override. Artificial hard/token splits
remain gapless.

The coordinator reduces sensitive prepared metadata to one numeric delay. The
desktop player schedules time, not silent PCM. It retains at most one pending
pause, freezes its remainder during user pause, cancels it on invalidation,
and reports elapsed intentional transition time separately.

This decision does not change M008's optional low-buffer boundary wait: that
throughput-oriented feature remains disabled at zero. It also does not change
TTS text, protocol v1, model settings, generated PCM, persistence, or buffer
capacity.

## Consequences

- Sentence, dialogue, paragraph, heading, scene, and ellipsis transitions can
  retain audible separation without changing engines.
- Generated audio remains bounded and memory-only; no silent audio object is
  created.
- Total wall-clock narration becomes slightly longer than generated-audio
  duration, and metrics must distinguish that intentional time.
- If the next unit is unavailable, ordinary buffering replaces rather than
  compounds the semantic pause.
- Later listening evidence may justify a versioned timing revision, but values
  must not change silently.

## Alternatives considered

### Add silence to every generated waveform

Rejected. It copies or extends PCM, consumes buffer capacity, and mixes
playback policy into model output.

### Fade or crossfade every boundary

Rejected. Fading can weaken a final syllable, while crossfading overlaps speech
that should remain ordered.

### Rewrite punctuation or tune each model

Rejected for this defect. Punctuation is already acceptable inside generated
units, and a shared playback correction works across admitted engines.

### Add one fixed delay after every unit

Rejected. Artificial length splits should remain continuous, while paragraph
and scene boundaries need more separation than clauses or sentences.
