# Narration presentation execution order

Target: `SRC-NARRATION-PRESENTATION-01`. Fresh execution audit: CHANGE, low
risk. The component embeds seven ordered failure outcomes and keeps phase and
availability decisions private; the six existing component cases cover only
selected combinations. A pure module provides a direct message-test seam.

## APPROVED WORK ORDER

Goal: expose the existing pure presentation rules without changing behavior.
Allowed files:

- `apps/desktop/src/tts/ProductNarrationControls.tsx`
- `apps/desktop/src/tts/ProductNarrationControls.test.tsx`
- `apps/desktop/src/tts/product-narration-presentation.ts` (new)
- `apps/desktop/src/tts/product-narration-presentation.test.ts` (new)

Required edits: extract `productNarrationAvailabilityMessage`,
`productNarrationPhaseMessage`, and `productNarrationFailureMessage` into the
new module, retaining existing profile constants and type-only snapshot imports.
Use only consumed snapshot fields. Preserve exact strings, availability/profile
variants and fallback; phase priority is recovery, failure, preparing/service,
playback, availability. Failure priority is preparation, contained, unavailable,
permitted recovery/action, profile unavailable, cleanup. Use explicit returns.
Replace only message call sites, retain the failure guard and paragraph, and
add direct branch/overlap tests. Existing component assertions remain; a small
absence-of-error-paragraph assertion is permitted.

Forbidden: changes to effects, subscriptions, actions, booleans, cancellation,
disclosure, JSX structure/accessibility, domain owners, public contracts,
dependencies, CSS, hooks, generated/frozen sources, persistence or unrelated
files. Helpers perform no actions or mutable reads. No Git mutations.

Ceiling: four paths, 500 added plus removed lines. Worker validation: only
targeted formatting outside the sandbox if needed; independent acceptance uses
all seven commands below. Completion: Change Packet only. Stop on scope drift.

## Independent baseline

Report ID: `SRC-NARRATION-PRESENTATION-01-BASELINE-20261013-01`.
Verdict: PASS. Starting and ending HEAD:
`5be831c23135ca00f94b2b3374f0330de2b658ce`. Local PowerShell 7.6.5 outside
the sandbox (`require_escalated`), Node 24.20.0, pnpm 11.15.1 through the existing
process-local Corepack shim. No machine/repository configuration changes.

Commands, all exit 0; the same list is required after implementation:

1. `pnpm.cmd build:packages`
2. `pnpm.cmd --filter @voxleaf/desktop typecheck`
3. `pnpm.cmd --filter @voxleaf/desktop test` — 677 Vitest / 70 Node tests.
4. `pnpm.cmd format:check:typescript`
5. `pnpm.cmd lint:typescript`
6. `pnpm.cmd --filter @voxleaf/desktop build`
7. `pnpm.cmd test:browser` — seven Chromium cases.

`git diff --check` passed. HEAD/path recheck and empty-index checks passed.
Only the director's separate progress edit existed outside the allowlist.
Existing Vite chunk-size and color-environment warnings were nonfatal.
This is no model-backed/native or implementation acceptance.

| Path suffix under `apps/desktop/src/tts/` | Porcelain | SHA-256 | Expected filtered blob |
| --- | --- | --- | --- |
| `ProductNarrationControls.tsx` | empty | `8300AE18233B02C8366ABB8BCC81C97106B9F71D18B56F77383B2BFC8B0CF078` | `e37f48e95f5f6abd27d3eaf3ded1e810328a4d02` |
| `ProductNarrationControls.test.tsx` | empty | `02B2A3AAA400AAD98D844EBF29F01FB2FE4B77FFEE8C4244B930E636794F1707` | `598a7722744762010d8261915b53e452ddc70c5e` |
| `product-narration-presentation.ts` | empty | ABSENT | ABSENT |
| `product-narration-presentation.test.ts` | empty | ABSENT | ABSENT |

Scope, baseline invariants, existing-test integrity and privacy/artifacts all
passed independent review. Source identities were unchanged after commands.
