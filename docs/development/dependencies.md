# Dependency inventory

## Scope and ownership

This inventory covers every dependency declared directly by the repository and explains how transitive dependencies are controlled. The Milestone 1 foundation established the initial inventory; ADR-0006 added a development-time schema-to-TypeScript generator, Milestone 2 Task 2.1 added the first runtime JSON Schema validator for a real decoder, and Task 5.5 added test-only Python schema validation plus Node declarations for cross-language fixture conformance. This inventory does not approve future EPUB, TTS-model, process-transport, audio, persistence, hardware, installer, updater, or telemetry dependencies.

Dependency declarations and resolved versions have one owner per ecosystem:

| Ecosystem | Direct declarations | Resolved transitive graph |
| --- | --- | --- |
| JavaScript and TypeScript | Root and package `package.json` files | Root `pnpm-lock.yaml` |
| Python | `services/tts/pyproject.toml` | `services/tts/uv.lock` |
| Rust | `apps/desktop/src-tauri/Cargo.toml` | `apps/desktop/src-tauri/Cargo.lock` |
| GitHub Actions | `.github/workflows/foundation-checks.yml` | Full commit SHA on each `uses` entry |

Generated dependency directories and environments are ignored. Windows and Linux or WSL installations must remain separate.

## Shipped application dependencies

These are the only direct libraries that can participate in the foundation application's runtime output.

| Dependency | Version | Purpose | Alternatives and justification |
| --- | --- | --- | --- |
| `react` | `19.2.7` | Defines the desktop shell's component and accessibility structure. | Preact, Vue, Svelte, or a fully native UI were credible. React was selected with TypeScript because it matches the intended webview architecture and maintainer experience; changing UI framework would not remove the need for a native shell. |
| `react-dom` | `19.2.7` | Mounts React into the Tauri webview DOM. | A different renderer or framework would require replacing React as well. `react-dom` is the standard browser renderer for the selected React UI and adds no network service. |
| `ajv` | `8.20.0` | Validates untrusted shared-contract input against the canonical JSON Schema Draft 2020-12 documents before semantic domain construction. It performs no network access and does not log rejected input. | Handwritten structural validation could drift from the canonical schemas. Zod and TypeBox would make a TypeScript representation authoritative, contrary to ADR-0006. Ajv was selected because its dedicated 2020 export supports the repository's declared dialect and offline schema registration. |
| `tauri` Rust crate | `2.11.5` | Creates the native Windows application and embeds the local webview. The current shell registers no commands or plugins and grants no capabilities. | Electron was rejected for its expected runtime footprint; browser-only deployment cannot satisfy future local process requirements; a fully native UI would increase implementation cost. ADR-0001 records the decision. |

The Python package has no runtime dependencies. `@voxleaf/epub` has one local workspace dependency, `@voxleaf/shared`, so it can consume the public book and locator contract boundary without a source-relative import or a reverse dependency. `@voxleaf/shared` has only the validator listed above. No EPUB parser, renderer, TTS engine, model runtime, server, audio library, or persistence library is installed.

## JavaScript and TypeScript development dependencies

| Dependency | Version | Purpose |
| --- | --- | --- |
| `@eslint/js` | `10.0.1` | Supplies ESLint's core recommended JavaScript rules. |
| `eslint` | `10.7.0` | Runs static lint checks across TypeScript and React sources. |
| `eslint-plugin-react-hooks` | `7.1.1` | Checks React Hook usage and dependency rules. |
| `eslint-plugin-react-refresh` | `0.5.3` | Protects component exports needed for reliable Vite fast refresh. |
| `globals` | `17.7.0` | Provides explicit browser and tool global definitions to ESLint. |
| `json-schema-to-typescript` | `15.0.4` | Deterministically generates reviewable TypeScript wire DTOs from the canonical JSON Schema contracts selected by ADR-0006. |
| `prettier` | `3.9.5` | Enforces deterministic formatting for supported web and configuration files. |
| `typescript` | `6.0.3` | Compiles and type-checks the strict composite projects. |
| `typescript-eslint` | `8.64.0` | Parses TypeScript for ESLint and supplies TypeScript-aware rules. |
| `vitest` | `4.1.10` | Runs deterministic package and React smoke tests. |
| `@tauri-apps/cli` | `2.11.4` | Drives native Tauri development and production builds. |
| `@testing-library/dom` | `10.4.1` | Supplies DOM queries centered on observable accessible behavior. |
| `@testing-library/jest-dom` | `6.9.1` | Adds readable DOM assertions to Vitest. |
| `@testing-library/react` | `16.3.2` | Renders React components for the shell smoke test. |
| `@types/react` | `19.2.17` | Provides React's TypeScript declarations. |
| `@types/react-dom` | `19.2.3` | Provides React DOM's TypeScript declarations. |
| `@types/node` | `26.1.1` | Types the test-only Node filesystem and path APIs that load the shared serialized conformance corpus. |
| `@vitejs/plugin-react` | `6.0.3` | Integrates React transforms and fast refresh with Vite. |
| `jsdom` | `29.1.1` | Supplies an in-process browser-like DOM for component tests. |
| `vite` | `8.1.5` | Runs the focused browser development server and builds webview assets. |

These packages are development-only. ESLint with `typescript-eslint`, Prettier, Vitest, Testing Library, and jsdom were selected as a compact stack aligned with React and Vite. Biome could combine formatting and linting, Jest could replace Vitest, and browser-driven component tests could replace jsdom; the selected tools require less custom integration for the current Vite shell. A monorepo task runner such as Nx or Turborepo remains unjustified for three TypeScript projects.

`json-schema-to-typescript` is preferred over handwritten TypeScript wire DTOs because generated DTOs cannot silently become an independent contract authority. TypeScript-first runtime-schema libraries were rejected because the cross-language schema should not be generated from a language-specific executable source. The generator is development-only. Ajv is recorded separately as a runtime dependency because Task 2.1 introduces the first decoder that must reject malformed and unsupported serialized input before domain construction.

## Rust build dependency

| Dependency | Version | Purpose |
| --- | --- | --- |
| `tauri-build` | `2.6.3` | Generates the build metadata and platform resources required by the Tauri crate's Cargo build script. |

Rustfmt, Clippy, Cargo test, and Cargo build come from the pinned Rust toolchain rather than Cargo package dependencies.

## Python development and build dependencies

| Dependency | Resolved version | Purpose |
| --- | --- | --- |
| `ruff` | `0.15.22` | Formats and lints the Python package. |
| `mypy` | `2.3.0` | Performs strict static type checking. |
| `pytest` | `9.1.1` | Runs deterministic Python smoke and cross-language contract-conformance tests. |
| `jsonschema` | `4.26.0` | Validates the shared serialized fixture corpus against the canonical Draft 2020-12 schemas entirely offline during Python tests. |
| `types-jsonschema` | `4.26.0.20260518` | Supplies mypy declarations for the test-only `jsonschema` API. |
| `uv_build` | compatible `0.11.x` selected by the build frontend | Builds the pure-Python source distribution and wheel; it is an isolated build-system requirement, not a service runtime dependency. |

Ruff replaces the overlapping Black, isort, and Flake8 toolchain. Mypy and pytest are established focused tools for typing and tests. Python's `jsonschema` validator was selected instead of a handwritten structural model so Python checks the language-neutral canonical schemas rather than creating a second contract authority; it and its typing package remain in the development group and are not service runtime dependencies. `uv_build` is appropriate for the current pure-Python package; a compiled-extension requirement could justify a different backend later without replacing uv's environment and lock ownership.

## Continuous-integration actions

| Action | Release represented by pinned SHA | Purpose |
| --- | --- | --- |
| `actions/checkout` | `6.0.2` | Checks out the exact repository revision without persisting credentials. |
| `actions/setup-node` | `6.4.0` | Installs Node.js from `.nvmrc`; package-manager caching is disabled. |
| `actions/setup-python` | `6.2.0` | Installs Python from `.python-version`. |
| `astral-sh/setup-uv` | `8.1.0` | Installs exact uv `0.11.29` and maintains an OS-separated download cache. |

Each workflow reference is pinned to a full commit SHA to avoid a mutable tag changing executable CI code. The workflow uses no third-party service, secret, model, book, generated audio, or GPU.

## Transitive dependencies

Transitive packages are implementation details of the direct dependencies above, not independent architecture choices. Their concrete names, versions, integrity hashes, and dependency edges are committed in the three ecosystem lockfiles. They exist only to support the documented direct parent that brings them into the graph; application code must not import an undeclared transitive package.

Review the resolved top-level graphs from the repository root with:

```powershell
pnpm.cmd list --recursive --depth 0
uv tree --project services/tts --locked --depth 1
cargo tree --manifest-path apps/desktop/src-tauri/Cargo.toml --depth 1
```

When a direct dependency or lockfile changes, review the lock diff for unexpected production code, native capabilities, lifecycle scripts, licensing concerns, network behavior, or large artifacts. Update this inventory when adding or removing a direct dependency. A transitive package must become a declared direct dependency before VoxLeaf source code relies on it.
