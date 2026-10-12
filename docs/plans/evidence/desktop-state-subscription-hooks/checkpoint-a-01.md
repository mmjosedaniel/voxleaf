# Checkpoint A execution receipt

Receipt ID: STATE-SUBSCRIPTIONS-01-CHECKPOINT-A-01-20261012
Target ID: STATE-SUBSCRIPTIONS-01
Work order: `docs/plans/evidence/desktop-state-subscription-hooks/work-order-02.md`
Checkpoint outcome: all three approved commands passed with stable identities.
Acceptance status: intermediate only; not a final Validation PASS, not a new baseline, and not staging or Git authority. Four consumer migrations and complete post-change/package/final acceptance remain pending.

Environment: normal local PowerShell outside the sandbox in `C:/Users/mmjos/Desktop/workbeanch/voxleaf`. All command and identity acceptance calls used `sandbox_permissions=require_escalated`. PowerShell 7.6.5, Node v24.20.0, pnpm 11.15.1. Each pnpm invocation prepended `C:\nvm4w\nodejs\node_modules\corepack\shims` to the process-local PATH; resolved pnpm was its existing `pnpm.cmd`. No global toolchain or dependency changes.

Starting HEAD SHA: `44a83f4113e9cbeadee7d8a2d0e62838df70629b`
Ending HEAD SHA: `44a83f4113e9cbeadee7d8a2d0e62838df70629b`
Branch: `codex/desktop-state-subscription-hooks`

Validated paths and identities: the closed eight-path work-order allowlist follows. Exact porcelain output for clean paths is empty (`[]` in JSON), not two literal spaces. For modified/addition rows the exact output is the status below, one space, then the full listed path. Leading status spaces are significant: ` M` is an unstaged tracked modification; `??` is an untracked addition. SHA-256 binds worktree bytes; blob uses `git hash-object --path=<path> -- <path>`.

| Path | Porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/tts/use-product-narration-snapshot.ts` | `??` | `8b65ddf8208fdbf10bbef95645177df91a162bb870cd90b35ef5e0dd154788bd` | `64339d62ca7c76764d5a9af8ea2bf178c34c4725` |
| `apps/desktop/src/tts/use-hardware-compatibility-snapshot.ts` | `??` | `f37f90991ac2cc33162f105b490d6afa96465f8b231792a0baf9009b7a009bb3` | `6a8a725f5b9d4813ae296c3f9a9812a99dc9d67c` |
| `apps/desktop/src/tts/snapshot-subscription-hooks.test.tsx` | `??` | `092a482df14dd8c2411bb7cc69032732d071d3cd3aecadffca11626a5066b8ff` | `921b967e3edfd412fc93b2676c81a2a150f87a28` |
| `apps/desktop/src/tts/ProductNarrationControls.tsx` | empty | `683cf305cb82e01afef91e7e481b1922fea55322969cc84be6f373429e1c1120` | `49c8358dea22211c385177c4d9b301505477c25c` |
| `apps/desktop/src/tts/HardwareCompatibilityControls.tsx` | empty | `3acca5106bafd089282c536d2f639bbe80e7128f3391d8879d0d7f9cfc184384` | `6bf1bb57fc346a2359219e48c82d5042523efdf2` |
| `apps/desktop/src/settings/ReaderSettingsDialog.tsx` | empty | `27a0f9e99de3e7ac9c2b3b9152d463ff9c4a8f069ac858f2399b1e32757f4280` | `3d84b4e268b40b1a35aff34552eb4371faf3be46` |
| `apps/desktop/src/tts/ProductNarrationControls.test.tsx` | ` M` | `02b2a3aaa400aad98d844ebf29f01fb2fe4b77ffee8c4244b930e636794f1707` | `598a7722744762010d8261915b53e452ddc70c5e` |
| `apps/desktop/src/settings/ReaderSettingsDialog.test.tsx` | ` M` | `a2993c8bb0bf166993870f91824e262aa9004c378103fad769b089d3894b3a28` | `9c416f4be7b5d208470da3d0523c977cef354f60` |

Identity recheck: PASS. Before/after full HEAD, all eight porcelain/hash/blob identities, and the whole-worktree status were identical. `git diff --cached --quiet` exited 0 before and after; staged name/status remained empty. `git diff --check` exited 0 before and after. All three original production consumer files match BASELINE-01 byte-for-byte, confirming that characterization ran before the four bridge replacements. The source writer and Git mutations were idle throughout.

Commands and exact outcomes:

1. `pnpm.cmd build:packages` -> exit 0; shared and EPUB TypeScript projects built. This establishes current dependency build availability.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0; desktop `tsc --project tsconfig.json --noEmit` passed, including new hooks and test helpers.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0; 57 files / 661 Vitest tests passed in 6.79 seconds and all 51 Node tests passed in 4545.0376 ms, with zero failed/cancelled/skipped/todo Node tests. Relative to the baseline this is one added suite and twelve added tests: eight hook cases (four per hook), one Product notification case, and three Settings characterization cases.

Each command saved output to its adjacent numbered `.log`, captured `$LASTEXITCODE`, displayed a tail, and exited with the captured code. `before.json`, `after.json` and `recheck.json` retain machine-readable identity and scope evidence; recheck also contains log SHA-256 values. No checker script was needed. Captures are local ignored evidence, not permanent public artifacts.

Independent assertion review:

- Both new hooks use a narrow domain `Pick<Coordinator, "subscribe" | "observe">`, type-only imports, source-dependent `useCallback` wrappers and exactly the same stable `observe` callback for client/server reads. They return the coordinator snapshot directly and own no writable state, effect, action, persistence or resource lifecycle.
- The receiver-sensitive class harness protects exact snapshot object identity, live updates, stable same-source subscriptions, A-to-B replacement, continued B updates, A emissions plus a captured stale listener, unmount cleanup, simultaneous consumers, StrictMode setup/cleanup and unused action spies. Server rendering observes the exact object without subscribing.
- Product uses a real listener set to update availability and the Play button without a manual rerender for the emission. The later same-source rerender verifies availability checking still occurs only once; unmount releases the listener and calls no start/stop/close action.
- Settings exercises initially closed state, open-time subscriptions/version/refresh, live narration preference and disabled-state changes, replacement, continued B notifications, stale A isolation, fallback transitions, close/reopen and final cleanup. It expects three hardware child subscriptions, then none while closed, and checks no incidental hardware/narration/activation/download/cancellation operations.
- Hardware Settings characterization updates both the visible status and download eligibility, replaces A with B, then tests B notification and later A isolation. The explicit recheck case changes the source without notifying before resolving the deferred check and verifies a fresh imperative object read inside the await boundary.
- Existing assertions remain intact; test-helper changes provide observable sources and rerender access rather than replacing old integration coverage. The existing hardware-control suite is unchanged and still runs.

Scope review: PASS for checkpoint A. Five source/test paths changed, all within the closed allowlist: three additions plus the Product and Settings test modifications. Measured added-plus-removed lines: Settings 273+6, Product tests 47+1, shared hook suite 177, hooks 22+22 = 548, below the amended 600 ceiling. Production consumers are unchanged and the excluded hardware-control test is unchanged. Authorized director documentation is separate: active plan modification and untracked baseline-01.md, work-order-01.md and work-order-02.md. Their name/status entries remained unchanged during execution; this receipt does not accept documentation content.

Privacy/artifact review: PASS for inspected checkpoint scope. Additions use synthetic snapshots and existing test boundaries; no generated source, dependency/configuration, private book, model, audio, secret or unrelated source entered the diff. Validator wrote only the approved ignored evidence captures; builds/tests produced their bounded ignored outputs.

Limitations and next action: the hooks are not yet wired to the four consumers. This proves hook behavior plus characterization of the original consumers; it does not prove migrated integration. Formatting/lint, Chromium, native WebView2, portable and final gates were not run at this checkpoint. No performance, GPU/model, acquisition-journey or hardware claim. Director may authorize checkpoint B under immutable order02; after it finishes, the complete post-change acceptance and fresh identity manifest are required.
