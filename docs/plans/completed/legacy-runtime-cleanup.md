# Retire inactive Chatterbox repair and unused preference metadata

## Goal

Implement the two accepted residual-code findings without changing current
language preferences or Chatterbox v3 behavior.

## User-visible outcome

The application keeps its existing behavior. Only the obsolete v2 migration
and repair implementation and one unused preference limit are removed.

## Current state

The clean checkout starts at `dbfb6799583ed564bce6ebd13e9e2bdb61542f87` on
`codex/cleanup-temporary-artifacts`. The user requested implementation of the
reviewed suggestions. This scope does not request another commit or push;
leave the reviewed patch unstaged for the user.

## Scope and non-goals

- LANG-LIMIT: delete only `maximumEnvelopeUtf16CodeUnits` from
  `NARRATION_LANGUAGE_PREFERENCE_V1`.
- LEGACY-REPAIR: remove the inactive v2 migration/repair helpers and call sites
  in `tts_optional_chatterbox.rs`; replace the obsolete success test with a
  v3 installed-runtime cache-cleanup test preserving `.nbc` and `.nbi` coverage.
- Preserve V1 preference key/schema migration, V2 bounds, historical Chatterbox
  manifest validation and its `GENERATED_RUNTIME_FILES`, retained-root removal
  and rejection tests, generated sources, assets, evidence, and completed plans.
- No dependency, public contract, inference, profile admission, or UI change.

## Relevant files and documentation

- `apps/desktop/src/persistence/narration-language-preference.ts` and its tests.
- `apps/desktop/src-tauri/src/tts_optional_chatterbox.rs` and inline tests.
- `AGENTS.md`, `.agents/PLANS.md`, `docs/README.md`, product MVP requirements,
  `docs/architecture/overview.md`, and the canonical system diagram.
- ADR-0052, existing test scripts, and both safe-refactor skills/contracts.

## Architecture and constraints

ADR-0052 admits only v3 with no runtime correction. Old v2 installations are
cleanup-only, never an execution or migration fallback. Preserve containment,
runtime locks, receipt invalidation, current cache cleanup, verification,
promotion, errors, and removal ownership. Local inference, privacy, audio
non-persistence, cancellation, and memory constraints are unchanged.
The system diagram remains accurate; no architectural update is required.

## Milestones

1. Complete: establish independent host baselines for both clean target files.
2. Complete: implement and independently validate LANG-LIMIT.
3. Complete: implement and independently validate LEGACY-REPAIR.
4. Complete: run portable/native closeout, review scope, and archive this plan.

## Testing and benchmark strategy

All acceptance commands run outside the sandbox in local PowerShell, with
the pinned Corepack pnpm shim. LANG-LIMIT uses `pnpm.cmd build:packages`,
`pnpm.cmd --filter @voxleaf/desktop typecheck`,
`pnpm.cmd --filter @voxleaf/desktop test`, `pnpm.cmd format:check:typescript`,
and `pnpm.cmd lint:typescript` before and after editing.
LEGACY-REPAIR uses `pnpm.cmd format:check:rust`, `pnpm.cmd lint:rust`,
`pnpm.cmd test:rust`, and `pnpm.cmd --filter @voxleaf/desktop tauri build`
before and after editing. Final gates are `pnpm.cmd check:portable` and
`pnpm.cmd check`. Review `git diff --check` and immutable source identities.
Unix-only symlink tests cannot establish Windows execution evidence and vice
versa; report platform limits explicitly. No new model/GPU or installed-app
execution claim is made from compilation or model-free tests.

## Risks and rollback

The obsolete test also protects live cache cleanup: migrate those assertions
before removing it. Keep historical correction validation separate from
inactive runtime repair. Preserve unrelated work; any rollback must affect
only this patch and requires an explicit decision.

## Progress log

- 2026-10-07: Accepted audit packets RES-LANGUAGE-LEGACY-LIMIT and
  RES-CHATTERBOX-LEGACY-REPAIR; confirmed source paths clean and index empty.
- 2026-10-07: Both independent host baselines passed at the initial HEAD.
  Reports: `RES-LANGUAGE-LEGACY-LIMIT-BASELINE-20261007-01` and
  `RES-CHATTERBOX-LEGACY-REPAIR-BASELINE-20261007-01`.
- 2026-10-07: LANG-LIMIT implemented as one deleted property; independent
  `RES-LANGUAGE-LEGACY-LIMIT-POST-20261007-01` passed all five host gates.
- 2026-10-07: LEGACY-REPAIR removed four inactive helpers and both repair call
  sites; replaced the old test with a v3 cache-cleanup and verification case.
  Independent `RES-CHATTERBOX-LEGACY-REPAIR-POST-20261007-01` passed all four
  host gates with unchanged 82/83 Rust counts.
- 2026-10-07: `RES-LEGACY-CAMPAIGN-FINAL-20261007-01` passed portable and native
  repository closeout with source identities matching both post-change reports.
  Archived this plan; all changes remain unstaged and no Git mutation was made.

## Discoveries and decisions

- Test-only EPUB source adapters were audited SKIP and remain unchanged.
- `GENERATED_RUNTIME_FILES` still supports historical authority validation;
  it is not exclusive to the removed repair implementation.
- Reuse one worker and independent validator; no concurrent source writing
  or Git mutation. Keep the index empty throughout this implementation.

## Final validation results

Baseline and post-change commands named above all exited 0 in normal Windows
PowerShell outside the sandbox. Desktop tests: 587 Vitest and 38 Node. Native
tests: 82 default and 83 release-locked-runtime. Native Tauri builds pass.
Both post-change reports passed identity, scope, invariant, test-integrity,
privacy, and empty-index checks at the unchanged initial HEAD.
The source patch totals two files, six insertions and 200 deletions.
Immutable reports and command logs are local ignored evidence under
`tmp/legacy-runtime-cleanup/`.

Final independent host commands all exited 0:

- `pnpm.cmd check:portable`
- `pnpm.cmd check`
- `git diff --check`

Final counts: shared 209, EPUB 643, desktop 587 Vitest plus 38 Node, Python 402,
Rust 82 default plus 83 release-locked-runtime. TypeScript/Python/Rust format,
lint, types, tests, native release compilation and Python builds passed as
configured. The index stayed empty and both source identities and HEAD remained
unchanged throughout validation.

Existing pytest cache permission, Vite `::highlight` minifier and large-chunk
warnings remain. Windows execution does not validate Unix-only symlink tests.
No packaged-app execution, installer journey, GPU/model inference, or hardware
performance claim is made; native compilation is build evidence only.
