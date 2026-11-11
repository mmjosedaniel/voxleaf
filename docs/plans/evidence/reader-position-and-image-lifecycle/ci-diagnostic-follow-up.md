# PR #311: native timeout diagnostics and manual-scroll precondition

Work date: 2026-11-10. Base and reviewed HEAD before this follow-up:
`90a2d137db4a8440976c398fa465a090c86f0022`.

## Observed CI failure

[Foundation run 42864371400](https://github.com/mmjosedaniel/voxleaf/actions/runs/42864371400)
failed twice in `Windows native foundation`, during `RPI-02 native image 2
decode`, with `webdriver-condition-timeout`. The original job was
`129998637958`; the authorized failed-job retry was `130262976380`.
Both used WebView2 `131.0.2903.86`. Both passed all 68 Chromium cases before
the native failure. Ubuntu portable, Ubuntu Rust and the dependency audit
passed. The Windows authoritative foundation step was skipped after the
native failure; it is not a PASS.

CI checked out synthetic merge `7970f8ad203699cdf5c11e9e29ea459e8266d339`.
Its tree and local HEAD's tree are both
`90e7d88a19f548a464f777b68633c26c52c8c3b5`, verified from fetched Git objects.
The initial worktree and index were clean.

The original predicate observes a completed local image, but records no
target geometry or presentation state on failure. Its timeout alone cannot
identify whether the target was outside the viewport, waiting, or unavailable.
No production image-loader defect has yet been established by that receipt.

## Reproduction and bounded changes

The unchanged native smoke passed locally on WebView2 `157.0.4341.42`, both
normally and with diagnostic CPU throttling at six times and a 1024 by 768
window. The exact native image scenario also passed through a temporary
Playwright adapter on Chrome for Testing `131.0.6778.33`. These observations
do not establish WebView2 131 acceptance or resolve the remote failure.

The Chromium 131 comparison exposed a separate deterministic test defect:
the forced-fallback C1 case's fixed 700 px wheel ended between paragraphs.
The reading line was at 379.921875; the previous paragraph ended at 370.4375
and the next began at 390.4375. The previous paragraph was nearer, so M004's
existing nearest-visible/block-start policy retained the same visual locator.
The test incorrectly required changed persistence without establishing a
different logical destination. Independent diagnostic assessment
`RPI-CI-DIAG-20261110-02` confirmed this distinction.

The browser test now uses real wheel input with a distance calculated from
the next fixture paragraph. It independently waits for that paragraph to
cross the reading line, then requires its consecutive canonical anchor to be
saved and restored after reopening. Earlier preservation checks remain.

The native scenario now reports bounded target/viewport rectangles, scroll
position, presentation flags and existing resource counters when either image
condition fails. It never reports text, paths, URLs or raw exception messages.
It rethrows the original error even when observation fails. Predicates,
timeouts, retry policy, image limits and production code remain unchanged.

The new harness test first failed because no observation was emitted
(53/54 PASS), then passed with the diagnostic change (54/54 PASS). It covers
available and failed geometry, private-content sentinels and original-error
identity. The browser reproduction was 4/5 before correction and 5/5 after.

## Current host evidence

Commands ran in normal local PowerShell outside the automation sandbox,
using Node `24.20.0`, cached pnpm `11.15.1` and a temporary, matching EdgeDriver
`157.0.4341.42`. Global installations were unchanged.

| Command | Result |
| --- | --- |
| `pnpm.cmd test:native-smoke-harness` | PASS, 54 tests |
| `pnpm.cmd --filter @voxleaf/desktop test:browser reader-image-lifecycle.smoke.spec.ts` | PASS, 5 cases on repository-pinned Chromium |
| `pnpm.cmd --filter @voxleaf/desktop test:browser --config ../../tmp/evidence/rpi-ci/playwright-131.config.ts reader-image-lifecycle.smoke.spec.ts` | PASS, 5 cases on temporary Chrome 131 |
| `pnpm.cmd test:native-startup` | PASS on local packaged WebView2 157, including restart and cleanup |
| `pnpm.cmd format:check:typescript` | PASS |
| `pnpm.cmd lint:typescript` | PASS |
| `pnpm.cmd typecheck:typescript` | PASS |

The temporary Chrome archive came from Google's Chrome for Testing archive;
its SHA-256 is
`169e5eca25d899d8659aef2c27b3b9fdbe028f94352775a24d2e431c0abb703b`.
Local raw logs and diagnostic adapters are ignored under
`tmp/evidence/rpi-ci/`. Initial temporary-adapter setup errors and cancelled
slow downloads were preparation failures, not product test outcomes.

This scope changes only test input and failure observation. It does not need
new runtime benchmarks or repeat unaffected runtime suites as acceptance for
these edits. Existing completed plans and implementation review records remain
immutable. The system diagram still describes the same architecture.

## Handoff boundary

The [diagnostic patch review](ci-diagnostic-review.md) records independent
assessment of this bounded patch and its [identities](ci-diagnostic-identities.md).
This is an intermediate diagnostic handoff. The original native CI failure
remains unresolved until a fresh remote observation identifies its cause and
the required checks pass. It is not a completion claim for the CI repair.
