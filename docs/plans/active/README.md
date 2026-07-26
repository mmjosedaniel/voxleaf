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

- [`M006-001-local-tts-profile-blocker-resolution.md`](M006-001-local-tts-profile-blocker-resolution.md): active Milestone 6.1 closeout plan. The exact Qwen3-TTS 1.7B CustomVoice/Serena batch-one `v3` matrix failed standard performance, reliability, and mid-generation cancellation gates; accepted `selection-v3` retains that blocker while ADR-0014 permits only a constrained development demo. Milestone 5 is complete and repository/CI closeout remains.
- [`M006-002-qwen-short-segment-batch-feasibility.md`](M006-002-qwen-short-segment-batch-feasibility.md): planned Milestone 6.2 plan. It must freeze a separate `v4` authority before testing shorter ordered semantic units and shared-model batch size two; targeted CPU placement is a conditional memory contingency, not an assumed speed optimization.
- [`synchronized-reader-and-startup-buffer.md`](synchronized-reader-and-startup-buffer.md): retained broader context spanning the completed reader work and later narration synchronization/audio startup. It does not supersede the completed Milestones 4 through 6 authorities and does not authorize blocked Milestone 7 or later work.
