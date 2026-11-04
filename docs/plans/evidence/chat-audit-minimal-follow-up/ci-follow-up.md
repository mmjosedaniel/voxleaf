# CAF CI follow-up: preserve aligned block fallback

Status: correction implemented and host validation complete. Independent
acceptance is governed by the separate [CAF-CI-R1-20261104 report](ci-review-R1.md);
a pending report is not approval. Hosted CI for the delivered commit is separate.

Base/HEAD at investigation: `57600c838d2cdf3a4f25e1c4575505504e49de2d` on
`codex/chat-audit-minimal-follow-up-plan`. Initial worktree/index were clean.
This is a bounded follow-up to PR #305, not a rewrite of the completed CAF plan
or its historical acceptance reports.

## Reproduction and cause

[Foundation checks run 41747237301](https://github.com/mmjosedaniel/voxleaf/actions/runs/41747237301)
failed in Windows job `126303211857`, during `pnpm.cmd test:browser`.
MAF-07 expected the restored empty line-break block to be less than one pixel
from the reading line; its measured displacement was 24.5 pixels. The other 59
browser cases passed. The later Windows WebView2/foundation steps were skipped.
Both Ubuntu jobs and the dependency audit passed on that original PR head;
those historical outcomes do not establish acceptance of this follow-up.

The unchanged MAF-07 test reproduces the same 24.5-pixel error locally before
production edits. The reflow restorer already aligns a measurable block fallback
when Chromium returns no range rectangle. CAF's initial settlement then changes
the visible/narration locator to the block start and unconditionally calls
`scrollIntoView`, replacing that measured placement with element-edge scrolling.

The correction retains locator reconciliation but skips that additional element
scroll when the restorer reports successful alignment. Unaligned/unavailable
fallbacks retain their existing scroll behavior. Exact interior ranges, delayed
narrator attachment, focus and persisted precise checkpoints retain their
existing controls. No timeout, browser assertion or retry policy is weakened.

## Tests and evidence

All local checks run in normal PowerShell outside the managed sandbox using
Node 24.20.0 and pnpm 11.15.1. Receipts, input identities, full output and the
original hosted log are ignored under `tmp/evidence/chat-audit-ci/20261104-01/`.

| Receipt | Exact command | Outcome |
| --- | --- | --- |
| browser-red | `pnpm --filter @voxleaf/desktop test:browser --grep MAF-07` | Exit 1; unchanged browser test reports 24.5 pixels. Original trace/screenshot retained separately before the next run. |
| unit-red | `pnpm --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx -t CAF-CI` | Exit 1; first fixture used an incorrect 8-pixel target, so it did not prove aligned placement. Retained, not acceptance evidence. |
| unit-aligned-red | `pnpm --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx -t CAF-CI` | Exit 1 with unchanged production and the existing environment's correct 24-pixel block geometry; detects the unwanted element scroll. |
| unit-green | `pnpm --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/reader-reflow-restoration.test.ts src/App.test.tsx` | Exit 0; 152 tests passed. New regression also verifies fallback locator/narrator settlement and no precise-checkpoint write. |
| static | `pnpm exec eslint apps/desktop/src/reader/ReaderPublication.tsx apps/desktop/src/reader/ReaderPublication.test.tsx; if ($LASTEXITCODE -eq 0) { pnpm --filter @voxleaf/desktop typecheck }; if ($LASTEXITCODE -eq 0) { pnpm exec prettier --check apps/desktop/src/reader/ReaderPublication.tsx apps/desktop/src/reader/ReaderPublication.test.tsx }` | Exit 0; lint, desktop types and formatting passed. |
| browser-full | `pnpm.cmd test:browser` | Exit 0; all 60 tests passed, including unchanged MAF-07 and CAF initial-fallback coverage. |
| docs-guard | `pnpm.cmd check:evidence; if ($LASTEXITCODE -eq 0) { git diff --check }` | Result recorded in `docs-guard-result.json` with final patch inputs. |

No historical runtime result is reused for this correction. Existing dependencies,
synthetic fixtures and the receipt harness are reused artifacts. Native inference,
optional admission, packaging, protocol, Rust and Python checks are not rerun
locally because their responsibilities/inputs are unchanged; this is a scope
omission, not a fresh or reused PASS. The current renderer is built by the
configured full-browser runner. Hosted Windows native checks remain required
before declaring PR CI green.

The process/data-flow diagram and ADR-0008/0011 remain applicable. There are no
new dependencies, persistence changes, resource owners or privacy boundaries.
The completed plan and frozen authorities remain untouched.

## Independent acceptance and delivery

The separate review assesses the exact final patch and host receipts before
the correction is committed/pushed to the existing PR. Full source/export
comparisons are retained in `input-equivalence.json`; only documentation changed
after the passing runs. Original approvals stay historical and do not approve
this new patch. No merge is authorized.
