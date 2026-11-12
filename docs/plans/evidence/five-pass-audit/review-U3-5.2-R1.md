# Change Review Report

Review ID: `FPA-U3-5.2-CR-R1-20261111`  
Task ID: U3 case 5.2; renewed 5.1 and dependent U1 assessment  
Verdict: **APPROVE — declared unit scope**

Base commit and reviewed HEAD: `a3241571944530d468e2f4f2d37a0a2394a8df84`

Reviewed paths and identities: The complete 25-path manifest `tmp/evidence/five-pass-audit/u3-5.2-review-inputs.txt` is incorporated verbatim by reference, SHA-256 `75740A8DB1D4682C6AA8B77578BB58B06C020FD4E5502380132996816304D7FF`.

The closed review scope additionally includes these two unchanged direct dependencies:

| Path | SHA-256 | Filter-aware blob |
|---|---|---|
| `apps/desktop/src/reader/ParagraphLeaf.tsx` | `D970A2C2A40A2177D0C6A0DDC94EA0BD454CA651EE62642940AE2D4A47210E9E` | `557805acdf9c1fd526d5ecf5b78cd6a4c04cbfa2` |
| `apps/desktop/src/reader/paragraph-leaf-controller.ts` | `AB094138838EE4592371498CFEDFAEDA8DA818FE0BF8AFFE05BD9AB2772D2D51` | `e1db129a49855907f77d0e9311d0fb32722247f3` |

Exact combined patch: `u3-5.2-review.diff`, SHA-256 `BD9907B96AD35324948D05CDED68FC154AB08C49661EAE29C3FC3E39F535AB59`. Cumulative U3 patch: `u3-5.2-u3-only.diff`, SHA-256 `717E4EE345F266176C05192BE1E529C9E69B03BD1D7D4A1552AA02506C4CA728`. Both reside in the same evidence directory.

Identity recheck: **PASS.** All 27 path identities matched before and after inspection. HEAD remained unchanged, the index remained empty, and the combined artifact matches the current scoped diff. Other changed paths are campaign plan/evidence documentation outside this runtime scope.

Acceptance review:

- **Case 5.2: APPROVE.** Bounded hovered/focused block references preserve explicit paragraph targeting across an unrelated narration boundary. Projection prefers focus, then hover, then the current visible locator. This changes the paragraph action without freezing actual reader position.
- Pointer leave/cancellation releases hover; blur releases focus. Document/spine ownership checks reject stale targets. Content-root replacement clears both references, and component remount starts without previous ownership.
- The handlers do not move focus. The leaf’s click target remains the projected canonical block. Tests verify B activation after A advances, focus preservation, fallback on leave/blur, chapter replacement and disposal/remount.
- **Case 5.1: APPROVE on the current patch.** Automatic-follow provenance remains intact, supported by fresh unit and Chromium evidence after the Reader change.
- **Cases 1.1, 3.1 and 4.1: APPROVE within the current unit scope.** Fresh coordinator/Reader/App coverage supports their preserved navigation and recovery behavior.
- **Case 3.2:** no renewed approval in this report; its fresh integrated reassessment remains pending.

Test evidence reviewed: Supplied normal local PowerShell results; I executed no tests.

- `u3-5.2-red-01.log`: exit 1, two matching pointer/focus failures. Visible A advancement and absence of follow scrolling are asserted before the failing B-preview assertion.
- `u3-5.2-green-01.log`: exit 0, **411/411** across the eight declared Reader/highlight/tracker/reflow/persistence/App/coordinator suites.
- `u3-5.2-browser-5.1-recheck-01.log`: exit 0, **1/1**, using the unchanged 5.1 fixture and a fresh build. Heard and genuine manual checkpoints survive reopen.
- `u3-5.2-static-01.log`: scoped Prettier, ESLint and desktop typecheck all exit 0.

Exact commands and execution intervals are incorporated from these receipts. GREEN/static/browser before-and-after input manifests match; all captured current inputs match, including the two additional dependencies. The browser build manifest `5BBD337065A67B4876B1A07486A180526F0810E33BEAB8D854288506E1FBEEE8` and its retained artifacts match. No historical PASS substitutes for current evidence.

Findings: **None.**

Remaining uncertainty: Case 5.2’s directed real-browser scenario and final G6/G7/G10/G11/G12, U2 reassessment and integrated acceptance remain pending.

Required next action: None for this unit review. Complete the declared batch gates and obtain review of the final exact integrated patch. This approval is not a Validation Report or authorization for Git mutations.
