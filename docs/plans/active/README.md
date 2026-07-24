# Active plans

Store ExecPlans currently being implemented in this directory.

The high-level milestone order is maintained in [`../roadmap.md`](../roadmap.md). Create or refine detailed ExecPlans just in time for the milestone being implemented rather than planning the entire roadmap at implementation depth.

Prefix milestone-specific ExecPlans with their zero-padded roadmap milestone number:

```text
M003-secure-epub-ingestion.md
M004-reflowable-reader.md
```

If a milestone requires multiple ExecPlans, add a second three-digit sequence, such as `M003-001-secure-epub-ingestion.md`. Plans that intentionally span multiple milestones retain descriptive names until they are split. See `.agents/PLANS.md` for the complete naming rules.

Follow `.agents/PLANS.md` and update the progress log while working.

## Current plans

- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md): broader context spanning reader, narration synchronization, and audio startup; the visual-reader portion is recorded in the [completed M004 plan](../completed/M004-reflowable-visual-reader-and-position-restoration.md), while this plan remains active for later-roadmap context.
