# ADR-0027: Freeze a CUDA-wheel correction before Chatterbox inference

- **Status:** Accepted
- **Date:** 2026-07-29
- **Decision owners:** VoxLeaf maintainers
- **Related:** ADR-0026, M010.1

## Context

Corrective v9 produced valid MOSS machine evidence, which makes the v9
authority immutable. The v9 Chatterbox execution produced no model evidence:
its isolated environment resolved the Windows PyPI build of Torch 2.6.0,
reported as `2.6.0+cpu`. The exact adapter stopped at its CUDA-provider check
before loading model weights or generating audio.

The official Chatterbox source revision requires Torch and Torchaudio 2.6.0.
Those versions have distinct CPU and CUDA distributions. Merely installing a
different wheel into the v9 environment would make the result disagree with
the frozen dependency lock and would invalidate the already collected MOSS v9
evidence if v9 files were edited.

## Decision

Preserve v9 and its MOSS evidence unchanged. Freeze a candidate-specific v10
authority for Chatterbox before another inference attempt:

- keep the exact source revision, model revision, V3 checkpoint, six artifact
  hashes, generation settings, bilingual corpus, quality rules, and host
  margins from the corrected v9 identity;
- use a new isolated dependency path with explicit PyTorch CUDA 12.4 sources;
- require exact `torch==2.6.0+cu124` and
  `torchaudio==2.6.0+cu124` Windows-compatible lock entries;
- give this corrected configuration the distinct candidate identity
  `chatterbox-multilingual-v3-cuda-bf16-default-v3`;
- continue to treat `RTF <= 1.1` as a preferred standard-support target, not
  an automatic rejection from bounded-buffer MVP consideration; and
- keep every execution and quality outcome pending an explicit maintainer
  decision. The benchmark cannot record a rejection.

Runtime download, remote inference, reference audio, unbounded retention, and
missing outbound isolation remain hard execution stops. A hard stop is not a
candidate decision.

## Consequences

V9 MOSS measurements remain reproducible against their original hashes. The
v9 Chatterbox CPU-wheel stop remains an honest configuration observation and
is not reinterpreted as model performance.

The v10 Chatterbox environment may be acquired before evaluation, but its exact
interpreter must be blocked from outbound access for preflight, machine
measurement, and private quality generation. Model artifacts remain ignored
and generated audio remains private, bounded, and disposable.

This ADR does not admit Chatterbox to the product. Integration, distribution,
license fulfillment, and support state still require the maintainer's later
evidence-based decision.

## Alternatives considered

- **Replace the v9 lock in place.** Rejected because v9 already has valid MOSS
  evidence and its authority must remain immutable.
- **Install CUDA Torch without updating authority.** Rejected because the
  measured runtime would not match the frozen dependency identity.
- **Reject Chatterbox after the CPU-wheel stop.** Rejected because no model was
  loaded or tested.
