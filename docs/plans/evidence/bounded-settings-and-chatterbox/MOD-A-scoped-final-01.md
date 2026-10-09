# Validation Report

Report ID: MOD-A-SCOPED-FINAL-01-20261006  
Target ID: MOD-A plus MOD-A-HARNESS-REPAIR-01, under MOD-A-ACCEPTANCE-SCOPE-02  
Mode: FINAL. Verdict: PASS.  
Independent validator: refactor_validator, local PowerShell outside sandbox.  
Environment: pnpm 11.15.1, Node 24.20.0.  
HEAD before/after: c140d0f2971cd6498fff2728dfa009acd01126f1.

PASS covers Piper and Chatterbox in Spanish and English, as explicitly requested.
The original six-arm portfolio remains exit 1: Qwen Spanish failed post-seek and
Qwen English was not reached. Neither Qwen arm is accepted; prior FAIL is immutable.

## Validated path identities

| Path | Exact porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `cfdcf0f1a2a816a026c0533e7f7f9ad1c7b5b590a0dde109e7d141f769c5b13b` | `65808bbbec4042937f6ee5e08917dea65920c5f8` |
| `apps/desktop/src/App.test.tsx` | empty | `8a688be72992dfaf615a06f81607811961a866172375a0145a9820e7bab78dfb` | `6a2431df8b78a16ff9995fa47abc82524c48c573` |
| `apps/desktop/src/settings/narration-settings-actions.ts` | `?? apps/desktop/src/settings/narration-settings-actions.ts` | `8782470007e32e81af7f6b04bd3cd51f878635e410ab9c70664371e327517db5` | `d49281f8ad9c336568cc6e56f6d596cd25458ac7` |
| `apps/desktop/src/settings/narration-settings-actions.test.ts` | `?? apps/desktop/src/settings/narration-settings-actions.test.ts` | `7f3d915c522c3f77fa40d7c2d30e585118e6554d91049428a052890433ae5ab1` | `a2f0b6cf72c77128e95a4134bf5be1208d1c8a24` |
| `apps/desktop/scripts/native-startup-smoke.mjs` | ` M apps/desktop/scripts/native-startup-smoke.mjs` | `7238e6807b3d832f810f6811ab3e4b15d567969f91d89012fb2a41e1a0f7e4ac` | `2e502ceb4eecdbab0d301cbdcdddc571b859f94a` |
| `apps/desktop/scripts/adaptive-tts-profile-selection.mjs` | `?? apps/desktop/scripts/adaptive-tts-profile-selection.mjs` | `748263cc88876ffe307a733955f5ae186a7e1384b6de3cb0856c02e318e68ed8` | `084ced445f46beb814e0c1a4aa80601ac77b5adc` |
| `apps/desktop/scripts/native-webdriver-client.node-test.mjs` | ` M apps/desktop/scripts/native-webdriver-client.node-test.mjs` | `121c4d574695f9099db803a583ff86da0ac262f1459646f74325c363b873ba27` | `0b9594704cd9b10641ca4818ccdb992de7b21dfb` |

Identity recheck PASS. All seven unchanged before/after supplemental checks and
identical to the uninstrumented portfolio patch. HEAD unchanged; index empty.
No source writing during validation.

## Commands and outcomes

| Command | Outcome |
| --- | --- |
| `pnpm.cmd --filter @voxleaf/desktop test:native-driver-client` | Exit 0; 17 passed |
| `pnpm.cmd build:packages` | Exit 0 |
| `pnpm.cmd --filter @voxleaf/desktop typecheck` | Exit 0 |
| `pnpm.cmd --filter @voxleaf/desktop test` | Exit 0; 54 files, 581 Vitest, 37 Node |
| `pnpm.cmd format:check:typescript` | Exit 0 |
| `pnpm.cmd lint:typescript` | Exit 0 |
| `pnpm.cmd test:browser` | Exit 0; 7 passed |
| `pnpm.cmd test:tts:bilingual-portfolio-exact-host` | Exit 1 overall; lifecycle and four required arms PASS before excluded Qwen failure |
| `pnpm.cmd check:portable` | Exit 0; shared 209, EPUB 653, desktop 581, Node 37, Python 386, format/lint/types/build |
| `pnpm.cmd check` | Exit 0; all repository checks, both Rust configurations, native release and Python builds |
| `git diff --check` | Exit 0 |
| Identity commands and git diff --cached --quiet | Unchanged identities; empty index |

Exact-identity results from MOD-A-HARNESS-REPAIR-01-POST-01-20261006 supply focused
Node/format/lint/diff, native lifecycle and four model arms. The remaining six
commands were freshly completed afterward. This is a new assessment under the
user-amended order; no previous FAIL report is changed or relabeled.

## Required model results

| Arm | Result | Audible start ms | Audio lead ms | Cancellation ms | Resource release ms |
| --- | --- | --- | --- | --- | --- |
| Piper Spanish | PASS | 5136 | 17076 | 374 | 707 |
| Piper English | PASS | 5280 | 18725 | 384 | 644 |
| Chatterbox Spanish | PASS | 51434 | 20760 | 294 | 696 |
| Chatterbox English | PASS | 48058 | 18120 | 420 | 815 |

All four completed at least one minute stable with zero underruns, passed
synchronization/cancellation/reader checks and reported zero external requests
and generated audio files. Both Piper six-speed matrices and native lifecycle pass.

## Reviews

Diff scope PASS: product 568 lines within 575, three-path repair 262 within 325;
no unexpected source/dependency/configuration/authority/generated/private files.
Director documentation/evidence is outside the source manifest.

Invariant review PASS: product stop order, selection gates, refresh after every
fulfilled removal, reset aggregation/presentation timing and callback dependencies
preserved. Harness retains first alternate, effective inherited enablement, one
guarded click, assertions/errors and shared original 90-second deadline. Target,
language, optional verification and cleanup unchanged.

Test integrity PASS: original product/driver tests intact. Five DOM regressions
cover deferred fieldset enablement, one click, activation completion, already
active, missing/rejected/disabled and shared deadline. No red run claimed. No
acceptance assertion or timeout weakened.

Privacy/artifacts PASS: actual installed Chatterbox and Qwen Python process lists
empty after host; app/driver processes empty, installed manifest unchanged.
Environment restored; NODE_OPTIONS absent. Both proposed seek-observer files
remain absent; Qwen diagnosis stopped without a model rerun. Earlier temporary
observer, driver and exact firewall rule remain available for director cleanup
or dependent gates.

Existing nonfatal warnings: pytest cache permission, CSS ::highlight minification
and bundle size. All affected commands exited 0.

Action required: none for MOD-A under the amended Piper/Chatterbox scope.
MOD-B audit may begin. No commit, push, PR or global Qwen removal authorized.
