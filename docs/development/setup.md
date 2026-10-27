# Development setup

V6 integration is accepted under the revised evidence boundary in the
[completed security refresh](../plans/completed/chatterbox-filelock-setuptools-security-refresh.md):
exact local artifact admission, current installed/runtime gates and scoped reuse.
Full live acquisition failed twice; its cause remains unresolved. No complete
v6 live-delivery pass is claimed.

## Current status

The workspace implements the local EPUB reader, bounded restoration and
narration preparation, native TTS supervision, synchronized memory-only audio,
and reader/settings/playback controls. Current product support is Piper
Spanish/English on CPU and Chatterbox Spanish/English on compatible Windows
hosts. Qwen remains explicitly gated development-only; its production work is
deferred. Use the [support matrix](../architecture/tts-support-matrix-v2.md)
and [roadmap](../plans/roadmap.md) for support and milestone decisions.

Current Piper execution uses the release core with Piper 1.8.0 and ONNX Runtime
1.31.0. The accepted v6 runtime replaces v5; older v2/v3/v5 roots are cleanup-only
and local v4 is unadmitted. Stable profile IDs and model-directory names may
contain older version labels; they are not selectors for executable dependency
versions. The [dependency inventory](dependencies.md) separates current locks
from frozen evaluation environments. Development configuration below remains
distinct from the ordinary release, which excludes development fallbacks.

Quick playback starts when approximately 15 seconds of playable audio is ready,
not after a fixed wall-clock delay. Prepared playback is explicit and initially
selects one minute; refill is one minute and low water is 10 seconds. The
30-minute buffer ceiling is not a startup target or uninterrupted-playback
promise. The throughput-oriented adaptive wait remains disabled. Separate
semantic transition pauses apply between eligible already-buffered units.
M010.2 provides six boundary-deferred playback rates from 1.00x to 0.75x.
Passive scrolling does not seek; explicit navigation invalidates obsolete work.

The unsigned Windows x64 local/portfolio installer contains the verified Piper
core; optional Chatterbox Download requires both renderer and native live gates.
Trusted public signing remains pending external authorization. See the
[Windows package instructions](#build-the-m011-windows-package) below and
[release security boundary](release-security-and-distribution.md).

Historical implementation results, including failed standard Qwen, batch and
dual-worker trials, remain in the [completed-plan index](../plans/completed/README.md),
[Qwen selection v3](../../benchmarks/tts/selection-v3.md),
[batch selection v4](../../benchmarks/tts/selection-v4.md) and
[dual-worker selection v5](../../benchmarks/tts/selection-v5.md).
The [M010.2 plan](../plans/completed/M010-002-reader-settings-and-playback-controls.md)
retains rejected playback v1/v2 comparisons and the accepted WSOLA v3 result.
These are dated evidence, not current setup prerequisites or new host validation.

Use [troubleshooting](troubleshooting.md) for content-safe failure and recovery.
Do not enable a fake child, remove required development outbound blocks, persist
ordinary audio, start a second model worker or add automatic retry to work
around unavailable controls or buffering.

## Prerequisite version matrix

The selected versions establish a reproducible foundation with the reviewed low-level EPUB ZIP/XML dependencies and the narrow official Tauri invoke API used by the model-free M007 probe, but without selecting renderer, audio-player, or TTS-model dependencies.

| Prerequisite             | Selected version or policy                                                       | Minimum supported version                                          | Verified Windows state                         |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| Windows development host | Native 64-bit Windows; current host is 25H2 build `26200.8875`                   | Windows 10 version 1803, 64-bit                                    | Satisfied                                      |
| Node.js                  | `24.18.0` LTS, pinned in `.nvmrc`                                                | `22.22.2` on Node 22 or `24.15.0` on Node 24; see `engines.node`   | `v24.18.0`                                     |
| Package manager          | pnpm `11.15.1`, pinned by `packageManager` and `engines.pnpm` in `package.json`  | Exactly `11.15.1` for reproducible installs                        | `11.15.1`                                      |
| Rust compiler            | Rust `1.97.1`, MSVC host, pinned in `rust-toolchain.toml`                        | `1.77.2`, the Tauri 2 baseline                                     | `rustc 1.97.1`                                 |
| Cargo                    | Cargo bundled with pinned Rust `1.97.1`                                          | Cargo bundled with Rust `1.77.2`                                   | `cargo 1.97.1`                                 |
| Python                   | CPython `3.12.10`, pinned in `.python-version`                                   | Python `3.12`; use the pinned patch release                        | `Python 3.12.10`                               |
| Python project manager   | uv `0.11.29`, pinned in setup and CI                                             | Exactly `0.11.29` for reproducible lock and environment behavior   | `uv 0.11.29`                                   |
| C++ build tools          | Visual Studio Build Tools 2022 `17.14.36`, Desktop development with C++ workload | Visual Studio Build Tools 2022 with x64/x86 MSVC and a Windows SDK | MSVC `14.44.35207`; Windows SDK `10.0.26100.0` |
| WebView                  | Automatically updated Evergreen WebView2 Runtime; do not pin a runtime patch     | WebView2 Runtime `86.0.616.0`                                      | Evergreen `150.0.4078.83`                      |

### Selection rationale

- [Tauri's Windows prerequisites](https://v2.tauri.app/start/prerequisites/) require Microsoft C++ Build Tools, WebView2, Rust with an MSVC host, and an LTS Node.js release for a JavaScript frontend.
- [Vite requires Node.js 20.19+ or 22.12+](https://vite.dev/guide/), but the locked `jsdom@30.1.3` test environment requires at least Node `22.22.2` or `24.15.0` on the supported LTS lines. VoxLeaf therefore declares `^22.22.2 || ^24.15.0` and keeps `.nvmrc` and CI pinned to `24.18.0`. Node 20 is end-of-life. The [Node.js release policy](https://nodejs.org/en/about/previous-releases) recommends production applications use maintained LTS releases.
- [pnpm 11 requires Node.js 22 or newer](https://pnpm.io/installation#compatibility). VoxLeaf pins one exact pnpm release so different package-manager versions cannot produce different lock data.
- [Tauri 2's official plugins](https://github.com/tauri-apps/plugins-workspace#readme) establish Rust `1.77.2` as the baseline. VoxLeaf pins [the current stable Rust release](https://blog.rust-lang.org/releases/) instead of relying on a moving `stable` channel. Cargo is installed and selected with that Rust toolchain.
- Python `3.12.10` is the last Python 3.12 maintenance release with an official Windows installer. Python 3.12 remains within [PyTorch's supported Windows range](https://pytorch.org/get-started/locally/), while the exact TTS-model compatibility decision remains deferred.
- Microsoft recommends the Evergreen runtime for released WebView2 applications. The [minimum runtime capable of loading WebView2 is `86.0.616.0`](https://learn.microsoft.com/en-us/microsoft-edge/webview2/release-notes/about), but VoxLeaf must test against automatic Evergreen updates rather than assume one observed patch is permanent.
- The [Visual Studio Desktop development with C++ workload](https://learn.microsoft.com/en-us/visualstudio/install/workload-component-id-vs-build-tools?view=vs-2022) supplies MSVC and a Windows SDK required by the native Rust target.

The Windows 10 version 1803 minimum is a development compatibility floor derived from the combined Rust, Tauri, and bundled-WebView prerequisites; it is not yet the final end-user operating-system support policy. That product support decision must account for Microsoft lifecycle and packaging tests before release.

### Installed Windows prerequisites

The following commands were executed successfully from a Windows environment with the post-install user and machine `PATH`. Open a new PowerShell terminal after installing or changing these tools so it receives the updated `PATH`.

```powershell
node --version
pnpm.cmd --version
rustc --version
cargo --version
python --version
uv --version
```

Expected selected versions are `v24.18.0`, `11.15.1`, `rustc 1.97.1`, `cargo 1.97.1`, `Python 3.12.10`, and `uv 0.11.29`. Rust must report the `x86_64-pc-windows-msvc` toolchain when running `rustup show active-toolchain`.

Install the selected uv release with its official version-specific installer, then open a new PowerShell terminal so the updated user `PATH` is available:

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://astral.sh/uv/0.11.29/install.ps1 | iex"
```

The repository-root `.python-version` selects CPython `3.12.10`. uv creates `services/tts/.venv` from that declaration; the environment is ignored and must not be shared with WSL. The committed `services/tts/uv.lock` is the reproducible dependency source. Do not install project tools globally or add a parallel requirements file.

WebView2 Evergreen, Visual Studio Build Tools, MSVC, and the Windows SDK are native prerequisites rather than repository-managed dependencies. Their observed versions belong in the matrix, but automatic security and servicing updates may advance them. Re-run native validation after such updates.

Native Rust compilation executes unsigned build scripts and procedural macro libraries generated under Cargo's target directory. An enforced Windows Application Control or Smart App Control policy may reject those intermediates with operating-system error `4551`; moving the target directory does not remove the signing requirement. Use an approved developer environment or an authorized policy configuration, and do not weaken an organization-managed policy without administrator approval.

## Windows and WSL environment boundary

### Canonical Windows environment

Windows is the canonical environment for native Tauri development and validation. Native desktop setup, development, testing, and packaging must run from Windows because the shipped application targets Windows and depends on Windows-specific tooling and runtime behavior.

The pinned toolchains and installed native prerequisites are recorded above. The browser development server, focused quality commands, aggregate root checks, and native production build documented below are verified. A native hot-reload workflow is not required foundation evidence; use the browser development server for focused UI work and the authoritative native build for shell validation.

### Optional WSL environment

The maintainer uses WSL Ubuntu for Git and terminal work, documentation, and
isolated platform-independent checks. During historical final Milestone 1
validation, the Codex Windows context could not enumerate the distribution;
that record contained no locally validated WSL project command. The 2026-10-10
[Linux Rust repair comparison](../plans/evidence/linux-rust-test-repair/README.md)
supersedes that limitation for its exact isolated WSL Ubuntu 24.04.3 snapshots:
both comparison arms pass 85 default/86 release-locked tests, including both
Unix symlink tests. Windows separately passes 87/88 tests and native startup.
The `Ubuntu portable foundation` job still runs only `pnpm check:portable`;
the separate `Ubuntu Rust foundation` job subsequently passed on source HEAD
`5401f899e3ffabfc8f3e79873bc0b5fa45b11155`, as recorded in that comparison.
This historical result is not a current CI run.

For bounded Linux Rust checks, use an isolated Linux working directory with
Node 24.18.0 from `.nvmrc`, pnpm 11.15.1, and Rust 1.97.1. From the repository
root, these Bash commands install the
[official Tauri Linux prerequisites](https://v2.tauri.app/start/prerequisites/#linux)
plus `pkg-config`, install locked JavaScript dependencies without lifecycle
scripts, and run the three configured Rust checks:

```bash
sudo apt-get update
sudo apt-get install -y --no-install-recommends \
  libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev \
  libssl-dev libayatana-appindicator3-dev librsvg2-dev pkg-config
corepack enable
corepack prepare pnpm@11.15.1 --activate
rustup toolchain install 1.97.1 --profile minimal --component rustfmt,clippy
rustup show active-toolchain
pnpm install --frozen-lockfile --ignore-scripts
export CARGO_BUILD_JOBS=2
pnpm format:check:rust
pnpm lint:rust
pnpm test:rust
```

This comparison validates native Rust checks in that environment; Linux
desktop distribution, packaged WebView, and model support remain outside scope.

WSL is not an authoritative substitute for native Windows Tauri builds, packaging, Windows permissions, filesystem behavior, or desktop runtime validation. A check passing in WSL does not satisfy a task that requires native Windows validation.

### Working trees and generated artifacts

The safest arrangement is a Windows clone for native application work and a separate WSL clone stored in the WSL Linux filesystem. Separate Git worktrees are also acceptable when each environment has its own working directory, both Git clients can resolve the worktree paths, and generated artifacts remain isolated. Do not alternate Windows Git and WSL Git in the same working tree without first checking that the tree is clean.

Share tracked source files and lockfiles through Git, not generated directories. Each environment must create and use its own:

- JavaScript dependency directory, such as `node_modules/`.
- Python virtual environment, such as `.venv/`.
- Rust build output and target-specific artifacts, such as `target/` or a Tauri-specific target directory.
- Application build, distribution, cache, and test-output directories.

Do not copy or reuse these directories between Windows and WSL. If a working tree changes environments, regenerate artifacts using the repository's documented locked installation commands.

### Paths and line endings

- Use repository-relative paths in tracked configuration and documentation. Do not commit developer-specific Windows or WSL absolute paths.
- Keep tracked text as UTF-8 with LF line endings, as required by `.editorconfig`.
- Configure each Git client consistently with the repository's LF policy. In particular, avoid combining a Windows Git configuration that rewrites line endings with WSL Git in the same working tree.
- Before changing environments, run `git status --short`. If files unexpectedly appear modified, inspect them before editing or discarding anything; `git diff --ignore-space-at-eol` can help identify line-ending-only differences.
- Use native path syntax in local commands: Windows paths in PowerShell and Linux paths inside WSL. Do not pass generated-environment paths from one environment to the other.

### Recording future commands

When project commands are introduced, record the required shell, working directory, and supported environment for each command. Document separate PowerShell and WSL forms only when both have been executed successfully. Native Windows validation remains required even when a portable check also runs in WSL.

## Reproduce the foundation

1. Use a native Windows clone for authoritative desktop work.
2. Install the selected prerequisites and open a new PowerShell terminal so their updated `PATH` is visible.
3. Confirm the versions with the commands under **Installed Windows prerequisites**.
4. Install JavaScript and Python dependencies from committed lock data:

   ```powershell
   pnpm.cmd install --frozen-lockfile
   uv sync --project services/tts --locked
   ```

5. Install the Playwright-managed Chromium once from a networked terminal, then run its separate smoke test:

   ```powershell
   pnpm.cmd test:browser:install
   pnpm.cmd test:browser
   ```

6. Run `pnpm.cmd check` before review. It is the same aggregate command used by authoritative Windows CI.
7. Use the focused commands below when diagnosing one ecosystem.

Cargo resolves the native shell from its committed `apps/desktop/src-tauri/Cargo.lock` during the relevant root command; it does not need a separate install command.

## Setup principles

- Prefer reproducible version declarations.
- Keep model weights outside Git.
- Document CUDA, driver, Python, Rust, Node.js, and package-manager requirements.
- Provide a CPU-safe diagnostic path even when full inference requires a GPU.
- Avoid environment variables until configuration is actually needed.
- Add `.env.example` only when there are real non-secret variables to document.

## Commands

Run the following verified commands from the repository root in native Windows PowerShell. Cargo must be discoverable on `PATH`; open a fresh terminal after installing rustup if it is not.

```powershell
pnpm.cmd install --frozen-lockfile
uv sync --project services/tts --locked
pnpm.cmd --filter @voxleaf/desktop dev
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop tauri dev
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd test:browser:install
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd benchmark:reader
pnpm.cmd benchmark:reader:native
pnpm.cmd --filter @voxleaf/desktop build
cargo fmt --check --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm.cmd --filter @voxleaf/desktop tauri build
uv run --project services/tts --locked ruff format --check services/tts
uv run --project services/tts --locked ruff check services/tts
uv run --directory services/tts --locked mypy .
uv run --project services/tts --locked pytest services/tts
uv build services/tts
```

`pnpm.cmd --filter @voxleaf/desktop dev` starts the browser-only Vite
development server on `http://127.0.0.1:5173`; it was verified with a
successful local HTTP response. Stop it with `Ctrl+C`. It does not exercise the
native Tauri runtime.

For an optional native development loop, build the workspace packages and then
start Tauri from the repository root:

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop tauri dev
```

Vite deliberately ignores `apps/desktop/src-tauri/**`. Tauri and Cargo retain
ownership of the native source/build watch, while Vite watches the renderer.
This prevents Node's Windows watcher from trying to inspect a locked
`target/debug/deps/voxleaf_desktop.exe` and terminating `beforeDevCommand` with
`EBUSY`. Rust changes remain handled by Tauri's native watcher.

`pnpm.cmd test:native-startup` performs the authoritative packaged startup/CSP
regression: it builds the release executable, runs the content-free supervisor
host matrix, launches an isolated disposable WebView2 profile, verifies
root/main mount, invokes both the low-level protocol probe and typed model-free
service lifecycle, proves bounded binary delivery and cancellation, runs the
disposable-file
reselection/cancellation/replacement/exact/max-plus-one/recovery matrix, opens
the deterministic comprehensive EPUB fixture, decodes its repository-authored
PNG from an application-created Blob URL, proves keyboard/focus and
restart/restoration behavior, closes the publication, observes zero
page/console errors and external requests, and removes its temporary data. It
requires native Windows but does not require the Playwright-managed Chromium
download.

For a content-free native diagnostic that isolates the release parent/child
standard-stream boundary from WebDriver, build the release executable and run:

```powershell
& "apps/desktop/src-tauri/target/release/voxleaf-desktop.exe" --voxleaf-tts-protocol-probe-host
```

Exit code zero proves only the frozen synthetic frame exchange and validation;
it does not prove WebView delivery, the Python service, model loading, or real
audio. The hidden child/host switches are test diagnostics rather than user
features. To isolate the production-shaped model-free supervisor lifecycle,
including normal generation, cancellation, crash followed by explicit
restart, shutdown, and Windows descendant cleanup, run:

```powershell
& "apps/desktop/src-tauri/target/release/voxleaf-desktop.exe" --voxleaf-tts-service-supervisor-host
```

Exit code zero does not prove the Python service, Qwen, product playback, or
general hardware support.

M010 and M010.1 Milestone 6 accept the exact admitted local profiles through
separate native-only configurations. Each interpreter must resolve to its
ignored locked environment (the current release core for Piper, frozen candidate
environments for the other engines), each model root must contain only the
frozen exact artifacts, and an enabled outbound firewall rule must target
every configured interpreter:

```powershell
$env:VOXLEAF_TTS_PIPER_ENABLED = "1"
uv sync --project services/tts/release/core --locked --no-dev --reinstall-package voxleaf-tts
$env:VOXLEAF_TTS_PIPER_PYTHON = (Resolve-Path "services/tts/release/core/.venv/Scripts/python.exe").Path
$env:VOXLEAF_TTS_PIPER_MODEL_ROOT = (Resolve-Path "models/tts/piper-1.4.2-es_ES-davefx-medium-0d907f1").Path

$env:VOXLEAF_TTS_PIPER_EN_ENABLED = "1"
$env:VOXLEAF_TTS_PIPER_EN_PYTHON = $env:VOXLEAF_TTS_PIPER_PYTHON
$env:VOXLEAF_TTS_PIPER_EN_MODEL_ROOT = (Resolve-Path "models/tts/piper-1.4.2-en_US-joe-medium-0d907f1").Path

$env:VOXLEAF_TTS_CHATTERBOX_ENABLED = "1"
$env:VOXLEAF_TTS_CHATTERBOX_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/.venv/Scripts/python.exe").Path
$env:VOXLEAF_TTS_CHATTERBOX_MODEL_ROOT = (Resolve-Path "models/chatterbox_multilingual_v3_v2").Path

$env:VOXLEAF_TTS_DEV_ENABLED = "1"
$env:VOXLEAF_TTS_DEV_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe").Path
$env:VOXLEAF_TTS_DEV_MODEL_ROOT = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
```

PowerShell environment values belong to the current terminal process. Set the
complete three-value group for every profile you enable in the same terminal
that launches `tauri dev`, the packaged application, or an exact-host test. A
new terminal does not inherit values set in an older terminal. VoxLeaf
separately checks hardware fit and exact runtime configuration; hardware
compatibility alone does not enable Play.

These variables are development inputs, not end-user prerequisites. The current
supervisor checks explicit enablement and exact repository paths rather than an
arbitrary Python on `PATH`; packaged runtimes use their own absolute private
interpreter. Milestone 6B compiles these fallback branches out of the ordinary
release, so its installed-package proof can run on this same
computer without uninstalling Python, Rust, Cargo, Node.js, or model-development
environments.

These values remain native-only and are never returned to the renderer,
logged, persisted, or placed in protocol frames. Both Piper voices use the
same bounded `narration-piper-v2` segment policy; the English path composes it
with the engine-neutral bilingual normalizer. Chatterbox and Qwen use the
engine-neutral bilingual segments and language-bound adapters. No user-facing
chunk setting is required, and protocol v1's 20-second unit ceiling is
unchanged.

When every exact profile and interpreter-bound outbound block is prepared,
run the M010.1 service-only bilingual matrix:

```powershell
pnpm.cmd test:tts:bilingual-profiles-exact-host
```

For the reader/acquisition correction candidate, the narrower registered command
`pnpm run test:tts:reader-corrections-host` builds the native application and
exercises only Piper ES/EN and Chatterbox ES/EN sequentially. Set their complete
environment groups above and `HF_HUB_OFFLINE=1` / `TRANSFORMERS_OFFLINE=1`,
verify interpreter-bound outbound block rules, and keep other GPU/model tests
idle. It adds saved 0.75x startup with deterministically deferred WebView2
worklet initialization, Pause, delayed resolution, Resume and context cleanup
before the existing speed/navigation/cancellation matrix. The controlled hold
is explicitly included in its timing; it is not a model-latency benchmark.
This command does not replace the ordinary installed acquisition journey.

The broader bilingual command above includes these six arms:
Piper davefx/Spanish, Piper joe/English, Chatterbox/Spanish,
Chatterbox/English, Qwen Serena/Spanish, and Qwen Aiden/English. Each arm
proves load/warmup, bounded generation, busy rejection, identity-first
cancellation, clean reload, a second generation, shutdown, and cleanup. It
starts only one model process at a time, retains no generated audio, emits only
a fixed content-safe result, and is excluded from root checks and CI. It is
service integration evidence; the separate command below is the passing
packaged EPUB portfolio proof.

After the service-only matrix passes, run the Milestone 7 packaged bilingual
portfolio validation from the same offline PowerShell process:

```powershell
$env:HF_HUB_OFFLINE = "1"
$env:TRANSFORMERS_OFFLINE = "1"
pnpm.cmd test:tts:bilingual-portfolio-exact-host
```

The command fails before building or inference when any exact configuration or
interpreter-bound outbound block is absent. It runs the general synthetic
native lifecycle proof and then the six disposable Spanish/English EPUB arms
sequentially, loading only one model process at a time. Output is limited to
content-free timing, underrun, intentional-transition, resource,
synchronization, and cleanup observations. The command retains no generated
audio or private book content and remains excluded from normal checks and CI.

The earlier M010 two-profile resilience matrix remains available:

```powershell
pnpm.cmd test:tts:resilience-exact-host
```

That command builds the release application and runs the Qwen and Piper
service-only lifecycle arms. It then runs full packaged Piper playback. Qwen
runs full packaged playback when the exact native gate, `7,196`-MiB total
VRAM, and `6,508`-MiB available-VRAM development reserve pass. Otherwise the
matrix accepts only the closed `available-dedicated-vram` rejection, verifies
no model start or external request, and continues. It proves profiles
separately and does not average their performance. Qwen is development-only;
its current full packaged matrix is known to stop at the depletion
synchronization assertion. The command requires administrator-created
outbound firewall rules for both exact interpreters and is excluded from root
checks and CI.

M007 Milestone 4 consumes the frozen native-only development keys only when
`VOXLEAF_TTS_DEV_ENABLED` is exactly `1`. The interpreter must resolve to the
checked-in candidate project's ignored `.venv`, the model root must be an
absolute existing ignored directory, and the enabled outbound firewall rule
must target that exact interpreter. Rust resolves these paths, byte-verifies
the unchanged candidate lock, and never exposes or logs their values. With the
candidate environment, exact local model artifacts, and firewall rule already
prepared, run the reviewed hardware diagnostic from the repository root:

```powershell
$env:VOXLEAF_TTS_DEV_ENABLED = "1"
$env:VOXLEAF_TTS_DEV_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe").Path
$env:VOXLEAF_TTS_DEV_MODEL_ROOT = (Resolve-Path "models/qwen3_1_7b_customvoice_cuda").Path
pnpm.cmd test:tts:exact-host
```

The command builds the release application and emits only a fixed pass/fail
line. A pass proves the exact constrained host's load/warm, bounded complete
unit, busy rejection, identity-first termination, zero returned stale audio,
clean reload, and shutdown path. It does not prove product narration,
playback, sustainable throughput, production packaging, or general hardware
support. Default development, portable checks, CI, and the existing visual
reader remain model-free when the keys are absent.

The frozen Milestone 5 handoff matrix uses the same three keys and firewall
rule. It is hardware-specific, excluded from root checks and CI, and must be
run only from a clean exact-host state:

```powershell
pnpm.cmd test:tts:handoff-host
```

The command builds the release application and emits one schema-validated,
content-safe JSON result. It exercises the nine frozen cold/warm, backpressure,
invalidation, cancellation, crash, and exit cases without retries while
sampling descendant RAM, dedicated/shared GPU memory, cleanup, listeners, and
external connections. It never writes generated audio. A pass is constrained
host evidence only; it does not approve production playback or generalize to
other hardware.

The M008 Milestone 5 packaged adaptive-demo matrix uses the same exact
configuration and firewall rule:

```powershell
pnpm.cmd test:tts:adaptive-exact-host
```

It creates a disposable synthetic Spanish EPUB, starts narration through the
production React/coordinator/client/player path, and validates quick start,
depletion and truthful buffering, exact audible highlighting/following,
keyboard pause/resume, passage seek, chapter restart, stale suppression,
active cancellation, a one-minute prepared run, acceptance of the
1/2/5/10-minute choices, bounded RAM/VRAM and unit ownership, accessibility
media, generated-audio cleanup, and zero external requests. It persists
neither source text nor generated audio. The command is Windows/CUDA/WebView2
hardware validation, excluded from root checks and CI, and is not a
standard-profile or general-hardware test.

`pnpm.cmd test:browser:install` is the explicit networked setup step for the Chromium revision coupled to the pinned Playwright package. It installs to Playwright's per-user cache and may also acquire matching headless-shell/support binaries. `pnpm.cmd test:browser` first builds `@voxleaf/shared` and `@voxleaf/epub`, then builds the Vite application, starts a loopback-only preview server on `http://127.0.0.1:4173`, runs the fixed Chromium smoke, and shuts the server and isolated browser context down. Building the workspace packages inside this root command keeps it valid after a clean frozen install where ignored `dist` outputs do not exist. Once installation succeeds, the test command is offline and never downloads a browser. If the matching browser is absent, it fails with setup guidance rather than acquiring it implicitly. Browser reports, traces, screenshots, and test results are ignored generated artifacts and must use only repository-authored synthetic content.

`pnpm.cmd benchmark:reader` is the native-Windows, hardware-specific Chromium reader benchmark. It is offline after browser installation and uses only test-generated DOM/text/raster data. `pnpm.cmd benchmark:reader:native` builds the release executable and runs the companion packaged-WebView2 timing/resource matrix; it requires the same `tauri-driver` and matching Microsoft EdgeDriver setup as `pnpm.cmd test:native-startup`. Both commands are intentionally excluded from root checks and CI; run them manually when changing reader rendering, batching, reflow/restoration, image lifecycle, browser/WebView version, native driver behavior, or documented benchmark hardware. See [`testing.md`](testing.md#hardware-specific-visual-reader-benchmark) and the [visual-reader limits](../architecture/performance-budget.md#visual-reader-reference-limits) before interpreting their machine-specific results.

The ADR-0009 native file-ingress matrix is part of `pnpm.cmd test:native-startup`; its disposable synthetic-file procedure and test-controlled cancellation timing are documented in [`testing.md`](testing.md#native-local-file-open-flow). The matrix must run natively on Windows, never uses a private book, and removes its files/profile. It does not require or authorize a Tauri plugin, command, capability, path contract, permission, or additional automation dependency.

For ADR-0010, use `pnpm.cmd test:native-startup` and the documented
[native raster decode safety checks](testing.md#native-raster-decode-safety).
The packaged smoke opens the comprehensive repository-authored synthetic EPUB,
renders its admitted local image and verifies resource release on replacement
and close. [ADR-0041](../architecture/decisions/ADR-0041-simplify-empty-and-ready-reader-chrome.md)
removed the former manual raster-probe UI; the automated production-path checks
remain the validation procedure.

After the locked JavaScript and Python environments are installed, use the verified root quality surface:

```powershell
pnpm.cmd format
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
pnpm.cmd check
```

`format` intentionally rewrites supported TypeScript, JavaScript, JSON, CSS, YAML, Rust, and Python files. The other commands are suitable for validation: `format:check`, `lint`, `typecheck`, and `test` do not intentionally modify tracked source; `build` writes only ignored build output. `check` runs those five validation stages in order and stops on the first failure. Each aggregate command delegates to the same focused pnpm, Cargo, and uv commands documented above, so focused commands remain available for diagnosis.

The ordinary Tauri build produces the React frontend and a release-mode Windows
executable without installer bundling. The separate M011 release command below
is the only path that enables the reviewed NSIS configuration. The Python
commands create only an isolated development environment, validate the model-
free service package and its offline canonical schema registry, and build
source and wheel distributions under the ignored `services/tts/dist`
directory. `uv run --directory services/tts --locked python -m voxleaf_tts.service`
is the internal binary standard-stream service entry point; it is not an
interactive shell command and expects framed protocol input. None of the root
commands starts that service, downloads models, reads books, requires GPU
hardware, or persists generated audio.

The root `check` command does not start the development server. The development server runs only when explicitly requested with the focused `dev` command above.

### Build the M011 Piper core payload

Milestone 3's release-core builder requires the exact davefx and joe artifacts
in their ignored `models/tts/piper-...` roots recorded by
`services/tts/release/core/source-manifest-v1.json`. It downloads only the
fixed hash/size-pinned public CPython, Piper source, espeak-ng source, and voice
licence declaration into ignored build cache; ordinary application runtime
performs no download. From the repository root:

```powershell
pnpm.cmd package:piper-core
pnpm.cmd package:piper-core:check
```

The output lives under ignored `services/tts/release/core/dist`. It includes a
private interpreter, only the production Piper service closure, both voices,
notices/model cards, and exact Piper/espeak source. It never uses system Python
at product runtime, installs nothing into `PATH`, and persists no generated
audio. Maintainers run `pnpm.cmd package:piper-core:write-manifest` only for an
intentional authority update, because that command rewrites the tracked runtime
manifest and package evidence. This standalone payload is also consumed by the
explicit M011 Windows package command; ordinary development builds do not
bundle it.

### Build the M011 Windows package

From a normal local PowerShell session outside the automation sandbox:

```powershell
pnpm.cmd package:windows:check
pnpm.cmd package:windows
pnpm.cmd package:windows:lifecycle
```

`package:windows` rebuilds and verifies the exact Piper core, then creates the
ignored current-user NSIS artifact at
`apps/desktop/src-tauri/target/release/bundle/nsis/VoxLeaf_0.1.0_x64-setup.exe`.
It also writes an adjacent SHA-256 file and refreshes the tracked content-safe
package evidence. The installer includes the WebView2 bootstrapper; when the
Windows prerequisite is absent, that Microsoft bootstrapper can require
network access. Normal EPUB reading and Piper narration remain local.

The rebuilt candidate identity is emitted into generated package evidence. A
rebuild changes that identity and requires new hash-bound lifecycle and ordinary
journey receipts before carrying forward exact-artifact acceptance. The current
candidate has those receipts, is `unsigned-local`, and is accepted for
controlled local use and the portfolio MVP under ADR-0049/release authority v2.
It is not a trusted public artifact; that channel requires an authorized
signature and its verification evidence.

The signed maintainer path is:

```powershell
$env:VOXLEAF_WINDOWS_CERTIFICATE_THUMBPRINT = '<external certificate thumbprint>'
$env:VOXLEAF_WINDOWS_TIMESTAMP_URL = '<authorized HTTPS timestamp URL>'
pnpm.cmd package:windows:signed
```

Those values are external release credentials/configuration, never repository
content. The command fails closed when the certificate, private key, timestamp
URL, or resulting Authenticode signatures are unavailable or invalid. The
unsigned command remains valid for local validation only. See
[`docs/user/windows-release.md`](../user/windows-release.md) for the end-user
package behavior.

### Check the M011 optional Chatterbox package source authority

The current optional runtime is v6 under
[ADR-0062](../architecture/decisions/ADR-0062-admit-filelock-setuptools-chatterbox-v6.md).
V7 is an unpublished maintainer candidate for the msgpack security correction;
see its [preparation plan](../plans/active/chatterbox-msgpack-security-refresh.md).
It is not yet available through ordinary acquisition. Preparing it does not
repair an existing v6 installation.
These explicit commands check tracked source and acquisition authority; they
perform no model download, archive build, installation or narration:

```powershell
pnpm.cmd package:chatterbox-optional:v6:check-source
pnpm.cmd package:chatterbox-optional:v6:check-acquisition
```

The `package:chatterbox-optional:v6` builder is a release-maintainer operation,
not an end-user setup step. It assembles runtime-only output under ignored
`services/tts/release/optional/chatterbox/dist/v6` by default, requires controlled
build capacity and licence/provenance review, and always synchronizes the hashed
lock. It rejects `--no-sync` and does not copy model weights or update the
ordinary acquisition manifest. Follow the explicit
[v6 build/publication workflow](dependencies.md#m011-release-dependency-boundary)
for authorized package work; do not build merely to enable the optional profile.

Unversioned `package:chatterbox-optional` aliases intentionally retain the v2
default. Explicit `:v3` checks reproduce historical authority; neither is v6
acceptance. Local `:v4` commands and `test:tts:adapter-layout:*` belong to the
[historical adapter-layout campaign](tts-service-organization.md#historical-v2v3-checks-and-local-v4-campaign-tooling).
They remain available with their original semantics and do not admit v4 or
validate the current installed runtime.

### Historical local Chatterbox acquisition validation installer

ADR-0045 authorized one separate unsigned build for the maintainer's compatible
Windows computer. That historical build had the distinct identity
`com.voxleaf.desktop.chatterbox-validation`, contained Piper but not Chatterbox
runtime/model bytes, and exercised the real gated download without changing the
ordinary manifest. ADR-0050 and Milestone 6B retire its overlay, Cargo feature,
package configuration, and commands after promoting the same closed path into
ordinary VoxLeaf. The historical hashes and results remain in the M011 progress
log; they are not current build instructions or public-release artifacts.

### M011 6B ordinary-release isolation validation

The validation-only identity above is historical evidence. Milestone 6B uses
the ordinary package path, the single canonical manifest after exact measurement
reconciliation, and a checked-in ordinary-package test command.

The test builds the ordinary installer with a release-only compile feature that
excludes repository/environment runtime fallbacks. It launches the installed
artifact from a child process where every `VOXLEAF_TTS_DEV_*`,
`VOXLEAF_TTS_PIPER_*`, and `VOXLEAF_TTS_CHATTERBOX_*` key plus
`VOXLEAF_CHATTERBOX_VALIDATION_PACKAGE_ROOT` is removed or poisoned;
`PYTHONHOME`, `PYTHONPATH`, `PYTHONUSERBASE`, `VIRTUAL_ENV`, `CONDA_PREFIX`, and
`CONDA_DEFAULT_ENV` are removed; and a misleading `PATH` places sentinel Python,
Rust, Cargo, Node.js, `uv`, and `pip` names first. The assertions must show that
the child executable is the absolute application-owned `runtime/python.exe`, its
module/model roots are verified application-owned roots, and missing or invalid
package data fails closed rather than falling back.

This process-scoped environment is sufficient and safer than uninstalling
development tools. Rust is already compiled into the desktop executable. Piper
ships a private interpreter, service packages, and voices; installed Chatterbox
ships its own CPython/runtime graph and exact model data. End users do not need
system Python, Rust, Cargo, Node.js, `uv`, `pip`, or CUDA Toolkit. Actual external
requirements remain 64-bit Windows, WebView2 (the installer carries Microsoft's
bootstrapper, which may need a network if WebView2 is absent), and for
Chatterbox the published NVIDIA driver/GPU/CUDA-bfloat16, RAM, VRAM, processor,
and storage gate.

After deterministic/static isolation checks, run the ordinary installed
gate/consent/cancel/download/verify/activate, Spanish and English offline
narration, restart, removal, reinstall, and Piper-after-removal journey on the
representative compatible computer. Keep content-safe results and do not record
private paths or process command lines.

## Local TTS feasibility preflight

Milestone 6's hardware benchmark is explicit, manual, native-Windows work. It
is excluded from root checks and CI and does not make either candidate a
production dependency. ADR-0013 rejects both evaluated profiles; these commands
exist only to reproduce or extend feasibility evidence, not to install a
selected engine. First create the candidate environment being reproduced from
its checked-in lock and acquire the exact manifest revision into an ignored
local model directory. Acquisition is a separate networked operation.

The official measurement worker must have outbound networking blocked at the
operating-system boundary. From an administrator PowerShell terminal, create
one application-scoped rule for the exact candidate interpreter:

```powershell
$env:HF_HUB_OFFLINE = "1"
$env:TRANSFORMERS_OFFLINE = "1"
$candidatePython = (Resolve-Path "services/tts/benchmarks/candidates/<candidate>/.venv/Scripts/python.exe").Path
New-NetFirewallRule -DisplayName "VoxLeaf TTS Benchmark Offline" -Direction Outbound -Action Block -Program $candidatePython -Profile Any
```

Keep both offline variables in the same PowerShell process that invokes the
preflight or benchmark. The preflight requires them and separately queries the
exact enabled firewall rule. Environment variables or a caller-supplied boolean
alone are not accepted as network-isolation proof.
Remove the rule after all official work with:

```powershell
Remove-NetFirewallRule -DisplayName "VoxLeaf TTS Benchmark Offline"
```

Pass private local paths through standard input, never command-line arguments,
environment values, or a tracked configuration file. The closed input also
requires the manifest's exact candidate, revision, voice, provider, and
precision:

```powershell
$preflight = @{
  candidateId = "<manifest-candidate-id>"
  artifactRoot = "<absolute-verified-local-artifact-root>"
  candidatePython = $candidatePython
  modelRevision = "<manifest-model-revision>"
  voiceId = "<manifest-voice-id>"
  provider = "<pytorch-cuda-or-onnxruntime-cpu>"
  precision = "<bfloat16-or-float32>"
  offline = $true
  expectedCommitSha = (git rev-parse HEAD)
  purpose = "official"
  sleepDisabled = $true
  backgroundLoadAcceptable = $true
  thermalStateAcceptable = $true
} | ConvertTo-Json -Compress
$preflight | pnpm.cmd benchmark:tts:preflight
```

After a passing preflight, use the same closed payload with `purpose = "pilot"`
for one disposable load/generation/cleanup smoke:

```powershell
$preflight | pnpm.cmd benchmark:tts:measure
```

The pilot emits no comparable measurements and creates no raw session. Change
the purpose to `official` only from a clean committed revision after the pilot
passes. The official command repeats preflight in both the root supervisor and
the exact candidate interpreter, runs the frozen protocol, and writes one
bounded content-free raw journal below the ignored
`benchmarks/results/raw/<candidate-id>/<session-id>/` directory. It never
writes waveform samples. The returned session ID is content-free; the raw
journal remains non-promotable until the later quality and audit fields are
complete and the allowlisted summary passes validation.

### M010.1 corrective full evaluation v12

V12 is a manual exact-host evaluation, not part of root checks or application
startup. Its authority commit must be a strict ancestor of the clean execution
commit. The exact Chatterbox and Qwen candidate interpreters must already have
enabled outbound-block firewall rules, and all model artifacts must already
exist under their ignored exact local roots.

From repository root, capture the clean commits and interpreters before
changing directory:

```powershell
$authorityCommit = git log --format="%H" --fixed-strings --grep="feat(tts): freeze corrective full evaluation v12" -1
$executionCommit = git rev-parse HEAD
$servicePython = (Resolve-Path "services/tts/.venv/Scripts/python.exe").Path
$chatterboxPython = (Resolve-Path "services/tts/benchmarks/candidates/chatterbox_multilingual_v3_v4/.venv/Scripts/python.exe").Path
$qwenPython = (Resolve-Path "services/tts/benchmarks/candidates/qwen3_1_7b_customvoice_cuda/.venv/Scripts/python.exe").Path
$env:HF_HUB_OFFLINE = "1"
$env:TRANSFORMERS_OFFLINE = "1"
```

Run Chatterbox preflight and the complete machine matrix from the service
package directory:

```powershell
$machineRequest = @{
  authorityCommitSha = $authorityCommit
  executionCommitSha = $executionCommit
  sleepDisabled = $true
  backgroundLoadAcceptable = $true
  thermalStateAcceptable = $true
} | ConvertTo-Json -Compress

Push-Location "services/tts"
$machineRequest | & $servicePython -m benchmarks.corrective_v12_cli preflight
$machineRequest | & $servicePython -m benchmarks.corrective_v12_cli machine
Pop-Location
```

The machine command returns a content-free session ID. Generate each opted-in
private review separately so only one model is loaded at a time. Supply that
machine session only for Chatterbox; Qwen creates a separate ignored session:
the Chatterbox candidate command delegates schema verification of the machine
journal to the service interpreter, then performs inference only inside the
locked candidate environment. This keeps service validation dependencies out
of the frozen model environment.

```powershell
Push-Location "services/tts"

$chatterboxQuality = @{
  candidateId = "chatterbox-multilingual-v3-cuda-bf16-default-v4"
  authorityCommitSha = $authorityCommit
  executionCommitSha = $executionCommit
  sessionId = "<machine-session-id>"
  qualityOptIn = $true
} | ConvertTo-Json -Compress
$chatterboxQuality | & $chatterboxPython -m benchmarks.corrective_v12_quality_cli generate

$serenaQuality = @{
  candidateId = "qwen3-tts-1-7b-customvoice-cuda-bf16-serena-es-v8"
  authorityCommitSha = $authorityCommit
  executionCommitSha = $executionCommit
  sessionId = $null
  qualityOptIn = $true
} | ConvertTo-Json -Compress
$serenaQuality | & $qwenPython -m benchmarks.corrective_v12_quality_cli generate

$aidenQuality = @{
  candidateId = "qwen3-tts-1-7b-customvoice-cuda-bf16-aiden-en-v8"
  authorityCommitSha = $authorityCommit
  executionCommitSha = $executionCommit
  sessionId = $null
  qualityOptIn = $true
} | ConvertTo-Json -Compress
$aidenQuality | & $qwenPython -m benchmarks.corrective_v12_quality_cli generate

Pop-Location
```

Open each returned ignored evaluator HTML locally, complete every field, and
download the result. The guarded `derive` command accepts one downloaded form,
writes only its schema-valid content-safe summary below `benchmarks/tts/`, and
deletes the complete private session. Do not commit a downloaded form,
generated waveform, private map, raw session, model, environment, or path.

For the completed `v2` cycle, the audit is complete but the one-evaluator
quality result remains below the frozen three-person minimum, so no official
summary or production profile was promoted. The accepted content-free outcome
is in [`selection-v2.md`](../../benchmarks/tts/selection-v2.md).

The later `v3` cycle also remains failed and non-promotable. A post-result
maintainer decision accepts one fluent Spanish evaluator for future
development-demo feedback, but it does not rewrite the frozen `v3` panel or
change this command's promotion rules. ADR-0015 records the current constrained
demo exception and supersedes ADR-0014's scheduling and buffering details.

The command fails closed on a dirty or different revision, wrong platform or
Python, missing environment, wrong artifact hash, missing offline controls,
missing firewall rule, battery power, insufficient RAM/VRAM/disk, unavailable
WDDM per-process dedicated-memory counters for the balanced role, or
unconfirmed sleep/background/thermal conditions. Its JSON output is
content-free and contains no hostname, account, serial, UUID, private path,
environment value, process command line, text, or audio. A `pilot` purpose may
exercise setup but is never eligible for official promotion.

### Disposable TTS listening session

The manual quality workflow is also excluded from CI. It is the only Milestone
6 command allowed to persist generated audio, requires explicit
`qualityOptIn = $true`, and writes only to a caller-known ignored session. Use
the same 32-character session ID for both candidates:

```powershell
$sessionId = [Guid]::NewGuid().ToString("N")
$qualityPayload = $candidatePreflight | ConvertFrom-Json
$qualityPayload | Add-Member -NotePropertyName qualityOptIn -NotePropertyValue $true
$qualityPayload | Add-Member -NotePropertyName sessionId -NotePropertyValue $sessionId
$qualityPayload | ConvertTo-Json -Compress | pnpm.cmd benchmark:tts:quality:generate
```

`$candidatePreflight` is the passing `purpose = "official"` payload above.
Run generation once per candidate, switching the exact firewall rule between
interpreters while retaining the same session ID. Generation removes the
whole session on failure. When both commands report
`readyForFinalization: true`, create the blinded pages:

```powershell
@{
  qualityOptIn = $true
  sessionId = $sessionId
  evaluatorCount = 1
} | ConvertTo-Json -Compress | pnpm.cmd benchmark:tts:quality:finalize
```

Open the generated `evaluator-01.html` below the ignored session, complete
every score, and use its export button. Submit the downloaded JSON as a nested
object, then aggregate:

```powershell
$scorecard = Get-Content -Raw "<downloaded-scorecard>" | ConvertFrom-Json
@{
  qualityOptIn = $true
  sessionId = $sessionId
  scorecard = $scorecard
} | ConvertTo-Json -Depth 20 -Compress | pnpm.cmd benchmark:tts:quality:submit

@{
  qualityOptIn = $true
  sessionId = $sessionId
} | ConvertTo-Json -Compress | pnpm.cmd benchmark:tts:quality:aggregate
```

One evaluator produces explicitly limited evidence and remains ineligible for
the frozen summary schema, which requires at least three independently
randomized fluent-Spanish evaluators. After recording the content-free
aggregate, remove the exact session and every generated WAV:

```powershell
@{
  qualityOptIn = $true
  sessionId = $sessionId
} | ConvertTo-Json -Compress | pnpm.cmd benchmark:tts:quality:cleanup
```

The detailed storage, blinding, bounds, and privacy rules are documented in
the [benchmark README](../../benchmarks/tts/README.md#disposable-blinded-quality-session).

## Continuous integration

For ordinary installed-host checks, launch PowerShell from Windows Explorer
or the Start menu. An escalated child of an MSIX-packaged automation app can
still inherit its virtualized `LOCALAPPDATA` view. That can legitimately fail
the optional package's canonical containment checks even when a separate
hash inventory appears valid. Do not bypass verification or replace user
data to work around that environment. The read-only
`pnpm run test:chatterbox:installed-integrity` diagnostic requires an existing
installed Chatterbox package and rejects packaged process identity.

When validating desktop-only corrections against the frozen Piper release,
`pnpm run package:windows:verified-core` first verifies the existing core tree,
archive, measurements and authority hashes, then invokes the same Windows
release builder. It fails if that exact core is missing or invalid. The normal
`package:windows` command still rebuilds the core and rejects any difference
from its frozen manifest, including docstrings and environment-specific wheel
`RECORD` entries. Do not regenerate frozen authorities merely to make a
desktop validation pass; record which packaging route and artifact identities
were used.

`pnpm run package:windows:reader-corrections -- --receipt <absolute-ignored-path>`
opts the ordinary installed journey into B06/B07 file-handle scenarios.
It requires an absent ordinary install directory, preserves application data
through the existing backup/restore lifecycle, and uses the normal installer
and public native commands. The host creates a temporary delete-sharing denial
to verify terminal cleanup failure and safe retry; a Windows oplock then holds
the final package verification read while cancellation is requested. The
separate `.corrections.json` receipt also checks late cancellation preserves
installation. `pnpm run test:acquisition:file-barriers` verifies both host
barriers on Windows. Preserve existing installer registrations and shortcuts
around a journey when they belong to the user's previous installation.

The `Foundation checks` workflow runs on pushes to `main` and `agent/**`, pull requests targeting `main`, and manual dispatches. `Windows native foundation` explicitly installs the pinned Playwright Chromium, runs `pnpm.cmd test:browser`, runs authoritative `pnpm.cmd check`, and then runs `pnpm.cmd test:native-startup` against packaged WebView2; `Ubuntu portable foundation` runs the deliberately narrower `pnpm check:portable`. All three jobs install package dependencies from committed lockfiles. The added `Ubuntu Rust foundation` job installs Linux prerequisites and pinned Rust, then runs `pnpm format:check:rust`, `pnpm lint:rust`, and `pnpm test:rust` with bounded build concurrency. Its local comparison and subsequent remote pass are recorded at the historical checkpoint above; neither establishes fresh CI acceptance. The Windows job does not restore a browser cache, so browser network activity is confined to its named installation step. See [`testing.md`](testing.md) for the exact coverage distinction.

Dependency ownership, direct package purposes, production alternatives, and transitive-lock review rules are documented in [`dependencies.md`](dependencies.md).
