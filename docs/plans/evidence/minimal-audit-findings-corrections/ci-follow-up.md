# MAF pull-request CI follow-up

## Scope and original failure

PR #286 at `af852ee81f593998bd14f1a25d0877a9610e6bcf` failed two jobs in
[Foundation checks run 40967802580](https://github.com/mmjosedaniel/voxleaf/actions/runs/40967802580).
Ubuntu Rust and the separate dependency audit passed. Entry worktree/index were
clean on `codex/minimal-audit-findings-corrections`. The existing user authorization
to commit and update this PR continues; no merge is authorized.

- Ubuntu portable: App's NCC-02 test observed a constructed narrator before
  its React effect had replaced the initial ownerless hardware-check binding.
  Resolving that check did not refresh the expected narrator. The fixture used
  render-time factory side effects as its readiness signal.
- Windows: RAC-07 observed the synchronous Resume scroll before the pending
  follow settlement. Its immediate passive scroll could be undone by the one
  allowed layout correction. Visibility is not a settlement acknowledgement.
  The controller's two-frame settlement and optional two-frame correction are
  already covered by the unit fixture, which flushes before passive inspection.

Original complete job logs are preserved as ignored `ci-job-123776630313.log`
and `ci-job-123776630586.log` in the task evidence scratch directory. Their
failure statuses are not replaced by the earlier local passes.

## Bounded correction and evidence

Only two existing tests change. NCC-02 waits for the second `ensureChecked`
call, which occurs in the mounted narrator's effect after the initial ownerless
binding. RAC-07 drains four browser animation frames, covering the existing
bounded follow settlement, before passive inspection. Focus, selection, advancing
audio, offscreen highlight and cleanup assertions remain intact. There is no
wall-clock sleep, extra retry, disabled test or production change.

`CI-App-baseline-01` passed locally (one selected test); the original Ubuntu
failure remains the red evidence for that fixture's ordering assumption.
`CI-Browser-baseline-01` reproduced the exact CI assertion locally: one failed
and two passed in three selected repetitions. Its original trace, screenshot,
error context, log and snapshots were preserved before subsequent browser runs.

All local commands use normal PowerShell outside the managed sandbox with the
existing offline capture wrapper. Gate classifications before final acceptance:

| Gate | Decision and command | Purpose |
| --- | --- | --- |
| CI-Focused-01 | EJECUTAR: `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx src/tts/hardware-compatibility-check-binding.test.ts src/reader/segment-highlight-controller.test.tsx`; `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep RAC-07 --repeat-each=5` | Mounted ownership, stale checks, follow settlement and repeated browser regression. |
| CI-Static-01 | EJECUTAR: `pnpm.cmd exec prettier --check apps/desktop/src/App.test.tsx apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`; `pnpm.cmd exec eslint apps/desktop/src/App.test.tsx apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`; `pnpm.cmd --filter @voxleaf/desktop typecheck` | Both changed test inputs. |
| CI-Desktop-01 | EJECUTAR: `pnpm.cmd --filter @voxleaf/desktop exec vitest run` | Full desktop discovery, including App interaction with adjacent tests. |
| CI-Browser-01 | EJECUTAR: `pnpm.cmd test:browser` | The complete configured Chromium suite used by Windows CI. Preserve package/frontend build hooks. |
| CI-Docs | EJECUTAR: `pnpm.cmd check:evidence`, local links and whitespace/scope/identity checks | Current follow-up and immutable review. |
| Runtime/core/model gates | NO APLICA as new executions | No production, model, protocol, native, package, fixture-data or dependency inputs change. Original evidence remains historical at its stated revision; this patch adds no runtime claim. |
| Guard unit tests | REUTILIZAR con prueba | Existing 31 isolated guard tests have unchanged source, fixture discovery, configuration and Node environment. Current repository guard is executed again. |
| Hosted CI | EJECUTAR through PR update | Fresh Windows, Ubuntu portable, Ubuntu Rust and dependency checks on the pushed corrective commit. Local Windows results do not claim a Linux run. |

The completed ExecPlan and its R1/R2 reports remain immutable historical evidence.
`MAF-CI-R1-20261029` in `review-CI-R1.md` records independent acceptance of the
exact current correction and host receipts; saving the report is excluded from
its own identity manifest. The final handoff includes the corrective commit and
actual hosted CI status, without inferring green status from local checks.

## Local validation results

- CI-Focused-01: all 89 tests in the three selected Vitest files passed; RAC-07
  passed all five Chromium repetitions. No assertion was removed or relaxed.
- CI-Static-01: scoped Prettier and ESLint plus complete desktop typecheck passed.
- CI-Desktop-01: 61 files, 984 tests passed.
- CI-Browser-01: all 34 browser tests passed, including the previously failing
  RAC-07, real audio/completion controls, reflow and keyboard/synchronization.
- CI-Docs-01 and the independent report retain the final documentary and identity
  outcomes. Staging/commit checks recheck the exact approved content.

Only the two test files, this follow-up and the maintained completed-plan index
change before the independent report is saved. Product code, shared fixtures,
build configuration, workflows, tools and dependency versions remain identical.
The isolated guard-test evidence is retained only for that unchanged closure;
the repository guard inspects these new documents. No Python/Rust/model or native
smoke result is newly claimed by this test-only follow-up.

The retained original job-log SHA-256 values are
`f2fd248409b9b5b715d12b6cba884a024a75ddb9ca49984646e1098664ee7fe8`
(Windows) and
`6531a1c16ce88adecb52862de54fce282cd9888a34a2eef2f37870665037e907`
(Ubuntu portable). The earlier CI failure remains visible in the PR history;
the new hosted execution must establish the corrective commit's actual status.
