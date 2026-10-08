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
or contract effect are exempt; record the exemption briefly in the final report.
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

## Corrections and completion

The implementer addresses findings within the authorized scope, reruns affected
checks, and sends the revised diff and evidence to the reviewer. If a finding is
disputed, provide concrete counterevidence for the reviewer to reassess; the
implementer cannot dismiss its own review gate. Escalate unresolved requirement
or scope decisions to the coordinator or user as appropriate.

Each report is immutable. Any later base/HEAD, reviewed-path, or content change
requires a new review ID and assessment of the current patch. Reuse unaffected
check evidence only when its recorded inputs still match and repository policy
allows it; do not refresh old hashes to renew approval. Before completion or an
authorized commit, the coordinator rechecks the reviewed identities against the
current state. A staging-only porcelain status change does not require another
review when HEAD, paths, file contents, and expected staged blobs still match;
verify that staged content is the reviewed content. Keep the report outside its
own manifest to avoid hashing itself.

Record the review ID, verdict, addressed findings, and test evidence in the final
response and in the existing ExecPlan when one is required. Exempt changes need
only the exemption reason. Existing plan criteria remain unchanged.

A Change Review Report does not grant Git permissions and cannot replace the
POST-CHANGE Validation Report required by a refactor Git Action Order. Keep the
[existing Git workflow](git-workflow.md) and user authorization boundaries.
