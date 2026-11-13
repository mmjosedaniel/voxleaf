# PR 314: viewport restoration interfered with keyboard recovery

## Reproduction and cause

Foundation run `43360222703`, Windows job `131671684374`, failed the unchanged
`stopped-keyboard-recovery` browser case: after resize, collapsing details and
focusing the reader, PageDown left the viewport at scrollTop 13. The other
91 browser cases passed. Ubuntu portable, Ubuntu Rust and release audit passed.

The host reproduced the failure once in five unmodified repetitions. Bounded
instrumentation subsequently reproduced it four times in ten repetitions and
identified the actual scroll owner. Trusted PageDown reached the focused article
without preventDefault. Native scrolling advanced the reader viewport, but
`ReaderReflowRestorer` repeatedly called scrollBy to restore the old reading line
before the scroll handler could admit manual movement. This was a runtime race,
not a missing focus assertion or an insufficient test timeout. Temporary
instrumentation was removed; the browser test is byte-identical to the base.

## Bounded correction

The existing trusted wheel, single-touch and eligible keyboard intent paths now
cancel only a pending `viewport` restoration. Explicit initial/navigation
restoration and preference transactions retain their settlement. Canceling the
passive restoration releases its visual-tracker suspension without publishing a
restoration result. Actual movement and measured passage admission still gate
recovery; intent alone does not enable Play.

Three unit cases cover cancellation without alignment/settlement, subsequent
viewport observation, and preservation of explicit preference/restoration work.
No contracts, dependencies, storage, TTS, EPUB processing or architecture edges
change. The system diagram remains applicable. This follow-up does not rewrite
the completed ExecPlan or its immutable acceptance reports.

## Host verification

All commands ran in normal local PowerShell outside the managed sandbox with
Node 24.18.0, pnpm 11.15.1 and PowerShell 7.6.9. Receipts, dependency captures,
before/after inputs and logs are under the ignored local directory
`tmp/evidence/chat-findings-recovery/`.

- Baseline: `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep stopped-keyboard-recovery --repeat-each=5`:
  1 failed / 4 passed (`ci314-keyboard-baseline`).
- Correction: `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep stopped-keyboard-recovery --repeat-each=10`:
  10 passed (`g6-ci314-keyboard-fixed`).
- `pnpm.cmd --filter @voxleaf/desktop test -- reader-reflow-restoration ReaderPublication active-visual-locator`:
  the package script executed its complete Vitest selection (1,318 passed across
  61 files) and Node tool suite (240 passed), rather than narrowing Vitest.
- `pnpm.cmd typecheck:typescript`, `pnpm.cmd lint:typescript`, and
  `pnpm.cmd format:check:typescript`: exit 0. These and the preceding test command
  share receipt `ci314-unit-static` with identical before/after inputs.
- `pnpm.cmd test:browser`: all 92 passed with retries unchanged at zero
  (`g6-ci314-browser-full`). Browser executables and dependencies were captured.
  The sole before/after difference is Chromium's generated `debug.log`; source,
  installed dependencies and executable inputs are identical. Original captures
  are retained without rewriting their hashes.

No previous packaged executable result is promoted to evidence for the changed
UI. The PR's new CI must validate the pushed revision, including the packaged
WebView2 startup and foundation checks. Independent acceptance is recorded in
the separate immutable CI follow-up review report.
