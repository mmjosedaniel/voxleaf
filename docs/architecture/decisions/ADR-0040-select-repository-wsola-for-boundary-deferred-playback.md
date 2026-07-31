# ADR-0040: Select repository WSOLA for boundary-deferred playback

## Status

Accepted on 2026-07-31.

## Context

ADR-0038 authorized a separate boundary-deferred playback-speed evaluation
without rewriting the failed v1 or v2 comparisons. ADR-0039 froze the exact v3
candidates, six-rate matrix, selected/pending/active transition, first-
activation and recurring-handoff limits, resource gates, listening rubric,
privacy rules, and strict result lineage before implementation or
measurement.

The v3 implementation commit is a strict descendant of authority commit
`41322294c62ff3e35aa08e9f3ead27ce38bfc84d`. Both eligible candidates passed
synthetic Chromium, packaged Windows WebView2, exact Piper-inference
contention, lifecycle, cleanup, privacy, and bilingual listening.

## Decision

Select
`repository-incremental-audio-worklet-wsola-boundary-v3` as the sole backend
eligible for product integration in M010.2 Milestone 5.

- Under exact Piper contention, first activation was `605.4 ms` p95,
  recurring complete-unit handoff was `10.1 ms` p95, additional process RAM
  was `24.715 MiB`, and CPU increase was `3.077` percentage points.
- Maximum additional work memory was `806,528` bytes, maximum pitch deviation
  was `0.243` cents, rendered-duration error and source-frame drift were zero,
  and pause/stop teardown remained below `1 ms` p95.
- The fluent Spanish/English evaluation recorded minimum scores of `5/5`
  intelligibility, `4/5` naturalness, and `5/5` artifacts across the frozen
  `1.00x`, `0.85x`, and `0.75x` matrix, with no omitted or repeated words.
- The selected implementation is repository-owned, adds no package or
  production dependency, requires no CSP expansion, makes zero external
  requests, and persists zero generated-audio bytes.

Retain only the selected WSOLA controller and worklet after evaluation.
Remove the unselected media adapter, its prospective
`media-src 'self' blob:` test policy, all candidate probes and host/listening
runners, and every temporary generated WAV.

This decision selects an implementation candidate; it does not enable
non-default playback in the current product. Production remains literal
`1.00x` until Milestone 5 connects this exact backend to the bounded player,
implements selected/pending/active state and effective-listening-duration
accounting, and passes its integration gates.

The content-safe aggregate result is
[`boundary-deferred-v3-result.json`](../../../benchmarks/playback/boundary-deferred-v3-result.json).

## Consequences

Milestones 3 and 4 can proceed with bounded preferences, English fallback,
reader-first chrome, and accessible Settings. Milestone 5 is now applicable
and must integrate only the selected v3 controller/worklet. It must not
reintroduce the media candidate, change the six rates, alter TTS requests,
discard queued source PCM, or activate a pending rate inside the currently
audible unit.

At `1.00x`, the player must bypass and release time-stretch ownership after the
preceding slowed unit settles. Source sample frames and bytes remain the
memory/progress authority; slower playback changes effective listening
duration only.

The retained source is evaluation-proven but not yet production-wired. User
documentation and the UI must continue to report fixed `1.00x` behavior until
Milestone 5 completes.

## Alternatives considered

- **Select the media-element candidate.** It passed every frozen gate, but
  used `189.367 MiB` additional process RAM under contention, scored lower in
  every listening aggregate, required object-URL ownership, and would retain a
  CSP expansion.
- **Select neither candidate.** Rejected because repository WSOLA passed every
  frozen gate and has the smaller security, memory, and distribution surface.
- **Keep both candidates as runtime options.** Rejected because v3 requires
  exactly one selection and the product needs one bounded playback authority,
  not a second engine-choice matrix.
