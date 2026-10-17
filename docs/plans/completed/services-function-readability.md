# Services function readability

Status: COMPLETE (2026-10-15, America/Bogota; closing reports dated
2026-10-16 UTC). All four source units, current generated artifacts, combined
runtime acceptance and independent host restoration passed. The separately
authorized process-identity repair in the desktop test runner also passed its
independent source review and current runtime gates. No product feature was added.

`SFR-FINAL-20261016-02` records fourteen commands exiting zero, four candidate
arms, four desktop arms, identical before/after preservation records and closed
controllers. `SFR-CLEANUP16-VERIFY-20261016-02` verifies all sixteen temporary
rules absent, the eight original rules intact and the firewall active.
Historical failed runs remain immutable; their unknown causes are not inferred
from later success. Detailed local evidence remains ignored and is not a public
artifact. Verified recovery copies are retained. Changes remain unstaged and
uncommitted; no push or PR was performed. Final documentary review and evidence
currency are recorded separately in `SFR-CLOSEOUT-20261016-01`.

Prepared on 2026-10-13. Implementation branch:
`codex/services-function-readability`, created from clean, up-to-date `main`
at `9b103d16efe9f832ab3ca9db6a80e5826e15151f`.

## 1. Goal

Implement four bounded readability improvements in `services/tts`:

1. Reuse the service's existing engine-failure transition.
2. Name and share the benchmark runners' failure cleanup.
3. Name Piper's bounded source-sample collection.
4. Name local Chatterbox archive-part and ZIP-member verification.

Keep the helpers private and inside their current owners. These changes span
runtime, evaluation tooling and release preparation introduced across M007,
M010 and M011; they do not reopen those milestones or the completed service
organization and adapter-layout plans.

## 2. User-visible outcome

Users observe the same protocol records, audio samples, cancellation,
resource cleanup, package admission and errors. Contributors can read named
operations and maintain one copy of genuinely repeated logic. Focused tests
protect the distinctions that extraction could hide.

No feature, speed improvement, hardware-support expansion or demonstrated
runtime-bug correction is claimed. EPUB contents and inference remain local;
ordinary generated audio remains bounded and memory-only.

The planning request authorizes this plan, its two index links, a branch from
`main` and one local documentation commit. Source implementation and later
source commits, push or PR require their applicable execution authorization.
The planning commit does not supply that later Git authority.

## 3. Current state

The following observations were checked against the planning revision above.
Line numbers are navigation aids; refresh them before implementation. The
read-only audit packets `PY-RUNTIME-FAILURE-01`,
`PY-HARNESS-FAILURE-CLEANUP-01`, `PY-PIPER-SOURCE-ADMISSION-01` and
`PY-CHATTERBOX-LOCAL-ARCHIVE-01` support these candidates. They are neither
runtime baselines nor acceptance of an implementation.

| Candidate | Current evidence | Disposition |
| --- | --- | --- |
| Service failure | `src/voxleaf_tts/service.py:293` maps an engine exception, then repeats the cleanup/FAILED/error/state transition already owned by `_fail_engine` at line 269. | CHANGE: reuse the existing method. |
| Harness cleanup | `benchmarks/harness.py:694,710,901,914,1085,1098,1305,1318` repeat the same guarded adapter close and independently guarded memory-probe stop. | CHANGE: one private method used by eight handlers. |
| Piper admission | `src/voxleaf_tts/adapters/piper.py:422` combines chunk-format admission, cumulative source bounds and finite-sample collection inside `_generate`. Resampling is already separate. | CHANGE: one private function for the contiguous collection block. |
| Local package receipt | `src/voxleaf_tts/release_chatterbox.py:516` mixes source/runtime verification, split-archive reconstruction, ZIP/tree equality and receipt construction. Lines 553-585 form two distinct verification operations. | CHANGE: two private functions; retain receipt orchestration. |

Paths in this table are relative to `services/tts/`. Tests already live in
`services/tts/tests`; no test-layout migration is needed. Earlier decisions
against further module splitting remain compatible with these local function
extractions. There is no justification for new folders, public helpers or a
shared provider-validation framework.

Packaging makes source freshness significant. Current Piper copies current
runtime modules. Historical Chatterbox v2/v3 copy verified raw Git blobs, so
running their old payloads cannot validate changed `service.py` bytes. Local
Chatterbox v4 includes the current runtime closure and remains unpublished and
unadmitted. The existing adapter-layout host runner can exercise that closure.

## 4. Scope and non-goals

### Authorized acceptance-tool repair (2026-10-15)

The user requested analysis of the failures, the best solution, implementation
and continuation. Refresh the independent audit and passing existing-test
baseline before issuing a bounded repair order for
`apps/desktop/scripts/tts-adapter-layout-host.mjs` and its adjacent
`tts-adapter-layout-host.node-test.mjs`. The demonstrated defect is retaining
numeric PIDs across process snapshots without checking process creation time.
Correct process ownership and add deterministic regression tests, retaining
genuine child-leak rejection, network observation and existing timeout limits.
The historical rejected PID was not recorded, so PID reuse is not established
as the cause of any earlier failure. The existing auditor, worker and validator
retain their roles/models, with one code writer and at most two corrections.

Separately, diagnose the failed elevation with complete stage and exception
details before attempting restoration again. An inert elevated process may
test the existing launch method without modifying firewall rules. Use fresh
receipts, preserve every failed attempt, and correct the demonstrated duplicate
receipt filename in a new version of the temporary FINAL launcher. Subsequent
cleanup retains the exact sixteen-rule allowlist and all original-rule checks.
No acceptance predicate, threshold, policy, dependency, historical authority,
installed runtime or accepted refactor is relaxed or changed by this amendment.
Current packaged sources remain identical; runner-only changes do not require
rebuilding the unchanged verified packages. Fresh affected runtime acceptance
and independent cleanup verification remain mandatory before archival.

Implement four disjoint source units. All paths in this table are relative to
`services/tts/`; each row is a closed candidate allowlist.

| Unit | Allowed production and test files | Work | Ceiling, added plus removed lines |
| --- | --- | --- | --- |
| `SFR-SERVICE` | `src/voxleaf_tts/service.py`; `tests/test_service.py` | Existing failure-method reuse and failure-record characterization. | Two paths, 45 lines. |
| `SFR-HARNESS` | `benchmarks/harness.py`; `tests/test_benchmark_harness.py` | Eight cleanup replacements and caller-level failure characterization. | Two paths, 280 lines. |
| `SFR-PIPER` | `src/voxleaf_tts/adapters/piper.py`; `tests/test_piper_adapter.py` | Bounded sample collector and ordered multi-chunk/admission coverage. | Two paths, 160 lines. |
| `SFR-PACKAGE` | `src/voxleaf_tts/release_chatterbox.py`; `tests/test_chatterbox_sources.py` | Two archive-verification helpers and synthetic integrity coverage. | Two paths, 240 lines. |

The source manifest contains exactly these eight paths. Stop and revise the
order if a ceiling, path or behavior boundary must change; do not expand it
while implementing.

A separate preparation order, `SFR-ARTIFACTS`, owns exactly three generated
tracked outputs after source-unit acceptance:

- `services/tts/release/core/runtime-manifest-v1.json`
- `services/tts/release/core/core-package-evidence-v1.json`
- `apps/desktop/src-tauri/release/windows-package-evidence-v3.json`

Only existing builders may regenerate these files. They bind the current
runtime and desktop artifacts and are not additional source refactor targets.
Do not hand-edit hashes, evidence, serialization or generator code. Each
runtime-unit baseline/post-change uses isolated candidate preparation so these
shared paths in the original checkout remain clean until `SFR-ARTIFACTS`.

Plan progress and eventual closeout may edit this plan, both plan indexes and
`docs/README.md` under separate documentary orders. Update
`docs/development/tts-service-organization.md` or `docs/development/testing.md`
only if the resulting contributor workflow needs clarification. Review the
system diagram; internal helpers preserving the current model do not require
a diagram change or a new ADR.

Exclude protocol/schema changes, dependencies and locks, provider selection,
Qwen implementation changes, new modules, generic utility extraction, benchmark
thresholds/counts/corpora, frozen evaluation records, historical release
authority, completed plans and unrelated cleanup. Do not alter Chatterbox
v2/v3 module lists, source commits, acquisition or publication. Local
`source-manifest-v4.json` must remain byte-identical: it is a recipe, not a
manifest of current module hashes. The existing
`runtime-package-evidence-v4.json` describes admitted v3 authority and is also
excluded; it is not the local-v4 build receipt.

## 5. Relevant files and documentation

Read before issuing work orders:

- [Project instructions](../../../AGENTS.md),
  [plan format](../../../.agents/PLANS.md),
  [documentation index](../../README.md), [MVP](../../product/mvp.md) and
  [roadmap](../roadmap.md).
- [System diagram](../../architecture/system-diagram.md),
  [architecture overview](../../architecture/overview.md),
  [ADR-0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md),
  [ADR-0051](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md),
  [ADR-0052](../../architecture/decisions/ADR-0052-admit-security-refreshed-chatterbox-v3.md)
  and [ADR-0054](../../architecture/decisions/ADR-0054-refresh-piper-engine-and-phonemizer.md).
- [Service organization](../../development/tts-service-organization.md),
  [developer setup](../../development/setup.md),
  [testing guide](../../development/testing.md),
  [agentic refactoring](../../development/agentic-refactoring.md),
  [evidence retention](../../development/evidence-retention.md), completed
  [service organization](../completed/tts-service-organization.md) and
  [adapter layout](../completed/tts-adapter-layout.md).
- [Orchestrator skill](../../../.agents/skills/orchestrate-safe-refactor/SKILL.md),
  its [agent contracts](../../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md),
  [validator skill](../../../.agents/skills/validate-safe-refactor/SKILL.md) and
  [validation matrix](../../../.agents/skills/validate-safe-refactor/references/validation-matrix.md).

Inspect the eight source/test paths above and their immediate collaborators:
`engine.py`, `protocol.py`, `benchmarks/contracts.py`, the bilingual and
corrective harness suites, `packaging/chatterbox_integrity.py`,
`packaging/chatterbox_sources.py`, `packaging/chatterbox_authority.py`,
`release_core.py` and the existing release tests. Check the root `package.json`,
`services/tts/pyproject.toml`, `scripts/build-windows-release.ps1`,
`apps/desktop/scripts/windows-release.mjs` and
`apps/desktop/scripts/tts-adapter-layout-host.mjs` before preparing artifacts.

## 6. Architecture and constraints

### Ownership and extraction boundaries

`SFR-SERVICE`: keep `_last_request_id` assignment and TIMEOUT-to-
`ENGINE_TIMEOUT` mapping inside `settle_active`. Replace only its repeated
transition with `return self._fail_engine(identity, reason)`. The existing
method invalidates active identity before one cleanup, then sets FAILED and
returns the error record before the state record. Preserve cleanup exceptions,
zero-audio failure behavior and stale-result suppression. Add no new method.

`SFR-HARNESS`: introduce exactly this private method in `BenchmarkHarness`:

```python
def _cleanup_after_protocol_failure(
    self,
    main_adapter: BenchmarkAdapter | None,
    memory_started: bool,
) -> None:
```

Move only the repeated statements. Retain separate `suppress(Exception)`
blocks: failed adapter close must not skip memory stop. Keep the adapter and
memory-started guards, including existing retry eligibility after an earlier
cleanup failure. Do not catch `BaseException`, reset flags or swallow sink
errors. Each caller still constructs its own failure, notifies the sink and
returns the result after cleanup. Preserve typed failure identity, generic
`crash` mapping, privacy and each runner's distinct measurements. Do not merge
the four runners or change `run_pilot`, `_close` or cold-adapter ownership.

`SFR-PIPER`: introduce this file-private function:

```python
def _collect_bounded_source_samples(
    chunks: tuple[_PiperAudioChunk, ...],
) -> array.array[float]:
```

Keep eager `tuple(voice.synthesize(...))` in `_generate` at its existing point.
Move empty-chunk rejection, source allocation, maximum-source-sample
calculation and the current collection loop together. Preserve sample-rate,
width and channel checks, the exact real-`int` size check, positive count,
length equality and cumulative bound in their current short-circuit order.
Enforce the bound before append. Preserve `float` conversion, finite checks,
sample order and arithmetic. `_generate` retains resampling, byte order,
payload bounds, result construction and exception translation. Add no clipping,
streaming, retries, extra waveform copies or shared provider abstraction.

`SFR-PACKAGE`: introduce these file-private functions:

```python
def _verify_local_archive_parts(
    dist: Path,
    archive: Path,
    layout: PackageLayout,
    archive_hash: str,
) -> tuple[list[dict[str, object]], int]:

def _verify_local_archive_members(
    target: Path,
    archive: Path,
    layout: PackageLayout,
) -> dict[str, Path]:
```

`_local_package_receipt` retains source/runtime/lock/license/safe-loader
verification and computes the archive hash before calling the parts helper.
Keep sorted contiguous part names, one-to-four parts, positive bounded sizes,
bounded block reads, combined archive size/hash and ordered per-part records.
Preserve the separate per-part hash read; do not introduce caching. Only then
enumerate runtime files and verify ZIP members. Retain both the name-set and
member-count comparisons so duplicate members fail. Preserve member iteration,
size/hash comparison, final measurement reads and byte-identical valid receipt
serialization, including unpublished/unadmitted flags. Helpers add no error
wrapping; `check_local_package` keeps its existing `OSError`/`BadZipFile`
conversion. Archive building/splitting and staging/rollback remain untouched.

### Execution and evidence ownership

Apply the repository refactor workflow to these Python units with the existing
Python commands below. Reuse one `clean_code_auditor` and one
`clean_code_worker` on GPT-6.1 Sol high, one independent `refactor_validator` on
GPT-6 Astra high and an available `git_steward` on GPT-6.1 Sol medium. Keep the
director as coordinator, the documented concurrency limit and exactly one
source writer. Supporting agents must not delegate. Model unavailability is a
blocker; do not silently substitute or self-validate.

Refresh an Audit Packet, permit justified SKIP, establish an independent
baseline, then freeze an Approved Work Order. Every proposed unit path must
have no pre-existing change and the index must be empty. Preserve unrelated
work. If execution does not authorize commits, accepted disjoint units may
remain unstaged; record their exact identities and do not confuse them with
pre-existing changes in the next unit's allowlist.

Require independent post-change PASS, invariant review and matching before/after
HEAD, porcelain status, SHA-256 and filter-aware Git blob identities. Retain
immutable Report IDs outside validated files. Drift requires revalidation,
not refreshed hashes in an old approval. Permit at most two correction loops;
then stop and redesign. No rejected patch carries into another unit. The
validator never repairs source, tests or generated artifacts.

All tests, builds, format, lint, type, schema, native, model, firewall and
documentary acceptance run in normal local PowerShell outside the managed
sandbox. Exploratory sandbox results do not establish acceptance or failure.
Git mutations require a separate exact-path order while writing and validation
are idle, and must honor the execution request's actual Git permissions.

## 7. Milestones

### Milestone 1: Refresh scope and establish prerequisites

Work: inspect current branch/HEAD/status, required reading, four units and
existing commands. Record audited/changed/skipped/blocked/excluded targets.
Resolve the independent role availability and future Git limits. Inventory
the installed v3 runtime/models and the candidate runner's host prerequisites.
Prepare recovery copies and independent candidate snapshots as described in
section 8 before any builder can replace existing artifacts.

Validation: independent baselines use the command matrix in section 8 at the
exact pre-unit state. Baseline failures stay separate from candidate failures.
A missing required model, firewall rule or host facility is a named blocker;
do not edit the runtime unit while its required baseline is incomplete.

Status: Scope, roles, host inventory and four refreshed audits complete.
All four independent source-unit baselines passed before their respective edits.
All four source units are independently accepted. PIPER post-change05 passes
the complete eight-command matrix; earlier failed/blocked reports are preserved.

Installed-v3 readiness passes `SFR-FIREWALL-READINESS-20261014-01`.
Short-root `s0` preparation, freezing and its three firewall rules now pass.
The earlier long-path failure and cancelled elevation remain historical
evidence. The ordinary-host context prerequisite is independently verified.
Fresh `s1` preparation, freezing, three-rule setup and full SERVICE post-change
acceptance also pass. Independent p0 preparation completes all eleven commands
and full freezing. After the user's authorized retry, p0 three-rule setup and
PIPER baseline01 pass. After the user's separate p1 retry authorization, its
three-rule setup and independent readiness pass. Thirteen task rules remain:
installed-v3 plus three each for s0, s1, p0 and p1. Rejected p1 remains preserved
as nonexecutable evidence; corrected preparation02 and full post-change05 pass.

### Milestone 2: Reuse the service failure transition

Work: execute `SFR-SERVICE` within its two-file allowlist. Extend the existing
failure parameterization for FAILURE/CRASH, TIMEOUT, NON_FINITE and OVERSIZED
results. Assert exact reason, error-before-state order, zero audio and one
cleanup. Retain success, cancellation and stale identity coverage.

Validation: the five Python gates plus freshly prepared runtime baseline and
post-change gates. The new shared-service bytes must actually enter current
Piper and local Chatterbox v4 artifacts. Obtain an independent PASS.

Status: Complete; combined acceptance also passes FINAL02.
`SFR-SERVICE-BASELINE-20261014-04` PASS precedes immutable `SFR-SERVICE-WO-01`.
The two-file patch changes 26 lines against a ceiling of 45: reuse `_fail_engine`
and extend the existing five-outcome test with exact reason, work identity and
one cleanup, preserving every prior assertion. No correction cycle was needed.
Fresh independent `s1` completes all eleven preparation commands, full freeze
and exact three-rule firewall setup. `SFR-SERVICE-POST-CHANGE-20261014-01` PASS
executes all five Python gates (561 tests), preflight, candidate and desktop
from ordinary local PowerShell with fresh receipts. The changed service bytes
are bound to all three current packaged copies; installed-v3 desktop evidence
is not used to infer current Chatterbox source acceptance.

Full before/after manifests match SHA-256
`c152d43d7ce7a62bbc9c9a84593f2ca6600d736139c36a9307cbff4cc9f1495b`.
Director recheck matches the report's HEAD, SHA-256, filter-aware blobs and
porcelain; index remains empty. Accepted bytes:

| Path under services/tts | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| src/voxleaf_tts/service.py | `eb23fc4674585c666b17860b49f7004806bf3d012dfb9a213fee8c4fdf48a036` | `578864f147e6e2e25a5e5ec038b0416e6ef0ada6` |
| tests/test_service.py | `365e3db8c4ae1e164aea09fbd8a487dc3cb618d455fcdab89c78ad71bdee422e` | `01e16e493316d14dfffe834d35434c6d30296119` |

Earlier baseline03 remains BASELINE-FAIL on `desktop-process-cleanup`; its
rejection-time PID and cause remain unresolved. Baseline04 and post-change01
pass the unchanged cleanup guard; no runner fix or relaxed threshold is claimed.

### Milestone 3: Share harness failure cleanup

Work: execute `SFR-HARNESS`. Replace all eight copies, leaving each runner's
failure/result/sink construction in place. Parameterize caller-level tests for
four runners times two handler kinds. Inject typed and unexpected failures
after measurement starts; verify cleanup/sink order, original failure identity
and independent suppression when close or stop raises. Cover no-adapter and
not-started-memory guards with synthetic corpora, adapters and clocks.

Validation: the five Python gates retain existing legacy, bilingual baseline,
screen and full-protocol count/order coverage. No model benchmark is necessary
for this unit. Obtain an independent PASS.

Status: Complete; combined acceptance also passes FINAL02.
`SFR-HARNESS-WO-01` implemented the two-path/280-line CHANGE audit. Final
diff is 250 added-plus-removed lines, with 64 new caller-level cases. Baseline
`SFR-HARNESS-BASELINE-20261014-01` and post-change
`SFR-HARNESS-POST-CHANGE-20261014-01` PASS on the unchanged planning HEAD.
All five Python gates exit 0; post-change suite: 549 passed. Guards, independent
suppression, cleanup-before-sink order, original mappings, final-cleanup retries
and unsuppressed sink errors are covered. No correction cycle was needed.
The director rechecked SHA-256, filter-aware blobs and porcelain against the
immutable report outside sandbox; index remains empty. Accepted bytes:

| Path under services/tts | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| benchmarks/harness.py | `a6308187fc8d11b3f05787cd2f0ba09c73b3f7ae0ec90b91414f3322cf2db467` | `e617e0eee6d203217ab04e00c0465a5778c3e26d` |
| tests/test_benchmark_harness.py | `8ee370769d0b7b58411ac2fe82242e7a06ee97c6030cb8a8ab32ad0f2a857353` | `34373ab41a334ee5aa56cb0e3c10ecf2e69db602` |

### Milestone 4: Name bounded Piper sample collection

Work: execute `SFR-PIPER`. Retain output/failure tests; add ordered nonzero
multi-chunk input, invalid format/count and cumulative overflow across
individually valid chunks. Verify exact output values through the existing
generation surface, rather than testing only the new helper.

Validation: the five Python gates plus freshly prepared runtime baseline and
post-change gates. Check both language profiles, current-source identity,
bounded PCM, cancellation and cleanup. Obtain an independent PASS.

Status: Implemented, corrected once, independently accepted on 2026-10-15.
`SFR-PIPER-BASELINE-20261014-01` PASS (SHA-256
`3c911507f961e230ebfe715927043f83a1b0245961c3673d659902d65050b6d9`)
ran all eight required commands against fresh p0 before source edits; 561 tests
passed. `SFR-PIPER-WO-01` extracted the private collector and added eleven
caller-level characterization cases for ordered nonzero samples, invalid
format/count/length and cumulative overflow, preserving eager materialization.

`SFR-PIPER-POST-CHANGE-20261014-01` FAIL (report SHA-256
`5b3606b62616c51653015869dc4da72e0de04051d235f6c6fbc2d4c297e0b123`):
Ruff SIM905 rejected the new parameter list's constant `.split()`. Formatting,
types, build and 572 tests passed; all three runtime commands were NOT RUN
because p1 firewall setup was cancelled. The validator corrected its premature
five-gate PASS message in that immutable report. `SFR-PIPER-CO-01` (cycle 1 of 2)
replaced only that list and compacted the new helper signature to retain the
160-line ceiling. Current diff: 159 added-plus-removed lines. Worker host format
and lint checks pass, but are not independent acceptance. Accepted bytes, unchanged
since CO01 and subsequently validated by POST05:

| Path under services/tts | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| src/voxleaf_tts/adapters/piper.py | `5dd7013a1fe03a6a37d80316b7122feaa300c5e73aa141fab29f0fee4f0741ef` | `77bfe134e45277a92d12d43df72b15ee44f86b74` |
| tests/test_piper_adapter.py | `7bfe8e76ff28b28b2d5a3552c76ba288ef1c66084babb5c13de7f783687e5a8b` | `62c87288078ae6630bd1f7b2897e5496ce8d9dd2` |

The original p1 preparation passed all eleven commands, but binds rejected
pre-correction bytes. It cannot validate this correction. Independent retirement
closure02 verifies its exact preservation at `<snapshot-root>/p1-rejected01`;
its raw links and original-path receipts are historical, nonexecutable evidence.
Fresh fixed p1 preparation02 now passes all eleven section-8 commands and freezing
in ordinary host PowerShell. Frozen executable SHA-256:
`2b0d86a5378bfeda2b43d44a378287f81859d55374ea56cfdd111b79739fb9a5`,
with full adjacent resources and six recipe-verified voices. Receipt
`SFR-P1-PREPARATION-FREEZE-20261014-02` binds the corrected source and complete
independent artifact sets. This is preparation, not runtime acceptance.

`SFR-PIPER-POST-CHANGE-20261014-02` is BLOCKED (report SHA-256
`fc9c88339b6075817f0e61aadc3c92532ae1512624e247437944b0dba162cc89`).
Fresh `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`,
`pnpm.cmd typecheck:python`, `pnpm.cmd test:python` and `pnpm.cmd build:python`
all exit 0: 174 formatted files, 171 typed sources, 572 tests in 26.29 seconds,
with the existing pytest cache warning. Lint correction is independently
verified. Full before/after manifests are byte-identical, SHA-256
`370060280dc3a6424223adad8bb79299cddd5e7f7f28719f50afb9766335b06e`.
They bind all current source, original historical inputs, p1 artifacts, thirty
module bindings, installed-v3 runtime and six models, and 36 protected firewall
records. Preflight, candidate and desktop remain NOT RUN: all three p1 rules
and setup journals are absent. Independent three-rule scope review02 passes,
but user authorization to retry the cancelled UAC remains pending.

At report02 closure, no additional source correction was indicated or consumed.
The next step required authorized setup, independent readiness and a new complete
eight-command report, without appending runtime-only results to BLOCKED report02
or reusing its hashes as acceptance. Documentary provenance05 bound that progress
update; p1 retains its captured plan and immutable preparation receipts.

Subsequent execution: the user authorized p1 UAC retry on 2026-10-15; setup
exited 0 and independent readiness passed. POST03 ran seven gates successfully
but desktop failed with `process-cleanup` in the first Piper Spanish arm, with
no native PASS or desktop receipt. Its full before/after identities matched.
The exact implicated process and any preceding exception remain unknown.
Three later metadata observations found no current matching task processes;
they do not reconstruct failure-time cleanup or establish PID reuse.

POST04 retained seven passing gates but is BLOCKED: the external observer failed
before readiness, so desktop was NOT RUN. Its exact failed guard was not retained.
A separate read-only probe reproduced a current direct-identity access error for
the shared WMI parent. A reviewed new supervision order launched the POST05
observer from a live same-user supervisor predating the desktop wrapper, keeping
the outside-tree proof, privacy restrictions and runtime gates unchanged.

`SFR-PIPER-POST-CHANGE-20261015-05` PASS (SHA-256
`5613c6ed675469b0f327717dba8b414adcdaefcc854befdff01cb0b287cec243`):
all five Python commands and fresh own-p1 preflight, candidate and desktop exit 0.
572 tests pass; all four candidate and four desktop arms pass. Desktop
cancellation is 313/941/297/422 ms; no performance improvement is claimed.
No underruns, stale playback, external requests or generated audio files are
reported; six runtime children per arm and global runner cleanup pass.
Complete before/after manifests are byte-identical, SHA-256
`793aa7a96b1697e22bec4e85a468ccaa391034008a7d89b06cdb529ccd003f85`.
Desktop receipt SHA-256:
`723600be59dc8a8b55739bba5c78e3446a361e0ac25421853843ef143cfed2e1`.
Mandatory observer readiness passed. Subsequent telemetry is incomplete/exit 1:
4,914 samples, 1,461 admitted identities observed exited, zero query errors,
181 unproven ancestries and 376 numeric reuse conflicts, maximum sampling gap
349.6678 ms. Those limitations neither override runtime acceptance nor explain
POST03. No source correction beyond CO01 occurred. Director live SHA/blob
recheck of all eight source/test paths, plan and three original generated files
passed; acceptance record `SFR-PIPER-DIRECTOR-ACCEPTANCE-20261015-01` binds the
immutable report. Original generated files remain unchanged pending SFR-ARTIFACTS.

### Milestone 5: Separate local archive verification operations

Work: execute `SFR-PACKAGE`. Extend `_local_payload` fixtures for multiple
ordered parts, missing/gapped names, reordered part contents, duplicate ZIP
members, missing/extra members and same-length member tampering. Rebuild only
temporary synthetic split parts after a ZIP mutation so the parts gate passes
and the ZIP gate is reached. Assert the precise intended failure, not an
unrelated stale-receipt rejection. Retain source/tree/receipt drift assertions,
characterize caller error conversion and compare valid receipt serialization.

Validation: the five Python gates and local-v4 source/local checks against the
already current verified package. Synthetic fixtures need no model weights,
large archives or generated speech. Obtain an independent PASS.

Status: Complete; combined acceptance also passes FINAL02.
The two-file CHANGE audit was implemented under `SFR-PACKAGE-WO-01`, with
218 added-plus-removed lines (ceiling 240) and 12 new synthetic cases.
Baseline `SFR-PACKAGE-BASELINE-20261014-01` PASS; initial post-change
`SFR-PACKAGE-POST-CHANGE-20261014-01` FAIL only on one line's Ruff formatting
and E501. Correction `SFR-PACKAGE-CO-01` (1 of 2) changed only that wrap.
`SFR-PACKAGE-POST-CHANGE-20261014-02` PASS reran all seven commands outside
sandbox, with 561 tests. All 13,090 local-v4 artifact identities remained
identical to baseline; no rebuild or inference acceptance is claimed.
The director rechecked exact HEAD/porcelain/SHA-256/blob identities against
the immutable report; both files remain unstaged and index empty.

| Path under services/tts | SHA-256 | Filter-aware blob |
| --- | --- | --- |
| src/voxleaf_tts/release_chatterbox.py | `83ec812cfac95149c3e9fe100544dcbb8ff0d88d75329259452187516e585933` | `7ad5fa20643e7f141b9b64606abf58fad4887b6b` |
| tests/test_chatterbox_sources.py | `d7029140d888b4b25f774b39da55374a2d08b7d0ec7fee8859ef0b62d64897fb` | `23ed38a671e46253168d2335b2d2155205f47253` |

### Milestone 6: Prepare and validate the combined current artifacts

Work: after source-unit acceptance, freeze all eight source/test identities.
Issue `SFR-ARTIFACTS` for the three generated tracked outputs in section 4 and
its precisely inventoried ignored output roots. Capture verified recovery
copies first. Use existing builders to prepare current Piper, local v4 and
Windows artifacts in the original checkout, then freeze the executable with
its complete adjacent resources. Do not edit source during preparation.

Validation: obtain independent combined acceptance over all eight source/test
paths and three generated tracked outputs, with separate artifact manifests.
Run the aggregate, authority, native-startup and current-artifact gates in
section 8. The original checkout must support ordinary `package:piper-core`
with the accepted current manifest; an old manifest with new runtime source
is incomplete. Verify preparation did not mutate excluded authority.

Status: Complete. Preparation and combined independent acceptance pass.
FINAL02 runs all fourteen required commands successfully, including all four
desktop arms, and preserves identical before/after identities. Its report SHA-256
is `1cdf8fd9e7dc57cfad6dd83264c4333eefb7c735385f79769de583a362073af7`.
The following preparation and FINAL01 records remain historical; their failed
outcomes are preserved separately from FINAL02.
Verified recovery copies and the preserved prior local-v4 environment/runtime
preceded original builds. `SFR-ARTIFACTS-CAPTURE-VERIFY-20261015-04` PASS
(report SHA-256 `2e708060407929b8c0df4ab41d7e0e191038d8393bdf6a49e702fce473618263`)
binds the independent recovery copies. `SFR-ARTIFACTS-MOVE-VERIFY-20261015-01`
PASS (`293bae3f9a7d844830a7c925455fdcaf8ab458629b024e45d4262cee333fd8f1`)
independently verifies the preserved state after the earlier movement launcher's
receipt-writing failure. That failed execution is retained, not relabeled PASS.

`SFR-ARTIFACTS-BUILD-20261015-01` records exit 0 for every one of the nine
preparation commands in section 8, in that exact order, from ordinary local
PowerShell outside sandbox. The three generated tracked files were changed
only by their existing builders. The subsequent freeze failed on an extra
empty-directory requirement in the temporary verifier; no builder was rerun.
Independent `SFR-ARTIFACTS-RESOURCE-DIAGNOSTIC-20261015-01` establishes exactly
two missing empty source directories, `piper/hebrew` and `piper/train`, with
2,031 expected/actual files and no extra or missing files. This diagnostic did
not compare file contents or establish a historical cause.

Final correction `SFR-ARTIFACTS-BUILD-CO-20261015-02` retains complete file
path/size/SHA equality and permits only those two re-proved empty-directory
omissions. `SFR-ARTIFACTS-FREEZE-20261015-02` then exits 0: all actual 306
resource directories and 2,031 files are independently copied with the current
executable, producing 2,339 frozen entries. All 30 packaged source-module
bindings, manifests, ZIP parts, installer/checksum, input identities and recovery
preservation checks pass. Both source directories remain physically unchanged
and empty. Source, recipe, lock and old-authority identities remain unchanged;
installed-runtime preservation is also required in final acceptance.
All recorded processes closed; before/after source identities and empty index
match. Independent Astra receipt review confirms preparation consistency;
the final original eleven-command matrix and three runtime modes remain required.

The subsequent `SFR-FINAL-20261015-01` report is FAIL, SHA-256
`8f1b7054b87da435f97a5cf71e581c49a5601db5b1f35a8cc8cfd904a9c647ae`.
All eleven combined commands and fresh preflight/candidate modes exit 0.
Desktop exits 1 on `tts-adapter-layout-host:desktop-process-cleanup` after
Piper ES/EN and Chatterbox ES native matrices pass; Chatterbox EN is not run
and the global desktop receipt is absent. The predicate checks current PIDs
against observed IDs; its failure does not retain the rejected identity.
Cause remains unknown, without an inference of PID reuse or source regression.
Before/after manifests are byte-identical, SHA-256
`e392f5e0527098a4cbccd9d342845f227e9a7a3568f08d491e1356ca4f5d1be8`.
A separate launcher receipt-name collision is preserved: the command wrapper
already wrote `.desktop.outcome.json`, and the launcher refused to overwrite it.
Any future use must correct that collision under a bounded order and retain
fresh acceptance evidence; neither failure is waived or automatically retried.

Freeze artifacts receipt SHA-256:
`b5282fce8e2f3929f2f1e5848037de317381126ed1814b2ce7877ea09442b38d`.
Wrapper: `e205c9959009af4a65bd22b80a363da9828a9407ac0659ccb38ba5138114ebbf`;
outcome: `8648fe7a157bf75c7bbea1cdbc9b02cd9896a8393820b59bc6da479fa78ba06a`.
The frozen executable is `tmp/sfr-final/voxleaf-desktop.exe`, 11,814,912 bytes,
SHA-256 `9ea7540850997a9f26e50e13657309365f7af1a280bdf8d106858e17787d20da`.
Its complete adjacent resources must remain alongside it through final tests.

| Generated path | Current SHA-256 |
| --- | --- |
| services/tts/release/core/runtime-manifest-v1.json | `e3f00256070a9fe11485b009fa015430be1dec5f9bc0fadecf02492c22ba8f20` |
| services/tts/release/core/core-package-evidence-v1.json | `5dc3cf1ced14c82a68078cbaca2c4e0a1064b3568ae1d25524d457ddd25578e8` |
| apps/desktop/src-tauri/release/windows-package-evidence-v3.json | `7fd9db70e4964bd3ecbded94e2861f48c02bc49ec1949cf49d787077f91ac30c` |

### Milestone 7: Review documentation and close the plan

Work: review the full diff, helper names and test assertions. Record actual
commands, immutable reports, target dispositions and limitations; verify the
system diagram still matches the preserved architecture. Retain content-free
evidence according to policy. Remove only exact task-owned temporary host
changes after their ownership and restoration have been verified.

Validation: independent documentary review and link/whitespace checks must
agree with the accepted code/artifact state. Archive this plan only when all
required source, runtime, package and cleanup acceptance is complete. Move it
to `completed/`, update both plan indexes and incoming links directly, and
leave no redirect in `active/`. Blocked acceptance keeps the plan active.

Status: Complete. FINAL02 and independent restoration verification pass.
All sixteen task rules are absent from both stores; the original eight rules
retain all sixteen full store/filter records. Profiles remain enabled and
MpsSvc is running. Cleanup child/controller identities are closed; all sixteen
pre-documentary path identities, original journals, HEAD and empty index match.
The restoration report SHA-256 is
`3a3e3277fb607e20dea4de81ca72cb09c5424eda8dc090d1335caa699b62d7b2`.
This plan is archived in completed with direct index links and no active redirect.
The following failed restoration attempt and later observation are historical.
Read-only architectural review confirms the system diagram and overview still
match the four internal extractions. No architecture edit is needed. The two
incoming tracked links are in `docs/README.md` and the active-plan index; both
are updated directly together with the completed-plan index after runtime and restoration acceptance.

Restoration was separately authorized after FINAL FAIL closed with identity
preservation PASS. Cleanup16 correction 1 added only the missing `Any-Value`
import and its launch hash; independent static review approved the corrected
helper and concrete restoration command. The single restoration attempt exits 1
with `InvalidOperationException` / `cleanup-launch-failed-no-retry`. Only its
279-byte outcome exists; no launch, summary or working journals were retained.
The failure record omits stage, message and native error code, so it does not
establish UAC cancellation or another specific cause. No rule-removal execution
is recorded. The failure outcome SHA-256 is
`e713d48776bca2f2d02009fbc38149a2c54eb0bd5e84e60a6c93d691ca0382e1`.

`SFR-CLEANUP16-STATE-DIAGNOSTIC-20261016-01` independently confirms current state
unchanged, SHA-256
`e42814d608417ea75a212a0fdaf888d4d7d909fb4440c2fa39d49b276ecf1e68`:
all 48 full firewall store records equal FINAL.after, profiles enabled, MpsSvc
running, twelve accepted identities and empty index preserved, no live cleanup
invocation and the controller absent. This is a state observation, not successful
restoration. Sixteen task rules remain: installed-v3 plus three each for
s0/s1/p0/p1/original3; the original eight remain intact. Keep verified recovery
copies and all failed/successful receipts. Do not remove rules by display name.

## 8. Testing and benchmark strategy

### Deterministic command matrix

For every source unit, run these existing root scripts before and after edits
in normal local PowerShell outside the sandbox:

```powershell
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd test:python
pnpm.cmd build:python
```

Use the repository-pinned tool versions and locked environments. Record exact
commands, exit codes and scope. The five commands protect syntax, formatting,
types, behavior and the maintainer wheel; they do not prove actual packaged
inference. Do not replace caller-level characterization with helper-only tests
or rewrite expected behavior merely to make a refactor pass.

### Fresh runtime preparation and isolated unit snapshots

`SFR-SERVICE` and `SFR-PIPER` each require pre-edit and post-edit runtime
evidence. Prepare independent snapshots under an ignored task evidence root,
one per target/phase. Copy the exact tracked worktree inputs, including earlier
accepted changes, and record their identities against the original. Exclude
recursive copies of `tmp`, caches, environments and build outputs; provision
independent writable dependencies and outputs. No editable installation,
hard-linked writable artifact or junction may resolve back to the original
checkout. Preserve the original source and current package-authority files.

Execution clarification (2026-10-14): use exactly
`<snapshot-root>/{s0,s1,p0,p1}` for the four independent snapshots. This is a
task-owned evidence tree outside the repository and therefore outside Git,
not a directory classified by the original `.gitignore`. The original source
and preparation scripts remain in their existing locations. Verify the exact
root is absent and its parent chain is not a reparse path before obtaining
narrow host write authority and creating it. Record ownership and retain
separate original-source and snapshot boundaries; never use a junction,
symbolic link or drive alias. Receipts remain under each snapshot runner's own
fixed evidence root. The longer initial snapshot and failed receipts remain
preserved under original ignored evidence. This mitigation addresses the
observed staging-path failure without changing builder or Windows policy;
successful short-root execution is still required. Original-checkout
`SFR-ARTIFACTS` preparation and recovery requirements remain unchanged.

Use the snapshot's own root scripts and runner, not the original runner pointed
at another tree. The runner derives source and authority paths from its own
location. Historical Git-dependent checks run in the original checkout with
the required full history; a source snapshot is not a substitute for that
history. Any extra snapshot-preparation script must live in ignored task
evidence, record its inputs/outputs, and receive review before execution.

Bootstrap each new snapshot from its own root using the existing documented
setup commands, before preparing runtime artifacts:

```powershell
pnpm.cmd install --frozen-lockfile
uv sync --project services/tts --locked
```

Verify that its workspace links and Python editable installation resolve to
that snapshot, with independent writable environments. Lockfiles must remain
unchanged. The Piper builder also needs six ignored local voice inputs that
are absent from a tracked-file snapshot. Read the two `voices[].sourceDirectory`
entries and their `artifacts` records in
`services/tts/release/core/source-manifest-v1.json`. Copy exactly those six
files from the verified existing local inputs into the same relative paths
under the snapshot's `models/tts/`. Verify every source and destination size
and SHA-256 against that recipe, and recheck the original inputs are unchanged.
Use independent files; do not link writable model data back to the original.
Do not copy unrelated models or change user model directories. Missing or
mismatched inputs block preparation; `_copy_voices` does not acquire them.

The preparation writer runs the following existing commands from each runtime
snapshot root, in order, stopping on failure. Run the same sequence in the
original checkout for `SFR-ARTIFACTS`. `build:packages` must precede Windows
packaging because the desktop hook builds Vite but does not build the shared
and EPUB packages whose exports point to their generated `dist` files:

```powershell
pnpm.cmd build:packages
pnpm.cmd package:piper-core:write-manifest
pnpm.cmd package:piper-core
pnpm.cmd package:piper-core:check
pnpm.cmd package:chatterbox-optional:v4:check-source
pnpm.cmd package:chatterbox-optional:v4
pnpm.cmd package:chatterbox-optional:v4:check-local
pnpm.cmd package:windows
pnpm.cmd package:windows:check
```

These are preparation operations before the acceptance freeze, never validator
repairs. `package:windows` rebuilds Piper; recheck source and manifest identity
afterwards. Bind copied runtime module bytes to the recorded source paths;
Piper manifest/tree consistency alone does not prove source freshness. Retain
local v4's runtime tree, manifest, archive, parts and `local-build-evidence-v4.json`
in its ignored `dist/v4` area. Do not run `:v4:write-source`: these function
extractions do not change the source recipe.

Freeze the resulting executable with its complete sibling `resources` tree in
an ignored directory inside the same snapshot root. Record executable hash,
resource hashes, Piper manifest, Windows evidence and actual runtime/source
identities before validation. Aggregate builds may replace `target`; they must
not replace this frozen evidence set.

### Runtime acceptance commands and prerequisites

The independent validator sets `$frozenExecutable` to that verified absolute
path. Set each receipt variable to a fresh absolute filename under
`<runner-root>/tmp/evidence/tts-adapter-layout/services-function-readability/<report-id>/`.
The variables below are explicit runner arguments, not new repository scripts:

```powershell
pnpm.cmd test:tts:adapter-layout:preflight --executable "$frozenExecutable" --receipt "$preflightReceipt"
pnpm.cmd test:tts:adapter-layout:candidate --executable "$frozenExecutable" --receipt "$candidateReceipt"
pnpm.cmd test:tts:adapter-layout:desktop --executable "$frozenExecutable" --receipt "$desktopReceipt"
```

Receipts are immutable and cannot be overwritten. The existing runner rejects
receipt paths outside its fixed `tmp/evidence/tts-adapter-layout` root. Its
`--piper-root`, `--chatterbox-root` and `--executable` overrides must also remain
inside its own repository root. Keep the local-v4 receipt beside its package.
Use defaults for package roots unless an explicitly verified contained copy is
needed. `--chatterbox-model-root` is restricted to the installed v3 models;
it is not permission to substitute an arbitrary model directory.

Preflight requires the admitted installed v3 runtime and six verified models,
compatible Windows/GPU/drivers/WebView2 and active exact-interpreter outbound
block rules named `VoxLeaf TTS Benchmark Offline`, Profile Any, with firewall
profiles enabled and MpsSvc running. Copies/frozen paths need matching rules
for their own interpreter locations. Inventory and verify these prerequisites;
obtain required host authority for any missing task-owned setup without
altering user rules or installations. Past plan results do not prove present
prerequisites. Missing facilities block acceptance, not deterministic work in
unaffected units.

Candidate mode must execute fresh Piper and local-v4 Chatterbox in Spanish and
English, testing bounded PCM, malformed input, cancellation/identity
invalidation, termination, restart/shutdown and content-safe observations.
Desktop mode uses refreshed packaged Piper and unchanged admitted installed
v3; it does not establish desktop use or admission of v4. Both are needed for
the runtime units. Keep the existing audit-event and firewall policy intact,
including the separately counted, still-denied NumPy and urllib3 probes.
Use only synthetic text and memory-only audio. No installer journey, optional
package publication, reinstallation or Qwen model matrix is required here.

### Maintainer-only and combined gates

The harness unit needs the deterministic command matrix and eight-handler
characterization; do not run a fresh benchmark campaign or change its frozen
measurement authority. The local receipt unit additionally runs these checks
on an already current verified local-v4 package, recording its identity before
and after:

```powershell
pnpm.cmd package:chatterbox-optional:v4:check-source
pnpm.cmd package:chatterbox-optional:v4:check-local
```

Changing the verifier alone does not require rebuilding or running inference.
If no current package exists, prepare one under an explicit preparation order
before freezing acceptance; do not let the validator build or repair it.

For combined acceptance, run from the original checkout:

```powershell
pnpm.cmd package:piper-core:check
pnpm.cmd package:chatterbox-optional:check-source
pnpm.cmd package:chatterbox-optional:check-acquisition
pnpm.cmd package:chatterbox-optional:v3:check-source
pnpm.cmd package:chatterbox-optional:v3:check-acquisition
pnpm.cmd package:chatterbox-optional:v4:check-source
pnpm.cmd package:chatterbox-optional:v4:check-local
pnpm.cmd package:windows:check
pnpm.cmd check:portable
pnpm.cmd check
pnpm.cmd test:native-startup
```

Also run the three adapter-layout modes above against the combined frozen
artifacts with new receipt paths after those commands. The Windows package
check precedes aggregate builds because those builds can replace default
outputs. Bind that check to the complete frozen Windows artifact set before
replacement; later runtime checks use the frozen executable and resources.
The validator must not restore or rebuild artifacts mid-report. Record each
artifact identity alongside its result. Do not reuse model evidence after
source/artifact drift.

For documentary closure, check relative links, the 12 required sections,
configured command names, target dispositions and whitespace, and run the
existing `pnpm.cmd check:evidence` guard. No Markdown formatter or link-check
script is assumed to exist. A reviewed temporary checker may live in ignored
evidence. Store concise accepted receipts under the evidence-retention policy;
never commit raw logs, private paths, model weights, generated audio or books.

## 9. Risks and rollback

The service change can alter failure ordering if bookkeeping moves with the
cleanup. Piper extraction can silently change eager collection, bound timing,
integer admission or numeric conversion. Harness cleanup can mask an original
failure or skip memory stop if suppression scopes merge. Archive extraction
can weaken duplicate-member rejection, change error precedence or accept
different part ordering. The named invariants and caller-level tests address
these specific risks.

Packaging is not transactional across all outputs. Before original preparation,
capture and verify recoverable copies of both tracked Piper outputs and their
matching runtime directory/archive, plus Windows evidence, executable,
resources, installer and checksum. Keep recovery data outside builder targets
and record exact absolute paths. On partial failure, restore the matching set
through a bounded preparation/recovery order; restoring only a manifest or
evidence JSON is insufficient. Preserve installed v3 and user model data.

For a rejected source patch, correct it within the frozen order or remove only
verified worker-authored hunks. Never use broad reset, clean, checkout or stash
to discard unrelated work. Check resolved containment before any recursive
temporary-file operation. Retain failed immutable receipts and distinguish
baseline failure, preparation failure, candidate failure and missing host
prerequisites. Report unresolved gates explicitly and keep the plan active.

## 10. Progress log

Entries below retain the status observed at their recorded time. The latest
closeout entries and section 12 govern current acceptance; earlier failures
are not relabeled as passes.

- [x] 2026-10-15 (local; 2026-10-16 UTC): the user authorized bounded blocker
  diagnosis/repair and later restricted closure to pending checks, preserving
  valid evidence and allowing a new composite report with demonstrated currency.
  A new failure permits at most one bounded correction and one affected retry;
  this closing runtime/restoration execution required neither.
- [x] `SFR-RUNNER-PROCESS-POST-20261016-01` PASS: two reviewed runner/test
  files, 391 changed lines within 400, five new Node regression groups.
  The runner tracks PID plus process creation identity and retains bounded
  failure diagnostics. Existing TypeScript format/lint and desktop tests pass
  (727 Vitest and 75 Node). This is an acceptance-tool repair, separate from
  the four Python refactors; it does not prove any historical failure's cause.
- [x] An inert elevation diagnostic recorded cancellation when the user was
  absent. Its explicitly requested second attempt passed. The original older
  cleanup exception remains unexplained. Fresh launcher receipt names avoid
  the independently identified command/controller outcome collision.
- [x] `SFR-FINAL-20261016-02` PASS: eleven combined commands, preflight,
  four-arm candidate and four-arm desktop all exit zero. Before/after records
  are byte-identical and both retained controllers closed zero. No builders
  were repeated and no source, runner, artifact or threshold changed during
  this execution.
- [x] Cleanup attempt02 exits zero across all six groups. Independent
  `SFR-CLEANUP16-VERIFY-20261016-02` passes 32 absence checks, original full-rule
  preservation, firewall service/profiles, original evidence pins, sixteen
  file identities and process closure. Recovery copies and receipts remain.
- [x] Archive the plan, update the three indexes directly and replace the two
  absolute temporary-root references with portable placeholders. Final review
  binds the new documentation to the unchanged accepted non-documentary files;
  existing runtime results and unchanged-index evidence checks remain valid.

- [x] 2026-10-15: verified recovery capture04 and independent movement-state
  verification01 PASS before original preparation. The earlier launcher and
  recovery-tooling failures remain immutable and separate from these accepted
  reports. No recovery environment is executed or discarded.
- [x] 2026-10-15: all nine original preparation commands in section 8 exit 0
  under `SFR-ARTIFACTS-BUILD-20261015-01`. Existing builders regenerate exactly
  the three allowed tracked files. Local v4 remains unpublished and unadmitted;
  v2/v3 authorities and the v4 source recipe remain unchanged.
- [x] 2026-10-15: the initial freeze fails because its temporary verifier also
  requires two empty source directories absent from the packaged resources.
  Independent diagnostic report SHA-256
  `f648a0a390eab84bba9dff685c1806280007871497623dc138639c6ffc280766`
  identifies the current difference; no file-content equality or historical
  cause is inferred. Correction 1 addressed receipt-accounting precedence
  before execution; correction 2 corrects this freeze-only directory check.
  Both correction cycles are exhausted; no further automatic retry is allowed.
- [x] 2026-10-15: corrected freeze02 passes, with full file-content equality,
  all actual sibling resources, 30 source bindings and final preservation.
  Controller/wrapper/Python exit 0; all are confirmed closed. The run reads
  61,122,106,039 charged bytes for verification; this is local read volume,
  not a Git diff or PR payload. Independent receipt review confirms coherent
  preparation. No builders are repeated and no final runtime PASS is claimed.
- [x] 2026-10-15: original3 setup attempt02 and independent FINAL readiness
  pass with 42 protected plus six owned store records. Attempt01 failed before
  a journal; read-only comparison proved an ordered-dictionary sorting mismatch.
  The corrected helper uses explicit store/name expressions; the historical
  failure's unrecorded exception is not reconstructed from later success.
- [x] 2026-10-15: all eleven combined commands exit 0. Full checks record
  209 shared, 651 EPUB, 727 desktop and 572 Python tests passed; Rust suites
  pass 94 and 93 tests with one ignored each. Native startup passes. Fresh
  preflight and candidate receipts pass, with four current-package candidate
  arms; expected optional-probe denials are distinct from audio/content writes.
- [x] 2026-10-16: historical FINAL01 combined desktop acceptance BLOCKED. Three native matrices
  pass, then desktop-process-cleanup fails; Chatterbox EN is not reached and
  desktop.json is absent. Before/after identities match exactly. Separate
  launcher outcome-name collision is retained without overwriting evidence.
- [x] 2026-10-16: historical first task-rule restoration BLOCKED. One reviewed restoration-only
  launch fails before returning an elevated process object. Independent current
  state confirms all 48 records unchanged and no cleanup invocation running.
  Sixteen task rules remain; no cancellation or historical cause is inferred.
- [x] Both gates subsequently closed by FINAL02 and restoration02. This earlier blocked-state update
  has separate doc08 provenance; FINAL retains immutable doc07 inputs, and
  accepted freeze evidence retains its original doc06 inputs. No runtime retry,
  source change, rule deletion or acceptance waiver is authorized by this log.

- [x] 2026-10-15: authorized p1 UAC retry exits 0; journal SHA-256
  `18035631b0532d6c79f647e562a53e4f7c33dcbdf8a69b726a6b2aed9d6e266d`.
  Independent readiness01 PASS, SHA-256
  `955990327c3dd1ba00732f5738162b565bc588df6c717eeea5c5c093b664f71d`.
  Exactly three p1 rules are added; the 36 protected existing store records
  remain unchanged. No additional permission or policy change is claimed.
- [x] 2026-10-15: PIPER POST03 FAIL, SHA-256
  `bc76a065170a0c9d2df0c98ce8c509270c37cf1fd346ed2420db09e279bb0a1b`:
  seven gates pass; desktop fails `process-cleanup` before any native PASS.
  Full identities remain unchanged. Current-state diagnostic01 finds no task
  matches in three later observations; historical failure cause remains unknown.
- [x] 2026-10-15: PIPER POST04 BLOCKED, SHA-256
  `3906e35cd3f695e43c2813bbab2617eb38de0720cb6be11142eaa2312fb65a18`:
  seven gates pass, observer readiness fails, desktop NOT RUN, identities intact.
  Exact observer guard unknown. Parent diagnostic01 records a present direct
  identity-access error, not proof of the historical cause. Separate reviewed
  order02 permits a fresh same-user-supervisor observer launch with unchanged
  ancestry proof and all eight acceptance commands; no fallback or gate bypass.
- [x] 2026-10-15: PIPER POST05 PASS; all eight commands, four candidate and four
  desktop arms, final process/audio cleanup and full identity guards pass.
  Desktop completes at 15:58:12 UTC; after guard at 16:00:17 UTC; supervised
  completion closes at 16:00:32 UTC. Telemetry limitations remain explicit.
  Director acceptance01 SHA-256
  `4776d376fd4b13982c765d548460ff06d04a671d849231773bc66a6aebd809a9`.
  All four source units accepted; index empty, HEAD fixed, no Git mutation.
  Documentary provenance06 binds this update before recovery baseline.

- [x] 2026-10-14: corrected independent p1 preparation02 passes all eleven
  commands and full freeze (01:17:54-01:42:16 UTC on 2026-10-15). Locked
  environments, six verified voices, build:packages before packaging and
  executable/resources in the own runner root are retained. Freeze report
  SHA-256 `784e83866237e90b9ea1632ce9dfc9be10e1cdda5d43f117ca6d282c318bf2f2`;
  input manifest `1ae7f226c0092050128101ae4ae2038f0225767f70fda924c782a8c3dadffe4b`;
  artifact manifest `6c920d931bfc345be41eb6742c4e0cecb9f8ee5ebf51accc411cf18407c8ad22`.
  Original generated files and historical authority remain unchanged.
- [x] 2026-10-14: independent PIPER post-change02 runs all five exact Python
  gates successfully (01:48:27-01:48:57 UTC on 2026-10-15); 572 tests pass.
  Complete after guard passes at 01:50:38 UTC. Immutable report is BLOCKED,
  not acceptance: all three own-p1 runtime commands are NOT RUN because the
  three required rules and journals are absent. Before/after identities match;
  no source correction, artifact rebuild, UAC retry or Git mutation occurs.
  `SFR-P1-FIREWALL-REVIEW-20261014-02` independently approves only the exact
  setup scope, not readiness; SHA-256
  `1268bbe21ee66ccc2c22c2e67285aebf494b5f5c0e0bf4560e1883290cf42582`.
  Retry decision remains pending. SFR-ARTIFACTS cannot start before acceptance.

- [x] 2026-10-14: after the user's retry authorization, p0 UAC setup exits 0
  and creates exactly its three reviewed rules. PIPER baseline01 passes all
  five Python gates and `test:tts:adapter-layout:preflight`, `:candidate` and
  `:desktop` from p0 with fresh receipts and its own frozen executable/resources.
  Four desktop arms and cleanup pass; all privacy/stale/underrun counters are
  zero. All original/snapshot/artifact identities remain unchanged. Before/after
  preservation SHA-256 is
  `cdf7b5eaa09d74b071e05cc42c6d889d745e59c8b618857ee5097a36fed3642a`.
- [x] 2026-10-14: PIPER WO01 implemented; its first p1 preparation passes all
  eleven section-8 commands and full freezing. Freeze report01 SHA-256
  `0ca73c8828749ab28c5d40d6241eaac908d133920a714b43d14a2ca235380861`.
  Windows then cancels p1 UAC before helper execution; no p1 rules or setup
  journal are created. Post-change01 fails SIM905, with 572 tests passing and
  runtime NOT RUN. CO01 corrects the bounded source patch; fresh preparation
  and complete independent validation remain mandatory.
- [x] 2026-10-14: retirement attempt01 stops before moving p1 with
  `inventory-entry-race`; failed receipts remain immutable. Read-only diagnostic02
  identifies a Cargo intermediate directory whose attributes change from
  `0x10002010` to `0x2010`; identity/device/link-count/mtime remain unchanged in
  three post-exception observations. The original failed comparison value and
  cause remain unknown. No attribute is masked and no benign cause is claimed.
- [x] 2026-10-14: independently reviewed helper order02 adds one metadata-only
  directory-enumeration prepass and one fixed exact stability pass. It records
  32 attribute-only transitions among 23,665 directories, then exact stability.
  Retirement02 runs in ordinary host PowerShell outside sandbox, UTC
  2026-10-15 00:44:16-01:10:49, exit 0. Both complete inventories contain 162,192
  entries, 54,118,242 bytes and SHA-256
  `125c1646eb70376ae5ace1337ee0948c934af372c101931267c60c0104037d6a`.
  Independent `SFR-P1-RETIREMENT-CLOSURE-20261014-02` PASS (SHA-256
  `4ccc6c425a42ba72427233bf87d957df2775adf90fb9c2c641f57c9c0811090e`)
  confirms all 1,275 original inputs and all 36 protected firewall records
  preserved, old p1 absent, retired root regular/non-reparse, wrapper exited
  and earlier receipts unchanged. No retired link is followed or executed.
  This is preparation preservation, not PIPER acceptance. No source correction
  cycle is consumed by the ignored helper corrections.
- [x] 2026-10-14: `SFR-P0-PREPARATION-FREEZE-20261014-01` records all eleven
  preparation commands and full freeze passing in ordinary local PowerShell,
  from 20:30 to 20:54 UTC. The independent p0 copy includes the three accepted
  units, locked environments and six verified Piper voice files. Its input
  manifest SHA-256 is
  `aac2a480cab5ba2a74e011939ce1098966440c57bc6e465b9d46b4529fed60e2`,
  artifact manifest is
  `8f758a399d5ccc64e20c8f40940a45f598a195e3de1ae08c86da83aa5cf4cefa`
  and frozen executable is
  `eaaeec3a7c0fed22ed1febf6274b9002ae9f4598f53fa9893d7b7321908afffb`.
  Complete sets contain Piper2024 files, local-v4 runtime13085 files,
  archive/parts/receipt5 files and executable/resources2032 files. Preparation
  is not baseline acceptance; original generated outputs remain unchanged.
- [x] 2026-10-14: Windows cancels reviewed p0 UAC setup before helper execution.
  `SFR-P0-FIREWALL-LAUNCH-20261014-01` records native cancellation, not automatic
  approval rejection or code failure. Independent prerequisite report
  `SFR-P0-FIREWALL-CANCELLED-20261014-01` is BLOCKED (SHA-256
  `d5ae229c5a1209a839cf18f78d90622c87d411722fffa11b1eba53cef3e52b57`).
  Its two full preservation passes are byte-identical, SHA-256
  `6c4bad4ad92686e10f02e4b82614d17525fd98e74a6fd6f854f85d14ec863a91`:
  all three p0 rules and setup journals are absent; the thirty existing
  rule/filter records in both stores, original/snapshot inputs, six voices,
  complete artifacts and thirty source-module bindings are unchanged.
  PIPER remains clean, six accepted source/test identities match, HEAD is fixed
  and the index empty. No Python/runtime baseline commands or setup retry run.
  A user decision to reopen UAC is pending. This documentary update is bound
  separately by `SFR-DOC-PROVENANCE-20261014-03`; p0 retains its original plan
  and preparation receipts unchanged. Fresh readiness and a complete new
  baseline remain mandatory before a PIPER work order.
- [x] 2026-10-14: `SFR-SERVICE-BASELINE-20261014-04` PASS (report SHA-256
  `1e5d37b2183edc57fd0a67f8a7d133e62aff5231a5d555099be1b10779f55598`)
  runs all eight required commands freshly in ordinary local PowerShell.
  Full before/after identities match. All four desktop arms and outer cleanup
  pass. Optional external process telemetry was unavailable because PowerShell
  converted a JSON UTC string to DateTime before strict comparison; its observer
  was never launched, repaired or used for acceptance. Baseline03 remains
  immutable and its cleanup failure unexplained. `SFR-SERVICE-WO-01` is issued
  only after this new complete baseline and director identity recheck.
- [x] 2026-10-14: SERVICE implementation is 26 added-plus-removed lines in
  exactly two allowed files. The helper itself, bookkeeping, timeout mapping,
  cleanup order and all prior tests remain intact. Independent `s1` preparation
  runs all eleven commands successfully from 19:25 to 19:51 UTC and freezes the
  executable with complete resources. `SFR-S1-PREPARATION-FREEZE-20261014-01`
  binds inputs `558ac6ffcc1fa7d1e013c971965dedf5d9c5af293fcbe5d7051dcc0c40e8f607`,
  artifacts `70ae48353351592bd021d3a000285fcdd2f7ca6ebe7c98fb1dba273fb6d97fa4`
  and executable `16d4d4b90d6d9fdf657e15a6b1e79189c022f2599a90233328547b79bf93d48c`.
  Reviewed UAC setup succeeds for exactly three s1 rules; journal SHA-256
  `b84062f98407ed77eff19c050abbb1bd6b1da6d85021fa3240f1179ce32e0a43`.
- [x] 2026-10-14: `SFR-SERVICE-POST-CHANGE-20261014-01` PASS (report SHA-256
  `12feebebbe47c65395255ffdb64feb5134bf421a3198185b6fc3d24db2543109`).
  `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`,
  `pnpm.cmd typecheck:python`, `pnpm.cmd test:python` and `pnpm.cmd build:python`
  exit 0: 174 formatted files, 171 typed sources, 561 tests and the same existing
  pytest cache warning. Own-s1 preflight, candidate and desktop commands from
  section 8 exit 0 with fresh receipts. Four desktop arms pass, with cancellation
  346/886/297/310 ms; no speed improvement is claimed. Source, artifact, final
  audio-filesystem and full firewall identities remain unchanged. Thirty module
  bindings prove the changed bytes are in current Piper, local-v4 and frozen
  bundled Piper. No correction cycle, source repair or Git mutation occurred.
  Director accepts exact report identities; seven task rules remain pending
  final cleanup, with original eight rules preserved. PIPER audit is refreshed
  CHANGE within two files/160 lines; its own p0 baseline remains required.
- [x] 2026-10-14: user authorizes retrying UAC; reviewed `s0` setup succeeds.
  `SFR-S0-FIREWALL-LAUNCH-20261014-02` records the launch; setup journal SHA-256
  `47660bb5681714c8937695a910d59df02b5887467fa3229b7e8e6b1e7014084f`
  binds the three owned rules. Original eight rules and the installed-v3 rule
  remain protected. Earlier cancellation evidence is preserved unchanged.
- [x] 2026-10-14: `SFR-SERVICE-BASELINE-20261014-01` is BLOCKED: five Python
  gates pass, but preflight/candidate reject `artifact-link` under inherited
  Codex path virtualization. Automatic approval review rejects the desktop
  launch before execution pending diagnosis. Read-only comparison proves that
  ordinary WMI-launched local PowerShell aligns all six fixed canonical paths
  and all four interpreter rules without changing installations or guards.
  Independent `SFR-HOST-CONTEXT-DIAGNOSTIC-20261014-01` PASS (SHA-256
  `c03d910d5b01702ad2bdc602d3b057550be6d194e95ff3dde3d8b5a071325160`)
  establishes only that prerequisite, not runtime acceptance.
- [x] 2026-10-14: `SFR-SERVICE-BASELINE-20261014-02` is BLOCKED before tests
  by native stdout decoding of one accented word in the documentary diff.
  Exact file hashes remain unchanged. Process-local UTF-8 decoding restores
  exact unnormalized equality of all 97 diff lines in a fresh report; no source
  or documentary bytes are changed to accommodate the verifier.
- [x] 2026-10-14: `SFR-SERVICE-BASELINE-20261014-03` is BASELINE-FAIL (SHA-256
  `0dc225113eeda1f3f027624ce1b0a681dce4b3e03518d480571131dde66f2aef`).
  From ordinary local PowerShell, `pnpm.cmd format:check:python`,
  `pnpm.cmd lint:python`, `pnpm.cmd typecheck:python`, `pnpm.cmd test:python`
  and `pnpm.cmd build:python` exit 0: 174 formatted files, 171 typed sources,
  561 tests, one existing pytest cache warning. Fresh own-`s0` preflight and
  candidate commands from section 8 exit 0; receipt SHA-256 values are
  `fb01b9451b25528b7c2426395c9ecae10bc7883fccfa86c2abfcc15c0132df3e`
  and `c0c02dc06a9ba928a1be5bd93e0e1c3019a18383d856b46c567f6316f0babc04`.
  A new desktop request is approved after those prerequisites pass, resolving
  the earlier approval-review blocker. Desktop exits 1 with
  `desktop-process-cleanup` after three native matrices pass; English
  Chatterbox is not reached. No desktop receipt or source acceptance is claimed.
  Both full identity manifests equal
  `57c8e8afd6b9f7b6f0ba8140f3ff7854cf8c731efd21977618b3e6630ea2322c`.
  The exact offending PID is not logged; known descendant chains are absent on
  later observation. No process was killed, threshold changed or retry launched
  by that diagnostic. SERVICE and PIPER remain clean and the index empty.
- [x] 2026-10-14: independent `s0` preparation completes all eleven commands
  from section 8 with exit 0: locked pnpm/uv bootstrap, `build:packages`, the
  three Piper commands, three local-v4 commands and two Windows commands.
  The first final-freeze guard rejected Cargo's contained executable hardlinks;
  failure `SFR-S0-PREPARATION-FREEZE-FAILURE-20261014-01` remains immutable.
  After auditor review of the exact internal-junction traversal and two-alias
  copy correction, freeze-only retry exits 0 without rerunning builders.
  `SFR-S0-PREPARATION-FREEZE-20261014-02` binds the independently copied
  executable/resources and artifact manifest
  `fafa94cdd374873a9788c2adf19bbae781d692d61748b6aa7ea4728f825b7330`.
  These are preparation results, not runtime baseline acceptance.
- [x] 2026-10-14: the reviewed three-rule `s0` setup launch exits 1 with
  Windows message `El usuario ha cancelado la operación`. This is native UAC
  cancellation, not automatic approval-review rejection or code failure.
  `SFR-S0-FIREWALL-CANCELLED-20261014-01` (SHA-256
  `7ea29c36faa1999958f6efe0734f5411d2ccd8e7cfaf69aa0e5e33cac1e2dbc3`)
  independently verifies zero setup journals, all three rules absent in both
  stores, the original eight and installed-v3 rule/filter identities unchanged,
  and all 1,269 tracked inputs plus six voices and full frozen artifacts intact.
  Python/runtime baseline commands were not run in this blocked report.
  Reopening UAC awaits the user's decision; no retry or source edit occurred.
- [x] 2026-10-14: read-only recovery review finds the original Windows target
  executable is 12,306,944 bytes while its tracked evidence expects 11,798,016.
  Cause is not established; the current output is preserved. Independent
  `SFR-WINDOWS-RECOVERY-CANDIDATE-20261014-01` (SHA-256
  `52c6b309a35e3e9d3df8b5348fffe1131e9bea7c3d389af8ca95af87cda73676`)
  verifies retained `tmp/tts-adapter-layout-desktop-02`: all 2,034 files match
  its historical receipt, all 2,031 resources match the current Tauri mapping,
  and executable/installer/checksum match current Windows authority. This is
  a verified recovery candidate, not a new recovery capture, restoration or
  acceptance of new source. SFR-ARTIFACTS remains unstarted. Its future bounded
  preparation also needs to preserve the existing local-v4 environment before
  the unchanged synchronized builder can create its replacement.
- [x] 2026-10-14: this progress-only original-plan update is separately bound
  by `SFR-DOC-PROVENANCE-20261014-01`; `s0` keeps its original plan and immutable
  input/artifact receipts. The auditor approved explicitly accounting for that
  one documentary difference in a new full baseline. No runtime, source,
  authority, threshold or acceptance requirement is changed. One installed-v3
  task firewall rule remains owned by this campaign, pending final verified
  cleanup; no `s0` rules were created.
- [x] 2026-10-14: installed-v3 offline rule independently verified in both
  stores by `SFR-FIREWALL-READINESS-20261014-01` (report SHA-256
  `ffb4e2ae739fdc43a8d6572305f18285d28ef72bfc13a79038e954d35ed2dcaa`).
  Complete protected rule/filter identities match the prior sixteen-record
  inventory. The second setup pilot remains recorded as failed because its
  verifier compared a Boolean to a string; the corrected read-only check
  establishes current readiness without rewriting that failed journal.
- [x] 2026-10-14: preparation attempts 01/02 retained as `s0-failed01` and
  `s0-failed02`. Reviewed process-only corrections remove environment
  selectors instead of leaving empty values and use pnpm 11's supported
  `pnpm_config_` keys. The unchanged isolation guard caught global-store
  hardlinks before any builder ran in those attempts.
- [x] 2026-10-14: third long-root attempt passes locked pnpm/uv bootstrap,
  isolation checks, `build:packages`, all three Piper preparation/check
  commands and local-v4 `check-source`. Normal local-v4 build exits 1 with
  `chatterbox-package-staging-failed`. A reviewed diagnostic using existing
  `--no-sync` exposes `FileNotFoundError`, errno 2, at a 274-character staging
  destination; it is not acceptance evidence. Ordinary inspection of another
  long existing dependency path also fails while extended-path read succeeds.
  All 1,275 original tracked/voice identities, HEAD and empty index remain
  unchanged after diagnosis. Auditor approves the bounded short-root design;
  corrected scripts and actual fresh preparation remain required.
- [x] 2026-10-14: snapshot preparation scripts received independent static
  review `SFR-PREPARATION-REVIEW-20261014-01`; execution remains pending.
  The first elevated installed-v3 firewall pilot reached NetSecurity but
  exited 1 because Windows rejected its ownership-description text. Its
  immutable failed journal is retained; readback confirms no task rule in
  either store and all eight original rules remain. This is a preparation
  failure, not runtime/source acceptance or an automatic-approval rejection.
- [x] 2026-10-14: `SFR-PACKAGE-POST-CHANGE-20261014-01` FAIL on Ruff
  formatting/E501 for one 103-character new assertion. The remaining five
  commands pass, including 561 tests and full local package verification;
  all source/package identities remain unchanged. `SFR-PACKAGE-CO-01`
  authorizes only the multiline wrap (correction cycle 1 of 2). No acceptance
  or later source unit is authorized by this failed report.
- [x] 2026-10-14: `SFR-PACKAGE-BASELINE-20261014-01` PASS on the current
  source-fresh local-v4 package without a rebuild. The five Python commands
  and both `package:chatterbox-optional:v4:check-source` / `:check-local`
  commands exit 0 (549 tests). All 13,090 runtime/archive/part/receipt files
  (15,089,393,158 bytes) retain identical before/after identities. The
  immutable artifact inventory SHA-256 is
  `246f0481b8fd9e1938f08f9c0f0fec91f7d91c451e1b5a402f8dec1779d65b7c`.
  `SFR-PACKAGE-WO-01` freezes the accepted two-path/240-line audit,
  parts-before-members/read-order/receipt invariants and synthetic tests.
- [x] 2026-10-14: execution starts on the existing branch at
  `060ce34e417acca8c7eb1d7a82d5ceb1a38c3bb3`, with clean worktree/index.
  Current authorization permits implementation/preparation but prohibits
  staging, commits, push and PR; no branch setup or Git mutation is needed.
- [x] 2026-10-14: reused named auditor/worker (GPT-6.1 Sol high) and
  independent validator (GPT-6 Astra high). All four refreshed audits recommend
  CHANGE within the existing allowlists/ceilings. Git stewardship is idle and
  no Git Action Order is authorized. Required documentation and current
  source/test/build owners inspected; no architecture change is proposed.
- [x] 2026-10-14: `SFR-PREREQUISITES-BASELINE-20261014-01` records BLOCKED
  runtime readiness, not a source baseline failure. Six Piper voices and six
  installed Chatterbox model files match their recipes. Existing local-v4
  source closure matches current source; full package checks remain pending.
  GPU/WebView2/matching driver are present; exact runtime firewall rules are
  missing and the normal host token is not administrator. Preserve all eight
  existing rules and the installed runtime. Independent maintainer work may
  proceed with its own baseline.
- [x] 2026-10-14: `SFR-HARNESS-BASELINE-20261014-01` PASS outside sandbox:
  `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`,
  `pnpm.cmd typecheck:python`, `pnpm.cmd test:python`,
  `pnpm.cmd build:python` all exit 0 (174 formatted files, 171 typed sources,
  485 tests; one existing pytest cache-write warning). HEAD and both path
  identities unchanged, index empty. Pinned pnpm 11.15.1 selected using the
  existing Corepack shim via process-local PATH; default pnpm is 11.25.0.
  Frozen `SFR-HARNESS-WO-01` authorizes the two-file/280-line helper and
  caller-level characterization after this baseline. Reports/orders are
  retained under ignored
  `tmp/evidence/tts-adapter-layout/services-function-readability/`.
- [x] 2026-10-13: inspected the four suggestions, refreshed read-only audit
  evidence and consulted independent validation on current-source packaging.
- [x] 2026-10-13: updated clean `main` by fast-forward check and created
  `codex/services-function-readability` at the recorded main revision.
- [x] 2026-10-13: prepared this implementation plan and its two index links.
- [x] Refresh execution scope, baseline prerequisites and four independent baselines.
- [x] Accept `SFR-SERVICE` (2026-10-14; POST-CHANGE-20261014-01).
- [x] Accept `SFR-HARNESS` (2026-10-14; no Git mutation).
- [x] Accept `SFR-PIPER` (2026-10-15; POST-CHANGE-20261015-05).
- [x] Accept `SFR-PACKAGE` (2026-10-14; POST-CHANGE-20261014-02).
- [x] Complete `SFR-ARTIFACTS` and combined independent acceptance.
- [x] Verify cleanup, review documentation and archive the completed plan.

## 11. Discoveries and decisions

- Function extraction is justified by concrete duplication or a named
  responsibility, not file length. Existing modules and separate tests remain
  the right owners for this work.
- The harness has eight identical cleanup sites but intentionally different
  protocol runners. Only cleanup is shared.
- Piper's tuple materialization and per-sample validation are distinct phases;
  this plan names the latter without introducing streaming semantics.
- Local archive verification is separated without changing file-read order or
  receipt format. Duplicate ZIP names require both set and count checks.
- Current-source runtime validation requires current Piper and local v4;
  historical v2/v3 remain frozen. Local v4 is still unpublished and unadmitted.
- Isolated per-unit preparation prevents incidental modification of shared
  tracked artifacts. Final original preparation explicitly refreshes the
  three current generated outputs; stale manifests are not an acceptable
  closeout state.
- The source recipe does not hash live modules, so local-v4 recipe regeneration
  is unnecessary. Actual module hashes belong to the generated runtime/receipt.
- Planning and documentary validation are separate from implementation,
  runtime testing, publication and release admission.

## 12. Final validation results

All required implementation, current-artifact runtime and restoration gates
pass. The new closeout report combines the immutable results below and proves
their currency for the final worktree. Documentation changes do not trigger a
repeat of unchanged runtime checks. Evidence is retained locally under
`tmp/evidence/tts-adapter-layout/services-function-readability/`; these ignored
records are local review material, not permanent public links.

| Area | Accepted result |
| --- | --- |
| Four source-unit baselines | HARNESS, PACKAGE, SERVICE baseline04 and PIPER baseline01 PASS before their edits. |
| Four refactor implementations | SERVICE reuses `_fail_engine`; HARNESS shares eight failure-cleanup sites; PIPER names bounded sample collection; PACKAGE separates part/member verification. All behavior invariants pass independent post-change review. |
| Characterization tests | 87 new Python cases (64 harness, 12 package, 11 Piper) and five extended service outcomes; all 572 Python tests pass. |
| Runner repair | `SFR-RUNNER-PROCESS-POST-20261016-01` PASS; PID/creation identity and five additive Node regression groups, separately authorized and reviewed. |
| Current generated artifacts | All nine existing builders and corrected freeze02 passed; exactly three generated tracked outputs changed. Current Piper manifests match accepted sources. Frozen executable retains its adjacent resources. |
| Historical authorities | Chatterbox v2/v3 and the local-v4 recipe unchanged. Local v4 remains unpublished and unadmitted. |
| Combined acceptance | `SFR-FINAL-20261016-02` PASS: all fourteen commands exit zero, including four candidate and four native desktop arms. |
| Privacy, memory and cancellation | Every native arm has zero external requests, generated audio files, underruns and buffering. Existing bounded-memory, cancellation and cleanup criteria pass. Audio filesystem before/after identities match. |
| Preservation | FINAL before/after records are byte-identical: sixteen modified paths, tracked input bindings, six voices, current/frozen/installed closures, recovery metadata and firewall state preserved. |
| Restoration | `SFR-CLEANUP16-VERIFY-20261016-02` PASS: sixteen task rules absent in both stores, original eight rules/full filters intact, profiles enabled, MpsSvc running, exact retained processes closed. |
| Documentation and Git | Plan archived, indexes point directly to completed, no active redirect or added personal host paths. HEAD remains `060ce34e417acca8c7eb1d7a82d5ceb1a38c3bb3`; index empty, changes unstaged, no commit/push/PR. Final documentary review and currency proof: `SFR-CLOSEOUT-20261016-01`. |

The eleven exact combined commands are listed in section 8. Each exited zero
under FINAL02: the eight package/source/acquisition checks, `pnpm.cmd check:portable`, `pnpm.cmd check` and `pnpm.cmd test:native-startup`.
The three runtime commands also exited zero:

- `pnpm.cmd test:tts:adapter-layout:preflight`
- `pnpm.cmd test:tts:adapter-layout:candidate`
- `pnpm.cmd test:tts:adapter-layout:desktop`

Each used `--executable <repo>/tmp/sfr-final/voxleaf-desktop.exe` and its own fresh
`--receipt <repo>/tmp/evidence/tts-adapter-layout/services-function-readability/SFR-FINAL-20261016-02/<mode>.json`.
These placeholders document the local invocation without publishing account paths.

Aggregate results: 209 shared, 651 EPUB, 727 desktop Vitest, 75 desktop Node,
13 package-boundary Node and 572 Python tests pass. The two Rust configurations
pass 94 and 93 tests with one existing ignored test each. One existing Python
warning is retained. No ignored case or warning is presented as a passing test.

| Desktop arm | Audible ms | Cancellation ms |
| --- | ---: | ---: |
| Piper Spanish | 4616 | 753 |
| Piper English | 4548 | 194 |
| Chatterbox Spanish | 37941 | 295 |
| Chatterbox English | 35930 | 294 |

Immutable closing identities:

- FINAL02 report: `1cdf8fd9e7dc57cfad6dd83264c4333eefb7c735385f79769de583a362073af7`.
- FINAL02 result: `04693bc144ffd89262e3db6031190991a2c621251fa4aa8395b50fdd066a120c`.
- FINAL02 evidence index: `98edc8c78e0b5245fa8150fd55fb90253595b872e2b9fe94040fa1bfe41d1a64`.
- Identical FINAL02 before/after: `219b32ca03fb2e85fa97337976b358c626dd805c5569a54740bed66cd1439baa`.
- Restoration report: `3a3e3277fb607e20dea4de81ca72cb09c5424eda8dc090d1335caa699b62d7b2`.
- Restoration result: `cd320706fabc67562e7484dc9705f4948cbb3d0b0f633e7dd244d47ff4b6ff7c`.

Limitations: these are synthetic checks on the recorded host, not universal
performance guarantees. Process identity observation, TCP sampling and numeric
termination are not atomic native-handle guarantees. Expected framework metadata
writes and denied optional probes are distinguished from audio/content writes.
Earlier FINAL01 and source-unit failures remain historical failures with unknown
causes where evidence was insufficient. No acceptance criterion was weakened.
