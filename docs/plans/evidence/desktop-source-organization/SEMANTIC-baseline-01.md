# Validation Report

Report ID: DESKTOP-SEMANTIC-DOCUMENT-01-BASELINE-01

Target ID: DESKTOP-SEMANTIC-DOCUMENT-01

Mode: BASELINE

Verdict: PASS

Environment: local PowerShell outside sandbox. Repository root; PowerShell 7.6.5,
Node v24.20.0, pnpm 11.15.1 through existing Corepack shims prepended to
process-local PATH; COREPACK_ENABLE_NETWORK=0. All acceptance commands used
require_escalated. No installation, source edits or Git mutations. Independent
refactor_validator, GPT-6 Astra high. Director-transcribed immutable receipt.

Starting HEAD SHA: `ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5`

Ending HEAD SHA: `ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5`

Validated paths and identities (before and after):

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/reader/SemanticDocument.tsx` | `""` | `A263872B3C6D6A1591B3E7B4481502DF2ABA9C95D092B09872D0B8C6F34807F2` | `b03677f27ea1565b05942725c1666e0bf32ad62d` |
| `apps/desktop/src/reader/semantic-document-render-plan.ts` | `""` | ABSENT | ABSENT |
| `apps/desktop/src/reader/SemanticDocument.test.tsx` | `""` | `F70B7422FF0D6A15AD457D841BEC280CCC2B33F7DC4C237F51E7224C6778ED79` | `d5f85b0fc0318499d3f70edf719858617b6680cf` |

Identity recheck: PASS. Before/after HEAD, every path status/hash/blob, planned
absence and overall status matched exactly. `git diff --cached --quiet` exited
0 before and after. Identity commands were `git status --porcelain=v1
--untracked-files=all -- <path>`, `Get-FileHash -Algorithm SHA256 -LiteralPath
<path>` and `git hash-object --path=<path> -- <path>`; absent paths not hashed.

Commands and outcomes:
1. `pnpm.cmd build:packages`: exit 0; shared and EPUB TypeScript builds passed.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`: exit 0; desktop tsc passed.
3. `pnpm.cmd --filter @voxleaf/desktop test`: exit 0; 54 files / 587 Vitest tests
   and 38 Node tests passed; zero Node failures/cancellations/skips.
4. `pnpm.cmd format:check:typescript`: exit 0; configured Prettier checks passed.
5. `pnpm.cmd lint:typescript`: exit 0; repository eslint passed.
6. `pnpm.cmd --filter @voxleaf/desktop build`: exit 0; Vite transformed 183
   modules; existing large-chunk warning, successful build.
7. `git diff --check`: exit 0 before and after commands.

Diff scope: PASS. All three source paths clean and unchanged; only director-owned
plan, audit and draft edits outside allowlist. Index remained empty.

Invariant review: PASS for baseline readiness. Reviewed preorder indexing,
original-object WeakMap, half-open ranges, empty-item fallback, grouping/freezing,
document memoization, capacity and scheduler ownership. Existing tests cover
source order, language/direction, inert markup, targets, flat yielding, rejection,
limits, cancellation/stale callbacks, restoration/focus, registration cleanup and
narration projection. Nested 502-block regression is not yet present. Browser,
packaged WebView2, models and performance were not exercised by this baseline.

Test-integrity review: PASS; complete configured command, unchanged assertions,
no snapshot/timeout changes or relaxed tests.

Privacy/artifact review: PASS; no source, dependency, tracked generated file,
book, audio, model, secret/private data or unrelated artifact entered changes.
Ignored build outputs are outside manifest.

Action required: none. Baseline only; frozen director order required to implement.
