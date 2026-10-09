# Validation Report

Report ID: MOD-A-POST-CHANGE-02-20261006
Target ID: MOD-A
Mode: POST-CHANGE
Verdict: FAIL
Environment: local PowerShell outside sandbox, require_escalated, repository root;
Node v24.20.0, pnpm 11.15.1 through process-local Corepack shim PATH.
Starting HEAD SHA: c140d0f2971cd6498fff2728dfa009acd01126f1
Ending HEAD SHA: c140d0f2971cd6498fff2728dfa009acd01126f1

Validated paths and before/after identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/App.tsx | ` M apps/desktop/src/App.tsx` | cfdcf0f1a2a816a026c0533e7f7f9ad1c7b5b590a0dde109e7d141f769c5b13b | 65808bbbec4042937f6ee5e08917dea65920c5f8 |
| apps/desktop/src/App.test.tsx | `""` | 8a688be72992dfaf615a06f81607811961a866172375a0145a9820e7bab78dfb | 6a2431df8b78a16ff9995fa47abc82524c48c573 |
| apps/desktop/src/settings/narration-settings-actions.ts | `?? apps/desktop/src/settings/narration-settings-actions.ts` | 35c05b95933e24043c3a5eeca957c8889b9559c7e8f589d34cc7f5a785618a55 | da14822d2563c64ebda16ee55c9dc31815a6edd7 |
| apps/desktop/src/settings/narration-settings-actions.test.ts | `?? apps/desktop/src/settings/narration-settings-actions.test.ts` | 89dfa6fc4b0067ecdae61e0bf1227f23d87fd1b7afbd1fece489c449171246a8 | be4723ef7acf554d9c9b17ae339f0f341efbaa8c |

Identity recheck: PASS, all paths/HEAD unchanged, empty index before/after.
Commands and outcomes:

1. `pnpm.cmd build:packages` -> exit 0.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0; TS2345 resolved.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0; 54 files/581 Vitest tests
   and 32 Node tests pass.
4. `pnpm.cmd format:check:typescript` -> exit 1; Prettier flags both new files.
5. `pnpm.cmd lint:typescript` -> exit 0.
6. `git diff --check` -> exit 0.
7. Browser/portable/final NOT RUN after collected source diagnostics, as directed.
8. Portfolio NOT RUN; independent offline prerequisite remains BLOCKED.

Diff scope: PASS, typing-only correction; production identities unchanged,
540 added/deleted lines across three files, App.test unchanged.
Invariant review: PASS for source and deterministic tests; all named callback,
nullish-stop, DEV/package, activation/removal/reset/presentation invariants retained.
Browser/model-backed behavior remains unvalidated.
Test-integrity review: PASS, 39 new cases execute, original assertions preserved;
App integration test byte-identical to baseline.
Privacy/artifact review: PASS, no prohibited/unrelated source artifacts or
installed-package/firewall/Git mutation.
Action required: repository Prettier formatting of only two new files, preserving
550-line ceiling; new validation report/checks afterwards. Actual interpreter
outbound block separately missing; current PowerShell token is not administrator.
