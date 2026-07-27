# ADR-0016: Use Rust-owned standard streams and bounded binary responses for local TTS

## Status

Proposed. The deterministic prototype and packaged native parent/child path
pass. Acceptance is blocked only on the packaged WebView2 binary-response
smoke reaching the application; three local attempts failed during WebDriver
session creation before application mount.

## Context

M007 must give the desktop one local, typed, bounded, cancellable process path
to the exact ADR-0015 one-GPU Qwen/Serena development candidate. The Qwen API
returns a complete waveform. It does not provide native audio streaming or
cooperative cancellation.

The transport must keep narration and audio on the device, create no remote or
discoverable service, reject malicious lengths before allocation, preserve
session/generation/segment identity, contain crashes and late completions,
apply backpressure without an unbounded queue, and work in the packaged
WebView. The renderer must not gain a general process or shell capability.

M007 Milestone 1 implemented a model-free release-mode prototype before
selecting the production-path topology. The exact protocol and resource
authority is frozen in
[`tts-service-protocol-v1.md`](../tts-service-protocol-v1.md).

## Decision

### Rust owns the child and all private runtime configuration

The native Tauri process starts exactly one reviewed child executable/module
with redirected standard input and output and discarded standard error. It
resolves development runtime/model paths natively and never returns or logs
them. The renderer receives only narrow application-owned Tauri commands. No
shell plugin, general process command, socket, WebSocket, HTTP endpoint, port,
or listener is added.

### Standard streams use closed length-prefixed records

Child control JSON and raw audio use distinct record kinds behind one fixed
12-byte header. The native reader validates magic, protocol version, kind,
flags, and kind-specific length before allocating the payload. Protocol v1
allows one active synthesis and zero queued synthesis requests.

The service publishes only one complete, finite, identity-valid 24-kHz mono
float32-le waveform. The hard service-unit ceiling is 20 seconds, 480,000
samples, and 1,920,000 payload bytes, matching the later frozen `v5`
reservation. A cancelled, failed, timed-out, malformed, stale, or partial unit
publishes zero audio.

### Tauri returns one optimized binary response per complete unit

The native/frontend boundary uses Tauri's optimized binary `Response`, which
arrives as one `ArrayBuffer`. It does not serialize audio as JSON or base64.
One in-flight command acts as the native/frontend backpressure boundary.

A Tauri `Channel` is not selected for protocol v1. Channels are designed for
streamed data, while this exact model exposes only a complete bounded waveform.
Framing a complete waveform into channel messages would add a second queue and
copy surface without improving model startup or cancellation.

### Cancellation is containment, not a model capability

The native owner invalidates the active session/generation/request identity
before asking the service to cancel. If the model call remains active, the
complete worker process tree is terminated within the frozen two-second
bound. Any late completion is stale and ineligible.

`streamingGeneration` and cooperative `generationCancellation` remain
unsupported. The protocol separately reports
`identity-invalidation-then-worker-termination` containment. A terminated
worker must be loaded and warmed again; no automatic synthesis retry or
automatic process restart is allowed.

### Canonical schemas remain the message authority

Protocol version and record framing are separate from payload schema versions.
Milestone 2 will add closed canonical protocol schemas and cross-language
fixtures under `packages/shared`. Rust, TypeScript, and Python must consume
that authority and cannot maintain permissive independent message models.

## Consequences

- Normal TTS operation creates no listening endpoint and gives the renderer no
  executable or shell capability.
- One complete unit is bounded to 1,920,000 bytes and can use an optimized
  binary WebView response without base64 inflation.
- Backpressure and ownership remain simple: one service request, one native
  response, and one frontend unit.
- Standard streams require careful continuous draining and strict framing.
  Standard error cannot be retained or forwarded.
- Worker termination can release GPU state and contain stale output, but it
  makes the next request pay another load/warm cost.
- The decision does not create native model streaming, cooperative
  cancellation, audible playback, a production profile, CPU fallback,
  distribution, or general hardware support.
- The exactly pinned `@tauri-apps/api@2.11.1` runtime dependency is added for
  the typed frontend invoke boundary. No Tauri plugin, Rust dependency,
  capability, Python runtime dependency, model package, or listener is added
  by Milestone 1.

## Prototype evidence

- Nine Rust tests pass for minimum/exact/maximum-plus-one framing and authority
  dimensions, pre-allocation rejection, truncated/unknown/mutated records,
  stale identity, non-finite audio, one-active/no-queue behavior, and fixed
  content-free failures.
- The desktop suite passes 210 Vitest tests and six Node WebDriver-client
  tests, including binary-response type, exact length, finiteness, and safe
  error mapping.
- The release executable's hidden native host mode spawns the synthetic child,
  exchanges and validates the framed records, releases the unit, and exits
  zero.
- The ordinary release executable remains running during a bounded direct
  startup observation.
- The packaged WebView2 smoke contains the binary probe but has not reached
  application mount locally because WebDriver session creation failed three
  times. This is an acceptance gate, not passing evidence.

## Alternatives considered

### Local domain or named socket

A socket could decouple process lifetime and support independent clients, but
it creates an endpoint, authentication/ACL, discovery, cleanup, stale-endpoint,
and packaging surface that a single parent-owned worker does not need.
Rejected for v1.

### Loopback WebSocket

A WebSocket offers browser-friendly framing but creates a network listener and
requires origin/authentication, port selection, endpoint discovery, and
listener lifecycle. It also encourages JSON/base64 payloads or another binary
framing layer. Rejected.

### Renderer-accessible shell/sidecar plugin

Tauri's shell facilities can start sidecars, but granting the renderer a
general process surface would unnecessarily expose executable and argument
authority. The application-owned Rust supervisor is narrower. Rejected.

### Tauri channel for audio

Channels are appropriate for genuine streamed output. This candidate returns a
complete waveform, and the service unit is already bounded. A channel would
not make Qwen stream or cancel cooperatively and could obscure queued sends.
Rejected for protocol v1; reconsider only with a separately evaluated native
streaming engine.

### JSON or base64 audio

Rejected because it expands payload size, adds copies and parsing, and risks
placing sensitive generated audio in general application state or diagnostics.
