# Independent feature and bug review

This workflow adds a non-editing correctness review to `implement-feature` and
`investigate-bug`. It is contributor tooling, not part of VoxLeaf's runtime.

## When review is required

Delegate to `change_reviewer` before declaring a feature or bug fix complete
when it changes runtime behavior, public contracts, or interactions between
components/processes. This includes a one-file behavioral fix. Test changes
that alter acceptance criteria or remove behavioral coverage also require review.
A read-only investigation with no patch needs no change review.

Trivial documentation, spelling, or formatting-only changes with no behavioral
or contract effect are exempt. Record the exemption briefly in the final report.
Changes to documented commands, support claims, privacy rules, or acceptance
criteria require substantive review and the affected checks. Identify consumers
of Markdown and XML inputs used by builds, fixtures, or benchmarks, and follow
their scope restrictions and acceptance gates. If the plan protects such an
input, obtain an authorized scope change before editing it.

The [ExecPlan rules](../../.agents/PLANS.md) exempt small isolated documentation
changes and obvious one-file fixes from planning. A one-file behavioral fix
still requires change review. A related bounded no-change audit may record its
scope, findings, and limitations in an existing authorized task record when a
separate plan is unnecessary. Broad or repeated logic audits follow the
[findings workflow](findings/README.md), including coverage for zero findings
and the limits of the requested write scope.

Behavior-preserving refactor campaigns continue to use their independent
`refactor_validator`; do not add this reviewer to every refactor unit.

## Roles and permissions

- The coordinator owns scope, requirements, acceptance, and any authorized Git
  handoff. Prefer GPT-6.1 Sol for implementation, in the primary task or a bounded
  general-purpose worker. Do not use `clean_code_worker` for behavior changes.
- `change_reviewer` uses GPT-6 Astra high and read-only permissions. It reviews
  code and supplied test evidence; it does not execute tests, edit, or delegate.
- The implementer or separately assigned test executor runs relevant checks in
  normal local PowerShell outside the sandbox and supplies exact results. Review
  does not replace tests, native/hardware checks, or required human acceptance.

Use one independent reviewer task, within the existing four-supporting-thread
limit. Pause writing and Git mutations while the patch is being reviewed. Give
the reviewer the request and source evidence, not a suggested verdict or the
implementer's reasoning transcript. Prefer fresh context when supported. Reuse
that reviewer for corrections, with fresh code and evidence for each revision.

Confirm the named role is available in the current session. If it is missing or
stale, start a fresh project task to load the definition. If the role/model still
cannot run, report review as BLOCKED; do not substitute the implementing agent
or silently claim an independent review. Preparatory work may continue, but the
change cannot be declared accepted until the required review is complete.

## Review request

The coordinator supplies:

- Task ID, requested behavior or reproduction, acceptance criteria, and relevant
  requirements/ADRs. Separate intended changes from behavior to preserve.
- For findings-based work, include stable IDs and original trigger/owner links
  from the [findings registry](findings/README.md), plus the bounded neighboring
  cases and evidence-backed reason earlier coverage missed the case, or unknown.
- Exact base commit and current HEAD, task-owned changed paths, complete diff,
  and full contents of new/untracked files. Include relevant callers and tests.
  Identify pre-existing user changes explicitly; do not include them as task work.
- A closed reviewed-path list and identities. Reuse the status, SHA-256,
  filter-aware blob ID, and DELETED representation from the
  [refactor identity contract](../../.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md#validation-identity-and-freshness),
  including both sides of renames and unchanged supporting paths examined.
- Exact test commands, execution environment, exit statuses, results, and the
  code identities to which those results apply. Mark missing evidence honestly.
  Provide only content-safe results; never include private EPUB text or audio.

For a compact request, pin a retrievable immutable manifest by path, record ID and verified SHA-256. Either list the exact inherited subset or inherit its complete closed set plus an explicit delta; do not re-enumerate unchanged paths in the latter case. Record additions/replacements/removals and both rename sides with their current identities. Include unchanged supporting inputs. Reconstruct the complete closed manifest deterministically with existing Git/hash tools (task-local scripts may help), then compare it to the actual diff, untracked contents and current path identities.

Missing records, cycles, duplicate or ambiguous entries and identity mismatches block inheritance. A newly captured full manifest allows a fresh review request, not renewal of an old approval or repair of invalid test evidence. Gate reuse still needs complete input/environment proof and the reviewer must issue a new verdict. Manifest composition never inherits approval.

The reviewer checks that the request covers the actual task diff and snapshots
base/HEAD and reviewed identities before and after inspection. Evidence from a
different code revision cannot establish acceptance. The identity representation
is shared with refactoring; its behavior-preserving work orders and Validation
Report verdicts are not imposed on this workflow.

## Change Review Report

```text
# Change Review Report
Review ID: <unique task/revision/attempt identifier; never reuse>
Task ID: <request identifier>
Verdict: APPROVE | CHANGES_REQUESTED | BLOCKED
Base commit and reviewed HEAD: <full SHAs>
Reviewed paths and identities: <closed manifest>
Identity recheck: PASS | FAIL, <comparison before/after review>
Acceptance review: <criteria checked, evidence, and remaining gaps>
Test evidence reviewed: <attributed commands/results and matching code identity>
Findings: none | <for each: severity, file/line or symbol, trigger, consequence,
  evidence, and bounded correction criterion>
Remaining uncertainty: none | <specific unverified issue>
Required next action: none | <correction or missing evidence>
```

APPROVE requires complete scope, matching identities, relevant passing check
results from the host, and no actionable findings. It means the independent
review gate passed, not that the reviewer executed those tests. CHANGES_REQUESTED
requires a concrete defect, regression, or demonstrated acceptance/coverage gap.
BLOCKED covers missing requirements, unavailable evidence, or identity drift;
it is not a claim that the implementation is defective. Do not invent findings
to justify the review or treat subjective style preferences as blockers.

For findings-based work, first verify that the original trigger, current owner,
regression test and proposed resolution describe the same path. Inspect the
test's distinguishing assertion and relevant continuation/negative controls.
Separate direct mocked calls, controlled fault injection and actual interaction
coverage. A renamed test or a passing neighboring validator does not close the
reported case. Confirm historical disposition and latest-check status remain
separate, and link any recurrence or variant without rewriting old evidence.

## Corrections and completion

The implementer addresses findings within the authorized scope, reruns affected
checks, and sends the revised diff and evidence to the reviewer. If a finding is
disputed, provide concrete counterevidence for the reviewer to reassess; the
implementer cannot dismiss its own review gate. Escalate unresolved requirement
or scope decisions to the coordinator or user as appropriate.

Each report is immutable. Any later base/HEAD, reviewed-path, or content change
requires a new review ID and assessment of the current patch. Do not refresh old
hashes to renew approval. Reuse unaffected check evidence only when repository
policy permits it and the evidence proves that relevant inputs and execution
conditions still match. Changes to a runner, configuration, or other supporting
input invalidate the affected check evidence. Run affected checks on current
inputs and record their results. Before completion or an authorized commit, the
coordinator rechecks the reviewed identities against the current state. A
staging-only porcelain status change does not require another review when HEAD,
paths, file contents, and expected staged blobs still match. A staged blob
mismatch blocks acceptance. Recheck the index after any authorized correction.
If the staged candidate differs from the reviewed patch, it requires a new
assessment.

### Compact closeout

Ordinarily review one real final candidate, with final plan location, indexes and guide edits already prepared. Preserve separate implementation/archival approvals when the existing plan requires them. Reserve unique report ID/path and, if needed, one coordinator closeout path before freezing the candidate; both destinations must be absent, never replacements for prior evidence. Use neutral links to those verdict/result authorities rather than a status that must be edited after approval. An archival move is preparation; it does not establish completion.

Only the exact reserved terminal records are excluded from their own candidate manifest: the authentic reviewer report and a narrow coordinator record of post-persistence commands, outcomes and identity checks. Source, tests, policies, plans and indexes remain reviewed inputs. The coordinator record cannot introduce decisions, expand scope, change requirements, reinterpret results or alter the verdict. Corrections or any other candidate drift require a new assessment under the rules above.

Save the issued report unchanged and verify it against the reviewer output. Rerun affected document/link checks and recheck frozen identities; save those outcomes briefly in the reserved coordinator record, binding it to the authentic Report ID and verdict without rewriting them. Check that record's privacy/links and compare final HEAD, worktree paths/identities and index to the frozen candidate plus only the exact reserved output additions; the staging-only exception above still applies. Report that last check in the final response without another recursive record. Failure blocks completion. Preserve every failed/corrective review as immutable evidence; do not create separate narratives repeating plan, report and logs.

Link the report from the existing ExecPlan when required. Final delivery names its ID, verdict, addressed findings, exact checks and remaining limitations. Exempt changes need only the exemption reason. This closeout does not alter refactor validation/Git contracts or older plan requirements.

A Change Review Report does not grant Git permissions and cannot replace the
POST-CHANGE Validation Report required by a refactor Git Action Order. Keep the
[existing Git workflow](git-workflow.md) and user authorization boundaries.
