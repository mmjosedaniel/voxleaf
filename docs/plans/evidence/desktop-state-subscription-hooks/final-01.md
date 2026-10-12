# Validation Report

Report ID: STATE-SUBSCRIPTIONS-01-FINAL-01-20261012
Target ID: STATE-SUBSCRIPTIONS-01
Mode: FINAL
Verdict: PASS
Environment: local PowerShell outside sandbox at repository root; every acceptance/identity call require_escalated. PowerShell 7.6.5, Node v24.20.0, pnpm 11.15.1 from process-local PATH prefix C:\nvm4w\nodejs\node_modules\corepack\shims.
Starting HEAD SHA: 44a83f4113e9cbeadee7d8a2d0e62838df70629b
Ending HEAD SHA: 44a83f4113e9cbeadee7d8a2d0e62838df70629b
Validated paths: exact eight order02 source/test paths enumerated below.
Validated path identities: captured before the final command; exact porcelain strings preserve leading spaces. SHA-256 uses Get-FileHash; filter-aware expected index blob uses git hash-object --path=<path> -- <path>.

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/tts/use-product-narration-snapshot.ts` | `?? apps/desktop/src/tts/use-product-narration-snapshot.ts` | `8b65ddf8208fdbf10bbef95645177df91a162bb870cd90b35ef5e0dd154788bd` | `64339d62ca7c76764d5a9af8ea2bf178c34c4725` |
| `apps/desktop/src/tts/use-hardware-compatibility-snapshot.ts` | `?? apps/desktop/src/tts/use-hardware-compatibility-snapshot.ts` | `f37f90991ac2cc33162f105b490d6afa96465f8b231792a0baf9009b7a009bb3` | `6a8a725f5b9d4813ae296c3f9a9812a99dc9d67c` |
| `apps/desktop/src/tts/snapshot-subscription-hooks.test.tsx` | `?? apps/desktop/src/tts/snapshot-subscription-hooks.test.tsx` | `092a482df14dd8c2411bb7cc69032732d071d3cd3aecadffca11626a5066b8ff` | `921b967e3edfd412fc93b2676c81a2a150f87a28` |
| `apps/desktop/src/tts/ProductNarrationControls.tsx` | ` M apps/desktop/src/tts/ProductNarrationControls.tsx` | `8300ae18233b02c8366abb8bcc81c97106b9f71d18b56f77383b2bfc8b0cf078` | `e37f48e95f5f6abd27d3eaf3ded1e810328a4d02` |
| `apps/desktop/src/tts/HardwareCompatibilityControls.tsx` | ` M apps/desktop/src/tts/HardwareCompatibilityControls.tsx` | `a28ec3d1369a9ad21dff24cafb820605f8157018d53ee1862189e4f931482b92` | `1c17a85f3133dd0b1bfee1a0c58ebd99c6000864` |
| `apps/desktop/src/settings/ReaderSettingsDialog.tsx` | ` M apps/desktop/src/settings/ReaderSettingsDialog.tsx` | `ddeb5b20b3146acfd5648ec56cb96e49a75a3fa17bc0244395a27a284669f9bf` | `c6f357d4c93b2b0c3423f8aef16e3524e558615a` |
| `apps/desktop/src/tts/ProductNarrationControls.test.tsx` | ` M apps/desktop/src/tts/ProductNarrationControls.test.tsx` | `02b2a3aaa400aad98d844ebf29f01fb2fe4b77ffee8c4244b930e636794f1707` | `598a7722744762010d8261915b53e452ddc70c5e` |
| `apps/desktop/src/settings/ReaderSettingsDialog.test.tsx` | ` M apps/desktop/src/settings/ReaderSettingsDialog.test.tsx` | `a2993c8bb0bf166993870f91824e262aa9004c378103fad769b089d3894b3a28` | `9c416f4be7b5d208470da3d0523c977cef354f60` |

Identity recheck: PASS. Full HEAD, all eight statuses/SHA-256/blobs and whole-worktree status unchanged. Empty index before/after and git diff --check exit 0. Manifest equals POST-CHANGE-01 and PACKAGE-01; all writers/docs/Git remained idle.

Commands and outcomes:
1. `pnpm.cmd check` -> exit 0. Complete configured native chain passed: evidence guard and 13 guard tests; TypeScript/Rust/Python formatting and lint, including clippy with warnings denied for default and release-locked-runtime configurations; all package typechecks and Python mypy (171 source files); shared 20 files/209 tests, EPUB 33/651, desktop 57/661 plus 51 Node tests; Rust default 87 passed/0 failed/1 ignored and release-locked 88 passed/0 failed/1 ignored; Python 485 passed in 21.92 seconds; shared/EPUB builds, Vite production build, Tauri release build (26.36 seconds), Python sdist/wheel builds. The single ignored Rust case in each configuration is the unchanged assignment_failure_child_fixture, selected as a subprocess fixture by the assignment-failure test, not a newly skipped regression.
2. `& ./tmp/evidence/desktop-state-subscription-hooks/capture-identity.ps1 -ReportId STATE-SUBSCRIPTIONS-01-FINAL-01-20261012 -Phase before` and `-Phase after` -> exit 0; closed manifest, HEAD, branch, empty index, status and diff-check evidence captured/rechecked.

Warnings: non-failing host PytestCacheWarning for inability to write services/tts/.pytest_cache/v/cache/nodeids (Errno 13), also seen in PACKAGE-01; existing Vite >500-kB chunk warning. No repair, skipped gate or command substitution. This final command includes native build/Rust checks; separate Chromium and WebView2 runtime acceptance was executed successfully in POST-CHANGE-01, not inferred from build success.

Diff scope: PASS. Eight source/test paths and 592 added-plus-removed lines under order02's 600 ceiling. Four bridge replacements/import cleanup plus two small typed hooks and targeted regression coverage. No excluded source/configuration/dependency/generated/frozen/historical path changed. Authorized director active-plan and evidence/order Markdown is separate and remained unchanged during validation. This source report does not accept future documentation closure.

Invariant review: PASS. Same exact patch reviewed in STATE-SUBSCRIPTIONS-01-POST-CHANGE-01-20261012. Source receiver, authoritative cached-object identity, client/server reader, stable source callbacks, replacement/stale isolation, independent listeners and cleanup remain preserved and tested. Product availability effect stays in place; Settings child-only subscriptions/fallback split, optional refresh/polling, version reads and imperative fresh observe after awaited recheck remain in their existing owners. Actions, disabled conditions, pending/detail state, focus/DOM/labels, App teardown, preference persistence/hydration, locators, synchronization, cancellation, scheduling and audio bounds have no behavior edits and their regression suites pass. Canonical system diagram still matches the internal presentation-only change. No newly exercised GPU/model/performance/private-book/installed-acquisition or universal hardware claim.

Test-integrity review: PASS. Hook and characterization tests remain byte-identical to checkpoint A; they passed both before and after migration. Existing consumer and owner assertions remain intact. No weakened test, fixture snapshot update, introduced skip, or validator repair.

Privacy/artifact review: PASS. No private/prohibited artifact or unrelated source entered the diff. Observation hooks add no diagnostics, persistence, networking, retained history, queue or timer. Generated outputs are bounded ignored build/test products; raw captures remain under ignored tmp/evidence/desktop-state-subscription-hooks/STATE-SUBSCRIPTIONS-01-FINAL-01-20261012/. Adjacent before.json, after.json and recheck.json retain complete identity evidence; 01-check.log SHA-256 is 913b9582edfca2fa8649937cf1a706bd397981c149b5d1c4dea456a9d05ffd4c. Local raw artifacts are not permanent public references.

Action required: none for final acceptance of the exact source/test patch. POST-CHANGE-01, PACKAGE-01 and FINAL-01 now pass separately. Director documentation closure still requires its authorized evidence/link/scope checks; no broad gate rerun is required for documentation-only closure without new risk or source drift. No staging, commit, push or PR is authorized by this report.

