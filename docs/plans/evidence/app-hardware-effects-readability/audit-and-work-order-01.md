# APP-HARDWARE-READABILITY-01 audit and approved work order

Execution date: 2026-10-11 (America/Bogota).
Source HEAD: `609ae1b290e1070586a9142cd0063fffd2476910`.
Branch: `codex/app-hardware-effects-readability`.

## Accepted Audit Packet

Audit ID: APP-HARDWARE-READABILITY-AUDIT-01.
Target ID: APP-HARDWARE-READABILITY-01.
Decision: CHANGE. Risk: medium. Independent role: clean_code_auditor,
GPT-6.1 Sol high; no edits or tests performed by the auditor.

Concrete evidence: App's hardware effect combines startup invocation, initial
visibility, a closure-local hidden flag, event policy and synchronous listener
cleanup. The App suite has no visibility-event case; coordinator tests prove
coalescing and pre-start checks, not the document bridge. The existing
`bindNarrationPositionPersistence` establishes the narrow-input/disconnect
pattern. Requested private preference types and named conditions are local
readability changes, not demonstrated defects. Duplicate listeners and hydration
races are not claimed as existing bugs.

Related context: App and tests, compatibility coordinator and tests, persistence
binding and tests, StrictMode cleanup, reader restore/save and preference
repositories, settings actions, App presentation, configured package scripts,
Vitest setup and browser/native prerequisites. Required project, product,
architecture, ADR, testing and evidence-retention documentation was consulted.

The four source paths were clean, the index empty, and the two planned binding
paths absent. Director coordination documentation is outside this source unit.
No architecture, product-policy or dependency change is needed. Hydration,
other lifecycle effects, handlers and visual projection remain excluded.

## APPROVED WORK ORDER

Order ID: APP-HARDWARE-READABILITY-WORK-01.
Target ID: APP-HARDWARE-READABILITY-01.
Goal: make the existing document-to-hardware event policy independently testable
and name the requested local preference shapes and UI conditions without
changing behavior.
Risk: medium.

Allowed files (closed list):

- `apps/desktop/src/App.tsx`
- `apps/desktop/src/App.test.tsx`
- `apps/desktop/src/tts/hardware-compatibility-check-binding.ts` (new)
- `apps/desktop/src/tts/hardware-compatibility-check-binding.test.ts` (new)

Required edits:

1. Add `bindHardwareCompatibilityChecks(target, visibilitySource): () => void`
   with a type-only narrow coordinator contract (`ensureChecked`, `check`) and
   only needed document visibility/listener members. Transfer the existing
   effect policy without changing its sequence.
2. Replace App's hardware effect body with that binding at the same hook
   location, preserving `[hardwareCompatibilityCoordinator]` and ownership.
3. Add private readonly `ReaderPreferencePresentation` and
   `NarrationStartPreferencePresentation` next to status aliases and use them
   in the corresponding state type arguments; retain all fields/defaults/setters.
4. Add render-derived `isRestoringReader` and `hasBlockingCloseFailure` with the
   exact expressions in section 6 of the ExecPlan. Use them in `isBusy` and
   `openDisabled` exactly as specified.
5. Add colocated deterministic tests for initial visible/hidden state, startup
   order without awaiting completion, receiver preservation, hidden/non-hidden
   transitions and repetitions, new hidden cycles, independent binding flags,
   synchronous disconnect and later inactivity.
6. Add App integration driving actual document visibility, StrictMode's one
   effective subscription and unmount inactivity. Restore document descriptors
   and listener spies; preserve all existing tests and assertions.

Behavior invariants:

1. Call `target.ensureChecked()` first with receiver and `void` semantics,
   then read initial visibility, then register one listener. No await.
2. Each binding owns its hidden flag. Initial hidden or a hidden event arms it;
   the next non-hidden event consumes it before bound
   `target.check("operating-system-resume")`. Repeated non-hidden events do not
   check until a new hidden period.
3. Keep document method receivers. Disconnect removes the exact listener
   synchronously; later dispatched events cannot reach that binding.
4. App alone creates/closes the coordinator through existing StrictMode-safe
   cleanup. StrictMode leaves one effective listener; no assertion demands a
   single total `ensureChecked` invocation.
5. Preserve preference shape/read-only typing/defaults/hydration/persistence,
   exported App contracts, effect/resource ordering, guards, stable picker and
   focus, busy and close-failure policy, cancellation, memory bounds, locators,
   inference locality and default audio non-persistence.

Forbidden changes: new state, hooks, singleton, runtime freezing, retry,
debounce, coalescing, logging, error handling, awaited setup, ownership or
public-contract changes; hydration, unrelated effects or handlers, visual
projection, DOM/CSS/copy, dependencies, runner/configuration, native/Python,
generated sources, frozen authority, historical evidence and completed plans.
No test weakening, relocation, unrelated formatting or Git mutation.

Diff ceiling: four source/test files, maximum **350 total added plus deleted
lines**, counting both new files. Stop for a revised order before exceeding it.

Baseline evidence: `APP-HARDWARE-READABILITY-01-BASELINE-02`, PASS with unchanged
HEAD/path identities and empty index. `BASELINE-01` separately retains the
stale PATH EdgeDriver failure; it is not acceptance evidence. See
[baseline reports](baseline-reports.md).

Worker validation: none required; review and bounded formatting may be done
only outside sandbox using repository-configured commands. Do not run broad
formatters that modify files outside the allowlist. Independent validator owns
acceptance; director and validator remain idle while the worker writes.

Acceptance commands, from repository root in local PowerShell outside sandbox:

```powershell
pnpm.cmd run build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd run format:check:typescript
pnpm.cmd run lint:typescript
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd check:portable
pnpm.cmd check
```

Use verified pnpm 11.15.1 through process-local Corepack PATH and the existing
`VOXLEAF_EDGE_DRIVER_PATH` override for Microsoft-signed EdgeDriver
155.0.4283.45 matching installed WebView2. No global or repository setting is
changed. Raw captures belong in ignored
`tmp/evidence/app-hardware-effects-readability/`.

Completion output: Change Packet only; no staging, commit, push or PR. Worker
owns only the four source/test paths, must preserve others' work and must not
delegate. Maximum two correction loops; immutable post-change reports require
fresh validation after any source edit.
