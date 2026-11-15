# Portfolio maintainability audit dispositions

Audit base: `97d36c213e16ea015c24b1589454d61dab4379ea`.
Auditor: `portfolio_auditor`, role `clean_code_auditor`, GPT-6.1 Sol high,
read-only inspection. No tests, implementation or delegated work by the auditor.
All three source targets and their tests remained clean during the audit.

| Target | Auditor result | Director disposition |
| --- | --- | --- |
| PM-01 App.tsx | CHANGE candidate: share the four-field appearance predicate with the save coordinator | Retain current code; optional future candidate |
| PM-02 ReaderPublication.tsx | SKIP | Accept SKIP |
| PM-03 product-narration-coordinator.ts | CHANGE candidate: share post-stop reader-placement dispatch | Retain current code; optional future candidate |

## PM-01

`App.reportPreferenceWrite` and save-coordinator `preferencesEqual` currently
compare the same four appearance fields; the latter also checks schema version.
The auditor proposed a pure predicate in `reader-preferences.ts` and one
public-boundary equality/coalescing test. The potential benefit is one owner
for the list of fields. There is no current disagreement or observed defect.
App's surrounding restoration and cleanup effects have distinct ordering rules;
a wholesale extraction was not justified.

Director rationale: the small duplicated predicate is explicit and currently
consistent. This extraction would not materially simplify App's orchestration
and touches persistence and stale-feedback behavior. Keep the proposal available
when those fields or responsibilities next change. It is not a completed fix.
Relevant coverage inspected includes App CAF-R6.2/SAC-15, save-coordinator
CAF-R6.2/R7-06, Chromium appearance restoration and packaged WebView2 restart.

## PM-02

The apparent geometry duplication serves different contracts: viewport overlap
for preference reflow versus full exact-range visibility and approximate fallback
for placement. Ref attachment handles new destinations, while the layout effect
handles existing/oversized destinations. They share revision ownership but have
different focus/sampling triggers. Existing navigation and reflow coordinators
already own their domain responsibilities. A generic wrapper would obscure the
differences and save little code.

Reader tests inspected cover delayed placement, canonical reflow settlement,
current callback delivery, superseded/rejected placements, TOC focus/history and
oversized fallback. No runtime defect or missing universal coverage is asserted.

## PM-03

`startAtLocator` and `#requestBoundaryNavigation` currently repeat the same
post-stop continuation, current-owner/closed guard, frozen request construction
and per-listener exception isolation. A private helper could centralize this
rule without changing their distinct canonical-target and witnessed-neighbor
admission. The existing copies agree. The auditor identified an assertion gap
for frozen delivery and a throwing subscriber, not a demonstrated runtime error.
Existing five-pass 1.1, active-leaf, PN-01/RCF-06, reader and Chromium journeys
cover the broader ownership and placement behavior.

Director rationale: a standalone helper leaves the broader module complexity
intact and changes a high-risk audio-to-reader synchronization seam. The modest
benefit does not justify that edit as a prerequisite to portfolio presentation.
Reconsider alongside a substantive change to navigation dispatch, with the
auditor's dedicated regression and fresh packaged/Piper EN acceptance. No source
change, omitted gate or evidence reuse is presented as refactor acceptance.

## Boundary

The three-target review is complete with no accepted implementation unit.
Consequently no baseline, worker, refactor validator or runtime integration gate
is needed for this no-source-change disposition. This is a bounded audit outcome,
not a claim that these modules have no further maintainability opportunities.
Presentation/CI/sample-tool changes remain owned by their separate plan and review.
