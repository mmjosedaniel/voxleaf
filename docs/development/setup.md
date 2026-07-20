# Development setup

## Current status

The implementation toolchain has not been initialized. Commands must be added to this document only after they exist and have been run successfully.

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
