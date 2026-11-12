# Passage navigation CI follow-up

Date: 2026-11-12. Base and tested HEAD:
`5de6bb706d162467856cf4775da747bba395367b`.
This bounded follow-up to [PR #313](https://github.com/mmjosedaniel/voxleaf/pull/313)
does not rewrite the completed ExecPlan or its accepted evidence.

## Failure and reproduction

[Windows job 131398131039](https://github.com/mmjosedaniel/voxleaf/actions/runs/43279915009/job/131398131039)
failed during RPI-02 image 2 placement on WebView2 131.0.2903.86. The target was
approximately y=3765–3861, outside the viewport y=298–671; scrollTop was 9.
Both Ubuntu jobs and the dependency audit passed. Windows browser checks passed;
the authoritative foundation check was skipped after the native smoke failed.
The diagnostic establishes offscreen placement, not a decoder failure.

An unchanged-harness reproduction with synthetic content in Chromium 131 and
delayed animation-frame callbacks exposed the missing precondition: after the
harness placed image 2 at scrollTop 3357, the pending viewport restorer called
scrollBy(-3348), returning to 9. The image then left the viewport and retired.
The same instrumented scenario passes after the correction. Its failure happened
at decode because its visibility poll preceded the rollback; the CI poll failed
at placement. This reproduces a mechanism consistent with CI. The original CI
log itself contains no scroll-call trace.

## Correction and preserved coverage

Only the native smoke and its harness tests change. Before its first image
scroll, the smoke requires ready reader/shell state, positive viewport geometry,
and three animation frames with unchanged viewport position, dimensions and
scroll extent. A change returns to the existing readiness polling loop. This
allows the already scheduled viewport restoration to settle before test-owned
movement. It does not extend the readiness timeout or retry failed placements.

The existing 12 visits, independent placement/decode assertions, shared per-visit
deadline, eight-source bound, retirement, fresh-source revisit and zero-resource
cleanup remain intact. Negative controls still reject no movement, rollback,
visible decode failure and unavailable diagnostics. New cases cover an initial
pending reflow and a layout that never stabilizes before the first scroll.

No product behavior, dependencies, architecture, inference, audio retention,
locator contract or cancellation policy changes. The system diagram remains
applicable. There is no model or installer-lifecycle change requiring a new
model benchmark or installation journey.

## Host validation

All new checks ran in normal local PowerShell outside the managed sandbox:
PowerShell 7.6.9, Node 24.18.0, pnpm 11.15.1. Raw commands, logs, before/after
identities and synthetic diagnostics remain in ignored
`tmp/evidence/passage-navigation-ci/`.

| Receipt                                                 | Exact command                                                                                                                           | Result                                                                                     |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `frame-red`                                             | `node --test --test-name-pattern="RPI-CI.*(initial reflow\|unstable initial)" apps/desktop/scripts/native-smoke.node-test.mjs`          | Both new cases failed against the unchanged harness.                                       |
| `frame-green`                                           | `node --test --test-name-pattern=RPI-CI.*image apps/desktop/scripts/native-smoke.node-test.mjs`                                         | Six passed, including existing negative controls.                                          |
| `browser131-slow-frame` / `browser131-slow-frame-after` | `pnpm.cmd --filter @voxleaf/desktop exec playwright test --config ../../tmp/evidence/passage-navigation-ci/slow-frame.config.ts`        | RED before; GREEN after. Synthetic diagnostic, not a claim of native WebView2 equivalence. |
| `final-harness`                                         | `pnpm.cmd test:native-smoke-harness`                                                                                                    | 59 passed, zero skipped.                                                                   |
| `final-static`                                          | `pnpm.cmd exec eslint apps/desktop/scripts/native-smoke/reader-scenarios.mjs apps/desktop/scripts/native-smoke.node-test.mjs`           | Passed.                                                                                    |
| `final-static`                                          | `pnpm.cmd exec prettier --check apps/desktop/scripts/native-smoke/reader-scenarios.mjs apps/desktop/scripts/native-smoke.node-test.mjs` | Passed.                                                                                    |
| `final-static`                                          | `git diff --check`                                                                                                                      | Passed.                                                                                    |

The corrected harness and all these post-change checks share exact source
SHA-256 identities:

- `apps/desktop/scripts/native-smoke/reader-scenarios.mjs`:
  `C4C3353B5162A52EEC1B3738C95017C4D75FCA57BB31D0B80C061338BB206E8A`.
- `apps/desktop/scripts/native-smoke.node-test.mjs`:
  `3C8764B0520318AE6A4B3E3725FF2F9A8AC44A300A413B1D1ACF9A91E0C72FA9`.
- Harness/static before and after input manifest:
  `7DEDAD70A148F48A9D3E316B21DB30E838978EB5EFBD3F420145534F3454B7FD`.
- Final harness log:
  `5B1C846AB1E0BFFE15DFBEEAA3DFB53503442CEACA8E723DC98C193408C784E0`.

Historical receipts from PRs #311/#312 explain prior diagnostic and placement
changes; they do not establish acceptance of this correction. Their local
PowerShell capture helpers were inspected and adapted for the current HEAD and
evidence directory. No historical test PASS replaces a changed-harness check.
Unchanged application unit/type/model gates are omitted from this bounded local
selection; the existing CI workflow remains unchanged.

`pnpm.cmd test:native-startup` passed in receipt `native-final-ci-frame-a01`
with WebView2 157.0.4341.46 and EdgeDriver 157.0.4341.42. The current build and
complete native startup smoke passed, including image visits and recycling,
navigation, restoration, local protocol/cancellation and publication cleanup.
Host restoration was verified, including the adjacent core, with no remaining
hold. Piper preflight was configuration-only, not new inference evidence.

Native before/after identities matched: 13,314 source/tool inputs
(`9EA6771D7D7A297CAC784B2A634458FA7EDEC1C46A839B9B3AECD5D00F1105DA`),
1,494 runtime JavaScript inputs
(`1755883140FA786FFA0DE6A9F5F9F24011994B26A133106FFB9D76760352B9AA`),
251 package outputs
(`3EE467A549510E7A616AA2AD50713B981B59A3E38D0BD3778C202CCCF5AB9B15`),
and the core environment. Tested executable SHA-256:
`91EF8499D5765CB0B2ADE83D4D5F6638AE0EBE8B1B2DC0FC84A13F2D674ECE45`.

Independent acceptance is recorded in the separate immutable CI review report.
Local WebView2 differs from CI; a fresh Windows CI run remains required before
reporting remote acceptance. Diagnostic RED/GREEN logs remain separate; the
temporary Playwright output directory was reused, so its original RED trace is
not retained. The RED log retains the stage, numeric geometry and scroll calls.
