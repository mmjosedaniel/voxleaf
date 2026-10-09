---
name: implement-feature
description: Implement a complete VoxLeaf feature across the affected desktop, EPUB, shared-contract, TTS, test, and documentation areas. Use for user-visible features or coordinated behavior changes. Do not use for isolated typo fixes or documentation-only edits.
---

# Implement a VoxLeaf feature

## Required context

1. Read `AGENTS.md`.
2. Read `docs/product/mvp.md`.
3. Read the relevant architecture documents and ADRs.
4. Inspect an existing similar implementation and its tests.
5. Create an ExecPlan when the change meets `.agents/PLANS.md` criteria.
6. Read [independent change review](../../../docs/development/agentic-change-review.md)
   for review inputs, verdicts, and exact-patch acceptance.

## Procedure

1. State the user-visible behavior and acceptance criteria.
2. Identify affected boundaries and privacy implications.
3. Define or update typed contracts before process-specific implementations.
4. Implement the smallest vertical path.
5. Add cancellation and stale-session handling where long-running work is involved.
6. Add relevant unit, integration, end-to-end, and performance coverage.
7. Update product, architecture, setup, or testing documentation.
8. Run the relevant repository checks.
9. Review the final diff for unrelated changes.
10. Delegate the behavioral change to `change_reviewer` with acceptance criteria,
    the complete diff, code identities, and exact host-check evidence. Pause
    writing during review. Resolve findings, rerun affected checks, and obtain
    APPROVE for the current patch before completion; report missing evidence or
    an unavailable reviewer as BLOCKED, not as a completed review.

## Constraints

- Do not persist generated audio by default.
- Do not log book text.
- Do not create unbounded queues.
- Do not allow inactive sessions to enqueue playable audio.
- Do not duplicate protocol contracts.
- Do not add model-specific behavior to general application interfaces without justification.
- Do not add dependencies without documenting their purpose.

## Completion report

Report:

- Behavior implemented.
- Files changed.
- Tests or benchmarks added.
- Commands executed and results.
- Privacy and performance implications.
- Independent Change Review ID/verdict and resolved findings, or exemption reason.
- Remaining risks and assumptions.
