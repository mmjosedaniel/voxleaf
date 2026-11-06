# Change Review Report

Review ID: **EBC-R1-20261106**  
Task ID: **EBC**  
Verdict: **BLOCKED** — required evidence is incomplete; two actionable C17 findings also require correction.

Base commit and reviewed HEAD: `426ec7df2aa5d67d0aacfd2654035547985cdccd`

Reviewed paths and identities: the complete 26-entry `tmp/evidence/epub-budget-cancellation-reflow/20261106-01/bounded-ready-manifest.json`, incorporated verbatim by reference, including each path’s porcelain status, SHA-256 and filter-aware blob ID. Manifest SHA-256: `b3983ff4d53dd209c6d5cb08dc5c240d2e130f6e007e927217fb82e081d60252`.

Identity recheck: **PASS**. Independently recomputed all 26 identities before and after inspection; both matched the supplied manifest. Base/HEAD remained unchanged and the index remained empty. The pre-existing plan and index entry were identified as authorized planning artifacts.

Acceptance review:

- **C13:** The patch charges normalized retained descriptions through the existing shared UTF-8 counter before retaining the image inline. It preserves the 64 MiB default, repeated-occurrence accounting, missing/empty semantics, image admission, locator positions and narration boundaries. No actionable implementation defect found.
- **C17:** The forwarding controller implements the intended normal-signal lifetime, and the final checkpoint precedes handoff. Exception containment and pending-open cancellation coverage remain incomplete.
- **C15:** Investigation-only scope was respected. The retained diagnostic demonstrates offset `129 → 100` after fractional geometry plus an injected late scroll event. Natural browser occurrence remains unproved. The failed invariant was preserved separately; the permanent patch adds assertions without removing existing coverage.
- **C05:** Remains deferred. No frozen runtime, schema, model or dependency changes were found.

Test evidence reviewed: supplied executor receipts, not tests run by this reviewer. Receipts identify repository-root local PowerShell, Node `24.18.0`, pnpm `11.15.1`, commands, timestamps and exit statuses.

- C13 corrected/shared RED: intended boundary assertions fail before correction.
- C17 RED: post-open abort makes the subsequent raster read fail with `cancelled`.
- Focused GREEN: four new cases pass.
- G2-final: seven EPUB suites, **171 passed**.
- G3-final: six desktop suites, **115 passed**.
- G4-final: selected canonical-passage Chromium journey, **1 passed**.
- G5-final: TypeScript format/lint and EPUB/desktop type checks, exit **0**.
- G6: `pnpm.cmd test:native-startup`, exit **0**, with successful native matrix and cleanup output; artifact-consumption uncertainty below prevents unconditional acceptance.
- G7: **31 evidence tests passed**, aggregate exit **1** due to whitespace. G7-fixed retention/whitespace exit **0**. The supplied component-reuse comparison records **799 unchanged non-Markdown inputs**.

Relevant current production/test identities match G2–G6 input receipts. Later documentation changes are separate from those runtime results.

Findings:

1. **P2 — Cleanup can escape the public error boundary.**  
   File/symbol: `packages/epub/src/public/open-epub-publication.ts:211`, `openEpubPublication`.  
   Trigger: a caller-supplied signal whose `removeEventListener` method or getter throws—for example, a real signal with that method overridden to throw a sensitive canary.  
   Consequence: the `finally` exception overrides either returned result and rejects with the raw exception. On the successful path, `archive` has already been cleared, so the caller receives neither the publication handle nor archive cleanup.  
   Evidence: lines 204–211 place ownership handoff before an unguarded caller-controlled cleanup invocation outside `catch`. This contradicts ADR-0007’s closed, content-free public result boundary. Existing narration cleanup explicitly guards equivalent caller-signal disposal. This is a **confirmed static control-flow defect**, not a reviewer-executed reproduction.  
   Bounded correction criterion: listener cleanup must not escape the result boundary or strand a successfully created publication. Add focused public regressions for throwing cleanup on success and failure, including content-free outcomes and resource ownership.

2. **P2 — Required pending-open cancellation control is absent.**  
   File/symbol: `packages/epub/src/public/open-epub-publication.test.ts`, C17 coverage.  
   Trigger: caller aborts after public opening begins but before successful handoff.  
   Consequence: the new forwarding path could stop forwarding aborts while the supplied C17 tests still pass.  
   Evidence: public tests cover an already-aborted signal and abort after successful opening; resource tests cover later read/close cancellation. None exercises cancellation during the real public opener. M2 expressly requires before/during-open cancellation with cleanup.  
   Bounded correction criterion: add a deterministic pending-open public regression asserting a fixed cancelled result, no publication, archive release, and no sensitive abort reason. Preserve the post-success raster-read control.

3. **P2 — Acceptance ledger overstates serialization and current documentation coverage.**  
   File: `docs/plans/evidence/epub-budget-cancellation-reflow/execution-ledger.md:69` and `:94`.  
   Trigger/evidence: G6 records `15:31:23–15:32:25`; G4-final records `15:32:02–15:32:10`. These overlap despite claims that the browser waited for native completion. Both build the renderer. Additionally, current `execution-ledger.md` differs from its G7-fixed input identity. The coordinator confirmed no additional consumption proof or current-ledger receipt is available.  
   Consequence: the stated serialized acceptance procedure and exact final documentation check are unsubstantiated. The overlap alone does **not** establish a product failure.  
   Bounded correction criterion: correct the ledger transparently, rerun affected native/browser gates serially after the final source correction, and run documentation/evidence checks against the final documentation bytes. Preserve the original receipts.

Remaining uncertainty: natural C15 event ordering; exact renderer consumption during overlapping G4/G6 execution. No claim of a C15 fix or universal absence of that race is supported.

Required next action: resolve findings 1–3, supply fresh affected host receipts and a frozen current manifest, then request a new immutable review report. This report grants no acceptance or Git authorization.
