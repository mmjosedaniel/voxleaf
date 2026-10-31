# PR #290 paused-navigation CI follow-up

Base and tested HEAD: `032ded44330c96259ba532559b27b440b8346f72`.
This follow-up preserves the completed ExecPlan and its original acceptance
receipts. It corrects a reader interaction exposed by the broader hosted suite.

## Failure and correction

The [original Windows job](https://github.com/mmjosedaniel/voxleaf/actions/runs/41163615622/job/124426325418)
passed 39 browser tests but failed `VCA-06/09`: paused Next/Previous never
cleared `data-narration-navigation-settling`. The other three jobs passed.
The same isolated browser case failed locally before production edits.

MPA-03 publishes a paused snapshot while the old narration owner is being
released. The highlight controller previously relied on a transient stopped
phase to clear the old audible projection. Retaining the paused phase left
that projection able to follow or settle the old locator while the reader was
placing an explicit target. This violates the existing synchronization
authority: explicit navigation clears the highlight; ordinary Pause retains it.

The controller now also clears on `snapshot.navigation.settling`. It uses
existing cleanup to cancel the pending follow, release its sampling suspension,
and prevent later mapper refreshes or queued callbacks from reclaiming the old
placement. The selected-rate correction and ordinary Pause/Resume are preserved.
No browser assertion, timeout, retry policy or workflow was changed.

The new deterministic regression first proves ordinary Pause retains the
highlight. It then proves navigation removes it, cancels follow work, releases
sampling exactly once, and suppresses an already captured callback and later
refreshes. It failed on the retained Range before the one-line correction.

## Validation selection and receipts

All local checks run in normal local PowerShell outside the managed sandbox.
Ignored receipts, full input identities, generated export identities, logs and
the original browser failure artifacts are under
`tmp/evidence/minimal-playback-audit-corrections/`. No prior failure is overwritten.
Tooling remains Node 24.18.0, pnpm 11.15.1, Vitest 5.0.5, Playwright 1.64.1,
Cargo 1.97.1 and uv 0.11.29.

| Receipt | Exact command | Result |
| --- | --- | --- |
| CI1-reproduce | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "VCA-06/09"` | Exit 1; same stuck navigation assertion |
| CI2-regression-red | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/segment-highlight-controller.test.tsx -t "MPA-CI"` | Exit 1; retained highlight, six unrelated tests skipped |
| CI3-reader-unit | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/segment-highlight-controller.test.tsx src/reader/ReaderPublication.test.tsx src/tts/product-narration-coordinator.test.ts` | Exit 0; 187 tests passed |
| CI4-browser | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep "VCA-06/09\|MPA-01/03\|RAC-07\|NLC real worklet\|R7-04"` | Exit 0; five tests passed |
| CI5-static | `pnpm.cmd format:check:typescript && pnpm.cmd lint:typescript && pnpm.cmd --filter @voxleaf/desktop typecheck` | Exit 0 |
| CI6-build | `pnpm.cmd build:desktop` | Exit 0 |
| CI7-piper-en | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | Exit 0; one arm, all six rates, synchronization and cleanup passed |

The newly exposed reader boundary requires the highlight/reader/coordinator
suites and browser navigation, Resume, completion and reflow cases. Previously
passing unrelated worklet and backend suites are not rerun locally or relabelled
as fresh evidence. The affected renderer invalidates the prior executable and
native journey, so this follow-up rebuilds once and renews one Piper EN WebView2
arm. It does not broaden the language/model matrix or change acceptance criteria.
Configured browser hooks still build their required workspace packages.

Native preparation reused the previously verified Piper package and matching
driver/runtime, without package regeneration or installation. All 2,023 runtime
manifest entries were size/hash verified. The complete original adjacent resource
tree was restored with equal file membership, sizes and SHA-256 values. No new
owned process or scratch directory remained; pre-existing scratch was preserved.
The old adjacent resources remain old; this is temporary test preparation.

The renewed 12,452,864-byte executable has SHA-256
`b7c4b929f6e46ff4f4a3ae3ecc3069ddc9c6407bf70cd8fcaf6ba7cd678c6afa`.
The wrapper verified this identity before and after execution. Native observations
include five created/closed AudioContexts, zero underruns, zero stale playback,
retained/discarded units, generated audio files and external requests after cleanup.
Pause retained its highlight and resumed at the same boundary; seek/chapter and
paragraph-leaf replacement passed. First slow-rate activation was 750 ms and
cancellation 460 ms; these are this run's observations, not expanded support claims.

Original and current gate manifests preserve source/config/fixture membership,
installed metadata and generated package exports. Only documentation changed after
these passing gates. The final input comparison and documentation checks accompany
the independent review; the prior native result is not reused for the new binary.

## Review and limits

The independent assessment is recorded separately in `ci-review-report.md`.
The system diagram was reviewed: this correction
stays within existing reader ownership and introduces no process, dependency,
public contract, persistence, inference or DSP change. It adds no new performance,
listening or support claim. Hosted checks for the follow-up commit remain
separate from local acceptance; no merge is authorized.
