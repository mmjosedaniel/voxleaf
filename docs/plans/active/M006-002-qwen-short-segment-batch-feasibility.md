# Prove Qwen short-segment batch feasibility

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
- `benchmarks/tts/profile-v4.json`
- `benchmarks/tts/corpus-v4.json`
- `benchmarks/tts/schemas/short-segment-batch-raw-v4.schema.json`
- `benchmarks/tts/schemas/short-segment-batch-summary-v4.schema.json`
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
or listening review. Milestone 6 must record that failed outcome without
inventing quality evidence.

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

Milestone 2 adds the narrow repository-owned `benchmark:tts:batch`
disposable-pilot command before Milestone 3. Do not substitute an ad hoc
private script for that reviewable surface.

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

## Final validation results

Milestones 1 through 4 are complete. Milestone 1 adds result-blind authority;
Milestone 2 adds development-only model-free mechanics and reviewed execution
commands; Milestone 3 executes the frozen full-GPU hardware arm; and Milestone
4 executes the admitted targeted-CPU arm. Both hardware arms stop before usable
media on the frozen shared-memory rule. No milestone changes a production
contract/runtime, makes a support claim, or selects a profile.

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
