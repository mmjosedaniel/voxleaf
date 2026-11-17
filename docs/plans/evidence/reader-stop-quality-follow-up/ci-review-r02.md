# Change Review Report

Review ID: PR325-CI-CR-R02-20261116

Task ID: PR325-CI-R02

Verdict: **APPROVE**

Base commit and reviewed HEAD: `3f1bd55d1dd022a9d2b185e849016987466d2923`

Branch: `codex/revalidated-findings-execplan`

## Reviewed paths and identities

Inherited the complete closed set of 1,871 paths from `tmp/evidence/pr325-ci/inputs-r02.json`, record `PR325-CI-INPUTS-R02-20261116`.

Manifest SHA-256: `070c7f26b9cd3722942641bcf11d6a11bf93d5355018d734d3d001ab0249b2c4`

Tracked patch: `tmp/evidence/pr325-ci/candidate-r02.patch`

Patch SHA-256: `67495625e4f16de626541754673c0fd3e5301d6fb16eb54939dade6fb4d65103`

Explicit manifest delta: none. No previous approval is inherited.

The four candidate paths are:

- `apps/desktop/tests/browser/reader-narration-bugfixes.smoke.spec.ts`
- `docs/development/findings/registry.md`
- `docs/plans/completed/README.md`
- `docs/plans/evidence/reader-stop-quality-follow-up/ci-browser-follow-up.md`

I read the complete tracked patch and the complete new follow-up document. Supporting inspection included the manual-input handlers and locator tracker, ReaderPublication-to-App callback, persistence guard, mounted reflow/restoration controls, Playwright configuration, package commands, relevant requirements and supplied execution logs.

## Identity recheck

**PASS.** Independent read-only reconstruction before and after review matched all 1,871 path memberships, porcelain statuses, SHA-256 values and filter-aware blob identities. The candidate list matched the actual tracked/untracked changes, with no duplicate entries. The archived patch matched the current binary Git diff.

Base, HEAD and branch remained unchanged; the index remained empty. Both reserved outputs remained absent:

- `docs/plans/evidence/reader-stop-quality-follow-up/ci-review-r02.md`
- `docs/plans/evidence/reader-stop-quality-follow-up/ci-closeout-r02.md`

No tests, builds, formatters, edits, delegation or Git mutations were performed by this reviewer.

## Acceptance review

The correction addresses the demonstrated BNC-01 test-input mismatch. The previous `scrollIntoView()` invocation moved the viewport without providing the measured manual intent required to release heard-checkpoint protection. The retained Windows log and local RED both fail at the same assertion: persisted spine 0 instead of expected spine 1.

The replacement hovers the reader viewport and sends browser-level wheel input. The inspected production path requires a trusted nonzero vertical wheel event, records the pre-movement scroll position, verifies subsequent movement, and delivers the measured-manual flag through ReaderPublication and App to the persistence coordinator. The test does not inject that flag, call a save method or dispatch a synthetic DOM scroll event.

The downstream assertions remain unchanged. They require a saved locator in spine 1 with a noninitial paragraph anchor, no automatic speech restart during or after compatibility settlement, and a subsequent explicit Play preparing the saved anchor. The correction therefore preserves the original rejected-navigation and continuation contract.

The two freshly executed VF-0074 mounted controls retain the complementary protection: automatic layout changes preserve the pre-Stop checkpoint through same-byte reopening, while deliberate later movement becomes the persisted successor. Their delayed-image variant uses actual native decode completion with controlled release and real layout sampling.

Only one browser-test input and its documentation change. Production behavior, workflow, timeout/retry settings, fixtures and expected results remain unchanged. The registry and follow-up correctly identify a test-call coverage gap and preserve the earlier evidence. No package, frozen authority or historical report is modified.

## Test evidence reviewed

The following results are attributed to the coordinator’s normal local PowerShell 7.6.9 execution outside the sandbox, with Node 24.18.0, pnpm 11.15.1 and the existing pinned Playwright Chromium:

| Command | Attributed result |
| --- | --- |
| `pnpm.cmd --filter @voxleaf/desktop test:browser reader-narration-bugfixes.smoke.spec.ts --grep BNC-01` before correction | Exit 1; reproduced saved spine 0 versus expected 1 |
| Same command after correction | Exit 0; 1 passed |
| `pnpm.cmd --filter @voxleaf/desktop test:browser reader-reflow-restoration.smoke.spec.ts --grep FSF-VF-0074` | Exit 0; 2 passed |
| `pnpm.cmd format:check:typescript` | PASS |
| `pnpm.cmd lint:typescript` | PASS |
| `pnpm.cmd typecheck:typescript` | PASS |
| `pnpm.cmd check:evidence` | PASS, as recorded in the follow-up |
| `git diff --check` | PASS, as recorded in the follow-up |

The browser and TypeScript logs are included in the verified manifest. The configured browser command builds the application before testing; desktop type checking includes the changed browser file. Retained output contains color-environment and bundle-size warnings, without a failed GREEN check.

No historical passing suite or prior review is reused as current acceptance. The focused browser checks and current static checks are sufficient for this bounded test-only correction. Renewing the unchanged production installer/lifecycle is not required by this patch.

The archived Windows run records 102 passing browser cases and the single BNC-01 failure after successful pinned NSIS preparation. It establishes the trigger, not a passing full run for the new candidate.

## Findings

None.

## Remaining uncertainty

The corrected candidate has not yet completed replacement remote CI. This approval does not establish that all PR jobs are green or that later native Windows steps passed.

Browser narration uses synthetic service/audio controls. These checks do not establish physical audibility, live model generation, GPU behavior, live downloads or new packaged-artifact acceptance.

The earlier selection omitted BNC-01; the reason for that review omission remains unknown. The documentation preserves that distinction.

## Required next action

Persist this report unchanged at the reserved report path, perform the required closeout checks, and confirm the frozen identities plus only the reserved terminal additions before any authorized Git handoff.

After the authorized push, inspect replacement CI results before declaring PR #325 green. A new failure requires fresh diagnosis.

This approval satisfies the independent change-review gate for the identified candidate. It is not a Validation Report or authorization to commit, push or merge.
