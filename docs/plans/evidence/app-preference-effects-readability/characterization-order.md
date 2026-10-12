# APPROVED WORK ORDER

Target ID: APP-PREFERENCE-EFFECTS-01

Order ID: APP-PREFERENCE-EFFECTS-01-CHARACTERIZATION-ORDER-01

Goal: characterize current preference connection behavior before extracting
both connections as one behavior-preserving unit.

Risk: medium

Allowed files:

- `apps/desktop/src/App.tsx` (read-only, byte-identical to baseline).
- `apps/desktop/src/App.test.tsx` (sole writable source path this phase).

Required edits:

1. Add controlled-promise App characterization for all six repository statuses,
   defaults, unsupported-version canPersist and no read-triggered writes.
2. Prove resolved reader unavailable versus rejection restore-sink asymmetry;
   either read resolves/rejects independently while the other stays pending.
3. Characterize actual late ordering around restoration, explicit preference
   edits, reset and narrator observations. Include before/after event orders.
4. Cover unmount and StrictMode outstanding reads, initial/later snapshots,
   absent/replaced coordinator, disconnect and unrelated rerender.
5. Retain all existing tests. Use existing injected repositories/coordinator
   factory and observable boundaries; narrowly scoped collaborator spies or
   a real Settings-props observer are allowed without production seams.

Behavior invariants:

1. Production remains byte-identical. New module paths remain ABSENT.
2. Preserve every section 6 invariant and record actual event order without
   inventing precedence. Any confirmed product contradiction is reported to
   the director as a separate defect; do not correct it in this unit.
3. Assertions test observable behavior, not copies of effects; no arbitrary
   sleeps, weakened/removed existing checks or broad snapshots.

Forbidden changes: production code, defaults, public interfaces, collaborator
implementations, other source paths, dependencies, generated files, policies,
Git mutations and documentation. You are not alone in the workspace: preserve
director documentation and others' changes; stop on overlapping source edits.
Do not delegate. One worker alone writes source and stops for validation.

Diff ceiling: whole unit maximum four files and 1,100 added/deleted lines,
including future extraction and module tests. Target this phase at 450 added/
deleted lines; stop if the whole-unit budget becomes infeasible rather than
compressing assertions. Any ceiling expansion requires re-audit/new order.

Baseline evidence: APP-PREFERENCE-EFFECTS-01-BASELINE-002 PASS,
`baseline-002.md`; HEAD 02259dea3be33202a01ea09ca6609c728536bf0b and
all four identities as recorded there. Director accepted identity recheck PASS.

Worker validation: none; independent validator owns tests/checks. Manual source
formatting is permitted only within the writable path.

Acceptance commands (local PowerShell outside sandbox):

1. `pnpm.cmd --filter @voxleaf/desktop typecheck`
2. `pnpm.cmd --filter @voxleaf/desktop test`
3. `pnpm.cmd format:check:typescript`
4. `pnpm.cmd lint:typescript`

Completion output: Change Packet only; no commit or push. Stop after test-only
edits and return control. Extraction requires a separate continuation order
bound to independent checkpoint PASS; retain characterization within this unit.
