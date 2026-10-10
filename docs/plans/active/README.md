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

- [`native-rust-test-layout.md`](native-rust-test-layout.md): planned separation
  of native Rust unit tests into private child files and extraction of the
  existing Windows hardware-probe submodule; implementation has not started.

The preceding native Rust organization campaign is archived in
[completed plans](../completed/native-rust-module-organization.md).

## Historical reference

- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md):
  retained broad historical context. Completed M009 supersedes its
  synchronization work; it does not supersede completed Milestones 4 through 9.
  Its original path is preserved for links in completed plans; it is not an
  active ExecPlan.
