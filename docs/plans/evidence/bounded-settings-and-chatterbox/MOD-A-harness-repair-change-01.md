# Change Packet

Target ID: MOD-A-HARNESS-REPAIR-01  
Author: sole clean_code_worker (GPT-6.1 Sol high).

Files/symbols:

- `apps/desktop/scripts/native-startup-smoke.mjs`: selectAdaptiveTtsProfile
  delegates only the alternate-switch operation.
- `apps/desktop/scripts/adaptive-tts-profile-selection.mjs`: new specific helper
  selectAdaptiveTtsAlternateProfile.
- `apps/desktop/scripts/native-webdriver-client.node-test.mjs`: actual-DOM fixture
  and five regressions; original 12 tests unchanged.

The same first nonrequested alternate is selected. Effective enablement is
required before one guarded click; activation uses the remaining original
90-second total deadline. Already-active performs no click. Fixed assertion,
errors, target selection, language, optional verification and cleanup preserved.

Scope: 262 added/deleted lines, three repair paths, within 325. All four frozen
MOD-A product SHA-256 identities match baseline. Other edits preserved.

Worker checks, local PowerShell outside sandbox with pinned Corepack shim PATH:

- Exact-path Prettier on three repair files: exit 0.
- `pnpm.cmd --filter @voxleaf/desktop test:native-driver-client`: exit 0,
  17 passed, zero failures/skips.

No red run performed; do not infer red/green evidence from the passing tests.
Deviations: none. No Git mutation. Independent seven-path review and all 11
work-order checks, including the full uninstrumented portfolio, remain required.
