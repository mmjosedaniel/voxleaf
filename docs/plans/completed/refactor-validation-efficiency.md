# Refactor validation efficiency

## Goal

Reduce avoidable preparation, repeated validation and instruction drift while
preserving independent acceptance and all applicable product safeguards.

## User-visible outcome

Future refactor tasks select checks before editing, catch cheap failures before
packaging, and reuse only independently verified unchanged evidence. This changes
contributor workflow, not VoxLeaf behavior. No measured speedup is claimed yet.

## Current state

The starting main commit is `c9a2b522a5ce632a5f0543cb4ff7b12ab08a8ab5`.
The clean branch is `codex/refactor-validation-efficiency`. The existing skills
are TypeScript-specific, repeat acceptance rules across files, and require
rerunning commands without specifying input-based invalidation. Worker checks
are limited to optional syntax/diff checks. Recent Python refactoring exposed
late formatting failures and expensive preparation/runner retries.

## Scope and non-goals

Update AGENTS.md, .agents/PLANS.md, both refactor skills, their contracts and
validation matrix, orchestrator UI metadata, three audit/worker/validator role
files, the contributor guide and documentation/plan indexes. Add a canonical
validation policy and a compact batch-record template. The active plan moves
to completed after acceptance; both paths were included in the baseline.

Closed baseline allowlist (18 paths):

```text
AGENTS.md
.agents/PLANS.md
.agents/skills/orchestrate-safe-refactor/SKILL.md
.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md
.agents/skills/orchestrate-safe-refactor/agents/openai.yaml
.agents/skills/validate-safe-refactor/SKILL.md
.agents/skills/validate-safe-refactor/references/validation-matrix.md
.agents/skills/validate-safe-refactor/references/validation-policy.md
.agents/skills/validate-safe-refactor/references/validation-record.md
.codex/agents/clean-code-auditor.toml
.codex/agents/clean-code-worker.toml
.codex/agents/refactor-validator.toml
docs/development/agentic-refactoring.md
docs/README.md
docs/plans/active/README.md
docs/plans/completed/README.md
docs/plans/active/refactor-validation-efficiency.md
docs/plans/completed/refactor-validation-efficiency.md
```

The final order narrows this to 16 changed paths: exclude the unchanged active
index and the never-tracked active plan location. No absent path is represented
as a tracked deletion or included in staging authority.

No product sources, tests, dependencies, model settings, concurrency limits,
historical plans, receipts, runtime runners or CI requirements change. Runner
hardening is specified as a requirement for future affected work; this task
does not implement a generic execution framework or claim new runner features.

## Relevant files and documentation

- [Contributor guide](../../development/agentic-refactoring.md).
- [Plan rules](../../../.agents/PLANS.md).
- [Contracts](../../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md).
- [Validation matrix](../../../.agents/skills/validate-safe-refactor/references/validation-matrix.md).
- [Validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md).
- [Batch record](../../../.agents/skills/validate-safe-refactor/references/validation-record.md).
- [Evidence retention](../../development/evidence-retention.md).

## Architecture and constraints

The product requirements, overview and canonical system diagram were inspected;
no application boundary or runtime flow changes, so no diagram/ADR update is
needed. Preserve local inference, EPUB privacy, cancellation, bounded memory,
stable locators, synchronization and audio non-persistence. Keep host-only
acceptance, independent validation, immutable reports and exact Git identities.

## Milestones

1. Complete: inspect current rules, create the authorized branch and establish
   independent baseline `RVE-BASELINE-20261016-01` (PASS).
2. Complete: centralize risk, gate dependencies, selective revalidation,
   batching, fast checks, preparation, bounded retries and cleanup policy.
3. Complete: independently review realistic policy scenarios, validate syntax
   and links, and archive this plan. The authorized local commit requires a
   current report on the final documentation state; no push or PR is authorized.

The approved documentation work order permits the 18 baseline paths, at most
1400 changed lines, with the primary agent as sole policy writer. No application
refactor is performed. The independent validator evaluates this task using the
pre-change acceptance discipline; the new policy cannot approve itself.

## Testing and benchmark strategy

| Gate | Timing and purpose | Inputs / invalidation |
| --- | --- | --- |
| Both skill-creator quick_validate.py invocations | Baseline and final; skill frontmatter | Each SKILL.md and validator/interpreter |
| Python tomllib and PyYAML parsing | Baseline and final; three role TOMLs and two UI YAML files | Those configurations and installed parsers |
| Local link/command/consistency inspection | After edits; coherent instructions and real repository commands | All changed docs, referenced files and package scripts |
| Independent scenario review | After edits; safe routing, reuse, retry and acceptance choices | Entire policy patch |
| git diff --check and identity manifest | Baseline, final and pre-commit; whitespace, exact scope and immutable evidence | HEAD, closed allowlist and worktree/index content |

All acceptance commands run from normal local PowerShell outside the sandbox.
No dependency installation is needed. Application, model and packaging suites
are not applicable to this documentation/configuration-only change. They are
neither skipped product acceptance nor claimed as executed. No host resources
are mutated, so runtime cleanup and model preparation are not applicable.

## Risks and rollback

The principal risk is letting reuse or batch acceptance conceal a regression.
Require complete dependency/environment proof, new independent reports after
drift, unit gates for high-risk changes, explicit pending integration and
fail-closed handling of unknown inputs. Check instructions for contradictions.
Revert this focused policy commit if adoption exposes a gap; never rewrite
historical evidence or relax protected CI checks.

## Progress log

- 2026-10-16: created branch from clean main. Independent baseline passed both
  skill validators, three TOML/two YAML parsers and whitespace/identity checks.
  Installed Python 3.12 and PyYAML were used without adding dependencies.
- 2026-10-16: selected a documentation/configuration-only implementation and
  a compact reusable record, avoiding an unneeded generic runner framework.
- 2026-10-16: independent policy review passed 12 scenarios, both skill checks,
  three TOML/two YAML parsers, 250 local links and 24 documented commands on the
  active-plan state. No policy-content correction was requested.
- 2026-10-16: intermediate report `RVE-POST-CHANGE-20261016-01` retained BLOCKED
  staging status solely because the broad order still included the absent
  future completed-plan path. Archived the plan and narrowed the final order;
  the final report must independently check these exact files before commit.

## Discoveries and decisions

- Separate implementation-unit acceptance from final integration acceptance.
- Separate immutable report freshness from reuse of an unchanged gate result.
- Keep the current role models, single-writer limit and Git authorization.
- Treat preparation/cleanup failures separately from product assertions.
- Link canonical rules instead of duplicating them in role prompts.

## Final validation results

The baseline and independent policy/content checks passed on the host. Exact
skill commands, each exiting 0:

```powershell
python "$env:USERPROFILE/.codex/skills/.system/skill-creator/scripts/quick_validate.py" .agents/skills/orchestrate-safe-refactor
python "$env:USERPROFILE/.codex/skills/.system/skill-creator/scripts/quick_validate.py" .agents/skills/validate-safe-refactor
git diff --check
```

The baseline's inline Python parser was rerun unchanged using Python 3.12,
tomllib and existing PyYAML: three role TOMLs and both skill UI YAML files
parsed. Independent read-only checks resolved local links/headings, matched
matrix commands to package scripts, and confirmed unchanged role models,
efforts and sandbox settings. All checks ran outside the automation sandbox;
no old result replaced an execution in this task.

The 12 independently evaluated scenarios covered pure Python helpers, lifecycle
callers, early format failure, documentation drift, lock/test/runner/import
changes, new glob inputs, host drift, pending integration, aggregate overlap,
bounded retries, interrupted cleanup and unrequested Git actions. Each retained
the required evidence/authorization boundary. No runtime tests were applicable.

The immutable intermediate report discloses a baseline UI-blob transcription
error and cites the original captured value; it does not alter the original
report or invent a new pre-edit baseline. The final staging report is produced
after this documentation freeze and supplied with the exact Git order; keeping
that manifest outside the validated files avoids self-referential hashes.

This validates contributor instructions and configuration, not automatic agent
compliance, newly loaded role definitions, application behavior or measured
time savings. Measure phase costs and retries in subsequent real batches.
