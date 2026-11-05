# Change Review Report

**Review ID:** CCF-R1-20261104  
**Task ID:** confirmed-chat-findings-minimal-corrections  
**Verdict:** **CHANGES_REQUESTED**  
**Base commit and reviewed HEAD:** `4b10dc0a7cc400b5b3c1a9ac2010ceb1e801afef`

**Reviewed paths and identities:** Closed 940-path manifest `tmp/evidence/confirmed-chat-findings/20261104-01/CCF-R1-20261104-manifest.json`, including all 62 changed paths and supporting sources.

- Manifest SHA-256: `07d94a459d6fbd5aa83e0d31274060a1b04f66345334b7fa035bccad4265d330`
- Patch SHA-256: `5d1b7401c052621a3a4b6a3636fdf5a48e8af918865f951076a473428a01cb7d`
- No additional source paths outside the manifest were needed.

**Identity recheck: PASS.** Before and after inspection, all 940 SHA-256 values, filter-aware blob identities and porcelain states matched. HEAD and branch remained unchanged, the index remained empty, and no changed path was omitted. The supplied patch and new-file contents matched the worktree. Final comparison: `2026-11-05T00:00:42.692Z`.

**Acceptance review:** Production changes implement the intended U1–U6 boundaries without a confirmed runtime defect in the inspected patch:

- U1 preserves the retained numeric compounds, uses bounded lexical lookaround, and shares charged, cancellable language classification across normalization and title context.
- U2 updates the initial visible start before enabling Play, distinguishes undispatched preflight from dispatched service work, removes completed-highlight follow authority, protects Reset ownership, and accounts for confirmed output frames separately from source progress.
- U3 establishes explicit current identifier whitespace semantics while preserving the frozen optional-runtime authority and its documented compatibility limitation.
- U4 retains cleanup receipt, root and authority checks while allowing ordinary snapshots when no qualifying cleanup obligation exists.
- U5 reserves the correct occurrence through cancellation dispatch and future drain, including failed-cleanup retry.
- U6 distinguishes proven installer no-spawn from uncertain execution, preserves primary errors, and rejects unsupported Cargo output layouts before artifact inspection.

C01/C03/C13/C15/C17 retain their approved dispositions. No new dependency, audio persistence, external content transfer, public serialized shape, or component/persistence owner was introduced. The unchanged system diagram and historical M005 boundary remain appropriate.

One required mounted acceptance assertion remains insufficient, as detailed below.

**Test evidence reviewed:** Results are attributed to the supplied local PowerShell executions; I did not execute tests, builds, formatters or linters.

The exact commands are recorded in the manifest-bound `validation-commands.md` and corresponding immutable result receipts. Reviewed passing evidence includes:

- G2 shared: 33 tests; EPUB: 309, with the 11-test resource suite renewed.
- G3-desktop-final: 567 tests.
- G4 Python: 75 selected tests assembled from the documented current receipts; Node: 117 initially, with the 42-test Windows suite and its later manifest-consuming case renewed.
- G6: three corrected/control Chromium cases plus four renewed cases.
- Generated-output drift, TypeScript/Python static checks, Rust formatting, and both Clippy modes.
- Final native tests after core generation: 176 default and 175 release-locked, eight ignored each.
- Current core generation/check, one desktop build, six-rate Piper, reader-corrections retry, and exact optional local admission without inference/download.
- G12-review-ready: evidence guard, diff whitespace and document-link checks.

I verified the input-receipt hashes for the final selected gates and independently compared the 21 reuse groups’ selected source hashes with current files. The reuse proof includes membership, exports, renderer artifacts and Python import closures. The sole installed-file difference is the explicitly retained Chromium diagnostic-log append; treating it as output is supported.

The original native cleanup failure remains failed evidence. The unchanged-command retry, recovery/restoration records, G10 cleanup and G12 host-state receipt support completed cleanup. G11’s special native pending-start arm is reasonably not applicable: the changed preflight path cannot dispatch after invalidation, while the client/native dispatched-start ownership remains unchanged and its relevant controls are retained.

**Findings:**

**CCF-R1-F1 — P2, demonstrated acceptance-coverage gap**

- **File/symbol:** `apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts`, `exerciseAudibleReflow(page, true)`, especially the `completeBeforeReflow` assertion branch.
- **Trigger:** Segment A completes; typography changes while the buffered successor has not started.
- **Consequence:** The new C08 browser case can report success without proving that typography restoration preserved the visible logical location. This leaves the explicitly required mounted completion/reflow interaction unverified.
- **Supporting evidence:** The helper collects `before` and `after` scroll positions, but the C08 branch checks only `starts === 1` and visibility of `[data-reader-text-scale="large"]`; common assertions check pending frames and retained highlighting. Those observations do not distinguish successful restoration from the reported failure, where completed A reclaims its start and cancels restoration. `ReaderPublication.tsx`’s highlight settlement callback cancels the reflow restorer when the locator differs. The controller unit test verifies revoked follow authority, and the retained R7-04 browser case checks the inverse ordering, but neither supplies the missing C08 mounted position assertion.
- **Bounded correction criterion:** Extend this existing C08 journey to capture a stable logical locator or its corresponding reading-line geometry and assert its preservation after typography restoration, while confirming the successor has not started. Demonstrate that this assertion fails with the original completed-follow behavior and passes with the current correction. Preserve the existing R7-04 control. No production redesign is requested.

**Remaining uncertainty:** No additional production defect was confirmed. C08’s mounted restoration outcome remains unproven by its current assertions. The original native teardown failure’s precise infrastructure cause remains unknown, but retained recovery evidence and the sole successful unchanged retry support cleanup acceptance.

**Required next action:** Correct CCF-R1-F1, supply focused host regression evidence and renewed affected checks, and request a new immutable review for the revised patch. Unaffected evidence may be reused only with the existing input-equivalence proof requirements.

This report is not a Validation Report and grants no permission to commit, push, create a PR, merge or publish.
