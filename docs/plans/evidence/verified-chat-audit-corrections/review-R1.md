# Change Review Report

Review ID: VCA-R1-20261029  
Task ID: VCA  
Verdict: **CHANGES_REQUESTED**

Base commit and reviewed HEAD: `61b9f32c2360f8eb27c1822aa4c94768c465a9ed`  
Branch: `codex/verified-chat-audit-corrections`

Reviewed paths and identities: Closed 411-path manifest, including 23 changed paths, at `tmp/evidence/verified-chat-audit-corrections/VCA-R1-20261029-manifest.json`.

| Artifact | SHA-256 |
| --- | --- |
| Closed manifest | `6db50d9d57a0f02f6ae3388520619f8ddafe1d0b1c538d56e43f47eb76e7eef9` |
| Complete tracked patch | `789fe6b4184ba9568972acf0727640765af591fb0821a3cb9f1c34f0ab23d8df` |
| New-file contents | `8cf77e64261765fbd574fd69d4f523ccd87608a448fe803c2521e886aa1b934f` |
| Initial receipt map | `ef607d19a4159352720261943199b72fb2a7936eccf824499895c796c64aa71f` |

Identity recheck: **PASS.** Independent beginning and ending checks matched all 411 SHA-256 and filter-aware blob identities. HEAD and branch remained unchanged, the index remained empty, and the changed paths remained within the declared scope. The new execution-ledger contents match the supplied artifact. Completed receipts in the initial map matched their hashes. The initially running B1 log was excluded from that comparison and its completed evidence was inspected separately below.

Acceptance review:

- **VCA-01:** Interrupted recovery settles after verified teardown; unsuccessful cleanup remains blocked. The success transition preserves the spent recovery attempt. Late preparation completion is rejected by the existing run identity.
- **VCA-02:** Owned-path absence now requires explicit `NotFound`; inspection errors and dangling entries proceed to existing containment/reparse rejection. Expanded tests retain the outside sentinel and verify repaired-entry retry and regular removal.
- **VCA-03:** Failed Windows memory inspection propagates as unavailable/sampling failure. Zero is retained only for a successfully measured zero, an empty baseline, or an observed exit of the opened process handle.
- **VCA-04:** Failed hardware probing preserves known language and unsupported-version persistence protections while withholding profile availability.
- **VCA-05:** Replacement coordinator creation waits for prior close and observed containment. The tests cover deferred real-client shutdown, A-to-B-to-C replacement, rejection, uncontained completion and explicit Play.
- **VCA-06:** Paused navigation presents empty released ownership, retains applicable preferences and requires explicit Resume for fresh generation.
- **VCA-07:** Generation receives share one monotonic deadline; cancellation preparation also checks a total deadline. Existing cleanup and sustained-phase boundaries remain.
- **VCA-08:** The outer Windows owner assigns the suspended worker to its exact Job before execution, closes ownership on success/error/interruption, and bounds termination verification. The real-process regression verifies a previously live descendant’s handle exit. The corrected asynchronous-exit assertion retains the original watchdog-plus-cleanup bound.
- **VCA-09:** Ordinary interior placement now uses bounded code-point geometry with truthful fallback and preserves focus/selection in the supplied browser case. **Acceptance fails for preference reflow overlapping that placement**, described below.
- No changed public schema, dependency lock, model/runtime version, EPUB preparation boundary, frozen authority or VCA-10 implementation was found. The existing local-only content and memory-only audio boundaries remain.

Test evidence reviewed: All executions below are attributed to the coordinator’s normal local PowerShell host receipts. **The reviewer ran no tests, builds or formatters.**

| Supplied receipt and commands | Observed outcome |
| --- | --- |
| `F-TS-renewed-02`: TypeScript format, lint, typecheck and `pnpm.cmd test:typescript` | Exit 0; shared 210, EPUB 720, desktop 928 and seven Node suites totaling 110 passed. Package build and generated-source hooks retained. |
| `F-Python-renewed-02`: Python format, lint, typecheck and `pnpm.cmd test:python` | Exit 0; 735 tests passed, mypy checked 180 files; recorded pytest cache warning. |
| `F-Rust-static-01`: Rust format and lint | Exit 0; both configured Clippy variants. |
| `F-Rust-tests-01`: `pnpm.cmd test:rust` | Exit 0; default 141 and release-locked 140 passed; seven explicit ignores in each variant. |
| `F-Desktop-build-01`: `pnpm.cmd build:desktop` | Exit 0; default native build and nested Vite build. |
| `F-Portable-front-01`: `pnpm.cmd --filter @voxleaf/desktop build` | Exit 0. |
| `F-Python-build-01`: `pnpm.cmd build:python` | Exit 0; wheel and source archive. |
| `B1-spec-static-final-04`: browser-spec formatting/lint and desktop typecheck | Exit 0 on the final R1 spec. |
| `B1-browser-final-03`: `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts` | Exit 0; all 15 cases passed in 173.25 seconds. |
| Evidence guard tests in `F-TS-static-01` | 31 passed; the larger receipt subsequently failed and is **not** a whole-command PASS. |
| `F-Docs-R1-01`: evidence guard, diff check and Git identity inspection | Exit 0 on the frozen R1 documentation. |
| N1 native integration | Not executed for R1; deliberately deferred until the corrected frontend build. |

The final browser receipt SHA-256 is `01ebb7c770f0b2729fded5d9f0b1477714328dcbf9a58bde0f9454cf59c8783a`; its completed log is `e44966e227c9c72093fd976c1056b4f265331dbc1aee2080c8c0aac2a458c0eb`. Its before/after snapshots differ only in generated `apps/desktop/dist/tsconfig.tsbuildinfo`, not reviewed source.

The documentation receipt SHA-256 is `eaea66dca51d87230e55b0c9872d0011ee0ba76d755e4627918ae4243d8ece84`; its before/after snapshots are identical.

The supplied deltas support the current Python and TypeScript runtime results. Later browser-spec changes have separate static and full-browser receipts. Rust results establish their execution-time outcomes; because their snapshots precede the final frontend assets and `main.rs` consumes `tauri::generate_context!()`, this report does not establish complete final-input equivalence for those gates. Renewing the cheap Rust leaves after the corrected frontend build is an appropriate bounded resolution. No historical VAF/SAC acceptance is reused.

Findings:

**R1-F1 — P2 — Preference reflow can strand interior navigation and visual sampling**

- **File/symbol:** `apps/desktop/src/reader/ReaderPublication.tsx`, `setDestinationRef` around lines 537–545, `ReaderReflowRestorer.onRestored` around lines 311–319, and `updatePreference` around lines 673–685.
- **Concrete trigger:** Request next/previous passage at an interior offset, then change a reader preference while its bounded asynchronous placement remains pending.
- **Consequence:** The preference change replaces the shared restorer’s pending `"restoration"` with `"preference"`. Its completion only emits `"reflow"` settlement. The original navigation’s `pendingPositionSaveRevision` remains pending and `resumeProgrammaticNavigationRef` is never released. Narration remains in navigation settlement, and subsequent passive scrolling cannot update the visual locator or its persistence until another action clears the outstanding navigation ownership.
- **Supporting evidence:** `ReaderReflowRestorer.preserve()` replaces its single pending request and cancels its scheduled callback. The preference completion branch never calls `finishProgrammaticNavigation()`. `App.handleSettledLocatorChange()` routes `"reflow"` to `preserveActiveLocator()`, which explicitly returns while narration has pending navigation, rather than calling `settleExternalNavigation()`. `ActiveVisualLocatorTracker.requestSample()` refuses sampling while the retained suspension depth is positive. Reader preference changes are not guarded against pending navigation. Current new tests cover superseding passage requests and geometry failures, but not this overlapping preference path.
- **Bounded correction criterion:** Ensure preference reflow either preserves/completes the original navigation settlement or waits until it finishes, releasing the programmatic sampling token exactly once. Add a deterministic overlap regression proving that navigation settles at the intended locator, no automatic audio begins while paused, and later genuine passive scrolling again produces locator observations.

Remaining uncertainty:

- R1-F1 is confirmed by source tracing, not reviewer-executed reproduction.
- N1 remains missing by explicit coordinator decision.
- Final Rust input equivalence remains unresolved as described above.
- Model/GPU, download and installer campaigns are outside this patch’s selected validation scope; their historical results are not current acceptance evidence.

Required next action: Correct R1-F1, supply the focused regression and renewed affected frontend/static/build/browser evidence, resolve the Rust input gap, execute N1 on the corrected final binary, and submit a fresh immutable R2 request. Preserve R1 and its hashes.

This report grants no acceptance, Git permission or Validation Report status.
