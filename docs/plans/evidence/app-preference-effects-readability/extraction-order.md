# APPROVED WORK ORDER

Target ID: APP-PREFERENCE-EFFECTS-01

Order ID: APP-PREFERENCE-EFFECTS-01-EXTRACTION-ORDER-01

Goal: complete both preference presentation extractions, preserving behavior,
state/resource ownership, dependencies and effect order.

Risk: medium

Allowed files:

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/App.test.tsx` (retain accepted characterization).
- `apps/desktop/src/settings/app-preference-effects.ts`
- `apps/desktop/src/settings/app-preference-effects.test.tsx`

Required edits:

1. Move unchanged presentation interfaces/status aliases to the new settings
   module. App imports their types; support module has no App dependency.
2. Extract the complete startup effect into `usePreferenceHydration(options)`.
   Narrow structural read/sink contracts, defaults and presentation setters are
   inputs. Destructure options, depend on stable members, never the options
   object. App retains states, initializers, repositories, coordinator, refs,
   handlers and call position.
3. Extract `bindNarrationStartPreferencePresentation(source, publish)` with
   narrow observe/subscribe/snapshot contracts. App retains original effect
   position, absent guard and coordinator dependency, returning the binding
   cleanup. Both extractions are mandatory.
4. Add colocated hook/binding tests covering statuses/defaults/canPersist,
   independent completion/rejection, exact reader sink asymmetry/order,
   receiver preservation, active guards after cleanup and StrictMode, fresh
   options object with stable members, exact observe/publish/subscribe order,
   projection, original unsubscribe and no reset/write/resource closure.
5. Retain all existing and accepted App characterization tests. Complement
   their integration coverage rather than copying production effects.

Behavior invariants:

1. Reader read first, narration read second, independent concurrent promise/
   error chains and original receivers; no Promise.all, serialization or cache.
2. Per-execution active guard suppresses obsolete handlers; no repository cancel.
3. Reader ready uses result preferences; other resolved statuses use supplied
   existing defaults. Restore sink precedes publication. Rejection publishes
   defaults/unavailable/canPersist true without touching restore coordinator.
4. Every narration resolved status uses result.selection; rejection uses supplied
   existing default/unavailable. Only unsupported-version disables persistence.
5. Observe and publish before subscribe, exact three-field projection, original
   unsubscribe returned. Cleanup never resets preferences or closes coordinators.
6. Preserve observed late-result order, state/ref/handler ownership, other
   effects and their order, and all privacy/memory/cancellation/locator boundaries.

Forbidden changes: outside allowlist; production seams, public App/shared/IPC
contracts, defaults, UI/DOM/CSS/copy, collaborators, other effects/handlers,
dependencies, generated/historical files, generic loaders or new precedence.
No Git mutations, documentation edits, delegation or concurrent source writers.
You are not alone; preserve all director documentation and others' changes.

Diff ceiling: four files, 1,400 added/deleted lines against initial baseline,
as approved in ceiling-refresh.md. Stop/re-audit above it; do not compress tests.

Baseline evidence: APP-PREFERENCE-EFFECTS-01-BASELINE-002 PASS, baseline-002.md.
Checkpoint evidence: APP-PREFERENCE-EFFECTS-01-CHARACTERIZATION-002 PASS,
characterization-002.md, exact identities copied there. Both at HEAD
02259dea3be33202a01ea09ca6609c728536bf0b with identity recheck PASS.
App baseline SHA256 3FD5D7A9D155F91112009BD971E731F73AB5E0949030AA464C8A74C7DD2A373D;
accepted App.test SHA256 8B2474D801B21355E4276ADA28D0036FC6E5405001D50F549133992DFB6662F0.
Module paths are ABSENT at checkpoint. This continues the same unit; existing
test changes are expected. No clean baseline reset, stash or intermediate commit.

Worker validation: no acceptance checks. Exact-path configured Prettier editing
is authorized outside sandbox using pinned pnpm 11.15.1:
`pnpm.cmd exec prettier --write apps/desktop/src/App.tsx apps/desktop/src/settings/app-preference-effects.ts apps/desktop/src/settings/app-preference-effects.test.tsx`.

Acceptance commands (local PowerShell outside sandbox):

1. `pnpm.cmd build:packages`
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`
3. `pnpm.cmd --filter @voxleaf/desktop test`
4. `pnpm.cmd format:check:typescript`
5. `pnpm.cmd lint:typescript`
6. `pnpm.cmd test:browser`
7. `pnpm.cmd test:native-startup`
8. PACKAGE: `pnpm.cmd check:portable`
9. FINAL: `pnpm.cmd check`

Completion output: Change Packet only; stop for independent acceptance; no
commit or push. One correction loop has been used; at most one remains before
the order must be redesigned.
