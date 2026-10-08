# Validation Report

Report ID: MOD-A-POST-CHANGE-05-20261006  
Target ID: MOD-A  
Mode: POST-CHANGE  
Verdict: FAIL  
Author: independent refactor_validator (GPT-6 Astra high); persisted by director.

Environment: local PowerShell outside sandbox; `require_escalated`, repository
root, Node `v24.20.0`, pnpm `11.15.1`, documented process-local offline/model
configuration and verified temporary EdgeDriver.

Starting HEAD SHA: `c140d0f2971cd6498fff2728dfa009acd01126f1`  
Ending HEAD SHA: `c140d0f2971cd6498fff2728dfa009acd01126f1`

## Validated path identities

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | `" M apps/desktop/src/App.tsx"` | `cfdcf0f1a2a816a026c0533e7f7f9ad1c7b5b590a0dde109e7d141f769c5b13b` | `65808bbbec4042937f6ee5e08917dea65920c5f8` |
| `apps/desktop/src/App.test.tsx` | `""` | `8a688be72992dfaf615a06f81607811961a866172375a0145a9820e7bab78dfb` | `6a2431df8b78a16ff9995fa47abc82524c48c573` |
| `apps/desktop/src/settings/narration-settings-actions.ts` | `"?? apps/desktop/src/settings/narration-settings-actions.ts"` | `8782470007e32e81af7f6b04bd3cd51f878635e410ab9c70664371e327517db5` | `d49281f8ad9c336568cc6e56f6d596cd25458ac7` |
| `apps/desktop/src/settings/narration-settings-actions.test.ts` | `"?? apps/desktop/src/settings/narration-settings-actions.test.ts"` | `7f3d915c522c3f77fa40d7c2d30e585118e6554d91049428a052890433ae5ab1` | `a2f0b6cf72c77128e95a4134bf5be1208d1c8a24` |

Identity recheck: PASS. All four identities match POST03 and remained unchanged
throughout this attempt. HEAD unchanged; index empty.

## Commands and outcomes

1. `pnpm.cmd test:tts:bilingual-portfolio-exact-host`: fresh execution, exit 1.
   UI preflight 38 tests, driver preflight 12 tests, portfolio preflight five
   tests, offline/configuration/firewall preflight, and native release build
   passed. Native startup/lifecycle matrix passed, including protocol,
   fake-service cancellation/recovery, reader/Settings behavior, cleanup and
   zero external requests. First model arm, Piper Spanish, reported
   compatible/selectable profiles and then failed:

   ```text
   Adaptive exact-host TTS matrix failed during adaptive exact-host profile selection [webdriver-condition-timeout].
   Exact bilingual portfolio packaged matrix failed.
   ```

   Zero of six model arms completed. No retry or substituted command ran.
2. `git diff --check`: fresh exit 0.
3. `pnpm.cmd build:packages`: reused POST03 exit 0.
4. `pnpm.cmd --filter @voxleaf/desktop typecheck`: reused POST03 exit 0.
5. `pnpm.cmd --filter @voxleaf/desktop test`: reused POST03 exit 0;
   581 Vitest + 32 Node tests.
6. `pnpm.cmd format:check:typescript`: reused POST03 exit 0.
7. `pnpm.cmd lint:typescript`: reused POST03 exit 0.
8. `pnpm.cmd test:browser`: reused POST03 exit 0; seven tests.
9. `pnpm.cmd check:portable`: reused POST03 exit 0; shared 209, EPUB 653,
   desktop 581, Node 32, Python 386 tests and portable builds.
10. `pnpm.cmd check`: reused POST03 exit 0; same counts plus Rust 79 normal /
    80 release-locked-runtime tests and native/Python builds.

Reuse is explicit under the plan's exact-identity rule and director continuation
order. POST03 remains immutable; its results do not override the newly failed
host gate.

## Reviews

Diff scope: PASS. Same three changed source files, 568 added/deleted lines within
WORK02's 575-line ceiling. Existing App integration test unchanged. Director
documentation/evidence excluded from source manifest.

Invariant review: FAIL for required runtime acceptance. Static and deterministic/
browser evidence remains satisfactory, but the mandatory packaged profile-selection
route timed out. Available output does not establish whether this is a refactor
regression, pre-existing behavior or a harness/timing problem. No passing
model-backed playback/cancellation evidence exists for this patch.

Test-integrity review: PASS. No source, tests, assertions, timeouts or harness
behavior changed. Both correction loops remain consumed.

Privacy/artifact review: PASS. No prohibited source artifacts entered the diff.
Installed interpreter process IDs were empty before and after; app/driver process
count was zero after cleanup. Installed runtime manifest remained:
`1bca3c4e5706771877ad837398e7930206c8f74eb03e9804a093a4c78f0b6262`.

Scoped setup used the existing pinned downloader in task-owned OS temp.
Downloaded EdgeDriver `154.0.4258.62` matched WebView2, had Valid Microsoft
Authenticode, and retained SHA-256:
`0f4600639201ccd2e84c72c3977ac33c67e19152e197c89eb16a6591d1fbe9f7`.

The global driver was preserved. The temporary driver directory and exact enabled
firewall rule `VoxLeaf-MOD-A-Offline` remain available for subsequent authorized
gates at report time; neither was removed or altered.

## Action required

Stop and diagnose the profile-selection timeout before deciding a new scope or
rerun. Do not add a third source correction, relax the assertion, or retry
silently. MOD-A remains unaccepted; MOD-B must not begin.
