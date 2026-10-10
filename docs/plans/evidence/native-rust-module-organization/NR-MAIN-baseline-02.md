# Validation Report

Report ID: NR-MAIN-BASELINE-02-20261009
Target ID: NR-MAIN
Mode: BASELINE
Verdict: BASELINE-FAIL
Environment: local PowerShell 7.6.5 outside sandbox, repository root, all gates
through `require_escalated`. Process-local PATH selects existing Corepack pnpm
11.15.1. Validator: reused `refactor_validator` (Astra high); recorded by director.
Starting HEAD SHA: ed42154668bd71d500b5beab77485f9fd20ee2a2
Ending HEAD SHA: ed42154668bd71d500b5beab77485f9fd20ee2a2

## Validated paths and identities

| Path | Porcelain status | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src-tauri/src/main.rs` | empty | `7B892FDD05856A74A0213C989EB6D6CFA1E4CF8D8D1BA74816F5889F14EF60E8` | `36226406767d3351c70f38328a9164137c5ce49a` |
| `apps/desktop/src-tauri/src/diagnostics/mod.rs` | empty | ABSENT | ABSENT |
| `apps/desktop/src-tauri/src/diagnostics/cli.rs` | empty | ABSENT | ABSENT |

Identity recheck: PASS. All identities and HEAD identical before/after; index
empty (`git diff --cached --quiet`, exit 0). Planned missing directories produced
only expected Git warnings. No source or Git writer ran during validation.

## Commands and outcomes

1. `pnpm.cmd format:check:rust`: exit 0.
2. `pnpm.cmd lint:rust`: exit 0, all targets and warnings denied in both modes.
3. `pnpm.cmd test:rust`: exit 0; 87 default and 88 release-locked-runtime tests
   passed, none failed or ignored.
4. `pnpm.cmd test:native-startup`: exit 1 after successful Vite/native release
   build: `Native startup smoke failed during native WebView session creation
   [webdriver-session-not-created].` The supervised model-free matrix precedes
   session creation and execution reached that stage. WebView2 application,
   binary-response, renderer lifecycle and subsequent assertions did not finish.
   Vite's chunk-size warning was nonfatal.
5. `git diff --check`: exit 0.

Diff scope: PASS; source allowlist unchanged, only director plan/evidence docs
outside it dirty. Invariant review: PASS for baseline review of nine CLI branches,
sixteen handlers, positional conversion, exits/fallthrough, state/setup/force_stop.
Test integrity: PASS; source/harness assertions unchanged. This is a pre-existing
baseline failure, not a refactor regression. Privacy/artifact review: PASS; normal
ignored outputs only, no prohibited candidate artifacts.

Model/installer gates are N/A for the proposed dispatch-only move. Existing
exact, bilingual, resilience and handoff model harnesses were identified but not
run; this report does not prove all diagnostic branches executed. Unix paths
were not executed. Required action: resolve the host session prerequisite and
rerun the exact commands under a new Report ID before any implementation order.

## Earlier attempt retained separately

`NR-MAIN-BASELINE-01-20261009`: BLOCKED, same HEAD and three-path identities,
identity recheck PASS and empty index. `pnpm.cmd format:check:rust` exited 1
before Cargo because global pnpm 11.25.0 did not satisfy required 11.15.1;
remaining commands were not run. Existing Corepack shim resolved that environment
problem without installation or source changes. This later attempt does not
rewrite the earlier outcome.
