# Bounded Rust function readability

Status: planned; production implementation and acceptance have not started.
Prepared on 2026-10-19 from clean `main` at
`383c9c42068ee8ff1d6f3984fec8735e029a1877`.
Implementation branch: `codex/rust-function-readability`.

## 1. Goal

Address three Rust readability proposals with meaningful names and the smallest
useful changes. Extract deterministic CUDA precision derivation and the repeated
diagnostic exit policy. Record the error-tuple naming proposal as an audited
`SKIP`: it is reasonable spelling, but does not justify another refactor unit.

This maintenance plan spans native hardware detection and diagnostic entry
points. It does not reopen a product milestone. A fresh audit may retain a
`SKIP` instead of forcing edits when the implementation state changes.

## 2. User-visible outcome

Hardware compatibility, supported profiles, diagnostic arguments and exit
codes remain identical. Contributors can test the existing CUDA capability
thresholds without loading a driver and read diagnostic dispatch without nine
copies of the same exit policy. No performance improvement is claimed.

The current request authorizes this plan, its two index links, branch creation
from `main`, and one local documentation commit. It does not implement the
production changes or authorize a push or PR. A later implementation request
must be interpreted separately, including its Git and host-mutation authority.

## 3. Current state

The static review inventoried 27 tracked Rust files and inspected selected
production responsibilities and their tests. It is not a runtime baseline.
The four helpers from the completed
[native Rust readability plan](../completed/native-rust-function-readability.md)
already exist and must not be proposed again.

| Target | Current evidence | Planning disposition |
| --- | --- | --- |
| RFR-01 | `host_profile_detection/windows_probe.rs::cuda`, around lines 364-385, mixes FFI observations with deterministic major/minor validation and precision construction. Existing hardware tests inject prebuilt precision reports rather than testing that production derivation. | CHANGE: one private-to-parent pure helper and focused cases in the existing test file. |
| RFR-02 | `diagnostics/cli.rs::dispatch_if_requested` repeats success-to-exit-code conversion in nine branches; the two argument-bearing branches bury parsing within that wrapper. | CHANGE: one terminating Boolean helper in the same module. |
| RFR-03 | `tts_protocol_contract.rs::valid_error`, around line 306, uses `expected.0`, `.1` and `.2` immediately beside the `code`, `category` and `severity` comparisons. | SKIP: named destructuring is a minor preference; the independent audit found no concrete complexity or testing obstacle to justify a separate change. |

RFR-03's original suggestion was
`let (expected_code, expected_category, expected_severity) = expected_error(reason);`.
Retain that context without silently expanding it into an error-type redesign or
contract cleanup. Reopening this SKIP requires a recorded reason, a revised
allowlist and a fresh independent baseline before editing.

The large Chatterbox acquisition and service-supervisor owners, Piper package
verification, frozen protocol probes and historical handoff diagnostics remain
excluded. File length and superficially similar verification policies are not
reasons to split or unify them.

## 4. Scope and non-goals

`RFR-BATCH` contains two disjoint implementation units and one audited SKIP.
The planning patch is low-risk documentation. Both implementation units are
high risk under the canonical policy: they affect hardware/profile facts or
native diagnostic invocation and process exit, despite their small diffs.

| Unit | Closed implementation allowlist | Maximum added plus removed lines |
| --- | --- | --- |
| RFR-01 | `apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs`; `apps/desktop/src-tauri/src/host_profile_detection/tests.rs` | 100 across two files |
| RFR-02 | `apps/desktop/src-tauri/src/diagnostics/cli.rs` | 100 in one file |
| RFR-03 | None; `tts_protocol_contract.rs` and its tests are read-only context. | 0 |

Planning documentation is limited to this file, `docs/plans/active/README.md`
and `docs/README.md`. Implementation closeout may also move this plan to
`docs/plans/completed/` and update that directory's index under a separate
documentation validation order. Do not edit other completed plans.

Do not add modules, traits, generic command frameworks, parser abstractions,
mock CUDA drivers, error types, dependencies, public exports, schema changes,
new logging or new runtime state. Keep each helper in its existing module.
Do not change flags, model selection, GPU thresholds, admission policy, FFI,
resource ownership, cancellation, timeouts, buffering or package verification.

Before the first baseline, verify that mutable source/test/generated paths do
not overlap units. Unexpected overlap or a larger diff requires replanning;
never manufacture a baseline after editing a shared path.

## 5. Relevant files and documentation

- [Project instructions](../../../AGENTS.md), [plan format](../../../.agents/PLANS.md),
  [refactor workflow](../../development/agentic-refactoring.md),
  [agent contracts](../../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md),
  [validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
  and [validation matrix](../../../.agents/skills/validate-safe-refactor/references/validation-matrix.md).
- [MVP requirements](../../product/mvp.md), [roadmap](../roadmap.md),
  [system diagram](../../architecture/system-diagram.md),
  [architecture overview](../../architecture/overview.md),
  [ADR-0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md),
  [ADR-0019](../../architecture/decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md)
  and [ADR-0044](../../architecture/decisions/ADR-0044-use-measured-capacity-for-chatterbox-vram-admission.md).
- [Windows probe](../../../apps/desktop/src-tauri/src/host_profile_detection/windows_probe.rs),
  [parent detector and admission predicates](../../../apps/desktop/src-tauri/src/host_profile_detection.rs),
  [hardware tests](../../../apps/desktop/src-tauri/src/host_profile_detection/tests.rs),
  [diagnostic dispatch](../../../apps/desktop/src-tauri/src/diagnostics/cli.rs),
  [protocol validators](../../../apps/desktop/src-tauri/src/tts_protocol_contract.rs)
  and [protocol tests](../../../apps/desktop/src-tauri/src/tts_protocol_contract/tests.rs).
- [Root scripts](../../../package.json), [desktop scripts](../../../apps/desktop/package.json),
  [Cargo configuration](../../../apps/desktop/src-tauri/Cargo.toml),
  [testing guide](../../development/testing.md),
  [native smoke](../../../apps/desktop/scripts/native-startup-smoke.mjs),
  [ordinary release host runner](../../../apps/desktop/scripts/ordinary-chatterbox-release-host.mjs),
  [release configuration](../../../apps/desktop/src-tauri/tauri.release.conf.json)
  and [evidence retention](../../development/evidence-retention.md).

## 6. Architecture and constraints

For RFR-01, extract `cuda_precisions_for_compute_capability(major: i32,
minor: i32) -> Option<PrecisionReport>` in `windows_probe.rs`, with only
`pub(super)` visibility so the existing parent test module can call it.
Descriptive parameter/local names may clarify compute-capability major/minor;
do not rename unrelated FFI types. Return `None` for the existing invalid
condition `major < 2 || minor < 0`; the caller returns `ProbeValue::Malformed`
at the same point. Preserve FLOAT32 available, INT8 unknown, FLOAT16 available
only for `major > 5 || (major == 5 && minor >= 3)`, and BFLOAT16 available only
for `major >= 8`. These are existing rules, not new hardware support claims.

Keep DLL loading, symbol resolution, all FFI calls and their order, `CudaLibrary`
lifetime and `FreeLibrary`, the 64-adapter ceiling, LUID conversion and device
insertion order intact. Missing library/zero devices remain `Unavailable`,
missing procedures/API failures remain `Unknown`, and invalid count/capability
remains `Malformed`. Do not touch DirectML, normalization or admission formulas.

For RFR-02, add private `exit_with_diagnostic_status(succeeded: bool) -> !`
containing the existing `std::process::exit(if succeeded { 0 } else { 1 })`.
Replace only the nine wrappers. Preserve every match predicate and diagnostic
call exactly once, argument consumption and UTF-8 conversion, bilingual `zip`
and missing-argument failure. Calls still terminate immediately after the
diagnostic completes; unmatched arguments return to normal Tauri startup.
Do not replace immediate exit with unwinding, returning an error, or logging.

The helpers do not change component ownership or data flow. Review the canonical
system diagram at closeout; leave it unchanged if this remains true. EPUB/text
privacy, local inference, transient reports/audio, bounded memory, stable
locators and identity-first cancellation remain inherited invariants.

## 7. Milestones

### Milestone 1: Freeze implementation terms and establish baselines

Status: not started. Refresh the three target dispositions on the implementation
HEAD. Reuse one Sol auditor, one Sol worker and one Astra validator; use a Sol
Git steward only for separately authorized mutations. Supporting agents do not
delegate. Keep one source writer at a time and the index empty between units.

Approve the exact unit terms, test decisions and gate ledger before edits.
Check Windows/toolchain/driver availability and candidate preparation inputs.
Run fast checks first. Capture a shared expensive baseline before either unit
is edited, if useful; each unit still needs its focused starting-state baseline.
A failing relevant baseline blocks editing that unit. Freeze work orders only
after independent baseline PASS. Record RFR-03 as SKIP without running a new
validation cycle solely for unchanged local names.

### Milestone 2: Extract CUDA precision derivation

Status: not started. Apply only RFR-01's helper and deterministic test cases.
Run assigned worker fast checks, then independent post-change review, Rust
gates, native smoke and exact-candidate live detection/report checks. Resolve
all high-risk unit gates before accepting the unit. Do not start the next unit
with an unaccepted worker patch still present.

### Milestone 3: Extract diagnostic exit policy

Status: not started. Apply only RFR-02. Independently compare all nine original
and resulting branch predicates, argument expressions and diagnostic calls.
Run Rust gates and native smoke before unit acceptance. Do not introduce a new
parser/testing framework or alter model-backed diagnostic implementations.

### Milestone 4: Accept the combined batch and close documentation

Status: not started. Resolve combined portable/full checks on the final source,
verify any host restoration, review the complete diff and confirm all three
dispositions. Freeze closeout documentation before its own independent report.
Move the completed plan and update incoming/index links only after required
acceptance passes. Staging/commits require current user authorization and an
immutable POST-CHANGE PASS bound to HEAD and exact path identities; a FINAL
summary alone does not authorize staging. Push and PR remain separate actions.

## 8. Testing and benchmark strategy

Run every acceptance command from the repository root in normal local
PowerShell outside the managed sandbox. No production gate below was run for
this planning task. Keep deterministic tests distinct from actual Windows/GPU
observations, and retain both default and `release-locked-runtime` Rust variants.

| Invariant | Existing coverage and explicit test decision |
| --- | --- |
| CUDA precision thresholds and malformed capability | Add one table-driven Windows-only test in the existing parent test file: invalid major, negative minor, a valid older capability, 5.2, 5.3, 6.0, 7.5 and 8.0. State expected complete `PrecisionReport` values independently; do not duplicate the production predicate in the test. No GPU is needed for these cases. |
| Admission remains fail-closed | Retain `optional_download_gate_accepts_every_exact_numeric_threshold`, `optional_download_gate_rejects_one_below_every_numeric_threshold`, unknown-capacity and closed platform/CUDA/BFLOAT16 cases. |
| Privacy, malformed observations, device matching and report shape | Retain normalization/multi-adapter/unknown cases, `implementation_has_no_process_network_model_or_persistence_surface` and `production_windows_probe_emits_only_the_bounded_report`. Existing source-surface scanning already includes both RFR-01 paths. |
| Dispatch and immediate exit | Preserve every branch expression; native smoke exercises supervisor-host process exit and protocol-child paths. Existing Rust suites cover the unchanged diagnostics. No new subprocess suite or test-only public seam for this mechanical wrapper. This is not claimed exhaustive runtime coverage of all nine commands. |
| Error contract | RFR-03 changes nothing. Existing shared valid/invalid fixture checks remain intact; incomplete per-reason mutation coverage is not a reason to expand this naming task. |

Use the [compact batch record](../../../.agents/skills/validate-safe-refactor/references/validation-record.md)
for concrete receipt paths, dependency manifests and timings. All entries start
PENDING for implementation. The validator approves final gate selection.

| Gate | Exact command / invariant | Timing | Inputs, invalidation and evidence |
| --- | --- | --- | --- |
| RFR-FAST | `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust`; `pnpm.cmd test:rust` | Each unit baseline and post-change; before expensive preparation | Whole crate source/tests and discovered members, Cargo/config/locks/build scripts, fixtures and toolchain. Changed/unknown inputs invalidate affected receipts. Preserve feature variants and test identity inventory. |
| RFR-NATIVE | `pnpm.cmd test:native-startup` | Shared pre-edit baseline if declared; each affected high-risk unit post-change | Native/frontend/shared inputs, fixtures, runner, Tauri/Cargo configuration, binary identity, WebView2/EdgeDriver and host conditions. Rebuilt or changed binary/inputs invalidate reuse. |
| RFR-ADMISSION | `pnpm.cmd package:windows:ordinary-chatterbox:preflight --installed-root "$rustCandidateRoot"` | RFR-01 baseline and post-change, after exact candidate preparation | Bind an absolute task-owned root to the current release-locked executable plus complete ordinary resources. Capture hashes, resource manifests, runner, hardware/driver state and both ordinary/hostile sessions. Never use an unverified default installed application. |
| RFR-PREP | `pnpm.cmd build:packages`; `pnpm.cmd package:piper-core`; `pnpm.cmd --filter @voxleaf/desktop tauri build --config src-tauri/tauri.release.conf.json --features release-locked-runtime` | Build workspace packages before either native smoke or release Tauri build when their exports are absent/invalidated; prepare core/release candidate only for RFR-ADMISSION as needed; after fast checks | Existing package/bundle builders, dependency locks, runtime/resource manifests and exact source. Preparation is not acceptance. Freeze concrete output/copy/cleanup paths before invoking builders. |
| RFR-COMBINED | `pnpm.cmd check:portable`; `pnpm.cmd check` | Final integration batch after the last relevant source edit | Complete aggregate script/input graph, tools and environment. Expand both scripts and deduplicate only provably identical leaves under the canonical policy; preserve exclusive leaves and dependency order. |
| RFR-DOC | `pnpm.cmd check:evidence`; `git diff --check`; local-link/section/command/claim review | Planning and final documentation freeze | Exact documentation, links, current policy/config/scripts and relevant source context. Include EOF-aware diff review for a new file. No application build solely for this documentation gate. |

The ordinary runner's preflight actually launches the selected executable,
checks the release boundary, invokes native hardware detection and evaluates
host-gate facts in ordinary and hostile environments. Combined with the
deterministic derivation and existing native admission tests, this covers the
changed CUDA boundary. It does not prove download, acquisition or narration.
Neither RFR-01 nor RFR-02 requires a new synthesis benchmark, installed
acquisition journey or full profile matrix while the stated scope is preserved.
Changed runtime/admission/diagnostic semantics require replanning and their
corresponding gates, not continued use of this narrower selection.

Neither Tauri command builds the EPUB/shared workspace dependencies. Run
`pnpm.cmd build:packages` before `RFR-NATIVE` or the release build whenever their
`dist` exports are absent or invalidated; do not rely on leftovers from a prior run.

Before baseline, freeze a bounded preparation record: actual builder commands,
exact resource sources, separate baseline/candidate roots, candidate executable
hashes, runner receipts and restoration actions. Reuse verified immutable
payloads where inputs match; never share mutable runtimes or replace the user's
installed application to satisfy this gate. Expected ignored output areas are
the existing `services/tts/release/core/dist/`, package/desktop `dist/`, native
`target/`, and task-owned scratch/evidence paths. New tracked/generated outputs
are outside the source allowlists and require a revised preparation scope.
Do not run the broader release evidence writer merely to obtain a candidate.

Only the validator may reuse a passing gate: its immutable original receipt
must contain execution-time command, input/discovery identities, environment,
outcome and duration. A new report must prove those inputs and the invariant
remain identical. HEAD/path drift always requires a new independent report;
never refresh approval hashes. Missing proof requires rerunning the affected
gate. Do not report an aggregate as executed when only its leaves ran.

## 9. Risks and rollback

CUDA extraction can accidentally admit malformed capabilities or turn unknown
facts into availability; assert full reports and preserve failure ordering.
The exit helper must return `!` and retain Boolean evaluation before termination.
An older installed executable can produce irrelevant green host evidence;
bind candidate bytes to the validated source before either live run.

Record preparation/execution/cleanup times separately. For long stages, retain
the session/run ID, last progress signal and a diagnostic threshold; investigate
stalls instead of launching duplicate work. Allow one infrastructure retry per
failed stage only with a concrete hypothesis and changed condition, and at most
two source-correction loops before redesign. Preserve failed receipts and
classify baseline, product, environment and harness/cleanup failures separately.

Before any host mutation, journal original state and task ownership, including
process PID, creation time and executable identity. Preserve existing installs,
data and firewall rules. Verify cleanup after success, failure or interruption;
unverified restoration blocks host acceptance. Do not add a temporary untested
orchestrator or kill processes by PID alone.

Rollback removes only verified worker-authored changes within the current unit;
preserve all unrelated work. An accepted patch may remain unstaged while a
disjoint clean unit proceeds, but an unaccepted patch cannot carry forward.
No broad reset/clean/stash and no implicit Git mutation. Keep immutable reports
outside their evaluated paths under ignored
`tmp/evidence/rust-function-readability/`; publish only concise evidence summaries
through separately authorized documentation changes, never private raw captures.

## 10. Progress log

- 2026-10-19: reviewed current source, tests, scripts and validation policy.
  Independent audit accepted RFR-01/RFR-02 as bounded CHANGE candidates and
  recommended RFR-03 SKIP. No production baseline or edits performed.
- 2026-10-19: created `codex/rust-function-readability` from the source HEAD
  recorded above. Documentation-only baseline
  `RUST-READABILITY-PLAN-BASELINE-20261019-01` passed; it does not validate runtime.
- 2026-10-19: independent documentation review identified the missing
  `build:packages` prerequisite; it is now explicit before native preparation.
  Retain failed report `RUST-READABILITY-PLAN-POST-CHANGE-20261019-01` unchanged.
- [ ] Milestone 1: implementation audits/orders and baselines accepted.
- [ ] Milestone 2: RFR-01 implemented and independently accepted.
- [ ] Milestone 3: RFR-02 implemented and independently accepted.
- [ ] Milestone 4: combined acceptance, cleanup and documentary closeout.

## 11. Discoveries and decisions

- Keep helpers with their existing owners. A new module or framework would
  increase navigation without clarifying these responsibilities.
- The independently reviewed RFR-03 naming proposal remains visible as SKIP;
  satisfying three reviewed proposals does not require three modifications.
- Existing hardware tests inject precision facts; directly testing production
  capability derivation is the concrete RFR-01 coverage gap.
- Exact-candidate preflight is live native integration evidence, not an
  acquisition journey. Its default installed-root must not be trusted as current.
- Preserve the completed native refactors and existing frozen authorities.
  No architecture or product documentation change is expected from these helpers.

## 12. Final validation results

Planning baseline: `pnpm.cmd check:evidence` and `git diff --check` passed in
normal local PowerShell; prospective plan was absent and both indexes clean.
Planning post-change review and the requested documentation commit are pending
at this content freeze; retain their immutable reports outside this file.

Production status: NOT STARTED. No Rust, native, GPU, packaging, aggregate or
performance PASS is claimed. At implementation closeout, replace this status
with exact executed commands, independently justified reused receipts, current
report identities, unit dispositions, verified restoration and remaining limits.
