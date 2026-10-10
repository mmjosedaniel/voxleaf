# APPROVED WORK ORDER

Target ID: NR-MAIN
Goal: make Tauri startup/shutdown readable by giving the existing complete CLI
dispatch one private owner, preserving behavior.
Risk: medium
Allowed files:

- `apps/desktop/src-tauri/src/main.rs`
- `apps/desktop/src-tauri/src/diagnostics/mod.rs`
- `apps/desktop/src-tauri/src/diagnostics/cli.rs`

Required edits:

1. Move only the argument iterator and entire nine-branch match from main into
   `diagnostics::cli::dispatch_if_requested()`, returning unit and retaining all
   process exits. Use only necessary crate imports.
2. Narrowly expose the helper from diagnostics/mod.rs. Declare diagnostics in
   main and call the helper before the unchanged Tauri Builder flow.

Behavior invariants: exact flags/constants/owners, OsStr comparisons, executable
consumption, positional reads and UTF-8 handling, exit codes, unknown/no-argument
fallthrough, both feature modes, all sixteen handlers, managed state, data-root
setup, binary response semantics and exit force_stop. Keep book/audio privacy,
local inference, resource/cancellation and release restrictions unchanged.

Forbidden changes: any other source/test/script/config/dependency/feature,
runtime/lifecycle/diagnostic body, authority/include target, serialized contract,
argument or handler alteration; no new abstractions or layout-mirroring tests.
Diff ceiling: three files, 250 added plus removed lines.
Baseline evidence: NR-MAIN-BASELINE-03-20261009, PASS, immutable report alongside
this order; HEAD ed42154668bd71d500b5beab77485f9fd20ee2a2.
Worker validation: none required; no test acceptance claim by worker.
Acceptance commands: `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust`;
`pnpm.cmd test:rust`; `pnpm.cmd test:native-startup`; `git diff --check`, all host
PowerShell outside sandbox with verified process-local tool selection.
Completion output: Change Packet only; no commit or push.

Issued 2026-10-09 after independent baseline PASS. This order is immutable.
