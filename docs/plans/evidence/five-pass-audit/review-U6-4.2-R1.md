# Change Review Report

Review ID: `FPA-U6-4.2-CR-R1-20261111`  
Task ID: U6 case 4.2  
Verdict: **APPROVE — declared unit scope**

Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

Reviewed paths and identities: The complete 22-path manifest `tmp/evidence/five-pass-audit/u6-4.2-review-inputs.txt` is incorporated verbatim by reference, SHA-256 `207285C5D72C9E136D31C6652CB0C200A2D7D5B158ED808BB2DA17A86E98A820`.

The closed scope additionally includes unchanged `packages/epub/src/resource/opened-publication.ts`: SHA-256 `55384730C3015B6EE10EC6C738BDC0894719D0906DB4DB7B1036E4D86C9BEBD6`, filter-aware blob `3692d7700b65abc10481fdeb3df0897fae85bc3b`.

Exact four-file patch: `u6-4.2-review.diff`, SHA-256 `4AE8C8F9DF1F896E54A194AE2F02B297DCF906399CE26894F70CAB55B115AA6F`.

Built-input binding: `u6-4.2-review-built-inputs.txt`, SHA-256 `A37841A04AA3C673316D43E03276DE7539B58FC0AAC67D1AE99564A306330466`. Both artifacts reside in the same evidence directory.

Identity recheck: **PASS.** All 23 reviewed path identities matched before and after inspection. HEAD remained unchanged, the index remained empty, and the stored patch matches the current scoped diff. All 251 emitted EPUB/shared identities and membership match current bytes and the GREEN capture.

Acceptance review:

- **Case 4.2: APPROVE.** An empty fragment now follows the absent-fragment branch and returns `exact` / `document-start` with the admitted document’s first canonical locator.
- Target decoding, cancellation checkpoints, unknown/non-spine/empty-document handling and public closed-owner behavior precede or surround this branch unchanged.
- Nonempty unresolved fragments retain `recovered` / `fragment-unresolved`. Existing query rejection, fallback admission and unsupported-resource policies remain unchanged.
- Public EPUB2/EPUB3 tests verify retained empty fragments, exact status/reason, alias selection and repeated spine occurrences for navigation and inline links. Existing R8 assertions remain present.
- The corrected fixture appropriately separates unsupported PNG ingestion from successful XHTML navigation. Its new typed rejection control preserves excluded case 1.2’s policy; earlier mixed-fixture failures are not treated as valid public reproductions.
- The architecture clarification matches the implementation. No public schema, persistence responsibility or system topology changes occur.

Test evidence reviewed: Supplied normal local PowerShell results; I executed no tests.

- `u6-4.2-red-02.log`: exit 1, three intended failing cases with 17 exact-status/reason assertions.
- `u6-4.2-build-packages-01.log`: exit 0 before GREEN.
- `u6-4.2-green-01.log`: exit 0, **99/99** across resolver, public opening, navigation and ingestion suites.
- `u6-4.2-static-01.log`: scoped Prettier, ESLint and EPUB typecheck all exit 0.

Exact commands and intervals are incorporated from these receipts. GREEN/static before-and-after manifests match `815CD6F7D03CFC71F814048860B1F8E1A6EA5971F3B026F5FD258CB0D6BB526D`; all 613 captured current inputs match. Earlier RED01/diagnostic01 remain distinguished from RED02. No historical PASS was substituted.

Findings: **None.**

Remaining uncertainty: Directed G6 browser behavior, G7/G11/G12 and final integrated acceptance remain pending.

Required next action: None for this unit review. Complete the declared integration gates and review the final exact patch. This report is not a Validation Report or authorization for Git mutations.
