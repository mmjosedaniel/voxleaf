# PR #316 installer helper CI follow-up

## Scope and starting state

Task: repair the failed PR CI without weakening the retained recovery controls.
Base and starting HEAD: `1058d991cfc78cb3fdbadc6526059b04f783735f` on
`codex/deep-findings-minimal-corrections`; index and worktree initially clean.
The completed ExecPlan and its original receipts remain immutable.

The original [Ubuntu portable job](https://github.com/mmjosedaniel/voxleaf/actions/runs/43618371942/job/132518325540)
failed `CCF-C04 installer spawn failure restores original`: `error.syscall` was
undefined. Its Node group recorded 136 passing, one failing and 76 skipped tests.
Windows native foundation, Ubuntu Rust foundation and the dependency audit passed.
These are historical CI results on the original PR head, not acceptance of this fix.

## Cause and reconciliation

VF-0056 is a recurrence of the unimported CCF-C04 no-spawn recovery contract,
introduced by VF-0040's process-containment wrapper in the starting commit.
When Node cannot create the PowerShell helper, the new wrapper discards the
launch error and marks containment uncertain. `runJourney` retains the backup
and returns a recovery error even though no installer could run. Ubuntu exposes
this through the existing portable test; a deliberately missing helper reproduces
the same production path on Windows. This differs from VF-0040's non-exiting child.

The earlier Windows no-spawn test exercised the helper's receipt for a rejected
installer executable. Its uncertain-containment fixture instead used a missing
helper and encoded the overly conservative result, so it did not distinguish
failure to launch from a launched helper that produces no valid receipt.

## Validation decisions, recorded before execution

1. RED: run only the new portable missing-helper regression against the unchanged
   production owner. Assert the original launch error, zero uninstall calls,
   restored sentinel, absent backup, and a second attempt without manual recovery.
2. GREEN: run the complete ordinary release-host Node file, including real Windows
   installer/uninstaller parent/descendant containment and unrelated-process
   controls. Change the uncertain-containment fixture to start a real executable
   that exits without a receipt; preserve backup retention and explicit safe retry.
3. Static acceptance: run the existing TypeScript formatting, ESLint and evidence
   checks. No TypeScript, Rust, Python, public contract, dependency, model, packaged
   artifact or application UI changes are planned. Their local suites are not
   selected for this maintainer-script-only fix; no old PASS is relabeled current.
4. Independent review: freeze the complete patch and obtain `change_reviewer`
   approval with fresh identities and the host RED/GREEN receipts. Then publish
   the authorized correction to the existing PR and inspect its new hosted CI.

All local test and validation commands use normal PowerShell outside the managed
sandbox. Raw captures belong to ignored `tmp/evidence/deep-findings-ci-follow-up/`.
No earlier test result is reused as current acceptance evidence. Hosted Ubuntu
validation remains necessary because local controlled Windows injection does not
establish Linux execution.

## Results

RED receipt `red-missing-helper` (2026-11-14, Node 24.18.0, normal Windows
PowerShell) exited 1 on the original production owner: the new test received
an aggregate recovery error without `code: ENOENT`, before its restoration and
retry assertions. Input identities were unchanged across the run. Command:

```powershell
node --test --test-name-pattern="CCF-C04 missing installer helper" apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs
```

The correction preserves the original Node error and marks proven no-spawn only
when the actual child has no PID and its own error names a spawn syscall. A PID,
unknown error, malformed/absent receipt or unverified containment retains the
existing conservative recovery. No injected install callback can forge the
private error identity. Existing destination-absence checks still precede restore.

GREEN receipt `green-ordinary-host` exited 0: **39 passed, no failures or skips**
in 28.7 seconds. This includes six real Windows installer/uninstaller containment
cases, untouched unrelated processes, successful/uncertain cleanup, malformed
helper output, original CCF-C04/C23 controls, and the missing-helper retry. All
fixtures use owned synthetic directories; their sentinel data and temporary
processes are restored/removed by the assertions and teardown. Command:

```powershell
node --test apps/desktop/scripts/ordinary-chatterbox-release-host.node-test.mjs
```

Both captures used Windows 10 build 26200, Windows PowerShell 5.1.26100.9818,
Node 24.18.0 and pinned offline pnpm 11.15.1. Original production bytes in RED
match the base commit; GREEN captures the correction and unchanged assertions.

The first static-check preparation stopped before running Prettier because the
private capture helper uses `Path.GetRelativePath`, unavailable in Windows
PowerShell 5.1. Its partial files and failure record remain intact. The retry
uses installed PowerShell 7; this is a capture-tool correction, not a product or
test failure. Targeted Prettier preparation reported both source files unchanged,
so it does not invalidate the GREEN bytes.

Static receipt `static-format-lint` exited 0 in normal PowerShell 7: repository
Prettier and ESLint passed. Its complete before/after capture matched, including
6,042 installed JavaScript dependency files. Commands:

```powershell
pnpm.cmd run format:check:typescript
pnpm.cmd run lint:typescript
```

Final documentation/evidence validation runs `pnpm.cmd check:evidence` and
`git diff --check`; its result is supplied directly to the independent review.
These documentation changes are not inputs to the Node behavior or JavaScript
format/lint checks. Their already captured production and test bytes stay frozen.

## Acceptance boundary

The exact patch, closed path identities, host receipts and remaining limitations
are assessed in [DFM-CI-CR-R01-20261114](review-r01.md). The report is outside its
own identity manifest. No prior acceptance report is substituted for this review.
The correction changes only failure classification in the existing maintainer
owner. The Job adapter, timeouts, output bound, installed-state checks and data
restoration owner remain unchanged. The canonical system diagram still matches;
no architecture, app behavior, inference, audio storage or dependency changes.

Hosted CI on the next PR head is a separate integration gate, not yet established
by these local results. CI logs have provider retention; the original failed log
is also preserved privately. This receipt does not claim Linux success, merge,
release, or rerun of the original plan's native GPU/model/package gates.
