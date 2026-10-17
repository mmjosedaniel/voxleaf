# Validation Report

> **Sanitized publication copy.** Personal paths are redacted; report IDs,
> results and validation hashes retain their historical meaning.
> Original SHA-256: `ebdf378755bb126b35e072eebac732dfdf252adc88af73362c5cf9dbb84d88dc`.
> See [publication and original retention](../historical-privacy-cleanup/README.md).

Report ID: STATE-SUBSCRIPTIONS-01-BASELINE-01-20261012
Target ID: STATE-SUBSCRIPTIONS-01
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox. All acceptance and identity commands executed with `sandbox_permissions=require_escalated` from `<REPO_ROOT>`; PowerShell 7.6.5, Node v24.20.0, pnpm 11.15.1. Each pnpm invocation used the process-local prelude `$env:PATH = 'C:\nvm4w\nodejs\node_modules\corepack\shims;' + $env:PATH`. Resolved pnpm: `C:\nvm4w\nodejs\node_modules\corepack\shims\pnpm.cmd`. No dependency, global toolchain, source, configuration, documentation, or Git mutation occurred.
Starting HEAD SHA: 44a83f4113e9cbeadee7d8a2d0e62838df70629b
Ending HEAD SHA: 44a83f4113e9cbeadee7d8a2d0e62838df70629b
Validated paths:

1. `apps/desktop/src/tts/use-product-narration-snapshot.ts`
2. `apps/desktop/src/tts/use-hardware-compatibility-snapshot.ts`
3. `apps/desktop/src/tts/snapshot-subscription-hooks.test.tsx`
4. `apps/desktop/src/tts/ProductNarrationControls.tsx`
5. `apps/desktop/src/tts/HardwareCompatibilityControls.tsx`
6. `apps/desktop/src/settings/ReaderSettingsDialog.tsx`
7. `apps/desktop/src/tts/ProductNarrationControls.test.tsx`
8. `apps/desktop/src/settings/ReaderSettingsDialog.test.tsx`

Validated path identities: Captured before commands; exact porcelain output is empty for every path (`[]` in the JSON capture), not a literal two-space status. The first three paths are planned additions and were absent. Existing paths were clean tracked files. SHA-256 binds worktree bytes; blob is computed using `git hash-object --path=<path> -- <path>` without writing objects.

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/tts/use-product-narration-snapshot.ts` | empty | ABSENT | ABSENT |
| `apps/desktop/src/tts/use-hardware-compatibility-snapshot.ts` | empty | ABSENT | ABSENT |
| `apps/desktop/src/tts/snapshot-subscription-hooks.test.tsx` | empty | ABSENT | ABSENT |
| `apps/desktop/src/tts/ProductNarrationControls.tsx` | empty | `683cf305cb82e01afef91e7e481b1922fea55322969cc84be6f373429e1c1120` | `49c8358dea22211c385177c4d9b301505477c25c` |
| `apps/desktop/src/tts/HardwareCompatibilityControls.tsx` | empty | `3acca5106bafd089282c536d2f639bbe80e7128f3391d8879d0d7f9cfc184384` | `6bf1bb57fc346a2359219e48c82d5042523efdf2` |
| `apps/desktop/src/settings/ReaderSettingsDialog.tsx` | empty | `27a0f9e99de3e7ac9c2b3b9152d463ff9c4a8f069ac858f2399b1e32757f4280` | `3d84b4e268b40b1a35aff34552eb4371faf3be46` |
| `apps/desktop/src/tts/ProductNarrationControls.test.tsx` | empty | `4b27b27fea4faadae3c09a1ba9d463f3b09450552187b2be5415a2fe47811103` | `cca6f891ef3dac4479baf0635916c06d92753023` |
| `apps/desktop/src/settings/ReaderSettingsDialog.test.tsx` | empty | `a182ca4b97ab4f87c54bff645fcb1c177d06805f12b52382fc6ec525d788e2c1` | `b85eb98adbe2bf0be15492da12071e61bd4059e8` |

Identity recheck: PASS. Starting/ending full HEAD identical; all eight path statuses, SHA-256 values and filter-aware blob identities identical. `git diff --cached --quiet` exited 0 before and after; `git diff --cached --name-status` and `git status --porcelain=v1 --untracked-files=all` were empty before and after. `git diff --check` exited 0 before and after. Branch remained `codex/desktop-state-subscription-hooks`. Writer and Git mutations remained idle throughout acceptance.

Commands and outcomes:

1. `pnpm.cmd build:packages` -> exit 0. Shared and EPUB TypeScript build projects succeeded; establishes current dependency build availability.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0. `tsc --project tsconfig.json --noEmit` succeeded; establishes desktop static type correctness on this baseline.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0. Vitest 56 files / 649 tests passed; all 51 native-helper Node tests passed, zero failed/cancelled/skipped/todo. Vitest duration 6.87 seconds; Node duration 4472.4725 ms. Includes existing App, Product controls, hardware controls, Settings, optional-client and runtime-owner regression suites.
4. `pnpm.cmd format:check:typescript` -> exit 0. All matched files use Prettier style; non-writing formatting check.
5. `pnpm.cmd lint:typescript` -> exit 0. ESLint completed without reported violations; includes hook rule/static checks.
6. `pnpm.cmd test:browser` -> exit 0. All 7 Chromium tests passed in 11.2 seconds, covering visual locator geometry, EPUB2/NCX, local-open shell, oversized-chapter rejection, restoration/reflow, keyboard operation and synchronization feasibility. Baseline build emitted non-failing chunk-size and FORCE_COLOR/NO_COLOR warnings.
7. `pnpm.cmd test:native-startup` -> exit 0. Release build completed in 26.39 seconds. Packaged WebView2 smoke reported successful root mount, bounded TTS protocol, supervised model-free lifecycle with binary delivery/cancellation/crash recovery, local file reselection/cancellation/replacement and size boundaries, accessible narrow keyboard reader and synchronization, local synthetic image decode, position/preferences restart restoration and publication replacement cleanup; zero errors and zero external requests. Non-failing Vite chunk-size warning retained.
8. `git rev-parse HEAD`; `git branch --show-current`; `git diff --cached --name-status`; `git diff --cached --quiet`; `git status --porcelain=v1 --untracked-files=all`; per-path `git status --porcelain=v1 --untracked-files=all -- <path>`, `Get-FileHash -Algorithm SHA256 -LiteralPath <path>` for existing paths, `git hash-object --path=<path> -- <path>` for existing paths; `git diff --check` -> identity and empty-index results above. No attempt to hash absent paths.

Raw logs and identity captures are retained locally in ignored `tmp/evidence/desktop-state-subscription-hooks/STATE-SUBSCRIPTIONS-01-BASELINE-01-20261012/`: `01-build-packages.log` through `07-native-startup.log`, `before.json`, `after.json`, and `recheck.json`. `git check-ignore` verified the directory is ignored. The recheck capture records each log's SHA-256. Commands used PowerShell output redirection, saved `$LASTEXITCODE`, displayed log tails, and exited with the saved code. No temporary checker script was required; identity checks ran inline. These raw local captures are not permanent public artifacts.

Diff scope: PASS. No source or test diff at baseline; empty whole-worktree status and empty index before/after. The director accepted the audit's eight-path tightening, preserving `HardwareCompatibilityControls.test.tsx` as SKIP. The combined unit remains bounded to 500 added-plus-removed lines; no overlapping second Settings baseline is claimed.

Invariant review: PASS for pre-change readiness, not implementation acceptance. Both coordinator implementations maintain cached snapshots and per-listener unsubscribe functions using instance state. Existing four React bridges preserve receivers. Product availability checking remains a separate `[coordinator]` effect. Settings subscriptions live in mounted child consumers; its parent returns null while closed and preserves the optional-narrator fallback split. Optional Chatterbox recheck awaits `check("explicit-recheck")` and then imperatively reads fresh `observe()` state. App resource construction/teardown, preference effects, hardware-check binding and optional-client refresh/polling retain separate owners. Canonical diagram places presentation, coordinator/runtime, persistence and native responsibilities in their existing boundaries; the proposed internal adapters do not require a new architectural node or edge. React's cached snapshot/subscription cleanup requirements were checked against the [official external-store contract](https://react.dev/reference/react/useSyncExternalStore).

Untested at baseline: the planned hook modules and shared tests do not yet exist. Exact-object preservation, stable same-source subscriptions, hook source replacement/stale emission isolation, independent simultaneous consumers, StrictMode cleanup and absence of action calls require the new focused tests. Existing Product coverage manually rerenders after changing a snapshot and does not yet prove live notifications. Settings does not yet exercise all replacement/fallback/closed/reopen or delayed fresh-recheck cases. These accepted coverage gaps must be closed before post-change PASS. No new performance, GPU/model, private-book or acquisition-journey claim is made. `check:portable` and `check` remain required after the combined patch, not baseline outcomes.

Test-integrity review: PASS. Existing tests/configuration are unchanged. Product retains action, availability presentation, speed, preparation and recovery assertions; Settings retains focus, section order, version, preference routing, activation and recheck assertions; hardware retains real coordinator emission, profile/language/reset, pending presentation and accessibility coverage. No weakened, skipped or substituted assertions were introduced.

Privacy/artifact review: PASS. No tracked or untracked nonignored changes were produced; no book, generated audio, model, secret, private data, generated-source edit or unrelated file entered the diff. Repository builds/tests create their bounded ignored outputs, and validator-created captures stay only under the approved ignored evidence directory.

Action required: none for baseline acceptance. Director may freeze the work order referencing this immutable report. The report does not authorize implementation acceptance, staging, commit, push or PR. New hook and characterization checkpoints must receive their own exact identities and execution evidence; full post-change/package/final gates remain required.
