# Documentation index

Documentation is organized by purpose so contributors and Codex can load only the context needed for a task.

## Current project status

Roadmap Milestones 1 through 10.2, M008.1, and M009.1 are complete. M008 provides
the constrained one-GPU narration demo; M008.1 adds bounded semantic
transitions between already-buffered units; M009 and M009.1 add synchronized
highlighting, heard checkpoints, stable reader chrome, paragraph leaves, and
passive-scroll isolation. M010 runtime integration,
deterministic/exact-host validation, content-safe packaged private-book
confirmation, and required Ubuntu/Windows closeout checks pass. M010
freezes and implements the separate privacy-safe
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
the locator-safe, spoken-expansion-aware
[`narration-piper-v2`](architecture/piper-narration-preparation-profile-v2.md)
preparation profile so ordinary prose and compact numbers, currencies,
acronyms, Roman numerals, ordinals, and letter sequences are bounded before
inference. The corrective packaged Piper resilience arm passes. Qwen's
offline service lifecycle passes. Corrective ADR-0022 retains its generic
`7,196`-MiB total-VRAM requirement but uses the measured `5,996`-MiB peak plus
a frozen `512`-MiB reserve for currently available VRAM only while the exact
profile remains native-gated and `development-only`. The packaged application
now offers and executes Qwen on the exact host. Its broader matrix later stops
at the depletion synchronization assertion, so no supported, real-time, or
complete-resilience claim is added.
The historical M010
[`tts-support-matrix-v1`](architecture/tts-support-matrix-v1.md) makes
Piper/davefx the sole supported and automatically recommendable profile when
compatible and configured, keeps Qwen/Serena development-only, and records
that automatic engine failover remains disabled. M011 still owns runtime/model
distribution and license fulfillment. M010.1's completed v2 overlay is
described below.

M010.1 is complete. Milestones 1 through 5 freeze and execute the
bilingual authority, evaluation, and maintainer decisions. Milestone 6 now
implements the exact language/profile registry, host and runtime gates,
selection UI, native supervision, and local adapters. Piper davefx/Spanish and
joe/English are supported CPU profiles; Chatterbox is supported for Spanish
and English; Qwen Serena/Spanish and Aiden/English remain development-only
constrained-buffer profiles. Protocol v1 and one-child ownership remain
unchanged, and the sequential six-arm exact-host service matrix passes. MOSS
remains deferred without rejection. Milestone 7's six packaged synthetic EPUB
arms, exact-host metrics, privacy boundary, cancellation, synchronization, and
cleanup evidence pass. Pull request #159 passed the required Ubuntu and
Windows checks and merged the closeout.

M010.2 is complete. The reader/settings/playback authority was frozen before
results, then neither v1 backend passed every frozen gate. ADR-0034 retains that
historical `1.00x` result. Milestone 3 changes only bounded narration
preferences: the current app now preserves valid Spanish/English state,
defaults missing/invalid/reset state to English, and persists Quick/Prepared
startup. ADR-0035 authorizes and ADR-0036 freezes
a separate fee-free v2 comparison for six rates ending at `0.75x`; ADR-0037
records that both packaged passers failed under local-inference contention,
removes every experiment, and retains `1.00x`. ADR-0038 authorizes a new
boundary-deferred v3 with no TTS/queue invalidation, a 1,000 ms p95 first
activation ceiling, a 200 MiB additional-process-RAM ceiling, and `1.00x`
bypass. ADR-0039 and the immutable v3 architecture/executable authority now
freeze the exact two candidates, selected/pending/active transition, 250 ms
recurring handoff, lifecycle, resource, licence/CSP, listening, and lineage
rules. Milestone 2D selected the repository-owned incremental WSOLA v3
backend after complete Chromium, packaged WebView2, exact Piper-contention,
privacy, lifecycle, and bilingual-listening passes. ADR-0040 records the
selection; no dependency or CSP expansion remains. Milestone 5 now connects
that exact backend to the bounded player with six boundary-deferred rates,
effective-listening-duration scheduling, and a separate content-free playback
preference while source PCM remains the progress and memory authority.
Milestone 4 implements
the fixed compact app bar, compact publication/narration chrome, sole reader
viewport, collapsible contents overlay, and accessible Settings drawer/sheet
without changing domain ownership. Milestone 3 implements the additive
bilingual authority v2: valid saved Spanish or
English survives upgrade, missing/invalid/reset state defaults to English,
Quick/Prepared startup is separately bounded and persisted, controls hydrate
before use, and reset follows identity-first cleanup.
The sequential packaged closeout exposes the same six-rate presentation for
all profiles and exercises Piper Spanish/English at all six rates while also
running Chatterbox Spanish/English and development-only Qwen Serena/Aiden. It
reports zero external requests, persisted audio, stale playback, or retained
cleanup units. Renewed maintainer listening confirms correct slowdown across
the admitted range, and pull request #170 passes the required Ubuntu and
Windows checks.

M011 is in progress and has a detailed active
[`packaging and release ExecPlan`](plans/active/M011-package-validate-and-release-mvp.md).
Milestone 1 freezes
[`mvp-release-authority-v1`](architecture/mvp-release-authority-v1.md) and
accepts
[ADR-0042](architecture/decisions/ADR-0042-freeze-mvp-release-authority.md)
before dependency or package results. Its proportional
[`release security and distribution boundary`](development/release-security-and-distribution.md)
targets a Windows x64 portfolio MVP with Piper Spanish/English in the small
core and Chatterbox Spanish/English as a separately gated optional GPU quality
download. The Chatterbox path requires explicit consent, a minimal audited
graph, fixed-manifest integrity verification, atomic installation, separate
activation, offline clean-host proof, and application-owned removal; Qwen stays
development-only and outside the first distributable product. Milestone 2
closes the exact 15-entry core and 79-package optional locks, automated
production audits, bounded dependency-update intake, and a deterministic
363-component release inventory. It does not yet create an installer or the
optional acquisition flow. Piper-core,
optional-Chatterbox, and signed-public readiness are separate gates. Signing
does not block a truthful local demo, but an unsigned general download is not
approved.

Use the [canonical system diagram](architecture/system-diagram.md) for component-level status and the [roadmap](plans/roadmap.md) for milestone authority.

## Product

- [`product/vision.md`](product/vision.md): product purpose, audience, and principles.
- [`product/project-brief.md`](product/project-brief.md): detailed problem, intended experience, product boundaries, and candidate technical direction.
- [`product/mvp.md`](product/mvp.md): MVP scope, non-goals, constraints, and acceptance criteria.
- [`product/reader-settings-and-playback-controls.md`](product/reader-settings-and-playback-controls.md): approved M010.2 reader-first shell, Settings, English-default, profile-visibility, persistence, and implemented six-value boundary-deferred repository-WSOLA playback requirements.
- [`product/post-mvp-tts-candidate-backlog.md`](product/post-mvp-tts-candidate-backlog.md): non-authoritative post-MVP intake order for Pocket TTS, Chatterbox LatAm, MOSS-TTS-Nano, Kokoro, and additional Piper voices.
- [`product/glossary.md`](product/glossary.md): shared terminology.

## Architecture

- [`architecture/system-diagram.md`](architecture/system-diagram.md): canonical implemented/approved component map, EPUB-to-audio flow, status legend, and maintenance conditions.
- [`architecture/overview.md`](architecture/overview.md): detailed component boundaries, invariants, implemented EPUB/reader/narration-preparation behavior, and the current TTS feasibility boundary.
- [`architecture/performance-budget.md`](architecture/performance-budget.md): latency, buffering, memory, and measurement targets.
- [`architecture/adaptive-buffer-authority-v1.md`](architecture/adaptive-buffer-authority-v1.md): frozen M008 quick/prepared/refill thresholds, simultaneous resource limits, ownership, lifecycle, volume/speed, and truthful UX authority.
- [`architecture/playback-transition-pause-policy-v1.md`](architecture/playback-transition-pause-policy-v1.md): frozen M008.1 semantic generated-unit transition mapping, eligibility, lifecycle, measurement, and privacy authority.
- [`architecture/synchronization-authority-v1.md`](architecture/synchronization-authority-v1.md): frozen M009 segment-level position, transition, highlighting, following, navigation, observation, invalidation, and persistence authority.
- [`architecture/reader-experience-authority-v1.md`](architecture/reader-experience-authority-v1.md): frozen M009.1 paint-aware highlight proof, reader scroll ownership, compact narration, text-only loaded duration, and bounded paragraph-leaf authority.
- [`architecture/reader-settings-playback-authority-v1.md`](architecture/reader-settings-playback-authority-v1.md): frozen M010.2 Milestone 1 shell, Settings, English-fallback migration, bounded preference, exact playback-rate arithmetic, backend-comparison, resource, privacy, and validation authority.
- [`architecture/reader-settings-playback-authority-v2.md`](architecture/reader-settings-playback-authority-v2.md): frozen M010.2 Milestone 2A six-rate, exact-candidate, fee-free licence, media-only CSP, lifecycle, resource, and result-lineage comparison authority.
- [`architecture/reader-settings-playback-authority-v3.md`](architecture/reader-settings-playback-authority-v3.md): frozen M010.2 Milestone 2C selected/pending/active rate state, exact boundary-deferred candidates, first-activation/recurring-handoff, resource, lifecycle, licence/CSP, listening, and strict result-lineage authority.
- [`architecture/mvp-release-authority-v1.md`](architecture/mvp-release-authority-v1.md): frozen M011 Windows/Piper core, optional Chatterbox acquisition, package topology, trust, cleanup, dependency/licence/integrity, signing, and independent release-claim authority.
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
- [`architecture/tts-feasibility-profile-v2.md`](architecture/tts-feasibility-profile-v2.md): current Milestone 6 rerun authority, including the Windows/PyTorch cross-checked VRAM method, unchanged role gates, listening rubric, and content-safe summary policy. The superseded `v1` profile remains historical evidence.
- [`architecture/tts-feasibility-profile-v3.md`](architecture/tts-feasibility-profile-v3.md): current Milestone 6.1 authority for the exact Serena CustomVoice development candidate, its prototype stop gate, inherited full evaluation, and privacy/invalidation rules.
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
- [`architecture/decisions/`](architecture/decisions/): durable architecture decisions.

## Development

- [`development/setup.md`](development/setup.md): pinned prerequisites, reproducible setup, environment boundaries, and verified commands.
- [`development/testing.md`](development/testing.md): test strategy.
- [`development/troubleshooting.md`](development/troubleshooting.md): native
  development watcher/restoration diagnostics plus content-safe exact-demo
  availability, startup, buffering, cancellation, resource, and recovery
  guidance.
- [`development/dependencies.md`](development/dependencies.md): dependency ownership, purpose, alternatives, and review policy.
- [`development/release-security-and-distribution.md`](development/release-security-and-distribution.md): current M011 security assessment, closed Piper core and optional Chatterbox dependency/audit boundary, mandatory remaining release gates, independent core/optional/public decisions, and deliberately deferred enterprise hardening.
- [`development/git-workflow.md`](development/git-workflow.md): branches, commits, and pull requests.

## Plans

- [`plans/roadmap.md`](plans/roadmap.md): high-level milestone sequence, dependencies, decision gates, and major risks.
- [`plans/active/`](plans/active/): current approved ExecPlans and retained cross-milestone context.
- [`plans/active/M011-package-validate-and-release-mvp.md`](plans/active/M011-package-validate-and-release-mvp.md): approved detailed plan for the Windows/Piper core, optional integrity-checked Chatterbox download/removal package, core/optional dependency and licence closure, clean-host validation, signing path, and independent core/optional/public release decisions.
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
- [`plans/completed/M008-001-boundary-aware-audio-transitions.md`](plans/completed/M008-001-boundary-aware-audio-transitions.md): completed focused follow-up for bounded semantic pauses between independently generated buffered units, including the packaged synchronization-probe stabilization and passing replacement CI.
- [`plans/completed/M010-hardware-profiles-fallback-and-operational-resilience.md`](plans/completed/M010-hardware-profiles-fallback-and-operational-resilience.md): completed ExecPlan for privacy-safe host detection, evidence-backed profile matching, CPU-fallback admission, identity-safe operational recovery, final support decisions, and repository/CI closeout.
- [`plans/completed/M010-001-bilingual-narration-and-candidate-screening.md`](plans/completed/M010-001-bilingual-narration-and-candidate-screening.md): completed bilingual follow-up covering evaluation, exact profile integration, packaged portfolio validation, and passing Ubuntu/Windows closeout.
- [`plans/completed/M010-002-reader-settings-and-playback-controls.md`](plans/completed/M010-002-reader-settings-and-playback-controls.md): completed pre-M011 reader-first settings and playback-control follow-up, including bounded English-default language/start/playback preferences, the reader-first Settings shell, six-rate boundary-deferred repository-WSOLA playback, the sequential six-arm portfolio, renewed human all-rate confirmation, and passing Ubuntu/Windows closeout checks.
- [`plans/active/synchronized-reader-and-startup-buffer.md`](plans/active/synchronized-reader-and-startup-buffer.md): broad historical context superseded by the completed M009 plan for synchronization work.
- [`plans/completed/`](plans/completed/): historical implementation plans.

For complex work, follow [`.agents/PLANS.md`](../.agents/PLANS.md).
