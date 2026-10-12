# Change Packet

Target ID: APP-PREFERENCE-EFFECTS-01

Files changed: `apps/desktop/src/App.test.tsx` only; +729/-1, 730 changed lines.

Symbols changed: new `App preference connection characterization` describe,
saved preference fixtures, `deferred`, `observeSettings`, `pendingPreferences`,
and `observedNarrator` test helpers.

Required edit mapping: 28 cases in 11 templates cover all six statuses,
defaults/selection/persistence policy, receiver/read order, no writes, independent
resolution/rejection, resolved unavailable versus rejection restoration effects,
reader hydration before/during/after restoration, both orders around reader and
narration edits/reset/observations, unmount, StrictMode, snapshots, absence,
replacement, unsubscribe and unrelated rerender. Settings observer renders the
real dialog. Existing tests and assertions remain intact.

Invariants preserved: production App remains baseline SHA-256
`3FD5D7A9D155F91112009BD971E731F73AB5E0949030AA464C8A74C7DD2A373D`;
both module paths ABSENT. No production contract/ownership/policy changes,
arbitrary sleeps, documentation edits or Git mutations by worker.

Tests changed: characterization only; current event order is asserted without
claiming a confirmed product defect before execution.

Deviations: approximate phase target exceeded; full-unit estimate is now
1,150-1,350 changed lines. Director requested fresh auditor ceiling review before
continuation. This phase remains below the existing 1,100-line hard ceiling.

Remaining validation: the four characterization commands in the frozen order;
worker ran no checks. Source writing stopped before independent checkpoint.
