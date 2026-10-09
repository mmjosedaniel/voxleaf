# APPROVED WORK ORDER

Target ID: MOD-A-HARNESS-REPAIR-01  
Goal: repair the measured disabled alternate click in mandatory host validation.  
Risk: medium. Freeze [audited draft](MOD-A-harness-repair-draft-01.md) requirements.

Allowed files:

- `apps/desktop/scripts/native-startup-smoke.mjs`
- `apps/desktop/scripts/adaptive-tts-profile-selection.mjs`
- `apps/desktop/scripts/native-webdriver-client.node-test.mjs`

Required edits: extract only the alternate operation into the named specific
helper; wait for the same alternate's effective enabled state; guard one actual
click; retain active-profile assertion using remaining original total deadline;
add actual-DOM regression tests in the existing configured Node file.

Behavior invariants: same first nonrequested alternate, profile/language/arms,
one click, fixed assertion/error, shared 90-second total budget, already-active
no-click route, rejection propagation, and unchanged target/language/optional/
cleanup behavior. No retries, skips, increased deadlines or weaker assertions.

Forbidden: four frozen MOD-A product paths, any other file, dependency/configuration,
generic driver, native/payload/authority/Git changes, broad formatting or MOD-B.
Diff ceiling: three repair paths, maximum 325 added/deleted lines.

## Independent baseline evidence

Report ID: MOD-A-HARNESS-REPAIR-01-BASELINE-01-20261006  
Mode: BASELINE. Verdict: PASS for focused repair readiness only.  
Author: refactor_validator, local PowerShell outside sandbox, pnpm 11.15.1.  
HEAD before/after: c140d0f2971cd6498fff2728dfa009acd01126f1.

| Validated path | Porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/scripts/native-startup-smoke.mjs` | empty | `74c71fad4e847e05b80c86d903d0f60a8e1ea6b688e0232f5636c72978f0eae3` | `e84d80537e3cdab4c79a95ddcfae83053c08491d` |
| `apps/desktop/scripts/adaptive-tts-profile-selection.mjs` | empty | ABSENT | ABSENT |
| `apps/desktop/scripts/native-webdriver-client.node-test.mjs` | empty | `3614148f81279b61d710e3ff728ae639a49b8f92840e1c952755c583d78c70ca` | `4e22e1b492bf121da76d585eddbb606cdc93019e` |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `cfdcf0f1a2a816a026c0533e7f7f9ad1c7b5b590a0dde109e7d141f769c5b13b` | `65808bbbec4042937f6ee5e08917dea65920c5f8` |
| `apps/desktop/src/App.test.tsx` | empty | `8a688be72992dfaf615a06f81607811961a866172375a0145a9820e7bab78dfb` | `6a2431df8b78a16ff9995fa47abc82524c48c573` |
| `apps/desktop/src/settings/narration-settings-actions.ts` | `?? apps/desktop/src/settings/narration-settings-actions.ts` | `8782470007e32e81af7f6b04bd3cd51f878635e410ab9c70664371e327517db5` | `d49281f8ad9c336568cc6e56f6d596cd25458ac7` |
| `apps/desktop/src/settings/narration-settings-actions.test.ts` | `?? apps/desktop/src/settings/narration-settings-actions.test.ts` | `7f3d915c522c3f77fa40d7c2d30e585118e6554d91049428a052890433ae5ab1` | `a2f0b6cf72c77128e95a4134bf5be1208d1c8a24` |

Identity recheck PASS; all seven unchanged, helper absent, repair paths clean,
index empty. Source/repair scope, readiness invariants, test integrity and privacy
reviews PASS. Existing product patch is read-only context, not permission to edit.

Baseline commands, all exit 0:

- `pnpm.cmd --filter @voxleaf/desktop test:native-driver-client` (12 passed).
- `pnpm.cmd format:check:typescript`.
- `pnpm.cmd lint:typescript`.
- Before/after HEAD/porcelain/SHA-256/blob and git diff --cached --quiet checks.

No model run or source/installed/Git mutation in baseline. POST05 and diagnostic
host report remain FAIL. The observed defect reproduction supports this repair;
focused baseline PASS does not accept MOD-A or relabel a failing host result.

## Validation and completion

Worker may run focused existing Node script outside sandbox for meaningful
regression red/green and exact-path Prettier for the three allowlisted files.
Do not modify acceptance assertions to force a pass. Preserve existing tests.

Independent acceptance in local PowerShell, fresh seven-path manifest:

1. `pnpm.cmd --filter @voxleaf/desktop test:native-driver-client`
2. `pnpm.cmd build:packages`
3. `pnpm.cmd --filter @voxleaf/desktop typecheck`
4. `pnpm.cmd --filter @voxleaf/desktop test`
5. `pnpm.cmd format:check:typescript`
6. `pnpm.cmd lint:typescript`
7. `pnpm.cmd test:browser`
8. `pnpm.cmd test:tts:bilingual-portfolio-exact-host` without observer, all arms.
9. `pnpm.cmd check:portable`
10. `pnpm.cmd check`
11. `git diff --check`

The portfolio lifecycle subsumes separate startup as previously documented.
Only exact-current independent PASS accepts MOD-A and permits MOD-B audit.
Completion output: Change Packet, red/green evidence if run, no commit or push.
