# Local TTS independent-worker selection v5

## Status

Accepted on 2026-07-26 as the content-safe Milestone 6.2 `v5` decision
record.

No CPU-only or concurrent dual-worker topology is selected as a passing
standard, sustainable-scheduling, CPU-fallback, or constrained-demo profile.
The previously accepted exact one-GPU Qwen/Serena constrained-demo exception
is retained and refined by ADR-0015; it is not promoted to a standard profile.

This record applies the frozen
[`tts-feasibility-profile-v5`](../../docs/architecture/tts-feasibility-profile-v5.md)
and machine-readable [`profile-v5.json`](profile-v5.json) to:

- [`dual-worker-result-v5-cpu-solo.json`](dual-worker-result-v5-cpu-solo.json),
  SHA-256
  `43ed927e2a765cf39214bc8937398c1c454993cc23bd6485596aa591fe5224a2`;
- [`dual-worker-result-v5-gpu-solo.json`](dual-worker-result-v5-gpu-solo.json),
  SHA-256
  `2f12e3542038ff9d7b566dc662495a08187163ecf4ccb71ad6d9601b43d64fdb`;
  and
- the content-free Milestone 8 record of the hash-bound concurrent arm's
  `resource-limit` stop before promotable raw/result creation.

The private raw journals and generated media were removed. No concurrent
summary exists.

## Exact evaluated identities

The CPU-solo result uses one complete
`Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` instance loaded CPU-only in float32
with CUDA hidden before PyTorch import. The GPU-solo result uses one complete
instance on `cuda:0` in bfloat16. Both use the frozen Serena voice, Spanish
language, instruction, model revision, artifacts, runtime, generation
settings, corpus, first-attempt policy, and exact reference host in
`profile-v5.json`.

The attempted concurrent arm uses both independently loaded identities. These
are exact-host development observations, not general hardware support.

## Machine evidence

| Observation               |             CPU solo |            GPU solo |         Official concurrent |
| ------------------------- | -------------------: | ------------------: | --------------------------: |
| Completed first attempts  |                  8/8 |               40/40 |                 unavailable |
| Measured media            |              97.04 s |            446.24 s |                 unavailable |
| Aggregate RTF             |    2.999443394476504 |   1.467080448861599 |                 unavailable |
| Peak process RAM          | 10,681,810,944 bytes | recorded in summary |                 unavailable |
| Peak dedicated GPU memory |              0 bytes | 5,296,939,008 bytes |                 unavailable |
| Peak shared GPU memory    |              0 bytes |    81,788,928 bytes |                 unavailable |
| Cancellation and cleanup  |                 pass |                pass |   cleanup after safety stop |
| Result status             |         schema-valid |        schema-valid | `resource-limit`; no result |

CPU solo passes only the frozen admission screen that permitted attempting the
concurrent arm. It is not fast enough to narrate in real time and does not
establish a product fallback.

GPU solo is the only retained model topology for later constrained-demo work,
but RTF above `1.0` means it loses playable lead during uninterrupted
playback.

## Supplementary diagnostics

Two explicitly non-promotable diagnostics changed only Qwen's generated-token
ceiling from 2048 to 256:

1. With a higher application-memory baseline, concurrent execution stopped on
   the exact `commit-headroom` safety subcode.
2. After other applications were closed, all 40 units completed with aggregate
   RTF `1.4291263397435898`. GPU-worker RTF rose to
   `2.3290592090374167`, CPU-worker RTF was `3.4522421854976506`, minimum
   commit headroom was 7,641,972,736 bytes, and maximum unit duration was
   14.16 seconds.

The second diagnostic proves that two models can fit under a sufficiently low
host baseline. It does not rescue the topology: combined output remains slower
than playback, GPU contention exceeds the frozen slowdown ceiling, memory
feasibility depends on unrelated applications, and the receipt is
non-promotable.

## Separate conclusions

### Standard viability

**Fail.** No `v5` identity passes the unchanged standard startup,
throughput, cancellation, quality, packaging, and general-hardware boundary.
ADR-0013 remains authoritative.

### Scheduling sustainability

**Fail.** GPU solo has aggregate RTF `1.467080448861599`. The official
concurrent arm has no promotable result, and the successful low-load diagnostic
still has aggregate RTF `1.4291263397435898`, above the required value below
`1.0`.

### CPU fallback

**Not selected.** CPU solo passes admission but requires approximately three
seconds of generation for each second of audio. It is evidence for neither
responsive fallback nor uninterrupted narration.

### Constrained-demo usefulness

**Retain one GPU worker only.** Previous audible-quality acceptance and bounded
complete-unit cancellation evidence remain useful for a development demo.
ADR-0015 allows later work to evaluate bounded adaptive in-memory preparation;
it does not claim real-time synthesis.

## Decision and follow-up

- Select no dual-worker, CPU-fallback, or standard `v5` profile.
- Do not run the unadmitted official `v5` playback/listening milestone.
- Preserve all frozen authorities and official results unchanged.
- Retain one exact GPU Qwen/Serena worker only under the constrained-demo
  exception.
- Keep approximately 15 playable seconds as the quick-start threshold.
- Evaluate an explicit prepared-playback mode, adaptive boundary waits,
  pause-time preparation, truthful buffering UI, and a simultaneous
  30-minute in-memory ceiling under the separate Milestone 8 ExecPlan.
- Do not add a production dependency, installer payload, general hardware
  claim, continuous-playback promise, or persisted audio cache through this
  decision.
