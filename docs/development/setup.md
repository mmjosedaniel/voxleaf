# Development setup

## Current status

The prerequisite toolchains, TypeScript workspace, React/Tauri desktop,
isolated Python service, quality commands, browser/native smokes, secure EPUB
reader, bounded restoration, locator-linked narration preparation, and
segment-level synchronized reader projection are initialized and validated
within their documented boundaries. Completed M007 provides protocol v1,
native supervision, typed one-unit ownership, and the exact development-only
Qwen/Serena adapter. Completed M008 connects the active visual locator to
bounded preparation, one-at-a-time synthesis, the sole-owner FIFO, Web Audio
playback, and accessible quick/prepared controls. Completed M009 adds exact
segment transitions, focus-safe highlight/follow, synchronized user
navigation, heard-position persistence, exact-host packaged evidence, and
repository/CI closeout.

M010 is complete. It adds privacy-safe native Windows detection, an immutable
measured registry, deterministic profile matching,
bounded profile-ID preference reuse, compact compatibility UI, pre-start
enforcement, identity-safe recovery, the admitted Piper/davefx CPU fallback,
and one profile-aware service tree. Piper automatically selects its
locator-safe, spoken-expansion-aware narration preparation profile; its
exact-host service, corrective ordinary-prose/compact-form arms, valid
zero-sentence-boundary fragment handling, and content-safe packaged
private-book confirmation pass. Qwen/Serena remains development-only: its
offline service lifecycle passes, and the packaged host now offers it when
total dedicated VRAM is at least `7,196` MiB and currently available dedicated
VRAM is at least `6,508` MiB. Its broader packaged matrix still stops at the
depletion synchronization assertion. Quick mode is the default;
prepared playback initially selects one minute; refill remains one minute; low
water is 10 seconds; the adaptive low-buffer wait remains disabled; playback
is `1.0x`; and the simultaneous 30-minute ceiling is not a startup target.
M008.1 now schedules the separate bounded semantic transition pause between
already-buffered generated units; it adds no silent audio or startup timer.
The final
[`tts-support-matrix-v1`](../architecture/tts-support-matrix-v1.md) makes
Piper/davefx the sole supported and automatically recommendable compatible
profile, retains Qwen/Serena as development-only, and keeps automatic failover
disabled. M008.1 and M010 passed replacement Ubuntu/Windows checks and are
archived. M010.1 is approved planned work for explicit Spanish/English
narration and bounded candidate screening; it has not changed setup or runtime
behavior yet. Production distribution, Piper license fulfillment, and
installers remain M011 work.

M009.1 keeps passive viewport inspection separate from the active narration
locator. Scrolling does not cancel or restart narration; explicit leaf,
visible-passage, passage-boundary, and chapter actions remain narration seeks.
Its fixed reader viewport, compact narration, truthful loaded-duration text,
bounded paragraph leaf, private-EPUB correction, exact-host matrix, and local
repository/package validation pass. Pull request #142 passed the required
Ubuntu and Windows checks and merged; M009.1 is archived and M010 is unblocked.

The later official Qwen 1.7B CustomVoice/Serena `v3` matrix failed standard
startup, throughput, zero-failure, and mid-generation cancellation gates.
ADR-0015 now supersedes ADR-0014's scheduling and buffering details and permits
only a bounded one-GPU adaptive development demo with that exact local
profile; it adds no production dependency and does not approve continuous
playback. The constrained development inference, transport, narration
dispatch, audio playback, and segment-level synchronization path is implemented
and exact-host validated. Measured matching does not promote the development
profile: supported Piper fallback and explicit identity-safe recovery are now
implemented, while compliant distribution and installers remain
unimplemented.
The content-free `benchmarks/tts/selection-v3.md` record retains that failed
standard result and separately identifies the constrained demo input.

Milestone 6.2 is complete. Its `v4` authority is frozen and Milestone 2 adds the
reviewed `benchmark:tts:batch` disposable-pilot and official commands,
`benchmark:tts:batch:derive` safe-summary/cleanup command, and model-free
one/two-unit, ordering, invalidation, resource, playback, schema, and
derivation mechanics. Milestones 3 and 4 ran the full-GPU and admitted
targeted-CPU paths and committed their content-safe results. Both reached the
exact `shared-gpu-memory` stop before usable media; the CPU arm reproduced the
same measured VRAM/shared-memory boundary. Milestone 5 quality review is not
admitted. The results contain no reviewable audio or throughput evidence and
change no production behavior.

The same completed ExecPlan froze and executed a separate result-blind `v5`
authority after `selection-v4`. CPU solo measured aggregate RTF 2.999, GPU solo
measured RTF 1.467, and the official concurrent arm stopped at
`resource-limit`. A later low-application-load diagnostic completed at
aggregate RTF 1.429 but substantially slowed the GPU worker. Accepted
`selection-v5` rejects CPU-only and dual-worker scheduling. M008 implements one
GPU worker with quick-start or explicit prepared playback, bounded generation
during playback-only pause, truthful frontier buffering, and an approximately
30-minute in-memory ceiling only for the exact development host. Completed
M007 supplies the constrained service boundary; M008 Milestone 5 supplies its
application coordinator and audible player connection.

Use [`troubleshooting.md`](troubleshooting.md) for the content-safe exact-demo
failure and recovery procedure. Do not work around an unavailable control,
slow preparation, or buffering by enabling the fake child, removing outbound
blocking, persisting audio, starting a second model worker, or adding automatic
retry.

## Prerequisite version matrix

The selected versions establish a reproducible foundation with the reviewed low-level EPUB ZIP/XML dependencies and the narrow official Tauri invoke API used by the model-free M007 probe, but without selecting renderer, audio-player, or TTS-model dependencies.

| Prerequisite             | Selected version or policy                                                       | Minimum supported version                                          | Verified Windows state                         |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------- |
| Windows development host | Native 64-bit Windows; current host is 25H2 build `26200.8875`                   | Windows 10 version 1803, 64-bit                                    | Satisfied                                      |
| Node.js                  | `24.18.0` LTS, pinned in `.nvmrc`                                                | `22.12.0` LTS; supported majors are constrained in `package.json`  | `v24.18.0`                                     |
| Package manager          | pnpm `11.15.1`, pinned by `packageManager` and `engines.pnpm` in `package.json`  | Exactly `11.15.1` for reproducible installs                        | `11.15.1`                                      |
| Rust compiler            | Rust `1.97.1`, MSVC host, pinned in `rust-toolchain.toml`                        | `1.77.2`, the Tauri 2 baseline                                     | `rustc 1.97.1`                                 |
| Cargo                    | Cargo bundled with pinned Rust `1.97.1`                                          | Cargo bundled with Rust `1.77.2`                                   | `cargo 1.97.1`                                 |
| Python                   | CPython `3.12.10`, pinned in `.python-version`                                   | Python `3.12`; use the pinned patch release                        | `Python 3.12.10`                               |
| Python project manager   | uv `0.11.29`, pinned in setup and CI                                             | Exactly `0.11.29` for reproducible lock and environment behavior   | `uv 0.11.29`                                   |
| C++ build tools          | Visual Studio Build Tools 2022 `17.14.36`, Desktop development with C++ workload | Visual Studio Build Tools 2022 with x64/x86 MSVC and a Windows SDK | MSVC `14.44.35207`; Windows SDK `10.0.26100.0` |
| WebView                  | Automatically updated Evergreen WebView2 Runtime; do not pin a runtime patch     | WebView2 Runtime `86.0.616.0`                                      | Evergreen `150.0.4078.83`                      |

### Selection rationale

- [Tauri's Windows prerequisites](https://v2.tauri.app/start/prerequisites/) require Microsoft C++ Build Tools, WebView2, Rust with an MSVC host, and an LTS Node.js release for a JavaScript frontend.
- [Vite requires Node.js 20.19+ or 22.12+](https://vite.dev/guide/). Node 20 is end-of-life, so VoxLeaf supports the maintained Node 22 and 24 LTS lines and selects the newer Node 24 LTS line. The [Node.js release policy](https://nodejs.org/en/about/previous-releases) recommends production applications use maintained LTS releases.
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

The maintainer uses WSL Ubuntu for Git and terminal work, and it may also be used for documentation and isolated platform-independent checks. The Codex Windows execution context could not enumerate the maintainer's registered distribution during final Milestone 1 validation, so no WSL project command is claimed as locally validated evidence. The `Ubuntu portable foundation` CI job verifies `pnpm check:portable` on Ubuntu 24.04; this is portable Linux evidence, not proof that a particular WSL toolchain or clone is configured correctly.

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
ignored locked candidate environment, each model root must contain only the
frozen exact artifacts, and an enabled outbound firewall rule must target
every configured interpreter:

```powershell
$env:VOXLEAF_TTS_PIPER_ENABLED = "1"
$env:VOXLEAF_TTS_PIPER_PYTHON = (Resolve-Path "services/tts/benchmarks/candidates/piper_1_4_2_cpu/.venv/Scripts/python.exe").Path
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

These values remain native-only and are never returned to the renderer,
logged, persisted, or placed in protocol frames. Both Piper voices use the
same frozen `narration-piper-v2` preparation contract; Chatterbox and Qwen use
the engine-neutral bilingual segments and language-bound adapters. No
user-facing chunk setting is required, and protocol v1's 20-second unit ceiling
is unchanged.

When every exact profile and interpreter-bound outbound block is prepared,
run the M010.1 service-only bilingual matrix:

```powershell
pnpm.cmd test:tts:bilingual-profiles-exact-host
```

The command builds the release application and runs six arms sequentially:
Piper davefx/Spanish, Piper joe/English, Chatterbox/Spanish,
Chatterbox/English, Qwen Serena/Spanish, and Qwen Aiden/English. Each arm
proves load/warmup, bounded generation, busy rejection, identity-first
cancellation, clean reload, a second generation, shutdown, and cleanup. It
starts only one model process at a time, retains no generated audio, emits only
a fixed content-safe result, and is excluded from root checks and CI. It is
service integration evidence, not the packaged EPUB portfolio proof owned by
Milestone 7.

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

For ADR-0010, use the same release executable and follow the fixed synthetic-image procedure in [`testing.md`](testing.md#native-raster-decode-safety-probe). The manual probe continues to isolate the browser Blob/decode/CSP boundary and releases its source immediately. The automated native-startup smoke additionally opens the comprehensive synthetic EPUB, renders its admitted publication image, and verifies removal on publication close.

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

The Tauri build produces the React frontend and a release-mode Windows executable. Installer bundling is intentionally disabled during foundation validation. The Python commands create only an isolated development environment, validate the model-free service package and its offline canonical schema registry, and build source and wheel distributions under the ignored `services/tts/dist` directory. `uv run --directory services/tts --locked python -m voxleaf_tts.service` is the internal binary standard-stream service entry point; it is not an interactive shell command and expects framed protocol input. None of the root commands starts that service, downloads models, reads books, requires GPU hardware, or persists generated audio.

The root `check` command does not start the development server. The development server runs only when explicitly requested with the focused `dev` command above.

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

The `Foundation checks` workflow runs on pushes to `main` and `agent/**`, pull requests targeting `main`, and manual dispatches. `Windows native foundation` explicitly installs the pinned Playwright Chromium, runs `pnpm.cmd test:browser`, runs authoritative `pnpm.cmd check`, and then runs `pnpm.cmd test:native-startup` against packaged WebView2; `Ubuntu portable foundation` runs the deliberately narrower `pnpm check:portable`. Both install package dependencies from committed lockfiles. The Windows job does not restore a browser cache, so browser network activity is confined to its named installation step. See [`testing.md`](testing.md) for the exact coverage distinction.

Dependency ownership, direct package purposes, production alternatives, and transitive-lock review rules are documented in [`dependencies.md`](dependencies.md).
