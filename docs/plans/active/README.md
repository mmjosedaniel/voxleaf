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

- [`M007-local-tts-service-and-process-protocol.md`](M007-local-tts-service-and-process-protocol.md): active closeout plan for the constrained one-GPU local service and versioned process protocol. Milestones 1-6 are locally complete with model-free packaged evidence, exact Qwen/Serena handoff/cancellation/cleanup/reload evidence, and the protocol/dependency/privacy/repository audit. Required final pull-request CI and plan archival remain. Production and general-hardware support remain blocked.
- [`M008-bounded-adaptive-prebuffering.md`](M008-bounded-adaptive-prebuffering.md): approved but not implemented plan for one-GPU quick-start and explicit prepared playback, bounded adaptive buffering, playback-only pause continuation, frontier warnings, and a 30-minute in-memory ceiling.
- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md): retained broader context spanning the completed reader work and later narration synchronization/audio startup. It does not supersede the completed Milestones 4 through 6.2 or the focused M007/M008 authorities.
