# TypeScript maintainability batch — 2026-08-03

## Goal

Recover durable repository traceability for the small cross-package
maintainability batch on `codex/refactor-shared-src-20260803`, independently
review its three already-created commits, and close the branch only after the
applicable repository and packaged-application gates pass.

This is a recovery ExecPlan. The source commits predate this file, and no
committed Audit Packet or frozen Approved Work Order was found. This plan does
not invent those missing historical artifacts; it records the exact observed
scope, invariants, findings, and new independent validation.

## User-visible outcome

There is no intended product change. Chatterbox failure messages, BookV1 spine
validation, and fake-TTS request state remain observably unchanged. The batch
reduces nested renderer control flow, removes a redundant spine-index set, and
stops the fake TTS source from retaining settled requests.

## Current state

The branch contains three commits over `main`:

1. `e8b5e8d` extracts exhaustive optional-Chatterbox failure rendering.
2. `62620e6` removes spine-index tracking made redundant by the required
   `item.index === arrayIndex` invariant.
3. `34d33e3` replaces retained fake-TTS request objects with a bounded pending
   counter and adds settlement assertions.

The branch initially changed four TypeScript/TSX files and no documentation.
Independent pre-push validation found one deterministic Rust failure in code
identical to `main`; that M011 defect is tracked separately in the active M011
ExecPlan and must be fixed before this batch can pass the complete gate.

## Scope and non-goals

In scope:

- review the exact four-file TypeScript/TSX diff;
- preserve public contracts and rendered failure copy;
- verify cancellation and settlement counting in the fake TTS source;
- audit documentation from the current branch and the three preceding local
  branches;
- run focused, browser, complete repository, Windows package, lifecycle, and
  installed-start validation required by the observed risks.

Out of scope:

- changing EPUB, BookV1, narration, TTS protocol, or optional-package public
  contracts;
- changing dependencies or generated sources;
- extending Chatterbox availability or release claims;
- reconstructing conversational Audit Packets or work orders that were not
  durably recorded when the commits were created;
- publishing, pushing, or opening a pull request.

## Relevant files and documentation

- `apps/desktop/src/tts/OptionalChatterboxControls.tsx`
- `packages/shared/src/contracts/book.ts`
- `packages/shared/src/testing/fake-tts-source.ts`
- `packages/shared/src/testing/fake-tts-source.test.ts`
- `docs/development/agentic-refactoring.md`
- `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md`
- `.agents/skills/validate-safe-refactor/references/validation-matrix.md`
- `docs/plans/active/M011-package-validate-and-release-mvp.md`

## Architecture and constraints

- EPUB content remains local and no test may log or commit book text.
- TTS inference and generated-audio ownership do not change.
- Cancellation-requested fake work remains pending until its configured late
  completion; acknowledged cancellation and completed work settle exactly once.
- BookV1 still rejects duplicate spine IDs and every index that differs from
  its array position.
- Optional-Chatterbox failure text, accessibility roles, and closed failure
  taxonomy remain unchanged.
- No system-diagram update is required because no process, package, trust,
  persistence, or runtime-flow boundary changes.

## Milestones

### Milestone 1: Recover and audit documentation lineage

#### Work

- Identify the three branches visited immediately before the current branch.
- Compare their implementation scope with their documentation changes.
- Record any missing or stale authority without rewriting completed plans.

#### Validation

- `git reflog --date=iso --pretty='%h %gd %cd %gs' -n 40`
- Exact branch diffs against their merge bases.

#### Status

Complete. The three preceding branches all include proportional documentation;
the missing durable batch record is limited to the current branch.

### Milestone 2: Independently review the three change units

#### Work

- Inspect changed production code, tests, and direct public contracts.
- Confirm the diff contains no dependency, generated-source, test weakening,
  private artifact, or architecture drift.
- Resolve the unrelated M011 Rust baseline failure in its owning active plan.

#### Validation

- `pnpm.cmd --filter @voxleaf/shared typecheck`
- `pnpm.cmd --filter @voxleaf/shared test`
- `pnpm.cmd build:packages`
- `pnpm.cmd --filter @voxleaf/desktop typecheck`
- `pnpm.cmd --filter @voxleaf/desktop test`
- `pnpm.cmd test:browser`

#### Status

Complete. The three original units preserve their documented behavior, and the
independently discovered M011 baseline defect is corrected in its owning Rust
module with focused regression coverage.

### Milestone 3: Close repository and installed-package validation

#### Work

- Run the complete native Windows gate outside the managed sandbox.
- Rebuild and verify the unsigned local installer after the Rust correction.
- Exercise install, first start, repair, uninstall, reinstall, and visible
  installed-app startup without changing public-release claims.

#### Validation

- `pnpm.cmd check`
- `pnpm.cmd package:windows`
- `pnpm.cmd package:windows:check`
- `pnpm.cmd package:piper-core:check`
- `pnpm.cmd package:windows:lifecycle`

#### Status

Complete. Repository, browser, package, lifecycle, reinstall, and visible
installed-start gates passed outside the managed sandbox.

## Testing and benchmark strategy

All acceptance commands run in normal local PowerShell outside the managed
sandbox. Deterministic package tests run before the complete repository gate.
The renderer change adds the browser gate. The Rust cleanup correction adds the
native test gate and requires a rebuilt Windows package because it changes the
installed executable. No GPU/model benchmark is required: neither the original
batch nor the correction changes model execution, profile selection, buffering,
or exact-host TTS behavior.

## Risks and rollback

- A false behavior-preserving claim could hide failure-copy or contract drift;
  direct tests and exact diff review guard it.
- Counter-based fake-request tracking could underflow if one request settles
  twice; request terminal-state guards and pending-count assertions cover both
  cancellation behaviors.
- The unrelated Rust correction could broaden cleanup; it is restricted to the
  exact application-owned Chatterbox staging root and existing containment
  checks.
- If a required gate fails, keep this plan active and report the exact blocker;
  do not weaken tests or rewrite historical authority.

## Progress log

- **2026-08-03:** Identified the current three-commit diff and the preceding
  `codex/add-safe-refactor-agents`,
  `codex/m011-m6-clean-host-release-matrix`, and
  `codex/m011-m5-windows-package-signing` branches. Their documentation is
  proportional and includes workflow guidance, ADRs, active-plan evidence,
  roadmap/status updates, testing/setup guidance, and Windows user guidance as
  applicable.
- **2026-08-03:** Confirmed the current branch had no durable ExecPlan, Audit
  Packet, or Approved Work Order. Created this recovery record rather than
  fabricating historical approvals.
- **2026-08-03:** Static review found no public-contract, architecture,
  dependency, generated-source, privacy, cancellation, or prohibited-artifact
  drift in the four-file TypeScript/TSX diff.
- **2026-08-03:** Reproduced the pre-existing default-feature Rust failure:
  `pnpm.cmd test:rust` reported 70 passed and one failed because an explicit
  withheld Chatterbox selection did not remove stale application-owned staging.
  Kept `snapshot_at` read-only and moved the existing bounded cleanup into
  `select_at` under the installed-runtime lock. Split the regression coverage
  so snapshot immutability and explicit-selection cleanup are both asserted.
- **2026-08-03:** Closed focused, complete, browser, package, lifecycle, and
  installed visual validation. Regenerated the checked-in package-evidence
  receipt for the exact rebuilt artifact and moved this completed recovery plan
  out of the active queue.

## Discoveries and decisions

- **Discovery:** The repository already documents the prior three branches;
  the traceability gap was the current cross-package refactor batch.
- **Decision:** Future multi-unit or multi-package refactor campaigns must keep
  content-safe work-order and validation summaries in their active ExecPlan;
  chat history is not durable repository authority.
- **Decision:** The system diagram remains unchanged because both the original
  batch and the M011 correction preserve component and runtime topology.

## Final validation results

All acceptance commands below ran from normal local PowerShell outside the
managed sandbox:

- `pnpm.cmd test:rust`: 72 passed after the correction.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
  tts_optional_chatterbox`: 20 passed with default features.
- `cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml --features
  chatterbox-acquisition-validation tts_optional_chatterbox`: 20 passed with
  validation-build features.
- `pnpm.cmd package:windows:chatterbox-validation:check`: passed.
- `pnpm.cmd check`: passed formatting, lint, type, test, Rust/Python, desktop,
  shared, EPUB, and release-build gates. The test totals were shared 209, EPUB
  580, desktop 532 plus 17 Node tests, Rust 72, and Python 384. Existing
  non-failing lightningcss, chunk-size, and pytest-cache warnings remain.
- `pnpm.cmd test:browser`: 6 passed.
- `pnpm.cmd package:windows`, `pnpm.cmd package:windows:check`, and
  `pnpm.cmd package:piper-core:check`: passed.
- `pnpm.cmd package:windows:lifecycle`: installation, first start,
  same-version repair, uninstall, and unrelated synthetic-file preservation
  passed; application-data removal was not exercised on this development host.
- `node apps/desktop/scripts/windows-release.mjs evidence --installer
  apps/desktop/src-tauri/target/release/bundle/nsis/VoxLeaf_0.1.0_x64-setup.exe
  --binary apps/desktop/src-tauri/target/release/voxleaf-desktop.exe
  --signature-status unsigned-local --antivirus-status not-run
  --lifecycle-status local-install-first-start-repair-uninstall-passed --write`:
  regenerated the checked-in evidence receipt from the exact built artifacts.
- A final reinstall from the exact artifact passed installed-file checks. The
  installed `com.voxleaf.desktop` executable opened one responsive `VoxLeaf`
  window and visibly rendered the expected private local EPUB-reader shell.

The rebuilt unsigned current-user installer is
`VoxLeaf_0.1.0_x64-setup.exe`, `181,685,408` bytes, SHA-256
`355226cfb390ee9e1a080e6ff04d1f8d1232813a2fa495eb3600ab6867284f82`.
The installed application binary is `12,338,688` bytes, SHA-256
`3c45cd7c016681f05cc9154fe6cf698fef928364db4ffa4a65e056d7674840cb`.
The exact installer is unsigned, was not scanned with Defender in this run,
and is not clean-host or public-release acceptance evidence. Those M011 gates
remain open; no SmartScreen or universal-reputation claim is made.
