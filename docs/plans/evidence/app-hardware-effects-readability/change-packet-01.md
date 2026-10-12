# Change Packet

Target ID: APP-HARDWARE-READABILITY-01.
Order: APP-HARDWARE-READABILITY-WORK-01.
Worker: clean_code_worker, GPT-6.1 Sol high.
Source HEAD: `609ae1b290e1070586a9142cd0063fffd2476910`.

| Files changed | Symbols and required edit mapping | Added/deleted |
| --- | --- | --- |
| `apps/desktop/src/App.tsx` | Same-position/dependency hardware effect calls binding; two private readonly preference interfaces replace inline state types; exact derived restoration/close-failure conditions | +36 / -37 |
| `apps/desktop/src/App.test.tsx` | Actual-document StrictMode subscription, transition, unmount inactivity and coordinator cleanup; restores descriptor and listener spies | +69 / -0 |
| `apps/desktop/src/tts/hardware-compatibility-check-binding.ts` | New binding and narrow private target/visibility contracts | +37 / -0 |
| `apps/desktop/src/tts/hardware-compatibility-check-binding.test.ts` | Four deterministic cases, including parameterized initial visibility | +141 / -0 |

Total: **320 added/deleted lines**, four files, within the 350-line ceiling.

Invariants preserved: receiver-bound `void` calls; ensure-check, initial
visibility, then registration; binding-local flag consumed before resume check;
synchronous exact-listener removal; App construction/closure ownership and hook
ordering; preference fields/defaults/setters; equivalent UI conditions. Public
contracts, persistence, cancellation, bounds, locators, synchronization, privacy,
local inference and default audio non-persistence remain unchanged.

Tests changed: five added cases; all existing tests/assertions retained. Unit
coverage includes setup order without awaiting, receivers, initial visible and
hidden state, repetitions/cycles, reentrant consume-before-check, independent
bindings, exact synchronous removal and later inactivity. Integration exercises
the real document under StrictMode, one effective subscription and unmount;
it does not demand a single total `ensureChecked` invocation.

Deviations: none. No Git mutation; director documentation preserved. Worker is
idle before independent validation. Director scope review confirms the closed
allowlist, requested transformations and unchanged remaining App responsibilities.

Worker formatting (local PowerShell outside sandbox), exit 0:

```powershell
pnpm.cmd exec prettier --write apps/desktop/src/App.tsx apps/desktop/src/App.test.tsx apps/desktop/src/tts/hardware-compatibility-check-binding.ts apps/desktop/src/tts/hardware-compatibility-check-binding.test.ts
```

Remaining validation at packet issuance: all nine acceptance commands in the
frozen order. This Change Packet is not acceptance evidence.
