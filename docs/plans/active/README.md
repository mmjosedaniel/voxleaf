# Active plans

Store current approved ExecPlans in this directory. A plan may be ready for implementation without production work having started; use its task statuses and the roadmap for implementation state.

The high-level milestone order is maintained in [`../roadmap.md`](../roadmap.md). Create or refine detailed ExecPlans just in time for the milestone being implemented rather than planning the entire roadmap at implementation depth.

Prefix milestone-specific ExecPlans with their zero-padded roadmap milestone number:

```text
M003-secure-epub-ingestion.md
M004-reflowable-reader.md
```

If a milestone requires multiple ExecPlans, add a second three-digit sequence, such as `M003-001-secure-epub-ingestion.md`. Plans that intentionally span multiple milestones retain descriptive names until they are split. See `.agents/PLANS.md` for the complete naming rules.

Follow `.agents/PLANS.md` and update the progress log while working.

## Current plans

- [`M005-narration-text-preparation.md`](M005-narration-text-preparation.md): approved implementation authority for roadmap Milestone 5's deterministic, bounded, locator-linked narration normalization and semantic segmentation pipeline; all implementation tasks remain not started.
- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md): broader context spanning reader, narration synchronization, and audio startup; the visual-reader portion is recorded in the [completed M004 plan](../completed/M004-reflowable-visual-reader-and-position-restoration.md), and the plan is not Milestone 5 implementation authority.
