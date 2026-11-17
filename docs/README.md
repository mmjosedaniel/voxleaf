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

The installer in this checkout has a separate passing local lifecycle receipt.
Its full ordinary Chatterbox acquisition is unverified, and trusted public
publication remains pending. [Current Windows artifact assessment](development/release-security-and-distribution.md#current-assessment)

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

Choose the primary model in the composer. Start with Sol Medium for straightforward
edits and Sol High for bounded implementation or refactor direction. Choose Astra
High when evidence conflicts or a failure crosses owners, such as the reader,
native host and local TTS. The [role configurations](development/agentic-refactoring.md#roles)
set the models for delegated work. [OpenAI's Codex model guidance](https://learn.chatgpt.com/docs/whats-new/gpt-62-astra-sol#codex)

All acceptance runs in local PowerShell outside the sandbox. The selected route
retains independent review, evidence reuse rules and CI obligations.

| Contributor task | Maintained entry point | Retained evidence or decision |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Set up the workspace and select current commands | [Development setup](development/setup.md) | [Dependency inventory](development/dependencies.md) |
| Select checks for an implementation change | [Testing strategy](development/testing.md) | [Evidence retention](development/evidence-retention.md) |
| Understand runtime/maintainer boundaries and historical v2/v3/v4 tools | [TTS service organization](development/tts-service-organization.md) | [Adapter-layout campaign](plans/completed/tts-adapter-layout.md) |
| Prepare new official batch/dual-worker evidence | [Prospective benchmark safety v1](development/benchmark-safety-v1.md) | [ADR-0076](architecture/decisions/ADR-0076-prospective-benchmark-safety-evidence.md) |
| Operate a disposable quality session | [Benchmark operator guide](../benchmarks/tts/README.md#disposable-blinded-quality-session) | [ADR-0077](architecture/decisions/ADR-0077-exclusive-ready-quality-operations.md) |
| Check a Windows build and its validation status | [Package build and lifecycle](development/setup.md#build-the-m011-windows-package) | [Current Windows artifact assessment](development/release-security-and-distribution.md#current-assessment) |
| Understand product support and local distribution | [MVP](product/mvp.md), [support matrix](architecture/tts-support-matrix-v2.md), [Windows release guide](user/windows-release.md) | [M011 closeout](plans/completed/M011-package-validate-and-release-mvp.md) and [ADR-0049](architecture/decisions/ADR-0049-use-representative-compatible-host-evidence.md) |
| Follow component ownership and milestone status | [Canonical system diagram](architecture/system-diagram.md), [roadmap](plans/roadmap.md) | [Completed-plan index](plans/completed/README.md) |

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

The five-search plan delivered 17 corrections and the successor benchmark
contract. The authorized follow-up corrected VF-0074's saved reading position
after Stop and added VF-0082 overlap rejection. Both plans have independently
approved closeouts. [Delivery and commit links](plans/completed/README.md#completed-plans)
· [Findings registry](development/findings/registry.md)

## Product

- [Vision](product/vision.md)
- [Project brief](product/project-brief.md)
- [Mvp](product/mvp.md): Scope, constraints and acceptance.
- [Reader settings and playback controls](product/reader-settings-and-playback-controls.md)
- [Post mvp tts candidate backlog](product/post-mvp-tts-candidate-backlog.md): Non-authoritative future intake.
- [Glossary](product/glossary.md)

## Architecture

Use the component map and support matrix for current behavior. The catalogue below preserves direct references; frozen evaluation versions and historical selections are read only when the affected boundary or evidence requires them. Their linked documents own requirements, status and supersession details; an index entry is not a claim of current support.

- [System diagram](architecture/system-diagram.md): Canonical components, flows and status.
- [System diagram compact](architecture/system-diagram-compact.md): Orientation only.
- [Overview](architecture/overview.md): Detailed boundaries and invariants.
- [Performance budget](architecture/performance-budget.md)
- [Adaptive buffer authority v1](architecture/adaptive-buffer-authority-v1.md)
- [Playback transition pause policy v1](architecture/playback-transition-pause-policy-v1.md)
- [Synchronization authority v1](architecture/synchronization-authority-v1.md)
- [Reader experience authority v1](architecture/reader-experience-authority-v1.md)
- [Reader settings playback authority v1](architecture/reader-settings-playback-authority-v1.md)
- [Reader settings playback authority v2](architecture/reader-settings-playback-authority-v2.md)
- [Reader settings playback authority v3](architecture/reader-settings-playback-authority-v3.md)
- [Mvp release authority v1](architecture/mvp-release-authority-v1.md)
- [Mvp release authority v2](architecture/mvp-release-authority-v2.md)
- [ADR-0047: separate chatterbox uninstall retention](architecture/decisions/ADR-0047-separate-chatterbox-uninstall-retention.md)
- [ADR-0048: admit bounded epub2 and ncx compatibility](architecture/decisions/ADR-0048-admit-bounded-epub2-and-ncx-compatibility.md)
- [ADR-0049: use representative compatible host evidence](architecture/decisions/ADR-0049-use-representative-compatible-host-evidence.md)
- [Chatterbox official acquisition authority v2](architecture/chatterbox-official-acquisition-authority-v2.md)
- [Historical Chatterbox v5 identities](../services/tts/release/optional/chatterbox/runtime-package-evidence-v5.json); [current v7 identities](../services/tts/release/optional/chatterbox/runtime-package-evidence-v7.json). Package evidence alone does not establish installer acceptance or signing.
- [Hardware profile recovery authority v1](architecture/hardware-profile-recovery-authority-v1.md)
- [Qwen development vram admission v1](architecture/qwen-development-vram-admission-v1.md)
- [Tts support matrix v1](architecture/tts-support-matrix-v1.md): Historical M010 support scope.
- [Tts support matrix v2](architecture/tts-support-matrix-v2.md): Current executable support and limitations.
- [Bilingual narration authority v1](architecture/bilingual-narration-authority-v1.md)
- [Bilingual narration authority v2](architecture/bilingual-narration-authority-v2.md)
- [Narration normalization v1](architecture/narration-normalization-v1.md)
- [Narration normalization v2](architecture/narration-normalization-v2.md)
- [Narration preparation limits v1](architecture/narration-preparation-limits-v1.md)
- [Chatterbox narration preparation profile v1](architecture/chatterbox-narration-preparation-profile-v1.md)
- [Tts feasibility profile v2](architecture/tts-feasibility-profile-v2.md)
- [Tts feasibility profile v3](architecture/tts-feasibility-profile-v3.md)
- [Tts feasibility profile v4](architecture/tts-feasibility-profile-v4.md)
- [Tts feasibility profile v5](architecture/tts-feasibility-profile-v5.md)
- [Tts feasibility profile v6](architecture/tts-feasibility-profile-v6.md)
- [Tts feasibility profile v7](architecture/tts-feasibility-profile-v7.md)
- [Tts feasibility profile v8](architecture/tts-feasibility-profile-v8.md)
- [Tts feasibility profile v9](architecture/tts-feasibility-profile-v9.md)
- [Tts feasibility profile v10](architecture/tts-feasibility-profile-v10.md)
- [Tts feasibility profile v11](architecture/tts-feasibility-profile-v11.md)
- [Tts feasibility profile v12](architecture/tts-feasibility-profile-v12.md)
- [Selection v11](../benchmarks/tts/selection-v11.md)
- [Selection v12](../benchmarks/tts/selection-v12.md)
- [Piper narration preparation profile v1](architecture/piper-narration-preparation-profile-v1.md)
- [Piper narration preparation profile v2](architecture/piper-narration-preparation-profile-v2.md)
- [Tts profile runtime configuration availability v1](architecture/tts-profile-runtime-configuration-availability-v1.md)
- [Selection v6](../benchmarks/tts/selection-v6.md)
- [Tts service protocol v1](architecture/tts-service-protocol-v1.md)
- [Selection v5](../benchmarks/tts/selection-v5.md)
- [Selection v4](../benchmarks/tts/selection-v4.md)
- [Selection v3](../benchmarks/tts/selection-v3.md)
- [ADR-0013: no viable local tts engine profile](architecture/decisions/ADR-0013-no-viable-local-tts-engine-profile.md)
- [ADR-0015: bounded adaptive qwen demo buffering](architecture/decisions/ADR-0015-bounded-adaptive-qwen-demo-buffering.md)
- [ADR-0016: rust owned stdio tts protocol](architecture/decisions/ADR-0016-rust-owned-stdio-tts-protocol.md)
- [ADR-0017: segment level reader narration synchronization](architecture/decisions/ADR-0017-segment-level-reader-narration-synchronization.md)
- [ADR-0018: reader experience stabilization](architecture/decisions/ADR-0018-reader-experience-stabilization.md)
- [ADR-0019: privacy safe hardware profiles and recovery](architecture/decisions/ADR-0019-privacy-safe-hardware-profiles-and-recovery.md)
- [ADR-0020: admit piper cpu fallback](architecture/decisions/ADR-0020-admit-piper-cpu-fallback.md)
- [ADR-0021: boundary aware audio transitions](architecture/decisions/ADR-0021-boundary-aware-audio-transitions.md)
- [ADR-0022: qwen development vram admission](architecture/decisions/ADR-0022-qwen-development-vram-admission.md)
- [ADR-0023: final m010 support and recovery](architecture/decisions/ADR-0023-final-m010-support-and-recovery.md)
- [ADR-0024: freeze bilingual v7 authority](architecture/decisions/ADR-0024-freeze-bilingual-v7-authority.md)
- [ADR-0025: supersede v7 with local qwen bilingual v8 authority](architecture/decisions/ADR-0025-supersede-v7-with-local-qwen-bilingual-v8-authority.md)
- [ADR-0026: correct bilingual candidate decision authority](architecture/decisions/ADR-0026-correct-bilingual-candidate-decision-authority.md)
- [ADR-0027: freeze chatterbox cuda v10 correction](architecture/decisions/ADR-0027-freeze-chatterbox-cuda-v10-correction.md)
- [ADR-0028: freeze chatterbox rtx50 compatibility v11](architecture/decisions/ADR-0028-freeze-chatterbox-rtx50-compatibility-v11.md)
- [ADR-0029: advance chatterbox retain qwen defer moss](architecture/decisions/ADR-0029-advance-chatterbox-retain-qwen-defer-moss.md)
- [ADR-0030: freeze corrective full evaluation v12](architecture/decisions/ADR-0030-freeze-corrective-full-evaluation-v12.md)
- [ADR-0031: admit chatterbox bilingual and qwen language profiles](architecture/decisions/ADR-0031-admit-chatterbox-bilingual-and-qwen-language-profiles.md)
- [ADR-0032: bound chatterbox complete waveform units](architecture/decisions/ADR-0032-bound-chatterbox-complete-waveform-units.md)
- [ADR-0033: freeze reader settings and pitch preserving playback authority](architecture/decisions/ADR-0033-freeze-reader-settings-and-pitch-preserving-playback-authority.md)
- [ADR-0034: retain fixed speed after playback backend evaluation](architecture/decisions/ADR-0034-retain-fixed-speed-after-playback-backend-evaluation.md)
- [ADR-0035: reopen reduced range fee free playback evaluation](architecture/decisions/ADR-0035-reopen-reduced-range-fee-free-playback-evaluation.md)
- [ADR-0036: freeze reduced range fee free playback authority v2](architecture/decisions/ADR-0036-freeze-reduced-range-fee-free-playback-authority-v2.md)
- [ADR-0037: retain fixed speed after reduced range evaluation](architecture/decisions/ADR-0037-retain-fixed-speed-after-reduced-range-evaluation.md)
- [ADR-0038: reopen boundary deferred playback evaluation](architecture/decisions/ADR-0038-reopen-boundary-deferred-playback-evaluation.md)
- [ADR-0039: freeze boundary deferred playback authority v3](architecture/decisions/ADR-0039-freeze-boundary-deferred-playback-authority-v3.md)
- [ADR-0040: select repository wsola for boundary deferred playback](architecture/decisions/ADR-0040-select-repository-wsola-for-boundary-deferred-playback.md)
- [ADR-0044: use measured capacity for chatterbox vram admission](architecture/decisions/ADR-0044-use-measured-capacity-for-chatterbox-vram-admission.md)
- [ADR-0046: repair chatterbox runtime closure and windows path](architecture/decisions/ADR-0046-repair-chatterbox-runtime-closure-and-windows-path.md)
- [Architecture decisions](architecture/decisions/)

## Development

- [Findings workflow](development/findings/README.md): Audit scope, reconciliation and recording rules; [historical import coverage](development/findings/history-import.md).
- [Registry](development/findings/registry.md): Stable finding IDs and current dispositions.
- [Setup](development/setup.md): Environment and existing commands.
- [Testing](development/testing.md): Checks selected by affected responsibility.
- [Evidence retention](development/evidence-retention.md): Curated receipts, raw capture retention and privacy guard.
- [Desktop source organization follow up](development/desktop-source-organization-follow-up.md)
- [Troubleshooting](development/troubleshooting.md)
- [Dependencies](development/dependencies.md)
- [Tts service organization](development/tts-service-organization.md)
- [TTS benchmark operator guide](../benchmarks/tts/README.md) and [prospective evidence workflow](development/benchmark-safety-v1.md)
- [Release security and distribution](development/release-security-and-distribution.md)
- [Windows release](user/windows-release.md)
- [Git workflow](development/git-workflow.md)
- [Agentic change review](development/agentic-change-review.md): Independent feature/bug and substantive documentation review.
- [Agentic refactoring](development/agentic-refactoring.md): Bounded behavior-preserving campaigns and native navigation.

## Plans

- [Codex contributor model rollout](plans/completed/codex-model-rollout.md) records the fresh-session role checks and model comparison.
- [Four-pass findings corrections](plans/completed/four-pass-findings-corrections.md) records the accepted reader, EPUB, playback, release and benchmark fixes and their validation boundaries.
- [Agent guidance simplification](plans/completed/agent-guidance-simplification.md) records the reduced procedures, corrected guidance and final acceptance authorities.
- [Documentation consolidation and review closeout](plans/completed/documentation-consolidation-and-review-closeout.md) covers current-version guidance, delivery summaries and review closeout.
- The [roadmap](plans/roadmap.md) tracks milestones, dependencies, decision gates and major risks. The [active plans](plans/active/) record work awaiting implementation or acceptance.
- The [completed-plan index](plans/completed/) maintains delivery summaries and links to original plans, host evidence, independent reviews and subsequent corrections. This includes the rejected Qwen experiments, the playback backend comparisons and the renewed unsigned release decision. Release assessment and the scope of the static security scan are in the [release security guide](development/release-security-and-distribution.md).
- Follow the [plan rules](../.agents/PLANS.md) for complex work.

The [superseded reader and startup-buffer plan](plans/completed/synchronized-reader-and-startup-buffer.md)
remains archived. The completed index routes to the focused milestone plans
that own its implementation and validation.
