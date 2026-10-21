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

The current delivery is the plan, its indexes, a local branch and one planning
commit. Implementation and runtime acceptance have not started. The user's
instruction not to execute tests remains active during this planning task.

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
  were executed to establish these findings. No source fix has been applied.

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

Status: pending execution.

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

Status: pending execution.

| Unit | Cases and closed source scope | Acceptance boundary |
| --- | --- | --- |
| U1 | C01 + C11 first file: lifecycle script, proposed data companion, `windows-release.node-test.mjs` | High risk: owned-root faults, Node checks and real Windows lifecycle preservation |
| U2 | C02: `services/tts/tests/test_release_chatterbox.py` | Isolated publication rejection and no fixture writes |
| U3 | C11 second file: `apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs` | Owned temporary-root cleanup |

Run fast deterministic checks before the actual installer gate. A passed mocked
test cannot close U1's real lifecycle acceptance. The existing lifecycle command
requires no pre-existing program installation; do not uninstall a user's current
installation to satisfy that precondition. Use an appropriate disposable Windows
user/host if necessary. Record unresolved host readiness as pending acceptance.

### Milestone 3 - Strengthen assertion and boundary units

Status: pending execution.

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

Status: pending execution.

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

Status: pending execution.

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
Every implementation gate is currently **NOT RUN**.

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
- Implementation milestones 1-5: not started; runtime acceptance pending.

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
6. The no-tests instruction prevents current runtime validation. Listing commands
   in this plan is not execution evidence or permission to run them now.
7. No production architecture change is planned. Revisit the system diagram at
   completion; preserve completed M005 and other historical plans.

## Final validation results

Planning artifact only. Documentary review checked the twelve required sections,
eleven case decisions, current configured commands and 194 existing local link
targets. The independent static review's two C02 corrections are incorporated.
The unstaged whitespace check passed. Final staged scope/whitespace review is
required immediately before the authorized planning commit. Runtime change-review
exemption applies because this delivery changes documentation only.

Implementation tests, lint/type/build gates, benchmarks, Windows lifecycle,
independent behavioral review, host restoration and final integration: **NOT RUN /
NOT STARTED**. No implementation acceptance or performance improvement is claimed.

At execution closeout replace these pending entries with exact attributed gate
receipts, the current independent Review ID/verdict, cleanup evidence, approved
scope differences and any remaining limitations. Keep the plan active while any
required acceptance remains pending.
