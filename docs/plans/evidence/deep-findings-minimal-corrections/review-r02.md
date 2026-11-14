# Change Review Report

Review ID: **DFM-CR-R02-20261114**
Task ID: deep-findings-minimal-corrections, VF-0034 through VF-0055.
Reviewer: independent `change_reviewer`, GPT-6 Astra high.
Verdict: **CHANGES_REQUESTED**.

This content-safe record preserves the returned verdict, finding and acceptance
assessment. The reviewer did not edit or run tests.

## Identity

Base and reviewed HEAD: `fab1c9e186552515e828c33ce75e11628dda8300`.
Branch: `codex/deep-findings-minimal-corrections`. Closed manifest: 237 reviewed
paths and 50 task paths, with no pre-existing changes and an empty index.

- Manifest SHA-256: `0ce1559dc8da1b0a19e34c5fd1d52b627fa1e94c957bd2f49fab8dadcbde2165`.
- Tracked patch SHA-256: `4a0b567aa14a9404e2d58ec565dce08723f578d7a6c08ef70d86384920e32a4f`.
- New-file contents SHA-256: `7e098703b0e4ae9dfc9195f30564584e4a1df533543ab941fb115dd20d119259`.

Identity recheck: **PASS**. Before/after hashes, filter-aware blobs and statuses
match; HEAD is unchanged, the index remains empty and no extra nonignored change
exists outside the declared manifest. Raw artifacts remain under ignored
`tmp/evidence/deep-findings-minimal-corrections/review-r02/`.

## Acceptance review

Both R01 correctness findings are resolved. VF-0048 retires pending preparation
on ended, deferred-empty-tail and paused-end completion, before late promise
outcomes. Tests preserve selection, resource release, reset, no stale fallback
and subsequent saved-rate playback; SAC-11 remains unchanged. VF-0055 checks run
ownership immediately after preparation publication and before controller/work
creation. Its mounted Reader regression proves zero obsolete work/publications
and successful subsequent navigation/Play.

Other R01-reviewed production paths retain their identities. No additional
actionable runtime defect was found. Privacy, bounded-work, locator, cancellation
and persistence constraints remain supported within the documented scope.

## Host evidence reviewed

These are supplied normal-host executions, not tests run by the reviewer.

| Receipt or scope | Reviewed outcome |
| --- | --- |
| `r01-residual-red-03` to `r01-residual-green-01` | Seven discriminating failures/five controls to all 12 passing |
| `g-desktop-closure-final-03` | TS format/lint/types and 819 desktop tests pass |
| `g-browser-closure-final-01` | Final 16 Chromium cases pass |
| Deterministic scoped reuse | EPUB 655; Python 58; Rust 80 pass/3 ignored per mode; Node 86 ordinary/release, 23 WebDriver, 76 native/portfolio |
| `native-final-deep-g7-07` | Actual startup/Piper ES pass, trusted scrollbar, two-entry terminal scene/1200-ms wait, next 75% playback and restored host |
| `native-final-deep-g8-01` | Actual exact-local admission, invalid Check, repair without reacquisition and removal pass |
| G9 and `g-ordinary-deep-02` | Current unsigned actual install/uninstall/restoration pass; only verified UNK-to-NSS byte transformation |
| `g-evidence-r02-01` | Evidence and diff whitespace checks pass |

The reviewer checked exact commands, receipt/log identities, scoped reuse code
and results, and native closure. G8 preserves its wrapper failure and excludes
only the demonstrated nonconsumed incremental output. G7 certifies its actual
default-feature executable, not installed release-locked playback.

## Finding

**P3: generated failure diagnostic included in the deliverable.** Root-level
`undefined.failure.json` is a generated `managedPaths` diagnostic. The bounded
ordinary smoke omits `options.receipt` and intentionally exits through the
journey's failure/finalization path; the production writer uses
`${options.receipt}.failure.json`. R02 includes that output in its task manifest.

Required correction: preserve it under ignored task evidence and remove it from
the deliverable. Route any future reuse of this smoke helper to an explicit
ignored receipt path. No production edit or runtime-suite rerun is required
solely for relocation.

## Limits and required action

No further implementation-acceptance blocker was identified. Historical locator
ambiguity, Stop receipt precision, controlled reentrant ordering, selected Piper
ES coverage, no G8 inference and unsigned local packaging remain qualified.
Archive/disposition updates await acceptance. Preserve R01/R02, resolve the
single output-scope finding and submit a new frozen revision; renew only actually
affected evidence. This report grants no Git or release authorization.
