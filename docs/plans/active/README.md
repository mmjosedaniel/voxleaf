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

- [`M004-reflowable-visual-reader-and-position-restoration.md`](M004-reflowable-visual-reader-and-position-restoration.md): implementation authority for roadmap Milestone 4, including the visual reader, reader security decisions, logical-position ownership, persistence, and restoration.
- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md): broader context spanning reader, narration synchronization, and audio startup; use the milestone-specific M004 plan for current reader work and retain this plan for later-roadmap context.
