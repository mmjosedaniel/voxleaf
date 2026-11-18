# Change Review Report

**Review ID** `NOV17-EXEC-CR-R01-20261118`  
**Task ID** `NOV17-EXEC`  
**Verdict** `CHANGES_REQUESTED`  
**Base commit and reviewed HEAD** `50f3b9ec76022efae72c239015bb47080920d7a0`

**Reviewed paths and identities.** All 312 entries in `tmp/evidence/nov17-integration/implementation-inputs-r01.json`, ID `NOV17-EXEC-INPUTS-R01`, SHA-256 `ea3b9c223d22176e4b1f0a27ab425a1c7d82d4d93119956f2110329d5fbec804`.

**Identity recheck.** PASS. Before and after inspection, base, HEAD, worktree paths, statuses, file hashes and filter-aware blobs matched the manifest. The index was empty and both reserved terminal records were absent.

**Acceptance review.** The implementation ledger covers all 40 IDs. The installed VF-0121 witness distinguishes the original keyboard failure from the corrected behavior, including focus returning to the opener. The cancellation and refill measurements distinguish matched application events from subsequent UI cleanup. Five source-confirmed defects remain across four findings.

**Findings**

1. **P2 — VF-0093, cancelled startup can still spawn.** `apps/desktop/src-tauri/src/tts_service_supervisor.rs:1517` overwrites `rejected_start` after a competing startup fails admission. If A is verifying, Cancel A can acknowledge containment, then B can receive `Busy` and replace A’s rejection record before A checks `retains_start` at line 1564. A can then spawn. The new test starts B after A settles. Preserve retirement on the pending A operation through its pre-spawn decision. Hold A, acknowledge Cancel, attempt B, then release A and verify zero A spawns and successful subsequent startup.

2. **P2 — VF-0120, same-byte restore can jump to the wrong paragraph.** `packages/epub/src/document/xhtml-projector.ts:262` can turn a padded publisher ID into an anchor previously generated for a different block. For example, an unlabelled first paragraph previously owned `voxleaf-s0-a0`. A later paragraph with padded `xml:id=" voxleaf-s0-a0 "` now claims that value, and the first paragraph receives a suffix. `packages/epub/src/locator/locator-resolver.ts:255` prefers the matching value before the saved index. The new public test covers a missing old value, which takes a different branch. Preserve the original block and nonzero offset for this collision while keeping the normalized publisher fragment routable to the later paragraph.

3. **P3 — VF-0120, referenced whitespace can suppress a genuine fragment target.** `packages/epub/src/document/xhtml-projector.ts:263` converts tabs, CR and LF into spaces after XML parsing. A character reference such as `&#x9;` reaches the projector as a tab. XML ID’s post-parse space normalization preserves that referenced character. Given `xml:id="&#x9;note"` and a separate valid `xml:id="note"`, the patch counts `note` twice and disables the valid target. Apply the XML ID rule to the parser-provided value and cover literal attribute whitespace alongside character-referenced whitespace.

4. **P3 — VF-0096, a transparent inline can still split one authored direction isolate.** `packages/epub/src/document/xhtml-projector.ts:987` preserves the wrapper for `span`. A supported inert inline such as `small` with `dir="rtl"` still takes the transparent default branch. Text on either side of a `strong` child therefore reaches `SemanticDocument` as sibling isolates, reproducing the visual-order defect. The new geometry tests both use `span`. Preserve one direction boundary for the affected retained inline run, including transparent containers, and verify glyph order and locator round-trip while preserving mixed block admission.

5. **P3 — VF-0104, interrupted settlement can prevent an identical retry.** `services/tts/benchmarks/benchmark_safety.py:254` writes the actual dual-worker baseline bytes directly into their final filenames. A failed write after a prefix leaves that file present. On retry, the existing-byte comparison rejects it permanently. Separately, termination during a JSON data write can leave a `.journal-*.tmp` entry that the directory check at line 236 rejects. The new settlement test interrupts publication of `settled.json` after the private files are complete. Provide recoverable, ownership-checked publication for the private settlement inputs and test interruption during publication of an actual baseline. Preserve rejection of foreign or conflicting files.

**Test evidence reviewed.** The coordinator supplied normal Windows host results for the scoped EPUB, Chromium, desktop, Rust, Python, Node and release gates recorded in `docs/plans/evidence/november-17-findings/execution-gates.md`. The final verified-core build, package check and installed lifecycle exited 0 and restored the original data. The reported WebView2 and Chromium reflow measurements were 77.5 ms and 68.1 ms respectively. The Serena development run recorded a matched 9 ms cancellation and 169 ms UI cleanup. Python reported 236 passes and two pre-existing symlink privilege skips. The coordinator also reported exit 0 for `node scripts/check-evidence.mjs`, `git diff --check` and `python tmp/evidence/nov17-integration/freeze.py r01 freeze`. The reviewer ran no tests.

**Remaining uncertainty.** VF-0114 still lacks a producer reason and admitted-host evidence for Torch-only provider loss. VF-0100 still lacks the real pre-existing custom registration witness on a disposable Windows account. The installed default-location lifecycle and controlled registry reads establish their respective narrower claims.

**Required next action.** Correct the five defects, add the distinguishing controls above, and renew the affected host checks and package evidence for changed embedded code. Submit the resulting identities under a fresh review ID.