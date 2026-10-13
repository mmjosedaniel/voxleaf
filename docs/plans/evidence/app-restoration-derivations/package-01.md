# Validation Report
Report ID: APP-RESTORATION-01-PACKAGE-01
Target ID: APP-RESTORATION-01
Mode: PACKAGE
Verdict: PASS
Environment: local PowerShell outside sandbox; every command used require_escalated; pnpm 11.15.1 selected through process-local Corepack PATH. Live signed Microsoft EdgeDriver and WebView2 both 155.0.4283.45.
Starting HEAD SHA: 6102b72758497b07356d864915502d3dc443a0b5
Ending HEAD SHA: 6102b72758497b07356d864915502d3dc443a0b5
Validated paths: apps/desktop/src/App.tsx; apps/desktop/src/App.test.tsx; apps/desktop/src/app-reader-restoration.ts; apps/desktop/src/app-reader-restoration.test.ts.
Validated path identities:

| Path | Exact porcelain before/after | SHA-256 before/after | Filter-aware expected index blob before/after |
| --- | --- | --- | --- |
| apps/desktop/src/App.tsx | ` M apps/desktop/src/App.tsx` | 42CE5052CC0764BE433EE198E2575DA525B0219FF36942890A1A0A891A1B8684 | dcde5c04d6ad012545af44e34dfc132115d2984f |
| apps/desktop/src/App.test.tsx | ` M apps/desktop/src/App.test.tsx` | D4CF0419C571C47D0F9BD80F4DF4A71270B8EDECD57CD64A635638E8469B566D | c405672a1c1d003bdb0698d56fd755338ec466ef |
| apps/desktop/src/app-reader-restoration.ts | `?? apps/desktop/src/app-reader-restoration.ts` | 813A4E05661A9C8AF345F0DFE7486DEEB4DA681C6FCF3F4C5BA0756D32F8CEB7 | a224767dcbe0e303fb6220436140317af59ab2a7 |
| apps/desktop/src/app-reader-restoration.test.ts | `?? apps/desktop/src/app-reader-restoration.test.ts` | E7E84DFDCE1FC192BDF2D289068D119B50E16A15D9A0770444A7C9928C155200 | da36a73875db67c6b820912d40847ca44ad68920 |

Identity recheck: PASS, before/after HEAD, four source-path identities and whole-worktree porcelain identical. Index empty before and after. Source identities exactly match accepted POST-CHANGE-02. Whole status before/after:

```text
 M apps/desktop/src/App.test.tsx
 M apps/desktop/src/App.tsx
 M docs/development/testing.md
 M docs/plans/active/app-restoration-derivations.md
?? apps/desktop/src/app-reader-restoration.test.ts
?? apps/desktop/src/app-reader-restoration.ts
?? docs/plans/evidence/app-restoration-derivations/audit-and-order.md
?? docs/plans/evidence/app-restoration-derivations/baseline-01.md
?? docs/plans/evidence/app-restoration-derivations/characterization-01.md
?? docs/plans/evidence/app-restoration-derivations/post-change-01.md
?? docs/plans/evidence/app-restoration-derivations/post-change-02.md
```

Commands and outcomes:
1. `pnpm.cmd check:portable` -> exit 0 (66.906 seconds); evidence guard and 13 evidence tests; TypeScript/Python format and lint; type checks; shared 20 files/209 tests, EPUB 33 files/651 tests, desktop 58 files/677 tests plus 70 Node tests, Python 485 tests; shared/EPUB, Vite and Python source/wheel builds all passed. Nonfatal warnings: pytest cache could not write existing services/tts/.pytest_cache/v/cache/nodeids due to Permission denied, and existing Vite chunk-size warning. This was a host run outside sandbox, not a substituted exploratory result.
2. `git diff --check` -> exit 0.
3. `git diff --cached --quiet` -> exit 0 before and after.
Diff scope: PASS, unchanged accepted four-path source patch remains 490 added-plus-removed lines. Separate authorized director documentation is present exactly as enumerated above: testing map, active plan and five concise receipts. Documentation is not part of this runtime report's closed source allowlist; later archival requires a separate document review.
Invariant review: PASS, exact source identities preserve the independently reviewed POST-CHANGE-02 extraction: reference/sequence guards, current-state functional setters, frozen accepted/no-op identity-preserving settlement, presentation field omissions, effect/cleanup/persistence ownership and timing. Package execution extends evidence across shared, EPUB, desktop and Python contracts. Browser/native behavior remains covered by POST-CHANGE-02 on these identical source identities. No model-backed TTS or performance claim.
Test-integrity review: PASS, all assertion files preserve accepted source bytes; full portable suites pass. No tests, configuration or snapshots edited during validation.
Privacy/artifact review: PASS, no prohibited or unrelated source artifacts entered the diff. Reviewed documentation records concise evidence only; raw logs and identity captures remain ignored under tmp/evidence/app-restoration-derivations/package-01*.
Action required: none for PACKAGE. FINAL check is running separately; campaign archival/documentation closure remains pending. No staging, commit, push or PR authorized.
