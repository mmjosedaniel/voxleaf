# Agent guidance simplification

Status: implementation complete. Final acceptance is established only by [AGS-CR-R1-20261115](../evidence/agent-guidance-simplification/review-r1.md) and its [post-persistence closeout](../evidence/agent-guidance-simplification/closeout.md); preparing this archived candidate is not approval.

## Goal

Reduce repeated instructions, routine reading and administrative closeout work while correcting stale guidance and preserving independently verified acceptance.

## User-visible outcome

Contributors find current requirements and the appropriate workflow quickly. Small tasks use the existing exemptions; substantive changes retain independent review. Windows guidance states the actual Chatterbox admission requirement. Redundant prose is deleted, not merely moved into another report.

## Current state

- Planning baseline: `0433f261bedf8fff5df0e725aaea1bdd55032ba6`, branch `main`, clean worktree and empty index before this plan. Recheck all four before implementation; this plan and its entries in the active/documentation indexes are expected changes, possibly already committed. Preserve unrelated work.
- The previous consolidation shortened eight guides by 242 net lines but added 653 plan/receipt lines. Its net increase was 411 lines; this is not a measured token/time cost.
- `AGENTS.md` has 185 lines; specialized procedure repeats across guides, skills and plan rules. Existing rules already exempt small isolated documentation changes from planning and trivial editorial changes from change review.
- The Windows guide lists 4,096 MiB available RAM where ADR-0068 and current admission require 7,042 MiB; 4,096 remains the immutable package floor. A retrospective diagram row calls v5 evidence current. History retained on disk is not automatically loaded context.

## Scope and non-goals

Editable implementation allowlist:

- `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`.
- `docs/development/agentic-change-review.md`, `docs/development/agentic-refactoring.md`, `docs/development/evidence-retention.md`, `docs/development/setup.md`, `docs/development/testing.md`.
- `docs/architecture/system-diagram.md`, `docs/user/windows-release.md`.
- This plan (including its final move), `docs/plans/active/README.md`, `docs/plans/completed/README.md`, and concise new `docs/plans/evidence/agent-guidance-simplification/review-rN.md` and `closeout.md` records.

Delete redundant blocks within this list; no whole-document deletion except moving this plan. Skills, role/config files, refactor contracts/policy, roadmap, product requirements and ADRs are read-only authorities. Preserve existing completed plans, receipts, frozen Markdown authorities, executable samples, release artifacts, schemas, dependencies, tests and CI. No runtime/CLI changes, new tooling framework, installations, model downloads, historical builds or publication. C05 remains pending for the next runtime. Implementation authorization does not authorize commit, push, PR or merge.

## Relevant files and documentation

Read [project rules](../../../AGENTS.md), [task routes](../../README.md#task-reading-routes), [plan rules](../../../.agents/PLANS.md), [change review](../../development/agentic-change-review.md), [retention](../../development/evidence-retention.md), and the applicable refactor [contracts](../../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md) and [validation policy](../../../.agents/skills/validate-safe-refactor/references/validation-policy.md). Inspect relevant MVP, diagram and overview boundaries; do not read the historical archive wholesale.

Revalidate RAM against [ADR-0068](../../architecture/decisions/ADR-0068-align-chatterbox-effective-ram-admission.md), the support matrix, renderer and `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`. Inspect `apps/desktop/src-tauri/tauri.release.conf.json`, `apps/desktop/scripts/windows-release.mjs`, and its existing tests: the editable Windows guide is a bundled text resource. Benchmark authority hashes and `scripts/portfolio-sample.mjs` explain why other documentation inputs remain protected.

## Architecture and constraints

No architectural or product behavior changes. Preserve local EPUB/TTS, privacy, bounded memory, identity-safe cancellation, stable locations and the meaning of playable-audio lead. Preserve established models/roles, one writer, review independence, Git authorization, host-only acceptance, failure retention and exact patch/input/environment identities. Keep general rules as short entry points to one canonical procedure; loading a reference is conditional on the task, not on its mere existence. Do not replace shared project authority with private agent memory.

## Milestones

### 1. Simplify operational rules

- [x] Map each removed rule to its retained canonical requirement or explain why it is redundant in this plan's decisions; use a compact grouped map, not a new report. Shorten AGENTS and the refactor overview by referencing existing canonical contracts, roles and policy. Preserve the 12 required plan sections; allow brief text/links instead of repeating evidence in every section.
- [x] Clarify the existing routes: read-only investigation, trivial editorial change, one-file behavioral fix, substantive support/acceptance documentation, and refactor campaign. Do not apply the campaign machinery to ordinary fixes or add `change_reviewer` on top of its validator.
- [x] Specify one review of the prepared final candidate as the ordinary closeout. Additional rounds remain mandatory for actionable findings or identity drift, and existing plans with separate approvals retain them. Reserve exact report/closeout destinations; exclude only these terminal records from their own candidate manifest, never source or test inputs.
- [x] Permit compact manifest inheritance of an entire retrievable prior manifest pinned by path, record ID and verified SHA-256, plus an explicit delta, without re-listing unchanged paths. Require deterministic reconstruction and comparison against the actual closed set, including supporting/untracked paths, states, SHA-256, filter-aware blobs, deletions and both rename sides. Reject cycles, duplicate/ambiguous entries, missing records and drift. A full manifest can replace failed inheritance for a new review; it cannot cure drift or invalid test evidence by itself. A new reviewer verdict and independent gate-reuse proof remain required. Generate/compare with existing Git/hash primitives and, if useful, ignored task-local scripts; introduce no production tool or dependency.
- [x] Keep one authentic immutable reviewer report per necessary round and one short coordinator closeout record. Preserve failed rounds. The latter records only post-persistence commands, outcomes and identity confirmation; it cannot change scope, requirements, evidence attribution or the review verdict. Avoid a separate acceptance narrative duplicating this plan.

### 2. Remove duplicates and correct current claims

- [x] Replace the repeated Rust test exceptions in `agentic-refactoring.md` with a link to the retained `testing.md` authority; keep its navigation table. Reduce setup's retired validation-installer explanation to a historical note linked to ADR-0050/M011; keep current ordinary-release isolation instructions.
- [x] Shorten redundant workflow/status summaries in the allowlisted guides and documentation index. Preserve unique facts, task routes, incoming anchors and links; route historical questions to the existing completed index instead of copying its contents. Do not create another inventory document or rewrite the roadmap/history.
- [x] Correct the Windows guide to distinguish 7,042 MiB effective available RAM for acquisition/fresh start from the 4,096 MiB package floor, including any conflicting nearby claim that the historical gate is unchanged. Preserve the separate healthy loaded-owner continuation rule and the historical status of old measurements. Keep its resource path/mapping unchanged; this source edit does not update or revalidate a previously published installer.
- [x] Mark v5 references as historical where appropriate and point current selection to v7; preserve package/engine/profile distinctions, unverified full HTTP delivery and C05. Clarify AGENTS pause wording against existing product/code/tests: playback-only pause may continue bounded same-identity generation; Cancel start/Stop, invalidating navigation, replacement and closure retain their established cancellation requirements.

### 3. Validate and close once

- Pre-review gates and documentary reduction are recorded below and in the final review; resolve any defects. Measure before/after bytes and lines for maintained guidance and for all task Markdown, including this plan and final receipts. Count the task-owned delta against the pre-plan baseline above, even if the plan is committed before implementation; count its creation once across the archival move and exclude unrelated changes explicitly. Acceptance requires a net byte reduction in both groups, without hiding content in new files or dropping unique requirements; report lines separately and do not claim measured token/time savings.
- [x] When implementation and pre-review checks pass, prepare the actual final archival path and both indexes/documentation entry, using neutral wording that points to the reserved review/closeout records. Freeze this real candidate. A filesystem move is preparation, not approval; keep pending acceptance visible until the authentic records exist. Do not impose a separate implementation-then-archive review for this plan.
- Final gate (outcome in the linked report): request `change_reviewer` (Astra high) under the baseline review rules, supplying the exact complete candidate and full manifest, relevant consumers and local-host results. Do not use this patch's proposed shortcuts to approve itself. Keep writing/Git idle; resolve findings, rerun affected checks and obtain a new verdict for every corrected candidate.
- Post-review gate (outcome in the linked closeout): save the authentic issued report at its reserved path without editing the frozen candidate; compare it to the reviewer output. Run the affected document/link/identity checks after persistence, then save their concise results in the reserved coordinator closeout record. Check that record's privacy/links and the final tree again; report that last check in the final response. No recursive report about reports and no hash refresh to renew approval. Any other drift requires reassessment. Only then declare completion.

## Testing and benchmark strategy

Run every acceptance command in normal local PowerShell outside the sandbox, from the repository root. Use repository-pinned pnpm 11.15.1; if PATH differs, select an existing Corepack shim before considering any installation. Revalidate commands before execution; record exact invocation, environment, exit status, failures and any justified reuse here or in the linked authentic report.

| Gate | Required evidence |
| --- | --- |
| Hygiene | `git diff --check` and `pnpm.cmd check:evidence`; inspect new/untracked Markdown too. Repository format scripts exclude Markdown, so do not claim they validate these edits. |
| Links and protected inputs | Resolve changed relative links/anchors, including incoming links to removed headings and the plan move; compare with baseline and report pre-existing defects separately. Compare the complete task diff/identities with the allowlist; verify protected inputs unchanged, including both sides of moves and untracked files. Use reproducible task-local inspection if no configured link checker exists; record its exact command and limitations. |
| Bundled guide | `node apps/desktop/scripts/windows-release.mjs check` exercises existing resource/config validation without `--require-core`; inspect source/destination and readable guide contents. Verify claims against ADR-0068, current native/renderer admission and existing tests. This is configuration/document evidence, not a new installer/runtime acceptance run. |
| Workflow scenarios | Static decision matrix for read-only investigation; typo; one-file behavioral fix; support/acceptance edit; refactor campaign; missing reviewer/evidence; changed HEAD/content/staged blob; missing/ambiguous inherited manifest; and post-report drift. State required plan/reviewer/gates and demonstrate safeguards remain intact. Exercise manifest reconstruction using synthetic valid/add/remove/rename and rejection cases outside protected files. |
| Reduction and final review | Record baseline/final Markdown bytes and lines, independent report ID/verdict, final candidate identities, and post-persistence outcomes. Distinguish static inspection, executed checks and reused evidence. No unsubstantiated previous PASS. |

Do not run runtime builds, GPU tests or full suites for editorial/policy edits. If inspection finds a required executable change or a consumer whose affected gate cannot be satisfied within this scope, resolve that scope/evidence question before changing it; do not silently waive the gate. No benchmark campaign is required to establish documentary reduction.

## Risks and rollback

Shortening can remove exceptions, break anchors, alter acceptance or confuse historical and current evidence. Preserve a canonical home for every unique rule and review the scenario matrix. Over-broad terminal-record exclusions could bypass review: only the reserved authentic receipt and narrowly constrained coordinator record are excluded. Revert only task-owned edits on failure, preserving unrelated work; no destructive reset, retroactive receipt rewrite or amendment of old acceptance. Published artifacts remain unchanged.

## Progress log

- 2026-11-15: Milestones 1 and 2 implemented. Repeated task inspection passed: 12 synthetic manifest cases, no new local-link candidates, preserved heading/index destinations, protected tracked inputs and empty index. Six pre-existing static link candidates remain outside scope. The archived candidate and two terminal destinations are prepared for the baseline-rule independent review; all affected checks will run on these final inputs.

- 2026-11-15: Execution authorized. Confirmed baseline HEAD/main and empty index; only this plan and its two expected index entries were dirty. One writer; independent read-only policy and consumer inspection.
- 2026-11-15: Host hygiene, evidence guard and Windows resource/config check passed. First task-local inspection failed because catalogue consolidation removed the `history-import.md` navigation link; restored it before rerunning. This was a documentation regression, not a runtime failure.

- 2026-11-15: Created this compact implementation plan and indexed it; product/workflow implementation is not authorized merely by creating the plan. Planning checks are recorded in the task response.

## Discoveries and decisions

- Prefer deletion of duplicate prose and conditional references over new layers of process. Preserve old evidence; its availability is different from mandatory reading.
- One final-candidate review is the default for this plan; corrective rounds remain mandatory. Apply current review requirements during the transition, not self-approved new exemptions.
- Rule map: AGENTS retains product, host and authorization constraints; detailed audits remain in `findings/README.md`; refactor sequencing/model/permission rules remain in the unchanged skills, contracts and validation policy; the refactor guide retains role settings and native navigation; PLANS retains its triggers and 12 sections. Review policy owns exact-patch/terminal-output handling; retention owns privacy and storage. Removed duplicates point to those authorities.
- Six testing recaps (SAF/RAC/VCA/NCC/LCF/CLB) now link their original ledgers/plans while retaining commands, platform/cleanup constraints and evidence limits. Rust exceptions remain in testing, setup links the retired overlay decision, and the index keeps all original destinations. The historical `testing.md#L2171` link now has a semantic compatibility anchor. The edited diagram's evidence table also loses redundant alignment spaces; byte reduction includes this formatting component.
- Transition authority: this user-authorized plan already reserves the authentic report and narrow coordinator record. Ask the reviewer to assess that explicit output contract under baseline rules, with a full input manifest; no approval is inferred from the policy being edited. Only those initially absent outputs may appear after review. A rejection, other drift or failed post-persistence check prevents closure.

Static workflow scenario matrix (policy inspection, not runtime execution):

| Scenario | Required disposition retained |
| --- | --- |
| Read-only investigation | No change review or implementation plan; explicit read-only prevents audit writes. Ordinary authorized logic audits retain findings maintenance. |
| Editorial typo | No plan or change reviewer; applicable document checks and brief exemption reason. |
| One-file behavioral fix | Planning exemption may apply; host regression evidence and Astra change review still required. |
| Support/privacy/acceptance documentation | Substantive review, consumer inspection and affected gates; Markdown is not automatically trivial. |
| Refactor campaign | ExecPlan when triggered, canonical orders, independent baseline/post-change validator and batch gates; no additional change reviewer. |
| Missing reviewer or evidence | Acceptance BLOCKED; neither stronger author model nor a summary substitutes for proof. |
| Changed HEAD/content/staged blob | New current assessment; no refreshed approval hashes. Content-equivalent staging alone retains its existing exception. |
| Missing/ambiguous inherited manifest | Inheritance rejected; a full manifest enables a new request but cannot validate stale test evidence. |
| Post-report change | Only reserved authentic terminal outputs under the reviewed contract; other path/index/identity drift or failed checks blocks completion. |

## Final validation results

Final-candidate commands, results, input identities and verdict: [AGS-CR-R1-20261115](../evidence/agent-guidance-simplification/review-r1.md). Authentic-report persistence and subsequent checks: [coordinator closeout](../evidence/agent-guidance-simplification/closeout.md). These initially absent records are the acceptance authorities; no PASS is implied before their issue and verification.

The author runs `git diff --check`, Corepack-pinned `pnpm.cmd check:evidence`, `node apps/desktop/scripts/windows-release.mjs check`, and `python tmp/evidence/agent-guidance-simplification/validate.py --reserved` on the frozen candidate, with `review_snapshot.py` before/after identity verification. After terminal records exist, rerun the document inspection without `--reserved`. Scripts/raw captures stay ignored; command outcomes and synthetic/static limitations belong in the authentic report. No runtime suites, package build, model download or historical test PASS is substituted. The first missing-index-link failure remains recorded above.

Final delivery reports both guide and all-task Markdown byte/line deltas against the pre-plan baseline, including the actual receipts. Published installers, frozen authorities and C05 remain unchanged; C05 is pending for the next runtime, and v7 full HTTP delivery remains unverified.
