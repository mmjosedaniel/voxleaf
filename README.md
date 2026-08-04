# VoxLeaf

A privacy-first desktop EPUB reader in development, designed for on-device neural text-to-speech and in-memory audio streaming.

> **Status:** pre-alpha. Roadmap Milestones 1 through 10.2, M008.1, and M009.1 are complete. M010.2 implements the reader-first Settings shell, English-default bounded preferences, and repository-owned pitch-preserving playback at `1.00x` through `0.75x`. Its six-arm packaged portfolio, repository checks, renewed human all-rate confirmation, and pull request #170 Ubuntu/Windows checks pass. Piper/davefx Spanish and Piper/joe English are supported Windows x64 CPU profiles; Chatterbox Multilingual V3 is a supported Spanish/English GPU profile on systems that pass its published CUDA/VRAM/RAM/CPU gate; and Qwen3-TTS Serena/Spanish plus Aiden/English remain gated development-only profiles. M011's preliminary Milestone 7 record accepts GO for the Piper local/portfolio core and conditional GO for Chatterbox using representative compatible-host evidence rather than an impossible test of every PC. Planned Milestone 6B now owns compatibility-gated ordinary Chatterbox acquisition, truthful quality/resource disclosure, and a release build that cannot use repository-development fallbacks. Version `0.1.0` has an exact unsigned local Windows x64/Piper portfolio candidate. The current ordinary Chatterbox manifest remains withheld until 6B passes, and trusted public Windows publication remains pending external signing authorization.

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

Tauri, React, TypeScript, the direct semantic DOM reader, bounded WebView `localStorage` persistence, constrained Web Audio playback, segment-level reader/narration synchronization, privacy-safe host matching, and explicit recovery are accepted and implemented within their documented limits. The accepted local process transport is Rust-owned child standard streams with complete bounded 24-kHz mono float32-le units returned through narrow binary Tauri responses. Native supervision selects exactly one verified isolated Piper, Chatterbox, or Qwen child for the selected language. Piper/davefx Spanish and Piper/joe English are supported CPU profiles on compatible Windows x64 systems without a GPU requirement. Chatterbox Spanish/English is supported when its published Windows/CUDA/VRAM/RAM/CPU gate passes. Qwen Serena/Spanish and Aiden/English remain development-only constrained-buffer choices, while historical Qwen 0.6B/Aiden and Supertonic/F1 remain unsupported. The current matrix is recorded in [`tts-support-matrix-v2.md`](docs/architecture/tts-support-matrix-v2.md). M011 keeps Piper Spanish/English in the intended baseline core and implements Chatterbox's explicit integrity-checked removable acquisition boundary using six exact official model files plus a reproducible three-part runtime. The current ordinary optional manifest remains withheld, so runtime support does not yet expose Download in the normal build; Qwen stays outside the first distributable product. M011 Milestone 6B plans to enable that action only after the live gate passes, compile development fallbacks out of the release, and validate the ordinary installed journey without uninstalling host development tools. The exact Piper core is integrated into the versioned local NSIS portfolio package. Milestone 7 will record the functional/local and ordinary-channel decisions again after 6B, independently from the externally pending signed-public channel. See the [M011 ExecPlan](docs/plans/active/M011-package-validate-and-release-mvp.md), [support and release evidence authority v2](docs/architecture/mvp-release-authority-v2.md), and [release security boundary](docs/development/release-security-and-distribution.md).

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
