# TTS service organization

Status: Complete; four independently accepted source units and final portable/native gates passed.
Created: 2026-10-10.
Planning base: `main` at `fbb39a175062a6ad70a2283b9878c6b0dd4a1db0`.
Intended implementation branch: `codex/tts-service-organization`.

## 1. Goal

Separate demonstrated responsibilities in the Python release builders and
benchmark tooling under `services/tts`, while preserving runtime payloads,
commands, historical evaluation semantics and existing external imports.

This is a maintenance plan spanning release and evaluation tooling, not a new
product milestone. Keep its descriptive filename. Execute packaging work first,
then benchmark-tooling work, through bounded, independently validated units.
File length identifies inspection candidates; it is not an acceptance target.

## 2. User-visible outcome

Maintainers can find package-integrity rules, release authority, corpus loading,
evaluation presentation and score calculation without reading the full build or
session lifecycle. Existing desktop behavior, Python entrypoints, CLI output,
package identities and evaluation results remain unchanged.

The 2026-10-10 execution request authorizes the four ordered source units,
documentation and independent host validation on the prepared branch. Leave all
changes unstaged and uncommitted, with an empty index between disjoint units.
No push, pull request, authority regeneration or release publication is authorized.
The earlier branch/documentation-commit authorization covered plan authoring only.

## 3. Current state

The planning checkout was clean on the base above. `services/` contains the TTS
area. Its tracked Python inventory has 159 files: 15 under `src/voxleaf_tts`,
89 under `benchmarks`, and 55 under `tests`. Two source files are generated.
Installed environments, caches, distributions and model trees are not source
inventory. Refresh with `git ls-files -- services/tts` before execution; do not
recursively inventory installed dependencies.

| Target at planning time | Lines | Evidence and initial disposition |
| --- | ---: | --- |
| `src/voxleaf_tts/release_core.py` | 922 | Manifest integrity is separable from acquisition and staging. Read-only audit `PY-CORE-PLAN-01`: CHANGE, medium risk; extract integrity first. |
| `src/voxleaf_tts/release_chatterbox.py` | 1,403 | Source/acquisition validation, provenance, runtime assembly and archive splitting share one file. Read-only audit `PY-CHATTERBOX-PLAN-01`: CHANGE, medium risk; separate authority and integrity. |
| `benchmarks/harness.py` | 1,435 | Corpus decoding and validation precede an owner of measurement resources and four distinct protocol runners. Extract corpus handling first. |
| `benchmarks/quality.py` | 829 | Disposable-session I/O, embedded evaluator HTML and score calculation share one file. Extract presentation and calculation while retaining session ownership. |
| `src/voxleaf_tts/service.py`, `protocol.py`, `engine.py` | 418 / 361 / 82 | Initial SKIP: cohesive runtime responsibilities; no evidence that relocation improves them. |
| Runtime adapters and service entrypoints | varies | Initial SKIP: provider behavior and runtime packaging paths already matter to release authority. |
| Generated schemas and frozen evaluation authorities | varies | EXCLUDED from manual refactoring. |
| Existing Python tests | 55 files | Already separate from production code. Preserve current discovery and grouping in this campaign. |

Paths in this table are relative to `services/tts`. These observations are static
planning evidence, not a passing test baseline. Audits may narrow a candidate or
return SKIP; never force a change to make a file shorter.

At planning time, the Piper site-package copier excluded the two release-builder
filenames individually. PY-CORE now also excludes the entire exact
`voxleaf_tts/packaging/` subtree. Chatterbox uses an explicit `runtimeModules` list for local
service sources. These are different policies and must remain independently
understood and tested.

## 4. Scope and non-goals

The initial implementation scope is four cohesive source units:

1. Piper package integrity and exclusion of maintainer-only helpers.
2. Chatterbox package integrity and release-authority responsibilities.
3. Benchmark corpus loading and its shared failure identity.
4. Quality evaluator presentation and score calculation.

Retain `release_core.py`, `release_chatterbox.py`, `benchmarks/harness.py` and
`benchmarks/quality.py` as compatible entrypoints or lifecycle owners. Add only
helpers with a concrete responsibility. Avoid an undifferentiated `utils.py`, a
generic provider framework, eager package re-exports, or an engine abstraction
created only to make files look uniform.

The following suggestions are deliberately deferred:

- Splitting every release-builder stage into its own module. Start with integrity
  and authority; acquisition, staging, promotion/rollback and smoke execution can
  stay together when they form one coherent pipeline.
- Extracting the four harness protocol runners. Their historical load counts,
  language order, warm-up, cleanup and failure rules differ. Reconsider in a
  separate audited unit after this campaign, with its own baseline; do not reopen
  an already dirty accepted harness file during this batch.
- Moving tests into new runtime/packaging/benchmark directories. They are already
  independent files, and several resolve fixtures through `__file__.parents[3]`.
  There is no current discovery problem justifying that migration.
- Unifying Piper, Chatterbox and Qwen helpers, including Windows path handling.
- Reorganizing `incremental_prototype.py`, versioned authority modules, historical
  candidate environments, `adapters/manifest.py`, or frozen result/summary rules
  solely because they are long.

Do not change runtime scheduling, process contracts, adapter selection, playback,
buffering, normalization, EPUB handling, model assets, dependency versions,
lockfiles, generated schemas, benchmark thresholds, release receipts or completed
plans. Do not regenerate authority to accommodate a refactor.

## 5. Relevant files and documentation

Read these before implementing and use the current checkout as authority:

- [Project instructions](../../../AGENTS.md) and [ExecPlan format](../../../.agents/PLANS.md).
- [Documentation index](../../README.md), [MVP requirements](../../product/mvp.md),
  [roadmap](../roadmap.md), [system diagram](../../architecture/system-diagram.md)
  and [architecture overview](../../architecture/overview.md).
- [Rust-owned stdio protocol ADR](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md),
  [engine priority ADR](../../architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md),
  [Chatterbox v3 ADR](../../architecture/decisions/ADR-0052-admit-security-refreshed-chatterbox-v3.md)
  and [Piper refresh ADR](../../architecture/decisions/ADR-0054-refresh-piper-engine-and-phonemizer.md).
- [Testing guidance](../../development/testing.md) and
  [evidence retention](../../development/evidence-retention.md).
- [Refactor orchestration](../../../.agents/skills/orchestrate-safe-refactor/SKILL.md),
  its [packet contracts](../../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md),
  [independent validation](../../../.agents/skills/validate-safe-refactor/SKILL.md)
  and its [validation matrix](../../../.agents/skills/validate-safe-refactor/references/validation-matrix.md).
- [Repository commands](../../../package.json), [Python configuration](../../../services/tts/pyproject.toml),
  [core builder](../../../services/tts/src/voxleaf_tts/release_core.py),
  [optional builder](../../../services/tts/src/voxleaf_tts/release_chatterbox.py),
  [harness](../../../services/tts/benchmarks/harness.py) and
  [quality tooling](../../../services/tts/benchmarks/quality.py).
- `services/tts/tests/test_release_core.py`, `test_release_chatterbox.py`,
  `test_benchmark_harness.py`, `test_benchmark_quality.py`, and existing bilingual
  harness tests. Inspect callers such as `benchmarks/execution.py` and
  `benchmarks/quality_cli.py` before freezing exports or test seams.
- `services/tts/release/core/`, `services/tts/release/optional/chatterbox/`,
  `services/tts/release/profiles/`, and `benchmarks/tts/` are contextual authority,
  not general edit allowances.

## 6. Architecture and constraints

### Implemented internal layout

The following paths were confirmed by execution audits and implemented through
four disjoint, independently accepted work orders. See the
[developer guide](../../development/tts-service-organization.md) for ownership.

```text
services/tts/
  src/voxleaf_tts/
    release_core.py                 # existing CLI/build lifecycle and imports
    release_chatterbox.py           # existing CLI/build lifecycle and imports
    packaging/
      __init__.py                  # empty; created once by PY-CORE
      core_integrity.py            # Piper validation and manifest integrity
      chatterbox_integrity.py      # optional-package integrity primitives
      chatterbox_authority.py      # versioned source/acquisition/evidence rules
  benchmarks/
    harness.py                     # existing measurement and protocol owner
    harness_corpus.py              # corpus loading/projection
    harness_errors.py              # one failure identity shared by both owners
    quality.py                     # existing session I/O and lifecycle owner
    quality_presentation.py        # evaluator HTML generation
    quality_scoring.py             # score validation and pure aggregation
  tests/                           # existing separate test files remain here
```

Flat, named helpers are sufficient for this first batch. Do not add `core/` and
`chatterbox/` subpackages until the number of real responsibilities warrants the
extra hierarchy. `packaging` is the project-owned `voxleaf_tts.packaging`
namespace; it is not a new dependency on the third-party package of that name.

### Behavior invariants

- Keep `python -m voxleaf_tts.release_core` and
  `python -m voxleaf_tts.release_chatterbox` command parsing, defaults, error codes
  and output. Preserve explicit caller-used imports and exception identity;
  do not replace one exception type with look-alike types in multiple modules.
  Preserve existing qualified exception identity where extraction moves its
  definition. Avoid module cycles or a second module instance during `-m` use.
- Retain `repository_root()` semantics and fixture locations. Moving a helper
  deeper must not silently reuse an old `Path(__file__).parents[...]` index.
  Prefer explicit root/data inputs across the new boundary. Keep external
  imports compatible; adjust a private monkeypatch target only when the actual
  owner changes and the original behavioral assertion remains effective.
- Exclude `voxleaf_tts/packaging` and all descendants from Piper's distributed
  site-packages, alongside the existing builder/metadata exclusions. Prove that
  legitimate runtime siblings still copy. Keep Chatterbox's explicit runtime
  source list and generated-source closure unchanged; do not add helpers there.
- Preserve exact manifest serialization, hashes, path/symlink rejection, archive
  entry order/timestamps/options, split-part ordering and sizes, license closure,
  environment reinstallation and AST restrictions on model loading. Keep v2
  historical checks and v3 security-refresh checks distinct.
- Keep each builder's current staging, promotion, rollback and cleanup behavior
  together. Do not infer that the two builders have identical rollback guarantees
  or silently make them identical while moving code.
- Keep one owner for adapter, clock, memory probe, observations and cancellation
  in `BenchmarkHarness`. Preserve request/chunk validation, language order,
  cancellation cases and privacy failures, including malformed corpus behavior.
- Keep quality-session path containment, state transitions, blinding, opt-in
  audio generation, resource ceilings, failure cleanup and explicit cleanup.
  Preserve scorecard validation, per-case medians, per-dimension and overall
  means, `not-applicable`, evaluator thresholds and correction semantics. HTML
  extraction must preserve generated bytes and relative audio paths.
- EPUB text remains local, inference remains local, and ordinary playback audio
  is not persisted. Explicit disposable quality-review WAV files are an existing
  separate workflow; this refactor must not expand it. Use synthetic inputs in
  tests and never place book text, model weights or generated audio in Git.

### Campaign control

Use the generic packet, identity and role contracts of the two refactor skills.
Their inventory examples and focused matrix are TypeScript-oriented; this plan
explicitly supplies Python inventory and command routing in section 8. Do not
claim TypeScript checks validate Python or edit role configuration as part of
this campaign.

The primary agent directs. Reuse one `clean_code_auditor` and one
`clean_code_worker` using GPT-6.1 Sol high, one `refactor_validator` using GPT-6
Astra high, and a Git steward using GPT-6.1 Sol medium when Git is authorized.
Verify these roles are available before source work. Supporting agents do not
delegate; keep the four-role concurrency limit and exactly one source writer.
An unavailable required audit/worker/validator role is BLOCKED, not permission
to substitute a model or self-validate. Use the documented steward fallback if
that role alone is unavailable.

For every unit: audit -> draft terms -> independent passing baseline -> frozen
Approved Work Order -> one worker -> Change Packet -> independent post-change
report -> director acceptance or bounded correction. Keep writers and Git idle
during validation. Limit correction loops to two, then redesign the work order.

Start each unit with an empty index and no pre-existing changes in its exact
allowlist. The units below have disjoint source paths: later Chatterbox helpers
must not rewrite the empty initializer or accepted core helpers. Accepted changes
may remain unstaged while a disjoint unit proceeds if implementation commits were
not authorized. Stop on overlapping user work or a required overlap with an
accepted unit; do not commit, stash or reset merely to manufacture clean paths.
Finish documentation after source writing and validation are idle.

Reports bind a unique Report ID to starting/ending HEAD, the closed allowlist,
porcelain status, SHA-256 and filter-aware index blob identities, with an unchanged
identity recheck. Record ABSENT for planned new files in baseline. Missing evidence
or drift is BLOCKED and requires a new report, not refreshed approval hashes.
Never carry a rejected patch into another unit. Preserve unrelated user changes.

## 7. Milestones

### Milestone 0: Refresh inventory and establish executable work orders

Status: complete; tracked inventory, clean initial state, roles and four baselines recorded.

Confirm the current branch, HEAD, index and tracked Python inventory. Record every
target as CHANGE, SKIP, BLOCKED or EXCLUDED with evidence. The planning packet for
core is a starting point, not an Approved Work Order or fresh validation receipt.
Reinspect exact exports, test seams, package-copy policies and role availability.
Map required commands to the current `package.json` and check local prerequisites
without creating environments, regenerating authority or downloading models.

Capture hashes of protected runtime source files, generated schemas, release
manifests/receipts/locks, frozen corpus/authority files and existing fixtures in
ignored evidence. Compare them at package/final validation. Missing baseline
prerequisites or failing relevant tests stop that unit before edits.

### Phase A, milestone 1: PY-CORE — extract Piper integrity

Status: complete; accepted by `PY-CORE-POST-CHANGE-02` (409 tests).

Closed proposed allowlist:

- `services/tts/src/voxleaf_tts/release_core.py`
- `services/tts/src/voxleaf_tts/packaging/__init__.py` (new, empty)
- `services/tts/src/voxleaf_tts/packaging/core_integrity.py` (new)
- `services/tts/tests/test_release_core.py`

Move hash/path/schema primitives, the canonical error type and constants required
by them, `_file_record`, `build_runtime_manifest`, `render_manifest`,
`_manifest_records` and `verify_package_tree` to the integrity helper. Re-export
existing required bindings explicitly. Leave `PackageMeasurement`, source loading,
`repository_root`, synchronization, acquisition, notices, staging, ZIP production,
offline smoke, evidence writing and CLI orchestration in the existing owner.

Extend the exclusion policy to the whole maintainer subtree in this same unit.
Add synthetic copy-tree coverage, facade/error identity checks, and a fixed-input
manifest-byte characterization. Keep existing synchronization, unsafe-path,
exact-file-set, atomic rollback and content-free evidence assertions intact.

Ceiling: four files, approximately 550 added/deleted lines, counting relocation.
Reaudit if the extraction needs more. Acceptance: common Python gates and the
Piper cached-artifact check in section 8; explain the check's evidence limit.

### Phase A, milestone 2: PY-CHATTERBOX — separate optional release authority

Status: complete; accepted by `PY-CHATTERBOX-POST-CHANGE-03` (414 tests).

Closed proposed allowlist:

- `services/tts/src/voxleaf_tts/release_chatterbox.py`
- `services/tts/src/voxleaf_tts/packaging/chatterbox_integrity.py` (new)
- `services/tts/src/voxleaf_tts/packaging/chatterbox_authority.py` (new)
- `services/tts/tests/test_release_chatterbox.py`

Follow the audited direction facade -> authority -> integrity, plus facade ->
integrity; neither helper imports the facade. Move `PackageVersion`,
`PackageLayout`, the canonical error type, package/hash/part-limit constants,
root/hash/path/JSON validation, `_artifact`, and
runtime-manifest construction/verification to integrity. For the proposed helper
depth, `repository_root()` changes from `parents[4]` to `parents[5]`; test the
returned repository root rather than assuming the old depth still works.

Move the authority family from `load_source_manifest` through
`reconcile_runtime_evidence`, including successor/provenance constants, into
authority. Keep the v3-source-to-v2-source dependency within that owner. Existing
explicit writer functions remain available but are not run against tracked
authority. Keep measurements, license-copy constants, acquisition/copying,
environment synchronization, staging, archive splitting and CLI in the facade.
Re-export required existing bindings explicitly.

Execution audit narrows this extraction: retain `verify_safe_model_load_sites`
and its `ast` import in the facade with its sole production consumer,
`build_package`. The initial relocation estimate exceeded the 2,050-line budget;
this cohesive narrowing preserves every existing loader assertion and avoids
increasing the closed scope or reducing test coverage.

Preserve v2/v3 defaults and distinctions, generated-module closure, source and
acquisition identities, safe-loader rejection, canonical manifests and split
archives. Rendering authority into temporary fixtures is allowed in tests;
rewriting tracked authority is not. Keep current tests and add only meaningful
coverage for the extracted seam, imports and package-copy exclusion.

Ceiling: four files, approximately 2,050 added/deleted lines, including relocation
and focused tests. This is one production owner with two support files and its
tests, not an exception permitting unrelated provider work. Acceptance: common
Python gates and all four optional-package authority checks in section 8.

### Phase B, milestone 3: PY-CORPUS — separate benchmark input loading

Status: complete; accepted by `PY-CORPUS-POST-CHANGE-02` (446 tests).

Closed proposed allowlist:

- `services/tts/benchmarks/harness.py`
- `services/tts/benchmarks/harness_corpus.py` (new)
- `services/tts/benchmarks/harness_errors.py` (new)
- `services/tts/tests/test_benchmark_harness.py`

Extract `load_corpus`, `load_bilingual_corpus` and `_read_string`; place the shared
`_HarnessFailure`/`_fail` identity in a leaf helper if needed to avoid a cycle.
Keep existing facade imports compatible. Leave `_forbidden_values`, cancellation
case selection, request/chunk validation, observations and protocol runners with
the harness unless the auditor proves a smaller boundary is clearer.

Preserve ordered projections and the exact admission/rejection behavior for both
corpus formats. Add focused synthetic malformed/duplicate/order cases only where
the moved boundary lacks characterization. Existing fake-adapter tests for legacy,
bilingual baseline, screen and full protocols must retain their assertions.
Do not rerun real historical model evaluations or normalize protocol differences.

Ceiling: four files, approximately 450 added/deleted lines. Acceptance: common
Python gates, with all existing harness and bilingual tests included by pytest.

### Phase B, milestone 4: PY-QUALITY — separate presentation and calculation

Status: complete; accepted by `PY-QUALITY-POST-CHANGE-01` (457 tests).

Closed proposed allowlist:

- `services/tts/benchmarks/quality.py`
- `services/tts/benchmarks/quality_presentation.py` (new)
- `services/tts/benchmarks/quality_scoring.py` (new)
- `services/tts/tests/test_benchmark_quality.py`

Move `_render_evaluator_html` into presentation. Extract score validation and the
per-candidate calculation portion of `aggregate_scores` into a pure function over
already-read ordered cases, cards and correction data. The execution audit kept
the outer candidate loop, metadata/card/correction validation and each separate
corpus read in its original order in `quality.py`. Retain file reads/writes,
session safety, generation, finalization, submit/correct orchestration and cleanup
in `quality.py`. Define shared score constants/error identity in the lowest
necessary module, with explicit compatible imports and no reverse dependency.
Do not create a general session repository or change CLI routing.

Prove byte-identical evaluator output for fixed input and equal aggregate results
for multi-evaluator, not-applicable and corrected-defect cases. Preserve rejection
of reordered/partial scorecards, opt-in generation, bounded WAVs and failed-session
cleanup. Keep the `_write_wave` test seam effective while its owner remains here.

Ceiling: four files, approximately 650 added/deleted lines. Acceptance: common
Python gates and existing quality-session tests. A presentation change beyond a
byte-preserving move is outside this work order.

### Milestone 5: Combined acceptance and developer navigation

Status: complete; guide, aggregate review and `FINAL-01` portable/native gates passed.

Run package/final checks from section 8, inspect the aggregate diff, compare
protected identities and verify all original import/CLI routes. Record each
accepted or skipped target and any deferred follow-up. No arbitrary line-count
quota is required; a large remaining lifecycle owner can be a valid result.

After source validation is idle, add a concise module map to
`docs/development/tts-service-organization.md` and link it from `docs/README.md`.
Explain runtime versus maintainer tooling, helper ownership, separate tests,
generated/frozen files, commands and package-exclusion policy. The guide now exists.
Update this plan and its index entries
with actual outcomes. Recheck documentation after the last edit.

Review the canonical system diagram and architecture overview. Update them only
if the actual documented architecture changes; no new process, runtime boundary
or product feature is expected. Do not rewrite completed plans. Once every
in-scope unit has accepted evidence or an evidence-backed SKIP and final gates
pass, archive this plan under `docs/plans/completed/` and update both indexes.
If a required gate remains blocked, keep the plan active and report the limit.

## 8. Testing and benchmark strategy

All test, build and validation commands run from repository root in a normal
local PowerShell session outside the managed automation sandbox. A sandbox-only
result is exploratory and must be repeated unchanged on the host for acceptance.
Capture exact commands, exit codes and concise outcomes in independent receipts.

### Common Python baseline and post-change gates

The following scripts exist in `package.json` at the planning base. Run the same
set before and after each source unit; do not reduce them to import smoke alone.

```powershell
pnpm.cmd format:check:python
pnpm.cmd lint:python
pnpm.cmd typecheck:python
pnpm.cmd test:python
pnpm.cmd build:python
```

They use locked Ruff, mypy, pytest and the configured Python build. Existing
pytest discovery covers `services/tts/tests`; mypy covers source, benchmarks and
tests. The release builders and benchmark helpers require actual Python evidence,
even when the repository's TypeScript checks also pass.

### Packaging-specific gates and evidence limits

For PY-CORE, before and after:

```powershell
pnpm.cmd package:piper-core:check
```

This validates the existing local core directory/archive against tracked
manifest/evidence. It does not rebuild the distribution or prove that a changed
builder produced those bytes. The planning audit observed cached artifacts, but
execution must verify prerequisites afresh; an absent or stale artifact is a
baseline blocker, not permission to rewrite authority. New synthetic copy-tree
and manifest tests separately prove the helper exclusion and moved integrity
behavior. Inspect the built maintainer wheel for required helper inclusion and
importability; the maintainer wheel and the distributed Piper runtime have
different inclusion policies.

For PY-CHATTERBOX, before and after:

```powershell
pnpm.cmd package:chatterbox-optional:check-source
pnpm.cmd package:chatterbox-optional:check-acquisition
pnpm.cmd package:chatterbox-optional:v3:check-source
pnpm.cmd package:chatterbox-optional:v3:check-acquisition
```

These preserve legacy and current authority without publishing or rewriting it.
Use synthetic files to exercise runtime-copy allowlists, canonical manifest and
ZIP bytes, split parts, unsafe paths and safe-loader rejection. A passing source
check is not evidence of a newly built package or model performance.

Full `pnpm.cmd package:piper-core` and
`pnpm.cmd package:chatterbox-optional:v3` runs are not the default acceptance
requirement for these bounded extractions. They synchronize release environments
and assemble large ignored payloads. If audit reveals that deterministic tests
cannot establish payload preservation, stop before editing and explicitly add
the required builder baseline/post gate and its prerequisites to a revised work
order. Compare rebuilt tree/archive identities; do not substitute a cached check
for that evidence. Do not run manifest/source/acquisition/evidence write commands
or release inventory generation to make a refactor pass.

### Package and final gates

After Phase A, run `pnpm.cmd check:portable` once for the coherent packaging group.
After Phase B and final documentation, run:

```powershell
pnpm.cmd check:portable
pnpm.cmd check
git diff --check
```

The complete configured `check` includes applicable native build/tests. Do not
replace it with portable-only evidence. Do not add packaged installation, GPU,
firewall, signing or real-model benchmark runs when their runtime paths are
unchanged. If runtime modules, lifecycle, scheduling, cancellation or playback
must change, stop and re-scope before implementation; the relevant exact-host
gate is then mandatory and hardware absence is a blocker.

Use deterministic clocks, fake adapters, synthetic corpora and temporary quality
sessions to compare behavior. Preserve historical receipts, corpus hashes,
thresholds and candidate locks. This campaign produces no new latency, real-time
factor, listening-quality, or general-hardware claims.

Retain concise immutable Markdown receipts in
`docs/plans/evidence/tts-service-organization/`; keep raw output, identity dumps
and temporary scripts in ignored `tmp/evidence/tts-service-organization/<run>/`.
The existing `check:evidence` and `test:evidence` run within aggregate checks.
Do not invent new tracked raw-evidence exceptions. Keep receipt identities outside
their own validated source allowlists. If Git is authorized later, stage evidence
documentation separately and bind each source order to its exact accepted report.

## 9. Risks and rollback

| Risk | Prevention or response |
| --- | --- |
| Maintainer helpers leak into Piper runtime | Add subtree exclusion in PY-CORE and test nested files plus retained runtime siblings; preserve tracked release identities. |
| Module moves break root resolution, CLI or test seams | Preserve facade routes and error identity; use explicit root inputs; inspect `-m` behavior and monkeypatch ownership. |
| Optional authority changes while code is moved | Compare protected hashes; keep v2/v3 rules and security checks; never regenerate authority as a fix. |
| Circular imports or forwarding complexity replace one large file | Audit dependency direction first; return SKIP or narrow the extraction rather than adding a framework. |
| Historical protocols or scoring subtly change | Retain runners/session I/O, ordered arithmetic and error behavior; characterize extracted boundaries with deterministic inputs. |
| Reused dirty paths invalidate later unit baselines | Keep source units disjoint; stop and replan an overlap without discarding accepted or user-authored work. |
| Existing host or cached-artifact failure is blamed on refactor | Record BASELINE-FAIL/BLOCKED separately before edits; do not weaken checks or silently repair unrelated issues. |

On rejection, correct only the approved unit or remove only verified worker-owned
hunks after inspecting for user edits. Never use broad reset/clean/restore or
delete model/runtime/user-data trees. Keep rejected evidence distinct. If a later
accepted implementation commit needs reversal, follow a separately authorized
scoped Git order; do not rewrite shared history or published artifacts.

## 10. Progress log

- Final independent `FINAL-01` PASS: complete `pnpm.cmd check:portable`,
  `pnpm.cmd check` and `git diff --check` passed outside the sandbox. Python 457,
  shared 209, EPUB 651, desktop 588 plus 38 Node, evidence 13 and Rust 87/88
  tests passed; native Tauri release executable compiled. All 16 approved source
  identities and 393 protected raw hashes remain unchanged. Immutable HEAD/blob
  comparison covered all 1,035 initial tracked paths without unrelated drift.
  The full initial raw-SHA snapshot key was unavailable; FINAL-01 explicitly
  distinguishes the HEAD/blob comparison from the original 393-file raw check.
- Archived this plan after all four units and aggregate gates passed. Guide and
  navigation indexes describe completed implementation. Git index remains empty;
  all changes are unstaged, with no commit, push or PR. Final documentation-only
  closure is recorded separately in the evidence index after this last edit.

- PY-QUALITY accepted with `PY-QUALITY-POST-CHANGE-01`: all five Python host
  gates passed, 457 tests, unchanged HTML/scoring/read-order baseline probes and
  six unchanged original test bodies. The patch used 624 of 650 allowed changed
  lines. No correction loop was required.
- Added the developer module map and concise evidence index. Reviewed the system
  diagram and architecture overview: process, runtime, trust, persistence and
  deployment boundaries are unchanged, so neither architectural document needs
  revision. Only maintainer-internal ownership moved.

- PY-CORPUS accepted with `PY-CORPUS-POST-CHANGE-02`: all five Python host
  gates passed, 446 tests, and all moved/retained definitions compare identically.
  Thirty-two synthetic cases characterize existing admission/error behavior.
  One import-order correction; protocol runners and resource ownership unchanged.

- Phase A accepted with `PHASE-A-PACKAGE-01`: `pnpm.cmd check:portable` exit 0,
  all eight source identities unchanged, 414 Python tests and complete configured
  portable suites/builds passed. Native final acceptance subsequently passed in FINAL-01.

- PY-CHATTERBOX accepted with `PY-CHATTERBOX-POST-CHANGE-03` PASS: 414 tests,
  all nine host commands, 53 definition comparisons and isolated wheel imports.
  AST loading checks remain with their sole build consumer after a narrower
  execution audit kept the patch within the 2,050-line ceiling (actual 1,973).
  Two new-test expression corrections are documented in immutable failed
  reports; no runtime/authority/lock changes or test suppressions were needed.

- PY-CORE accepted with independent `PY-CORE-POST-CHANGE-02` PASS: 409 Python
  tests, all six required commands, unchanged extracted-definition ASTs and
  maintainer-wheel byte/import checks. Source remains unstaged. The first
  baseline launcher failure and first post-change import-lint failure remain
  separately retained under `docs/plans/evidence/tts-service-organization/`.
  Existing Corepack shim selection resolved the tool version; one import-only
  correction resolved lint without configuration changes or weakened tests.

- 2026-10-10 execution: Verified prepared branch `codex/tts-service-organization`
  at `a3fa08accbf7752e7638ff24aca73211ec8aeb92`, with initially clean worktree
  and empty index. Current tracked service inventory: 205 files, including 159
  Python files (15 source, 89 benchmarks, 55 tests). Installed environments,
  caches, distributions and model trees are excluded. Two generated Python
  modules remain excluded from manual changes; tests retain their layout.
- Execution roles available: reusable `clean_code_auditor` and
  `clean_code_worker` (GPT-6.1 Sol high), plus `refactor_validator` (GPT-6 Astra
  high). Git stewardship is idle because Git mutations are not authorized.
  The independent validator captured all 1,035 tracked-file identities on the
  host before source work. Director scratch inventory/protected identities are
  under ignored `tmp/evidence/tts-service-organization/preparation/`.
- At preparation, PY-CORE execution audit began before any source order was
  approved; subsequent acceptance is recorded above.

- 2026-10-10: Refreshed the tracked Python inventory and four main responsibility
  candidates on clean `main` at the planning base. Reviewed existing commands,
  tests, packaging policies and the Python validation route. No tests were run
  during this read-only source review.
- 2026-10-10: Read-only audit `PY-CORE-PLAN-01` recommended a four-file integrity
  extraction and mandatory helper-subtree exclusion. Broader assembly/smoke
  moves were narrowed out of the first batch.
- 2026-10-10: Read-only audit `PY-CHATTERBOX-PLAN-01` recommended two helpers for
  integrity and authority with an acyclic import direction, preserved historical
  rules, and no overlap with the proposed core unit. No tests were run.
- 2026-10-10: Drafted two implementation phases, four disjoint source units,
  preserved runtime/frozen boundaries and documented deferred runner/test moves.
- 2026-10-10: User authorized a branch from `main` and one commit for this plan.
  Source implementation, baseline/post-change tests and campaign acceptance
  had not started at that historical authoring step.
- 2026-10-10: Created `codex/tts-service-organization` from the verified local
  `main` planning base after completing the draft. The documentation-only host
  check passed for the plan and both indexes; no source paths changed.

| Milestone | Status |
| --- | --- |
| Plan authoring and documentation checks | Complete |
| Implementation inventory and independent baselines | Complete |
| PY-CORE | Complete; POST-CHANGE-02 |
| PY-CHATTERBOX | Complete; POST-CHANGE-03 |
| PY-CORPUS | Complete; POST-CHANGE-02 |
| PY-QUALITY | Complete; POST-CHANGE-01 |
| Combined validation, developer map and archival | Complete; FINAL-01 |

## 11. Discoveries and decisions

1. Tests are already separate Python files. Preserve that layout; new directory
   nesting alone would introduce fixture-root and discovery churn.
2. A flat maintainer package with named helpers is the smallest initial structure
   justified by the audit. Keep CLI facades and runtime module names stable.
3. Piper copies an installed local distribution and originally excluded builders
   by filename. Whole-subtree exclusion landed with the first new helper.
   Chatterbox has a different explicit local-source allowlist.
4. Keeping assembly/rollback, harness resource ownership and quality-session I/O
   together avoids splitting state transitions just to meet a line-count limit.
5. The safe-refactor contracts apply to the Python campaign with the explicit
   routing in this plan. No TypeScript-only gate or role-description wording
   substitutes for Python checks or independent acceptance.
6. Cached-artifact checks and deterministic tests have a narrower claim than a
   fresh release build. Record that limit rather than presenting old artifacts
   as output of refactored code.
7. The execution request authorizes source and documentation work, explicitly
   without staging, commits, push or PR. Earlier plan-authoring commit permission
   does not authorize any Git mutation during execution.

## 12. Final validation results

Historical plan-authoring validation: **PASS**, 2026-10-10, local PowerShell outside the
sandbox. The authoring check
`& ./tmp/evidence/tts-service-organization-planning/check-plan.ps1` verified all
12 required sections, 23 existing reference links, 14 configured script names,
balanced code fences, both index links, whitespace and the exact three-file
documentation scope. `git diff --check` passed and the Git index was empty before
the separately authorized staging step. The scratch check is an ignored authoring
aid, not a new repository command or implementation acceptance gate.

This result covers only `docs/plans/active/tts-service-organization.md`,
`docs/plans/active/README.md` and `docs/README.md` at authoring time. It is not
current implementation acceptance. No staging or commit is authorized now.

Implementation units: **PASS**. Independent baseline and post-change receipts,
exact HEAD/path identities, corrections and command results are retained in the
[evidence index](../evidence/tts-service-organization/README.md). All four units
were implemented; none was skipped or remains blocked. The initial 159 tracked
Python files are supplemented by eight new unstaged helpers; pytest now passes
457 tests. Runtime/contract/generated/frozen files and the index remain unchanged.

Phase A `pnpm.cmd check:portable`: **PASS**, `PHASE-A-PACKAGE-01`.
Final `pnpm.cmd check:portable`, `pnpm.cmd check` and `git diff --check`:
**PASS**, [FINAL-01](../evidence/tts-service-organization/FINAL-01.md). The full
gate includes Rust format/Clippy, 87/88 Rust tests and native release compilation;
portable and full suites both include all 457 Python tests. Documentation guide,
plan and indexes were reviewed; last-edit closure follows archival and is retained
in the evidence index. Existing pytest cache and Vite bundle-size warnings are
nonfatal. Source identities are the unchanged union of the four accepted reports.

No in-scope unit remains blocked or skipped. Deferred release-stage, protocol-runner,
provider-unification and test-directory work remains deferred. Package authority/
cached-artifact checks are not new runtime builds; this campaign makes no new
model-performance claim. HEAD and branch remain unchanged; all source/docs changes
are unstaged, the index is empty, and no commit, push or PR was made.
