# Change Review Report

Review ID: VCA-R2-20261029  
Task ID: VCA  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `61b9f32c2360f8eb27c1822aa4c94768c465a9ed`  
Branch: `codex/verified-chat-audit-corrections`

Reviewed paths and identities: Closed 412-path manifest, including 24 task-owned changed paths, at `tmp/evidence/verified-chat-audit-corrections/VCA-R2-20261029-manifest.json`. This report is excluded from its own manifest.

| Artifact | SHA-256 |
| --- | --- |
| Closed manifest | `0591ec73ac830c28ee5ed14f77305e6bbe454d7ddaec5e6b02c25119aba3b022` |
| Complete tracked patch | `4fb29629e6536bb77116015c664534c7b75a2914d23321ee7ae1ade10805606f` |
| New-file contents | `52c6af5e7cc49bc9e525221aa1f4335bd9f885a05b600b4dfdce80892ad9269f` |
| Receipt map | `5c8de6c8d4221a0bd79a34507674c95c70facddd73bffe804a702c4044deb364` |
| Gate delta map | `fa2b77bd83538086c8ae5a6709265d2e118699a4ee5a6c957ff89da57a21e158` |
| Artifact identity map | `5ee11d5a2f892b4f47ccdbfec92b3e41d022c64d7188b41dbb757ef7cdf0eff9` |

Identity recheck: **PASS.** Independent beginning and ending checks matched all 412 SHA-256 and filter-aware blob identities. Final porcelain statuses matched the manifest. Base/HEAD and branch remained unchanged, the index remained empty, and no changed path fell outside the manifest. All receipt-map hashes matched. An independent comparison of the 1,771-entry current snapshot found no current-content mismatch.

Acceptance review:

- **VCA-01:** Recovery interruption settles only after verified containment. Late preparation results remain invalidated; unsuccessful cleanup blocks restart. Ordinary stopping does not refund the spent recovery attempt.
- **VCA-02:** Removal distinguishes explicit absence from failed inspection and dangling entries. Existing canonical containment and reparse rejection remain intact. Expanded native tests cover affected owned roots, outside-data preservation and successful retry after repairing the synthetic entry.
- **VCA-03:** Failed live-process RAM inspection propagates as unavailable/sampling failure. Zero remains valid for successful measurement, an empty baseline or proven exit of the opened process handle.
- **VCA-04:** Failed probing preserves known language and future-version persistence protections while withholding unavailable profile selection.
- **VCA-05:** Replacement narration eligibility waits for previous ownership containment. Deferred client shutdown, rapid A-to-B-to-C replacement, failed containment and explicit Play are covered.
- **VCA-06:** Paused navigation presents released audio and preparation ownership truthfully, preserves applicable preferences and creates fresh work only on explicit Resume.
- **VCA-07:** Generation receives consume one monotonic request budget. Cancellation preparation also enforces a total deadline; existing cleanup and sustained-phase limits remain.
- **VCA-08:** The Windows outer owner assigns the suspended worker to its exact Job before execution and performs bounded cleanup on success, error and interruption. The real-process regression observes actual exit of a previously live descendant through its retained handle.
- **VCA-09:** Interior placement uses bounded code-point geometry, truthful fallback and guarded settlement. Browser evidence covers both directions in a multi-screen paragraph, focus, selection, retained heard-position persistence, empty preparation and exact Resume offset.
- **R1-F1 is resolved.** During pending navigation, `updatePreference()` retains the restoration completion reason. The existing completion path therefore settles the original navigation and releases its sampling token. The new regression first failed with the incorrect `"reflow"` reason, then passed in the complete current suite. It asserts one `"narration-boundary"` settlement at the intended offset, no automatic start and a subsequent genuine passive locator observation through the tracker.
- No new public contract, dependency, model/runtime version, topology, EPUB preparation boundary or VCA-10 change was introduced. Frozen authorities and historical evidence remain preserved.

Test evidence reviewed: The following results are attributed to supplied normal local PowerShell host receipts. **The reviewer executed no tests, builds or formatters.**

| Receipt | Commands and observed outcome |
| --- | --- |
| `F-TS-R2-04` | `pnpm.cmd format:check:typescript`, `lint:typescript`, `typecheck:typescript`, `test:typescript`: exit 0; shared 210, EPUB 720, desktop 929 and seven Node suites totaling 110 passed. Package build and generated-source hooks retained. |
| `F-Desktop-R2-build-02` | `pnpm.cmd build:desktop` and `pnpm.cmd --filter @voxleaf/desktop build`: exit 0; corrected default native binary and standalone frontend built. |
| `F-Rust-R2-02` | `pnpm.cmd format:check:rust`, `lint:rust`, `test:rust`: exit 0 after final frontend assets; both Clippy variants passed; 141 default and 140 release-locked tests passed, with seven explicit ignores each. |
| `B1-browser-R2-04` | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts`: exit 0; all 15 cases passed in 172.82 seconds including hooks. |
| `N1-native-01` | `node apps/desktop/scripts/native-startup-smoke.mjs`: exit 0 in 13.41 seconds. The receipt reports WebView2 startup, model-free supervisor lifecycle, cancellation/crash recovery, reader synchronization, restoration/replacement and cleanup, with no errors or external requests. |
| `F-Docs-R2-02` | `pnpm.cmd check:evidence`, `pnpm.cmd test:evidence`, `git diff --check` and identity inspection: exit 0; evidence guard and 31 tests passed. |
| `F-Host-R2-01` | Re-observed matching host tool versions, locked Python 3.12.10, pytest 9.1.1 and unchanged HEAD/branch. |

The native build and N1 receipt use executable SHA-256 `0bd702cfc6c45c6d757a7c707800209b04ced600380a246201cb94c67865c00d`. The renewed Rust gates ran after the final frontend build. The subsequent browser build hook retained identical relevant assets, resolving R1’s Rust input-equivalence gap. Browser and native runs were serialized.

Current-task evidence carry-forward: **Approved for the following two receipts only.**

| Original receipt | Retained evidence |
| --- | --- |
| `F-Python-renewed-02` | `pnpm.cmd format:check:python`, `lint:python`, `typecheck:python`, `test:python`: exit 0; mypy checked 180 files and pytest passed 735 tests, with the recorded cache-write warning. |
| `F-Python-build-01` | `pnpm.cmd build:python`: exit 0; wheel and source archive built. |

This decision uses the original immutable receipts and before/after snapshots, the complete current delta map, inspected Python runners and consumers, and the re-observed environment—not merely the selected count of 309 Python/configuration identities. Python source, tests, discovery membership, configuration, locks, installed distribution records and consumed repository authorities/fixtures remain unchanged. Independent source discovery found no additional Python source/test path missing from the snapshot. Changed frontend sources, browser tests, generated frontend/native artifacts and maintained VCA documentation are not consumed by these Python gates. No dependency installation or environment-setting change intervened.

These are retained executions from this task, not newly executed R2 Python checks. No VAF/SAC PASS or approval is reused. Failed attempts remain failures; neither `check` nor `check:portable` is claimed to have executed as an aggregate.

Findings: **None remaining.** R1-F1 is addressed with bounded production correction and meaningful regression coverage.

Remaining uncertainty: No acceptance-blocking uncertainty remains for this patch. Model/GPU inference, real downloads, installation/uninstallation and quality/listening campaigns were not executed for this task and are not implied by this approval. Their responsibilities remain outside the changed scope. Ignored Rust cases are not reported as passing.

Required next action: **None for acceptance of this exact implementation patch.** The planned documentation archive changes its reviewed identities and must receive the separately requested closeout review. Preserve R1 and R2 unchanged.

This approval passes the independent change-review gate only. It is not a Validation Report and does not authorize staging, commit, push, pull-request creation or merge.
