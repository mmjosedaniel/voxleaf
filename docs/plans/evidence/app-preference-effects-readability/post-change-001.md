# Validation Report

Report ID: APP-PREFERENCE-EFFECTS-01-POST-CHANGE-001

Target ID: APP-PREFERENCE-EFFECTS-01

Mode: POST-CHANGE

Verdict: BLOCKED

Environment: local PowerShell 7.6.5 outside sandbox; Node v24.20.0;
pnpm 11.15.1 through session-only Corepack PATH. Independent Astra high validator.

Starting HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Ending HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Validated paths and identities before commands:

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `B703D30F15DA2E4F852610C6D41D7ABBF66DD0829B9C994554A139FC5CA5FEFE` | `6416fbc5e1d90a13d3a5be83f0a2f5e0f343db81` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `8B2474D801B21355E4276ADA28D0036FC6E5405001D50F549133992DFB6662F0` | `6c02452d5d2572f1531bfaf11b6a404c34b40763` |
| `apps/desktop/src/settings/app-preference-effects.ts` | `?? apps/desktop/src/settings/app-preference-effects.ts` | `24A5AA2F857A23050432F987998716855601FB28F6260B25680513E4AC039AAA` | `13b1d2d54c33e4998c0faafe5a5052047e2aff79` |
| `apps/desktop/src/settings/app-preference-effects.test.tsx` | `?? apps/desktop/src/settings/app-preference-effects.test.tsx` | `B6ADF594DF25EF32B47CE8006D2D6FBC2AFF5F2E698A67E22703292F96E4E7EF` | `7f38a7ebe0f63a8bd0f1be6769a4ec58fec8fec1` |

Identity recheck: PASS; identical HEAD/all identities and empty index before/after.
App.test retains CHARACTERIZATION-002 identity.

Commands and outcomes:

1. `pnpm.cmd build:packages` -> 0.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> 0.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> 0; 56 files/646 Vitest
   plus 51 Node tests, zero failures/skips; includes 28 App and 16 module cases.
4. `pnpm.cmd format:check:typescript` -> 0.
5. `pnpm.cmd lint:typescript` -> 0.
6. `pnpm.cmd test:browser` -> 0; seven Chromium scenarios in 10.2 s.
7. `pnpm.cmd test:native-startup` -> 1; release build passes in 25.72 s,
   then `Native startup smoke failed during native WebView session creation
   [webdriver-session-not-created].` Packaged App mount/proof stages not reached.

Diff scope: PASS; exact four paths/1,419 changed lines under 1,500 addendum.
Expected director docs only outside manifest. `git diff --check` exited 0.
Other App effects/handlers/state/ref ownership unchanged; no dependency/API drift.

Invariant review: PASS by code, deterministic and browser evidence. Both
extractions at original positions preserve read chains/receivers/order/active,
defaults/status/persistence/restore asymmetry. Binding projects three fields,
observes/publishes before subscription and returns original unsubscribe;
no closing/reset/write. Stable member dependencies prevent fresh-object reruns.
Module tests close direct cleanup/order/unsubscribe gaps. Architecture remains
App-owned. Required packaged startup/restoration UNPROVEN in this attempt.

Test-integrity review: PASS; characterization byte-identical and 16 module cases
independently inspected; no weakened assertions, copied effects or sleeps.

Privacy/artifact review: PASS; synthetic tests only, no prohibited source output
or Git mutations. No model/performance claim. Nonfatal color/bundle warnings.

Action required: resolve host WebView session prerequisite and rerun all seven
unchanged commands with fresh Report ID. No source correction indicated.
PACKAGE/FINAL remain pending; preserve this blocked report.

