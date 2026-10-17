# Execution plans

Create an ExecPlan for work that:

- Affects multiple components or processes.
- Introduces or changes a TTS model.
- Changes the local protocol.
- Changes EPUB parsing or security boundaries.
- Requires a significant refactor.
- Is expected to span multiple implementation stages.
- Changes public behavior in a way that needs coordinated testing.

Small isolated documentation changes and obvious one-file fixes do not require a plan.

## Required sections

Every ExecPlan must include:

1. **Goal**
2. **User-visible outcome**
3. **Current state**
4. **Scope and non-goals**
5. **Relevant files and documentation**
6. **Architecture and constraints**
7. **Milestones**
8. **Testing and benchmark strategy**
9. **Risks and rollback**
10. **Progress log**
11. **Discoveries and decisions**
12. **Final validation results**

## Rules

- Write the plan so another developer can continue without chat history.
- Name a plan that maps to one roadmap milestone `MNNN-descriptive-name.md`, where `NNN` is the zero-padded roadmap milestone number (for example, `M002-shared-contracts-and-test-harness.md`).
- If one roadmap milestone needs multiple ExecPlans, use `MNNN-NNN-descriptive-name.md` for those plans (for example, `M003-001-secure-epub-ingestion.md`). Do not add the second number when a milestone has only one ExecPlan.
- Keep a descriptive filename for a plan that intentionally spans multiple roadmap milestones until it is split into milestone-specific plans; do not assign it a misleading milestone number.
- Use repository paths and concrete commands.
- Do not invent commands that are absent from configuration.
- Keep the progress log current.
- Record requirement changes and unexpected constraints.
- Separate deterministic tests from hardware-specific benchmarks.
- Include privacy, cancellation, bounded-memory, and malformed-EPUB considerations when relevant.
- Move a completed plan from `docs/plans/active/` to `docs/plans/completed/`.

## Suggested milestone format

```markdown
## Milestone 1: Establish the failing or missing behavior

### Work

- ...

### Validation

- Command:
- Expected result:
- Actual result:

### Status

Not started | In progress | Complete
```

## Validation planning for refactors

Use the [canonical validation policy](skills/validate-safe-refactor/references/validation-policy.md)
and [compact batch record](skills/validate-safe-refactor/references/validation-record.md).
Keep the existing required sections; include the following within them:

- Scope: implementation units, integration batch, risk and acceptance boundaries.
- Testing strategy: a gate table with invariant, existing command/cwd, timing,
  dependency/environment identities, invalidation and evidence reference.
- Milestones: cheap host readiness and fast checks before costly preparation,
  separate execution/cleanup, and explicit pending combined acceptance.
- Risks: bounded retries with a hypothesis, stage diagnostics and recovery
  verification for any host mutation. Missing evidence remains blocked.
- Progress: concise decisions, phase durations and immutable report links, not
  repeated logs or huge inventories. Preserve failures and their classification.
- Final validation: commands actually run, independently justified reuse,
  current report identities, completed cleanup and remaining limitations.

A shared baseline must predate all relevant batch edits. A retrospective plan
cannot create missing baseline evidence. Freeze final documentation before its
report; keep identity manifests outside their own validated paths. Replanning
does not erase earlier failed attempts or reset retry budgets.
