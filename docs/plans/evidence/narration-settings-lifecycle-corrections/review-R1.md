# Change Review Report

Review ID: **NSL-R1-20261102**  
Task ID: **NSL-01–04**  
Verdict: **APPROVE**

Base commit and reviewed HEAD: `bfbf391d7a13e1ee6b3f704051a6596359ce5deb`  
Branch: `codex/narration-settings-lifecycle-corrections-plan`

## Reviewed paths and identities

Evidence root: `tmp/evidence/narration-settings-lifecycle-corrections/20261102-01/`.

The closed scope comprises all 47 entries in `R1-identities.json`, including all 18 changed/new paths, plus the two unchanged supporting documents below.

| Artifact | SHA-256 |
|---|---|
| `R1-identities.json` | `9a929ab56263bde67b394bd4734ddfe6f0c6dd5e30dbc08f2242c3374fba92dc` |
| `R1-diff.patch` | `66c9ffb47b7b6eeb90a5e1571963837e4ca2ce132bd1394635ffa438e669a0c2` |
| `R1-new-files.json` | `10e26ab146b3da149bad300fb3d2dcebd38bc1b08978c6df7bb217b45f841c46` |
| `R1-evidence-comparison.json` | `0cf040235a1f73e8ea9c297c15b28e03fbab2a64b70e176b785c897c11a0247a` |

Supporting-document supplement:

| Path | Status | SHA-256 | Filter-aware blob |
|---|---|---|---|
| `docs/README.md` | UNCHANGED | `b0b66ff67e2e042ee77c0dccf30201fe6e4299f9f1d8b77803e709273a4a5f8d` | `16a4024add3ab75fa9d4eb0586bebc037791a593` |
| `.agents/skills/orchestrate-safe-refactor/references/refactor-contracts.md` | UNCHANGED | `a5f2d805063ba8536cc046b361ea5bda732f55d9166afe137b08bc01175f49ae` | `16ba1a7002366ad9312223d51dace7902d6ae751` |

**Identity recheck: PASS.** Before/after identities match; HEAD and branch are unchanged; the index is empty. The actual changed-path set matches the manifest. The supplied tracked diff matches current Git output, and the new-file artifact matches the full execution-ledger content. Final manifest recheck completed at `2026-11-02T16:09:11Z`.

## Acceptance review

- **NSL-01:** False and thrown activation results produce fixed retry guidance without exposing exception details. Retry clears obsolete feedback. Known persistence/admission restrictions are checked before teardown and again after native selection. Healthy loaded Chatterbox reselection retains its fast path.
- **NSL-02:** Committed narrator-lifetime changes invalidate the existing selection-operation guard, including absent-to-created ownership for the same publication. The packaged `DEV=false` regression and production-browser journey cover stale rejection and successful explicit retry. Existing guarded, reversible profile persistence remains intact.
- **NSL-03:** Startup changes join outstanding Stop/recovery containment before persistence and recheck eligibility afterward. Tests cover Prepared-120000 to Quick and Prepared-60000, failed cleanup, and closure; assertions inspect both stored and observable choices. The scheduler/projection invariant remains unchanged.
- **NSL-04:** Pending ownership survives Settings child unmount. App owns reset settlement and disables conflicting compact-speed edits. Tests cover both overwrite triggers, reopening, later successful edits, and an older completion leaving newer pending ownership intact.
- Preserved controls cover ordinary Stop speed changes, partial reset, healthy-loaded reselection, stale publication selection, and natural completion. The patch introduces no autoplay, protocol/schema/dependency change, content logging, audio persistence, scheduler-limit change, or architecture-topology change.

Existing assertions were not weakened to conceal failures.

## Test evidence reviewed

These are implementer-supplied results from normal local PowerShell outside the managed sandbox; I did not execute tests, builds, formatters, or validators.

| Receipt | Command/result |
|---|---|
| `G0-exports` | `pnpm.cmd build:packages` — exit 0 |
| `G1-red` | Directed eight-suite Vitest command with `-t NSL-` — retained failures reproduce NSL-01–03; NSL-04 setup failures are distinguished |
| `G1-reset-fixture-corrected` | Same command with `-t NSL-04` — three intended failures, including both preference overwrites |
| `G2-desktop-current` | Exact eight-suite Vitest command recorded in the ledger — **8 suites, 407 tests passed**, exit 0 |
| `G3-format-current` | `pnpm.cmd format:check:typescript` — exit 0 |
| `G3-lint-current` | `pnpm.cmd lint:typescript` — exit 0 |
| `G3-types-current` | `pnpm.cmd --filter @voxleaf/desktop typecheck` — exit 0 |
| `G4-browser-eligibility` | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep '"NSL-|SPM-01/02|MAF-11 completed Prepared 120000|SAF-09"'` — **6 passed**, retries 0 |
| `G5-core-check` | `pnpm.cmd package:piper-core:check` — exit 0 |
| `G6-build` | `pnpm.cmd build:desktop` — exit 0 |
| `G7-Piper` | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` — exit 0 |
| `G8-evidence-R1` / `G8-diff-R1` | `pnpm.cmd check:evidence` / `git diff --check` — exit 0 |

Original receipt/input hashes match. Independent comparison against current files confirms the declared Markdown-only differences after renderer gates. G5 additionally predates changes to two desktop files outside its core-checker responsibility. G8 inputs match current files without drift.

The supplied artifact proof records identical 2,024-file Piper payloads and 26 source/runtime identities; it does not reuse a historical checker PASS. Installed inventories report 24,009 matching entries. Original native-resource manifests have identical hashes, and restoration evidence records no new owned process/scratch residue.

G6/G7 bind executable SHA-256 `b44fbc249b39d50cae7e7a3f06f1d899f689f1f5aff5eda9e2fea57f10650845`. The Piper arm reports zero stale playback, external requests, generated audio files, and retained/discarded units after cleanup. Earlier failed attempts remain retained.

**Findings:** none.

**Remaining uncertainty:** No acceptance-blocking uncertainty within this scope. Native coverage is one Piper English arm; Chatterbox ownership races use controlled native completion. This report does not establish fresh Chatterbox GPU, full portfolio, performance-certification, installer, or CI results.

**Required next action:** No implementation correction required. Recording this report and archiving/updating the plan changes reviewed documentation and therefore requires a subsequent immutable exact-patch assessment. This approval is neither a Validation Report nor authorization to commit, push, create a PR, merge, or publish.
