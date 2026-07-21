# Development setup

## Current status

The prerequisite toolchains, TypeScript workspace, framework-independent packages, React web shell, and minimal Tauri 2 native shell are initialized. The version and desktop commands in this document have been run successfully in Windows PowerShell. The Python service, aggregate root quality commands, and continuous integration are not initialized yet.

## Prerequisite version matrix

The selected versions establish a reproducible foundation without selecting EPUB, audio, transport, or TTS-model dependencies.

| Prerequisite | Selected version or policy | Minimum supported version | Verified Windows state |
| --- | --- | --- | --- |
| Windows development host | Native 64-bit Windows; current host is 25H2 build `26200.8875` | Windows 10 version 1803, 64-bit | Satisfied |
| Node.js | `24.18.0` LTS, pinned in `.nvmrc` | `22.12.0` LTS; supported majors are constrained in `package.json` | `v24.18.0` |
| Package manager | pnpm `11.15.1`, pinned by `packageManager` and `engines.pnpm` in `package.json` | Exactly `11.15.1` for reproducible installs | `11.15.1` |
| Rust compiler | Rust `1.97.1`, MSVC host, pinned in `rust-toolchain.toml` | `1.77.2`, the Tauri 2 baseline | `rustc 1.97.1` |
| Cargo | Cargo bundled with pinned Rust `1.97.1` | Cargo bundled with Rust `1.77.2` | `cargo 1.97.1` |
| Python | CPython `3.12.10`, pinned in `.python-version` | Python `3.12`; use the pinned patch release | `Python 3.12.10` |
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
```

Expected selected versions are `v24.18.0`, `11.15.1`, `rustc 1.97.1`, `cargo 1.97.1`, and `Python 3.12.10`. Rust must report the `x86_64-pc-windows-msvc` toolchain when running `rustup show active-toolchain`.

WebView2 Evergreen, Visual Studio Build Tools, MSVC, and the Windows SDK are native prerequisites rather than repository-managed dependencies. Their observed versions belong in the matrix, but automatic security and servicing updates may advance them. Re-run native validation after such updates.

Native Rust compilation executes unsigned build scripts and procedural macro libraries generated under Cargo's target directory. An enforced Windows Application Control or Smart App Control policy may reject those intermediates with operating-system error `4551`; moving the target directory does not remove the signing requirement. Use an approved developer environment or an authorized policy configuration, and do not weaken an organization-managed policy without administrator approval.

## Windows and WSL environment boundary

### Canonical Windows environment

Windows is the canonical environment for native Tauri development and validation. Native desktop setup, development, testing, and packaging must run from Windows because the shipped application targets Windows and depends on Windows-specific tooling and runtime behavior.

The pinned toolchains and installed native prerequisites are recorded above. Application-level commands remain unverified until later foundation tasks create their configuration.

### Optional WSL environment

WSL Ubuntu may be used for Git operations, documentation work, and other platform-independent checks. TypeScript, Rust, or Python commands may be documented as WSL-compatible only after they exist in the repository and have been run successfully in WSL.

WSL is not an authoritative substitute for native Windows Tauri builds, packaging, Windows permissions, filesystem behavior, or desktop runtime validation. A check passing in WSL does not satisfy a task that requires native Windows validation.

### Working trees and generated artifacts

The safest arrangement is a Windows clone for native application work and a separate WSL clone stored in the WSL Linux filesystem. Separate Git worktrees are also acceptable when each environment has its own working directory, both Git clients can resolve the worktree paths, and generated artifacts remain isolated. Do not alternate Windows Git and WSL Git in the same working tree without first checking that the tree is clean.

Share tracked source files and lockfiles through Git, not generated directories. Each environment must create and use its own:

- JavaScript dependency directory, such as `node_modules/`.
- Python virtual environment, such as `.venv/`.
- Rust build output and target-specific artifacts, such as `target/` or a Tauri-specific target directory.
- Application build, distribution, cache, and test-output directories.

Do not copy or reuse these directories between Windows and WSL. If a working tree changes environments, regenerate artifacts using the repository's documented commands after those commands have been established and verified.

### Paths and line endings

- Use repository-relative paths in tracked configuration and documentation. Do not commit developer-specific Windows or WSL absolute paths.
- Keep tracked text as UTF-8 with LF line endings, as required by `.editorconfig`.
- Configure each Git client consistently with the repository's LF policy. In particular, avoid combining a Windows Git configuration that rewrites line endings with WSL Git in the same working tree.
- Before changing environments, run `git status --short`. If files unexpectedly appear modified, inspect them before editing or discarding anything; `git diff --ignore-space-at-eol` can help identify line-ending-only differences.
- Use native path syntax in local commands: Windows paths in PowerShell and Linux paths inside WSL. Do not pass generated-environment paths from one environment to the other.

### Recording future commands

When project commands are introduced, record the required shell, working directory, and supported environment for each command. Document separate PowerShell and WSL forms only when both have been executed successfully. Native Windows validation remains required even when a portable check also runs in WSL.

## Proposed bootstrap order

1. Create the Tauri, React, and TypeScript desktop application.
2. Add formatting, linting, type checking, and unit testing.
3. Define shared book, reading-locator, session-generation, audio-frame, buffer-status, and persisted-state contracts.
4. Create the EPUB package with safe extraction, sanitization, stable locator resolution, and synthetic fixtures.
5. Add the reflowable visual reader and local position restoration before connecting narration.
6. Create the Python TTS service with an isolated environment.
7. Add Python linting, type checking, and testing.
8. Define and prototype the typed local process protocol.
9. Add one end-to-end health-check path between the desktop app and service.
10. Add continuous integration for deterministic checks.
11. Prototype one TTS model, then connect narration ranges to visual reading locators and the duration-based startup gate.

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
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd --filter @voxleaf/desktop build
cargo fmt --check --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm.cmd --filter @voxleaf/desktop tauri build
```

The Tauri command builds the React frontend and a release-mode Windows executable. Installer bundling is intentionally disabled during foundation validation. Aggregate formatting, linting, type-checking, testing, and build commands remain planned work for Task 5.1.
