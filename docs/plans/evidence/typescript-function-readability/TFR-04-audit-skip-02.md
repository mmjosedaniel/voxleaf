# Audit Packet

Record ID: TFR-04-AUDIT-20261019-02.
Supersedes only the CHANGE recommendation in TFR-04-AUDIT-20261019-01;
the earlier report remains unchanged.

Target ID: TFR-04 / TFR-BATCH. Decision: SKIP.
Risk: high (service lifecycle, cancellation and publication ordering).
Auditor: configured clean_code_auditor, GPT-6.1 Sol high, read-only.
HEAD: `2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`.

Primary target: `ProductNarrationCoordinator.#execute`, start-service and
prepare-service, in `apps/desktop/src/tts/product-narration-coordinator.ts:1317`.
Related context: paired tests, scheduler transitions at 387-408, recovery
completion at 149, coordinator pump/stop/failure containment/publication.
Both audited files remain clean:

| Path | SHA-256 |
| --- | --- |
| `apps/desktop/src/tts/product-narration-coordinator.ts` | `1063d715a7db4d96a94638ce1f00b3abb38d2a02461f58f6b942d687acf45e0b` |
| `apps/desktop/src/tts/product-narration-coordinator.test.ts` | `caa6dcb3e96482f288f1972f6661b453657e95e95de3bedab1097829694eb262` |

## Concrete evidence

Full-phase async extraction introduces a Promise settlement boundary absent
from the current branches. The continuation after client.start marks the
captured scheduler and reaches final publication in the same reaction
(1375-1402). Preparation likewise marks ready, completes recovery and clears
failures before publication (1384-1402). An async helper would perform those
marks, settle its Promise, then require another reaction for final publication.

A reaction registered on the client Promise after the coordinator's reaction
could observe an older published snapshot or invoke stop between the marks and
publication. Stop advances runToken synchronously (1084), potentially suppressing
a publication the original ordering emitted. Rejection propagation through the
helper also delays the shared catch (1404-1417), allowing invalidation before
classification and containment. This is a source-derived ordering counterexample,
not an executed regression or an existing product defect.

Synchronous helpers returning the original client Promise directly preserve
the existing await boundary, synchronous throws and catch timing. But admission
awaits and completion logic must remain in the dispatcher; moving only small
begin/publication/request sequences adds indirection without resolving the
original mixed-phase concern. Completion callbacks or continuation/result
frameworks complicate ownership solely to support extraction. Retaining the
branches preserves explicit sequencing and is the preferred bounded outcome.

## Behavior invariants and coverage

Preserve captured scheduler identity and every run-token guard; hardware before
configuration and short circuits; begin, publication, client call, await, guarded
completion and final publication order. Completion marks/recovery updates and
final publication stay within the same uninterrupted continuation. Preserve
early returns and shared catch timing/classification, cancellation/containment,
bounded resources, privacy, locators and persistence.

| Invariant | Existing assertions | Gap and decision |
| --- | --- | --- |
| Profile/language/admission | Admitted-profile/language cases; failed preflight at test 596 | Retain unchanged. |
| Missing runtime configuration | Test 568 and available-then-unavailable recheck | Exact notification trail not fully characterized; no test for untouched code. |
| Successful phase completion | Normal playback cases | No competing-reaction assertion proving immediate publication after completion marks. Relevant only if changing this boundary. |
| Shared failure classification | Protocol and warm-failure cases | Eventual containment covered; competing rejection ordering unasserted. |
| Recovery completion | Warm failure/restart at 1524-1577 | Operational recovery and failure clearing covered eventually, not relative Promise-reaction timing. |
| Invalidation/cleanup | Stop, stale-work, abort and containment | Deferred service-phase settlement coverage incomplete; no additions for skipped unit. |
| Bounds/synchronization/privacy | Ownership, navigation and semantic transitions | Retain; responsibilities untouched. |

The settleUntil helper (test 493-500) verifies eventual outcomes, not the ordering
above. Missing characterization alone does not justify modifying this boundary.

Allowed files: none for implementation; the two paths above are audit scope only.
Proposed edits: none. Diff ceiling: zero production/test files or lines.
Forbidden: source/test changes, async phase extraction, callback/result frameworks,
moved catches/publications/guards, generated/frozen authority changes, historical
report modification and unrelated cleanup.

Baseline commands: no additional command solely for SKIP. Mandatory campaign
baseline/integration remains ExecPlan section 8. Post-change commands: not
applicable to this unchanged unit. SKIP does not waive other units' or final gates.
Gate ledger retains section 8 dependencies/timing for fast, build, desktop,
native, host and combined browser/cross/final/docs gates. Only the independent
validator may decide reuse or accept SKIP; static audit supplies no test PASS.

Documentation impact: new immutable audit and current plan decision/status;
no product/architecture change. No user decision required; independent validator
review remains required. Auditor performed only read-only inspection/identity
checks, with no tests, edits or Git mutations.
