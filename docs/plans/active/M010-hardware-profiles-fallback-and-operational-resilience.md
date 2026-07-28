# M010 hardware profiles, fallback, and operational resilience

## Goal

Add a privacy-safe, evidence-backed hardware compatibility and recovery layer
around the completed local narration path so VoxLeaf can make conservative
profile recommendations, explain unavailable configurations, recover from
classified local-service failures without replaying stale audio, and use a
CPU-compatible fallback only if a separately frozen evaluation proves one.

M010 must not turn the current exact-development Qwen/Serena path into a
standard profile by implication. Hardware detection, profile admission,
fallback selection, and recovery policy must be frozen before result-bearing
measurements or product claims.

## User-visible outcome

After M010 is complete:

- VoxLeaf reports whether local narration is supported, development-only,
  unavailable, or not yet established on the current device;
- a user sees a content-free explanation when required memory, acceleration,
  provider, precision, model, or runtime support is missing;
- the application recommends only a profile that passed its frozen evidence
  gates and lets the user explicitly choose among profiles admitted for that
  host;
- an admitted CPU-compatible profile can serve as an explicit fallback when
  acceleration is unavailable, without silently selecting a rejected
  candidate;
- a crash, model-load failure, resource limit, cancellation timeout, or
  unavailable provider invalidates obsolete work before cleanup and offers a
  bounded, accessible recovery path;
- service recovery never starts duplicate workers, replays stale audio, skips
  unheard reading progress, or leaves generated audio/model state persisted;
  and
- long narration sessions retain the existing queue, audio, text, process,
  logging, and persistence bounds.

If no CPU-compatible candidate passes the frozen fallback evaluation, the UI
must say that fallback is unavailable and M010 remains blocked at that gate
unless a later durable product decision explicitly removes CPU fallback from
the milestone.

## Current state

Roadmap Milestones 1 through 9 are complete.

Completed M006 and its two blocker-resolution plans provide the
candidate-neutral benchmark authority and measured evidence:

- ADR-0013 selects no standard production profile;
- the exact Supertonic CPU-compatible profile is rejected;
- Qwen3-TTS 1.7B CustomVoice/Serena is allowed only for the constrained
  exact-development GPU demo; and
- CPU-only Qwen, shared batching, targeted placement, and GPU-plus-CPU
  dual-worker scheduling are rejected by `selection-v4`/`selection-v5`.

Completed M007 implements protocol v1, a model-free default service, native
Rust supervision, a typed desktop client, one active synthesis with zero
service queue, identity-first process-tree termination, complete-unit binary
handoff, and the exact-development Qwen/Serena adapter. The native supervisor
uses fixed operation timeouts and fail-closed session cleanup. It deliberately
performs zero automatic restart and zero automatic synthesis retry.

Completed M008 implements the bounded adaptive scheduler, sole-owner FIFO,
Web Audio player, quick/prepared controls, and the exact-development
coordinator. Completed M009 connects exact audible segment transitions to the
reader, synchronized navigation, and non-skipping heard-position persistence.
These boundaries already make resource exhaustion, buffering, cancellation,
stale-work rejection, cleanup, and progress observable without exposing book
text.

The current `CapabilityReportV1` is intentionally model-independent. It
reports only `supported`, `unsupported`, or `unknown` for local generation,
streaming, cancellation, hardware acceleration, and CPU fallback. It contains
no host identity, device inventory, engine identity, profile identity, memory
quantity, provider, precision, or recommendation. Protocol v1 embeds that
report and must not be silently expanded.

The desktop currently exposes only a content-free exact-demo
`available`/`unavailable` flag. Native configuration decides whether the
model-free or exact child can be started. There is no general hardware probe,
measured profile registry, selection policy, CPU fallback, recovery state
machine, or support matrix.

## Scope and non-goals

### In scope

- Freeze a result-blind host-report, profile-registry, recommendation,
  fallback, failure-classification, retry, and recovery authority.
- Detect only the local facts needed to decide compatibility: OS/architecture,
  bounded CPU and RAM facts, GPU/VRAM class, and required acceleration,
  provider, and precision availability.
- Keep raw detection native-owned and expose only a versioned, bounded,
  content-free report through a narrow typed boundary.
- Represent `supported`, `development-only`, `unsupported`, and `unknown`
  separately so uncertainty cannot become support.
- Register profiles only with immutable engine/model/voice/runtime identity,
  measured resource requirements, evidence provenance, conservative safety
  margin, and a support state.
- Match profiles conservatively and fail closed on missing, conflicting,
  partial, permission-denied, or malformed probe results.
- Add accessible compatibility, selection, degraded-buffering, failure, and
  recovery UI without exposing hardware serials, usernames, paths, book text,
  audio, work identities, or unbounded diagnostic detail.
- Add identity-safe model-load recovery, explicit supervised restart,
  cancellation-timeout containment, resource-limit handling, and cleanup
  verification.
- Evaluate a CPU-compatible fallback through frozen M006-style authority
  before product integration.
- Validate deterministic profile/recovery behavior, exact-host behavior,
  fallback behavior when admitted, offline privacy, long-session bounds, and
  repository portability.

### Non-goals

- Claiming the current Qwen/Serena profile is standard, real-time,
  uninterrupted, generally supported, or distributable.
- Re-admitting the rejected Supertonic, Qwen CPU, shared-batch, or dual-worker
  configurations without a new frozen evaluation and durable decision.
- Adding telemetry, remote detection, cloud inference, remote book
  processing, or network model acquisition during normal reading.
- Persisting complete hardware inventories, process command lines, model
  paths, book contents, narration text, generated audio, or raw failure logs.
- Adding automatic segment retry merely to hide failures or improve reported
  metrics.
- Adding production VAD/energy monitoring without separate evidence for
  false positives, latency, memory, dependency, licensing, and quality.
- Changing narration normalization, M005 stable segmentation, M007 protocol
  v1, M008 audio ownership, M009 synchronization authority, or reading
  locator semantics without an explicit versioned decision.
- Packaging, signing, updater policy, model/runtime distribution, or release
  claims; M011 owns those concerns.

## Relevant files and documentation

### Existing authority and evidence

- `docs/plans/roadmap.md`
- `docs/plans/completed/M006-local-tts-feasibility-and-engine-profiles.md`
- `docs/plans/completed/M006-001-local-tts-profile-blocker-resolution.md`
- `docs/plans/completed/M006-002-qwen-short-segment-batch-feasibility.md`
- `docs/plans/completed/M007-local-tts-service-and-process-protocol.md`
- `docs/plans/completed/M008-bounded-adaptive-prebuffering.md`
- `docs/plans/completed/M009-synchronized-reading-and-narration.md`
- `docs/architecture/tts-service-protocol-v1.md`
- `docs/architecture/adaptive-buffer-authority-v1.md`
- `docs/architecture/synchronization-authority-v1.md`
- `docs/architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md`
- `docs/architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md`
- `docs/architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md`
- `benchmarks/tts/selection-v5.md`

### Expected implementation areas

- `packages/shared/schemas/`
- `packages/shared/src/contracts/`
- `packages/shared/fixtures/contracts/`
- `apps/desktop/src-tauri/src/`
- `apps/desktop/src/tts/`
- `apps/desktop/src/App.tsx`
- `services/tts/src/voxleaf_tts/engine.py`
- `services/tts/src/voxleaf_tts/qwen_adapter.py`
- `services/tts/src/voxleaf_tts/service.py`
- `services/tts/benchmarks/`
- `services/tts/tests/`
- `docs/architecture/decisions/`
- `docs/development/`

Generated contract files must be regenerated through the existing repository
generator and never edited manually.

## Architecture and constraints

### Separate engine capability from host compatibility

`CapabilityReportV1` describes the running engine/service boundary. M010 needs
a separate host/profile compatibility contract; it must not add host identity
or profile recommendation fields to protocol v1. If the report crosses the
Rust-to-TypeScript Tauri boundary, freeze a canonical schema and generated
decoder before implementation. Keep probe internals native-only.

The public report should contain only bounded enumerations and numeric
quantities required for matching. It must exclude hostnames, usernames,
serial numbers, network identifiers, full driver paths, environment values,
process command lines, and arbitrary vendor output. Unknown data remains
`unknown` and cannot satisfy a profile requirement.

### Evidence-backed profiles

Each profile entry must bind:

- an immutable profile and engine/model/voice/runtime identity;
- required OS/architecture, provider, precision, RAM, VRAM, and disk/resource
  conditions;
- measured startup, throughput, cancellation, memory, quality, offline, and
  cleanup evidence;
- a conservative safety margin and the exact authority/result hashes or
  commits that justify it; and
- one closed support state: `supported`, `development-only`, `unsupported`, or
  `unknown`.

The existing Qwen/Serena entry starts as `development-only`. Rejected
candidates remain `unsupported`; they are not fallback choices. A registry
entry or successful model load alone is not support evidence.

### Selection and user control

Profile matching is deterministic and pure after host facts are collected.
The matcher may recommend only an admitted profile whose requirements and
safety margins are satisfied. Equal or ambiguous matches produce no automatic
selection. User selection cannot bypass a hard memory/provider incompatibility
or promote an unsupported profile; development-only activation remains an
explicit development configuration.

Only a bounded profile preference may be persisted. Do not persist the raw
host report. On the next launch, re-probe compatibility before reusing the
preference.

### Recovery and identity

Recovery must preserve the completed M007-M009 ordering:

1. invalidate the active session/generation identity;
2. stop and release eligible playback/prepared work;
3. contain or terminate the active service process tree;
4. verify bounded cleanup;
5. preserve the latest valid heard checkpoint; and
6. only then allow a newly identified service/profile session to start.

No automatic segment retry is authorized initially. The first implementation
may offer one explicit user-triggered service restart after a recoverable
failure. A restart receives a new service, session, and generation identity
and resumes from the canonical non-skipping heard boundary. Repeated failure
returns to a stable unavailable state. Automatic restart/retry requires
separate frozen limits and evidence.

### Bounds and privacy

- Keep one active synthesis and zero service-queued synthesis.
- Retain M008's exact audio/text/unit bounds and one transient device copy.
- Keep process count bounded to one active service tree.
- Bound failure history and diagnostics by fixed counts and closed codes.
- Keep logs and UI content-free.
- Generated audio remains ephemeral and is zeroed/released on invalidation.
- Normal reading remains offline; hardware detection must not create network
  requests.

## Milestone 1: Freeze hardware, profile, fallback, and recovery authority

### Work

- Audit platform APIs and current Tauri permissions before selecting probe
  mechanisms or dependencies.
- Define the exact privacy-safe host facts, units, numeric maxima, enum sets,
  unknown semantics, and malformed/unsupported-version behavior.
- Freeze a separate versioned host/profile compatibility contract if data
  crosses the native boundary; leave `CapabilityReportV1` and protocol v1
  unchanged.
- Freeze the profile registry shape, support-state meanings, evidence
  provenance, memory safety margins, deterministic matching order, tie
  behavior, user-selection constraints, and persisted-preference limits.
- Freeze a closed failure taxonomy and transition table for unavailable
  provider, model load/warm failure, service crash, protocol failure, resource
  exhaustion, cancellation timeout, playback failure, and repeated recovery
  failure.
- Freeze retry/restart budgets, identity order, non-skipping resume behavior,
  degraded-buffer messaging, observation cadence, diagnostic bounds, and
  cleanup requirements.
- Record the durable decision in the next ADR and add deterministic
  result-blind authority tests before any host measurement.

### Validation

- Run focused shared-contract, native, and desktop authority tests introduced
  by this milestone.
- Run `pnpm.cmd typecheck`.
- Run `git diff --check`.
- Confirm the authority contains no measured result values chosen after
  seeing host outcomes and makes no support/fallback claim.

### Status

Not started.

## Milestone 2: Implement privacy-safe host detection

### Work

- Implement a native-owned probe port and production adapters for the frozen
  Windows facts. Keep the design extensible to other platforms without
  claiming their support.
- Normalize all platform/provider output into the frozen bounded report and
  discard raw command/library output immediately.
- Test injected complete, partial, permission-denied, malformed, multi-adapter,
  integrated-only, low-memory, no-provider, and unknown scenarios.
- Expose the report through the frozen narrow Tauri boundary and typed desktop
  decoder. Do not permit renderer shell/process access.
- Verify that detection performs no model load, model download, telemetry, or
  non-loopback request.

### Validation

- Run focused Rust probe/normalization tests and shared/desktop decoder tests.
- Run `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`.
- Run `pnpm.cmd --filter @voxleaf/shared test`.
- Run `pnpm.cmd --filter @voxleaf/desktop test`.
- Run `pnpm.cmd typecheck`.

### Status

Not started.

## Milestone 3: Implement measured profile matching and compatibility UI

### Work

- Add the frozen bounded profile registry with all existing evidence states:
  exact Qwen/Serena as `development-only`, rejected profiles as
  `unsupported`, and no invented standard or fallback profile.
- Implement a pure deterministic matcher with conservative memory/provider
  margins, stable rejection reasons, and no match on unknown facts.
- Integrate compatibility preflight before starting a model child.
- Add accessible UI for checking, compatible, development-only, unavailable,
  unknown, and failed detection states; expose only closed reasons.
- Add explicit profile selection only for admitted compatible profiles and
  persist only the bounded profile preference.
- Preserve the existing native-only development gate until a standard profile
  is admitted.

### Validation

- Run table-driven matching tests for every requirement, boundary,
  max-plus-one, unknown, ambiguity, stale preference, and rejected-profile
  case.
- Run component tests for keyboard, screen-reader status, focus, selection,
  reduced motion, forced colors, and content-safe errors.
- Run `pnpm.cmd test:browser` and `pnpm.cmd test:native-startup`.
- Run `pnpm.cmd check:portable`.

### Status

Not started.

## Milestone 4: Implement identity-safe operational recovery

### Work

- Add a bounded desktop recovery state machine that classifies current native
  failures without exposing dynamic details.
- On failure, invalidate identity before playback, preparation, queued-unit,
  synthesis, and service cleanup.
- Add one explicit user-triggered restart path for classified recoverable
  failures. Start a fresh service/profile identity only after the old process
  tree and retained audio ownership are zero.
- Resume from the latest valid heard segment boundary without advancing past
  unheard content.
- Treat cancellation timeout, protocol rejection, and cleanup failure as
  containment failures; do not immediately restart or retry the segment.
- Keep repeated failure stable and accessible, and keep degraded buffering
  observable rather than hiding it with retry or artificial waits.
- Add fake-child scenarios for load/warm failure, crash, hang, cancellation
  timeout, malformed response, resource exhaustion, playback failure, and
  failed restart.

### Validation

- Run deterministic coordinator/player/client/supervisor race and cleanup
  tests under manual clocks and injected children.
- Prove one service tree maximum, zero stale audio, zero skipped progress,
  fixed diagnostic history, and zero retained units after every terminal
  path.
- Run `pnpm.cmd test:browser`.
- Run `pnpm.cmd test:native-startup`.
- Run `pnpm.cmd check`.

### Status

Not started.

## Milestone 5: Freeze and evaluate a CPU-compatible fallback candidate

### Work

- Identify a legally and technically eligible local CPU candidate without
  reusing a rejected profile by name alone.
- Before result-bearing execution, freeze its exact artifact/runtime identity,
  license, offline setup, corpus, normalization, quality, startup, throughput,
  memory, cancellation, failure, cleanup, and packaging gates using the
  candidate-neutral M006 harness.
- Keep candidate dependencies isolated from the base `services/tts` lock and
  keep model artifacts outside Git.
- Execute deterministic preflight, performance, bounded quality, cancellation,
  privacy, and cleanup evaluation on the declared hardware.
- Record a content-safe selection decision. Admit the profile to the product
  registry only if every mandatory gate passes.
- If no candidate can be selected because of licensing ambiguity, unavailable
  hardware, or failed gates, retain `cpuFallback: unsupported`, record the
  blocker, and stop M010 rather than fabricating fallback.

### Validation

- Run `pnpm.cmd benchmark:tts:preflight` with the frozen candidate input.
- Run `pnpm.cmd benchmark:tts:measure` only after the authority commit.
- Run the applicable existing quality generate/submit/finalize/cleanup
  commands if the frozen authority admits human evaluation.
- Run `uv run --project services/tts --locked pytest services/tts`.
- Validate summary schemas, authority ancestry, offline isolation, cleanup,
  artifact exclusion, and content-safe committed evidence.

### Status

Not started. This is a hard evidence gate for claiming CPU fallback.

## Milestone 6: Integrate admitted profiles and run the resilience matrix

### Work

- Integrate only profiles admitted by Milestone 5 and earlier frozen evidence.
- Run the exact-development GPU path, every admitted fallback path, simulated
  unsupported/unknown hosts, and the complete recovery transition matrix.
- Prove conservative profile recommendation, explicit switching between
  admitted profiles, identity-first cancellation, one process tree, bounded
  memory/audio/text/diagnostic state, and non-skipping heard-position resume.
- Run a sustained session covering play, pause, navigation, underrun/refill,
  resource pressure, service crash, explicit restart, fallback selection,
  publication replacement, and application exit.
- Measure startup, RTF, buffering seconds per playback minute, RAM, VRAM,
  cancellation/restart latency, underruns, failures, and cleanup separately
  for each profile. Do not average incompatible profiles into a support claim.
- Verify the outbound-blocked offline boundary and zero generated-audio
  persistence.

### Validation

- Run `pnpm.cmd test:tts:exact-host`.
- Run `pnpm.cmd test:tts:adaptive-exact-host`.
- Run `pnpm.cmd test:tts:handoff-host`.
- Run the new M010 exact-host/fallback command only after it is added to
  repository configuration and documented.
- Run `pnpm.cmd test:browser`.
- Run `pnpm.cmd test:native-startup`.
- Run `pnpm.cmd check` and `pnpm.cmd check:portable`.

### Status

Not started.

## Milestone 7: Record support decisions and close validation

### Work

- Record the final support matrix, selected/rejected profiles, safety margins,
  recovery policy, known limitations, and any superseding ADR amendments.
- Update product requirements, setup, testing, troubleshooting, architecture
  overview, canonical system diagram, roadmap, and this ExecPlan with actual
  results.
- Review the complete diff for unrelated changes, private hardware identity,
  sensitive paths, secrets, generated audio, model weights, raw logs/results,
  unbounded state, and unsupported claims.
- Confirm dependency purpose, license, lock, offline behavior, and packaging
  implications for every admitted runtime.
- Move this plan to `docs/plans/completed/` only after deterministic,
  hardware, privacy, repository, and required pull-request checks pass.

### Validation

- Run `pnpm.cmd check`.
- Run `pnpm.cmd check:portable`.
- Run `git diff --check`.
- Verify required Ubuntu portable and Windows native pull-request checks.
- Confirm every `supported` or fallback claim points to frozen passing
  evidence and every limitation remains visible.

### Status

Not started.

## Testing and benchmark strategy

### Deterministic validation

Use injected probe ports, fake child scenarios, manual clocks, synthetic EPUBs,
and generated PCM. Cover exact limits and max-plus-one cases for every report,
registry, diagnostic, retry, process, text, and audio bound. Test all
failure/recovery transitions, including late callbacks from obsolete service,
session, generation, player, navigation, and persistence identities.

Contract changes require schema fixtures, runtime decoders, generated
validators, TypeScript/Python/Rust conformance where applicable, malformed
input, unknown field, unsupported version, and bounded-number tests.

### Hardware-specific validation

Keep deterministic proof separate from hardware claims. Freeze each candidate
and measurement authority before execution. Report results per exact host and
profile. A simulated host can prove matcher behavior but cannot establish
support, quality, throughput, cancellation, or memory claims.

The current exact Windows/CUDA host may validate development-only Qwen/Serena
and recovery behavior. A CPU fallback needs its own admitted candidate and
measured host evidence. Unavailable hardware, a failed candidate, or licensing
ambiguity is a legitimate blocker.

### Privacy and repository validation

All fixtures use repository-authored synthetic text. Reports and committed
summaries contain only closed labels, quantities, hashes, and bounded
content-free observations. Ignore and clean raw audio/results. Scan tracked
changes for user directories, command lines, environment values, hardware
serials, secrets, model weights, generated audio, and book text before
closeout.

## Risks and rollback

- Platform APIs may expose incomplete or unstable facts. Normalize to
  `unknown` and fail closed; do not parse arbitrary diagnostics into product
  claims.
- GPU-reported dedicated memory, provider availability, and usable model
  memory can differ. Use conservative measured margins and runtime preflight.
- A registry can make stale evidence look current. Bind entries to immutable
  identities and evidence hashes, and reject mismatches.
- CPU fallback may remain too slow or low quality. Keep it unselected unless
  all frozen gates pass; an unavailable fallback is safer than a false claim.
- Automatic recovery can create duplicate workers or stale playback. Start
  with explicit one-shot restart after verified cleanup and retain zero
  automatic segment retry.
- Restart can skip content if persistence advances optimistically. Resume from
  the canonical latest-heard boundary and prefer bounded replay over skipping.
- Hardware UI can leak identity or overwhelm users. Expose closed support and
  reason states, not raw inventory.
- Profile-specific buffer tuning can hide poor RTF or grow memory. Keep the
  M008 maxima immutable unless a separately frozen authority changes them.
- New native/runtime dependencies may complicate M011 packaging. Document
  purpose, alternatives, license, lock, offline behavior, size, and rollback
  before adoption.

Each milestone must remain independently reversible. Host detection and
matching can remain model-free if fallback evaluation fails. Recovery UI can
remain behind the exact-development availability gate. Rollback must stop the
active service, release audio, preserve the latest valid heard locator, and
remove only the new bounded preference/version; it must not delete books or
rewrite unrelated reader state.

## Progress log

- 2026-07-27: Verified M009 completion from exact-host evidence, complete-diff
  repository/privacy review, and passing pull request #133 Ubuntu/Windows
  checks; archived M009 before planning M010.
- 2026-07-27: Audited the completed M006-M009 decisions and current
  capability, protocol, native supervisor, typed client, coordinator, buffer,
  playback, synchronization, and persistence boundaries.
- 2026-07-27: Created this focused roadmap-Milestone-10 ExecPlan. No M010
  production implementation or new support/fallback claim has started.

## Discoveries and decisions

- `CapabilityReportV1` is the wrong place for hardware inventory and profile
  recommendation: it is deliberately model-independent and part of frozen
  protocol v1. M010 requires a separate contract if host data crosses Tauri.
- Current exact-demo availability proves only that native configuration exists;
  it does not prove host compatibility or successful model load.
- ADR-0013 and `selection-v5` remain binding. The exact Qwen/Serena profile is
  development-only, and the tested CPU/dual-worker alternatives are rejected.
- Deterministic hardware matching and operational recovery can be implemented
  without a new TTS candidate, but a claimed CPU fallback cannot.
- The safest initial recovery is an explicit bounded restart after
  identity-first teardown and verified cleanup. Automatic synthesis retry is
  not admitted by current evidence.
- M009's non-skipping heard checkpoint is the recovery resume authority. A
  model/service failure must never advance it.
- Raw host inventories need not enter React state or persistence. Closed
  compatibility and reason codes are sufficient for product UI.

## Final validation results

Not yet available. M010 is approved for sequential implementation, but all
seven milestones are not started. The plan is complete only when:

- hardware/profile/recovery authority is frozen before results;
- privacy-safe detection and deterministic matching pass;
- operational recovery preserves identity, bounds, and heard progress;
- a CPU-compatible fallback passes frozen evaluation or a later durable
  decision explicitly resolves the hard fallback gate;
- exact-host and admitted-profile resilience evidence passes;
- repository/privacy review and required pull-request checks pass; and
- support claims, limitations, architecture, and roadmap status match the
  recorded evidence.
