# Development setup

## Current status

The prerequisite toolchains, TypeScript workspace, framework-independent packages, React web shell, minimal Tauri 2 native shell, isolated Python service foundation, aggregate root quality commands, deterministic Playwright Chromium smoke, and continuous integration are initialized. The version, focused, development-server, and root commands identified as Windows commands in this document have been run successfully in Windows PowerShell. Secure in-memory EPUB 3 ingestion, immutable semantic documents, bounded local raster reads, and deterministic locator resolution are implemented in `@voxleaf/epub`. The desktop passes one bounded local-file read to the publication session, presents accessible open/close lifecycle states, renders the starting spine document's supported semantic text structure through application-owned React elements, retains an unused bounded static-raster predecode/decode source boundary, and uses generated standalone contract validators under a CSP with no `unsafe-eval`. Navigation, semantic publication images, large-chapter enforcement, narration preparation, TTS inference, audio, persistence, hardware detection, installers, and product-level integration are not implemented.

## Prerequisite version matrix

The selected versions establish a reproducible foundation with the reviewed low-level EPUB ZIP/XML dependencies, but without selecting renderer, audio, transport, or TTS-model dependencies.

| Prerequisite | Selected version or policy | Minimum supported version | Verified Windows state |
| --- | --- | --- | --- |
| Windows development host | Native 64-bit Windows; current host is 25H2 build `26200.8875` | Windows 10 version 1803, 64-bit | Satisfied |
| Node.js | `24.18.0` LTS, pinned in `.nvmrc` | `22.12.0` LTS; supported majors are constrained in `package.json` | `v24.18.0` |
| Package manager | pnpm `11.15.1`, pinned by `packageManager` and `engines.pnpm` in `package.json` | Exactly `11.15.1` for reproducible installs | `11.15.1` |
| Rust compiler | Rust `1.97.1`, MSVC host, pinned in `rust-toolchain.toml` | `1.77.2`, the Tauri 2 baseline | `rustc 1.97.1` |
| Cargo | Cargo bundled with pinned Rust `1.97.1` | Cargo bundled with Rust `1.77.2` | `cargo 1.97.1` |
| Python | CPython `3.12.10`, pinned in `.python-version` | Python `3.12`; use the pinned patch release | `Python 3.12.10` |
| Python project manager | uv `0.11.29`, pinned in setup and CI | Exactly `0.11.29` for reproducible lock and environment behavior | `uv 0.11.29` |
| C++ build tools | Visual Studio Build Tools 2022 `17.14.36`, Desktop development with C++ workload | Visual Studio Build Tools 2022 with x64/x86 MSVC and a Windows SDK | MSVC `14.44.35207`; Windows SDK `10.0.26100.0` |
| WebView | Automatically updated Evergreen WebView2 Runtime; do not pin a runtime patch | WebView2 Runtime `86.0.616.0` | Evergreen `150.0.4078.83` |

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
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd test:browser:install
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd benchmark:reader
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

`pnpm.cmd --filter @voxleaf/desktop dev` starts the browser-only Vite development server on `http://127.0.0.1:5173`; it was verified with a successful local HTTP response. Stop it with `Ctrl+C`. It does not exercise the native Tauri runtime. `pnpm.cmd test:native-startup` performs the authoritative packaged startup/CSP regression: it builds the release executable, launches it with an isolated disposable WebView2 profile, verifies root/main mount, opens and closes the deterministic minimal EPUB fixture, observes zero page/console errors and external requests, and removes its temporary data. It requires native Windows but does not require the Playwright-managed Chromium download.

`pnpm.cmd test:browser:install` is the explicit networked setup step for the Chromium revision coupled to the pinned Playwright package. It installs to Playwright's per-user cache and may also acquire matching headless-shell/support binaries. `pnpm.cmd test:browser` first builds `@voxleaf/shared` and `@voxleaf/epub`, then builds the Vite application, starts a loopback-only preview server on `http://127.0.0.1:4173`, runs the fixed Chromium smoke, and shuts the server and isolated browser context down. Building the workspace packages inside this root command keeps it valid after a clean frozen install where ignored `dist` outputs do not exist. Once installation succeeds, the test command is offline and never downloads a browser. If the matching browser is absent, it fails with setup guidance rather than acquiring it implicitly. Browser reports, traces, screenshots, and test results are ignored generated artifacts and must use only repository-authored synthetic content.

`pnpm.cmd benchmark:reader` is the native-Windows, hardware-specific Task 1.6 benchmark. It is offline after browser installation and uses only test-generated DOM/text/raster data. It is intentionally excluded from root checks and CI; run it manually when changing reader rendering, batching, reflow/restoration, image lifecycle, browser version, or documented benchmark hardware. See [`testing.md`](testing.md#hardware-specific-visual-reader-benchmark) and the [visual-reader limits](../architecture/performance-budget.md#visual-reader-reference-limits) before interpreting its machine-specific results.

For the ADR-0009 native file-ingress matrix, launch the built release executable and follow the disposable synthetic-file procedure in [`testing.md`](testing.md#native-local-file-ingress-probe). The probe must run natively on Windows, must not use a private book, and must not leave its synthetic files behind. It does not require or authorize a Tauri plugin, command, capability, or permanent automation dependency.

For ADR-0010, use the same release executable and follow the fixed synthetic-image procedure in [`testing.md`](testing.md#native-raster-decode-safety-probe). The committed probe exercises only the browser Blob/decode/CSP boundary and releases its source immediately; it does not open an EPUB or render a publication image.

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

The Tauri build produces the React frontend and a release-mode Windows executable. Installer bundling is intentionally disabled during foundation validation. The Python commands create only an isolated development environment, validate the dependency-free service package, and build source and wheel distributions under the ignored `services/tts/dist` directory. None of the root commands starts a development server, downloads models, reads books, requires GPU hardware, or persists generated audio.

The root `check` command does not start the development server. The development server runs only when explicitly requested with the focused `dev` command above.

## Continuous integration

The `Foundation checks` workflow runs on pushes to `main` and `agent/**`, pull requests targeting `main`, and manual dispatches. `Windows native foundation` explicitly installs the pinned Playwright Chromium, runs `pnpm.cmd test:browser`, runs authoritative `pnpm.cmd check`, and then runs `pnpm.cmd test:native-startup` against packaged WebView2; `Ubuntu portable foundation` runs the deliberately narrower `pnpm check:portable`. Both install package dependencies from committed lockfiles. The Windows job does not restore a browser cache, so browser network activity is confined to its named installation step. See [`testing.md`](testing.md) for the exact coverage distinction.

Dependency ownership, direct package purposes, production alternatives, and transitive-lock review rules are documented in [`dependencies.md`](dependencies.md).
