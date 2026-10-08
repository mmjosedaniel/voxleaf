# Remove unused UI declarations and the retired narration bridge

## Goal

Remove the confirmed residual code identified by the current-checkout review,
without changing public behavior or reducing lifecycle coverage.

## User-visible outcome

Reading, language selection, and narration remain unchanged. Maintainers have
fewer unused declarations and tests exercise the supported public preparation API.

## Current state

The campaign starts at `24c68b528d1a14ffc4d04cabb5446a40f2f21d40` on
`codex/cleanup-temporary-artifacts`, with an empty index and clean worktree.
The user authorized implementing the preceding suggestions and local commits.
This continues that branch; no main update, replacement branch, push, or PR is needed.

## Scope and non-goals

- RES-UI: unused `.shell-header-reader` and `.close-publication` CSS families,
  and the unreferenced `NARRATION_LANGUAGES_V1` option list.
- RES-EPUB: package-internal `prepareOpenedPublicationNarrationSource` bridge,
  its exclusive implementation, and migration of its lifecycle tests to
  `OpenedPublication.prepareNarration`.
- Excluded: deliberately disabled `AdaptiveBoundaryWaitCoordinator`, live V1
  language types/defaults/validators, frozen authorities, generated sources,
  historical plans, public contracts, model integrations, dependencies, and
  unrelated cleanup.

## Relevant files and documentation

Targets are `apps/desktop/src/styles.css`,
`apps/desktop/src/tts/narration-language.ts`,
`packages/epub/src/resource/opened-publication.ts`, and its adjacent test.
Read `docs/README.md`, product MVP requirements, the canonical system diagram,
architecture overview, ADR-0012, the completed M005 plan, roadmap M005 status,
testing strategy, and both safe-refactor skills and reference contracts.

## Architecture and constraints

M005 is complete. Public `prepareNarration` owns bounded, cancellable preparation.
Preserve one active narration operation independently of raster reads, close
cancellation and waiting, idempotent archive release, retry after cancellation,
content-free failure results, stable locator ranges, and all preparation bounds.
Preserve active CSS selectors and public exports. The canonical system diagram
still describes the implemented architecture and needs no update.

## Milestones

1. Complete: audit the two units independently and establish host baselines.
2. Complete: approve, implement, independently validate, and commit RES-UI.
3. Complete: approve, implement, independently validate, and commit RES-EPUB.
4. Complete: run cross-package and final repository gates, record evidence,
   and archive this plan for the separate documentation commit.

## Testing and benchmark strategy

Use existing package build, typecheck, and test scripts for each baseline and
post-change validation. Include `pnpm.cmd test:browser` for desktop CSS removal.
The cross-package closeout uses `pnpm.cmd check:portable` and `pnpm.cmd check`,
which include TypeScript format, lint, typechecks, tests, and builds.
All acceptance commands run in normal local PowerShell outside the sandbox,
with the pinned Corepack pnpm shim. No model or audio runtime path changes;
no exact-host inference benchmark is required.
Each source commit is bound to an immutable independent validation report,
HEAD, exact allowlisted path hashes and expected index blobs.

## Risks and rollback

Dynamic CSS construction could hide a consumer; audit component and script
references before removing selectors. Migrating a test could weaken assertions;
preserve each observable lifecycle guarantee through the public API. Revert only
the corresponding new commit if rollback becomes necessary, with authorization.

## Progress log

- 2026-10-07: Confirmed clean initial state, read governing documentation, and
  requested independent audit packets for both units.
- 2026-10-07: RES-UI audit CHANGE; independent host baseline and post-change
  PASS (`RES-UI-BASELINE-20261007-01`, `RES-UI-POST-20261007-01`). Removed 108
  lines in the two approved files. Commit
  `91fb1046724758ad223f049d16b30c58b156c70e`.
- 2026-10-07: RES-EPUB audit CHANGE; independent host baseline and post-change
  PASS (`RES-EPUB-BASELINE-20261007-01`, `RES-EPUB-POST-20261007-01`). Removed
  the exclusive bridge implementation and migrated six calls in three tests,
  retaining all 643 package tests. Commit
  `e92eadf2ecd508c500fb3da8850565389b7374d7`.
- 2026-10-07: Both source commits have empty indexes after exact-path staging,
  staged-diff review, and report-bound identity checks.
- 2026-10-07: Independent final report `RES-CAMPAIGN-FINAL-20261007-01` passed
  both repository gates at `e92eadf2ecd508c500fb3da8850565389b7374d7` with all
  four source path identities unchanged. Archived this completed plan.

## Discoveries and decisions

- Retain the existing user-authorized cleanup branch.
- The disabled boundary-wait coordinator requires a separate product decision
  and is excluded from this cleanup.
- Use one auditor, worker, validator, and Git steward, with only one source
  writer active and no Git mutation during writing or validation.

## Final validation results

Both baseline and post-change runs passed outside the sandbox, using pnpm
11.15.1 through the Corepack shim. Each immutable report records unchanged
HEAD, worktree SHA-256, filtered index blobs, and an empty index before and
after validation. Local reports and command logs are ignored under
`tmp/residual-code-cleanup/`.

RES-UI commands, all exit 0 before and after:

- `pnpm.cmd build:packages`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd --filter @voxleaf/desktop test`: 587 Vitest and 38 Node tests.
- `pnpm.cmd --filter @voxleaf/desktop build`
- `pnpm.cmd format:check:typescript`
- `pnpm.cmd lint:typescript`
- `pnpm.cmd test:browser`: 7 Playwright tests.

RES-EPUB commands, all exit 0 before and after:

- `pnpm.cmd build:packages`
- `pnpm.cmd --filter @voxleaf/epub typecheck`
- `pnpm.cmd --filter @voxleaf/epub test`: 33 files / 643 tests.
- `pnpm.cmd format:check:typescript`
- `pnpm.cmd lint:typescript`

Final independent host validation (`RES-CAMPAIGN-FINAL-20261007-01`), all exit 0:

- `pnpm.cmd check:portable`: format, lint, types, tests, portable and Python builds.
- `pnpm.cmd check`: full configured format, lint, types, tests, native Tauri
  release compilation, and Python distribution builds.
- `git diff --check`
- `git diff --check 24c68b528d1a14ffc4d04cabb5446a40f2f21d40..HEAD`

Final test counts: shared 209, EPUB 643, desktop 587 Vitest plus 38 Node,
Python 402, and Rust 82 default plus 83 release-locked-runtime tests.
The complete source diff contains four files, 62 insertions and 204 deletions.
The seven browser tests were not repeated after the EPUB-only change.

Existing pytest cache nodeids permission, CSS `::highlight` minifier, and
large-chunk build warnings remain; all commands still exit 0. No exact-host
model inference, packaged WebView2 execution, installer journey, hardware
performance, or exhaustive pixel-equivalence claim is made. Native release
compilation is build evidence, not execution of the application.
