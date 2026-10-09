# Validation Report

Report ID: MOD-A-BASELINE-01-20261006
Target ID: MOD-A
Mode: BASELINE
Verdict: PASS
Environment: local PowerShell outside sandbox, require_escalated, repository root;
Node v24.20.0, pnpm 11.15.1 via process-local Corepack shims PATH. Default pnpm
11.19.0 was not used for acceptance.
Validator: configured refactor_validator (GPT-6 Astra high).
Starting HEAD SHA: c140d0f2971cd6498fff2728dfa009acd01126f1
Ending HEAD SHA: c140d0f2971cd6498fff2728dfa009acd01126f1

Validated paths and before/after identities:

| Path | Exact porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| apps/desktop/src/App.tsx | `""` | 412daecf3dc1211c01352024dc67bcbc362da1db1a5fb2f40db3187b141d874a | 04cbdc28dd7bcc9b2e64e981224e61bea1dfc9ea |
| apps/desktop/src/App.test.tsx | `""` | 8a688be72992dfaf615a06f81607811961a866172375a0145a9820e7bab78dfb | 6a2431df8b78a16ff9995fa47abc82524c48c573 |
| apps/desktop/src/settings/narration-settings-actions.ts | `""` | ABSENT | ABSENT |
| apps/desktop/src/settings/narration-settings-actions.test.ts | `""` | ABSENT | ABSENT |

Identity recheck: PASS, all identities and HEAD identical after commands; index
empty before/after (`git diff --cached --quiet`, exit 0).

Commands and outcomes:

1. `pnpm.cmd build:packages` -> exit 0, shared and EPUB builds pass.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 0.
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0; 53 Vitest files / 542
   tests and 32 Node tests pass; zero failed/skipped/cancelled Node tests.
4. `pnpm.cmd format:check:typescript` -> exit 0, all matched files conform.
5. `pnpm.cmd lint:typescript` -> exit 0.
6. `git diff --check` -> exit 0.

Diff scope: PASS, source unchanged; only director plan/audit/draft documentation
exists outside the source manifest.
Invariant review: PASS for baseline readiness, not future equivalence. Existing
handlers preserve fulfilled-removal refresh and sequential reset, successful-start
presentation, conditional refresh and conjunction. Required direct coverage remains.
Test-integrity review: PASS, existing App assertion unchanged (stop, language-reset,
start-reset, playback-reset, refresh).
Privacy/artifact review: PASS, no generated/model/book/audio/private/unrelated
source artifact in diff; no model-backed or installed-package operation ran.
Action required: none; director may freeze the work order, no Git authorization.

Post-change still requires browser/full portfolio. Portfolio's model-free
lifecycle subsumes native-startup. Installed-interpreter firewall/process coverage
and ordinary cache use are disclosed prerequisites, not baseline evidence.
