# VoxLeaf

A privacy-first desktop EPUB reader in development, designed for on-device neural text-to-speech and in-memory audio streaming.

> **Status:** pre-alpha. Roadmap Milestones 1 through 9 are complete. M010 Milestones 1-6 are complete, and Milestone 7 has recorded its final support/recovery decision and entered closeout validation. M010 adds privacy-safe Windows host detection, immutable evidence-backed matching, compatibility and explicit profile choice, identity-safe one-attempt recovery, and the exact Piper/davefx CPU fallback. Piper is the sole supported and automatically recommendable profile when its host and native-runtime gates pass. Qwen3-TTS 1.7B CustomVoice/Serena remains an optional development-only profile; no standard GPU profile passed. M008.1 implements bounded semantic pauses between already-buffered generated units. Replacement required pull-request checks remain before M008.1 and M010 are archived. Production runtime/model distribution, Piper license fulfillment, installers, signing, updates, and complete-MVP release validation remain M011 work.

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

The canonical [system architecture diagram](docs/architecture/system-diagram.md) distinguishes implemented components, approved planned work, blocked boundaries, foundations, external systems, and deferred work. The framework-independent `@voxleaf/epub` package validates in-memory EPUB bytes and exposes safe semantic documents, bounded resources, deterministic locators, and `OpenedPublication.prepareNarration`. The desktop connects those ephemeral locator-linked prepared segments to one selected local service, sole-owner in-memory buffering, Web Audio playback, synchronized highlighting, and heard-position persistence without changing displayed text or retaining generated audio.

Tauri, React, TypeScript, the direct semantic DOM reader, bounded WebView `localStorage` persistence, constrained Web Audio playback, segment-level reader/narration synchronization, privacy-safe host matching, and explicit recovery are accepted and implemented within their documented limits. The accepted local process transport is Rust-owned child standard streams with complete bounded 24-kHz mono float32-le units returned through narrow binary Tauri responses. Native supervision selects exactly one verified isolated Qwen or Piper child. The exact Piper/davefx CPU profile passes frozen evaluation and packaged resilience evidence and is supported; Qwen3-TTS 1.7B CustomVoice/Serena remains development-only, while Qwen3-TTS 0.6B CustomVoice/Aiden and Supertonic/F1 remain unsupported. The final matrix and safety margins are recorded in [`tts-support-matrix-v1.md`](docs/architecture/tts-support-matrix-v1.md). Distribution remains undecided until M011 fulfills packaging and licensing obligations.

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
