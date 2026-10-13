# Settings naming-only independent acceptance

Report ID `SRC-SETTINGS-CONDITION-04-POST-CHANGE-20261013-01`.
Target `SRC-SETTINGS-CONDITION-04`, POST-CHANGE, PASS. Starting/ending HEAD
`5be831c23135ca00f94b2b3374f0330de2b658ce`. Local PowerShell outside sandbox
(`require_escalated`), process-local Corepack/pnpm 11.15.1.

All seven exact commands in [the frozen order](settings-order.md) exited 0:
package build, desktop types, desktop tests (723 Vitest / 70 Node), TypeScript
format/lint, Vite build and browser (seven cases). `git diff --check` and
empty-index checks passed before/after; HEAD and both identities matched.

| Closed validated path under `apps/desktop/src/settings/` | Porcelain prefix | SHA-256 | Filtered blob |
| --- | --- | --- | --- |
| `ReaderSettingsDialog.tsx` | ` M` | `22CB04629390061C5EEA0C8F5E72D58589D753A2BE3C4930682A35FB97EEC43D` | `423a72988e2b77b8d5c72e1e40c12ab91514f5fe` |
| `ReaderSettingsDialog.test.tsx` | empty | `A2993C8BB0BF166993870F91824E262AA9004C378103FAD769B089D3894B3A28` | `9c416f4be7b5d208470da3d0523c977cef354f60` |

For the changed path, exact porcelain is prefix, one space and full path;
the test status is empty and its bytes match baseline. Scope, invariants,
test integrity, privacy/artifact and identity reviews PASS. Director accepted
the 13-line diff (+5/-8) against the 30-line ceiling without a correction loop.

The constant follows the closed-dialog return and preserves the exact
`readerPreferencesStatus === "loading" || !canPersistReaderPreferences`
expression and its two Reading/Appearance consumers. No hooks, effects,
callbacks, focus, markup or narration coupling changed. Auditor SKIP remains
recorded; user-authorized local naming is the sole change. Existing tests are
unaltered; exact source review supplies boolean equivalence, not a new exhaustive
boolean test claim. No native/model-backed claim. Existing chunk/color warnings
remain nonfatal; the hardware unit remains blocked. No Git mutations.
