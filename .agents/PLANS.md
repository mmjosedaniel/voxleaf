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

Every ExecPlan must include the sections below. Keep them brief: reference canonical requirements and existing evidence instead of copying them. A section may be a sentence or a precise link; retain the information needed for another developer to continue.

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

For findings-based corrections, use the existing sections to preserve the
[findings workflow](../docs/development/findings/README.md): Current state names
the VF IDs, exact original triggers, source/checkout and prior dispositions;
Scope distinguishes recurrences, variants and deferred policies; Testing names
the invariant, discriminating assertion, bounded adjacent controls and evidence
level. Record the evidence-backed reason a case escaped earlier work, or unknown.
Final results link each ID to its actual owner, test, review and resolution and
update the registry only within authorized writes. Importing old acceptance does
not validate the new checkout. No extra plan section or full-suite rerun is
required merely to populate the registry.

## Suggested milestone format

For each milestone state the bounded work, relevant existing commands, expected/actual results and status (Not started, In progress or Complete). Use concise checkboxes or prose rather than repeating the plan's scope and evidence.

## Validation planning for refactors

Use the [canonical validation policy](skills/validate-safe-refactor/references/validation-policy.md) and [compact batch record](skills/validate-safe-refactor/references/validation-record.md) inside the existing sections. The policy owns unit/batch risk, gate inputs/timing/invalidation, coverage decisions, preparation, retries, restoration and evidence reuse; record the task-specific choices and immutable report links, not another copy of its rules.

Shared baselines must precede all relevant edits; a retrospective plan cannot create missing evidence. Preserve failed attempts, classifications and retry budgets. Final results distinguish executed commands from independently justified reuse, identify pending gates and confirm required cleanup.

For feature/bug or substantive documentation work, follow [compact closeout](../docs/development/agentic-change-review.md#compact-closeout): prepare final documentation and indexes before the applicable review and link its reserved verdict authority. Do not require another review merely to restate a verdict. Existing staged approvals and all identity-drift rules remain binding. Refactor campaigns retain their own validator and Git orders.
