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
- `apps/desktop` now has the M007 Milestones 1-6 Rust-owned standard-stream
  transport, native supervisor, narrow typed commands, one-unit desktop
  client, model-free child, and native-only exact-service activation. It adds
  no plugin, general process capability, or listener.
- `@voxleaf/shared` now also owns the closed protocol-v1 control schema,
  fixtures, generated TypeScript predicate, and generated offline Python
  schema registry. Rust, Python, and TypeScript conformance tests consume that
  one authority.
- `services/tts` now has the bounded protocol decoder/encoder, lifecycle
  service loop, common one-active engine boundary, deterministic fake engine,
  and exact Qwen/Serena adapter. The exact adapter verifies the frozen
  candidate runtime, revision, major artifacts, CUDA/bfloat16 provider,
  voice, instruction, generation settings, and complete waveform before
  publication. The desktop still has no product narration caller or playback.
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

Complete. The deterministic Rust-owned standard-stream and binary-response
prototype, transport comparison, frozen protocol authority, accepted ADR,
release parent/child evidence, and packaged WebView2 binary-response evidence
all pass. Milestone 2 is also complete; this milestone remains the accepted
transport foundation for that implementation.

#### Selected authority and actual result

- Protocol version: `1`.
- Frame header: 12 bytes with ASCII `VLTP`, big-endian unsigned 16-bit version,
  one-byte kind, zero flags, and big-endian unsigned 32-bit payload length.
- Record kinds: control JSON (`1`) and raw PCM audio (`2`).
- Maximum control payload: 16,384 bytes.
- Maximum narration request: 640 Unicode code points and 2,048 UTF-8 bytes.
- Maximum identifier: 128 Unicode code points and 512 UTF-8 bytes.
- Audio: 24,000-Hz mono finite IEEE-754 float32 little-endian, one complete
  record, at most 20 seconds, 480,000 samples, or 1,920,000 bytes.
- Ownership: one active synthesis, zero queued synthesis requests, one pending
  control write, one pending audio write, one retained native unit, and one
  retained renderer unit.
- Recovery: zero automatic synthesis retries and zero automatic process
  restarts.
- Timeouts: handshake 5 seconds; load, warm-up, and synthesis 120 seconds each;
  health 2 seconds; identity-invalidation settlement 500 milliseconds;
  worker/process-tree termination 2 seconds; graceful shutdown and final
  cleanup 5 seconds each.
- Transport: a Rust-owned redirected-standard-stream child with no listener,
  discarded standard error, and a narrow Tauri optimized binary `Response`.
  Local socket and loopback WebSocket alternatives were rejected for version 1.
- The model-free child emits 4,800 deterministic finite samples (19,200 bytes)
  only after fixed identity-bearing metadata. Rust validates the complete unit;
  TypeScript validates the resulting `ArrayBuffer` and retains only a
  content-free observation.
- The release executable's native host diagnostic completes with exit code
  zero. The ordinary release application remains alive during a bounded direct
  startup observation. The packaged native smoke also passes the child
  exchange, optimized binary response, exact frontend validation, existing
  application matrix, and zero runtime-error/external-request assertions.
- [`tts-service-protocol-v1.md`](../../architecture/tts-service-protocol-v1.md)
  is the frozen implementation authority.
  [ADR-0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md)
  is accepted.

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

Complete.

#### Actual result

- Added one closed `tts-protocol-control/v1` canonical schema with all seven
  native-to-service and eight service-to-native control kinds. It references
  the existing narration, audio-frame, capability, and operational-error
  families; raw PCM remains a separate kind-2 frame.
- Added valid fixtures for every kind plus invalid unknown-field, protocol,
  and message-kind cases. The shared generator now emits the standalone
  TypeScript validator and a committed offline Python schema registry. Rust,
  Python, and TypeScript tests consume the same fixtures.
- Added strict TypeScript and Python decoding beyond structural schema checks:
  exact Unicode/UTF-8 bounds, nested narration identity, audio metadata
  arithmetic, closed reason/error mappings, duplicate-key and non-finite JSON
  rejection, deep immutable accepted values, and fixed unsupported-versus-
  malformed outcomes.
- Added `voxleaf_tts.protocol`, `voxleaf_tts.fake_engine`, and
  `voxleaf_tts.service`. The binary service entry point implements
  handshake/load/warm/ready/generate/cancel/stopped/failed/shutdown, one active
  synthesis, zero queue, bounded frame ownership, metadata-before-audio
  ordering, identity-first cancellation, late suppression, zero automatic
  retry, and deterministic cleanup.
- Fake outcomes cover success, pending work, late completion, failure,
  timeout, crash, non-finite output, and oversized output. The fake retains no
  narration text, loads no model/device library, opens no listener, writes no
  log, and emits only protocol bytes on standard output.
- `jsonschema` and `referencing`, already present in the locked development
  graph, are explicit base-service runtime dependencies solely for offline
  canonical validation. No model, Torch, CUDA, audio-device, or network
  dependency was added.
- At the Milestone 2 checkpoint, native supervision and desktop consumption
  remained open. Milestone 3 now closes those model-free boundaries; real Qwen
  inference remains Milestones 4-5 work.

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

Complete on 2026-07-27. The implementation is deliberately model-free: the
native supervisor currently starts a repository-authored Rust protocol child,
while the separate Python service remains independently validated protocol
evidence. The exact Qwen/Serena child replacement is Milestone 4.

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

Complete on 2026-07-27.

#### Actual result

- Added the service-owned `QwenSerenaTtsEngine` behind the existing protocol
  state machine. It imports no benchmark command, measurement, or result
  behavior and keeps the base service dependency graph model-free.
- The adapter byte-matches its frozen constants against `profile-v3.json`,
  verifies Python 3.12 plus exact `qwen-tts`, PyTorch, and Torchaudio versions
  from the isolated candidate environment, verifies both major artifact
  hashes/sizes and Hugging Face revision receipts, and checks the local model
  configuration before importing Qwen or Torch.
- Load uses exactly one `cuda:0` bfloat16/SDPA
  `Qwen3TTSModel.from_pretrained(..., local_files_only=True)` instance.
  Warm-up and synthesis use Serena, Spanish, the frozen instruction, batch
  one, and the exact sampling and 2,048-token settings. Model/library standard
  output is discarded while protocol standard output remains framing-only.
- The adapter converts only one nonempty one-dimensional finite waveform to
  little-endian float32 and enforces 24 kHz mono, 20 seconds, 480,000 samples,
  and 1,920,000 bytes before the existing service and Rust layers independently
  validate it again.
- Native activation requires exactly the three frozen development keys. Rust
  canonicalizes the exact candidate interpreter and model root, byte-verifies
  the unchanged candidate lock, supplies only the locked base service
  validation packages through the private child import path, strips the
  development keys from the child, sets offline controls, discards stderr, and
  exposes no path or process command to the renderer.
- Default and portable execution remain on the model-free child and do not
  import Qwen or Torch. Missing or mismatched exact configuration returns only
  the fixed unavailable outcome.
- Added the reviewed `pnpm.cmd test:tts:exact-host` command. Its first execution
  under the interpreter-bound outbound firewall rule passed: release build,
  exact load/warm, valid complete-unit delivery, concurrent-request rejection,
  identity-first process-tree termination with zero returned stale audio,
  explicit clean reload, another valid unit, and shutdown all completed
  without an automatic retry.

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

Complete on 2026-07-27. The result-blind authority was committed before the
runner, and the first actual nine-case exact-host matrix passed without an
automatic or diagnostic model retry.

#### Frozen matrix authority

- The exact `profile-v3` candidate, isolated lock, protocol v1 limits, Serena
  voice, Spanish language, batch size one, 2,048-token ceiling, zero retry,
  and zero automatic restart remain unchanged.
- The repository-authored corpus has three bounded synthetic Spanish inputs:
  one neutral-normalization unit and two Spanish-normalization units. It
  contains no book or user content.
- The ordered first-attempt matrix has nine cases: cold neutral success, warm
  Spanish success, blocked-consumer rejection before dispatch,
  before-dispatch invalidation, after-complete-before-delivery invalidation,
  accepted-before-output cancellation, one-second mid-generation
  cancellation, child crash during generation, and application exit during
  generation.
- Successful units must be complete, finite, identity-correct 24-kHz mono
  float32-le payloads within 20 seconds and 1,920,000 bytes. Every other case
  must publish and deliver zero audio units.
- Required cancellation, crash, and exit cases terminate the exact process
  tree. Cancellation and crash cases that declare a restart must then pass an
  explicit start/load/warm cycle; no operation is retried automatically.
- The frozen clocks and observations are Windows monotonic timing, 50-ms
  process-tree RAM sampling, 1,000-ms WDDM dedicated/shared GPU sampling,
  validated audio metadata as the first transport frame, complete
  audio/completion/ready as the unit boundary, move plus final validation as
  the native frame handoff, and nearest-rank p95.
- The result schema permits only content-free case outcomes, timings, aggregate
  resources, zero-after-cleanup observations, privacy flags, and explicitly
  narrow conclusions. It cannot contain narration text, waveform/audio bytes,
  paths, environment values, process identifiers, exceptions, commands,
  private identities, production selection, or general-hardware claims.
- [`service-handoff-profile-v1.json`](../../../benchmarks/tts/service-handoff-profile-v1.json)
  and its
  [`result schema`](../../../benchmarks/tts/schemas/service-handoff-result-v1.schema.json)
  are the pre-result authority.

#### Implementation checkpoint

- A separate hidden release-host mode consumes the frozen profile at compile
  time and drives the existing exact `TtsServiceSupervisor`. The public Tauri
  command set and protocol-v1 controls are unchanged.
- The supervisor now exposes internal measured forms of the existing prepare
  and synthesis operations. They retain the same behavior while recording
  load, warm, command-to-audio-metadata, command-to-complete-unit, and
  move-plus-final-validation durations.
- The hidden host owns a one-unit diagnostic consumer. It zeroes released or
  stale bytes, rejects a second dispatch while one exact unit is retained, and
  emits only closed phase and numeric result events. No narration text,
  waveform, path, process identity, exception, or command is emitted.
- The separate base-service runner verifies the existing interpreter-bound
  outbound firewall rule, launches the release host, samples descendant RAM
  every 50 ms and WDDM dedicated/shared GPU memory every 1,000 ms, observes
  bound/external network endpoints without reporting process identities, and
  requires zero descendants after every termination.
- The runner derives nearest-rank p95 values, validates the closed result
  schema, and writes only one content-safe JSON object to standard output. It
  retains no raw journal, text, audio, path, process identity, or exception.
- The reviewed command is:

  ```powershell
  $env:VOXLEAF_TTS_DEV_ENABLED = "1"
  $env:VOXLEAF_TTS_DEV_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe").Path
  $env:VOXLEAF_TTS_DEV_MODEL_ROOT = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
  pnpm.cmd test:tts:handoff-host
  ```

  It is Windows/CUDA-only, requires the existing outbound firewall block, and
  is excluded from portable/default checks and CI.

#### Actual result

- The first command invocation stopped at a runner-only firewall-preflight bug
  after the release build and before native/model launch. That non-hardware
  outcome is retained in the progress log. After the isolated preflight fix
  was committed, the first actual matrix attempt passed all nine cases with
  `attemptOrdinal: 1` and `automaticRetries: 0`.
- Service handshake/start took `466.8994` ms. Initial model load took
  `27,290.1872` ms and warm-up took `5,564.7553` ms. Explicit
  start/load/warm after termination had a p95 of `16,609.0194` ms.
- The delivered neutral unit contained `11.28` seconds/`1,082,880` bytes and
  completed in `16,071.6646` ms at RTF `1.4247929609929078`. The delivered
  Spanish unit contained `14.88` seconds/`1,428,480` bytes and completed in
  `21,382.9957` ms at RTF `1.4370292809139784`.
- Command-to-first-validated-audio-metadata p95 was `21,382.4382` ms;
  command-to-complete-unit p95 was `21,382.9957` ms. The complete waveform
  remains the first publishable boundary; these nearly identical values are
  not native model streaming.
- Native move plus final validation p95 was `233.5` microseconds, negligible
  beside generation time. This measurement excludes later WebView/player
  buffering, which remains M008 work.
- A third `11.44`-second complete unit was invalidated after completion but
  before consumer delivery and contributed zero delivered bytes. The retained
  unit blocked a second dispatch, and before-dispatch invalidation also
  contributed zero work/audio.
- Accepted-before-output, one-second mid-generation, child-crash, and
  application-exit containment all delivered zero audio. Process-tree
  termination p95 was `5.7038` ms, well inside the frozen two-second bound.
  Every required cancellation/crash case then passed an explicit clean
  restart and prepare.
- Peak exact descendant resources were `4,713,615,360` RAM bytes,
  `5,137,555,456` WDDM dedicated GPU bytes, and `81,788,928` shared GPU bytes
  with one GPU-allocating process. All four intermediate cleanup observations
  and final cleanup returned RAM, dedicated GPU, and shared GPU bytes to zero.
- The runner observed zero service listeners and zero external connections
  while the exact interpreter-bound outbound firewall rule remained enabled.
  It persisted no generated audio or raw journal.
- The schema-valid content-safe
  [`service-handoff-result-v1-exact-host.json`](../../../benchmarks/tts/service-handoff-result-v1-exact-host.json)
  has SHA-256
  `e1821579d42e1bccf5c2a3ebaa604c8677960d0df2bdc41a96e6a8c5588c68fe`.
  It contains no narration text, waveform/audio bytes, path, environment
  value, PID, exception, process command, or private identity.
- This passes exact-host complete-unit handoff, backpressure, cancellation
  containment, cleanup, and restart only. RTF remains above one, sustainable
  playback is not evaluated, and no native-streaming, cooperative-
  cancellation, production-profile, or general-hardware conclusion changes.
- Post-result validation passes on the authoritative Windows host:
  `pnpm.cmd check:portable`, `pnpm.cmd check`, and
  `pnpm.cmd test:native-startup`. The gates include 233 Python tests, 971
  TypeScript/Vitest tests, six Node transport tests, 24 Rust tests, strict
  mypy, Ruff, ESLint, Rustfmt, Clippy with warnings denied, portable builds,
  the native release build, and the packaged WebView2 lifecycle matrix.
- `uv lock --project
services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda --check`
  still resolves the frozen 107-package lock. Formatting, changed-document
  relative links, changed-content privacy, changed-path artifact, and
  whitespace checks pass.

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

In progress. The durable decision, documentation reconciliation, complete
implementation audit, and local validation are complete on 2026-07-27.
Required pull-request Ubuntu portable and Windows native jobs must pass on the
exact final head before this plan moves to `completed/`.

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

Milestone 4 adds the reviewed exact-host command:

```powershell
$env:VOXLEAF_TTS_DEV_ENABLED = "1"
$env:VOXLEAF_TTS_DEV_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe").Path
$env:VOXLEAF_TTS_DEV_MODEL_ROOT = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
pnpm.cmd test:tts:exact-host
```

It requires the exact interpreter-bound outbound firewall rule and verified
ignored model root. The checked-in launcher emits only a fixed pass/fail line;
the native host and child emit no path, narration text, waveform, environment
value, exception, or process command. The command is Windows/CUDA-only,
hardware-specific, and excluded from default checks and CI.

Milestone 5 adds the separate measured handoff command recorded in its
implementation checkpoint. It must be committed after the authority
checkpoint and before its one authoritative hardware attempt.

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
- 2026-07-26: Created
  `feat/m007-1-freeze-service-protocol-authority` from `main` at `d4839a2`.
  Commit `53ee61f` adds the first model-free transport checkpoint: the release
  executable can run as a synthetic framed child, Rust owns and validates the
  process exchange, a narrow Tauri command returns binary PCM, TypeScript
  validates that response, and the packaged smoke invokes the probe.
- 2026-07-26: Froze protocol version 1, its closed topology, message/state/
  identity/capability/error authorities, exact allocation and retention bounds,
  audio format, timeouts, native-only configuration names, and one-active/
  no-queue rule. Added the protocol authority and proposed ADR-0016 without
  adding a Python/model dependency, Tauri plugin, process capability, listener,
  private configuration, narration text, or generated artifact.
- 2026-07-26: Focused deterministic validation passes: nine Rust tests, 210
  desktop Vitest tests, six native-driver client tests, desktop type checking,
  the Vite production build, Rust formatting, and Clippy. A release build and
  the hidden release host diagnostic pass with exit code zero; an ordinary
  release application starts without an immediate crash.
- 2026-07-26: Three packaged native smoke attempts stopped during WebDriver
  session creation before VoxLeaf mounted. The installed WebView2 runtime and
  EdgeDriver share the required first three version components, no stale
  VoxLeaf/driver process remained, and direct release startup still passed.
  The binary WebView probe therefore had no packaged acceptance result at that
  checkpoint. Milestone 1 remained in progress and Milestone 2 had not started.
- 2026-07-26: After the authority checkpoint, the complete `pnpm.cmd check`
  passed with ignored workspace-local uv/temporary directories: formatting,
  ESLint, Clippy, Ruff, TypeScript/Python types, 175 shared tests, 555 EPUB
  tests, 210 desktop Vitest tests, six native-driver client tests, nine Rust
  tests, 161 Python tests, package/desktop/Python builds, and the release
  executable all pass. A fourth native-startup attempt rebuilt the release
  executable and reached the same fixed WebDriver session-creation failure
  before application mount. No stale VoxLeaf, Tauri-driver, or EdgeDriver
  process remained afterward.
- 2026-07-26: An unrestricted packaged run reached the application and exposed
  a real transport failure: the frontend rejected a serialized byte array
  instead of accepting it as binary. The CSP lacked Tauri's documented internal
  `ipc:` and `http://ipc.localhost` connect sources, so WebView2 blocked the
  optimized request and Tauri used its serialization fallback. Added only
  those internal IPC sources, kept external requests prohibited, and taught the
  smoke to classify the Tauri IPC origin as application-internal. The rerun
  passed the binary probe and complete native matrix with no runtime errors or
  external requests. ADR-0016 is accepted and Milestone 1 is complete.
- 2026-07-26: Final validation passes on the accepted source state.
  `pnpm.cmd check` passes with a short ignored workspace-local uv/temp root,
  including 175 shared tests, 555 EPUB tests, 211 desktop Vitest tests, six
  native-driver client tests, nine Rust tests, 161 Python tests, and all
  formatting, linting, type checking, package, release-desktop, and Python
  builds. The first final-check attempt used an overlong Windows temporary path
  and three quality tests reached fixed generation failures; rerunning the same
  unchanged source with the shorter ignored temp root made all 161 Python tests
  pass. The complete `pnpm.cmd test:native-startup` build-and-run command then
  passed outside the sandbox.
- 2026-07-27: Created
  `feat/m007-2-canonical-protocol-python-service` from merged `main` at
  `a664ef1`. Commit `4bdb076` adds the canonical closed protocol-v1 control
  schema, all-kind fixtures, generated TypeScript validation, shared decoding,
  and Python/Rust/TypeScript fixture conformance.
- 2026-07-27: Commit `86c8535` adds the generated offline Python schema
  registry, strict bounded framing and message validation, deterministic fake
  engine, and model-free standard-stream service loop. The service implements
  the frozen lifecycle, one-active/no-queue rule, metadata/audio/completion
  ordering, identity-first cancellation, stale suppression, fixed failures,
  zero retries, and cleanup without model or device libraries.
- 2026-07-27: Focused validation passes 196 shared tests, 12 Rust tests, 40
  Python protocol/service/conformance/health tests, Python type checking over
  82 source files, deterministic generation, Rust fixture conformance, and
  Python source/wheel builds. Documentation was reconciled without claiming
  native supervision, Qwen integration, or product playback.
- 2026-07-27: Created
  `feat/m007-3-native-supervision-client` from merged `origin/main` at
  `15db9fa`. Commit `1e84954` adds the native supervisor checkpoint: one
  persistent model-free child, strict framed standard-stream I/O, canonical
  control/audio validation, one-active backpressure, frozen timeouts, zero
  automatic restart, identity-first cancellation, Windows Job Object
  process-tree containment, explicit shutdown, application-exit cleanup, and
  narrow Tauri commands. No plugin, listener, general shell capability,
  Python/model path, model dependency, or audio-device dependency was added.
- 2026-07-27: Commit `c0bd2db` adds the typed desktop process client and
  one-unit binary sink outside React state. It independently validates exact
  lifecycle order, service/work identities, narration input, finite
  little-endian PCM, active/stale completion, one-active/one-retained bounds,
  fixed failures, cancellation, and zeroing on stale completion or release.
  A content-safe packaged probe exercises normal delivery and cancellation;
  the hidden release host additionally covers crash followed by explicit
  restart, shutdown, and Windows descendant cleanup.
- 2026-07-27: Focused implementation validation passes 21 Rust tests, Rustfmt,
  Clippy with warnings denied, 220 desktop Vitest tests, six Node
  WebDriver-client tests, TypeScript checking, ESLint, the Vite production
  build, the release supervisor host, and the complete packaged WebView2
  startup matrix. The packaged matrix reports no runtime error or external
  request and the existing visual reader remains functional without TTS
  configuration.
- 2026-07-27: Created `feat/m007-4-qwen-serena-adapter` from merged `main` at
  `b34fe98`. Commit `55722cc` adds the common service-engine contract and exact
  Qwen/Serena adapter with frozen identity, runtime, revision, artifact,
  provider, waveform, failure, and cleanup tests. The isolated candidate lock
  remains byte-identical.
- 2026-07-27: Commit `ca700e4` connects the native supervisor to the exact
  Python service only behind the three frozen native-only keys, preserves the
  model-free default, byte-verifies the candidate lock, and adds the reviewed
  exact-host diagnostic command. Focused Python validation passes 56 tests;
  mypy, Ruff, 21 Rust tests, Rustfmt, Clippy, Node syntax, and Prettier pass.
- 2026-07-27: The first complete portable gate found only that the new Node
  launcher had not imported the repository's explicit `console` and `process`
  globals. Commit `5d08d74` adds those imports; focused ESLint and Prettier
  checks and the unchanged complete validation then pass.
- 2026-07-27: The first reviewed exact-host execution passed under the existing
  enabled outbound block bound to the exact candidate interpreter. It proved
  exact load/warm, one resident model per service session, one active request,
  zero automatic retry, two valid bounded deliveries across an explicit
  reload, busy rejection, active process-tree termination, zero stale return,
  and clean shutdown. This is constrained exact-host service evidence only;
  Milestone 5's measured handoff matrix remains open.
- 2026-07-27: Created
  `feat/m007-5-exact-host-handoff-validation` from merged `main` at `f4442b0`.
  Before implementing or running a measured host command, froze
  `tts-service-handoff-profile-v1`, its three repository-authored synthetic
  inputs, ordered nine-case matrix, clocks, RAM/VRAM sampling, first-attempt
  policy, cleanup gates, privacy boundary, and closed result schema. Focused
  authority validation passes ten tests plus Ruff and strict mypy.
- 2026-07-27: Implemented the result-blind hidden native matrix host, internal
  supervisor timing observations, bounded diagnostic consumer, Windows
  process-tree/WDDM/network runner, closed result derivation, and reviewed
  `pnpm.cmd test:tts:handoff-host` command. Deterministic validation passes 24
  Rust tests and 22 focused Python authority/runner/memory tests plus Rustfmt,
  Clippy with warnings denied, Ruff, and strict mypy. The hardware command has
  not yet been executed.
- 2026-07-27: The first reviewed command invocation completed the release
  build, then stopped at the runner's firewall preflight before the native host
  or Qwen process started. The firewall was enabled and correctly bound; the
  runner incorrectly assumed a value following PowerShell `-Command` would
  appear in `$args[0]`. Changed only that preflight to read the already-frozen
  native-only environment key directly and added a mismatch regression test.
  This pre-matrix harness failure is preserved here and is not a failed,
  retried, or hidden model/case observation. The authoritative nine-case
  hardware attempt remains unexecuted.
- 2026-07-27: After committing the preflight fix, the first actual exact-host
  matrix passed all nine frozen cases in 159.2 seconds including the release
  build. Two bounded units were delivered, one complete stale unit was
  discarded, every invalidated/crashed/exiting path delivered zero audio, all
  required explicit reloads passed, all cleanup observations were zero, and
  the runner observed no listener or external connection. The content-safe
  committed result records exact timing, RTF, RAM, dedicated/shared GPU,
  backpressure, termination, restart, cleanup, privacy, and narrow
  conclusions without changing historical `v3`/`v5` results.
- 2026-07-27: Created `feat/m007-6-protocol-decision-closeout` from merged
  Milestone 5 `main` at `ac16bc7`. Reaffirmed ADR-0016 and frozen protocol v1
  after reviewing the complete M007 implementation and exact-host evidence.
  Reconciled product, architecture, system-diagram, setup, dependency,
  testing, roadmap, M008, and broad-plan documentation without changing a
  runtime contract, dependency, permission, benchmark authority, or product
  playback behavior.
- 2026-07-27: Commit `f9d1f59` records that durable decision and the reconciled
  documentation. Complete portable and native repository checks pass, as do
  the packaged Windows/WebView2 startup matrix and a diagnostic rerun of the
  exact-host Qwen/Serena service path. The authoritative Milestone 5
  first-attempt matrix was validated from its committed result rather than
  rerun. Final changed-scope audits and this validation record form the second
  local closeout checkpoint.

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
6. The model-free prototype selects Rust-owned standard streams plus a narrow
   optimized Tauri binary response because they avoid a listening endpoint and
   a renderer-accessible general shell capability. ADR-0016 accepts this
   decision after its packaged WebView gate passed.
7. The historical prototype allowed a much larger output than the later `v5`
   short-unit authority. Milestone 1 therefore chooses the `v5`
   20-second/1,920,000-byte service-unit reservation rather than inheriting the
   old ceiling.
8. The exact candidate lock and artifacts remain development-only and
   isolated. This plan does not approve production dependency promotion,
   redistribution, or automatic model acquisition.
9. Tauri `Channel` is not the version-1 delivery primitive. The candidate
   produces a complete waveform, so one bounded binary `Response` gives an
   explicit one-command backpressure boundary without claiming model streaming
   or adding another queued send surface.
10. The service-unit ceiling is the `v5` 20-second reservation: 480,000 finite
    24-kHz mono float32-le samples and 1,920,000 payload bytes. This replaces the
    historical larger prototype ceiling for M007.
11. Tauri optimized binary responses require the packaged CSP to permit the
    framework's internal `ipc:` and `http://ipc.localhost` connect sources.
    These are not an application server or external listener. A serialized
    array fallback remains invalid, and the native smoke distinguishes internal
    IPC from external requests.
12. Structural control validation must not become a Python-owned second
    authority. The shared generator therefore embeds the canonical schema
    registry in the Python wheel, and runtime validation performs no file,
    URI, or network lookup.
13. The service retains only the active and immediately settled request
    identities needed for bounded duplicate/stale rejection. The native owner
    remains responsible for fresh identities; an unbounded historical-ID set
    is prohibited.
14. The model-free service reports local speech generation and hardware as
    unknown until a verified real adapter is ready. Synthetic PCM proves the
    protocol lifecycle only and cannot promote a product capability.
15. Milestone 3 uses the packaged executable itself as the supervised
    model-free Rust child. This exercises the production native ownership,
    framing, cancellation, tree-cleanup, and Tauri boundaries without making
    the separately validated Python service or a private interpreter path a
    prerequisite. Milestone 4 must replace this child deliberately with the
    exact service adapter.
16. Cancellation cannot wait behind the one-operation mutex: the native
    supervisor invalidates the active identity first, writes a best-effort
    cancel, closes the Windows Job Object, and removes the session while the
    synthesis receiver unwinds. A later request requires an explicit start and
    prepare; no automatic restart or retry hides the cost or failure.
17. One optimized binary Tauri response is also the backpressure boundary.
    The TypeScript client owns at most one complete unit outside React state,
    rejects another request while generation or retained audio exists, and
    zeroes stale or released bytes. M008, not this client, owns any multi-unit
    playback queue.
18. The isolated Qwen lock cannot absorb the base service's JSON Schema
    dependencies without invalidating the evaluated runtime. The exact child
    therefore uses the candidate interpreter and candidate packages unchanged,
    while Rust adds only the separately locked base service validation packages
    to its private import path. The adapter verifies that Qwen, Torch, and
    Torchaudio still resolve from the candidate environment before load.
19. Model and native-library standard output is discarded around load and
    generation because child standard output is protocol-only. Standard error
    remains attached to the null sink with zero retained bytes.
20. Milestone 5 needs timing and resource evidence without turning production
    control messages into a metrics protocol. A separate hidden native host
    may emit only closed content-safe diagnostic events to its parent
    measurement runner. The supervised Qwen child's standard output remains
    protocol-only, and no measurement field is added to the public Tauri or
    process protocol surface.
21. Exact-host resource ownership spans the Rust diagnostic owner and its Qwen
    descendant. The measurement runner therefore attributes RAM plus WDDM
    dedicated/shared memory to the release host's descendant tree, checks
    bound/external endpoints without retaining PIDs, and rejects a result
    unless all four post-termination observations and final cleanup are zero.
22. A PowerShell command-string argument is not a reliable `$args[0]` carrier
    for the firewall preflight in this invocation shape. The runner already
    owns the exact native-only interpreter environment value, so the preflight
    reads that value directly and compares it in Python before querying the
    fixed firewall rule. The initial failure occurred before native/model
    launch and therefore produced no hardware result.
23. Complete-unit generation dominates the handoff. The exact-host p95 first
    metadata and complete-unit values differ by less than one millisecond,
    while native move/final validation p95 is `233.5` microseconds. M008 must
    schedule whole units and must not model this candidate as a stream.
24. The two delivered units were `11.28` and `14.88` playable seconds. Either
    can remain below the approximately 15-second quick-start target, so M008
    must accumulate contiguous complete units and may need a second unit
    before quick start. It cannot add a fixed timer after the threshold.
25. Identity-first termination is fast on the exact host, but model recovery
    is not: termination p95 is `5.7038` ms while explicit restart/prepare p95
    is `16,609.0194` ms. M008 must represent recovery honestly rather than
    retrying or promising immediate resumed audio.
26. The exact-host result does not justify protocol version 2. Complete-unit
    standard-stream framing, one active synthesis, zero service queue, one
    optimized binary response, and identity-first process-tree containment
    remain the smallest accepted boundary.
27. The complete M007 manifest/capability audit finds only the previously
    documented direct dependency additions. Milestones 4-6 add no manifest,
    lockfile, Tauri plugin, shell/process capability, listener, audio-device
    library, production model dependency, or installer surface.
28. Historical `profile-v3`, `selection-v5`, and the isolated candidate lock
    remain byte-unchanged. M007 adds its separate result-blind handoff
    authority and content-safe result without rewriting prior evaluation
    conclusions.
29. M008 owns the first product narration caller and multi-unit playback
    buffer. M007 closes only the one-unit service/process boundary and cannot
    be used to claim audible or sustainable playback.
30. A first dependency-drift query flagged the expected Milestone 5 root
    command addition because it treated every `package.json` change as a
    dependency change. The corrected audit inspected dependency sections,
    manifests, lockfiles, Tauri configuration, and capabilities directly.
    It found the one documented hardware-validation script and no undeclared
    dependency, lock, permission, or runtime-capability drift.

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

Milestone 1 implementation validation on 2026-07-26 currently records:

- `pnpm.cmd --filter @voxleaf/desktop test` passes with 211 Vitest tests and six
  Node native-driver client tests.
- `pnpm.cmd --filter @voxleaf/desktop typecheck` passes.
- `pnpm.cmd --filter @voxleaf/desktop build` passes.
- `cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml --check` passes.
- `cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings`
  passes.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` passes all
  nine model-free native tests.
- `cargo build --release --manifest-path apps/desktop/src-tauri/Cargo.toml`
  passes.
- The release executable's internal `--voxleaf-tts-protocol-probe-host`
  diagnostic exits zero after the exact framed parent/child exchange.
- `pnpm.cmd check` passes with ignored workspace-local uv/temporary
  directories, including formatting, linting, type checking, 175 shared tests,
  555 EPUB tests, 211 desktop Vitest tests, six native-driver client tests, nine
  Rust tests, 161 Python tests, package builds, the Tauri release build, and the
  Python package build.
- `pnpm.cmd test:native-startup` passes outside the sandbox. It proves the
  synthetic child/std-stream exchange, optimized binary response, exact
  frontend PCM validation, existing packaged application matrix, complete
  cleanup, zero runtime errors, and zero external requests.

The implementation is model-free and makes no playback, production,
native-model-streaming, cooperative-cancellation, standard-profile, or
general-hardware claim. Every Milestone 1 work item and acceptance gate is
complete. Milestone 2 is also complete with the separate implementation and
validation evidence recorded above and below.

Milestone 2 implementation validation completed on 2026-07-27:

- `pnpm.cmd check` passes with ignored workspace-local uv/temporary
  directories. It includes Prettier, Rust/Python formatting, ESLint, Clippy,
  Ruff, TypeScript/Python types, 196 shared tests, 555 EPUB tests, 211 desktop
  Vitest tests, six native-driver client tests, 12 Rust tests, 198 Python
  tests, all package builds, the Tauri release build, and Python source/wheel
  builds.
- The first complete check found one current-Clippy
  `manual_range_contains` warning in the new test-only Rust fixture validator.
  Replacing the equivalent comparison with the inclusive range expression
  fixed it; the focused 12-test Rust suite and unchanged complete check then
  passed.
- The focused Python protocol/service/conformance/health matrix passes all 40
  tests, and mypy passes all 82 Python source files.
- `pnpm.cmd --filter @voxleaf/shared generate:check` verifies all 16 generated
  files. The built wheel contains
  `voxleaf_tts/generated/protocol_schemas.py`, proving that offline canonical
  validation is packaged.
- The unchanged Qwen candidate lock passes `uv lock --check` with 107 resolved
  packages. The model-free implementation does not import or load that
  environment.
- Markdown formatting passes for all ten reconciled documents; every relative
  link resolves; the changed-content privacy scan finds no private path,
  email, credential, or private-key marker; and `git diff --check` passes.
- The first `pnpm.cmd test:native-startup` attempt built the release
  executable and completed the first native session, then stopped before
  application mount on restart with the fixed
  `webdriver-session-not-created` infrastructure outcome. An unchanged retry
  passed the complete packaged matrix: the binary TTS probe, open/reselection/
  cancellation/replacement boundaries, keyboard/accessibility matrix, local
  image decode, restart restoration, cleanup, zero errors, and zero external
  requests.

Milestone 2 adds no real model, audio-device use, listener, native supervisor,
desktop process client, playback, persistence, production-profile, or
general-hardware claim. Every Milestone 2 work item and acceptance gate is
complete; Milestone 3 completion is recorded below.

Milestone 3 implementation validation completed on 2026-07-27:

- `cargo fmt --manifest-path apps/desktop/src-tauri/Cargo.toml --check`,
  `cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings`,
  and `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml` pass all
  21 native tests.
- `cargo build --release --manifest-path apps/desktop/src-tauri/Cargo.toml`
  passes, and the release executable's
  `--voxleaf-tts-service-supervisor-host` diagnostic exits zero after normal
  generation, cancellation, crash plus explicit restart, shutdown, and
  Windows descendant cleanup.
- `pnpm.cmd --filter @voxleaf/desktop test` passes 220 Vitest tests and six
  Node native-driver tests. The new client cases cover strict typed decoding,
  exact control order, active/stale classification, one-unit bounds,
  concurrent rejection, cancellation, late-byte suppression, release, and
  fixed content-free failures.
- `pnpm.cmd --filter @voxleaf/desktop typecheck`,
  `pnpm.cmd --filter @voxleaf/desktop build`, focused ESLint, and
  `node --check apps/desktop/scripts/native-startup-smoke.mjs` pass.
- `pnpm.cmd --filter @voxleaf/desktop test:native-startup` passes outside the
  sandbox. It proves the hidden supervisor host matrix, real Tauri
  start/prepare/generate/health/shutdown commands, bounded binary delivery,
  typed-client release, active cancellation with zero stale publication, full
  application exit/restart, the unchanged reader matrix, zero runtime errors,
  and zero external requests.
- `pnpm.cmd check` passes with a short ignored workspace-local uv/temporary
  root. It includes Prettier, Rust/Python formatting, ESLint, Clippy, Ruff,
  TypeScript/Python types, 196 shared tests, 555 EPUB tests, 220 desktop Vitest
  tests, six Node native-driver tests, 21 Rust tests, 198 Python tests, all
  package builds, the Tauri release build, and Python source/wheel builds. The
  first complete-check attempt found only three new TypeScript files requiring
  Prettier; formatting them made the unchanged implementation pass.

The implementation loads no model or audio device, persists no generated
audio, emits no narration or path in errors/logs, and makes no playback,
native-model-streaming, standard-profile, production, or general-hardware
claim. Every Milestone 3 work item and acceptance gate is complete; Milestone
4 completion is recorded below.

Milestone 4 implementation validation completed on 2026-07-27:

- Focused adapter and service validation passes 56 Python tests. Mypy, Ruff,
  21 Rust supervisor/protocol tests, Rustfmt, Clippy with warnings denied,
  Node syntax, focused ESLint, and Prettier pass.
- `pnpm.cmd check:portable` passes with ignored workspace-local uv/temporary
  directories. It includes formatting, linting, TypeScript/Python type checks,
  196 shared tests, 555 EPUB tests, 220 desktop Vitest tests, six Node
  native-driver tests, all 217 Python tests, package builds, the portable
  desktop build, and Python source/wheel builds.
- `pnpm.cmd check` passes under the same isolation. It additionally includes
  Rust formatting and linting, all 21 Rust tests, and the Tauri release build.
- `pnpm.cmd test:native-startup` passes outside the sandbox with all three
  exact-adapter override keys absent. The model-free packaged path completes
  binary delivery, cancellation, crash recovery, restart, process cleanup,
  reader behavior, zero runtime errors, and zero external requests.
- `pnpm.cmd test:tts:exact-host` passes outside the sandbox on the final code
  with the frozen candidate interpreter and model artifacts. The enabled
  interpreter-bound outbound firewall rule remains in force. The diagnostic
  proves exact offline load/warm, one resident model, bounded finite PCM,
  one-active busy rejection, active process-tree termination, zero stale
  return, explicit reload, a second bounded delivery, and clean shutdown.
- The candidate `uv lock --check` resolves all 107 locked packages and its
  SHA-256 remains
  `1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913`.
- Markdown formatting passes; every relative link in the 13 changed Markdown
  files resolves; the changed-content privacy scan finds no private path,
  personal email, private-key marker, or common webmail address; and
  `git diff --check` passes.

Milestone 4 adds only the frozen development exact-host adapter and its native
supervision path. It does not add a prepared-narration caller, scheduler,
playback, audio persistence, cooperative model cancellation, automatic
download, installer, production dependency, standard profile, or
general-hardware support claim. Every Milestone 4 work item and acceptance
gate is complete. Milestone 5 subsequently passed its frozen exact-host
service-handoff matrix. Milestone 6 locally closes the protocol decision and
repository validation; required final pull-request CI and plan archival
remain.

Milestone 6 local closeout validation completed on 2026-07-27:

- `pnpm.cmd check:portable` passes with ignored workspace-local uv and
  temporary directories. It covers formatting, linting, TypeScript/Python
  typing, 196 shared tests, 555 EPUB tests, 220 desktop Vitest tests, six
  Node native-driver tests, all 233 Python tests, package builds, the portable
  desktop build, and Python source/wheel builds.
- `pnpm.cmd check` passes under the same isolation. It additionally covers
  Rustfmt, Clippy with warnings denied, all 24 Rust tests, and the Tauri
  release build. The complete native gate therefore passes 1,234 automated
  tests. Vite reports only its existing informational chunk-size warning.
- `pnpm.cmd test:native-startup` passes outside the sandbox. The packaged
  Windows/WebView2 matrix proves application mount, bounded fake-service
  binary delivery, cancellation, crash recovery, restart, local-reader
  behavior, persistence/reselection boundaries, descendant cleanup, zero
  runtime errors, and zero external requests.
- `pnpm.cmd test:tts:exact-host` passes outside the sandbox with the frozen
  candidate interpreter, model root, and interpreter-bound outbound firewall
  rule. This diagnostic rerun proves exact offline load/warm, bounded finite
  PCM delivery, one-active rejection, identity-first process termination,
  zero stale return, explicit reload, second delivery, and clean shutdown.
  It does not replace or retry the committed Milestone 5 first-attempt matrix.
- Focused validation passes 73 Python protocol/service/adapter/handoff tests,
  24 Rust tests, 196 shared tests, and 220 desktop Vitest plus six Node
  native-driver tests.
- The candidate `uv lock --check` resolves the unchanged 107-package lock,
  whose SHA-256 remains
  `1b6e6e4d6ec7ebd84b0d8d943fe0d54cdb9211aa917716364299a681852e7913`.
- A complete M007 audit from pre-plan base `d4839a2` finds 93 changed paths and
  17,391 added lines with no committed generated audio, model weights, output
  artifacts, private path, personal email, credential, private-key marker, or
  book text. All 17 changed Markdown documents have valid relative links.
  Tauri keeps an empty capability list; historical `profile-v3`,
  `selection-v5`, and the candidate lock remain byte-unchanged.
- Prettier, the changed-document link scan, changed-content privacy scan,
  changed-path artifact scan, and `git diff --check` pass on the closeout
  documentation.

No protocol version 2, new ADR, dependency, permission, listener, audio-device
surface, persistence behavior, product narration caller, playback buffer, or
production/general-hardware claim is justified by this closeout. M007 remains
active only until the exact final branch head passes both required
pull-request jobs. After that external evidence is recorded, this plan can
move to `completed/`.
