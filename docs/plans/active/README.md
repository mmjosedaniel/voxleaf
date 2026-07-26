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

- [`M006-002-qwen-short-segment-batch-feasibility.md`](M006-002-qwen-short-segment-batch-feasibility.md): active Milestone 6.2 plan. `selection-v4` selects neither stopped placement; the separate `v5` GPU-primary/CPU-support authority, model-free controller, exact adapter paths, bounded replay, and reviewed command surface are implemented. Pending Milestones 8-10 must run the hardware matrix, evaluate the 8-16-second-unit/five-minute-bounded playback hypothesis, and close the resulting decision.
- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md): retained broader context spanning the completed reader work and later narration synchronization/audio startup. It does not supersede the completed Milestones 4 through 6 authorities and does not authorize blocked Milestone 7 or later work.
