---
name: investigate-bug
description: Investigate and fix a reproducible VoxLeaf defect with a minimal regression-tested change. Use for crashes, incorrect EPUB handling, playback defects, stale audio, queue problems, local TTS failures, or performance regressions. Do not use for new feature design.
---

# Investigate a VoxLeaf bug

## Procedure

1. Read `AGENTS.md`, relevant documentation, and the
   [independent change review](../../../docs/development/agentic-change-review.md)
   workflow for its applicability, request, and report contract.
2. Reconcile the candidate with the
   [findings workflow and registry](../../../docs/development/findings/README.md).
   Record the checkout and relevant dirty inputs; reuse the ID for the same
   trigger/invariant/owner or link a distinct variant. Check original decisions
   against current code. For static-only discovery use `audit-logic`; do not run
   tests or edit merely because this skill describes a fixing workflow.
3. Reproduce the problem with the smallest safe input and record expected versus
   actual behavior, distinguishing real interaction from injected/model ordering.
4. Identify the failing boundary, cause, and why prior coverage missed it when
   known. Select bounded neighboring cases/callers and protections to preserve.
5. Add a discriminating regression that fails for the correct reason on the
   original implementation where applicable. Observe the actual outcome and
   relevant next action/retry/reopen, then preserve the same assertion for GREEN.
6. Implement the smallest justified fix.
7. Run focused tests, then broader relevant checks.
8. Review privacy, cancellation, and bounded-resource effects.
9. Update documentation if public behavior or operational guidance changed, and
   maintain the affected finding's history/evidence within the authorized fix.
   Keep historical resolution separate from the assessment on tested inputs.
10. For behavioral or cross-component fixes, delegate to `change_reviewer` with
    the reproduction, expected behavior, complete diff, code identities, and
    exact host-check evidence. Pause writing during review. Resolve findings,
    rerun affected checks, and obtain APPROVE for the current patch. Missing
    evidence or an unavailable reviewer is BLOCKED. Record an exemption only
    for the nonbehavioral cases defined by the review workflow.

## Diagnostic rules

- Do not log book contents to debug a failure.
- Prefer synthetic EPUB fixtures.
- Distinguish model latency from queue, transport, and playback latency.
- Attach work to a reading-session identifier when investigating stale audio.
- Measure before optimizing.
- Do not hide an underrun by silently increasing buffers without documenting the tradeoff.
- Do not weaken EPUB validation to make one malformed file pass.

## Completion report

Report:

- Reproduction.
- Stable finding IDs, prior-case reconciliation and relevant adjacent controls.
- Root cause.
- Regression test.
- Fix.
- Commands and results.
- Independent Change Review ID/verdict and resolved findings, or exemption reason.
- Remaining uncertainty.
