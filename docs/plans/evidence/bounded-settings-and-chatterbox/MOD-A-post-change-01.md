# Validation Report

Report ID: MOD-A-POST-CHANGE-01-20261006
Target ID: MOD-A
Mode: POST-CHANGE
Verdict: FAIL
Environment: local PowerShell outside sandbox, require_escalated, repository root;
Node v24.20.0, pinned pnpm 11.15.1 through process-local Corepack shim PATH.
Starting HEAD SHA: c140d0f2971cd6498fff2728dfa009acd01126f1
Ending HEAD SHA: c140d0f2971cd6498fff2728dfa009acd01126f1

Validated paths and before/after identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/App.tsx | ` M apps/desktop/src/App.tsx` | cfdcf0f1a2a816a026c0533e7f7f9ad1c7b5b590a0dde109e7d141f769c5b13b | 65808bbbec4042937f6ee5e08917dea65920c5f8 |
| apps/desktop/src/App.test.tsx | `""` | 8a688be72992dfaf615a06f81607811961a866172375a0145a9820e7bab78dfb | 6a2431df8b78a16ff9995fa47abc82524c48c573 |
| apps/desktop/src/settings/narration-settings-actions.ts | `?? apps/desktop/src/settings/narration-settings-actions.ts` | 35c05b95933e24043c3a5eeca957c8889b9559c7e8f589d34cc7f5a785618a55 | da14822d2563c64ebda16ee55c9dc31815a6edd7 |
| apps/desktop/src/settings/narration-settings-actions.test.ts | `?? apps/desktop/src/settings/narration-settings-actions.test.ts` | d8d0cabd7b6f4f7b987990bca753d8ddf5844b52fede7c11e4c4f3dff4f24baa | 0032d1068bf724614d27bbcb5949e9667255b98b |

Identity recheck: PASS; all identities/HEAD unchanged, index empty before/after.
Commands and outcomes:

1. `pnpm.cmd build:packages` -> exit 0.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 1 (tsc exit 2),
   test line 171 TS2345: Promise<void> not assignable to Promise<undefined>.
3. Remaining desktop/format/lint/browser/diff/package/final checks NOT RUN after
   source failure, as directed.
4. Portfolio NOT RUN; independent installed-interpreter firewall blocker remains.

Diff scope: PASS, 540 lines (App 49 added/71 removed, actions 107, tests 313);
three changed source paths, App.test.tsx unchanged. Director docs excluded.
Invariant review: PASS statically, all named action sequencing/React/receiver/
presentation invariants equivalent; runtime acceptance remains pending. Existing
reset refresh-rejection assertion proves presentation precedes refresh completion;
no additional pending-refresh test required.
Test-integrity review: FAIL, meaningful new tests preserve assertions but refresh
fixture does not typecheck; regression from passing baseline.
Privacy/artifact review: PASS, no prohibited/generated/private/dependency/unrelated
source changes or installed-package/firewall mutation.
Action required: fix only refresh mock/deferred typing without weakening assertions,
then rerun required commands under a new report. Firewall blocker is separate.
