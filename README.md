# VoxLeaf

A privacy-first desktop EPUB reader in development, designed for on-device neural text-to-speech and in-memory audio streaming.

> **Status:** pre-alpha. Piper/davefx Spanish and Piper/joe English are supported Windows x64 CPU profiles; Chatterbox Multilingual V3 is available for Spanish/English only when the current computer passes the published Windows/CUDA/VRAM/RAM/CPU gate in Settings and native code repeats that gate before network access. M011 6B passed the representative ordinary release-locked acquisition journey, including cancellation cleanup, bilingual offline narration, restart, removal, reinstall, and Piper after removal. The `0.1.0` installer remains `unsigned-local`; its rebuilt artifact identity is recorded only in package evidence. Trusted public Windows publication is pending external signing authorization.

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

Tauri, React, TypeScript, the direct semantic DOM reader, bounded WebView `localStorage` persistence, constrained Web Audio playback, segment-level reader/narration synchronization, privacy-safe host matching, and explicit recovery are accepted and implemented within their documented limits. Native supervision selects exactly one verified isolated Piper or installed Chatterbox child in an ordinary release-locked binary; it cannot use repository/environment fallbacks or a system interpreter from `PATH`. Chatterbox Download is the canonical ordinary action only after the renderer compatibility presentation passes and native code repeats the gate before any connection. It uses six exact official model files and a three-part runtime, with explicit consent, verification, atomic promotion, cancellation cleanup, removal, and Piper recovery. Qwen remains development-only. See the [M011 ExecPlan](docs/plans/active/M011-package-validate-and-release-mvp.md) and [release security boundary](docs/development/release-security-and-distribution.md).

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

### Run the native development application with bilingual local TTS

Before launching, prepare the ignored candidate virtual environments and local
model directories described in
[`docs/development/setup.md`](docs/development/setup.md), and ensure the
administrator-created outbound-blocking firewall rules target each exact
candidate interpreter that you enable.

From the repository root, run the following commands in one PowerShell
terminal:

```powershell
$env:VOXLEAF_TTS_PIPER_ENABLED = "1"
$env:VOXLEAF_TTS_PIPER_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/piper_1_4_2_cpu/.venv/Scripts/python.exe" -ErrorAction Stop).Path
$env:VOXLEAF_TTS_PIPER_MODEL_ROOT = (Resolve-Path "models/tts/piper-1.4.2-es_ES-davefx-medium-0d907f1" -ErrorAction Stop).Path

$env:VOXLEAF_TTS_PIPER_EN_ENABLED = "1"
$env:VOXLEAF_TTS_PIPER_EN_PYTHON = $env:VOXLEAF_TTS_PIPER_PYTHON
$env:VOXLEAF_TTS_PIPER_EN_MODEL_ROOT = (Resolve-Path "models/tts/piper-1.4.2-en_US-joe-medium-0d907f1" -ErrorAction Stop).Path

$env:VOXLEAF_TTS_CHATTERBOX_ENABLED = "1"
$env:VOXLEAF_TTS_CHATTERBOX_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/.venv/Scripts/python.exe" -ErrorAction Stop).Path
$env:VOXLEAF_TTS_CHATTERBOX_MODEL_ROOT = (Resolve-Path "models/chatterbox_multilingual_v3_v2" -ErrorAction Stop).Path

$env:VOXLEAF_TTS_DEV_ENABLED = "1"
$env:VOXLEAF_TTS_DEV_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe" -ErrorAction Stop).Path
$env:VOXLEAF_TTS_DEV_MODEL_ROOT = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda" -ErrorAction Stop).Path

pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop tauri dev
```

Keep that terminal open while using the application and stop it with
`Ctrl+C`. The variables apply only to that PowerShell process. You may omit
whole three-variable groups for profiles you do not want to configure.
Compatibility remains profile- and language-specific. Qwen appears only when
the development gate, exact runtime/model files, and frozen hardware checks
pass; it is not a supported production or real-time profile. These commands
configure local development assets only and do not replace M011 packaging or
license fulfillment.

Ordinary builds write the native executable to the ignored Tauri target
directory and intentionally remain unbundled. To build the reviewed local
Windows package from normal PowerShell, run:

```powershell
pnpm.cmd package:windows:check
pnpm.cmd package:windows
```

The ignored installer is written below
`apps/desktop/src-tauri/target/release/bundle/nsis`. It is unsigned unless an
authorized maintainer uses the protected signing path, so it must not be
published as a trusted general-public download. See the
[Windows package guide](docs/user/windows-release.md).

See [`docs/development/setup.md`](docs/development/setup.md) for tool versions, focused commands, Windows and WSL boundaries, and generated outputs. See [`docs/development/testing.md`](docs/development/testing.md) for current test coverage and [`docs/development/dependencies.md`](docs/development/dependencies.md) for the dependency inventory and decision rationale.

## Contributing

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a change.

## License

MIT.
