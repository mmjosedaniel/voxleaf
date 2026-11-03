# PR #303: platform-correct RAF-16 acquisition control

Base and reviewed HEAD: `f4cb6b93c860f74b0faec54d14d062a5f8ffa0f2`.
The worktree and index were clean at the start of this follow-up. The completed
ExecPlan and original acceptance reports remain unchanged.

## Reproduction and cause

[Ubuntu Rust job 125997539835](https://github.com/mmjosedaniel/voxleaf/actions/runs/41659171723/job/125997539835)
failed `raf_16_preflight_cannot_acquire_replacement_confirmation`: expected
`Err(DownloadFailed)`, observed `Err(Unavailable)`. The default Rust suite had
135 passing tests and one failure. The initial stale-attempt cancellation,
zero-transfer and replacement-confirmation assertions passed.

The replacement's real acquisition path checks `available_space` before calling
the transfer hook. That probe is implemented only on Windows; other platforms
return `Unavailable`. The test injected an admitted host and incorrectly expected
the Windows transfer path on Linux. This is a test portability defect, not a
demonstrated regression in the production ownership guard.

Before editing, the exact test passed on the local Windows host:

```powershell
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml tts_optional_chatterbox::tests::raf_16_preflight_cannot_acquire_replacement_confirmation -- --exact
```

Result: exit 0, one passed. The hosted Linux failure remains the failing
reproduction; the Windows result is not represented as a Linux reproduction.

## Correction and preserved coverage

Only the replacement control's final expectations depend on the platform:
Windows still requires `DownloadFailed` from the synthetic transfer hook and
exactly one transfer; non-Windows requires `Unavailable` and zero transfers.
Every platform still executes Cancel A / Select B during A's preflight and
requires A to return `Cancelled`, start zero transfers, and preserve B's
`Confirming` state. No test is skipped, error is accepted generically, production
gate is bypassed, retry is added or timeout is increased.

Production code, dependencies, public contracts and architecture are unchanged.
No model download, native app rebuild, browser journey, GPU matrix or installed
package replay is required for this test-only correction.

## Local validation

All commands executed in normal local PowerShell outside the managed sandbox,
using Node 24.20.0 and pnpm 11.15.1. Receipt `CI303-rust` records full source
inputs, tool versions, command, timestamps and exit status under ignored
`tmp/evidence/residual-audit-corrections/20261103-01/`.

| Command | Result |
| --- | --- |
| `pnpm.cmd format:check:rust` | exit 0 |
| `pnpm.cmd lint:rust` | exit 0, default and release-locked configurations |
| `pnpm.cmd test:rust` | exit 0; default 162 passed / 7 ignored, release-locked 161 passed / 7 ignored |

RAF-16 passes in both local configurations. The ignored model/host cases retain
their existing explicit opt-in requirements. Original CI output is retained as
`CI303-original-ubuntu.log`. The updated branch still requires its own hosted
Ubuntu execution; local Windows results do not establish Linux execution.

The independent assessment of this exact test correction and supporting evidence
is recorded separately in [CI review](ci-review.md). No prior runtime approval or
historical CI result is claimed as a fresh validation of the changed test.
