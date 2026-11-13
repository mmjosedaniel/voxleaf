# Cumulative logic audits and findings registry

Use this workflow for logic/bug audits and for corrections that have a finding
history. The [registry](registry.md) is a maintained index of triggers, decisions
and evidence; the [import manifest](history-import.md) states its historical
coverage, and the [audit index](audits/README.md) preserves coverage and decisions
from later audits. A recorded resolution is a starting point for inspection, never a
reason to suppress a current counterexample. The registry is not a bug-free
certificate, a replacement for an ExecPlan, or permission to change the product.

Use the [audit template](audit-template.md) for a broad/repeated audit and the
[record template](#record-template) for an individual finding. Narrow fixes can
record the same information in their existing task/plan without another report.

## Start from an identified checkout

Record the full HEAD, branch, worktree/index changes and the paths in scope.
Identify any uncommitted inputs relevant to the conclusion by content identity
or a retained patch, including new files. HEAD alone cannot identify a dirty
checkout. Check again before reporting; investigate relevant drift rather than
silently combining observations from different versions. Use read-only Git
inspection (for example `git --no-optional-locks status`) where appropriate.
When raw evidence writing is separately authorized, keep inventories in the ignored location
required by [evidence retention](../evidence-retention.md). In-memory observations
and the answer are sufficient for a read-only audit; do not create scratch files
merely to satisfy this workflow.

Search the registry by symptom, owner, trigger and prior case aliases, then read
the relevant indexed audit and original plan/review/test needed to assess the
match. Consult prior coverage to identify unexamined journeys and avoid repeating
the same pass without a reason. Broaden to unimported
plans when the import manifest does not cover the relevant history. A missing
entry means unindexed history, not a proven new defect. Recovery, navigation,
normalization, resource ownership and release tools can share symptoms while
having different contracts and callers.

Bound this history lookup to the relevant owner, trigger and aliases. Record
unexamined history and tentative novelty when that search is incomplete; auditing
a case never requires importing or rereading every completed plan.

For broad audits, list responsibilities and cross-component journeys to inspect.
Mark each as inspected, partial, or not inspected, with concrete paths/sequences
and limits. File listing and a new chat do not establish whole-repository coverage.
Finish a bounded pass with this coverage record and remaining work; do not force
a finding quota or prolong a pass until it produces a defect.

## Reconcile each candidate

Identify the supported input, ordered events, violated contract, owning function,
publicly reachable caller and observable consequence. Separate supported product
paths from maintainer tools, frozen evaluation versions, unsupported inputs and
test-harness behavior. Assign severity by consequence and reachability, separately
from confidence. If probability or natural incidence is unknown, say so.

| Relationship | Action |
| --- | --- |
| Same trigger, invariant and owner | Reuse the stable VF ID and add an assessment. Check that the fix is in this checkout and actually covers this route. |
| Same case persists after a claimed fix | Reopen the same ID with evidence; distinguish a missing/unmerged fix, failed closure and regression. Git introduction evidence is needed to call it a regression. |
| Related symptom, different trigger/owner/contract | Create a linked variant; state the distinguishing condition. Do not mark another validator or caller fixed by association. |
| Prior intentional/unsupported decision | Verify the policy and caller still apply. Retain the decision if they do; record a changed policy or a separate violating trigger explicitly. |
| Prior deferred decision | Preserve the open reason until an authorized decision or supported correction resolves it. A later resolution stays on the same identity. |
| Unconfirmed suspicion | Preserve evidence and the missing proof. A mock-only ordering is not a demonstrated product defect. |
| No matching imported case | Search relevant original sources, then create a candidate with its evidence limits. |

An ID is never recycled or renumbered. Allocate the next unused `VF-NNNN` only
during an authorized registry write, after checking other pending registry work.
For read-only proposals use existing IDs or temporary descriptive candidate labels.
Keep duplicate aliases on the surviving
entry; if an existing ID becomes a duplicate, retain it as `superseded` with the
canonical link so old references still resolve. An alias that was misclassified
must explain the mismatch, not silently equate two different routes.

## Keep historical decisions and current evidence separate

Each record has a historical disposition and a latest assessment tied to explicit
inputs. Dispositions are `candidate`, `confirmed`, `fixed`, `intentional`,
`not-confirmed`, `deferred`, or `superseded`. Retain dated transitions and their
sources when reopening or resolving a case; do not overwrite the old acceptance
claim or modify a completed plan/immutable review.

| Latest-check status | Meaning for the identified snapshot only |
| --- | --- |
| `not-revalidated` | Imported or awaiting a new assessment; historical evidence is attributed, not rerun. |
| `inspected-inconclusive` | Source was examined but reachability, policy or another necessary fact remains unresolved. State the missing proof. |
| `inspected-present` | A reachable failing sequence is supported by source inspection; no new runtime reproduction is claimed. |
| `inspected-absent` | The examined sequence is prevented or outside the current contract by source/policy evidence; not runtime validation. |
| `reproduced` | A recorded execution demonstrates the consequence. Identify ordinary interaction, controlled fault injection or modeled ordering and their limits. |
| `validated` | Discriminating current checks and required review support the scoped correction. Identify executed versus legitimately reused evidence and exact inputs. |

These assessments do not automatically carry forward to later commits. A final
source comparison can establish that a fix landed, but cannot turn historical
tests into a fresh behavioral PASS. For untouched evidence, follow the existing
review policy's full relevant-input equivalence requirements; matching one file
or merely refreshing a hash cannot renew acceptance.

State the proposition being assessed: intentional behavior can be present while
the alleged defect is absent. Record both the assessment date and target snapshot.
A retrospective check of an older commit remains historical and must not replace
the last assessment of the current checkout; preserve both observations with
their target identities. An old reproduced failure alone does not reopen a case
on a later, corrected checkout.

## Correct the causal family with a bounded change

Before editing, state the invariant and why this sequence escaped earlier work
when evidence establishes that reason. Otherwise record `unknown`; do not invent
causal certainty from chronology. Identify the minimum relevant neighboring
cases, callers and observable effects to preserve. Keep the production change
small even when the analysis crosses several owners.

Useful responsibility-specific examples, not a mandatory Cartesian product:

- Placement: exact/approximate/unavailable result; Stop or replacement while
  pending; the next explicit Play; independent visual, heard and saved positions.
- Async settings/resources: completion, cancellation, rejection, retry and later
  user action; retain ownership through cleanup and prevent stale publication.
- Narration: prefix/interior/suffix, supported token versus compound, Unicode
  separators, bounded continuation and unchanged source ranges.
- Receipts: the exact validator and consumer, semantic object order versus
  ordered arrays, primitive types, artifact identity and failure before overwrite.

Select existing fixtures and checks by these responsibilities. Where applicable,
use the same regression test against the pre-fix and corrected implementation:
RED must fail for the intended reason and GREEN must exercise the same trigger.
If historical inputs or host constraints prevent that comparison, record the
missing proof and an independently reviewed alternative; do not fabricate RED.

Check the outcome the user observes. A highlighted element does not prove its
reading position; directly injecting a manual-intent flag does not prove that a
real wheel/keyboard gesture reaches it. Continue a lifecycle regression through
the next relevant action, retry or reopen. Keep negative controls for preserved
rules, and distinguish a real browser path from a model or injected fault.

For behavioral corrections, the existing
[independent review](../agentic-change-review.md) verifies the original finding,
actual owner, discriminating test and final patch as one chain. A neighboring
test, renamed test label or large passing test count cannot close a different
trigger. New review findings receive registry IDs when they are distinct product
or tooling cases; evidence-only review adjustments stay linked to the original
case and are not counted as additional product defects.

## Respect audit scope and keep updates small

Under the project's cumulative-audit instructions, a logic/bug audit includes
maintaining its documentation within `docs/development/findings/`. A request such
as "review the code without running tests" still saves findings and coverage;
it does not authorize product/source changes, tests, an ExecPlan or Git mutations.
An explicit "read-only", "no changes" or equivalent restriction overrides this
documentation default: return proposed updates in the answer and state that they
will not be available to another chat through the repository until persisted.
Do not request a second confirmation for the default audit documentation.

For a normal audit, update only the affected registry records and save one concise
report using the [audit template](audit-template.md) under
`docs/development/findings/audits/YYYY-MM-DD-short-topic.md`; use a unique suffix
for another pass on the same day. Add its link, scope and inspected snapshot to
the [audit index](audits/README.md). Save coverage even when there are zero supported
findings, including unresolved or withdrawn candidates and uninspected paths.
Link assessments to the report and preserve the preceding dated observations.
Keep completed reports unchanged; a later pass records its own evidence.

Only update entries actually examined. Do not carry untouched statuses forward
to the new HEAD or reopen an ID solely because it was inspected at an older commit.
If write permissions prevent persistence, report that limitation and provide the
proposed record updates; never claim the repository retained them. Keep a single
writer, reconcile pending IDs, and leave unrelated worktree changes intact.

Static discovery can remain useful without running tests, provided its evidence
level is explicit. During an authorized fix/registry update, maintain the affected
entries and links as part of that task. Use
[AGENTS](../../../AGENTS.md), the project skills and existing plan criteria for
implementation and approval, not a new parallel approval workflow.

A read-only audit completes with its bounded findings, coverage and uncertainty
report. Implementation test/acceptance gates apply when implementation is in
scope, not as an implicit requirement to execute tests during static discovery.

Keep records concise and source-linked. Use public repository paths and synthetic
examples, omit private chat excerpts, local account paths, book text and audio.
Historical import verifies attribution, mapping and links; it does not rerun every
old test. Add older records when useful, updating the import manifest's coverage.

## Measure comparable outcomes

For each audit, report candidates, statically supported cases, reproduced cases,
same-ID recurrences, new variants and intentional/deferred/unsupported decisions
separately. These dimensions overlap; never sum them as a unique bug count.
Count unique VF IDs within a declared classification and snapshot. Record
unresolved cases, severity, scope and inspection effort when comparing passes.
Report provisional candidate labels separately until authorized reconciliation
assigns or matches a stable ID.

Track a regression only with evidence linking a change to the introduced failure;
otherwise label its origin unknown. Record reopened IDs and why prior closure
failed. Compare fixed scopes/criteria and report coverage changes; raw findings
per chat, tests passed or historical resolutions are not remaining-defect counts.
No empty audit proves absence of bugs, and no numeric target forces acceptance.

## Record template

Use a `## VF-NNNN` heading so links remain stable. The registry's compact imported
format is equivalent; future changes must retain the same information.

```text
Summary / family:
Aliases and related VF IDs (same trigger, variant, regression, policy successor):
Trigger: supported input, preconditions and ordered events.
Expected invariant / actual consequence:
Owner: exact function/validator and relevant caller; repository links.
Historical disposition and history:
  date, source/base, decision/fix commit (or unknown), plan/review links.
Why it escaped / causal origin: evidence-backed reason or unknown.
Regression proof: test file + test name, expected distinguishing assertion,
  neighboring controls, review/receipt, evidence level and limitations.
Latest assessment:
  assessment date, target snapshot (and working HEAD if different), branch +
  relevant dirty-input identities, proposition, status,
  inspected/executed/reused evidence and limitations.
Next action / unresolved scope:
```
