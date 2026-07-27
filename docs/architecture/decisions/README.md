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
- [`ADR-0013-no-viable-local-tts-engine-profile.md`](ADR-0013-no-viable-local-tts-engine-profile.md): no balanced or compatibility profile selected from the frozen v2 evaluation; Milestone 7 remains blocked pending a new candidate cycle.
- [`ADR-0014-constrained-qwen-development-demo.md`](ADR-0014-constrained-qwen-development-demo.md): historical constrained-demo decision, now superseded by ADR-0015 for scheduling and buffering.
- [`ADR-0015-bounded-adaptive-qwen-demo-buffering.md`](ADR-0015-bounded-adaptive-qwen-demo-buffering.md): retain one exact GPU worker for a bounded adaptive development demo while rejecting CPU-only and dual-worker scheduling and retaining the standard feasibility blocker.

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
