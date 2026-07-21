# Development setup

## Current status

The implementation toolchain has not been initialized. Commands must be added to this document only after they exist and have been run successfully.

## Windows and WSL environment boundary

### Canonical Windows environment

Windows is the canonical environment for native Tauri development and validation. Native desktop setup, development, testing, and packaging must run from Windows because the shipped application targets Windows and depends on Windows-specific tooling and runtime behavior.

The exact Rust target, Visual Studio Build Tools, WebView2, Node.js, package-manager, and Python requirements are not yet verified. Add their versions and commands here only after the corresponding foundation tasks introduce and validate them.

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

No project commands are defined yet.

When toolchains are initialized, document:

- Dependency installation.
- Development startup.
- Formatting.
- Linting.
- Type checking.
- Unit tests.
- Integration tests.
- End-to-end tests.
- Performance benchmarks.
- Production build.
