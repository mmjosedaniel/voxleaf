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

- [`M011-package-validate-and-release-mvp.md`](M011-package-validate-and-release-mvp.md):
  active closeout plan. It freezes and implements the Windows x64/
  Piper Spanish-English core, a separately gated optional Chatterbox GPU
  download with explicit consent and verified lifecycle, exact core/optional
  dependency/licence/integrity boundaries, representative-host complete-MVP validation,
  signing path, and independent core/optional/public release decisions.
  Milestones 1-5, 6A, and 6B are complete at their documented boundaries. Under
  ADR-0049 and release authority v2, the preliminary Milestone 7 record accepts
  Piper local/portfolio GO and Chatterbox on systems that pass its published
  host gate. Milestone 6B now enables compatibility-gated ordinary acquisition,
  records truthful quality/resource disclosure, compiles development-runtime
  fallbacks out of the release, and passes the representative ordinary installer
  journey. The ordinary Chatterbox Download action is available only after both
  live host gates pass; trusted public signing remains pending external
  authorization. The plan stays active through the renewed Milestone 7 decision,
  required pull-request checks, and final closeout.
- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md):
  retained broad historical context. Completed M009 supersedes its
  synchronization work; it does not supersede completed Milestones 4 through 9.
