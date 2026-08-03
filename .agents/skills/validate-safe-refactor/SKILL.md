---
name: validate-safe-refactor
description: Establish a pre-change baseline and independently validate a bounded VoxLeaf TypeScript or TSX refactor. Use after an approved clean-code work order, before and after edits, when selecting focused tests, or when determining whether a readability change preserved behavior and repository safety.
---

# Validate a safe refactor

Act as an independent gate. Do not repair code, modify tests, format files,
update snapshots, or change Git history while validating.

## Required context

1. Read `AGENTS.md`. In baseline mode, read the accepted Audit Packet and draft
   work-order terms. In post-change mode, read the frozen Approved Work Order.
2. Read [references/validation-matrix.md](references/validation-matrix.md)
   completely.
3. Read the target diff, affected tests, and direct public contracts.
4. Use the Validation Report schema in
   `$orchestrate-safe-refactor`'s `references/refactor-contracts.md`.

## Baseline mode

Confirm that the Git index contains no staged changes and that every proposed
allowlisted path has no pre-existing worktree change before the unit starts. If
either check fails, return `BLOCKED`; do not disturb the user's work.

Run the smallest applicable package test and typecheck commands before edits.
Record exact commands and outcomes. If a relevant command already fails, return
`BASELINE-FAIL`; do not let later work claim the failure as a regression or fix
it opportunistically.

## Post-change mode

1. Confirm only work-order files changed and the diff stays below its ceiling.
2. Reject manual generated-source changes, dependency changes, weakened tests,
   unrelated formatting, public-contract drift, or private/prohibited artifacts.
3. Compare the diff against every named behavior invariant.
4. Run the same baseline commands.
5. Add only the risk-triggered gates required by the validation matrix.
6. Run final acceptance commands in normal local PowerShell outside the managed
   sandbox. Repeat any exploratory sandbox command unchanged on the host.
7. Return `PASS` only when scope, invariants, test integrity, privacy, artifacts,
   and all required commands pass.

Post-change `PASS` authorizes staging; it does not authorize a broad `git add`.
The director must stage only allowlisted paths and inspect the staged path list
and staged diff before committing. If validation fails, later work stays
blocked until the unaccepted patch is corrected or its verified worker-authored
hunks are removed.

## Package and final modes

Use package mode after several accepted units in one package. Use final mode
before a PR. Do not substitute a portable check for a required native Windows,
WebView2, GPU, model, firewall, performance, or exact-host gate.

When validation fails, identify the smallest correction and return control to
the director. Never instruct the validator itself to edit the patch.
