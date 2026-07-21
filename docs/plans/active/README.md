# Active plans

Store ExecPlans currently being implemented in this directory.

The high-level milestone order is maintained in [`../roadmap.md`](../roadmap.md). Create or refine detailed ExecPlans just in time for the milestone being implemented rather than planning the entire roadmap at implementation depth.

Prefix milestone-specific ExecPlans with their zero-padded roadmap milestone number:

```text
M002-shared-contracts-and-test-harness.md
M003-secure-epub-ingestion.md
```

If a milestone requires multiple ExecPlans, add a second three-digit sequence, such as `M003-001-secure-epub-ingestion.md`. Plans that intentionally span multiple milestones retain descriptive names until they are split. See `.agents/PLANS.md` for the complete naming rules.

Follow `.agents/PLANS.md` and update the progress log while working.

## Current plans

- [`M002-shared-contracts-and-test-harness.md`](M002-shared-contracts-and-test-harness.md): define shared contracts and a deterministic cross-language test harness for roadmap Milestone 2.
- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md): implement the reflowable reader, shared position restoration, narration synchronization, and duration-based startup gate.
