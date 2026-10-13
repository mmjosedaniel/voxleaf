# Audit and approved work order

Target: `APP-RESTORATION-01`. Audit decision: CHANGE; risk: medium.
Auditor: independent `clean_code_auditor`, GPT-6.1 Sol high.
Execution HEAD: `6102b72758497b07356d864915502d3dc443a0b5`.

The auditor independently inspected App, its tests, presentation/reader contracts,
restore/save coordinators, narration persistence bridge, preference effects and
narration actions, together with repository instructions and required documentation.
This is a maintainability finding, not a runtime defect or a line-count target.

CHANGE applies to the repeated publication-reference/sequence comparisons
(original App lines 243-245, 330-331 and 589-590), the embedded pure ready/pending
transition (587-596), and the nested presentation projection (690-705).
SKIP applies to `readyReaderProps`, preference handlers with different policies,
short flags, lifecycle projection, narration adapters and resource effects.

The closed allowlist is:

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/App.test.tsx`
- `apps/desktop/src/app-reader-restoration.ts` (new)
- `apps/desktop/src/app-reader-restoration.test.ts` (new)

The auditor confirmed the maximum of four source/test paths and 500 total
added-plus-removed lines, including new files. No scope expansion is authorized.

## APPROVED WORK ORDER

The director froze this order after accepting independent
`APP-RESTORATION-01-BASELINE-01` PASS. Exactly one implementation writer,
`clean_code_worker` (GPT-6.1 Sol high), owns the four source/test paths.
Supporting agents do not delegate. The director and three roles respect the
four-role concurrency limit. This tool surface supplies explicit model/effort
selection; each role loaded its checked-in TOML instructions. No Git steward
was needed because the user expressly prohibited staging, commits, push and PR.

Required edits:

1. Add the missing saved-old-publication callback and conflicting duplicate
   settlement App cases through the existing injected reader seam before
   production edits; pause for independent characterization execution.
2. Move private readonly restoration types to the adjacent pure module,
   exporting only the union needed by App/tests.
3. Extract `isReaderRestorationForPublication` as a type guard taking current
   restoration, publication and sequence; the latter two may be undefined.
4. Extract `applyInitialRestorationSettlement` taking current state, publication,
   sequence and only `ReaderInitialRestorationSettlement["status"]`.
5. Extract typed `toRestorationPresentation` and integrate all three operations.
   Reuse the identity predicate in all three comparisons, retaining loading-ready
   construction in App.
6. Add the plan's pure identity, terminal settlement and exact-shape projection
   matrix; preserve all existing integration assertions.

Invariants: exact publication reference AND sequence; original object on rejected
transitions; new shallow-frozen object on accepted settlement with unchanged
result and other fields; ignored callback locator; both functional setters use
`current`; loading/ready construction and freezing stay in App; book-start starts
settled while exact/recovered start pending. Preserve effect scheduling, active
flag, dependencies, cancellation and preference-update order before the guarded
transition. The catch lifecycle/reference guard remains distinct, without a
sequence check. Preserve coordinator ownership, cleanup, recovered save timing,
pending reader mounting, locator omission, notice priority/dismissal, Settings,
focus and React identity. Projection gains neither fields nor runtime freezing.

Forbidden: other source/config/dependency changes; effects or ownership moves;
ready-reader builder extraction; unified preference handlers; JSX/components/keys;
hooks, stores, memoization, mutable global state or generic factories; public
contract/error changes; generated/frozen/historical edits; weakened tests.

Acceptance commands are the seven baseline commands in the linked report,
followed by `pnpm.cmd check:portable` and `pnpm.cmd check`, all in local PowerShell
outside the sandbox. Worker checks are bounded formatting, diff whitespace and
scope only; the independent validator owns acceptance. Completion requires a
Change Packet, independent POST-CHANGE PASS and final gates. At most two bounded
correction loops are permitted. Any identity drift requires a new report.

Documentation is handled sequentially under the plan's separate scope: plan,
testing map, plan indexes, documentation index and concise receipts. Review the
canonical system diagram; pure helpers do not warrant a new component. Archive
only after implementation and acceptance complete, with no active redirect and
no edits to historical plan bodies.
