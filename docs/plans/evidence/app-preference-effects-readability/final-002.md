# Validation Report

Report ID: APP-PREFERENCE-EFFECTS-01-FINAL-002

Target ID: APP-PREFERENCE-EFFECTS-01

Mode: FINAL

Verdict: PASS

Environment: local PowerShell 7.6.5 outside sandbox; Node v24.20.0;
pnpm 11.15.1 via session Corepack PATH; locked Python 3.12.10.
Independent Astra high validator. Verified matching EdgeDriver override
retained process-locally; no global configuration changes.

Starting HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Ending HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Validated paths and identities before commands:

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `B703D30F15DA2E4F852610C6D41D7ABBF66DD0829B9C994554A139FC5CA5FEFE` | `6416fbc5e1d90a13d3a5be83f0a2f5e0f343db81` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `8B2474D801B21355E4276ADA28D0036FC6E5405001D50F549133992DFB6662F0` | `6c02452d5d2572f1531bfaf11b6a404c34b40763` |
| `apps/desktop/src/settings/app-preference-effects.ts` | `?? apps/desktop/src/settings/app-preference-effects.ts` | `24A5AA2F857A23050432F987998716855601FB28F6260B25680513E4AC039AAA` | `13b1d2d54c33e4998c0faafe5a5052047e2aff79` |
| `apps/desktop/src/settings/app-preference-effects.test.tsx` | `?? apps/desktop/src/settings/app-preference-effects.test.tsx` | `B6ADF594DF25EF32B47CE8006D2D6FBC2AFF5F2E698A67E22703292F96E4E7EF` | `7f38a7ebe0f63a8bd0f1be6769a4ec58fec8fec1` |

Identity recheck: PASS; fresh before/after HEAD/all four identities match;
index empty before/after (`git diff --cached --quiet`, exit 0).

Commands and outcomes:

1. `pnpm.cmd check` -> 0; full unchanged aggregate completed. Evidence
   guard/13 tests; TS/Rust/Python format/lint (both Clippy configurations);
   all TS typechecks, mypy 171 files; 17 generated contracts verified.
   Shared 209/EPUB 651/desktop 646 plus 51 Node tests pass. Rust 87 default/
   88 release-locked pass, including previously failed child-reaping assertion.
   Python 485 pass. Shared/EPUB, Vite/Tauri release and Python sdist/wheel builds
   succeed. Nonfatal pytest nodeids-cache permission and Vite >500 kB warnings.

Diff scope: PASS; exact four-path 1,419-line patch within 1,500 ceiling;
expected director docs outside manifest; `git diff --check` exited 0.
No Rust/dependency/public-contract/unrelated source edits.

Invariant review: PASS; both required extractions preserve independent chains,
receivers/order, execution-local guards, defaults/status/persistence, resolved/
rejected restore asymmetry, late ordering, stable dependencies, exact snapshot
projection, initial publication-before-subscription and original unsubscribe.
App retains state/handlers/resources/effect order. Diagram remains accurate.
Same identities separately passed POST-CHANGE-002's seven gates including
Chromium/native restart/restoration and PACKAGE-001. No model/performance claim.

Test-integrity review: PASS; accepted App tests byte-identical; 28 new App and
16 module cases intact. No assertion weakening, command substitution,
environment relaxation or source repair for rerun.

Privacy/artifact review: PASS; synthetic fixtures, bounded ignored outputs,
no prohibited/unrelated source artifacts or Git mutations.

Action required: none for bounded refactor acceptance. Keep FINAL-001 immutable:
unchanged full rerun passes, but intermittent reaping failure cause was not
established or repaired.

