# Change Review Report

Review ID: **FSF-EXEC-CR-R02-20261116**  
Task ID: **five-search-findings-minimal-corrections**  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `6130e2fed61f5d632e3f31c69775d1fa60c97373`  
Branch: `codex/revalidated-findings-execplan`

Reviewed paths and identities: Inherit the **entire closed 1,835-path set**, without delta, from `tmp/evidence/five-search-findings/execution-inputs-r02.json`, record `FSF-EXEC-INPUTS-R02-20261116`, SHA-256 `bd659291fa52a7cd99f29fd8fc3c503ab73bc7fdbe6d424f7eaa5274440221b3`. This binds all 40 candidate paths and unchanged supporting inputs by porcelain status, SHA-256 and filter-aware Git blob identity.

The complete tracked patch matches `tmp/evidence/five-search-findings/execution-r02.patch`, SHA-256 `abb3723f0d30e2ee8e0391bddef15ac01af1c32c4a6d2247aeaea874e3757783`. New source, tests and evidence documents were inspected directly. This review covers the complete current candidate, not only its differences from R01.

Identity recheck: **PASS.** Before and after inspection, all 1,835 identities matched. Independent reconstruction confirmed exact closed-set membership, no duplicate entries, the 40 candidate paths and byte-equivalent tracked patch. Base/HEAD and branch remained unchanged; the index remained empty. Both reserved outputs remained absent:

- `docs/plans/evidence/five-search-findings/execution-review-r02.md`
- `docs/plans/evidence/five-search-findings/execution-closeout.md`

Acceptance review:

- **R01 finding 1, VF-0075: addressed.** Direction metadata preserves the original flattened semantic structure. The reader resolves eligible text once per Auto declaration, excluding nested explicit/fixed direction scopes, and applies the shared result to inherited descendants. This addresses the reported inline counterexample and flattened block inheritance. Actual Chromium assertions cover opposite outer direction, nested Auto, fixed overrides, neutral-only scopes, a late supplementary-plane strong character, unknown inline/block/mixed containers and same-byte reopen.
- The Auto implementation preserves existing admission, implicit paragraphs, addressable order, fragment targets and narration ranges. Public preparation compares the mixed-container structure and exact locators against its control, including both current narration profiles and warm/cold, one/many-batch continuation.
- Auto scanning remains reader-owned and bounded: 4,096 UTF-16 units per chunk, surrogate-boundary protection, 16 measurements and 512 visited nodes per turn, assessed traversal capacity and two accounted scratch DOM nodes. The detached native probe receives text only and clears scratch content. Replacement and last-unsubscribe retire pending work; stale callbacks cannot publish into another document. Tests retain ordinary progressive-budget behavior and check progressive exposure after Auto-document replacement.
- **R01 finding 2, VF-0090: addressed.** Cold runtime ownership precedes loading. When primary work and cleanup both fail, the existing stdout result retains the primary failure code and stderr receives one fixed, content-free cleanup diagnostic. Cleanup-only failure remains a failure. Tests through `main` distinguish combined, primary-only and cleanup-only cases and forbid successful raw publication.
- The other corrections retain distinguishing assertions and relevant neighboring protections: typed omissions and source ranges for VF-0078/0084/0092; busy Remove and subsequent action for VF-0080; terminal acquisition acknowledgement, strict absence, map membership, recovery identity, NSIS ancestry and diagnostic attribution for VF-0076/0079/0081/0085/0087/0088; bounded quality capture, owned empty-session rollback and frozen GPU prerequisites for VF-0083/0086/0089.
- Eligible explicit activation remains available. No persistence fix was introduced for VF-0074. No publisher markup passthrough, EPUB network transfer, generated product-audio persistence, production dependency expansion or frozen-authority rewrite was found.
- Scope accounting is accurate: **15 corrections are implemented and accepted in this candidate**. VF-0074 remains inconclusive, VF-0077/VF-0091 remain decision-blocked, and VF-0082 remains excluded under the supported sequential contract. Approval does not complete those pending cases or the active plan.

Test evidence reviewed:

These are **attributed coordinator executions in normal local PowerShell**, not tests executed by this reviewer. Exact commands, arguments, environments, exits, logs and input identities are retained in each named run’s receipt bundle and indexed by `docs/plans/evidence/five-search-findings/execution-ledger.md`. Inspected receipt references matched their files.

| Evidence | Accepted result and attribution |
|---|---|
| `cr2-final-js-01` | Selected seven-file EPUB Vitest union: **539 passed**. Its desktop step failed two replacement controls and is not credited. |
| `cr2-final-desktop-01` | Renewed nine-file desktop union: **313 passed**. Selected actual Chromium journeys: **5 passed**, including direction/reopen, VF-0064 and the bounded VF-0074 investigation. |
| `cr2-final-cli-01` | Full `test_benchmark_dual_worker_cli.py`: **65 passed**. The retained pytest cache warning does not supply cached acceptance. |
| `g-node-01` | Justified reuse of this execution’s **112 passing, zero-skipped** tests, including compiled NSIS, OS locking and owned lifecycle fixtures. |
| `g-py-01` | Justified reuse of the other ten unchanged Python files: **204 passed**. Together with the renewed CLI file, the union contains **269 distinct passing cases**. |
| `cr2-static-02` | All seven configured formatting, lint and type checks passed; the earlier lint warning and mypy failure were corrected and renewed. |
| `cr2-package-01` | `package:windows:verified-core`, `package:windows:check` and `package:windows:lifecycle` all exited **0**. The lifecycle covers install, first start, repair, default uninstall after repair and six option scenarios, with original application data restored. |
| `cr2-docs-01` | Regenerated-JSON formatting, evidence retention and whitespace checks passed. Earlier unchanged `test:evidence` coverage remains attributed as **34 passed**. |

The failed intermediate executions remain retained. No failed composite run is represented as PASS.

Evidence equivalence record `FSF-EQUIVALENCE-R03-20261116`, SHA-256 `1d3babf8a2203a43097ab18306919eb4e04d90505de7935a324ea834e37295b3`, reconstructs without discrepancy. Independent current inventory reconstruction matched:

- Node: **17,490 entries**, SHA-256 `9422dba6598cb8150952068b29c59a3681c75cab1e1dff3ce8988f862e50dcc5`.
- Python: **3,246 entries**, SHA-256 `6e85be09d5be1ebb3c0e71b81e5f04f4eb236b3bf50c278e2a8a27b5f917ad03`.

Reuse is justified by the inspected input graphs and recorded differences. Changed EPUB exports are not consumed by the selected Node fixtures; their synthetic package evidence does not consume the regenerated current package record. The other selected Python owners do not import the changed dual-worker CLI. This evidence comparison does not inherit R01 approval.

Independent artifact hashing matched:

- Installer: `cd004980395b7d4ab404c60c0210f340bbd66e384aa7624018df7e97dd2407ca`.
- Application binary: `1388714f370b5abf99b68632aa954b610fbf50b713a0beb0756bfbd80ac5a81f`.
- Builder-produced package record: `03709be3881bfe89c21fddc18a0f7d9750963a64dd619040242b50937929d9e5`.
- Installer-bound lifecycle receipt: `0b3e23b3613e21f6fe855f93c327f53aa85124eeb5fc9ff26b4cc4a0bc211905`.

Findings: **None.** Both actionable R01 findings are resolved in the reviewed identities.

Remaining uncertainty:

- VF-0074’s original failing mounted delivery remains unproved.
- VF-0077 and VF-0091 still require their prospective evidence-contract decisions.
- The earlier WebView2 temporary-file race remains an observed harness limitation despite the successful final lifecycle.
- GPU/model, acoustic, live optional-download, clean-host, interactive, signing and Defender acceptance remain unclaimed. Synthetic and controlled browser evidence does not establish natural incidence or physical audibility.

Required next action: Save this report unchanged, perform the prescribed document/link and identity closeout, and record only those outcomes in the reserved closeout. Preserve the active plan and pending dispositions. Any other candidate change requires a new assessment.

No tests, edits, delegation or Git mutations were performed by this reviewer. This approval is not a Validation Report or permission to commit, push or create a pull request.
