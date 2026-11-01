# VUC-20261101 execution ledger

Base and current HEAD: `353d0bf5534b428e716f228795fc84e63e7158d9`.
Branch: `codex/visible-locator-unicode-compound-plan`. Initial worktree/index clean.
Implementation and verification authorized; no Git mutation/publication authorized.

Local raw evidence: `tmp/evidence/visible-locator-unicode-compound-corrections/run-01/`.
Commands and invariants are defined in the [ExecPlan](../../completed/visible-locator-unicode-compound-corrections.md).
No historical runtime PASS is reused. Existing synthetic fixtures and collectors
are inputs to new runs. Prepared payloads require current integrity proof.

| Gate | Classification | Status |
| --- | --- | --- |
| G0 package exports | EJECUTAR | PASS before red and after normalizer change; configured browser hooks retained |
| G1 numeric red | EJECUTAR | Expected failure, unchanged production: 16 fail / 3 pass |
| G2 browser red | EJECUTAR | Expected start-range failure after one retained viewport/precondition failure |
| G3 three EPUB suites | EJECUTAR | PASS 232/232 |
| G4 three reader/persistence suites | EJECUTAR | PASS 50/50 |
| G5 four Chromium cases | EJECUTAR | PASS 4/4; renewed receipt binds generated renderer bytes |
| G6 format/lint/two type checks | EJECUTAR separately | PASS; initial desktop fixture type failure retained |
| G7 existing core integrity/current desktop build | EJECUTAR | PASS; one executable build, no installer |
| Existing core/voice payloads and installed tools | REUTILIZAR CON PRUEBA | Current core integrity and staged 2,023-file manifest verified; VUC-R1 approval |
| G8 single Piper EN native arm and cleanup | EJECUTAR | PASS; G8-Piper / G8-resource-cycle exit 0, restoration verified |
| G9 evidence/diff/links and independent review | EJECUTAR | Document checks PASS; VUC-R1 APPROVE; final archival assessment linked below |
| Full matrices, root aggregates, Rust/Python tests, DSP/rates, other models/languages, installer | NO APLICA | Responsibilities unchanged by allowlist |

M0 reconfirms both residual branches in current code. Visible start state is
separate from audible checkpoint persistence. Numeric context changes only at
the existing bounded separator checks; accepted grammar and frozen profiles stay
unchanged. Architecture/M005 ownership remains unchanged.

Independent acceptance VUC-R1 approves; native cleanup is verified. Every failed
receipt remains retained separately.

## Original reproduction receipts

- `G0-preedit`: package build exit 0. Current installed inputs captured before
  tests (24,009 entries); no historical PASS reused.
- `G1-red`: exit 1, 19 selected tests: 16 intended preservation failures and
  three passing letter/punctuation controls. Both current production files
  remain unchanged. Raw source, exports and installed-input receipt retained.
- `G2-red`: exit 1 before the discriminating assertion. The 640x480 viewport
  did not expose B while paused; screenshot after Stop exposes it. This is a
  fixture/precondition failure, not reproduction evidence. Preserve the original
  log, trace and screenshot under `G2-red-browser/`. One infrastructure retry
  uses the default 1280x720 PSC-03 viewport and drains frames after Pause, matching
  that existing control. No production edit or weakened final assertion.
- `G2-red-retry`: exit 1 at the intended first prepared source range: anchor 25
  instead of anchor 0. B sampling/preview, Resume visibility, unchanged context,
  heard persistence and final zero-context cleanup assertions passed. This is
  the discriminating product failure, preserved with its original artifacts.
  No further pre-edit repetition is needed. M0-M1 complete.

## Commands and bounded renewals

All commands below ran at the repository root in normal local PowerShell outside
the managed sandbox. Node 24.20.0, pnpm 11.15.1; installed libraries and Chromium
were captured before tests. No dependency or browser download/update occurred.

| Receipt | Exact command | Result |
| --- | --- | --- |
| G0-preedit, G0-current | `pnpm.cmd build:packages` | exit 0; preparation only |
| G1-red | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts -t VUC-02` | exit 1, intended failures described above |
| G2-red, G2-red-retry | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts --grep VUC-01` | exit 1; distinct fixture and intended product failures |
| G3-epub | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/narration/narration-normalizer.test.ts src/integration/narration-preparation-matrix.test.ts src/narration/narration-resource-bounds.test.ts` | exit 0, 232 tests, 43.76 s runner duration |
| G4-reader | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/reader/ReaderPublication.test.tsx src/reader/segment-highlight-controller.test.tsx src/persistence/narration-position-save-bridge.test.ts` | exit 0, 50 tests |
| G5-browser-artifact-bound | `pnpm.cmd --% test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep "VUC-01\|RAC-07\|PSC-03\|R7-04"` | exit 0, exactly 4 tests |
| G6-format-r2 | `pnpm.cmd format:check:typescript` | exit 0 |
| G6-lint-r2 | `pnpm.cmd lint:typescript` | exit 0 |
| G6-epub-types | `pnpm.cmd --filter @voxleaf/epub typecheck` | exit 0 |
| G6-desktop-types-r2 | `pnpm.cmd --filter @voxleaf/desktop typecheck` | exit 0 |
| G7-core-bound | `pnpm.cmd package:piper-core:check` | exit 0, existing core current |
| G7-build | `pnpm.cmd build:desktop` | exit 0, current executable built once |
| G8-Piper | `node apps/desktop/scripts/native-startup-smoke.mjs --adaptive-tts-exact-host --tts-profile=piper-1-4-2-onnx-cpu-en-us-joe-medium-v1 --tts-language=en` | exit 0 |

The Markdown table escapes regex pipes for rendering; the actual receipt and
ExecPlan contain the unescaped command. Scoped Prettier write (`P-format`)
formatted only the five allowlisted TS/TSX files before final validation.

- `G6-desktop-types` originally failed TS2353: the synthetic preparation
  record's type lacked the newly recorded `sourceRange`. Added that type in the
  same allowlisted fixture; renewed format/lint/desktop types only. No production
  or EPUB suite input changed, and G5 ran after this correction.
- `G5-browser` passed, but its initial capture omitted generated renderer bytes.
  Preserve it as an incomplete receipt; `G5-browser-artifact-bound` renews exactly
  the same four cases with output membership/hashes captured at execution. This
  is evidence correction, not a matrix expansion or retrospective identity.
- `G7-core` passed, but did not capture the uv executable bytes. The current
  native readiness record now binds uv and the other tools; `G7-core-bound`
  renews integrity only. No payload/model regeneration or second executable build.

## Native preparation

Driver 156.0.4314.50 matches WebView2 156.0.4314.58's major version. The readiness
record retains tool bytes, complete WebView file membership/hashes, writable
scratch, available disk and pre-existing process/scratch inventories locally.
The current executable SHA-256 is
`69fb556d2ddeb9b2b0f72d1fb026b779df31196e53c7a52755928e06d340ea5a`.
The resource wrapper reuses the previously inspected preservation procedure with
a task-specific backup and only the requested Piper EN arm. The versioned runner
and assertions are unchanged. Full original resource membership/hashes precede
staging; restoration runs in `finally`. Existing roots/processes remain owned by
their original tasks. No installer, model-free native arm or six-rate exercise.

## Evidence retention and remaining acceptance

No historical runtime PASS supplies acceptance. Current-task passing receipts
may survive only documentation changes or demonstrably unrelated fixture typing,
subject to the independent input/environment comparison. The entire installed
dependency/browser snapshot, receipt input lists, exports and artifact manifests
remain local and recoverable. No personal inventories or raw logs enter tracked
documentation. Native cleanup and independent review are recorded below.

## Completed native cleanup and environment proof

G8 completed one current Piper EN arm: quick command-to-audible 5,609 ms,
prepared 6,363 ms, zero underruns during the 60,185-ms quick observation,
cancellation 793 ms, 17 segment transitions and no stale playback. These are
observations on this host, not general timing guarantees or new model benchmarks.
The runner retained all existing synchronization, preparation, cancellation and
cleanup assertions; it did not execute its optional six-rate matrix.

Cleanup reports zero retained/discarded units, zero generated-audio files, all
six created audio contexts closed and zero external requests. The wrapper's
before/after process identity comparison (PID, creation time, executable) and
scratch membership show no newly retained processes or roots. The original
adjacent resource tree's complete file membership/hashes match after restoration;
the task backup is absent. Pre-existing roots are preserved. The executable
hash is unchanged across native execution. Resource journal and before/after
records remain local under the reused wrapper's `G6-resource*` filenames.

`Environment-after` passes the strict installed-input comparison: all 24,009
entries, roots, relevant environment and cache exclusions match the original
capture. No exception or output-delta waiver is needed. Current-task runtime
evidence was approved by VUC-R1; no historical behavioral PASS is used.

## Current evidence comparison and documentation

`Evidence-comparison` verifies original receipt/input digests and records every
changed captured path rather than hiding broad snapshot differences. G3, G4 and
EPUB types predate only the browser fixture's type annotation plus documentation
and local receipt-capture changes; those suites do not import the browser test.
The renewed static/browser gates use the final five TS/TSX files. Later wrapper
edits capture artifact/native identities without changing the recorded test
command; native scripts are not browser/static/package inputs. No production,
test, configuration, lock or installed dependency consumed by a retained gate
has changed. VUC-R1 independently confirmed this attribution.

Native tool hashes, full WebView membership and renderer/package artifact hashes
also match current bytes. The native build's renderer matches the captured
Chromium renderer. Prepared package reuse is integrity-checked artifact reuse,
not reuse of a historical behavioral result.

G9 runs `pnpm.cmd check:evidence`, `git diff --check` and local Markdown-link
inspection: exit 0, 82 relative file links resolve before the final ledger update.
The current ledger/plan update receives a renewed documentation receipt before
review. The canonical system diagram and M005 remain accurate: no process,
component, contract, accepted grammar or persistence-owner boundary changed.

## Independent acceptance and archival

[VUC-R1-20261101](review-reports.md) approves without findings after comparing
418 path identities, 124 receipt digests, source membership, generated artifacts,
installed inputs, native cleanup and exact current evidence. Its original report,
closed manifest and diff remain immutable locally. The original capture wrapper
was recovered against its already-recorded hash; its exact bytes are retained as
`run-gate-original-6a1a.ps1`, without replacing any original receipt identity.

The plan was archived after implementation approval. Subsequent changes are
limited to documentation, links and report retention. Final archival document
receipts and the new immutable assessment are recorded in
[review reports](review-reports.md); unchanged runtime receipts remain bound to
their original inputs. No commit, push, PR, merge or publication occurred.
