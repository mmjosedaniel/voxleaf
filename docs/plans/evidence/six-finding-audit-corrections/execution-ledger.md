# Six-finding corrections: execution ledger

## Scope and environment

User-authorized implementation of SFA-01–SFA-06 on
`codex/six-finding-audit-corrections`, base and unchanged HEAD
`200144dd29709536b189cb593fe53e927a991dc4`. Entry was clean with an empty index;
there is no pre-existing user work in the patch. No commit, push, PR, merge,
installation or tool/dependency update is authorized or performed.

The seven production owners listed in the plan are the complete production
scope. Tests extend existing files; current documentation explains the corrected
behavior. Shared contracts, Rust/Python, manifests, lockfiles, frozen authorities,
completed M005, reader geometry and PCM algorithms retain their bytes.

Every test, build, static and documentary check below ran in local PowerShell
7.6.5 outside the managed sandbox. Existing Node 24.20.0 satisfies declared
engines; `.nvmrc`/CI remains pinned to 24.18.0. Existing Corepack selects exact
pnpm 11.15.1 with `COREPACK_ENABLE_NETWORK=0`; `UV_OFFLINE=1` prevents acquisition.
G7 also sets `CARGO_NET_OFFLINE=true`. Rust/Cargo 1.97.1, uv 0.11.29 and matching
WebView2/EdgeDriver 156.0.4314.50 are retained. No fresh install is assumed.

Raw receipts live in ignored `tmp/evidence/six-finding-audit-corrections/`.
Each gate has its exact command, exit status, timestamps, before/after source
and generated-input hashes, and log. Review manifests add closed path status,
SHA-256 and filter-aware Git blobs. Raw artifacts and local host paths are not
committed. The source identities in the independent report bind these results.

## Corrections and regression evidence

| Finding | Correction | Evidence |
| --- | --- | --- |
| SFA-01 | Replace the last retained immutable segment's boundary on consuming a recognized silent scene in existing lookahead. | Both ornaments, repeated/leading/trailing scenes, one/many batches, a 4,200-code-point silent source window, cold continuation, quote/list exclusions and immutable ranges. Real public preparation through coordinator/player measures 1,200 ms; ellipsis stays 900 ms, with no initial/final delay. |
| SFA-02 | Unicode letter/mark lexical protection, with the Spanish dehyphenation predicate unchanged. | Left/right Latin, non-Latin and astral adjacency; standalone expansion; public Piper/Chatterbox one/many exact ranges; retained MAF-08/code/language controls. |
| SFA-03 | Render four storage measurements from the snapshot and use current-package wording. | Mounted synthetic sizes different from v7; exact bytes/GB/GiB, historical v2 caveat, explicit consent and existing compatibility controls. |
| SFA-04 | Add seven inert tags to the existing block-boundary set. | Minified/whitespace forms, formatting/language, nested paragraphs, hidden/empty cells, public order/ranges/fragment targets, exact/over-limit projector budgets and real browser rendering/synthesis order. |
| SFA-05 | Separate loaded whole-second formatting from rounded approximate wait formatting. | Both detailed and compact labels immediately below/at/above 60/120 seconds, including 61 seconds; unchanged targets, ETA and start ownership. |
| SFA-06 | Separate user-action generation from snapshot ordering; terminal action publication invalidates pending older polls. | Controlled success/failure after confirming polls, stale poll after terminal publication, newer select/cancel/remove, refresh deduplication and mounted failure/teardown with fake timers. |

The optional client is App-scoped and has no disposal API. Settings teardown
releases its subscription and polling timer; tests cover that existing lifecycle,
including a pending download settled after unmount. A valid current App-scoped
action can still finish after Settings closes. Newer actions suppress obsolete
publication. No invented client-disposal contract or App change is introduced.

The public opener has no stricter-budget option. The existing projector seam
proves exact four-block admission and three-block rejection without partial
projection; the public opener separately proves canonical ranges and targets.
The normalization policy preserves standalone 10/20 in these fixtures, so their
assertions require separate unchanged values, not an unrelated numeric rewrite.

## Commands and outcomes

All paths below are relative to the repository root. The exact G4/G5 file lists
are retained in the ExecPlan and the corresponding immutable receipt commands.

| Gate / receipt | Command | Outcome |
| --- | --- | --- |
| G0-host | Version/tool inspection; `pnpm.cmd package:piper-core:check` | PASS; existing core is current, no regeneration. |
| G1-baseline / G1-consolidated / G1-final | `pnpm.cmd build:packages` | PASS before regressions, after production changes, and after formatting changed build inputs. |
| G2-epub-red | G4 explicit six-file command with `-t SFA-` | 12 intended failures, one standalone-number control passed. |
| G2-desktop-red | G5 explicit five-file command with `-t SFA-` | 18 failures / five passes; two fixture problems identified separately below. |
| G2-desktop-fixture-red | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/AdaptivePreparationControls.test.tsx -t SFA-` | Five intended rounding failures / two exact-minute controls passed. |
| G2-scene-fixture-red | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/product-narration-coordinator.test.ts -t SFA-01` | 600 instead of 1,200 ms; ellipsis control passed. |
| G3-static | `pnpm.cmd format:check:typescript`; `pnpm.cmd lint:typescript`; `pnpm.cmd --filter @voxleaf/epub typecheck` | Format/lint PASS; EPUB types identified a test-only invalid budget option. Stopped before desktop types. |
| G3-types-repair | Scoped Prettier/ESLint; `pnpm.cmd --filter @voxleaf/epub typecheck`; `pnpm.cmd --filter @voxleaf/desktop typecheck` | EPUB PASS; desktop rejected test-only `Promise.withResolvers` outside configured ES libs. |
| G3-desktop-final | Scoped Prettier/ESLint; `pnpm.cmd --filter @voxleaf/desktop typecheck` | PASS after using the existing promise-constructor pattern. |
| G3-final-fixtures | Scoped Prettier/ESLint on projector/matrix/browser tests; both package typecheck commands | PASS for final test bytes. Other static inputs retain G3-static/G3-desktop-final coverage. |
| G4-epub | Selected six-file EPUB Vitest command | Five files and 241 tests passed; one new matrix expectation failed. |
| G4-matrix-final | `pnpm.cmd --filter @voxleaf/epub exec vitest run src/integration/narration-preparation-matrix.test.ts` | All 18 matrix tests PASS; together with the five unchanged G4 files, all 242 selected EPUB tests pass. |
| G5-desktop | Selected five-file desktop Vitest command | All 186 tests PASS. |
| G5R-playback | `pnpm.cmd --filter @voxleaf/desktop exec vitest run src/tts/playback-transition-policy.test.ts src/tts/pcm-playback.test.ts` | 40 tests PASS. Fresh execution, no historical result reuse. |
| G6-browser | `pnpm.cmd test:browser reader-narration-bugfixes.smoke.spec.ts reader-reflow-restoration.smoke.spec.ts --grep "SFA-EPUB\|preserves one canonical passage"` | Both scenarios PASS; configured package/frontend hooks retained. |
| G7-native | `pnpm.cmd test:native-startup` through the capture/cleanup wrapper with the verified existing driver | PASS; one native build with frontend hook, followed by the model-free smoke. |
| G8-guard-tests | `pnpm.cmd test:evidence` | 31 isolated tests PASS; fresh execution. |
| G0-final-identities | Tool/artifact hash and cleanup inspection | Exact receipt supplies tool/core/driver/native identities and preview-listener/index checks. |

Final G8 runs `pnpm.cmd check:evidence`, `git diff --check` and the local-link
checker before review and again after archival/report changes. The isolated
guard tests do not replace this current-document inspection.

The original coordinator fixture used a synthetic book identity inconsistent
with the real prepared ranges; it now injects the actual publication. The ETA
fixture used a nonexistent property; its repaired red run isolates rounding.
The first consolidated matrix expected 10/20 to expand; only that fixture and
its browser counterpart changed. An intervening UTF-8 edit script failed before
writing and the matrix was inadvertently repeated unchanged; retain
G4-matrix-repair as failed evidence, not an additional product defect. A scoped
format attempt also failed before the subsequent targeted formatting correction.
No assertion was disabled, no retry policy widened, and no production code was
changed after G1-final. Each failure and diagnosis remains in its original log.

## Evidence reuse and exclusions

- **Historical test results: none reused.** MAF-R1 and MAF-CI-R1, original
  `CI-Desktop-01` and `F-Docs-01` receipts were inspected. Their runtime/discovery
  snapshots do not provide complete gate-time installed worker/dependency and
  environment proof for this execution. Only G5R and the 31-test guard fallback
  were run; historical aggregate PASSes do not validate this patch.
- **Current-task result retention:** G4's five unchanged files remain valid
  after changes only to the separately isolated matrix test and browser fixture.
  Vitest discovery/configuration, production and transitive inputs, exports,
  fixtures, lockfiles and tools remain unchanged. G4-matrix-final renews its
  complete file. G5/G5R retain exact runtime/test bytes after only unrelated
  browser and Markdown edits. Review gate comparisons expose all differences;
  the independent reviewer must assess those boundaries.
- **Artifact reuse:** G0 revalidates the current core with the configured
  checker. EdgeDriver equals the original MAF artifact: SHA-256
  `dd728c934e491abe7e8a07fa366aad135ea15d934cbba99192ad872da59c39d3`,
  23,956,864 bytes, matching WebView2 156.0.4314.50. Compiler/dependency caches
  are ordinary build inputs, not test results. No model is loaded or reacquired.
- **New native artifact:** SHA-256
  `b28b2923a22c22153187041b1a18260832ddee60f73a8bcb75e0b2fe19a3478c`.
  The old executable cannot establish frontend acceptance and was not reused
  as a runtime PASS. The existing bundle-size warning remains non-blocking.
- **Out of scope:** Rust/Python/shared and unrelated Node suites, aggregate
  `check`/`check:portable`, full browser/desktop suites, real-model listening,
  GPU/speed sweeps, acquisition/firewall/installer and clean-Windows campaigns.
  No new performance/support/quality claim. Traversal complexity and the reader
  renderer, batching, geometry and restoration algorithms are unchanged.

## Cleanup and independent review

G7 recorded no pre-existing matching processes and preserved both pre-existing
scratch roots. After the smoke, no new matching process or scratch root remains;
the native runner reports no errors and zero external requests. G6 exercises
audio-context closure; the final identity check verifies no preview listener.
No personal installation, firewall or model state was modified.

Independent `change_reviewer` issued **APPROVE** in
[SFA-R1-20261029](review-R1.md), without findings. Its full source/receipt recheck
passed; it accepted current-task result retention and the documented budget and
lifecycle boundaries. The director's separate R1 identity recheck also passed
before archival. R1 is saved unchanged.

The [completed ExecPlan](../../completed/six-finding-audit-corrections.md) and
indexes now carry the accepted implementation. The final archived patch receives
its distinct [SFA-R2-20261029 assessment](review-R2.md), whose report records the
actual final verdict. Only documentary inputs change; runtime evidence remains
bound to the unchanged source/tests/exports/tools. Renew G8 for these documents.
Saving each report is excluded from its own manifest. No Git mutation is
performed or authorized by either review.
