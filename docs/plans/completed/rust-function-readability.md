# Bounded Rust function readability

Status: implementation and source/package acceptance complete; independent
documentary/campaign outcomes are recorded separately after this content freeze.
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

The original planning request authorized this plan, its two index links, branch
creation and documentation commit `e5577fb`. The 2026-10-19 implementation request
now authorizes both bounded units, host validation and documentary closeout.
All changes must remain unstaged and uncommitted; no push or PR is authorized.

## 3. Current state

The static review inventoried 27 tracked Rust files and inspected selected
production responsibilities and their tests. It is not a runtime baseline.
The four helpers from the completed
[native Rust readability plan](../completed/native-rust-function-readability.md)
already exist and must not be proposed again.

| Target | Original audit evidence | Final disposition |
| --- | --- | --- |
| RFR-01 | `host_profile_detection/windows_probe.rs::cuda` mixed FFI observations with deterministic major/minor validation and precision construction; existing hardware tests injected prebuilt reports. | CHANGE accepted: one private-to-parent pure helper and eight independent complete-report cases; two files, 88 added plus removed lines. |
| RFR-02 | `diagnostics/cli.rs::dispatch_if_requested` repeated success-to-exit-code conversion in nine branches; the two argument-bearing branches buried parsing within that wrapper. | CHANGE accepted: one private terminating Boolean helper replacing nine wrappers; one file, 68 added plus removed lines. |
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

The original planning documentation covered this plan and two incoming indexes.
`RFR-DOC-ORDER-20261019-01` authorizes its completed-path move and the three
index updates as continuation of the independently baselined documentary unit.
Other completed plans remain unchanged. Source scope totals three files/156 lines.

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

Status: complete; both focused baselines and the shared pre-edit native baseline
accepted. Refresh the three target dispositions on the implementation
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

Status: complete; `RFR-01-POST-CHANGE-20261019-01` PASS. The approved work was to apply only RFR-01's helper and deterministic test cases.
Run assigned worker fast checks, then independent post-change review, Rust
gates, native smoke and exact-candidate live detection/report checks. Resolve
all high-risk unit gates before accepting the unit. Do not start the next unit
with an unaccepted worker patch still present.

### Milestone 3: Extract diagnostic exit policy

Status: complete; `RFR-02-POST-CHANGE-20261019-01` PASS. The approved work was to apply only RFR-02 and independently compare all nine original
and resulting branch predicates, argument expressions and diagnostic calls.
Run Rust gates and native smoke before unit acceptance. Do not introduce a new
parser/testing framework or alter model-backed diagnostic implementations.

### Milestone 4: Accept the combined batch and close documentation

Status: source integration complete under `RFR-BATCH-PACKAGE-20261019-01` PASS;
documentation frozen for separate final review. The approved work was to resolve combined portable/full checks on the final source,
verify any host restoration, review the complete diff and confirm all three
dispositions. Freeze closeout documentation before its own independent report.
Move the completed plan and update incoming/index links only after required
acceptance passes. Staging/commits require current user authorization and an
immutable POST-CHANGE PASS bound to HEAD and exact path identities; a FINAL
summary alone does not authorize staging. Push and PR remain separate actions.

## 8. Testing and benchmark strategy

Run every acceptance command from the repository root in normal local
PowerShell outside the managed sandbox. The original planning task ran no
production gate; implementation results are recorded in section 12. Keep deterministic tests distinct from actual Windows/GPU
observations, and retain both default and `release-locked-runtime` Rust variants.

| Invariant | Existing coverage and explicit test decision |
| --- | --- |
| CUDA precision thresholds and malformed capability | Add one table-driven Windows-only test in the existing parent test file: invalid major, negative minor, a valid older capability, 5.2, 5.3, 6.0, 7.5 and 8.0. State expected complete `PrecisionReport` values independently; do not duplicate the production predicate in the test. No GPU is needed for these cases. |
| Admission remains fail-closed | Retain `optional_download_gate_accepts_every_exact_numeric_threshold`, `optional_download_gate_rejects_one_below_every_numeric_threshold`, unknown-capacity and closed platform/CUDA/BFLOAT16 cases. |
| Privacy, malformed observations, device matching and report shape | Retain normalization/multi-adapter/unknown cases, `implementation_has_no_process_network_model_or_persistence_surface` and `production_windows_probe_emits_only_the_bounded_report`. Existing source-surface scanning already includes both RFR-01 paths. |
| Dispatch and immediate exit | Preserve every branch expression; native smoke exercises supervisor-host process exit and protocol-child paths. Existing Rust suites cover the unchanged diagnostics. No new subprocess suite or test-only public seam for this mechanical wrapper. This is not claimed exhaustive runtime coverage of all nine commands. |
| Error contract | RFR-03 changes nothing. Existing shared valid/invalid fixture checks remain intact; incomplete per-reason mutation coverage is not a reason to expand this naming task. |

Use the [compact batch record](../../../.agents/skills/validate-safe-refactor/references/validation-record.md)
for concrete receipt paths, dependency manifests and timings. Entries began
PENDING; independent reports below resolve the source gates and retain the
documentary review boundary. The validator approved gate selection.

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

- 2026-10-19 implementation: verified clean branch at
  `e5577fb963fd424f45ae5cc9282805493df92e62`, empty index and disjoint source
  allowlists. Reused one Sol auditor/worker and one Astra validator; no Git
  steward is needed because no Git mutation is authorized. Fresh audit retains
  RFR-01/RFR-02 CHANGE and RFR-03 SKIP.
- 2026-10-19: `RFR-01-BASELINE-20261019-01` and
  `RFR-DOC-BASELINE-20261019-01` PASS, with immutable presentation-only path
  erratum `RFR-BASELINE-PRESENTATION-ERRATUM-20261019-01`. Rust format/lint and
  both test variants pass (94/93 passed, one existing ignored helper each).
  `build:packages`, native smoke, core integrity check, release build and
  exact-root ordinary/hostile preflight pass. The native baseline was declared
  for both units before any source edit. Orders, reports and complete receipts
  are retained under ignored `tmp/evidence/rust-function-readability/`.
- 2026-10-19 preparation: preserve the failed `package:piper-core` reconstruction
  (`piper-core-runtime-manifest-stale`). Four dependency RECORD files differ
  only in hashes of unbundled launchers from another installation root. The
  validator proved unchanged current core inputs and verified the existing
  frozen payload; director revision `RFR-PREPARATION-REVISION-20261019-01`
  selects that immutable artifact for independent candidate copies. This does
  not claim successful reconstruction or reuse any historical runtime gate.
- 2026-10-19 preparation: release build first failed downloading an NSIS helper;
  its sole infrastructure retry passed after exact-URL readiness. The first
  candidate copy had malformed relative resource paths; admission stopped before
  process launch. Approved copy correction and its sole admission retry passed
  on isolated `baseline-02`. Both failures and `baseline-01` remain retained.
  Installed application/data hashes were preserved, admission metadata unchanged,
  no owned processes remain, and the pre-existing October 15 temp root is untouched.
- 2026-10-19: froze `RFR-01-ORDER-20261019-01` against baseline PASS. At that
  point, combined/documentary acceptance was pending and no code was accepted.
- 2026-10-19 initial planning: reviewed source, tests, scripts and validation policy.
  Independent audit accepted RFR-01/RFR-02 as bounded CHANGE candidates and
  recommended RFR-03 SKIP. No production baseline or edits performed.
- 2026-10-19: created `codex/rust-function-readability` from the source HEAD
  recorded above. Documentation-only baseline
  `RUST-READABILITY-PLAN-BASELINE-20261019-01` passed; it does not validate runtime.
- 2026-10-19: independent documentation review identified the missing
  `build:packages` prerequisite; it is now explicit before native preparation.
  Retain failed report `RUST-READABILITY-PLAN-POST-CHANGE-20261019-01` unchanged.
- 2026-10-19: `RFR-02-BASELINE-20261019-01` PASS on clean `cli.rs`, carrying
  accepted RFR-01 and plan edits as explicit context. Fresh Rust checks pass;
  shared original native baseline is referenced, not represented as a fresh run.
  Froze `RFR-02-ORDER-20261019-01`; source scope remains one file/100 lines.
- [x] Milestone 1: implementation audits/orders and baselines accepted.
- 2026-10-19: RFR-01 accepted under `RFR-01-POST-CHANGE-20261019-01` after
  current identity recheck. Two source/test files, 88 added/removed lines;
  pure capability helper plus one eight-case table. Worker and independent
  Rust checks pass (95/94 passed; same ignored helper), fresh native smoke,
  full release build and exact `candidate-01` preflight pass. Existing package
  outputs and frozen core payload were independently verified and reused;
  no runtime gate was reused and no post-change retry occurred. User state
  and candidate identities remain unchanged; no owned processes remain.
  RFR-02 audit was refreshed on its still-clean file and retains its original scope.
- [x] Milestone 2: RFR-01 implemented and independently accepted.
- 2026-10-19: worker offline all-platform Cargo metadata discovery failed on an
  uncached Android-only dependency. One director-approved Windows-only filter
  correction succeeded before unchanged fast commands; no test failure/retry.
- 2026-10-19: RFR-02 accepted under `RFR-02-POST-CHANGE-20261019-01`; nine
  wrappers extracted without argument, predicate, callee or exit-code changes.
  Fresh Rust and native gates pass; no runtime gate reuse or retry.
- 2026-10-19: `RFR-BATCH-PACKAGE-20261019-01` PASS accepted all three source
  paths/156 changed lines. Both original aggregates and final native ran freshly;
  source identities and user resources remained unchanged. Canonical system
  diagram reviewed and retained: component/process/data-flow ownership is identical.
- [x] Milestone 3: RFR-02 implemented and independently accepted.
- [x] Milestone 4: source integration/cleanup accepted; documentary closeout
  frozen under `RFR-DOC-ORDER-20261019-01`. Its independent final result is
  retained externally after this content freeze, without rewriting this plan.

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
The original planning commit is `e5577fb`; current implementation HEAD remains
`e5577fb963fd424f45ae5cc9282805493df92e62`. Implementation and closeout changes
remain unstaged/uncommitted with an empty index; no push or PR is authorized.

Independent source reports `RFR-01-POST-CHANGE-20261019-01`,
`RFR-02-POST-CHANGE-20261019-01` and `RFR-BATCH-PACKAGE-20261019-01` are PASS.
Their immutable reports and complete command/input/environment/timing receipts
remain under ignored `tmp/evidence/rust-function-readability/`. RFR-01 baseline
native was declared shared before either edit; RFR-02 explicitly referenced it
while freshly executing its focused baseline. Baseline Markdown path rendering
is corrected only by `RFR-BASELINE-PRESENTATION-ERRATUM-20261019-01`.

| Exact executed command | Verified outcome and timing |
| --- | --- |
| `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust`; `pnpm.cmd test:rust`; `git diff --check` | Fresh baseline and independent post-change checks passed for both units; lint/tests include both feature variants. Post-change tests: 95 default/94 locked passed, zero failures, one existing intentionally ignored subprocess fixture each. |
| `pnpm.cmd build:packages` | Passed before baseline native preparation; later artifact reuse required unchanged build inputs plus complete output membership/hash proof. Both aggregate commands rebuilt their required packages. |
| `pnpm.cmd package:piper-core` | Baseline reconstruction FAILED `piper-core-runtime-manifest-stale`; no retry and no reconstruction PASS. Approved immutable frozen-payload alternative verified complete core membership/hashes and provenance. |
| `pnpm.cmd package:piper-core:check` | Fresh baseline integrity check passed for that verified payload; it does not establish reconstruction reproducibility. |
| `pnpm.cmd --filter @voxleaf/desktop tauri build --config src-tauri/tauri.release.conf.json --features release-locked-runtime` | Baseline passed after its sole NSIS-download infrastructure retry; RFR-01 post-change passed freshly in 128.695 seconds without retry. Installer built but never executed. |
| `pnpm.cmd package:windows:ordinary-chatterbox:preflight --installed-root "$rustCandidateRoot"` | Baseline passed on independent `baseline-02` after the sole approved copy/admission retry; RFR-01 fresh `candidate-01` ordinary/hostile/live-host preflight passed in 21.865 seconds. |
| `pnpm.cmd test:native-startup` | Shared pre-edit baseline 68.329 seconds; RFR-01 post-change 38.579; RFR-02 post-change 39.216; final combined run 38.051. All passed freshly at their declared boundaries. |
| `pnpm.cmd check:portable` | Original full command passed in 111.867 seconds; no leaf deduplication. |
| `pnpm.cmd check` | Original full command passed in 107.307 seconds, including both Rust variants and native build; no leaf deduplication. |

No runtime gate was reused in either post-change report or PACKAGE. Reuse was
limited to independently verified package/core artifacts; candidate runtimes
were independent regular copies. Both aggregates passed shared 209, EPUB 655,
desktop 730 plus 76 Node tests, and Python 571; full Rust totals are above.

Installed application/data integrity and runner isolation were verified. No
installer, firewall or installed-app mutation occurred; no owned process or new
runner temp root remains. The unrelated October 15 temp root and ignored
`baseline-01`, `baseline-02`, `candidate-01` and evidence roots are retained.
Final candidate membership/hashes remain unchanged after later default builds.

Limits: local Windows host evidence, not CI; retained existing ignored test
helper; core reconstruction reproducibility remains outside scope. No synthesis,
acquisition, exhaustive nine-mode/FFI/all-hardware coverage or performance gain
is claimed. This freeze records source/unit/batch PASS only. Independent
documentary/campaign outcomes are recorded separately after this freeze in
`RFR-DOC-POST-CHANGE-20261019-01` and `RFR-BATCH-FINAL-20261019-01` under the
same evidence root; this document does not pre-assert those verdicts. No source,
architecture, product, ADR or authority change accompanies the documentary move.
