# Validation Report

Report ID: APP-RESTORATION-01-CHARACTERIZATION-01
Target ID: APP-RESTORATION-01
Mode: POST-CHANGE (tests-only characterization checkpoint)
Verdict: PASS
Validator: independent `refactor_validator`, GPT-6 Astra high.

Environment: local PowerShell outside sandbox, `require_escalated`, pinned pnpm
11.15.1 via process-local Corepack PATH. This checkpoint tests original production
and is not final refactor acceptance.

Starting and ending HEAD: `6102b72758497b07356d864915502d3dc443a0b5`.

| Validated path | Exact porcelain before/after | SHA-256 before/after | Filter-aware blob before/after |
| --- | --- | --- | --- |
| `apps/desktop/src/App.tsx` | empty | `0ED155C4C60CA6DA33BF34E0385B555D9680ECA9B84AA63F2156E101BF4843D8` | `7f2c9aa65c5fed437ccc91967cca88a7f673228e` |
| `apps/desktop/src/App.test.tsx` | ` M apps/desktop/src/App.test.tsx` | `D4CF0419C571C47D0F9BD80F4DF4A71270B8EDECD57CD64A635638E8469B566D` | `c405672a1c1d003bdb0698d56fd755338ec466ef` |
| `apps/desktop/src/app-reader-restoration.ts` | empty | ABSENT | ABSENT |
| `apps/desktop/src/app-reader-restoration.test.ts` | empty | ABSENT | ABSENT |

Identity recheck: PASS; HEAD and identities unchanged; empty index before/after.
Additions remain ABSENT only under this expressly tests-only checkpoint.

| Command | Exit | Outcome |
| --- | --- | --- |
| `git diff -- apps/desktop/src/App.test.tsx` | 0 | Both new cases independently reviewed. |
| `git diff --stat` | 0 | One file, 115 insertions, zero deletions. |
| `pnpm.cmd --filter @voxleaf/desktop test` | 0 | 57 Vitest files / 663 tests; 70 Node tests passed. |
| `git diff --check` | 0 | Passed. |
| `git diff --cached --quiet` | 0 | Empty index before and after. |

Diff scope: PASS; only App.test.tsx changed and App.tsx matches BASELINE-01.
Invariant review: PASS for this checkpoint. The saved previous-publication
callback cannot settle the same-book replacement; pending status, busy state and
absent notice remain intact until its own callback succeeds. Conflicting
settled/superseded callbacks carrying a different locator cannot replace an
accepted unavailable result, message, notice or nonbusy state.
Test-integrity review: PASS; existing fixtures/assertions unchanged, synthetic
cases use the existing injected reader seam and pass against original production.
Privacy/artifact review: PASS; captures only in ignored
`tmp/evidence/app-restoration-derivations/characterization-01-*`; no Git mutations.
Action required: none. Continue the frozen extraction order, then complete
independent seven-command post-change and package/final acceptance.
