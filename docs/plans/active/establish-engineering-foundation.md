# Establish the engineering foundation

## Goal

Complete Milestone 1 of the VoxLeaf development roadmap by turning the documentation-only repository into a reproducible, minimal development workspace for the desktop application, shared TypeScript code, EPUB package, Rust shell, and Python TTS service.

The milestone must validate the candidate desktop stack, establish deterministic quality commands and continuous integration, and document a safe Windows and WSL workflow without implementing EPUB reading, TTS inference, audio playback, or other product behavior.

## User-visible outcome

There is no end-user feature in this milestone. A contributor should be able to clone the repository on a documented supported Windows environment, install pinned toolchains and dependencies, run deterministic checks, build the empty desktop shell and packages, and run a minimal Python service test without model weights, a GPU, private data, or undocumented commands.

## Background and current state

The product requirements, architecture overview, performance budget, four accepted ADRs, development guidance, and high-level roadmap exist. The roadmap identifies the engineering foundation as the first implementation milestone.

At plan creation:

- `main` includes the merged roadmap.
- The working tree is clean.
- No application or package implementation exists.
- No `package.json`, JavaScript lockfile, workspace declaration, `Cargo.toml`, Rust toolchain declaration, `pyproject.toml`, Python lockfile, test configuration, or CI workflow exists.
- No project installation, formatting, linting, type-checking, testing, development, or build command is defined.
- Node.js `v20.20.0` and Git are visible in the inspected Windows environment.
- A `pnpm.cmd` executable is present, but its version could not be verified inside the restricted inspection process.
- Rust and Cargo are not visible in the inspected Windows environment.
- `python` resolves only to the Windows application alias, and neither a usable interpreter nor `py` was verified.
- The user normally works from WSL Ubuntu, while the initial product target is a native Windows desktop application. The repository does not yet document which commands belong to Windows and which may run safely in WSL.

These missing tools and configurations are expected work for this milestone. They do not block beginning it, provided the decision tasks are completed before scaffolding depends on them.

## Readiness assessment

Milestone 1 is ready to begin because:

- Its upstream dependency is the documentation foundation, which is present and merged.
- Its scope is explicitly defined by the roadmap.
- There is no existing implementation to migrate or preserve.
- Candidate technologies are identified but are still honestly marked as candidates.
- The repository already defines privacy, dependency, testing, documentation, and definition-of-done rules.

Implementation must not begin with blind framework generators. The environment boundary, version policy, package manager, workspace shape, and stack validation criteria must be recorded first.

## Scope

- Record the canonical Windows development environment and safe WSL usage boundary.
- Select and pin supported Node.js, package-manager, Rust, and Python versions.
- Select one JavaScript workspace and package-manager strategy.
- Initialize minimal workspace metadata for `apps/desktop`, `packages/shared`, and `packages/epub`.
- Create a minimal React and TypeScript desktop web shell.
- Validate and either adopt or reject the Tauri 2 native shell candidate.
- Create minimal buildable Rust shell code only as required by Tauri validation.
- Create an isolated Python project for `services/tts` with a deterministic smoke test that does not load a model or open a network service.
- Add formatting, linting, type-checking, unit-test, and production-build commands.
- Add deterministic CI that does not require books, audio, model weights, GPU hardware, CUDA, or secrets.
- Document exact verified setup and validation commands.

## Non-goals

- EPUB archive parsing, sanitization, rendering, navigation, or locator implementation.
- Shared product or process protocol contracts; those belong to roadmap Milestone 2.
- Text normalization or semantic chunking.
- TTS model selection, download, loading, inference, benchmarking, or voice support.
- Desktop-to-Python communication or process lifecycle management.
- Audio generation, framing, buffering, playback, or AudioWorklet code.
- Reading-position persistence or application settings storage.
- Hardware detection, CUDA setup, ONNX providers, or CPU fallback behavior.
- Installer generation, code signing, updater configuration, or release packaging.
- Product UI design beyond a minimal accessible shell that proves the desktop stack builds.
- Adding production dependencies for future milestones.

## Relevant files and documentation

- `AGENTS.md`
- `.agents/PLANS.md`
- `README.md`
- `docs/README.md`
- `docs/plans/roadmap.md`
- `docs/product/mvp.md`
- `docs/product/project-brief.md`
- `docs/architecture/overview.md`
- `docs/architecture/performance-budget.md`
- `docs/architecture/decisions/ADR-0001-local-first-desktop.md`
- `docs/development/setup.md`
- `docs/development/testing.md`
- `docs/development/git-workflow.md`
- `SECURITY.md`
- `.gitignore`
- `.editorconfig`

## Architecture and constraints

- Preserve the intended dependency direction: desktop UI depends on application APIs; EPUB logic remains desktop-framework-independent; shared types do not depend on process implementations.
- A successful shell build is not evidence that later EPUB, TTS, protocol, audio, performance, or packaging choices work.
- Keep scaffolds minimal. Do not introduce application abstractions before real use cases exist.
- Do not add any cloud service, telemetry, remote TTS provider, or runtime network dependency.
- Do not add books, generated audio, model weights, private paths, secrets, or content-bearing logs.
- Do not run model or hardware-dependent checks in deterministic CI.
- Document every new dependency, its purpose, whether it is development-only or production, and the credible alternatives considered.
- Generated framework files may be created by their official generator and then reviewed; do not edit generated artifacts manually when regeneration is the supported mechanism.
- Keep Windows and Linux build artifacts, virtual environments, native targets, and dependency directories from being reused across operating systems.

## Technical decisions

### Already accepted

- VoxLeaf is a local-first desktop application with a web-based UI and native shell.
- The desktop and eventual TTS inference run in separate local processes.
- The intended repository areas are `apps/desktop`, `packages/shared`, `packages/epub`, and `services/tts`.
- Tauri 2, React, TypeScript, Vite, and Python are candidate technologies, not yet fully validated selections.
- Normal reading will not persist generated audio or require cloud TTS.

### Working decisions for this milestone

- Native Windows desktop building is the canonical environment because Windows is the initial product target and Tauri requires Windows-native prerequisites.
- WSL may be used for Git, documentation, and isolated Linux checks. It must not reuse Windows `node_modules`, Python virtual environments, Rust `target` directories, or native build outputs. If both environments are needed, use separate clones or worktrees rather than sharing generated artifacts.
- The TypeScript areas form one workspace with one lockfile and one selected package manager.
- The Python service uses its own isolated environment and project metadata rather than being installed into a global interpreter.
- The initial desktop and service code expose only deterministic smoke behavior. No local socket, WebSocket, sidecar launch, model adapter, or public protocol is introduced.
- CI validates deterministic foundation behavior. Hardware and performance jobs are deferred.

### Decision status before dependent tasks start

1. Resolved by Task 1.2 and ADR-0005: use the pinned pnpm release and its native workspace with one root JavaScript lockfile.
2. Resolved by Task 1.2: the supported and selected Node.js, Rust, Cargo, and Python versions are pinned and documented. Future TTS evaluation may require a documented Python revision.
3. Resolved by Tasks 1.1 and 1.2: repository declarations pin the runtimes, Windows is canonical, and Windows/WSL artifacts remain isolated.
4. Resolved by ADR-0005: use TypeScript, ESLint with `typescript-eslint`, Prettier, and Vitest as development-only TypeScript quality tools.
5. Resolved by ADR-0005: use a uv-managed Python project and lockfile with Ruff, mypy, pytest, and `uv_build`.
6. Resolved by ADR-0005: require authoritative Windows CI and add a separate Ubuntu job for portable TypeScript and Python checks.
7. Completed Task 3.2: validated Tauri 2 against the native Windows prerequisites and a production build, and updated ADR-0001 to adopt the candidate direction.

### Decisions explicitly deferred

- EPUB parser, sanitizer, renderer, CFI, and persistence libraries.
- Cross-language contract generation and local process transport.
- TTS engines, model versions, Python inference dependencies, and model installation.
- Audio format, playback API, buffer implementation, and speed control.
- Hardware detection and supported GPU profiles.
- Installer and model distribution strategy.

## Expected files or areas affected

The exact configuration filenames depend on the decisions above, but implementation is expected to affect only these areas:

- Root workspace metadata, runtime-version declarations, lockfiles, and shared development configuration.
- `apps/desktop` for the minimal React/TypeScript UI and native Tauri shell.
- `packages/shared` for a buildable empty or smoke-only TypeScript package without product contracts.
- `packages/epub` for a buildable empty or smoke-only TypeScript package without EPUB dependencies.
- `services/tts` for Python project metadata, a minimal importable package, and deterministic smoke test.
- `.github/workflows` for deterministic CI.
- `.gitignore` and `.editorconfig` only where generated artifacts or tool conventions require focused additions.
- `README.md`, `docs/development/setup.md`, `docs/development/testing.md`, and applicable ADRs for verified commands and decisions.
- This ExecPlan for progress, discoveries, exact commands, and results.

No other product or architecture area should change unless a discovered blocker requires an explicitly documented scope update.

## Validation-command policy

No repository-defined implementation commands exist at plan creation. Commands labeled **existing** below are available inspection or Git commands. Commands labeled **planned** are command names this milestone is expected to define; they must not be reported as working until the task that introduces them has run them successfully and replaced any provisional spelling in this plan with the exact verified command.

The intended top-level command surface is:

- Dependency installation.
- Formatting check.
- Linting.
- Type checking.
- Unit tests.
- Production build.

Prefer a small, memorable command set from the selected workspace tool while retaining direct Rust and Python commands for focused diagnosis.

## Implementation milestones and independently verifiable tasks

## Implementation milestone 1: Resolve prerequisites and record toolchain decisions

### Task 1.1: Record the host and WSL environment boundary

**Specific outcome:** `docs/development/setup.md` explains which Milestone 1 commands must run on Windows, which may run in WSL, and how to avoid sharing incompatible generated artifacts.

**Acceptance criteria:**

- Windows is identified as canonical for native Tauri development and validation.
- WSL guidance covers Git, paths, line endings, dependency directories, Python environments, Rust targets, and separate clones or worktrees.
- The guidance does not claim that unverified commands work.
- No application files are created.

**Validation commands:**

```powershell
git diff --check
git diff -- docs/development/setup.md
```

**Status:** Complete. The Windows/WSL boundary is recorded in `docs/development/setup.md`; the task's documentation validation passed on 2026-07-20.

### Task 1.2: Capture and satisfy the prerequisite version matrix

**Specific outcome:** The setup documentation names the selected and minimum supported Node.js, package-manager, Rust, Cargo, Python, Windows, WebView, and native build prerequisites, with reproducible version declarations where applicable.

**Acceptance criteria:**

- Each selected version is justified by official support from the chosen stack rather than only the current machine state.
- Required tools can be discovered from a new shell in the canonical Windows environment.
- Missing Rust/Cargo and usable Python prerequisites are installed or documented as an explicit blocker before scaffolding proceeds.
- Version declarations are recorded in conventional project files. Task 1.3 must preserve them or explicitly document and validate any revision while deciding the wider workspace and quality-tool strategy.

**Validation commands:**

```powershell
node --version
pnpm.cmd --version
rustc --version
cargo --version
python --version
git diff --check
```

If a different package-manager or Python command is selected, update this task with the exact verified command before marking it complete.

**Status:** Complete. Supported and selected prerequisites are documented and pinned; the canonical Windows host discovers every required command after its environment is refreshed, and the native C++ and WebView prerequisites are installed and verified.

### Task 1.3: Decide the workspace and quality-tool strategy

**Specific outcome:** A documented decision selects the JavaScript package manager and workspace, runtime pinning, TypeScript quality tools, Python project and quality tools, and initial CI operating-system strategy.

**Acceptance criteria:**

- The decision records purpose, alternatives, tradeoffs, and production versus development dependency impact.
- It defines one lockfile owner and one root command surface.
- It defines how focused Rust and Python checks coexist with root workspace checks.
- It does not select EPUB, TTS-model, process-transport, or audio dependencies.

**Validation commands:**

```powershell
git diff --check
git status --short
```

**Status:** Complete. ADR-0005 selects pnpm workspace and lock ownership, runtime declarations, TypeScript and Python quality tools, cross-language root and focused command surfaces, and Windows-authoritative plus Ubuntu-portable CI.

## Implementation milestone 2: Initialize the TypeScript workspace and framework-independent packages

### Task 2.1: Create the reproducible root workspace

**Specific outcome:** The repository has root workspace metadata, a pinned package manager, a lockfile, shared TypeScript configuration, and an install command that succeeds from a clean dependency state.

**Acceptance criteria:**

- Workspace membership is limited to the intended TypeScript areas.
- The lockfile is generated by the selected package manager and committed.
- Installation does not run application services or download model weights.
- Root metadata contains no fake product scripts or unverified claims.
- A second frozen-lockfile installation succeeds in the canonical environment.

**Validation commands:**

```powershell
pnpm.cmd install
pnpm.cmd install --frozen-lockfile
git diff --check
```

These exact commands were verified on the canonical Windows environment on 2026-07-20. The frozen installation was run after removing the generated root `node_modules` directory. The root manifest has no lifecycle or product scripts, and its only dependency is the pinned TypeScript development toolchain.

**Status:** Complete. The root pnpm workspace is limited to the three intended TypeScript areas, pnpm and TypeScript are pinned, the generated lockfile reproduces a clean installation, and the shared strict TypeScript configuration is accepted by the pinned compiler.

### Task 2.2: Add the minimal shared TypeScript package

**Specific outcome:** `packages/shared` is an independently buildable and testable package with no product protocol types yet.

**Acceptance criteria:**

- The package has a clear public entry point and no dependency on desktop, EPUB, Rust, or Python code.
- Its smoke test proves the test runner and package resolution work.
- It contains no speculative domain abstraction or duplicated contract.
- Build and test output is ignored rather than committed.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/shared typecheck
pnpm.cmd --filter @voxleaf/shared test
pnpm.cmd --filter @voxleaf/shared build
```

Task 2.2 must create and verify this package name and these scripts before it is marked complete.

The exact commands above were verified on the canonical Windows environment on 2026-07-20. The test was also verified after deleting `packages/shared/dist`; its `pretest` lifecycle rebuilt the package before Vitest imported `@voxleaf/shared` through the declared public entry point.

**Status:** Complete. `@voxleaf/shared` is a private, composite TypeScript package with an empty public module, no runtime dependencies or product contracts, and independently verified type-check, test, and build commands.

### Task 2.3: Add the minimal EPUB TypeScript package

**Specific outcome:** `packages/epub` is independently buildable and testable while remaining free of EPUB parsing or rendering dependencies.

**Acceptance criteria:**

- The package may depend on shared configuration but not on the desktop framework.
- Its smoke test proves package isolation and test discovery.
- No archive, DOM, sanitizer, renderer, or CFI dependency is introduced.
- The package does not accept or log book text because it implements no product behavior yet.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/epub typecheck
pnpm.cmd --filter @voxleaf/epub test
pnpm.cmd --filter @voxleaf/epub build
```

Task 2.3 must create and verify this package name and these scripts before it is marked complete.

The exact commands above were verified on the canonical Windows environment on 2026-07-20. The test was also verified after deleting `packages/epub/dist`; its `pretest` lifecycle rebuilt the package before Vitest imported `@voxleaf/epub` through the declared public entry point.

**Status:** Complete. `@voxleaf/epub` is a private, composite TypeScript package with an empty public module, no runtime dependencies or product behavior, and independently verified type-check, test, and build commands.

## Implementation milestone 3: Validate the desktop candidate stack

### Task 3.1: Create the minimal accessible React and TypeScript shell

**Specific outcome:** `apps/desktop` builds a minimal React and TypeScript page that clearly identifies itself as a development shell and includes one deterministic UI smoke test.

**Acceptance criteria:**

- The shell has no EPUB, persistence, TTS, audio, model, or networking behavior.
- The markup has a semantic main region and accessible heading.
- The smoke test verifies rendering without depending on native Tauri APIs.
- The web production build succeeds.
- Generated demo assets and unnecessary starter content are removed.

**Validation commands:**

```powershell
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd --filter @voxleaf/desktop build
```

Task 3.1 must create and verify this package name and these scripts before it is marked complete.

The exact commands above were verified on the canonical Windows environment on 2026-07-20. The deterministic jsdom smoke test locates the semantic main landmark and the `VoxLeaf development shell` level-one heading without importing or mocking any Tauri API.

**Status:** Complete. `@voxleaf/desktop` provides a minimal React `19.2.7` and Vite `8.1.5` web shell, an accessible static development-state page, a DOM rendering test, and a successful production build. Native Tauri validation was completed separately in Task 3.2.

### Task 3.2: Validate the Tauri 2 native shell

**Specific outcome:** The React shell runs inside a minimal Tauri 2 application and produces a native Windows development or production build using documented prerequisites.

**Acceptance criteria:**

- Rust and Tauri configuration is minimal and reviewed.
- Native capabilities and permissions are no broader than the empty shell requires.
- No file selection, process launch, network, updater, persistence, or sidecar permission is added.
- Rust formatting, linting, tests, and the applicable native build succeed.
- ADR-0001 is updated to confirm Tauri adoption, or a new decision records why the candidate is rejected.

**Validation commands:**

```powershell
cargo fmt --check --manifest-path apps/desktop/src-tauri/Cargo.toml
cargo clippy --manifest-path apps/desktop/src-tauri/Cargo.toml --all-targets -- -D warnings
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
pnpm.cmd --filter @voxleaf/desktop tauri build
```

These exact commands passed in the canonical Windows environment on 2026-07-20. The release executable was also launched in a bounded smoke check, remained running, exposed the configured `VoxLeaf development shell` window title, and was then stopped.

**Status:** Complete. Tauri 2 is adopted in ADR-0001; the React shell builds and launches as a native Windows executable with no plugins, registered commands, frontend Tauri API, or IPC capabilities.

## Implementation milestone 4: Initialize the Python TTS service project

### Task 4.1: Create the isolated Python project and smoke test

**Specific outcome:** `services/tts` is an importable, testable Python project with isolated dependencies and a deterministic health or version function that does not load a model or open a server.

**Acceptance criteria:**

- Python version and environment creation are reproducible and documented.
- Project metadata and its lockfile or fully pinned development dependency mechanism are committed.
- Formatting, linting, type checking, tests, and package build succeed.
- No PyTorch, ONNX Runtime, Qwen, Kokoro, WebSocket, FastAPI, model weight, GPU, audio, or production server dependency is added.
- Tests contain no book content, private paths, network access, or hardware requirement.

**Validation commands:**

Run from the repository root using the uv project and lock selected by ADR-0005:

```powershell
uv run --project services/tts --locked ruff format --check services/tts
uv run --project services/tts --locked ruff check services/tts
uv run --directory services/tts --locked mypy .
uv run --project services/tts --locked pytest services/tts
uv build services/tts
```

These exact commands passed in the canonical Windows environment on 2026-07-20 with uv `0.11.29` and CPython `3.12.10`.

**Status:** Complete. `services/tts` is an isolated, dependency-free runtime package with a deterministic version function, one smoke test, committed uv lock data, and development-only formatting, linting, type-checking, testing, and build tools.

## Implementation milestone 5: Unify deterministic checks and continuous integration

### Task 5.1: Define and verify the root quality command surface

**Specific outcome:** The root workspace exposes one documented command for each required deterministic check while preserving direct focused commands for diagnosis.

**Acceptance criteria:**

- Installation, format check, lint, type check, unit test, and production build commands are present and documented.
- Root commands cover every Milestone 1 TypeScript, Rust, and Python area or clearly document the required direct companion command.
- Commands fail when a covered check fails and return success only when all covered checks pass.
- Commands do not start a development server, download models, access books, require GPU hardware, or write outside ignored build/cache directories.

**Validation commands:**

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

These exact root commands passed in the canonical Windows environment on 2026-07-20. `pnpm.cmd check` also passed as the deterministic aggregate of formatting validation, linting, type checking, tests, and builds.

**Status:** Complete. The root package exposes documented cross-language `format`, `format:check`, `lint`, `typecheck`, `test`, `build`, and `check` commands while retaining direct TypeScript, Rust, and Python subcommands for focused diagnosis.

### Task 5.2: Add deterministic continuous integration

**Specific outcome:** A pull-request CI workflow installs pinned toolchains and runs all Milestone 1 deterministic checks in a clean environment.

**Acceptance criteria:**

- CI uses lockfiles, exact tool versions, and GitHub Actions pinned to full commit SHAs, as required by ADR-0005.
- A Windows job validates the native desktop shell.
- Any portable job has a distinct purpose and does not duplicate work without justification.
- CI does not use secrets, proprietary fixtures, model weights, CUDA, a GPU, generated audio, or network services at test runtime beyond dependency installation.
- Dependency caching cannot mix Windows and Linux artifacts.
- The workflow passes on the feature branch.

**Validation commands:**

```powershell
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

After pushing the implementation branch, record the exact GitHub Actions check names and successful run URL in the progress log.

**Status:** Complete. The pinned workflow passed on the implementation branch in GitHub Actions run [29800516177](https://github.com/mmjosedaniel/voxleaf/actions/runs/29800516177). The exact successful job names were `Windows native foundation` and `Ubuntu portable foundation`.

### Task 5.3: Complete setup, testing, and dependency documentation

**Specific outcome:** A new contributor can reproduce the milestone using only verified repository documentation.

**Acceptance criteria:**

- `README.md` and `docs/development/setup.md` contain exact verified installation, development, validation, and build commands.
- `docs/development/testing.md` identifies which foundation tests are deterministic and what remains deferred.
- Every direct and transitive top-level dependency added by the scaffold has a documented purpose; production dependencies include alternatives and justification.
- Windows and WSL guidance matches the actual tested workflow.
- Documentation does not claim EPUB, TTS, audio, persistence, hardware, or installer features work.

**Validation commands:**

```powershell
git diff --check
pnpm.cmd install --frozen-lockfile
pnpm.cmd format:check
pnpm.cmd lint
pnpm.cmd typecheck
pnpm.cmd test
pnpm.cmd build
```

**Status:** Not started.

## Acceptance criteria for Milestone 1

Milestone 1 is complete only when:

- The selected stack and supported tool versions are documented and reproducible.
- The candidate Tauri 2, React, TypeScript, and Python direction is validated or replaced by a documented decision.
- `apps/desktop`, `packages/shared`, `packages/epub`, and `services/tts` are minimal, buildable, and covered by smoke tests.
- The JavaScript workspace and Python project install reproducibly from committed lock or pin data.
- TypeScript, Rust, and Python formatting, linting, type checking, tests, and builds pass using documented commands.
- Deterministic CI passes, including native Windows desktop validation.
- No future product behavior, model dependency, protocol, or broad native permission was introduced.
- No copyrighted books, generated audio, model weights, secrets, private user data, or content-bearing logs were added.
- Documentation accurately distinguishes implemented foundation behavior from planned product behavior.
- The final diff contains no unrelated changes.

## Testing and benchmark strategy

Milestone 1 uses only deterministic smoke coverage:

- TypeScript package-resolution, type-check, test-discovery, and build smoke tests.
- One accessible React shell render test.
- Rust format, lint, test, and native shell build validation.
- Python import, health/version function, format, lint, type, test, and package-build validation.
- Clean dependency installation from committed lock data.
- CI parity with the documented local checks.

No EPUB fixture, TTS quality test, model benchmark, audio playback, hardware detection, performance benchmark, integration protocol, or end-to-end reading test belongs in this milestone. Those checks become applicable in later roadmap milestones.

Before reporting completion, replace every provisional validation command in this plan with the exact command that exists in repository configuration and record its outcome.

## Risks and rollback

### Windows and WSL artifact conflicts

**Risk:** Reusing dependency directories, Python environments, Rust targets, or native artifacts across Windows and WSL can create nondeterministic failures.

**Mitigation:** Make Windows canonical for native builds, ignore all generated artifacts, document separate environments, and recommend separate clones or worktrees when both operating systems build the project.

### Premature stack commitment

**Risk:** Framework generators can make Tauri or a quality stack appear adopted before native build and packaging prerequisites are proven.

**Mitigation:** Keep the shell minimal, validate an actual native build, and record the decision before adding product code.

### Unsupported or short-lived tool versions

**Risk:** Selecting versions based only on what is installed may conflict with Tauri, Python TTS libraries, or long-term support windows.

**Mitigation:** Select versions from official compatibility documentation, pin them, and keep future TTS constraints visible without installing TTS dependencies now.

### Excessive scaffold complexity

**Risk:** A generator may add state management, UI libraries, telemetry, updater, permissions, demo assets, or other unjustified dependencies.

**Mitigation:** Review generated output, remove unnecessary starter content, document dependencies, and reject capabilities outside the empty-shell scope.

### Cross-language command fragmentation

**Risk:** Contributors may not know which TypeScript, Rust, and Python commands constitute a complete check.

**Mitigation:** Provide a small root command surface and document direct focused commands and CI parity.

### Slow Windows CI

**Risk:** Native dependency installation and Tauri builds may make every check expensive.

**Mitigation:** Separate fast portable checks from required native validation only when the distinction is explicit, cache by OS and lockfile, and avoid model or hardware work.

### Python packaging assumptions

**Risk:** Choosing a Python version or packaging tool now could later conflict with the selected TTS engines.

**Mitigation:** Keep the service dependency-free or development-only, record the decision as revisitable, and do not install inference frameworks in this milestone.

### Rollback

Foundation tasks should be committed independently. If a stack validation fails, revert only the relevant scaffold task, retain its documented evidence, and update the technical decision before trying an alternative. Do not carry abandoned generated files or lockfiles into the replacement approach.

## Progress log

- 2026-07-20: Confirmed roadmap PR #2 is merged and fast-forwarded local `main` to the approved roadmap.
- 2026-07-20: Inspected the repository and confirmed that no implementation, project configuration, lockfile, tests, or CI workflow exists.
- 2026-07-20: Verified Node.js and Git are visible; found `pnpm.cmd` but could not verify it within the restricted inspection process; Rust/Cargo and a usable Python interpreter were not verified.
- 2026-07-20: Confirmed Milestone 1 is ready to begin once its environment and tool decisions are resolved in sequence.
- 2026-07-20: Created this ExecPlan. No implementation tasks have started.
- 2026-07-20: Completed Task 1.1 by documenting Windows as the canonical native Tauri environment, defining WSL's optional role, and isolating paths, line endings, dependency directories, Python environments, Rust targets, and generated artifacts. `git diff --check` passed and the scoped diff was reviewed; no application files were created.
- 2026-07-20: Completed Task 1.2. Installed and verified Node.js `24.18.0`, pnpm `11.15.1`, rustup `1.29.0`, Rust/Cargo `1.97.1`, Python `3.12.10`, Visual Studio Build Tools 2022 `17.14.36` with MSVC `14.44.35207` and Windows SDK `10.0.26100.0`; confirmed WebView2 Evergreen `150.0.4078.83`; added conventional version declarations and the prerequisite matrix.
- 2026-07-20: Completed Task 1.3 by accepting ADR-0005. Selected the pnpm workspace, per-ecosystem lock ownership, cross-language root command contract, TypeScript and Python quality stacks, focused Rust/Python checks, and Windows-authoritative plus Ubuntu-portable CI strategy. No dependencies or application code were added.
- 2026-07-20: Completed Task 2.1. Added an explicit pnpm workspace for `apps/desktop`, `packages/shared`, and `packages/epub`; pinned TypeScript `7.0.2`; generated the pnpm lockfile; added shared strict compiler defaults; and verified both normal and clean frozen-lockfile installations with pnpm `11.15.1`.
- 2026-07-20: Completed Task 2.2. Added `@voxleaf/shared` as a composite TypeScript project with an empty public entry point, pinned Vitest `4.1.10`, and verified type-checking, public-package resolution in a smoke test, and declaration/JavaScript builds. No runtime dependency or product contract was introduced.
- 2026-07-20: Completed Task 2.3. Added dependency-free `@voxleaf/epub` as a composite TypeScript project, registered it in the root project-reference graph, and verified type-checking, public-package resolution from clean build output, and declaration/JavaScript builds. No archive, DOM, sanitizer, renderer, CFI, book-text, or logging behavior was introduced.
- 2026-07-20: Completed Task 3.1. Added the `@voxleaf/desktop` React and TypeScript web shell, registered it in the TypeScript project-reference graph, and verified type-checking, one semantic rendering smoke test, and a Vite production build. The shell clearly reports that EPUB reading and narration are not implemented and contains no Tauri, file, persistence, TTS, audio, model, or network behavior.
- 2026-07-20: Completed Task 3.2. Added the pinned Tauri CLI, runtime, build crate, Rust manifest and lockfile, minimal Windows entry point, strict local configuration, and required Windows icon. Rust formatting, Clippy with warnings denied, zero-behavior native tests, the Tauri release build, and a bounded executable launch passed; ADR-0001 now confirms Tauri adoption.
- 2026-07-20: Completed Task 4.1. Installed and pinned uv `0.11.29`; added the isolated `voxleaf-tts` pure-Python package, lockfile, deterministic version smoke test, and development-only Ruff, mypy, pytest, and `uv_build`; verified the locked environment, formatting, linting, strict typing, test, and distribution build without model, server, network, audio, or hardware behavior.
- 2026-07-20: Completed Task 5.1. Added the root cross-language format, lint, type-check, test, build, and aggregate check surface; introduced the selected ESLint flat configuration and Prettier; and verified every root command on Windows. A temporary unformatted fixture made `format:check` return nonzero and was removed, confirming failure propagation. TypeScript was adjusted from `7.0.2` to supported stable `6.0.3` because `typescript-eslint` `8.64.0` supports TypeScript only below `6.1.0`.
- 2026-07-20: Implemented Task 5.2 locally. Added the pinned `Foundation checks` workflow with `Windows native foundation` as the authoritative job and `Ubuntu portable foundation` as the intentionally limited TypeScript/Python job.
- 2026-07-21: Completed Task 5.2. The first remote run exposed a Windows checkout line-ending mismatch before native compilation, so `.gitattributes` now enforces LF for repository text while preserving the icon as binary. GitHub Actions run [29800516177](https://github.com/mmjosedaniel/voxleaf/actions/runs/29800516177) then passed with the exact job names `Windows native foundation` and `Ubuntu portable foundation`.

## Discoveries and decisions

- Missing toolchains are part of Milestone 1 rather than a reason to begin a later milestone.
- The existing `synchronized-reader-and-startup-buffer.md` plan spans later roadmap milestones and must not pull shared contracts or product behavior into this foundation plan.
- Exact project validation commands cannot be truthfully reported as existing until the tasks above create and run them. Planned commands in this document are explicit targets and must be corrected to match verified configuration.
- Native Windows validation is required. WSL remains useful, but sharing generated artifacts between Windows and Linux is outside the supported foundation workflow.
- Node.js 20 was present but is end-of-life as of this task, so the project selects Node.js 24 LTS while retaining Node.js 22.12 or newer within the maintained Node 22 line as the minimum supported frontend runtime.
- Task 1.2 now owns the minimal runtime version declarations needed to make its prerequisite matrix reproducible. Task 1.3 owns the broader workspace and quality-tool decision and must preserve or explicitly revise these pins.
- The root pnpm command surface will orchestrate checks, but JavaScript, Python, and Rust retain separate lock ownership and direct focused commands. This avoids pretending pnpm owns Python or Cargo dependencies.
- Native Windows CI is authoritative. The additional Ubuntu job is limited to portable TypeScript and Python checks and cannot satisfy native desktop acceptance.
- No TTS model, EPUB implementation, local process protocol, or audio dependency is justified during this milestone.
- The root workspace declares exact future package paths instead of broad glob patterns, so adding unrelated directories under `apps` or `packages` will not silently make them workspace members.
- The root TypeScript configuration contains only environment-independent strict defaults. Package-specific libraries, output settings, project references, and scripts remain owned by Tasks 2.2, 2.3, and 3.1 when those projects exist.
- The shared package intentionally exports no values yet. Its smoke test imports the package by name and asserts the empty namespace, proving the runner and declared public entry resolve without creating a placeholder domain API.
- The EPUB package mirrors the shared package's foundation structure but does not depend on it yet. This preserves isolation until a real shared contract justifies a `workspace:` dependency.
- React `19.2.7`, React DOM `19.2.7`, Vite `8.1.5`, and the official React plugin `6.0.3` are verified for the web shell on the selected Node.js runtime. That result initially validated only the web portion of the desktop candidate; Task 3.2 subsequently confirmed Tauri adoption.
- Testing Library and jsdom are scoped to the desktop package because its first real DOM rendering test now justifies them. `@testing-library/jest-dom` remains on mature release `6.9.1`; the newly published `7.0.0` would have required a pnpm release-age policy exception that this task did not justify.
- Tauri `2.11.5`, Tauri CLI `2.11.4`, and `tauri-build` `2.6.3` are verified with the pinned Rust `1.97.1` MSVC toolchain. Installer bundling remains disabled because packaging and signing are outside the foundation milestone.
- The main webview has an explicit empty capability list and no frontend Tauri API dependency. It cannot call native IPC until a later task adds a narrowly scoped command and permission with its behavior and security tests.
- Enforced Windows Verified-and-Reputable Application Control blocked Cargo-generated unsigned build scripts and procedural macro libraries with error `4551`. Relocating Cargo output did not help; native validation succeeded after the user disabled Smart App Control. Managed development environments must instead use an administrator-approved policy or signing approach.
- uv `0.11.29` discovers the repository-root Python `3.12.10` declaration and creates the isolated environment at `services/tts/.venv`. The Python project has no runtime dependencies; its lock data contains only the local package and development quality tools with their transitive dependencies. The compatible `uv_build` range is declared separately as the build-system requirement.
- TypeScript `7.0.2` was initially validated before lint tooling existed, but it falls outside `typescript-eslint` `8.64.0`'s supported range. Task 5.1 therefore pins TypeScript `6.0.3`, the latest stable release accepted by that parser, and revalidates every TypeScript package rather than relying on an unsupported peer combination. The quality-tool version is old enough for the workspace release-age policy, so no supply-chain exception is required.
- Root scripts use package-manager command chaining that works in both Windows command execution and POSIX shells. Each aggregate stage delegates to named ecosystem-specific scripts, preserves the first failing exit code, and does not require an additional monorepo task runner.
- CI uses supported explicit `windows-2025` and `ubuntu-24.04` runner labels. Checkout `6.0.2`, setup-node `6.4.0`, setup-python `6.2.0`, and setup-uv `8.1.0` are pinned to full release commit SHAs; pnpm `11.15.1`, uv `0.11.29`, and the repository toolchain declarations remain the executable version authorities.
- Repository text is normalized to LF through `.gitattributes`, preventing operating-system checkout behavior from changing the input to deterministic format checks. Binary icon data is explicitly excluded from text normalization.

## Final validation requirements

Before moving this plan to `docs/plans/completed/`:

1. Mark every task complete only after its acceptance criteria and exact validation commands pass.
2. Replace all provisional tool names, package filters, and script commands with their verified repository forms.
3. Record exact tool versions and the canonical Windows and optional WSL procedures.
4. Record every executed installation, format, lint, type-check, test, build, and CI command with its result.
5. Confirm a clean install from lock data in a fresh environment.
6. Confirm the minimal web shell and native Tauri shell build successfully.
7. Confirm TypeScript, Rust, and Python smoke tests pass without model weights, GPU hardware, private data, or network services.
8. Confirm CI passes on the implementation branch and record the check names and run URL.
9. Review dependencies, native permissions, logs, generated artifacts, and persisted files for scope and privacy regressions.
10. Review the complete diff for unrelated changes.
11. Update `README.md`, setup, testing, ADRs, roadmap status if applicable, and this plan with actual validated behavior.
12. Move this file to `docs/plans/completed/establish-engineering-foundation.md` only when no required work remains.

## Final validation results

Not run for the complete plan. Tasks 1.1 through 5.2 are complete and their focused, aggregate, and continuous-integration validation passes. Task 5.3 and the complete-plan final validation requirements remain outstanding.
