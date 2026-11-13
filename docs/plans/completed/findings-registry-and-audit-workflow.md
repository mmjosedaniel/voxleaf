# Findings registry and cumulative logic-audit workflow

## Goal

Make logic audits cumulative: preserve each finding's trigger and contract,
reconcile prior decisions against the inspected checkout, and close corrections
with evidence that exercises the reported sequence and adjacent protections.

## User-visible outcome

Contributors can find earlier reports, distinguish recurrence from a variant or
intentional behavior, and state what an audit actually examined. Product behavior
is unchanged. The user authorized a branch, implementation and historical seeding;
commit, push and publication are not part of this delivery.

## Current state

Work began on clean `main` at
`403eb27916afe26d4794a7e36aeb97e6d1529bf1` (#314), on 2026-11-13.
The working branch is `codex/findings-registry-and-audit-workflow`.
Completed plans already contain detailed findings and acceptance evidence, but
there is no maintained cross-plan index or common audit coverage record.

## Scope and non-goals

- Add a lightweight Markdown registry, history-import manifest, audit template
  and a single canonical workflow under `docs/development/findings/`.
- Seed all 24 CFR dispositions, four PN dispositions, two RPI dispositions and
  three selected FPA exclusions/deferrals; preserve related earlier aliases.
- Connect discovery, bug fixing, feature regression review and planning through
  AGENTS, the relevant skills and the existing independent-review workflow.
- Preserve historical plans and evidence byte for byte. Import is not a new
  runtime validation or a claim that all historical findings are migrated.
- No runtime, dependencies, shared contracts, CI configuration, automatic audit
  schedule or production tests change. No full repository bug campaign.

## Relevant files and documentation

- `AGENTS.md`, `.agents/PLANS.md` and the project feature/bug skills.
- `docs/development/agentic-change-review.md` and `evidence-retention.md`.
- The completed CFR, PN, RPI and five-pass plans and their review/validation
  ledgers; their exact source mapping belongs in the import manifest.
- `docs/README.md` and the active/completed plan indexes.
- `package.json`, `scripts/check-evidence.mjs` and the installed skill validator.

## Architecture and constraints

The registry is contributor documentation, outside the reader/TTS runtime.
The canonical system diagram, process boundaries, persistence, M005 preparation,
privacy, bounded memory and cancellation contracts remain unchanged. Record only
content-safe repository references and synthetic triggers; keep raw tool output
in ignored `tmp/evidence/findings-registry/`. Do not copy private chat excerpts,
local profiles, books or audio into the registry.

Historical disposition and assessment on a specific checkout are separate fields.
An old fixed/intentional decision never suppresses a new inspection. Read-only or
no-test audit requests retain those restrictions; report proposed registry updates
when writing is not authorized. IDs describe trigger/contract/owner, not titles.

## Milestones

1. **Prepare and define the workflow.** Inspect repository state and existing
   policies, create the branch and this plan; define compact record and audit
   formats with stable IDs, scoped evidence and explicit import coverage.
2. **Seed and integrate.** Import the selected historical dispositions with
   source/test links, maintain distinct variants, and link the workflow from
   project entry points. Add a narrowly scoped static logic-audit skill.
3. **Validate and close.** Check links, IDs, provenance, privacy and skill syntax;
   independently exercise realistic audit decisions, review the exact patch,
   resolve findings, then archive this plan and update indexes.

## Testing and benchmark strategy

All validation commands run in normal local PowerShell outside the managed
sandbox. No historical behavioral PASS is reused as current acceptance.

| Gate | Evidence and scope |
| --- | --- |
| Documentation | `pnpm.cmd check:evidence`; `git diff --check`; explicit inspection of new files and local links/anchors, IDs and import counts. |
| Skills | Installed `skill-creator/scripts/quick_validate.py` for each changed/new skill; inspect applicability, relative links and authorization boundaries. |
| Workflow | Independent read-only scenarios: intentional recovery; wrong receipt validator; stopped placement then Play; synthetic manual flag versus real gesture; deferred preflight later resolved; no-test/read-only audit. |
| Independent review | Exact changed-path snapshot, source provenance and host results; source writing pauses during review. |
| Runtime gates | Not applicable: no product source, tests, dependency, build, schema or runtime input changes. |

Repository format scripts exclude Markdown; do not reformat unrelated historical
documents or run product suites merely to validate this documentation change.
Any relevant check that fails is retained and corrected before acceptance.

## Risks and rollback

Main risks are mistaken lineage, conflating imported evidence with current
verification, mandatory bureaucracy for unrelated work, and suppressing valid
rediscoveries. Keep a partial-import manifest, precise triggers, separate statuses,
and task-proportional workflow rules. A documentation rollback can remove the new
entry points and registry without changing product behavior or historical records.

## Progress log

- 2026-11-13: clean baseline inspected; requested branch created. Historical
  source extraction and workflow review delegated read-only. Implementation in
  progress.
- 2026-11-13: 33 source-linked records and partial import manifest implemented;
  canonical workflow and audit template integrated through AGENTS, PLANS, three
  skills, testing guidance and independent-review inputs. No product code changed.
- 2026-11-13: host document check passed; all three skills passed the installed
  validator; local-link/anchor and import consistency check passed (33 IDs,
  461 local links, eight historical commit references). Independent scenario
  evaluation and final exact-patch review remain pending.
- 2026-11-13: independent evaluation completed six scenarios and renewed the
  clarified workflow with no blocker. Final01 host checks passed for 15 documents,
  462 local links, all 33 records and all three skills. Candidate-label wording
  was aligned afterward; final exact-patch review remains pending.
- 2026-11-13: [FREG-CR-R1-20261113](../evidence/findings-registry/review-r1.md)
  approved all 15 implementation paths and 67 bound inputs without findings.
  M1-M3 are complete for implementation and workflow validation. Archived after
  approval; final documentation identities and links receive a separate closeout
  assessment. No commit, push or publication was performed.

## Discoveries and decisions

- Seed 33 case records, not 33 asserted current bugs. CFR includes an intentional
  policy and a resolved contract decision; PN includes fault-injected controls;
  the FPA selections preserve an unsupported case and two deferrals.
- Historical sources remain authoritative for what they recorded; the registry
  records later corrections without editing those originals.
- Use Markdown and existing checks. No new runtime or registry-tool dependency.
- Initial host validation exposed tooling selection issues: default Python lacked
  PyYAML, and the app pnpm was 11.25.0 rather than the repository's 11.15.1. The
  existing local interpreter with PyYAML and offline Corepack shim resolved these
  checks without installing dependencies or changing project/global settings.

## Final validation results

Initial host results: `pnpm.cmd check:evidence` passed with the offline Corepack
shim; installed `quick_validate.py` passed for `audit-logic`, `investigate-bug`
and `implement-feature` using an existing isolated Python invocation. The
temporary `python -I -B tmp/evidence/findings-registry/check-docs.py` check and
`git diff --check` passed. Raw command receipts and input identities will be
retained privately for the final review. No runtime test result is claimed.

The independent scenario evaluation and its clarification renewal completed
without blockers. R1 approved the frozen patch and reviewed the host evidence.
The [validation summary](../evidence/findings-registry/validation-summary.md)
records the actual commands, initial tool-selection failures and acceptance
limits. Final archival documentation receives renewed checks and a separate
closeout report in the same evidence directory; the original R1 remains immutable.
Runtime format/lint/type/unit/browser/native/model/build gates are not
applicable to these Markdown-only changes.
