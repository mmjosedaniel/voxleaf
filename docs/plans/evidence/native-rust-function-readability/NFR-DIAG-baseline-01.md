# Validation Report

Report ID: NFR-DIAG-BASELINE-20261013-01
Target ID: NFR-DIAG
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox; all commands used
`require_escalated` at repository root. PowerShell 7.6.5, Corepack-selected
pnpm 11.15.1, Node 24.20.0, Cargo/rustc 1.97.1, tauri-driver 2.0.6,
WebView2/Microsoft-signed EdgeDriver 155.0.4283.45.

Starting and ending HEAD SHA: `d5ad0427dc58d71bdb678df17454d9412c8488c8`.
Validated path: `apps/desktop/src-tauri/src/tts_service_supervisor/host_diagnostics.rs`.

| Identity | Before and after commands |
| --- | --- |
| Exact porcelain | Empty output |
| Worktree SHA-256 | `3ecfd77675db84bd9a1f98738a43bb095a9a54ad1dbd22ef928fbc12d2edea5d` |
| Filter-aware expected blob | `86f0a71a3f392eb0874798cd17f0f2ca94f84fac` |

Identity recheck: PASS. HEAD/path unchanged, index empty before/after,
`git diff --check` exit 0 before/after. Fresh native binary SHA-256:
`ba04117e4cb69ee56c0ed54ae03df50a8a2bddbacba71165e10030cef286518c`.
This build supersedes the supervisor-baseline binary identity.

Commands and outcomes:

1. `pnpm.cmd format:check:rust` -> exit 0.
2. `pnpm.cmd lint:rust` -> exit 0, both default and release-locked all-target configurations, warnings denied.
3. `pnpm.cmd test:rust` -> exit 0, default 87 passed/0 failed/1 ignored; release-locked 88 passed/0 failed/1 ignored. Intentional subprocess fixture retained; child-reaping regression passes in both configurations.
4. `pnpm.cmd test:native-startup` -> exit 0, fresh build; native startup, bounded protocol, model-free normal/pending-cancellation/crash-restart/shutdown/Windows-descendant scenarios, binary delivery, reader/restoration and cleanup pass. No runtime errors/external requests. Nonfatal existing Vite chunk-size warning.

Raw logs in ignored
`tmp/evidence/native-rust-function-readability/NFR-DIAG-BASELINE-20261013-01/`:

| Log | SHA-256 |
| --- | --- |
| `01-format.log` | `709f090c04253be00ffd67ed8b3772ddb8589da29932b204033feecc01ea3b8f` |
| `02-lint.log` | `1d6b808ed8849e82454b6a758f4176d697b3c6188d4e33ed058065fe83cdc61d` |
| `03-rust.log` | `d59eb5740a27b8702184424b766fac4faf4de501cd56de3c7d2dfc6a0b32f7df` |
| `04-native.log` | `d90cb11945da797677006ff8e36e4138679f0869bfe68f4acbf5d8af328a7075` |

Diff scope: PASS. Target clean; only director plan and supervisor report outside
allowlist. No implementation yet.

Invariant review: PASS for baseline readiness. Both original loops create the
deadline after worker creation, clone active identity and drop lifecycle guard
before cancellation, test active before timeout and retain fixed errors and
constants. Pending requires joined `Err(Cancelled)` with panic mapping;
Windows descendant ignores join result. Native gate executes those scenarios.
Post-change static checks remain mandatory; execution does not exhaust timing
interleavings. Model/installed gates are outside this diagnostic-only unit;
SUP failure remains unresolved.

Test-integrity review: PASS. No assertions, fixtures, names, feature/platform
conditions or test files changed; both features and executable matrix rerun.

Privacy/artifact review: PASS. No source/generated authority, dependencies,
model/book/audio/private data or unrelated implementation entered diff. Logs
ignored; no Git mutation, installation or machine-configuration change.

Action required: none. Independent validator permits the director to freeze
the work order and is idle pending post-change validation.
