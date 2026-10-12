# Validation Report

Report ID: APP-PREFERENCE-EFFECTS-01-CHARACTERIZATION-002

Target ID: APP-PREFERENCE-EFFECTS-01

Mode: POST-CHANGE — CHARACTERIZATION

Verdict: PASS

Environment: local PowerShell 7.6.5 outside sandbox; Node v24.20.0;
pnpm 11.15.1 via session-only Corepack PATH. Independent Astra high validator.

Starting HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Ending HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Validated paths and identities before commands:

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| apps/desktop/src/App.tsx | empty | 3FD5D7A9D155F91112009BD971E731F73AB5E0949030AA464C8A74C7DD2A373D | eb5d6f3c31d4dd9a923d96402813c3405b8645c0 |
| apps/desktop/src/App.test.tsx | ` M apps/desktop/src/App.test.tsx` | 8B2474D801B21355E4276ADA28D0036FC6E5405001D50F549133992DFB6662F0 | 6c02452d5d2572f1531bfaf11b6a404c34b40763 |

Identity recheck: PASS; identical HEAD/identities before and after; App remains
baseline bytes, both module paths ABSENT. Empty index before/after.

Commands and outcomes:

1. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> 0.
2. `pnpm.cmd --filter @voxleaf/desktop test` -> 0; 55 files / 630 Vitest
   tests including all 28 new cases; 51 Node tests; zero failures/skips.
3. `pnpm.cmd format:check:typescript` -> 0.
4. `pnpm.cmd lint:typescript` -> 0.

Diff scope: PASS; only App.test.tsx +755/-2=757. Correction adds ReactElement
type, fixes two mock signatures and applies formatting. Production unchanged;
expected director documentation outside manifest. `git diff --check` exited 0.

Invariant review: PASS for characterization; all status/default/persistence,
independent read/rejection, receiver/order, resolved-unavailable asymmetry,
restoration/edit/reset/notification timing, StrictMode/unmount/replacement and
stable rerender assertions retained. Module tests must still directly prove
setter suppression, publish-before-subscribe, exact unsubscribe and no closure;
browser/native/aggregate gates remain later phases.

Test-integrity review: PASS; existing tests and all 28 new cases retained;
controlled events and real Settings observer, no copied effects/production seams.

Privacy/artifact review: PASS; synthetic fixtures only, no Git mutations.

Action required: none for this checkpoint. Continuation may be ordered; this
does not accept the unfinished extraction. Preserve failed CHARACTERIZATION-001.
