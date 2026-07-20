# ADR-0001: Build VoxLeaf as a local-first desktop application

## Status

Accepted

## Context

The product must open local EPUB files, run neural TTS on the user's hardware, manage a local model process, and play streamed audio without sending book contents to a remote service.

A conventional browser application would face file-system, process-management, model-runtime, and distribution limitations.

## Decision

Build VoxLeaf as a desktop application with a web-based user interface and native desktop shell.

Tauri with React and TypeScript is the initial candidate stack. The exact bootstrap configuration will be validated before being treated as final.

## Consequences

- The application can manage local files and processes.
- Distribution requires platform-specific packaging.
- Rust and native build dependencies become part of development setup.
- The UI can remain aligned with the maintainer's React and TypeScript experience.
- Browser-only deployment is not an MVP objective.

## Alternatives considered

- Electron: mature but expected to have a larger runtime footprint.
- Browser-only application: insufficient local process and model integration for the intended MVP.
- Fully native UI: would add a larger learning and implementation cost without clear MVP benefit.
