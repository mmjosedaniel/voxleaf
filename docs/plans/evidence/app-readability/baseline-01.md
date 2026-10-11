# Validation Report

Report ID: APP-READABILITY-01-BASELINE-01

Target ID: APP-READABILITY-01

Mode: BASELINE

Verdict: PASS

Environment: local PowerShell outside sandbox. Independent `refactor_validator`
(GPT-6 Astra high); commands executed with `require_escalated` from repository
root. Director transcribed this immutable report after validator completion.

Starting HEAD SHA: `a1c2b467037e91c82aa0354d697704c967bfb5e6`

Ending HEAD SHA: `a1c2b467037e91c82aa0354d697704c967bfb5e6`

Validated paths and identities before commands:

| Path | Exact porcelain | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | `""` (no output) | `CFDCF0F1A2A816A026C0533E7F7F9AD1C7B5B590A0DDE109E7D141F769C5B13B` | `65808bbbec4042937f6ee5e08917dea65920c5f8` |
| `apps/desktop/src/App.test.tsx` | `""` (no output) | `8A688BE72992DFAF615A06F81607811961A866172375A0145A9820E7BAB78DFB` | `6a2431df8b78a16ff9995fa47abc82524c48c573` |
| `apps/desktop/src/AppPresentation.tsx` | `""` (no output) | ABSENT | ABSENT |

Identity recheck: PASS. Before/after manifests match exactly; HEAD and branch
unchanged. `git diff --cached --quiet` exited 0 before/after; source paths clean;
`git diff --check` exited 0. Only acknowledged director plan/receipt changes exist.

Commands and outcomes:

| Exact command | Outcome |
| --- | --- |
| `pnpm.cmd run build:packages` | Exit 0; shared/EPUB builds |
| `pnpm.cmd --filter @voxleaf/desktop test` | Exit 0; 54 Vitest files, 588 tests, plus 51 Node tests |
| `pnpm.cmd run format:check:typescript` | Exit 0; all matched files pass |
| `pnpm.cmd run lint:typescript` | Exit 0; ESLint including hooks/Refresh |
| `pnpm.cmd run typecheck:typescript` | Exit 0; package rebuild and all three package checks |
| `pnpm.cmd test:browser` | Exit 0; 7 Chromium tests, 11.7 seconds |
| `pnpm.cmd test:native-startup` | Exit 0; Tauri release build and WebView2 smoke |

Native evidence includes root mount, protocol/fake-service delivery,
cancellation/crash recovery, file reselection/cancellation/replacement and size
boundaries, keyboard/synchronization, local image decode, position/preferences
across restart/reselection, cleanup, no errors or external requests.

Process-only environment: existing Corepack shim directory first on PATH for
pnpm 11.15.1 and Node 24.20.0; `VOXLEAF_EDGE_DRIVER_PATH` points to existing
`tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe`,
matching WebView2 155.0.4283.45. No configuration changes. Non-failing notices:
Vite chunk size and browser `NO_COLOR`/`FORCE_COLOR` warnings.

Diff scope: PASS; no source changes, index empty, only director coordination.

Invariant review: PASS for establishing baseline. Inspected message precedence,
picker placement/reset, identity filtering/dismissal, error boundary/key,
optional reader props, Settings focus and lifecycle/cleanup order. Audit gaps
remain untested until the implementation assertions; this is not acceptance of
a future extraction or model/performance/hardware evidence.

Test-integrity review: PASS; existing tests unchanged, protecting metadata,
privacy, exact/recovered restoration, deferred persistence, StrictMode, busy,
failure/empty states, replacement, heard position, reset, renderer failure,
cancellation, obsolete completion and unmount.

Privacy/artifact review: PASS; synthetic fixtures, no prohibited/unrelated
artifacts; raw evidence in ignored `tmp/evidence/app-readability/baseline-01/`
(`before.json`, `after.json`, seven descriptive command logs).

Action required: none. Director may freeze the work order. No staging authority.
