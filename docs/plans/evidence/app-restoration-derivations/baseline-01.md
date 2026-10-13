# Validation Report

Report ID: APP-RESTORATION-01-BASELINE-01
Target ID: APP-RESTORATION-01
Mode: BASELINE
Verdict: PASS
Validator: independent `refactor_validator`, GPT-6 Astra high.

Environment: local PowerShell outside sandbox; every command used
`require_escalated`. Process-local PATH prepended the existing Corepack shims,
selecting repository-pinned pnpm 11.15.1. Live EdgeDriver and WebView2 both
155.0.4283.45; driver signature Valid/Microsoft. No driver override required.

Starting and ending HEAD: `6102b72758497b07356d864915502d3dc443a0b5`.
Branch: `codex/app-restoration-derivations`.

Validated paths and exact identities (identical before and after commands):

| Path | Porcelain | Worktree SHA-256 | Filter-aware expected index blob |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | empty | `0ED155C4C60CA6DA33BF34E0385B555D9680ECA9B84AA63F2156E101BF4843D8` | `7f2c9aa65c5fed437ccc91967cca88a7f673228e` |
| `apps/desktop/src/App.test.tsx` | empty | `AE7C188401E6B900786100EA11FEC59E6FD94F8734F491A2943EB3AAE568B8A0` | `f833e768e313623314d1a393ddca7979432b568c` |
| `apps/desktop/src/app-reader-restoration.ts` | empty | ABSENT | ABSENT |
| `apps/desktop/src/app-reader-restoration.test.ts` | empty | ABSENT | ABSENT |

Identity recheck: PASS. HEAD, all four identities and branch unchanged; whole
worktree porcelain empty and index empty (`git diff --cached --quiet`, exit 0).

| Command | Exit | Outcome |
| --- | --- | --- |
| `pnpm.cmd build:packages` | 0 | Shared and EPUB builds passed. |
| `pnpm.cmd --filter @voxleaf/desktop typecheck` | 0 | Passed. |
| `pnpm.cmd --filter @voxleaf/desktop test` | 0 | 57 Vitest files / 661 tests; 70 Node tests passed. |
| `pnpm.cmd format:check:typescript` | 0 | All matched files formatted. |
| `pnpm.cmd lint:typescript` | 0 | Passed. |
| `pnpm.cmd test:browser` | 0 | 7/7 Chromium scenarios passed. |
| `pnpm.cmd test:native-startup` | 0 | Release build and packaged WebView2 smoke passed. |
| `git diff --check` | 0 | Passed. |
| `git diff --cached --quiet` | 0 | Empty index. |

Native smoke covered root mount, bounded model-free TTS protocol/lifecycle,
file selection/replacement/boundaries, reader accessibility and synchronization,
restoration after restart/reselection, cleanup, no errors or external requests.
The existing >500 kB chunk warning was nonfatal.

Diff scope: PASS; no source or tracked changes, planned additions absent.
Invariant review: PASS for the unchanged baseline. Independently inspected
reference-plus-sequence guards, pending-only settlement, projection omissions,
functional setters, preference ordering, distinct catch guard, retained
coordinator/effect ownership, mounting and save-after-settlement wiring.
Test-integrity review: PASS; existing restoration, book-start, DOM identity,
StrictMode, exact and recovered settlement/persistence tests unchanged.
Privacy/artifact review: PASS; only ignored build/test outputs and raw captures
under `tmp/evidence/app-restoration-derivations/baseline-01-*` were created.
Action required: none.

This immutable baseline does not accept an implementation. The pure-helper
matrix and missing stale-callback/duplicate-settlement integration cases remain
implementation obligations. No model-backed TTS or performance claim is made.
