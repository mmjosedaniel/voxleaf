# APPROVED WORK ORDER

Target ID: NR-SUP
Goal: give the existing model-free supervisor diagnostic matrix a private child
module while keeping production lifecycle ownership and caller paths unchanged.
Risk: medium
Allowed files:

- `apps/desktop/src-tauri/src/tts_service_supervisor.rs`
- `apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs`

Required edits:

1. Declare private `host_diagnostics` child and re-export `run_host` through its
   existing supervisor path; move only the entire existing `run_host` function.
2. Use explicit minimum child imports of parent private names. Adjust its one
   include to `../../../../../packages/shared/fixtures/contracts/tts-protocol-control/v1/valid-synthesize.json`.
   Preserve the exact target SHA256
   `B57CF18AB2B6A922D9018F028A7B1002D2916B706F7B574299CB30F2F7600753`.
   Remove only parent imports rendered unused solely by this relocation.

Behavior invariants: identical statements/scenarios, 19,200-byte PCM check,
cancel/lock/poll/deadline/sleep/join/error ordering, Windows cfg, normal compilation
in both feature modes, entry-point/flag availability, shared private lifecycle
ownership and privacy/local-only/nonpersistent/bounded/cancellable behavior.
Forbidden changes: ExactRuntime/ServiceChild/ChildProcess/ServiceSession,
identity/locks/timeouts/constants, supervisor method bodies, commands, CLI,
model-backed host helpers, existing tests/assertions, fixtures/authorities,
dependencies/features/configuration/scripts, new accessors or abstractions.
Diff ceiling: two files, 280 added plus removed lines.
Baseline evidence: NR-SUP-BASELINE-01-20261009 PASS; immutable adjacent report,
HEAD 2451b3da80f3821081279e11869cb83a4ae67cd7.
Worker validation: none required; return Change Packet and remain idle.
Acceptance commands: `pnpm.cmd format:check:rust`; `pnpm.cmd lint:rust`;
`pnpm.cmd test:rust`; `pnpm.cmd test:native-startup`; `git diff --check`, all host
PowerShell outside sandbox with established process-local tools. Independent
review compares moved statements and resolved include bytes. Model/package gates
N/A only while this closed diagnostic-only scope holds.
Completion output: Change Packet only; no commit or push.

Issued 2026-10-09 after baseline PASS. Immutable order; no supporting delegation.
