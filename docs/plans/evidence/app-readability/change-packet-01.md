# Change Packet

Target ID: APP-READABILITY-01

Order ID: APP-READABILITY-01-WO-01

Files changed:

- `apps/desktop/src/App.tsx`: +45 / -165
- `apps/desktop/src/App.test.tsx`: +227 / -0
- `apps/desktop/src/AppPresentation.tsx`: new, +208

Actual diff: 645 added/deleted lines, three files. Worker: `clean_code_worker`
(GPT-6.1 Sol high), no delegation; writer idle after delivery.

Symbols changed: App presentation composition; new `LifecyclePresentation`,
`RestorationPresentation`, `OpenBookControl`, `PublicationHeading`,
`RestorationNotice`; relocated private `FAILURE_MESSAGE`, `statusMessage`,
`readyStatusMessage` and `restorationNotice`.

Required edit mapping:

1. Extracted three module-scope components and private message helpers.
2. Readonly resource-free lifecycle/restoration projections and type-only
   summary; typed selection callback and zero-argument dismissal callback.
3. Projections follow existing identity filtering. Picker position, busy/
   disabled calculations, dismissal ownership, handlers and effects stay intact.
4. Nine added integration cases cover input identity/reset/empty selection,
   readable empty-author fallback, settlement/preference precedence and
   dismissal across publication replacement.

Invariants preserved: exact copy, DOM/classes/accessibility, input identity,
selection ordering, message precedence, sequence dismissal, boundary/key,
mounting/optional props, Settings/focus, privacy, effects, persistence,
cancellation, locators and resource bounds.

Tests changed: additions only; all existing tests/assertions retained.

Deviations: none. Preference-failure fixtures deliberately leave startup
hydration pending; these promises own no timers/external resources, and App
cleanup marks handlers inactive. The additions do not test late startup
completion. No runtime claim extends to that untested interleaving.

Remaining validation: all nine work-order acceptance commands. Worker ran no
tests; applied exact-path formatting outside sandbox. HEAD unchanged at
`a1c2b467037e91c82aa0354d697704c967bfb5e6`, index empty.

Director inspection: full source/test diff and new module reviewed before
validation. Scope, readonly boundary, additions-only tests and 645-line ceiling
are consistent with the frozen order. No correction cycle used. Independent
runtime acceptance remains pending.
