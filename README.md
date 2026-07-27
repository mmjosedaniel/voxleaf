# VoxLeaf

A privacy-first desktop EPUB reader in development, designed for on-device neural text-to-speech and in-memory audio streaming.

> **Status:** pre-alpha. Roadmap Milestones 1 through 6.2 are complete. Milestone 6 implemented a candidate-neutral local TTS feasibility harness, and ADR-0013 records that no standard profile passed. Completed Milestone 6.2 records `selection-v5`, which rejects CPU-only and dual-worker scheduling and retains the exact Qwen3-TTS 1.7B CustomVoice/Serena GPU identity only for a constrained development demo. ADR-0015 approves planning for bounded one-GPU adaptive preparation, not a production or real-time claim. The desktop can open a supported local EPUB, render and navigate its safe reflowable content, apply bounded display preferences, and restore a validated logical reading position after exact-file reselection. The EPUB package also exposes deterministic, bounded, locator-linked narration preparation. The desktop does not call that operation, and no production TTS engine, process protocol, generated audio, playback, synchronization, general hardware profile, or installer is implemented.

## Goal

VoxLeaf will let a user open an EPUB and listen to it without uploading the book or generated audio to an external service.

The MVP is allowed to:

- Build approximately 15 seconds of playable audio before narration starts, without imposing a fixed 15-second wall-clock wait.
- Offer explicit prepared playback with a visible 1-, 2-, 5-, or 10-minute playable-audio target.
- Buffer occasionally for up to 5 seconds per minute.
- Keep at most approximately 30 minutes of generated playable audio in memory
  for the constrained demo, with simultaneous byte/count/work bounds.
- Discard audio after playback instead of building a permanent audiobook file.

## MVP capability target

- Import local EPUB files.
- Render EPUB text as a normal reflowable reader and navigate chapters and reading position.
- Reopen a book at the user's last visible reading location.
- Keep the narrated passage visible and highlighted while audio plays.
- Generate speech locally.
- Start playback before an entire chapter is synthesized.
- Pause, resume, seek, and cancel queued generation.
- Persist reading progress and preferences.
- Show model-loading and buffering status.
- Measure startup latency, real-time factor, underruns, and memory use.

## Architecture

The canonical [system architecture diagram](docs/architecture/system-diagram.md) distinguishes implemented components, work in progress, approved planned work, blocked boundaries, foundations, external systems, and deferred work. The framework-independent `@voxleaf/epub` package validates in-memory EPUB bytes and exposes safe semantic documents, bounded resources, deterministic locators, and `OpenedPublication.prepareNarration`. That implemented operation derives separate ephemeral narration text and locator-linked prepared segments without changing displayed text. The desktop consumes the publication boundary for visual reading and position restoration but does not yet connect prepared segments to TTS or playback.

Tauri, React, TypeScript, the direct semantic DOM reader, and bounded WebView `localStorage` persistence are accepted and implemented within their documented limits. A separate local Python TTS process and bounded in-memory audio remain later-roadmap directions. The exact Qwen3-TTS 0.6B CustomVoice and Supertonic CPU-compatible profiles are rejected evaluation evidence, not selected production architecture. The 1.7B CustomVoice/Serena GPU path is approved only for ADR-0015's constrained development demo; CPU-only and dual-worker scheduling are rejected, and Base voice cloning is outside the current MVP. OpenAI Whisper is speech recognition and is not a TTS candidate. Process transport, audio format, playback API, production profile, and general hardware support remain undecided.

## Privacy principles

- Book contents remain on the device.
- TTS inference runs locally.
- Generated audio is not persisted by default.
- Logs and reports must never contain book text, derived narration text, generated audio, secrets, or private user data.
- Test fixtures must be original, public-domain, or synthetic.
- Model weights, copyrighted books, generated audio, and secrets must not be committed.

## Repository documentation

Start with [`docs/README.md`](docs/README.md).

Important files:

- [`AGENTS.md`](AGENTS.md): durable instructions for Codex and contributors.
- [`docs/product/project-brief.md`](docs/product/project-brief.md): detailed product context and candidate technical direction.
- [`docs/product/mvp.md`](docs/product/mvp.md): MVP scope and acceptance criteria.
- [`docs/architecture/system-diagram.md`](docs/architecture/system-diagram.md): canonical current/approved components, boundaries, data flows, status, and maintenance rules.
- [`docs/architecture/overview.md`](docs/architecture/overview.md): detailed component boundaries, invariants, implemented reader and narration-preparation behavior, and the current TTS feasibility boundary.
- [`docs/plans/roadmap.md`](docs/plans/roadmap.md): high-level implementation sequence and technical decision gates.
- [`.agents/PLANS.md`](.agents/PLANS.md): format for longer implementation plans.
- [`.agents/skills/`](.agents/skills/): repeatable Codex workflows.

## Development

Windows PowerShell is the authoritative environment for the native shell. Install the pinned prerequisites described in [`docs/development/setup.md`](docs/development/setup.md), then run these commands from the repository root:

```powershell
pnpm.cmd install --frozen-lockfile
uv sync --project services/tts --locked
pnpm.cmd check
```

Use the browser shell for focused frontend development:

```powershell
pnpm.cmd --filter @voxleaf/desktop dev
```

The development server listens only on `http://127.0.0.1:5173`; stop it with `Ctrl+C`. It hosts the implemented visual reader for supported local EPUBs, but it does not provide narration or audio. Build all current artifacts, including the native Windows executable, with:

```powershell
pnpm.cmd build
```

The native executable is written to the ignored Tauri target directory. Installer bundling is intentionally disabled.

See [`docs/development/setup.md`](docs/development/setup.md) for tool versions, focused commands, Windows and WSL boundaries, and generated outputs. See [`docs/development/testing.md`](docs/development/testing.md) for current test coverage and [`docs/development/dependencies.md`](docs/development/dependencies.md) for the dependency inventory and decision rationale.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a change.

## License

MIT.
