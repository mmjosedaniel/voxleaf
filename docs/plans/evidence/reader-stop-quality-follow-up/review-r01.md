# Change Review Report

Review ID: **RSQ-CR-R01-20261116**

Task ID: `reader-stop-quality-follow-up`

Verdict: **CHANGES_REQUESTED**

Base commit and reviewed HEAD: `c407cfa45ddb050d1e51ebc2f043fd498fea0393`

Branch: `codex/revalidated-findings-execplan`

Reviewed paths and identities: Inherited the entire closed set of 2,018 paths, including 20 candidate paths, from `tmp/evidence/reader-stop-quality-follow-up/execution-inputs-r01.json`, record `RSQ-INPUTS-R01-20261116`, with no delta.

Manifest SHA-256: `9e217b7c5ed8e046884f9afb55fbd386b22cec398d21b412e5a11d61172fbca3`

Tracked patch SHA-256: `9beebf2cfd730f64ab5dc858157a54cee20b422ab0bcd4d75c24b734f8a93626`

Identity recheck: **PASS** before and after review. Reconstructed membership matches the manifest; all recorded statuses, SHA-256 values and filter-aware blobs match. HEAD and branch are unchanged, the index is empty, and the patch matches the current tracked diff. Both reserved outputs remain absent:

- `docs/plans/evidence/reader-stop-quality-follow-up/review-r01.md`
- `docs/plans/evidence/reader-stop-quality-follow-up/closeout-r01.md`

Acceptance review:

VF-0074 now has the previously missing mounted reproduction. The browser case captures the checkpoint before Stop, holds completion of native image decode, releases the image after Stop and follows actual geometry observation through the tracker, ReaderPublication, App and persistence. It does not inject a save, tracker callback or scroll event in the image variant. The retained RED records offset 607 becoming 627 and surviving same-byte reopening.

The coordinator correction rejects unmarked passive samples while heard protection remains active. Canonical measured movement releases protection, including a first sample equal to the checkpoint without introducing a duplicate write. Invalid locators cannot release protection. The actual PageDown successor and subsequent reopening remain covered. Existing active-narration, no-heard, ordinary-reading, identity, coalescing, lifecycle and reflow protections remain present. No additional reader defect was identified.

VF-0082 establishes nonblocking ownership before mutable quality reads, correction invalidation and publication. Submission, aggregation, cleanup and CPU-fallback derivation use the same ownership boundary. The lock remains held through derivation’s private removal and output publication. Real child-process controls distinguish rejected overlap from sequential success and verify release after owner termination. The retained empty sibling avoids splitting ownership by unlinking a live lock.

The sequential generation/finalization contract, immutable correction rule, frozen benchmark authorities/results and earlier reports remain unchanged. Documentation describes the new scope and its limits. However, the coordination-file admission does not fully satisfy its documented rejection guarantee, as detailed below.

Test evidence reviewed:

All execution below is attributed to the coordinator’s normal local PowerShell runs outside the sandbox. I inspected commands, logs, environment records, receipt hashes and before/after inputs; I did not run the checks.

| Evidence | Evaluated result |
| --- | --- |
| `followup74-red-natural-01` | Mounted original failure: checkpoint replacement and incorrect reopening; retained failed run. |
| `followup74-unit-red-01`, `followup74-manual-red-02` | Discriminating passive-admission and duplicate-locator movement failures before their corrections. |
| `followup82-red-01` | Five failing controls against original overlapping-operation behavior. |
| `followup74-final-01` | 247 desktop tests across 10 files, six browser journeys, TypeScript formatting/lint/types: PASS. |
| `followup82-final-01` | 62 quality/CPU-fallback tests, Python formatting/lint/types: PASS; 199 formatted and 195 typed files. |
| `followup-docs-01` | Current generated JSON formatting, evidence guard and whitespace checks: PASS. The later evidence-guard repetition after the ledger count correction is coordinator-attributed. |
| `followup-package-01` | Verified-core build and package check: PASS. Lifecycle failed on a disappearing WebView2 temporary file; that failure remains retained. |
| `followup-lifecycle-02` | Check and lifecycle on the unchanged installer: PASS, including install, first start, repair, default uninstall, six option scenarios, cleanup and restoration of preexisting data. |

The final component commands are recorded exactly in the ledger and receipts, including the desktop persistence/tracker/App selection, focused browser journey union, complete `test_benchmark_quality.py`, and configured TypeScript/Python static checks.

I independently reconstructed the current dependency/tool/input snapshots and compared their complete differences with `RSQ-EQUIVALENCE-R01-20261116`, SHA-256 `c162439fac8ae33138b47c9fd7d25fb88a09ecb16395ee196a99d53e381419f2`. Differences are the recorded documentation changes and regenerated package evidence; changed behavioral owners and assertions match their final runs. No historical behavioral PASS is substituted for either new correction.

Final package identities independently rehashed:

- Installer: `a32a11e393a6605c95c3c0035e21d56715dbca2e21d0a32202deed86361d9152`
- Application binary: `1ff0b562c4a0143f16ede777882857f1ab9318093b9fa2f55001b7d6fc292961`
- Generated package evidence: `187b37dfbb4a5934929f2b299cdd24a2e9580129e089f2c93dde74afc10fc99c`
- Lifecycle receipt: `2f5f026ad298e46a10fe60ed9849881d023cc18a3bc1a7d1b2a02033d2dec5af`

Findings:

**RSQ-R01-01 — P3: Unsafe coordination admission can create an unrelated target before rejecting a preexisting link.**

Owner: `services/tts/benchmarks/quality_operation.py`, `quality_operation`, particularly the `os.open` call preceding `path.lstat()`.

Trigger: On Windows, the expected coordination path already exists as a file symlink to an absent target whose parent is writable. `O_NOFOLLOW` is unavailable and becomes zero. The function opens the path with `O_RDWR | O_CREAT` before inspecting the link.

Consequence: Opening follows the link and can create its previously absent target. The later `lstat`/reparse check rejects the coordination file and reports failure, but closing the descriptor does not undo the unrelated file creation. This does not require concurrent hostile replacement and is distinct from the explicitly unsupported filesystem-replacement workflow.

Supporting evidence: The source ordering performs the potentially creating open before link inspection. ADR-0077 promises rejection of linked/reparse coordination files, and the plan requires failed admission not to alter another owner’s state. Current negative coverage checks a nonempty regular file; it does not distinguish rejection before versus after creation through a dangling link.

Bounded correction criterion: Reject an already-existing unsafe coordination entry before any operation can create its referent. Preserve safe first creation, admission of an existing empty regular file, nonblocking contention, retained file identity and release on failure/process death. Add a discriminating Windows control for a preexisting dangling file link: admission fails with the content-free contract, its target remains absent, the link remains unchanged, and the session/aggregate/correction bytes remain unchanged. Preserve neighboring existing-target link, nonempty-file and ordinary-lock controls. This does not require expanding support to hostile concurrent filesystem replacement.

Remaining uncertainty:

Controlled silent PCM and completion callbacks establish application timing and persistence behavior, not physical audibility. POSIX locking was inspected but not executed. No GPU/model, acoustic-quality, live-download, signing, Defender or interactive clean-host claim is established. The WebView2 temporary-file lifecycle race remains a harness limitation despite the successful unchanged-installer retry. The link finding is established by source inspection; I did not execute a reproduction.

Required next action:

Preserve this report unchanged, correct RSQ-R01-01, obtain its discriminating host evidence and relevant Python checks, and submit a new immutable candidate and review identity. Unaffected evidence may be proposed for reuse with current equivalence proof.

This review performed no edits, tests, builds, delegation or Git mutations. It is neither a Validation Report nor permission to commit, push or create a pull request.
