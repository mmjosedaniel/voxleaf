# ADR-0039: Freeze boundary-deferred playback authority v3

## Status

Accepted on 2026-07-30.

## Context

M010.2's immutable v1 and v2 comparisons correctly selected no
pitch-preserving playback backend under their frozen gates. ADR-0038 authorized
a separate result-blind v3 because VoxLeaf's complete-unit FIFO can defer a
speed change until the next unit without restarting TTS or discarding queued
source PCM. It also accepted at most `1,000` ms p95 for the first non-default
activation and `200` MiB additional process RAM under one local inference
process.

Candidate work still required an exact immutable authority. In particular, the
recurring handoff ceiling, selected/pending/active state, exact candidate set,
`1.00x` ownership, lifecycle behavior, licence/CSP rules, and result lineage had
to be fixed before implementation or measurement.

## Decision

Accept
[`reader-settings-playback-authority-v3.md`](../reader-settings-playback-authority-v3.md)
and its matching executable desktop constants/tests as the sole M010.2 v3
comparison authority.

V3:

- retains exactly `1.00x`, `0.95x`, `0.90x`, `0.85x`, `0.80x`, and `0.75x`;
- keeps the active unit's rate immutable and applies only the latest valid
  pending value at the next complete-unit boundary;
- makes speed selection lifecycle-neutral for TTS, identity, prepared text,
  source PCM, and the bounded queue;
- compares exactly the host media-element path and a new repository-owned
  incremental WSOLA v3;
- excludes Signalsmith because its pre-trial initialization failure remained
  undiagnosed at the authority checkpoint;
- permits `1,000` ms p95 only for first non-default activation and fixes
  ordinary recurring successor handoff at `250` ms p95;
- permits at most `200` MiB additional process RAM under one exact local Piper
  inference process;
- requires zero material time-stretch ownership after settled `1.00x`;
- retains source-frame accounting, one-stretcher ownership, no duplicate
  transformed FIFO, exact duration arithmetic, listening, privacy,
  invalidation, and cleanup gates; and
- requires the implementation and result commits to be strict descendants of
  the authority commit.

V1, v2, and their committed evidence remain unchanged.

## Consequences

Milestone 2D can evaluate the smaller boundary-deferred behavior without
weakening or rewriting historical gates. A one-time candidate wake may happen
while the current unit plays; ordinary successor handoffs cannot reuse the
full one-second allowance.

This decision admits no backend and changes no production behavior. No package
is installed, no CSP directive is added, and no speed selector is enabled.
Production remains `1.00x` unless one v3 candidate passes every frozen gate on
both required hosts under the exact contention and listening sequence.

The media candidate may retain exactly `media-src 'self' blob:` only if it
wins. The repository candidate is covered by the root MIT licence, while M011
still owns final distribution review.

## Alternatives considered

- **Apply the new rate during the active unit.** Rejected because v3 is
  intentionally boundary-deferred and must not reintroduce mid-unit source
  settlement.
- **Allow one second at every boundary.** Rejected because repeated pauses
  would damage continuous narration. Recurring handoff is fixed at `250` ms
  p95.
- **Include Signalsmith.** Rejected because its isolated host initialization
  failure was reproduced but not diagnosed before this checkpoint.
- **Regenerate queued source audio.** Rejected because speed is post-synthesis
  playback processing and queued PCM remains valid.
- **Modify v2.** Rejected because its authority and no-selection result are
  historical evidence.
