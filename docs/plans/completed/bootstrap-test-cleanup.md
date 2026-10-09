# Bootstrap test cleanup

## Goal

Retire redundant bootstrap-only EPUB checks while preserving production-boundary
coverage, and make the Python package-import smoke test prove its stated purpose.

## User-visible outcome

No reader, narration, packaging, or public-contract behavior changes. Contributors
maintain fewer obsolete test adapters and a meaningful isolated import check.

## Current state

The user authorized the previously reviewed cleanup and a local commit on
`codex/cleanup-temporary-artifacts`, starting at
`87284dfc6527b9cb2327dde8f8a0f650cf5485a6`. The index and worktree were clean.
The EPUB entry-point suite contains one shared-contract-only case. Two early
dependency probes have separate adapters used only by their tests. The Python
health test currently compares a version constant without checking isolation.

## Scope and non-goals

Audit and implement only those three recommendations. Preserve production EPUB
and TTS implementations, public exports/types, runtime dependencies, generated
files, frozen evaluation authority, historical plans, and tests for distinct
versions or environments. Do not push or create a pull request. Reuse the branch
already requested by the user; no main update or replacement branch is needed.

## Relevant files and documentation

- `packages/epub/src/index.test.ts`
- `packages/epub/src/dependency-probes/` and the current archive/XML tests
- `services/tts/tests/test_health.py` and `services/tts/src/voxleaf_tts/__init__.py`
- `docs/development/testing.md` and `docs/development/dependencies.md`
- `.agents/skills/orchestrate-safe-refactor/` and `validate-safe-refactor/`

## Architecture and constraints

This bounded unit retires bootstrap test scaffolding, not a production pipeline.
Each deleted assertion needs a retained production test or a justified obsolete
probe-only purpose. Keep XML/ZIP privacy, cancellation and bounded-memory checks.
The Python test must run in a fresh interpreter with a bounded timeout and no
models, network, audio, or persistent application state. The canonical system
diagram and production component boundaries remain unchanged.

## Milestones

1. Independent audit and coverage map: complete, CHANGE with one coverage transfer.
2. Host baseline and immutable work order: complete.
3. One implementation worker; independent post-change validation: complete.
4. Required final gates and source commit: complete; evidence archived here.

## Testing and benchmark strategy

Use existing package scripts from normal local PowerShell outside the sandbox.
The draft baseline is `pnpm.cmd build:packages`,
`pnpm.cmd --filter @voxleaf/epub typecheck`,
`pnpm.cmd --filter @voxleaf/epub test`, `pnpm.cmd typecheck:python`, and
`pnpm.cmd test:python`. The independent validator freezes the exact scope after
audit. Post-change repeats the baseline; `pnpm.cmd check:portable` and
`pnpm.cmd check` provide package/final acceptance, including formatting, lint,
types, tests, and builds. No model or browser behavior is changed, so new
hardware measurements and browser-specific acceptance are not proposed.

## Risks and rollback

Deleting a probe can accidentally remove a unique safety regression. Require an
assertion-to-retained-test map and preserve any uncovered useful scenario.
Reject unrelated baseline fixes. Before commit, reversibility is limited to the
worker's exact patch; after commit, use an explicitly authorized revert.

## Progress log

- 2026-10-07: Confirmed clean branch, read workflow and architecture context,
  and delegated the read-only audit. No implementation has started.
- 2026-10-07: Accepted TEST-CLEANUP audit. The five bootstrap dependency-probe
  files have no external source consumer. Requested host baseline before edits.
- 2026-10-07: Accepted `TEST-CLEANUP-BASELINE-20261007-01` PASS at the starting
  HEAD with clean source paths and unchanged before/after identities. Froze the
  ten-file, 700-line work order and delegated the sole implementation worker.
- 2026-10-07: Worker retired five probe files and the shared-only index case,
  transferred incremental XML success to the real reader, strengthened Python
  import isolation, and updated current testing/dependency documentation.
- 2026-10-07: Accepted `TEST-CLEANUP-POST-20261007-01` PASS with unchanged
  before/after identities, followed by `TEST-CLEANUP-GIT-01` PASS. Source commit:
  `d3b355e5c3a56ab1956b608a2f334b3c1990d2ba`. Archived this plan; evidence-only
  documentation receives its own validation and commit without rerunning
  unaffected runtime gates.

## Discoveries and decisions

- Identical text does not make version-specific or environment-specific tests
  redundant; those tests remain out of scope.
- Use the independent refactor validator rather than an additional change
  reviewer, as required by the repository's refactor workflow.
- Preserve the XML probe's useful incremental-success property in the real
  `xml-event-reader.test.ts`: cross the 64-KiB write boundary inside an entity,
  then assert expanded names, complete decoded text, and byte accounting.
- Retained archive inventory/reader tests cover in-memory decompression,
  counts/accounting, no network/workers, CRC privacy, overlapping/appended ZIP
  data, and cancellation. Retained XML tests cover namespaces, entities, no DOM,
  external-resolution rejection, privacy, and cancellation.
- The removed EPUB index case only calls shared decoders; shared book/locator
  suites retain identity and no-page-number assertions. Keep EPUB export/types.
- The Python replacement must use a fresh bounded interpreter so collection-time
  imports cannot mask eager runtime loading; retain the version assertion.
- Also update the current dependency-document prose about executable probes and
  error wrappers; historical selection provenance remains unchanged.

## Final validation results

Baseline `TEST-CLEANUP-BASELINE-20261007-01` passed outside the sandbox:

- `pnpm.cmd build:packages`: pass.
- `pnpm.cmd --filter @voxleaf/epub typecheck`: pass.
- `pnpm.cmd --filter @voxleaf/epub test`: 35 files, 653 tests pass.
- `pnpm.cmd --filter @voxleaf/shared test`: 20 files, 209 tests pass;
  17 generated contract files verified.
- `pnpm.cmd typecheck:python`: 159 files pass.
- `pnpm.cmd test:python`: 402 tests pass. Existing pytest cache-write permission
  warning does not fail tests.
- `git diff --check`: pass; index empty; path identities and HEAD unchanged.

Host commands used the existing Corepack shim to select pinned pnpm 11.15.1;
the default PATH selected 11.19.0.

Post-change `TEST-CLEANUP-POST-20261007-01` passed outside the sandbox at
`87284dfc6527b9cb2327dde8f8a0f650cf5485a6`, before source commit. The exact ten
paths, including the five approved deletions, retained identical status,
SHA-256 and filter-aware blob identities throughout validation. The Git steward
checked those identities again before staging and committing.

- `pnpm.cmd build:packages`: pass.
- `pnpm.cmd --filter @voxleaf/epub typecheck`: pass.
- `pnpm.cmd --filter @voxleaf/epub test`: 33 files, 643 tests pass. Removed ten
  probe cases and one shared-only case; added one production XML case.
- `pnpm.cmd --filter @voxleaf/shared test`: 20 files, 209 tests pass;
  17 generated contract files verified.
- `pnpm.cmd typecheck:python`: 159 files pass.
- `pnpm.cmd test:python`: 402 tests pass.
- `pnpm.cmd check:portable`: pass, including TypeScript/Python formatting,
  lint, types, tests and portable builds.
- `pnpm.cmd check`: pass, including all formatting/lint/type gates, shared
  209, EPUB 643, desktop 587 Vitest plus 38 Node, Python 402, and Rust 82
  default plus 83 release-locked-runtime tests; native release and Python
  distribution builds pass.
- `git diff --check`: pass; index empty throughout validation.
- `git grep -n -e probeXmlDependency -e probeZipDependency -e DependencyProbeError -- packages apps services`:
  no remaining consumers (expected exit 1).

The patch contains 75 insertions and 497 deletions across ten files. Production
runtime, contracts, dependencies, privacy, cancellation, locators, audio and
memory ownership are unchanged. The canonical system diagram remains applicable.
The isolated Python check covers package/runtime-module separation and standard
child-process audit events; it does not claim comprehensive prevention of native,
thread, network or audio side effects. No browser, WebView2, model, GPU or new
performance evidence was required or claimed for these unchanged runtime paths.

Nonfatal baseline pytest cache permissions and existing desktop CSS `::highlight`
and Vite chunk-size advisories remain. No required check failed. Full local
validator reports and logs reside in ignored `tmp/test-cleanup-validation/`;
their results are summarized here without committing ephemeral output.
