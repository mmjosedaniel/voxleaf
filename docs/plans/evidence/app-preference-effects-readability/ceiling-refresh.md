# Audit Packet — ceiling refresh

Target ID: APP-PREFERENCE-EFFECTS-01

Decision: CHANGE

Risk: medium

Primary target / allowed files / invariants / forbidden edits: exactly those
in `audit-and-orders.md` and the ExecPlan section 6; no scope change.

Related context: frozen +729/-1 App characterization, current plan/order and
previously inspected collaborators. Auditor: same read-only Sol high role.
No commands or tests run in this refresh.

Concrete evidence: 28 cases cover distinct observable states and sequencing;
four helpers centralize setup and parameterized cases share related scenarios.
No concrete unnecessary overhead warrants removal or compressed assertions.
The prior 1,100 cap leaves only 370 lines for both production extractions,
moved types/contracts, hook harness and binding tests. App subscription tests
do not precisely prove publish-before-subscribe amid other subscribers, so
focused binding tests remain required.

Proposed edits: retain characterization, perform both original extractions
after checkpoint PASS and add focused module tests. Change numerical ceiling
only; do not alter frozen prior orders or identities.

Diff ceiling: four files, maximum 1,400 added/deleted lines against baseline.
Auditor estimate: existing 730 characterization + 100-130 App move/calls +
145-175 module/types + 250-330 module tests = 1,225-1,365 total. Stop and
re-audit above 1,400; do not reduce coverage to fit.

Baseline commands: unchanged section 8 group; BASELINE-002 remains authority.

Post-change commands: unchanged characterization four commands; full baseline
plus native startup after extraction; portable and native aggregate gates.

Documentation impact: director records ceiling and issues continuation after
independent checkpoint. Director accepted this recommendation.

Decision required: none beyond still-required independent checkpoint PASS.

Product interpretation: late active reads replacing previous presentation are
existing event-order observations. Closed-dialog fallback callback tests prove
callback behavior, not a reachable Settings workflow or a confirmed product
contradiction. No precedence fix is authorized or required for this refactor.
