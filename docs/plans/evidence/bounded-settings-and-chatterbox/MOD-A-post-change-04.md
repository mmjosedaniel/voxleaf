# Validation Report

Report ID: MOD-A-POST-CHANGE-04-20261006
Target ID: MOD-A
Mode: POST-CHANGE
Verdict: BLOCKED
Environment: local PowerShell outside sandbox, require_escalated, repository root;
Node v24.20.0, pnpm 11.15.1, documented process-local model environment and both
HF_HUB_OFFLINE=1 and TRANSFORMERS_OFFLINE=1. Same independent refactor_validator.
Starting HEAD SHA: c140d0f2971cd6498fff2728dfa009acd01126f1
Ending HEAD SHA: c140d0f2971cd6498fff2728dfa009acd01126f1

Validated paths and before/after identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/App.tsx | ` M apps/desktop/src/App.tsx` | cfdcf0f1a2a816a026c0533e7f7f9ad1c7b5b590a0dde109e7d141f769c5b13b | 65808bbbec4042937f6ee5e08917dea65920c5f8 |
| apps/desktop/src/App.test.tsx | `""` | 8a688be72992dfaf615a06f81607811961a866172375a0145a9820e7bab78dfb | 6a2431df8b78a16ff9995fa47abc82524c48c573 |
| apps/desktop/src/settings/narration-settings-actions.ts | `?? apps/desktop/src/settings/narration-settings-actions.ts` | 8782470007e32e81af7f6b04bd3cd51f878635e410ab9c70664371e327517db5 | d49281f8ad9c336568cc6e56f6d596cd25458ac7 |
| apps/desktop/src/settings/narration-settings-actions.test.ts | `?? apps/desktop/src/settings/narration-settings-actions.test.ts` | 7f3d915c522c3f77fa40d7c2d30e585118e6554d91049428a052890433ae5ab1 | a2f0b6cf72c77128e95a4134bf5be1208d1c8a24 |

Identity recheck: PASS; all identities match POST-CHANGE-03 and remain unchanged
before/after the fresh command. Index empty; no source or Git mutations.

## Commands and outcomes

1. `pnpm.cmd test:tts:bilingual-portfolio-exact-host` -> fresh exit 1. UI preflight
   38 tests, driver 12 tests and portfolio 5 tests PASS; exact offline/configuration/
   firewall preflight PASS; Tauri release build PASS. Then:
   `Native startup smoke failed during native WebView session creation [webdriver-session-not-created].`
   `Exact bilingual portfolio lifecycle matrix failed.`
   Zero of six model arms ran. No pre-change native result exists; this is failed
   host-session evidence, not a proven source regression.
2. `git diff --check` -> fresh exit 0.
3. `pnpm.cmd build:packages` -> reused POST-CHANGE-03 exit 0, exact same identities.
4. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> reused exit 0.
5. `pnpm.cmd --filter @voxleaf/desktop test` -> reused exit 0, 581 Vitest + 32 Node.
6. `pnpm.cmd format:check:typescript` -> reused exit 0.
7. `pnpm.cmd lint:typescript` -> reused exit 0.
8. `pnpm.cmd test:browser` -> reused exit 0, 7 tests.
9. `pnpm.cmd check:portable` -> reused exit 0, shared 209 / EPUB 653 / desktop 581 /
   Node 32 / Python 386 and portable builds.
10. `pnpm.cmd check` -> reused exit 0, same counts plus Rust 79+80 and native/Python
    builds. Reuse follows the plan's exact-identity rule and director continuation
    order; [POST-CHANGE-03](MOD-A-post-change-03.md) remains immutable and BLOCKED.

Diff scope: PASS, same three changed files/568 lines within WORK-02's575 ceiling;
App.test unchanged, director documentation excluded from source manifest.
Invariant review: PASS for unchanged source and deterministic/browser assertions.
Native/model-backed acceptance missing; no six-arm playback/cancellation/cleanup
claim follows from this attempt.
Test-integrity review: PASS, no assertion changes since POST-CHANGE-03.
Privacy/artifact review: PASS, no prohibited source artifacts. Actual installed
interpreter baseline and ending PIDs empty; app/driver processes absent before and
after. Installed manifest SHA-256 unchanged at
1bca3c4e5706771877ad837398e7930206c8f74eb03e9804a093a4c78f0b6262.
Cleanup evidence covers only this failed pre-model attempt.

ActiveStore rule VoxLeaf-MOD-A-Offline verified for exact installed interpreter,
enabled Outbound Block/Profile Any/PrimaryStatus OK; all firewall profiles enabled
and local rules allowed. User-created rule remains present and unmodified.

Action required: diagnose native WebDriver session creation, resolve any concrete
in-scope environment prerequisite, rerun unchanged full portfolio under a new
report. No source correction identified. Keep temporary rule through last model
gate, then remove only its exact Name from a privileged session. MOD-A unaccepted;
MOD-B must not start.
