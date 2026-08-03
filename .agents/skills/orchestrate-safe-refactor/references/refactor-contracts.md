# Refactor agent contracts

Use these schemas verbatim so the director can compare agents without relying
on conversational assumptions.

## Audit Packet

```text
# Audit Packet
Target ID: <stable queue identifier>
Decision: CHANGE | SKIP | BLOCKED
Risk: low | medium | high
Primary target: <path and symbols>
Related context: <tests and direct collaborators>
Concrete evidence: <specific maintainability problem or why no change is useful>
Behavior invariants: <observable behavior that must remain unchanged>
Allowed files: <closed list>
Proposed edits: <bounded symbol-level operations>
Forbidden edits: <contracts, dependencies, behavior, generated files, etc.>
Diff ceiling: <files and approximate changed lines>
Baseline commands: <existing repository commands>
Post-change commands: <same commands plus justified additions>
Documentation impact: none | <specific document>
Decision required: none | <exact user or architecture decision>
```

`SKIP` is a successful audit result. It must state why changing the unit would
be subjective, duplicative, or riskier than retaining it. `BLOCKED` must name a
decision that clean-code authority cannot make.

## Draft work-order terms

The director derives the proposed allowlist, operations, invariants, ceiling,
and commands from an accepted Audit Packet. These terms remain a draft while
the validator establishes the baseline. They must not be sent to the worker.

If the baseline passes, copy the terms into the immutable Approved Work Order
below and add the completed baseline evidence. If the baseline does not pass,
do not issue an Approved Work Order.

## Approved Work Order

The director creates and freezes this only after accepting an Audit Packet and
receiving a passing baseline Validation Report.

```text
# APPROVED WORK ORDER
Target ID: <same identifier>
Goal: <one behavior-preserving maintainability outcome>
Risk: low | medium | high
Allowed files: <closed list>
Required edits:
1. <file, symbol, exact transformation>
Behavior invariants:
1. <observable invariant>
Forbidden changes:
1. <explicit boundary>
Diff ceiling: <maximum files and approximate changed lines>
Baseline evidence: <validator report identifier and outcome>
Worker validation: <optional cheap command or none>
Acceptance commands: <closed command list>
Completion output: Change Packet only; no commit or push
```

The worker must stop if required work exceeds the ceiling, touches another file,
or reveals a behavior change. The director must issue a new order rather than
letting scope grow implicitly.

## Change Packet

```text
# Change Packet
Target ID: <same identifier>
Files changed: <exact paths>
Symbols changed: <exact names>
Required edit mapping: <each work-order item to its implementation>
Invariants preserved: <how the patch preserves each invariant>
Tests changed: none | <tests and why assertions remain equivalent>
Deviations: none | <unfulfilled or expanded item>
Remaining validation: <commands not yet run>
```

Any undeclared deviation prevents validation from returning `PASS`.

If a Change Packet or Validation Report is rejected, no later unit may begin
while its patch remains in the shared worktree. The director may request a
correction or remove only verified worker-authored hunks. It must never use a
broad restoration command that could discard pre-existing user work.

## Validation Report

```text
# Validation Report
Target ID: <same identifier>
Mode: BASELINE | POST-CHANGE | PACKAGE | FINAL
Verdict: PASS | FAIL | BLOCKED | BASELINE-FAIL
Environment: local PowerShell outside sandbox | exploratory sandbox
Commands and outcomes:
1. <exact command> -> <exit status and concise result>
Diff scope: PASS | FAIL, <reason>
Invariant review: PASS | FAIL, <reason>
Test-integrity review: PASS | FAIL, <reason>
Privacy/artifact review: PASS | FAIL, <reason>
Action required: none | <smallest precise correction>
```

Only a local PowerShell report can be final acceptance evidence. Never turn a
sandbox denial into a candidate, implementation, or test rejection.

## Correction Order

```text
# CORRECTION ORDER
Target ID: <same identifier>
Failed criterion: <one work-order or validation criterion>
Evidence: <diff line, failing assertion, or exact command output>
Required correction: <precise bounded edit>
Allowed files: <same or narrower list>
Forbidden changes: <restated critical boundaries>
Revalidation: <exact commands>
```

Do not bundle multiple unrelated review preferences into one correction.

## Git Action Order

The Sol director issues this only while every source writer and validator is
idle. Read-only Git inspection does not need an order; every Git mutation does.
A `SETUP` order may precede validation and is limited to one clean-state update
or branch action. An `ACCEPTED-CHANGE` order requires an accepted Validation
Report. A `REMOTE-HANDOFF` order requires final validation plus explicit
current-task user authorization.

```text
# GIT ACTION ORDER
Order ID: <stable identifier>
Target ID: <accepted unit or campaign identifier>
Phase: SETUP | ACCEPTED-CHANGE | REMOTE-HANDOFF
Ordered actions: <ordered list drawn from UPDATE-MAIN-FF, CREATE-BRANCH,
SWITCH-BRANCH, STAGE, COMMIT, PUSH, OPEN-PR>
Expected current branch: <exact branch>
Expected HEAD SHA: <full commit SHA>
Target branch and base: <exact values or none>
Clean-state evidence: <empty index; SETUP also requires a clean worktree>
Allowed paths: <closed literal list or none>
Approved path identities: <for every allowed path, exact porcelain status,
worktree SHA-256, and filter-aware expected index blob ID, or DELETED>
Validation evidence: <accepted report identifier and verdict or
not-applicable-for-setup>
Commit message: <exact message or none>
Remote target: <exact remote and branch or none>
Pull request: <exact title, base, body source, and draft state or none>
Current user authorization: none-required | <quoted current-task authorization>
Forbidden operations: reset, clean, restore, path checkout, stash, rebase,
merge, cherry-pick, amend, force-push, branch/tag deletion, PR merge/close
Completion output: Git Report only
```

Use separate SETUP orders for `UPDATE-MAIN-FF` and branch creation: Sol reviews
the first Git Report and uses its ending HEAD as the second order's expected
HEAD. `STAGE` and `COMMIT` may appear together as the ordered list
`[STAGE, COMMIT]`; the steward must stop before the second action if the first
does not pass every staged review.

Immediately before mutation, recompute the full HEAD SHA and each approved path
identity. For an existing path,
`Get-FileHash -Algorithm SHA256 -LiteralPath <path>` binds the exact worktree
bytes, while `git hash-object --path=<path> -- <path>` computes the blob Git
should stage after repository filters. Use
`DELETED` only when the approved path is absent. Include the exact porcelain
status so additions, modifications, deletions, and renames cannot be confused.
After staging, compare index blob IDs and staged status to the expected index
identities, then recheck HEAD immediately before committing.

`PUSH` and `OPEN-PR` require quoted current-task user authorization. An earlier
general preference or repository instruction is not sufficient. A HEAD,
branch, allowlist, path-identity, validation, or status mismatch returns
`BLOCKED` without mutation.

## Git Report

```text
# Git Report
Order ID: <same identifier>
Verdict: PASS | BLOCKED | FAIL
Starting branch and status: <exact evidence>
Starting HEAD SHA: <full commit SHA>
Commands and outcomes: <exact commands without secrets>
Staged paths: <exact paths or none>
Path identity review: PASS | FAIL | not-applicable
Staged review: PASS | FAIL | not-applicable
Validation evidence consumed: <identifier and verdict>
Commit: <SHA and subject or none>
Remote result: <push or PR URL/result or none>
Ending branch and status: <exact evidence>
Ending HEAD SHA: <full commit SHA>
Deviations or blockers: none | <exact mismatch>
```

The director must review the Git Report before another worker or Git mutation
starts. The steward cannot accept its own report or broaden the order.
