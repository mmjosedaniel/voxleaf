# Change Review Report

**Review ID** `CR-PR332-CI-R01-01`  
**Task ID** `PR332-CI-R01`  
**Verdict** `CHANGES_REQUESTED`  
**Base commit and reviewed HEAD** Both `8e9a4fa48d8ddf8145f25da968b674ead4c3ed3f`  
**Reviewed paths and identities** `tmp/evidence/pr332-ci/manifest-r01.json`, SHA-256 `a001389ab2a7ceab318484241b8374db52289bc04d21124f6bd84f79bcd92170`. The closed manifest covers eight task paths and 27 content identities.  
**Identity recheck** PASS before and after inspection. HEAD, path status, file hashes and filter-aware blobs matched. The index was empty.

## Finding

**Low · VF-0168 acceptance evidence overstates UI coverage.** The CI follow-up says the test checks the “visible preference in Settings and the reader,” and the registry describes checks on the mounted reader and Settings. In both event orderings, `App.test.tsx` invokes the Settings callback directly while the dialog is closed. The supplied reader renders a fixed article. The assertions inspect props delivered to both components and values sent to the mocked repository. A defect displaying the selected setting or applying it in the reader could therefore pass this test. Correct the two evidence statements to describe mounted App prop propagation, retained restoration input and subsequent persistence calls. The existing assertions cover that scope. [CI follow-up](docs/plans/evidence/november-23-findings/ci-follow-up.md) · [VF-0168 registry entry](docs/development/findings/registry.md#vf-0168) · [App test](apps/desktop/src/App.test.tsx)

## Acceptance review

The B07 regression submits the selection-issued ID to the production admission function while cancellation holds cleanup. It distinguishes `Cancelled` from host denial, checks that concurrent Remove returns `Busy`, joins cancellation, and obtains a fresh confirmation ID. The transfer and disk fixtures now reach their intended operations. The VF-0093 presentation expectation matches the mounted Cancel flow, including withheld Play during cleanup and a successful fresh Play afterward. The lockfile and inventory changes agree on all three crate versions and checksums. The inventory records the new lock digest, and the evidence limits earlier installer results to their recorded digest.

**Test evidence reviewed** The coordinator reported passing Windows PowerShell results for `pnpm.cmd audit:release`, `pnpm.cmd inventory:release:check`, 30 dependency-graph tests, and both `corepack pnpm test:rust` configurations (208 and 207 passed). The focused desktop selection passed 104 tests. The final `pnpm.cmd --filter @voxleaf/desktop test` passed 1,437 Vitest and 296 Node tests. Shared and EPUB passed 212 and 1,146 tests respectively. The coordinator also reported passing format, lint, Clippy, typecheck and evidence checks, and 1,298 Python tests with two skipped.

**Remaining uncertainty** Hosted Windows and Ubuntu results for the corrected patch are pending publication.

**Required next action** Correct the two VF-0168 coverage statements and submit the revised documentation under a fresh review identity.
