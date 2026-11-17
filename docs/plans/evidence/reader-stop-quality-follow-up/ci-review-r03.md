# Change Review Report

Review ID: PR325-CI-CR-R03-20261116

Task ID: PR325-CI-R03

Verdict: **APPROVE**

Base commit and reviewed HEAD: `7ae2c940faae245a632ca26329ec0e39fef44244`

Branch: `codex/revalidated-findings-execplan`

## Reviewed paths and identities

Inherited the complete closed set of 1,873 paths from `tmp/evidence/pr325-ci/inputs-r03.json`, record `PR325-CI-INPUTS-R03-20261116`.

Manifest SHA-256: `1aca5af5fa99f95c01178537f66cf49d807f99707ed16d0a080f49510893dab7`

Tracked patch: `tmp/evidence/pr325-ci/candidate-r03.patch`

Patch SHA-256: `51f9a323357bc9a0b3ca078ca6662c537f8ef1bb51e00065305836a2e04518b4`

Explicit manifest delta: none. No previous approval is inherited.

The four candidate paths are:

- `services/tts/tests/test_benchmark_quality.py`
- `docs/development/findings/registry.md`
- `docs/plans/completed/README.md`
- `docs/plans/evidence/reader-stop-quality-follow-up/ci-symlink-follow-up.md`

I inspected the complete patch and new follow-up document, the affected fixture and assertions, neighboring modeled-link and real-process controls, `quality_operation`, its correction caller, ADR-0077, the retained alternative-evidence strategy and supplied execution logs.

## Identity recheck

**PASS.** Independent read-only reconstruction before and after review matched all 1,873 path memberships, porcelain statuses, SHA-256 values and filter-aware blob identities. The candidate paths matched the actual tracked/untracked changes, without duplicate manifest entries. The archived patch matched the current binary Git diff.

Base, HEAD and branch remained unchanged; the index remained empty. Both reserved outputs remained absent:

- `docs/plans/evidence/reader-stop-quality-follow-up/ci-review-r03.md`
- `docs/plans/evidence/reader-stop-quality-follow-up/ci-closeout-r03.md`

This reviewer performed no tests, builds, formatters, edits, delegation or Git mutations.

## Acceptance review

The retained Windows failure demonstrates the specific portability problem. Both native variants created their symlinks and reached the expected `tts-benchmark-quality:session-lock` rejection. They then failed because `readlink()` returned the Windows extended-length representation while the test compared it with the ordinary target spelling. The log shows `is_symlink()` was true in both cases. Assertions following that failure were not reached and cannot be credited from that run.

The correction captures `marker.readlink()` immediately after successful fixture creation, before invoking the production operation. Comparing the later readback with that independent baseline directly checks that the link destination remains unchanged. It does not normalize away a modification or derive the expected value after the operation.

The test retains both absent-target and existing-target variants, the exact error assertion, link existence/type, complete session-byte comparison, target absence or preserved target bytes, and successful sequential retry after the fixture owner removes its unsafe link. The native privilege skip condition is unchanged.

Inspection of the unchanged owner remains consistent with these assertions: first creation uses `O_CREAT | O_EXCL`; opening an existing entry omits creation and truncation; descriptor/path, regular-file, reparse, size and link-count checks precede lock acquisition and mutable session work. The correction caller acquires ownership before correction validation and publication.

The freshly executed alternatives still cover modeled link resolution with real target I/O, native hardlinks, descriptor/path mismatch, process contention, owner termination and sequential recovery. They support this bounded assertion correction but do not establish native symlink success.

No production implementation, workflow, timeout, retry, skip policy or frozen result changes. The documentation accurately preserves the distinction between the observed native failure, local skips and the required replacement CI outcome.

## Test evidence reviewed

Results below are attributed to the coordinator’s normal local PowerShell 7.6.9 execution outside the sandbox, with uv 0.11.29, Python 3.12.10 and the existing locked environment.

| Command | Attributed result |
| --- | --- |
| `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -k test_vf0082_rejects_existing_lock_link_without_creating_or_changing_its_target -q -rs` before editing | Exit 0; 2 skipped, 66 deselected; native setup unavailable under WinError 1314 |
| `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -q -rs -p no:cacheprovider` after editing | Exit 0; 66 passed, the same 2 native cases skipped |
| `pnpm.cmd format:check:python` | PASS; 199 files already formatted |
| `pnpm.cmd lint:python` | PASS |
| `pnpm.cmd typecheck:python` | PASS; 195 source files |
| `pnpm.cmd check:evidence` | PASS, as recorded in the follow-up |
| `git diff --check` | PASS, as recorded in the follow-up |

The baseline cache-permission warning is retained. Disabling pytest’s optional cache in the subsequent run does not alter the test assertions or native admission condition.

The archived Windows run supplies the actual failing assertion: 1,232 Python tests passed and two failed. Its browser and packaged WebView2 results belong to that preceding CI revision. None is reused as current acceptance, and the failed Python run is not represented as passing.

The current local suite and static checks, together with the concrete native failure and independently inspected before/after comparison, are sufficient to approve this test-only correction. They are not sufficient to declare the two native cases or the PR complete.

## Findings

None.

## Remaining uncertainty

The corrected native symlink cases have not executed successfully on this local host. Both remain explicitly skipped because fixture creation lacks the required privilege. No local native RED or GREEN is claimed.

Replacement Windows CI must execute both variants through their target/session-integrity and retry assertions. That outcome, and the remaining configured PR jobs, remains pending.

No new runtime package, lifecycle, model, acoustic, GPU or live-download acceptance is established by this review.

## Required next action

Persist this report unchanged, complete the reserved closeout and document checks, and recheck the frozen identities plus only the reserved terminal additions before the authorized Git handoff.

After pushing through the existing authorized workflow, inspect replacement CI. Require both native symlink variants to pass without skipping, and all required jobs to succeed, before declaring the PR complete. A further failure requires fresh diagnosis.

This approval satisfies the independent review gate for the identified test correction. It is not a Validation Report or authorization to commit, push or merge.
