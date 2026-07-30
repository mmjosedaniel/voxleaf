# ADR-0026: Correct bilingual candidate decision authority

- **Status:** Accepted
- **Date:** 2026-07-29
- **Decision owners:** VoxLeaf maintainers
- **Related:** ADR-0015, ADR-0023, ADR-0025, M010.1

## Context

The v8 bilingual screens reused the v7 `RTF <= 1.1` preferred standard-profile
target as a conjunctive rejection gate. That interpretation conflicts with
ADR-0015, which already permits the exact one-GPU Qwen development path to use
bounded adaptive prebuffering when generation is slower than real time.
Qwen/Serena and Qwen/Aiden both measured about 1.44 warm p95 RTF. That is
important capacity evidence, but it is not by itself a blocker for the
constrained buffered MVP path.

V8 also wrote rejected summaries for Chatterbox and MOSS before inference.
Those stops established configuration problems, not model performance or
quality:

- the pinned Chatterbox package selected the V2 filename while the authority
  required the current V3 checkpoint; and
- the MOSS artifact list did not match the files published at the exact frozen
  model and codec revisions.

Neither event is evidence that the model cannot generate acceptable VoxLeaf
audio.

## Decision

Preserve v7 and v8 files and results as immutable evaluation history. Supersede
their prospective decision use with the result-blind v9 correction:

- `RTF <= 1.1` remains a preferred standard-support target and a reported
  advisory;
- RTF above one does not automatically reject a profile from the constrained
  bounded-buffer MVP;
- Qwen's existing approximately 1.44 RTF measurements remain valid evidence
  and the exact Qwen profiles remain eligible for quality and product review;
- Chatterbox and MOSS receive corrected exact identities and real bounded
  bilingual screens;
- a configuration mismatch or measurement issue is recorded as an observation,
  not a candidate rejection; and
- the harness may not reject a model. The maintainer must review content-safe
  measurements and private quality evidence before VoxLeaf records a rejection.

Privacy, local-only inference, exact artifacts, outbound isolation, bounded
retention, cancellation measurement, one-model-at-a-time execution, and no
personal reference audio remain mandatory. A hard safety stop prevents that
execution from continuing but still does not decide the candidate.

## Consequences

The historical v8 summaries continue to explain what happened under v8, but
their `rejected` status does not decide v9. New v9 summaries remain
`measured-awaiting-decision` or `execution-blocked-awaiting-decision` until the
maintainer explicitly chooses an outcome.

The corrected Chatterbox environment is isolated in a new path so the
byte-frozen v7/v8 dependency lock remains unchanged. The MOSS v9 identity
records the actual model and codec files at the already pinned upstream
revisions.

This decision does not promote any candidate to general support or distribution.
M011 still owns packaging, licensing notices, and release readiness.

## Alternatives considered

- **Keep every v8 rejection.** Rejected because it treats configuration
  mismatches as model evidence and contradicts the approved buffered Qwen
  product mode.
- **Lower all thresholds after seeing results.** Rejected because it would
  rewrite the historical authority and would hide the distinction between a
  preferred real-time profile and a constrained buffered profile.
- **Admit every model automatically.** Rejected because quality, stability,
  cancellation, privacy, memory, and licensing evidence still require review.
