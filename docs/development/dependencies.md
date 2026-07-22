# Dependency inventory

## Scope and ownership

This inventory covers every dependency declared directly by the repository and explains how transitive dependencies are controlled. The Milestone 1 foundation established the initial inventory; ADR-0006 added a development-time schema-to-TypeScript generator, Milestone 2 Task 2.1 added the first runtime JSON Schema validator for a real decoder, Task 5.5 added test-only Python schema validation plus Node declarations for cross-language fixture conformance, and Milestone 3 Task 1.2 selected the low-level ZIP and XML primitives proven below. This inventory does not approve future TTS-model, process-transport, audio, persistence, hardware, installer, updater, telemetry, or renderer-framework dependencies.

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
| `@zip.js/zip.js` | `2.8.30` | Supplies narrowly wrapped, in-memory ZIP metadata iteration, deterministic test-fixture writing, and bounded entry decompression for implemented EPUB ingestion. VoxLeaf selects the pure-JavaScript core subpath, disables workers and native compression streams, enables strict ambiguity, overlap, and signature checks, and never instantiates its HTTP, Blob, or filesystem-oriented APIs. | JSZip and fflate were credible low-level alternatives, but adopting either would require more repository-owned ZIP metadata, overlap, integrity, streaming, and cancellation machinery. A renderer-oriented EPUB framework is prohibited by ADR-0007. Version `2.8.30` is the first release with the required strict canonical archive selection and had crossed the workspace's seven-day release-age gate; `2.8.31` through `2.8.33` had not. |
| `saxes` | `6.0.0` | Supplies strict, namespace-aware, non-validating streaming XML events without creating a DOM. The wrapper registers no resolver, rejects every `DOCTYPE`, accepts only XML 1.0, and maps parser failures to fixed content-free codes. | Browser `DOMParser` is not an ingestion security boundary. Object-building parsers such as fast-xml-parser would add an eager intermediate representation, while the older `sax` package offers a less precise namespace/type surface. `saxes` keeps XML policy in a narrow event adapter. |
| `tauri` Rust crate | `2.11.5` | Creates the native Windows application and embeds the local webview. The current shell registers no commands or plugins and grants no capabilities. | Electron was rejected for its expected runtime footprint; browser-only deployment cannot satisfy future local process requirements; a fully native UI would increase implementation cost. ADR-0001 records the decision. |

The Python package has no runtime dependencies. `@voxleaf/epub` depends on the local `@voxleaf/shared` contract boundary plus the two low-level ingestion libraries above. `@voxleaf/shared` has only the validator listed above. No EPUB renderer, TTS engine, model runtime, server, audio library, or persistence library is installed.

### EPUB archive/XML selection evidence

The package-internal executable probes are intentionally not exported from `@voxleaf/epub`; Tasks 2.2 through 2.4 built the production archive and XML security adapters over these proven primitives. The probes, production adapters, and complete public ingestion matrix establish the following behavior with synthetic in-memory input:

| Concern | Evidence and accepted boundary |
| --- | --- |
| ESM and TypeScript | Both package imports compile under the repository's strict ESM composite project and execute under Vitest. The public `@voxleaf/epub` runtime surface exposes only `openEpubPublication`; archive/XML adapters and dependency objects remain internal. |
| ZIP integrity | `strictness: "strict"` rejects appended data and ambiguous/local-header interpretations, `checkSignature` rejects modified entry bytes, and `checkOverlappingEntry` rejects central-directory entries redirected onto an earlier local entry regardless of read order. Encrypted input is rejected by the wrapper. The [upstream `2.8.26...2.8.30` changes](https://github.com/gildas-lormeau/zip.js/compare/v2.8.26...v2.8.30) are security-relevant: `2.8.28` corrected overlap-order handling and `2.8.30` added bounded canonical archive selection. |
| ZIP cancellation | `AbortSignal` is checked by the wrapper and passed into zip.js entry reads; an already-aborted operation returns only the fixed `cancelled` code. |
| ZIP capabilities | The wrapper imports `@zip.js/zip.js/lib/zip-core-native.js`, where `native` means the package's pure-JavaScript codec variant. It uses only `Uint8ArrayReader`, `Uint8ArrayWriter`, and `ZipReader`; sets `useWebWorkers`, `useCompressionStream`, and `transferStreams` to `false`; and performs no disk extraction. Runtime spies prove compressed extraction does not construct a worker or call `fetch`. |
| XML security | `saxes` parses fixed byte chunks with `xmlns: true`, forced XML 1.0, no DOM, and no resolver callback. The production adapter strictly decodes matching UTF-8/UTF-16 signatures and declarations, emits only immutable namespace-URI/local-name events, and rejects every `DOCTYPE`, custom entity, XInclude element, unsupported or mismatched encoding, and external-resource processing instruction with only `malformed-xml`; network, worker, and DOM spies remain untouched. Built-in XML character references remain supported. |
| XML cancellation | The synchronous parser receives policy-bounded bytes in fixed chunks, checks the shared `AbortSignal` and injected monotonic deadline before and after decode writes and at event/text-counting boundaries, and enforces document-size, depth, per-element attribute, per-document node, and ingestion-lifetime UTF-8-equivalent text limits. |
| Error privacy | Dependency messages, source strings, entry names, URLs, causes, and raw values do not cross the probe wrappers; tests use canary values to verify fixed codes. |

`@zip.js/zip.js` is BSD-3-Clause licensed, declares no runtime transitive dependencies, has no install lifecycle hook, and reports 5,069,239 unpacked bytes for the complete multi-runtime package. Production EPUB ingestion imports only its narrow pure-JavaScript core; the desktop application does not yet import `@voxleaf/epub`, so ZIP code is not part of the current desktop bundle. Bundle impact must be measured when the reader first makes ingestion reachable from the application.

`saxes` is ISC licensed and reports 163,774 unpacked bytes. Its only runtime transitive is MIT-licensed `xmlchars@2.2.0`, which has no dependencies and reports 58,957 unpacked bytes. Neither package declares an install lifecycle hook. The exact production edges and integrity hashes are committed in `pnpm-lock.yaml`.

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
