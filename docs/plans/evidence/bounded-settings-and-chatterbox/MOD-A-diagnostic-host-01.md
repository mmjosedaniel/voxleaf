# Validation Report

Report ID: MOD-A-DIAG-02-HOST-01-20261006  
Target ID: MOD-A-DIAG-02  
Mode: POST-CHANGE  
Verdict: FAIL (host gate); observer invariants PASS.  
Author: independent refactor_validator, local PowerShell outside sandbox.  
Environment: Node 24.20.0, pinned pnpm 11.15.1, validated process-local observer,
documented offline/model setup and approved signed temporary driver.

HEAD before/after: c140d0f2971cd6498fff2728dfa009acd01126f1. Index empty.

## Exact identities before and after

| Path | Porcelain | SHA-256 | Filter-aware blob |
| --- | --- | --- | --- |
| `tmp/mod-a-host-observer/observer.mjs` | empty; ignored | `666e75229b4613e39ca96fb3619cdf179e3f555d7077bea01fd336cb8ede693e` | `1e9ad1b7d32a6269b9e1e814d19a1945c829f969` |
| `tmp/mod-a-host-observer/observer.node-test.mjs` | empty; ignored | `f5147169a6debbf3fa9e52b3d29484dc5db96168334005bd682fb6faa046ecb3` | `08ec743efbe4c92db7535dc500e3f02b165503d4` |
| `apps/desktop/src/App.tsx` | ` M apps/desktop/src/App.tsx` | `cfdcf0f1a2a816a026c0533e7f7f9ad1c7b5b590a0dde109e7d141f769c5b13b` | `65808bbbec4042937f6ee5e08917dea65920c5f8` |
| `apps/desktop/src/App.test.tsx` | empty | `8a688be72992dfaf615a06f81607811961a866172375a0145a9820e7bab78dfb` | `6a2431df8b78a16ff9995fa47abc82524c48c573` |
| `apps/desktop/src/settings/narration-settings-actions.ts` | `?? apps/desktop/src/settings/narration-settings-actions.ts` | `8782470007e32e81af7f6b04bd3cd51f878635e410ab9c70664371e327517db5` | `d49281f8ad9c336568cc6e56f6d596cd25458ac7` |
| `apps/desktop/src/settings/narration-settings-actions.test.ts` | `?? apps/desktop/src/settings/narration-settings-actions.test.ts` | `7f3d915c522c3f77fa40d7c2d30e585118e6554d91049428a052890433ae5ab1` | `a2f0b6cf72c77128e95a4134bf5be1208d1c8a24` |
| `apps/desktop/scripts/native-startup-smoke.mjs` | empty | `74c71fad4e847e05b80c86d903d0f60a8e1ea6b688e0232f5636c72978f0eae3` | `e84d80537e3cdab4c79a95ddcfae83053c08491d` |
| `apps/desktop/scripts/native-webdriver-client.mjs` | empty | `b898bb5c312c3099e2e43656a8ff27dba2dd9137ece26aaa73255dcef7381051` | `bfdeae55313b5a4f3d249eb03709632aa0ee8540` |

Identity recheck PASS across observer tests and portfolio. Product/harness
identities match POST05. No unexpected paths; temporary observer/test 366 lines.

## Commands and outcomes

- `node --test tmp/mod-a-host-observer/observer.node-test.mjs`: exit 0, 7 passed.
- `pnpm.cmd test:tts:bilingual-portfolio-exact-host`: exit 1, instrumented,
  no filtered arms or retries. Preflight UI 38, WebDriver 12, portfolio 5,
  offline/model setup, native release build and native lifecycle all passed.
  Existing CSS/chunk warnings only. Piper Spanish profile selection failed with
  webdriver-condition-timeout. Zero of six model arms completed.
- Before/after HEAD/porcelain/SHA-256/blob checks and git diff --cached --quiet:
  unchanged; index check exit 0.
- Actual-interpreter firewall/process checks: exact block active; installed
  interpreter PIDs empty before/after, final app/driver process list empty.
- Environment restored in finally; subsequent check confirms NODE_OPTIONS absent.

## Direct diagnosis

| Fixed observation | At alternate click | Before cleanup |
| --- | --- | --- |
| Active profile/language | Piper Spanish / es | Piper Spanish / es |
| Compatibility | compatible | compatible |
| Settings pending | true | false |
| Optional Chatterbox state | withheld | installed |
| All three present profile radios effectively disabled | true | false |

The alternate-click script ran once while controls were disabled. Before/after
snapshots stayed unchanged. The harness then waited for activation never
dispatched by that disabled click. Alternate-active: 727 observations, last
false, timestamps 1791327681033-1791327770965 (approximately 89.932 seconds).
Requested-enabled and requested-active: zero observations each.

This establishes the failure mechanism in this diagnostic attempt. It does not
attribute its timing to the refactor or prove the same failure on an older revision.

Scope, observer invariants, test integrity and privacy/artifact reviews PASS.
Recognition tests use actual harness templates; no timeout/assertion/matrix or
production-test change. Only whitelisted metadata emitted. Installed manifest
SHA-256 remains 1bca3c4e5706771877ad837398e7930206c8f74eb03e9804a093a4c78f0b6262.
No install/download/repair/source/Git/firewall mutation by validation. Temporary
driver and firewall remain available for dependent gates.

Action required: bounded harness readiness correction preserving all selection
assertions and original total deadline, followed by fresh independent validation
and full uninstrumented portfolio. This is known defect-baseline evidence, not
a passing refactor baseline. MOD-A remains unaccepted; MOD-B not started.
