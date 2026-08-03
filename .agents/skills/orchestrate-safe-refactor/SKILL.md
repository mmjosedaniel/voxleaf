---
name: orchestrate-safe-refactor
description: Direct a systematic, behavior-preserving VoxLeaf clean-code or readability review across TypeScript and TSX files. Use when auditing many files, reducing maintainability problems, coordinating a director with auditor, worker, validator, and Git-steward subagents, or executing a bounded refactor campaign without changing product behavior.
---

# Orchestrate a safe refactor

Use the primary thread as the director. Delegate evidence gathering to
`clean_code_auditor`, implementation to `clean_code_worker`, and baseline plus
post-change acceptance to `refactor_validator`. Prefer to delegate ordered
Git-only mutations to `git_steward`; if the current surface cannot spawn Luna,
record that limitation and have the Sol director execute the identical Git
Action Order directly. Never run a source writer and Git mutation at the same
time.

## Required context

1. Read `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`, and relevant product,
   architecture, and test documentation.
2. Read [references/refactor-contracts.md](references/refactor-contracts.md)
   completely before issuing an Audit Packet or Work Order.
3. Use separate `SETUP` Git Action Orders to update clean `main` by fast-forward
   and create a dedicated branch with a known HEAD. These orders may precede
   validation. Start source work with an empty Git index. Every path proposed
   for the unit allowlist must also have no pre-existing worktree change.
   Preserve unrelated unstaged user changes outside the allowlist and stop on
   overlap.
4. Create an ExecPlan before a multi-package campaign, significant refactor, or
   work expected to span multiple batches. Record every target as audited,
   changed, skipped, blocked, or excluded.

## Define the inventory

Build the current tracked inventory with:

```powershell
git ls-files -- "*.ts" "*.tsx"
```

Audit all listed paths, but do not force all paths to change. Apply these
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
review misleading.

## Run one batch

1. Ask `clean_code_auditor` to inspect one raw target unit without providing a
   desired fix. Require an Audit Packet.
2. Review the evidence. Accept `SKIP` when no concrete problem exists. Escalate
   `BLOCKED` when behavior, architecture, or product authority must change.
3. Convert an accepted `CHANGE` packet into draft work-order terms. Name exact
   files, symbols, behavior invariants, forbidden changes, diff ceiling,
   baseline commands, and post-change commands, but do not freeze the order.
4. Ask `refactor_validator` for baseline mode. Do not edit when the baseline is
   failing for a relevant reason; record `BASELINE-FAIL` separately. After a
   passing baseline, issue the immutable APPROVED WORK ORDER and include the
   baseline report identifier and outcome.
5. Start exactly one `clean_code_worker`. Pass only the frozen work order and
   necessary source context. Do not let the director or another agent write
   concurrently.
6. Inspect the Change Packet and diff. Reject scope expansion before testing.
7. Ask `refactor_validator` for post-change mode using the same baseline
   commands plus risk-triggered gates from `$validate-safe-refactor`.
8. Review correctness, tests, and readability as director. Accept only when the
   Validation Report is `PASS` and every invariant is demonstrably preserved.
9. When correction is needed, send one precise Correction Order to the same
   worker. Permit at most two correction loops; after that, stop and redesign
   the work order instead of accumulating patches. Do not start another unit
   until the rejected patch is absent. Remove only verified worker-authored
   hunks; never discard overlapping user changes.
10. Confirm the index is still empty and that the only changes in allowlisted
    paths are the reviewed worker patch. Bind the order to the current HEAD and
    exact approved path identities, then issue a GIT ACTION ORDER to the idle
    `git_steward` using the contract in the reference file. If Luna was recorded
    unavailable at campaign start, Sol executes that order directly. Require
    exact-path staging, staged path and diff inspection, the approved commit
    message, and a Git Report. Review the report, confirm the index is empty
    again, update the ExecPlan or inventory record, then continue.

Create one auditor, one worker, and one validator task per campaign batch and
reuse those role tasks for every unit. Also create and reuse one Git-steward
task when `gpt-5.6-luna` is exposed to subagents. Do not silently replace it
with another model. Custom-agent sandbox values are role defaults rather than
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

After a coherent package group, run the broader package gate from
`$validate-safe-refactor`. Before a PR, run the repository-required final gate
outside the sandbox, review the complete diff against the base branch, scan for
private data and prohibited artifacts, update documentation only when behavior
or contributor workflow changed, and report skipped or blocked targets without
portraying them as defects.

Push and pull-request creation are separate remote mutations. Delegate either
to an available `git_steward`, or execute the order directly as Sol after a
recorded Luna availability failure, only when the user explicitly authorizes it
in the current task and the Git Action Order names the exact remote, branch,
base, title, and draft state. The steward never merges or closes a pull request.
