---
name: audit-logic
description: Review VoxLeaf source for logic errors and bugs, reconcile previous findings and report inspected coverage without implementing fixes. Use for repository or scoped static audits and repeated bug searches, including requests without tests. Use investigate-bug when implementation is requested; security-specific scans retain their own workflows.
---

# Audit VoxLeaf logic

Read `AGENTS.md` and the
[cumulative findings workflow](../../../docs/development/findings/README.md).
Use its registry, partial-import manifest and audit template progressively; load
the records and original sources relevant to the paths being examined.

- Identify full HEAD, branch and relevant dirty/untracked inputs. Plan the
  requested responsibility/journey coverage, including cross-owner event order.
  Recheck relevant drift before reporting; a path inventory is not full review.
- Inspect code, callers, requirements and existing tests without executing tests
  when forbidden. Maintain audit documentation within `docs/development/findings/`
  under the project default; this grants no product edits, tests, plan creation or
  Git mutations. Explicit read-only/no-change requests override documentation writes.
- For each candidate, identify trigger, invariant, actual owner and consequence.
  Reconcile earlier IDs by this identity, not by title. Verify old fixes and
  intentional policies against the inspected checkout; do not suppress a current
  counterexample. Link a different caller/validator/trigger as a variant.
- Distinguish source-supported sequences, natural reproductions, fault injection,
  modeled orderings, unsupported behavior and harness failures. Preserve confidence
  and frequency limits; a mock behavior alone does not establish a product bug.
- Record the bounded neighboring cases worth examining and an evidenced reason
  a repeated case escaped earlier work, or unknown. Do not implement fixes during
  discovery or turn the registry into an automatic broad refactor mandate.
- Finish a bounded pass with the template's coverage/gaps, scoped findings,
  withdrawals/intentional decisions, evidence limits and proposed next checks.
  Zero supported findings is valid. Update examined registry entries, save a
  concise report and link it in the audit index, including for no-test audits.
  Consult relevant prior audit coverage at the start of the next pass. For explicit
  read-only/no-change requests, provide proposed updates in the answer and state
  that they were not persisted for another chat. No second confirmation is needed
  for the default documentation maintenance.

Keep source references content-safe under the existing evidence policy. Report
unique case IDs and classifications rather than treating the number of chat
bullets as a remaining-defect estimate. An implementation request transitions to
the existing bug skill, applicable ExecPlan and independent-review requirements.
