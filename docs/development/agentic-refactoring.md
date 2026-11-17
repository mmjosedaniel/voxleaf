# Agentic refactoring workflow

This workflow audits VoxLeaf TypeScript, TSX, Python and Rust for concrete maintainability
problems without treating every file as defective or changing product behavior.
It is repository tooling for contributors; it is not part of the application
runtime and does not change the system diagram or product roadmap.

Features and behavioral bug fixes use the separate
[independent change review](agentic-change-review.md) workflow. Its
`change_reviewer` does not replace this campaign's `refactor_validator` and is
not an additional mandatory role for behavior-preserving units.

## Selecting the workflow

An isolated obvious fix follows the feature/bug workflow and the planning
exceptions in [PLANS.md](../../.agents/PLANS.md); behavioral review still applies.
An isolated refactor may use the existing unit guidance under
[Durable traceability](#durable-traceability). A multi-file maintainability
campaign follows this document's complete audit, baseline, worker and validation
sequence. Do not relabel a campaign as isolated work to bypass those gates.
Maintainer CLI behavior changes use independent change review, not the
behavior-preserving refactor worker. Select checks by affected responsibilities
using existing policy; measure actual friction before changing the process.

## Evidence storage

Use [evidence retention](evidence-retention.md) for concise immutable packets/reports, source identities, raw captures and archive/recovery records. Reference these from the plan; do not duplicate logs or manifests. Existing `check` and `check:portable` include the evidence guard and its tests.

## Why the workflow is bounded

Audit tracked targets without presuming a defect; `SKIP` is a successful outcome. Implement cohesive units, normally one production file, its tests and at most two coupled support files. File-by-file rewriting and stylistic preferences do not justify a change.

## Roles

| Role | Model configuration | Responsibility |
| --- | --- | --- |
| Director | Primary chat, selected in the composer | Own requirements and orders, review diffs and accept results. The director may execute Git orders only when the steward is unavailable. |
| Auditor | [clean_code_auditor](../../.codex/agents/clean-code-auditor.toml) | Inspect one unit and return evidence, invariants, risk and a bounded proposal or skip. |
| Worker | [clean_code_worker](../../.codex/agents/clean-code-worker.toml) | Make the source edits under one approved work order and return a Change Packet. |
| Validator | [refactor_validator](../../.codex/agents/refactor-validator.toml) | Establish the baseline, inspect the diff and execute focused and risk-triggered host checks. |
| Git steward | [git_steward](../../.codex/agents/git-steward.toml) | Mutate Git only under exact authorized orders. |

Start a campaign in **workspace-write** on the parent. Children inherit its
sandbox and approvals. A role's `sandbox_mode` entry cannot override them.
The auditor and validator follow explicit prohibitions on editing the evaluated
files. The validator may produce bounded test outputs and immutable receipts.
Request narrow host execution for the repository commands that need it.

The project configuration permits up to four supporting threads. Spawn and
reuse one auditor, one worker, and one validator. Also spawn and reuse one Git
steward when the current Codex surface exposes that role. If it does not,
record the availability failure and let the director execute the same Git
Action Orders directly; do not silently substitute a different role model.
The workflow is sequential: Git remains idle while the worker writes or the validator runs, so
the thread limit does not authorize parallel mutations.

## Model selection and delegation

Use the [task reading routes](../README.md#task-reading-routes) to select the
primary model. The [project configuration](../../.codex/config.toml) sets the
default model and effort for unnamed helpers. Select the named campaign roles
to load their individual pins and instructions. Feature and bug acceptance uses
the separate [change reviewer](../../.codex/agents/change-reviewer.toml).

Do not silently replace an unavailable auditor, worker, or validator. Record
the unavailable role/model and obtain an explicit model decision. Only the
Git-steward fallback to the director is pre-authorized by this workflow.

At batch start, prefer fresh supporting-agent context when the client supports
it. Supply the unit ID, paths, invariants, and exact packet or order. Reuse each
role within the bounded batch, but require it to re-read current files between
units. Supporting agents may not delegate or inherit approval from a prior unit.
The director controls the four supporting slots and the sole active writer.

Before tuning effort or concurrency, compare representative work at the same
effort on identical inputs. Withhold historical verdicts during a replay.
Record missed defects, false alarms, correction rounds, elapsed time and usage
when available. [Codex subagent configuration](https://learn.chatgpt.com/docs/agent-configuration/subagents#custom-agents)

## Repository components

The role configurations above define agent settings. [$orchestrate-safe-refactor](../../.agents/skills/orchestrate-safe-refactor/SKILL.md) owns inventory, delegation, orders and correction loops. [$validate-safe-refactor](../../.agents/skills/validate-safe-refactor/SKILL.md) owns acceptance, with the [validation policy](../../.agents/skills/validate-safe-refactor/references/validation-policy.md) for risk/reuse/preparation/retries and [matrix](../../.agents/skills/validate-safe-refactor/references/validation-matrix.md) for gates. [Contracts](../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md) own report identity and Git orders; [PLANS.md](../../.agents/PLANS.md) owns planning requirements.

Confirm roles exposed by the current session before a campaign. If definitions are stale, start a fresh project task or restart the client. Parsing configuration proves neither that the app loaded it nor that a model executed.

## Safety model

Apply the [orchestrator decision rules](../../.agents/skills/orchestrate-safe-refactor/SKILL.md#director-decision-rules) and [work-order contract](../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md#approved-work-order). Preserve behavior, public/serialized contracts, dependencies, tests, generated/frozen/history boundaries and all product/privacy invariants. Only the worker writes source; only currently authorized Git orders may mutate Git while writers/validation are idle. Formatting belongs to Prettier/ESLint, not subjective refactor findings.

## Operating sequence

Follow the orchestrator's [batch sequence](../../.agents/skills/orchestrate-safe-refactor/SKILL.md#run-one-batch): inventory and audit, draft terms, independent pre-edit baseline, frozen order, sole-worker implementation/fast checks, independent post-change validation, bounded corrections, and authorized Git handoff. Select unit versus batch gates before edits; high-risk unit gates cannot wait, and pending combined gates or host restoration prevent final acceptance.

Use the [compact batch record](../../.agents/skills/validate-safe-refactor/references/validation-record.md) for task-specific dependencies and results. It is not a runner. Existing runners execute checks; missing diagnostics or unsafe cleanup require an approved, tested bounded runner change. No retrospective baseline, rejected-patch carryover or automatic Git permission.

## Approval applies to one validated state

The [identity contract](../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md#validation-identity-and-freshness) binds each immutable report to HEAD, paths and exact identities. Drift requires new independent assessment; nobody may refresh hashes to renew approval. [Gate reuse](../../.agents/skills/validate-safe-refactor/references/validation-policy.md#revalidate-changed-evidence-not-everything-by-default) needs complete input/environment proof. A changed runner invalidates its receipts even when production bytes match. The Git steward compares report, order and live/staged identities.

## Durable traceability

Keep task-specific scope, invariants, decisions, baseline/post-change report links, corrections, authorized commits and pending gates in the ExecPlan. Apply [retention](evidence-retention.md); freeze documentation before its review and keep identity evidence outside its own inputs. Refactor evidence-only changes retain their own review and Git order; do not append unvalidated documentation to accepted source.

An isolated unit may rely on its focused commit, tests and review when no ExecPlan is required. A practical task audits at most 20 paths or completes at most three accepted change batches; record the next queue position.

## Recommended director prompt

```text
Use $orchestrate-safe-refactor and $validate-safe-refactor.
Scope: [exact paths]. Batch limit: [targets/units].
Authorized Git actions: [none or explicitly authorized actions].
Follow the canonical contracts, validation policy and matrix. Report actual
commands, independently justified reuse, remaining gates and observed costs.
```

## Native Rust navigation

The native organization campaign's historical evidence remains in its ExecPlan.
New Rust work uses the same contracts and the Rust section of the validation
matrix. Under `apps/desktop/src-tauri/src/`, `main.rs` owns Tauri
registration, managed state, setup and shutdown. `diagnostics/cli.rs` owns the
existing executable-mode dispatch. The private
`tts_service_supervisor/host_diagnostics.rs` child owns the model-free supervisor
matrix and remains callable through `tts_service_supervisor::run_host`.
Production lifecycle, runtime selection, containment, commands and model-backed
diagnostics remain in `tts_service_supervisor.rs`; no new lifecycle accessor is
needed for the child diagnostic.

Keep the cohesive package verifiers, protocol contract/transport, independent
frozen probe, runtime-callable synthetic child, hardware detector/authority,
handoff diagnostic and shared SHA helper at their existing paths. Audit decisions
and exact validation are in the [completed native Rust plan](../plans/completed/native-rust-module-organization.md).

### Private native test children

The test-layout campaign retains production ownership and logical module paths.
These private children are declared with `#[cfg(test)] mod tests;`
under `apps/desktop/src-tauri/src/`:

| Production owner | Unit-test child |
| --- | --- |
| `sha256_hex.rs` | `sha256_hex/tests.rs` |
| `tts_service_protocol.rs` | `tts_service_protocol/tests.rs` |
| `tts_release_core.rs` | `tts_release_core/tests.rs` |
| `tts_service_fake_child.rs` | `tts_service_fake_child/tests.rs` |
| `tts_service_handoff.rs` | `tts_service_handoff/tests.rs` |
| `tts_optional_chatterbox.rs` | `tts_optional_chatterbox/tests.rs` |
| `tts_service_supervisor.rs` | `tts_service_supervisor/tests.rs` |
| `tts_protocol_contract.rs` | `tts_protocol_contract/tests.rs` |
| `tts_protocol_probe.rs` | `tts_protocol_probe/tests.rs` |
| `host_profile_detection.rs` | `host_profile_detection/tests.rs` |

See [testing guidance](testing.md#native-rust-unit-test-layout) for Windows source-privacy coverage, frozen authorities, runtime-callable diagnostics, fixture paths and platform/feature constraints. The [test-layout ExecPlan](../plans/completed/native-rust-test-layout.md) retains each unit's original baseline, orders and independent acceptance.

## First use

Start with one bounded package and its actual risk. A separate task is needed only for context or role availability. After one or two batches, adjust workflow from observed failures or unnecessary work, not speculative rules.
