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

- The desktop now has a development-only product narration coordinator outside
  React state. When the exact native Qwen/Serena configuration is available, it
  starts from the active visual locator, prepares bounded narration batches,
  dispatches one segment at a time through M007, transfers each accepted unit
  into the adaptive player, and mounts the accessible controls. The model-free
  default does not expose a fake narration experience. Reader highlighting and
  following remain future M009 work.
- A model-free, manually clocked adaptive scheduler state machine now proves
  M008 ordering, startup, reservation, backpressure, invalidation, release,
  failure, end-of-range, and service-recovery semantics. Milestone 3 extends
  that owner with real payload retention and a dedicated Web Audio backend,
  validated through deterministic fake-device tests. Milestone 5 connects
  these boundaries only for the exact development host; deterministic tests
  still open no device.
- Shared session, generation, audio-frame, and buffer-status contracts plus
  deterministic fakes exist.
- `@voxleaf/epub` exposes bounded locator-linked
  `OpenedPublication.prepareNarration`; the exact-demo coordinator now calls it
  from the active visual locator.
- M007 is complete. Its accepted protocol v1, bounded complete-unit service,
  native supervisor, typed `TtsProcessClient`, one-unit handoff sink, exact
  development-only adapter, packaged lifecycle evidence, and measured
  exact-host matrix are the implemented service boundary M008 must consume.
  M008 owns the product narration caller, scheduling queue, multi-unit audio
  ownership, and player. All four are now connected under the exact
  development-only availability gate.
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

The completed M007 handoff matrix adds narrower service-boundary observations:

- delivered complete units were `11.28` and `14.88` playable seconds at RTF
  `1.4247929609929078` and `1.4370292809139784`;
- command-to-first-metadata and command-to-complete-unit p95 were both about
  `21.38` seconds, confirming that the exact adapter exposes no useful audio
  before a complete unit;
- initial load plus warm required about `32.85` seconds, while explicit
  restart/prepare p95 after termination was about `16.61` seconds;
- termination p95 was about `5.70` ms, but terminating invalidates readiness
  and therefore incurs the reload cost before later work; and
- exact descendant peaks were about `4.71` GB RAM, `5.14` GB dedicated GPU
  memory, and `81.8` MB shared GPU memory.

These observations refine integration traces only. The longer `v5` aggregate
RTF remains the planning authority for depletion arithmetic.

## Scope and non-goals

### Scope

- One active GPU Qwen/Serena worker and batch size one.
- A desktop-owned narration caller that requests bounded locator-linked
  prepared segments from the active publication and releases sensitive text
  after each generation identity settles.
- Model-independent playable-duration accounting and backpressure.
- Quick-start and explicit prepared-playback state machines.
- A simultaneous 30-minute playable-audio ceiling with exact byte, frame/unit,
  metadata, and active-work bounds.
- Bounded generation continuation during playback-only pause.
- Low-water warning, involuntary buffering, estimated refill, and resume.
- Playback pause/resume/stop, volume, and an explicitly frozen supported-speed
  policy.
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
- `docs/architecture/adaptive-buffer-authority-v1.md`
- `docs/architecture/decisions/ADR-0002-in-memory-audio.md`
- `docs/architecture/decisions/ADR-0004-start-after-audio-lead.md`
- `docs/architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md`
- `docs/plans/roadmap.md`
- `docs/plans/completed/M007-local-tts-service-and-process-protocol.md`
- `docs/architecture/tts-service-protocol-v1.md`
- `packages/shared/src/contracts/`
- `packages/shared/src/testing/`
- `apps/desktop/src/tts/process-client.ts`
- `apps/desktop/src/tts/adaptive-buffer-authority.ts`
- `apps/desktop/src-tauri/src/tts_service_supervisor.rs`
- `packages/epub/src/narration/`

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
- Quick start must accumulate contiguous complete units. Because one accepted
  exact unit may contain less than 15 playable seconds, the scheduler must be
  prepared to wait for a second unit; it cannot treat dispatch, metadata, or
  elapsed wall time as playable lead.
- Recovery estimates must include the measured explicit restart/prepare cost
  after worker termination. A fast process kill is not fast model readiness.
- M007 remains one-active with no service-side work queue. M008 must own the
  only pending-work queue and dispatch at most one segment to the service at a
  time.
- A completed unit moves through `TtsProcessClient.takeAudioUnit()` into the
  M008 buffer. The buffer becomes the sole owner of that unit and must call
  `release()` after playback, invalidation, or discard. It must not retain a
  second copy or leave a unit in the client sink while dispatching later work.
- M008 must consume protocol v1 and the existing native commands without
  silently widening service framing, timeouts, permissions, retry policy, or
  candidate identity. Any required protocol change needs separately frozen
  authority rather than an incidental scheduler edit.
- Invalidating actions must make the product identity stale immediately and
  begin bounded queued-audio release. If synthesis is active, the controller
  then calls the existing identity-scoped cancellation path; if no synthesis
  is active, it uses shutdown. Later work must explicitly start and prepare a
  fresh service instance before dispatch.

## Milestones

### Milestone 1: Freeze adaptive buffer and UX authority

#### Work

- Freeze quick-start, prepared targets, low-water warning, empty-buffer,
  refill/resume, and maximum-capacity semantics before implementation.
- Freeze volume bounds and the supported playback-speed behavior, including
  whether the MVP initially supports only `1.0x` or a bounded pitch-preserving
  range.
- Freeze exact duration, byte, complete-unit/frame, metadata, active-work, and
  prepared-text retention limits.
- Freeze the single pending-work queue, `takeAudioUnit()` ownership transfer,
  per-unit release, and one-active service dispatch rules.
- Define playback-only pause, explicit stop, invalidation, and application-exit
  behavior.
- Define the active-publication narration caller, prepared-batch continuation,
  sensitive-text release, and cancel-versus-shutdown service transition.
- Define truthful progress and estimated-wait UI language.

#### Validation

- Boundary arithmetic covers exactly-at and one-over every simultaneous limit.
- The authority distinguishes generated lead, intentional waits, involuntary
  buffering, and wall-clock preparation.
- No frozen value claims implementation or guaranteed uninterrupted time.

#### Status

Complete. The model-independent authority, executable constants, exact-bound
arithmetic, ownership/lifecycle semantics, volume/speed decision, and truthful
UX language are frozen before scheduler implementation. Milestone 2 implements
only the model-free deterministic scheduler proof described below.

#### Frozen authority and actual result

- Audio remains 24-kHz mono finite float32 little-endian. Aggregate sample
  frames, not rounded unit durations, are the playable-duration authority.
- Low water is 10 playable seconds; quick start is 15 seconds; automatic
  refill/resume is one minute; prepared targets are 1, 2, 5, or 10 minutes;
  and maximum capacity is 30 minutes. Every boundary is inclusive and adds no
  fixed timer after readiness.
- The exact simultaneous audio maxima are 43,200,000 retained/reserved sample
  frames, 172,800,000 logical payload bytes, 256 complete units, and 256
  metadata entries.
- Before one synthesis dispatch, the scheduler must reserve the complete M007
  maximum of 480,000 frames, 1,920,000 bytes, one unit, and one metadata entry.
  It cannot dispatch based on an expected average result.
- Prepared-text retention is one batch, 16 total active/pending segments,
  8,192 code points, 24,576 UTF-8 bytes, and 64 sentences. There is one active
  preparation, one active synthesis, one desktop FIFO queue, and zero
  service-queued synthesis.
- `takeAudioUnit()` transfers sole ownership from the M007 sink to the future
  M008 buffer. One owner releases each payload; settled prompt references are
  dropped immediately and never copied into metrics, errors, persistence, or
  UI state.
- Playback-only pause retains the identity and may prepare quick mode to the
  one-minute refill target or prepared mode to its selected target. Explicit
  stop and every invalidating lifecycle action make work stale first, release
  owned state, then call identity-scoped cancellation when synthesis is active
  or shutdown otherwise.
- Volume is integer 0-100% gain, default 100%, in 5% UI steps. The only M008 v1
  playback rate is `1.0x`; no sample-rate reinterpretation or unsupported
  enabled speed control is permitted.
- Optional paragraph/chapter waits remain disabled by default. Only 1, 2, or 3
  seconds may later be admitted, one eligible interruptible wait at a time,
  and they remain separate from generated lead and involuntary buffering.
- [`adaptive-buffer-authority-v1.md`](../../architecture/adaptive-buffer-authority-v1.md)
  is the normative policy. The tested
  `apps/desktop/src/tts/adaptive-buffer-authority.ts` constants and arithmetic
  mirror it without implementing a queue, scheduler, player, caller, or UI.

### Milestone 2: Prove the scheduler with deterministic traces

#### Work

- Add a pure manually clocked producer-consumer scheduler.
- Exercise faster-than-real-time, measured Qwen GPU RTF, bursty completion,
  failure, and end-of-range traces.
- Model quick start and prepared targets without a model or audio device.
- Prove backpressure and exact 30-minute saturation.
- Model service cancellation as a transition to stopped followed by measured
  restart/prepare before later synthesis, not as an immediately ready worker.

#### Validation

- No stale identity contributes playable duration.
- The buffer never exceeds any simultaneous limit.
- Every accepted unit has one owner and one release; invalidation makes all
  queued units ineligible before cancel/shutdown completion.
- Reference-host RTF `1.467080448861599` produces the documented depletion
  behavior without inventing real-time output.
- Repeat runs are deterministic.

#### Status

Complete.

#### Actual result

- Added `apps/desktop/src/tts/adaptive-buffer-scheduler.ts`, a content-free,
  manually clocked producer-consumer state machine over M008 authority
  arithmetic. It models the stopped/start/unloaded/prepare/ready/generating
  service lifecycle, one active preparation, one active synthesis, zero
  service queue, FIFO segment dispatch, quick/prepared startup, refill,
  low-water, buffering, end-of-range, failure, invalidation, and replacement.
- Every synthesis dispatch reserves the full M007 20-second unit maximum before
  work starts. The same reservation function admits the exact final unit at
  43,200,000 frames/172,800,000 bytes and rejects another unit at saturation.
- The proof separates remaining playable frames from whole retained-unit
  memory. A partially consumed unit remains one retained frame/byte owner until
  completion, while only its unconsumed frames contribute playable lead.
- Metadata-only units have one scheduler owner. Playback, invalidation, invalid
  output, and stale late completion each release that owner exactly once.
  Invalidation clears eligibility and all counters before the modeled
  cancel/shutdown transition settles.
- The reference RTF `1.467080448861599` trace starts from exactly 15 playable
  seconds, observes low water, and enters buffering after 47 playback seconds.
  This matches the documented approximate 47-second depletion estimate; it is
  explicitly a deterministic planning trace, not a real-time or hardware
  claim. A separate RTF `0.5` trace remains supplied for 120 seconds while
  respecting the one-minute target.
- Explicit replacement remains stopped until separate start and prepare
  transitions complete. The deterministic recovery trace advances the manual
  clock by the measured 16.61-second restart/prepare observation before
  readiness; the scheduler does not convert that observation into a fixed
  readiness timer.

### Milestone 3: Implement bounded in-memory buffering and playback

#### Work

- Select and record the internal audio format and playback API.
- Implement bounded payload ownership outside React.
- Move each accepted unit from the M007 one-unit sink into the multi-unit
  buffer through `takeAudioUnit()`; make exactly one buffer owner responsible
  for `release()`.
- Implement consumption, discard-after-play, low/target/max backpressure,
  underrun accounting, and cleanup.
- Implement pause/resume/stop, bounded volume control, and only the frozen
  supported-speed behavior; do not obtain speed changes by silently
  reinterpreting the 24-kHz sample rate.
- Keep deterministic fakes as the first integration source.

#### Validation

- Exact capacity, frame ordering, format continuity, and stale-output tests
  pass.
- Pause/resume, explicit stop, seek/invalidation, end-of-range, and close
  release all payloads correctly.
- Volume and every admitted playback speed preserve bounded ownership, format
  continuity, and observable consumption timing.
- Generated audio is not written to disk or serialized into UI state.

#### Status

Completed on 2026-07-27.

- The scheduler now retains each transferred `TtsAudioUnit` payload as the
  sole original owner, exposes only the current ordered unit to playback, and
  keeps remaining playable frames separate from whole-unit memory accounting.
- `takeCompletedUnitFrom()` consumes the M007 `takeAudioUnit()` ownership seam.
  Stale, wrong-identity, wrong-format, non-finite, and malformed units release
  once and contribute zero playable duration.
- `AdaptivePcmPlayer` consumes exact frames, records real
  playing-to-buffering underruns, handles pause/resume/stop/seek/close,
  supports integer 0-100% gain, and rejects every rate except `1.0x`.
- Invalidation removes playback eligibility synchronously. Original payloads
  then release at most four units per scheduled cleanup turn.
- `WebAudioPcmPlaybackBackend` uses one dedicated `AudioContext`, one gain
  node, and one active `AudioBufferSourceNode`. Its necessary device copy is
  bounded to one 20-second service unit and is not another queue.
- The implementation remains unconnected to React, publication narration,
  M007 synthesis dispatch, or a real audio device.

### Milestone 4: Add adaptive preparation and accessible UI

#### Work

- Add quick-start and explicit prepared-playback controls.
- Add accessible pause/resume/stop, volume, and admitted speed controls.
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

Completed on 2026-07-27.

- Added a bounded estimator that retains only the eight latest completed
  elapsed-time/sample-frame observations, reports no estimate before current
  evidence exists, and includes the measured 16.61-second stopped-service
  restart/prepare cost without accepting narration text, identity, or audio.
- Added an interruptible semantic-boundary wait coordinator for the frozen
  `0`, `1`, `2`, or `3` second choices. Deterministic evidence distinguishes
  planned waits from buffering and proves the positive-low-lead eligibility
  gate. The default remains `0`; a nonzero default is not accepted without
  Milestone 5 exact-host listening and timing evidence.
- Added a content-free UI-state projection plus a reusable accessible React
  control surface for quick/prepared selection, explicit prepared targets,
  truthful progress/estimates, pause/resume/stop, low-buffer and buffering
  messages, integer 5% volume steps, and an explicitly disabled `1.0x`-only
  speed selector.
- Fixed scheduler action ordering so paused quick-mode preparation stops
  requesting narration batches when its one-minute continuing target is
  reached. The same pre-preparation backpressure protects independent resource
  ceilings.
- Kept narration text, PCM payloads, paths, and work identities out of React
  state and presentation diagnostics. The component is tested through
  content-free synthetic observations and remains unmounted until Milestone 5
  supplies the real product owner.

### Milestone 5: Integrate the exact one-GPU constrained demo

#### Work

- Connect the completed M007 local TTS service through protocol v1 and the
  typed `TtsProcessClient`; do not add a service-side queue or automatic retry.
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

Completed on 2026-07-27.

#### Actual result

- Added an application-level `ProductNarrationCoordinator` outside React state.
  It owns session/generation/segment identities, prepares at most one
  16-segment narration batch from the active visual locator, dispatches at most
  one synthesis, transfers sole payload ownership through `takeAudioUnit()`,
  and releases settled prompt references immediately.
- Mounted the existing accessible quick/prepared controls only when the native
  supervisor reports the exact development configuration. The default
  model-free child remains test infrastructure and cannot appear as a
  user-facing voice.
- Active-locator changes, stop, publication replacement/close, preparation
  failure, and application teardown make old work stale before cancelling the
  active identity or shutting the service down. There is no automatic retry or
  service-side queue.
- Added deterministic coordinator, process-client, native-supervisor, player,
  cancellation, preparation-abort, stale-output, privacy, and lifecycle tests.
- Added `pnpm.cmd test:tts:adaptive-exact-host`, which uses a disposable
  synthetic Spanish EPUB through the packaged application and verifies quick
  start, depletion/buffering, cancellation, prepared playback, all four
  prepared options, resource sampling, cleanup, and zero external requests.
- The corrected first complete exact-host matrix passed with quick
  command-to-audible `39,238` ms, `15,280` ms playable lead at start, one
  observed underrun, `20.91` buffering seconds per playback minute, no
  intentional wait, and identity cancellation in `160` ms. The one-minute
  prepared arm reached `66,480` playable ms after `112,895` ms. Peak process
  tree working set was `2,828,034,048` bytes and peak dedicated GPU memory was
  `4,882` MiB; the observed GPU maximum was `70` degrees Celsius and `40.13`
  watts. All 1/2/5/10-minute choices were accepted, and external requests were
  zero.
- These measurements prove the constrained exact-host demo path, not a
  standard profile, uninterrupted playback, or general hardware support. The
  default boundary wait remains zero; Milestone 6 owns the final policy
  decision.

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
- 2026-07-27: M007 Milestone 4 completed the exact Qwen/Serena adapter and
  focused host diagnostic. This does not change M008's one-GPU scheduling,
  preparation, buffer, or playback scope; M007's measured handoff matrix and
  closeout remain prerequisites.
- 2026-07-27: M007 Milestone 5 passed the first actual exact-host nine-case
  handoff matrix. Complete units arrived only after full generation; delivered
  units were `11.28` and `14.88` seconds, complete-unit p95 was about `21.38`
  seconds, and restart/prepare p95 after termination was about `16.61`
  seconds. M008 must accumulate complete units for quick start, model
  termination and readiness separately, and retain the longer `v5` RTF for
  sustained depletion arithmetic. M007 closeout remained a prerequisite at
  that point.
- 2026-07-27: M007 Milestone 6 retained ADR-0016 and protocol v1 after the
  complete implementation, dependency, permission, privacy, artifact, and
  historical-authority audit. Local portable/native/packaged validation passes.
- 2026-07-27: M007 PR #119 passed the required Ubuntu portable and Windows
  native jobs, merged to `main`, and moved to `completed/`. M008 is now the
  active implementation plan. Review of the implemented client makes its
  ownership seam explicit: accepted units move through `takeAudioUnit()` into
  one M008-owned bounded queue, and that queue releases every played, stale,
  invalidated, or discarded unit.
- 2026-07-27: Created `feat/m008-m1-buffer-ux-authority` from merged `main` at
  `eb46b4b`. Froze adaptive-buffer authority v1 before scheduler code:
  10-second low water, 15-second quick start, one-minute refill,
  1/2/5/10-minute prepared targets, exact 30-minute frame/byte/unit bounds,
  inherited narration-v1 batch retention, one active synthesis, and zero
  service queue.
- 2026-07-27: Selected `1.0x` as the only M008 v1 playback rate to avoid an
  unvalidated pitch/timing dependency. Froze 0-100% volume gain, lifecycle and
  caller ownership, prompt/audio release, conservative full-unit reservation,
  optional disabled-by-default boundary waits, and content-free truthful UI
  meanings. Added deterministic exact/max-plus-one tests without generating or
  retaining audio.
- 2026-07-27: Completed Milestone 2 on
  `feat/m008-m2-deterministic-scheduler`. Added the model-free manually clocked
  scheduler, full-unit pre-dispatch reservation, prepared-text accounting,
  complete-unit FIFO ownership/release, identity-first invalidation, explicit
  service recovery, and deterministic quick/prepared/faster/RTF/bursty/
  failure/end-of-range traces. Focused authority plus scheduler validation
  passes 26 tests; no model, audio device, payload persistence, protocol,
  dependency, capability, UI, or product caller was added. Implementation
  checkpoint `8f5aae4` and ownership-hardening checkpoint `57f3e66` retain the
  sequential code/test history.
- 2026-07-27: Final portable validation exposed pre-existing ignored
  `tmp`/Python cache trees that are owned by an earlier sandbox account and
  cannot be traversed by the normal Windows user. Formatter and linter
  traversal now excludes those already repository-ignored trees before
  scanning; the exact portable command then passes without weakening source
  coverage.
- 2026-07-27: Created `feat/m008-m3-bounded-audio-playback` from merged
  `main` at `3566c8e`. Extended the scheduler from metadata-only proof to sole
  ownership of actual complete-unit payloads, added the structural
  `takeAudioUnit()` transfer seam, exact payload validation, monotonic playback
  views, and bounded post-invalidation cleanup.
- 2026-07-27: Selected Web Audio as the dependency-free MVP playback API.
  Added the manual-clock `AdaptivePcmPlayer`, one-active-unit Web Audio backend,
  deterministic device fake, frame consumption, underrun accounting,
  pause/resume, bounded volume, `1.0x`-only rate, end-of-range, and
  stop/seek/close tests. Implementation checkpoint `29fb928` preserves the
  code/test boundary before documentation closeout.
- 2026-07-27: Created `feat/m008-m4-adaptive-preparation-ui` from merged
  `main` at `eaa26fb`. Added the content-free rolling estimator, optional
  interruptible semantic-boundary wait coordinator, adaptive UI-state
  projection, and accessible reusable quick/prepared narration controls.
- 2026-07-27: The paused-generation matrix exposed and fixed a scheduler
  ordering defect: a full continuing target could request another narration
  batch before checking backpressure. Focused controller/UI/scheduler
  validation initially passed 21 tests; the final focused matrix passes 48
  tests, desktop type checking passes, and the full desktop suite passes 268
  Vitest plus six native-driver client tests.
  Implementation checkpoint `4f0ec62` retains the code and focused evidence.
- 2026-07-27: Created `feat/m008-m5-one-gpu-demo` from merged `main`. Added the
  product coordinator, exact-development availability gate, mounted narration
  controls, one-at-a-time publication-to-M007 dispatch, sole audio ownership,
  and identity-first cancellation. Implementation checkpoint `522e066`
  preserves the product path.
- 2026-07-27: Added the packaged exact-host adaptive matrix at checkpoint
  `1c51be1`. Its first run reached real synthesis and depletion but incorrectly
  demanded recovery to `playing` while the slower-than-real-time model was
  expected to remain buffering. Checkpoint `8b4b17b` corrected the assertion to
  observe and measure that honest buffering state rather than hide it.
- 2026-07-27: The corrected exact-host matrix passed on the authoritative PC:
  quick command-to-audible `39,238` ms, start lead `15,280` ms, one underrun,
  `20.91` buffering seconds/minute, cancellation `160` ms, one-minute prepared
  lead `66,480` ms after `112,895` ms, peak working set `2,828,034,048` bytes,
  peak dedicated GPU memory `4,882` MiB, zero intentional wait, and zero
  external requests. This completes Milestone 5 while retaining the standard
  profile blocker.

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
6. First transport metadata is not playable lead for the exact candidate.
   Playable duration enters the scheduler only after the complete validated
   audio unit is accepted.
7. Worker termination can be prompt while useful recovery remains slow.
   Cancellation latency and restart/readiness latency require separate state,
   estimates, and metrics.
8. M007 completion removes the service/protocol dependency blocker. It does
   not implement any M008 behavior or remove the standard-profile blocker.
9. The existing one-unit client sink is a handoff boundary, not the playback
   buffer. `takeAudioUnit()` transfers ownership; M008 must retain no duplicate
   bytes and must invoke the unit's `release()` lifecycle.
10. The scheduler, not the Python service or native supervisor, owns pending
    narration order, low/target/max decisions, and multi-unit backpressure.
11. The roadmap's audio gate also requires a durable speed-control decision.
    M008 must either implement a bounded pitch-preserving range or explicitly
    freeze `1.0x` as the only MVP speed; changing the declared sample rate is
    not an acceptable substitute.
12. M008 v1 freezes `1.0x` as its only playback rate. A pitch-preserving range
    would add an audio-processing, timing, and dependency boundary and is not
    needed for the constrained MVP demonstration.
13. A 256-unit/metadata maximum accommodates 225 eight-second units within the
    30-minute duration cap plus count margin. A stream of shorter valid units
    may reach the independent count cap earlier; no threshold overrides
    another simultaneous limit.
14. One-minute refill is long enough to avoid repeating the measured
    approximately 15-second quick-start depletion cycle, while avoiding the
    rejected mandatory 10-minute rebuffer wait. It remains a constrained-demo
    policy, not a sustained real-time claim.
15. Remaining playable frames and retained-unit memory are different
    quantities. Partial playback reduces lead immediately, but the complete
    unit's frames and bytes remain retained for resource accounting until its
    sole owner releases it.
16. Exact-host restart/prepare time is an estimate input, not a scheduler
    timeout. Readiness still requires explicit M007 start and prepare
    completion; deterministic traces place that event after 16.61 seconds.
17. The complete-unit RTF trace reproduces the approximate 47-second quick
    depletion estimate. It does not change the accepted slower-than-real-time
    conclusion or imply uninterrupted playback.
18. `AudioBufferSourceNode` is a one-shot source, so the player creates one
    source per complete unit while retaining a single dedicated
    `AudioContext` and gain node. This preserves order without adding a second
    queue.
19. Web Audio must decode the active PCM unit into an `AudioBuffer`. That
    transient device copy is limited to one 20-second/1,920,000-byte service
    unit; the scheduler remains the sole releasable owner of the original and
    includes it in the frozen FIFO counters until playback completes.
20. Large invalidations cannot zero the 30-minute maximum in one UI turn.
    Eligibility and playable lead therefore clear synchronously, while no more
    than four stale original units are released per scheduled cleanup turn.
    Replacement is not admissible until those retained resource counters reach
    zero.
21. Preparation estimates can remain useful and private by retaining only a
    bounded window of completed elapsed-time/sample-frame pairs. Before one
    such observation exists, “Calculating preparation time…” is more truthful
    than applying the benchmark RTF as a promise.
22. A nonzero semantic-boundary wait is mechanically safe and independently
    observable under deterministic tests, but its listening benefit cannot be
    established without the exact model and playback path. M008 therefore
    keeps `0` ms as the default and defers any nonzero default decision to
    Milestone 5 evidence.
23. The accessible narration surface must not imply a working product path
    before one exists. Milestone 4 implements and tests the reusable controls
    against content-free state; Milestone 5 owns mounting them with the real
    publication, service, scheduler, and player coordinator.
24. Scheduler target backpressure must run before requesting another
    narration batch. Otherwise a playback-only pause at its target can retain
    sensitive prepared text that cannot produce useful audio.
25. Exact-host depletion is an expected constrained-demo state at the measured
    RTF. Validation must measure honest buffering instead of requiring the
    slower-than-real-time worker to recover while playback continues.
26. The exact configuration may be exposed through one content-free native
    boolean. Python paths, model paths, prompts, work identities, and audio
    remain outside React state and presentation diagnostics.
27. The exact matrix does not justify a nonzero semantic-boundary wait. The
    accepted default remains zero pending Milestone 6's policy closeout.

## Final validation results

Milestone 1 focused validation passes:

- `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-authority.test.ts`
  passes 17 tests.
- `pnpm.cmd --filter @voxleaf/desktop typecheck` passes.
- `pnpm.cmd check:portable` passes on unchanged source with repository-local
  ignored UV/temp directories after the sandbox denied the user-level UV
  cache. The gate passes Prettier, Ruff format/check, ESLint, mypy, TypeScript
  type checking, 196 shared tests, 555 EPUB tests, 237 desktop Vitest tests,
  six native-driver client tests, 233 Python tests, package/desktop/Python
  builds, and the Python wheel/source distribution.
- All 53 Markdown documents pass the local-link audit. The 12 changed files
  have zero private-path/credential-pattern or forbidden generated-artifact
  hits, and `git diff --check` passes.

Milestone 2 validation passes:

- `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-authority.test.ts src/tts/adaptive-buffer-scheduler.test.ts`
  passes two files/26 tests.
- `pnpm.cmd --filter @voxleaf/desktop typecheck`,
  `pnpm.cmd --filter @voxleaf/desktop test`, and
  `pnpm.cmd lint:typescript` pass. The complete desktop run passes 24 Vitest
  files/246 tests plus six native-driver client tests.
- The final exact `pnpm.cmd check:portable` passes Prettier, Ruff
  format/check, ESLint, mypy, every workspace typecheck, 196 shared tests, 555
  EPUB tests, 246 desktop Vitest tests, six native-driver client tests, 233
  Python tests, package/desktop/Python builds, and both Python distributions.
  The existing Vite chunk-size advisory and denied-write Pytest cache warning
  are informational; every commanded gate exits successfully.
- Eight changed Markdown files resolve all 150 relative targets. The complete
  13-file `main` delta has no binary, book, audio, model, archive, generated
  contract, credential/private-path pattern, dependency, protocol, Tauri
  capability, or persistence change; `git diff --check` passes.

Milestone 3 validation passes:

- `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-authority.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts`
  passes three files/36 tests.
- `pnpm.cmd --filter @voxleaf/desktop test`,
  `pnpm.cmd --filter @voxleaf/desktop typecheck`, and
  `pnpm.cmd lint:typescript` pass. The complete desktop run passes 25 Vitest
  files/256 tests plus six native-driver client tests.
- `pnpm.cmd check:portable` passes with task-specific writable UV and Pytest
  temp roots after the inherited user cache/temp directories returned Windows
  access-denied errors. It passes Prettier, Ruff format/check, ESLint, mypy,
  all workspace typechecks, 196 shared tests, 555 EPUB tests, 256 desktop
  Vitest tests, six native-driver client tests, 233 Python tests, and
  package/desktop/Python builds.
- The authoritative Windows `pnpm.cmd check` passes the same checks plus Cargo
  formatting, Clippy, 24 Rust tests, the release Tauri executable build, and
  both Python distributions. The existing Vite chunk-size advisory is
  informational.
- All 53 Markdown files pass a 265-relative-link audit. The complete 16-file
  Milestone 3 delta has no private-path/credential-pattern, generated-audio,
  book, model, archive, dependency, protocol, Tauri capability, persistence
  API, or binary diff; `git diff --check` passes.

Milestone 3 implements the unconnected payload queue and player without
persisting generated audio or adding a dependency, capability, protocol, model,
or private fixture. It makes no product-caller, audible-device,
continuous-output, production-profile, or general-hardware claim. Milestones
5 and 6 remain not started.

Milestone 4 validation passes:

- `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/adaptive-buffer-authority.test.ts src/tts/adaptive-buffer-scheduler.test.ts src/tts/pcm-playback.test.ts src/tts/adaptive-preparation.test.ts src/tts/AdaptivePreparationControls.test.tsx`
  passes five files/48 tests.
- `pnpm.cmd --filter @voxleaf/desktop typecheck` and
  `pnpm.cmd --filter @voxleaf/desktop test` pass. The complete desktop run
  passes 27 Vitest files/268 tests plus six native-driver client tests.
- `pnpm.cmd check:portable` passes Prettier, Ruff format/check, ESLint, mypy,
  all workspace typechecks, 196 shared tests, 555 EPUB tests, 268 desktop
  Vitest tests, six native-driver client tests, 233 Python tests, and
  package/desktop/Python builds.
- The authoritative Windows `pnpm.cmd check` passes the same checks plus Cargo
  formatting, Clippy, 24 Rust tests, the release Tauri executable build, and
  both Python distributions. The existing Vite chunk-size advisory and denied
  Pytest cache write warning are informational; every commanded gate exits
  successfully.
- All 53 Markdown files pass the 265-relative-link audit. The complete 16-file
  Milestone 4 delta has no binary, generated-audio, book, model, archive,
  build-artifact, private-path/email/credential-pattern, dependency, protocol,
  Tauri-capability, or persistence change; `git diff --check` passes.

Milestone 4 adds no dependency, shared/public protocol, Tauri capability,
model, audio fixture, book content, persistence, or network behavior. Its
React surface receives only content-free preparation state and remains
unmounted until Milestone 5 supplies the real product coordinator.

Milestone 5 validation currently passes:

- Focused coordinator, scheduler, player, controls, client, and application
  tests pass; the final focused run passes seven files/74 tests, and the full
  desktop run passes 28 Vitest files/275 tests plus six
  native-driver client tests.
- `uv lock --project
  services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --check`
  resolves the unchanged isolated 107-package lock.
- `pnpm.cmd check:portable` passes Prettier, Ruff format/check, ESLint, mypy,
  all workspace typechecks, 196 shared tests, 555 EPUB tests, 275 desktop
  Vitest tests, six native-driver client tests, 233 Python tests, and
  package/desktop/Python builds.
- The authoritative Windows `pnpm.cmd check` passes the same surface plus Cargo
  formatting, Clippy, 25 Rust tests, the release Tauri build, and both Python
  distributions.
- `pnpm.cmd test:native-startup` passes the packaged model-free lifecycle,
  local-file, reader, image, restoration, cleanup, and zero-external-request
  matrix after the product coordinator was mounted.
- `pnpm.cmd test:tts:adaptive-exact-host` passes the packaged exact one-GPU
  matrix with the measurements recorded above and zero external requests.
- All 53 Markdown documents pass the relative-link audit. The 26-file
  milestone delta has no generated audio, private book, model weight, archive,
  private-path/email/credential pattern, dependency, shared protocol version,
  Tauri capability, or persistence addition; `git diff --check` passes.

Milestone 5 introduces no dependency, shared protocol version, Tauri
capability, persistence boundary, model artifact, generated-audio fixture,
private book, or automatic retry. Required pull-request CI and the final demo
policy/plan closeout remain Milestone 6 work.
