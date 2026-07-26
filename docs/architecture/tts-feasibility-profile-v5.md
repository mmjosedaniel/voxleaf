# Local TTS independent dual-worker profile v5

## Status and authority

This is the accepted pre-result authority for Milestone 6.2's
development-only independent GPU-primary/CPU-support experiment. It was frozen
on 2026-07-26 after recording the failed `v4` decision and before any `v5`
runner, pilot, official waveform, listening result, or selection existed.

The normative machine-readable authority is
[`profile-v5.json`](../../benchmarks/tts/profile-v5.json), SHA-256
`e6fca19592c4e0d074bbb13e35d624be588c94408da512bba9b819b560750fd5`.
It binds:

- the exact candidate artifacts, runtime, Serena voice, instruction, and
  generation settings;
- the separately loaded GPU and CPU worker identities;
- [`corpus-v5.json`](../../benchmarks/tts/corpus-v5.json), which reuses the
  exact frozen synthetic `v4` inputs by hash and expands immutable official
  schedules;
- the closed
  [`dual-worker-raw-v5`](../../benchmarks/tts/schemas/dual-worker-raw-v5.schema.json)
  private schema and
  [`dual-worker-summary-v5`](../../benchmarks/tts/schemas/dual-worker-summary-v5.schema.json)
  content-safe schema;
- CPU-solo admission, same-authority GPU-solo comparison, concurrent
  sustainability, playback, memory, cancellation, quality, privacy, cleanup,
  and decision gates; and
- authority/result ancestry and invalidation rules.

The content-safe [`selection-v4`](../../benchmarks/tts/selection-v4.md)
remains the decision for the completed shared-model experiment. No `v4`
authority, schema, result, or conclusion is changed by `v5`.

This profile adds evaluation authority only. It does not implement a runner,
load either model, generate or hear audio, approve two production workers,
change ADR-0014, select a CPU fallback, or unblock production Milestone 7.

## Exact candidate and worker identities

Both workers use `qwen-tts==0.1.1`,
`Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice` at revision
`0c0e3051f131929182e2c023b9537f8b1c68adfe`, the two frozen safetensors
artifacts totaling 4,515,695,644 bytes, Serena, Spanish, the unchanged neutral
audiobook instruction, SDPA, and the exact sampling settings inherited from
`v3` and `v4`.

The workers are different complete candidate profiles:

| Role | Frozen identity |
| --- | --- |
| GPU primary | One complete independently loaded model on `cuda:0`, bfloat16, four intra-op threads, one inter-op thread, and OS-default affinity |
| CPU support | One separate complete model on CPU, float32, twelve intra-op threads, one inter-op thread, OS-default affinity, and `CUDA_VISIBLE_DEVICES=-1` before importing PyTorch |

The CPU worker must report every model parameter and the speech tokenizer on
CPU, `torch.cuda.is_available()` false, zero visible CUDA devices, zero
disk/meta placement, no implicit fallback, and exactly zero process-attributed
dedicated and shared GPU bytes. A CUDA-enabled PyTorch wheel may exist in the
unchanged isolated environment; using it does not waive those runtime checks.

Float32 is frozen for the CPU worker because it is the conservative
compatibility precision for an unproven CPU path. Twelve of the reference
host's twenty logical processors are available to intra-op CPU inference; the
remaining logical processors are left for the GPU worker, controller, memory
sampling, and operating system. No affinity mask is assumed across the host's
hybrid CPU topology.

## Corpus, duration, and official order

The authority reuses the eight exact repository-authored Spanish units in
`corpus-v4.json`. Only their frozen `narrationText` values reach either
candidate. They keep their individual unit identity, semantic boundary, and
source range. Candidate-specific rewriting, range merging, retry, duplicate
generation, and result-driven input changes are forbidden.

The semantic shapes target approximately 8-16 seconds of measured audio.
Every complete waveform must be longer than zero and no longer than 20
seconds. A unit outside the target but inside that hard limit remains visible
in the result and listening review; it cannot be trimmed, combined, or used to
rewrite the official input.

Official schedules are:

- CPU solo: one pass, eight measured first attempts;
- GPU solo: five passes, forty measured first attempts; and
- concurrent: the same five-pass, forty-occurrence schedule.

Warm-up units are excluded. CPU and GPU solo each have one excluded warm-up.
Concurrent execution has one excluded warm-up per worker. CPU and GPU solo
each record three process-cold loads; concurrent execution records the load of
each new worker.

The official arm order is CPU solo, GPU solo, then concurrent. A failed CPU
admission or invalid GPU baseline stops later work.

## Independent dispatch and ordered release

Each worker may own at most one active occurrence. At concurrent start, the
GPU worker claims the earliest unclaimed occurrence and the CPU worker claims
the next. After completion, a free worker claims the earliest remaining
occurrence; simultaneous availability is resolved in favor of the GPU worker.

Completion may be out of order, but publication and playback may not be. A
completed occurrence waits in the bounded reorder queue until every earlier
occurrence is available. Slow CPU head-of-line delay is measured and reported.
The controller may not submit the same occurrence to the GPU to hide CPU
latency, retry a failed occurrence, skip it, or widen its source range.

The Qwen API still returns complete waveforms. This authority does not call
complete-unit delivery native streaming or cooperative model cancellation.
Identity is invalidated first, then affected worker processes are terminated
within the frozen boundary; stale output is never publishable or playable.

## Admission and performance decisions

CPU solo is only an arithmetic and safety screen for starting concurrent
work. All its gates are conjunctive:

- eight valid first-attempt waveforms and at least 60 measured media seconds;
- total sustained RTF at or below 3.2;
- zero failure or timeout;
- both cancellation trials pass;
- exact CPU placement and zero CPU-worker GPU allocation;
- RAM/commit, offline, artifact, ordering, privacy, and cleanup audits pass.

A CPU-solo pass is not a sustainable-scheduling, quality, compatibility, or
production pass.

The GPU-solo baseline uses the same `v5` authority, forty occurrences, and at
least 300 measured media seconds. It must complete without first-attempt,
memory, ordering, cancellation, privacy, or cleanup failure before concurrent
execution.

Concurrent scheduling passes only when every applicable gate passes,
including:

- the prior CPU and GPU admissions are valid;
- forty unique ordered first attempts produce at least 300 media seconds;
- aggregate RTF is strictly below 1.0 and below the same-authority GPU-solo
  RTF;
- aggregate throughput improves rather than merely adding a slower worker;
- concurrent GPU-worker RTF slowdown is no more than 25% relative to the
  GPU-solo baseline;
- buffering is no more than five seconds per media minute;
- every occurrence is present exactly once, no published occurrence is
  reordered, and no stale occurrence is published or played;
- all six concurrent cancellation trials pass; and
- every resource, offline, artifact, boundedness, privacy, and cleanup audit
  passes.

The preferred performance margin remains aggregate RTF at or below 0.8.
Reaching only the less-than-1.0 scheduling gate cannot rewrite the failed `v3`
standard profile. Standard production viability remains failed throughout
this evaluation because `v5` does not re-prove all frozen `v3` standard gates
or cooperative cancellation.

## RAM, commit, and GPU safety

Before an arm, the host must have at least 12 GiB free physical RAM and 8 GiB
of system commit headroom. During execution:

- combined tracked process-tree RAM may not exceed 20 GiB;
- system available physical RAM and commit headroom must each remain at or
  above 4 GiB;
- the GPU worker retains the `v4` 7,637,827,584-byte engineering VRAM ceiling
  and 536,870,912-byte free-dedicated-VRAM reserve;
- GPU-worker shared memory is reported and capped at 134,217,728 bytes; and
- the CPU worker is allowed exactly zero dedicated or shared GPU memory.

The nonzero GPU-worker shared-memory ceiling is a separately frozen `v5`
engineering rule informed by the two completed `v4` safety stops. It does not
reinterpret those stops, allow CPU paging through WDDM shared memory, or
weaken the CPU-zero-GPU rule.

## Playback simulation and simultaneous bounds

Only the concurrent first-attempt completion timeline feeds the playback
simulation. Playback starts immediately when at least approximately 15
seconds of contiguous valid audio is ready, or when a complete shorter
remaining range is ready. It does not wait for a timer or a fixed number of
sections.

After startup, backpressure enforces all limits simultaneously:

- at most 300 playable seconds;
- at most 40 complete queued units;
- at most 28,800,000 bytes of 24 kHz mono float32 PCM payload;
- at most two active units, one per worker; and
- before dispatch, 20 seconds and 1,920,000 PCM bytes are reserved for each
  prospective active unit against the duration and byte ceilings.

The first bound that cannot reserve new work stops dispatch. The simulation
reports time and ability to reach 15, 30, 60, 120, and 300 playable seconds,
buffer depth, underruns, buffering, head-of-line stalls, lead trend, and
discarded valid duration after invalidation.

Five minutes is maximum capacity, not a startup lead, target occupancy,
production setting, or continuity guarantee. A 300-second queue cannot
compensate for aggregate RTF at or above 1.0.

## Quality, privacy, and result authority

One fluent Spanish maintainer may perform the focused MVP review only after
machine, scheduling, safety, ordering, privacy, and cleanup gates admit it.
The review covers intelligibility, number/symbol normalization, joins,
prosody, accent, and meaning-changing defects under the frozen thresholds. It
is not a standard production panel.

Private input enters only through the later reviewed command's standard-input
boundary. Model paths, text, canaries, audio, command lines, environment
values, exception messages, scorecards, randomization keys, and evaluator
identity are forbidden in committed or reviewable results. Raw journals,
ephemeral audio, and private review material stay below the ignored raw tree
and are deleted after a schema-valid safe summary is derived.

An official result must name an authority commit that contains the exact
frozen profile, corpus, and schemas and is a strict ancestor of its clean
execution commit. A pilot can never be promoted. The three future result paths
are frozen in `profile-v5.json`; none exists at this authority checkpoint.

The model-free validator in
`services/tts/benchmarks/v5_authority.py` verifies byte identity, schema
closure, worker placement, corpus schedules, dispatch/result identities,
first-attempt accounting, CPU-zero-GPU evidence, retention ceilings,
conjunctive conclusions, ancestry, and private-content exclusions without
importing Qwen or requiring a GPU.

