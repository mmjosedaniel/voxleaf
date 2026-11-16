# Protect stopped reading progress and evaluator corrections

## Goal

Reopen VF-0074 and VF-0082 under the user's explicit authorization after the
[five-search closeout](../completed/five-search-findings-minimal-corrections.md).
Investigate VF-0074 through the actual mounted delivery and reopening path;
prevent overlapping quality corrections from replacing accepted evidence while
retaining sequential operation. Do not invent a reproduced reader failure.

## User-visible outcome

Stopping narration preserves the last heard checkpoint across automatic layout
changes; deliberate later navigation remains saveable. A maintainer cannot
silently replace an accepted correction by overlapping another command.

## Current state

Branch `codex/revalidated-findings-execplan`, base
`c407cfa45ddb050d1e51ebc2f043fd498fea0393`, clean worktree/index at intake. That
commit contains the 17 previously approved corrections and immutable R01–R04
reviews. Its staging check initially flagged literal two-space Markdown breaks
in authentic reports; exact identity checks and a path-specific whitespace
exception preserved those reports unchanged before the successful commit.

[VF-0074](../../development/findings/registry.md#vf-0074) was inconclusive at intake:
the passive-save predicate accepts the stipulated unmarked sample, but the
prior mounted resize/reopen control did not demonstrate delivery. It captured
its checkpoint after Stop; this investigation also binds the pre-Stop heard
checkpoint. Prior tracker/reflow protection must remain intact.

[VF-0082](../../development/findings/registry.md#vf-0082) was excluded under the
sequential quality contract. The user now authorizes defensive rejection of
overlapping commands, without parallel successful publication. Two corrections
can pass the missing-file check and the replacing writer can lose the first.
VF-0014's sequential invalidation-before-publication/retry fix remains valid.

## Scope and non-goals

- VF-0074: inspect tracker → ReaderPublication → App → save/restore; add a
  mounted pre-Stop checkpoint witness and relevant layout/late-notification
  controls. A product correction requires an actual failing delivery, not a
  direct artificial save. If still unproved, document the exact coverage and
  missing evidence without a speculative persistence change.
- VF-0082: exclusive, bounded admission before aggregate invalidation and
  correction publication. Reject overlap without touching the winner or old
  aggregate. Inspect submission/aggregation consumers for the same ownership
  requirement; preserve failure retry and one immutable correction.
- Synthetic EPUBs, finite processes and disposable roots only. No GPU/model,
  acoustic, live-download, signing or Defender campaigns. No new dependency,
  book text/audio logging, frozen authority/result edits or historical-plan edits.
- The initial existing-change commit was authorized and completed. This follow-up
  is implemented and reviewed separately; no push or PR is authorized.

## Relevant files and documentation

- [MVP](../../product/mvp.md#playback), [synchronization](../../architecture/synchronization-authority-v1.md#heard-progress),
  [overview](../../architecture/overview.md#reading-state-persistence-boundary),
  [canonical diagram](../../architecture/system-diagram.md#privacy-persistence-cancellation-and-bounds).
- Reader owners: `apps/desktop/src/reader/active-visual-locator.ts`,
  `ReaderPublication.tsx`, `apps/desktop/src/App.tsx`,
  `persistence/reader-position-save-coordinator.ts` and narration bridge.
- Quality owners: `services/tts/benchmarks/quality.py`, `quality_cli.py`,
  `cpu_fallback_result.py`; existing quality/CPU-fallback tests.
- [Testing](../../development/testing.md), [service organization](../../development/tts-service-organization.md),
  [findings](../../development/findings/README.md), [independent review](../../development/agentic-change-review.md).

## Architecture and constraints

Keep visible inspection separate from heard persistence and explicit navigation.
No new locator schema, stored content, background worker or product service.
Preserve stale identity rejection, cancellation, coalesced saves and bounds.
Quality ownership must precede destructive invalidation; errors remain fixed and
content-free. Failed admission must not delete another owner's state. Inspect
crash/retry behavior before choosing a lock mechanism.

## Milestones

1. Complete: commit the prior approved candidate with exact path/blob checks.
2. Complete: mounted late-image delivery reproduced VF-0074; real child-process
   publication overlap reproduced VF-0082 before owner changes.
3. Complete: corrections pass the affected component unions and static checks;
   the current Windows package build, check and lifecycle pass. The first
   lifecycle failure remains recorded; only lifecycle/check were repeated.
4. Final candidate: findings, guidance, archival location and indexes prepared.
   Independent acceptance and final identity checks are owned by the linked
   R02 report/closeout; neither archival preparation nor this milestone claims
   a verdict before those records exist.

## Testing and benchmark strategy

All execution runs in local PowerShell outside the sandbox. Reuse existing
fixtures and capture immutable attempts under ignored `tmp/evidence/` with
commands, exit codes and before/after inputs. Record RUN, REUSE with proof,
NOT-APPLICABLE and unresolved evidence separately.

- Python: `uv run --project services/tts --locked pytest services/tts/tests/test_benchmark_quality.py -q --tb=short -p no:cacheprovider`,
  narrowing pre-edit witnesses by test name; the CPU-fallback consumer is covered
  in this existing quality suite (there is no separate CPU-fallback test file).
  Then configured
  `pnpm.cmd format:check:python`, `pnpm.cmd lint:python`, `pnpm.cmd typecheck:python`.
- Reader: configured desktop Vitest with affected persistence/tracker/App
  selectors; `pnpm.cmd test:browser --% reader-reflow-restoration.smoke.spec.ts`
  with focused grep before correction and the affected journey union afterward.
  Current TypeScript formatting/lint/types run for changed owners/tests.
- New assertions never inherit old PASS. Reuse unaffected checks only with
  complete relevant owner/test/config/tool/dependency equivalence. If packaged
  source changes, run `pnpm.cmd package:windows:verified-core`,
  `pnpm.cmd package:windows:check`, `pnpm.cmd package:windows:lifecycle` using the
  already verified local Windows PowerShell environment and owned-data recovery.
- Final `pnpm.cmd check:evidence`, whitespace/local-link checks and closed
  status/SHA-256/filter-aware Git-blob identities bind independent review.

## Risks and rollback

An overly broad reader guard can block legitimate manual successors; require
actual PageDown/wheel movement, exact reopen and no-audio/ordinary-reading
controls. Locking only publication can leave stale aggregates; establish full
critical-section ownership and failure-safe release. Preserve existing evidence
on failure and reject uncertainty. Keep changes separable from the accepted base.

## Progress log

- 2026-11-16: authorized existing-change commit completed as `c407cfa`; clean
  intake confirmed. Reopened the two cases in this new plan without revising the
  prior completed plan or verdicts.
- 2026-11-16: the mounted native-decode completion after Stop replaced offset
  607 with 627 on unchanged save ownership, and same-byte reopen retained 627.
  No direct save/tracker injection or artificial scroll event was needed. The
  save guard now protects heard progress until validated deliberate movement.
  A discriminating unit control also prevented a new duplicate-locator manual
  gesture from keeping the guard locked after real movement.
- 2026-11-16: finite child processes reproduced overlapping successful
  corrections/submissions, aggregate races and cleanup of an active session.
  Per-session native ownership now rejects overlap and releases on process
  death. ADR-0077 records the retained empty sibling and sequential scope.
- 2026-11-16: current host checks passed 247 desktop tests, six browser journeys,
  62 quality/CPU-fallback tests and TypeScript/Python format, lint and types.
  Earlier fixture, runner and lint failures remain retained in the ledger.
- 2026-11-16: Windows build/integrity passed. The first lifecycle encountered a
  disappearing temporary WebView2 file during reparse inspection. An unchanged
  installer retry passed install, first start, repair, all six uninstall arms
  and cleanup; the existing data root was restored. Unrelated preexisting empty
  directories were preserved after an ownership guard rejected deletion.
- 2026-11-16: independent R01 requested a correction for opening an existing
  dangling link with a creating flag. Native-link fixture setup was blocked by
  Windows privilege error 1314, retained separately from product RED. The
  reviewer accepted a controlled link-resolution/real-target-I/O strategy.
  That discriminator reproduced target creation; exclusive first creation and
  noncreating existing-entry opening correct it. The renewed Python union passes
  66 cases, with two explicitly unavailable native-link cases skipped, plus all
  Python static checks. Desktop/package reuse requires fresh input proof.

## Discoveries and decisions

The original VF-0074 browser control takes its comparison value after Stop.
Binding a pre-Stop checkpoint distinguishes an earlier replacement from a later
resize. Source reachability and runtime incidence remain separate questions.
The precise prior human review omission remains unknown. Late layout that
changes geometry bypasses the unchanged-placement control; the earlier test
also called an unmarked passive save its manual successor. VF-0082 was not an
unnoticed supported-contract regression: earlier work intentionally preserved
sequential ownership. New authorization adds overlap rejection only.

All new assertions ran. Historical results are not imported for either changed
owner. Existing synthetic EPUB/PNG/PCM, benchmark fixtures and invalidation
controls were reused as inputs, not as previous PASS results. The final package
is renewed because the reader owner is embedded in its frontend.

## Final validation results

Current component checks and final package checks pass. VF-0074's original
delivery and restoration failure is reproduced and corrected; VF-0082's newly
authorized rejection preserves sequential success and crash recovery. These
scoped resolutions require the independent verdict below to be accepted.
The [execution ledger](../evidence/reader-stop-quality-follow-up/execution-ledger.md)
retains commands, attempts, scope and current results. The reserved
[R02 report](../evidence/reader-stop-quality-follow-up/review-r02.md) and
[closeout](../evidence/reader-stop-quality-follow-up/closeout-r02.md) govern final
acceptance; preparing the archival location is not itself approval.
