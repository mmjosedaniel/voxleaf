# Validation Report

Report ID: MOD-A-HARNESS-REPAIR-01-POST-01-20261006  
Target ID: MOD-A-HARNESS-REPAIR-01  
Mode: POST-CHANGE. Verdict: FAIL.  
Author: independent refactor_validator, local PowerShell outside sandbox.  
Node 24.20.0, pnpm 11.15.1; NODE_OPTIONS absent; documented offline/model setup
and verified signed matching driver. No filtered arms or retries.

HEAD before/after: c140d0f2971cd6498fff2728dfa009acd01126f1; index empty.

## Validated identities before and after

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `cfdcf0f1a2a816a026c0533e7f7f9ad1c7b5b590a0dde109e7d141f769c5b13b` | `65808bbbec4042937f6ee5e08917dea65920c5f8` |
| `apps/desktop/src/App.test.tsx` | empty | `8a688be72992dfaf615a06f81607811961a866172375a0145a9820e7bab78dfb` | `6a2431df8b78a16ff9995fa47abc82524c48c573` |
| `apps/desktop/src/settings/narration-settings-actions.ts` | `?? apps/desktop/src/settings/narration-settings-actions.ts` | `8782470007e32e81af7f6b04bd3cd51f878635e410ab9c70664371e327517db5` | `d49281f8ad9c336568cc6e56f6d596cd25458ac7` |
| `apps/desktop/src/settings/narration-settings-actions.test.ts` | `?? apps/desktop/src/settings/narration-settings-actions.test.ts` | `7f3d915c522c3f77fa40d7c2d30e585118e6554d91049428a052890433ae5ab1` | `a2f0b6cf72c77128e95a4134bf5be1208d1c8a24` |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `7238e6807b3d832f810f6811ab3e4b15d567969f91d89012fb2a41e1a0f7e4ac` | `2e502ceb4eecdbab0d301cbdcdddc571b859f94a` |
| `apps/desktop/scripts/adaptive-tts-profile-selection.mjs` | `?? apps/desktop/scripts/adaptive-tts-profile-selection.mjs` | `748263cc88876ffe307a733955f5ae186a7e1384b6de3cb0856c02e318e68ed8` | `084ced445f46beb814e0c1a4aa80601ac77b5adc` |
| `apps/desktop/scripts/native-webdriver-client.node-test.mjs` | ` M apps/desktop/scripts/native-webdriver-client.node-test.mjs` | `121c4d574695f9099db803a583ff86da0ac262f1459646f74325c363b873ba27` | `0b9594704cd9b10641ca4818ccdb992de7b21dfb` |

Identity recheck PASS. Seven identities unchanged; four product identities remain
frozen. Scope PASS: three repair paths, 262 changed lines within 325; product
patch remains 568 lines. Known director evidence/doc paths only.

## Commands and outcomes

1. `pnpm.cmd --filter @voxleaf/desktop test:native-driver-client`: exit 0,
   17 passed (original 12 plus five actual-DOM regressions).
2. `pnpm.cmd format:check:typescript`: exit 0.
3. `pnpm.cmd lint:typescript`: exit 0.
4. `pnpm.cmd test:tts:bilingual-portfolio-exact-host`: exit 1. Preflight UI 38,
   driver 17, portfolio 5, offline configuration, native release and native
   lifecycle passed. First four model arms passed. Qwen Serena/es failed at
   next-segment seek with webdriver-condition-timeout; Qwen Aiden/en not reached.
5. `git diff --check`: exit 0.
6. Before/after HEAD/status/SHA/blob and git diff --cached --quiet: unchanged,
   empty index, exit 0.

Pending under this fresh seven-path patch at report time: build:packages,
desktop typecheck/test, test:browser, check:portable and check. Earlier product-only
passes are not claimed as fresh seven-path acceptance evidence.

## Runtime results and limits

| Passed arm | Quick start ms | Audio lead ms | Cancellation ms | Resource release ms |
| --- | --- | --- | --- | --- |
| Piper/es | 5136 | 17076 | 374 | 707 |
| Piper/en | 5280 | 18725 | 384 | 644 |
| Chatterbox/es | 51434 | 20760 | 294 | 696 |
| Chatterbox/en | 48058 | 18120 | 420 | 815 |

All four passed at least 60 seconds stable with zero underruns, external requests,
generated audio files and post-cleanup retained units. Both Piper six-speed
matrices passed. These measured results do not imply a new performance guarantee.

Qwen/es failure snapshot: currentDocumentId/currentKey null, highlightPresent
false, leafCount zero, clearCount two, stalePlaybackObserved false, rangeValid
true. The snapshot does not establish the cause. No product-regression attribution
or automatic retry is justified by this observation alone.

Static invariant/test-integrity review PASS: same first alternate, inherited
enablement, guarded one click, already-active route, fixed assertion/rejections,
shared original 90-second budget including zero remainder; target/language/
optional/cleanup unchanged. Actual-DOM tests meaningfully distinguish the old
disabled click from readiness, activation remains required. No red run fabricated.

Privacy/artifact review PASS. Exact installed-interpreter PIDs empty before/after;
Qwen and app/driver processes empty after cleanup. Installed manifest unchanged:
1bca3c4e5706771877ad837398e7930206c8f74eb03e9804a093a4c78f0b6262.
Process environment restored; NODE_OPTIONS absent. No source/Git/install/firewall
mutation by validator. Task driver/rule retained for dependent gates.

Action required: narrow diagnosis of Qwen/es seek before another model run or
source change. MOD-A remains unaccepted; MOD-B not started. Preserve this FAIL
and the four actual arm passes, without substituting partial for full acceptance.
