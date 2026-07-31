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

- [`M010-002-reader-settings-and-playback-controls.md`](M010-002-reader-settings-and-playback-controls.md):
  active pre-M011 follow-up. Milestones 1-2A froze and ran the v1 backend
  comparison, selected no passing backend, and retain `1.00x`. ADR-0035
  authorizes and ADR-0036 freezes a separate six-value, fee-free v2
  comparison; Milestone 2B is next. Reader-first shell, accessible Settings,
  English fallback, profile presentation, and bounded narration preferences
  remain planned.
- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md):
  retained broad historical context. Completed M009 supersedes its
  synchronization work; it does not supersede completed Milestones 4 through 9.
