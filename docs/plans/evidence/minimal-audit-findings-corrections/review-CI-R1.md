# Change Review Report

Review ID: MAF-CI-R1-20261029

Task ID: Minimal audit findings corrections — PR #286 CI follow-up.

Verdict: **APPROVE**

Base commit and reviewed HEAD: `af852ee81f593998bd14f1a25d0877a9610e6bcf`.

Branch: `codex/minimal-audit-findings-corrections`.

Reviewed paths and identities: Closed manifest `tmp/evidence/minimal-audit-findings-corrections/review-CI-R1-manifest.json`, containing 1,440 paths with status, SHA-256, filter-aware Git blob identities and deletion representation. Manifest SHA-256: `ab31ff0d644d24f6642c68edf33245c08f4b4d0574380a4d5c46f5c1eb1ebd52`.

The four task-owned changed paths are:

- `apps/desktop/src/App.test.tsx`
- `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`
- `docs/plans/completed/README.md`
- `docs/plans/evidence/minimal-audit-findings-corrections/ci-follow-up.md`

Patch dossier identities:

- `review-CI-R1.diff`: `0e06631ab58e14187196b522a1d34b8620dbcf87a8f96ec2f759e67f2b7ef7cd`
- `review-CI-R1-new-files.json`: `72bbb600adfd17666d04eb12447c2b508cafe3380bffdcb8c8a028bfedfecb3d`
- `review-CI-R1-gate-comparison.json`: `b92e2aee5d495606bc06b61768b84f691a2683820dc878a1100a1bb519a2a41a`

Identity recheck: **PASS**. Independent before/after inspection found no SHA-256 or filter-aware blob mismatches across the closed manifest. Actual porcelain statuses and changed-path membership matched the manifest. HEAD and branch remained unchanged; the index remained empty. The tracked diff and new document matched the dossier. The report’s intentionally excluded destination did not exist at the final recheck.

Acceptance review: The patch corrects two test synchronization prerequisites without removing behavioral coverage or changing production behavior.

For NCC-02, constructing the narrator during `App.tsx` render does not establish that the subsequent effect has installed its visibility binding. The initial binding can still capture the ownerless state. In `hardware-compatibility-check-binding.ts`, `ensureChecked()` is called synchronously when a binding is installed, followed by listener registration in the same call stack. Waiting for its second invocation therefore establishes the new owner’s committed binding before the test dispatches visibility events. The current-owner refresh, stale-owner rejection and unmount cleanup assertions remain intact. The original Ubuntu failure is consistent with the earlier readiness assumption; the unmodified test passing locally does not establish cross-platform reliability.

For RAC-07, immediate highlight visibility after Resume does not establish completion of follow settlement. `segment-highlight-controller.ts` schedules settlement over two animation frames and permits one subsequent layout correction with another two-frame settlement. The four requested frames allow that bounded sequence to finish before the test begins a separate passive inspection. This matches the synchronization authority’s suspension of passive sampling during programmatic placement and the existing controller unit test’s explicit settlement flush. The browser test continues to assert Resume visibility, focus and selection preservation, audible progression, subsequent offscreen-range persistence and audio-context cleanup. It would still fail if ordinary playback continuously followed the later passive scroll.

The changes introduce no sleeps, disabled assertions, retry increases, production changes, dependencies or workflow changes. Privacy, local inference, memory bounds, cancellation, stable locators and public contracts have no modified implementation boundary. Additional model, native or performance execution is not required for these test-only corrections. The follow-up document accurately separates local evidence from pending hosted CI and preserves the completed plan and original review reports.

Test evidence reviewed: Results below are attributed to the executor’s recorded normal local PowerShell sessions outside the sandbox. I did not execute tests, formatters or builds.

| Receipt | Command and recorded result |
|---|---|
| `CI-App-baseline-01` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/App.test.tsx -t NCC-02` — exit 0; 1 passed, 77 deselected. Original Ubuntu CI supplies the failure evidence. |
| `CI-Browser-baseline-01` | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep RAC-07 --repeat-each=3` — exit 1; 1 failed, 2 passed, reproducing the original offscreen assertion failure. Trace, screenshot and error context retained. |
| `CI-Focused-01` | Desktop Vitest invocation covering `App.test.tsx`, `hardware-compatibility-check-binding.test.ts` and `segment-highlight-controller.test.tsx` — 89 tests passed. RAC-07 with `--repeat-each=5` — 5 passed. |
| `CI-Static-01` | Scoped `pnpm.cmd exec prettier --check` and `pnpm.cmd exec eslint` for both changed tests, plus `pnpm.cmd --filter @voxleaf/desktop typecheck` — exit 0. |
| `CI-Desktop-01` | `pnpm.cmd --filter @voxleaf/desktop exec vitest run` — exit 0; 984 tests across 61 files passed. |
| `CI-Browser-01` | `pnpm.cmd test:browser` — exit 0; all 34 browser tests passed, including its existing build preparation. |
| `CI-Docs-01` | `pnpm.cmd check:evidence`, the recorded relative-link checker and `git diff --check` — exit 0; guard passed and 79 link targets resolved. |

Original Windows and Ubuntu CI log hashes matched the supplied identities. Receipt, log and before/after snapshot hashes in the comparison artifact matched their files. The final documentation snapshot matched all 1,787 recorded current paths. Observed gate-time changes were attributable to TypeScript build metadata; later source drift was documentary.

Evidence reuse assessment: Retention of the 31 isolated evidence-guard tests from `F-Docs-01` is justified by unchanged guard/test sources, configuration, discovery inputs and relevant tool identities. Those tests exercise temporary repository fixtures; the actual current repository guard was separately renewed. This approval does not renew the earlier implementation reviews or assert newly executed native/model acceptance.

Findings: **None.**

Remaining uncertainty: The corrective patch has not yet completed hosted CI. In particular, the revised NCC-02 has local Windows evidence rather than a new Ubuntu execution. Its synchronization mechanism is supported by the owning source, but hosted confirmation remains outstanding. No hosted-green claim is made.

Required next action: Save this immutable report at its excluded destination, complete the planned documentation and exact-identity rechecks, then use the user’s existing authorization for the commit/push handoff. Inspect the resulting hosted checks before declaring the pipeline repaired. This report grants no additional Git permission.
