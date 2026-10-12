# Validation Report

Report ID: APP-PREFERENCE-EFFECTS-01-PACKAGE-001

Target ID: APP-PREFERENCE-EFFECTS-01

Mode: PACKAGE

Verdict: PASS

Environment: local PowerShell 7.6.5 outside sandbox; Node v24.20.0;
pnpm 11.15.1 via session Corepack PATH; locked Python 3.12.10.
Independent Astra high validator. Matching-driver process override retained;
portable gate does not execute WebView2.

Starting HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Ending HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Validated paths and identities before commands:

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `B703D30F15DA2E4F852610C6D41D7ABBF66DD0829B9C994554A139FC5CA5FEFE` | `6416fbc5e1d90a13d3a5be83f0a2f5e0f343db81` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `8B2474D801B21355E4276ADA28D0036FC6E5405001D50F549133992DFB6662F0` | `6c02452d5d2572f1531bfaf11b6a404c34b40763` |
| `apps/desktop/src/settings/app-preference-effects.ts` | `?? apps/desktop/src/settings/app-preference-effects.ts` | `24A5AA2F857A23050432F987998716855601FB28F6260B25680513E4AC039AAA` | `13b1d2d54c33e4998c0faafe5a5052047e2aff79` |
| `apps/desktop/src/settings/app-preference-effects.test.tsx` | `?? apps/desktop/src/settings/app-preference-effects.test.tsx` | `B6ADF594DF25EF32B47CE8006D2D6FBC2AFF5F2E698A67E22703292F96E4E7EF` | `7f38a7ebe0f63a8bd0f1be6769a4ec58fec8fec1` |

Identity recheck: PASS; fresh before/after HEAD/all four identities identical;
empty index before/after.

Commands and outcomes:

1. `pnpm.cmd check:portable` -> 0. Evidence guard plus 13 tests;
   TypeScript/Python format/lint; TypeScript typechecks, mypy 171 files,
   17 generated contract files verified; shared 20 files/209 tests,
   EPUB 33 files/651 tests, desktop 56 files/646 tests plus 51 Node;
   Python 485 tests; shared/EPUB/Vite builds and Python sdist/wheel pass.
   Nonfatal pytest nodeids cache write permission warning; all 485 tests pass.
   Existing Vite chunk-size warning retained.

Diff scope: PASS; same four-file 1,419-line patch under 1,500 cap; expected
director docs outside manifest. `git diff --check` exited 0. No tracked
generated-source or unrelated changes.

Invariant review: PASS; identical POST-CHANGE-002 source preserves all ordered
hydration/binding/ownership invariants. Portable gate broadens model-free
regression evidence; does not replace native smoke or prove model/performance.

Test-integrity review: PASS; accepted characterization/module assertions
unchanged; counts verified from command output.

Privacy/artifact review: PASS; evidence guard and path review, synthetic input,
bounded ignored outputs, no prohibited content, empty index.

Action required: none for PACKAGE; separate FINAL check authorized on frozen source.

