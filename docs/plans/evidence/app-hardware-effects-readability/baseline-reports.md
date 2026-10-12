# Independent baseline reports

Target ID: APP-HARDWARE-READABILITY-01.
Validator: refactor_validator, GPT-6 Astra high. Execution: 2026-10-11
(America/Bogota), local PowerShell outside sandbox from repository root;
acceptance commands used host escalation. Node v24.20.0, pnpm 11.15.1 selected
with process-local Corepack shim PATH. No source, test, configuration or Git
mutations by the validator.

## Shared closed identity manifest

Both reports independently captured/rechecked this manifest. Starting and ending
HEAD for each: `609ae1b290e1070586a9142cd0063fffd2476910`.

| Validated path | Exact porcelain status | SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | Empty output | `86196CD91158FB2D9DD190AB8242D3CF2C5CCD952613DB0055C622F7C6A77E5E` | `9b9df05a8c84d54fd7f0e6e88c5151555ad42547` |
| `apps/desktop/src/App.test.tsx` | Empty output | `E68472655FFBC2A709B439DECECBB724DC395D82E28BB277E9A32235F32AAB70` | `fc6db0d292c86e13dba93297bdf50d1eda31b141` |
| `apps/desktop/src/tts/hardware-compatibility-check-binding.ts` | Empty output | ABSENT | ABSENT |
| `apps/desktop/src/tts/hardware-compatibility-check-binding.test.ts` | Empty output | ABSENT | ABSENT |

## APP-HARDWARE-READABILITY-01-BASELINE-01

Mode: BASELINE. Verdict: **BASELINE-FAIL**. Identity recheck: PASS; before/after
HEAD and path identities match, index empty. `git diff --check` exited 0.

| Exact command | Exit | Outcome |
| --- | --- | --- |
| `pnpm.cmd run build:packages` | 0 | Shared/EPUB builds pass |
| `pnpm.cmd --filter @voxleaf/desktop typecheck` | 0 | TypeScript passes |
| `pnpm.cmd --filter @voxleaf/desktop test` | 0 | 54 Vitest files / 597 tests; 51 Node tests pass |
| `pnpm.cmd run format:check:typescript` | 0 | Prettier passes |
| `pnpm.cmd run lint:typescript` | 0 | ESLint passes |
| `pnpm.cmd test:browser` | 0 | Chromium 7/7 pass |
| `pnpm.cmd test:native-startup` | 1 | Tauri release build succeeds; WebView session creation fails with `webdriver-session-not-created` |

Diff scope, baseline invariant, test-integrity and privacy/artifact reviews:
PASS. The source is unchanged; only the separately authorized director plan
changed (15 additions / 6 deletions). This failure precedes worker edits.
Action required at issuance: resolve the local driver/runtime prerequisite and
repeat all seven commands under a new report; do not authorize implementation.
Raw captures: ignored
`tmp/evidence/app-hardware-effects-readability/APP-HARDWARE-READABILITY-01-BASELINE-01/`.

## APP-HARDWARE-READABILITY-01-BASELINE-02

Mode: BASELINE. Verdict: **PASS**. Identity recheck: PASS; all before/after
HEAD and path identities match, index empty. `git diff --check` exited 0.
The earlier report remains a separate failed baseline.

The default PATH driver was version 150.0.4078.83 while installed WebView2 is
155.0.4283.45. The validator independently verified the existing local binary
`tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe`
as version 155.0.4283.45 with Valid Authenticode signature from Microsoft
Corporation. Only the supported process-local `VOXLEAF_EDGE_DRIVER_PATH`
override changed; no download, global install, source or repository config
change was necessary. Matching driver/runtime versions follows
[Microsoft's WebView2 guidance](https://learn.microsoft.com/en-us/microsoft-edge/webview2/how-to/webdriver).

| Exact command | Exit | Outcome |
| --- | --- | --- |
| `pnpm.cmd run build:packages` | 0 | Shared/EPUB builds pass |
| `pnpm.cmd --filter @voxleaf/desktop typecheck` | 0 | TypeScript passes |
| `pnpm.cmd --filter @voxleaf/desktop test` | 0 | 54 Vitest files / 597 tests; 51 Node tests pass |
| `pnpm.cmd run format:check:typescript` | 0 | Prettier passes |
| `pnpm.cmd run lint:typescript` | 0 | ESLint passes |
| `pnpm.cmd test:browser` | 0 | Chromium 7/7 pass |
| `pnpm.cmd test:native-startup` | 0 | Release build and packaged WebView2 matrix pass; zero errors/external requests |

Native evidence covers root mount, bounded protocol, supervised fake-service
binary delivery/cancellation/crash recovery, local file boundaries and
replacement, narrow/keyboard reader, synchronization, local image decode,
position/preferences across restart, and replacement cleanup.

Diff scope: PASS; all source paths clean/absent as planned, only director plan
changed (15 additions / 6 deletions). Invariant review: PASS for existing
non-awaited setup order, bound methods, local flag, consume-before-check,
synchronous identical-listener removal, App ownership and unchanged preference
and UI policy. Test-integrity review: PASS; existing suites/assertions unchanged.
Privacy/artifact review: PASS; no prohibited/generated-source/unrelated change;
raw outputs ignored. Vite bundle-size and browser color warnings are non-fatal.

Coverage limitation at baseline: direct event bridge order, receivers,
independent flags and teardown still await the work order's focused tests.
No late-hydration, model-backed or inference-performance claim is added.

Action required: none for baseline; director can freeze the order. Post-change
must repeat seven gates and both aggregate commands against fresh identities.
Raw environment, before/after manifest, results and logs:
`tmp/evidence/app-hardware-effects-readability/APP-HARDWARE-READABILITY-01-BASELINE-02/`.
