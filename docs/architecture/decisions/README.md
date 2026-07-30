# Architecture decision records

Use an ADR for a durable decision that future contributors or Codex might otherwise reverse.

## Naming

```text
ADR-0001-short-description.md
ADR-0002-short-description.md
```

## Accepted decisions

- [`ADR-0001-local-first-desktop.md`](ADR-0001-local-first-desktop.md): local-first Tauri desktop with React and TypeScript.
- [`ADR-0002-in-memory-audio.md`](ADR-0002-in-memory-audio.md): bounded in-memory generated audio.
- [`ADR-0003-stable-reading-locators.md`](ADR-0003-stable-reading-locators.md): logical locators as reading-position authority.
- [`ADR-0004-start-after-audio-lead.md`](ADR-0004-start-after-audio-lead.md): playback startup based on playable audio duration.
- [`ADR-0005-engineering-workspace-and-quality-tooling.md`](ADR-0005-engineering-workspace-and-quality-tooling.md): pnpm/uv workspace and root validation surface.
- [`ADR-0006-json-schema-contract-authority.md`](ADR-0006-json-schema-contract-authority.md): versioned JSON Schema contract authority.
- [`ADR-0007-secure-epub-ingestion-boundary.md`](ADR-0007-secure-epub-ingestion-boundary.md): bounded secure EPUB ingestion and semantic model.
- [`ADR-0008-visual-reader-architecture.md`](ADR-0008-visual-reader-architecture.md): direct semantic DOM reader, scrolling, target resolution, and active visual locator.
- [`ADR-0009-capability-free-local-file-ingress.md`](ADR-0009-capability-free-local-file-ingress.md): capability-free WebView file selection with bounded cancellable in-memory reads.
- [`ADR-0010-bounded-raster-image-decode.md`](ADR-0010-bounded-raster-image-decode.md): predecode metadata limits, static-only browser decoding, and bounded object-URL lifetime.
- [`ADR-0011-bounded-web-storage-reader-state.md`](ADR-0011-bounded-web-storage-reader-state.md): bounded Web Storage envelopes, display-preference ownership, save lifecycle, and explicit migration.
- [`ADR-0012-bounded-narration-preparation.md`](ADR-0012-bounded-narration-preparation.md): publication-owned bounded narration preparation, stable source ranges, continuation, cancellation, and closed outcomes.
- [`ADR-0013-no-viable-local-tts-engine-profile.md`](ADR-0013-no-viable-local-tts-engine-profile.md): no balanced or compatibility profile selected from the frozen v2 evaluation; the standard production profile remains blocked, while ADR-0015 permits only the exact constrained one-GPU demo exception.
- [`ADR-0014-constrained-qwen-development-demo.md`](ADR-0014-constrained-qwen-development-demo.md): historical constrained-demo decision, now superseded by ADR-0015 for scheduling and buffering.
- [`ADR-0015-bounded-adaptive-qwen-demo-buffering.md`](ADR-0015-bounded-adaptive-qwen-demo-buffering.md): retain one exact GPU worker for a bounded adaptive development demo, with quick mode default, explicit prepared playback, one-minute refill, zero default adaptive low-buffer wait, and the standard feasibility blocker retained.
- [`ADR-0016-rust-owned-stdio-tts-protocol.md`](ADR-0016-rust-owned-stdio-tts-protocol.md): Rust-owned standard-stream child supervision, complete-unit float32-le framing, internal-only IPC CSP sources, and optimized Tauri binary responses.
- [`ADR-0017-segment-level-reader-narration-synchronization.md`](ADR-0017-segment-level-reader-narration-synchronization.md): segment-level audible-position authority, CSS Custom Highlight decoration, focus-safe following, synchronized manual navigation, and non-skipping heard-progress persistence.
- [`ADR-0018-reader-experience-stabilization.md`](ADR-0018-reader-experience-stabilization.md): paint-aware highlight proof, one reader scroll owner, compact/collapsible narration, text-only loaded duration, and one bounded locator-backed leaf.
- [`ADR-0019-privacy-safe-hardware-profiles-and-recovery.md`](ADR-0019-privacy-safe-hardware-profiles-and-recovery.md): privacy-safe host facts, evidence-backed profile matching, result-blind fallback admission, and identity-first explicit recovery.
- [`ADR-0020-admit-piper-cpu-fallback.md`](ADR-0020-admit-piper-cpu-fallback.md): admit exact Piper/davefx as the speed-focused CPU fallback while retaining Qwen/Serena as an optional development-only GPU profile.
- [`ADR-0021-boundary-aware-audio-transitions.md`](ADR-0021-boundary-aware-audio-transitions.md): schedule bounded semantic pauses between independently generated buffered audio units without creating silent PCM or changing model input.
- [`ADR-0022-qwen-development-vram-admission.md`](ADR-0022-qwen-development-vram-admission.md): retain the generic total-VRAM rule while using a frozen 512-MiB available-VRAM reserve only for explicitly gated development-only GPU profiles.
- [`ADR-0023-final-m010-support-and-recovery.md`](ADR-0023-final-m010-support-and-recovery.md): accept Piper/davefx as the sole supported CPU fallback, retain Qwen/Serena as development-only, keep automatic failover disabled, and defer distribution compliance to M011.
- [`ADR-0024-freeze-bilingual-v7-authority.md`](ADR-0024-freeze-bilingual-v7-authority.md): freeze explicit bilingual product behavior and the historical v7 candidate/evaluation authority before results.
- [`ADR-0025-supersede-v7-with-local-qwen-bilingual-v8-authority.md`](ADR-0025-supersede-v7-with-local-qwen-bilingual-v8-authority.md): preserve resultless v7 and supersede it with exact local Qwen/Serena Spanish and Qwen/Aiden English v8 profiles before results.
- [`ADR-0026-correct-bilingual-candidate-decision-authority.md`](ADR-0026-correct-bilingual-candidate-decision-authority.md): treat Qwen's approximately 1.44 RTF as constrained-buffer capacity evidence, require real Chatterbox and MOSS tests, and prohibit harness-recorded candidate rejection.
- [`ADR-0027-freeze-chatterbox-cuda-v10-correction.md`](ADR-0027-freeze-chatterbox-cuda-v10-correction.md): preserve v9 MOSS evidence while freezing an exact CUDA 12.4 Chatterbox environment after the v9 CPU-wheel configuration stop.
- [`ADR-0028-freeze-chatterbox-rtx50-compatibility-v11.md`](ADR-0028-freeze-chatterbox-rtx50-compatibility-v11.md): preserve v9/v10 evidence and freeze an explicit Torch 2.9.1+cu128 compatibility screen for the exact RTX 5060 host without recording a candidate rejection.
- [`ADR-0029-advance-chatterbox-retain-qwen-defer-moss.md`](ADR-0029-advance-chatterbox-retain-qwen-defer-moss.md): advance exact Chatterbox to the next full matrix, defer MOSS without rejection, and retain Qwen Serena/Aiden as hardware-dependent constrained-buffer candidates.
- [`ADR-0030-freeze-corrective-full-evaluation-v12.md`](ADR-0030-freeze-corrective-full-evaluation-v12.md): freeze the complete Chatterbox bilingual matrix and independent Qwen language-quality controls before new result-bearing work.
- [`ADR-0031-admit-chatterbox-bilingual-and-qwen-language-profiles.md`](ADR-0031-admit-chatterbox-bilingual-and-qwen-language-profiles.md): admit Chatterbox for both languages and Qwen/Aiden English integration while retaining Qwen/Serena Spanish and explicit compatibility limits.
- [`ADR-0032-bound-chatterbox-complete-waveform-units.md`](ADR-0032-bound-chatterbox-complete-waveform-units.md): preserve bilingual normalization while giving complete-waveform Chatterbox inference a tighter measured packing profile.

## Template

```markdown
# ADR-NNNN: Decision title

## Status

Proposed | Accepted | Superseded

## Context

What problem or constraint requires a decision?

## Decision

What has been decided?

## Consequences

What becomes easier, harder, or constrained?

## Alternatives considered

What credible alternatives were evaluated?
```

Do not use ADRs for temporary implementation steps; use an ExecPlan instead.
