# Validation Report

Report ID: STATE-SUBSCRIPTIONS-01-PACKAGE-01-20261012
Target ID: STATE-SUBSCRIPTIONS-01
Mode: PACKAGE
Verdict: PASS
Environment: local PowerShell outside sandbox at repository root, all acceptance/identity calls require_escalated. PowerShell 7.6.5, Node v24.20.0, pnpm 11.15.1 from process-local PATH prefix C:\nvm4w\nodejs\node_modules\corepack\shims.
Starting HEAD SHA: 44a83f4113e9cbeadee7d8a2d0e62838df70629b
Ending HEAD SHA: 44a83f4113e9cbeadee7d8a2d0e62838df70629b
Validated paths: exact eight order02 paths in the manifest below.
Validated path identities: captured before the package command; exact porcelain strings preserve leading spaces. SHA-256 uses Get-FileHash; filter-aware blob uses git hash-object --path=<path> -- <path>.

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

Identity recheck: PASS. Full HEAD, all eight status/hash/blob identities, and whole-worktree status unchanged. Empty index and git diff --check exit 0 before/after. Identities also equal POST-CHANGE-01. Writers/docs/Git remained idle.

Commands and outcomes:
1. `pnpm.cmd check:portable` -> exit 0. Evidence guard and 13 evidence tests; TypeScript/Python format and lint; all package typechecks and Python mypy (171 source files); shared 20 files/209 tests, EPUB 33/651, desktop 57/661 plus 51 Node tests; Python 485 tests (22.06 seconds); shared/EPUB, Vite frontend and Python sdist/wheel builds all passed. Python formatter found 174 files already formatted. This proves the configured portable integration chain on Windows; it is not execution on Linux or a model-backed gate.
2. `& ./tmp/evidence/desktop-state-subscription-hooks/capture-identity.ps1 -ReportId STATE-SUBSCRIPTIONS-01-PACKAGE-01-20261012 -Phase before` and `-Phase after` -> exit 0; HEAD, branch, staged diff/status, whole status, all SHA-256/filter-aware blobs and diff check captured/rechecked.

Warnings: non-failing PytestCacheWarning could not write services/tts/.pytest_cache/v/cache/nodeids (Errno 13) despite host execution; all 485 tests passed. No repair or sandbox attribution is claimed. Existing Vite >500-kB chunk warning also remains. No command was narrowed, replaced or skipped.

Diff scope: PASS. Eight source/test paths, 592 added-plus-removed lines under 600; same patch independently reviewed in STATE-SUBSCRIPTIONS-01-POST-CHANGE-01-20261012. Separate authorized director Markdown remains outside the source manifest, unchanged during validation. No excluded source/configuration/dependency/generated path changed.

Invariant review: PASS. Fresh identities preserve the independently reviewed two receiver-bound, cached-snapshot hooks and exact four observation-only migrations. Source replacement/stale isolation, simultaneous listeners, StrictMode/unmount and server observation tests pass; Product availability effect, Settings child/fallback ownership and fresh post-await hardware read remain intact. Existing App/runtime regression suites pass. Canonical diagram still matches existing presentation/runtime/persistence boundaries. No benchmark, GPU/model, private-book or new installed-acquisition evidence; no architecture, performance or universal hardware claim.

Test-integrity review: PASS. Tests and hooks remain byte-identical to checkpoint A; existing integration assertions retained. No weakened tests, snapshot updates, skip or validation repair.

Privacy/artifact review: PASS. No prohibited/private/unrelated source in the diff. Only bounded ignored build/test output and validator evidence captures were produced. Raw log and before/after/recheck manifests stay in ignored tmp/evidence/desktop-state-subscription-hooks/STATE-SUBSCRIPTIONS-01-PACKAGE-01-20261012/. Log SHA-256: 3486988a0d52d301988fe8eeb9daaa7f8e81970d0e53165e15466a34e0251e37. Local captures are not permanent public artifacts.

Action required: none for PACKAGE acceptance. Required FINAL pnpm.cmd check follows with a new identity-bound report; documentation closeout follows separately. No Git mutation authorized.

