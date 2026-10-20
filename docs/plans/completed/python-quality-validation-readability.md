# Python scorecard validation readability and service documentation

Status: implementation and combined source acceptance complete; archived on
2026-10-19 (America/Bogota). Closing documentation is frozen for separate
independent final validation; its outcome is recorded separately after this
freeze, not claimed here.

The branch is `codex/python-quality-validation-readability`, created during
planning from local `main` at `c182d155596ba36e360508e4ca5587e041dcf3db` on
2026-10-19. Implementation acceptance uses HEAD
`330a2f2eee99149d1ec442e4e05081d4f0f4da0d`. Implementation and closeout changes
remain unstaged and uncommitted; no Git mutations were authorized or performed
in these execution phases. Report IDs use 20261020 UTC, corresponding to
2026-10-19 in America/Bogota for the recorded work.

## Goal

Give scorecard sample validation one clear private function in `quality.py`
and correct the service descriptions that imply every engine is a fake.
Keep the change small: one helper, existing test files, and four docstrings.
This plan is execution guidance, not a frozen Approved Work Order.

## User-visible outcome

No product behavior changes. Quality submissions accept and reject the same
inputs, save the same fields and produce the same errors and receipts.
Contributors can distinguish submission I/O from sample validation and understand
that the protocol service accepts an injected engine with a fake default.

## Current state

The following original source review is historical, using planning source HEAD
`c182d155596ba36e360508e4ca5587e041dcf3db`. In that reviewed version of
`services/tts/benchmarks/quality.py`, `submit_scorecard` reads session metadata,
admits the evaluator, reads the template, validates and projects the submitted
samples, checks for an existing completed file, writes JSON and counts completed
evaluators. The count check and loop at the reviewed lines 470-497 form a
deterministic transformation embedded between filesystem operations.

`quality_scoring.py` already owns `DIMENSIONS`, `QualitySessionError`, `_score`
and aggregate arithmetic. Their existing bindings in `quality.py` must remain.
Earlier organization and service-function refactors are complete; this work
does not repeat them.

`services/tts/src/voxleaf_tts/service.py` accepts `TtsEngine` and uses
`FakeTtsEngine` as its default. Piper, Chatterbox and Qwen entrypoints inject
their engines through `run_service`. The module, `ModelFreeTtsService`,
`settle_active` and `run_service` docstrings still imply a fake-only service.
The structural service audit was SKIP; only the requested prose correction was
included. The accepted implementation now separates validation into the private
helper and corrects these four descriptions; the results below supersede the
original implementation status without changing this review's rationale.

## Scope and non-goals

Batch ID: `PY-QUALITY-READABILITY`. It contains two disjoint units, with low
risk limited to deterministic maintainer validation and service documentation.

| Unit | Closed implementation paths | Change and ceiling |
| --- | --- | --- |
| PQR-DOC | `services/tts/src/voxleaf_tts/service.py` | Four docstrings only; at most 20 added/deleted lines |
| PQR-SAMPLES | `services/tts/benchmarks/quality.py`; `services/tts/tests/test_benchmark_quality.py` | One private helper and bounded public-boundary tests; about 200 added/deleted lines across two files |

No new modules, directories, classes, dependencies, generic validator,
configuration changes or test-discovery migration. Do not rename
`ModelFreeTtsService`, change signatures/imports, or alter executable service
logic. Do not change evaluator/session admission, scoring, correction rules,
aggregation, JSON serialization, I/O ordering, generation, audio handling,
cleanup, protocol, cancellation, runtime selection or packaging.

Generated sources, locks, frozen evaluation/release authority, historical
results and completed plans are excluded. Planning changes are limited to this
plan, `docs/plans/active/README.md` and `docs/README.md`. Execution closeout may
archive this plan and update those indexes plus `docs/plans/completed/README.md`;
freeze and validate that documentation separately from source acceptance.

## Relevant files and documentation

- [Quality session owner](../../../services/tts/benchmarks/quality.py),
  [existing quality tests](../../../services/tts/tests/test_benchmark_quality.py),
  [scoring primitives](../../../services/tts/benchmarks/quality_scoring.py) and
  [CLI caller](../../../services/tts/benchmarks/quality_cli.py).
- [Protocol service](../../../services/tts/src/voxleaf_tts/service.py),
  [engine contract](../../../services/tts/src/voxleaf_tts/engine.py) and
  [service tests](../../../services/tts/tests/test_service.py).
- [Documentation index](../../README.md), [MVP](../../product/mvp.md),
  [system diagram](../../architecture/system-diagram.md),
  [architecture overview](../../architecture/overview.md) and
  [ADR-0016](../../architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md).
- [Service organization](../../development/tts-service-organization.md),
  [testing](../../development/testing.md),
  [previous function refactors](../completed/services-function-readability.md),
  [package scripts](../../../package.json) and
  [Python configuration](../../../services/tts/pyproject.toml).
- [Plan format](../../../.agents/PLANS.md),
  [orchestration skill](../../../.agents/skills/orchestrate-safe-refactor/SKILL.md),
  [validation skill](../../../.agents/skills/validate-safe-refactor/SKILL.md),
  [validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md),
  [agent contracts](../../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md)
  and [evidence retention](../../development/evidence-retention.md).

## Architecture and constraints

The helper stays in `quality.py`, adjacent to `submit_scorecard`:

```python
def _sanitize_scorecard_samples(
    samples: list[object], template_samples: list[object]
) -> list[dict[str, object]]:
    ...
```

It performs the existing count check and validation/projection loop, then
returns the sanitized list. It reads no files and mutates neither input.
Use descriptive local names such as `submitted_sample`, `expected_sample` and
`sanitized_samples` where they clarify the moved code. Keep the existing
conditions and iteration explicit rather than creating predicate helpers.

Preserve these invariants:

1. Equal counts and positional matching of sample/case identities; no sorting,
   deduplication, coercion or stricter schema admission.
2. The exact dimension keys and order, existing `_score` admission of integers
   1-5 or `not-applicable`, rejection of Boolean scores, and Boolean defect flag.
3. Projection to `sampleId`, `caseId`, `scores` and `meaningChangingDefect`;
   existing ignored extra card/sample fields remain ignored.
4. Error class, code, raw malformed-template exceptions and first-failure
   precedence. Session/template reads stay before sample validation; validation
   stays before the existing completed-file check.
5. Existing paths, serialized bytes, write timing, completion count and receipt.
   No generated audio, private text or real evaluation records enter new tests.
6. The service retains its class name, fake default, injected-engine semantics,
   frame ordering, bounds, identity invalidation, cancellation and cleanup.

The system diagram already describes the local service boundary. Review it at
closeout; no component, process, import or persistence ownership changes are
planned, so no diagram or ADR edit is expected. The opt-in maintainer quality
session remains separate from ordinary memory-only playback.

## Milestones

### 1. Confirm scope and correct service descriptions

Status: complete. Independent DOC baseline and post-change reports passed;
four single-line docstring replacements total eight added/deleted lines. The
following execution requirements were satisfied. Recheck the branch/HEAD,
empty index and clean unit paths.
Reuse one auditor, worker and independent validator across this batch, following
their configured roles; allow only one source writer at a time. Refresh the
accepted audit and classify the actual diff before issuing work orders.

For PQR-DOC, obtain an independent documentation baseline and then a frozen
work order. Update only the four docstrings: describe a local protocol service,
an injected engine with a fake default, settling the active operation, and the
bounded service loop. Keep shutdown/EOF/rejection and stale-completion meaning.
Obtain independent post-change approval; add no tests for prose alone.

### 2. Extract sample validation and characterize concrete gaps

Status: complete. Independent SAMPLES baseline and post-change reports passed;
one private helper and 15 additive public-boundary cases total 154 changed
lines. The model-free suite grew from 571 to 586 passing cases. The following
execution requirements were satisfied. Establish PQR-SAMPLES' Python baseline
before editing its two files; PQR-DOC's accepted change is explicit starting-state context.
The draft order becomes immutable only after the baseline passes.

Move the existing count check and loop into the private helper and call it at
the original location, after both sample-list bindings. Keep all I/O in
`submit_scorecard`. Add the bounded public-boundary cases below in the existing
test file, using synthetic temporary sessions like the current reordering test.
Do not generate audio or set up models to exercise submission validation.
Run assigned fast checks before handoff and obtain independent post-change
acceptance. Stop if implementation needs another production file or behavior.

### 3. Validate the combined result and close the plan

Status: combined source batch accepted; plan archived and closing documentation
frozen for separate final validation. PACKAGE resolved source P1-P4/D1/D2;
closing-document D1/D2 and independent final review follow this freeze.
The following requirements govern that distinct closeout. Review the combined
three-file source/test diff and satisfy the gate ledger. With the docstring
unit completed first and no later source
edits, PQR-SAMPLES' post-change Python checks may supply final combined evidence
when the validator records their complete coverage and identities.

Record actual outcomes, durations, limitations and immutable report references.
Archive this plan only after acceptance, update incoming links and indexes, and
validate the frozen closing documentation. Keep source writing and validation
idle during any separately authorized Git action. The original planning request
authorized the planning branch and a commit of the plan/links. That historical
authorization does not authorize implementation or closeout Git mutations;
the execution orders prohibit staging, commit, push and PR creation.

## Testing and benchmark strategy

Preserve every existing assertion. Test policy at `submit_scorecard`, not the
private helper; a new extraction does not require a new test module.

| Invariant | Existing evidence to retain | Bounded test decision |
| --- | --- | --- |
| Valid submission, receipt and downstream scoring | `test_single_evaluator_session_is_blinded_bounded_and_not_promotable` | Add one synthetic valid case covering extra-field removal, input nonmutation and accepted score boundaries/`not-applicable` |
| Counts and ordered matching | `test_scorecard_rejects_partial_or_reordered_samples`; `test_scorecard_rejects_actual_reordering` | Retain both; the former currently covers a missing sample, the latter actual reordering |
| Sample types, identities, dimensions and defect flag | Existing valid/reordered cases; scalar rejection in `test_quality_leaf_bindings_and_entire_evaluator_html` | Add a small parametrized public submission test for currently uncovered malformed fields; assert no completed output |
| Failure precedence | Existing invalid submission cases | Add invalid submission with a completed file already present; retain `invalid-scorecard` rather than changing it to `scorecard-state`, and preserve existing bytes |
| Exception/scoring identity and correction compatibility | Binding assertions and `test_v6_quality_preserves_and_applies_one_classification_correction` | Retain existing tests; no change to collaborators or new arithmetic tests |
| Service behavior | Existing `test_service.py` suite | Review the diff as docstrings only; add no duplicated lifecycle tests |

All commands below run from repository root in normal local PowerShell outside
the managed sandbox. Use pinned pnpm 11.15.1 and the locked Python environment.

| Gate | Invariant / existing command | Timing | Inputs and invalidation | Evidence |
| --- | --- | --- | --- | --- |
| P1 | Python formatting: `pnpm.cmd format:check:python` | PQR-SAMPLES baseline/post; combined final coverage | Full discovered Python tree, Ruff/config/lock/tool versions; changed consumed bytes, membership or environment invalidate | Independent baseline/post PASS; PACKAGE reused post evidence below |
| P2 | Static correctness: `pnpm.cmd lint:python` | Same as P1 | Same complete discovery and tool/config proof as P1 | Independent baseline/post PASS; PACKAGE reused post evidence below |
| P3 | Types: `pnpm.cmd typecheck:python` | Same as P1 | Source, tests, imports, stubs, mypy/config/lock/tool versions | Independent baseline/post PASS; PACKAGE reused post evidence below |
| P4 | Public behavior: `pnpm.cmd test:python` | Same as P1; full model-free suite covers the combined Python package | Tests, fixtures, imports, scripts, discovery membership and host/toolchain; changes invalidate | Independent baseline 571/post 586 PASS; PACKAGE reused post evidence below |
| D1 | Exact scope and whitespace: `git diff --check`; independent link/docstring/command review | Baseline/post of each applicable unit and final frozen documentation | HEAD, complete approved diff and consumed documentation; path/content/HEAD drift requires a fresh report | Unit/source PACKAGE and closeout baseline PASS; frozen-doc final review separate |
| D2 | Retention guard: `pnpm.cmd check:evidence` | Documentation baseline/post and after authorized staging | Git index, guard and configuration; index changes require recheck | DOC/source PACKAGE and closeout baseline PASS; frozen-doc final review separate |

This is a deterministic maintainer/documentation batch, not a product-runtime
or distribution campaign. Its final gates are P1-P4 plus D1-D2 and independent
combined review. `check:portable`, `check`, payload builds, GPU/model benchmarks,
installed journeys and firewall changes are not selected solely for these
edits. The validator must approve this classification. Any executable service,
I/O, runtime, package/import, cleanup or contract change stops work for replanning
and the applicable broader/risk-triggered gates; CI requirements remain intact.

There is no expensive shared baseline, model preparation or generated output.
Every unit still needs its own pre-edit baseline. The validator alone may reuse
a gate with immutable execution-time input/environment proof; otherwise rerun
the affected command. A unit PASS does not discharge pending final gates.
Keep reports outside evaluated paths in
`tmp/evidence/python-quality-validation-readability/`; retain concise accepted
summaries according to the evidence policy. Record exact commands, before/after
identities and elapsed phases, and never turn historical evidence into a fresh
PASS. Do not add temporary runners or weaken checks to make this task pass.

## Risks and rollback

The main risks are accidentally tightening validation, changing exception order,
retaining extra fields, mutating input dictionaries or broadening the service
edit. The closed allowlists, characterization cases and independent diff review
protect those boundaries. Preserve malformed-template behavior even when it
looks inconsistent; hardening is separate work.

Use at most two source-correction loops. An infrastructure retry requires a
specific hypothesis and changed condition; allow one per failed stage, preserve
the original failure and stop for diagnosis on repetition. Observe existing
running checks rather than launching duplicates. No application installation,
model download, host reconfiguration or special recovery journal is expected.
For rollback, remove only verified task-authored hunks; preserve unrelated user
work and do not reset, clean or rewrite history.

## Progress log

- 2026-10-19: Approved scope from the read-only audit: one sample-validation
  extraction and service documentation only. Implementation has not started.
- 2026-10-19: Created the planning branch from the clean local `main` SHA above.
- Planning documentation baseline: `PY-QUALITY-PLAN-BASELINE-20261020-01` passed
  `pnpm.cmd check:evidence`, `git diff --check` and current-link/readiness review
  outside the sandbox. The report's date uses UTC; this is not a Python baseline.
- 2026-10-19 (America/Bogota): Accepted independent PQR-DOC baseline/post;
  four docstrings changed, executable service code unchanged.
- 2026-10-19 (America/Bogota): Accepted independent PQR-SAMPLES baseline/post;
  one helper and 15 additive tests, 154 changed lines. All prior assertions
  retained; formatting, lint, types and 586 model-free tests passed.
- 2026-10-19 (America/Bogota): Accepted combined source PACKAGE, 162 changed
  lines across three files. Validator reused only its independent post P1-P4
  after complete input/environment comparison; fresh package D1/D2 passed.
- 2026-10-19 (America/Bogota): Closing-document baseline passed D1/D2 and 248
  local-link checks. Archived this plan and updated navigation after source
  acceptance. Closing documentation is frozen for separate final review.

- 2026-10-19: `PQR-CLOSEOUT-POST-CHANGE-20261020-01` failed only the exact
  cache-warning code summary. Corrected baseline/post codes separately;
  final documentary acceptance remains separate after this refreeze.

## Discoveries and decisions

- Keep sample admission in `quality.py`; `quality_scoring.py` already has a
  separate arithmetic responsibility and needs no additional public binding.
- Correct the four service docstrings while preserving its imported class name.
- Complete the prose unit first so the later Python post-change run can cover
  the combined patch without repeating unchanged checks merely for closeout.
- Preserve current permissive details and error order rather than adding schema
  hardening. No new abstraction beyond the single helper is justified.

## Final validation results

The source batch is independently accepted at HEAD
`330a2f2eee99149d1ec442e4e05081d4f0f4da0d`. PQR-DOC changed eight lines;
PQR-SAMPLES changed 154 (production 35 additions/28 deletions, tests 91
additions/no deletions); combined scope is 162 lines across three files.
There are four docstring corrections, one private helper and 15 additive
public submission cases. Source behavior and all existing assertions are
preserved. No source correction or infrastructure retry was required.

Immutable independent reports are retained in the declared ignored evidence
directory; these links identify existing local reports, not public artifacts:

| Report | Verdict and executed evidence |
| --- | --- |
| [PQR-DOC-BASELINE-20261020-01](../../../tmp/evidence/python-quality-validation-readability/PQR-DOC-BASELINE-20261020-01.md) | PASS; D1 0.0406745 s, D2 0.4543046 s; clean file and empty index |
| [PQR-DOC-POST-CHANGE-20261020-01](../../../tmp/evidence/python-quality-validation-readability/PQR-DOC-POST-CHANGE-20261020-01.md) | PASS; D1 0.0317014 s, D2 0.4284681 s; exact four-docstring review |
| [PQR-SAMPLES-BASELINE-20261020-01](../../../tmp/evidence/python-quality-validation-readability/PQR-SAMPLES-BASELINE-20261020-01.md) | PASS; P1-P4/D1 executed; 571 tests; identity/tool preparation 14.1285737 s |
| [PQR-SAMPLES-POST-CHANGE-20261020-01](../../../tmp/evidence/python-quality-validation-readability/PQR-SAMPLES-POST-CHANGE-20261020-01.md) | PASS; P1-P4/D1 independently executed; 586 tests; preparation 1.7420643 s |
| [PY-QUALITY-READABILITY-PACKAGE-20261020-01](../../../tmp/evidence/python-quality-validation-readability/PY-QUALITY-READABILITY-PACKAGE-20261020-01.md) | PASS; fresh D1 0.0341606 s/D2 0.4464328 s; P1-P4 explicitly reused from independent SAMPLES post |
| [PQR-CLOSEOUT-BASELINE-20261020-01](../../../tmp/evidence/python-quality-validation-readability/PQR-CLOSEOUT-BASELINE-20261020-01.md) | PASS before documentation edits; D1 0.0334559 s/D2 0.428655 s; 248 local links valid in 0.0831982 s |

All commands ran from repository root in normal local PowerShell outside the
managed sandbox. The host used PowerShell 7.6.5, Corepack pnpm 11.15.1, Node
v24.20.0, uv 0.11.29, locked Python 3.12.10, Ruff 0.16.10, mypy 2.3.0 and
pytest 9.1.1. D1 is `git diff --check`; D2 is `pnpm.cmd check:evidence`.
The Python command durations below are elapsed command seconds, distinct from
pytest's own reported durations:

| Gate / exact command | Independent SAMPLES baseline | Independent SAMPLES post |
| --- | --- | --- |
| P1 / `pnpm.cmd format:check:python` | 0.3935732 s; 174 files already formatted | 0.3870767 s; 174 files already formatted |
| P2 / `pnpm.cmd lint:python` | 0.3972132 s; all checks passed | 0.3945646 s; all checks passed |
| P3 / `pnpm.cmd typecheck:python` | 0.6935306 s; 171 files, no issues | 0.6532466 s; 171 files, no issues |
| P4 / `pnpm.cmd test:python` | 24.8729049 s; 571 passed | 24.2473316 s; 586 passed |
| D1 / `git diff --check` | 0.0319188 s; no diagnostics | 0.0332506 s; no diagnostics |

Both Python test runs reported one pre-existing `PytestCacheWarning` for denied
cache access at `services/tts/.pytest_cache/v/cache/nodeids`: baseline
`WinError 5`, post `Errno 13`. All tests passed;
no cache or permission repair was performed. The post suite's own duration
was 23.51 s; the baseline suite's was 24.13 s. These observations do not establish
a performance improvement.

PACKAGE reused the independent SAMPLES post P1-P4, with its original adjacent
`.P1.json` through `.P4.json` receipts and `.before.json`/`.after.json` inputs.
The validator proved identical HEAD, branch, status, full index/diff, 1303
tracked/nonignored discovered input names and content hashes, tool executable
hashes/versions, relevant environment and 2276 non-cache venv file identities.
Those package-wide gates already covered all three current Python files.
Only ignored evidence receipts changed between those reports; no consumed
source or dependency changed. PACKAGE did not reexecute P1-P4. Worker receipts
were not reused for independent unit or package acceptance.

Accepted source identities (porcelain status ` M` for each path; empty index):

| Path | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- |
| `services/tts/src/voxleaf_tts/service.py` | `F8A10D5420F21D8F12F3ACD7EB1D925D18452AFDFA182A344D35E2BF9F5F8F70` | `1cdc2734ee05f33d309f4f642fc91a6b6c3e20ad` |
| `services/tts/benchmarks/quality.py` | `949FC7089646B645048E927B4958DB2F474F96725659161C66457B38EAD46D0E` | `a8ba243a60bc714cb123c6c730bec36c063af581` |
| `services/tts/tests/test_benchmark_quality.py` | `4267D01B87D96A86DC6DEC0D077125885E5C35598B3099FB10873EE4B513FA19` | `d9deb7777dcb6c62c9e1fa02d0d70b50c7870bf5` |

The canonical system diagram and service owner map still match the unchanged
component/process/import/persistence boundaries; no diagram or ADR edit is
needed. No runtime/native/GPU/model/build, installed-journey, firewall or
aggregate `check`/`check:portable` result is claimed for this bounded batch.
There was no expensive preparation or host reconfiguration; only ordinary
ignored caches and synthetic temporary test outputs, with no owned resource
requiring restoration. Raw captures and full identity receipts remain ignored.

Source P1-P4/D1/D2 are resolved by the reports above. Closing-document acceptance
is separate: final D1/D2, local-link/claim review and current source-identity
review follow this content freeze. The final documentary/campaign outcome is
recorded separately afterward under
`tmp/evidence/python-quality-validation-readability/`; this plan does not claim
that future report's verdict and must not be edited after it is issued.

Historical planning evidence remains under
`tmp/evidence/python-quality-validation-planning/`; its baseline report ID in
the progress log concerns planning only and is not implementation acceptance.
