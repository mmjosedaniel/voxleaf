# PR 321 Windows browser smoke follow-up

GitHub Actions run `43807276953`, Windows job `133100814295`, reported 97
browser passes and two failures at
`2fe68f471c692484cb2c132a7f5f651b88994d18`. The same Foundation run passed
Ubuntu portable/Rust. Dependency audit run `43807276869` passed at the same
commit. The original Windows job output is retained
in ignored `tmp/evidence/four-pass-findings-corrections/ci-321/`.

- **VF-0066.** The original Chromium case reproduced the CI `TypeError` on
  the local Windows host. Real Worklet registration can complete before the
  fifth synthetic synthesis response reaches its barrier. The test now waits
  for each callback it invokes. With the fifth response still held, it
  verifies one device start, buffering and 45 seconds of playable audio.
  It then releases the fifth response and requires resumed playback with the
  original single underrun.
- **VF-0064.** The unmodified test passed in the first local run. A focused
  diagnostic delayed animation-frame callbacks until the trusted End gesture
  finished. The viewport reached the maximum scroll position, with the last
  paragraph ending 49 pixels above its top. The original noninitial saved
  anchor assertion failed with the same zero anchor as CI. The case now uses
  a trusted Page Down to reach visible paragraphs within the chapter, then
  observes the natural noninitial save. A trusted Home returns to the start.
  The test waits for the saved start locator before the lifecycle event and
  still checks the exact persisted locator after reopening, computed RTL/LTR
  directions and caret geometry.

Both changes are in the browser fixtures. The diagnostic delays the timing of
sampling to distinguish a settled blank tail from an intermediate visible
passage. The browser still owns the gesture and the product still owns sampling
and persistence. The existing implementation approval and closed plan retain
their original scope.

## Local validation

Commands ran in normal local Windows PowerShell with Node 24.18.0 and pnpm
11.15.1. The original focused invocation reproduced VF-0066 and passed
VF-0064. The controlled RTL diagnostic then reproduced VF-0064. Logs,
the diagnostic fixture and failed traces remain in the ignored evidence
directory. `original-reproduction-identities.json` ties the captured original
specs to the base commit and the failing logs to their exact arguments.
Two interim RTL fixture runs failed the geometry check at 450 pixels. A
Page Down still left only the fixture's first three paragraphs visible.
The final 720-pixel viewport passed with the visible-passage predicate,
which permits a reading line between paragraphs.
The corrected focused cases passed before this wider selection.

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts -g 'VF-006[46]'
pnpm.cmd --filter @voxleaf/desktop test:browser ci-321-rtl-diagnostic.smoke.spec.ts -g 'VF-0064'
pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts -g 'VF-0064'
```

The first wider run's capture directory is named `full-final/`; its actual
arguments select the two changed specs. The complementary selection uses
`other-final/`. Keeping both invocations avoids repeating the 83 selected
cases merely to combine the order. The hosted check will run its normal
single-suite command at the updated PR head.

Playwright passed all 83 cases in the first selection, exit 0. Its capture
wrapper exited 1 because its broad file list included Chromium's generated
`debug.log`. The original receipt and both inventories are preserved.
`browser-output-comparison.json` shows that exact output as the sole
change and matches all 17,857 remaining input identities. The second
wrapper excluded only that output from capture and passed 16 cases, exit 0.
The stable input identities and generated renderer hashes matched across
both invocations. The selected Prettier, ESLint, desktop typecheck, evidence
retention and diff checks passed.

```powershell
pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts
pnpm.cmd --filter @voxleaf/desktop test:browser active-visual-locator.smoke.spec.ts foundation.smoke.spec.ts large-chapter.smoke.spec.ts reader-image-lifecycle.smoke.spec.ts synchronization-feasibility.smoke.spec.ts
pnpm.cmd exec prettier --check apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts
pnpm.cmd exec eslint apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts apps/desktop/tests/browser/reader-reflow-restoration.smoke.spec.ts
pnpm.cmd --filter @voxleaf/desktop typecheck
pnpm.cmd check:evidence
git diff --check
```

[Independent review](ci-review-r01.md) · [Follow-up closeout](ci-closeout.md).
