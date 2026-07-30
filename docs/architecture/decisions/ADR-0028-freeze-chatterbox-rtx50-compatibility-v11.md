# ADR-0028: Freeze an experimental RTX 50 Chatterbox compatibility screen

- **Status:** Accepted
- **Date:** 2026-07-29
- **Decision owners:** VoxLeaf maintainers
- **Related:** ADR-0026, ADR-0027, M010.1

## Context

The corrected v10 Chatterbox environment used the exact upstream Python 3.12
requirement, Torch and Torchaudio 2.6.0 with CUDA 12.4. It reached local model
loading on the exact host but stopped before inference because the frozen
Torch build has kernels only through `sm_90`. The maintainer's NVIDIA GeForce
RTX 5060 Laptop GPU reports CUDA capability `12.0` (`sm_120`), so the first
CUDA operation failed with `no kernel image is available for execution on the
device`.

This is a runtime compatibility result, not Chatterbox performance, quality,
or candidate rejection. Changing the v10 dependency lock after that result
would invalidate its authority. Rejecting Chatterbox without a compatible
inference attempt would also contradict ADR-0026.

## Decision

Preserve v9 MOSS evidence and the v10 Chatterbox configuration stop unchanged.
Freeze a distinct v11 compatibility experiment before another inference
attempt:

- retain the exact Chatterbox source revision, model revision, V3 checkpoint,
  six model artifacts, built-in conditioning, generation settings, bilingual
  corpus, host bounds, privacy controls, and no-reference-audio scope;
- use an isolated Python 3.12 environment with exact
  `torch==2.9.1+cu128` and `torchaudio==2.9.1+cu128`;
- explicitly override the upstream Python 3.12 Torch 2.6 requirement only in
  this bounded experiment because the v10 runtime lacks `sm_120` kernels;
- identify the experiment as
  `chatterbox-multilingual-v3-cuda-bf16-default-v4` and keep its support
  intent `experimental-compatibility-only`;
- require CUDA capability 12.0 and the existing exact-host RAM, VRAM, offline,
  outbound-isolation, and one-loaded-model limits; and
- keep every result pending an explicit maintainer decision. The harness
  cannot reject the candidate.

The preferred `RTF <= 1.1` standard-support target remains advisory for the
bounded-buffer MVP path. A load, compatibility, measurement, or advisory
performance issue is recorded as an observation and is not a candidate
decision.

## Consequences

VoxLeaf can test whether a modern CUDA runtime makes real Chatterbox inference
possible on the exact RTX 5060 host without rewriting any earlier evidence.
The result will distinguish model behavior from the v10 CUDA-kernel mismatch.

The dependency override is not an admission, production dependency, or
packaging decision. Even if the screen succeeds, the maintainer must review
machine and private listening evidence before accepting, deferring, or
rejecting the profile. M011 still owns distributable runtime/model packaging
and license fulfillment.

The v11 interpreter must be blocked from outbound access during preflight,
machine measurement, and private quality generation. Model artifacts,
generated audio, and raw evidence remain ignored and disposable.

## Alternatives considered

- **Reject Chatterbox after v10.** Rejected because v10 executed no model
  inference and therefore supplied no performance or quality evidence.
- **Edit v10 to use a newer Torch build.** Rejected because the v10
  configuration stop already exists under its frozen authority.
- **Use an unpinned current CUDA environment.** Rejected because it would not
  produce reproducible evidence.
- **Treat the override as supported if it loads.** Rejected because loading is
  only the first gate; performance, cancellation, quality, privacy, cleanup,
  licensing, and explicit maintainer review remain required.
