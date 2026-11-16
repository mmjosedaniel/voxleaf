# Change Review Report

Review ID: **RSQ-CR-R02-20261116**

Task ID: `reader-stop-quality-follow-up`

Verdict: **APPROVE**

Base commit and reviewed HEAD: `c407cfa45ddb050d1e51ebc2f043fd498fea0393`

Branch: `codex/revalidated-findings-execplan`

Reviewed paths and identities: Inherited the entire closed set of 2,048 paths, including 22 candidate paths, from `tmp/evidence/reader-stop-quality-follow-up/r02/execution-inputs-r02.json`, record `RSQ-INPUTS-R02-20261116`, with no delta. This assessment covers the complete current candidate and does not inherit approval from R01.

Manifest SHA-256: `8cc565e222cc346288af7db1fe1587fbecd2ce7596e457819493fee05d67d898`

Tracked patch SHA-256: `f399796b0daed684b97ae183d3ba2b0003d4aec1c82fe65bffccc27cd77c12ed`

Identity recheck: **PASS** before and after review. Reconstructed membership matches the closed manifest without duplicates. All recorded statuses, SHA-256 values and filter-aware blobs match. HEAD and branch are unchanged, the index is empty, and the tracked patch matches the current diff. Both reserved outputs remain absent:

- `docs/plans/evidence/reader-stop-quality-follow-up/review-r02.md`
- `docs/plans/evidence/reader-stop-quality-follow-up/closeout-r02.md`

Acceptance review:

**VF-0074 meets the authorized acceptance criteria.** The mounted browser reproduction binds the checkpoint before Stop, releases held completion of native image decode, and follows actual geometry observation through the tracker, ReaderPublication, App and persistence. The image variant does not inject a tracker callback, save call or scroll event. Retained RED evidence records offset 607 becoming 627 and surviving same-byte reopening.

The save coordinator now rejects unmarked passive samples while heard protection remains active. Validated measured movement releases protection, including a first sample equal to the checkpoint without causing a duplicate write. Invalid locators do not release protection. The actual PageDown successor and subsequent same-byte reopening remain covered. Active narration, no-heard and ordinary reading, canonical identity, coalescing, lifecycle flushing, stale-placement and dedicated reflow protections remain intact. The change adds no persisted content, locator schema or new asynchronous ownership.

**VF-0082 meets the authorized defensive-overlap criteria.** One nonblocking OS lock covers submission, correction, aggregation, cleanup and CPU-fallback derivation before mutable quality-state access. Derivation retains ownership through private removal and result publication. Real child processes exercise competing operations and owner termination; rejected admission preserves the winner’s state, while sequential retry remains available.

The one-correction rule, invalidation-before-publication behavior, stale-aggregate rejection, fixed CLI failure contracts and sequential generation/finalization scope are preserved. Cleanup removes private session contents while retaining one empty sibling coordination file. Frozen benchmark authorities/results and previous five-search plans/reports are unchanged.

**RSQ-R01-01 is resolved.** `quality_operation` first attempts exclusive creation. An existing entry is subsequently opened without creation or truncation flags. Thus an absent referent cannot be created through the existing-entry branch. Regular-file, reparse, zero-size, single-link and descriptor/path identity checks remain before lock acquisition.

The substitute link-resolution seam is faithful to its declared scope: it models an existing entry and redirects opening to real synthetic target I/O. It does not force a quality result. Against the prior owner, the absent-target case fails because the target is actually created; the existing-target case detects the incorrect creating-open behavior. Current assertions preserve complete session bytes, the coordination entry and existing target content, and retain target absence. Native hardlink and controlled descriptor/path mismatch checks supplement the real contention, exception/retry and process-death controls.

The two native symlink cases are explicitly skipped only for Windows privilege error 1314. Their unavailable setup is not counted as behavioral RED or native PASS. This satisfies the previously assessed alternative evidence strategy without expanding support to hostile concurrent filesystem replacement.

Documentation and acceptance records describe these boundaries and limitations. The saved R01 report and scope response retain their supplied identities and do not masquerade as R02 approval.

Test evidence reviewed:

All execution is attributed to the coordinator’s normal local PowerShell runs outside the sandbox. I inspected commands, logs, receipt integrity, environments and input identities; I did not execute tests or validation commands.

| Evidence | Evaluated outcome |
| --- | --- |
| `followup74-red-natural-01` | Mounted checkpoint replacement and incorrect reopening reproduced on the original owner. |
| `followup74-unit-red-01`, `followup74-manual-red-02` | Discriminating passive-admission and duplicate-locator movement failures retained. |
| `followup82-red-01` | Original overlapping-operation failures retained. |
| `followup82-link-red-01` | Two setup failures with WinError 1314 before reaching the owner; not behavioral RED. |
| `followup82-modeled-red-01` | Two failures and two passing neighboring controls against the prior owner. |
| `followup82-r02-final-01` | 66 PASS, two explicitly unavailable native-symlink cases SKIP; Python formatting, lint and types PASS, covering 199 formatted and 195 typed files. |
| `followup74-final-01` | Reused with current equivalence: 247 desktop tests across 10 files, six browser journeys, TypeScript formatting/lint/types PASS. |
| `followup-docs-01` | Reused unchanged generated-JSON formatting evidence. |
| `followup-docs-r02-01` | Current evidence guard and whitespace checks PASS. The additional evidence-guard repetition after final ledger hashes is coordinator-attributed. |
| `followup-package-01` | Verified-core build and integrity check PASS; failed lifecycle attempt remains retained. |
| `followup-lifecycle-02` | Reused unchanged-installer check/lifecycle PASS: install, first start, repair, default uninstall, six option scenarios, cleanup and restoration of preexisting data. |

The renewed Python command was:

`uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -q --tb=short -p no:cacheprovider`

It was followed by the configured Python format, lint and type checks. Its receipt SHA-256 is `42224c6dbe72e6a25c46636f3ec448a63c1a066262f1a35bcf41b96dc06f9a30`; before/after inputs match.

I independently reconstructed the complete current snapshots and differences in `RSQ-EQUIVALENCE-R02-20261116`, SHA-256 `72bc8331a11e2a63358ab8e00d771eb1d6b6fc7706a1129ea2f69750644eff02`. The comparisons confirm 17,489 unchanged desktop entries, 3,253 unchanged Python entries and 17,494 unchanged package entries, with the recorded 10/2/5 differences. The changed benchmark owner/test are outside the desktop dependency graph and packaged runtime; their Python checks were renewed. Relevant dependencies, tools and configurations remain equivalent. The proposed reuse is accepted.

Final artifact identities independently rehashed:

- Installer: `a32a11e393a6605c95c3c0035e21d56715dbca2e21d0a32202deed86361d9152`
- Application binary: `1ff0b562c4a0143f16ede777882857f1ab9318093b9fa2f55001b7d6fc292961`
- Generated package evidence: `187b37dfbb4a5934929f2b299cdd24a2e9580129e089f2c93dde74afc10fc99c`
- Lifecycle receipt: `2f5f026ad298e46a10fe60ed9849881d023cc18a3bc1a7d1b2a02033d2dec5af`

Findings: **None.** RSQ-R01-01 is closed for the reviewed identities.

Remaining uncertainty:

Native Windows symlink execution remains unavailable on this host; the accepted evidence combines controlled link resolution with real target I/O and native neighboring controls. POSIX locking was not executed. Silent PCM and controlled completion callbacks establish application timing and persistence, not physical audibility. The WebView2 temporary-file lifecycle race remains a harness limitation despite the successful unchanged-installer retry. No GPU/model, acoustic-quality, live-download, signing, Defender or interactive clean-host claim is established.

Required next action:

Save this report unchanged, perform the prescribed document/link and frozen-identity closeout checks, and record their outcomes only in the reserved closeout. Any other candidate drift requires a new assessment; staging alone remains subject to the exact-blob rule.

This approval passes the independent change-review gate for the complete current candidate. It is not a Validation Report or Git authorization. I performed no edits, tests, builds, delegation or Git mutations.
