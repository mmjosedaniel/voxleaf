# Settings naming-only execution order

Target `SRC-SETTINGS-CONDITION-04`. Fresh audit SKIP, low risk: a standalone
abstraction adds no concrete benefit. The director retains only the exact
local naming item explicitly requested by the user; this is not audit CHANGE.

## APPROVED WORK ORDER

Goal: name the repeated Reading/Appearance disabled expression.
Closed validated paths:

- `apps/desktop/src/settings/ReaderSettingsDialog.tsx` (only edited path)
- `apps/desktop/src/settings/ReaderSettingsDialog.test.tsx` (must stay unchanged)

After the closed-dialog return and before JSX, define `readerControlsDisabled`
as exactly `readerPreferencesStatus === "loading" || !canPersistReaderPreferences`.
Use it only in the existing Reading and Appearance `disabled` props.
Preserve operands/order/short-circuiting, values, callbacks, focus, hooks,
effects, subscriptions, JSX/accessibility and all domain boundaries. Do not
couple narration pending or other permissions. No helper, hook, module, state,
test or unrelated edit. Ceiling: two validated paths, one edited path, 30 added
plus removed lines. No Git mutations or worker documentation writes.

Baseline evidence below PASS. Worker may format this file outside sandbox;
independent post acceptance repeats all seven commands below and exact-expression
review. Return Change Packet; stop on scope drift.

## Independent baseline

Report ID `SRC-SETTINGS-CONDITION-04-BASELINE-20261013-01`, BASELINE, PASS.
Starting/ending HEAD `5be831c23135ca00f94b2b3374f0330de2b658ce`.
Normal local PowerShell outside sandbox (`require_escalated`), existing
process-local Corepack/pnpm 11.15.1. All commands exited 0:

1. `pnpm.cmd build:packages`
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`
3. `pnpm.cmd --filter @voxleaf/desktop test` — 723 Vitest / 70 Node.
4. `pnpm.cmd format:check:typescript`
5. `pnpm.cmd lint:typescript`
6. `pnpm.cmd --filter @voxleaf/desktop build`
7. `pnpm.cmd test:browser` — seven cases.

`git diff --check` passed. HEAD/path identity and empty-index rechecks passed;
both targets clean. Other accepted units/documentation are disjoint.

| Path under `apps/desktop/src/settings/` | Porcelain | SHA-256 | Filtered blob |
| --- | --- | --- | --- |
| `ReaderSettingsDialog.tsx` | empty | `DDEB5B20B3146ACFD5648EC56CB96E49A75A3FA17BC0244395A27A284669F9BF` | `c6f357d4c93b2b0c3423f8aef16e3524e558615a` |
| `ReaderSettingsDialog.test.tsx` | empty | `A2993C8BB0BF166993870F91824E262AA9004C378103FAD769B089D3894B3A28` | `9c416f4be7b5d208470da3d0523c977cef354f60` |

Scope, baseline invariants, existing tests and privacy/artifacts PASS. Existing
tests cover focus, preferences, lifecycle and narration integration, not every
disabled-boolean combination; exact expression equivalence supplies the latter
without redundant tests. Existing chunk/color warnings remain. No native/model
claim is made. Hardware baseline remains failed.
