# Change Review Report

Review ID: `FPA-U4-2.4-CR-R1-20261111`  
Task ID: U4 case 2.4 and renewed case 1.3  
Verdict: **APPROVE — declared unit scope**

Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

Reviewed paths and identities: The complete closed 13-path status/SHA-256/filter-aware blob manifest `tmp/evidence/five-pass-audit/u4-2.4-review-inputs.txt` is incorporated verbatim by reference, SHA-256 `BD3427FEFD5D5F5EE766DD1BEF18122683EC91B03DD7F845C18CD8B41CA8D134`.

Exact four-file U4 patch: `tmp/evidence/five-pass-audit/u4-2.4-review.diff`, SHA-256 `AED32EF388D4D2BEE09F91B33AF6BCD1FFE42486DFBE520CE0C60E38A04FB49F`.

Identity recheck: **PASS.** All 13 identities matched before and after inspection. HEAD remained unchanged, the index remained empty, and the stored patch matches the current four-file diff. Other campaign changes remain outside this unit’s acceptance.

Acceptance review:

- **Case 2.4: APPROVE.** Each observer selects the matching entry with the greatest timestamp; the later array entry wins equal timestamps. Foreign targets are ignored. Selection uses constant additional space without sorting, retained entry history or another cache.
- Visible and near observations remain independent. Their timestamps are not compared across observers; visible state retains priority over near state. Positive intersection ratio remains sufficient even when `isIntersecting` is false.
- Existing active/fallback guards prevent disposed or superseded observer callbacks from publishing. Cleanup disconnects both observers and closes the occurrence. Public observation/load interfaces and resource ownership are unchanged.
- Tests exercise both margins, both timestamp array orders, equal-time ties, foreign targets, ratio-only intersection, independent precedence and callbacks after disposal. Existing lifecycle and fallback coverage remains intact.
- **Case 1.3: APPROVE on the current U4 patch.** Loader/test identities remain unchanged, and fresh evidence covers their interaction with the updated component. Current-visibility dispatch, equal-tier FIFO, waiting visible demand outside the full queue, single active work and existing memory limits remain supported.
- This report does not renew all earlier campaign cases or establish final integrated acceptance.

Test evidence reviewed: Supplied normal local PowerShell results; I executed no tests.

- `u4-2.4-red-01.log`: exit 1, two intended latest-entry failures; the independent precedence/disposal control passed.
- `u4-2.4-green-01.log`: exit 0, **135/135** across loader, image component, source manager, SemanticDocument and Reader suites.
- `u4-2.4-static-01.log`: scoped Prettier and ESLint plus desktop typecheck all exit 0.

Exact commands and execution intervals are incorporated from these receipts. RED before/after manifests match `4B9145644A2AB4CEA533EE33AA4B607A9D13A3E472CB3C5DA35242919E4C5D4E`. GREEN/static before/after manifests match `439090B3FDD2EB4C3C58CDF89D3DB8F6A7CFC21DDFFAFA3C614C2282D29BE7F7`; all 613 captured current inputs match. No historical PASS was substituted.

Findings: **None.**

Remaining uncertainty: Directed browser evidence and final G6/G7/G10/G11/G12 and integrated review remain pending.

Required next action: None for this unit review. Complete the declared integration gates and review the final exact patch. This report is not a Validation Report or authorization for Git mutations.
