# ADR-0030: Freeze the corrective full evaluation v12

- **Status:** Accepted
- **Date:** 2026-07-30
- **Decision owners:** VoxLeaf maintainers
- **Related:** ADR-0026, ADR-0029, M010.1

## Context

ADR-0029 advances exact Chatterbox v11 as the sole new-engine full-matrix
survivor, defers MOSS without rejection, and retains exact Qwen/Serena Spanish
and Qwen/Aiden English as separate constrained-buffer candidates. The v11
Chatterbox screen is not a complete sustained matrix, and the two Qwen
language profiles still lack result-neutral private quality evidence.

Changing historical v8-v11 thresholds or results would destroy the
before-results authority boundary. Running more audio without a new authority
would create the same problem.

## Decision

Freeze numbered profile v12 before any new result. V12:

- preserves all v8 Qwen, v9 MOSS, and v11 Chatterbox authority and results;
- runs the complete bilingual Chatterbox matrix with five cold loads, 20 warm
  attempts, 30 sustained attempts, and eight cancellation trials;
- collects five new private samples for each Chatterbox language and each
  exact Qwen language/voice profile;
- reuses Qwen v8 machine metrics without changing their interpretation;
- treats standard performance targets as advisory for constrained buffering;
- requires the maintainer to see limitations before any profile decision;
- permits no automatic candidate rejection; and
- requires content-safe derivation and deletion of raw sessions, scorecards,
  maps, and generated audio.

## Consequences

The next result commit must strictly descend from a commit whose complete v12
authority tree matches. A squash merge can replace an unmerged checkpoint, so
execution must use a reachable committed authority tree rather than a
remembered branch SHA.

Chatterbox's experimental Torch override, one bundled voice, cross-language
accent, RAM/VRAM use, lack of native speaking-rate control, and distribution
obligations remain limitations. Qwen's approximately 1.44 RTF and
complete-waveform cancellation limitation remain measured capacity evidence,
not a hidden pass or automatic failure.

No runtime profile, support state, protocol, canonical text preparation, or
system component changes at this authority checkpoint.
