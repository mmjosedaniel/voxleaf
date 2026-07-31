# Reader settings and playback authority v3

## Status

Accepted and frozen before v3 candidate implementation or result-bearing work
on 2026-07-30 for M010.2 Milestone 2C. The matching executable authority is
[`reader-settings-playback-authority-v3.ts`](../../apps/desktop/src/tts/reader-settings-playback-authority-v3.ts).

This authority changes no production behavior. VoxLeaf still plays at
`1.00x`, exposes no speed selector, uses no time-stretch dependency, and keeps
the existing Content Security Policy (CSP). Milestone 2D may implement and
measure only the candidates, state transitions, and gates frozen here.

## Relationship to v1 and v2

The completed
[`reader-settings-playback-authority-v1.md`](reader-settings-playback-authority-v1.md),
[`reader-settings-playback-authority-v2.md`](reader-settings-playback-authority-v2.md),
their decisions, and their result evidence remain immutable. V3 supersedes only
the future playback comparison target. It does not reinterpret, delete, or
tune either historical result.

V3 retains:

- the six exact v2 rates;
- the v1/v2 pitch, duration, source-frame, work-memory, CPU, teardown,
  listening, host, privacy, and zero-persistence requirements;
- the existing source-PCM, unit, metadata, and one-service-tree ceilings; and
- fixed `1.00x` when no candidate passes.

V3 changes only the future comparison behavior and its activation-scoped
limits. It permits the current complete generated unit to finish at its active
rate, raises the first non-default activation ceiling to `1,000` ms p95, raises
additional process RAM to `200` MiB under the exact contention arm, and adds a
separate `250` ms p95 ceiling for recurring successor-unit handoff.

## Closed playback-rate set and arithmetic

Only these exact rational rates are admitted:

| Percent | Label   | Rational rate |
| ------- | ------- | ------------- |
| 100     | `1.00x` | `100/100`     |
| 95      | `0.95x` | `95/100`      |
| 90      | `0.90x` | `90/100`      |
| 85      | `0.85x` | `85/100`      |
| 80      | `0.80x` | `80/100`      |
| 75      | `0.75x` | `75/100`      |

Every other persisted or runtime value is invalid. Source-media and effective
listening duration remain exact integer arithmetic:

```text
sourceMediaMs = floor(sourceFrames * 1000 / 24000)
effectiveListeningMs =
  floor(sourceFrames * 1000 * 100 / (24000 * ratePercent))
minimumSourceFrames =
  ceil(effectiveListeningMs * 24000 * ratePercent / (1000 * 100))
```

Source sample frames remain the authority for heard progress, highlighting,
persistence, release, and bounded memory. Slower playback changes only
effective listening duration after the relevant unit becomes active.

## Selected, pending, and active rate state

The playback owner has three distinct values:

- **selected rate:** the newest valid user choice and the value shown
  immediately as selected;
- **pending rate:** the newest valid choice that differs from the active rate;
  only one pending value exists and the latest choice wins; and
- **active rate:** the immutable rate of the currently audible complete unit.

The pending value may become active at exactly one of these boundaries:

1. immediately before the initial complete unit starts; or
2. after the current complete unit has ended and before its complete queued
   successor starts.

Mid-unit activation is prohibited. Returning the selected value to the active
rate before the boundary clears the pending change. The UI must distinguish the
selected value from the active audible value while they differ.

## Speed-only lifecycle behavior

Selecting a speed does not:

- cancel or restart TTS;
- replace the session or generation identity;
- change prepared narration text or a TTS request;
- regenerate source PCM; or
- release or clear queued source PCM.

Pause preserves active rate, pending rate, source offset, and queued PCM.
Resume continues the active unit at its active rate before any successor
boundary. Stop, seek, chapter change, profile or language change, book close,
session replacement, candidate failure, and app exit retain the existing
identity-first invalidation and cleanup rules.

The existing semantic boundary pauses remain separate interruptible wall-clock
timers. V3 does not synthesize silent PCM and does not alter them.

## Exact candidate set

No candidate outside this table may be implemented or measured as v3 evidence.

| Candidate ID                                             | Exact source identity                                                                                                                                                                                               | Runtime ownership bound                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `html-media-element-preserves-pitch-wav-boundary-v3`     | Host `HTMLMediaElement.playbackRate`, `HTMLMediaElement.preservesPitch`, `URL.createObjectURL`, and `URL.revokeObjectURL` APIs                                                                                      | one service unit, one WAV copy, and one object URL |
| `repository-incremental-audio-worklet-wsola-boundary-v3` | New controller `apps/desktop/src/tts/playback-backends/incremental-wsola-v3.ts` and worklet `apps/desktop/src/tts/playback-backends/incremental-wsola-v3-worklet.ts` in a strict descendant of the authority commit | one service unit and one incremental stretcher     |

The repository WSOLA implementation must be new v3 work. Reusing or relabelling
the removed v2 experiment is prohibited.

`signalsmith-stretch@1.3.2` is excluded. Its pre-trial initialization failure
was reproduced in an isolated normal host PowerShell run and was not diagnosed
before this authority checkpoint. It is therefore not a v3 candidate.

## Fee-free licence and CSP authority

An admitted candidate must be either a host platform API or repository-owned
code covered by the repository's MIT licence. Purchase, subscription, royalty,
paid-seat, commercial-exception, copyleft, source-availability, unknown, or
ambiguous obligations stop implementation or evaluation. M011 owns the final
distribution and third-party-notice review.

The current CSP remains:

```text
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' blob:; connect-src ipc: http://ipc.localhost
```

Only the media candidate may propose exactly:

```text
media-src 'self' blob:
```

`connect-src` must remain unchanged. `data:`, remote `http:` or `https:` media,
wildcards, and new native capabilities are prohibited. The delta is not
retained unless the media candidate wins every v3 gate.

## Ownership, memory, and privacy

At non-default speed, at most one active candidate, one time stretcher, one
object URL, and one TTS service tree may exist. A candidate may not create or
retain a duplicate pre-stretched FIFO. Source storage remains bounded to
43,200,000 sample frames, 172,800,000 logical PCM bytes, 256 complete units,
and 256 metadata entries.

At `1.00x`, after a preceding slowed unit and its handoff settle, time
stretching must own:

- zero active stretchers;
- zero object URLs;
- zero transformed-audio copies;
- zero time-stretch work queues; and
- zero additional time-stretch work bytes.

No external request and no persisted generated-audio byte is allowed. Object
URLs must be revoked deterministically before replacement or exit.

## Result-blind evaluation

Deterministic tests run at every non-default rate: `0.95x`, `0.90x`, `0.85x`,
`0.80x`, and `0.75x`. One fluent maintainer per language listens to the frozen
Spanish and English cases at `1.00x`, `0.85x`, and `0.75x`.

The exact machine gates are:

| Gate                                                    |              Maximum |
| ------------------------------------------------------- | -------------------: |
| pitch deviation                                         |             20 cents |
| rendered-duration error                                 |                50 ms |
| source-frame drift                                      |                    0 |
| first non-default activation p95                        |             1,000 ms |
| recurring complete-unit handoff p95                     |               250 ms |
| pause/stop teardown p95                                 |               250 ms |
| additional work memory                                  |      7,680,000 bytes |
| additional process RAM under one local Piper process    |              200 MiB |
| CPU increase while local inference runs                 | 20 percentage points |
| active stretchers                                       |                    1 |
| mid-unit activation events                              |                    0 |
| recurring handoffs using the first-activation allowance |                    0 |
| external requests                                       |                    0 |
| persisted generated audio                               |              0 bytes |

The first-activation allowance may initialize or wake one candidate while the
current unit continues. It may not recur at each unit boundary. The exact
contention arm runs sequentially with one
`piper-1-4-2-onnx-cpu-es-es-davefx-medium-v1` inference process and one
candidate. Both production Chromium and packaged Windows WebView2 must pass in
normal host PowerShell outside the managed sandbox.

Listening requires at least 4/5 intelligibility, 3/5 naturalness, and 3/5
artifact score, with no omitted or repeated words.

The authority must be committed before any implementation or result. Every
result must name that authority commit and an execution commit that is its
strict descendant. Candidate implementation before the authority commit,
result artifacts before the authority commit, and post-result gate tuning are
prohibited.

## Current outcome

This milestone freezes evaluation authority only. It admits no backend,
implements no candidate, installs no dependency, changes no CSP, and enables no
non-default speed. Milestone 2D must select one complete passer or retain
`1.00x` without a speed selector.
