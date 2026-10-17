# Narration presentation independent acceptance

Report ID: `SRC-NARRATION-PRESENTATION-01-POST-CHANGE-20261013-01`.
Target: `SRC-NARRATION-PRESENTATION-01`. Mode: POST-CHANGE. Verdict: PASS.
Starting/ending HEAD: `5be831c23135ca00f94b2b3374f0330de2b658ce`.
Environment: local PowerShell outside sandbox (`require_escalated`), existing
process-local Corepack shim and pnpm 11.15.1. No machine configuration changes.

The closed four-path allowlist and frozen transformations are in
[the execution order](narration-order.md). All seven order commands exited 0:
shared/EPUB build; desktop typecheck; desktop test (59 Vitest files/719 tests,
70 Node tests, no failures/skips); TypeScript format and lint; Vite build
(194 modules); browser (seven Chromium cases). `git diff --check` and empty
index checks passed before/after. Existing chunk-size/color warnings remain.

| Path under `apps/desktop/src/tts/` | Porcelain prefix | SHA-256 | Filtered blob |
| --- | --- | --- | --- |
| `ProductNarrationControls.tsx` | ` M` | `E567F27D105A355C51119BA8D243A9B6126750B12A0944859F5E4B297C1522CF` | `09c6542d41edcd26a03a4186c964882859f8a3bd` |
| `ProductNarrationControls.test.tsx` | ` M` | `7A5C274620E08ABF26A7473DD70B80352AB94D8955D57D6C07FDEE815E5DE06A` | `94ada36669ec121af3f86b69d56daf27b57b0a41` |
| `product-narration-presentation.ts` | `??` | `3A0C1EE385AFEBF1CAFB05FF1D4F2D920DE60938C95EFE43B15EB31E92450D7F` | `c6b0a1c78014061bdff6c94ce181aba3fbd37bb3` |
| `product-narration-presentation.test.ts` | `??` | `51A7D9F4EBCBF1E68FCBBC10D22CF34FB8597AE3F1B6079B7BE1C0529AC7E04D` | `dee9a0b4dd975b7074f052b808bf01f03d299f71` |

Exact porcelain is each prefix, one space, and the full path above. HEAD and
all path identities matched after commands; writers were idle. Scope,
invariants, test integrity and privacy/artifacts passed. Director inspected
the complete source diff and accepted this report without Git mutations.

The initial formatted draft exceeded the ceiling (569 lines); correction
loop 1 reduced fixture duplication without dropping assertions and added the
`stopping` case. Accepted count: 499 added plus removed (component +9/-126,
component test +1, helper 151, direct test 212). This was corrected before
validation, not a test/baseline failure.

Exact strings, precedence, failure guard, effects, subscriptions, callbacks,
accessibility, cancellation and domain ownership remain unchanged. The 42 new
cases cover profile variants, recovery overlaps, all four failures, all eleven
service states, playback, idle availability and failure guidance. Static review
covers the retained `Narration ready.` fallback, unreachable with current valid
availability values. No native/model/performance claim is made by this unit.
