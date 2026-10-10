# Validation Report

Report ID: NR-MAIN-POST-01-20261009
Target ID: NR-MAIN
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox, repository root; require_escalated
for every acceptance command; process-local Corepack pnpm 11.15.1 and verified
Microsoft EdgeDriver 155.0.4283.45 as in baseline-03. Independent Astra validator.
Starting HEAD SHA: ed42154668bd71d500b5beab77485f9fd20ee2a2
Ending HEAD SHA: ed42154668bd71d500b5beab77485f9fd20ee2a2

| Validated path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src-tauri/src/main.rs` | ` M apps/desktop/src-tauri/src/main.rs` | `0005AE37462873ACD98477C22D525920C52B9F7D4F9013734C665D6566596682` | `8a055c4ff4454f186210903b1493bff35b7ce19a` |
| `apps/desktop/src-tauri/src/diagnostics/mod.rs` | `?? apps/desktop/src-tauri/src/diagnostics/mod.rs` | `EC71A68D0320AB467B16B2955EE63B621A2D1BCB7D40B53303CF9439B02FAE52` | `42e8dd69f38410ba80a99da5b42acfe9a9439e2e` |
| `apps/desktop/src-tauri/src/diagnostics/cli.rs` | `?? apps/desktop/src-tauri/src/diagnostics/cli.rs` | `38281C0FFEC327FF94B0BAC8B03D4996DCC53C8DB87DC105B2CF75A1AC572A4A` | `b12c4ebe1f05e8b8d743b37d53447e75e29c1426` |

Identity recheck: PASS, all identities/HEAD unchanged before/after, empty index
before/after, source writers and Git idle.

Commands and outcomes:

1. `pnpm.cmd format:check:rust`: exit 0.
2. `pnpm.cmd lint:rust`: exit 0, both feature modes, warnings denied.
3. `pnpm.cmd test:rust`: exit 0, 87 default + 88 release-locked, matching baseline.
4. `pnpm.cmd test:native-startup`: exit 0, fresh release build and complete
   WebView2/model-free smoke including binary delivery, cancellation/crash
   recovery, ingress/reader/synchronization/restoration/cleanup, zero errors and
   external requests. Nonfatal existing Vite chunk warning.
5. `git diff --check`: exit 0.

Diff scope: PASS, exactly three source files and 213 added-plus-removed lines,
within 250; only director-owned documentation outside the unit also changed.
Invariant review: PASS, independent exact-text comparison proves the relocated
iterator/match and complete Tauri Builder-through-shutdown tail are identical.
Nine branches, positional/UTF-8 handling, exits/fallthrough, sixteen handlers,
state/setup/force_stop preserved. Visibility remains crate-limited. No feature
gate or include target changed. Test integrity: PASS, no test/assertion edits,
identical counts; native smoke exercises moved model-free dispatch.
Privacy/artifact review: PASS; no private/prohibited/unrelated files, historical
evidence or generated sources; existing installation/data preserved.
Action required: none; drift requires a new report and reruns.

Model/package/installer gates N/A for this dispatch-only patch; no shared runtime
implementation changes. Not all model diagnostic branches nor Unix paths ran;
no Qwen runtime success is claimed. Report recorded immutably by the director.
