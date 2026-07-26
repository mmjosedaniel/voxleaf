# Documentation index

Documentation is organized by purpose so contributors and Codex can load only the context needed for a task.

## Current project status

Roadmap Milestones 1 through 6 are complete. The visual reader, bounded local restoration, locator-linked narration preparation, and candidate-neutral TTS feasibility harness are implemented and validated within their documented boundaries. The first frozen TTS evaluation selected no viable profile. Milestone 6.1 is active: its bounded Spanish intake screen selected Serena, and `tts-feasibility-profile-v3` now freezes the exact Qwen3-TTS 1.7B CustomVoice development identity before prototype or official results. This is not a production selection; the incremental-output/cancellation stop gate and every full evaluation gate remain. Milestone 7 stays blocked, and production TTS, audio, synchronization, general hardware support, and release packaging are not implemented.

Use the [canonical system diagram](architecture/system-diagram.md) for component-level status and the [roadmap](plans/roadmap.md) for milestone authority.

## Product

- [`product/vision.md`](product/vision.md): product purpose, audience, and principles.
- [`product/project-brief.md`](product/project-brief.md): detailed problem, intended experience, product boundaries, and candidate technical direction.
- [`product/mvp.md`](product/mvp.md): MVP scope, non-goals, constraints, and acceptance criteria.
- [`product/glossary.md`](product/glossary.md): shared terminology.

## Architecture

- [`architecture/system-diagram.md`](architecture/system-diagram.md): canonical implemented/approved component map, EPUB-to-audio flow, status legend, and maintenance conditions.
- [`architecture/overview.md`](architecture/overview.md): detailed component boundaries, invariants, implemented EPUB/reader/narration-preparation behavior, and the current TTS feasibility boundary.
- [`architecture/performance-budget.md`](architecture/performance-budget.md): latency, buffering, memory, and measurement targets.
- [`architecture/narration-normalization-v1.md`](architecture/narration-normalization-v1.md): accepted test-only neutral/Spanish normalization corpus policy for Milestone 5.
- [`architecture/narration-preparation-limits-v1.md`](architecture/narration-preparation-limits-v1.md): accepted test-only `narration-v1` chunk, work, retention, checkpoint, and yield limits.
- [`architecture/tts-feasibility-profile-v2.md`](architecture/tts-feasibility-profile-v2.md): current Milestone 6 rerun authority, including the Windows/PyTorch cross-checked VRAM method, unchanged role gates, listening rubric, and content-safe summary policy. The superseded `v1` profile remains historical evidence.
- [`architecture/tts-feasibility-profile-v3.md`](architecture/tts-feasibility-profile-v3.md): current Milestone 6.1 authority for the exact Serena CustomVoice development candidate, its prototype stop gate, inherited full evaluation, and privacy/invalidation rules.
- [`architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md`](architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md): accepted no-viable-profile decision from the frozen v2 evaluation.
- [`architecture/decisions/`](architecture/decisions/): durable architecture decisions.

## Development

- [`development/setup.md`](development/setup.md): pinned prerequisites, reproducible setup, environment boundaries, and verified commands.
- [`development/testing.md`](development/testing.md): test strategy.
- [`development/dependencies.md`](development/dependencies.md): dependency ownership, purpose, alternatives, and review policy.
- [`development/git-workflow.md`](development/git-workflow.md): branches, commits, and pull requests.

## Plans

- [`plans/roadmap.md`](plans/roadmap.md): high-level milestone sequence, dependencies, decision gates, and major risks.
- [`plans/active/`](plans/active/): current approved ExecPlans and retained cross-milestone context.
- [`plans/completed/M001-engineering-foundation.md`](plans/completed/M001-engineering-foundation.md): completed ExecPlan and validation evidence for the first roadmap milestone.
- [`plans/completed/M002-shared-contracts-and-test-harness.md`](plans/completed/M002-shared-contracts-and-test-harness.md): completed ExecPlan and validation evidence for roadmap Milestone 2.
- [`plans/completed/M003-secure-epub-ingestion-and-document-model.md`](plans/completed/M003-secure-epub-ingestion-and-document-model.md): completed ExecPlan and validation evidence for secure EPUB ingestion and the framework-independent document model in roadmap Milestone 3.
- [`plans/completed/M004-reflowable-visual-reader-and-position-restoration.md`](plans/completed/M004-reflowable-visual-reader-and-position-restoration.md): completed ExecPlan and validation evidence for roadmap Milestone 4's visual reader, logical position, persistence, and restoration.
- [`plans/completed/M004-001-native-webdriver-startup-smoke.md`](plans/completed/M004-001-native-webdriver-startup-smoke.md): completed test-infrastructure ExecPlan for the packaged WebView2 startup smoke used by Milestone 4 validation.
- [`plans/completed/M005-narration-text-preparation.md`](plans/completed/M005-narration-text-preparation.md): completed ExecPlan and validation evidence for roadmap Milestone 5's deterministic, bounded, locator-linked narration normalization, segmentation, and public `OpenedPublication.prepareNarration` boundary.
- [`plans/completed/M006-local-tts-feasibility-and-engine-profiles.md`](plans/completed/M006-local-tts-feasibility-and-engine-profiles.md): completed ExecPlan and validation evidence for roadmap Milestone 6's privacy-safe local TTS candidate evaluation, explicit no-viable-profile decision, and deterministic/hardware/privacy/repository closeout.
- [`plans/active/M006-001-local-tts-profile-blocker-resolution.md`](plans/active/M006-001-local-tts-profile-blocker-resolution.md): active Milestone 6.1 blocker-resolution plan; Milestone 1 selected Serena for evaluation and froze `v3`, while prototype, measurement, audit, final quality, and closeout work remain.
- [`plans/active/synchronized-reader-and-startup-buffer.md`](plans/active/synchronized-reader-and-startup-buffer.md): broader plan retained as historical context for later narration/audio integration; it does not supersede completed Milestones 4 through 6 or authorize blocked Milestone 7 work.
- [`plans/completed/`](plans/completed/): historical implementation plans.

For complex work, follow [`.agents/PLANS.md`](../.agents/PLANS.md).
