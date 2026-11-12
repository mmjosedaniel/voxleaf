# Change Review Report

Review ID: `FPA-U5-1.4-CR-R1-20261111`  
Task ID: U5 case 1.4  
Verdict: **APPROVE — declared unit scope**

Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

Reviewed paths and identities: The complete closed 18-path status/SHA-256/filter-aware blob manifest `tmp/evidence/five-pass-audit/u5-1.4-review-inputs.txt` is incorporated verbatim by reference, SHA-256 `5C784C670262BA3A464390BF6571ED0117AC66EC6D2075038916BD6E30718A92`.

Exact four-file patch: `tmp/evidence/five-pass-audit/u5-1.4-review.diff`, SHA-256 `BF9260B47F557C4CDEF6F6A1819CF7850AB8A0F290A769A15762D10CC752F7D7`.

Built-input binding: `tmp/evidence/five-pass-audit/u5-1.4-review-built-inputs.txt`, SHA-256 `86917962D191E4B2583561CAA7C9C0D9EE9A6D42D6707B7127CDAC959616019F`, incorporates all 251 emitted EPUB/shared files.

Identity recheck: **PASS.** All 18 reviewed identities matched before and after inspection. HEAD remained unchanged, the index remained empty, and the stored patch matches the current scoped diff. All 251 built identities match current bytes and the GREEN input capture. Other campaign changes remain outside this unit’s acceptance.

Acceptance review:

- **Case 1.4: APPROVE.** Reverse range recognition protects the Celsius endpoint when the preceding endpoint is a bare number. Forward range recognition also prevents independent lexical expansion of left endpoints such as English `8` and Spanish `21`.
- Numeric context remains Unicode-aware and bounded by the existing 128-code-point budget. Recognition respects prose/language barriers and permits ordinary inline prose continuity. Attached word digits remain distinct from bare endpoints.
- Signed standalone values, editorial dashes and existing signed/decimal two-unit ranges retain their intended behavior. The patch introduces no general number parser.
- Public preparation tests cover all three mutable profiles, single/multiple batching, unchanged displayed documents and exact code-point source ranges. Unit assertions retain one mapped origin span per source token.
- Frozen v1 normalization, source projection, public contracts, packing limits and lifecycle ownership are unchanged. Fresh resource-bound tests cover the affected preparation pipeline.
- The dated ADR-0063 clarification accurately records the expanded range protection without rewriting historical acceptance. M005’s implemented boundary and Complete roadmap status remain consistent with this change.

Test evidence reviewed: Supplied normal local PowerShell results; I executed no tests.

- `u5-1.4-red-01.log`: exit 1, **15 intended failures and seven passing controls**, including public preparation.
- `u5-1.4-build-packages-01.log`: exit 0 before the public GREEN run.
- `u5-1.4-green-01.log`: exit 0, **358/358** across normalization, source mapping, prepared segments, resource bounds and public integration.
- `u5-1.4-static-01.log`: scoped Prettier, ESLint and EPUB typecheck all exit 0.

Exact commands and intervals are incorporated from these receipts. GREEN/static before-and-after manifests match `52C88BA6A15BC8C4391DBCD40B1453FCBF2BC93EE32328A97E1102BD7BA5D1E8`; all 613 captured current inputs match.

Original build manifests confirm the corrected direction: emitted normalizer JS changed from `7ACD9C65783285494DA2DE9C254552AF33526336E5355806FCE4041140BC263A` to current `5D07C67E3D5D442BC57B3D5A7CFD303FB8F4F5522774D3B6867E5F075739FB09`. The reversed handoff statement was a reporting error, not identity drift.

Findings: **None.**

Remaining uncertainty: The generic capture missed the installed root Vitest path; logs identify Vitest 5.0.5, and current root CLI/package hashes match the disclosed receipt. This does not establish historical runner-byte identity. No historical PASS was reused. Final G7/G11/G12 and integrated acceptance remain pending.

Required next action: None for this unit review. Later normalization changes require refreshed affected G0/G2 evidence and exact-patch review. This report is not a Validation Report or authorization for Git mutations.
