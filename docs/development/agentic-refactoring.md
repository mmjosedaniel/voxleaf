# Agentic refactoring workflow

This workflow audits VoxLeaf TypeScript and TSX for concrete maintainability
problems without treating every file as defective or changing product behavior.
It is repository tooling for contributors; it is not part of the application
runtime and does not change the system diagram or product roadmap.

## Why the workflow is bounded

VoxLeaf currently has hundreds of TypeScript and TSX files. A literal
file-by-file rewrite would separate production files from their tests and
collaborators, create style-only churn, and make regressions difficult to
attribute. The workflow therefore audits every tracked target but implements
changes in cohesive units. A normal unit contains one production file, its
tests, and no more than two directly coupled support files.

An audit may correctly end in `SKIP`. The goal is evidence-backed readability,
not a changed line in every file.

## Roles

| Role | Configuration | Default model | Writes source? | Responsibility |
| --- | --- | --- | --- | --- |
| Director/orchestrator | Primary Codex task | GPT-6.1 Sol or GPT-6 Astra, selected in the UI | No source; Git only when the steward is unavailable | Own requirements, approve work and Git orders, review diffs, request corrections, and accept results |
| Auditor | `.codex/agents/clean-code-auditor.toml` | `gpt-6.1-sol`, high | Prohibited by role instructions | Inspect one cohesive unit and return evidence, invariants, risk, and a bounded proposal or skip |
| Worker | `.codex/agents/clean-code-worker.toml` | `gpt-6.1-sol`, high | Yes | Apply exactly one approved work order and return a Change Packet |
| Validator | `.codex/agents/refactor-validator.toml` | `gpt-6-astra`, high | Prohibited by role instructions | Establish the baseline, inspect the diff, and run focused plus risk-triggered gates outside the sandbox |
| Git steward, when available | `.codex/agents/git-steward.toml` | `gpt-6.1-sol`, medium | Git state only | Inspect Git and execute exact branch, staging, commit, push, or PR orders after authorization |

Start the primary director task with **workspace-write** permission. Custom
agent `sandbox_mode` values express safe role defaults, but they are not a
security boundary: the active parent permission mode can override or constrain
child agents. Auditor and validator non-editing behavior is therefore also an
explicit instruction and a director-reviewed invariant. Do not use full-access
mode for an ordinary campaign; request narrowly scoped host execution only for
the repository commands that require it.

The validator requests workspace-write because builds and tests may produce
bounded caches or artifacts. Its instructions still prohibit source, test,
documentation, configuration, and Git edits.

The project configuration permits up to four supporting threads. Spawn and
reuse one auditor, one worker, and one validator. Also spawn and reuse one Git
steward when the current Codex surface exposes that role. If it does not,
record the availability failure and let the director execute the same Git
Action Orders directly; do not silently substitute a different role model.
The workflow is sequential: Git remains idle while the worker writes or the validator runs, so
the thread limit does not authorize parallel mutations.

## Model selection and delegation

Choose `gpt-6.1-sol` or `gpt-6-astra` for the primary task in the composer.
The project does not pin the primary model, so either choice remains available.
Use Sol high for ordinary bounded work; consider Sol xhigh or Astra high when
cross-package contracts, cancellation, synchronization, or ambiguous evidence
need deeper review. These are starting settings, not measured quality claims.

The auditor and worker use Sol high. Independent validation uses Astra high;
its different model is not a substitute for tests or independent evidence.
The Git steward uses Sol medium because its orders are explicit and bounded.
Unnamed subagents default to Sol medium, but campaigns must select the named
roles to retain their instructions and model settings.

Do not silently replace an unavailable auditor, worker, or validator. Record
the unavailable role/model and obtain an explicit model decision. Only the
Git-steward fallback to the director is pre-authorized by this workflow.

At batch start, prefer fresh supporting-agent context when the client supports
it. Supply the unit ID, paths, invariants, and exact packet or order. Reuse each
role within the bounded batch, but require it to re-read current files between
units. Supporting agents may not delegate or inherit approval from a prior unit.
The director controls the four supporting slots and the sole active writer.

Compare correction count, elapsed time, and available usage data after real
batches before raising effort. No speed, cost, or quality improvement is claimed
solely from this model migration. Model IDs and per-role configuration follow
the [official subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Repository components

- `.codex/config.toml` enables a maximum of four supporting threads and sets a
  Sol medium default for unnamed subagents.
- `.codex/agents/clean-code-auditor.toml` defines the read-only audit role.
- `.codex/agents/clean-code-worker.toml` defines the sole writer role.
- `.codex/agents/refactor-validator.toml` defines the independent test gate.
- `.codex/agents/git-steward.toml` defines the Sol Git-only execution role.
- `$orchestrate-safe-refactor` owns inventory, delegation, work orders,
  correction loops, and completion policy.
- `$validate-safe-refactor` owns command routing and acceptance evidence.
- `.agents/PLANS.md` remains authoritative for deciding when a campaign needs an
  ExecPlan.

Codex detects repository skills and custom-agent files when a new task starts.
If an already-open task does not display them, start a new task or restart
Codex. Parsing TOML and reviewing the diff validate configuration only; they
do not prove the app loaded the new definitions or that either model executed.
Before a campaign, confirm the exposed roles match the table above.

## Safety model

The director must preserve these boundaries in every work order:

- no public behavior or serialized-contract change;
- no new dependency or lockfile change;
- no manual generated-source edit;
- no weakening, skipping, or deletion of tests to make a patch pass;
- no change to privacy, local-only inference, cancellation, bounded memory,
  stable EPUB locators, narration synchronization, persistence, or error
  semantics;
- no frozen evaluation authority, historical evidence, or completed ExecPlan
  rewrite;
- no books, generated audio, models, secrets, private paths, or content-bearing
  logs;
- no commit or push by an auditor, worker, or validator; the Git steward may do
  so only under an exact Git Action Order, with current user authorization for
  remote mutations;
- no second writer while the worker is active.

Prettier and ESLint own formatting. A preference such as shorter functions,
fewer files, more helpers, or a different naming style is not sufficient
evidence by itself.

## Operating sequence

1. On a clean worktree, have the available Git steward execute separate `SETUP`
   Git Action Orders for fast-forwarding `main` and then creating the dedicated
   campaign branch. If the steward is unavailable, the director executes the
   same orders.
2. For a broad or multi-package campaign, create an ExecPlan following
   `.agents/PLANS.md`.
3. Build the tracked inventory with
   `git ls-files -- "*.ts" "*.tsx"` and record each path as pending.
4. Mark generated files as excluded from manual edits. Group implementation
   and test files into cohesive units.
5. Give one raw unit to the auditor. Do not tell it which change the director
   expects; this protects the audit from confirmation bias.
6. Accept `SKIP`, stop on `BLOCKED`, or convert an evidence-backed `CHANGE` into
   draft work-order terms using the skill contract.
7. Have the validator establish the relevant baseline in local PowerShell
   outside the sandbox. If it passes, freeze the immutable APPROVED WORK ORDER
   with that baseline report and outcome. If it does not pass, do not issue the
   work order.
8. Let exactly one worker implement the frozen order.
9. Have the validator inspect the patch and rerun the same tests plus the
   required risk-triggered gates.
10. Let the director review the diff and validation report. It may accept
    the unit or issue one exact correction order. After two failed correction
    loops, redesign the work order.
11. Confirm the Git index and every allowlisted worktree path were clean before
    the unit. Copy the accepted POST-CHANGE Report ID, HEAD, closed allowlist, and
    exact validated path identities into a Git Action Order for the idle steward,
    or for the director after a recorded steward availability failure. The executor stages only the allowlisted paths,
    checks report/order/live identity agreement, verifies the staged identities
    and diff, commits the accepted unit, and returns
    a Git Report. The director reviews the report and confirms the index is
    empty. If a patch is rejected or abandoned, stop until only its verified
    worker-authored hunks are removed; never continue with that diff
    contaminating another unit.
12. Run a broader package gate after a package group and the complete applicable
    repository gate before the PR.

## Approval applies to one validated state

Every Validation Report has a unique ID and records HEAD plus the closed path
identity manifest before acceptance commands. The validator rechecks both after
the commands; identity drift is BLOCKED even if the commands passed. A later
edit or changed HEAD requires a new report and rerunning the required acceptance
commands. The director and Git steward cannot renew PASS by replacing hashes.

The Git steward compares the immutable report, order, and current files before
staging, then rechecks validated content and staged blobs before commit. It
stops on a mismatch without committing or discarding staged/user work. Detailed
fields, deletion/addition handling, and phase rules live in the
[agent contracts](../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md#validation-report).

## Durable traceability

Chat history, task commentary, and uncommitted agent packets are not durable
repository authority. Every refactor campaign that requires an ExecPlan must
keep a content-safe summary for each accepted unit in that active plan before
the unit is committed. Record:

- the target ID, audit decision, risk, exact allowlist, behavior invariants, and
  diff ceiling from the accepted Audit Packet;
- the baseline report identifier, exact commands, environment, and outcome;
- the frozen Approved Work Order goal and required transformations;
- the immutable post-change Report ID, validated HEAD/path identities,
  identity recheck, validation verdict, and any correction loop;
- the accepted commit identity and broader package/final gate outcomes; and
- the next inventory position, including skipped and blocked units.

Do not paste private content, complete chat transcripts, or dynamic book/model
data into the plan. The exact conversational packet may remain task-local, but
the repository summary must be sufficient for a later Codex task to understand
what was authorized and validated without relying on that conversation. Keep
this evidence outside its own validated-path manifest. Write the summary before
the source commit, leave it unstaged, then commit evidence-only plan updates
separately under their own order after the source commit. Never append an
unvalidated plan edit to the accepted source commit. Changes to a plan already included
in a work order invalidate that report just like source changes.

One genuinely isolated unit that does not meet `.agents/PLANS.md` criteria may
rely on its focused commit, tests, and pull-request review. Multiple units,
multiple packages, or a staged campaign require the ExecPlan first; creating a
retrospective plan may recover observed evidence but cannot fabricate a missing
baseline or historical approval.

Do not attempt all files in one task. A practical task audits at most 20 paths
or completes at most three accepted change batches. This preserves review
quality and keeps each task resumable from the ExecPlan.

## Recommended director prompt

Select **GPT-6.1 Sol High** in the task composer for a normal batch. Use
**GPT-6 Astra High** for difficult cross-package planning or review. Then copy
this prompt and replace the two bracketed values:

```text
Use $orchestrate-safe-refactor as the controlling workflow.

Act as the director/orchestrator for a behavior-preserving VoxLeaf TypeScript
maintainability campaign.

Scope: [for example: packages/shared/src]
Batch limit: [for example: audit at most 20 paths and accept at most 3 change units]

Read AGENTS.md, .agents/PLANS.md, docs/README.md, and the relevant product,
architecture, and testing documentation before acting. If this scope qualifies
as a significant or multi-stage refactor, create or update an ExecPlan before
any source edit.

Build the tracked .ts/.tsx inventory for this scope. Audit every target but do
not force a change. Generated files must be recorded and excluded from manual
editing. Treat one production file, its tests, and at most two directly coupled
support files as one cohesive unit.

For each unit, proceed sequentially:
1. Delegate a raw, read-only audit to clean_code_auditor and require the exact
   Audit Packet contract.
2. Independently evaluate its evidence. Accept SKIP when no concrete benefit
   exists. Stop on BLOCKED when product or architecture authority is required.
3. For an accepted CHANGE, draft exact files, symbols, invariants, forbidden
   changes, diff ceiling, and existing repository validation commands, but do
   not freeze the work order yet.
4. Have refactor_validator run the baseline outside the sandbox. Do not edit on
   a relevant baseline failure. After a passing baseline, issue the immutable
   APPROVED WORK ORDER including the baseline report identifier and outcome.
5. Start exactly one clean_code_worker. No other agent or the director may edit
   concurrently. The worker must not commit or push.
6. Have refactor_validator inspect the diff and run post-change validation
   outside the sandbox using $validate-safe-refactor.
7. Review the diff yourself as director. Accept only a PASS report with preserved
   behavior and a clearer implementation. Otherwise issue one precise
   Correction Order to the same worker; allow at most two correction loops.
8. Require an empty Git index and clean allowlisted worktree paths at unit
   start. After accepting the unit, issue an exact GIT ACTION ORDER to
   git_steward when available; otherwise record that and have the director execute
   it directly. Bind the order to the immutable POST-CHANGE Report ID and copy
   its HEAD, validated paths, and identities. Require report/order/live agreement;
   any drift needs a new validation report, never refreshed approval hashes.
   Require literal allowlisted staging, identity and staged-diff inspection, the
   approved commit message, and a Git Report. Review that report as director and
   update the campaign record. Never begin another unit while an unaccepted
   patch remains.

Do not change runtime behavior, public contracts, dependencies, generated
sources, frozen authority, privacy, cancellation, bounded-resource behavior,
stable locators, narration synchronization, persistence, or error semantics.
Do not weaken tests or perform unrelated cleanup. No supporting role other than
an available git_steward may mutate Git. It may act only under an exact
director-issued Git Action Order; if the steward is unavailable, the director
executes the same order directly. Push or PR creation additionally needs my explicit
authorization in the current task.

Run no more than the stated batch limit in this task. Finish with the audited,
changed, skipped, blocked, and excluded targets; commits; exact host validation
commands and outcomes; remaining risks; and the next queue position. Do not
push or create a PR unless I explicitly request it.
```

## First use

Use the first task only to inventory and plan one package. A sensible starting
scope is `packages/shared/src` because it is smaller than the desktop surface,
but its contracts are high impact: consider Astra high for the initial plan
and require all generated contract files to remain excluded. Begin implementation in a
separate task using Sol high and a three-unit limit.

After one or two real batches, review where the agents produced unnecessary
work or missed context. Update the skills from observed friction rather than
adding speculative rules.
