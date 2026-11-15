# Documentation index

Documentation is organized by purpose so contributors and Codex can load only the context needed for a task.

## Current project status

VoxLeaf is pre-alpha. The unsigned Windows x64 local/portfolio MVP includes
local EPUB reading, stable-locator restoration, synchronized narration and
bounded memory-only playback. Piper Spanish/English is the CPU core.
Chatterbox Spanish/English is optional and requires its published live
compatibility gate. Trusted public signing requires external authorization.
Qwen remains development-only, with production work deferred.
[ADR-0051](architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md)

The core package uses Piper **1.8.0 / ONNX Runtime 1.31.0**. Native optional
admission targets the published **v7** package with Chatterbox **0.1.7**, frozen
v3 service modules and msgpack 1.2.3. The support matrix distinguishes package
and engine versions from stable profile names. V2/v3/v5/v6 are cleanup-only
for the installed app, while local v4 remains unpublished and unadmitted.
Two full v6 live transfers failed. Complete v7 live HTTP delivery remains
unverified. [Support matrix](architecture/tts-support-matrix-v2.md#profile-identity-and-executable-versions)
· [V7 refresh evidence](plans/completed/chatterbox-msgpack-security-refresh.md)

## Task reading routes

Start with the current status, relevant product requirements and AGENTS constraints.
Then select the canonical architecture sections and ADRs for the affected owners:

- Isolated fix: inspect its owner, callers and regression tests; use the
  [bug workflow](../.agents/skills/investigate-bug/SKILL.md) and
  [change review](development/agentic-change-review.md). A small fix's planning
  exemption does not exempt behavioral review or relevant host checks.
- Maintainer CLI: read [service organization](development/tts-service-organization.md),
  command consumers, stdout/stderr contracts and the corresponding tests. Use
  change review for observable behavior; package/runtime boundary changes require
  their additional acceptance.
- Multi-component work or refactor campaign: read the complete affected canonical
  boundaries, [plan rules](../.agents/PLANS.md) and the applicable feature or
  [refactor workflow](development/agentic-refactoring.md). Preserve independent
  baseline/post-change validation for campaigns and all risk-triggered gates.

All acceptance runs in local PowerShell outside the sandbox. Reading routes do
not change model selection, review independence, evidence reuse or CI obligations.

| Contributor task                                                       | Maintained entry point                                                                                                           | Retained evidence or decision                                                                                                                                            |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Set up the workspace and select current commands                       | [Development setup](development/setup.md)                                                                                        | [Dependency inventory](development/dependencies.md)                                                                                                                      |
| Select checks for an implementation change                             | [Testing strategy](development/testing.md)                                                                                       | [Evidence retention](development/evidence-retention.md)                                                                                                                  |
| Understand runtime/maintainer boundaries and historical v2/v3/v4 tools | [TTS service organization](development/tts-service-organization.md)                                                              | [Adapter-layout campaign](plans/completed/tts-adapter-layout.md)                                                                                                         |
| Understand product support and local distribution                      | [MVP](product/mvp.md), [support matrix](architecture/tts-support-matrix-v2.md), [Windows release guide](user/windows-release.md) | [M011 closeout](plans/completed/M011-package-validate-and-release-mvp.md) and [ADR-0049](architecture/decisions/ADR-0049-use-representative-compatible-host-evidence.md) |
| Follow component ownership and milestone status                        | [Canonical system diagram](architecture/system-diagram.md), [roadmap](plans/roadmap.md)                                          | [Completed-plan index](plans/completed/README.md)                                                                                                                        |

## Evaluate the portfolio

Start with the [product presentation](../README.md), the
[local evaluation walkthrough](portfolio/try-voxleaf.md) and the
[engineering and agentic-development case study](portfolio/case-study.md).
The [compact diagram](architecture/system-diagram-compact.md) explains the local
stack. Current product requirements and canonical architecture remain the
authorities below; implementation history is retained in completed plans.

## Reading implementation status

Use the [roadmap](plans/roadmap.md) and [system diagram](architecture/system-diagram.md)
for current product boundaries, and the [active-plan index](plans/active/README.md)
for work awaiting implementation or acceptance. The
[completed-plan index](plans/completed/README.md) separates
completed work from superseded historical proposals.

Completed plans and validation receipts preserve the state at their original
closeout. Statements such as "not committed" or "CI pending" in those records
are historical; maintained indexes point to later results without rewriting
the original evidence. Recorded test counts are not fresh test runs on HEAD.

## Product

- [`product/vision.md`](product/vision.md): product purpose, audience, and principles.
- [`product/project-brief.md`](product/project-brief.md): detailed problem, intended experience, product boundaries, and candidate technical direction.
- [`product/mvp.md`](product/mvp.md): MVP scope, non-goals, constraints, and acceptance criteria.
- [`product/reader-settings-and-playback-controls.md`](product/reader-settings-and-playback-controls.md): approved M010.2 reader-first shell, Settings, English-default, profile-visibility, persistence, and implemented six-value boundary-deferred repository-WSOLA playback requirements, plus the implemented M011 lifecycle-feedback addendum.
- [`product/post-mvp-tts-candidate-backlog.md`](product/post-mvp-tts-candidate-backlog.md): non-authoritative post-MVP intake order for Pocket TTS, Chatterbox LatAm, MOSS-TTS-Nano, Kokoro, and additional Piper voices.
- [`product/glossary.md`](product/glossary.md): shared terminology.

## Architecture

- [`architecture/system-diagram.md`](architecture/system-diagram.md): canonical implemented/approved component map, EPUB-to-audio flow, status legend, and maintenance conditions.
- [`architecture/system-diagram-compact.md`](architecture/system-diagram-compact.md): simplified product-level map of local EPUB reading, local narration, bounded playback, synchronization, and optional Chatterbox installation.
- [`architecture/overview.md`](architecture/overview.md): detailed component boundaries, invariants, implemented EPUB/reader/narration-preparation behavior, and the current TTS feasibility boundary.
- [`architecture/performance-budget.md`](architecture/performance-budget.md): latency, buffering, memory, and measurement targets.
- [`architecture/adaptive-buffer-authority-v1.md`](architecture/adaptive-buffer-authority-v1.md): frozen M008 quick/prepared/refill thresholds, simultaneous resource limits, ownership, lifecycle, volume/speed, and truthful UX authority.
- [`architecture/playback-transition-pause-policy-v1.md`](architecture/playback-transition-pause-policy-v1.md): frozen M008.1 semantic generated-unit transition mapping, eligibility, lifecycle, measurement, and privacy authority.
- [`architecture/synchronization-authority-v1.md`](architecture/synchronization-authority-v1.md): frozen M009 segment-level position, transition, highlighting, following, navigation, observation, invalidation, and persistence authority.
- [`architecture/reader-experience-authority-v1.md`](architecture/reader-experience-authority-v1.md): frozen M009.1 paint-aware highlight proof, reader scroll ownership, compact narration, text-only loaded duration, and bounded paragraph-leaf authority.
- [`architecture/reader-settings-playback-authority-v1.md`](architecture/reader-settings-playback-authority-v1.md): frozen M010.2 Milestone 1 shell, Settings, English-fallback migration, bounded preference, exact playback-rate arithmetic, backend-comparison, resource, privacy, and validation authority.
- [`architecture/reader-settings-playback-authority-v2.md`](architecture/reader-settings-playback-authority-v2.md): frozen M010.2 Milestone 2A six-rate, exact-candidate, fee-free licence, media-only CSP, lifecycle, resource, and result-lineage comparison authority.
- [`architecture/reader-settings-playback-authority-v3.md`](architecture/reader-settings-playback-authority-v3.md): frozen M010.2 Milestone 2C selected/pending/active rate state, exact boundary-deferred candidates, first-activation/recurring-handoff, resource, lifecycle, licence/CSP, listening, and strict result-lineage authority.
- [`architecture/mvp-release-authority-v1.md`](architecture/mvp-release-authority-v1.md): frozen historical M011 Windows/Piper core and single-archive optional Chatterbox topology, trust, cleanup, dependency/licence/integrity, signing, and independent release-claim authority; Milestone 4B additively supersedes only its Chatterbox acquisition shape through authority v2.
- [`architecture/mvp-release-authority-v2.md`](architecture/mvp-release-authority-v2.md): accepted M011 claim authority using published compatibility requirements plus representative host evidence, while separating runtime support, ordinary-build download availability, and externally authorized public signing.
- [`architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md`](architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md): accepted additive installer authority separating default interactive Chatterbox removal from default reader-state retention while keeping silent uninstall non-destructive without explicit bounded options.
- [`architecture/decisions/ADR-0048-admit-bounded-epub2-and-ncx-compatibility.md`](architecture/decisions/ADR-0048-admit-bounded-epub2-and-ncx-compatibility.md): implemented authority for bounded reflowable OPF 2.0, NCX navigation, exact inert compatibility doctypes, and unchanged public semantic/locator boundaries; final evidence is recorded in the completed M003.1 ExecPlan.
- [`architecture/decisions/ADR-0049-use-representative-compatible-host-evidence.md`](architecture/decisions/ADR-0049-use-representative-compatible-host-evidence.md): accept support claims based on published requirements and representative compatible-host evidence rather than exhaustive per-computer testing.
- [`architecture/chatterbox-official-acquisition-authority-v2.md`](architecture/chatterbox-official-acquisition-authority-v2.md): accepted M011 Milestone 4B authority for a separately verified split runtime and the six exact official revision-pinned Hugging Face model files, with closed redirects, limits, cancellation, safe loading, atomic promotion, and fail-closed release gates.
- [`../services/tts/release/optional/chatterbox/runtime-package-evidence-v5.json`](../services/tts/release/optional/chatterbox/runtime-package-evidence-v5.json): generated certifi/Pillow v5 artifact and publication identities. Earlier runtime evidence v2/v3/v4 remains historical; runtime evidence alone does not establish installer acceptance or signing.
- [`architecture/hardware-profile-recovery-authority-v1.md`](architecture/hardware-profile-recovery-authority-v1.md): frozen M010 Milestone 1 privacy-safe host report, immutable profile/evidence shape, result-blind margins, matching/preference rules, failure taxonomy, and identity-first recovery authority.
- [`architecture/qwen-development-vram-admission-v1.md`](architecture/qwen-development-vram-admission-v1.md): corrective development-only authority retaining generic total VRAM while admitting the exact Qwen demo with its measured peak plus a frozen 512-MiB available-VRAM reserve.
- [`architecture/tts-support-matrix-v1.md`](architecture/tts-support-matrix-v1.md): final M010 product support matrix, admitted host margins, explicit selection/fallback policy, recovery policy, limitations, and runtime/license/distribution boundary.
- [`architecture/tts-support-matrix-v2.md`](architecture/tts-support-matrix-v2.md): current M010.1 executable support matrix for Piper Spanish/English, Chatterbox Spanish/English, development-only Qwen Serena/Aiden, and preserved deferred/unsupported records.
- [`architecture/bilingual-narration-authority-v1.md`](architecture/bilingual-narration-authority-v1.md): implemented M010.1 product authority for explicit Spanish/English selection, bounded preference, identity-first language changes, accessibility, and unsupported combinations.
- [`architecture/bilingual-narration-authority-v2.md`](architecture/bilingual-narration-authority-v2.md): implemented M010.2 additive authority for English fallback, v1-choice preservation, bounded language/start preferences, pre-action hydration, and identity-first explicit reset.
- [`architecture/narration-normalization-v1.md`](architecture/narration-normalization-v1.md): accepted test-only neutral/Spanish normalization corpus policy for Milestone 5.
- [`architecture/narration-normalization-v2.md`](architecture/narration-normalization-v2.md): implemented additive Spanish/English normalization authority and synthetic corpus for M010.1; historical combinations remain closed and Spanish regressions remain passing.
- [`architecture/narration-preparation-limits-v1.md`](architecture/narration-preparation-limits-v1.md): accepted test-only `narration-v1` chunk, work, retention, checkpoint, and yield limits.
- [`architecture/chatterbox-narration-preparation-profile-v1.md`](architecture/chatterbox-narration-preparation-profile-v1.md): implemented Chatterbox-specific packing limits that preserve bilingual normalization and whose exact-host outputs remained inside protocol v1.
- [`architecture/tts-feasibility-profile-v2.md`](architecture/tts-feasibility-profile-v2.md): historical Milestone 6 rerun authority, including the Windows/PyTorch cross-checked VRAM method, unchanged role gates, listening rubric, and content-safe summary policy. The superseded `v1` profile remains historical evidence.
- [`architecture/tts-feasibility-profile-v3.md`](architecture/tts-feasibility-profile-v3.md): historical Milestone 6.1 authority for the exact Serena CustomVoice development candidate, its prototype stop gate, inherited full evaluation, and privacy/invalidation rules.
- [`architecture/tts-feasibility-profile-v4.md`](architecture/tts-feasibility-profile-v4.md): frozen pre-result Milestone 6.2 authority for the exact short-unit/shared-model batch experiment, conditional targeted CPU placement, playback simulation, and separate standard/scheduling/demo conclusions.
- [`architecture/tts-feasibility-profile-v5.md`](architecture/tts-feasibility-profile-v5.md): frozen pre-result Milestone 6.2 authority for the separately loaded GPU-primary/CPU-support experiment, CPU-solo screen, concurrent comparison, RAM/commit and zero-GPU checks, and simultaneous playback bounds.
- [`architecture/tts-feasibility-profile-v6.md`](architecture/tts-feasibility-profile-v6.md): accepted M010 Piper CPU authority and passing result, including the normalized Spanish corpus, candidate-neutral machine and quality gates, termination-backed cancellation, and explicit GPL/CC0 packaging boundary.
- [`architecture/tts-feasibility-profile-v7.md`](architecture/tts-feasibility-profile-v7.md): frozen pre-result M010.1 authority for the exact Piper English baseline and bounded Chatterbox/MOSS screens, including candidate locks, artifact hashes, offline rules, bilingual corpora, schemas, gates, and stop conditions.
- [`architecture/tts-feasibility-profile-v8.md`](architecture/tts-feasibility-profile-v8.md): superseding result-blind M010.1 authority that preserves v7 and adds exact local Qwen/Serena Spanish and Qwen/Aiden English controls while excluding cloud inference, voice cloning, and voice design; its first content-safe result admits the exact Piper/joe English CPU baseline for later integration.
- [`architecture/tts-feasibility-profile-v9.md`](architecture/tts-feasibility-profile-v9.md): corrective decision-neutral M010.1 authority that treats Qwen's approximately 1.44 RTF as constrained-buffer capacity evidence and requires real MOSS and Chatterbox tests before maintainer decisions.
- [`architecture/tts-feasibility-profile-v10.md`](architecture/tts-feasibility-profile-v10.md): frozen exact CUDA 12.4 Chatterbox correction whose Torch 2.6 runtime stops before inference because it lacks RTX 5060 `sm_120` kernels.
- [`architecture/tts-feasibility-profile-v11.md`](architecture/tts-feasibility-profile-v11.md): frozen experimental Torch 2.9.1+cu128 Chatterbox compatibility screen for the exact RTX 5060 host; its content-safe result is reviewed and advanced only to the next full evaluation in selection v11.
- [`architecture/tts-feasibility-profile-v12.md`](architecture/tts-feasibility-profile-v12.md): frozen pre-result M010.1 authority for the complete Chatterbox bilingual/sustained matrix and independent Qwen Serena/Spanish and Aiden/English private quality decisions.
- [`../benchmarks/tts/selection-v11.md`](../benchmarks/tts/selection-v11.md): accepted M010.1 Milestone 4 routing that advances exact Chatterbox to the next full matrix, defers MOSS without rejection, and retains both Qwen language profiles for hardware-dependent constrained-buffer evaluation.
- [`../benchmarks/tts/selection-v12.md`](../benchmarks/tts/selection-v12.md): accepted M010.1 Milestone 5 decision admitting Chatterbox for Spanish/English integration, retaining Qwen/Serena Spanish, and admitting Qwen/Aiden English.
- [`architecture/piper-narration-preparation-profile-v1.md`](architecture/piper-narration-preparation-profile-v1.md): historical corrective product authority that narrows locator-safe EPUB segmentation only for Piper; v2 supersedes it for product dispatch.
- [`architecture/piper-narration-preparation-profile-v2.md`](architecture/piper-narration-preparation-profile-v2.md): implemented Piper product correction that adds a deterministic normalized speech-expansion budget for compact numbers, acronyms, currencies, ordinals, and related forms while retaining the v1 locator, text, protocol, and privacy boundaries.
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
- [`architecture/decisions/ADR-0021-boundary-aware-audio-transitions.md`](architecture/decisions/ADR-0021-boundary-aware-audio-transitions.md): accepted engine-neutral scheduled pause between already-buffered generated narration units.
- [`architecture/decisions/ADR-0022-qwen-development-vram-admission.md`](architecture/decisions/ADR-0022-qwen-development-vram-admission.md): accepted narrow development-only available-VRAM rule without changing Qwen's failed standard evaluation or supported-profile margins.
- [`architecture/decisions/ADR-0023-final-m010-support-and-recovery.md`](architecture/decisions/ADR-0023-final-m010-support-and-recovery.md): accepted final Piper-supported, Qwen-development-only, explicit-recovery decision while keeping M011 distribution obligations separate.
- [`architecture/decisions/ADR-0024-freeze-bilingual-v7-authority.md`](architecture/decisions/ADR-0024-freeze-bilingual-v7-authority.md): freezes explicit bilingual product behavior and the v7 candidate/evaluation authority before results without claiming English runtime support.
- [`architecture/decisions/ADR-0025-supersede-v7-with-local-qwen-bilingual-v8-authority.md`](architecture/decisions/ADR-0025-supersede-v7-with-local-qwen-bilingual-v8-authority.md): preserves resultless v7 and freezes exact local Qwen Spanish/English controls in v8 before results.
- [`architecture/decisions/ADR-0026-correct-bilingual-candidate-decision-authority.md`](architecture/decisions/ADR-0026-correct-bilingual-candidate-decision-authority.md): makes the Qwen constrained-buffer interpretation explicit and prevents automatic MOSS/Chatterbox rejection.
- [`architecture/decisions/ADR-0027-freeze-chatterbox-cuda-v10-correction.md`](architecture/decisions/ADR-0027-freeze-chatterbox-cuda-v10-correction.md): preserves v9 MOSS evidence and freezes the exact CUDA 12.4 Chatterbox correction.
- [`architecture/decisions/ADR-0028-freeze-chatterbox-rtx50-compatibility-v11.md`](architecture/decisions/ADR-0028-freeze-chatterbox-rtx50-compatibility-v11.md): freezes a separate RTX 50-series compatibility experiment with no automatic candidate decision.
- [`architecture/decisions/ADR-0029-advance-chatterbox-retain-qwen-defer-moss.md`](architecture/decisions/ADR-0029-advance-chatterbox-retain-qwen-defer-moss.md): advances exact Chatterbox as the sole new-engine full-matrix survivor, defers MOSS without rejection, and retains Qwen Serena/Aiden as separate hardware-dependent candidates.
- [`architecture/decisions/ADR-0030-freeze-corrective-full-evaluation-v12.md`](architecture/decisions/ADR-0030-freeze-corrective-full-evaluation-v12.md): freezes the result-blind complete Chatterbox and independent Qwen quality authority before new audio or results.
- [`architecture/decisions/ADR-0031-admit-chatterbox-bilingual-and-qwen-language-profiles.md`](architecture/decisions/ADR-0031-admit-chatterbox-bilingual-and-qwen-language-profiles.md): admits exact Chatterbox for both languages and Qwen/Aiden for English integration while retaining Qwen/Serena Spanish and explicit host/buffering limitations.
- [`architecture/decisions/ADR-0032-bound-chatterbox-complete-waveform-units.md`](architecture/decisions/ADR-0032-bound-chatterbox-complete-waveform-units.md): bounds Chatterbox complete-waveform units without changing bilingual normalization or protocol v1.
- [`architecture/decisions/ADR-0033-freeze-reader-settings-and-pitch-preserving-playback-authority.md`](architecture/decisions/ADR-0033-freeze-reader-settings-and-pitch-preserving-playback-authority.md): accepts the result-blind M010.2 Milestone 1 authority and keeps speed after synthesis with pitch preservation and source-frame progress.
- [`architecture/decisions/ADR-0034-retain-fixed-speed-after-playback-backend-evaluation.md`](architecture/decisions/ADR-0034-retain-fixed-speed-after-playback-backend-evaluation.md): records that neither frozen backend passed every machine and packaged-host gate, retains `1.00x`, and requires a new decision before non-default speeds.
- [`architecture/decisions/ADR-0035-reopen-reduced-range-fee-free-playback-evaluation.md`](architecture/decisions/ADR-0035-reopen-reduced-range-fee-free-playback-evaluation.md): authorizes a separate result-blind v2 comparison for six rates ending at `0.75x`, fee-free permissive candidates, and a narrowly reviewed media CSP without rewriting v1.
- [`architecture/decisions/ADR-0036-freeze-reduced-range-fee-free-playback-authority-v2.md`](architecture/decisions/ADR-0036-freeze-reduced-range-fee-free-playback-authority-v2.md): accepts the executable v2 authority before candidate implementation or results and preserves `1.00x` until one candidate passes.
- [`architecture/decisions/ADR-0037-retain-fixed-speed-after-reduced-range-evaluation.md`](architecture/decisions/ADR-0037-retain-fixed-speed-after-reduced-range-evaluation.md): records the v2 no-selection result after inference contention, removes every unselected experiment, and retains `1.00x`.
- [`architecture/decisions/ADR-0038-reopen-boundary-deferred-playback-evaluation.md`](architecture/decisions/ADR-0038-reopen-boundary-deferred-playback-evaluation.md): authorizes a separate v3 comparison where a pending rate applies at the next complete-unit boundary without restarting TTS or discarding queued PCM, under new first-activation and RAM limits.
- [`architecture/decisions/ADR-0039-freeze-boundary-deferred-playback-authority-v3.md`](architecture/decisions/ADR-0039-freeze-boundary-deferred-playback-authority-v3.md): freezes the immutable v3 candidate, boundary-transition, recurring-handoff, resource, lifecycle, licence/CSP, listening, and strict result-lineage authority before implementation or measurement.
- [`architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md`](architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md): selects repository-owned incremental WSOLA v3 after every frozen machine, privacy, lifecycle, and bilingual-listening gate passes; Milestone 5 implements the exact selection without dependency or CSP expansion.
- [`architecture/decisions/ADR-0044-use-measured-capacity-for-chatterbox-vram-admission.md`](architecture/decisions/ADR-0044-use-measured-capacity-for-chatterbox-vram-admission.md): replaces the conservative 8-GB Chatterbox minimum with the measured-capacity 6-GB-class/4,668-MiB-free product gate while retaining 8 GB as recommended and evaluated.
- [`architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md`](architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md): retains immutable runtime-v2 release assets while applying one hash-closed two-module correction and short Windows-safe install root before full re-verification.
- [`architecture/decisions/`](architecture/decisions/): durable architecture decisions.

## Development

- [`development/findings/README.md`](development/findings/README.md): cumulative logic-audit workflow, stable finding identities, historical/current evidence separation and bounded regression coverage.
- [`development/findings/registry.md`](development/findings/registry.md): seeded findings index with exact triggers, prior decisions, correction/test links and explicit current assessment status; [import coverage](development/findings/history-import.md) remains partial.
- [`development/setup.md`](development/setup.md): pinned prerequisites, reproducible setup, environment boundaries, and verified commands.
- [`development/testing.md`](development/testing.md): test strategy.
- [`development/evidence-retention.md`](development/evidence-retention.md): curated acceptance summaries and identities, local/CI raw-artifact retention, and the tested Git-index guard.
- [`development/desktop-source-organization-follow-up.md`](development/desktop-source-organization-follow-up.md): observed native-test environment fragility, Chatterbox startup latency, deferred Qwen buffering and non-blocking cache/bundle warnings; proposed follow-ups remain separate from the completed refactor.
- [`development/troubleshooting.md`](development/troubleshooting.md): native
  development watcher/restoration diagnostics plus content-safe exact-demo
  availability, startup, buffering, cancellation, resource, and recovery
  guidance.
- [`development/dependencies.md`](development/dependencies.md): dependency ownership, purpose, alternatives, and review policy.
- [`development/tts-service-organization.md`](development/tts-service-organization.md): implemented Python runtime/maintainer module map, helper ownership, package inclusion policies, test boundaries and validation commands.
- [`development/release-security-and-distribution.md`](development/release-security-and-distribution.md): current M011 security assessment, exact unsigned candidate identity, renewed Milestone 7 decision and exact-artifact receipts, completed 6B ordinary acquisition/release isolation, basic audit result and limitations, pending external signing, and deliberately deferred enterprise hardening.
- [`user/windows-release.md`](user/windows-release.md): current-user Windows install, repair/replacement, uninstall, checksum, signature, prerequisite, and payload-exclusion guidance for the versioned local package.
- [`development/git-workflow.md`](development/git-workflow.md): branches, commits, pull requests, and the bounded Sol Git-steward authority.
- [`development/agentic-change-review.md`](development/agentic-change-review.md): independent Astra review of feature and bug-fix behavior, regression coverage, exact-patch evidence, and correction handling.
- [`development/agentic-refactoring.md`](development/agentic-refactoring.md): bounded TypeScript/Python/Rust refactors, independent host validation, risk-based unit/batch gates, immutable evidence reuse, preparation and retry policy, and authorized Git stewardship.

## Plans

- [Documentation consolidation and review closeout](plans/completed/documentation-consolidation-and-review-closeout.md) covers current-version guidance, delivery summaries and review closeout.
- The [roadmap](plans/roadmap.md) tracks milestones, dependencies, decision gates and major risks. The [active plans](plans/active/) record work awaiting implementation or acceptance.
- The [completed-plan index](plans/completed/) maintains delivery summaries and links to original plans, host evidence, independent reviews and subsequent corrections. This includes the rejected Qwen experiments, the playback backend comparisons and the renewed unsigned release decision. Release assessment and the scope of the static security scan are in the [release security guide](development/release-security-and-distribution.md).
- Follow the [plan rules](../.agents/PLANS.md) for complex work.

The [superseded reader and startup-buffer plan](plans/completed/synchronized-reader-and-startup-buffer.md)
remains archived. The completed index routes to the focused milestone plans
that own its implementation and validation.
