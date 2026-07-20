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
