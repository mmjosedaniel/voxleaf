# Documentation consolidation and review closeout

Created: 2026-11-14.
Status: implementation approved DCRC-CR-R2-20261115; final archival assessment pending.
Inspected base: `dc49167487c7071948a341eb3dbc454a4b2841cb`, clean `main`, empty index.

## Goal

Correct misleading current-version instructions, maintain delivery status once,
reduce duplicated operational prose, and clarify compact independent review
closeout without weakening acceptance or deleting useful historical evidence.

## User-visible outcome

A contributor can identify the supported runtime, select current commands,
find component responsibilities and determine delivery status without reconciling
conflicting summaries. Agents can close a reviewed change with concise linked
evidence while preserving exact identities, independence and applicable checks.

## Current state

The read-only assessment at the inspected base established:

- Native `tts_optional_chatterbox.rs` selects `voxleaf-chatterbox-v7` and the v7
  package manifest. The Chatterbox engine is 0.1.7; packaged Piper is 1.8.0 with
  ONNX Runtime 1.31.0. Package versions, stable profile names and frozen service
  source versions are different identities. No local installed-runtime claim was
  established by that inspection.
- `docs/development/testing.md` identifies v7 as current but subsequently labels
  v6 production checks as current. Additional stale v5/v6 descriptions appear in
  the architecture overview/diagram and dependency documentation.
- V7 preparation includes v6 regressions, and v7 uses an older-named security
  probe. Native cleanup also recognizes older runtimes. Unversioned packaging
  aliases select v2; the runtime smoke CLI defaults to v5. These existing
  interfaces must remain intact; current instructions need explicit versions.
- Git ancestry contains `fa2ff5d` (#316) and `2f0ff21` (#276), but maintained
  indexes still call their work proposed or uncommitted. Historical plans may
  accurately retain those descriptions at their original checkpoint.
- The general index and architecture overview interleave current guidance with
  extensive campaign closeouts. The roadmap, completed index and evidence
  already retain much of that history. Length alone does not justify deletion.
- Independent review already permits a closed manifest assembled from pinned
  prior records and an explicit delta. The #317 final report demonstrates this;
  #318 also demonstrates useful substantive review and repeated documentary
  closeout. No elapsed-time saving has been measured.

Revalidate these facts and their consumers before editing. Inspect current HEAD,
branch, index and worktree; this plan and its navigation entries are expected
pre-existing changes when execution begins. Preserve all other work and record
drift rather than treating the inspected base as permanent authority.

## Scope and non-goals

Implementation allowlist, with each edit justified by an assessed responsibility:

- `docs/README.md` and `docs/plans/completed/README.md`: navigation and maintained
  delivery summaries; never modify completed plan bodies.
- `docs/development/testing.md`, `setup.md` and `dependencies.md`: current
  instructions, historical labels, section navigation and redundant prose.
- `docs/architecture/overview.md` and `system-diagram.md`: correct stale runtime
  descriptions and improve access to existing boundaries; no architecture change.
- `docs/development/agentic-change-review.md`: clarify the existing compact
  closeout and immutable manifest-composition rules.
- `.agents/PLANS.md`: at most one short cross-reference to that closeout guidance
  if needed; no new required sections or broadened planning obligation.
- This plan, its active/completed index entries and concise implementation and
  final archival receipts under `docs/plans/evidence/documentation-consolidation/`
  (`review-r1.md`, `review-final.md`, and distinct correction receipts only when
  needed). Each report stays outside its own manifest.

Do not delete entire existing documents in this first pass. Remove redundant live
paragraphs only after preserving their unique facts and reachable source links.
Do not move existing files or break existing section anchors. A heading may retain
a short useful summary and onward link instead of its duplicated narrative.
Use the existing documents; do not create another status dashboard or parallel
version authority. No line-count target forces an edit.

Exclude source, tests, commands, package manifests, locks, schemas, dependencies,
CI configuration, generated files, published artifacts, ADRs, frozen benchmark
authorities, existing review receipts and completed plans. Also protect the
packaged `docs/user/windows-release.md`, sample XML consumed by its generator,
the roadmap, support matrix, evidence-retention policy and refactor contracts.
Consult these sources without changing them. If a necessary correction falls
outside this boundary, record it and seek an explicit scope decision.

Keep models, roles, independent review, refactor validation, PowerShell host
acceptance and Git authorization unchanged. Do not implement C05, publish a
runtime, download historical models, build installers, perform a source refactor,
or claim complete v7 live HTTP delivery. No commit, push, PR or publication is
authorized by this plan alone.

## Relevant files and documentation

- `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`, `docs/product/mvp.md`.
- Canonical architecture overview/diagram and
  `docs/architecture/tts-support-matrix-v2.md`; applicable ADR-0006, ADR-0051,
  ADR-0055, ADR-0064 and ADR-0068. Preserve their accepted boundaries.
- `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs`,
  `tts_service_supervisor.rs`, their tests and `tauri.release.conf.json`.
- `services/tts/release/optional/chatterbox/optional-package-manifest-v7.json`,
  `release/core/source-manifest-v1.json`, `release/audit-policy.json`,
  `src/voxleaf_tts/release_chatterbox.py` and applicable version-authority tests.
- `package.json`, `.github/workflows/`, `scripts/release_inventory.py`,
  `scripts/test-chatterbox-runtime-smoke.py`, `scripts/check-evidence.mjs` and
  `apps/desktop/scripts/windows-release.mjs`.
- `docs/development/evidence-retention.md`, `agentic-refactoring.md`,
  `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md`
  and `.agents/skills/validate-safe-refactor/references/validation-policy.md`.
- Historical precedents: completed documentation-consistency-and-historical-tooling,
  development-guidance-and-command-clarity and portfolio-readiness plans;
  `docs/plans/evidence/development-guidance-and-command-clarity/review-final.md`
  and `docs/plans/evidence/portfolio-readiness/review-pr.md`.

## Architecture and constraints

This work changes maintained guidance, not product behavior. EPUB privacy, local
inference, ephemeral audio, bounded buffers, cancellation and stable positions
remain intact. Runtime selection comes from code/manifests; the support matrix
explains admission. The general index provides routes, not a second authority.
The completed index owns maintained delivery summaries; immutable evidence
continues to describe exactly its original source, host and outcome.

Markdown can be an executable input or an acceptance contract. Packaging consumes
the Windows guide; sample generation consumes XML under docs; benchmark authorities
have byte identities. Preserve those inputs. Do not equate a Markdown extension
with a harmless change or exempt altered claims, commands or requirements.

## Milestones

### 1. Establish the dependency map and correct runtime guidance

- Record the pre-edit state and baseline identities of protected files. Map
  affected headings/incoming fragments, unique links and non-document consumers.
- Recheck native selection, release audit/inventory, CLI defaults and the v6
  consumers used by current v7 validation. Preserve existing commands exactly.
- Correct current v5/v6 labels across the allowlisted guides and architecture.
  Separate current v7 steps from historical maintenance and shared probes; use
  explicit v7 arguments wherever the current procedure requires them.
- Keep historical source/admission/execution/HTTP evidence distinct. Retain C05
  and all unverified delivery limitations. Do not rebuild a runtime for this edit.

Acceptance: every affected current-version statement matches its owning source;
legacy consumers remain documented and unchanged. Status: complete; implementation approved DCRC-CR-R2-20261115.

### 2. Consolidate delivery status and operational reading routes

- Verify incorporation from Git ancestry for #316/#276 and any other status
  touched by consolidation. Do not infer fresh CI or runtime acceptance from a merge.
- Keep one concise delivery summary per change in the completed index. Replace
  copies in the general index with links, retaining unique follow-up evidence.
- Put the current product summary and contributor routes near the beginning of
  the general index. Keep `current-project-status` and other incoming anchors.
- In setup/testing/overview, separate prerequisites, responsibilities and actions
  from past campaign narratives. Retain information with a distinct purpose;
  replace duplicated history with verified existing references.
- Record a compact before/after disposition for removed blocks: duplicated source,
  retained unique facts, destination and protected incoming links. Avoid another
  full narrative or mandatory metric spreadsheet.

Acceptance: no unique requirement, limitation, command prerequisite or evidence
route disappears; no whole-file deletion; existing paths/fragments still resolve.
Status: complete; implementation approved DCRC-CR-R2-20261115.

### 3. Clarify compact closeout without weakening approval

- Document preparation of the final plan/index/guide candidate before review;
  reserve a unique report ID and destination, then freeze reviewed inputs.
- A plan may link to the reserved report as the verdict authority; it must not
  claim APPROVE before the reviewer issues it. Existing plan requirements for
  implementation approval before archival remain binding.
- Clarify incorporation by reference: name an immutable retrievable prior record,
  pin its identity, enumerate inherited paths and exact additions/replacements/
  deletions, include both rename sides and supporting inputs, and reconstruct
  and recheck the complete current closed manifest. Inherit facts, not approval.
- Any later base/HEAD/path/content drift still requires a new review ID and
  independent assessment. Missing evidence blocks reuse. Preserve staging-only
  handling and the separation between review and Git authorization.
- Keep the reserved report outside its own manifest. Verify its saved content
  against the reviewer output and run affected document checks after persistence.
- Explain existing small-task planning exemptions without broadening them. A
  related bounded no-change audit may use an existing authorized record when no
  separate plan is required; broad logic audits retain their indexed coverage.
- Leave systematic-refactor contracts, validators and acceptance gates untouched.

Acceptance: the scenario matrix below preserves every required rejection/review
and permits concise records for eligible closeout. Status: complete; implementation approved DCRC-CR-R2-20261115.

### 4. Validate, independently review and close

- Run the applicable host gates after the last relevant edit. Preserve failures
  and their causes; do not substitute historical PASS results for this patch.
- Obtain `change_reviewer` (Astra high) approval for the exact policy/documentation
  patch, including the dependency map, scenario outcomes and host evidence.
  Resolve actionable findings and repeat affected checks with a new assessment.
- Bootstrap this policy clarification under the incumbent rules: obtain the
  implementation/policy approval first, without using the proposed wording to
  waive its own review. Record that actual verdict and evidence in this plan.
- Then prepare the actual local archival candidate: move this plan to completed,
  update its navigation, reserve the final receipt ID/path, and freeze all those
  bytes. Identify final archival assessment as pending; the move alone does not
  establish final acceptance. Review this exact delta independently using pinned
  unchanged records plus current identities, including both sides of the move.
- After approval, persist only the authentic reserved final report outside its
  own manifest, rerun affected document checks and verify current identities.
  Passing those gates finalizes acceptance without another edit to the reviewed
  plan or indexes. If correction is necessary, obtain a new assessment instead
  of changing an approved path silently. Preserve all previous reports.

Acceptance: exact final patch approved, protected bytes unchanged, links/checks
pass, worktree changes accounted for and no unauthorized Git mutation.
Status: implementation approved; archival candidate prepared; final assessment pending.

## Testing and benchmark strategy

Every validation command runs in normal local PowerShell outside the sandbox.
Use pinned pnpm 11.15.1 through existing Corepack shims if PATH selects another
version. Do not install or change toolchains merely for document checks.

| Gate | Method | Acceptance and invalidation |
| --- | --- | --- |
| Evidence hygiene | `pnpm.cmd check:evidence` | PASS on final documents, including untracked and saved report; repeat after relevant edits |
| Patch hygiene | `git diff --check`, plus direct whitespace inspection of new files | PASS; Git diff alone does not cover untracked content |
| Links and anchors | Local read-only inspection of affected outgoing and repository-wide incoming links, compared with the baseline | No new broken paths/fragments; preserve pre-existing gaps separately rather than expanding cleanup |
| Protected inputs | Compare pre/post source, test, config, lock, authority, completed-plan and receipt identities; allow only named index exceptions and this plan's eventual archival | No drift outside allowlist; unexpected edits block acceptance |
| Claim/command traceability | Inspect code, manifests, configured scripts, consumers and Git ancestry; retain concise source references | Current version/status claims supported; no command execution or installed-runtime proof implied |
| Workflow safety | Independent review of the cases below against the proposed wording | All cases preserve current obligations; subjective brevity alone cannot pass the change |

Workflow scenario matrix:

| Case | Required outcome |
| --- | --- |
| Final documentation prepared before review | Review the complete frozen candidate; no speculative approval |
| Plan requires implementation approval before archival | Preserve the two acceptance stages; compact independent archival assessment is allowed |
| Editorial delta after approval | New report/assessment for changed reviewed identities; reuse only proven unaffected checks |
| Markdown changes a command, support/C05 claim, privacy rule or acceptance criterion | Substantive review and affected gates; never a blanket documentation exemption |
| Markdown/XML is a build, fixture or benchmark input | Outside this allowlist if protected; expand scope explicitly before changing it |
| Base/HEAD/runner/config/supporting input changes, missing prior manifest or staged blob mismatch | Reject stale approval/reuse; diagnose and obtain current evidence |
| Systematic refactor or broad no-findings logic audit | Existing validator/reports or indexed audit obligations remain intact |
| Reserved report saved after inspection | Verify authentic report content, rerun affected document checks; no self-hashing loop |

No runtime behavior, parser, audio or model performance change is planned. Do not
run application builds, model acquisition, full runtime suites or benchmarks just
to accept editorial work. If an actual executable input must change, stop and
revise scope/gates first. `check:evidence` is not a link checker or proof that
claims are true. Do not claim unexecuted tests, current installed versions,
measured productivity gains or new live-delivery acceptance.

## Risks and rollback

Primary risks are lost unique instructions, broken historical anchors, accidental
edits to hashed/package inputs, false current-version claims and a policy loophole
that renews approval without inspection. The dependency map, protected identities,
scenario matrix and independent reviewer address these risks before acceptance.
Keep raw snapshots in ignored `tmp/evidence/documentation-consolidation/`; retain
only concise public results without private paths or host data. Roll back only
verified task-owned hunks; never reset, clean or overwrite unrelated work.

## Progress log

- 2026-11-15: HEAD and main remain at dc491674; index empty. Only the expected
  plan/navigation edits pre-existed. Three disjoint documentation workers use
  high/high/xhigh; no source changes or Git publication authorized.

- 2026-11-14: read-only assessment and high/xhigh agent analysis completed against
  the inspected base. User requested this ExecPlan. Plan drafting and navigation
  are authorized; no implementation or Git publication has been performed.
- 2026-11-14: plan-only host checks passed. Xhigh peer inspection identified an
  ambiguous archive/review order; milestone 4 now explicitly prepares the actual
  archival candidate before its final assessment and permits both receipts.

## Discoveries and decisions

- Remove redundant maintained prose, not historical evidence. No whole existing
  document is approved for deletion in this first pass.
- Preserve legacy version tooling because current acceptance and cleanup use it.
- Compact referenced manifests are an existing valid form; clarify their safe use
  rather than adding a new approval bypass or parallel workflow.
- Before delegating during execution, assess reasoning needs. Use at least high;
  policy/acceptance interaction analysis merits xhigh. Required `change_reviewer`
  remains the established Astra high role. Reuse agents for related questions.
- This is documentation/workflow maintenance, not a source-refactor campaign.

## Final validation results

Execution checks (2026-11-15): evidence hygiene and diff whitespace passed in
normal local PowerShell. The temporary inspector passed preserved headings,
all tracked Markdown link comparison and protected-input scope checks: 75
pre-existing link candidates, zero new candidates. Its first run failed because
an unchanged historical Markdown file uses a legacy encoding; a read-only
UTF-8/CP1252 decoder correction passed without editing that file. No runtime
checks or historical PASS reuse were needed. See the new acceptance receipt.


Milestones 1-3 and implementation acceptance are complete under DCRC-CR-R2-20261115. DCRC-R1-F1 is resolved. The final archival candidate is prepared; its independent assessment and final persistence checks remain pending.

Plan creation only: `pnpm.cmd check:evidence` and `git diff --check` passed in
normal local PowerShell with pnpm 11.15.1. Direct inspection confirmed all twelve
required sections, 249 local link targets across this plan and its two indexes,
no trailing whitespace and no other changed paths. These are planning-document
checks, not acceptance of the future consolidation or policy implementation.

Final archival verdict: [DCRC final report](../evidence/documentation-consolidation/review-final.md).
Implementation verdict: [DCRC R2](../evidence/documentation-consolidation/review-r2.md).
The final report is reserved outside its own manifest; no further plan edit is
needed to establish its issued verdict. C05 and complete v7 HTTP delivery remain
pending. No commits, push, PR or runtime publication were performed.
