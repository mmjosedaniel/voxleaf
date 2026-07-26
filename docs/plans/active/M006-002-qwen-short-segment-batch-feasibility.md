# Prove Qwen short-segment batch feasibility

## Relationship to Milestones 6, 6.1, and 7

Roadmap Milestone 6 is complete. Its frozen `v2` evaluation selected no viable
profile, and ADR-0013 remains the standard production authority.

Milestone 6.1 is closing the exact Qwen3-TTS 12Hz 1.7B CustomVoice/Serena
batch-one `v3` evaluation. That evaluation passed its resource, offline,
artifact, license, packaging, and cleanup gates but failed startup, sustained
throughput, zero-failure, and mid-generation cancellation gates. ADR-0014
permits the exact profile only for a bounded development demo with explicit
preparation or buffering. This plan must not modify, rerun, or reinterpret that
failed authority.

This is a separate Milestone 6.2 ExecPlan. It freezes and tests a materially
different scheduling hypothesis before results: shorter ordered audio units
and batch size two using one resident model. It is evaluation work, not the
Milestone 7 production service or Milestone 8 player.

## Goal

Determine whether the exact already-evaluated Qwen/Serena candidate can produce
ordered, bounded Spanish narration sustainably on the exact reference host
when one resident model generates two short semantic units in one shared-model
batch.

Test full-GPU execution first. If and only if batch size two cannot complete
within a predeclared VRAM safety boundary, evaluate narrowly targeted CPU
placement of the speech-tokenizer/audio-decoder component as a separate
contingency profile. Generic layer offload is not the primary path and must not
be presented as a performance optimization.

## User-visible outcome

This plan adds no production user-visible behavior.

If the evidence passes its frozen gates, VoxLeaf gains a measured scheduling
input for a later bounded demo and for Milestones 7 and 8: two ordered complete
waveforms can be produced by one shared model quickly enough to keep a bounded
playback simulation supplied. If it fails, the constrained batch-one demo
decision remains available under ADR-0014, while continuous-playback and
production claims remain blocked.

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

### Non-goals

- Run two model processes or duplicate model weights on the GPU.
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

## Relevant files and documentation

- `AGENTS.md`
- `.agents/PLANS.md`
- `benchmarks/tts/candidates-v2.json`
- `benchmarks/tts/profile-v3.json`
- `docs/product/mvp.md`
- `docs/architecture/overview.md`
- `docs/architecture/system-diagram.md`
- `docs/architecture/performance-budget.md`
- `docs/architecture/tts-feasibility-profile-v3.md`
- `docs/architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md`
- `docs/architecture/decisions/ADR-0014-constrained-qwen-development-demo.md`
- `docs/development/dependencies.md`
- `docs/development/testing.md`
- `docs/plans/roadmap.md`
- `docs/plans/active/M006-001-local-tts-profile-blocker-resolution.md`
- `docs/plans/completed/M005-narration-text-preparation.md`
- `services/tts/benchmarks/`
- `services/tts/tests/`

Milestone 1 will name the new `v4` authority, schemas, reports, and command
surface before implementation. No batch-two hardware command exists at plan
creation time, so this plan does not present an invented command as usable.

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

Not started.

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

Not started.

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

Not started.

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

Conditional; not admitted.

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

Not started.

### Milestone 6: Record the decision and close validation

#### Work

- Produce a content-safe `selection-v4` record that distinguishes standard
  viability, scheduling sustainability, and constrained-demo usefulness.
- Amend or supersede an ADR only when the frozen evidence requires it.
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

Milestone 2 must add a narrow repository-owned batch hardware command before
Milestone 3. Do not substitute an ad hoc private script for that reviewable
surface.

Deterministic tests run without model weights or GPU hardware. Hardware work is
Windows-host-specific, outside CI, offline after artifact preparation, and
reported only for the exact host. A pilot result cannot be promoted. Raw
hardware journals and WAV files remain ignored and are deleted after a
schema-valid content-safe result is derived.

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
- A result from one 8-GiB laptop GPU cannot establish general support.
- Model-specific optimization may leak into stable narration contracts. Keep
  all pairing and candidate fields inside the benchmark boundary.

Rollback is documentation and development-benchmark only: remove unselected
`v4` code and authorities while retaining the content-safe decision evidence.
Never delete or rewrite `v2`, failed batch-one `v3`, ADR-0013, or ADR-0014.

## Progress log

- 2026-07-26: Created this separate ExecPlan instead of expanding M006-001.
  Recorded shared-model batch size two, approximately 8-20-second semantic
  units, ordered bounded playback simulation, exact VRAM/artifact arithmetic,
  and conditional targeted CPU placement as pre-result work. No runtime code,
  hardware run, generated audio, dependency, or support claim was added.

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

## Final validation results

Plan creation is documentation-only. No runtime code, benchmark authority,
hardware command, candidate lock, production dependency, hardware result,
generated audio, or support claim was added.

The documentation reconciliation passed:

- a local-link audit across all 45 Markdown files;
- a changed-scope private-path and credential-pattern audit with no matches;
- `git diff --check`;
- `pnpm.cmd check:portable` outside the sandbox in 26.4 seconds, including 18
  shared test files / 175 tests, 34 EPUB test files / 555 tests, 20 desktop
  test files / 204 tests, 6 native-WebDriver-client tests, and 72 Python tests,
  plus formatting, lint, strict type checks, portable builds, and Python
  packages; and
- `pnpm.cmd check` on the authoritative Windows host in 51.7 seconds with the
  same TypeScript/Python evidence plus Rust formatting, Clippy, crate tests,
  the native release build, and Python source/wheel packaging.

The first sandboxed portable check stopped because Prettier could not scan the
existing protected `services/tts/.pytest_cache`. The unchanged command passed
outside the sandbox; this was an environment access limitation, not a
repository validation failure. The existing Vite chunk-size advisory remained
informational.
