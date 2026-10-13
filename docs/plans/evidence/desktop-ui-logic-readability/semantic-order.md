# Semantic comparison execution order

Target: `SRC-SEMANTIC-COMPARISON-03`. Fresh audit CHANGE, medium risk:
the two comparator bodies are identical and consume common range/props fields;
existing component tests prove output but do not characterize repeated work.

## APPROVED WORK ORDER

Goal: one private local comparison rule for the two existing memoized groups.
Closed allowlist:

- `apps/desktop/src/reader/SemanticDocument.tsx`
- `apps/desktop/src/reader/SemanticDocument.test.tsx`

Ceiling: two paths, 400 added plus removed lines.
First add public-seam characterization and verify it against unchanged production
with the existing desktop test command outside the sandbox. Use stable
`targetAvailability` callbacks, synthetic internal-link sentinels, controlled
yields and `destinationRef`. Cover completed flat/list descendants during later
yields, partial groups advancing in order, service replacement, destinations
entering/leaving ranges, next-range boundary, absent/removed destinations and
document/context replacement. Retain existing assertions and fixtures.

Then add a private union of existing group props; retain one unchanged comparator
body named `semanticGroupPropsEqual`, remove the duplicate and pass the shared
predicate directly to both existing `memo` calls. Preserve reference equality
for group/services, value equality for context, old/new destination impact,
inclusive-start/exclusive-end ranges with undefined outside, identical counts or
both counts reaching end, evaluation order, short-circuiting and constant work.
Preserve memo components, props, keys, DOM refs, render-plan identities and yields.

Forbidden: new modules/frameworks, test exports, mocked React memoization,
production instrumentation, allocations/traversals/caches in comparison,
scheduler/services/domain changes, capacity or benchmark threshold changes,
dependencies, contracts, generated/frozen sources and unrelated edits. No Git
mutation or documentation edits by worker. Preserve all privacy, locator,
synchronization, cancellation and bounded-resource ownership.

Public callback counts prove descendant reuse but cannot isolate outer list
memoization; context replacement also replaces the plan. Static equivalence
review is required; do not overclaim private-branch test coverage.

Baseline evidence below is PASS. Worker validation: existing desktop test command
for pre-refactor characterization and targeted host formatting. Post acceptance
uses all eight commands below. Completion: Change Packet; stop on scope drift.

## Independent baseline

Report ID: `SRC-SEMANTIC-COMPARISON-03-BASELINE-20261013-01`.
Mode BASELINE, verdict PASS. Starting/ending HEAD:
`5be831c23135ca00f94b2b3374f0330de2b658ce`. Normal local PowerShell outside
sandbox (`require_escalated`), existing process-local Corepack/pnpm 11.15.1.

All commands exited 0:

1. `pnpm.cmd build:packages`
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`
3. `pnpm.cmd --filter @voxleaf/desktop test` — 719 Vitest / 70 Node.
4. `pnpm.cmd format:check:typescript`
5. `pnpm.cmd lint:typescript`
6. `pnpm.cmd --filter @voxleaf/desktop build`
7. `pnpm.cmd test:browser` — seven cases.
8. `pnpm.cmd benchmark:reader` — six cases, no skips, 45.0 seconds.

`git diff --check` and empty-index checks passed. Source identities before and
after matched; both paths were clean. Accepted narration work is separate.

| Path under `apps/desktop/src/reader/` | Porcelain | SHA-256 | Filtered blob |
| --- | --- | --- | --- |
| `SemanticDocument.tsx` | empty | `9FB1BAD6818DB66007A63785C4320332F4042982DBDCC8EF506127599377EAD6` | `916c8740a9da772050e1ea768cc9e3a9d9c0de3e` |
| `SemanticDocument.test.tsx` | empty | `C37C3437C433F8E73DEA95C36373D2C7A8842746D0A0FFD82B5C5555B06981A3` | `26ba73dc3fb43d41f345ae852131ae2846e1d1ef` |

Production 10,000-block benchmark: first content 150.1 ms, maximum scheduler
callback 7.9 ms, maximum batch 7.7 ms, target 670.8 ms, append 717.7 ms, reflow
105.5 ms. Incremental DOM/working-set deltas: 48,753 nodes / 131,141,632 bytes;
full-app deltas: 50,116 nodes / 165,625,856 bytes. Six lifecycle cycles passed;
closed growth was zero nodes, 1,073,248 heap bytes, 5,836,800 working-set bytes.
Final observer/object-URL ownership was zero and storage bounded.

Independent scope, baseline invariants, unchanged tests, privacy/artifact and
identity reviews passed. Existing chunk/color warnings remain. These are
reference-host regression checks, not a performance improvement or universal
hardware claim. The separate hardware baseline failure remains unresolved.
