# Audit Packet

Record ID: TFR-03-AUDIT-SKIP-20261019-01

Target ID: TFR-03 / TFR-BATCH.
Decision: SKIP, accepted by director. Risk: high (synchronization/lifecycle).
Auditor: configured `clean_code_auditor`, GPT-6.1 Sol high, read-only.
Source HEAD: `2648617f86fdfd7dddc8dc81fdeabd36942f3c3c`.

Primary target: `ReaderPublicationContent` narration effects in
`apps/desktop/src/reader/ReaderPublication.tsx`, lines 648-685 at this HEAD.
Related context: complete `ReaderPublication.test.tsx`; paragraph-leaf and
segment-highlight controllers/tests; `ReaderNarrationSource`; StrictMode-safe
resource cleanup; coordinator observe/subscription methods; App publication key.

Concrete evidence: each short effect already owns one cohesive lifecycle:
missing-source handling, state subscription, progress subscription, initial
reconciliation, explicit cleanup. Controllers separately own domain projection,
range validation, following, cancellation and visual-sampling release. Highlight
clearing on absent source/cleanup is visibly distinct from paragraph no-op.
Moving these statements into two exported internal bindings would preserve
nearly all wiring duplication and add a module boundary without demonstrated
ownership or verification benefit. No existing binding abstraction is bypassed.
Component size and subjective naming benefit do not justify this extraction.

Behavior invariants: preserve effect dependencies and source/controller identity;
state then progress subscriptions then current observation; receiver-bound calls;
original progress object forwarding; progress-before-state unsubscribe; highlight
clear after unsubscribe and on missing source; paragraph no-op without source;
StrictMode/replacement/disposal, DOM, focus, restoration, navigation, sampling,
stable locators, bounded state, privacy and persistence ownership.

## Coverage map

| Invariant | Existing assertions | Gap and decision |
| --- | --- | --- |
| Initial paragraph reconciliation | Explicit canonical-leaf and restored-checkpoint tests | Exact setup/read count absent; no extraction required to test. |
| State/progress routing | Leaf preparation/audible/stale-completion/stopped checks | Callback object identity unasserted; behavior exercised. |
| Highlight/follow | Cross-chapter test preserves focus/URL, avoids user navigation and clears on stop | Initially already-active source not directly characterized. |
| Receivers | Manual source and controllers use private fields; existing tests execute their methods | No dedicated receiver test needed. |
| Teardown | Two state/two progress listeners before unmount, zero afterward | Unsubscribe order unasserted; existing fixture can record it. |
| Replacement/removal | Explicit source dependencies and returned cleanup | No source A-to-B/absent rerender case; missing characterization, not defect evidence. |
| Missing-source distinction | Safe no-source renders; explicit source branches | No direct comparative assertion; no new tests for skipped unit. |
| Highlight clear ordering | Component stop and controller clear/terminal checks | Exact unsubscribe/clear sequence unasserted. |
| StrictMode | Leaf remains available through mount probe; deferred resource disposal mechanism | Listener count/post-probe routing not explicitly asserted. |
| DOM/focus/sampling | Replacement/unmount registration, cross-chapter focus, controller materialization/stale/sampling checks | No extraction-specific gap. |
| Passive persistence isolation | Canonical passive positions, no focus/storage side effects, reflow settlement checks | No relevant gap. |

The existing fixture, public controller methods and rerender support permit
characterization at the current component boundary. These gaps do not require
production refactoring, and no leak or stale-projection failure was demonstrated.

Allowed implementation files: none. Reviewed candidate paths were
`apps/desktop/src/reader/ReaderPublication.tsx`,
`apps/desktop/src/reader/ReaderPublication.test.tsx`, and absent proposed
`apps/desktop/src/reader/narration-bindings.ts` and
`apps/desktop/src/reader/narration-bindings.test.ts`.
Proposed edits: none; do not create proposed files.
Forbidden edits: style/size-driven extraction, generic subscription framework,
changed controller ownership/effect dependencies/receivers/order/reset/clear,
navigation/persistence changes or unrelated cleanup.
Diff ceiling: zero; unused candidate ceiling remains four files/320 lines.

Baseline commands: none for static SKIP; no runtime PASS claimed.
Post-change commands: not applicable. Gate ledger: combined G-BROWSER,
G-CROSS, G-FINAL and G-DOCS remain mandatory for the campaign's changed units
under section 8. SKIP waives no other gate. A later implementation decision
requires concrete justification, current audit/order and independent baseline,
including G-FAST/G-BUILD/G-DESKTOP/G-BROWSER/G-NATIVE/filtered G-HOST. Reuse
requires validator proof of unchanged inputs/artifacts/environment.

Documentation impact: record audited/SKIP in active plan and evidence only.
No product, architecture or diagram change. Decision required: none; user and
skill explicitly allow justified SKIP. No tests executed by the auditor.
