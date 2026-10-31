# Change Review Report

**Review ID:** MPA-CI-R1-20261031

**Task ID:** MPA-CI

**Verdict:** APPROVE

**Reviewer:** independent `change_reviewer`, GPT-6 Astra high.

**Base commit and reviewed HEAD:** `032ded44330c96259ba532559b27b440b8346f72`

**Branch:** `codex/minimal-playback-audit-plan`

**Reviewed paths and identities:** Closed 51-path manifest at
`tmp/evidence/minimal-playback-audit-corrections/MPA-CI-R1-20261031-manifest.json`,
SHA-256 `e191fc2c386d51c89ad4965c27ed1bea8fdafddeb279952f9c96d80d8fefff28`.

The manifest binds status, raw SHA-256 and filter-aware Git blob identities for
all four task paths and unchanged supporting paths. Task-owned identities:

| Path | Status | Filter-aware Git blob |
| --- | --- | --- |
| `apps/desktop/src/reader/segment-highlight-controller.ts` | Modified | `d8354d7c5da23fa0297513a1fc5a1793f8327595` |
| `apps/desktop/src/reader/segment-highlight-controller.test.tsx` | Modified | `bfa45306c2f9893f6850f59acce0cc8f5c772e28` |
| `docs/README.md` | Modified | `dc9e8369fbef83a88e1213a1510b7edf69fa3a13` |
| `docs/plans/evidence/minimal-playback-audit-corrections/ci-follow-up.md` | Untracked | `456444031a3c2bd2e2ea4dc984b3b0182669c44e` |

Supplied `CI-review.diff` SHA-256:
`0815ca932aef2e5d2b730c8ff7fea7c3994bbc408479ced73fe84d7a9c5a8851`.
The new Markdown file was inspected in full.

**Identity recheck: PASS.** Before and after review, all 51 raw hashes and
filter-aware blobs matched; unchanged supporting blobs also matched the base
commit. HEAD, branch and four-path worktree status remained unchanged. The index
remained empty. No pre-existing changes were included.

**Acceptance review:**

- Explicit navigation sets `navigation.settling` through the coordinator's
  pending-navigation ownership. The added guard clears the retired projection
  using existing cleanup before reader placement proceeds.
- Cleanup removes the highlight and active key, cancels pending follow, and
  releases its sampling suspension. Captured callbacks cannot subsequently settle
  or scroll the retired projection.
- Ordinary Pause/Resume does not set this navigation signal. Existing
  retained-highlight and Resume-follow behavior remains intact.
- The coordinator invalidates the old playback identity and unsubscribes audible
  observations during teardown, preventing retired-session observations from
  recreating the projection.
- The new regression meaningfully exercises retained paused highlighting, follow
  cancellation, exactly-once sampling release, captured-callback suppression and
  later mapper refreshes.
- Existing browser assertions remain unchanged. VCA-06/09 checks repeated
  Next/Previous, exact interior offsets, preserved heard checkpoint, focus and
  selection, zero retained audio, no stale preparation, and explicit Resume from
  the selected boundary.
- MPA-03's six pending/settled selection, reset and failed-write cases remain
  covered. No DSP, recovery, public contract, inference, persistence or component
  boundary changes occur.
- The change introduces no queue, stored audio, network operation or additional
  retained publication data. The canonical architecture remains applicable.

**Test evidence reviewed:** These are implementer-supplied receipts from normal
local PowerShell outside the managed sandbox. The reviewer did not execute tests,
formatters or builds.

| Receipt | Exact command | Recorded outcome |
| --- | --- | --- |
| CI1 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep "VCA-06/09"` | Exit 1; reproduces stuck navigation before production correction |
| CI2 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/segment-highlight-controller.test.tsx -t "MPA-CI"` | Exit 1; retained Range assertion fails, six unrelated cases skipped |
| CI3 | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/segment-highlight-controller.test.tsx src/reader/ReaderPublication.test.tsx src/tts/product-narration-coordinator.test.ts` | Exit 0; 187 tests pass |
| CI4 | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep "VCA-06/09\|MPA-01/03\|RAC-07\|NLC real worklet\|R7-04"` | Exit 0; five cases pass |
| CI5 | `pnpm.cmd format:check:typescript && pnpm.cmd lint:typescript && pnpm.cmd --filter @voxleaf/desktop typecheck` | Exit 0 |
| CI6 | `pnpm.cmd build:desktop` | Exit 0 |
| CI7 | `& ./tmp/evidence/minimal-playback-audit-corrections/ci-piper-resources.ps1` | Exit 0 |
| CI8 | `pnpm.cmd check:evidence && git diff --check` | Exit 0 |

CI7's inspected wrapper invokes:

`node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --exercise-playback-speeds --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en`

The renewed executable matches SHA-256
`b7c4b929f6e46ff4f4a3ae3ecc3069ddc9c6407bf70cd8fcaf6ba7cd678c6afa`.
The native receipt covers six rates, synchronization, Pause/Resume, seek/chapter
and paragraph-leaf replacement, and cleanup. Resource preparation verified 2,023
runtime entries. Before/after resource inventories match; the wrapper records no
new owned processes or scratch directories.

The reviewer independently checked all receipt input-manifest hashes and their
current file identities. Passing runtime gates have only the documented Markdown
differences; CI8 has none. All 251 generated-export identities match, and export
manifests agree across gates. This supports retaining the current-task results
after documentation changes. Historical backend/native PASS results are not
substituted for current evidence.

**Findings:** None.

**Remaining uncertainty:** No blocking uncertainty for this bounded patch.
Follow-up hosted CI remains separate. Broader model/platform matrices, listening
acceptance and unrelated backend suites were not renewed or claimed current.

**Required next action:** None for this review gate. Preserve this report outside
its manifest and recheck identities before any authorized Git action. This
approval is not a Validation Report or authorization to commit, push, merge or
create a PR.
