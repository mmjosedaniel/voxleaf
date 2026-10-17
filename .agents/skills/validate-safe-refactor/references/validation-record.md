# Validation batch record

Use this compact template in an ExecPlan or link one filled Markdown receipt.
The [validation policy](validation-policy.md) governs selection and reuse; the
[contracts](../../orchestrate-safe-refactor/references/refactor-contracts.md)
remain authoritative for immutable Validation Reports and Git orders.
Do not paste raw logs or large file inventories into the plan.

## Scope and acceptance

- Batch ID / source HEAD:
- Units, closed paths and highest affected risk:
- Observable invariants and explicit non-goals:
- Invariant / existing test and assertion / concrete gap or no gap:
- Shared mutable paths grouped before baseline; approved builder/output paths:
- Required unit gates / pending batch gates:
- Host/tool availability and relevant environment identity:
- Source writer, independent validator and Git authorization:

## Gate ledger

| Gate ID | Invariant / exact command / cwd | Before / per unit / final | Input manifest and environment | Invalidated by | Original receipt / current decision |
| --- | --- | --- | --- | --- | --- |
| Fill from existing commands | Include arguments and build prerequisites | No retrospective baseline | Include transitive inputs and discovery membership | Name concrete causes | RUNNING / RUN / REUSE with proof / PENDING / BLOCKED |

For reuse, link the original immutable receipt and record the independent
input/environment comparison in a new report. Record exact commands actually
executed; do not report a whole aggregate as run when only its leaves ran.
For RUNNING entries, record active execution identity and receipt path and
follow the policy's resume/observe rule before launching or recovering a gate.

## Preparation and recovery

- Readiness checks and outcomes:
- Immutable cache/package manifest and build inputs:
- Separate baseline/candidate mutable paths:
- Run/attempt IDs and unique receipt paths:
- Owned processes (PID, creation time, executable identity):
- Host mutation journal (resource, original state, change, restoration):
- Cleanup verification, including preserved user resources:

Use no host mutation fields when the task does not mutate the host. Mark them
not applicable with the reason; do not request extra permissions speculatively.

## Phase and failure record

| Attempt / phase | Start / end / elapsed | Outcome and failed stage | Sanitized diagnostic / receipt | Hypothesis and changed condition before retry |
| --- | --- | --- | --- | --- |
| Preflight, fast checks, preparation, execution, cleanup, review | Actual observed timing | PASS / FAIL / BLOCKED | No private content | One infrastructure retry per stage; two source corrections |

## Closeout

- Unit reports and accepted commits:
- Batch/final gates: executed, reused, pending or blocked:
- Current independent report and identity recheck:
- Host restoration outcome:
- Remaining work and measured bottleneck:
- Next action / inventory position:

Keep this ledger outside its own validated identity manifest. A plan can link a
report ID without embedding its own hash. Freeze final documentation before
its acceptance report; any subsequent edit requires current review.
