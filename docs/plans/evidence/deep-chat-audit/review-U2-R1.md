# Change Review Report

Review ID: DCR-U2-R1-ASTRA-20261109-01
Task ID: U2 / DCR-03
Verdict: APPROVE — local unit only
Base commit and reviewed HEAD: d375ecc84261c404e855c055e0ecc8949a97caaf

Reviewed paths and identities: Incorporate the complete 13-row manifest in [DCR-U2-EXEC-20261109-01](u2-dcr-03-execution.md), SHA-256 e3cdc5d6b514645e57786d47d031a27b466f143ac309d856f187bb56f1855293. Preserve those exact receipt bytes. The first two paths are the U2 patch, subsequent source/configuration rows are supporting inputs, and the last row is the explicitly ignored EPUB export. The live two-path diff matches tmp/evidence/deep-chat-audit/U2/review-patch.diff. Other unit patches and plan/evidence status edits are excluded from local acceptance.

Identity recheck: PASS. All 13 status/SHA-256/filter-aware blob identities matched initially and at completion; the generated export is confirmed ignored. HEAD remained unchanged and the staged index empty. Both supplied GREEN before/after snapshots match current recorded inputs. The corrected-fixture RED production owner matched HEAD. No review-time drift found. The reviewer inspected source, callers, tests, diffs and supplied evidence read-only; no tests, builds, edits or delegation.

Acceptance review:

DCR-03: APPROVE locally.

- Viewport detachment resets initialRestorationStarted only while initial status is pending and ReaderReflowRestorer still owns pending work. The reset occurs before setRoot(null) cancels that work. On reconnection, the existing attempt function waits for viewport, document and destination refs before starting a new bounded placement.
- Settled, unavailable or superseded initial placement cannot be reopened by this reset. The restorer cancels its scheduled callback, releases its suspension and rejects stale pending revisions/root identities. Real unmount still detaches the root and reaches existing StrictMode-safe resource cleanup; the change does not introduce an independent timer, retained job or repeated completion path.
- The regression uses real React StrictMode ref replay, verified by two observeViewport calls, with the actual ProductNarrationCoordinator and EPUB preparation path. Before settlement, Play remains unavailable and preparation has not started. After flush, exactly one settled callback reports the interior locator, and the first real preparation request uses that same locator.
- Navigation supersession and unmount controls pass: old initial placement does not revive, supersession reports once, and heading focus remains correct. Existing mounted/late narrator attachment cases remain present.
- The patch does not change initial fallback geometry, persisted-position publication, locator resolution or canonical checkpoint semantics. Tests still require no onSettledLocatorChange publication from initial restoration. DCR-02 remains withdrawn; the existing CAF-R4.1/CCF-C02 controls are preserved rather than converting a visual fallback into a replacement precise checkpoint.
- No product contract, component boundary, EPUB privacy, audio persistence or cancellation policy changes. This is a local lifecycle correction; combined restore/language behavior will receive the planned U3/browser assessment.

Test evidence reviewed — supplied normal local PowerShell results, not reviewer executions:

- True RED: pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx -t DCR-03. Exit 1, one intended failure and two passing supersession/unmount controls, 54 skipped; 2026-11-09T21:15:13.2152478Z–21:15:15.1549866Z. The failure is absence of initial settlement after confirmed real ref replay. Production matched HEAD. The earlier fixture-expectation failure remains separately retained and is not used as the reproduction.
- Focused GREEN: the same command, exit 0, three passed and 54 skipped; 2026-11-09T21:15:51.1014343Z–21:15:52.9951823Z.
- Owner GREEN: pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts. Exit 0, 67 passed; 2026-11-09T21:15:34.6847221Z–21:15:37.6272086Z. The focused cases overlap this count.
- Scoped pnpm.cmd exec prettier --write and pnpm.cmd exec eslint exited 0 over apps/desktop/src/reader/ReaderPublication.tsx and apps/desktop/src/reader/ReaderPublication.test.tsx. Formatting was applied; no separate format --check is claimed.
- Environment: normal local PowerShell 7.6.9 on Windows, Node v24.20.0, pinned offline Corepack pnpm 11.15.1, Vitest 5.0.5. Current snapshots bind both passing selections to the reviewed source and recorded EPUB entry export.

Findings: none in the reviewed local scope.

Remaining uncertainty: Final G3/G6/G7 and integrated acceptance remain pending. No Chromium or packaged WebView2 result is claimed for U2 in this report. The combined current restore/language journey is deferred explicitly to U3/G6, not treated as already passing. Later edits to ReaderPublication or its consumers require fresh identity and interaction assessment.

Required next action: No further U2 local correction. Record this immutable approval and proceed with authorized campaign work while retaining final gates. This is not a Validation Report, campaign completion or Git authorization.
