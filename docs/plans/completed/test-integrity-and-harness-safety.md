# Test integrity and lifecycle harness safety

## Goal

Resolve the eleven statically verified test-review findings with focused changes
that make the tests discriminate the intended failure, preserve useful historical
coverage, and prevent validation tooling from damaging existing application data.

This is a cross-milestone maintenance plan. It changes test acceptance and one
Windows lifecycle harness, so execution follows the feature/bug change-review
workflow rather than treating the entire patch as a behavior-preserving refactor.

## User-visible outcome

Maintainers can run the affected checks with stronger evidence: failed backup
cannot authorize deletion of the original data, negative publication tests write
only inside disposable roots, and boundary tests reject the defect they name.
Temporary test files are removed on success and failure. Reader behavior, TTS
support decisions, protocol values and historical benchmark results stay intact.

Execution was authorized on 2026-10-21, including all required tests outside
the sandbox. Changes must remain unstaged and uncommitted. Implementation is
complete. The user subsequently explicitly authorized uninstalling and
reinstalling VoxLeaf on this account to execute G7. Preserve and verify original
application data, run the unchanged lifecycle command with its no-installation
precondition satisfied, and reinstall the current package after the matrix.

## Current state

- Planning date: 2026-10-21.
- Planning base: clean `main` at
  `f0b37be2562f8a2ccc1d3a0b0cba60c23bc2b4ed`.
- Planning branch: `codex/test-integrity-and-harness-safety`.
- The original static audit and verification examined
  `cd570345cc7e3c418f7d9e1e89e743d38bc6df31`. The named finding targets are
  unchanged at the planning base; their current collaborators and configured
  commands were inspected again. No historical passing result is current evidence.
- Eleven findings have concrete static support. Case 2 establishes inadequate
  write isolation, not proven corruption. Cases 5 and 10 establish ambiguous
  fixtures, not a currently broken production limit. Cases 8 and 9 contain useful
  authority assertions that must be preserved or strengthened selectively.
- The current admitted optional runtime is Chatterbox v5 under ADR-0058. The v3
  successor-publication tests and other frozen versions remain historical
  regression coverage. This plan does not promote, rebuild or republish them.
- No tests, builds, linters, type checks, benchmarks, installers or model runs
  were executed to establish the original planning findings. The execution
  progress and fresh results below supersede that planning-only status.

## Scope and non-goals

### Delivery and implementation boundaries

The planning commit may change only this document, `docs/plans/active/README.md`
and `docs/README.md`. A later execution must establish its own current source
identity, authorization and acceptance evidence. This document does not authorize
a push, pull request, publication, model download or modification of real user data.

The intended implementation is bounded by the case decisions below. Production
EPUB parsing, TTS adapters and benchmark algorithms are read-only collaborators.
Only the lifecycle validation script may change executable behavior. If a stronger
test exposes a production defect, retain the evidence and revise the relevant
scope before fixing it; do not silently expand this test-maintenance patch.

Do not change frozen corpus/schema/profile/manifest bytes, generated sources,
locks, support matrices, model weights, historical measurements, completed plans,
uninstall flags or installer configuration. Do not add a testing dependency,
change thresholds to obtain a pass, or remove tests based only on similar bodies.

### Case-by-case decisions

#### C01 - Protect original data when lifecycle backup fails (P1)

**Evidence:** `scripts/test-windows-package-lifecycle.ps1`, backup at lines
248-262 and unconditional cleanup at lines 325-354. A failed move leaves
`originalDataBackedUp` false while cleanup can delete the original `dataRoot`.

**Action:** distinguish a verified backup from ownership of a disposable test
root. Grant test-root ownership only after proving the original root was absent,
or after a successful, verified backup leaves the original path absent. Require
that ownership for every fixture-root removal and quarantine operation, including
`Initialize-DataFixtures` and `finally`. Preserve both locations if backup
verification is ambiguous. Restore a verified backup only into an absent target;
retain it and report the failure when restoration cannot complete.

Move only the data ownership/backup/cleanup operations into the proposed focused
companion `scripts/windows-package-lifecycle-data.ps1`, dot-sourced by the existing
script. The companion must own the guard as well as the destructive operations;
tests must call that same implementation. Keep installer invocation, scenario
matrix, product identity and receipt schema in the existing script. Retain
resolved-path containment, reparse-point checks and literal PowerShell paths.
Do not introduce a generic filesystem framework or a global test-mode bypass.

**Acceptance:** add Windows-only child-PowerShell regressions to the existing
`apps/desktop/scripts/windows-release.node-test.mjs`. Use explicit roots under a
fresh temporary directory, synthetic sentinel bytes and bounded child timeouts.
Mock only the filesystem failure operation where needed; never reproduce the
ownership algorithm in a test helper. Cover backup move failure, occupied backup,
failed backup verification, rejected reparse root, initially absent original data,
and successful backup followed by a later failure. Also cover cleanup failure
and restoration failure: only owned fixtures may be quarantined, and original
bytes must remain recoverable. Exercise real temporary filesystem moves/removals
on successful paths. These regressions must not launch an installer or touch the
real `LOCALAPPDATA`. Non-Windows skips must be explicit; Windows execution is
required. Integrate C11's cleanup of this Node test's own temporary directory in
the same unit to avoid overlapping edits.

#### C02 - Isolate negative successor-publication writes (P2)

**Evidence:** `services/tts/tests/test_release_chatterbox.py`,
`test_successor_publication_rejects_incomplete_or_substituted_assets`, calls
`write_successor_authority` without a root. The writer selects the repository
root before writing two authority files. Current rejection prevents those writes;
a rejection regression normally rewrites canonical bytes, not corrupt receipt data.

**Action:** pass an explicit `tmp_path` repository root on every writer call.
Reuse the temporary-publication pattern in `test_chatterbox_security_authority.py`:
prepare the expected manifest from read-only authority, provide it through a
narrow test fixture seam, and create the destination and sentinel files inside
the temporary root. Do not copy the entire checkout or use missing fixture files
as the reason for rejection. Preserve the real publication-validation code.

**Acceptance:** retain separate invalid-digest and missing-assets cases; both must
raise the publication error and leave the temporary output tree byte-for-byte
unchanged. Include a mandatory isolated valid-receipt control using the same
fixture setup; it must reach both writes and verify their expected canonical
contents. An accidentally accepted invalid receipt must be contained inside the
disposable root. Leave the historical
read-only authority test and real checked-in authority bytes untouched.

#### C03 - Replace circular expectations with independent sentinels (P2)

**Evidence:** `test_qwen_adapter.py` obtains expected `dtype` from the captured
load arguments; `test_benchmark_candidate_adapters.py` does the same for
Supertonic `voice_style`.

**Action:** give the fake Torch module a stable test-owned BF16 sentinel, and
assert the captured `dtype` is that sentinel. Expose it through a narrowly scoped
fixture input/result or constant without changing every helper consumer. Retain
the fake `get_voice_style` result independently and assert that the identical
object reaches synthesis. Keep all other useful load/generation assertions.

**Acceptance:** a different object, `None`, or a missing expected argument fails
the relevant assertion. Tests must not import real Torch, NumPy, Supertonic or a
model. Implement C03's Qwen portion together with C05's Qwen portion.

#### C04 - Make malformed UTF-8 the sole malformed condition (P2)

**Evidence:** `packages/epub/src/xml/xml-event-reader.test.ts` creates `<root>`
plus invalid bytes without the closing tag, so XML syntax can conceal loss of
strict decoding.

**Action:** append encoded `</root>` after the invalid byte sequence. Keep the
unsupported UTF-32 case, using separate descriptions if that makes the failure
clearer. Preserve fixed content-free error checks and existing valid-encoding cases.

**Acceptance:** the byte sequence has one closed XML root and is invalid because
of UTF-8 decoding. A permissive decoder would no longer leave an unclosed-tag
reason for rejection. Production `fatal: true` and error mapping remain unchanged.

#### C05 - Test coherent audio at and above the size ceiling (P3)

**Evidence:** `test_qwen_adapter.py` uses one sample with shape `(480_001,)`;
`tts-adapter-layout-host.node-test.mjs` declares 480,001 samples but supplies
16 payload bytes. Length disagreement can satisfy both rejection assertions.

**Action:** in Qwen, construct finite zero-valued samples whose length, shape,
size and serialized bytes agree at 480,000 and 480,001 samples. Keep allocation
lazy and bounded. In Node, align `sampleCountSamples`, `payloadBytes` and a zeroed
buffer of `sampleCountSamples * 4` bytes for the same boundary pair. Preserve a
separately named inconsistent-length case only when it adds distinct coverage.

**Acceptance:** exact-maximum valid output is accepted and maximum-plus-one valid
output is rejected with no retained result. Preserve NaN, wrong-dimension and
identity cases. Do not require each equivalent sample/byte limit to fail in
isolation, and do not infer an existing runtime overflow from the original fixture.

#### C06 - Exercise disagreement with the blinded sample map (P2)

**Evidence:** `test_benchmark_candidate_screen_result.py` only supplies ten
matching samples to `_validate_private_review`; the actual set-equality rejection
in `benchmarks/candidate_screen_result.py` has no corresponding negative case.

**Action:** retain and accurately name the positive aggregation case. Add two
focused negative cases: replace one sample ID with another valid-format ID; swap
the languages of one Spanish and one English sample while retaining their IDs.
Keep ten unique samples, five per language, valid scores, matching session and
candidate, and the correct raw-file digest in both cases. Share a local fixture
only where these cases actually need the same setup.

**Acceptance:** each mismatch raises the fixed quality error through the same
consumer. The all-matching control still returns the expected aggregates. Neither
count, language balance, schema shape nor hash errors may mask identity mismatch.

#### C07 - Remove the local batch slicing tautology (P3)

**Evidence:** `narration-segment-packer.test.ts` packs once and compares local
`groupSegments(...).flat()` results. The integration matrix already compares real
preparation requests with maximum batch sizes 1 and 4; opened-publication tests
also compare 8 and 16.

**Action:** remove only `makes stable segmentation independent of later batch
slicing` and the now-unused `groupSegments` helper. Preserve the real integration
tests and their full segment/locator comparisons. Add no replacement clone of the
already-covered integration scenario.

**Acceptance:** existing real batch-size invariance cases remain collected and
pass; the helper has no remaining callers. M005 normalization, segmentation and
locator semantics are unchanged. Re-read its completed plan and current roadmap
status when executing, without modifying that historical plan.

#### C08 - Reduce proven duplication without discarding authorities (P3)

**Action A:** in `test_chatterbox_sources.py`, replace four misleading failure
labels with the two actual injected outcomes: blob-read failure and byte mismatch.
Retain failure-before-staging assertions, the existing commit/path argument test
and the separate Git-read failure test. Do not claim a new wrong-commit scenario.

**Action B:** remove only `test_v4_fixture_mutations_do_not_change_the_authority`
and `test_v5_fixture_mutations_do_not_change_frozen_authority`, after checking that
the existing v4/v5 immutable-hash tests and real authority-drift rejection tests
remain. Their local deepcopy mutations never reach a consumer afterward. The v4
fixture does call a loader before mutation; the tests are not entirely detached
from real files. Keep fixture builders and imports still used elsewhere.

**Acceptance:** both effective source-failure cases still reject without staging,
and each separate historical authority retains its literal digest and actual
tamper-rejection coverage. No frozen files or recorded benchmark results change.

#### C09 - Retain useful pins and replace misleading local checks (P3)

**Rust:** in `tts_protocol_probe/tests.rs`, replace count/timeout comparisons
against their own constants with explicit `(actual constant, frozen literal)`
pairs. Remove `count_within_limit` and `within_timeout` if unused. Name the check
as a historical authority-value pin, not proof that runtime enforces these limits.
Preserve `tts_protocol_probe.rs` and its complete `frozen_authority` block, other
probe tests and actual frame-limit coverage. Do not import production framing
into the deliberately independent probe.

**Reader benchmark:** in `reader-performance.benchmark.spec.ts`, remove only
`selectedCapacityFor` and its three assertions. Keep the literal pins for 250,
10,000 and 80,000, which constrain the real benchmark's parameters. Keep the
existing test title and the actual rendering/performance journeys. Actual product
capacity rejection remains covered in `large-chapter-rendering.test.ts`.

**Python v12:** replace `test_v12_conditions_remain_explicit` with deterministic
tests of `run_v12_preflight`. Supply one otherwise eligible fixture, then make
each condition false individually. Patch the module's Git, host, firewall,
candidate-path/loading and ancestry/tree probes; use a temporary fake interpreter
file and scoped environment overrides. Never run a GPU probe, firewall command,
model import or child interpreter in these tests. Do not extract production logic
just to make this test easier.

**Acceptance:** the v12 positive control is eligible; each false condition produces
only its corresponding `sleep`, `background-load` or `thermal-state` reason and
an ineligible receipt. Rust value drift fails a literal pin; browser parameter
pins and genuine production capacity tests remain useful. The removed constructor
test's small compatibility check is subsumed by these actual consumer calls.

#### C10 - Isolate the resolved total-path limit (P3)

**Action:** in `packages/epub/src/paths/ocf-reference.test.ts`, keep base
`a/base.xhtml`. Build a target from seven 255-byte ASCII components and one
254-byte component joined by `/`: the target is 2,046 bytes and resolves to
2,048. Increase only the last component to 255 bytes: the target remains valid
at 2,047 bytes but the resolved path becomes 2,049. Every component stays within
255 bytes and the component count remains below 32.

**Acceptance:** the exact resolved maximum succeeds; maximum-plus-one raises
`resource-limit-exceeded`. Keep independent archive-path unit tests. This repairs
one ambiguous resolution case, not a suite-wide absence of total-limit coverage.

#### C11 - Clean up owned Node temporary directories (P3)

**Action:** register awaited teardown immediately after `mkdtemp` succeeds in
`windows-release.node-test.mjs` and `ordinary-chatterbox-release-host.node-test.mjs`.
Use `t.after` for a per-test root and a suite/file `after` hook for the shared root.
Use the existing Node filesystem API and the exact returned path. Reuse bounded
Windows retry handling only if transient locks are observed; do not suppress a
persistent cleanup failure or add a general cleanup framework.

**Acceptance:** both success and assertion failure remove only the owned root,
after its readers/handles have settled. A synthetic sibling sentinel survives.
Fold the first file into C01's implementation unit. Preserve all artifact-content
and receipt assertions. Do not add tests that merely duplicate the teardown call.

## Relevant files and documentation

Read [AGENTS.md](../../../AGENTS.md), [the plan rules](../../../.agents/PLANS.md),
[MVP requirements](../../product/mvp.md), [testing guidance](../../development/testing.md),
[independent change review](../../development/agentic-change-review.md),
[Git workflow](../../development/git-workflow.md),
[the system diagram](../../architecture/system-diagram.md) and
[architecture overview](../../architecture/overview.md).

Applicable authorities are
[ADR-0047](../../architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md),
[ADR-0058](../../architecture/decisions/ADR-0058-admit-certifi-pillow-chatterbox-v5.md),
[completed M005](../completed/M005-narration-text-preparation.md) and
[the roadmap](../roadmap.md). Source paths and exact test symbols are recorded
in each case above; line numbers describe the planning base and are not identities.

## Architecture and constraints

The package/process/runtime/persistence map remains unchanged. The proposed
PowerShell companion is an internal maintainer-tool boundary, not an application
service or public contract. Review the canonical diagram at closeout; update it
only if execution actually changes its architectural model. No ADR is needed for
stronger tests or for enforcing the lifecycle harness's existing preservation duty.

Keep EPUB contents local, inference local, audio transient, work cancellable,
queues and buffers bounded, stable locations synchronized and diagnostics free
of book text. All fixtures are synthetic. Copy no installed books, audio or model
files into regression fixtures. Historical authority pins establish historical
identity, not fresh performance or current runtime admission.

Test removals and changed acceptance criteria require independent
`change_reviewer` approval under `agentic-change-review.md`. Use one implementation
writer at a time. The reviewer is read-only and does not run checks. Do not use
`clean_code_worker` for the behavioral lifecycle repair. A separately scoped
behavior-preserving refactor, if later needed, must use its own approved workflow.

## Milestones

### Milestone 1 - Refresh evidence and establish safe execution readiness

Status: complete; safe baselines recorded. The initially blocked G7 prerequisite
was resolved by the user's explicit uninstall/reinstall authorization and verified
recovery preparation; real G7 subsequently passed.

Confirm the branch, clean index, exact HEAD and target-path identities. Re-read
all named tests and callers; reconcile drift before editing. Record current
Node/pnpm/Python/uv/Rust/PowerShell identities and locks. Confirm whether the
user's no-tests restriction has been superseded before running any gate. If it
remains active, record validation as pending; do not claim implementation acceptance.

Establish the safe model-free baselines from the gate table while preserving
failures and identities. C02 starts with static baseline evidence: make U2 the
first Python edit, and do not run the full Python suite until its writer calls
are isolated. The first complete G4 run is post-change evidence for U2 and a
pre-change baseline for the remaining Python units, never a retrospective passing
baseline for C02. Never run the unsafe original lifecycle harness against a real
profile merely to reproduce C01. Its baseline is static control-flow evidence
plus an isolated fault regression introduced with the bounded repair. Likewise,
do not use a real-root publication writer for an intentional rejection mutation.

### Milestone 2 - Complete safety and isolation units

Status: complete; isolated checks, real U1 lifecycle acceptance, final
reinstallation and original-data verification passed.

| Unit | Cases and closed source scope | Acceptance boundary |
| --- | --- | --- |
| U1 | C01 + C11 first file: lifecycle script, proposed data companion, `windows-release.node-test.mjs` | High risk: owned-root faults, Node checks and real Windows lifecycle preservation |
| U2 | C02: `services/tts/tests/test_release_chatterbox.py` | Isolated publication rejection and no fixture writes |
| U3 | C11 second file: `apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs` | Owned temporary-root cleanup |

Run fast deterministic checks before the actual installer gate. A passed mocked
test cannot close U1's real lifecycle acceptance. The existing lifecycle command
requires no pre-existing program installation. Without explicit user authority,
preserve an existing installation and use an appropriate disposable Windows
account/host. This execution received explicit uninstall/reinstall authority,
verified a separate recovery copy, ran G7, reinstalled and verified original data.
Unresolved host readiness in any future run remains pending acceptance.

### Milestone 3 - Strengthen assertion and boundary units

Status: implemented; affected focused and final combined checks passed.

| Unit | Cases and closed source scope |
| --- | --- |
| U4 | C03 Qwen + C05 Qwen: `services/tts/tests/test_qwen_adapter.py` |
| U5 | C03 Supertonic: `services/tts/tests/test_benchmark_candidate_adapters.py` |
| U6 | C04: `packages/epub/src/xml/xml-event-reader.test.ts` |
| U7 | C05 Node: `apps/desktop/scripts/tts-adapter-layout-host.node-test.mjs` |
| U8 | C06: `services/tts/tests/test_benchmark_candidate_screen_result.py` |
| U9 | C10: `packages/epub/src/paths/ocf-reference.test.ts` |

For each unit, demonstrate the independent expected value or single invalid
condition, then run the affected configured checks. Keep proof content-free.
Do not add mutation-testing tooling. If a temporary counterfactual is needed,
perform it only in an explicitly disposable copy after test execution is allowed,
and retain no mutated source in the accepted patch.

### Milestone 4 - Remove or replace only demonstrated weak coverage

Status: implemented; coverage ledger and passing checks recorded below. No SKIP.

| Unit | Cases and closed source scope |
| --- | --- |
| U10 | C07: `packages/epub/src/narration/narration-segment-packer.test.ts` |
| U11 | C08 A: `services/tts/tests/test_chatterbox_sources.py` |
| U12 | C08 B: `services/tts/tests/test_benchmark_v4_authority.py` and `test_benchmark_v5_authority.py` |
| U13 | C09 Rust: `apps/desktop/src-tauri/src/tts_protocol_probe/tests.rs` |
| U14 | C09 browser: `apps/desktop/tests/browser/reader-performance.benchmark.spec.ts` |
| U15 | C09 Python: `services/tts/tests/test_benchmark_corrective_v12.py` |

Record every removed test/helper and its surviving coverage or replacement.
Retain a target as `SKIP` when new evidence shows useful coverage would be lost;
record the concrete reason instead of forcing deletion. Keep these changes
separate from the U1 filesystem behavior repair for review and attribution.

### Milestone 5 - Integrate, independently review and close

Status: complete. G1-G8, host restoration/cleanup and independent review
TEST-INTEGRITY-R4-20261021-ASTRA pass; no acceptance work remains.

Run the declared combined gates once the relevant units are stable, without
duplicating equivalent passing executions absent a changed input. Update
`docs/development/testing.md` with the lifecycle safety regression boundary and
any altered test purpose; this is an additional implementation-document path.
Record test-count changes by named removal/replacement, not as a success metric.
Freeze source and documentation, obtain exact-patch `change_reviewer` approval,
and recheck identities before any separately authorized implementation commit.

Move the plan to `docs/plans/completed/` only when required gates, cleanup and
review are complete. Update both plan indexes and the documentation index then.
The planning commit does not count as completing an implementation milestone.

## Testing and benchmark strategy

All execution evidence must come from normal local PowerShell outside the
managed sandbox. Root commands below use repository root as cwd unless a package
is explicitly selected. Commands are taken from current package configuration;
the benchmark grep is a filter on an existing configured Playwright script.
Current execution results are recorded below; historical receipts are not reused.

| Gate | Invariant / existing command | Timing and affected cases |
| --- | --- | --- |
| G1 | `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript` | Baseline and affected TS/JS batches; before expensive preparation |
| G2 | `pnpm.cmd build:packages` then `pnpm.cmd --filter @voxleaf/epub test` and `pnpm.cmd --filter @voxleaf/epub typecheck` | Baseline and EPUB units/batch; C04, C07, C10 and surviving integration coverage |
| G3 | `pnpm.cmd --filter @voxleaf/desktop test` | Baseline and Node/desktop batch; U1, U3, U7 plus actual reader capacity tests |
| G4 | `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`, `pnpm.cmd typecheck:python`, `pnpm.cmd test:python` | First after U2 isolation; post-change evidence for C02 and baseline for remaining Python units, then Python batch; no models |
| G5 | `pnpm.cmd format:check:rust`, `pnpm.cmd lint:rust`, `pnpm.cmd test:rust` | Baseline and U13; preserve default and release-locked test variants |
| G6 | `pnpm.cmd build:packages` then `pnpm.cmd --filter @voxleaf/desktop benchmark:reader --grep "records exact selected reader-side capacity boundaries"` | Baseline and U14; retain literal benchmark pins; no performance claim from this filtered case |
| G7 | `pnpm.cmd package:windows:check`, `pnpm.cmd package:windows:lifecycle` | U1 only, after fault regressions pass, on a suitable normal-user Windows host with exact installer/core identity and verified cleanup |
| G8 | `pnpm.cmd check:portable`, `pnpm.cmd check` | Final combined integration; record shared constituent execution/reuse explicitly rather than treating historical green results as fresh |

If G7 needs preparation, first run the cheap readiness checks. Use the existing
`pnpm.cmd package:windows:verified-core` only when the core check passes; otherwise
the configured `pnpm.cmd package:windows` preparation is required. Record any
new installer identity and keep local receipts separate from checked-in release
evidence. Never overwrite published/historical receipts to make this plan pass.
Synthetic fixtures are sufficient for the data-retention matrix; no Chatterbox
download or model-backed narration is required by this harness-only change.

Full reader performance benchmarks, GPU/model matrices and fresh runtime-package
publication are not triggered by test-only edits. Add their existing gates if
execution changes a corresponding runtime, performance or package boundary.
Do not weaken G7 because its failure modes involve actual filesystem ownership.

For every baseline and post-change gate, record exact command/cwd, environment,
exit status, result, start/end/duration, source and dependency identities, and
cleanup outcome. Input identity includes tests, imported source/helpers, fixture
membership, runner/configuration and locks; G6 also includes browser/build inputs,
and G7 includes the installer, core, Windows account paths and harness companion.
Changes in any consumed input or host assumption invalidate reuse. Unknown
dependencies require rerunning. Preserve the original immutable receipt and name
its reuse explicitly; refresh neither hashes nor verdicts in an old report.

The independent reviewer must inspect all acceptance-changing/removal cases and
the exact current patch with attributed host evidence. An unavailable reviewer,
missing test evidence, host restoration failure or identity drift leaves acceptance
blocked, even if other units are complete. Documentation-only planning needs
document/link/Git diff review and is exempt from runtime change review.

## Risks and rollback

- **Original data ownership:** do not mark a root owned merely because backup was
  attempted. If cleanup or restoration fails, preserve known original locations,
  stop destructive work and report content-free recovery information. Never retry
  recursive deletion against an uncertain root.
- **Test false positives:** each negative fixture must keep unrelated conditions
  valid. Retain positive boundary controls and independent sentinels so a broad
  unconditional rejection cannot pass the strengthened tests.
- **Historical evidence:** v3/v4/v5 labels and hashes have different purposes.
  Do not consolidate authorities or alter historical files to reduce test counts.
- **Overlapping edits:** U1 includes C11's Windows-release cleanup and U4 includes
  both Qwen corrections. Replan any later overlap before writing. One writer owns
  a unit; review and Git mutations occur while writers are idle.
- **Scope growth:** a new production defect, dependency or package-boundary change
  requires a recorded plan revision and revised gates before implementation.
- **Retries and recovery:** diagnose the failed stage and changed condition before
  retrying; permit at most two corrective attempts per gate before reassessing the
  approach. Never repeat an unsafe installer/cleanup operation blindly. Preserve
  failed results and verify restoration independently of the primary exit code.
- **Rollback:** undo only task-owned hunks after inspecting the current diff. Keep
  user work, real backups and evidence. No broad reset, clean or restore command.
  Reverting code does not itself restore application data or validate a host.

## Progress log

- 2026-10-21: statically verified all eleven findings without executing tests;
  narrowed publication-write, oversized-audio and low-value-test claims.
- 2026-10-21: refreshed clean `main` and confirmed named finding targets unchanged;
  inspected current commands, test helpers, architecture and historical authority
  boundaries. Created `codex/test-integrity-and-harness-safety` from the planning base.
- 2026-10-21: recorded per-case actions, surviving coverage, non-overlapping units,
  Windows preservation conditions, host gates and independent review requirements.
- 2026-10-21: independent static documentary review found two C02 clarifications;
  made the valid-receipt control mandatory and placed the Python baseline after
  isolated writer setup. No implementation acceptance was requested or granted.
- Planning structure/link review: all 12 required sections and 11 case decisions
  present; 194 local link targets exist. Unstaged Git whitespace review passed.
- 2026-10-21 execution: confirmed the requested branch and exact starting HEAD
  `9a5374f99adb0a836bd4f5bb05feca835938ac71`, clean index and worktree. User
  explicitly lifted the no-tests restriction and prohibited staging/commit/push.
- Confirmed `change_reviewer` (GPT-6 Astra high) by an actual availability-only
  delegation. One implementation worker owns U1-U15; the coordinator owns docs
  and host execution. No source edits occurred during baseline collection.
- Baseline G1/G2/G3/G5/G6 passed in normal local PowerShell. Initial commands
  stopped before checks because PATH selected pnpm 11.25.0; selecting the existing
  process-local Corepack shim restored pinned 11.15.1 without modifying locks.
  The first Rust wrapper waited after child exit; a replacement wrapper lost its
  exit code. Reassessment selected direct command invocation and repeated only
  Rust tests and the filtered benchmark, obtaining explicit zero exit codes.
  Incomplete wrapper attempts remain retained, not accepted or silently replaced.
- G7 read-only readiness found an existing user installation and application
  data. The lifecycle command is pending a suitable account/host; no installer,
  uninstaller, backup, deletion or restoration was invoked against user data.
- Local raw evidence and full tracked-input SHA-256 snapshots are under ignored
  `tmp/test-integrity/`. Baseline receipts: `baseline-20261021T214044Z`
  (G1/G2/G3 and Rust format/lint), and
  `baseline-continuation-20261021T214439Z` (Rust tests and G6). Earlier directories
  preserve the tool-selection and wrapper failures. Final evidence will identify
  exact commands, timing, dependencies and cleanup.
- U2 was the first Python edit. Its first G4 passed format, lint, mypy and 613
  tests. During that run only the two PowerShell harness paths changed; all
  Python sources/tests, authorities, dependencies and fixtures retained their
  input hashes. This is U2 post-change evidence and the remaining Python units'
  baseline, not a retrospective pre-change baseline for C02.
- U1-U15 are implemented. The two Qwen changes share U4; C11's Windows-release
  cleanup shares U1. The ten Windows PowerShell regression cases passed with
  real synthetic moves/removals, including failed/ambiguous backup, reparse,
  initially absent data, later failure, cleanup/quarantine and restoration.
- Focused lint found missing explicit Node `Buffer`/`process` imports; fixed.
  Python mypy found three non-exported probe references; module-qualified
  monkeypatch targets fixed those without production changes. The latter edit
  required one formatter correction. Final G8 reran all affected checks and
  passed; earlier failed receipts remain under `post-nonpython`, `post-python`
  and `post-python-20261021T215134Z`.
- C11 diagnostic copies ran each Node file both successfully and with a synthetic
  assertion failure. Expected child exits were 0/1; each owned root was absent
  afterward and its independent sibling survived. Copies and diagnostic roots
  were removed. Two roots created by the pre-C11 baseline were separately
  attributed by the exact run interval and verified synthetic byte inventory,
  then removed. Older unrelated temporary folders were left alone.
- `package:windows:check` passed. No installer preparation is useful on this
  unsuitable account, so no installer/uninstaller was launched. Final
  `check:portable` and `check` passed with source writing paused. No model,
  Chatterbox download, full performance benchmark or publication was performed.
- Reviewed the canonical diagram, architecture boundaries, roadmap and completed
  M005: only maintainer harness ownership and test discrimination changed. No
  system-diagram, ADR, public contract, threshold, corpus, lock, generated
  manifest, historical authority or completed-plan change is needed.

### Case and coverage ledger

| Case / units | Implemented change and retained or replacement coverage |
| --- | --- |
| C01 / U1 | Same guarded companion used by harness and twelve isolated Windows regressions. Backup attempt alone cannot authorize deletion; ambiguous copies preserve both originals and report the recovery path. Verified backup restores only into absence. Atomic directory transitions, extended-path reparse checks and real lifecycle pass. |
| C02 / U2 | Every affected writer has explicit `tmp_path`; two invalid receipt cases preserve the entire output tree, and valid control verifies both canonical writes and a historical sentinel. Read-only historical authority unchanged. |
| C03 / U4, U5 | Test-owned BF16 and voice-style object sentinels replace captured-value expectations. Other load/generation assertions remain. |
| C04 / U6 | Invalid UTF-8 now occurs inside a closed XML root. UTF-32 and valid encoding controls remain. |
| C05 / U4, U7 | Coherent zero PCM at 480,000 samples succeeds; 480,001 fails without retained Qwen output. Separately named mismatched-length, NaN, dimension and identity checks remain. |
| C06 / U8 | Matching scorecard asserts aggregates; distinct ID and swapped-language cases retain ten unique samples, five per language and correct raw digest, and reject through the real consumer. |
| C07 / U10 | Removed only `makes stable segmentation independent of later batch slicing` and `groupSegments`. Unchanged public `narration-preparation-matrix.test.ts` (1/4) and `opened-publication.test.ts` (8/16) preserve full segment/range comparisons; G2 passes. |
| C08 / U11, U12 | Four misleading source labels became two actual injected outcomes. Exact commit/path, separate Git-read failure, separate v4/v5 literal hashes and real authority-drift rejection remain. Removed only the two named local deepcopy tests and their unused `copy` imports. |
| C09 / U13-U15 | Rust count/timeout self-comparisons became literal historical pins; removed only `count_within_limit`/`within_timeout`, retaining framing/audio checks and the frozen block. Removed browser `selectedCapacityFor` plus three assertions; title, 250/10,000/80,000 pins, journeys and real capacity tests remain. V12 constructor smoke test became one eligible and three single-reason real preflight cases. |
| C10 / U9 | Individually valid components exercise resolved 2,048-byte acceptance and 2,049-byte rejection; independent archive-path tests remain. |
| C11 / U1, U3 | Awaited teardown immediately follows each owned root creation. Success and injected assertion-failure copies proved cleanup and sibling preservation. |

No units were skipped. Net collection changes are explained by those named
replacements: EPUB 672 to 671; Python 613 at isolated U2 baseline and 616 after
the remaining units; desktop Vitest stays
802 and Node grows from 84 to 96. Counts are not an acceptance metric.

## Discoveries and decisions

1. C01 is a real unsafe control-flow path. Address it before optional deletion of
   redundant tests and require isolated fault tests plus Windows lifecycle evidence.
2. C02 is a fixture-isolation repair. Do not describe a possible same-byte rewrite
   as observed authority corruption or regenerate historical release files.
3. C05 is P3 test discrimination work: redundant production bounds can remain
   correct while a fixture fails to test coherent excessive output.
4. C08 removes only duplicate outcomes/local mutation checks; distinct frozen
   authorities and their actual hash/tamper tests remain separate.
5. C09 preserves useful literal pins, converts self-comparisons to honest historical
   value pins, and replaces a constructor smoke test with actual consumer coverage.
6. The planning no-tests instruction was lifted by the execution request on
   2026-10-21. All acceptance commands must still run outside the sandbox.
7. No production architecture change is planned. Revisit the system diagram at
   completion; preserve completed M005 and other historical plans.

## Final validation results

All implementation units and required G1-G8 checks pass, including real G7 and
verified host restoration/cleanup. Independent report
**TEST-INTEGRITY-R4-20261021-ASTRA** returned **APPROVE** with no findings.
All C01-C11/U1-U15 acceptance criteria are complete.
Earlier R1/R2 reports remain immutable historical BLOCKED reports for missing G7.

Privacy redaction (2026-10-27, user-authorized): the personal checkout path below
was replaced with `<repo-root>`. The original is preserved locally outside Git;
technical requirements, results and historical approval remain unchanged.

Commands ran from `<repo-root>` in normal local
PowerShell outside the sandbox. Acceptance used Windows PowerShell 5.1, Node
24.20.0, pinned pnpm 11.15.1 through the process-local Corepack shim, uv 0.11.29,
Python 3.12.10, Rust/Cargo 1.97.1 and Windows build 26200. Recovery-copy cleanup
used normal local PowerShell 7 for long-path deletion. No sandbox result counts
as acceptance. Phase directories under ignored `tmp/test-integrity/` retain exact
commands, UTC times, duration, exit code, environment, logs and input manifests.

| Gate | Final evidence and result |
| --- | --- |
| G1 | All configured TypeScript format/lint/type commands pass in both fresh final G8 runs. |
| G2 | Build, EPUB tests/types pass; 34 EPUB files / 671 tests retain real batch invariance. |
| G3 | `atomic-move-20261021T224628Z`: format check exit 0, 5.970 seconds; `pnpm.cmd --filter @voxleaf/desktop test` exit 0, 23.470 seconds. 60 Vitest files / 802 tests plus 96 Node tests; all twelve Windows lifecycle cases execute, none skipped. Both final G8 runs refresh these results. |
| G4 | All four Python commands pass in final G8: 616 tests, mypy 174 files. The isolated U2 baseline had 613 tests. Existing pytest cache-write warnings remain warnings, not failed tests. |
| G5 | Both Clippy/test variants and formatting pass in final `check`: 110 default / 109 release-locked tests, two existing ignores per variant (`installed_host_integrity_diagnostic`, `assignment_failure_child_fixture`). |
| G6 | Explicitly reused same-session `post-nonpython/11.log`: configured exact-title Chromium filter, one test, exit 0 in 3.413 seconds. Consumed benchmark/source/fixture/config/lock identities are unchanged. No full-performance claim. |
| G7 | `real-g7-20261021T224714Z`: `pnpm.cmd package:windows:check` exit 0, 0.441 seconds; `pnpm.cmd package:windows:lifecycle` exit 0, 154.893 seconds. Install, first start, repair, all six uninstall policies, unrelated sentinels and original-data restoration pass. |
| G8 | Fresh final `integration-20261021T224935Z`: `pnpm.cmd check:portable` exit 0 in 124.050 seconds; `pnpm.cmd check` exit 0 in 191.720 seconds. Shared 209, EPUB 671, desktop 802 + Node 96, Python 616, native gates and builds pass. |

The earlier `integration/` results (86.513/130.136 seconds, Node 94) predate the
atomic-rename correction and are retained only as intermediate evidence.
G8's shared constituents were executed again, not inferred from old green logs.
G6 reuse is explicit; its executable inputs were not changed by C01. Vite's
existing large-chunk advisory remains; no threshold or dependency was weakened.

### Authorized real-host continuation and discovered correction

The user explicitly authorized uninstalling and reinstalling this account's
VoxLeaf installation. This lifted the initial host prerequisite restriction,
while preserving original data remained mandatory. No Git mutation was added
to that authorization.

The old default installer was a prior implementation. Both cheap readiness
checks passed. Preparation used the exact configured Tauri invocation from
`build-windows-release.ps1`:
`pnpm.cmd --filter @voxleaf/desktop tauri build --config src-tauri/tauri.release.conf.json --features release-locked-runtime`.
It passed in 182.913 seconds. Calling this existing package command directly
avoided the wrapper's unconditional overwrite of frozen
`windows-package-evidence-v3.json`; no historical release receipt changed.
Core validation passed via `pnpm.cmd package:piper-core:check` in 22.304 seconds.
Preparation receipts are under `lifecycle-package/`.

The selected local installer is 203,942,538 bytes, SHA-256
`294e5c86d5a66855b2a88b74b4b03d9c736b67fd2ffd11ac0acf1733c3030342`.
The core runtime-manifest SHA-256 remains
`0da4a9c3fe15abae39c260de79f3b75c08afbca5b1ab9cac9b868bdf77b87b77`.
`real-lifecycle/artifacts-rerun.json` binds G7 to that package, core, harness,
companion and regression identities. This is unsigned local validation, not
installer publication, clean-machine certification or interactive release QA.
The lifecycle receipt retains its existing clean-host/manual-validation flags.

An independent private recovery copy was verified before uninstall. The first
backup diagnostic encountered PowerShell's long-path `Get-FileHash` limitation;
extended-path SHA-256 reads completed verification before any uninstall.
Default silent uninstall preserved the original data root.

The first real G7 attempt (`real-g7/`) failed with exit 1 in 4.248 seconds:
`Move-Item` returned while source and backup remained populated. The new ownership
guard rejected that ambiguous result, withheld deletion and reported the backup.
No installer or fixture removal ran. Both partial trees were retained inside the
owned recovery area, and original data was restored from the verified full copy
without merging ambiguous trees. Full membership and byte identities matched.

The bounded C01 correction uses guarded same-parent `System.IO.Directory.Move`
for backup, quarantine and restoration, without a recursive copy fallback.
A new real preservation regression initially exposed long-path provider traversal
failure; the companion now uses literal extended-path .NET attribute/enumeration
operations and rejects reparse points before descent. Root and nested-junction
regressions preserve external targets. Hidden/read-only entries and long
descendants retain bytes, membership and attributes through backup/restoration.
The first failed `atomic-move/` receipt and formatting correction remain recorded;
the unchanged regression passes on the final correction. No production reader,
TTS, parsing, public contract, installer option or architecture changed.

### Restoration, cleanup and independent review

After passing G7, the selected current installer was installed again for the
user. Original-data membership and per-file bytes match the pre-operation
inventory; installed core identity matches the verified package. Private
inventories stayed outside the repository and are absent from public evidence.
`real-lifecycle/host-restoration-summary.json` records matching aggregate
identities, installed artifact identities and the unchanged baseline temporary
roots. `Install.json` and `Cleanup.json` record successful final reinstall and
removal of the owned recovery copy, including the preserved partial trees.
No new lifecycle backup, quarantine or sentinel remains; an unrelated pre-existing
temporary root was preserved. VoxLeaf is installed and left closed.

All synthetic regression/diagnostic roots were removed and independent sentinels
preserved. Raw content-safe gate receipts remain under ignored
`tmp/test-integrity/`. No books, generated audio, weights, secrets or private
inventories enter the patch. Historical authorities, locks and completed plans
remain unchanged. The canonical system diagram and completed M005 boundary
still match the unchanged product architecture.

Reports **TEST-INTEGRITY-R1-20261021-ASTRA** and
**TEST-INTEGRITY-R2-20261021-ASTRA** had no actionable findings and were BLOCKED
only by missing real G7. Their reports/manifests remain immutable under
`review-r1/` and `review-r2/`. **TEST-INTEGRITY-R3-20261021-ASTRA** reviewed all
78 paths and returned **CHANGES_REQUESTED** solely for one P3 documentation
inconsistency in current milestone statuses/instructions, with no runtime findings.
Those instructions now reflect the explicit authorization and completed G7.
The immutable report is `review-r3/report.md`.
**TEST-INTEGRITY-R4-20261021-ASTRA** approved the corrected 78-path snapshot at
`2026-10-21T23:02:06.1331663Z`; no findings remain. Its manifest SHA-256 is
`37ae3eb66c89aa7beca5fd5e3a9cb82cabb2a68be10cde45f37a557e724822da`, and the
report is `review-r4/report.md`. Executable inputs and accepted host evidence
remain unchanged. This closeout moves the plan and updates maintained navigation
only; its separate documentary review is retained beside the final manifest.
Reports remain outside their own reviewed-path manifests.

No staging, commit, push, PR or merge was performed. Branch and HEAD remain
`codex/test-integrity-and-harness-safety` at
`9a5374f99adb0a836bd4f5bb05feca835938ac71`, with an empty index. The plan was
moved to completed after all required gates, restoration and independent review
passed. Current product/release limitations remain in their canonical documents.
