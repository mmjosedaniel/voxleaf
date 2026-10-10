# Audit Packet

Target ID: DESKTOP-SEMANTIC-DOCUMENT-01

Decision: CHANGE

Risk: medium

Primary target: `apps/desktop/src/reader/SemanticDocument.tsx`: plan types,
`MutableBlockIndex`, `buildBlockPlan`, `groupBlockPlans`,
`buildBlockSequencePlan`, `buildDocumentRenderPlan`, `groupListItemPlans`.

Related context: colocated renderer tests, `large-chapter-rendering.ts` and
tests, `ReaderPublication.tsx` and tests. Independent `clean_code_auditor`
(GPT-6.1 Sol high), current HEAD `ebe5edd5f8d6b29dee6a6c5267f635cf6fe2d5d5`.
Clean initial worktree/index; new module absent. Auditor ran no tests.

Concrete evidence: pure preorder indexing/group planning at lines 270-383 and
517 onward is interspersed with React projection/memo comparators. The existing
document-keyed `useMemo` at line 809 already provides a narrow boundary. Small
nested rendering and 251-flat-paragraph batching are tested separately; nested
content crossing a yield lacks renderer coverage. This is an ownership and
coverage finding, not a runtime defect or performance claim.

Behavior invariants:
1. Preserve preorder, original block identities, WeakMap writes, counts,
   half-open ranges and empty-item fallback. List items are not semantic blocks.
2. Preserve both grouping algorithms, accumulation, flush order and freezing.
3. Preserve document-keyed memoization, capacity equality, scheduler and hooks.
4. Preserve 250-block initial/resume bounds, source order and busy/status state.
5. Preserve rejection before rendering, 10,000-block/80,000-node limits.
6. Preserve JSX, language/direction, inert markup, targets, raster delegation,
   React keys and memo comparators.
7. Preserve destination identity, DOM/locator registration and release,
   restoration, highlight, focus, navigation and persistence callbacks.
8. Preserve the exact unsupported-value, invalid-plan and changed-capacity errors.
9. Preserve local processing, content-free diagnostics, cancellation, bounded
   resources and no generated-audio persistence.

Allowed files:
- `apps/desktop/src/reader/SemanticDocument.tsx`
- `apps/desktop/src/reader/semantic-document-render-plan.ts` (new)
- `apps/desktop/src/reader/SemanticDocument.test.tsx`

Proposed edits: move the named declarations and algorithms to the internal module;
import the existing batch constant; retain exhaustive checking and its exact
error. Export only the builder and four renderer-used types (`SemanticBlockPlan`,
`SemanticBlockGroupPlan`, `SemanticListItemGroupPlan`,
`SemanticBlockSequencePlan`). Replace declarations with imports, leaving React
ownership intact. Add one DOM regression: quote wrapping a list with 500
paragraphs (502 semantic blocks), asserting source order/counts 248, 498, 500
across two scheduled resumes, pending yields and busy/status completion. Retain
all existing tests/assertions; do not import planner helpers into this test.

Forbidden edits: outside allowlist; changed behavior/complexity/memoization,
capacity/scheduler/yield policy, DOM/ref/key/error changes, cloning, generic
visitors, new abstractions, grouping deduplication, public contracts, EPUB or
narration changes, dependencies/configuration/generated/frozen/historical files,
test weakening/timeouts, harness fixes, performance changes or unrelated cleanup.
No staging, commits, push or PR.

Diff ceiling: 3 files; maximum 700 combined added/deleted lines.

Baseline commands (local PowerShell outside sandbox, repository root):
```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd --filter @voxleaf/desktop build
```

Post-change commands: all baseline commands, then:
```powershell
pnpm.cmd test:browser
pnpm.cmd test:native-startup
```

Documentation impact: director-owned progress/evidence only; no architecture or
product behavior change. Retain lifecycle-owner SKIPs. No benchmark for unchanged
algorithms; changed traversal/memoization/batching/yielding requires re-audit.

Decision required: none; passing baseline and frozen order still required.
