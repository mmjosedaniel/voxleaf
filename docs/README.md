# Documentation index

Documentation is organized by purpose so contributors and Codex can load only the context needed for a task.

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

## Current project status

The [seven-finding correction plan](plans/active/seven-finding-minimal-corrections.md)
defines minimal fixes and selected validation for the latest static findings.
It distinguishes reusable preparation from historical test outcomes.
This is planning only; implementation and its acceptance remain pending.

The [completed eight-finding corrections](plans/completed/eight-finding-minimal-corrections.md)
resolve reader registration churn, optional compatibility recovery, RAM policy,
internal Unicode/control decoding and historical/development TTS boundaries.
Selected host tests, one Piper regeneration, browser/native smoke and owned
cleanup pass. Independent EFC-R2-20261030 approves implementation and scoped
current-task evidence retention; the plan records the separate archive review.
No model support promotion, frozen Chatterbox repackaging or publication occurs.

The [completed minimal audit corrections](plans/completed/minimal-audit-findings-corrections.md)
resolve eleven reader, settings, native-lifecycle, Python protocol and maintainer
findings. Directed reproductions, combined host checks, one Piper core generation,
Chromium/WebView2 and owned cleanup pass. Independent `MAF-R1-20261029` approves
implementation and scoped current-task evidence retention without findings;
the plan links the separate final archive review. No historical PASS, model
matrix, new performance/support claim or personal installer journey is claimed.

The [completed static audit follow-up](plans/completed/static-audit-follow-up.md)
resolves sixteen bounded corrections across reader, EPUB, Piper, optional-package
lifecycle and maintainer tools. Directed failures, combined host validation and
owned cleanup pass. Independent R2 approves the corrected implementation and
scoped current-task evidence reuse; the plan links the separate archive review.
No historical PASS, new support claim or personal installer journey is claimed.

The [completed revalidated audit corrections](plans/completed/revalidated-audit-corrections.md)
resolve nine reader, EPUB and maintainer-tool findings. Directed failures,
source/browser/native validation, resource cleanup and documentation checks pass.
Independent R1 approves implementation and unchanged current-task evidence;
the plan links the separate final archive review. No historical PASS, new
real-model measurement or personal installer journey is claimed.

The [completed validated-audit follow-up](plans/completed/validated-audit-follow-up.md)
corrects twelve retained reader, narration, benchmark and lifecycle findings.
Applicable combined checks, browser/native coverage, authorized Windows lifecycle
and measured personal-state restoration pass with independent R4 approval. The
plan records the final archive review and preserves the limits of its evidence.

The [completed static-audit corrections](plans/completed/static-audit-corrections.md)
resolve fifteen reader, narration, preference, native and validation-tool defects.
Regression, browser, native, CPU/GPU and installer acceptance passed, including
verified restoration of the original user data. Independent R3 approved the
implementation and scoped evidence reuse; the plan links the final archive
review. Public contracts, dependencies, runtime/model versions and frozen
authorities remain unchanged.

The [completed narration/Chatterbox corrections](plans/completed/narration-chatterbox-correctness.md)
preserve the exact final heard position, reconcile automatic compatibility with
active narration, enable explicit acquisition retry, measure the optional-data
destination's free space and retain the previous package after failed replacement.
Focused, browser, native and integrated host evidence passed with independently
approved continuation and scoped reuse; the plan retains all initial failures.

The [completed lifecycle follow-up](plans/completed/lifecycle-correctness-follow-up.md)
restores explicit narration restart after completion, protects admitted download
staging, reports residual optional uninstall data and checks termination before
package removal. Its plan records focused/integrated host evidence and independent
review; no model, dependency, public-contract or system-topology change is involved.

VoxLeaf is pre-alpha. The unsigned Windows x64 local/portfolio MVP includes
local EPUB reading, stable-locator restoration, synchronized narration and
bounded memory-only playback. Piper Spanish/English is the CPU core;
Chatterbox Spanish/English is an optional download available only after its
published live compatibility gate passes. Trusted public signing remains
pending external authorization. Qwen remains development-only and its
production completion/investigation is deferred under
[ADR-0051](architecture/decisions/ADR-0051-defer-qwen3-and-prioritize-piper-and-chatterbox.md).

Current executable identity is separate from stable profile names and historical
evaluation versions. Piper uses **1.8.0 / ONNX Runtime 1.31.0**; installed
Chatterbox selects the published **v7** runtime with frozen v3 service modules and
msgpack 1.2.3. Its [refresh plan](plans/completed/chatterbox-msgpack-security-refresh.md)
records identity-bound preparation, publication and integration evidence.
V2/v3/v5/v6 are cleanup-only; local v4 remains unpublished/unadmitted. Historical
V6 full live downloads failed twice; complete V7 live delivery is not claimed.
See the
[current support matrix](architecture/tts-support-matrix-v2.md#profile-identity-and-executable-versions).

| Contributor task                                                       | Maintained entry point                                                                                                           | Retained evidence or decision                                                                                                                                            |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Set up the workspace and select current commands                       | [Development setup](development/setup.md)                                                                                        | [Dependency inventory](development/dependencies.md)                                                                                                                      |
| Select checks for an implementation change                             | [Testing strategy](development/testing.md)                                                                                       | [Evidence retention](development/evidence-retention.md)                                                                                                                  |
| Understand runtime/maintainer boundaries and historical v2/v3/v4 tools | [TTS service organization](development/tts-service-organization.md)                                                              | [Adapter-layout campaign](plans/completed/tts-adapter-layout.md)                                                                                                         |
| Understand product support and local distribution                      | [MVP](product/mvp.md), [support matrix](architecture/tts-support-matrix-v2.md), [Windows release guide](user/windows-release.md) | [M011 closeout](plans/completed/M011-package-validate-and-release-mvp.md) and [ADR-0049](architecture/decisions/ADR-0049-use-representative-compatible-host-evidence.md) |
| Follow component ownership and milestone status                        | [Canonical system diagram](architecture/system-diagram.md), [roadmap](plans/roadmap.md)                                          | [Completed-plan index](plans/completed/README.md)                                                                                                                        |

Recent accepted work is recorded at its original checkpoint:

- [Narration logic corrections](plans/completed/narration-logic-corrections.md):
  WSOLA progression across silence, manual persistence after narration completion,
  contained compatibility changes, default CUDA admission and Celsius boundaries.
  Focused/browser/integrated checks, Piper host/listening and Chatterbox H2 passed
  with independent implementation approval and documented evidence reuse. Changes
  remain uncommitted; physical multi-GPU and HTTP acquisition are not claimed.

- [Confirmed logic and lifecycle corrections](plans/completed/confirmed-logic-bugfixes.md):
  five regression-tested fixes for NSIS detection, Pause/completion, operational
  TTS recovery, primary EPUB start and owned `.previous` cleanup. Ordinary
  interactive acceptance, restored-data integrity, Piper/Chatterbox ES/EN and
  independent implementation approval passed at closeout. The work is now in
  [PR #272](https://github.com/mmjosedaniel/voxleaf/pull/272); subsequent
  [CI and privacy](plans/evidence/confirmed-logic-bugfixes/ci-nsis-follow-up.md)
  and [dependency audit](plans/evidence/confirmed-logic-bugfixes/dependency-audit-follow-up.md)
  records distinguish follow-up validation from that historical acceptance.

- [Reader, narration and acquisition corrections](plans/completed/reader-narration-acquisition-bugfixes.md):
  eight fixes, permanent regressions and repository/browser/native/installed
  acceptance, including Piper/Chatterbox ES/EN and cancellation/cleanup faults.
- [Certifi/Pillow refresh](plans/completed/chatterbox-certifi-pillow-security-refresh.md):
  separately published v5, native admission, production audit, installed B06/B07,
  bilingual reader/speed, integrity and installer policies; independent review
  and PR #266 CI passed for integration commit `194846a` on 2026-10-21.
- [Optional-download diagnostics](plans/completed/optional-download-diagnostics.md):
  one content-free failure report in memory and explicit local JSON export.

These records include restoration and cleanup outcomes, limitations and exact
artifact identities. Their passing results are not fresh validation of HEAD.
The earlier [v3 security refresh](plans/completed/chatterbox-security-dependency-refresh.md)
retains the v2 advisory failure, v3 repair and then-passing acceptance; v5
supersedes that runtime admission without rewriting the evidence.

For the implemented reader, preparation, buffering, synchronization, profile
and playback milestones, use the roadmap and completed index rather than a
second milestone narrative here. Those records preserve rejected Qwen
standard/batch/dual-worker experiments, failed playback v1/v2 comparisons,
the selected WSOLA v3 backend and subsequent release decisions. M011 retains
its preliminary and renewed GO records, historical installer hashes and
signing limitations. The static security scan and its limits remain in the
[release security guide](development/release-security-and-distribution.md).

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

- [`development/setup.md`](development/setup.md): pinned prerequisites, reproducible setup, environment boundaries, and verified commands.
- [`development/testing.md`](development/testing.md): test strategy.
- [`development/evidence-retention.md`](development/evidence-retention.md): curated acceptance summaries and identities, local/CI raw-artifact retention, and the tested Git-index guard.
- [`development/desktop-source-organization-follow-up.md`](development/desktop-source-organization-follow-up.md): observed native-test environment fragility, Chatterbox startup latency, deferred Qwen buffering and non-blocking cache/bundle warnings; proposed follow-ups remain separate from the completed refactor.
- [`development/troubleshooting.md`](development/troubleshooting.md): native
  development watcher/restoration diagnostics plus content-safe exact-demo
  availability, startup, buffering, cancellation, resource, and recovery
  guidance.
- [`development/dependencies.md`](development/dependencies.md): dependency ownership, purpose, alternatives, and review policy.
- [`development/release-security-and-distribution.md`](development/release-security-and-distribution.md): current M011 security assessment, exact unsigned candidate identity, renewed Milestone 7 decision and exact-artifact receipts, completed 6B ordinary acquisition/release isolation, basic audit result and limitations, pending external signing, and deliberately deferred enterprise hardening.
- [`user/windows-release.md`](user/windows-release.md): current-user Windows install, repair/replacement, uninstall, checksum, signature, prerequisite, and payload-exclusion guidance for the versioned local package.
- [`development/git-workflow.md`](development/git-workflow.md): branches, commits, pull requests, and the bounded Sol Git-steward authority.
- [`development/agentic-change-review.md`](development/agentic-change-review.md): independent Astra review of feature and bug-fix behavior, regression coverage, exact-patch evidence, and correction handling.
- [`development/agentic-refactoring.md`](development/agentic-refactoring.md): bounded TypeScript/Python/Rust refactors, independent host validation, risk-based unit/batch gates, immutable evidence reuse, preparation and retry policy, and authorized Git stewardship.

## Plans

- [Eight revalidated findings: minimal corrections](plans/completed/eight-finding-minimal-corrections.md): eight accepted corrections with selected host checks and independent EFC-R2 approval. ADR-0068 aligns effective RAM policy at 7,042 MiB without changing frozen acquisition bytes.

- [Six verified audit corrections](plans/completed/six-finding-audit-corrections.md): completed bounded scene metadata, Unicode adjacency, inert table/definition projection, snapshot disclosure, loaded-duration and action/poll ordering corrections; selected host checks and independent implementation approval, with separate final archival review.

- [Documentation consistency and historical tooling](plans/completed/documentation-consistency-and-historical-tooling.md): completed current-version/tooling reconciliation and maintained-index cleanup; documentary validation and protected-history preservation recorded separately from runtime acceptance.

- [`plans/roadmap.md`](plans/roadmap.md): high-level milestone sequence, dependencies, decision gates, and major risks.
- [`plans/active/`](plans/active/): index and approved plans awaiting implementation or acceptance.
- [`plans/completed/validated-chat-findings-corrections.md`](plans/completed/validated-chat-findings-corrections.md): fourteen corrected findings and R01/R02, confirmed native/worklet races, passing final-byte host validation/integrity/cleanup and independent R3 implementation approval with scoped evidence reuse; the plan identifies the exact archive/link review.
- [Test integrity and lifecycle harness safety](plans/completed/test-integrity-and-harness-safety.md): eleven corrections completed; G1-G8, real installer lifecycle, verified user-data restoration/reinstallation and independent review pass.
- [`plans/completed/narration-state-and-optional-package-corrections.md`](plans/completed/narration-state-and-optional-package-corrections.md): accepted package-operation, availability, preference, volume, preparation-error and compatibility-status corrections; 169 focused tests and full repository/Chromium/WebView2 checks pass with independent Astra approval.
- [`plans/completed/reader-narration-bugfixes.md`](plans/completed/reader-narration-bugfixes.md): accepted fixes and permanent regressions for four startup-cancellation, playback-disposal, lazy-image and prepared-navigation defects; repository, browser/native and all six real-model arms pass with independent Astra approval.
- [`plans/completed/python-quality-validation-readability.md`](plans/completed/python-quality-validation-readability.md): private scorecard-validation helper, 15 additive public-boundary cases and four service docstring corrections; independent unit and combined Python/source gates pass. Three source/test files, 162 changed lines; closing-document acceptance is recorded separately after the content freeze.
- [`plans/completed/rust-function-readability.md`](plans/completed/rust-function-readability.md): CUDA precision derivation and nine diagnostic exit wrappers independently accepted, with error-tuple naming retained as an audited SKIP. Combined portable/full/native source gates and host preservation pass; three source/test files, 156 changed lines. Independent documentary/campaign outcomes are recorded separately after the content freeze.
- [`plans/completed/typescript-function-readability.md`](plans/completed/typescript-function-readability.md): three bounded readability improvements and two independently accepted SKIPs; unit/combined gates and host restoration passed. Five source/test files, 260 changed lines; implementation committed as `ed5227d`. TFR-04's dated reevaluation distinguishes complete async phase extraction from a smaller unimplemented synchronous alternative.
- [`plans/completed/refactor-validation-efficiency.md`](plans/completed/refactor-validation-efficiency.md): validated contributor-policy and skill alignment for focused checks, immutable evidence reuse, bounded execution and explicit integration acceptance.
- [`plans/completed/services-function-readability-ci-repair.md`](plans/completed/services-function-readability-ci-repair.md): ZIP 9.0.4 and compatible archive verification, current generated inventory, passing focused host checks and independent implementation approval; hosted CI tracked in PR #253.
- [`plans/completed/services-function-readability.md`](plans/completed/services-function-readability.md): four Python helper refactors and a separately reviewed process-identity repair in the test runner. Original artifact, combined, bilingual runtime and firewall-restoration acceptance is preserved; later CI repair is recorded separately above.
- [`plans/completed/native-rust-function-readability.md`](plans/completed/native-rust-function-readability.md): four private native helpers and seven additive tests accepted across three units; combined Rust/default/release, native, Piper/Chatterbox ES/EN, isolated packaging and installed journey pass, with original host state restored.
- [`plans/completed/desktop-ui-logic-readability.md`](plans/completed/desktop-ui-logic-readability.md): all four readability units are independently accepted, including reader benchmarks, Piper/Chatterbox Spanish/English profile switching and combined portable/full/native acceptance.
- [`plans/completed/app-restoration-derivations.md`](plans/completed/app-restoration-derivations.md): completed App restoration identity, settlement and presentation extraction with 14 pure cases and two App characterization cases; independent baseline, post-change, browser/native, portable and full host acceptance pass. Effects and resource ownership are preserved.
- [`plans/completed/apps-organization-follow-up.md`](plans/completed/apps-organization-follow-up.md): native helper extraction, publication lifecycle move and image grouping independently accepted, including the separately reviewed seek-observation repair. Combined portable/full, browser/native, reader benchmark and four Piper/Chatterbox host arms pass.
- [`plans/completed/desktop-state-subscription-hooks.md`](plans/completed/desktop-state-subscription-hooks.md): completed narration and hardware observation hooks at all four controls/Settings sites, with twelve added lifecycle/characterization cases and independent baseline, browser/native, portable and full acceptance; coordinator ownership and behavior preserved.
- [`plans/completed/app-conditional-presentation.md`](plans/completed/app-conditional-presentation.md): completed four-component App presentation extraction and typed reader-prop assembly; three characterization tests and independent browser/native/portable/full checks pass. The local EdgeDriver mismatch was corrected, original failure evidence retained, and public behavior/resource ownership preserved.
- [`plans/completed/piper-runtime-pr-218.md`](plans/completed/piper-runtime-pr-218.md): completed Piper 1.8.0 compatibility refresh and bounded Spanish/English runtime validation, preserving ONNX Runtime 1.30.0 and existing voice artifacts.
- [`plans/completed/piper-onnxruntime-pr-219.md`](plans/completed/piper-onnxruntime-pr-219.md): completed ONNX Runtime 1.30.0 compatibility refresh; its recorded Piper 1.4.2 state predates the subsequent PR #218 upgrade.
- [`plans/completed/piper-onnxruntime-pr-249.md`](plans/completed/piper-onnxruntime-pr-249.md): completed local acceptance of ONNX Runtime 1.31, telemetry controls, regenerated core package and fresh Spanish/English runtime validation; published-head CI is tracked by the PR.
- [`plans/completed/app-preference-effects-readability.md`](plans/completed/app-preference-effects-readability.md): completed startup hydration and narrator preference-presentation binding extraction; 28 App characterization and 16 module cases, independent baseline/checkpoint/post-change/portable/native acceptance, with unchanged App ownership and recorded failed attempts.
- [`plans/completed/app-hardware-effects-readability.md`](plans/completed/app-hardware-effects-readability.md): completed hardware visibility binding, five added unit/App cases, private preference types and named UI conditions; independent baseline/post-change and both aggregate gates PASS. Ownership and behavior preserved.
- [`plans/completed/app-readability.md`](plans/completed/app-readability.md): completed three-component presentation/message extraction from `App.tsx`, nine added integration cases and independent baseline/post-change/aggregate PASS. Picker identity and all lifecycle/preference ownership preserved.
- [`plans/completed/tts-adapter-layout.md`](plans/completed/tts-adapter-layout.md): completed selective `adapters/` migration, refreshed Piper and local-only Chatterbox v4; independent three-baseline/22-gate PASS, bilingual candidate/desktop acceptance, verified firewall cleanup and approved documentary closeout. The campaign preserved then-admitted v3; current v5 admission is recorded in ADR-0058. Local v4 remains unpublished/unadmitted.
- [`development/tts-service-organization.md`](development/tts-service-organization.md): implemented Python runtime/maintainer module map, helper ownership, package inclusion policies, test boundaries and validation commands.
- [`plans/completed/tts-service-organization.md`](plans/completed/tts-service-organization.md): four independently accepted Python packaging-integrity, release-authority, benchmark-corpus and quality-tooling extractions, with passing portable/native aggregate validation.
- [`plans/completed/desktop-source-organization.md`](plans/completed/desktop-source-organization.md): semantic render-plan, Web Audio and ordered CSS extractions independently accepted, including exact CSS reconstruction and combined portable/native validation. Publication and narration lifecycle ownership remain unchanged.
- [`plans/completed/pr-evidence-retention.md`](plans/completed/pr-evidence-retention.md): completed PR #229 evidence archival/cleanup, retention policy and tested CI guard, integrated in main with the native test-layout work.
- [`plans/completed/linux-rust-test-comparison.md`](plans/completed/linux-rust-test-comparison.md): completed minimal Linux compatibility repair and independent 85/86-test comparison, including both Unix symlink cases; Windows 87/88 tests and native startup pass, and the reviewed Ubuntu Rust CI job subsequently passed on source HEAD `5401f899e3ffabfc8f3e79873bc0b5fa45b11155`.
- [`plans/completed/native-rust-test-layout.md`](plans/completed/native-rust-test-layout.md): completed ten private Rust test-file moves and the existing Windows-probe extraction, preserving production ownership, test assertions, fixtures and frozen authority; independent unit and aggregate host gates passed.
- [`plans/completed/native-rust-module-organization.md`](plans/completed/native-rust-module-organization.md): completed native Rust organization with two independently accepted diagnostic extractions, ten evidence-backed SKIPs and passing portable/native aggregate checks; runtime behavior and Chatterbox's shared mutation boundary remain intact.
- [`plans/completed/bounded-settings-and-chatterbox-modularization.md`](plans/completed/bounded-settings-and-chatterbox-modularization.md): completed settings-action extraction with independent acceptance for Piper/Chatterbox in Spanish and English; native Chatterbox audit concluded SKIP. Qwen3 is deferred under ADR-0051.
- [`plans/completed/M003-001-bounded-epub2-and-ncx-compatibility.md`](plans/completed/M003-001-bounded-epub2-and-ncx-compatibility.md): completed Milestone 3.1 plan for the bounded OPF 2.0/NCX package, navigation, downstream-equivalence, and final acceptance path consumed by M011 release closeout.
- [`plans/completed/typescript-maintainability-batch-20260803.md`](plans/completed/typescript-maintainability-batch-20260803.md): completed recovery and independent-validation record for the small cross-package TypeScript/TSX maintainability batch.
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
- [`plans/completed/M011-package-validate-and-release-mvp.md`](plans/completed/M011-package-validate-and-release-mvp.md): completed Windows/Piper local-portfolio and optional-Chatterbox release plan; renewed Milestone 7 records the exact unsigned candidate's lifecycle, representative compatible-host ordinary journey, independent release decisions, and passing PR #207 checks. Public signing stays an external future action.
- [`plans/completed/`](plans/completed/): historical implementation plans.

Historical reference: [`synchronized-reader-and-startup-buffer.md`](plans/completed/synchronized-reader-and-startup-buffer.md)
is archived unchanged and superseded by focused completed milestone plans.
Incoming links point directly to its completed path.

For complex work, follow [`.agents/PLANS.md`](../.agents/PLANS.md).
