# Reader position and image lifecycle execution ledger

Base/HEAD: `26f92365eed3d30cbcb57eb2867b848d3beb28c4`.
Date: 2026-11-10. Implementation authorized; no Git mutations authorized.
Initial index/worktree clean. All commands below run in normal host PowerShell
outside the managed sandbox. Raw captures remain under ignored `tmp/evidence/rpi/`.

## Preparation and M0

- Corepack supplies pnpm 11.15.1, but nested commands initially found 11.25.0.
  A task-local ignored `tmp/rpi-tools/pnpm.cmd` invokes the cached 11.15.1 CLI.
  Dot-source `./tmp/rpi-tools/use-tools.ps1` before the listed commands. Both
  `pnpm.cmd --version` and `pnpm.cmd exec pnpm --version` return 11.15.1.
  Node is v24.20.0. No global install, dependency or lockfile change.
- `pnpm.cmd build:packages`: PASS, existing shared/EPUB outputs prepared.
- Initial RPI-01 harness used an unsupported line-spacing token; corrected to
  `spacious` before accepting its baseline. Initial image fixture lacked a
  declared PNG; corrected its manifest/resource before accepting its baseline.
  The initial failed browser artifacts are preserved in ignored local evidence.
- `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx -t RPI-01`:
  expected FAIL, all four cases replace saved offset 3 with 0. The actual reader,
  save coordinator and strict repository participate; missing range geometry is
  controlled, not claimed as natural browser occurrence.
- `pnpm.cmd --filter @voxleaf/desktop test:browser reader-image-lifecycle.smoke.spec.ts`:
  expected FAIL in real Chromium at image occurrence nine (`nth(8)`), after the
  first eight decoded. The fixture deliberately repeats the same local resource
  to exercise occurrence ownership. No production source was changed before
  these baseline failures.

## Scope and acceptance

Added test paths: `apps/desktop/tests/fixtures/reader-image-lifecycle-fixture.mjs`
and `apps/desktop/tests/browser/reader-image-lifecycle.smoke.spec.ts`.
They share a synthetic EPUB with the existing native harness. Production edits
remain within the ExecPlan's reader/persistence/image owners. Combined acceptance
and independent review passed; the closeout receipt records final archival checks.

## Combined-path discovery before final acceptance

The first full Chromium run passed 65 cases and failed natural RPI-01/C1 at the
first post-open checkpoint: offset 100 became 85 without user movement. Holding
only the real local image decoder completion until after initial settlement
reproduces the same failure. Range geometry remains real in this case. This is
image presentation causing a later visual sample, distinct from the historical
C15 fractional-geometry investigation; that historical disposition is unchanged.

The authorized integration scope therefore adds the existing active-visual-locator
owner/tests. A single transient snapshot of settled block/viewport geometry
ignores a later sample only while that placement remains unchanged within the
existing one-pixel placement tolerance. Actual displacement retires the snapshot
and admits normal progress, including offset zero; missing geometry does not
install a guard. No timeout or input-event classification is introduced.

An intermediate image-to-restorer notification experiment was rejected because
it competed with rapid scrolling and still failed delayed-image coverage. It
is absent from the final patch: ReaderPublication and the reflow restorer retain
their production code. Two existing mounted-reader tests now model actual
viewport displacement as well as a changed caret, preserving all assertions.
The responsive-image test waits for its own resize transaction before the next
explicit test scroll. Repeat affected host gates for this final tracker patch.

## Host validation ledger

Executor: primary implementation task, normal local PowerShell outside the
managed sandbox, repository root. All package commands below use the ignored
11.15.1 shim described above. Every result is from this implementation task.
No old plan/CI/runtime PASS is reused. Raw log filenames below are relative to
`tmp/evidence/rpi/`; they are local troubleshooting artifacts, not public evidence.

| Gate | Exact command | Result and current capture |
| --- | --- | --- |
| Desktop, combined final | `pnpm.cmd --filter @voxleaf/desktop test` | PASS, exit 0; 61 Vitest files / 1,246 tests and 223 Node tests; `desktop-combined-final.log`. |
| Formatting | `pnpm.cmd format:check:typescript` | PASS, exit 0; `format-final.log`. |
| Lint | `pnpm.cmd lint:typescript` | PASS, exit 0; `lint-final.log`. |
| Type checks | `pnpm.cmd typecheck:typescript` | PASS, exit 0, shared/EPUB/desktop; `type-accepted.log`. |
| Directed Chromium | `pnpm.cmd --filter @voxleaf/desktop test:browser reader-image-lifecycle.smoke.spec.ts` | PASS, exit 0, five cases; `combined-current.log`. |
| Full Chromium | `pnpm.cmd test:browser` | PASS, exit 0, 68 cases; `browser-combined-final.log`. |
| Packaged WebView2 | `pnpm.cmd test:native-startup` | PASS, exit 0, current release build, synthetic image/restart/cleanup matrix; `native-combined-final.log`. |
| Chromium resources | `pnpm.cmd benchmark:reader` | PASS, exit 0, all six cases including six lifecycle cycles; `benchmark-browser-final.log`. |
| WebView2 resources | `pnpm.cmd benchmark:reader:native` | PASS, exit 0, current build and six lifecycle cycles; `benchmark-native.log`. |
| Evidence retention | `pnpm.cmd check:evidence` | PASS, exit 0; `evidence-before-review.log`; rerun after archival. |

Early directed invocations and corrections are retained separately. The first
pixel-pressure unit test used an invalid policy (aggregate ceiling below its
per-image ceiling); setting both to one pixel fixed that fixture. The first type
check identified the old immediate-visibility callback signature and missing
new-fixture declaration; both were corrected. A final-format check first flagged
the new browser spec and then passed after formatting. None is presented as a
production regression or accepted failed gate.

The first native run built successfully but stopped before the reader at
`webdriver-session-not-created`: installed EdgeDriver 155.0.4283.45 did not match
Evergreen WebView2 157.0.4341.42. The existing `msedgedriver-tool.exe` downloads
even when passed `--help`; its new file was moved into ignored
`tmp/rpi-tools/edge-157/`. Microsoft's Authenticode signature was Valid with
Microsoft Corporation as signer. Driver 157.0.4341.42 is selected only through
`VOXLEAF_EDGE_DRIVER_PATH`; the global driver/runtime were not replaced. The next
run exposed a new harness selector that searched all image hosts instead of the
first host's child; correcting that selector made the full native smoke pass.
That earlier PASS predates the tracker change and is superseded by the current
run above. Fixed RPI failure codes now keep diagnostics content-free.

## Acceptance traceability

| Cases | Evidence responsibilities |
| --- | --- |
| P1/P2 | Real ReaderPublication/save-coordinator/repository fallback composition; App canonical-recovery settlement test; Chromium complete-locator checks through four appearance controls, resize, pagehide, reload/reselection; native synthetic fallback and actual process restart. |
| P3 | Save-coordinator pending-passive promotion, deduplication and valid offset zero; tracker displacement and missing-geometry tests; real Chromium wheel movement followed by persisted complete-locator equality after reopen. Existing explicit-navigation and storage tests remain. |
| P4/P5 | Existing narration/paused/heard/StrictMode/replacement suites, full browser restoration/narration controls and native reader interaction matrix. New tracker tests distinguish unchanged placement from actual displacement without classifying input devices. Historical C15 remains separate. |
| I1/I2 | Twelve repeated resource occurrences in real Chromium and WebView2, image nine/twelve and revisit; real manager tests separate queue, live-source and aggregate-pixel pressure, visible-over-prefetch priority and automatic retry without target re-entry. |
| I3/I4 | Existing raster parser/source/format guards; malformed nonretry, obsolete read byte clearing, late-source retirement, StrictMode, fallback observers and source/error ownership; browser/native cleanup and benchmarks. |
| I5/C1 | Real 480x240 PNG footprint through eviction, viewport narrowing and reload; ordinary, missing-range and delayed-image Chromium checkpoint paths; native full checkpoint after restart. Five directed cases pass. |

Only synthetic publication data is used. Browser tests assert local decoding,
zero unexpected requests and errors; the image lifecycle path caps observed live
Blob URLs at eight and reaches zero after replacement. Native instrumentation
asserts zero owned URLs and observers after replacement. Benchmarks and review
remain acceptance gates; this ledger does not claim universal bug absence or
physical audibility, GPU/model quality, public signing or CI results.

The first Chromium benchmark passed its five capacity/latency cases, then the
lifecycle case hit an ambiguous `getByRole("status")` while both opening and
narration-cleanup statuses were temporarily mounted. Extend the harness scope
to `reader-performance.benchmark.spec.ts`: select the existing `#open-status`
feedback element for the same invalid-EPUB assertion. Keep every threshold,
six-cycle count and resource assertion unchanged, then rerun the benchmark.

## Current input identity and resource observations

Base/HEAD and branch remain unchanged; `git diff --check` passes and the index
is empty. The current-task desktop/full-browser/native runs used the same
production sources. A 446-file repository source/test/configuration snapshot is
retained locally as `tmp/evidence/rpi/final-test-inputs.json`, SHA-256
`3f1cb72db8ceef895947a01ce7e341f997b13808b4e16bbb7b44ae6f4e605bae`.
The later comparison found exactly one change: the benchmark selector above.
It is excluded by ordinary Playwright `testIgnore` and is not a Vitest/Node/native
input. Those gates remain current; formatting/lint/types and the benchmark were
rerun. The revised 446-file snapshot `final-test-inputs-r2.json` has SHA-256
`07fdea9d54a99226937dfd11e69a7f6e7d4dc621234bbace8b7cf60998545376`.
These ignored snapshots are supplementary, not substitutes for the curated
review identities. Documentation-only completion updates do not change runtime
gate inputs; evidence retention is checked again after those updates.

The native smoke's current release executable SHA-256 is
`73cf706afab13d4ba1d5acb86de6ea41941ed536687018a253fc41cf56390546`.
Its frontend entry is `index-BFwVO290.js`; the benchmark performs its own build.

Current Chromium production observations: maximum batch 7.3 ms, target ready
660.3 ms, preference reflow 66 ms, full application working-set delta
126,070,784 bytes. The combined 10,000-block/eight-image fixture used 16,773,632
decoded pixels and 183,869,440 bytes working-set delta. All existing limits pass.
Six lifecycle cycles ended with zero owned Blob URLs and observers, unchanged
closed DOM count, 1,056,472 bytes first-to-last closed heap growth and 5,316,608
bytes working-set growth. External requests/errors and unexpected storage keys
are zero. These are host observations, not new limits or universal guarantees.

Current WebView2 observations: maximum batch 8.6 ms, target ready 310.5 ms,
preference reflow 75.3 ms and working-set delta 124,813,312 bytes. All existing
native thresholds pass. Six cycles finish with zero owned URLs/observers and
zero closed-DOM growth; first-to-last closed heap growth is 568,424 bytes and
working-set growth is 6,176,768 bytes. Both native commands exit 0 after the
existing owned-process/profile cleanup. No real profile or reader storage was
cleared. Benchmarks ran sequentially after all other host test processes exited.

Independent `change_reviewer` report [RPI-CR-R1-20261110](review-report-01.md)
is APPROVE with no findings. It rechecked the closed manifest, five additional
supporting files and all 446 current input identities. Code remained frozen
during review and is unchanged during documentary archival. The final
documentary review is preserved in [closeout.md](closeout.md).

The native benchmark's separately built executable has SHA-256
`d265d97e1bc8a12d4917ff641ce62da9f84e8557b43b01214ac5d249142f7e20`,
independently checked by the reviewer. Both native commands used their own
configured builds from the same current source inputs; binary equality with
the earlier smoke executable is not claimed. No implementation commit, push,
PR or change to global pnpm/EdgeDriver was made.
