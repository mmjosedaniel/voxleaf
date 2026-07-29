# Documentation index

Documentation is organized by purpose so contributors and Codex can load only the context needed for a task.

## Current project status

Roadmap Milestones 1 through 9 and the M009.1 reader-experience stabilization
are complete. M008 provides the constrained one-GPU narration demo; M009 and
M009.1 add synchronized highlighting, heard checkpoints, stable reader chrome,
paragraph leaves, and passive-scroll isolation. M010 is in progress with
Milestones 1-6 complete. It freezes and implements the separate privacy-safe
host report, immutable measured registry, fail-closed matching, bounded
profile preference, compatibility UI, immediate pre-start checks, and the
desktop-local identity-safe recovery controller. Operational failure replaces
work identity before bounded teardown, verifies zero service/audio ownership,
and only then exposes one explicit restart from the latest heard checkpoint.
Protocol rejection, cancellation timeout, cleanup failure, and repeated
recovery remain contained; diagnostics retain at most eight content-free
entries and no automatic retry exists. Milestone 5 selects exact
Piper/davefx as the supported speed-focused CPU fallback after every v6 gate
  passed. Exact Qwen/Serena remains `development-only`. Milestone 6 adds Piper
  to the executable registry, exact local service, native selector, and
  user-controlled profile setting. Piper product narration automatically uses
  the narrower locator-safe `narration-piper-v1` preparation profile so complete
  units remain within protocol v1's 20-second ceiling. The corrective packaged
  Piper resilience arm passes. Qwen's offline service lifecycle passes, while the packaged
compatibility path correctly rejects it on this host because the frozen
available-VRAM margin is not met; no model starts and zero external requests
occur.

Use the [canonical system diagram](architecture/system-diagram.md) for component-level status and the [roadmap](plans/roadmap.md) for milestone authority.

## Product

- [`product/vision.md`](product/vision.md): product purpose, audience, and principles.
- [`product/project-brief.md`](product/project-brief.md): detailed problem, intended experience, product boundaries, and candidate technical direction.
- [`product/mvp.md`](product/mvp.md): MVP scope, non-goals, constraints, and acceptance criteria.
- [`product/post-mvp-tts-candidate-backlog.md`](product/post-mvp-tts-candidate-backlog.md): non-authoritative post-MVP intake order for Pocket TTS, Chatterbox LatAm, MOSS-TTS-Nano, Kokoro, and additional Piper voices.
- [`product/glossary.md`](product/glossary.md): shared terminology.

## Architecture

- [`architecture/system-diagram.md`](architecture/system-diagram.md): canonical implemented/approved component map, EPUB-to-audio flow, status legend, and maintenance conditions.
- [`architecture/overview.md`](architecture/overview.md): detailed component boundaries, invariants, implemented EPUB/reader/narration-preparation behavior, and the current TTS feasibility boundary.
- [`architecture/performance-budget.md`](architecture/performance-budget.md): latency, buffering, memory, and measurement targets.
- [`architecture/adaptive-buffer-authority-v1.md`](architecture/adaptive-buffer-authority-v1.md): frozen M008 quick/prepared/refill thresholds, simultaneous resource limits, ownership, lifecycle, volume/speed, and truthful UX authority.
- [`architecture/synchronization-authority-v1.md`](architecture/synchronization-authority-v1.md): frozen M009 segment-level position, transition, highlighting, following, navigation, observation, invalidation, and persistence authority.
- [`architecture/reader-experience-authority-v1.md`](architecture/reader-experience-authority-v1.md): frozen M009.1 paint-aware highlight proof, reader scroll ownership, compact narration, text-only loaded duration, and bounded paragraph-leaf authority.
- [`architecture/hardware-profile-recovery-authority-v1.md`](architecture/hardware-profile-recovery-authority-v1.md): frozen M010 Milestone 1 privacy-safe host report, immutable profile/evidence shape, result-blind margins, matching/preference rules, failure taxonomy, and identity-first recovery authority.
- [`architecture/narration-normalization-v1.md`](architecture/narration-normalization-v1.md): accepted test-only neutral/Spanish normalization corpus policy for Milestone 5.
- [`architecture/narration-preparation-limits-v1.md`](architecture/narration-preparation-limits-v1.md): accepted test-only `narration-v1` chunk, work, retention, checkpoint, and yield limits.
- [`architecture/tts-feasibility-profile-v2.md`](architecture/tts-feasibility-profile-v2.md): current Milestone 6 rerun authority, including the Windows/PyTorch cross-checked VRAM method, unchanged role gates, listening rubric, and content-safe summary policy. The superseded `v1` profile remains historical evidence.
- [`architecture/tts-feasibility-profile-v3.md`](architecture/tts-feasibility-profile-v3.md): current Milestone 6.1 authority for the exact Serena CustomVoice development candidate, its prototype stop gate, inherited full evaluation, and privacy/invalidation rules.
- [`architecture/tts-feasibility-profile-v4.md`](architecture/tts-feasibility-profile-v4.md): frozen pre-result Milestone 6.2 authority for the exact short-unit/shared-model batch experiment, conditional targeted CPU placement, playback simulation, and separate standard/scheduling/demo conclusions.
- [`architecture/tts-feasibility-profile-v5.md`](architecture/tts-feasibility-profile-v5.md): frozen pre-result Milestone 6.2 authority for the separately loaded GPU-primary/CPU-support experiment, CPU-solo screen, concurrent comparison, RAM/commit and zero-GPU checks, and simultaneous playback bounds.
- [`architecture/tts-feasibility-profile-v6.md`](architecture/tts-feasibility-profile-v6.md): accepted M010 Piper CPU authority and passing result, including the normalized Spanish corpus, candidate-neutral machine and quality gates, termination-backed cancellation, and explicit GPL/CC0 packaging boundary.
- [`architecture/piper-narration-preparation-profile-v1.md`](architecture/piper-narration-preparation-profile-v1.md): frozen corrective product authority that narrows locator-safe EPUB segmentation only for Piper so complete audio units fit protocol v1 without truncating speech or changing other profiles.
- [`architecture/piper-narration-preparation-profile-v2.md`](architecture/piper-narration-preparation-profile-v2.md): frozen Piper product correction that adds a deterministic normalized speech-expansion budget for compact numbers, acronyms, currencies, ordinals, and related forms while retaining the v1 locator, text, protocol, and privacy boundaries.
- [`architecture/tts-profile-runtime-configuration-availability-v1.md`](architecture/tts-profile-runtime-configuration-availability-v1.md): frozen corrective authority that keeps hardware compatibility separate from native runtime configuration and requires the selected exact profile to be configured before product Play is enabled.
- [`../benchmarks/tts/selection-v6.md`](../benchmarks/tts/selection-v6.md): accepted M010 decision admitting exact Piper/davefx as the supported speed-focused CPU fallback before runtime/settings integration.
- [`architecture/tts-service-protocol-v1.md`](architecture/tts-service-protocol-v1.md): accepted M007 protocol, framing, identity, audio-format, timeout, retention, capability, error, and native-configuration authority.
- [`../benchmarks/tts/selection-v5.md`](../benchmarks/tts/selection-v5.md): accepted Milestone 6.2 decision rejecting CPU-only and dual-worker scheduling while retaining one exact GPU profile only for bounded adaptive demo work.
- [`../benchmarks/tts/selection-v4.md`](../benchmarks/tts/selection-v4.md): accepted Milestone 6.2 decision selecting neither `v4` placement and preserving unavailable performance and quality as unavailable.
- [`../benchmarks/tts/selection-v3.md`](../benchmarks/tts/selection-v3.md): accepted Milestone 6.1 candidate-neutral decision record; standard `v3` remains failed. ADR-0015 now governs the later constrained-demo scheduling policy.
- [`architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md`](architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md): accepted no-viable-profile decision from the frozen v2 evaluation.
- [`architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md`](architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md): accepted one-GPU adaptive preparation and bounded in-memory buffering policy for the constrained Qwen development demo.
- [`architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md`](architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md): accepted Rust-owned standard-stream supervision and complete-unit binary-response decision.
- [`architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md`](architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md): accepted segment-level synchronization, CSS Custom Highlight, focus-safe following, manual-navigation, and non-skipping persistence decision.
- [`architecture/decisions/ADR-0018-reader-experience-stabilization.md`](architecture/decisions/ADR-0018-reader-experience-stabilization.md): accepted result-blind M009.1 reader-experience authority; highlight materialization, the fixed compact reader shell, and the bounded contextual leaf are implemented.
- [`architecture/decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md`](architecture/decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md): accepted result-blind M010 hardware/profile/recovery authority and implementation status through privacy-safe detection, measured matching, and identity-safe explicit recovery.
- [`architecture/decisions/ADR-0020-admit-piper-cpu-fallback.md`](architecture/decisions/ADR-0020-admit-piper-cpu-fallback.md): accepted exact Piper CPU-fallback selection, user-choice direction, and M010/M011 integration and packaging boundaries.
- [`architecture/decisions/`](architecture/decisions/): durable architecture decisions.

## Development

- [`development/setup.md`](development/setup.md): pinned prerequisites, reproducible setup, environment boundaries, and verified commands.
- [`development/testing.md`](development/testing.md): test strategy.
- [`development/troubleshooting.md`](development/troubleshooting.md): native
  development watcher/restoration diagnostics plus content-safe exact-demo
  availability, startup, buffering, cancellation, resource, and recovery
  guidance.
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
- [`plans/completed/M008-bounded-adaptive-prebuffering.md`](plans/completed/M008-bounded-adaptive-prebuffering.md): completed ExecPlan for the exact-development quick/prepared path, bounded scheduler/player, final demo policy, exact-host evidence, and repository/CI closeout.
- [`plans/completed/M009-synchronized-reading-and-narration.md`](plans/completed/M009-synchronized-reading-and-narration.md): completed focused ExecPlan for segment-level synchronization, highlighting, focus-safe following, synchronized navigation, heard-position persistence, exact-host validation, and repository/CI closeout.
- [`plans/completed/M009-001-reader-experience-stabilization.md`](plans/completed/M009-001-reader-experience-stabilization.md): completed bounded M009 follow-up for the visible-highlight repair, dedicated reader viewport, compact/collapsible narration UI, truthful loaded-duration status, locator-backed paragraph leaf, passive-scroll isolation, exact-host validation, and repository/CI closeout.
- [`plans/active/M010-hardware-profiles-fallback-and-operational-resilience.md`](plans/active/M010-hardware-profiles-fallback-and-operational-resilience.md): active focused ExecPlan for privacy-safe host detection, evidence-backed profile matching, CPU-fallback admission, and identity-safe operational recovery. Milestones 1-6 are complete. Milestone 6 implements executable Piper/Qwen registry, service, native selection, settings, Piper-only locator-safe preparation, and the profile-specific resilience runner; corrected long-paragraph Piper playback passes and Qwen passes service plus exact fail-closed packaged compatibility. Milestone 7 owns final support decisions and closeout.
- [`plans/active/synchronized-reader-and-startup-buffer.md`](plans/active/synchronized-reader-and-startup-buffer.md): broad historical context superseded by the completed M009 plan for synchronization work.
- [`plans/completed/`](plans/completed/): historical implementation plans.

For complex work, follow [`.agents/PLANS.md`](../.agents/PLANS.md).
