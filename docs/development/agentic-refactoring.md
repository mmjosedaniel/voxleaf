# Agentic refactoring workflow

This workflow audits VoxLeaf TypeScript, TSX, Python and Rust for concrete maintainability
problems without treating every file as defective or changing product behavior.
It is repository tooling for contributors; it is not part of the application
runtime and does not change the system diagram or product roadmap.

Features and behavioral bug fixes use the separate
[independent change review](agentic-change-review.md) workflow. Its
`change_reviewer` does not replace this campaign's `refactor_validator` and is
not an additional mandatory role for behavior-preserving units.

## Evidence storage

Apply the [evidence retention policy](evidence-retention.md) to Audit Packets,
Work Orders and Validation Reports. Commit concise immutable receipts and
curated source identities; put raw captures, logs and temporary execution scripts
in ignored `tmp/evidence/<run>/` or expiring CI artifacts. Record archive/recovery
links when retiring current-PR captures. The existing `check` and
`check:portable` commands begin with the index guard and its isolated tests.

## Why the workflow is bounded

VoxLeaf has many implementation and test files across several languages. A literal
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
  Its [validation policy](../../.agents/skills/validate-safe-refactor/references/validation-policy.md)
  is canonical for risk, unit/batch acceptance, gate reuse, preparation and
  bounded retries; the [matrix](../../.agents/skills/validate-safe-refactor/references/validation-matrix.md)
  supplies language/runtime checks. Role prompts reference these rules.
- [Agent contracts](../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md)
  own report identity and Git orders. Do not duplicate their rules here.
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

1. Inspect current scope and authorization. Create the requested branch from
   the clean requested base through a SETUP order. Updating main, committing,
   pushing and opening a PR each remain bounded by user authorization.
2. Create an ExecPlan when .agents/PLANS.md requires one. Inventory only the
   requested paths, including the relevant .ts/.tsx/.py/.rs files; exclude
   generated and historical authority from manual changes.
3. Audit cohesive units without a predetermined fix. Accept SKIP. For CHANGE,
   draft a closed work order and the unit/batch gate ledger before editing.
4. Have the validator establish focused baseline evidence outside the sandbox.
   Any shared expensive baseline must cover the declared batch before edits.
5. Freeze the order; let one worker implement it and run assigned fast checks
   before costly packaging. Inspect scope and the Change Packet.
6. Have the validator independently review the current patch and execute or
   justify reuse of every required unit gate. A new patch always needs a new
   report. Pending batch gates remain visible; high-risk unit gates cannot wait.
7. Correct only actionable findings within the bounded retry policy. When a
   commit is authorized, issue the exact Git order bound to the current report.
   Otherwise retain accepted work unstaged and preserve it explicitly.
8. Satisfy combined package/final gates, review the whole diff and verify any
   host restoration before final acceptance. Archive the completed plan and
   report commands actually run, reuse evidence and observed costs.

Use the [compact batch record](../../.agents/skills/validate-safe-refactor/references/validation-record.md)
for gate dependencies, preparation, recovery and phase timings. It is a
template, not an automatic runner. Existing versioned runners remain the
execution mechanism. If one lacks required diagnostics or safe cleanup,
approve and test that bounded runner change before relying on it.

## Approval applies to one validated state

The [contracts](../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md#validation-report)
require immutable Report IDs and exact HEAD/path identities. Any drift needs
current independent review and a new report. The
[reuse policy](../../.agents/skills/validate-safe-refactor/references/validation-policy.md#revalidate-changed-evidence-not-everything-by-default)
allows a gate result to survive only with complete input/environment proof.
It never lets the director refresh hashes in an old PASS. The Git steward still
compares report, order and live identities before staging and committing.

For example, a documentation-only closeout may retain unaffected code evidence,
but changing a test runner invalidates its test receipts even if the production
payload is identical. Unknown transitive dependencies or host conditions require
execution. Passing unit tests cannot conceal pending combined runtime gates.

## Durable traceability

Keep concise accepted-unit summaries and report references in the ExecPlan:
target/risk, exact scope and invariants, baseline, approved transformations,
post-change verdict, corrections, commit identity and pending batch gates.
Link curated Markdown receipts rather than embedding large manifests or logs.
Raw captures belong under the [evidence retention policy](evidence-retention.md).

Keep identity evidence outside its own validated paths. Freeze documentation
before its report. Evidence-only updates made after source acceptance need
their own review and order; never append an unvalidated plan edit to an accepted
source commit. No retrospective plan may fabricate baseline evidence.

An isolated unit may rely on its focused commit, tests and review when no
ExecPlan is required. A practical task audits at most 20 paths or completes
at most three accepted change batches; record the next queue position.

## Recommended director prompt

```text
Use $orchestrate-safe-refactor and $validate-safe-refactor.

Scope: [exact paths]
Batch limit: [target/unit limit]
Authorized Git actions: [none, or the actions the user actually requested]

Read AGENTS.md and the canonical contracts, validation policy and matrix.
Audit cohesive units and accept SKIP. Before edits, select risk and record gate
timing, dependencies, invalidation and any pending combined acceptance.
Use one writer, assigned fast checks, independent host baseline/post-change
validation and immutable reports. Reuse a gate only with the policy's full
proof; never substitute unit PASS for final acceptance. Preserve all product
constraints and tests. Apply bounded retries and verify host restoration.
Finish with current evidence, remaining work and actual commands/timings.
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

`host_profile_detection/windows_probe.rs` contains the existing private
Windows implementation; report types, normalization, admission and the Tauri
command remain in the parent. The hardware source-privacy test covers all
three resulting files. The frozen probe authority remains in its parent;
`hardware_profile_authority.rs` remains the separate test-only authority.
The synthetic child, handoff, independent probe and supervisor diagnostics
remain available in non-test builds. No public API or runtime owner was added.

The [test-layout ExecPlan](../plans/completed/native-rust-test-layout.md) records
each unit's fresh baseline, immutable order, source identities and independent
acceptance. See [testing guidance](testing.md#native-rust-unit-test-layout)
for fixture, namespace, platform and frozen-authority constraints.

## First use

Start with one bounded package and its actual risk. Inventory and plan before
implementation; a separate task is needed only when context or role availability
requires it. Shared contracts remain high impact and generated outputs are
excluded from manual edits. Preserve the batch limit and independent validation.

After one or two real batches, review where the agents produced unnecessary
work or missed context. Update the skills from observed friction rather than
adding speculative rules.
