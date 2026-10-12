# Validation Report

Report ID: APP-PREFERENCE-EFFECTS-01-BASELINE-001

Target ID: APP-PREFERENCE-EFFECTS-01

Mode: BASELINE

Verdict: BLOCKED

Environment: local PowerShell 7.6.5 outside sandbox, `require_escalated`.
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

Identity recheck: PASS; HEAD and all identities matched after commands;
`git diff --cached --quiet` exited 0 before and after.

Commands and outcomes:

1. `pnpm.cmd build:packages` -> exit 1 before build,
   `ERR_PNPM_UNSUPPORTED_ENGINE`: expected pnpm 11.15.1, got 11.25.0.
   The session resolved the Codex runtime fallback pnpm executable.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> NOT RUN.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> NOT RUN.
4. `pnpm.cmd format:check:typescript` -> NOT RUN.
5. `pnpm.cmd lint:typescript` -> NOT RUN.
6. `pnpm.cmd test:browser` -> NOT RUN.

Diff scope: PASS; source clean and planned additions absent. Director's plan
edit is expected outside the source manifest. `git diff --check` exited 0.

Invariant review: PASS for unchanged-source inspection; runtime invariants
were not executed in this attempt.

Test-integrity review: PASS; existing tests unchanged; late-completion
characterization remains pending.

Privacy/artifact review: PASS; no source/private/generated additions; empty index.

Action required: select the already-installed Corepack shim through session-only
PATH and rerun all six unchanged commands with fresh identities and Report ID.
Validator verified `C:/nvm4w/nodejs/node_modules/corepack/shims/pnpm.cmd`
reports 11.15.1 and Node reports v24.20.0. This is a toolchain prerequisite
failure, not a source regression. No repository dependency was modified.
