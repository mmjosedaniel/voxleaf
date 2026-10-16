---
name: orchestrate-safe-refactor
description: Direct a systematic, behavior-preserving VoxLeaf clean-code or readability review across TypeScript, TSX, Python, and Rust files. Use when auditing many files, reducing maintainability problems, coordinating a director with auditor, worker, validator, and Git-steward subagents, or executing a bounded refactor campaign without changing product behavior.
---

# Orchestrate a safe refactor

Use the primary thread as the director. Delegate evidence gathering to
`clean_code_auditor`, implementation to `clean_code_worker`, and baseline plus
post-change acceptance to `refactor_validator`. Prefer to delegate ordered
Git-only mutations to `git_steward`; if the current surface cannot spawn that role,
record that limitation and have the director execute the identical Git
Action Order directly. Never run a source writer and Git mutation at the same
time.

## Agent context and availability

Use the named custom roles so their model, effort, and instructions stay
explicit. Before implementation, verify that the current session exposes the
configured role definitions; editing TOML does not reload an existing session.
If definitions are stale, start a fresh task before running the campaign.
If an audit, worker, or validation model is unavailable, report the exact blocker
and obtain a model decision rather than silently substituting or self-validating.

For each unit, provide its target ID, current source paths, invariants, and the
applicable packet or order. Prefer a fresh context at batch start when supported,
then reuse the role within that bounded batch. Re-read current files between
units; prior messages are context, not evidence of the current worktree.
Supporting agents must not delegate. Keep the four-role concurrency limit.

## Required context

1. Read `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`, and relevant product,
   architecture, and test documentation.
2. Read [references/refactor-contracts.md](references/refactor-contracts.md)
   completely before issuing an Audit Packet or Work Order.
3. When branch creation is authorized, use a `SETUP` Git Action Order to create
   it from the requested clean base with a known HEAD. If updating main is
   required, use a separate fast-forward order first and inspect its result.
   Setup orders may precede validation. Start source work with an empty Git
   index. Every path proposed
   for the unit allowlist must also have no pre-existing worktree change.
   Preserve unrelated unstaged user changes outside the allowlist and stop on
   overlap.
4. Create an ExecPlan before a multi-package campaign, significant refactor, or
   work expected to span multiple batches. Record every target as audited,
   changed, skipped, blocked, or excluded.

## Define the inventory

Build the current tracked inventory with:

```powershell
git ls-files -- "*.ts" "*.tsx" "*.py" "*.rs"
```

Restrict this inventory to the user-approved scope. Audit all selected paths,
but do not force all paths to change. Apply these
classes:

- `generated`: record and exclude it from manual editing; inspect its generator
  only when a real defect points there.
- `test`: review with the production behavior it protects; never clean a test
  in isolation when that would obscure its purpose.
- `configuration`: change only for a demonstrated correctness or maintenance
  problem, not preference.
- `production`: eligible for a bounded cohesive unit.

Treat one production file, its tests, and at most two directly coupled support
files as the normal unit. Split larger units unless separation would make the
review misleading. Group related units into a declared integration batch using
[validation-policy.md](../validate-safe-refactor/references/validation-policy.md).
Select risk, gate timing, input dependencies and invalidation before edits;
record pending batch gates separately from unit acceptance.

## Run one batch

1. Ask `clean_code_auditor` to inspect one raw target unit without providing a
   desired fix. Require an Audit Packet.
2. Review the evidence. Accept `SKIP` when no concrete problem exists. Escalate
   `BLOCKED` when behavior, architecture, or product authority must change.
3. Convert an accepted `CHANGE` packet into draft work-order terms. Name exact
   files, symbols, behavior invariants, forbidden changes, diff ceiling,
   baseline commands, worker fast checks, post-change commands and the gate
   ledger, but do not freeze the order. Select language-specific checks from
   the validation matrix; do not infer model gates from a directory name.
4. Ask `refactor_validator` for baseline mode. Do not edit when the baseline is
   failing for a relevant reason; record `BASELINE-FAIL` separately. After a
   passing baseline, issue the immutable APPROVED WORK ORDER and include the
   baseline report identifier and outcome. Reference any declared shared
   pre-edit baseline without pretending it was rerun for this unit.
5. Start exactly one `clean_code_worker`. Pass only the frozen work order and
   necessary source context. Do not let the director or another agent write
   concurrently.
6. Require assigned worker fast checks before expensive preparation and
   handoff. Inspect the Change Packet and diff; reject scope expansion.
7. Ask `refactor_validator` for post-change mode covering the baseline gates
   plus risk-triggered gates from `$validate-safe-refactor`. Only the validator
   may justify per-gate evidence reuse under the canonical policy.
8. Review correctness, tests, and readability as director. Accept only when the
   Validation Report is `PASS`, its identity recheck passes, and every invariant
   is demonstrably preserved. Retain the immutable report with its Report ID.
9. When correction is needed, send one precise Correction Order to the same
   worker. Permit at most two correction loops; after that, stop and redesign
   the work order instead of accumulating patches. Do not start another unit
   until the rejected patch is absent. Remove only verified worker-authored
   hunks; never discard overlapping user changes.
10. If the user authorized a commit, confirm the index is still empty and that
    the only changes in allowlisted paths are the reviewed worker patch. Copy the HEAD, closed allowlist, and path
    identities from the accepted POST-CHANGE report into the Git Action Order;
    do not replace them with newer hashes. Require the executor to compare the
    report, order, and live state and return BLOCKED for revalidation on drift.
    Then issue the GIT ACTION ORDER to the idle
    `git_steward` using the contract in the reference file. If the steward was
    recorded unavailable at campaign start, the director executes that order
    directly. Require
    exact-path staging, staged path and diff inspection, the approved commit
    message, and a Git Report. Review the report, confirm the index is empty
    again, update the ExecPlan or inventory record, then continue. Without
    commit authorization, retain the accepted patch unstaged and report it;
    continue only to disjoint units whose allowlisted paths are clean, carrying
    the accepted patch explicitly in subsequent baseline context.

Create one auditor, one worker, and one validator task per campaign batch and
reuse those role tasks for every unit. Also create and reuse one Git-steward
task when available. The auditor and worker use GPT-6.1 Sol high, the validator
uses GPT-6 Astra high, and the steward uses GPT-6.1 Sol medium. The director
may use Sol or Astra. Do not silently replace an unavailable role model.
Custom-agent sandbox values are role defaults rather than
hard isolation because the parent task's active permission mode can override or
constrain them. Start the director with workspace-write, enforce role boundaries
through instructions and diff review, and use narrow host approvals only for
required validation or authorized Git operations. Git remains idle while
source writing or validation is active.

## Director decision rules

Approve a refactor only for evidence of avoidable complexity, duplicated domain
logic, misleading names, mixed responsibilities, hidden side effects, unsafe
state transitions, or a concrete testing obstacle. Require the proposed result
to be easier to explain and no harder to verify.

Reject changes that merely:

- impose a personal style already handled by Prettier or ESLint;
- move code without clarifying ownership;
- introduce an abstraction for one speculative use;
- replace explicit domain terms with generic helpers;
- expand a public contract or dependency graph;
- rewrite tests to match accidental behavior;
- touch generated sources, frozen authority, benchmark evidence, or historical
  plans manually;
- combine unrelated cleanup.

Never trade away EPUB privacy, local-only inference, cancellation, bounded
queues or buffers, stable locators, narration synchronization, deterministic
normalization, content-free diagnostics, or generated-audio non-persistence.

## Close a package or campaign

After a coherent package group, satisfy its declared integration gates from
`$validate-safe-refactor`. Before final acceptance or a PR, satisfy the complete
applicable final gate outside the sandbox. Apply the canonical policy to reuse
or deduplicate proven identical gates, and report what actually ran. Required
integration and host cleanup must no longer be pending. Review the complete
diff against the base branch, scan for private data and prohibited artifacts,
update documentation only when behavior
or contributor workflow changed, and report skipped or blocked targets without
portraying them as defects.

Push and pull-request creation are separate remote mutations. Delegate either
to an available `git_steward`, or execute the order directly as director after a
recorded Git-steward availability failure, only when the user explicitly
authorizes it in the current task and the Git Action Order names the exact
remote, branch,
base, title, and draft state. The steward never merges or closes a pull request.
