# Logic-audit record template

Use with the [workflow](README.md). For a logic/bug audit, save the relevant
sections in one concise report under `audits/` and link it from the
[audit index](audits/README.md), including when no tests run or no bugs are found.
For an explicit read-only/no-change audit, fill them in the answer instead.
A narrow correction may use its existing ExecPlan; no duplicate report is needed.
The documentation default grants no product-edit, test, ExecPlan or Git permissions.

## Scope and snapshot

- Audit date/identifier:
- Requested scope and restrictions (including no-test/read-only):
- Full HEAD and branch:
- Target snapshot if inspecting an older revision; keep its assessment distinct
  from the working checkout:
- Initial worktree/index state and relevant dirty/untracked input identities:
- Supported paths versus tooling, historical versions and out-of-scope work:
- Registry/import sources consulted and known unimported history:
- Inspection effort (when used for comparison):

## Coverage

| Responsibility / journey | Concrete paths and event sequence examined | Coverage: inspected / partial / not inspected | Remaining questions |
| --- | --- | --- | --- |
| Populate for the requested scope | Listing a file alone is not inspection | Choose one | State limits |

## Findings and reconciliation

| VF ID or candidate label | Trigger + violated invariant + owner | Prior source and relationship | Severity / confidence / evidence level | Assessment and next step |
| --- | --- | --- | --- | --- |
| Existing ID or temporary candidate label; allocate VF only on authorized write | Include the ordered events | Same case / variant / regression / policy / new candidate | Separate static, reproduced, injected and modeled | Preserve unresolved decisions and the assessed proposition |

For each actionable candidate, include the minimal source trace, reachable
consumer and observable consequence. For each withdrawal, cite the disproving
code or applicable policy. Check the original report against the actual validator
and test before carrying forward its disposition.

## Correction coverage, when implementation is authorized

- Invariant and evidence-backed reason the earlier case escaped (or unknown):
- Bounded adjacent cases/callers and protections to preserve:
- Exact regression test and observable distinguishing assertion:
- Pre-fix RED and corrected GREEN, or documented alternative and limits:
- Negative controls; next action/retry/reopen checked where relevant:
- Selected existing checks, executed/reused/not applicable with reasons:
- Review ID and scoped verdict, or missing evidence:
- Registry update, historical transition, fix commit and integration state:

## Closeout

- Final snapshot and relevant drift since inspection:
- Candidate / static / reproduced / same-ID recurrence / new variant counts:
- Intentional / not-confirmed / deferred cases, including their reasons:
- Unique actionable VF IDs and separate provisional candidate count (avoid
  summing overlapping classifications):
- Unresolved cases and uninspected coverage:
- Actual commands/results, or explicit no-test statement:
- Saved audit report/index link and registry entries updated (including none):
- Proposed registry updates if writes were not authorized:

Do not infer bug-free status from zero findings or completeness from the word
"all". Do not report a historical fix or approval as fresh runtime evidence.
