# Change Review Report

Review ID: `FPA-U3-5.1-CR-R1-20261111`  
Task ID: U3 case 5.1; dependent U1 reassessment  
Verdict: **APPROVE — declared unit scope**

Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

Reviewed paths and identities: The complete 25-path status/SHA-256/filter-aware blob manifest at `tmp/evidence/five-pass-audit/u3-5.1-review-inputs.txt` is incorporated verbatim by reference, SHA-256 `9CF8B4718DE2CD1DB0B6344304FD2BEBAE964E8C36156E4A6DCFC02EA421666E`.

Exact combined patch: `u3-5.1-review.diff`, SHA-256 `94A1CCDAF197CA1383447ACF9E22E2BF513003B200E42CF56FDBA7277D3CC853`. Case-only patch: `u3-5.1-case-only.diff`, SHA-256 `36EB55F2089A2759FAA5695927BD23705E3804CAA2C69758F887F9AD173D0BC2`. Both reside in the same evidence directory.

Identity recheck: **PASS.** All 25 identities matched before and after inspection; HEAD remained unchanged and the index remained empty. The stored combined diff matches the current diff for the closed manifest. Additional changes are campaign documentation in the active plan and `docs/plans/evidence/five-pass-audit/`, outside this runtime patch.

Acceptance review:

- **Case 5.1: APPROVE.** Initial and corrective follow report provenance only after actual scroll displacement. The tracker retains one measured placement without changing its current locator or publishing a save. An unchanged late sample is suppressed; changed scroll position or measured placement retires the guard before ordinary sampling. Explicit placement, root/document replacement, element removal and disposal clear the relevant protection.
- Missing geometry and clamped scrolling do not create protection. The production paths preserve genuine subsequent visible movement and do not create persistent or unbounded state.
- Reader-to-narration and persistence callers support the intended consequence: canceled follow settlement cannot admit a stale passive locator after Stop, while genuine manual movement can replace the heard checkpoint.
- **Cases 1.1, 3.1 and 4.1: APPROVE within the current unit scope.** Current coordinator/Reader/App evidence supports preservation of navigation supersession, heard-or-attempted recovery targeting and non-speculative visible position.
- **Case 3.2:** no new approval issued by this report. Its scheduler/PCM suites were not part of the current fresh 408-test run; final integrated reassessment remains pending.
- ADR-0071 accurately describes the bounded transient protection and pending integrated acceptance. No public schema, persistence format, privacy boundary or architectural topology changes were introduced.

Test evidence reviewed: Results are attributed to the supplied normal local PowerShell receipts; I ran no tests.

- `u3-5.1-browser-red-05.log`: exit 1, actual saved offset changed from heard `1958` to native-caret-derived `1894`.
- `u3-5.1-browser-green-01.log`: exit 0, 1/1 passing with the identical browser spec. It verifies canceled settlement, late event delivery, stable real geometry, exact heard-locator preservation/reopen and subsequent genuine wheel-location persistence/reopen.
- `u3-5.1-green-02.log`: exit 0, 408/408 across Reader, highlight, visual tracker, reflow, persistence bridge/coordinator, App and narration coordinator.
- `u3-5.1-static-01.log`: scoped Prettier and ESLint plus desktop typecheck all exit 0. Exact commands and path lists are retained in those receipts.

All four receipts have matching before/after input manifests. Current G1/static inputs match their captured identities. Of 643 captured browser input entries, only the two later unit-test files differ; they are outside Playwright discovery and the Vite runtime import graph. Browser spec, production/import/configuration/lock inputs and captured browser binaries remain identical. All four retained GREEN build artifacts also match. The scoped browser result therefore remains applicable to this patch; no historical campaign PASS was substituted.

The investigation preserves attempts 01–04, including contrary responsive-layout evidence. The successful reproduction establishes the controlled event-ordering defect, not its frequency under natural Windows scheduling. The earlier unit failure was corrected by rebuilding a DOM Range invalidated by moving its node; no production workaround or weakened assertion was introduced.

Findings: **None.**

Remaining uncertainty: Final G6, G7, G10, G11, G12 and integrated acceptance remain pending as declared by the plan.

Required next action: None for this unit review. Complete pending campaign gates and obtain review of the final exact integrated patch. This report is neither a Validation Report nor authorization for Git mutations.
