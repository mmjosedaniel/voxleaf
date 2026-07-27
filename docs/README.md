# Documentation index

Documentation is organized by purpose so contributors and Codex can load only the context needed for a task.

## Current project status

Roadmap Milestones 1 through 7 are complete. The visual reader, bounded local restoration, locator-linked narration preparation, candidate-neutral TTS feasibility harness, and constrained local TTS service boundary are implemented and validated within their documented boundaries. The first frozen TTS evaluation selected no viable profile. Milestone 6.1's exact Qwen3-TTS 1.7B CustomVoice/Serena `v3` machine evaluation failed startup, throughput, zero-failure, and mid-generation cancellation gates. Accepted `selection-v3` retains that standard blocker. Completed Milestone 6.2 records `selection-v5`, which rejects the CPU-only and dual-worker alternatives and retains exactly one GPU worker only under a constrained development-demo exception. The same-authority GPU baseline measured RTF 1.467; a low-application-load diagnostic completed both workers but improved aggregate RTF by only about 2.6% while slowing the GPU worker substantially. ADR-0015 therefore authorizes the constrained demo without selecting a production profile. Completed M007 implements and validates protocol v1, canonical cross-language controls, the bounded Python service, persistent native supervision, narrow binary commands, typed one-unit ownership, and the exact development-only Qwen/Serena adapter. Packaged WebView2 validates the model-free lifecycle, and the exact-host matrix passes bounded complete-unit delivery, backpressure, every required invalidation, termination, zero stale audio, cleanup, and explicit reload. The product narration caller, playback, and distribution remain M008/later work. This is not a passing standard profile, production, native-model-streaming, continuous-playback, or general-hardware claim.

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
- [`architecture/tts-feasibility-profile-v4.md`](architecture/tts-feasibility-profile-v4.md): frozen pre-result Milestone 6.2 authority for the exact short-unit/shared-model batch experiment, conditional targeted CPU placement, playback simulation, and separate standard/scheduling/demo conclusions.
- [`architecture/tts-feasibility-profile-v5.md`](architecture/tts-feasibility-profile-v5.md): frozen pre-result Milestone 6.2 authority for the separately loaded GPU-primary/CPU-support experiment, CPU-solo screen, concurrent comparison, RAM/commit and zero-GPU checks, and simultaneous playback bounds.
- [`architecture/tts-service-protocol-v1.md`](architecture/tts-service-protocol-v1.md): accepted M007 protocol, framing, identity, audio-format, timeout, retention, capability, error, and native-configuration authority.
- [`../benchmarks/tts/selection-v5.md`](../benchmarks/tts/selection-v5.md): accepted Milestone 6.2 decision rejecting CPU-only and dual-worker scheduling while retaining one exact GPU profile only for bounded adaptive demo work.
- [`../benchmarks/tts/selection-v4.md`](../benchmarks/tts/selection-v4.md): accepted Milestone 6.2 decision selecting neither `v4` placement and preserving unavailable performance and quality as unavailable.
- [`../benchmarks/tts/selection-v3.md`](../benchmarks/tts/selection-v3.md): accepted Milestone 6.1 candidate-neutral decision record; standard `v3` remains failed. ADR-0015 now governs the later constrained-demo scheduling policy.
- [`architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md`](architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md): accepted no-viable-profile decision from the frozen v2 evaluation.
- [`architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md`](architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md): accepted one-GPU adaptive preparation and bounded in-memory buffering policy for the constrained Qwen development demo.
- [`architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md`](architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md): accepted Rust-owned standard-stream supervision and complete-unit binary-response decision.
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
- [`plans/completed/M006-001-local-tts-profile-blocker-resolution.md`](plans/completed/M006-001-local-tts-profile-blocker-resolution.md): completed Milestone 6.1 blocker-resolution ExecPlan; it freezes Serena, proves the bounded prototype, retains the failed standard `v3` result, records the constrained-demo decision, and closes repository/privacy and pull-request validation.
- [`plans/completed/M006-002-qwen-short-segment-batch-feasibility.md`](plans/completed/M006-002-qwen-short-segment-batch-feasibility.md): completed Milestone 6.2 feasibility ExecPlan. `selection-v5` rejects CPU-only and dual-worker scheduling and retains one GPU worker only for the constrained demo; local and required pull-request validation pass.
- [`plans/completed/M007-local-tts-service-and-process-protocol.md`](plans/completed/M007-local-tts-service-and-process-protocol.md): completed ExecPlan for the constrained one-GPU local service and process protocol. It records transport, contracts, Python service, native supervision, typed one-unit ownership, exact Qwen/Serena integration, measured content-safe exact-host handoff, and final repository/CI validation without authorizing production or general-hardware claims.
- [`plans/active/M008-bounded-adaptive-prebuffering.md`](plans/active/M008-bounded-adaptive-prebuffering.md): approved implementation plan for quick-start and explicit prepared playback, one-GPU scheduling, adaptive boundary waits, truthful rebuffering, and a 30-minute in-memory ceiling.
- [`plans/active/synchronized-reader-and-startup-buffer.md`](plans/active/synchronized-reader-and-startup-buffer.md): broader plan retained as historical context for later narration/audio integration; it does not supersede completed Milestones 4 through 7 or the focused M008 plan.
- [`plans/completed/`](plans/completed/): historical implementation plans.

For complex work, follow [`.agents/PLANS.md`](../.agents/PLANS.md).
