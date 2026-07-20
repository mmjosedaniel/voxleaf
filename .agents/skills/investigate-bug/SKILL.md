---
name: investigate-bug
description: Investigate and fix a reproducible VoxLeaf defect with a minimal regression-tested change. Use for crashes, incorrect EPUB handling, playback defects, stale audio, queue problems, local TTS failures, or performance regressions. Do not use for new feature design.
---

# Investigate a VoxLeaf bug

## Procedure

1. Read `AGENTS.md` and relevant documentation.
2. Reproduce the problem with the smallest safe input.
3. Record expected and actual behavior.
4. Identify the failing boundary and root cause.
5. Add a regression test that fails for the correct reason.
6. Implement the smallest justified fix.
7. Run focused tests, then broader relevant checks.
8. Review privacy, cancellation, and bounded-resource effects.
9. Update documentation if public behavior or operational guidance changed.

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
- Root cause.
- Regression test.
- Fix.
- Commands and results.
- Remaining uncertainty.
