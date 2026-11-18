# Change Review Report

**Review ID** `NOV17-EXEC-CR-R04-20261118`  
**Task ID** `NOV17-EXEC`  
**Verdict** `CHANGES_REQUESTED`  
**Base commit and reviewed HEAD** Both `50f3b9ec76022efae72c239015bb47080920d7a0`  
**Reviewed paths and identities** `NOV17-FOLLOWUP-R04`, all 514 entries in `tmp/evidence/nov17-followup-coordinator/inputs-r04.json`, SHA-256 `7579da12d154b7f7b88c8c49f1c5d00caa128f6b070bb0631914f5168903e74e`. R03 supplies the prior 38-case review.  
**Identity recheck** PASS. Before and after inspection, all 514 raw hashes, filter-aware Git blobs and path statuses matched. HEAD and the empty index matched. Both reserved R04 records were absent.

## Findings

**Medium — Settings offers a removal that stops narration and always fails in the local v8 candidate.** A verified candidate reports `installed`. Settings enables **Remove Chatterbox** when idle and also offers it for a failed package. Selecting it calls `stopForConfigurationChange` before the native command unconditionally refuses candidate removal. The client then publishes `failed` and clears the displayed installed size even though the package remains installed. A user can therefore interrupt healthy narration and lose the correct package status through an action that cannot succeed. The host interaction covered selection, Play and recheck. It did not exercise Remove. See `tts_optional_chatterbox/exact_local_successor.rs::candidate_snapshot`, `OptionalChatterboxControls.tsx` at lines 498 and 533, `narration-settings-actions.ts::removeChatterbox`, `tts_optional_chatterbox.rs::remove_optional_chatterbox`, and `optional-chatterbox-client.ts::#call`.

**Correction criterion** Carry the candidate’s removal capability through Settings and reject an unsupported removal before narration containment. Cover installed and failed candidate snapshots. Verify that neither path invokes Stop or native removal, that a verified package stays installed, and that ordinary v7 removal still works.

## Acceptance review

**VF-0100** meets its outstanding acceptance criterion. Both real release runners refused a live custom NSIS registration and a stale remembered registration in a disposable standard Windows account. Both preserved data after a failed installer launch. The six raw logs matched the preservation witnesses. Separate reconciliation verified the installer and runner identities and removal of the temporary account, profile and staging directory. Reconciliation SHA-256 `041a26ae878da22299b67af6c82e5cda0bbf3a9f353e5ad08a56456a692a1733`.

**VF-0114** has direct evidence for the requested recovery behavior on the hash-admitted local v8 successor. The producer distinguishes explicit Torch CUDA loss during Load. The supervisor checks dialect, service identity, pending Load and containment. With native CUDA available, three real Prepare cases produced the typed failure, a generic missing-model failure and healthy Ready respectively. In WebView2, Play started one service, its shutdown receipt matched, and explicit recheck left playback stopped with zero synthesis and retained audio. The Settings removal regression remains actionable on that same candidate. Distributed v7 retains its generic failure.

## Test evidence reviewed

The coordinator supplied normal Windows host results. The producer suite passed 84 cases, packaging passed 143, and schema conformance covered all 15 v1 control families and the v2 distinction. The supervisor selections passed 60 default and 59 release-locked cases. The ordinary optional suite passed 83 with three opt-in ignores. The renderer union passed 314 with 13 overlapping focused checks. Five redirected-path controls were refused. Generated-file, type, lint and format checks are recorded in the host ledgers.

The three real Prepare cases completed in 418.81 seconds, receipt SHA-256 `5f612725612ff536e7af095af4b0ed12ee42dfcdaecb29626d80487cb49c4914`. The final WebView2 receipt, SHA-256 `0130d3ba3aa436b2182cc9955b9f25ae8d9b8a3b3bc601d2ddb687cc400f8eb0`, binds executable `5526f1834db79a73787bf13493433510a2559df87074817e02cae390777d6f9b`. The coordinator reported exit 0 for `node scripts/check-evidence.mjs`, `git diff --check` and the R04 freeze check.

**Remaining uncertainty** The VF-0100 administrator bootstrap exited 1 at a compound aggregation check. Its failing operand remains unknown. The individual witnesses and independent reconciliation support the six case outcomes.

**Required next action** Correct the local candidate removal path, supply focused host evidence for the correction and its ordinary-release control, and submit the changed identities for a fresh review.