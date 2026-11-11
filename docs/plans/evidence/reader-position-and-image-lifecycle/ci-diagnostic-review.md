# Change Review Report

Review ID: RPI-CI-CR-R1-20261110  
Task ID: PR311-CI-diagnostic-follow-up  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `90a2d137db4a8440976c398fa465a090c86f0022`.

## Reviewed paths and identities

The closed 24-entry [identity manifest](ci-diagnostic-identities.md) defines the reviewed scope, statuses, SHA-256 hashes and filter-aware blob identities.

Manifest SHA-256: `59c35264f6a72f91d14e2c88d297d60ed829b154f125b482a805a555fc308786`.

The scope includes the three modified test/harness files, the new [diagnostic follow-up](ci-diagnostic-follow-up.md), unchanged supporting paths and the ignored Chrome 131 configuration. The request, manifest and this report remain outside their own identity closure.

Identity recheck: **PASS**. Independently compared all 24 file hashes and filter-aware blobs against the supplied snapshot before and after inspection: zero mismatches. HEAD, manifest hash and worktree statuses remained unchanged; the index remained empty. No unrelated changes were observed.

## Acceptance review

- The browser test uses real wheel input calculated from the next fixture paragraph. It independently verifies that paragraph crosses the reading line before requiring persistence of its consecutive canonical anchor.
- The subsequent reopen comparison remains intact, as do the earlier checkpoint, appearance, lifecycle, privacy and error assertions.
- This resolves the test-precondition finding in `RPI-CI-DIAG-20261110-02` without changing the documented nearest-visible/block-start selection policy.
- Both native image predicates, their default timeout and the absence of retries are preserved.
- Native failure observation contains bounded rectangles, numeric scroll/dimension values, closed presentation labels, boolean flags and existing numeric resource counters. It does not include publication text, source URLs, paths or raw exception messages.
- Observation failures are contained, and the original condition error is rethrown. The added harness test verifies error identity and private-content exclusion with available and failing geometry.
- Production runtime, image limits, persistence, cancellation and architectural boundaries are unchanged. The documentation correctly describes an intermediate diagnostic handoff.

## Test evidence reviewed

Results below are coordinator-supplied evidence from normal local PowerShell, using Node `24.20.0` and pnpm `11.15.1`, attributed to the reviewed patch. The reviewer inspected logs and source; the reviewer did not execute tests.

| Command | Supplied result |
| --- | --- |
| `pnpm.cmd test:native-smoke-harness` | Preserved RED: 53/54; corrected patch PASS: 54/54 |
| `pnpm.cmd --filter @voxleaf/desktop test:browser reader-image-lifecycle.smoke.spec.ts` | PASS: 5/5 on pinned Chromium |
| `pnpm.cmd --filter @voxleaf/desktop test:browser --config ../../tmp/evidence/rpi-ci/playwright-131.config.ts reader-image-lifecycle.smoke.spec.ts` | PASS: 5/5 on Chrome 131 |
| `pnpm.cmd test:native-startup` | PASS on packaged local WebView2 157, including restart and cleanup |
| `pnpm.cmd format:check:typescript` | PASS |
| `pnpm.cmd lint:typescript` | PASS |
| `pnpm.cmd typecheck:typescript` | PASS |
| `pnpm.cmd check:evidence` | PASS |

Reviewed logs: `harness-before.log`, `harness-after.log`, `chromium-131-final.log`, `browser-current-after.log`, `native-after.log`, `format-after.log`, `lint-after.log`, `typecheck-after.log` and `evidence-after.log`, under ignored `tmp/evidence/rpi-ci/`.

Findings: **none remaining within this patch’s scope**.

Remaining uncertainty: the repeated remote WebView2 131 image-2 timeout remains unresolved. Local passes and this diagnostic addition do not establish its cause or repair.

Required next action: none for acceptance of this bounded diagnostic patch. The overall CI repair still requires a fresh remote observation, any justified correction and passing required checks.

This approval applies only to the exact intermediate patch identified above. It does not approve the overall CI repair, replace a Validation Report, authorize Git mutations or alter historical approvals.
