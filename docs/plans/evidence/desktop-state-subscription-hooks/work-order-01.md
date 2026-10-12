# Audit decision and approved work order

## Accepted current audit

Target ID: STATE-SUBSCRIPTIONS-01. Decision: CHANGE. Risk: medium.
Independent configured `clean_code_auditor` (GPT-6.1 Sol high), 2026-10-12.
Source HEAD: `44a83f4113e9cbeadee7d8a2d0e62838df70629b`.

Four inline React bridges duplicate two receiver-sensitive cached coordinator
observation contracts. Product tests use inert subscriptions and simulate a
notification with rerender. Settings tests do not pass a narrator or exercise
replacement, fallback transitions, closed/reopened observation lifetimes, or a
fresh post-await eligibility read. These concrete reuse/testing gaps justify
two domain hooks; no existing leak or performance bottleneck is claimed.

CHANGE: the eight paths below. SKIP: HardwareCompatibilityControls.test.tsx
already covers real coordinator notifications; OptionalChatterboxControls and
client have one React observation consumer; App already memoizes its bridge;
reader, preference and hardware-effect bindings own distinct responsibilities.
The combined-unit exception is retained because both pairs meet in Settings.
No public contract, architecture, dependency or ownership change is approved.
The hook contract follows the [React reference](https://react.dev/reference/react/useSyncExternalStore).

# APPROVED WORK ORDER

Target ID: STATE-SUBSCRIPTIONS-01
Goal: Centralize the two reused React observation contracts without changing
coordinator state ownership or consumer behavior.
Risk: medium

Allowed files:

1. `apps/desktop/src/tts/use-product-narration-snapshot.ts`
2. `apps/desktop/src/tts/use-hardware-compatibility-snapshot.ts`
3. `apps/desktop/src/tts/snapshot-subscription-hooks.test.tsx`
4. `apps/desktop/src/tts/ProductNarrationControls.tsx`
5. `apps/desktop/src/tts/HardwareCompatibilityControls.tsx`
6. `apps/desktop/src/settings/ReaderSettingsDialog.tsx`
7. `apps/desktop/src/tts/ProductNarrationControls.test.tsx`
8. `apps/desktop/src/settings/ReaderSettingsDialog.test.tsx`

Required edits:

1. Add useProductNarrationSnapshot and useHardwareCompatibilitySnapshot with
   domain-specific Pick<Coordinator, "subscribe" | "observe"> source types,
   type-only coordinator/snapshot imports and explicit snapshot return types.
   Use useCallback wrappers dependent on the source for subscribe and observe;
   pass the same reader to useSyncExternalStore for client and server.
2. Add the shared colocated hook suite with a small typed receiver-sensitive
   cached-snapshot/listener harness. Cover exact snapshot identity, real
   notifications, same-source rerenders without resubscription, replacement,
   stale emissions, unmount, Strict Mode, simultaneous independent consumers,
   and absence of lifecycle/action calls. Protect the server snapshot contract.
3. Add only missing Product notification and Settings characterization tests.
   Cover live narration and hardware eligibility/status, replacement, fallback
   transitions, closed/reopened subscription cleanup, existing open-time
   version/optional-client operations, no new checks/activation/playback, and
   fresh observe after awaited recheck. Retain existing assertions and fixtures.
4. Checkpoint A: complete items 1-3 while all four original production bridges
   remain in place. Stop writing and return a partial Change Packet for an
   independent identity-bound execution receipt of the three package commands.
   This checkpoint is not final acceptance or a new overlapping baseline.
5. After director continuation, replace exactly the four inline bridges:
   ProductNarrationControls and CoordinatorNarrationStartSettings use the
   narration hook; HardwareCompatibilityControls and OptionalChatterboxSettings
   use the hardware hook. Remove only unused imports.

Behavior invariants:

1. Preserve source receiver, cached object identity, server snapshot reader,
   source-bound callback stability, replacement/stale isolation and independent
   per-consumer subscriptions; cleanup only unsubscribes.
2. Preserve Product checkAvailability in its existing [coordinator] effect.
3. Preserve Settings child ownership and fallback component split; no hooks in
   the continuously mounted parent. Closed children release all subscriptions.
4. Preserve acquisition derivation and fresh hardwareCompatibility.observe()
   following the awaited explicit recheck. Preserve optional refresh/polling,
   version loading, actions, pending cleanup, detail state, focus, disabled
   conditions, visibility, DOM, labels and ready-only Settings.
5. Preserve App/coordinator lifecycle, preference hydration/persistence,
   cancellation, stable locators, synchronization, queues/audio bounds and
   local-only privacy. Hooks neither copy state nor initiate operations.

Forbidden changes: all plan section 4 exclusions, including App, coordinators,
reader internals, hardware consumer tests, optional polling, runtime operations,
dependencies/configuration, Context/stores/selectors, snapshot projections,
CSS/DOM/copy, native/protocol code, generated sources, frozen authorities,
historical plans/evidence, unrelated formatting and every Git mutation.

Diff ceiling: eight source/test files, at most 500 added-plus-removed lines.
Stop for a revised order if insufficient; do not silently expand scope.

Baseline evidence: `STATE-SUBSCRIPTIONS-01-BASELINE-01-20261012`, PASS,
[immutable report](baseline-01.md), HEAD and eight identities unchanged.

Worker validation: none; the independent validator owns all commands.
Acceptance commands (normal local PowerShell outside the sandbox, pinned pnpm):

```powershell
pnpm.cmd build:packages
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd --filter @voxleaf/desktop test
pnpm.cmd format:check:typescript
pnpm.cmd lint:typescript
pnpm.cmd test:browser
pnpm.cmd test:native-startup
pnpm.cmd check:portable
pnpm.cmd check
```

Checkpoint A runs only the first three as an intermediate receipt. Full
post-change repeats the baseline seven, PACKAGE runs check:portable and FINAL
runs check. Documentation closure separately runs check:evidence, git diff
--check and link/scope review. No GPU/model or performance claim is authorized.

Completion output: Change Packet only; no commit or push. The single configured
worker owns all source/test writes, preserves others' work and never delegates.
Director owns documentation only while source writing/validation are idle.
