# Portfolio maintainability review

Created: 2026-11-14.
Status: complete as a three-target audit; no implementation unit accepted.
Base: `97d36c213e16ea015c24b1589454d61dab4379ea`.

## Goal

Review three central desktop modules for concrete maintainability improvements
without altering product behavior or performing a repository-wide campaign.

## User-visible outcome

The implementation is easier for a technical evaluator and future maintainer to
understand. A supported SKIP is a successful outcome; line count is not a target.

## Current state

At the clean base, App.tsx has 1,002 lines, ReaderPublication.tsx 1,424 and the
product narration coordinator 2,729. These counts motivate inspection, not a
defect classification. Source already delegates multiple domain responsibilities
to coordinators and helpers. Tests cover restoration, cancellation and navigation.
The separate portfolio-readiness plan may change documentation and a Rust test;
carry those edits explicitly without incorporating them into this refactor.

## Scope and non-goals

Audit queue, one cohesive unit at a time:

- PM-01: `apps/desktop/src/App.tsx`, its tests and direct collaborators.
- PM-02: `apps/desktop/src/reader/ReaderPublication.tsx`, its tests and direct collaborators.
- PM-03: `apps/desktop/src/tts/product-narration-coordinator.ts`, its tests and direct collaborators.

Use one Sol-high clean_code_auditor, one Sol-high clean_code_worker and one
Astra-high refactor_validator. Only one implementation writer may run at a time.
Each CHANGE needs a bounded closed allowlist, independent pre-edit baseline and
frozen work order. Normally one production owner, its tests and at most two
direct support files. Review shared mutable paths before any baseline; regroup
overlap or stop for scope revision. No generated/frozen/history edits, public
contract changes, new dependencies, new features or arbitrary file splitting.
No Git mutation is authorized by this plan; keep the index empty, accept patches
unstaged and continue only to disjoint clean allowlists.

## Relevant files and documentation

Read AGENTS, PLANS, product MVP, relevant canonical architecture sections,
`orchestrate-safe-refactor`, its complete refactor contracts and
`validate-safe-refactor` with validation policy/matrix/record. Inspect current
owners, callers and tests before issuing packets. Preserve M005 narration
boundaries and consult its completed plan if an extraction reaches preparation.

## Architecture and constraints

Preserve local-only processing, bounded memory, cancellation, stable locators,
visible/audible/saved synchronization and content-free diagnostics. An extraction
must clarify ownership while preserving ordering and cleanup. Any actual behavior
correction leaves refactor scope and requires its own change review.

## Milestones

1. Audit all three targets, retaining CHANGE/SKIP/BLOCKED packets and invariant-to-
   assertion coverage. Do not prescribe extraction before the auditor's evidence.
2. For accepted CHANGE packets, define disjoint units/integration batch and gates;
   establish independent baselines before edits. SKIP needs no implementation.
3. Execute one frozen order at a time, worker fast checks then independent
   post-change validation; at most two correction loops before redesign.
4. Resolve combined integration gates, inspect the final diff and archive only
   when all targets are accepted/skipped and required validation/cleanup is done.

## Testing and benchmark strategy

All acceptance runs in local PowerShell outside the sandbox with pinned tools.
The validator selects gates by affected responsibilities, not file length.
No runtime edit may precede an approved gate ledger and PASS baseline.

| Gate family | Existing commands | Timing / invalidation |
| --- | --- | --- |
| Fast TS | `pnpm.cmd format:check:typescript`, `pnpm.cmd lint:typescript`, `pnpm.cmd typecheck:typescript` | Baseline/worker/post; source, config, locks, imports and discovered inputs |
| Behavior | Configured desktop Vitest runner with named existing files | Per unit before/after; include adjacent invariant assertions |
| Browser/native | `pnpm.cmd test:browser`, `pnpm.cmd test:native-startup` | If affected interaction/lifecycle warrants; high-risk unit acceptance cannot defer |
| Exact narration | Existing appropriate profile/host commands selected by validator | Only when affected cancellation/audio/synchronization requires; preflight and restoration mandatory |
| Combined | Relevant `pnpm.cmd check` / `pnpm.cmd check:portable` leaves per canonical policy | Final batch; exact input/environment proof for any deduplication |
| Docs | `git diff --check`, `pnpm.cmd check:evidence` | Final records and indexes |

Draft work orders must add gate IDs, exact cwd/args, complete input identities,
timing, risk, readiness, bounded scratch paths, invalidation and pending batch
gates. Unknown dependencies require running the gate. Only the validator may
reuse immutable evidence with complete equivalence proof. Raw logs go in ignored
`tmp/evidence/portfolio-maintainability/`, reports in
`docs/plans/evidence/portfolio-maintainability/`, outside self-hashing manifests.

## Risks and rollback

These owners coordinate high-risk behavior. Reject moves that obscure ordering
or add indirection without a useful ownership boundary. Preserve rejected-patch
identity; correct it or remove only verified worker hunks before another unit.
No broad reset, restore or cleanup. Bounded retry rules and host restoration
apply; unresolved baseline/acceptance failures remain visible.

## Progress log

- 2026-11-14: three targets selected from the portfolio assessment; clean base
  inspected. Models/roles are available. No source edits or baseline run yet.
- 2026-11-14: Sol-high auditor completed PM-01, PM-02 and PM-03. PM-02 is SKIP;
  PM-01 and PM-03 contain small optional extractions with no observed defect.
  The director retained current code because the standalone changes do not
  materially simplify these owners and touch high-risk responsibilities.
  [Audit dispositions](../evidence/portfolio-maintainability/audit-dispositions.md)
  preserve evidence, coverage and potential future work.

## Discoveries and decisions

Review maintainability independently from portfolio presentation. Preserve every
existing acceptance obligation. A module may be large for legitimate reasons;
record SKIP when a bounded improvement is not demonstrated.

## Final validation results

All three target owners and their tests are unchanged. Audit completed without
an accepted source unit, so milestones 2-3 require no baseline, worker, validator
or runtime gate. No refactor PASS or historical runtime evidence reuse is claimed.
Document integrity checks passed during the portfolio delivery. R2 change review
confirmed the no-change disposition is truthful and triggers no refactor runtime
acceptance. The [final archival assessment](../evidence/portfolio-readiness/review-final.md)
covers milestone 4's closing documents. PM-01/PM-03 remain optional future
candidates, not fixed defects or implemented refactors.
