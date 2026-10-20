# Python scorecard validation readability and service documentation

Status: implementation not started. The planning branch is
`codex/python-quality-validation-readability`, created from local `main` at
`c182d155596ba36e360508e4ca5587e041dcf3db` on 2026-10-19.

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

The read-only review used the source HEAD above. In
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
The structural service audit was SKIP; only the requested prose correction is
included here. Refresh line locations against the execution checkout.

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

Status: not started. Recheck the branch/HEAD, empty index and clean unit paths.
Reuse one auditor, worker and independent validator across this batch, following
their configured roles; allow only one source writer at a time. Refresh the
accepted audit and classify the actual diff before issuing work orders.

For PQR-DOC, obtain an independent documentation baseline and then a frozen
work order. Update only the four docstrings: describe a local protocol service,
an injected engine with a fake default, settling the active operation, and the
bounded service loop. Keep shutdown/EOF/rejection and stale-completion meaning.
Obtain independent post-change approval; add no tests for prose alone.

### 2. Extract sample validation and characterize concrete gaps

Status: not started. Establish PQR-SAMPLES' Python baseline before editing its
two files; PQR-DOC's accepted change is explicit starting-state context.
The draft order becomes immutable only after the baseline passes.

Move the existing count check and loop into the private helper and call it at
the original location, after both sample-list bindings. Keep all I/O in
`submit_scorecard`. Add the bounded public-boundary cases below in the existing
test file, using synthetic temporary sessions like the current reordering test.
Do not generate audio or set up models to exercise submission validation.
Run assigned fast checks before handoff and obtain independent post-change
acceptance. Stop if implementation needs another production file or behavior.

### 3. Validate the combined result and close the plan

Status: not started. Review the combined three-file source/test diff and satisfy
the gate ledger. With the docstring unit completed first and no later source
edits, PQR-SAMPLES' post-change Python checks may supply final combined evidence
when the validator records their complete coverage and identities.

Record actual outcomes, durations, limitations and immutable report references.
Archive this plan only after acceptance, update incoming links and indexes, and
validate the frozen closing documentation. Keep source writing and validation
idle during any separately authorized Git action. The present request authorizes
the planning branch and a commit of the plan/links, not implementation commits,
push, PR creation or publication.

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
| P1 | Python formatting: `pnpm.cmd format:check:python` | PQR-SAMPLES baseline/post; combined final coverage | Full discovered Python tree, Ruff/config/lock/tool versions; changed consumed bytes, membership or environment invalidate | Pending execution |
| P2 | Static correctness: `pnpm.cmd lint:python` | Same as P1 | Same complete discovery and tool/config proof as P1 | Pending execution |
| P3 | Types: `pnpm.cmd typecheck:python` | Same as P1 | Source, tests, imports, stubs, mypy/config/lock/tool versions | Pending execution |
| P4 | Public behavior: `pnpm.cmd test:python` | Same as P1; full model-free suite covers the combined Python package | Tests, fixtures, imports, scripts, discovery membership and host/toolchain; changes invalidate | Pending execution |
| D1 | Exact scope and whitespace: `git diff --check`; independent link/docstring/command review | Baseline/post of each applicable unit and final frozen documentation | HEAD, complete approved diff and consumed documentation; path/content/HEAD drift requires a fresh report | Pending execution |
| D2 | Retention guard: `pnpm.cmd check:evidence` | Documentation baseline/post and after authorized staging | Git index, guard and configuration; index changes require recheck | Planning baseline passed; execution pending |

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

## Discoveries and decisions

- Keep sample admission in `quality.py`; `quality_scoring.py` already has a
  separate arithmetic responsibility and needs no additional public binding.
- Correct the four service docstrings while preserving its imported class name.
- Complete the prose unit first so the later Python post-change run can cover
  the combined patch without repeating unchanged checks merely for closeout.
- Preserve current permissive details and error order rather than adding schema
  hardening. No new abstraction beyond the single helper is justified.

## Final validation results

Implementation baseline, worker edits, post-change acceptance and final combined
validation: **not started**. No current Python/runtime PASS is claimed.

Planning validation is separate: its baseline report above is retained under
`tmp/evidence/python-quality-validation-planning/`. The immutable planning
POST-CHANGE report is issued after these three documentation files are frozen
and must be consumed before the authorized planning commit. It does not accept
the future implementation. Replace this implementation status with actual
results only when executing and closing the plan.
