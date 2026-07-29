# ADR-0019: Freeze privacy-safe hardware profiles and explicit recovery

## Status

Accepted as result-blind M010 Milestone 1 authority. No host probe, supported
profile, CPU fallback, automatic retry, or recovery implementation is accepted
by this decision.

M010 Milestone 2 subsequently implements the authorized privacy-safe report
producer and decoder. That implementation does not widen this decision: it
adds no support/fallback claim, automatic retry, or recovery behavior.

M010 Milestone 3 subsequently implements the frozen registry, deterministic
matcher, bounded profile-ID preference, compatibility UI, and pre-start
enforcement. The exact Qwen/Serena entry remains `development-only` behind its
native gate; rejected entries remain `unsupported`. No standard recommendation
or CPU fallback is therefore available.

M010 Milestone 4 subsequently implements the authorized desktop-local recovery
controller. It composes existing player, coordinator, typed-client, and native
supervisor boundaries to invalidate identity first, verify zero service/audio
ownership, preserve the latest heard checkpoint, and expose at most one
explicit restart. It adds no automatic retry, second worker, protocol/schema
field, persisted recovery record, fallback, or support claim.

M010 Milestone 5 subsequently passes the separately frozen Piper v6
evaluation. ADR-0020 admits that exact profile as the supported CPU fallback.
This does not retroactively change the result-blind authority here; Milestone
6 must still integrate and validate the admitted runtime before it becomes
user-visible.

## Context

The constrained Qwen/Serena path is exact-host and development-only. ADR-0013
selects no standard profile, ADR-0015 rejects CPU and dual-worker product
paths, and ADR-0016 keeps one Rust-owned service tree with zero automatic
restart or synthesis retry.

M010 must eventually report compatibility and recover from local failures, but
hardware inventory can expose private device identity and result-driven
matching can turn a successful load into an unsupported product claim.
Retrying before invalidating old work can also replay stale audio or skip heard
progress.

## Decision

The detailed authority is
[`../hardware-profile-recovery-authority-v1.md`](../hardware-profile-recovery-authority-v1.md).
Its executable desktop constants and tables are in
`apps/desktop/src/tts/hardware-profile-authority.ts`.

VoxLeaf uses a separate canonical
`HostProfileCompatibilityReportV1`. It carries only bounded normalized
platform, processor, memory, storage, provider, device-class, and precision
facts. It contains no identity, raw platform output, path, timestamp, profile,
recommendation, content, or audio and is never persisted.
`CapabilityReportV1` and TTS protocol v1 remain unchanged.

Native collection keeps the renderer capability-free. Windows probing will
use reviewed direct platform/provider APIs behind an injected port and will
fail closed. PowerShell, WMI query text, vendor commands, a general shell,
registry inventory, telemetry, and remote probing are rejected.

Profiles bind exact engine/model/voice/runtime/generation identity, measured
resource requirements, immutable evidence provenance, all mandatory gates,
one support state, and fixed result-blind memory margins. Only a compatible
`supported` entry may be recommended. Development-only activation stays
behind the explicit native gate; unsupported or unknown profiles cannot be
selected. Ties produce no recommendation.

Only one bounded profile preference may later be persisted. It is re-probed
and revalidated before use. Raw host facts are not stored.

No CPU fallback is admitted. A CPU entry must pass a separately frozen complete
evaluation before it can become fallback.

Recovery invalidates identity before playback, preparation, queued-unit, and
service cleanup. It preserves the latest valid heard checkpoint and permits at
most one explicit action for a classified recoverable failure after cleanup.
Automatic segment retries and service restarts remain zero. Protocol,
cancellation-timeout, cleanup, and repeated-recovery failures are contained
without immediate restart.

## Consequences

- Future host detection has one strict privacy-safe output contract.
- Unknown or incomplete facts cannot silently become compatibility.
- Historical rejected profiles remain rejected and Qwen/Serena remains
  development-only.
- Recommendation, user selection, fallback, and recovery have deterministic
  closed behavior before new measurements exist.
- Recovery cannot start a second worker, replay stale audio, or advance beyond
  unheard content.
- A user may see fallback unavailable or no recommendation; that is an
  accepted truthful result.
- Milestones 1-4 add no new production dependency, Tauri permission, standard
  support claim, or CPU fallback. Only the bounded profile ID may be persisted;
  raw host facts remain transient and recovery diagnostics remain in memory.

## Alternatives considered

### Expand `CapabilityReportV1`

Rejected. It is a model-independent service report embedded in protocol v1.
Adding host inventory or recommendation would silently change the accepted
process contract.

### Return raw Windows or vendor inventory

Rejected. Names, IDs, driver data, paths, command output, and arbitrary errors
are unnecessary for matching and create privacy and diagnostic surfaces.

### Use PowerShell, WMI, or `nvidia-smi`

Rejected. They require process execution or arbitrary text parsing, widen the
permission and packaging boundary, and make malformed or localized output part
of product authority.

### Recommend the first loadable profile

Rejected. Load success does not prove startup, throughput, memory, quality,
offline, cleanup, licensing, packaging, or host safety margins.

### Automatically retry failed synthesis or restart the service

Rejected. It can hide reliability and buffering evidence, duplicate workers,
replay stale output, and complicate non-skipping progress. The initial policy
allows only bounded explicit recovery after verified cleanup.
