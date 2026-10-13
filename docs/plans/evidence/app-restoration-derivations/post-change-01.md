# Validation Report
Report ID: APP-RESTORATION-01-POST-CHANGE-01
Target ID: APP-RESTORATION-01
Mode: POST-CHANGE
Verdict: FAIL
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
| apps/desktop/src/app-reader-restoration.test.ts | `?? apps/desktop/src/app-reader-restoration.test.ts` | A8BD601B2377478DF9A6E98488E6A495D1C9FBB32E0B5FD8EBD87B3506C6F436 | a667689cf3f7aed75450ea3b85f5cd3ef66456e7 |

Identity recheck: PASS, identical before/after HEAD, four-path identities and whole-worktree status. Index empty before and after; no extra paths.
Commands and outcomes:
1. `pnpm.cmd build:packages` -> exit 0; shared/EPUB builds passed.
2. `pnpm.cmd --filter @voxleaf/desktop typecheck` -> exit 2. TS2322 at src/app-reader-restoration.test.ts(53,3): nested result.status in readyRestoration's Object.freeze return is inferred as string, incompatible with ReadyReaderRestoration's literal "ready".
3. `pnpm.cmd --filter @voxleaf/desktop test` -> exit 0; 58 Vitest files / 677 tests and 70 Node tests passed.
4. `pnpm.cmd format:check:typescript` -> exit 0.
5. `pnpm.cmd lint:typescript` -> exit 0.
6. `pnpm.cmd test:browser` -> exit 0; 7/7 Chromium scenarios.
7. `pnpm.cmd test:native-startup` -> exit 0; release build and packaged WebView2 startup, model-free TTS lifecycle/binary/cancellation, file boundaries/replacement, accessibility/synchronization, exact restoration/preferences after restart, cleanup, no errors or external requests. Existing nonfatal bundle-size warning.
8. `git diff --check` -> exit 0.
9. `git diff --cached --quiet` -> exit 0 before and after.
Diff scope: PASS, exact four paths, 490 added-plus-removed lines (App.tsx +26/-58; App.test.tsx +115; helper +74; helper tests +217), below ceiling 500; no unrelated edits.
Invariant review: PASS by independent source/diff inspection and behavioral execution. Exact object-reference plus sequence predicate is reused in selection, loading updater and settlement; selection keeps the original state. Only matching ready/pending transitions create shallow frozen objects preserving result/publication/nested references; rejected transitions return current. Status-only input ignores callback locator. Both React setters remain functional; loading/ready construction, initial settlement policy, preference update order, distinct catch guard, effect dependencies/cancellation, coordinator/cleanup ownership, JSX, ready-reader assembly and persistence timing are unchanged. Presentation preserves exact shapes and reason/locator/identity omissions with no added freezing. All helper imports are type-only; no runtime cycle, I/O, state owner or dependency added. No model-backed TTS/performance gate required for this pure extraction; no such claims made.
Test-integrity review: FAIL, newly added fixture fails the required TypeScript contract as described above. Existing tests/assertions remain unchanged, two characterization cases retain their previously validated bytes, and the pure matrix checks identity dimensions, all three incoming/terminal statuses, no-op references, frozen successful output, nested-reference preservation and exact projection across all settlement/preference statuses. No assertion weakening.
Privacy/artifact review: PASS, only approved source/test files in diff; synthetic fixtures only; generated outputs/raw logs confined to ignored locations. Raw evidence is tmp/evidence/app-restoration-derivations/post-change-01-*.
Action required: Correct only readyRestoration's nested result.status literal inference in apps/desktop/src/app-reader-restoration.test.ts, using explicit contextual typing or a literal as const, without weakening assertions or changing production. Then freeze the corrected patch and rerun all seven acceptance commands with a new Report ID and new before/after identities. Preserve this FAIL report unchanged.
