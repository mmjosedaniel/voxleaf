# APPROVED WORK ORDER

Order ID: MOD-A-WORK-02
Target ID: MOD-A
Goal: accept only the existing formatted behavior-preserving settings extraction
after independent validation, without further source edits.
Risk: medium
Allowed files:

- apps/desktop/src/App.tsx
- apps/desktop/src/App.test.tsx
- apps/desktop/src/settings/narration-settings-actions.ts
- apps/desktop/src/settings/narration-settings-actions.test.ts

Required edits: none further. This replaces WORK-01's size estimate for the
current formatted 568-line patch after [MOD-A-AUDIT-02](MOD-A-audit-02.md).
Keep the original extraction and direct tests; App.test.tsx remains unchanged.
Behavior invariants: all WORK-01 and AUDIT-02 invariants remain binding verbatim.
Forbidden changes: all WORK-01 exclusions, any further source edit, or resetting
the two consumed correction loops. A new failure requires stopping/redesign.
Diff ceiling: four paths, at most 575 total added/deleted lines; current 568 only.
Baseline evidence: [MOD-A-BASELINE-01-20261006](MOD-A-baseline-01.md), PASS before
all source edits at unchanged HEAD c140d0f2971cd6498fff2728dfa009acd01126f1.
This is not a fabricated baseline of the already modified patch.
Worker validation: exact-path Prettier already exited 0, see change 03; no more.
Acceptance commands: all ten in WORK-01, unchanged, in host PowerShell outside
sandbox with a new independent report/path manifest. Full portfolio remains
blocked by privileged offline setup; partial passes cannot accept MOD-A.
Completion output: independent Validation Report; no source edits or Git mutations.

Director decision: accepted audit revision 02 and froze this replacement before
new validation. It permits neither scope expansion nor a third correction loop.
