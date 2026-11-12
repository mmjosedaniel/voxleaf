# Change Review Report

Review ID: `FPA-U5-2.5-CR-R1-20261111`  
Task ID: U5 case 2.5 and renewed case 1.4  
Verdict: **APPROVE — declared unit scope**

Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

Reviewed paths and identities: The complete 19-path manifest `tmp/evidence/five-pass-audit/u5-2.5-review-inputs.txt` is incorporated verbatim by reference, SHA-256 `ECB452D2550D5F12AC90F0DB3FE08F8C5EB925CE87E325B2534ED8CD0710F04E`.

The closed scope additionally includes unchanged `packages/epub/src/narration/narration-work-controller.ts`: SHA-256 `62F3DE7A68A950AC9F197628EC388B3F1A6349B2974F30C3464E5B85F9DBAA54`, filter-aware blob `90dd6ca5ebdf8a6d9902c5c3275b6e05a31d54a3`.

Exact six-file cumulative patch: `u5-2.5-review.diff`, SHA-256 `990468F08DABCED89AD347A89E7917418AB9EB776D726B7360C89887F31CBC34`.

Built-input binding: `u5-2.5-review-built-inputs.txt`, SHA-256 `DCD08CD77955FF4CEFC30D13B39E28FA379076EA5328E4CCD202C85631839A85`. Both artifacts reside in the same evidence directory.

Identity recheck: **PASS.** All 20 reviewed path identities matched before and after inspection. HEAD remained unchanged, the index remained empty, and the stored patch matches the current scoped diff. All 251 emitted EPUB/shared identities and membership match the GREEN capture and current bytes.

Acceptance review:

- **Case 2.5: APPROVE.** For supported English/Spanish prefixes, scanning enforces ordered extlang/script/region/variant/extension/private-use structure. Case-insensitive duplicate variants and extension singletons are rejected; extension/private-use payloads remain opaque. The exact case-insensitive `en-GB-oed` exception is retained without accepting appended variants of that grandfathered tag.
- The documented distinction between structural checks and registry validity is appropriate. The implementation’s supported-prefix grammar matches the relevant [RFC 5646 syntax](https://www.rfc-editor.org/rfc/rfc5646.html#section-2.1); it does not claim full [registry-based validity](https://www.rfc-editor.org/rfc/rfc5646.html#section-2.2.9).
- Scanning remains incremental in at-most-512-character work chunks. Duplicate detection retains keys of at most eight characters for the current tag; total transient storage scales with that admitted tag, rather than remaining constant. Existing document/work limits bound it.
- Public preparation uses the same request-scoped classifier for normalization and title context. Cancellation rejects the active operation; retry constructs fresh classification state. The long distinct-variant test exercises yield, cancellation and correct duplicate rejection on retry.
- Public tests cover all three mutable profiles, batching equivalence, preserved displayed language attributes and exact source ranges. Frozen v1 authority and public contracts remain unchanged.
- **Case 1.4: APPROVE on the current U5 patch.** Fresh rebuilt-package evidence renews its shared-unit Celsius preservation and neighboring controls.

Test evidence reviewed: Supplied normal local PowerShell results; I executed no tests.

- `u5-2.5-red-01.log`: exit 1, **16 intended failures and nine passing controls**.
- `u5-2.5-build-packages-01.log`: exit 0 before public GREEN.
- `u5-2.5-green-01.log`: exit 0, **383/383** across normalization, source mapping, prepared segments, resource bounds and public integration.
- `u5-2.5-static-01.log`: scoped Prettier, ESLint and EPUB typecheck all exit 0.

Exact commands and intervals are incorporated from these receipts. GREEN/static before-and-after manifests match `7C922A26B036198CBD1CBFF35C6595F8B5D9329E0D4DBF9AE46B2F7C078F55F5`; all 613 captured current inputs match. Actual root Vitest CLI/package identities are now captured before and after. No historical PASS was substituted.

Findings: **None.**

Remaining uncertainty: Final G7/G11/G12 and integrated acceptance remain pending.

Required next action: None for this unit review. Later affected source changes require refreshed build/test evidence and exact-patch review. This report is not a Validation Report or authorization for Git mutations.
