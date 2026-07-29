# M010 hardware profiles, fallback, and operational resilience

## Goal

Add a privacy-safe, evidence-backed hardware compatibility and recovery layer
around the completed local narration path so VoxLeaf can make conservative
profile recommendations, explain unavailable configurations, recover from
classified local-service failures without replaying stale audio, and use a
CPU-compatible fallback only if a separately frozen evaluation proves one.

Completed M009.1 supplies the stabilized reader shell, visible synchronization
projection, compact narration status, and locator-backed paragraph action that
M010 compatibility and recovery UI must preserve.

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

Roadmap Milestones 1 through 9 and M009.1 are complete. M010 Milestones 1-5
are also complete. Commit `8b7e153abef0639c54f148684ec1bab7e2d34a10` freezes the
result-blind hardware/profile/recovery authority, canonical compatibility
report, executable desktop tables, native API/permission audit, and ADR-0019
before any M010 host measurement. Implementation checkpoint
`842770f7780930aeb971db7777e61ca34fb53e78` adds the bounded native Windows
probe and typed desktop decoder without retaining measured values. Milestone 3
checkpoints `e7e01f1` and `a519c6c` add the immutable measured registry,
deterministic matcher, bounded preference, compatibility UI, pre-start
enforcement, and fixed-reader-layout correction. Fallback admission, recovery
behavior, and standard support claims have not started.

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

Milestone 5 now selects exact Piper/davefx as the supported speed-focused CPU
fallback after the content-safe v6 result passed every frozen gate. The
currently executable product registry and service still contain only the
earlier three entries and exact Qwen adapter; Milestone 6 must integrate Piper
atomically with settings and resilience proof.

The current `CapabilityReportV1` is intentionally model-independent. It
reports only `supported`, `unsupported`, or `unknown` for local generation,
streaming, cancellation, hardware acceleration, and CPU fallback. It contains
no host identity, device inventory, engine identity, profile identity, memory
quantity, provider, precision, or recommendation. Protocol v1 embeds that
report and must not be silently expanded.

The desktop now has a typed internal command client for the canonical
identity-free host report in addition to the content-free exact-demo
`available`/`unavailable` flag. Native configuration still decides whether the
model-free or exact child can be started. Milestone 3 now matches that report
against the immutable measured registry, presents only closed compatibility
results, persists only one bounded profile ID, and enforces a fresh match
before the exact child starts. The recovery state machine is implemented and
Piper is selected, but the supported fallback is not yet executable or
user-visible and no standard support matrix exists.

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
  complete generation-configuration identity, measured resource requirements,
  evidence provenance, conservative safety margin, and a support state.
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
- Replacing M009.1's sole reader scroll owner, compact/collapsible narration
  surface, truthful loaded-duration presentation, bounded contextual leaf, or
  passive-scroll isolation with a second compatibility/recovery path.
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
- `docs/plans/completed/M009-001-reader-experience-stabilization.md`
- `docs/architecture/tts-service-protocol-v1.md`
- `docs/architecture/adaptive-buffer-authority-v1.md`
- `docs/architecture/synchronization-authority-v1.md`
- `docs/architecture/reader-experience-authority-v1.md`
- `docs/architecture/hardware-profile-recovery-authority-v1.md`
- `docs/architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md`
- `docs/architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md`
- `docs/architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md`
- `docs/architecture/decisions/ADR-0018-reader-experience-stabilization.md`
- `docs/architecture/decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md`
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

- an immutable profile and engine/model/voice/runtime identity plus the
  complete bounded generation configuration or its canonical hash;
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
  provenance, complete generation-configuration identity, memory safety
  margins, deterministic matching order, tie behavior, user-selection
  constraints, and persisted-preference limits.
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

- Focused shared contract command:
  `pnpm.cmd --filter @voxleaf/shared test`
  - Actual: passed; 20 files and 209 tests. The generator check verified 17
    generated contract files.
- Focused native command:
  `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml hardware_profile_authority`
  - Actual: passed; 4 authority/audit tests.
- Focused desktop command:
  `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/hardware-profile-authority.test.ts`
  - Actual: passed; 1 file and 8 tests.
- TypeScript command: `pnpm.cmd typecheck:typescript`
  - Actual: passed for shared, EPUB, and desktop packages.
- Python command: `pnpm.cmd typecheck:python`
  - Actual: passed; mypy checked 90 source files. The command was rerun
    outside the sandbox after its first attempt was denied access to uv's
    normal AppData cache.
- Full repository command: `pnpm.cmd check`
  - Actual: passed after adding the new schema ID to the Python fixture
    conformance inventory. Formatting, linting, TypeScript/Python typechecks,
    20 shared test files with 209 tests, 34 EPUB test files with 555 tests, 35
    desktop test files with 338 tests, 29 Rust tests, 234 Python tests, and all
    production builds passed.
  - Existing non-failing warnings remained for the CSS Custom Highlight
    pseudo-element, the desktop bundle-size advisory, and pytest's inability
    to write its optional cache in the local checkout.
- Command: `git diff --check`
  - Actual: passed.
- Authority review:
  - Actual: passed. No M010 host probe or result-bearing measurement ran.
    Fixtures are repository-authored synthetic/unknown values. No supported
    profile, CPU fallback, recommendation, or automatic retry/restart was
    admitted.

### Status

Complete on 2026-07-28. The pre-result authority checkpoint is
`8b7e153abef0639c54f148684ec1bab7e2d34a10`.

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

- Focused native command:
  `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml host_profile_detection`
  - Actual: passed; 9 injected/production tests.
- Focused desktop command:
  `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/host-profile-client.test.ts`
  - Actual: passed; 1 file and 6 tests.
- Focused Rust lint:
  `cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings`
  - Actual: passed.
- Focused TypeScript lint:
  `pnpm.cmd exec eslint apps/desktop/src/tts/host-profile-client.ts apps/desktop/src/tts/host-profile-client.test.ts`
  - Actual: passed.
- Focused desktop typecheck:
  `pnpm.cmd --filter @voxleaf/desktop typecheck`
  - Actual: passed.
- Full native command:
  `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml`
  - Actual: passed; 38 tests.
- Full shared command: `pnpm.cmd --filter @voxleaf/shared test`
  - Actual: passed; 20 files and 209 tests. The generator check verified 17
    generated contract files.
- Full desktop command: `pnpm.cmd --filter @voxleaf/desktop test`
  - Actual: passed; 36 Vitest files and 344 tests plus 7 native-driver client
    tests.
- Repository typecheck: `pnpm.cmd typecheck`
  - Actual: passed for shared, EPUB, desktop, and 90 Python source files.
- Full repository command: `pnpm.cmd check`
  - Actual: passed in local PowerShell after the sandboxed attempt was denied
    access to uv's normal AppData cache. Formatting, linting, TypeScript/Python
    typechecks, 20 shared files with 209 tests, 34 EPUB files with 555 tests,
    36 desktop files with 344 tests, 7 native-driver client tests, 38 Rust
    tests, 234 Python tests, the desktop release build, and both Python
    distributions passed.
  - Existing non-failing warnings remained for the CSS Custom Highlight
    pseudo-element, the desktop bundle-size advisory, and pytest's inability
    to write its optional cache in the local checkout.
- Command: `git diff --check`
  - Actual: passed.
- Scope/privacy review:
  - Actual: passed. The report exposes no name, identifier, LUID, vendor,
    device ID, path, command output, environment, timestamp, book content,
    audio, recommendation, or support state. No model, download, telemetry,
    persistence, non-loopback request, shell/plugin permission, or profile
    matcher was added.

### Status

Complete on 2026-07-28. The implementation checkpoint is
`842770f7780930aeb971db7777e61ca34fb53e78`; documentation reconciliation,
full validation evidence, and final permission/privacy hardening are recorded
at `fedf894e734016f720662caa155c9760d7216175`. The probe creates no support
or fallback claim.

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

Complete on 2026-07-28. Checkpoint `e7e01f1` adds the measured registry,
pure matcher, bounded profile preference, single-concurrency compatibility
coordinator, product preflight, accessible UI, and deterministic/component
coverage. Checkpoint `a519c6c` moves the collapsed panel into the existing
reader top bar so it does not reduce the fixed reading viewport and restores
the browser highlight/follow geometry.

All deterministic, browser-assertion, portable, native Windows, and required
pull-request gates pass. Two local `pnpm.cmd test:native-startup` attempts built
the release executable successfully and then stopped before application mount
at the documented `webdriver-session-not-created` WebView2 automation boundary;
no product assertion ran or failed. Pull request #146's clean-host Windows
native foundation job subsequently passed, satisfying the authoritative
host-specific packaged gate. Its Ubuntu portable foundation job also passed.

No profile is `supported`, so no automatic recommendation or CPU fallback is
available. Exact Qwen/Serena can be active only as `development-only` when the
measured host match and existing native development gate both pass.

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
- Prove recovery and profile changes remain correct from both the compact
  narration surface and an M009.1 leaf-originated narration replacement.

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

Complete locally as of 2026-07-28 on branch
`feat/m010-m4-identity-safe-operational-recovery`, created from merged main
commit `1d31382730bdc3cf7edfb4b664bb4ded4c6fb5be`.

Checkpoint `576fcbc` adds the pure bounded recovery controller and exhaustive
transition/diagnostic tests. Checkpoint `02cc7b4` integrates verifiable PCM
cleanup, closed service/playback classification, identity-first containment,
zero-owner verification, latest-heard resume, fresh recovery identities, one
explicit accessible restart, terminal containment, and compatibility
recheck/profile-selection episode reset.

The implementation remains desktop-local and changes no shared schema,
protocol-v1 field, Python service, native command or permission, dependency,
buffer limit, narration segmentation, or persisted reader-state shape.
Focused coordinator/player/controller/UI tests pass (5 files, 42 tests).
Portable, browser, release-packaged native, and full native Windows validation
also pass as recorded below. Required pull-request checks remain the remote
merge gate.

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

Complete on 2026-07-28. The exact Piper 1.4.2 /
`es_ES-davefx-medium` CPU candidate,
isolated lock, normalized synthetic corpus, schemas, performance/quality
gates, cancellation/cleanup rules, offline controls, and GPL/CC0 packaging
obligations are frozen in `profile-v6`. An invalid first runner session
exposed an obsolete v1 cancellation-case lookup after performance collection
and before all cancellation, memory, and cleanup evidence. Its observations
are not candidate evidence and cannot be promoted. Corrected v6 authority
binds both cancellation case identifiers before the first valid official
execution. The corrected machine run, one-maintainer Spanish quality screen,
privacy/cleanup derivation, and content-safe selection pass every conjunctive
gate. `selection-v6` and ADR-0020 admit Piper as the supported speed-focused
CPU fallback. Runtime/settings integration remains Milestone 6 work.

The executable three-entry registry intentionally remains unchanged at this
checkpoint. Adding a `supported` Piper entry before its service adapter exists
would make the matcher recommend an ID the coordinator cannot start and would
disable the working Qwen development demo on compatible hosts. Milestone 6
must add the Piper registry entry, service adapter, native configuration, and
settings choice atomically.

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
  leaf-originated replacement, publication replacement, and application exit.
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

In progress on 2026-07-29 on branch
`feat/m010-m6-profile-integration-resilience`, created from merged main commit
`2b81b028fe6188e17f524d5720e68827511e3c05`. Authority, service, native,
desktop selection, recovery, and exact-host boundaries were re-read before
implementation. The integration retains protocol v1, uses one service tree,
and adds no automatic retry.

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

- 2026-07-29: Started Milestone 6 sequentially on
  `feat/m010-m6-profile-integration-resilience` from merged main
  `2b81b028fe6188e17f524d5720e68827511e3c05`. Re-read the frozen profile and
  recovery authority, protocol v1, adaptive buffer authority, accepted Piper
  decision, canonical architecture, and existing registry/service/native/UI
  implementation. Selected a profile-aware one-tree integration: exact Piper
  remains an isolated local process, its frozen 22.05-kHz synthesis is
  converted inside the adapter to protocol v1's bounded 24-kHz mono float32
  unit, and explicit profile changes invalidate and clean up old narration
  before native reconfiguration. No generation setting, protocol field,
  automatic retry, buffer limit, or persistence boundary changes.
- 2026-07-28: Started Milestone 5 sequentially on
  `feat/m010-m5-cpu-fallback-evaluation`. Selected the new Piper 1.4.2
  ONNX/CPU `es_ES-davefx-medium` candidate after excluding previously rejected
  profiles. Pinned the official engine source/wheel, voice-repository
  revision, three local artifact hashes, isolated Python 3.12 lock, and
  explicit GPL-3.0-or-later/CC0 distribution boundary. No Piper audio was
  generated during candidate intake.
- 2026-07-28: Added the pre-result `profile-v6`, eight-case repository-authored
  `narration-v1` Spanish corpus, private raw schema, content-safe summary
  schema, and detailed architecture authority. The frozen evaluation inherits
  candidate-neutral M006 measurements, uses five cold loads, 16 warm
  generations, at least 180 sustained media seconds, five termination-backed
  cancellation trials, zero retries, a 4 GiB RAM ceiling, zero GPU
  allocation, and one fluent-Spanish-maintainer MVP quality review only after
  every machine gate passes. Product registry state remains unchanged.
- 2026-07-28: Implemented model-free v6 authority loading, exact local
  Piper/ONNX CPU placement checks, bounded 250-millisecond publication after
  native sentence completion, candidate-neutral performance and
  termination-backed cancellation execution, eight-sample quality routing,
  one-maintainer eligibility, closed raw journaling, machine assessment, and
  schema/ancestry/content-safe result derivation. The derivation deletes both
  private sessions before publishing a result. Focused tests and the complete
  Python suite pass; no Piper synthesis has run yet.
- 2026-07-28: Froze the final executable v6 authority at
  `ceccdf56b4e33153ae4615f7ff285e67636d73de`. The checkpoint contains profile
  SHA-256 `f8828876715e3ceafddebf59063b3651f5a007c8bb6512cf4df11e14488b7c34`,
  the exact loader/adapter, closed schemas, machine assessment, disposable
  eight-sample quality workflow, result derivation, tests, and operator
  commands. Official performance and quality must execute only from a clean
  strict descendant and name this authority commit.
- 2026-07-28: Ran official preflight from clean strict-descendant commit
  `480be8cca12d2f6b11c7fbea7779172c8abb37b6`. The exact candidate
  interpreter and all three local Piper voice artifacts matched their frozen
  hashes. Windows x86_64, Python 3.12.10, the 20-logical-processor reference
  CPU, power, disk, RAM, provider, and process-memory probes passed. Preflight
  stopped before candidate load solely with `network-isolation`: the existing
  application-scoped outbound block is not bound to the new Piper interpreter.
  No pilot, official waveform, raw performance session, or listening material
  was produced. An elevated Windows administrator must replace that exact
  firewall binding before execution can continue.
- 2026-07-28: After the administrator bound the outbound firewall rule to the
  isolated Piper interpreter, preflight passed every frozen artifact,
  isolation, interpreter, Windows x86_64, CPU, RAM, disk, power, provider, and
  memory-probe check. Invalid session
  `a4e4c1ed76f246b49260125db2d7f4de` then completed 5 cold loads, 16 warm
  generations, and 24 sustained generations before the shared runner raised
  `crash` while resolving the obsolete v1-only
  `es-narrative-near-hard` case. It produced zero cancellation trials and no
  memory result, so it is incomplete runner evidence rather than a Piper
  failure and is forbidden from assessment or promotion.
- 2026-07-28: Corrected `profile-v6` freezes `es-v6-arrival` for the four
  ordinary cancellation races and `es-v6-date-time` for the near-hard race.
  The harness resolves these versioned cases explicitly, and a regression
  test proves both are present. This authority correction precedes the first
  valid official execution; the invalid raw session is retained only until
  its failure and cleanup are durably recorded.
- 2026-07-28: Froze the corrected executable v6 authority at
  `9a2f74845853e84635b419a4e65170c9a2c207ee`, with profile SHA-256
  `ec0ef6aceedfc2ed4df199cc276b5c8365f979921311a7d2cd3d813546e1bd48`.
  Ruff format/lint, mypy, and all 240 Python tests pass. The invalid session is
  authorized for deletion and the first valid official run must execute from
  a clean strict descendant of this checkpoint.
- 2026-07-28: Deleted only invalid ignored session
  `a4e4c1ed76f246b49260125db2d7f4de` after verifying its resolved directory
  was exactly two levels below `benchmarks/results/raw`. The private raw
  observations are not recoverable and no reviewable evidence was removed.
- 2026-07-28: From clean strict-descendant commit
  `d9f2929be40e40b2fa85078816ea854fad9a6c69`, corrected official preflight and
  execution passed. The run completed 5 cold loads, 16 warm generations, 24
  sustained generations, all 5 cancellation races, and 198.356 seconds of
  sustained media with zero failed gates. Total sustained RTF was
  `0.02511192544515474` and peak process-tree RAM was 411,070,464 bytes.
  Machine assessment admitted, but did not perform, human quality review.
- 2026-07-28: Generated and finalized the admitted disposable eight-sample
  v6 listening session for the single fluent-Spanish MVP maintainer. Its
  browser-local scorecard is pending; no quality score or candidate selection
  has been inferred before that review.
- 2026-07-28: The evaluator scored overall quality `4.621428571428572`.
  Before result derivation, the evaluator clarified that one marked
  temperature-sample issue omitted a vowel but remained understandable and
  preserved meaning. The correction workflow preserved the original private
  scorecard, changed only the Boolean classification, retained every numeric
  score, and re-aggregated zero meaning-changing defects.
- 2026-07-28: Derived schema-valid
  `benchmarks/tts/cpu-fallback-result-v6.json` with zero failed gates and
  deleted both private performance and listening sessions. `selection-v6` and
  ADR-0020 admit the exact Piper profile as a supported CPU fallback and
  future user-selectable speed-focused option. Qwen/Serena remains
  development-only; Milestone 6 owns actual runtime/settings integration.
- 2026-07-28: Checkpoint `f3163ca` fixes result derivation so the public
  summary retains the measured execution commit while a clean descendant may
  perform derivation, and adds the one-time immutable evaluator correction
  record. All 241 Python tests pass. Checkpoint `f19f440` commits the
  schema-valid result, `selection-v6`, ADR-0020, and a committed-result
  regression test.
- 2026-07-28: Closed Milestone 4 local validation. Portable and full native
  foundation checks pass; the complete browser matrix passes 6/6; and the
  release-packaged native smoke passes. The native rerun exposed and corrected
  a content-free harness defect where two fixed 24px comfort insets created an
  impossible region inside a 38px DPI-scaled reader viewport. The replacement
  keeps the 24px maximum but caps each inset at one quarter of available
  height.
- 2026-07-28: Implemented the Milestone 4 recovery authority in checkpoints
  `576fcbc` and `02cc7b4`. Operational failures now replace identity before
  bounded teardown, release PCM in four-unit turns with a completion promise,
  terminate the supervised service, and verify zero client/scheduler/player
  ownership before exposing any action. One explicit restart uses fresh
  identities and the latest heard locator; mid-segment recovery replays the
  segment start. Protocol failure, cancellation timeout, cleanup failure, and
  failed/repeated recovery remain stable and non-retryable.
- 2026-07-28: Added compact accessible recovery status/action presentation and
  wired explicit compatibility recheck or successful profile selection as the
  only in-session recovery-budget reset. The pure controller retains at most
  eight frozen content-free diagnostic entries. Focused validation passes: 5
  files / 42 tests plus desktop typechecking and `git diff --check`.
- 2026-07-28: Started Milestone 4 sequentially on
  `feat/m010-m4-identity-safe-operational-recovery` from merged main
  `1d31382730bdc3cf7edfb4b664bb4ded4c6fb5be`. Re-read the frozen M010
  transition/failure authority and the implemented M007-M009 lifecycle
  boundaries. Selected a desktop-local implementation: one bounded pure
  recovery controller, existing identity-first product teardown, asynchronous
  four-unit audio release with a completion boundary, existing native
  cancel/shutdown containment, zero-ownership verification, latest-heard
  resume, and one explicit UI action. No automatic retry or restart is
  authorized.
- 2026-07-28: Implemented Milestone 3 sequentially. Added the immutable
  evidence-backed Qwen/Serena, Qwen/Aiden, and Supertonic/F1 registry; pure
  fail-closed matching with the frozen result-blind margins; bounded
  future-version-safe profile preference; one concurrent compatibility probe;
  app-start, explicit, resume, and immediate pre-start rechecks; and compact
  accessible compatibility states. Rejected profiles remain unavailable and
  there is no supported recommendation or CPU fallback.
- 2026-07-28: The first Chromium run exposed that the collapsed compatibility
  panel occupied a new row and reduced the fixed reader viewport at 800x400,
  breaking existing active-locator and highlight/follow geometry. Checkpoint
  `a519c6c` moved the panel into the existing top bar when a publication is
  ready. All six browser assertions then passed. The documented Windows
  preview-child teardown still required the bounded wrapper to end by timeout.
- 2026-07-28: `pnpm.cmd check:portable` passed the complete portable matrix.
  Two packaged-native attempts built the release executable but stopped before
  app mount at `webdriver-session-not-created`; no native product assertion
  failed, and clean-host CI remained the authoritative packaged gate.
- 2026-07-28: Pull request #146 run
  [`30414223390`](https://github.com/mmjosedaniel/voxleaf/actions/runs/30414223390)
  passed both required checks on the Milestone 3 implementation head:
  Ubuntu portable foundation in 1m56s and Windows native foundation in 14m36s.
  The clean-host Windows result closes the local pre-mount automation gap, so
  Milestone 3 is complete.
- 2026-07-28: Completed Milestone 2. Added a native injected probe port,
  single-concurrency guard, bounded normalization, direct Windows
  OS/storage/DXGI/D3D12/DirectML/CUDA adapters, the narrow Tauri command, and a
  typed desktop decoder. Deterministic tests cover the frozen complete,
  partial, denied, malformed, multi-adapter, integrated-only, low-memory,
  no-provider, unknown, ambiguous, unsupported-platform, and fixed-error
  cases. The implementation checkpoint is
  `842770f7780930aeb971db7777e61ca34fb53e78`. No measured host value was
  retained and no profile was matched. Documentation, full validation
  evidence, and final permission/privacy hardening are retained at
  `fedf894e734016f720662caa155c9760d7216175`.
- 2026-07-28: Completed Milestone 1 before any M010 host measurement. Added
  canonical `HostProfileCompatibilityReportV1`, strict fixtures/generated
  validators/runtime decoder, exact enum/unit/max/unknown semantics, the
  executable profile and recovery authority, a native API/permission audit,
  the detailed authority document, and ADR-0019. Focused shared/native/desktop
  tests, TypeScript and Python typechecks, and `git diff --check` pass. The
  result-blind checkpoint is
  `8b7e153abef0639c54f148684ec1bab7e2d34a10`.
- 2026-07-28: Verified completed M009.1 closeout. Pull request #142 passed the
  required Ubuntu portable and Windows native foundation checks and merged as
  `e1b3b7d80696027e511f44236d12e7168d85f927`. M010 is now the next approved
  active plan; no M010 support or fallback claim has started.
- 2026-07-28: Sequenced M009.1 before M010 so compatibility and recovery state
  is implemented against the stabilized reader shell. Required future profile
  identity to include complete generation settings, so a later
  natural-versus-stable narration comparison cannot become an untracked
  temperature toggle.
- 2026-07-27: Verified M009 completion from exact-host evidence, complete-diff
  repository/privacy review, and passing pull request #133 Ubuntu/Windows
  checks; archived M009 before planning M010.
- 2026-07-27: Audited the completed M006-M009 decisions and current
  capability, protocol, native supervisor, typed client, coordinator, buffer,
  playback, synchronization, and persistence boundaries.
- 2026-07-27: Created this focused roadmap-Milestone-10 ExecPlan. No M010
  production implementation or new support/fallback claim has started.

## Discoveries and decisions

- The official `windows` crate version `0.61.3` was already present in the
  resolved Rust graph. Promoting it to a direct Windows-only dependency gives
  reviewed typed COM/Win32 bindings without adding a resolved package, Tauri
  plugin, renderer permission, or general inventory API.
- Provider-to-adapter association needs an identity only inside the native
  probe. DXGI/CUDA LUIDs are therefore transient join keys and are discarded
  before normalization; adapter descriptions, vendor/device IDs, driver
  strings, and raw errors are never collected into the report.
- The production probe can establish CUDA and DirectML capability without
  loading a model. CUDA uses the system `nvcuda.dll` loaded from `System32`
  with five fixed driver symbols; DirectML creates only bounded D3D12/DirectML
  capability devices. Missing/denied/malformed facts fail closed.
- Non-Windows builds deliberately return a schema-valid `unavailable` report.
  This keeps the cross-platform build honest without claiming Linux or macOS
  detection support.
- The existing Tauri configuration grants no renderer capability and uses no
  shell/process/OS/HTTP plugin. Milestone 1 therefore adds no dependency or
  permission. Milestone 2 must use reviewed direct Windows/provider APIs
  behind a native injected port and must not parse PowerShell, WMI query text,
  `wmic`, `nvidia-smi`, registry inventory, or arbitrary vendor output.
- The native boundary does not need a raw adapter list. The frozen report
  exposes one conservative identity-free capability slot for each closed
  provider and discards names, IDs, LUIDs, paths, and raw errors.
- Fixed result-blind capacity margins are now 25%/2,048 MiB for RAM,
  20%/1,024 MiB for VRAM, and 10%/2,048 MiB for storage, plus 4,096 MiB total
  physical RAM reserve. Unknown or non-complete host facts cannot match.
- Recovery now has a closed ten-code failure taxonomy, zero automatic
  attempts, at most one explicit action for an admitted recoverable episode,
  identity-first cleanup, M009 latest-heard resume authority, and fixed
  in-memory observation/diagnostic bounds.
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
- Completed M009.1 owns the reader-visible stabilization authority. M010 must
  preserve its
  dedicated reader viewport, compact/collapsible status, and leaf-originated
  identity replacement rather than reintroduce a second UI path.
- Natural and stable narration modes, if later admitted, must be evidence-backed
  profiles with complete generation-configuration identity. M010 must not
  expose a free-form temperature control.
- Raw host inventories need not enter React state or persistence. Closed
  compatibility and reason codes are sufficient for product UI.
- The historical evidence supports exactly three initial registry records.
  Their presence is not admission: the rejected Qwen/Aiden and Supertonic/F1
  records remain `unsupported`, while exact Qwen/Serena remains
  `development-only` and still requires its native configuration gate.
- Because recommendations are restricted to compatible `supported` entries,
  the current registry deliberately produces no automatic recommendation.
  The exact development entry may be selected only through its existing native
  gate; this preserves ADR-0013 rather than silently promoting the demo.
- Keeping the compatibility snapshot limited to closed matches/reasons means
  the raw host report can be discarded after each probe. The only persisted
  value is the versioned bounded profile ID, and a future-version preference is
  preserved without overwrite.
- A compact compatibility surface must share the existing ready-publication
  top bar rather than create another fixed-shell row. Otherwise short native or
  Chromium viewports can lose the reader geometry required for active locator,
  highlight, and focus-safe following evidence.
- Playback-backend failures arrive through an asynchronous callback; polling
  previously returned a stable `failed` player observation without throwing.
  The product coordinator must treat that closed state as an operational
  playback failure rather than rely only on synchronous exceptions.
- Releasing discarded PCM asynchronously is insufficient proof of cleanup.
  Recovery therefore waits on the player's bounded cleanup-completion promise
  and independently verifies zero retained/discarded units and zero scheduler
  resource counters before a replacement run can exist.
- `provider-unavailable` selects the compatibility/profile action, not the
  service-restart action. The narration surface therefore directs the user to
  compatibility controls and never presents a restart button that availability
  gating would reject.

## Final validation results

Milestones 1-5 implementation and local validation are complete and recorded
above. M010 remains in progress with Milestones 6 and 7 not started. The
runtime can produce the canonical bounded host report, derive content-free
compatibility, preserve only one bounded preference, reject a changed host
immediately before child start, and perform one identity-safe explicit
recovery after verified cleanup. The frozen v6 evaluation selects exact
Piper/davefx as the supported speed-focused CPU fallback, but the executable
registry, service adapter, settings choice, and resilience integration remain
Milestone 6 work. No automatic retry or standard Qwen support claim is
available.

Milestone 5 validation results:

- The corrected official run passed 5 cold, 16 warm, 24 sustained, and 5
  cancellation cases. Sustained synthesis produced 198.356 seconds of audio at
  aggregate RTF 0.0252 with 392 MiB peak process-tree RAM.
- One fluent Spanish evaluator scored all eight frozen samples. The immutable
  correction record clarified that the missing vowel remained understandable
  and did not change meaning; numeric scores remained unchanged. The resulting
  overall quality score is 4.621/5 with zero meaning-changing defects.
- The public `cpu-fallback-result-v6.json`, `selection-v6`, and ADR-0020 pass
  schema/authority tests and select Piper 1.4.2 with
  `es_ES-davefx-medium` as the supported CPU fallback.
- `pnpm.cmd check:portable` passed formatting, TypeScript/Python lint and
  typechecks, 20 shared files / 209 tests, 34 EPUB files / 555 tests, 42
  desktop files / 393 tests plus 7 native-client tests, 242 Python tests, and
  all portable builds.
- Repository/privacy review passed. Both private raw sessions are deleted, and
  no model, voice artifact, generated audio, private scorecard, EPUB, secret,
  or raw benchmark session is tracked.

Milestone 4 validation results:

- Focused recovery validation passed: 5 Vitest files / 42 tests plus desktop
  TypeScript typechecking and `git diff --check`.
- `pnpm.cmd check:portable`: passed formatting, TypeScript/Python lint and
  typechecks, 20 shared files / 209 tests, 34 EPUB files / 555 tests, 42
  desktop files / 393 tests plus 7 native-client tests, 234 Python tests, and
  portable builds.
- `pnpm.cmd test:browser`: the first run had one transient reading-line sample
  miss; the exact focused rerun passed, then the complete matrix passed all 6
  Playwright bodies.
- `pnpm.cmd test:native-startup`: the release application built on every run.
  The first two runs exposed a smoke-harness assumption: a fixed 24px top and
  bottom comfort inset was impossible inside a 38px DPI-scaled reader
  viewport, even though the accepted range intersected the real viewport.
  Capping the inset at one quarter of the available height while retaining the
  24px maximum corrected the content-free proof. The final release-packaged
  smoke passed root mount, protocol/supervisor crash recovery, file lifecycle,
  reader/synchronization, raster, persistence/restart, cleanup, and zero
  external requests.
- `pnpm.cmd check`: passed the complete native Windows foundation: formatting,
  TypeScript/Rust/Python lint, typechecks, the TypeScript/Python suites above,
  38 Rust tests, clippy, release Tauri build, and Python source/wheel builds.
- Scope/privacy review passed. The implementation adds no private path, host
  identity, EPUB, narration text outside test-local fixtures, generated audio,
  model weight, secret, raw host report, persisted recovery record,
  dependency, lockfile, Tauri permission, shared contract, or protocol field.
  Recovery snapshots and diagnostics contain only closed codes/phases,
  sequence, profile ID, counts, and durations; they contain no work identity,
  locator, prose, PCM, path, timestamp, or dynamic error.

Milestone 3 validation results:

- `pnpm.cmd --filter @voxleaf/desktop typecheck`: passed.
- `pnpm.cmd --filter @voxleaf/desktop test`: passed, 41 Vitest files / 381
  tests plus 7 native WebDriver-client tests.
- `pnpm.cmd test:browser`: all 6 Playwright test bodies passed after the
  fixed-reader-layout correction. The known Windows preview child remained
  attached after the passing test output, so the bounded command ended by
  timeout.
- `pnpm.cmd test:native-startup`: two release builds passed; both smoke
  attempts stopped before application mount with
  `webdriver-session-not-created`. No product assertion ran or failed.
- `pnpm.cmd check:portable`: passed, including format/lint, TypeScript and
  Python typechecks, 20 shared files / 209 tests, 34 EPUB files / 555 tests, 41
  desktop files / 381 tests plus 7 native-client tests, 234 Python tests, and
  all portable builds.
- `pnpm.cmd check`: passed the complete native Windows foundation, including
  format/lint/typechecks, the same TypeScript/Python suites, 38 Rust tests, the
  production Windows bounded-host-report smoke, native clippy, the release
  Tauri build, and Python source/wheel builds.
- Pull request #146 Ubuntu portable foundation: passed in 1m56s
  ([job `90457052148`](https://github.com/mmjosedaniel/voxleaf/actions/runs/30414223390/job/90457052148)).
- Pull request #146 Windows native foundation: passed in 14m36s
  ([job `90457052208`](https://github.com/mmjosedaniel/voxleaf/actions/runs/30414223390/job/90457052208)),
  closing the authoritative packaged validation gate.
- `git diff --check`: passed.
- Complete 28-file branch scope/privacy review: passed. Changes are limited to
  desktop matching/preference/UI/preflight code and tests plus current
  documentation. No private path, user identity, secret, EPUB, generated
  audio, model weight, raw host report/result, dependency, lockfile, Tauri
  permission, shared contract, protocol field, or recovery behavior was added.

The plan is complete only when:

- hardware/profile/recovery authority is frozen before results;
- privacy-safe detection and deterministic matching pass;
- operational recovery preserves identity, bounds, and heard progress;
- a CPU-compatible fallback passes frozen evaluation or a later durable
  decision explicitly resolves the hard fallback gate;
- exact-host and admitted-profile resilience evidence passes;
- repository/privacy review and required pull-request checks pass; and
- support claims, limitations, architecture, and roadmap status match the
  recorded evidence.
