# Playback transition pause policy v1

## Status

Accepted on 2026-07-29 before implementation by M008.1. This policy is a
desktop-local overlay on the completed M008 buffer/player and completed M005
prepared-segment boundary reason. It does not change prepared narration text,
the TTS protocol, model input, generated PCM, or the M008 optional
low-buffer boundary-wait policy.

## Problem

Each TTS request returns one complete audio unit. Playing two independently
generated units with no temporal separation can make adjacent sentences or
paragraphs sound joined even when punctuation is pronounced correctly inside
each unit.

The correction belongs at the playback transition. VoxLeaf must not add
punctuation to model input, rewrite source text, generate or retain silent
audio, crossfade speech, or apply a general fade-out that can weaken a final
syllable.

## Frozen transition policy

After one complete audio unit ends, apply the following delay before the next
already-buffered unit begins:

| Completed segment boundary | Delay |
| -------------------------- | ----: |
| `hard-limit`               |  0 ms |
| `token`                    |  0 ms |
| `clause`                   | 150 ms |
| `sentence`                 | 300 ms |
| `dialogue-turn`            | 400 ms |
| `paragraph`                | 600 ms |
| `heading`                  | 750 ms |
| `scene-break`              | 1,200 ms |
| Segment ending in `...` or `…` | 900 ms |

The ellipsis value overrides the ordinary boundary value. A terminal ellipsis
may be followed only by canonical closing quotation/bracket punctuation and
whitespace to qualify.

The delay is eligible only when a next valid unit is already buffered after
the completed unit is released. If playback instead reaches an empty buffer,
the real buffering interval supplies more than the intended separation and no
additional transition pause is added when audio later resumes. No delay is
added after the final unit.

## Playback, lifecycle, and measurement rules

- A transition pause contributes zero playable sample frames and zero payload
  bytes.
- The scheduler retains no text for this feature. The coordinator converts the
  prepared boundary and ephemeral text suffix into one bounded numeric delay
  before dropping its prepared-text reference.
- The player owns at most one pending transition pause. It starts no audio
  source while that pause is active.
- Playback pause freezes the remaining transition delay. Resume continues only
  the remainder before starting the same next unit.
- Stop, seek, chapter or profile change, book replacement, failure, and close
  cancel the pending delay before stale cleanup.
- Intentional transition time is measured separately from audible playback and
  involuntary buffering.
- Segment completion remains the heard-progress authority. The next segment
  becomes active only when its audio actually starts after the delay.
- Existing FIFO, 30-minute audio, unit, byte, preparation, synthesis,
  cancellation, and privacy limits remain unchanged.

## Non-goals

- Do not insert pauses inside a model-produced audio unit.
- Do not change punctuation normalization or model-specific preprocessing.
- Do not use silence to disguise an underrun or claim better real-time
  throughput.
- Do not implement crossfading, speech trimming, or automatic waveform
  analysis.
- Do not expose book text, punctuation previews, locators, or audio in metrics
  or UI state.

## Required evidence

Implementation must prove:

- exact deterministic mapping for every closed boundary reason and terminal
  ellipsis;
- immediate continuation for hard/token splits;
- one interruptible scheduled delay between two already-buffered units;
- no extra delay after buffering or final completion;
- pause/resume preserves only the remaining delay;
- stop, seek, failure, and close suppress late timer callbacks and stale audio;
- audible progress begins only when the next unit starts;
- intentional transition time is distinct from playback and buffering time;
  and
- focused desktop, complete portable, authoritative Windows, privacy, and
  repository validation pass.
