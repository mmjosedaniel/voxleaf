# Validation Report

Report ID: APP-READABILITY-01-POST-CHANGE-02

Target ID: APP-READABILITY-01

Mode: POST-CHANGE

Verdict: PASS

Environment: local PowerShell outside sandbox. Independent `refactor_validator`
(GPT-6 Astra high); all nine commands sequentially via `require_escalated` from
repository root. Process-only Corepack PATH selects pnpm 11.15.1/Node 24.20.0;
existing EdgeDriver `tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe`
matches installed WebView2 155.0.4283.45. No repository configuration changed.

Starting HEAD SHA: `a1c2b467037e91c82aa0354d697704c967bfb5e6`

Ending HEAD SHA: `a1c2b467037e91c82aa0354d697704c967bfb5e6`

Validated paths and identities before commands:

| Path | Exact porcelain | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `86196CD91158FB2D9DD190AB8242D3CF2C5CCD952613DB0055C622F7C6A77E5E` | `9b9df05a8c84d54fd7f0e6e88c5151555ad42547` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `E68472655FFBC2A709B439DECECBB724DC395D82E28BB277E9A32235F32AAB70` | `fc6db0d292c86e13dba93297bdf50d1eda31b141` |
| `apps/desktop/src/AppPresentation.tsx` | `?? apps/desktop/src/AppPresentation.tsx` | `7D4408711883C3E665569F984D7E43846F6586A8AC4925502006811CF32A3581` | `0bf8f7909c0a5e1104d0f1fa6097d1528514df19` |

Identity recheck: PASS. Exact before/after manifests match; HEAD and branch
`codex/app-readability` unchanged; index empty before/after; `git diff --check`
exits 0. Both production identities also match attempt 01; only the ordered
test-fixture correction changed.

Commands and outcomes:

| Exact command | Outcome |
| --- | --- |
| `pnpm.cmd run build:packages` | Exit 0; shared/EPUB compilation |
| `pnpm.cmd --filter @voxleaf/desktop test` | Exit 0; 54 Vitest files / 597 tests plus 51 Node tests |
| `pnpm.cmd run format:check:typescript` | Exit 0 |
| `pnpm.cmd run lint:typescript` | Exit 0; hooks/React Refresh included |
| `pnpm.cmd run typecheck:typescript` | Exit 0; all three packages |
| `pnpm.cmd test:browser` | Exit 0; 7 Chromium tests, 10.4 seconds |
| `pnpm.cmd test:native-startup` | Exit 0; Tauri release build and WebView2 smoke |
| `pnpm.cmd check:portable` | Exit 0; complete portable aggregate |
| `pnpm.cmd check` | Exit 0; complete native aggregate |

Portable aggregate: evidence guard and 13 tests; 17 generated contracts;
TypeScript/Python formatting, lint and types; shared 20 files/209 tests, EPUB
33 files/651 tests, desktop 54 files/597 tests and 51 Node tests, Python 485
tests; package/frontend and Python source/wheel builds.

Full aggregate additionally passes Rust formatting/Clippy in both modes,
87 default and 88 release-locked-runtime Rust tests and native Tauri release
build. Python passes all 485 tests again.

Browser evidence covers production shell, EPUB2/navigation, privacy/network,
oversized chapter rejection, restoration/reflow, keyboard/focus and
synchronization. Native evidence covers startup, supervised fake-service
protocol/delivery/cancellation/crash recovery, selection/reselection/replacement,
size boundaries, keyboard/synchronization, local raster, restart/restoration,
cleanup, no errors and no external requests.

Non-failing notices: Vite chunk size, browser color-environment warning and
Python `PytestCacheWarning` for denied writing `.pytest_cache/v/cache/nodeids`.
Both Python runs pass 485 tests; cache permissions were not changed.

Diff scope: PASS. Three source files, 646 added/deleted lines (App +45/-165,
tests +228/-0, new module +208), within ceiling. Outside source, only director
plan/Markdown receipts. No unrelated implementation, dependency/configuration,
generated source or historical authority changes.

Invariant review: PASS.

- Module-scope components preserve DOM/copy/classes/IDs/accessibility/status and
  enablement; picker stays unkeyed at the same header position.
- Passing integration proof retains the same node through deferred opening,
  ready, replacement and failure, synchronous reset before opening,
  empty-selection preservation and readable author fallback.
- Readonly projections exclude locators/resources. App owns identity filtering,
  dismissal state and current-sequence callback.
- Existing/new tests cover pending/exact/recovered, unavailable/superseded
  settlement, unavailable/malformed book-start, unsupported/unavailable
  preferences, precedence and notice reappearance after replacement.
- Error boundary/key, mounts, public/injected props and optional omissions
  unchanged. Settings/focus, metadata privacy, selection ordering, distinct
  preference handlers, effects/dependencies/resources, StrictMode/microtasks,
  persistence, locators and cleanup unchanged. Browser/native evidence passes.

Test-integrity review: PASS. Nine added observable integration cases, existing
assertions intact. Correction only adjusts synthetic fixture preparation.
Prior FAIL remains immutable and is a test-fixture defect, not a demonstrated
production regression.

Privacy/artifact review: PASS. No prohibited/private/unrelated artifacts.
Synthetic fixtures; raw evidence remains ignored at
`tmp/evidence/app-readability/post-change-02/` (before/after manifests and nine
numbered descriptive command logs).

Limits: preference-failure tests hold startup hydration pending; late completion
is untested and that effect is unchanged. No new model performance, audio
quality or hardware support claim.

Action required: none for source. Documentary closure is separate. PASS binds
this HEAD and exact three identities only; later source edits require rerun/new
report. No staging, commit, push or PR authorization.
