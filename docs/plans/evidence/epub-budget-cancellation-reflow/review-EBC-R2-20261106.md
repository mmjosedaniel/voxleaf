# Change Review Report

Review ID: **EBC-R2-20261106**  
Task ID: **EBC**  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `426ec7df2aa5d67d0aacfd2654035547985cdccd`

Reviewed paths and identities: the complete 29-entry `tmp/evidence/epub-budget-cancellation-reflow/20261106-01/EBC-R2-ready-manifest.json`, incorporated verbatim by reference. It contains 28 existing paths with porcelain status, SHA-256 and filter-aware blob ID, plus the former active plan represented as `DELETED`.

Manifest SHA-256: `4092fb3194c1969d740044ebb6e90ad3b23e475f58dbe36adf0883ca137af8e1`.

Additional reviewed unchanged supporting path:

- `docs/plans/active/README.md`; status `"  "`; SHA-256 `7faa37c806458d6e8190fd6acb7c1f803bb21aa06f42d13ac5e8694a2224a37f`; blob `9114f4c26327be44330454116228677ec329b9c9`.

Identity recheck: **PASS**. Independently recomputed manifest identities before and after review; no differences. The supplemental active-index identity also remained unchanged. Base/HEAD remained unchanged and the index was empty.

Acceptance review:

- **C13:** Normalized descriptions of admitted image occurrences charge the existing shared UTF-8-equivalent budget before retention. Exact-limit, excess-byte, multibyte and repeated-projection regressions cover the intended change. Existing image semantics, locator/narration controls and privacy boundaries remain intact.
- **C17:** Successful-path listener removal now occurs inside the public error boundary while archive ownership is retained. Removal failure closes the archive and returns a fixed failure; guarded failure-path cleanup cannot replace the primary result. The final cancellation checkpoint precedes publication handoff. Existing request cancellation and close ownership remain unchanged.
- **C15:** Investigation-only scope is preserved. The diagnostic failure and its limitations remain recorded; no reader production correction or claim of natural-browser reproduction was introduced.
- **C05:** Remains deferred.
- **Closeout:** Reviewed the archived plan, indexes, ADR amendment, execution ledger, command summary and preserved R1 report. The patch introduces no dependency, schema, TTS, audio-persistence or architectural-topology change.

R1 findings:

1. **Resolved:** Public cleanup regressions demonstrate contained success-path and failure-path exceptions, no returned publication on failure, no sensitive canary in results, and one archive close.
2. **Resolved:** A deterministic regression pauses the real ZIP entries generator, aborts the pending public open, and asserts cancellation, archive release and absence of a publication or sensitive abort reason.
3. **Resolved:** The ledger withdraws the inaccurate serialization claim. Fresh browser/native execution is serialized, and R2-G7 input identities match the final reviewed documentation.

Test evidence reviewed: executor-supplied local PowerShell receipts from the repository root, using Node `24.18.0` and pnpm `11.15.1`. **I did not execute tests, builds or validation commands.**

| Receipt | Supplied command/evidence | Result |
|---|---|---|
| R1-RED / R1-GREEN | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/public/open-epub-publication.test.ts -t EBC-C17` | Cleanup exceptions reproduced; corrected selection: 4 passed. The initial pending-open fixture timeout remains identified as a fixture failure. |
| R2-G0 | `pnpm.cmd build:packages` | Exit 0 |
| R2-G2 | Exact seven-suite EPUB Vitest command in the manifest-bound `validation-commands.md` and `R2-G2-result.json` | 174 passed |
| R2-G3 | Exact six-suite desktop Vitest command in those corresponding command records | 115 passed |
| R2-G4 | `pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep "preserves one canonical passage"` | 1 passed |
| R2-G5 | `format:check:typescript`, `lint:typescript`, EPUB `typecheck`, desktop `typecheck`, with recorded failure guards | Exit 0 |
| R2-G6 | `pnpm.cmd test:native-startup` | Native matrix passed; no errors or external requests |
| R2-G7 | `check:evidence`, `test:evidence`, then `git diff --check`, with recorded failure guards | Exit 0; 31 tests passed |

R2-G4 completed at `15:44:17`; R2-G6 began at `15:44:42`. Independently compared all **799 non-Markdown input identities** across R2-G0/G2–G6, R2-G7 and current files: no differences. Later documentation changes are covered by R2-G7. All five recorded final artifact hashes match current files. Supplied link inspection reports **340 links across eight documents, zero missing**; final process observation reports **zero remaining processes**. Earlier failed and superseded receipts remain preserved.

Findings: **none**.

Remaining uncertainty: C15’s natural browser event ordering remains unproved; only the explicitly modeled sequence reproduced the saved-position change. C05’s frozen-runtime parity remains deferred. Neither is represented as corrected or accepted by this patch.

Required next action: **none for this review gate**. This approval covers the exact reviewed patch, including archival documentation. Later content or identity changes require a new assessment. It is not a Validation Report or authorization to stage, commit, push or create a pull request.
