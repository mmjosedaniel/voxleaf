# Qwen development VRAM admission authority v1

## Status

Accepted corrective M010 authority before matcher implementation.

This authority narrowly supersedes the available-dedicated-VRAM formula in
[`hardware-profile-recovery-authority-v1.md`](hardware-profile-recovery-authority-v1.md)
only for an entry whose role is `development-demo` and whose support state is
`development-only`. Every supported, fallback, unsupported, and unknown
profile retains the original result-blind formulas.

## Problem

The exact Qwen/Serena development profile measured an authoritative peak of
`6,286,802,944` bytes. The immutable registry conservatively rounds that value
up to `5,996` MiB. The generic M010 VRAM formula adds the greater of 20% or
`1,024` MiB and therefore requires both:

- at least `7,196` MiB total dedicated VRAM; and
- at least `7,196` MiB currently available dedicated VRAM.

The total-device requirement is appropriate: it prevents an undersized GPU
from becoming eligible. Requiring the same production-style margin to be
currently free is unnecessarily strict for an explicitly gated,
development-only path that already ran successfully on the exact 8-GB-class
host. The UI consequently describes the configured profile as unavailable
even when the device has enough total capacity and enough free memory for the
measured workload plus a bounded engineering reserve.

This correction does not turn the failed standard Qwen evaluation into a
supported product profile. Startup latency, sustained throughput,
cancellation, and complete quality gates remain failed.

## Frozen admission rule

For every profile with dedicated-VRAM use:

- total dedicated VRAM continues to require measured peak plus the greater of
  20% or `1,024` MiB;
- supported and fallback profiles continue to require the same amount of
  currently available dedicated VRAM; and
- an explicitly native-gated `development-demo` plus `development-only`
  profile instead requires measured peak plus exactly `512` MiB of currently
  available dedicated VRAM.

For exact Qwen/Serena this produces:

```text
total dedicated requirement:
5,996 MiB + ceil(20%) = 7,196 MiB

available dedicated requirement:
5,996 MiB + 512 MiB = 6,508 MiB
```

The `512` MiB reserve is not chosen from the current desktop observation.
It reuses the predeclared engineering reserve from the frozen v4 Qwen
authority, where `536,870,912` bytes were retained after the accepted
preflight. Integer arithmetic remains bounded by the M010 maximum quantity.

## Matching and runtime boundaries

The existing match order remains unchanged. In particular:

- the native development gate must be affirmative before the exception can
  apply;
- exact evidence identity and closed gate semantics must remain valid;
- Windows, x86-64, CUDA, bfloat16, discrete-GPU, RAM, storage, total VRAM, and
  available VRAM requirements must all pass;
- an unknown or incomplete host report still fails closed;
- compatibility and exact runtime configuration are checked again before
  child start;
- only one process tree may exist;
- resource exhaustion follows the existing identity-first containment and
  explicit-recovery policy; and
- the profile is never automatically recommended or used as fallback.

No host identity, raw adapter information, model path, environment value,
book text, narration text, audio, or free-form error crosses the native
privacy boundary.

## User-visible meaning

When the exact development configuration is enabled and the host satisfies the
rule above, the compatibility control may offer Qwen/Serena as an optional
development profile. Piper remains the supported and recommended CPU
fallback.

When the rule does not pass, VoxLeaf reports a closed compatibility reason.
It must not say or imply that Qwen is technically incapable of running on all
8-GB GPUs. The result means only that the current host observation does not
satisfy the frozen VoxLeaf development admission boundary.

## Non-goals

This authority does not:

- promote Qwen/Serena to `supported`;
- change its failed standard evaluation;
- claim general 8-GB-GPU compatibility;
- reduce the VRAM rule for Piper or any future supported profile;
- change model identity, generation settings, text preparation, protocol,
  buffering, playback, cancellation, persistence, or recovery;
- add shared-memory paging, CPU offload, a second worker, or automatic retry;
  or
- authorize installer distribution of the development runtime.

## Validation

Deterministic tests must prove:

- exact Qwen total `7,196` MiB and available `6,508` MiB pass when the native
  development gate is enabled;
- `7,195` MiB total fails as `dedicated-vram`;
- `6,507` MiB available fails as `available-dedicated-vram`;
- disabling the native gate still fails as `support-state-not-admitted`;
- a supported profile still requires the original generic available-VRAM
  margin; and
- the compatibility UI offers Qwen only at or above the new bounded
  development threshold.

Exact-host confirmation must remain content-free and outbound-blocked. A
successful compatibility result proves admission to the existing constrained
demo only, not model quality, real-time performance, or production support.
