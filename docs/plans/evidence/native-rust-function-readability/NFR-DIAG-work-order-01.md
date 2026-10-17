# APPROVED WORK ORDER

Target ID: NFR-DIAG
Goal: name and share the existing diagnostic wait-for-active-and-cancel operation.
Risk: medium.
Allowed files: `apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs` only.

Required edits:

1. Add private `cancel_when_generation_becomes_active(&TtsServiceSupervisor) -> Result<(), &'static str>` containing the original shared deadline and polling loop.
2. Replace exactly the pending and Windows descendant loops with calls at the same positions, preserving worker creation and joins.

Behavior invariants:

1. Fresh `Instant::now() + HANDSHAKE_TIMEOUT` after each worker spawn; identical lifecycle lock/error conversion and active clone, guard dropped before cancel.
2. Active identity precedes timeout test; identical `CancelScope`, fixed error conversion, `POLL_INTERVAL` and timeout. No extra lock or retry.
3. Pending join must require `Err(Cancelled)` and map panic; descendant remains Windows-only and ignores join result. Preserve all normal/crash/restart/shutdown steps, segment/Arc ownership, bounds, cancellation, privacy and transient audio.

Forbidden changes:

1. No other source, tests, parent API, generic polling, modules, dependencies, contracts, constants, joins or behavior changes. Do not alter generated/frozen/historical files or handoff/model diagnostics. No Git mutation or documentation edits by worker.

Diff ceiling: one file; at most 85 added plus removed lines.
Baseline evidence: [NFR-DIAG-BASELINE-20261013-01](NFR-DIAG-baseline-01.md), PASS with unchanged identities and empty index on `d5ad0427dc58d71bdb678df17454d9412c8488c8`.
Worker validation: none; independent validator owns commands.
Acceptance commands, normal local PowerShell outside sandbox:

1. `pnpm.cmd format:check:rust`
2. `pnpm.cmd lint:rust`
3. `pnpm.cmd test:rust`
4. `pnpm.cmd test:native-startup`

Also compare original and extracted statements, lock lifetime and distinct joins.
Completion output: Change Packet only; no staging, commit, push or PR.
