# Change Review Report

**Review ID** `NOV17-EXEC-CR-R03-20261118`  
**Task ID** `NOV17-EXEC`  
**Verdict** `APPROVE` for the implemented scope. VF-0100’s live custom-registration check and VF-0114’s Torch-only provider-loss case remain open.  
**Base commit and reviewed HEAD** `50f3b9ec76022efae72c239015bb47080920d7a0`

**Reviewed paths and identities.** All 376 entries in `tmp/evidence/nov17-integration/implementation-inputs-r03.json`, ID `NOV17-EXEC-INPUTS-R03`, SHA-256 `c40b56e8802ab9605cb0741ac332b95791777cefa04c93d5ceaaaf34406d5e5c`. All 28 identities in the R03 EPUB test record matched the implementation manifest.

**Identity recheck.** PASS. Base, HEAD, worktree paths, statuses, file hashes and filter-aware blobs matched before and after inspection. The index was empty and both reserved R03 terminal records were absent.

**Acceptance review.** Both R02 findings are resolved. Fragment lookup applies XML ID normalization and duplicate detection. Saved locators retain their original assignment for the same EPUB bytes. The public tests cover both directions of the anchor collision and verify that reopening restores the original block and nonzero offset. Href-less and external anchor labels now share the transparent direction-scope handling. Chromium verifies glyph order across strong formatting. Reader tests verify locator mapping, mixed block content and exclusion of the external URL. The earlier R01 corrections remain covered by their recorded gates.

**Test evidence reviewed.** Supplied Windows host receipts show that the saved-position case and both inert-label geometry cases failed before correction. On R03, 106 EPUB tests, 31 reader tests, seven Chromium scenarios, 13 narration-source tests and 16 selected narration cases passed. Both affected TypeScript projects and scoped lint passed.

The verified-core build and package check passed for installer SHA-256 `f5b3f02b9e4ee8ad5dad3114cd9f0bbb40e1ac32975466500a9655489f20c3f2`. On the installed binary, one trusted Escape returned focus to the opener and reader reflow measured 79.3 ms. The instrumented run subsequently left an executable after uninstall. Its cause remains unknown. The host restored the original data from the verified backup. The unmodified lifecycle then passed on the same installer, including first start, repair, all six uninstall scenarios and cleanup. Its receipt SHA-256 was `389714349f310cad0bfa375664a952b019fcb057aae7239d919f499e652463d4`.

The coordinator reported exit 0 for `node scripts/check-evidence.mjs`, `git diff --check` and `python -X utf8 tmp/evidence/nov17-integration/freeze.py r03 freeze` against the frozen candidate. The reviewer inspected source, identities and supplied evidence and ran no tests.

**Findings.** None for the reviewed scope.

**Remaining uncertainty.** VF-0100 still requires an actual pre-existing custom Windows registration on a disposable account. VF-0114 still requires a distinguishable Torch-only provider failure and evidence on the admitted successor. The Serena measurements apply to their recorded development executable.

**Required next action.** None for independent review. The plan remains active for the two open claims.