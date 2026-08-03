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

- [`M003-001-bounded-epub2-and-ncx-compatibility.md`](M003-001-bounded-epub2-and-ncx-compatibility.md):
  approved Milestone 3.1 follow-up for a bounded reflowable OPF 2.0/NCX
  profile. It preserves the current public publication, locator, reader, and
  narration boundaries and must complete before M011 Milestone 7 records the
  final MVP release decision. Implementation has not started; current builds
  remain EPUB 3-only.
- [`M011-package-validate-and-release-mvp.md`](M011-package-validate-and-release-mvp.md):
  approved next-milestone plan. It freezes and implements the Windows x64/
  Piper Spanish-English core, a separately gated optional Chatterbox GPU
  download with explicit consent and verified lifecycle, exact core/optional
  dependency/licence/integrity boundaries, clean-host complete-MVP validation,
  signing path, and independent core/optional/public release decisions.
  Milestones 1-3 and 4A are complete. Milestone 4B's deterministic acquisition
  implementation and authorized runtime publication are complete; clean-host
  validation remains open, and later packaging/signing/release milestones
  remain active.
- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md):
  retained broad historical context. Completed M009 supersedes its
  synchronization work; it does not supersede completed Milestones 4 through 9.
