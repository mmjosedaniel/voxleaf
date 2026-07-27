# Build bounded adaptive prebuffering for the constrained Qwen demo

## Goal

Implement and validate a model-independent in-memory playback scheduler that
supports the exact one-GPU Qwen constrained demo without claiming real-time
generation.

The scheduler must preserve approximately 15 playable seconds as quick start,
offer explicit larger preparation targets, continue bounded generation during
a playback-only pause, warn before underrun, and never exceed a simultaneous
30-minute in-memory ceiling.

## User-visible outcome

A user can choose:

- **Quick start**, which begins when approximately 15 seconds of valid
  contiguous audio is ready; or
- **Prepared playback**, which displays an estimate and progress while building
  a selected 1, 2, 5, or 10-minute playable lead.

During playback, VoxLeaf generates later segments while capacity remains.
During a playback-only pause, valid generation may continue until the selected
target or maximum is reached. If playback approaches the generation frontier,
the UI warns first, then shows an honest buffering state if audio is exhausted.

This plan does not promise uninterrupted playback, real-time synthesis, or a
specific preparation duration.

## Current state

- The production desktop has no TTS caller, audio payload queue, player,
  preparation UI, or synchronization flow.
- Shared session, generation, audio-frame, and buffer-status contracts plus
  deterministic fakes exist.
- `@voxleaf/epub` exposes bounded locator-linked
  `OpenedPublication.prepareNarration`; the desktop does not call it.
- M007 is the active prerequisite plan for the constrained local TTS service
  and process protocol. No service stream exists yet.
- ADR-0013 selects no standard TTS profile.
- ADR-0015 permits only the exact one-GPU Qwen/Serena development-demo
  topology with bounded adaptive in-memory preparation.
- The schema-valid `v5` GPU-solo baseline produced 446.24 media seconds at
  aggregate RTF `1.467080448861599`.
- At that RTF, approximate planning arithmetic is:

| Initial playable lead | Generation time | Playback before depletion while generation continues |
| --------------------: | --------------: | ---------------------------------------------------: |
|            15 seconds |      22 seconds |                                           47 seconds |
|              1 minute |    1.47 minutes |                                          3.1 minutes |
|             2 minutes |    2.93 minutes |                                          6.3 minutes |
|             5 minutes |    7.34 minutes |                                         15.7 minutes |
|            10 minutes |   14.67 minutes |                                         31.4 minutes |

These are exact-host estimates, not accepted UX thresholds or guarantees.

## Scope and non-goals

### Scope

- One active GPU Qwen/Serena worker and batch size one.
- Model-independent playable-duration accounting and backpressure.
- Quick-start and explicit prepared-playback state machines.
- A simultaneous 30-minute playable-audio ceiling with exact byte, frame/unit,
  metadata, and active-work bounds.
- Bounded generation continuation during playback-only pause.
- Low-water warning, involuntary buffering, estimated refill, and resume.
- Optional adaptive 1-3-second waits at semantic paragraph/chapter boundaries.
- Identity-first invalidation, worker termination, stale-output rejection, and
  prompt payload release.
- Content-free performance, buffer, pause, thermal/resource, underrun, and
  cancellation measurements.

### Non-goals

- Claiming a standard production or general-hardware profile.
- Using a second CPU model, shared-model batch two, layer offload, or voice
  cloning.
- Persisting generated audio or exporting an audiobook.
- Guaranteeing 10 or 30 uninterrupted minutes.
- Hiding intentional waits or buffering from metrics.
- Changing `narration-v1`, displayed text, or locator semantics.
- Implementing word-level timing, final highlighting, or release packaging.

## Relevant files and documentation

- `docs/product/mvp.md`
- `docs/architecture/performance-budget.md`
- `docs/architecture/decisions/ADR-0002-in-memory-audio.md`
- `docs/architecture/decisions/ADR-0004-start-after-audio-lead.md`
- `docs/architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md`
- `docs/plans/roadmap.md`
- `docs/plans/active/M007-local-tts-service-and-process-protocol.md`
- `packages/shared/src/contracts/`
- `packages/shared/src/testing/`
- `apps/desktop/src/`
- `services/tts/`
- `packages/epub/src/`

Before implementation, read the completed Milestone 5 plan and preserve the
implemented narration-preparation boundary.

## Architecture and constraints

- Raw PCM or another accepted payload format must stay outside React state.
- Audio, prepared text, model output, and book contents remain local and
  memory-only.
- The 30-minute limit is simultaneous with all byte/count/work limits; duration
  alone is insufficient.
- At 24 kHz mono float32, 30 minutes equals 172,800,000 PCM bytes before
  container and metadata overhead. A different internal format must freeze its
  own exact arithmetic before implementation.
- The scheduler may retain completed audio metadata but must release sensitive
  prepared text promptly after its generation identity settles.
- Playback-only pause does not invalidate the generation identity. Explicit
  stop and every navigation, settings, book, session, or application lifecycle
  change does.
- Extra paragraph/chapter waits are scheduler events, not generated frames.
  They must remain bounded, accessible, optional, and separately measurable.
- No buffer threshold may create an unbounded queue or fixed timer after audio
  is ready.

## Milestones

### Milestone 1: Freeze adaptive buffer and UX authority

#### Work

- Freeze quick-start, prepared targets, low-water warning, empty-buffer,
  refill/resume, and maximum-capacity semantics before implementation.
- Freeze exact duration, byte, complete-unit/frame, metadata, active-work, and
  prepared-text retention limits.
- Define playback-only pause, explicit stop, invalidation, and application-exit
  behavior.
- Define truthful progress and estimated-wait UI language.

#### Validation

- Boundary arithmetic covers exactly-at and one-over every simultaneous limit.
- The authority distinguishes generated lead, intentional waits, involuntary
  buffering, and wall-clock preparation.
- No frozen value claims implementation or guaranteed uninterrupted time.

#### Status

Not started.

### Milestone 2: Prove the scheduler with deterministic traces

#### Work

- Add a pure manually clocked producer-consumer scheduler.
- Exercise faster-than-real-time, measured Qwen GPU RTF, bursty completion,
  failure, and end-of-range traces.
- Model quick start and prepared targets without a model or audio device.
- Prove backpressure and exact 30-minute saturation.

#### Validation

- No stale identity contributes playable duration.
- The buffer never exceeds any simultaneous limit.
- Reference-host RTF `1.467080448861599` produces the documented depletion
  behavior without inventing real-time output.
- Repeat runs are deterministic.

#### Status

Not started.

### Milestone 3: Implement bounded in-memory buffering and playback

#### Work

- Select and record the internal audio format and playback API.
- Implement bounded payload ownership outside React.
- Implement consumption, discard-after-play, low/target/max backpressure,
  underrun accounting, and cleanup.
- Keep deterministic fakes as the first integration source.

#### Validation

- Exact capacity, frame ordering, format continuity, and stale-output tests
  pass.
- Pause/resume, explicit stop, seek/invalidation, end-of-range, and close
  release all payloads correctly.
- Generated audio is not written to disk or serialized into UI state.

#### Status

Not started.

### Milestone 4: Add adaptive preparation and accessible UI

#### Work

- Add quick-start and explicit prepared-playback controls.
- Show playable lead, estimated preparation time, low-buffer warning,
  buffering, and resume state.
- Continue bounded work during playback-only pause and stop at the selected
  target or maximum.
- Evaluate adaptive 1-3-second semantic-boundary waits without changing
  narration text.

#### Validation

- Keyboard and assistive-technology state is complete.
- Intentional waits and involuntary buffering are distinguishable.
- Estimates update from measured production without exposing book text.
- Explicit stop and invalidation remain responsive during preparation.

#### Status

Not started.

### Milestone 5: Integrate the exact one-GPU constrained demo

#### Work

- Connect the Milestone 7 local TTS service only after its process/protocol
  boundary is implemented.
- Schedule bounded locator-linked narration segments from the active visual
  location.
- Reject incomplete, invalid, cancelled, or obsolete complete-waveform output.
- Run the exact-host quick/prepared matrix under offline and privacy controls.

#### Validation

- Report command-to-audible time, playable lead, depletion, intentional waits,
  buffering seconds/minute, underruns, memory, VRAM, temperature, power state,
  and cancellation.
- Validate 1, 2, 5, and 10-minute options without requiring all as defaults.
- One fluent Spanish maintainer may review development-demo transitions under
  ADR-0015; no standard quality claim follows.

#### Status

Not started.

### Milestone 6: Record the demo policy and close validation

#### Work

- Select default quick/prepared/refill values only from completed evidence.
- Update product, architecture, testing, setup, troubleshooting, and roadmap
  documentation.
- Run repository, privacy, artifact, deterministic, native, and exact-host
  validation.

#### Validation

- `pnpm.cmd check:portable` passes.
- `pnpm.cmd check` passes on the authoritative Windows host.
- Required pull-request CI passes.
- No model, audio, raw journal, book text, private path, secret, or unapproved
  production dependency is committed.

#### Status

Not started.

## Testing and benchmark strategy

Use existing repository commands:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
uv lock --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --check
```

Add unit tests for arithmetic and scheduler state before any audio API. Add
integration tests with deterministic audio payloads before the real model.
Hardware evaluation remains Windows/exact-host-only, offline after artifact
preparation, and content-safe.

Every test must cover valid completion, one-over-capacity, cancellation,
identity replacement, stale completion, worker crash, model timeout, buffer
exhaustion, end-of-range, pause-at-capacity, and cleanup. Performance metrics
must not contain narration text or private paths.

## Risks and rollback

- Ten prepared minutes still require approximately 14.7 minutes on the
  reference host. Keep it optional.
- Continuing during pause consumes power, creates heat, and increases
  speculative work. Stop at the target/cap and expose explicit stop.
- Intentional waits may sound unnatural or conceal poor performance. Bound and
  report them separately.
- A 30-minute duration-only cap could retain excessive frames or metadata.
  Enforce every simultaneous limit.
- Complete-waveform calls remain non-cooperative. Terminate the worker and
  reject stale output when invalidated.
- Large discarded buffers after seek may cause latency or memory spikes.
  Release payloads incrementally and test worst-case invalidation.
- If exact-host UX is unacceptable, retain quick start and reduce or remove
  prepared options without changing privacy or cancellation boundaries.

Rollback removes the constrained-demo scheduler and UI while preserving
existing visual reading, narration preparation, benchmark evidence, and
accepted no-standard-profile decision.

## Progress log

- 2026-07-26: Created this plan from the accepted `selection-v5` and ADR-0015
  decision. No production buffer, player, TTS caller, or UI behavior exists.
- 2026-07-26: Added the focused M007 service/protocol prerequisite. M008 still
  owns scheduler, player, buffer, and preparation UI behavior; its real-model
  integration waits for M007.

## Discoveries and decisions

1. A larger buffer cannot change model RTF; it exchanges preparation time and
   memory for a longer listening interval.
2. One GPU worker is preferred because the low-load two-worker diagnostic
   improved aggregate RTF only slightly and substantially slowed the GPU.
3. Ten minutes is an explicit prepared option, not a default startup or refill
   target.
4. Playback-only pause may retain the generation identity; navigation and
   lifecycle changes may not.
5. Thirty minutes is a maximum capacity that requires simultaneous duration,
   bytes, frame/unit count, metadata, and active-work limits.

## Final validation results

Not started. This plan records approved future work and makes no implementation
claim.
