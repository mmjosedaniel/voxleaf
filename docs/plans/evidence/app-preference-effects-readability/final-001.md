# Validation Report

Report ID: APP-PREFERENCE-EFFECTS-01-FINAL-001

Target ID: APP-PREFERENCE-EFFECTS-01

Mode: FINAL

Verdict: FAIL

Environment: local PowerShell 7.6.5 outside sandbox; Node v24.20.0;
pnpm 11.15.1 via session Corepack PATH; matched WebView2/driver override retained.
Independent Astra high validator; no global or repository setup changes.

Starting HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Ending HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Validated paths and identities before commands:

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `B703D30F15DA2E4F852610C6D41D7ABBF66DD0829B9C994554A139FC5CA5FEFE` | `6416fbc5e1d90a13d3a5be83f0a2f5e0f343db81` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `8B2474D801B21355E4276ADA28D0036FC6E5405001D50F549133992DFB6662F0` | `6c02452d5d2572f1531bfaf11b6a404c34b40763` |
| `apps/desktop/src/settings/app-preference-effects.ts` | `?? apps/desktop/src/settings/app-preference-effects.ts` | `24A5AA2F857A23050432F987998716855601FB28F6260B25680513E4AC039AAA` | `13b1d2d54c33e4998c0faafe5a5052047e2aff79` |
| `apps/desktop/src/settings/app-preference-effects.test.tsx` | `?? apps/desktop/src/settings/app-preference-effects.test.tsx` | `B6ADF594DF25EF32B47CE8006D2D6FBC2AFF5F2E698A67E22703292F96E4E7EF` | `7f38a7ebe0f63a8bd0f1be6769a4ec58fec8fec1` |

Identity recheck: PASS; before/after HEAD/all identities identical, empty index,
no source drift.

Commands and outcomes:

1. `pnpm.cmd check` -> 101. Evidence guard/13 tests; TS/Rust/Python format;
   TS/Python lint and default/release-locked Clippy; all TS typechecks, mypy
   171 files, 17 generated contracts; shared 209/EPUB 651/desktop 646 Vitest
   plus 51 Node pass. Default Rust 87 pass; release-locked Rust 87 pass/1 fail.
   Exact failed test:
   `tts_service_supervisor::tests::failed_job_assignment_kills_and_reaps_the_spawned_child`.
   Panic at `src/tts_service_supervisor/tests.rs:292:5`:
   `the failed assignment path must wait until the child process is reaped`.
   Python tests and final builds NOT REACHED due command short-circuit.

Diff scope: PASS; reviewed four-file 1,419-line patch, expected director docs;
no Rust edits; `git diff --check` exited 0.

Invariant review: PASS for refactor behavior via unchanged accepted source and
POST-CHANGE-002/PACKAGE-001 evidence. Native release-locked Job Object reaping
assertion failed; cause not established as a refactor regression or dismissed
as pre-existing. Same test passed default configuration. Final acceptance absent.

Test-integrity review: PASS; no assertion/source changes, bypass or substitution.

Privacy/artifact review: PASS; no prohibited/unrelated source artifacts;
bounded ignored outputs, empty index.

Action required: confirm unchanged native source/test and absence of leftover
owned processes read-only, then one fresh full `pnpm.cmd check` report.
Director authorized this bounded repeat, not an out-of-scope Rust repair.
Retain this failure regardless of retry outcome; reassess if repeat fails.

