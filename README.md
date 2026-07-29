# VoxLeaf

A privacy-first desktop EPUB reader in development, designed for on-device neural text-to-speech and in-memory audio streaming.

> **Status:** pre-alpha. Roadmap Milestones 1 through 9 are complete. Milestone 6 implemented a candidate-neutral local TTS feasibility harness, and ADR-0013 records that no standard profile passed. Completed Milestone 6.2 records `selection-v5`, which rejects CPU-only and dual-worker scheduling and retains the exact Qwen3-TTS 1.7B CustomVoice/Serena GPU identity only for a constrained development demo. Completed M007 implements protocol v1, native supervision, a typed desktop client, one-unit in-memory handoff, and the exact development-only adapter. Completed M008 connects the active visual locator to bounded narration preparation, one-at-a-time synthesis, sole-owner in-memory buffering, Web Audio playback, and accessible quick/prepared controls. Completed M009 adds segment-level highlighting, focus-safe following, synchronized navigation, non-skipping heard-position persistence, and exact-host packaged validation. Exact-host evidence still exceeds the MVP buffering target, so a standard production profile, general hardware support, validated fallback and recovery, production distribution, and installers remain unimplemented.

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

Tauri, React, TypeScript, the direct semantic DOM reader, bounded WebView `localStorage` persistence, constrained Web Audio playback, and segment-level reader/narration synchronization are accepted and implemented within their documented limits. The accepted local process transport is Rust-owned child standard streams with complete bounded 24-kHz mono float32-le units returned through narrow binary Tauri responses. Native supervision, identity-first worker termination, a typed desktop client, and a one-unit memory sink are implemented and packaged-validated with a model-free Rust child. Native-only development configuration also connects that supervisor to the exact Python/Qwen/Serena service; its bounded delivery, invalidation, cancellation containment, crash, cleanup, reload, playback, and synchronization matrices pass on the exact host. The exact Qwen3-TTS 0.6B CustomVoice and Supertonic CPU-compatible profiles are rejected evaluation evidence, not selected production architecture. The 1.7B CustomVoice/Serena GPU path remains approved only for ADR-0015's constrained development demo; CPU-only and dual-worker scheduling are rejected, and Base voice cloning is outside the current MVP. OpenAI Whisper is speech recognition and is not a TTS candidate. Production profile, general hardware support, validated fallback and recovery, and distribution remain undecided.

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

### Run the native development application with Qwen3-TTS

The exact Qwen3-TTS 1.7B CustomVoice/Serena profile is a development-only
configuration. Before launching it, prepare the ignored candidate virtual
environment and local model directory described in
[`docs/development/setup.md`](docs/development/setup.md), and ensure the
administrator-created outbound-blocking firewall rule targets that exact
Python interpreter.

From the repository root, run the following commands in one PowerShell
terminal:

```powershell
$env:VOXLEAF_TTS_DEV_ENABLED = "1"
$env:VOXLEAF_TTS_DEV_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe" -ErrorAction Stop).Path
$env:VOXLEAF_TTS_DEV_MODEL_ROOT = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda" -ErrorAction Stop).Path

pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop tauri dev
```

Keep that terminal open while using the application and stop it with
`Ctrl+C`. The variables apply only to that PowerShell process. Qwen appears in
the compatibility panel only when the native development gate, exact runtime,
model files, and frozen hardware admission checks all pass. This profile is
not a supported production or real-time profile; Piper remains the supported
MVP CPU fallback.

The native executable is written to the ignored Tauri target directory. Installer bundling is intentionally disabled.

See [`docs/development/setup.md`](docs/development/setup.md) for tool versions, focused commands, Windows and WSL boundaries, and generated outputs. See [`docs/development/testing.md`](docs/development/testing.md) for current test coverage and [`docs/development/dependencies.md`](docs/development/dependencies.md) for the dependency inventory and decision rationale.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a change.

## License

MIT.
