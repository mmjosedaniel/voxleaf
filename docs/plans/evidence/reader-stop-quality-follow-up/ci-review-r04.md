# Change Review Report

Review ID: PR325-CI-CR-R04-20261116

Task ID: PR325-CI-R04

Verdict: **APPROVE**

Base commit and reviewed HEAD: `8edc35e12a8cbbb54574338f3ba92f7fb577cf23`

Branch: `codex/revalidated-findings-execplan`

## Reviewed paths and identities

Inherited the complete closed set of 1,878 paths from `tmp/evidence/pr325-ci/inputs-r04.json`, record `PR325-CI-INPUTS-R04-20261116`.

Manifest SHA-256: `17fd7d55bbe0145000ae726a6a6a5dff9d17a47d3b114432ab919973673a3a56`

Tracked patch: `tmp/evidence/pr325-ci/candidate-r04.patch`

Patch SHA-256: `a7b1ac2bf0aff69f5db1d57d1bf8423e20ead8bdad6b4db021d246c4b0684d56`

Explicit manifest delta: none. No previous approval is inherited.

The six candidate paths are:

- `services/tts/benchmarks/quality_operation.py`
- `services/tts/tests/test_benchmark_quality.py`
- `benchmarks/tts/README.md`
- `docs/development/findings/registry.md`
- `docs/plans/completed/README.md`
- `docs/plans/evidence/reader-stop-quality-follow-up/ci-lock-preflight-follow-up.md`

Inspection covered the complete patch and new document, the owner and its five callers, native and modeled link tests, process contention and recovery controls, CLI error translation, ADR-0077, packaging scope and supplied execution evidence.

## Identity recheck

**PASS.** Independent read-only reconstruction before and after review matched all 1,878 path memberships, porcelain statuses, SHA-256 values and filter-aware blob identities. The candidate list matched the actual tracked/untracked changes, without duplicate manifest entries. The archived patch matched the current binary Git diff.

Base, HEAD and branch remained unchanged; the index remained empty. Both reserved outputs remained absent:

- `docs/plans/evidence/reader-stop-quality-follow-up/ci-review-r04.md`
- `docs/plans/evidence/reader-stop-quality-follow-up/ci-closeout-r04.md`

This reviewer performed no tests, builds, formatters, edits, delegation or Git mutations.

## Acceptance review

The retained native failure establishes a real owner defect. With a preexisting dangling coordination symlink, the operation rejected admission but had already created the unrelated referent. The preceding path-spelling assertion had concealed this later integrity failure. The existing-target variant passing does not negate the absent-target failure.

The correction places `lstat()` before any potentially creating open. A preexisting nonregular entry or reparse point now raises `session-lock` before a descriptor is opened or mutable session work begins. An inspection error also fails closed. This directly addresses the observed existing-entry trigger.

Ordinary paths retain exclusive first creation and a noncreating, nontruncating fallback. The existing post-open regular/reparse, size, link-count and descriptor/path identity checks remain. The nonblocking OS lock, retained empty sibling and descriptor closure are unchanged. Two legitimate contenders can still converge on the same regular coordination file and compete through the OS lock.

All five callers retain ownership around their mutable work: submission, correction, aggregation, cleanup and CPU-fallback derivation. The patch adds no retry loop, waiting queue, background activity, persisted payload or new error envelope. CLI translation remains content-free.

The revised modeled test removes the assumption that previously hid the failure. Its opening seam delegates to real target `os.open` for the supplied flags; it no longer manufactures `FileExistsError` for exclusive creation. Against the previous owner, the retained RED creates the absent target and records two opens for the existing-target case. Against the correction, both variants require no unsafe open, unchanged coordination-entry and session bytes, and preserved target content or absence.

Native fixtures retain exact rejection, pre/post link identity, session integrity, target integrity and safe-retry assertions. Neighboring controls retain real hardlinks, descriptor/path mismatch, nonempty-file rejection, subprocess contention, immutable correction, aggregation, owner termination and sequential cleanup/retry.

The correction preserves ADR-0077’s operating boundary. It does not establish atomic protection against hostile namespace replacement between inspection and opening; that workflow was already excluded. No broader guarantee is needed to fix the demonstrated preexisting-entry case.

The maintained documentation accurately reopens the unsafe-entry subcase, identifies the prior model’s incorrect assumption, preserves historical reports and requires native CI confirmation. The modified owner belongs to maintainer benchmarks; the supplied wheel inspection reports no benchmarks package. No Windows packaging input changes.

## Test evidence reviewed

Results are attributed to the coordinator’s normal local PowerShell execution outside the sandbox, with uv 0.11.29, Python 3.12.10, Node 24.18.0 and pnpm 11.15.1.

| Command | Attributed result |
| --- | --- |
| `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -k test_vf0082_modeled_lock_link_preserves_real_target_and_session -q -p no:cacheprovider` before owner edit | Exit 1; both variants failed, including actual absent-target creation |
| `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -q -rs -p no:cacheprovider` after correction | Exit 0; 66 passed, 2 native symlink cases skipped |
| `pnpm.cmd format:check:python` | PASS; 199 files already formatted |
| `pnpm.cmd lint:python` | PASS |
| `pnpm.cmd typecheck:python` | PASS; 195 source files |
| `pnpm.cmd build:python` | PASS; source distribution and wheel built |
| Runtime wheel scope inspection | Reports no benchmarks package |
| `pnpm.cmd check:evidence` | PASS, as recorded in the follow-up |
| `git diff --check` | PASS, as recorded in the follow-up |

The local skips remain WinError 1314 during native fixture creation. They are not native PASS.

The archived Windows run records 1,233 Python passes and one absent-target failure. That failed run supplies the concrete trigger; it is not current passing evidence. Earlier browser, native startup, package and review outcomes are not reused as current behavioral acceptance.

The discriminating local RED, current passing controls, unchanged native assertions and inspected owner path support approval of this bounded correction. They do not close native Windows acceptance or the overall CI task.

## Findings

None.

## Remaining uncertainty

Both corrected native symlink variants still require successful execution without skips on the configured Windows CI host. Local controlled resolution exercises the observed failure mechanism with real target I/O, but does not replace that pending native result.

No current POSIX execution or adversarial namespace-replacement guarantee is claimed. No new Windows installer/lifecycle, GPU, acoustic, model or live-download acceptance is established.

## Required next action

Persist this report unchanged, complete the reserved closeout checks, and verify the frozen identities plus only the reserved terminal additions before the authorized Git handoff.

After the authorized push, require both native symlink variants to pass without skipping and all configured PR jobs to succeed before declaring the task complete. Any further failure requires fresh diagnosis.

This approval satisfies the independent change-review gate for the identified correction. It is not a Validation Report or authorization to commit, push or merge.
