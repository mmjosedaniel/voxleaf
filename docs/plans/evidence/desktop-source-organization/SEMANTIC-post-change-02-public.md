# Publication-safe derivative

Original record: SEMANTIC-post-change-02.md.
Original SHA-256: B64C9CF47727FC23A33AC6179A1E695CDF87D3F33D46799DC6BCE631BD5AC05B.
Prepared 2026-10-10 for the user-authorized public pull request.
The original issued record remains byte-for-byte in ignored local evidence:
tmp/evidence/desktop-source-organization/PUBLICATION-REDACTION-01/originals/SEMANTIC-post-change-02.md.
Only the user-specific WebDriver installation/workspace paths below are replaced
with symbolic user-profile/repository tokens. All commands, outcomes, source
identities, timestamps and original report metadata remain unchanged.
This is a labeled derivative, not the original byte-identical report or a new
validation result. See [publication provenance](publication-provenance-01.md).

---

# Validation Report

Report ID: DESKTOP-SEMANTIC-DOCUMENT-01-POST-CHANGE-02

Target ID: DESKTOP-SEMANTIC-DOCUMENT-01

Mode: POST-CHANGE

Verdict: PASS

Environment: local PowerShell outside sandbox, repository root, PowerShell 7.6.5, Node v24.20.0, pnpm 11.15.1. Every acceptance invocation used require_escalated. The existing C:\nvm4w\nodejs\node_modules\corepack\shims directory was prepended to process-local PATH with COREPACK_ENABLE_NETWORK=0. The director-approved process-local VOXLEAF_EDGE_DRIVER_PATH selected <repository>/tmp/native-rust-module-organization/webdriver-155.0.4283.45/msedgedriver.exe, matching installed WebView2 155.0.4283.45. Its Microsoft Authenticode signature was Valid; SHA-256 DC99C208C10A5364E61C4E5B1341BE492F3224DE753ADB23E973BE97875B1892. No download, installation, firewall change, persistent environment change, source/harness edit or Git mutation. All eight commands were freshly executed sequentially from 2026-10-10T18:17:04Z through 18:18:15Z, followed by final identity/diff inspection. This is fresh execution evidence, not a hash refresh of POST-CHANGE-01; that BLOCKED report remains unchanged. Raw logs, outcomes.jsonl, before.json, after.json and host.json are retained under ignored tmp/evidence/desktop-source-organization/DESKTOP-SEMANTIC-DOCUMENT-01-POST-CHANGE-02/.

Starting HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5

Ending HEAD SHA: ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5

Validated paths:
- apps/desktop/src/reader/SemanticDocument.tsx
- apps/desktop/src/reader/semantic-document-render-plan.ts
- apps/desktop/src/reader/SemanticDocument.test.tsx

Validated path identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob ID |
| --- | --- | --- | --- |
| apps/desktop/src/reader/SemanticDocument.tsx | ` M apps/desktop/src/reader/SemanticDocument.tsx` | 6559C258CE1A2247897DCB131D6D5D4A5B79AED6F0CE8F94D6700189151FE8E2 | 2461f6208cc6e1b082b1c7977143f37903d2e041 |
| apps/desktop/src/reader/semantic-document-render-plan.ts | `?? apps/desktop/src/reader/semantic-document-render-plan.ts` | 51E91A57D9ED9C6B9734434F8489AD150DE0E6D22DAE8888A3036263E1A247CB | f7083cd49d14c17eaeefd898ed230da223042616 |
| apps/desktop/src/reader/SemanticDocument.test.tsx | ` M apps/desktop/src/reader/SemanticDocument.test.tsx` | C37C3437C433F8E73DEA95C36373D2C7A8842746D0A0FFD82B5C5555B06981A3 | 26ba73dc3fb43d41f345ae852131ae2846e1d1ef |

Identity recheck: PASS. HEAD, every validated status/SHA-256/filter-aware blob ID and complete porcelain path/status listing matched before/after; the structured checks returned IDENTITY_MATCH=True and GLOBAL_STATUS_MATCH=True. git diff --cached --quiet exited 0 before and after. The freshly captured source identities also match the independently reviewed frozen-order patch. Identities used git status --porcelain=v1 --untracked-files=all -- <path>, Get-FileHash -Algorithm SHA256 -LiteralPath <path>, and git hash-object --path=<path> -- <path>.

Commands and outcomes:
1. `pnpm.cmd build:packages` -> exit 0. Shared and EPUB TypeScript builds completed, establishing required compiled workspace dependencies. Raw log: 01-build-packages.log.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0. Desktop tsc --project tsconfig.json --noEmit passed. Raw log: 02-desktop-typecheck.log.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0. 54 files / 588 Vitest tests passed (baseline: 587), including the new nested renderer regression; all 38 configured Node tests passed with zero failures, cancellations or skips. Proves deterministic desktop behavior and configured host-script assertions. Raw log: 03-desktop-test.log.
4. `pnpm.cmd format:check:typescript` -> exit 0. All configured matched files satisfy Prettier, including the new module/test and CSS. Raw log: 04-format.log.
5. `pnpm.cmd lint:typescript` -> exit 0. Repository eslint . passed. Raw log: 05-lint.log.
6. `pnpm.cmd --filter @voxleaf/desktop build` -> exit 0. Vite production build transformed 184 modules. The pre-existing large-chunk warning remained nonfatal. Establishes production bundling. Raw log: 06-desktop-build.log.
7. `pnpm.cmd test:browser` -> exit 0. All seven configured Chromium tests passed in 10.5 seconds: active locator geometry, EPUB2/NCX navigation, publication shell/open behavior, oversized rejection, canonical reflow/restoration, narrow keyboard/accessibility interaction, and synchronization without DOM/selection mutation. Nonfatal NO_COLOR/FORCE_COLOR and large-chunk warnings were recorded. Raw log: 07-browser.log.
8. `pnpm.cmd test:native-startup` -> exit 0. Native release compilation completed in 23.06 seconds. Packaged WebView2 smoke passed: root mount; bounded TTS protocol and supervised fake-service binary delivery/cancellation/crash recovery; local file reselection/cancellation/replacement and exact/max-plus-one boundaries; narrow accessible keyboard reader matrix; synchronization feasibility; local synthetic EPUB image decode; exact position/preferences across restart and reselection; publication replacement cleanup; zero errors and zero external requests. This is model-free packaged evidence, not model-backed or six-playback-rate acceptance. Raw log: 08-native-startup.log.
9. `git diff --check` -> exit 0 before and after acceptance commands. Final raw log: 09-diff-check.log.

Diff scope: PASS. Independently reviewed complete tracked diff and new module are unchanged and satisfy the frozen SEMANTIC-order-01.md: exactly three source files, 501 combined added/deleted lines (+302/-199), below 700. Existing plan types and algorithms move to one internal module; only buildDocumentRenderPlan and four renderer-used types are exported. React projection remains in the component. The new test is additive. Director-owned active-plan and seven evidence Markdown changes already existed outside the allowlist and remained unchanged. No other source/configuration/dependency/generated/frozen/historical path changed; index stayed empty.

Invariant review: PASS. (1) Preorder, original block identity, WeakMap writes, half-open ranges, counts, empty-item fallback and treatment of list items are preserved by unchanged algorithm bodies. (2) Both grouping algorithms retain accumulation, flush order/boundaries and freezing. (3) Document-keyed memoization, capacity equality and scheduler subscription remain in the unchanged React owner. (4) The new actual-DOM regression verifies ordered nested paragraph counts 248, 498 and 500 across exactly two resumes, one pending yield between batches and final absence of busy/loading state. (5) Unchanged capacity policy retains 10,000-block/80,000-node ceilings and rejection before content; relevant tests pass. (6) JSX, hooks, memo comparators, React keys, language/direction, inert markup, targets and raster delegation remain unchanged. (7) Destination identity, locator/ref registration/release and restoration/focus/highlighting/navigation/persistence ownership remain unchanged; deterministic, browser and packaged checks pass. (8) Unsupported-value, invalid-plan and changed-capacity errors retain exact text and conditions; the extracted exhaustive helper throws the same ordinary Error. (9) The new module introduces no I/O, persistence, asynchronous owner or new resource policy; privacy, local-only processing, bounded scheduling and cancellation owners remain unchanged. Limits: empty-item fallback and exhaustive invalid-value paths receive static equivalence review rather than new targeted tests. No fresh model-backed, exact-host performance, human listening or general screen-reader certification claim; those are not triggered by this unchanged-algorithm renderer extraction. No benchmark is inferred from file-size reduction.

Test-integrity review: PASS. Existing assertions are unchanged. The one added test asserts rendered hierarchy/order/counts and observable scheduler progress without importing planner helpers. No timeout, fixture authority, harness, snapshot, runner or assertion weakening. Full configured Vitest-plus-Node, browser and native scripts executed unchanged.

Privacy/artifact review: PASS. No public contract, dependency, lockfile, generated tracked source, frozen authority, historical record, copyrighted book, generated audio, model weight, secret or private data entered the patch. Only the approved source paths and pre-existing director Markdown appear in Git status. Raw logs/captures remain ignored; validation used repository-authored synthetic fixtures. No model downloads or model-backed execution occurred.

Action required: none. This PASS binds only the recorded HEAD and three exact source identities. It does not authorize staging, committing, pushing, a pull request, or final campaign completion. Preserve POST-CHANGE-01 and its failed native attempt as historical evidence; any future source/HEAD drift requires a new report and rerunning required acceptance commands.
