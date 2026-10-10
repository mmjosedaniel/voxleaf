# Validation Report

Report ID: DESKTOP-SEMANTIC-DOCUMENT-01-POST-CHANGE-01

Target ID: DESKTOP-SEMANTIC-DOCUMENT-01

Mode: POST-CHANGE

Verdict: BLOCKED

Environment: local PowerShell outside sandbox, repository root, PowerShell 7.6.5, Node v24.20.0 and pnpm 11.15.1. Every acceptance invocation used require_escalated. The existing C:\nvm4w\nodejs\node_modules\corepack\shims directory was prepended to process-local PATH with COREPACK_ENABLE_NETWORK=0. No package installation, download, source/harness edit, or Git mutation. Commands ran sequentially on 2026-10-10 from 18:12:29Z through 18:14:09Z; the final identity/diff inspection followed. Raw logs, outcomes.jsonl, before.json and after.json are retained under ignored tmp/evidence/desktop-source-organization/DESKTOP-SEMANTIC-DOCUMENT-01-POST-CHANGE-01/.

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

Identity recheck: PASS. HEAD, all three statuses/SHA-256 hashes/filter-aware blob IDs, overall porcelain status and empty index remained unchanged. Identities were captured using git status --porcelain=v1 --untracked-files=all -- <path>, Get-FileHash -Algorithm SHA256 -LiteralPath <path>, and git hash-object --path=<path> -- <path>. The before/after structured comparison returned IDENTITY_MATCH=True. git diff --cached --quiet exited 0 before and after commands.

Commands and outcomes:
1. `pnpm.cmd build:packages` -> exit 0. Shared and EPUB TypeScript builds completed, establishing the compiled workspace dependencies. Raw log: 01-build-packages.log.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0. Desktop tsc --project tsconfig.json --noEmit passed. Raw log: 02-desktop-typecheck.log.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0. 54 files / 588 Vitest tests passed, including the new nested renderer regression (baseline: 587). All 38 configured Node tests passed; zero failures, cancellations or skips. This covers deterministic desktop behavior and configured host-script assertions, not actual native sessions. Raw log: 03-desktop-test.log.
4. `pnpm.cmd format:check:typescript` -> exit 0. All matched files satisfy Prettier, including the new module/test and configured CSS. Raw log: 04-format.log.
5. `pnpm.cmd lint:typescript` -> exit 0. Repository eslint . passed. Raw log: 05-lint.log.
6. `pnpm.cmd --filter @voxleaf/desktop build` -> exit 0. Vite production build transformed 184 modules. The existing large-chunk warning remained nonfatal. This proves bundling, not native application execution. Raw log: 06-desktop-build.log.
7. `pnpm.cmd test:browser` -> exit 0. All seven configured Chromium tests passed in 10.9 seconds: active locator geometry, EPUB2/NCX navigation, publication shell/open behavior, oversized rejection, canonical reflow/restoration, narrow keyboard/accessibility interaction, and synchronization without DOM/selection mutation. Nonfatal NO_COLOR/FORCE_COLOR and chunk-size warnings were recorded. Raw log: 07-browser.log.
8. `pnpm.cmd test:native-startup` -> exit 1. Vite build and the native release build succeeded; Rust release compilation finished in 34.70 seconds. The smoke then failed during native WebView session creation with `[webdriver-session-not-created]`. Packaged application assertions were not reached. This host execution failure is not a sandbox denial and does not establish a source regression; group N was not a baseline command. Required packaged acceptance is missing. Raw log: 08-native-startup.log.
9. `git diff --check` -> exit 0 before and after acceptance commands. Final raw log: 09-diff-check.log.

Diff scope: PASS. Independent complete tracked-diff and untracked-module review found precisely the three allowed source files, totaling 501 combined added/deleted lines (+302/-199), below the 700-line ceiling. Existing types and planning algorithms moved to the internal module; only the builder and four renderer-used types are exported. The component adds imports and removes relocated declarations. Director-owned active-plan and five evidence Markdown changes were already present outside the allowlist and remained unchanged. No undeclared source change or staged path appeared.

Invariant review: PASS for code review and completed deterministic/browser evidence; packaged evidence remains explicitly missing. (1) Preorder traversal, original object identities, WeakMap writes, half-open ranges, counts, empty-list-item fallback and treatment of list items are preserved by unchanged algorithm bodies. (2) Both grouping algorithms retain accumulation, flush boundaries/order and freezing. (3) Document-keyed memoization, capacity equality and scheduler subscription remain in the unchanged component. (4) The new real-DOM test observes 248, 498 and 500 ordered paragraphs under quote/list wrappers across exactly two resumes, one pending yield between batches, and final absence of busy/loading state. (5) Capacity assessment and 10,000-block/80,000-node limits are unchanged; existing rejection/capacity tests pass. (6) JSX, hooks, memo comparators, React keys, language/direction, inert markup, target behavior and raster delegation remain unchanged. (7) Destination identity, locator/ref registration and cleanup are unchanged; deterministic and browser restoration/focus/highlighting/navigation assertions pass. (8) Unsupported-value, invalid-plan and changed-capacity errors retain their text and conditions; the extracted private exhaustive helper throws the same ordinary Error. (9) The new module has no I/O, persistence or asynchronous ownership; local processing, bounded scheduling and cancellation owners remain untouched. No new model-backed, exact-host performance, general screen-reader or packaged behavior claim is made. Empty-item fallback and exhaustive error paths receive static equivalence review rather than new targeted runtime tests.

Test-integrity review: PASS. All existing assertions are retained. One additive regression tests observable rendered hierarchy/order/counts and scheduler progress without importing the planner. No timeout, fixture-authority, test-runner, snapshot or assertion weakening occurred. The full configured desktop command ran, including Node tests, and the browser/native commands were unchanged.

Privacy/artifact review: PASS. No public contract, dependency, lockfile, generated tracked source, frozen authority, historical file, book, audio, model, secret, or private data entered the source patch. Only planned source files and pre-existing director-owned Markdown appear in Git status. Raw validation artifacts are ignored. No model-backed runtime, download or firewall action was performed.

Action required: Diagnose and resolve the host WebDriver/WebView2 session-creation prerequisite without altering source, tests or harness. An installed compatible driver may permit a process-local environment correction, subject to director authorization. Then rerun all eight required acceptance commands with fresh before/after identities under a new Report ID. Preserve this report and its exit-1 outcome unchanged; do not accept the unit or proceed to another source unit on these partial passes.
