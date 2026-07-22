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
