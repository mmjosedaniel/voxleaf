# Validation Report

Report ID: APP-PREFERENCE-EFFECTS-01-BASELINE-002

Target ID: APP-PREFERENCE-EFFECTS-01

Mode: BASELINE

Verdict: PASS

Environment: local PowerShell 7.6.5 outside sandbox; Node v24.20.0;
pnpm 11.15.1 selected with session-only Corepack shim PATH.
Independent validator: `refactor_validator`, GPT-6 Astra high.

Starting HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Ending HEAD SHA: 02259dea3be33202a01ea09ca6609c728536bf0b

Validated paths and identities before commands:

| Path | Exact porcelain output | Worktree SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| apps/desktop/src/App.tsx | empty | 3FD5D7A9D155F91112009BD971E731F73AB5E0949030AA464C8A74C7DD2A373D | eb5d6f3c31d4dd9a923d96402813c3405b8645c0 |
| apps/desktop/src/App.test.tsx | empty | 8F20A81599D84D987517E5FF44DE42A0EB1608C466FD3EDDF4D877D524F962FB | 11ae4fdbb9f454f1b9d2e248f430a0c9f40ae585 |
| apps/desktop/src/settings/app-preference-effects.ts | empty | ABSENT | ABSENT |
| apps/desktop/src/settings/app-preference-effects.test.tsx | empty | ABSENT | ABSENT |

Identity recheck: PASS; HEAD and all four identities match before/after commands.
`git diff --cached --quiet` exited 0 before/after; index empty.

Commands and outcomes:

1. `pnpm.cmd build:packages` -> 0; shared and EPUB builds pass.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> 0.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> 0; 55 Vitest files / 602
   tests and 51 Node tests pass, zero failures or skips.
4. `pnpm.cmd format:check:typescript` -> 0.
5. `pnpm.cmd lint:typescript` -> 0.
6. `pnpm.cmd test:browser` -> 0; seven Chromium scenarios pass in 11.3 s.
   Existing color-environment and bundle-size warnings are nonfatal.

Diff scope: PASS. Source paths clean; expected director plan/evidence changes
outside the manifest only. `git diff --check` exited 0.

Invariant review: PASS for unchanged baseline; independent chains, active guard,
restore sink ordering, rejection asymmetry, defaults/statuses, initial snapshot
order and App lifecycle ownership inspected. Missing late-result assertions
remain characterization work; no native/model/performance acceptance claimed.

Test-integrity review: PASS; existing tests including pending-read fixture
unchanged. Existing coverage includes restoration, settlement, replacement,
reset order and heard progress.

Privacy/artifact review: PASS; no prohibited or unrelated source artifacts;
bounded build outputs outside the manifest.

Action required: none for baseline acceptance; proceed with frozen test-only
order. Earlier pnpm mismatch remains separately recorded in baseline-001.
