# Change Review Report

**Review ID** `NOV17-EXEC-CR-R05-20261118`  
**Task ID** `NOV17-EXEC`  
**Verdict** `APPROVE`  
**Base commit and reviewed HEAD** Both `50f3b9ec76022efae72c239015bb47080920d7a0`  
**Reviewed paths and identities** All 530 entries in `NOV17-FOLLOWUP-R05`, `tmp/evidence/nov17-followup-coordinator/inputs-r05.json`, SHA-256 `ebbaad700440c5c68528ab66370de92a730891ef1811f943c09816b3c6a1b934`. The R04 report matched its issued digest.  
**Identity recheck** PASS. Before and after inspection, all 530 raw hashes, filter-aware Git blobs and path statuses matched. HEAD and the empty index matched. Both reserved R05 records were absent.

## Acceptance review

**R04 removal finding resolved.** Native v8 snapshots report `removalSupported: false` for verified, corrupt and absent packages. Settings omits Remove for installed and failed candidates. The Settings action checks the capability before notifying admission, changing configuration or stopping narration. The direct client also returns the existing snapshot before issuing IPC. A failed refresh or malformed response preserves a previously observed refusal. Ordinary v7 snapshots omit the optional field and retain managed removal.

**VF-0114 meets the local successor criterion.** On the R05 WebView2 executable, Settings selected the verified v8 package. The host observed zero Remove requests and zero shutdowns before Play. With native CUDA available, Play produced the typed Torch-only failure and the shutdown receipt matched the failed service. Explicit recheck preserved the installed selection with zero restart, synthesis or retained audio. The unchanged native Prepare evidence distinguishes this failure from missing model files and confirms healthy Prepare reaches Ready. Distributed v7 retains its generic failure.

**VF-0100 meets the disposable-host criterion.** Both real release runners preserved the custom installation and its sentinel, refused stale registration, and preserved data on failed installer launch. The six child witnesses, runner identities and cleanup reconciliation reviewed at R04 still match. R03 supplies the prior 38-case acceptance.

## Test evidence reviewed

The supplied Windows host receipts record seven failing renderer cases before the correction. The corrected four-file selection passed 146 tests, including both candidate states, direct action ordering and ordinary removal. Three native candidate tests passed. The ordinary release-locked suite passed 83 with three existing opt-in ignores. Scoped lint, formatting, desktop type checking and candidate Clippy passed.

The R05 executable matched SHA-256 `7d9f790d4f724ce7e2294f22bbdef4fa513fab38d2c7f2f063b1575aed8984c4` before and after the WebView2 run. Its receipt matched `64e0fd6dd4ded6cefe5caffcb8426671895744527d2ea73dccc562bd7712fd4b`. The three-case native Prepare receipt matched `5f612725612ff536e7af095af4b0ed12ee42dfcdaecb29626d80487cb49c4914`. The packaged worker, protocol and supervisor Prepare inputs for that receipt were unchanged. The coordinator reported exit 0 for the evidence guard, `git diff --check` and the R05 freeze check.

**Findings** None.

**Remaining uncertainty** The VF-0100 administrator bootstrap did not identify which operand failed during aggregation. The six individual outcomes and subsequent account, profile and staging cleanup were independently reconciled. VF-0114 acceptance applies to the locally admitted v8 successor. Public promotion falls outside this review.

**Required next action** None for implementation acceptance.