# Native Rust organization audit record

Fresh read-only audits on execution base
`ed42154668bd71d500b5beab77485f9fd20ee2a2`, 2026-10-09, by the reused
`clean_code_auditor` (Sol high). The director accepts the decisions below.
Rust adaptation follows the active plan and refactor agent contracts. Audit
inspection is not a test pass or implementation acceptance.

## NR-CB — SKIP

Risk: low. Target: `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`.
Compared the current source, inline tests, main/supervisor/hardware callers,
MOD-B-AUDIT-01 and ADR-0046/0047/0050/0051.

The named manifest, download/integrity, assembly/extraction, preparation and
verification stages remain independently exercised. `DownloadIdentity` already
shares artifact mechanics while the separate loops retain their source policies
and ordered progress. `with_installed_runtime_lock` intentionally serializes
preparation, receipt validation, promotion and removal. New v3 exact-identity,
retained-v2 cleanup, concurrent verification and receipt-invalidation tests
reinforce the same boundary. Moving private manifest internals or five thin
command adapters would add sharing without removing duplication or a testing
obstacle. No concrete evidence revokes the previous SKIP.

Allowlist: none. Edits/ceiling: zero. Preserve all v3/legacy distinctions,
consent and live admission, source/hash/size/space bounds, cancellation,
receipt/mutation ordering, stop-before-removal, command/error and privacy
contracts. No per-unit tests are required for an unchanged target; independent
campaign closeout must check its unchanged identity. Documentation impact is
this decision and the active plan only. No decision required from the user.

## NR-MAIN — CHANGE (draft terms)

Risk: medium. Target: `main.rs::main`, nine CLI branches preceding Tauri setup.
The executable modes form a complete existing responsibility, including
positional UTF-8 conversion and exit handling, that currently obscures shell
registration/state/shutdown. One mechanical extraction clarifies ownership
without sharing supervisor state or adding a generic abstraction.

Closed allowlist (relative to `apps/desktop/src-tauri/src/`):

- `main.rs`
- `diagnostics/mod.rs` (new)
- `diagnostics/cli.rs` (new)

Move the argument iterator and complete match into
`diagnostics::cli::dispatch_if_requested()`, exposed narrowly through the
diagnostics module; call it before the unchanged Builder flow. Keep constants
and diagnostic implementations in their existing owners. Ceiling: three files,
250 added plus removed lines. No other source, tests, configuration, dependency,
feature, generated/frozen authority, runtime, or lifecycle changes.

Preserve first-argument OsStr equality, executable consumption, all nine branch
flags/calls, positional arguments, invalid-UTF-8 treatment, 0/1 exit mapping,
unknown/no-argument shell fallthrough and both feature configurations. Keep all
sixteen Tauri registrations, managed state, data-root setup, binary responses,
and exit-time force_stop unchanged.

Baseline and post-change acceptance, outside sandbox in local PowerShell:

1. `pnpm.cmd format:check:rust`
2. `pnpm.cmd lint:rust`
3. `pnpm.cmd test:rust`
4. `pnpm.cmd test:native-startup`
5. `git diff --check`

Lint/tests cover default and release-locked-runtime. The post-change review
compares all CLI branches and sixteen registrations. Model runs are N/A for
dispatch-only relocation: runtime construction, selection, synthesis and
lifecycle bodies remain unchanged. Existing exact/handoff Qwen harnesses and
the bilingual portfolio harness retain their routes; no Qwen run or repair is
claimed. Package/preflight/journey/lifecycle gates are N/A because no packaged
selection, verifier, acquisition, admission, installer or data-owner code moves.
Scope drift requires a new packet and gates. Contributor navigation and plan
documentation may change separately; process/trust topology does not change.

## NR-SUP — CHANGE (next draft unit)

Risk: medium. Closed allowlist: `apps/desktop/src-tauri/src/tts_service_supervisor.rs`
and new `apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs`.
Ceiling: two files, 280 added plus removed lines. Move only `run_host`, the
model-free executable diagnostic matrix, into a private child module and
re-export its existing entry point. Explicit child imports retain private access
without adding lifecycle accessors. Adjust its fixture include solely for the
new relative depth; resolved target and bytes must remain identical.

The diagnostic currently sits between Tauri adapters and model-backed helpers
inside the lifecycle owner. It has an independent responsibility: normal,
pending, crash/restart and Windows descendant scenarios, fixed 19,200-byte PCM,
timeout/polling, cancellation return, joins and shutdown. Native startup already
executes this complete matrix. Its relocation clarifies ownership without
changing the shared lifecycle implementation. It remains in normal compilation.

Keep `ExactRuntime`, `ServiceChild`, `ChildProcess`, `ServiceSession`, identity,
locks/timeouts, all supervisor methods, model-backed host functions, command/CLI
contracts, constants, tests, fixtures and dependencies unchanged. Their named
boundaries and directly exercised tests do not justify further extraction here.
All existing cfg branches and error paths remain identical. No new capability,
process, persistence, runtime/profile selection, or authority change is allowed.

Baseline/post commands: the same three Rust scripts, native-startup and diff
check listed for NR-MAIN. Review maps every moved statement and fixture include.
Model portfolio is N/A only for this diagnostic-body move, because shared
construction/synthesis/cancellation/profile implementations do not change.
Package/preflight/journey/lifecycle are N/A: their acquisition, installed
verification/removal, admission, release selection and installer owners remain
unchanged. Wider edits require a new packet and gates. No user decision needed.

## NR-HW / NR-AUTH — SKIP

Both low risk, zero-file/zero-line allowlists and no source edits or user
decisions. `host_profile_detection.rs` already has private `cfg(windows)`
`windows_probe`, injected `HostProbePort`/`NativeHostSnapshot`, independently
tested normalization/selection, exact admission predicates, and an RAII
`ActiveProbeGuard`. The FFI boundary already exists; splitting its file would
not reduce coupling or a demonstrated testing obstacle. Splitting report and
normalization would widen private sharing. Preserve the complete single-file
coverage of `implementation_has_no_process_network_model_or_persistence_surface`.

Keep the bounded adapter count, fields/units/providers, fail-closed unknown,
ambiguous and unavailable semantics, direct CUDA/DirectML/System32 APIs,
single-probe guard and pre-acquisition native gate. The tests cover exact and
one-below thresholds, unknown inputs, partial/denied/malformed reports, tied
selection, unsupported platform, privacy and the live Windows probe.

`hardware_profile_authority.rs` remains a test-only authority module: four
focused tests protect the approved native probe surface, absent renderer/plugin
capability, exact schema units/maxima/providers and identity/content-free
fixtures. Its helpers support those assertions. A relocation adds include-path
and navigation churn without a demonstrated benefit. All schema/config/fixture
targets and assertions remain untouched. Existing final Rust gates cover the
retained assertions; unchanged SKIPs need no individual test runs. No Unix
execution or additional platform support is claimed.

## NR-PROBE / NR-FAKE / NR-HANDOFF — SKIP

Each has low risk, no allowed source edits, zero diff ceiling and no pending
user decision. The existing paths remain unchanged; individual baseline/post
runs are N/A for unchanged targets, while final Rust/native gates cover their
retained deterministic assertions and applicable executable paths.

- `tts_protocol_probe.rs` owns one model-free transport feasibility probe with
  fixed request/metadata/PCM, bounded parsing, guarded child, host and Tauri
  entry points. Exact/boundary/malformed/stale/NaN/concurrency tests and
  `frozen_authority` independently protect it. Production framing intentionally
  differs; deduplication would undermine evidence independence. Preserve fixed
  bytes, 19,200-byte response, bounds/timeouts, stderr suppression, cleanup,
  both flags and every frozen assertion.
- `tts_service_fake_child.rs` is a cohesive synthetic peer with four explicit
  scenarios, named pending/generation helpers and an in-memory ordered-emission
  test. It is also the development default and an executable child. Moving it
  to test-only compilation or a diagnostics-only grouping would obscure real
  callers. Preserve normal/unknown scenario behavior, 75-ms delay, 4,800 samples,
  protocol order, pending identity, crash/descendant semantics and both feature
  modes. No testing obstacle or unnecessary complexity was established.
- `tts_service_handoff.rs` owns one frozen nine-case measurement driver with a
  shared termination helper, bounded single-unit consumer, zeroing/Drop and
  content-free results. Three tests protect retention, locator offsets and safe
  fields. Splitting cases would fragment its authority. Preserve case IDs/order,
  timings, profile/fixture targets, sample/resource arithmetic, cancellation,
  stale suppression, cleanup observations and development-only flag. Under
  ADR-0051 the untouched historical Qwen host harness does not need a new model
  run; deterministic tests remain required. No Qwen runtime result is inferred.

## NR-CONTRACT / NR-FRAMING / NR-CORE — SKIP

Each has low risk, zero-file/zero-line edit scope, no user decision, and no
individual baseline/post commands for an unchanged target. Existing final Rust
and applicable native checks retain deterministic coverage; inspection does not
constitute a new installed-package or artifact acceptance.

- `tts_protocol_contract.rs` is the closed protocol-v1 predicate owner. Named
  validators separate identities, locator ranges, narration, audio, capabilities
  and errors; its match expresses the fixed message union. Four embedded tests
  consume 15 valid and three invalid shared fixtures. Splitting message families
  adds sharing without a demonstrated obstacle. Preserve all fields/kinds,
  Unicode/UTF-8 limits, locator ordering, sample arithmetic and classifications.
- `tts_service_protocol.rs` is the cohesive production transport. It delegates
  semantics to the contract while owning bounded frames, strict duplicate-key
  JSON and exact finite PCM. Four tests cover limits before allocation,
  duplicates, PCM and round trips. Preserve VLTP headers/flags/lengths, closed
  errors, complete-unit publication and the separate probe authority. Visitor
  boilerplate serves required duplicate rejection; a move alone adds no benefit.
- `tts_release_core.rs` owns executable-relative Piper discovery and full
  package verification with named policy/path/tree/hash helpers and seven
  synthetic filesystem tests. The existing SHA helper already serves shared
  encoding. Similarities with Chatterbox hide distinct cancellation, reparse,
  retention, receipt and error semantics, so no generic verifier is justified.
  Preserve exact manifest/lock/profile/file-set/hash/size/payload closure, path
  containment, Invalid/Unavailable errors, bilingual descriptors and bounded
  heap hashing. No manifest, lock, package layout or installer changes.

## NR-HASH — SKIP

Low risk; target `sha256_hex.rs::encode_sha256`, used by both package verifiers.
The small helper already removes real duplication. Explicit nibble conversion
preserves 64 lowercase digits and leading zeroes, covered by four reference
vectors. No additional abstraction or relocation has a demonstrated benefit.
Allowlist/edits: none, zero-line ceiling. Preserve all bytes, callers, tests,
dependencies and manifest admission semantics. Final Rust gates retain coverage;
no separate unchanged-unit commands or user decision are needed.

## Closed inventory and preserved executable surfaces

All twelve original files and embedded tests were inspected at execution base.
Two CHANGE targets: NR-MAIN and NR-SUP (`run_host` only). Ten SKIPs: NR-CB,
NR-HW, NR-AUTH, NR-PROBE, NR-FAKE, NR-HANDOFF, NR-CONTRACT, NR-FRAMING, NR-CORE,
NR-HASH. Within NR-SUP, runtime configuration, containment, Tauri adapters and
model-backed host helpers retain separate SKIP decisions: existing named,
tested boundaries and shared lifecycle ownership do not justify more splitting.

Sixteen Tauri handlers, in order:
`detect_host_profile_compatibility`, `run_tts_protocol_probe`,
`exact_tts_demo_available`, `release_locked_runtime_enabled`,
`tts_profile_configuration_available`, `optional_chatterbox_snapshot`,
`select_optional_chatterbox`, `download_optional_chatterbox`,
`cancel_optional_chatterbox`, `remove_optional_chatterbox`, `start_tts_service`,
`prepare_tts_service`, `health_tts_service`, `synthesize_tts_segment`,
`cancel_tts_generation`, `shutdown_tts_service`.

Nine CLI flags, in dispatch order:
`--voxleaf-tts-protocol-probe-child`, `--voxleaf-tts-protocol-probe-host`,
`--voxleaf-tts-model-free-service-child`, `--voxleaf-tts-model-free-descendant`,
`--voxleaf-tts-service-supervisor-host`, `--voxleaf-tts-exact-service-host`,
`--voxleaf-tts-piper-service-host`, `--voxleaf-tts-bilingual-profile-service-host`,
`--voxleaf-tts-exact-handoff-host`. Fake-child reads one optional scenario;
bilingual reads profile/language and requires both UTF-8. Other branches read
no extra positions. Recognized branches exit 0 iff successful, otherwise 1;
unknown/no argument enters Tauri.

There are 41 compile-time include occurrences: authority 5, hardware self-source
1, Chatterbox 5, contract 18, core 2, fake 1, handoff 2, framing 1, supervisor 6.
The only proposed include edit is `run_host`'s new depth:
`../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json`.
Resolved target bytes and the full target multiset must remain unchanged.

Preserve Windows/non-Windows probing, path/Job/process arms, development-only
locks/environment selection and release rejection, Windows free-space/reparse
checks, Unix symlink tests, test-only authority and probe frozen literals.
Native startup's `exerciseNativeTtsSupervisorHost` executes the supervisor CLI
with a 30,000-ms timeout and hidden Windows process. Exact Qwen, bilingual and
handoff model routes retain their existing harnesses; static equivalence is not
a claim those model journeys ran. No Unix execution is claimed on this host.

## Execution resource inspection

Independent validator read-only host inspection used normal PowerShell 7.6.5
outside the sandbox and found an existing VoxLeaf installation and data root.
Installer lifecycle and ordinary journey scripts reject a pre-existing install;
the current task does not authorize replacing or removing it. Native driver
executables and pnpm/cargo/node/uv are available. Model/offline environment keys
are unset; any triggered model gate first needs verified resource configuration.
No installer, acquisition journey or model test ran during this inspection.
