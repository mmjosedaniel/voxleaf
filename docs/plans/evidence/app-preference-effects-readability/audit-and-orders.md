# App preference effects execution orders

## Refreshed Audit Packet

Target ID: APP-PREFERENCE-EFFECTS-01

Decision: CHANGE

Risk: medium

Primary target: `apps/desktop/src/App.tsx`, startup hydration, narrator
presentation subscription and the two preference presentation interfaces.

Related context: App tests, preference repositories, restore/save coordinators,
narration settings actions, Settings dialog, narrator snapshots and StrictMode
cleanup. Auditor: `clean_code_auditor`, GPT-6.1 Sol high; read-only, no tests.

Concrete evidence: at execution HEAD
`02259dea3be33202a01ea09ca6609c728536bf0b`, App lines 240-295 combine
independent reads, defaults/status policy, restore-cache writes and presentation.
A resolved reader `unavailable` seeds the restore cache, while a rejection does
not. The pending-read fixture at App.test.tsx lines 537-541 cannot prove late
completion. Presentation also receives restoration, explicit edits, reset and
narrator observations. A narrow observer of real Settings props can expose the
fallback value hidden by live-coordinator Settings UI; no production seam is
needed. Late precedence is a characterization question, not a new policy.

Behavior invariants: all section 6 invariants of the ExecPlan, including
independent receiver-preserving read chains, per-execution active guard,
reader resolved/rejected asymmetry, exact defaults/status/persistence policy,
observe/publish before subscribe, original unsubscribe, stable member
dependencies and unchanged App state/resource/handler ownership and effect order.

Allowed files:

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/App.test.tsx`
- `apps/desktop/src/settings/app-preference-effects.ts`
- `apps/desktop/src/settings/app-preference-effects.test.tsx`

Proposed edits: characterize unchanged production first; obtain an independent
checkpoint; move the complete hydration effect and presentation types; extract
the guarded narrator binding; add colocated boundary tests.

Forbidden edits: all other source, production seams, UI/copy, defaults, public
contracts, collaborator implementations, other effects/handlers/cleanup tokens,
dependencies, generic loaders, precedence/race fixes, generated/frozen sources,
historical evidence and Git mutations.

Diff ceiling: four files, at most 1,100 added/deleted lines including moves.
Director accepted the auditor's revised estimate of 830-1,020 lines, replacing
the preliminary 750-line planning estimate before baseline/work-order freeze.

Baseline commands: `pnpm.cmd build:packages`;
`pnpm.cmd --filter @voxleaf/desktop typecheck`;
`pnpm.cmd --filter @voxleaf/desktop test`;
`pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`;
`pnpm.cmd test:browser`.

Post-change commands: characterization uses the middle four baseline commands;
completed extraction uses all six plus `pnpm.cmd test:native-startup`;
PACKAGE uses `pnpm.cmd check:portable`; FINAL uses `pnpm.cmd check`.
All run in local PowerShell outside the managed sandbox.

Documentation impact: active plan, its navigation entries and concise execution
evidence. Review diagram at closure; no architecture change expected.

Decision required: none. Production extraction remains gated on fresh baseline
and characterization PASS; any confirmed product contradiction is separate work.

## Draft work-order terms

The director accepted the packet above and sent these same closed terms to the
independent Astra high validator for BASELINE. No worker is authorized before
the baseline report passes. The first phase may edit only App.test.tsx; its
manifest also includes unchanged App.tsx and separately verifies both module
paths absent. The continuation retains these tests within the same unit.

All Git mutations are forbidden by the execution request, including staging,
commits, push, PR, merge and changes to main. Branch setup is already complete;
historical planning HEAD `0414fdc` supplies no execution baseline evidence.
