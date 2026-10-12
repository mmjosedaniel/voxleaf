# Validation Report

Report ID: STATE-SUBSCRIPTIONS-01-POST-CHANGE-01-20261012
Target ID: STATE-SUBSCRIPTIONS-01
Mode: POST-CHANGE
Verdict: PASS
Environment: local PowerShell outside sandbox, repository root C:/Users/mmjos/Desktop/workbeanch/voxleaf. Every acceptance and identity call used sandbox_permissions=require_escalated; PowerShell 7.6.5, Node v24.20.0, pnpm 11.15.1. Each pnpm invocation prepended C:\nvm4w\nodejs\node_modules\corepack\shims to process-local PATH, selecting the existing pinned Corepack pnpm.cmd. No global, dependency or source changes by the validator.
Starting HEAD SHA: 44a83f4113e9cbeadee7d8a2d0e62838df70629b
Ending HEAD SHA: 44a83f4113e9cbeadee7d8a2d0e62838df70629b
Validated paths: the exact eight work-order-02 paths enumerated in the manifest below; all are present. Branch codex/desktop-state-subscription-hooks.
Validated path identities: captured before commands. SHA-256 binds raw worktree bytes; filter-aware expected index blobs use git hash-object --path=<path> -- <path>, without writing. Exact porcelain strings include significant leading spaces.

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

Identity recheck: PASS. Full HEAD and all eight statuses/SHA-256/blob identities unchanged after commands; whole-worktree status also unchanged. Empty index before/after (git diff --cached --quiet exit 0, staged name/status empty), git diff --check exit 0 before/after. Writers, documentation and Git mutations remained idle. Separate authorized director documentation stayed outside the source manifest.

Commands and outcomes:
1. `pnpm.cmd build:packages` -> exit 0; shared and EPUB tsc project builds passed, establishing dependency build availability.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0; desktop tsc --noEmit passed, including new hook types/test helpers.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0; 57 files / 661 Vitest tests in 6.59 seconds and 51/51 Node tests in 4365.0606 ms; zero Node failures/cancellations/skips/todo. This includes App, Settings, optional client, hardware controls and coordinator/runtime regressions plus all twelve added cases.
4. `pnpm.cmd format:check:typescript` -> exit 0; all matched files pass Prettier, without writes.
5. `pnpm.cmd lint:typescript` -> exit 0; ESLint static/hook checks clean.
6. `pnpm.cmd test:browser` -> exit 0; 7/7 Chromium tests in 11.1 seconds: locator geometry, EPUB2/NCX, shell/browser boundary, oversized chapters, reflow/restoration, accessible keyboard navigation and synchronization feasibility.
7. `pnpm.cmd test:native-startup` -> exit 0; release build 25.85 seconds; packaged WebView2 reports root mount, bounded protocol/supervised model-free lifecycle, binary delivery/cancellation/crash recovery, file reselection/cancellation/replacement and size boundaries, accessible narrow keyboard reader/synchronization, local image decode, restart/reselection restoration and cleanup passed; zero errors/external requests.
8. Host identity script `& ./tmp/evidence/desktop-state-subscription-hooks/capture-identity.ps1 -ReportId STATE-SUBSCRIPTIONS-01-POST-CHANGE-01-20261012 -Phase before` and identical `-Phase after` -> exit 0; execute full HEAD, branch, index, status, per-path SHA-256/filter-aware blobs and diff-check inspections described above.

Known non-failing warnings: existing Vite bundle chunk size >500 kB and browser FORCE_COLOR/NO_COLOR warning, both present at baseline. No new failure or gate substitution.

Evidence: adjacent before.json, after.json, recheck.json and numbered 01-07 .log files in ignored tmp/evidence/desktop-state-subscription-hooks/STATE-SUBSCRIPTIONS-01-POST-CHANGE-01-20261012/. The recheck contains each log's SHA-256. Command wrappers redirect exact-command output, capture LASTEXITCODE and exit with it. The reusable ignored capture-identity.ps1 records/rechecks the closed manifest without modifying source or Git. Captures are local retention, not permanent public references.

Diff scope: PASS. Exactly eight allowed source/test paths changed, totaling 592 added-plus-removed lines: Settings tests 273+6, Product tests 47+1, shared hook suite 177, two hooks 22+22, Product consumer 3+12, hardware consumer 3+11, Settings consumer 4+11. The only consumer production changes are four bridge replacements and required import cleanup. No excluded coordinator, App, reader, persistence, optional-client, hardware-test, dependency, configuration, native, generated or historical-authority path changed. Separate authorized director documentation exists outside the source allowlist: active plan plus baseline/checkpoint/order Markdown; documentation closeout is not accepted by this source report.

Invariant review: PASS.
- Each new hook accepts only the existing domain coordinator's subscribe/observe capabilities, uses type-only coordinator/snapshot imports, has an explicit snapshot return type and keeps source-dependent useCallback wrappers. Calls retain the source receiver; the source object itself is returned without copying, projection, mutation, freezing or parallel state. The same reader is supplied for client and server observation.
- The shared receiver-sensitive test harness asserts exact initial and notified object identity, stable same-source subscribe identity, replacement cleanup and immediate B state, continued B notifications, changed A emissions plus a captured stale listener, independent simultaneous consumers, StrictMode live/final cleanup, no lifecycle/action calls, and server reading without subscribing. All eight hook tests run through the full desktop suite.
- Product's live-notification case changes availability and Play enabled state through a real listener emission. Availability checking remains in the original [coordinator] effect. Detail state, actions, recovery, labels, DOM and conditions are unchanged.
- Settings retains the conditional fallback/coordinator component split and its child-only observations. The parent returns null while closed. Tests establish closed/open/replacement/fallback/reopen subscription lifetimes, version reads and optional refresh counts; no incidental check, availability, activation, playback, close, download or cancellation operation. Hardware status and acquisition eligibility update from live A and B sources; later A emissions are ignored.
- Optional Chatterbox retains acquisition derivation plus the awaited explicit check and subsequent fresh imperative observe call. The deferred characterization changes cached hardware without emission before resolving check and asserts the exact freshly read object. Original optional-client refresh/polling, pending state and cleanup, action handlers, focus/disabled/visibility/DOM/wording remain unchanged.
- App and existing runtime owners retain construction, replacement, teardown, preference hydration/version rejection, stable locators, restoration, cancellation, scheduling, queues, playback and bounded audio ownership. This is supported by the narrow diff and existing regression suites, not a new model/performance measurement.
- Canonical system diagram reviewed: hooks stay inside React presentation consuming already-owned coordinator snapshots; no process, trust, persistence or data-flow boundary changes. No diagram or ADR update needed. React's cached snapshot and subscription cleanup rules were checked against https://react.dev/reference/react/useSyncExternalStore.

Test-integrity review: PASS. All five hook/test paths are byte-identical to the successfully executed checkpoint A identities; only the three production consumer files changed afterward. Existing Product/Settings assertions were retained, and the excluded hardware suite still runs unchanged. Tests exercise state and behavior rather than hook names/imports. No snapshot refresh, relaxed condition, skip, command substitution or test repair by the validator.

Privacy/artifact review: PASS. Source additions contain synthetic test state and observation adapters, with no diagnostics, storage, networking, queues, timers, retained history or content flow. No books, model weights, generated audio, secrets, private input, manually generated-source changes or unrelated source entered the diff. Builds/tests create bounded ignored outputs. Validator-created scripts, raw logs and identity captures are confined to ignored tmp/evidence/desktop-state-subscription-hooks.

Limits: no measured rendering, memory, latency, GPU/model, private-book, external installed-acquisition or installer-publication claim. Existing owner code and its regression coverage support retained constraints; these observation adapters do not trigger a new exact-host TTS/performance gate. New source/runtime changes or identity drift require a new report and rerunning applicable commands. These reports do not grant Git mutation authority.

Action required: none for POST-CHANGE acceptance of this exact source patch. Required PACKAGE check:portable and FINAL check remain pending as separate reports. Documentation closeout follows those gates and has its own evidence/link/scope review.

