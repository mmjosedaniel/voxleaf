# Local TTS service protocol v1 authority

## Status

Accepted and frozen by M007 Milestone 1. Deterministic, release parent/child,
and packaged WebView2 evidence passes. Milestone 2 implements the frozen
values as canonical cross-language contracts and a bounded Python service.
Milestone 3 implements native supervision and typed desktop consumption with a
model-free Rust child. Milestone 4 implements the exact Qwen/Serena adapter
behind native-only development configuration and passes its reviewed
exact-host delivery, termination, stale-suppression, reload, and shutdown
diagnostic. Milestone 5 passes the frozen nine-case exact-host handoff matrix
through the same release supervisor and adapter.

This authority applies only to ADR-0015's exact one-GPU
Qwen3-TTS 12Hz 1.7B CustomVoice/Serena constrained development demo. It does
not select a standard production profile, approve distribution, or claim
native model streaming, cooperative cancellation, continuous playback, CPU
fallback, or general hardware support.

## Ownership and topology

The selected boundary is:

```text
React typed client
    -> narrow application-owned Tauri commands
    -> Rust supervisor
    -> child stdin/stdout framed records
    -> Python service and one model worker

complete validated waveform
    -> one bounded float32-le audio record
    -> Rust identity/framing validation
    -> one optimized Tauri binary response
    -> one in-memory desktop owner
```

The Rust owner starts exactly the reviewed service executable/module. The
renderer receives no executable path, model path, environment value, process
identifier, unrestricted shell operation, raw standard error, or process
command. No socket, WebSocket, HTTP endpoint, port, discovery file, or network
listener is created.

The service accepts one active synthesis request. It owns no scheduling queue.
M008 owns later scheduling and playback buffering.

## Versioning

- The process protocol version is the positive integer `1`.
- Protocol versioning is independent of every payload `schemaVersion`.
- JSON-compatible payload families remain governed by the canonical Draft
  2020-12 schemas under `packages/shared/schemas`.
- An unknown protocol version fails the handshake and closes the child.
- A published protocol version is closed. Adding or changing a message kind,
  field, enum, frame rule, or bound requires a new protocol version.

## Standard-stream framing

Every child standard-input and standard-output record starts with this exact
12-byte header:

| Offset | Bytes | Encoding            | Meaning                             |
| -----: | ----: | ------------------- | ----------------------------------- |
|      0 |     4 | ASCII               | Magic `VLTP`                        |
|      4 |     2 | unsigned big-endian | Protocol version, exactly `1`       |
|      6 |     1 | unsigned integer    | Record kind: `1` control, `2` audio |
|      7 |     1 | unsigned integer    | Flags, exactly `0` in v1            |
|      8 |     4 | unsigned big-endian | Payload byte length                 |

The header is read into a fixed stack allocation. Magic, version, kind, flags,
and the kind-specific payload length are validated before allocating or
copying payload storage.

Control records contain one UTF-8 JSON object. Audio records contain only raw
PCM bytes and are never base64-encoded or copied into JSON. Standard output is
protocol-only. Standard error is attached to a null sink and has a retention
limit of zero bytes; library or model output must never be forwarded to the
renderer or application logs.

Fragmented reads are accumulated only up to the declared validated length.
Coalesced records are parsed one bounded record at a time. A zero-length,
truncated, extra, unknown, malformed, out-of-order, or over-limit record fails
the active request as a whole. No partial audio becomes eligible.

## Message families

### Native to service

| Kind         | Purpose                                                             |
| ------------ | ------------------------------------------------------------------- |
| `handshake`  | Offers exactly protocol v1 and one fresh service-instance identity. |
| `load`       | Requests verification and loading of the frozen local candidate.    |
| `warm`       | Runs the frozen non-publishable warm-up operation.                  |
| `synthesize` | Carries one `NarrationSegmentV1` plus one unique request identity.  |
| `cancel`     | Names the active request after native identity invalidation.        |
| `health`     | Requests content-free lifecycle and readiness state.                |
| `shutdown`   | Refuses new work and requests bounded release and process exit.     |

### Service to native

| Kind                | Purpose                                                                   |
| ------------------- | ------------------------------------------------------------------------- |
| `handshakeAccepted` | Accepts exactly v1 before any other state or payload is trusted.          |
| `state`             | Publishes one closed content-free lifecycle state.                        |
| `capabilities`      | Publishes `CapabilityReportV1` plus protocol cancellation containment.    |
| `audioMetadata`     | Carries one `AudioFrameV1` and request identity before one audio record.  |
| audio record        | Carries exactly one complete validated float32-le waveform unit.          |
| `completed`         | Settles the active request after the complete audio record is accepted.   |
| `cancelled`         | Confirms that the named identity is no longer publishable.                |
| `error`             | Carries one closed operational error and one closed protocol reason.      |
| `protocolRejected`  | Rejects the peer version or framing and then closes the process boundary. |

The exact JSON shapes are frozen in
`packages/shared/schemas/tts-protocol-control/v1.schema.json`, with one closed
root union covering all 15 control kinds. Every message has
`schemaVersion: 1`, `protocolVersion: 1`, its exact `kind`, and only the
fields admitted for that kind. Work-bearing messages reuse the existing
session, generation, segment, locator-range, audio-frame, capability, and
operational-error schemas rather than duplicating those domains.

The shared generator emits a self-contained TypeScript validator and an
offline Python schema registry from those canonical files. Python performs
Draft 2020-12 validation against that embedded registry; Rust and every other
consumer use the same committed fixtures for conformance. Raw PCM remains a
separate kind-2 record and never appears in the JSON schema.

## Lifecycle states

The service state set is closed:

```text
starting
handshaking
unloaded
loading
warming
ready
generating
cancelling
stopping
stopped
failed
```

The only synthesis path is:

```text
starting -> handshaking -> unloaded -> loading -> warming -> ready
ready -> generating -> ready
generating -> cancelling -> stopped
any live state -> stopping -> stopped
any protocol violation, crash, or unrecoverable engine failure -> failed
```

`stopped` and `failed` accept no work. Cancellation of an in-flight Qwen call
invalidates the identity first and then terminates the worker, so the service
must be started, loaded, and warmed again before another request. There is no
automatic synthesis retry and no automatic process restart.

## Identity and ordering

- Existing `sessionId`, `generationId`, and `segmentId` values remain the
  asynchronous work authority.
- `requestId`, `serviceInstanceId`, and `frameId` use the same closed shared
  identifier syntax and limits.
- A request identity is unique within one service instance and is never
  reused after success, failure, cancellation, crash, or timeout.
- `synthesize` contains exactly one `NarrationSegmentV1`. Its session,
  generation, segment, book, source range, and sequence must already be valid.
- `audioMetadata`, the following audio record, and `completed` must match the
  active service, request, session, generation, segment, and frame identities.
- One complete service unit maps to one `AudioFrameV1` with frame sequence
  zero and `endOfSegment: true`.
- Unknown, duplicate, stale, missing, reordered, or mismatched identity fails
  the complete unit. Stale work contributes zero publishable bytes.
- Native invalidation is authoritative even if a late child completion is
  syntactically valid.

## Frozen limits

All counts are exact nonnegative integers. Code-point counts iterate Unicode
scalar values, and byte counts use UTF-8 or the named binary representation.

### Payload and framing limits

| Dimension                               | Minimum |         Maximum |
| --------------------------------------- | ------: | --------------: |
| Identifier                              |       1 | 128 code points |
| Identifier UTF-8 representation         |       1 |       512 bytes |
| Narration text per request              |       1 | 640 code points |
| Narration text UTF-8 per request        |       1 |     2,048 bytes |
| Control JSON payload                    |       1 |    16,384 bytes |
| Audio records per synthesis             |       1 |               1 |
| Audio samples per synthesis             |       1 |         480,000 |
| Audio payload per synthesis             |       4 | 1,920,000 bytes |
| Audio duration                          |      >0 |      20 seconds |
| Active synthesis requests               |       0 |               1 |
| Service-owned queued synthesis requests |       0 |               0 |
| Pending control writes                  |       0 |               1 |
| Pending audio writes                    |       0 |               1 |
| Native retained audio units             |       0 |               1 |
| Renderer retained audio units           |       0 |               1 |
| Automatic synthesis retries             |       0 |               0 |
| Automatic process restarts              |       0 |               0 |
| Retained standard-error bytes           |       0 |               0 |

The 20-second, 480,000-sample, and 1,920,000-byte values adopt the frozen `v5`
short-unit reservation instead of the much larger historical prototype
ceiling. The independent 640-code-point and 2,048-byte text limits inherit the
implemented `narration-v1` segment maximum. Exact maxima are accepted.
Max-plus-one is rejected before allocation, dispatch, or publication.

### Audio format

| Property         | Frozen value                                 |
| ---------------- | -------------------------------------------- |
| Sample rate      | 24,000 Hz                                    |
| Channels         | 1                                            |
| Sample format    | IEEE-754 float32                             |
| Byte order       | little-endian                                |
| Interleaving     | not applicable to mono                       |
| Numeric validity | every sample must be finite                  |
| Publication      | one complete unit after full validation only |

Payload bytes must equal `sampleCountSamples * 4`. A nonempty one-dimensional
candidate waveform is validated for identity, sample rate, channel count,
sample count, duration, byte count, and finiteness before metadata or audio is
eligible outside the service.

### Timeout and cleanup limits

| Boundary                         | Inclusive maximum |
| -------------------------------- | ----------------: |
| Handshake                        |          5,000 ms |
| Candidate load                   |        120,000 ms |
| Warm-up                          |        120,000 ms |
| One synthesis                    |        120,000 ms |
| Health response                  |          2,000 ms |
| Identity invalidation settlement |            500 ms |
| Worker/process-tree termination  |          2,000 ms |
| Graceful shutdown                |          5,000 ms |
| Final cleanup                    |          5,000 ms |

An exact timeout boundary is admitted. Maximum plus one fails the operation.
Timeout starts from the native monotonic clock at dispatch and cannot be
extended by partial records, state chatter, retries, or blocked consumers.

## Backpressure and Tauri delivery

Tauri's optimized binary `Response` is selected for one completed service
unit. A `Channel` is not selected for v1 because the exact Qwen API produces a
complete waveform and the complete unit is bounded to 1,920,000 bytes. Using a
streaming channel would add an independently queued publication surface
without creating native model streaming.

The desktop permits one in-flight synthesis command. A second request is
rejected immediately as busy; it is not queued. The Rust owner holds at most
one complete validated audio unit while constructing the response. The typed
frontend validates the `ArrayBuffer`, transfers it to one in-memory consumer,
and releases the probe/test bytes after deriving content-free observations.
M008 may add a separate bounded playback owner without changing the
one-active-service rule.

The packaged application CSP permits only Tauri's internal custom-protocol
connect sources, `ipc:` and `http://ipc.localhost`. Without that directive,
WebView2 blocks the optimized response request and Tauri falls back to a
serialized byte array. The typed frontend rejects that array. The allowed
sources are application-internal IPC rather than an HTTP server or external
network endpoint, and the packaged smoke classifies them separately from
external requests.

## Capability semantics

For this exact constrained service:

- `localSpeechGeneration` is `supported` only after the verified candidate is
  ready on the exact configured host;
- `streamingGeneration` is `unsupported`;
- `generationCancellation` is `unsupported` as a cooperative model
  capability;
- `hardwareAcceleration` may be `supported` only as an exact configured-host
  observation and is not a general hardware claim; and
- `cpuFallback` is `unsupported`.

The protocol additionally reports the closed containment value
`identity-invalidation-then-worker-termination`. This value describes native
containment and must not be presented as cooperative generation cancellation.

## Failure mapping

No error contains a message, path, command line, environment value, process
identifier, exception, text, audio, or raw frame.

| Protocol reason                                                | Operational error mapping                                 |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| malformed/unknown/over-limit request                           | `invalid-input` / `input` / `recoverable`                 |
| unsupported protocol or payload version                        | `unsupported-input` / `input` / `recoverable`, then close |
| missing verified local runtime or unavailable exact capability | `capability-unavailable` / `availability` / `recoverable` |
| identity invalidated or cancellation settled                   | `operation-cancelled` / `cancellation` / `recoverable`    |
| bounded allocation or retained-state limit                     | `resource-exhausted` / `resource` / `recoverable`         |
| engine failure, crash, partial output, protocol corruption     | `internal-failure` / `internal` / `fatal`                 |

The detailed protocol reason is a closed content-free enum owned by the v1
schema. Unknown reasons are themselves protocol rejection.

## Native-only development configuration

Milestone 4 may read only these development configuration keys in Rust:

| Key                          | Meaning                                                |
| ---------------------------- | ------------------------------------------------------ |
| `VOXLEAF_TTS_DEV_ENABLED`    | Must be exactly `1` to enable the constrained adapter. |
| `VOXLEAF_TTS_DEV_PYTHON`     | Absolute verified candidate-environment interpreter.   |
| `VOXLEAF_TTS_DEV_MODEL_ROOT` | Absolute verified local model-artifact root.           |

Values are never returned to the renderer, serialized into protocol messages,
logged, committed, persisted, or included in errors. Missing, relative,
unverified, or mismatched values produce the fixed unavailable state. This is
a development-only configuration boundary, not an installer or distribution
decision.

## Model-free implementation evidence and remaining gate

The Milestone 1 prototype uses the packaged VoxLeaf executable as a
repository-authored synthetic child. The parent sends one framed control
record, validates one framed identity-bearing metadata record plus 19,200
bytes of deterministic finite float32-le PCM, and exposes the bytes through
one binary Tauri response. The probe accepts one active request, rejects a
second instead of queueing it, discards child standard error, uses fixed
content-free failures, and retains no audio after its observation.

Deterministic evidence currently proves:

- exact and maximum-plus-one control/audio frame lengths;
- rejection before payload allocation for over-limit declared lengths;
- fragmented/truncated, unknown, mutated, non-finite, and stale-identity
  rejection;
- exact/max-plus-one text, identifier, audio, retained-count, restart, and
  timeout authority arithmetic;
- one-active/no-queue ownership;
- release-mode parent/child standard-stream execution with exit code zero;
- typed frontend binary-response validation and release; and
- direct packaged application startup without a crash.

Early sandboxed attempts did not create a WebDriver session. The first
unrestricted packaged run reached the application and correctly rejected a
serialized byte-array fallback. That result exposed the missing internal IPC
CSP source. After adding only `ipc:` and `http://ipc.localhost`, the optimized
response arrived as binary data and the authoritative packaged smoke passed
the probe, the existing application matrix, zero runtime-error checks, and zero
external-request checks.

Milestone 2 adds `voxleaf_tts.protocol`, `voxleaf_tts.fake_engine`, and
`voxleaf_tts.service`. The protocol module reads the fixed header before any
payload allocation, rejects duplicate JSON keys and non-finite JSON numbers,
validates canonical message shape plus semantic identity/format relationships,
and writes only bounded records. The service loop implements the frozen
handshake, load, warm, ready, generate, cancel, stopped, failed, and shutdown
transitions with one active synthesis and no queue. The deterministic fake
models successful complete output, pending work, late completion, failure,
timeout, crash, invalid audio, cancellation, and cleanup without model
libraries, CUDA, an audio device, private content, or retained narration text.
Milestone 3 adds a production native supervisor around one persistent
repository-authored model-free Rust child. Rust owns framed reads/writes,
strict control/audio validation, lifecycle state, frozen timeouts, one-active
backpressure, process-tree termination, zero automatic restart, and
application-exit cleanup. A typed desktop client independently validates
control order, service/work identity, finite PCM, stale completion, and one
complete-unit ownership outside React state. Packaged WebView2 evidence covers
normal binary delivery, cancellation, crash recovery, cleanup, and zero
external requests. Milestone 4 adds `QwenSerenaTtsEngine` and makes the same
supervisor start the exact Python service only when the three frozen
development keys resolve to the reviewed candidate interpreter and local
artifacts. Rust byte-verifies the unchanged candidate lock; the adapter
verifies runtime versions, artifact hashes and sizes, revision receipts, CUDA
bfloat16 support, Serena, and the complete bounded waveform before delivery.
The first reviewed exact-host run passes valid delivery, concurrent rejection,
identity-first process-tree termination with zero stale return, explicit clean
reload, and shutdown. The frozen Milestone 5 matrix then passes cold and warm
delivery, bounded backpressure, before- and after-completion invalidation,
accepted and mid-generation cancellation, child crash, and application exit
without retry. It measures one allocator, zero listeners or external
connections, zero persisted audio, and zero descendant RAM/VRAM at each
cleanup checkpoint. The adapter still exposes only complete units, with
first-audio and completion p95 both about 21.38 seconds on the exact host.
Product narration dispatch, playback, production packaging, and general
hardware support remain unimplemented.
