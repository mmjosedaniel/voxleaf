# APPROVED WORK ORDER

Order ID: DESKTOP-SEMANTIC-WORK-01

Target ID: DESKTOP-SEMANTIC-DOCUMENT-01

Goal: isolate pure semantic render planning from React projection without
changing rendered behavior or ownership.

Risk: medium

Allowed files:
- `apps/desktop/src/reader/SemanticDocument.tsx`
- `apps/desktop/src/reader/semantic-document-render-plan.ts` (new)
- `apps/desktop/src/reader/SemanticDocument.test.tsx`

Required edits:
1. Move existing plan types, MutableBlockIndex and buildBlockPlan,
   groupBlockPlans, buildBlockSequencePlan, buildDocumentRenderPlan and
   groupListItemPlans into the new module; use the existing batch constant.
   Preserve exhaustive checking with the exact unsupported-value error.
2. Export only buildDocumentRenderPlan and the four renderer-used types
   SemanticBlockPlan, SemanticBlockGroupPlan, SemanticListItemGroupPlan and
   SemanticBlockSequencePlan. Replace component declarations with imports.
3. Add one rendered-DOM regression with quote wrapping a list of 500 paragraph
   items: 502 semantic blocks, rendered paragraph counts/order 248, 498, 500
   across two scheduled resumes, bounded pending yields and busy/status states.
   Keep all current assertions; test through the scheduler port, not helpers.

Behavior invariants:
1. Preserve preorder, original block identity/WeakMap writes, half-open ranges,
   counts and empty-item fallback; list items are not semantic blocks.
2. Preserve grouping accumulation/flush/order/freezing exactly.
3. Preserve document memoization, capacity equality and scheduler subscriptions.
4. Preserve 250-block initial/resume limits and source order/status completion.
5. Preserve rejection before content and 10,000-block/80,000-node limits.
6. Keep JSX/hooks/memo comparators/React keys, text context, inert markup,
   target activation and raster delegation in the component unchanged.
7. Preserve destination identity, DOM/visual-locator refs, registration/release,
   restoration, focus, highlighting, navigation and persistence callbacks.
8. Preserve exact existing error messages and error behavior.
9. Preserve privacy, cancellation, bounded resources and no audio persistence.

Forbidden changes: any other file; scheduler/capacity/algorithm/complexity/yield
or memoization change; DOM/keys/refs/errors/behavior/public contracts; object
cloning, generic visitors/abstractions or grouping deduplication; EPUB/narration;
dependencies/configuration/generated/frozen/historical sources; weakening tests,
timeouts, harness fixes or unrelated cleanup. No staging/commit/push/PR.

Diff ceiling: maximum 3 files and 700 combined added/deleted lines, including
untracked new source. Stop on exceeding scope or overlap with another writer.

Baseline evidence: [DESKTOP-SEMANTIC-DOCUMENT-01-BASELINE-01](SEMANTIC-baseline-01.md),
PASS, unchanged HEAD `ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5` and clean source
identities. This order freezes the accepted audit/draft terms.

Worker validation: none. Independent validator owns host acceptance. If formatting
is needed, request a bounded correction after validator feedback; do not run tests.

Acceptance commands (repository root, local PowerShell outside sandbox):
```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop build
pnpm.cmd test:browser
pnpm.cmd test:native-startup
```

Completion output: Change Packet only; no commit or push. Director owns docs.
