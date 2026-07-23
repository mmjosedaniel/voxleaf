# ADR-0005: Use pnpm and uv with a cross-language root check surface

## Status

Accepted.

This decision selects the foundation tooling. The workspace, language-specific tooling, lockfiles, root command surface, and deterministic Windows and Ubuntu continuous integration are implemented and validated.

## Context

VoxLeaf will contain a React and TypeScript desktop application, framework-independent TypeScript packages, a Rust Tauri shell, and a Python TTS service. Contributors need reproducible installs and a small command surface without hiding language-native diagnostic commands.

The initial target is native Windows, while WSL and Linux CI remain useful for portable checks. Generated dependencies and build outputs cannot be shared between Windows and Linux. Tooling added during the foundation milestone must not introduce EPUB, TTS-model, process-transport, or audio choices.

## Decision

### JavaScript and TypeScript workspace

- Use the pinned pnpm release from the root `package.json` and a root [`pnpm-workspace.yaml`](https://pnpm.io/workspaces).
- Include `apps/desktop`, `packages/shared`, and `packages/epub` as workspace members. The Python service is not a pnpm workspace member.
- Keep one root `pnpm-lock.yaml` as the only JavaScript dependency lockfile. The root workspace owns it; package-level npm, Yarn, Bun, or pnpm lockfiles are not allowed.
- Declare internal TypeScript dependencies with pnpm's [`workspace:` protocol](https://pnpm.io/workspaces#workspace-protocol-workspace) so a missing local package cannot silently resolve from a registry.
- Use [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references) to preserve package boundaries and enable ordered builds. Each package owns its local compiler settings while extending shared strict defaults.
- Do not add Turborepo, Nx, or another task orchestrator during the foundation milestone. pnpm recursive and filtered commands are sufficient for the planned workspace size.

### Runtime declarations

- Keep `.nvmrc` and `package.json#engines` as the Node.js declarations and `packageManager` as the exact pnpm declaration.
- Keep `rust-toolchain.toml` as the exact Rust toolchain, component, and native-target declaration.
- Keep `.python-version` as the Python declaration used by contributors and uv.
- CI setup must read the committed declarations or use exactly matching values. It must not introduce independent floating runtime versions.

### TypeScript quality tools

Use these root development dependencies:

| Purpose | Selection | Boundary |
| --- | --- | --- |
| Compilation and type checking | TypeScript compiler with strict shared settings and project references | Development only |
| Linting | ESLint flat configuration with `typescript-eslint`; add React-specific rules only with the desktop scaffold | Development only |
| Formatting | Prettier | Development only |
| Unit and component tests | Vitest | Development only |

Vitest is selected because it aligns with the candidate Vite frontend and supports fast package-level tests. Framework-specific DOM test libraries and environments are deferred until a real desktop test requires them.

Tool versions are resolved and committed through the root `pnpm-lock.yaml`. None of these tools may become a shipped application dependency.

### Python project and quality tools

- Manage `services/tts` as one [uv project](https://docs.astral.sh/uv/guides/projects/) with `pyproject.toml`, a service-local `.venv`, and a committed `services/tts/uv.lock`.
- Treat `services/tts/pyproject.toml` as the only owner of Python runtime and development dependency declarations. Do not maintain parallel `requirements.txt`, Poetry, Pipenv, or Conda lock data.
- Use `uv sync --locked` for reproducible environments and `uv run --locked` for project commands.
- Pin the uv executable itself to an exact version in setup documentation and CI because `uv.lock` does not manage uv. Do not install uv inside the project environment.
- Use [Ruff](https://docs.astral.sh/ruff/) for formatting, import ordering, and linting; [mypy](https://mypy.readthedocs.io/en/stable/) for static type checking; [pytest](https://docs.pytest.org/en/stable/) for deterministic tests; and [`uv_build`](https://docs.astral.sh/uv/concepts/build-backend/) with `uv build` for the initial pure-Python service package.
- Put Ruff, mypy, and pytest in the Python development dependency group. Keep future inference libraries in normal runtime dependencies only when TTS evaluation justifies them.
- If the service itself later requires compiled extension modules or a layout unsupported by `uv_build`, reconsider only the build backend. Do not replace uv environment and lock ownership without a superseding ADR.

The Python lockfile is intentionally separate from `pnpm-lock.yaml`: each lockfile has one ecosystem and one owner. Neither environment is installed globally, and Windows and WSL use separate `.venv` directories.

### Rust quality tools and lock ownership

- Use `rustfmt`, Clippy with warnings denied, Cargo tests, and Cargo builds from the pinned toolchain.
- Keep the Tauri crate's committed `Cargo.lock` beside its Cargo workspace or manifest under `apps/desktop/src-tauri`. Do not create a second Rust lockfile unless a future independent Rust workspace requires and documents one.
- Retain direct Cargo commands with `--manifest-path` for focused diagnosis even when root commands wrap them.

### Root and focused command surfaces

The root `package.json` provides these validated cross-language commands:

- `format` for intentional formatting changes.
- `format:check` for non-mutating formatting validation.
- `lint` for ESLint, Ruff, and Clippy.
- `typecheck` for TypeScript and mypy.
- `test` for Vitest, Cargo tests, and pytest.
- `build` for TypeScript packages, the desktop production build, the Rust shell, and the Python distribution.
- `check` as the deterministic aggregate used before review and in CI.

Task 5.1 implemented these names with portable package scripts and explicit working directories. The scripts use command chaining supported by both Windows and POSIX package-script execution and preserve the first failing exit code.

Focused commands remain first-class:

- Use pnpm filters for one TypeScript workspace package.
- Use Cargo with the Tauri manifest path for Rust formatting, linting, tests, and builds.
- Use uv with `--project services/tts` for Python formatting, linting, typing, tests, and builds.

The root commands must call the same focused checks rather than define weaker duplicate checks.

### Initial continuous-integration strategy

- Make a Windows GitHub-hosted job required and authoritative. It performs frozen JavaScript and Python installs, the aggregate deterministic checks, and the native Tauri production build.
- Add an Ubuntu GitHub-hosted job for portable TypeScript package and Python checks. It does not replace native Windows validation and does not need Linux desktop dependencies during this milestone.
- Pin GitHub Actions to full commit SHAs and tool versions to exact releases. Choose explicit [supported runner labels](https://docs.github.com/en/actions/concepts/runners/github-hosted-runners) when implementing the workflow and review runner-image changes separately from dependency upgrades.
- Key caches by operating system and the applicable lockfiles. Never restore `node_modules`, `.venv`, Rust `target`, or native build outputs across operating systems.
- Do not require a GPU, model weights, private data, external services, performance benchmarks, or generated audio in deterministic pull-request CI.

Task 5.2 implements this strategy in `foundation-checks.yml`. It uses the explicit supported runner labels `windows-2022` and `ubuntu-24.04`; reads Node.js, Python, and Rust versions from the repository declarations; pins pnpm and uv exactly; and pins every action to a full commit SHA. Only uv's dependency-download cache is enabled, with an operating-system-specific suffix. The portable job deliberately excludes Rust and Tauri and runs `check:portable`; the authoritative Windows job runs the complete `check` command.

The native job moved from `windows-2025` to the still-supported explicit
`windows-2022` label when packaged WebView2 automation was introduced.
Repeated `windows-2025` runs with WebView2 `150.0.4078.65` built and launched
the host but never created EdgeDriver's `DevToolsActivePort`, including with a
runtime-matched, Microsoft-signed driver and Tauri's supported WebDriver bridge.
The `windows-2022` run used WebView2 `131.0.2903.86` and passed. Because the
runner image and WebView2 major version changed together, the evidence
establishes a known-good hosted image/runtime pair but does not isolate an
operating-system defect from a WebView2 150 or image/runtime interaction.
Server 2022 retains the same pinned repository toolchains and complete `check`
ownership.

## Dependency impact

- pnpm, uv, Rust, Cargo, and CI actions are development or build infrastructure, not shipped application libraries.
- TypeScript, ESLint, `typescript-eslint`, Prettier, and Vitest are root JavaScript development dependencies.
- Ruff, mypy, pytest, and `uv_build` are Python development or build dependencies; they are not TTS runtime dependencies.
- This decision adds no production dependency and makes no choice about React runtime packages, EPUB handling, TTS inference, local process transport, or audio playback.

## Consequences

- Contributors get one root command vocabulary while retaining direct ecosystem commands for diagnosis.
- JavaScript, Python, and Rust each have a clear dependency owner and committed lock boundary.
- The repository avoids an additional monorepo task runner and overlapping Python formatters or linters.
- Windows remains the source of truth for desktop behavior, while portable failures can be detected earlier on Linux.
- Root scripts must carefully preserve exit codes and equivalent behavior across PowerShell and POSIX shells.
- Two dependency ecosystems plus Cargo require separate install steps internally, even though root commands provide a common entry point.
- mypy may require explicit stubs or narrowly documented exclusions for future model libraries; missing types must not be hidden globally.

## Alternatives considered

- **npm or Yarn workspaces:** credible, but pnpm is already pinned, has native workspace support, supports one shared lockfile, and can require local resolution with `workspace:` dependencies.
- **Bun:** combines several tools but would add another runtime and has not been validated against the selected Tauri workflow.
- **Turborepo or Nx:** useful for large workspaces and remote caching, but unnecessary for three initial TypeScript packages and would add configuration and dependency cost.
- **Biome instead of ESLint and Prettier:** offers a smaller tool count, but ESLint's TypeScript and React ecosystem plus Prettier's narrow formatting role are the more conservative foundation choice. This can be revisited if configuration cost becomes material.
- **Jest instead of Vitest:** mature, but Vitest better matches the candidate Vite build pipeline and avoids a separate transformation configuration.
- **Poetry, PDM, pip-tools, or raw `venv` plus requirements files:** workable, but uv provides cross-platform locking, environment synchronization, command execution, and builds through one tool.
- **Black, isort, and Flake8 instead of Ruff:** established, but they overlap and require more dependencies and configuration than Ruff's formatter and linter.
- **Pyright instead of mypy:** strong and fast, but mypy can be installed, locked, and run entirely inside the Python project without adding another Node-managed tool boundary.
- **Windows-only CI:** simpler, but it would not catch accidental platform assumptions in framework-independent TypeScript and Python code.
- **Linux-first CI with occasional Windows builds:** cheaper for some checks, but cannot validate the product's canonical native target.
