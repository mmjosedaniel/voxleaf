# Validation Report

Report ID: APP-PREFERENCE-EFFECTS-01-CHARACTERIZATION-001

Target ID: APP-PREFERENCE-EFFECTS-01

Mode: POST-CHANGE — CHARACTERIZATION

Verdict: FAIL

Environment: local PowerShell 7.6.5 outside sandbox; Node v24.20.0;
pnpm 11.15.1 via session-only Corepack PATH. Independent Astra high validator.

Starting HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Ending HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Validated paths and identities before commands:

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| apps/desktop/src/App.tsx | empty | 3FD5D7A9D155F91112009BD971E731F73AB5E0949030AA464C8A74C7DD2A373D | eb5d6f3c31d4dd9a923d96402813c3405b8645c0 |
| apps/desktop/src/App.test.tsx | ` M apps/desktop/src/App.test.tsx` | 519DEE56498C8C4F18CE1FB2FA15E2BE47190C4178A18A0726D4CE22F5E5101E | 5575e9cf2da37b2c82a542207081560d90970df0 |

Identity recheck: PASS; identical HEAD/identities before and after; App remains
baseline bytes, both module paths ABSENT. Empty index before/after.

Commands and outcomes:

1. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> 0.
2. `pnpm.cmd --filter @voxleaf/desktop test` -> 0; 55 files / 630 Vitest
   tests including 28 new cases; 51 Node tests; zero failures/skips.
3. `pnpm.cmd format:check:typescript` -> 1; Prettier flags App.test.tsx.
4. `pnpm.cmd lint:typescript` -> 1; unused `_props` at 617:29 and 683:29.

Diff scope: PASS; exclusively App.test.tsx +729/-1, below original 1,100 cap;
import replacement is the deletion, existing cases intact. Expected director
documentation outside manifest. `git diff --check` exited 0.

Invariant review: PASS for characterization. All eleven templates reviewed;
complete status/read/restore/edit/reset/snapshot/lifecycle/replacement matrix.
Late active reads can replace earlier presentation updates; existing behavior
is recorded without new policy. Exact setter suppression after unmount,
publish-before-subscribe, unsubscribe identity and no closure require module
tests because App has multiple subscribers and React suppresses unmounted UI.

Test-integrity review: PASS; controlled promises, explicit notifications,
real App handlers and real Settings observer; no sleeps, copied effects,
weakened existing assertions or broad snapshots.

Privacy/artifact review: PASS; synthetic fixtures, no prohibited artifacts.

Action required: format only App.test.tsx, remove two unused parameters while
retaining typed mock.calls and assertions, then rerun all four checkpoint
commands under a fresh Report ID. Extraction remains gated.
