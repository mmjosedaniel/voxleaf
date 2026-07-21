# ADR-0001: Build VoxLeaf as a local-first desktop application

## Status

Accepted

## Context

The product must open local EPUB files, run neural TTS on the user's hardware, manage a local model process, and play streamed audio without sending book contents to a remote service.

A conventional browser application would face file-system, process-management, model-runtime, and distribution limitations.

## Decision

Build VoxLeaf as a desktop application with a web-based user interface and native desktop shell.

Adopt Tauri 2 with React and TypeScript. Foundation validation confirmed Tauri `2.11.5`, Tauri CLI `2.11.4`, React `19.2.7`, Vite `8.1.5`, the pinned Rust `1.97.1` MSVC toolchain, and the installed WebView2 runtime can produce and launch the native Windows shell.

The foundation shell has one local main window, no registered Rust commands or plugins, no frontend Tauri API dependency, and an explicit empty capability list. The webview therefore has no IPC permission. Native permissions must be introduced only with the product behavior that requires them and reviewed against the local-first security boundary.

Installer bundling remains deferred. The foundation `tauri build` produces the release executable needed to validate the stack without introducing installer, signing, updater, or distribution decisions.

## Consequences

- The application can manage local files and processes.
- Distribution requires platform-specific packaging.
- Rust and native build dependencies become part of development setup.
- The UI can remain aligned with the maintainer's React and TypeScript experience.
- Browser-only deployment is not an MVP objective.
- Future Tauri plugins, commands, capabilities, and scopes require explicit security review; they must not be inherited from a broad starter capability.
- Application packaging and code signing still require a separate release decision and validation.

## Validation

The following commands passed in native Windows PowerShell on 2026-07-20:

```powershell
cargo fmt --check --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm.cmd --filter @voxleaf/desktop tauri build
```

The resulting `voxleaf-desktop.exe` remained running during a bounded smoke check and exposed the configured `VoxLeaf development shell` window title.

## Alternatives considered

- Electron: mature but expected to have a larger runtime footprint.
- Browser-only application: insufficient local process and model integration for the intended MVP.
- Fully native UI: would add a larger learning and implementation cost without clear MVP benefit.
