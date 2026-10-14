# Validation Report

Report ID: NFR-DIAG-POST-CHANGE-20261013-01
Target ID: NFR-DIAG
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox; every acceptance command used
`require_escalated` at repository root. PowerShell 7.6.5, process-local Corepack
pnpm 11.15.1, Node 24.20.0, Cargo/rustc 1.97.1, WebView2/EdgeDriver
155.0.4283.45, tauri-driver 2.0.6.

Starting and ending HEAD SHA: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.
Validated path: `apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs`.

| Identity | Before and after commands |
| --- | --- |
| Exact porcelain | ` M apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs` |
| Worktree SHA-256 | `39b2f11e510e64dfca20a1f6a2fcb0a57dfe6f29ea1ca01ce9bf0847a642da27` |
| Filter-aware expected blob | `f30c5ebde8272b6d81715c580d92504148259f1f` |

Identity recheck: PASS. HEAD and all path identities unchanged; index empty
before/after; `git diff --check` exit 0 before/after. Fresh native executable
SHA-256: `48cbf546c2faa7af66909fb1bf91332f54421c5dfe8e2d179e80ebeb070c9ef1`.

Commands and outcomes:

1. `pnpm.cmd format:check:rust` -> exit 0.
2. `pnpm.cmd lint:rust` -> exit 0, default and release-locked all-target configurations, warnings denied.
3. `pnpm.cmd test:rust` -> exit 0, default 87 passed/0 failed/1 ignored; release-locked 88 passed/0 failed/1 ignored. All 177 test-result entries match baseline by name/outcome. Intentional subprocess fixture remains ignored; child-reaping regression passes.
4. `pnpm.cmd test:native-startup` -> exit 0; rebuilt executable passes bounded protocol, model-free supervisor lifecycle/cancellation/crash recovery, Windows descendant, reader/restoration and cleanup. No errors/external requests; existing Vite chunk-size warning nonfatal.

Raw logs in ignored
`tmp/evidence/native-rust-function-readability/NFR-DIAG-POST-CHANGE-20261013-01/`:

| Log | SHA-256 |
| --- | --- |
| `01-format.log` | `709f090c04253be00ffd67ed8b3772ddb8589da29932b204033feecc01ea3b8f` |
| `02-lint.log` | `32318079f42730ca40d9fc1348d11ef6872ace3470ba3798e494883331abbe3b` |
| `03-rust.log` | `186381dd1583377b9b0ab29adebec485dea6c3d997461adaa7fcf7f643f76fb1` |
| `04-native.log` | `4db49607e33e9856cfb7d7a1444c33958664f22e2dbeee431d458df54e49b4e5` |

Diff scope: PASS. One file, 31 additions + 46 removals = 77 changed lines,
below ceiling 85. One private helper and exactly two loop replacements.
Director plan/evidence documents are outside this allowlist.

Invariant review: PASS. Fresh unchanged deadline follows each original worker
spawn. Same lifecycle lock/error mapping and active clone; guard drops at the
assignment boundary before cancel. Active identity precedes timeout; identical
scope fields, errors, sleep and timeout. Pending requires joined
`Err(Cancelled)` with panic mapping; Windows-only descendant still ignores join.
Normal generation/health/shutdown, crash/restart, segment/Arc ownership and
caller order unchanged. No new state, retry, lock, API or runtime policy.

Execution covers existing model-free scenarios; static comparison establishes
statement order and guard lifetime. It does not exhaust timing interleavings
or establish model narration/package acquisition. This diagnostic-only change
triggers no additional model gate. NFR-SUP baseline failure remains unresolved.

Test-integrity review: PASS. No test, assertion, fixture, namespace or
platform/feature-condition change; test identities and outcomes match baseline.

Privacy/artifact review: PASS. No generated authority, dependency, manifest,
model, book, audio, secret or unrelated source in diff. Raw captures ignored;
no installation, machine-configuration or Git mutation.

Action required: none. Exact patch independently passes its bounded gate.
Director rechecked the report identities before accepting it. This receipt
does not authorize staging or commits.
