# Validation Report

Report ID: APP-PREFERENCE-EFFECTS-01-POST-CHANGE-002

Target ID: APP-PREFERENCE-EFFECTS-01

Mode: POST-CHANGE

Verdict: PASS

Environment: local PowerShell 7.6.5 outside sandbox; Node v24.20.0;
pnpm 11.15.1 through session-only Corepack PATH. Independent Astra high validator.
Process-local VOXLEAF_EDGE_DRIVER_PATH selects the verified Microsoft-signed
155.0.4283.45 driver matching live WebView2; tauri-driver 2.0.6. Exact driver
path/signature/hash in host-driver-prerequisite.md. No global setting changed.

Starting HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Ending HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Validated paths and identities before commands:

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `B703D30F15DA2E4F852610C6D41D7ABBF66DD0829B9C994554A139FC5CA5FEFE` | `6416fbc5e1d90a13d3a5be83f0a2f5e0f343db81` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `8B2474D801B21355E4276ADA28D0036FC6E5405001D50F549133992DFB6662F0` | `6c02452d5d2572f1531bfaf11b6a404c34b40763` |
| `apps/desktop/src/settings/app-preference-effects.ts` | `?? apps/desktop/src/settings/app-preference-effects.ts` | `24A5AA2F857A23050432F987998716855601FB28F6260B25680513E4AC039AAA` | `13b1d2d54c33e4998c0faafe5a5052047e2aff79` |
| `apps/desktop/src/settings/app-preference-effects.test.tsx` | `?? apps/desktop/src/settings/app-preference-effects.test.tsx` | `B6ADF594DF25EF32B47CE8006D2D6FBC2AFF5F2E698A67E22703292F96E4E7EF` | `7f38a7ebe0f63a8bd0f1be6769a4ec58fec8fec1` |

Identity recheck: PASS; fresh before/after HEAD and all identities match;
empty index before/after. App.test retains accepted checkpoint bytes.

Commands and outcomes:

1. `pnpm.cmd build:packages` -> 0; shared/EPUB builds pass.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> 0.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> 0; 56 files/646 Vitest
   plus 51 Node tests, zero failures/skips; includes 28 App and 16 module cases.
4. `pnpm.cmd format:check:typescript` -> 0.
5. `pnpm.cmd lint:typescript` -> 0.
6. `pnpm.cmd test:browser` -> 0; seven Chromium scenarios in 10.5 s.
7. `pnpm.cmd test:native-startup` -> 0; Tauri release and packaged smoke:
   App mount, bounded protocol/supervised fake-service binary delivery,
   cancellation/crash recovery, reselection/cancellation/replacement/size
   boundaries, keyboard/narrow reader/synchronization, local synthetic image,
   exact position/preferences across restart/reselection, cleanup and zero
   errors/external requests. Nonfatal bundle-size/color warnings retained.

Diff scope: PASS; exact four paths/1,419 changed lines under 1,500 addendum.
Expected director docs only outside manifest; `git diff --check` exited 0.
Both mandatory extractions complete, other App effects/handlers/state/ref
ownership untouched; no dependency or public-contract change.

Invariant review: PASS; independent reader-first chains, receivers, active
guard, resolved/rejected sink asymmetry, sink-before-publication, exact
defaults/status/persistence, late-event outcomes and stable dependencies
preserved. Binding retains observe/publish-before-subscribe, three-field
projection and original unsubscribe. Direct module assertions cover cleanup
suppression/no writes/reset/close; App cases cover absence/replacement and
integration order. Canonical application-owned flow remains accurate.

Test-integrity review: PASS; checkpoint tests byte-identical, 16 module cases
reviewed; no weakening, sleeps, effect copies or production seams.

Privacy/artifact review: PASS; synthetic fixtures, bounded ignored outputs;
no prohibited/unrelated source artifacts or Git mutations. Model-backed
inference/performance outside unchanged boundaries, not tested or claimed.

Action required: none for POST-CHANGE. Keep POST-CHANGE-001 BLOCKED history
immutable. Separate PACKAGE/FINAL validation authorized on frozen source.

