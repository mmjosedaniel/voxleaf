# Implement the local TTS service and process protocol

## Goal

Implement and validate the local service boundary required to use the exact
one-GPU Qwen3-TTS 12Hz 1.7B CustomVoice/Serena constrained-development-demo
profile from the desktop without promoting it to a standard production
profile.

The milestone must give VoxLeaf one persistent, supervised, typed, bounded,
local-only process path for model load, health, one-segment synthesis,
complete-unit PCM delivery, identity-first invalidation, worker-termination
cancellation containment, crash recovery, and shutdown. It must preserve the
existing narration, privacy, and exact candidate authorities.

## User-visible outcome

Milestone 7 is a prerequisite rather than the complete listening experience.
After it is complete:

- the native desktop boundary can start, monitor, use, recover, and stop the
  constrained local TTS service;
- one valid locator-linked narration segment can be synthesized by the exact
  local Qwen/Serena worker and delivered as bounded in-memory audio to a
  desktop consumer;
- cancellation, identity replacement, service failure, and unavailable local
  configuration produce fixed content-free state rather than stale audio or a
  frozen application; and
- the process and model remain local, and neither narration text nor generated
  audio is persisted or logged.

Milestone 7 does not add audible playback controls. M008 will consume this
service through deterministic scheduling and the bounded in-memory player.
Until then, the current user-visible product still ends at visual reading.

## Current state

- Roadmap Milestones 1 through 6.2 are complete.
- `@voxleaf/epub` implements bounded, cancellable, locator-linked
  `OpenedPublication.prepareNarration` batches. The desktop has no production
  caller.
- `@voxleaf/shared` implements versioned session, narration-segment,
  audio-frame metadata, capability, buffer-status, and operational-error
  contracts plus runtime TypeScript decoders and deterministic fakes.
- `apps/desktop` has a minimal Tauri shell with no commands, plugins,
  capabilities, child-process supervisor, TTS client, or binary audio IPC.
- `services/tts` has a dependency-free package/version scaffold, schema
  conformance tests, and development-only benchmark modules. It has no
  production service loop, engine adapter, process protocol, inference, or
  audio payload output.
- The exact `qwen3-tts-1-7b-customvoice-cuda-bf16-v1` identity is frozen by
  `profile-v3.json`: Qwen3-TTS 12Hz 1.7B CustomVoice revision
  `0c0e3051f131929182e2c023b9537f8b1c68adfe`, `qwen-tts==0.1.1`,
  PyTorch/Torchaudio `2.9.1+cu128`, CUDA bfloat16/SDPA, Serena, Spanish, the
  frozen instruction and generation settings, batch size one, and no
  automatic retry.
- The Qwen API returns a complete waveform. The accepted prototype proved
  complete-unit delivery, identity-first stale rejection, and worker
  termination within a two-second bound. It did not prove native waveform
  streaming or cooperative model cancellation.
- `selection-v5` rejects CPU-only and dual-worker scheduling. ADR-0015 retains
  only one exact GPU worker for the constrained demo.
- M008 is approved but not implemented. Its real-model integration explicitly
  depends on this service/process boundary.
- ADR-0013 still selects no standard production TTS profile. Model/runtime
  distribution, general hardware support, CPU fallback, continuous playback,
  and production graduation remain blocked.

## Scope and non-goals

### Scope

- One native-desktop-owned local service boundary.
- One exact Qwen/Serena CUDA worker and batch size one.
- A versioned protocol separate from shared payload-schema versions.
- Strict control-message and binary-payload framing with size checks before
  allocation.
- Reuse of the existing session, generation, segment, locator-range,
  audio-frame, capability, and operational-error identities.
- One active synthesis request and no hidden unbounded service queue.
- Complete-waveform validation followed by bounded PCM transport framing.
- Model-free fake service/engine coverage in portable CI.
- Native Rust supervision and a typed desktop client boundary.
- Identity-first invalidation followed by bounded process-tree termination
  when the model call cannot stop cooperatively.
- Content-free lifecycle, timing, resource, failure, and cancellation
  observations.
- Exact-host Windows/CUDA validation using verified local artifacts in offline
  mode.
- An ADR that records transport, framing, local exposure, supervision,
  backpressure, capability semantics, and cancellation containment before the
  milestone completes.

### Non-goals

- Claiming a passing standard, production, compatibility, CPU-fallback,
  sustainable, or general-hardware profile.
- Native model streaming. Transporting a completed waveform in frames must not
  be described as incremental model output.
- Cooperative mid-generation model cancellation. The accepted containment is
  identity invalidation plus worker termination.
- A second model process, CPU support worker, shared-model batch two, layer
  offload, FlashAttention, voice cloning, reference audio, reference
  transcripts, Whisper, VAD, or energy-based repair.
- Automatic retries, speculative duplicate requests, candidate-specific text
  rewriting, or changing `narration-v1`.
- Quick-start, prepared-playback, buffer refill, playback-only pause policy,
  AudioWorklet/player integration, volume, speed control, or underrun policy.
  M008 owns them.
- Highlighting, reader following, shared visual/playback progress, or seek
  interaction. Milestone 9 owns them.
- Persisting narration text or generated audio.
- Bundling Python, CUDA, model weights, or an installer; downloading or
  updating models; or approving redistribution. Milestone 11 and a later
  production profile decision own those concerns.

## Relevant files and documentation

### Authority and plans

- `AGENTS.md`
- `.agents/PLANS.md`
- `docs/plans/roadmap.md`
- `docs/plans/completed/M005-narration-text-preparation.md`
- `docs/plans/completed/M006-001-local-tts-profile-blocker-resolution.md`
- `docs/plans/completed/M006-002-qwen-short-segment-batch-feasibility.md`
- `docs/plans/active/M008-bounded-adaptive-prebuffering.md`
- `docs/architecture/system-diagram.md`
- `docs/architecture/overview.md`
- `docs/architecture/narration-preparation-limits-v1.md`
- `docs/architecture/tts-feasibility-profile-v3.md`
- `docs/architecture/tts-feasibility-profile-v5.md`
- `docs/architecture/decisions/ADR-0001-local-first-desktop.md`
- `docs/architecture/decisions/ADR-0002-in-memory-audio.md`
- `docs/architecture/decisions/ADR-0004-start-after-audio-lead.md`
- `docs/architecture/decisions/ADR-0006-json-schema-contract-authority.md`
- `docs/architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md`
- `docs/architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md`
- `benchmarks/tts/profile-v3.json`
- `benchmarks/tts/selection-v5.md`

### Expected implementation areas

- `packages/shared/schemas/`
- `packages/shared/fixtures/contracts/`
- `packages/shared/scripts/generate-contracts.mjs`
- `packages/shared/src/contracts/`
- `services/tts/src/voxleaf_tts/`
- `services/tts/tests/`
- `services/tts/benchmarks/adapters/qwen3.py`
- `services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/`
- `apps/desktop/src/`
- `apps/desktop/src-tauri/src/`
- `apps/desktop/src-tauri/Cargo.toml`
- `apps/desktop/src-tauri/tauri.conf.json`
- `docs/development/dependencies.md`
- `docs/development/setup.md`
- `docs/development/testing.md`

### External primary references

- [Tauri 2: Calling Rust from the frontend](https://v2.tauri.app/develop/calling-rust/)
- [Tauri 2: Inter-process communication](https://v2.tauri.app/concept/inter-process-communication/)
- [Tauri 2: Embedding external binaries](https://v2.tauri.app/develop/sidecar/)

The benchmark adapter is evidence and a reference for exact loading behavior;
production service code must not silently import benchmark command,
measurement, or raw-result behavior.

## Architecture and constraints

### Target topology to prove before accepting

```text
React process client
    -> narrow typed Tauri commands
    -> Rust-owned service supervisor
    -> bounded framed child standard input/output
    -> Python service and one exact Qwen/Serena model worker

Python complete waveform
    -> validate identity, format, finiteness, duration, and byte bounds
    -> bounded PCM transport frames
    -> Rust stale-identity and framing validation
    -> binary Tauri channel to an in-memory desktop consumer
```

The first prototype must use a Rust-owned child process over redirected
standard input/output because it creates no listening endpoint and need not
grant the renderer general shell-process access. Tauri custom commands and its
binary response/channel mechanisms are the first native/WebView IPC candidate.
A local socket or loopback WebSocket remains an explicit alternative until the
prototype measures lifecycle, binary-copy, backpressure, cancellation, and
packaged-WebView behavior.

The target topology is not accepted merely because this plan names it.
Milestone 1 must compare the credible alternatives and record the final choice
in an ADR before production-path implementation proceeds. If evidence selects
a different topology, update this plan and the system diagram before coding
against it.

### Trust and exposure boundaries

- The renderer must not receive a Python executable path, model path, artifact
  path, environment value, process ID, raw stderr, exception, or unrestricted
  process command.
- The native owner resolves development-only runtime configuration, starts
  exactly the reviewed executable and module, and exposes only narrow
  allowlisted operations.
- Prefer application-owned Rust commands over a renderer-accessible shell
  plugin. Any capability or plugin addition requires an explicit least-
  privilege review, dependency record, and native packaged test.
- The selected process transport must create no network listener. If a socket
  alternative is selected, it must be local-only, authenticated per launch,
  non-discoverable outside the application boundary, and justified over
  standard streams.
- Standard output is protocol-only. Model/library chatter must not corrupt
  framing or enter application logs. Standard error is discarded or mapped to
  fixed content-free diagnostics; it is never forwarded verbatim.
- Narration text and generated audio are sensitive process-local payloads.
  They may cross only the required local boundaries, remain memory-only, and
  be released immediately after request settlement or invalidation.

### Protocol and contract rules

- Protocol versioning is independent of `schemaVersion` in existing payload
  contracts.
- Canonical JSON Schemas remain the authority for JSON-compatible payloads.
  TypeScript, Rust, and Python consumers must validate or derive from the same
  authority rather than maintain divergent permissive DTOs.
- The protocol must define handshake, service state, load/warm, synthesize,
  cancel, health, shutdown, audio metadata/payload, completion, recoverable
  error, fatal error, and protocol-rejection behavior.
- Every synthesis and audio value carries the active session, generation, and
  segment identities. Request and frame identities must be unique within that
  work identity.
- Every variable-length field and frame length has an exact hard maximum
  checked before allocation or copy. Unknown message kinds, versions, fields,
  enum values, identity combinations, frame gaps, payload lengths, and format
  changes fail closed.
- Control messages and audio bytes use separate bounded framing. Generated
  audio must not be base64-encoded into React state or unbounded JSON.
- Backpressure is explicit. A blocked desktop consumer must stop further
  service publication without creating an unbounded Rust, Python, WebView, or
  JavaScript queue.
- The service accepts at most one active generation and does not own M008's
  future scheduling queue.

Milestone 1 must freeze exact protocol-message, string, frame, payload,
pending-write, timeout, restart, and retained-state limits before their
parsers or queues are implemented. At minimum, the constrained adapter
inherits these accepted inputs:

- at most 640 narration code points and 2,048 UTF-8 bytes per segment;
- batch size one and one active segment;
- no candidate-specific text rewriting and zero automatic retries;
- 24 kHz, mono, float32 candidate output; and
- a complete valid unit only, never partial output from a cancelled or failed
  call.

The Milestone 1 authority must decide whether the `v5` 20-second/1,920,000-byte
unit reservation becomes the service hard output limit. It must not silently
fall back to the much larger historical prototype ceiling. Exact-at and
max-plus-one tests are required for every selected dimension.

### Capability semantics

- `streamingGeneration` remains unsupported for this candidate because Qwen
  returns a complete waveform. Splitting that completed waveform for transport
  does not change the capability.
- The plan must not silently reinterpret cooperative model cancellation.
  Protocol-visible cancellation containment is identity invalidation plus
  worker termination; the capability report and protocol must distinguish that
  containment from native model cancellation.
- Hardware acceleration is an exact-host constrained-demo observation, not a
  general support claim.
- CPU fallback remains unsupported or unknown according to the existing
  contract semantics; CPU-only `v5` admission did not select a product
  fallback.

### Candidate and lifecycle invariants

- Keep the exact `profile-v3.json` candidate, model revision, artifacts,
  environment lock, Serena voice, Spanish language, instruction, sampling
  settings, `maxNewTokens: 2048`, and batch size one.
- Load only verified local artifact paths with offline environment controls and
  `local_files_only`.
- Keep one resident model for the complete frozen identity. Do not switch
  speaker, instruction, model, runtime, precision, or generation settings
  inside a live worker.
- The candidate lock remains isolated. Changing it, moving Qwen into the base
  service dependency graph, or changing the exact runtime identity requires
  explicit authority review before implementation.
- Invalidate the active identity before cancellation or shutdown acts on the
  worker. No later completion from that identity is publishable.
- If the model call cannot stop, terminate the complete worker process tree
  within the frozen bound, release IPC/audio/text state, and require a clean
  restart and model reload before accepting new work.
- A crash or protocol violation fails the active generation, rejects any
  partial audio, clears readiness, and enters a bounded recoverable or fatal
  state without an automatic synthesis retry.
- Application exit, publication replacement/close, explicit stop, seek,
  chapter/location change, voice/model/settings change, and session
  replacement remain invalidating actions. M008/M009 will own their UI and
  scheduling triggers, while this milestone owns the process containment.

### Audio and ownership boundary

- The Qwen adapter may publish only a one-dimensional, nonempty, finite,
  24-kHz mono waveform for the active identity.
- Validate sample count, duration, payload bytes, numeric finiteness, and
  format before any frame becomes visible outside the service.
- Convert or expose PCM with explicit endianness and sample format. The
  transport frame size and desktop payload owner must be frozen before
  implementation.
- A completed service unit may be framed for bounded transport, but the full
  Qwen waveform necessarily exists once inside the model worker. Track this
  peak honestly.
- Milestone 7's desktop consumer retains only what is necessary to prove
  ordering, identity, cleanup, and handoff. M008 owns the longer-lived bounded
  playback buffer and its 30-minute ceiling.
- No waveform, protocol transcript, private request, or raw service journal is
  committed or persisted.

## Milestones

### Milestone 1: Freeze service, transport, and protocol authority

#### Work

- Build a model-free prototype for the Rust-owned standard-stream child
  boundary and binary WebView delivery using repository-authored synthetic
  control and audio payloads.
- Compare standard streams with local socket and loopback WebSocket
  alternatives for exposure, framing, binary copy, cancellation, crash
  containment, backpressure, testability, and packaging.
- Freeze protocol v1 message families, lifecycle states, identity rules,
  capability semantics, error mapping, audio format, framing, endianness, and
  every size/count/time/restart/retention bound.
- Freeze the one-active/no-service-queue rule and decide the exact per-unit
  output duration/sample/byte maximum before real output is observed.
- Define native-only development runtime configuration without exposing or
  logging private paths.
- Record the accepted transport and supervision decision in a new ADR and a
  protocol authority document.
- Update this ExecPlan with exact selected values and prototype results before
  starting Milestone 2.

#### Validation

- All parsers reject an over-limit length before allocation.
- Exact-at and max-plus-one cases exist for every frozen variable dimension.
- The fake child cannot make stale or malformed output eligible.
- Process exit, partial frame, blocked consumer, timeout, and cancellation are
  deterministic and content-free.
- The ADR distinguishes complete-waveform generation from transport framing
  and worker-termination containment from cooperative cancellation.
- Packaged WebView evidence proves the selected native/frontend binary path
  before the transport is accepted.

#### Status

Not started.

### Milestone 2: Add canonical protocol contracts and a model-free Python service

#### Work

- Add closed canonical protocol schemas and fixtures under
  `packages/shared`, referencing existing payload families where applicable.
- Extend deterministic generation and conformance so TypeScript, Python, and
  Rust boundaries cannot accept different protocol values.
- Implement the dependency-minimal Python protocol decoder/encoder, lifecycle
  state machine, bounded input/output owners, and service loop.
- Add a deterministic fake engine that models load, warm, complete-waveform
  generation, failure, timeout, late completion, cancellation, and cleanup
  without model libraries, CUDA, an audio device, or private content.
- Reject malformed, unsupported, oversized, out-of-order, concurrent, and
  stale requests before they affect service state.
- Ensure no exception, text, audio, path, environment value, or raw frame
  enters a returned error or diagnostic.

#### Validation

- Shared fixture conformance passes in every consuming language.
- Fragmented reads, coalesced reads, truncated frames, invalid lengths,
  unsupported versions, unknown fields, duplicate IDs, sequence gaps, and
  format changes fail closed.
- One active request is accepted; concurrent or queued work is rejected with a
  fixed content-free outcome.
- Fake generation proves complete-unit delivery, backpressure, cancellation,
  stale suppression, crash, restart, and deterministic cleanup.
- Portable checks do not import Qwen, Torch, CUDA, or candidate artifacts.

#### Status

Not started.

### Milestone 3: Implement native supervision and the typed desktop client

#### Work

- Add the smallest Rust dependencies and Tauri command surface justified by
  the accepted ADR; update the dependency inventory and lockfiles.
- Implement the native service supervisor, framed standard-stream reader and
  writer, process-tree termination, state ownership, timeout handling,
  restart policy, and application-exit cleanup.
- Keep child execution and private runtime configuration native-owned. Do not
  expose a general shell API to the renderer.
- Implement the typed TypeScript process client and binary in-memory audio
  sink outside React state.
- Bind every request and returned frame to the active session, generation, and
  segment identity before accepting payload bytes.
- Map all native/service failures to fixed shared or protocol errors.
- Integrate only the model-free fake service first.

#### Validation

- Rust tests cover start-once, concurrent start, handshake, health, write
  backpressure, fragmented reads, process exit, forced termination, restart,
  shutdown, and descendant cleanup.
- Desktop tests cover typed decoding, active/stale classification, exact frame
  ordering, bounded payload ownership, cancellation, close, and release.
- A packaged native fake-service matrix proves startup, binary delivery,
  cancellation, crash recovery, full application exit, zero external
  requests, and no private data in output.
- The existing visual reader works when TTS configuration is absent.

#### Status

Not started.

### Milestone 4: Integrate the exact one-GPU Qwen/Serena adapter

#### Work

- Implement a service-owned adapter for the exact frozen Qwen/Serena identity,
  reusing the benchmark's verified loading rules without importing benchmark
  command or result behavior.
- Preserve the isolated candidate lock and verify distribution/runtime/model
  versions plus artifact hashes before load.
- Force offline/local-only operation and keep model/runtime paths out of the
  renderer, command line, logs, errors, and committed artifacts.
- Load one resident CUDA bfloat16/SDPA model with the frozen speaker,
  instruction, settings, and batch size one.
- Accept one bounded `NarrationSegmentV1`, validate one complete waveform, and
  emit bounded PCM transport frames only after the complete unit passes every
  identity, format, finiteness, duration, and byte gate.
- Implement identity-first cancellation, bounded process-tree termination,
  stale-output rejection, cleanup, and clean reload after termination.
- Add a reviewed, content-safe exact-host diagnostic entry point to the
  repository command surface before running it. Record the actual command in
  this plan once it exists; do not reuse a private ad hoc command.

#### Validation

- Model-free adapter tests mock Qwen/Torch and cover every exact identity,
  version, artifact, provider, format, output, timeout, failure, and cleanup
  branch.
- The candidate environment lock remains byte-consistent unless a separately
  approved authority change is recorded first.
- No default/portable test imports or loads Qwen/Torch.
- Exact-host execution proves one resident model, one active request, zero
  automatic retries, valid complete-unit output, bounded frame delivery, and
  zero stale publication after termination.

#### Status

Not started.

### Milestone 5: Validate the constrained service handoff on the exact host

#### Work

- Run a repository-authored synthetic neutral/Spanish service matrix through
  the real native supervisor and exact Qwen worker with outbound blocking and
  verified local artifacts.
- Measure service start, model load/warm, command-to-complete-unit,
  command-to-first-transport-frame, media duration, RTF, RAM, VRAM, frame-copy
  overhead, backpressure, cancellation, cleanup, and restart.
- Exercise before-dispatch, accepted-before-output, mid-generation,
  after-complete-before-delivery, blocked-consumer, crash, and application-exit
  invalidation.
- Verify audio format and bounded handoff in memory, then discard it. Do not
  play or persist it in this milestone.
- Record content-safe exact-host evidence and update M008's integration
  assumptions without changing historical `v3`/`v5` results.

#### Validation

- Every first attempt is preserved; no automatic retry hides a failure.
- Every accepted unit is complete, ordered, identity-correct, within the
  frozen bounds, and released after handoff.
- Every invalidated, malformed, failed, timed-out, or stale unit contributes
  zero publishable frames.
- Identity invalidation precedes termination; termination, descendant cleanup,
  RAM/VRAM release, and next clean load satisfy the frozen bounds.
- The service opens no listener or external connection, and the exact worker
  completes under the required outbound block.
- Content-safe evidence contains no narration text, waveform, path, exception,
  environment value, process command, secret, or private identity.
- Results are described only as constrained exact-host service evidence, not
  playback, native model streaming, sustainability, or production support.

#### Status

Not started.

### Milestone 6: Record the protocol decision and close validation

#### Work

- Reconcile the ADR, protocol authority, product documentation, architecture
  overview, canonical system diagram, setup, dependency inventory, testing
  guide, roadmap, M008 handoff, and this ExecPlan with actual implementation
  evidence.
- Mark only implemented service/process nodes and arrows as implemented.
- Review the complete diff for unrelated behavior, broad native permissions,
  unbounded queues, path leakage, private data, generated audio, model
  artifacts, raw journals, and benchmark-authority changes.
- Run focused, portable, native Windows, packaged WebView, privacy, artifact,
  and exact-host validation.
- Commit at logical checkpoints and require pull-request CI before moving this
  plan to `completed/`.

#### Validation

- `pnpm.cmd check:portable` passes.
- `pnpm.cmd check` passes on the authoritative native Windows host.
- `pnpm.cmd test:native-startup` passes with the fake-service lifecycle
  additions.
- `uv lock --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --check`
  passes.
- Required pull-request Ubuntu portable and Windows native jobs pass on the
  exact final implementation head.
- No book, narration text, audio, model weight, raw journal, secret, private
  path, broad process permission, or unapproved production dependency is
  committed.

#### Status

Not started.

## Testing and benchmark strategy

Use deterministic layers before hardware:

1. pure protocol arithmetic, schema, framing, lifecycle, and identity tests;
2. Python fake-engine/service process tests;
3. Rust supervisor and framed-I/O tests against a disposable fake child;
4. TypeScript client and bounded in-memory sink tests;
5. packaged WebView fake-service lifecycle tests;
6. mocked exact-adapter tests; and only then
7. exact-host Qwen/Serena service validation under offline/privacy controls.

Existing repository commands available at plan creation are:

```powershell
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/desktop test
uv run --project services/tts --locked pytest services/tts
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm.cmd test:native-startup
pnpm.cmd check:portable
pnpm.cmd check
uv lock --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --check
```

Milestone 4 must add and document a narrow exact-host service command before
using it. Update this section with that exact checked-in command and its safe
input/output contract; do not invent or run an unreviewed ad hoc invocation.

Default and CI validation must remain model-free and hardware-free. Exact-host
validation runs only on native Windows with the frozen candidate environment,
verified local artifacts, offline variables, outbound blocking, enough
resource headroom, and ignored ephemeral output. Hardware results never replace
deterministic correctness tests.

Every relevant layer must cover:

- exact-at and max-plus-one input, control-frame, audio-frame, payload,
  pending-write, and retained-state bounds;
- unsupported protocol/payload versions and unknown fields;
- fragmented, coalesced, truncated, duplicated, reordered, and malformed
  frames;
- load, ready, generation, completion, cancellation, crash, restart, shutdown,
  and application-exit lifecycles;
- stale session, generation, segment, request, and frame identities;
- blocked consumers and backpressure without queue growth;
- cancellation before dispatch, during complete-waveform inference, after
  completion, and during delivery;
- cleanup after success, failure, timeout, termination, and protocol
  rejection; and
- privacy canaries proving that content and private paths never enter logs,
  errors, metrics, snapshots, fixtures, or committed results.

## Risks and rollback

### Risks

- The complete-waveform API can delay all audio until an 8-16-second semantic
  unit finishes and cannot stop cooperatively.
- Worker termination unloads the model, so cancellation may require another
  long cold load before useful work resumes.
- Tauri/WebView binary IPC may copy large payloads or apply backpressure
  differently in browser tests and packaged WebView2.
- Child standard streams can deadlock if output, error, and control ownership
  are not separated and drained correctly.
- A malformed length prefix can cause excessive allocation unless it is
  rejected before reading payload bytes.
- Rust, TypeScript, and Python may diverge on integer, version, enum, or
  unknown-field semantics without canonical fixtures.
- Library/model output or stderr may contain private paths or text if forwarded
  without redaction.
- Qwen/Torch dependencies are large and platform-coupled. The existing
  isolated environment is acceptable only for the development demo; moving it
  into production or distribution is a separate decision.
- A development runtime path can become a hidden user requirement if the
  absent-configuration state is not explicit and tested.
- Exact-host success cannot establish general hardware support, sustainable
  playback, or installer viability.

### Rollback

Each layer must remain removable behind the new process-client boundary:

- remove the exact Qwen adapter while retaining protocol/fake evidence;
- remove native service activation while preserving the current visual reader
  and narration-preparation package;
- remove the protocol additions only if no later persisted or cross-process
  consumer has shipped; and
- retain all completed M005/M006 evidence, ADR-0013, ADR-0015, and M008's
  model-independent scheduler plan.

Rollback must terminate active workers, remove any new least-privilege native
capability, and leave no generated audio, private configuration, or model
artifact behind.

## Progress log

- 2026-07-26: Created this ExecPlan after M006-002 and PR #112 completed.
  Reconciled current-state product, architecture, setup, testing, roadmap,
  active-plan, and canonical system-diagram documentation. No TTS runtime,
  process protocol, native command, model integration, or audio behavior was
  implemented by this planning change.
- 2026-07-26: Completed planning-only validation. Markdown formatting, local
  links, privacy patterns, diff hygiene, the candidate lock, portable checks,
  and the full native Windows root check pass. Initial sandbox attempts reached
  tool-cache/temp-directory ACL failures; rerunning with ignored
  workspace-local uv and pytest temp directories passed without a source
  change.

## Discoveries and decisions

1. Milestone 7 is unblocked only for the exact ADR-0015 constrained demo.
   ADR-0013 still blocks a standard production profile.
2. M007 must precede M008's real-model integration. M008 may still prove its
   model-independent scheduler and player with fakes.
3. The exact Qwen API is complete-waveform. PCM transport frames are not
   evidence of native model streaming.
4. Cancellation means identity-first invalidation and bounded worker
   termination, not cooperative interruption of the Qwen generation call.
5. One service-side active request and no hidden scheduling queue keep
   ownership clear. M008 owns later bounded scheduling and buffering.
6. Rust-owned standard streams plus narrow Tauri commands/binary channels are
   the first prototype because they avoid a listening endpoint and a
   renderer-accessible general shell capability. Milestone 1 evidence and an
   ADR must accept or replace that direction.
7. The historical prototype allowed a much larger output than the later `v5`
   short-unit authority. Milestone 1 must explicitly choose the service output
   maximum; it should evaluate the `v5` 20-second/1,920,000-byte reservation
   rather than inherit the old ceiling accidentally.
8. The exact candidate lock and artifacts remain development-only and
   isolated. This plan does not approve production dependency promotion,
   redistribution, or automatic model acquisition.

## Final validation results

Planning-only validation completed on 2026-07-26:

- `pnpm.cmd exec prettier --check` over all 14 changed Markdown files passes.
- A read-only relative-link check over all 14 changed Markdown files reports
  that every local target exists.
- A content/privacy scan reports no private path, email, obvious credential,
  or private-key marker in the changed documentation.
- `git diff --check` passes.
- `uv lock --project services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --check`
  passes and resolves the unchanged 107-package lock.
- `pnpm.cmd check:portable` passes using ignored workspace-local uv and pytest
  temp directories. TypeScript, Python, shared, EPUB, desktop, and build
  validation all pass, including 175 shared tests, 555 EPUB tests, 204 desktop
  Vitest tests, 6 native-driver client tests, and 161 Python tests.
- `pnpm.cmd check` passes under the same local cache/temp isolation. Rust
  formatting, Clippy, tests, release executable build, and the portable
  validation surface all pass.

The first sandboxed attempts failed only because uv and pytest could not access
pre-existing user cache/temp directories, and one unrestricted attempt could
not scan a sandbox-owned ignored temp directory. No repository source or test
failed; the isolated reruns above are authoritative for this planning change.

All implementation milestones remain not started. This documentation-only
result makes no runtime, playback, production, native-model-streaming, or
general-hardware claim.
