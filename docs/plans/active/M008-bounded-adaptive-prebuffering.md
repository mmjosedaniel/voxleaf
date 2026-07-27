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
- M007 is complete. Its accepted protocol v1, bounded complete-unit service,
  native supervisor, typed `TtsProcessClient`, one-unit handoff sink, exact
  development-only adapter, packaged lifecycle evidence, and measured
  exact-host matrix are the implemented service boundary M008 must consume.
  M008 owns the product narration caller, scheduling queue, multi-unit audio
  ownership, and player; none exists yet.
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
UX language are frozen before scheduler implementation. Milestone 2 has not
started.

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

Not started.

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

Not started.

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

Not started.

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

The authority makes no queue, scheduler, player, product caller, audible
playback, continuous-output, production-profile, or general-hardware claim.
Milestones 2 through 6 remain not started.
