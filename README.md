# VoxLeaf

VoxLeaf is a privacy-first desktop EPUB reader for Windows that combines a
reflowable visual reader with local, bilingual text-to-speech. Books stay on
the computer, speech is generated on the computer, and generated audio is kept
in bounded memory instead of being saved as an audiobook.

> **Status:** pre-alpha local/portfolio MVP. The current `0.1.0` Windows x64
> installer and its bundled Piper voices have passed the documented local
> release gates. Chatterbox is supported as an optional download only on
> computers that pass its live compatibility checks. The installer is still
> unsigned. Public distribution is pending authorization for Windows code
> signing.

## Demo video

[Watch the unlisted VoxLeaf 0.1.0 demo on the Cultulibre YouTube channel](https://www.youtube.com/watch?v=2CU36tmh7Fc).

The recorded portfolio walkthrough demonstrates local EPUB reading,
navigation, synchronized Spanish and English narration with Piper, optional
compatibility-gated Chatterbox narration, and the application's local privacy
boundary. It is a product demonstration, not a replacement for the repository's
automated, packaged, hardware-specific, security, or release validation
evidence. The demonstrated Windows build remains an unsigned local/portfolio
MVP rather than a trusted signed public release.

## What works today

- Open a supported local EPUB and read it in one continuous reflowable layout.
- Navigate chapters and contents without sending the publication to a remote
  service.
- Restore the exact or nearest valid logical reading position after selecting
  the same EPUB bytes again.
- Adjust the theme, text size, line spacing, content width, language, narration
  start mode, and playback speed.
- Narrate locally in Spanish or English with the bundled Piper CPU voices.
- Optionally download, verify, activate, remove, and reinstall Chatterbox for a
  generally more natural and expressive voice on compatible GPU hardware.
- Start with Quick narration or prepare a bounded 1-, 2-, 5-, or 10-minute
  playable-audio target.
- Keep the audible passage highlighted and synchronized with the reader.
- Cancel obsolete generation when narration, location, book, language, voice,
  or application state changes.
- Play at the validated `1.00x` through `0.75x` rates without persisting the
  generated audio.

## Supported publications

VoxLeaf currently supports deliberately bounded, local, reflowable profiles:

- EPUB 3 packages with XHTML navigation; and
- EPUB 2 packages in the admitted OPF 2.0/NCX compatibility profile.

Both profiles use the same safe semantic, navigation, locator, restoration,
and narration pipeline. This is not a claim of complete EPUB 2, EPUBCheck, or
general reading-system conformance. Fixed-layout publications, DRM or
encrypted content, scripts and forms, remote dependencies, media overlays,
and publisher audio or video are outside the current MVP.

See the [MVP requirements](docs/product/mvp.md) and the
[secure EPUB ingestion decision](docs/architecture/decisions/ADR-0007-secure-epub-ingestion-boundary.md)
for the complete supported-input boundary.

## Minimum and recommended requirements

The values below are the live product admission floors. They define the
supported hardware class and include the project's resource reserves; they do
not promise identical performance on every combination of hardware, Windows,
and drivers. Unknown or insufficient hardware facts fail closed.

| Requirement | Piper bilingual core | Optional Chatterbox |
| --- | --- | --- |
| Platform | 64-bit Windows on x86-64 | 64-bit Windows on x86-64 |
| CPU | At least 4 logical processors | At least 8 logical processors |
| Total RAM | At least 8,192 MiB | At least 24,576 MiB |
| RAM currently available | At least 2,460 MiB | At least 4,096 MiB |
| GPU | No discrete GPU required | Discrete NVIDIA GPU with CUDA `bfloat16` support |
| Dedicated VRAM | Not required | At least 5,632 MiB total and 4,668 MiB currently available |
| Recommended GPU class | Not applicable | Nominal 8 GB class reporting about 7,680 MiB dedicated VRAM |
| Free application-volume storage | At least 2,215 MiB | At least 20 GB (18.63 GiB) before download |
| Additional model download | None; both Piper voices are bundled | About 8.23 GB (7.67 GiB) |
| Installed optional-package storage | Not applicable | About 8.23 GB (7.66 GiB) |

The Piper values use the stricter requirements of the bundled Spanish and
English profiles so both voices are covered. Its available-RAM and storage
floors are calculated by the executable matcher from the measured English
profile plus the frozen 2,048-MiB safety reserves; they are not estimates of
the installer size. A logical processor is a hardware thread reported by
Windows, not necessarily a physical CPU core. Representative Piper use also
passed on an independent older Windows computer with 16 GB RAM and a 4-GB-VRAM
GPU; Piper did not require that GPU.

VoxLeaf requires Microsoft WebView2. The installer carries Microsoft's
bootstrapper, which may need an internet connection when a compatible WebView2
runtime is absent. Piper narration works offline after installation.
Chatterbox needs a connection only for its explicit initial acquisition or
reacquisition; verified narration then runs locally. End users do not need to
install Python, Rust, Cargo, Node.js, `uv`, `pip`, or the CUDA Toolkit. A
compatible NVIDIA driver and the hardware capabilities above remain real
Chatterbox prerequisites.

### Chatterbox resource and startup trade-offs

Chatterbox is optional. It offers a generally more natural and expressive
voice than Piper, although voice preference is subjective. Before downloading
it, consider that:

- the transfer is about 8.23 GB and installation can temporarily require about
  13.25 GB, so VoxLeaf requires at least 20 GB free before starting;
- the installed package occupies disk but does not permanently reserve RAM or
  VRAM;
- loading and inference use the GPU, VRAM, RAM, and CPU and may temporarily
  make the computer less responsive;
- representative runs used roughly 4.9 GB of process-tree RAM and 3.7 GB of
  dedicated VRAM, but those observations are not guarantees for every
  compatible computer;
- visual reading remains available, but narration and model controls may be
  temporarily unavailable during a truthful loading phase; and
- the first model load can exceed one minute. VoxLeaf reports the current phase
  and offers cancellation when the owned startup operation can still honor it,
  rather than displaying an invented percentage or fixed countdown.

Representative measurements and the distinction between minimum, measured,
and recommended resources are documented in the
[Windows package guide](docs/user/windows-release.md) and the current
[TTS support matrix](docs/architecture/tts-support-matrix-v2.md).

## Installation and current release channel

VoxLeaf `0.1.0` is packaged as a per-user NSIS installer for Windows x64. It
installs below the current user's Local App Data directory, includes the
private Piper runtime plus the Spanish davefx and English joe voices, and does
not require administrator access.

There is not yet a trusted public installer download. The current artifact is
unsigned and is approved only for controlled local or portfolio use. A public
release requires an authorized signing identity, successful signature
verification, a published matching SHA-256 checksum, and the documented
release checks. Exact artifact hashes and historical validation receipts live
in package evidence and completed plans rather than in this landing page.

Maintainers can build a new unsigned local candidate from a normal Windows
PowerShell session after completing the
[development setup](docs/development/setup.md):

```powershell
pnpm.cmd package:windows:check
pnpm.cmd package:windows
```

A rebuild has a new artifact identity and does not inherit the current
hash-bound validation receipts. It must not be described as the reviewed
candidate unless the applicable package and host journeys are renewed.

See the [Windows package guide](docs/user/windows-release.md) for installation,
repair, version replacement, Chatterbox removal, and application uninstall
behavior.

## Quick start

1. Install and open an authorized VoxLeaf package.
2. Select a supported local EPUB.
3. Use the contents and reader controls to navigate and adjust the display.
4. Open Settings and select Spanish or English plus a compatible narration
   profile. Piper is included with the application.
5. If the computer passes the Chatterbox gate, optionally review its resource
   disclosure and explicitly download and activate it.
6. Choose Quick or Prepared narration and press Play. VoxLeaf prepares bounded
   local audio and follows the audible passage in the reader.
7. Use **Cancel start** while an owned startup can still be cancelled, or
   **Stop** after playback begins.

Reading progress is represented by a stable EPUB locator rather than a page
number. Because layout changes with the viewport and typography, restoring a
book requires selecting the same exact EPUB bytes again.

## Privacy and security

- EPUB contents remain on the device.
- Text-to-speech inference runs locally.
- Generated audio is retained only in bounded memory and is not persisted by
  default.
- Logs, reports, metrics, and persisted state must not contain book text,
  derived narration text, generated audio, secrets, or private user data.
- Chatterbox acquisition downloads only the fixed, integrity-checked runtime
  and model artifacts; it does not upload or transmit book content.
- Compatibility detection and profile selection remain local.
- Test fixtures must be synthetic, self-authored, or public-domain.

VoxLeaf treats every EPUB as untrusted input and validates it before rendering
or narration. See [SECURITY.md](SECURITY.md) for the security boundary and
private vulnerability-reporting instructions. The current static review and
release controls do not replace future runtime, fuzzing, penetration, or
external security testing.

## Known limitations

- The current installer is unsigned and is not authorized for trusted public
  distribution.
- Only Windows x64 has a packaged product path; macOS and Linux installers are
  not currently supported.
- Format support is intentionally narrower than complete EPUB reading-system
  conformance.
- Chatterbox availability depends on live CUDA, VRAM, RAM, CPU, storage, and
  package-integrity checks.
- Chatterbox startup is materially slower and more resource-intensive than
  Piper.
- Qwen profiles are development-only and are not part of the distributable
  product.
- VoxLeaf is an interactive reader, not an ebook library, DRM tool, cloud
  service, mobile application, voice-cloning system, or complete-audiobook
  exporter.
- Automatic application updates and automatic TTS-engine failover are not
  implemented.

## Architecture

The Tauri desktop shell connects a React reader to a framework-independent
EPUB package, typed shared contracts, native Rust supervision, one selected
local TTS child process, bounded in-memory buffering, and Web Audio playback.
EPUB extraction, safe semantic projection, narration preparation, inference,
buffering, playback, synchronization, and persistence remain separate
responsibilities. Long-running work is identity-bound and cancellable, and at
most one local model process owns narration at a time.

The [canonical system diagram](docs/architecture/system-diagram.md) records
implemented, deferred, and external boundaries. The
[architecture overview](docs/architecture/overview.md) provides the detailed
invariants and data flow.

## Development

Windows PowerShell is the authoritative environment for the native desktop
shell. Install the pinned prerequisites in the
[development setup](docs/development/setup.md), then run from the repository
root:

```powershell
pnpm.cmd install --frozen-lockfile
uv sync --project services/tts --locked
pnpm.cmd check
```

For focused visual-reader development without native narration:

```powershell
pnpm.cmd --filter @voxleaf/desktop dev
```

The browser development shell listens only on `http://127.0.0.1:5173` and does
not provide narration or audio. Native development profiles, exact local model
paths, firewall boundaries, packaging, and validation commands are documented
in [development setup](docs/development/setup.md) and
[testing](docs/development/testing.md).

Repository areas:

- `apps/desktop`: React UI, Tauri shell, native supervision, and playback.
- `packages/epub`: secure EPUB ingestion, semantic projection, locators, and
  narration preparation.
- `packages/shared`: typed cross-process and application contracts.
- `services/tts`: local TTS services, adapters, release payloads, and
  model-evaluation tooling.
- `docs`: product, architecture, development, decisions, roadmap, and plans.

## Documentation

Start with the [documentation index](docs/README.md). Important references:

- [Project brief](docs/product/project-brief.md)
- [MVP requirements and status](docs/product/mvp.md)
- [Canonical system diagram](docs/architecture/system-diagram.md)
- [Architecture overview](docs/architecture/overview.md)
- [Current TTS support matrix](docs/architecture/tts-support-matrix-v2.md)
- [Windows package guide](docs/user/windows-release.md)
- [Release security and distribution](docs/development/release-security-and-distribution.md)
- [Development setup](docs/development/setup.md)
- [Testing strategy and evidence](docs/development/testing.md)
- [Dependency inventory and rationale](docs/development/dependencies.md)
- [Roadmap](docs/plans/roadmap.md)
- [Completed M011 packaging and release ExecPlan](docs/plans/completed/M011-package-validate-and-release-mvp.md)
- [ExecPlan format](.agents/PLANS.md)

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a change. Do not commit
copyrighted books, generated audio, model weights, secrets, or logs containing
book or user content.

## License

VoxLeaf is licensed under the [MIT License](LICENSE). Bundled and optional TTS
components retain their own licences, notices, provenance, and source-
fulfillment obligations as documented in the release inventory.
