# Portfolio CI diagnosis: VF-0057

<!-- Privacy redaction. Repository account links are recorded as their original reference IDs. -->

Base: `97d36c213e16ea015c24b1589454d61dab4379ea`.
Owner: `apps/desktop/src-tauri/src/tts_service_supervisor/tests.rs`.
Scope: cancellation test ordering only; production supervisor bytes unchanged.

The previous main run (GitHub Actions run 43625830795)
failed the SAC12 cancellation test at `matches!(extra, Err(TtsNativeFailure::Busy))`.
The current main run (GitHub Actions run 43642787754)
and PR #317 checks subsequently passed. Neither outcome identifies the exact
hosted scheduling sequence.

Inspection found a caller thread followed by a 30-ms completion wait. Timeout
did not distinguish a blocked admitted write from a caller not yet scheduled.
A temporary 100-ms delay immediately inside that caller reproduces the exact
Busy assertion failure while preserving process cleanup. This is controlled
ordering evidence, not a natural replay of the hosted machine. No production
failure or measured incidence is claimed.

The final test admits the write through the existing ControlWriter synchronously,
then observes completion. It retains actual pipe saturation, rejection of an
additional request, real cancellation, watchdog and teardown assertions. It also
requires delivery of an error acknowledgement after cancellation; a disconnected
channel or timeout cannot satisfy that assertion. The adjacent real blocked-write
test still exercises CommandDeadline's dispatch/response wrapper and timeout.
The temporary delay is absent from the final patch.

## Host checks

All commands ran at the repository root in normal local PowerShell outside the
sandbox with the existing Corepack shims selecting pnpm 11.15.1. Raw captures are
ignored under `tmp/evidence/portfolio-readiness/`; no old test PASS was reused.

| Command | Result | Local receipt |
| --- | --- | --- |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml sac12_ -- --nocapture` | Baseline PASS, 8 tests | `rust-sac12-baseline.log` |
| `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml sac12_cancel_interrupts_real_blocked_stdin_without_queuing_more_work -- --nocapture` | Intended diagnostic FAIL, exit 101, Busy assertion under injected delayed caller | `rust-delayed-writer-red.log` |
| `pnpm.cmd format:check:rust` | PASS | `rust-format.log` |
| `pnpm.cmd lint:rust` | PASS, default and release-locked all-target Clippy | `rust-lint.log` |
| `pnpm.cmd test:rust` | PASS, default 191 / release-locked 190, each with 9 explicitly ignored tests | `rust-final.log` |

The full suites passed the cancellation and adjacent timeout/cleanup assertions.
No real model, runtime acquisition or host firewall change was required. Final
independent review and source identities are recorded separately; this diagnosis
alone is not an approval receipt.
