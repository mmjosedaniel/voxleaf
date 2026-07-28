# Hardware profile and recovery authority v1

## Status

Frozen before M010 host detection, profile matching, recovery implementation,
or new hardware measurement. This document and the executable constants under
`apps/desktop/src/tts/hardware-profile-authority.ts` are result-blind Milestone
1 authority. They do not establish a supported profile, CPU fallback, or
working recovery path.

The canonical cross-boundary report is
`packages/shared/schemas/host-profile-compatibility-report/v1.schema.json`.
`CapabilityReportV1` and TTS protocol v1 remain unchanged.

## Purpose

M010 needs enough local facts to reject incompatible narration profiles and
explain the result without exposing a device inventory. It also needs one
closed recovery policy before failures are observed, so later implementation
cannot tune retry or cleanup behavior to make a result look better.

This authority separates four decisions:

1. native-owned host observation;
2. the bounded host report that may cross to the renderer;
3. immutable evidence-backed profile records and deterministic matching; and
4. identity-first failure containment and explicit recovery.

## Native platform and permission audit

The M010 Milestone 1 audit found:

- Tauri `capabilities` is an empty array;
- no Tauri shell, process, operating-system, HTTP, or hardware plugin exists;
- the renderer has only application-owned commands and the existing internal
  Tauri IPC CSP sources;
- Rust already depends directly on `windows-sys` only for narrow process-tree
  containment features; and
- no WMI, PowerShell, registry, vendor-command, hardware-inventory, telemetry,
  or remote-probe dependency exists.

Milestone 1 adds no dependency, command, capability, plugin, provider load, or
probe. Milestone 2 must keep collection native-owned and use an injected probe
port. The selected Windows production surfaces are:

- `GetNativeSystemInfo` and `GetActiveProcessorCount` for normalized
  architecture and logical processor count;
- `GlobalMemoryStatusEx` for total and currently available physical memory;
- `GetDiskFreeSpaceExW` for available bytes on the natively selected
  application/model volume without exposing its path;
- DXGI adapter enumeration and `QueryVideoMemoryInfo` for normalized device
  class, dedicated memory, budget, and available budget; and
- a separately bounded callable provider API for provider and precision
  availability.

Provider availability must come from a callable API with fixed inputs and
closed output. Milestone 2 may expand `windows-sys` feature flags or add a
reviewed direct system-library binding, but must document that change first.
It must not spawn or parse PowerShell, WMI query text, `wmic`, `nvidia-smi`,
other vendor commands, a general shell, registry inventory, or arbitrary
diagnostic output. Missing symbols, denied access, inconsistent values,
unsupported platforms, and malformed results become `unknown` or a
non-complete probe; they do not trigger a wider fallback.

Raw adapter descriptions, LUIDs, vendor/device IDs, driver paths, compute
capability numbers, library paths, command lines, environment values, and
provider errors remain native-transient and are discarded before the report
crosses Tauri.

## Host profile compatibility report v1

The report is a snapshot, not an inventory or support decision.

### Units and bounds

- Memory and storage use integer mebibytes, where one MiB is exactly
  `1,048,576` bytes.
- Byte quantities are rounded down before serialization.
- A known logical processor count is from `1` through `1,024`.
- Every known memory or storage quantity is from `0` through `16,777,216`
  MiB, except total physical memory, which must be positive.
- Values outside those limits become `unknown` or make the report malformed;
  they are never clamped into compatibility.
- The report has exactly five provider slots: `cpu`, `cuda`, `directml`,
  `rocm`, and `metal`.
- Precision facts are closed to `float32`, `float16`, `bfloat16`, and `int8`.

The report contains:

- `probeStatus`: `complete`, `partial`, `permission-denied`, or `unavailable`;
- normalized operating system: `windows`, `linux`, `macos`, `other`, or
  `unknown`;
- normalized architecture: `x86_64`, `aarch64`, `other`, or `unknown`;
- known-or-unknown logical processor count;
- known-or-unknown total and available physical MiB;
- known-or-unknown available MiB on the native application/model volume; and
- one normalized capability slot per provider with availability, device
  class, dedicated/available dedicated MiB, and precision availability.

Device class is closed to `cpu`, `discrete-gpu`, `integrated-gpu`, `software`,
or `unknown`. Native multi-adapter details do not cross the boundary. For each
provider, native code selects at most one conservative aggregate candidate:
greatest available dedicated budget, then greatest dedicated memory, then the
closed device-class order. A remaining exact tie with different facts becomes
unknown. No adapter identity or native index is serialized.

`available` requires a known non-unknown device class and at least one
available precision. A CPU provider uses class `cpu` and exact zero dedicated
memory. A provider that is `unavailable` or `unknown` has unknown device class
and memory and no `available` precision. Available physical memory cannot
exceed total physical memory, and available dedicated memory cannot exceed
dedicated memory.

### Unknown and invalid input

`unknown` never satisfies a profile requirement. A probe status other than
`complete` cannot establish compatibility. A complete report may still
contain individual unknown facts; a profile requiring any such fact is not a
match.

Unknown fields, enum values, numeric strings, non-integers, non-finite values,
over-limit values, contradictory relationships, or inconsistent provider
semantics are malformed. An integer `schemaVersion` other than `1` is
`unsupported-version`. Neither outcome is coerced.

The report has no hostname, username, serial, hardware name, vendor/device ID,
path, environment value, process information, timestamp, profile,
recommendation, EPUB data, narration text, audio, or free-form diagnostic.
It is never persisted.

## Profile registry v1

The registry is application-owned and bounded to 64 immutable entries. An
entry binds:

- one identifier-bounded profile ID;
- role: `standard`, `development-demo`, or `cpu-fallback`;
- support state: `supported`, `development-only`, `unsupported`, or
  `unknown`;
- exact engine ID/version, model ID/revision, voice ID, runtime ID/version,
  and lowercase SHA-256 of the complete generation configuration;
- required operating systems, architectures, logical processors, provider,
  precision, and device classes;
- measured peak process RAM, peak dedicated VRAM, and complete artifact
  footprint in MiB;
- authority/result commit SHAs and SHA-256 hashes plus a decision hash; and
- closed startup, throughput, cancellation, memory, quality, offline, cleanup,
  license, and packaging gate states.

Identifiers use at most 128 Unicode code points and 512 UTF-8 bytes. Hashes are
lowercase SHA-256 hex; commits are lowercase full Git SHA-1 hex. A provenance,
identity, gate, or computed-requirement mismatch makes the entry `unknown`
rather than partially trusted.

Support meanings are:

- `supported`: every mandatory gate passes for the exact identity and an
  accepted decision admits product use;
- `development-only`: an accepted ADR allows only an explicit native
  development configuration despite one or more standard gates not passing;
- `unsupported`: a mandatory gate failed or an accepted decision rejected the
  exact identity; and
- `unknown`: evidence is absent, incomplete, unavailable, stale, malformed, or
  cannot be bound to the exact identity.

Only `supported` entries are automatic recommendation candidates.
`development-only` requires the existing explicit native development gate and
is never a standard or fallback recommendation. `unsupported` and `unknown`
are not selectable.

### Result-blind capacity margins

Every admitted entry uses the same formulas:

- available RAM requirement: measured peak plus the greater of 25% or
  `2,048` MiB;
- total physical RAM requirement: that available-RAM requirement plus a
  `4,096` MiB operating-system/application reserve;
- dedicated and available dedicated VRAM requirement: measured peak plus the
  greater of 20% or `1,024` MiB; and
- application-volume storage requirement: measured artifact footprint plus
  the greater of 10% or `2,048` MiB.

All arithmetic uses exact nonnegative integer MiB and rounds percentage
margins upward. Overflow above `16,777,216` MiB invalidates the entry.

### Deterministic matching and selection

Matching evaluates in this order:

1. contract version;
2. complete probe status;
3. valid registry entry;
4. admitted support state;
5. exact evidence provenance and gate semantics;
6. operating system and architecture;
7. logical processor count;
8. total then available RAM;
9. application-volume storage;
10. provider and precision;
11. device class;
12. dedicated then available dedicated VRAM;
13. validated prior user preference; and
14. unique recommendation.

The first failed dimension supplies one closed rejection reason. Unknown,
partial, denied, malformed, conflicting, or missing facts fail closed.

A still-compatible prior explicit preference may be reused only after a new
probe and full validation. Without one, exactly one compatible `supported`
entry may be recommended. Equal top candidates produce no recommendation;
profile-ID code-point order is display order only and never breaks a support
tie. A user cannot override provider, precision, memory, storage, evidence, or
support-state incompatibility.

The future preference envelope uses one fixed
`voxleaf.tts.profile-preference` key, schema version `1`, one profile ID, at
most 1,024 UTF-16 code units, and no host or evidence data. Unsupported future
versions are preserved without use or coercion.

## CPU fallback authority

No CPU fallback is admitted by this authority. A profile can become a
`cpu-fallback` only after a separately committed pre-result evaluation
authority and every mandatory gate pass for an exact CPU identity. A rejected,
development-only, unknown, or merely loadable profile cannot be fallback.

When no admitted compatible CPU profile exists, the only truthful state is
`fallback-unavailable`.

## Failure taxonomy

The closed failure codes and initial recovery actions are:

| Failure | Initial action | Explicit attempts |
| --- | --- | ---: |
| `provider-unavailable` | select another compatible admitted profile | 1 |
| `model-load-failed` | service restart after verified cleanup | 1 |
| `model-warm-failed` | service restart after verified cleanup | 1 |
| `service-crashed` | service restart after verified cleanup | 1 |
| `protocol-failed` | contain and stop | 0 |
| `resource-exhausted` | service restart after verified cleanup | 1 |
| `cancellation-timeout` | contain and stop | 0 |
| `playback-failed` | rebuild playback after verified cleanup | 1 |
| `cleanup-failed` | contain and stop | 0 |
| `repeated-recovery-failed` | contain and stop | 0 |

Every automatic attempt count is zero. Failure of the one admitted explicit
attempt becomes stable unavailable. A new failure episode requires an explicit
profile change, compatibility recheck, or later application session; it is not
an automatic loop.

## Recovery transition authority

Recovery uses this order:

1. replace the active session/generation identity;
2. stop and release playback;
3. abort and release prepared narration;
4. release queued audio units;
5. contain or terminate the service tree;
6. verify zero retained service/audio ownership;
7. preserve the latest valid heard checkpoint; and
8. only then expose an explicit recovery action.

The closed phases are `operational`, `invalidating`, `releasing`,
`containing-service`, `verifying-cleanup`, `recovery-available`, `recovering`,
`unavailable`, and `contained`. Cleanup failure goes directly from
`verifying-cleanup` to `contained`. An explicit recovery failure goes to
`unavailable`; it cannot loop back to recovery availability.

There is at most one service tree, one active synthesis, and zero
service-queued syntheses. Existing M007 inclusive maxima remain: 500 ms for
identity settlement, 2,000 ms for process-tree termination, and 5,000 ms for
final cleanup.

Resume authority is M009's latest valid heard checkpoint. Mid-segment recovery
replays from that segment's start. Failure, cleanup, restart, or fallback
selection cannot advance progress past unheard content.

## Observation, diagnostics, and messaging

Compatibility is observed at application start, explicit recheck, immediately
before profile start, and operating-system resume, with one probe maximum and
no periodic inventory. Resource observations while a service is live are no
faster than once per 1,000 ms and retain at most eight snapshots. Existing
content-free buffer projection remains at most 250 ms between observations and
retains M008/M009 thresholds.

At most eight failure entries are retained in memory. Each contains only one
closed failure code, recovery phase, bounded sequence, and profile ID. Wall
clock timestamps, free-form text, raw values, stack traces, paths, content,
audio, and persistence are prohibited.

UI reason/status codes are closed to checking compatibility, development
profile, unavailable profile/fallback/provider, low lead, buffering, recovery
available, recovering, recovery failed, and contained. Low lead and buffering
remain separate; restart cannot hide an underrun or reset its metrics.

## Preserved boundaries

Milestone 1 changes no runtime probe, profile, recommendation, fallback,
recovery controller, model, voice, protocol message, service behavior, buffer
limit, locator, reader interaction, dependency, Tauri permission, or support
claim. Generated audio remains ephemeral and raw standard error/failure-log
retention remains zero.

Any later result that requires a different fact, enum, margin, matching order,
failure code, attempt budget, transition, diagnostic field, or cleanup bound
must first publish a new authority version.
