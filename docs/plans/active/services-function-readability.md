# Services function readability

Status: planned; source implementation and runtime acceptance have not started.
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

Status: Not started. No implementation baseline has run for this plan.

### Milestone 2: Reuse the service failure transition

Work: execute `SFR-SERVICE` within its two-file allowlist. Extend the existing
failure parameterization for FAILURE/CRASH, TIMEOUT, NON_FINITE and OVERSIZED
results. Assert exact reason, error-before-state order, zero audio and one
cleanup. Retain success, cancellation and stale identity coverage.

Validation: the five Python gates plus freshly prepared runtime baseline and
post-change gates. The new shared-service bytes must actually enter current
Piper and local Chatterbox v4 artifacts. Obtain an independent PASS.

Status: Not started.

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

Status: Not started.

### Milestone 4: Name bounded Piper sample collection

Work: execute `SFR-PIPER`. Retain output/failure tests; add ordered nonzero
multi-chunk input, invalid format/count and cumulative overflow across
individually valid chunks. Verify exact output values through the existing
generation surface, rather than testing only the new helper.

Validation: the five Python gates plus freshly prepared runtime baseline and
post-change gates. Check both language profiles, current-source identity,
bounded PCM, cancellation and cleanup. Obtain an independent PASS.

Status: Not started.

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

Status: Not started.

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

Status: Not started.

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

Status: Not started.

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

- [x] 2026-10-13: inspected the four suggestions, refreshed read-only audit
  evidence and consulted independent validation on current-source packaging.
- [x] 2026-10-13: updated clean `main` by fast-forward check and created
  `codex/services-function-readability` at the recorded main revision.
- [x] 2026-10-13: prepared this implementation plan and its two index links.
- [ ] Refresh execution scope, prerequisites and independent baselines.
- [ ] Accept `SFR-SERVICE`.
- [ ] Accept `SFR-HARNESS`.
- [ ] Accept `SFR-PIPER`.
- [ ] Accept `SFR-PACKAGE`.
- [ ] Complete `SFR-ARTIFACTS` and combined independent acceptance.
- [ ] Verify cleanup, review documentation and archive the completed plan.

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

This section tracks future implementation acceptance. Planning inspection and
the documentation commit must not populate runtime results with PASS.

| Area | Result |
| --- | --- |
| Four source-unit baselines | Not run. |
| Four refactor implementations and focused tests | Not started. |
| Independent source-unit post-change validation | Not run. |
| Fresh runtime baseline/candidate evidence | Not run. |
| Current generated artifact preparation | Not started. |
| Historical authority and current local-package checks | Not run. |
| Combined portable/native/startup/runtime gates | Not run. |
| Privacy, bounded-memory, cancellation and artifact identity review | Pending implementation. |
| Cleanup, documentation closeout and archival | Pending complete acceptance. |

Record exact commands, outcomes, immutable Report IDs and limitations here as
execution proceeds. Remain active until every required gate is satisfied.
