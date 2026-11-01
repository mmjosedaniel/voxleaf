# PR #291 native restart follow-up

This is a second, additive CI correction after commit
`6e338eb29fb15783ba0ec7a10eeb787b57898266`. The
[first follow-up](ci-follow-up.md) and its independent report retain their
original scope and uncertainty.

## Evidence and scope

The single hosted retry of the original commit,
[Windows job 124705058309](https://github.com/mmjosedaniel/voxleaf/actions/runs/41251601002/job/124705058309),
passed initial startup but failed at `native restart session creation` with
`webdriver-session-not-created`. The raw log remains ignored locally as
`tmp/evidence/psc-ci-follow-up/windows-retry.log`. This is distinct from the
original startup/unknown-error failure; neither failure is relabelled a PASS.

The runner sent `DELETE /session` and immediately created another session with
the same profile. It did not verify that the original application/browser
processes had exited. A deferred-exit regression demonstrated that the old
sequence admitted restart before exit and ignored exit-verification failure.
[Microsoft's process-lifecycle documentation](https://learn.microsoft.com/microsoft-edge/webview2/concepts/process-related-events)
describes asynchronous browser exit and the need to wait for exit when replacing
environments. This supports checking the lifecycle boundary; the hosted driver's
generic response still does not prove the exact original internal failure.

## Correction

Before deletion, the runner captures the live application's own subtree and
checks its root against the previously captured PID, creation time and executable.
New child identities are retained for final cleanup before deletion can orphan
them. The persistent WebDriver bridge and its console are excluded.

After deleting the session, the runner waits for those exact identities to exit
before creating the replacement. The wait uses one ten-second budget and held
process handles. A reused PID cannot make it wait on or terminate an unrelated
process. Missing processes count as exited; other lookup failures remain errors.
The wait never kills a process. Timeout or uncertain ownership fails the smoke;
existing final cleanup still runs. Cancellation is checked before reopening.
No retry, larger startup deadline, profile deletion, assertion bypass or
application/runtime change is added.

## Preserved intermediate outcomes

The first wait candidate incorrectly included the persistent bridge's
`conhost.exe` and timed out locally. A diagnostic probe identified that selection
error. Selection now uses the application's verified subtree instead of all
non-driver children. The diagnostic instrumentation is not in the patch.

The first diagnostic probe itself failed because its PowerShell lookup returned
a nonzero status for an already-exited process. Its corrected probe and the
selection diagnostic are retained separately; none is acceptance evidence.
All attempts completed the existing final cleanup: zero new owned processes
and scratch roots. Pre-existing scratch and adjacent resources were preserved.

## Validation

Normal local PowerShell outside the managed sandbox; Node 24.18.0 and pnpm
11.15.1. Receipts and exact source/export identities remain under ignored
`tmp/evidence/psc-ci-follow-up/`.

- `restart-before`: two intended failures prove premature restart and ignored
  unverified exit; two existing diagnostic tests pass.
- `restart-directed`: five directed cases pass, including an actual Windows
  child with bounded timeout, identity mismatch, delayed exit and already-exited
  handling.
- `restart-final`: 68 tests passed with
  `pnpm.cmd --filter @voxleaf/desktop exec node --test scripts/native-smoke.node-test.mjs scripts/native-webdriver-client.node-test.mjs`;
  `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript` and
  `pnpm.cmd --filter @voxleaf/desktop typecheck` all passed.
- `restart-native-final`: `node apps/desktop/scripts/native-startup-smoke.mjs`,
  through the identity/cleanup wrapper, passed the complete ordinary WebView2
  matrix, including restart with the same profile and exact persistence.
  Zero new owned processes or scratch roots remained.
- Hosted checks are required on the pushed candidate. The final review is
  recorded in [the additive CI reports](ci-review-reports.md).

The existing current renderer binary remains SHA-256
`09e69a0f47531c2df9952b1a92a2bf09ae814bafca376c84c3b1e6162ed48932`.
The wrapper verifies it before and after the native run. This patch changes no
binary input; it changes only the Node harness, tests and documentation. Native
startup/restart, persistence, cancellation, privacy and cleanup remain mandatory.
No model/package/browser matrix or full local suite is needed for this boundary.
