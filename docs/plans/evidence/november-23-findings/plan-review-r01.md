# Change Review Report

**Review ID** `NOV23-PLAN-CR-R01-20261123`  
**Task ID** `NOV23-PLAN`  
**Verdict** `CHANGES_REQUESTED`  
**Base commit and reviewed HEAD** `d9a0a72db1f5dd8a5dc7553ea0e2358c9cfe497e`

**Reviewed paths and identities** — Complete 185-path manifest `NOV23-PLAN-INPUTS-R01` at `tmp/evidence/nov23-plan/manifest-r01.json`, SHA-256 `e1d7db3534cad083da09fce78ba4f8c2ec4d467b017499ec165d8dfafbe9a245`. The task patch comprises `docs/plans/active/november-23-findings-corrections.md` and `docs/plans/active/README.md`. The nine intake changes are reference inputs.

**Identity recheck** — PASS. Before and after inspection, HEAD, tree, working scope, index, path statuses, raw hashes and filter-aware blobs matched the manifest. Both reserved terminal paths were absent.

**Acceptance review** — The plan accounts for all 42 findings, identifies the policy decision for VF-0145, and distinguishes historical results from evidence needed for implementation. The proposed privacy constraints cover fixtures, diagnostics, failure output and cleanup. Two acceptance instructions need correction.

**Findings**

1. **P2 — VF-0164’s planned regression can pass with the reported defect.** In `docs/plans/active/november-23-findings-corrections.md:72`, the assertion checks that pointer and keyboard cannot start or queue narration during a deep jump and that a subsequent click succeeds. `ParagraphLeaf` currently presents an enabled Start button. `ReaderPublication.activateParagraphLeaf` silently discards the refusal from `ProductNarrationCoordinator.startAtLocator`, which already blocks pending placement. The listed sequence can therefore pass while the reader still encounters an enabled control that does nothing. Require a mounted assertion that the paragraph action visibly and accessibly communicates unavailability during the jump and becomes actionable after settlement. Retain focus, zero queued starts and the fresh-click locator as controls.

2. **P3 — Gate W duplicates a configuration check and attributes it to the installer.** `docs/plans/active/november-23-findings-corrections.md:146` directs the executor to run `package:windows:check` against the artifact after `package:windows:verified-core`. The ordinary build already executes the same `windows-release.mjs check --require-core` command at `scripts/build-windows-release.ps1:314`. Its handler at `apps/desktop/scripts/windows-release.mjs:683` reads repository configuration and staged resources and takes no installer input. A second invocation on identical inputs adds a run and cannot verify the resulting installer. Credit the embedded configuration check when its inputs match, and bind the lifecycle evidence to the exact installer. Reserve a separate configuration run for changed inputs or an independently required check.

**Test evidence reviewed** — The coordinator reported exit 0 in normal local Windows PowerShell for `node scripts/check-evidence.mjs`, `git diff --check`, and `python -X utf8 tmp/evidence/nov23-plan/verify.py r01 freeze`. The freeze covered 12 sections, 42 linked case rows, 28 historical owner blobs, four receipt components and five frozen fixtures. The coordinator supplied successful Foundation run `44361668446` and dependency run `44361668731` as committed pre-edit evidence. I confirmed the local PR-head and reviewed-HEAD trees match `d53a85d5285f91c4a9702aff0c27e2d36ee456e9`. This review used read-only inspection. Runtime acceptance remains pending.

**Remaining uncertainty** — The plan appropriately leaves host-dependent movement, timing, hardware and acoustic outcomes open for implementation.

**Required next action** — Correct the two plan passages, rerun the affected document checks, and submit the revised candidate under a new review ID.
