# VoxLeaf

A privacy-first desktop EPUB reader with on-device neural text-to-speech and in-memory audio streaming.

> **Status:** foundation / pre-alpha. The repository contains a reproducible development workspace and a minimal desktop shell, but no EPUB reading, narration, audio, persistence, hardware-detection, or installer behavior. The application is not yet usable as an ebook reader.

## Goal

VoxLeaf will let a user open an EPUB and listen to it without uploading the book or generated audio to an external service.

The MVP is allowed to:

- Build approximately 15 seconds of playable audio before narration starts, without imposing a fixed 15-second wall-clock wait.
- Buffer occasionally for up to 5 seconds per minute.
- Keep a bounded amount of generated audio in memory.
- Discard audio after playback instead of building a permanent audiobook file.

## Planned capabilities

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

## Candidate architecture

```text
EPUB file
    |
    v
EPUB extraction
    |
    v
Sanitized reflowable reader and stable reading locator
    |
    v
Text normalization and semantic chunking
    |
    v
Bounded generation queue
    |
    v
Local TTS inference
    |
    v
In-memory audio buffer
    |
    v
Desktop audio playback
```

The initial technical direction is:

- **Desktop:** Tauri, React, and TypeScript.
- **TTS service:** Python with a local process boundary.
- **Communication:** typed local IPC or WebSocket protocol.
- **TTS candidates:** Qwen3-TTS first, with alternatives benchmarked before a durable model decision.
- **Audio:** bounded in-memory streaming; no persistent generated audio by default.

These are candidate choices and may change through documented architecture decisions.

## Privacy principles

- Book contents remain on the device.
- TTS inference runs locally.
- Generated audio is not persisted by default.
- Logs must never contain book text.
- Test fixtures must be original, public-domain, or synthetic.
- Model weights, copyrighted books, generated audio, and secrets must not be committed.

## Repository documentation

Start with [`docs/README.md`](docs/README.md).

Important files:

- [`AGENTS.md`](AGENTS.md): durable instructions for Codex and contributors.
- [`docs/product/project-brief.md`](docs/product/project-brief.md): detailed product context and candidate technical direction.
- [`docs/product/mvp.md`](docs/product/mvp.md): MVP scope and acceptance criteria.
- [`docs/architecture/overview.md`](docs/architecture/overview.md): planned component boundaries and data flow.
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

The development server listens only on `http://127.0.0.1:5173`; stop it with `Ctrl+C`. It displays the foundation shell, not a working reader. Build all foundation artifacts, including the native Windows executable, with:

```powershell
pnpm.cmd build
```

The native executable is written to the ignored Tauri target directory. Installer bundling is intentionally disabled.

See [`docs/development/setup.md`](docs/development/setup.md) for tool versions, focused commands, Windows and WSL boundaries, and generated outputs. See [`docs/development/testing.md`](docs/development/testing.md) for current test coverage and [`docs/development/dependencies.md`](docs/development/dependencies.md) for the dependency inventory and decision rationale.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a change.

## License

MIT.
