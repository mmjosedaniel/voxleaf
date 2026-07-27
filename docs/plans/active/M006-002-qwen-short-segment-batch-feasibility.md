# Prove Qwen short-segment and dual-worker feasibility

## Relationship to Milestones 6, 6.1, and 7

Roadmap Milestone 6 is complete. Its frozen `v2` evaluation selected no viable
profile, and ADR-0013 remains the standard production authority.

Milestone 6.1 completed the exact Qwen3-TTS 12Hz 1.7B CustomVoice/Serena
batch-one `v3` evaluation. That evaluation passed its resource, offline,
artifact, license, packaging, and cleanup gates but failed startup, sustained
throughput, zero-failure, and mid-generation cancellation gates. ADR-0014
permits the exact profile only for a bounded development demo with explicit
preparation or buffering. This plan must not modify, rerun, or reinterpret that
failed authority.

This is a separate Milestone 6.2 ExecPlan. Its completed `v4` work froze and
tested a materially different scheduling hypothesis before results: shorter
ordered audio units and batch size two using one resident model. Both `v4`
hardware arms stopped safely before usable media.

The plan now continues with a separate result-blind `v5` hypothesis requested
after those results: one full-GPU Qwen worker as the primary producer and one
independent CPU-only Qwen worker as a support producer. The `v5` work must use
new authority, schemas, results, and conclusions; it must not rewrite or
reinterpret `v4`. Both stages are evaluation work, not the Milestone 7
production service or Milestone 8 player.

## Goal

Determine whether the exact already-evaluated Qwen/Serena candidate can produce
ordered, bounded Spanish narration sustainably on the exact reference host.

The completed `v4` stage tested one resident model generating two short
semantic units in one shared-model batch, followed by the admitted targeted
speech-tokenizer CPU placement. The new `v5` stage must test a different
topology: one exact full-GPU worker and one separately loaded, fully CPU-only
worker producing independently identified short units for one ordered bounded
consumer.

## User-visible outcome

This plan adds no production user-visible behavior.

If the `v5` evidence passes its frozen gates, VoxLeaf gains a measured
scheduling input for a later bounded demo and for Milestones 7 and 8: an
independent GPU-primary/CPU-support topology can produce ordered complete
waveforms quickly enough to keep a bounded playback simulation supplied. If it
fails, the constrained batch-one demo decision remains available under
ADR-0014, while continuous-playback and production claims remain blocked.

Neither outcome establishes general hardware support, native waveform
streaming, cooperative mid-call cancellation, production packaging, or a
selected CPU fallback.

## Current state

- The exact candidate is
  `qwen3-tts-1-7b-customvoice-cuda-bf16-v1`: `qwen-tts==0.1.1`,
  Qwen3-TTS 12Hz 1.7B CustomVoice at the frozen revision, Serena, Spanish,
  the frozen neutral instruction, CUDA BF16, SDPA, and the existing generation
  settings.
- `1.7B` describes approximately 1.7 billion model parameters; it is not a
  1.7-GB memory or artifact-size promise.
- The frozen model artifacts total 4,515,695,644 bytes:
  3,833,402,552 bytes for the main model safetensors and 682,293,092 bytes for
  the speech-tokenizer safetensors.
- The official batch-one `v3` run reached 6,286,802,944 bytes of authoritative
  peak VRAM. That value is the maximum of the baseline-adjusted Windows WDDM
  dedicated-memory observation and PyTorch peak-reserved memory, not only live
  parameter tensors.
- The accepted preflight reported 8,174,698,496 free VRAM, leaving
  1,887,895,552 bytes between that observation and the measured batch-one peak.
  This arithmetic is planning evidence only; it does not prove that batch two
  fits.
- Warm first-audio p95 was 67.6685348 seconds and total sustained RTF was
  1.4521558253532183 for batch size one. One approximately 46.56-second output
  took about 67.67 seconds to generate.
- The exact high-level API returns complete waveforms. The official Qwen
  interface accepts lists for `generate_custom_voice`, so a shared-model
  batch-two experiment is available, but no parallel speedup has been measured.
- The external maintainer prototype similarly passes lists of chunks to one
  voice-cloning call. Its private inputs, generated files, retry behavior, and
  persistence design are not VoxLeaf evidence and must not be copied.
- The isolated candidate lock already contains `accelerate==1.12.0`
  transitively. This is not a production dependency approval. The exact Qwen
  wrapper forwards loading keyword arguments to the Transformers model loader,
  which exposes an experimental device-placement surface.
- Hugging Face documents CPU/disk offload as a way to fit models that exceed
  accelerator memory. Offloaded layers are moved to the accelerator when used
  and removed afterward, with no general prefetching guarantee. It is therefore
  expected to trade speed for capacity rather than make generation faster.
- `narration-v1` is implemented and authoritative. Its stable text, semantic
  boundaries, locator ranges, and hard limits must not change for this model
  experiment.
- The completed full-GPU and targeted-CPU `v4` arms both stopped at the frozen
  `shared-gpu-memory` rule after observing 79,691,776 bytes of shared GPU
  memory. The targeted placement moved only the speech tokenizer after an
  exact CUDA load; it was not an independent CPU-only Qwen worker and therefore
  did not test the new topology.
- The reference host has 33,752,997,888 bytes of physical RAM and an Intel
  Core Ultra 7 255HX with 20 logical processors. Capacity arithmetic alone
  does not prove that a second complete model instance is safe or fast enough.
- Historical `v3` total sustained RTF was 1.4521558253532183, or approximately
  0.6886 seconds of audio per wall-clock second. As a planning estimate only,
  a CPU worker would need solo RTF at or below approximately 3.21 merely to
  close the remaining real-time gap, and approximately 1.78 to reach a
  combined effective RTF of 0.8. The new authority must judge directly
  measured concurrent throughput rather than promote this estimate.

Primary upstream references:

- [Qwen3-TTS official repository and CustomVoice batch interface](https://github.com/QwenLM/Qwen3-TTS)
- [Hugging Face Accelerate big-model inference and offload behavior](https://huggingface.co/docs/accelerate/main/concept_guides/big_model_inference)
- [Hugging Face Transformers model loading](https://huggingface.co/docs/transformers/models)

## Scope and non-goals

### Scope

- Freeze a new `v4` authority before official hardware results.
- Reuse the exact frozen Qwen/Serena candidate, artifacts, instruction,
  generation settings, reference host, offline controls, and privacy boundary.
- Measure batch sizes one and two over predeclared short synthetic semantic
  units, paired in source order.
- Preserve per-unit identity, order, duration, timing, failure, and
  cancellation observations even when one call returns two waveforms.
- Model a bounded producer/consumer queue and the approximately 15-second
  playable-audio start condition without implementing the desktop player.
- Measure aggregate batch RTF, startup lead time, buffer drift, underruns, RAM,
  VRAM, failures, ordering, cleanup, and cancellation.
- Perform one bounded Spanish-maintainer review of intelligibility, number and
  symbol normalization, join boundaries, prosody, and audible defects if the
  machine gates admit quality review.
- Conditionally test targeted speech-tokenizer/audio-decoder CPU placement only
  after a frozen full-GPU memory stop condition is met.
- Freeze and execute a separate `v5` CPU-solo admission and concurrent
  GPU-primary/CPU-support matrix after recording the failed `v4` outcome.
- Use independently loaded workers: exactly one complete model on CUDA and
  exactly one complete model on CPU, with no CUDA, WDDM shared-memory, disk, or
  implicit fallback use by the CPU worker.
- Target complete semantic units expected to yield approximately 8-16 seconds
  of audio, while freezing a separate hard duration limit before results.
- Replay ordered completion through a 15-second startup gate and an
  experimental 300-second maximum in-memory playable-audio envelope.
- Bound the experimental envelope simultaneously by playable duration,
  complete-unit count, float32 PCM payload bytes, and active work.

### Non-goals

- Run two GPU model processes, duplicate model weights on the GPU, or permit
  the CPU-support worker to allocate dedicated or shared GPU memory.
- Treat batch size two as two independent streams or as native streaming.
- Change `narration-v1`, merge source ranges, or introduce model-specific text
  semantics into `@voxleaf/epub`.
- Select fixed character counts as a substitute for measured audio duration.
- Add the candidate, Accelerate, or any model runtime to the production
  dependency graph.
- Implement the Milestone 7 service, process protocol, desktop transport,
  playback queue, AudioWorklet, highlighting, or UI.
- Add quantization, FlashAttention, vLLM, a modified Qwen runtime, another
  engine, another voice, voice cloning, retries that hide failures, or
  persistent audio.
- Use Windows shared-GPU-memory paging as acceptable offload evidence.
- Retroactively change `profile-v3`, its three-person quality rule, failed
  results, or ADR-0013.
- Claim that CPU placement improves performance before measurement.
- Treat a five-minute buffer ceiling as proof that generation stays ahead.
- Change ADR-0014's one-model/one-queued-unit demo exception before new
  evidence is accepted through a separate durable decision.

## Relevant files and documentation

- `AGENTS.md`
- `.agents/PLANS.md`
- `benchmarks/tts/candidates-v2.json`
- `benchmarks/tts/profile-v3.json`
- `benchmarks/tts/profile-v4.json`
- `benchmarks/tts/corpus-v4.json`
- `benchmarks/tts/schemas/short-segment-batch-raw-v4.schema.json`
- `benchmarks/tts/schemas/short-segment-batch-summary-v4.schema.json`
- `benchmarks/tts/profile-v5.json`
- `benchmarks/tts/corpus-v5.json`
- `benchmarks/tts/schemas/dual-worker-raw-v5.schema.json`
- `benchmarks/tts/schemas/dual-worker-summary-v5.schema.json`
- `benchmarks/tts/selection-v4.md`
- `docs/architecture/tts-feasibility-profile-v5.md`
- `docs/product/mvp.md`
- `docs/architecture/overview.md`
- `docs/architecture/system-diagram.md`
- `docs/architecture/performance-budget.md`
- `docs/architecture/tts-feasibility-profile-v3.md`
- `docs/architecture/decisions/ADR-0004-start-after-audio-lead.md`
- `docs/architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md`
- `docs/architecture/decisions/ADR-0014-constrained-qwen-development-demo.md`
- `docs/development/dependencies.md`
- `docs/development/testing.md`
- `docs/plans/roadmap.md`
- `docs/plans/completed/M006-001-local-tts-profile-blocker-resolution.md`
- `docs/plans/completed/M005-narration-text-preparation.md`
- `services/tts/benchmarks/`
- `services/tts/tests/`

Milestone 1 named and froze the new `v4` authority, corpus, schemas, report
shapes, and future command responsibility before implementation. At that
freeze no batch command existed; Milestone 2 subsequently added and reviewed
the disposable-pilot command before any hardware execution.

## Architecture and constraints

The experiment remains inside the development-only candidate-neutral benchmark.
It may schedule two consecutive already-prepared units together, but each unit
keeps its own generation, segment, stable locator range, text identity, and
audio result. Batch pairing cannot merge, rewrite, reorder, or widen source
ranges.

One resident model receives a list containing two texts and returns two
complete waveforms. The controller validates the complete identity of every
result, releases ordered results separately, and retains only the frozen
maximum active batch plus bounded playback lead. If either identity becomes
stale, the entire in-flight batch is invalidated. Worker termination remains
the credible cancellation boundary because the high-level API has no proven
cooperative mid-call cancellation.

The playback simulation must consume seconds of valid PCM in order. It may
start only when approximately 15 seconds of playable audio is ready, or when a
complete shorter remaining range is ready. It must record elapsed startup,
buffer depth, involuntary buffering events, buffering duration, and stale
results. It may not persist or concatenate WAV files.

Short-unit targets are expressed in measured output duration, initially aiming
for approximately 8-12 seconds and permitting approximately 8-20 seconds.
Existing semantic boundaries and narration hard limits remain authoritative.
The frozen corpus must document how source units are selected and paired before
results; observed audio duration cannot be used to rewrite official input
afterward.

The full-GPU batch-two arm is always evaluated first. The conditional CPU arm
must use a distinct profile identity and result. Before that arm can run, the
authority must name the exact module placement, load checks, device-map
evidence, safety ceiling, and stop reason. It must measure CPU RAM, dedicated
VRAM, framework peak-reserved VRAM, transfer-sensitive wall time, failures, and
RTF. A device mismatch, implicit disk offload, shared-memory paging, or
unbounded host-memory increase fails the arm.

Generic sequential layer offload is excluded from the first contingency
because autoregressive generation would repeatedly transfer active layers and
is expected to reduce throughput. The first permitted contingency is limited
to investigating whether the separately loaded speech-tokenizer/audio-decoder
component can remain on CPU safely. Source inspection alone is not proof that
this placement works.

The `v5` experiment is a new topology, not another `v4` placement. A controller
owns one GPU-primary worker and one independently loaded CPU-support worker.
Each worker may have at most one active unit. The GPU worker receives the
earliest unclaimed unit; the CPU worker receives the next eligible unclaimed
unit. Every unit retains source order, session, generation, segment, and
worker identity. Completed results wait in a bounded reorder queue until all
earlier units are available. A slow CPU head-of-line result is observable
evidence, not a condition that can be hidden by an automatic retry or duplicate
GPU request.

CPU-only admission must run before concurrent generation. The new authority
must freeze the CPU device, precision, thread/affinity policy, load checks,
RAM/commit reserve, timeout, and exact zero-GPU verification before any output
is generated. CPU admission requires a complete valid waveform, no failure,
no GPU/shared-GPU allocation, safe RAM, and enough solo throughput to make a
combined real-time result arithmetically credible. Passing CPU solo does not
pass the concurrent profile: the official matrix must remeasure both workers
together and report whether CPU contention slows the GPU, whether aggregate
RTF improves, and whether ordered playback remains supplied.

The `v5` target is approximately 8-16 seconds of measured audio per complete
semantic unit to preserve more natural phrasing than the earlier 8-12-second
aim. Because input text cannot guarantee output duration before synthesis, the
authority must freeze eligible synthetic units and a separate hard output
duration limit before results. It must not modify `narration-v1` or trim,
concatenate, or rewrite generated speech to force a duration.

Initial playback remains governed by ADR-0004: start when approximately 15
seconds of contiguous active-generation audio is playable, or when a complete
shorter remaining range is ready. The experimental queue may then grow under
backpressure to at most 300 playable seconds. At the frozen 24 kHz mono
float32 format, 300 seconds is exactly 28,800,000 PCM payload bytes. Retention
must also be capped at 40 complete units and one active unit per worker, with
worst-case active-unit capacity reserved before dispatch; the first reached
limit stops new work. The five-minute value is a capacity ceiling, not a
startup requirement or a guarantee of staying ahead. Only concurrent
aggregate RTF below 1.0 plus the bounded underrun result can establish
sustainability.

## Milestones

### Milestone 1: Freeze the v4 evaluation authority

#### Work

- Record the exact candidate, full-GPU and conditional CPU profile identities,
  artifact hashes, runtime lock, settings, host, and offline controls.
- Freeze the synthetic Spanish corpus, normalization authority, expected unit
  order, pairing, sample counts, batch sizes, warm-up, measurement intervals,
  first-attempt accounting, cleanup, and no-retry rule.
- Freeze separate standard and engineering conclusions:
  - the existing standard balanced gates remain unchanged, including warm
    first audio at or below 3 seconds, time to 15 seconds of media at or below
    12 seconds, and sustained RTF at or below 0.8;
  - a scheduling result is only sustainable when aggregate RTF is below 1.0
    and the bounded simulation stays within the product allowance of at most
    5 seconds of buffering per minute;
  - passing the scheduling result does not promote the failed standard profile
    or erase an explicit preparation delay.
- Freeze a numerical VRAM safety/stop boundary and prove that it is evaluated
  before the conditional CPU arm can be admitted.
- Freeze content-safe raw and summary schemas, derivation rules, quality
  workflow, and promotion/failure rules before any official output is heard.

#### Validation

- The authority is byte-stable and contains no observed official result.
- Batch one and batch two use the same candidate, corpus, settings, and
  first-attempt accounting.
- Every conclusion is conjunctive and cannot be rescued by an average, retry,
  later quality waiver, or offload result from a different profile.
- Model-free tests reject authority drift, result-before-authority, missing
  pairs, reordered results, unapproved CPU placement, and private content.

#### Status

Complete on 2026-07-26. The exact authority, normalized corpus, schemas,
model-free validator, documentation, and deterministic tests are frozen before
any v4 runner, pilot, official hardware output, listening result, or selection
exists.

### Milestone 2: Extend the benchmark with bounded ordered batching

#### Work

- Add a candidate-neutral batch request/result boundary supporting exactly the
  frozen sizes without exposing Qwen-specific fields to production contracts.
- Record per-call and per-unit timing, output duration, ordering, identity,
  failure, RAM, VRAM, and cleanup evidence.
- Add deterministic fake candidates for ordered completion, swapped output,
  one-item failure, timeout, stale identity, cancellation, OOM, and cleanup.
- Add a content-free bounded playback simulator that consumes ordered PCM
  durations and reports startup lead, minimum buffer, underruns, buffering
  duration, stale output, and retained-work high-water marks.
- Add and document an explicit repository command for the hardware experiment
  before anyone executes it.

#### Validation

- Model-free tests prove order, bounded retention, whole-batch invalidation,
  no stale publication, exact arithmetic, schema closure, and deterministic
  replay.
- Logs and committed reports contain no narration text, audio, model paths,
  user paths, or raw exception messages.
- Focused Ruff, mypy, and pytest checks pass before hardware execution.

#### Status

Complete on 2026-07-26. The development-only candidate-neutral batch
contracts, exact frozen matrix constructor, ordered whole-batch invalidation,
bounded content-free playback simulator, deterministic failure candidates,
Qwen list-call adapter, spawned-worker path, dedicated/shared GPU observation
surface, and reviewed disposable-pilot command are implemented and validated.
No pilot or official hardware output was produced.

### Milestone 3: Run the full-GPU short-unit batch matrix

#### Work

- Run the unchanged preflight, artifact verification, outbound block, local-only
  loading, AC-power, sleep, competing-process, and clean-checkpoint controls.
- Run one disposable pilot to verify only the frozen mechanics and safety
  boundaries.
- From a clean committed checkpoint, run the complete batch-one and batch-two
  official matrix with no retries.
- Derive the content-safe result, then delete raw journals and generated audio.

#### Validation

- Exact counts, pair identities, order, first attempts, candidate identity, and
  authority fingerprint match.
- Results distinguish per-unit latency from aggregate batch throughput.
- No OOM, shared-memory paging, hidden retry, stale output, unbounded retention,
  missing cleanup, or authority change is accepted.
- If the full-GPU arm fails performance but not its frozen memory stop
  condition, the conditional CPU arm is not run as a speed rescue.

#### Status

Complete on 2026-07-26. The disposable pilot completed and remained
non-promotable. The official full-GPU run stopped on the frozen
`shared-gpu-memory` rule after observing 79,691,776 bytes of shared GPU memory,
derived a schema-valid content-safe result, and deleted its private raw
session. The stop occurred before usable media, throughput, playback, or
quality evidence existed.

### Milestone 4: Run the conditional targeted-CPU arm if admitted

#### Work

- Execute only if Milestone 3 records the exact predeclared memory stop reason.
- Verify the exact content-free module/device map and complete load before
  generation.
- Run the same frozen corpus and counts under the separate contingency profile.
- Measure the full RAM, VRAM, timing, transfer, failure, order, cancellation,
  and cleanup boundary.

#### Validation

- The run contains no disk offload, implicit fallback, shared-memory paging, or
  device mismatch.
- Lower VRAM does not count as success unless all frozen safety, throughput,
  buffer, ordering, and cleanup gates also pass.
- The result cannot promote or alter the full-GPU result.

#### Status

Complete on 2026-07-26. The schema-valid targeted-CPU result is
`benchmarks/tts/short-segment-batch-result-v4-cpu.json` with SHA-256
`d3766ae87bdebc806210d04d974081b6f79f976bf9793a184c4d021273f85234`.
The exact placement loaded and verified, but the run reproduced the full-GPU
`shared-gpu-memory` stop and identical VRAM boundary before usable media. It
fails standard viability and scheduling sustainability, provides no playback
or quality evidence, and does not admit Milestone 5.

### Milestone 5: Evaluate playback credibility and bounded quality

#### Work

- Replay measured ordered completion times through the frozen playback
  simulation.
- Confirm whether the first ordered outputs supply approximately 15 seconds of
  playable lead and whether the bounded producer stays within the underrun
  allowance.
- Run the frozen one-maintainer Spanish review for admitted outputs, including
  joins, accents, number/symbol normalization, intelligibility, and prosody.
- Exercise cancellation before dispatch, during batch generation, after one
  result is logically ready, during queueing, and after invalidation.

#### Validation

- Audio order matches source order and no stale unit is playable.
- Retained batches, PCM duration, queue depth, and cancellation cleanup remain
  within the frozen limits.
- Quality evidence is descriptive for this focused MVP decision and is not
  duplicated into a multi-person panel claim.

#### Status

Not admitted. Milestone 4 stopped before usable media on the frozen
`shared-gpu-memory` rule, so there are no outputs eligible for playback replay
or listening review. Milestone 6 records that failed outcome without inventing
quality evidence.

### Milestone 6: Record the v4 decision and freeze v5 dual-worker authority

#### Work

- Produce a content-safe `selection-v4` record that distinguishes standard
  viability, scheduling sustainability, and constrained-demo usefulness.
- Record that targeted component placement is not an independent CPU-only
  worker and that neither `v4` result contains usable performance or quality
  evidence.
- Freeze new `v5` candidate identities for the exact full-GPU primary and a
  separately loaded CPU-only support worker, including runtime/artifact
  identity, device/dtype/thread policy, settings, host, offline controls, and
  zero-GPU checks for the CPU worker.
- Freeze the synthetic Spanish corpus, 8-16-second target, hard unit-duration
  bound, source order, worker dispatch rule, sample counts, warm-up, first
  attempts, timeouts, cancellation, and no-retry rule before new output.
- Freeze CPU-solo admission, concurrent comparison, aggregate throughput,
  GPU-slowdown, RAM/commit, dedicated/shared VRAM, ordering, cleanup, and
  quality gates. Historical arithmetic may inform thresholds but cannot
  replace direct concurrent measurements.
- Require CPU-solo total sustained RTF at or below 3.2 for concurrent
  admission. This is a screening threshold derived from the historical GPU
  deficit, not a `v5` scheduling pass; the concurrent result must still achieve
  aggregate RTF below 1.0 after measured contention.
- Freeze the approximately 15-second startup gate and the simultaneous
  300-playable-second, 40-complete-unit, 28,800,000-byte float32 PCM, and
  two-active-unit retention ceilings.
- Freeze new closed raw/result schemas, authority/result ancestry, derivation,
  privacy, cleanup, promotion, and failure rules. No `v4` file or conclusion
  may be edited to admit `v5`.

#### Validation

- `selection-v4` is derivable only from the two committed schema-valid results
  and reports no unavailable performance or quality value.
- The complete `v5` authority is byte-stable before any CPU-only or concurrent
  waveform is generated or heard.
- Model-free tests reject CPU CUDA/shared-memory use, missing or duplicate
  identities, reordered dispatch/results, authority drift, hidden retry,
  retention over any one bound, and a sustainability pass with aggregate RTF
  at or above 1.0.
- The authority explicitly states that a 300-second ceiling cannot compensate
  for average production slower than playback.

#### Status

Complete on 2026-07-26. Accepted `selection-v4` selects neither placement and
retains unavailable performance and quality as unavailable. The separately
versioned `profile-v5.json`, scheduled `corpus-v5.json`, closed raw/summary
schemas, human authority, model-free validator, and deterministic tests were
committed before any `v5` runner, pilot, official waveform, listening result,
or selection existed.

### Milestone 7: Extend the benchmark with independent dual workers

#### Work

- Add benchmark-local candidate-neutral worker-role, dispatch, completion, and
  ordered-reorder contracts without changing production/shared contracts.
- Add an exact CPU-only Qwen adapter path that loads the same frozen model,
  speaker, instruction, and generation settings under the frozen CPU device,
  dtype, and threading policy.
- Add a controller with exactly one active unit per worker, deterministic
  earliest-unclaimed dispatch, identity-first invalidation, bounded reorder
  retention, and content-free worker-specific failures.
- Extend the playback simulator to enforce the `v5` 15-second startup rule and
  simultaneous 300-second, 40-unit, 28,800,000-byte, and two-active-unit
  bounds.
- Add a reviewed CPU-solo pilot and official dual-worker command surface before
  hardware execution. Private inputs remain standard-input-only and generated
  waveform payloads remain ignored and ephemeral.

#### Validation

- Model-free tests prove deterministic heterogeneous dispatch, ordered release,
  head-of-line blocking, backpressure, all four retention limits, stale-result
  rejection, both-worker cancellation, timeout, crash, cleanup, and exact
  rational playback arithmetic.
- Candidate-import tests prove that the CPU adapter cannot select CUDA, disk,
  meta, or an implicit device map.
- Focused Ruff, mypy, pytest, schema, privacy, and command invalid-input checks
  pass without loading a model.
- No production dependency, shared contract, `narration-v1` behavior, model
  artifact, audio, or private path is committed.

#### Status

Complete on 2026-07-26. The benchmark now has exact `v5` occurrence
construction, benchmark-local worker/dispatch/completion/release contracts,
one-active-unit-per-worker scheduling, GPU-first tie handling, bounded ordered
release with observable head-of-line delay, identity-first invalidation, and
fixed content-free failure outcomes.

The exact Qwen adapter now has distinct GPU-primary and CPU-support paths. The
CPU path sets `CUDA_VISIBLE_DEVICES=-1` before importing PyTorch, loads the
complete model on CPU float32, applies the frozen twelve/one thread policy,
and rejects CUDA visibility, non-CPU tensors, disk/meta device-map entries, or
implicit placement. The GPU path applies the frozen four/one thread policy and
verifies complete `cuda:0` placement. Both remain inside the unchanged
isolated candidate environment.

The `benchmark:tts:dual-worker` command accepts only the closed standard-input
contract, freezes CPU-solo pilot versus official arm progression, and exposes
the reviewed mechanics path without promoting its receipt. Milestone 8 still
owns cold-load/cancellation/memory raw evidence, schema-valid safe derivation,
the first pilot, and every official hardware run. No model was imported or
loaded and no waveform, raw journal, result, or quality evidence was produced
in this milestone.

### Milestone 8: Run CPU-solo admission and the concurrent matrix

#### Work

- Run unchanged repository, artifact, offline/firewall, AC-power, sleep,
  competing-process, and clean-checkpoint preflight.
- Run one non-promotable CPU-solo pilot, followed by the frozen official
  CPU-solo admission only if safety checks pass.
- Stop before concurrent execution if CPU-only placement, waveform validity,
  RAM/commit reserve, failure, timeout, cleanup, or frozen solo-throughput
  admission fails.
- If admitted, measure a same-authority GPU-solo baseline and the complete
  concurrent GPU-primary/CPU-support matrix from clean committed checkpoints
  with no retries.
- Record worker-specific and aggregate RTF, GPU slowdown under CPU contention,
  order/head-of-line delay, RAM/commit, dedicated/shared VRAM, failures,
  cancellation, and cleanup. Derive content-safe summaries and delete raw
  journals and audio.

#### Validation

- The CPU worker uses zero dedicated/shared GPU memory and the GPU worker stays
  within its frozen safety boundary.
- Official counts, worker assignments, identities, first attempts, ordering,
  and authority ancestry match exactly.
- Concurrent throughput is compared with the same-run GPU-solo baseline; a
  CPU contribution cannot pass if contention removes its aggregate benefit.
- No OOM, paging beyond the frozen RAM/commit boundary, hidden retry, stale
  output, unbounded retention, or incomplete cleanup is accepted.

#### Status

Complete with a failed concurrent outcome. The final non-promotable CPU pilot
passed, the schema-valid official CPU-solo result passes admission, and the
schema-valid same-authority GPU-solo baseline is recorded. The concurrent arm
ran from the required clean/hash-bound checkpoint but stopped with the frozen
content-free `resource-limit` failure before promotable raw/result creation.
Cleanup and sleep restoration passed. Milestone 9 is not admitted.

### Milestone 9: Evaluate five-minute bounded playback credibility and quality

#### Work

- Replay actual ordered concurrent completion events through the frozen
  bounded simulator, starting at approximately 15 playable seconds and
  allowing opportunistic lead growth up to the five-minute ceiling.
- Report time to startup, time and ability to reach each declared buffer
  threshold, peak/minimum lead, head-of-line stalls, underruns, buffering
  seconds per minute, and whether the producer loses or gains lead over time.
- Prove that the simulation never exceeds 300 playable seconds, 40 complete
  units, 28,800,000 retained PCM bytes, or the frozen active-work bound.
- Run one bounded Spanish-maintainer review only if machine and scheduling
  gates admit it, covering natural phrasing across 8-16-second targets, joins,
  accents, number/symbol normalization, intelligibility, and defects.
- Exercise cancellation and invalidation with both workers active and with
  completed support-worker audio waiting behind an earlier unit.

#### Validation

- Combined aggregate RTF is strictly below 1.0 and the replay stays within the
  MVP allowance of at most five seconds of buffering per minute.
- The preferred standard margin remains aggregate RTF at or below 0.8; a
  scheduling-only pass cannot rewrite failed `v3` standard gates.
- No stale or out-of-order unit becomes playable, and all retained payloads are
  released on invalidation or cleanup.
- The five-minute ceiling is reported as bounded capacity, not as a startup
  wait, sustained-throughput substitute, or production setting.

#### Status

Not admitted. Milestone 8's concurrent arm stopped at the frozen
`resource-limit` boundary before a promotable concurrent result. The existing
GPU-solo replay is diagnostic baseline evidence only; no concurrent
five-minute playback or quality claim is authorized.

### Milestone 10: Record the v5 decision and close validation

#### Work

- Produce a content-safe `selection-v5` record distinguishing CPU-solo
  admission, concurrent scheduling sustainability, constrained-demo
  usefulness, and unchanged standard production viability.
- Amend or supersede ADR-0014 only if accepted evidence authorizes two workers,
  the larger bounded buffer, or a broader demo topology.
- Reconcile the roadmap, MVP, architecture, performance, dependency, setup,
  testing, and system-diagram documentation.
- Run focused and repository-wide validation, privacy/artifact scans, cleanup,
  and required CI.
- Move this plan to `docs/plans/completed/` only after all unconditional work
  and the final decision are complete.

#### Validation

- `pnpm.cmd check:portable` passes.
- `pnpm.cmd check` passes on the authoritative Windows host.
- The isolated candidate lock check and exact import smoke pass.
- Required pull-request CI passes.
- No model, audio, raw journal, book text, private path, secret, or production
  dependency is committed.

#### Status

Not started.

## Testing and benchmark strategy

Use the existing commands that are present at plan creation:

```powershell
uv run --directory services/tts --locked ruff check benchmarks tests
uv run --directory services/tts --locked mypy .
uv run --directory services/tts --locked pytest tests -q
uv lock --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --check
pnpm.cmd check:portable
pnpm.cmd check
```

Milestone 2 adds the narrow repository-owned `benchmark:tts:batch`
disposable-pilot command before Milestone 3. Do not substitute an ad hoc
private script for that reviewable surface.

Deterministic tests run without model weights or GPU hardware. Hardware work is
Windows-host-specific, outside CI, offline after artifact preparation, and
reported only for the exact host. A pilot result cannot be promoted. Raw
hardware journals and WAV files remain ignored and are deleted after a
schema-valid content-safe result is derived.

Milestone 7 must add and review a separate repository-owned dual-worker command
before Milestone 8; no such command exists at this planning checkpoint. Its
model-free path must run in the base environment, while exact GPU and CPU Qwen
loads remain isolated under the unchanged candidate lock. Milestone 8 must
measure CPU solo before concurrent execution, then compare the concurrent
matrix with a same-authority GPU-solo baseline. Existing `v3`/`v4` measurements
are historical inputs, not substitutes for that comparison.

## Risks and rollback

- The Qwen batch call may execute elements serially or gain too little from
  shared computation. Record the result; do not redefine batching as parallel.
- Batch-two activations, KV state, or decoder work may exceed the remaining
  VRAM headroom or trigger Windows paging. Fail closed before instability.
- Unequal output lengths may create a straggler that delays both complete
  waveforms. Pair similarly bounded semantic units and report each duration.
- Shorter units may damage prosody or create audible joins. Keep semantic
  boundaries and require the focused listening result.
- Complete-waveform generation remains non-cooperative during a call. Whole
  batch invalidation and worker termination must prevent stale playback.
- Targeted CPU placement may be unsupported, cause device mismatches, increase
  RAM, or slow generation through transfers. It is optional evidence, not a
  required rescue.
- A complete CPU-only Qwen instance may not support the selected dtype or may
  be too slow despite fitting in RAM. Fail CPU admission before concurrency
  rather than redefining the support worker.
- Concurrent CPU load may reduce GPU throughput through host preprocessing,
  memory bandwidth, thermal, or power contention. Require a same-run GPU
  baseline and judge aggregate benefit after that slowdown.
- The CPU worker may claim an early unit and become an ordered head-of-line
  blocker while the GPU finishes later units. Preserve order and report the
  stall; do not hide it with duplicate generation.
- A 300-second queue can discard substantially more valid but obsolete audio
  after a seek or settings change. Keep it ephemeral, bound it by duration,
  count, bytes, and active work, and prove prompt identity-first cleanup.
- Filling a larger buffer increases energy use and speculative work. The
  experiment must report time-to-threshold and discarded-audio duration rather
  than treating a full queue as inherently desirable.
- A result from one 8-GiB laptop GPU cannot establish general support.
- Model-specific optimization may leak into stable narration contracts. Keep
  all pairing and candidate fields inside the benchmark boundary.

Rollback is documentation and development-benchmark only: remove unselected
`v5` code and authorities while retaining the content-safe `v4` and `v5`
decision evidence. Never delete or rewrite `v2`, failed batch-one `v3`, frozen
`v4`, ADR-0013, or ADR-0014.

## Progress log

- 2026-07-26: Created this separate ExecPlan instead of expanding M006-001.
  Recorded shared-model batch size two, approximately 8-20-second semantic
  units, ordered bounded playback simulation, exact VRAM/artifact arithmetic,
  and conditional targeted CPU placement as pre-result work. No runtime code,
  hardware run, generated audio, dependency, or support claim was added.
- 2026-07-26: Created branch `feat/m006-2-freeze-v4-authority` from merged
  `main` at `cbb49f6`. The worktree was clean and no v4 result existed.
- 2026-07-26: Froze `profile-v4.json` and `corpus-v4.json` before adding any
  runner or hearing output. The corpus has eight repository-authored Spanish
  semantic units in four immutable source-order pairs and binds the
  implemented `narration-v1` normalization authority by hash. Batch one and
  batch two share the exact candidate, inputs, settings, three measured
  passes, 24 per-unit observations, first attempts, and zero-retry policy.
- 2026-07-26: Froze the full-GPU-first memory boundary. The accepted
  8,174,698,496-byte free-VRAM observation minus a 536,870,912-byte reserve
  produces a 7,637,827,584-byte engineering ceiling; zero shared-GPU-memory
  use is permitted. Only four exact memory stop codes admit the separate
  speech-tokenizer CPU placement. Speed, standard-gate, or quality failure
  does not.
- 2026-07-26: Added closed private-raw and content-safe-summary schemas plus a
  model-free authority validator. Six focused tests pass and reject byte
  drift, result-before-authority, missing or reordered pairs/units, retries,
  unapproved CPU placement, private content, and pass claims that attempt to
  waive failed conjunctive gates.
- 2026-07-26: Committed the pre-result authority checkpoint as `f6bccf7`
  (`feat(tts): freeze v4 batch evaluation authority`). This checkpoint adds no
  candidate dependency, model import, GPU execution, generated audio, raw
  result, production contract, runtime, or command.
- 2026-07-26: Closed Milestone 1 validation. The full Python boundary passed
  Ruff formatting/lint, strict mypy over 45 source files, 78 tests, and the
  unchanged 107-package candidate lock check. `pnpm.cmd check:portable` passed
  in 28 seconds and `pnpm.cmd check` passed on native Windows in 50.9 seconds.
  All 48 repository Markdown files passed the relative-link audit. The
  branch-wide private-pattern/artifact audit found no private path, secret,
  book, audio, model weight, raw journal, or v4 result; the ignored raw tree
  contains zero files.
- 2026-07-26: Created branch
  `feat/m006-2-bounded-ordered-batching` from merged `main` at `025d6d8`.
  Re-read the frozen v4 authority, product/architecture boundaries, ADR-0013,
  ADR-0014, and completed narration-v1 plan before changing the benchmark.
- 2026-07-26: Added a benchmark-local candidate-neutral one/two-unit request
  and complete-waveform result boundary. The controller admits one active
  batch, retains at most two payload-free unit results, records nanosecond,
  sample, duration, RTF, RAM, dedicated/framework VRAM, free-VRAM, and shared
  GPU observations, and publishes only exact ordered active identities.
  Swapped, missing, failed, timed-out, cancelled, OOM, or stale output
  invalidates the whole batch with fixed content-free codes.
- 2026-07-26: Added the exact frozen 39-call constructor: three excluded
  warmups followed by 36 measured first-attempt calls across the frozen
  `[1,2]`, `[2,1]`, `[1,2]` pass order. It yields the required 24 batch-one
  calls/24 units and 12 batch-two calls/24 units without changing the corpus,
  pairs, narration-v1 text, authority files, retry rule, or production
  contract.
- 2026-07-26: Added a rational-arithmetic content-free playback simulator.
  It starts at 15 seconds of ordered playable media or a complete shorter
  remainder, consumes at real time, enforces two queued complete units and 40
  playable seconds, and reports startup lead, minimum/peak buffer, underruns,
  buffering duration/rate, active batches, and stale playback.
- 2026-07-26: Extended the Qwen development adapter to make one upstream list
  call for either frozen batch size and map returned waveform positions back
  to independent unit identities while discarding payloads. The existing
  spawned-worker isolation now supports that boundary and continues to
  suppress candidate diagnostics and private paths/text.
- 2026-07-26: Added the reviewed `benchmark:tts:batch` command. It accepts
  private paths only through bounded standard input, is limited to the
  full-GPU disposable mechanics pilot, repeats exact authority, host,
  repository, artifact, offline, firewall, power, and headroom preflight,
  samples dedicated/shared WDDM process memory and PyTorch reserved VRAM, and
  emits only a non-promotable content-safe receipt. It was intentionally not
  executed in Milestone 2.
- 2026-07-26: Committed the model-free controller/simulator checkpoint as
  `e9ee1ad` and the adapter/matrix/isolated-command checkpoint as `e90410b`.
  Focused validation passed Ruff, strict mypy over 54 source files, all 96
  Python tests, and package-script Prettier. No model import, CUDA use,
  waveform, raw journal, pilot, official result, dependency, production
  contract, or narration-v1 change occurred.
- 2026-07-26: The exact candidate-environment command smoke exposed an
  accidental import-time dependency on the base environment's schema
  validator. Split byte-frozen mechanics loading from later result-schema
  validation and committed the correction as `9314f5c`. The command now
  reaches its closed input gate under the unchanged 107-package candidate
  lock; JSON Schema remains required only for base-environment result
  validation.
- 2026-07-26: Closed Milestone 2 local validation. The unchanged candidate
  lock resolved 107 packages and its Qwen/PyTorch/Torchaudio import smoke
  passed. The isolated batch command reached its fixed `input` rejection
  without loading a model. `pnpm.cmd check:portable` passed in 28 seconds and
  authoritative native `pnpm.cmd check` passed in 51.4 seconds, including all
  TypeScript, Python, Rust, build, and Tauri release checks. The existing Vite
  chunk-size advisory remained informational.
- 2026-07-26: All ten changed Markdown files passed the local-link audit.
  `git diff --check`, changed-tree private-path/credential scanning, and the
  tracked model/audio/book/raw-artifact scan passed. The ignored raw result
  tree contains zero files, confirming that Milestone 2 produced no pilot,
  waveform, journal, or private hardware evidence.
- 2026-07-26: Created branch
  `feat/m006-2-full-gpu-short-unit-batch-matrix` from merged `main` at
  `9e7192a`. The checkout was clean and Milestone 2 was already merged.
- 2026-07-26: Implemented the official full-GPU hardware boundary without
  changing the frozen candidate, corpus, placement, gates, schemas, or
  candidate lock. The candidate-environment command now supports one opaque
  official session, five excluded cold-load observations, the exact 39-call
  matrix, continuous bounded RAM/dedicated/shared/free-VRAM/framework
  telemetry, five ordered cancellation trials, cleanup evidence, and ignored
  raw files without retaining waveform samples.
- 2026-07-26: Added a separate base-environment derive command. It validates
  the frozen raw authority and schema, recomputes allowlisted counts,
  percentiles, RTF, playback, memory, cancellation, audits, and conjunctive
  standard/scheduling conclusions, validates the content-safe summary, and
  deletes the exact ignored raw session before emitting it. This separation
  keeps `jsonschema` out of the unchanged candidate lock.
- 2026-07-26: Focused model-free validation passes Ruff, strict mypy over 58
  source files, and 14 v4 tests. The new tests cover official counts, bounded
  cleanup/memory evidence, content-safe derivation, and closed opaque-session
  input without importing Qwen or requiring CUDA.
- 2026-07-26: The first disposable-pilot attempt stopped before model load
  with the fixed `preflight` code. The generic content-safe preflight then
  passed every repository, artifact, offline, firewall, power, headroom,
  provider, and measurement check. The v4 wrapper alone rejected Windows'
  trademarked CPU string against the frozen normalized CPU label. Added a
  narrow normalization regression test without weakening any other exact-host
  field; no pilot result or GPU execution occurred on the rejected attempt.
- 2026-07-26: The corrected disposable pilot completed in 67.2 seconds with
  three excluded calls/four units, correct order, one active batch, two
  retained units, zero retries/failures, cleanup, 2,212,458,496 bytes peak
  process-tree RAM, 5,647,167,488 bytes peak dedicated VRAM, and
  5,509,218,304 bytes peak framework-reserved VRAM. It was correctly marked
  non-promotable. Its 81,788,928-byte shared-GPU observation required the
  official run to apply the frozen zero-shared-memory stop rule.
- 2026-07-26: The official full-GPU run from clean checkpoint `2ed9791`
  completed its safety path in 69.1 seconds. The shared-memory signal
  recurred, so the runner terminated the active work, recorded the remaining
  exact calls as failed first attempts, skipped unsafe cancellation loads,
  and produced an ignored session eligible for derivation. The first derive
  attempt failed closed with a content-free internal code and deleted that
  session. Added a model-free shared-memory-stop derivation regression, which
  passes, plus safe authority-error mapping before repeating official
  evidence; no reviewable result was promoted from the failed derive.
- 2026-07-26: Repeated the same bounded official safety run from clean
  checkpoint `9e2693a`; it reproduced the same five fixed failure codes in
  69.1 seconds. Derivation now identified the rejection as `result-schema`
  and again deleted the ignored session. Added a closed diagnostic that emits
  only the first schema path and validator, never its value, before the next
  repeat. The frozen authority, hardware conditions, candidate, and observed
  safety outcome remain unchanged.
- 2026-07-26: A third identical 69.0-second safety run let the closed
  diagnostic identify `host.cpuModel`'s frozen `const` as the only first raw
  schema rejection. The command compared the normalized identity correctly
  but serialized the trademarked Windows label. Updated raw serialization and
  its regression to use the same frozen normalization; the session was
  deleted and no invalid result was retained.
- 2026-07-26: Ran the final official full-GPU safety path from clean checkpoint
  `3eb1635`. It reproduced the frozen `shared-gpu-memory` stop, derived the
  schema-valid content-safe
  `benchmarks/tts/short-segment-batch-result-v4.json`, and deleted the exact
  ignored raw session. The committed summary SHA-256 is
  `9ce8141fa5987878ab29bf472f6f16dc3a6370dd4ffcc1141b30964914c62e32`.
  It records five cold loads with 9.6984155-second p95, 36 failed measured
  first attempts and zero retries, 4,633,399,296 bytes peak process-tree RAM,
  4,432,904,192 bytes peak authoritative VRAM, 3,757,047,808 bytes minimum
  free dedicated VRAM, 79,691,776 bytes peak shared GPU memory, and successful
  cleanup. No generated audio or private raw evidence remains.
- 2026-07-26: Milestone 3 therefore fails standard viability and scheduling
  sustainability without evaluating constrained-demo quality. It supplies no
  RTF, startup, buffer, or short-unit duration evidence. The exact memory stop
  admits the separately frozen targeted-CPU Milestone 4 arm; it does not prove
  that CPU placement will be faster or viable.
- 2026-07-26: Created branch `feat/m006-2-targeted-cpu-arm` from merged `main`
  at `32e18fb`. Reverified the committed full-GPU summary rather than accepting
  caller-provided admission: its SHA-256 is
  `9ce8141fa5987878ab29bf472f6f16dc3a6370dd4ffcc1141b30964914c62e32`,
  its exact stop is `shared-gpu-memory`, all 36 measured first attempts failed,
  zero retries occurred, cleanup/privacy passed, and both performance
  conclusions failed.
- 2026-07-26: Implemented the frozen conditional placement without adding a
  production dependency or changing the v4 authority. Each isolated candidate
  first loads the exact model on `cuda:0`, then moves only
  `model.speech_tokenizer.model` and its wrapper device to CPU, clears the CUDA
  cache, and reports content-free placement evidence. Every official cold,
  measured, and cancellation worker rejects a CPU/meta/disk/fallback mismatch
  before generation. CPU execution is official-only and its admission is bound
  to the fixed committed full-GPU result hash.
- 2026-07-26: The first deterministic Milestone 4 checkpoint passes Ruff,
  strict mypy over 58 source files, and 25 focused tests. New model-free coverage
  proves the exact module move, preserved autoregressive CUDA placement,
  admission derivation, official-only command surface, result binding, and
  schema-valid CPU summary derivation. The hardware run remains pending.
- 2026-07-26: The first official attempt stopped before model load because the
  invoking PowerShell process lacked the two required offline environment
  flags; no raw session was created. With those controls restored, the first
  cold load exposed a fail-closed verifier mismatch: the installed Transformers
  loader represents its exact `cuda:0` device-map entry as a `torch.device`
  object rather than the equivalent frozen string. A content-free one-load
  diagnostic confirmed 400 speech-tokenizer parameters and 150 buffers on CPU,
  while all 404 other parameters and two other buffers remained on `cuda:0`.
  The verifier now accepts that exact CUDA object form and still rejects CPU,
  meta, disk, or mixed device-map entries; focused Ruff, mypy, and nine adapter
  tests pass.
- 2026-07-26: The first corrected hardware run reached the expected
  `shared-gpu-memory` stop, but derivation correctly rejected its execution
  commit because GitHub's earlier squash merge had again removed the frozen
  authority parent from `main`. The failed derivation deleted the complete
  private raw session. Recorded unchanged `f6bccf7` as an ancestry-only second
  parent in checkpoint `0af8331`; no authority bytes or implementation files
  changed in that merge.
- 2026-07-26: Repeated the official targeted-CPU arm from clean authority-valid
  checkpoint `0af833179e99f542bdf4eb11c56434f780a5d6ba`. It completed in 70.6
  seconds, reached the frozen `shared-gpu-memory` stop before usable media,
  derived schema-valid
  `benchmarks/tts/short-segment-batch-result-v4-cpu.json`, and deleted the
  ignored raw session. The safe-summary SHA-256 is
  `d3766ae87bdebc806210d04d974081b6f79f976bf9793a184c4d021273f85234`.
- 2026-07-26: The CPU result records five cold loads with 9.8610702-second p95,
  36 failed measured first attempts and zero retries, 4,591,538,176 bytes peak
  process-tree RAM, 4,432,904,192 bytes peak authoritative VRAM,
  4,311,744,512 bytes peak framework-reserved VRAM, 3,757,047,808 bytes
  minimum free dedicated VRAM, 79,691,776 bytes peak shared GPU memory, and
  successful cleanup/privacy. It produced zero media, so RTF, startup,
  playback, unit duration, cancellation-under-generation, and quality remain
  unavailable. Milestone 4 is complete with a failed outcome; Milestone 5 is
  not admitted.
- 2026-07-26: After reviewing the failed targeted-placement result, the
  maintainer requested that this same ExecPlan continue with a materially
  different topology instead of creating M006-003: one exact GPU-primary Qwen
  worker and one separately loaded CPU-only support worker. The amendment adds
  future result-blind `v5` Milestones 6-10 and does not modify `v4` authority,
  schemas, results, or conclusions.
- 2026-07-26: The maintainer changed the new experiment's complete-unit target
  from approximately 8-12 seconds to approximately 8-16 seconds to protect
  natural phrasing, and requested capacity for at least five minutes of
  in-memory audio. The plan records 300 playable seconds as an experimental
  maximum, not a startup requirement or continuity guarantee, and adds
  simultaneous 40-unit, 28,800,000-byte float32 PCM, and two-active-unit
  bounds. ADR-0004's approximately 15-second startup rule remains unchanged.
- 2026-07-26: Reconciled the roadmap, documentation index, active-plan index,
  MVP, project brief, architecture overview, performance budget, canonical
  system diagram, setup, testing, and dependency inventory. Every document
  distinguishes planned `v5` evidence from implemented runtime and retains
  ADR-0014's current one-worker constrained-demo boundary.
- 2026-07-26: Created branch
  `feat/m006-2-freeze-v5-dual-worker-authority` from merged `main` at
  `73fd6aa`. The worktree was clean and PR #108 had merged.
- 2026-07-26: Added content-safe `selection-v4.md` from only the two committed
  schema-valid results. It records both standard and scheduling failures,
  leaves throughput/playback/quality unavailable, selects neither placement,
  and explains that the targeted speech-tokenizer move was not a complete
  CPU-only worker. Committed this decision separately as `6a8a4ad`.
- 2026-07-26: Froze `profile-v5.json`, `corpus-v5.json`, and the closed
  dual-worker raw/summary schemas. The GPU primary retains exact CUDA BF16
  identity. The independent CPU support identity uses the same exact model,
  Serena, instruction, settings, artifacts, and isolated lock on CPU float32,
  twelve intra-op threads, one inter-op thread, OS-default affinity, and
  `CUDA_VISIBLE_DEVICES=-1` before PyTorch import.
- 2026-07-26: Froze CPU solo before concurrency, the same-authority GPU-solo
  baseline, deterministic earliest-unclaimed dispatch, ordered release,
  visible CPU head-of-line blocking, zero retry/duplicate rescue, hard
  20-second units, aggregate RTF below 1.0, no more than 25% GPU slowdown, and
  the unchanged preferred 0.8 margin. CPU solo must produce eight valid
  first-attempt units, at least 60 seconds of media, and total RTF at or below
  3.2 with zero CPU-worker GPU allocation.
- 2026-07-26: Froze 12-GiB preflight RAM and 8-GiB preflight commit headroom,
  20-GiB combined process-tree RAM, 4-GiB live RAM/commit reserves, the
  GPU-worker engineering VRAM boundary, a separate 128-MiB GPU-worker shared
  ceiling, and exact zero dedicated/shared GPU bytes for the CPU worker.
- 2026-07-26: Froze ADR-0004's 15-second playable startup gate plus simultaneous
  300-second, 40-complete-unit, 28,800,000-byte PCM, and two-active-unit
  ceilings. Every active unit reserves the hard 20 seconds and 1,920,000 PCM
  bytes before dispatch. The authority states explicitly that the larger
  buffer cannot rescue aggregate RTF at or above 1.0.
- 2026-07-26: Added `v5_authority.py` and eleven model-free tests. They
  byte-verify the authorities and schemas, recompute complete worker
  identities, enforce exact schedules and first attempts, require authority
  bytes at a strict ancestor commit, and reject CPU CUDA/dedicated/shared-GPU
  use, missing/duplicate/reordered occurrences, retries, private content,
  retention overruns, and false CPU/concurrent/standard conclusions.
- 2026-07-26: Committed the initial pre-result authority checkpoint as
  `f05f589` (`feat(tts): freeze v5 dual-worker authority`). No `v5` runner,
  command, candidate import, model load, waveform, raw journal, official
  result, or product runtime was added or executed.
- 2026-07-26: The branch-wide diff audit found one trailing blank line at EOF
  in `selection-v4.md` and the human v5 profile. Before any output, removed
  those lines and refreshed the dependent selection/profile hashes and
  validator constants. Final profile SHA-256 is
  `74148d1f86c5a12c05e412a345b2523d98eef49ffce1e81b6d9bd83a5234bcf5`;
  final selection SHA-256 is
  `aa4b033c37ee099b5d7ce87e5f646e9c0be4fc9bdd9871552f7b496eb4a9ceb7`.
  This was a pre-result authority normalization, not observed-result tuning.
- 2026-07-26: Created branch
  `feat/m006-2-dual-worker-benchmark` from merged `main` at `fad2711`; that
  commit already contained the accepted Milestone 6 authority from PR #109.
  The checkout was clean and no `v5` result or ignored raw file existed.
- 2026-07-26: Added exact schedule expansion for all eight CPU-solo and forty
  GPU-solo/concurrent occurrences. The benchmark-local controller dispatches
  the GPU primary first, gives the CPU support worker the next occurrence,
  keeps at most one active unit per worker, resolves exact completion ties in
  GPU order, and publishes only contiguous active-generation results.
- 2026-07-26: Added deterministic heterogeneous fake workers and tests for
  slow-CPU head-of-line blocking, timeout, crash, generation failure, invalid
  waveform, stale identity, invalidation before release, invalidation with
  both workers active, cleanup failure, and exact no-stale publication.
- 2026-07-26: Added exact rational `v5` playback replay. It accounts for the
  15-second startup lead, complete shorter remainder, 300 playable seconds,
  forty complete units, 28,800,000 PCM bytes, two active units, one active
  unit per role, and 20-second/1,920,000-byte pre-dispatch reservations.
  Deterministic tests reject every represented duration/count/active/reserved
  capacity violation and report head-of-line delay and invalidation discard.
- 2026-07-26: Extended the Qwen benchmark adapter with separately identified
  `v5` GPU-primary and CPU-support paths. Model-free imports prove that the CPU
  path hides CUDA before PyTorch import, selects CPU/float32, applies twelve
  intra-op and one inter-op thread, verifies every model/tokenizer tensor and
  device-map value on CPU, reports CUDA unavailable with zero devices, and
  rejects CUDA, meta, or disk placement. The GPU path selects
  `cuda:0`/bfloat16, applies four/one threads, and verifies exact CUDA
  placement.
- 2026-07-26: Added one isolated process per role plus a bounded threaded
  controller bridge, so blocking complete-waveform calls can execute
  independently while process termination remains the cancellation boundary.
  Added the closed `benchmark:tts:dual-worker` standard-input surface with
  exact CPU-pilot/official arm progression and prior-summary hash fields.
  Every receipt remains non-promotable; Milestone 8 owns private raw evidence
  and safe result derivation.
- 2026-07-26: Committed the implementation checkpoint as `69a0bfb`
  (`feat(tts): add v5 dual-worker benchmark mechanics`). Before documentation,
  Ruff, strict mypy over 71 source files, 144 Python tests, package JSON
  formatting, and `git diff --check` passed. The only warning was the
  pre-existing primary-checkout pytest-cache ACL warning.
- 2026-07-26: Created branch
  `feat/m006-2-cpu-solo-concurrent-matrix` from merged `main` at `0d36817`.
  Added frozen official cold-load, warmup, measured-arm, process/RAM/commit,
  PID-tagged WDDM, cancellation, cleanup, ignored raw, and content-safe
  derivation support. Checkpoints `6472b81` and `abc6eb5` keep the candidate
  lock unchanged and allow execution-time authority verification without
  adding the base environment's JSON-schema library to the isolated Qwen
  environment.
- 2026-07-26: The first pilot attempt stopped before model load because the
  invoking process lacked `HF_HUB_OFFLINE=1` and
  `TRANSFORMERS_OFFLINE=1`. With those existing controls set, the
  non-promotable CPU-only pilot completed two first attempts in 134.3 seconds
  with aggregate RTF `3.0552449189419795`, zero CPU-worker dedicated/shared
  GPU bytes, no failure, no stale result, and frozen CPU-official admission.
- 2026-07-26: The first official CPU arm at checkpoint `abc6eb5` completed in
  385.8 seconds with all eight measured first attempts and private raw
  capture. Its first derivation failed closed at raw-schema validation, but
  the new derivation command deleted the ignored session before exposing the
  content-free failing schema path. The receipt and run are non-promotable;
  no result file, audio, book text, or private raw evidence was committed.
- 2026-07-26: Corrected the lifecycle so a failed derivation retains only its
  ignored raw session for diagnosis, successful derivation deletes that
  session before returning a safe summary, and schema failures report only
  the first schema path and validator. Added success/failure lifecycle
  regressions. A new clean-checkpoint CPU pilot and official arm will replace,
  not promote, the invalid tooling run.
- 2026-07-26: The replacement pilot at checkpoint `5f8a79f` again admitted
  CPU-only execution: two of two first attempts completed in 135.5 seconds,
  aggregate RTF was `3.0782776688102897`, and CPU-worker dedicated/shared GPU
  memory remained exactly zero. The replacement official arm completed all
  eight measured first attempts in 380.6 seconds. Preserved raw evidence
  identified the sole first schema rejection as `host.cpuModel`'s frozen
  `const`: the runner serialized Windows' trademarked CPU label instead of the
  normalization already used by v4 and preflight. The ignored session was
  deleted after diagnosis and no result was promoted. Added the same narrow,
  model-independent normalization plus a regression before the next clean
  run.
- 2026-07-26: The final pilot at clean checkpoint `4395ff7` completed two of
  two first attempts in 129.3 seconds with aggregate RTF
  `3.0556705734323426` and zero CPU-worker dedicated/shared GPU memory. The
  final official CPU arm completed in 392.3 seconds and derived schema-valid
  `benchmarks/tts/dual-worker-result-v5-cpu-solo.json`; its ignored raw
  session was deleted. The safe-summary SHA-256 is
  `43ed927e2a765cf39214bc8937398c1c454993cc23bd6485596aa591fe5224a2`.
- 2026-07-26: CPU-solo admission passes with eight of eight first attempts,
  zero retries/failures, 97.04 media seconds, aggregate RTF
  `2.999443394476504`, 9.151-second cold-load p95, all eight units inside the
  8-16-second target, exact zero CPU dedicated/shared GPU memory,
  10,681,810,944 bytes peak combined process RAM, 7,405,936,640 bytes minimum
  available system RAM, 5,974,171,648 bytes minimum commit headroom, two
  passing cancellation trials, no stale publication, and complete cleanup.
  This admits the same-authority GPU-solo baseline; it is not itself a
  concurrent scheduling pass or production-profile promotion.
- 2026-07-26: The same-authority GPU-solo baseline at clean checkpoint
  `cb751b7` completed all forty measured first attempts in 738.3 seconds,
  derived schema-valid
  `benchmarks/tts/dual-worker-result-v5-gpu-solo.json`, and deleted its
  ignored raw session. The safe-summary SHA-256 is
  `2f12e3542038ff9d7b566dc662495a08187163ecf4ccb71ad6d9601b43d64fdb`.
- 2026-07-26: GPU solo produced 446.24 media seconds with aggregate RTF
  `1.467080448861599`, 10.846-second cold-load p95, forty of forty
  first-attempt completions, zero retries/failures, and all units inside the
  8-16-second target. Peak GPU-worker dedicated/shared memory was
  5,296,939,008 / 81,788,928 bytes, peak framework reserve was 5,158,993,920
  bytes, and both cancellation trials plus cleanup passed. Its simulated
  standalone timeline incurred 24.995 buffering seconds per media minute and
  cannot sustain real time alone. The ideal CPU/GPU throughput sum leaves
  little margin, but frozen authority requires the actual concurrent
  contention matrix.
- 2026-07-26: Ran the hash-bound concurrent GPU-primary/CPU-support arm from
  clean checkpoint `9cc9517`. Both workers loaded and the fixed first-attempt
  matrix ran for 759.1 seconds before the live evidence path returned the
  frozen content-free `resource-limit` stop. The command created no
  promotable raw session or concurrent summary, performed no retry, left no
  Python/GPU worker process, restored the 45-minute AC sleep setting, and
  returned the GPU to zero utilization with 7,810 MiB free.
- 2026-07-26: The failed run cannot distinguish the exact safety subcode
  because the initial implementation collapsed live monitor stops to
  `resource-limit`. The combined solo profiles make RAM/commit reserve the
  likely cause, but that is an inference and is not promoted as measured fact.
  Hardened the command so future live stops interrupt at the next completion
  boundary and preserve the exact content-free subcode. Repeating an arm that
  already reached a frozen resource boundary is not admitted on this hardware.
  Milestone 8 therefore completes with CPU admission, a valid GPU baseline,
  and failed concurrent hardware feasibility; Milestone 9 is skipped.
- 2026-07-26: A user-requested, explicitly non-promotable follow-up tested
  whether Qwen's 2048 generated-token ceiling caused the concurrent failure.
  Checkpoint `2d84559` adds a closed `concurrent-diagnostic` purpose that
  accepts only 256 tokens, the concurrent arm, and both committed solo-summary
  hashes. It preserves official authority, writes no raw/result evidence, and
  returns exact content-free live safety subcodes.
- 2026-07-26: The 256-token two-worker diagnostic passed preflight with
  17,632,972,800 bytes free RAM, 7,810 MiB free VRAM, an idle GPU, and the
  exact outbound firewall block. It stopped after 98.4 seconds with
  `commit-headroom`. This proves that the earlier `resource-limit` represented
  Windows commit headroom falling below the frozen 4-GiB floor; reducing the
  generated-token ceiling did not resolve the two-model residency limit.
  Cleanup left zero workers, zero GPU use, 7,810 MiB free VRAM,
  18,012,766,208 bytes available RAM, 21,985,099,776 bytes commit headroom,
  the restored 45-minute AC sleep setting, and zero raw files.

## Discoveries and decisions

1. The model name's `1.7B` is a parameter count. BF16 weights alone are
   approximately 3.4 GB before the speech tokenizer, runtime allocations,
   activations, KV/cache state, kernels, allocator reserve, and Windows GPU
   accounting.
2. The measured 6,286,802,944-byte batch-one peak is credible and is the
   relevant capacity observation; model artifact size is not a VRAM ceiling.
3. Two independent model processes are rejected as the first experiment
   because they would duplicate large resident weights. One shared-model batch
   is the bounded hypothesis.
4. Shorter complete waveforms can improve first-result latency but cannot make
   sustained generation viable by themselves. Aggregate batch RTF and playback
   underruns decide sustainability.
5. Batch API availability proves only that the experiment can be expressed.
   It does not prove parallel execution, proportional speedup, ordered early
   release, or acceptable memory.
6. Generic CPU offload is primarily a capacity mechanism and normally adds
   transfers. It should not run when the only failure is speed.
7. A targeted speech-tokenizer/audio-decoder placement may reduce dedicated
   VRAM without moving the autoregressive core each step, but this is an
   unvalidated contingency requiring its own frozen identity and gates.
8. `narration-v1` remains model-independent. The scheduler may pair consecutive
   units but cannot rewrite text, semantic boundaries, or stable locator
   ranges.
9. Passing a scheduling-sustainability gate would inform the demo and later
   production design, but it would not retroactively convert failed standard
   `v3` into a passing profile.
10. The frozen short corpus uses the already implemented `narration-v1`
    expansion for supported Spanish numbers and symbols. Qwen receives only
    the resulting `narrationText`; model-specific text rewriting remains
    forbidden.
11. Both batch sizes receive the same 24 ordered units. Batch one uses 24
    calls, batch two uses 12 calls, and alternating per-pass batch order limits
    a fixed warm/thermal ordering bias without changing inputs.
12. The conditional placement is not generic Accelerate offload. It moves
    only `model.speech_tokenizer.model` and its wrapper device to CPU after
    exact CUDA load, requires every other parameter to remain on CUDA, and
    rejects disk/meta placement, an offload directory, implicit fallback, and
    Windows shared-GPU-memory paging.
13. V4 retains three conclusions because they answer different questions:
    unchanged standard machine viability, bounded scheduling sustainability,
    and one-maintainer constrained-demo usefulness. None can rescue another or
    select a production profile in this plan.
14. The installed `qwen-tts==0.1.1` implementation accepts `List[str]` for
    `text`, expands or validates parallel language/speaker/instruction lists,
    performs one model generation call, and decodes one waveform per returned
    code sequence. This proves the batch can be expressed; it does not prove
    parallel execution or speedup.
15. Batch output carries no candidate-provided identity, so the adapter maps
    returned list positions to request positions and the controller validates
    the complete ordered identity set before publishing anything. A swapped
    or stale item therefore rejects the complete batch.
16. The mechanics receipt is deliberately non-promotable. The frozen raw and
    summary schemas, cancellation matrix, playback replay, memory stop, and
    cleanup evidence remain Milestone 3 hardware responsibilities; a pilot
    cannot become an official result.
17. Candidate commands cannot assume the base development group's
    `jsonschema` dependency is installed. Byte/hash/profile/corpus mechanics
    verification therefore remains standard-library-only, while closed result
    schema validation stays in the base benchmark environment.
18. GitHub squash-merged the original Milestone 1 authority commit, so the
    recorded authority object exists but is not an ancestor of merged `main`.
    The frozen validator correctly rejects an official result on that graph.
    Before hardware execution, this branch must record the unchanged
    `f6bccf7` authority commit as an ancestry-only merge parent; changing the
    frozen hash would require a new profile version.
19. The closed raw schema does not contain cold-load observations although the
    safe summary requires their p95. The implementation retains the five
    numeric load/cleanup observations in a separate content-free ignored
    sidecar, derives the p95 in the base environment, and deletes the sidecar
    with the raw journal. No authority field or reviewable private evidence is
    added.
20. Windows reports the exact reference CPU as
    `Intel(R) Core(TM) Ultra 7 255HX`, while the frozen v4 reference label
    intentionally omits trademark markers. Exact-host comparison must remove
    only `(R)` and `(TM)` plus duplicate whitespace before comparing and
    before writing the frozen raw host identity.
21. The disposable pilot's 81,788,928-byte shared-memory observation was not
    noise that the official authority could waive. The final official run
    observed 79,691,776 bytes, so the frozen zero-shared-memory rule stopped
    the matrix before performance evidence.
22. Evidence-workflow repeats used to correct derivation and host
    serialization did not become candidate retries: every bounded run used
    first attempts only, every rejected private session was deleted, and only
    the final schema-valid summary is reviewable evidence.
23. A safe stop is not a batch-performance result. Zero media makes the
    aggregate RTF, startup, playback, duration, and listening fields
    unavailable rather than passing or failing by speed.
24. Transformers represents the installed model's exact `cuda:0` device-map
    entry as a `torch.device` object. Placement verification must normalize
    that exact object without widening acceptance to CPU, meta, disk, or mixed
    entries.
25. This targeted placement cannot avoid the frozen load-time peak on the
    reference host because the authority requires an exact CUDA load before
    moving the speech tokenizer to CPU. The CPU result reproduced the full-GPU
    authoritative/framework VRAM, minimum-free-VRAM, and shared-memory values,
    so it supplies neither a capacity reduction nor a speed measurement.
26. A failed private derivation is not evidence. The authority-ancestry
    rejection deleted its session, and only the later clean-checkpoint,
    schema-valid safe summary is retained.
27. Moving one internal component to CPU after a CUDA load is not evidence
    about an independent CPU-only Qwen process. The proposed topology requires
    a new authority and separate CPU-solo admission.
28. Historical GPU RTF implies a CPU solo RTF of approximately 3.21 is the
    arithmetic break-even estimate and approximately 1.78 is the estimate for
    a combined effective RTF of 0.8. Concurrent contention can invalidate both
    estimates, so direct aggregate measurement remains authoritative.
29. A fixed number of completed sections is not a safe startup authority
    because section durations vary. ADR-0004's playable-duration gate remains
    approximately 15 seconds; section identities additionally preserve order.
30. Five minutes of 24 kHz mono float32 PCM is exactly 28,800,000 payload
    bytes. This makes a 300-second buffer technically bounded and modest beside
    model memory, but it can increase speculative work and cancellation waste.
31. A five-minute maximum does not ensure that the producer stays ahead.
    Sustainability still requires aggregate RTF below 1.0 and acceptable
    measured underruns; the maximum only limits how much valid lead may be
    retained.
32. A CUDA-enabled PyTorch wheel can remain in the unchanged isolated
    environment while the CPU process is still CPU-only. Runtime evidence is
    decisive: CUDA must be hidden before import, all parameters must be on CPU,
    PyTorch must expose zero CUDA devices, and WDDM must attribute zero
    dedicated/shared GPU bytes to that process.
33. CPU float32 is the conservative pre-result compatibility choice. It costs
    more RAM than BF16, so the authority freezes RAM and commit headroom rather
    than assuming the 4.5-GB artifact size predicts resident memory.
34. Twelve intra-op CPU threads with one inter-op thread and OS-default
    affinity leave eight logical processors for the GPU worker, controller,
    samplers, and operating system without assuming a stable P-core/E-core
    numbering scheme.
35. CPU-solo RTF at or below 3.2 is only admission. It cannot establish
    scheduling sustainability because concurrent memory bandwidth, host work,
    thermal limits, and head-of-line ordering can slow either worker.
36. The same-authority GPU-solo baseline is mandatory. Concurrent work must
    achieve aggregate RTF below 1.0, beat that baseline, and limit GPU slowdown
    to 25%; merely adding a CPU waveform does not prove useful support.
37. `v5` separately permits at most 134,217,728 bytes of GPU-worker shared
    memory because both committed `v4` results made the prior zero boundary
    observable. This does not reinterpret `v4` or permit any CPU-worker shared
    GPU allocation.
38. Reserving each active unit's hard 20-second/1,920,000-byte capacity before
    dispatch makes the 300-second and 28,800,000-byte ceilings real even while
    waveform duration is not yet known.
39. Authority ancestry is verified by content rather than a self-referential
    hard-coded commit: an official result must name a strict ancestor commit
    whose Git tree contains the exact frozen profile, corpus, and schema
    hashes.
40. Hiding CUDA only at model-load arguments is insufficient for the CPU
    worker. `CUDA_VISIBLE_DEVICES=-1` must be set before the child imports
    PyTorch, and runtime placement evidence must independently reject visible
    CUDA devices and every non-CPU tensor or device-map entry.
41. Independent blocking Qwen calls do not require a production protocol.
    Two separately spawned benchmark workers can be coordinated by a bounded
    benchmark-local thread bridge while preserving process termination and
    stale-identity rejection.
42. A completed support-worker waveform is not playable merely because it
    exists. It remains in the bounded reorder set until every earlier source
    sequence is complete; the measured wait is explicit head-of-line evidence.
43. The reviewed command receipt is deliberately non-promotable. Milestone 8
    must still collect the frozen cold-load, memory, cancellation, placement,
    cleanup, and private raw evidence and derive a schema-valid safe result.
44. Qwen's frozen `maxNewTokens: 2048` was not the cause of the concurrent
    safety stop. A closed 256-token diagnostic reproduced the failure and
    preserved the exact `commit-headroom` subcode. The two resident processes,
    rather than permitted output length, exhausted the frozen Windows commit
    reserve.

## Final validation results

Milestones 1 through 4, 6, and 7 are complete. Milestone 1 adds result-blind `v4`
authority; Milestone 2 adds development-only model-free mechanics and reviewed
execution commands; Milestones 3 and 4 execute the frozen full-GPU and
targeted-CPU arms; and Milestone 6 records their failed decision and freezes
the separate `v5` authority. Milestone 7 implements the independent
benchmark-local worker mechanics, exact CPU/GPU adapter paths, bounded replay,
and reviewed command surface. Both `v4` hardware arms stopped before usable
media on the frozen shared-memory rule. No completed milestone changes a
production contract/runtime, makes a support claim, or selects a production
profile.

Milestone 5 is not admitted. Milestone 8 is complete with a failed concurrent
hardware outcome: CPU solo passed admission, the same-authority GPU-solo
baseline completed, and the concurrent arm reached the frozen
`resource-limit` boundary. Milestone 9 is therefore not admitted. Milestone 10
remains pending to record the durable `v5` decision and close this plan, so the
plan remains active and must not yet move to `docs/plans/completed/`.

The earlier `v5` planning amendment changed documentation only. Milestone 6
now adds separately versioned authority and model-free validation, but still
adds no candidate dependency, runner, command, model load, generated audio,
raw hardware journal, official result, or product behavior.

The authority checkpoint passed:

- Prettier checks for all four new JSON authorities;
- Ruff formatting and lint for the new validator and tests;
- strict mypy for both new Python files;
- six focused model-free tests covering byte identity, schema closure, exact
  normalized-corpus arithmetic, unit/pair order, equal first-attempt counts,
  result ancestry fields, no retries, memory-before-CPU admission, private
  content rejection, and conjunctive standard/scheduling/demo conclusions;
  and
- `git diff --check`.

Repository-wide validation also passed:

- `uv run --directory services/tts --locked ruff format --check benchmarks tests`;
- `uv run --directory services/tts --locked ruff check benchmarks tests`;
- `uv run --directory services/tts --locked mypy .` over 45 source files;
- `uv run --directory services/tts --locked pytest tests -q` with 78 passing
  tests;
- `uv lock --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --check`
  with the unchanged 107-package lock;
- `pnpm.cmd check:portable` in 28 seconds, including 18 shared test files /
  175 tests, 34 EPUB test files / 555 tests, 20 desktop test files / 204
  tests, six native-WebDriver-client tests, 78 Python tests, strict type
  checks, linting, portable builds, and Python packages; and
- `pnpm.cmd check` on native Windows in 50.9 seconds with the same evidence
  plus Rust formatting, Clippy, crate tests, and the Tauri release build.

All 48 Markdown files passed the relative-link audit. `git diff --check` and
the branch-wide private-path, credential, added-artifact, raw-tree, and
premature-v4-result scans passed. The ignored raw tree contains zero files.
No official output was generated or heard. The existing Vite chunk-size
advisory remained informational.

Milestone 2 focused validation passed:

- `uv run --directory services/tts --locked ruff format --check benchmarks tests`;
- `uv run --directory services/tts --locked ruff check benchmarks tests`;
- `uv run --directory services/tts --locked mypy .` over 54 source files;
- `uv run --directory services/tts --locked pytest tests -q` with 96 passing
  tests; and
- `pnpm.cmd exec prettier --check package.json`.

The new deterministic coverage proves exact frozen call/count order, batch
sizes one and two, ordered output, whole-batch failure/stale invalidation,
zero stale publication, two-unit/one-active-batch retention, fixed timeout,
cancellation, OOM and cleanup outcomes, exact rational playback/underrun
arithmetic, repeat-stable receipts, private-input suppression, isolated
worker delivery, and one Qwen list call without candidate imports or CUDA.

Repository-wide Milestone 2 validation also passed:

- `uv lock --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --check`
  with the unchanged 107-package lock;
- the exact isolated candidate import smoke for `qwen_tts`, `torch`, and
  `torchaudio`;
- a no-hardware invalid-input `pnpm.cmd benchmark:tts:batch` smoke in the
  exact candidate environment, which returned only the fixed `input` code;
- `pnpm.cmd check:portable` in 28 seconds; and
- `pnpm.cmd check` on native Windows in 51.4 seconds, including Rust format,
  Clippy, crate tests, and the Tauri release build.

All ten changed Markdown files resolve their relative links. The changed-tree
private-path/credential scan, tracked audio/model/book/raw-artifact scan,
ignored raw-tree check, and `git diff --check` pass; the ignored raw tree
contains zero files.

Milestone 3 hardware and result validation completed on 2026-07-26:

- the non-promotable pilot completed its three excluded calls/four units with
  correct order, bounded retention, zero retries/failures, and cleanup;
- the official full-GPU arm ran from clean execution commit
  `3eb16351d2bb7e06cc16a1f1981ba757408ca6e7`, stopped on the exact
  `shared-gpu-memory` rule, and produced the schema-valid content-safe
  `short-segment-batch-result-v4.json`;
- the result records the exact five cold loads, three excluded warmups, three
  measured passes, 24 batch-one calls/units, 12 batch-two calls/24 units, 36
  failed first attempts, five cancellation records, and zero retries;
- the safe-summary SHA-256 is
  `9ce8141fa5987878ab29bf472f6f16dc3a6370dd4ffcc1141b30964914c62e32`;
- every private raw session and sidecar was deleted, the ignored v4 raw tree
  contains zero files, and no generated audio was retained.

Final Milestone 3 repository validation passed:

- Ruff formatting/lint and strict mypy over 58 source files;
- all 101 Python tests;
- the unchanged 107-package candidate lock and exact
  `qwen_tts`/PyTorch/Torchaudio import smoke;
- `pnpm.cmd check:portable` in 28.5 seconds;
- `pnpm.cmd check` on native Windows in 51.5 seconds, including Rust format,
  Clippy, crate tests, the Tauri release build, and Python package builds;
- all 58 tracked Markdown files in the relative-link audit;
- the added-private-pattern, tracked sensitive-artifact, result-hash,
  raw-cleanup, and `git diff --check` audits.

The known optional FlashAttention/SoX candidate-import warnings and Vite
chunk-size advisory remain informational. Milestone 3 is complete. Its outcome
admits Milestone 4; it does not admit Milestone 5 quality review, produce a
selection, or change production behavior.

Milestone 4 hardware and result validation completed on 2026-07-26:

- the exact committed full-GPU result hash and `shared-gpu-memory` stop
  admitted the official-only targeted-CPU identity;
- every cold, measured, and cancellation worker verified the content-free
  placement before generation: speech-tokenizer model/wrapper on CPU, all
  remaining model tensors on `cuda:0`, and no disk/meta/fallback placement;
- the authority-valid official arm ran from clean checkpoint
  `0af833179e99f542bdf4eb11c56434f780a5d6ba`, stopped on the exact
  `shared-gpu-memory` rule, and produced schema-valid content-safe
  `short-segment-batch-result-v4-cpu.json`;
- the result retains the exact five cold loads, frozen 24 batch-one calls/units,
  12 batch-two calls/24 units, 36 failed first attempts, five cancellation
  records, and zero retries without admitting media or quality review;
- its safe-summary SHA-256 is
  `d3766ae87bdebc806210d04d974081b6f79f976bf9793a184c4d021273f85234`;
  and
- successful derivation deleted the exact raw session, the ignored v4 raw tree
  contains zero files, and no generated audio was retained.

Final Milestone 4 repository validation passed on committed result/documentation
checkpoint `6f8b355`:

- Ruff formatting/lint and strict mypy over 58 source files;
- all 106 Python tests, including the exact committed CPU-result guard;
- the unchanged 107-package candidate lock and exact
  `qwen_tts`/PyTorch/Torchaudio import smoke;
- `pnpm.cmd check:portable` in 27.1 seconds;
- `pnpm.cmd check` on native Windows in 60.9 seconds, including 934
  TypeScript tests, Rust format, Clippy, crate tests, the Tauri release build,
  and Python package builds;
- all 58 tracked Markdown files and 242 relative links;
- both expected v4 summary hashes and schema validation; and
- the added-private-pattern, credential, tracked sensitive-artifact,
  raw-cleanup, branch-diff, and `git diff --check` audits.

The root suites ran from a clean detached worktree because sandbox-created
ignored pytest directories in the primary checkout had deny-style ACLs; the
clean worktree used fresh frozen offline dependencies and the exact committed
checkpoint. The known optional FlashAttention/SoX candidate-import warnings and
Vite chunk-size advisory remain informational. Milestone 4 is complete with a
failed safety outcome. Milestone 5 is not admitted. Milestone 6 records the
durable `v4` decision and freezes the independent `v5` dual-worker authority;
Milestones 7-10 own implementation, hardware execution, bounded playback
review, and final closeout.

Milestone 6 authority and repository validation completed on 2026-07-26:

- `selection-v4.md` is bound to both committed result hashes, selects neither
  placement, and reports usable media, aggregate RTF, playback, and quality as
  unavailable/not admitted rather than inventing zero-valued performance.
- final frozen SHA-256 values are
  `74148d1f86c5a12c05e412a345b2523d98eef49ffce1e81b6d9bd83a5234bcf5`
  for `profile-v5.json`,
  `e92a7700c9e264e75562fe4d4856fdefdea23e8b9494ab89f33c22fb8b6de9a6`
  for `corpus-v5.json`,
  `01b234f27f1d34d31e05c1d36f1c08b52412863030a22a8104773020b4e45775`
  for the raw schema, and
  `917860b2a577067fce4d9089c34fb6aceb938c4c882e1f94563a7d6d831359a9`
  for the safe-summary schema.
- Prettier accepted all four JSON authority files; Ruff formatting/lint passed
  over 59 Python files; strict mypy passed over 60 source files; all 117 Python
  tests passed, including eleven new v5 authority tests and the updated v4
  selection guard.
- The unchanged isolated Qwen candidate lock resolved 107 packages and passed
  `uv lock --check`.
- `pnpm.cmd check:portable` passed in a clean detached worktree in 37.4 seconds.
- `pnpm.cmd check` passed on native Windows in the same clean worktree in
  158.1 seconds, including 18 shared test files / 175 tests, 34 EPUB test
  files / 555 tests, 20 desktop test files / 204 tests, six native WebDriver
  client tests, 117 Python tests, Rust formatting, Clippy, crate tests, Python
  package builds, and the Tauri release build.
- The root suites used a clean detached worktree because the primary checkout
  retains pre-existing ignored pytest directories with deny-style ACLs. The
  initial primary-checkout failure was only Prettier's inability to scan that
  ignored directory. After the root suites, the final authority normalization
  changed only two Markdown EOF lines and their dependent content hashes;
  final JSON formatting, full Ruff/mypy/pytest, schema, and diff checks passed.
- All 60 tracked Markdown files and 257 relative links resolve. No private
  Windows/WSL path, tracked audio/model/raw artifact, ignored raw file, or
  `dual-worker-result-v5-*.json` file exists. The final branch and working-tree
  `git diff --check` audits pass.

No candidate import, model load, hardware generation, listening exercise, or
firewall change was applicable to this pre-result milestone. The known Vite
chunk-size advisory and primary-checkout pytest-cache warning remain
informational.

Milestone 7 implementation and repository validation completed on 2026-07-26:

- the benchmark mechanics checkpoint is `69a0bfb` and the documentation plus
  CPU-placement hardening checkpoint is `6f25eb2`;
- Ruff formatting and lint passed over the benchmark and test tree, strict
  mypy passed over 71 source files, all 147 Python tests passed, and the 41
  focused dual-worker/v5 authority tests passed;
- the unchanged isolated Qwen candidate lock resolved 107 packages, and exact
  `qwen-tts==0.1.1`, `torch==2.9.1+cu128`, and
  `torchaudio==2.9.1+cu128` imports passed without loading model weights;
- an invalid-input `pnpm.cmd benchmark:tts:dual-worker` smoke ran in the exact
  candidate environment, returned only the fixed `input` failure code, and
  loaded no model;
- `pnpm.cmd check:portable` passed in 41.1 seconds in a clean detached
  worktree at `6f25eb2`;
- `pnpm.cmd check` passed on native Windows in 164.0 seconds in the same
  worktree, including 18 shared test files / 175 tests, 34 EPUB test files /
  555 tests, 20 desktop test files / 204 tests, six native WebDriver-client
  tests, 147 Python tests, Rust formatting, Clippy, crate tests, Python package
  builds, and the Tauri release build;
- all 60 tracked Markdown files and 257 relative links resolve, and the
  private-pattern, tracked sensitive-artifact, ignored-raw-tree, premature-v5-
  result, and `git diff --check` audits pass; and
- no model load, CUDA/CPU inference, waveform, private raw journal, hardware
  result, listening exercise, dependency/lock change, production contract, or
  narration-v1 change occurred.

The primary-checkout portable command reached Prettier but could not scan a
pre-existing deny-ACL pytest directory under `tmp`; the clean detached
worktree removed that environmental obstruction and supplied the
authoritative passing results above. Optional FlashAttention/SoX candidate
import warnings and the existing Vite chunk-size advisory remain
informational. Milestone 7 is complete. Milestone 8 owns the first CPU-solo
pilot, every official hardware run, private raw evidence and cleanup, and
schema-valid safe result derivation.

Milestone 8 hardware and result validation completed on 2026-07-26:

- the final CPU-only pilot at clean checkpoint `4395ff7` completed both
  first attempts with aggregate RTF `3.0556705734323426` and exact zero
  dedicated/shared GPU memory;
- the official CPU-solo arm completed all eight first attempts without a retry
  or failure, produced 97.04 seconds of media at aggregate RTF
  `2.999443394476504`, passed both cancellation trials and cleanup, and derived
  schema-valid `dual-worker-result-v5-cpu-solo.json` with SHA-256
  `43ed927e2a765cf39214bc8937398c1c454993cc23bd6485596aa591fe5224a2`;
- the same-authority GPU-solo arm completed all forty first attempts without a
  retry or failure, produced 446.24 seconds of media at aggregate RTF
  `1.467080448861599`, passed both cancellation trials and cleanup, and derived
  schema-valid `dual-worker-result-v5-gpu-solo.json` with SHA-256
  `2f12e3542038ff9d7b566dc662495a08187163ecf4ccb71ad6d9601b43d64fdb`;
- the hash-bound concurrent arm at clean checkpoint `9cc9517` ran its fixed
  first-attempt matrix for 759.1 seconds and stopped at the frozen
  `resource-limit` boundary. It performed no retry, created no promotable raw
  session or concurrent result, left no worker process, restored the
  45-minute AC sleep setting, and returned the GPU to zero utilization;
- because the first implementation collapsed live safety subcodes to
  `resource-limit`, RAM/commit pressure is only an inference, not a measured
  exact cause. The runner now preserves a future exact content-free subcode,
  but the frozen authority does not permit repeating an arm that already
  reached a resource boundary on this hardware; and
- successful derivations deleted their ignored raw sessions. The final raw
  tree contains zero files, and no generated audio, model weight, book,
  credential, or private benchmark evidence is tracked.

Final Milestone 8 repository validation passed at committed checkpoint
`a8f4397`:

- Ruff formatting/lint passed, strict mypy passed over 75 source files, all
  154 Python tests passed, Prettier accepted the tracked source, and both
  committed `v5` summaries passed their frozen schema and authority checks;
- `pnpm.cmd check:portable` passed in 40.1 seconds in a clean detached
  worktree, including 175 shared, 555 EPUB, 204 desktop, six native-client,
  and 154 Python tests plus all portable builds;
- `pnpm.cmd check` passed on native Windows in 153.1 seconds in the same
  worktree, including Rust formatting, Clippy, crate tests, the Tauri release
  build, and Python package builds;
- the unchanged 107-package isolated Qwen lock passed `uv lock --check`, and
  exact `qwen_tts`, `torch==2.9.1+cu128`, and
  `torchaudio==2.9.1+cu128` imports passed without loading model weights; and
- the primary-checkout portable command was blocked only by its pre-existing
  deny-ACL pytest directory under `tmp`. The clean worktree supplied the
  authoritative passing result. Optional FlashAttention/SoX import notices and
  the existing Vite chunk-size advisory remain informational.

Milestone 8 is complete. Its failed concurrent resource outcome does not admit
Milestone 9, select a production profile, or change product behavior.
Milestone 10 remains necessary to record the durable `v5` decision and close
the ExecPlan.

The post-milestone 256-token concurrent diagnostic also passed its repository
and cleanup controls:

- checkpoint `2d84559` passed Ruff formatting/lint, strict mypy over the four
  affected source files, 25 focused tests, and all 160 Python tests;
- the exact hardware command ran only the concurrent GPU-primary/CPU-support
  arm and returned `commit-headroom` after 98.4 seconds;
- the token override is fixed at 256, cannot enter an official request, emits
  no promotable evidence, and writes no raw result; and
- post-run process, GPU, RAM/commit, sleep-restoration, raw-tree, and clean
  working-tree checks passed.

This diagnostic identifies the original safety category but does not
retroactively promote or replace the frozen failed concurrent result.
