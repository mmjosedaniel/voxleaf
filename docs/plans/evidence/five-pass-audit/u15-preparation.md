# U15 installer deadline preparation

Read-only source investigation; no native process or installation was started.
Reconfirm paths and behavior when the work order opens. Final lifecycle evidence
must use the final installer, separately from synthetic tests and outer restoration.

The lifecycle script journals before an unbounded Start-Process -Wait. Parent
ownership is assigned only when that wait returns. Existing catch handling stops
owned process objects, permits uninstall only without cleanup failures, restores
only after verified install absence, preserves failed-cleanup journals and rethrows
the primary failure. Keep the separate verified uninstaller deadline unchanged.

No reusable PowerShell/C# Job launcher exists in the scoped scripts. The benchmark
CLI's Windows Job containment and acquisition-file-barrier.ps1's Add-Type/PInvoke
pattern are precedents, not imports. Initial allowlist is
scripts/test-windows-package-lifecycle.ps1 and
apps/desktop/scripts/windows-release.node-test.mjs; a small dedicated
scripts/windows-package-lifecycle-installer.ps1 helper may be justified explicitly.

## Ownership boundary

Create the exact executable suspended/hidden with no inherited handles. Retain
its process/thread handles, assign a non-breakaway kill-on-close Job, journal
the exact root identity while suspended, then resume. Wait with a monotonic
absolute deadline for Job ActiveProcesses zero before accepting parent exit.
On timeout terminate only that Job and boundedly verify zero plus owned process
signals. Reap an unassigned still-suspended process on assignment/journal failure.
No PID scan, reopened PID ownership or parent-only completion. Unverified reap
or accounting must mark cleanup failure before any uninstall/restore; retain
journal/backup and emit no success receipt. Installer ownership stays distinct
from the existing uninstaller process variable.

## Existing test seam

The Windows-only Node suite already spawns Windows PowerShell with temporary
LOCALAPPDATA/TMP, partial-uninstaller shims and journal/backup assertions. Compile
a benign fixture ConsoleApplication using existing Add-Type. Parent creates a
partial fixture install/dummy uninstaller, spawns the same executable in child
mode, records exact identities and exits. Child signals readiness then holds on
an event, with a bounded natural fallback longer than the test deadline but
shorter than the Node watchdog. A separately retained sentinel runs outside Job.

For RED, invoke the native module-qualified Start-Process retaining its old Wait
behavior, then assert the exceeded deadline/ordering. GREEN exercises real Job
ownership with a short internal seam, not a new public product flag/environment
override. At synthetic uninstall prove root/child gone, sentinel alive, original
backup and journal still present and original not yet restored. After failure
assert installer-timeout, restored original, absent fixture install/receipt and
sentinel survival. Separately inject unverifiable reap/accounting: uninstall and
restore must not run, journal/backup remain and primary failure is preserved.
Harness finally cleans only fixture-owned handles/material. Existing H13 tests
can mock the narrow new seam while retaining every assertion.

Configured Node windows-release suite supplies G4. Final
`pnpm.cmd package:windows:lifecycle` remains G9 against the exact final installer,
with an independent outer restoration journal and verification. No historical
receipt or synthetic fixture substitutes for that required host gate.
